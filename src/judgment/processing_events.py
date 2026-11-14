from __future__ import annotations

import atexit
import hashlib
import json
import os
import queue
import socket
import tempfile
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

from .processing_event_store import ProcessingEventStore
from .processing_state import default_state_path

EVENT_VERSION = 1
LIFECYCLE_EVENTS = {
    "run_started",
    "run_finished",
    "archive_started",
    "archive_completed",
    "stage_started",
    "stage_failed",
}


def default_event_socket_path() -> Path:
    raw = os.getenv("JUDGMENT_EVENT_SOCKET", "").strip()
    if raw:
        return Path(raw).expanduser()
    state_path = default_state_path().expanduser().resolve()
    digest = hashlib.sha1(str(state_path).encode("utf-8")).hexdigest()[:12]
    return Path(tempfile.gettempdir()) / f"judgment-pe-{digest}.sock"


def default_event_journal_path() -> Path:
    raw = os.getenv("JUDGMENT_EVENT_JOURNAL", "").strip()
    if raw:
        return Path(raw).expanduser()
    return default_state_path().with_name("processing_events.db")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class EventPublisher:
    """Best-effort non-blocking Unix-socket publisher for import progress."""

    def __init__(
        self,
        socket_path: Optional[Path] = None,
        *,
        enabled: bool = True,
        queue_size: int = 2000,
    ) -> None:
        self.socket_path = Path(socket_path or default_event_socket_path())
        self.enabled = enabled
        self._queue: "queue.Queue[Optional[Dict[str, Any]]]" = queue.Queue(
            maxsize=max(1, int(queue_size))
        )
        self._seq = 0
        self._seq_lock = threading.Lock()
        self._thread: Optional[threading.Thread] = None
        self._sock: Optional[socket.socket] = None
        self._fallback_store: Optional[ProcessingEventStore] = None
        self._closed = False

    def _next_seq(self) -> int:
        with self._seq_lock:
            self._seq += 1
            return self._seq

    def emit(
        self,
        event_type: str,
        *,
        run_id: str = "",
        month: str = "",
        archive: str = "",
        stage: str = "",
        status: str = "",
        message: str = "",
        current: Optional[int] = None,
        total: Optional[int] = None,
        percent: Optional[float] = None,
        overall_percent: Optional[float] = None,
        month_stages: Optional[Dict[str, str]] = None,
        month_overall: str = "",
        extra: Optional[Dict[str, Any]] = None,
        workflow_id: str = "judgment_import",
    ) -> None:
        if not self.enabled or self._closed:
            return
        event: Dict[str, Any] = {
            "version": EVENT_VERSION,
            "seq": self._next_seq(),
            "pid": os.getpid(),
            "run_id": str(run_id or ""),
            "workflow_id": workflow_id,
            "type": str(event_type or ""),
            "timestamp": _now_iso(),
            "month": str(month or ""),
            "archive": str(archive or ""),
            "stage": str(stage or ""),
            "status": str(status or ""),
            "message": str(message or ""),
        }
        if current is not None:
            event["current"] = max(0, int(current))
        if total is not None:
            event["total"] = max(0, int(total))
        if percent is not None:
            event["percent"] = round(float(percent), 1)
        if overall_percent is not None:
            event["overall_percent"] = round(float(overall_percent), 1)
        if month_stages:
            event["month_stages"] = {
                str(key): str(value) for key, value in month_stages.items()
            }
        if month_overall:
            event["month_overall"] = str(month_overall)
        if extra:
            event["extra"] = extra
        self._ensure_thread()
        try:
            if event_type in LIFECYCLE_EVENTS:
                try:
                    self._queue.put_nowait(event)
                except queue.Full:
                    # Preserve lifecycle events by making room once.
                    try:
                        self._queue.get_nowait()
                    except queue.Empty:
                        pass
                    try:
                        self._queue.put_nowait(event)
                    except queue.Full:
                        pass
            else:
                self._queue.put_nowait(event)
        except queue.Full:
            # Progress is best-effort; the state checkpoint remains authoritative.
            pass

    def _ensure_thread(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return
        self._thread = threading.Thread(
            target=self._run,
            name="judgment-event-publisher",
            daemon=True,
        )
        self._thread.start()

    def _open(self) -> None:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(0.2)
        sock.connect(str(self.socket_path))
        sock.settimeout(None)
        self._sock = sock

    def _close_socket(self) -> None:
        if self._sock is None:
            return
        try:
            self._sock.close()
        except OSError:
            pass
        self._sock = None

    def _fallback_append(self, event: Dict[str, Any]) -> None:
        try:
            if self._fallback_store is None:
                journal_path = default_event_journal_path()
                self._fallback_store = ProcessingEventStore(
                    journal_path,
                    legacy_jsonl=journal_path.with_suffix(".jsonl"),
                )
                self._fallback_store.start()
            self._fallback_store.append(event)
        except Exception:
            # Best effort; the state checkpoint remains authoritative.
            pass

    def _run(self) -> None:
        while True:
            event = self._queue.get()
            if event is None:
                break
            line = (
                json.dumps(event, ensure_ascii=False, separators=(",", ":"))
                + "\n"
            ).encode("utf-8")
            delivered = False
            for attempt in range(2):
                try:
                    if self._sock is None:
                        self._open()
                    self._sock.sendall(line)
                    delivered = True
                    break
                except OSError:
                    self._close_socket()
                    if attempt == 0:
                        time.sleep(0.01)
            if not delivered:
                self._fallback_append(event)
        self._close_socket()
        if self._fallback_store is not None:
            self._fallback_store.close()
            self._fallback_store = None

    def close(self, timeout: float = 1.0) -> None:
        if self._closed:
            return
        self._closed = True
        try:
            self._queue.put_nowait(None)
        except queue.Full:
            try:
                self._queue.get_nowait()
                self._queue.put_nowait(None)
            except (queue.Empty, queue.Full):
                pass
        if self._thread is not None:
            self._thread.join(timeout=timeout)


_publisher: Optional[EventPublisher] = None
_publisher_lock = threading.Lock()


def event_publisher() -> EventPublisher:
    global _publisher
    with _publisher_lock:
        if _publisher is None:
            _publisher = EventPublisher()
            atexit.register(_publisher.close)
        return _publisher


def publish_event(event_type: str, **fields: Any) -> None:
    event_publisher().emit(event_type, **fields)
