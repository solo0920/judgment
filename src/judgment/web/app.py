from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Literal, Optional
from uuid import uuid4

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .. import __version__
from ..config import Settings
from ..db import build_engine, build_session_factory, init_db
from ..observability import (
    clear_flow,
    current_flow,
    record_client_timing,
    record_performance,
    start_flow,
    trace_segment,
)
from ..judgment_parquet import get_judgment_from_parquet
from ..performance_test import (
    available_test_models,
    get_latest_test_run,
    get_test_run,
    list_test_runs,
)
from ..rag import answer_question
from ..vector_store import QdrantStore
from ..index_versions import (
    activate_version,
    get_version,
    list_versions,
    reconcile_alias,
    rollback_version,
    validate_version,
)
from ..runtime_settings import get_test_mode, set_test_mode
from .catalog import build_catalog
from .performance import performance_options, query_performance
from .power_agent import ensure_power_agent
from .processing import (
    ProcessingManager,
    build_processing_plan,
    build_processing_snapshot,
)
from .quality import build_quality_snapshot
from .query import (
    get_judgment_detail,
    get_law_detail,
    run_query,
    schema_suggestions,
)
from .status import build_status
from .system_usage import build_system_usage

logger = logging.getLogger(__name__)

STATIC_DIR = Path(__file__).parent / "static"


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


class ProcessingUpdateRequest(BaseModel):
    index: bool = False


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
}


def _performance_target(path: str) -> tuple[str, str]:
    if path in PERFORMANCE_TARGETS:
        return PERFORMANCE_TARGETS[path]
    return (path, f"http{path}")


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
        try:
            yield
        finally:
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

    if settings.cors_allow_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(settings.cors_allow_origins),
            allow_credentials=False,
            allow_methods=["GET", "POST", "OPTIONS"],
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
            or path.startswith("/api/quality")
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
                settings=settings,
            )

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

    @app.post("/api/processing/stop")
    def processing_stop() -> Dict[str, Any]:
        try:
            return app.state.processing_manager.stop_update()
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc)) from exc

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
            "models": available_test_models(settings),
        }

    @app.post("/api/test-mode")
    def test_mode_update(request: TestModeRequest) -> Dict[str, Any]:
        set_test_mode(app.state.session_factory, request.enabled)
        return {
            "enabled": bool(request.enabled),
            "models": available_test_models(settings),
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
                    settings=settings,
                )
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"查詢失敗：{exc.__class__.__name__}: {exc}",
            ) from exc

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
                    settings=settings,
                )
                flow = current_flow()
                if flow is not None:
                    flow.set_metadata("question", request.question)
                    flow.set_metadata("answer", result.get("answer") or "")
                    flow.set_metadata("rag_status", result.get("status") or "")
                    if isinstance(result.get("test_run"), dict):
                        flow.set_metadata(
                            "test_run_id",
                            result["test_run"].get("run_id"),
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
                    settings=settings,
                    on_partial=emit_partial,
                    on_token=emit_token,
                    on_token_reset=reset_token,
                )
                flow.set_metadata("question", request.question)
                flow.set_metadata("answer", result.get("answer") or "")
                flow.set_metadata("rag_status", result.get("status") or "")
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
