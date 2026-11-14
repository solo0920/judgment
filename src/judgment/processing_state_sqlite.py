from __future__ import annotations

import hashlib
import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def _is_sqlite_file(path: Path) -> bool:
    try:
        with path.open("rb") as handle:
            return handle.read(16) == b"SQLite format 3\x00"
    except OSError:
        return False


def _json_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


class SQLiteStateBackend:
    """SQLite WAL checkpoint store preserving the ProcessingStateStore API.

    Runs are stored as individual JSON rows.  ``_mutate`` reads the payload,
    changes one or more runs, then rewrites only the rows whose serialized
    content changed.
    """

    def __init__(self, path: Path) -> None:
        self.path = Path(path)
        self.legacy_json = self.path.with_suffix(".json")
        self._ready = False
        self._hashes: Optional[Dict[str, str]] = None

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.path), timeout=5.0)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        self._secure_files()
        return conn

    def _secure_files(self) -> None:
        for candidate in (
            self.path,
            self.path.with_name(self.path.name + "-wal"),
            self.path.with_name(self.path.name + "-shm"),
        ):
            try:
                if candidate.exists():
                    candidate.chmod(0o600)
            except OSError:
                pass

    def _ensure_schema(self, conn: sqlite3.Connection) -> None:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS state_meta (
                key TEXT PRIMARY KEY,
                value TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT '',
                payload TEXT NOT NULL
            )
            """
        )
        conn.commit()

    def _migrate_if_needed(self) -> None:
        if self._ready:
            return
        legacy = None
        if self.path.exists() and not _is_sqlite_file(self.path):
            legacy = self.path
        elif (
            self.path.suffix != ".json"
            and not self.path.exists()
            and self.legacy_json.exists()
        ):
            legacy = self.legacy_json
        if legacy is not None:
            self._import_legacy(legacy)
        self._ready = True

    def _import_legacy(self, legacy: Path) -> None:
        source = legacy
        if source == self.path:
            # A legacy JSON file can occupy the configured path.  Move it
            # aside before opening the same path as a SQLite database.
            source = self.path.with_name(self.path.name + ".legacy")
            try:
                legacy.replace(source)
            except OSError:
                logger.warning(
                    "無法移動舊 processing state %s",
                    legacy,
                    exc_info=True,
                )
                return
        try:
            text = source.read_text(encoding="utf-8")
            payload = json.loads(text)
        except (OSError, ValueError):
            logger.warning(
                "無法讀取舊 processing state %s，將建立新的 SQLite state",
                source,
                exc_info=True,
            )
            return
        if not isinstance(payload, dict):
            return
        runs = payload.get("runs")
        if not isinstance(runs, list):
            runs = []
        conn = self._connect()
        try:
            self._ensure_schema(conn)
            conn.execute("DELETE FROM runs")
            for run in runs:
                if not isinstance(run, dict):
                    continue
                run_id = str(run.get("id") or "")
                if not run_id:
                    continue
                conn.execute(
                    """
                    INSERT OR REPLACE INTO runs
                        (id, created_at, status, payload)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        run_id,
                        str(run.get("started_at") or ""),
                        str(run.get("status") or ""),
                        _json_dump(run),
                    ),
                )
            conn.execute(
                "INSERT OR REPLACE INTO state_meta(key, value) VALUES(?, ?)",
                ("version", str(payload.get("version") or 1)),
            )
            conn.execute(
                "INSERT OR REPLACE INTO state_meta(key, value) VALUES(?, ?)",
                ("updated_at", str(payload.get("updated_at") or "")),
            )
            conn.commit()
        finally:
            conn.close()
        try:
            source.replace(source.with_name(source.name + ".migrated"))
        except OSError:
            logger.warning(
                "processing state 已遷移，但無法重新命名 %s",
                source,
                exc_info=True,
            )

    def read(self) -> Dict[str, Any]:
        if not self.path.exists():
            self._migrate_if_needed()
            if not self.path.exists():
                self._hashes = {}
                return {"version": 1, "updated_at": "", "runs": []}
        self._migrate_if_needed()
        conn = self._connect()
        try:
            self._ensure_schema(conn)
            rows = conn.execute(
                """
                SELECT id, payload FROM runs
                ORDER BY created_at DESC, rowid DESC
                """
            ).fetchall()
            meta_rows = conn.execute(
                "SELECT key, value FROM state_meta"
            ).fetchall()
        finally:
            conn.close()
        meta = {str(key): str(value or "") for key, value in meta_rows}
        runs: List[Dict[str, Any]] = []
        hashes: Dict[str, str] = {}
        for run_id, payload in rows:
            try:
                run = json.loads(payload)
            except ValueError:
                continue
            if not isinstance(run, dict):
                continue
            runs.append(run)
            hashes[str(run_id)] = hashlib.sha1(
                str(payload).encode("utf-8")
            ).hexdigest()
        self._hashes = hashes
        return {
            "version": int(meta.get("version") or 1),
            "updated_at": meta.get("updated_at") or "",
            "runs": runs,
        }

    def write(self, payload: Dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._migrate_if_needed()
        runs = payload.get("runs")
        if not isinstance(runs, list):
            runs = []
        previous = self._hashes
        conn = self._connect()
        try:
            self._ensure_schema(conn)
            current_hashes: Dict[str, str] = {}
            kept_ids: List[str] = []
            for run in runs:
                if not isinstance(run, dict):
                    continue
                run_id = str(run.get("id") or "")
                if not run_id:
                    continue
                serialized = _json_dump(run)
                digest = hashlib.sha1(serialized.encode("utf-8")).hexdigest()
                current_hashes[run_id] = digest
                kept_ids.append(run_id)
                if previous is not None and previous.get(run_id) == digest:
                    continue
                conn.execute(
                    """
                    INSERT INTO runs(id, created_at, status, payload)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET
                        status=excluded.status,
                        payload=excluded.payload
                    """,
                    (
                        run_id,
                        str(run.get("started_at") or ""),
                        str(run.get("status") or ""),
                        serialized,
                    ),
                )
            if kept_ids:
                placeholders = ",".join("?" for _ in kept_ids)
                conn.execute(
                    f"DELETE FROM runs WHERE id NOT IN ({placeholders})",
                    kept_ids,
                )
            else:
                conn.execute("DELETE FROM runs")
            conn.execute(
                "INSERT OR REPLACE INTO state_meta(key, value) VALUES(?, ?)",
                ("version", str(payload.get("version") or 1)),
            )
            conn.execute(
                "INSERT OR REPLACE INTO state_meta(key, value) VALUES(?, ?)",
                ("updated_at", str(payload.get("updated_at") or "")),
            )
            conn.commit()
            # Update the main file mtime so state watchers and caches see a
            # checkpoint change without forcing a WAL checkpoint on every
            # single progress write.
            try:
                os.utime(self.path, None)
            except OSError:
                pass
            wal_path = self.path.with_name(self.path.name + "-wal")
            try:
                if (
                    wal_path.exists()
                    and wal_path.stat().st_size > 4 * 1024 * 1024
                ):
                    conn.execute("PRAGMA wal_checkpoint(PASSIVE)")
            except (OSError, sqlite3.Error):
                pass
            self._hashes = current_hashes
        finally:
            conn.close()


__all__ = ["SQLiteStateBackend"]
