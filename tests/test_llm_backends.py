from __future__ import annotations

from pathlib import Path

from judgment.config import Settings
from judgment.llm_backends import (
    OPENAI_API,
    OLLAMA_API,
    chat_content,
    chat_payload,
    chat_providers,
    chat_url,
    chat_usage,
    embeddings_url,
    normalize_api,
    stream_delta,
)


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("data/laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
    }
    values.update(overrides)
    return Settings(**values)


def test_normalize_api_accepts_openai_and_llama_server_aliases() -> None:
    for value in ("openai", "openai-compatible", "llama-server", "llamacpp"):
        assert normalize_api(value) == OPENAI_API
    assert normalize_api("ollama") == OLLAMA_API
    assert normalize_api(None) == OLLAMA_API
    assert normalize_api("unknown") == OLLAMA_API


def test_openai_chat_payload_uses_standard_fields_only() -> None:
    payload = chat_payload(
        api=OPENAI_API,
        model="gemma3:4b",
        messages=[{"role": "user", "content": "hi"}],
        stream=False,
        num_predict=128,
        num_ctx=4096,
        json_mode=True,
        keep_alive="-1",
    )
    assert payload["model"] == "gemma3:4b"
    assert payload["max_tokens"] == 128
    assert payload["response_format"] == {"type": "json_object"}
    assert "options" not in payload
    assert "keep_alive" not in payload
    assert chat_url("http://x570:11436", OPENAI_API).endswith(
        "/v1/chat/completions"
    )
    assert embeddings_url("http://x570:11437", OPENAI_API).endswith(
        "/v1/embeddings"
    )


def test_ollama_chat_payload_keeps_native_options() -> None:
    payload = chat_payload(
        api=OLLAMA_API,
        model="gemma3:4b",
        messages=[{"role": "user", "content": "hi"}],
        stream=True,
        num_predict=128,
        num_ctx=4096,
        json_mode=True,
        keep_alive="-1",
    )
    assert payload["options"] == {
        "temperature": 0.1,
        "num_ctx": 4096,
        "num_predict": 128,
    }
    assert payload["keep_alive"] == "-1"
    assert payload["format"] == "json"
    assert chat_url("http://mbp:11434", OLLAMA_API).endswith("/api/chat")


def test_openai_chat_response_parsing_and_usage() -> None:
    payload = {
        "choices": [{"message": {"content": "答案 [1]"}}],
        "usage": {"prompt_tokens": 12, "completion_tokens": 5},
    }
    assert chat_content(OPENAI_API, payload) == "答案 [1]"
    usage = chat_usage(OPENAI_API, payload)
    assert usage["input_tokens"] == 12
    assert usage["output_tokens"] == 5
    assert usage["total_duration_ms"] is None

    assert (
        chat_content(OLLAMA_API, {"message": {"content": "Ollama 答案"}})
        == "Ollama 答案"
    )
    ollama_usage = chat_usage(
        OLLAMA_API,
        {
            "prompt_eval_count": 9,
            "eval_count": 4,
            "total_duration": 2_000_000,
        },
    )
    assert ollama_usage["input_tokens"] == 9
    assert ollama_usage["output_tokens"] == 4
    assert ollama_usage["total_duration_ms"] == 2_000_000


def test_stream_delta_handles_openai_sse_and_ollama_json() -> None:
    content, done = stream_delta(
        OPENAI_API,
        {"choices": [{"delta": {"content": "測"}, "finish_reason": None}]},
    )
    assert (content, done) == ("測", False)
    content, done = stream_delta(
        OPENAI_API,
        {"choices": [{"delta": {}, "finish_reason": "stop"}]},
    )
    assert (content, done) == ("", True)
    content, done = stream_delta(
        OLLAMA_API,
        {"message": {"content": "試"}, "done": False},
    )
    assert (content, done) == ("試", False)


def test_chat_providers_prefers_openai_primary_and_ollama_fallback() -> None:
    settings = _settings(
        llm_url="http://x570:11436",
        llm_api="openai",
        llm_model="gemma3:4b",
        llm_fallback_url="http://127.0.0.1:11434",
        llm_fallback_model="gemma3:4b",
        llm_fallback_api="ollama",
    )
    providers = chat_providers(settings)
    assert [provider.role for provider in providers] == ["primary", "fallback"]
    assert providers[0].api == OPENAI_API
    assert providers[0].base_url == "http://x570:11436"
    assert providers[1].api == OLLAMA_API
    assert providers[1].base_url == "http://127.0.0.1:11434"


def test_chat_providers_skips_duplicate_fallback_url() -> None:
    settings = _settings(
        llm_url="http://x570:11436",
        llm_api="openai",
        llm_model="gemma3:4b",
        llm_fallback_url="http://x570:11436",
        llm_fallback_api="ollama",
    )
    assert len(chat_providers(settings)) == 1


def test_settings_from_env_reads_api_kinds_and_fallbacks(monkeypatch) -> None:
    monkeypatch.setenv("LLM_URL", "http://x570:11436")
    monkeypatch.setenv("LLM_API", "openai")
    monkeypatch.setenv("LLM_MODEL", "gemma3:4b")
    monkeypatch.setenv("LLM_FALLBACK_URL", "http://127.0.0.1:11434")
    monkeypatch.setenv("LLM_FALLBACK_MODEL", "gemma3:4b")
    monkeypatch.setenv("LLM_FALLBACK_API", "ollama")
    monkeypatch.setenv("EMBEDDING_URL", "http://x570:11437")
    monkeypatch.setenv("EMBEDDING_API", "openai")
    monkeypatch.setenv("EMBEDDING_FALLBACK_URL", "http://127.0.0.1:11434")
    monkeypatch.setenv("EMBEDDING_FALLBACK_API", "ollama")
    monkeypatch.setenv(
        "EMBEDDING_FAILOVER_URLS", "http://second:11437,http://third:11434"
    )
    monkeypatch.setenv("EMBEDDING_FAILOVER_APIS", "openai,ollama")

    settings = Settings.from_env()
    assert settings.llm_api == OPENAI_API
    assert settings.llm_fallback_url == "http://127.0.0.1:11434"
    assert settings.llm_fallback_api == OLLAMA_API
    assert settings.embedding_api == OPENAI_API
    assert settings.embedding_fallback_api == OLLAMA_API
    assert settings.embedding_failover_apis == (OPENAI_API, OLLAMA_API)
