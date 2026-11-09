from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import delete, exists, func, insert, or_, select

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .embeddings import EmbeddingError, OllamaEmbedder
from .index_progress import IndexProgress
from .index_versions import (
    activate_version,
    active_version,
    capture_source_snapshot,
    create_version,
    discard_version,
    ensure_legacy_version,
    find_resumable_version,
    get_version,
    list_versions,
    mark_version_failed,
    recipe_version,
    rollback_version,
    update_version_progress,
    validate_version,
)
from .models import JudgmentDocument, JudgmentVectorIndex
from .observability import record_performance
from .processing_state import ProcessingStateStore, parent_run_id
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

_COLUMNS = (
    JudgmentDocument.id,
    JudgmentDocument.jid,
    JudgmentDocument.court_normalized,
    JudgmentDocument.title,
    JudgmentDocument.jdate,
    JudgmentDocument.matched_laws,
    JudgmentDocument.source_archive,
    JudgmentDocument.citation_count,
    JudgmentDocument.full_text,
    JudgmentDocument.full_text_length,
    JudgmentDocument.content_hash,
    JudgmentDocument.pdf_url,
    JudgmentDocument.updated_at,
)


def vector_point_id(jid: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"judgment:{jid}"))


def _hash_text(value: str) -> str:
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()


def _payload_hash(payload: Dict[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()


def _source_year(jdate: Any) -> str:
    text = str(jdate or "").strip()
    return text[:4] if text[:4].isdigit() else ""


def _collapse_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip()


def build_index_text(
    *,
    court: str,
    title: str,
    jdate: str,
    matched_laws: Optional[Sequence[str]],
    full_text: str,
    max_chars: int = 1600,
) -> str:
    """Build the text embedded for one judgment.

    The head of a judgment contains the court, case number and parties; the tail
    often contains the disposition. For a bounded document-level vector we keep
    a head/tail window instead of paying to embed every full text.
    """

    limit = max(200, int(max_chars))
    laws = "、".join(str(value) for value in (matched_laws or [])[:8])
    prefix = " ".join(
        value
        for value in (
            _collapse_whitespace(court),
            _collapse_whitespace(jdate),
            _collapse_whitespace(title),
            f"命中法規：{laws}" if laws else "",
        )
        if value
    )
    body = _collapse_whitespace(full_text)
    budget = max(80, limit - len(prefix) - 1)
    if len(body) > budget:
        head = int(budget * 0.72)
        tail = budget - head
        body = f"{body[:head]} … {body[-tail:]}" if tail else body[:head]
    return f"{prefix}\n{body}".strip()[: limit + 40]


def index_coverage(
    session_factory,
    *,
    collection: str,
    model: str,
    version_id: Optional[int] = None,
) -> Dict[str, Any]:
    index_filters = [
        JudgmentVectorIndex.collection == collection,
        JudgmentVectorIndex.model == model,
    ]
    if version_id is not None:
        index_filters.append(
            JudgmentVectorIndex.version_id == int(version_id)
        )
    with session_factory() as session:
        total = int(session.scalar(select(func.count()).select_from(JudgmentDocument)) or 0)
        indexed = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(*index_filters)
            )
            or 0
        )
        latest = session.scalar(
            select(func.max(JudgmentVectorIndex.indexed_at)).where(
                *index_filters
            )
        )
    return {
        "total_judgments": total,
        "indexed_judgments": indexed,
        "remaining_judgments": max(0, total - indexed),
        "collection": collection,
        "model": model,
        "version_id": version_id,
        "latest_indexed_at": latest.isoformat() if latest else None,
    }


def _candidate_statement(
    *,
    collection: str,
    model: str,
    version_id: Optional[int],
    all_rows: bool,
    since: Optional[str],
    jid: Optional[str],
    stride: int,
    last_id: int,
    batch_size: int,
):
    index_join = JudgmentVectorIndex.jid == JudgmentDocument.jid
    if version_id is not None:
        index_join = index_join & (
            JudgmentVectorIndex.version_id == int(version_id)
        )
    statement = (
        select(*_COLUMNS)
        .outerjoin(
            JudgmentVectorIndex,
            index_join,
        )
        .where(JudgmentDocument.id > last_id, JudgmentDocument.full_text != "")
    )
    if stride > 1:
        statement = statement.where(JudgmentDocument.id % stride == 0)
    if not all_rows:
        statement = statement.where(
            or_(
                JudgmentVectorIndex.jid.is_(None),
                JudgmentVectorIndex.content_hash != JudgmentDocument.content_hash,
                JudgmentVectorIndex.collection != collection,
                JudgmentVectorIndex.model != model,
            )
        )
    if since:
        statement = statement.where(JudgmentDocument.jdate >= since)
    if jid:
        statement = statement.where(JudgmentDocument.jid == jid)
    return statement.order_by(JudgmentDocument.id).limit(batch_size)


def _batch_stats(durations: Sequence[float]) -> Dict[str, Any]:
    if not durations:
        return {
            "batch_count": 0,
            "batch_avg_ms": 0.0,
            "batch_min_ms": 0.0,
            "batch_max_ms": 0.0,
            "batch_p50_ms": 0.0,
        }
    ordered = sorted(float(value) for value in durations)
    return {
        "batch_count": len(ordered),
        "batch_avg_ms": round(sum(ordered) / len(ordered), 2),
        "batch_min_ms": round(ordered[0], 2),
        "batch_max_ms": round(ordered[-1], 2),
        "batch_p50_ms": round(ordered[len(ordered) // 2], 2),
    }


def _downsample_progress(
    samples: Sequence[Dict[str, Any]], limit: int = 240
) -> List[Dict[str, Any]]:
    """Keep the progress series bounded for the performance report JSON."""
    values = list(samples)
    if len(values) <= limit:
        return values
    stride = len(values) / float(limit)
    picked = [values[min(len(values) - 1, int(index * stride))] for index in range(limit)]
    picked[-1] = values[-1]
    return picked


def index_judgments(
    *,
    session_factory,
    settings: Settings,
    store: Optional[QdrantStore] = None,
    embedder: Optional[OllamaEmbedder] = None,
    limit: Optional[int] = None,
    all_rows: bool = False,
    since: Optional[str] = None,
    jid: Optional[str] = None,
    stride: int = 1,
    batch_size: int = 16,
    max_chars: Optional[int] = None,
    recreate: bool = False,
    dry_run: bool = False,
    run_label: str = "",
    track_state: bool = False,
    state_parent_run_id: str = "",
) -> Dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    collection = settings.judgment_vector_collection
    model = settings.embedding_model
    batch_size = max(1, int(batch_size))
    stride = max(1, int(stride))
    max_chars = int(max_chars or settings.judgment_index_max_chars)
    version_id = (
        ensure_legacy_version(
            session_factory, settings=settings, collection=collection
        )
        if not dry_run
        else None
    )
    store = store or QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=60.0,
    )
    embedder = embedder or OllamaEmbedder(
        settings.embedding_url,
        model,
        timeout=settings.embedding_timeout_seconds,
    )
    scan_all = bool(all_rows or recreate)

    scanned = 0
    indexed = 0
    points = 0
    dimensions = 0
    last_id = 0
    sample_lengths: List[int] = []
    batch_durations: List[float] = []
    embedding_durations: List[float] = []
    qdrant_durations: List[float] = []
    db_durations: List[float] = []
    progress_samples: List[Dict[str, Any]] = []
    last_progress_at = 0.0

    if not dry_run and not store.configured:
        raise QdrantError("QDRANT_URL 未設定")
    if not dry_run and not embedder.configured:
        raise EmbeddingError("EMBEDDING_URL 未設定")

    state: Optional[ProcessingStateStore] = None
    state_run_id: Optional[str] = None
    state_total: Optional[int] = None
    state_last_write = 0.0
    if track_state and not dry_run:
        try:
            baseline = index_coverage(
                session_factory, collection=collection, model=model
            )
            base_total = int(
                baseline.get("total_judgments")
                if scan_all
                else baseline.get("remaining_judgments")
                or 0
            )
            state_total = (
                min(base_total, max(0, int(limit))) if limit is not None else base_total
            )
        except Exception:
            logger.warning("無法取得索引基準進度", exc_info=True)
            state_total = None
        try:
            state = ProcessingStateStore()
            state_run_id = state.start_run(
                branch="judgment",
                kind="index",
                title="Qdrant 向量索引",
                stages=["qdrant"],
                meta={
                    "collection": collection,
                    "model": model,
                    "limit": limit,
                    "all_rows": scan_all,
                    "stride": stride,
                    "max_chars": max_chars,
                    "task": run_label,
                    "parent_run_id": parent_run_id() or state_parent_run_id,
                },
                message=f"接續索引；本次候選 {state_total:,} 筆。"
                if state_total is not None
                else "接續索引。",
            )
            state.start_stage(
                state_run_id,
                "qdrant",
                total=state_total,
                message="逐批建立 embedding 並寫入 Qdrant。",
            )
        except Exception:
            logger.warning("無法建立向量索引的處理狀態", exc_info=True)
            state = None
            state_run_id = None

    def build_stats(duration_ms: int) -> Dict[str, Any]:
        elapsed_s = max(0.001, duration_ms / 1000)
        embedding_ms = sum(embedding_durations)
        qdrant_ms = sum(qdrant_durations)
        db_ms = sum(db_durations)
        return {
            "scanned_count": scanned,
            "indexed_count": indexed,
            "points_upserted": points,
            "dimensions": dimensions,
            **_batch_stats(batch_durations),
            "points_per_second": round(indexed / elapsed_s, 2),
            "embedding_ms": round(embedding_ms, 2),
            "embedding_avg_ms": round(
                embedding_ms / len(embedding_durations), 2
            )
            if embedding_durations
            else 0.0,
            "qdrant_ms": round(qdrant_ms, 2),
            "qdrant_avg_ms": round(qdrant_ms / len(qdrant_durations), 2)
            if qdrant_durations
            else 0.0,
            "db_write_ms": round(db_ms, 2),
            "db_write_avg_ms": round(db_ms / len(db_durations), 2)
            if db_durations
            else 0.0,
            "progress": _downsample_progress(progress_samples),
            "task": run_label,
        }

    if recreate and not dry_run:
        store.delete_collection(collection)
        with session_factory() as session:
            session.execute(
                delete(JudgmentVectorIndex).where(
                    JudgmentVectorIndex.collection == collection,
                    JudgmentVectorIndex.version_id == int(version_id or 0),
                )
            )
            session.commit()

    try:
        while True:
            remaining = None if limit is None else max(0, int(limit) - scanned)
            if remaining == 0:
                break
            current_size = batch_size if remaining is None else min(batch_size, remaining)
            with session_factory() as session:
                rows = session.execute(
                    _candidate_statement(
                        collection=collection,
                        model=model,
                        version_id=version_id,
                        all_rows=scan_all,
                        since=since,
                        jid=jid,
                        stride=stride,
                        last_id=last_id,
                        batch_size=current_size,
                    )
                ).mappings().all()
            if not rows:
                break

            last_id = int(rows[-1]["id"])
            scanned += len(rows)
            texts = [
                build_index_text(
                    court=str(row["court_normalized"] or ""),
                    title=str(row["title"] or ""),
                    jdate=str(row["jdate"] or ""),
                    matched_laws=row["matched_laws"] or [],
                    full_text=str(row["full_text"] or ""),
                    max_chars=max_chars,
                )
                for row in rows
            ]
            sample_lengths.extend(len(text) for text in texts)

            if dry_run:
                logger.info("dry-run scanned=%s", scanned)
                continue

            batch_started = time.perf_counter()
            embed_started = batch_started
            vectors = embedder.embed(texts)
            embedding_durations.append(
                (time.perf_counter() - embed_started) * 1000
            )
            dimensions = dimensions or len(vectors[0])
            qdrant_started = time.perf_counter()
            if store.ensure_collection(collection, size=dimensions):
                for field in ("jid", "court", "jdate", "source_archive"):
                    store.ensure_payload_index(collection, field, "keyword")
            qdrant_points = []
            for row, text, vector in zip(rows, texts, vectors):
                qdrant_points.append(
                    {
                        "id": vector_point_id(str(row["jid"])),
                        "vector": vector,
                        "payload": {
                            "jid": str(row["jid"]),
                            "court": str(row["court_normalized"] or ""),
                            "title": str(row["title"] or ""),
                            "jdate": str(row["jdate"] or ""),
                            "matched_laws": list(row["matched_laws"] or []),
                            "citation_count": int(row["citation_count"] or 0),
                            "source_archive": str(row["source_archive"] or ""),
                            "pdf_url": str(row["pdf_url"] or ""),
                            "full_text_length": int(row["full_text_length"] or 0),
                            "snippet": text[:600],
                            "model": model,
                        },
                    }
                )
            store.upsert(collection, qdrant_points)
            qdrant_durations.append((time.perf_counter() - qdrant_started) * 1000)
            db_started = time.perf_counter()
            with session_factory() as session:
                jids = [str(row["jid"]) for row in rows]
                session.execute(
                    delete(JudgmentVectorIndex).where(
                        JudgmentVectorIndex.version_id == int(version_id or 0),
                        JudgmentVectorIndex.jid.in_(jids),
                    )
                )
                session.execute(
                    insert(JudgmentVectorIndex),
                    [
                        {
                            "jid": str(row["jid"]),
                            "version_id": int(version_id or 0),
                            "collection": collection,
                            "model": model,
                            "embedding_version": settings.judgment_embedding_version,
                            "index_recipe_version": recipe_version(settings),
                            "source_year": _source_year(row["jdate"]),
                            "content_hash": str(row["content_hash"] or ""),
                            "index_text_hash": _hash_text(texts[index]),
                            "payload_hash": "",
                            "dimensions": dimensions,
                            "source_updated_at": row["updated_at"],
                            "indexed_at": datetime.now(timezone.utc),
                        }
                        for index, row in enumerate(rows)
                    ],
                )
                session.commit()
            db_durations.append((time.perf_counter() - db_started) * 1000)
            batch_durations.append((time.perf_counter() - batch_started) * 1000)
            indexed += len(rows)
            points += len(qdrant_points)
            now = time.perf_counter()
            if not progress_samples or now - last_progress_at >= 60.0:
                elapsed_s = max(0.001, now - started)
                progress_samples.append(
                    {
                        "elapsed_s": round(elapsed_s, 1),
                        "indexed": indexed,
                        "rate": round(indexed / elapsed_s, 2),
                    }
                )
                last_progress_at = now
            logger.info(
                "indexed=%s scanned=%s points=%s collection=%s",
                indexed,
                scanned,
                points,
                collection,
            )
            if state is not None and state_run_id is not None:
                now = time.perf_counter()
                if now - state_last_write >= 1.0:
                    state_last_write = now
                    elapsed_s = max(0.001, now - started)
                    rate = indexed / elapsed_s
                    if state_total is not None:
                        message = (
                            f"已索引 {indexed:,} / {state_total:,} 筆"
                            f"（{rate:.1f} 筆/秒）。"
                        )
                    else:
                        message = f"已索引 {indexed:,} 筆（{rate:.1f} 筆/秒）。"
                    state.update_stage(
                        state_run_id,
                        "qdrant",
                        current=indexed,
                        total=state_total,
                        message=message,
                    )
    except KeyboardInterrupt:
        if state is not None and state_run_id is not None:
            state.finish_stage(
                state_run_id,
                "qdrant",
                status="interrupted",
                current=indexed,
                total=state_total,
                message=f"索引已中止；本次已寫入 {indexed:,} 筆。",
            )
            state.finish_run(
                state_run_id,
                status="interrupted",
                message=f"向量索引已中止；本次已索引 {indexed:,} 筆，下次會自動接續。",
                counts={
                    "indexed_count": indexed,
                    "scanned_count": scanned,
                    "points_upserted": points,
                },
            )
        raise
    except Exception as exc:
        if state is not None and state_run_id is not None:
            state.finish_stage(
                state_run_id,
                "qdrant",
                status="failed",
                current=indexed,
                total=state_total,
                message=f"{exc.__class__.__name__}: {exc}",
            )
            state.finish_run(
                state_run_id,
                status="failed",
                message=f"向量索引失敗：{exc.__class__.__name__}: {exc}",
                counts={
                    "indexed_count": indexed,
                    "scanned_count": scanned,
                    "points_upserted": points,
                },
            )
        duration_ms = int((time.perf_counter() - started) * 1000)
        record_performance(
            session_factory,
            process="判決向量索引",
            module="judgment.judgment_index.index_judgments",
            status="failed",
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "collection": collection,
                "model": model,
                "limit": limit,
                "all_rows": all_rows,
                "stride": stride,
                "batch_size": batch_size,
                "max_chars": max_chars,
                "recreate": recreate,
                "dry_run": dry_run,
                "task": run_label,
            },
            details=build_stats(duration_ms),
            error_message=f"{exc.__class__.__name__}: {exc}",
        )
        raise

    duration_ms = int((time.perf_counter() - started) * 1000)
    status = "dry_run" if dry_run else "success"
    collection_points = None
    if not dry_run:
        try:
            collection_points = store.collection_count(collection)
        except Exception:
            collection_points = None
    coverage = index_coverage(session_factory, collection=collection, model=model)
    stats = build_stats(duration_ms)
    summary = {
        "status": status,
        "collection": collection,
        "model": model,
        "task": run_label,
        "scanned_count": scanned,
        "indexed_count": indexed,
        "points_upserted": points,
        "dimensions": dimensions,
        "batch_size": batch_size,
        "stride": stride,
        "max_chars": max_chars,
        "duration_ms": duration_ms,
        "average_text_chars": round(sum(sample_lengths) / len(sample_lengths), 1)
        if sample_lengths
        else 0,
        **{
            key: stats[key]
            for key in (
                "batch_count",
                "batch_avg_ms",
                "batch_min_ms",
                "batch_max_ms",
                "batch_p50_ms",
                "points_per_second",
                "embedding_ms",
                "qdrant_ms",
                "db_write_ms",
            )
        },
        "collection_points": collection_points,
        "coverage": coverage,
    }
    record_performance(
        session_factory,
        process="判決向量索引" + ("（試跑）" if dry_run else ""),
        module="judgment.judgment_index.index_judgments",
        status=status,
        started_at=started_at,
        finished_at=datetime.now(timezone.utc),
        duration_ms=duration_ms,
        params={
            "collection": collection,
            "model": model,
            "limit": limit,
            "all_rows": all_rows,
            "since": since,
            "jid": jid,
            "batch_size": batch_size,
            "stride": stride,
            "max_chars": max_chars,
            "recreate": recreate,
            "task": run_label,
        },
        details={
            **stats,
            "collection_points": collection_points,
            "coverage": coverage,
        },
    )
    if state is not None and state_run_id is not None:
        final_total = max(indexed, int(state_total or 0)) or indexed
        state.finish_stage(
            state_run_id,
            "qdrant",
            current=indexed,
            total=final_total,
            message=f"索引完成：本次 {indexed:,} 筆。",
        )
        state.finish_run(
            state_run_id,
            status="success",
            message=f"向量索引完成：本次索引 {indexed:,} 筆。",
            counts={
                "indexed_count": indexed,
                "scanned_count": scanned,
                "points_upserted": points,
                "remaining_judgments": coverage.get("remaining_judgments"),
            },
        )
    return summary


def build_index_version(
    *,
    session_factory,
    settings: Settings,
    store: Optional[QdrantStore] = None,
    embedder: Optional[OllamaEmbedder] = None,
    limit: Optional[int] = None,
    batch_size: int = 64,
    max_chars: Optional[int] = None,
    auto_activate: bool = False,
    resume: bool = True,
    run_label: str = "",
) -> Dict[str, Any]:
    """Build a complete blue-green index version.

    A compatible active version is copied point-for-point without recomputing
    embeddings. Only new, changed or metadata-affected judgments are embedded.
    The active collection is never modified.
    """

    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    store = store or QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=120.0,
    )
    embedder = embedder or OllamaEmbedder(
        settings.embedding_url,
        settings.embedding_model,
        timeout=settings.embedding_timeout_seconds,
    )
    if not store.configured:
        raise QdrantError("QDRANT_URL 未設定")
    if not embedder.configured:
        raise EmbeddingError("EMBEDDING_URL 未設定")

    model = settings.embedding_model
    recipe_version = (
        f"{settings.judgment_index_recipe_version}-{int(max_chars or settings.judgment_index_max_chars)}"
    )
    max_chars = int(max_chars or settings.judgment_index_max_chars)
    batch_size = max(1, int(batch_size))
    snapshot = capture_source_snapshot(session_factory)
    if limit is not None:
        snapshot["document_count"] = min(
            int(snapshot.get("document_count") or 0), max(0, int(limit))
        )
        snapshot["limited"] = True
    expected_count = int(snapshot.get("document_count") or 0)

    active = active_version(session_factory, alias_name=settings.judgment_vector_alias)
    version = (
        find_resumable_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
        if resume
        else None
    )
    if version is not None:
        old_snapshot = version.get("source_snapshot") or {}
        if (
            int(old_snapshot.get("max_judgment_id") or 0)
            != int(snapshot.get("max_judgment_id") or 0)
            or int(old_snapshot.get("document_count") or 0) != expected_count
        ):
            mark_version_failed(
                session_factory,
                version_id=int(version["version_id"]),
                reason="來源資料已變更，放棄舊的 building 版本",
            )
            version = None
    if version is None:
        previous = active
        compatible = bool(
            previous
            and previous.get("status") in {"active", "retired"}
            and previous.get("embedding_model") == model
            and previous.get("embedding_version")
            == settings.judgment_embedding_version
            and previous.get("index_recipe_version") == recipe_version
            and previous.get("point_id_version")
            == settings.judgment_point_id_version
            and int(previous.get("embedding_dimension") or 0) > 0
        )
        if limit is not None:
            compatible = False
            auto_activate = False
        build_mode = "reuse" if compatible else "full"
        version = create_version(
            session_factory,
            settings=settings,
            source_snapshot=snapshot,
            build_mode=build_mode,
            previous_version_id=(
                previous["version_id"] if compatible and previous else None
            ),
            index_recipe_version=recipe_version,
        )
    else:
        previous = (
            get_version(
                session_factory, int(version.get("previous_version_id") or 0)
            )
            if version.get("previous_version_id")
            else None
        )
        build_mode = str(version.get("build_mode") or "full")

    version_id = int(version["version_id"])
    collection = str(version["physical_collection"])
    indexed = int(version.get("indexed_count") or 0)
    progress = IndexProgress(
        expected_count,
        label=f"v{version_id:03d}",
        initial_indexed=indexed,
    )
    last_id = int(version.get("last_indexed_id") or 0)
    dimensions = int(version.get("embedding_dimension") or 0)
    reused_count = 0
    embedded_count = 0
    points_upserted = 0
    deleted_points = 0
    scanned = 0
    batch_durations: List[float] = []
    embedding_durations: List[float] = []
    qdrant_durations: List[float] = []
    db_durations: List[float] = []
    progress_samples: List[Dict[str, Any]] = []
    last_progress_at = 0.0

    try:
        if build_mode == "reuse" and previous and indexed == 0:
            source_collection = str(previous["physical_collection"])
            if store.collection_info(source_collection) is None:
                raise QdrantError(
                    f"來源 collection 不存在，無法增量沿用：{source_collection}"
                )
            dimensions = store.collection_dimension(source_collection) or int(
                previous.get("embedding_dimension") or 0
            )
            store.copy_collection(
                source_collection,
                collection,
                batch_size=256,
                on_progress=progress.copy_update,
            )
            for field in ("jid", "court", "jdate", "source_archive"):
                store.ensure_payload_index(collection, field, "keyword")
            update_version_progress(
                session_factory,
                version_id=version_id,
                indexed_count=0,
                last_indexed_id=0,
                embedding_dimension=dimensions,
            )
        if indexed == 0:
            last_id = 0

        first_batch = True
        while True:
            if limit is not None and scanned >= max(0, int(limit)):
                break
            current_limit = batch_size
            if limit is not None:
                current_limit = min(
                    current_limit, max(0, int(limit) - scanned)
                )
                if current_limit <= 0:
                    break
            with session_factory() as session:
                rows = session.execute(
                    select(*_COLUMNS)
                    .where(
                        JudgmentDocument.id > last_id,
                        JudgmentDocument.id
                        <= int(snapshot.get("max_judgment_id") or 0),
                        JudgmentDocument.full_text != "",
                    )
                    .order_by(JudgmentDocument.id)
                    .limit(current_limit)
                ).mappings().all()
            if not rows:
                break

            scan_started = time.perf_counter()
            last_id = int(rows[-1]["id"])
            scanned += len(rows)
            texts = [
                build_index_text(
                    court=str(row["court_normalized"] or ""),
                    title=str(row["title"] or ""),
                    jdate=str(row["jdate"] or ""),
                    matched_laws=row["matched_laws"] or [],
                    full_text=str(row["full_text"] or ""),
                    max_chars=max_chars,
                )
                for row in rows
            ]
            text_hashes = [_hash_text(text) for text in texts]
            years = [_source_year(row["jdate"]) for row in rows]
            snippets = [text[:600] for text in texts]
            payloads = [
                {
                    "jid": str(row["jid"]),
                    "court": str(row["court_normalized"] or ""),
                    "title": str(row["title"] or ""),
                    "jdate": str(row["jdate"] or ""),
                    "matched_laws": list(row["matched_laws"] or []),
                    "citation_count": int(row["citation_count"] or 0),
                    "source_archive": str(row["source_archive"] or ""),
                    "pdf_url": str(row["pdf_url"] or ""),
                    "full_text_length": int(row["full_text_length"] or 0),
                    "snippet": snippets[index],
                    "model": model,
                    "embedding_version": settings.judgment_embedding_version,
                    "index_recipe_version": recipe_version,
                    "source_year": years[index],
                }
                for index, row in enumerate(rows)
            ]
            payload_hashes = [_payload_hash(payload) for payload in payloads]

            previous_rows: Dict[str, JudgmentVectorIndex] = {}
            if build_mode == "reuse" and previous:
                with session_factory() as session:
                    previous_rows = {
                        row.jid: row
                        for row in session.scalars(
                            select(JudgmentVectorIndex).where(
                                JudgmentVectorIndex.version_id
                                == int(previous["version_id"]),
                                JudgmentVectorIndex.jid.in_(
                                    [str(row["jid"]) for row in rows]
                                ),
                            )
                        ).all()
                    }

            changed_indices: List[int] = []
            reused_flags = [False] * len(rows)
            for index, row in enumerate(rows):
                old = previous_rows.get(str(row["jid"]))
                reusable = False
                if old is not None:
                    reusable = (
                        old.model == model
                        and old.embedding_version
                        == settings.judgment_embedding_version
                        and old.index_recipe_version == recipe_version
                        and old.content_hash == str(row["content_hash"] or "")
                    )
                    if reusable and old.index_text_hash:
                        reusable = old.index_text_hash == text_hashes[index]
                    if reusable and old.payload_hash:
                        reusable = old.payload_hash == payload_hashes[index]
                    if reusable and not old.index_text_hash:
                        source_updated = row["updated_at"]
                        if (
                            source_updated
                            and old.indexed_at
                            and source_updated > old.indexed_at
                        ):
                            reusable = False
                    if reusable and old.dimensions and dimensions:
                        reusable = int(old.dimensions) == int(dimensions)
                if not reusable:
                    changed_indices.append(index)
                else:
                    reused_flags[index] = True

            vectors: List[List[float]] = []
            if changed_indices:
                embed_started = time.perf_counter()
                vectors = embedder.embed([texts[index] for index in changed_indices])
                embedding_durations.append(
                    (time.perf_counter() - embed_started) * 1000
                )
                dimensions = len(vectors[0]) if vectors else dimensions
                qdrant_started = time.perf_counter()
                created = store.ensure_collection(collection, size=dimensions)
                if created or first_batch:
                    for field in ("jid", "court", "jdate", "source_archive"):
                        store.ensure_payload_index(collection, field, "keyword")
                points = []
                for vector, index in zip(vectors, changed_indices):
                    row = rows[index]
                    points.append(
                        {
                            "id": vector_point_id(str(row["jid"])),
                            "vector": vector,
                            "payload": payloads[index],
                        }
                    )
                store.upsert(collection, points)
                qdrant_durations.append(
                    (time.perf_counter() - qdrant_started) * 1000
                )
                points_upserted += len(points)
                embedded_count += len(points)
            reused_count += len(rows) - len(changed_indices)

            # Insert per-version rows for both reused and newly embedded
            # judgments. This is what makes coverage and rollback reliable.
            db_started = time.perf_counter()
            version_rows = []
            for index, row in enumerate(rows):
                previous_row = previous_rows.get(str(row["jid"]))
                version_rows.append(
                    {
                        "jid": str(row["jid"]),
                        "version_id": version_id,
                        "collection": collection,
                        "model": model,
                        "embedding_version": settings.judgment_embedding_version,
                        "index_recipe_version": recipe_version,
                        "source_year": years[index],
                        "content_hash": str(row["content_hash"] or ""),
                        "index_text_hash": text_hashes[index],
                        "payload_hash": (
                            str(previous_row.payload_hash or "")
                            if reused_flags[index] and previous_row
                            else payload_hashes[index]
                        ),
                        "dimensions": dimensions,
                        "source_updated_at": row["updated_at"],
                        "indexed_at": datetime.now(timezone.utc),
                    }
                )
            with session_factory() as session:
                jids = [row["jid"] for row in version_rows]
                session.execute(
                    delete(JudgmentVectorIndex).where(
                        JudgmentVectorIndex.version_id == version_id,
                        JudgmentVectorIndex.jid.in_(jids),
                    )
                )
                if version_rows:
                    session.execute(insert(JudgmentVectorIndex), version_rows)
                session.commit()
            db_durations.append((time.perf_counter() - db_started) * 1000)
            batch_durations.append(
                (time.perf_counter() - scan_started) * 1000
            )
            indexed += len(rows)
            update_version_progress(
                session_factory,
                version_id=version_id,
                indexed_count=indexed,
                last_indexed_id=last_id,
                embedding_dimension=dimensions,
            )
            now = time.perf_counter()
            if not progress_samples or now - last_progress_at >= 60.0:
                elapsed_s = max(0.001, now - started)
                progress_samples.append(
                    {
                        "elapsed_s": round(elapsed_s, 1),
                        "indexed": indexed,
                        "rate": round(indexed / elapsed_s, 2),
                    }
                )
                last_progress_at = now
            first_batch = False
            progress.update(
                indexed,
                reused=reused_count,
                embedded=embedded_count,
            )

        if build_mode == "reuse" and previous:
            previous_version_id = int(previous["version_id"])
            with session_factory() as session:
                stale_jids = [
                    str(jid)
                    for jid in session.scalars(
                        select(JudgmentVectorIndex.jid).where(
                            JudgmentVectorIndex.version_id
                            == previous_version_id,
                            ~exists(
                                select(JudgmentDocument.id).where(
                                    JudgmentDocument.jid
                                    == JudgmentVectorIndex.jid,
                                    JudgmentDocument.full_text != "",
                                    JudgmentDocument.id
                                    <= int(
                                        snapshot.get("max_judgment_id") or 0
                                    ),
                                )
                            ),
                        )
                    ).all()
                ]
            if stale_jids:
                deleted_points = store.delete_points(
                    collection,
                    [vector_point_id(jid) for jid in stale_jids],
                )

        progress.finish(indexed)
        update_version_progress(
            session_factory,
            version_id=version_id,
            indexed_count=indexed,
            last_indexed_id=last_id,
            embedding_dimension=dimensions,
        )
        version_data = get_version(session_factory, version_id) or {}
        validation = validate_version(
            session_factory, store=store, version=version_data
        )
        activated = None
        if validation.get("status") == "ready" and auto_activate:
            activated = activate_version(
                session_factory,
                store=store,
                version_id=version_id,
                alias_name=settings.judgment_vector_alias,
            )
        duration_ms = int((time.perf_counter() - started) * 1000)
        validation_status = validation.get("status")
        summary = {
            "status": (
                "success" if validation_status == "ready" else "validation_failed"
            ),
            "version_id": version_id,
            "collection": collection,
            "alias": settings.judgment_vector_alias,
            "build_mode": build_mode,
            "model": model,
            "recipe_version": recipe_version,
            "document_count": expected_count,
            "scanned_count": scanned,
            "indexed_count": indexed,
            "reused_count": reused_count,
            "embedded_count": embedded_count,
            "points_upserted": points_upserted,
            "deleted_points": deleted_points,
            "dimensions": dimensions,
            "duration_ms": duration_ms,
            "batch_count": len(batch_durations),
            "progress": _downsample_progress(progress_samples),
            "validation": validation,
            "activated": activated,
            "task": run_label,
        }
        record_performance(
            session_factory,
            process="判決向量索引版本",
            module="judgment.judgment_index.build_index_version",
            status="success",
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "version_id": version_id,
                "collection": collection,
                "alias": settings.judgment_vector_alias,
                "build_mode": build_mode,
                "model": model,
                "recipe_version": recipe_version,
                "task": run_label,
            },
            details=summary,
        )
        return summary
    except Exception as exc:
        progress.finish(indexed)
        mark_version_failed(
            session_factory,
            version_id=version_id,
            reason=f"{exc.__class__.__name__}: {exc}",
        )
        duration_ms = int((time.perf_counter() - started) * 1000)
        record_performance(
            session_factory,
            process="判決向量索引版本",
            module="judgment.judgment_index.build_index_version",
            status="failed",
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "version_id": version_id,
                "collection": collection,
                "alias": settings.judgment_vector_alias,
                "build_mode": build_mode,
                "model": model,
                "recipe_version": recipe_version,
                "task": run_label,
            },
            details={
                "indexed_count": indexed,
                "reused_count": reused_count,
                "embedded_count": embedded_count,
                "points_upserted": points_upserted,
                "deleted_points": deleted_points,
            },
            error_message=f"{exc.__class__.__name__}: {exc}",
        )
        raise


def _format_elapsed(ms: int) -> str:
    seconds = max(0, int(ms) // 1000)
    minutes, secs = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}h {minutes:02d}m {secs:02d}s"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{secs}s"


def _print_build_summary(summary: Dict[str, Any]) -> None:
    validation = summary.get("validation") or {}
    activated = summary.get("activated")
    print("建置結果")
    print(f"  版本：v{int(summary.get('version_id') or 0):03d} · {summary.get('collection')}")
    print(f"  模式：{summary.get('build_mode')}")
    print(
        f"  文件：{int(summary.get('indexed_count') or 0):,}"
        f" / {int(summary.get('document_count') or 0):,}"
    )
    print(f"  重用：{int(summary.get('reused_count') or 0):,}")
    print(f"  新 embedding：{int(summary.get('embedded_count') or 0):,}")
    print(f"  Qdrant points：{int(summary.get('points_upserted') or 0):,}")
    print(f"  刪除 points：{int(summary.get('deleted_points') or 0):,}")
    print(f"  驗證：{validation.get('status') or '—'}")
    print(f"  耗時：{_format_elapsed(int(summary.get('duration_ms') or 0))}")
    if activated:
        print(f"  Alias：已切換到 v{int(activated.get('version_id') or 0):03d}")
    else:
        print("  Alias：尚未切換")
        print(
            "  下一步：uv run judgment-index-vectors "
            f"--validate-version {int(summary.get('version_id') or 0)}"
            "，再 --activate-version"
        )


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="將已篩選判決建立 Qdrant 文件級向量索引。"
    )
    parser.add_argument("--database-url", default=None, help="SQLAlchemy database URL")
    parser.add_argument("--qdrant-url", default=None, help="Qdrant base URL")
    parser.add_argument("--qdrant-api-key", default=None, help="Qdrant API key")
    parser.add_argument("--collection", default=None, help="Qdrant collection 名稱")
    parser.add_argument("--embedding-url", default=None, help="Ollama base URL")
    parser.add_argument("--embedding-model", default=None, help="Embedding 模型")
    parser.add_argument("--limit", type=int, default=None, help="最多索引筆數")
    parser.add_argument("--since", default=None, help="只索引此裁判日期之後（YYYYMMDD）")
    parser.add_argument("--jid", default=None, help="只索引指定案號")
    parser.add_argument(
        "--stride",
        type=int,
        default=1,
        help="只索引 id 為 stride 倍數的判決，用於建立跨語料抽樣索引（預設 1）",
    )
    parser.add_argument("--batch-size", type=int, default=64, help="每批判決數")
    parser.add_argument("--max-chars", type=int, default=None, help="每筆embedding 字數上限")
    parser.add_argument("--all", action="store_true", help="重新索引所有判決")
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="刪除 collection 後重新建立並索引所有判決",
    )
    parser.add_argument(
        "--build-version",
        action="store_true",
        help="建立完整藍綠版本；沿用相容的舊向量，只 embedding 差異資料",
    )
    parser.add_argument(
        "--activate",
        action="store_true",
        help="搭配 --build-version，驗證成功後自動切換 alias",
    )
    parser.add_argument(
        "--no-resume",
        action="store_true",
        help="搭配 --build-version，忽略既有 building 版本並建立新版本",
    )
    parser.add_argument(
        "--validate-version",
        type=int,
        default=None,
        metavar="ID",
        help="驗證指定索引版本",
    )
    parser.add_argument(
        "--activate-version",
        type=int,
        default=None,
        metavar="ID",
        help="將指定索引版本切換為 active",
    )
    parser.add_argument(
        "--discard-version",
        type=int,
        default=None,
        metavar="ID",
        help="刪除非 active 的指定索引版本與其 collection",
    )
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="將 alias 切回上一個成功版本",
    )
    parser.add_argument(
        "--list-versions",
        action="store_true",
        help="列出索引版本",
    )
    parser.add_argument(
        "--bootstrap",
        action="store_true",
        help="將現有 collection 登記為 v001 並確保 alias 存在",
    )
    parser.add_argument("--dry-run", action="store_true", help="只統計候選資料，不呼叫服務")
    parser.add_argument("--log-level", default=None, help="DEBUG, INFO, WARNING, ERROR")
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    settings = Settings.from_env().with_overrides(
        database_url=args.database_url,
        qdrant_url=args.qdrant_url,
        qdrant_api_key=args.qdrant_api_key,
        judgment_vector_collection=args.collection,
        embedding_url=args.embedding_url,
        embedding_model=args.embedding_model,
        log_level=args.log_level,
    )
    configure_logging(settings.log_level)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    engine = build_engine(settings.database_url)
    init_db(engine)
    session_factory = build_session_factory(engine)
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=120.0,
    )
    try:
        if args.list_versions:
            summary = {"versions": list_versions(session_factory)}
        elif args.bootstrap:
            version_id = ensure_legacy_version(
                session_factory,
                settings=settings,
                collection=settings.judgment_vector_collection,
            )
            alias_created = False
            if store.configured and store.collection_info(
                settings.judgment_vector_collection
            ):
                if store.get_alias(settings.judgment_vector_alias) is None:
                    store.switch_alias(
                        settings.judgment_vector_alias,
                        settings.judgment_vector_collection,
                    )
                    alias_created = True
            summary = {
                "status": "success",
                "version": get_version(session_factory, version_id),
                "alias": settings.judgment_vector_alias,
                "alias_created": alias_created,
            }
        elif args.validate_version is not None:
            version = get_version(session_factory, args.validate_version)
            if version is None:
                raise LookupError(f"找不到索引版本：{args.validate_version}")
            summary = {
                "status": "success",
                "validation": validate_version(
                    session_factory, store=store, version=version
                ),
            }
        elif args.activate_version is not None:
            summary = {
                "status": "success",
                "version": activate_version(
                    session_factory,
                    store=store,
                    version_id=args.activate_version,
                    alias_name=settings.judgment_vector_alias,
                ),
            }
        elif args.discard_version is not None:
            summary = {
                "status": "success",
                "discarded": discard_version(
                    session_factory,
                    store=store,
                    version_id=args.discard_version,
                ),
            }
        elif args.rollback:
            summary = {
                "status": "success",
                "version": rollback_version(
                    session_factory,
                    store=store,
                    alias_name=settings.judgment_vector_alias,
                ),
            }
        elif args.build_version:
            summary = build_index_version(
                session_factory=session_factory,
                settings=settings,
                store=store,
                limit=args.limit,
                batch_size=args.batch_size,
                max_chars=args.max_chars,
                auto_activate=args.activate,
                resume=not args.no_resume,
                run_label=os.getenv("INDEX_TASK", "").strip(),
            )
        else:
            store = None
            summary = index_judgments(
                session_factory=session_factory,
                settings=settings,
                limit=args.limit,
                all_rows=args.all,
                since=args.since,
                jid=args.jid,
                stride=args.stride,
                batch_size=args.batch_size,
                max_chars=args.max_chars,
                recreate=args.recreate,
                dry_run=args.dry_run,
                run_label=os.getenv("INDEX_TASK", "").strip(),
                track_state=not args.dry_run,
            )
    except Exception as exc:
        logger.error("向量索引失敗：%s", exc)
        print(
            json.dumps(
                {"status": "failed", "error": f"{exc.__class__.__name__}: {exc}"},
                ensure_ascii=False,
                indent=2,
            )
        )
        return 1
    finally:
        engine.dispose()
    if args.build_version:
        _print_build_summary(summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
