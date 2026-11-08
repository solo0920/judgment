from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LawSource(Base):
    __tablename__ = "law_sources"

    source_type = Column(String(16), primary_key=True)
    source_url = Column(Text, nullable=False)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)
    last_change_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )


class LawDatasetVersion(Base):
    __tablename__ = "law_dataset_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(16), nullable=False, index=True)
    source_url = Column(Text, nullable=False)
    update_date = Column(String(64), nullable=False, default="")
    content_sha256 = Column(String(64), nullable=False)
    raw_json_sha256 = Column(String(64), nullable=False)
    zip_sha256 = Column(String(64), nullable=False)
    zip_path = Column(Text, nullable=False)
    parquet_path = Column(Text, nullable=False)
    law_count = Column(Integer, nullable=False, default=0)
    article_count = Column(Integer, nullable=False, default=0)
    downloaded_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    is_current = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "source_type", "content_sha256", name="uq_law_version_source_content"
        ),
        Index("ix_law_versions_source_current", "source_type", "is_current"),
    )


class LawDocument(Base):
    __tablename__ = "law_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(16), nullable=False, index=True)
    law_key = Column(String(512), nullable=False)
    law_name = Column(Text, nullable=False)
    law_level = Column(Text, nullable=False, default="")
    law_category = Column(Text, nullable=False, default="")
    law_url = Column(Text, nullable=False, default="")
    law_modified_date = Column(String(32), nullable=False, default="")
    law_effective_date = Column(String(64), nullable=False, default="")
    law_effective_note = Column(Text, nullable=False, default="")
    law_abandon_note = Column(Text, nullable=False, default="")
    law_has_eng_version = Column(Boolean, nullable=False, default=False)
    eng_law_name = Column(Text, nullable=False, default="")
    law_attachments_json = Column(Text, nullable=False, default="[]")
    law_histories = Column(Text, nullable=False, default="")
    article_count = Column(Integer, nullable=False, default=0)
    content_hash = Column(String(64), nullable=False)
    first_seen_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=False
    )
    last_seen_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=False
    )
    removed_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=True
    )
    first_seen_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    removed_at = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, nullable=False, default=True, index=True)

    __table_args__ = (
        UniqueConstraint("source_type", "law_key", name="uq_law_document_source_key"),
        Index("ix_law_documents_name", "law_name"),
        Index("ix_law_documents_source_current", "source_type", "is_current"),
    )


class LawChangeEvent(Base):
    __tablename__ = "law_change_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    law_id = Column(Integer, ForeignKey("law_documents.id"), nullable=False)
    from_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=True
    )
    to_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=False
    )
    change_type = Column(String(16), nullable=False)
    changed_fields = Column(JSON, nullable=True)
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
    detected_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        Index("ix_law_change_events_law", "law_id", "detected_at"),
        Index("ix_law_change_events_version", "to_version_id"),
    )


class LawArticleVersion(Base):
    __tablename__ = "law_article_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    law_id = Column(
        Integer, ForeignKey("law_documents.id"), nullable=False, index=True
    )
    law_key = Column(String(512), nullable=False, default="", index=True)
    law_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=False, index=True
    )
    article_key = Column(String(512), nullable=False)
    article_type = Column(String(32), nullable=False, default="")
    article_no = Column(String(128), nullable=False, default="")
    article_index = Column(Integer, nullable=False, default=0)
    article_content = Column(Text, nullable=False, default="")
    content_hash = Column(String(64), nullable=False, default="")
    effective_date = Column(String(64), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "law_id",
            "law_version_id",
            "article_key",
            name="uq_law_article_version_key",
        ),
        Index("ix_law_article_versions_law_version", "law_id", "law_version_id"),
    )


class LawArticleChangeEvent(Base):
    __tablename__ = "law_article_change_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    law_id = Column(
        Integer, ForeignKey("law_documents.id"), nullable=False, index=True
    )
    law_key = Column(String(512), nullable=False, default="", index=True)
    from_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=True
    )
    to_version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=False, index=True
    )
    article_key = Column(String(512), nullable=False)
    article_type = Column(String(32), nullable=False, default="")
    article_no = Column(String(128), nullable=False, default="")
    change_type = Column(String(16), nullable=False)
    changed_fields = Column(JSON, nullable=True)
    before_content = Column(Text, nullable=True)
    after_content = Column(Text, nullable=True)
    effective_date = Column(String(64), nullable=False, default="")
    detected_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "law_id",
            "to_version_id",
            "article_key",
            name="uq_law_article_change_version_key",
        ),
        Index("ix_law_article_changes_law", "law_id", "detected_at"),
    )


class JudgmentImportRun(Base):
    __tablename__ = "judgment_import_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String(16), nullable=False, default="running", index=True)
    data_dir = Column(Text, nullable=False, default="")
    law_list_path = Column(Text, nullable=False, default="")
    law_list_sha256 = Column(String(64), nullable=False, default="")
    law_list_count = Column(Integer, nullable=False, default=0)
    archive_count = Column(Integer, nullable=False, default=0)
    scanned_count = Column(Integer, nullable=False, default=0)
    matched_count = Column(Integer, nullable=False, default=0)
    stored_count = Column(Integer, nullable=False, default=0)
    failed_count = Column(Integer, nullable=False, default=0)
    citation_count = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_judgment_import_runs_started", "started_at"),
    )


class JudgmentDocument(Base):
    __tablename__ = "judgment_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jid = Column(String(255), nullable=False, unique=True, index=True)
    jyear = Column(String(16), nullable=False, default="")
    jcase = Column(String(64), nullable=False, default="")
    jno = Column(String(32), nullable=False, default="")
    jdate = Column(String(16), nullable=False, default="", index=True)
    court = Column(Text, nullable=False, default="")
    court_normalized = Column(Text, nullable=False, default="")
    title = Column(Text, nullable=False, default="")
    full_text = Column(Text, nullable=False, default="")
    pdf_url = Column(Text, nullable=False, default="")
    source_archive = Column(Text, nullable=False, default="")
    content_hash = Column(String(64), nullable=False, default="")
    matched_laws = Column(JSON, nullable=False, default=list)
    matched_laws_text = Column(Text, nullable=False, default="")
    citations = Column(JSON, nullable=False, default=list)
    citation_count = Column(Integer, nullable=False, default=0)
    full_text_length = Column(Integer, nullable=False, default=0)
    import_run_id = Column(
        Integer, ForeignKey("judgment_import_runs.id"), nullable=True, index=True
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    __table_args__ = (
        Index("ix_judgment_documents_court", "court"),
        Index("ix_judgment_documents_court_normalized", "court_normalized"),
        Index("ix_judgment_documents_date", "jdate"),
    )


class JudgmentVectorIndex(Base):
    __tablename__ = "judgment_vector_index"

    jid = Column(String(255), primary_key=True)
    collection = Column(String(128), nullable=False, default="")
    model = Column(String(128), nullable=False, default="")
    content_hash = Column(String(64), nullable=False, default="")
    dimensions = Column(Integer, nullable=False, default=0)
    indexed_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)


class PerformanceRecord(Base):
    __tablename__ = "performance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), nullable=False, default="", index=True)
    process = Column(String(200), nullable=False, default="", index=True)
    module = Column(String(300), nullable=False, default="", index=True)
    method = Column(String(16), nullable=False, default="")
    path = Column(Text, nullable=False, default="")
    status = Column(String(16), nullable=False, default="success", index=True)
    status_code = Column(Integer, nullable=True)
    started_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=False, default=0)
    params = Column(JSON, nullable=False, default=dict)
    details = Column(JSON, nullable=False, default=dict)
    flow = Column(JSON, nullable=True, default=dict)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_performance_process_started", "process", "started_at"),
        Index("ix_performance_module_started", "module", "started_at"),
        Index("ix_performance_status_started", "status", "started_at"),
    )


class AppSetting(Base):
    __tablename__ = "app_settings"

    key = Column(String(100), primary_key=True)
    value = Column(JSON, nullable=False, default=dict)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )


class PerformanceTestRun(Base):
    __tablename__ = "performance_test_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(64), nullable=False, unique=True, index=True)
    request_id = Column(String(64), nullable=False, default="", index=True)
    question = Column(Text, nullable=False, default="")
    status = Column(String(16), nullable=False, default="running", index=True)
    stage = Column(String(64), nullable=False, default="")
    progress = Column(Integer, nullable=False, default=0)
    started_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    finished_at = Column(DateTime(timezone=True), nullable=True)
    total_ms = Column(Integer, nullable=False, default=0)
    models = Column(JSON, nullable=False, default=dict)
    summary = Column(JSON, nullable=False, default=dict)
    answer = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_performance_test_runs_status_started", "status", "started_at"),
    )


class PerformanceTestStep(Base):
    __tablename__ = "performance_test_steps"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(64), nullable=False, index=True)
    stage = Column(String(64), nullable=False, index=True)
    model = Column(String(200), nullable=False, default="")
    module = Column(String(300), nullable=False, default="")
    function = Column(String(300), nullable=False, default="")
    status = Column(String(16), nullable=False, default="pending", index=True)
    progress = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=False, default=0)
    details = Column(JSON, nullable=False, default=dict)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "run_id", "stage", "model", name="uq_performance_test_step"
        ),
        Index("ix_performance_test_steps_run_stage", "run_id", "stage"),
    )


class DownloadRun(Base):
    __tablename__ = "download_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(16), nullable=False, index=True)
    source_url = Column(Text, nullable=False)
    status = Column(String(16), nullable=False, default="running")
    started_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    http_status = Column(Integer, nullable=True)
    zip_sha256 = Column(String(64), nullable=True)
    raw_json_sha256 = Column(String(64), nullable=True)
    content_sha256 = Column(String(64), nullable=True)
    update_date = Column(String(64), nullable=True)
    law_count = Column(Integer, nullable=False, default=0)
    article_count = Column(Integer, nullable=False, default=0)
    version_id = Column(
        Integer, ForeignKey("law_dataset_versions.id"), nullable=True
    )
    parquet_path = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

    __table_args__ = (
        Index("ix_download_runs_source_started", "source_type", "started_at"),
        Index("ix_download_runs_status", "status"),
    )
