from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urlparse

import httpx

from .config import Settings

logger = logging.getLogger(__name__)


class RerankError(RuntimeError):
    """Raised when a reranker endpoint returns an unusable response."""


@dataclass(frozen=True)
class RerankResult:
    index: int
    score: float


@dataclass
class RerankOutcome:
    status: str
    results: List[RerankResult] = field(default_factory=list)
    model: str = ""
    provider: str = ""
    url: str = ""
    fallback_used: bool = False
    latency_ms: int = 0
    candidate_count: int = 0
    selected_count: int = 0
    errors: List[str] = field(default_factory=list)
    usage: Dict[str, Any] = field(default_factory=dict)
    groups: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        top_scores = [round(result.score, 4) for result in self.results[:10]]
        return {
            "status": self.status,
            "model": self.model,
            "provider": self.provider,
            "url": self.url,
            "fallback_used": self.fallback_used,
            "latency_ms": self.latency_ms,
            "candidate_count": self.candidate_count,
            "selected_count": self.selected_count,
            "top_score": top_scores[0] if top_scores else None,
            "scores": top_scores,
            "errors": list(self.errors),
            "usage": dict(self.usage),
            "groups": [dict(group) for group in self.groups],
        }


def _endpoint(url: str) -> str:
    """Accept either a base URL or a full rerank endpoint.

    llama.cpp exposes ``/v1/rerank``. A caller can configure a full endpoint
    explicitly. Base URLs default to the llama.cpp endpoint because that is
    what the first-round local service uses.
    """

    value = str(url or "").strip().rstrip("/")
    if not value:
        return ""
    path = urlparse(value).path.rstrip("/")
    if path.endswith("/rerank"):
        return value
    if path.endswith("/v1"):
        return f"{value}/rerank"
    return f"{value}/v1/rerank"


def _provider(url: str) -> str:
    hostname = urlparse(str(url or "")).hostname or ""
    return hostname or str(url or "")


def _parse_results(payload: Any, candidate_count: int) -> List[RerankResult]:
    if isinstance(payload, list):
        items = payload
    elif isinstance(payload, dict):
        items = payload.get("results") or payload.get("data") or []
    else:
        items = []
    if not isinstance(items, list):
        raise RerankError("rerank response has no results list")

    best_by_index: Dict[int, float] = {}
    for item in items:
        if not isinstance(item, dict):
            continue
        try:
            index = int(item.get("index"))
            score = float(
                item.get("relevance_score", item.get("score"))
            )
        except (TypeError, ValueError):
            continue
        if not 0 <= index < candidate_count:
            continue
        if score != score:  # NaN
            continue
        previous = best_by_index.get(index)
        if previous is None or score > previous:
            best_by_index[index] = score
    if not best_by_index:
        raise RerankError("rerank response has no usable scores")
    return [
        RerankResult(index=index, score=score)
        for index, score in sorted(
            best_by_index.items(),
            key=lambda item: (-item[1], item[0]),
        )
    ]


class RerankerClient:
    """Small client for llama.cpp / Jina-compatible rerank endpoints."""

    def __init__(
        self,
        urls: Sequence[str],
        *,
        model: str,
        timeout: float = 3.0,
        connect_timeout: float = 0.75,
        total_timeout: Optional[float] = None,
    ) -> None:
        seen = set()
        normalized: List[str] = []
        for url in urls:
            value = str(url or "").strip().rstrip("/")
            if not value or value in seen:
                continue
            seen.add(value)
            normalized.append(value)
        self.urls = tuple(normalized)
        self.model = str(model or "bge-reranker-v2-m3").strip() or (
            "bge-reranker-v2-m3"
        )
        self.timeout = max(0.1, float(timeout))
        self.connect_timeout = max(0.1, min(float(connect_timeout), self.timeout))
        if total_timeout is None:
            # Preserve the historical behaviour: each configured endpoint gets
            # its own timeout budget.
            self.total_timeout = self.timeout * max(1, len(self.urls))
        else:
            self.total_timeout = max(0.1, float(total_timeout))

    @property
    def configured(self) -> bool:
        return bool(self.urls)

    def rerank(
        self,
        query: str,
        documents: Sequence[str],
        *,
        top_n: int,
    ) -> RerankOutcome:
        candidate_count = len(documents)
        if not documents:
            return RerankOutcome(
                status="empty",
                model=self.model,
                candidate_count=0,
            )
        if not self.urls:
            return RerankOutcome(
                status="disabled",
                model=self.model,
                candidate_count=candidate_count,
            )

        errors: List[str] = []
        started = time.perf_counter()
        deadline = started + self.total_timeout
        for position, base_url in enumerate(self.urls):
            endpoint = _endpoint(base_url)
            if not endpoint:
                continue
            remaining = deadline - time.perf_counter()
            if remaining <= 0.05:
                errors.append(
                    f"{endpoint}: total rerank deadline "
                    f"({self.total_timeout:.2f}s) exhausted"
                )
                break
            attempt_timeout = min(self.timeout, remaining)
            try:
                response = httpx.post(
                    endpoint,
                    json={
                        "model": self.model,
                        "query": query,
                        "documents": list(documents),
                        "top_n": max(1, int(top_n)),
                    },
                    timeout=httpx.Timeout(
                        attempt_timeout,
                        connect=min(self.connect_timeout, attempt_timeout),
                    ),
                )
                response.raise_for_status()
                payload = response.json()
                results = _parse_results(payload, candidate_count)
                selected = results[: max(1, int(top_n))]
                response_model = (
                    str(payload.get("model") or self.model).strip()
                    if isinstance(payload, dict)
                    else self.model
                )
                usage = (
                    payload.get("usage")
                    if isinstance(payload, dict)
                    and isinstance(payload.get("usage"), dict)
                    else {}
                )
                return RerankOutcome(
                    status="ok",
                    results=selected,
                    model=response_model or self.model,
                    provider=_provider(endpoint),
                    url=endpoint,
                    fallback_used=position > 0,
                    latency_ms=int((time.perf_counter() - started) * 1000),
                    candidate_count=candidate_count,
                    selected_count=len(selected),
                    errors=errors,
                    usage=usage,
                )
            except Exception as exc:  # noqa: BLE001 - fallback is intentional
                message = (
                    f"{endpoint}: {exc.__class__.__name__}: {exc}"
                )
                errors.append(message[:400])
                logger.warning("rerank endpoint failed: %s", message)

        return RerankOutcome(
            status="degraded",
            model=self.model,
            provider=_provider(self.urls[0]) if self.urls else "",
            url=_endpoint(self.urls[0]) if self.urls else "",
            latency_ms=int((time.perf_counter() - started) * 1000),
            candidate_count=candidate_count,
            errors=errors,
        )


RERANK_TEST_QUERY = "銀行未經許可吸收存款，應負什麼責任？"
RERANK_TEST_DOCUMENTS = (
    "銀行法第29條規定，除法律另有規定者外，非銀行不得經營收受存款業務。",
    "民法第184條規定，因故意或過失不法侵害他人權利者，負損害賠償責任。",
    "證券交易法第20條規定，有價證券之募集、發行、私募或買賣，不得有虛偽、詐欺或其他足致他人誤信之行為。",
    "刑法第339條規定，意圖為自己或第三人不法之所有，以詐術使人交付財物者，處五年以下有期徒刑。",
)


def rerank_heartbeat(settings: Settings) -> Dict[str, Any]:
    """Send a tiny scoring request so the reranker model stays warm.

    The request is deliberately much smaller than a real RAG rerank (one
    short document) so a 60-second heartbeat does not consume meaningful GPU
    time. The fallback endpoint is only exercised when the primary fails,
    matching the runtime fallback policy.
    """

    enabled = bool(getattr(settings, "rag_rerank_enabled", False))
    urls = [
        str(getattr(settings, "rerank_url", "") or "").strip().rstrip("/"),
        str(getattr(settings, "rerank_fallback_url", "") or "").strip().rstrip("/"),
    ]
    model = str(
        getattr(settings, "rerank_model", "") or "bge-reranker-v2-m3"
    )
    if not enabled or not any(urls):
        return {
            "status": "disabled",
            "model": model,
            "latency_ms": 0,
            "provider": "",
            "url": "",
            "errors": [],
        }
    timeout = max(
        0.25,
        min(float(getattr(settings, "rerank_timeout_seconds", 3.0)), 2.5),
    )
    total_timeout = max(
        0.5,
        min(
            float(getattr(settings, "rerank_total_timeout_seconds", 4.0)),
            2.5,
        ),
    )
    client = RerankerClient(
        urls,
        model=model,
        timeout=timeout,
        connect_timeout=min(
            timeout,
            float(getattr(settings, "rerank_connect_timeout_seconds", 0.75)),
        ),
        total_timeout=total_timeout,
    )
    outcome = client.rerank(
        RERANK_TEST_QUERY,
        RERANK_TEST_DOCUMENTS[:1],
        top_n=1,
    )
    return {
        "status": "ok" if outcome.status == "ok" else "degraded",
        "model": outcome.model,
        "latency_ms": outcome.latency_ms,
        "provider": outcome.provider,
        "url": outcome.url,
        "errors": list(outcome.errors),
    }


def rerank_service_test(
    settings: Settings,
    *,
    query: str = RERANK_TEST_QUERY,
    documents: Sequence[str] = RERANK_TEST_DOCUMENTS,
) -> Dict[str, Any]:
    """Exercise each configured reranker with a real scoring request.

    A health check alone cannot distinguish a reachable llama-server from one
    that rejects the configured model or returns malformed scores, so the
    system-test card uses this endpoint to verify the full response.
    """

    model = str(settings.rerank_model or "bge-reranker-v2-m3")
    query = str(query or RERANK_TEST_QUERY)
    docs = [str(item) for item in documents if str(item).strip()]
    enabled = bool(settings.rag_rerank_enabled)
    candidates = [
        ("primary", str(settings.rerank_url or "").strip().rstrip("/")),
        ("fallback", str(settings.rerank_fallback_url or "").strip().rstrip("/")),
    ]
    started = time.perf_counter()
    providers: List[Dict[str, Any]] = []
    for role, url in candidates:
        if not url:
            continue
        entry: Dict[str, Any] = {
            "role": role,
            "url": url,
            "model": model,
            "status": "disabled" if not enabled else "degraded",
            "latency_ms": None,
            "candidate_count": len(docs),
            "selected_count": 0,
            "top_score": None,
            "scores": [],
            "results": [],
            "errors": [],
        }
        if not enabled:
            providers.append(entry)
            continue
        client = RerankerClient(
            [url],
            model=model,
            timeout=settings.rerank_timeout_seconds,
            connect_timeout=settings.rerank_connect_timeout_seconds,
        )
        try:
            outcome = client.rerank(query, docs, top_n=min(3, len(docs)))
            entry.update(
                {
                    "status": (
                        "operational"
                        if outcome.status == "ok"
                        else "degraded"
                    ),
                    "latency_ms": outcome.latency_ms,
                    "candidate_count": outcome.candidate_count,
                    "selected_count": outcome.selected_count,
                    "top_score": (
                        round(float(outcome.results[0].score), 4)
                        if outcome.results
                        else None
                    ),
                    "scores": [
                        round(float(result.score), 4)
                        for result in outcome.results[:10]
                    ],
                    "results": [
                        {
                            "index": int(result.index),
                            "score": round(float(result.score), 4),
                            "document": docs[result.index][:180],
                        }
                        for result in outcome.results
                        if 0 <= result.index < len(docs)
                    ],
                    "errors": list(outcome.errors),
                    "provider": outcome.provider,
                    "actual_model": outcome.model,
                }
            )
        except Exception as exc:  # noqa: BLE001 - report, do not fail the page
            entry["errors"] = [
                f"{exc.__class__.__name__}: {exc}"[:400]
            ]
            entry["latency_ms"] = int(
                (time.perf_counter() - started) * 1000
            )
        providers.append(entry)

    active = next(
        (
            provider
            for provider in providers
            if provider.get("status") == "operational"
        ),
        None,
    )
    if not enabled:
        status = "not_configured"
        detail = f"RAG_RERANK_ENABLED=false（模型：{model}）"
    elif not providers:
        status = "not_configured"
        detail = f"未設定 RERANK_URL（模型：{model}）"
    elif active is not None:
        status = "operational"
        detail = (
            f"{'fallback ' if active['role'] == 'fallback' else ''}"
            f"模型：{model} · {active['url']}"
        )
    else:
        status = "degraded"
        detail = f"無法完成 rerank（模型：{model}）"

    return {
        "status": status,
        "enabled": enabled,
        "model": model,
        "query": query,
        "providers": providers,
        "active": active,
        "candidate_count": len(docs),
        "latency_ms": int((time.perf_counter() - started) * 1000),
        "detail": detail,
    }
