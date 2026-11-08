from __future__ import annotations

import hashlib
import json
import logging
import time
import uuid
import zipfile
from pathlib import Path
from typing import Any, Callable, Dict, Optional

import httpx

from .types import FetchedArchive, SourceSpec

logger = logging.getLogger(__name__)

ProgressCallback = Callable[[int, Optional[int]], None]


class LawApiError(RuntimeError):
    """Raised when the remote law/order archive cannot be fetched or parsed."""


class _RetryableError(RuntimeError):
    pass


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


class LawApiClient:
    def __init__(
        self,
        *,
        temp_dir: Path,
        timeout_seconds: float = 300.0,
        retries: int = 3,
        user_agent: str = "judgment-law-downloader/0.1",
        max_uncompressed_bytes: int = 512 * 1024 * 1024,
        transport: Optional[httpx.BaseTransport] = None,
    ) -> None:
        self.temp_dir = temp_dir
        self.timeout_seconds = timeout_seconds
        self.retries = max(1, retries)
        self.user_agent = user_agent
        self.max_uncompressed_bytes = max_uncompressed_bytes
        self.transport = transport

    def fetch(
        self,
        source: SourceSpec,
        progress: Optional[ProgressCallback] = None,
    ) -> FetchedArchive:
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        temp_path = self.temp_dir / f"{source.source_type.value}-{uuid.uuid4().hex}.zip.part"
        try:
            status_code = self._download_with_retries(source.url, temp_path, progress)
            raw_json, update_date, payload = self._read_archive(temp_path, source)
            json_sha256 = hashlib.sha256(raw_json).hexdigest()
            zip_sha256 = sha256_file(temp_path)
            return FetchedArchive(
                source=source,
                temp_zip_path=temp_path,
                zip_sha256=zip_sha256,
                raw_json_sha256=json_sha256,
                payload=payload,
                update_date=update_date,
                http_status=status_code,
            )
        except Exception:
            if temp_path.exists():
                temp_path.unlink()
            raise

    def _download_with_retries(
        self,
        url: str,
        destination: Path,
        progress: Optional[ProgressCallback] = None,
    ) -> int:
        last_error: Optional[Exception] = None
        with httpx.Client(
            timeout=httpx.Timeout(self.timeout_seconds),
            follow_redirects=True,
            headers={"User-Agent": self.user_agent},
            transport=self.transport,
        ) as client:
            for attempt in range(1, self.retries + 1):
                try:
                    return self._download_once(client, url, destination, progress)
                except _RetryableError as exc:
                    last_error = exc
                    if destination.exists():
                        destination.unlink()
                    if attempt >= self.retries:
                        break
                    delay = min(2 ** (attempt - 1), 10)
                    logger.warning(
                        "download attempt %s/%s failed for %s: %s; retrying in %ss",
                        attempt,
                        self.retries,
                        url,
                        exc,
                        delay,
                    )
                    time.sleep(delay)
                except httpx.RequestError as exc:
                    last_error = exc
                    if destination.exists():
                        destination.unlink()
                    if attempt >= self.retries:
                        break
                    delay = min(2 ** (attempt - 1), 10)
                    logger.warning(
                        "network error on attempt %s/%s for %s: %s; retrying in %ss",
                        attempt,
                        self.retries,
                        url,
                        exc,
                        delay,
                    )
                    time.sleep(delay)
                except httpx.HTTPStatusError as exc:
                    raise LawApiError(
                        f"HTTP {exc.response.status_code} while downloading {url}"
                    ) from exc

        raise LawApiError(f"failed to download {url}: {last_error}") from last_error

    def _download_once(
        self,
        client: httpx.Client,
        url: str,
        destination: Path,
        progress: Optional[ProgressCallback] = None,
    ) -> int:
        with client.stream("GET", url) as response:
            if response.status_code == 429 or 500 <= response.status_code < 600:
                raise _RetryableError(f"temporary HTTP {response.status_code}")
            response.raise_for_status()
            total: Optional[int] = None
            header = response.headers.get("Content-Length")
            if header:
                try:
                    total = int(header)
                except ValueError:
                    total = None
            downloaded = 0
            if progress is not None:
                progress(0, total)
            with destination.open("wb") as handle:
                for chunk in response.iter_bytes():
                    if chunk:
                        handle.write(chunk)
                        downloaded += len(chunk)
                        if progress is not None:
                            progress(downloaded, total)
            return response.status_code

    def _read_archive(
        self, archive_path: Path, source: SourceSpec
    ) -> tuple[bytes, str, Dict[str, Any]]:
        try:
            with zipfile.ZipFile(archive_path) as archive:
                try:
                    info = archive.getinfo(source.json_filename)
                except KeyError as exc:
                    raise LawApiError(
                        f"{source.label} archive does not contain "
                        f"{source.json_filename}; entries={archive.namelist()[:10]}"
                    ) from exc
                if info.file_size > self.max_uncompressed_bytes:
                    raise LawApiError(
                        f"{source.json_filename} is too large: {info.file_size} bytes"
                    )
                raw_json = archive.read(info)
        except zipfile.BadZipFile as exc:
            raise LawApiError(
                f"{source.label} response is not a valid ZIP archive"
            ) from exc

        if len(raw_json) > self.max_uncompressed_bytes:
            raise LawApiError(
                f"{source.json_filename} exceeds the configured size limit"
            )

        try:
            text = raw_json.decode("utf-8-sig")
        except UnicodeDecodeError as exc:
            raise LawApiError(f"{source.json_filename} is not valid UTF-8") from exc

        try:
            payload = json.loads(text)
        except json.JSONDecodeError as exc:
            raise LawApiError(
                f"{source.json_filename} is not valid JSON: {exc}"
            ) from exc

        if not isinstance(payload, dict) or not isinstance(payload.get("Laws"), list):
            raise LawApiError(
                f"{source.json_filename} does not contain a Laws array"
            )

        update_date = str(payload.get("UpdateDate") or "")
        return raw_json, update_date, payload
