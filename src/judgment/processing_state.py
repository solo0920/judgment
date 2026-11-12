from __future__ import annotations

import json
import logging
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple
from uuid import uuid4

logger = logging.getLogger(__name__)

try:  # pragma: no cover - POSIX is the supported runtime
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None  # type: ignore[assignment]

STATE_VERSION = 1

STAGE_CATALOG: Dict[str, Dict[str, str]] = {
    "extract": {"label": "RAR 解壓縮", "color": "#f59e0b", "unit": "bytes"},
    "raw_parquet": {
        "label": "原始 Parquet 備份",
        "color": "#ec4899",
        "unit": "筆",
    },
    "filter": {"label": "金融法規篩選", "color": "#a78bfa", "unit": "筆"},
    "postgres": {"label": "PostgreSQL metadata", "color": "#3b82f6", "unit": "筆"},
    "parquet": {
        "label": "查詢用 Parquet（衍生）",
        "color": "#10b981",
        "unit": "筆",
    },
    "qdrant": {"label": "Qdrant 索引", "color": "#06b6d4", "unit": "筆"},
    "ollama": {"label": "Ollama 連線測試", "color": "#22c55e", "unit": "台"},
    "validate": {"label": "索引驗證／切換", "color": "#eab308", "unit": "筆"},
    "download": {"label": "線上比對／下載", "color": "#f97316", "unit": "bytes"},
    "parse": {"label": "資料解析", "color": "#8b5cf6", "unit": "筆"},
}

ARCHIVE_STAGES: Tuple[str, ...] = ("extract", "raw_parquet", "filter", "postgres")

BRANCH_STAGES: Dict[str, List[str]] = {
    "judgment": [
        "extract",
        "raw_parquet",
        "filter",
        "postgres",
        "qdrant",
    ],
    "law": ["download", "raw_parquet", "parse", "postgres"],
    "order": ["download", "raw_parquet", "parse", "postgres"],
    "system": ["download", "postgres", "qdrant"],
}

TERMINAL_RUN_STATUSES = {
    "success",
    "partial",
    "failed",
    "interrupted",
    "no_change",
    "stale",
}


class ProcessingStateError(RuntimeError):
    """Raised when the shared processing state file cannot be read."""


def default_state_path() -> Path:
    """Return the shared state file used by the web app and CLI jobs.

    The path is stable regardless of the current working directory when the
    project checkout is available, because both the API and the pipeline
    commands import this module from the same source tree.
    """

    raw = os.getenv("JUDGMENT_PROCESSING_STATE", "").strip()
    if raw:
        return Path(raw).expanduser().resolve()
    root = Path(__file__).resolve().parents[2]
    if (root / "pyproject.toml").is_file():
        return root / ".run" / "processing_state.json"
    return Path.cwd() / ".run" / "processing_state.json"


def now_iso(value: Optional[datetime] = None) -> str:
    moment = value or datetime.now(timezone.utc)
    return moment.astimezone(timezone.utc).isoformat()


def parent_run_id() -> str:
    """Return the update-run id passed by the web manager, if any."""

    return os.getenv("JUDGMENT_PROCESSING_PARENT", "").strip()


def parse_iso(value: Any) -> Optional[datetime]:
    text = str(value or "").strip()
    if not text:
        return None
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def elapsed_ms(started_at: Any, finished_at: Any = None) -> int:
    started = parse_iso(started_at)
    if started is None:
        return 0
    finished = parse_iso(finished_at) or datetime.now(timezone.utc)
    return max(0, int((finished - started).total_seconds() * 1000))


def pid_alive(pid: Any) -> bool:
    try:
        value = int(pid)
    except (TypeError, ValueError):
        return False
    if value <= 0:
        return False
    try:
        os.kill(value, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    except OSError:
        return False
    return True


def _stage_for(key: str) -> Dict[str, Any]:
    definition = STAGE_CATALOG.get(key, {})
    return {
        "key": key,
        "label": definition.get("label", key),
        "color": definition.get("color", "#64748b"),
        "unit": definition.get("unit", ""),
        "status": "pending",
        "started_at": None,
        "finished_at": None,
        "duration_ms": 0,
        "current": 0,
        "total": None,
        "message": "",
    }


def _apply_stage_update(stage: Dict[str, Any], fields: Dict[str, Any]) -> None:
    status = fields.get("status")
    if status == "running" and not stage.get("started_at"):
        stage["started_at"] = now_iso()
    duration = fields.get("duration_ms")
    if duration is not None:
        stage["duration_ms"] = max(0, int(duration))
    for key in ("current", "total"):
        if key in fields and fields[key] is not None:
            try:
                stage[key] = max(0, int(fields[key]))
            except (TypeError, ValueError):
                pass
    if "message" in fields and fields["message"] is not None:
        stage["message"] = str(fields["message"])
    if status:
        stage["status"] = str(status)
        if status in {
            "success",
            "partial",
            "failed",
            "interrupted",
            "no_change",
            "skipped",
            "stale",
        }:
            stage["finished_at"] = now_iso()
            if stage.get("started_at") and not stage.get("duration_ms"):
                stage["duration_ms"] = elapsed_ms(
                    stage.get("started_at"), stage.get("finished_at")
                )
        elif status == "running":
            stage["finished_at"] = None


class ProcessingStateStore:
    """Small, process-safe JSON state store for the processing dashboard."""

    def __init__(self, path: Optional[Path] = None) -> None:
        self.path = Path(path or default_state_path()).expanduser()
        self.lock_path = self.path.with_name(self.path.name + ".lock")

    # ------------------------------------------------------------- reading
    def _empty(self) -> Dict[str, Any]:
        return {
            "version": STATE_VERSION,
            "updated_at": now_iso(),
            "runs": [],
        }

    def _read_unlocked(self) -> Dict[str, Any]:
        try:
            text = self.path.read_text(encoding="utf-8")
        except FileNotFoundError:
            return self._empty()
        except OSError as exc:
            raise ProcessingStateError(f"無法讀取處理狀態：{exc}") from exc
        try:
            payload = json.loads(text)
        except ValueError as exc:
            raise ProcessingStateError(f"處理狀態檔不是有效 JSON：{exc}") from exc
        if not isinstance(payload, dict):
            raise ProcessingStateError("處理狀態檔格式不正確")
        runs = payload.get("runs")
        if not isinstance(runs, list):
            payload["runs"] = []
        payload.setdefault("version", STATE_VERSION)
        payload.setdefault("updated_at", now_iso())
        return payload

    def read(self) -> Dict[str, Any]:
        with self._locked():
            return self._read_unlocked()

    @contextmanager
    def _locked(self) -> Iterator[None]:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.lock_path.open("a+") as handle:
            if fcntl is not None:
                fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
            try:
                yield
            finally:
                if fcntl is not None:
                    fcntl.flock(handle.fileno(), fcntl.LOCK_UN)

    def _write_unlocked(self, payload: Dict[str, Any]) -> None:
        payload["version"] = STATE_VERSION
        payload["updated_at"] = now_iso()
        temporary = self.path.with_name(
            f".{self.path.name}.{os.getpid()}.{uuid4().hex[:6]}.tmp"
        )
        temporary.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        os.replace(temporary, self.path)

    def _mutate(self, callback) -> Any:
        """Apply ``callback`` under a lock; never break a data job on I/O."""

        try:
            with self._locked():
                payload = self._read_unlocked()
                self._reconcile_unlocked(payload)
                result = callback(payload)
                self._write_unlocked(payload)
                return result
        except ProcessingStateError as exc:
            logger.warning("processing state unavailable: %s", exc)
            return None
        except OSError as exc:
            logger.warning("processing state write failed: %s", exc)
            return None

    @staticmethod
    def _reconcile_unlocked(payload: Dict[str, Any]) -> None:
        runs = payload.get("runs")
        if not isinstance(runs, list):
            payload["runs"] = []
            return
        now = now_iso()
        for run in runs:
            if not isinstance(run, dict):
                continue
            if run.get("status") != "running":
                continue
            pid = run.get("pid")
            if not pid_alive(pid):
                run["status"] = "stale"
                run["finished_at"] = run.get("finished_at") or now
                if not run.get("duration_ms"):
                    run["duration_ms"] = elapsed_ms(
                        run.get("started_at"), run.get("finished_at")
                    )
                message = str(run.get("message") or "").strip()
                note = "狀態檔顯示執行中，但程序已不存在。"
                run["message"] = f"{message}；{note}" if message else note
                for stage in (run.get("stages") or {}).values():
                    if isinstance(stage, dict) and stage.get("status") == "running":
                        stage["status"] = "stale"
                        stage["finished_at"] = stage.get("finished_at") or now
                        if not stage.get("duration_ms"):
                            stage["duration_ms"] = elapsed_ms(
                                stage.get("started_at"), stage.get("finished_at")
                            )
                for archive in (run.get("archives") or {}).values():
                    if not isinstance(archive, dict):
                        continue
                    if archive.get("status") == "running":
                        archive["status"] = "stale"
                        archive["finished_at"] = archive.get("finished_at") or now
                        archive["duration_ms"] = elapsed_ms(
                            archive.get("started_at"), archive.get("finished_at")
                        )
                    for stage in (archive.get("stages") or {}).values():
                        if isinstance(stage, dict) and stage.get("status") == "running":
                            stage["status"] = "stale"
                            stage["finished_at"] = stage.get("finished_at") or now
                            if not stage.get("duration_ms"):
                                stage["duration_ms"] = elapsed_ms(
                                    stage.get("started_at"), stage.get("finished_at")
                                )

    def find_run(self, payload: Dict[str, Any], run_id: str) -> Optional[Dict[str, Any]]:
        for run in payload.get("runs", []):
            if isinstance(run, dict) and run.get("id") == run_id:
                return run
        return None

    # ------------------------------------------------------------- writing
    def start_run(
        self,
        *,
        branch: str,
        kind: str,
        title: str,
        stages: Optional[List[str]] = None,
        pid: Optional[int] = None,
        meta: Optional[Dict[str, Any]] = None,
        message: str = "",
    ) -> str:
        run_id = uuid4().hex[:16]
        stage_keys = stages or list(BRANCH_STAGES.get(branch, []))
        started_at = now_iso()

        def mutate(payload: Dict[str, Any]) -> str:
            run = {
                "id": run_id,
                "branch": branch,
                "kind": kind,
                "title": title,
                "status": "running",
                "pid": int(pid if pid is not None else os.getpid()),
                "started_at": started_at,
                "finished_at": None,
                "duration_ms": 0,
                "current_stage": stage_keys[0] if stage_keys else "",
                "message": message,
                "stages": {key: _stage_for(key) for key in stage_keys},
                "archives": {},
                "counts": {},
                "meta": dict(meta or {}),
                "updated_at": started_at,
            }
            payload.setdefault("runs", []).insert(0, run)
            runs = [item for item in payload["runs"] if isinstance(item, dict)]
            running = [item for item in runs if item.get("status") == "running"][:20]
            completed = [item for item in runs if item.get("status") != "running"][:40]
            payload["runs"] = running + completed
            return run_id

        return str(self._mutate(mutate) or run_id)

    def update_run(self, run_id: str, **fields: Any) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            for key in ("status", "message", "current_stage", "pid"):
                if key in fields and fields[key] is not None:
                    run[key] = fields[key]
            if "counts" in fields and isinstance(fields["counts"], dict):
                run.setdefault("counts", {}).update(fields["counts"])
            if "meta" in fields and isinstance(fields["meta"], dict):
                run.setdefault("meta", {}).update(fields["meta"])
            run["updated_at"] = now_iso()

        self._mutate(mutate)

    def set_current_stage(self, run_id: str, stage_key: str) -> None:
        self.update_run(run_id, current_stage=stage_key)

    def start_stage(
        self,
        run_id: str,
        stage_key: str,
        *,
        total: Optional[int] = None,
        message: str = "",
    ) -> None:
        self._stage_update(
            run_id,
            stage_key,
            {"status": "running", "total": total, "message": message},
        )

    def update_stage(
        self,
        run_id: str,
        stage_key: str,
        *,
        current: Optional[int] = None,
        total: Optional[int] = None,
        status: Optional[str] = None,
        message: Optional[str] = None,
        duration_ms: Optional[int] = None,
        increment: Optional[int] = None,
    ) -> None:
        fields: Dict[str, Any] = {}
        if current is not None:
            fields["current"] = current
        if total is not None:
            fields["total"] = total
        if status:
            fields["status"] = status
        if message is not None:
            fields["message"] = message
        if duration_ms is not None:
            fields["duration_ms"] = duration_ms
        if increment is not None:
            fields["_increment"] = increment
        self._stage_update(run_id, stage_key, fields)

    def finish_stage(
        self,
        run_id: str,
        stage_key: str,
        *,
        status: str = "success",
        current: Optional[int] = None,
        total: Optional[int] = None,
        message: Optional[str] = None,
        duration_ms: Optional[int] = None,
    ) -> None:
        fields: Dict[str, Any] = {"status": status}
        if current is not None:
            fields["current"] = current
        if total is not None:
            fields["total"] = total
        if message is not None:
            fields["message"] = message
        if duration_ms is not None:
            fields["duration_ms"] = duration_ms
        self._stage_update(run_id, stage_key, fields)

    def _stage_update(self, run_id: str, stage_key: str, fields: Dict[str, Any]) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            stages = run.setdefault("stages", {})
            stage = stages.get(stage_key)
            if not isinstance(stage, dict):
                stage = _stage_for(stage_key)
                stages[stage_key] = stage
            increment = fields.pop("_increment", None)
            if increment is not None:
                fields["current"] = max(
                    0, int(stage.get("current") or 0) + int(increment)
                )
            _apply_stage_update(stage, fields)
            if stage.get("status") == "running":
                run["current_stage"] = stage_key
            run["updated_at"] = now_iso()

        self._mutate(mutate)

    def finish_run(
        self,
        run_id: str,
        *,
        status: str = "success",
        message: Optional[str] = None,
        counts: Optional[Dict[str, Any]] = None,
    ) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            now = now_iso()
            run["status"] = status
            run["finished_at"] = now
            run["duration_ms"] = elapsed_ms(run.get("started_at"), now)
            if message is not None:
                run["message"] = str(message)
            if counts:
                run.setdefault("counts", {}).update(counts)
            run["current_stage"] = ""
            run["updated_at"] = now
            for stage in (run.get("stages") or {}).values():
                if isinstance(stage, dict) and stage.get("status") in {
                    "pending",
                    "running",
                }:
                    stage["status"] = "skipped" if status == "success" else status
                    if stage.get("status") != "pending":
                        stage["finished_at"] = stage.get("finished_at") or now
                        if not stage.get("duration_ms"):
                            stage["duration_ms"] = elapsed_ms(
                                stage.get("started_at"), stage.get("finished_at")
                            )
            for archive in (run.get("archives") or {}).values():
                if not isinstance(archive, dict):
                    continue
                if archive.get("status") == "running":
                    archive["status"] = status
                    archive["finished_at"] = archive.get("finished_at") or now
                    archive["duration_ms"] = elapsed_ms(
                        archive.get("started_at"), archive.get("finished_at")
                    )
                for stage in (archive.get("stages") or {}).values():
                    if not isinstance(stage, dict) or stage.get("status") not in {
                        "pending",
                        "running",
                    }:
                        continue
                    stage["status"] = "skipped" if status == "success" else status
                    stage["finished_at"] = stage.get("finished_at") or now
                    if not stage.get("duration_ms"):
                        stage["duration_ms"] = elapsed_ms(
                            stage.get("started_at"), stage.get("finished_at")
                        )

        self._mutate(mutate)

    # ------------------------------------------------------------ archives
    def add_archive(
        self,
        run_id: str,
        name: str,
        *,
        path: str = "",
        size_bytes: Optional[int] = None,
    ) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            archives = run.setdefault("archives", {})
            archives[name] = {
                "name": name,
                "path": path,
                "size_bytes": int(size_bytes or 0),
                "status": "pending",
                "current_stage": "",
                "started_at": None,
                "finished_at": None,
                "duration_ms": 0,
                "scanned": 0,
                "matched": 0,
                "stored": 0,
                "error": "",
                "stages": {
                    key: _stage_for(key) for key in ARCHIVE_STAGES
                },
            }
            run["updated_at"] = now_iso()

        self._mutate(mutate)

    def update_archive(self, run_id: str, name: str, **fields: Any) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            archive = (run.get("archives") or {}).get(name)
            if not isinstance(archive, dict):
                return
            for key in (
                "status",
                "current_stage",
                "scanned",
                "matched",
                "stored",
                "error",
                "size_bytes",
                "duration_ms",
            ):
                if key in fields and fields[key] is not None:
                    archive[key] = fields[key]
            if "started_at" in fields and fields["started_at"]:
                archive["started_at"] = fields["started_at"]
            if "finished_at" in fields and fields["finished_at"]:
                archive["finished_at"] = fields["finished_at"]
            if fields.get("status") == "running" and not archive.get("started_at"):
                archive["started_at"] = now_iso()
            if fields.get("status") in {
                "success",
                "failed",
                "interrupted",
                "stale",
                "skipped",
            }:
                archive["finished_at"] = archive.get("finished_at") or now_iso()
                if not archive.get("duration_ms"):
                    archive["duration_ms"] = elapsed_ms(
                        archive.get("started_at"), archive.get("finished_at")
                    )
            run["updated_at"] = now_iso()

        self._mutate(mutate)

    def update_archive_stage(
        self,
        run_id: str,
        name: str,
        stage_key: str,
        **fields: Any,
    ) -> None:
        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            archive = (run.get("archives") or {}).get(name)
            if not isinstance(archive, dict):
                return
            stages = archive.setdefault("stages", {})
            stage = stages.get(stage_key)
            if not isinstance(stage, dict):
                stage = _stage_for(stage_key)
                stages[stage_key] = stage
            _apply_stage_update(stage, dict(fields))
            if stage.get("status") == "running":
                archive["current_stage"] = stage_key
            run["updated_at"] = now_iso()

        self._mutate(mutate)

    # ------------------------------------------------------------- helpers
    def snapshot(self) -> Dict[str, Any]:
        payload = self.read()
        return dict(payload)


def state_file_status(path: Optional[Path] = None) -> Dict[str, Any]:
    """Describe state-file availability without raising for the UI/API."""

    resolved = Path(path or default_state_path()).expanduser()
    if not resolved.exists():
        return {
            "status": "missing",
            "path": str(resolved),
            "detail": "尚未有資料處理執行紀錄；第一次執行後會建立狀態檔。",
        }
    try:
        payload = ProcessingStateStore(resolved).read()
        return {
            "status": "ok",
            "path": str(resolved),
            "runs": len(payload.get("runs") or []),
            "updated_at": payload.get("updated_at"),
        }
    except ProcessingStateError as exc:
        return {
            "status": "error",
            "path": str(resolved),
            "detail": str(exc),
        }
    except OSError as exc:
        return {
            "status": "error",
            "path": str(resolved),
            "detail": f"無法讀取狀態檔：{exc}",
        }


def stage_seconds(stage: Dict[str, Any]) -> float:
    duration = float(stage.get("duration_ms") or 0)
    if not duration and stage.get("status") == "running":
        started = parse_iso(stage.get("started_at"))
        if started is not None:
            duration = max(0.0, (datetime.now(timezone.utc) - started).total_seconds() * 1000)
    return duration / 1000.0


__all__ = [
    "ARCHIVE_STAGES",
    "BRANCH_STAGES",
    "ProcessingStateError",
    "ProcessingStateStore",
    "STAGE_CATALOG",
    "default_state_path",
    "elapsed_ms",
    "now_iso",
    "parse_iso",
    "pid_alive",
    "stage_seconds",
    "state_file_status",
]
