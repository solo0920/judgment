from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urlparse

import httpx

from .llm_backends import (
    OLLAMA_API,
    embeddings_url,
    health_url,
    is_openai_api,
    normalize_api,
)

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


def provider_health_ok(
    base_url: str,
    api: str | None = OLLAMA_API,
    timeout: float = 3.0,
) -> bool:
    """Return True when the configured provider answers within the timeout."""

    if not base_url:
        return False
    if not is_openai_api(api):
        return ollama_health_ok(base_url, timeout=timeout)
    try:
        response = httpx.get(
            health_url(base_url, api),
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


class EmbeddingInputError(EmbeddingError):
    """Raised when the provider rejects the input length or shape.

    This is not a host failure.  Index builders can split the batch and retry
    on the same host instead of cooling the host down or switching to a
    fallback provider.
    """


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


def _normalized_openai_models(payload: Dict[str, Any]) -> List[str]:
    models: List[str] = []
    for item in payload.get("data") or payload.get("models") or []:
        if isinstance(item, str):
            name = item.strip()
        elif isinstance(item, dict):
            name = str(item.get("id") or item.get("name") or "").strip()
        else:
            name = ""
        if name and name not in models:
            models.append(name)
    return models


def _openai_models_probe(
    base_url: str, timeout: float
) -> tuple[Optional[List[str]], str]:
    try:
        response = httpx.get(
            f"{base_url.rstrip('/')}/v1/models", timeout=timeout
        )
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            return None, "模型列表格式無法解析"
        return _normalized_openai_models(payload), ""
    except Exception as exc:
        return None, f"{exc.__class__.__name__} · {base_url}"


def provider_model_available(
    base_url: str,
    model: str,
    api: str | None = OLLAMA_API,
    timeout: float = 2.5,
) -> bool:
    if not base_url or not model:
        return False
    if not is_openai_api(api):
        return ollama_model_available(base_url, model, timeout=timeout)
    detail = provider_models_detail(base_url, api, timeout=timeout)
    if detail.get("status") != "operational":
        return False
    models = list(detail.get("models") or [])
    if not models:
        # Single-model llama-server instances may expose /health but an
        # incomplete /v1/models payload; a ready server is sufficient.
        return bool(detail.get("health_ok"))
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
    api: str = OLLAMA_API,
) -> Dict[str, Any]:
    info = _endpoint_info(base_url, model)
    info["api"] = normalize_api(api)
    detail = provider_models_detail(base_url, api, timeout=timeout)
    if detail["status"] != "operational":
        return {
            **info,
            "status": "unavailable",
            "health": "unavailable",
            "model_available": False,
            "models": [],
            "detail": detail.get("detail") or f"無法連線 {base_url}",
        }
    models = list(detail.get("models") or [])
    if models:
        available = _model_in_available(models, model)
    else:
        # A single-model llama-server may expose /health with an incomplete
        # /v1/models payload; a ready OpenAI-compatible server is sufficient.
        available = bool(detail.get("health_ok")) and is_openai_api(api)
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
    primary_api: str = OLLAMA_API,
    fallback_api: str = OLLAMA_API,
    fallback_apis: Sequence[str] = (),
) -> Dict[str, Any]:
    """Test the configured embedding hosts and choose the first usable one.

    A host is usable only when its provider API responds and the configured
    embedding model is present. The result is intentionally JSON-friendly so
    it can be stored in the shared processing state and displayed in the UI.
    """

    hosts: List[Dict[str, Any]] = []
    seen = set()
    candidates: List[tuple[str, str, str]] = [
        ("primary", primary_url, normalize_api(primary_api)),
        ("fallback", fallback_url, normalize_api(fallback_api)),
    ]
    for index, url in enumerate(fallback_urls or ()):
        api = (
            fallback_apis[index]
            if index < len(fallback_apis or ())
            else fallback_api
        )
        candidates.append((f"fallback-{index + 2}", url, normalize_api(api)))
    for role, url, api in candidates:
        text = str(url or "").strip().rstrip("/")
        if not text or text in seen:
            continue
        seen.add(text)
        host = _probe_embedding_host(
            text, model, timeout=timeout, api=api
        )
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
        error = "找不到同時可連線且具備 embedding 模型的服務"
    return {
        "status": "operational" if selected is not None else "failed",
        "model": str(model or ""),
        "tested_at": datetime.now(timezone.utc).isoformat(),
        "hosts": hosts,
        "selected": selected,
        "error": error,
    }


def ollama_models_detail(base_url: str, timeout: float = 2.5) -> Dict[str, Any]:
    return provider_models_detail(base_url, OLLAMA_API, timeout=timeout)


def provider_models_detail(
    base_url: str,
    api: str | None = OLLAMA_API,
    timeout: float = 2.5,
) -> Dict[str, Any]:
    if not base_url:
        return {
            "status": "not_configured",
            "models": [],
            "detail": "未設定",
            "api": normalize_api(api),
        }
    if not is_openai_api(api):
        try:
            response = httpx.get(
                f"{base_url.rstrip('/')}/api/tags", timeout=timeout
            )
            response.raise_for_status()
            models = _normalized_models(response.json())
            return {
                "status": "operational",
                "models": models,
                "detail": f"{len(models)} 個模型",
                "api": OLLAMA_API,
                "health_ok": True,
            }
        except Exception as exc:
            return {
                "status": "degraded",
                "models": [],
                "detail": f"{exc.__class__.__name__} · {base_url}",
                "api": OLLAMA_API,
                "health_ok": False,
            }

    models, error = _openai_models_probe(base_url, timeout)
    health_ok = provider_health_ok(base_url, api, timeout=timeout)
    if models is not None:
        detail = f"{len(models)} 個模型" if models else "模型列表為空"
        return {
            "status": "operational" if health_ok or models else "degraded",
            "models": models,
            "detail": detail,
            "api": "openai",
            "health_ok": health_ok,
        }
    if health_ok:
        return {
            "status": "operational",
            "models": [],
            "detail": "health OK（模型列表不可用）",
            "api": "openai",
            "health_ok": True,
        }
    return {
        "status": "degraded",
        "models": [],
        "detail": f"{error}；health 未回應",
        "api": "openai",
        "health_ok": False,
    }


class OllamaEmbedder:
    def __init__(
        self,
        base_url: str,
        model: str = "bge-m3",
        *,
        api: str = OLLAMA_API,
        timeout: Optional[float] = 120.0,
        query_timeout: Optional[float] = 2.0,
        health_timeout: Optional[float] = 2.0,
        fallback_base_url: str = "",
        fallback_api: str = OLLAMA_API,
        fallback_base_urls: Sequence[str] = (),
        fallback_apis: Sequence[str] = (),
        fallback_cooldown_seconds: float = 60.0,
    ) -> None:
        self.base_url = str(base_url or "").rstrip("/")
        self.api = normalize_api(api)
        fallback_candidates: List[tuple[str, str]] = []
        raw_fallbacks = (fallback_base_url, *fallback_base_urls)
        for index, raw_url in enumerate(raw_fallbacks):
            url = str(raw_url or "").strip().rstrip("/")
            if not url or url == self.base_url:
                continue
            if any(existing == url for existing, _ in fallback_candidates):
                continue
            api_value = (
                fallback_apis[index]
                if index < len(fallback_apis or ())
                else fallback_api
            )
            fallback_candidates.append((url, normalize_api(api_value)))
        self._fallback_providers = tuple(fallback_candidates)
        self._fallback_urls = tuple(url for url, _ in fallback_candidates)
        self.fallback_base_url = (
            fallback_candidates[0][0] if fallback_candidates else ""
        )
        self.fallback_api = normalize_api(fallback_api)
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
    def fallback_apis(self) -> tuple[str, ...]:
        return tuple(api for _, api in self._fallback_providers)

    @property
    def active_base_url(self) -> str:
        return self._active_base_url

    def _embed_at(
        self,
        base_url: str,
        values: Sequence[str],
        *,
        api: Optional[str] = None,
        timeout: Optional[float] = None,
    ) -> List[List[float]]:
        request_timeout = self.timeout if timeout is None else timeout
        api_kind = normalize_api(api or self.api)
        started = time.perf_counter()
        try:
            response = httpx.post(
                embeddings_url(base_url, api_kind),
                json={"model": self.model, "input": list(values)},
                timeout=request_timeout,
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:300]
            error_type = EmbeddingError
            if exc.response.status_code == 413 or (
                exc.response.status_code == 400
                and any(
                    marker in detail.lower()
                    for marker in ("context", "too long", "exceed")
                )
            ):
                error_type = EmbeddingInputError
            raise error_type(
                f"Embedding API HTTP {exc.response.status_code}: {detail}"
            ) from exc
        except Exception as exc:
            raise EmbeddingError(
                f"Embedding API 無法連線：{exc.__class__.__name__}: {exc}"
            ) from exc

        if is_openai_api(api_kind):
            raw_items = payload.get("data")
            if not isinstance(raw_items, list) or len(raw_items) != len(values):
                raise EmbeddingError("Embedding API 回傳的向量數量不符")
            ordered: List[Optional[Dict[str, Any]]] = [None] * len(values)
            for position, item in enumerate(raw_items):
                if not isinstance(item, dict):
                    continue
                try:
                    index = int(item.get("index", position))
                except (TypeError, ValueError):
                    index = position
                if 0 <= index < len(ordered):
                    ordered[index] = item
            embeddings = [
                item.get("embedding") if item is not None else None
                for item in ordered
            ]
            usage = payload.get("usage") or {}
            prompt_eval_count = (
                usage.get("prompt_tokens")
                if isinstance(usage, dict)
                else None
            )
        else:
            embeddings = payload.get("embeddings")
            prompt_eval_count = payload.get("prompt_eval_count")
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
        self.last_call = {
            "model": self.model,
            "base_url": base_url,
            "api": api_kind,
            "batch": len(values),
            "input_chars": sum(len(value) for value in values),
            "prompt_eval_count": (
                int(prompt_eval_count)
                if isinstance(prompt_eval_count, (int, float))
                else None
            ),
            "dimensions": len(result[0]) if result else None,
            "request_ms": round((time.perf_counter() - started) * 1000, 2),
            "total_duration_ms": (
                _ns_to_ms(payload.get("total_duration"))
                if not is_openai_api(api_kind)
                else None
            ),
            "load_duration_ms": (
                _ns_to_ms(payload.get("load_duration"))
                if not is_openai_api(api_kind)
                else None
            ),
            "eval_duration_ms": (
                _ns_to_ms(payload.get("eval_duration"))
                if not is_openai_api(api_kind)
                else None
            ),
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
                and not provider_health_ok(
                    self.base_url, self.api, timeout=self.health_timeout
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
                        api=self.api,
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
                except EmbeddingInputError:
                    # Bad input is not a host outage.  Let the caller split or
                    # truncate the batch and retry the same host.
                    raise
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
        for url, api in self._fallback_providers:
            try:
                result = self._embed_at(url, values, api=api)
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
            except EmbeddingInputError:
                raise
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
