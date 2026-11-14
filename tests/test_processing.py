from __future__ import annotations

import asyncio
import json
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.models import (
    Base,
    DownloadUpdateRecord,
    JudgmentDocument,
    JudgmentIndexVersion,
    JudgmentVectorIndex,
    LawDatasetVersion,
    OllamaHost,
    OllamaModelCapability,
    PerformanceRecord,
    PerformanceTestRun,
    PerformanceTestStep,
)
from judgment.processing_state import (
    ProcessingStateStore,
    state_file_status,
)
from judgment.web import processing as processing_module
from judgment.web.app import create_app
from judgment.web.events import (
    EventBroker,
    TopicSpec,
    _database_test_runs_signature,
    _database_updates_signature,
)
from judgment.web.processing import (
    ProcessingManager,
    _build_timeline,
    _import_month_timeline,
    _index_month_coverage_runtime,
    _pipeline_processes_from_ps,
    build_processing_plan,
    build_processing_snapshot,
)


@pytest.fixture(autouse=True)
def _no_external_processes(monkeypatch):
    """Keep tests deterministic; tests that need detection patch it explicitly."""

    monkeypatch.setattr(processing_module, "_detect_external_processes", lambda: [])


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


def _settings(tmp_path: Path) -> Settings:
    data_dir = tmp_path / "judgments"
    (data_dir / "raw_rar").mkdir(parents=True, exist_ok=True)
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=data_dir,
        judgment_law_list=Path(__file__).resolve().parents[1]
        / "documents"
        / "金融法規.md",
        auto_create_schema=False,
    )


def _add_judgment(session_factory, *, source_archive: str) -> None:
    with session_factory() as session:
        session.add(
            JudgmentDocument(
                jid=f"jid-{source_archive}",
                jdate="20260101",
                court="臺灣臺北地方法院",
                court_normalized="臺灣臺北地方法院",
                title="測試判決",
                source_archive=source_archive,
                content_hash="a" * 64,
                full_text="依銀行法第 1 條規定。",
                full_text_length=13,
            )
        )
        session.commit()


def test_state_store_tracks_run_archive_and_stages(
    tmp_path: Path, monkeypatch
) -> None:
    state_path = tmp_path / "state" / "processing.json"
    monkeypatch.setenv("JUDGMENT_PROCESSING_STATE", str(state_path))
    store = ProcessingStateStore()

    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "filter", "postgres"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202601.rar", path="raw_rar/202601.rar", size_bytes=120)
    store.update_archive(run_id, "202601.rar", status="running")
    store.start_stage(run_id, "extract", total=1000)
    store.update_archive_stage(
        run_id,
        "202601.rar",
        "extract",
        status="running",
        current=400,
        total=1000,
    )
    store.update_archive(run_id, "202601.rar", scanned=3, matched=1, stored=1)
    store.finish_stage(run_id, "extract", current=1000, total=1000)
    store.update_archive_stage(
        run_id,
        "202601.rar",
        "extract",
        status="success",
        current=1000,
        total=1000,
    )
    store.finish_run(run_id, status="success", counts={"stored_count": 1})

    payload = store.read()
    assert state_path.exists()
    run = payload["runs"][0]
    assert run["status"] == "success"
    assert run["counts"]["stored_count"] == 1
    assert run["stages"]["extract"]["status"] == "success"
    assert run["stages"]["extract"]["current"] == 1000
    assert run["stages"]["postgres"]["status"] == "skipped"
    archive = run["archives"]["202601.rar"]
    assert archive["status"] == "success"
    assert archive["scanned"] == 3
    assert archive["stages"]["extract"]["current"] == 1000

    status = state_file_status(state_path)
    assert status["status"] == "ok"
    assert status["runs"] == 1


def test_state_store_accepts_partial_run(tmp_path: Path) -> None:
    store = ProcessingStateStore(tmp_path / "processing.json")
    run_id = store.start_run(
        branch="judgment",
        kind="judgment_download",
        title="判決下載",
        stages=["download"],
        pid=os.getpid(),
    )
    store.start_stage(run_id, "download")
    store.finish_stage(
        run_id, "download", status="partial", message="待補齊月份已保留"
    )
    store.finish_run(run_id, status="partial", counts={"pending_count": 2})

    run = store.read()["runs"][0]
    assert run["status"] == "partial"
    assert run["counts"]["pending_count"] == 2
    assert run["stages"]["download"]["status"] == "partial"
    assert run["stages"]["download"]["finished_at"]


def test_state_store_marks_missing_process_stale(
    tmp_path: Path, monkeypatch
) -> None:
    state_path = tmp_path / "state" / "processing.json"
    monkeypatch.setenv("JUDGMENT_PROCESSING_STATE", str(state_path))
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="law",
        kind="download",
        title="法規下載",
        pid=-1,
    )
    store.add_archive(run_id, "ignored.rar")
    run = store.read()["runs"][0]
    assert run["status"] == "stale"
    assert run["finished_at"]
    assert "程序已不存在" in run["message"]


def test_snapshot_and_plan_report_real_archive_coverage(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    (raw_dir / "202601.rar").write_bytes(b"a" * 10)
    (raw_dir / "202602.rar").write_bytes(b"b" * 20)
    _add_judgment(session_factory, source_archive="202601.rar")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    local = snapshot["local_archives"]
    assert local["available"] is True
    assert local["total"] == 2
    assert local["processed"] == 1
    assert local["unprocessed"] == 1
    assert local["unprocessed_bytes"] == 20

    assert [branch["key"] for branch in snapshot["branches"]] == [
        "judgment",
        "law",
        "order",
    ]
    judgment = snapshot["branches"][0]
    assert [stage["key"] for stage in judgment["stages"]] == [
        "extract",
        "raw_parquet",
        "filter",
        "postgres",
        "qdrant",
    ]
    assert snapshot["archives"]["source"] == "local"
    statuses = {
        item["name"]: item["status"] for item in snapshot["archives"]["items"]
    }
    assert statuses == {"202601.rar": "idle", "202602.rar": "pending"}
    assert snapshot["state"]["status"] == "missing"

    plan = build_processing_plan(
        settings=settings,
        session_factory=session_factory,
    )
    assert plan["local_archives"]["unprocessed"] == 1
    assert [item["name"] for item in plan["local_archives"]["pending"]] == [
        "202602.rar"
    ]
    assert plan["recommended"]["index"] is True
    assert plan["legal_index"]["status"] == "not_indexed"
    assert plan["recommended"]["legal_index"] is True

    sections = {section["key"]: section for section in snapshot["sections"]}
    assert [stage["key"] for stage in sections["legal"]["stages"]] == [
        "download",
        "raw_parquet",
        "parse",
        "postgres",
        "legal_qdrant",
    ]
    assert [stage["key"] for stage in sections["judgment"]["stages"]] == [
        "download",
        "extract",
        "raw_parquet",
        "filter",
        "postgres",
        "qdrant",
    ]
    legal_qdrant = next(
        stage
        for stage in sections["legal"]["stages"]
        if stage["key"] == "legal_qdrant"
    )
    judgment_qdrant = next(
        stage
        for stage in sections["judgment"]["stages"]
        if stage["key"] == "qdrant"
    )
    assert legal_qdrant["model"]["model"].startswith(settings.embedding_model)
    assert judgment_qdrant["model"]["model"].startswith(
        settings.embedding_model
    )
    assert ":" in legal_qdrant["model"]["label"]
    assert sections["legal"]["stages"][0]["model"]["role"] == ""

    judgment_postgres = next(
        stage
        for stage in sections["judgment"]["stages"]
        if stage["key"] == "postgres"
    )
    assert judgment_postgres["phase"] == "pending"
    assert judgment_postgres["show_progress"] is False
    assert judgment_postgres["percent"] is None
    assert judgment_postgres["pending"]["count"] == 1
    assert judgment_postgres["actions"][0]["workflow_id"] == "judgment_import"


def test_processing_sections_report_remote_updates_and_actions(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    (settings.judgment_data_dir / "raw_rar" / "202601.rar").write_bytes(b"a")
    now = datetime.now(timezone.utc)
    local_zips = {}
    for source, size in (("law", 100), ("order", 200)):
        local_zip = tmp_path / f"{source}.zip"
        local_zip.write_bytes(b"x" * size)
        local_zips[source] = local_zip
    with session_factory() as session:
        session.add(
            LawDatasetVersion(
                source_type="law",
                source_url="https://example.test/law",
                update_date="2026/11/06 上午 12:00:00",
                version_code="202611131821",
                content_sha256="a" * 64,
                raw_json_sha256="b" * 64,
                zip_sha256="c" * 64,
                zip_path=str(local_zips["law"]),
                parquet_path="/tmp/law.parquet",
                law_count=1,
                article_count=10,
                downloaded_at=now,
                is_current=True,
            )
        )
        for source, remote_size, message in (
            ("law", 130, "法規遠端 ZIP 大小變更"),
            ("order", 260, "命令遠端 ZIP 大小變更"),
        ):
            session.add(
                DownloadUpdateRecord(
                    source_type=source,
                    source_url=f"https://example.test/{source}",
                    status="update_available",
                    update_available=True,
                    checked_at=now,
                    remote_content_length=remote_size,
                    download_path=str(local_zips[source]),
                    message=message,
                    is_current=True,
                )
            )
        session.commit()

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    sections = {section["key"]: section for section in snapshot["sections"]}
    legal = sections["legal"]
    assert legal["update_count"] == 2
    download = next(
        stage for stage in legal["stages"] if stage["key"] == "download"
    )
    assert download["label"] == "線上版本比對／下載更新"
    assert download["status"] == "update"
    assert download["phase"] == "update_available"
    assert download["show_progress"] is False
    assert download["percent"] is None
    assert download["update"]["count"] == 2
    comparison = download["lanes"][0]["stage"]["comparison"]
    assert comparison["available"] is True
    assert comparison["local_size"] == 100
    assert comparison["remote_size"] == 130
    assert comparison["diff_bytes"] == 30
    assert comparison["same_size"] is False
    assert legal["versions"][0]["version_code"] == "202611131821"
    assert (
        download["lanes"][0]["stage"]["source"]["version_code"]
        == "202611131821"
    )
    assert [item["workflow_id"] for item in download["update"]["items"]] == [
        "law_download",
        "order_download",
    ]
    assert [action["workflow_id"] for action in download["actions"]] == [
        "law_download",
        "order_download",
    ]
    assert download["recheck"]["kind"] == "check_updates"
    assert download["recheck"]["source_types"] == ["law", "order"]


def test_embedding_runtime_reports_host_and_full_model_tag(
    tmp_path: Path, session_factory
) -> None:
    settings = _settings(tmp_path)
    with session_factory() as session:
        session.add(
            OllamaHost(
                name="x570",
                base_url="http://x570:11434",
                port=11434,
                is_active=True,
                priority=0,
                embedding_model="bge-m3:latest",
            )
        )
        session.add(
            OllamaModelCapability(
                base_url="http://x570:11434",
                model="bge-m3:latest",
                capabilities=["embedding"],
            )
        )
        session.commit()

    runtime = processing_module._embedding_runtime(settings, session_factory)
    assert runtime["host"] == "x570"
    assert runtime["model"] == "bge-m3:latest"
    assert runtime["label"] == "x570:bge-m3:latest"


def test_legal_index_stage_uses_live_index_progress(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="law",
        kind="legal_index",
        title="法規／命令索引",
        stages=["legal_qdrant"],
        pid=os.getpid(),
    )
    store.start_stage(run_id, "legal_qdrant", total=1000)
    time.sleep(1.05)
    store.update_stage(run_id, "legal_qdrant", current=250, total=1000)

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    sections = {section["key"]: section for section in snapshot["sections"]}
    stage = next(
        item
        for item in sections["legal"]["stages"]
        if item["key"] == "legal_qdrant"
    )

    assert stage["phase"] == "running"
    assert stage["show_progress"] is True
    assert stage["percent"] == 25.0
    assert stage["current"] == 250
    assert stage["total"] == 1000
    assert stage["rate"] is not None and stage["rate"] > 0
    for lane in stage["lanes"]:
        assert lane["stage"]["current"] == 250
        assert lane["stage"]["total"] == 1000
        assert lane["stage"]["percent"] == 25.0
        assert lane["stage"]["rate"] == stage["rate"]


def test_workflow_progress_derives_archive_percent() -> None:
    run = {
        "id": "run-1",
        "status": "running",
        "stages": {
            "raw_parquet": {
                "key": "raw_parquet",
                "label": "原始資料檢查／Parquet 備份",
                "status": "running",
                "current": 12345,
                "total": None,
            },
            "postgres": {
                "key": "postgres",
                "label": "PostgreSQL metadata",
                "status": "running",
                "current": 0,
                "total": None,
            },
        },
        "archives": {
            "a": {
                "stages": {
                    "raw_parquet": {"status": "success", "current": 10, "total": 10},
                    "postgres": {"status": "success", "current": 10, "total": 10},
                }
            },
            "b": {
                "stages": {
                    "raw_parquet": {"status": "running", "current": 5, "total": 10},
                    "postgres": {"status": "running", "current": 0, "total": None},
                }
            },
            "c": {
                "stages": {
                    "raw_parquet": {"status": "success", "current": 10, "total": 10},
                    "postgres": {"status": "pending"},
                }
            },
            "d": {
                "stages": {
                    "raw_parquet": {"status": "pending"},
                    "postgres": {"status": "pending"},
                }
            },
        },
    }

    progress = processing_module._workflow_progress(run)
    stages = {stage["key"]: stage for stage in progress["stages"]}

    assert stages["raw_parquet"]["percent"] == 62.5
    assert stages["raw_parquet"]["current"] == 12345
    assert stages["postgres"]["percent"] == 25.0


def test_overview_uses_active_import_archive_progress(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    for name in ("202601.rar", "202602.rar"):
        (settings.judgment_data_dir / "raw_rar" / name).write_bytes(b"a")
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "raw_parquet", "filter", "postgres"],
        pid=os.getpid(),
    )
    for name, done in (("202601.rar", True), ("202602.rar", False)):
        store.add_archive(run_id, name, path=name, size_bytes=1)
        if done:
            store.update_archive_stage(
                run_id,
                name,
                "raw_parquet",
                status="success",
                current=100,
                total=100,
            )
    store.start_stage(
        run_id,
        "raw_parquet",
        message="寫入不含篩選、未修改內容的原始 Parquet。",
    )
    store.update_stage(
        run_id,
        "raw_parquet",
        current=1234,
        message="已寫入 1,234 筆原始 JSON。",
    )

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    sections = {section["key"]: section for section in snapshot["sections"]}
    stage = next(
        item
        for item in sections["judgment"]["stages"]
        if item["key"] == "raw_parquet"
    )

    assert stage["phase"] == "running"
    assert stage["show_progress"] is True
    assert stage["percent"] == 50.0
    assert stage["current"] == 1
    assert stage["total"] == 2
    assert stage["lanes"][0]["stage"]["percent"] == 50.0


def test_law_order_timeline_reports_four_stage_states() -> None:
    database = {
        "versions": [
            {
                "id": 1,
                "source_type": "law",
                "version_code": "202611061802",
                "update_date": "2026/10/30 上午 12:00:00",
                "downloaded_at": "2026-11-06T10:02:37+00:00",
                "law_count": 1351,
                "article_count": 47377,
                "is_current": False,
                "parquet_path": "",
            },
            {
                "id": 3,
                "source_type": "law",
                "version_code": "202611131809",
                "update_date": "2026/11/6 上午 12:00:00",
                "downloaded_at": "2026-11-13T10:09:39+00:00",
                "law_count": 1351,
                "article_count": 47377,
                "is_current": True,
                "parquet_path": "",
            },
        ]
    }
    law_raw_backups = {
        "law": {
            "manifests": [
                {
                    "update_date": "2026/10/30 上午 12:00:00",
                    "created_at": "2026-11-08T08:37:35+00:00",
                    "parquet_path": "",
                    "row_count": 1351,
                },
                {
                    "update_date": "2026/11/6 上午 12:00:00",
                    "created_at": "2026-11-13T10:09:39+00:00",
                    "parquet_path": "",
                    "row_count": 1351,
                },
            ]
        }
    }

    timeline = processing_module._law_order_file_timeline(
        "law",
        database=database,
        law_raw_backups=law_raw_backups,
        legal_index={"status": "fresh"},
        runs=[],
        now_taipei=datetime.now(timezone.utc),
    )
    months = {item["month"]: item for item in timeline["months"]}

    assert months["202611"]["stages"] == {
        "download": "complete",
        "parquet": "complete",
        "postgres": "complete",
        "qdrant": "complete",
    }
    assert months["202610"]["stages"] == {
        "download": "complete",
        "parquet": "complete",
        "postgres": "complete",
        "qdrant": "not_applicable",
    }
    assert timeline["summary"]["complete"] == 2
    assert timeline["summary"]["incomplete"] == 0
    assert timeline["current"]["file"] == "202611131809"


def test_judgment_timeline_marks_processing_stage(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    settings = _settings(tmp_path)
    monkeypatch.setattr(
        processing_module, "_judgment_raw_parquet_months", lambda _settings: {}
    )
    monkeypatch.setattr(
        processing_module,
        "_index_month_coverage_runtime",
        lambda *_args, **_kwargs: None,
    )
    timeline = processing_module._judgment_file_timeline(
        settings=settings,
        session_factory=session_factory,
        database={"judgment_months": {}},
        import_timeline={
            "active_month": "202601",
            "active_archive": "202601.rar",
            "months": [
                {
                    "month": "202601",
                    "local_files": ["202601.rar"],
                    "imported": False,
                    "has_update": False,
                }
            ],
        },
        archives={
            "items": [
                {
                    "name": "202601.rar",
                    "current_stage": "raw_parquet",
                    "stages": {
                        "raw_parquet": {"status": "running"},
                        "postgres": {"status": "pending"},
                    },
                }
            ]
        },
        index={"remaining": 1, "total": 1},
        runs=[],
        embedding_runtime={
            "host": "x570",
            "model": "bge-m3:latest",
            "url": "http://x570:11434",
        },
        now_taipei=datetime.now(timezone.utc),
    )
    month = timeline["months"][0]

    assert month["stages"] == {
        "download": "complete",
        "parquet": "processing",
        "postgres": "incomplete",
        "qdrant": "incomplete",
    }
    assert month["overall"] == "processing"
    assert month["active"] is True
    assert timeline["summary"]["processing"] == 1
    assert timeline["current"]["label"] == "目前匯入"


def test_judgment_timeline_keeps_reusable_parquet_complete_while_active(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    settings = _settings(tmp_path)
    archive_path = tmp_path / "202601.rar"
    archive_path.write_bytes(b"archive")
    monkeypatch.setattr(
        processing_module,
        "_judgment_raw_parquet_months",
        lambda _settings: {"202601": {"month": "202601"}},
    )
    monkeypatch.setattr(
        processing_module,
        "find_reusable_raw_parquet",
        lambda *_args: {"rows": 10},
    )
    monkeypatch.setattr(
        processing_module,
        "_index_month_coverage_runtime",
        lambda *_args, **_kwargs: None,
    )
    timeline = processing_module._judgment_file_timeline(
        settings=settings,
        session_factory=session_factory,
        database={"judgment_months": {}},
        import_timeline={
            "active_month": "202601",
            "active_archive": "202601.rar",
            "active_phase": "raw_parquet",
            "months": [
                {
                    "month": "202601",
                    "local_files": ["202601.rar"],
                    "imported": False,
                    "has_update": False,
                }
            ],
        },
        archives={
            "items": [
                {
                    "name": "202601.rar",
                    "path": str(archive_path),
                    "current_stage": "raw_parquet",
                    "stages": {
                        "raw_parquet": {"status": "running"},
                        "postgres": {"status": "pending"},
                    },
                }
            ]
        },
        index={"remaining": 1, "total": 1},
        runs=[],
        embedding_runtime={
            "host": "x570",
            "model": "bge-m3:latest",
            "url": "http://x570:11434",
        },
        now_taipei=datetime.now(timezone.utc),
    )
    month = timeline["months"][0]

    assert month["active"] is True
    assert month["stages"]["parquet"] == "complete"
    assert month["stages"]["postgres"] == "incomplete"


def test_workflow_failed_stage_reports_reason_and_resolution() -> None:
    run = {
        "id": "run-failed",
        "status": "failed",
        "message": (
            "DataError: (psycopg.DataError) PostgreSQL text fields cannot "
            "contain NUL (0x00) bytes\n[SQL: INSERT INTO judgment_documents]"
        ),
        "stages": {
            "filter": {
                "key": "filter",
                "label": "金融法規篩選",
                "status": "failed",
                "current": 10685,
                "total": 3947623,
                "message": "已處理 10,685 筆 DuckDB 候選，命中 10,685 筆。",
            },
            "postgres": {
                "key": "postgres",
                "label": "PostgreSQL metadata",
                "status": "failed",
                "current": 10685,
                "message": "已寫入 10,685 筆。",
            },
        },
    }

    progress = processing_module._workflow_progress(run)
    stages = {stage["key"]: stage for stage in progress["stages"]}

    for key in ("filter", "postgres"):
        assert "NUL (0x00)" in stages[key]["error"]
        assert "移除 NUL" in stages[key]["resolution"]
        assert "\n" not in stages[key]["error"]


def test_stage_rate_uses_cumulative_elapsed_time() -> None:
    stage = {
        "key": "legal_qdrant",
        "label": "法規／命令索引",
        "status": "running",
        "started_at": (
            datetime.now(timezone.utc) - timedelta(seconds=10)
        ).isoformat(),
        "current": 100,
        "total": 1000,
        "rate": 999999.0,
    }

    view = processing_module._stage_view(stage, {"id": "run-1"})

    assert view["rate"] is not None
    assert 9.0 <= view["rate"] <= 11.0


def test_stage_view_uses_current_catalog_label_for_legacy_runs() -> None:
    stage = {
        "key": "raw_parquet",
        "label": "原始 Parquet 備份／沿用",
        "status": "success",
    }

    view = processing_module._stage_view(stage, {"id": "run-1"})

    assert view["label"] == "原始資料檢查／Parquet 備份"


def test_processing_sections_only_show_progress_after_execution(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    store = ProcessingStateStore()
    for source in ("law", "order"):
        run_id = store.start_run(
            branch=source,
            kind=f"{source}_download",
            title=f"{source} 下載",
            stages=["download", "raw_parquet"],
            pid=os.getpid(),
        )
        store.start_stage(run_id, "download", total=1)
        store.finish_stage(
            run_id, "download", status="success", current=1, total=1
        )
        store.finish_stage(
            run_id,
            "raw_parquet",
            status="skipped",
            message="內容未變更，略過。",
        )
        store.finish_run(run_id, status="success")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    sections = {section["key"]: section for section in snapshot["sections"]}
    download = next(
        stage
        for stage in sections["legal"]["stages"]
        if stage["key"] == "download"
    )
    raw_parquet = next(
        stage
        for stage in sections["legal"]["stages"]
        if stage["key"] == "raw_parquet"
    )

    assert download["phase"] == "completed"
    assert download["show_progress"] is True
    assert download["percent"] == 100.0
    assert raw_parquet["phase"] in {"idle", "ready"}
    assert raw_parquet["show_progress"] is False
    assert raw_parquet["percent"] is None


@pytest.fixture()
def processing_client(
    tmp_path: Path, monkeypatch, session_factory
) -> TestClient:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    (settings.judgment_data_dir / "raw_rar" / "202601.rar").write_bytes(b"a")
    app = create_app(
        settings=settings,
        session_factory=session_factory,
        data_dir=settings.law_data_dir,
    )
    with TestClient(app) as client:
        yield client


def test_processing_api_returns_snapshot_and_plan(
    processing_client: TestClient,
) -> None:
    response = processing_client.get("/api/processing")
    assert response.status_code == 200
    payload = response.json()
    assert payload["state"]["status"] == "missing"
    assert payload["local_archives"]["total"] == 1
    assert payload["local_archives"]["unprocessed"] == 1
    assert [branch["key"] for branch in payload["branches"]] == [
        "judgment",
        "law",
        "order",
    ]
    assert payload["capabilities"]["unprocessed_archives"] == 1
    timelines = {
        item["key"]: item for item in payload["file_timelines"]
    }
    assert list(timelines) == ["law", "order", "judgment"]
    assert timelines["law"]["total_months"] == 0
    judgment_months = timelines["judgment"]["months"]
    assert timelines["judgment"]["total_months"] == 1
    assert judgment_months[0]["month"] == "202601"
    assert judgment_months[0]["stages"] == {
        "download": "complete",
        "parquet": "incomplete",
        "postgres": "incomplete",
        "qdrant": "incomplete",
    }
    assert judgment_months[0]["overall"] == "incomplete"
    assert timelines["judgment"]["current"]["label"] == "最新月份"
    models = timelines["judgment"]["models"]
    assert set(models) == {"embedding", "rerank"}
    assert models["embedding"]["model"]
    assert models["embedding"]["label"]
    assert models["rerank"]["model"] == "bge-reranker-v2-m3"
    assert models["rerank"]["label"]

    plan = processing_client.get("/api/processing/plan")
    assert plan.status_code == 200
    assert plan.json()["local_archives"]["pending"][0]["name"] == "202601.rar"


def test_processing_update_endpoint_delegates_and_returns_conflict(
    processing_client: TestClient,
) -> None:
    manager = processing_client.app.state.processing_manager
    calls = {}

    def fake_start(*, index: bool = False):
        calls["index"] = index
        return {"status": "started", "run_id": "run-1", "index": index}

    manager.start_update = fake_start
    response = processing_client.post(
        "/api/processing/update", json={"index": True}
    )
    assert response.status_code == 200
    assert response.json() == {
        "status": "started",
        "run_id": "run-1",
        "index": True,
    }
    assert calls["index"] is True

    def busy(*, index: bool = False):
        raise RuntimeError("資料更新已在執行中")

    manager.start_update = busy
    conflict = processing_client.post("/api/processing/update", json={})
    assert conflict.status_code == 409
    assert "已在執行中" in conflict.json()["detail"]


def test_processing_stop_endpoint_and_middleware_skip(
    processing_client: TestClient,
) -> None:
    manager = processing_client.app.state.processing_manager
    manager.stop_update = lambda: {"status": "stopping", "run_id": "run-1"}
    response = processing_client.post("/api/processing/stop")
    assert response.status_code == 200
    assert response.json()["status"] == "stopping"

    processing_client.get("/api/processing")
    with processing_client.app.state.session_factory() as session:
        records = session.scalars(select(PerformanceRecord)).all()
    assert all(not (record.path or "").startswith("/api/processing") for record in records)



def test_archives_merge_run_state_with_local_files(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    (raw_dir / "202601.rar").write_bytes(b"a" * 10)
    (raw_dir / "202602.rar").write_bytes(b"b" * 20)
    _add_judgment(session_factory, source_archive="202601.rar")

    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "filter", "postgres"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202601.rar", size_bytes=10)
    store.update_archive(run_id, "202601.rar", status="success", stored=1)
    store.finish_run(run_id, status="success")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    archives = snapshot["archives"]
    assert archives["source"] == "run"
    assert [item["name"] for item in archives["items"]] == [
        "202601.rar",
        "202602.rar",
    ]
    statuses = {
        item["name"]: item["status"] for item in archives["items"]
    }
    assert statuses == {"202601.rar": "success", "202602.rar": "pending"}


def test_timeline_uses_update_root_stage_durations() -> None:
    update = {
        "id": "update-1",
        "kind": "update",
        "title": "資料更新",
        "status": "success",
        "started_at": "2026-01-01T00:00:00+00:00",
        "stages": {
            "download": {"status": "success", "duration_ms": 1000},
            "postgres": {"status": "success", "duration_ms": 2000},
            "parquet": {"status": "success", "duration_ms": 3000},
            "qdrant": {"status": "skipped", "duration_ms": 0},
        },
    }
    child = {
        "id": "import-1",
        "kind": "import",
        "title": "判決 RAR 匯入",
        "status": "success",
        "started_at": "2026-01-01T00:00:05+00:00",
        "stages": {
            "extract": {"status": "success", "duration_ms": 9000},
        },
    }
    timeline = _build_timeline([child, update])
    assert timeline["run_ids"] == ["update-1"]
    assert timeline["total_ms"] == 6000
    assert [(stage["key"], stage["percent"]) for stage in timeline["stages"]] == [
        ("download", 16.7),
        ("postgres", 33.3),
        ("parquet", 50.0),
    ]

    active_child = dict(child, status="running", alive=True)
    update_running = dict(update, status="running", alive=True)
    timeline = _build_timeline([active_child, update_running])
    assert timeline["run_ids"] == ["update-1"]


def test_manager_start_records_child_pid_without_stale_state(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    state_path = tmp_path / "processing_state.json"
    manager = ProcessingManager(
        settings=_settings(tmp_path),
        session_factory=session_factory,
        state_path=state_path,
    )
    manager.root = tmp_path
    captured = {}

    def fake_popen(command, **kwargs):
        captured["command"] = list(command)
        captured["env"] = dict(kwargs["env"])
        return SimpleNamespace(pid=os.getpid())

    monkeypatch.setattr(processing_module.subprocess, "Popen", fake_popen)
    result = manager.start_update(index=True)

    assert result["status"] == "started"
    assert "--index" in captured["command"]
    assert captured["env"]["JUDGMENT_PROCESSING_STATE"] == str(state_path)
    assert captured["env"]["JUDGMENT_PROCESSING_PARENT"] == result["run_id"]
    run = ProcessingStateStore(state_path).read()["runs"][0]
    assert run["status"] == "running"
    assert run["pid"] == os.getpid()
    assert run["meta"]["pid_pending"] is False
    manager.store.finish_run(result["run_id"], status="interrupted")


def test_manager_stop_refuses_while_update_pid_is_pending(
    tmp_path: Path, session_factory
) -> None:
    state_path = tmp_path / "processing_state.json"
    manager = ProcessingManager(
        settings=_settings(tmp_path),
        session_factory=session_factory,
        state_path=state_path,
    )
    run_id = manager.store.start_run(
        branch="system",
        kind="update",
        title="資料更新",
        stages=["download"],
        pid=os.getpid(),
        meta={"pid_pending": True},
    )
    result = manager.stop_update()
    assert result["status"] == "starting"
    assert result["run_id"] == run_id
    manager.store.finish_run(run_id, status="interrupted")


def test_snapshot_reports_raw_parquet_backups(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = (
        settings.judgment_data_dir
        / "parquet"
        / "raw_judgments"
        / "202601--demo"
        / "20261108"
        / "120000-demo"
    )
    raw_dir.mkdir(parents=True)
    (raw_dir / "raw.parquet").write_bytes(b"stub")
    (raw_dir / "manifest.json").write_text(
        json.dumps({"version": 2, "row_count": 123, "created_at": "2026-11-08T12:00:00+00:00"}),
        encoding="utf-8",
    )
    _add_judgment(session_factory, source_archive="202601.rar")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )

    assert snapshot["raw_backups"]["available"] is True
    assert snapshot["raw_backups"]["count"] == 1
    judgment = snapshot["branches"][0]
    raw_stage = next(stage for stage in judgment["stages"] if stage["key"] == "raw_parquet")
    assert {"label": "磁碟備份", "value": "1 檔"} in raw_stage["stats"]
    assert {"label": "最新備份", "value": "123 筆"} in raw_stage["stats"]


def test_snapshot_reports_duckdb_candidate_count(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = (
        settings.judgment_data_dir
        / "parquet"
        / "raw_judgments"
        / "202601--demo"
        / "20261108"
        / "120000-demo"
    )
    raw_dir.mkdir(parents=True)
    (raw_dir / "raw.parquet").write_bytes(b"stub")
    (raw_dir / "manifest.json").write_text(
        json.dumps(
            {
                "version": 3,
                "row_count": 123,
                "candidate_count": 90,
                "created_at": "2026-11-08T12:00:00+00:00",
            }
        ),
        encoding="utf-8",
    )
    _add_judgment(session_factory, source_archive="202601.rar")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )

    judgment = snapshot["branches"][0]
    raw_stage = next(stage for stage in judgment["stages"] if stage["key"] == "raw_parquet")
    assert {"label": "最新備份", "value": "123 筆"} in raw_stage["stats"]
    assert {"label": "最新 DuckDB 候選", "value": "90 筆"} in raw_stage["stats"]


def test_raw_only_state_does_not_mark_archive_as_imported(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    (raw_dir / "202603.rar").write_bytes(b"raw")
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決原始 Parquet 備份",
        stages=["extract", "raw_parquet"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202603.rar", size_bytes=3)
    store.update_archive_stage(
        run_id, "202603.rar", "extract", status="success", current=100, total=100
    )
    store.update_archive_stage(
        run_id, "202603.rar", "raw_parquet", status="success", current=10, total=10
    )
    store.update_archive(
        run_id,
        "202603.rar",
        status="success",
        scanned=10,
        matched=0,
        stored=0,
    )
    store.finish_run(run_id, status="success")

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )
    local = snapshot["local_archives"]
    assert local["processed"] == 0
    assert local["unprocessed"] == 1
    plan = build_processing_plan(
        settings=settings,
        session_factory=session_factory,
    )
    assert [item["name"] for item in plan["local_archives"]["pending"]] == [
        "202603.rar"
    ]


def _process(
    *,
    pid: int,
    kind: str,
    branch: str,
    title: str,
    elapsed_ms: int = 90_000,
) -> dict:
    return {
        "pid": pid,
        "kind": kind,
        "branch": branch,
        "title": title,
        "command": f"python -m judgment.{kind} --run",
        "elapsed_ms": elapsed_ms,
        "started_at": "2026-01-01T00:00:00+00:00",
    }


def test_pipeline_processes_from_ps_parses_and_classifies() -> None:
    now = datetime(2026, 1, 1, 3, 0, 0, tzinfo=timezone.utc)
    output = """
  101  02:13:14 /repo/.venv/bin/python judgment-index-vectors --limit 10
  102  00:12 uv run judgment-law-download --source law
  103  1-01:02:03 /repo/.venv/bin/python -m judgment.processing_update --run-id run-1
  104  00:03 bash ./scripts/index_full_task.sh
  105  00:01 uv run judgment-law-download --source order
  106  00:05 uv run judgment-index-legal-articles --incremental --if-changed
"""
    processes = _pipeline_processes_from_ps(output, now=now, exclude_pids=[101])
    assert [(item["pid"], item["kind"], item["branch"]) for item in processes] == [
        (102, "download", "law"),
        (103, "update", "system"),
        (105, "download", "order"),
        (106, "legal_index", "law"),
    ]
    law = processes[0]
    assert law["elapsed_ms"] == 12_000
    assert law["started_at"] == "2026-01-01T02:59:48+00:00"
    update = processes[1]
    assert update["elapsed_ms"] == 90_123_000


def test_snapshot_marks_external_import_stages_unavailable(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    (raw_dir / "202601.rar").write_bytes(b"a" * 10)
    (raw_dir / "202602.rar").write_bytes(b"b" * 20)
    _add_judgment(session_factory, source_archive="202601.rar")
    process = _process(
        pid=4242,
        kind="import",
        branch="judgment",
        title="判決 RAR 匯入",
    )
    monkeypatch.setattr(
        processing_module, "_detect_external_processes", lambda: [process]
    )

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )

    assert snapshot["mode"] == "running"
    assert snapshot["external_processes"] == [process]
    judgment = snapshot["branches"][0]
    assert judgment["active_run"]["external"] is True
    assert judgment["active_run"]["pid"] == 4242
    assert {
        stage["key"]: stage["status"] for stage in judgment["stages"]
    } == {
        "extract": "unavailable",
        "raw_parquet": "unavailable",
        "filter": "unavailable",
        "postgres": "unavailable",
        "qdrant": "unavailable",
    }
    archives = snapshot["archives"]
    assert archives["source"] == "local"
    assert archives["external"] is True
    assert archives["run"]["external"] is True
    assert "外部判決匯入程序" in archives["note"]
    statuses = {item["name"]: item["status"] for item in archives["items"]}
    assert statuses == {"202601.rar": "idle", "202602.rar": "pending"}
    capabilities = snapshot["capabilities"]
    assert capabilities["can_start_update"] is False
    assert capabilities["can_start_update_with_index"] is False
    assert capabilities["external_processes"] == 1
    assert "外部判決 RAR 匯入" in capabilities["start_blocked_reason"]
    assert any(
        notice["title"] == "偵測到外部程序：判決 RAR 匯入"
        for notice in snapshot["notices"]
    )


def test_snapshot_excludes_tracked_workflow_child_process(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    _add_judgment(session_factory, source_archive="202601.rar")
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="judgment",
        kind="normalize_courts",
        title="法院名稱正規化",
        stages=["postgres"],
        pid=os.getpid(),
        meta={"workflow": "normalize_courts", "child_pid": 9001},
    )
    child = _process(
        pid=9001,
        kind="import",
        branch="judgment",
        title="判決 RAR 匯入",
    )
    monkeypatch.setattr(
        processing_module, "_detect_external_processes", lambda: [child]
    )

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )

    assert snapshot["external_processes"] == []
    workflow = next(
        item for item in snapshot["workflows"] if item["id"] == "normalize_courts"
    )
    assert workflow["active_run"]["id"] == run_id
    assert workflow["can_run"] is False
    assert snapshot["capabilities"]["can_start_workflow"] is False


def test_snapshot_blocks_only_index_start_when_external_index_runs(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    settings = _settings(tmp_path)
    _add_judgment(session_factory, source_archive="202601.rar")
    process = _process(
        pid=5151,
        kind="index",
        branch="judgment",
        title="Qdrant 向量索引",
        elapsed_ms=600_000,
    )
    monkeypatch.setattr(
        processing_module, "_detect_external_processes", lambda: [process]
    )

    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
    )

    judgment = snapshot["branches"][0]
    assert judgment["active_run"]["external"] is True
    stages = {stage["key"]: stage for stage in judgment["stages"]}
    assert stages["qdrant"]["status"] == "running"
    assert stages["qdrant"]["current"] == snapshot["index"]["indexed"]
    assert stages["extract"]["status"] == "idle"
    capabilities = snapshot["capabilities"]
    assert capabilities["can_start_update"] is True
    assert capabilities["can_start_update_with_index"] is False
    assert capabilities["external_index_running"] is True
    assert "外部 Qdrant 索引程序" in capabilities["index_blocked_reason"]


def test_manager_refuses_start_when_external_work_is_running(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    state_path = tmp_path / "processing_state.json"
    settings = _settings(tmp_path)
    manager = ProcessingManager(
        settings=settings,
        session_factory=session_factory,
        state_path=state_path,
    )
    monkeypatch.setattr(
        processing_module,
        "_detect_external_processes",
        lambda: [
            _process(
                pid=6161,
                kind="import",
                branch="judgment",
                title="判決 RAR 匯入",
            )
        ],
    )
    with pytest.raises(RuntimeError, match="外部判決 RAR 匯入"):
        manager.start_update()
    assert not state_path.exists()

    monkeypatch.setattr(
        processing_module,
        "_detect_external_processes",
        lambda: [
            _process(
                pid=7171,
                kind="index",
                branch="judgment",
                title="Qdrant 向量索引",
            )
        ],
    )
    with pytest.raises(RuntimeError, match="Qdrant 索引程序"):
        manager.start_update(index=True)
    assert not state_path.exists()


def test_processing_snapshot_lists_workflows(processing_client: TestClient) -> None:
    payload = processing_client.get("/api/processing").json()
    workflows = {item["id"]: item for item in payload["workflows"]}
    assert "full_update" not in workflows
    assert "law_download" in workflows
    assert "judgment_import" in workflows
    assert "index_versions" in workflows
    assert "legal_index_versions" in workflows
    assert workflows["index_versions"]["script"] == "scripts/index_full_task.sh"
    assert workflows["legal_index_versions"]["stage"] == "legal_qdrant"
    assert workflows["legal_index_versions"]["program"].startswith(
        "judgment-index-legal-articles"
    )
    assert workflows["law_download"]["program"].startswith("judgment-law-download")


def test_processing_snapshot_exposes_index_runtime(
    tmp_path: Path, monkeypatch, session_factory
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="judgment",
        kind="index",
        title="Qdrant 向量索引版本",
        stages=["ollama", "qdrant", "validate"],
        pid=os.getpid(),
    )
    runtime = {
        "version_id": 7,
        "collection": "judgments_v007",
        "alias": "judgments_current",
        "build_mode": "reuse",
        "model": "bge-m3",
        "batch_size": 64,
        "expected_count": 100,
        "embedding": {
            "status": "operational",
            "model": "bge-m3",
            "hosts": [
                {
                    "role": "primary",
                    "url": "http://x570:11434",
                    "host": "x570",
                    "port": 11434,
                    "status": "operational",
                    "model": "bge-m3",
                    "models": ["bge-m3"],
                }
            ],
            "selected": {
                "role": "primary",
                "url": "http://x570:11434",
                "host": "x570",
                "port": 11434,
                "model": "bge-m3",
            },
        },
        "months": [
            {
                "month": "202608",
                "archive": "202608.rar",
                "total": 100,
                "processed": 42,
                "reused": 30,
                "embedded": 12,
                "percent": 42.0,
                "status": "running",
            }
        ],
        "current": {
            "month": "202608",
            "archive": "202608.rar",
            "jid": "TPDV,115,金訴,1,20260801,1",
            "batch_size": 64,
            "indexed": 42,
        },
        "summary": {
            "indexed": 42,
            "total": 100,
            "reused": 30,
            "embedded": 12,
        },
    }
    store.update_run(run_id, meta={"index_runtime": runtime})
    store.finish_stage(run_id, "ollama", status="success", current=1, total=1)
    store.finish_stage(run_id, "qdrant", status="running", current=42, total=100)
    store.finish_run(run_id, status="running")

    snapshot = build_processing_snapshot(
        settings=_settings(tmp_path),
        session_factory=session_factory,
    )
    workflow = next(
        item for item in snapshot["workflows"] if item["id"] == "index_versions"
    )
    assert workflow["index_runtime"]["available"] is True
    assert workflow["index_runtime"]["embedding"]["selected"]["host"] == "x570"
    assert workflow["index_runtime"]["months"][0]["archive"] == "202608.rar"
    assert workflow["index_runtime"]["current"]["jid"].startswith("TPDV")
    assert [stage["key"] for stage in workflow["progress"]["stages"]] == [
        "ollama",
        "qdrant",
        "validate",
    ]


def test_index_month_coverage_fallback_for_active_version(
    tmp_path: Path, session_factory
) -> None:
    settings = _settings(tmp_path)
    with session_factory() as session:
        version = JudgmentIndexVersion(
            physical_collection="judgments_v001",
            alias_name=settings.judgment_vector_alias,
            embedding_model=settings.embedding_model,
            embedding_version=settings.judgment_embedding_version,
            embedding_dimension=4,
            status="active",
            document_count=2,
            indexed_count=1,
        )
        session.add(version)
        session.flush()
        session.add_all(
            [
                JudgmentDocument(
                    jid="J-1",
                    issue_month="202601",
                    jdate="20260101",
                    court="臺灣臺北地方法院",
                    court_normalized="臺灣臺北地方法院",
                    title="測試",
                    source_archive="202601.rar",
                    content_hash="a" * 64,
                    full_text="依銀行法第 1 條規定。",
                    full_text_length=13,
                ),
                JudgmentDocument(
                    jid="J-2",
                    issue_month="202602",
                    jdate="20260201",
                    court="臺灣臺北地方法院",
                    court_normalized="臺灣臺北地方法院",
                    title="測試",
                    source_archive="202602.rar",
                    content_hash="b" * 64,
                    full_text="依銀行法第 1 條規定。",
                    full_text_length=13,
                ),
                JudgmentVectorIndex(
                    jid="J-1",
                    version_id=version.version_id,
                    collection="judgments_v001",
                    model=settings.embedding_model,
                ),
            ]
        )
        session.commit()
        version_id = version.version_id

    payload = _index_month_coverage_runtime(
        settings,
        session_factory,
        {
            "version_id": version_id,
            "indexed": 1,
            "total": 2,
            "remaining": 1,
            "collection": "judgments_v001",
            "model": settings.embedding_model,
            "alias": settings.judgment_vector_alias,
            "latest_indexed_at": None,
        },
    )
    assert payload is not None
    assert payload["coverage_only"] is True
    assert payload["run_status"] == "partial"
    months = {item["month"]: item for item in payload["months"]}
    assert months["202601"]["processed"] == 1
    assert months["202601"]["status"] == "success"
    assert months["202602"]["processed"] == 0
    assert months["202602"]["status"] == "pending"


def test_import_month_timeline_marks_imported_unimported_and_updates(
    tmp_path: Path,
) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True, exist_ok=True)
    (raw_dir / "download_manifest.json").write_text(
        json.dumps(
            {
                "months": [
                    {
                        "month": "2026-01",
                        "year": 2026,
                        "month_no": 1,
                        "status": "green",
                        "filename": "202601.rar",
                        "local_filename": "202601.rar",
                        "latest_fileset_id": 1,
                        "local_fileset_id": 1,
                    },
                    {
                        "month": "2026-02",
                        "year": 2026,
                        "month_no": 2,
                        "status": "green",
                        "filename": "202602.rar",
                        "local_filename": "202602.rar",
                        "latest_fileset_id": 2,
                        "local_fileset_id": 2,
                    },
                    {
                        "month": "2026-03",
                        "year": 2026,
                        "month_no": 3,
                        "status": "green",
                        "filename": "202603-new.rar",
                        "local_filename": "202603-new.rar",
                        "latest_fileset_id": 3,
                        "local_fileset_id": 3,
                    },
                    {
                        "month": "2026-05",
                        "year": 2026,
                        "month_no": 5,
                        "status": "gray",
                        "filename": "202605.rar",
                        "local_filename": "202605-old.rar",
                        "latest_fileset_id": 6,
                        "local_fileset_id": 5,
                    },
                ]
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    local = {
        "items": [
            {"name": "202601.rar", "processed": True},
            {"name": "202602.rar", "processed": False},
            {"name": "202603-new.rar", "processed": False},
            {"name": "202604.rar", "processed": True},
            {"name": "202605-old.rar", "processed": True},
        ],
        "processed_names": [
            "202601.rar",
            "202603-old.rar",
            "202604.rar",
            "202605-old.rar",
        ],
    }
    archives = {
        "items": [
            {"name": "202602.rar", "status": "running", "current_stage": "postgres"}
        ]
    }
    timeline = _import_month_timeline(settings, local, archives)
    months = {item["month"]: item for item in timeline["months"]}
    assert months["202601"]["status"] == "green"
    assert months["202602"]["status"] == "red"
    assert months["202602"]["active"] is True
    assert months["202603"]["status"] == "gray"
    assert months["202603"]["unimported_files"] == ["202603-new.rar"]
    assert months["202604"]["status"] == "green"
    assert months["202605"]["status"] == "gray"
    assert timeline["summary"] == {"green": 2, "red": 1, "gray": 2}
    assert timeline["active_month"] == "202602"


def test_import_month_timeline_uses_run_meta_current_archive(
    tmp_path: Path,
) -> None:
    settings = _settings(tmp_path)
    local = {
        "items": [
            {"name": "202601.rar", "processed": True},
            {"name": "202602.rar", "processed": False},
        ],
        "processed_names": ["202601.rar"],
    }
    archives = {
        "items": [],
        "run": {
            "meta": {
                "current_archive": "202602.rar",
                "current_phase": "raw_parquet",
            }
        },
    }

    timeline = _import_month_timeline(settings, local, archives)
    months = {item["month"]: item for item in timeline["months"]}

    assert timeline["active_month"] == "202602"
    assert timeline["active_archive"] == "202602.rar"
    assert timeline["active_phase"] == "raw_parquet"
    assert timeline["processing_month"] == "202602"
    assert timeline["processing_archive"] == "202602.rar"
    assert months["202602"]["active"] is True


def test_import_month_timeline_follows_pending_filter_archive(
    tmp_path: Path,
) -> None:
    settings = _settings(tmp_path)
    local = {
        "items": [{"name": "202602.rar", "processed": False}],
        "processed_names": [],
    }
    archives = {
        "items": [
            {
                "name": "202602.rar",
                "status": "pending",
                "raw_reused_prefetched": True,
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "pending"},
                    "postgres": {"status": "pending"},
                },
            }
        ],
        "run": {
            "meta": {
                "current_archive": "202602.rar",
                "current_phase": "filter",
            }
        },
    }

    timeline = _import_month_timeline(settings, local, archives)
    months = {item["month"]: item for item in timeline["months"]}

    assert timeline["active_month"] == "202602"
    assert timeline["active_archive"] == "202602.rar"
    assert timeline["active_phase"] == "filter"
    assert timeline["processing_month"] == "202602"
    assert timeline["processing_archive"] == "202602.rar"
    assert months["202602"]["active"] is True


def test_merge_import_timeline_stages_uses_four_import_stages() -> None:
    import_timeline = {
        "months": [
            {
                "month": "202601",
                "status": "green",
                "imported": True,
                "local_files": ["202601.rar"],
                "imported_files": ["202601.rar"],
                "unimported_files": [],
            },
            {
                "month": "202602",
                "status": "red",
                "imported": False,
                "local_files": ["202602.rar"],
                "imported_files": [],
                "unimported_files": ["202602.rar"],
            },
            {
                "month": "202603",
                "status": "gray",
                "imported": True,
                "local_files": ["202603-new.rar"],
                "imported_files": ["202603-old.rar"],
                "unimported_files": ["202603-new.rar"],
            },
            {
                "month": "202604",
                "status": "green",
                "imported": True,
                "local_files": ["202604.rar"],
                "imported_files": ["202604.rar"],
                "unimported_files": [],
            },
            {
                "month": "202605",
                "status": "green",
                "imported": True,
                "local_files": ["202605.rar"],
                "imported_files": ["202605.rar"],
                "unimported_files": [],
            },
        ],
        "summary": {"green": 3, "red": 1, "gray": 1},
    }
    archives = {
        "items": [
            {
                "name": "202601.rar",
                "stages": {
                    "extract": {"status": "success"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "success"},
                    "postgres": {"status": "success"},
                },
            },
            {
                "name": "202602.rar",
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "running"},
                    "postgres": {"status": "pending"},
                },
            },
            {
                "name": "202603-new.rar",
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "pending"},
                    "postgres": {"status": "pending"},
                },
            },
            {
                "name": "202604.rar",
                "status": "pending",
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "interrupted"},
                    "postgres": {"status": "interrupted"},
                },
            },
            {
                "name": "202605.rar",
                "status": "interrupted",
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "interrupted"},
                    "postgres": {"status": "interrupted"},
                },
            },
        ]
    }

    processing_module._merge_import_timeline_stages(import_timeline, archives)
    months = {item["month"]: item for item in import_timeline["months"]}

    assert months["202601"]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "complete",
        "postgres": "complete",
    }
    assert months["202601"]["import_overall"] == "complete"
    assert months["202602"]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "processing",
        "postgres": "incomplete",
    }
    assert months["202602"]["import_overall"] == "processing"
    assert months["202603"]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "incomplete",
        "postgres": "incomplete",
    }
    assert months["202603"]["import_overall"] == "incomplete"
    # A pending archive whose stages were force-marked interrupted by
    # finish_run() was never started; keep its historical imported state.
    assert months["202604"]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "complete",
        "postgres": "complete",
    }
    assert months["202604"]["import_overall"] == "complete"
    # An imported month stays green even if the rerun stopped; the workflow
    # stage itself still shows the interrupted state.
    assert months["202605"]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "complete",
        "postgres": "complete",
    }
    assert months["202605"]["import_overall"] == "complete"
    assert import_timeline["stage_order"] == [
        "extract",
        "raw_parquet",
        "filter",
        "postgres",
    ]
    assert import_timeline["stage_labels"] == {
        "extract": "RAR 檢查／解壓縮",
        "raw_parquet": "原始資料檢查／Parquet 備份",
        "filter": "金融法規篩選",
        "postgres": "PostgreSQL metadata",
    }
    assert import_timeline["stage_summary"] == {
        "complete": 3,
        "incomplete": 1,
        "processing": 1,
        "empty": 0,
    }


def test_merge_import_timeline_stages_uses_raw_parquet_for_first_two_cells() -> None:
    import_timeline = {
        "months": [
            {
                "month": "202401",
                "status": "red",
                "imported": False,
                "local_files": ["202401.rar"],
                "imported_files": [],
                "unimported_files": ["202401.rar"],
            },
        ],
    }
    archives = {
        "items": [
            {
                "name": "202401.rar",
                "status": "pending",
                "stages": {
                    "extract": {"status": "interrupted"},
                    "raw_parquet": {"status": "interrupted"},
                    "filter": {"status": "interrupted"},
                    "postgres": {"status": "interrupted"},
                },
            }
        ]
    }
    file_timelines = [
        {
            "key": "judgment",
            "months": [
                {
                    "month": "202401",
                    "stages": {"parquet": "complete"},
                }
            ],
        }
    ]

    processing_module._merge_import_timeline_stages(
        import_timeline, archives, file_timelines
    )
    month = import_timeline["months"][0]

    assert month["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "incomplete",
        "postgres": "incomplete",
    }
    assert month["import_overall"] == "incomplete"


def test_merge_import_timeline_stages_keeps_reused_active_cells_complete() -> None:
    import_timeline = {
        "active_month": "202601",
        "active_phase": "raw_parquet",
        "months": [
            {
                "month": "202601",
                "status": "red",
                "imported": False,
                "local_files": ["202601.rar"],
                "imported_files": [],
                "unimported_files": ["202601.rar"],
            }
        ],
    }
    archives = {
        "items": [
            {
                "name": "202601.rar",
                "status": "running",
                "current_stage": "raw_parquet",
                "stages": {
                    "extract": {"status": "running"},
                    "raw_parquet": {"status": "running"},
                    "filter": {"status": "pending"},
                    "postgres": {"status": "pending"},
                },
            }
        ]
    }
    file_timelines = [
        {
            "key": "judgment",
            "months": [
                {
                    "month": "202601",
                    "stages": {"parquet": "complete"},
                }
            ],
        }
    ]

    processing_module._merge_import_timeline_stages(
        import_timeline, archives, file_timelines
    )
    month = import_timeline["months"][0]

    assert import_timeline["active_phase"] == "raw_parquet"
    assert month["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "incomplete",
        "postgres": "incomplete",
    }
    assert month["import_overall"] == "incomplete"


def test_merge_import_timeline_stages_aligns_active_phase_with_gray_cell() -> None:
    import_timeline = {
        "active_month": "202602",
        "active_phase": "raw_parquet",
        "months": [
            {
                "month": "202602",
                "status": "red",
                "imported": False,
                "local_files": ["202602.rar"],
                "imported_files": [],
                "unimported_files": ["202602.rar"],
            }
        ],
    }
    archives = {
        "items": [
            {
                "name": "202602.rar",
                "status": "running",
                "stages": {
                    "extract": {"status": "skipped"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "running"},
                    "postgres": {"status": "pending"},
                },
            }
        ]
    }
    file_timelines = [
        {
            "key": "judgment",
            "months": [
                {
                    "month": "202602",
                    "stages": {"parquet": "complete"},
                }
            ],
        }
    ]

    processing_module._merge_import_timeline_stages(
        import_timeline, archives, file_timelines
    )

    assert import_timeline["active_phase"] == "filter"
    assert import_timeline["months"][0]["import_stages"] == {
        "extract": "complete",
        "raw_parquet": "complete",
        "filter": "processing",
        "postgres": "incomplete",
    }


def test_merge_import_timeline_stages_keeps_cursor_phase_for_older_month() -> None:
    import_timeline = {
        "active_month": "202602",
        "active_phase": "filter",
        "processing_month": "202601",
        "processing_archive": "202601.rar",
        "months": [
            {
                "month": "202601",
                "status": "red",
                "imported": False,
                "local_files": ["202601.rar"],
                "imported_files": [],
                "unimported_files": ["202601.rar"],
            },
            {
                "month": "202602",
                "status": "red",
                "imported": False,
                "local_files": ["202602.rar"],
                "imported_files": [],
                "unimported_files": ["202602.rar"],
            },
        ],
    }
    archives = {
        "items": [
            {
                "name": "202601.rar",
                "status": "running",
                "stages": {
                    "extract": {"status": "success"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "running"},
                    "postgres": {"status": "pending"},
                },
            },
            {
                "name": "202602.rar",
                "status": "pending",
                "stages": {
                    "extract": {"status": "success"},
                    "raw_parquet": {"status": "success"},
                    "filter": {"status": "pending"},
                    "postgres": {"status": "pending"},
                },
            },
        ]
    }

    processing_module._merge_import_timeline_stages(import_timeline, archives)
    months = {item["month"]: item for item in import_timeline["months"]}

    assert import_timeline["active_month"] == "202602"
    assert import_timeline["active_phase"] == "filter"
    assert months["202601"]["import_stages"]["filter"] == "processing"
    assert months["202602"]["import_stages"]["filter"] == "incomplete"


def test_select_import_focus_ignores_prefetched_backup_until_started() -> None:
    items = [
        {
            "name": "202601.rar",
            "status": "pending",
            "raw_reused_prefetched": True,
            "stages": {
                "extract": {"status": "skipped"},
                "raw_parquet": {"status": "success"},
                "filter": {"status": "pending"},
                "postgres": {"status": "pending"},
            },
        },
        {
            "name": "202512.rar",
            "status": "running",
            "current_stage": "extract",
            "stages": {
                "extract": {"status": "running"},
                "raw_parquet": {"status": "pending"},
                "filter": {"status": "pending"},
                "postgres": {"status": "pending"},
            },
        },
    ]

    focus, cursor, cursor_stages = processing_module._select_import_focus(
        items, current_archive="202512.rar"
    )

    assert focus is not None and focus["name"] == "202512.rar"
    assert cursor is not None and cursor["name"] == "202512.rar"
    assert cursor_stages == ["extract"]

    items[0]["status"] = "running"
    items[0]["stages"]["filter"] = {"status": "running"}
    focus, _, _ = processing_module._select_import_focus(
        items, current_archive="202601.rar"
    )
    assert focus is not None and focus["name"] == "202601.rar"


def test_build_active_import_reads_running_archive(tmp_path: Path) -> None:
    state_path = tmp_path / "processing_state.json"
    store = ProcessingStateStore(state_path)
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "raw_parquet", "filter", "postgres"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202601--demo.rar", size_bytes=10)
    store.update_archive(
        run_id,
        "202601--demo.rar",
        status="running",
        current_stage="filter",
    )
    store.update_archive_stage(
        run_id,
        "202601--demo.rar",
        "filter",
        status="running",
    )
    store.update_run(
        run_id,
        meta={
            "current_archive": "202601--demo.rar",
            "current_phase": "filter",
        },
    )

    active = processing_module.build_active_import(state_path=state_path)
    assert active["active_month"] == "202601"
    assert active["active_archive"] == "202601--demo.rar"
    assert active["active_phase"] == "filter"
    assert active["processing_month"] == "202601"
    assert active["processing_archive"] == "202601--demo.rar"
    assert active["run_id"] == run_id
    assert active["run_status"] == "running"
    assert active["state_mtime_ns"] == state_path.stat().st_mtime_ns

    store.finish_run(run_id, status="interrupted")
    active = processing_module.build_active_import(state_path=state_path)
    assert active["active_month"] == ""
    assert active["active_archive"] == ""


def test_build_processing_live_reports_messages_and_month_progress(
    tmp_path: Path,
) -> None:
    state_path = tmp_path / "processing_state.json"
    store = ProcessingStateStore(state_path)
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "raw_parquet", "filter", "postgres"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202601--demo.rar", size_bytes=10)
    store.mark_archives_raw_reused(
        run_id,
        [
            {
                "name": "202601--demo.rar",
                "raw_rows": 100,
                "extract_current": 10,
                "month_label": "2026-01",
            }
        ],
    )
    store.update_archive(
        run_id,
        "202601--demo.rar",
        status="running",
        current_stage="filter",
    )
    store.update_import_progress(
        run_id,
        message="目前篩選 2026-01（202601--demo.rar）。",
        meta={
            "current_archive": "202601--demo.rar",
            "current_phase": "filter",
        },
        stage_updates={
            "filter": {
                "status": "running",
                "current": 100,
                "total": 100,
                "message": "目前篩選 2026-01：已處理 100/100 筆候選。",
            },
            "postgres": {
                "status": "running",
                "current": 10,
                "message": "目前寫入 2026-01：已寫入 10 筆。",
            },
        },
        archive_name="202601--demo.rar",
        archive_fields={
            "status": "running",
            "current_stage": "filter",
            "scanned": 100,
            "matched": 10,
            "stored": 10,
        },
        archive_stage_updates={
            "filter": {
                "status": "running",
                "current": 100,
                "total": 100,
                "message": "2026-01：已處理 100/100 筆候選。",
            },
            "postgres": {
                "status": "running",
                "current": 10,
                "message": "2026-01：已寫入 10 筆。",
            },
        },
    )
    store.set_current_stage(run_id, "filter")

    live = processing_module.build_processing_live(state_path=state_path)

    assert live["live"] is True
    assert live["mode"] == "running"
    assert live["active_import"]["processing_month"] == "202601"
    workflow = next(
        item for item in live["workflows"] if item["id"] == "judgment_import"
    )
    stages = {item["key"]: item for item in workflow["progress"]["stages"]}
    assert "2026-01" in stages["filter"]["message"]
    assert "2026-01" in stages["postgres"]["message"]
    month = next(
        item
        for item in live["import_timeline_months"]
        if item["month"] == "202601"
    )
    assert month["import_stages"]["filter"] == "processing"
    assert month["import_stages"]["postgres"] == "processing"
    assert month["import_overall"] == "processing"


def test_build_processing_live_marks_preparation_phase_on_month(
    tmp_path: Path,
) -> None:
    state_path = tmp_path / "processing_state.json"
    store = ProcessingStateStore(state_path)
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "raw_parquet", "filter", "postgres"],
        pid=os.getpid(),
    )
    store.add_archive(run_id, "202601--demo.rar", size_bytes=10)
    store.mark_archives_raw_reused(
        run_id,
        [
            {
                "name": "202601--demo.rar",
                "raw_rows": 100,
                "extract_current": 10,
                "month_label": "2026-01",
            }
        ],
    )
    store.update_import_progress(
        run_id,
        message="DuckDB 候選統計 1/1：202601--demo.rar",
        meta={
            "current_archive": "202601--demo.rar",
            "current_phase": "filter",
        },
        stage_updates={
            "filter": {
                "status": "running",
                "message": "DuckDB 候選統計 1/1：2026-01。",
            }
        },
    )

    live = processing_module.build_processing_live(state_path=state_path)
    month = next(
        item
        for item in live["import_timeline_months"]
        if item["month"] == "202601"
    )

    assert month["import_stages"]["filter"] == "processing"
    assert month["import_overall"] == "processing"


def test_build_active_import_keeps_highest_started_month(
    tmp_path: Path,
) -> None:
    state_path = tmp_path / "processing_state.json"
    store = ProcessingStateStore(state_path)
    run_id = store.start_run(
        branch="judgment",
        kind="import",
        title="判決 RAR 匯入",
        stages=["extract", "raw_parquet", "filter", "postgres"],
        pid=os.getpid(),
    )
    for name in ("202601.rar", "202602.rar"):
        store.add_archive(run_id, name, size_bytes=10)
        store.update_archive(run_id, name, status="running")
        for key in ("extract", "raw_parquet"):
            store.update_archive_stage(
                run_id,
                name,
                key,
                status="success",
            )
        store.update_archive(run_id, name, status="pending", current_stage="")

    # The filter pass restarts at the older archive.  The outline must stay
    # on the highest month that has already started in this run.
    store.update_archive(
        run_id,
        "202601.rar",
        status="running",
        current_stage="filter",
    )
    store.update_archive_stage(
        run_id,
        "202601.rar",
        "filter",
        status="running",
    )
    store.update_run(
        run_id,
        meta={
            "current_archive": "202601.rar",
            "current_phase": "filter",
        },
    )

    active = processing_module.build_active_import(state_path=state_path)
    assert active["active_month"] == "202602"
    assert active["active_archive"] == "202602.rar"
    assert active["active_phase"] == "filter"
    assert active["processing_month"] == "202601"
    assert active["processing_archive"] == "202601.rar"
    assert active["run_id"] == run_id


def test_import_month_timeline_keeps_highest_started_month(
    tmp_path: Path,
) -> None:
    settings = _settings(tmp_path)
    local = {
        "items": [
            {"name": "202601.rar", "processed": False},
            {"name": "202602.rar", "processed": False},
        ],
        "processed_names": [],
    }
    stages = {
        "extract": {"status": "success"},
        "raw_parquet": {"status": "success"},
        "filter": {"status": "pending"},
        "postgres": {"status": "pending"},
    }
    archives = {
        "items": [
            {
                "name": "202601.rar",
                "status": "running",
                "current_stage": "filter",
                "started_at": "2026-01-01T00:00:00+00:00",
                "stages": {
                    **stages,
                    "filter": {"status": "running"},
                },
            },
            {
                "name": "202602.rar",
                "status": "pending",
                "current_stage": "",
                "started_at": "2026-01-02T00:00:00+00:00",
                "stages": stages,
            },
        ],
        "run": {
            "meta": {
                "current_archive": "202601.rar",
                "current_phase": "filter",
            }
        },
    }

    timeline = _import_month_timeline(settings, local, archives)
    months = {item["month"]: item for item in timeline["months"]}

    assert timeline["active_month"] == "202602"
    assert timeline["active_archive"] == "202602.rar"
    assert timeline["active_phase"] == "filter"
    assert timeline["processing_month"] == "202601"
    assert timeline["processing_archive"] == "202601.rar"
    assert months["202602"]["active"] is True
    assert months["202601"]["active"] is False


def test_processing_active_stream_sends_initial_event(
    processing_client: TestClient,
) -> None:
    with processing_client.stream(
        "GET", "/api/processing/active/stream"
    ) as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith(
            "text/event-stream"
        )
        for line in response.iter_lines():
            if line.startswith("data:"):
                payload = json.loads(line[5:].strip())
                assert "active_month" in payload
                assert "active_archive" in payload
                assert "active_phase" in payload
                assert "processing_month" in payload
                assert "processing_archive" in payload
                break


def test_events_stream_sends_initial_refresh_for_topics(
    processing_client: TestClient,
) -> None:
    with processing_client.stream(
        "GET", "/api/events/stream?topic=processing,updates"
    ) as response:
        assert response.status_code == 200
        assert response.headers["content-type"].startswith(
            "text/event-stream"
        )
        topics = []
        for line in response.iter_lines():
            if not line.startswith("data:"):
                continue
            payload = json.loads(line[5:].strip())
            topics.append(payload["topic"])
            if payload["topic"] == "processing":
                assert payload["snapshot"]["workflows"]
                assert "import_timeline" in payload["snapshot"]
            if len(topics) >= 2:
                break
        assert topics == ["processing", "updates"]


def test_events_stream_rejects_unknown_topic(
    processing_client: TestClient,
) -> None:
    response = processing_client.get(
        "/api/events/stream?topic=not-a-topic"
    )
    assert response.status_code == 400
    assert "topic" in response.json()["detail"]


def test_event_broker_pushes_when_signature_changes() -> None:
    changes = {"value": 1}
    broker = EventBroker(
        {
            "demo": TopicSpec(
                interval=0.01,
                min_interval=0.01,
                signature=lambda: changes["value"],
            )
        }
    )

    async def scenario() -> None:
        stream = broker.stream(["demo"])
        try:
            initial = await stream.__anext__()
            assert "event: refresh" in initial
            await asyncio.sleep(0.05)
            changes["value"] = 2
            for _ in range(100):
                message = await asyncio.wait_for(
                    stream.__anext__(), timeout=1.0
                )
                if message.startswith("event: refresh"):
                    return
            raise AssertionError("broker did not push the changed signature")
        finally:
            await stream.aclose()

    asyncio.run(scenario())
    asyncio.run(broker.close())


def test_event_signatures_change_when_database_rows_change(
    session_factory,
) -> None:
    before_updates = _database_updates_signature(session_factory)
    before_tests = _database_test_runs_signature(session_factory)

    with session_factory() as session:
        session.add(
            DownloadUpdateRecord(
                source_type="law",
                source_url="https://example.test/law.zip",
                status="up_to_date",
                update_available=False,
                checked_at=datetime.now(timezone.utc),
                message="已是最新版本。",
            )
        )
        session.add(
            PerformanceTestRun(
                run_id="signature-run",
                request_id="",
                question="簽章測試",
                status="running",
                progress=0,
                models={},
                summary={},
            )
        )
        session.add(
            PerformanceTestStep(
                run_id="signature-run",
                stage="embedding",
                model="bge-m3",
                status="running",
                progress=0,
            )
        )
        session.commit()

    assert _database_updates_signature(session_factory) != before_updates
    assert _database_test_runs_signature(session_factory) != before_tests


def test_processing_workflow_endpoint_starts_selected_workflow(
    processing_client: TestClient, monkeypatch
) -> None:
    manager = processing_client.app.state.processing_manager
    started = []

    def fake_start(workflow_id: str):
        started.append(workflow_id)
        return {
            "status": "started",
            "workflow": workflow_id,
            "run_id": "test-run",
            "pid": 123,
        }

    monkeypatch.setattr(manager, "start_workflow", fake_start)
    response = processing_client.post(
        "/api/processing/workflows/law_download/run"
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["workflow"] == "law_download"
    assert started == ["law_download"]
