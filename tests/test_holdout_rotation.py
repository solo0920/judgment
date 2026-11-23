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
) -> QuestionBankItem:
    now = datetime.now(timezone.utc)
    return QuestionBankItem(
        fingerprint=fingerprint,
        question=question,
        question_type="law_concept",
        difficulty="medium",
        status="accepted",
        version=version,
        visibility=visibility,
        source="manual",
        created_at=now - timedelta(days=created_days_ago),
        updated_at=now - timedelta(days=created_days_ago),
    )


def _seed(session_factory) -> tuple[int, int]:
    now = datetime.now(timezone.utc)
    with session_factory() as session:
        shared = _item(
            "shared-promote",
            question="銀行法如何規範吸收存款？",
            created_days_ago=40,
        )
        holdout = _item(
            "holdout-retire",
            question="證券交易法如何規範短線交易？",
            visibility="holdout",
            created_days_ago=240,
        )
        session.add_all([shared, holdout])
        session.flush()
        run = BenchmarkRun(
            run_id="run-rotation-1",
            suite_id=1,
            label="rotation evidence",
            status="success",
            total_cases=2,
            completed_cases=2,
        )
        session.add(run)
        session.flush()
        for index, score in enumerate((0.9, 0.8)):
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
        session.commit()
        return int(shared.id), int(holdout.id)


def test_rotation_plan_promotes_evidence_and_retires_idle(session_factory) -> None:
    shared_id, holdout_id = _seed(session_factory)
    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_promotions=1,
        max_retirements=1,
        min_shared=0,
        min_holdout=0,
    )
    assert plan["generated"] == 2
    by_item = {row["item"]["id"]: row for row in plan["rotations"]}
    promote = by_item[shared_id]
    retire = by_item[holdout_id]
    assert promote["direction"] == "promote"
    assert promote["signals"]["benchmark_cases"] == 2
    assert promote["signals"]["average_deterministic_score"] == 0.85
    assert retire["direction"] == "retire"
    assert retire["signals"]["last_benchmark_at"] is None
    assert "不刪除" in retire["reason"]

    applied = apply_holdout_rotation(
        session_factory,
        promote["id"],
        actor="admin",
        review_comment="近兩次 benchmark 穩定",
    )
    assert applied["status"] == "applied"
    assert applied["item"]["visibility"] == "holdout"

    retired = apply_holdout_rotation(
        session_factory, retire["id"], actor="admin"
    )
    assert retired["status"] == "applied"
    assert retired["item"]["stale"] is True

    with session_factory() as session:
        shared = session.get(QuestionBankItem, shared_id)
        holdout = session.get(QuestionBankItem, holdout_id)
        assert shared.visibility == "holdout"
        assert holdout.visibility == "holdout"
        assert holdout.stale is True
        assert "holdout_rotation" in holdout.stale_reason


def test_rotation_plan_respects_shared_floor(session_factory) -> None:
    _seed(session_factory)
    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_promotions=3,
        max_retirements=3,
        min_shared=1,
        min_holdout=0,
    )
    assert plan["promotion_slots"] == 0
    assert [row["direction"] for row in plan["rotations"]] == ["retire"]


def test_rotation_review_rejects_stale_or_changed_items(session_factory) -> None:
    shared_id, holdout_id = _seed(session_factory)
    plan = plan_holdout_rotation(
        session_factory,
        actor="tester",
        max_promotions=1,
        max_retirements=1,
        min_shared=0,
        min_holdout=0,
    )
    by_item = {row["item"]["id"]: row for row in plan["rotations"]}

    with session_factory() as session:
        item = session.get(QuestionBankItem, shared_id)
        item.version = 2
        session.commit()

    with pytest.raises(FeedbackError) as changed:
        apply_holdout_rotation(
            session_factory, by_item[shared_id]["id"], actor="admin"
        )
    assert changed.value.status_code == 409
    assert changed.value.code == "rotation_item_changed"

    rejected = reject_holdout_rotation(
        session_factory,
        by_item[holdout_id]["id"],
        actor="admin",
        review_comment="先保留這題",
    )
    assert rejected["status"] == "rejected"
    assert rejected["review_comment"] == "先保留這題"

    with pytest.raises(FeedbackError) as not_pending:
        apply_holdout_rotation(
            session_factory, by_item[holdout_id]["id"], actor="admin"
        )
    assert not_pending.value.status_code == 409

    listing = list_holdout_rotations(session_factory, status="all")
    assert {row["status"] for row in listing["rotations"]} == {
        "pending",
        "rejected",
    }
    with session_factory() as session:
        rows = session.query(RagHoldoutRotation).all()
        assert len(rows) == 2
