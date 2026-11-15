"""Live homepage summary and provenance payload.

The homepage must stay useful even while the slower status, quality and
processing endpoints are still loading.  This module deliberately performs only
cheap PostgreSQL aggregate queries, one manifest scan, the active index version
lookup and a small file read.  Every data-gathering step is timed so the frontend
can draw the same pipeline-waterfall contract used elsewhere in the console.
"""

from __future__ import annotations

import hashlib
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..index_versions import active_version
from ..judgment_raw_parquet import raw_judgment_totals
from ..legal_index import active_legal_version
from ..models import (
    DownloadRun,
    JudgmentDocument,
    JudgmentVectorIndex,
    LawDatasetVersion,
    LawDocument,
)
from .judgment_stats import judgment_stats_from_counts

REPO_ROOT = Path(__file__).resolve().parents[3]
OPENDATA_URL = "https://opendata.judicial.gov.tw/"
LAW_SOURCE_URL = "https://law.moj.gov.tw/"
DEFAULT_LAW_LIST = REPO_ROOT / "documents" / "金融法規.md"

STAGE_COLORS = {
    "laws": "#3b82f6",
    "judgments": "#0ea5e9",
    "raw": "#ec4899",
    "judgment_index": "#a78bfa",
    "legal_index": "#14b8a6",
    "financial_laws": "#f59e0b",
    "assemble": "#94a3b8",
}


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _int(value: Any) -> int:
    try:
        return max(0, int(value or 0))
    except (TypeError, ValueError):
        return 0


def _percent(part: Any, total: Any) -> Optional[float]:
    part_number = _int(part)
    total_number = _int(total)
    if total_number <= 0:
        return None
    return round(part_number / total_number * 100, 1)


def _display_path(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except (OSError, ValueError):
        return str(path)


def _law_list_candidates(settings: Settings) -> List[Path]:
    configured = Path(settings.judgment_law_list).expanduser()
    candidates = [configured]
    if not configured.is_absolute():
        candidates.extend(
            [
                Path.cwd() / configured,
                REPO_ROOT / configured,
            ]
        )
    candidates.append(DEFAULT_LAW_LIST)
    seen: set[Path] = set()
    unique: List[Path] = []
    for candidate in candidates:
        try:
            resolved = candidate.resolve()
        except OSError:
            resolved = candidate
        if resolved in seen:
            continue
        seen.add(resolved)
        unique.append(resolved)
    return unique


def load_financial_laws(settings: Settings) -> Dict[str, Any]:
    """Read the authoritative financial-law checklist without duplicating it."""

    for candidate in _law_list_candidates(settings):
        try:
            if not candidate.is_file():
                continue
            text = candidate.read_text(encoding="utf-8")
            stat = candidate.stat()
        except OSError:
            continue
        laws: List[str] = []
        for raw_line in text.splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith(("- ", "* ", "+ ")):
                line = line[2:].strip()
            if line:
                laws.append(line)
        return {
            "available": bool(laws),
            "count": len(laws),
            "laws": laws,
            "content": text,
            "source_path": _display_path(candidate),
            "source_sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
            "modified_at": datetime.fromtimestamp(
                stat.st_mtime, tz=timezone.utc
            ).isoformat(),
            "error": "" if laws else "金融法規清單沒有可用的法規名稱。",
        }
    return {
        "available": False,
        "count": 0,
        "laws": [],
        "content": "",
        "source_path": _display_path(Path(settings.judgment_law_list)),
        "source_sha256": "",
        "modified_at": None,
        "error": "找不到金融法規清單。",
    }


def _law_metrics(session_factory: sessionmaker[Session]) -> Dict[str, Any]:
    with session_factory() as session:
        rows = session.execute(
            select(
                LawDocument.source_type,
                func.count(),
                func.coalesce(func.sum(LawDocument.article_count), 0),
            )
            .where(LawDocument.is_current.is_(True))
            .group_by(LawDocument.source_type)
        ).all()
        version_count = _int(
            session.scalar(select(func.count()).select_from(LawDatasetVersion))
        )
        run_count = _int(
            session.scalar(select(func.count()).select_from(DownloadRun))
        )
    by_source = {
        str(source_type): (int(count), _int(articles))
        for source_type, count, articles in rows
    }
    law_count, law_articles = by_source.get("law", (0, 0))
    order_count, order_articles = by_source.get("order", (0, 0))
    return {
        "available": True,
        "law_count": law_count,
        "order_count": order_count,
        "law_article_count": law_articles,
        "order_article_count": order_articles,
        "article_count": law_articles + order_articles,
        "version_count": version_count,
        "run_count": run_count,
        "error": "",
    }


def _judgment_metrics(session_factory: sessionmaker[Session]) -> Dict[str, Any]:
    with session_factory() as session:
        count, date_min, date_max = session.execute(
            select(
                func.count(),
                func.min(JudgmentDocument.jdate),
                func.max(JudgmentDocument.jdate),
            ).where(JudgmentDocument.is_current.is_(True))
        ).one()
    date_min_text = str(date_min or "").strip()
    date_max_text = str(date_max or "").strip()
    year_min = (
        int(date_min_text[:4])
        if len(date_min_text) >= 4 and date_min_text[:4].isdigit()
        else None
    )
    year_max = (
        int(date_max_text[:4])
        if len(date_max_text) >= 4 and date_max_text[:4].isdigit()
        else None
    )
    year_span = (
        year_max - year_min + 1
        if year_min is not None and year_max is not None and year_max >= year_min
        else None
    )
    return {
        "available": True,
        "financial_total": _int(count),
        "date_min": date_min_text or None,
        "date_max": date_max_text or None,
        "year_min": year_min,
        "year_max": year_max,
        "year_span": year_span,
        "error": "",
    }


def _raw_metrics(settings: Settings) -> Dict[str, Any]:
    totals = raw_judgment_totals(
        Path(settings.judgment_data_dir).expanduser().resolve()
    )
    return {
        "available": True,
        "raw_total": _int(totals.get("row_count")),
        "archive_count": _int(totals.get("file_count")),
        "compressed_bytes": _int(totals.get("compressed_bytes")),
        "error": "",
    }


def _judgment_index_metrics(
    *,
    settings: Settings,
    session_factory: sessionmaker[Session],
    financial_total: int,
) -> Dict[str, Any]:
    active = active_version(
        session_factory, alias_name=settings.judgment_vector_alias
    )
    collection = (
        str(active.get("physical_collection"))
        if active and active.get("physical_collection")
        else settings.judgment_vector_collection
    )
    version_id = active.get("version_id") if active else None
    model = (
        str(active.get("embedding_model"))
        if active and active.get("embedding_model")
        else settings.embedding_model
    )
    filters = [
        JudgmentVectorIndex.collection == collection,
        JudgmentVectorIndex.model == model,
    ]
    if version_id is not None:
        filters.append(JudgmentVectorIndex.version_id == int(version_id))
    with session_factory() as session:
        indexed = _int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(*filters)
            )
        )
        latest = session.scalar(
            select(func.max(JudgmentVectorIndex.indexed_at)).where(*filters)
        )
    total = financial_total
    return {
        "available": True,
        "indexed": indexed,
        "total": total,
        "remaining": max(0, total - indexed),
        "coverage_pct": _percent(indexed, total),
        "collection": collection,
        "alias": settings.judgment_vector_alias,
        "version_id": version_id,
        "model": model,
        "latest_indexed_at": latest.isoformat() if latest else None,
        "error": "",
    }


def _legal_index_metrics(
    *,
    settings: Settings,
    session_factory: sessionmaker[Session],
    current_article_count: int,
) -> Dict[str, Any]:
    active = active_legal_version(
        session_factory, alias_name=settings.legal_article_vector_alias
    )
    points = _int(
        (active or {}).get("indexed_count")
        or (active or {}).get("article_count")
        or 0
    )
    return {
        "available": bool(active),
        "alias": settings.legal_article_vector_alias,
        "collection": (
            str(active.get("physical_collection"))
            if active and active.get("physical_collection")
            else settings.legal_article_vector_collection
        ),
        "version_id": active.get("version_id") if active else None,
        "points_count": points,
        "article_count": _int(
            (active or {}).get("article_count") or current_article_count
        ),
        "law_count": _int((active or {}).get("law_count")),
        "model": (
            str(active.get("embedding_model"))
            if active and active.get("embedding_model")
            else settings.embedding_model
        ),
        "dimension": (active or {}).get("embedding_dimension"),
        "activated_at": (active or {}).get("activated_at"),
        "error": "" if active else "尚無 active 法規／命令索引版本。",
    }


class _Pipeline:
    def __init__(self) -> None:
        self.started_at = _utcnow()
        self.started = time.perf_counter()
        self.stages: List[Dict[str, Any]] = []

    def run(
        self,
        key: str,
        label: str,
        caption: str,
        fn: Callable[[], Any],
    ) -> Tuple[Any, str, Dict[str, Any]]:
        started_at = _utcnow()
        started = time.perf_counter()
        error = ""
        result: Any
        status = "success"
        try:
            result = fn()
        except Exception as exc:  # noqa: BLE001 - partial summary is intentional
            result = None
            status = "failed"
            error = f"{exc.__class__.__name__}: {exc}"
        finished_at = _utcnow()
        stage = {
            "key": key,
            "label": label,
            "caption": caption,
            "color": STAGE_COLORS.get(key, "#64748b"),
            "status": status,
            "started_at": started_at,
            "finished_at": finished_at,
            "duration_ms": max(0, int((time.perf_counter() - started) * 1000)),
            "message": error,
        }
        self.stages.append(stage)
        return result, error, stage

    def finish(self) -> Dict[str, Any]:
        finished_at = _utcnow()
        total_ms = max(
            0, int((time.perf_counter() - self.started) * 1000)
        )
        measured_ms = sum(_int(stage["duration_ms"]) for stage in self.stages)
        overhead_ms = max(0, total_ms - measured_ms)
        if overhead_ms:
            self.stages.append(
                {
                    "key": "assemble",
                    "label": "彙整首頁摘要",
                    "caption": "即時指標、RAG 能力與來源 payload",
                    "color": STAGE_COLORS["assemble"],
                    "status": "success",
                    "started_at": self.stages[-1]["finished_at"]
                    if self.stages
                    else self.started_at,
                    "finished_at": finished_at,
                    "duration_ms": overhead_ms,
                    "message": "組合首頁即時資料回應",
                }
            )
        return {
            "label": "首頁即時摘要載入",
            "started_at": self.started_at,
            "finished_at": finished_at,
            "total_ms": total_ms,
            "stages": self.stages,
        }


def build_home_summary(
    *,
    settings: Settings,
    session_factory: Optional[sessionmaker[Session]],
) -> Dict[str, Any]:
    pipeline = _Pipeline()
    errors: List[str] = []
    laws: Dict[str, Any] = {
        "available": False,
        "law_count": 0,
        "order_count": 0,
        "law_article_count": 0,
        "order_article_count": 0,
        "article_count": 0,
        "version_count": 0,
        "run_count": 0,
        "error": "沒有可用的 PostgreSQL session。",
    }
    judgments: Dict[str, Any] = {
        "available": False,
        "financial_total": 0,
        "date_min": None,
        "date_max": None,
        "year_min": None,
        "year_max": None,
        "year_span": None,
        "error": "沒有可用的 PostgreSQL session。",
    }
    raw: Dict[str, Any] = {
        "available": False,
        "raw_total": 0,
        "archive_count": 0,
        "compressed_bytes": 0,
        "error": "",
    }
    judgment_index: Dict[str, Any] = {
        "available": False,
        "indexed": 0,
        "total": 0,
        "remaining": 0,
        "coverage_pct": None,
        "collection": settings.judgment_vector_collection,
        "alias": settings.judgment_vector_alias,
        "version_id": None,
        "model": settings.embedding_model,
        "latest_indexed_at": None,
        "error": "沒有可用的 PostgreSQL session。",
    }
    legal_index: Dict[str, Any] = {
        "available": False,
        "alias": settings.legal_article_vector_alias,
        "collection": settings.legal_article_vector_collection,
        "version_id": None,
        "points_count": 0,
        "article_count": 0,
        "law_count": 0,
        "model": settings.embedding_model,
        "dimension": None,
        "activated_at": None,
        "error": "沒有可用的 PostgreSQL session。",
    }
    financial_laws: Dict[str, Any] = {
        "available": False,
        "count": 0,
        "laws": [],
        "content": "",
        "source_path": _display_path(Path(settings.judgment_law_list)),
        "source_sha256": "",
        "modified_at": None,
        "error": "尚未讀取金融法規清單。",
    }

    if session_factory is None:
        errors.append("沒有可用的 PostgreSQL session。")
    else:
        result, error, stage = pipeline.run(
            "laws",
            "法規／命令統計",
            "PostgreSQL current 筆數與條文數",
            lambda: _law_metrics(session_factory),
        )
        if result:
            laws = result
            stage["message"] = (
                f"{laws['law_count']:,} 法規 · "
                f"{laws['order_count']:,} 命令 · "
                f"{laws['article_count']:,} 條文"
            )
        else:
            laws["error"] = error
            stage["message"] = error
            errors.append(f"法規／命令統計：{error}")

        result, error, stage = pipeline.run(
            "judgments",
            "金融判決統計",
            "current 筆數與裁判日期範圍",
            lambda: _judgment_metrics(session_factory),
        )
        if result:
            judgments = result
            stage["message"] = (
                f"{judgments['financial_total']:,} 筆 · "
                f"{judgments['year_min']}–{judgments['year_max']}"
                if judgments["year_min"] and judgments["year_max"]
                else f"{judgments['financial_total']:,} 筆"
            )
        else:
            judgments["error"] = error
            stage["message"] = error
            errors.append(f"金融判決統計：{error}")

    result, error, stage = pipeline.run(
        "raw",
        "原始判決 manifest",
        "司法院 OpenData 原始 Parquet 備份",
        lambda: _raw_metrics(settings),
    )
    if result:
        raw = result
        stage["message"] = (
            f"{raw['archive_count']:,} 個 archive · "
            f"{raw['raw_total']:,} 筆原始判決"
        )
    else:
        raw["error"] = error
        stage["message"] = error
        errors.append(f"原始判決 manifest：{error}")

    if session_factory is not None:
        result, error, stage = pipeline.run(
            "judgment_index",
            "判決向量索引",
            "active alias、版本與已索引筆數",
            lambda: _judgment_index_metrics(
                settings=settings,
                session_factory=session_factory,
                financial_total=_int(judgments.get("financial_total")),
            ),
        )
        if result:
            judgment_index = result
            stage["message"] = (
                f"{judgment_index['indexed']:,} / "
                f"{judgment_index['total']:,} 筆 · "
                f"{judgment_index['collection']}"
            )
        else:
            judgment_index["error"] = error
            stage["message"] = error
            errors.append(f"判決向量索引：{error}")

        result, error, stage = pipeline.run(
            "legal_index",
            "法規／命令索引",
            "active 條文索引版本與維度",
            lambda: _legal_index_metrics(
                settings=settings,
                session_factory=session_factory,
                current_article_count=_int(laws.get("article_count")),
            ),
        )
        if result:
            legal_index = result
            stage["message"] = (
                f"{legal_index['points_count']:,} points · "
                f"{legal_index['collection']}"
                if legal_index["available"]
                else "尚無 active 法規／命令索引版本"
            )
        else:
            legal_index["error"] = error
            stage["message"] = error
            errors.append(f"法規／命令索引：{error}")

    result, error, stage = pipeline.run(
        "financial_laws",
        "金融法規清單",
        "documents/金融法規.md",
        lambda: load_financial_laws(settings),
    )
    if result:
        financial_laws = result
        stage["message"] = (
            f"{financial_laws['count']} 條 · {financial_laws['source_path']}"
        )
    else:
        financial_laws["error"] = error
        stage["message"] = error
        errors.append(f"金融法規清單：{error}")

    pipeline_payload = pipeline.finish()
    raw_available = bool(raw.get("available"))
    raw_total = _int(raw.get("raw_total")) if raw_available else None
    financial_total = (
        _int(judgments.get("financial_total"))
        if judgments.get("available")
        else None
    )
    stats = judgment_stats_from_counts(raw_total, financial_total)
    coverage_pct = _percent(
        judgment_index.get("indexed"), judgment_index.get("total")
    )
    judgment_index["coverage_pct"] = coverage_pct
    judgment_index["remaining"] = max(
        0,
        _int(judgment_index.get("total"))
        - _int(judgment_index.get("indexed")),
    )
    if not raw_available:
        raw["raw_total"] = None
        raw["archive_count"] = None
    judgments.update(
        {
            "raw_total": raw_total,
            "archive_count": (
                _int(raw.get("archive_count")) if raw_available else None
            ),
            "financial_ratio": stats["financial_ratio"],
            "judgment_total": stats["judgment_total"],
        }
    )
    legal_index["current_article_count"] = _int(laws.get("article_count"))

    failed_stages = [
        stage for stage in pipeline_payload["stages"] if stage["status"] == "failed"
    ]
    status = "degraded" if failed_stages or errors else "operational"

    return {
        "status": status,
        "generated_at": pipeline_payload["finished_at"],
        "errors": errors,
        "pipeline": pipeline_payload,
        "data": {
            "laws": laws,
            "judgments": judgments,
            "raw": raw,
            "rag": {
                "available": bool(
                    _int(judgment_index.get("indexed"))
                    or _int(legal_index.get("points_count"))
                ),
                "judgment_index": judgment_index,
                "legal_index": legal_index,
                "models": {
                    "embedding": settings.embedding_model,
                    "llm": settings.llm_model,
                    "rerank": settings.rerank_model,
                    "rerank_enabled": bool(settings.rag_rerank_enabled),
                    "embedding_dimension": legal_index.get("dimension"),
                },
            },
            "financial_laws": financial_laws,
            "sources": {
                "opendata": {
                    "label": "司法院資料開放平臺",
                    "url": OPENDATA_URL,
                    "category": settings.judgment_download_category,
                    "description": "裁判書原始壓縮檔與判決全文",
                },
                "laws": {
                    "label": "全國法規資料庫",
                    "url": LAW_SOURCE_URL,
                    "law_api_url": settings.law_api_url,
                    "order_api_url": settings.order_api_url,
                    "description": "現行法規、命令與條文版本",
                },
                "financial_laws": {
                    "label": "金融法規清單",
                    "path": financial_laws.get("source_path"),
                    "sha256": financial_laws.get("source_sha256"),
                    "description": "判決匯入時用來篩選金融相關案件",
                },
            },
        },
    }


__all__ = ["build_home_summary", "load_financial_laws"]
