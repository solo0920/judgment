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
# Unauthenticated failure events are capped per client and per process-day so
# an attacker cannot grow the audit table without bound.  Counts reset when
# the UTC date changes or the process restarts.
_AUDIT_DAILY_LIMITS = {
    "auth.google_start": (20, 200),
    "auth.google_login": (30, 500),
}
_PRUNE_EVERY_WRITES = 200
_WRITE_LOCK = threading.Lock()
_WRITE_COUNT = 0
_DAILY_LOCK = threading.Lock()
_DAILY_DAY = None
_DAILY_IP_COUNTS: Dict[str, int] = {}
_DAILY_TOTAL_COUNTS: Dict[str, int] = {}
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


def _within_daily_limit(
    event_type: str, outcome: str, client_ip_hash: str
) -> bool:
    global _DAILY_DAY
    if outcome == "success":
        return True
    limits = _AUDIT_DAILY_LIMITS.get(event_type)
    if limits is None:
        return True
    per_ip_limit, total_limit = limits
    today = datetime.now(timezone.utc).date()
    key = f"{event_type}:{client_ip_hash or 'unknown'}"
    with _DAILY_LOCK:
        if _DAILY_DAY != today:
            _DAILY_DAY = today
            _DAILY_IP_COUNTS.clear()
            _DAILY_TOTAL_COUNTS.clear()
        ip_count = _DAILY_IP_COUNTS.get(key, 0)
        total_count = _DAILY_TOTAL_COUNTS.get(event_type, 0)
        if ip_count >= per_ip_limit or total_count >= total_limit:
            return False
        _DAILY_IP_COUNTS[key] = ip_count + 1
        _DAILY_TOTAL_COUNTS[event_type] = total_count + 1
    return True


def _record_security_event(
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
    global _WRITE_COUNT
    event = str(event_type or "unknown")[:64]
    result = str(outcome or "success")[:16]
    if result not in {"success", "failure", "denied"}:
        result = "unknown"
    method = ""
    path = ""
    if request is not None:
        method = str(getattr(request, "method", "") or "")[:16]
        url = getattr(request, "url", None)
        # Store only the path; query strings may contain OAuth codes or tokens.
        path = str(getattr(url, "path", "") or "")[:300]
    client_ip_hash = _client_ip_hash(request, settings)
    if not _within_daily_limit(event, result, client_ip_hash):
        logger.debug(
            "security audit daily cap reached for %s (%s)", event, result
        )
        return
    row = SecurityAuditEvent(
        created_at=datetime.now(timezone.utc),
        event_type=event,
        outcome=result,
        actor=str(actor or "")[:320],
        source=str(source or "")[:32],
        client_ip_hash=client_ip_hash,
        request_id=_request_id(request),
        method=method,
        path=path,
        detail=_safe_detail(dict(detail or {})),
    )
    should_prune = False
    with _WRITE_LOCK:
        _WRITE_COUNT += 1
        should_prune = _WRITE_COUNT % _PRUNE_EVERY_WRITES == 0
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
    """Persist one security-relevant event without storing credentials.

    Audit construction and storage are best-effort: observability failures must
    never block the request being audited.
    """

    if session_factory is None:
        return
    try:
        _record_security_event(
            session_factory,
            settings,
            event_type=event_type,
            outcome=outcome,
            actor=actor,
            source=source,
            request=request,
            detail=detail,
        )
    except Exception:
        logger.warning("failed to record security audit event", exc_info=True)


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
