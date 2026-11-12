from __future__ import annotations

import httpx
import pytest

from judgment.embeddings import (
    _PRIMARY_COOLDOWNS,
    EmbeddingError,
    EmbeddingInputError,
    OllamaEmbedder,
    probe_embedding_hosts,
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


class TagsResponse:
    def __init__(self, models):
        self._models = models

    def raise_for_status(self):
        return None

    def json(self):
        return {"models": [{"name": name} for name in self._models]}


def test_probe_embedding_hosts_selects_fallback_with_model(monkeypatch) -> None:
    calls = []

    def fake_get(url, **kwargs):
        calls.append(url)
        if "primary.test" in url:
            return TagsResponse(["other-model"])
        return TagsResponse(["bge-m3:latest"])

    monkeypatch.setattr("judgment.embeddings.httpx.get", fake_get)
    result = probe_embedding_hosts(
        primary_url="http://primary.test:11434",
        fallback_url="http://fallback.test:11435",
        model="bge-m3",
    )
    assert result["status"] == "operational"
    selected = result["selected"]
    assert selected["role"] == "fallback"
    assert selected["url"] == "http://fallback.test:11435"
    assert selected["host"] == "fallback.test"
    assert selected["port"] == 11435
    assert selected["models"] == ["bge-m3:latest"]
    assert [host["status"] for host in result["hosts"]] == [
        "degraded",
        "operational",
    ]
    assert calls == [
        "http://primary.test:11434/api/tags",
        "http://fallback.test:11435/api/tags",
    ]


def test_probe_embedding_hosts_reports_no_usable_host(monkeypatch) -> None:
    def fake_get(url, **kwargs):
        raise httpx.ConnectError("offline")

    monkeypatch.setattr("judgment.embeddings.httpx.get", fake_get)
    result = probe_embedding_hosts(
        primary_url="http://primary.test:11434",
        fallback_url="",
        model="bge-m3",
    )
    assert result["status"] == "failed"
    assert result["selected"] is None
    assert result["hosts"][0]["status"] == "unavailable"
    assert result["error"]


def test_embedding_records_call_metrics(monkeypatch) -> None:
    class MetricsResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "embeddings": [[0.1, 0.2, 0.3, 0.4], [0.4, 0.3, 0.2, 0.1]],
                "prompt_eval_count": 12,
                "total_duration": 1_500_000,
                "load_duration": 400_000,
                "eval_duration": 900_000,
            }

    monkeypatch.setattr(
        "judgment.embeddings.httpx.post",
        lambda url, **kwargs: MetricsResponse(),
    )
    embedder = OllamaEmbedder("http://localhost:11434", "bge-m3", timeout=10)
    vectors = embedder.embed(["測試一", "測試二"])
    assert len(vectors) == 2
    call = embedder.last_call
    assert call["model"] == "bge-m3"
    assert call["batch"] == 2
    assert call["prompt_eval_count"] == 12
    assert call["dimensions"] == 4
    assert call["total_duration_ms"] == 1.5
    assert call["load_duration_ms"] == 0.4
    assert call["eval_duration_ms"] == 0.9
    assert call["fallback"] is False
    assert call["active_base_url"] == "http://localhost:11434"


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


def test_embedding_context_length_error_does_not_fallback(monkeypatch) -> None:
    calls = []

    class TooLongResponse:
        status_code = 413
        text = '{"error":"the input length exceeds the context length"}'

        def raise_for_status(self):
            raise httpx.HTTPStatusError(
                "too long",
                request=httpx.Request("POST", "http://primary.test/api/embed"),
                response=httpx.Response(self.status_code),
            )

    def fake_post(url, **kwargs):
        calls.append(url)
        return TooLongResponse()

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=10,
        fallback_base_url="http://fallback.test",
    )

    with pytest.raises(EmbeddingInputError):
        embedder.embed(["x" * 5000])

    assert calls == ["http://primary.test/api/embed"]
    assert embedder.using_fallback is False


def test_embedding_falls_through_multiple_fallback_hosts(monkeypatch) -> None:
    calls = []

    def fake_post(url, **kwargs):
        calls.append(url)
        if "primary.test" in url or "fallback-one.test" in url:
            raise httpx.ConnectError("offline")
        return FakeResponse([[0.1, 0.2, 0.3, 0.4]])

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=10,
        fallback_base_url="http://fallback-one.test",
        fallback_base_urls=("http://fallback-two.test",),
    )
    vectors = embedder.embed(["測試"])
    assert len(vectors) == 1
    assert len(vectors[0]) == 4
    assert embedder.using_fallback is True
    assert embedder.active_base_url == "http://fallback-two.test"
    assert embedder.fallback_base_urls == (
        "http://fallback-one.test",
        "http://fallback-two.test",
    )
    assert calls == [
        "http://primary.test/api/embed",
        "http://fallback-one.test/api/embed",
        "http://fallback-two.test/api/embed",
    ]


def test_embedding_reports_all_provider_failures(monkeypatch) -> None:
    def fake_post(url, **kwargs):
        raise httpx.ConnectError("offline")

    monkeypatch.setattr("judgment.embeddings.httpx.post", fake_post)
    embedder = OllamaEmbedder(
        "http://primary.test",
        "bge-m3",
        timeout=10,
        fallback_base_url="http://fallback-one.test",
        fallback_base_urls=("http://fallback-two.test",),
    )
    with pytest.raises(EmbeddingError) as exc_info:
        embedder.embed(["測試"])
    message = str(exc_info.value)
    assert "primary failed" in message
    assert "fallback 1 (http://fallback-one.test) failed" in message
    assert "fallback 2 (http://fallback-two.test) failed" in message


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
        query_timeout=2,
        fallback_base_url="http://127.0.0.1:11434",
    )
    vector = embedder.embed_query("測試")
    assert len(vector) == 4
    assert calls == [
        ("http://primary.test/api/embed", 2.0),
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
        query_timeout=2,
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
        query_timeout=2,
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
        query_timeout=2,
        health_timeout=2,
        fallback_base_url="http://127.0.0.1:11434",
    )
    assert embedder.embed_query("測試") == [0.1, 0.2]
    assert health_calls == [("http://primary.test", 2.0)]
    assert embedding_calls == ["http://127.0.0.1:11434/api/embed"]
    assert embedder.using_fallback is True


def test_local_primary_skips_health_check(monkeypatch) -> None:
    health_calls = []
    embedding_calls = []

    def fake_post(url, **kwargs):
        embedding_calls.append((url, kwargs.get("timeout")))
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
        query_timeout=2,
        health_timeout=2,
        fallback_base_url="http://fallback.test",
    )
    assert embedder.embed_query("測試") == [0.1, 0.2]
    assert health_calls == []
    assert embedding_calls == [("http://127.0.0.1:11434/api/embed", 120.0)]
