from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment import ollama_hosts
from judgment.config import Settings
from judgment.models import Base, OllamaHost
from judgment.runtime_settings import set_llm_model_preference


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


def _settings() -> Settings:
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        llm_url="http://env-llm:11434",
        llm_model="env-chat",
        embedding_url="http://env-embedding:11434",
        embedding_model="env-embedding",
    )


def test_ollama_host_lifecycle_and_runtime_settings(
    session_factory, monkeypatch
) -> None:
    monkeypatch.setattr(
        ollama_hosts,
        "_probe_host",
        lambda base_url, timeout: {
            "status": "operational",
            "detail": "2 個模型",
            "models": [
                {"name": "gemma3:4b", "size": 100, "modified_at": None},
                {"name": "bge-m3:latest", "size": 200, "modified_at": None},
            ],
        },
    )
    first = ollama_hosts.add_host(
        session_factory,
        name="Local",
        url="127.0.0.1",
        port=11434,
    )
    second = ollama_hosts.add_host(
        session_factory,
        name="x570",
        url="http://x570",
        port=11500,
    )
    assert first["base_url"] == "http://127.0.0.1:11434"
    assert second["base_url"] == "http://x570:11500"

    with pytest.raises(ollama_hosts.OllamaHostError):
        ollama_hosts.add_host(
            session_factory,
            name="Duplicate",
            url="http://127.0.0.1:11434",
            port=11434,
        )

    activated = ollama_hosts.activate_host(session_factory, first["id"])
    assert activated["is_active"] is True

    ollama_hosts.select_model(
        session_factory,
        first["id"],
        model="gemma3:4b",
        role="chat",
    )
    ollama_hosts.select_model(
        session_factory,
        first["id"],
        model="bge-m3:latest",
        role="embedding",
    )
    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.llm_url == "http://127.0.0.1:11434"
    assert runtime.llm_model == "gemma3:4b"
    assert runtime.embedding_url == "http://127.0.0.1:11434"
    assert runtime.embedding_model == "bge-m3:latest"

    listing = ollama_hosts.list_hosts(session_factory)
    assert listing["active_host_id"] == first["id"]
    assert len(listing["hosts"]) == 2
    assert listing["hosts"][0]["status"] == "operational"
    assert len(listing["hosts"][0]["models"]) == 2

    ollama_hosts.clear_model(
        session_factory,
        first["id"],
        model="gemma3:4b",
        role="chat",
    )
    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "env-chat"

    ollama_hosts.deactivate_hosts(session_factory)
    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.embedding_url == "http://env-embedding:11434"

    assert ollama_hosts.delete_host(session_factory, second["id"]) is True
    with session_factory() as session:
        assert session.get(OllamaHost, second["id"]) is None


def test_ollama_host_priority_reorder_and_embedding_failover(
    session_factory, monkeypatch
) -> None:
    monkeypatch.setattr(
        ollama_hosts,
        "_probe_host",
        lambda base_url, timeout: {
            "status": "operational",
            "detail": "1 個模型",
            "models": [{"name": "bge-m3:latest", "size": 200, "modified_at": None}],
        },
    )
    first = ollama_hosts.add_host(
        session_factory, name="First", url="http://first.test", port=11434
    )
    second = ollama_hosts.add_host(
        session_factory, name="Second", url="http://second.test", port=11434
    )
    third = ollama_hosts.add_host(
        session_factory, name="Third", url="http://third.test", port=11434
    )
    assert [first["priority"], second["priority"], third["priority"]] == [
        0,
        10,
        20,
    ]

    ollama_hosts.select_model(
        session_factory,
        third["id"],
        model="bge-m3:latest",
        role="embedding",
    )
    result = ollama_hosts.reorder_hosts(
        session_factory, [third["id"], first["id"], second["id"]]
    )
    assert result["active_host_id"] == third["id"]

    listing = ollama_hosts.list_hosts(session_factory)
    assert [host["id"] for host in listing["hosts"]] == [
        third["id"],
        first["id"],
        second["id"],
    ]
    assert listing["active_host_id"] == third["id"]

    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "env-chat"
    assert runtime.embedding_url == "http://third.test:11434"
    assert runtime.embedding_model == "bge-m3:latest"
    assert runtime.embedding_fallback_url == "http://first.test:11434"
    assert runtime.embedding_failover_urls == (
        "http://first.test:11434",
        "http://second.test:11434",
    )

    ollama_hosts.select_model(
        session_factory,
        third["id"],
        model="gemma3:12b",
        role="chat",
    )
    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.llm_url == "http://third.test:11434"
    assert runtime.llm_model == "gemma3:12b"

    activated = ollama_hosts.activate_host(session_factory, first["id"])
    assert activated["priority"] == 0
    listing = ollama_hosts.list_hosts(session_factory)
    assert [host["id"] for host in listing["hosts"]] == [
        first["id"],
        third["id"],
        second["id"],
    ]
    runtime = ollama_hosts.runtime_settings(_settings(), session_factory)
    assert runtime.embedding_url == "http://first.test:11434"
    assert runtime.embedding_failover_urls == (
        "http://third.test:11434",
        "http://second.test:11434",
    )

    with pytest.raises(ollama_hosts.OllamaHostError):
        ollama_hosts.reorder_hosts(
            session_factory, [first["id"], first["id"], second["id"]]
        )


def test_llm_model_preference_uses_env_provider_until_host_chat_model(
    session_factory,
) -> None:
    settings = _settings()
    set_llm_model_preference(
        session_factory,
        model="gemma3:27b",
        base_url="http://env-llm:11434",
    )
    runtime = ollama_hosts.runtime_settings(settings, session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "gemma3:27b"

    host = ollama_hosts.add_host(
        session_factory, name="Embedding only", url="http://host.test", port=11434
    )
    runtime = ollama_hosts.runtime_settings(settings, session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "gemma3:27b"

    # Changing the active provider explicitly resets the RAG model override.
    ollama_hosts.activate_host(session_factory, host["id"])
    runtime = ollama_hosts.runtime_settings(settings, session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "env-chat"

    # A later RAG selection overrides the env provider again.
    set_llm_model_preference(
        session_factory,
        model="gemma3:27b",
        base_url="http://env-llm:11434",
    )
    runtime = ollama_hosts.runtime_settings(settings, session_factory)
    assert runtime.llm_url == "http://env-llm:11434"
    assert runtime.llm_model == "gemma3:27b"

    # Selecting a chat model on the active host resets the override and uses
    # the host model.
    ollama_hosts.select_model(
        session_factory,
        host["id"],
        model="gemma3:12b",
        role="chat",
    )
    runtime = ollama_hosts.runtime_settings(settings, session_factory)
    assert runtime.llm_url == "http://host.test:11434"
    assert runtime.llm_model == "gemma3:12b"
