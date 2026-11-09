from __future__ import annotations

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .models import Base


def build_engine(database_url: str) -> Engine:
    return create_engine(database_url, pool_pre_ping=True, future=True)


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


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)
    _ensure_judgment_court_normalized(engine)
    _ensure_performance_flow(engine)
    _ensure_performance_test_columns(engine)
    from .index_versions import ensure_index_version_schema

    ensure_index_version_schema(engine)
