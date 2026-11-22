from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.models import (
    Base,
    PerformanceRecord,
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
            ]
        )
        session.commit()

    result = run_retention_maintenance(factory)
    assert result == {
        "performance_records": 1,
        "security_events": 1,
        "rag_shares": 1,
    }
    with factory() as session:
        assert len(session.scalars(select(PerformanceRecord)).all()) == 1
        assert len(session.scalars(select(SecurityAuditEvent)).all()) == 1
        shares = session.scalars(select(RagShareSnapshot)).all()
        assert [share.token for share in shares] == ["current"]

    assert run_retention_maintenance(factory) == {
        "performance_records": 0,
        "security_events": 0,
        "rag_shares": 0,
    }


def test_daily_maintenance_failure_is_non_blocking() -> None:
    class BrokenFactory:
        def __call__(self):
            raise RuntimeError("database unavailable")

    assert run_retention_maintenance(BrokenFactory()) == {
        "performance_records": 0,
        "security_events": 0,
        "rag_shares": 0,
    }
