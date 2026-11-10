from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

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


def test_run_download_prunes_old_same_month_version(
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
    assert (raw_dir / "202608--(20261115Update).rar").exists()
    manifest = judgment_download._load_manifest(manifest_path)
    assert "72011" not in manifest["files"]
    assert manifest["files"]["72020"]["size_bytes"] == 250
