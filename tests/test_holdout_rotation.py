from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.models import (
    Base,
    BenchmarkCaseResult,
    BenchmarkRun,
    QuestionBankItem,
    RagHoldoutRotation,
)
from judgment.web.feedback import FeedbackError
from judgment.web.holdout_rotation import (
    apply_holdout_rotation,
    list_holdout_rotations,
    plan_holdout_rotation,
    reject_holdout_rotation,
)


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    yield factory
    engine.dispose()


def _item(
    fingerprint: str,
    *,
    visibility: str = "shared",
    question: str,
    created_days_ago: int = 200,
    version: int = 1,
    question_type: str = "law_concept",
    difficulty: str = "medium",
) -> QuestionBankItem:
    now = datetime.now(timezone.utc)
    return QuestionBankItem(
        fingerprint=fingerprint,
        question=question,
        question_type=question_type,
        difficulty=difficulty,
        status="accepted",
        version=version,
        visibility=visibility,
        source="manual",
        created_at=now - timedelta(days=created_days_ago),
        updated_at=now - timedelta(days=created_days_ago),
    )


def _seed(session_factory) -> dict[str, int]:
    now = datetime.now(timezone.utc)
    with session_factory() as session:
        shared = _item(
            "shared-not-promoted",
            question="銀行法如何規範吸收存款？",
            created_days_ago=40,
            question_type="law_concept",
        )
        holdout = _item(
            "holdout-retire",
            question="證券交易法如何規範短線交易？",
            visibility="holdout",
            created_days_ago=240,
            question_type="law_concept",
        )
        unused = _item(
            "holdout-unused",
            question="銀行法如何規範授信？",
            visibility="holdout",
            created_days_ago=240,
            question_type="refusal",
        )
        gap = _item(
            "shared-gap",
            question="證券交易法第 157-1 條的構成要件？",
            created_days_ago=20,
            question_type="article_lookup",
            difficulty="hard",
        )
        session.add_all([shared, holdout, unused, gap])
        session.flush()
        run = BenchmarkRun(
            run_id="run-rotation-1",
            suite_id=1,
            label="rotation evidence",
            status="success",
            total_cases=4,
            completed_cases=4,
        )
        session.add(run)
        session.flush()
        # Shared evidence must not make it eligible for promotion.
        for index, score in enumerate((0.95, 0.99)):
            session.add(
                BenchmarkCaseResult(
                    run_id=run.run_id,
                    item_id=shared.id,
                    item_version=1,
                    fingerprint=shared.fingerprint,
                    repeat_index=index,
                    question=shared.question,
                    status="success",
                    answer="answer",
                    metrics={"scores": {"deterministic": score}},
                    finished_at=now - timedelta(days=10 - index),
                )
            )
        # Holdout has real usage, but is idle for more than 180 days.
        for index in range(2):
            session.add(
                BenchmarkCaseResult(
                    run_id=run.run_id,
                    item_id=holdout.id,
                    item_version=1,
                    fingerprint=holdout.fingerprint,
                    repeat_index=index,
                    question=holdout.question,
                    status="success",
                    answer="answer",
                    metrics={"scores": {"deterministic": 0.4}},
                    finished_at=now - timedelta(days=220 + index),
                )
            )
        session.commit()
        return {
            "shared": int(shared.id),
            "holdout": int(holdout.id),
            "unused": int(unused.id),
        }


def test_plan_never_promotes_shared_and_retires_used_idle_holdout(
    session_factory,
) -> None:
    ids = _seed(session_factory)
    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_retirements=3,
        min_holdout=0,
    )
    assert plan["generated"] == 1
    row = plan["rotations"][0]
    assert row["direction"] == "retire"
    assert row["item"]["id"] == ids["holdout"]
    assert row["signals"]["benchmark_uses"] == 2
    assert all(
        candidate["item"]["id"] != ids["shared"]
        for candidate in plan["rotations"]
    )
    assert plan["unused_holdout"] == 1
    assert plan["coverage"]["gaps"]
    assert plan["coverage"]["note"].startswith("Holdout 只能由人工撰寫")

    applied = apply_holdout_rotation(
        session_factory, row["id"], actor="admin"
    )
    assert applied["status"] == "applied"
    assert applied["item"]["stale"] is True
    with session_factory() as session:
        shared = session.get(QuestionBankItem, ids["shared"])
        unused = session.get(QuestionBankItem, ids["unused"])
        assert shared.visibility == "shared"
        assert unused.stale is False


def test_plan_respects_holdout_floor_and_active_benchmark_runs(
    session_factory,
) -> None:
    _seed(session_factory)
    floored = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_retirements=3,
        min_holdout=2,
    )
    assert floored["retirement_slots"] == 0
    assert floored["generated"] == 0

    with session_factory() as session:
        session.add(
            BenchmarkRun(
                run_id="run-active",
                suite_id=1,
                label="active",
                status="running",
            )
        )
        session.commit()
    active = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_retirements=3,
        min_holdout=0,
    )
    assert active["active_benchmark_runs"] == 1
    assert active["retirement_slots"] == 0
    assert active["generated"] == 0


def test_legacy_promote_proposal_is_expired_and_cannot_apply(
    session_factory,
) -> None:
    ids = _seed(session_factory)
    with session_factory() as session:
        legacy = RagHoldoutRotation(
            item_id=ids["shared"],
            item_version=1,
            direction="promote",
            status="pending",
            reason="legacy score-based promotion",
        )
        session.add(legacy)
        session.commit()
        legacy_id = int(legacy.id)

    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_retirements=0,
        min_holdout=0,
    )
    assert plan["generated"] == 0
    with session_factory() as session:
        legacy = session.get(RagHoldoutRotation, legacy_id)
        assert legacy.status == "expired"
        assert "人工撰寫" in legacy.review_comment
        shared = session.get(QuestionBankItem, ids["shared"])
        assert shared.visibility == "shared"


def test_rotation_review_rejects_changed_items(session_factory) -> None:
    ids = _seed(session_factory)
    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_retirements=1,
        min_holdout=0,
    )
    row = plan["rotations"][0]
    with session_factory() as session:
        item = session.get(QuestionBankItem, ids["holdout"])
        item.version = 2
        session.commit()

    with pytest.raises(FeedbackError) as changed:
        apply_holdout_rotation(session_factory, row["id"], actor="admin")
    assert changed.value.status_code == 409
    assert changed.value.code == "rotation_item_changed"

    rejected = reject_holdout_rotation(
        session_factory,
        row["id"],
        actor="admin",
        review_comment="先保留這題",
    )
    assert rejected["status"] == "rejected"
    assert rejected["review_comment"] == "先保留這題"

    with pytest.raises(FeedbackError) as not_pending:
        apply_holdout_rotation(session_factory, row["id"], actor="admin")
    assert not_pending.value.status_code == 409

    listing = list_holdout_rotations(session_factory, status="all")
    assert "coverage" in listing
    assert {row["status"] for row in listing["rotations"]} == {"rejected"}
