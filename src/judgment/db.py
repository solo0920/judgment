from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .models import Base
from .version_codes import version_code_for_datetime


def build_engine(
    database_url: str,
    *,
    pool_size: Optional[int] = None,
    max_overflow: Optional[int] = None,
    pool_timeout: float = 30.0,
) -> Engine:
    kwargs = {"pool_pre_ping": True, "future": True}
    if not str(database_url).startswith("sqlite"):
        if pool_size is not None:
            kwargs["pool_size"] = max(1, int(pool_size))
        if max_overflow is not None:
            kwargs["max_overflow"] = max(0, int(max_overflow))
        kwargs["pool_timeout"] = max(0.1, float(pool_timeout))
    return create_engine(database_url, **kwargs)


def apply_statement_timeout(engine: Engine, timeout_ms: int) -> None:
    """Bound scheduled-report queries on PostgreSQL.

    SQLite ignores this helper.  The value is clamped to a positive integer
    so it can be used safely in the SET statement.
    """

    if not str(engine.url).startswith("postgres"):
        return
    timeout = max(1000, min(300000, int(timeout_ms or 30000)))

    @event.listens_for(engine, "connect")
    def _set_statement_timeout(dbapi_connection, _record) -> None:
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute(f"SET statement_timeout = {timeout}")
        finally:
            cursor.close()


def build_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(
        bind=engine,
        autoflush=False,
        expire_on_commit=False,
        future=True,
    )


def _ensure_judgment_court_normalized(engine: Engine) -> None:
    """Add court_normalized to databases created before the column existed."""

    inspector = inspect(engine)
    if "judgment_documents" not in inspector.get_table_names():
        return
    columns = {column["name"] for column in inspector.get_columns("judgment_documents")}
    if "court_normalized" in columns:
        return
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE judgment_documents "
                "ADD COLUMN court_normalized TEXT NOT NULL DEFAULT ''"
            )
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_judgment_documents_court_normalized "
                "ON judgment_documents (court_normalized)"
            )
        )


def _ensure_performance_flow(engine: Engine) -> None:
    """Add flow JSON to databases created before the column existed."""

    inspector = inspect(engine)
    if "performance_records" not in inspector.get_table_names():
        return
    columns = {
        column["name"] for column in inspector.get_columns("performance_records")
    }
    if "flow" in columns:
        return
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE performance_records ADD COLUMN flow JSON")
        )


def _ensure_performance_test_columns(engine: Engine) -> None:
    """Add answer/module/function to pre-existing test-run tables."""

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "performance_test_runs" in tables:
        columns = {
            column["name"]
            for column in inspector.get_columns("performance_test_runs")
        }
        if "answer" not in columns:
            with engine.begin() as connection:
                connection.execute(
                    text("ALTER TABLE performance_test_runs ADD COLUMN answer TEXT")
                )
    if "performance_test_steps" in tables:
        columns = {
            column["name"]
            for column in inspector.get_columns("performance_test_steps")
        }
        additions = []
        if "module" not in columns:
            additions.append(
                "ADD COLUMN module VARCHAR(300) NOT NULL DEFAULT ''"
            )
        if "function" not in columns:
            additions.append(
                "ADD COLUMN function VARCHAR(300) NOT NULL DEFAULT ''"
            )
        if additions:
            with engine.begin() as connection:
                for addition in additions:
                    connection.execute(
                        text(
                            "ALTER TABLE performance_test_steps " + addition
                        )
                    )


def _ensure_ollama_host_priority(engine: Engine) -> None:
    """Add the embedding failover priority to older Ollama host tables."""

    inspector = inspect(engine)
    if "ollama_hosts" not in inspector.get_table_names():
        return
    columns = {
        column["name"] for column in inspector.get_columns("ollama_hosts")
    }
    if "priority" in columns:
        return
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE ollama_hosts "
                "ADD COLUMN priority INTEGER NOT NULL DEFAULT 100"
            )
        )
        # Preserve the previously active host as the first priority while
        # keeping the remaining hosts in their existing id order.
        connection.execute(text("UPDATE ollama_hosts SET priority = id * 10"))
        connection.execute(
            text(
                "UPDATE ollama_hosts SET priority = 0 "
                "WHERE is_active = TRUE"
            )
        )


def _ensure_judgment_versioning(engine: Engine) -> None:
    """Add snapshot/version columns to pre-existing judgment tables."""

    inspector = inspect(engine)
    if "judgment_documents" not in inspector.get_table_names():
        return
    columns = {
        column["name"] for column in inspector.get_columns("judgment_documents")
    }
    additions = []
    if "issue_month" not in columns:
        additions.append(
            "ADD COLUMN issue_month VARCHAR(6) NOT NULL DEFAULT ''"
        )
    if "first_seen_snapshot_id" not in columns:
        additions.append("ADD COLUMN first_seen_snapshot_id INTEGER")
    if "content_first_seen_snapshot_id" not in columns:
        additions.append(
            "ADD COLUMN content_first_seen_snapshot_id INTEGER"
        )
    if "last_seen_snapshot_id" not in columns:
        additions.append("ADD COLUMN last_seen_snapshot_id INTEGER")
    if "removed_snapshot_id" not in columns:
        additions.append("ADD COLUMN removed_snapshot_id INTEGER")
    if "is_current" not in columns:
        additions.append("ADD COLUMN is_current BOOLEAN NOT NULL DEFAULT TRUE")
    if additions:
        with engine.begin() as connection:
            for addition in additions:
                connection.execute(
                    text("ALTER TABLE judgment_documents " + addition)
                )
    with engine.begin() as connection:
        connection.execute(
            text(
                "UPDATE judgment_documents "
                "SET issue_month = substr(jdate, 1, 6) "
                "WHERE (issue_month IS NULL OR issue_month = '') "
                "AND jdate IS NOT NULL AND length(jdate) >= 6"
            )
        )
        for statement in (
            "CREATE INDEX IF NOT EXISTS ix_judgment_documents_issue_month "
            "ON judgment_documents (issue_month)",
            "CREATE INDEX IF NOT EXISTS ix_judgment_documents_is_current "
            "ON judgment_documents (is_current)",
        ):
            connection.execute(text(statement))


def _ensure_law_version_code(engine: Engine) -> None:
    """Add and backfill the datetime-based law/order download version code."""

    inspector = inspect(engine)
    if "law_dataset_versions" not in inspector.get_table_names():
        return
    columns = {
        column["name"]
        for column in inspector.get_columns("law_dataset_versions")
    }
    with engine.begin() as connection:
        if "version_code" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE law_dataset_versions "
                    "ADD COLUMN version_code VARCHAR(12) NOT NULL DEFAULT ''"
                )
            )
        rows = connection.execute(
            text(
                "SELECT id, downloaded_at FROM law_dataset_versions "
                "WHERE version_code IS NULL OR version_code = ''"
            )
        ).fetchall()
        for row in rows:
            value = row[1]
            moment = value
            if isinstance(value, str):
                try:
                    moment = datetime.fromisoformat(
                        value.replace("Z", "+00:00")
                    )
                except ValueError:
                    moment = None
            elif isinstance(value, datetime):
                moment = value
            else:
                moment = None
            code = version_code_for_datetime(moment)
            connection.execute(
                text(
                    "UPDATE law_dataset_versions SET version_code = :code "
                    "WHERE id = :id"
                ),
                {"code": code, "id": int(row[0])},
            )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS "
                "ix_law_dataset_versions_version_code "
                "ON law_dataset_versions (version_code)"
            )
        )


def _ensure_demo_settings(engine: Engine) -> None:
    """Seed the singleton demo-mode row without enabling it.

    New installs get all six feature flags persisted as enabled but the master
    switch stays off.  A missing row is treated as fully closed by the runtime.
    """

    inspector = inspect(engine)
    if "demo_settings" not in inspector.get_table_names():
        return
    with engine.begin() as connection:
        connection.execute(
            text(
                "INSERT INTO demo_settings ("
                "id, enabled, allow_rag, allow_data, allow_quality, "
                "allow_performance, allow_processing, allow_status, "
                "expires_at, updated_at, updated_by, version"
                ") SELECT 1, :enabled, :rag, :data, :quality, :performance, "
                ":processing, :status, NULL, CURRENT_TIMESTAMP, '', 1 "
                "WHERE NOT EXISTS (SELECT 1 FROM demo_settings WHERE id = 1)"
            ),
            {
                "enabled": False,
                "rag": True,
                "data": True,
                "quality": True,
                "performance": True,
                "processing": True,
                "status": True,
            },
        )


def _ensure_rag_feedback_triage_columns(engine: Engine) -> None:
    """Add structured triage fields to an existing rag_feedback table."""

    inspector = inspect(engine)
    if "rag_feedback" not in inspector.get_table_names():
        return
    columns = {
        column["name"] for column in inspector.get_columns("rag_feedback")
    }
    additions = [
        (
            "root_cause_stage",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "root_cause_stage VARCHAR(32) NOT NULL DEFAULT 'unknown'",
        ),
        (
            "answer_verdict",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "answer_verdict VARCHAR(16) NOT NULL DEFAULT 'unknown'",
        ),
        (
            "expected_answer_mode",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "expected_answer_mode VARCHAR(24) NOT NULL DEFAULT 'unknown'",
        ),
        (
            "expected_refusal",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "expected_refusal VARCHAR(16) NOT NULL DEFAULT 'unspecified'",
        ),
        (
            "expected_date_from",
            "ALTER TABLE rag_feedback ADD COLUMN expected_date_from DATE",
        ),
        (
            "expected_date_to",
            "ALTER TABLE rag_feedback ADD COLUMN expected_date_to DATE",
        ),
        (
            "citation_verdicts",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "citation_verdicts JSON NOT NULL DEFAULT '{}'",
        ),
        (
            "issue_id",
            "ALTER TABLE rag_feedback ADD COLUMN issue_id INTEGER",
        ),
        (
            "conversation_id",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "conversation_id VARCHAR(64) NOT NULL DEFAULT ''",
        ),
        (
            "feedback_scope",
            "ALTER TABLE rag_feedback ADD COLUMN "
            "feedback_scope VARCHAR(16) NOT NULL DEFAULT 'turn'",
        ),
    ]
    if not additions:
        return
    with engine.begin() as connection:
        for name, statement in additions:
            if name in columns:
                continue
            connection.execute(text(statement))
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS "
                "ix_rag_feedback_root_cause_stage "
                "ON rag_feedback (root_cause_stage)"
            )
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_rag_feedback_issue_id "
                "ON rag_feedback (issue_id)"
            )
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_rag_feedback_conversation_id "
                "ON rag_feedback (conversation_id)"
            )
        )


def _ensure_rag_feedback_issue_columns(engine: Engine) -> None:
    """Add optimistic-lock version to an existing feedback issue table."""

    inspector = inspect(engine)
    if "rag_feedback_issues" not in inspector.get_table_names():
        return
    columns = {
        column["name"]
        for column in inspector.get_columns("rag_feedback_issues")
    }
    if "version" in columns:
        return
    with engine.begin() as connection:
        connection.execute(
            text(
                "ALTER TABLE rag_feedback_issues ADD COLUMN "
                "version INTEGER NOT NULL DEFAULT 1"
            )
        )


def _ensure_rag_interaction_review_columns(engine: Engine) -> None:
    """Add active-learning review fields to an existing rag_interactions."""

    inspector = inspect(engine)
    if "rag_interactions" not in inspector.get_table_names():
        return
    columns = {
        column["name"]
        for column in inspector.get_columns("rag_interactions")
    }
    additions = [
        (
            "review_status",
            "ALTER TABLE rag_interactions ADD COLUMN "
            "review_status VARCHAR(16) NOT NULL DEFAULT 'new'",
        ),
        (
            "reviewed_by",
            "ALTER TABLE rag_interactions ADD COLUMN "
            "reviewed_by VARCHAR(120) NOT NULL DEFAULT ''",
        ),
        (
            "reviewed_at",
            "ALTER TABLE rag_interactions ADD COLUMN reviewed_at TIMESTAMP",
        ),
        (
            "conversation_id",
            "ALTER TABLE rag_interactions ADD COLUMN "
            "conversation_id VARCHAR(64) NOT NULL DEFAULT ''",
        ),
        (
            "turn_index",
            "ALTER TABLE rag_interactions ADD COLUMN "
            "turn_index INTEGER NOT NULL DEFAULT 0",
        ),
    ]
    with engine.begin() as connection:
        for name, statement in additions:
            if name in columns:
                continue
            connection.execute(text(statement))
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_rag_interactions_review_status "
                "ON rag_interactions (review_status)"
            )
        )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS ix_rag_interactions_conversation_id "
                "ON rag_interactions (conversation_id)"
            )
        )


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)
    _ensure_rag_feedback_triage_columns(engine)
    _ensure_rag_feedback_issue_columns(engine)
    _ensure_rag_interaction_review_columns(engine)
    _ensure_judgment_court_normalized(engine)
    _ensure_judgment_versioning(engine)
    _ensure_law_version_code(engine)
    _ensure_performance_flow(engine)
    _ensure_performance_test_columns(engine)
    _ensure_ollama_host_priority(engine)
    _ensure_demo_settings(engine)
    from .index_versions import ensure_index_version_schema

    ensure_index_version_schema(engine)
