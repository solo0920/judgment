"""Plan and apply audited holdout retirements.

Holdout questions are never promoted automatically from shared questions:
a shared question has already been visible to the development workflow,
benchmark reports, and agent exports, so it is no longer unseen evaluation
data.  New holdout questions must be written and reviewed by a human.

Planning only creates retirement proposals for holdout questions that have
real benchmark usage and have been idle for a long time.  Applying a proposal
is always an explicit admin action and only marks the question stale.
"""

from __future__ import annotations

import logging
from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, sessionmaker

from ..models import (
    BenchmarkCaseResult,
    BenchmarkRun,
    QuestionBankItem,
    RagHoldoutRotation,
)
from .feedback import FeedbackError

logger = logging.getLogger(__name__)

ROTATION_DIRECTIONS = ("retire",)
ROTATION_STATUSES = ("pending", "applied", "rejected", "expired")
RETIRE_MIN_AGE_DAYS = 180
RETIRE_MIN_USES = 2
RETIRE_IDLE_DAYS = 180
COVERAGE_ITEM_LIMIT = 5000


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    aware = _aware(value)
    return aware.isoformat() if aware else None


def _item_signals(item: QuestionBankItem, now: datetime) -> Dict[str, Any]:
    created = _aware(item.created_at) or now
    return {
        "age_days": max(0, int((now - created).days)),
        "question_type": item.question_type,
        "difficulty": item.difficulty,
        "version": int(item.version or 1),
    }


def _last_holdout_use(
    session: Session, item_ids: List[int]
) -> Dict[int, Dict[str, Any]]:
    if not item_ids:
        return {}
    rows = session.execute(
        select(
            BenchmarkCaseResult.item_id,
            func.count(),
            func.max(BenchmarkCaseResult.finished_at),
        )
        .where(
            BenchmarkCaseResult.item_id.in_(item_ids),
            BenchmarkCaseResult.status == "success",
        )
        .group_by(BenchmarkCaseResult.item_id)
    ).all()
    return {
        int(item_id): {
            "uses": int(uses or 0),
            "last_used_at": _aware(last_used),
        }
        for item_id, uses, last_used in rows
    }


def _coverage(session: Session) -> Dict[str, Any]:
    items = list(
        session.scalars(
            select(QuestionBankItem)
            .where(QuestionBankItem.deleted_at.is_(None))
            .order_by(QuestionBankItem.id.asc())
            .limit(COVERAGE_ITEM_LIMIT)
        ).all()
    )
    shared = [
        item
        for item in items
        if item.visibility == "shared"
        and item.status == "accepted"
        and not item.stale
    ]
    holdout = [
        item
        for item in items
        if item.visibility == "holdout"
        and item.status == "accepted"
        and not item.stale
    ]

    def _keys(item: QuestionBankItem, dimension: str) -> Iterable[str]:
        if dimension == "question_type":
            return [str(item.question_type or "unknown")]
        if dimension == "difficulty":
            return [str(item.difficulty or "unknown")]
        if dimension == "law":
            return [
                str(value.get("law_name") or "").strip()
                for value in (item.expected_laws or [])
                if isinstance(value, dict) and value.get("law_name")
            ]
        if dimension == "tag":
            return [str(value).strip() for value in (item.tags or []) if value]
        return []

    dimensions: Dict[str, Dict[str, Any]] = {}
    gaps: List[Dict[str, Any]] = []
    for dimension in ("question_type", "difficulty", "law", "tag"):
        shared_counts = Counter(
            key for item in shared for key in _keys(item, dimension)
        )
        holdout_counts = Counter(
            key for item in holdout for key in _keys(item, dimension)
        )
        rows = []
        for key, shared_count in shared_counts.most_common(50):
            holdout_count = int(holdout_counts.get(key, 0))
            rows.append(
                {
                    "key": key,
                    "shared": int(shared_count),
                    "holdout": holdout_count,
                }
            )
            if holdout_count == 0:
                gaps.append(
                    {
                        "dimension": dimension,
                        "key": key,
                        "shared": int(shared_count),
                        "holdout": 0,
                    }
                )
        dimensions[dimension] = rows

    refusal_shared = sum(
        1 for item in shared if item.question_type == "refusal"
    )
    refusal_holdout = sum(
        1 for item in holdout if item.question_type == "refusal"
    )
    if refusal_shared and not refusal_holdout:
        gaps.append(
            {
                "dimension": "refusal",
                "key": "refusal",
                "shared": refusal_shared,
                "holdout": 0,
            }
        )
    gaps.sort(key=lambda row: (-int(row["shared"]), row["dimension"], row["key"]))
    usage = _last_holdout_use(session, [int(item.id) for item in holdout])
    unused_holdout = sum(
        1
        for item in holdout
        if int((usage.get(int(item.id)) or {}).get("uses") or 0)
        < RETIRE_MIN_USES
    )
    return {
        "shared": len(shared),
        "holdout": len(holdout),
        "unused_holdout": unused_holdout,
        "dimensions": dimensions,
        "refusal": {"shared": refusal_shared, "holdout": refusal_holdout},
        "gaps": gaps[:20],
        "note": "Holdout 只能由人工撰寫新題目補充；shared 題目不得自動晉升。",
    }


def plan_holdout_rotation(
    session_factory: sessionmaker[Session],
    *,
    actor: str,
    max_retirements: int = 3,
    min_holdout: int = 20,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    now = _aware(now or _now()) or _now()
    max_retirements = max(0, min(10, int(max_retirements)))
    with session_factory() as session:
        stale_pending = session.scalars(
            select(RagHoldoutRotation).where(
                RagHoldoutRotation.status == "pending",
                (
                    (RagHoldoutRotation.created_at < now - timedelta(days=30))
                    | (RagHoldoutRotation.direction == "promote")
                ),
            )
        ).all()
        for row in stale_pending:
            row.status = "expired"
            row.review_comment = (
                row.review_comment
                or "自動晉升已停用；holdout 需由人工撰寫新題目。"
            )
            row.updated_at = now
        session.flush()

        coverage = _coverage(session)
        holdout_count = int(coverage["holdout"])
        active_runs = int(
            session.scalar(
                select(func.count())
                .select_from(BenchmarkRun)
                .where(
                    BenchmarkRun.status.in_(("running", "stopping"))
                )
            )
            or 0
        )
        pending = session.scalars(
            select(RagHoldoutRotation).where(
                RagHoldoutRotation.status == "pending"
            )
        ).all()
        pending_items = {int(row.item_id) for row in pending}
        retirement_slots = (
            0
            if active_runs
            else min(
                max_retirements, max(0, holdout_count - int(min_holdout))
            )
        )
        created: List[RagHoldoutRotation] = []
        if retirement_slots:
            candidates = list(
                session.scalars(
                    select(QuestionBankItem)
                    .where(
                        QuestionBankItem.visibility == "holdout",
                        QuestionBankItem.status == "accepted",
                        QuestionBankItem.stale.is_(False),
                        QuestionBankItem.deleted_at.is_(None),
                        QuestionBankItem.created_at
                        <= now - timedelta(days=RETIRE_MIN_AGE_DAYS),
                    )
                    .order_by(QuestionBankItem.created_at.asc())
                    .limit(200)
                ).all()
            )
            usage = _last_holdout_use(
                session, [int(item.id) for item in candidates]
            )
            idle = []
            for item in candidates:
                stats = usage.get(int(item.id)) or {}
                if int(stats.get("uses") or 0) < RETIRE_MIN_USES:
                    continue
                last_used = stats.get("last_used_at")
                if last_used is None or last_used >= now - timedelta(
                    days=RETIRE_IDLE_DAYS
                ):
                    continue
                if int(item.id) in pending_items:
                    continue
                idle.append((item, stats))
            for item, stats in idle[:retirement_slots]:
                signals = _item_signals(item, now)
                signals.update(
                    {
                        "benchmark_uses": int(stats["uses"]),
                        "last_benchmark_at": _iso(stats.get("last_used_at")),
                        "idle_days": RETIRE_IDLE_DAYS,
                    }
                )
                row = RagHoldoutRotation(
                    item_id=int(item.id),
                    item_version=int(item.version or 1),
                    direction="retire",
                    status="pending",
                    reason=(
                        f"Holdout 題目已有 {int(stats['uses'])} 次成功 "
                        f"benchmark，且超過 {RETIRE_IDLE_DAYS} 天未使用；"
                        "提案標記 stale，不刪除題目與歷史結果。"
                    ),
                    signals=signals,
                    created_by=str(actor or "")[:120],
                    created_at=now,
                    updated_at=now,
                )
                session.add(row)
                created.append(row)
        session.commit()
        for row in created:
            session.refresh(row)
        return {
            "generated_at": _iso(now),
            "generated": len(created),
            "holdout_count": holdout_count,
            "retirement_slots": retirement_slots,
            "active_benchmark_runs": active_runs,
            "unused_holdout": coverage["unused_holdout"],
            "coverage": coverage,
            "rotations": [
                serialize_rotation(
                    row, session.get(QuestionBankItem, row.item_id)
                )
                for row in created
            ],
        }


def serialize_rotation(
    row: RagHoldoutRotation, item: Optional[QuestionBankItem]
) -> Dict[str, Any]:
    return {
        "id": int(row.id),
        "direction": row.direction,
        "status": row.status,
        "reason": row.reason,
        "signals": row.signals or {},
        "created_by": row.created_by,
        "reviewed_by": row.reviewed_by,
        "review_comment": row.review_comment,
        "created_at": _iso(row.created_at),
        "reviewed_at": _iso(row.reviewed_at),
        "applied_at": _iso(row.applied_at),
        "item": (
            {
                "id": int(item.id),
                "version": int(item.version or 1),
                "question": item.question,
                "status": item.status,
                "visibility": item.visibility,
                "stale": bool(item.stale),
                "question_type": item.question_type,
                "difficulty": item.difficulty,
            }
            if item is not None
            else None
        ),
    }


def list_holdout_rotations(
    session_factory: sessionmaker[Session],
    *,
    status: str = "pending",
    limit: int = 50,
) -> Dict[str, Any]:
    status = str(status or "pending").strip()
    if status not in ROTATION_STATUSES and status != "all":
        raise FeedbackError(
            422, "invalid_rotation_status", "輪替狀態不正確。"
        )
    limit = max(1, min(200, int(limit or 50)))
    with session_factory() as session:
        query = select(RagHoldoutRotation)
        if status != "all":
            query = query.where(RagHoldoutRotation.status == status)
        rows = session.scalars(
            query.order_by(RagHoldoutRotation.created_at.desc()).limit(limit)
        ).all()
        item_ids = [int(row.item_id) for row in rows]
        items = (
            {
                int(item.id): item
                for item in session.scalars(
                    select(QuestionBankItem).where(
                        QuestionBankItem.id.in_(item_ids)
                    )
                ).all()
            }
            if item_ids
            else {}
        )
        return {
            "status": status,
            "coverage": _coverage(session),
            "rotations": [
                serialize_rotation(row, items.get(int(row.item_id)))
                for row in rows
            ],
        }


def _review_rotation(
    session_factory: sessionmaker[Session],
    rotation_id: int,
    *,
    status: str,
    actor: str,
    review_comment: str,
) -> Dict[str, Any]:
    with session_factory() as session:
        row = session.scalars(
            select(RagHoldoutRotation)
            .where(RagHoldoutRotation.id == int(rotation_id))
            .with_for_update()
        ).first()
        if row is None:
            raise FeedbackError(404, "rotation_not_found", "找不到這筆輪替提案。")
        if row.status != "pending":
            raise FeedbackError(409, "rotation_not_pending", "這筆輪替提案已處理。")
        item = session.get(QuestionBankItem, int(row.item_id))
        if item is None or item.deleted_at is not None:
            raise FeedbackError(404, "rotation_item_not_found", "找不到題目。")
        now = _now()
        if status == "applied":
            if row.direction != "retire":
                raise FeedbackError(
                    422,
                    "holdout_manual_authoring_required",
                    "Holdout 只能由人工撰寫新題目補充，不得自動晉升 shared 題目。",
                )
            if int(item.version or 1) != int(row.item_version or 1):
                raise FeedbackError(
                    409,
                    "rotation_item_changed",
                    "題目版本已變更，請重新產生輪替提案。",
                )
            if item.visibility != "holdout":
                raise FeedbackError(
                    409,
                    "rotation_item_not_holdout",
                    "題目已不是 holdout 題目。",
                )
            item.stale = True
            item.stale_reason = (
                f"holdout_rotation: 超過 {RETIRE_IDLE_DAYS} 天未使用"
            )
            item.updated_at = now
        row.status = status
        row.reviewed_by = str(actor or "")[:120]
        row.reviewed_at = now
        row.review_comment = str(review_comment or "")[:4000]
        row.updated_at = now
        if status == "applied":
            row.applied_at = now
        others = session.scalars(
            select(RagHoldoutRotation).where(
                RagHoldoutRotation.item_id == row.item_id,
                RagHoldoutRotation.direction == row.direction,
                RagHoldoutRotation.status == "pending",
                RagHoldoutRotation.id != row.id,
            )
        ).all()
        for other in others:
            other.status = "expired"
            other.updated_at = now
        session.commit()
        session.refresh(row)
        session.refresh(item)
        return serialize_rotation(row, item)


def apply_holdout_rotation(
    session_factory: sessionmaker[Session],
    rotation_id: int,
    *,
    actor: str,
    review_comment: str = "",
) -> Dict[str, Any]:
    return _review_rotation(
        session_factory,
        rotation_id,
        status="applied",
        actor=actor,
        review_comment=review_comment,
    )


def reject_holdout_rotation(
    session_factory: sessionmaker[Session],
    rotation_id: int,
    *,
    actor: str,
    review_comment: str = "",
) -> Dict[str, Any]:
    return _review_rotation(
        session_factory,
        rotation_id,
        status="rejected",
        actor=actor,
        review_comment=review_comment,
    )


def prune_rag_holdout_rotations(
    session_factory: sessionmaker[Session],
) -> int:
    if session_factory is None:
        return 0
    cutoff = _now() - timedelta(days=365)
    try:
        with session_factory() as session:
            result = session.execute(
                delete(RagHoldoutRotation).where(
                    RagHoldoutRotation.created_at < cutoff
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("holdout rotation retention failed", exc_info=True)
        return 0
