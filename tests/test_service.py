from __future__ import annotations

from pathlib import Path

import pyarrow.parquet as pq
import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.law_download.repository import LawRepository
from judgment.law_download.service import LawDownloadService
from judgment.law_download.storage import LawStorage
from judgment.models import (
    Base,
    DownloadRun,
    LawChangeEvent,
    LawDatasetVersion,
    LawDocument,
)

from .helpers import FakeClient, law, payload, source


@pytest.fixture()
def env(tmp_path: Path):
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    storage = LawStorage(tmp_path / "data")
    storage.ensure_layout()
    return {
        "engine": engine,
        "session_factory": session_factory,
        "repository": LawRepository(session_factory),
        "storage": storage,
        "tmp_path": tmp_path,
    }


def _service(env, data):
    return LawDownloadService(
        client=FakeClient(data, env["tmp_path"] / "downloads"),
        storage=env["storage"],
        repository=env["repository"],
    )


def _count(session, model) -> int:
    return int(session.scalar(select(func.count()).select_from(model)) or 0)


def test_first_run_writes_parquet_and_metadata(env) -> None:
    data = payload(
        [
            law("銀行法", "https://law.test/L0001", "銀行法條文"),
            law("保險法", "https://law.test/L0002", "保險法條文"),
        ]
    )

    result = _service(env, data).run(source())

    assert result.status == "success"
    assert result.version_id == 1
    assert result.law_count == 2
    assert result.article_count == 2
    assert result.added == 2
    assert result.parquet_path is not None
    assert Path(result.parquet_path).is_absolute()
    assert Path(result.parquet_path).exists()

    table = pq.read_table(result.parquet_path)
    assert table.num_rows == 2
    assert "raw_json" in table.column_names
    assert "law_articles" in table.column_names

    raw_paths = list((env["tmp_path"] / "data" / "raw_parquet").glob("*/*/*/laws.parquet"))
    assert len(raw_paths) == 1
    raw_table = pq.read_table(raw_paths[0])
    assert raw_table.num_rows == 2
    assert set(raw_table.column("law_name").to_pylist()) == {"銀行法", "保險法"}
    assert all(row for row in raw_table.column("raw_json").to_pylist())

    with env["session_factory"]() as session:
        assert _count(session, LawDatasetVersion) == 1
        assert _count(session, LawDocument) == 2
        assert _count(session, LawChangeEvent) == 2
        version = session.scalars(select(LawDatasetVersion)).one()
        assert version.is_current is True
        assert version.law_count == 2
        assert version.article_count == 2


def test_same_payload_is_detected_as_no_change(env) -> None:
    data = payload([law("銀行法", "https://law.test/L0001")])
    service = _service(env, data)

    first = service.run(source())
    second = service.run(source())

    assert first.status == "success"
    assert second.status == "no_change"
    assert second.version_id == first.version_id

    with env["session_factory"]() as session:
        assert _count(session, LawDatasetVersion) == 1
        runs = session.scalars(select(DownloadRun).order_by(DownloadRun.id)).all()
        assert [run.status for run in runs] == ["success", "no_change"]


def test_semantic_no_change_ignores_json_key_order(env) -> None:
    original = law("銀行法", "https://law.test/L0001", "同一條文")
    reordered = dict(reversed(list(original.items())))
    service = _service(env, payload([original]))

    first = service.run(source())
    service.client = FakeClient(payload([reordered]), env["tmp_path"] / "downloads2")
    second = service.run(source())

    assert first.status == "success"
    assert second.status == "no_change"

    with env["session_factory"]() as session:
        assert _count(session, LawDatasetVersion) == 1
        runs = session.scalars(select(DownloadRun).order_by(DownloadRun.id)).all()
        assert [run.status for run in runs] == ["success", "no_change"]


def test_new_version_updates_adds_modifies_and_removes(env) -> None:
    first_data = payload(
        [
            law("銀行法", "https://law.test/L0001", "舊銀行法條文"),
            law("保險法", "https://law.test/L0002", "保險法條文"),
        ]
    )
    second_data = payload(
        [
            law("銀行法", "https://law.test/L0001", "新銀行法條文"),
            law("證券交易法", "https://law.test/L0003", "證交法條文"),
        ],
        update_date="2026/11/06 上午 12:00:00",
    )

    first = _service(env, first_data).run(source())
    second = _service(env, second_data).run(source())

    assert first.status == "success"
    assert second.status == "success"
    assert second.version_id == 2
    assert second.added == 1
    assert second.modified == 1
    assert second.removed == 1
    assert second.unchanged == 0
    assert second.law_count == 2

    with env["session_factory"]() as session:
        versions = session.scalars(
            select(LawDatasetVersion).order_by(LawDatasetVersion.id)
        ).all()
        assert [version.is_current for version in versions] == [False, True]

        documents = {
            document.law_name: document
            for document in session.scalars(select(LawDocument)).all()
        }
        assert documents["銀行法"].is_current is True
        assert documents["銀行法"].removed_version_id is None
        assert documents["保險法"].is_current is False
        assert documents["保險法"].removed_version_id == 2
        assert documents["證券交易法"].is_current is True

        events = session.scalars(
            select(LawChangeEvent)
            .where(LawChangeEvent.to_version_id == 2)
            .order_by(LawChangeEvent.id)
        ).all()
        assert sorted(event.change_type for event in events) == [
            "added",
            "modified",
            "removed",
        ]
        modified = next(event for event in events if event.change_type == "modified")
        assert "content_hash" in modified.changed_fields

    table = pq.read_table(second.parquet_path)
    assert table.num_rows == 2
    assert set(table.column("law_name").to_pylist()) == {"銀行法", "證券交易法"}
