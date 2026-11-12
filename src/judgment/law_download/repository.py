from __future__ import annotations

import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, update
from sqlalchemy.orm import Session, sessionmaker

from ..law_article_versions import (
    persist_article_removals,
    persist_article_snapshot,
)
from ..models import (
    DownloadRun,
    LawChangeEvent,
    LawDatasetVersion,
    LawDocument,
    LawSource,
)
from ..update_records import record_update
from .types import (
    ApplyResult,
    FetchedArchive,
    LawRecord,
    ParsedDataset,
    SourceSpec,
)

logger = logging.getLogger(__name__)

METADATA_FIELDS = (
    "law_name",
    "law_level",
    "law_category",
    "law_url",
    "law_modified_date",
    "law_effective_date",
    "law_effective_note",
    "law_abandon_note",
    "law_has_eng_version",
    "eng_law_name",
    "law_attachments_json",
    "law_histories",
    "article_count",
    "content_hash",
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _record_metadata(record: LawRecord) -> Dict[str, Any]:
    return {field: getattr(record, field) for field in METADATA_FIELDS}


def _document_metadata(document: LawDocument) -> Dict[str, Any]:
    return {field: getattr(document, field) for field in METADATA_FIELDS}


def _assign_document(document: LawDocument, record: LawRecord) -> None:
    for field in METADATA_FIELDS:
        setattr(document, field, getattr(record, field))


class LawRepository:
    def __init__(self, session_factory: sessionmaker[Session]) -> None:
        self.session_factory = session_factory

    def start_run(self, source: SourceSpec) -> int:
        now = _now()
        with self.session_factory() as session:
            with session.begin():
                source_row = session.get(LawSource, source.source_type.value)
                if source_row is None:
                    source_row = LawSource(
                        source_type=source.source_type.value,
                        source_url=source.url,
                        last_checked_at=None,
                        last_change_at=None,
                        updated_at=now,
                    )
                    session.add(source_row)
                else:
                    source_row.source_url = source.url
                    source_row.updated_at = now

                run = DownloadRun(
                    source_type=source.source_type.value,
                    source_url=source.url,
                    status="running",
                    started_at=now,
                )
                session.add(run)
                session.flush()
                return int(run.id)

    def get_latest_version(self, source_type: str) -> Optional[LawDatasetVersion]:
        with self.session_factory() as session:
            return session.scalars(
                select(LawDatasetVersion)
                .where(LawDatasetVersion.source_type == source_type)
                .order_by(LawDatasetVersion.id.desc())
                .limit(1)
            ).first()

    def apply_dataset(
        self,
        source: SourceSpec,
        parsed: ParsedDataset,
        fetched: FetchedArchive,
        zip_path: str,
        parquet_path: str,
    ) -> ApplyResult:
        now = _now()
        with self.session_factory() as session:
            with session.begin():
                source_row = session.get(
                    LawSource, source.source_type.value, with_for_update=True
                )
                if source_row is None:
                    source_row = LawSource(
                        source_type=source.source_type.value,
                        source_url=source.url,
                        updated_at=now,
                    )
                    session.add(source_row)
                    session.flush()

                latest = session.scalars(
                    select(LawDatasetVersion)
                    .where(
                        LawDatasetVersion.source_type == source.source_type.value
                    )
                    .order_by(LawDatasetVersion.id.desc())
                    .limit(1)
                ).first()

                if latest is not None and latest.content_sha256 == parsed.semantic_sha256:
                    source_row.last_checked_at = now
                    return ApplyResult(
                        status="no_change",
                        version_id=int(latest.id),
                        law_count=int(latest.law_count),
                        article_count=int(latest.article_count),
                    )

                session.execute(
                    update(LawDatasetVersion)
                    .where(
                        LawDatasetVersion.source_type == source.source_type.value,
                        LawDatasetVersion.is_current.is_(True),
                    )
                    .values(is_current=False)
                )

                version = LawDatasetVersion(
                    source_type=source.source_type.value,
                    source_url=source.url,
                    update_date=parsed.update_date,
                    content_sha256=parsed.semantic_sha256,
                    raw_json_sha256=fetched.raw_json_sha256,
                    zip_sha256=fetched.zip_sha256,
                    zip_path=zip_path,
                    parquet_path=parquet_path,
                    law_count=parsed.law_count,
                    article_count=parsed.article_count,
                    downloaded_at=now,
                    is_current=True,
                )
                session.add(version)
                session.flush()

                existing = {
                    document.law_key: document
                    for document in session.scalars(
                        select(LawDocument).where(
                            LawDocument.source_type == source.source_type.value
                        )
                    )
                }

                seen: set[str] = set()
                new_documents: List[Tuple[LawDocument, LawRecord]] = []
                removed_documents: List[LawDocument] = []
                previous_version_id = _latest_version_id(latest)
                added = modified = removed = unchanged = 0

                for record in parsed.laws:
                    seen.add(record.law_key)
                    document = existing.get(record.law_key)

                    if document is None:
                        document = LawDocument(
                            source_type=source.source_type.value,
                            law_key=record.law_key,
                            law_name=record.law_name,
                            law_level=record.law_level,
                            law_category=record.law_category,
                            law_url=record.law_url,
                            law_modified_date=record.law_modified_date,
                            law_effective_date=record.law_effective_date,
                            law_effective_note=record.law_effective_note,
                            law_abandon_note=record.law_abandon_note,
                            law_has_eng_version=record.law_has_eng_version,
                            eng_law_name=record.eng_law_name,
                            law_attachments_json=record.law_attachments_json,
                            law_histories=record.law_histories,
                            article_count=record.article_count,
                            content_hash=record.content_hash,
                            first_seen_version_id=int(version.id),
                            last_seen_version_id=int(version.id),
                            first_seen_at=now,
                            last_seen_at=now,
                            is_current=True,
                        )
                        session.add(document)
                        new_documents.append((document, record))
                        added += 1
                        continue

                    if document.content_hash != record.content_hash or not document.is_current:
                        before = _document_metadata(document)
                        changed_fields = [
                            field
                            for field in METADATA_FIELDS
                            if before.get(field) != getattr(record, field)
                        ]
                        if not document.is_current and "is_current" not in changed_fields:
                            changed_fields.append("is_current")
                        if not changed_fields:
                            changed_fields = ["content_hash"]

                        _assign_document(document, record)
                        document.last_seen_version_id = int(version.id)
                        document.last_seen_at = now
                        document.is_current = True
                        document.removed_version_id = None
                        document.removed_at = None

                        session.add(
                            LawChangeEvent(
                                law_id=int(document.id),
                                from_version_id=previous_version_id,
                                to_version_id=int(version.id),
                                change_type="modified",
                                changed_fields=changed_fields,
                                before_json=before,
                                after_json=_record_metadata(record),
                                detected_at=now,
                            )
                        )
                        modified += 1
                    else:
                        document.last_seen_version_id = int(version.id)
                        document.last_seen_at = now
                        document.is_current = True
                        document.removed_version_id = None
                        document.removed_at = None
                        unchanged += 1

                for law_key, document in existing.items():
                    if law_key in seen or not document.is_current:
                        continue
                    document.is_current = False
                    document.removed_version_id = int(version.id)
                    document.removed_at = now
                    removed_documents.append(document)
                    session.add(
                        LawChangeEvent(
                            law_id=int(document.id),
                            from_version_id=previous_version_id,
                            to_version_id=int(version.id),
                            change_type="removed",
                            changed_fields=["is_current"],
                            before_json=_document_metadata(document),
                            after_json=None,
                            detected_at=now,
                        )
                    )
                    removed += 1

                session.flush()
                for document, record in new_documents:
                    session.add(
                        LawChangeEvent(
                            law_id=int(document.id),
                            from_version_id=None,
                            to_version_id=int(version.id),
                            change_type="added",
                            changed_fields=None,
                            before_json=None,
                            after_json=_record_metadata(record),
                            detected_at=now,
                        )
                    )

                documents_by_key = dict(existing)
                for document, record in new_documents:
                    documents_by_key[record.law_key] = document
                article_result = persist_article_snapshot(
                    session,
                    version_id=int(version.id),
                    records=parsed.laws,
                    documents_by_key=documents_by_key,
                    previous_version_id=previous_version_id,
                    detected_at=now,
                )
                article_result["article_changes_inserted"] += persist_article_removals(
                    session,
                    version_id=int(version.id),
                    documents=removed_documents,
                    previous_version_id=previous_version_id,
                    detected_at=now,
                )
                logger.info(
                    "law version #%s article snapshots=%s changes=%s",
                    int(version.id),
                    article_result["articles_inserted"],
                    article_result["article_changes_inserted"],
                )

                source_row.last_checked_at = now
                source_row.last_change_at = now
                source_row.updated_at = now

                return ApplyResult(
                    status="success",
                    version_id=int(version.id),
                    law_count=parsed.law_count,
                    article_count=parsed.article_count,
                    added=added,
                    modified=modified,
                    removed=removed,
                    unchanged=unchanged,
                )

    def record_download_result(
        self,
        *,
        source: SourceSpec,
        fetched: FetchedArchive,
        version_id: Optional[int],
        zip_path: str,
        message: str,
    ) -> None:
        path = Path(zip_path)
        try:
            size = path.stat().st_size
        except OSError:
            size = None
        download_date = (
            path.parent.name
            if path.parent.name.isdigit() and len(path.parent.name) == 8
            else _now().strftime("%Y%m%d")
        )
        try:
            record_update(
                self.session_factory,
                source_type=source.source_type.value,
                source_url=source.url,
                status="up_to_date",
                update_available=False,
                remote_filename=f"{source.json_filename}.zip",
                remote_content_length=size,
                remote_update_date=fetched.update_date,
                local_version_id=version_id,
                local_update_date=fetched.update_date,
                local_zip_sha256=fetched.zip_sha256,
                download_path=str(path),
                download_date=download_date,
                message=message,
            )
        except Exception:
            logger.warning(
                "無法寫入 %s 的下載更新紀錄", source.source_type.value,
                exc_info=True,
            )

    def finish_run(
        self,
        run_id: int,
        *,
        status: str,
        duration_ms: int,
        fetched: Optional[FetchedArchive] = None,
        parsed: Optional[ParsedDataset] = None,
        version_id: Optional[int] = None,
        parquet_path: Optional[str] = None,
        law_count: Optional[int] = None,
        article_count: Optional[int] = None,
        content_sha256: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> None:
        now = _now()
        with self.session_factory() as session:
            with session.begin():
                run = session.get(DownloadRun, run_id)
                if run is None:
                    logger.warning("download run %s not found while finishing", run_id)
                    return

                run.status = status
                run.finished_at = now
                run.duration_ms = duration_ms
                run.version_id = version_id
                run.parquet_path = parquet_path
                run.error_message = error_message[:4000] if error_message else None

                if fetched is not None:
                    run.http_status = fetched.http_status
                    run.zip_sha256 = fetched.zip_sha256
                    run.raw_json_sha256 = fetched.raw_json_sha256
                    run.update_date = fetched.update_date
                if parsed is not None:
                    run.content_sha256 = parsed.semantic_sha256
                    run.law_count = parsed.law_count
                    run.article_count = parsed.article_count
                    run.update_date = parsed.update_date
                if content_sha256 is not None:
                    run.content_sha256 = content_sha256
                if law_count is not None:
                    run.law_count = law_count
                if article_count is not None:
                    run.article_count = article_count

                source_row = session.get(LawSource, run.source_type)
                if source_row is not None:
                    source_row.last_checked_at = now
                    source_row.updated_at = now


def _latest_version_id(version: Optional[LawDatasetVersion]) -> Optional[int]:
    return int(version.id) if version is not None else None
