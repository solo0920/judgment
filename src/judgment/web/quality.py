from __future__ import annotations

import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..index_versions import active_version
from ..judgment_index import index_coverage
from ..judgment_quality import compute_raw_quality
from ..judgment_raw_parquet import RAW_SCHEMA_VERSION, latest_raw_manifests
from ..models import JudgmentDocument
from ..observability import traced

logger = logging.getLogger(__name__)


def _int(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def _percent(part: int, total: int) -> Optional[float]:
    if total <= 0:
        return None
    return round(part / total * 100, 2)


def _empty_totals() -> Dict[str, Any]:
    return {
        "rows": 0,
        "unique_jids": 0,
        "duplicate_jid_groups": 0,
        "duplicate_jid_rows": 0,
        "missing_jid_rows": 0,
        "empty_text_rows": 0,
        "short_text_rows": 0,
        "missing_court_rows": 0,
        "missing_normalized_rows": 0,
        "missing_date_rows": 0,
        "invalid_date_rows": 0,
        "missing_title_rows": 0,
        "missing_pdf_rows": 0,
        "matched_rows": 0,
        "citation_total": 0,
        "inconsistent_law_rows": 0,
        "inconsistent_citation_rows": 0,
        "missing_hash_rows": 0,
        "duplicate_content_groups": 0,
        "duplicate_content_rows": 0,
        "match_rate": None,
        "date_min": None,
        "date_max": None,
    }


def _coverage(
    *,
    settings: Settings,
    session_factory: Optional[sessionmaker[Session]],
    raw_matched_rows: int,
) -> Dict[str, Any]:
    if session_factory is None:
        return {
            "status": "unavailable",
            "detail": "沒有可用的 PostgreSQL session。",
            "postgres_judgments": None,
            "postgres_diff": None,
            "postgres_coverage_pct": None,
            "vector_indexed": None,
            "vector_total": None,
            "vector_remaining": None,
            "vector_coverage_pct": None,
            "collection": settings.judgment_vector_collection,
            "model": settings.embedding_model,
            "latest_indexed_at": None,
        }
    try:
        with session_factory() as session:
            postgres_judgments = _int(
                session.scalar(select(func.count()).select_from(JudgmentDocument))
            )
        active_index = active_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
        collection = (
            active_index["physical_collection"]
            if active_index
            else settings.judgment_vector_collection
        )
        index = index_coverage(
            session_factory,
            collection=collection,
            model=settings.embedding_model,
            version_id=active_index["version_id"] if active_index else None,
        )
        indexed = _int(index.get("indexed_judgments"))
        total = _int(index.get("total_judgments"))
        return {
            "status": "operational",
            "detail": "PostgreSQL 與向量索引統計可用。",
            "postgres_judgments": postgres_judgments,
            "postgres_diff": postgres_judgments - int(raw_matched_rows),
            "postgres_coverage_pct": _percent(postgres_judgments, raw_matched_rows),
            "vector_indexed": indexed,
            "vector_total": total,
            "vector_remaining": _int(index.get("remaining_judgments")),
            "vector_coverage_pct": _percent(indexed, total),
            "collection": index.get("collection") or settings.judgment_vector_collection,
            "model": index.get("model") or settings.embedding_model,
            "alias": settings.judgment_vector_alias,
            "version_id": active_index["version_id"] if active_index else None,
            "latest_indexed_at": index.get("latest_indexed_at"),
        }
    except Exception as exc:
        logger.exception("failed to build quality coverage")
        return {
            "status": "unavailable",
            "detail": f"無法查詢 PostgreSQL／向量索引：{exc.__class__.__name__}",
            "postgres_judgments": None,
            "postgres_diff": None,
            "postgres_coverage_pct": None,
            "vector_indexed": None,
            "vector_total": None,
            "vector_remaining": None,
            "vector_coverage_pct": None,
            "collection": settings.judgment_vector_collection,
            "model": settings.embedding_model,
            "latest_indexed_at": None,
        }


def _warnings(
    *,
    raw: Dict[str, Any],
    coverage: Dict[str, Any],
) -> List[str]:
    warnings: List[str] = []
    schema_versions = raw.get("schema_versions") or []
    if schema_versions and any(
        int(version) < RAW_SCHEMA_VERSION for version in schema_versions
    ):
        warnings.append(
            "原始 Parquet 仍有舊版 manifest（"
            + "、".join(f"v{version}" for version in schema_versions)
            + "）；建議完成目前版本重建後再比較統計。"
        )
    candidate_archives = _int(raw.get("candidate_archive_count"))
    archive_count = len(raw.get("archives") or [])
    if candidate_archives < archive_count:
        warnings.append(
            f"僅 {candidate_archives}/{archive_count} 個 manifest 有 DuckDB candidate_count；"
            "舊版檔案只會顯示精確命中數。"
        )
    postgres_diff = coverage.get("postgres_diff")
    if (
        coverage.get("status") == "operational"
        and postgres_diff is not None
        and int(postgres_diff) != 0
    ):
        warnings.append(
            "PostgreSQL 判決數與原始 Parquet 精確命中相差 "
            f"{int(postgres_diff):,} 筆；可能尚未完成匯入或存在重複 JID。"
        )
    vector_coverage = coverage.get("vector_coverage_pct")
    if (
        coverage.get("status") == "operational"
        and vector_coverage is not None
        and float(vector_coverage) < 100
    ):
        warnings.append(
            "向量索引尚未完成："
            f"{int(coverage.get('vector_indexed') or 0):,} / "
            f"{int(coverage.get('vector_total') or 0):,}（{vector_coverage:.1f}%）。"
        )
    for check in raw.get("checks") or []:
        if check.get("severity") == "danger" and int(check.get("count") or 0) > 0:
            warnings.append(
                f"{check.get('label')}：{int(check.get('count') or 0):,} 筆。"
            )
    return warnings


@traced(
    "quality.build_snapshot",
    module=__name__,
    params_fn=lambda **_: {},
)
def build_quality_snapshot(
    *,
    settings: Settings,
    session_factory: Optional[sessionmaker[Session]] = None,
) -> Dict[str, Any]:
    """Build a DuckDB-backed data-quality report for raw judgment Parquet."""

    started = time.perf_counter()
    manifests = latest_raw_manifests(settings.judgment_data_dir)
    if not manifests:
        coverage = _coverage(
            settings=settings,
            session_factory=session_factory,
            raw_matched_rows=0,
        )
        return {
            "status": "empty",
            "available": False,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "duration_ms": int((time.perf_counter() - started) * 1000),
            "source": {
                "engine": "duckdb",
                "raw_files": 0,
                "compressed_bytes": 0,
                "schema_versions": [],
                "candidate_total": None,
                "candidate_archive_count": 0,
                "archive_count": 0,
            },
            "totals": _empty_totals(),
            "archives": [],
            "checks": [],
            "summary": {
                "danger_count": 0,
                "warning_count": 0,
                "info_count": 0,
                "ok_count": 0,
            },
            "distributions": {"courts": [], "years": [], "laws": [], "titles": []},
            "coverage": coverage,
            "warnings": ["尚未建立可讀取的原始判決 Parquet 備份。"],
        }

    raw = compute_raw_quality(manifests)
    totals = raw.get("totals") or {}
    coverage = _coverage(
        settings=settings,
        session_factory=session_factory,
        raw_matched_rows=_int(totals.get("matched_rows")),
    )
    warnings = _warnings(raw=raw, coverage=coverage)
    summary = raw.get("summary") or {}
    warning_ratio = max(
        (
            float(check.get("percent") or 0)
            for check in raw.get("checks") or []
            if check.get("severity") == "warn" and _int(check.get("count")) > 0
        ),
        default=0.0,
    )
    degraded = (
        _int(summary.get("danger_count")) > 0
        or warning_ratio >= 1.0
        or (
            coverage.get("status") == "operational"
            and _int(coverage.get("postgres_diff")) != 0
        )
    )
    return {
        "status": "degraded" if degraded else "operational",
        "available": True,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "duration_ms": int((time.perf_counter() - started) * 1000),
        "scan_ms": _int(raw.get("scan_ms")),
        "source": {
            "engine": "duckdb",
            "raw_files": len(manifests),
            "compressed_bytes": _int(raw.get("compressed_bytes")),
            "schema_versions": raw.get("schema_versions") or [],
            "candidate_total": raw.get("candidate_total"),
            "candidate_archive_count": _int(raw.get("candidate_archive_count")),
            "archive_count": len(manifests),
        },
        "totals": totals,
        "archives": raw.get("archives") or [],
        "checks": raw.get("checks") or [],
        "summary": summary,
        "distributions": raw.get("distributions") or {},
        "coverage": coverage,
        "warnings": warnings,
    }
