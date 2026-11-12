from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from collections import Counter
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import and_, case, func, select, text

from .config import Settings
from .courts import CANONICAL_COURTS, canonical_court_prefix, normalize_court
from .db import build_engine, build_session_factory, init_db
from .models import JudgmentDocument
from .observability import record_performance

logger = logging.getLogger(__name__)


def normalize_judgment_courts(
    *,
    session_factory,
    batch_size: int = 1000,
    limit: Optional[int] = None,
    all_rows: bool = False,
    dry_run: bool = False,
) -> Dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    batch_size = max(1, int(batch_size))
    scanned = normalized = unresolved = updated = 0
    court_counts: Counter[str] = Counter()
    unresolved_samples: Counter[str] = Counter()

    last_id = 0
    while True:
        if limit is not None:
            remaining = limit - scanned
            if remaining <= 0:
                break
            current_size = min(batch_size, remaining)
        else:
            current_size = batch_size

        with session_factory() as session:
            statement = select(
                JudgmentDocument.id, JudgmentDocument.court, JudgmentDocument.jid
            ).where(JudgmentDocument.id > last_id)
            if not all_rows:
                statement = statement.where(JudgmentDocument.court_normalized == "")
            statement = statement.order_by(JudgmentDocument.id).limit(current_size)
            rows: List[Tuple[int, str, str]] = [
                (int(row[0]), str(row[1] or ""), str(row[2] or ""))
                for row in session.execute(statement).all()
            ]

        if not rows:
            break
        last_id = rows[-1][0]
        scanned += len(rows)

        resolved: List[Tuple[int, str]] = []
        pending: List[Tuple[int, str, str]] = []
        for row_id, court, jid in rows:
            value = canonical_court_prefix(court)
            if value:
                resolved.append((row_id, value))
            else:
                pending.append((row_id, court, jid))

        if pending:
            ids = [row_id for row_id, _, _ in pending]
            with session_factory() as session:
                heads = {
                    int(row_id): str(head or "")
                    for row_id, head in session.execute(
                        select(
                            JudgmentDocument.id,
                            func.substr(JudgmentDocument.full_text, 1, 8000),
                        ).where(JudgmentDocument.id.in_(ids))
                    ).all()
                }
            for row_id, court, jid in pending:
                value = normalize_court(court, heads.get(row_id, ""), jid=jid)
                if value:
                    resolved.append((row_id, value))
                else:
                    unresolved += 1
                    if court:
                        unresolved_samples[court[:80]] += 1

        normalized += len(resolved)
        for _, value in resolved:
            court_counts[value] += 1

        if not dry_run and resolved:
            with session_factory() as session:
                session.execute(
                    text(
                        "UPDATE judgment_documents "
                        "SET court_normalized = :court WHERE id = :row_id"
                    ),
                    [
                        {"row_id": row_id, "court": value}
                        for row_id, value in resolved
                    ],
                )
                session.commit()
            updated += len(resolved)

        logger.info(
            "scanned=%s normalized=%s unresolved=%s updated=%s",
            scanned,
            normalized,
            unresolved,
            updated,
        )

    duration_ms = int((time.perf_counter() - started) * 1000)
    status = "dry_run" if dry_run else "success"
    summary = {
        "status": status,
        "scanned_count": scanned,
        "normalized_count": normalized,
        "updated_count": updated,
        "unresolved_count": unresolved,
        "duration_ms": duration_ms,
        "all_rows": all_rows,
        "courts": [
            {"court": court, "count": count}
            for court, count in court_counts.most_common(40)
        ],
        "unresolved_samples": [
            {"court": court, "count": count}
            for court, count in unresolved_samples.most_common(20)
        ],
    }

    record_performance(
        session_factory,
        process="判決法院正規化" + ("（試跑）" if dry_run else ""),
        module="judgment.court_normalize.normalize_judgment_courts",
        status=status,
        started_at=started_at,
        finished_at=datetime.now(timezone.utc),
        duration_ms=duration_ms,
        params={
            "batch_size": batch_size,
            "limit": limit,
            "all_rows": all_rows,
        },
        details={
            "scanned_count": scanned,
            "normalized_count": normalized,
            "updated_count": updated,
            "unresolved_count": unresolved,
        },
    )
    return summary


def check_court_normalization(session_factory) -> Dict[str, Any]:
    """Read-only per-month coverage check for court normalization."""

    canonical = tuple(CANONICAL_COURTS)
    with session_factory() as session:
        rows = session.execute(
            select(
                JudgmentDocument.issue_month,
                func.count(),
                func.sum(
                    case(
                        (JudgmentDocument.court_normalized != "", 1),
                        else_=0,
                    )
                ),
                func.sum(
                    case(
                        (JudgmentDocument.court_normalized == "", 1),
                        else_=0,
                    )
                ),
                func.sum(
                    case(
                        (
                            and_(
                                JudgmentDocument.court_normalized != "",
                                JudgmentDocument.court_normalized.notin_(canonical),
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ),
            )
            .where(JudgmentDocument.is_current.is_(True))
            .group_by(JudgmentDocument.issue_month)
            .order_by(JudgmentDocument.issue_month.desc())
        ).all()

    months: List[Dict[str, Any]] = []
    summary = {"green": 0, "red": 0, "gray": 0}
    total_count = checked_count = unchecked_count = invalid_count = 0
    for month_key, total, checked, unchecked, invalid in rows:
        key = str(month_key or "")
        if len(key) != 6 or not key.isdigit():
            continue
        total_value = int(total or 0)
        checked_value = int(checked or 0)
        unchecked_value = int(unchecked or 0)
        invalid_value = int(invalid or 0)
        needs_value = unchecked_value + invalid_value
        attempted = total_value - unchecked_value
        if total_value and needs_value == 0:
            status = "green"
        elif attempted <= 0:
            status = "red"
        else:
            status = "gray"
        summary[status] += 1
        total_count += total_value
        checked_count += checked_value
        unchecked_count += unchecked_value
        invalid_count += invalid_value
        months.append(
            {
                "month": key,
                "year": int(key[:4]),
                "month_no": int(key[4:6]),
                "total": total_value,
                "checked": checked_value,
                "unchecked": unchecked_value,
                "invalid": invalid_value,
                "needs_normalization": needs_value,
                "valid": total_value - needs_value,
                "percent": round(
                    100.0 * (total_value - needs_value) / total_value, 1
                )
                if total_value
                else None,
                "status": status,
            }
        )
    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "canonical_count": len(CANONICAL_COURTS),
        "months": months,
        "summary": summary,
        "totals": {
            "total": total_count,
            "checked": checked_count,
            "unchecked": unchecked_count,
            "invalid": invalid_count,
            "needs_normalization": unchecked_count + invalid_count,
            "valid": total_count - unchecked_count - invalid_count,
        },
    }


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="將 judgment_documents.court 正規化為標準法院名稱。"
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="SQLAlchemy database URL（預設 DATABASE_URL）",
    )
    parser.add_argument(
        "--batch-size", type=int, default=1000, help="每批處理筆數（預設 1000）"
    )
    parser.add_argument("--limit", type=int, default=None, help="最多處理筆數")
    parser.add_argument(
        "--all",
        action="store_true",
        help="重新處理所有判決，而不只處理尚未正規化的資料",
    )
    parser.add_argument("--dry-run", action="store_true", help="只統計，不寫入資料庫")
    parser.add_argument("--log-level", default=None, help="DEBUG, INFO, WARNING, ERROR")
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    settings = Settings.from_env().with_overrides(
        database_url=args.database_url,
        log_level=args.log_level,
    )
    configure_logging(settings.log_level)

    engine = build_engine(settings.database_url)
    init_db(engine)
    session_factory = build_session_factory(engine)
    try:
        summary = normalize_judgment_courts(
            session_factory=session_factory,
            batch_size=args.batch_size,
            limit=args.limit,
            all_rows=args.all,
            dry_run=args.dry_run,
        )
    finally:
        engine.dispose()

    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
