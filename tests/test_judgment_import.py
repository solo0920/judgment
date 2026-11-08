from __future__ import annotations

import io
import json
import shutil
import tarfile
from pathlib import Path

import pyarrow.parquet as pq
import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.judgment_import import (
    archive_uncompressed_bytes,
    build_citation_pattern,
    extract_citations,
    import_judgments,
    iter_archive_json,
    load_law_list,
    parse_court,
)
from judgment.models import (
    Base,
    JudgmentDocument,
    JudgmentImportRun,
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


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
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

    payload = ProcessingStateStore().read()
    run = payload["runs"][0]
    assert run["kind"] == "import"
    assert run["status"] == "success"
    assert run["meta"]["parent_run_id"] == "parent-run-1"
    assert run["stages"]["extract"]["status"] == "success"
    assert run["stages"]["extract"]["current"] == expected_bytes
    assert run["stages"]["raw_parquet"]["status"] == "success"
    assert run["stages"]["raw_parquet"]["current"] == 2
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
    assert archive_state["stages"]["filter"]["status"] == "success"
    assert archive_state["stages"]["postgres"]["status"] == "success"
    engine.dispose()


@pytest.mark.skipif(shutil.which("bsdtar") is None, reason="bsdtar not installed")
def test_raw_only_backs_up_without_filtering_or_database(tmp_path: Path) -> None:
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

    with session_factory() as session:
        assert session.scalar(select(func.count()).select_from(JudgmentDocument)) == 0
        assert session.scalar(select(func.count()).select_from(JudgmentImportRun)) == 0
    engine.dispose()
