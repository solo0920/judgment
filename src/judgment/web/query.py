from __future__ import annotations

import difflib
from functools import reduce
import json
import logging
import re
import time
from datetime import date, datetime, time as dt_time, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.dataset as ds
import pyarrow.parquet as pq
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..embeddings import EmbeddingError, OllamaEmbedder
from ..judgment_raw_parquet import raw_judgment_files
from ..models import (
    DownloadRun,
    JudgmentDocument,
    JudgmentImportRun,
    LawArticleChangeEvent,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
)
from ..observability import trace_segment, traced
from ..vector_store import QdrantError, QdrantStore
from .catalog import JUDGMENT_PARQUET_COLUMNS, PARQUET_COLUMNS, POSTGRES_TABLES

logger = logging.getLogger(__name__)

MAX_PAGE_SIZE = 200
DEFAULT_PAGE_SIZE = 25

TABLE_MODELS = {
    "law_documents": LawDocument,
    "law_dataset_versions": LawDatasetVersion,
    "download_runs": DownloadRun,
    "judgment_documents": JudgmentDocument,
    "judgment_import_runs": JudgmentImportRun,
}

TABLE_COLUMNS: Dict[str, List[Dict[str, str]]] = {
    "law_documents": [
        {"key": "law_name", "label": "法規名稱", "type": "text"},
        {"key": "source_type", "label": "類型", "type": "source"},
        {"key": "law_level", "label": "位階", "type": "text"},
        {"key": "law_category", "label": "類別", "type": "text"},
        {
            "key": "law_modified_date",
            "label": "異動日期",
            "type": "date",
            "format": "yyyymmdd",
        },
        {"key": "article_count", "label": "條文數", "type": "number"},
        {"key": "is_current", "label": "現行", "type": "boolean"},
        {"key": "law_url", "label": "來源", "type": "url"},
        {"key": "content_hash", "label": "內容雜湊", "type": "mono"},
    ],
    "law_dataset_versions": [
        {"key": "id", "label": "版本 ID", "type": "number"},
        {"key": "source_type", "label": "類型", "type": "source"},
        {"key": "update_date", "label": "來源更新日", "type": "text"},
        {"key": "law_count", "label": "法規數", "type": "number"},
        {"key": "article_count", "label": "條文數", "type": "number"},
        {"key": "is_current", "label": "現行", "type": "boolean"},
        {"key": "downloaded_at", "label": "下載時間", "type": "datetime"},
        {"key": "parquet_path", "label": "Parquet", "type": "mono"},
        {"key": "zip_path", "label": "原始 ZIP", "type": "mono"},
    ],
    "download_runs": [
        {"key": "id", "label": "Run ID", "type": "number"},
        {"key": "source_type", "label": "類型", "type": "source"},
        {"key": "status", "label": "狀態", "type": "status"},
        {"key": "started_at", "label": "開始時間", "type": "datetime"},
        {"key": "finished_at", "label": "完成時間", "type": "datetime"},
        {"key": "duration_ms", "label": "耗時", "type": "duration"},
        {"key": "http_status", "label": "HTTP", "type": "number"},
        {"key": "law_count", "label": "法規數", "type": "number"},
        {"key": "article_count", "label": "條文數", "type": "number"},
        {"key": "version_id", "label": "版本 ID", "type": "number"},
        {"key": "error_message", "label": "錯誤", "type": "text"},
    ],
    "judgment_documents": [
        {"key": "jid", "label": "案號", "type": "mono"},
        {"key": "court", "label": "法院", "type": "text"},
        {"key": "title", "label": "案由", "type": "longtext"},
        {"key": "jdate", "label": "裁判日期", "type": "date"},
        {"key": "matched_laws", "label": "命中法規", "type": "longtext"},
        {"key": "citation_count", "label": "引用數", "type": "number"},
        {"key": "source_archive", "label": "來源", "type": "mono"},
        {"key": "full_text_length", "label": "全文長度", "type": "number"},
    ],
    "judgment_import_runs": [
        {"key": "id", "label": "Run ID", "type": "number"},
        {"key": "status", "label": "狀態", "type": "status"},
        {"key": "started_at", "label": "開始時間", "type": "datetime"},
        {"key": "finished_at", "label": "完成時間", "type": "datetime"},
        {"key": "duration_ms", "label": "耗時", "type": "duration"},
        {"key": "archive_count", "label": "壓縮檔數", "type": "number"},
        {"key": "scanned_count", "label": "掃描數", "type": "number"},
        {"key": "matched_count", "label": "命中數", "type": "number"},
        {"key": "stored_count", "label": "寫入數", "type": "number"},
        {"key": "failed_count", "label": "失敗數", "type": "number"},
        {"key": "citation_count", "label": "引用數", "type": "number"},
        {"key": "error_message", "label": "錯誤", "type": "text"},
    ],
}

TABLE_SEARCH_COLUMNS = {
    "law_documents": (
        LawDocument.law_name,
        LawDocument.law_category,
        LawDocument.eng_law_name,
        LawDocument.law_effective_note,
    ),
    "judgment_documents": (
        JudgmentDocument.jid,
        JudgmentDocument.court,
        JudgmentDocument.court_normalized,
        JudgmentDocument.title,
        JudgmentDocument.matched_laws_text,
    ),
}

SORTABLE = {
    "law_documents": {
        "law_name": LawDocument.law_name,
        "article_count": LawDocument.article_count,
        "law_modified_date": LawDocument.law_modified_date,
        "id": LawDocument.id,
    },
    "law_dataset_versions": {
        "id": LawDatasetVersion.id,
        "law_count": LawDatasetVersion.law_count,
        "downloaded_at": LawDatasetVersion.downloaded_at,
        "law_name": LawDatasetVersion.id,
        "article_count": LawDatasetVersion.article_count,
        "law_modified_date": LawDatasetVersion.downloaded_at,
    },
    "download_runs": {
        "started_at": DownloadRun.started_at,
        "id": DownloadRun.id,
        "law_name": DownloadRun.id,
        "article_count": DownloadRun.article_count,
        "law_modified_date": DownloadRun.started_at,
    },
    "judgment_documents": {
        "jid": JudgmentDocument.jid,
        "court": JudgmentDocument.court_normalized,
        "title": JudgmentDocument.title,
        "jdate": JudgmentDocument.jdate,
        "matched_laws": JudgmentDocument.matched_laws_text,
        "citation_count": JudgmentDocument.citation_count,
        "id": JudgmentDocument.id,
    },
    "judgment_import_runs": {
        "id": JudgmentImportRun.id,
        "started_at": JudgmentImportRun.started_at,
        "status": JudgmentImportRun.status,
    },
}

PARQUET_LABELS = {item["value"]: item["label"] for item in PARQUET_COLUMNS}
PARQUET_DEFAULT_COLUMNS = [
    "law_name",
    "law_level",
    "law_category",
    "law_modified_date",
    "article_count",
]
PARQUET_REQUIRED_COLUMNS = [
    "source_type",
    "source_update_date",
    "law_key",
    "law_name",
    "law_level",
    "law_category",
    "law_modified_date",
    "article_count",
    "content_hash",
]
JUDGMENT_PARQUET_LABELS = {
    item["value"]: item["label"] for item in JUDGMENT_PARQUET_COLUMNS
}
JUDGMENT_PARQUET_DEFAULT_COLUMNS = [
    "jid",
    "court_normalized",
    "title",
    "jdate",
    "matched_laws",
    "citation_count",
]
JUDGMENT_PARQUET_REQUIRED_COLUMNS = [
    "jid",
    "court",
    "court_normalized",
    "title",
    "jdate",
    "matched_laws",
    "matched_laws_text",
    "citation_count",
    "full_text_length",
    "source_archive",
    "pdf_url",
]

PARQUET_DETAIL_COLUMNS = [
    "law_key",
    "source_type",
    "law_name",
    "law_level",
    "law_category",
    "law_url",
    "law_modified_date",
    "law_effective_date",
    "law_effective_note",
    "law_abandon_note",
    "law_has_eng_version",
    "eng_law_name",
    "law_attachments_json",
    "law_histories",
    "law_foreword",
    "article_count",
    "content_hash",
    "law_articles",
]


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


def _yyyymmdd(value: Any) -> Optional[str]:
    parsed = _parse_date(value)
    return parsed.strftime("%Y%m%d") if parsed else None


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _clean_int(value: Any, default: Optional[int] = None) -> Optional[int]:
    if value is None or value == "":
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _clean_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp_page(page: Any, page_size: Any) -> Tuple[int, int]:
    current = max(1, _clean_int(page, 1) or 1)
    size = _clean_int(page_size, DEFAULT_PAGE_SIZE) or DEFAULT_PAGE_SIZE
    size = max(1, min(MAX_PAGE_SIZE, size))
    return current, size


def _sort_parts(filters: Dict[str, Any], default: str) -> Tuple[str, str]:
    raw = str(filters.get("sort") or default)
    if ":" in raw:
        key, direction = raw.split(":", 1)
    else:
        key, direction = raw, "asc"
    direction = "desc" if direction.lower() == "desc" else "asc"
    return key, direction


def _apply_filters(
    statement,
    table: str,
    filters: Dict[str, Any],
):
    model = TABLE_MODELS[table]
    source_type = str(filters.get("source_type") or "all")
    if source_type != "all" and hasattr(model, "source_type"):
        statement = statement.where(model.source_type == source_type)

    if table == "law_documents":
        keyword = str(filters.get("keyword") or "").strip()
        if keyword:
            pattern = f"%{_escape_like(keyword)}%"
            statement = statement.where(
                or_(
                    *[
                        column.ilike(pattern, escape="\\")
                        for column in TABLE_SEARCH_COLUMNS["law_documents"]
                    ]
                )
            )

        level = str(filters.get("law_level") or "").strip()
        if level:
            statement = statement.where(model.law_level == level)

        category = str(filters.get("law_category") or "").strip()
        if category:
            statement = statement.where(model.law_category == category)

        modified_from = _yyyymmdd(filters.get("modified_from"))
        if modified_from:
            statement = statement.where(model.law_modified_date >= modified_from)

        modified_to = _yyyymmdd(filters.get("modified_to"))
        if modified_to:
            statement = statement.where(model.law_modified_date <= modified_to)

        min_articles = _clean_int(filters.get("min_articles"))
        if min_articles is not None:
            statement = statement.where(model.article_count >= min_articles)

        if filters.get("is_current") is True:
            statement = statement.where(model.is_current.is_(True))

    if table == "law_dataset_versions":
        if filters.get("is_current") is True:
            statement = statement.where(model.is_current.is_(True))
        min_law_count = _clean_int(filters.get("min_law_count"))
        if min_law_count is not None:
            statement = statement.where(model.law_count >= min_law_count)

        date_from = _start_of_day(filters.get("from_date"))
        if date_from:
            statement = statement.where(model.downloaded_at >= date_from)
        date_to = _end_of_day(filters.get("to_date"))
        if date_to:
            statement = statement.where(model.downloaded_at <= date_to)

    if table == "download_runs":
        status = str(filters.get("status") or "").strip()
        if status:
            statement = statement.where(model.status == status)
        date_from = _start_of_day(filters.get("from_date"))
        if date_from:
            statement = statement.where(model.started_at >= date_from)
        date_to = _end_of_day(filters.get("to_date"))
        if date_to:
            statement = statement.where(model.started_at <= date_to)

    if table == "judgment_documents":
        keyword = str(filters.get("keyword") or "").strip()
        if keyword:
            pattern = f"%{_escape_like(keyword)}%"
            statement = statement.where(
                or_(
                    *[
                        column.ilike(pattern, escape="\\")
                        for column in TABLE_SEARCH_COLUMNS["judgment_documents"]
                    ]
                )
            )
        court = str(filters.get("court") or "").strip()
        if court:
            statement = statement.where(model.court_normalized == court)
        law_name = str(filters.get("law_name") or "").strip()
        if law_name:
            pattern = f"%\n{_escape_like(law_name)}\n%"
            statement = statement.where(model.matched_laws_text.like(pattern, escape="\\"))
        date_from = _yyyymmdd(filters.get("from_date"))
        if date_from:
            statement = statement.where(model.jdate >= date_from)
        date_to = _yyyymmdd(filters.get("to_date"))
        if date_to:
            statement = statement.where(model.jdate <= date_to)
        min_citations = _clean_int(filters.get("min_citations"))
        if min_citations is not None:
            statement = statement.where(model.citation_count >= min_citations)

    if table == "judgment_import_runs":
        status = str(filters.get("status") or "").strip()
        if status:
            statement = statement.where(model.status == status)
        date_from = _start_of_day(filters.get("from_date"))
        if date_from:
            statement = statement.where(model.started_at >= date_from)
        date_to = _end_of_day(filters.get("to_date"))
        if date_to:
            statement = statement.where(model.started_at <= date_to)

    column_filters = filters.get("column_filters")
    if isinstance(column_filters, dict):
        for key, value in column_filters.items():
            text = str(value or "").strip()
            if not text:
                continue
            column = getattr(model, key, None)
            if column is None:
                continue
            if key == "matched_laws":
                column = model.matched_laws_text
            if key == "is_current" and text in {"是", "true", "1", "yes"}:
                statement = statement.where(model.is_current.is_(True))
                continue
            if key == "is_current" and text in {"否", "false", "0", "no"}:
                statement = statement.where(model.is_current.is_(False))
                continue
            statement = statement.where(
                cast(column, String).ilike(f"%{_escape_like(text)}%")
            )

    return statement


def _resolve_sort(table: str, filters: Dict[str, Any]) -> Tuple[str, str]:
    if table == "law_documents":
        default = "law_name:asc"
    elif table == "judgment_documents":
        default = "jdate:desc"
    else:
        default = "id:desc"
    key, direction = _sort_parts(filters, default)
    if filters.get("schema_preview"):
        available = {item["key"] for item in TABLE_COLUMNS.get(table, [])}
        if key in available:
            return key, direction
    if key not in SORTABLE.get(table, {}):
        key = {
            "law_documents": "law_name",
            "law_dataset_versions": "id",
            "download_runs": "started_at",
            "judgment_documents": "jdate",
            "judgment_import_runs": "started_at",
        }[table]
        direction = "asc" if table == "law_documents" else "desc"
    return key, direction


def _apply_sort(statement, table: str, filters: Dict[str, Any]):
    model = TABLE_MODELS[table]
    key, direction = _resolve_sort(table, filters)
    if filters.get("schema_preview"):
        column = getattr(model, key, None)
        if key == "court":
            column = model.court_normalized
        elif key == "matched_laws":
            column = model.matched_laws_text
        if column is None:
            column = model.id
    else:
        column = SORTABLE[table][key]
    ordering = column.desc() if direction == "desc" else column.asc()
    return statement.order_by(ordering, model.id.asc())


def _describe_filters(table: str, filters: Dict[str, Any]) -> List[str]:
    parts: List[str] = []
    source_type = filters.get("source_type")
    if source_type and source_type != "all":
        parts.append(f"source_type = '{source_type}'")
    for key in (
        "table",
        "status",
        "law_level",
        "law_category",
        "court",
        "law_name",
        "keyword",
        "modified_from",
        "modified_to",
        "from_date",
        "to_date",
    ):
        value = filters.get(key)
        if key == "table" or value in (None, ""):
            continue
        if key == "keyword":
            parts.append(f"keyword ≈ '{value}'")
        elif key.startswith("modified"):
            parts.append(f"{key} = '{_yyyymmdd(value)}'")
        else:
            parts.append(f"{key} = '{value}'")
    for key in ("min_articles", "min_law_count", "min_citations", "is_current"):
        value = filters.get(key)
        if value in (None, "", False):
            continue
        parts.append(f"{key} = {value}")
    return parts


def _query_text(table: str, filters: Dict[str, Any], page: int, page_size: int) -> str:
    columns = ", ".join(item["key"] for item in TABLE_COLUMNS[table])
    where = _describe_filters(table, filters)
    key, direction = _resolve_sort(table, filters)
    display_key = {"matched_laws": "matched_laws_text", "court": "court_normalized"}.get(
        key, key
    )
    offset = (page - 1) * page_size
    lines = [f"SELECT {columns}", f"FROM {table}"]
    if where:
        lines.append("WHERE " + "\n  AND ".join(where))
    lines.append(f"ORDER BY {display_key} {direction.upper()}")
    lines.append(f"LIMIT {page_size} OFFSET {offset}")
    return "\n".join(lines)


def _summary_value(value: Any) -> str:
    if value is None:
        return "0"
    if isinstance(value, float):
        return f"{value:.1f}"
    return str(value)


def _distribution(
    session: Session,
    table: str,
    filters: Dict[str, Any],
) -> List[Dict[str, Any]]:
    model = TABLE_MODELS[table]
    if table == "law_documents":
        column = model.law_level
    elif table == "law_dataset_versions":
        column = model.source_type
    elif table == "judgment_documents":
        column = model.court_normalized
    else:
        column = model.status
    statement = _apply_filters(
        select(column, func.count()).select_from(model), table, filters
    )
    statement = (
        statement.group_by(column).order_by(func.count().desc()).limit(8)
    )
    rows = session.execute(statement).all()
    return [
        {"label": str(label or "未分類"), "value": int(count)}
        for label, count in rows
    ]


@traced(
    "query.postgres",
    module=__name__,
    params_fn=lambda session_factory, filters, page, page_size: {
        "table": filters.get("table"),
        "page": page,
        "page_size": page_size,
        "filter_keys": sorted(filters),
    },
)
def _query_postgres(
    session_factory: sessionmaker[Session],
    filters: Dict[str, Any],
    page: int,
    page_size: int,
) -> Dict[str, Any]:
    started = time.perf_counter()
    table = str(filters.get("table") or "law_documents")
    if table not in TABLE_MODELS:
        raise ValueError(f"不支援的 PostgreSQL 資料表：{table}")
    model = TABLE_MODELS[table]
    columns = TABLE_COLUMNS[table]

    with session_factory() as session:
        count_stmt = _apply_filters(
            select(func.count()).select_from(model), table, filters
        )
        total = int(session.scalar(count_stmt) or 0)

        statement = _apply_filters(select(model), table, filters)
        statement = _apply_sort(statement, table, filters)
        statement = statement.offset((page - 1) * page_size).limit(page_size)
        records = session.scalars(statement).all()
        rows = []
        for record in records:
            row = {item["key"]: getattr(record, item["key"], None) for item in columns}
            if table == "law_documents":
                row["_law_key"] = record.law_key
                row["_law_source_type"] = record.source_type
            if table == "judgment_documents":
                row["court"] = record.court_normalized or record.court
                row["court_raw"] = record.court
                row["matched_laws"] = "、".join(record.matched_laws or [])
            rows.append(row)
        distribution = _distribution(session, table, filters)

        summary: List[Dict[str, str]] = [
            {"label": "符合筆數", "value": _summary_value(total)},
        ]
        if table == "law_documents":
            current_stmt = _apply_filters(
                select(func.count()).select_from(model), table, filters
            ).where(model.is_current.is_(True))
            current = int(session.scalar(current_stmt) or 0)
            avg_stmt = _apply_filters(
                select(func.avg(model.article_count)).select_from(model),
                table,
                filters,
            )
            avg_articles = session.scalar(avg_stmt)
            summary.extend(
                [
                    {"label": "現行法規", "value": _summary_value(current)},
                    {
                        "label": "平均條文",
                        "value": _summary_value(
                            round(float(avg_articles), 1) if avg_articles else 0
                        ),
                    },
                    {"label": "查詢耗時", "value": "計算中"},
                ]
            )
        elif table == "law_dataset_versions":
            current_stmt = _apply_filters(
                select(func.count()).select_from(model), table, filters
            ).where(model.is_current.is_(True))
            current = int(session.scalar(current_stmt) or 0)
            total_laws_stmt = _apply_filters(
                select(func.sum(model.law_count)).select_from(model), table, filters
            )
            total_laws = int(session.scalar(total_laws_stmt) or 0)
            summary.extend(
                [
                    {"label": "現行版本", "value": _summary_value(current)},
                    {"label": "法規總筆數", "value": _summary_value(total_laws)},
                    {"label": "查詢耗時", "value": "計算中"},
                ]
            )
        elif table == "judgment_documents":
            citations_stmt = _apply_filters(
                select(func.sum(model.citation_count)).select_from(model),
                table,
                filters,
            )
            citations = int(session.scalar(citations_stmt) or 0)
            average = citations / total if total else 0
            summary.extend(
                [
                    {"label": "引用總數", "value": _summary_value(citations)},
                    {"label": "平均引用", "value": f"{average:.1f}"},
                    {"label": "查詢耗時", "value": "計算中"},
                ]
            )
        elif table == "judgment_import_runs":
            success_stmt = _apply_filters(
                select(func.count()).select_from(model), table, filters
            ).where(model.status == "success")
            success = int(session.scalar(success_stmt) or 0)
            avg_stmt = _apply_filters(
                select(func.avg(model.duration_ms)).select_from(model), table, filters
            )
            avg_duration = session.scalar(avg_stmt)
            summary.extend(
                [
                    {"label": "成功次數", "value": _summary_value(success)},
                    {
                        "label": "平均耗時",
                        "value": f"{float(avg_duration or 0) / 1000:.1f}s",
                    },
                    {"label": "查詢耗時", "value": "計算中"},
                ]
            )
        else:
            success_stmt = _apply_filters(
                select(func.count()).select_from(model), table, filters
            ).where(model.status == "success")
            success = int(session.scalar(success_stmt) or 0)
            avg_stmt = _apply_filters(
                select(func.avg(model.duration_ms)).select_from(model), table, filters
            )
            avg_duration = session.scalar(avg_stmt)
            summary.extend(
                [
                    {"label": "成功次數", "value": _summary_value(success)},
                    {
                        "label": "平均耗時",
                        "value": f"{float(avg_duration or 0) / 1000:.1f}s",
                    },
                    {"label": "查詢耗時", "value": "計算中"},
                ]
            )

    duration_ms = int((time.perf_counter() - started) * 1000)
    summary[-1] = {"label": "查詢耗時", "value": f"{duration_ms} ms"}
    sort_key, sort_direction = _resolve_sort(table, filters)
    return {
        "database": "postgres",
        "label": "PostgreSQL",
        "status": "ok",
        "message": None,
        "table": table,
        "columns": columns,
        "rows": rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "duration_ms": duration_ms,
        "summary": summary,
        "distribution": distribution,
        "query_text": _query_text(table, filters, page, page_size),
        "warnings": [],
        "meta": {
            "table": table,
            "table_label": POSTGRES_TABLES.get(table, {}).get("label", table),
            "filters": filters,
            "sort": {"key": sort_key, "direction": sort_direction},
        },
    }


def _latest_parquet_files(data_dir: Path) -> Dict[str, Path]:
    base = Path(data_dir).expanduser().resolve() / "raw_parquet"
    latest: Dict[str, Tuple[str, float, Path]] = {}
    for path in base.glob("*/*/*/laws.parquet"):
        try:
            relative = path.relative_to(base)
            source = relative.parts[0]
            partition = relative.parts[1]
            mtime = path.stat().st_mtime
        except (ValueError, OSError):
            continue
        current = latest.get(source)
        candidate = (partition, mtime, path)
        if current is None or candidate[:2] > current[:2]:
            latest[source] = candidate
    return {source: item[2] for source, item in latest.items()}


def _parquet_column_matches(row: Dict[str, Any], filters: Dict[str, Any]) -> bool:
    column_filters = filters.get("column_filters")
    if not isinstance(column_filters, dict):
        return True
    for key, value in column_filters.items():
        text = str(value or "").strip().lower()
        if not text:
            continue
        row_value = row.get(key)
        if isinstance(row_value, list):
            row_value = " ".join(str(item) for item in row_value)
        elif isinstance(row_value, bool):
            row_value = "是" if row_value else "否"
        if text not in str(row_value or "").lower():
            return False
    return True


def _row_matches_parquet(row: Dict[str, Any], filters: Dict[str, Any]) -> bool:
    dataset = str(filters.get("dataset") or "all")
    if dataset != "all" and row.get("source_type") != dataset:
        return False

    level = str(filters.get("law_level") or "").strip()
    if level and row.get("law_level") != level:
        return False

    category = str(filters.get("law_category") or "").strip()
    if category and row.get("law_category") != category:
        return False

    keyword = str(filters.get("keyword") or "").strip().lower()
    if keyword:
        haystack = " ".join(
            str(row.get(key) or "")
            for key in ("law_name", "law_level", "law_category", "law_modified_date")
        ).lower()
        if keyword not in haystack:
            return False

    if not _parquet_column_matches(row, filters):
        return False

    modified_from = _yyyymmdd(filters.get("modified_from"))
    if modified_from and str(row.get("law_modified_date") or "") < modified_from:
        return False
    modified_to = _yyyymmdd(filters.get("modified_to"))
    if modified_to and str(row.get("law_modified_date") or "") > modified_to:
        return False

    min_articles = _clean_int(filters.get("min_articles"))
    if min_articles is not None and int(row.get("article_count") or 0) < min_articles:
        return False

    return True


@traced(
    "query.parquet_judgments",
    module=__name__,
    params_fn=lambda data_dir, filters, page, page_size: {
        "page": page,
        "page_size": page_size,
        "filter_keys": sorted(filters or {}),
    },
)
def _query_judgment_parquet(
    data_dir: Path,
    filters: Dict[str, Any],
    page: int,
    page_size: int,
) -> Dict[str, Any]:
    started = time.perf_counter()
    paths = raw_judgment_files(data_dir)
    if not paths:
        duration_ms = int((time.perf_counter() - started) * 1000)
        return {
            "database": "parquet",
            "label": "原始判決 Parquet",
            "status": "empty",
            "message": "找不到原始判決 Parquet，請先執行 judgment-import-judgments --raw-only。",
            "table": "judgment_documents",
            "columns": [
                {
                    "key": key,
                    "label": JUDGMENT_PARQUET_LABELS.get(key, key),
                    "type": "text",
                }
                for key in JUDGMENT_PARQUET_DEFAULT_COLUMNS
            ],
            "rows": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "duration_ms": duration_ms,
            "summary": [
                {"label": "符合筆數", "value": "0"},
                {"label": "查詢耗時", "value": f"{duration_ms} ms"},
            ],
            "distribution": [],
            "query_text": "RAW PARQUET SCAN raw.parquet（無可用檔案）",
            "warnings": ["尚未產生原始判決 Parquet"],
            "meta": {"files": [], "dataset": "judgments", "filters": filters},
        }

    requested = filters.get("columns")
    if not isinstance(requested, list) or not requested:
        requested = JUDGMENT_PARQUET_DEFAULT_COLUMNS
    requested = [
        key for key in requested if key in JUDGMENT_PARQUET_LABELS
    ] or JUDGMENT_PARQUET_DEFAULT_COLUMNS
    needed: List[str] = []
    for key in requested + JUDGMENT_PARQUET_REQUIRED_COLUMNS:
        if key not in needed:
            needed.append(key)

    warnings: List[str] = []
    try:
        dataset = ds.dataset([str(path) for path in paths], format="parquet")
        table = dataset.to_table(columns=needed)
    except Exception as exc:
        duration_ms = int((time.perf_counter() - started) * 1000)
        return {
            "database": "parquet",
            "label": "原始判決 Parquet",
            "status": "unavailable",
            "message": f"原始判決 Parquet 讀取失敗：{exc.__class__.__name__}",
            "table": "judgment_documents",
            "columns": [],
            "rows": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "duration_ms": duration_ms,
            "summary": [],
            "distribution": [],
            "query_text": "RAW PARQUET SCAN raw.parquet（讀取失敗）",
            "warnings": [str(exc)],
            "meta": {"files": [str(path) for path in paths], "dataset": "judgments", "filters": filters},
        }

    keyword = str(filters.get("keyword") or "").strip()
    court = str(filters.get("court") or "").strip()
    date_from = _yyyymmdd(filters.get("jdate_from"))
    date_to = _yyyymmdd(filters.get("jdate_to"))
    min_citations = _clean_int(filters.get("min_citations"))
    mask = None

    def combine(expr) -> None:
        nonlocal mask
        mask = expr if mask is None else pc.and_(mask, expr)

    if court:
        combine(
            pc.or_(
                pc.equal(table["court"], court),
                pc.equal(table["court_normalized"], court),
            )
        )
    if date_from:
        combine(pc.greater_equal(table["jdate"], date_from))
    if date_to:
        combine(pc.less_equal(table["jdate"], date_to))
    if min_citations is not None:
        combine(pc.greater_equal(table["citation_count"], min_citations))
    if keyword:
        needle = keyword.lower()
        haystack_columns = [
            key
            for key in (
                "jid",
                "court",
                "court_normalized",
                "title",
                "matched_laws_text",
                "source_archive",
            )
            if key in table.column_names
        ]
        matches = [
            pc.match_substring(
                pc.utf8_lower(pc.fill_null(table[key], "")),
                needle,
            )
            for key in haystack_columns
        ]
        if matches:
            combine(reduce(pc.or_, matches))

    filtered = table.filter(mask) if mask is not None else table
    if filters.get("column_filters"):
        filtered_rows = [
            row
            for row in filtered.to_pylist()
            if _parquet_column_matches(row, filters)
        ]
        filtered = (
            pa.Table.from_pylist(filtered_rows)
            if filtered_rows
            else filtered.slice(0, 0)
        )

    key, direction = _sort_parts(filters, "jdate:desc")
    if key == "court":
        key = "court_normalized"
    sort_key = key if key in filtered.column_names else "jdate"
    sort_order = "descending" if direction == "desc" else "ascending"
    filtered = filtered.sort_by([(sort_key, sort_order)])

    total = filtered.num_rows
    start = (page - 1) * page_size
    page_rows = filtered.slice(start, page_size).to_pylist()
    output_rows = [
        {
            **{key: row.get(key) for key in requested},
            "_jid": row.get("jid"),
        }
        for row in page_rows
    ]
    columns = [
        {
            "key": key,
            "label": JUDGMENT_PARQUET_LABELS.get(key, key),
            "type": (
                "mono"
                if key == "jid"
                else "date"
                if key == "jdate"
                else "number"
                if key in {"citation_count", "full_text_length"}
                else "text"
            ),
        }
        for key in requested
    ]
    counts: Dict[str, int] = {}
    if "court_normalized" in filtered.column_names:
        value_counts = pc.value_counts(
            pc.fill_null(filtered.column("court_normalized"), "")
        ).to_pylist()
        for item in value_counts:
            label = str(item.get("values") or "").strip() or "未分類"
            counts[label] = int(item.get("counts") or 0)
    distribution = [
        {"label": label, "value": value}
        for label, value in sorted(
            counts.items(), key=lambda item: item[1], reverse=True
        )[:8]
    ]
    avg_citations = 0.0
    if total and "citation_count" in filtered.column_names:
        avg_citations = float(pc.mean(filtered.column("citation_count")).as_py() or 0)
    duration_ms = int((time.perf_counter() - started) * 1000)
    filter_parts = []
    for key_name, value in (
        ("keyword", keyword),
        ("court", court),
        ("jdate_from", date_from),
        ("jdate_to", date_to),
        ("min_citations", min_citations),
    ):
        if value not in (None, ""):
            filter_parts.append(f"{key_name} = {value}")
    query_text = (
        "RAW PARQUET SCAN raw.parquet\nWHERE "
        + (" AND ".join(filter_parts) or "1 = 1")
        + f"\nORDER BY {sort_key} {direction.upper()}"
        + f"\nLIMIT {page_size} OFFSET {start}"
    )
    return {
        "database": "parquet",
        "label": "原始判決 Parquet",
        "status": "ok",
        "message": None,
        "table": "judgment_documents",
        "columns": columns,
        "rows": output_rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "duration_ms": duration_ms,
        "summary": [
            {"label": "符合筆數", "value": str(total)},
            {"label": "法院數", "value": str(len(counts))},
            {"label": "平均引用", "value": f"{avg_citations:.1f}"},
            {"label": "查詢耗時", "value": f"{duration_ms} ms"},
        ],
        "distribution": distribution,
        "query_text": query_text,
        "warnings": warnings,
        "meta": {
            "files": [str(path) for path in paths],
            "dataset": "judgments",
            "table_label": "原始判決 Parquet",
            "filters": filters,
        },
    }


@traced(
    "query.parquet",
    module=__name__,
    params_fn=lambda data_dir, filters, page, page_size: {
        "dataset": filters.get("dataset") or "all",
        "page": page,
        "page_size": page_size,
        "filter_keys": sorted(filters),
    },
)
def _query_parquet(
    data_dir: Path,
    filters: Dict[str, Any],
    page: int,
    page_size: int,
) -> Dict[str, Any]:
    started = time.perf_counter()
    dataset = str(filters.get("dataset") or "all")
    files = _latest_parquet_files(data_dir)
    if dataset != "all":
        files = {key: value for key, value in files.items() if key == dataset}

    if not files:
        duration_ms = int((time.perf_counter() - started) * 1000)
        return {
            "database": "parquet",
            "label": "Parquet",
            "status": "empty",
            "message": "找不到可查詢的 Parquet 快照，請先執行法規下載模組。",
            "table": "law_documents",
            "columns": [
                {"key": key, "label": PARQUET_LABELS.get(key, key), "type": "text"}
                for key in PARQUET_DEFAULT_COLUMNS
            ],
            "rows": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "duration_ms": duration_ms,
            "summary": [
                {"label": "符合筆數", "value": "0"},
                {"label": "查詢耗時", "value": f"{duration_ms} ms"},
            ],
            "distribution": [],
            "query_text": "PARQUET SCAN （無可用檔案）",
            "warnings": ["尚未產生 Parquet 資料"],
            "meta": {"files": [], "filters": filters},
        }

    requested = filters.get("columns")
    if not isinstance(requested, list) or not requested:
        requested = PARQUET_DEFAULT_COLUMNS
    requested = [
        key for key in requested if key in PARQUET_LABELS
    ] or PARQUET_DEFAULT_COLUMNS
    needed: List[str] = []
    for key in requested + PARQUET_REQUIRED_COLUMNS:
        if key not in needed:
            needed.append(key)

    warnings: List[str] = []
    rows: List[Dict[str, Any]] = []
    read_files: List[str] = []
    for source, path in sorted(files.items()):
        try:
            table = pq.read_table(path, columns=needed)
        except Exception as exc:
            warnings.append(f"{path.name} 讀取失敗：{exc.__class__.__name__}")
            logger.warning("failed to read parquet %s: %s", path, exc)
            continue
        read_files.append(str(path))
        for row in table.to_pylist():
            if _row_matches_parquet(row, filters):
                rows.append(row)

    key, direction = _sort_parts(filters, "law_name:asc")
    sort_key = key if key in needed else "law_name"
    reverse = direction == "desc"
    if sort_key == "article_count":
        rows.sort(key=lambda row: int(row.get("article_count") or 0), reverse=reverse)
    else:
        rows.sort(key=lambda row: str(row.get(sort_key) or ""), reverse=reverse)

    total = len(rows)
    start = (page - 1) * page_size
    page_rows = rows[start : start + page_size]
    output_rows = [
        {
            **{key: row.get(key) for key in requested},
            "_law_key": row.get("law_key") or row.get("law_name"),
            "_law_source_type": row.get("source_type"),
        }
        for row in page_rows
    ]
    columns = [
        {
            "key": key,
            "label": PARQUET_LABELS.get(key, key),
            "type": "mono" if key in ("content_hash", "raw_json") else (
                "number" if key == "article_count" else "text"
            ),
        }
        for key in requested
    ]

    counts: Dict[str, int] = {}
    for row in rows:
        label = str(row.get("law_level") or "未分類")
        counts[label] = counts.get(label, 0) + 1
    distribution = [
        {"label": label, "value": value}
        for label, value in sorted(counts.items(), key=lambda item: item[1], reverse=True)[:8]
    ]
    avg_articles = (
        sum(int(row.get("article_count") or 0) for row in rows) / total if total else 0
    )
    source_count = len({row.get("source_type") for row in rows})
    duration_ms = int((time.perf_counter() - started) * 1000)
    query_text = (
        "PARQUET SCAN "
        + " + ".join(Path(path).name for path in read_files)
        + "\nWHERE "
        + (" AND ".join(_describe_filters("law_documents", filters)) or "1 = 1")
        + f"\nORDER BY {sort_key} {direction.upper()}"
        + f"\nLIMIT {page_size} OFFSET {start}"
    )
    return {
        "database": "parquet",
        "label": "Parquet",
        "status": "ok",
        "message": None,
        "table": "law_documents",
        "columns": columns,
        "rows": output_rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "duration_ms": duration_ms,
        "summary": [
            {"label": "符合筆數", "value": str(total)},
            {"label": "資料來源數", "value": str(source_count)},
            {"label": "平均條文", "value": f"{avg_articles:.1f}"},
            {"label": "查詢耗時", "value": f"{duration_ms} ms"},
        ],
        "distribution": distribution,
        "query_text": query_text,
        "warnings": warnings,
        "meta": {
            "files": read_files,
            "dataset": dataset,
            "filters": filters,
        },
    }


def _text(value: Any) -> str:
    return "" if value is None else str(value)


def _bool_or_none(value: Any) -> Optional[bool]:
    if value is None or value == "":
        return None
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "yes", "y"}:
        return True
    if text in {"0", "false", "no", "n"}:
        return False
    return None


def _parquet_law_metadata(row: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "law_key": _text(row.get("law_key")),
        "source_type": _text(row.get("source_type")),
        "law_name": _text(row.get("law_name")),
        "law_level": _text(row.get("law_level")),
        "law_category": _text(row.get("law_category")),
        "law_url": _text(row.get("law_url")),
        "law_modified_date": _text(row.get("law_modified_date")),
        "law_effective_date": _text(row.get("law_effective_date")),
        "law_effective_note": _text(row.get("law_effective_note")),
        "law_abandon_note": _text(row.get("law_abandon_note")),
        "law_has_eng_version": _bool_or_none(row.get("law_has_eng_version")),
        "eng_law_name": _text(row.get("eng_law_name")),
        "law_foreword": _text(row.get("law_foreword")),
        "law_histories": _text(row.get("law_histories")),
        "article_count": _clean_int(row.get("article_count"), 0) or 0,
        "content_hash": _text(row.get("content_hash")),
        "is_current": _bool_or_none(row.get("is_current")),
    }


def _record_law_metadata(record: LawDocument) -> Dict[str, Any]:
    return {
        "law_key": record.law_key,
        "source_type": record.source_type,
        "law_name": record.law_name,
        "law_level": record.law_level,
        "law_category": record.law_category,
        "law_url": record.law_url,
        "law_modified_date": record.law_modified_date,
        "law_effective_date": record.law_effective_date,
        "law_effective_note": record.law_effective_note,
        "law_abandon_note": record.law_abandon_note,
        "law_has_eng_version": bool(record.law_has_eng_version),
        "eng_law_name": record.eng_law_name,
        "law_histories": record.law_histories,
        "article_count": int(record.article_count or 0),
        "content_hash": record.content_hash,
        "is_current": bool(record.is_current),
    }


def _normalize_articles(value: Any) -> List[Dict[str, str]]:
    if not isinstance(value, list):
        return []
    articles: List[Dict[str, str]] = []
    for item in value:
        if not isinstance(item, dict):
            continue
        content = item.get("article_content")
        if content is None:
            continue
        articles.append(
            {
                "article_type": _text(item.get("article_type")),
                "article_no": _text(item.get("article_no")),
                "article_content": _text(content),
            }
        )
    return articles


def _parse_attachments(value: Any) -> List[Dict[str, str]]:
    if isinstance(value, list):
        items = value
    else:
        try:
            items = json.loads(value or "[]")
        except (TypeError, ValueError):
            return []
    if not isinstance(items, list):
        return []
    attachments: List[Dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        name = _text(item.get("FileName")).strip()
        url = _text(item.get("FileURL")).strip()
        if name or url:
            attachments.append({"name": name, "url": url})
    return attachments


def _load_parquet_law(
    data_dir: Path,
    source_type: Optional[str],
    law_key: str,
    law_name: str,
) -> Tuple[Optional[Dict[str, Any]], Optional[Path], List[str]]:
    warnings: List[str] = []
    files = _latest_parquet_files(data_dir)
    if source_type:
        files = {key: value for key, value in files.items() if key == source_type}

    for _, path in sorted(files.items()):
        try:
            schema_names = set(pq.ParquetFile(path).schema_arrow.names)
            if not {"law_key", "law_name"} & schema_names:
                continue
            columns = [key for key in PARQUET_DETAIL_COLUMNS if key in schema_names]
            filters_list = []
            if law_key and "law_key" in schema_names:
                filters_list.append([("law_key", "=", law_key)])
            if law_name and "law_name" in schema_names:
                filters_list.append([("law_name", "=", law_name)])
            for filters in filters_list:
                table = pq.read_table(path, columns=columns, filters=filters)
                rows = table.to_pylist()
                if rows:
                    return rows[0], path, warnings
        except Exception as exc:
            warnings.append(f"{path.name} 讀取失敗：{exc.__class__.__name__}")
            logger.warning("failed to read parquet detail %s: %s", path, exc)
    return None, None, warnings


@traced(
    "query.law_detail",
    module=__name__,
    params_fn=lambda *, law_key, source_type=None, version_id=None, **_: {
        "law_key": law_key,
        "source_type": source_type,
        "version_id": version_id,
    },
)
def get_law_detail(
    *,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    law_key: str,
    source_type: Optional[str] = None,
    version_id: Optional[int] = None,
) -> Dict[str, Any]:
    started = time.perf_counter()
    key = str(law_key or "").strip()
    if not key:
        raise ValueError("law_key 不可為空")
    requested_source = str(source_type or "").strip() or None
    if requested_source and requested_source not in ("law", "order"):
        raise ValueError(f"不支援的資料類型：{requested_source}")

    record_metadata: Optional[Dict[str, Any]] = None
    record_attachments: List[Dict[str, str]] = []
    version_info: Optional[Dict[str, Any]] = None
    versions_payload: List[Dict[str, Any]] = []
    selected_version_payload: Optional[Dict[str, Any]] = None
    selected_version_id: Optional[int] = None
    selected_article_count = 0
    articles_from_db: List[Dict[str, Any]] = []
    change_summary: Dict[str, int] = {}
    changes: List[Dict[str, Any]] = []
    changes_available = False
    changes_truncated = False

    with session_factory() as session:
        statement = select(LawDocument).where(LawDocument.law_key == key)
        if requested_source:
            statement = statement.where(LawDocument.source_type == requested_source)
        statement = statement.order_by(
            LawDocument.is_current.desc(), LawDocument.id.desc()
        )
        record = session.scalars(statement).first()
        if record is not None:
            record_metadata = _record_law_metadata(record)
            record_attachments = _parse_attachments(record.law_attachments_json)
            version_info = {
                "first_seen_version_id": record.first_seen_version_id,
                "last_seen_version_id": record.last_seen_version_id,
                "removed_version_id": record.removed_version_id,
                "last_seen_at": record.last_seen_at.isoformat()
                if record.last_seen_at
                else None,
                "removed_at": record.removed_at.isoformat()
                if record.removed_at
                else None,
            }

            version_rows = session.scalars(
                select(LawDatasetVersion)
                .where(LawDatasetVersion.source_type == record.source_type)
                .order_by(LawDatasetVersion.id.desc())
            ).all()
            article_counts = dict(
                session.execute(
                    select(
                        LawArticleVersion.law_version_id,
                        func.count(),
                    )
                    .where(LawArticleVersion.law_id == int(record.id))
                    .group_by(LawArticleVersion.law_version_id)
                ).all()
            )
            versions_payload = [
                {
                    "version_id": int(item.id),
                    "update_date": item.update_date,
                    "downloaded_at": item.downloaded_at,
                    "is_current": bool(item.is_current),
                    "law_count": int(item.law_count or 0),
                    "article_count": int(item.article_count or 0),
                    "article_count_for_law": int(
                        article_counts.get(int(item.id), 0)
                    ),
                    "has_articles": bool(article_counts.get(int(item.id), 0)),
                    "selected": False,
                }
                for item in version_rows
            ]

            if version_id is not None:
                selected_version = next(
                    (
                        item
                        for item in version_rows
                        if int(item.id) == int(version_id)
                    ),
                    None,
                )
                if selected_version is None:
                    raise ValueError(
                        f"找不到法規版本：{version_id}（{record.source_type}）"
                    )
            else:
                selected_version = next(
                    (item for item in version_rows if item.is_current),
                    version_rows[0] if version_rows else None,
                )

            if selected_version is not None:
                selected_version_id = int(selected_version.id)
                selected_version_payload = next(
                    (
                        item
                        for item in versions_payload
                        if item["version_id"] == selected_version_id
                    ),
                    None,
                )
                if selected_version_payload is not None:
                    selected_version_payload["selected"] = True
                selected_article_count = int(
                    article_counts.get(selected_version_id, 0)
                )
                article_rows = session.scalars(
                    select(LawArticleVersion)
                    .where(
                        LawArticleVersion.law_id == int(record.id),
                        LawArticleVersion.law_version_id == selected_version_id,
                    )
                    .order_by(
                        LawArticleVersion.article_index,
                        LawArticleVersion.id,
                    )
                ).all()
                articles_from_db = [
                    {
                        "article_key": item.article_key,
                        "article_type": item.article_type,
                        "article_no": item.article_no,
                        "article_content": item.article_content,
                    }
                    for item in article_rows
                ]

                change_counts = dict(
                    session.execute(
                        select(
                            LawArticleChangeEvent.change_type,
                            func.count(),
                        )
                        .where(
                            LawArticleChangeEvent.law_id == int(record.id),
                            LawArticleChangeEvent.to_version_id
                            == selected_version_id,
                        )
                        .group_by(LawArticleChangeEvent.change_type)
                    ).all()
                )
                change_summary = {
                    str(name): int(count) for name, count in change_counts.items()
                }
                total_changes = sum(change_summary.values())
                change_rows = session.scalars(
                    select(LawArticleChangeEvent)
                    .where(
                        LawArticleChangeEvent.law_id == int(record.id),
                        LawArticleChangeEvent.to_version_id
                        == selected_version_id,
                    )
                    .order_by(
                        LawArticleChangeEvent.article_key,
                        LawArticleChangeEvent.id,
                    )
                    .limit(200)
                ).all()
                changes = [
                    {
                        "article_key": item.article_key,
                        "article_type": item.article_type,
                        "article_no": item.article_no,
                        "change_type": item.change_type,
                        "changed_fields": list(item.changed_fields or []),
                        "before_content": item.before_content,
                        "after_content": item.after_content,
                        "detected_at": item.detected_at,
                    }
                    for item in change_rows
                ]
                changes_truncated = total_changes > len(changes)
                previous_version = next(
                    (
                        item
                        for item in version_rows
                        if int(item.id) < selected_version_id
                    ),
                    None,
                )
                if previous_version is not None:
                    previous_count = int(
                        session.scalar(
                            select(func.count())
                            .select_from(LawArticleVersion)
                            .where(
                                LawArticleVersion.law_id == int(record.id),
                                LawArticleVersion.law_version_id
                                == int(previous_version.id),
                            )
                        )
                        or 0
                    )
                    changes_available = previous_count > 0

    if version_id is not None and record_metadata is None:
        raise ValueError("找不到法規版本：法規 metadata 尚未建立")

    lookup_source = requested_source or (record_metadata or {}).get("source_type")
    lookup_name = (record_metadata or {}).get("law_name") or ""
    parquet_row, parquet_path, warnings = _load_parquet_law(
        data_dir, lookup_source, key, lookup_name
    )
    if record_metadata is None and parquet_row is None:
        raise LookupError(f"找不到法規：{key}")

    metadata: Dict[str, Any] = (
        _parquet_law_metadata(parquet_row) if parquet_row else {}
    )
    if record_metadata:
        metadata.update(record_metadata)
    metadata["law_key"] = metadata.get("law_key") or key
    metadata["source_type"] = metadata.get("source_type") or (lookup_source or "")
    metadata["law_name"] = metadata.get("law_name") or lookup_name or key

    articles = list(articles_from_db)
    articles_source = "postgresql" if articles else None
    selected_is_current = bool(
        (selected_version_payload or {}).get("is_current", False)
    )
    if not articles and (version_id is None or selected_is_current):
        parquet_articles = _normalize_articles(
            (parquet_row or {}).get("law_articles")
        )
        if parquet_articles:
            articles = parquet_articles
            articles_source = "parquet"
    attachments = _parse_attachments((parquet_row or {}).get("law_attachments_json"))
    if not attachments:
        attachments = record_attachments

    if record_metadata is None:
        warnings.append(
            "PostgreSQL 找不到這個法規的 metadata，目前以最新 Parquet 快照內容顯示。"
        )
    if selected_version_id is not None and not selected_is_current:
        warnings.append(
            f"目前顯示歷史條文版本 #{selected_version_id}；法規 metadata 以現行主檔為準。"
        )
    if not articles:
        if version_id is not None and selected_version_id is not None:
            warnings.append(
                f"條文版本 #{selected_version_id} 尚無 PostgreSQL 條文快照；"
                "請先執行 judgment-backfill-law-articles 或重新匯入該版本。"
            )
        elif parquet_row is None:
            warnings.append(
                "最新 Parquet 快照中找不到這個法規的條文內容，目前僅顯示 PostgreSQL metadata。"
            )
        else:
            warnings.append("最新 Parquet 快照中沒有可顯示的條文內容。")
    elif articles_source == "parquet" and version_id is not None:
        warnings.append(
            f"條文版本 #{selected_version_id} 尚未回填 PostgreSQL；目前以最新 Parquet 顯示。"
        )

    snapshot = None
    if articles_source != "postgresql" and parquet_path is not None:
        try:
            snapshot = str(
                Path(parquet_path)
                .resolve()
                .relative_to(Path(data_dir).expanduser().resolve())
            )
        except ValueError:
            snapshot = parquet_path.name

    selected_version = (
        selected_version_payload or {}
    )
    version = dict(version_info or {})
    version["selected_version_id"] = selected_version_id
    version["selected_version"] = selected_version or None
    version["available_versions"] = versions_payload

    duration_ms = int((time.perf_counter() - started) * 1000)
    return {
        "status": "ok" if articles else "degraded",
        **metadata,
        "articles": articles,
        "attachments": attachments,
        "warnings": warnings,
        "version": version,
        "versions": versions_payload,
        "selected_version_id": selected_version_id,
        "selected_article_count": selected_article_count,
        "changes": changes,
        "change_summary": change_summary,
        "changes_available": changes_available,
        "changes_truncated": changes_truncated,
        "duration_ms": duration_ms,
        "meta": {
            "source_type": metadata.get("source_type") or requested_source or "",
            "law_key": key,
            "metadata_source": "postgresql" if record_metadata else "parquet",
            "articles_source": articles_source,
            "selected_version_id": selected_version_id,
            "selected_version_is_current": selected_is_current,
            "snapshot": snapshot,
        },
    }


@traced(
    "query.judgment_detail",
    module=__name__,
    params_fn=lambda *, jid, **_: {"jid": jid},
)
def get_judgment_detail(
    *,
    session_factory: sessionmaker[Session],
    jid: str,
) -> Dict[str, Any]:
    key = str(jid or "").strip()
    if not key:
        raise ValueError("jid 不可為空")
    with session_factory() as session:
        record = session.scalars(
            select(JudgmentDocument).where(JudgmentDocument.jid == key)
        ).first()
        if record is None:
            raise LookupError(f"找不到判決：{key}")
        citations = [
            dict(item)
            for item in (record.citations or [])
            if isinstance(item, dict)
        ]
        return {
            "status": "ok",
            "jid": record.jid,
            "jyear": record.jyear,
            "jcase": record.jcase,
            "jno": record.jno,
            "jdate": record.jdate,
            "court": record.court_normalized or record.court,
            "court_raw": record.court,
            "title": record.title,
            "full_text": record.full_text,
            "pdf_url": record.pdf_url,
            "source_archive": record.source_archive,
            "content_hash": record.content_hash,
            "matched_laws": list(record.matched_laws or []),
            "citations": citations,
            "citation_count": int(record.citation_count or 0),
            "full_text_length": int(record.full_text_length or 0),
            "import_run_id": record.import_run_id,
            "created_at": record.created_at.isoformat()
            if record.created_at
            else None,
            "updated_at": record.updated_at.isoformat()
            if record.updated_at
            else None,
        }


def _qdrant_columns(collection: str) -> List[Dict[str, str]]:
    if collection.startswith("judgment"):
        return [
            {"key": "score", "label": "相似度", "type": "number"},
            {"key": "jid", "label": "案號", "type": "text"},
            {"key": "court", "label": "法院", "type": "text"},
            {"key": "title", "label": "案由", "type": "text"},
            {"key": "jdate", "label": "裁判日期", "type": "date"},
            {"key": "matched_laws_text", "label": "命中法規", "type": "text"},
            {"key": "snippet", "label": "相似片段", "type": "text"},
        ]
    return [
        {"key": "score", "label": "相似度", "type": "number"},
        {"key": "law_name", "label": "法規", "type": "text"},
        {"key": "article_no", "label": "條號", "type": "text"},
        {"key": "snippet", "label": "片段", "type": "text"},
    ]


@traced(
    "query.qdrant",
    module=__name__,
    params_fn=lambda *, settings, filters, page, page_size, **_: {
        "collection": filters.get("collection") or settings.judgment_vector_collection,
        "query_length": len(str(filters.get("query") or "")),
        "top_k": filters.get("top_k"),
        "score_threshold": filters.get("score_threshold"),
        "page": page,
        "page_size": page_size,
    },
)
def _query_qdrant(
    *,
    settings: Settings,
    filters: Dict[str, Any],
    page: int,
    page_size: int,
) -> Dict[str, Any]:
    started = time.perf_counter()
    collection = (
        str(filters.get("collection") or settings.judgment_vector_collection).strip()
        or settings.judgment_vector_collection
    )
    query_text = str(filters.get("query") or "").strip()
    try:
        top_k = int(filters.get("top_k") or 10)
    except (TypeError, ValueError):
        top_k = 10
    top_k = max(1, min(200, top_k))
    raw_threshold = filters.get("score_threshold")
    try:
        threshold = (
            float(raw_threshold)
            if raw_threshold not in (None, "")
            else settings.rag_score_threshold
        )
    except (TypeError, ValueError):
        threshold = settings.rag_score_threshold
    threshold = max(0.0, min(1.0, threshold))
    columns = _qdrant_columns(collection)
    label = "Qdrant 語意檢索"
    query_line = (
        f"POST /collections/{collection}/points/search\n"
        f'vector = embed("{query_text or "（未輸入查詢）"}")\n'
        f"limit = {page_size} · offset = {(page - 1) * page_size} · "
        f"top_k = {top_k} · score_threshold = {threshold}"
    )
    summary = [
        {"label": "Collection", "value": collection},
        {"label": "Top K", "value": str(top_k)},
        {"label": "相似度門檻", "value": f"{threshold:.2f}"},
    ]

    def report(
        status: str,
        message: str,
        *,
        rows: Optional[List[Dict[str, Any]]] = None,
        total: int = 0,
        warnings: Optional[List[str]] = None,
        summary_extra: Optional[List[Dict[str, Any]]] = None,
        distribution: Optional[List[Dict[str, Any]]] = None,
        duration_ms: Optional[int] = None,
    ) -> Dict[str, Any]:
        return {
            "database": "qdrant",
            "label": label,
            "status": status,
            "message": message,
            "table": collection,
            "columns": columns,
            "rows": rows or [],
            "total": total,
            "page": page,
            "page_size": page_size,
            "duration_ms": (
                duration_ms
                if duration_ms is not None
                else int((time.perf_counter() - started) * 1000)
            ),
            "summary": summary + (summary_extra or []),
            "distribution": distribution or [],
            "query_text": query_line
            + (
                f"\nembedding_model = {settings.embedding_model}"
                if settings.embedding_model
                else ""
            ),
            "warnings": warnings or [],
            "meta": {"filters": filters, "top_k": top_k},
        }

    if not query_text:
        return report(
            "missing_query",
            "請在「語意查詢」輸入問題；Qdrant 會以 embedding 相似度檢索判決，而不是關鍵字比對。",
            summary_extra=[{"label": "狀態", "value": "等待查詢"}],
            warnings=["尚未輸入語意查詢，未呼叫 Qdrant 或 embedding 服務。"],
        )
    if not settings.qdrant_url:
        return report(
            "not_configured",
            "QDRANT_URL 未設定。請在 .env 設定 Qdrant 連線，並先執行 judgment-index-vectors 建立索引。",
            summary_extra=[{"label": "狀態", "value": "未設定"}],
            warnings=["Qdrant 查詢未執行，不會產生虛構的向量結果。"],
        )
    if not settings.embedding_url:
        return report(
            "not_configured",
            "EMBEDDING_URL 未設定。Qdrant 需要 embedding 服務將問題轉為向量。",
            summary_extra=[{"label": "狀態", "value": "未設定"}],
            warnings=["Embedding 查詢未執行。"],
        )

    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=30.0,
    )
    try:
        info = store.collection_info(collection)
    except QdrantError as exc:
        return report(
            "unavailable",
            f"Qdrant 無法連線：{exc}",
            summary_extra=[{"label": "狀態", "value": "離線"}],
            warnings=["查詢未執行，不會產生虛構的向量結果。"],
        )
    if info is None:
        return report(
            "not_indexed",
            f"Qdrant collection「{collection}」尚未建立。請先執行 judgment-index-vectors 建立判決向量索引。",
            summary_extra=[{"label": "狀態", "value": "尚未索引"}],
            warnings=["Collection 不存在，查詢未執行。"],
        )

    points_count = int(info.get("points_count") or 0)
    if points_count == 0:
        return report(
            "not_indexed",
            f"Qdrant collection「{collection}」存在但沒有 points，請先完成判決向量索引。",
            summary_extra=[{"label": "索引 points", "value": "0"}],
            warnings=["Collection 為空，查詢未執行。"],
        )

    embedder = OllamaEmbedder(
        settings.embedding_url,
        settings.embedding_model,
        timeout=settings.embedding_timeout_seconds,
    )
    embed_started = time.perf_counter()
    try:
        with trace_segment(
            "query.embed_query",
            module=__name__,
            function="OllamaEmbedder.embed_query",
            params={
                "model": settings.embedding_model,
                "query_length": len(query_text),
            },
        ):
            vector = embedder.embed_query(query_text)
    except EmbeddingError as exc:
        return report(
            "unavailable",
            f"Embedding 服務無法產生查詢向量：{exc}",
            summary_extra=[{"label": "狀態", "value": "Embedding 失敗"}],
            warnings=["向量檢索未執行。"],
        )
    embed_ms = int((time.perf_counter() - embed_started) * 1000)

    offset = (page - 1) * page_size
    requested = max(0, min(page_size, top_k - offset))
    hits: List[Dict[str, Any]] = []
    search_started = time.perf_counter()
    if requested:
        try:
            with trace_segment(
                "query.qdrant_search",
                module=__name__,
                function="QdrantStore.search",
                params={
                    "collection": collection,
                    "limit": requested,
                    "offset": offset,
                    "score_threshold": threshold,
                },
            ):
                hits = store.search(
                    collection,
                    vector,
                    limit=requested,
                    offset=offset,
                    score_threshold=threshold,
                )
        except QdrantError as exc:
            return report(
                "unavailable",
                f"Qdrant 向量檢索失敗：{exc}",
                summary_extra=[{"label": "狀態", "value": "檢索失敗"}],
                warnings=["查詢未完成。"],
            )
    search_ms = int((time.perf_counter() - search_started) * 1000)
    duration_ms = int((time.perf_counter() - started) * 1000)

    rows: List[Dict[str, Any]] = []
    court_counts: Dict[str, int] = {}
    for hit in hits:
        payload = hit.get("payload") or {}
        laws = payload.get("matched_laws") or []
        snippet = str(payload.get("snippet") or "").strip()
        if len(snippet) > 220:
            snippet = snippet[:220] + "…"
        rows.append(
            {
                "score": round(float(hit.get("score") or 0), 4),
                "jid": str(payload.get("jid") or ""),
                "court": str(payload.get("court") or ""),
                "title": str(payload.get("title") or ""),
                "jdate": str(payload.get("jdate") or ""),
                "matched_laws_text": "、".join(str(value) for value in laws),
                "law_name": str(payload.get("law_name") or ""),
                "article_no": str(payload.get("article_no") or ""),
                "snippet": snippet or str(payload.get("text") or "")[:220],
            }
        )
        court = str(payload.get("court") or "").strip()
        if court:
            court_counts[court] = court_counts.get(court, 0) + 1

    exhausted = len(hits) < requested or offset + len(hits) >= top_k
    total = min(top_k, offset + len(hits)) if exhausted else top_k
    if points_count:
        total = min(total, points_count)
    distribution = [
        {"label": court, "value": count}
        for court, count in sorted(
            court_counts.items(), key=lambda item: item[1], reverse=True
        )
    ]
    warnings = [
        f"只檢索 Top K = {top_k} 個候選，total 以候選上限估算，不代表符合門檻的全部判決。",
    ]
    if collection.endswith("_segments"):
        warnings.append(
            f"Collection「{collection}」為片段級預留名稱；目前索引器只建立 judgment_documents。"
        )
    return report(
        "ok",
        f"以「{query_text}」檢索 {collection}，回傳 {len(rows)} 筆相似判決。",
        rows=rows,
        total=total,
        warnings=warnings,
        summary_extra=[
            {"label": "索引 points", "value": f"{points_count:,}"},
            {"label": "Embedding", "value": f"{embed_ms} ms"},
            {"label": "Qdrant", "value": f"{search_ms} ms"},
        ],
        distribution=distribution,
        duration_ms=duration_ms,
    )


def _suggestion_values(raw_values) -> List[str]:
    values: List[str] = []
    seen = set()
    for raw in raw_values:
        if isinstance(raw, list):
            items = raw
        elif isinstance(raw, str) and "\n" in raw:
            items = raw.splitlines()
        else:
            items = [raw]
        for item in items:
            if isinstance(item, bool):
                text = "是" if item else "否"
            elif item is None:
                continue
            else:
                text = str(item).strip()
            if not text or text in seen:
                continue
            seen.add(text)
            values.append(text)
            if len(values) >= 5000:
                return values
    return values


def _suggestion_tokens(query: str) -> List[str]:
    text = str(query or "").strip()
    tokens: List[str] = []
    for chunk in re.findall(r"[\u4e00-\u9fff]{2,}", text):
        tokens.extend(chunk[index : index + 2] for index in range(len(chunk) - 1))
    tokens.extend(
        word.lower() for word in re.findall(r"[A-Za-z0-9]+", text)
    )
    tokens = [
        token
        for token in tokens
        if token not in {"的", "及", "與", "或", "和", "為", "之"}
    ]
    if not tokens and text:
        tokens = [text.casefold()]
    return list(dict.fromkeys(tokens))


def _suggestion_coverage(query: str, value: str) -> float:
    q = query.casefold().strip()
    v = value.casefold().strip()
    if not q:
        return 0.0
    covered = set()
    for index in range(max(1, len(q) - 1)):
        token = q[index : index + 2]
        if token in v:
            covered.update({index, index + 1})
    return len(covered) / max(1, len(q))


def _suggestion_score(query: str, value: str) -> float:
    q = query.casefold().strip()
    v = value.casefold().strip()
    if not q:
        return 1.0
    if q == v:
        return 1000.0
    position = v.find(q)
    if position >= 0:
        return 900.0 - position * 2.0 - abs(len(v) - len(q)) * 0.5
    covered = set()
    for index in range(max(1, len(q) - 1)):
        token = q[index : index + 2]
        if token in v:
            covered.update({index, index + 1})
    coverage = len(covered) / max(1, len(q))
    ratio = difflib.SequenceMatcher(None, q, v).ratio()
    return coverage * 1000.0 + ratio * 300.0 - abs(len(v) - len(q)) * 0.5


def _rank_suggestions(
    values: List[str],
    query: str,
    limit: int,
) -> Tuple[List[str], int]:
    q = query.casefold().strip()
    if not q:
        return values[:limit], len(values)
    contains = [value for value in values if q in value.casefold()]
    if contains:
        scored = [(_suggestion_score(query, value), value) for value in contains]
    else:
        tokens = _suggestion_tokens(query)
        candidates = [
            value
            for value in values
            if any(token in value.casefold() for token in tokens)
        ]
        if not candidates:
            candidates = values[:5000]
        scored = []
        strong = []
        for value in candidates:
            score = _suggestion_score(query, value)
            if score >= 250:
                item = (score, value)
                scored.append(item)
                if _suggestion_coverage(query, value) >= 0.75:
                    strong.append(item)
        if strong:
            scored = strong
    scored.sort(key=lambda item: (-item[0], len(item[1]), item[1]))
    return [value for _, value in scored[:limit]], len(scored)


def schema_suggestions(
    *,
    database: str,
    table: str,
    column: str,
    query: str,
    limit: int = 1000,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    settings: Optional[Settings] = None,
) -> Dict[str, Any]:
    started = time.perf_counter()
    query = str(query or "").strip()
    limit = max(1, min(int(limit or 1000), 2000))
    values: List[str] = []
    warnings: List[str] = []

    if database == "postgres":
        table = str(table or "")
        if table not in TABLE_MODELS:
            raise ValueError(f"不支援的 PostgreSQL 資料表：{table}")
        allowed = {item["key"] for item in TABLE_COLUMNS[table]}
        if column not in allowed:
            raise ValueError(f"不支援的欄位：{column}")
        model = TABLE_MODELS[table]
        column_key = {
            "court": "court_normalized",
            "matched_laws": "matched_laws_text",
        }.get(column, column)
        db_column = getattr(model, column_key, None)
        if db_column is None:
            values = []
        else:
            with session_factory() as session:
                statement = select(db_column).where(db_column.is_not(None)).distinct()
                if query:
                    if column == "is_current" and query in {"是", "true", "1", "yes"}:
                        statement = statement.where(model.is_current.is_(True))
                    elif column == "is_current" and query in {"否", "false", "0", "no"}:
                        statement = statement.where(model.is_current.is_(False))
                    else:
                        tokens = _suggestion_tokens(query)
                        statement = statement.where(
                            or_(
                                *[
                                    cast(db_column, String).ilike(
                                        f"%{_escape_like(token)}%"
                                    )
                                    for token in tokens
                                ]
                            )
                        )
                raw_values = session.scalars(statement.limit(5000)).all()
                if not raw_values and query:
                    raw_values = session.scalars(
                        select(db_column)
                        .where(db_column.is_not(None))
                        .distinct()
                        .limit(5000)
                    ).all()
                values = _suggestion_values(raw_values)
    elif database == "parquet":
        table = str(table or "")
        if table == "judgment_documents":
            settings = settings or Settings.from_env()
            paths = raw_judgment_files(settings.judgment_data_dir)
            if not paths:
                warnings.append("尚未產生原始判決 Parquet")
            else:
                try:
                    dataset = ds.dataset([str(path) for path in paths], format="parquet")
                    names = set(dataset.schema.names)
                    if column not in names:
                        raise ValueError(f"不支援的欄位：{column}")
                    table_data = dataset.to_table(columns=[column])
                    values = _suggestion_values(
                        table_data.column(column).to_pylist()
                    )
                except Exception as exc:
                    warnings.append(f"Parquet 讀取失敗：{exc.__class__.__name__}")
        else:
            files = _latest_parquet_files(data_dir)
            path = files.get("law")
            if path is None:
                warnings.append("尚未產生法規 Parquet 快照")
            else:
                try:
                    names = set(pq.ParquetFile(path).schema_arrow.names)
                    if column not in names:
                        raise ValueError(f"不支援的欄位：{column}")
                    table_data = pq.read_table(path, columns=[column])
                    values = _suggestion_values(
                        table_data.column(column).to_pylist()
                    )
                except Exception as exc:
                    warnings.append(f"Parquet 讀取失敗：{exc.__class__.__name__}")
    else:
        raise ValueError(f"不支援的資料庫：{database}")

    ranked, total = _rank_suggestions(values, query, limit)
    return {
        "status": "ok" if ranked else "empty",
        "database": database,
        "table": table,
        "column": column,
        "query": query,
        "values": ranked,
        "total": total,
        "truncated": total > len(ranked),
        "warnings": warnings,
        "duration_ms": int((time.perf_counter() - started) * 1000),
    }


@traced(
    "query.run",
    module=__name__,
    params_fn=lambda *, database, filters, page, page_size, **_: {
        "database": database,
        "page": page,
        "page_size": page_size,
        "filter_keys": sorted(filters or {}),
    },
)
def run_query(
    *,
    database: str,
    filters: Dict[str, Any],
    page: Any,
    page_size: Any,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    settings: Optional[Settings] = None,
) -> Dict[str, Any]:
    current_page, current_size = _clamp_page(page, page_size)
    if database == "postgres":
        return _query_postgres(
            session_factory, filters, current_page, current_size
        )
    if database == "parquet":
        parquet_table = str(filters.get("table") or filters.get("dataset") or "")
        if parquet_table in {"judgment_documents", "judgments"}:
            judgment_data_dir = (
                settings or Settings.from_env()
            ).judgment_data_dir
            return _query_judgment_parquet(
                judgment_data_dir, filters, current_page, current_size
            )
        return _query_parquet(data_dir, filters, current_page, current_size)
    if database == "qdrant":
        return _query_qdrant(
            settings=settings or Settings.from_env(),
            filters=filters,
            page=current_page,
            page_size=current_size,
        )
    if database == "indexeddb":
        return {
            "database": "indexeddb",
            "label": "IndexedDB",
            "status": "client_side",
            "message": "IndexedDB 由瀏覽器端查詢，不會經過伺服器。",
            "table": str(filters.get("store") or "query_history"),
            "columns": [],
            "rows": [],
            "total": 0,
            "page": current_page,
            "page_size": current_size,
            "duration_ms": 0,
            "summary": [],
            "distribution": [],
            "query_text": "INDEXEDDB QUERY",
            "warnings": [],
            "meta": {"filters": filters},
        }
    raise ValueError(f"不支援的資料庫：{database}")


@traced(
    "query.rag_preview",
    module=__name__,
    params_fn=lambda *, question, limit=3, **_: {
        "question_length": len(question or ""),
        "limit": limit,
    },
)
def rag_preview(
    *,
    session_factory: sessionmaker[Session],
    question: str,
    limit: int = 3,
) -> Dict[str, Any]:
    started = time.perf_counter()
    question = question.strip()
    if not question:
        raise ValueError("問題不可為空")

    matches: List[Dict[str, Any]] = []
    try:
        with session_factory() as session:
            records = session.scalars(
                select(LawDocument)
                .where(LawDocument.is_current.is_(True))
                .order_by(LawDocument.law_name)
            ).all()
        candidates = [
            record
            for record in records
            if len(record.law_name) >= 2 and record.law_name in question
        ]
        candidates.sort(key=lambda item: len(item.law_name), reverse=True)
        for record in candidates[:limit]:
            snippet = (record.law_effective_note or record.law_abandon_note or "").strip()
            if not snippet:
                snippet = f"{record.law_level} · {record.law_category} · {record.article_count} 條"
            matches.append(
                {
                    "law_name": record.law_name,
                    "law_level": record.law_level,
                    "law_category": record.law_category,
                    "article_count": record.article_count,
                    "law_url": record.law_url,
                    "snippet": snippet[:140],
                }
            )
    except Exception as exc:
        logger.warning("RAG preview lookup failed: %s", exc)
        return {
            "status": "unavailable",
            "answer": "目前無法連線法規資料庫，請稍後再試。",
            "notice": "目前無法取得法規資料，且判決向量檢索不可用；請確認 PostgreSQL 與 Qdrant 狀態。",
            "citations": [],
            "judgments": [],
            "matched_terms": [],
            "duration_ms": int((time.perf_counter() - started) * 1000),
        }

    if matches:
        names = "、".join(f"「{item['law_name']}」" for item in matches)
        answer = (
            f"目前為法規預覽模式，問題中可對應到 {names}。"
            "判決向量索引或 LLM 目前不可用，因此先顯示可驗證的法規 metadata，不生成推測答案。"
        )
    else:
        answer = (
            "目前判決向量索引或 LLM 不可用，且問題中沒有可直接對應的現行法規名稱，"
            "因此無法產生有依據的回答。請確認 Qdrant 索引與 LLM 設定。"
        )

    return {
        "status": "preview",
        "answer": answer,
        "notice": "此為法規 metadata 的關鍵字預覽，不是法律意見，也不會生成未出現在資料中的引用。",
        "citations": matches,
        "judgments": [],
        "matched_terms": [item["law_name"] for item in matches],
        "duration_ms": int((time.perf_counter() - started) * 1000),
    }
