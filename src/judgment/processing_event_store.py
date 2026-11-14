from __future__ import annotations

import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

DEFAULT_RETENTION = 200_000
EVENT_VERSION = 1


def validate_event(event: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(event, dict):
        raise ValueError("event must be an object")
    raw_version = event.get("version")
    version = (
        EVENT_VERSION
        if raw_version in (None, "")
        else int(raw_version)
    )
    if version != EVENT_VERSION:
        raise ValueError(f"unsupported event version: {version}")
    event_type = str(event.get("type") or "").strip()
    if not event_type:
        raise ValueError("event type is required")
    seq = int(event.get("seq") or 0)
    if seq < 0:
        raise ValueError("event seq must be non-negative")
    event["version"] = EVENT_VERSION
    event["type"] = event_type
    event["seq"] = seq
    event["run_id"] = str(event.get("run_id") or "")
    event["timestamp"] = str(event.get("timestamp") or "")
    return event


class ProcessingEventStore:
    """SQLite WAL event journal with ordered replay support."""

    def __init__(
        self,
        path: Path,
        *,
        legacy_jsonl: Optional[Path] = None,
        retention: Optional[int] = None,
    ) -> None:
        self.path = Path(path)
        self.legacy_jsonl = Path(legacy_jsonl) if legacy_jsonl else None
        self.retention = max(
            1_000,
            int(
                retention
                if retention is not None
                else os.getenv("JUDGMENT_EVENT_RETENTION", DEFAULT_RETENTION)
            ),
        )
        self._conn: Optional[sqlite3.Connection] = None

    @property
    def connection(self) -> sqlite3.Connection:
        if self._conn is None:
            raise RuntimeError("processing event store is not started")
        return self._conn

    def start(self) -> None:
        if self._conn is not None:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(
            str(self.path),
            timeout=5.0,
            check_same_thread=False,
        )
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        self._secure_files()
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS processing_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT NOT NULL DEFAULT '',
                seq INTEGER NOT NULL DEFAULT 0,
                type TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT '',
                payload TEXT NOT NULL
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_processing_events_run_seq "
            "ON processing_events(run_id, seq)"
        )
        try:
            conn.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS "
                "idx_processing_events_unique_run_seq "
                "ON processing_events(run_id, seq) WHERE seq > 0"
            )
        except sqlite3.IntegrityError:
            logger.warning(
                "processing event journal 有重複 (run_id, seq)，"
                "保留既有資料但無法建立唯一索引",
                exc_info=True,
            )
        conn.commit()
        self._conn = conn
        self._migrate_legacy_jsonl()
        self._prune()

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

    def _migrate_legacy_jsonl(self) -> None:
        legacy = self.legacy_jsonl
        if legacy is None or not legacy.is_file():
            return
        if self.latest_id() > 0:
            return
        migrated = 0
        try:
            with legacy.open("r", encoding="utf-8") as handle:
                for line in handle:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        event = json.loads(line)
                    except ValueError:
                        continue
                    if not isinstance(event, dict):
                        continue
                    try:
                        self.append(event)
                    except ValueError:
                        continue
                    migrated += 1
        except OSError:
            logger.warning(
                "無法遷移 Phase 1 processing event journal %s",
                legacy,
                exc_info=True,
            )
            return
        if migrated:
            try:
                legacy.replace(
                    legacy.with_name(legacy.name + ".migrated")
                )
            except OSError:
                logger.warning(
                    "processing event journal 已遷移，但無法重新命名 %s",
                    legacy,
                    exc_info=True,
                )

    def _prune(self) -> None:
        try:
            self.connection.execute(
                """
                DELETE FROM processing_events
                WHERE id <= (
                    SELECT COALESCE(MAX(id), 0) - ? FROM processing_events
                )
                """,
                (self.retention,),
            )
            self.connection.commit()
        except sqlite3.Error:
            logger.warning("無法修剪 processing event journal", exc_info=True)

    def append(self, event: Dict[str, Any]) -> int:
        event = validate_event(dict(event))
        payload = json.dumps(
            event, ensure_ascii=False, separators=(",", ":")
        )
        cursor = self.connection.execute(
            """
            INSERT OR IGNORE INTO processing_events
                (run_id, seq, type, created_at, payload)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                str(event.get("run_id") or ""),
                int(event.get("seq") or 0),
                str(event.get("type") or ""),
                str(event.get("timestamp") or ""),
                payload,
            ),
        )
        self.connection.commit()
        event_id = int(cursor.lastrowid or 0)
        if cursor.rowcount == 0 and int(event.get("seq") or 0) > 0:
            row = self.connection.execute(
                "SELECT id FROM processing_events "
                "WHERE run_id = ? AND seq = ?",
                (
                    str(event.get("run_id") or ""),
                    int(event.get("seq") or 0),
                ),
            ).fetchone()
            event_id = int(row[0] or 0) if row else 0
        if event_id:
            self._secure_files()
        if event_id and event_id % 1000 == 0:
            self._prune()
        return event_id

    def latest_id(self) -> int:
        if self._conn is None:
            return 0
        row = self.connection.execute(
            "SELECT COALESCE(MAX(id), 0) FROM processing_events"
        ).fetchone()
        return int(row[0] or 0) if row else 0

    def replay_after(
        self,
        last_event_id: int,
        *,
        limit: int = 1000,
    ) -> Tuple[List[Dict[str, Any]], bool]:
        if self._conn is None:
            return [], False
        limit = max(1, int(limit))
        bounds = self.connection.execute(
            "SELECT COALESCE(MIN(id), 0), COALESCE(MAX(id), 0) "
            "FROM processing_events"
        ).fetchone()
        min_id = int(bounds[0] or 0) if bounds else 0
        max_id = int(bounds[1] or 0) if bounds else 0
        if last_event_id > max_id:
            return [], False
        if min_id and last_event_id < min_id - 1:
            return [], False
        rows = self.connection.execute(
            """
            SELECT id, payload FROM processing_events
            WHERE id > ?
            ORDER BY id ASC
            LIMIT ?
            """,
            (max(0, int(last_event_id)), limit + 1),
        ).fetchall()
        complete = len(rows) <= limit
        events: List[Dict[str, Any]] = []
        for event_id, payload in rows[:limit]:
            try:
                event = json.loads(payload)
            except ValueError:
                continue
            if not isinstance(event, dict):
                continue
            events.append({"event_id": int(event_id), "event": event})
        return events, complete

    def close(self) -> None:
        if self._conn is None:
            return
        try:
            self._conn.close()
        except sqlite3.Error:
            pass
        self._conn = None


__all__ = ["ProcessingEventStore"]
