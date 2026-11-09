from __future__ import annotations

import httpx
import pytest

from judgment.embeddings import EmbeddingError, OllamaEmbedder


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
