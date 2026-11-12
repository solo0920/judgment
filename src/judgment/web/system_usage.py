from __future__ import annotations

import json
import os
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


def _path_bytes(path: Path) -> int:
    root = Path(path).expanduser()
    try:
        if root.is_file():
            return int(root.stat().st_size)
    except OSError:
        return 0
    total = 0
    for dirpath, _dirnames, filenames in os.walk(root):
        for name in filenames:
            try:
                total += os.path.getsize(os.path.join(dirpath, name))
            except OSError:
                continue
    return total


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
    detail_result = _run(
        ["docker", "system", "df", "-v", "--format", "{{json .}}"], timeout=8
    )
    context_result = _run(["docker", "context", "show"], timeout=3)
    inspect_result = _run(
        ["docker", "inspect", "judgment-qdrant"], timeout=6
    )
    qdrant_inspect: Dict[str, Any] = {}
    if inspect_result is not None and inspect_result.returncode == 0:
        try:
            inspected = json.loads(inspect_result.stdout)
            if isinstance(inspected, list) and inspected:
                if isinstance(inspected[0], dict):
                    qdrant_inspect = inspected[0]
        except json.JSONDecodeError:
            qdrant_inspect = {}

    ps_rows = _parse_json_lines(ps_result.stdout if ps_result else "")
    stats_rows = _parse_json_lines(stats_result.stdout if stats_result else "")
    df_rows = _parse_json_lines(df_result.stdout if df_result else "")
    detail_payload: Dict[str, Any] = {}
    if detail_result and detail_result.stdout.strip():
        try:
            raw_detail = json.loads(detail_result.stdout)
            if isinstance(raw_detail, dict):
                detail_payload = raw_detail
        except json.JSONDecodeError:
            detail_payload = {}
    stats_by_name = {
        str(row.get("Name") or ""): row for row in stats_rows if row.get("Name")
    }
    container_sizes = {
        str(row.get("Names") or ""): _parse_bytes(row.get("Size"))
        for row in (detail_payload.get("Containers") or [])
        if row.get("Names")
    }

    containers: List[Dict[str, Any]] = []
    for row in ps_rows:
        name = str(row.get("Names") or "")
        stats = stats_by_name.get(name) or {}
        memory_used, memory_limit = _parse_mem_usage(stats.get("MemUsage"))
        mounts: List[Dict[str, Any]] = []
        if name == "judgment-qdrant" and qdrant_inspect:
            for mount in qdrant_inspect.get("Mounts") or []:
                if not isinstance(mount, dict):
                    continue
                mounts.append(
                    {
                        "type": mount.get("Type") or "",
                        "name": mount.get("Name") or "",
                        "source": mount.get("Source") or "",
                        "destination": mount.get("Destination") or "",
                        "rw": bool(mount.get("RW")),
                    }
                )
        storage_path = next(
            (
                mount["destination"]
                for mount in mounts
                if str(mount.get("destination") or "").rstrip("/")
                == "/qdrant/storage"
            ),
            "/qdrant/storage",
        )
        config = (qdrant_inspect.get("Config") or {}) if qdrant_inspect else {}
        containers.append(
            {
                "id": str(row.get("ID") or "")[:12],
                "name": name,
                "image": row.get("Image") or "",
                "state": row.get("State") or "",
                "status": row.get("Status") or "",
                "service": DOCKER_DB_CONTAINERS.get(name),
                "size_bytes": container_sizes.get(name),
                "cpu_percent": _parse_percent(stats.get("CPUPerc")),
                "memory_used": memory_used,
                "memory_limit": memory_limit,
                "memory_percent": _parse_percent(stats.get("MemPerc")),
                "net_io": stats.get("NetIO") or "",
                "block_io": stats.get("BlockIO") or "",
                "pids": int(stats.get("PIDs") or 0)
                if str(stats.get("PIDs") or "").isdigit()
                else None,
                "working_dir": config.get("WorkingDir") or "",
                "mounts": mounts,
                "storage_path": storage_path,
                "volume_name": next(
                    (mount["name"] for mount in mounts if mount.get("name")),
                    "",
                ),
                "volume_source": next(
                    (
                        mount["source"]
                        for mount in mounts
                        if mount.get("destination") == storage_path
                    ),
                    "",
                ),
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

    image_bytes = sum(
        _parse_bytes(row.get("UniqueSize") or row.get("Size")) or 0
        for row in (detail_payload.get("Images") or [])
    )
    container_bytes = sum(
        _parse_bytes(row.get("Size")) or 0
        for row in (detail_payload.get("Containers") or [])
    )
    build_cache_bytes = sum(
        _parse_bytes(row.get("Size")) or 0
        for row in (detail_payload.get("BuildCache") or [])
    )
    volume_rows = detail_payload.get("Volumes") or []
    volume_bytes = sum(_parse_bytes(row.get("Size")) or 0 for row in volume_rows)
    judgment_volumes: Dict[str, Dict[str, Any]] = {}
    for row in volume_rows:
        name = str(row.get("Name") or "")
        size_bytes = _parse_bytes(row.get("Size"))
        if name.endswith("judgment_pgdata") or name.endswith(
            "judgment_postgres_data"
        ):
            judgment_volumes["postgres"] = {
                "name": name,
                "size": row.get("Size") or "",
                "size_bytes": size_bytes,
            }
        elif name.endswith("judgment_qdrant"):
            qdrant_container = _find_container(containers, "judgment-qdrant") or {}
            judgment_volumes["qdrant"] = {
                "name": name,
                "size": row.get("Size") or "",
                "size_bytes": size_bytes,
                "container": "judgment-qdrant",
                "container_path": qdrant_container.get("storage_path") or "",
                "host_path": qdrant_container.get("volume_source") or "",
            }

    return {
        "available": True,
        "detail": f"Docker {version.stdout.strip() or 'daemon'}",
        "context": (
            context_result.stdout.strip()
            if context_result is not None and context_result.returncode == 0
            else "default"
        ),
        "containers": containers,
        "system": system,
        "breakdown": {
            "images_bytes": image_bytes,
            "containers_bytes": container_bytes,
            "build_cache_bytes": build_cache_bytes,
            "volumes_bytes": volume_bytes,
            "layers_bytes": image_bytes + container_bytes + build_cache_bytes,
        },
        "judgment_volumes": judgment_volumes,
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
        "hostname": platform.node(),
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
    judgment_volumes = docker.get("judgment_volumes") or {}
    postgres_volume = judgment_volumes.get("postgres") or {}
    qdrant_volume = judgment_volumes.get("qdrant") or {}

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
            "volume_name": postgres_volume.get("name"),
            "volume_bytes": postgres_volume.get("size_bytes"),
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
            "volume_name": qdrant_volume.get("name"),
            "volume_bytes": qdrant_volume.get("size_bytes"),
            "container_path": qdrant_volume.get("container_path"),
            "host_path": qdrant_volume.get("host_path"),
            "docker_context": docker.get("context"),
            "mounts": (qdrant_container or {}).get("mounts") or [],
            **qdrant,
        },
    ]
    qdrant_storage = {
        "host": platform.node(),
        "docker_context": docker.get("context") or "default",
        "container": "judgment-qdrant",
        "container_id": (qdrant_container or {}).get("id"),
        "container_state": (qdrant_container or {}).get("state") or "unknown",
        "image": (qdrant_container or {}).get("image") or "",
        "container_path": (qdrant_container or {}).get("storage_path")
        or qdrant_volume.get("container_path")
        or "",
        "working_dir": (qdrant_container or {}).get("working_dir") or "",
        "volume_name": qdrant_volume.get("name") or "",
        "volume_size": qdrant_volume.get("size") or "",
        "volume_bytes": qdrant_volume.get("size_bytes"),
        "host_path": qdrant_volume.get("host_path") or "",
        "mounts": (qdrant_container or {}).get("mounts") or [],
        "collection": qdrant.get("collection"),
        "alias": settings.judgment_vector_alias,
        "points_count": qdrant.get("points_count"),
        "segments_count": qdrant.get("segments_count"),
    }

    project_root = Path(__file__).resolve().parents[3]
    frontend_path = project_root / "frontend"
    backend_path = project_root / "src" / "judgment"
    law_parquet_path = Path(data_dir) / "raw_parquet"
    judgment_data_root = Path(settings.judgment_data_dir).expanduser()
    judgment_parquet_path = judgment_data_root / "parquet" / "raw_judgments"
    if not judgment_parquet_path.exists():
        legacy_path = judgment_data_root / "raw_parquet"
        if legacy_path.exists():
            judgment_parquet_path = legacy_path
    law_parquet_path = law_parquet_path.resolve()
    judgment_parquet_path = judgment_parquet_path.resolve()
    frontend_bytes = _path_bytes(frontend_path)
    backend_bytes = _path_bytes(backend_path)
    law_parquet_bytes = _path_bytes(law_parquet_path)
    judgment_parquet_bytes = _path_bytes(judgment_parquet_path)
    parquet_bytes = law_parquet_bytes + judgment_parquet_bytes
    docker_breakdown = docker.get("breakdown") or {}
    docker_layers_bytes = int(docker_breakdown.get("layers_bytes") or 0)
    postgres_volume_bytes = int(postgres_volume.get("size_bytes") or 0)
    qdrant_volume_bytes = int(qdrant_volume.get("size_bytes") or 0)
    judgment_total_bytes = (
        frontend_bytes
        + backend_bytes
        + docker_layers_bytes
        + postgres_volume_bytes
        + qdrant_volume_bytes
        + parquet_bytes
    )
    disks = _disk_usage(
        [
            ("系統磁碟", Path("/")),
            ("專案目錄", project_root),
            ("資料目錄", Path(data_dir)),
        ]
    )
    filesystem = disks[0] if disks else {}

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
        "qdrant_storage": qdrant_storage,
        "storage": {
            "application": {
                "frontend_bytes": frontend_bytes,
                "frontend_path": str(frontend_path),
                "backend_bytes": backend_bytes,
                "backend_path": str(backend_path),
            },
            "parquet": {
                "law_bytes": law_parquet_bytes,
                "law_path": str(law_parquet_path),
                "judgment_bytes": judgment_parquet_bytes,
                "judgment_path": str(judgment_parquet_path),
                "total_bytes": parquet_bytes,
            },
            "docker": {
                "layers_bytes": docker_layers_bytes,
                "images_bytes": int(docker_breakdown.get("images_bytes") or 0),
                "containers_bytes": int(
                    docker_breakdown.get("containers_bytes") or 0
                ),
                "build_cache_bytes": int(
                    docker_breakdown.get("build_cache_bytes") or 0
                ),
            },
            "volumes": {
                "postgres": postgres_volume,
                "qdrant": qdrant_volume,
                "total_bytes": postgres_volume_bytes + qdrant_volume_bytes,
            },
            "judgment_total_bytes": judgment_total_bytes,
            "filesystem": {
                "used_bytes": filesystem.get("used"),
                "total_bytes": filesystem.get("total"),
                "free_bytes": filesystem.get("free"),
            },
        },
        "paths": {
            "project": str(project_root),
            "data": str(Path(data_dir).expanduser().resolve()),
            "docker_cli": shutil.which("docker") or None,
        },
    }
