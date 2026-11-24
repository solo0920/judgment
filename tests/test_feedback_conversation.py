from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.models import Base, RagInteraction
from judgment.web.feedback import (
    get_feedback,
    record_interaction,
    submit_feedback,
)

CONVERSATION = "11111111-1111-4111-8111-111111111111"
OTHER_CONVERSATION = "22222222-2222-4222-8222-222222222222"


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    yield factory
    engine.dispose()


def _settings(**overrides) -> Settings:
    base = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("."),
        law_api_url="",
        order_api_url="",
        feedback_secret="test-feedback-secret-0123456789abcdef",
        rag_conversation_max_turns=50,
        rag_conversation_daily_limit=20,
    )
    return replace(base, **overrides)


def _answer(
    factory, request_id: str, conversation_id: str, question: str, client_ip: str
):
    return record_interaction(
        factory,
        _settings(),
        request_id=request_id,
        conversation_id=conversation_id,
        question=question,
        result={"answer": f"answer {request_id}", "status": "operational"},
        pipeline_flow=None,
        client_ip=client_ip,
        is_demo=False,
    )


def _feedback(factory, info, request_id: str, client_ip: str) -> int:
    payload = submit_feedback(
        factory,
        _settings(),
        request_id=request_id,
        feedback_token=info["token"],
        sentiment="unsatisfied",
        reasons=["incomplete"],
        comment="",
        feedback_scope="conversation",
        client_ip=client_ip,
        is_demo=False,
    )
    return int(payload["id"])


def test_conversation_timeline_is_bound_to_the_same_client(session_factory) -> None:
    first = _answer(
        session_factory, "request-a1", CONVERSATION, "question a1", "1.1.1.1"
    )
    second = _answer(
        session_factory, "request-a2", CONVERSATION, "question a2", "1.1.1.1"
    )
    foreign = _answer(
        session_factory, "request-b1", CONVERSATION, "question b1", "2.2.2.2"
    )
    assert first and second and foreign

    feedback_id = _feedback(session_factory, second, "request-a2", "1.1.1.1")
    detail = get_feedback(session_factory, feedback_id)
    assert [turn["question"] for turn in detail["conversation"]] == [
        "question a1",
        "question a2",
    ]
    assert all("question b1" not in turn["question"] for turn in detail["conversation"])

    foreign_feedback = _feedback(session_factory, foreign, "request-b1", "2.2.2.2")
    foreign_detail = get_feedback(session_factory, foreign_feedback)
    assert foreign_detail["conversation"] == []

    with session_factory() as session:
        foreign_row = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == "request-b1"
            )
        ).one()
        assert foreign_row.conversation_id == ""


def test_conversation_rejects_non_uuid_and_enforces_turn_limit(session_factory) -> None:
    invalid = record_interaction(
        session_factory,
        _settings(),
        request_id="request-invalid",
        conversation_id="not-a-uuid",
        question="question",
        result={"answer": "answer", "status": "operational"},
        pipeline_flow=None,
        client_ip="1.1.1.1",
        is_demo=False,
    )
    assert invalid
    with session_factory() as session:
        row = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == "request-invalid"
            )
        ).one()
        assert row.conversation_id == ""

    limited = _settings(rag_conversation_max_turns=2)
    for index in range(3):
        record_interaction(
            session_factory,
            limited,
            request_id=f"request-limit-{index}",
            conversation_id=CONVERSATION,
            question=f"question {index}",
            result={"answer": "answer", "status": "operational"},
            pipeline_flow=None,
            client_ip="3.3.3.3",
            is_demo=False,
        )
    with session_factory() as session:
        rows = session.scalars(
            select(RagInteraction)
            .where(RagInteraction.request_id.like("request-limit-%"))
            .order_by(RagInteraction.request_id)
        ).all()
        assert [row.turn_index for row in rows] == [0, 1, 0]
        assert rows[2].conversation_id == ""


def test_conversation_daily_limit_caps_new_conversations(session_factory) -> None:
    limited = _settings(rag_conversation_daily_limit=1)
    record_interaction(
        session_factory,
        limited,
        request_id="request-daily-a",
        conversation_id=CONVERSATION,
        question="question a",
        result={"answer": "answer", "status": "operational"},
        pipeline_flow=None,
        client_ip="4.4.4.4",
        is_demo=False,
    )
    record_interaction(
        session_factory,
        limited,
        request_id="request-daily-b",
        conversation_id=OTHER_CONVERSATION,
        question="question b",
        result={"answer": "answer", "status": "operational"},
        pipeline_flow=None,
        client_ip="4.4.4.4",
        is_demo=False,
    )
    with session_factory() as session:
        second = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == "request-daily-b"
            )
        ).one()
        assert second.conversation_id == ""
