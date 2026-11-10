from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .embeddings import OllamaEmbedder, ollama_models_detail
from .law_rag import law_source_text
from .llm_capabilities import (
    model_capability_status,
    refresh_model_capabilities,
)
from .models import PerformanceTestRun, PerformanceTestStep
from .rag import (
    _build_citations,
    _fetch_documents,
    _retrieval_answer,
    _valid_citation_markers,
    generate_answer_with_model,
)
from .vector_store import QdrantStore

STAGE_ORDER = ("embedding", "retrieval", "context", "llm", "validation")
STAGE_LABELS = {
    "embedding": "Embedding",
    "retrieval": "Qdrant 檢索",
    "context": "PostgreSQL 取文",
    "llm": "LLM 生成",
    "validation": "引用驗證",
}
STEP_LOCATIONS = {
    "embedding": ("judgment.embeddings", "OllamaEmbedder.embed_query"),
    "retrieval": ("judgment.vector_store", "QdrantStore.search"),
    "context": ("judgment.rag", "_fetch_documents / _build_citations"),
    "llm": ("judgment.rag", "generate_answer_with_model"),
    "validation": ("judgment.rag", "_valid_citation_markers"),
}
EMBEDDING_HINTS = (
    "embed",
    "bge-m3",
    "bge_m3",
    "e5-",
    "nomic",
    "gte-",
    "jina",
    "snowflake",
    "mxbai",
)
RERANK_HINTS = ("rerank", "reranker")


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _base_model_name(name: str) -> str:
    value = str(name or "").strip().lower()
    return value[:-7] if value.endswith(":latest") else value


def _dedupe_model_names(names: Sequence[str]) -> List[str]:
    result: List[str] = []
    seen = set()
    for name in names:
        value = str(name or "").strip()
        if not value:
            continue
        key = _base_model_name(value)
        if key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def _is_reranker(name: str) -> bool:
    lowered = name.lower()
    return any(hint in lowered for hint in RERANK_HINTS)


def _is_embedding(name: str) -> bool:
    lowered = name.lower()
    return any(hint in lowered for hint in EMBEDDING_HINTS) and not _is_reranker(name)


def available_test_models(
    settings: Settings,
    session_factory: Optional[sessionmaker[Session]] = None,
    *,
    refresh: bool = True,
) -> Dict[str, Any]:
    """Return embedding/LLM candidates from Ollama, with configured fallbacks.

    When a session factory is supplied, chat capabilities are read from the
    service-test cache and only chat-capable LLMs are exposed. With
    ``refresh=True`` (used before evaluation runs) new Ollama models are probed
    first; read-only pages use ``refresh=False`` to avoid probing on page load.
    """
    llm_base_url = str(settings.llm_url or settings.embedding_url or "").rstrip("/")
    embedding_base_url = str(
        settings.embedding_url or settings.llm_url or ""
    ).rstrip("/")
    capability: Optional[Dict[str, Any]] = None
    if session_factory is not None:
        capability = (
            refresh_model_capabilities(session_factory, settings)
            if refresh
            else model_capability_status(session_factory, settings)
        )
        llm_available = _dedupe_model_names(
            [str(item) for item in (capability.get("available") or [])]
        )
        embedding_available = llm_available
        if embedding_base_url and embedding_base_url != llm_base_url:
            embedding_detail = ollama_models_detail(embedding_base_url)
            embedding_available = _dedupe_model_names(
                [
                    str(item)
                    for item in (embedding_detail.get("models") or [])
                    if str(item).strip()
                ]
            )
        ollama_status = capability.get("status")
        ollama_detail = capability.get("detail")
    else:
        detail = (
            ollama_models_detail(embedding_base_url)
            if embedding_base_url
            else {
                "status": "not_configured",
                "models": [],
                "detail": "未設定 Ollama URL",
            }
        )
        llm_available = _dedupe_model_names(
            [str(item) for item in (detail.get("models") or []) if str(item).strip()]
        )
        embedding_available = llm_available
        ollama_status = detail.get("status")
        ollama_detail = detail.get("detail")

    available = _dedupe_model_names(llm_available + embedding_available)
    embedding_models = [
        name
        for name in embedding_available
        if _is_embedding(name) and not _is_reranker(name)
    ]
    discovered_llm = [
        name
        for name in llm_available
        if name not in embedding_models and not _is_reranker(name)
    ]

    if settings.test_embedding_models:
        embedding_models = _dedupe_model_names(settings.test_embedding_models)
    elif settings.embedding_model:
        embedding_models = _dedupe_model_names(
            [settings.embedding_model] + embedding_models
        )

    if settings.test_llm_models:
        llm_models = _dedupe_model_names(settings.test_llm_models)
    elif settings.llm_model:
        llm_models = _dedupe_model_names([settings.llm_model] + discovered_llm)
    else:
        llm_models = discovered_llm

    embedding_keys = {_base_model_name(name) for name in embedding_models}
    llm_models = [
        name for name in llm_models if _base_model_name(name) not in embedding_keys
    ]
    if capability is not None:
        chat_models = set(capability.get("chat_models") or [])
        llm_models = [name for name in llm_models if name in chat_models]

    payload = {
        "embedding": embedding_models,
        "llm": llm_models,
        "available": available,
        "ollama_status": ollama_status,
        "ollama_detail": ollama_detail,
        "source": "overrides"
        if (settings.test_embedding_models or settings.test_llm_models)
        else ("ollama" if available else "configured"),
    }
    if capability is not None:
        payload["capability"] = {
            "tested_now": list(capability.get("tested_now") or []),
            "new_models": list(capability.get("new_models") or []),
            "failures": list(capability.get("failures") or []),
        }
    return payload


def _step_rows(
    session_factory: sessionmaker[Session],
    run_id: str,
) -> List[PerformanceTestStep]:
    with session_factory() as session:
        return list(
            session.scalars(
                select(PerformanceTestStep)
                .where(PerformanceTestStep.run_id == run_id)
                .order_by(PerformanceTestStep.id.asc())
            ).all()
        )


def _refresh_run_progress(
    session_factory: sessionmaker[Session],
    run_id: str,
) -> None:
    with session_factory() as session:
        run = session.scalars(
            select(PerformanceTestRun).where(PerformanceTestRun.run_id == run_id)
        ).first()
        if run is None:
            return
        steps = session.scalars(
            select(PerformanceTestStep).where(PerformanceTestStep.run_id == run_id)
        ).all()
        if steps:
            total = len(steps)
            progress = int(
                round(sum(int(step.progress or 0) for step in steps) / total)
            )
            running = [step for step in steps if step.status == "running"]
            if running:
                run.stage = running[-1].stage
            else:
                terminal = [step for step in steps if step.status != "pending"]
                if terminal:
                    run.stage = terminal[-1].stage
            run.progress = max(0, min(100, progress))
        session.commit()


def _mark_step(
    session_factory: sessionmaker[Session],
    run_id: str,
    step_id: int,
    *,
    status: str,
    progress: int,
    details: Optional[Dict[str, Any]] = None,
    error_message: Optional[str] = None,
    started_at: Optional[datetime] = None,
    finished_at: Optional[datetime] = None,
    duration_ms: Optional[int] = None,
) -> None:
    with session_factory() as session:
        step = session.get(PerformanceTestStep, step_id)
        if step is None:
            return
        step.status = status[:16]
        step.progress = max(0, min(100, int(progress)))
        if started_at is not None:
            step.started_at = started_at
        if finished_at is not None:
            step.finished_at = finished_at
        if duration_ms is not None:
            step.duration_ms = max(0, int(duration_ms))
        if details is not None:
            step.details = details
        if error_message is not None:
            step.error_message = str(error_message)[:4000]
        session.commit()
    _refresh_run_progress(session_factory, run_id)


def _create_test_run(
    session_factory: sessionmaker[Session],
    *,
    question: str,
    request_id: str,
    models: Dict[str, Any],
) -> Tuple[str, Dict[Tuple[str, str], int], int]:
    run_id = uuid4().hex
    now = datetime.now(timezone.utc)
    step_defs: List[Tuple[str, str]] = []
    for model in models.get("embedding") or []:
        step_defs.append(("embedding", str(model)))
        step_defs.append(("retrieval", str(model)))
    step_defs.append(("context", "PostgreSQL"))
    for model in models.get("llm") or []:
        step_defs.append(("llm", str(model)))
        step_defs.append(("validation", str(model)))

    with session_factory() as session:
        run = PerformanceTestRun(
            run_id=run_id,
            request_id=str(request_id or "")[:64],
            question=str(question or ""),
            status="running",
            stage=STAGE_ORDER[0] if models.get("embedding") else "context",
            progress=0,
            started_at=now,
            models=models,
            summary={
                "total_steps": len(step_defs),
                "stage_order": list(STAGE_ORDER),
            },
        )
        session.add(run)
        session.flush()
        step_ids: Dict[Tuple[str, str], int] = {}
        for stage, model in step_defs:
            module, function = STEP_LOCATIONS.get(stage, ("", ""))
            step = PerformanceTestStep(
                run_id=run_id,
                stage=stage,
                model=model,
                module=module,
                function=function,
                status="pending",
                progress=0,
            )
            session.add(step)
            session.flush()
            step_ids[(stage, model)] = int(step.id)
        session.commit()
    return run_id, step_ids, len(step_defs)


def _mark_open_steps(
    session_factory: sessionmaker[Session],
    run_id: str,
    *,
    status: str = "skipped",
    error_message: Optional[str] = None,
) -> None:
    with session_factory() as session:
        steps = session.scalars(
            select(PerformanceTestStep).where(
                PerformanceTestStep.run_id == run_id,
                PerformanceTestStep.status.in_(["pending", "running"]),
            )
        ).all()
        now = datetime.now(timezone.utc)
        for step in steps:
            step.status = status
            step.progress = 100
            step.finished_at = now
            if error_message:
                step.error_message = str(error_message)[:4000]
        session.commit()
    _refresh_run_progress(session_factory, run_id)


def _finalize_run(
    session_factory: sessionmaker[Session],
    run_id: str,
    *,
    status: str,
    summary: Dict[str, Any],
    total_ms: int,
    answer: Optional[str] = None,
    error_message: Optional[str] = None,
) -> None:
    with session_factory() as session:
        run = session.scalars(
            select(PerformanceTestRun).where(PerformanceTestRun.run_id == run_id)
        ).first()
        if run is None:
            return
        run.status = status[:16]
        run.stage = "完成"
        run.progress = 100
        run.finished_at = datetime.now(timezone.utc)
        run.total_ms = max(0, int(total_ms or 0))
        run.answer = str(answer) if answer is not None else None
        run.summary = {
            **(run.summary or {}),
            **summary,
            "stage_order": list(STAGE_ORDER),
        }
        if error_message:
            run.error_message = str(error_message)[:4000]
        session.commit()


def _serialize_step(step: PerformanceTestStep) -> Dict[str, Any]:
    fallback_module, fallback_function = STEP_LOCATIONS.get(
        step.stage, ("", "")
    )
    return {
        "id": step.id,
        "run_id": step.run_id,
        "stage": step.stage,
        "stage_label": STAGE_LABELS.get(step.stage, step.stage),
        "model": step.model,
        "module": step.module or fallback_module,
        "function": step.function or fallback_function,
        "status": step.status,
        "progress": int(step.progress or 0),
        "started_at": _iso(step.started_at),
        "finished_at": _iso(step.finished_at),
        "duration_ms": int(step.duration_ms or 0),
        "details": step.details or {},
        "error_message": step.error_message,
    }


def serialize_test_run(
    run: PerformanceTestRun,
    steps: Sequence[PerformanceTestStep],
    *,
    include_steps: bool = True,
) -> Dict[str, Any]:
    payload = {
        "run_id": run.run_id,
        "request_id": run.request_id,
        "question": run.question,
        "status": run.status,
        "stage": run.stage,
        "stage_label": STAGE_LABELS.get(run.stage, run.stage),
        "progress": int(run.progress or 0),
        "started_at": _iso(run.started_at),
        "finished_at": _iso(run.finished_at),
        "total_ms": int(run.total_ms or 0),
        "models": run.models or {},
        "summary": run.summary or {},
        "answer": run.answer,
        "error_message": run.error_message,
        "stage_order": list(STAGE_ORDER),
    }
    if include_steps:
        payload["steps"] = [_serialize_step(step) for step in steps]
    return payload


def get_test_run(
    session_factory: sessionmaker[Session],
    run_id: str,
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        run = session.scalars(
            select(PerformanceTestRun).where(PerformanceTestRun.run_id == run_id)
        ).first()
        if run is None:
            return None
        steps = session.scalars(
            select(PerformanceTestStep)
            .where(PerformanceTestStep.run_id == run_id)
            .order_by(PerformanceTestStep.id.asc())
        ).all()
        return serialize_test_run(run, steps)


def get_latest_test_run(
    session_factory: sessionmaker[Session],
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        run = session.scalars(
            select(PerformanceTestRun)
            .where(PerformanceTestRun.status == "running")
            .order_by(PerformanceTestRun.started_at.desc())
            .limit(1)
        ).first()
        if run is None:
            run = session.scalars(
                select(PerformanceTestRun)
                .order_by(PerformanceTestRun.started_at.desc())
                .limit(1)
            ).first()
        if run is None:
            return None
        steps = session.scalars(
            select(PerformanceTestStep)
            .where(PerformanceTestStep.run_id == run.run_id)
            .order_by(PerformanceTestStep.id.asc())
        ).all()
        return serialize_test_run(run, steps)


def list_test_runs(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    limit = max(1, min(100, int(limit or 20)))
    with session_factory() as session:
        runs = session.scalars(
            select(PerformanceTestRun)
            .order_by(PerformanceTestRun.started_at.desc())
            .limit(limit)
        ).all()
        return [
            serialize_test_run(run, [], include_steps=False)
            for run in runs
        ]


def _test_run_summary(
    *,
    step_ids: Dict[Tuple[str, str], int],
    models: Dict[str, Any],
    steps: Sequence[PerformanceTestStep],
    primary_model: str,
    valid_models: Sequence[str],
) -> Dict[str, Any]:
    by_stage: Dict[str, Dict[str, Any]] = {}
    for step in steps:
        bucket = by_stage.setdefault(
            step.stage, {"total": 0, "success": 0, "failed": 0, "duration_ms": 0}
        )
        bucket["total"] += 1
        if step.status == "success":
            bucket["success"] += 1
        elif step.status in {"failed", "error"}:
            bucket["failed"] += 1
        bucket["duration_ms"] += int(step.duration_ms or 0)
    return {
        "total_steps": len(step_ids),
        "completed_steps": sum(
            1 for step in steps if step.status not in {"pending", "running"}
        ),
        "failed_steps": sum(
            1 for step in steps if step.status in {"failed", "error"}
        ),
        "skipped_steps": sum(1 for step in steps if step.status == "skipped"),
        "embedding_models": list(models.get("embedding") or []),
        "llm_models": list(models.get("llm") or []),
        "valid_models": list(valid_models),
        "primary_model": primary_model,
        "stage_stats": by_stage,
    }


def run_test_mode(
    *,
    session_factory: sessionmaker[Session],
    question: str,
    settings: Settings,
    coverage: Dict[str, Any],
    store: QdrantStore,
    request_id: str = "",
    law_sources: Optional[Sequence[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    started = time.perf_counter()
    law_sources = list(law_sources or [])
    models = available_test_models(
        settings, session_factory=session_factory
    )
    run_id, step_ids, total_steps = _create_test_run(
        session_factory,
        question=question,
        request_id=request_id,
        models=models,
    )
    vectors: Dict[str, List[float]] = {}
    reference_hits: Optional[List[Dict[str, Any]]] = None
    reference_model = ""
    citations: List[Dict[str, Any]] = []
    contexts: List[Dict[str, Any]] = []
    llm_results: Dict[str, Dict[str, Any]] = {}

    def step_id(stage: str, model: str) -> Optional[int]:
        return step_ids.get((stage, model))

    def mark(
        stage: str,
        model: str,
        *,
        status: str,
        progress: int,
        details: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None,
        started_at: Optional[datetime] = None,
        duration_ms: Optional[int] = None,
    ) -> None:
        sid = step_id(stage, model)
        if sid is None:
            return
        _mark_step(
            session_factory,
            run_id,
            sid,
            status=status,
            progress=progress,
            details=details,
            error_message=error,
            started_at=started_at,
            finished_at=datetime.now(timezone.utc)
            if status not in {"pending", "running"}
            else None,
            duration_ms=duration_ms,
        )

    try:
        # 1. Embedding: one step per available embedding model.
        for model in models.get("embedding") or []:
            now = datetime.now(timezone.utc)
            mark(
                "embedding",
                model,
                status="running",
                progress=5,
                started_at=now,
            )
            step_started = time.perf_counter()
            try:
                embedder = OllamaEmbedder(
                    settings.embedding_url,
                    model,
                    timeout=None,
                    query_timeout=None,
                    health_timeout=None,
                )
                vector = embedder.embed_query(question)
                vectors[model] = vector
                mark(
                    "embedding",
                    model,
                    status="success",
                    progress=100,
                    details={
                        "model": model,
                        "dimensions": len(vector),
                    },
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )
            except Exception as exc:
                mark(
                    "embedding",
                    model,
                    status="failed",
                    progress=100,
                    details={"model": model},
                    error=f"{exc.__class__.__name__}: {exc}",
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )

        # 2. Retrieval: one Qdrant search per embedding model.
        for model in models.get("embedding") or []:
            if model not in vectors:
                mark(
                    "retrieval",
                    model,
                    status="skipped",
                    progress=100,
                    error="Embedding 失敗，略過檢索",
                )
                continue
            now = datetime.now(timezone.utc)
            mark("retrieval", model, status="running", progress=5, started_at=now)
            step_started = time.perf_counter()
            try:
                hits = store.search(
                    settings.judgment_vector_collection,
                    vectors[model],
                    limit=max(1, settings.rag_top_k),
                    score_threshold=settings.rag_score_threshold,
                )
                if model == settings.embedding_model:
                    reference_hits = hits
                    reference_model = model
                elif (reference_hits is None or not reference_hits) and hits:
                    reference_hits = hits
                    reference_model = model
                mark(
                    "retrieval",
                    model,
                    status="success",
                    progress=100,
                    details={
                        "model": model,
                        "hits": len(hits),
                        "top_score": round(
                            float(hits[0].get("score") or 0), 4
                        )
                        if hits
                        else None,
                    },
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )
            except Exception as exc:
                mark(
                    "retrieval",
                    model,
                    status="failed",
                    progress=100,
                    details={"model": model, "hits": 0},
                    error=f"{exc.__class__.__name__}: {exc}",
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )

        # 3. Fetch full text and build citation contexts once.
        context_model = "PostgreSQL"
        now = datetime.now(timezone.utc)
        mark("context", context_model, status="running", progress=5, started_at=now)
        context_started = time.perf_counter()
        try:
            judgment_contexts: List[Dict[str, Any]] = []
            if reference_hits:
                jids = [
                    str((hit.get("payload") or {}).get("jid") or "")
                    for hit in reference_hits
                ]
                documents = _fetch_documents(session_factory, jids)
                citations, judgment_contexts = _build_citations(
                    hits=[
                        hit
                        for hit in reference_hits
                        if str((hit.get("payload") or {}).get("jid") or "")
                        in documents
                    ],
                    documents=documents,
                    question=question,
                    max_context_chars=settings.rag_max_context_chars,
                )
            for offset, source in enumerate(law_sources, start=len(citations) + 1):
                source["index"] = offset
            law_contexts = [
                {**source, "text": law_source_text(source)} for source in law_sources
            ]
            contexts = judgment_contexts + law_contexts
            mark(
                "context",
                context_model,
                status="success" if contexts else "skipped",
                progress=100,
                details={
                    "reference_embedding_model": reference_model,
                    "documents": len(judgment_contexts),
                    "laws": len(law_contexts),
                    "contexts": len(contexts),
                },
                error=None if contexts else "沒有可用的判決、法規或命令片段",
                duration_ms=int((time.perf_counter() - context_started) * 1000),
            )
        except Exception as exc:
            mark(
                "context",
                context_model,
                status="failed",
                progress=100,
                details={"reference_embedding_model": reference_model},
                error=f"{exc.__class__.__name__}: {exc}",
                duration_ms=int((time.perf_counter() - context_started) * 1000),
            )

        # 4. LLM: one step per available LLM model.
        for model in models.get("llm") or []:
            if not contexts:
                mark(
                    "llm",
                    model,
                    status="skipped",
                    progress=100,
                    error="沒有可用的判決、法規或命令片段",
                )
                continue
            now = datetime.now(timezone.utc)
            mark("llm", model, status="running", progress=5, started_at=now)
            step_started = time.perf_counter()
            try:
                answer = generate_answer_with_model(
                    settings=settings,
                    model=model,
                    question=question,
                    contexts=contexts,
                    timeout=None,
                )
                llm_results[model] = {"answer": answer, "error": None}
                mark(
                    "llm",
                    model,
                    status="success",
                    progress=100,
                    details={
                        "model": model,
                        "answer_chars": len(answer),
                        "answer_preview": answer[:500],
                    },
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )
            except Exception as exc:
                llm_results[model] = {
                    "answer": "",
                    "error": f"{exc.__class__.__name__}: {exc}",
                }
                mark(
                    "llm",
                    model,
                    status="failed",
                    progress=100,
                    details={"model": model},
                    error=f"{exc.__class__.__name__}: {exc}",
                    duration_ms=int((time.perf_counter() - step_started) * 1000),
                )

        # 5. Citation validation: one step per LLM model.
        valid_models: List[str] = []
        for model in models.get("llm") or []:
            result = llm_results.get(model)
            if not result or not result.get("answer"):
                mark(
                    "validation",
                    model,
                    status="skipped",
                    progress=100,
                    error="LLM 沒有回答，略過驗證",
                )
                continue
            now = datetime.now(timezone.utc)
            mark("validation", model, status="running", progress=5, started_at=now)
            step_started = time.perf_counter()
            answer = str(result["answer"])
            valid = _valid_citation_markers(answer, len(citations) + len(law_sources))
            if valid:
                valid_models.append(model)
            mark(
                "validation",
                model,
                status="success" if valid else "failed",
                progress=100,
                details={
                    "model": model,
                    "valid": valid,
                    "answer_chars": len(answer),
                    "citation_count": len(citations) + len(law_sources),
                },
                error=None if valid else "引用編號驗證失敗",
                duration_ms=int((time.perf_counter() - step_started) * 1000),
            )

        primary_model = ""
        if settings.llm_model and settings.llm_model in valid_models:
            primary_model = settings.llm_model
        elif valid_models:
            primary_model = valid_models[0]
        elif llm_results:
            primary_model = next(iter(llm_results))
        primary_answer = (
            str(llm_results[primary_model].get("answer") or "")
            if primary_model in llm_results
            else ""
        )
        primary_valid = primary_model in valid_models

        steps = _step_rows(session_factory, run_id)
        failed_steps = sum(
            1 for step in steps if step.status in {"failed", "error"}
        )
        run_status = (
            "success"
            if primary_valid and failed_steps == 0
            else "partial"
            if primary_valid
            else "failed"
        )
        summary = _test_run_summary(
            step_ids=step_ids,
            models=models,
            steps=steps,
            primary_model=primary_model,
            valid_models=valid_models,
        )
        total_ms = int((time.perf_counter() - started) * 1000)
        if primary_valid and primary_answer:
            answer = primary_answer
            response_status = "operational"
            notice = (
                f"測試模式：已執行 {len(models.get('embedding') or [])} 個 embedding "
                f"模型與 {len(models.get('llm') or [])} 個 LLM 模型；"
                f"回答來自 {primary_model}。這不是法律意見。"
            )
        else:
            answer = (
                _retrieval_answer(citations, law_sources)
                if citations or law_sources
                else "測試模式下沒有檢索到足夠相似的判決或法規片段；沒有模型產生可驗證回答。"
            )
            response_status = "retrieval_only"
            notice = (
                f"測試模式：已執行 {len(models.get('embedding') or [])} 個 embedding "
                f"模型與 {len(models.get('llm') or [])} 個 LLM 模型；"
                "沒有模型通過引用驗證，只顯示檢索結果。"
            )
        _finalize_run(
            session_factory,
            run_id,
            status=run_status,
            summary=summary,
            total_ms=total_ms,
            answer=answer,
        )
        final_run = get_test_run(session_factory, run_id) or {}
        test_run = {
            "run_id": run_id,
            "status": run_status,
            "progress": 100,
            "stage": "完成",
            "step_count": total_steps,
            "models": models,
            "primary_model": primary_model,
            "started_at": final_run.get("started_at"),
            "finished_at": final_run.get("finished_at"),
            "total_ms": total_ms,
        }
        top_score = (
            round(float(reference_hits[0].get("score") or 0), 4)
            if reference_hits
            else None
        )
        return {
            "status": response_status,
            "answer": answer,
            "notice": notice,
            "citations": [],
            "judgments": citations,
            "law_sources": law_sources,
            "matched_terms": [source["law_name"] for source in law_sources],
            "llm_model": primary_model or None,
            "embedding_model": reference_model or settings.embedding_model or None,
            "retrieval": {
                "status": "ok" if reference_hits else "empty",
                "top_k": settings.rag_top_k,
                "score_threshold": settings.rag_score_threshold,
                "hits": len(reference_hits or []),
                "unique_judgments": len(reference_hits or []),
                "top_score": top_score,
                "reference_embedding_model": reference_model,
                "test_mode": True,
            },
            "coverage": coverage,
            "test_run": test_run,
            "duration_ms": total_ms,
        }
    except Exception as exc:
        _mark_open_steps(
            session_factory,
            run_id,
            status="failed",
            error_message=f"{exc.__class__.__name__}: {exc}",
        )
        total_ms = int((time.perf_counter() - started) * 1000)
        _finalize_run(
            session_factory,
            run_id,
            status="failed",
            summary={"total_steps": total_steps},
            total_ms=total_ms,
            answer="測試模式執行失敗；沒有生成未經驗證的回答。",
            error_message=f"{exc.__class__.__name__}: {exc}",
        )
        final_run = get_test_run(session_factory, run_id) or {}
        test_run = {
            "run_id": run_id,
            "status": "failed",
            "progress": 100,
            "stage": "完成",
            "step_count": total_steps,
            "models": models,
            "primary_model": "",
            "started_at": final_run.get("started_at"),
            "finished_at": final_run.get("finished_at"),
            "total_ms": total_ms,
        }
        return {
            "status": "retrieval_only",
            "answer": "測試模式執行失敗；沒有生成未經驗證的回答。",
            "notice": f"測試模式執行失敗：{exc.__class__.__name__}: {exc}",
            "citations": [],
            "judgments": [],
            "matched_terms": [],
            "retrieval": {"status": "failed", "test_mode": True},
            "coverage": coverage,
            "test_run": test_run,
            "duration_ms": total_ms,
        }
