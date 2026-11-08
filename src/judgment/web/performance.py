from __future__ import annotations

import json
import math
import time
from datetime import date, datetime, time as dt_time, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import Text, cast, func, or_, select
from sqlalchemy.orm import Session, sessionmaker

from ..models import (
    PerformanceRecord,
    PerformanceTestRun,
    PerformanceTestStep,
)

DEFAULT_PAGE_SIZE = 25
MAX_PAGE_SIZE = 200

COLUMNS = [
    {"key": "id", "label": "ID", "type": "number"},
    {"key": "started_at", "label": "Timestamp", "type": "datetime"},
    {"key": "process", "label": "程序", "type": "text"},
    {"key": "module", "label": "模組", "type": "mono"},
    {"key": "status", "label": "狀態", "type": "status"},
    {"key": "duration_ms", "label": "總耗時", "type": "duration"},
    {"key": "flow_segments", "label": "Flow 段數", "type": "number"},
    {"key": "flow_models", "label": "模型", "type": "text"},
    {"key": "method", "label": "方法", "type": "mono"},
    {"key": "path", "label": "路徑", "type": "mono"},
    {"key": "status_code", "label": "HTTP", "type": "number"},
    {"key": "request_id", "label": "Request ID", "type": "mono"},
    {"key": "params_text", "label": "參數", "type": "longtext"},
    {"key": "flow", "label": "Flow JSON", "type": "longtext"},
]

SORTABLE = {
    "started_at": PerformanceRecord.started_at,
    "duration_ms": PerformanceRecord.duration_ms,
    "id": PerformanceRecord.id,
}


def _parse_date(value: Any) -> Optional[date]:
    if value is None or value == "":
        return None
    text = str(value).strip()
    for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    return None


def _start_of_day(value: Any) -> Optional[datetime]:
    parsed = _parse_date(value)
    if parsed is None:
        return None
    return datetime.combine(parsed, dt_time.min, tzinfo=timezone.utc)


def _end_of_day(value: Any) -> Optional[datetime]:
    parsed = _parse_date(value)
    if parsed is None:
        return None
    return datetime.combine(parsed, dt_time.max, tzinfo=timezone.utc)


def _clean_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _clamp_page(page: Any, page_size: Any) -> Tuple[int, int]:
    current = max(1, _clean_int(page, 1) or 1)
    size = _clean_int(page_size, DEFAULT_PAGE_SIZE) or DEFAULT_PAGE_SIZE
    return current, max(1, min(MAX_PAGE_SIZE, size))


def _apply_filters(statement, filters: Dict[str, Any]):
    for key in ("process", "module", "status", "method"):
        value = str(filters.get(key) or "").strip()
        if value:
            statement = statement.where(getattr(PerformanceRecord, key) == value)

    model = str(filters.get("model") or "").strip()
    if model:
        statement = statement.where(
            cast(PerformanceRecord.flow, Text).ilike(f'%"{model}"%')
        )

    keyword = str(filters.get("keyword") or "").strip()
    if keyword:
        pattern = f"%{keyword}%"
        statement = statement.where(
            or_(
                PerformanceRecord.process.ilike(pattern),
                PerformanceRecord.module.ilike(pattern),
                PerformanceRecord.path.ilike(pattern),
                PerformanceRecord.request_id.ilike(pattern),
                PerformanceRecord.error_message.ilike(pattern),
                cast(PerformanceRecord.flow, Text).ilike(pattern),
            )
        )

    date_from = _start_of_day(filters.get("from_date"))
    if date_from:
        statement = statement.where(PerformanceRecord.started_at >= date_from)
    date_to = _end_of_day(filters.get("to_date"))
    if date_to:
        statement = statement.where(PerformanceRecord.started_at <= date_to)

    min_duration = _clean_int(filters.get("min_duration"))
    if min_duration is not None:
        statement = statement.where(PerformanceRecord.duration_ms >= min_duration)

    return statement


def _describe_filters(filters: Dict[str, Any]) -> List[str]:
    parts: List[str] = []
    for key in ("process", "module", "status", "method"):
        value = str(filters.get(key) or "").strip()
        if value:
            parts.append(f"{key} = '{value}'")
    keyword = str(filters.get("keyword") or "").strip()
    if keyword:
        parts.append(f"keyword ≈ '{keyword}'")
    if filters.get("model"):
        parts.append(f"flow.model = '{filters['model']}'")
    if filters.get("from_date"):
        parts.append(f"started_at >= '{filters['from_date']}'")
    if filters.get("to_date"):
        parts.append(f"started_at <= '{filters['to_date']}'")
    min_duration = _clean_int(filters.get("min_duration"))
    if min_duration is not None:
        parts.append(f"duration_ms >= {min_duration}")
    return parts


def _sort_parts(filters: Dict[str, Any]) -> Tuple[str, str]:
    raw = str(filters.get("sort") or "started_at:desc")
    if ":" in raw:
        key, direction = raw.split(":", 1)
    else:
        key, direction = raw, "desc"
    direction = "asc" if direction.lower() == "asc" else "desc"
    if key not in SORTABLE:
        key = "started_at"
        direction = "desc"
    return key, direction


def _options(
    session_factory: sessionmaker[Session],
    column,
    limit: int = 200,
) -> List[str]:
    try:
        with session_factory() as session:
            statement = (
                select(column)
                .where(column.is_not(None), column != "")
                .distinct()
                .order_by(column)
                .limit(limit)
            )
            return [str(value) for value in session.scalars(statement) if value]
    except Exception:
        return []


def _flow_models(
    session_factory: sessionmaker[Session],
    limit: int = 2000,
) -> List[str]:
    models = set()
    try:
        with session_factory() as session:
            flows = session.scalars(
                select(PerformanceRecord.flow)
                .where(PerformanceRecord.flow.isnot(None))
                .order_by(PerformanceRecord.started_at.desc())
                .limit(limit)
            ).all()
        for flow in flows:
            if not isinstance(flow, dict):
                continue
            for model in (flow.get("summary") or {}).get("models") or []:
                value = str(model).strip()
                if value:
                    models.add(value)
    except Exception:
        return []
    return sorted(models)


def performance_options(
    session_factory: sessionmaker[Session],
) -> Dict[str, List[str]]:
    return {
        "processes": _options(session_factory, PerformanceRecord.process),
        "modules": _options(session_factory, PerformanceRecord.module),
        "statuses": _options(session_factory, PerformanceRecord.status),
        "methods": _options(session_factory, PerformanceRecord.method),
        "models": _flow_models(session_factory),
    }


def _flow_models_from_segments(segments: List[Any]) -> List[str]:
    models = []
    for segment in segments:
        if not isinstance(segment, dict):
            continue
        params = segment.get("params") or {}
        if not isinstance(params, dict):
            continue
        for key in ("model", "embedding_model", "llm_model", "model_name"):
            value = params.get(key)
            if isinstance(value, str) and value.strip() and value not in models:
                models.append(value.strip())
        nested = params.get("models")
        if isinstance(nested, (list, tuple)):
            for value in nested:
                value = str(value).strip()
                if value and value not in models:
                    models.append(value)
    return models


def _flow_stats(flows: List[Any]) -> Dict[str, Any]:
    segment_stats: Dict[str, Dict[str, Any]] = {}
    model_counts: Dict[str, int] = {}
    model_stats: Dict[str, Dict[str, Any]] = {}
    flow_count = 0
    total_segments = 0
    max_segments = 0
    slowest: Optional[Dict[str, Any]] = None
    client_totals: List[int] = []
    client_renders: List[int] = []

    for flow in flows:
        if not isinstance(flow, dict):
            continue
        segments = flow.get("segments")
        segments = segments if isinstance(segments, list) else []
        flow_count += 1
        total_segments += len(segments)
        max_segments = max(max_segments, len(segments))

        summary = flow.get("summary") or {}
        models = [
            str(model)
            for model in (summary.get("models") or [])
            if str(model).strip()
        ]
        if not models:
            models = _flow_models_from_segments(segments)
        for model in models:
            model_counts[model] = model_counts.get(model, 0) + 1

        for segment in segments:
            if not isinstance(segment, dict):
                continue
            name = str(segment.get("name") or "unnamed")
            duration = float(segment.get("duration_ms") or 0)
            bucket = segment_stats.setdefault(
                name,
                {"count": 0, "total_ms": 0.0, "max_ms": 0.0},
            )
            bucket["count"] += 1
            bucket["total_ms"] += duration
            bucket["max_ms"] = max(bucket["max_ms"], duration)
            params = segment.get("params") or {}
            model = params.get("model") if isinstance(params, dict) else None
            if (
                isinstance(model, str)
                and model.strip()
                and (name.endswith("embed_query") or name == "rag.llm")
            ):
                model_bucket = model_stats.setdefault(
                    model.strip(), {"segments": 0, "total_ms": 0.0}
                )
                model_bucket["segments"] += 1
                model_bucket["total_ms"] += duration
            if slowest is None or duration > float(slowest.get("duration_ms") or 0):
                slowest = {
                    "name": name,
                    "module": segment.get("module"),
                    "function": segment.get("function"),
                    "duration_ms": round(duration, 2),
                }

        client = flow.get("client") or {}
        if isinstance(client, dict):
            total_ms = int(client.get("total_ms") or 0)
            render_ms = int(client.get("render_ms") or 0)
            if total_ms > 0:
                client_totals.append(total_ms)
            if render_ms >= 0 and total_ms > 0:
                client_renders.append(render_ms)

    segment_rows = []
    for name, bucket in segment_stats.items():
        if name in {"http.request", "api.endpoint", "rag.llm_request"}:
            continue
        count = int(bucket["count"])
        total_ms = round(float(bucket["total_ms"]), 2)
        segment_rows.append(
            {
                "label": name,
                "value": round(total_ms / count) if count else 0,
                "count": count,
                "total_ms": total_ms,
                "avg_ms": round(total_ms / count, 2) if count else 0,
                "max_ms": round(float(bucket["max_ms"]), 2),
            }
        )
    segment_rows.sort(key=lambda item: item["avg_ms"], reverse=True)

    return {
        "sample_size": flow_count,
        "avg_segments": round(total_segments / flow_count, 1) if flow_count else 0,
        "max_segments": max_segments,
        "models": [
            {
                "label": model,
                "value": count,
                "segment_count": model_stats.get(model, {}).get("segments", 0),
                "total_ms": round(
                    float(model_stats.get(model, {}).get("total_ms") or 0), 2
                ),
                "avg_ms": round(
                    float(model_stats.get(model, {}).get("total_ms") or 0)
                    / int(model_stats.get(model, {}).get("segments") or 1),
                    2,
                )
                if model_stats.get(model, {}).get("segments")
                else 0,
            }
            for model, count in sorted(
                model_counts.items(), key=lambda item: item[1], reverse=True
            )
        ],
        "segments": segment_rows[:12],
        "slowest": slowest,
        "client": {
            "samples": len(client_totals),
            "avg_total_ms": round(sum(client_totals) / len(client_totals))
            if client_totals
            else 0,
            "avg_render_ms": round(sum(client_renders) / len(client_renders))
            if client_renders
            else 0,
        },
    }


INDEX_PROCESS_PREFIX = "判決向量索引"


def _as_int(value: Any, default: int = 0) -> int:
    try:
        return int(value or default)
    except (TypeError, ValueError):
        return default


def _as_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value or default)
    except (TypeError, ValueError):
        return default


def _format_duration_ms(value: Any) -> str:
    ms = max(0, _as_int(value))
    seconds = int(round(ms / 1000))
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}h {minutes:02d}m {secs:02d}s"
    if minutes:
        return f"{minutes}m {secs:02d}s"
    return f"{seconds}s"


def _index_run(record: PerformanceRecord) -> Dict[str, Any]:
    """Normalize one index run, including records written before timings existed."""
    details = record.details if isinstance(record.details, dict) else {}
    params = record.params if isinstance(record.params, dict) else {}
    indexed = _as_int(details.get("indexed_count"))
    scanned = _as_int(details.get("scanned_count"))
    duration_ms = _as_int(record.duration_ms)
    batch_size = _as_int(params.get("batch_size"))
    batch_count = _as_int(details.get("batch_count"))
    if not batch_count and batch_size and indexed:
        batch_count = int(math.ceil(indexed / batch_size))
    points_per_second = _as_float(details.get("points_per_second"))
    if points_per_second <= 0 and duration_ms > 0 and indexed:
        points_per_second = indexed / (duration_ms / 1000.0)
    batch_avg_ms = _as_float(details.get("batch_avg_ms"))
    if batch_avg_ms <= 0 and batch_count and duration_ms:
        batch_avg_ms = duration_ms / batch_count

    embedding_ms = _as_int(details.get("embedding_ms"))
    qdrant_ms = _as_int(details.get("qdrant_ms"))
    db_write_ms = _as_int(details.get("db_write_ms"))
    breakdown_total = embedding_ms + qdrant_ms + db_write_ms
    time_breakdown: List[Dict[str, Any]] = []
    if breakdown_total > 0:
        other_ms = max(0, duration_ms - breakdown_total)
        for key, label, value in (
            ("embedding", "Ollama Embedding", embedding_ms),
            ("qdrant", "Qdrant Upsert", qdrant_ms),
            ("db", "PostgreSQL 索引紀錄", db_write_ms),
            ("other", "其他", other_ms),
        ):
            percent = (100.0 * value / duration_ms) if duration_ms else 0.0
            time_breakdown.append(
                {
                    "key": key,
                    "label": label,
                    "ms": value,
                    "percent": round(percent, 2),
                }
            )

    progress = details.get("progress")
    progress = progress if isinstance(progress, list) else []
    coverage = details.get("coverage")
    coverage = coverage if isinstance(coverage, dict) else {}

    return {
        "id": record.id,
        "started_at": record.started_at,
        "status": record.status,
        "task": str(details.get("task") or params.get("task") or ""),
        "indexed_count": indexed,
        "scanned_count": scanned,
        "duration_ms": duration_ms,
        "batch_size": batch_size,
        "batch_count": batch_count,
        "batch_avg_ms": round(batch_avg_ms, 2),
        "batch_min_ms": _as_float(details.get("batch_min_ms")),
        "batch_max_ms": _as_float(details.get("batch_max_ms")),
        "batch_p50_ms": _as_float(details.get("batch_p50_ms")),
        "points_per_second": round(points_per_second, 2),
        "max_chars": _as_int(params.get("max_chars")),
        "collection_points": _as_int(details.get("collection_points")),
        "coverage": {
            "total_judgments": _as_int(coverage.get("total_judgments")),
            "indexed_judgments": _as_int(coverage.get("indexed_judgments")),
            "remaining_judgments": _as_int(coverage.get("remaining_judgments")),
        }
        if coverage
        else {},
        "time_breakdown": time_breakdown,
        "progress": progress[:240],
    }


def _index_stats(records: List[PerformanceRecord]) -> Optional[Dict[str, Any]]:
    if not records:
        return None
    runs = [_index_run(record) for record in records]
    latest = runs[-1]
    total_indexed = sum(run["indexed_count"] for run in runs)
    total_seconds = sum(run["duration_ms"] for run in runs) / 1000.0
    total_batches = sum(run["batch_count"] for run in runs)
    weighted_batch_ms = sum(
        run["batch_avg_ms"] * run["batch_count"] for run in runs
    )
    return {
        "run_count": len(runs),
        "latest": latest,
        "runs": runs,
        "average": {
            "points_per_second": round(
                total_indexed / total_seconds, 2
            )
            if total_seconds > 0
            else 0,
            "duration_ms": int(
                sum(run["duration_ms"] for run in runs) / len(runs)
            ),
            "batch_avg_ms": round(weighted_batch_ms / total_batches, 2)
            if total_batches
            else 0,
            "indexed_count": int(total_indexed / len(runs)),
        },
    }


def query_performance(
    *,
    session_factory: sessionmaker[Session],
    filters: Dict[str, Any],
    page: Any = 1,
    page_size: Any = DEFAULT_PAGE_SIZE,
) -> Dict[str, Any]:
    started = time.perf_counter()
    current_page, current_size = _clamp_page(page, page_size)
    sort_key, sort_direction = _sort_parts(filters)

    with session_factory() as session:
        count_stmt = _apply_filters(
            select(func.count()).select_from(PerformanceRecord), filters
        )
        total = int(session.scalar(count_stmt) or 0)

        success_stmt = _apply_filters(
            select(func.count()).select_from(PerformanceRecord), filters
        ).where(PerformanceRecord.status.notin_(["failed", "error"]))
        success = int(session.scalar(success_stmt) or 0)

        durations = [
            int(value or 0)
            for value in session.scalars(
                _apply_filters(
                    select(PerformanceRecord.duration_ms), filters
                )
            ).all()
        ]

        order_column = SORTABLE[sort_key]
        ordering = (
            order_column.asc()
            if sort_direction == "asc"
            else order_column.desc()
        )
        records = session.scalars(
            _apply_filters(select(PerformanceRecord), filters)
            .order_by(ordering, PerformanceRecord.id.asc())
            .offset((current_page - 1) * current_size)
            .limit(current_size)
        ).all()

        flow_records = session.scalars(
            _apply_filters(
                select(PerformanceRecord.flow).where(
                    PerformanceRecord.flow.isnot(None)
                ),
                filters,
            )
            .order_by(PerformanceRecord.started_at.desc())
            .limit(1000)
        ).all()

        request_ids = [
            record.request_id
            for record in records
            if record.process == "RAG 問答" and record.request_id
        ]
        test_runs: Dict[str, PerformanceTestRun] = {}
        test_llm_steps: Dict[str, List[PerformanceTestStep]] = {}
        if request_ids:
            runs = session.scalars(
                select(PerformanceTestRun).where(
                    PerformanceTestRun.request_id.in_(request_ids)
                )
            ).all()
            test_runs = {run.request_id: run for run in runs}
            run_ids = [run.run_id for run in runs]
            if run_ids:
                steps = session.scalars(
                    select(PerformanceTestStep).where(
                        PerformanceTestStep.run_id.in_(run_ids),
                        PerformanceTestStep.stage == "llm",
                    )
                ).all()
                for step in steps:
                    test_llm_steps.setdefault(step.run_id, []).append(step)

        distribution_rows = session.execute(
            _apply_filters(
                select(PerformanceRecord.process, func.count()),
                filters,
            )
            .group_by(PerformanceRecord.process)
            .order_by(func.count().desc())
            .limit(8)
        ).all()

        index_records = session.scalars(
            _apply_filters(
                select(PerformanceRecord).where(
                    PerformanceRecord.process.like(f"{INDEX_PROCESS_PREFIX}%")
                ),
                filters,
            )
            .order_by(PerformanceRecord.started_at.desc())
            .limit(30)
        ).all()
        index_stats = _index_stats(list(reversed(index_records)))

        rows = []
        for record in records:
            flow = record.flow if isinstance(record.flow, dict) else None
            if flow and record.process == "RAG 問答":
                metadata = dict(flow.get("metadata") or {})
                if not metadata.get("question"):
                    test_run = test_runs.get(record.request_id)
                    if test_run is not None:
                        metadata["question"] = test_run.question
                        metadata["test_run_id"] = test_run.run_id
                        answer = test_run.answer
                        if not answer:
                            primary_model = (test_run.summary or {}).get(
                                "primary_model"
                            )
                            candidates = test_llm_steps.get(
                                test_run.run_id, []
                            )
                            step = next(
                                (
                                    item
                                    for item in candidates
                                    if item.model == primary_model
                                    and (item.details or {}).get(
                                        "answer_preview"
                                    )
                                ),
                                None,
                            )
                            if step is None:
                                step = next(
                                    (
                                        item
                                        for item in candidates
                                        if (item.details or {}).get(
                                            "answer_preview"
                                        )
                                    ),
                                    None,
                                )
                            if step is not None:
                                answer = (step.details or {}).get(
                                    "answer_preview"
                                )
                        if answer:
                            metadata["answer"] = answer
                        flow = {**flow, "metadata": metadata}
            summary = (flow or {}).get("summary") or {}
            segments = (flow or {}).get("segments") or []
            rows.append(
                {
                    "id": record.id,
                    "started_at": record.started_at,
                    "process": record.process,
                    "module": record.module,
                    "status": record.status,
                    "duration_ms": record.duration_ms,
                    "flow_segments": len(segments) if isinstance(segments, list) else 0,
                    "flow_models": ", ".join(summary.get("models") or []),
                    "flow": flow,
                    "method": record.method,
                    "path": record.path,
                    "status_code": record.status_code,
                    "request_id": record.request_id,
                    "params_text": json.dumps(
                        record.params or {}, ensure_ascii=False
                    ),
                }
            )
        flow_stats = _flow_stats(list(flow_records))

    durations.sort()
    avg_duration = sum(durations) / len(durations) if durations else 0
    if durations:
        p95_index = max(0, min(len(durations) - 1, int(round(len(durations) * 0.95)) - 1))
        p95_duration = durations[p95_index]
    else:
        p95_duration = 0
    success_rate = (success / total * 100) if total else 0
    query_duration_ms = int((time.perf_counter() - started) * 1000)

    where = _describe_filters(filters)
    offset = (current_page - 1) * current_size
    query_text = (
        "SELECT id, started_at, process, module, status, duration_ms, method, path, "
        "status_code, request_id, params, flow\nFROM performance_records"
        + (("\nWHERE " + "\n  AND ".join(where)) if where else "")
        + f"\nORDER BY {sort_key} {sort_direction.upper()}"
        + f"\nLIMIT {current_size} OFFSET {offset}"
    )

    summary = [
        {"label": "符合筆數", "value": f"{total:,}"},
        {"label": "成功率", "value": f"{success_rate:.1f}%"},
        {"label": "平均耗時", "value": f"{avg_duration:.0f} ms"},
        {"label": "P95 耗時", "value": f"{p95_duration:,} ms"},
        {"label": "平均段數", "value": f"{flow_stats['avg_segments']:.1f}"},
    ]
    if index_stats:
        latest = index_stats["latest"]
        summary.extend(
            [
                {
                    "label": "索引執行筆數",
                    "value": f"{latest['indexed_count']:,}",
                },
                {
                    "label": "平均每秒筆數",
                    "value": f"{latest['points_per_second']:.1f}",
                },
                {
                    "label": "索引使用時間",
                    "value": _format_duration_ms(latest["duration_ms"]),
                },
                {
                    "label": "平均每批時間",
                    "value": _format_duration_ms(latest["batch_avg_ms"]),
                },
            ]
        )

    return {
        "database": "performance",
        "label": "效能報表",
        "status": "ok",
        "message": None,
        "table": "performance_records",
        "columns": COLUMNS,
        "rows": rows,
        "total": total,
        "page": current_page,
        "page_size": current_size,
        "duration_ms": query_duration_ms,
        "summary": summary,
        "index_stats": index_stats,
        "distribution": [
            {"label": str(label or "未命名"), "value": int(count)}
            for label, count in distribution_rows
        ],
        "flow_stats": flow_stats,
        "query_text": query_text,
        "warnings": [
            "Flow 統計取最近 1000 筆符合條件的紀錄；平均段數與區段耗時只計算有 flow 的紀錄。",
            "索引效能取最近 30 筆符合條件的判決向量索引紀錄；舊紀錄若無階段計時，會由總耗時與 batch_size 推算。",
        ],
        "meta": {
            "table": "performance_records",
            "table_label": "效能紀錄",
            "filters": filters,
            "sort": {"key": sort_key, "direction": sort_direction},
            "flow_stats": flow_stats,
        },
    }
