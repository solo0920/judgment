from __future__ import annotations

import json
import os
from datetime import datetime, timezone
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
    JudgmentDocument,
    JudgmentIndexVersion,
    JudgmentVectorIndex,
    PerformanceRecord,
)
from judgment.processing_state import (
    ProcessingStateStore,
    state_file_status,
)
from judgment.web import processing as processing_module
from judgment.web.app import create_app
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
"""
    processes = _pipeline_processes_from_ps(output, now=now, exclude_pids=[101])
    assert [(item["pid"], item["kind"], item["branch"]) for item in processes] == [
        (102, "download", "law"),
        (103, "update", "system"),
        (105, "download", "order"),
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
    assert "full_update" in workflows
    assert "law_download" in workflows
    assert "judgment_import" in workflows
    assert "index_versions" in workflows
    assert workflows["index_versions"]["script"] == "scripts/index_full_task.sh"
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
