"""Plan and apply audited benchmark/holdout rotations.

Planning is automatic; applying a plan is always an explicit admin action.
Promotion only happens for accepted shared questions that have recent
benchmark evidence.  Retirement only marks an unused holdout question stale
and never deletes it.  Questions and review notes stay admin-only.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session, sessionmaker

from ..models import (
    BenchmarkCaseResult,
    QuestionBankItem,
    RagHoldoutRotation,
)
from .feedback import FeedbackError

logger = logging.getLogger(__name__)

ROTATION_DIRECTIONS = ("promote", "retire")
ROTATION_STATUSES = ("pending", "applied", "rejected", "expired")
PROMOTE_MIN_AGE_DAYS = 30
PROMOTE_EVIDENCE_DAYS = 90
PROMOTE_MIN_CASES = 2
PROMOTE_MIN_SCORE = 0.75
RETIRE_IDLE_DAYS = 180


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


def _average(values: Iterable[Any]) -> Optional[float]:
    clean = []
    for value in values:
        try:
            clean.append(float(value))
        except (TypeError, ValueError):
            continue
    return round(sum(clean) / len(clean), 4) if clean else None


def _item_signals(item: QuestionBankItem, now: datetime) -> Dict[str, Any]:
    created = _aware(item.created_at) or now
    return {
        "age_days": max(0, int((now - created).days)),
        "question_type": item.question_type,
        "difficulty": item.difficulty,
        "version": int(item.version or 1),
    }


def _benchmark_evidence(
    session: Session,
    item_ids: List[int],
    *,
    now: datetime,
) -> Dict[int, Dict[str, Any]]:
    if not item_ids:
        return {}
    rows = session.execute(
        select(
            BenchmarkCaseResult.item_id,
            BenchmarkCaseResult.metrics,
            BenchmarkCaseResult.finished_at,
        ).where(
            BenchmarkCaseResult.item_id.in_(item_ids),
            BenchmarkCaseResult.status == "success",
            BenchmarkCaseResult.finished_at
            >= now - timedelta(days=PROMOTE_EVIDENCE_DAYS),
        )
    ).all()
    evidence: Dict[int, Dict[str, Any]] = {}
    for item_id, metrics, finished_at in rows:
        bucket = evidence.setdefault(
            int(item_id),
            {"cases": 0, "scores": [], "last_used_at": None},
        )
        bucket["cases"] += 1
        scores = (metrics or {}).get("scores") or {}
        deterministic = scores.get("deterministic")
        if deterministic is not None:
            bucket["scores"].append(deterministic)
        finished = _aware(finished_at)
        if finished is not None and (
            bucket["last_used_at"] is None
            or finished > bucket["last_used_at"]
        ):
            bucket["last_used_at"] = finished
    for bucket in evidence.values():
        bucket["average_score"] = _average(bucket.pop("scores"))
    return evidence


def _last_holdout_use(
    session: Session, item_ids: List[int], *, now: datetime
) -> Dict[int, Optional[datetime]]:
    if not item_ids:
        return {}
    rows = session.execute(
        select(
            BenchmarkCaseResult.item_id,
            func.max(BenchmarkCaseResult.finished_at),
        )
        .where(
            BenchmarkCaseResult.item_id.in_(item_ids),
            BenchmarkCaseResult.status == "success",
        )
        .group_by(BenchmarkCaseResult.item_id)
    ).all()
    return {int(item_id): _aware(last) for item_id, last in rows}


def plan_holdout_rotation(
    session_factory: sessionmaker[Session],
    *,
    actor: str,
    max_promotions: int = 3,
    max_retirements: int = 3,
    min_shared: int = 20,
    min_holdout: int = 20,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    now = _aware(now or _now()) or _now()
    max_promotions = max(1, min(10, int(max_promotions)))
    max_retirements = max(1, min(10, int(max_retirements)))
    with session_factory() as session:
        expired = session.execute(
            select(RagHoldoutRotation).where(
                RagHoldoutRotation.status == "pending",
                RagHoldoutRotation.created_at
                < now - timedelta(days=30),
            )
        ).scalars().all()
        for row in expired:
            row.status = "expired"
            row.updated_at = now

        shared_count = int(
            session.scalar(
                select(func.count())
                .select_from(QuestionBankItem)
                .where(
                    QuestionBankItem.visibility == "shared",
                    QuestionBankItem.status == "accepted",
                    QuestionBankItem.stale.is_(False),
                    QuestionBankItem.deleted_at.is_(None),
                )
            )
            or 0
        )
        holdout_count = int(
            session.scalar(
                select(func.count())
                .select_from(QuestionBankItem)
                .where(
                    QuestionBankItem.visibility == "holdout",
                    QuestionBankItem.status == "accepted",
                    QuestionBankItem.stale.is_(False),
                    QuestionBankItem.deleted_at.is_(None),
                )
            )
            or 0
        )
        pending = session.scalars(
            select(RagHoldoutRotation).where(
                RagHoldoutRotation.status == "pending"
            )
        ).all()
        pending_keys = {(int(row.item_id), row.direction) for row in pending}

        promotion_slots = min(
            max_promotions, max(0, shared_count - int(min_shared))
        )
        retirement_slots = min(
            max_retirements, max(0, holdout_count - int(min_holdout))
        )
        created: List[RagHoldoutRotation] = []
        if promotion_slots:
            candidates = list(
                session.scalars(
                    select(QuestionBankItem)
                    .where(
                        QuestionBankItem.visibility == "shared",
                        QuestionBankItem.status == "accepted",
                        QuestionBankItem.stale.is_(False),
                        QuestionBankItem.deleted_at.is_(None),
                        QuestionBankItem.created_at
                        <= now - timedelta(days=PROMOTE_MIN_AGE_DAYS),
                    )
                    .order_by(QuestionBankItem.created_at.asc())
                    .limit(200)
                ).all()
            )
            evidence = _benchmark_evidence(
                session, [int(item.id) for item in candidates], now=now
            )
            ranked = []
            for item in candidates:
                if (int(item.id), "promote") in pending_keys:
                    continue
                stats = evidence.get(int(item.id)) or {}
                if (
                    int(stats.get("cases") or 0) < PROMOTE_MIN_CASES
                    or stats.get("average_score") is None
                    or float(stats["average_score"]) < PROMOTE_MIN_SCORE
                ):
                    continue
                ranked.append((float(stats["average_score"]), item, stats))
            ranked.sort(key=lambda entry: (-entry[0], entry[1].id))
            for score, item, stats in ranked[:promotion_slots]:
                signals = _item_signals(item, now)
                signals.update(
                    {
                        "benchmark_cases": int(stats["cases"]),
                        "average_deterministic_score": score,
                        "last_benchmark_at": _iso(stats.get("last_used_at")),
                    }
                )
                reason = (
                    f"Shared 題目近 {PROMOTE_EVIDENCE_DAYS} 天有 "
                    f"{int(stats['cases'])} 次成功 benchmark，"
                    f"平均 deterministic score {score:.2f}；"
                    "提案移入 holdout 以輪替評測集。"
                )
                row = RagHoldoutRotation(
                    item_id=int(item.id),
                    item_version=int(item.version or 1),
                    direction="promote",
                    status="pending",
                    reason=reason,
                    signals=signals,
                    created_by=str(actor or "")[:120],
                    created_at=now,
                    updated_at=now,
                )
                session.add(row)
                created.append(row)

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
                        <= now - timedelta(days=RETIRE_IDLE_DAYS),
                    )
                    .order_by(QuestionBankItem.created_at.asc())
                    .limit(200)
                ).all()
            )
            last_used = _last_holdout_use(
                session, [int(item.id) for item in candidates], now=now
            )
            idle = []
            for item in candidates:
                if (int(item.id), "retire") in pending_keys:
                    continue
                used_at = last_used.get(int(item.id))
                if used_at is not None and used_at >= now - timedelta(
                    days=RETIRE_IDLE_DAYS
                ):
                    continue
                idle.append(item)
            for item in idle[:retirement_slots]:
                signals = _item_signals(item, now)
                signals.update(
                    {
                        "last_benchmark_at": _iso(last_used.get(int(item.id))),
                        "idle_days": RETIRE_IDLE_DAYS,
                    }
                )
                reason = (
                    f"Holdout 題目超過 {RETIRE_IDLE_DAYS} 天未被 benchmark "
                    "使用；提案標記 stale，不刪除題目與歷史結果。"
                )
                row = RagHoldoutRotation(
                    item_id=int(item.id),
                    item_version=int(item.version or 1),
                    direction="retire",
                    status="pending",
                    reason=reason,
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
            "shared_count": shared_count,
            "holdout_count": holdout_count,
            "promotion_slots": promotion_slots,
            "retirement_slots": retirement_slots,
            "rotations": [
                serialize_rotation(row, session.get(QuestionBankItem, row.item_id))
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
        items = {
            int(item.id): item
            for item in session.scalars(
                select(QuestionBankItem).where(
                    QuestionBankItem.id.in_(item_ids)
                )
            ).all()
        } if item_ids else {}
        return {
            "status": status,
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
        row = session.get(RagHoldoutRotation, int(rotation_id))
        if row is None:
            raise FeedbackError(404, "rotation_not_found", "找不到這筆輪替提案。")
        if row.status != "pending":
            raise FeedbackError(409, "rotation_not_pending", "這筆輪替提案已處理。")
        item = session.get(QuestionBankItem, int(row.item_id))
        if item is None or item.deleted_at is not None:
            raise FeedbackError(404, "rotation_item_not_found", "找不到題目。")
        now = _now()
        if status == "applied":
            if int(item.version or 1) != int(row.item_version or 1):
                raise FeedbackError(
                    409,
                    "rotation_item_changed",
                    "題目版本已變更，請重新產生輪替提案。",
                )
            if row.direction == "promote":
                if item.visibility != "shared" or item.status != "accepted":
                    raise FeedbackError(
                        409,
                        "rotation_item_not_shared",
                        "題目已不是已核准的 shared 題目。",
                    )
                item.visibility = "holdout"
                item.last_reviewed_at = now
                item.updated_at = now
            elif row.direction == "retire":
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
            else:  # pragma: no cover - guarded by CHECK-like validation
                raise FeedbackError(422, "invalid_rotation_direction", "輪替方向不正確。")
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
