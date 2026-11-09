from __future__ import annotations

import json
import platform
import re
import shutil
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import psutil
from sqlalchemy import text
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..observability import traced
from ..vector_store import QdrantError, QdrantStore

DOCKER_DB_CONTAINERS = {
    "judgment-postgres": "postgres",
    "judgment-qdrant": "qdrant",
}

_SIZE_UNITS = {
    "b": 1,
    "kb": 1000,
    "kib": 1024,
    "mb": 1000**2,
    "mib": 1024**2,
    "gb": 1000**3,
    "gib": 1024**3,
    "tb": 1000**4,
    "tib": 1024**4,
}
_SIZE_RE = re.compile(r"([\d.]+)\s*([A-Za-z]+)")


def _run(command: List[str], timeout: float = 8.0) -> Optional[subprocess.CompletedProcess]:
    try:
        return subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


def _parse_percent(value: Any) -> Optional[float]:
    text = str(value or "").strip().replace("%", "")
    try:
        return round(float(text), 2)
    except (TypeError, ValueError):
        return None


def _parse_bytes(value: Any) -> Optional[int]:
    text = str(value or "").strip()
    match = _SIZE_RE.fullmatch(text)
    if not match:
        return None
    number, unit = match.groups()
    multiplier = _SIZE_UNITS.get(unit.lower())
    if multiplier is None:
        return None
    try:
        return int(float(number) * multiplier)
    except ValueError:
        return None


def _parse_mem_usage(value: Any) -> Tuple[Optional[int], Optional[int]]:
    parts = [part.strip() for part in str(value or "").split("/")]
    if len(parts) != 2:
        return None, None
    return _parse_bytes(parts[0]), _parse_bytes(parts[1])


def _parse_json_lines(output: str) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for line in str(output or "").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict):
            rows.append(item)
    return rows


def _docker_usage() -> Dict[str, Any]:
    if shutil.which("docker") is None:
        return {
            "available": False,
            "detail": "找不到 docker 指令",
            "containers": [],
            "system": [],
        }
    version = _run(["docker", "version", "--format", "{{.Server.Version}}"], timeout=4)
    if version is None or version.returncode != 0:
        return {
            "available": False,
            "detail": "Docker daemon 無法連線",
            "containers": [],
            "system": [],
        }

    ps_result = _run(
        ["docker", "ps", "--no-trunc", "--format", "{{json .}}"], timeout=6
    )
    stats_result = _run(
        ["docker", "stats", "--no-stream", "--format", "{{json .}}"], timeout=12
    )
    df_result = _run(
        ["docker", "system", "df", "--format", "{{json .}}"], timeout=8
    )

    ps_rows = _parse_json_lines(ps_result.stdout if ps_result else "")
    stats_rows = _parse_json_lines(stats_result.stdout if stats_result else "")
    df_rows = _parse_json_lines(df_result.stdout if df_result else "")
    stats_by_name = {
        str(row.get("Name") or ""): row for row in stats_rows if row.get("Name")
    }

    containers: List[Dict[str, Any]] = []
    for row in ps_rows:
        name = str(row.get("Names") or "")
        stats = stats_by_name.get(name) or {}
        memory_used, memory_limit = _parse_mem_usage(stats.get("MemUsage"))
        containers.append(
            {
                "id": str(row.get("ID") or "")[:12],
                "name": name,
                "image": row.get("Image") or "",
                "state": row.get("State") or "",
                "status": row.get("Status") or "",
                "service": DOCKER_DB_CONTAINERS.get(name),
                "cpu_percent": _parse_percent(stats.get("CPUPerc")),
                "memory_used": memory_used,
                "memory_limit": memory_limit,
                "memory_percent": _parse_percent(stats.get("MemPerc")),
                "net_io": stats.get("NetIO") or "",
                "block_io": stats.get("BlockIO") or "",
                "pids": int(stats.get("PIDs") or 0)
                if str(stats.get("PIDs") or "").isdigit()
                else None,
            }
        )

    system = [
        {
            "type": row.get("Type") or "",
            "count": int(row.get("TotalCount") or 0),
            "active": int(row.get("Active") or 0),
            "size": row.get("Size") or "",
            "reclaimable": row.get("Reclaimable") or "",
        }
        for row in df_rows
    ]
    return {
        "available": True,
        "detail": f"Docker {version.stdout.strip() or 'daemon'}",
        "containers": containers,
        "system": system,
    }


def _find_container(
    containers: List[Dict[str, Any]], name: str
) -> Optional[Dict[str, Any]]:
    return next((item for item in containers if item.get("name") == name), None)


def _postgres_usage(session_factory: sessionmaker[Session]) -> Dict[str, Any]:
    started = time.perf_counter()
    try:
        with session_factory() as session:
            session.execute(text("SELECT 1"))
            database = str(session.scalar(text("SELECT current_database()")) or "")
            size_bytes = int(
                session.scalar(text("SELECT pg_database_size(current_database())"))
                or 0
            )
            connections = int(
                session.scalar(
                    text(
                        "SELECT count(*) FROM pg_stat_activity "
                        "WHERE datname = current_database()"
                    )
                )
                or 0
            )
            tables = [
                {"name": str(row[0]), "bytes": int(row[1] or 0)}
                for row in session.execute(
                    text(
                        "SELECT relname, pg_total_relation_size(relid) AS bytes "
                        "FROM pg_catalog.pg_statio_user_tables "
                        "ORDER BY bytes DESC LIMIT 6"
                    )
                ).all()
            ]
        return {
            "status": "operational",
            "latency_ms": int((time.perf_counter() - started) * 1000),
            "detail": f"資料庫 {database or 'judgment'}",
            "database": database,
            "storage_bytes": size_bytes,
            "connections": connections,
            "tables": tables,
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "latency_ms": int((time.perf_counter() - started) * 1000),
            "detail": f"無法查詢：{exc.__class__.__name__}",
            "database": None,
            "storage_bytes": None,
            "connections": None,
            "tables": [],
        }


def _qdrant_usage(settings: Settings) -> Dict[str, Any]:
    started = time.perf_counter()
    collection = settings.judgment_vector_collection
    if not settings.qdrant_url:
        return {
            "status": "not_configured",
            "latency_ms": None,
            "detail": "未設定 QDRANT_URL",
            "collection": collection,
            "collections": 0,
            "points_count": None,
            "vectors_count": None,
            "segments_count": None,
        }
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=5.0,
    )
    try:
        collections = store.list_collections()
        info = store.collection_info(collection) or {}
        return {
            "status": "operational",
            "latency_ms": int((time.perf_counter() - started) * 1000),
            "detail": f"Collection {collection}",
            "collection": collection,
            "collections": len(collections),
            "points_count": info.get("points_count"),
            "vectors_count": info.get("vectors_count"),
            "segments_count": info.get("segments_count"),
        }
    except QdrantError as exc:
        return {
            "status": "degraded",
            "latency_ms": int((time.perf_counter() - started) * 1000),
            "detail": f"{exc.__class__.__name__} · {settings.qdrant_url}",
            "collection": collection,
            "collections": None,
            "points_count": None,
            "vectors_count": None,
            "segments_count": None,
        }


def _disk_usage(paths: List[Tuple[str, Path]]) -> List[Dict[str, Any]]:
    entries: List[Dict[str, Any]] = []
    seen_devices = set()
    for label, path in paths:
        try:
            resolved = Path(path).expanduser().resolve()
            if not resolved.exists():
                continue
            device = resolved.stat().st_dev
            if device in seen_devices:
                continue
            seen_devices.add(device)
            usage = shutil.disk_usage(resolved)
            entries.append(
                {
                    "label": label,
                    "path": str(resolved),
                    "total": int(usage.total),
                    "used": int(usage.used),
                    "free": int(usage.free),
                    "percent": round((usage.used / usage.total) * 100, 1)
                    if usage.total
                    else 0,
                }
            )
        except OSError:
            continue
    return entries


def _host_usage() -> Dict[str, Any]:
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    try:
        load_1, load_5, load_15 = psutil.getloadavg()
    except (AttributeError, OSError):
        load_1 = load_5 = load_15 = None
    return {
        "platform": platform.platform(),
        "python": platform.python_version(),
        "cpu": {
            "percent": psutil.cpu_percent(interval=0.2),
            "physical_cores": psutil.cpu_count(logical=False),
            "logical_cores": psutil.cpu_count(logical=True),
            "load_1": round(load_1, 2) if load_1 is not None else None,
            "load_5": round(load_5, 2) if load_5 is not None else None,
            "load_15": round(load_15, 2) if load_15 is not None else None,
        },
        "memory": {
            "total": int(memory.total),
            "used": int(memory.used),
            "available": int(memory.available),
            "percent": round(float(memory.percent), 1),
        },
        "swap": {
            "total": int(swap.total),
            "used": int(swap.used),
            "free": int(swap.free),
            "percent": round(float(swap.percent), 1),
        },
        "processes": len(psutil.pids()),
        "uptime_seconds": int(time.time() - psutil.boot_time()),
    }


@traced("system.usage", module=__name__, params_fn=lambda **_: {})
def build_system_usage(
    *,
    session_factory: sessionmaker[Session],
    data_dir: Path,
    settings: Settings,
) -> Dict[str, Any]:
    docker = _docker_usage()
    containers = docker.get("containers") or []
    postgres = _postgres_usage(session_factory)
    qdrant = _qdrant_usage(settings)

    postgres_container = _find_container(containers, "judgment-postgres")
    qdrant_container = _find_container(containers, "judgment-qdrant")

    databases = [
        {
            "id": "postgres",
            "name": "PostgreSQL",
            "kind": "relational",
            "container": "judgment-postgres",
            "container_status": (postgres_container or {}).get("state") or "unknown",
            "cpu_percent": (postgres_container or {}).get("cpu_percent"),
            "memory_used": (postgres_container or {}).get("memory_used"),
            "memory_limit": (postgres_container or {}).get("memory_limit"),
            "memory_percent": (postgres_container or {}).get("memory_percent"),
            **postgres,
        },
        {
            "id": "qdrant",
            "name": "Qdrant",
            "kind": "vector",
            "container": "judgment-qdrant",
            "container_status": (qdrant_container or {}).get("state") or "unknown",
            "cpu_percent": (qdrant_container or {}).get("cpu_percent"),
            "memory_used": (qdrant_container or {}).get("memory_used"),
            "memory_limit": (qdrant_container or {}).get("memory_limit"),
            "memory_percent": (qdrant_container or {}).get("memory_percent"),
            **qdrant,
        },
    ]

    project_root = Path(__file__).resolve().parents[3]
    disks = _disk_usage(
        [
            ("系統磁碟", Path("/")),
            ("專案目錄", project_root),
            ("資料目錄", Path(data_dir)),
        ]
    )

    overall = "operational"
    if postgres["status"] == "unavailable":
        overall = "degraded"
    if qdrant["status"] in {"degraded", "unavailable"}:
        overall = "degraded"

    return {
        "status": overall,
        "checked_at": datetime.now(timezone.utc),
        "host": _host_usage(),
        "disk": disks,
        "docker": docker,
        "databases": databases,
        "paths": {
            "project": str(project_root),
            "data": str(Path(data_dir).expanduser().resolve()),
            "docker_cli": shutil.which("docker") or None,
        },
    }
