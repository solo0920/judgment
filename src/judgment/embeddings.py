from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urlparse

import httpx

logger = logging.getLogger(__name__)

_PRIMARY_COOLDOWNS: Dict[str, float] = {}
_COOLDOWN_LOCK = threading.Lock()
_LOCAL_HOSTNAMES = {"localhost", "127.0.0.1", "::1"}


def _is_local_url(url: str) -> bool:
    hostname = (urlparse(str(url or "")).hostname or "").lower()
    return hostname in _LOCAL_HOSTNAMES or hostname.startswith("127.")


def ollama_health_ok(base_url: str, timeout: float = 3.0) -> bool:
    """Return True when the Ollama HTTP service answers within the timeout."""
    if not base_url:
        return False
    try:
        response = httpx.get(
            f"{base_url.rstrip('/')}/api/tags",
            timeout=timeout,
        )
        response.raise_for_status()
        return True
    except Exception:
        return False


def _primary_cooldown_key(base_url: str, model: str) -> str:
    return f"{base_url}|{model}"


def _primary_down_until(key: str) -> float:
    with _COOLDOWN_LOCK:
        return _PRIMARY_COOLDOWNS.get(key, 0.0)


def _mark_primary_down(key: str, seconds: float) -> None:
    with _COOLDOWN_LOCK:
        _PRIMARY_COOLDOWNS[key] = time.monotonic() + max(0.0, float(seconds))


def _clear_primary_down(key: str) -> None:
    with _COOLDOWN_LOCK:
        _PRIMARY_COOLDOWNS.pop(key, None)


class EmbeddingError(RuntimeError):
    """Raised when an embedding provider cannot return usable vectors."""


def _normalized_models(payload: Dict[str, Any]) -> List[str]:
    models: List[str] = []
    for item in payload.get("models") or []:
        name = str(item.get("name") or item.get("model") or "").strip()
        if name:
            models.append(name)
    return models


def _model_in_available(models: Sequence[str], model: str) -> bool:
    available = set(models)
    target = str(model or "").strip()
    if not target:
        return False
    if target in available:
        return True
    # Ollama reports the implicit latest tag explicitly.
    if ":" not in target and f"{target}:latest" in available:
        return True
    return any(name.split(":", 1)[0] == target for name in available)


def ollama_model_available(base_url: str, model: str, timeout: float = 2.5) -> bool:
    if not base_url or not model:
        return False
    try:
        response = httpx.get(f"{base_url.rstrip('/')}/api/tags", timeout=timeout)
        response.raise_for_status()
        models = _normalized_models(response.json())
    except Exception:
        return False
    return _model_in_available(models, model)


def _ns_to_ms(value: Any) -> Optional[float]:
    try:
        return round(float(value) / 1_000_000, 2)
    except (TypeError, ValueError):
        return None


def _endpoint_info(url: str, model: str) -> Dict[str, Any]:
    text = str(url or "").strip().rstrip("/")
    parsed = urlparse(text)
    port = parsed.port or 11434
    return {
        "url": text,
        "host": parsed.hostname or "",
        "port": port,
        "model": str(model or ""),
    }


def _probe_embedding_host(
    base_url: str,
    model: str,
    *,
    timeout: float,
) -> Dict[str, Any]:
    info = _endpoint_info(base_url, model)
    try:
        response = httpx.get(
            f"{base_url.rstrip('/')}/api/tags", timeout=timeout
        )
        response.raise_for_status()
        models = _normalized_models(response.json())
    except Exception as exc:
        return {
            **info,
            "status": "unavailable",
            "health": "unavailable",
            "model_available": False,
            "models": [],
            "detail": f"{exc.__class__.__name__} · {base_url}",
        }
    available = _model_in_available(models, model)
    return {
        **info,
        "status": "operational" if available else "degraded",
        "health": "operational",
        "model_available": available,
        "models": models,
        "detail": (
            f"模型 {model} 可用"
            if available
            else f"服務正常，但找不到模型 {model}"
        ),
    }


def probe_embedding_hosts(
    *,
    primary_url: str,
    fallback_url: str,
    model: str,
    timeout: float = 3.0,
    fallback_urls: Sequence[str] = (),
) -> Dict[str, Any]:
    """Test the configured Ollama hosts and choose the first usable one.

    A host is usable only when ``/api/tags`` responds and the configured
    embedding model is present. The result is intentionally JSON-friendly so
    it can be stored in the shared processing state and displayed in the UI.
    """

    hosts: List[Dict[str, Any]] = []
    seen = set()
    candidates: List[tuple[str, str]] = [
        ("primary", primary_url),
        ("fallback", fallback_url),
    ]
    for index, url in enumerate(fallback_urls or ()):
        candidates.append((f"fallback-{index + 2}", url))
    for role, url in candidates:
        text = str(url or "").strip().rstrip("/")
        if not text or text in seen:
            continue
        seen.add(text)
        host = _probe_embedding_host(text, model, timeout=timeout)
        host["role"] = role
        hosts.append(host)
    selected = next(
        (host for host in hosts if host.get("status") == "operational"),
        None,
    )
    if selected is not None:
        error = ""
    elif not hosts:
        error = "EMBEDDING_URL 與 EMBEDDING_FALLBACK_URL 皆未設定"
    else:
        error = "找不到同時可連線且具備 embedding 模型的 Ollama 主機"
    return {
        "status": "operational" if selected is not None else "failed",
        "model": str(model or ""),
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "hosts": hosts,
        "selected": selected,
        "error": error,
    }


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
        query_timeout: Optional[float] = 2.0,
        health_timeout: Optional[float] = 2.0,
        fallback_base_url: str = "",
        fallback_base_urls: Sequence[str] = (),
        fallback_cooldown_seconds: float = 60.0,
    ) -> None:
        self.base_url = str(base_url or "").rstrip("/")
        fallback_urls: List[str] = []
        for raw_url in (fallback_base_url, *fallback_base_urls):
            url = str(raw_url or "").strip().rstrip("/")
            if url and url != self.base_url and url not in fallback_urls:
                fallback_urls.append(url)
        self._fallback_urls = tuple(fallback_urls)
        self.fallback_base_url = fallback_urls[0] if fallback_urls else ""
        self.model = str(model or "bge-m3")
        self.timeout = None if timeout is None else float(timeout)
        self.query_timeout = (
            None if query_timeout is None else float(query_timeout)
        )
        self.health_timeout = (
            None if health_timeout is None else float(health_timeout)
        )
        self.fallback_cooldown_seconds = max(
            0.0, float(fallback_cooldown_seconds)
        )
        self._cooldown_key = _primary_cooldown_key(self.base_url, self.model)
        self._using_fallback = False
        self._active_base_url = self.base_url
        self.last_call: Dict[str, Any] = {}

    @property
    def configured(self) -> bool:
        return bool(self.base_url or self._fallback_urls)

    @property
    def using_fallback(self) -> bool:
        return self._using_fallback

    @property
    def fallback_base_urls(self) -> tuple[str, ...]:
        return self._fallback_urls

    @property
    def active_base_url(self) -> str:
        return self._active_base_url

    def _embed_at(
        self,
        base_url: str,
        values: Sequence[str],
        *,
        timeout: Optional[float] = None,
    ) -> List[List[float]]:
        request_timeout = self.timeout if timeout is None else timeout
        started = time.perf_counter()
        try:
            response = httpx.post(
                f"{base_url}/api/embed",
                json={"model": self.model, "input": list(values)},
                timeout=request_timeout,
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
        prompt_eval_count = payload.get("prompt_eval_count")
        self.last_call = {
            "model": self.model,
            "base_url": base_url,
            "batch": len(values),
            "input_chars": sum(len(value) for value in values),
            "prompt_eval_count": (
                int(prompt_eval_count)
                if isinstance(prompt_eval_count, (int, float))
                else None
            ),
            "dimensions": len(result[0]) if result else None,
            "request_ms": round((time.perf_counter() - started) * 1000, 2),
            "total_duration_ms": _ns_to_ms(payload.get("total_duration")),
            "load_duration_ms": _ns_to_ms(payload.get("load_duration")),
            "eval_duration_ms": _ns_to_ms(payload.get("eval_duration")),
        }
        return result

    def embed(
        self,
        texts: Sequence[str],
        *,
        primary_timeout: Optional[float] = None,
        check_primary_health: bool = False,
    ) -> List[List[float]]:
        values = [str(text or "") for text in texts]
        if not values:
            return []
        if not self.configured:
            raise EmbeddingError("EMBEDDING_URL 未設定")
        self.last_call = {}
        down_until = _primary_down_until(self._cooldown_key)
        primary_available = bool(
            self.base_url
            and (time.monotonic() >= down_until or not self._fallback_urls)
        )
        primary_error: Optional[Exception] = None
        if primary_available:
            health_failed = bool(
                check_primary_health
                and self.health_timeout
                and not _is_local_url(self.base_url)
                and not ollama_health_ok(
                    self.base_url, timeout=self.health_timeout
                )
            )
            if health_failed:
                primary_error = EmbeddingError(
                    "Embedding API 健康檢查失敗或逾時"
                    f"（{self.health_timeout}s）：{self.base_url}"
                )
                _mark_primary_down(
                    self._cooldown_key, self.fallback_cooldown_seconds
                )
                if not self._fallback_urls:
                    raise primary_error
                logger.warning(
                    "Embedding primary health check failed; "
                    "trying fallback hosts: %s",
                    primary_error,
                )
            else:
                try:
                    result = self._embed_at(
                        self.base_url,
                        values,
                        timeout=primary_timeout,
                    )
                    if self._using_fallback:
                        logger.info(
                            "Embedding primary recovered: %s", self.base_url
                        )
                    self._using_fallback = False
                    self._active_base_url = self.base_url
                    self.last_call.update(
                        {
                            "fallback": False,
                            "fallback_used": False,
                            "active_base_url": self.base_url,
                        }
                    )
                    _clear_primary_down(self._cooldown_key)
                    return result
                except EmbeddingError as exc:
                    primary_error = exc
                    _mark_primary_down(
                        self._cooldown_key, self.fallback_cooldown_seconds
                    )
                    if not self._fallback_urls:
                        raise
                    logger.warning(
                        "Embedding primary unavailable; "
                        "trying fallback hosts: %s",
                        exc,
                    )
        elif self._fallback_urls:
            logger.debug(
                "Embedding primary cooling down; trying fallback hosts"
            )

        fallback_errors: List[tuple[str, Exception]] = []
        for url in self._fallback_urls:
            try:
                result = self._embed_at(url, values)
                self._using_fallback = True
                self._active_base_url = url
                self.last_call.update(
                    {
                        "fallback": True,
                        "fallback_used": True,
                        "active_base_url": url,
                    }
                )
                return result
            except EmbeddingError as exc:
                fallback_errors.append((url, exc))

        if primary_error is not None or fallback_errors:
            parts: List[str] = []
            if primary_error is not None:
                parts.append(f"Embedding primary failed ({primary_error})")
            for index, (url, exc) in enumerate(fallback_errors):
                label = (
                    "fallback"
                    if len(fallback_errors) == 1
                    else f"fallback {index + 1} ({url})"
                )
                parts.append(f"{label} failed ({exc})")
            last_error = (
                fallback_errors[-1][1] if fallback_errors else primary_error
            )
            raise EmbeddingError("; ".join(parts)) from last_error
        raise EmbeddingError("沒有可用的 embedding provider")

    def embed_query(self, text: str) -> List[float]:
        primary_timeout = (
            self.timeout
            if _is_local_url(self.base_url)
            else self.query_timeout
        )
        vectors = self.embed(
            [text],
            primary_timeout=primary_timeout,
            check_primary_health=True,
        )
        if not vectors:
            raise EmbeddingError("Embedding API 沒有回傳查詢向量")
        return vectors[0]
