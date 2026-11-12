from __future__ import annotations

from pathlib import Path
from types import SimpleNamespace

import httpx

from judgment.config import Settings
from judgment.rag import _rerank_law_sources
from judgment.rerank import RerankOutcome, RerankResult, RerankerClient
from judgment.web.status import _rerank_metrics


class FakeResponse:
    def __init__(self, payload, status_code: int = 200) -> None:
        self._payload = payload
        self.status_code = status_code

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "request failed",
                request=httpx.Request("POST", "http://test"),
                response=httpx.Response(self.status_code),
            )

    def json(self):
        return self._payload


def test_reranker_sorts_scores_and_uses_primary(monkeypatch) -> None:
    calls = []

    def fake_post(url, *, json, timeout):
        calls.append((url, json, timeout))
        return FakeResponse(
            {
                "model": "bge-reranker-v2-m3",
                "results": [
                    {"index": 1, "relevance_score": -1.2},
                    {"index": 0, "relevance_score": 4.5},
                ],
                "usage": {"prompt_tokens": 20},
            }
        )

    monkeypatch.setattr("judgment.rerank.httpx.post", fake_post)
    client = RerankerClient(
        ["http://x570:11435"],
        model="bge-reranker-v2-m3",
    )
    outcome = client.rerank(
        "金融消費爭議",
        ["文件 A", "文件 B"],
        top_n=1,
    )

    assert outcome.status == "ok"
    assert outcome.fallback_used is False
    assert outcome.provider == "x570"
    assert outcome.url == "http://x570:11435/v1/rerank"
    assert outcome.selected_count == 1
    assert outcome.results[0].index == 0
    assert outcome.results[0].score == 4.5
    assert outcome.usage == {"prompt_tokens": 20}
    assert calls[0][0] == "http://x570:11435/v1/rerank"
    assert calls[0][1]["top_n"] == 1
    assert calls[0][1]["model"] == "bge-reranker-v2-m3"


def test_reranker_falls_back_to_second_endpoint(monkeypatch) -> None:
    calls = []

    def fake_post(url, *, json, timeout):
        calls.append(url)
        if len(calls) == 1:
            raise httpx.ConnectError("x570 unavailable")
        return FakeResponse(
            {
                "results": [
                    {"index": 2, "relevance_score": 0.8},
                    {"index": 0, "relevance_score": 0.2},
                ]
            }
        )

    monkeypatch.setattr("judgment.rerank.httpx.post", fake_post)
    client = RerankerClient(
        ["http://x570:11435", "http://127.0.0.1:11435"],
        model="bge-reranker-v2-m3",
    )
    outcome = client.rerank("問題", ["A", "B", "C"], top_n=2)

    assert calls == [
        "http://x570:11435/v1/rerank",
        "http://127.0.0.1:11435/v1/rerank",
    ]
    assert outcome.status == "ok"
    assert outcome.fallback_used is True
    assert outcome.provider == "127.0.0.1"
    assert [result.index for result in outcome.results] == [2, 0]
    assert outcome.errors


def test_reranker_degrades_when_all_endpoints_fail(monkeypatch) -> None:
    def fake_post(url, *, json, timeout):
        raise httpx.ConnectError("offline")

    monkeypatch.setattr("judgment.rerank.httpx.post", fake_post)
    client = RerankerClient(
        ["http://x570:11435", "http://127.0.0.1:11435"],
        model="bge-reranker-v2-m3",
    )
    outcome = client.rerank("問題", ["A", "B"], top_n=2)

    assert outcome.status == "degraded"
    assert outcome.results == []
    assert len(outcome.errors) == 2
    assert outcome.candidate_count == 2


def test_reranker_accepts_full_rerank_endpoint(monkeypatch) -> None:
    calls = []

    def fake_post(url, *, json, timeout):
        calls.append(url)
        return FakeResponse([{"index": 0, "score": 1.0}])

    monkeypatch.setattr("judgment.rerank.httpx.post", fake_post)
    client = RerankerClient(
        ["http://reranker.test:8080/rerank"],
        model="bge-reranker-v2-m3",
    )
    outcome = client.rerank("問題", ["A"], top_n=1)

    assert calls == ["http://reranker.test:8080/rerank"]
    assert outcome.status == "ok"
    assert outcome.results[0].score == 1.0


def test_reranker_disabled_and_empty() -> None:
    disabled = RerankerClient([], model="bge-reranker-v2-m3").rerank(
        "問題", ["A"], top_n=1
    )
    assert disabled.status == "disabled"

    client = RerankerClient(
        ["http://x570:11435"], model="bge-reranker-v2-m3"
    )
    empty = client.rerank("問題", [], top_n=1)
    assert empty.status == "empty"


def test_reranker_rejects_malformed_results(monkeypatch) -> None:
    monkeypatch.setattr(
        "judgment.rerank.httpx.post",
        lambda *args, **kwargs: FakeResponse({"results": []}),
    )
    client = RerankerClient(
        ["http://x570:11435"], model="bge-reranker-v2-m3"
    )
    outcome = client.rerank("問題", ["A"], top_n=1)
    assert outcome.status == "degraded"
    assert "no usable scores" in outcome.errors[0]


def test_reranker_timeout_is_bounded() -> None:
    client = RerankerClient(
        ["http://x570:11435"],
        model="bge-reranker-v2-m3",
        timeout=3.0,
        connect_timeout=0.75,
    )
    assert client.timeout == 3.0
    assert client.connect_timeout == 0.75
    clamped = RerankerClient(
        ["http://x570:11435"],
        model="bge-reranker-v2-m3",
        timeout=-1,
    )
    assert clamped.timeout == 0.1
    assert clamped.connect_timeout == 0.1


def test_reranker_status_checks_primary_and_fallback(monkeypatch) -> None:
    calls = []
    codes = {"http://x570:11435/health": 503, "http://127.0.0.1:11435/health": 200}

    class Response:
        def __init__(self, status_code: int) -> None:
            self.status_code = status_code

    def fake_get(url, timeout):
        calls.append(url)
        return Response(codes.get(url, 500))

    monkeypatch.setattr("judgment.web.status.httpx.get", fake_get)
    settings = SimpleNamespace(
        rag_rerank_enabled=True,
        rerank_url="http://x570:11435",
        rerank_fallback_url="http://127.0.0.1:11435",
        rerank_model="bge-reranker-v2-m3",
    )
    metrics = _rerank_metrics(settings)

    assert calls == [
        "http://x570:11435/health",
        "http://127.0.0.1:11435/health",
    ]
    assert metrics["status"] == "operational"
    assert metrics["detail"].startswith("fallback ")
    assert metrics["model"] == "bge-reranker-v2-m3"
    assert [provider["name"] for provider in metrics["providers"]] == [
        "x570",
        "local",
    ]
    assert metrics["providers"][0]["status"] == "degraded"
    assert metrics["providers"][0]["active"] is False
    assert metrics["providers"][1]["status"] == "operational"
    assert metrics["providers"][1]["active"] is True
    assert metrics["active"]["name"] == "local"


def _law_settings() -> Settings:
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        rerank_url="http://reranker.test",
        rag_rerank_enabled=True,
    )


def test_law_rerank_orders_articles_per_source(monkeypatch) -> None:
    class FakeReranker:
        configured = True

        def __init__(self, *args, **kwargs) -> None:
            pass

        def rerank(self, query, documents, *, top_n):
            return RerankOutcome(
                status="ok",
                results=[
                    RerankResult(index=1, score=9.0),
                    RerankResult(index=0, score=1.0),
                    RerankResult(index=2, score=0.5),
                ],
                model="bge-reranker-v2-m3",
                candidate_count=len(documents),
                selected_count=len(documents),
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", FakeReranker)
    sources = [
        {
            "law_name": "銀行法",
            "source_label": "法規",
            "articles": [
                {"article_no": "第 35 條", "article_content": "佣金"},
                {"article_no": "第 125-2 條", "article_content": "刑責"},
                {"article_no": "第 35-1 條", "article_content": "兼職"},
            ],
        }
    ]

    reranked, outcome = _rerank_law_sources(
        settings=_law_settings(),
        question="銀行法對從業人員有那些規定？",
        law_sources=sources,
        article_limit=2,
    )

    assert outcome.status == "ok"
    # Rank fusion keeps the strongest BM25/hybrid article while promoting the
    # cross-encoder's preferred article into the remaining slot.
    assert [
        article["article_no"] for article in reranked[0]["articles"]
    ] == ["第 35 條", "第 125-2 條"]


def test_law_rerank_keeps_explicit_article_reference(monkeypatch) -> None:
    class FakeReranker:
        configured = True

        def __init__(self, *args, **kwargs) -> None:
            pass

        def rerank(self, query, documents, *, top_n):
            return RerankOutcome(
                status="ok",
                results=[
                    RerankResult(index=0, score=9.0),
                    RerankResult(index=1, score=8.0),
                ],
                model="bge-reranker-v2-m3",
                candidate_count=len(documents),
                selected_count=len(documents),
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", FakeReranker)
    sources = [
        {
            "law_name": "銀行法",
            "source_label": "法規",
            "articles": [
                {"article_no": "第 35 條", "article_content": "佣金"},
                {"article_no": "第 125-2 條", "article_content": "刑責"},
            ],
        }
    ]

    reranked, _ = _rerank_law_sources(
        settings=_law_settings(),
        question="銀行法第 125-2 條的刑責是什麼？",
        law_sources=sources,
        article_limit=1,
    )

    assert reranked[0]["articles"][0]["article_no"] == "第 125-2 條"
