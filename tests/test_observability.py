from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import create_engine, inspect, select, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.db import init_db
from judgment.models import Base, PerformanceRecord
from judgment.observability import (
    clear_flow,
    current_flow,
    record_performance,
    start_flow,
    trace_segment,
    traced,
)


def test_flow_trace_nests_segments_and_summary() -> None:
    @traced(
        "outer",
        module="test.flow",
        params_fn=lambda value: {"value": value, "model": "test-model"},
    )
    def outer(value: int) -> int:
        with trace_segment(
            "inner",
            module="test.flow",
            function="inner_func",
            params={"step": 1},
        ):
            return value * 2

    flow = start_flow(
        request_id="request-123",
        entrypoint="/api/test",
        method="POST",
        path="/api/test",
        params={"page": 1},
    )
    assert current_flow() is flow
    assert outer(2) == 4
    payload = flow.finish(status="success")
    clear_flow()

    assert payload["request_id"] == "request-123"
    assert payload["status"] == "success"
    assert payload["summary"]["segment_count"] == 2
    assert payload["summary"]["models"] == ["test-model"]
    outer_segment = next(s for s in payload["segments"] if s["name"] == "outer")
    inner_segment = next(s for s in payload["segments"] if s["name"] == "inner")
    assert inner_segment["parent_seq"] == outer_segment["seq"]
    assert inner_segment["depth"] == 1
    assert inner_segment["params"] == {"step": 1}
    assert inner_segment["param_names"] == ["step"]
    assert inner_segment["duration_ms"] >= 0
    assert payload["summary"]["by_name"]["inner"]["count"] == 1


def test_flow_trace_marks_failed_segment() -> None:
    @traced("explode", module="test.flow")
    def explode() -> None:
        raise ValueError("bad input")

    flow = start_flow(request_id="request-456", entrypoint="/api/test")
    with pytest.raises(ValueError):
        explode()
    payload = flow.finish(status="failed", error_message="ValueError: bad input")
    clear_flow()

    assert payload["status"] == "failed"
    assert payload["segments"][0]["status"] == "error"
    assert "bad input" in payload["segments"][0]["error"]


def test_init_db_adds_flow_column_to_old_performance_table(tmp_path: Path) -> None:
    database = tmp_path / "old.db"
    engine = create_engine(f"sqlite+pysqlite:///{database}", future=True)
    with engine.begin() as connection:
        connection.execute(
            text(
                "CREATE TABLE performance_records ("
                "id INTEGER PRIMARY KEY, request_id VARCHAR(64), "
                "process VARCHAR(200), module VARCHAR(300), method VARCHAR(16), "
                "path TEXT, status VARCHAR(16), status_code INTEGER, "
                "started_at DATETIME, finished_at DATETIME, duration_ms INTEGER, "
                "params JSON, details JSON, error_message TEXT)"
            )
        )

    init_db(engine)
    columns = {
        column["name"]
        for column in inspect(engine).get_columns("performance_records")
    }
    assert "flow" in columns


def test_record_performance_builds_summary_flow_for_cli_records() -> None:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )

    record_performance(
        session_factory,
        process="CLI 匯入",
        module="judgment.import",
        duration_ms=120,
        params={"model": "bge-m3", "batch_size": 16},
        details={"rows": 3},
    )

    with session_factory() as session:
        record = session.scalars(select(PerformanceRecord)).one()
    assert record.flow["segments"][0]["module"] == "judgment.import"
    assert record.flow["segments"][0]["param_names"] == ["batch_size", "model"]
    assert record.flow["summary"]["models"] == ["bge-m3"]
    assert record.flow["details"] == {"rows": 3}
    assert record.flow["metadata"]["source"] == "summary"
