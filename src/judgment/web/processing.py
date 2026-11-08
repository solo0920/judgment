from __future__ import annotations

import json
import logging
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from sqlalchemy import func, select

from ..config import Settings
from ..judgment_raw_parquet import count_raw_manifests, latest_raw_manifest, raw_judgment_totals
from ..models import JudgmentDocument, LawDatasetVersion, LawDocument
from ..processing_state import (
    BRANCH_STAGES,
    STAGE_CATALOG,
    ProcessingStateError,
    ProcessingStateStore,
    _stage_for,
    default_state_path,
    elapsed_ms,
    now_iso,
    parse_iso,
    pid_alive,
    stage_seconds,
    state_file_status,
)

logger = logging.getLogger(__name__)

BRANCH_META: Dict[str, Dict[str, str]] = {
    "judgment": {
        "label": "判決",
        "icon": "database",
        "description": "RAR → 原始 Parquet 備份 → DuckDB 候選篩選 → PostgreSQL metadata → Qdrant",
    },
    "law": {
        "label": "法規",
        "icon": "layers",
        "description": "線上比對 → 下載 → 原始 Parquet → 解析 → PostgreSQL",
    },
    "order": {
        "label": "命令",
        "icon": "file",
        "description": "線上比對 → 下載 → 原始 Parquet → 解析 → PostgreSQL",
    },
}

STATE_RUNNING = "running"
TERMINAL_STATUSES = {"success", "failed", "interrupted", "no_change", "stale"}


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _percent(current: Any, total: Any) -> Optional[float]:
    try:
        current_value = float(current)
        total_value = float(total)
    except (TypeError, ValueError):
        return None
    if total_value <= 0:
        return None
    return round(max(0.0, min(100.0, 100.0 * current_value / total_value)), 1)


def _safe_int(value: Any) -> Optional[int]:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _normalized_runs(state: Dict[str, Any], now: datetime) -> List[Dict[str, Any]]:
    runs: List[Dict[str, Any]] = []
    for raw in state.get("runs") or []:
        if not isinstance(raw, dict):
            continue
        run = deepcopy(raw)
        alive = run.get("status") == STATE_RUNNING and pid_alive(run.get("pid"))
        run["alive"] = bool(alive)
        run["stale"] = run.get("status") == STATE_RUNNING and not alive
        if run["stale"]:
            run["status"] = "stale"
            message = str(run.get("message") or "").strip()
            note = "狀態檔顯示執行中，但程序已不存在。"
            run["message"] = f"{message}；{note}" if message else note
            for stage in (run.get("stages") or {}).values():
                if isinstance(stage, dict) and stage.get("status") == "running":
                    stage["status"] = "stale"
                    stage["finished_at"] = stage.get("finished_at") or now_iso()
                    if not stage.get("duration_ms"):
                        stage["duration_ms"] = elapsed_ms(
                            stage.get("started_at"), stage.get("finished_at")
                        )
            for archive in (run.get("archives") or {}).values():
                if not isinstance(archive, dict):
                    continue
                if archive.get("status") == "running":
                    archive["status"] = "stale"
                    archive["finished_at"] = archive.get("finished_at") or now_iso()
                    archive["duration_ms"] = elapsed_ms(
                        archive.get("started_at"), archive.get("finished_at")
                    )
                for stage in (archive.get("stages") or {}).values():
                    if isinstance(stage, dict) and stage.get("status") == "running":
                        stage["status"] = "stale"
                        stage["finished_at"] = stage.get("finished_at") or now_iso()
                        if not stage.get("duration_ms"):
                            stage["duration_ms"] = elapsed_ms(
                                stage.get("started_at"), stage.get("finished_at")
                            )
        started = parse_iso(run.get("started_at"))
        run["_sort_key"] = started or datetime.min.replace(tzinfo=timezone.utc)
        runs.append(run)
    runs.sort(key=lambda item: item["_sort_key"], reverse=True)
    for run in runs:
        run.pop("_sort_key", None)
    return runs


def _public_run(run: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if run is None:
        return None
    return {
        "id": run.get("id"),
        "branch": run.get("branch"),
        "kind": run.get("kind"),
        "title": run.get("title"),
        "status": run.get("status"),
        "alive": bool(run.get("alive")),
        "stale": bool(run.get("stale")),
        "external": bool(run.get("external")),
        "pid": run.get("pid"),
        "started_at": run.get("started_at"),
        "finished_at": run.get("finished_at"),
        "duration_ms": int(run.get("duration_ms") or 0),
        "current_stage": run.get("current_stage") or "",
        "message": run.get("message") or "",
        "counts": deepcopy(run.get("counts") or {}),
        "meta": deepcopy(run.get("meta") or {}),
        "archive_count": len(run.get("archives") or {}),
    }


def _active_run(
    runs: Sequence[Dict[str, Any]],
    *,
    branch: Optional[str] = None,
    kind: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    for run in runs:
        if run.get("status") != STATE_RUNNING or not run.get("alive"):
            continue
        if branch and run.get("branch") != branch:
            continue
        if kind and run.get("kind") != kind:
            continue
        return run
    return None


def _latest_run(
    runs: Sequence[Dict[str, Any]],
    *,
    branch: Optional[str] = None,
    kind: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    for run in runs:
        if branch and run.get("branch") != branch:
            continue
        if kind and run.get("kind") != kind:
            continue
        return run
    return None


PROCESS_MATCHERS = (
    ("update", ("judgment.processing_update",)),
    ("index", ("judgment-index-vectors", "judgment.judgment_index")),
    ("import", ("judgment-import-judgments", "judgment.judgment_import")),
    ("download", ("judgment-law-download", "judgment.law_download.cli")),
)

PROCESS_TITLES = {
    "update": "資料更新",
    "index": "Qdrant 向量索引",
    "import": "判決 RAR 匯入",
    "download": "法規／命令下載",
}


def _parse_etime(value: str) -> Optional[int]:
    """Convert ``ps`` elapsed time (``MM:SS``/``HH:MM:SS``/``D-HH:MM:SS``)."""

    text = str(value or "").strip()
    if not text:
        return None
    days = 0
    if "-" in text:
        raw_days, text = text.split("-", 1)
        try:
            days = int(raw_days)
        except ValueError:
            return None
    parts = text.split(":")
    if len(parts) not in {2, 3}:
        return None
    try:
        numbers = [int(part) for part in parts]
    except ValueError:
        return None
    if len(numbers) == 2:
        hours, minutes, seconds = 0, numbers[0], numbers[1]
    else:
        hours, minutes, seconds = numbers
    return max(0, days * 86400 + hours * 3600 + minutes * 60 + seconds)


def _classify_process(command: str) -> Optional[Dict[str, str]]:
    for kind, needles in PROCESS_MATCHERS:
        if not any(needle in command for needle in needles):
            continue
        branch = "system"
        title = PROCESS_TITLES[kind]
        if kind == "index" or kind == "import":
            branch = "judgment"
        elif kind == "download":
            source = ""
            parts = command.split()
            if "--source" in parts:
                try:
                    source = parts[parts.index("--source") + 1]
                except (IndexError, ValueError):
                    source = ""
            if source == "law":
                branch = "law"
                title = "法規下載"
            elif source == "order":
                branch = "order"
                title = "命令下載"
        return {"kind": kind, "branch": branch, "title": title}
    return None


def _pipeline_processes_from_ps(
    output: str,
    *,
    now: Optional[datetime] = None,
    exclude_pids: Optional[Sequence[int]] = None,
) -> List[Dict[str, Any]]:
    """Parse ``ps -axo pid=,etime=,command=`` into detected pipeline jobs."""

    moment = now or datetime.now(timezone.utc)
    excluded = {int(pid) for pid in (exclude_pids or []) if pid}
    excluded.add(os.getpid())
    found: Dict[str, Dict[str, Any]] = {}
    for line in str(output or "").splitlines():
        match = re.match(r"^\s*(\d+)\s+(\S+)\s+(.*)$", line)
        if not match:
            continue
        pid = int(match.group(1))
        if pid in excluded:
            continue
        command = match.group(3)
        classified = _classify_process(command)
        if classified is None:
            continue
        key = f"{classified['kind']}:{classified['branch']}"
        if key in found:
            continue
        elapsed = _parse_etime(match.group(2))
        started_at = (
            (moment - timedelta(seconds=elapsed)).astimezone(timezone.utc).isoformat()
            if elapsed is not None
            else None
        )
        found[key] = {
            "pid": pid,
            "kind": classified["kind"],
            "branch": classified["branch"],
            "title": classified["title"],
            "command": command,
            "elapsed_ms": int(elapsed or 0) * 1000,
            "started_at": started_at,
        }
    return sorted(found.values(), key=lambda item: item["pid"])


def _detect_external_processes() -> List[Dict[str, Any]]:
    executable = shutil.which("ps")
    if not executable:
        return []
    try:
        completed = subprocess.run(
            [executable, "-axo", "pid=,etime=,command="],
            capture_output=True,
            text=True,
            timeout=15,
        )
    except (OSError, subprocess.SubprocessError):
        return []
    if completed.returncode != 0:
        return []
    return _pipeline_processes_from_ps(completed.stdout)


def _external_run(
    process: Dict[str, Any],
    *,
    index: Dict[str, Any],
) -> Dict[str, Any]:
    started_at = process.get("started_at")
    pid = int(process.get("pid") or 0)
    run: Dict[str, Any] = {
        "id": f"external-{pid}-{process.get('kind')}",
        "branch": process.get("branch") or "system",
        "kind": process.get("kind") or "external",
        "title": process.get("title") or "外部處理程序",
        "status": STATE_RUNNING,
        "pid": pid,
        "started_at": started_at,
        "finished_at": None,
        "duration_ms": int(process.get("elapsed_ms") or 0),
        "current_stage": "",
        "message": (
            f"偵測到外部程序（PID {pid}）；此程序未寫入處理狀態檔，"
            "僅顯示可驗證的整體進度。"
        ),
        "stages": {},
        "archives": {},
        "counts": {},
        "meta": {
            "source": "process",
            "command": process.get("command") or "",
        },
        "updated_at": started_at,
        "alive": True,
        "stale": False,
        "external": True,
        "archive_count": 0,
    }
    if process.get("kind") == "index":
        stage = _stage_for("qdrant")
        stage.update(
            {
                "status": STATE_RUNNING,
                "started_at": started_at,
                "current": index.get("indexed"),
                "total": index.get("total"),
                "message": (
                    f"外部索引程序（PID {pid}）執行中；"
                    "以下為 Qdrant 的整體覆蓋率，非本次 run 單獨進度。"
                ),
            }
        )
        run["stages"]["qdrant"] = stage
        run["current_stage"] = "qdrant"
    return run


def _attach_external_runs(
    runs: Sequence[Dict[str, Any]],
    *,
    index: Dict[str, Any],
    now: datetime,
    processes: Optional[Sequence[Dict[str, Any]]] = None,
) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    detected = (
        list(processes) if processes is not None else _detect_external_processes()
    )
    tracked_pids = {
        int(run.get("pid") or 0)
        for run in runs
        if isinstance(run, dict)
        and run.get("status") == STATE_RUNNING
        and run.get("pid")
    }
    external = [
        process
        for process in detected
        if int(process.get("pid") or 0) not in tracked_pids
    ]
    synthetic = [_external_run(process, index=index) for process in external]
    return synthetic + list(runs), external


def _stage_view(stage: Dict[str, Any], run: Dict[str, Any]) -> Dict[str, Any]:
    key = str(stage.get("key") or "")
    status = str(stage.get("status") or "pending")
    if status == "pending" and run.get("status") in TERMINAL_STATUSES:
        status = "skipped"
    current = _safe_int(stage.get("current"))
    total = _safe_int(stage.get("total"))
    percent = _percent(current, total)
    if percent is None and status == "success":
        percent = 100.0
    return {
        "key": key,
        "label": stage.get("label") or STAGE_CATALOG.get(key, {}).get("label", key),
        "color": stage.get("color") or STAGE_CATALOG.get(key, {}).get("color", "#64748b"),
        "unit": stage.get("unit") or STAGE_CATALOG.get(key, {}).get("unit", ""),
        "status": status,
        "current": current,
        "total": total,
        "percent": percent,
        "message": stage.get("message") or "",
        "duration_ms": int(stage.get("duration_ms") or 0),
        "started_at": stage.get("started_at"),
        "finished_at": stage.get("finished_at"),
        "run_id": run.get("id"),
        "run_status": run.get("status"),
        "stats": [],
    }


def _idle_node(
    key: str,
    *,
    status: str = "idle",
    message: str = "",
    current: Optional[int] = None,
    total: Optional[int] = None,
    stats: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    definition = STAGE_CATALOG.get(key, {})
    return {
        "key": key,
        "label": definition.get("label", key),
        "color": definition.get("color", "#64748b"),
        "unit": definition.get("unit", ""),
        "status": status,
        "current": current,
        "total": total,
        "percent": _percent(current, total) if total else None,
        "message": message,
        "duration_ms": 0,
        "started_at": None,
        "finished_at": None,
        "run_id": None,
        "run_status": None,
        "stats": stats or [],
    }


def _database_metrics(session_factory) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "status": "unavailable",
        "error": "",
        "judgment_count": None,
        "law_count": None,
        "order_count": None,
        "law_article_count": None,
        "order_article_count": None,
        "latest_versions": {},
    }
    if session_factory is None:
        result["error"] = "沒有可用的 PostgreSQL session"
        return result
    try:
        with session_factory() as session:
            result["judgment_count"] = int(
                session.scalar(select(func.count()).select_from(JudgmentDocument)) or 0
            )
            grouped = session.execute(
                select(
                    LawDocument.source_type,
                    func.count(LawDocument.id),
                    func.coalesce(func.sum(LawDocument.article_count), 0),
                )
                .where(LawDocument.is_current.is_(True))
                .group_by(LawDocument.source_type)
            ).all()
            for source_type, count, articles in grouped:
                key = str(source_type or "")
                if key in {"law", "order"}:
                    result[f"{key}_count"] = int(count or 0)
                    result[f"{key}_article_count"] = int(articles or 0)
            versions = session.scalars(
                select(LawDatasetVersion)
                .where(LawDatasetVersion.is_current.is_(True))
                .order_by(LawDatasetVersion.downloaded_at.desc())
            ).all()
            for version in versions:
                key = str(version.source_type or "")
                if key and key not in result["latest_versions"]:
                    result["latest_versions"][key] = {
                        "id": int(version.id),
                        "source_type": version.source_type,
                        "update_date": version.update_date,
                        "law_count": int(version.law_count or 0),
                        "article_count": int(version.article_count or 0),
                        "downloaded_at": _iso(version.downloaded_at),
                        "parquet_path": version.parquet_path,
                    }
        result["status"] = "operational"
    except Exception as exc:
        result["error"] = f"無法查詢 PostgreSQL：{exc.__class__.__name__}: {exc}"
        logger.warning("processing database metrics failed", exc_info=True)
    return result


def _raw_backup_metrics(settings: Settings) -> Dict[str, Any]:
    try:
        count = count_raw_manifests(settings.judgment_data_dir)
        latest = latest_raw_manifest(settings.judgment_data_dir)
        totals = raw_judgment_totals(settings.judgment_data_dir)
    except Exception as exc:
        return {
            "available": False,
            "count": None,
            "latest": None,
            "totals": None,
            "error": f"無法掃描原始 Parquet 備份：{exc.__class__.__name__}: {exc}",
        }
    return {
        "available": True,
        "count": count,
        "latest": latest,
        "totals": totals,
        "error": "",
    }


def _law_raw_backup_metrics(settings: Settings) -> Dict[str, Any]:
    root = Path(settings.law_data_dir).expanduser().resolve() / "raw_parquet"
    result: Dict[str, Any] = {}
    for source in ("law", "order"):
        manifests = sorted(
            (root / source).glob("*/*/manifest.json"),
            key=lambda item: item.stat().st_mtime if item.exists() else 0,
            reverse=True,
        )
        latest: Optional[Dict[str, Any]] = None
        if manifests:
            try:
                payload = json.loads(manifests[0].read_text(encoding="utf-8"))
                if isinstance(payload, dict):
                    latest = payload
            except (OSError, ValueError):
                latest = None
        result[source] = {
            "available": (root / source).is_dir(),
            "count": len(manifests),
            "latest": latest,
        }
    return result


def _index_metrics_with_factory(
    settings: Settings, session_factory, database: Dict[str, Any]
) -> Dict[str, Any]:
    total = database.get("judgment_count")
    if session_factory is None or total is None:
        return {
            "status": "unavailable",
            "error": database.get("error") or "無法取得判決總數",
            "indexed": None,
            "total": total,
            "remaining": None,
            "percent": None,
            "collection": settings.judgment_vector_collection,
            "model": settings.embedding_model,
        }
    try:
        from ..judgment_index import index_coverage

        coverage = index_coverage(
            session_factory,
            collection=settings.judgment_vector_collection,
            model=settings.embedding_model,
        )
        indexed = int(coverage.get("indexed_judgments") or 0)
        total = int(coverage.get("total_judgments") or 0)
        remaining = int(coverage.get("remaining_judgments") or 0)
        return {
            "status": "operational",
            "error": "",
            "indexed": indexed,
            "total": total,
            "remaining": remaining,
            "percent": _percent(indexed, total),
            "collection": coverage.get("collection"),
            "model": coverage.get("model"),
            "latest_indexed_at": coverage.get("latest_indexed_at"),
        }
    except Exception as exc:
        return {
            "status": "unavailable",
            "error": f"無法查詢向量索引覆蓋率：{exc.__class__.__name__}: {exc}",
            "indexed": None,
            "total": total,
            "remaining": None,
            "percent": None,
            "collection": settings.judgment_vector_collection,
            "model": settings.embedding_model,
        }


def _archive_paths(settings: Settings) -> List[Path]:
    base = Path(settings.judgment_data_dir).expanduser()
    directories = [base, base / "raw_rar"]
    paths: List[Path] = []
    seen = set()
    for directory in directories:
        if not directory.is_dir():
            continue
        for path in directory.iterdir():
            if not path.is_file() or path.suffix.lower() != ".rar":
                continue
            key = str(path.resolve())
            if key in seen:
                continue
            seen.add(key)
            paths.append(path)
    return sorted(paths, key=lambda item: item.name)


def _processed_archive_names(session_factory, runs: Sequence[Dict[str, Any]]) -> set[str]:
    names: set[str] = set()
    for run in runs:
        for name, archive in (run.get("archives") or {}).items():
            if not isinstance(archive, dict):
                continue
            if archive.get("status") not in {"success", "skipped"}:
                continue
            stages = archive.get("stages") or {}
            postgres = stages.get("postgres") if isinstance(stages, dict) else None
            if isinstance(postgres, dict) and postgres.get("status") == "success":
                names.add(str(name))
                continue
            # Legacy state may predate stage-level tracking; only trust it when
            # the archive actually produced or matched judgments.
            if int(archive.get("matched") or 0) or int(archive.get("stored") or 0):
                names.add(str(name))
    if session_factory is None:
        return names
    try:
        with session_factory() as session:
            values = session.scalars(
                select(JudgmentDocument.source_archive)
                .where(JudgmentDocument.source_archive != "")
                .distinct()
            ).all()
        names.update(str(value) for value in values if value)
    except Exception:
        logger.warning("failed to read processed archive names", exc_info=True)
    return names


def _scan_local_archives(
    settings: Settings,
    session_factory,
    runs: Sequence[Dict[str, Any]],
) -> Dict[str, Any]:
    data_dir = Path(settings.judgment_data_dir).expanduser()
    if not data_dir.is_dir():
        return {
            "available": False,
            "data_dir": str(data_dir),
            "error": f"找不到判決資料目錄：{data_dir}",
            "items": [],
            "total": 0,
            "processed": 0,
            "unprocessed": 0,
            "total_bytes": 0,
            "unprocessed_bytes": 0,
        }
    processed_names = _processed_archive_names(session_factory, runs)
    items: List[Dict[str, Any]] = []
    for path in _archive_paths(settings):
        try:
            stat = path.stat()
            size_bytes = stat.st_size
            modified_at = datetime.fromtimestamp(
                stat.st_mtime, tz=timezone.utc
            ).isoformat()
        except OSError:
            size_bytes = 0
            modified_at = None
        try:
            display_path = str(path.relative_to(data_dir))
        except ValueError:
            display_path = path.name
        items.append(
            {
                "name": path.name,
                "path": display_path,
                "size_bytes": size_bytes,
                "modified_at": modified_at,
                "processed": path.name in processed_names,
            }
        )
    unprocessed = [item for item in items if not item["processed"]]
    return {
        "available": True,
        "data_dir": str(data_dir),
        "error": "",
        "items": items,
        "total": len(items),
        "processed": len(items) - len(unprocessed),
        "unprocessed": len(unprocessed),
        "total_bytes": sum(int(item["size_bytes"] or 0) for item in items),
        "unprocessed_bytes": sum(
            int(item["size_bytes"] or 0) for item in unprocessed
        ),
    }


def _branch_stage_nodes(
    branch: str,
    focus_run: Optional[Dict[str, Any]],
    *,
    database: Dict[str, Any],
    index: Dict[str, Any],
    raw_backups: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
) -> List[Dict[str, Any]]:
    stage_keys = BRANCH_STAGES.get(branch, [])
    nodes: List[Dict[str, Any]] = []
    latest_versions = database.get("latest_versions") or {}

    for key in stage_keys:
        stage = None
        run = focus_run
        if run is not None:
            candidate = (run.get("stages") or {}).get(key)
            if isinstance(candidate, dict):
                stage = candidate
        if stage is not None:
            node = _stage_view(stage, run or {})
        else:
            if run is not None and run.get("status") == STATE_RUNNING:
                if run.get("kind") == "index":
                    node = _idle_node(
                        key,
                        status="idle",
                        message="此工作只執行 Qdrant 索引",
                    )
                elif run.get("external"):
                    node = _idle_node(
                        key,
                        status="unavailable",
                        message="外部程序未寫入此階段進度",
                    )
                else:
                    node = _idle_node(
                        key,
                        status="pending",
                        message="等待前一個階段完成",
                    )
            elif run is not None and run.get("status") in TERMINAL_STATUSES:
                node = _idle_node(key, status="skipped", message="本次未執行此階段")
            else:
                node = _idle_node(key, status="idle", message="尚無執行紀錄")

        # Real, current values that remain useful when no stage is running.
        if branch == "judgment":
            if key == "extract" and not (node.get("current") or node.get("total")):
                scanned = _safe_int((focus_run or {}).get("counts", {}).get("scanned_count"))
                if scanned is not None:
                    node["stats"] = [{"label": "最近掃描", "value": f"{scanned:,} 筆"}]
            elif key == "raw_parquet":
                raw_stats: List[Dict[str, str]] = []
                backup_count = _safe_int(raw_backups.get("count"))
                if backup_count:
                    raw_stats.append(
                        {"label": "磁碟備份", "value": f"{backup_count:,} 檔"}
                    )
                latest_raw = raw_backups.get("latest") or {}
                latest_rows = _safe_int(latest_raw.get("row_count"))
                if latest_rows is not None:
                    raw_stats.append(
                        {"label": "最新備份", "value": f"{latest_rows:,} 筆"}
                    )
                latest_candidates = _safe_int(latest_raw.get("candidate_count"))
                if latest_candidates is not None:
                    raw_stats.append(
                        {"label": "最新 DuckDB 候選", "value": f"{latest_candidates:,} 筆"}
                    )
                raw_rows = _safe_int(
                    (focus_run or {}).get("counts", {}).get("raw_parquet_rows")
                )
                if raw_rows is not None:
                    raw_stats.append(
                        {"label": "最近原始備份", "value": f"{raw_rows:,} 筆"}
                    )
                if raw_stats:
                    node["stats"] = raw_stats[:3]
            elif key == "filter" and not (node.get("current") or node.get("total")):
                matched = _safe_int((focus_run or {}).get("counts", {}).get("matched_count"))
                if matched is not None:
                    node["stats"] = [{"label": "最近命中", "value": f"{matched:,} 筆"}]
            elif key == "postgres" and not (node.get("current") or node.get("total")):
                total = database.get("judgment_count")
                if total is not None:
                    node["stats"] = [{"label": "資料庫判決", "value": f"{total:,} 筆"}]
            elif key == "qdrant":
                node["coverage"] = {
                    "indexed": index.get("indexed"),
                    "total": index.get("total"),
                    "remaining": index.get("remaining"),
                    "percent": index.get("percent"),
                }
                if index.get("status") == "operational" and not (
                    node.get("current") or node.get("total")
                ):
                    node["stats"] = [
                        {"label": "索引覆蓋", "value": f"{index.get('indexed') or 0:,} / {index.get('total') or 0:,}"},
                    ]
        else:
            version = latest_versions.get(branch)
            if key == "raw_parquet":
                raw_info = (law_raw_backups or {}).get(branch) or {}
                raw_count = _safe_int(raw_info.get("count"))
                latest_raw = raw_info.get("latest") or {}
                latest_rows = _safe_int(latest_raw.get("row_count"))
                raw_stats = []
                if raw_count:
                    raw_stats.append(
                        {"label": "磁碟備份", "value": f"{raw_count:,} 檔"}
                    )
                if latest_rows is not None:
                    raw_stats.append(
                        {"label": "最新備份", "value": f"{latest_rows:,} 筆"}
                    )
                if raw_stats:
                    node["stats"] = raw_stats[:2]
            elif key == "download" and not (node.get("current") or node.get("total")):
                if version:
                    node["stats"] = [
                        {"label": "目前版本", "value": f"#{version.get('id')}"},
                        {"label": "來源更新日", "value": str(version.get("update_date") or "—")},
                    ]
                else:
                    node["stats"] = [{"label": "目前版本", "value": "尚未下載"}]
            elif key == "parse" and not (node.get("current") or node.get("total")):
                if version:
                    node["stats"] = [
                        {"label": "法規／命令", "value": f"{int(version.get('law_count') or 0):,}"},
                        {"label": "條文", "value": f"{int(version.get('article_count') or 0):,}"},
                    ]
            elif key == "postgres" and not (node.get("current") or node.get("total")):
                count_key = "law_count" if branch == "law" else "order_count"
                article_key = "law_article_count" if branch == "law" else "order_article_count"
                count = database.get(count_key)
                if count is not None:
                    article_count = database.get(article_key)
                    node["stats"] = [
                        {"label": "目前筆數", "value": f"{int(count):,}"},
                        {"label": "條文", "value": f"{int(article_count or 0):,}"},
                    ]
        nodes.append(node)
    return nodes


def _build_timeline(runs: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    active_update = next(
        (
            run
            for run in runs
            if run.get("status") == STATE_RUNNING
            and run.get("alive")
            and run.get("kind") == "update"
        ),
        None,
    )
    active = [
        run
        for run in runs
        if run.get("status") == STATE_RUNNING
        and run.get("alive")
        and run.get("kind") != "update"
    ]
    latest_update = next(
        (run for run in runs if run.get("kind") == "update"),
        None,
    )
    if active_update is not None and (
        active_update.get("stages") or not active
    ):
        selected = [active_update]
        label = f"執行中：{active_update.get('title') or '資料更新'}"
    elif active:
        selected = active
        label = "執行中：" + "、".join(str(run.get("title") or "處理") for run in selected)
    elif latest_update is not None:
        selected = [latest_update]
        label = f"最近一次：{latest_update.get('title') or '資料更新'}"
    else:
        completed = [run for run in runs if run.get("kind") != "update"]
        if not completed:
            return {
                "available": False,
                "label": "",
                "total_ms": 0,
                "stages": [],
                "run_ids": [],
            }
        selected = [completed[0]]
        label = f"最近一次：{selected[0].get('title') or '處理'}"

    totals: Dict[str, float] = {}
    statuses: Dict[str, str] = {}
    key_order: List[str] = []
    for run in selected:
        for key, stage in (run.get("stages") or {}).items():
            if not isinstance(stage, dict):
                continue
            seconds = stage_seconds(stage)
            if seconds <= 0 and stage.get("status") != STATE_RUNNING:
                continue
            if key not in totals:
                key_order.append(key)
            totals[key] = totals.get(key, 0.0) + seconds
            statuses[key] = (
                "running"
                if stage.get("status") == STATE_RUNNING
                else statuses.get(key, str(stage.get("status") or "success"))
            )
    total_seconds = sum(totals.values())
    if total_seconds <= 0:
        return {
            "available": False,
            "label": label,
            "total_ms": 0,
            "stages": [],
            "run_ids": [run.get("id") for run in selected],
        }
    stages = []
    for key in key_order:
        seconds = totals.get(key, 0.0)
        if seconds <= 0:
            continue
        definition = STAGE_CATALOG.get(key, {})
        stages.append(
            {
                "key": key,
                "label": definition.get("label", key),
                "color": definition.get("color", "#64748b"),
                "duration_ms": int(round(seconds * 1000)),
                "percent": round(100.0 * seconds / total_seconds, 1),
                "status": statuses.get(key, "success"),
            }
        )
    return {
        "available": True,
        "label": label,
        "total_ms": int(round(total_seconds * 1000)),
        "stages": stages,
        "run_ids": [run.get("id") for run in selected],
    }


def _archive_view(
    archive: Dict[str, Any],
    run_status: str,
) -> Dict[str, Any]:
    stages = {}
    for key, stage in (archive.get("stages") or {}).items():
        if isinstance(stage, dict):
            stages[key] = _stage_view(stage, {"id": None, "status": run_status})
    current = _safe_int(archive.get("scanned"))
    total = None
    percent = None
    for key in ("postgres", "filter", "extract"):
        stage = stages.get(key)
        if not stage:
            continue
        if stage.get("percent") is not None:
            percent = stage["percent"]
            current = stage.get("current")
            total = stage.get("total")
            break
    if archive.get("status") == "success":
        percent = 100.0
    return {
        "name": archive.get("name"),
        "path": archive.get("path"),
        "size_bytes": int(archive.get("size_bytes") or 0),
        "status": archive.get("status") or "pending",
        "current_stage": archive.get("current_stage") or "",
        "started_at": archive.get("started_at"),
        "finished_at": archive.get("finished_at"),
        "duration_ms": int(archive.get("duration_ms") or 0),
        "scanned": int(archive.get("scanned") or 0),
        "matched": int(archive.get("matched") or 0),
        "stored": int(archive.get("stored") or 0),
        "error": archive.get("error") or "",
        "percent": percent,
        "current": current,
        "total": total,
        "stages": stages,
    }


def _local_archive_view(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "name": item.get("name"),
        "path": item.get("path"),
        "size_bytes": int(item.get("size_bytes") or 0),
        "status": "idle" if item.get("processed") else "pending",
        "current_stage": "",
        "started_at": None,
        "finished_at": None,
        "duration_ms": 0,
        "scanned": 0,
        "matched": 0,
        "stored": 0,
        "error": "",
        "percent": 100.0 if item.get("processed") else None,
        "current": None,
        "total": None,
        "stages": {},
        "processed": bool(item.get("processed")),
        "message": (
            "資料庫已有此壓縮檔的判決"
            if item.get("processed")
            else "尚未匯入；資料更新會處理此檔"
        ),
    }


def _archives_for_snapshot(
    runs: Sequence[Dict[str, Any]],
    local: Dict[str, Any],
) -> Dict[str, Any]:
    active_import = _active_run(runs, branch="judgment", kind="import")
    focus = active_import or _latest_run(runs, branch="judgment", kind="import")
    has_archive_state = bool(focus is not None and (focus.get("archives") or {}))
    if focus is not None and has_archive_state:
        archives = [
            _archive_view(value, str(focus.get("status") or ""))
            for value in (focus.get("archives") or {}).values()
            if isinstance(value, dict)
        ]
        seen = {str(item.get("name") or "") for item in archives}
        archives.extend(
            _local_archive_view(item)
            for item in (local.get("items") or [])
            if str(item.get("name") or "") not in seen
        )
        archives.sort(key=lambda item: str(item.get("name") or ""))
        return {
            "source": "run",
            "run": _public_run(focus),
            "active": bool(active_import),
            "external": bool(focus.get("external")),
            "items": archives,
        }
    items = [_local_archive_view(item) for item in (local.get("items") or [])]
    external_import = bool(focus is not None and focus.get("external"))
    note = (
        "偵測到外部判決匯入程序；該程序未寫入逐檔狀態，"
        "以下改以 PostgreSQL 的 source_archive 顯示已處理覆蓋率。"
        if external_import
        else ""
    )
    return {
        "source": "local",
        "run": _public_run(focus),
        "active": bool(active_import),
        "external": external_import,
        "note": note,
        "items": items,
    }


def scan_local_archives(
    *,
    settings: Settings,
    session_factory,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Return .rar scan results, including archives already in PostgreSQL."""

    resolved_path = Path(state_path or default_state_path())
    try:
        state = ProcessingStateStore(resolved_path).read()
        runs = _normalized_runs(state, datetime.now(timezone.utc))
    except ProcessingStateError:
        runs = []
    return _scan_local_archives(settings, session_factory, runs)


def build_processing_snapshot(
    *,
    settings: Settings,
    session_factory,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    resolved_path = Path(state_path or default_state_path())
    now = datetime.now(timezone.utc)
    state_status = state_file_status(resolved_path)
    notices: List[Dict[str, str]] = []
    runs: List[Dict[str, Any]] = []
    state_error = ""
    if state_status.get("status") == "error":
        state_error = str(state_status.get("detail") or "")
        notices.append(
            {
                "tone": "danger",
                "title": "處理狀態檔無法讀取",
                "message": state_error,
            }
        )
    elif state_status.get("status") == "missing":
        notices.append(
            {
                "tone": "info",
                "title": "尚無處理狀態紀錄",
                "message": "第一次執行資料更新或任一資料處理命令後，會在此顯示即時進度。",
            }
        )
    try:
        runs = _normalized_runs(ProcessingStateStore(resolved_path).read(), now)
    except ProcessingStateError as exc:
        state_error = str(exc)

    database = _database_metrics(session_factory)
    index = _index_metrics_with_factory(settings, session_factory, database)
    raw_backups = _raw_backup_metrics(settings)
    law_raw_backups = _law_raw_backup_metrics(settings)
    state_runs = runs
    runs, external_processes = _attach_external_runs(runs, index=index, now=now)
    local = _scan_local_archives(settings, session_factory, state_runs)
    archives = _archives_for_snapshot(runs, local)

    if database.get("status") != "operational":
        notices.append(
            {
                "tone": "warn",
                "title": "PostgreSQL 狀態無法取得",
                "message": str(database.get("error") or "查詢失敗；相關數值不會以 0 代替。"),
            }
        )
    if not local.get("available"):
        notices.append(
            {
                "tone": "warn",
                "title": "找不到判決資料目錄",
                "message": str(local.get("error") or "無法掃描 .rar 檔案。"),
            }
        )
    stale = [run for run in runs if run.get("stale")]
    for run in stale[:3]:
        notices.append(
            {
                "tone": "warn",
                "title": f"{run.get('title') or '處理程序'}狀態已失效",
                "message": str(run.get("message") or "程序已不存在。"),
            }
        )
    backlog = index.get("remaining")
    if index.get("status") == "operational" and backlog:
        notices.append(
            {
                "tone": "info",
                "title": "向量索引尚待補齊",
                "message": f"目前尚餘 {int(backlog):,} 筆判決未建立 Qdrant 索引。",
            }
        )
    for process in external_processes:
        notices.append(
            {
                "tone": "info",
                "title": f"偵測到外部程序：{process.get('title') or '處理'}",
                "message": (
                    f"PID {process.get('pid')} 正在執行；此程序未寫入處理狀態檔，"
                    "頁面只會顯示可驗證的整體進度，不推測階段百分比。"
                ),
            }
        )

    active_update = _active_run(runs, kind="update")
    external_blockers = [
        process
        for process in external_processes
        if process.get("kind") in {"update", "import", "download"}
    ]
    external_index = next(
        (process for process in external_processes if process.get("kind") == "index"),
        None,
    )
    if active_update is not None:
        start_blocked_reason = "資料更新已在執行中。"
    elif external_blockers:
        start_blocked_reason = (
            f"外部{external_blockers[0].get('title') or '處理程序'}正在執行中。"
        )
    else:
        start_blocked_reason = ""
    can_start_update = active_update is None and not external_blockers
    active_runs = [
        run
        for run in runs
        if run.get("status") == STATE_RUNNING and run.get("alive")
    ]
    branches = []
    for branch, meta in BRANCH_META.items():
        branch_active = _active_run(runs, branch=branch)
        branch_latest = _latest_run(runs, branch=branch)
        focus = branch_active or branch_latest
        nodes = _branch_stage_nodes(
            branch,
            focus,
            database=database,
            index=index,
            raw_backups=raw_backups,
            law_raw_backups=law_raw_backups,
        )
        branches.append(
            {
                "key": branch,
                "label": meta["label"],
                "icon": meta["icon"],
                "description": meta["description"],
                "active_run": _public_run(branch_active),
                "last_run": _public_run(branch_latest),
                "focus_run": _public_run(focus),
                "stages": nodes,
            }
        )

    capabilities = {
        "can_start_update": can_start_update,
        "can_start_update_with_index": bool(
            can_start_update and external_index is None
        ),
        "can_stop_update": bool(
            active_update
            and active_update.get("alive")
            and not active_update.get("external")
            and not (active_update.get("meta") or {}).get("pid_pending")
            and pid_alive(active_update.get("pid"))
        ),
        "active_update_id": active_update.get("id") if active_update else None,
        "index_backlog": backlog,
        "unprocessed_archives": int(local.get("unprocessed") or 0),
        "external_processes": len(external_processes),
        "external_index_running": external_index is not None,
        "start_blocked_reason": start_blocked_reason,
        "index_blocked_reason": (
            "外部 Qdrant 索引程序正在執行中，完成後再啟動可接續索引的更新。"
            if external_index is not None
            else ""
        ),
    }
    if active_update is not None:
        update = _public_run(active_update)
    else:
        latest_update = _latest_run(runs, kind="update")
        update = _public_run(latest_update)

    status = "operational"
    if database.get("status") != "operational" or state_status.get("status") == "error":
        status = "degraded"

    return {
        "generated_at": now.isoformat(),
        "status": status,
        "mode": "running" if active_runs else "idle",
        "state": state_status,
        "state_error": state_error,
        "database": {
            "status": database.get("status"),
            "error": database.get("error"),
            "judgment_count": database.get("judgment_count"),
            "law_count": database.get("law_count"),
            "order_count": database.get("order_count"),
            "law_article_count": database.get("law_article_count"),
            "order_article_count": database.get("order_article_count"),
        },
        "index": index,
        "raw_backups": raw_backups,
        "law_raw_backups": law_raw_backups,
        "local_archives": local,
        "external_processes": external_processes,
        "branches": branches,
        "active_runs": [_public_run(run) for run in active_runs],
        "recent_runs": [_public_run(run) for run in runs[:10]],
        "archives": archives,
        "timeline": _build_timeline(runs),
        "update": update,
        "capabilities": capabilities,
        "notices": notices,
    }


def build_processing_plan(
    *,
    settings: Settings,
    session_factory,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    snapshot = build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
        state_path=state_path,
    )
    local = snapshot.get("local_archives") or {}
    pending = [item for item in (local.get("items") or []) if not item.get("processed")]
    index = snapshot.get("index") or {}
    return {
        "generated_at": snapshot.get("generated_at"),
        "active_update": (snapshot.get("update") or {}).get("id")
        if (snapshot.get("update") or {}).get("status") == "running"
        else None,
        "local_archives": {
            "available": local.get("available"),
            "total": local.get("total"),
            "processed": local.get("processed"),
            "unprocessed": local.get("unprocessed"),
            "unprocessed_bytes": local.get("unprocessed_bytes"),
            "pending": pending,
            "data_dir": local.get("data_dir"),
        },
        "index": {
            "status": index.get("status"),
            "indexed": index.get("indexed"),
            "total": index.get("total"),
            "remaining": index.get("remaining"),
            "percent": index.get("percent"),
        },
        "laws": (snapshot.get("database") or {}).get("latest_versions", {}).get("law"),
        "orders": (snapshot.get("database") or {}).get("latest_versions", {}).get("order"),
        "online_check": {
            "status": "pending",
            "message": "按下資料更新後，法規／命令下載階段會抓取最新 ZIP 並以 SHA-256 比對；內容相同時會標示『無變更』。",
        },
        "recommended": {
            "download_laws": True,
            "import_archives": [item.get("name") for item in pending],
            "index": bool(index.get("remaining")),
        },
    }


class ProcessingManager:
    """Start and stop the resumable, multi-step data update job."""

    def __init__(
        self,
        *,
        settings: Settings,
        session_factory,
        state_path: Optional[Path] = None,
    ) -> None:
        self.settings = settings
        self.session_factory = session_factory
        self.state_path = Path(state_path or default_state_path()).expanduser().resolve()
        self.store = ProcessingStateStore(self.state_path)
        self.root = Path(__file__).resolve().parents[3]
        if not (self.root / "pyproject.toml").is_file():
            self.root = Path.cwd()
        self._lock = threading.Lock()

    def _active_update(self) -> Optional[Dict[str, Any]]:
        try:
            state = self.store.read()
        except ProcessingStateError:
            return None
        for run in state.get("runs") or []:
            if (
                isinstance(run, dict)
                and run.get("kind") == "update"
                and run.get("status") == STATE_RUNNING
                and pid_alive(run.get("pid"))
            ):
                return run
        return None

    def start_update(self, *, index: bool = False) -> Dict[str, Any]:
        with self._lock:
            active = self._active_update()
            if active is not None:
                raise RuntimeError(
                    f"資料更新已在執行中（run {active.get('id')}，PID {active.get('pid')}）。"
                )
            external = _detect_external_processes()
            blockers = [
                process
                for process in external
                if process.get("kind") in {"update", "import", "download"}
            ]
            if blockers:
                process = blockers[0]
                raise RuntimeError(
                    f"外部{process.get('title') or '處理程序'}正在執行中"
                    f"（PID {process.get('pid')}），請等待結束後再啟動資料更新。"
                )
            if index:
                indexer = next(
                    (
                        process
                        for process in external
                        if process.get("kind") == "index"
                    ),
                    None,
                )
                if indexer is not None:
                    raise RuntimeError(
                        f"外部 Qdrant 索引程序正在執行中（PID {indexer.get('pid')}），"
                        "為避免同時索引，請等待結束或取消勾選接續索引。"
                    )
            run_id = self.store.start_run(
                branch="system",
                kind="update",
                title="資料更新",
                stages=["download", "postgres", "qdrant"],
                pid=os.getpid(),
                meta={"index": bool(index), "pid_pending": True},
                message="準備檢查線上法規／命令與本機未處理壓縮檔。",
            )
            log_dir = self.root / ".run"
            log_dir.mkdir(parents=True, exist_ok=True)
            stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            log_path = log_dir / f"processing_update_{stamp}.log"
            env = os.environ.copy()
            env["JUDGMENT_PROCESSING_STATE"] = str(self.state_path)
            env["JUDGMENT_PROCESSING_PARENT"] = run_id
            command = [
                sys.executable,
                "-m",
                "judgment.processing_update",
                "--run-id",
                run_id,
            ]
            if index:
                command.append("--index")
            log_handle = log_path.open("ab")
            try:
                process = subprocess.Popen(
                    command,
                    cwd=str(self.root),
                    env=env,
                    stdout=log_handle,
                    stderr=subprocess.STDOUT,
                    start_new_session=True,
                )
            except Exception as exc:
                log_handle.close()
                self.store.finish_run(
                    run_id,
                    status="failed",
                    message=f"無法啟動資料更新程序：{exc.__class__.__name__}: {exc}",
                )
                raise RuntimeError(
                    f"無法啟動資料更新程序：{exc.__class__.__name__}: {exc}"
                ) from exc
            finally:
                try:
                    log_handle.close()
                except OSError:
                    pass
            self.store.update_run(
                run_id,
                pid=process.pid,
                meta={
                    "index": bool(index),
                    "log_path": str(log_path),
                    "pid_pending": False,
                },
                message="已啟動資料更新程序。",
            )
            return {
                "status": "started",
                "run_id": run_id,
                "pid": process.pid,
                "index": bool(index),
                "log_path": str(log_path),
                "state_path": str(self.state_path),
            }

    def stop_update(self) -> Dict[str, Any]:
        active = self._active_update()
        if active is None:
            return {
                "status": "not_running",
                "message": "目前沒有執行中的資料更新程序。",
            }
        if (active.get("meta") or {}).get("pid_pending"):
            return {
                "status": "starting",
                "message": "資料更新程序仍在啟動中，請稍候再試。",
                "run_id": active.get("id"),
            }
        pid = int(active.get("pid") or 0)
        try:
            os.killpg(pid, signal.SIGINT)
        except ProcessLookupError:
            try:
                os.kill(pid, signal.SIGINT)
            except ProcessLookupError:
                return {
                    "status": "not_running",
                    "message": "程序已結束。",
                    "run_id": active.get("id"),
                }
        except PermissionError as exc:
            raise RuntimeError(f"沒有權限停止程序 {pid}") from exc
        self.store.update_run(
            active.get("id"),
            message="已送出停止訊號，等待目前步驟結束。",
        )
        return {
            "status": "stopping",
            "run_id": active.get("id"),
            "pid": pid,
            "message": "已送出 SIGINT；索引與匯入會在目前批次結束後停止。",
        }


__all__ = [
    "ProcessingManager",
    "build_processing_plan",
    "build_processing_snapshot",
]
