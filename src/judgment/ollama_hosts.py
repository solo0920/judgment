from __future__ import annotations

import ipaddress
import socket
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple
from urllib.parse import urlparse

import httpx
from sqlalchemy import select

from .config import Settings
from .llm_backends import OLLAMA_API, is_openai_api, normalize_api
from .models import OllamaHost, OllamaModelCapability

MODEL_ROLES = ("chat", "embedding")
MAX_OLLAMA_HOSTS = 20
BLOCKED_METADATA_IPS = {
    "169.254.169.254",
    "169.254.170.2",
    "100.100.100.200",
    "fd00:ec2::254",
}


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


def _target_parts(base_url: str) -> Tuple[str, int]:
    parsed = urlparse(str(base_url or "").strip())
    hostname = str(parsed.hostname or "").strip().lower()
    port = parsed.port or (443 if parsed.scheme == "https" else 11434)
    return hostname, int(port)


def _normalize_allow_entry(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    if "://" not in text:
        text = f"http://{text}"
    try:
        hostname, port = _target_parts(text)
    except (TypeError, ValueError):
        return ""
    return f"{hostname}:{port}" if hostname else ""


def allowed_hosts_from_settings(settings: Settings) -> Tuple[str, ...]:
    """Return the exact host:port targets that may be probed.

    Configured embedding/LLM/rerank endpoints are trusted automatically. New
    hosts must be added to OLLAMA_ALLOWED_HOSTS as ``host:port`` (or a URL).
    """

    values: List[str] = list(settings.ollama_allowed_hosts)
    values.extend(
        [
            settings.embedding_url,
            settings.embedding_fallback_url,
            *settings.embedding_failover_urls,
            settings.llm_url,
            settings.llm_fallback_url,
            settings.rerank_url,
            settings.rerank_fallback_url,
        ]
    )
    return tuple(
        sorted(
            {
                entry
                for value in values
                if (entry := _normalize_allow_entry(value))
            }
        )
    )


def _is_blocked_ip(value: str) -> bool:
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        return False
    text = str(address)
    return bool(
        text in BLOCKED_METADATA_IPS
        or address.is_link_local
        or address.is_multicast
        or address.is_unspecified
        or address.is_reserved
    )


def _ensure_safe_target(base_url: str) -> None:
    hostname, port = _target_parts(base_url)
    if not hostname:
        raise OllamaHostError("Ollama 主機網址缺少主機名稱。")
    try:
        literal = ipaddress.ip_address(hostname)
    except ValueError:
        literal = None
    if literal is not None:
        if _is_blocked_ip(str(literal)):
            raise OllamaHostError("不得使用 link-local／metadata／multicast 位址。")
        return
    try:
        infos = socket.getaddrinfo(
            hostname, port, type=socket.SOCK_STREAM, proto=socket.IPPROTO_TCP
        )
    except OSError:
        # Allowlisted hostnames may be temporarily unresolvable. The probe
        # repeats this check before making a network request.
        return
    for info in infos:
        resolved = str(info[4][0])
        if _is_blocked_ip(resolved):
            raise OllamaHostError(
                f"主機 {hostname} 解析到不允許的位址（{resolved}）。"
            )


def _allowed_targets(
    allowed_hosts: Optional[Sequence[str]],
) -> Tuple[str, ...]:
    if allowed_hosts is None:
        return allowed_hosts_from_settings(Settings.from_env())
    return tuple(
        sorted(
            {
                entry
                for value in allowed_hosts
                if (entry := _normalize_allow_entry(value))
            }
        )
    )


def _host_allowed(base_url: str, allowed_hosts: Tuple[str, ...]) -> bool:
    hostname, port = _target_parts(base_url)
    return bool(hostname) and f"{hostname}:{port}" in set(allowed_hosts)


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
    try:
        _ensure_safe_target(base_url)
    except OllamaHostError as exc:
        return {
            "status": "blocked",
            "detail": str(exc),
            "models": [],
        }
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
    allowed_hosts: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    allowed = _allowed_targets(allowed_hosts)
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
    probe_targets = [
        host for host in hosts if _host_allowed(str(host["base_url"]), allowed)
    ]
    blocked = {
        int(host["id"]): {
            "status": "blocked",
            "detail": "主機不在 OLLAMA_ALLOWED_HOSTS 允許清單。",
            "models": [],
        }
        for host in hosts
        if not _host_allowed(str(host["base_url"]), allowed)
    }
    with ThreadPoolExecutor(max_workers=min(8, max(1, len(probe_targets)))) as executor:
        probes = list(
            executor.map(
                lambda host: _probe_host(host["base_url"], timeout),
                probe_targets,
            )
        )
    by_id = {
        int(host["id"]): probe for host, probe in zip(probe_targets, probes)
    }
    for host in hosts:
        host.update(by_id.get(int(host["id"])) or blocked.get(int(host["id"])) or {})
    capabilities = _load_capability_index(
        session_factory, [str(host["base_url"]) for host in hosts]
    )
    _merge_model_capabilities(hosts, capabilities)
    active = next(
        (
            host["id"]
            for host in hosts
            if host["is_active"] and host.get("status") != "blocked"
        ),
        None,
    )
    return {"hosts": hosts, "active_host_id": active}


def add_host(
    session_factory,
    *,
    name: str,
    url: str,
    port: int,
    allowed_hosts: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    base_url, chosen_port = normalize_host_url(url, port)
    allowed = _allowed_targets(allowed_hosts)
    if not _host_allowed(base_url, allowed):
        raise OllamaHostError(
            "Ollama 主機不在允許清單；請將 host:port 加入 OLLAMA_ALLOWED_HOSTS。"
        )
    _ensure_safe_target(base_url)
    with session_factory() as session:
        existing = session.scalars(
            select(OllamaHost).where(OllamaHost.base_url == base_url)
        ).first()
        if existing is not None:
            raise OllamaHostError(f"主機已存在：{base_url}")
        rows = list(session.scalars(select(OllamaHost)).all())
        if len(rows) >= MAX_OLLAMA_HOSTS:
            raise OllamaHostError(
                f"Ollama 主機數量已達上限（{MAX_OLLAMA_HOSTS}）。"
            )
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
    allowed_hosts: Optional[Sequence[str]] = None,
) -> Dict[str, Any]:
    base_url, chosen_port = normalize_host_url(url, port)
    allowed = _allowed_targets(allowed_hosts)
    if not _host_allowed(base_url, allowed):
        raise OllamaHostError(
            "Ollama 主機不在允許清單；請將 host:port 加入 OLLAMA_ALLOWED_HOSTS。"
        )
    _ensure_safe_target(base_url)
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
    allowed = allowed_hosts_from_settings(settings)
    with session_factory() as session:
        rows = list(
            session.scalars(
                select(OllamaHost).order_by(
                    OllamaHost.priority.asc(), OllamaHost.id.asc()
                )
            ).all()
        )
    rows = [
        row
        for row in rows
        if _host_allowed(str(row.base_url or ""), allowed)
    ]
    host = next((row for row in rows if row.is_active), None)
    changes: Dict[str, Any] = {}
    openai_llm_primary = bool(settings.llm_url) and is_openai_api(
        settings.llm_api
    )
    openai_embedding_primary = bool(settings.embedding_url) and is_openai_api(
        settings.embedding_api
    )

    if host is not None:
        ordered = [host] + [row for row in rows if row.id != host.id]
        if not openai_embedding_primary:
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
                    "embedding_api": OLLAMA_API,
                    "embedding_fallback_url": (
                        failover_urls[0] if failover_urls else ""
                    ),
                    "embedding_fallback_api": OLLAMA_API,
                    "embedding_failover_urls": tuple(failover_urls),
                    "embedding_failover_apis": tuple(
                        OLLAMA_API for _ in failover_urls
                    ),
                }
            )
        else:
            # Explicit llama-server / OpenAI-compatible endpoints stay
            # primary. Ollama hosts are appended as fallbacks so a stopped
            # x570 degrades to the MBP instead of silently replacing the
            # configured primary.
            fallback_urls: List[str] = []
            fallback_apis: List[str] = []
            if settings.embedding_fallback_url:
                fallback_urls.append(settings.embedding_fallback_url)
                fallback_apis.append(
                    normalize_api(settings.embedding_fallback_api)
                )
            for index, url in enumerate(settings.embedding_failover_urls):
                text = str(url or "").rstrip("/")
                if not text or text in fallback_urls:
                    continue
                fallback_urls.append(text)
                fallback_apis.append(
                    normalize_api(
                        settings.embedding_failover_apis[index]
                        if index < len(settings.embedding_failover_apis)
                        else settings.embedding_fallback_api
                    )
                )
            for row in ordered:
                url = str(row.base_url or "").rstrip("/")
                if (
                    not url
                    or url == settings.embedding_url
                    or url in fallback_urls
                ):
                    continue
                fallback_urls.append(url)
                fallback_apis.append(OLLAMA_API)
            if fallback_urls:
                changes.update(
                    {
                        "embedding_fallback_url": fallback_urls[0],
                        "embedding_fallback_api": fallback_apis[0],
                        "embedding_failover_urls": tuple(fallback_urls[1:]),
                        "embedding_failover_apis": tuple(
                            fallback_apis[1:]
                        ),
                    }
                )

        # Only override the LLM endpoint when the active host has an
        # explicitly selected chat model. Otherwise a host used primarily
        # for embeddings would silently redirect LLM traffic to a model it
        # does not have.
        if host.chat_model and not openai_llm_primary:
            changes["llm_url"] = host.base_url
            changes["llm_model"] = host.chat_model
            changes["llm_api"] = OLLAMA_API
        elif host.chat_model and openai_llm_primary:
            if not settings.llm_fallback_url:
                changes["llm_fallback_url"] = host.base_url
                changes["llm_fallback_model"] = host.chat_model
                changes["llm_fallback_api"] = OLLAMA_API
        if host.embedding_model and not openai_embedding_primary:
            changes["embedding_model"] = host.embedding_model

    from .runtime_settings import get_llm_model_preference

    preference = get_llm_model_preference(session_factory)
    preferred_model = str(preference.get("model") or "").strip()
    preferred_url = str(preference.get("base_url") or "").rstrip("/")
    if preferred_model and preferred_url and _host_allowed(preferred_url, allowed):
        if not openai_llm_primary:
            changes["llm_url"] = preferred_url
            changes["llm_model"] = preferred_model
            changes["llm_api"] = OLLAMA_API
        elif preferred_url != settings.llm_url and not (
            changes.get("llm_fallback_url") or settings.llm_fallback_url
        ):
            changes["llm_fallback_url"] = preferred_url
            changes["llm_fallback_model"] = preferred_model
            changes["llm_fallback_api"] = OLLAMA_API

    return replace(settings, **changes) if changes else settings
