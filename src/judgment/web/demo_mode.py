from __future__ import annotations

import logging
import re
import threading
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Deque, Dict, Mapping, Optional, Tuple

from sqlalchemy import select

from ..models import DemoModeAudit, DemoSettings, DemoUsageDaily

logger = logging.getLogger(__name__)

_PORT_SUFFIX = re.compile(r"\s*·\s*:\d{2,5}\s*$")
_INTERNAL_ENDPOINT = re.compile(
    r"https?://(?:localhost|127\.0\.0\.1|[^/\s]+):\d{2,5}"
    r"|\bport\s+\d{2,5}\b",
    re.IGNORECASE,
)

FEATURES: Tuple[str, ...] = (
    "rag",
    "data",
    "quality",
    "performance",
    "processing",
    "status",
)
FEATURE_LABELS = {
    "rag": "RAG 提問",
    "data": "資料庫",
    "quality": "資料品質",
    "performance": "效能報表",
    "processing": "資料處理",
    "status": "系統狀態",
}
DURATION_HOURS = frozenset({2, 24, 168})

# Keys that describe infrastructure or admin internals, not public opendata.
# Values are blanked while keeping the response shape stable for the existing
# admin pages.
_SENSITIVE_KEYS = frozenset(
    {
        "path",
        "data_dir",
        "program",
        "script",
        "command",
        "pid",
        "host",
        "hosts",
        "port",
        "ports",
        "url",
        "urls",
        "base_url",
        "active_url",
        "active_host",
        "active_model",
        "api_key",
        "token",
        "secret",
        "password",
        "user",
        "model",
        "models",
        "collection",
        "collection_name",
        "alias",
        "dsn",
        "database_url",
        "connection_string",
        "error",
        "error_message",
        "stack",
        "traceback",
        "raw_path",
        "source_path",
        "parquet_path",
        "zip_path",
        "archive_path",
        "local_path",
        "log_path",
        "working_dir",
        "cwd",
        "manifest_path",
        "download_path",
        "law_list",
    }
)

_ABSOLUTE_PATH = re.compile(
    r"(?:/Users|/home|/private|/var|/tmp|/opt|/Volumes)/[^\s\"']*"
    r"|[A-Za-z]:\\\\[^\s\"']*"
    r"|file://[^\s\"']*"
)


class DemoModeError(RuntimeError):
    """Base class for invalid demo-mode operations."""


class DemoValidationError(DemoModeError):
    """The requested demo settings are not valid."""


class DemoConflict(DemoModeError):
    """The settings changed since the caller read them."""


@dataclass(frozen=True)
class DemoState:
    active: bool
    stored_enabled: bool
    stored_features: Dict[str, bool]
    features: Dict[str, bool]
    expires_at: Optional[datetime]
    reason: str
    hard_disabled: bool
    updated_at: Optional[datetime]
    version: int

    @property
    def enabled(self) -> bool:
        return self.active

    def allows(self, feature: str) -> bool:
        if not self.active:
            return False
        if feature == "home":
            return True
        return bool(self.features.get(feature))


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    aware = _aware(value)
    return aware.isoformat() if aware else None


def _blank_for(value: Any) -> Any:
    if isinstance(value, dict):
        return {}
    if isinstance(value, list):
        return []
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return 0
    return ""


def sanitize_infrastructure(value: Any) -> Any:
    """Keep public opendata, blank infrastructure/admin internals.

    This is deliberately recursive so nested host/model/path fields cannot leak
    through the visitor versions of the existing status/processing payloads.
    """

    if isinstance(value, dict):
        result: Dict[str, Any] = {}
        for key, item in value.items():
            if key in _SENSITIVE_KEYS:
                result[key] = _blank_for(item)
            else:
                result[key] = sanitize_infrastructure(item)
        return result
    if isinstance(value, list):
        return [sanitize_infrastructure(item) for item in value]
    return value


def sanitize_status_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    result = _scrub_absolute_paths(sanitize_infrastructure(dict(payload)))
    result["endpoints"] = []
    result["model_summary"] = []
    architecture = result.get("architecture")
    if isinstance(architecture, dict):
        for layer in architecture.get("layers") or []:
            if not isinstance(layer, dict):
                continue
            for node in layer.get("nodes") or []:
                if not isinstance(node, dict):
                    continue
                label = node.get("label")
                if isinstance(label, str):
                    node["label"] = _PORT_SUFFIX.sub("", label)
                node["detail"] = ""
    for service in result.get("services") or []:
        if not isinstance(service, dict):
            continue
        service["detail"] = ""
        for provider in service.get("providers") or []:
            if not isinstance(provider, dict):
                continue
            provider["name"] = (
                "主要主機" if provider.get("role") == "primary" else "備援主機"
            )
        active_provider = service.get("active")
        if isinstance(active_provider, dict):
            active_provider["name"] = (
                "主要主機"
                if active_provider.get("role") == "primary"
                else "備援主機"
            )
    pipeline = result.get("pipeline")
    if isinstance(pipeline, dict):
        for stage in pipeline.get("stages") or []:
            if isinstance(stage, dict):
                stage["message"] = ""
    for run in result.get("recent_runs") or []:
        if isinstance(run, dict):
            run["error_message"] = ""
    stats = result.get("data")
    if isinstance(stats, dict):
        for key in (
            "judgment_vector_collection",
            "judgment_vector_alias",
            "judgment_vector_model",
            "legal_article_vector_alias",
            "legal_article_vector_collection",
            "legal_article_vector_model",
        ):
            if key in stats:
                stats[key] = ""
    return result


def _scrub_absolute_paths(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _scrub_absolute_paths(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_scrub_absolute_paths(item) for item in value]
    if isinstance(value, str):
        return _ABSOLUTE_PATH.sub("[internal]", value)
    return value


def _scrub_internal_endpoints(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _scrub_internal_endpoints(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_scrub_internal_endpoints(item) for item in value]
    if isinstance(value, str):
        return _INTERNAL_ENDPOINT.sub("[internal]", value)
    return value


def sanitize_catalog_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    result = _scrub_absolute_paths(
        _scrub_internal_endpoints(sanitize_infrastructure(dict(payload)))
    )
    return result


def sanitize_query_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    """Redact filesystem/operational fields from demo query results."""

    return _scrub_absolute_paths(
        _scrub_internal_endpoints(sanitize_infrastructure(dict(payload)))
    )


def _scrub_internal_messages(value: Any) -> Any:
    if isinstance(value, dict):
        result: Dict[str, Any] = {}
        for key, item in value.items():
            if (
                key == "message"
                and isinstance(item, str)
                and _INTERNAL_ENDPOINT.search(item)
            ):
                result[key] = ""
            else:
                result[key] = _scrub_internal_messages(item)
        return result
    if isinstance(value, list):
        return [_scrub_internal_messages(item) for item in value]
    return value


def sanitize_processing_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    result = _scrub_internal_messages(
        _scrub_absolute_paths(sanitize_infrastructure(dict(payload)))
    )
    result["external_processes"] = []
    for key in ("active_runs", "recent_runs"):
        for run in result.get(key) or []:
            if isinstance(run, dict):
                run["meta"] = {}
                run["pid"] = 0
                run["error_message"] = ""
    return result


def sanitize_rag_result(result: Mapping[str, Any]) -> Dict[str, Any]:
    cleaned = dict(result)
    for key in ("pipeline_flow", "llm_model", "embedding_model"):
        cleaned.pop(key, None)
    if "retrieval" in cleaned:
        cleaned["retrieval"] = sanitize_infrastructure(cleaned.get("retrieval"))
    return cleaned


_RAG_RESPONSE_PUBLIC_KEYS = frozenset(
    {
        "status",
        "answer_source",
        "citation_count",
        "judgment_citations",
        "law_citations",
        "reference_judgments",
        "judgment_candidates",
        "judgment_limit",
        "judgment_limit_applied",
        "abstain",
        "duration_ms",
        "has_answer",
    }
)
_RAG_METADATA_PUBLIC_KEYS = frozenset(
    {
        "rag_status",
        "asgi_to_handler_ms",
        "asgi_to_flow_ms",
        "handler_to_flow_ms",
        "citation_retry",
    }
)
# Segment details that can contain visitor-derived text.  Counts, scores,
# token usage and timings remain visible for the public performance demo.
_PERFORMANCE_SEGMENT_TEXT_KEYS = frozenset(
    {
        "parsed_query",
        "filter",
        "stat_entity",
        "errors",
        "error",
    }
)


def _sanitize_rag_performance_metadata(value: Any) -> Dict[str, Any]:
    if not isinstance(value, dict):
        return {}
    result: Dict[str, Any] = {}
    for key in _RAG_METADATA_PUBLIC_KEYS:
        if key in value:
            result[key] = value[key]
    response = value.get("rag_response")
    if isinstance(response, dict):
        result["rag_response"] = {
            key: response[key]
            for key in _RAG_RESPONSE_PUBLIC_KEYS
            if key in response
        }
    return result


def _scrub_performance_segment_details(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _scrub_performance_segment_details(item)
            for key, item in value.items()
            if key not in _PERFORMANCE_SEGMENT_TEXT_KEYS
        }
    if isinstance(value, list):
        return [_scrub_performance_segment_details(item) for item in value]
    return value


def sanitize_performance_payload(payload: Mapping[str, Any]) -> Dict[str, Any]:
    """Remove visitor text from the public performance report.

    ``query_performance`` returns the full flow JSON so the admin page can
    inspect RAG traces.  Demo visitors receive the same report, so the free
    text fields (question, answer, citation audit sentences, request params and
    client breadcrumbs) must be removed while timing and status fields remain.
    """

    result = _scrub_absolute_paths(sanitize_infrastructure(dict(payload)))
    rows = result.get("rows")
    if not isinstance(rows, list):
        return result
    for row in rows:
        if not isinstance(row, dict):
            continue
        row["params_text"] = ""
        flow = row.get("flow")
        if not isinstance(flow, dict):
            continue
        metadata = _sanitize_rag_performance_metadata(flow.get("metadata"))
        if metadata:
            flow["metadata"] = metadata
        else:
            flow.pop("metadata", None)
        flow.pop("params", None)
        flow.pop("client", None)
        segments = flow.get("segments")
        if isinstance(segments, list):
            for segment in segments:
                if not isinstance(segment, dict):
                    continue
                for key in ("params", "metadata"):
                    if key in segment:
                        segment[key] = _scrub_performance_segment_details(
                            segment[key]
                        )
    return result


def _row_features(row: DemoSettings) -> Dict[str, bool]:
    return {
        feature: bool(getattr(row, f"allow_{feature}", False))
        for feature in FEATURES
    }


def _inactive_state(
    *,
    reason: str,
    hard_disabled: bool = False,
    stored_enabled: bool = False,
    stored_features: Optional[Dict[str, bool]] = None,
    expires_at: Optional[datetime] = None,
    updated_at: Optional[datetime] = None,
    version: int = 0,
) -> DemoState:
    stored = {
        feature: bool((stored_features or {}).get(feature, False))
        for feature in FEATURES
    }
    return DemoState(
        active=False,
        stored_enabled=stored_enabled,
        stored_features=stored,
        features={feature: False for feature in FEATURES},
        expires_at=expires_at,
        reason=reason,
        hard_disabled=hard_disabled,
        updated_at=updated_at,
        version=version,
    )


def load_demo_state(
    session_factory,
    settings,
    *,
    now: Optional[datetime] = None,
) -> DemoState:
    """Resolve the effective demo state. Any read failure means fully closed."""

    current = _aware(now or _utcnow()) or _utcnow()
    hard_disabled = bool(getattr(settings, "demo_hard_disable", False))
    if session_factory is None:
        return _inactive_state(
            reason="settings_unavailable", hard_disabled=hard_disabled
        )
    try:
        with session_factory() as session:
            row = session.get(DemoSettings, 1)
    except Exception:
        logger.warning("demo settings read failed; treating demo as closed", exc_info=True)
        return _inactive_state(
            reason="settings_unavailable", hard_disabled=hard_disabled
        )
    if row is None:
        return _inactive_state(
            reason="settings_missing", hard_disabled=hard_disabled
        )

    stored_features = _row_features(row)
    expires_at = _aware(row.expires_at)
    expired = bool(expires_at and expires_at <= current)
    has_features = any(stored_features.values())
    active = bool(row.enabled) and not expired and not hard_disabled and has_features
    if hard_disabled:
        reason = "JUDGMENT_DEMO_HARD_DISABLE=1"
    elif expired:
        reason = "expired"
    elif not row.enabled:
        reason = "disabled"
    elif not has_features:
        reason = "no_features"
    else:
        reason = "active"
    return DemoState(
        active=active,
        stored_enabled=bool(row.enabled),
        stored_features=stored_features,
        features=stored_features if active else {feature: False for feature in FEATURES},
        expires_at=expires_at,
        reason=reason,
        hard_disabled=hard_disabled,
        updated_at=_aware(row.updated_at),
        version=int(row.version or 0),
    )


def _serialize_settings(row: DemoSettings) -> Dict[str, Any]:
    return {
        "enabled": bool(row.enabled),
        "features": _row_features(row),
        "expires_at": _iso(row.expires_at),
        "updated_at": _iso(row.updated_at),
        "updated_by": str(row.updated_by or ""),
        "version": int(row.version or 0),
    }


def public_demo_payload(
    state: DemoState, *, now: Optional[datetime] = None
) -> Dict[str, Any]:
    return {
        "enabled": state.active,
        "expires_at": _iso(state.expires_at),
        "server_time": _iso(now or _utcnow()),
        "features": dict(state.features),
        "reason": "" if state.active else state.reason,
        "hard_disabled": state.hard_disabled,
    }


def load_demo_usage(
    session_factory, *, now: Optional[datetime] = None
) -> Dict[str, int]:
    if session_factory is None:
        return {"requests": 0, "tokens": 0}
    usage_date = (_aware(now or _utcnow()) or _utcnow()).date()
    try:
        with session_factory() as session:
            row = session.get(DemoUsageDaily, usage_date)
    except Exception:
        logger.warning("demo usage read failed", exc_info=True)
        return {"requests": 0, "tokens": 0}
    if row is None:
        return {"requests": 0, "tokens": 0}
    return {
        "requests": int(row.requests or 0),
        "tokens": int(row.tokens or 0),
    }


def add_demo_usage(
    session_factory,
    *,
    requests: int = 0,
    tokens: int = 0,
    now: Optional[datetime] = None,
) -> None:
    if session_factory is None:
        return
    usage_date = (_aware(now or _utcnow()) or _utcnow()).date()
    request_delta = max(0, int(requests))
    token_delta = max(0, int(tokens))
    if not request_delta and not token_delta:
        return
    try:
        with session_factory() as session:
            row = session.get(DemoUsageDaily, usage_date)
            if row is None:
                row = DemoUsageDaily(
                    usage_date=usage_date, requests=0, tokens=0
                )
                session.add(row)
            row.requests = int(row.requests or 0) + request_delta
            row.tokens = int(row.tokens or 0) + token_delta
            row.updated_at = _utcnow()
            session.commit()
    except Exception:
        logger.warning("demo usage write failed", exc_info=True)


def estimate_text_tokens(text: Any) -> int:
    value = str(text or "")
    return max(1, (len(value) + 3) // 4) if value else 0


def estimate_rag_tokens(question: Any, result: Mapping[str, Any] | None) -> int:
    answer = (result or {}).get("answer") if isinstance(result, Mapping) else ""
    return estimate_text_tokens(question) + estimate_text_tokens(answer)


def admin_demo_payload(
    state: DemoState,
    usage: Mapping[str, int] | None = None,
    *,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    return {
        "stored": {
            "enabled": state.stored_enabled,
            "features": dict(state.stored_features),
            "expires_at": _iso(state.expires_at),
            "updated_at": _iso(state.updated_at),
            "version": state.version,
        },
        "effective": {
            "enabled": state.active,
            "features": dict(state.features),
            "expires_at": _iso(state.expires_at),
            "reason": "" if state.active else state.reason,
        },
        "hard_disabled": state.hard_disabled,
        "reason": "" if state.active else state.reason,
        "server_time": _iso(now or _utcnow()),
        "usage": dict(usage or {"requests": 0, "tokens": 0}),
    }


def _normalized_features(features: Mapping[str, Any]) -> Dict[str, bool]:
    unknown = sorted(set(features) - set(FEATURES))
    if unknown:
        raise DemoValidationError(
            f"unknown demo feature(s): {', '.join(unknown)}"
        )
    return {feature: bool(features.get(feature, False)) for feature in FEATURES}


def update_demo_settings(
    session_factory,
    settings,
    *,
    enabled: bool,
    features: Mapping[str, Any],
    duration_hours: Optional[int],
    actor_email: str,
    version: Optional[int] = None,
    now: Optional[datetime] = None,
) -> DemoState:
    if session_factory is None:
        raise DemoValidationError("database is not configured")
    normalized = _normalized_features(features)
    if enabled and not any(normalized.values()):
        raise DemoValidationError("at least one demo feature must be enabled")
    if enabled:
        if duration_hours not in DURATION_HOURS:
            raise DemoValidationError("duration_hours must be 2, 24, or 168")
    current = _aware(now or _utcnow()) or _utcnow()
    expires_at = (
        current + timedelta(hours=int(duration_hours)) if enabled else None
    )
    with session_factory() as session:
        row = session.get(DemoSettings, 1)
        created = row is None
        if created:
            row = DemoSettings(
                id=1,
                enabled=False,
                allow_rag=True,
                allow_data=True,
                allow_quality=True,
                allow_performance=True,
                allow_processing=True,
                allow_status=True,
                version=1,
            )
            session.add(row)
            session.flush()
        if (
            not created
            and version is not None
            and int(row.version or 0) != int(version)
        ):
            raise DemoConflict(
                f"demo settings version mismatch: {row.version} != {version}"
            )
        before = _serialize_settings(row)
        row.enabled = bool(enabled)
        for feature, value in normalized.items():
            setattr(row, f"allow_{feature}", bool(value))
        row.expires_at = expires_at
        row.updated_at = current
        row.updated_by = str(actor_email or "")[:320]
        row.version = int(row.version or 0) + 1
        after = _serialize_settings(row)
        session.add(
            DemoModeAudit(
                actor_email=str(actor_email or "")[:320],
                action="enable" if enabled else "disable",
                before=before,
                after=after,
                created_at=current,
            )
        )
        session.commit()
    return load_demo_state(session_factory, settings, now=current)


def close_demo_settings(
    session_factory,
    settings,
    *,
    actor_email: str,
    now: Optional[datetime] = None,
) -> DemoState:
    if session_factory is None:
        raise DemoValidationError("database is not configured")
    current = _aware(now or _utcnow()) or _utcnow()
    with session_factory() as session:
        row = session.get(DemoSettings, 1)
        if row is None:
            row = DemoSettings(
                id=1,
                enabled=False,
                allow_rag=True,
                allow_data=True,
                allow_quality=True,
                allow_performance=True,
                allow_processing=True,
                allow_status=True,
                version=1,
            )
            session.add(row)
            session.flush()
        before = _serialize_settings(row)
        row.enabled = False
        row.expires_at = None
        row.updated_at = current
        row.updated_by = str(actor_email or "")[:320]
        row.version = int(row.version or 0) + 1
        after = _serialize_settings(row)
        session.add(
            DemoModeAudit(
                actor_email=str(actor_email or "")[:320],
                action="close",
                before=before,
                after=after,
                created_at=current,
            )
        )
        session.commit()
    return load_demo_state(session_factory, settings, now=current)


def list_demo_audit(session_factory, *, limit: int = 20) -> list[Dict[str, Any]]:
    if session_factory is None:
        return []
    safe_limit = max(1, min(200, int(limit)))
    try:
        with session_factory() as session:
            rows = session.execute(
                select(DemoModeAudit)
                .order_by(DemoModeAudit.id.desc())
                .limit(safe_limit)
            ).scalars()
            return [
                {
                    "id": int(row.id),
                    "actor_email": str(row.actor_email or ""),
                    "action": str(row.action or ""),
                    "before": row.before,
                    "after": row.after,
                    "created_at": _iso(row.created_at),
                }
                for row in rows
            ]
    except Exception:
        logger.warning("demo audit read failed", exc_info=True)
        return []


class DemoRateLimiter:
    """Small in-process per-IP limiter with separate buckets.

    RAG, data/performance queries, and page polling must not share a bucket;
    otherwise leaving a processing page open would consume the RAG allowance.
    """

    def __init__(self) -> None:
        self._buckets: Dict[Tuple[str, str], Deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(
        self,
        client_ip: str,
        bucket: str,
        *,
        per_minute: int,
        per_hour: int,
        per_day: int,
    ) -> Optional[int]:
        """Return None when allowed, or a Retry-After value in seconds."""

        key = (str(bucket or ""), str(client_ip or "unknown"))
        now = time.time()
        with self._lock:
            events = self._buckets[key]
            cutoff = now - 86400.0
            while events and events[0] <= cutoff:
                events.popleft()
            minute = sum(1 for item in events if item > now - 60.0)
            hour = sum(1 for item in events if item > now - 3600.0)
            if per_minute > 0 and minute >= per_minute:
                return 60
            if per_hour > 0 and hour >= per_hour:
                return 3600
            if per_day > 0 and len(events) >= per_day:
                return 86400
            events.append(now)
            if not events:
                self._buckets.pop(key, None)
            return None

    def clear(self) -> None:
        with self._lock:
            self._buckets.clear()
