from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.models import (
    Base,
    PerformanceRecord,
    RagFeedback,
    RagFeedbackEvent,
    RagFeedbackReason,
    RagInteraction,
    RagShareSnapshot,
    SecurityAuditEvent,
)
from judgment.web.maintenance import run_retention_maintenance


def _factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )


def test_daily_maintenance_applies_documented_retention() -> None:
    factory = _factory()
    now = datetime.now(timezone.utc)
    with factory() as session:
        session.add_all(
            [
                PerformanceRecord(
                    process="rag",
                    module="test",
                    started_at=now - timedelta(days=100),
                ),
                PerformanceRecord(
                    process="rag",
                    module="test",
                    started_at=now - timedelta(days=10),
                ),
                SecurityAuditEvent(
                    created_at=now - timedelta(days=200),
                    event_type="auth.google_login",
                    outcome="failure",
                ),
                SecurityAuditEvent(
                    created_at=now - timedelta(days=10),
                    event_type="auth.google_login",
                    outcome="success",
                ),
                RagShareSnapshot(
                    token="expired",
                    turns=[],
                    created_at=now - timedelta(days=8),
                    expires_at=now - timedelta(days=1),
                ),
                RagShareSnapshot(
                    token="current",
                    turns=[],
                    created_at=now,
                    expires_at=now + timedelta(days=1),
                ),
                RagInteraction(
                    request_id="expired-interaction",
                    question="q",
                    answer="a",
                    created_at=now - timedelta(days=200),
                    expires_at=now - timedelta(days=20),
                ),
                RagInteraction(
                    request_id="current-interaction",
                    question="q",
                    answer="a",
                    created_at=now,
                    expires_at=now + timedelta(days=180),
                ),
            ]
        )
        session.flush()
        expired_feedback = RagFeedback(
            request_id="expired-interaction",
            client_key_hash="a" * 64,
            sentiment="unsatisfied",
            primary_reason="incomplete",
            editable_until=now - timedelta(days=200),
            expires_at=now - timedelta(days=20),
            created_at=now - timedelta(days=200),
        )
        current_feedback = RagFeedback(
            request_id="current-interaction",
            client_key_hash="b" * 64,
            sentiment="satisfied",
            editable_until=now + timedelta(minutes=10),
            expires_at=now + timedelta(days=180),
            created_at=now,
        )
        session.add_all([expired_feedback, current_feedback])
        session.flush()
        session.add_all(
            [
                RagFeedbackReason(
                    feedback_id=expired_feedback.id,
                    reason_code="incomplete",
                ),
                RagFeedbackEvent(
                    feedback_id=expired_feedback.id,
                    event_type="created",
                ),
            ]
        )
        session.commit()

    result = run_retention_maintenance(factory)
    assert result == {
        "performance_records": 1,
        "security_events": 1,
        "rag_shares": 1,
        "rag_interactions": 1,
        "rag_feedback": 1,
    }
    with factory() as session:
        assert len(session.scalars(select(PerformanceRecord)).all()) == 1
        assert len(session.scalars(select(SecurityAuditEvent)).all()) == 1
        shares = session.scalars(select(RagShareSnapshot)).all()
        assert [share.token for share in shares] == ["current"]
        interactions = session.scalars(select(RagInteraction)).all()
        assert [row.request_id for row in interactions] == [
            "current-interaction"
        ]
        feedback = session.scalars(select(RagFeedback)).all()
        assert [row.request_id for row in feedback] == [
            "current-interaction"
        ]
        assert session.scalars(select(RagFeedbackReason)).all() == []
        assert session.scalars(select(RagFeedbackEvent)).all() == []

    assert run_retention_maintenance(factory) == {
        "performance_records": 0,
        "security_events": 0,
        "rag_shares": 0,
        "rag_interactions": 0,
        "rag_feedback": 0,
    }


def test_daily_maintenance_failure_is_non_blocking() -> None:
    class BrokenFactory:
        def __call__(self):
            raise RuntimeError("database unavailable")

    assert run_retention_maintenance(BrokenFactory()) == {
        "performance_records": 0,
        "security_events": 0,
        "rag_shares": 0,
        "rag_interactions": 0,
        "rag_feedback": 0,
    }
