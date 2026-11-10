from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.db import build_session_factory
from judgment.llm_capabilities import (
    probe_model_capability,
    refresh_model_capabilities,
)
from judgment.models import Base, OllamaModelCapability, utcnow
from judgment.performance_test import available_test_models


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
        "llm_model": "gemma3:4b",
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


class FakeResponse:
    def __init__(self, payload=None, *, status_code=200, text=""):
        self._payload = payload if payload is not None else {}
        self.status_code = status_code
        self.text = text

    def raise_for_status(self):
        return None

    def json(self):
        return self._payload


def _tags(models):
    return lambda base_url, timeout=2.5: {
        "status": "operational",
        "models": list(models),
        "detail": f"{len(models)} 個模型",
    }


def test_probe_uses_show_completion_capability(monkeypatch) -> None:
    monkeypatch.setattr(
        "judgment.llm_capabilities.httpx.post",
        lambda *args, **kwargs: FakeResponse(
            {"capabilities": ["completion", "vision"]}
        ),
    )
    result = probe_model_capability("http://ollama.test", "gemma3:4b")
    assert result["ok"] is True
    assert result["supports_chat"] is True
    assert result["capabilities"] == ["completion", "vision"]
    assert result["method"] == "show"


def test_probe_rejects_models_without_completion(monkeypatch) -> None:
    monkeypatch.setattr(
        "judgment.llm_capabilities.httpx.post",
        lambda *args, **kwargs: FakeResponse({"capabilities": ["speech"]}),
    )
    result = probe_model_capability("http://ollama.test", "phonon:latest")
    assert result["ok"] is True
    assert result["supports_chat"] is False
    assert result["method"] == "show"


def test_probe_excludes_reranker_even_with_completion(monkeypatch) -> None:
    monkeypatch.setattr(
        "judgment.llm_capabilities.httpx.post",
        lambda *args, **kwargs: FakeResponse({"capabilities": ["completion"]}),
    )
    result = probe_model_capability(
        "http://ollama.test", "qllama/bge-reranker-v2-m3:latest"
    )
    assert result["ok"] is True
    assert result["supports_chat"] is False
    assert "Reranker" in result["detail"]


def test_probe_falls_back_to_chat_when_capabilities_are_absent(
    monkeypatch,
) -> None:
    calls = []

    def fake_post(url, **kwargs):
        calls.append(url)
        if url.endswith("/api/show"):
            return FakeResponse({})
        return FakeResponse({"message": {"content": "pong"}})

    monkeypatch.setattr("judgment.llm_capabilities.httpx.post", fake_post)
    result = probe_model_capability("http://ollama.test", "legacy:latest")
    assert result["ok"] is True
    assert result["supports_chat"] is True
    assert result["method"] == "chat"
    assert calls == [
        "http://ollama.test/api/show",
        "http://ollama.test/api/chat",
    ]


def test_probe_chat_fallback_reports_unsupported(monkeypatch) -> None:
    def fake_post(url, **kwargs):
        if url.endswith("/api/show"):
            return FakeResponse({})
        return FakeResponse(
            {},
            status_code=400,
            text='{"error":"legacy:latest does not support chat"}',
        )

    monkeypatch.setattr("judgment.llm_capabilities.httpx.post", fake_post)
    result = probe_model_capability("http://ollama.test", "legacy:latest")
    assert result["ok"] is True
    assert result["supports_chat"] is False
    assert result["method"] == "chat"


def test_refresh_only_probes_new_models_and_caches_results(monkeypatch) -> None:
    session_factory = _session_factory()
    settings = _settings()
    listed = ["gemma3:4b", "phonon:latest", "bge-m3:latest"]
    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail", _tags(listed)
    )
    calls = []

    def fake_probe(base_url, model, **kwargs):
        calls.append(model)
        supports = model in {"gemma3:4b", "command-r:latest"}
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

    first = refresh_model_capabilities(session_factory, settings)
    assert calls == ["gemma3:4b", "phonon:latest", "bge-m3:latest"]
    assert first["new_models"] == calls
    assert first["tested_now"] == calls
    assert first["chat_models"] == ["gemma3:4b"]

    second = refresh_model_capabilities(session_factory, settings)
    assert calls == ["gemma3:4b", "phonon:latest", "bge-m3:latest"]
    assert second["new_models"] == []
    assert second["tested_now"] == []

    listed.append("command-r:latest")
    third = refresh_model_capabilities(session_factory, settings)
    assert calls[-1] == "command-r:latest"
    assert len(calls) == 4
    assert third["new_models"] == ["command-r:latest"]
    assert third["tested_now"] == ["command-r:latest"]
    assert third["chat_models"] == ["gemma3:4b", "command-r:latest"]

    with session_factory() as session:
        rows = session.scalars(select(OllamaModelCapability)).all()
    assert len(rows) == 4
    assert sum(1 for row in rows if row.supports_chat) == 2


def test_refresh_does_not_cache_transient_failures(monkeypatch) -> None:
    session_factory = _session_factory()
    settings = _settings()
    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail",
        _tags(["gemma3:4b"]),
    )
    results = iter(
        [
            {"ok": False, "error": "ReadTimeout"},
            {
                "ok": True,
                "supports_chat": True,
                "capabilities": ["completion"],
                "detail": "probe",
                "method": "show",
            },
        ]
    )
    calls = []

    def fake_probe(base_url, model, **kwargs):
        calls.append(model)
        return next(results)

    monkeypatch.setattr(
        "judgment.llm_capabilities.probe_model_capability", fake_probe
    )

    failed = refresh_model_capabilities(session_factory, settings)
    assert failed["tested_now"] == []
    assert failed["failures"] == [
        {"model": "gemma3:4b", "detail": "ReadTimeout"}
    ]
    with session_factory() as session:
        assert session.scalars(select(OllamaModelCapability)).all() == []

    retried = refresh_model_capabilities(session_factory, settings)
    assert calls == ["gemma3:4b", "gemma3:4b"]
    assert retried["failures"] == []
    assert retried["tested_now"] == ["gemma3:4b"]
    assert retried["chat_models"] == ["gemma3:4b"]


def test_available_test_models_read_only_mode_skips_probing(monkeypatch) -> None:
    session_factory = _session_factory()
    now = utcnow()
    with session_factory() as session:
        session.add(
            OllamaModelCapability(
                base_url="http://ollama.test",
                model="gemma3:4b",
                supports_chat=True,
                capabilities=["completion"],
                detail="ok",
                tested_at=now,
                last_seen_at=now,
            )
        )
        session.commit()
    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail",
        _tags(["gemma3:4b", "new:model"]),
    )

    def fail_probe(*args, **kwargs):
        raise AssertionError("read-only model lists must not probe new models")

    monkeypatch.setattr(
        "judgment.llm_capabilities.probe_model_capability", fail_probe
    )
    models = available_test_models(
        _settings(llm_model="gemma3:4b"),
        session_factory=session_factory,
        refresh=False,
    )
    assert models["llm"] == ["gemma3:4b"]
    assert models["capability"]["new_models"] == ["new:model"]
    assert models["capability"]["tested_now"] == []


def test_available_test_models_uses_embedding_host_for_embeddings(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    now = utcnow()
    with session_factory() as session:
        session.add(
            OllamaModelCapability(
                base_url="http://llm.test",
                model="gemma3:4b",
                supports_chat=True,
                capabilities=["completion"],
                detail="ok",
                tested_at=now,
                last_seen_at=now,
            )
        )
        session.commit()
    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail",
        _tags(["gemma3:4b"]),
    )
    monkeypatch.setattr(
        "judgment.performance_test.ollama_models_detail",
        _tags(["bge-m3:latest", "qwen3-embed:latest"]),
    )
    models = available_test_models(
        _settings(
            llm_url="http://llm.test",
            embedding_url="http://embed.test",
            llm_model="gemma3:4b",
        ),
        session_factory=session_factory,
        refresh=False,
    )
    assert models["embedding"] == ["bge-m3", "qwen3-embed:latest"]
    assert models["llm"] == ["gemma3:4b"]
    assert "qwen3-embed:latest" in models["available"]


def test_available_test_models_filters_to_chat_capable_models(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    now = utcnow()
    with session_factory() as session:
        session.add_all(
            [
                OllamaModelCapability(
                    base_url="http://ollama.test",
                    model="gemma3:4b",
                    supports_chat=True,
                    capabilities=["completion"],
                    detail="ok",
                    tested_at=now,
                    last_seen_at=now,
                ),
                OllamaModelCapability(
                    base_url="http://ollama.test",
                    model="command-r:latest",
                    supports_chat=True,
                    capabilities=["completion"],
                    detail="ok",
                    tested_at=now,
                    last_seen_at=now,
                ),
                OllamaModelCapability(
                    base_url="http://ollama.test",
                    model="phonon:latest",
                    supports_chat=False,
                    capabilities=["speech"],
                    detail="speech only",
                    tested_at=now,
                    last_seen_at=now,
                ),
                OllamaModelCapability(
                    base_url="http://ollama.test",
                    model="bge-m3:latest",
                    supports_chat=False,
                    capabilities=["embedding"],
                    detail="embedding",
                    tested_at=now,
                    last_seen_at=now,
                ),
            ]
        )
        session.commit()

    monkeypatch.setattr(
        "judgment.llm_capabilities.ollama_models_detail",
        _tags(
            [
                "gemma3:4b",
                "command-r:latest",
                "phonon:latest",
                "bge-m3:latest",
            ]
        ),
    )

    def fail_probe(*args, **kwargs):
        raise AssertionError("existing capability records must not be re-probed")

    monkeypatch.setattr(
        "judgment.llm_capabilities.probe_model_capability", fail_probe
    )

    models = available_test_models(
        _settings(llm_model="gemma3:4b"), session_factory=session_factory
    )
    assert models["embedding"] == ["bge-m3"]
    assert models["llm"] == ["gemma3:4b", "command-r:latest"]
    assert models["capability"]["tested_now"] == []
    assert models["capability"]["new_models"] == []
