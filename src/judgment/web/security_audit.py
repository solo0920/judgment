from __future__ import annotations

import logging
import threading
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Mapping, Optional

from sqlalchemy import delete, select

from ..models import SecurityAuditEvent
from .auth import session_secret
from .client_ip import effective_client_ip, hashed_client_ip_key

logger = logging.getLogger(__name__)

SECURITY_AUDIT_RETENTION_DAYS = 180
_PRUNE_EVERY_WRITES = 200
_WRITE_LOCK = threading.Lock()
_WRITE_COUNT = 0
_SENSITIVE_DETAIL_KEYS = frozenset(
    {
        "access_token",
        "code",
        "cookie",
        "id_token",
        "password",
        "refresh_token",
        "secret",
        "state",
        "ticket",
        "token",
    }
)


def _safe_detail(value: Any) -> Any:
    if isinstance(value, Mapping):
        return {
            str(key): _safe_detail(item)
            for key, item in value.items()
            if str(key).lower() not in _SENSITIVE_DETAIL_KEYS
        }
    if isinstance(value, list):
        return [_safe_detail(item) for item in value]
    if isinstance(value, tuple):
        return [_safe_detail(item) for item in value]
    if isinstance(value, str):
        return value[:500]
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return str(value)[:500]


def _client_ip_hash(request: Any, settings: Any) -> str:
    if request is None:
        return ""
    try:
        return hashed_client_ip_key(
            effective_client_ip(request),
            session_secret(settings),
        )
    except Exception:
        return ""


def _request_id(request: Any) -> str:
    if request is None:
        return ""
    value = getattr(getattr(request, "state", None), "request_id", "")
    return str(value or "")[:64]


def record_security_event(
    session_factory,
    settings,
    *,
    event_type: str,
    outcome: str = "success",
    actor: str = "",
    source: str = "",
    request: Any = None,
    detail: Optional[Mapping[str, Any]] = None,
) -> None:
    """Persist one security-relevant event without storing credentials."""

    global _WRITE_COUNT
    if session_factory is None:
        return
    event = str(event_type or "unknown")[:64]
    result = str(outcome or "success")[:16]
    if result not in {"success", "failure", "denied"}:
        result = "unknown"
    method = ""
    path = ""
    if request is not None:
        method = str(getattr(request, "method", "") or "")[:16]
        url = getattr(request, "url", None)
        path = str(getattr(url, "path", "") or "")[:300]
    row = SecurityAuditEvent(
        created_at=datetime.now(timezone.utc),
        event_type=event,
        outcome=result,
        actor=str(actor or "")[:320],
        source=str(source or "")[:32],
        client_ip_hash=_client_ip_hash(request, settings),
        request_id=_request_id(request),
        method=method,
        path=path,
        detail=_safe_detail(dict(detail or {})),
    )
    should_prune = False
    with _WRITE_LOCK:
        _WRITE_COUNT += 1
        should_prune = _WRITE_COUNT % _PRUNE_EVERY_WRITES == 0
    try:
        with session_factory() as session:
            session.add(row)
            session.commit()
            if should_prune:
                cutoff = datetime.now(timezone.utc) - timedelta(
                    days=SECURITY_AUDIT_RETENTION_DAYS
                )
                session.execute(
                    delete(SecurityAuditEvent).where(
                        SecurityAuditEvent.created_at < cutoff
                    )
                )
                session.commit()
    except Exception:
        # Observability must never break the request.
        logger.warning("failed to persist security audit event", exc_info=True)


def list_security_events(
    session_factory, *, limit: int = 100
) -> List[Dict[str, Any]]:
    if session_factory is None:
        return []
    safe_limit = max(1, min(500, int(limit or 100)))
    try:
        with session_factory() as session:
            rows = session.scalars(
                select(SecurityAuditEvent)
                .order_by(SecurityAuditEvent.id.desc())
                .limit(safe_limit)
            ).all()
            return [
                {
                    "id": int(row.id),
                    "created_at": (
                        row.created_at.isoformat()
                        if row.created_at
                        else None
                    ),
                    "event_type": str(row.event_type or ""),
                    "outcome": str(row.outcome or ""),
                    "actor": str(row.actor or ""),
                    "source": str(row.source or ""),
                    "client_ip_hash": str(row.client_ip_hash or "")[:12],
                    "request_id": str(row.request_id or ""),
                    "method": str(row.method or ""),
                    "path": str(row.path or ""),
                    "detail": row.detail or {},
                }
                for row in rows
            ]
    except Exception:
        logger.warning("security audit read failed", exc_info=True)
        return []


def prune_security_events(
    session_factory,
    *,
    retention_days: int = SECURITY_AUDIT_RETENTION_DAYS,
) -> int:
    if session_factory is None:
        return 0
    cutoff = datetime.now(timezone.utc) - timedelta(
        days=max(1, int(retention_days))
    )
    try:
        with session_factory() as session:
            result = session.execute(
                delete(SecurityAuditEvent).where(
                    SecurityAuditEvent.created_at < cutoff
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("security audit prune failed", exc_info=True)
        return 0
