from __future__ import annotations

import asyncio
import json
import logging
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple
from urllib.parse import urlparse

from sqlalchemy import func, select

from ..config import Settings
from ..judgment_raw_parquet import (
    count_raw_manifests,
    find_reusable_raw_parquet,
    latest_raw_manifest,
    latest_raw_manifests,
    raw_judgment_totals,
)
from ..models import (
    JudgmentDocument,
    LawDatasetVersion,
    LawDocument,
    OllamaModelCapability,
)
from ..ollama_hosts import active_host
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
from ..update_records import update_history, update_status
from ..version_codes import version_code_for_datetime
from ..workflows import workflow_catalog, workflow_definition

logger = logging.getLogger(__name__)

BRANCH_META: Dict[str, Dict[str, str]] = {
    "judgment": {
        "label": "判決",
        "icon": "database",
        "description": "RAR → 原始資料檢查／Parquet 備份 → DuckDB 候選篩選 → PostgreSQL metadata → Qdrant",
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

SECTION_META: Tuple[Dict[str, Any], ...] = (
    {
        "key": "legal",
        "label": "法規及命令",
        "icon": "layers",
        "accent": "#22d3ee",
        "description": "法規與命令共用一條資料瀑布：線上比對、下載、備份、解析、PostgreSQL，最後重建法規／命令向量索引。",
        "sources": (
            {"key": "law", "label": "法規", "accent": "#22d3ee"},
            {"key": "order", "label": "命令", "accent": "#f472b6"},
        ),
    },
    {
        "key": "judgment",
        "label": "判決",
        "icon": "database",
        "accent": "#a78bfa",
        "description": "判決資料瀑布：下載壓縮檔、原始資料檢查／Parquet 備份、金融法規篩選、PostgreSQL 匯入，最後建立 Qdrant 向量索引。",
        "sources": (
            {"key": "judgment", "label": "判決", "accent": "#a78bfa"},
        ),
    },
)

STAGE_ICONS: Dict[str, str] = {
    "download": "download",
    "extract": "file",
    "raw_parquet": "cube",
    "filter": "filter",
    "parse": "sliders",
    "postgres": "database",
    "legal_qdrant": "shield",
    "qdrant": "brain",
}

SECTION_STAGE_KEYS: Dict[str, Tuple[str, ...]] = {
    "legal": ("download", "raw_parquet", "parse", "postgres", "legal_qdrant"),
    "judgment": (
        "download",
        "extract",
        "raw_parquet",
        "filter",
        "postgres",
        "qdrant",
    ),
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


def _format_size(value: Any) -> str:
    try:
        number = float(value)
    except (TypeError, ValueError):
        return "—"
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if number < 1024 or unit == "TB":
            if unit == "B":
                return f"{int(number):,} B"
            return f"{number:,.1f} {unit}"
        number /= 1024
    return "—"


def _embedding_runtime(settings: Settings, session_factory) -> Dict[str, Any]:
    """Return the active embedding host and model used by index stages."""

    host_name = ""
    host_url = str(settings.embedding_url or "").strip()
    model = str(settings.embedding_model or "").strip()
    if session_factory is not None:
        try:
            host = active_host(session_factory)
        except Exception:
            host = None
        if host is not None:
            host_name = str(getattr(host, "name", "") or "").strip()
            host_url = str(
                getattr(host, "base_url", "") or host_url
            ).strip()
            model = str(
                getattr(host, "embedding_model", "") or model
            ).strip()
    if not host_name:
        parsed = urlparse(host_url)
        host_name = parsed.hostname or host_url or "—"
    if session_factory is not None and host_url:
        try:
            with session_factory() as session:
                names = session.scalars(
                    select(OllamaModelCapability.model).where(
                        OllamaModelCapability.base_url == host_url
                    )
                ).all()
        except Exception:
            names = []
        for name in names:
            candidate = str(name or "").strip()
            if not candidate:
                continue
            if (
                candidate == model
                or candidate.split(":", 1)[0] == model
                or candidate.startswith(f"{model}:")
            ):
                model = candidate
                break
    if model and ":" not in model:
        model = f"{model}:latest"
    label = f"{host_name}:{model or '—'}"
    return {
        "host": host_name,
        "url": host_url,
        "model": model or "—",
        "role": "embedding",
        "label": label,
    }


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
    meta = deepcopy(run.get("meta") or {})
    meta.pop("index_runtime", None)
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
        "meta": meta,
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
    ("legal_index", ("judgment-index-legal-articles", "judgment.legal_index")),
    ("index", ("judgment-index-vectors", "judgment.judgment_index")),
    ("import", ("judgment-import-judgments", "judgment.judgment_import")),
    ("download", ("judgment-law-download", "judgment.law_download.cli")),
)

PROCESS_TITLES = {
    "update": "資料更新",
    "legal_index": "法規／命令索引",
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
        if kind == "legal_index":
            branch = "law"
        elif kind == "index" or kind == "import":
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
    elif process.get("kind") == "legal_index":
        stage = _stage_for("legal_qdrant")
        stage.update(
            {
                "status": STATE_RUNNING,
                "started_at": started_at,
                "message": f"外部法規／命令索引程序（PID {pid}）執行中。",
            }
        )
        run["stages"]["legal_qdrant"] = stage
        run["current_stage"] = "legal_qdrant"
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
    tracked_pids.update(
        int((run.get("meta") or {}).get("child_pid") or 0)
        for run in runs
        if isinstance(run, dict) and run.get("status") == STATE_RUNNING
    )
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
    rate = None
    if status == "running" and current:
        started = parse_iso(stage.get("started_at"))
        elapsed = (
            (datetime.now(timezone.utc) - started).total_seconds()
            if started is not None
            else 0.0
        )
        # Cumulative average: total processed / total elapsed.  Never use a
        # short polling interval, which produces meaningless spikes.
        if elapsed > 0:
            rate = round(float(current) / elapsed, 2)
    return {
        "key": key,
        # Prefer the current catalog label so older persisted runs do not keep
        # showing renamed stages (for example the legacy raw-parquet backup
        # label after it became a check/reuse stage).
        "label": STAGE_CATALOG.get(key, {}).get("label")
        or stage.get("label")
        or key,
        "color": stage.get("color") or STAGE_CATALOG.get(key, {}).get("color", "#64748b"),
        "unit": stage.get("unit") or STAGE_CATALOG.get(key, {}).get("unit", ""),
        "status": status,
        "current": current,
        "total": total,
        "percent": percent,
        "rate": rate,
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
        "rate": None,
        "message": message,
        "duration_ms": 0,
        "started_at": None,
        "finished_at": None,
        "run_id": None,
        "run_status": None,
        "stats": stats or [],
    }


def _archive_stage_metric(
    run: Optional[Dict[str, Any]], stage_key: str
) -> Tuple[float, int, Optional[float]]:
    """Return archive-level completion for one import stage."""

    archives = (run or {}).get("archives") or {}
    total = len(archives)
    if not total:
        return 0.0, 0, None
    completed = 0.0
    for archive in archives.values():
        if not isinstance(archive, dict):
            continue
        archive_stage = (archive.get("stages") or {}).get(stage_key) or {}
        if not isinstance(archive_stage, dict):
            continue
        archive_status = str(archive_stage.get("status") or "")
        if archive_status in {"success", "skipped"}:
            completed += 1.0
        elif archive_status == "running":
            current = _safe_int(archive_stage.get("current"))
            stage_total = _safe_int(archive_stage.get("total"))
            if current is not None and stage_total:
                completed += min(1.0, max(0.0, current / stage_total))
    return completed, total, round(100.0 * completed / total, 1)


def _workflow_failure_reason(run: Dict[str, Any]) -> str:
    message = str(run.get("message") or "").strip()
    if not message:
        return ""
    first_line = message.splitlines()[0].strip()
    first_line = first_line.split("[SQL:", 1)[0].strip()
    return first_line[:500]


def _workflow_failure_resolution(reason: str) -> str:
    text = reason.lower()
    if "nul (0x00)" in text or "cannot contain nul" in text:
        return (
            "系統已在寫入 PostgreSQL 前移除 NUL 位元組；"
            "請重新執行此流程。若仍失敗，請查看 .run 目錄中的最新日誌。"
        )
    if "could not connect" in text or "connection refused" in text:
        return "確認 PostgreSQL、Qdrant 或 Ollama 服務已啟動且網路可達，再重新執行此流程。"
    if "timeout" in text or "timed out" in text:
        return "確認服務負載與網路狀態；必要時提高 timeout 設定後重新執行。"
    if "no space left" in text:
        return "清理磁碟空間後重新執行此流程。"
    if "permission denied" in text:
        return "確認資料目錄與服務權限後重新執行此流程。"
    return "查看 .run 目錄中的最新日誌取得完整 traceback，修正後重新執行此流程。"


def _workflow_progress(
    run: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """Return per-stage progress and its equal-weight contribution.

    The combined percentage treats every participating stage equally. Stages
    skipped by a no-change run are excluded, so a completed "no change" run
    still reaches 100% without pretending skipped work was executed.
    """

    if run is None:
        return {
            "available": False,
            "run_id": None,
            "run_status": None,
            "overall_percent": None,
            "completed_stages": 0,
            "total_stages": 0,
            "active_stage": "",
            "stages": [],
        }
    failure_reason = _workflow_failure_reason(run)
    failure_resolution = (
        _workflow_failure_resolution(failure_reason) if failure_reason else ""
    )
    stages: List[Dict[str, Any]] = []
    for key, raw_stage in (run.get("stages") or {}).items():
        if not isinstance(raw_stage, dict):
            continue
        stage = _stage_view({**raw_stage, "key": raw_stage.get("key") or key}, run)
        status = str(stage.get("status") or "")
        if status in {"success", "no_change"}:
            stage["percent"] = 100.0
        elif status == "skipped":
            stage["percent"] = 0.0
        elif stage.get("percent") is None and status == "running":
            derived = _archive_stage_metric(run, key)[2]
            if derived is not None:
                stage["percent"] = derived
        elif stage.get("percent") is None and status != "running":
            stage["percent"] = 0.0
        if status == "failed":
            stage["error"] = failure_reason or str(
                stage.get("message") or "階段執行失敗。"
            )
            stage["resolution"] = failure_resolution or (
                "查看 .run 目錄中的最新日誌取得完整 traceback，"
                "修正後重新執行此流程。"
            )
        stages.append(stage)

    participants = [stage for stage in stages if stage.get("status") != "skipped"]
    weight = 100.0 / len(participants) if participants else 0.0
    overall = 0.0
    for stage in stages:
        if stage.get("status") == "skipped":
            contribution = 0.0
        else:
            percent = stage.get("percent")
            value = float(percent) if percent is not None else 0.0
            contribution = round(weight * value / 100.0, 2)
            overall += contribution
        stage["contribution_percent"] = contribution

    active_stage = next(
        (
            str(stage.get("key") or "")
            for stage in stages
            if stage.get("status") == "running"
        ),
        "",
    )
    return {
        "available": bool(stages),
        "run_id": run.get("id"),
        "run_status": run.get("status"),
        "overall_percent": (
            round(min(100.0, overall), 1) if participants else None
        ),
        "completed_stages": sum(
            1
            for stage in stages
            if stage.get("status") in {"success", "no_change"}
        ),
        "total_stages": len(participants),
        "active_stage": active_stage,
        "stages": stages,
    }


def _index_runtime_view(
    run: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    if run is None:
        return {"available": False}
    runtime = (run.get("meta") or {}).get("index_runtime")
    if not isinstance(runtime, dict) or not runtime:
        return {"available": False}
    payload = deepcopy(runtime)
    payload.update(
        {
            "available": True,
            "run_id": run.get("id"),
            "run_status": run.get("status"),
            "run_message": run.get("message") or "",
            "started_at": runtime.get("started_at") or run.get("started_at"),
            "finished_at": runtime.get("finished_at")
            or run.get("finished_at"),
        }
    )
    return payload


_INDEX_MONTH_CACHE: Dict[str, Any] = {
    "key": None,
    "expires_at": 0.0,
    "payload": None,
}
_INDEX_MONTH_CACHE_LOCK = threading.Lock()


def _index_month_coverage_runtime(
    settings: Settings,
    session_factory,
    index: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Fallback coverage view when no run-specific index_runtime exists."""

    if session_factory is None:
        return None
    key = (
        id(session_factory),
        index.get("version_id"),
        index.get("indexed"),
        index.get("collection"),
        index.get("model"),
    )
    now = time.monotonic()
    with _INDEX_MONTH_CACHE_LOCK:
        if (
            _INDEX_MONTH_CACHE.get("key") == key
            and now < float(_INDEX_MONTH_CACHE.get("expires_at") or 0)
        ):
            return deepcopy(_INDEX_MONTH_CACHE.get("payload"))
    try:
        from ..judgment_index import index_month_coverage

        coverage = index_month_coverage(
            session_factory,
            version_id=index.get("version_id"),
            collection=str(index.get("collection") or ""),
            model=str(index.get("model") or ""),
        )
    except Exception:
        logger.warning("無法查詢索引月份覆蓋", exc_info=True)
        return None
    months = coverage.get("months") or []
    if not months:
        return None
    remaining = int(index.get("remaining") or 0)
    payload = {
        "available": True,
        "coverage_only": True,
        "run_id": None,
        "run_status": "success" if remaining <= 0 else "partial",
        "run_message": "目前 active collection 的索引覆蓋",
        "version_id": index.get("version_id"),
        "collection": index.get("collection"),
        "alias": index.get("alias") or settings.judgment_vector_alias,
        "build_mode": "active",
        "model": index.get("model"),
        "batch_size": None,
        "expected_count": index.get("total"),
        "embedding": {
            "status": "unknown",
            "hosts": [],
            "selected": {},
            "active": {},
        },
        "months": months,
        "current": {},
        "summary": {
            "indexed": index.get("indexed"),
            "total": index.get("total"),
            "reused": None,
            "embedded": None,
            "points_upserted": None,
        },
        "status": "success" if remaining <= 0 else "partial",
        "started_at": None,
        "finished_at": index.get("latest_indexed_at"),
    }
    with _INDEX_MONTH_CACHE_LOCK:
        _INDEX_MONTH_CACHE.update(
            {"key": key, "expires_at": now + 60.0, "payload": deepcopy(payload)}
        )
    return payload


def _database_metrics(session_factory) -> Dict[str, Any]:
    result: Dict[str, Any] = {
        "status": "unavailable",
        "error": "",
        "judgment_count": None,
        "law_count": None,
        "order_count": None,
        "law_article_count": None,
        "order_article_count": None,
        "judgment_months": {},
        "latest_versions": {},
        "versions": [],
    }
    if session_factory is None:
        result["error"] = "沒有可用的 PostgreSQL session"
        return result
    try:
        with session_factory() as session:
            result["judgment_count"] = int(
                session.scalar(
                    select(func.count())
                    .select_from(JudgmentDocument)
                    .where(JudgmentDocument.is_current.is_(True))
                )
                or 0
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
            month_rows = session.execute(
                select(
                    JudgmentDocument.issue_month,
                    func.count(JudgmentDocument.id),
                )
                .where(JudgmentDocument.is_current.is_(True))
                .group_by(JudgmentDocument.issue_month)
            ).all()
            result["judgment_months"] = {
                str(month): int(count or 0)
                for month, count in month_rows
                if str(month or "")
            }
            versions = session.scalars(
                select(LawDatasetVersion).order_by(
                    LawDatasetVersion.source_type,
                    LawDatasetVersion.downloaded_at,
                )
            ).all()
            for version in versions:
                key = str(version.source_type or "")
                info = {
                    "id": int(version.id),
                    "source_type": version.source_type,
                    "version_code": version.version_code
                    or version_code_for_datetime(version.downloaded_at),
                    "update_date": version.update_date,
                    "law_count": int(version.law_count or 0),
                    "article_count": int(version.article_count or 0),
                    "downloaded_at": _iso(version.downloaded_at),
                    "parquet_path": version.parquet_path,
                    "is_current": bool(version.is_current),
                }
                result["versions"].append(info)
                if key and version.is_current:
                    result["latest_versions"][key] = info
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
            "error": f"無法掃描原始資料備份：{exc.__class__.__name__}: {exc}",
        }
    return {
        "available": True,
        "count": count,
        "latest": latest,
        "totals": totals,
        "error": "",
    }


_RAW_PARQUET_MONTHS_CACHE: Dict[str, Any] = {
    "path": "",
    "expires_at": 0.0,
    "months": {},
}


def _judgment_raw_parquet_months(settings: Settings) -> Dict[str, Any]:
    """Return the latest raw Parquet backup for each judgment month."""

    root = Path(settings.judgment_data_dir).expanduser().resolve()
    now = time.monotonic()
    if (
        _RAW_PARQUET_MONTHS_CACHE.get("path") == str(root)
        and now < float(_RAW_PARQUET_MONTHS_CACHE.get("expires_at") or 0)
    ):
        return deepcopy(_RAW_PARQUET_MONTHS_CACHE.get("months") or {})
    months: Dict[str, Any] = {}
    try:
        manifests = latest_raw_manifests(root)
    except Exception:
        logger.warning("無法掃描判決原始 Parquet 備份", exc_info=True)
        manifests = []
    for item in manifests:
        payload = item.get("manifest") or {}
        month = _archive_month(payload.get("archive_name"))
        if not month:
            month = _archive_month(item.get("path"))
        if not month:
            continue
        months[month] = {
            "month": month,
            "archive": str(payload.get("archive_name") or ""),
            "row_count": int(payload.get("row_count") or 0),
            "created_at": payload.get("created_at"),
            "path": str(item.get("path") or ""),
        }
    _RAW_PARQUET_MONTHS_CACHE.update(
        {
            "path": str(root),
            "expires_at": now + 30.0,
            "months": deepcopy(months),
        }
    )
    return months


def _law_raw_backup_metrics(settings: Settings) -> Dict[str, Any]:
    root = Path(settings.law_data_dir).expanduser().resolve() / "raw_parquet"
    result: Dict[str, Any] = {}
    for source in ("law", "order"):
        manifests = sorted(
            (root / source).glob("*/*/manifest.json"),
            key=lambda item: item.stat().st_mtime if item.exists() else 0,
            reverse=True,
        )
        parsed_manifests: List[Dict[str, Any]] = []
        for manifest_path in manifests:
            try:
                payload = json.loads(manifest_path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            if not isinstance(payload, dict):
                continue
            parsed_manifests.append(
                {**payload, "manifest_path": str(manifest_path)}
            )
        result[source] = {
            "available": (root / source).is_dir(),
            "count": len(manifests),
            "latest": parsed_manifests[0] if parsed_manifests else None,
            "manifests": parsed_manifests,
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
            "pending": None,
            "missing": None,
            "changed": None,
            "stale": None,
            "fresh": None,
        }
    try:
        from ..index_versions import active_version
        from ..judgment_index import index_coverage, index_staleness

        active = active_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
        collection = (
            active["physical_collection"]
            if active
            else settings.judgment_vector_collection
        )
        version_id = active["version_id"] if active else None
        coverage = index_coverage(
            session_factory,
            collection=collection,
            model=settings.embedding_model,
            version_id=version_id,
        )
        staleness = index_staleness(
            session_factory,
            collection=collection,
            model=settings.embedding_model,
            version_id=version_id,
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
            "alias": settings.judgment_vector_alias,
            "version_id": version_id,
            "model": coverage.get("model"),
            "latest_indexed_at": coverage.get("latest_indexed_at"),
            "pending": int(staleness.get("pending_judgments") or 0),
            "missing": int(staleness.get("missing_judgments") or 0),
            "changed": int(staleness.get("changed_judgments") or 0),
            "stale": int(staleness.get("stale_judgments") or 0),
            "fresh": staleness.get("fresh"),
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
                .where(
                    JudgmentDocument.source_archive != "",
                    JudgmentDocument.is_current.is_(True),
                )
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
        "processed_names": sorted(processed_names),
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


def _section_item_count(items: Sequence[Dict[str, Any]]) -> int:
    return sum(max(1, int(item.get("count") or 1)) for item in items)


def _work_item(
    item_id: str,
    label: str,
    detail: str = "",
    *,
    status: str = "pending",
    count: int = 1,
    workflow_id: str = "",
    action_label: str = "",
    checked_at: Optional[str] = None,
) -> Dict[str, Any]:
    return {
        "id": item_id,
        "label": label,
        "detail": detail,
        "status": status,
        "count": int(count),
        "workflow_id": workflow_id,
        "action_label": action_label,
        "checked_at": checked_at,
    }


def _run_actions(items: Sequence[Dict[str, Any]]) -> List[Dict[str, Any]]:
    actions: List[Dict[str, Any]] = []
    seen = set()
    for item in items:
        workflow_id = str(item.get("workflow_id") or "")
        if not workflow_id or workflow_id in seen:
            continue
        seen.add(workflow_id)
        actions.append(
            {
                "id": f"run-{workflow_id}",
                "label": item.get("action_label") or "執行更新",
                "kind": "run_workflow",
                "workflow_id": workflow_id,
            }
        )
    return actions


def _check_updates_action(
    source_types: Sequence[str], label: str = "重新檢查"
) -> Dict[str, Any]:
    return {
        "id": "recheck-updates",
        "label": label,
        "kind": "check_updates",
        "source_types": list(source_types),
    }


def _refresh_action(label: str = "重新檢查") -> Dict[str, Any]:
    return {"id": "recheck-processing", "label": label, "kind": "refresh"}


def _combine_status(statuses: Sequence[str]) -> str:
    priority = (
        "running",
        "failed",
        "partial",
        "update",
        "pending",
        "stale",
        "unavailable",
        "success",
        "no_change",
        "skipped",
        "idle",
    )
    values = {str(status or "") for status in statuses}
    for status in priority:
        if status in values:
            return status
    return "idle"


def _latest_stage_run(
    runs: Sequence[Dict[str, Any]],
    *,
    branches: Sequence[str],
    stage_key: str,
) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    """Return the newest run that actually recorded this stage."""

    allowed = set(branches)
    for run in runs:
        if run.get("branch") not in allowed:
            continue
        stage = (run.get("stages") or {}).get(stage_key)
        if not isinstance(stage, dict):
            continue
        status = str(stage.get("status") or "")
        if status in {
            "running",
            "success",
            "no_change",
            "failed",
            "interrupted",
            "skipped",
        }:
            return stage, run
    return None, None


def _stage_phase(stage: Dict[str, Any]) -> str:
    status = str(stage.get("status") or "")
    if status == "running":
        return "running"
    if status in {"success", "no_change"}:
        return "completed"
    if status == "failed":
        return "failed"
    if status == "ready":
        return "ready"
    if status == "skipped":
        return "skipped"
    if status == "update":
        return "update_available"
    if status == "pending":
        return "pending"
    return "idle"


def _mark_stage_phase(stage: Dict[str, Any]) -> Dict[str, Any]:
    phase = _stage_phase(stage)
    stage["phase"] = phase
    stage["show_progress"] = phase in {"running", "completed"}
    if phase == "completed":
        stage["percent"] = 100.0
    elif phase != "running":
        stage["percent"] = None
    return stage


def _section_stage(
    key: str,
    *,
    lanes: Sequence[Dict[str, Any]],
    update_items: Optional[Sequence[Dict[str, Any]]] = None,
    pending_items: Optional[Sequence[Dict[str, Any]]] = None,
    actions: Optional[Sequence[Dict[str, Any]]] = None,
    recheck: Optional[Dict[str, Any]] = None,
    note: str = "",
) -> Dict[str, Any]:
    update_items = list(update_items or [])
    pending_items = list(pending_items or [])
    lane_phases = [
        str((lane.get("stage") or {}).get("phase") or "idle")
        for lane in lanes
    ]
    if "running" in lane_phases:
        phase = "running"
    elif "failed" in lane_phases:
        phase = "failed"
    elif update_items:
        phase = "update_available"
    elif pending_items or "pending" in lane_phases:
        phase = "pending"
    elif lane_phases and all(item == "completed" for item in lane_phases):
        phase = "completed"
    elif any(item in {"completed", "ready"} for item in lane_phases):
        phase = "ready"
    elif lane_phases and all(item == "skipped" for item in lane_phases):
        phase = "skipped"
    else:
        phase = "idle"

    status = {
        "running": "running",
        "failed": "failed",
        "update_available": "update",
        "pending": "pending",
        "completed": "success",
        "ready": "ready",
        "skipped": "skipped",
        "idle": "idle",
    }.get(phase, "idle")
    show_progress = phase in {"running", "completed"}
    if phase == "completed":
        percent = 100.0
    elif phase == "running":
        percents = [
            float(lane["stage"]["percent"])
            for lane in lanes
            if (lane.get("stage") or {}).get("percent") is not None
        ]
        percent = round(sum(percents) / len(percents), 1) if percents else None
    else:
        percent = None

    currents = [
        int(lane["stage"]["current"])
        for lane in lanes
        if (lane.get("stage") or {}).get("current") is not None
    ]
    totals = [
        int(lane["stage"]["total"])
        for lane in lanes
        if (lane.get("stage") or {}).get("total") is not None
    ]
    current = sum(currents) if currents else None
    total = sum(totals) if totals else None
    rates = [
        float(lane["stage"]["rate"])
        for lane in lanes
        if (lane.get("stage") or {}).get("rate") is not None
    ]
    rate = max(rates) if rates else None

    messages = [
        str((lane.get("stage") or {}).get("message") or "").strip()
        for lane in lanes
    ]
    message = " · ".join(
        f"{lane.get('label')}：{text}"
        for lane, text in zip(lanes, messages)
        if text
    )
    if not message:
        message = note

    definition = STAGE_CATALOG.get(key, {})
    unit = next(
        (
            str((lane.get("stage") or {}).get("unit"))
            for lane in lanes
            if (lane.get("stage") or {}).get("unit")
        ),
        definition.get("unit", ""),
    )
    return {
        "key": key,
        "label": definition.get("label", key),
        "short_label": {
            "download": "比對／更新",
            "raw_parquet": "原始 Parquet",
            "parse": "解析",
            "postgres": "PostgreSQL",
            "legal_qdrant": "法規索引",
            "extract": "解壓縮",
            "filter": "篩選",
            "qdrant": "Qdrant",
        }.get(key, definition.get("label", key)),
        "color": definition.get("color", "#64748b"),
        "unit": unit,
        "icon": STAGE_ICONS.get(key, "cube"),
        "status": status,
        "phase": phase,
        "show_progress": show_progress,
        "percent": percent,
        "current": current,
        "total": total,
        "rate": rate,
        "message": message,
        "lanes": list(lanes),
        "update": {
            "count": _section_item_count(update_items),
            "items": update_items,
        },
        "pending": {
            "count": _section_item_count(pending_items),
            "items": pending_items,
        },
        "actions": list(actions or []),
        "recheck": recheck or _refresh_action(),
        "note": note,
    }


def _legal_source_info(
    source: str, version: Dict[str, Any]
) -> Dict[str, Any]:
    return {
        "label": BRANCH_META[source]["label"],
        "version_id": version.get("id"),
        "version_code": str(version.get("version_code") or ""),
        "update_date": version.get("update_date"),
        "downloaded_at": version.get("downloaded_at"),
        "law_count": version.get("law_count"),
        "article_count": version.get("article_count"),
    }


def _last_run_brief(run: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not run:
        return {}
    return {
        "id": run.get("id"),
        "status": run.get("status"),
        "finished_at": run.get("finished_at"),
        "started_at": run.get("started_at"),
        "duration_ms": int(run.get("duration_ms") or 0),
    }


def _legal_lane_stage(
    source: str,
    key: str,
    *,
    runs: Sequence[Dict[str, Any]],
    database: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
    update_sources: Dict[str, Any],
) -> Dict[str, Any]:
    version = (database.get("latest_versions") or {}).get(source) or {}
    update_record = update_sources.get(source) or {}
    raw_info = (law_raw_backups or {}).get(source) or {}
    latest_raw = raw_info.get("latest") or {}
    count = _safe_int(database.get(f"{source}_count"))
    article_count = _safe_int(database.get(f"{source}_article_count"))
    version_count = _safe_int(version.get("law_count"))
    version_articles = _safe_int(version.get("article_count"))

    last_stage, last_run = _latest_stage_run(
        runs,
        branches=(source, "system") if key == "download" else (source,),
        stage_key=key,
    )
    if last_stage is not None and str(last_stage.get("status")) == "skipped":
        last_stage = None
    stage = (
        _stage_view(last_stage, last_run or {})
        if last_stage is not None
        else None
    )

    if key == "download":
        local_size = None
        download_path = str(update_record.get("download_path") or "")
        if download_path:
            try:
                local_size = Path(download_path).stat().st_size
            except OSError:
                local_size = None
        remote_size = _safe_int(update_record.get("remote_content_length"))
        comparison = {
            "unit": "bytes",
            "local_size": local_size,
            "remote_size": remote_size,
            "diff_bytes": (
                remote_size - local_size
                if remote_size is not None and local_size is not None
                else None
            ),
            "same_size": bool(
                remote_size is not None
                and local_size is not None
                and remote_size == local_size
            ),
            "available": bool(update_record.get("update_available")),
            "checked_at": update_record.get("checked_at"),
            "message": str(update_record.get("message") or ""),
        }
        if stage is None:
            if update_record.get("update_available"):
                stage = _idle_node(
                    key,
                    status="update",
                    current=version_count,
                    total=version_count,
                    message=str(
                        update_record.get("message") or "線上已有更新版本"
                    ),
                )
            elif version:
                stage = _idle_node(
                    key,
                    status="ready",
                    current=version_count,
                    total=version_count,
                    message=(
                        f"目前版本 #{version.get('id')}；來源更新日 "
                        f"{version.get('update_date') or '—'}"
                    ),
                )
            else:
                stage = _idle_node(
                    key, status="idle", message="尚未下載任何版本"
                )
        stage["unit"] = "筆"
        stage["current"] = version_count
        stage["total"] = version_count
        stage["comparison"] = comparison
        stage["stats"] = [
            {
                "label": "目前版本",
                "value": f"#{version.get('id')}" if version else "尚未下載",
            },
            {
                "label": "來源更新日",
                "value": str(version.get("update_date") or "—"),
            },
        ]
        stage["source"] = _legal_source_info(source, version)
        stage["last_run"] = _last_run_brief(last_run)
        return _mark_stage_phase(stage)

    if key == "raw_parquet":
        raw_rows = _safe_int(latest_raw.get("row_count")) or version_count
        if stage is None:
            stage = (
                _idle_node(
                    key,
                    status="ready",
                    current=raw_rows,
                    total=raw_rows,
                    message=(
                        f"最新原始 Parquet {raw_rows:,} 筆；磁碟備份 "
                        f"{int(raw_info.get('count') or 0):,} 檔"
                    ),
                )
                if raw_rows
                else _idle_node(
                    key, status="idle", message="尚無原始 Parquet 備份"
                )
            )
        stage["unit"] = "筆"
        stage["current"] = raw_rows
        stage["total"] = raw_rows
        stage["stats"] = [
            {
                "label": "磁碟備份",
                "value": f"{int(raw_info.get('count') or 0):,} 檔",
            },
            {
                "label": "最新備份",
                "value": f"{raw_rows:,} 筆" if raw_rows else "—",
            },
        ]
        stage["source"] = _legal_source_info(source, version)
        stage["last_run"] = _last_run_brief(last_run)
        return _mark_stage_phase(stage)

    if key == "parse":
        if stage is None:
            stage = (
                _idle_node(
                    key,
                    status="ready",
                    current=version_count,
                    total=version_count,
                    message=(
                        f"已解析 {version_count or 0:,} 筆；"
                        f"{version_articles or 0:,} 條文"
                    ),
                )
                if version_count or version_articles
                else _idle_node(key, status="idle", message="尚無解析結果")
            )
        stage["current"] = version_count
        stage["total"] = version_count
        stage["stats"] = [
            {
                "label": "法規／命令",
                "value": f"{version_count or 0:,}",
            },
            {"label": "條文", "value": f"{version_articles or 0:,}"},
        ]
        stage["source"] = _legal_source_info(source, version)
        stage["last_run"] = _last_run_brief(last_run)
        return _mark_stage_phase(stage)

    if key == "postgres":
        if stage is None:
            stage = (
                _idle_node(
                    key,
                    status="ready",
                    current=count,
                    total=count,
                    message=(
                        f"PostgreSQL 目前 {count:,} 筆；"
                        f"{article_count or 0:,} 條文"
                    ),
                )
                if count
                else _idle_node(
                    key, status="idle", message="PostgreSQL 尚無資料"
                )
            )
        stage["current"] = count
        stage["total"] = count
        stage["stats"] = [
            {"label": "目前筆數", "value": f"{count or 0:,}"},
            {"label": "條文", "value": f"{article_count or 0:,}"},
        ]
        stage["source"] = _legal_source_info(source, version)
        stage["last_run"] = _last_run_brief(last_run)
        return _mark_stage_phase(stage)

    return _mark_stage_phase(
        _idle_node(key, status="idle", message="尚無資料")
    )


def _legal_index_section_stage(
    *,
    legal_index: Dict[str, Any],
    runs: Sequence[Dict[str, Any]],
    database: Dict[str, Any],
) -> Dict[str, Any]:
    status = str(legal_index.get("status") or "unknown")
    article_count = _safe_int(legal_index.get("article_count"))
    if article_count is None:
        article_count = int(database.get("law_article_count") or 0) + int(
            database.get("order_article_count") or 0
        )
    points = _safe_int(legal_index.get("points_count"))
    last_stage, last_run = _latest_stage_run(
        runs, branches=("law", "system"), stage_key="legal_qdrant"
    )
    if last_stage is not None and str(last_stage.get("status")) == "skipped":
        last_stage = None
    running = False
    if last_stage is not None:
        stage = _stage_view(last_stage, last_run or {})
        stage["last_run"] = _last_run_brief(last_run)
        running = str(stage.get("status") or "") == "running"
    elif status == "fresh":
        stage = _idle_node(
            "legal_qdrant",
            status="ready",
            current=points,
            total=points or article_count,
            message=(
                f"索引 {points or 0:,} 條；active "
                f"v{int(legal_index.get('version_id') or 0):03d}"
            ),
        )
    elif status in {"stale", "not_indexed"}:
        stage = _idle_node(
            "legal_qdrant",
            status="pending",
            current=points,
            total=article_count or points,
            message="；".join(legal_index.get("reasons") or [])
            or "索引需要重建",
        )
    else:
        stage = _idle_node(
            "legal_qdrant",
            status="unavailable",
            current=points,
            total=article_count or points,
            message="無法取得法規／命令索引狀態",
        )
    if not running:
        stage["current"] = points
        stage["total"] = points or article_count
    versions = database.get("latest_versions") or {}
    stage["stats"] = [
        {
            "label": "Alias",
            "value": str(legal_index.get("alias") or "—"),
        },
        {
            "label": "Collection",
            "value": str(legal_index.get("collection") or "—"),
        },
        {
            "label": "Points",
            "value": f"{points or 0:,}",
        },
    ]
    if running and stage.get("rate") is not None:
        stage["stats"].append(
            {
                "label": "速度",
                "value": f"{float(stage['rate']):,.1f} 條/秒",
            }
        )
    stage = _mark_stage_phase(stage)
    lanes: List[Dict[str, Any]] = []
    for source, accent in (("law", "#22d3ee"), ("order", "#f472b6")):
        source_info = _legal_source_info(
            source, versions.get(source) or {}
        )
        lane_stage = deepcopy(stage)
        lane_stage["source"] = source_info
        lane_stage.pop("sources", None)
        source_articles = _safe_int(
            database.get(f"{source}_article_count")
        )
        if running:
            lane_stage["current"] = stage.get("current")
            lane_stage["total"] = stage.get("total")
        else:
            lane_stage["current"] = source_articles
            lane_stage["total"] = source_articles
        lane_stage["stats"] = [
            {
                "label": "條文",
                "value": f"{source_articles or 0:,}",
            },
            {
                "label": "版本編號",
                "value": source_info.get("version_code") or "—",
            },
        ]
        lanes.append(
            {
                "source": source,
                "label": BRANCH_META[source]["label"],
                "accent": accent,
                "stage": lane_stage,
            }
        )

    pending_items: List[Dict[str, Any]] = []
    if str(legal_index.get("status") or "") in {"stale", "not_indexed"}:
        reasons = list(legal_index.get("reasons") or [])
        pending_items.append(
            _work_item(
                "legal-index-rebuild",
                "法規／命令索引",
                "；".join(reasons)
                or "目前條文與 active 索引版本不一致，需要重建。",
                status="pending",
                workflow_id="legal_index_versions",
                action_label="升級索引",
            )
        )
    recheck = _refresh_action()
    section_stage = _section_stage(
        "legal_qdrant",
        lanes=lanes,
        pending_items=pending_items,
        actions=_run_actions(pending_items),
        recheck=recheck,
        note="法規／命令索引由同一份 active 版本提供；內容未變更時會跳過重建。展開此階段可切換 Embedding 主機與模型。",
    )
    if running:
        section_stage["current"] = stage.get("current")
        section_stage["total"] = stage.get("total")
        section_stage["rate"] = stage.get("rate")
        section_stage["percent"] = stage.get("percent")
    return section_stage


def _legal_section_stages(
    *,
    runs: Sequence[Dict[str, Any]],
    database: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
    update_sources: Dict[str, Any],
    legal_index: Dict[str, Any],
) -> List[Dict[str, Any]]:
    stages: List[Dict[str, Any]] = []
    for key in SECTION_STAGE_KEYS["legal"]:
        if key == "legal_qdrant":
            stages.append(
                _legal_index_section_stage(
                    legal_index=legal_index,
                    runs=runs,
                    database=database,
                )
            )
            continue

        lanes = []
        for source in ("law", "order"):
            stage = _legal_lane_stage(
                source,
                key,
                runs=runs,
                database=database,
                law_raw_backups=law_raw_backups,
                update_sources=update_sources,
            )
            lanes.append(
                {
                    "source": source,
                    "label": BRANCH_META[source]["label"],
                    "accent": "#22d3ee" if source == "law" else "#f472b6",
                    "stage": stage,
                }
            )

        update_items: List[Dict[str, Any]] = []
        if key == "download":
            for source in ("law", "order"):
                record = update_sources.get(source) or {}
                if not record.get("update_available"):
                    continue
                label = BRANCH_META[source]["label"]
                update_items.append(
                    _work_item(
                        f"{source}-remote-update",
                        label,
                        str(record.get("message") or "線上已有更新版本"),
                        status="update",
                        workflow_id=f"{source}_download",
                        action_label=f"升級{label}",
                        checked_at=record.get("checked_at"),
                    )
                )
        pending_items = list(update_items)
        notes = {
            "download": "比對以遠端 ZIP Content-Length 與本機檔案大小為準；大小不同才列為可更新。更新按鈕只重新比對，升級按鈕才會下載並套用更新。",
            "raw_parquet": "下載流程會自動寫入原始 Parquet；內容未變更時會跳過。",
            "parse": "下載流程會自動解析條文；內容未變更時會跳過。",
            "postgres": "下載流程會自動更新 PostgreSQL；內容未變更時會跳過。",
        }
        stages.append(
            _section_stage(
                key,
                lanes=lanes,
                update_items=update_items,
                pending_items=pending_items,
                actions=_run_actions(pending_items),
                recheck=(
                    _check_updates_action(("law", "order"))
                    if key == "download"
                    else _refresh_action()
                ),
                note=notes.get(key, ""),
            )
        )
    return stages


def _judgment_section_stages(
    *,
    runs: Sequence[Dict[str, Any]],
    database: Dict[str, Any],
    index: Dict[str, Any],
    local: Dict[str, Any],
    raw_backups: Dict[str, Any],
    update_sources: Dict[str, Any],
) -> List[Dict[str, Any]]:
    stages: List[Dict[str, Any]] = []
    total_archives = int(local.get("total") or 0)
    processed_archives = int(local.get("processed") or 0)
    unprocessed = int(local.get("unprocessed") or 0)
    active_import = _active_run(runs, kind="import")
    coverage_message = (
        f"已處理 {processed_archives:,} / {total_archives:,} 個壓縮檔；"
        f"待匯入 {unprocessed:,} 個"
    )

    for key in SECTION_STAGE_KEYS["judgment"]:
        last_stage, last_run = _latest_stage_run(
            runs,
            branches=(
                ("judgment", "system")
                if key in {"postgres", "qdrant"}
                else ("judgment",)
            ),
            stage_key=key,
        )
        if last_stage is not None and str(last_stage.get("status")) == "skipped":
            last_stage = None
        stage = (
            _stage_view(last_stage, last_run or {})
            if last_stage is not None
            else None
        )

        if key == "download":
            record = update_sources.get("judgment") or {}
            details = record.get("details") or {}
            pending_months = int(details.get("pending_count") or 0)
            if stage is None:
                if pending_months > 0:
                    stage = _idle_node(
                        "download",
                        status="update",
                        current=max(0, total_archives - pending_months),
                        total=total_archives or None,
                        message=str(
                            record.get("message")
                            or f"待補齊 {pending_months:,} 個月"
                        ),
                    )
                elif total_archives:
                    stage = _idle_node(
                        "download",
                        status="ready",
                        current=total_archives,
                        total=total_archives,
                        message=f"{total_archives:,} 個月壓縮檔已就緒",
                    )
                else:
                    stage = _idle_node(
                        "download",
                        status="idle",
                        message="尚未下載判決壓縮檔",
                    )
            stage["unit"] = "個月"
            stage["current"] = total_archives
            stage["total"] = total_archives
            stage["comparison"] = {
                "unit": "months",
                "local_months": total_archives,
                "remote_pending": pending_months,
                "available": pending_months > 0,
                "message": str(record.get("message") or ""),
            }
            stage["stats"] = [
                {
                    "label": "已下載",
                    "value": f"{total_archives:,} 個月",
                },
                {
                    "label": "待補齊",
                    "value": f"{pending_months:,} 個月",
                },
            ]
            stage["last_run"] = _last_run_brief(last_run)
            stage = _mark_stage_phase(stage)
            update_items: List[Dict[str, Any]] = []
            if pending_months > 0:
                resume = str(details.get("resume_from_month") or "")
                update_items.append(
                    _work_item(
                        "judgment-remote-update",
                        "判決下載",
                        (
                            f"待補齊 {pending_months:,} 個月"
                            + (f"；從 {resume} 續傳" if resume else "")
                        ),
                        status="update",
                        count=pending_months,
                        workflow_id="judgment_download",
                        action_label="升級判決",
                        checked_at=record.get("checked_at"),
                    )
                )
            stages.append(
                _section_stage(
                    "download",
                    lanes=[
                        {
                            "source": "judgment",
                            "label": "判決",
                            "accent": "#a78bfa",
                            "stage": stage,
                        }
                    ],
                    update_items=update_items,
                    pending_items=update_items,
                    actions=_run_actions(update_items),
                    recheck=_check_updates_action(("judgment",)),
                    note="更新按鈕只比對線上版本；升級按鈕才會下載並套用更新。",
                )
            )
            continue

        if key == "qdrant":
            pending = _safe_int(index.get("pending"))
            if pending is None:
                pending = _safe_int(index.get("remaining"))
            if stage is None:
                if index.get("status") == "operational" and not pending:
                    stage = _idle_node(
                        "qdrant",
                        status="ready",
                        current=_safe_int(index.get("indexed")),
                        total=_safe_int(index.get("total")),
                        message="Qdrant 索引已就緒，沒有待處理判決。",
                    )
                elif index.get("status") == "operational":
                    stage = _idle_node(
                        "qdrant",
                        status="pending",
                        current=_safe_int(index.get("indexed")),
                        total=_safe_int(index.get("total")),
                        message=f"尚餘 {int(pending or 0):,} 筆判決待索引。",
                    )
                else:
                    stage = _idle_node(
                        "qdrant",
                        status="unavailable",
                        message=str(
                            index.get("error") or "無法取得 Qdrant 索引狀態"
                        ),
                    )
            pending_items: List[Dict[str, Any]] = []
            if pending and pending > 0:
                breakdown = []
                for field, label in (
                    ("missing", "缺少索引"),
                    ("changed", "內容變更"),
                    ("stale", "已移除但仍存在"),
                ):
                    value = _safe_int(index.get(field))
                    if value:
                        breakdown.append(f"{label} {value:,} 筆")
                pending_items.append(
                    _work_item(
                        "judgment-index-rebuild",
                        "Qdrant 索引",
                        "；".join(breakdown)
                        or f"待處理 {int(pending):,} 筆判決。",
                        status="pending",
                        count=int(pending),
                        workflow_id="index_versions",
                        action_label="升級索引",
                    )
                )
            stage["current"] = _safe_int(index.get("indexed"))
            stage["total"] = _safe_int(index.get("total"))
            stage["stats"] = [
                {
                    "label": "索引覆蓋",
                    "value": (
                        f"{int(index.get('indexed') or 0):,} / "
                        f"{int(index.get('total') or 0):,}"
                    ),
                },
                {
                    "label": "待處理",
                    "value": f"{int(pending or 0):,} 筆",
                },
            ]
            stage["last_run"] = _last_run_brief(last_run)
            stage = _mark_stage_phase(stage)
            stages.append(
                _section_stage(
                    "qdrant",
                    lanes=[
                        {
                            "source": "judgment",
                            "label": "判決",
                            "accent": "#a78bfa",
                            "stage": stage,
                        }
                    ],
                    pending_items=pending_items,
                    actions=_run_actions(pending_items),
                    recheck=_refresh_action(),
                    note="索引更新採 blue-green：建立新版本、驗證後才切換 alias。",
                )
            )
            continue

        # extract / raw_parquet / filter / postgres are all part of the
        # judgment import workflow.  Show one shared archive coverage so the
        # waterfall does not pretend these stages have independent progress.
        if stage is None:
            if unprocessed > 0:
                stage = _idle_node(
                    key,
                    status="pending",
                    current=processed_archives,
                    total=total_archives or None,
                    message=coverage_message,
                )
            elif total_archives:
                stage = _idle_node(
                    key,
                    status="ready",
                    current=processed_archives,
                    total=total_archives,
                    message=f"{processed_archives:,} 個壓縮檔已全部處理",
                )
            else:
                stage = _idle_node(
                    key, status="idle", message="尚無判決壓縮檔"
                )
        elif unprocessed > 0 and str(stage.get("status")) != "running":
            # A completed import run is not 100% of the archive backlog.
            stage["status"] = "pending"
            stage["message"] = coverage_message
            stage["percent"] = None

        stage["unit"] = "個"
        # The underlying import stages measure rows/bytes, while these cards
        # show archive coverage.  Their stored rate would not match the
        # displayed unit, so only the legal/qdrant index stages keep a rate.
        stage["rate"] = None
        archive_metric = (
            _archive_stage_metric(active_import, key)
            if active_import is not None
            else None
        )
        if archive_metric is not None and archive_metric[1]:
            completed, archive_total, archive_percent = archive_metric
            stage["current"] = int(completed)
            stage["total"] = archive_total
            if str(stage.get("status")) == "running":
                stage["percent"] = archive_percent
            if key in {"filter", "postgres"} and completed <= 0:
                stage["message"] = (
                    "等待原始資料檢查／Parquet 備份完成後開始金融法規篩選。"
                    if key == "filter"
                    else "等待金融法規篩選完成後寫入 PostgreSQL。"
                )
        else:
            stage["current"] = processed_archives
            stage["total"] = total_archives
        if key == "extract":
            stage["stats"] = [
                {
                    "label": "壓縮檔",
                    "value": f"{total_archives:,} 個",
                },
                {
                    "label": "待匯入",
                    "value": f"{unprocessed:,} 個",
                },
            ]
        elif key == "raw_parquet":
            raw_totals = raw_backups.get("totals") or {}
            stage["stats"] = [
                {
                    "label": "磁碟備份",
                    "value": f"{int(raw_backups.get('count') or 0):,} 檔",
                },
                {
                    "label": "備份筆數",
                    "value": f"{int(raw_totals.get('row_count') or 0):,} 筆",
                },
            ]
        elif key == "filter":
            stage["stats"] = [
                {
                    "label": "已處理",
                    "value": f"{processed_archives:,} 個",
                },
                {
                    "label": "待匯入",
                    "value": f"{unprocessed:,} 個",
                },
            ]
        elif key == "postgres":
            stage["stats"] = [
                {
                    "label": "資料庫判決",
                    "value": f"{int(database.get('judgment_count') or 0):,} 筆",
                },
                {
                    "label": "待匯入",
                    "value": f"{unprocessed:,} 個",
                },
            ]

        pending_items = []
        if key == "postgres" and unprocessed > 0:
            for item in (local.get("items") or []):
                if item.get("processed"):
                    continue
                pending_items.append(
                    _work_item(
                        f"archive:{item.get('name')}",
                        str(item.get("name") or ""),
                        (
                            f"{_format_size(item.get('size_bytes'))} · 未匯入"
                            if item.get("size_bytes")
                            else "尚未匯入"
                        ),
                        status="pending",
                    )
                )
        stage["last_run"] = _last_run_brief(last_run)
        stage = _mark_stage_phase(stage)
        stages.append(
            _section_stage(
                key,
                lanes=[
                    {
                        "source": "judgment",
                        "label": "判決",
                        "accent": "#a78bfa",
                        "stage": stage,
                    }
                ],
                pending_items=pending_items,
                actions=(
                    [
                        {
                            "id": "run-judgment_import",
                            "label": "升級判決資料",
                            "kind": "run_workflow",
                            "workflow_id": "judgment_import",
                        }
                    ]
                    if pending_items
                    else []
                ),
                recheck=_refresh_action(),
                note=(
                    "判決匯入會一次處理所有未匯入壓縮檔；"
                    "下方可展開查看待處理清單。"
                    if key == "postgres"
                    else "此階段由判決匯入流程處理。"
                ),
            )
        )
    return stages


def _build_processing_sections(
    *,
    runs: Sequence[Dict[str, Any]],
    database: Dict[str, Any],
    index: Dict[str, Any],
    legal_index: Dict[str, Any],
    local: Dict[str, Any],
    raw_backups: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
    update_state: Dict[str, Any],
    embedding_runtime: Dict[str, Any],
) -> List[Dict[str, Any]]:
    update_sources = update_state.get("sources") or {}
    sections: List[Dict[str, Any]] = []
    for meta in SECTION_META:
        if meta["key"] == "legal":
            stages = _legal_section_stages(
                runs=runs,
                database=database,
                law_raw_backups=law_raw_backups,
                update_sources=update_sources,
                legal_index=legal_index,
            )
            latest_versions = database.get("latest_versions") or {}
            versions = [
                _legal_source_info(source, latest_versions.get(source) or {})
                for source in ("law", "order")
            ]
            versions = [
                version for version in versions if version.get("version_code")
            ]
            sources = [source["key"] for source in meta["sources"]]
        else:
            versions = []
            stages = _judgment_section_stages(
                runs=runs,
                database=database,
                index=index,
                local=local,
                raw_backups=raw_backups,
                update_sources=update_sources,
            )
            sources = ["judgment"]

        for stage in stages:
            if stage.get("key") in {"legal_qdrant", "qdrant"}:
                stage["model"] = dict(embedding_runtime)
            else:
                stage["model"] = {
                    "host": "—",
                    "url": "",
                    "model": "—",
                    "role": "",
                    "label": "不使用模型",
                }

        update_count = sum(
            int((stage.get("update") or {}).get("count") or 0)
            for stage in stages
        )
        pending_count = sum(
            int((stage.get("pending") or {}).get("count") or 0)
            for stage in stages
            if not int((stage.get("update") or {}).get("count") or 0)
        )
        statuses = [str(stage.get("status") or "idle") for stage in stages]
        status = _combine_status(statuses)
        if status not in {"running", "failed", "partial"}:
            if update_count:
                status = "update"
            elif pending_count:
                status = "pending"
        checked_values = [
            str((update_sources.get(source) or {}).get("checked_at") or "")
            for source in sources
        ]
        checked_at = max((value for value in checked_values if value), default="")
        sections.append(
            {
                **meta,
                "status": status,
                "update_count": update_count,
                "pending_count": pending_count,
                "checked_at": checked_at or None,
                "versions": versions,
                "stages": stages,
                "recheck": (
                    _check_updates_action(tuple(sources))
                    if meta["key"] == "legal"
                    else _check_updates_action(("judgment",))
                ),
            }
        )
    return sections


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
        "raw_reused_prefetched": bool(
            archive.get("raw_reused_prefetched")
        ),
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


_JUDGMENT_MANIFEST_CACHE: Dict[str, Any] = {
    "path": "",
    "mtime": 0.0,
    "payload": {},
}


def _judgment_download_manifest(settings: Settings) -> Dict[str, Any]:
    path = (
        Path(settings.judgment_data_dir).expanduser().resolve()
        / "raw_rar"
        / "download_manifest.json"
    )
    try:
        mtime = path.stat().st_mtime
    except OSError:
        return {}
    if (
        _JUDGMENT_MANIFEST_CACHE.get("path") == str(path)
        and float(_JUDGMENT_MANIFEST_CACHE.get("mtime") or 0) == mtime
    ):
        return _JUDGMENT_MANIFEST_CACHE.get("payload") or {}
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
    if not isinstance(payload, dict):
        return {}
    _JUDGMENT_MANIFEST_CACHE.update(
        {"path": str(path), "mtime": mtime, "payload": payload}
    )
    return payload


def _archive_month(name: Any) -> str:
    match = re.match(r"(\d{4})[-_]?(\d{2})", Path(str(name or "")).name)
    if not match:
        return ""
    year, month = match.groups()
    if not 1 <= int(month) <= 12:
        return ""
    return f"{year}{month}"


_IMPORT_ARCHIVE_STAGES = ("extract", "raw_parquet", "filter", "postgres")
_IMPORT_DONE_STAGE_STATUSES = {"success", "skipped"}


def _archive_stage_statuses(item: Dict[str, Any]) -> Dict[str, str]:
    stages = item.get("stages") or {}
    return {
        key: str((stages.get(key) or {}).get("status") or "")
        for key in _IMPORT_ARCHIVE_STAGES
        if isinstance(stages.get(key), dict)
    }


def _archive_running_stages(item: Dict[str, Any]) -> List[str]:
    return [
        key
        for key, status in _archive_stage_statuses(item).items()
        if status == STATE_RUNNING
    ]


def _archive_finished(item: Dict[str, Any]) -> bool:
    statuses = _archive_stage_statuses(item)
    return all(
        statuses.get(key) in _IMPORT_DONE_STAGE_STATUSES
        for key in _IMPORT_ARCHIVE_STAGES
    )


def _archive_started(item: Dict[str, Any]) -> bool:
    if str(item.get("started_at") or "").strip():
        return True
    statuses = list(_archive_stage_statuses(item).values())
    if item.get("raw_reused_prefetched") and item.get("status") != STATE_RUNNING:
        # A prefetched backup is already complete before this run reaches the
        # month.  It should not move the outline until filter/PostgreSQL
        # actually start or the archive fails.
        return any(
            status in {STATE_RUNNING, "failed", "interrupted"}
            for status in statuses
        )
    return any(status and status != "pending" for status in statuses)


def _archive_active_phase(
    archive: Optional[Dict[str, Any]],
    running_stages: Sequence[str],
) -> str:
    current = str((archive or {}).get("current_stage") or "")
    if current and current in running_stages:
        return current
    if running_stages:
        return str(running_stages[-1])
    return current


def _select_import_focus(
    items: Sequence[Dict[str, Any]],
    *,
    current_archive: str = "",
) -> Tuple[
    Optional[Dict[str, Any]],
    Optional[Dict[str, Any]],
    List[str],
]:
    """Pick the month the import outline should follow.

    An import runs its four stages in separate passes over the same archives.
    Each pass starts again at the first archive, so the raw "current archive"
    cursor moves backward between passes (202602 filter -> 202601 filter).
    The outline must not follow that cursor backward: once an archive has
    started and is not fully finished, the highest such month stays circled.
    """

    started: List[Tuple[str, Dict[str, Any]]] = []
    running: List[Tuple[str, Dict[str, Any], List[str]]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        stages = _archive_running_stages(item)
        if stages or item.get("status") == STATE_RUNNING:
            running.append((_archive_month(item.get("name")), item, stages))
        month = _archive_month(item.get("name"))
        if month and _archive_started(item) and not _archive_finished(item):
            started.append((month, item))

    focus: Optional[Dict[str, Any]] = None
    if started:
        _, focus = max(
            started,
            key=lambda pair: (
                pair[0],
                str(pair[1].get("started_at") or ""),
            ),
        )
    elif running:
        _, focus, _ = max(
            running,
            key=lambda triple: (
                triple[0],
                str(triple[1].get("started_at") or ""),
            ),
        )

    cursor: Optional[Dict[str, Any]] = None
    cursor_stages: List[str] = []
    preferred = next(
        (
            item
            for item in items
            if isinstance(item, dict)
            and current_archive
            and str(item.get("name") or "") == current_archive
        ),
        None,
    )
    if preferred is not None:
        preferred_stages = _archive_running_stages(preferred)
        if preferred_stages or preferred.get("status") == STATE_RUNNING:
            cursor = preferred
            cursor_stages = preferred_stages
    if cursor is None and running:
        _, cursor, cursor_stages = max(
            running,
            key=lambda triple: (
                triple[0],
                str(triple[1].get("started_at") or ""),
            ),
        )
    if focus is None and preferred is not None:
        # Snapshot/candidate preparation moves current_archive before the
        # archive itself is marked running.  Follow that cursor so the
        # timeline still shows the month currently being prepared.
        focus = preferred
    return focus, cursor, cursor_stages


def _import_month_timeline(
    settings: Settings,
    local: Dict[str, Any],
    archives: Dict[str, Any],
) -> Dict[str, Any]:
    manifest = _judgment_download_manifest(settings)
    manifest_months = [
        item for item in (manifest.get("months") or []) if isinstance(item, dict)
    ]
    processed_names = set(local.get("processed_names") or [])
    local_by_month: Dict[str, List[Dict[str, Any]]] = {}
    for item in local.get("items") or []:
        key = _archive_month(item.get("name"))
        if key:
            local_by_month.setdefault(key, []).append(item)
    imported_by_month: Dict[str, List[str]] = {}
    for name in processed_names:
        key = _archive_month(name)
        if key:
            imported_by_month.setdefault(key, []).append(name)
    run_meta = (archives.get("run") or {}).get("meta") or {}
    current_meta_archive = str(run_meta.get("current_archive") or "")
    archive_items = [
        item for item in (archives.get("items") or []) if isinstance(item, dict)
    ]
    focus_enabled = bool(archives.get("active", True))
    focus: Optional[Dict[str, Any]] = None
    cursor: Optional[Dict[str, Any]] = None
    cursor_stages: List[str] = []
    if focus_enabled:
        focus, cursor, cursor_stages = _select_import_focus(
            archive_items,
            current_archive=current_meta_archive,
        )
    active_month = _archive_month((focus or {}).get("name"))
    active_archive = str((focus or {}).get("name") or "")
    active_phase = ""
    if cursor is not None:
        active_phase = _archive_active_phase(cursor, cursor_stages)
    elif focus is not None:
        active_phase = str(focus.get("current_stage") or "") or str(
            run_meta.get("current_phase") or ""
        )
    if focus is None and cursor is None and current_meta_archive:
        # External/legacy runs have no per-archive state; fall back to meta.
        active_month = _archive_month(current_meta_archive)
        active_archive = current_meta_archive
        active_phase = str(run_meta.get("current_phase") or "")
    # The outline intentionally stays on the highest started-but-unfinished
    # month.  The filter pass restarts at older archives, so expose the
    # archive/month actually being processed separately instead of moving the
    # outline backward.
    processing_archive = ""
    if cursor is not None:
        processing_archive = str(cursor.get("name") or "")
    elif current_meta_archive:
        processing_archive = current_meta_archive
    elif focus is not None:
        processing_archive = active_archive
    processing_month = _archive_month(processing_archive)
    months: List[Dict[str, Any]] = []
    seen: set[str] = set()

    def build_month(
        key: str,
        *,
        manifest_item: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        locals_for_month = local_by_month.get(key) or []
        local_names = [str(item.get("name") or "") for item in locals_for_month]
        imported_names = sorted(imported_by_month.get(key) or [])
        new_local = sorted(
            name for name in local_names if name and name not in processed_names
        )
        manifest_status = str((manifest_item or {}).get("status") or "")
        has_update = bool(imported_names) and bool(
            new_local or manifest_status == "gray"
        )
        if has_update:
            status = "gray"
        elif imported_names:
            status = "green"
        else:
            status = "red"
        return {
            "month": key,
            "year": int(key[:4]),
            "month_no": int(key[4:6]),
            "status": status,
            "imported": bool(imported_names),
            "has_update": has_update,
            "local_files": local_names,
            "imported_files": imported_names,
            "unimported_files": new_local,
            "manifest_status": manifest_status,
            "latest_filename": str((manifest_item or {}).get("filename") or ""),
            "local_filename": str(
                (manifest_item or {}).get("local_filename") or ""
            ),
            "latest_fileset_id": (manifest_item or {}).get("latest_fileset_id"),
            "local_fileset_id": (manifest_item or {}).get("local_fileset_id"),
            "active": bool(active_month and key == active_month),
            "active_archive": active_archive if active_month == key else "",
        }

    for item in manifest_months:
        key = str(item.get("month") or "").replace("-", "")
        if len(key) != 6 or not key.isdigit() or key in seen:
            continue
        seen.add(key)
        months.append(build_month(key, manifest_item=item))
    for key in local_by_month:
        if key in seen:
            continue
        seen.add(key)
        months.append(build_month(key))
    for key in imported_by_month:
        if key in seen:
            continue
        seen.add(key)
        months.append(build_month(key))
    months.sort(
        key=lambda item: (int(item.get("year") or 0), int(item.get("month_no") or 0)),
        reverse=True,
    )
    summary = {"green": 0, "red": 0, "gray": 0}
    for item in months:
        status = str(item.get("status") or "")
        if status in summary:
            summary[status] += 1
    return {
        "months": months,
        "summary": summary,
        "total_months": len(months),
        "active_month": active_month,
        "active_archive": active_archive,
        "active_phase": active_phase,
        "processing_month": processing_month,
        "processing_archive": processing_archive,
        "manifest_available": bool(manifest_months),
    }


FILE_TIMELINE_STAGES = ("download", "parquet", "postgres", "qdrant")
FILE_TIMELINE_STAGE_LABELS = {
    "download": "下載",
    "parquet": "Parquet",
    "postgres": "PostgreSQL",
    "qdrant": "Qdrant",
}
_FILE_TIMELINE_PRIORITY = {
    "empty": 0,
    "not_applicable": 0,
    "complete": 1,
    "incomplete": 2,
    "processing": 3,
}


def _timeline_month_key(value: Any) -> str:
    if isinstance(value, datetime):
        moment = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return moment.strftime("%Y%m")
    text = str(value or "").strip()
    match = re.search(r"(\d{4})[/-](\d{1,2})", text)
    if match:
        year, month = int(match.group(1)), int(match.group(2))
        if 1 <= month <= 12:
            return f"{year:04d}{month:02d}"
    match = re.search(r"\b(\d{4})(\d{2})\b", text)
    if match:
        year, month = int(match.group(1)), int(match.group(2))
        if 1 <= month <= 12:
            return f"{year:04d}{month:02d}"
    return ""


def _timeline_month_label(key: str) -> str:
    return f"{key[:4]}-{key[4:]}" if len(key) == 6 else key


def _timeline_entry(key: str) -> Dict[str, Any]:
    return {
        "month": key,
        "month_label": _timeline_month_label(key),
        "year": int(key[:4]),
        "month_no": int(key[4:6]),
        "stages": {stage: "empty" for stage in FILE_TIMELINE_STAGES},
        "overall": "empty",
        "has_data": False,
        "has_update": False,
        "active": False,
        "files": [],
        "imported_files": [],
        "unimported_files": [],
        "versions": [],
    }


def _merge_timeline_stage(
    entry: Dict[str, Any], stage: str, status: str
) -> None:
    current = str((entry.get("stages") or {}).get(stage) or "empty")
    if _FILE_TIMELINE_PRIORITY.get(status, 0) > _FILE_TIMELINE_PRIORITY.get(
        current, 0
    ):
        entry["stages"][stage] = status


def _overall_timeline_status(entry: Dict[str, Any]) -> str:
    statuses = [
        str((entry.get("stages") or {}).get(stage) or "empty")
        for stage in FILE_TIMELINE_STAGES
    ]
    if "processing" in statuses:
        return "processing"
    if all(status in {"complete", "not_applicable"} for status in statuses):
        return "complete"
    if all(status in {"empty", "not_applicable"} for status in statuses):
        return "empty"
    return "incomplete"


def _finalize_timeline(
    *,
    key: str,
    label: str,
    title: str,
    icon: str,
    entries: Dict[str, Dict[str, Any]],
    current: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    for entry in entries.values():
        if entry.get("has_data"):
            for stage in FILE_TIMELINE_STAGES:
                if entry["stages"][stage] == "empty":
                    entry["stages"][stage] = "incomplete"
        entry["overall"] = _overall_timeline_status(entry)

    summary = {
        "complete": 0,
        "incomplete": 0,
        "processing": 0,
        "empty": 0,
        "update": 0,
    }
    for entry in entries.values():
        summary[entry["overall"]] = int(summary.get(entry["overall"]) or 0) + 1
        if entry.get("has_update"):
            summary["update"] += 1

    months = sorted(
        entries.values(),
        key=lambda item: str(item.get("month") or ""),
        reverse=True,
    )
    return {
        "key": key,
        "label": label,
        "title": title,
        "icon": icon,
        "months": months,
        "summary": summary,
        "total_months": len(months),
        "current": current,
        "stage_order": list(FILE_TIMELINE_STAGES),
        "stage_labels": dict(FILE_TIMELINE_STAGE_LABELS),
    }


def _law_order_file_timeline(
    source: str,
    *,
    database: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
    legal_index: Dict[str, Any],
    runs: Sequence[Dict[str, Any]],
    now_taipei: datetime,
) -> Dict[str, Any]:
    label = BRANCH_META[source]["label"]
    versions = [
        version
        for version in (database.get("versions") or [])
        if str(version.get("source_type") or "") == source
    ]
    manifests = (
        ((law_raw_backups or {}).get(source) or {}).get("manifests") or []
    )
    entries: Dict[str, Dict[str, Any]] = {
        key: _timeline_entry(key)
        for key in [
            month
            for month in (
                _timeline_month_key(item.get("update_date"))
                or _timeline_month_key(item.get("downloaded_at"))
                for item in versions
            )
            if month
        ]
    }

    raw_by_month: Dict[str, Dict[str, Any]] = {}
    for manifest in manifests:
        if not isinstance(manifest, dict):
            continue
        key = (
            _timeline_month_key(manifest.get("update_date"))
            or _timeline_month_key(manifest.get("created_at"))
        )
        if not key:
            continue
        raw_by_month[key] = manifest
        entry = entries.setdefault(key, _timeline_entry(key))
        entry["has_data"] = True
        _merge_timeline_stage(entry, "download", "complete")
        _merge_timeline_stage(entry, "parquet", "complete")
        entry["raw_backup"] = {
            "path": str(manifest.get("parquet_path") or ""),
            "row_count": int(manifest.get("row_count") or 0),
            "created_at": manifest.get("created_at"),
            "update_date": manifest.get("update_date"),
        }

    for version in versions:
        key = (
            _timeline_month_key(version.get("update_date"))
            or _timeline_month_key(version.get("downloaded_at"))
        )
        if not key:
            continue
        entry = entries.setdefault(key, _timeline_entry(key))
        entry["has_data"] = True
        _merge_timeline_stage(entry, "download", "complete")
        _merge_timeline_stage(entry, "postgres", "complete")
        parquet_path = str(version.get("parquet_path") or "")
        if parquet_path and Path(parquet_path).is_file():
            _merge_timeline_stage(entry, "parquet", "complete")
        entry["versions"].append(
            {
                "version_id": version.get("id"),
                "version_code": version.get("version_code"),
                "update_date": version.get("update_date"),
                "downloaded_at": version.get("downloaded_at"),
                "law_count": version.get("law_count"),
                "article_count": version.get("article_count"),
                "is_current": bool(version.get("is_current")),
            }
        )

    current_versions = [
        version for version in versions if version.get("is_current")
    ]
    latest_version = None
    if versions:
        latest_version = max(
            current_versions or versions,
            key=lambda item: str(item.get("downloaded_at") or ""),
        )
    latest_month = (
        _timeline_month_key((latest_version or {}).get("update_date"))
        or _timeline_month_key((latest_version or {}).get("downloaded_at"))
    )
    legal_status = str(legal_index.get("status") or "")
    if latest_month and latest_month in entries:
        _merge_timeline_stage(
            entries[latest_month],
            "qdrant",
            "complete" if legal_status == "fresh" else "incomplete",
        )

    active_update = _active_run(runs, kind="update")
    source_download_running = bool(
        _active_run(runs, branch=source, kind=f"{source}_download")
    )
    update_download_running = bool(
        active_update
        and (
            (active_update.get("stages") or {}).get("download") or {}
        ).get("status")
        == "running"
    )
    if source_download_running or update_download_running:
        current_key = now_taipei.strftime("%Y%m")
        entry = entries.setdefault(current_key, _timeline_entry(current_key))
        _merge_timeline_stage(entry, "download", "processing")
        entry["active"] = True

    legal_running = bool(_active_run(runs, kind="legal_index")) or bool(
        active_update
        and (
            (active_update.get("stages") or {}).get("legal_qdrant") or {}
        ).get("status")
        == "running"
    )
    if legal_running and latest_month and latest_month in entries:
        _merge_timeline_stage(entries[latest_month], "qdrant", "processing")
        entries[latest_month]["active"] = True

    # The legal index is a single current snapshot.  Older source months are
    # superseded and must not be reported as an actionable missing index.
    for key, entry in entries.items():
        if key != latest_month:
            entry["stages"]["qdrant"] = "not_applicable"

    current: Optional[Dict[str, Any]] = None
    if latest_version is not None and latest_month:
        current = {
            "label": "目前下載"
            if (source_download_running or update_download_running)
            else "目前版本",
            "month": latest_month,
            "month_label": _timeline_month_label(latest_month),
            "file": str(latest_version.get("version_code") or ""),
            "detail": str(
                latest_version.get("update_date")
                or latest_version.get("downloaded_at")
                or ""
            ),
        }
    elif entries:
        latest_entry = max(entries.values(), key=lambda item: item["month"])
        current = {
            "label": "最新月份",
            "month": latest_entry["month"],
            "month_label": latest_entry["month_label"],
            "file": "",
            "detail": "",
        }

    return _finalize_timeline(
        key=source,
        label=label,
        title=f"{label}處理時間表",
        icon="layers" if source == "law" else "file",
        entries=entries,
        current=current,
    )


def _judgment_file_timeline(
    *,
    settings: Settings,
    session_factory,
    database: Dict[str, Any],
    import_timeline: Dict[str, Any],
    archives: Dict[str, Any],
    index: Dict[str, Any],
    runs: Sequence[Dict[str, Any]],
    embedding_runtime: Dict[str, Any],
    now_taipei: datetime,
) -> Dict[str, Any]:
    entries: Dict[str, Dict[str, Any]] = {}
    active_month = str(import_timeline.get("active_month") or "")
    active_archive = str(import_timeline.get("active_archive") or "")
    active_phase = str(import_timeline.get("active_phase") or "")
    active_item = next(
        (
            item
            for item in (archives.get("items") or [])
            if str(item.get("name") or "") == active_archive
        ),
        None,
    )
    active_stage = str((active_item or {}).get("current_stage") or "")
    active_stages = (active_item or {}).get("stages") or {}
    active_parquet = bool(
        active_month
        and (
            active_phase in {"extract", "raw_parquet"}
            or active_stage in {"extract", "raw_parquet"}
            or (
                (active_stages.get("raw_parquet") or {}).get("status")
                == "running"
            )
        )
    )
    active_postgres = bool(
        active_month
        and (
            active_phase in {"filter", "postgres"}
            or active_stage in {"filter", "postgres"}
            or (
                (active_stages.get("postgres") or {}).get("status")
                == "running"
            )
        )
    )
    # Re-checking an archive does not mean its backup is gone.  If the
    # existing raw Parquet still matches the archive, keep the two completed
    # cells green while the import reuses it instead of showing them as a new
    # extraction/backup.
    active_reusable = False
    if active_parquet:
        active_path = str((active_item or {}).get("path") or "").strip()
        if active_path:
            try:
                active_reusable = (
                    find_reusable_raw_parquet(
                        Path(settings.judgment_data_dir)
                        .expanduser()
                        .resolve(),
                        Path(active_path),
                    )
                    is not None
                )
            except OSError:
                active_reusable = False

    raw_months = _judgment_raw_parquet_months(settings)
    db_months = database.get("judgment_months") or {}
    coverage = _index_month_coverage_runtime(settings, session_factory, index) or {}
    coverage_map: Dict[str, str] = {}
    for item in coverage.get("months") or []:
        key = _timeline_month_key(item.get("month"))
        if not key:
            continue
        percent = item.get("percent")
        status = (
            "complete"
            if percent is not None and float(percent) >= 100.0
            else "incomplete"
        )
        if coverage_map.get(key) != "incomplete":
            coverage_map[key] = status

    active_index_months: set[str] = set()
    active_index = _active_run(runs, branch="judgment", kind="index")
    if active_index is not None:
        runtime = (active_index.get("meta") or {}).get("index_runtime") or {}
        for item in runtime.get("months") or []:
            if str(item.get("status") or "") != "running":
                continue
            key = _timeline_month_key(item.get("month"))
            if key:
                active_index_months.add(key)
        current_runtime = runtime.get("current") or {}
        current_key = _timeline_month_key(current_runtime.get("month"))
        if current_key:
            active_index_months.add(current_key)

    download_progress_month = ""
    try:
        from ..judgment_download import _read_progress

        progress = _read_progress(
            Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
        )
        if progress:
            download_progress_month = _timeline_month_key(progress.get("month"))
    except Exception:
        download_progress_month = ""

    for item in import_timeline.get("months") or []:
        key = str(item.get("month") or "")
        if len(key) != 6:
            continue
        entry = entries.setdefault(key, _timeline_entry(key))
        entry["has_data"] = True
        entry["has_update"] = bool(item.get("has_update"))
        entry["files"] = list(item.get("local_files") or [])
        entry["imported_files"] = list(item.get("imported_files") or [])
        entry["unimported_files"] = list(item.get("unimported_files") or [])
        if key == active_month:
            entry["active"] = True

        if key == download_progress_month:
            _merge_timeline_stage(entry, "download", "processing")
        elif item.get("local_files"):
            _merge_timeline_stage(entry, "download", "complete")
        else:
            _merge_timeline_stage(entry, "download", "incomplete")

        if key == active_month and active_parquet and not active_reusable:
            _merge_timeline_stage(entry, "parquet", "processing")
        elif key in raw_months:
            _merge_timeline_stage(entry, "parquet", "complete")
        else:
            _merge_timeline_stage(entry, "parquet", "incomplete")

        imported = bool(item.get("imported"))
        if key == active_month and active_postgres:
            _merge_timeline_stage(entry, "postgres", "processing")
        elif imported and not item.get("has_update"):
            _merge_timeline_stage(entry, "postgres", "complete")
        else:
            _merge_timeline_stage(entry, "postgres", "incomplete")

        if key in active_index_months:
            _merge_timeline_stage(entry, "qdrant", "processing")
        elif (
            coverage_map.get(key) == "complete"
            and (entry["stages"].get("postgres") == "complete")
        ):
            _merge_timeline_stage(entry, "qdrant", "complete")
        elif coverage_map.get(key) or db_months.get(key):
            _merge_timeline_stage(entry, "qdrant", "incomplete")
        else:
            _merge_timeline_stage(entry, "qdrant", "incomplete")

    for key in sorted(set(db_months) | set(coverage_map)):
        if key in entries:
            continue
        entry = entries.setdefault(key, _timeline_entry(key))
        entry["has_data"] = True
        _merge_timeline_stage(entry, "download", "complete")
        _merge_timeline_stage(entry, "parquet", "complete")
        _merge_timeline_stage(entry, "postgres", "complete")
        _merge_timeline_stage(
            entry,
            "qdrant",
            coverage_map.get(key) or "incomplete",
        )

    current: Optional[Dict[str, Any]] = None
    if active_month:
        current = {
            "label": "目前匯入",
            "month": active_month,
            "month_label": _timeline_month_label(active_month),
            "file": active_archive,
            "detail": active_stage,
        }
    elif entries:
        latest_entry = max(entries.values(), key=lambda item: item["month"])
        current = {
            "label": "最新月份",
            "month": latest_entry["month"],
            "month_label": latest_entry["month_label"],
            "file": (
                (latest_entry.get("files") or [""])[0]
                or (latest_entry.get("imported_files") or [""])[0]
            ),
            "detail": "",
        }

    rerank_url = settings.rerank_url or settings.rerank_fallback_url
    rerank_host = urlparse(rerank_url).hostname or ""
    embedding_host = str(embedding_runtime.get("host") or "").strip()
    embedding_model = str(embedding_runtime.get("model") or "").strip()
    rerank_model = str(settings.rerank_model or "").strip()
    timeline = _finalize_timeline(
        key="judgment",
        label=BRANCH_META["judgment"]["label"],
        title="判決處理時間表",
        icon="database",
        entries=entries,
        current=current,
    )
    timeline["models"] = {
        "embedding": {
            "host": embedding_host or "—",
            "model": embedding_model or "—",
            "label": " ".join(
                part for part in (embedding_host, embedding_model) if part
            )
            or "—",
            "url": str(embedding_runtime.get("url") or ""),
        },
        "rerank": {
            "host": rerank_host or "—",
            "model": rerank_model or "—",
            "label": " ".join(
                part for part in (rerank_host, rerank_model) if part
            )
            or "—",
            "url": str(rerank_url or ""),
            "enabled": bool(settings.rag_rerank_enabled),
        },
    }
    return timeline


IMPORT_TIMELINE_STAGES = ("extract", "raw_parquet", "filter", "postgres")
IMPORT_TIMELINE_STAGE_LABELS = {
    "extract": "RAR 檢查／解壓縮",
    "raw_parquet": "原始資料檢查／Parquet 備份",
    "filter": "金融法規篩選",
    "postgres": "PostgreSQL metadata",
}


def _import_archive_stage_status(
    stage: Optional[Dict[str, Any]],
    *,
    imported: bool,
) -> str:
    status = str((stage or {}).get("status") or "")
    if status == "running":
        return "processing"
    if status in {"success", "skipped"}:
        return "complete"
    # finish_run() marks every pending archive stage with the terminal run
    # status (for example "interrupted").  Those archives were never started,
    # so keep their historical imported state instead of turning them red.
    return "complete" if imported else "incomplete"


def _import_archive_rank(archive: Dict[str, Any]) -> Tuple[int, str]:
    statuses = [
        str(((archive.get("stages") or {}).get(stage) or {}).get("status") or "")
        for stage in IMPORT_TIMELINE_STAGES
    ]
    if "running" in statuses:
        rank = 3
    elif "failed" in statuses or "interrupted" in statuses:
        rank = 2
    elif all(status == "success" for status in statuses):
        rank = 1
    else:
        rank = 0
    return rank, str(archive.get("finished_at") or archive.get("started_at") or "")


def _import_overall_status(stages: Dict[str, str]) -> str:
    values = [
        stages.get(stage) or "incomplete" for stage in IMPORT_TIMELINE_STAGES
    ]
    if "processing" in values:
        return "processing"
    if all(value == "complete" for value in values):
        return "complete"
    return "incomplete"


def _merge_import_timeline_stages(
    import_timeline: Dict[str, Any],
    archives: Dict[str, Any],
    file_timelines: Optional[Sequence[Dict[str, Any]]] = None,
) -> None:
    """Annotate import months with the four import stages."""

    import_timeline["stage_order"] = list(IMPORT_TIMELINE_STAGES)
    import_timeline["stage_labels"] = dict(IMPORT_TIMELINE_STAGE_LABELS)
    active_month = str(import_timeline.get("active_month") or "")
    active_phase = str(import_timeline.get("active_phase") or "")
    processing_month = str(import_timeline.get("processing_month") or "")
    parquet_by_month: Dict[str, str] = {}
    judgment_timeline = next(
        (
            timeline
            for timeline in file_timelines or []
            if str(timeline.get("key") or "") == "judgment"
        ),
        None,
    )
    if judgment_timeline is not None:
        for item in judgment_timeline.get("months") or []:
            if not isinstance(item, dict):
                continue
            key = str(item.get("month") or "")
            if key:
                parquet_by_month[key] = str(
                    (item.get("stages") or {}).get("parquet") or ""
                )
    archives_by_month: Dict[str, List[Dict[str, Any]]] = {}
    for item in archives.get("items") or []:
        if not isinstance(item, dict):
            continue
        key = _archive_month(item.get("name"))
        if key:
            archives_by_month.setdefault(key, []).append(item)
    summary = {"complete": 0, "incomplete": 0, "processing": 0, "empty": 0}
    for month in import_timeline.get("months") or []:
        if not isinstance(month, dict):
            continue
        imported = bool(month.get("imported")) and not (
            month.get("unimported_files") or []
        )
        candidates = archives_by_month.get(str(month.get("month") or "")) or []
        archive = max(candidates, key=_import_archive_rank) if candidates else None
        stages: Dict[str, str] = {}
        for stage in IMPORT_TIMELINE_STAGES:
            stage_data = (
                (archive.get("stages") or {}).get(stage) if archive else None
            )
            stages[stage] = _import_archive_stage_status(
                stage_data, imported=imported
            )
        if parquet_by_month.get(str(month.get("month") or "")) == "complete":
            # A complete Parquet backup means both the RAR check and the raw
            # backup already succeeded, even if this run is briefly touching
            # the archive again to reuse it.
            stages["extract"] = "complete"
            stages["raw_parquet"] = "complete"
        processing_stages = [
            stage
            for stage in IMPORT_TIMELINE_STAGES
            if stages.get(stage) == "processing"
        ]
        if (
            not processing_stages
            and active_month
            and str(month.get("month") or "") == active_month
            # The fallback only applies when the outline month is also the
            # actual cursor.  During the filter pass the cursor visits older
            # archives while the outline stays on the highest started month;
            # the older month already carries the "processing" stage.
            and (not processing_month or processing_month == active_month)
            and active_phase in stages
            and stages.get(active_phase) != "complete"
        ):
            stages[active_phase] = "processing"
        overall = _import_overall_status(stages)
        month["import_stages"] = stages
        month["import_overall"] = overall
        summary[overall] = int(summary.get(overall) or 0) + 1
    active_entry = next(
        (
            month
            for month in import_timeline.get("months") or []
            if str(month.get("month") or "") == active_month
        ),
        None,
    )
    if active_entry is not None:
        # The filter pass restarts at older archives while the outline stays
        # on the highest unfinished month.  In that case keep the phase from
        # the actual processing cursor instead of replacing it with the
        # outline month's cell state.
        if not processing_month or processing_month == active_month:
            processing_stages = [
                stage
                for stage in IMPORT_TIMELINE_STAGES
                if (active_entry.get("import_stages") or {}).get(stage)
                == "processing"
            ]
            if processing_stages:
                import_timeline["active_phase"] = processing_stages[-1]
    else:
        import_timeline["active_phase"] = ""
    import_timeline["stage_summary"] = summary


def _processing_file_timelines(
    *,
    settings: Settings,
    session_factory,
    database: Dict[str, Any],
    import_timeline: Dict[str, Any],
    archives: Dict[str, Any],
    law_raw_backups: Dict[str, Any],
    legal_index: Dict[str, Any],
    index: Dict[str, Any],
    runs: Sequence[Dict[str, Any]],
    embedding_runtime: Dict[str, Any],
) -> List[Dict[str, Any]]:
    now_taipei = datetime.now(timezone.utc).astimezone(
        timezone(timedelta(hours=8))
    )
    return [
        _law_order_file_timeline(
            "law",
            database=database,
            law_raw_backups=law_raw_backups,
            legal_index=legal_index,
            runs=runs,
            now_taipei=now_taipei,
        ),
        _law_order_file_timeline(
            "order",
            database=database,
            law_raw_backups=law_raw_backups,
            legal_index=legal_index,
            runs=runs,
            now_taipei=now_taipei,
        ),
        _judgment_file_timeline(
            settings=settings,
            session_factory=session_factory,
            database=database,
            import_timeline=import_timeline,
            archives=archives,
            index=index,
            runs=runs,
            embedding_runtime=embedding_runtime,
            now_taipei=now_taipei,
        ),
    ]


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


_ACTIVE_IMPORT_CACHE: Dict[str, Any] = {
    "path": "",
    "stamp": None,
    "payload": {},
}


def _active_import_from_payload(
    payload: Dict[str, Any],
    *,
    state_mtime_ns: Optional[int] = None,
) -> Dict[str, Any]:
    empty = {
        "active_month": "",
        "active_archive": "",
        "active_phase": "",
        "processing_month": "",
        "processing_archive": "",
        "run_id": None,
        "run_status": None,
        "state_mtime_ns": (
            int(state_mtime_ns) if state_mtime_ns is not None else None
        ),
    }
    active = dict(empty)
    for run in payload.get("runs") or []:
        if not isinstance(run, dict):
            continue
        if run.get("kind") != "import":
            continue
        if run.get("status") != STATE_RUNNING:
            continue
        if not pid_alive(run.get("pid")):
            continue
        meta = run.get("meta") or {}
        archive_items = [
            item
            for item in (run.get("archives") or {}).values()
            if isinstance(item, dict)
        ]
        focus, cursor, cursor_stages = _select_import_focus(
            archive_items,
            current_archive=str(meta.get("current_archive") or ""),
        )
        if focus is None:
            # Keep the run visible without claiming that a finished archive
            # is still the active month.  The browser keeps its last outline
            # until the next archive reports a running stage.
            active = {
                "active_month": "",
                "active_archive": "",
                "active_phase": "",
                "processing_month": "",
                "processing_archive": "",
                "run_id": run.get("id"),
                "run_status": run.get("status"),
                "state_mtime_ns": (
                    int(state_mtime_ns) if state_mtime_ns is not None else None
                ),
            }
            break
        if cursor is not None:
            phase = _archive_active_phase(cursor, cursor_stages)
        else:
            phase = str(focus.get("current_stage") or "") or str(
                meta.get("current_phase") or ""
            )
        processing_archive = ""
        if cursor is not None:
            processing_archive = str(cursor.get("name") or "")
        elif str(meta.get("current_archive") or ""):
            processing_archive = str(meta.get("current_archive") or "")
        else:
            processing_archive = str(focus.get("name") or "")
        active = {
            "active_month": _archive_month(focus.get("name")),
            "active_archive": str(focus.get("name") or ""),
            "active_phase": phase,
            "processing_month": _archive_month(processing_archive),
            "processing_archive": processing_archive,
            "run_id": run.get("id"),
            "run_status": run.get("status"),
            "state_mtime_ns": (
                int(state_mtime_ns) if state_mtime_ns is not None else None
            ),
        }
        break
    return active


def build_active_import(
    *,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Return the currently running import archive without a full snapshot."""

    resolved = Path(state_path or default_state_path()).expanduser()
    try:
        stat = resolved.stat()
    except OSError:
        return _active_import_from_payload({})
    stamp = (stat.st_mtime_ns, stat.st_size)
    if (
        _ACTIVE_IMPORT_CACHE.get("path") == str(resolved)
        and _ACTIVE_IMPORT_CACHE.get("stamp") == stamp
    ):
        return deepcopy(_ACTIVE_IMPORT_CACHE.get("payload") or {})
    try:
        payload = ProcessingStateStore(resolved).read()
    except (ProcessingStateError, OSError):
        return _active_import_from_payload(
            {}, state_mtime_ns=stat.st_mtime_ns
        )
    active = _active_import_from_payload(
        payload, state_mtime_ns=stat.st_mtime_ns
    )
    _ACTIVE_IMPORT_CACHE.update(
        {"path": str(resolved), "stamp": stamp, "payload": deepcopy(active)}
    )
    return active


_ACTIVE_IMPORT_SUBSCRIBERS: set[asyncio.Queue] = set()
_ACTIVE_IMPORT_WATCHER: Optional[asyncio.Task] = None
_ACTIVE_IMPORT_LAST: Dict[str, Any] = {}


async def _watch_active_import() -> None:
    global _ACTIVE_IMPORT_WATCHER
    while _ACTIVE_IMPORT_SUBSCRIBERS:
        active = await asyncio.to_thread(build_active_import)
        if active != _ACTIVE_IMPORT_LAST:
            _ACTIVE_IMPORT_LAST.clear()
            _ACTIVE_IMPORT_LAST.update(active)
            for queue in list(_ACTIVE_IMPORT_SUBSCRIBERS):
                try:
                    queue.put_nowait(deepcopy(active))
                except asyncio.QueueFull:
                    pass
        await asyncio.sleep(0.1)
    _ACTIVE_IMPORT_WATCHER = None


def _subscribe_active_import(queue: asyncio.Queue) -> None:
    global _ACTIVE_IMPORT_WATCHER
    _ACTIVE_IMPORT_SUBSCRIBERS.add(queue)
    if _ACTIVE_IMPORT_WATCHER is None or _ACTIVE_IMPORT_WATCHER.done():
        _ACTIVE_IMPORT_WATCHER = asyncio.create_task(_watch_active_import())


def _unsubscribe_active_import(queue: asyncio.Queue) -> None:
    _ACTIVE_IMPORT_SUBSCRIBERS.discard(queue)


async def active_import_event_stream():
    """Server-sent events for the active import archive/month."""

    queue: asyncio.Queue = asyncio.Queue(maxsize=8)
    _subscribe_active_import(queue)
    try:
        active = await asyncio.to_thread(build_active_import)
        yield f"event: active\ndata: {json.dumps(active, ensure_ascii=False)}\n\n"
        while True:
            try:
                active = await asyncio.wait_for(queue.get(), timeout=15)
            except asyncio.TimeoutError:
                yield ": heartbeat\n\n"
                continue
            yield (
                "event: active\n"
                f"data: {json.dumps(active, ensure_ascii=False)}\n\n"
            )
    finally:
        _unsubscribe_active_import(queue)


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
    legal_index = _legal_index_plan_metrics(
        settings=settings,
        session_factory=session_factory,
        database=database,
    )
    embedding_runtime = _embedding_runtime(settings, session_factory)
    raw_backups = _raw_backup_metrics(settings)
    law_raw_backups = _law_raw_backup_metrics(settings)
    state_runs = runs
    runs, external_processes = _attach_external_runs(runs, index=index, now=now)
    local = _scan_local_archives(settings, session_factory, state_runs)
    archives = _archives_for_snapshot(runs, local)
    import_timeline = _import_month_timeline(settings, local, archives)
    file_timelines = _processing_file_timelines(
        settings=settings,
        session_factory=session_factory,
        database=database,
        import_timeline=import_timeline,
        archives=archives,
        law_raw_backups=law_raw_backups,
        legal_index=legal_index,
        index=index,
        runs=runs,
        embedding_runtime=embedding_runtime,
    )
    _merge_import_timeline_stages(import_timeline, archives, file_timelines)

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

    try:
        update_state = update_status(session_factory)
    except Exception:
        logger.warning("無法讀取更新檢查狀態", exc_info=True)
        update_state = {"sources": {}}
    update_history_map: Dict[str, List[Dict[str, Any]]] = {}
    for source_key in ("law", "order", "judgment"):
        try:
            update_history_map[source_key] = update_history(
                session_factory, source_type=source_key, limit=20
            )
        except Exception:
            logger.warning(
                "無法讀取 %s 更新紀錄", source_key, exc_info=True
            )
            update_history_map[source_key] = []
    service_run_map = {
        "law_download": ("law", "download"),
        "order_download": ("order", "download"),
        "judgment_import": ("judgment", "import"),
        "judgment_parquet": ("judgment", "parquet"),
        "index_versions": ("judgment", "index"),
    }
    workflow_entries = []
    workflow_runnable = not active_runs and not external_processes
    update_source_map = {
        "law_download": "law",
        "order_download": "order",
        "judgment_download": "judgment",
    }
    for definition in workflow_catalog():
        workflow_active = _active_run(runs, kind=definition["kind"])
        service_branch, service_kind = service_run_map.get(
            definition["id"], ("", "")
        )
        if service_kind:
            history_runs = [
                run
                for run in runs
                if run.get("kind") == service_kind
                and (not service_branch or run.get("branch") == service_branch)
            ]
        else:
            history_runs = [
                run for run in runs if run.get("kind") == definition["kind"]
            ]
        history_runs = history_runs[:10]
        workflow_latest = (
            history_runs[0]
            if history_runs
            else _latest_run(runs, kind=definition["kind"])
        )
        service_active = (
            _active_run(runs, branch=service_branch, kind=service_kind)
            if service_kind
            else None
        )
        if service_active is not None:
            progress_run = service_active
        elif workflow_active is not None:
            progress_run = workflow_active
        elif history_runs:
            progress_run = history_runs[0]
        else:
            progress_run = workflow_latest
        update_source = update_source_map.get(definition["id"], "")
        update_record = (
            (update_state.get("sources") or {}).get(update_source, {})
            if update_source
            else {}
        )
        index_runtime = None
        if definition["id"] == "index_versions":
            index_runtime = _index_runtime_view(progress_run)
            if not index_runtime.get("available"):
                coverage = _index_month_coverage_runtime(
                    settings, session_factory, index
                )
                if coverage is not None:
                    index_runtime = coverage
        workflow_entries.append(
            {
                **definition,
                "active_run": _public_run(workflow_active),
                "last_run": _public_run(workflow_latest),
                "recent_runs": [_public_run(run) for run in history_runs],
                "progress": _workflow_progress(progress_run),
                "index_runtime": index_runtime,
                "import_timeline": (
                    import_timeline
                    if definition["id"] == "judgment_import"
                    else None
                ),
                "can_run": bool(workflow_runnable),
                "update_available": bool(
                    update_record.get("update_available")
                ),
                "update_status": deepcopy(update_record),
                "update_history": update_history_map.get(update_source, []),
            }
        )

    capabilities = {
        "can_start_update": can_start_update,
        "can_start_workflow": bool(workflow_runnable),
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
    sections = _build_processing_sections(
        runs=runs,
        database=database,
        index=index,
        legal_index=legal_index,
        local=local,
        raw_backups=raw_backups,
        law_raw_backups=law_raw_backups,
        update_state=update_state,
        embedding_runtime=embedding_runtime,
    )
    if active_update is not None:
        update = _public_run(active_update)
    else:
        latest_update = _latest_run(runs, kind="update")
        update = _public_run(latest_update)

    status = "operational"
    if database.get("status") != "operational" or state_status.get("status") == "error":
        status = "degraded"

    snapshot = {
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
        "legal_index": legal_index,
        "raw_backups": raw_backups,
        "law_raw_backups": law_raw_backups,
        "local_archives": local,
        "external_processes": external_processes,
        "branches": branches,
        "sections": sections,
        "workflows": workflow_entries,
        "active_runs": [_public_run(run) for run in active_runs],
        "recent_runs": [_public_run(run) for run in runs[:10]],
        "archives": archives,
        "import_timeline": import_timeline,
        # Re-read the active archive at the end of the snapshot.  The heavy
        # DB/Qdrant queries above can take several seconds, during which the
        # import may have advanced; this keeps the outline authoritative.
        "active_import": build_active_import(state_path=resolved_path),
        "file_timelines": file_timelines,
        "timeline": _build_timeline(runs),
        "update": update,
        "capabilities": capabilities,
        "notices": notices,
    }
    _cache_processing_snapshot(snapshot, resolved_path)
    return snapshot


def _processing_snapshot_cache_path(state_path: Path) -> Path:
    return Path(state_path).with_name("processing_snapshot.json")


def _cache_processing_snapshot(
    snapshot: Dict[str, Any],
    state_path: Path,
) -> None:
    path = _processing_snapshot_cache_path(state_path)
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_name(
            f".{path.name}.{os.getpid()}.tmp"
        )
        temporary.write_text(
            json.dumps(snapshot, ensure_ascii=False),
            encoding="utf-8",
        )
        os.chmod(temporary, 0o600)
        os.replace(temporary, path)
    except OSError:
        logger.warning("無法寫入 processing snapshot cache", exc_info=True)


def build_processing_bootstrap(
    *,
    settings: Settings,
    session_factory,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Return a fast cached snapshot for first paint.

    Live progress still arrives by SSE; the warm full snapshot follows on the
    same connection.
    """

    resolved_path = Path(state_path or default_state_path())
    cache_path = _processing_snapshot_cache_path(resolved_path)
    try:
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        if isinstance(cached, dict) and cached.get("workflows"):
            return cached
    except (OSError, ValueError):
        pass
    return build_processing_snapshot(
        settings=settings,
        session_factory=session_factory,
        state_path=resolved_path,
    )


_LIVE_PROCESSING_CACHE: Dict[str, Any] = {
    "path": "",
    "stamp": None,
    "runs": [],
    "active_import": {},
}


def _live_processing_state(
    resolved_path: Path,
    now: datetime,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Read the state file once and cache normalized runs by mtime."""

    try:
        stat = resolved_path.stat()
    except OSError:
        return [], _active_import_from_payload({})
    stamp = (stat.st_mtime_ns, stat.st_size)
    if (
        _LIVE_PROCESSING_CACHE.get("path") == str(resolved_path)
        and _LIVE_PROCESSING_CACHE.get("stamp") == stamp
    ):
        return (
            list(_LIVE_PROCESSING_CACHE.get("runs") or []),
            deepcopy(_LIVE_PROCESSING_CACHE.get("active_import") or {}),
        )
    try:
        payload = ProcessingStateStore(resolved_path).read()
    except (ProcessingStateError, OSError):
        return [], _active_import_from_payload(
            {}, state_mtime_ns=stat.st_mtime_ns
        )
    runs = _normalized_runs(payload, now)
    active_import = _active_import_from_payload(
        payload, state_mtime_ns=stat.st_mtime_ns
    )
    _LIVE_PROCESSING_CACHE.update(
        {
            "path": str(resolved_path),
            "stamp": stamp,
            "runs": runs,
            "active_import": deepcopy(active_import),
        }
    )
    return runs, active_import


def _live_workflow_entries(
    runs: Sequence[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    active_runs = [
        run
        for run in runs
        if run.get("status") == STATE_RUNNING and run.get("alive")
    ]
    can_run = not active_runs
    service_run_map = {
        "law_download": ("law", "download"),
        "order_download": ("order", "download"),
        "judgment_import": ("judgment", "import"),
        "judgment_parquet": ("judgment", "parquet"),
        "index_versions": ("judgment", "index"),
    }
    entries: List[Dict[str, Any]] = []
    for definition in workflow_catalog():
        workflow_active = _active_run(runs, kind=definition["kind"])
        service_branch, service_kind = service_run_map.get(
            definition["id"], ("", "")
        )
        if service_kind:
            history_runs = [
                run
                for run in runs
                if run.get("kind") == service_kind
                and (not service_branch or run.get("branch") == service_branch)
            ]
        else:
            history_runs = [
                run for run in runs if run.get("kind") == definition["kind"]
            ]
        history_runs = history_runs[:10]
        workflow_latest = (
            history_runs[0]
            if history_runs
            else _latest_run(runs, kind=definition["kind"])
        )
        service_active = (
            _active_run(runs, branch=service_branch, kind=service_kind)
            if service_kind
            else None
        )
        progress_run = (
            service_active
            or workflow_active
            or (history_runs[0] if history_runs else workflow_latest)
        )
        entries.append(
            {
                "id": definition["id"],
                "active_run": _public_run(workflow_active),
                "last_run": _public_run(workflow_latest),
                "recent_runs": [_public_run(run) for run in history_runs],
                "progress": _workflow_progress(progress_run),
                "can_run": can_run,
            }
        )
    return entries


def _live_import_month_updates(
    active_import: Dict[str, Any],
    active_run: Optional[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    if active_run is None:
        return []
    archives = active_run.get("archives") or {}
    updates: Dict[str, Dict[str, Any]] = {}
    for name, archive in archives.items():
        if not isinstance(archive, dict):
            continue
        month = _archive_month(name)
        if not month:
            continue
        stages: Dict[str, str] = {}
        for key in IMPORT_TIMELINE_STAGES:
            raw_stage = (archive.get("stages") or {}).get(key) or {}
            status = str(raw_stage.get("status") or "")
            if status == "running":
                stages[key] = "processing"
            elif status in {"success", "skipped"}:
                stages[key] = "complete"
            elif status in {"failed", "interrupted"}:
                stages[key] = "incomplete"
        phase = str(active_import.get("active_phase") or "")
        phase_applied = False
        if (
            name == str(active_import.get("processing_archive") or "")
            and phase in IMPORT_TIMELINE_STAGES
            and phase not in stages
        ):
            stages[phase] = "processing"
            phase_applied = True
        archive_status = str(archive.get("status") or "")
        if not stages and archive_status not in {"running", "success"}:
            continue
        update: Dict[str, Any] = {
            "month": month,
            "import_stages": stages,
        }
        if archive_status == "running" or phase_applied:
            update["import_overall"] = "processing"
        elif archive_status == "success":
            update["import_overall"] = "complete"
        updates[month] = update
    return list(updates.values())


def build_processing_live(
    *,
    state_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Return a lightweight state-driven progress payload for SSE updates."""

    resolved_path = Path(state_path or default_state_path())
    now = datetime.now(timezone.utc)
    runs, active_import = _live_processing_state(resolved_path, now)
    active_import_run = _active_run(runs, branch="judgment", kind="import")
    active_runs = [
        run
        for run in runs
        if run.get("status") == STATE_RUNNING and run.get("alive")
    ]
    return {
        "live": True,
        "generated_at": now.isoformat(),
        "mode": "running" if active_runs else "idle",
        "active_import": active_import,
        "workflows": _live_workflow_entries(runs),
        "import_timeline_months": _live_import_month_updates(
            active_import, active_import_run
        ),
    }


def _legal_index_plan_metrics(
    *,
    settings: Settings,
    session_factory,
    database: Dict[str, Any],
) -> Dict[str, Any]:
    """Return the DB-known legal index state for the 2-second processing poll.

    The authoritative alias/points check lives in ``/api/status``.  Processing
    overview only needs the active version metadata and current source counts,
    so it avoids an extra Qdrant round trip on every poll.
    """

    from ..legal_index import active_legal_version, assess_legal_index_freshness

    try:
        active = (
            active_legal_version(
                session_factory,
                alias_name=settings.legal_article_vector_alias,
            )
            or {}
        )
        versions = (database.get("latest_versions") or {})
        latest_source = max(
            (
                item.get("downloaded_at")
                for item in versions.values()
                if isinstance(item, dict) and item.get("downloaded_at")
            ),
            default=None,
        )
        points_count = _safe_int(active.get("indexed_count"))
        if points_count is None:
            points_count = _safe_int(active.get("article_count"))
        freshness = assess_legal_index_freshness(
            active_version=active,
            points_count=points_count,
            current_law_count=int(
                (database.get("law_count") or 0)
                + (database.get("order_count") or 0)
            ),
            current_article_count=int(
                (database.get("law_article_count") or 0)
                + (database.get("order_article_count") or 0)
            ),
            latest_source_at=latest_source,
        )
        return {
            "status": freshness.get("status"),
            "stale": bool(freshness.get("stale")),
            "reasons": list(freshness.get("reasons") or []),
            "alias": settings.legal_article_vector_alias,
            "collection": active.get("physical_collection"),
            "points_count": points_count,
            "dimension": active.get("embedding_dimension"),
            "version_id": active.get("version_id"),
            "article_count": active.get("article_count"),
            "indexed_at": active.get("activated_at")
            or active.get("created_at"),
            "freshness": freshness,
        }
    except Exception as exc:
        return {
            "status": "unknown",
            "stale": None,
            "reasons": [f"{exc.__class__.__name__}: {exc}"],
            "alias": settings.legal_article_vector_alias,
            "collection": None,
            "points_count": None,
            "dimension": None,
            "version_id": None,
            "article_count": None,
            "indexed_at": None,
            "freshness": {},
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
    legal_index = snapshot.get("legal_index") or {}
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
        "legal_index": {
            "status": legal_index.get("status"),
            "stale": legal_index.get("stale"),
            "reasons": legal_index.get("reasons"),
            "alias": legal_index.get("alias"),
            "collection": legal_index.get("collection"),
            "points_count": legal_index.get("points_count"),
            "article_count": legal_index.get("article_count"),
            "version_id": legal_index.get("version_id"),
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
            "legal_index": legal_index.get("status")
            in {"stale", "not_indexed"},
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

    def _active_any(self) -> Optional[Dict[str, Any]]:
        try:
            state = self.store.read()
        except ProcessingStateError:
            return None
        for run in state.get("runs") or []:
            if (
                isinstance(run, dict)
                and run.get("status") == STATE_RUNNING
                and pid_alive(run.get("pid"))
            ):
                return run
        return None

    def start_workflow(self, workflow_id: str) -> Dict[str, Any]:
        definition = workflow_definition(workflow_id)
        if definition is None:
            raise LookupError(f"未知工作流程：{workflow_id}")
        with self._lock:
            active = self._active_any()
            if active is not None:
                raise RuntimeError(
                    f"已有處理程序執行中（run {active.get('id')}，PID {active.get('pid')}）。"
                )
            external = _detect_external_processes()
            if external:
                process = external[0]
                raise RuntimeError(
                    f"外部{process.get('title') or '處理程序'}正在執行中"
                    f"（PID {process.get('pid')}），請等待結束後再啟動。"
                )
            run_id = self.store.start_run(
                branch=definition.branch,
                kind=definition.kind,
                title=definition.label,
                stages=[definition.stage],
                pid=os.getpid(),
                meta={
                    "workflow": definition.id,
                    "program": definition.program,
                    "script": definition.script,
                    "pid_pending": True,
                },
                message=f"準備執行 {definition.label}。",
            )
            log_dir = self.root / ".run"
            log_dir.mkdir(parents=True, exist_ok=True)
            stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            log_path = log_dir / f"workflow_{definition.id}_{stamp}.log"
            env = os.environ.copy()
            env["JUDGMENT_PROCESSING_STATE"] = str(self.state_path)
            env["JUDGMENT_PROCESSING_PARENT"] = run_id
            command = [
                sys.executable,
                "-m",
                "judgment.workflow_runner",
                "--workflow",
                definition.id,
                "--run-id",
                run_id,
            ]
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
                    message=f"無法啟動 {definition.label}：{exc.__class__.__name__}: {exc}",
                )
                raise RuntimeError(
                    f"無法啟動 {definition.label}：{exc.__class__.__name__}: {exc}"
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
                    "workflow": definition.id,
                    "program": definition.program,
                    "script": definition.script,
                    "log_path": str(log_path),
                    "pid_pending": False,
                },
                message=f"已啟動 {definition.label}。",
            )
            return {
                "status": "started",
                "workflow": definition.id,
                "run_id": run_id,
                "pid": process.pid,
                "log_path": str(log_path),
                "state_path": str(self.state_path),
            }

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
                if process.get("kind")
                in {"update", "import", "download", "legal_index"}
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
                stages=["download", "legal_qdrant", "postgres", "qdrant"],
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
        active = self._active_any()
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
    "active_import_event_stream",
    "build_active_import",
    "build_processing_plan",
    "build_processing_snapshot",
]
