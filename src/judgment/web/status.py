from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session, sessionmaker

from .. import __version__
from ..config import Settings
from ..embeddings import (
    provider_model_available,
    provider_models_detail,
)
from ..index_versions import active_version
from ..judgment_index import cached_index_coverage, cached_index_staleness
from ..legal_index import assess_legal_index_freshness, legal_index_status
from ..models import (
    DownloadRun,
    LawDatasetVersion,
    LawDocument,
)
from ..observability import traced
from ..vector_store import QdrantError, QdrantStore
from ..version_codes import version_code_for_datetime

SERVICE_LABELS = {
    "operational": "正常",
    "degraded": "降級",
    "unavailable": "離線",
    "not_configured": "未設定",
}


def _ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)


def _timed_call(fn):
    """Run one status check and return its result plus timing metadata."""

    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    result = fn()
    finished_at = datetime.now(timezone.utc)
    return result, started_at, finished_at, _ms(started)


def _service_stage_status(value: Optional[str]) -> str:
    if value == "not_configured":
        return "skipped"
    if value in {"operational", "fresh"}:
        return "success"
    return "failed"


def _pipeline_stage(
    *,
    key: str,
    label: str,
    caption: str,
    color: str,
    status: str,
    started_at: datetime,
    finished_at: datetime,
    duration_ms: int,
    message: str = "",
) -> Dict[str, Any]:
    return {
        "key": key,
        "label": label,
        "caption": caption,
        "color": color,
        "status": status,
        "started_at": started_at,
        "finished_at": finished_at,
        "duration_ms": max(0, int(duration_ms)),
        "message": message,
    }



def _postgres_metrics(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    started = time.perf_counter()
    try:
        with session_factory() as session:
            session.execute(text("SELECT 1"))
            current_counts = dict(
                session.execute(
                    select(LawDocument.source_type, func.count())
                    .where(LawDocument.is_current.is_(True))
                    .group_by(LawDocument.source_type)
                ).all()
            )
            article_count = int(
                session.scalar(
                    select(func.sum(LawDocument.article_count)).where(
                        LawDocument.is_current.is_(True)
                    )
                )
                or 0
            )
            version_count = int(
                session.scalar(select(func.count()).select_from(LawDatasetVersion)) or 0
            )
            run_count = int(
                session.scalar(select(func.count()).select_from(DownloadRun)) or 0
            )
            last_version = session.scalars(
                select(LawDatasetVersion)
                .order_by(LawDatasetVersion.downloaded_at.desc())
                .limit(1)
            ).first()
            last_run = session.scalars(
                select(DownloadRun).order_by(DownloadRun.started_at.desc()).limit(1)
            ).first()
            recent_runs = session.scalars(
                select(DownloadRun).order_by(DownloadRun.started_at.desc()).limit(6)
            ).all()

        return {
            "status": "operational",
            "latency_ms": _ms(started),
            "detail": "連線正常",
            "law_count": int(current_counts.get("law", 0)),
            "order_count": int(current_counts.get("order", 0)),
            "total_current": int(sum(current_counts.values())),
            "article_count": article_count,
            "version_count": version_count,
            "run_count": run_count,
            "last_version": _version_dict(last_version),
            "last_run": _run_dict(last_run),
            "recent_runs": [_run_dict(run) for run in recent_runs],
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "latency_ms": _ms(started),
            "detail": f"無法查詢：{exc.__class__.__name__}",
            "law_count": 0,
            "order_count": 0,
            "total_current": 0,
            "article_count": 0,
            "version_count": 0,
            "run_count": 0,
            "last_version": None,
            "last_run": None,
            "recent_runs": [],
        }


def _version_dict(version: Optional[LawDatasetVersion]) -> Optional[Dict[str, Any]]:
    if version is None:
        return None
    return {
        "id": int(version.id),
        "source_type": version.source_type,
        "version_code": version.version_code
        or version_code_for_datetime(version.downloaded_at),
        "update_date": version.update_date,
        "law_count": int(version.law_count),
        "article_count": int(version.article_count),
        "is_current": bool(version.is_current),
        "downloaded_at": version.downloaded_at,
        "parquet_path": version.parquet_path,
    }


def _run_dict(run: Optional[DownloadRun]) -> Optional[Dict[str, Any]]:
    if run is None:
        return None
    return {
        "id": int(run.id),
        "source_type": run.source_type,
        "status": run.status,
        "started_at": run.started_at,
        "finished_at": run.finished_at,
        "duration_ms": run.duration_ms,
        "law_count": int(run.law_count or 0),
        "article_count": int(run.article_count or 0),
        "version_id": run.version_id,
        "error_message": run.error_message,
    }


def _parquet_metrics(data_dir: Path) -> Dict[str, Any]:
    started = time.perf_counter()
    try:
        files = list((Path(data_dir) / "raw_parquet").glob("*/*/*/laws.parquet"))
        total_bytes = sum(path.stat().st_size for path in files)
        latest = max((path.stat().st_mtime for path in files), default=None)
        return {
            "status": "operational" if files else "not_configured",
            "latency_ms": _ms(started),
            "detail": (
                f"{len(files)} 個原始 Parquet · {_format_bytes(total_bytes)}"
                if files
                else "尚未產生原始 Parquet"
            ),
            "file_count": len(files),
            "bytes": total_bytes,
            "latest_modified": datetime.fromtimestamp(
                latest, tz=timezone.utc
            )
            if latest
            else None,
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"無法讀取目錄：{exc.__class__.__name__}",
            "file_count": 0,
            "bytes": 0,
            "latest_modified": None,
        }


def _format_bytes(value: int) -> str:
    size = float(value)
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if size < 1024 or unit == "TB":
            return f"{size:.0f} {unit}" if unit == "B" else f"{size:.1f} {unit}"
        size /= 1024
    return f"{value} B"


def _probe_http(name: str, url: Optional[str]) -> Dict[str, Any]:
    if not url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 {name}",
        }
    started = time.perf_counter()
    try:
        response = httpx.get(url, timeout=2.5, follow_redirects=True)
        status = "operational" if response.status_code < 400 else "degraded"
        return {
            "status": status,
            "latency_ms": _ms(started),
            "detail": f"HTTP {response.status_code} · {url}",
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"{exc.__class__.__name__} · {url}",
        }


def _qdrant_metrics(
    collection: str, *, base_url: str, api_key: str = ""
) -> Dict[str, Any]:
    started = time.perf_counter()
    base_url = base_url.rstrip("/")
    if not base_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": "未設定 QDRANT_URL",
            "points_count": None,
            "collection": collection,
        }
    store = QdrantStore(base_url, api_key=api_key, timeout=5.0)
    try:
        collections = store.list_collections()
        info = store.collection_info(collection)
    except QdrantError as exc:
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"{exc.__class__.__name__} · {base_url}",
            "points_count": None,
            "collection": collection,
        }
    if info is None:
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"已連線 {base_url}；collection「{collection}」尚未建立",
            "points_count": 0,
            "collection": collection,
            "collection_count": len(collections),
        }
    points = int(info.get("points_count") or 0)
    return {
        "status": "operational",
        "latency_ms": _ms(started),
        "detail": f"{points:,} points · {collection} · {len(collections)} collections",
        "points_count": points,
        "collection": collection,
        "collection_count": len(collections),
    }


def _embedding_metrics(
    *,
    base_url: str,
    model: str,
    api: str = "ollama",
    fallback_url: str = "",
    fallback_api: str = "ollama",
    fallback_urls: tuple[str, ...] = (),
    fallback_apis: tuple[str, ...] = (),
) -> Dict[str, Any]:
    started = time.perf_counter()
    base_url = base_url.rstrip("/")
    model = model.strip() or "bge-m3"
    if not base_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 EMBEDDING_URL（模型：{model}）",
            "model": model,
            "active_url": None,
            "active_model": model,
            "active_role": "primary",
        }
    candidates: List[tuple[str, str]] = []
    for index, url in enumerate((base_url, fallback_url, *fallback_urls)):
        text = str(url or "").strip().rstrip("/")
        if not text or any(text == seen for seen, _ in candidates):
            continue
        if index == 0:
            api_value = api
        elif index == 1:
            api_value = fallback_api
        else:
            api_value = (
                fallback_apis[index - 2]
                if index - 2 < len(fallback_apis or ())
                else fallback_api
            )
        candidates.append((text, str(api_value or "ollama")))
    primary_url, primary_api = candidates[0]
    primary_detail = provider_models_detail(primary_url, primary_api)
    primary_available = (
        primary_detail["status"] == "operational"
        and provider_model_available(primary_url, model, primary_api)
    )
    if primary_available:
        return {
            "status": "operational",
            "latency_ms": _ms(started),
            "detail": f"模型：{model} · {primary_url}",
            "model": model,
            "models": primary_detail["models"],
            "api": primary_api,
            "active_url": primary_url,
            "active_model": model,
            "active_role": "primary",
        }
    for url, url_api in candidates[1:]:
        fallback_detail = provider_models_detail(url, url_api)
        if fallback_detail["status"] == "operational" and provider_model_available(
            url, model, url_api
        ):
            return {
                "status": "operational",
                "latency_ms": _ms(started),
                "detail": (
                    f"主要 {primary_url} 不可用；fallback 模型：{model} · {url}"
                ),
                "model": model,
                "models": fallback_detail["models"],
                "api": url_api,
                "active_url": url,
                "active_model": model,
                "active_role": "fallback",
            }
    return {
        "status": "degraded",
        "latency_ms": _ms(started),
        "detail": (
            f"已連線 {primary_url}，但找不到模型 {model}"
            if primary_detail["status"] == "operational"
            else f"{primary_detail['detail']} · {primary_url}"
        ),
        "model": model,
        "models": primary_detail["models"],
        "api": primary_api,
        "active_url": primary_url,
        "active_model": model,
        "active_role": "primary",
    }


def _rerank_health(url: str) -> bool:
    try:
        parsed = httpx.URL(url)
        netloc = parsed.netloc
        if isinstance(netloc, bytes):
            netloc = netloc.decode()
        health_url = f"{parsed.scheme}://{netloc}/health"
        response = httpx.get(health_url, timeout=1.0)
        return response.status_code == 200
    except Exception:
        return False


def _rerank_provider_name(url: str) -> str:
    try:
        parsed = httpx.URL(url)
        host = parsed.host
        if isinstance(host, bytes):
            host = host.decode()
        host = str(host or "").strip()
        if host in {"127.0.0.1", "localhost", "::1"}:
            return "local"
        return host or url
    except Exception:
        return url


def _rerank_metrics(settings: Settings) -> Dict[str, Any]:
    model = settings.rerank_model
    candidates = [
        (role, str(url).strip().rstrip("/"))
        for role, url in (
            ("primary", settings.rerank_url),
            ("fallback", settings.rerank_fallback_url),
        )
        if str(url or "").strip()
    ]
    providers = [
        {
            "name": _rerank_provider_name(url),
            "role": role,
            "url": url,
            "model": model,
            "status": "disabled" if not settings.rag_rerank_enabled else "degraded",
            "active": False,
        }
        for role, url in candidates
    ]
    if not settings.rag_rerank_enabled:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"RAG_RERANK_ENABLED=false（模型：{model}）",
            "model": model,
            "enabled": False,
            "providers": providers,
            "active": None,
        }
    if not candidates:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 RERANK_URL（模型：{model}）",
            "model": model,
            "enabled": True,
            "providers": [],
            "active": None,
        }

    started = time.perf_counter()
    for provider in providers:
        provider["status"] = (
            "operational"
            if _rerank_health(provider["url"])
            else "degraded"
        )
    active = next(
        (
            provider
            for provider in providers
            if provider["status"] == "operational"
        ),
        None,
    )
    if active is not None:
        active["active"] = True
        prefix = "fallback " if active["role"] == "fallback" else ""
        return {
            "status": "operational",
            "latency_ms": _ms(started),
            "detail": f"{prefix}模型：{model} · {active['url']}",
            "model": model,
            "enabled": True,
            "providers": providers,
            "active": active,
        }
    return {
        "status": "degraded",
        "latency_ms": _ms(started),
        "detail": f"無法連線 reranker（模型：{model}）",
        "model": model,
        "enabled": True,
        "providers": providers,
        "active": None,
    }


def rerank_status(settings: Settings) -> Dict[str, Any]:
    """Public health-only reranker status used by the system-test page."""

    return _rerank_metrics(settings)


def _llm_metrics(
    *,
    base_url: str,
    model: str,
    api: str = "ollama",
    fallback_url: str = "",
    fallback_model: str = "",
    fallback_api: str = "ollama",
) -> Dict[str, Any]:
    started = time.perf_counter()
    base_url = base_url.rstrip("/")
    model = model.strip()
    fallback_url = str(fallback_url or "").strip().rstrip("/")
    fallback_model = str(fallback_model or model).strip()
    if not model:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": "未設定 LLM_MODEL",
            "model": None,
            "active_url": None,
            "active_model": None,
            "active_role": "primary",
        }
    if not base_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 LLM_URL（模型：{model}）",
            "model": model,
            "active_url": None,
            "active_model": model,
            "active_role": "primary",
        }
    detail = provider_models_detail(base_url, api)
    if detail["status"] == "operational" and provider_model_available(
        base_url, model, api
    ):
        return {
            "status": "operational",
            "latency_ms": _ms(started),
            "detail": f"模型：{model} · {base_url}",
            "model": model,
            "models": detail["models"],
            "api": api,
            "active_url": base_url,
            "active_model": model,
            "active_role": "primary",
        }
    if fallback_url and fallback_url != base_url:
        fallback_detail = provider_models_detail(fallback_url, fallback_api)
        if fallback_detail["status"] == "operational" and provider_model_available(
            fallback_url, fallback_model, fallback_api
        ):
            return {
                "status": "operational",
                "latency_ms": _ms(started),
                "detail": (
                    f"主要 {base_url} 不可用；fallback 模型："
                    f"{fallback_model} · {fallback_url}"
                ),
                "model": fallback_model,
                "models": fallback_detail["models"],
                "api": fallback_api,
                "active_url": fallback_url,
                "active_model": fallback_model,
                "active_role": "fallback",
            }
    return {
        "status": "degraded",
        "latency_ms": _ms(started),
        "detail": (
            f"已連線 {base_url}，但找不到模型 {model}"
            if detail["status"] == "operational"
            else f"{detail['detail']} · {base_url}"
        ),
        "model": model,
        "models": detail["models"],
        "api": api,
        "active_url": base_url,
        "active_model": model,
        "active_role": "primary",
    }


def _rag_metrics(
    qdrant: Dict[str, Any],
    embedding: Dict[str, Any],
    llm: Dict[str, Any],
) -> Dict[str, Any]:
    if qdrant["status"] == "operational" and embedding["status"] == "operational":
        if llm["status"] == "operational":
            return {
                "status": "operational",
                "latency_ms": None,
                "detail": (
                    f"判決向量與法規／命令檢索就緒 · {qdrant.get('points_count') or 0:,} points · "
                    f"{embedding.get('model')} + {llm.get('model')}"
                ),
            }
        return {
            "status": "degraded",
            "latency_ms": None,
            "detail": "向量檢索就緒；LLM 未設定或不可用，只回傳可驗證的檢索結果",
        }
    if (
        qdrant["status"] == "not_configured"
        and embedding["status"] == "not_configured"
        and llm["status"] == "not_configured"
    ):
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": "Qdrant、Embedding 與 LLM 皆未設定",
        }
    return {
        "status": "degraded",
        "latency_ms": None,
        "detail": "部分 AI 元件未就緒，RAG 會降級為法規 metadata 預覽",
    }


@traced("status.build", module=__name__, params_fn=lambda **_: {})
def _legal_index_metrics(
    *,
    session_factory: sessionmaker[Session],
    settings: Settings,
    postgres: Dict[str, Any],
) -> Dict[str, Any]:
    started = time.perf_counter()
    try:
        status = legal_index_status(
            session_factory=session_factory,
            settings=settings,
            store=QdrantStore(
                settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=5.0,
            ),
        )
        active = status.get("active_version") or {}
        last_version = postgres.get("last_version") or {}
        freshness = assess_legal_index_freshness(
            active_version=active,
            points_count=status.get("points_count"),
            current_law_count=int(postgres.get("total_current") or 0),
            current_article_count=int(postgres.get("article_count") or 0),
            latest_source_at=last_version.get("downloaded_at"),
        )
        return {
            "status": freshness.get("status"),
            "stale": bool(freshness.get("stale")),
            "reasons": list(freshness.get("reasons") or []),
            "alias": status.get("alias"),
            "alias_collection": status.get("alias_collection"),
            "collection": status.get("collection"),
            "points_count": status.get("points_count"),
            "dimension": status.get("dimension"),
            "version_id": active.get("version_id"),
            "law_count": active.get("law_count"),
            "article_count": active.get("article_count"),
            "indexed_at": active.get("activated_at")
            or active.get("validated_at")
            or active.get("created_at"),
            "snapshot_hash": (active.get("source_snapshot") or {}).get(
                "snapshot_hash"
            ),
            "freshness": freshness,
            "latency_ms": _ms(started),
        }
    except Exception as exc:
        return {
            "status": "unknown",
            "stale": None,
            "reasons": [f"{exc.__class__.__name__}: {exc}"],
            "alias": settings.legal_article_vector_alias,
            "alias_collection": None,
            "collection": None,
            "points_count": None,
            "dimension": None,
            "version_id": None,
            "law_count": None,
            "article_count": None,
            "indexed_at": None,
            "snapshot_hash": None,
            "freshness": {},
            "latency_ms": _ms(started),
        }


def _model_host(url: str) -> str:
    host = str(urlparse(str(url or "")).hostname or "").strip()
    if host in {"127.0.0.1", "localhost", "::1", "0.0.0.0"}:
        return "mbp"
    return host or "—"


def _model_entry(
    url: str,
    model: str,
    *,
    status: str,
    role: str,
) -> Optional[Dict[str, Any]]:
    url = str(url or "").strip().rstrip("/")
    if not url:
        return None
    model = str(model or "").strip()
    host = _model_host(url)
    return {
        "role": role,
        "host": host,
        "model": model,
        "label": f"{host}:{model}" if model else host,
        "url": url,
        "status": status or "unknown",
    }


def _fallback_model_status(
    *,
    url: str,
    model: str,
    api: str,
    active_role: str,
    active_url: str,
) -> str:
    """Return the real availability of a configured fallback model.

    The active model is already probed by the caller.  The fallback is not,
    so probe it here; status responses are cached, and this keeps the UI from
    showing an available fallback as permanently grey.
    """

    url = str(url or "").strip().rstrip("/")
    if not url:
        return "not_configured"
    if str(active_role or "") == "fallback":
        return "operational"
    if url == str(active_url or "").strip().rstrip("/"):
        return "standby"
    detail = provider_models_detail(url, api)
    if detail["status"] == "operational" and provider_model_available(
        url, model, api
    ):
        return "operational"
    return "degraded"


def _model_summary(
    settings: Settings,
    *,
    embedding: Dict[str, Any],
    llm: Dict[str, Any],
    rerank: Dict[str, Any],
) -> List[Dict[str, Any]]:
    chat_role = str(llm.get("active_role") or "primary")
    chat_default_status = (
        str(llm.get("status") or "unknown")
        if chat_role != "fallback"
        else "degraded"
    )
    chat_default = _model_entry(
        settings.llm_url,
        settings.llm_model,
        status=chat_default_status,
        role="primary",
    )
    chat_active = _model_entry(
        llm.get("active_url") or settings.llm_url,
        llm.get("active_model") or settings.llm_model,
        status=str(llm.get("status") or "unknown"),
        role=chat_role,
    )
    chat_fallback_status = _fallback_model_status(
        url=settings.llm_fallback_url,
        model=settings.llm_fallback_model or settings.llm_model,
        api=settings.llm_fallback_api,
        active_role=chat_role,
        active_url=str(llm.get("active_url") or settings.llm_url),
    )
    chat_fallback = _model_entry(
        settings.llm_fallback_url,
        settings.llm_fallback_model or settings.llm_model,
        status=chat_fallback_status,
        role="fallback",
    )

    embedding_role = str(embedding.get("active_role") or "primary")
    embedding_default_status = (
        str(embedding.get("status") or "unknown")
        if embedding_role != "fallback"
        else "degraded"
    )
    embedding_default = _model_entry(
        settings.embedding_url,
        settings.embedding_model,
        status=embedding_default_status,
        role="primary",
    )
    embedding_active = _model_entry(
        embedding.get("active_url") or settings.embedding_url,
        embedding.get("active_model") or settings.embedding_model,
        status=str(embedding.get("status") or "unknown"),
        role=embedding_role,
    )
    embedding_fallback_status = _fallback_model_status(
        url=settings.embedding_fallback_url,
        model=settings.embedding_model,
        api=settings.embedding_fallback_api,
        active_role=embedding_role,
        active_url=str(
            embedding.get("active_url") or settings.embedding_url
        ),
    )
    embedding_fallback = _model_entry(
        settings.embedding_fallback_url,
        settings.embedding_model,
        status=embedding_fallback_status,
        role="fallback",
    )

    rerank_providers = list(rerank.get("providers") or [])
    rerank_primary = next(
        (item for item in rerank_providers if item.get("role") == "primary"),
        None,
    )
    rerank_fallback = next(
        (item for item in rerank_providers if item.get("role") == "fallback"),
        None,
    )
    rerank_default = _model_entry(
        settings.rerank_url,
        settings.rerank_model,
        status=str(
            (rerank_primary or {}).get("status")
            or rerank.get("status")
            or "unknown"
        ),
        role="primary",
    )
    rerank_active = rerank.get("active") or rerank_primary
    rerank_active_entry = (
        _model_entry(
            rerank_active.get("url") or settings.rerank_url,
            rerank_active.get("model") or settings.rerank_model,
            status=str(
                rerank_active.get("status")
                or rerank.get("status")
                or "unknown"
            ),
            role=str(rerank_active.get("role") or "primary"),
        )
        if rerank_active
        else None
    )
    rerank_fallback_entry = (
        _model_entry(
            rerank_fallback.get("url"),
            rerank_fallback.get("model") or settings.rerank_model,
            status=str(rerank_fallback.get("status") or "standby"),
            role="fallback",
        )
        if rerank_fallback
        else None
    )

    return [
        {
            "kind": "chat",
            "label": "Chat",
            "default": chat_default,
            "active": chat_active,
            "fallback": chat_fallback,
        },
        {
            "kind": "embedding",
            "label": "Embedding",
            "default": embedding_default,
            "active": embedding_active,
            "fallback": embedding_fallback,
        },
        {
            "kind": "rerank",
            "label": "Rerank",
            "default": rerank_default,
            "active": rerank_active_entry,
            "fallback": rerank_fallback_entry,
        },
    ]


def build_status(
    *,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    settings: Settings,
) -> Dict[str, Any]:
    pipeline_started = time.perf_counter()
    checked_at = datetime.now(timezone.utc)
    (
        postgres,
        postgres_started_at,
        postgres_finished_at,
        postgres_ms,
    ) = _timed_call(lambda: _postgres_metrics(session_factory))
    (
        parquet,
        parquet_started_at,
        parquet_finished_at,
        parquet_ms,
    ) = _timed_call(lambda: _parquet_metrics(data_dir))

    (
        active_index,
        version_started_at,
        version_finished_at,
        version_ms,
    ) = _timed_call(
        lambda: active_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
    )
    qdrant_collection = (
        active_index["physical_collection"]
        if active_index
        else settings.judgment_vector_collection
    )
    embedding_model = settings.embedding_model
    (
        qdrant,
        qdrant_started_at,
        qdrant_finished_at,
        qdrant_ms,
    ) = _timed_call(
        lambda: _qdrant_metrics(
            qdrant_collection,
            base_url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
        )
    )
    (
        embedding,
        embedding_started_at,
        embedding_finished_at,
        embedding_ms,
    ) = _timed_call(
        lambda: _embedding_metrics(
            base_url=settings.embedding_url,
            model=settings.embedding_model,
            api=settings.embedding_api,
            fallback_url=settings.embedding_fallback_url,
            fallback_api=settings.embedding_fallback_api,
            fallback_urls=settings.embedding_failover_urls,
            fallback_apis=settings.embedding_failover_apis,
        )
    )
    (
        llm,
        llm_started_at,
        llm_finished_at,
        llm_ms,
    ) = _timed_call(
        lambda: _llm_metrics(
            base_url=settings.llm_url,
            model=settings.llm_model,
            api=settings.llm_api,
            fallback_url=settings.llm_fallback_url,
            fallback_model=settings.llm_fallback_model,
            fallback_api=settings.llm_fallback_api,
        )
    )
    (
        rerank,
        rerank_started_at,
        rerank_finished_at,
        rerank_ms,
    ) = _timed_call(lambda: _rerank_metrics(settings))
    (
        rag,
        rag_started_at,
        rag_finished_at,
        rag_ms,
    ) = _timed_call(lambda: _rag_metrics(qdrant, embedding, llm))

    model_summary = _model_summary(
        settings,
        embedding=embedding,
        llm=llm,
        rerank=rerank,
    )

    coverage_started_at = datetime.now(timezone.utc)
    coverage_started = time.perf_counter()
    coverage_failed = False
    try:
        coverage = cached_index_coverage(
            session_factory,
            collection=qdrant_collection,
            model=embedding_model,
            version_id=active_index["version_id"] if active_index else None,
            ttl_seconds=settings.rag_coverage_cache_ttl_seconds,
        )
    except Exception:
        coverage_failed = True
        coverage = {
            "total_judgments": 0,
            "indexed_judgments": 0,
            "remaining_judgments": 0,
            "collection": qdrant_collection,
            "model": embedding_model,
            "latest_indexed_at": None,
        }
    coverage_finished_at = datetime.now(timezone.utc)
    coverage_ms = _ms(coverage_started)

    staleness_started_at = datetime.now(timezone.utc)
    staleness_started = time.perf_counter()
    staleness_failed = False
    try:
        staleness = cached_index_staleness(
            session_factory,
            collection=qdrant_collection,
            model=embedding_model,
            version_id=active_index["version_id"] if active_index else None,
            ttl_seconds=settings.rag_coverage_cache_ttl_seconds,
        )
    except Exception:
        staleness_failed = True
        staleness = {
            "status": "unknown",
            "fresh": None,
            "pending_judgments": None,
            "missing_judgments": None,
            "changed_judgments": None,
            "stale_judgments": None,
        }
    staleness_finished_at = datetime.now(timezone.utc)
    staleness_ms = _ms(staleness_started)

    (
        legal_index,
        legal_started_at,
        legal_finished_at,
        legal_ms,
    ) = _timed_call(
        lambda: _legal_index_metrics(
            session_factory=session_factory,
            settings=settings,
            postgres=postgres,
        )
    )

    coverage_message = (
        f"{coverage.get('indexed_judgments') or 0:,} / "
        f"{coverage.get('total_judgments') or 0:,} 筆"
    )
    staleness_message = f"狀態：{staleness.get('status') or 'unknown'}"
    legal_message = (
        f"{legal_index.get('points_count') or 0:,} points · "
        f"{legal_index.get('collection') or legal_index.get('alias') or '—'}"
        if legal_index.get("status") == "fresh"
        else "索引待更新：" + ", ".join(legal_index.get("reasons") or [])
    )
    pipeline_stages = [
        _pipeline_stage(
            key="postgres",
            label="PostgreSQL 指標",
            caption="連線、資料量與最近執行",
            color="#3b82f6",
            status=_service_stage_status(postgres.get("status")),
            started_at=postgres_started_at,
            finished_at=postgres_finished_at,
            duration_ms=postgres_ms,
            message=str(postgres.get("detail") or ""),
        ),
        _pipeline_stage(
            key="parquet",
            label="Parquet 掃描",
            caption="manifest 與原始檔案統計",
            color="#ec4899",
            status=_service_stage_status(parquet.get("status")),
            started_at=parquet_started_at,
            finished_at=parquet_finished_at,
            duration_ms=parquet_ms,
            message=str(parquet.get("detail") or ""),
        ),
        _pipeline_stage(
            key="version",
            label="Active 索引版本",
            caption="judgment alias／collection 查詢",
            color="#06b6d4",
            status="success",
            started_at=version_started_at,
            finished_at=version_finished_at,
            duration_ms=version_ms,
            message=(
                f"v{active_index.get('version_id')}"
                if active_index and active_index.get("version_id")
                else f"使用預設 collection：{qdrant_collection}"
            ),
        ),
        _pipeline_stage(
            key="qdrant",
            label="Qdrant 連線",
            caption="collection、points 與維度",
            color="#f59e0b",
            status=_service_stage_status(qdrant.get("status")),
            started_at=qdrant_started_at,
            finished_at=qdrant_finished_at,
            duration_ms=qdrant_ms,
            message=str(qdrant.get("detail") or ""),
        ),
        _pipeline_stage(
            key="embedding",
            label="Embedding 檢查",
            caption="Embedding 模型",
            color="#0ea5e9",
            status=_service_stage_status(embedding.get("status")),
            started_at=embedding_started_at,
            finished_at=embedding_finished_at,
            duration_ms=embedding_ms,
            message=str(embedding.get("detail") or ""),
        ),
        _pipeline_stage(
            key="llm",
            label="LLM 檢查",
            caption="Chat 模型",
            color="#16a34a",
            status=_service_stage_status(llm.get("status")),
            started_at=llm_started_at,
            finished_at=llm_finished_at,
            duration_ms=llm_ms,
            message=str(llm.get("detail") or ""),
        ),
        _pipeline_stage(
            key="reranker",
            label="Reranker 檢查",
            caption="BGE rerank 服務",
            color="#8b5cf6",
            status=_service_stage_status(rerank.get("status")),
            started_at=rerank_started_at,
            finished_at=rerank_finished_at,
            duration_ms=rerank_ms,
            message=str(rerank.get("detail") or ""),
        ),
        _pipeline_stage(
            key="rag",
            label="RAG 服務彙整",
            caption="檢索、引用與回答服務",
            color="#0f766e",
            status=_service_stage_status(rag.get("status")),
            started_at=rag_started_at,
            finished_at=rag_finished_at,
            duration_ms=rag_ms,
            message=str(rag.get("detail") or ""),
        ),
        _pipeline_stage(
            key="coverage",
            label="索引覆蓋率",
            caption="PostgreSQL × Qdrant 筆數",
            color="#a78bfa",
            status="failed" if coverage_failed else "success",
            started_at=coverage_started_at,
            finished_at=coverage_finished_at,
            duration_ms=coverage_ms,
            message=coverage_message,
        ),
        _pipeline_stage(
            key="staleness",
            label="索引鮮度",
            caption="pending／missing／changed",
            color="#64748b",
            status="failed" if staleness_failed else "success",
            started_at=staleness_started_at,
            finished_at=staleness_finished_at,
            duration_ms=staleness_ms,
            message=staleness_message,
        ),
        _pipeline_stage(
            key="legal_index",
            label="法規／命令索引",
            caption="alias、points 與版本",
            color="#14b8a6",
            status=_service_stage_status(legal_index.get("status")),
            started_at=legal_started_at,
            finished_at=legal_finished_at,
            duration_ms=legal_ms,
            message=legal_message,
        ),
    ]
    pipeline_finished_at = datetime.now(timezone.utc)
    pipeline_total_ms = _ms(pipeline_started)
    measured_ms = sum(stage["duration_ms"] for stage in pipeline_stages)
    overhead_ms = max(0, pipeline_total_ms - measured_ms)
    if overhead_ms:
        pipeline_stages.append(
            _pipeline_stage(
                key="assemble",
                label="彙整狀態回應",
                caption="服務、資料量與架構 payload",
                color="#94a3b8",
                status="success",
                started_at=pipeline_stages[-1]["finished_at"],
                finished_at=pipeline_finished_at,
                duration_ms=overhead_ms,
                message="組裝服務總覽回應",
            )
        )
    pipeline_payload = {
        "label": "服務總覽載入",
        "started_at": checked_at,
        "finished_at": pipeline_finished_at,
        "total_ms": pipeline_total_ms,
        "stages": pipeline_stages,
    }

    services = [
        {
            "id": "frontend",
            "name": "Frontend SPA",
            "kind": "frontend",
            "status": "operational",
            "latency_ms": None,
            "detail": "Vanilla JS · 10 種科技品牌主題 · IndexedDB",
        },
        {
            "id": "api",
            "name": "FastAPI",
            "kind": "backend",
            "status": "operational",
            "latency_ms": None,
            "detail": "REST API · 查詢建構器 · 靜態資源",
        },
        {
            "id": "postgres",
            "name": "PostgreSQL",
            "kind": "database",
            **{k: postgres[k] for k in ("status", "latency_ms", "detail")},
        },
        {
            "id": "parquet",
            "name": "Parquet",
            "kind": "storage",
            **{k: parquet[k] for k in ("status", "latency_ms", "detail")},
        },
        {
            "id": "qdrant",
            "name": "Qdrant",
            "kind": "vector",
            **qdrant,
        },
        {
            "id": "legal_index",
            "name": "法規／命令索引",
            "kind": "vector",
            "status": (
                "operational"
                if legal_index.get("status") == "fresh"
                else "degraded"
            ),
            "latency_ms": legal_index.get("latency_ms"),
            "detail": (
                f"{legal_index.get('points_count') or 0:,} points · "
                f"{legal_index.get('collection') or legal_index.get('alias') or '—'}"
                if legal_index.get("status") == "fresh"
                else "索引待更新：" + ", ".join(legal_index.get("reasons") or [])
            ),
            "points_count": legal_index.get("points_count"),
            "collection": legal_index.get("collection"),
            "version_id": legal_index.get("version_id"),
            "stale": legal_index.get("stale"),
        },
        {
            "id": "embedding",
            "name": "Embedding",
            "kind": "ai",
            **embedding,
        },
        {
            "id": "reranker",
            "name": "Reranker",
            "kind": "ai",
            **rerank,
        },
        {
            "id": "rag",
            "name": "RAG Engine",
            "kind": "ai",
            **rag,
        },
        {
            "id": "llm",
            "name": "LLM",
            "kind": "ai",
            **llm,
        },
    ]

    core_ok = postgres["status"] == "operational" and parquet["status"] == "operational"
    overall = "operational" if core_ok else "degraded"

    return {
        "status": overall,
        "checked_at": checked_at,
        "version": __version__,
        "environment": os.getenv("APP_ENV", "development"),
        "pipeline": pipeline_payload,
        "services": services,
        "model_summary": model_summary,
        "data": {
            "law_count": postgres["law_count"],
            "order_count": postgres["order_count"],
            "total_current": postgres["total_current"],
            "article_count": postgres["article_count"],
            "version_count": postgres["version_count"],
            "run_count": postgres["run_count"],
            "parquet_files": parquet["file_count"],
            "parquet_bytes": parquet["bytes"],
            "last_version": postgres["last_version"],
            "last_run": postgres["last_run"],
            "judgment_count": coverage["total_judgments"],
            "judgment_indexed_count": coverage["indexed_judgments"],
            "judgment_index_remaining": coverage["remaining_judgments"],
            "judgment_vector_collection": coverage["collection"],
            "judgment_vector_alias": settings.judgment_vector_alias,
            "judgment_vector_version_id": (
                active_index["version_id"] if active_index else None
            ),
            "judgment_vector_version_status": (
                active_index["status"] if active_index else "legacy"
            ),
            "judgment_vector_previous_version_id": (
                active_index.get("previous_version_id") if active_index else None
            ),
            "judgment_vector_model": coverage["model"],
            "judgment_vector_points": qdrant.get("points_count"),
            "judgment_indexed_at": coverage["latest_indexed_at"],
            "judgment_index_fresh": staleness.get("fresh"),
            "judgment_index_pending": staleness.get("pending_judgments"),
            "judgment_index_missing": staleness.get("missing_judgments"),
            "judgment_index_changed": staleness.get("changed_judgments"),
            "judgment_index_stale": staleness.get("stale_judgments"),
            "judgment_index_staleness": staleness,
            "legal_index": legal_index,
            "legal_article_vector_alias": legal_index.get("alias"),
            "legal_article_vector_collection": legal_index.get("collection"),
            "legal_article_vector_version_id": legal_index.get("version_id"),
            "legal_article_indexed_count": legal_index.get("points_count"),
            "legal_article_count": legal_index.get("article_count"),
            "legal_article_indexed_at": legal_index.get("indexed_at"),
            "legal_article_stale": legal_index.get("stale"),
        },
        "recent_runs": postgres["recent_runs"],
        "architecture": {
            "layers": [
                {
                    "id": "client",
                    "label": "Client · Browser",
                    "nodes": [
                        {
                            "label": "RAG Console SPA",
                            "detail": "#/rag、#/data、#/processing、#/status",
                        },
                        {
                            "label": "API Client + SSE",
                            "detail": "REST 請求與即時事件訂閱",
                        },
                        {
                            "label": "IndexedDB",
                            "detail": "提問歷史與 audit_events",
                        },
                        {
                            "label": "Standalone Frontend",
                            "detail": "file:// 與靜態部署 bundle",
                        },
                    ],
                },
                {
                    "id": "api",
                    "label": "Application · FastAPI",
                    "nodes": [
                        {
                            "label": "REST API · :9200",
                            "service": "api",
                            "detail": "query、catalog、performance、benchmark、quality、processing",
                        },
                        {
                            "label": "SSE Broker",
                            "service": "api",
                            "detail": "processing、status、llama-server、test-runs、Last-Event-ID",
                        },
                        {
                            "label": "RAG Endpoint",
                            "service": "rag",
                            "detail": "/api/rag/query[/stream]",
                        },
                        {
                            "label": "Power Agent · :9201",
                            "detail": "主機 start／stop 控制",
                        },
                    ],
                },
                {
                    "id": "pipeline",
                    "label": "Pipelines · RAG / Batch",
                    "nodes": [
                        {
                            "label": "RAG Orchestrator",
                            "service": "rag",
                            "detail": "法規比對、檢索、引用驗證",
                        },
                        {
                            "label": "Processing Runtime",
                            "detail": "import、index、download、backfill",
                        },
                        {
                            "label": "Embedding / Rerank / LLM",
                            "service": "embedding",
                            "detail": "bge-m3、reranker-v2-m3、gemma3",
                        },
                        {
                            "label": "Scheduler / CLI",
                            "detail": "up.sh、cron、judgment-* 指令",
                        },
                    ],
                },
                {
                    "id": "data",
                    "label": "Data · Storage",
                    "nodes": [
                        {
                            "label": "PostgreSQL",
                            "service": "postgres",
                            "detail": "current、versions、settings",
                        },
                        {
                            "label": "Qdrant",
                            "service": "qdrant",
                            "detail": "judgments_current → vNNN",
                        },
                        {
                            "label": "Parquet / Files",
                            "service": "parquet",
                            "detail": "raw、delta、manifest、run state、SQLite journal",
                        },
                        {
                            "label": "llama-server Hosts",
                            "service": "llm",
                            "detail": "x570／本機 fallback",
                        },
                    ],
                },
            ],
            "flow": ["client", "api", "pipeline", "data"],
        },
        "endpoints": [
            {"method": "GET", "path": "/api/status", "label": "服務狀態"},
            {"method": "GET", "path": "/api/system-usage", "label": "系統資源使用"},
            {"method": "GET", "path": "/api/catalog", "label": "資料庫與 metadata 選項"},
            {"method": "POST", "path": "/api/query", "label": "資料查詢"},
            {"method": "GET", "path": "/api/law", "label": "單一法規完整報表"},
            {"method": "GET", "path": "/api/judgment", "label": "判決原文報表"},
            {"method": "GET", "path": "/api/quality", "label": "資料品質與統計"},
            {"method": "GET", "path": "/api/performance", "label": "效能報表"},
            {"method": "POST", "path": "/api/rag/query", "label": "RAG 問答"},
        ],
    }
