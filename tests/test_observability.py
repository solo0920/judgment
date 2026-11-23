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
    record_decision,
    record_performance,
    start_flow,
    trace_decision,
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


def test_flow_trace_listener_receives_live_segment_events() -> None:
    events = []
    flow = start_flow(
        request_id="request-live",
        entrypoint="/api/test",
        listener=events.append,
    )
    with trace_segment("outer.live", module="test.flow"):
        with trace_segment("inner.live", module="test.flow"):
            pass
    flow.finish(status="success")
    clear_flow()

    starts = [event for event in events if event["type"] == "segment_start"]
    ends = [event for event in events if event["type"] == "segment_end"]
    assert [event["segment"]["name"] for event in starts] == [
        "outer.live",
        "inner.live",
    ]
    assert [event["segment"]["name"] for event in ends] == [
        "inner.live",
        "outer.live",
    ]
    assert starts[0]["segment"]["depth"] == 0
    assert starts[1]["segment"]["depth"] == 1
    assert all(event["segment"]["seq"] for event in starts)


def test_flow_trace_records_decision_options_and_selection() -> None:
    flow = start_flow(
        request_id="request-decision",
        entrypoint="/api/rag/query",
    )
    with trace_decision(
        "route.plan",
        stage="routing",
        question="要走哪一條檢索路徑？",
        method="query_plan.build_query_plan",
    ) as decision:
        decision.option(
            "structured_list",
            "結構化列舉",
            reason="沒有可列舉條件",
        )
        decision.option(
            "structured_semantic",
            "套 filter 的向量檢索",
            selected=True,
            reason="只有相對日期",
        )
        decision.skip(
            "llm",
            "LLM 生成",
            reason="前面已選定檢索路徑，未評估",
        )
        decision.select("structured_semantic")
        decision.result({"dense": True, "enumerate": False})
    payload = flow.finish(status="success")
    clear_flow()

    trace = payload["decisions"][0]
    assert trace["id"] == "route.plan"
    assert trace["stage"] == "routing"
    assert trace["selected"] == "structured_semantic"
    assert trace["result"] == {"dense": True, "enumerate": False}
    assert trace["options"][1]["selected"] is True
    assert trace["options"][2]["evaluated"] is False
    assert trace["options"][2]["reason"].startswith("前面已選定")
    assert payload["summary"]["decision_count"] == 1
    assert payload["decision_version"] == 1


def test_record_decision_is_noop_without_flow() -> None:
    clear_flow()
    record_decision(
        "parse.query",
        stage="parsing",
        question="?",
        method="test",
        options=[{"id": "none", "label": "none", "selected": True}],
        selected="none",
    )
    assert current_flow() is None


def test_flow_trace_caps_decision_count_and_options() -> None:
    flow = start_flow(request_id="request-decision-cap", entrypoint="/api/test")
    for index in range(45):
        record_decision(
            f"step.{index}",
            stage="parsing",
            question="?",
            method="test",
        )
    payload = flow.finish(status="success")
    assert len(payload["decisions"]) == 40

    clear_flow()
    option_flow = start_flow(
        request_id="request-option-cap",
        entrypoint="/api/test",
    )
    with trace_decision(
        "many.options",
        stage="parsing",
        question="?",
        method="test",
    ) as decision:
        for index in range(20):
            decision.option(f"o{index}", f"option {index}")
    option_payload = option_flow.finish(status="success")
    clear_flow()

    assert len(option_payload["decisions"][0]["options"]) == 12


def test_flow_trace_listener_receives_decision_event() -> None:
    events = []
    flow = start_flow(
        request_id="request-decision-live",
        entrypoint="/api/rag/query",
        listener=events.append,
    )
    record_decision(
        "parse.query",
        stage="parsing",
        question="日期語意？",
        method="query_parser.parse_judgment_query",
        options=[
            {
                "id": "relative_range",
                "label": "相對日期",
                "selected": True,
                "evaluated": True,
                "reason": "近二年",
            }
        ],
        selected="relative_range",
        result={"date_from": "2024-11-23"},
    )
    flow.finish(status="success")
    clear_flow()

    decisions = [event for event in events if event["type"] == "decision"]
    assert len(decisions) == 1
    assert decisions[0]["decision"]["selected"] == "relative_range"
    assert decisions[0]["decision"]["options"][0]["evaluated"] is True
