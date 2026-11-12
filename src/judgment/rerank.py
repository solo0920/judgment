from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Sequence
from urllib.parse import urlparse

import httpx

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
        for position, base_url in enumerate(self.urls):
            endpoint = _endpoint(base_url)
            if not endpoint:
                continue
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
                        self.timeout,
                        connect=self.connect_timeout,
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
