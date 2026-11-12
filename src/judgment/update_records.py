from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import select, update
from sqlalchemy.orm import Session, sessionmaker

from .models import DownloadUpdateRecord

SOURCE_TYPES = ("law", "order", "judgment")
SOURCE_LABELS = {"law": "法規", "order": "命令", "judgment": "判決"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def record_update(
    session_factory: sessionmaker[Session],
    *,
    source_type: str,
    source_url: str = "",
    status: str,
    update_available: bool,
    remote_filename: str = "",
    remote_content_length: Optional[int] = None,
    remote_update_date: str = "",
    remote_etag: str = "",
    remote_last_modified: str = "",
    local_version_id: Optional[int] = None,
    local_update_date: str = "",
    local_zip_sha256: str = "",
    download_path: str = "",
    download_date: str = "",
    message: str = "",
    details: Optional[Dict[str, Any]] = None,
) -> int:
    """Append a check/download result and make it the current source state."""

    now = _now()
    with session_factory() as session:
        session.execute(
            update(DownloadUpdateRecord)
            .where(
                DownloadUpdateRecord.source_type == source_type,
                DownloadUpdateRecord.is_current.is_(True),
            )
            .values(is_current=False)
        )
        record = DownloadUpdateRecord(
            source_type=source_type,
            source_url=source_url,
            status=status,
            update_available=bool(update_available),
            checked_at=now,
            remote_filename=remote_filename,
            remote_content_length=remote_content_length,
            remote_update_date=remote_update_date,
            remote_etag=remote_etag,
            remote_last_modified=remote_last_modified,
            local_version_id=local_version_id,
            local_update_date=local_update_date,
            local_zip_sha256=local_zip_sha256,
            download_path=download_path,
            download_date=download_date,
            message=message,
            details=dict(details or {}),
            is_current=True,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return int(record.id)


def _record_dict(row: DownloadUpdateRecord) -> Dict[str, Any]:
    return {
        "id": int(row.id),
        "source_type": row.source_type,
        "source_url": row.source_url,
        "status": row.status,
        "update_available": bool(row.update_available),
        "checked_at": row.checked_at.isoformat() if row.checked_at else None,
        "remote_filename": row.remote_filename,
        "remote_content_length": row.remote_content_length,
        "remote_update_date": row.remote_update_date,
        "remote_etag": row.remote_etag,
        "remote_last_modified": row.remote_last_modified,
        "local_version_id": row.local_version_id,
        "local_update_date": row.local_update_date,
        "local_zip_sha256": row.local_zip_sha256,
        "download_path": row.download_path,
        "download_date": row.download_date,
        "message": row.message,
        "details": dict(row.details or {}),
    }


def latest_update_records(
    session_factory: sessionmaker[Session],
) -> Dict[str, Dict[str, Any]]:
    with session_factory() as session:
        rows = session.scalars(
            select(DownloadUpdateRecord).where(
                DownloadUpdateRecord.is_current.is_(True)
            )
        ).all()
    result: Dict[str, Dict[str, Any]] = {}
    for row in rows:
        result[str(row.source_type)] = _record_dict(row)
    return result


def update_history(
    session_factory: sessionmaker[Session],
    *,
    source_type: str,
    limit: int = 20,
) -> list[Dict[str, Any]]:
    with session_factory() as session:
        rows = session.scalars(
            select(DownloadUpdateRecord)
            .where(DownloadUpdateRecord.source_type == source_type)
            .order_by(DownloadUpdateRecord.checked_at.desc())
            .limit(max(1, int(limit)))
        ).all()
        return [_record_dict(row) for row in rows]


def update_status(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    records = latest_update_records(session_factory)
    sources = {}
    for source_type in SOURCE_TYPES:
        record = records.get(source_type)
        sources[source_type] = record or {
            "source_type": source_type,
            "status": "unknown",
            "update_available": False,
            "checked_at": None,
            "message": "尚未檢查",
        }
    update_count = sum(
        1
        for source_type in SOURCE_TYPES
        if bool(sources[source_type].get("update_available"))
    )
    return {
        "sources": sources,
        "update_count": update_count,
        "any_update": update_count > 0,
        "generated_at": _now().isoformat(),
    }
