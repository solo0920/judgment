from __future__ import annotations

import httpx
import pytest

from judgment.embeddings import (
    _PRIMARY_COOLDOWNS,
    EmbeddingError,
    OllamaEmbedder,
)


@pytest.fixture(autouse=True)
def clear_embedding_cooldowns():
    _PRIMARY_COOLDOWNS.clear()
    yield
    _PRIMARY_COOLDOWNS.clear()


class FakeResponse:
    def __init__(self, embeddings):
        self._embeddings = embeddings

    def raise_for_status(self):
        return None

    def json(self):
        return {"embeddings": self._embeddings}


def test_embedding_falls_back_to_local_ollama(monkeypatch) -> None:
    calls = []

    def fake_post(url, **kwargs):
        calls.append(url)
        if "primary.test" in url:
            raise httpx.ConnectError("primary offline")
        return FakeResponse([[0.1, 0.2, 0.3, 0.4]])

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=10,
        fallback_base_url="http://127.0.0.1:11434",
    )
    vectors = embedder.embed(["測試"])
    assert len(vectors) == 1
    assert len(vectors[0]) == 4
    assert embedder.using_fallback is True
    assert calls == [
        "http://primary.test/api/embed",
        "http://127.0.0.1:11434/api/embed",
    ]


def test_embedding_reports_both_provider_failures(monkeypatch) -> None:
    def fake_post(url, **kwargs):
        raise httpx.ConnectError("offline")

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=10,
        fallback_base_url="http://127.0.0.1:11434",
    )
    with pytest.raises(EmbeddingError) as exc_info:
        embedder.embed(["測試"])
    assert "primary failed" in str(exc_info.value)
    assert "fallback failed" in str(exc_info.value)


def test_query_embedding_uses_short_primary_timeout_then_local_fallback(
    monkeypatch,
) -> None:
    calls = []

    def fake_post(url, **kwargs):
        calls.append((url, kwargs.get("timeout")))
        if "primary.test" in url:
            raise httpx.ReadTimeout("primary timed out")
        return FakeResponse([[0.1, 0.2, 0.3, 0.4]])

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    monkeypatch.setattr(
        "judgment.embeddings.ollama_health_ok",
        lambda *args, **kwargs: True,
    )
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=120,
        query_timeout=10,
        fallback_base_url="http://127.0.0.1:11434",
    )
    vector = embedder.embed_query("測試")
    assert len(vector) == 4
    assert calls == [
        ("http://primary.test/api/embed", 10.0),
        ("http://127.0.0.1:11434/api/embed", 120.0),
    ]
    assert embedder.using_fallback is True


def test_primary_timeout_cooldown_skips_primary_for_next_query(monkeypatch) -> None:
    calls = []

    def fake_post(url, **kwargs):
        calls.append(url)
        if "primary.test" in url:
            raise httpx.ReadTimeout("primary timed out")
        return FakeResponse([[0.1, 0.2]])

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    monkeypatch.setattr(
        "judgment.embeddings.ollama_health_ok",
        lambda *args, **kwargs: True,
    )
    first = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=120,
        query_timeout=10,
        fallback_base_url="http://127.0.0.1:11434",
    )
    assert first.embed_query("第一次") == [0.1, 0.2]
    assert calls == [
        "http://primary.test/api/embed",
        "http://127.0.0.1:11434/api/embed",
    ]

    second = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=120,
        query_timeout=10,
        fallback_base_url="http://127.0.0.1:11434",
    )
    assert second.embed_query("第二次") == [0.1, 0.2]
    assert calls == [
        "http://primary.test/api/embed",
        "http://127.0.0.1:11434/api/embed",
        "http://127.0.0.1:11434/api/embed",
    ]
    assert second.using_fallback is True


def test_non_local_primary_health_check_failure_uses_local_without_embedding(
    monkeypatch,
) -> None:
    embedding_calls = []
    health_calls = []

    def fake_post(url, **kwargs):
        embedding_calls.append(url)
        return FakeResponse([[0.1, 0.2]])

    def fake_health(url, timeout=0):
        health_calls.append((url, timeout))
        return False

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    monkeypatch.setattr("judgment.embeddings.ollama_health_ok", fake_health)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=120,
        query_timeout=10,
        health_timeout=3,
        fallback_base_url="http://127.0.0.1:11434",
    )
    assert embedder.embed_query("測試") == [0.1, 0.2]
    assert health_calls == [("http://primary.test", 3.0)]
    assert embedding_calls == ["http://127.0.0.1:11434/api/embed"]
    assert embedder.using_fallback is True


def test_local_primary_skips_health_check(monkeypatch) -> None:
    health_calls = []
    embedding_calls = []

    def fake_post(url, **kwargs):
        embedding_calls.append(url)
        return FakeResponse([[0.1, 0.2]])

    def fake_health(url, timeout=0):
        health_calls.append((url, timeout))
        return False

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    monkeypatch.setattr("judgment.embeddings.ollama_health_ok", fake_health)
    embedder = OllamaEmbedder(
        "http://127.0.0.1:11434",
        "bge-m3",
        timeout=120,
        query_timeout=10,
        health_timeout=3,
        fallback_base_url="http://fallback.test",
    )
    assert embedder.embed_query("測試") == [0.1, 0.2]
    assert health_calls == []
    assert embedding_calls == ["http://127.0.0.1:11434/api/embed"]
