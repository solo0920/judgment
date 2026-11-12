from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, time as dt_time, timedelta, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
from urllib.parse import quote, unquote

import httpx

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .update_records import record_update

TAIPEI_TZ = timezone(timedelta(hours=8))
TOKEN_URL = "https://opendata.judicial.gov.tw/api/MemberTokens"
CATEGORY_URL = "https://opendata.judicial.gov.tw/data/api/rest/categories"
FILESET_URL = "https://opendata.judicial.gov.tw/api/FilesetLists/{fileset_id}/file"
WINDOW_START = dt_time(0, 0)
WINDOW_END = dt_time(6, 0)
ARCHIVE_FORMATS = {"RAR": "rar", "7Z": "7z", "ZIP": "zip"}
MANIFEST_NAME = "download_manifest.json"
PROGRESS_NAME = "download_progress.json"
PROGRESS_WRITE_INTERVAL_SECONDS = 0.5
PROGRESS_MAX_AGE_SECONDS = 12 * 60 * 60
CHUNK_SIZE = 1024 * 1024
DOWNLOAD_MAX_ATTEMPTS = 2
DEADLINE_BUFFER_SECONDS = 5 * 60
THROUGHPUT_SAMPLE_LIMIT = 5
BACKFILL_VERSION = 1
EXIT_PARTIAL = 3


class JudgmentDownloadError(RuntimeError):
    pass


class DownloadWindowClosed(JudgmentDownloadError):
    pass


class AuthenticationError(JudgmentDownloadError):
    pass


def _log(message: str) -> None:
    print(message, flush=True)


def now_taipei() -> datetime:
    return datetime.now(TAIPEI_TZ)


def window_is_open(now: Optional[datetime] = None) -> bool:
    current = (now or now_taipei()).astimezone(TAIPEI_TZ)
    return WINDOW_START <= current.time() < WINDOW_END


def ensure_window(now: Optional[datetime] = None) -> None:
    current = (now or now_taipei()).astimezone(TAIPEI_TZ)
    if window_is_open(current):
        return
    raise DownloadWindowClosed(
        "判決下載目前設定為僅於每日 00:00–06:00（Asia/Taipei）執行；"
        f"目前時間為 {current:%Y-%m-%d %H:%M}。"
        "如需非時段下載，請設定 JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true。"
    )


def _headers(token: str) -> Dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _content_length(headers: httpx.Headers) -> Optional[int]:
    value = headers.get("content-length")
    try:
        return int(value) if value is not None else None
    except (TypeError, ValueError):
        return None


def _filename_from_headers(headers: httpx.Headers) -> str:
    disposition = str(headers.get("content-disposition") or "")
    match = re.search(
        r"filename\*\s*=\s*(?:UTF-8'')?([^;]+)|filename\s*=\s*\"?([^\";]+)\"?",
        disposition,
        re.IGNORECASE,
    )
    if not match:
        return ""
    return unquote((match.group(1) or match.group(2) or "").strip())


def _part_path(destination: Path) -> Path:
    return destination.with_suffix(destination.suffix + ".part")


def _part_meta_path(destination: Path) -> Path:
    return Path(str(_part_path(destination)) + ".json")


def _read_part_meta(destination: Path) -> Dict[str, Any]:
    path = _part_meta_path(destination)
    if not path.is_file():
        return {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return payload if isinstance(payload, dict) else {}


def _write_part_meta(destination: Path, payload: Dict[str, Any]) -> None:
    path = _part_meta_path(destination)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        temp = path.with_suffix(path.suffix + ".tmp")
        temp.write_text(
            json.dumps(payload, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        os.replace(temp, path)
    except OSError:
        # Resume metadata is optional; a missing sidecar only costs a restart.
        pass


def _remove_part(destination: Path) -> None:
    for path in (_part_path(destination), _part_meta_path(destination)):
        try:
            path.unlink()
        except OSError:
            pass


def _part_resume_offset(
    destination: Path,
    fileset_id: int,
    remote: Optional[Dict[str, Any]],
) -> int:
    """Return a safe byte offset for resuming a saved ``.part`` file.

    A partial file is only reusable when its sidecar records the same fileset
    and the remote validators have not changed.  Any mismatch discards the
    partial data so a new download starts from byte zero.
    """

    part = _part_path(destination)
    meta = _read_part_meta(destination)
    if not part.is_file() or not meta:
        _remove_part(destination)
        return 0
    try:
        fileset_matches = int(meta.get("fileset_id") or 0) == fileset_id
        offset = int(part.stat().st_size)
    except (OSError, TypeError, ValueError):
        _remove_part(destination)
        return 0
    if not fileset_matches or offset <= 0:
        _remove_part(destination)
        return 0
    remote = remote or {}
    expected_size = remote.get("content_length")
    if expected_size is not None:
        try:
            if offset > int(expected_size):
                _remove_part(destination)
                return 0
        except (TypeError, ValueError):
            pass
    for key in ("etag", "last_modified"):
        local_value = str(meta.get(key) or "")
        remote_value = str(remote.get(key) or "")
        if local_value and remote_value and local_value != remote_value:
            _remove_part(destination)
            return 0
    return offset


def _sidecar_validator(meta: Dict[str, Any]) -> str:
    return str(meta.get("etag") or meta.get("last_modified") or "")


def _content_range_values(value: str) -> Tuple[Optional[int], Optional[int]]:
    match = re.match(r"bytes\s+(\d+)-(\d+)/(\d+|\*)", str(value or ""), re.I)
    if not match:
        return None, None
    start = int(match.group(1))
    total = None if match.group(3) == "*" else int(match.group(3))
    return start, total


def _sha256_file(path: Path) -> Any:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(CHUNK_SIZE), b""):
            digest.update(chunk)
    return digest


def _window_deadline(current: datetime) -> datetime:
    return current.replace(
        hour=WINDOW_END.hour,
        minute=WINDOW_END.minute,
        second=0,
        microsecond=0,
    )


class JudicialOpenDataClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = httpx.Client(
            timeout=httpx.Timeout(
                float(settings.http_timeout_seconds or 300), connect=20.0
            ),
            follow_redirects=True,
            headers={"User-Agent": settings.user_agent},
        )
        self.token = ""

    def close(self) -> None:
        self.client.close()

    def authenticate(self) -> None:
        account = str(self.settings.opendata_judicial_account or "").strip()
        password = str(self.settings.opendata_judicial_password or "")
        if not account or not password:
            raise AuthenticationError(
                "未設定 OPENDATA_JUDICIAL_GOV_TW_ACCOUNT／"
                "OPENDATA_JUDICIAL_GOV_TW_PASSWORD。"
            )
        response = self.client.post(
            TOKEN_URL,
            json={"memberAccount": account, "pwd": password},
            headers={"Content-Type": "application/json"},
        )
        if response.status_code != 200:
            raise AuthenticationError(
                f"司法院開放資料驗證失敗（HTTP {response.status_code}）。"
            )
        try:
            payload = response.json()
        except Exception as exc:
            raise AuthenticationError("司法院驗證回應不是 JSON。") from exc
        token = str(payload.get("token") or "").strip()
        if not token:
            message = str(payload.get("message") or "驗證失敗").strip()
            raise AuthenticationError(f"司法院開放資料驗證失敗：{message}")
        self.token = token
        _log(
            "已取得司法院開放資料 Token"
            + (
                f"，到期時間 {payload.get('expires')}"
                if payload.get("expires")
                else ""
            )
            + "。"
        )

    def _request_json(self, url: str, *, retry_auth: bool = True) -> Any:
        if not self.token:
            self.authenticate()
        response = self.client.get(url, headers=_headers(self.token))
        if response.status_code in {401, 403} and retry_auth:
            self.authenticate()
            response = self.client.get(url, headers=_headers(self.token))
        if response.status_code != 200:
            raise JudgmentDownloadError(
                f"API 請求失敗（HTTP {response.status_code}）：{url}"
            )
        return response.json()

    def resources(self, category: str) -> List[Dict[str, Any]]:
        payload = self._request_json(f"{CATEGORY_URL}/{category}/resources")
        return payload if isinstance(payload, list) else []

    def metadata(
        self, fileset_id: int, *, retry_auth: bool = True
    ) -> Optional[Dict[str, Any]]:
        if not self.token:
            self.authenticate()
        url = FILESET_URL.format(fileset_id=fileset_id)
        response = self.client.head(
            url,
            headers=_headers(self.token),
            timeout=httpx.Timeout(30.0, connect=10.0),
        )
        if response.status_code in {401, 403}:
            if not retry_auth:
                raise AuthenticationError("司法院 Token 驗證失敗。")
            self.authenticate()
            return self.metadata(fileset_id, retry_auth=False)
        if response.status_code == 200:
            return self._metadata_dict(response.headers)
        if response.status_code == 404:
            return None
        if response.status_code not in {405, 501}:
            raise JudgmentDownloadError(
                f"fileset {fileset_id} metadata 檢查失敗（HTTP {response.status_code}）。"
            )
        # The official endpoint returns 405 for HEAD. Open a GET stream and
        # close it immediately after reading the headers; the body is not read.
        timeout = httpx.Timeout(30.0, connect=10.0)
        with self.client.stream(
            "GET",
            url,
            headers=_headers(self.token),
            timeout=timeout,
        ) as stream:
            status = stream.status_code
            headers = stream.headers
        if status in {401, 403}:
            if not retry_auth:
                raise AuthenticationError("司法院 Token 驗證失敗。")
            self.authenticate()
            return self.metadata(fileset_id, retry_auth=False)
        if status == 404:
            return None
        if status != 200:
            raise JudgmentDownloadError(
                f"fileset {fileset_id} metadata 檢查失敗（HTTP {status}）。"
            )
        return self._metadata_dict(headers)

    def _metadata_dict(self, headers: httpx.Headers) -> Dict[str, Any]:
        return {
            "content_length": _content_length(headers),
            "last_modified": headers.get("last-modified") or "",
            "etag": headers.get("etag") or "",
            "content_type": headers.get("content-type") or "",
            "content_disposition": headers.get("content-disposition") or "",
            "filename": _filename_from_headers(headers),
        }

    def download(
        self,
        *,
        fileset_id: int,
        destination: Path,
        expected_size: Optional[int],
        progress: Optional[Callable[[int, Optional[int]], None]] = None,
    ) -> Tuple[int, str]:
        """Download a fileset, resuming a matching ``.part`` file when possible.

        Interrupted partial files are deliberately preserved.  A small JSON
        sidecar records the fileset ID and response validators.  On the next
        attempt the client sends ``Range`` plus ``If-Range`` so the server can
        return ``206`` when the file is unchanged or ``200`` when it must be
        downloaded again from zero.
        """

        if expected_size is not None:
            expected_size = int(expected_size)
        url = FILESET_URL.format(fileset_id=fileset_id)
        temp_path = _part_path(destination)
        temp_path.parent.mkdir(parents=True, exist_ok=True)
        resume_offset = _part_resume_offset(destination, fileset_id, None)
        meta = _read_part_meta(destination)
        if (
            expected_size is not None
            and resume_offset > 0
            and resume_offset == int(expected_size)
        ):
            digest = _sha256_file(temp_path)
            os.replace(temp_path, destination)
            _remove_part(destination)
            if progress is not None:
                try:
                    progress(resume_offset, expected_size)
                except Exception:
                    pass
            return resume_offset, digest.hexdigest()

        request_headers = dict(_headers(self.token))
        if resume_offset > 0:
            request_headers["Range"] = f"bytes={resume_offset}-"
            validator = _sidecar_validator(meta)
            if validator:
                request_headers["If-Range"] = validator

        with self.client.stream(
            "GET", url, headers=request_headers
        ) as response:
            if response.status_code in {401, 403}:
                self.authenticate()
                raise AuthenticationError("Token 已過期，請重試。")
            if response.status_code == 416 and resume_offset > 0:
                _remove_part(destination)
                raise JudgmentDownloadError(
                    f"fileset {fileset_id} 無法續傳（HTTP 416），"
                    "已清除部分檔案，下次重新下載。"
                )
            if response.status_code not in {200, 206}:
                raise JudgmentDownloadError(
                    f"下載 fileset {fileset_id} 失敗"
                    f"（HTTP {response.status_code}）。"
                )
            if response.status_code == 200:
                # If-Range failed or the server ignored Range: restart.
                resume_offset = 0
                total_bytes = expected_size or _content_length(response.headers)
                mode = "wb"
            else:
                start, range_total = _content_range_values(
                    response.headers.get("content-range") or ""
                )
                if start is not None and start != resume_offset:
                    _remove_part(destination)
                    raise JudgmentDownloadError(
                        f"fileset {fileset_id} 續傳範圍不符："
                        f"預期從 {resume_offset} 開始，伺服器回傳 {start}。"
                    )
                total_bytes = expected_size or range_total
                if total_bytes is None:
                    response_length = _content_length(response.headers)
                    if response_length is not None:
                        total_bytes = resume_offset + response_length
                mode = "ab" if resume_offset > 0 else "wb"
            written = resume_offset
            digest = (
                _sha256_file(temp_path)
                if resume_offset > 0
                else hashlib.sha256()
            )
            _write_part_meta(
                destination,
                {
                    "fileset_id": fileset_id,
                    "etag": response.headers.get("etag")
                    or str(meta.get("etag") or ""),
                    "last_modified": response.headers.get("last-modified")
                    or str(meta.get("last_modified") or ""),
                    "content_length": total_bytes,
                    "updated_at": now_taipei().isoformat(),
                },
            )
            if progress is not None:
                try:
                    progress(written, total_bytes)
                except Exception:
                    progress = None
            with temp_path.open(mode) as handle:
                for chunk in response.iter_bytes():
                    if not chunk:
                        continue
                    handle.write(chunk)
                    digest.update(chunk)
                    written += len(chunk)
                    if progress is not None:
                        try:
                            progress(written, total_bytes)
                        except Exception:
                            progress = None
        if expected_size is not None and written != expected_size:
            raise JudgmentDownloadError(
                f"fileset {fileset_id} 下載長度不符："
                f"預期 {expected_size}，實際 {written}。"
            )
        os.replace(temp_path, destination)
        _remove_part(destination)
        return written, digest.hexdigest()


def _archive_entries(resources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    entries: List[Dict[str, Any]] = []
    for dataset in resources:
        title = str(dataset.get("title") or "")
        if "裁判書" not in title:
            continue
        if "Delete" in title or "刪除" in title:
            continue
        for fileset in dataset.get("filesets") or []:
            fileset_id = int(fileset.get("fileSetId") or 0)
            resource_format = str(fileset.get("resourceFormat") or "").upper()
            extension = ARCHIVE_FORMATS.get(resource_format)
            description = str(fileset.get("resourceDescription") or "").strip()
            if not fileset_id or not extension:
                continue
            if not re.match(r"^\d{6}", description):
                continue
            filename = _safe_filename(description) + "." + extension
            entries.append(
                {
                    "fileset_id": fileset_id,
                    "dataset_id": int(dataset.get("datasetId") or 0),
                    "title": title,
                    "resource_description": description,
                    "format": resource_format,
                    "extension": extension,
                    "filename": filename,
                }
            )
    entries.sort(key=lambda item: item["fileset_id"])
    deduped: List[Dict[str, Any]] = []
    seen = set()
    for entry in entries:
        if entry["fileset_id"] in seen:
            continue
        seen.add(entry["fileset_id"])
        deduped.append(entry)
    return deduped


def _safe_filename(value: str) -> str:
    text = re.sub(r"[\x00-\x1f/\\:*?\"<>|]+", "_", str(value or "").strip())
    return text[:180] or "judgment_archive"


def _latest_per_month(entries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    by_month: Dict[str, Dict[str, Any]] = {}
    for entry in entries:
        month = _month_key(entry.get("resource_description") or "")
        if not month:
            continue
        current = by_month.get(month)
        if current is None or int(entry["fileset_id"]) > int(current["fileset_id"]):
            by_month[month] = entry
    return sorted(by_month.values(), key=lambda item: int(item["fileset_id"]))


def _month_sequence(start_key: str, end_key: str) -> List[str]:
    try:
        start_year, start_month = int(start_key[:4]), int(start_key[4:6])
        end_year, end_month = int(end_key[:4]), int(end_key[4:6])
    except (TypeError, ValueError):
        return []
    if start_year > end_year or (
        start_year == end_year and start_month > end_month
    ):
        return []
    keys: List[str] = []
    year, month = start_year, start_month
    while (year, month) <= (end_year, end_month):
        keys.append(f"{year:04d}{month:02d}")
        month += 1
        if month > 12:
            year += 1
            month = 1
    return keys


def _build_month_status(
    entries: List[Dict[str, Any]],
    raw_dir: Path,
    files_map: Dict[str, Any],
    *,
    start_key: str,
    end_key: str,
) -> List[Dict[str, Any]]:
    latest_remote = {
        _month_key(entry["resource_description"]): entry
        for entry in _latest_per_month(entries)
    }
    local_by_month: Dict[str, Dict[str, Any]] = {}
    for entry in entries:
        month = _month_key(entry["resource_description"])
        if not month:
            continue
        local_path = raw_dir / entry["filename"]
        if not local_path.is_file():
            continue
        current = local_by_month.get(month)
        if current is None or int(entry["fileset_id"]) > int(current["fileset_id"]):
            local_by_month[month] = entry
    for key, info in (files_map or {}).items():
        try:
            fileset_id = int(info.get("fileset_id") or key)
        except (TypeError, ValueError):
            continue
        month = _month_key(
            str(info.get("resource_description") or info.get("filename") or "")
        )
        filename = str(info.get("filename") or "")
        if not month or not filename or not (raw_dir / filename).is_file():
            continue
        current = local_by_month.get(month)
        if current is None or fileset_id > int(current["fileset_id"]):
            local_by_month[month] = {
                "fileset_id": fileset_id,
                "filename": filename,
                "resource_description": str(
                    info.get("resource_description") or filename
                ),
            }
    months: List[Dict[str, Any]] = []
    for key in _month_sequence(start_key, end_key):
        remote = latest_remote.get(key)
        local = local_by_month.get(key)
        if remote is None:
            status = "red"
        elif local is None:
            status = "red"
        elif int(local["fileset_id"]) >= int(remote["fileset_id"]):
            status = "green"
        else:
            status = "gray"
        months.append(
            {
                "month": f"{key[:4]}-{key[4:]}",
                "year": int(key[:4]),
                "month_no": int(key[4:6]),
                "status": status,
                "latest_fileset_id": int(remote["fileset_id"]) if remote else None,
                "local_fileset_id": int(local["fileset_id"]) if local else None,
                "filename": remote["filename"] if remote else "",
                "local_filename": local["filename"] if local else "",
                "description": remote["resource_description"] if remote else "",
            }
        )
    return months


def _month_key(value: str) -> str:
    match = re.match(r"^(\d{6})", str(value or "").strip())
    return match.group(1) if match else ""


def _month_label(value: str) -> str:
    key = _month_key(value)
    return f"{key[:4]}-{key[4:]}" if key else ""


def _pid_is_alive(pid: Any) -> bool:
    try:
        numeric = int(pid)
    except (TypeError, ValueError):
        return False
    if numeric <= 0:
        return False
    try:
        os.kill(numeric, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    return True


class DownloadProgress:
    """Throttled progress file read by the processing page.

    The downloader process writes a small snapshot while it checks metadata and
    streams archives. Writes are throttled so frequent chunk callbacks do not
    turn into a filesystem bottleneck.
    """

    def __init__(
        self,
        raw_dir: Path,
        *,
        update_interval: float = PROGRESS_WRITE_INTERVAL_SECONDS,
    ) -> None:
        self.path = raw_dir / PROGRESS_NAME
        self.pid = os.getpid()
        self.started_at = now_taipei().isoformat()
        self.update_interval = max(0.0, float(update_interval))
        self._last_write = 0.0
        self._payload: Dict[str, Any] = {}
        self.set(phase="preparing", message="準備檢查判決壓縮檔", force=True)

    def _write(self, *, force: bool = False) -> None:
        current = time.monotonic()
        if not force and current - self._last_write < self.update_interval:
            return
        self._last_write = current
        payload = dict(self._payload)
        payload["pid"] = self.pid
        payload["started_at"] = self.started_at
        payload["updated_at"] = now_taipei().isoformat()
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            temp = self.path.with_suffix(self.path.suffix + ".tmp")
            temp.write_text(
                json.dumps(payload, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            os.replace(temp, self.path)
        except OSError:
            # Progress reporting must never abort the actual download.
            pass

    def set(
        self,
        *,
        phase: str,
        message: str = "",
        entry: Optional[Dict[str, Any]] = None,
        month: str = "",
        filename: str = "",
        fileset_id: Optional[int] = None,
        index: Optional[int] = None,
        total: Optional[int] = None,
        bytes_written: Optional[int] = None,
        total_bytes: Optional[int] = None,
        force: bool = False,
    ) -> None:
        payload: Dict[str, Any] = {
            "phase": phase,
            "message": message,
            "month": month,
            "filename": filename,
            "fileset_id": fileset_id,
            "candidate_index": index,
            "candidate_total": total,
            "bytes_written": bytes_written,
            "total_bytes": total_bytes,
            "percent": None,
        }
        if entry is not None:
            payload["month"] = _month_label(
                str(
                    entry.get("resource_description")
                    or entry.get("filename")
                    or ""
                )
            )
            payload["filename"] = str(entry.get("filename") or "")
            try:
                payload["fileset_id"] = int(entry.get("fileset_id") or 0) or None
            except (TypeError, ValueError):
                payload["fileset_id"] = None
        if payload["month"]:
            payload["message"] = message or f"處理 {payload['month']} 判決壓縮檔"
        if (
            isinstance(bytes_written, int)
            and isinstance(total_bytes, int)
            and total_bytes > 0
        ):
            payload["percent"] = round(
                min(100.0, max(0.0, bytes_written / total_bytes * 100.0)),
                1,
            )
        self._payload = payload
        self._write(force=force)

    def preparing(self, message: str = "準備檢查判決壓縮檔") -> None:
        self.set(phase="preparing", message=message)

    def scanning(self, message: str) -> None:
        self.set(phase="scanning", message=message, force=True)

    def checking(
        self,
        entry: Dict[str, Any],
        *,
        index: Optional[int] = None,
        total: Optional[int] = None,
        message: str = "檢查檔案版本",
    ) -> None:
        self.set(
            phase="checking",
            message=message,
            entry=entry,
            index=index,
            total=total,
            bytes_written=0,
            total_bytes=None,
            force=True,
        )

    def downloading(
        self,
        entry: Dict[str, Any],
        total_bytes: Optional[int],
        *,
        index: Optional[int] = None,
        total: Optional[int] = None,
    ) -> None:
        self.set(
            phase="downloading",
            message="下載判決壓縮檔",
            entry=entry,
            index=index,
            total=total,
            bytes_written=0,
            total_bytes=total_bytes,
            force=True,
        )

    def saving(
        self,
        entry: Dict[str, Any],
        *,
        written: Optional[int] = None,
        index: Optional[int] = None,
        total: Optional[int] = None,
    ) -> None:
        self.set(
            phase="saving",
            message="驗證檔案並更新月份狀態",
            entry=entry,
            index=index,
            total=total,
            bytes_written=written,
            total_bytes=written,
            force=True,
        )

    def bytes(self, written: int, total_bytes: Optional[int] = None) -> None:
        current = self._payload
        total_value = total_bytes
        if total_value is None:
            total_value = current.get("total_bytes")
        self.set(
            phase="downloading",
            message=str(current.get("message") or "下載判決壓縮檔"),
            month=str(current.get("month") or ""),
            filename=str(current.get("filename") or ""),
            fileset_id=current.get("fileset_id"),
            index=current.get("candidate_index"),
            total=current.get("candidate_total"),
            bytes_written=int(written),
            total_bytes=(
                int(total_value) if isinstance(total_value, int) else None
            ),
        )

    def close(self) -> None:
        try:
            self.path.unlink()
        except OSError:
            pass


def _read_progress(raw_dir: Path) -> Optional[Dict[str, Any]]:
    path = raw_dir / PROGRESS_NAME
    if not path.is_file():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    if not isinstance(payload, dict):
        return None
    updated_at = payload.get("updated_at") or ""
    try:
        updated = datetime.fromisoformat(str(updated_at))
        if updated.tzinfo is None:
            updated = updated.replace(tzinfo=TAIPEI_TZ)
        age = (now_taipei() - updated).total_seconds()
    except (TypeError, ValueError):
        age = PROGRESS_MAX_AGE_SECONDS + 1
    if age > PROGRESS_MAX_AGE_SECONDS or not _pid_is_alive(payload.get("pid")):
        try:
            path.unlink()
        except OSError:
            pass
        return None
    payload["active"] = True
    return payload



def _prune_month_versions(
    raw_dir: Path,
    entry: Dict[str, Any],
    files_map: Dict[str, Any],
    *,
    keep_versions: bool = True,
    history_files: Optional[Dict[str, Any]] = None,
) -> List[str]:
    month = _month_key(entry.get("resource_description") or entry.get("filename") or "")
    if not month:
        return []
    keep_name = entry["filename"]
    removed: List[str] = []
    history_dir = raw_dir / "history"

    def archive_or_remove(
        path: Path,
        info: Optional[Dict[str, Any]] = None,
        *,
        history_key: str = "",
    ) -> None:
        if not path.is_file() or path.name == keep_name:
            return
        if not keep_versions:
            try:
                path.unlink()
                removed.append(path.name)
            except OSError:
                pass
            return
        try:
            history_dir.mkdir(parents=True, exist_ok=True)
            destination = history_dir / path.name
            if destination.exists():
                destination = history_dir / (
                    f"{path.stem}.{time.time_ns()}{path.suffix}"
                )
            os.replace(path, destination)
            removed.append(str(destination.relative_to(raw_dir)))
            if history_files is not None:
                key = history_key or f"archived:{path.name}"
                history_files[key] = {
                    **dict(info or {}),
                    "filename": path.name,
                    "archived_path": str(destination.relative_to(raw_dir)),
                    "archived_at": now_taipei().isoformat(),
                }
        except OSError:
            # Never delete an old archive when it cannot be moved to history.
            pass

    for key, info in list(files_map.items()):
        if key == str(entry["fileset_id"]):
            continue
        other_month = _month_key(
            str(info.get("resource_description") or info.get("filename") or "")
        )
        if other_month != month:
            continue
        filename = str(info.get("filename") or "")
        path = raw_dir / filename
        archive_or_remove(path, info, history_key=key)
        files_map.pop(key, None)
    pattern = re.compile(
        rf"^{re.escape(month)}(?:--.*)?\.(?:rar|7z|zip)$",
        re.IGNORECASE,
    )
    if raw_dir.is_dir():
        for path in raw_dir.iterdir():
            if not path.is_file() or path.name == keep_name:
                continue
            if not pattern.match(path.name):
                continue
            archive_or_remove(path)
    return removed


def _manifest_path(raw_dir: Path) -> Path:
    return raw_dir / MANIFEST_NAME


def _load_manifest(path: Path) -> Dict[str, Any]:
    if not path.is_file():
        return {"version": 1, "files": {}}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {"version": 1, "files": {}}
    if not isinstance(payload, dict):
        return {"version": 1, "files": {}}
    payload.setdefault("version", 1)
    payload.setdefault("files", {})
    return payload


def _save_manifest(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(temp, path)


def _unchanged(
    local_path: Path,
    remote: Dict[str, Any],
    previous: Optional[Dict[str, Any]],
) -> bool:
    if not local_path.is_file():
        return False
    local_size = local_path.stat().st_size
    remote_size = remote.get("content_length")
    if remote_size is not None and local_size != remote_size:
        return False
    if previous:
        if (
            previous.get("size_bytes") is not None
            and remote_size is not None
            and int(previous["size_bytes"]) != remote_size
        ):
            return False
        if (
            previous.get("last_modified")
            and remote.get("last_modified")
            and previous["last_modified"] != remote["last_modified"]
        ):
            return False
        if (
            previous.get("etag")
            and remote.get("etag")
            and previous["etag"] != remote["etag"]
        ):
            return False
    return True


def _probe_next(
    client: JudicialOpenDataClient,
    next_id: int,
) -> Optional[Dict[str, Any]]:
    metadata = client.metadata(next_id)
    if metadata is None:
        _log(f"fileset {next_id} 不存在，沒有更新的判決檔。")
        return None
    filename = metadata.get("filename") or ""
    if re.match(r"^\d{6}.*\.(rar|7z|zip)$", filename, re.IGNORECASE):
        _log(f"在 fileset {next_id} 發現新的判決壓縮檔：{filename}")
        extension = filename.rsplit(".", 1)[-1].lower()
        return {
            "fileset_id": next_id,
            "dataset_id": 0,
            "title": "probed",
            "resource_description": filename.rsplit(".", 1)[0],
            "format": extension.upper(),
            "extension": extension,
            "filename": filename,
        }
    _log(
        f"fileset {next_id} 是 {filename or '非判決檔'}，"
        "不是裁判書壓縮檔；停止往後探測。"
    )
    return None


def _scan_local_archives(raw_dir: Path) -> Dict[str, List[str]]:
    local: Dict[str, List[str]] = {}
    if not raw_dir.is_dir():
        return local
    for path in raw_dir.iterdir():
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".rar", ".7z", ".zip"}:
            continue
        month = _month_key(path.name)
        if not month:
            continue
        local.setdefault(month, []).append(path.name)
    for names in local.values():
        names.sort()
    return local


def _update_date(filename: str) -> str:
    match = re.search(r"\((\d{8})Update\)", str(filename or ""), re.IGNORECASE)
    return match.group(1) if match else ""


def _reconcile_local_months(
    months: List[Dict[str, Any]],
    raw_dir: Path,
    files_map: Dict[str, Any],
) -> List[Dict[str, Any]]:
    local = _scan_local_archives(raw_dir)
    file_to_fileset = {}
    for key, info in (files_map or {}).items():
        filename = str(info.get("filename") or "")
        try:
            fileset_id = int(info.get("fileset_id") or key)
        except (TypeError, ValueError):
            continue
        if filename:
            file_to_fileset[filename] = fileset_id
    for item in months:
        try:
            year = int(item.get("year"))
            month_no = int(item.get("month_no"))
        except (TypeError, ValueError):
            continue
        key = f"{year:04d}{month_no:02d}"
        names = local.get(key, [])
        latest_name = str(item.get("filename") or "")
        if latest_name and latest_name in names:
            item["status"] = "green"
            item["local_filename"] = latest_name
            item["local_fileset_id"] = item.get("latest_fileset_id")
        elif names:
            chosen = max(
                names,
                key=lambda name: (_update_date(name), name),
            )
            latest_date = _update_date(latest_name)
            local_date = _update_date(chosen)
            if latest_date and local_date and local_date >= latest_date:
                # The fileset ID for a month is stable; a manually downloaded
                # newer update suffix belongs to the same fileset.
                item["status"] = "green"
                item["local_fileset_id"] = item.get("latest_fileset_id")
            else:
                item["status"] = "gray"
                item["local_fileset_id"] = file_to_fileset.get(
                    chosen, item.get("local_fileset_id")
                )
            item["local_filename"] = chosen
        else:
            item["status"] = "red"
            item["local_filename"] = ""
            item["local_fileset_id"] = None
    return months


def file_response_headers(
    settings: Settings, fileset_id: int
) -> Dict[str, str]:
    client = JudicialOpenDataClient(settings)
    try:
        client.authenticate()
        metadata = client.metadata(fileset_id)
    finally:
        client.close()
    if metadata is None:
        raise FileNotFoundError("找不到指定的 fileset。")
    filename = str(metadata.get("filename") or f"fileset_{fileset_id}.rar")
    headers = {
        "Content-Disposition": (
            "attachment; filename*=UTF-8''" + quote(filename)
        )
    }
    if metadata.get("content_length") is not None:
        headers["Content-Length"] = str(metadata["content_length"])
    return headers


def iter_fileset(settings: Settings, fileset_id: int):
    client = JudicialOpenDataClient(settings)
    try:
        client.authenticate()
        url = FILESET_URL.format(fileset_id=fileset_id)
        with client.client.stream(
            "GET", url, headers=_headers(client.token)
        ) as response:
            response.raise_for_status()
            for chunk in response.iter_bytes(CHUNK_SIZE):
                if chunk:
                    yield chunk
    finally:
        client.close()


def _latest_by_month(entries: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    return {
        _month_key(entry["resource_description"]): entry
        for entry in _latest_per_month(entries)
    }


def _pending_entries(
    months: List[Dict[str, Any]],
    latest_by_month: Dict[str, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Downloadable months that are not yet green, oldest first.

    Red months without a remote fileset are official gaps, not pending work.
    """

    pending: List[Dict[str, Any]] = []
    for item in months:
        if str(item.get("status") or "") == "green":
            continue
        key = str(item.get("month") or "").replace("-", "")
        entry = latest_by_month.get(key)
        if entry is None:
            continue
        pending.append(entry)
    return pending


def _verification_entries(
    months: List[Dict[str, Any]],
    latest_by_month: Dict[str, Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Green months whose local file is the exact latest remote filename."""

    entries: List[Dict[str, Any]] = []
    for item in months:
        if str(item.get("status") or "") != "green":
            continue
        filename = str(item.get("filename") or "")
        local_filename = str(item.get("local_filename") or "")
        if not filename or (local_filename and local_filename != filename):
            # A manually placed newer update suffix is already green; do not
            # replace it with the older remote filename during verification.
            continue
        key = str(item.get("month") or "").replace("-", "")
        entry = latest_by_month.get(key)
        if entry is not None:
            entries.append(entry)
    entries.sort(key=lambda entry: int(entry["fileset_id"]), reverse=True)
    return entries


def _recent_throughput(samples: List[Tuple[int, float]]) -> Optional[float]:
    recent = samples[-THROUGHPUT_SAMPLE_LIMIT:]
    total_bytes = sum(float(size) for size, _ in recent if size > 0)
    total_seconds = sum(seconds for _, seconds in recent if seconds > 0)
    if total_bytes <= 0 or total_seconds <= 0:
        return None
    return total_bytes / total_seconds


def _deadline_reached(
    current: datetime,
    *,
    remaining_bytes: Optional[int],
    samples: List[Tuple[int, float]],
    buffer_seconds: float,
) -> bool:
    remaining_seconds = (
        _window_deadline(current) - current
    ).total_seconds()
    if remaining_seconds <= 0:
        return True
    if remaining_seconds <= max(0.0, buffer_seconds):
        return True
    throughput = _recent_throughput(samples)
    if not remaining_bytes or not throughput:
        return False
    estimated_seconds = float(remaining_bytes) / throughput
    return estimated_seconds + max(0.0, buffer_seconds) > remaining_seconds


def _sync_backfill(
    manifest: Dict[str, Any],
    months: List[Dict[str, Any]],
    latest_by_month: Dict[str, Dict[str, Any]],
) -> Dict[str, Any]:
    backfill = manifest.setdefault("backfill", {})
    if not isinstance(backfill, dict):
        backfill = {}
        manifest["backfill"] = backfill
    backfill["version"] = BACKFILL_VERSION
    failures = backfill.get("failures")
    if not isinstance(failures, dict):
        failures = {}
        backfill["failures"] = failures
    pending = _pending_entries(months, latest_by_month)
    first = pending[0] if pending else None
    pending_months = [
        _month_label(entry.get("resource_description") or entry.get("filename") or "")
        for entry in pending
    ]
    backfill["pending_months"] = pending_months
    backfill["pending_count"] = len(pending)
    backfill["resume_from_month"] = (
        _month_label(first.get("resource_description") or "") if first else ""
    )
    backfill["resume_from_fileset_id"] = (
        int(first["fileset_id"]) if first else None
    )
    backfill["complete"] = not pending
    pending_labels = set(pending_months)
    for month in list(failures):
        if month not in pending_labels:
            failures.pop(month, None)
    return backfill


def _backfill_status(
    manifest: Dict[str, Any], months: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Recompute pending work from the live month table for the status API.

    Manifest values are the durable checkpoint; the month table is rebuilt
    against local files, so manually placed archives immediately disappear from
    the pending count even before the next download run.
    """

    persisted = manifest.get("backfill")
    persisted = persisted if isinstance(persisted, dict) else {}
    pending = [
        item
        for item in months
        if str(item.get("status") or "") != "green"
        and item.get("latest_fileset_id")
    ]
    first = pending[0] if pending else None
    failures = persisted.get("failures")
    failures = failures if isinstance(failures, dict) else {}
    pending_months = [str(item.get("month") or "") for item in pending]
    pending_labels = set(pending_months)
    failures = {
        month: info
        for month, info in failures.items()
        if month in pending_labels
    }
    verification = persisted.get("verification")
    verification = verification if isinstance(verification, dict) else {}
    last_run = persisted.get("last_run")
    last_run = last_run if isinstance(last_run, dict) else {}
    return {
        "version": int(persisted.get("version") or BACKFILL_VERSION),
        "pending_months": pending_months,
        "pending_count": len(pending),
        "resume_from_month": str((first or {}).get("month") or ""),
        "resume_from_fileset_id": (first or {}).get("latest_fileset_id"),
        "complete": not pending,
        "verification": dict(verification),
        "last_run": dict(last_run),
        "failures": failures,
        "failure_count": len(failures),
    }


def download_status(settings: Settings) -> Dict[str, Any]:
    raw_dir = Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
    manifest_path = _manifest_path(raw_dir)
    manifest = _load_manifest(manifest_path)
    months = manifest.get("months")
    months = months if isinstance(months, list) else []
    months = _reconcile_local_months(
        months, raw_dir, manifest.get("files") or {}
    )
    for item in months:
        fileset_id = item.get("latest_fileset_id")
        item["download_url"] = (
            f"/api/judgment-download/files/{int(fileset_id)}"
            if fileset_id
            else ""
        )
    summary = {"green": 0, "gray": 0, "red": 0}
    for item in months:
        status = str(item.get("status") or "")
        if status in summary:
            summary[status] += 1
    return {
        "status": "ok" if months else "not_checked",
        "manifest_path": str(manifest_path),
        "generated_at": manifest.get("generated_at") or manifest.get("updated_at"),
        "local_reconciled_at": now_taipei().isoformat(),
        "range": manifest.get("range") or {},
        "summary": summary,
        "total_months": len(months),
        "months": months,
        "off_hours_enabled": bool(
            settings.judgment_download_allow_off_hours
        ),
        "backfill": _backfill_status(manifest, months),
        "progress": _read_progress(raw_dir),
    }


def run_download(
    *,
    settings: Settings,
    check_only: bool = False,
    full_range: bool = False,
    incremental: bool = False,
    status_only: bool = False,
    start_id: Optional[int] = None,
    known_latest_id: Optional[int] = None,
    category: Optional[str] = None,
    now: Optional[datetime] = None,
    clock: Optional[Callable[[], datetime]] = None,
    max_file_attempts: int = DOWNLOAD_MAX_ATTEMPTS,
    deadline_buffer_seconds: float = DEADLINE_BUFFER_SECONDS,
    allow_off_hours: Optional[bool] = None,
) -> Dict[str, Any]:
    def current_time() -> datetime:
        if clock is not None:
            value = clock()
        elif now is not None:
            value = now
        else:
            value = now_taipei()
        return value.astimezone(TAIPEI_TZ)

    off_hours_allowed = (
        bool(settings.judgment_download_allow_off_hours)
        if allow_off_hours is None
        else bool(allow_off_hours)
    )
    if not off_hours_allowed:
        ensure_window(current_time())
    raw_dir = Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
    raw_dir.mkdir(parents=True, exist_ok=True)
    progress = DownloadProgress(raw_dir)
    category_no = str(category or settings.judgment_download_category or "051")
    start = int(start_id or settings.judgment_download_start_id or 71644)
    known_latest = int(
        known_latest_id or settings.judgment_download_known_latest_id or 72011
    )
    manifest_path = _manifest_path(raw_dir)
    manifest = _load_manifest(manifest_path)
    files_map = manifest.setdefault("files", {})
    stats = {
        "status": "success",
        "mode": "check" if check_only else "download",
        "category": category_no,
        "checked": 0,
        "downloaded": 0,
        "updated": 0,
        "skipped": 0,
        "missing": 0,
        "errors": 0,
        "bytes_downloaded": 0,
        "pending_before": 0,
        "pending_after": 0,
        "stop_reason": "",
        "off_hours_enabled": off_hours_allowed,
    }
    samples: List[Tuple[int, float]] = []
    run_started = current_time()
    stop_reason = ""
    pending_before = 0
    pending_after = 0
    verification_complete = False
    verification_ran = False
    backfill: Dict[str, Any] = {}
    failures: Dict[str, Any] = {}
    verification: Dict[str, Any] = {}
    client = JudicialOpenDataClient(settings)
    try:
        progress.scanning("取得司法院裁判書清單")
        client.authenticate()
        resources = client.resources(category_no)
        entries = _archive_entries(resources)
        if not entries:
            raise JudgmentDownloadError("裁判書分類沒有可下載的壓縮檔。")
        by_id = {int(entry["fileset_id"]): entry for entry in entries}
        local_entries = [
            entry
            for entry in entries
            if (raw_dir / entry["filename"]).is_file()
        ]
        latest_local = max(
            (int(entry["fileset_id"]) for entry in local_entries), default=0
        )
        remote_latest = max(int(entry["fileset_id"]) for entry in entries)
        probed = _probe_next(client, remote_latest + 1)
        if probed is not None:
            entries.append(probed)
            by_id[int(probed["fileset_id"])] = probed
            remote_latest = max(remote_latest, int(probed["fileset_id"]))
        baseline = []
        for baseline_id in (start, known_latest):
            entry = by_id.get(baseline_id)
            present = bool(
                entry and (raw_dir / entry["filename"]).is_file()
            )
            baseline.append(
                {
                    "fileset_id": baseline_id,
                    "filename": entry["filename"] if entry else "",
                    "present": present,
                }
            )
        _log(
            f"裁判書分類 {category_no}：{len(entries)} 個壓縮檔；"
            f"本機最新 fileset {latest_local or '—'}；"
            f"遠端最新 {remote_latest}。"
        )
        for item in baseline:
            _log(
                f"baseline {item['fileset_id']} "
                f"{item['filename'] or '（分類中找不到）'}："
                f"{'已存在' if item['present'] else '未存在'}"
            )

        start_entry = by_id.get(start)
        start_key = (
            _month_key(start_entry.get("resource_description") or "")
            if start_entry
            else "199601"
        ) or "199601"
        month_keys = [
            _month_key(entry.get("resource_description") or "")
            for entry in entries
        ]
        end_key = (
            max(key for key in month_keys if key)
            if any(month_keys)
            else start_key
        )
        latest_by_month = _latest_by_month(entries)

        def refresh_months() -> List[Dict[str, Any]]:
            months = _build_month_status(
                entries,
                raw_dir,
                files_map,
                start_key=start_key,
                end_key=end_key,
            )
            months = _reconcile_local_months(months, raw_dir, files_map)
            manifest["months"] = months
            manifest["month_summary"] = {
                "green": sum(
                    1 for item in months if item["status"] == "green"
                ),
                "gray": sum(
                    1 for item in months if item["status"] == "gray"
                ),
                "red": sum(1 for item in months if item["status"] == "red"),
            }
            manifest["generated_at"] = current_time().isoformat()
            return months

        def persist_manifest() -> None:
            manifest["updated_at"] = current_time().isoformat()
            _save_manifest(manifest_path, manifest)

        months_cache = refresh_months()
        backfill = _sync_backfill(manifest, months_cache, latest_by_month)
        backfill["last_run"] = {
            "started_at": run_started.isoformat(),
            "finished_at": "",
            "status": "running",
            "stop_reason": "",
            "mode": stats["mode"],
            "pending_before": 0,
            "pending_after": 0,
            "checked": 0,
            "downloaded": 0,
            "updated": 0,
            "skipped": 0,
            "errors": 0,
            "bytes_downloaded": 0,
        }
        verification = backfill.get("verification")
        if not isinstance(verification, dict):
            verification = {}
            backfill["verification"] = verification
        verification.setdefault("status", "idle")
        verification.setdefault("verified_count", 0)
        verification.setdefault("next_fileset_id", None)
        verification.setdefault("next_month", "")
        verification.setdefault("cycle_started_at", "")
        verification.setdefault("completed_at", "")
        verification.setdefault("last_verified_at", "")
        verification.setdefault("last_error", "")
        failures = backfill.get("failures")
        if not isinstance(failures, dict):
            failures = {}
            backfill["failures"] = failures
        pending_before = int(backfill.get("pending_count") or 0)
        stats["pending_before"] = pending_before
        persist_manifest()

        def perform_entry(
            entry: Dict[str, Any],
            position: int,
            total: int,
            *,
            verification_mode: bool = False,
        ) -> Tuple[str, Optional[Exception]]:
            fileset_id = int(entry["fileset_id"])
            local_path = raw_dir / entry["filename"]
            progress.checking(
                entry,
                index=position,
                total=total,
                message=(
                    "驗證既有檔案版本" if verification_mode else "檢查檔案版本"
                ),
            )
            try:
                remote = client.metadata(fileset_id)
            except Exception as exc:
                stats["errors"] += 1
                _log(f"fileset {fileset_id} metadata 失敗：{exc}")
                return "error", exc
            if remote is None:
                stats["missing"] += 1
                _log(f"fileset {fileset_id} 不存在，略過。")
                return "missing", None
            stats["checked"] += 1
            previous = files_map.get(str(fileset_id))
            if _unchanged(local_path, remote, previous):
                stats["skipped"] += 1
                if previous is None:
                    files_map[str(fileset_id)] = {
                        "fileset_id": fileset_id,
                        "filename": entry["filename"],
                        "resource_description": entry["resource_description"],
                        "format": entry["format"],
                        "size_bytes": local_path.stat().st_size,
                        "last_modified": remote.get("last_modified") or "",
                        "etag": remote.get("etag") or "",
                        "content_type": remote.get("content_type") or "",
                        "source_url": FILESET_URL.format(fileset_id=fileset_id),
                        "checked_at": current_time().isoformat(),
                    }
                _log(f"fileset {fileset_id} 未變更：{entry['filename']}")
                return "skipped", None
            action = "更新" if local_path.is_file() else "下載"
            size = remote.get("content_length")
            _log(
                f"{action} fileset {fileset_id}：{entry['filename']}"
                + (f"（{size} bytes）" if size else "")
            )
            if check_only:
                return "check", None
            resume_offset = _part_resume_offset(
                local_path, fileset_id, remote
            )
            remaining_bytes: Optional[int] = None
            if size is not None:
                try:
                    remaining_bytes = max(0, int(size) - resume_offset)
                except (TypeError, ValueError):
                    remaining_bytes = None
            if not off_hours_allowed and _deadline_reached(
                current_time(),
                remaining_bytes=remaining_bytes,
                samples=samples,
                buffer_seconds=deadline_buffer_seconds,
            ):
                _log(
                    f"接近 06:00，尚未開始 fileset {fileset_id}；"
                    "下次會從此月份續傳。"
                )
                return "deadline", None
            progress.downloading(
                entry,
                size,
                index=position,
                total=total,
            )
            started = time.monotonic()
            last_error: Optional[Exception] = None
            written = 0
            sha256 = ""
            attempts = max(1, int(max_file_attempts))
            for attempt in range(1, attempts + 1):
                try:
                    written, sha256 = client.download(
                        fileset_id=fileset_id,
                        destination=local_path,
                        expected_size=size,
                        progress=progress.bytes,
                    )
                    last_error = None
                    break
                except AuthenticationError as exc:
                    last_error = exc
                    _log(
                        f"fileset {fileset_id} Token 過期，重新驗證後重試"
                        f"（{attempt}/{attempts}）。"
                    )
                    try:
                        client.authenticate()
                    except Exception as auth_exc:
                        last_error = auth_exc
                        break
                except Exception as exc:
                    last_error = exc
                    _log(
                        f"fileset {fileset_id} 下載失敗"
                        f"（{attempt}/{attempts}）：{exc}"
                    )
            if last_error is not None:
                stats["errors"] += 1
                return "error", last_error
            elapsed = max(0.0, time.monotonic() - started)
            transferred = max(0, written - resume_offset)
            if transferred > 0 and elapsed > 0:
                samples.append((transferred, elapsed))
                del samples[:-THROUGHPUT_SAMPLE_LIMIT]
            stats["downloaded"] += 1
            stats["bytes_downloaded"] += written
            if action == "更新":
                stats["updated"] += 1
            files_map[str(fileset_id)] = {
                "fileset_id": fileset_id,
                "filename": entry["filename"],
                "resource_description": entry["resource_description"],
                "format": entry["format"],
                "size_bytes": written,
                "sha256": sha256,
                "last_modified": remote.get("last_modified") or "",
                "etag": remote.get("etag") or "",
                "content_type": remote.get("content_type") or "",
                "source_url": FILESET_URL.format(fileset_id=fileset_id),
                "downloaded_at": current_time().isoformat(),
            }
            progress.saving(
                entry,
                written=written,
                index=position,
                total=total,
            )
            removed = _prune_month_versions(
                raw_dir,
                entry,
                files_map,
                keep_versions=bool(
                    settings.judgment_raw_rar_keep_versions
                ),
                history_files=manifest.setdefault("history_files", {}),
            )
            if removed:
                _log(
                    f"fileset {fileset_id} 新版本已下載，封存/移除同月份舊檔："
                    f"{', '.join(removed)}"
                )
            return ("updated" if action == "更新" else "downloaded"), None

        queue: List[Dict[str, Any]] = []
        if status_only:
            _log("僅更新月份狀態；不檢查檔案 metadata，也不下載。")
            stop_reason = "status_only"
        elif incremental:
            selected = [
                entry
                for entry in entries
                if (raw_dir / entry["filename"]).is_file()
                or int(entry["fileset_id"]) > latest_local
                or int(entry["fileset_id"]) in {start, known_latest}
            ]
            pending = _pending_entries(months_cache, latest_by_month)
            pending_ids = {int(entry["fileset_id"]) for entry in pending}
            queue = pending + [
                entry
                for entry in selected
                if int(entry["fileset_id"]) not in pending_ids
            ]
            _log(
                f"增量模式：待補齊 {len(pending)} 個月，另檢查既有 "
                f"{len(local_entries)} 檔、baseline 與最新 fileset。"
            )
        elif check_only:
            pending = _pending_entries(months_cache, latest_by_month)
            pending_ids = {int(entry["fileset_id"]) for entry in pending}
            verify_entries = _verification_entries(
                months_cache, latest_by_month
            )
            queue = pending + [
                entry
                for entry in verify_entries
                if int(entry["fileset_id"]) not in pending_ids
            ]
            _log(
                f"檢查模式：檢查 {len(pending)} 個待下載月份與 "
                f"{len(verify_entries)} 個既有月份；不下載檔案。"
            )
        else:
            queue = _pending_entries(months_cache, latest_by_month)
            if queue:
                first = queue[0]
                _log(
                    f"待補齊 {len(queue)} 個月；從 "
                    f"{_month_label(first.get('resource_description') or '')}"
                    f"（fileset {first['fileset_id']}）開始。"
                )
            else:
                _log("所有可下載月份皆已下載；開始驗證既有檔案。")

        total_candidates = len(queue)
        for position, entry in enumerate(queue, 1):
            if stop_reason:
                break
            if not off_hours_allowed and not window_is_open(current_time()):
                stop_reason = "window_closed"
                _log(
                    "已到 06:00 或不在允許的下載時段；"
                    "已完成部分會保留，下次從待下載月份續傳。"
                )
                break
            result, error = perform_entry(
                entry, position, total_candidates
            )
            month = _month_label(
                entry.get("resource_description") or entry.get("filename") or ""
            )
            if result in {"downloaded", "updated", "skipped"}:
                failures.pop(month, None)
            elif result in {"error", "missing"}:
                failures[month] = {
                    "month": month,
                    "fileset_id": int(entry["fileset_id"]),
                    "filename": entry["filename"],
                    "attempts": (
                        max(1, int(max_file_attempts))
                        if result == "error"
                        else 1
                    ),
                    "error": str(error or "fileset 不存在"),
                    "at": current_time().isoformat(),
                }
            months_cache = refresh_months()
            backfill = _sync_backfill(
                manifest, months_cache, latest_by_month
            )
            backfill["failures"] = failures
            backfill["verification"] = verification
            persist_manifest()
            if result == "deadline":
                stop_reason = "deadline"
                break

        pending_after = len(
            _pending_entries(months_cache, latest_by_month)
        )
        full_mode = not status_only and not incremental and not check_only

        if full_mode and pending_after == 0:
            candidates = _verification_entries(
                months_cache, latest_by_month
            )
            now_value = current_time()
            completed_at = str(verification.get("completed_at") or "")
            same_day_complete = False
            if completed_at:
                try:
                    same_day_complete = (
                        datetime.fromisoformat(completed_at)
                        .astimezone(TAIPEI_TZ)
                        .date()
                        == now_value.date()
                    )
                except ValueError:
                    same_day_complete = False
            cursor = verification.get("next_fileset_id")
            if same_day_complete and cursor is None:
                _log("今日已完成既有月份驗證，略過重複驗證。")
                verification_complete = True
            elif not candidates:
                verification.update(
                    status="completed",
                    completed_at=now_value.isoformat(),
                    next_fileset_id=None,
                    next_month="",
                )
                verification_complete = True
            else:
                if cursor is None:
                    cursor = int(candidates[0]["fileset_id"])
                    verification.update(
                        status="in_progress",
                        cycle_started_at=now_value.isoformat(),
                        verified_count=0,
                        completed_at="",
                        last_verified_at="",
                        last_error="",
                    )
                    _log("開始驗證既有月份（由最新月份往回）。")
                else:
                    cursor = int(cursor)
                    verification["status"] = "in_progress"
                    verification["completed_at"] = ""
                    _log(
                        f"接續驗證既有月份（從 fileset {cursor} 往回）。"
                    )
                verify_queue = [
                    entry
                    for entry in candidates
                    if int(entry["fileset_id"]) <= cursor
                ]
                verification["next_fileset_id"] = cursor
                verification["next_month"] = (
                    _month_label(
                        verify_queue[0].get("resource_description") or ""
                    )
                    if verify_queue
                    else ""
                )
                if not verify_queue:
                    verification.update(
                        status="completed",
                        completed_at=current_time().isoformat(),
                        next_fileset_id=None,
                        next_month="",
                    )
                    verification_complete = True
                else:
                    verification_ran = True
                    total_verify = len(verify_queue)
                    for position, entry in enumerate(verify_queue, 1):
                        if (
                            not off_hours_allowed
                            and not window_is_open(current_time())
                        ):
                            stop_reason = "verification_window_closed"
                            _log(
                                "已到 06:00 或不在允許的下載時段；"
                                "驗證進度已保留，下次接續。"
                            )
                            break
                        if not off_hours_allowed and _deadline_reached(
                            current_time(),
                            remaining_bytes=None,
                            samples=samples,
                            buffer_seconds=deadline_buffer_seconds,
                        ):
                            stop_reason = "verification_deadline"
                            _log(
                                "接近 06:00；驗證進度已保留，下次接續。"
                            )
                            break
                        result, error = perform_entry(
                            entry,
                            position,
                            total_verify,
                            verification_mode=True,
                        )
                        if result == "deadline":
                            stop_reason = "verification_deadline"
                            break
                        months_cache = refresh_months()
                        lower = [
                            candidate
                            for candidate in candidates
                            if int(candidate["fileset_id"])
                            < int(entry["fileset_id"])
                        ]
                        next_entry = lower[0] if lower else None
                        verification["next_fileset_id"] = (
                            int(next_entry["fileset_id"])
                            if next_entry
                            else None
                        )
                        verification["next_month"] = (
                            _month_label(
                                next_entry.get("resource_description") or ""
                            )
                            if next_entry
                            else ""
                        )
                        if result in {
                            "skipped",
                            "downloaded",
                            "updated",
                        }:
                            verification["verified_count"] = (
                                int(verification.get("verified_count") or 0)
                                + 1
                            )
                        verification["last_verified_at"] = (
                            current_time().isoformat()
                        )
                        if result == "error":
                            verification["last_error"] = str(
                                error or "metadata 檢查失敗"
                            )
                        backfill = _sync_backfill(
                            manifest, months_cache, latest_by_month
                        )
                        backfill["failures"] = failures
                        backfill["verification"] = verification
                        persist_manifest()
                    if (
                        verification.get("next_fileset_id") is None
                        and stop_reason
                        not in {
                            "verification_window_closed",
                            "verification_deadline",
                        }
                    ):
                        verification.update(
                            status="completed",
                            completed_at=current_time().isoformat(),
                            next_month="",
                        )
                        verification_complete = True
                    elif stop_reason not in {
                        "verification_window_closed",
                        "verification_deadline",
                    }:
                        verification_complete = False

        pending_after = len(
            _pending_entries(months_cache, latest_by_month)
        )
        if not stop_reason:
            if status_only:
                stop_reason = "status_only"
            elif incremental:
                stop_reason = "incremental" if not stats["errors"] else "errors"
            elif check_only:
                stop_reason = "check_only" if not stats["errors"] else "errors"
            elif pending_after > 0:
                stop_reason = "errors" if stats["errors"] else "pending"
            elif not verification_complete:
                stop_reason = "verification_partial"
            else:
                stop_reason = "completed"
        if stats["errors"] and stop_reason == "completed":
            stop_reason = "errors"
        if full_mode:
            complete = (
                pending_after == 0
                and verification_complete
                and stats["errors"] == 0
            )
            stats["status"] = "success" if complete else "partial"
        else:
            stats["status"] = (
                "success" if stats["errors"] == 0 else "partial"
            )
        stats["stop_reason"] = stop_reason
        stats["pending_after"] = pending_after
        stats["verification_ran"] = verification_ran
        stats["verification_complete"] = verification_complete

        local_entries = [
            entry
            for entry in entries
            if (raw_dir / entry["filename"]).is_file()
        ]
        latest_local = max(
            (int(entry["fileset_id"]) for entry in local_entries), default=0
        )
        months_cache = refresh_months()
        last_run = {
            "started_at": run_started.isoformat(),
            "finished_at": current_time().isoformat(),
            "status": stats["status"],
            "stop_reason": stop_reason,
            "mode": stats["mode"],
            "pending_before": pending_before,
            "pending_after": pending_after,
            "checked": stats["checked"],
            "downloaded": stats["downloaded"],
            "updated": stats["updated"],
            "skipped": stats["skipped"],
            "missing": stats["missing"],
            "errors": stats["errors"],
            "bytes_downloaded": stats["bytes_downloaded"],
        }
        backfill = _sync_backfill(manifest, months_cache, latest_by_month)
        backfill["failures"] = failures
        backfill["verification"] = verification
        backfill["last_run"] = last_run
        manifest["updated_at"] = current_time().isoformat()
        manifest["category_no"] = category_no
        manifest["range"] = {
            "start_id": start,
            "known_latest_id": known_latest,
            "remote_latest_id": remote_latest,
            "latest_local_id": latest_local,
            "baseline": baseline,
        }
        persist_manifest()
        stats["latest_local_id"] = latest_local
        stats["remote_latest_id"] = remote_latest
        stats["months"] = manifest.get("month_summary") or {}
        stats["backfill"] = {
            "pending_count": int(backfill.get("pending_count") or 0),
            "resume_from_month": str(
                backfill.get("resume_from_month") or ""
            ),
            "resume_from_fileset_id": backfill.get(
                "resume_from_fileset_id"
            ),
            "verification": dict(verification),
        }
        stats["manifest"] = str(manifest_path)
        _log(json.dumps(stats, ensure_ascii=False, indent=2))
        return stats
    finally:
        progress.close()
        client.close()


def _record_judgment_update(settings: Settings, result: Dict[str, Any]) -> None:
    """Persist the header/sidebar update state after a real download run."""

    try:
        engine = build_engine(settings.database_url)
        if settings.auto_create_schema:
            init_db(engine)
        session_factory = build_session_factory(engine)
        try:
            backfill = result.get("backfill") or {}
            pending = int(backfill.get("pending_count") or 0)
            errors = int(result.get("errors") or 0)
            status = "error" if errors else (
                "update_available" if pending else "up_to_date"
            )
            record_update(
                session_factory,
                source_type="judgment",
                source_url=str(
                    settings.judgment_download_category or "051"
                ),
                status=status,
                update_available=bool(pending),
                remote_filename="",
                local_update_date=now_taipei().isoformat(),
                download_path=str(
                    Path(settings.judgment_data_dir).expanduser().resolve()
                    / "raw_rar"
                ),
                download_date=now_taipei().strftime("%Y%m%d"),
                message=str(
                    result.get("stop_reason")
                    or ("尚有 %s 個月份待下載" % pending if pending else "判決已是最新")
                ),
                details={
                    "pending_count": pending,
                    "downloaded": int(result.get("downloaded") or 0),
                    "errors": errors,
                    "stop_reason": str(result.get("stop_reason") or ""),
                },
            )
        finally:
            engine.dispose()
    except Exception as exc:  # pragma: no cover - status must not break download
        _log(f"無法寫入判決更新紀錄：{exc.__class__.__name__}: {exc}")


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="下載司法院裁判書開放資料壓縮檔，儲存到 data/judgments/raw_rar。"
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="只檢查 metadata 與更新狀態，不下載檔案。",
    )
    parser.add_argument(
        "--full-range",
        action="store_true",
        help="完整月份模式（預設）；保留此旗標作為明確指定。",
    )
    parser.add_argument(
        "--incremental",
        action="store_true",
        help="只檢查既有檔案、baseline 與最新 fileset 之後的新檔。",
    )
    parser.add_argument(
        "--refresh-status",
        action="store_true",
        help="只依 resources 與本機檔案更新月份表，不檢查 metadata／不下載。",
    )
    parser.add_argument(
        "--require-window",
        action="store_true",
        help=(
            "僅在 Asia/Taipei 00:00–06:00 下載；"
            "覆寫 JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS。"
        ),
    )
    parser.add_argument("--start-id", type=int, default=None)
    parser.add_argument("--known-latest-id", type=int, default=None)
    parser.add_argument("--category", default=None)
    args = parser.parse_args(argv)
    settings = Settings.from_env()
    try:
        result = run_download(
            settings=settings,
            check_only=args.check_only,
            full_range=args.full_range,
            incremental=args.incremental,
            status_only=args.refresh_status,
            start_id=args.start_id,
            known_latest_id=args.known_latest_id,
            category=args.category,
            allow_off_hours=False if args.require_window else None,
        )
        if not args.check_only and not args.refresh_status:
            _record_judgment_update(settings, result)
        if result.get("status") == "success":
            return 0
        if int(result.get("errors") or 0) == 0:
            # Expected backfill pause (window closed/deadline/pending): the
            # checkpoint is saved and the next run continues from it.
            return EXIT_PARTIAL
        return 1
    except DownloadWindowClosed as exc:
        _log(str(exc))
        return 2
    except AuthenticationError as exc:
        _log(f"驗證失敗：{exc}")
        return 1
    except JudgmentDownloadError as exc:
        _log(f"判決下載失敗：{exc}")
        return 1
    except Exception as exc:  # pragma: no cover - defensive CLI boundary
        _log(f"判決下載失敗：{exc.__class__.__name__}: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
