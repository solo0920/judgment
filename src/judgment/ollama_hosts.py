from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from .config import Settings
from .models import OllamaHost

MODEL_ROLES = ("chat", "embedding")


class OllamaHostError(ValueError):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


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


def list_hosts(
    session_factory,
    *,
    timeout: float = 2.5,
) -> Dict[str, Any]:
    with session_factory() as session:
        rows = list(
            session.scalars(select(OllamaHost).order_by(OllamaHost.id.asc())).all()
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
        host = OllamaHost(
            name=str(name or "").strip()[:120],
            base_url=base_url,
            port=chosen_port,
            is_active=False,
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
        return _serialize_host(host)


def delete_host(session_factory, host_id: int) -> bool:
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            return False
        session.delete(host)
        session.commit()
        return True


def activate_host(session_factory, host_id: int) -> Dict[str, Any]:
    with session_factory() as session:
        host = session.get(OllamaHost, int(host_id))
        if host is None:
            raise OllamaHostError("找不到 Ollama 主機。")
        for row in session.scalars(select(OllamaHost)).all():
            row.is_active = row.id == host.id
        session.commit()
        session.refresh(host)
        return _serialize_host(host)


def deactivate_hosts(session_factory) -> Dict[str, Any]:
    with session_factory() as session:
        rows = list(session.scalars(select(OllamaHost)).all())
        for row in rows:
            row.is_active = False
        session.commit()
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
        return _serialize_host(host)


def active_host(session_factory) -> Optional[OllamaHost]:
    with session_factory() as session:
        return session.scalars(
            select(OllamaHost).where(OllamaHost.is_active.is_(True))
        ).first()


def runtime_settings(settings: Settings, session_factory) -> Settings:
    if session_factory is None:
        return settings
    host = active_host(session_factory)
    if host is None:
        return settings
    changes: Dict[str, Any] = {
        "llm_url": host.base_url,
        "embedding_url": host.base_url,
    }
    if host.chat_model:
        changes["llm_model"] = host.chat_model
    if host.embedding_model:
        changes["embedding_model"] = host.embedding_model
    return replace(settings, **changes)
