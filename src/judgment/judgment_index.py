from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple
from urllib.parse import urlparse
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import and_, delete, exists, func, insert, or_, select

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .embeddings import (
    EmbeddingError,
    OllamaEmbedder,
    probe_embedding_hosts,
)
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
from .ollama_hosts import runtime_settings
from .processing_state import ProcessingStateStore, parent_run_id
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

_COLUMNS = (
    JudgmentDocument.id,
    JudgmentDocument.jid,
    JudgmentDocument.issue_month,
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


def history_point_id(jid: str, version_id: int) -> str:
    return str(uuid5(NAMESPACE_URL, f"judgment-history:{jid}:{int(version_id)}"))


def _archive_history_points(
    store,
    *,
    source_collection: str,
    history_collection: str,
    point_ids: Sequence[str],
    previous_version_id: int,
    version_id: int,
) -> int:
    if (
        not source_collection
        or not history_collection
        or not point_ids
        or source_collection == history_collection
    ):
        return 0
    try:
        points = store.retrieve_points(
            source_collection,
            list(point_ids),
            with_payload=True,
            with_vector=True,
        )
    except Exception:
        logger.warning(
            "無法讀取舊向量，history 略過（source=%s）",
            source_collection,
            exc_info=True,
        )
        return 0
    history_points = []
    for point in points or []:
        payload = dict(point.get("payload") or {})
        jid = str(payload.get("jid") or "")
        vector = point.get("vector")
        if not jid or not vector:
            continue
        payload.update(
            {
                "jid": jid,
                "is_current": False,
                "history_version_id": int(previous_version_id),
                "valid_from_version_id": int(
                    payload.get("valid_from_version_id") or previous_version_id
                ),
                "valid_to_version_id": int(version_id),
                "superseded_by_version_id": int(version_id),
            }
        )
        history_points.append(
            {
                "id": history_point_id(jid, int(previous_version_id)),
                "vector": vector,
                "payload": payload,
            }
        )
    if not history_points:
        return 0
    try:
        size = len(history_points[0]["vector"])
        store.ensure_collection(history_collection, size=size)
        for field in ("jid", "history_version_id", "valid_to_version_id"):
            store.ensure_payload_index(history_collection, field, "keyword")
        store.upsert(history_collection, history_points)
    except Exception:
        logger.warning(
            "無法寫入 Qdrant history collection %s",
            history_collection,
            exc_info=True,
        )
        return 0
    return len(history_points)


def _hash_text(value: str) -> str:
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()


def _payload_hash(payload: Dict[str, Any]) -> str:
    stable = {
        key: value
        for key, value in payload.items()
        if key
        not in {
            "valid_from_version_id",
            "valid_to_version_id",
            "is_current",
            "jdate_num",
        }
    }
    return hashlib.sha256(
        json.dumps(stable, ensure_ascii=False, sort_keys=True).encode("utf-8")
    ).hexdigest()


def _source_year(jdate: Any) -> str:
    text = str(jdate or "").strip()
    return text[:4] if text[:4].isdigit() else ""


def _jdate_num(jdate: Any) -> Optional[int]:
    text = str(jdate or "").strip()
    if len(text) == 8 and text.isdigit():
        return int(text)
    return None


def _ensure_judgment_payload_indexes(store, collection: str) -> None:
    for field in (
        "jid",
        "court",
        "jdate",
        "source_archive",
        "title",
        "source_year",
    ):
        store.ensure_payload_index(collection, field, "keyword")
    store.ensure_payload_index(collection, "jdate_num", "integer")


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
        total = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(JudgmentDocument.is_current.is_(True))
            )
            or 0
        )
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


_COVERAGE_CACHE_TTL_SECONDS = 300.0
_COVERAGE_CACHE_FAILURE_TTL_SECONDS = 30.0
_coverage_cache: Dict[
    Tuple[int, str, str, Optional[int]],
    Tuple[Dict[str, Any], float, Any],
] = {}
_coverage_cache_locks: Dict[
    Tuple[int, str, str, Optional[int]], threading.Lock
] = {}
_coverage_cache_guard = threading.Lock()
_staleness_cache: Dict[
    Tuple[int, str, str, Optional[int]],
    Tuple[Dict[str, Any], float, Any],
] = {}
_staleness_cache_locks: Dict[
    Tuple[int, str, str, Optional[int]], threading.Lock
] = {}
_staleness_cache_guard = threading.Lock()


def _coverage_cache_key(
    session_factory: Any,
    *,
    collection: str,
    model: str,
    version_id: Optional[int],
) -> Tuple[int, str, str, Optional[int]]:
    return (
        id(session_factory),
        str(collection or ""),
        str(model or ""),
        int(version_id) if version_id is not None else None,
    )


def invalidate_index_coverage(
    *,
    collection: Optional[str] = None,
    model: Optional[str] = None,
    version_id: Optional[int] = None,
) -> int:
    """Drop cached coverage and staleness values matching the filters."""

    target_collection = str(collection) if collection is not None else None
    target_model = str(model) if model is not None else None
    target_version = int(version_id) if version_id is not None else None
    removed = 0
    with _coverage_cache_guard:
        for key in list(_coverage_cache):
            _, key_collection, key_model, key_version = key
            if target_collection is not None and key_collection != target_collection:
                continue
            if target_model is not None and key_model != target_model:
                continue
            if target_version is not None and key_version != target_version:
                continue
            _coverage_cache.pop(key, None)
            removed += 1
    with _staleness_cache_guard:
        for key in list(_staleness_cache):
            _, key_collection, key_model, key_version = key
            if target_collection is not None and key_collection != target_collection:
                continue
            if target_model is not None and key_model != target_model:
                continue
            if target_version is not None and key_version != target_version:
                continue
            _staleness_cache.pop(key, None)
    return removed


def cached_index_coverage(
    session_factory: Any,
    *,
    collection: str,
    model: str,
    version_id: Optional[int] = None,
    ttl_seconds: float = _COVERAGE_CACHE_TTL_SECONDS,
    cache_stats: Optional[Dict[str, Any]] = None,
    force_refresh: bool = False,
) -> Dict[str, Any]:
    """Return coverage with a process-wide TTL cache and single-flight refresh.

    The cache is keyed by the session factory identity, collection, model and
    version.  Coverage is an exact count over millions of rows, so callers on
    the request path should use this wrapper instead of ``index_coverage``.
    Admin and indexing callers can keep using ``index_coverage`` when they need
    an authoritative value.
    """

    started = time.perf_counter()

    def record(**values: Any) -> None:
        if cache_stats is None:
            return
        cache_stats.update(values)
        cache_stats.setdefault(
            "cache_lookup_ms",
            round((time.perf_counter() - started) * 1000, 2),
        )

    ttl = max(0.0, float(ttl_seconds))
    if ttl <= 0:
        value = index_coverage(
            session_factory,
            collection=collection,
            model=model,
            version_id=version_id,
        )
        record(cache_hit=False, cache_disabled=True)
        return value
    key = _coverage_cache_key(
        session_factory,
        collection=collection,
        model=model,
        version_id=version_id,
    )
    now = time.monotonic()
    with _coverage_cache_guard:
        entry = _coverage_cache.get(key)
        if (
            not force_refresh
            and entry is not None
            and entry[2] is session_factory
            and entry[1] > now
        ):
            record(cache_hit=True, cache_wait_ms=0.0)
            return dict(entry[0])
        key_lock = _coverage_cache_locks.setdefault(key, threading.Lock())

    # Only one request per key refreshes the count; the rest wait and then
    # read the value written by the winner. A forced refresh (background
    # warmer) updates the value while normal readers keep hitting the fast
    # path above.
    with key_lock:
        wait_ms = round((time.perf_counter() - started) * 1000, 2)
        now = time.monotonic()
        with _coverage_cache_guard:
            entry = _coverage_cache.get(key)
            if (
                not force_refresh
                and entry is not None
                and entry[2] is session_factory
                and entry[1] > now
            ):
                record(cache_hit=True, cache_wait_ms=wait_ms)
                return dict(entry[0])
            stale = (
                dict(entry[0])
                if entry is not None and entry[2] is session_factory
                else None
            )
        refresh_started = time.perf_counter()
        try:
            value = index_coverage(
                session_factory,
                collection=collection,
                model=model,
                version_id=version_id,
            )
        except Exception:
            if stale is None:
                raise
            logger.warning(
                "index coverage refresh failed; serving stale cache",
                exc_info=True,
            )
            with _coverage_cache_guard:
                _coverage_cache[key] = (
                    stale,
                    time.monotonic()
                    + min(ttl, _COVERAGE_CACHE_FAILURE_TTL_SECONDS),
                    session_factory,
                )
            record(
                cache_hit=True,
                cache_stale=True,
                cache_wait_ms=wait_ms,
                cache_forced=force_refresh,
                cache_refresh_ms=round(
                    (time.perf_counter() - refresh_started) * 1000, 2
                ),
            )
            return dict(stale)
        expires_at = time.monotonic() + ttl
        with _coverage_cache_guard:
            _coverage_cache[key] = (dict(value), expires_at, session_factory)
        record(
            cache_hit=False,
            cache_forced=force_refresh,
            cache_wait_ms=wait_ms,
            cache_refresh_ms=round(
                (time.perf_counter() - refresh_started) * 1000, 2
            ),
        )
        return dict(value)


def cached_index_staleness(
    session_factory: Any,
    *,
    collection: str,
    model: str,
    version_id: Optional[int] = None,
    ttl_seconds: float = _COVERAGE_CACHE_TTL_SECONDS,
    cache_stats: Optional[Dict[str, Any]] = None,
    force_refresh: bool = False,
) -> Dict[str, Any]:
    """Return staleness with a process-wide TTL cache and single-flight refresh.

    Exact missing/changed/stale counts require several multi-million-row
    aggregates, so request paths should use this wrapper.  Indexing and
    processing code that makes decisions should keep using ``index_staleness``.
    """

    started = time.perf_counter()

    def record(**values: Any) -> None:
        if cache_stats is None:
            return
        cache_stats.update(values)
        cache_stats.setdefault(
            "cache_lookup_ms",
            round((time.perf_counter() - started) * 1000, 2),
        )

    ttl = max(0.0, float(ttl_seconds))
    if ttl <= 0:
        value = index_staleness(
            session_factory,
            collection=collection,
            model=model,
            version_id=version_id,
        )
        record(cache_hit=False, cache_disabled=True)
        return value
    key = _coverage_cache_key(
        session_factory,
        collection=collection,
        model=model,
        version_id=version_id,
    )
    now = time.monotonic()
    with _staleness_cache_guard:
        entry = _staleness_cache.get(key)
        if (
            not force_refresh
            and entry is not None
            and entry[2] is session_factory
            and entry[1] > now
        ):
            record(cache_hit=True, cache_wait_ms=0.0)
            return dict(entry[0])
        key_lock = _staleness_cache_locks.setdefault(key, threading.Lock())

    with key_lock:
        wait_ms = round((time.perf_counter() - started) * 1000, 2)
        now = time.monotonic()
        with _staleness_cache_guard:
            entry = _staleness_cache.get(key)
            if (
                not force_refresh
                and entry is not None
                and entry[2] is session_factory
                and entry[1] > now
            ):
                record(cache_hit=True, cache_wait_ms=wait_ms)
                return dict(entry[0])
            stale = (
                dict(entry[0])
                if entry is not None and entry[2] is session_factory
                else None
            )
        refresh_started = time.perf_counter()
        try:
            value = index_staleness(
                session_factory,
                collection=collection,
                model=model,
                version_id=version_id,
            )
        except Exception:
            if stale is None:
                raise
            logger.warning(
                "index staleness refresh failed; serving stale cache",
                exc_info=True,
            )
            with _staleness_cache_guard:
                _staleness_cache[key] = (
                    stale,
                    time.monotonic()
                    + min(ttl, _COVERAGE_CACHE_FAILURE_TTL_SECONDS),
                    session_factory,
                )
            record(
                cache_hit=True,
                cache_stale=True,
                cache_wait_ms=wait_ms,
                cache_forced=force_refresh,
                cache_refresh_ms=round(
                    (time.perf_counter() - refresh_started) * 1000, 2
                ),
            )
            return dict(stale)
        with _staleness_cache_guard:
            _staleness_cache[key] = (
                dict(value),
                time.monotonic() + ttl,
                session_factory,
            )
        record(
            cache_hit=False,
            cache_forced=force_refresh,
            cache_wait_ms=wait_ms,
            cache_refresh_ms=round(
                (time.perf_counter() - refresh_started) * 1000, 2
            ),
        )
        return dict(value)


def index_staleness(
    session_factory,
    *,
    collection: str,
    model: str,
    version_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Return missing/changed/stale counts for a judgment vector index."""

    index_filters = [
        JudgmentVectorIndex.collection == collection,
        JudgmentVectorIndex.model == model,
    ]
    if version_id is not None:
        index_filters.append(
            JudgmentVectorIndex.version_id == int(version_id)
        )
    join_condition = JudgmentVectorIndex.jid == JudgmentDocument.jid
    if version_id is not None:
        join_condition = join_condition & (
            JudgmentVectorIndex.version_id == int(version_id)
        )
    current_doc = (
        (JudgmentDocument.is_current.is_(True))
        & (JudgmentDocument.full_text != "")
    )
    with session_factory() as session:
        total = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(current_doc)
            )
            or 0
        )
        indexed = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(*index_filters)
            )
            or 0
        )
        missing = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .outerjoin(
                    JudgmentVectorIndex,
                    join_condition
                    & (JudgmentVectorIndex.collection == collection)
                    & (JudgmentVectorIndex.model == model),
                )
                .where(current_doc, JudgmentVectorIndex.jid.is_(None))
            )
            or 0
        )
        changed = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .join(
                    JudgmentVectorIndex,
                    join_condition
                    & (JudgmentVectorIndex.collection == collection)
                    & (JudgmentVectorIndex.model == model),
                )
                .where(
                    current_doc,
                    JudgmentVectorIndex.content_hash
                    != JudgmentDocument.content_hash,
                )
            )
            or 0
        )
        stale = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(
                    *index_filters,
                    ~exists(
                        select(1).where(
                            JudgmentDocument.jid == JudgmentVectorIndex.jid,
                            JudgmentDocument.is_current.is_(True),
                        )
                    ),
                )
            )
            or 0
        )
    pending = missing + changed + stale
    return {
        "status": "fresh" if total and pending == 0 else (
            "empty" if total == 0 else "stale"
        ),
        "fresh": bool(total and pending == 0),
        "total_judgments": total,
        "indexed_judgments": indexed,
        "missing_judgments": missing,
        "changed_judgments": changed,
        "stale_judgments": stale,
        "pending_judgments": pending,
        "collection": collection,
        "model": model,
        "version_id": version_id,
    }


def _cursor_month(value: Any) -> str:
    text = str(value or "").strip()
    return text[:6] if text else "000000"


def _month_order_expression():
    """Normalize empty issue_month values for the month cursor."""

    return func.coalesce(
        func.nullif(JudgmentDocument.issue_month, ""), "000000"
    )


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
    last_month: str = "",
    month_order: bool = True,
    batch_size: int,
):
    index_join = JudgmentVectorIndex.jid == JudgmentDocument.jid
    if version_id is not None:
        index_join = index_join & (
            JudgmentVectorIndex.version_id == int(version_id)
        )
    if month_order:
        month_expr = _month_order_expression()
        if last_month:
            cursor = or_(
                month_expr > last_month,
                and_(
                    month_expr == last_month,
                    JudgmentDocument.id > last_id,
                ),
            )
        else:
            cursor = JudgmentDocument.id > last_id
        order_by = (
            month_expr.asc(),
            JudgmentDocument.id.asc(),
        )
    else:
        cursor = JudgmentDocument.id > last_id
        order_by = (JudgmentDocument.id.asc(),)
    statement = (
        select(*_COLUMNS)
        .outerjoin(
            JudgmentVectorIndex,
            index_join,
        )
        .where(
            cursor,
            JudgmentDocument.full_text != "",
            JudgmentDocument.is_current.is_(True),
        )
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
    return statement.order_by(*order_by).limit(batch_size)


def _version_batch_statement(
    *,
    last_id: int,
    last_month: str,
    month_order: bool,
    max_judgment_id: int,
    batch_size: int,
):
    if month_order:
        month_expr = _month_order_expression()
        if last_month:
            cursor = or_(
                month_expr > last_month,
                and_(
                    month_expr == last_month,
                    JudgmentDocument.id > last_id,
                ),
            )
        else:
            cursor = JudgmentDocument.id > last_id
        order_by = (
            month_expr.asc(),
            JudgmentDocument.id.asc(),
        )
    else:
        cursor = JudgmentDocument.id > last_id
        order_by = (JudgmentDocument.id.asc(),)
    return (
        select(*_COLUMNS)
        .where(
            cursor,
            JudgmentDocument.id <= int(max_judgment_id),
            JudgmentDocument.full_text != "",
            JudgmentDocument.is_current.is_(True),
        )
        .order_by(*order_by)
        .limit(batch_size)
    )


def _month_source_totals(session_factory) -> List[Dict[str, Any]]:
    with session_factory() as session:
        rows = session.execute(
            select(
                JudgmentDocument.issue_month,
                JudgmentDocument.source_archive,
                func.count(),
            )
            .where(JudgmentDocument.is_current.is_(True))
            .group_by(
                JudgmentDocument.issue_month,
                JudgmentDocument.source_archive,
            )
            .order_by(
                JudgmentDocument.issue_month.desc(),
                JudgmentDocument.source_archive.asc(),
            )
        ).all()
    return [
        {
            "month": str(row[0] or ""),
            "archive": str(row[1] or ""),
            "total": int(row[2] or 0),
        }
        for row in rows
    ]


def _indexed_month_counts(
    session_factory,
    *,
    version_id: Optional[int],
    collection: str = "",
    model: str = "",
) -> Dict[tuple[str, str], int]:
    filters = [JudgmentDocument.is_current.is_(True)]
    if version_id is not None:
        filters.append(JudgmentVectorIndex.version_id == int(version_id))
    else:
        filters.extend(
            [
                JudgmentVectorIndex.collection == str(collection or ""),
                JudgmentVectorIndex.model == str(model or ""),
            ]
        )
    with session_factory() as session:
        rows = session.execute(
            select(
                JudgmentDocument.issue_month,
                JudgmentDocument.source_archive,
                func.count(),
            )
            .select_from(JudgmentVectorIndex)
            .join(
                JudgmentDocument,
                JudgmentDocument.jid == JudgmentVectorIndex.jid,
            )
            .where(*filters)
            .group_by(
                JudgmentDocument.issue_month,
                JudgmentDocument.source_archive,
            )
        ).all()
    return {
        (str(row[0] or ""), str(row[1] or "")): int(row[2] or 0)
        for row in rows
    }


def _prior_index_month_runtime(
    state: Optional[ProcessingStateStore],
    *,
    version_id: Optional[int],
) -> Dict[tuple[str, str], Dict[str, Any]]:
    """Return the most complete month R/E counts for a resumed version.

    A resumed version already has ``processed`` rows in PostgreSQL, but the
    rows do not record whether each point was reused or newly embedded.  The
    previous run's runtime payload is the authoritative source for those
    counters, so keep the run with the highest R/E coverage.
    """

    if state is None or not version_id:
        return {}
    try:
        data = state.read()
    except Exception:
        logger.warning("無法讀取續跑前的索引月份進度", exc_info=True)
        return {}
    best: Dict[tuple[str, str], Dict[str, Any]] = {}
    best_scores: Dict[tuple[str, str], tuple[int, int, str]] = {}
    for run in data.get("runs") or []:
        runtime = (run.get("meta") or {}).get("index_runtime") or {}
        if not isinstance(runtime, dict):
            continue
        try:
            run_version = int(runtime.get("version_id") or 0)
        except (TypeError, ValueError):
            continue
        if run_version != int(version_id):
            continue
        updated_at = str(
            runtime.get("updated_at") or run.get("started_at") or ""
        )
        for item in runtime.get("months") or []:
            if not isinstance(item, dict):
                continue
            key = (
                str(item.get("month") or ""),
                str(item.get("archive") or ""),
            )
            processed = int(item.get("processed") or 0)
            coverage = int(item.get("reused") or 0) + int(
                item.get("embedded") or 0
            )
            score = (processed, coverage, updated_at)
            if score <= best_scores.get(key, (-1, -1, "")):
                continue
            best_scores[key] = score
            best[key] = item
    return best


def _merge_prior_month_runtime(
    month_runtime: Dict[tuple[str, str], Dict[str, Any]],
    prior: Dict[tuple[str, str], Dict[str, Any]],
) -> None:
    """Seed resumed month counters with the previous run's R/E values."""

    for key, item in month_runtime.items():
        previous = prior.get(key)
        if not previous:
            continue
        processed = int(item.get("processed") or 0)
        if processed <= 0:
            continue
        prior_reused = min(processed, int(previous.get("reused") or 0))
        prior_embedded = min(
            max(0, processed - prior_reused),
            int(previous.get("embedded") or 0),
        )
        item["reused"] = prior_reused
        item["embedded"] = prior_embedded


def _month_runtime_rows(
    session_factory,
    *,
    version_id: Optional[int],
    collection: str = "",
    model: str = "",
) -> Dict[tuple[str, str], Dict[str, Any]]:
    current = _indexed_month_counts(
        session_factory,
        version_id=version_id,
        collection=collection,
        model=model,
    )
    rows: Dict[tuple[str, str], Dict[str, Any]] = {}
    for item in _month_source_totals(session_factory):
        month = item["month"]
        key = (month, item["archive"])
        total = int(item["total"])
        processed = min(total, int(current.get(key) or 0))
        rows[key] = {
            "month": month,
            "archive": item["archive"],
            "total": total,
            "processed": processed,
            "reused": 0,
            "embedded": 0,
            "percent": round(100.0 * processed / total, 1) if total else None,
            "status": "success" if total and processed >= total else "pending",
        }
    return rows


def index_month_coverage(
    session_factory,
    *,
    version_id: Optional[int],
    collection: str,
    model: str,
) -> Dict[str, Any]:
    """Return per-month index coverage for the active collection/version."""

    rows = _month_runtime_rows(
        session_factory,
        version_id=version_id,
        collection=collection,
        model=model,
    )
    months = sorted(
        rows.values(),
        key=lambda item: (item["month"], item["archive"]),
        reverse=True,
    )
    total = sum(int(item["total"]) for item in months)
    processed = sum(int(item["processed"]) for item in months)
    return {
        "months": months,
        "summary": {
            "indexed": processed,
            "total": total,
        },
    }


def _endpoint_view(url: str, model: str) -> Dict[str, Any]:
    parsed = urlparse(str(url or ""))
    return {
        "url": str(url or "").rstrip("/"),
        "host": parsed.hostname or "",
        "port": parsed.port or 11434,
        "model": str(model or ""),
    }


def _provided_embedding_probe(embedder, model: str) -> Dict[str, Any]:
    url = str(getattr(embedder, "base_url", "") or "").rstrip("/")
    selected = _endpoint_view(url, model) if url else {
        "url": "",
        "host": "",
        "port": None,
        "model": model,
    }
    return {
        "status": "provided",
        "model": model,
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "hosts": (
            [{**selected, "role": "provided", "status": "provided"}]
            if url
            else []
        ),
        "selected": selected,
        "error": "",
    }


def _active_embedding_view(embedder, model: str) -> Dict[str, Any]:
    url = str(
        getattr(embedder, "active_base_url", "")
        or getattr(embedder, "base_url", "")
        or ""
    ).rstrip("/")
    view = _endpoint_view(url, model)
    view["using_fallback"] = bool(getattr(embedder, "using_fallback", False))
    return view


def _publish_index_runtime(
    state: Optional[ProcessingStateStore],
    state_run_id: Optional[str],
    runtime: Optional[Dict[str, Any]],
    *,
    message: str = "",
) -> None:
    if (
        state is None
        or state_run_id is None
        or runtime is None
    ):
        return
    runtime["updated_at"] = datetime.now(timezone.utc).isoformat()
    state.update_run(
        state_run_id,
        meta={"index_runtime": runtime},
        message=message or None,
    )


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
        api=settings.embedding_api,
        timeout=settings.embedding_timeout_seconds,
        fallback_base_url=settings.embedding_fallback_url,
        fallback_api=settings.embedding_fallback_api,
        fallback_base_urls=settings.embedding_failover_urls,
        fallback_apis=settings.embedding_failover_apis,
    )
    scan_all = bool(all_rows or recreate)

    scanned = 0
    indexed = 0
    points = 0
    dimensions = 0
    last_id = 0
    last_month = ""
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
                        last_month=last_month,
                        month_order=True,
                        batch_size=current_size,
                    )
                ).mappings().all()
            if not rows:
                break

            last_id = int(rows[-1]["id"])
            last_month = _cursor_month(rows[-1]["issue_month"])
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
                _ensure_judgment_payload_indexes(store, collection)
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
                            "jdate_num": _jdate_num(row["jdate"]),
                            "source_year": _source_year(row["jdate"]),
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
    invalidate_index_coverage(collection=collection, model=model)
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


def _index_current_view(
    rows: Sequence[Any],
    *,
    scanned: int,
    indexed: int,
    reused: int,
    embedded: int,
) -> Dict[str, Any]:
    """Describe the current batch so the UI can show R/E at a glance."""

    current_row = rows[-1]
    phase = (
        "mixed"
        if reused and embedded
        else "embed"
        if embedded
        else "reuse"
    )
    return {
        "month": str(current_row["issue_month"] or ""),
        "archive": str(current_row["source_archive"] or ""),
        "jid": str(current_row["jid"] or ""),
        "first_jid": str(rows[0]["jid"] or ""),
        "last_jid": str(current_row["jid"] or ""),
        "title": str(current_row["title"] or ""),
        "court": str(current_row["court_normalized"] or ""),
        "jdate": str(current_row["jdate"] or ""),
        "batch_size": len(rows),
        "scanned": scanned,
        "indexed": indexed,
        "reused": reused,
        "embedded": embedded,
        "phase": phase,
    }


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
    track_state: bool = False,
    state_parent_run_id: str = "",
) -> Dict[str, Any]:
    """Build a complete blue-green index version.

    A compatible active version is copied point-for-point without recomputing
    embeddings. Only new, changed or metadata-affected judgments are embedded.
    The active collection is never modified.
    """

    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    probe_ms = 0.0
    version_ms = 0.0
    copy_ms = 0.0
    qdrant_delete_ms = 0.0
    validate_ms = 0.0
    activate_ms = 0.0
    resumed = False
    resumed_indexed = 0
    store = store or QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=120.0,
    )
    model = settings.embedding_model
    probe_started = time.perf_counter()
    if embedder is None:
        host_probe = probe_embedding_hosts(
            primary_url=settings.embedding_url,
            fallback_url=settings.embedding_fallback_url,
            fallback_urls=settings.embedding_failover_urls,
            model=model,
            timeout=min(3.0, settings.embedding_timeout_seconds),
            primary_api=settings.embedding_api,
            fallback_api=settings.embedding_fallback_api,
            fallback_apis=settings.embedding_failover_apis,
        )
        selected = host_probe.get("selected")
        if not selected:
            detail = "；".join(
                f"{host.get('role') or 'host'} {host.get('url') or '—'}: "
                f"{host.get('detail') or host.get('status')}"
                for host in host_probe.get("hosts") or []
            )
            message = (
                f"{host_probe.get('error') or 'Embedding 連線測試失敗'}"
                + (f"（{detail}）" if detail else "")
            )
            if track_state:
                try:
                    failed_state = ProcessingStateStore()
                    failed_runtime = {
                        "version_id": None,
                        "collection": "",
                        "alias": settings.judgment_vector_alias,
                        "build_mode": "probe",
                        "model": model,
                        "batch_size": batch_size,
                        "expected_count": 0,
                        "embedding": host_probe,
                        "months": [],
                        "current": {},
                        "summary": {
                            "indexed": 0,
                            "total": 0,
                            "reused": 0,
                            "embedded": 0,
                            "points_upserted": 0,
                        },
                        "status": "failed",
                        "error": message,
                        "started_at": started_at.isoformat(),
                        "finished_at": datetime.now(timezone.utc).isoformat(),
                    }
                    failed_run_id = failed_state.start_run(
                        branch="judgment",
                        kind="index",
                        title="Qdrant判決向量索引版本建置",
                        stages=["ollama", "qdrant", "validate"],
                        meta={
                            "index_runtime": failed_runtime,
                            "parent_run_id": parent_run_id()
                            or state_parent_run_id,
                        },
                        message=message,
                    )
                    total_hosts = max(1, len(host_probe.get("hosts") or []))
                    failed_state.start_stage(
                        failed_run_id,
                        "ollama",
                        total=total_hosts,
                        message="測試 embedding 主機與模型。",
                    )
                    failed_state.finish_stage(
                        failed_run_id,
                        "ollama",
                        status="failed",
                        current=0,
                        total=total_hosts,
                        message=message,
                    )
                    failed_state.finish_run(
                        failed_run_id,
                        status="failed",
                        message=message,
                    )
                except Exception:
                    logger.warning(
                        "無法記錄 embedding 測試失敗狀態", exc_info=True
                    )
            raise EmbeddingError(message)
        fallback_hosts = [
            host
            for host in host_probe.get("hosts") or []
            if host.get("status") == "operational"
            and host.get("url")
            and host.get("url") != selected.get("url")
        ]
        fallback_urls = [str(host.get("url") or "") for host in fallback_hosts]
        fallback_apis = [
            str(host.get("api") or "ollama") for host in fallback_hosts
        ]
        embedder = OllamaEmbedder(
            str(selected.get("url") or ""),
            model,
            api=str(selected.get("api") or "ollama"),
            timeout=settings.embedding_timeout_seconds,
            fallback_base_url=fallback_urls[0] if fallback_urls else "",
            fallback_api=fallback_apis[0] if fallback_apis else "ollama",
            fallback_base_urls=fallback_urls[1:],
            fallback_apis=fallback_apis[1:],
        )
    else:
        host_probe = _provided_embedding_probe(embedder, model)
    probe_ms = (time.perf_counter() - probe_started) * 1000
    if not store.configured:
        raise QdrantError("QDRANT_URL 未設定")
    if not embedder.configured:
        raise EmbeddingError("EMBEDDING_URL 未設定")
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

    version_started = time.perf_counter()
    active = active_version(session_factory, alias_name=settings.judgment_vector_alias)
    version = (
        find_resumable_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
        if resume
        else None
    )
    resumed = version is not None
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
            resumed = False
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
    resumed_indexed = indexed
    version_ms = (time.perf_counter() - version_started) * 1000
    progress = IndexProgress(
        expected_count,
        label=f"v{version_id:03d}",
        initial_indexed=indexed,
    )
    last_id = int(version.get("last_indexed_id") or 0)
    last_month = str(version.get("last_indexed_month") or "")
    # Existing in-flight versions created before the month cursor keep their
    # original id order so resume cannot skip months.  New versions start at
    # (month, id) and process the oldest month first.
    month_order = bool(last_month) or last_id == 0
    dimensions = int(version.get("embedding_dimension") or 0)
    reused_count = 0
    embedded_count = 0
    points_upserted = 0
    deleted_points = 0
    history_points = 0
    history_collection = (
        settings.judgment_vector_history_collection.strip()
        or f"{collection}_history"
    )
    scanned = 0
    batch_durations: List[float] = []
    embedding_durations: List[float] = []
    qdrant_durations: List[float] = []
    db_durations: List[float] = []
    progress_samples: List[Dict[str, Any]] = []
    last_progress_at = 0.0
    last_copy_publish_at = 0.0
    copy_started = 0.0

    state: Optional[ProcessingStateStore] = None
    state_run_id: Optional[str] = None
    month_runtime: Dict[tuple[str, str], Dict[str, Any]] = {}
    runtime: Optional[Dict[str, Any]] = None
    active_stage = "qdrant"
    if track_state:
        try:
            state = ProcessingStateStore()
            month_runtime = _month_runtime_rows(
                session_factory, version_id=version_id
            )
            _merge_prior_month_runtime(
                month_runtime,
                _prior_index_month_runtime(
                    state,
                    version_id=version_id,
                ),
            )
            runtime = {
                "version_id": version_id,
                "version_duration_ms": round(version_ms, 2),
                "collection": collection,
                "alias": settings.judgment_vector_alias,
                "build_mode": build_mode,
                "model": model,
                "batch_size": batch_size,
                "scan_order": "issue_month" if month_order else "id",
                "expected_count": expected_count,
                "embedding": {
                    **host_probe,
                    "active": _active_embedding_view(embedder, model),
                },
                "months": sorted(
                    month_runtime.values(),
                    key=lambda item: (item["month"], item["archive"]),
                    reverse=True,
                ),
                "current": {},
                "copy": {
                    "copied": 0,
                    "total": 0,
                    "percent": None,
                    "status": (
                        "pending"
                        if build_mode == "reuse" and indexed == 0
                        else "skipped"
                    ),
                },
                "summary": {
                    "indexed": indexed,
                    "total": expected_count,
                    "reused": reused_count,
                    "embedded": embedded_count,
                    "points_upserted": points_upserted,
                },
                "started_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            active_coverage: Dict[str, Any] = {}
            active_archive_coverage: Dict[str, Dict[str, Any]] = {}
            if active:
                try:
                    coverage = index_month_coverage(
                        session_factory,
                        version_id=active.get("version_id"),
                        collection=str(
                            active.get("physical_collection") or ""
                        ),
                        model=str(
                            active.get("embedding_model") or model
                        ),
                    )
                    for item in coverage.get("months") or []:
                        month = str(item.get("month") or "")
                        if not month:
                            continue
                        archive = str(item.get("archive") or "")
                        processed = int(item.get("processed") or 0)
                        total = int(item.get("total") or 0)
                        month_entry = active_coverage.setdefault(
                            month, {"processed": 0, "total": 0}
                        )
                        month_entry["processed"] += processed
                        month_entry["total"] += total
                        if archive:
                            active_archive_coverage.setdefault(month, {})[
                                archive
                            ] = {
                                "processed": processed,
                                "total": total,
                                "percent": item.get("percent"),
                            }
                    for month_entry in active_coverage.values():
                        total = int(month_entry.get("total") or 0)
                        month_entry["percent"] = (
                            round(
                                100.0
                                * int(month_entry.get("processed") or 0)
                                / total,
                                1,
                            )
                            if total
                            else None
                        )
                except Exception:
                    logger.warning(
                        "無法取得 active collection 月份覆蓋", exc_info=True
                    )
            runtime["active_coverage"] = active_coverage
            runtime["active_archive_coverage"] = active_archive_coverage
            try:
                with session_factory() as session:
                    first_pending = session.execute(
                        _version_batch_statement(
                            last_id=last_id,
                            last_month=last_month,
                            month_order=month_order,
                            max_judgment_id=int(
                                snapshot.get("max_judgment_id") or 0
                            ),
                            batch_size=1,
                        )
                    ).mappings().first()
                if first_pending is not None:
                    runtime["current"] = {
                        "month": str(first_pending["issue_month"] or ""),
                        "archive": str(
                            first_pending["source_archive"] or ""
                        ),
                        "jid": str(first_pending["jid"] or ""),
                        "title": str(first_pending["title"] or ""),
                        "court": str(
                            first_pending["court_normalized"] or ""
                        ),
                        "jdate": str(first_pending["jdate"] or ""),
                        "batch_size": 0,
                        "scanned": 0,
                        "indexed": indexed,
                        "preparing": True,
                    }
            except Exception:
                logger.warning("無法取得索引起始月份", exc_info=True)
            state_run_id = state.start_run(
                branch="judgment",
                kind="index",
                title="Qdrant判決向量索引版本建置",
                stages=["ollama", "qdrant", "validate"],
                meta={
                    "index_runtime": runtime,
                    "parent_run_id": parent_run_id()
                    or state_parent_run_id,
                    "version_id": version_id,
                    "collection": collection,
                },
                message=f"準備建置索引版本 v{version_id:03d}。",
            )
            hosts = host_probe.get("hosts") or []
            selected = host_probe.get("selected") or {}
            state.start_stage(
                state_run_id,
                "ollama",
                total=max(1, len(hosts)),
                message="測試 embedding 主機與模型。",
            )
            state.finish_stage(
                state_run_id,
                "ollama",
                status="success",
                current=max(1, len(hosts)),
                total=max(1, len(hosts)),
                message=(
                    f"選用 {selected.get('url') or '—'} · "
                    f"{model} · port {selected.get('port') or '—'}"
                ),
            )
        except Exception:
            logger.warning("無法建立索引處理狀態", exc_info=True)
            state = None
            state_run_id = None
            runtime = None
    active_stage = "qdrant"

    def on_copy_progress(copied: int, total: int) -> None:
        nonlocal last_copy_publish_at
        progress.copy_update(copied, total)
        now = time.perf_counter()
        percent = round(copied / total * 100, 1) if total else None
        if runtime is not None:
            runtime["copy"] = {
                "copied": int(copied),
                "total": int(total),
                "percent": percent,
                "duration_ms": (
                    round((now - copy_started) * 1000, 2)
                    if copy_started
                    else 0
                ),
                "status": "success" if total and copied >= total else "running",
            }
        if state is not None and state_run_id is not None:
            state.update_stage(
                state_run_id,
                "qdrant",
                current=indexed,
                total=expected_count,
                status="running",
                message=f"複製可重用向量 {copied:,} / {total:,} points。",
            )
            if runtime is not None and (
                (total and copied >= total)
                or now - last_copy_publish_at >= 1.0
            ):
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message=(
                        f"複製可重用向量 {copied:,} / {total:,} points。"
                    ),
                )
                last_copy_publish_at = now

    try:
        if state is not None and state_run_id is not None:
            state.start_stage(
                state_run_id,
                "qdrant",
                total=expected_count,
                message="準備逐批判決 embedding 並寫入 Qdrant。",
            )
        if build_mode == "reuse" and previous and indexed == 0:
            source_collection = str(previous["physical_collection"])
            source_info = store.collection_info(source_collection)
            if source_info is None:
                raise QdrantError(
                    f"來源 collection 不存在，無法增量沿用：{source_collection}"
                )
            dimensions = store.collection_dimension(source_collection) or int(
                previous.get("embedding_dimension") or 0
            )
            copy_total = int(source_info.get("points_count") or 0)
            if runtime is not None:
                runtime["copy"] = {
                    "copied": 0,
                    "total": copy_total,
                    "percent": 0.0 if copy_total else None,
                    "duration_ms": 0,
                    "status": "running",
                }
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message=f"複製可重用向量 0 / {copy_total:,} points。",
                )
            copy_started = time.perf_counter()
            store.copy_collection(
                source_collection,
                collection,
                batch_size=256,
                on_progress=on_copy_progress,
            )
            _ensure_judgment_payload_indexes(store, collection)
            update_version_progress(
                session_factory,
                version_id=version_id,
                indexed_count=0,
                last_indexed_id=0,
                embedding_dimension=dimensions,
            )
            copy_ms = (time.perf_counter() - copy_started) * 1000
            if runtime is not None:
                runtime["copy"] = {
                    "copied": copy_total,
                    "total": copy_total,
                    "percent": 100.0 if copy_total else None,
                    "duration_ms": round(copy_ms, 2),
                    "status": "success",
                }
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message="舊 collection 複製完成，開始逐批判決索引。",
                )
            if state is not None and state_run_id is not None:
                state.update_stage(
                    state_run_id,
                    "qdrant",
                    current=0,
                    total=expected_count,
                    status="running",
                    message="舊 collection 複製完成，開始逐批判決索引。",
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
                    _version_batch_statement(
                        last_id=last_id,
                        last_month=last_month,
                        month_order=month_order,
                        max_judgment_id=int(
                            snapshot.get("max_judgment_id") or 0
                        ),
                        batch_size=current_limit,
                    )
                ).mappings().all()
            if not rows:
                break

            scan_started = time.perf_counter()
            last_id = int(rows[-1]["id"])
            last_month = _cursor_month(rows[-1]["issue_month"])
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
                    "jdate_num": _jdate_num(row["jdate"]),
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
                    "valid_from_version_id": version_id,
                    "valid_to_version_id": None,
                    "is_current": True,
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

            batch_reused = len(rows) - len(changed_indices)
            batch_embedded = len(changed_indices)
            current_view = _index_current_view(
                rows,
                scanned=scanned,
                indexed=indexed,
                reused=batch_reused,
                embedded=batch_embedded,
            )
            current_key = (
                current_view["month"],
                current_view["archive"],
            )
            if (
                batch_embedded
                and state is not None
                and state_run_id is not None
                and runtime is not None
            ):
                # Publish the expensive embedding phase before it starts so the
                # current-row can show whether this batch is R or E.
                runtime["current"] = {**current_view, "phase": "embedding"}
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message=(
                        f"計算新 embedding {batch_embedded:,} 筆 · "
                        f"{current_key[0] or '—'} {current_key[1] or '—'}"
                    ),
                )

            if changed_indices and previous:
                previous_version_id = int(previous["version_id"])
                old_point_ids = [
                    vector_point_id(str(rows[index]["jid"]))
                    for index in changed_indices
                    if str(rows[index]["jid"]) in previous_rows
                ]
                if old_point_ids:
                    history_points += _archive_history_points(
                        store,
                        source_collection=str(previous["physical_collection"]),
                        history_collection=history_collection,
                        point_ids=old_point_ids,
                        previous_version_id=previous_version_id,
                        version_id=version_id,
                    )

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
                    _ensure_judgment_payload_indexes(store, collection)
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
                last_indexed_month=last_month if month_order else "",
                embedding_dimension=dimensions,
            )
            if (
                state is not None
                and state_run_id is not None
                and runtime is not None
            ):
                changed_set = set(changed_indices)
                for index, row in enumerate(rows):
                    month = str(row["issue_month"] or "")
                    archive = str(row["source_archive"] or "")
                    key = (month, archive)
                    item = month_runtime.get(key)
                    if item is None:
                        item = {
                            "month": month,
                            "archive": archive,
                            "total": 0,
                            "processed": 0,
                            "reused": 0,
                            "embedded": 0,
                            "percent": None,
                            "status": "pending",
                        }
                        month_runtime[key] = item
                    item["processed"] = int(item["processed"]) + 1
                    item["total"] = max(
                        int(item["total"]), int(item["processed"])
                    )
                    field = "embedded" if index in changed_set else "reused"
                    item[field] = int(item[field]) + 1
                    item["percent"] = (
                        round(
                            100.0
                            * int(item["processed"])
                            / int(item["total"]),
                            1,
                        )
                        if int(item["total"])
                        else None
                    )
                for key, item in month_runtime.items():
                    if key == current_key:
                        item["status"] = "running"
                    elif int(item["total"]) and int(item["processed"]) >= int(
                        item["total"]
                    ):
                        item["status"] = "success"
                    elif int(item["processed"]) > 0:
                        item["status"] = "partial"
                    else:
                        item["status"] = "pending"
                runtime["months"] = sorted(
                    month_runtime.values(),
                    key=lambda item: (item["month"], item["archive"]),
                    reverse=True,
                )
                current_view["scanned"] = scanned
                current_view["indexed"] = indexed
                runtime["current"] = current_view
                runtime["embedding"]["active"] = _active_embedding_view(
                    embedder, model
                )
                runtime["summary"] = {
                    "indexed": indexed,
                    "total": expected_count,
                    "reused": reused_count,
                    "embedded": embedded_count,
                    "points_upserted": points_upserted,
                }
                progress_message = (
                    f"索引 {indexed:,}/{expected_count:,} · "
                    f"{current_key[0] or '—'} {current_key[1] or '—'} · "
                    f"{current_view['jid']}"
                )
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message=progress_message,
                )
                state.update_stage(
                    state_run_id,
                    "qdrant",
                    current=indexed,
                    total=expected_count,
                    status="running",
                    message=progress_message,
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
                                    JudgmentDocument.is_current.is_(True),
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
                history_points += _archive_history_points(
                    store,
                    source_collection=str(previous["physical_collection"]),
                    history_collection=history_collection,
                    point_ids=[vector_point_id(jid) for jid in stale_jids],
                    previous_version_id=previous_version_id,
                    version_id=version_id,
                )
                delete_started = time.perf_counter()
                deleted_points = store.delete_points(
                    collection,
                    [vector_point_id(jid) for jid in stale_jids],
                )
                qdrant_delete_ms = (
                    time.perf_counter() - delete_started
                ) * 1000

        progress.finish(indexed)
        update_version_progress(
            session_factory,
            version_id=version_id,
            indexed_count=indexed,
            last_indexed_id=last_id,
            last_indexed_month=last_month if month_order else "",
            embedding_dimension=dimensions,
        )
        if state is not None and state_run_id is not None:
            state.finish_stage(
                state_run_id,
                "qdrant",
                status="success",
                current=indexed,
                total=expected_count,
                message=f"索引完成：{indexed:,} / {expected_count:,} 筆。",
            )
            state.start_stage(
                state_run_id,
                "validate",
                total=expected_count,
                message="驗證 collection 筆數、維度與 alias。",
            )
        active_stage = "validate"
        validate_started = time.perf_counter()
        version_data = get_version(session_factory, version_id) or {}
        validation = validate_version(
            session_factory, store=store, version=version_data
        )
        validate_ms = (time.perf_counter() - validate_started) * 1000
        activated = None
        if validation.get("status") == "ready" and auto_activate:
            activate_started = time.perf_counter()
            activated = activate_version(
                session_factory,
                store=store,
                version_id=version_id,
                alias_name=settings.judgment_vector_alias,
            )
            activate_ms = (time.perf_counter() - activate_started) * 1000
        duration_ms = int((time.perf_counter() - started) * 1000)
        validation_status = validation.get("status")
        active_embedding = _active_embedding_view(embedder, model)
        selected_host = host_probe.get("selected") or {}
        host_view = {
            "url": active_embedding.get("url") or "",
            "host": active_embedding.get("host") or "",
            "port": active_embedding.get("port"),
            "role": selected_host.get("role") or "primary",
            "model": model,
            "using_fallback": bool(active_embedding.get("using_fallback")),
        }
        embedding_ms = sum(embedding_durations)
        qdrant_ms = sum(qdrant_durations) + qdrant_delete_ms
        db_ms = sum(db_durations)
        timed_ms = (
            probe_ms
            + version_ms
            + copy_ms
            + embedding_ms
            + qdrant_ms
            + db_ms
            + validate_ms
            + activate_ms
        )
        other_ms = max(0.0, float(duration_ms) - timed_ms)
        qdrant_count = int(validation.get("qdrant_count") or 0)
        postgres_count = int(validation.get("postgres_count") or 0)
        if activated:
            activate_detail = (
                f"alias {settings.judgment_vector_alias} → "
                f"v{version_id:03d} / {collection}"
            )
            activate_status = "success"
        elif not auto_activate:
            activate_detail = "未啟用（auto_activate=false），保留舊 alias"
            activate_status = "skipped"
        elif validation_status != "ready":
            activate_detail = "驗證未通過，保留舊 alias"
            activate_status = "failed"
        else:
            activate_detail = "未切換 alias"
            activate_status = "skipped"
        pipeline = {
            "version_id": version_id,
            "collection": collection,
            "alias": settings.judgment_vector_alias,
            "build_mode": build_mode,
            "resumed": resumed,
            "resumed_indexed": resumed_indexed,
            "host": host_view,
            "model": model,
            "total_ms": duration_ms,
            "stages": [
                {
                    "key": "probe",
                    "label": "測試 embedding 主機",
                    "duration_ms": round(probe_ms, 2),
                    "status": "success",
                    "detail": (
                        f"{len(host_probe.get('hosts') or []):,} 台主機 · "
                        f"{host_view['host'] or '—'}:{host_view['port'] or '—'} · {model}"
                    ),
                    "host": host_view,
                    "model": model,
                },
                {
                    "key": "version",
                    "label": "建立／接續 Blue-Green collection",
                    "duration_ms": round(version_ms, 2),
                    "status": "success",
                    "detail": (
                        f"接續 v{version_id:03d} · 已索引 {resumed_indexed:,} 筆"
                        if resumed
                        else f"建立 v{version_id:03d} · {collection}"
                    ),
                },
                {
                    "key": "copy",
                    "label": "複製可重用向量",
                    "duration_ms": round(copy_ms, 2),
                    "status": "success" if copy_ms > 0 else "skipped",
                    "detail": (
                        f"累計重用 {reused_count:,} 筆"
                        if copy_ms > 0
                        else (
                            "接續版本已跳過複製"
                            if resumed
                            else "本次無可複製向量"
                        )
                    ),
                },
                {
                    "key": "embedding",
                    "label": "差異 embedding",
                    "duration_ms": round(embedding_ms, 2),
                    "status": "success",
                    "detail": f"新 embedding {embedded_count:,} 筆",
                    "host": host_view,
                    "model": model,
                },
                {
                    "key": "qdrant",
                    "label": "Qdrant 寫入／刪除",
                    "duration_ms": round(qdrant_ms, 2),
                    "status": "success",
                    "detail": (
                        f"寫入 {points_upserted:,} 點 · 刪除 {deleted_points:,} 點"
                    ),
                },
                {
                    "key": "postgres",
                    "label": "PostgreSQL 索引紀錄",
                    "duration_ms": round(db_ms, 2),
                    "status": "success",
                    "detail": f"索引紀錄 {indexed:,} 筆",
                },
                {
                    "key": "validate",
                    "label": "驗證新版本",
                    "duration_ms": round(validate_ms, 2),
                    "status": (
                        "success" if validation_status == "ready" else "failed"
                    ),
                    "detail": (
                        f"{validation_status or '—'} · Qdrant {qdrant_count:,} · "
                        f"PostgreSQL {postgres_count:,} · {dimensions}D"
                    ),
                },
                {
                    "key": "activate",
                    "label": "原子切換 alias",
                    "duration_ms": round(activate_ms, 2),
                    "status": activate_status,
                    "detail": activate_detail,
                },
                {
                    "key": "report",
                    "label": "掃描與效能紀錄收尾",
                    "duration_ms": round(other_ms, 2),
                    "status": "success",
                    "detail": "performance_records · 執行資訊",
                },
            ],
        }
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
            "history_collection": history_collection,
            "history_points": history_points,
            "dimensions": dimensions,
            "duration_ms": duration_ms,
            "batch_count": len(batch_durations),
            "progress": _downsample_progress(progress_samples),
            "validation": validation,
            "activated": activated,
            "task": run_label,
            "embedding_host": host_probe.get("selected"),
            "host_tests": host_probe.get("hosts"),
            "pipeline": pipeline,
        }
        if state is not None and state_run_id is not None:
            ready = validation_status == "ready"
            if runtime is not None:
                runtime["status"] = "success" if ready else "failed"
                runtime["finished_at"] = datetime.now(timezone.utc).isoformat()
                runtime["summary"] = {
                    "indexed": indexed,
                    "total": expected_count,
                    "reused": reused_count,
                    "embedded": embedded_count,
                    "points_upserted": points_upserted,
                }
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message="索引驗證完成。" if ready else "索引驗證失敗。",
                )
            state.finish_stage(
                state_run_id,
                "validate",
                status="success" if ready else "failed",
                current=indexed,
                total=expected_count,
                message=(
                    f"驗證 {validation_status or 'failed'}；"
                    + (
                        f"alias 已切換到 v{int(activated.get('version_id') or 0):03d}。"
                        if activated
                        else "alias 未切換。"
                    )
                ),
            )
            state.finish_run(
                state_run_id,
                status="success" if ready else "failed",
                message=(
                    f"索引版本 v{version_id:03d} 完成："
                    f"{indexed:,} 筆，驗證 {validation_status or 'failed'}。"
                    if ready
                    else f"索引版本 v{version_id:03d} 驗證失敗。"
                ),
                counts={
                    "indexed_count": indexed,
                    "reused_count": reused_count,
                    "embedded_count": embedded_count,
                    "points_upserted": points_upserted,
                },
            )
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
        if state is not None and state_run_id is not None:
            message = f"{exc.__class__.__name__}: {exc}"
            try:
                state.finish_stage(
                    state_run_id,
                    active_stage,
                    status="failed",
                    current=indexed,
                    total=expected_count,
                    message=message,
                )
            except Exception:
                logger.warning("無法標記索引階段失敗", exc_info=True)
            if runtime is not None:
                runtime["status"] = "failed"
                runtime["error"] = message
                runtime["finished_at"] = datetime.now(timezone.utc).isoformat()
                _publish_index_runtime(
                    state,
                    state_run_id,
                    runtime,
                    message=f"索引失敗：{message}",
                )
            state.finish_run(
                state_run_id,
                status="failed",
                message=f"索引版本 v{version_id:03d} 失敗：{message}",
            )
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
    host = summary.get("embedding_host") or {}
    if host:
        print(
            f"  llama-server：{host.get('url') or '—'} · {host.get('model') or '—'}"
            f" · port {host.get('port') or '—'}"
        )
    print(
        f"  文件：{int(summary.get('indexed_count') or 0):,}"
        f" / {int(summary.get('document_count') or 0):,}"
    )
    print(f"  重用：{int(summary.get('reused_count') or 0):,}")
    print(f"  新 embedding：{int(summary.get('embedded_count') or 0):,}")
    print(f"  Qdrant points：{int(summary.get('points_upserted') or 0):,}")
    print(f"  刪除 points：{int(summary.get('deleted_points') or 0):,}")
    print(
        f"  History points：{int(summary.get('history_points') or 0):,}"
        f"（{summary.get('history_collection') or '—'}）"
    )
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
    parser.add_argument("--embedding-url", default=None, help="Embedding base URL")
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
    if not args.embedding_url and not args.embedding_model:
        settings = runtime_settings(settings, session_factory)
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
                track_state=True,
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
