from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from ..judgment_raw_parquet import raw_judgment_totals
from ..models import JudgmentDocument


def _count(value: Any) -> Optional[int]:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None
    return max(0, number)


def judgment_stats_from_counts(
    judgment_total: Any,
    financial_total: Any,
) -> Dict[str, Any]:
    total = _count(judgment_total)
    financial = _count(financial_total)
    ratio: Optional[float] = None
    if total and financial is not None:
        ratio = round(financial / total * 100, 1)
    return {
        "judgment_total": total,
        "financial_total": financial,
        "financial_ratio": ratio,
    }


def build_judgment_stats(
    session_factory: Optional[sessionmaker[Session]],
    data_dir: Path,
) -> Dict[str, Any]:
    errors = []
    judgment_total: Optional[int] = None
    try:
        totals = raw_judgment_totals(Path(data_dir).expanduser().resolve())
        judgment_total = int(totals.get("row_count") or 0)
    except Exception as exc:
        errors.append(
            f"無法掃描判決原始資料：{exc.__class__.__name__}: {exc}"
        )

    financial_total: Optional[int] = None
    if session_factory is None:
        errors.append("沒有可用的 PostgreSQL session")
    else:
        try:
            with session_factory() as session:
                financial_total = int(
                    session.scalar(
                        select(func.count())
                        .select_from(JudgmentDocument)
                        .where(JudgmentDocument.is_current.is_(True))
                    )
                    or 0
                )
        except Exception as exc:
            errors.append(
                f"無法查詢 PostgreSQL 判決數：{exc.__class__.__name__}: {exc}"
            )

    stats = judgment_stats_from_counts(judgment_total, financial_total)
    stats["available"] = (
        stats["judgment_total"] is not None
        and stats["financial_total"] is not None
    )
    stats["error"] = "；".join(errors)
    return stats
