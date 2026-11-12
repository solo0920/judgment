from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from .models import (
    JudgmentChangeEvent,
    JudgmentDocument,
    JudgmentDocumentVersion,
    JudgmentSnapshot,
)

DOCUMENT_FIELDS = (
    "jyear",
    "jcase",
    "jno",
    "jdate",
    "court",
    "court_normalized",
    "title",
    "full_text",
    "pdf_url",
    "source_archive",
    "content_hash",
    "matched_laws",
    "matched_laws_text",
    "citations",
    "citation_count",
    "full_text_length",
    "import_run_id",
)

METADATA_FIELDS = (
    "jyear",
    "jcase",
    "jno",
    "jdate",
    "court",
    "court_normalized",
    "title",
    "pdf_url",
    "source_archive",
    "content_hash",
    "matched_laws",
    "matched_laws_text",
    "citation_count",
    "full_text_length",
)

ARCHIVE_PATTERN = re.compile(
    r"^(\d{6})(?:--\((\d{8})Update\))?", re.IGNORECASE
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", "", value or "")


def normalized_hash(value: str) -> str:
    return hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()


def archive_snapshot_info(archive: Path) -> Tuple[str, str]:
    match = ARCHIVE_PATTERN.match(archive.stem)
    if not match:
        return "", ""
    return match.group(1), match.group(2) or ""


def archive_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _metadata_from_row(row: Dict[str, Any]) -> Dict[str, Any]:
    return {field: row.get(field) for field in METADATA_FIELDS}


def _metadata_from_doc(document: JudgmentDocument) -> Dict[str, Any]:
    return {field: getattr(document, field) for field in METADATA_FIELDS}


def _metadata_from_version(version: JudgmentDocumentVersion) -> Dict[str, Any]:
    return {field: getattr(version, field) for field in METADATA_FIELDS}


def _version_from_doc(
    document: JudgmentDocument,
    *,
    snapshot_id: int,
    issue_month: str,
    valid_from_snapshot_id: Optional[int] = None,
) -> JudgmentDocumentVersion:
    version = JudgmentDocumentVersion(
        jid=document.jid,
        issue_month=issue_month or document.issue_month,
        snapshot_id=snapshot_id,
        content_hash=document.content_hash or "",
        normalized_hash=normalized_hash(document.full_text),
        valid_from_snapshot_id=(
            int(valid_from_snapshot_id)
            if valid_from_snapshot_id is not None
            else int(snapshot_id)
        ),
        created_at=document.updated_at or _now(),
    )
    for field in DOCUMENT_FIELDS:
        if field == "import_run_id":
            continue
        setattr(version, field, getattr(document, field))
    return version


def _legacy_snapshot(
    session: Session,
    document: JudgmentDocument,
    issue_month: str,
) -> JudgmentSnapshot:
    digest = hashlib.sha256(
        (
            f"legacy:{document.jid}:{document.content_hash}:"
            f"{document.source_archive}:{document.last_seen_snapshot_id}"
        ).encode("utf-8")
    ).hexdigest()
    existing = session.scalars(
        select(JudgmentSnapshot).where(
            JudgmentSnapshot.issue_month == issue_month,
            JudgmentSnapshot.archive_sha256 == digest,
        )
    ).first()
    if existing is not None:
        return existing
    snapshot = JudgmentSnapshot(
        issue_month=issue_month,
        source_archive=document.source_archive or "legacy",
        archive_sha256=digest,
        source_update_date="",
        raw_parquet_path="",
        delta_parquet_path="",
        raw_row_count=0,
        matched_count=0,
        is_current=False,
    )
    session.add(snapshot)
    session.flush()
    return snapshot


def ensure_historical_version(
    session: Session,
    document: JudgmentDocument,
) -> JudgmentDocumentVersion:
    """Return the archived version of the current document, creating it lazily.

    New records stay only in ``judgment_documents`` until they are superseded;
    this is what keeps the history cost proportional to changes rather than
    duplicating every row on every snapshot.
    """

    issue_month = document.issue_month or (document.jdate or "")[:6]
    snapshot_id = document.last_seen_snapshot_id
    snapshot = (
        session.get(JudgmentSnapshot, int(snapshot_id))
        if snapshot_id
        else None
    )
    if snapshot is None:
        snapshot = _legacy_snapshot(session, document, issue_month)
        snapshot_id = int(snapshot.id)
    existing = session.scalars(
        select(JudgmentDocumentVersion).where(
            JudgmentDocumentVersion.jid == document.jid,
            JudgmentDocumentVersion.snapshot_id == int(snapshot_id),
        )
    ).first()
    if existing is not None:
        return existing
    version = _version_from_doc(
        document,
        snapshot_id=int(snapshot_id),
        issue_month=issue_month,
        valid_from_snapshot_id=(
            document.content_first_seen_snapshot_id
            or document.first_seen_snapshot_id
            or snapshot_id
        ),
    )
    session.add(version)
    session.flush()
    return version


def create_snapshot(
    session: Session,
    *,
    issue_month: str,
    archive: Path,
    source_update_date: str,
    raw_parquet_path: str = "",
    delta_parquet_path: str = "",
    raw_row_count: int = 0,
    matched_count: int = 0,
) -> JudgmentSnapshot:
    sha = archive_sha256(archive)
    existing = session.scalars(
        select(JudgmentSnapshot).where(
            JudgmentSnapshot.issue_month == issue_month,
            JudgmentSnapshot.archive_sha256 == sha,
        )
    ).first()
    if existing is not None:
        return existing
    current = session.scalars(
        select(JudgmentSnapshot)
        .where(
            JudgmentSnapshot.issue_month == issue_month,
            JudgmentSnapshot.is_current.is_(True),
        )
        .order_by(
            JudgmentSnapshot.source_update_date.desc(),
            JudgmentSnapshot.id.desc(),
        )
        .limit(1)
    ).first()
    is_current = True
    if (
        current is not None
        and source_update_date
        and current.source_update_date
        and source_update_date < current.source_update_date
    ):
        is_current = False
    if current is not None and is_current:
        current.is_current = False
    snapshot = JudgmentSnapshot(
        issue_month=issue_month,
        source_archive=archive.name,
        archive_sha256=sha,
        source_update_date=source_update_date,
        raw_parquet_path=raw_parquet_path,
        delta_parquet_path=delta_parquet_path,
        raw_row_count=int(raw_row_count),
        matched_count=int(matched_count),
        is_current=is_current,
    )
    session.add(snapshot)
    session.flush()
    return snapshot


def _existing_event_keys(
    session: Session, snapshot_id: int
) -> Set[Tuple[str, str]]:
    rows = session.execute(
        select(JudgmentChangeEvent.jid, JudgmentChangeEvent.change_type).where(
            JudgmentChangeEvent.to_snapshot_id == snapshot_id
        )
    ).all()
    return {(str(jid), str(change_type)) for jid, change_type in rows}


def _add_event(
    session: Session,
    *,
    jid: str,
    issue_month: str,
    snapshot_id: int,
    change_type: str,
    from_version_id: Optional[int] = None,
    from_snapshot_id: Optional[int] = None,
    to_version_id: Optional[int] = None,
    changed_fields: Optional[Sequence[str]] = None,
    before_json: Optional[Dict[str, Any]] = None,
    after_json: Optional[Dict[str, Any]] = None,
    is_formatting_only: bool = False,
    existing_keys: Optional[Set[Tuple[str, str]]] = None,
) -> None:
    key = (jid, change_type)
    if existing_keys is not None and key in existing_keys:
        return
    session.add(
        JudgmentChangeEvent(
            jid=jid,
            issue_month=issue_month,
            from_snapshot_id=from_snapshot_id,
            to_snapshot_id=snapshot_id,
            from_version_id=from_version_id,
            to_version_id=to_version_id,
            change_type=change_type,
            changed_fields=list(changed_fields or []),
            before_json=before_json,
            after_json=after_json,
            is_formatting_only=bool(is_formatting_only),
        )
    )
    if existing_keys is not None:
        existing_keys.add(key)


def apply_versioned_batch(
    session_factory: sessionmaker[Session],
    *,
    rows: Sequence[Dict[str, Any]],
    snapshot_id: int,
    issue_month: str,
) -> Dict[str, int]:
    """Apply one import batch while preserving superseded content."""

    if not rows:
        return {"added": 0, "modified": 0, "removed": 0, "unchanged": 0}
    jids = [str(row["jid"]) for row in rows]
    counts = {"added": 0, "modified": 0, "removed": 0, "unchanged": 0}
    with session_factory() as session:
        existing_rows = session.scalars(
            select(JudgmentDocument).where(JudgmentDocument.jid.in_(jids))
        ).all()
        existing = {str(item.jid): item for item in existing_rows}
        event_keys = _existing_event_keys(session, snapshot_id)
        for raw_row in rows:
            row = dict(raw_row)
            jid = str(row["jid"])
            row["issue_month"] = issue_month
            document = existing.get(jid)
            if document is None:
                document = JudgmentDocument(
                    jid=jid,
                    issue_month=issue_month,
                    first_seen_snapshot_id=snapshot_id,
                    content_first_seen_snapshot_id=snapshot_id,
                    last_seen_snapshot_id=snapshot_id,
                    is_current=True,
                )
                for field in DOCUMENT_FIELDS:
                    setattr(document, field, row.get(field))
                session.add(document)
                session.flush()
                existing[jid] = document
                _add_event(
                    session,
                    jid=jid,
                    issue_month=issue_month,
                    snapshot_id=snapshot_id,
                    change_type="added",
                    after_json=_metadata_from_row(row),
                    existing_keys=event_keys,
                )
                counts["added"] += 1
                continue

            old_metadata = _metadata_from_doc(document)
            new_hash = str(row.get("content_hash") or "")
            if document.content_hash == new_hash and document.is_current:
                if document.first_seen_snapshot_id is None:
                    document.first_seen_snapshot_id = snapshot_id
                if document.content_first_seen_snapshot_id is None:
                    document.content_first_seen_snapshot_id = snapshot_id
                document.last_seen_snapshot_id = snapshot_id
                document.issue_month = issue_month
                counts["unchanged"] += 1
                continue

            old_version = ensure_historical_version(session, document)
            if document.content_hash == new_hash and not document.is_current:
                document.is_current = True
                document.removed_snapshot_id = None
                document.last_seen_snapshot_id = snapshot_id
                document.issue_month = issue_month
                _add_event(
                    session,
                    jid=jid,
                    issue_month=issue_month,
                    snapshot_id=snapshot_id,
                    change_type="restored",
                    from_version_id=int(old_version.id),
                    from_snapshot_id=int(old_version.snapshot_id),
                    before_json=old_metadata,
                    after_json=old_metadata,
                    existing_keys=event_keys,
                )
                counts["modified"] += 1
                continue

            old_normalized = normalized_hash(document.full_text)
            old_version.valid_to_snapshot_id = snapshot_id
            for field in DOCUMENT_FIELDS:
                setattr(document, field, row.get(field))
            document.issue_month = issue_month
            document.last_seen_snapshot_id = snapshot_id
            document.content_first_seen_snapshot_id = snapshot_id
            document.is_current = True
            document.removed_snapshot_id = None
            new_metadata = _metadata_from_row(row)
            changed_fields = [
                field
                for field in METADATA_FIELDS
                if old_metadata.get(field) != new_metadata.get(field)
            ]
            if not changed_fields:
                changed_fields = ["content_hash"]
            if "full_text" not in changed_fields and old_metadata.get(
                "content_hash"
            ) != new_metadata.get("content_hash"):
                changed_fields.append("full_text")
            _add_event(
                session,
                jid=jid,
                issue_month=issue_month,
                snapshot_id=snapshot_id,
                change_type="modified",
                from_version_id=int(old_version.id),
                from_snapshot_id=int(old_version.snapshot_id),
                changed_fields=changed_fields,
                before_json=old_metadata,
                after_json=new_metadata,
                is_formatting_only=(
                    old_normalized == normalized_hash(str(row.get("full_text") or ""))
                ),
                existing_keys=event_keys,
            )
            counts["modified"] += 1
        session.commit()
    return counts


def finalize_snapshot(
    session_factory: sessionmaker[Session],
    *,
    snapshot_id: int,
    issue_month: str,
    seen_jids: Set[str],
    allow_removals: bool = True,
) -> int:
    """Close documents missing from the newest snapshot of the same month."""

    removed = 0
    with session_factory() as session:
        snapshot = session.get(JudgmentSnapshot, snapshot_id)
        if snapshot is None or not snapshot.is_current:
            return 0
        if allow_removals:
            documents = session.scalars(
                select(JudgmentDocument).where(
                    JudgmentDocument.issue_month == issue_month,
                    JudgmentDocument.is_current.is_(True),
                )
            ).all()
            event_keys = _existing_event_keys(session, snapshot_id)
            for document in documents:
                if str(document.jid) in seen_jids:
                    continue
                old_version = ensure_historical_version(session, document)
                old_version.valid_to_snapshot_id = snapshot_id
                metadata = _metadata_from_doc(document)
                document.is_current = False
                document.removed_snapshot_id = snapshot_id
                _add_event(
                    session,
                    jid=str(document.jid),
                    issue_month=issue_month,
                    snapshot_id=snapshot_id,
                    change_type="removed",
                    from_version_id=int(old_version.id),
                    from_snapshot_id=int(old_version.snapshot_id),
                    changed_fields=["is_current"],
                    before_json=metadata,
                    after_json=None,
                    existing_keys=event_keys,
                )
                removed += 1
        snapshot.matched_count = max(int(snapshot.matched_count or 0), len(seen_jids))
        session.commit()
    return removed


def versioning_summary(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    from sqlalchemy import func

    with session_factory() as session:
        snapshots = int(
            session.scalar(
                select(func.count()).select_from(JudgmentSnapshot)
            )
            or 0
        )
        current_snapshots = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentSnapshot)
                .where(JudgmentSnapshot.is_current.is_(True))
            )
            or 0
        )
        documents = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(JudgmentDocument.is_current.is_(True))
            )
            or 0
        )
        historical = int(
            session.scalar(
                select(func.count()).select_from(JudgmentDocumentVersion)
            )
            or 0
        )
        events = int(
            session.scalar(
                select(func.count()).select_from(JudgmentChangeEvent)
            )
            or 0
        )
        latest_event = session.scalar(
            select(func.max(JudgmentChangeEvent.id))
        )
    return {
        "snapshots": snapshots,
        "current_snapshots": current_snapshots,
        "current_documents": documents,
        "historical_versions": historical,
        "change_events": events,
        "latest_event_id": int(latest_event or 0),
    }


def list_snapshot_dicts(
    session_factory: sessionmaker[Session],
    *,
    issue_month: str = "",
    limit: int = 50,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        statement = select(JudgmentSnapshot).order_by(
            JudgmentSnapshot.issue_month.desc(),
            JudgmentSnapshot.source_update_date.desc(),
            JudgmentSnapshot.id.desc(),
        )
        if issue_month:
            statement = statement.where(JudgmentSnapshot.issue_month == issue_month)
        rows = session.scalars(statement.limit(max(1, int(limit)))).all()
        return [
            {
                "id": int(row.id),
                "issue_month": row.issue_month,
                "source_archive": row.source_archive,
                "archive_sha256": row.archive_sha256,
                "source_update_date": row.source_update_date,
                "raw_parquet_path": row.raw_parquet_path,
                "delta_parquet_path": row.delta_parquet_path,
                "raw_row_count": int(row.raw_row_count or 0),
                "matched_count": int(row.matched_count or 0),
                "is_current": bool(row.is_current),
                "created_at": row.created_at.isoformat()
                if row.created_at
                else None,
            }
            for row in rows
        ]


def judgment_history(
    session_factory: sessionmaker[Session],
    *,
    jid: str,
    limit: int = 100,
) -> Dict[str, Any]:
    with session_factory() as session:
        document = session.scalars(
            select(JudgmentDocument).where(JudgmentDocument.jid == jid)
        ).first()
        versions = session.scalars(
            select(JudgmentDocumentVersion)
            .where(JudgmentDocumentVersion.jid == jid)
            .order_by(
                JudgmentDocumentVersion.valid_from_snapshot_id,
                JudgmentDocumentVersion.id,
            )
            .limit(max(1, int(limit)))
        ).all()
        events = session.scalars(
            select(JudgmentChangeEvent)
            .where(JudgmentChangeEvent.jid == jid)
            .order_by(JudgmentChangeEvent.id.desc())
            .limit(max(1, int(limit)))
        ).all()
        return {
            "jid": jid,
            "current": _document_dict(document) if document else None,
            "versions": [_version_dict(item) for item in versions],
            "events": [_event_dict(item) for item in events],
        }


def change_events(
    session_factory: sessionmaker[Session],
    *,
    issue_month: str = "",
    since_id: int = 0,
    limit: int = 100,
    ascending: bool = False,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        statement = select(JudgmentChangeEvent).order_by(
            JudgmentChangeEvent.id.asc()
            if ascending
            else JudgmentChangeEvent.id.desc()
        )
        if issue_month:
            statement = statement.where(
                JudgmentChangeEvent.issue_month == issue_month
            )
        if since_id:
            statement = statement.where(JudgmentChangeEvent.id > int(since_id))
        rows = session.scalars(statement.limit(max(1, int(limit)))).all()
        return [_event_dict(item) for item in rows]


def version_detail(
    session_factory: sessionmaker[Session],
    *,
    version_id: int,
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        version = session.get(JudgmentDocumentVersion, int(version_id))
        return _version_dict(version, include_text=True) if version else None


def judgment_vector_versions(
    session_factory: sessionmaker[Session],
    *,
    jid: str,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    from .models import JudgmentVectorIndex

    with session_factory() as session:
        rows = session.scalars(
            select(JudgmentVectorIndex)
            .where(JudgmentVectorIndex.jid == jid)
            .order_by(JudgmentVectorIndex.version_id.desc())
            .limit(max(1, int(limit)))
        ).all()
        return [
            {
                "jid": row.jid,
                "version_id": int(row.version_id),
                "collection": row.collection,
                "model": row.model,
                "embedding_version": row.embedding_version,
                "index_recipe_version": row.index_recipe_version,
                "content_hash": row.content_hash,
                "dimensions": int(row.dimensions or 0),
                "indexed_at": row.indexed_at.isoformat()
                if row.indexed_at
                else None,
            }
            for row in rows
        ]


def _document_dict(document: JudgmentDocument) -> Dict[str, Any]:
    return {
        "jid": document.jid,
        "issue_month": document.issue_month,
        "jyear": document.jyear,
        "jcase": document.jcase,
        "jno": document.jno,
        "jdate": document.jdate,
        "court": document.court,
        "court_normalized": document.court_normalized,
        "title": document.title,
        "full_text": document.full_text,
        "pdf_url": document.pdf_url,
        "source_archive": document.source_archive,
        "content_hash": document.content_hash,
        "matched_laws": list(document.matched_laws or []),
        "citation_count": int(document.citation_count or 0),
        "is_current": bool(document.is_current),
        "first_seen_snapshot_id": document.first_seen_snapshot_id,
        "content_first_seen_snapshot_id": document.content_first_seen_snapshot_id,
        "last_seen_snapshot_id": document.last_seen_snapshot_id,
        "removed_snapshot_id": document.removed_snapshot_id,
    }


def _version_dict(
    version: JudgmentDocumentVersion,
    *,
    include_text: bool = False,
) -> Dict[str, Any]:
    payload = {
        "id": int(version.id),
        "jid": version.jid,
        "issue_month": version.issue_month,
        "snapshot_id": int(version.snapshot_id),
        "content_hash": version.content_hash,
        "normalized_hash": version.normalized_hash,
        "jdate": version.jdate,
        "court": version.court,
        "title": version.title,
        "source_archive": version.source_archive,
        "matched_laws": list(version.matched_laws or []),
        "citation_count": int(version.citation_count or 0),
        "valid_from_snapshot_id": version.valid_from_snapshot_id,
        "valid_to_snapshot_id": version.valid_to_snapshot_id,
        "created_at": version.created_at.isoformat()
        if version.created_at
        else None,
    }
    if include_text:
        payload["full_text"] = version.full_text
        payload["citations"] = list(version.citations or [])
        payload["matched_laws_text"] = version.matched_laws_text
        payload["pdf_url"] = version.pdf_url
        payload["jyear"] = version.jyear
        payload["jcase"] = version.jcase
        payload["jno"] = version.jno
        payload["court_normalized"] = version.court_normalized
        payload["full_text_length"] = int(version.full_text_length or 0)
    return payload


def _event_dict(event: JudgmentChangeEvent) -> Dict[str, Any]:
    return {
        "id": int(event.id),
        "jid": event.jid,
        "issue_month": event.issue_month,
        "from_snapshot_id": event.from_snapshot_id,
        "to_snapshot_id": int(event.to_snapshot_id),
        "from_version_id": event.from_version_id,
        "to_version_id": event.to_version_id,
        "change_type": event.change_type,
        "changed_fields": list(event.changed_fields or []),
        "before_json": event.before_json,
        "after_json": event.after_json,
        "is_formatting_only": bool(event.is_formatting_only),
        "detected_at": event.detected_at.isoformat()
        if event.detected_at
        else None,
    }
