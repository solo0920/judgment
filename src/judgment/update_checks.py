from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Sequence

import httpx
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .judgment_download import (
    JudicialOpenDataClient,
    _archive_entries,
    _build_month_status,
    _filename_from_headers,
    _load_manifest,
    _manifest_path,
    _month_key,
    _reconcile_local_months,
)
from .law_download.repository import LawRepository
from .update_records import latest_update_records, record_update

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _law_order_sources(settings: Settings):
    return (
        ("law", settings.law_api_url, "ChLaw.json.zip", "法規"),
        ("order", settings.order_api_url, "ChOrder.json.zip", "命令"),
    )


def _remote_headers(url: str, timeout: float = 30.0):
    with httpx.Client(
        follow_redirects=True,
        timeout=httpx.Timeout(timeout),
        headers={"User-Agent": "judgment-update-check/0.1"},
    ) as client:
        with client.stream("GET", url) as response:
            return response.status_code, dict(response.headers)


def check_law_order_source(
    session_factory: sessionmaker[Session],
    *,
    source_type: str,
    url: str,
    fallback_filename: str,
    label: str,
) -> Dict[str, Any]:
    repository = LawRepository(session_factory)
    latest = repository.get_latest_version(source_type)
    local_size: Optional[int] = None
    local_download_date = ""
    if latest is not None and latest.zip_path:
        try:
            local_size = Path(latest.zip_path).stat().st_size
            parent = Path(latest.zip_path).parent.name
            if parent.isdigit() and len(parent) == 8:
                local_download_date = parent
        except OSError:
            local_size = None
    try:
        status_code, headers = _remote_headers(url)
        if status_code != 200:
            raise RuntimeError(f"HTTP {status_code}")
        filename = _filename_from_headers(headers) or fallback_filename
        remote_length = headers.get("content-length")
        try:
            remote_length_int = int(remote_length) if remote_length else None
        except (TypeError, ValueError):
            remote_length_int = None
        if latest is None:
            update_available = True
            message = f"{label}尚無本地版本"
        elif remote_length_int is None:
            update_available = True
            message = f"{label}無法取得遠端 ZIP 長度"
        elif local_size != remote_length_int:
            update_available = True
            message = (
                f"{label}遠端 ZIP 大小變更：本機 {local_size or 0:,} "
                f"bytes，遠端 {remote_length_int:,} bytes"
            )
        else:
            update_available = False
            message = f"{label}線上與本地版本一致"
        record_update(
            session_factory,
            source_type=source_type,
            source_url=url,
            status="update_available" if update_available else "up_to_date",
            update_available=update_available,
            remote_filename=filename,
            remote_content_length=remote_length_int,
            remote_etag=str(headers.get("etag") or ""),
            remote_last_modified=str(headers.get("last-modified") or ""),
            local_version_id=int(latest.id) if latest is not None else None,
            local_update_date=str(latest.update_date or "") if latest else "",
            local_zip_sha256=str(latest.zip_sha256 or "") if latest else "",
            download_path=str(latest.zip_path or "") if latest else "",
            download_date=local_download_date,
            message=message,
            details={"label": label},
        )
        return {
            "source_type": source_type,
            "update_available": update_available,
            "message": message,
            "remote_filename": filename,
            "remote_content_length": remote_length_int,
            "local_version_id": int(latest.id) if latest is not None else None,
        }
    except Exception as exc:
        message = f"{label}線上檢查失敗：{exc.__class__.__name__}: {exc}"
        logger.warning(message)
        previous = latest_update_records(session_factory).get(source_type, {})
        record_update(
            session_factory,
            source_type=source_type,
            source_url=url,
            status="error",
            update_available=bool(previous.get("update_available")),
            remote_filename=fallback_filename,
            local_version_id=int(latest.id) if latest is not None else None,
            local_update_date=str(latest.update_date or "") if latest else "",
            download_path=str(latest.zip_path or "") if latest else "",
            message=message,
            details={"label": label},
        )
        return {
            "source_type": source_type,
            "update_available": bool(previous.get("update_available")),
            "message": message,
        }


def check_judgment_source(
    session_factory: sessionmaker[Session],
    *,
    settings: Settings,
) -> Dict[str, Any]:
    raw_dir = Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
    manifest = _load_manifest(_manifest_path(raw_dir))
    files_map = manifest.get("files") or {}
    client = JudicialOpenDataClient(settings)
    try:
        client.authenticate()
        entries = _archive_entries(
            client.resources(str(settings.judgment_download_category or "051"))
        )
        if not entries:
            raise RuntimeError("裁判書分類沒有可下載的壓縮檔")
        keys = [
            _month_key(entry.get("resource_description") or "")
            for entry in entries
        ]
        keys = [key for key in keys if key]
        start_key, end_key = min(keys), max(keys)
        months = _build_month_status(
            entries,
            raw_dir,
            files_map,
            start_key=start_key,
            end_key=end_key,
        )
        months = _reconcile_local_months(months, raw_dir, files_map)
        pending = [
            item
            for item in months
            if item.get("status") != "green" and item.get("latest_fileset_id")
        ]
        update_available = bool(pending)
        first = pending[0] if pending else None
        message = (
            f"判決待補齊 {len(pending)} 個月"
            if pending
            else "判決所有可下載月份皆已是最新"
        )
        record_update(
            session_factory,
            source_type="judgment",
            source_url=str(settings.judgment_download_category or "051"),
            status="update_available" if update_available else "up_to_date",
            update_available=update_available,
            remote_filename=str((first or {}).get("filename") or ""),
            remote_update_date=str(
                (first or {}).get("description") or ""
            ),
            local_update_date=str(manifest.get("generated_at") or ""),
            download_path=str(raw_dir),
            download_date=_utcnow().strftime("%Y%m%d"),
            message=message,
            details={
                "pending_count": len(pending),
                "resume_from_month": str((first or {}).get("month") or ""),
                "resume_from_fileset_id": (first or {}).get("latest_fileset_id"),
                "remote_latest_id": max(
                    int(entry["fileset_id"]) for entry in entries
                ),
            },
        )
        return {
            "source_type": "judgment",
            "update_available": update_available,
            "message": message,
            "pending_count": len(pending),
            "resume_from_month": str((first or {}).get("month") or ""),
        }
    except Exception as exc:
        message = f"判決線上檢查失敗：{exc.__class__.__name__}: {exc}"
        logger.warning(message)
        previous = latest_update_records(session_factory).get("judgment", {})
        record_update(
            session_factory,
            source_type="judgment",
            source_url=str(settings.judgment_download_category or "051"),
            status="error",
            update_available=bool(previous.get("update_available")),
            download_path=str(raw_dir),
            message=message,
            details={},
        )
        return {
            "source_type": "judgment",
            "update_available": bool(previous.get("update_available")),
            "message": message,
        }
    finally:
        client.close()


def check_all_sources(
    *,
    settings: Settings,
    session_factory: sessionmaker[Session],
    source_types: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    selected = set(source_types or ("law", "order", "judgment"))
    results = []
    for source_type, url, filename, label in _law_order_sources(settings):
        if source_type not in selected:
            continue
        results.append(
            check_law_order_source(
                session_factory,
                source_type=source_type,
                url=url,
                fallback_filename=filename,
                label=label,
            )
        )
    if "judgment" in selected:
        results.append(
            check_judgment_source(session_factory, settings=settings)
        )
    return {"sources": results}
