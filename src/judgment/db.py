from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import create_engine, inspect, text
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


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)
    _ensure_judgment_court_normalized(engine)
    _ensure_judgment_versioning(engine)
    _ensure_law_version_code(engine)
    _ensure_performance_flow(engine)
    _ensure_performance_test_columns(engine)
    _ensure_ollama_host_priority(engine)
    _ensure_demo_settings(engine)
    from .index_versions import ensure_index_version_schema

    ensure_index_version_schema(engine)
