from __future__ import annotations

import threading
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .embeddings import ollama_models_detail
from .models import OllamaModelCapability

RERANK_HINTS = ("rerank", "reranker")
SHOW_TIMEOUT_SECONDS = 15.0
CHAT_PROBE_TIMEOUT_SECONDS = 30.0

_CAPABILITY_LOCK = threading.Lock()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _base_url(settings: Settings) -> str:
    return str(settings.llm_url or settings.embedding_url or "").rstrip("/")


def _dedupe(names: Sequence[str]) -> List[str]:
    result: List[str] = []
    seen = set()
    for name in names:
        value = str(name or "").strip()
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _is_reranker(name: str) -> bool:
    lowered = name.lower()
    return any(hint in lowered for hint in RERANK_HINTS)


def _chat_probe(base_url: str, model: str) -> Dict[str, Any]:
    """Fallback for older Ollama versions without /api/show capabilities."""
    try:
        response = httpx.post(
            f"{base_url}/api/chat",
            json={
                "model": model,
                "messages": [{"role": "user", "content": "ping"}],
                "stream": False,
                "options": {"num_predict": 1, "temperature": 0},
            },
            timeout=CHAT_PROBE_TIMEOUT_SECONDS,
        )
    except Exception as exc:
        return {
            "ok": False,
            "error": f"{exc.__class__.__name__}: {exc}",
        }
    detail = response.text[:500]
    if response.status_code == 200:
        return {
            "ok": True,
            "supports_chat": True,
            "capabilities": [],
            "detail": "Ollama chat 端點回應成功。",
            "method": "chat",
        }
    if "does not support chat" in detail.lower():
        return {
            "ok": True,
            "supports_chat": False,
            "capabilities": [],
            "detail": "Ollama chat 端點回報此模型不支援 chat。",
            "method": "chat",
        }
    return {
        "ok": False,
        "error": f"HTTP {response.status_code}: {detail}",
    }


def probe_model_capability(
    base_url: str,
    model: str,
    *,
    timeout: float = SHOW_TIMEOUT_SECONDS,
) -> Dict[str, Any]:
    """Return the Ollama-declared chat capability for one model.

    A result with ``ok`` false is transient (network error or unknown status)
    and must not be persisted, so the next service test retries it.
    """
    url = f"{base_url.rstrip('/')}/api/show"
    try:
        response = httpx.post(url, json={"model": model}, timeout=timeout)
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        return {
            "ok": False,
            "error": f"{exc.__class__.__name__}: {exc}",
        }

    capabilities = _dedupe(
        [str(value) for value in (payload.get("capabilities") or [])]
    )
    reranker = _is_reranker(model)
    if reranker:
        return {
            "ok": True,
            "supports_chat": False,
            "capabilities": capabilities,
            "detail": "Reranker 模型，不列入 chat 評測。",
            "method": "show",
        }
    if not capabilities:
        return _chat_probe(base_url.rstrip("/"), model)

    supports_chat = "completion" in capabilities
    if supports_chat:
        detail = "Ollama 回報具備 completion 能力。"
    else:
        detail = (
            "Ollama 回報不支援 chat"
            f"（capabilities: {', '.join(capabilities)}）。"
        )
    return {
        "ok": True,
        "supports_chat": supports_chat,
        "capabilities": capabilities,
        "detail": detail,
        "method": "show",
    }


def _load_records(
    session_factory: sessionmaker[Session], base_url: str
) -> Dict[str, OllamaModelCapability]:
    with session_factory() as session:
        rows = session.scalars(
            select(OllamaModelCapability).where(
                OllamaModelCapability.base_url == base_url
            )
        ).all()
        return {row.model: row for row in rows}


def _serialize_record(
    record: OllamaModelCapability,
    *,
    tested_now: bool,
) -> Dict[str, Any]:
    return {
        "model": record.model,
        "supports_chat": bool(record.supports_chat),
        "status": "supported" if record.supports_chat else "unsupported",
        "capabilities": list(record.capabilities or []),
        "detail": record.detail,
        "tested_at": _iso(record.tested_at),
        "last_seen_at": _iso(record.last_seen_at),
        "tested_now": tested_now,
    }


def _snapshot(
    *,
    base_url: str,
    available: Sequence[str],
    detail: Dict[str, Any],
    records: Dict[str, OllamaModelCapability],
    new_models: Sequence[str],
    tested_now: Sequence[str],
    failures: Sequence[Dict[str, Any]],
) -> Dict[str, Any]:
    tested_set = set(tested_now)
    models: List[Dict[str, Any]] = []
    for name in available:
        record = records.get(name)
        if record is not None:
            models.append(
                _serialize_record(record, tested_now=name in tested_set)
            )
        else:
            models.append(
                {
                    "model": name,
                    "supports_chat": None,
                    "status": "untested",
                    "capabilities": [],
                    "detail": "尚未測試；下次 LLM 服務測試會自動檢查。",
                    "tested_at": None,
                    "last_seen_at": None,
                    "tested_now": False,
                }
            )
    chat_models = [
        item["model"] for item in models if item["supports_chat"] is True
    ]
    return {
        "status": detail.get("status") or "degraded",
        "detail": detail.get("detail") or "",
        "base_url": base_url,
        "checked_at": _iso(_now()),
        "available": list(available),
        "models": models,
        "chat_models": chat_models,
        "new_models": list(new_models),
        "tested_now": list(tested_now),
        "failures": list(failures),
        "counts": {
            "available": len(available),
            "chat": len(chat_models),
            "unsupported": sum(
                1 for item in models if item["status"] == "unsupported"
            ),
            "untested": sum(
                1 for item in models if item["status"] == "untested"
            ),
        },
    }


def refresh_model_capabilities(
    session_factory: sessionmaker[Session],
    settings: Settings,
) -> Dict[str, Any]:
    """Check Ollama for new models and record chat support once per model."""
    base_url = _base_url(settings)
    detail = ollama_models_detail(base_url) if base_url else {
        "status": "not_configured",
        "models": [],
        "detail": "未設定 Ollama URL",
    }
    available = _dedupe(
        [str(item) for item in (detail.get("models") or []) if str(item).strip()]
    )
    with _CAPABILITY_LOCK:
        records = _load_records(session_factory, base_url)
        new_models = [name for name in available if name not in records]
        tested_now: List[str] = []
        failures: List[Dict[str, Any]] = []
        for name in new_models:
            probe = probe_model_capability(base_url, name)
            if not probe.get("ok"):
                failures.append(
                    {
                        "model": name,
                        "detail": str(probe.get("error") or "測試失敗"),
                    }
                )
                continue
            now = _now()
            with session_factory() as session:
                session.add(
                    OllamaModelCapability(
                        base_url=base_url,
                        model=name,
                        supports_chat=bool(probe.get("supports_chat")),
                        capabilities=list(probe.get("capabilities") or []),
                        detail=str(probe.get("detail") or ""),
                        tested_at=now,
                        last_seen_at=now,
                    )
                )
                session.commit()
            tested_now.append(name)

        if available:
            now = _now()
            with session_factory() as session:
                rows = session.scalars(
                    select(OllamaModelCapability).where(
                        OllamaModelCapability.base_url == base_url,
                        OllamaModelCapability.model.in_(available),
                    )
                ).all()
                for row in rows:
                    row.last_seen_at = now
                session.commit()
        records = _load_records(session_factory, base_url)

    return _snapshot(
        base_url=base_url,
        available=available,
        detail=detail,
        records=records,
        new_models=new_models,
        tested_now=tested_now,
        failures=failures,
    )


def model_capability_status(
    session_factory: sessionmaker[Session],
    settings: Settings,
) -> Dict[str, Any]:
    """Return current Ollama models merged with recorded chat capabilities."""
    base_url = _base_url(settings)
    detail = ollama_models_detail(base_url) if base_url else {
        "status": "not_configured",
        "models": [],
        "detail": "未設定 Ollama URL",
    }
    available = _dedupe(
        [str(item) for item in (detail.get("models") or []) if str(item).strip()]
    )
    records = _load_records(session_factory, base_url)
    return _snapshot(
        base_url=base_url,
        available=available,
        detail=detail,
        records=records,
        new_models=[name for name in available if name not in records],
        tested_now=[],
        failures=[],
    )
