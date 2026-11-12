from __future__ import annotations

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.court_normalize import (
    check_court_normalization,
    normalize_judgment_courts,
)
from judgment.models import Base, JudgmentDocument, PerformanceRecord


def _session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return engine, sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
        future=True,
    )


def test_normalize_judgment_courts_backfills_and_records_performance() -> None:
    engine, session_factory = _session_factory()
    with session_factory() as session:
        session.add_all(
            [
                JudgmentDocument(
                    jid="TPDV,115,金訴,1,20260110,1",
                    court="臺灣臺北地方法院民事",
                    full_text="臺灣臺北地方法院民事判決",
                ),
                JudgmentDocument(
                    jid="TPTA,115,續收,1989,20260331,1",
                    court="宣示",
                    full_text="宣示裁定筆錄\n在本院第十一法庭公開宣示裁定。",
                ),
                JudgmentDocument(
                    jid="KSYV,114,家,1,20260101,1",
                    court="臺灣○○少年及家事法院民事",
                    full_text="臺灣○○少年及家事法院民事裁定",
                ),
                JudgmentDocument(
                    jid="UNKNOWN,1",
                    court="宣示",
                    full_text="宣示裁定筆錄\n在本院公開宣示裁定。",
                ),
            ]
        )
        session.commit()

    dry_run = normalize_judgment_courts(
        session_factory=session_factory,
        batch_size=2,
        dry_run=True,
    )
    assert dry_run["scanned_count"] == 4
    assert dry_run["normalized_count"] == 3
    assert dry_run["updated_count"] == 0
    assert dry_run["unresolved_count"] == 1

    summary = normalize_judgment_courts(
        session_factory=session_factory,
        batch_size=2,
    )
    assert summary["scanned_count"] == 4
    assert summary["normalized_count"] == 3
    assert summary["updated_count"] == 3
    assert summary["unresolved_count"] == 1

    with session_factory() as session:
        rows = {
            row.jid: row.court_normalized
            for row in session.scalars(select(JudgmentDocument)).all()
        }
        performance = session.scalars(select(PerformanceRecord)).all()
    assert rows == {
        "TPDV,115,金訴,1,20260110,1": "臺灣臺北地方法院",
        "TPTA,115,續收,1989,20260331,1": "臺北高等行政法院",
        "KSYV,114,家,1,20260101,1": "臺灣高雄少年及家事法院",
        "UNKNOWN,1": "",
    }
    assert performance
    assert performance[-1].process == "判決法院正規化"
    engine.dispose()


def test_check_court_normalization_reports_month_statuses() -> None:
    engine, session_factory = _session_factory()
    with session_factory() as session:
        session.add_all(
            [
                JudgmentDocument(
                    jid="A1",
                    issue_month="202601",
                    court="臺北",
                    court_normalized="臺灣臺北地方法院",
                ),
                JudgmentDocument(
                    jid="A2",
                    issue_month="202601",
                    court="未知",
                    court_normalized="",
                ),
                JudgmentDocument(
                    jid="B1",
                    issue_month="202602",
                    court="未知",
                    court_normalized="",
                ),
                JudgmentDocument(
                    jid="C1",
                    issue_month="202603",
                    court="臺北",
                    court_normalized="臺灣臺北地方法院",
                ),
                JudgmentDocument(
                    jid="C2",
                    issue_month="202603",
                    court="未知",
                    court_normalized="不存在法院",
                ),
                JudgmentDocument(
                    jid="D1",
                    issue_month="202604",
                    court="臺北",
                    court_normalized="臺灣臺北地方法院",
                ),
                JudgmentDocument(
                    jid="D2",
                    issue_month="202604",
                    court="高雄",
                    court_normalized="臺灣高雄地方法院",
                ),
            ]
        )
        session.commit()

    result = check_court_normalization(session_factory)
    months = {item["month"]: item for item in result["months"]}
    assert months["202601"]["status"] == "gray"
    assert months["202601"]["unchecked"] == 1
    assert months["202602"]["status"] == "red"
    assert months["202602"]["checked"] == 0
    assert months["202603"]["status"] == "gray"
    assert months["202603"]["invalid"] == 1
    assert months["202604"]["status"] == "green"
    assert months["202604"]["valid"] == 2
    assert result["summary"] == {"green": 1, "red": 1, "gray": 2}
    assert result["totals"] == {
        "total": 7,
        "checked": 5,
        "unchecked": 2,
        "invalid": 1,
        "needs_normalization": 3,
        "valid": 4,
    }
    engine.dispose()
