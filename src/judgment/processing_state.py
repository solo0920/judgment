from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional, Tuple
from uuid import uuid4

from .processing_state_sqlite import SQLiteStateBackend

logger = logging.getLogger(__name__)

try:  # pragma: no cover - POSIX is the supported runtime
    import fcntl
except ImportError:  # pragma: no cover
    fcntl = None  # type: ignore[assignment]

STATE_VERSION = 1

STAGE_CATALOG: Dict[str, Dict[str, str]] = {
    "extract": {
        "label": "RAR 檢查／解壓縮",
        "color": "#f59e0b",
        "unit": "bytes",
    },
    "raw_parquet": {
        "label": "原始資料檢查／Parquet 備份",
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
    "legal_qdrant": {
        "label": "法規／命令索引",
        "color": "#14b8a6",
        "unit": "條",
    },
    "ollama": {"label": "Ollama 連線測試", "color": "#22c55e", "unit": "台"},
    "validate": {"label": "索引驗證／切換", "color": "#eab308", "unit": "筆"},
    "download": {
        "label": "線上版本比對／下載更新",
        "color": "#f97316",
        "unit": "bytes",
    },
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
    "law": ["download", "raw_parquet", "parse", "postgres", "legal_qdrant"],
    "order": [
        "download",
        "raw_parquet",
        "parse",
        "postgres",
        "legal_qdrant",
    ],
    "system": ["download", "legal_qdrant", "postgres", "qdrant"],
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
        return root / ".run" / "processing_state.db"
    return Path.cwd() / ".run" / "processing_state.db"


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
        "rate": None,
        "updated_at": None,
        "message": "",
    }


def _apply_stage_update(stage: Dict[str, Any], fields: Dict[str, Any]) -> None:
    status = fields.get("status")
    now = datetime.now(timezone.utc)
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
    if (
        "current" in fields
        and fields["current"] is not None
        and stage.get("status") == "running"
    ):
        started = parse_iso(stage.get("started_at"))
        elapsed = (now - started).total_seconds() if started is not None else 0.0
        current_value = int(stage.get("current") or 0)
        stage["rate"] = (
            round(current_value / elapsed, 2)
            if elapsed > 0 and current_value > 0
            else None
        )
    if status == "running" and "current" not in fields:
        stage["rate"] = None
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
            stage["rate"] = None
            stage["finished_at"] = now_iso()
            if stage.get("started_at") and not stage.get("duration_ms"):
                stage["duration_ms"] = elapsed_ms(
                    stage.get("started_at"), stage.get("finished_at")
                )
        elif status == "running":
            stage["finished_at"] = None
    stage["updated_at"] = now.isoformat()


class ProcessingStateStore:
    """Small, process-safe JSON state store for the processing dashboard."""

    def __init__(self, path: Optional[Path] = None) -> None:
        self.path = Path(path or default_state_path()).expanduser()
        self.lock_path = self.path.with_name(self.path.name + ".lock")
        self._backend = SQLiteStateBackend(self.path)

    # ------------------------------------------------------------- reading
    def _empty(self) -> Dict[str, Any]:
        return {
            "version": STATE_VERSION,
            "updated_at": now_iso(),
            "runs": [],
        }

    def _read_unlocked(self) -> Dict[str, Any]:
        try:
            payload = self._backend.read()
        except Exception as exc:
            raise ProcessingStateError(f"無法讀取處理狀態：{exc}") from exc
        if not isinstance(payload, dict):
            raise ProcessingStateError("處理狀態格式不正確")
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
            try:
                os.chmod(self.lock_path, 0o600)
            except OSError:
                pass
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
        try:
            self._backend.write(payload)
        except Exception as exc:
            raise ProcessingStateError(f"無法寫入處理狀態：{exc}") from exc

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
            try:
                max_completed = max(
                    1, int(os.getenv("JUDGMENT_STATE_MAX_COMPLETED", "20"))
                )
            except ValueError:
                max_completed = 20
            completed = [
                item
                for item in runs
                if item.get("status") != "running"
            ][:max_completed]
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

    def add_archives(
        self,
        run_id: str,
        entries: List[Dict[str, Any]],
    ) -> None:
        """Register many archives in one state-file write."""

        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            archives = run.setdefault("archives", {})
            for entry in entries:
                name = str(entry.get("name") or "")
                if not name:
                    continue
                archives[name] = {
                    "name": name,
                    "path": str(entry.get("path") or ""),
                    "size_bytes": int(entry.get("size_bytes") or 0),
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

    def mark_archives_resumed(
        self,
        run_id: str,
        entries: List[Dict[str, Any]],
    ) -> None:
        """Mark many already-completed archives in one state-file write."""

        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            now = now_iso()
            archives = run.setdefault("archives", {})
            for entry in entries:
                name = str(entry.get("name") or "")
                archive = archives.get(name)
                if not isinstance(archive, dict):
                    continue
                raw_rows = int(entry.get("raw_rows") or 0)
                matched = int(entry.get("matched") or 0)
                stored = int(entry.get("stored") or 0)
                archive.update(
                    {
                        "status": "success",
                        "current_stage": "",
                        "scanned": raw_rows,
                        "matched": matched,
                        "stored": stored,
                        "duration_ms": 0,
                        "finished_at": archive.get("finished_at") or now,
                    }
                )
                stages = archive.setdefault("stages", {})

                def set_stage(
                    key: str,
                    status: str,
                    current: int,
                    total: int,
                    message: str,
                ) -> None:
                    stage = stages.get(key)
                    if not isinstance(stage, dict):
                        stage = _stage_for(key)
                        stages[key] = stage
                    stage.update(
                        {
                            "status": status,
                            "current": int(current or 0),
                            "total": int(total or 0),
                            "message": message,
                            "duration_ms": 0,
                            "finished_at": stage.get("finished_at") or now,
                            "updated_at": now,
                            "rate": None,
                        }
                    )

                extract_current = int(entry.get("extract_current") or 0)
                filter_current = int(entry.get("filter_current") or 0)
                filter_total = int(entry.get("filter_total") or 0)
                postgres_current = int(entry.get("postgres_current") or 0)
                set_stage(
                    "extract",
                    "skipped",
                    extract_current,
                    extract_current,
                    "先前 run 已完成，沿用原始 Parquet。",
                )
                set_stage(
                    "raw_parquet",
                    "success",
                    raw_rows,
                    raw_rows,
                    f"先前 run 已建立原始 Parquet（{raw_rows:,} 筆）。",
                )
                set_stage(
                    "filter",
                    "success",
                    filter_current,
                    filter_total or filter_current,
                    f"先前 run 已完成金融法規篩選（{filter_current:,} 筆）。",
                )
                set_stage(
                    "postgres",
                    "success",
                    postgres_current,
                    postgres_current or matched,
                    f"先前 run 已寫入 PostgreSQL（{postgres_current:,} 筆）。",
                )
            run["updated_at"] = now

        self._mutate(mutate)

    def mark_archives_raw_reused(
        self,
        run_id: str,
        entries: List[Dict[str, Any]],
    ) -> None:
        """Mark many reusable raw Parquet backups in one state-file write.

        Only the extraction and raw-backup stages are completed.  Filter and
        PostgreSQL remain pending so the later stages still process the month.
        """

        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            now = now_iso()
            archives = run.setdefault("archives", {})
            for entry in entries:
                name = str(entry.get("name") or "")
                archive = archives.get(name)
                if not isinstance(archive, dict):
                    continue
                month_label = str(entry.get("month_label") or "")
                raw_rows = int(entry.get("raw_rows") or 0)
                extract_current = int(entry.get("extract_current") or 0)
                archive.update(
                    {
                        "status": "pending",
                        "current_stage": "",
                        "scanned": raw_rows,
                        "matched": 0,
                        "stored": 0,
                        "duration_ms": 0,
                        "raw_reused_prefetched": True,
                    }
                )
                stages = archive.setdefault("stages", {})

                def set_stage(
                    key: str,
                    status: str,
                    current: int,
                    total: int,
                    message: str,
                ) -> None:
                    stage = stages.get(key)
                    if not isinstance(stage, dict):
                        stage = _stage_for(key)
                        stages[key] = stage
                    stage.update(
                        {
                            "status": status,
                            "current": int(current or 0),
                            "total": int(total or 0),
                            "message": message,
                            "duration_ms": 0,
                            "finished_at": stage.get("finished_at") or now,
                            "updated_at": now,
                            "rate": None,
                        }
                    )

                set_stage(
                    "extract",
                    "skipped",
                    extract_current,
                    extract_current,
                    f"沿用 {month_label} 既有原始 Parquet，"
                    "略過重新解壓縮與備份。",
                )
                set_stage(
                    "raw_parquet",
                    "success",
                    raw_rows,
                    raw_rows,
                    f"沿用 {month_label} 既有原始 Parquet"
                    f"（{raw_rows:,} 筆），未重新備份。",
                )
            run["updated_at"] = now

        self._mutate(mutate)

    def update_import_progress(
        self,
        run_id: str,
        *,
        message: Optional[str] = None,
        meta: Optional[Dict[str, Any]] = None,
        stage_updates: Optional[Dict[str, Dict[str, Any]]] = None,
        archive_name: str = "",
        archive_fields: Optional[Dict[str, Any]] = None,
        archive_stage_updates: Optional[Dict[str, Dict[str, Any]]] = None,
    ) -> None:
        """Update run, stage and archive progress in one state-file write."""

        def mutate(payload: Dict[str, Any]) -> None:
            run = self.find_run(payload, run_id)
            if run is None:
                return
            now = now_iso()
            if message is not None:
                run["message"] = str(message)
            if meta:
                run.setdefault("meta", {}).update(meta)
            stages = run.setdefault("stages", {})
            for key, values in (stage_updates or {}).items():
                stage = stages.get(key)
                if not isinstance(stage, dict):
                    stage = _stage_for(key)
                    stages[key] = stage
                _apply_stage_update(stage, dict(values))
            if archive_name:
                archive = (run.get("archives") or {}).get(archive_name)
                if isinstance(archive, dict):
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
                        if (
                            archive_fields
                            and key in archive_fields
                            and archive_fields[key] is not None
                        ):
                            archive[key] = archive_fields[key]
                    if archive_fields:
                        if archive_fields.get("started_at"):
                            archive["started_at"] = archive_fields["started_at"]
                        if archive_fields.get("finished_at"):
                            archive["finished_at"] = archive_fields["finished_at"]
                        if (
                            archive_fields.get("status") == "running"
                            and not archive.get("started_at")
                        ):
                            archive["started_at"] = now
                    archive_stages = archive.setdefault("stages", {})
                    for key, values in (archive_stage_updates or {}).items():
                        stage = archive_stages.get(key)
                        if not isinstance(stage, dict):
                            stage = _stage_for(key)
                            archive_stages[key] = stage
                        _apply_stage_update(stage, dict(values))
            run["updated_at"] = now

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
