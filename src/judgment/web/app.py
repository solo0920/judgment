from __future__ import annotations

import argparse
import asyncio
import contextvars
import hashlib
import hmac
import ipaddress
import json
import logging
import os
import re
import secrets
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import replace
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Literal, Optional
from urllib.parse import unquote, urlparse
from uuid import uuid4

import uvicorn
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from sqlalchemy import delete
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import (
    FileResponse,
    JSONResponse,
    RedirectResponse,
    Response,
    StreamingResponse,
)
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from starlette.background import BackgroundTask
from starlette.routing import Match, Mount

from .. import __version__
from ..admission import RagAdmission, RagBusy
from ..config import Settings
from .auth import (
    SESSION_COOKIE,
    allowed_email,
    build_google_authorization_url,
    clear_oauth_state_cookie,
    clear_session_cookie,
    email_verified,
    exchange_google_code,
    google_login_enabled,
    google_redirect_uri,
    make_oauth_state_token,
    make_session_token,
    new_oauth_state,
    origin_allowed,
    read_oauth_state,
    read_session,
    redirect_with_auth,
    safe_next_url,
    session_secret,
    set_oauth_state_cookie,
    set_session_cookie,
)
from ..court_normalize import check_court_normalization
from ..db import build_engine, build_session_factory, init_db
from ..law_article_versions import check_law_version_status
from ..models import RagShareSnapshot
from ..observability import (
    clear_flow,
    current_flow,
    record_client_timing,
    record_performance,
    start_flow,
    trace_segment,
)
from ..judgment_parquet import get_judgment_from_parquet
from ..judgment_backup import list_delta_manifests, list_delta_rows
from ..judgment_versioning import (
    change_events,
    judgment_history,
    judgment_vector_versions,
    list_snapshot_dicts,
    version_detail,
    versioning_summary,
)
from ..judgment_index import history_point_id
from ..update_checks import check_all_sources
from ..update_records import SOURCE_TYPES, update_status
from ..judgment_download import (
    DownloadWindowClosed,
    JudgmentDownloadError,
    download_status,
    ensure_window,
    file_response_headers,
    iter_fileset,
)
from ..llm_capabilities import (
    model_capability_status,
    refresh_model_capabilities,
)
from ..performance_test import (
    available_test_models,
    get_latest_test_run,
    get_test_run,
    list_test_runs,
)
from ..benchmark import BenchmarkManager
from ..question_bank import (
    QuestionBankError,
    benchmark_ready_items,
    create_item,
    create_suite,
    delete_item,
    delete_suite,
    get_item,
    get_suite,
    import_items,
    list_items,
    list_suites,
    remove_suite_item,
    revalidate_items,
    restore_item,
    review_item,
    submit_for_review,
    tag_suggestions,
    update_item,
    update_suite,
)
from ..question_bank_ai import create_ai_item
from ..ollama_hosts import (
    OllamaHostError,
    activate_host,
    add_host,
    allowed_hosts_from_settings,
    clear_model,
    deactivate_hosts,
    delete_host,
    find_host,
    get_host,
    list_hosts,
    reorder_hosts,
    runtime_settings,
    select_model,
    update_host,
)
from ..llm_backends import fetch_context_window
from ..rag import (
    _citation_audit,
    _citation_retry_action,
    _fit_contexts_to_prompt_budget,
    _valid_citation_markers,
    answer_question,
    CitationValidationError,
    generate_answer_with_model_async,
    mark_citation_usage,
    warm_index_coverage,
    warm_index_staleness,
)
from ..rerank import rerank_heartbeat, rerank_service_test
from ..vector_store import QdrantStore
from ..index_versions import (
    activate_version,
    active_version,
    get_version,
    list_versions,
    reconcile_alias,
    rollback_version,
    validate_version,
)
from ..runtime_settings import (
    get_session_epoch,
    get_test_mode,
    is_session_revoked,
    revoke_all_sessions,
    revoke_session,
    set_llm_model_preference,
    set_test_mode,
)
from .catalog import build_catalog
from .client_ip import (
    client_ip_key,
    effective_client_ip,
    suspicious_proxy_chain,
)
from .demo_mode import (
    DemoConflict,
    DemoRateLimiter,
    DemoValidationError,
    add_demo_usage,
    admin_demo_payload,
    close_demo_settings,
    estimate_rag_tokens,
    list_demo_audit,
    load_demo_state,
    load_demo_usage,
    public_demo_payload,
    sanitize_catalog_payload,
    sanitize_infrastructure,
    sanitize_performance_payload,
    sanitize_query_payload,
    sanitize_processing_payload,
    sanitize_rag_result,
    sanitize_status_payload,
    update_demo_settings,
)
from .home import build_home_summary
from .judgment_stats import build_judgment_stats
from .performance import performance_options, query_performance
from .power_agent import ensure_power_agent
from .events import build_event_broker
from .processing_events import ProcessingEventServer
from .principal import (
    Principal,
    admin_token_principal,
    anonymous_principal,
    local_admin_principal,
    principal_allows,
    principal_from_session,
)
from .processing import (
    ProcessingManager,
    active_import_event_stream,
    apply_live_judgment_pending,
    build_active_import,
    build_processing_bootstrap,
    build_processing_live,
    build_processing_plan,
    build_processing_snapshot,
    slim_processing_snapshot,
)
from .quality import build_quality_bootstrap, build_quality_snapshot
from .route_policy import (
    DEMO_POLICIES,
    demo_feature_for,
    policy_for,
    validate_route_policies,
)
from .runtime_security import (
    server_bind_allowed,
    validate_auth_security,
    validate_forwarded_allow_ips,
    validate_runtime_security,
)
from .query import (
    data_suggestions,
    get_judgment_detail,
    get_law_detail,
    run_query,
    schema_suggestions,
)
from .maintenance import run_retention_maintenance
from .security_audit import (
    SECURITY_AUDIT_RETENTION_DAYS,
    list_security_events,
    record_security_event,
)
from .status import build_status, rerank_status
from .system_usage import build_system_usage

logger = logging.getLogger(__name__)

_ASGI_STARTED: contextvars.ContextVar[Optional[float]] = contextvars.ContextVar(
    "judgment_asgi_started", default=None
)

STATIC_DIR = Path(__file__).parent / "static"

# Manual judgment downloads stream a whole archive through the backend. Keep a
# single active proxy download so opening several month links does not hammer
# the official server; the batch workflow is already sequential.
_JUDGMENT_DOWNLOAD_LOCK = threading.Lock()
_UPDATE_CHECK_LOCK = threading.Lock()
_DEMO_QUERY_EXECUTOR = ThreadPoolExecutor(
    max_workers=4, thread_name_prefix="demo-query"
)
_MAX_DEMO_BODY_BYTES = 64 * 1024
_MAX_ADMIN_BODY_BYTES = 20 * 1024 * 1024
_CSP_MAX_BYTES = 8 * 1024
_CSP_LOG_MAX_BYTES = 1_000_000
_CSP_LOG_BACKUPS = 3
_CSP_DAILY_LIMIT = 5000
_CSP_LOG_LOCK = threading.Lock()
_CSP_DAILY_LOCK = threading.Lock()
_CSP_DAILY = {"date": "", "count": 0}


class QueryRequest(BaseModel):
    database: Literal["postgres", "parquet", "qdrant", "indexeddb"] = "postgres"
    filters: Dict[str, Any] = Field(default_factory=dict)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=200)

    @field_validator("filters")
    @classmethod
    def _limit_filters(cls, value: Dict[str, Any]) -> Dict[str, Any]:
        if len(value) > 20:
            raise ValueError("filters 最多 20 個條件。")
        for key, item in value.items():
            if len(str(key)) > 64:
                raise ValueError("filter 名稱過長。")
            if isinstance(item, str) and len(item) > 200:
                raise ValueError("filter 字串值過長。")
            if isinstance(item, (list, tuple)) and len(item) > 20:
                raise ValueError("filter 列表過長。")
        return value


class RagRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


class RagShareRequest(BaseModel):
    title: str = Field(default="", max_length=200)
    turns: List[Dict[str, Any]] = Field(min_length=1, max_length=30)


_RAG_SHARE_TTL_HOURS = 24 * 7
_RAG_SHARE_MAX_BYTES = 1_000_000
_RAG_SHARE_PAYLOAD_KEYS = frozenset(
    {
        "status",
        "answer",
        "answer_source",
        "notice",
        "citations",
        "judgments",
        "reference_judgments",
        "law_sources",
        "matched_terms",
        "law_answer",
        "law_framework",
        "llm_model",
        "embedding_model",
        "duration_ms",
        "show_sources",
        "retrieval",
        "rerank_degraded",
        "degraded_reason",
    }
)


def _utc_aware(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _sanitize_rag_share_turns(
    raw_turns: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    now_iso = datetime.now(timezone.utc).isoformat()
    turns: List[Dict[str, Any]] = []
    for raw in raw_turns:
        if not isinstance(raw, dict):
            raise HTTPException(status_code=400, detail="分享內容格式不正確。")
        question = str(raw.get("question") or "").strip()
        if not question:
            raise HTTPException(status_code=400, detail="分享問題不能空白。")
        payload = raw.get("payload")
        if not isinstance(payload, dict):
            payload = {}
        cleaned = {
            key: payload[key]
            for key in _RAG_SHARE_PAYLOAD_KEYS
            if key in payload
        }
        cleaned = sanitize_rag_result(cleaned)
        cleaned = sanitize_query_payload(cleaned)
        cleaned["partial"] = False
        cleaned["streaming"] = False
        asked_at = str(raw.get("asked_at") or "").strip()[:64]
        turns.append(
            {
                "question": question[:500],
                "asked_at": asked_at or now_iso,
                "payload": cleaned,
            }
        )
    encoded = json.dumps(turns, ensure_ascii=False).encode("utf-8")
    if len(encoded) > _RAG_SHARE_MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail="分享內容過大，請分享較短的對話。",
        )
    return turns


class DemoFeaturesRequest(BaseModel):
    rag: bool = False
    data: bool = False
    quality: bool = False
    performance: bool = False
    processing: bool = False
    status: bool = False


class DemoUpdateRequest(BaseModel):
    enabled: bool
    duration_hours: Optional[int] = None
    features: DemoFeaturesRequest
    version: Optional[int] = None


class ClientTimingRequest(BaseModel):
    request_id: str = Field(min_length=8, max_length=64)
    route: str = Field(default="", max_length=300)
    total_ms: int = Field(default=0, ge=0, le=3_600_000)
    render_ms: int = Field(default=0, ge=0, le=3_600_000)
    status: str = Field(default="success", max_length=16)


class TestModeRequest(BaseModel):
    enabled: bool


class QuestionBankReviewRequest(BaseModel):
    decision: Literal["approved", "rejected", "changes_requested"]
    reviewer: str = Field(default="", max_length=120)
    rubric_scores: Dict[str, Any] = Field(default_factory=dict)
    comment: str = Field(default="", max_length=4000)


class QuestionBankAICreateRequest(BaseModel):
    question: str = Field(min_length=4, max_length=2000)


class OllamaHostRequest(BaseModel):
    name: str = Field(default="", max_length=120)
    url: str = Field(default="http://127.0.0.1", max_length=300)
    port: int = Field(default=11437, ge=1, le=65535)


class OllamaModelChoiceRequest(BaseModel):
    model: str = Field(min_length=1, max_length=200)
    role: Literal["chat", "embedding"]


class OllamaHostOrderRequest(BaseModel):
    host_ids: List[int] = Field(default_factory=list)


class LlmModelRequest(BaseModel):
    model: str = Field(min_length=1, max_length=200)
    host_id: Optional[int] = Field(default=None, ge=1)


class BenchmarkRunRequest(BaseModel):
    suite_id: int = Field(gt=0)
    config: Dict[str, Any] = Field(default_factory=dict)
    actor: str = Field(default="", max_length=120)


class BenchmarkReviewRequest(BaseModel):
    reviewer: str = Field(default="", max_length=120)
    scores: Dict[str, Any] = Field(default_factory=dict)
    comment: str = Field(default="", max_length=4000)


class ProcessingUpdateRequest(BaseModel):
    index: bool = False


class UpdateCheckRequest(BaseModel):
    source_types: List[str] = Field(default_factory=list)


class IndexReconcileRequest(BaseModel):
    repair: bool = False


class _TTLCache:
    """Small per-app TTL cache for read-only aggregate endpoints."""

    def __init__(self) -> None:
        self._values: Dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get_or_build(self, key: str, ttl: float, builder) -> Any:
        now = time.monotonic()
        with self._lock:
            entry = self._values.get(key)
            if entry is not None and entry[0] > now:
                return entry[1]
        value = builder()
        with self._lock:
            self._values[key] = (time.monotonic() + max(0.0, ttl), value)
        return value


def _client_started_ms(request: Request) -> Optional[float]:
    raw = request.headers.get("X-Judgment-Client-Started-At", "").strip()
    try:
        return float(raw) if raw else None
    except ValueError:
        return None


def _incoming_request_id(request: Request) -> str:
    raw = request.headers.get("X-Judgment-Request-Id", "").strip()
    if (
        8 <= len(raw) <= 64
        and all(char.isalnum() or char in {"-", "_"} for char in raw)
    ):
        return raw
    return uuid4().hex


def _csp_log_path() -> Path:
    raw = os.getenv("JUDGMENT_CSP_LOG_PATH", ".run/csp-report.log").strip()
    return Path(raw or ".run/csp-report.log").expanduser()


def _rotate_csp_log(path: Path) -> None:
    if not path.exists() or path.stat().st_size <= _CSP_LOG_MAX_BYTES:
        return
    for index in range(_CSP_LOG_BACKUPS, 0, -1):
        source = path if index == 1 else path.with_name(
            f"{path.name}.{index - 1}"
        )
        target = path.with_name(f"{path.name}.{index}")
        if source.exists():
            target.unlink(missing_ok=True)
            source.replace(target)


def _csp_safe_uri(value: Any) -> str:
    raw = str(value or "").strip()
    if not raw:
        return ""
    if raw in {"inline", "eval", "data", "blob", "wasm-eval"}:
        return raw
    try:
        parts = urlparse(raw)
    except ValueError:
        return raw[:300]
    if parts.scheme and parts.netloc:
        return f"{parts.scheme}://{parts.netloc}{parts.path or '/'}"[:300]
    return (parts.path or raw.split("?", 1)[0])[:300]


def _csp_report_summary(payload: Any) -> Optional[Dict[str, Any]]:
    if isinstance(payload, dict) and isinstance(payload.get("csp-report"), dict):
        report = payload["csp-report"]
    elif isinstance(payload, list):
        report = None
        for item in payload:
            if not isinstance(item, dict):
                continue
            body = item.get("body")
            if isinstance(body, dict) and item.get("type") in {
                "csp-violation",
                "csp_report",
            }:
                report = body
                break
        if report is None:
            return None
    elif isinstance(payload, dict):
        report = payload
    else:
        return None
    return {
        "document_uri": _csp_safe_uri(
            report.get("document-uri") or report.get("documentURL")
        ),
        "blocked_uri": _csp_safe_uri(
            report.get("blocked-uri") or report.get("blockedURL")
        ),
        "violated_directive": str(
            report.get("violated-directive")
            or report.get("effective-directive")
            or report.get("effectiveDirective")
            or ""
        )[:120],
        "disposition": str(report.get("disposition") or "")[:40],
        "status_code": report.get("status-code")
        if report.get("status-code") is not None
        else report.get("statusCode"),
    }


def _csp_daily_allowed() -> bool:
    today = date.today().isoformat()
    with _CSP_DAILY_LOCK:
        if _CSP_DAILY["date"] != today:
            _CSP_DAILY["date"] = today
            _CSP_DAILY["count"] = 0
        if _CSP_DAILY["count"] >= _CSP_DAILY_LIMIT:
            return False
        _CSP_DAILY["count"] += 1
        return True


def _write_csp_report(summary: Dict[str, Any]) -> None:
    path = _csp_log_path()
    line = json.dumps(
        {"at": datetime.now(timezone.utc).isoformat(), **summary},
        ensure_ascii=False,
    )
    with _CSP_LOG_LOCK:
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            _rotate_csp_log(path)
            with path.open("a", encoding="utf-8") as handle:
                handle.write(line + "\n")
            path.chmod(0o600)
        except OSError:
            logger.warning("failed to write CSP report", exc_info=True)


PUBLIC_POLICIES = {"PUBLIC_READ", "PUBLIC_QUERY", "PUBLIC_AUTH"}
LOCAL_CLIENT_HOSTS = {"127.0.0.1", "::1", "localhost", "testclient"}
SSE_TICKET_TTL_SECONDS = 60


def _is_local_request(request: Request) -> bool:
    host = str(getattr(request.client, "host", "") or "").strip()
    if host in LOCAL_CLIENT_HOSTS:
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _canonical_request_path(path: str) -> str:
    """Normalize path variants before route-policy lookup.

    Middleware and the router must not disagree about whether a request is an
    API request.  Decode percent escapes and collapse repeated slashes; do not
    resolve ``..`` segments because collapsing them could turn an API path into
    a non-API path and skip authentication.
    """

    value = unquote(str(path or "/"))
    while "//" in value:
        value = value.replace("//", "/")
    return value or "/"


def _is_api_path(path: str) -> bool:
    lowered = path.lower()
    return lowered == "/api" or lowered.startswith("/api/")


def _match_route(app: FastAPI, scope: dict) -> Any:
    """Return the route Starlette would dispatch for this scope.

    This intentionally uses the router's own ``matches`` implementation so the
    middleware cannot disagree with the router about which route a request
    reaches.  A method mismatch still returns the path's route as PARTIAL.
    """

    partial = None
    for route in app.router.routes:
        match, _child_scope = route.matches(scope)
        if match == Match.FULL:
            return route
        if match == Match.PARTIAL and partial is None:
            partial = route
    return partial


def _policy_for_matched_route(route: Any, method: str) -> str:
    if route is None:
        return "ADMIN_ONLY"
    if isinstance(route, Mount):
        return policy_for("MOUNT", str(getattr(route, "path", "") or ""))
    return policy_for(method, str(getattr(route, "path", "") or ""))


def _demo_check(
    request: Request,
    policy: str,
    *,
    enforce_limits: bool,
) -> Optional[JSONResponse]:
    """Validate demo access for a non-admin principal.

    Returns a JSONResponse when the request must be rejected. The caller still
    applies the normal Origin checks for non-GET requests after this returns
    ``None``.
    """

    principal = getattr(request.state, "principal", None)
    if principal is not None and principal.is_admin:
        request.state.is_demo_visitor = False
        return None
    settings = request.app.state.settings
    feature = demo_feature_for(request.method, request.url.path)
    state = load_demo_state(request.app.state.session_factory, settings)
    request.state.demo_state = state
    request.state.is_demo_visitor = True
    if not state.active:
        return _demo_error(
            403,
            "展示目前未開放。",
            code="demo_closed",
        )
    if not feature:
        return _demo_error(
            403,
            "這個展示功能尚未分類。",
            code="demo_unmapped",
        )
    if feature != "home" and not state.features.get(feature, False):
        return _demo_error(
            403,
            f"「{feature}」目前未開放展示。",
            code="demo_feature_disabled",
            feature=feature,
        )
    if not enforce_limits:
        return None

    client_ip = str(
        getattr(request.state, "client_ip", "") or effective_client_ip(request)
    )
    rate_key = client_ip_key(client_ip)
    if policy == "DEMO_QUERY":
        if feature == "rag":
            usage = load_demo_usage(request.app.state.session_factory)
            if (
                settings.demo_rag_daily_token_budget > 0
                and usage["tokens"] >= settings.demo_rag_daily_token_budget
            ) or (
                settings.demo_rag_daily_request_limit > 0
                and usage["requests"] >= settings.demo_rag_daily_request_limit
            ):
                return _demo_error(
                    429,
                    "今日展示額度已用完，請明天再試。",
                    code="demo_budget_exhausted",
                    feature=feature,
                    retry_after=3600,
                )
            retry_after = request.app.state.demo_limiter.check(
                rate_key,
                "rag",
                per_minute=settings.demo_rag_rate_per_minute,
                per_hour=settings.demo_rag_rate_per_hour,
                per_day=settings.demo_rag_rate_per_day,
            )
        else:
            retry_after = request.app.state.demo_limiter.check(
                rate_key,
                "query",
                per_minute=settings.demo_query_rate_per_minute,
                per_hour=settings.demo_query_rate_per_hour,
                per_day=settings.demo_query_rate_per_day,
            )
    else:
        retry_after = request.app.state.demo_limiter.check(
            rate_key,
            "poll",
            per_minute=settings.demo_poll_rate_per_minute,
            per_hour=settings.demo_poll_rate_per_hour,
            per_day=settings.demo_poll_rate_per_day,
        )
    if retry_after is not None:
        return _demo_error(
            429,
            "展示請求過於頻繁，請稍後再試。",
            code="demo_rate_limited",
            feature=feature,
            retry_after=retry_after,
        )
    return None


def route_policy_guard(request: Request) -> None:
    """Second line of defense after the auth middleware.

    The middleware intentionally uses the router's own match result. This
    dependency repeats the policy check after routing, so a middleware bug
    cannot silently turn a protected route into a public one.
    """

    route = request.scope.get("route")
    if route is None:
        return
    settings = request.app.state.settings
    principal = getattr(request.state, "principal", None)
    if principal is None:
        principal = _resolve_principal(request, settings)
        request.state.principal = principal
    policy = _policy_for_matched_route(route, request.method)
    if request.url.path == "/api/events/stream" and bool(
        getattr(request.state, "sse_ticket_valid", False)
    ):
        return
    if policy in DEMO_POLICIES:
        if principal.is_admin:
            return
        state = getattr(request.state, "demo_state", None)
        if state is None:
            state = load_demo_state(request.app.state.session_factory, settings)
        feature = demo_feature_for(request.method, request.url.path)
        if (
            not state.active
            or not feature
            or (feature != "home" and not state.features.get(feature, False))
        ):
            raise HTTPException(
                status_code=403,
                detail="展示模式未開放這個功能。",
            )
        return
    if principal_allows(
        policy,
        principal.kind,
        public_rag_enabled=settings.public_rag_enabled,
    ):
        return
    raise HTTPException(
        status_code=401 if settings.admin_token else 403,
        detail="需要有效的管理權杖或 Google 帳號登入。",
    )


def _has_forwarded_client_headers(request: Request) -> bool:
    """A local socket is not trusted when a tunnel/proxy supplied forwarding."""

    return any(
        str(request.headers.get(name) or "").strip()
        for name in (
            "cf-connecting-ip",
            "x-forwarded-for",
            "forwarded",
            "x-real-ip",
        )
    )


_PROXY_CHAIN_WARNING_AT = 0.0


def _warn_suspicious_proxy_chain(client_ip: str) -> None:
    """Warn when a Cloudflare request arrives with a loopback effective IP.

    This means the trusted proxy header chain was broken (for example a
    Cloudflare Managed Transform removed visitor IP headers).  Rate-limit the
    warning so a misconfiguration does not flood the log.
    """

    global _PROXY_CHAIN_WARNING_AT
    now = time.monotonic()
    if now - _PROXY_CHAIN_WARNING_AT < 60.0:
        return
    _PROXY_CHAIN_WARNING_AT = now
    logger.warning(
        "suspicious proxy chain: Cloudflare request resolved to loopback "
        "client IP %s; check X-Forwarded-For/CF-Connecting-IP handling and "
        "FORWARDED_ALLOW_IPS",
        client_ip,
    )


def _provided_admin_token(request: Request) -> str:
    token = str(request.headers.get("X-Judgment-Admin-Token") or "").strip()
    if token:
        return token
    authorization = str(request.headers.get("Authorization") or "").strip()
    if authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return ""


def _is_demo_visitor(request: Request) -> bool:
    return bool(getattr(request.state, "is_demo_visitor", False))


def _demo_actor(request: Request) -> str:
    principal = getattr(request.state, "principal", None)
    if principal is not None and getattr(principal, "email", ""):
        return str(principal.email)
    if principal is not None and getattr(principal, "source", "") == "admin_token":
        return "admin_token"
    return "admin"


def _demo_error(
    status_code: int,
    detail: str,
    *,
    code: str,
    feature: str = "",
    retry_after: Optional[int] = None,
) -> JSONResponse:
    headers = {"Cache-Control": "no-store"}
    if retry_after:
        headers["Retry-After"] = str(max(1, int(retry_after)))
    return JSONResponse(
        status_code=status_code,
        headers=headers,
        content={
            "detail": detail,
            "code": code,
            "feature": feature,
        },
    )


def _session_is_active(session_factory: Any, session: Any) -> bool:
    if not isinstance(session, dict):
        return False
    jti = str(session.get("jti") or "").strip()
    if not jti or "sv" not in session:
        # Tokens issued before SESSION-01 lack sv and must not outlive the
        # deployment of all-device revocation.
        return False
    try:
        session_version = max(0, int(session.get("sv") or 0))
    except (TypeError, ValueError):
        return False
    return not is_session_revoked(
        session_factory,
        jti,
        email=str(session.get("email") or ""),
        session_version=session_version,
    )


def _resolve_principal(
    request: Request, settings: Settings
) -> Principal:
    """Resolve the request principal once, in the same order as the legacy
    auth middleware: local bypass, admin token, Google session, anonymous.
    """

    if (
        settings.allow_local_admin_bypass
        and _is_local_request(request)
        and not _has_forwarded_client_headers(request)
    ):
        return local_admin_principal()

    admin_expected = str(settings.admin_token or "")
    provided = _provided_admin_token(request)
    if (
        admin_expected
        and provided
        and hmac.compare_digest(provided, admin_expected)
    ):
        record_security_event(
            request.app.state.session_factory,
            settings,
            event_type="auth.admin_token",
            outcome="success",
            actor="admin_token",
            source="admin_token",
            request=request,
        )
        return admin_token_principal()

    session = read_session(request, settings)
    if session is not None and _session_is_active(
        request.app.state.session_factory, session
    ):
        return principal_from_session(session)
    return anonymous_principal()


_SENSITIVE_QUERY_RE = re.compile(
    r"([?&](?:ticket|code|state|access_token|refresh_token|id_token)=)"
    r"[^&\s\"']+",
    re.IGNORECASE,
)


def _redact_sensitive_query(value: str) -> str:
    return _SENSITIVE_QUERY_RE.sub(r"\1[redacted]", str(value or ""))


class _TicketRedactionFilter(logging.Filter):
    """Keep SSE tickets and OAuth credentials out of uvicorn access logs."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.args, tuple):
            record.args = tuple(
                _redact_sensitive_query(item)
                if isinstance(item, str)
                else item
                for item in record.args
            )
        elif isinstance(record.args, dict):
            record.args = {
                key: _redact_sensitive_query(item)
                if isinstance(item, str)
                else item
                for key, item in record.args.items()
            }
        if isinstance(record.msg, str):
            record.msg = _redact_sensitive_query(record.msg)
        return True


def _sse_binding(value: str) -> str:
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()[:32]


def _sse_principal_binding(principal: Any) -> str:
    source = str(getattr(principal, "source", "") or "anonymous")
    email = str(getattr(principal, "email", "") or "")
    user_id = str(getattr(principal, "user_id", "") or "")
    return f"{source}:{email or user_id}"


def _make_sse_ticket(
    secret: str,
    *,
    store: Dict[str, tuple[int, str, str]],
    lock: threading.Lock,
    client_ip: str,
    binding: str,
) -> str:
    if not secret:
        return ""
    expires = int(time.time()) + SSE_TICKET_TTL_SECONDS
    jti = uuid4().hex
    ip_hash = _sse_binding(client_ip)
    binding_hash = _sse_binding(binding)
    payload = f"{expires}:{jti}:{ip_hash}:{binding_hash}"
    signature = hmac.new(
        secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    with lock:
        now = int(time.time())
        for key, entry in list(store.items()):
            if entry[0] < now:
                store.pop(key, None)
        store[jti] = (expires, ip_hash, binding_hash)
    return f"{payload}:{signature}"


def _valid_sse_ticket(
    ticket: str,
    secret: str,
    *,
    store: Dict[str, tuple[int, str, str]],
    lock: threading.Lock,
    client_ip: str,
) -> bool:
    if not ticket or not secret:
        return False
    try:
        expires_text, jti, ip_hash, binding_hash, signature = str(
            ticket
        ).split(":", 4)
        expires = int(expires_text)
    except (TypeError, ValueError):
        return False
    if (
        expires < int(time.time())
        or not jti
        or not ip_hash
        or not binding_hash
        or not signature
    ):
        return False
    payload = f"{expires}:{jti}:{ip_hash}:{binding_hash}"
    expected = hmac.new(
        secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return False
    if ip_hash != _sse_binding(client_ip):
        return False
    with lock:
        entry = store.get(jti)
        if entry is None:
            return False
        if entry != (expires, ip_hash, binding_hash):
            return False
        store.pop(jti, None)
    return True


def _cors_origins(values: tuple[str, ...]) -> tuple[str, ...]:
    """Never honor a wildcard CORS origin.

    The console has write-capable admin endpoints and no browser credentials;
    a wildcard therefore grants every website the same access as a local
    operator.  Keep explicit origins (including the literal file:// origin
    ``null``) and ignore ``*`` with a warning.
    """

    origins = tuple(dict.fromkeys(value for value in values if value and value != "*"))
    if "*" in values:
        logger.warning(
            "CORS_ALLOW_ORIGINS contains '*' and was ignored; configure explicit "
            "origins such as http://127.0.0.1:9200 or https://your-frontend.example"
        )
    return origins


PERFORMANCE_TARGETS = {
    "/api/status": ("服務狀態", "judgment.web.status.build_status"),
    "/api/system-usage": ("系統資源使用", "judgment.web.system_usage.build_system_usage"),
    "/api/index-versions": ("索引版本", "judgment.web.app.index_versions"),
    "/api/catalog": ("資料庫 catalog", "judgment.web.catalog.build_catalog"),
    "/api/home": ("首頁即時摘要", "judgment.web.home.build_home_summary"),
    "/api/judgment-stats": ("判決金融佔比", "judgment.web.judgment_stats.build_judgment_stats"),
    "/api/query": ("資料查詢", "judgment.web.query.run_query"),
    "/api/law": ("法規明細", "judgment.web.query.get_law_detail"),
    "/api/judgment": ("判決原文", "judgment.web.query.get_judgment_detail"),
    "/api/rag/query": ("RAG 問答", "judgment.rag.answer_question"),
    "/api/rag/query/stream": ("RAG 問答", "judgment.rag.answer_question"),
}


_DEMO_SCHEMA_BLOCKED_COLUMNS = {
    "law_dataset_versions": frozenset({"parquet_path", "zip_path"}),
    "download_runs": frozenset({"error_message"}),
    "judgment_documents": frozenset({"source_archive"}),
    "judgment_import_runs": frozenset({"error_message"}),
}

_RAG_SHARE_TELEMETRY_PATH = re.compile(r"^/api/rag/share/[^/]+$")


def _telemetry_path(path: str) -> str:
    """Keep capability tokens out of performance records and flow JSON."""

    return _RAG_SHARE_TELEMETRY_PATH.sub(
        "/api/rag/share/:share_id",
        str(path or ""),
    )


def _performance_target(path: str) -> tuple[str, str]:
    if path in PERFORMANCE_TARGETS:
        return PERFORMANCE_TARGETS[path]
    return (path, f"http{path}")


API_ENDPOINT_LABELS = {
    "/api/health": "健康檢查",
    "/api/status": "服務狀態",
    "/api/system-usage": "系統資源使用",
    "/api/events/stream": "即時事件 SSE",
    "/api/processing/events/status": "處理事件指標",
    "/api/docs": "Swagger UI",
    "/api/openapi.json": "OpenAPI schema",
    "/api/llama-server/hosts": "llama-server 主機列表",
    "/api/llama-server/hosts/{host_id}": "llama-server 主機設定",
    "/api/llama-server/hosts/{host_id}/activate": "啟用 llama-server 主機",
    "/api/llama-server/hosts/deactivate": "停用 llama-server 主機",
    "/api/llama-server/hosts/capabilities/test": "檢查模型能力",
    "/api/llama-server/hosts/reorder": "llama-server 主機排序",
    "/api/llama-server/hosts/{host_id}/models/select": "選擇 llama-server 模型",
    "/api/llama-server/hosts/{host_id}/models/clear": "清除 llama-server 模型",
    "/api/index-versions": "索引版本列表",
    "/api/index-versions/{version_id}": "索引版本明細",
    "/api/index-versions/{version_id}/validate": "驗證索引版本",
    "/api/index-versions/{version_id}/activate": "啟用索引版本",
    "/api/index-versions/rollback": "回滾索引 alias",
    "/api/index-alias/reconcile": "Reconcile 索引 alias",
    "/api/processing": "資料處理狀態",
    "/api/processing/active": "目前處理狀態",
    "/api/processing/active/stream": "目前處理 SSE（legacy）",
    "/api/processing/plan": "資料處理計畫",
    "/api/processing/update": "完整資料更新",
    "/api/processing/workflows/{workflow_id}/run": "執行處理 workflow",
    "/api/processing/stop": "停止處理程序",
    "/api/judgment-download/status": "判決下載狀態",
    "/api/judgment-download/files/{fileset_id}": "判決下載檔案",
    "/api/versioning/summary": "版本摘要",
    "/api/versioning/judgments/snapshots": "判決快照",
    "/api/versioning/judgments/changes": "判決變更事件",
    "/api/versioning/judgments/versions/{version_id}": "判決版本明細",
    "/api/versioning/judgments/{jid}/vectors": "判決向量版本",
    "/api/versioning/judgments/{jid}/vectors/{version_id}": "判決向量版本明細",
    "/api/versioning/judgments/{jid}": "判決版本歷史",
    "/api/versioning/parquet/deltas": "Parquet delta",
    "/api/versioning/parquet/changes": "Parquet 變更",
    "/api/versioning/audit": "版本稽核事件",
    "/api/updates/status": "更新檢查狀態",
    "/api/updates/check": "檢查線上更新",
    "/api/courts/check": "法院名稱檢查",
    "/api/law-versions/check": "條文歷史檢查",
    "/api/quality": "資料品質與統計",
    "/api/catalog": "資料庫 catalog",
    "/api/home": "首頁即時摘要",
    "/api/judgment-stats": "判決金融佔比",
    "/api/query": "資料查詢",
    "/api/data/suggest": "資料欄位建議",
    "/api/judgment": "判決原文",
    "/api/law": "法規明細",
    "/api/schema/suggest": "查詢 schema 建議",
    "/api/performance/client": "Client timing",
    "/api/performance/options": "效能篩選選項",
    "/api/performance": "效能報表",
    "/api/rag/query": "RAG 問答",
    "/api/rag/query/stream": "RAG 問答 SSE",
    "/api/rag/share": "建立 RAG 分享連結",
    "/api/rag/share/{share_id}": "讀取 RAG 分享對話",
    "/api/question-bank/stats": "題庫統計",
    "/api/question-bank/items": "題庫題目",
    "/api/question-bank/tags": "題庫標籤",
    "/api/question-bank/items/{item_id}": "題庫題目明細",
    "/api/question-bank/items/{item_id}/submit": "題庫提交",
    "/api/question-bank/items/{item_id}/restore": "題庫還原",
    "/api/question-bank/items/{item_id}/review": "題庫人工評分",
    "/api/question-bank/ai-items": "AI 產生題目",
    "/api/question-bank/import": "題庫匯入",
    "/api/question-bank/export": "題庫匯出",
    "/api/question-bank/revalidate": "題庫重新驗證",
    "/api/question-bank/benchmark-ready": "Benchmark-ready 題目",
    "/api/benchmark/suites": "Benchmark suite",
    "/api/benchmark/suites/{suite_id}": "Benchmark suite 明細",
    "/api/benchmark/suites/{suite_id}/latest-answers": "Suite 最新答案",
    "/api/benchmark/suites/{suite_id}/items/{item_id}": "Suite 題目",
    "/api/benchmark/runs": "Benchmark runs",
    "/api/benchmark/runs/{run_id}": "Benchmark run 明細",
    "/api/benchmark/runs/{run_id}/stop": "停止 Benchmark run",
    "/api/benchmark/fingerprints/{fingerprint}": "Benchmark fingerprint",
    "/api/benchmark/results/{result_id}/review": "Benchmark 人工評分",
    "/api/benchmark/models": "Benchmark 模型",
    "/api/test-mode": "測試模式設定",
    "/api/llm/models": "LLM 模型列表",
    "/api/llm/models/test": "LLM 模型測試",
    "/api/llm/model": "切換 LLM 模型",
    "/api/rerank/status": "Reranker 狀態",
    "/api/rerank/test": "Reranker 服務測試",
    "/api/test-runs/current": "目前測試 Flow",
    "/api/test-runs": "測試 Flow 列表",
    "/api/test-runs/{run_id}": "測試 Flow 明細",
}

_API_METHOD_ORDER = {
    "GET": 0,
    "POST": 1,
    "PATCH": 2,
    "PUT": 3,
    "DELETE": 4,
}


def _api_endpoint_catalog(app: FastAPI) -> List[Dict[str, Any]]:
    """Return the live FastAPI route catalog for the status API tab."""

    entries: List[Dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    for route in app.routes:
        if not isinstance(route, APIRoute):
            continue
        path = str(route.path or "")
        if not path.startswith("/api/"):
            continue
        if path.startswith("/api/ollama/"):
            # Legacy aliases stay available but are not shown in the UI.
            continue
        label = API_ENDPOINT_LABELS.get(
            path,
            str(getattr(route, "name", "") or path).replace("_", " "),
        )
        for method in sorted(
            route.methods or [],
            key=lambda value: (_API_METHOD_ORDER.get(value, 9), value),
        ):
            if method in {"HEAD", "OPTIONS"}:
                continue
            key = (path, method)
            if key in seen:
                continue
            seen.add(key)
            entries.append(
                {
                    "method": method,
                    "path": path,
                    "label": label,
                    "deprecated": bool(getattr(route, "deprecated", False)),
                }
            )
    for path, label in (
        ("/api/docs", "Swagger UI"),
        ("/api/openapi.json", "OpenAPI schema"),
    ):
        key = (path, "GET")
        if key not in seen:
            entries.append(
                {
                    "method": "GET",
                    "path": path,
                    "label": label,
                    "deprecated": False,
                }
            )
    entries.sort(
        key=lambda item: (
            str(item["path"]),
            _API_METHOD_ORDER.get(str(item["method"]), 9),
            str(item["method"]),
        )
    )
    return entries


def _rag_response_metadata(result: Dict[str, Any]) -> Dict[str, Any]:
    judgments = result.get("judgments") or []
    law_sources = result.get("law_sources") or []
    reference_judgments = result.get("reference_judgments") or []
    retrieval = result.get("retrieval") or {}
    status = str(result.get("status") or "")
    return {
        "status": status,
        "answer_source": result.get("answer_source") or "",
        "citation_count": len(judgments) + len(law_sources),
        "judgment_citations": len(judgments),
        "law_citations": len(law_sources),
        "reference_judgments": len(reference_judgments),
        "judgment_candidates": retrieval.get("judgment_candidates"),
        "judgment_limit": retrieval.get("judgment_limit"),
        "judgment_limit_applied": retrieval.get("judgment_limit_applied"),
        "abstain": status not in {"operational"},
        "duration_ms": result.get("duration_ms"),
        "llm_model": result.get("llm_model"),
        "embedding_model": result.get("embedding_model"),
        "has_answer": bool(str(result.get("answer") or "").strip()),
    }


_RAG_PIPELINE_SEGMENTS = {
    "rag.parse_question",
    "rag.coverage",
    "rag.embed_query",
    "rag.qdrant_search",
    "rag.law_vector_search",
    "rag.law_retrieval",
    "rag.law_stats",
    "rag.law_content",
    "rag.law_rerank",
    "rag.rerank",
    "rag.context",
    "rag.llm_request",
    "rag.fetch_documents",
    "rag.build_citations",
}


def _llm_provider_name(session_factory, base_url: str) -> str:
    host = find_host(session_factory, base_url)
    if host is not None:
        name = str(host.get("name") or "").strip()
        if name and "://" not in name:
            return name
    hostname = urlparse(str(base_url or "")).hostname or ""
    return hostname or str(base_url or "") or "env"


def _llm_models_payload(
    session_factory,
    settings: Settings,
    allowed_hosts=None,
) -> Dict[str, Any]:
    state = model_capability_status(session_factory, settings)
    base_url = str(state.get("base_url") or "").rstrip("/")
    provider_name = _llm_provider_name(session_factory, base_url)
    host = find_host(session_factory, base_url)
    state["provider_name"] = provider_name
    state["provider"] = {
        "name": provider_name,
        "base_url": base_url,
        "host_id": host.get("id") if host else None,
        "is_active": bool(host.get("is_active")) if host else False,
    }
    providers: List[Dict[str, Any]] = []
    seen_urls = set()
    for item in list_hosts(
        session_factory, allowed_hosts=allowed_hosts
    ).get("hosts") or []:
        item_url = str(item.get("base_url") or "").rstrip("/")
        if not item_url:
            continue
        seen_urls.add(item_url)
        providers.append(
            {
                "name": item.get("name") or item_url,
                "base_url": item_url,
                "host_id": item.get("id"),
                "is_active": bool(item.get("is_active")),
                "is_effective": item_url == base_url,
                "status": item.get("status") or "",
                "detail": item.get("detail") or "",
                "chat_models": list(item.get("chat_models") or []),
                "models": list(item.get("models") or []),
            }
        )
    if base_url and base_url not in seen_urls:
        providers.append(
            {
                "name": provider_name,
                "base_url": base_url,
                "host_id": host.get("id") if host else None,
                "is_active": bool(host.get("is_active")) if host else False,
                "is_effective": True,
                "status": state.get("status") or "",
                "detail": state.get("detail") or "",
                "chat_models": list(state.get("chat_models") or []),
                "models": list(state.get("models") or []),
            }
        )
    state["providers"] = providers
    return state


def _database_pool_snapshot(engine) -> Optional[Dict[str, Any]]:
    pool = getattr(engine, "pool", None)
    if pool is None:
        return None
    try:
        return {
            "size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        }
    except Exception:
        return None


def _busy_rag_result(exc, started_perf: float) -> Dict[str, Any]:
    return {
        "status": "degraded",
        "answer": f"目前系統忙碌，預估約 {exc.eta_s:.1f} 秒後可再試。",
        "notice": "請求未進入檢索，沒有產生引用；請稍後再送出。",
        "citations": [],
        "judgments": [],
        "law_sources": [],
        "matched_terms": [],
        "answer_source": "admission",
        "degraded_reason": "busy",
        "queue_position": exc.position,
        "eta_s": round(exc.eta_s, 2),
        "retrieval": {"status": "busy"},
        "duration_ms": round((time.perf_counter() - started_perf) * 1000, 1),
    }


def _retrieval_partial(
    retrieval_result: Dict[str, Any],
    state: Dict[str, Any],
    started_perf: float,
) -> Dict[str, Any]:
    return {
        "status": retrieval_result.get("status") or "retrieval_only",
        "answer": retrieval_result.get("answer") or "",
        "notice": retrieval_result.get("notice") or "",
        "citations": [],
        "judgments": state.get("citations")
        or retrieval_result.get("judgments")
        or [],
        "reference_judgments": state.get("reference_judgments")
        or retrieval_result.get("reference_judgments")
        or [],
        "law_sources": state.get("law_sources")
        or retrieval_result.get("law_sources")
        or [],
        "law_answer": state.get("law_answer") or "",
        "law_framework": state.get("law_framework"),
        "matched_terms": state.get("terms") or [],
        "answer_source": retrieval_result.get("answer_source") or "retrieval",
        "llm_model": None,
        "embedding_model": retrieval_result.get("embedding_model"),
        "retrieval": state.get("retrieval")
        or retrieval_result.get("retrieval")
        or {},
        "coverage": state.get("coverage")
        or retrieval_result.get("coverage"),
        "duration_ms": round((time.perf_counter() - started_perf) * 1000, 1),
        "partial": True,
        "streaming": False,
        "show_sources": True,
        "rerank_degraded": bool(retrieval_result.get("rerank_degraded")),
        "degraded_reason": retrieval_result.get("degraded_reason"),
    }


def _retrieval_final_result(
    retrieval_result: Dict[str, Any],
    state: Dict[str, Any],
    settings: Settings,
    started_perf: float,
    *,
    degraded_reason: Optional[str] = None,
    notice: Optional[str] = None,
) -> Dict[str, Any]:
    result = dict(retrieval_result)
    source = str(retrieval_result.get("answer_source") or "retrieval")
    if source in {"structured", "retrieval_list"}:
        result_status = "operational"
        result_source = source
    else:
        result_status = "retrieval_only"
        result_source = "retrieval"
    result.update(
        {
            "status": result_status,
            "answer": retrieval_result.get("answer")
            or "目前沒有可顯示的回答。",
            "notice": notice
            if notice is not None
            else retrieval_result.get("notice") or "",
            "citations": [],
            "judgments": state.get("citations") or [],
            "reference_judgments": state.get("reference_judgments")
            or retrieval_result.get("reference_judgments")
            or [],
            "law_sources": state.get("law_sources") or [],
            "answer_source": result_source,
            "llm_model": None,
            "embedding_model": settings.embedding_model or None,
            "retrieval": state.get("retrieval") or {},
            "duration_ms": round(
                (time.perf_counter() - started_perf) * 1000, 1
            ),
            "degraded_reason": degraded_reason,
            "citation_retry": False,
            "citation_audit": None,
        }
    )
    return result


def _llm_final_result(
    retrieval_result: Dict[str, Any],
    state: Dict[str, Any],
    settings: Settings,
    answer: str,
    prompt_meta: Dict[str, Any],
    allowed_indexes,
    started_perf: float,
    *,
    citation_retry: bool = False,
) -> Dict[str, Any]:
    result = dict(retrieval_result)
    retrieval = dict(state.get("retrieval") or {})
    allowed = set(allowed_indexes or ())
    dropped_indexes = sorted(
        {
            int(item.get("index") or 0)
            for item in [
                *(state.get("citations") or []),
                *(state.get("law_sources") or []),
            ]
            if int(item.get("index") or 0)
            and int(item.get("index") or 0) not in allowed
        }
    )
    retrieval["prompt_context"] = {
        **prompt_meta,
        "used_indexes": sorted(allowed),
        "dropped_indexes": dropped_indexes,
    }
    citations = state.get("citations") or []
    law_sources = state.get("law_sources") or []
    mark_citation_usage(citations, answer, allowed)
    mark_citation_usage(law_sources, answer, allowed)
    citation_audit = _citation_audit(
        answer,
        citations,
        law_sources,
        allowed_indexes=allowed_indexes,
    )
    result.update(
        {
            "status": "operational",
            "answer": answer,
            "notice": (
                "回答只根據檢索到的法規／命令與判決片段生成，"
                "引用編號可對應下方來源。這不是法律意見。"
            ),
            "citations": [],
            "judgments": citations,
            "reference_judgments": state.get("reference_judgments")
            or retrieval_result.get("reference_judgments")
            or [],
            "law_sources": law_sources,
            "matched_terms": state.get("terms") or [],
            "answer_source": "llm",
            "llm_model": settings.llm_model,
            "embedding_model": settings.embedding_model or None,
            "retrieval": retrieval,
            "coverage": state.get("coverage")
            or retrieval_result.get("coverage"),
            "duration_ms": round(
                (time.perf_counter() - started_perf) * 1000, 1
            ),
            "degraded_reason": None,
            "rerank_degraded": bool(
                retrieval_result.get("rerank_degraded")
            ),
            "citation_retry": citation_retry,
            "citation_audit": citation_audit,
        }
    )
    return result


def _rag_pipeline_snapshot(flow, session_factory=None) -> Dict[str, Any]:
    """Return the compact flow snapshot embedded in RAG responses.

    The full flow contains every nested function call; the RAG answer only
    needs the canonical pipeline spans so the same waterfall renderer can be
    used by the RAG page and the performance page.
    """

    snapshot = flow.to_dict()
    snapshot["segments"] = [
        segment
        for segment in snapshot.get("segments") or []
        if segment.get("name") in _RAG_PIPELINE_SEGMENTS
    ]
    snapshot["decisions"] = list(snapshot.get("decisions") or [])
    snapshot["decision_count"] = len(snapshot["decisions"])
    if session_factory is not None:
        for segment in snapshot["segments"]:
            segment_metadata = segment.get("metadata")
            if not isinstance(segment_metadata, dict):
                segment_metadata = {}
                segment["metadata"] = segment_metadata
            base_url = str(
                segment_metadata.get("active_base_url")
                or segment_metadata.get("base_url")
                or ""
            ).strip()
            if not base_url:
                raw_url = str(
                    (segment.get("params") or {}).get("url") or ""
                ).strip()
                if "/api/" in raw_url:
                    base_url = raw_url.split("/api/", 1)[0]
            if base_url:
                segment_metadata["provider_name"] = _llm_provider_name(
                    session_factory, base_url
                )
    metadata = snapshot.get("metadata") or {}
    snapshot["metadata"] = {
        key: metadata[key]
        for key in (
            "rag_response",
            "rag_status",
            "citation_retry",
            "citation_audit",
            "asgi_to_flow_ms",
            "asgi_to_handler_ms",
            "handler_to_flow_ms",
        )
        if key in metadata
    }
    summary = snapshot.get("summary") or {}
    snapshot["summary"] = {"models": summary.get("models") or []}
    return snapshot


def create_app(
    *,
    settings: Optional[Settings] = None,
    session_factory=None,
    data_dir: Optional[Path] = None,
) -> FastAPI:
    settings = settings or Settings.from_env()
    endpoint_cache = _TTLCache()
    validate_forwarded_allow_ips(settings.forwarded_allow_ips)
    validate_auth_security(settings)
    resolved_data_dir = Path(data_dir or settings.law_data_dir).expanduser().resolve()
    owns_session_factory = session_factory is None

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Fail fast before opening the database or starting background tasks.
        validate_route_policies(app.routes)
        engine = None
        demo_engine = None
        if app.state.session_factory is None:
            engine = build_engine(
                settings.database_url,
                pool_size=settings.database_pool_size,
                max_overflow=settings.database_max_overflow,
                pool_timeout=settings.database_pool_timeout_seconds,
            )
            if settings.auto_create_schema and not settings.disable_background_tasks:
                init_db(engine)
            app.state.engine = engine
            app.state.session_factory = build_session_factory(engine)
            if settings.demo_query_database_url:
                try:
                    demo_engine = build_engine(
                        settings.demo_query_database_url,
                        pool_size=2,
                        max_overflow=2,
                        pool_timeout=5.0,
                    )
                    app.state.demo_query_engine = demo_engine
                    app.state.demo_query_session_factory = build_session_factory(
                        demo_engine
                    )
                except Exception:
                    logger.exception(
                        "failed to initialize demo read-only query engine"
                    )
                    app.state.demo_query_engine = None
                    app.state.demo_query_session_factory = None
            app.state.benchmark_manager.session_factory = app.state.session_factory
            app.state.benchmark_manager.settings = runtime_settings(
                app.state.settings, app.state.session_factory
            )
            if not settings.disable_background_tasks:
                try:
                    revalidated = revalidate_items(app.state.session_factory)
                    if revalidated.get("stale"):
                        logger.info(
                            "question bank revalidation marked %s stale items",
                            revalidated["stale"],
                        )
                except Exception:
                    logger.warning(
                        "question bank startup revalidation failed",
                        exc_info=True,
                    )
        warm_task: Optional[asyncio.Task] = None
        read_cache_task: Optional[asyncio.Task] = None
        coverage_task: Optional[asyncio.Task] = None
        staleness_task: Optional[asyncio.Task] = None
        rerank_task: Optional[asyncio.Task] = None
        maintenance_task: Optional[asyncio.Task] = None
        rag_executor = ThreadPoolExecutor(
            max_workers=max(
                1, int(app.state.settings.rag_stream_executor_workers)
            ),
            thread_name_prefix="rag-stream",
        )
        app.state.rag_executor = rag_executor
        try:
            server_ctx = await asyncio.to_thread(
                fetch_context_window,
                settings.llm_url,
                settings.llm_api,
                timeout=0.75,
            )
            configured_ctx = int(settings.llm_num_ctx or 0)
            if server_ctx:
                effective_ctx = (
                    min(configured_ctx, int(server_ctx))
                    if configured_ctx
                    else int(server_ctx)
                )
                app.state.llm_context = {
                    "server_tokens": int(server_ctx),
                    "configured_tokens": configured_ctx,
                    "effective_tokens": effective_ctx,
                    "source": "llama-server:/props",
                }
                if effective_ctx != configured_ctx:
                    logger.warning(
                        "LLM context mismatch: configured=%s server=%s; "
                        "using effective=%s",
                        configured_ctx,
                        server_ctx,
                        effective_ctx,
                    )
                probed_settings = replace(
                    settings, llm_num_ctx=effective_ctx
                )
                app.state.settings = probed_settings
                app.state.benchmark_manager.settings = probed_settings
            else:
                app.state.llm_context = {
                    "server_tokens": None,
                    "configured_tokens": configured_ctx,
                    "effective_tokens": configured_ctx,
                    "source": "unavailable",
                }
        except Exception:
            logger.warning("LLM context probe failed", exc_info=True)

        async def warm_processing_snapshots() -> None:
            while True:
                await asyncio.sleep(120)
                try:
                    snapshot = await asyncio.to_thread(
                        build_processing_snapshot,
                        settings=app.state.settings,
                        session_factory=app.state.session_factory,
                    )
                    app.state.event_broker.publish_snapshot(
                        "processing", snapshot
                    )
                except asyncio.CancelledError:
                    raise
                except Exception:
                    logger.warning(
                        "processing snapshot warm refresh failed",
                        exc_info=True,
                    )

        async def warm_coverage_cache() -> None:
            ttl = float(
                getattr(
                    app.state.settings,
                    "rag_coverage_cache_ttl_seconds",
                    0.0,
                )
                or 0.0
            )
            if ttl <= 0:
                app.state.readiness.update(
                    ready=True,
                    coverage_warmed=False,
                    detail="coverage_cache_disabled",
                )
                return
            interval = max(30.0, ttl / 2.0)
            while True:
                try:
                    started = time.perf_counter()
                    await asyncio.to_thread(
                        warm_index_coverage,
                        app.state.session_factory,
                        app.state.settings,
                    )
                    app.state.readiness.update(
                        ready=True,
                        coverage_warmed=True,
                        detail="coverage_warmed",
                    )
                    logger.debug(
                        "coverage cache warmed in %.0f ms",
                        (time.perf_counter() - started) * 1000,
                    )
                except asyncio.CancelledError:
                    raise
                except Exception:
                    app.state.readiness.update(
                        ready=True,
                        coverage_warmed=False,
                        detail="coverage_warmup_failed",
                    )
                    logger.warning(
                        "coverage cache warmup failed", exc_info=True
                    )
                await asyncio.sleep(interval)

        async def warm_staleness_cache() -> None:
            ttl = float(
                getattr(
                    app.state.settings,
                    "rag_coverage_cache_ttl_seconds",
                    0.0,
                )
                or 0.0
            )
            if ttl <= 0:
                return
            interval = max(30.0, ttl / 2.0)
            while True:
                try:
                    started = time.perf_counter()
                    await asyncio.to_thread(
                        warm_index_staleness,
                        app.state.session_factory,
                        app.state.settings,
                    )
                    logger.debug(
                        "staleness cache warmed in %.0f ms",
                        (time.perf_counter() - started) * 1000,
                    )
                except asyncio.CancelledError:
                    raise
                except Exception:
                    logger.warning(
                        "staleness cache warmup failed", exc_info=True
                    )
                await asyncio.sleep(interval)

        async def warm_read_caches() -> None:
            await asyncio.sleep(3)
            while True:
                try:
                    await asyncio.to_thread(
                        endpoint_cache.get_or_build,
                        "home",
                        120.0,
                        lambda: build_home_summary(
                            settings=runtime_settings(
                                app.state.settings,
                                app.state.session_factory,
                            ),
                            session_factory=app.state.session_factory,
                        ),
                    )
                    await asyncio.to_thread(
                        endpoint_cache.get_or_build,
                        "status",
                        30.0,
                        status_payload,
                    )
                    await asyncio.to_thread(
                        endpoint_cache.get_or_build,
                        "catalog",
                        300.0,
                        lambda: build_catalog(
                            app.state.session_factory,
                            app.state.data_dir,
                            settings=app.state.settings,
                            judgment_law_list=app.state.settings.judgment_law_list,
                        ),
                    )
                    await asyncio.to_thread(
                        endpoint_cache.get_or_build,
                        "performance-options",
                        300.0,
                        lambda: performance_options(
                            app.state.session_factory
                        ),
                    )
                except asyncio.CancelledError:
                    raise
                except Exception:
                    logger.warning(
                        "read cache warm refresh failed", exc_info=True
                    )
                await asyncio.sleep(30)

        async def rerank_warmup_loop() -> None:
            interval = max(
                10.0,
                float(
                    getattr(
                        app.state.settings,
                        "rerank_heartbeat_seconds",
                        60.0,
                    )
                    or 60.0
                ),
            )
            last_status: Optional[str] = None
            while True:
                try:
                    result = await asyncio.to_thread(
                        rerank_heartbeat, app.state.settings
                    )
                    status = str(result.get("status") or "degraded")
                    app.state.rerank_heartbeat = {
                        **result,
                        "checked_at": datetime.now(timezone.utc).isoformat(),
                    }
                    if status != last_status:
                        log = (
                            logger.info
                            if status == "ok"
                            else logger.warning
                        )
                        log("rerank heartbeat %s: %s", status, result)
                        last_status = status
                except asyncio.CancelledError:
                    raise
                except Exception:
                    logger.warning(
                        "rerank heartbeat failed", exc_info=True
                    )
                await asyncio.sleep(interval)

        async def retention_maintenance_loop() -> None:
            while True:
                try:
                    result = await asyncio.to_thread(
                        run_retention_maintenance,
                        app.state.session_factory,
                    )
                    if any(result.values()):
                        logger.info(
                            "retention maintenance pruned: %s", result
                        )
                except asyncio.CancelledError:
                    raise
                except Exception:
                    logger.warning(
                        "retention maintenance failed", exc_info=True
                    )
                await asyncio.sleep(24 * 60 * 60)

        try:
            if not app.state.settings.disable_background_tasks:
                await app.state.processing_event_server.start()
                warm_task = asyncio.create_task(warm_processing_snapshots())
                read_cache_task = asyncio.create_task(warm_read_caches())
                if owns_session_factory:
                    maintenance_task = asyncio.create_task(
                        retention_maintenance_loop()
                    )
                if (
                    owns_session_factory
                    and app.state.settings.rag_coverage_warmup_enabled
                ):
                    coverage_task = asyncio.create_task(warm_coverage_cache())
                    staleness_task = asyncio.create_task(
                        warm_staleness_cache()
                    )
                if (
                    app.state.settings.rag_rerank_enabled
                    and app.state.settings.rerank_heartbeat_enabled
                ):
                    rerank_task = asyncio.create_task(rerank_warmup_loop())
            yield
        finally:
            for task in (
                warm_task,
                read_cache_task,
                coverage_task,
                staleness_task,
                rerank_task,
                maintenance_task,
            ):
                if task is not None:
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
            rag_executor.shutdown(wait=False, cancel_futures=True)
            app.state.rag_executor = None
            await app.state.processing_event_server.stop()
            await app.state.event_broker.close()
            if demo_engine is not None:
                demo_engine.dispose()
            if engine is not None:
                engine.dispose()

    app = FastAPI(
        title="Judgment RAG Console",
        version=__version__,
        description="法規資料瀏覽、查詢報表與服務狀態 API",
        docs_url="/api/docs",
        redoc_url=None,
        openapi_url="/api/openapi.json",
        dependencies=[Depends(route_policy_guard)],
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.data_dir = resolved_data_dir
    app.state.session_factory = session_factory
    app.state.engine = None
    app.state.demo_query_engine = None
    app.state.demo_query_session_factory = None
    app.state.llm_context = None
    app.state.rerank_heartbeat = None
    app.state.readiness = {
        "ready": (
            bool(settings.disable_background_tasks)
            or not owns_session_factory
            or not bool(settings.rag_coverage_warmup_enabled)
        ),
        "coverage_warmed": False,
        "detail": (
            "background_tasks_disabled"
            if settings.disable_background_tasks
            else "starting"
        ),
    }
    app.state.demo_limiter = DemoRateLimiter()
    app.state.auth_limiter = DemoRateLimiter()
    app.state.csp_limiter = DemoRateLimiter()
    app.state.sse_tickets = {}
    app.state.sse_ticket_lock = threading.Lock()
    access_logger = logging.getLogger("uvicorn.access")
    if not any(
        isinstance(item, _TicketRedactionFilter)
        for item in access_logger.filters
    ):
        access_logger.addFilter(_TicketRedactionFilter())
    app.state.rag_admission = RagAdmission(
        max_concurrency=settings.rag_admission_max_concurrency,
        max_queue=settings.rag_admission_max_queue,
        eta_limit_seconds=settings.rag_admission_eta_limit_seconds,
        initial_service_seconds=settings.rag_admission_initial_service_seconds,
    )
    app.state.llm_admission = RagAdmission(
        max_concurrency=settings.llm_max_concurrent,
        max_queue=settings.llm_admission_max_queue,
        eta_limit_seconds=settings.rag_summary_wait_deadline_seconds,
        initial_service_seconds=settings.llm_admission_initial_service_seconds,
    )
    app.state.rag_executor = None

    csp_policy = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data:; "
        "connect-src 'self' https://api-mbp.ragdemo.win "
        "http://127.0.0.1:9200 http://localhost:9200; "
        "frame-ancestors 'none'; base-uri 'none'; "
        "form-action 'self'; object-src 'none'; "
        "report-uri https://api-mbp.ragdemo.win/api/csp-report"
    )

    @app.exception_handler(HTTPException)
    async def demo_http_exception_handler(
        request: Request, exc: HTTPException
    ) -> JSONResponse:
        demo_visitor = _is_demo_visitor(request)
        detail = exc.detail
        if demo_visitor and exc.status_code >= 500:
            logger.warning("HTTP %s: %s", exc.status_code, exc.detail)
            detail = "請求失敗，請稍後再試。"
        content: Dict[str, Any] = {"detail": detail}
        if demo_visitor and exc.status_code >= 500:
            content["request_id"] = str(
                getattr(request.state, "request_id", "")
            )
        return JSONResponse(
            status_code=exc.status_code,
            content=content,
            headers=dict(exc.headers or {}),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        logger.exception("unhandled request error")
        return JSONResponse(
            status_code=500,
            content={
                "detail": "請求失敗，請稍後再試。",
                "request_id": str(
                    getattr(request.state, "request_id", "")
                ),
            },
        )

    @app.middleware("http")
    async def record_asgi_start(request: Request, call_next):
        token = _ASGI_STARTED.set(time.perf_counter())
        try:
            return await call_next(request)
        finally:
            _ASGI_STARTED.reset(token)

    app.state.processing_manager = ProcessingManager(
        settings=settings,
        session_factory=session_factory,
    )
    app.state.benchmark_manager = BenchmarkManager(
        settings=settings,
        session_factory=session_factory,
    )

    def status_payload() -> Dict[str, Any]:
        payload = build_status(
            session_factory=app.state.session_factory,
            data_dir=app.state.data_dir,
            settings=runtime_settings(
                app.state.settings, app.state.session_factory
            ),
        )
        payload["endpoints"] = _api_endpoint_catalog(app)
        return payload

    def _query_session_factory(request: Request):
        if not _is_demo_visitor(request):
            return app.state.session_factory
        factory = app.state.demo_query_session_factory
        if factory is None:
            raise HTTPException(
                status_code=403,
                detail={
                    "message": "展示資料查詢未設定。",
                    "code": "demo_data_unavailable",
                },
            )
        return factory

    def _ollama_allowed_hosts() -> tuple[str, ...]:
        return allowed_hosts_from_settings(
            runtime_settings(
                app.state.settings, app.state.session_factory
            )
        )

    def _ollama_host_list() -> Dict[str, Any]:
        return list_hosts(
            app.state.session_factory,
            allowed_hosts=_ollama_allowed_hosts(),
        )

    app.state.event_broker = build_event_broker(
        settings_provider=lambda: app.state.settings,
        session_factory_provider=lambda: app.state.session_factory,
        processing_snapshot_provider=lambda: build_processing_snapshot(
            settings=app.state.settings,
            session_factory=app.state.session_factory,
        ),
        processing_bootstrap_provider=lambda: build_processing_bootstrap(
            settings=app.state.settings,
            session_factory=app.state.session_factory,
        ),
        processing_live_provider=build_processing_live,
        processing_replay_provider=lambda last_id: (
            app.state.processing_event_server.replay_after(last_id)
        ),
        processing_latest_event_id_provider=lambda: (
            app.state.processing_event_server.latest_event_id()
        ),
        updates_payload_provider=lambda: apply_live_judgment_pending(
            update_status(app.state.session_factory),
            app.state.settings,
        ),
        status_payload_provider=status_payload,
        judgment_download_payload_provider=lambda: download_status(
            app.state.settings
        ),
        system_usage_payload_provider=lambda: build_system_usage(
            session_factory=app.state.session_factory,
            data_dir=app.state.data_dir,
            settings=app.state.settings,
        ),
        ollama_payload_provider=lambda: _ollama_host_list(),
        court_check_payload_provider=lambda: check_court_normalization(
            app.state.session_factory
        ),
        law_version_payload_provider=lambda: check_law_version_status(
            app.state.session_factory,
            data_dir=app.state.data_dir,
        ),
        test_runs_payload_provider=lambda: {
            "run": get_latest_test_run(app.state.session_factory)
        },
        benchmark_payload_provider=lambda: {
            "runs": app.state.benchmark_manager.list_runs(limit=30)
        },
    )
    app.state.processing_event_server = ProcessingEventServer(
        broker=app.state.event_broker,
    )

    if settings.trusted_hosts:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=list(settings.trusted_hosts),
        )

    cors_origins = _cors_origins(settings.cors_allow_origins)
    # CORS is added at the end of create_app so it wraps the auth middleware.
    # Otherwise 401/403 responses from admin_auth_middleware bypass
    # CORSMiddleware and browsers report a network error instead of the detail.

    @app.middleware("http")
    async def admin_auth_middleware(request: Request, call_next):
        server = request.scope.get("server")
        if server and not server_bind_allowed(str(server[0])):
            return JSONResponse(
                status_code=503,
                content={
                    "detail": (
                        "伺服器綁定非 loopback 位址；請使用 judgment-web "
                        "並綁定 127.0.0.1，或設定明確的開發例外。"
                    )
                },
            )
        path = _canonical_request_path(request.url.path)
        if request.method == "OPTIONS" or (
            not _is_api_path(path) and path != "/docs/oauth2-redirect"
        ):
            response = await call_next(request)
            # The API host also serves the source console as a fallback.  Its
            # index and ES modules have no hashed filenames, so browsers must
            # revalidate them after a deploy instead of keeping an old UI for
            # hours.  The standalone Pages build keeps its own cache-busting.
            if path == "/" or path.startswith("/assets/"):
                response.headers["Cache-Control"] = "no-cache, must-revalidate"
            return response
        if (
            request.method not in {"GET", "HEAD"}
            and request.headers.get("Origin") == "null"
        ):
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "file:// origin 不可修改資料；請使用允許的 http(s) 來源。"
                },
            )
        current = app.state.settings
        principal = _resolve_principal(request, current)
        request.state.principal = principal
        client_ip = effective_client_ip(request)
        request.state.client_ip = client_ip
        if suspicious_proxy_chain(request, client_ip):
            _warn_suspicious_proxy_chain(client_ip)
        if path in {"/api/auth/google/start", "/api/auth/google/callback"}:
            retry_after = request.app.state.auth_limiter.check(
                client_ip_key(client_ip),
                "auth",
                per_minute=10,
                per_hour=60,
                per_day=300,
            )
            if retry_after is not None:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "登入請求過於頻繁，請稍後再試。"},
                    headers={"Retry-After": str(max(1, retry_after))},
                )

        matched_route = _match_route(app, request.scope)
        policy = _policy_for_matched_route(matched_route, request.method)
        is_public = policy in PUBLIC_POLICIES
        if policy in DEMO_POLICIES:
            if principal.is_admin:
                request.state.is_demo_visitor = False
                allowed = True
            else:
                denied = _demo_check(
                    request, policy, enforce_limits=True
                )
                if denied is not None:
                    return denied
                allowed = True
        else:
            allowed = principal_allows(
                policy,
                principal.kind,
                public_rag_enabled=current.public_rag_enabled,
            )
        if allowed:
            content_length = request.headers.get("content-length")
            if content_length:
                try:
                    body_bytes = int(content_length)
                except ValueError:
                    body_bytes = 0
                body_limit = (
                    _MAX_DEMO_BODY_BYTES
                    if _is_demo_visitor(request)
                    else _MAX_ADMIN_BODY_BYTES
                )
                if body_bytes > body_limit:
                    return JSONResponse(
                        status_code=413,
                        content={"detail": "請求內容過大。"},
                    )
            if not is_public and request.method not in {
                "GET",
                "HEAD",
                "OPTIONS",
            }:
                origin = request.headers.get("Origin")
                if principal.source == "local_bypass":
                    sec_fetch_site = request.headers.get("Sec-Fetch-Site")
                    if origin is not None and origin not in cors_origins:
                        return JSONResponse(
                            status_code=403,
                            content={
                                "detail": "不允許的 Origin 對本機管理 API 寫入。"
                            },
                        )
                    if (
                        sec_fetch_site is not None
                        and sec_fetch_site not in {"same-origin", "none"}
                    ):
                        return JSONResponse(
                            status_code=403,
                            content={
                                "detail": "跨站請求不可寫入本機管理 API。"
                            },
                        )
                elif principal.source in {
                    "google",
                    "anonymous",
                    "admin_token",
                }:
                    if not origin_allowed(
                        request,
                        current,
                        cors_origins,
                        require_origin=principal.source == "google",
                    ):
                        return JSONResponse(
                            status_code=403,
                            content={
                                "detail": "不允許的 Origin 對展示、登入或管理權杖工作階段寫入。"
                            },
                        )
                    if principal.source in {"google", "admin_token"}:
                        sec_fetch_site = request.headers.get("Sec-Fetch-Site")
                        if sec_fetch_site is not None and sec_fetch_site not in {
                            "same-origin",
                            "same-site",
                            "none",
                        }:
                            return JSONResponse(
                                status_code=403,
                                content={
                                    "detail": "跨站請求不可寫入管理 API。"
                                },
                            )
            response = await call_next(request)
            if (
                principal.is_admin
                and request.method not in {"GET", "HEAD", "OPTIONS"}
                and not path.startswith("/api/auth/")
            ):
                await asyncio.to_thread(
                    record_security_event,
                    app.state.session_factory,
                    current,
                    event_type="admin.write",
                    outcome=(
                        "success" if response.status_code < 400 else "failure"
                    ),
                    actor=str(getattr(principal, "email", "") or ""),
                    source=str(getattr(principal, "source", "") or ""),
                    request=request,
                    detail={"status_code": int(response.status_code)},
                )
            return response

        if path == "/api/events/stream":
            ticket = str(request.query_params.get("ticket") or "")
            if _valid_sse_ticket(
                ticket,
                session_secret(current),
                store=app.state.sse_tickets,
                lock=app.state.sse_ticket_lock,
                client_ip=client_ip_key(effective_client_ip(request)),
            ):
                request.state.sse_ticket_valid = True
                return await call_next(request)

        admin_expected = str(current.admin_token or "")
        if not admin_expected:
            return JSONResponse(
                status_code=403,
                content={
                    "detail": (
                        "管理 API 需要 JUDGMENT_ADMIN_TOKEN 或 Google 登入；"
                        "本機管理 bypass 未啟用。"
                    )
                },
            )
        return JSONResponse(
            status_code=401,
            content={
                "detail": "需要有效的管理權杖或 Google 帳號登入。"
            },
        )

    @app.get("/api/auth/me")
    def auth_me(request: Request) -> JSONResponse:
        current = app.state.settings
        principal = getattr(request.state, "principal", None)
        if principal is None:
            principal = _resolve_principal(request, current)
        session = read_session(request, current)
        if session is not None and not _session_is_active(
            app.state.session_factory, session
        ):
            session = None
        payload = {
            # Keep the existing auth/me contract: local bypass and admin
            # tokens are request credentials, not a browser login session.
            "authenticated": bool(session),
            "email": session.get("email") if session else None,
            "name": session.get("name") if session else None,
            "picture": session.get("picture") if session else None,
            "admin": bool(session) and principal.is_admin,
            "kind": principal.kind,
            "role": principal.role,
            "status": principal.status,
            "google_enabled": google_login_enabled(current),
            "demo": public_demo_payload(
                load_demo_state(app.state.session_factory, current)
            ),
        }
        response = JSONResponse(payload)
        if request.cookies.get(SESSION_COOKIE) and session is None:
            clear_session_cookie(response)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/api/demo/status")
    def demo_status() -> JSONResponse:
        state = load_demo_state(app.state.session_factory, app.state.settings)
        return JSONResponse(
            content=public_demo_payload(state),
            headers={"Cache-Control": "no-store"},
        )

    @app.get("/api/admin/demo")
    def admin_demo_read() -> JSONResponse:
        state = load_demo_state(app.state.session_factory, app.state.settings)
        usage = load_demo_usage(app.state.session_factory)
        payload = admin_demo_payload(state, usage)
        payload["audit"] = list_demo_audit(
            app.state.session_factory, limit=10
        )
        return JSONResponse(
            content=payload, headers={"Cache-Control": "no-store"}
        )

    @app.put("/api/admin/demo")
    def admin_demo_update(
        payload: DemoUpdateRequest, request: Request
    ) -> JSONResponse:
        try:
            state = update_demo_settings(
                app.state.session_factory,
                app.state.settings,
                enabled=payload.enabled,
                features=payload.features.model_dump(),
                duration_hours=payload.duration_hours,
                actor_email=_demo_actor(request),
                version=payload.version,
            )
        except DemoValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except DemoConflict as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        usage = load_demo_usage(app.state.session_factory)
        response = admin_demo_payload(state, usage)
        response["audit"] = list_demo_audit(
            app.state.session_factory, limit=10
        )
        return JSONResponse(
            content=response, headers={"Cache-Control": "no-store"}
        )

    @app.post("/api/admin/demo/close")
    def admin_demo_close(request: Request) -> JSONResponse:
        try:
            state = close_demo_settings(
                app.state.session_factory,
                app.state.settings,
                actor_email=_demo_actor(request),
            )
        except DemoValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        usage = load_demo_usage(app.state.session_factory)
        response = admin_demo_payload(state, usage)
        response["audit"] = list_demo_audit(
            app.state.session_factory, limit=10
        )
        return JSONResponse(
            content=response, headers={"Cache-Control": "no-store"}
        )

    @app.get("/api/admin/demo/audit")
    def admin_demo_audit(limit: int = 20) -> JSONResponse:
        return JSONResponse(
            content={
                "items": list_demo_audit(
                    app.state.session_factory, limit=limit
                )
            },
            headers={"Cache-Control": "no-store"},
        )

    @app.get("/api/admin/security-audit")
    def admin_security_audit(limit: int = 100) -> JSONResponse:
        return JSONResponse(
            content={
                "events": list_security_events(
                    app.state.session_factory, limit=limit
                ),
                "retention_days": SECURITY_AUDIT_RETENTION_DAYS,
            },
            headers={"Cache-Control": "no-store"},
        )

    def audit_auth(
        request: Request,
        *,
        event_type: str,
        outcome: str,
        actor: str = "",
        detail: Optional[Dict[str, Any]] = None,
    ) -> None:
        record_security_event(
            app.state.session_factory,
            app.state.settings,
            event_type=event_type,
            outcome=outcome,
            actor=actor,
            source="google",
            request=request,
            detail=detail,
        )

    @app.get("/api/auth/google/start", name="google_start")
    def google_start(request: Request) -> RedirectResponse:
        current = app.state.settings
        target = safe_next_url(request.query_params.get("next"), request, current)
        if not google_login_enabled(current):
            audit_auth(
                request,
                event_type="auth.google_start",
                outcome="failure",
                detail={"reason": "google_not_configured"},
            )
            return redirect_with_auth(target, error="google_not_configured")
        state = new_oauth_state()
        state_token = make_oauth_state_token(state, target, current)
        redirect_uri = google_redirect_uri(request, current)
        response = RedirectResponse(
            build_google_authorization_url(
                client_id=current.google_oauth_client_id,
                redirect_uri=redirect_uri,
                state=state,
            ),
            status_code=302,
        )
        set_oauth_state_cookie(response, request, current, state_token)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.get("/api/auth/google/callback", name="google_callback")
    async def google_callback(request: Request) -> RedirectResponse:
        current = app.state.settings
        state = str(request.query_params.get("state") or "")
        state_data = read_oauth_state(request, current)
        if not state_data or not hmac.compare_digest(
            str(state_data.get("state") or ""), state
        ):
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "state_mismatch"},
            )
            response = redirect_with_auth("/", error="state_mismatch")
            clear_oauth_state_cookie(response)
            return response

        target = safe_next_url(state_data.get("next"), request, current)
        if request.query_params.get("error"):
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "access_denied"},
            )
            response = redirect_with_auth(target, error="access_denied")
            clear_oauth_state_cookie(response)
            return response

        code = str(request.query_params.get("code") or "")
        if not code or not google_login_enabled(current):
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "oauth_failed"},
            )
            response = redirect_with_auth(target, error="oauth_failed")
            clear_oauth_state_cookie(response)
            return response

        redirect_uri = google_redirect_uri(request, current)
        try:
            user = await exchange_google_code(
                code=code,
                client_id=current.google_oauth_client_id,
                client_secret=current.google_oauth_client_secret,
                redirect_uri=redirect_uri,
            )
        except Exception:
            logger.exception("Google OAuth code exchange failed")
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "oauth_exchange_failed"},
            )
            response = redirect_with_auth(target, error="oauth_failed")
            clear_oauth_state_cookie(response)
            return response

        if not email_verified(user):
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "email_unverified"},
            )
            response = redirect_with_auth(target, error="email_unverified")
            clear_oauth_state_cookie(response)
            return response

        email = str(user.get("email") or "").strip().lower()
        if not allowed_email(email, current):
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="denied",
                detail={"reason": "not_allowed", "email": email[:320]},
            )
            response = redirect_with_auth(target, error="not_allowed")
            clear_oauth_state_cookie(response)
            return response

        try:
            session_version = get_session_epoch(
                app.state.session_factory, email
            )
            token = make_session_token(
                user,
                current,
                session_version=session_version,
            )
        except ValueError:
            logger.exception("Google login session secret is not configured")
            audit_auth(
                request,
                event_type="auth.google_login",
                outcome="failure",
                detail={"reason": "session_secret_missing"},
            )
            response = redirect_with_auth(target, error="oauth_failed")
            clear_oauth_state_cookie(response)
            return response

        audit_auth(
            request,
            event_type="auth.google_login",
            outcome="success",
            actor=email,
            detail={"email": email[:320]},
        )
        response = redirect_with_auth(target, ok=True)
        set_session_cookie(response, request, current, token)
        clear_oauth_state_cookie(response)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/api/auth/logout")
    def auth_logout(request: Request) -> JSONResponse:
        current = app.state.settings
        if request.headers.get("Sec-Fetch-Site") == "cross-site":
            return JSONResponse(
                status_code=403,
                content={"detail": "跨站請求不可登出。"},
            )
        if not origin_allowed(request, current, cors_origins):
            return JSONResponse(
                status_code=403,
                content={"detail": "不允許的 Origin。"},
            )
        session = read_session(request, current)
        if session is not None:
            jti = str(session.get("jti") or "").strip()
            if jti:
                try:
                    revoke_session(
                        app.state.session_factory,
                        jti,
                        int(session.get("exp") or 0),
                    )
                except Exception:
                    logger.warning(
                        "failed to persist session revocation", exc_info=True
                    )
        principal = getattr(request.state, "principal", None)
        record_security_event(
            app.state.session_factory,
            current,
            event_type="auth.logout",
            outcome="success",
            actor=str((session or {}).get("email") or ""),
            source=(
                "google"
                if session is not None
                else str(getattr(principal, "source", "") or "")
            ),
            request=request,
            detail={"had_session": session is not None},
        )
        response = JSONResponse({"ok": True})
        clear_session_cookie(response)
        clear_oauth_state_cookie(response)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/api/auth/logout-all")
    def auth_logout_all(request: Request) -> JSONResponse:
        current = app.state.settings
        if request.headers.get("Sec-Fetch-Site") == "cross-site":
            return JSONResponse(
                status_code=403,
                content={"detail": "跨站請求不可登出。"},
            )
        if not origin_allowed(request, current, cors_origins):
            return JSONResponse(
                status_code=403,
                content={"detail": "不允許的 Origin。"},
            )
        session = read_session(request, current)
        if session is None or not _session_is_active(
            app.state.session_factory, session
        ):
            response = JSONResponse({"ok": True, "revoked": "none"})
            clear_session_cookie(response)
            clear_oauth_state_cookie(response)
            response.headers["Cache-Control"] = "no-store"
            return response
        email = str(session.get("email") or "").strip().lower()
        if not email:
            response = JSONResponse({"ok": True, "revoked": "none"})
            clear_session_cookie(response)
            clear_oauth_state_cookie(response)
            response.headers["Cache-Control"] = "no-store"
            return response
        try:
            epoch = revoke_all_sessions(app.state.session_factory, email)
        except Exception:
            logger.exception("failed to revoke all sessions")
            return JSONResponse(
                status_code=503,
                content={"detail": "無法撤銷工作階段，請稍後再試。"},
            )
        record_security_event(
            app.state.session_factory,
            current,
            event_type="auth.logout_all",
            outcome="success",
            actor=email,
            source="google",
            request=request,
            detail={"epoch": int(epoch)},
        )
        response = JSONResponse({"ok": True, "revoked": "all"})
        clear_session_cookie(response)
        clear_oauth_state_cookie(response)
        response.headers["Cache-Control"] = "no-store"
        return response

    @app.post("/api/auth/sse-ticket")
    def sse_ticket(request: Request) -> Dict[str, Any]:
        principal = getattr(request.state, "principal", None)
        ticket = _make_sse_ticket(
            session_secret(app.state.settings),
            store=app.state.sse_tickets,
            lock=app.state.sse_ticket_lock,
            client_ip=client_ip_key(effective_client_ip(request)),
            binding=_sse_principal_binding(principal),
        )
        return {
            "ticket": ticket,
            "expires_in": SSE_TICKET_TTL_SECONDS if ticket else 0,
        }

    @app.middleware("http")
    async def performance_middleware(request: Request, call_next):
        path = request.url.path
        skipped = (
            not path.startswith("/api/")
            or path.startswith("/api/performance")
            or path.startswith("/api/processing")
            or path.startswith("/api/events")
            or path.startswith("/api/auth")
            or path.startswith("/api/quality")
            or path.startswith("/api/question-bank")
            or path.startswith("/api/benchmark")
            or path == "/api/rag/query/stream"
            or path.startswith("/api/test-")
            or path in {"/api/health", "/api/docs", "/api/openapi.json"}
            or request.method == "OPTIONS"
        )
        if skipped:
            return await call_next(request)

        path = _telemetry_path(path)
        started_at = datetime.now(timezone.utc)
        started = time.perf_counter()
        request_id = str(
            getattr(request.state, "request_id", "") or _incoming_request_id(request)
        )
        flow = start_flow(
            request_id=request_id,
            entrypoint=path,
            method=request.method,
            path=path,
            params=dict(request.query_params),
            client_started_at_ms=_client_started_ms(request),
        )
        response = None
        error_message = None
        try:
            with flow.segment(
                "http.request",
                module="judgment.web.app",
                function="performance_middleware",
                params={
                    "method": request.method,
                    "path": path,
                    "query": dict(request.query_params),
                },
            ):
                response = await call_next(request)
            response.headers["X-Judgment-Request-Id"] = request_id
            return response
        except Exception as exc:
            error_message = f"{exc.__class__.__name__}: {exc}"
            raise
        finally:
            finished_at = datetime.now(timezone.utc)
            duration_ms = int((time.perf_counter() - started) * 1000)
            status_code = getattr(response, "status_code", 500)
            status = "success" if status_code < 400 and error_message is None else "failed"
            process, module = _performance_target(path)
            flow.set_metadata("status_code", status_code)
            if response is not None:
                flow.set_metadata(
                    "response_content_type",
                    response.headers.get("content-type", ""),
                )
            flow.finish(status=status, error_message=error_message)
            record_performance(
                app.state.session_factory,
                process=process,
                module=module,
                status=status,
                started_at=started_at,
                finished_at=finished_at,
                duration_ms=duration_ms,
                method=request.method,
                path=path,
                status_code=status_code,
                request_id=request_id,
                params=dict(request.query_params),
                flow=flow.to_dict(),
                error_message=error_message,
            )
            clear_flow()

    if (STATIC_DIR / "assets").is_dir():
        app.mount(
            "/assets",
            StaticFiles(directory=STATIC_DIR / "assets"),
            name="assets",
        )

    @app.get("/", include_in_schema=False)
    def index() -> FileResponse:
        return FileResponse(STATIC_DIR / "index.html")

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon() -> FileResponse:
        return FileResponse(STATIC_DIR / "favicon.svg")

    @app.post("/api/csp-report")
    async def csp_report(request: Request) -> Response:
        retry_after = app.state.csp_limiter.check(
            client_ip_key(effective_client_ip(request)),
            "csp",
            per_minute=30,
            per_hour=200,
            per_day=1000,
        )
        if retry_after is not None:
            return Response(
                status_code=429,
                headers={"Retry-After": str(max(1, retry_after))},
            )
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > _CSP_MAX_BYTES:
                return Response(status_code=413)
        if not _csp_daily_allowed():
            return Response(status_code=429)
        try:
            payload = json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return Response(status_code=204)
        summary = _csp_report_summary(payload)
        if summary is not None:
            _write_csp_report(summary)
        return Response(status_code=204)

    @app.get("/api/health")
    def health():
        readiness = app.state.readiness
        payload = {
            "status": "ok" if readiness.get("ready") else "starting",
            "version": __version__,
            "readiness": {
                "ready": bool(readiness.get("ready")),
                "detail": str(readiness.get("detail") or ""),
            },
        }
        if not readiness.get("ready"):
            return JSONResponse(status_code=503, content=payload)
        return payload

    @app.get("/api/home")
    def home_summary(request: Request) -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="home_summary",
            params={},
        ):
            payload = endpoint_cache.get_or_build(
                "home",
                60.0,
                lambda: build_home_summary(
                    settings=runtime_settings(
                        app.state.settings, app.state.session_factory
                    ),
                    session_factory=app.state.session_factory,
                ),
            )
            if _is_demo_visitor(request):
                return sanitize_infrastructure(payload)
            return payload

    @app.get("/api/status")
    def status(request: Request) -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="status",
            params={},
        ):
            payload = endpoint_cache.get_or_build(
                "status", 20.0, status_payload
            )
            if _is_demo_visitor(request):
                return sanitize_status_payload(payload)
            return payload

    @app.get("/api/llama-server/hosts")
    @app.get("/api/ollama/hosts", include_in_schema=False)
    def ollama_hosts() -> Dict[str, Any]:
        return _ollama_host_list()

    @app.post("/api/llama-server/hosts")
    @app.post("/api/ollama/hosts", include_in_schema=False)
    def ollama_host_create(payload: OllamaHostRequest) -> Dict[str, Any]:
        try:
            host = add_host(
                app.state.session_factory,
                name=payload.name,
                url=payload.url,
                port=payload.port,
                allowed_hosts=_ollama_allowed_hosts(),
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.patch("/api/llama-server/hosts/{host_id}")
    @app.patch("/api/ollama/hosts/{host_id}", include_in_schema=False)
    def ollama_host_update(
        host_id: int, payload: OllamaHostRequest
    ) -> Dict[str, Any]:
        try:
            host = update_host(
                app.state.session_factory,
                host_id,
                name=payload.name,
                url=payload.url,
                port=payload.port,
                allowed_hosts=_ollama_allowed_hosts(),
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.delete("/api/llama-server/hosts/{host_id}")
    @app.delete("/api/ollama/hosts/{host_id}", include_in_schema=False)
    def ollama_host_delete(host_id: int) -> Dict[str, Any]:
        if not delete_host(app.state.session_factory, host_id):
            raise HTTPException(status_code=404, detail="找不到 llama-server 主機。")
        _sync_runtime_settings()
        return {"status": "deleted", "id": host_id}

    @app.post("/api/llama-server/hosts/{host_id}/activate")
    @app.post("/api/ollama/hosts/{host_id}/activate", include_in_schema=False)
    def ollama_host_activate(host_id: int) -> Dict[str, Any]:
        try:
            host = activate_host(app.state.session_factory, host_id)
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.post("/api/llama-server/hosts/deactivate")
    @app.post("/api/ollama/hosts/deactivate", include_in_schema=False)
    def ollama_host_deactivate() -> Dict[str, Any]:
        result = deactivate_hosts(app.state.session_factory)
        _sync_runtime_settings()
        return result

    @app.post("/api/llama-server/hosts/capabilities/test")
    @app.post("/api/ollama/hosts/capabilities/test", include_in_schema=False)
    def ollama_host_capabilities_test() -> Dict[str, Any]:
        refreshed_urls = set()
        for host in _ollama_host_list().get("hosts") or []:
            if host.get("status") != "operational":
                continue
            host_url = str(host.get("base_url") or "").rstrip("/")
            if not host_url or host_url in refreshed_urls:
                continue
            refreshed_urls.add(host_url)
            refresh_model_capabilities(
                app.state.session_factory,
                app.state.settings.with_overrides(
                    llm_url=host_url,
                    llm_api=str(host.get("api") or "ollama"),
                ),
            )
        return _ollama_host_list()

    @app.post("/api/llama-server/hosts/reorder")
    @app.post("/api/ollama/hosts/reorder", include_in_schema=False)
    def ollama_host_reorder(payload: OllamaHostOrderRequest) -> Dict[str, Any]:
        try:
            result = reorder_hosts(
                app.state.session_factory, payload.host_ids
            )
            _sync_runtime_settings()
            return result
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.post("/api/llama-server/hosts/{host_id}/models/select")
    @app.post("/api/ollama/hosts/{host_id}/models/select", include_in_schema=False)
    def ollama_model_select(
        host_id: int, payload: OllamaModelChoiceRequest
    ) -> Dict[str, Any]:
        try:
            host = select_model(
                app.state.session_factory,
                host_id,
                model=payload.model,
                role=payload.role,
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.post("/api/llama-server/hosts/{host_id}/models/clear")
    @app.post("/api/ollama/hosts/{host_id}/models/clear", include_in_schema=False)
    def ollama_model_clear(
        host_id: int, payload: OllamaModelChoiceRequest
    ) -> Dict[str, Any]:
        try:
            host = clear_model(
                app.state.session_factory,
                host_id,
                model=payload.model,
                role=payload.role,
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.get("/api/index-versions")
    def index_versions() -> Dict[str, Any]:
        return {
            "versions": list_versions(app.state.session_factory),
            "alias": settings.judgment_vector_alias,
        }

    @app.get("/api/index-versions/{version_id}")
    def index_version_detail(version_id: int) -> Dict[str, Any]:
        version = get_version(app.state.session_factory, version_id)
        if version is None:
            raise HTTPException(status_code=404, detail="找不到索引版本")
        return {"version": version}

    @app.post("/api/index-versions/{version_id}/validate")
    def index_version_validate(version_id: int) -> Dict[str, Any]:
        version = get_version(app.state.session_factory, version_id)
        if version is None:
            raise HTTPException(status_code=404, detail="找不到索引版本")
        store = QdrantStore(settings.qdrant_url, api_key=settings.qdrant_api_key)
        try:
            return {
                "validation": validate_version(
                    app.state.session_factory, store=store, version=version
                )
            }
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"索引驗證失敗：{exc}") from exc

    @app.post("/api/index-versions/{version_id}/activate")
    def index_version_activate(version_id: int) -> Dict[str, Any]:
        store = QdrantStore(settings.qdrant_url, api_key=settings.qdrant_api_key)
        try:
            return {
                "version": activate_version(
                    app.state.session_factory,
                    store=store,
                    version_id=version_id,
                    alias_name=settings.judgment_vector_alias,
                )
            }
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"索引切換失敗：{exc}") from exc

    @app.post("/api/index-versions/rollback")
    def index_version_rollback() -> Dict[str, Any]:
        store = QdrantStore(settings.qdrant_url, api_key=settings.qdrant_api_key)
        try:
            return {
                "version": rollback_version(
                    app.state.session_factory,
                    store=store,
                    alias_name=settings.judgment_vector_alias,
                )
            }
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"索引回滾失敗：{exc}") from exc

    def _reconcile_index_alias(repair: bool) -> Dict[str, Any]:
        store = QdrantStore(settings.qdrant_url, api_key=settings.qdrant_api_key)
        try:
            return reconcile_alias(
                app.state.session_factory,
                store=store,
                alias_name=settings.judgment_vector_alias,
                repair=repair,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail=f"索引狀態檢查失敗：{exc}"
            ) from exc

    @app.get("/api/index-alias/reconcile")
    def index_version_reconcile() -> Dict[str, Any]:
        return _reconcile_index_alias(False)

    @app.post("/api/index-alias/reconcile")
    def index_version_reconcile_repair(
        payload: IndexReconcileRequest,
    ) -> Dict[str, Any]:
        return _reconcile_index_alias(payload.repair)

    @app.get("/api/system-usage")
    def system_usage() -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="system_usage",
            params={},
        ):
            return build_system_usage(
                session_factory=app.state.session_factory,
                data_dir=app.state.data_dir,
                settings=settings,
            )

    @app.get("/api/processing")
    def processing_snapshot(
        request: Request, cached: bool = False, slim: bool = False
    ) -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="processing_snapshot",
            params={"cached": cached, "slim": slim},
        ):
            if _is_demo_visitor(request):
                payload = build_processing_bootstrap(
                    settings=settings,
                    session_factory=app.state.session_factory,
                )
                payload = sanitize_processing_payload(payload)
                return (
                    slim_processing_snapshot(payload) if slim else payload
                )
            if cached:
                # First paint should never wait for the full DB/Qdrant scan.
                # The cached snapshot is refreshed by the background warmer.
                payload = build_processing_bootstrap(
                    settings=settings,
                    session_factory=app.state.session_factory,
                )
                return (
                    slim_processing_snapshot(payload) if slim else payload
                )
            return build_processing_snapshot(
                settings=settings,
                session_factory=app.state.session_factory,
            )

    @app.get("/api/demo/processing")
    def demo_processing_summary() -> JSONResponse:
        snapshot = build_processing_bootstrap(
            settings=settings,
            session_factory=app.state.session_factory,
        )
        workflows = snapshot.get("workflows") or []
        index_workflow = next(
            (
                item
                for item in workflows
                if isinstance(item, dict)
                and item.get("id") == "index_versions"
            ),
            {},
        )
        runtime = index_workflow.get("index_runtime") or {}
        current = runtime.get("current") or {}
        copy = runtime.get("copy") or {}
        summary = runtime.get("summary") or {}
        active_runs = []
        for run in snapshot.get("active_runs") or []:
            if not isinstance(run, dict):
                continue
            active_runs.append(
                {
                    "id": run.get("id"),
                    "title": run.get("title") or "",
                    "status": run.get("status") or "",
                    "started_at": run.get("started_at"),
                    "current_stage": run.get("current_stage") or "",
                    "message": run.get("message") or "",
                }
            )
        recent_runs = []
        for run in snapshot.get("recent_runs") or []:
            if not isinstance(run, dict):
                continue
            recent_runs.append(
                {
                    "id": run.get("id"),
                    "title": run.get("title") or "",
                    "status": run.get("status") or "",
                    "started_at": run.get("started_at"),
                    "finished_at": run.get("finished_at"),
                    "duration_ms": int(run.get("duration_ms") or 0),
                    "current_stage": run.get("current_stage") or "",
                }
            )
        payload = {
            "status": snapshot.get("status") or "",
            "mode": snapshot.get("mode") or "",
            "generated_at": snapshot.get("generated_at"),
            "index": {
                "workflow_id": index_workflow.get("id") or "index_versions",
                "label": index_workflow.get("label")
                or "Qdrant判決向量索引版本建置",
                "version_id": runtime.get("version_id"),
                "build_mode": runtime.get("build_mode") or "",
                "expected_count": runtime.get("expected_count") or 0,
                "summary": {
                    "indexed": int(summary.get("indexed") or 0),
                    "total": int(summary.get("total") or 0),
                    "reused": int(summary.get("reused") or 0),
                    "embedded": int(summary.get("embedded") or 0),
                },
                "current": {
                    "month": current.get("month") or "",
                    "phase": current.get("phase") or "",
                },
                "copy": {
                    "status": copy.get("status") or "",
                    "copied": int(copy.get("copied") or 0),
                    "total": int(copy.get("total") or 0),
                    "duration_ms": int(copy.get("duration_ms") or 0),
                    "resumed": bool(copy.get("resumed")),
                },
            },
            "active_runs": active_runs[:5],
            "recent_runs": recent_runs[:10],
            "capabilities": {
                "index_pending_months": int(
                    (snapshot.get("capabilities") or {}).get(
                        "index_pending_months"
                    )
                    or 0
                )
            },
        }
        return JSONResponse(
            content=payload, headers={"Cache-Control": "no-store"}
        )

    @app.get("/api/processing/active")
    def processing_active() -> Dict[str, Any]:
        return build_active_import()

    @app.get("/api/processing/active/stream")
    async def processing_active_stream() -> StreamingResponse:
        return StreamingResponse(
            active_import_event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    @app.get("/api/events/stream")
    async def events_stream(
        topic: str = Query(""),
        last_event_id: Optional[str] = Header(
            None, alias="Last-Event-ID"
        ),
    ) -> StreamingResponse:
        topics = [part.strip() for part in topic.split(",") if part.strip()]
        broker = app.state.event_broker
        if not topics or any(item not in broker.topics for item in topics):
            raise HTTPException(
                status_code=400,
                detail="未知的事件 topic；請使用 processing、judgment-download、"
                "test-runs、benchmark、updates、status、system-usage、ollama、"
                "court-check 或 law-version-check。",
            )
        return StreamingResponse(
            broker.stream(topics, last_event_id=last_event_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    @app.get("/api/processing/events/status")
    def processing_events_status() -> Dict[str, Any]:
        return app.state.processing_event_server.stats()

    @app.get("/api/processing/plan")
    def processing_plan() -> Dict[str, Any]:
        return build_processing_plan(
            settings=settings,
            session_factory=app.state.session_factory,
        )

    @app.post("/api/processing/update")
    def processing_update(request: ProcessingUpdateRequest) -> Dict[str, Any]:
        try:
            return app.state.processing_manager.start_update(index=request.index)
        except RuntimeError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"無法啟動資料更新：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.get("/api/judgment-download/status")
    def judgment_download_state() -> Dict[str, Any]:
        return download_status(app.state.settings)

    @app.get("/api/judgment-download/files/{fileset_id}")
    def judgment_download_file(fileset_id: int) -> StreamingResponse:
        download_settings = app.state.settings
        if not download_settings.judgment_download_allow_off_hours:
            try:
                ensure_window()
            except DownloadWindowClosed as exc:
                raise HTTPException(status_code=403, detail=str(exc)) from exc
        if not _JUDGMENT_DOWNLOAD_LOCK.acquire(blocking=False):
            raise HTTPException(
                status_code=409,
                detail="已有判決檔案下載中；請一次只下載一個檔案。",
            )
        released = threading.Event()

        def release() -> None:
            if released.is_set():
                return
            released.set()
            _JUDGMENT_DOWNLOAD_LOCK.release()

        try:
            headers = file_response_headers(download_settings, fileset_id)
        except FileNotFoundError as exc:
            release()
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except JudgmentDownloadError as exc:
            release()
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        except Exception:
            release()
            raise

        def stream() -> Iterator[bytes]:
            try:
                yield from iter_fileset(download_settings, fileset_id)
            finally:
                release()

        return StreamingResponse(
            stream(),
            media_type="application/octet-stream",
            headers=headers,
            background=BackgroundTask(release),
        )

    @app.get("/api/versioning/summary")
    def versioning_snapshot_summary() -> Dict[str, Any]:
        return versioning_summary(app.state.session_factory)

    @app.get("/api/versioning/judgments/snapshots")
    def versioning_judgment_snapshots(
        issue_month: str = "",
        limit: int = Query(50, ge=1, le=500),
    ) -> Dict[str, Any]:
        return {
            "snapshots": list_snapshot_dicts(
                app.state.session_factory,
                issue_month=issue_month.strip(),
                limit=limit,
            )
        }

    @app.get("/api/versioning/judgments/changes")
    def versioning_judgment_changes(
        issue_month: str = "",
        since_id: int = Query(0, ge=0),
        limit: int = Query(100, ge=1, le=1000),
    ) -> Dict[str, Any]:
        return {
            "events": change_events(
                app.state.session_factory,
                issue_month=issue_month.strip(),
                since_id=since_id,
                limit=limit,
            )
        }

    @app.get("/api/versioning/judgments/versions/{version_id}")
    def versioning_judgment_version(
        version_id: int,
    ) -> Dict[str, Any]:
        payload = version_detail(
            app.state.session_factory, version_id=version_id
        )
        if payload is None:
            raise HTTPException(status_code=404, detail="找不到判決歷史版本。")
        return payload

    @app.get("/api/versioning/judgments/{jid}/vectors")
    def versioning_judgment_vectors(
        jid: str,
        limit: int = Query(100, ge=1, le=1000),
    ) -> Dict[str, Any]:
        return {
            "jid": jid,
            "vectors": judgment_vector_versions(
                app.state.session_factory, jid=jid.strip(), limit=limit
            ),
            "history_collection": app.state.settings.judgment_vector_history_collection,
        }

    @app.get("/api/versioning/judgments/{jid}/vectors/{version_id}")
    def versioning_judgment_vector(
        jid: str,
        version_id: int,
    ) -> Dict[str, Any]:
        history_settings = app.state.settings
        collection = history_settings.judgment_vector_history_collection
        if not history_settings.qdrant_url:
            return {
                "status": "not_configured",
                "detail": "QDRANT_URL 未設定。",
                "jid": jid,
                "version_id": version_id,
            }
        store = QdrantStore(
            history_settings.qdrant_url,
            api_key=history_settings.qdrant_api_key,
        )
        try:
            points = store.retrieve_points(
                collection,
                [history_point_id(jid, version_id)],
                with_payload=True,
                with_vector=True,
            )
        except Exception as exc:
            message = str(exc)
            if "HTTP 404" in message or "doesn't exist" in message or "Not found" in message:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"找不到 Qdrant history collection：{collection}。"
                        "建立新索引版本後才會有舊向量。"
                    ),
                ) from exc
            raise HTTPException(
                status_code=502,
                detail=f"Qdrant history 查詢失敗：{exc}",
            ) from exc
        if not points:
            raise HTTPException(
                status_code=404, detail="找不到指定的歷史向量。"
            )
        return {
            "status": "ok",
            "jid": jid,
            "version_id": version_id,
            "collection": collection,
            "point": points[0],
        }

    @app.get("/api/versioning/judgments/{jid}")
    def versioning_judgment(jid: str) -> Dict[str, Any]:
        payload = judgment_history(
            app.state.session_factory, jid=jid.strip()
        )
        if payload.get("current") is None and not payload.get("versions"):
            raise HTTPException(status_code=404, detail="找不到判決版本歷史。")
        return payload

    @app.get("/api/versioning/parquet/deltas")
    def versioning_parquet_deltas(
        issue_month: str = "",
        limit: int = Query(50, ge=1, le=500),
    ) -> Dict[str, Any]:
        return {
            "deltas": list_delta_manifests(
                app.state.settings.judgment_data_dir,
                issue_month=issue_month.strip(),
                limit=limit,
            )
        }

    @app.get("/api/versioning/parquet/changes")
    def versioning_parquet_changes(
        issue_month: str = Query("", min_length=6, max_length=6),
        limit: int = Query(100, ge=1, le=500),
    ) -> Dict[str, Any]:
        return {
            "issue_month": issue_month,
            "rows": list_delta_rows(
                app.state.settings.judgment_data_dir,
                issue_month=issue_month,
                limit=limit,
            ),
        }

    @app.get("/api/versioning/audit")
    def versioning_audit(
        since_id: int = Query(0, ge=0),
        issue_month: str = "",
        limit: int = Query(100, ge=1, le=1000),
    ) -> Dict[str, Any]:
        events = change_events(
            app.state.session_factory,
            issue_month=issue_month.strip(),
            since_id=since_id,
            limit=limit,
            ascending=True,
        )
        latest_event_id = max(
            [int(event["id"]) for event in events] or [int(since_id)]
        )
        return {
            "latest_event_id": latest_event_id,
            "events": events,
            "snapshots": list_snapshot_dicts(
                app.state.session_factory,
                issue_month=issue_month.strip(),
                limit=min(limit, 100),
            ),
            "deltas": list_delta_manifests(
                app.state.settings.judgment_data_dir,
                issue_month=issue_month.strip(),
                limit=min(limit, 100),
            ),
        }

    @app.get("/api/updates/status")
    def updates_status() -> Dict[str, Any]:
        return endpoint_cache.get_or_build(
            "updates",
            5.0,
            lambda: apply_live_judgment_pending(
                update_status(app.state.session_factory),
                app.state.settings,
            ),
        )

    @app.post("/api/updates/check")
    def updates_check(
        payload: Optional[UpdateCheckRequest] = None,
    ) -> Dict[str, Any]:
        source_types = list(payload.source_types) if payload else []
        invalid = sorted(set(source_types) - set(SOURCE_TYPES))
        if invalid:
            raise HTTPException(
                status_code=400,
                detail=f"未知的更新來源：{', '.join(invalid)}",
            )
        if not _UPDATE_CHECK_LOCK.acquire(blocking=False):
            return {
                **apply_live_judgment_pending(
                    update_status(app.state.session_factory),
                    app.state.settings,
                ),
                "checking": True,
            }
        try:
            check_all_sources(
                settings=app.state.settings,
                session_factory=app.state.session_factory,
                source_types=source_types or None,
            )
            return apply_live_judgment_pending(
                update_status(app.state.session_factory),
                app.state.settings,
            )
        finally:
            _UPDATE_CHECK_LOCK.release()

    @app.post("/api/processing/workflows/{workflow_id}/run")
    def processing_workflow_run(workflow_id: str) -> Dict[str, Any]:
        try:
            return app.state.processing_manager.start_workflow(workflow_id)
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"無法啟動工作流程：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.post("/api/processing/stop")
    def processing_stop() -> Dict[str, Any]:
        try:
            return app.state.processing_manager.stop_update()
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

    @app.get("/api/courts/check")
    def courts_check() -> Dict[str, Any]:
        return check_court_normalization(app.state.session_factory)

    @app.get("/api/law-versions/check")
    def law_versions_check() -> Dict[str, Any]:
        return check_law_version_status(
            app.state.session_factory,
            data_dir=app.state.settings.law_data_dir,
        )

    @app.get("/api/quality")
    def quality_snapshot(
        request: Request, cached: bool = False
    ) -> Dict[str, Any]:
        try:
            if _is_demo_visitor(request) or cached:
                return build_quality_bootstrap(
                    settings=settings,
                    session_factory=app.state.session_factory,
                )
            return build_quality_snapshot(
                settings=settings,
                session_factory=app.state.session_factory,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"資料品質掃描失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    def _actor(request: Request, fallback: str = "") -> str:
        if not _is_local_request(request):
            return "admin"
        header = str(request.headers.get("X-Judgment-Actor") or "").strip()
        return (header or fallback or "local")[:120]

    def _question_bank_error(exc: QuestionBankError) -> HTTPException:
        return HTTPException(
            status_code=422,
            detail={
                "message": str(exc),
                "errors": exc.errors,
                "warnings": exc.warnings,
            },
        )

    def _ollama_host_error(exc: OllamaHostError) -> HTTPException:
        return HTTPException(
            status_code=422,
            detail={"message": str(exc), "errors": [str(exc)]},
        )

    def _sync_runtime_settings() -> None:
        app.state.benchmark_manager.settings = runtime_settings(
            app.state.settings, app.state.session_factory
        )

    @app.get("/api/demo/quality")
    def demo_quality_summary() -> JSONResponse:
        snapshot = build_quality_bootstrap(
            settings=settings,
            session_factory=app.state.session_factory,
        )
        totals = snapshot.get("totals") or {}
        checks = []
        for check in snapshot.get("checks") or []:
            if not isinstance(check, dict):
                continue
            checks.append(
                {
                    key: check.get(key)
                    for key in (
                        "key",
                        "label",
                        "value",
                        "count",
                        "percent",
                        "severity",
                        "status",
                        "note",
                    )
                    if check.get(key) is not None
                }
            )
        coverage = snapshot.get("coverage") or {}
        payload = {
            "status": snapshot.get("status") or "",
            "available": bool(snapshot.get("available")),
            "generated_at": snapshot.get("generated_at"),
            "scan_ms": int(snapshot.get("scan_ms") or 0),
            "archive_count": len(snapshot.get("archives") or []),
            "totals": {
                key: totals.get(key)
                for key in (
                    "rows",
                    "unique_jids",
                    "duplicate_jid_rows",
                    "missing_jid_rows",
                    "empty_text_rows",
                    "short_text_rows",
                    "missing_court_rows",
                    "missing_normalized_rows",
                    "missing_date_rows",
                    "invalid_date_rows",
                    "missing_title_rows",
                    "missing_pdf_rows",
                    "matched_rows",
                    "match_rate",
                )
            },
            "checks": checks,
            "coverage": {
                key: coverage.get(key)
                for key in (
                    "status",
                    "detail",
                    "postgres_judgments",
                    "postgres_diff",
                    "postgres_coverage_pct",
                    "vector_indexed",
                    "vector_total",
                    "vector_remaining",
                    "vector_coverage_pct",
                )
            },
            "warnings": list(snapshot.get("warnings") or [])[:10],
        }
        return JSONResponse(
            content=payload, headers={"Cache-Control": "no-store"}
        )

    @app.get("/api/question-bank/stats")
    def question_bank_summary() -> Dict[str, Any]:
        return endpoint_cache.get_or_build(
            "question-bank-stats",
            30.0,
            lambda: list_items(
                app.state.session_factory, limit=1
            )["stats"],
        )

    @app.get("/api/question-bank/items")
    def question_bank_list(
        query: str = "",
        status: str = "",
        question_type: str = "",
        difficulty: str = "",
        tag: str = "",
        tags: Optional[List[str]] = Query(default=None),
        stale: Optional[bool] = None,
        include_deleted: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        return list_items(
            app.state.session_factory,
            query=query,
            status=status,
            question_type=question_type,
            difficulty=difficulty,
            tag=tag,
            tags=tags,
            stale=stale,
            include_deleted=include_deleted,
            limit=limit,
            offset=offset,
        )

    @app.get("/api/question-bank/tags")
    def question_bank_tag_suggestions(
        query: str = "",
        limit: int = 12,
    ) -> Dict[str, Any]:
        return tag_suggestions(
            app.state.session_factory,
            query=query,
            limit=limit,
        )

    @app.post("/api/question-bank/items")
    def question_bank_create(
        payload: Dict[str, Any], request: Request
    ) -> Dict[str, Any]:
        try:
            return create_item(
                app.state.session_factory,
                payload,
                actor=_actor(request, str(payload.get("created_by") or "")),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.post("/api/question-bank/ai-items")
    def question_bank_ai_create(
        payload: QuestionBankAICreateRequest,
        request: Request,
    ) -> Dict[str, Any]:
        try:
            return create_ai_item(
                app.state.session_factory,
                settings=runtime_settings(
                    app.state.settings, app.state.session_factory
                ),
                law_data_dir=app.state.data_dir,
                question=payload.question,
                actor=_actor(request),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.get("/api/question-bank/items/{item_id}")
    def question_bank_detail(item_id: int) -> Dict[str, Any]:
        item = get_item(app.state.session_factory, item_id)
        if item is None:
            raise HTTPException(status_code=404, detail="找不到題目。")
        return item

    @app.patch("/api/question-bank/items/{item_id}")
    def question_bank_update(
        item_id: int,
        payload: Dict[str, Any],
        request: Request,
    ) -> Dict[str, Any]:
        try:
            return update_item(
                app.state.session_factory,
                item_id,
                payload,
                actor=_actor(request, str(payload.get("created_by") or "")),
                change_note=str(payload.get("change_note") or ""),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.delete("/api/question-bank/items/{item_id}")
    def question_bank_delete(item_id: int, request: Request) -> Dict[str, Any]:
        deleted = delete_item(
            app.state.session_factory,
            item_id,
            actor=_actor(request),
        )
        if not deleted:
            raise HTTPException(status_code=404, detail="找不到題目。")
        return {"status": "deleted", "id": item_id}

    @app.post("/api/question-bank/items/{item_id}/submit")
    def question_bank_submit(item_id: int, request: Request) -> Dict[str, Any]:
        try:
            return submit_for_review(
                app.state.session_factory,
                item_id,
                actor=_actor(request),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.post("/api/question-bank/items/{item_id}/restore")
    def question_bank_restore(item_id: int) -> Dict[str, Any]:
        try:
            return restore_item(app.state.session_factory, item_id)
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.post("/api/question-bank/items/{item_id}/review")
    def question_bank_review(
        item_id: int,
        request_body: QuestionBankReviewRequest,
        request: Request,
    ) -> Dict[str, Any]:
        try:
            return review_item(
                app.state.session_factory,
                item_id,
                decision=request_body.decision,
                reviewer=_actor(request, request_body.reviewer),
                rubric_scores=request_body.rubric_scores,
                comment=request_body.comment,
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.post("/api/question-bank/import")
    def question_bank_import(
        payload: Dict[str, Any], request: Request
    ) -> Dict[str, Any]:
        try:
            return import_items(
                app.state.session_factory,
                payload,
                actor=_actor(request, str(payload.get("created_by") or "")),
                mode=str(payload.get("mode") or "upsert"),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.get("/api/question-bank/export")
    def question_bank_export(
        status: str = "accepted",
        include_deleted: bool = False,
    ) -> Dict[str, Any]:
        listing = list_items(
            app.state.session_factory,
            status=status,
            include_deleted=include_deleted,
            limit=200,
        )
        return {
            "version": 1,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "items": listing["items"],
        }

    @app.post("/api/question-bank/revalidate")
    def question_bank_revalidate() -> Dict[str, Any]:
        return revalidate_items(app.state.session_factory)

    @app.get("/api/question-bank/benchmark-ready")
    def question_bank_benchmark_ready(limit: int = 200) -> Dict[str, Any]:
        return {"items": benchmark_ready_items(app.state.session_factory, limit=limit)}

    @app.get("/api/benchmark/suites")
    def benchmark_suites() -> Dict[str, Any]:
        return {"suites": list_suites(app.state.session_factory)}

    @app.post("/api/benchmark/suites")
    def benchmark_suite_create(
        payload: Dict[str, Any], request: Request
    ) -> Dict[str, Any]:
        try:
            return create_suite(
                app.state.session_factory,
                name=str(payload.get("name") or ""),
                tier=str(payload.get("tier") or "core"),
                description=str(payload.get("description") or ""),
                item_ids=payload.get("item_ids") or [],
                actor=_actor(request, str(payload.get("created_by") or "")),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.get("/api/benchmark/suites/{suite_id}")
    def benchmark_suite_detail(suite_id: int) -> Dict[str, Any]:
        suite = get_suite(app.state.session_factory, suite_id)
        if suite is None:
            raise HTTPException(status_code=404, detail="找不到 benchmark 題庫。")
        return suite

    @app.get("/api/benchmark/suites/{suite_id}/latest-answers")
    def benchmark_suite_latest_answers(suite_id: int) -> Dict[str, Any]:
        suite = get_suite(app.state.session_factory, suite_id)
        if suite is None:
            raise HTTPException(status_code=404, detail="找不到 benchmark 題庫。")
        item_ids = [
            int(item["id"])
            for item in (suite.get("items") or [])
            if item.get("id") is not None
        ]
        return {
            "suite_id": suite_id,
            "answers": app.state.benchmark_manager.latest_successful_answers(
                item_ids
            ),
        }

    @app.delete("/api/benchmark/suites/{suite_id}/items/{item_id}")
    def benchmark_suite_item_delete(
        suite_id: int, item_id: int
    ) -> Dict[str, Any]:
        try:
            return remove_suite_item(
                app.state.session_factory, suite_id, item_id
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.patch("/api/benchmark/suites/{suite_id}")
    def benchmark_suite_update(
        suite_id: int, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            return update_suite(
                app.state.session_factory,
                suite_id,
                name=payload.get("name"),
                tier=payload.get("tier"),
                description=payload.get("description"),
                item_ids=payload.get("item_ids"),
                freeze=payload.get("freeze"),
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc

    @app.delete("/api/benchmark/suites/{suite_id}")
    def benchmark_suite_delete(suite_id: int) -> Dict[str, Any]:
        if not delete_suite(app.state.session_factory, suite_id):
            raise HTTPException(status_code=404, detail="找不到 benchmark 題庫。")
        return {"status": "deleted", "id": suite_id}

    @app.get("/api/benchmark/runs")
    def benchmark_run_list(limit: int = 20) -> Dict[str, Any]:
        return {"runs": app.state.benchmark_manager.list_runs(limit=limit)}

    @app.post("/api/benchmark/runs")
    def benchmark_run_start(request_body: BenchmarkRunRequest) -> Dict[str, Any]:
        try:
            return app.state.benchmark_manager.start_run(
                suite_id=request_body.suite_id,
                config=request_body.config,
                actor=request_body.actor,
            )
        except QuestionBankError as exc:
            raise _question_bank_error(exc) from exc
        except RuntimeError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc

    @app.get("/api/benchmark/runs/{run_id}")
    def benchmark_run_detail(
        run_id: str, include_cases: bool = True
    ) -> Dict[str, Any]:
        run = app.state.benchmark_manager.get_run(
            run_id, include_cases=include_cases
        )
        if run is None:
            raise HTTPException(status_code=404, detail="找不到 benchmark run。")
        return run

    @app.post("/api/benchmark/runs/{run_id}/stop")
    def benchmark_run_stop(run_id: str) -> Dict[str, Any]:
        try:
            return app.state.benchmark_manager.stop_run(run_id)
        except RuntimeError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    @app.get("/api/benchmark/fingerprints/{fingerprint}")
    def benchmark_fingerprint_history(
        fingerprint: str, limit: int = 50
    ) -> Dict[str, Any]:
        return {
            "fingerprint": fingerprint,
            "cases": app.state.benchmark_manager.fingerprint_history(
                fingerprint, limit=limit
            ),
        }

    @app.post("/api/benchmark/results/{result_id}/review")
    def benchmark_result_review(
        result_id: int,
        request_body: BenchmarkReviewRequest,
        request: Request,
    ) -> Dict[str, Any]:
        try:
            return app.state.benchmark_manager.review_case(
                result_id,
                reviewer=_actor(request, request_body.reviewer),
                scores=request_body.scores,
                comment=request_body.comment,
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

    @app.get("/api/benchmark/models")
    def benchmark_models() -> Dict[str, Any]:
        return {
            "models": available_test_models(
                settings, app.state.session_factory, refresh=False
            ),
            "index_version": active_version(
                app.state.session_factory,
                alias_name=settings.judgment_vector_alias,
            ),
        }

    @app.get("/api/catalog")
    def catalog(request: Request) -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="catalog",
            params={},
        ):
            payload = endpoint_cache.get_or_build(
                "catalog",
                60.0,
                lambda: build_catalog(
                    app.state.session_factory,
                    app.state.data_dir,
                    settings=settings,
                    judgment_law_list=settings.judgment_law_list,
                ),
            )
            if _is_demo_visitor(request):
                return sanitize_catalog_payload(payload)
            return payload

    @app.get("/api/judgment-stats")
    def judgment_stats() -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="judgment_stats",
            params={},
        ):
            return build_judgment_stats(
                app.state.session_factory,
                settings.judgment_data_dir,
            )

    @app.get("/api/test-mode")
    def test_mode_state() -> Dict[str, Any]:
        return {
            "enabled": get_test_mode(app.state.session_factory),
            "models": available_test_models(
                settings, app.state.session_factory, refresh=False
            ),
        }

    @app.post("/api/test-mode")
    def test_mode_update(request: TestModeRequest) -> Dict[str, Any]:
        set_test_mode(app.state.session_factory, request.enabled)
        return {
            "enabled": bool(request.enabled),
            "models": available_test_models(
                settings, app.state.session_factory, refresh=False
            ),
        }

    @app.get("/api/llm/models")
    def llm_models() -> Dict[str, Any]:
        return _llm_models_payload(
            app.state.session_factory,
            runtime_settings(
                app.state.settings, app.state.session_factory
            ),
            allowed_hosts=_ollama_allowed_hosts(),
        )

    @app.post("/api/llm/models/test")
    def llm_models_test() -> Dict[str, Any]:
        runtime = runtime_settings(
            app.state.settings, app.state.session_factory
        )
        refreshed_urls = set()
        for host in _ollama_host_list().get("hosts") or []:
            if host.get("status") != "operational":
                continue
            host_url = str(host.get("base_url") or "").rstrip("/")
            if not host_url or host_url in refreshed_urls:
                continue
            refreshed_urls.add(host_url)
            refresh_model_capabilities(
                app.state.session_factory,
                app.state.settings.with_overrides(
                    llm_url=host_url,
                    llm_api=str(host.get("api") or "ollama"),
                ),
            )
        runtime_url = str(runtime.llm_url or "").rstrip("/")
        if runtime_url and runtime_url not in refreshed_urls:
            refresh_model_capabilities(
                app.state.session_factory, runtime
            )
        return _llm_models_payload(
            app.state.session_factory,
            runtime,
            allowed_hosts=_ollama_allowed_hosts(),
        )

    @app.get("/api/rerank/status")
    def rerank_service_status() -> Dict[str, Any]:
        payload = rerank_status(
            runtime_settings(
                app.state.settings, app.state.session_factory
            )
        )
        payload["heartbeat"] = app.state.rerank_heartbeat
        return payload

    @app.post("/api/rerank/test")
    def rerank_service_probe() -> Dict[str, Any]:
        return rerank_service_test(
            runtime_settings(
                app.state.settings, app.state.session_factory
            )
        )

    @app.post("/api/llm/model")
    def llm_model_select(payload: LlmModelRequest) -> Dict[str, Any]:
        host = None
        if payload.host_id is not None:
            host = get_host(
                app.state.session_factory, int(payload.host_id)
            )
            if host is None:
                raise HTTPException(
                    status_code=404, detail="找不到 llama-server 主機。"
                )
            provider_settings = app.state.settings.with_overrides(
                llm_url=host["base_url"], llm_api="ollama"
            )
            state = _llm_models_payload(
                app.state.session_factory,
                provider_settings,
                allowed_hosts=_ollama_allowed_hosts(),
            )
            base_url = str(host["base_url"]).rstrip("/")
            provider_name = str(host.get("name") or state.get("provider_name") or "")
        else:
            runtime = runtime_settings(
                app.state.settings, app.state.session_factory
            )
            state = _llm_models_payload(
                app.state.session_factory,
                runtime,
                allowed_hosts=_ollama_allowed_hosts(),
            )
            base_url = str(state.get("base_url") or "").rstrip("/")
            provider_name = str(state.get("provider_name") or "")
        model = payload.model.strip()
        if model not in (state.get("chat_models") or []):
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "此模型不是所選 provider 已確認支援 chat 的模型。",
                    "errors": [
                        f"{model} 不在 chat_models；請先執行 LLM 服務測試。"
                    ],
                },
            )
        set_llm_model_preference(
            app.state.session_factory,
            model=model,
            base_url=base_url,
        )
        _sync_runtime_settings()
        current = runtime_settings(
            app.state.settings, app.state.session_factory
        )
        return {
            "status": "ok",
            "model": current.llm_model,
            "base_url": current.llm_url,
            "provider_name": provider_name,
            "host": host,
        }

    @app.get("/api/test-runs/current")
    def test_run_current() -> Dict[str, Any]:
        return {"run": get_latest_test_run(app.state.session_factory)}

    @app.get("/api/test-runs")
    def test_run_list(limit: int = 20) -> Dict[str, Any]:
        return {"runs": list_test_runs(app.state.session_factory, limit=limit)}

    @app.get("/api/test-runs/{run_id}")
    def test_run_detail(run_id: str) -> Dict[str, Any]:
        run = get_test_run(app.state.session_factory, run_id)
        if run is None:
            raise HTTPException(status_code=404, detail=f"找不到測試流程：{run_id}")
        return {"run": run}

    @app.post("/api/query")
    def query(request: QueryRequest, http_request: Request) -> Dict[str, Any]:
        demo_visitor = _is_demo_visitor(http_request)
        page = max(1, int(request.page))
        page_size = max(1, int(request.page_size))
        if demo_visitor:
            page_size = min(page_size, settings.demo_query_max_page_size)
            max_pages = max(
                1, settings.demo_query_max_total // max(1, page_size)
            )
            page = min(page, max_pages)

        def run() -> Dict[str, Any]:
            query_session_factory = app.state.session_factory
            if demo_visitor and request.database == "postgres":
                query_session_factory = (
                    app.state.demo_query_session_factory
                )
                if query_session_factory is None:
                    raise HTTPException(
                        status_code=403,
                        detail={
                            "message": "展示資料查詢未設定。",
                            "code": "demo_data_unavailable",
                        },
                    )
            return run_query(
                database=request.database,
                filters=request.filters,
                page=page,
                page_size=page_size,
                session_factory=query_session_factory,
                data_dir=app.state.data_dir,
                settings=runtime_settings(
                    app.state.settings, app.state.session_factory
                ),
                include_internal_columns=not demo_visitor,
            )

        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="query",
                params={
                    "database": request.database,
                    "page": page,
                    "page_size": page_size,
                    "filter_keys": sorted(request.filters),
                },
            ):
                if demo_visitor:
                    future = _DEMO_QUERY_EXECUTOR.submit(run)
                    try:
                        payload = future.result(
                            timeout=max(
                                1.0,
                                float(settings.demo_query_timeout_seconds),
                            )
                        )
                    except TimeoutError as exc:
                        raise HTTPException(
                            status_code=504,
                            detail="展示查詢超過 10 秒，已取消。",
                        ) from exc
                    return sanitize_query_payload(payload)
                return run()
        except HTTPException:
            raise
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"查詢失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.get("/api/data/suggest")
    def data_suggest(
        request: Request,
        kind: str,
        query: str = "",
        limit: int = 12,
    ) -> Dict[str, Any]:
        try:
            return data_suggestions(
                kind=kind,
                query=query,
                limit=limit,
                session_factory=_query_session_factory(request),
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/api/judgment")
    def judgment_detail(
        request: Request, jid: str, source: str = "postgres"
    ) -> Dict[str, Any]:
        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="judgment_detail",
                params={"jid": jid, "source": source},
            ):
                if source == "parquet":
                    return get_judgment_from_parquet(
                        settings.judgment_data_dir, jid
                    )
                if source not in {"", "postgres"}:
                    raise ValueError(f"不支援的判決來源：{source}")
                return get_judgment_detail(
                    session_factory=_query_session_factory(request),
                    jid=jid,
                    include_internal_fields=not _is_demo_visitor(request),
                )
        except HTTPException:
            raise
        except FileNotFoundError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"判決報表失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.get("/api/law")
    def law_detail(
        request: Request,
        law_key: str,
        source_type: Optional[str] = None,
        version_id: Optional[int] = None,
        article_no: Optional[str] = None,
    ) -> Dict[str, Any]:
        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="law_detail",
                params={
                    "law_key": law_key,
                    "source_type": source_type,
                    "version_id": version_id,
                    "article_no": article_no,
                },
            ):
                return get_law_detail(
                    session_factory=_query_session_factory(request),
                    data_dir=app.state.data_dir,
                    law_key=law_key,
                    source_type=source_type,
                    version_id=version_id,
                    article_no=article_no,
                )
        except HTTPException:
            raise
        except LookupError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"法規報表失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.get("/api/schema/suggest")
    def schema_suggest(
        request: Request,
        database: str,
        table: str,
        column: str,
        q: str = "",
        limit: int = 1000,
    ) -> Dict[str, Any]:
        demo_visitor = _is_demo_visitor(request)
        if demo_visitor and column in _DEMO_SCHEMA_BLOCKED_COLUMNS.get(
            table, frozenset()
        ):
            return {
                "status": "ok",
                "database": database,
                "table": table,
                "column": column,
                "query": q,
                "values": [],
                "total": 0,
                "truncated": False,
                "warnings": ["此欄位未開放展示。"],
                "duration_ms": 0,
            }
        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="schema_suggest",
                params={
                    "database": database,
                    "table": table,
                    "column": column,
                    "query_length": len(q or ""),
                },
            ):
                payload = schema_suggestions(
                    database=database,
                    table=table,
                    column=column,
                    query=q,
                    limit=limit,
                    session_factory=_query_session_factory(request),
                    data_dir=app.state.data_dir,
                    settings=settings,
                )
                if demo_visitor:
                    return sanitize_query_payload(payload)
                return payload
        except HTTPException:
            raise
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Schema 建議查詢失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.post("/api/performance/client")
    def performance_client_timing(request: ClientTimingRequest) -> Dict[str, Any]:
        updated = record_client_timing(
            app.state.session_factory,
            request_id=request.request_id,
            route=request.route,
            total_ms=request.total_ms,
            render_ms=request.render_ms,
            status=request.status,
        )
        return {"status": "ok" if updated else "ignored"}

    @app.get("/api/performance/options")
    def performance_filter_options() -> Dict[str, Any]:
        return endpoint_cache.get_or_build(
            "performance-options",
            120.0,
            lambda: performance_options(app.state.session_factory),
        )

    @app.get("/api/performance")
    def performance_records(
        request: Request,
        process: str = "",
        module: str = "",
        status: str = "",
        method: str = "",
        model: str = "",
        keyword: str = "",
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        min_duration: Optional[int] = None,
        page: int = 1,
        page_size: int = 25,
        sort: str = "started_at:desc",
    ) -> Dict[str, Any]:
        demo_visitor = _is_demo_visitor(request)
        safe_page = max(1, int(page))
        safe_page_size = max(1, int(page_size))
        if demo_visitor:
            safe_page_size = min(
                safe_page_size, settings.demo_query_max_page_size
            )
            max_pages = max(
                1,
                settings.demo_query_max_total // max(1, safe_page_size),
            )
            safe_page = min(safe_page, max_pages)
        filters = {
            "process": process,
            "module": module,
            "status": status,
            "method": method,
            "model": model,
            "keyword": keyword,
            "from_date": from_date,
            "to_date": to_date,
            "min_duration": min_duration,
            "sort": sort,
        }
        def fetch() -> Dict[str, Any]:
            return query_performance(
                session_factory=app.state.session_factory,
                filters=filters,
                page=safe_page,
                page_size=safe_page_size,
            )

        try:
            if demo_visitor:
                future = _DEMO_QUERY_EXECUTOR.submit(fetch)
                try:
                    payload = future.result(
                        timeout=max(
                            1.0,
                            float(settings.demo_query_timeout_seconds),
                        )
                    )
                except TimeoutError as exc:
                    raise HTTPException(
                        status_code=504,
                        detail="展示效能查詢超過 10 秒，已取消。",
                    ) from exc
            else:
                payload = fetch()
            if demo_visitor:
                return sanitize_performance_payload(payload)
            return payload
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"效能報表失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.post("/api/rag/share")
    def rag_share_create(request: RagShareRequest) -> JSONResponse:
        turns = _sanitize_rag_share_turns(request.turns)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(hours=_RAG_SHARE_TTL_HOURS)
        title = str(request.title or "").strip()[:200]
        token = ""
        with app.state.session_factory() as session:
            session.execute(
                delete(RagShareSnapshot).where(
                    RagShareSnapshot.expires_at < now
                )
            )
            for _ in range(5):
                candidate = secrets.token_urlsafe(16)
                if session.get(RagShareSnapshot, candidate) is None:
                    token = candidate
                    break
            if not token:
                raise HTTPException(
                    status_code=503,
                    detail="無法建立分享連結，請稍後再試。",
                )
            session.add(
                RagShareSnapshot(
                    token=token,
                    title=title,
                    turns=turns,
                    created_at=now,
                    expires_at=expires_at,
                )
            )
            session.commit()
        return JSONResponse(
            {
                "id": token,
                "expires_at": expires_at.isoformat(),
            },
            headers={"Cache-Control": "no-store"},
        )

    @app.get("/api/rag/share/{share_id}")
    def rag_share_get(share_id: str) -> JSONResponse:
        share_id = str(share_id or "").strip()
        if not share_id or len(share_id) > 64:
            raise HTTPException(status_code=404, detail="分享連結不存在。")
        now = datetime.now(timezone.utc)
        with app.state.session_factory() as session:
            row = session.get(RagShareSnapshot, share_id)
            if row is None or (_utc_aware(row.expires_at) or now) <= now:
                raise HTTPException(status_code=404, detail="分享連結不存在或已過期。")
            payload = {
                "id": row.token,
                "title": row.title or "",
                "turns": row.turns or [],
                "created_at": (
                    _utc_aware(row.created_at).isoformat()
                    if _utc_aware(row.created_at)
                    else None
                ),
                "expires_at": (
                    _utc_aware(row.expires_at).isoformat()
                    if _utc_aware(row.expires_at)
                    else None
                ),
            }
        return JSONResponse(payload, headers={"Cache-Control": "no-store"})

    @app.post("/api/rag/query")
    def rag_query(request: RagRequest, http_request: Request) -> Dict[str, Any]:
        demo_visitor = _is_demo_visitor(http_request)
        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="rag_query",
                params={"question_length": len(request.question)},
            ):
                result = answer_question(
                    session_factory=app.state.session_factory,
                    question=request.question,
                    settings=runtime_settings(
                        app.state.settings, app.state.session_factory
                    ),
                )
                flow = current_flow()
                if flow is not None:
                    flow.set_metadata("question", request.question)
                    flow.set_metadata("answer", result.get("answer") or "")
                    flow.set_metadata("rag_status", result.get("status") or "")
                    flow.set_metadata(
                        "rag_response", _rag_response_metadata(result)
                    )
                    flow.set_metadata(
                        "citation_retry", result.get("citation_retry")
                    )
                    flow.set_metadata(
                        "citation_audit", result.get("citation_audit")
                    )
                    if isinstance(result.get("test_run"), dict):
                        flow.set_metadata(
                            "test_run_id",
                            result["test_run"].get("run_id"),
                        )
                    result["pipeline_flow"] = _rag_pipeline_snapshot(
                        flow, app.state.session_factory
                    )
                if demo_visitor:
                    add_demo_usage(
                        app.state.session_factory,
                        requests=1,
                        tokens=estimate_rag_tokens(request.question, result),
                    )
                    return sanitize_rag_result(result)
                return result
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"RAG 問答失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.post("/api/rag/query/stream")
    async def rag_query_stream(
        request: RagRequest,
        http_request: Request,
    ) -> StreamingResponse:
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue()
        request_id = _incoming_request_id(http_request)
        client_started_at_ms = _client_started_ms(http_request)
        handler_started_perf = time.perf_counter()
        asgi_started_perf = _ASGI_STARTED.get()
        demo_visitor = _is_demo_visitor(http_request)

        def demo_event(payload: Dict[str, Any]) -> Dict[str, Any]:
            if not demo_visitor:
                return payload
            cleaned = sanitize_infrastructure(payload)
            return cleaned if isinstance(cleaned, dict) else payload

        def listener(event: Dict[str, Any]) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, ("step", demo_event(event)))

        def emit_partial(payload: Dict[str, Any]) -> None:
            loop.call_soon_threadsafe(
                queue.put_nowait, ("partial", demo_event(payload))
            )

        def demo_result(result: Dict[str, Any]) -> Dict[str, Any]:
            if not demo_visitor:
                return result
            add_demo_usage(
                app.state.session_factory,
                requests=1,
                tokens=estimate_rag_tokens(request.question, result),
            )
            return sanitize_rag_result(result)

        def emit_token(text: str) -> None:
            loop.call_soon_threadsafe(
                queue.put_nowait, ("token", {"text": str(text or "")})
            )

        def reset_token() -> None:
            loop.call_soon_threadsafe(queue.put_nowait, ("token_reset", {}))

        def run_query() -> None:
            flow = start_flow(
                request_id=request_id,
                entrypoint="/api/rag/query/stream",
                method="POST",
                path="/api/rag/query/stream",
                params={"question_length": len(request.question)},
                client_started_at_ms=client_started_at_ms,
                listener=listener,
            )
            started_at = flow.started_at
            status = "success"
            error_message = None
            result: Optional[Dict[str, Any]] = None
            try:
                result = answer_question(
                    session_factory=app.state.session_factory,
                    question=request.question,
                    settings=runtime_settings(
                        app.state.settings, app.state.session_factory
                    ),
                    on_partial=emit_partial,
                    on_token=emit_token,
                    on_token_reset=reset_token,
                )
                flow.set_metadata("question", request.question)
                flow.set_metadata("answer", result.get("answer") or "")
                flow.set_metadata("rag_status", result.get("status") or "")
                flow.set_metadata(
                    "rag_response", _rag_response_metadata(result)
                )
                if isinstance(result.get("test_run"), dict):
                    flow.set_metadata(
                        "test_run_id",
                        result["test_run"].get("run_id"),
                    )
            except Exception as exc:
                status = "failed"
                error_message = f"{exc.__class__.__name__}: {exc}"
            finally:
                flow.finish(status=status, error_message=error_message)
                duration_ms = int(
                    max(
                        0.0,
                        (
                            flow.finished_at or datetime.now(timezone.utc)
                        ).timestamp()
                        - started_at.timestamp(),
                    )
                    * 1000
                )
                record_performance(
                    app.state.session_factory,
                    process="RAG 問答",
                    module="judgment.rag.answer_question",
                    status=status,
                    started_at=started_at,
                    finished_at=flow.finished_at,
                    duration_ms=duration_ms,
                    method="POST",
                    path="/api/rag/query/stream",
                    request_id=request_id,
                    params={"question_length": len(request.question)},
                    flow=flow.to_dict(),
                    error_message=error_message,
                )
                if result is not None:
                    result["pipeline_flow"] = _rag_pipeline_snapshot(
                        flow, app.state.session_factory
                    )
                    result = demo_result(result)
                    loop.call_soon_threadsafe(queue.put_nowait, ("result", result))
                else:
                    loop.call_soon_threadsafe(
                        queue.put_nowait,
                        (
                            "error",
                            {
                                "message": (
                                    "RAG 流程失敗，請稍後再試。"
                                    if demo_visitor
                                    else error_message or "RAG 流程失敗。"
                                ),
                                "status": "failed",
                                "request_id": request_id,
                            },
                        ),
                    )

        async def run_query_two_phase() -> None:
            """Retrieval in an executor, then async LLM without a worker.

            The entry admission ticket is released as soon as retrieval
            finishes. Summary generation is protected by a separate LLM
            admission gate and does not occupy a retrieval worker.
            """

            flow = start_flow(
                request_id=request_id,
                entrypoint="/api/rag/query/stream",
                method="POST",
                path="/api/rag/query/stream",
                params={"question_length": len(request.question)},
                client_started_at_ms=client_started_at_ms,
                listener=listener,
            )
            started_at = flow.started_at
            started_perf = time.perf_counter()
            status = "success"
            error_message = None
            result: Optional[Dict[str, Any]] = None
            retrieval_ticket = None
            llm_ticket = None
            llm_started: Optional[float] = None
            try:
                live_settings = runtime_settings(
                    app.state.settings, app.state.session_factory
                )
                try:
                    retrieval_ticket = await app.state.rag_admission.acquire()
                except RagBusy as exc:
                    result = _busy_rag_result(exc, started_perf)
                    queue.put_nowait(
                        (
                            "degraded",
                            {
                                "type": "degraded",
                                "reason": "busy",
                                "position": exc.position,
                                "eta_s": round(exc.eta_s, 2),
                                "message": result["answer"],
                            },
                        )
                    )
                    return
                if retrieval_ticket.waited:
                    queue.put_nowait(
                        (
                            "queued",
                            {
                                "type": "queued",
                                "position": retrieval_ticket.position,
                                "eta_s": round(retrieval_ticket.eta_s, 2),
                                "queue_wait_ms": 0.0,
                            },
                        )
                    )
                retrieval_settings = replace(
                    live_settings,
                    llm_url="",
                    llm_model="",
                    llm_fallback_url="",
                    llm_fallback_model="",
                )
                context = contextvars.copy_context()
                retrieval_result = await loop.run_in_executor(
                    app.state.rag_executor,
                    lambda: context.run(
                        answer_question,
                        session_factory=app.state.session_factory,
                        question=request.question,
                        settings=retrieval_settings,
                        on_partial=emit_partial,
                        return_retrieval_state=True,
                    ),
                )
                await app.state.rag_admission.release(
                    elapsed_s=time.perf_counter() - started_perf
                )
                retrieval_ticket = None
                state = retrieval_result.pop("_retrieval_state", None) or {}
                queue.put_nowait(
                    (
                        "partial",
                        _retrieval_partial(
                            retrieval_result, state, started_perf
                        ),
                    )
                )

                llm_needed = bool(
                    state.get("contexts")
                    and retrieval_result.get("answer_source")
                    not in {"structured", "retrieval_list"}
                    and live_settings.llm_url
                    and live_settings.llm_model
                )
                if not llm_needed:
                    if state:
                        result = _retrieval_final_result(
                            retrieval_result,
                            state,
                            live_settings,
                            started_perf,
                            degraded_reason=(
                                None
                                if retrieval_result.get("answer_source")
                                in {"structured", "retrieval_list"}
                                else retrieval_result.get(
                                    "degraded_reason"
                                )
                            ),
                        )
                    else:
                        result = dict(retrieval_result)
                        result["duration_ms"] = round(
                            (time.perf_counter() - started_perf) * 1000,
                            1,
                        )
                        if result.get("answer_source") in {
                            "structured",
                            "retrieval_list",
                        }:
                            result["degraded_reason"] = None
                    return

                try:
                    llm_ticket = await app.state.llm_admission.acquire(
                        on_queued=lambda position, eta_s: queue.put_nowait(
                            (
                                "queued",
                                {
                                    "type": "queued",
                                    "lane": "summary",
                                    "position": position,
                                    "eta_s": round(eta_s, 2),
                                },
                            )
                        ),
                        wait_timeout_seconds=(
                            live_settings.rag_summary_wait_deadline_seconds
                        ),
                    )
                except RagBusy:
                    result = _retrieval_final_result(
                        retrieval_result,
                        state,
                        live_settings,
                        started_perf,
                        degraded_reason="llm_busy",
                        notice=(
                            "摘要服務忙碌，先顯示檢索結果；"
                            "請稍後再送出以取得 LLM 摘要。"
                        ),
                    )
                    queue.put_nowait(
                        (
                            "degraded",
                            {
                                "type": "degraded",
                                "reason": "llm_busy",
                                "message": result["notice"],
                            },
                        )
                    )
                    return

                llm_started = time.perf_counter()
                prompt_contexts, prompt_meta = (
                    _fit_contexts_to_prompt_budget(
                        settings=live_settings,
                        question=request.question,
                        contexts=state.get("contexts") or [],
                    )
                )
                allowed_indexes = {
                    int(context.get("index"))
                    for context in prompt_contexts
                    if context.get("index") is not None
                }
                for citation in state.get("citations") or []:
                    citation["used_for_generation"] = (
                        int(citation.get("index") or 0)
                        in allowed_indexes
                    )
                for source in state.get("law_sources") or []:
                    source["used_for_generation"] = (
                        int(source.get("index") or 0)
                        in allowed_indexes
                    )
                queue.put_nowait(
                    (
                        "partial",
                        {
                            "status": "streaming",
                            "answer": "",
                            "notice": (
                                "判決與法規來源已先顯示；"
                                "LLM 回答生成中，完成後會驗證引用編號。"
                            ),
                            "citations": [],
                            "judgments": state.get("citations") or [],
                            "law_sources": state.get("law_sources") or [],
                            "law_answer": state.get("law_answer") or "",
                            "law_framework": state.get("law_framework"),
                            "matched_terms": state.get("terms") or [],
                            "answer_source": "streaming",
                            "llm_model": live_settings.llm_model,
                            "embedding_model": (
                                live_settings.embedding_model or None
                            ),
                            "retrieval": {
                                **(state.get("retrieval") or {}),
                                "prompt_context": prompt_meta,
                            },
                            "coverage": state.get("coverage"),
                            "duration_ms": round(
                                (
                                    time.perf_counter() - started_perf
                                )
                                * 1000,
                                1,
                            ),
                            "partial": True,
                            "streaming": True,
                            "show_sources": True,
                            "rerank_degraded": bool(
                                retrieval_result.get("rerank_degraded")
                            ),
                        },
                    )
                )
                answer: Optional[str] = None
                last_error: Optional[Exception] = None
                citation_retry = False
                for strict in (False, True):
                    if strict:
                        citation_retry = True
                        queue.put_nowait(("token_reset", {}))
                    try:
                        candidate = (
                            await generate_answer_with_model_async(
                                settings=live_settings,
                                model=live_settings.llm_model,
                                question=request.question,
                                contexts=state.get("contexts") or [],
                                timeout=live_settings.llm_timeout_seconds,
                                strict=strict,
                                on_token=lambda text: queue.put_nowait(
                                    ("token", {"text": str(text or "")})
                                ),
                            )
                        )
                        if not _valid_citation_markers(
                            candidate,
                            int(state.get("citation_total") or 0),
                            allowed_indexes=allowed_indexes,
                        ):
                            raise CitationValidationError(
                                "LLM 回答缺少有效引用標記"
                            )
                        answer = candidate
                        break
                    except CitationValidationError as exc:
                        last_error = exc
                        if (
                            _citation_retry_action(
                                strict=strict, error=exc
                            )
                            == "stop"
                        ):
                            break
                    except Exception as exc:  # noqa: BLE001
                        last_error = exc
                        break
                if answer is not None:
                    result = _llm_final_result(
                        retrieval_result,
                        state,
                        live_settings,
                        answer,
                        prompt_meta,
                        allowed_indexes,
                        started_perf,
                        citation_retry=citation_retry,
                    )
                else:
                    result = _retrieval_final_result(
                        retrieval_result,
                        state,
                        live_settings,
                        started_perf,
                        degraded_reason=(
                            "citation_invalid"
                            if isinstance(
                                last_error, CitationValidationError
                            )
                            else "llm_error"
                        ),
                        notice=(
                            "LLM 無法產生可驗證的回答"
                            f"（{last_error.__class__.__name__ if last_error else 'Error'}: "
                            f"{last_error or '未知錯誤'}），"
                            "已改為只顯示檢索結果，不生成推測內容。"
                        ),
                    )
            except Exception as exc:
                status = "failed"
                error_message = f"{exc.__class__.__name__}: {exc}"
            finally:
                if llm_ticket is not None:
                    await app.state.llm_admission.release(
                        elapsed_s=(
                            time.perf_counter()
                            - (llm_started or time.perf_counter())
                        )
                    )
                if retrieval_ticket is not None:
                    await app.state.rag_admission.release(
                        elapsed_s=time.perf_counter() - started_perf
                    )
                flow.set_metadata("question", request.question)
                flow.set_metadata("answer", (result or {}).get("answer") or "")
                flow.set_metadata(
                    "rag_status", (result or {}).get("status") or ""
                )
                if asgi_started_perf is not None:
                    flow.set_metadata(
                        "asgi_to_handler_ms",
                        round(
                            (handler_started_perf - asgi_started_perf)
                            * 1000,
                            1,
                        ),
                    )
                    flow.set_metadata(
                        "asgi_to_flow_ms",
                        round(
                            (started_perf - asgi_started_perf) * 1000, 1
                        ),
                    )
                flow.set_metadata(
                    "handler_to_flow_ms",
                    round(
                        (started_perf - handler_started_perf) * 1000, 1
                    ),
                )
                if result is not None:
                    flow.set_metadata(
                        "rag_response", _rag_response_metadata(result)
                    )
                    flow.set_metadata(
                        "citation_retry", result.get("citation_retry")
                    )
                    flow.set_metadata(
                        "citation_audit", result.get("citation_audit")
                    )
                if isinstance((result or {}).get("test_run"), dict):
                    flow.set_metadata(
                        "test_run_id",
                        result["test_run"].get("run_id"),
                    )
                flow.finish(status=status, error_message=error_message)
                duration_ms = int(
                    max(
                        0.0,
                        (
                            flow.finished_at or datetime.now(timezone.utc)
                        ).timestamp()
                        - started_at.timestamp(),
                    )
                    * 1000
                )
                record_performance(
                    app.state.session_factory,
                    process="RAG 問答",
                    module="judgment.rag.answer_question",
                    status=status,
                    started_at=started_at,
                    finished_at=flow.finished_at,
                    duration_ms=duration_ms,
                    method="POST",
                    path="/api/rag/query/stream",
                    request_id=request_id,
                    params={"question_length": len(request.question)},
                    flow=flow.to_dict(),
                    error_message=error_message,
                )
                if result is not None:
                    result["pipeline_flow"] = _rag_pipeline_snapshot(
                        flow, app.state.session_factory
                    )
                    result = demo_result(result)
                    queue.put_nowait(("result", result))
                else:
                    queue.put_nowait(
                        (
                            "error",
                            {
                                "message": (
                                    "RAG 流程失敗，請稍後再試。"
                                    if demo_visitor
                                    else error_message or "RAG 流程失敗。"
                                ),
                                "status": "failed",
                                "request_id": request_id,
                            },
                        )
                    )

        def sse(event: str, payload: Dict[str, Any]) -> str:
            return (
                f"event: {event}\n"
                f"data: {json.dumps(payload, ensure_ascii=False, default=str)}\n\n"
            )

        async def event_stream():
            yield sse(
                "step",
                {
                    "type": "segment_start",
                    "segment": {
                        "seq": 0,
                        "parent_seq": None,
                        "depth": 0,
                        "name": "http.request",
                        "module": "judgment.web.app",
                        "function": "rag_query_stream",
                        "params": {"question_length": len(request.question)},
                        "started_at": datetime.now(timezone.utc).isoformat(),
                        "offset_ms": 0,
                        "duration_ms": 0,
                        "status": "running",
                        "error": None,
                    },
                },
            )
            task = asyncio.create_task(run_query_two_phase())
            try:
                while True:
                    kind, payload = await queue.get()
                    if kind in {
                        "step",
                        "partial",
                        "token",
                        "token_reset",
                        "queued",
                        "degraded",
                    }:
                        yield sse(kind, payload)
                    elif kind == "result":
                        yield sse("result", payload)
                        break
                    else:
                        yield sse("error", payload)
                        break
            finally:
                try:
                    await task
                except Exception:
                    logger.exception("RAG stream worker failed")

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    # Add CORS last so it is the outermost middleware.  Auth failures (401/403)
    # must still carry Access-Control-Allow-Origin, otherwise the browser hides
    # the response and the frontend shows "cannot connect to server".
    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(cors_origins),
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=[
                "Accept",
                "Content-Type",
                "Authorization",
                "X-Judgment-Request-Id",
                "X-Judgment-Client-Started-At",
                "X-Judgment-Admin-Token",
            ],
            expose_headers=["X-Judgment-Request-Id"],
            max_age=600,
        )

    @app.middleware("http")
    async def request_context_middleware(request: Request, call_next):
        request_id = _incoming_request_id(request)
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers.setdefault("X-Judgment-Request-Id", request_id)
        return response

    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault(
            "Referrer-Policy", "strict-origin-when-cross-origin"
        )
        response.headers.setdefault(
            "Permissions-Policy",
            "geolocation=(), microphone=(), camera=()",
        )
        response.headers.setdefault(
            "Content-Security-Policy", csp_policy
        )
        return response

    return app


app = create_app()


def main() -> int:
    base_settings = Settings.from_env()
    parser = argparse.ArgumentParser(
        description="啟動 Judgment RAG Console（FastAPI + Vanilla JS）"
    )
    parser.add_argument("--host", default="127.0.0.1", help="綁定位址")
    parser.add_argument("--port", type=int, default=9200, help="連接埠")
    parser.add_argument("--reload", action="store_true", help="開發模式自動重載")
    parser.add_argument(
        "--check-config",
        action="store_true",
        help="只驗證 production 設定與 route policy，不啟動服務",
    )
    parser.add_argument("--database-url", default=None, help="覆寫 DATABASE_URL")
    parser.add_argument("--data-dir", default=None, help="覆寫 LAW_DATA_DIR")
    parser.add_argument(
        "--forwarded-allow-ips",
        default=base_settings.forwarded_allow_ips,
        help="信任 X-Forwarded-* 的來源 IP（本機 tunnel 請用 127.0.0.1，不可用 *）",
    )
    args = parser.parse_args()
    if args.database_url:
        os.environ["DATABASE_URL"] = args.database_url
    if args.data_dir:
        os.environ["LAW_DATA_DIR"] = args.data_dir
    # Keep Settings and uvicorn on the same forwarded-IP value.
    os.environ["FORWARDED_ALLOW_IPS"] = args.forwarded_allow_ips

    try:
        validate_runtime_security(
            host=args.host,
            forwarded_allow_ips=args.forwarded_allow_ips,
            allow_local_admin_bypass=base_settings.allow_local_admin_bypass,
        )
    except RuntimeError as exc:
        if args.check_config:
            print(f"config check failed: {exc}", file=sys.stderr)
            return 1
        parser.error(str(exc))

    if args.check_config:
        try:
            check_settings = Settings.from_env()
            check_app = create_app(settings=check_settings)
            validate_route_policies(check_app.routes)
        except Exception as exc:
            print(
                f"config check failed: {exc.__class__.__name__}: {exc}",
                file=sys.stderr,
            )
            return 1
        print(
            "config check passed: "
            f"bind={args.host}:{args.port} "
            f"forwarded_allow_ips={args.forwarded_allow_ips} "
            f"local_bypass={base_settings.allow_local_admin_bypass} "
            f"public_rag={check_settings.public_rag_enabled} "
            f"routes={len(check_app.routes)}"
        )
        return 0

    power_agent_disabled = os.getenv("JUDGMENT_POWER_AGENT", "1").strip().lower() in {
        "0",
        "false",
        "no",
        "off",
    }
    if not power_agent_disabled and not ensure_power_agent(
        backend_host=args.host,
        backend_port=args.port,
        data_dir=args.data_dir,
        database_url=args.database_url,
        parent_pid=os.getpid(),
    ):
        print(
            "警告：無法啟動本機電源控制器（127.0.0.1:9201）。"
            "本機電源 API 可能無法使用，但不影響系統測試頁的 API 與模型測試。",
            file=sys.stderr,
        )

    if args.reload:
        uvicorn.run(
            "judgment.web.app:app",
            host=args.host,
            port=args.port,
            reload=True,
            log_level="info",
            proxy_headers=True,
            forwarded_allow_ips=args.forwarded_allow_ips,
        )
    else:
        uvicorn.run(
            create_app(settings=Settings.from_env()),
            host=args.host,
            port=args.port,
            log_level="info",
            proxy_headers=True,
            forwarded_allow_ips=args.forwarded_allow_ips,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
