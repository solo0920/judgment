from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import delete, func, insert, or_, select

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .embeddings import EmbeddingError, OllamaEmbedder
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
)


def vector_point_id(jid: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"judgment:{jid}"))


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
) -> Dict[str, Any]:
    with session_factory() as session:
        total = int(session.scalar(select(func.count()).select_from(JudgmentDocument)) or 0)
        indexed = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(
                    JudgmentVectorIndex.collection == collection,
                    JudgmentVectorIndex.model == model,
                )
            )
            or 0
        )
        latest = session.scalar(
            select(func.max(JudgmentVectorIndex.indexed_at)).where(
                JudgmentVectorIndex.collection == collection,
                JudgmentVectorIndex.model == model,
            )
        )
    return {
        "total_judgments": total,
        "indexed_judgments": indexed,
        "remaining_judgments": max(0, total - indexed),
        "collection": collection,
        "model": model,
        "latest_indexed_at": latest.isoformat() if latest else None,
    }


def _candidate_statement(
    *,
    collection: str,
    model: str,
    all_rows: bool,
    since: Optional[str],
    jid: Optional[str],
    stride: int,
    last_id: int,
    batch_size: int,
):
    statement = (
        select(*_COLUMNS)
        .outerjoin(
            JudgmentVectorIndex,
            JudgmentVectorIndex.jid == JudgmentDocument.jid,
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
                    JudgmentVectorIndex.collection == collection
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
                        JudgmentVectorIndex.jid.in_(jids)
                    )
                )
                session.execute(
                    insert(JudgmentVectorIndex),
                    [
                        {
                            "jid": str(row["jid"]),
                            "collection": collection,
                            "model": model,
                            "content_hash": str(row["content_hash"] or ""),
                            "dimensions": dimensions,
                            "indexed_at": datetime.now(timezone.utc),
                        }
                        for row in rows
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
    parser.add_argument("--batch-size", type=int, default=16, help="每批判決數")
    parser.add_argument("--max-chars", type=int, default=None, help="每筆embedding 字數上限")
    parser.add_argument("--all", action="store_true", help="重新索引所有判決")
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="刪除 collection 後重新建立並索引所有判決",
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
    engine = build_engine(settings.database_url)
    init_db(engine)
    session_factory = build_session_factory(engine)
    try:
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
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
