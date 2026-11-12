from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment import update_checks
from judgment.models import Base, DownloadUpdateRecord, LawDatasetVersion
from judgment.update_records import update_status


def _session_factory():
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


def test_law_update_check_records_available_and_clears(
    tmp_path: Path, monkeypatch
) -> None:
    session_factory = _session_factory()
    zip_path = tmp_path / "raw" / "law" / "20261111" / "ChLaw.json.zip"
    zip_path.parent.mkdir(parents=True)
    zip_path.write_bytes(b"x" * 100)
    with session_factory() as session:
        session.add(
            LawDatasetVersion(
                source_type="law",
                source_url="https://example.test/law",
                update_date="2026/10/30 上午 12:00:00",
                content_sha256="a" * 64,
                raw_json_sha256="b" * 64,
                zip_sha256="c" * 64,
                zip_path=str(zip_path),
                parquet_path=str(tmp_path / "laws.parquet"),
                law_count=10,
                article_count=20,
                is_current=True,
            )
        )
        session.commit()

    monkeypatch.setattr(
        update_checks,
        "_remote_headers",
        lambda url, timeout=30.0: (
            200,
            {
                "content-length": "100",
                "content-disposition": "attachment; filename=ChLaw.json.zip",
            },
        ),
    )
    result = update_checks.check_law_order_source(
        session_factory,
        source_type="law",
        url="https://example.test/law",
        fallback_filename="ChLaw.json.zip",
        label="法規",
    )
    assert result["update_available"] is False
    status = update_status(session_factory)
    assert status["update_count"] == 0
    assert status["sources"]["law"]["status"] == "up_to_date"

    monkeypatch.setattr(
        update_checks,
        "_remote_headers",
        lambda url, timeout=30.0: (
            200,
            {
                "content-length": "120",
                "content-disposition": "attachment; filename=ChLaw.json.zip",
            },
        ),
    )
    result = update_checks.check_law_order_source(
        session_factory,
        source_type="law",
        url="https://example.test/law",
        fallback_filename="ChLaw.json.zip",
        label="法規",
    )
    assert result["update_available"] is True
    status = update_status(session_factory)
    assert status["update_count"] == 1
    assert status["sources"]["law"]["update_available"] is True
    with session_factory() as session:
        records = session.scalars(
            select(DownloadUpdateRecord).order_by(DownloadUpdateRecord.id)
        ).all()
        assert [record.is_current for record in records] == [False, True]
        assert records[-1].remote_content_length == 120


def test_check_all_sources_filters_requested_sources(monkeypatch) -> None:
    calls = []

    class SettingsStub:
        law_api_url = "https://example.test/law"
        order_api_url = "https://example.test/order"

    def fake_law_order(session_factory, **kwargs):
        calls.append(kwargs["source_type"])
        return {"source_type": kwargs["source_type"]}

    def fake_judgment(session_factory, **kwargs):
        calls.append("judgment")
        return {"source_type": "judgment"}

    monkeypatch.setattr(
        update_checks, "check_law_order_source", fake_law_order
    )
    monkeypatch.setattr(
        update_checks, "check_judgment_source", fake_judgment
    )
    result = update_checks.check_all_sources(
        settings=SettingsStub(),
        session_factory=None,
        source_types=["order"],
    )
    assert calls == ["order"]
    assert result["sources"] == [{"source_type": "order"}]


def test_update_error_does_not_claim_update(
    tmp_path: Path, monkeypatch
) -> None:
    session_factory = _session_factory()

    def fail(url, timeout=30.0):
        raise RuntimeError("network down")

    monkeypatch.setattr(update_checks, "_remote_headers", fail)
    result = update_checks.check_law_order_source(
        session_factory,
        source_type="order",
        url="https://example.test/order",
        fallback_filename="ChOrder.json.zip",
        label="命令",
    )
    assert result["update_available"] is False
    status = update_status(session_factory)
    assert status["sources"]["order"]["status"] == "error"
    assert status["update_count"] == 0


def test_update_error_preserves_previous_update_flag(
    tmp_path: Path, monkeypatch
) -> None:
    from judgment.update_records import record_update

    session_factory = _session_factory()
    record_update(
        session_factory,
        source_type="law",
        source_url="https://example.test/law",
        status="update_available",
        update_available=True,
        message="previous update",
    )

    def fail(url, timeout=30.0):
        raise RuntimeError("network down")

    monkeypatch.setattr(update_checks, "_remote_headers", fail)
    result = update_checks.check_law_order_source(
        session_factory,
        source_type="law",
        url="https://example.test/law",
        fallback_filename="ChLaw.json.zip",
        label="法規",
    )
    assert result["update_available"] is True
    status = update_status(session_factory)
    assert status["sources"]["law"]["status"] == "error"
    assert status["sources"]["law"]["update_available"] is True
    assert status["update_count"] == 1
