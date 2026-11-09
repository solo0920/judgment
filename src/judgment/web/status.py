from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import httpx
from sqlalchemy import func, select, text
from sqlalchemy.orm import Session, sessionmaker

from .. import __version__
from ..config import Settings
from ..embeddings import ollama_model_available, ollama_models_detail
from ..index_versions import active_version
from ..judgment_index import index_coverage
from ..models import (
    DownloadRun,
    LawDatasetVersion,
    LawDocument,
)
from ..observability import traced
from ..vector_store import QdrantError, QdrantStore

SERVICE_LABELS = {
    "operational": "正常",
    "degraded": "降級",
    "unavailable": "離線",
    "not_configured": "未設定",
}


def _ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)


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


def _embedding_metrics(*, base_url: str, model: str) -> Dict[str, Any]:
    started = time.perf_counter()
    base_url = base_url.rstrip("/")
    model = model.strip() or "bge-m3"
    if not base_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 EMBEDDING_URL（模型：{model}）",
            "model": model,
        }
    detail = ollama_models_detail(base_url)
    if detail["status"] != "operational":
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"{detail['detail']} · {base_url}",
            "model": model,
        }
    available = ollama_model_available(base_url, model)
    return {
        "status": "operational" if available else "degraded",
        "latency_ms": _ms(started),
        "detail": (
            f"模型：{model} · {base_url}"
            if available
            else f"已連線 {base_url}，但找不到模型 {model}"
        ),
        "model": model,
        "models": detail["models"],
    }


def _llm_metrics(*, base_url: str, model: str) -> Dict[str, Any]:
    started = time.perf_counter()
    base_url = base_url.rstrip("/")
    model = model.strip()
    if not model:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": "未設定 LLM_MODEL",
            "model": None,
        }
    if not base_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": f"未設定 LLM_URL（模型：{model}）",
            "model": model,
        }
    detail = ollama_models_detail(base_url)
    if detail["status"] != "operational":
        return {
            "status": "degraded",
            "latency_ms": _ms(started),
            "detail": f"{detail['detail']} · {base_url}",
            "model": model,
        }
    available = ollama_model_available(base_url, model)
    return {
        "status": "operational" if available else "degraded",
        "latency_ms": _ms(started),
        "detail": (
            f"模型：{model} · {base_url}"
            if available
            else f"已連線 {base_url}，但找不到模型 {model}"
        ),
        "model": model,
        "models": detail["models"],
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
def build_status(
    *,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    settings: Settings,
) -> Dict[str, Any]:
    checked_at = datetime.now(timezone.utc)
    postgres = _postgres_metrics(session_factory)
    parquet = _parquet_metrics(data_dir)

    active_index = active_version(
        session_factory, alias_name=settings.judgment_vector_alias
    )
    qdrant_collection = (
        active_index["physical_collection"]
        if active_index
        else settings.judgment_vector_collection
    )
    embedding_model = settings.embedding_model
    qdrant = _qdrant_metrics(
        qdrant_collection,
        base_url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )
    embedding = _embedding_metrics(
        base_url=settings.embedding_url, model=settings.embedding_model
    )
    llm = _llm_metrics(base_url=settings.llm_url, model=settings.llm_model)
    rag = _rag_metrics(qdrant, embedding, llm)

    try:
        coverage = index_coverage(
            session_factory,
            collection=qdrant_collection,
            model=embedding_model,
            version_id=active_index["version_id"] if active_index else None,
        )
    except Exception:
        coverage = {
            "total_judgments": 0,
            "indexed_judgments": 0,
            "remaining_judgments": 0,
            "collection": qdrant_collection,
            "model": embedding_model,
            "latest_indexed_at": None,
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
            "id": "embedding",
            "name": "Embedding",
            "kind": "ai",
            **embedding,
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
        "services": services,
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
        },
        "recent_runs": postgres["recent_runs"],
        "architecture": {
            "layers": [
                {
                    "id": "client",
                    "label": "Client",
                    "nodes": ["Vanilla JS SPA", "Theme Engine", "IndexedDB"],
                },
                {
                    "id": "api",
                    "label": "Application",
                    "nodes": ["FastAPI", "Query Builder", "Status Aggregator"],
                },
                {
                    "id": "data",
                    "label": "Data",
                    "nodes": ["PostgreSQL", "Parquet", "Qdrant"],
                },
                {
                    "id": "ai",
                    "label": "Intelligence",
                    "nodes": ["Embedding", "Retriever", "RAG Engine", "LLM"],
                },
            ],
            "flow": ["client", "api", "data", "ai"],
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
