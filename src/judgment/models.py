from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
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
    version_code = Column(String(12), nullable=False, default="", index=True)
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


class JudgmentSnapshot(Base):
    """One imported archive snapshot for a judgment issue month.

    Snapshots are immutable.  The latest snapshot for an issue month is the
    current one; older snapshots remain queryable for audit.
    """

    __tablename__ = "judgment_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_month = Column(String(6), nullable=False, index=True)
    source_archive = Column(Text, nullable=False)
    archive_sha256 = Column(String(64), nullable=False)
    source_update_date = Column(String(8), nullable=False, default="")
    raw_parquet_path = Column(Text, nullable=False, default="")
    delta_parquet_path = Column(Text, nullable=False, default="")
    raw_row_count = Column(Integer, nullable=False, default=0)
    matched_count = Column(Integer, nullable=False, default=0)
    is_current = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "issue_month",
            "archive_sha256",
            name="uq_judgment_snapshot_month_sha",
        ),
        Index("ix_judgment_snapshots_month_current", "issue_month", "is_current"),
    )


class JudgmentDocument(Base):
    __tablename__ = "judgment_documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jid = Column(String(255), nullable=False, unique=True, index=True)
    issue_month = Column(String(6), nullable=False, default="", index=True)
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
    first_seen_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    content_first_seen_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    last_seen_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    removed_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    is_current = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    __table_args__ = (
        Index("ix_judgment_documents_court", "court"),
        Index("ix_judgment_documents_court_normalized", "court_normalized"),
        Index("ix_judgment_documents_date", "jdate"),
    )


class JudgmentDocumentVersion(Base):
    """Immutable historical content for a judgment that was superseded.

    The current content lives in ``judgment_documents``.  A version row is
    created lazily when the current row is changed or removed, so new records
    are not duplicated just to establish their first version.
    """

    __tablename__ = "judgment_document_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jid = Column(String(255), nullable=False, index=True)
    issue_month = Column(String(6), nullable=False, default="", index=True)
    snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=False, index=True
    )
    content_hash = Column(String(64), nullable=False, default="")
    normalized_hash = Column(String(64), nullable=False, default="")
    jyear = Column(String(16), nullable=False, default="")
    jcase = Column(String(64), nullable=False, default="")
    jno = Column(String(32), nullable=False, default="")
    jdate = Column(String(16), nullable=False, default="")
    court = Column(Text, nullable=False, default="")
    court_normalized = Column(Text, nullable=False, default="")
    title = Column(Text, nullable=False, default="")
    full_text = Column(Text, nullable=False, default="")
    pdf_url = Column(Text, nullable=False, default="")
    source_archive = Column(Text, nullable=False, default="")
    matched_laws = Column(JSON, nullable=False, default=list)
    matched_laws_text = Column(Text, nullable=False, default="")
    citations = Column(JSON, nullable=False, default=list)
    citation_count = Column(Integer, nullable=False, default=0)
    full_text_length = Column(Integer, nullable=False, default=0)
    valid_from_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    valid_to_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "jid", "snapshot_id", name="uq_judgment_version_jid_snapshot"
        ),
        Index(
            "ix_judgment_versions_jid_validity",
            "jid",
            "valid_from_snapshot_id",
            "valid_to_snapshot_id",
        ),
    )


class JudgmentChangeEvent(Base):
    """Audit event for a judgment added, changed, removed, or restored."""

    __tablename__ = "judgment_change_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    jid = Column(String(255), nullable=False, index=True)
    issue_month = Column(String(6), nullable=False, default="", index=True)
    from_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=True
    )
    to_snapshot_id = Column(
        Integer, ForeignKey("judgment_snapshots.id"), nullable=False, index=True
    )
    from_version_id = Column(
        Integer, ForeignKey("judgment_document_versions.id"), nullable=True
    )
    to_version_id = Column(
        Integer, ForeignKey("judgment_document_versions.id"), nullable=True
    )
    change_type = Column(String(16), nullable=False)
    changed_fields = Column(JSON, nullable=True)
    before_json = Column(JSON, nullable=True)
    after_json = Column(JSON, nullable=True)
    is_formatting_only = Column(Boolean, nullable=False, default=False)
    detected_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "jid",
            "to_snapshot_id",
            "change_type",
            name="uq_judgment_change_event",
        ),
        Index(
            "ix_judgment_change_events_snapshot",
            "to_snapshot_id",
            "change_type",
        ),
        Index("ix_judgment_change_events_jid_time", "jid", "detected_at"),
    )


class JudgmentIndexVersion(Base):
    __tablename__ = "judgment_index_versions"

    version_id = Column(Integer, primary_key=True, autoincrement=True)
    physical_collection = Column(String(128), nullable=False, unique=True, index=True)
    alias_name = Column(String(128), nullable=False, default="judgments_current", index=True)
    build_mode = Column(String(32), nullable=False, default="full")
    embedding_model = Column(String(128), nullable=False, default="")
    embedding_version = Column(String(128), nullable=False, default="")
    embedding_dimension = Column(Integer, nullable=False, default=0)
    index_recipe_version = Column(String(128), nullable=False, default="")
    point_id_version = Column(String(64), nullable=False, default="jid-uuid5-v1")
    document_count = Column(Integer, nullable=False, default=0)
    indexed_count = Column(Integer, nullable=False, default=0)
    source_snapshot = Column(JSON, nullable=False, default=dict)
    validation_result = Column(JSON, nullable=False, default=dict)
    status = Column(String(32), nullable=False, default="building", index=True)
    previous_version_id = Column(
        Integer,
        ForeignKey("judgment_index_versions.version_id"),
        nullable=True,
    )
    last_indexed_id = Column(Integer, nullable=False, default=0)
    last_indexed_month = Column(String(6), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    validated_at = Column(DateTime(timezone=True), nullable=True)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    retired_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)

    __table_args__ = (
        Index(
            "ix_judgment_index_versions_alias_status",
            "alias_name",
            "status",
        ),
        Index("ix_judgment_index_versions_created", "created_at"),
    )


class JudgmentVectorIndex(Base):
    __tablename__ = "judgment_vector_index"

    jid = Column(String(255), primary_key=True)
    version_id = Column(
        Integer,
        ForeignKey("judgment_index_versions.version_id"),
        primary_key=True,
    )
    collection = Column(String(128), nullable=False, default="")
    model = Column(String(128), nullable=False, default="")
    embedding_version = Column(String(128), nullable=False, default="")
    index_recipe_version = Column(String(128), nullable=False, default="")
    source_year = Column(String(8), nullable=False, default="")
    content_hash = Column(String(64), nullable=False, default="")
    index_text_hash = Column(String(64), nullable=False, default="")
    payload_hash = Column(String(64), nullable=False, default="")
    dimensions = Column(Integer, nullable=False, default=0)
    source_updated_at = Column(DateTime(timezone=True), nullable=True)
    indexed_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        Index("ix_judgment_vector_index_version", "version_id"),
    )


class LegalArticleIndexVersion(Base):
    """Version metadata for the law/order article vector collection."""

    __tablename__ = "legal_article_index_versions"

    version_id = Column(Integer, primary_key=True, autoincrement=True)
    physical_collection = Column(
        String(128), nullable=False, unique=True, index=True
    )
    alias_name = Column(
        String(128), nullable=False, default="legal_articles_current", index=True
    )
    build_mode = Column(String(32), nullable=False, default="full")
    embedding_model = Column(String(128), nullable=False, default="")
    embedding_version = Column(String(128), nullable=False, default="")
    embedding_dimension = Column(Integer, nullable=False, default=0)
    index_recipe_version = Column(String(128), nullable=False, default="")
    point_id_version = Column(String(64), nullable=False, default="")
    law_count = Column(Integer, nullable=False, default=0)
    article_count = Column(Integer, nullable=False, default=0)
    indexed_count = Column(Integer, nullable=False, default=0)
    source_snapshot = Column(JSON, nullable=False, default=dict)
    validation_result = Column(JSON, nullable=False, default=dict)
    status = Column(String(32), nullable=False, default="building", index=True)
    previous_version_id = Column(
        Integer,
        ForeignKey("legal_article_index_versions.version_id"),
        nullable=True,
    )
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    validated_at = Column(DateTime(timezone=True), nullable=True)
    activated_at = Column(DateTime(timezone=True), nullable=True)
    retired_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)

    __table_args__ = (
        Index(
            "ix_legal_article_index_versions_alias_status",
            "alias_name",
            "status",
        ),
        Index("ix_legal_article_index_versions_created", "created_at"),
    )


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


class OllamaModelCapability(Base):
    __tablename__ = "ollama_model_capabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    base_url = Column(String(300), nullable=False, default="", index=True)
    model = Column(String(200), nullable=False, index=True)
    supports_chat = Column(Boolean, nullable=False, default=False)
    capabilities = Column(JSON, nullable=False, default=list)
    detail = Column(Text, nullable=False, default="")
    tested_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint(
            "base_url", "model", name="uq_ollama_model_capability"
        ),
        Index("ix_ollama_model_capabilities_chat", "supports_chat"),
    )


class OllamaHost(Base):
    __tablename__ = "ollama_hosts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(120), nullable=False, default="")
    base_url = Column(String(300), nullable=False, unique=True, index=True)
    port = Column(Integer, nullable=False, default=11434)
    is_active = Column(Boolean, nullable=False, default=False, index=True)
    priority = Column(Integer, nullable=False, default=100, index=True)
    chat_model = Column(String(200), nullable=False, default="")
    embedding_model = Column(String(200), nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
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


class DownloadUpdateRecord(Base):
    """One online update check or completed download for a source."""

    __tablename__ = "download_update_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_type = Column(String(16), nullable=False, index=True)
    source_url = Column(Text, nullable=False, default="")
    status = Column(String(24), nullable=False, default="unknown")
    update_available = Column(Boolean, nullable=False, default=False)
    checked_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    remote_filename = Column(Text, nullable=False, default="")
    remote_content_length = Column(Integer, nullable=True)
    remote_update_date = Column(String(64), nullable=False, default="")
    remote_etag = Column(Text, nullable=False, default="")
    remote_last_modified = Column(Text, nullable=False, default="")
    local_version_id = Column(Integer, nullable=True)
    local_update_date = Column(String(64), nullable=False, default="")
    local_zip_sha256 = Column(String(64), nullable=False, default="")
    download_path = Column(Text, nullable=False, default="")
    download_date = Column(String(8), nullable=False, default="")
    message = Column(Text, nullable=False, default="")
    details = Column(JSON, nullable=False, default=dict)
    is_current = Column(Boolean, nullable=False, default=True, index=True)

    __table_args__ = (
        Index(
            "ix_download_update_source_current",
            "source_type",
            "is_current",
        ),
        Index(
            "ix_download_update_checked",
            "checked_at",
        ),
    )


class QuestionBankItem(Base):
    __tablename__ = "question_bank_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lineage_id = Column(String(64), nullable=False, default="", index=True)
    fingerprint = Column(String(64), nullable=False, unique=True, index=True)
    question = Column(Text, nullable=False)
    question_type = Column(String(32), nullable=False, default="general", index=True)
    difficulty = Column(String(16), nullable=False, default="medium", index=True)
    status = Column(String(24), nullable=False, default="draft", index=True)
    version = Column(Integer, nullable=False, default=1)
    expected_laws = Column(JSON, nullable=False, default=list)
    expected_articles = Column(JSON, nullable=False, default=list)
    expected_judgments = Column(JSON, nullable=False, default=list)
    reference_answer = Column(Text, nullable=False, default="")
    rubric = Column(JSON, nullable=False, default=dict)
    tags = Column(JSON, nullable=False, default=list)
    visibility = Column(String(16), nullable=False, default="shared")
    source = Column(String(32), nullable=False, default="manual")
    notes = Column(Text, nullable=False, default="")
    created_by = Column(String(120), nullable=False, default="")
    reviewed_by = Column(String(120), nullable=False, default="")
    review_comment = Column(Text, nullable=False, default="")
    content_hash = Column(String(64), nullable=False, default="")
    stale = Column(Boolean, nullable=False, default=False, index=True)
    stale_reason = Column(Text, nullable=False, default="")
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )

    __table_args__ = (
        Index("ix_question_bank_status_updated", "status", "updated_at"),
        Index("ix_question_bank_type_difficulty", "question_type", "difficulty"),
    )


class QuestionBankItemVersion(Base):
    __tablename__ = "question_bank_item_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(
        Integer, ForeignKey("question_bank_items.id"), nullable=False, index=True
    )
    version = Column(Integer, nullable=False)
    snapshot = Column(JSON, nullable=False, default=dict)
    editor = Column(String(120), nullable=False, default="")
    change_note = Column(Text, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint("item_id", "version", name="uq_question_bank_item_version"),
        Index("ix_question_bank_versions_item_version", "item_id", "version"),
    )


class QuestionBankReview(Base):
    __tablename__ = "question_bank_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item_id = Column(
        Integer, ForeignKey("question_bank_items.id"), nullable=False, index=True
    )
    item_version = Column(Integer, nullable=False)
    reviewer = Column(String(120), nullable=False, default="")
    decision = Column(String(24), nullable=False, default="", index=True)
    rubric_scores = Column(JSON, nullable=False, default=dict)
    comment = Column(Text, nullable=False, default="")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        Index("ix_question_bank_reviews_item_created", "item_id", "created_at"),
    )


class BenchmarkSuite(Base):
    __tablename__ = "benchmark_suites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True, index=True)
    tier = Column(String(16), nullable=False, default="core", index=True)
    version = Column(Integer, nullable=False, default=1)
    description = Column(Text, nullable=False, default="")
    status = Column(String(16), nullable=False, default="draft", index=True)
    created_by = Column(String(120), nullable=False, default="")
    frozen_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )


class BenchmarkSuiteItem(Base):
    __tablename__ = "benchmark_suite_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    suite_id = Column(
        Integer, ForeignKey("benchmark_suites.id"), nullable=False, index=True
    )
    item_id = Column(
        Integer, ForeignKey("question_bank_items.id"), nullable=False, index=True
    )
    item_version = Column(Integer, nullable=False, default=1)
    weight = Column(Integer, nullable=False, default=1)
    enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)

    __table_args__ = (
        UniqueConstraint("suite_id", "item_id", name="uq_benchmark_suite_item"),
        Index("ix_benchmark_suite_items_suite", "suite_id"),
    )


class BenchmarkRun(Base):
    __tablename__ = "benchmark_runs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(64), nullable=False, unique=True, index=True)
    suite_id = Column(
        Integer, ForeignKey("benchmark_suites.id"), nullable=False, index=True
    )
    label = Column(String(200), nullable=False, default="")
    status = Column(String(16), nullable=False, default="running", index=True)
    progress = Column(Integer, nullable=False, default=0)
    total_cases = Column(Integer, nullable=False, default=0)
    completed_cases = Column(Integer, nullable=False, default=0)
    suite_version = Column(Integer, nullable=False, default=1)
    config = Column(JSON, nullable=False, default=dict)
    config_hash = Column(String(64), nullable=False, default="")
    suite_snapshot = Column(JSON, nullable=False, default=dict)
    index_version = Column(JSON, nullable=False, default=dict)
    started_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )
    summary = Column(JSON, nullable=False, default=dict)
    error_message = Column(Text, nullable=True)
    created_by = Column(String(120), nullable=False, default="")

    __table_args__ = (
        Index("ix_benchmark_runs_status_started", "status", "started_at"),
        Index("ix_benchmark_runs_suite_started", "suite_id", "started_at"),
    )


class BenchmarkCaseResult(Base):
    __tablename__ = "benchmark_case_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(
        String(64), ForeignKey("benchmark_runs.run_id"), nullable=False, index=True
    )
    item_id = Column(Integer, nullable=False, index=True)
    item_version = Column(Integer, nullable=False, default=1)
    fingerprint = Column(String(64), nullable=False, default="", index=True)
    repeat_index = Column(Integer, nullable=False, default=0)
    question = Column(Text, nullable=False, default="")
    status = Column(String(24), nullable=False, default="pending", index=True)
    answer = Column(Text, nullable=False, default="")
    answer_source = Column(String(32), nullable=False, default="")
    citations = Column(JSON, nullable=False, default=list)
    law_sources = Column(JSON, nullable=False, default=list)
    retrieval = Column(JSON, nullable=False, default=dict)
    coverage = Column(JSON, nullable=False, default=dict)
    metrics = Column(JSON, nullable=False, default=dict)
    stage_ms = Column(JSON, nullable=False, default=dict)
    flow = Column(JSON, nullable=True, default=dict)
    judge = Column(JSON, nullable=False, default=dict)
    human_review = Column(JSON, nullable=False, default=dict)
    duration_ms = Column(Integer, nullable=False, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "run_id",
            "item_id",
            "item_version",
            "repeat_index",
            name="uq_benchmark_case_result",
        ),
        Index("ix_benchmark_case_results_run_status", "run_id", "status"),
    )


class DemoSettings(Base):
    __tablename__ = "demo_settings"

    id = Column(SmallInteger, primary_key=True, default=1)
    enabled = Column(Boolean, nullable=False, default=False)
    allow_rag = Column(Boolean, nullable=False, default=False)
    allow_data = Column(Boolean, nullable=False, default=False)
    allow_quality = Column(Boolean, nullable=False, default=False)
    allow_performance = Column(Boolean, nullable=False, default=False)
    allow_processing = Column(Boolean, nullable=False, default=False)
    allow_status = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )
    updated_by = Column(String(320), nullable=False, default="")
    version = Column(Integer, nullable=False, default=1)

    __table_args__ = (
        CheckConstraint("id = 1", name="ck_demo_settings_singleton"),
    )


class DemoModeAudit(Base):
    __tablename__ = "demo_mode_audit"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_email = Column(String(320), nullable=False, default="")
    action = Column(String(32), nullable=False)
    before = Column(JSON, nullable=True)
    after = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )


class SecurityAuditEvent(Base):
    __tablename__ = "security_audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    event_type = Column(String(64), nullable=False, index=True)
    outcome = Column(String(16), nullable=False, default="success", index=True)
    actor = Column(String(320), nullable=False, default="")
    source = Column(String(32), nullable=False, default="")
    client_ip_hash = Column(String(64), nullable=False, default="")
    request_id = Column(String(64), nullable=False, default="")
    method = Column(String(16), nullable=False, default="")
    path = Column(String(300), nullable=False, default="")
    detail = Column(JSON, nullable=False, default=dict)

    __table_args__ = (
        Index("ix_security_audit_event_created", "event_type", "created_at"),
        Index("ix_security_audit_outcome_created", "outcome", "created_at"),
    )


class DemoUsageDaily(Base):
    __tablename__ = "demo_usage_daily"

    usage_date = Column(Date, primary_key=True)
    requests = Column(Integer, nullable=False, default=0)
    tokens = Column(BigInteger, nullable=False, default=0)
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )


class RagShareSnapshot(Base):
    __tablename__ = "rag_share_snapshots"

    token = Column(String(64), primary_key=True)
    title = Column(String(200), nullable=False, default="")
    turns = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow
    )
    expires_at = Column(
        DateTime(timezone=True), nullable=False, index=True
    )


class RagInteraction(Base):
    """Server-side snapshot of one RAG answer.

    The frontend never supplies the question or answer for feedback.  It sends
    only ``request_id`` and a signed capability token; the backend loads this
    row so the replay cannot be forged or mixed with another visitor.
    """

    __tablename__ = "rag_interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(64), nullable=False, unique=True, index=True)
    question = Column(Text, nullable=False, default="")
    answer = Column(Text, nullable=False, default="")
    answer_source = Column(String(32), nullable=False, default="")
    status = Column(String(32), nullable=False, default="")
    notice = Column(Text, nullable=False, default="")
    response_snapshot = Column(JSON, nullable=False, default=dict)
    snapshot_version = Column(SmallInteger, nullable=False, default=1)
    system_version = Column(JSON, nullable=False, default=dict)
    client_key_hash = Column(String(64), nullable=False, default="", index=True)
    is_demo = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    expires_at = Column(
        DateTime(timezone=True), nullable=False, index=True
    )

    __table_args__ = (
        Index("ix_rag_interactions_source_created", "answer_source", "created_at"),
        Index("ix_rag_interactions_demo_created", "is_demo", "created_at"),
    )


class RagFeedback(Base):
    __tablename__ = "rag_feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    interaction_id = Column(
        Integer,
        ForeignKey("rag_interactions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    request_id = Column(String(64), nullable=False, index=True)
    client_key_hash = Column(String(64), nullable=False, default="", index=True)

    sentiment = Column(String(16), nullable=False)
    primary_reason = Column(String(40), nullable=False, default="")
    comment = Column(Text, nullable=False, default="")

    snapshot = Column(JSON, nullable=False, default=dict)
    snapshot_version = Column(SmallInteger, nullable=False, default=1)
    system_version = Column(JSON, nullable=False, default=dict)

    revision = Column(Integer, nullable=False, default=1)
    editable_until = Column(DateTime(timezone=True), nullable=False)
    expires_at = Column(
        DateTime(timezone=True), nullable=False, index=True
    )

    status = Column(String(24), nullable=False, default="new", index=True)
    severity = Column(String(16), nullable=False, default="medium")
    actionable = Column(Boolean, nullable=False, default=False)
    expected_behavior = Column(Text, nullable=False, default="")
    root_cause_stage = Column(
        String(32), nullable=False, default="unknown", index=True
    )
    answer_verdict = Column(String(16), nullable=False, default="unknown")
    expected_answer_mode = Column(
        String(24), nullable=False, default="unknown"
    )
    expected_refusal = Column(
        String(16), nullable=False, default="unspecified"
    )
    expected_date_from = Column(Date, nullable=True)
    expected_date_to = Column(Date, nullable=True)
    citation_verdicts = Column(JSON, nullable=False, default=dict)
    linked_question_id = Column(
        Integer,
        ForeignKey("question_bank_items.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    linked_pr_url = Column(Text, nullable=False, default="")

    is_demo = Column(Boolean, nullable=False, default=False)
    reviewed_by = Column(String(120), nullable=False, default="")
    review_comment = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
    updated_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint(
            "request_id",
            "client_key_hash",
            name="uq_rag_feedback_request_client",
        ),
        CheckConstraint(
            "sentiment IN ('satisfied', 'unsatisfied')",
            name="ck_rag_feedback_sentiment",
        ),
        CheckConstraint(
            "status IN ('new', 'triaged', 'planned', 'resolved', 'dismissed')",
            name="ck_rag_feedback_status",
        ),
        CheckConstraint(
            "severity IN ('low', 'medium', 'high')",
            name="ck_rag_feedback_severity",
        ),
        Index("ix_rag_feedback_sentiment_created", "sentiment", "created_at"),
        Index("ix_rag_feedback_status_created", "status", "created_at"),
        Index("ix_rag_feedback_reason_created", "primary_reason", "created_at"),
    )


class RagFeedbackReason(Base):
    __tablename__ = "rag_feedback_reasons"

    feedback_id = Column(
        Integer,
        ForeignKey("rag_feedback.id", ondelete="CASCADE"),
        primary_key=True,
    )
    reason_code = Column(String(40), primary_key=True)

    __table_args__ = (
        Index("ix_rag_feedback_reasons_code", "reason_code"),
    )


class RagFeedbackEvent(Base):
    __tablename__ = "rag_feedback_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    feedback_id = Column(
        Integer,
        ForeignKey("rag_feedback.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type = Column(String(32), nullable=False)
    from_status = Column(String(24), nullable=False, default="")
    to_status = Column(String(24), nullable=False, default="")
    actor = Column(String(120), nullable=False, default="")
    comment = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )

    __table_args__ = (
        Index("ix_rag_feedback_events_created", "feedback_id", "created_at"),
    )


class RagFeedbackExport(Base):
    __tablename__ = "rag_feedback_exports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filter_json = Column(JSON, nullable=False, default=dict)
    feedback_ids = Column(JSON, nullable=False, default=list)
    format = Column(String(16), nullable=False, default="jsonl")
    status = Column(String(24), nullable=False, default="created")
    model = Column(String(120), nullable=False, default="")
    prompt_version = Column(String(80), nullable=False, default="")
    pr_url = Column(Text, nullable=False, default="")
    created_at = Column(
        DateTime(timezone=True), nullable=False, default=utcnow, index=True
    )
