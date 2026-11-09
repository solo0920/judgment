from __future__ import annotations

import logging
import time
from typing import Any, Dict, List, Optional, Sequence

import httpx

logger = logging.getLogger(__name__)


class EmbeddingError(RuntimeError):
    """Raised when an embedding provider cannot return usable vectors."""


def _normalized_models(payload: Dict[str, Any]) -> List[str]:
    models: List[str] = []
    for item in payload.get("models") or []:
        name = str(item.get("name") or item.get("model") or "").strip()
        if name:
            models.append(name)
    return models


def ollama_model_available(base_url: str, model: str, timeout: float = 2.5) -> bool:
    if not base_url or not model:
        return False
    try:
        response = httpx.get(f"{base_url.rstrip('/')}/api/tags", timeout=timeout)
        response.raise_for_status()
        available = set(_normalized_models(response.json()))
    except Exception:
        return False
    target = model.strip()
    if target in available:
        return True
    # Ollama reports the implicit latest tag explicitly.
    if ":" not in target and f"{target}:latest" in available:
        return True
    return any(name.split(":", 1)[0] == target for name in available)


def ollama_models_detail(base_url: str, timeout: float = 2.5) -> Dict[str, Any]:
    if not base_url:
        return {"status": "not_configured", "models": [], "detail": "未設定"}
    try:
        response = httpx.get(f"{base_url.rstrip('/')}/api/tags", timeout=timeout)
        response.raise_for_status()
        models = _normalized_models(response.json())
        return {
            "status": "operational",
            "models": models,
            "detail": f"{len(models)} 個模型",
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "models": [],
            "detail": f"{exc.__class__.__name__} · {base_url}",
        }


class OllamaEmbedder:
    def __init__(
        self,
        base_url: str,
        model: str = "bge-m3",
        *,
        timeout: Optional[float] = 120.0,
        fallback_base_url: str = "",
        fallback_cooldown_seconds: float = 60.0,
    ) -> None:
        self.base_url = str(base_url or "").rstrip("/")
        self.fallback_base_url = str(fallback_base_url or "").rstrip("/")
        self.model = str(model or "bge-m3")
        self.timeout = None if timeout is None else float(timeout)
        self.fallback_cooldown_seconds = max(
            0.0, float(fallback_cooldown_seconds)
        )
        self._primary_down_until = 0.0
        self._using_fallback = False

    @property
    def configured(self) -> bool:
        return bool(self.base_url or self.fallback_base_url)

    @property
    def using_fallback(self) -> bool:
        return self._using_fallback

    def _embed_at(self, base_url: str, values: Sequence[str]) -> List[List[float]]:
        try:
            response = httpx.post(
                f"{base_url}/api/embed",
                json={"model": self.model, "input": list(values)},
                timeout=self.timeout,
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:300]
            raise EmbeddingError(
                f"Embedding API HTTP {exc.response.status_code}: {detail}"
            ) from exc
        except Exception as exc:
            raise EmbeddingError(
                f"Embedding API 無法連線：{exc.__class__.__name__}: {exc}"
            ) from exc

        embeddings = payload.get("embeddings")
        if not isinstance(embeddings, list) or len(embeddings) != len(values):
            raise EmbeddingError("Embedding API 回傳的向量數量不符")
        result: List[List[float]] = []
        for vector in embeddings:
            if not isinstance(vector, list) or not vector:
                raise EmbeddingError("Embedding API 回傳空向量")
            result.append([float(value) for value in vector])
        dimensions = {len(vector) for vector in result}
        if len(dimensions) != 1:
            raise EmbeddingError("Embedding API 回傳的向量維度不一致")
        return result

    def embed(self, texts: Sequence[str]) -> List[List[float]]:
        values = [str(text or "") for text in texts]
        if not values:
            return []
        if not self.configured:
            raise EmbeddingError("EMBEDDING_URL 未設定")
        primary_available = bool(
            self.base_url and time.monotonic() >= self._primary_down_until
        )
        primary_error: Optional[Exception] = None
        if primary_available:
            try:
                result = self._embed_at(self.base_url, values)
                if self._using_fallback:
                    logger.info("Embedding primary recovered: %s", self.base_url)
                self._using_fallback = False
                return result
            except EmbeddingError as exc:
                primary_error = exc
                self._primary_down_until = (
                    time.monotonic() + self.fallback_cooldown_seconds
                )
                if not self.fallback_base_url:
                    raise
                logger.warning(
                    "Embedding primary unavailable; using fallback %s: %s",
                    self.fallback_base_url,
                    exc,
                )
        if self.fallback_base_url:
            try:
                result = self._embed_at(self.fallback_base_url, values)
                self._using_fallback = True
                return result
            except EmbeddingError as fallback_error:
                if primary_error is not None:
                    raise EmbeddingError(
                        f"Embedding primary failed ({primary_error}); "
                        f"fallback failed ({fallback_error})"
                    ) from fallback_error
                raise
        if primary_error is not None:
            raise primary_error
        raise EmbeddingError("沒有可用的 embedding provider")

    def embed_query(self, text: str) -> List[float]:
        vectors = self.embed([text])
        if not vectors:
            raise EmbeddingError("Embedding API 沒有回傳查詢向量")
        return vectors[0]
