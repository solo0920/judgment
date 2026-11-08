from __future__ import annotations

import io
import json
import zipfile
from pathlib import Path

import httpx
import pytest

from judgment.law_download.client import LawApiClient, LawApiError

from .helpers import law, payload, source


def _zip_bytes(
    payload_dict: dict, filename: str = "ChLaw.json"
) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            filename, json.dumps(payload_dict, ensure_ascii=False).encode("utf-8")
        )
    return buffer.getvalue()


def test_client_downloads_and_parses_zip(tmp_path: Path) -> None:
    archive = _zip_bytes(payload([law("銀行法", "https://law.test/L0001")]))

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            content=archive,
            headers={"content-type": "application/octet-stream"},
        )

    client = LawApiClient(
        temp_dir=tmp_path,
        transport=httpx.MockTransport(handler),
    )

    fetched = client.fetch(source())

    assert fetched.http_status == 200
    assert fetched.payload["Laws"][0]["LawName"] == "銀行法"
    assert fetched.update_date == "2026/10/30 上午 12:00:00"
    assert fetched.temp_zip_path.exists()
    assert len(fetched.raw_json_sha256) == 64
    assert len(fetched.zip_sha256) == 64
    fetched.temp_zip_path.unlink()


def test_client_retries_transient_http_errors(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    archive = _zip_bytes(payload([law("銀行法", "https://law.test/L0001")]))
    calls = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        calls["count"] += 1
        if calls["count"] == 1:
            return httpx.Response(503)
        return httpx.Response(200, content=archive)

    monkeypatch.setattr(
        "judgment.law_download.client.time.sleep", lambda _seconds: None
    )
    client = LawApiClient(
        temp_dir=tmp_path,
        retries=2,
        transport=httpx.MockTransport(handler),
    )

    fetched = client.fetch(source())

    assert calls["count"] == 2
    assert fetched.payload["Laws"][0]["LawName"] == "銀行法"
    fetched.temp_zip_path.unlink()


def test_client_rejects_non_zip_response(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"not a zip file")

    client = LawApiClient(
        temp_dir=tmp_path,
        transport=httpx.MockTransport(handler),
    )

    with pytest.raises(LawApiError, match="not a valid ZIP"):
        client.fetch(source())


def test_client_rejects_archive_without_expected_json(tmp_path: Path) -> None:
    archive = _zip_bytes(
        payload([law("銀行法", "https://law.test/L0001")]), filename="Other.json"
    )

    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=archive)

    client = LawApiClient(
        temp_dir=tmp_path,
        transport=httpx.MockTransport(handler),
    )

    with pytest.raises(LawApiError, match="does not contain ChLaw.json"):
        client.fetch(source())
