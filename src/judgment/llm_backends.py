from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Mapping, Optional, Sequence

OLLAMA_API = "ollama"
OPENAI_API = "openai"

_OPENAI_ALIASES = {
    "openai",
    "openai-compatible",
    "openai_compatible",
    "llama-server",
    "llama_server",
    "llamacpp",
    "llama.cpp",
    "v1",
}
_OLLAMA_ALIASES = {"ollama", "native", "ollama-native", "ollama_native"}


def normalize_api(value: str | None, *, default: str = OLLAMA_API) -> str:
    """Return the canonical API kind for a configured backend."""

    text = str(value or "").strip().lower()
    if text in _OPENAI_ALIASES:
        return OPENAI_API
    if text in _OLLAMA_ALIASES:
        return OLLAMA_API
    return default


def is_openai_api(value: str | None) -> bool:
    return normalize_api(value) == OPENAI_API


def chat_url(base_url: str, api: str | None = OLLAMA_API) -> str:
    base = str(base_url or "").rstrip("/")
    if is_openai_api(api):
        return f"{base}/v1/chat/completions"
    return f"{base}/api/chat"


def embeddings_url(base_url: str, api: str | None = OLLAMA_API) -> str:
    base = str(base_url or "").rstrip("/")
    if is_openai_api(api):
        return f"{base}/v1/embeddings"
    return f"{base}/api/embed"


def models_url(base_url: str, api: str | None = OLLAMA_API) -> str:
    base = str(base_url or "").rstrip("/")
    if is_openai_api(api):
        return f"{base}/v1/models"
    return f"{base}/api/tags"


def health_url(base_url: str, api: str | None = OLLAMA_API) -> str:
    base = str(base_url or "").rstrip("/")
    if is_openai_api(api):
        return f"{base}/health"
    return f"{base}/api/tags"


def chat_payload(
    *,
    api: str | None,
    model: str,
    messages: Sequence[Mapping[str, str]],
    stream: bool,
    temperature: float = 0.1,
    num_predict: Optional[int] = None,
    num_ctx: Optional[int] = None,
    json_mode: bool = False,
    keep_alive: Any = None,
) -> Dict[str, Any]:
    """Build a chat request for the configured API kind.

    Ollama keeps its native ``options`` and ``keep_alive`` fields.  The
    OpenAI-compatible path used by llama-server only sends standard fields;
    context size is a server launch flag (``--ctx-size``), not a request
    parameter.
    """

    api_kind = normalize_api(api)
    if api_kind == OPENAI_API:
        payload: Dict[str, Any] = {
            "model": model,
            "messages": [dict(message) for message in messages],
            "stream": bool(stream),
            "temperature": float(temperature),
        }
        if num_predict is not None and int(num_predict) > 0:
            payload["max_tokens"] = int(num_predict)
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        return payload

    options: Dict[str, Any] = {"temperature": float(temperature)}
    if num_ctx is not None and int(num_ctx) > 0:
        options["num_ctx"] = int(num_ctx)
    if num_predict is not None and int(num_predict) > 0:
        options["num_predict"] = int(num_predict)
    payload = {
        "model": model,
        "messages": [dict(message) for message in messages],
        "stream": bool(stream),
        "options": options,
    }
    if keep_alive is not None:
        payload["keep_alive"] = keep_alive
    if json_mode:
        payload["format"] = "json"
    return payload


def chat_content(api: str | None, payload: Mapping[str, Any]) -> str:
    if is_openai_api(api):
        choices = payload.get("choices") or []
        if not isinstance(choices, list) or not choices:
            return ""
        first = choices[0] if isinstance(choices[0], Mapping) else {}
        message = first.get("message") or {}
        if not isinstance(message, Mapping):
            return ""
        return str(message.get("content") or "")
    message = payload.get("message") or {}
    if not isinstance(message, Mapping):
        return ""
    return str(message.get("content") or "")


def chat_usage(api: str | None, payload: Mapping[str, Any]) -> Dict[str, Any]:
    """Return token usage plus Ollama-only duration metrics."""

    if is_openai_api(api):
        usage = payload.get("usage") or {}
        if not isinstance(usage, Mapping):
            usage = {}
        return {
            "input_tokens": usage.get("prompt_tokens"),
            "output_tokens": usage.get("completion_tokens"),
            "total_duration_ms": None,
            "load_duration_ms": None,
            "eval_duration_ms": None,
        }
    return {
        "input_tokens": payload.get("prompt_eval_count"),
        "output_tokens": payload.get("eval_count"),
        "total_duration_ms": payload.get("total_duration"),
        "load_duration_ms": payload.get("load_duration"),
        "eval_duration_ms": payload.get("eval_duration"),
    }


def stream_delta(api: str | None, event: Mapping[str, Any]) -> tuple[str, bool]:
    """Return ``(content, done)`` for one streaming event."""

    if is_openai_api(api):
        choices = event.get("choices") or []
        content = ""
        done = False
        if isinstance(choices, list) and choices:
            first = choices[0] if isinstance(choices[0], Mapping) else {}
            delta = first.get("delta") or {}
            if isinstance(delta, Mapping):
                content = str(delta.get("content") or "")
            done = bool(first.get("finish_reason"))
        return content, done
    content = ""
    message = event.get("message") or {}
    if isinstance(message, Mapping):
        content = str(message.get("content") or "")
    return content, bool(event.get("done"))


@dataclass(frozen=True)
class ChatProvider:
    role: str
    base_url: str
    api: str
    model: str


def chat_providers(settings, model: str | None = None) -> List[ChatProvider]:
    """Return the ordered LLM providers for chat requests."""

    primary_model = str(model or getattr(settings, "llm_model", "") or "").strip()
    primary_url = str(getattr(settings, "llm_url", "") or "").strip().rstrip("/")
    providers: List[ChatProvider] = []
    if primary_url and primary_model:
        providers.append(
            ChatProvider(
                role="primary",
                base_url=primary_url,
                api=normalize_api(getattr(settings, "llm_api", OLLAMA_API)),
                model=primary_model,
            )
        )
    fallback_url = (
        str(getattr(settings, "llm_fallback_url", "") or "").strip().rstrip("/")
    )
    if fallback_url and fallback_url != primary_url:
        fallback_model = str(
            getattr(settings, "llm_fallback_model", "") or primary_model
        ).strip()
        providers.append(
            ChatProvider(
                role="fallback",
                base_url=fallback_url,
                api=normalize_api(
                    getattr(settings, "llm_fallback_api", OLLAMA_API)
                ),
                model=fallback_model,
            )
        )
    return providers
