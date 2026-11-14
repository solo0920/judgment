from __future__ import annotations

import io
import json
import shutil
import tarfile
from pathlib import Path

import pyarrow.parquet as pq
import pytest
from sqlalchemy import create_engine, func, select, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment import judgment_import as judgment_import_module
from judgment.config import Settings
from judgment.db import init_db
from judgment.judgment_import import (
    archive_uncompressed_bytes,
    build_citation_pattern,
    extract_citations,
    import_judgments,
    iter_archive_json,
    load_law_list,
    parse_court,
)
from judgment.judgment_backup import apply_raw_deltas_backwards
from judgment.judgment_raw_parquet import find_reusable_raw_parquets
from judgment.judgment_versioning import (
    judgment_history,
    list_snapshot_dicts,
)
from judgment.models import (
    Base,
    JudgmentChangeEvent,
    JudgmentDocument,
    JudgmentDocumentVersion,
    JudgmentImportRun,
    JudgmentSnapshot,
    PerformanceRecord,
)
from judgment.processing_state import ProcessingStateStore


def _judgment(
    jid: str,
    full_text: str,
    *,
    title: str = "金融爭議",
    jdate: str = "20260101",
) -> dict:
    return {
        "JID": jid,
        "JYEAR": "115",
        "JCASE": "金簡",
        "JNO": "1",
        "JDATE": jdate,
        "JTITLE": title,
        "JFULL": full_text,
        "JPDF": f"https://example.test/{jid}.pdf",
    }


def _write_archive(path: Path, judgments: list[dict]) -> None:
    with tarfile.open(path, "w") as archive:
        for judgment in judgments:
            payload = json.dumps(judgment, ensure_ascii=False).encode("utf-8")
            info = tarfile.TarInfo(name=f"{judgment['JID']}.json")
            info.size = len(payload)
            archive.addfile(info, io.BytesIO(payload))


def test_init_db_migrates_existing_judgment_columns(tmp_path: Path) -> None:
    engine = create_engine(
        f"sqlite+pysqlite:///{tmp_path / 'legacy.db'}",
        future=True,
    )
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE judgment_documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    jid VARCHAR(255) NOT NULL,
                    jyear VARCHAR(16) NOT NULL DEFAULT '',
                    jcase VARCHAR(64) NOT NULL DEFAULT '',
                    jno VARCHAR(32) NOT NULL DEFAULT '',
                    jdate VARCHAR(16) NOT NULL DEFAULT '',
                    court TEXT NOT NULL DEFAULT '',
                    title TEXT NOT NULL DEFAULT '',
                    full_text TEXT NOT NULL DEFAULT '',
                    pdf_url TEXT NOT NULL DEFAULT '',
                    source_archive TEXT NOT NULL DEFAULT '',
                    content_hash VARCHAR(64) NOT NULL DEFAULT '',
                    matched_laws JSON,
                    matched_laws_text TEXT NOT NULL DEFAULT '',
                    citations JSON,
                    citation_count INTEGER NOT NULL DEFAULT 0,
                    full_text_length INTEGER NOT NULL DEFAULT 0,
                    import_run_id INTEGER,
                    created_at DATETIME,
                    updated_at DATETIME
                )
                """
            )
        )
        connection.execute(
            text(
                "INSERT INTO judgment_documents "
                "(jid, jdate, full_text, content_hash) "
                "VALUES ('LEGACY-1', '20260110', 'legacy text', 'abc')"
            )
        )
    init_db(engine)
    columns = {
        row[1]
        for row in engine.connect().execute(
            text("PRAGMA table_info(judgment_documents)")
        )
    }
    assert {
        "issue_month",
        "first_seen_snapshot_id",
        "content_first_seen_snapshot_id",
        "last_seen_snapshot_id",
        "removed_snapshot_id",
        "is_current",
    } <= columns
    with engine.connect() as connection:
        row = connection.execute(
            text(
                "SELECT issue_month, is_current "
                "FROM judgment_documents WHERE jid = 'LEGACY-1'"
            )
        ).one()
    assert row[0] == "202601"
    assert bool(row[1]) is True


def test_load_law_list_strips_scope_notes(tmp_path: Path) -> None:
    path = tmp_path / "laws.md"
    path.write_text(
        "銀行法\n保險法\n災害防救法（有關金融紓困部分）\n\n銀行法\n",
        encoding="utf-8",
    )
    law_list = load_law_list(path)
    assert set(law_list.names) == {"銀行法", "保險法", "災害防救法"}
    scoped = next(entry for entry in law_list.entries if entry["name"] == "災害防救法")
    assert "金融紓困" in scoped["scope"]


def test_extract_citations_requires_names_and_articles(tmp_path: Path) -> None:
    path = tmp_path / "laws.md"
    path.write_text("民法\n銀行法\n", encoding="utf-8")
    pattern = build_citation_pattern(load_law_list(path))
    result = extract_citations(
        "依民法第184條、民法第184條及銀行法第 1 條，刑法第1條不列入。",
        pattern,
    )
    assert result.matched_laws == ("民法", "銀行法")
    assert [(item["law_name"], item["article_no"]) for item in result.citations] == [
        ("民法", "第184條"),
        ("銀行法", "第1條"),
    ]
    assert parse_court("臺灣臺北地方法院民事判決\r\n裁判日期") == "臺灣臺北地方法院民事"


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
def test_import_filters_and_stores_only_matching_judgments(tmp_path: Path) -> None:
    law_list = tmp_path / "laws.md"
    law_list.write_text("民法\n銀行法\n保險法\n", encoding="utf-8")
    archive = tmp_path / "202601--test.rar"
    _write_archive(
        archive,
        [
            _judgment(
                "A1",
                "臺灣臺北地方法院民事判決\n原告主張依銀行法第1條規定。",
            ),
            _judgment(
                "A2",
                "臺灣臺北地方法院刑事判決\n被告涉犯刑法第1條。",
                title="刑事",
            ),
            _judgment(
                "A3",
                "臺灣臺中地方法院民事判決\n依民法第184條及保險法第2條。",
            ),
        ],
    )

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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        replace=True,
        session_factory=session_factory,
    )

    assert summary["scanned_count"] == 3
    assert summary["candidate_count"] == 2
    assert summary["matched_count"] == 2
    assert summary["stored_count"] == 2
    assert summary["citation_count"] == 3
    assert summary["raw_parquet_count"] == 1
    assert summary["raw_parquet_rows"] == 3
    assert summary["raw_parquet_reused"] == 0
    raw_path = Path(summary["raw_parquet_paths"][0])
    assert raw_path.is_file()
    assert raw_path.parent.parent.parent.name.startswith("202601--test")
    raw_rows = pq.read_table(raw_path).to_pylist()
    assert [row["jid"] for row in raw_rows] == ["A1", "A2", "A3"]
    assert '"JID": "A2"' in raw_rows[1]["raw_json"]

    with session_factory() as session:
        rows = session.scalars(
            select(JudgmentDocument).order_by(JudgmentDocument.jid)
        ).all()
        run = session.scalars(select(JudgmentImportRun)).one()
    assert [row.jid for row in rows] == ["A1", "A3"]
    assert rows[0].court == "臺灣臺北地方法院民事"
    assert rows[0].court_normalized == "臺灣臺北地方法院"
    assert rows[1].court_normalized == "臺灣臺中地方法院"
    assert rows[0].matched_laws == ["銀行法"]
    assert rows[1].matched_laws == ["保險法", "民法"]
    assert rows[1].citation_count == 2
    assert run.status == "success"
    assert run.scanned_count == 3
    assert run.matched_count == 2
    assert run.stored_count == 2

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(JudgmentDocument)) == 2
        performance = session.scalars(select(PerformanceRecord)).one()
    assert performance.process == "判決匯入"
    assert performance.module == "judgment.judgment_import.import_judgments"
    assert performance.status == "success"
    assert performance.details["stored_count"] == 2
    engine.dispose()


def test_import_strips_nul_bytes_before_postgres_insert(
    tmp_path: Path,
) -> None:
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202601--(20260101Update).rar"
    _write_archive(
        archive,
        [
            _judgment(
                "NUL-1",
                "臺灣臺北地方法院民事判決\n依銀行法第1條。\x00",
                title="金融\x00爭議",
            )
        ],
    )

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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        replace=True,
        session_factory=session_factory,
    )

    assert summary["stored_count"] == 1
    with session_factory() as session:
        row = session.scalars(select(JudgmentDocument)).one()
    assert "\x00" not in row.full_text
    assert "\x00" not in row.title
    assert row.full_text.endswith("。")
    engine.dispose()


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
def test_import_versions_preserve_old_content_and_delta(
    tmp_path: Path,
) -> None:
    if shutil.which("bsdtar") is None:
        pytest.skip("bsdtar not installed")
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    first_archive = tmp_path / "202601--(20260101Update).rar"
    second_archive = tmp_path / "202601--(20260201Update).rar"
    _write_archive(
        first_archive,
        [
            _judgment("A1", "臺灣臺北地方法院民事判決\n依銀行法第1條。"),
            _judgment("A2", "臺灣臺北地方法院民事判決\n依銀行法第2條。"),
            _judgment("A3", "臺灣臺北地方法院民事判決\n依銀行法第3條。"),
        ],
    )
    _write_archive(
        second_archive,
        [
            _judgment("A1", "臺灣臺北地方法院民事判決\n依銀行法第1條。"),
            _judgment("A2", "臺灣臺北地方法院民事判決\n依銀行法第2條修正。"),
            _judgment("A4", "臺灣臺北地方法院民事判決\n依銀行法第4條。"),
        ],
    )

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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    first = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[first_archive],
        batch_size=2,
        session_factory=session_factory,
    )
    first_raw = Path(first["raw_parquet_paths"][0])
    assert first["version_added"] == 3
    assert first["delta_count"] == 0

    second = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[second_archive],
        batch_size=2,
        session_factory=session_factory,
    )
    assert second["version_added"] == 1
    assert second["version_modified"] == 1
    assert second["version_removed"] == 1
    assert second["version_unchanged"] == 1
    assert second["delta_count"] == 1

    with session_factory() as session:
        docs = {
            row.jid: row
            for row in session.scalars(select(JudgmentDocument)).all()
        }
        assert docs["A1"].is_current is True
        assert docs["A2"].is_current is True
        assert docs["A3"].is_current is False
        assert docs["A3"].removed_snapshot_id is not None
        assert docs["A4"].is_current is True
        assert "修正" in docs["A2"].full_text
        assert docs["A3"].full_text.endswith("第3條。")

        versions = session.scalars(
            select(JudgmentDocumentVersion).order_by(
                JudgmentDocumentVersion.jid
            )
        ).all()
        version_by_jid = {row.jid: row for row in versions}
        assert set(version_by_jid) == {"A2", "A3"}
        assert "第2條。" in version_by_jid["A2"].full_text
        assert "第3條。" in version_by_jid["A3"].full_text
        assert version_by_jid["A2"].valid_to_snapshot_id is not None
        assert version_by_jid["A3"].valid_to_snapshot_id is not None

        events = session.scalars(
            select(JudgmentChangeEvent).order_by(JudgmentChangeEvent.id)
        ).all()
        assert {event.change_type for event in events} == {
            "added",
            "modified",
            "removed",
        }
        modified = next(
            event for event in events if event.change_type == "modified"
        )
        assert modified.jid == "A2"
        assert modified.changed_fields
        assert modified.from_version_id is not None

        snapshots = session.scalars(
            select(JudgmentSnapshot).order_by(JudgmentSnapshot.id)
        ).all()
        assert [item.is_current for item in snapshots] == [False, True]
        assert snapshots[1].delta_parquet_path

    history = judgment_history(session_factory, jid="A2")
    assert history["current"]["is_current"] is True
    assert len(history["versions"]) == 1
    assert any(event["change_type"] == "modified" for event in history["events"])
    snapshots = list_snapshot_dicts(session_factory)
    assert len(snapshots) == 2
    assert snapshots[0]["is_current"] is True

    # The old full raw Parquet is pruned only after the delta is durable.
    assert not first_raw.exists()
    with session_factory() as session:
        snapshot = session.scalars(
            select(JudgmentSnapshot).where(
                JudgmentSnapshot.is_current.is_(True)
            )
        ).first()
        assert snapshot is not None
        delta_path = Path(snapshot.delta_parquet_path)
    assert delta_path.is_file()
    new_raw = Path(second["raw_parquet_paths"][0])
    reconstructed = apply_raw_deltas_backwards(new_raw, [delta_path])
    assert "A2" in reconstructed
    assert "第2條。" in reconstructed["A2"]
    assert "A3" in reconstructed
    assert "A4" not in reconstructed


def test_dry_run_does_not_create_snapshots_or_versions(
    tmp_path: Path,
) -> None:
    if shutil.which("bsdtar") is None:
        pytest.skip("bsdtar not installed")
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202601--(20260101Update).rar"
    _write_archive(
        archive,
        [_judgment("A1", "臺灣臺北地方法院民事判決\n依銀行法第1條。")],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )
    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        dry_run=True,
        session_factory=session_factory,
    )
    assert summary["status"] == "dry_run"
    assert summary["delta_count"] == 0
    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(JudgmentSnapshot)) == 0
        assert session.scalar(select(func.count()).select_from(JudgmentDocument)) == 0
        assert (
            session.scalar(select(func.count()).select_from(JudgmentDocumentVersion))
            == 0
        )


def test_import_tracks_archive_progress_state(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    monkeypatch.setenv("JUDGMENT_PROCESSING_PARENT", "parent-run-1")
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202601--tracked.rar"
    _write_archive(
        archive,
        [
            _judgment("T1", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。"),
            _judgment("T2", "臺灣臺北地方法院刑事判決\n被告涉犯刑法第1條。"),
        ],
    )
    expected_bytes = archive_uncompressed_bytes(archive)
    assert expected_bytes and expected_bytes > 0

    progress: list[int] = []
    parsed = list(iter_archive_json(archive, progress=progress.append))
    assert len(parsed) == 2
    assert progress and progress[-1] == expected_bytes

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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        session_factory=session_factory,
        track_state=True,
    )
    assert summary["stored_count"] == 1
    assert summary["candidate_count"] == 1

    payload = ProcessingStateStore().read()
    run = payload["runs"][0]
    assert run["kind"] == "import"
    assert run["status"] == "success"
    assert run["meta"]["parent_run_id"] == "parent-run-1"
    assert run["stages"]["extract"]["status"] == "success"
    assert run["stages"]["extract"]["current"] == expected_bytes
    assert run["stages"]["extract"]["message"] == (
        "完成檢查 1 個壓縮檔：0 個沿用原始 Parquet、1 個解壓縮並新建備份。"
    )
    assert run["stages"]["raw_parquet"]["status"] == "success"
    assert run["stages"]["raw_parquet"]["current"] == 2
    assert run["stages"]["raw_parquet"]["message"] == (
        "原始資料檢查完成：2 筆（0 個沿用、1 個新建備份）。"
    )
    assert run["stages"]["postgres"]["current"] == 1
    archive_state = run["archives"][archive.name]
    assert archive_state["status"] == "success"
    assert archive_state["scanned"] == 2
    assert archive_state["matched"] == 1
    assert archive_state["stored"] == 1
    assert archive_state["stages"]["extract"]["current"] == expected_bytes
    assert archive_state["stages"]["extract"]["total"] == expected_bytes
    assert archive_state["stages"]["raw_parquet"]["status"] == "success"
    assert archive_state["stages"]["raw_parquet"]["current"] == 2
    assert archive_state["stages"]["raw_parquet"]["message"] == (
        "已建立 2026-01 原始 Parquet 備份（2 筆）。"
    )
    assert "2026-01" in archive_state["stages"]["filter"]["message"]
    assert "2026-01" in archive_state["stages"]["postgres"]["message"]
    assert archive_state["stages"]["filter"]["status"] == "success"
    assert archive_state["stages"]["postgres"]["status"] == "success"
    engine.dispose()


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
def test_import_creates_processing_state_before_archive_scan(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202601--scan-order.rar"
    _write_archive(
        archive,
        [_judgment("S1", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。")],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )
    original = judgment_import_module.archive_uncompressed_bytes
    observed: dict[str, object] = {}

    def guarded_scan(path: Path):
        run = ProcessingStateStore().read()["runs"][0]
        observed["run_status"] = run["status"]
        observed["archive_names"] = sorted(run["archives"])
        observed["extract_status"] = run["stages"]["extract"]["status"]
        observed["archive_status"] = run["archives"][path.name]["status"]
        return original(path)

    monkeypatch.setattr(
        judgment_import_module, "archive_uncompressed_bytes", guarded_scan
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        session_factory=session_factory,
        track_state=True,
    )

    assert summary["stored_count"] == 1
    assert observed == {
        "run_status": "running",
        "archive_names": [archive.name],
        "extract_status": "running",
        "archive_status": "pending",
    }
    engine.dispose()


def test_second_import_resumes_successful_archives(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202601--resume.rar"
    _write_archive(
        archive,
        [_judgment("R1", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。")],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    first = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        session_factory=session_factory,
        track_state=True,
    )
    assert first["stored_count"] == 1

    calls: list[Path] = []
    monkeypatch.setattr(
        judgment_import_module,
        "candidate_count",
        lambda path: calls.append(path) or 0,
    )

    def fail_filter(*args, **kwargs):
        raise AssertionError("resumed archive must not be filtered again")

    monkeypatch.setattr(
        judgment_import_module, "iter_candidate_batches", fail_filter
    )
    second = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        batch_size=1,
        session_factory=session_factory,
        track_state=True,
    )

    assert calls == []
    assert second["stored_count"] == 1
    run = ProcessingStateStore().read()["runs"][0]
    archive_state = run["archives"][archive.name]
    assert archive_state["status"] == "success"
    assert archive_state["stages"]["extract"]["status"] == "skipped"
    assert archive_state["stages"]["filter"]["status"] == "success"
    assert archive_state["stages"]["postgres"]["status"] == "success"
    assert run["stages"]["extract"]["message"] == (
        "完成檢查 1 個壓縮檔：1 個沿用原始 Parquet、0 個解壓縮並新建備份。"
    )
    engine.dispose()


def test_raw_only_backs_up_without_filtering_or_database(
    tmp_path: Path, monkeypatch
) -> None:
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202603--raw-only.rar"
    _write_archive(
        archive,
        [
            _judgment("R1", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。"),
            _judgment("R2", "臺灣臺北地方法院刑事判決\n被告涉犯刑法第1條。"),
        ],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        raw_only=True,
        session_factory=session_factory,
    )

    assert summary["status"] == "raw_only"
    assert summary["raw_parquet_rows"] == 2
    assert summary["stored_count"] == 0
    raw_path = Path(summary["raw_parquet_paths"][0])
    assert [row["jid"] for row in pq.read_table(raw_path).to_pylist()] == [
        "R1",
        "R2",
    ]
    def fail_scan(_path: Path):
        raise AssertionError("existing raw Parquet must not be scanned again")

    def fail_write(*_args, **_kwargs):
        raise AssertionError("existing raw Parquet must not be rebuilt")

    monkeypatch.setattr(
        judgment_import_module, "archive_uncompressed_bytes", fail_scan
    )
    monkeypatch.setattr(
        judgment_import_module, "write_archive_raw_parquet", fail_write
    )
    second = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        raw_only=True,
        session_factory=session_factory,
    )
    assert second["raw_parquet_reused"] == 1
    assert second["raw_parquet_paths"] == summary["raw_parquet_paths"]
    assert archive in find_reusable_raw_parquets(tmp_path, [archive])

    # A newly downloaded archive no longer matches the manifest record, so
    # it must be checked and backed up again instead of reusing stale data.
    archive.write_bytes(archive.read_bytes() + b"\x00")
    assert find_reusable_raw_parquets(tmp_path, [archive]) == {}

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(JudgmentDocument)) == 0
        assert session.scalar(select(func.count()).select_from(JudgmentImportRun)) == 0
    engine.dispose()


def test_import_reuses_raw_backup_before_filter_without_rescanning(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n", encoding="utf-8")
    archive = tmp_path / "202604--reuse-raw.rar"
    _write_archive(
        archive,
        [_judgment("F1", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。")],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    first = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        raw_only=True,
        session_factory=session_factory,
        track_state=True,
    )
    assert first["status"] == "raw_only"

    def fail_scan(_path: Path):
        raise AssertionError("reusable raw Parquet must not be scanned again")

    def fail_write(*_args, **_kwargs):
        raise AssertionError("reusable raw Parquet must not be rebuilt")

    monkeypatch.setattr(
        judgment_import_module, "archive_uncompressed_bytes", fail_scan
    )
    monkeypatch.setattr(
        judgment_import_module, "write_archive_raw_parquet", fail_write
    )
    second = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        session_factory=session_factory,
        track_state=True,
    )

    assert second["stored_count"] == 1
    run = ProcessingStateStore().read()["runs"][0]
    assert run["stages"]["extract"]["message"] == (
        "完成檢查 1 個壓縮檔：1 個沿用原始 Parquet、0 個解壓縮並新建備份。"
    )
    assert run["stages"]["raw_parquet"]["message"] == (
        "原始資料檢查完成：1 筆（1 個沿用、0 個新建備份）。"
    )
    archive_state = run["archives"][archive.name]
    assert archive_state["stages"]["extract"]["status"] == "skipped"
    assert archive_state["stages"]["raw_parquet"]["status"] == "success"
    assert "沿用 2026-04" in archive_state["stages"]["raw_parquet"]["message"]
    assert archive_state["stages"]["filter"]["status"] == "success"
    assert archive_state["stages"]["postgres"]["status"] == "success"
    engine.dispose()


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
def test_raw_phase2_duckdb_prefilter_then_python_exact_match(tmp_path: Path) -> None:
    law_list = tmp_path / "laws.md"
    law_list.write_text("銀行法\n個人資料保護法\n", encoding="utf-8")
    archive = tmp_path / "202604--phase2.rar"
    _write_archive(
        archive,
        [
            _judgment("P1", "臺灣臺北地方法院民事判決\n依銀行法規定辦理。"),
            _judgment("P2", "臺灣臺北地方法院民事判決\n依銀行法第1條規定。"),
            _judgment(
                "P3",
                "臺灣臺北地方法院民事判決\n依個人資\uf9be保護法第19條規定。",
            ),
            _judgment(
                "P4",
                "臺灣臺北地方法院民事判決\n依個人資\u2009料保護法第20條規定。",
            ),
        ],
    )
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path,
        judgment_law_list=law_list,
        auto_create_schema=False,
    )

    summary = import_judgments(
        settings=settings,
        data_dir=tmp_path,
        law_list_path=law_list,
        archives=[archive],
        raw_only=True,
        session_factory=session_factory,
    )

    raw_path = Path(summary["raw_parquet_paths"][0])
    manifest = json.loads((raw_path.parent / "manifest.json").read_text())
    assert summary["raw_parquet_rows"] == 4
    assert manifest["version"] == 3
    assert manifest["candidate_count"] == 4

    rows = {
        row["jid"]: row
        for row in pq.read_table(raw_path).to_pylist()
    }
    assert rows["P1"]["matched_laws"] == []
    assert rows["P1"]["citation_count"] == 0
    assert rows["P2"]["matched_laws"] == ["銀行法"]
    assert rows["P2"]["citation_count"] == 1
    assert rows["P3"]["matched_laws"] == ["個人資料保護法"]
    assert rows["P3"]["citation_count"] == 1
    assert rows["P4"]["matched_laws"] == ["個人資料保護法"]
    assert rows["P4"]["citation_count"] == 1
    engine.dispose()
