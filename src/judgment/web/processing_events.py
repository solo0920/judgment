from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Set

from ..processing_events import (
    default_event_journal_path,
    default_event_socket_path,
)
from ..processing_event_store import ProcessingEventStore

logger = logging.getLogger(__name__)


class ProcessingEventServer:
    """Receive importer progress events and publish them to SSE immediately."""

    def __init__(
        self,
        *,
        broker,
        socket_path: Optional[Path] = None,
        journal_path: Optional[Path] = None,
    ) -> None:
        self.broker = broker
        self.socket_path = Path(socket_path or default_event_socket_path())
        self.journal_path = Path(journal_path or default_event_journal_path())
        self._server: Optional[asyncio.AbstractServer] = None
        self._store: Optional[ProcessingEventStore] = None
        self._writers: Set[asyncio.StreamWriter] = set()
        self._tail_task: Optional[asyncio.Task] = None
        self._last_published_id = 0
        self._received = 0
        self._published = 0
        self._append_errors = 0
        self._tail_errors = 0
        self._last_publish_latency_ms = 0.0
        self._closed = False

    async def start(self) -> None:
        if self._server is not None or self._closed:
            return
        self.socket_path.parent.mkdir(parents=True, exist_ok=True)
        self.journal_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            if self.socket_path.exists():
                self.socket_path.unlink()
        except OSError:
            logger.warning(
                "無法移除舊的 processing event socket %s",
                self.socket_path,
                exc_info=True,
            )
        try:
            self._store = ProcessingEventStore(
                self.journal_path,
                legacy_jsonl=self.journal_path.with_suffix(".jsonl"),
            )
            self._store.start()
            self._server = await asyncio.start_unix_server(
                self._handle_client,
                path=str(self.socket_path),
            )
            os.chmod(self.socket_path, 0o600)
            if self._store is not None:
                self._last_published_id = self._store.latest_id()
                self._tail_task = asyncio.create_task(self._tail_events())
        except Exception:
            if self._store is not None:
                self._store.close()
                self._store = None
            logger.warning(
                "無法啟動 processing event socket %s",
                self.socket_path,
                exc_info=True,
            )
            self._server = None

    async def stop(self) -> None:
        self._closed = True
        if self._tail_task is not None:
            self._tail_task.cancel()
            try:
                await self._tail_task
            except asyncio.CancelledError:
                pass
            self._tail_task = None
        server = self._server
        self._server = None
        if server is not None:
            server.close()
            await server.wait_closed()
        for writer in list(self._writers):
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass
        self._writers.clear()
        if self._store is not None:
            self._store.close()
            self._store = None
        try:
            if self.socket_path.exists():
                self.socket_path.unlink()
        except OSError:
            pass

    @property
    def store(self) -> Optional[ProcessingEventStore]:
        return self._store

    def replay_after(self, last_event_id: int, limit: int = 1000):
        if self._store is None:
            return [], False
        return self._store.replay_after(last_event_id, limit=limit)

    def latest_event_id(self) -> int:
        if self._store is None:
            return 0
        return self._store.latest_id()

    def stats(self) -> dict:
        return {
            "socket": str(self.socket_path),
            "journal": str(self.journal_path),
            "latest_event_id": self.latest_event_id(),
            "last_published_id": self._last_published_id,
            "received": self._received,
            "published": self._published,
            "append_errors": self._append_errors,
            "tail_errors": self._tail_errors,
            "last_publish_latency_ms": round(
                self._last_publish_latency_ms, 2
            ),
            "subscribers": self.broker.subscriber_count("processing"),
        }

    async def _tail_events(self) -> None:
        """Publish events appended by any process sharing this journal.

        This makes the SQLite journal the shared bus for multiple web server
        instances on the same machine; the socket owner only appends.
        """

        while not self._closed:
            if self._store is None:
                await asyncio.sleep(0.05)
                continue
            try:
                events, _ = await asyncio.to_thread(
                    lambda: self._store.replay_after(
                        self._last_published_id, limit=200
                    )
                )
            except Exception:
                self._tail_errors += 1
                logger.warning(
                    "processing event tail failed", exc_info=True
                )
                events = []
            for item in events:
                event_id = int(item.get("event_id") or 0)
                event = item.get("event")
                if event_id <= 0 or not isinstance(event, dict):
                    continue
                self.broker.publish_event(
                    "processing",
                    "progress",
                    event,
                    event_id=event_id,
                )
                self._published += 1
                self._last_published_id = event_id
                try:
                    created = datetime.fromisoformat(
                        str(event.get("timestamp") or "")
                    )
                    if created.tzinfo is None:
                        created = created.replace(tzinfo=timezone.utc)
                    self._last_publish_latency_ms = max(
                        0.0,
                        (
                            datetime.now(timezone.utc) - created
                        ).total_seconds()
                        * 1000,
                    )
                except ValueError:
                    pass
            await asyncio.sleep(0.02)

    async def _handle_client(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> None:
        self._writers.add(writer)
        try:
            while True:
                raw_line = await reader.readline()
                if not raw_line:
                    break
                if len(raw_line) > 1_000_000:
                    logger.warning("忽略過大的 processing event")
                    continue
                try:
                    event = json.loads(raw_line.decode("utf-8"))
                except (UnicodeDecodeError, ValueError):
                    logger.warning("忽略格式錯誤的 processing event")
                    continue
                if not isinstance(event, dict) or not event.get("type"):
                    logger.warning("忽略缺少 type 的 processing event")
                    continue
                self._received += 1
                if self._store is not None:
                    try:
                        self._store.append(event)
                    except Exception:
                        self._append_errors += 1
                        logger.warning(
                            "無法寫入 processing event journal",
                            exc_info=True,
                        )
        except (ConnectionError, asyncio.IncompleteReadError):
            pass
        except Exception:
            logger.warning("processing event client 處理失敗", exc_info=True)
        finally:
            self._writers.discard(writer)
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass


__all__ = ["ProcessingEventServer"]
