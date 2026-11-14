from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
import threading
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Literal, Optional
from urllib.parse import urlparse
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

from .. import __version__
from ..config import Settings
from ..court_normalize import check_court_normalization
from ..db import build_engine, build_session_factory, init_db
from ..law_article_versions import check_law_version_status
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
from ..rag import answer_question
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
    get_test_mode,
    set_llm_model_preference,
    set_test_mode,
)
from .catalog import build_catalog
from .performance import performance_options, query_performance
from .power_agent import ensure_power_agent
from .events import build_event_broker
from .processing_events import ProcessingEventServer
from .processing import (
    ProcessingManager,
    active_import_event_stream,
    build_active_import,
    build_processing_bootstrap,
    build_processing_live,
    build_processing_plan,
    build_processing_snapshot,
)
from .quality import build_quality_snapshot
from .query import (
    data_suggestions,
    get_judgment_detail,
    get_law_detail,
    run_query,
    schema_suggestions,
)
from .status import build_status
from .system_usage import build_system_usage

logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).parent / "static"

# Manual judgment downloads stream a whole archive through the backend. Keep a
# single active proxy download so opening several month links does not hammer
# the official server; the batch workflow is already sequential.
_JUDGMENT_DOWNLOAD_LOCK = threading.Lock()
_UPDATE_CHECK_LOCK = threading.Lock()


class QueryRequest(BaseModel):
    database: Literal["postgres", "parquet", "qdrant", "indexeddb"] = "postgres"
    filters: Dict[str, Any] = Field(default_factory=dict)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=200)


class RagRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


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
    port: int = Field(default=11434, ge=1, le=65535)


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


PERFORMANCE_TARGETS = {
    "/api/status": ("服務狀態", "judgment.web.status.build_status"),
    "/api/system-usage": ("系統資源使用", "judgment.web.system_usage.build_system_usage"),
    "/api/index-versions": ("索引版本", "judgment.web.app.index_versions"),
    "/api/catalog": ("資料庫 catalog", "judgment.web.catalog.build_catalog"),
    "/api/query": ("資料查詢", "judgment.web.query.run_query"),
    "/api/law": ("法規明細", "judgment.web.query.get_law_detail"),
    "/api/judgment": ("判決原文", "judgment.web.query.get_judgment_detail"),
    "/api/rag/query": ("RAG 問答", "judgment.rag.answer_question"),
    "/api/rag/query/stream": ("RAG 問答", "judgment.rag.answer_question"),
}


def _performance_target(path: str) -> tuple[str, str]:
    if path in PERFORMANCE_TARGETS:
        return PERFORMANCE_TARGETS[path]
    return (path, f"http{path}")


def _rag_response_metadata(result: Dict[str, Any]) -> Dict[str, Any]:
    judgments = result.get("judgments") or []
    law_sources = result.get("law_sources") or []
    status = str(result.get("status") or "")
    return {
        "status": status,
        "answer_source": result.get("answer_source") or "",
        "citation_count": len(judgments) + len(law_sources),
        "judgment_citations": len(judgments),
        "law_citations": len(law_sources),
        "abstain": status not in {"operational"},
        "duration_ms": result.get("duration_ms"),
        "llm_model": result.get("llm_model"),
        "embedding_model": result.get("embedding_model"),
        "has_answer": bool(str(result.get("answer") or "").strip()),
    }


_RAG_PIPELINE_SEGMENTS = {
    "rag.parse_question",
    "rag.embed_query",
    "rag.qdrant_search",
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


def _llm_models_payload(session_factory, settings: Settings) -> Dict[str, Any]:
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
    for item in list_hosts(session_factory).get("hosts") or []:
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
        for key in ("rag_response", "rag_status")
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
    resolved_data_dir = Path(data_dir or settings.law_data_dir).expanduser().resolve()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        engine = None
        if app.state.session_factory is None:
            engine = build_engine(settings.database_url)
            if settings.auto_create_schema:
                init_db(engine)
            app.state.engine = engine
            app.state.session_factory = build_session_factory(engine)
            app.state.benchmark_manager.session_factory = app.state.session_factory
            app.state.benchmark_manager.settings = runtime_settings(
                app.state.settings, app.state.session_factory
            )
            try:
                revalidated = revalidate_items(app.state.session_factory)
                if revalidated.get("stale"):
                    logger.info(
                        "question bank revalidation marked %s stale items",
                        revalidated["stale"],
                    )
            except Exception:
                logger.warning("question bank startup revalidation failed", exc_info=True)
        warm_task: Optional[asyncio.Task] = None

        async def warm_processing_snapshots() -> None:
            while True:
                await asyncio.sleep(30)
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

        try:
            await app.state.processing_event_server.start()
            warm_task = asyncio.create_task(warm_processing_snapshots())
            yield
        finally:
            if warm_task is not None:
                warm_task.cancel()
                try:
                    await warm_task
                except asyncio.CancelledError:
                    pass
            await app.state.processing_event_server.stop()
            await app.state.event_broker.close()
            if engine is not None:
                engine.dispose()

    app = FastAPI(
        title="Judgment RAG Console",
        version=__version__,
        description="法規資料瀏覽、查詢報表與服務狀態 API",
        docs_url="/api/docs",
        redoc_url=None,
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.data_dir = resolved_data_dir
    app.state.session_factory = session_factory
    app.state.engine = None
    app.state.processing_manager = ProcessingManager(
        settings=settings,
        session_factory=session_factory,
    )
    app.state.benchmark_manager = BenchmarkManager(
        settings=settings,
        session_factory=session_factory,
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
        updates_payload_provider=lambda: update_status(
            app.state.session_factory
        ),
        status_payload_provider=lambda: build_status(
            session_factory=app.state.session_factory,
            data_dir=app.state.data_dir,
            settings=runtime_settings(
                app.state.settings, app.state.session_factory
            ),
        ),
        judgment_download_payload_provider=lambda: download_status(
            app.state.settings
        ),
        system_usage_payload_provider=lambda: build_system_usage(
            session_factory=app.state.session_factory,
            data_dir=app.state.data_dir,
            settings=app.state.settings,
        ),
        ollama_payload_provider=lambda: list_hosts(
            app.state.session_factory
        ),
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

    if settings.cors_allow_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.cors_allow_origins),
            allow_credentials=False,
            allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=["*"],
            max_age=600,
        )

    @app.middleware("http")
    async def performance_middleware(request: Request, call_next):
        path = request.url.path
        skipped = (
            not path.startswith("/api/")
            or path.startswith("/api/performance")
            or path.startswith("/api/processing")
            or path.startswith("/api/events")
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

        started_at = datetime.now(timezone.utc)
        started = time.perf_counter()
        request_id = _incoming_request_id(request)
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

    @app.get("/api/health")
    def health() -> Dict[str, Any]:
        return {"status": "ok", "version": __version__}

    @app.get("/api/status")
    def status() -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="status",
            params={},
        ):
            return build_status(
                session_factory=app.state.session_factory,
                data_dir=app.state.data_dir,
                settings=runtime_settings(
                    app.state.settings, app.state.session_factory
                ),
            )

    @app.get("/api/ollama/hosts")
    def ollama_hosts() -> Dict[str, Any]:
        return list_hosts(app.state.session_factory)

    @app.post("/api/ollama/hosts")
    def ollama_host_create(payload: OllamaHostRequest) -> Dict[str, Any]:
        try:
            host = add_host(
                app.state.session_factory,
                name=payload.name,
                url=payload.url,
                port=payload.port,
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.patch("/api/ollama/hosts/{host_id}")
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
            )
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.delete("/api/ollama/hosts/{host_id}")
    def ollama_host_delete(host_id: int) -> Dict[str, Any]:
        if not delete_host(app.state.session_factory, host_id):
            raise HTTPException(status_code=404, detail="找不到 Ollama 主機。")
        _sync_runtime_settings()
        return {"status": "deleted", "id": host_id}

    @app.post("/api/ollama/hosts/{host_id}/activate")
    def ollama_host_activate(host_id: int) -> Dict[str, Any]:
        try:
            host = activate_host(app.state.session_factory, host_id)
            _sync_runtime_settings()
            return host
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.post("/api/ollama/hosts/deactivate")
    def ollama_host_deactivate() -> Dict[str, Any]:
        result = deactivate_hosts(app.state.session_factory)
        _sync_runtime_settings()
        return result

    @app.post("/api/ollama/hosts/capabilities/test")
    def ollama_host_capabilities_test() -> Dict[str, Any]:
        refreshed_urls = set()
        for host in list_hosts(app.state.session_factory).get("hosts") or []:
            if host.get("status") != "operational":
                continue
            host_url = str(host.get("base_url") or "").rstrip("/")
            if not host_url or host_url in refreshed_urls:
                continue
            refreshed_urls.add(host_url)
            refresh_model_capabilities(
                app.state.session_factory,
                app.state.settings.with_overrides(llm_url=host_url),
            )
        return list_hosts(app.state.session_factory)

    @app.post("/api/ollama/hosts/reorder")
    def ollama_host_reorder(payload: OllamaHostOrderRequest) -> Dict[str, Any]:
        try:
            result = reorder_hosts(
                app.state.session_factory, payload.host_ids
            )
            _sync_runtime_settings()
            return result
        except OllamaHostError as exc:
            raise _ollama_host_error(exc) from exc

    @app.post("/api/ollama/hosts/{host_id}/models/select")
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

    @app.post("/api/ollama/hosts/{host_id}/models/clear")
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

    @app.get("/api/index-alias/reconcile")
    def index_version_reconcile(repair: bool = False) -> Dict[str, Any]:
        store = QdrantStore(settings.qdrant_url, api_key=settings.qdrant_api_key)
        try:
            return reconcile_alias(
                app.state.session_factory,
                store=store,
                alias_name=settings.judgment_vector_alias,
                repair=repair,
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"索引狀態檢查失敗：{exc}") from exc

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
    def processing_snapshot() -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="processing_snapshot",
            params={},
        ):
            return build_processing_snapshot(
                settings=settings,
                session_factory=app.state.session_factory,
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
        return update_status(app.state.session_factory)

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
                **update_status(app.state.session_factory),
                "checking": True,
            }
        try:
            check_all_sources(
                settings=app.state.settings,
                session_factory=app.state.session_factory,
                source_types=source_types or None,
            )
            return update_status(app.state.session_factory)
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
    def quality_snapshot() -> Dict[str, Any]:
        try:
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
        header = str(request.headers.get("X-Judgment-Actor") or "").strip()
        return (header or fallback or "anonymous")[:120]

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

    @app.get("/api/question-bank/stats")
    def question_bank_summary() -> Dict[str, Any]:
        listing = list_items(app.state.session_factory, limit=1)
        return listing["stats"]

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
    def catalog() -> Dict[str, Any]:
        with trace_segment(
            "api.endpoint",
            module=__name__,
            function="catalog",
            params={},
        ):
            return build_catalog(
                app.state.session_factory,
                app.state.data_dir,
                settings=settings,
                judgment_law_list=settings.judgment_law_list,
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
        )

    @app.post("/api/llm/models/test")
    def llm_models_test() -> Dict[str, Any]:
        runtime = runtime_settings(
            app.state.settings, app.state.session_factory
        )
        refreshed_urls = set()
        for host in list_hosts(app.state.session_factory).get("hosts") or []:
            if host.get("status") != "operational":
                continue
            host_url = str(host.get("base_url") or "").rstrip("/")
            if not host_url or host_url in refreshed_urls:
                continue
            refreshed_urls.add(host_url)
            refresh_model_capabilities(
                app.state.session_factory,
                app.state.settings.with_overrides(llm_url=host_url),
            )
        runtime_url = str(runtime.llm_url or "").rstrip("/")
        if runtime_url and runtime_url not in refreshed_urls:
            refresh_model_capabilities(
                app.state.session_factory, runtime
            )
        return _llm_models_payload(
            app.state.session_factory, runtime
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
                    status_code=404, detail="找不到 Ollama 主機。"
                )
            provider_settings = app.state.settings.with_overrides(
                llm_url=host["base_url"]
            )
            state = _llm_models_payload(
                app.state.session_factory, provider_settings
            )
            base_url = str(host["base_url"]).rstrip("/")
            provider_name = str(host.get("name") or state.get("provider_name") or "")
        else:
            runtime = runtime_settings(
                app.state.settings, app.state.session_factory
            )
            state = _llm_models_payload(
                app.state.session_factory, runtime
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
    def query(request: QueryRequest) -> Dict[str, Any]:
        try:
            with trace_segment(
                "api.endpoint",
                module=__name__,
                function="query",
                params={
                    "database": request.database,
                    "page": request.page,
                    "page_size": request.page_size,
                    "filter_keys": sorted(request.filters),
                },
            ):
                return run_query(
                    database=request.database,
                    filters=request.filters,
                    page=request.page,
                    page_size=request.page_size,
                    session_factory=app.state.session_factory,
                    data_dir=app.state.data_dir,
                    settings=runtime_settings(
                        app.state.settings, app.state.session_factory
                    ),
                )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"查詢失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.get("/api/data/suggest")
    def data_suggest(
        kind: str,
        query: str = "",
        limit: int = 12,
    ) -> Dict[str, Any]:
        try:
            return data_suggestions(
                kind=kind,
                query=query,
                limit=limit,
                session_factory=app.state.session_factory,
            )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/api/judgment")
    def judgment_detail(jid: str, source: str = "postgres") -> Dict[str, Any]:
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
                    session_factory=app.state.session_factory,
                    jid=jid,
                )
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
                    session_factory=app.state.session_factory,
                    data_dir=app.state.data_dir,
                    law_key=law_key,
                    source_type=source_type,
                    version_id=version_id,
                    article_no=article_no,
                )
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
        database: str,
        table: str,
        column: str,
        q: str = "",
        limit: int = 1000,
    ) -> Dict[str, Any]:
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
                return schema_suggestions(
                    database=database,
                    table=table,
                    column=column,
                    query=q,
                    limit=limit,
                    session_factory=app.state.session_factory,
                    data_dir=app.state.data_dir,
                    settings=settings,
                )
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
        return performance_options(app.state.session_factory)

    @app.get("/api/performance")
    def performance_records(
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
        try:
            return query_performance(
                session_factory=app.state.session_factory,
                filters=filters,
                page=page,
                page_size=page_size,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"效能報表失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

    @app.post("/api/rag/query")
    def rag_query(request: RagRequest) -> Dict[str, Any]:
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
                    if isinstance(result.get("test_run"), dict):
                        flow.set_metadata(
                            "test_run_id",
                            result["test_run"].get("run_id"),
                        )
                    result["pipeline_flow"] = _rag_pipeline_snapshot(
                        flow, app.state.session_factory
                    )
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

        def listener(event: Dict[str, Any]) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, ("step", event))

        def emit_partial(payload: Dict[str, Any]) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, ("partial", payload))

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
                    loop.call_soon_threadsafe(queue.put_nowait, ("result", result))
                else:
                    loop.call_soon_threadsafe(
                        queue.put_nowait,
                        (
                            "error",
                            {
                                "message": error_message or "RAG 流程失敗。",
                                "status": "failed",
                            },
                        ),
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
            task = asyncio.create_task(asyncio.to_thread(run_query))
            try:
                while True:
                    kind, payload = await queue.get()
                    if kind == "step":
                        yield sse("step", payload)
                    elif kind == "partial":
                        yield sse("partial", payload)
                    elif kind == "token":
                        yield sse("token", payload)
                    elif kind == "token_reset":
                        yield sse("token_reset", payload)
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
    parser.add_argument("--database-url", default=None, help="覆寫 DATABASE_URL")
    parser.add_argument("--data-dir", default=None, help="覆寫 LAW_DATA_DIR")
    parser.add_argument(
        "--forwarded-allow-ips",
        default=base_settings.forwarded_allow_ips,
        help="信任 X-Forwarded-* 的來源 IP（cloudflared 反向代理預設為 *）",
    )
    args = parser.parse_args()

    if args.database_url:
        os.environ["DATABASE_URL"] = args.database_url
    if args.data_dir:
        os.environ["LAW_DATA_DIR"] = args.data_dir

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
