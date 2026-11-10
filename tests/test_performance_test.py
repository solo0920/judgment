from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.db import build_session_factory
from judgment.models import (
    Base,
    JudgmentDocument,
    PerformanceTestRun,
    PerformanceTestStep,
)
from judgment.performance_test import (
    available_test_models,
    get_test_run,
    run_test_mode,
)
from judgment.runtime_settings import get_test_mode, set_test_mode


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("data/laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
        "judgment_vector_collection": "judgment_documents",
        "embedding_url": "http://ollama.test",
        "embedding_model": "bge-m3",
        "llm_url": "http://ollama.test",
        "llm_model": "gemma3:27b",
    }
    values.update(overrides)
    return Settings(**values)


def _session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return build_session_factory(engine)


def _seed_judgment(session_factory) -> None:
    with session_factory() as session:
        text = (
            "臺灣臺北地方法院民事判決 114年度訴字第1號\n"
            "原告主張被告向其借款，屆期未清償。\n"
            "本院審酌借據與匯款紀錄，認原告主張為有理由。"
        )
        session.add(
            JudgmentDocument(
                jid="TPDV,114,訴,1,20260101,1",
                jyear="114",
                jcase="訴",
                jno="1",
                jdate="20260101",
                court="臺灣臺北地方法院民事",
                court_normalized="臺灣臺北地方法院",
                title="清償借款",
                full_text=text,
                full_text_length=len(text),
                content_hash="a" * 64,
                matched_laws=["民法"],
                matched_laws_text="民法",
                citations=[{"law_name": "民法", "article_no": "第 1 條"}],
                citation_count=1,
                source_archive="test.rar",
            )
        )
        session.commit()


class FakeStore:
    def search(self, collection, vector, **kwargs):
        return [
            {
                "score": 0.91,
                "payload": {
                    "jid": "TPDV,114,訴,1,20260101,1",
                    "court": "臺灣臺北地方法院",
                    "title": "清償借款",
                    "jdate": "20260101",
                    "matched_laws": ["民法"],
                },
            }
        ]


class FakeEmbedder:
    def __init__(self, *args, **kwargs):
        pass

    def embed_query(self, text):
        return [0.1, 0.2, 0.3]


def test_test_mode_setting_roundtrip() -> None:
    session_factory = _session_factory()
    assert get_test_mode(session_factory) is False

    set_test_mode(session_factory, True)
    assert get_test_mode(session_factory) is True

    set_test_mode(session_factory, False)
    assert get_test_mode(session_factory) is False


def test_available_test_models_classifies_ollama_models(monkeypatch) -> None:
    session_factory = _session_factory()
    models = [
        "phonon:latest",
        "granite4:small-h",
        "command-r:latest",
        "gemma3:27b",
        "qllama/bge-reranker-v2-m3:latest",
        "bge-m3:latest",
    ]
    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail",
        lambda base_url, timeout=2.5: {
            "status": "operational",
            "models": models,
            "detail": "6 個模型",
        },
    )

    def fake_probe(base_url, model, **kwargs):
        supports = model not in {"phonon:latest", "bge-m3:latest"}
        return {
            "ok": True,
            "supports_chat": supports,
            "capabilities": ["completion"] if supports else ["other"],
            "detail": "probe",
            "method": "show",
        }

    monkeypatch.setattr(
        "judgment.llm_capabilities.probe_model_capability", fake_probe
    )
    result = available_test_models(
        _settings(), session_factory=session_factory
    )
    assert result["embedding"] == ["bge-m3"]
    assert result["llm"][0] == "gemma3:27b"
    assert "command-r:latest" in result["llm"]
    assert "granite4:small-h" in result["llm"]
    assert "phonon:latest" not in result["llm"]
    assert all("reranker" not in item for item in result["llm"])
    assert result["source"] == "ollama"
    assert set(result["capability"]["tested_now"]) == set(models)


def test_run_test_mode_persists_run_and_steps(monkeypatch) -> None:
    session_factory = _session_factory()
    _seed_judgment(session_factory)
    monkeypatch.setattr(
        "judgment.performance_test.available_test_models",
        lambda settings, session_factory=None: {
            "embedding": ["fake-embed"],
            "llm": ["fake-llm"],
            "available": ["fake-embed", "fake-llm"],
            "source": "test",
        },
    )
    monkeypatch.setattr(
        "judgment.performance_test.OllamaEmbedder", FakeEmbedder
    )
    monkeypatch.setattr(
        "judgment.performance_test.generate_answer_with_model",
        lambda **kwargs: "依檢索到的判決，原告可請求返還借款 [1]。",
    )

    payload = run_test_mode(
        session_factory=session_factory,
        question="原告如何請求返還借款？",
        settings=_settings(),
        coverage={
            "total_judgments": 1,
            "indexed_judgments": 1,
            "remaining_judgments": 0,
            "collection": "judgment_documents",
            "model": "bge-m3",
            "latest_indexed_at": None,
        },
        store=FakeStore(),
        request_id="test-request-1",
    )

    assert payload["status"] == "operational"
    assert payload["test_run"]["status"] == "success"
    assert payload["test_run"]["primary_model"] == "fake-llm"
    assert len(payload["judgments"]) == 1
    assert payload["answer"].endswith("[1]。")

    with session_factory() as session:
        run = session.scalars(select(PerformanceTestRun)).one()
        steps = session.scalars(
            select(PerformanceTestStep).order_by(PerformanceTestStep.id)
        ).all()
    assert run.status == "success"
    assert run.progress == 100
    assert run.answer.endswith("[1]。")
    assert len(steps) == 5
    assert [step.stage for step in steps] == [
        "embedding",
        "retrieval",
        "context",
        "llm",
        "validation",
    ]
    assert all(step.module and step.function for step in steps)
    assert all(step.status == "success" for step in steps)
    serialized = get_test_run(session_factory, run.run_id)
    assert serialized is not None
    assert serialized["run_id"] == run.run_id
    assert serialized["answer"] == run.answer
    assert len(serialized["steps"]) == 5
    assert all(step["module"] and step["function"] for step in serialized["steps"])
