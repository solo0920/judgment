from __future__ import annotations

import json
from dataclasses import replace
from datetime import datetime, timedelta
from pathlib import Path

import httpx
import pytest

from judgment import judgment_download
from judgment.config import Settings


def _settings(tmp_path: Path) -> Settings:
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path / "judgments",
        opendata_judicial_account="tester",
        opendata_judicial_password="secret",
    )


def _resources() -> list[dict]:
    return [
        {
            "datasetId": 1,
            "title": "202607裁判書--(20261016Update)",
            "filesets": [
                {
                    "fileSetId": 72010,
                    "resourceFormat": "RAR",
                    "resourceDescription": "202607--(20261016Update)",
                }
            ],
        },
        {
            "datasetId": 2,
            "title": "202608裁判書--(20261016Update)",
            "filesets": [
                {
                    "fileSetId": 72011,
                    "resourceFormat": "RAR",
                    "resourceDescription": "202608--(20261016Update)",
                }
            ],
        },
        {
            "datasetId": 3,
            "title": "Delete-Infor裁判書",
            "filesets": [
                {
                    "fileSetId": 72012,
                    "resourceFormat": "CSV",
                    "resourceDescription": "Delete-Infor",
                }
            ],
        },
        {
            "datasetId": 4,
            "title": "預算資料",
            "filesets": [
                {
                    "fileSetId": 72013,
                    "resourceFormat": "ZIP",
                    "resourceDescription": "115年度預算",
                }
            ],
        },
    ]


def _month_resources(months: list[tuple[int, str]]) -> list[dict]:
    return [
        {
            "datasetId": index + 1,
            "title": f"{key}裁判書--(20261016Update)",
            "filesets": [
                {
                    "fileSetId": fileset_id,
                    "resourceFormat": "RAR",
                    "resourceDescription": f"{key}--(20261016Update)",
                }
            ],
        }
        for index, (fileset_id, key) in enumerate(months)
    ]


def _month_metadata(months: list[tuple[int, str]], fileset_id: int):
    for index, (candidate_id, key) in enumerate(months):
        if candidate_id != fileset_id:
            continue
        return {
            "content_length": 100 + index * 50,
            "last_modified": f"Wed, 15 Oct 2026 08:08:{index:02d} GMT",
            "etag": f"etag-{candidate_id}",
            "filename": f"{key}--(20261016Update).rar",
        }
    return None


class FakeClient:
    instances: list["FakeClient"] = []

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.downloads: list[int] = []
        self.authenticated = False
        FakeClient.instances.append(self)

    def close(self) -> None:
        pass

    def authenticate(self) -> None:
        self.authenticated = True

    def resources(self, category: str) -> list[dict]:
        return _resources()

    def metadata(self, fileset_id: int):
        if fileset_id == 71644:
            return {
                "content_length": 100,
                "last_modified": "Wed, 15 Sep 2021 08:08:32 GMT",
                "etag": "a",
                "filename": "199601.rar",
            }
        if fileset_id == 72010:
            return {
                "content_length": 150,
                "last_modified": "Thu, 15 Oct 2026 23:54:52 GMT",
                "etag": "b",
                "filename": "202607--(20261016Update).rar",
            }
        if fileset_id == 72011:
            return {
                "content_length": 200,
                "last_modified": "Thu, 15 Oct 2026 23:54:53 GMT",
                "etag": "c",
                "filename": "202608--(20261016Update).rar",
            }
        if fileset_id == 72012:
            return {
                "content_length": 50,
                "last_modified": "Thu, 15 Oct 2026 23:54:54 GMT",
                "etag": "d",
                "filename": "Delete-Infor.csv",
            }
        return None

    def download(
        self,
        *,
        fileset_id: int,
        destination: Path,
        expected_size,
        progress=None,
    ):
        self.downloads.append(fileset_id)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(b"x" * int(expected_size))
        if progress is not None:
            progress(int(expected_size), int(expected_size))
        return int(expected_size), "f" * 64


@pytest.fixture()
def fake_client(monkeypatch):
    FakeClient.instances.clear()
    monkeypatch.setattr(judgment_download, "JudicialOpenDataClient", FakeClient)
    return FakeClient


def test_window_is_enforced() -> None:
    open_time = datetime(2026, 11, 11, 1, 30, tzinfo=judgment_download.TAIPEI_TZ)
    closed_time = datetime(2026, 11, 11, 7, 0, tzinfo=judgment_download.TAIPEI_TZ)
    assert judgment_download.window_is_open(open_time) is True
    assert judgment_download.window_is_open(closed_time) is False
    with pytest.raises(judgment_download.DownloadWindowClosed):
        judgment_download.ensure_window(closed_time)


def test_archive_entries_filter_non_judgment_resources() -> None:
    entries = judgment_download._archive_entries(_resources())
    assert [entry["fileset_id"] for entry in entries] == [72010, 72011]
    assert entries[0]["filename"] == "202607--(20261016Update).rar"
    assert entries[1]["format"] == "RAR"


def test_cli_exit_codes_distinguish_resumable_partial(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setattr(
        judgment_download.Settings,
        "from_env",
        classmethod(lambda cls: _settings(tmp_path)),
    )
    results = iter(
        [
            {"status": "success", "errors": 0},
            {"status": "partial", "errors": 0},
            {"status": "partial", "errors": 1},
        ]
    )
    monkeypatch.setattr(
        judgment_download, "run_download", lambda **kwargs: next(results)
    )
    assert judgment_download.main([]) == 0
    assert judgment_download.main([]) == judgment_download.EXIT_PARTIAL
    assert judgment_download.main([]) == 1


def test_run_download_skips_unchanged_and_probes_next(
    tmp_path: Path, fake_client
) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    for name, size in (
        ("202607--(20261016Update).rar", 150),
        ("202608--(20261016Update).rar", 200),
    ):
        (raw_dir / name).write_bytes(b"x" * size)

    result = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
    )
    assert result["status"] == "success"
    assert result["checked"] == 2
    assert result["skipped"] == 2
    assert result["downloaded"] == 0
    assert result["errors"] == 0
    assert result["remote_latest_id"] == 72011
    assert result["latest_local_id"] == 72011
    assert result["months"]["green"] == 2
    assert result["months"]["red"] == 366
    client = fake_client.instances[0]
    assert client.downloads == []
    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    assert set(manifest["files"]) == {"72010", "72011"}
    assert len(manifest["months"]) == 368
    status = judgment_download.download_status(settings)
    assert status["total_months"] == 368
    assert status["months"][0]["month"] == "1996-01"
    assert status["months"][-1]["month"] == "2026-08"
    assert status["progress"] is None
    assert not (raw_dir / judgment_download.PROGRESS_NAME).exists()



def test_download_status_reconciles_manual_files(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    (raw_dir / "202607--(20261016Update).rar").write_bytes(b"latest")
    (raw_dir / "202608--(20261016Update).rar").write_bytes(b"old")
    (raw_dir / "202609--(20261115Update).rar").write_bytes(b"newer")
    judgment_download._save_manifest(
        raw_dir / judgment_download.MANIFEST_NAME,
        {
            "version": 1,
            "months": [
                {
                    "month": "2026-07",
                    "year": 2026,
                    "month_no": 7,
                    "status": "red",
                    "latest_fileset_id": 72010,
                    "filename": "202607--(20261016Update).rar",
                },
                {
                    "month": "2026-08",
                    "year": 2026,
                    "month_no": 8,
                    "status": "red",
                    "latest_fileset_id": 72011,
                    "filename": "202608--(20261115Update).rar",
                },
                {
                    "month": "2026-09",
                    "year": 2026,
                    "month_no": 9,
                    "status": "red",
                    "latest_fileset_id": 72012,
                    "filename": "202609--(20261016Update).rar",
                },
            ],
        },
    )
    status = judgment_download.download_status(settings)
    by_month = {item["month"]: item for item in status["months"]}
    assert by_month["2026-07"]["status"] == "green"
    assert by_month["2026-08"]["status"] == "gray"
    assert by_month["2026-09"]["status"] == "green"
    assert by_month["2026-07"]["download_url"] == "/api/judgment-download/files/72010"
    assert status["summary"] == {"green": 2, "gray": 1, "red": 0}


def test_download_progress_is_exposed_and_cleared(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    entry = {
        "fileset_id": 71234,
        "filename": "202203--(20261015Update).rar",
        "resource_description": "202203--(20261015Update)",
    }
    progress = judgment_download.DownloadProgress(raw_dir, update_interval=0)
    progress.checking(entry, index=42, total=368)
    progress.downloading(entry, 2048, index=42, total=368)
    progress.bytes(1024, 2048)

    status = judgment_download.download_status(settings)
    payload = status["progress"]
    assert payload is not None
    assert payload["active"] is True
    assert payload["phase"] == "downloading"
    assert payload["month"] == "2022-03"
    assert payload["filename"] == entry["filename"]
    assert payload["candidate_index"] == 42
    assert payload["candidate_total"] == 368
    assert payload["bytes_written"] == 1024
    assert payload["total_bytes"] == 2048
    assert payload["percent"] == 50.0

    progress.close()
    assert judgment_download.download_status(settings)["progress"] is None


def test_download_status_ignores_dead_progress(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    progress_path = raw_dir / judgment_download.PROGRESS_NAME
    progress_path.write_text(
        json.dumps(
            {
                "pid": 99_999_999,
                "updated_at": judgment_download.now_taipei().isoformat(),
                "phase": "downloading",
                "month": "2022-03",
            }
        ),
        encoding="utf-8",
    )
    status = judgment_download.download_status(settings)
    assert status["progress"] is None
    assert not progress_path.exists()


def test_month_status_gray_green_red(tmp_path: Path) -> None:
    raw_dir = tmp_path / "raw_rar"
    raw_dir.mkdir()
    (raw_dir / "202608--(20261016Update).rar").write_bytes(b"old")
    entries = [
        {
            "fileset_id": 72010,
            "filename": "202608--(20261016Update).rar",
            "resource_description": "202608--(20261016Update)",
        },
        {
            "fileset_id": 72011,
            "filename": "202608--(20261115Update).rar",
            "resource_description": "202608--(20261115Update)",
        },
    ]
    months = judgment_download._build_month_status(
        entries,
        raw_dir,
        {},
        start_key="202607",
        end_key="202608",
    )
    by_month = {item["month"]: item for item in months}
    assert by_month["2026-07"]["status"] == "red"
    assert by_month["2026-08"]["status"] == "gray"
    (raw_dir / "202608--(20261115Update).rar").write_bytes(b"new")
    months = judgment_download._build_month_status(
        entries,
        raw_dir,
        {},
        start_key="202608",
        end_key="202608",
    )
    assert months[0]["status"] == "green"


def test_run_download_fills_missing_months(tmp_path: Path, fake_client) -> None:
    settings = _settings(tmp_path)
    result = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
    )
    assert result["downloaded"] == 2
    assert result["months"]["green"] == 2
    raw_dir = settings.judgment_data_dir / "raw_rar"
    assert (raw_dir / "202607--(20261016Update).rar").is_file()
    assert (raw_dir / "202608--(20261016Update).rar").is_file()
    status = judgment_download.download_status(settings)
    by_month = {item["month"]: item for item in status["months"]}
    assert by_month["1996-01"]["status"] == "red"
    assert by_month["2026-07"]["status"] == "green"
    assert by_month["2026-08"]["status"] == "green"


def test_run_download_allows_off_hours(tmp_path: Path, fake_client) -> None:
    settings = _settings(tmp_path)
    result = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 10, 0, tzinfo=judgment_download.TAIPEI_TZ),
        allow_off_hours=True,
    )
    assert result["status"] == "success"
    assert result["off_hours_enabled"] is True
    assert result["downloaded"] == 2
    status = judgment_download.download_status(settings)
    assert status["off_hours_enabled"] is True


def test_run_download_strict_mode_blocks_off_hours(
    tmp_path: Path,
) -> None:
    settings = replace(
        _settings(tmp_path), judgment_download_allow_off_hours=False
    )
    with pytest.raises(judgment_download.DownloadWindowClosed):
        judgment_download.run_download(
            settings=settings,
            now=datetime(
                2026, 11, 11, 10, 0, tzinfo=judgment_download.TAIPEI_TZ
            ),
        )


def test_run_download_replaces_changed_file(tmp_path: Path, fake_client) -> None:
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    (raw_dir / "202608--(20261016Update).rar").write_bytes(b"old")
    manifest_path = raw_dir / judgment_download.MANIFEST_NAME
    judgment_download._save_manifest(
        manifest_path,
        {
            "version": 1,
            "files": {
                "72011": {
                    "fileset_id": 72011,
                    "filename": "202608--(20261016Update).rar",
                    "size_bytes": 3,
                    "last_modified": "old",
                }
            },
        },
    )

    result = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
    )
    assert result["updated"] == 1
    assert result["downloaded"] == 2
    client = fake_client.instances[0]
    assert client.downloads == [72010, 72011]
    assert (raw_dir / "202608--(20261016Update).rar").stat().st_size == 200
    manifest = judgment_download._load_manifest(manifest_path)
    assert manifest["files"]["72011"]["size_bytes"] == 200


def test_backfill_resumes_only_pending_months(
    tmp_path: Path, monkeypatch
) -> None:
    months = [(72009, "202606"), (72010, "202607"), (72011, "202608")]
    clock_state = {
        "now": datetime(
            2026, 11, 11, 5, 45, tzinfo=judgment_download.TAIPEI_TZ
        )
    }

    class ClockClient(FakeClient):
        def resources(self, category: str) -> list[dict]:
            return _month_resources(months)

        def metadata(self, fileset_id: int):
            return _month_metadata(months, fileset_id)

        def download(
            self,
            *,
            fileset_id: int,
            destination: Path,
            expected_size,
            progress=None,
        ):
            result = super().download(
                fileset_id=fileset_id,
                destination=destination,
                expected_size=expected_size,
                progress=progress,
            )
            clock_state["now"] += timedelta(minutes=20)
            return result

    ClockClient.instances.clear()
    monkeypatch.setattr(
        judgment_download, "JudicialOpenDataClient", ClockClient
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"

    first = judgment_download.run_download(
        settings=settings,
        clock=lambda: clock_state["now"],
        allow_off_hours=False,
    )
    assert first["status"] == "partial"
    assert first["stop_reason"] == "window_closed"
    assert first["downloaded"] == 1
    assert first["pending_before"] == 3
    assert first["pending_after"] == 2
    assert ClockClient.instances[0].downloads == [72009]
    assert (raw_dir / "202606--(20261016Update).rar").is_file()
    assert not (raw_dir / "202607--(20261016Update).rar").exists()

    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    backfill = manifest["backfill"]
    assert backfill["pending_months"] == ["2026-07", "2026-08"]
    assert backfill["pending_count"] == 2
    assert backfill["resume_from_month"] == "2026-07"
    assert backfill["resume_from_fileset_id"] == 72010
    assert backfill["complete"] is False
    assert backfill["last_run"]["stop_reason"] == "window_closed"

    clock_state["now"] = datetime(
        2026, 11, 12, 1, 0, tzinfo=judgment_download.TAIPEI_TZ
    )
    second = judgment_download.run_download(
        settings=settings,
        clock=lambda: clock_state["now"],
        allow_off_hours=False,
    )
    assert second["status"] == "success"
    assert second["downloaded"] == 2
    assert second["pending_after"] == 0
    assert ClockClient.instances[1].downloads == [72010, 72011]

    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    backfill = manifest["backfill"]
    assert backfill["pending_months"] == []
    assert backfill["pending_count"] == 0
    assert backfill["resume_from_month"] == ""
    assert backfill["resume_from_fileset_id"] is None
    assert backfill["complete"] is True
    assert backfill["last_run"]["stop_reason"] == "completed"
    assert backfill["verification"]["status"] == "completed"
    assert backfill["verification"]["next_fileset_id"] is None
    assert backfill["verification"]["verified_count"] == 3

    status = judgment_download.download_status(settings)
    assert status["backfill"]["pending_count"] == 0
    assert status["backfill"]["complete"] is True


def test_failed_month_stays_pending_and_is_retried(
    tmp_path: Path, monkeypatch
) -> None:
    months = [(72009, "202606"), (72010, "202607"), (72011, "202608")]

    class FlakyClient(FakeClient):
        fail_ids: set[int] = set()

        def resources(self, category: str) -> list[dict]:
            return _month_resources(months)

        def metadata(self, fileset_id: int):
            return _month_metadata(months, fileset_id)

        def download(
            self,
            *,
            fileset_id: int,
            destination: Path,
            expected_size,
            progress=None,
        ):
            if fileset_id in FlakyClient.fail_ids:
                raise judgment_download.JudgmentDownloadError("boom")
            return super().download(
                fileset_id=fileset_id,
                destination=destination,
                expected_size=expected_size,
                progress=progress,
            )

    FlakyClient.instances.clear()
    monkeypatch.setattr(
        judgment_download, "JudicialOpenDataClient", FlakyClient
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    FlakyClient.fail_ids = {72010}

    first = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
        max_file_attempts=1,
    )
    assert first["status"] == "partial"
    assert first["errors"] == 1
    assert first["downloaded"] == 2
    assert first["pending_after"] == 1
    assert FlakyClient.instances[0].downloads == [72009, 72011]
    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    assert manifest["backfill"]["pending_months"] == ["2026-07"]
    failure = manifest["backfill"]["failures"]["2026-07"]
    assert failure["fileset_id"] == 72010
    assert failure["attempts"] == 1

    FlakyClient.fail_ids = set()
    second = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 12, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
        max_file_attempts=1,
    )
    assert second["status"] == "success"
    assert second["downloaded"] == 1
    assert FlakyClient.instances[1].downloads == [72010]
    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    assert manifest["backfill"]["failures"] == {}
    assert manifest["backfill"]["pending_count"] == 0


def test_verification_resumes_and_skips_same_day_completion(
    tmp_path: Path, monkeypatch
) -> None:
    months = [(72009, "202606"), (72010, "202607"), (72011, "202608")]
    clock_state = {
        "now": datetime(
            2026, 11, 11, 5, 50, tzinfo=judgment_download.TAIPEI_TZ
        )
    }

    class VerifyClient(FakeClient):
        advance_minutes = 0
        month_metadata_calls = 0

        def resources(self, category: str) -> list[dict]:
            return _month_resources(months)

        def metadata(self, fileset_id: int):
            payload = _month_metadata(months, fileset_id)
            if payload is not None:
                VerifyClient.month_metadata_calls += 1
                if VerifyClient.advance_minutes:
                    clock_state["now"] += timedelta(
                        minutes=VerifyClient.advance_minutes
                    )
            return payload

    VerifyClient.instances.clear()
    monkeypatch.setattr(
        judgment_download, "JudicialOpenDataClient", VerifyClient
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    for fileset_id, key in months:
        metadata = _month_metadata(months, fileset_id)
        filename = str(metadata["filename"])
        (raw_dir / filename).write_bytes(
            b"x" * int(metadata["content_length"])
        )

    VerifyClient.advance_minutes = 10
    first = judgment_download.run_download(
        settings=settings,
        clock=lambda: clock_state["now"],
        allow_off_hours=False,
    )
    assert first["status"] == "partial"
    assert first["stop_reason"] == "verification_window_closed"
    assert first["pending_after"] == 0
    assert first["verification_complete"] is False
    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    verification = manifest["backfill"]["verification"]
    assert verification["status"] == "in_progress"
    assert verification["next_fileset_id"] == 72010
    assert verification["next_month"] == "2026-07"
    assert verification["verified_count"] == 1

    VerifyClient.advance_minutes = 0
    clock_state["now"] = datetime(
        2026, 11, 12, 1, 0, tzinfo=judgment_download.TAIPEI_TZ
    )
    second = judgment_download.run_download(
        settings=settings,
        clock=lambda: clock_state["now"],
        allow_off_hours=False,
    )
    assert second["status"] == "success"
    assert second["downloaded"] == 0
    manifest = judgment_download._load_manifest(
        raw_dir / judgment_download.MANIFEST_NAME
    )
    verification = manifest["backfill"]["verification"]
    assert verification["status"] == "completed"
    assert verification["next_fileset_id"] is None
    assert verification["verified_count"] == 3

    VerifyClient.month_metadata_calls = 0
    clock_state["now"] = datetime(
        2026, 11, 12, 2, 0, tzinfo=judgment_download.TAIPEI_TZ
    )
    third = judgment_download.run_download(
        settings=settings,
        clock=lambda: clock_state["now"],
        allow_off_hours=False,
    )
    assert third["status"] == "success"
    assert third["stop_reason"] == "completed"
    assert VerifyClient.month_metadata_calls == 0


def test_deadline_stops_file_that_cannot_finish_before_0600() -> None:
    current = datetime(
        2026, 11, 11, 5, 50, tzinfo=judgment_download.TAIPEI_TZ
    )
    samples = [(10_000_000, 10.0)]  # 1 MB/s
    assert (
        judgment_download._deadline_reached(
            current,
            remaining_bytes=400_000_000,
            samples=samples,
            buffer_seconds=300,
        )
        is True
    )
    assert (
        judgment_download._deadline_reached(
            current,
            remaining_bytes=1_000_000,
            samples=samples,
            buffer_seconds=300,
        )
        is False
    )
    near_close = current.replace(minute=58)
    assert (
        judgment_download._deadline_reached(
            near_close,
            remaining_bytes=1,
            samples=[],
            buffer_seconds=300,
        )
        is True
    )


def _download_client(settings: Settings) -> judgment_download.JudicialOpenDataClient:
    client = judgment_download.JudicialOpenDataClient(settings)
    client.client.close()
    client.token = "token"
    return client


def test_download_resumes_part_with_range(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    destination = tmp_path / "202607--(20261016Update).rar"
    part = judgment_download._part_path(destination)
    part.write_bytes(b"aaaaa")
    judgment_download._write_part_meta(
        destination,
        {
            "fileset_id": 72010,
            "etag": '"v1"',
            "last_modified": "",
            "content_length": 10,
        },
    )
    requests: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(
            206,
            headers={
                "Content-Range": "bytes 5-9/10",
                "Content-Length": "5",
                "ETag": '"v1"',
            },
            content=b"bbbbb",
        )

    client = _download_client(settings)
    client.client = httpx.Client(transport=httpx.MockTransport(handler))
    try:
        written, _ = client.download(
            fileset_id=72010, destination=destination, expected_size=10
        )
    finally:
        client.close()
    assert written == 10
    assert destination.read_bytes() == b"aaaaabbbbb"
    assert not part.exists()
    assert not judgment_download._part_meta_path(destination).exists()
    assert requests[0].headers["range"] == "bytes=5-"
    assert requests[0].headers["if-range"] == '"v1"'


def test_part_resume_offset_discards_changed_validator(tmp_path: Path) -> None:
    destination = tmp_path / "202607--(20261016Update).rar"
    part = judgment_download._part_path(destination)
    part.write_bytes(b"aaaaa")
    judgment_download._write_part_meta(
        destination,
        {
            "fileset_id": 72010,
            "etag": '"v1"',
            "last_modified": "",
            "content_length": 10,
        },
    )
    assert (
        judgment_download._part_resume_offset(
            destination,
            72010,
            {"etag": '"v2"', "last_modified": "", "content_length": 10},
        )
        == 0
    )
    assert not part.exists()
    assert not judgment_download._part_meta_path(destination).exists()


def test_download_restarts_when_server_returns_200(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    destination = tmp_path / "202607--(20261016Update).rar"
    part = judgment_download._part_path(destination)
    part.write_bytes(b"aaaaa")
    judgment_download._write_part_meta(
        destination,
        {
            "fileset_id": 72010,
            "etag": '"old"',
            "last_modified": "",
            "content_length": 10,
        },
    )

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            headers={"Content-Length": "10", "ETag": '"new"'},
            content=b"0123456789",
        )

    client = _download_client(settings)
    client.client = httpx.Client(transport=httpx.MockTransport(handler))
    try:
        written, _ = client.download(
            fileset_id=72010, destination=destination, expected_size=10
        )
    finally:
        client.close()
    assert written == 10
    assert destination.read_bytes() == b"0123456789"
    assert not part.exists()


def test_download_preserves_part_on_interruption(tmp_path: Path) -> None:
    settings = _settings(tmp_path)
    destination = tmp_path / "202607--(20261016Update).rar"
    part = judgment_download._part_path(destination)
    mode = {"resume": False}

    class BrokenStream(httpx.SyncByteStream):
        def __iter__(self):
            yield b"abc"
            raise httpx.ReadError("boom")

    def handler(request: httpx.Request) -> httpx.Response:
        if not mode["resume"]:
            return httpx.Response(
                200,
                headers={"Content-Length": "10", "ETag": '"v1"'},
                stream=BrokenStream(),
            )
        assert request.headers["range"] == "bytes=3-"
        assert request.headers["if-range"] == '"v1"'
        return httpx.Response(
            206,
            headers={
                "Content-Range": "bytes 3-9/10",
                "Content-Length": "7",
                "ETag": '"v1"',
            },
            content=b"defghij",
        )

    client = _download_client(settings)
    client.client = httpx.Client(transport=httpx.MockTransport(handler))
    try:
        with pytest.raises(httpx.ReadError):
            client.download(
                fileset_id=72010, destination=destination, expected_size=10
            )
        assert part.read_bytes() == b"abc"
        assert judgment_download._part_meta_path(destination).is_file()
        mode["resume"] = True
        written, _ = client.download(
            fileset_id=72010, destination=destination, expected_size=10
        )
    finally:
        client.close()
    assert written == 10
    assert destination.read_bytes() == b"abcdefghij"
    assert not part.exists()


def test_run_download_archives_old_same_month_version(
    tmp_path: Path, monkeypatch
) -> None:
    class VersionedClient(FakeClient):
        def resources(self, category: str) -> list[dict]:
            return [
                {
                    "datasetId": 2,
                    "title": "202608裁判書--(20261016Update)",
                    "filesets": [
                        {
                            "fileSetId": 72011,
                            "resourceFormat": "RAR",
                            "resourceDescription": "202608--(20261016Update)",
                        }
                    ],
                },
                {
                    "datasetId": 5,
                    "title": "202608裁判書--(20261115Update)",
                    "filesets": [
                        {
                            "fileSetId": 72020,
                            "resourceFormat": "RAR",
                            "resourceDescription": "202608--(20261115Update)",
                        }
                    ],
                },
            ]

        def metadata(self, fileset_id: int):
            if fileset_id == 72020:
                return {
                    "content_length": 250,
                    "last_modified": "Sat, 15 Nov 2026 00:00:00 GMT",
                    "etag": "e",
                    "filename": "202608--(20261115Update).rar",
                }
            return super().metadata(fileset_id)

        def download(
            self,
            *,
            fileset_id: int,
            destination: Path,
            expected_size,
            progress=None,
        ):
            self.downloads.append(fileset_id)
            destination.write_bytes(b"y" * int(expected_size))
            return int(expected_size), "a" * 64

    FakeClient.instances.clear()
    monkeypatch.setattr(
        judgment_download, "JudicialOpenDataClient", VersionedClient
    )
    settings = _settings(tmp_path)
    raw_dir = settings.judgment_data_dir / "raw_rar"
    raw_dir.mkdir(parents=True)
    old_path = raw_dir / "202608--(20261016Update).rar"
    old_path.write_bytes(b"x" * 200)
    manifest_path = raw_dir / judgment_download.MANIFEST_NAME
    judgment_download._save_manifest(
        manifest_path,
        {
            "version": 1,
            "files": {
                "72011": {
                    "fileset_id": 72011,
                    "filename": old_path.name,
                    "resource_description": "202608--(20261016Update)",
                    "size_bytes": 200,
                }
            },
        },
    )

    result = judgment_download.run_download(
        settings=settings,
        now=datetime(2026, 11, 11, 1, 0, tzinfo=judgment_download.TAIPEI_TZ),
    )
    assert result["downloaded"] == 1
    assert not old_path.exists()
    history_path = raw_dir / "history" / old_path.name
    assert history_path.is_file()
    assert history_path.read_bytes() == b"x" * 200
    assert (raw_dir / "202608--(20261115Update).rar").exists()
    manifest = judgment_download._load_manifest(manifest_path)
    assert "72011" not in manifest["files"]
    assert manifest["files"]["72020"]["size_bytes"] == 250
    assert (
        manifest["history_files"]["72011"]["archived_path"]
        == f"history/{old_path.name}"
    )
