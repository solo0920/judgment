from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from .config import Settings
from .models import OllamaHost, OllamaModelCapability

MODEL_ROLES = ("chat", "embedding")


class OllamaHostError(ValueError):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _clear_llm_preference(session_factory) -> None:
    from .runtime_settings import set_llm_model_preference

    set_llm_model_preference(session_factory, model="", base_url="")


def normalize_host_url(url: str, port: int) -> Tuple[str, int]:
    raw = str(url or "").strip() or "http://127.0.0.1"
    if "://" not in raw:
        raw = f"http://{raw}"
    parsed = urlparse(raw)
    if parsed.scheme not in {"http", "https"}:
        raise OllamaHostError("Ollama 主機網址只支援 http 或 https。")
    hostname = parsed.hostname
    if not hostname:
        raise OllamaHostError("Ollama 主機網址缺少主機名稱。")
    try:
        chosen_port = int(parsed.port or port or 11434)
    except (TypeError, ValueError) as exc:
        raise OllamaHostError("連接埠必須是 1-65535 的整數。") from exc
    if not 1 <= chosen_port <= 65535:
        raise OllamaHostError("連接埠必須是 1-65535 的整數。")
    return f"{parsed.scheme}://{hostname}:{chosen_port}", chosen_port


def _serialize_host(host: OllamaHost) -> Dict[str, Any]:
    return {
        "id": host.id,
        "name": host.name or host.base_url,
        "base_url": host.base_url,
        "port": host.port,
        "is_active": bool(host.is_active),
        "priority": int(host.priority or 0),
        "chat_model": host.chat_model or "",
        "embedding_model": host.embedding_model or "",
        "created_at": _iso(host.created_at),
        "updated_at": _iso(host.updated_at),
    }


def _probe_host(base_url: str, timeout: float) -> Dict[str, Any]:
    url = f"{base_url.rstrip('/')}/api/tags"
    try:
        response = httpx.get(url, timeout=timeout)
        response.raise_for_status()
        payload = response.json()
    except Exception as exc:
        return {
            "status": "degraded",
            "detail": f"{exc.__class__.__name__} · {base_url}",
            "models": [],
        }
    models: List[Dict[str, Any]] = []
    for item in payload.get("models") or []:
        name = str(item.get("name") or item.get("model") or "").strip()
        if not name:
            continue
        models.append(
            {
                "name": name,
                "size": item.get("size"),
                "modified_at": item.get("modified_at"),
                "details": item.get("details") or {},
            }
        )
    return {
        "status": "operational",
        "detail": f"{len(models)} 個模型",
        "models": models,
    }


def _load_capability_index(
    session_factory,
    base_urls: List[str],
) -> Dict[Tuple[str, str], OllamaModelCapability]:
    urls = [str(url or "").rstrip("/") for url in base_urls if url]
    if not urls:
        return {}
    with session_factory() as session:
        rows = session.scalars(
            select(OllamaModelCapability).where(
                OllamaModelCapability.base_url.in_(urls)
            )
        ).all()
    return {
        (str(row.base_url or "").rstrip("/"), str(row.model or "")): row
        for row in rows
    }


def _merge_model_capabilities(
    hosts: List[Dict[str, Any]],
    capabilities: Dict[Tuple[str, str], OllamaModelCapability],
) -> None:
    for host in hosts:
        base_url = str(host.get("base_url") or "").rstrip("/")
        models = host.get("models")
        models = models if isinstance(models, list) else []
        for model in models:
            name = str(model.get("name") or "")
            record = capabilities.get((base_url, name))
            if record is None:
                model["capabilities"] = []
                model["supports_chat"] = None
                model["capability_status"] = "untested"
                model["capability_detail"] = (
                    "尚未測試；可使用「檢查模型能力」更新。"
                )
            else:
                model["capabilities"] = list(record.capabilities or [])
                model["supports_chat"] = bool(record.supports_chat)
                model["capability_status"] = "tested"
                model["capability_detail"] = record.detail or ""
            lowered = name.lower()
            model["is_reranker"] = any(
                hint in lowered for hint in ("rerank", "reranker")
            )
        host["chat_models"] = [
            str(model.get("name") or "")
            for model in models
            if model.get("supports_chat") is True
        ]


def list_hosts(
    session_factory,
    *,
    timeout: float = 2.5,
) -> Dict[str, Any]:
    with session_factory() as session:
        rows = list(
            session.scalars(
                select(OllamaHost).order_by(
                    OllamaHost.priority.asc(), OllamaHost.id.asc()
                )
            ).all()
        )
        hosts = [_serialize_host(row) for row in rows]
    if not hosts:
        return {"hosts": [], "active_host_id": None}
    with ThreadPoolExecutor(max_workers=min(8, len(hosts))) as executor:
        probes = list(
            executor.map(
                lambda host: _probe_host(host["base_url"], timeout),
                hosts,
            )
        )
    for host, probe in zip(hosts, probes):
        host.update(probe)
    capabilities = _load_capability_index(
        session_factory, [str(host["base_url"]) for host in hosts]
    )
    _merge_model_capabilities(hosts, capabilities)
    active = next((host["id"] for host in hosts if host["is_active"]), None)
    return {"hosts": hosts, "active_host_id": active}


def add_host(
    session_factory,
    *,
    name: str,
    url: str,
    port: int,
) -> Dict[str, Any]:
    base_url, chosen_port = normalize_host_url(url, port)
    with session_factory() as session:
        existing = session.scalars(
            select(OllamaHost).where(OllamaHost.base_url == base_url)
        ).first()
        if existing is not None:
            raise OllamaHostError(f"主機已存在：{base_url}")
        rows = list(session.scalars(select(OllamaHost)).all())
        next_priority = (
            max((int(row.priority or 0) for row in rows), default=-10) + 10
        )
        host = OllamaHost(
            name=str(name or "").strip()[:120],
            base_url=base_url,
            port=chosen_port,
            is_active=False,
            priority=next_priority,
        )
        session.add(host)
        session.commit()
        session.refresh(host)
        return _serialize_host(host)


def update_host(
    session_factory,
    host_id: int,
    *,
    name: str,
    url: str,
    port: int,
) -> Dict[str, Any]:
    base_url, chosen_port = normalize_host_url(url, port)
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            raise OllamaHostError("找不到 Ollama 主機。")
        duplicate = session.scalars(
            select(OllamaHost).where(
                OllamaHost.base_url == base_url,
                OllamaHost.id != host.id,
            )
        ).first()
        if duplicate is not None:
            raise OllamaHostError(f"主機已存在：{base_url}")
        host.name = str(name or "").strip()[:120]
        host.base_url = base_url
        host.port = chosen_port
        session.commit()
        session.refresh(host)
        _clear_llm_preference(session_factory)
        return _serialize_host(host)


def delete_host(session_factory, host_id: int) -> bool:
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            return False
        session.delete(host)
        session.commit()
        _clear_llm_preference(session_factory)
        return True


def activate_host(session_factory, host_id: int) -> Dict[str, Any]:
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            raise OllamaHostError("找不到 Ollama 主機。")
        rows = list(
            session.scalars(
                select(OllamaHost).order_by(
                    OllamaHost.priority.asc(), OllamaHost.id.asc()
                )
            ).all()
        )
        ordered = [host] + [row for row in rows if row.id != host.id]
        for index, row in enumerate(ordered):
            row.priority = index * 10
            row.is_active = row.id == host.id
        session.commit()
        session.refresh(host)
        _clear_llm_preference(session_factory)
        return _serialize_host(host)


def reorder_hosts(session_factory, host_ids: List[int]) -> Dict[str, Any]:
    """Persist the embedding/LLM host priority order.

    The first host becomes the preferred host; the remaining hosts are tried
    in the submitted order when the preferred embedding host is unavailable.
    """

    ordered_ids: List[int] = []
    for value in host_ids or []:
        try:
            host_id = int(value)
        except (TypeError, ValueError) as exc:
            raise OllamaHostError("主機順序包含無效的 id。") from exc
        if host_id in ordered_ids:
            raise OllamaHostError("主機順序不可包含重複項目。")
        ordered_ids.append(host_id)
    if not ordered_ids:
        raise OllamaHostError("主機順序不可為空。")
    with session_factory() as session:
        rows = list(session.scalars(select(OllamaHost)).all())
        by_id = {row.id: row for row in rows}
        if set(ordered_ids) != set(by_id):
            raise OllamaHostError("主機順序必須包含目前所有 Ollama 主機。")
        for index, host_id in enumerate(ordered_ids):
            row = by_id[host_id]
            row.priority = index * 10
            row.is_active = index == 0
        session.commit()
    _clear_llm_preference(session_factory)
    return {
        "status": "ok",
        "host_ids": ordered_ids,
        "active_host_id": ordered_ids[0],
    }


def deactivate_hosts(session_factory) -> Dict[str, Any]:
    with session_factory() as session:
        rows = list(session.scalars(select(OllamaHost)).all())
        for row in rows:
            row.is_active = False
        session.commit()
        _clear_llm_preference(session_factory)
        return {"status": "ok"}


def select_model(
    session_factory,
    host_id: int,
    *,
    model: str,
    role: str,
) -> Dict[str, Any]:
    if role not in MODEL_ROLES:
        raise OllamaHostError("role 必須是 chat 或 embedding。")
    name = str(model or "").strip()
    if not name:
        raise OllamaHostError("模型名稱不可為空。")
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            raise OllamaHostError("找不到 Ollama 主機。")
        if role == "chat":
            host.chat_model = name[:200]
        else:
            host.embedding_model = name[:200]
        session.commit()
        session.refresh(host)
        if role == "chat":
            _clear_llm_preference(session_factory)
        return _serialize_host(host)


def clear_model(
    session_factory,
    host_id: int,
    *,
    model: str,
    role: str,
) -> Dict[str, Any]:
    if role not in MODEL_ROLES:
        raise OllamaHostError("role 必須是 chat 或 embedding。")
    name = str(model or "").strip()
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            raise OllamaHostError("找不到 Ollama 主機。")
        if role == "chat" and host.chat_model == name:
            host.chat_model = ""
        if role == "embedding" and host.embedding_model == name:
            host.embedding_model = ""
        session.commit()
        session.refresh(host)
        if role == "chat":
            _clear_llm_preference(session_factory)
        return _serialize_host(host)


def active_host(session_factory) -> Optional[OllamaHost]:
    with session_factory() as session:
        return session.scalars(
            select(OllamaHost).where(OllamaHost.is_active.is_(True))
        ).first()


def find_host(session_factory, base_url: str) -> Optional[Dict[str, Any]]:
    target = str(base_url or "").rstrip("/")
    if not target:
        return None
    with session_factory() as session:
        row = session.scalars(
            select(OllamaHost).where(OllamaHost.base_url == target)
        ).first()
        return _serialize_host(row) if row is not None else None


def get_host(session_factory, host_id: int) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        row = session.get(OllamaHost, int(host_id))
        return _serialize_host(row) if row is not None else None


def runtime_settings(settings: Settings, session_factory) -> Settings:
    if session_factory is None:
        return settings
    with session_factory() as session:
        rows = list(
            session.scalars(
                select(OllamaHost).order_by(
                    OllamaHost.priority.asc(), OllamaHost.id.asc()
                )
            ).all()
        )
    host = next((row for row in rows if row.is_active), None)
    changes: Dict[str, Any] = {}
    if host is not None:
        ordered = [host] + [row for row in rows if row.id != host.id]
        failover_urls: List[str] = []
        seen = {host.base_url}
        for row in ordered[1:]:
            url = str(row.base_url or "").rstrip("/")
            if not url or url in seen:
                continue
            seen.add(url)
            failover_urls.append(url)
        changes.update(
            {
                "embedding_url": host.base_url,
                "embedding_fallback_url": (
                    failover_urls[0] if failover_urls else ""
                ),
                "embedding_failover_urls": tuple(failover_urls),
            }
        )
        # Only override the LLM endpoint when the active host has an
        # explicitly selected chat model. Otherwise a host used primarily
        # for embeddings would silently redirect LLM traffic to a model it
        # does not have.
        if host.chat_model:
            changes["llm_url"] = host.base_url
            changes["llm_model"] = host.chat_model
        if host.embedding_model:
            changes["embedding_model"] = host.embedding_model

    from .runtime_settings import get_llm_model_preference

    preference = get_llm_model_preference(session_factory)
    preferred_model = str(preference.get("model") or "").strip()
    preferred_url = str(preference.get("base_url") or "").rstrip("/")
    if preferred_model and preferred_url:
        changes["llm_url"] = preferred_url
        changes["llm_model"] = preferred_model

    return replace(settings, **changes) if changes else settings
