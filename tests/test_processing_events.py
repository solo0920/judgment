from __future__ import annotations

import asyncio
import json
import shutil
import sqlite3
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from judgment.processing_events import EventPublisher
from judgment.web.events import EventBroker, TopicSpec
from judgment.processing_event_store import ProcessingEventStore
from judgment.web.processing_events import ProcessingEventServer


def _payload(message: str) -> dict:
    data = message.split("data:", 1)[1].strip()
    return json.loads(data)


def test_event_broker_publishes_progress_event() -> None:
    broker = EventBroker(
        {
            "processing": TopicSpec(
                interval=10.0,
                min_interval=0.0,
            )
        }
    )

    async def scenario() -> None:
        stream = broker.stream(["processing"])
        try:
            initial = await stream.__anext__()
            assert "event: refresh" in initial

            broker.publish_event(
                "processing",
                "progress",
                {
                    "version": 1,
                    "seq": 7,
                    "run_id": "run-1",
                    "type": "archive_started",
                    "month": "2024-04",
                },
                event_id=42,
            )
            message = await asyncio.wait_for(
                stream.__anext__(), timeout=1.0
            )
            assert "id: 42" in message
            assert "event: progress" in message
            payload = _payload(message)
            assert payload["event_type"] == "progress"
            assert payload["event"]["seq"] == 7
            assert payload["event"]["month"] == "2024-04"
        finally:
            await stream.aclose()

    asyncio.run(scenario())
    asyncio.run(broker.close())


def test_processing_event_server_journals_and_publishes_journal(
    tmp_path: Path,
) -> None:
    socket_dir = Path(tempfile.mkdtemp(prefix="je-", dir="/tmp"))
    socket_path = socket_dir / "events.sock"
    journal_path = tmp_path / "events.db"
    broker = EventBroker(
        {
            "processing": TopicSpec(
                interval=10.0,
                min_interval=0.0,
            )
        }
    )
    server = ProcessingEventServer(
        broker=broker,
        socket_path=socket_path,
        journal_path=journal_path,
    )

    async def scenario() -> None:
        await server.start()
        stream = broker.stream(["processing"])
        try:
            await stream.__anext__()
            reader, writer = await asyncio.open_unix_connection(
                str(socket_path)
            )
            event = {
                "version": 1,
                "seq": 11,
                "run_id": "run-1",
                "type": "archive_started",
                "month": "2024-04",
                "archive": "202404.rar",
                "stage": "filter",
            }
            writer.write((json.dumps(event) + "\n").encode("utf-8"))
            await writer.drain()
            message = await asyncio.wait_for(
                stream.__anext__(), timeout=1.0
            )
            payload = _payload(message)
            assert payload["event_type"] == "progress"
            assert payload["event"]["seq"] == 11
            writer.close()
            await writer.wait_closed()
            assert server.store is not None
            saved, complete = server.store.replay_after(0)
            assert complete is True
            assert saved[-1]["event"]["type"] == "archive_started"
            assert saved[-1]["event"]["month"] == "2024-04"
        finally:
            await stream.aclose()
            await server.stop()
            shutil.rmtree(socket_dir, ignore_errors=True)

    asyncio.run(scenario())
    asyncio.run(broker.close())


def test_processing_event_store_rejects_invalid_version(
    tmp_path: Path,
) -> None:
    store = ProcessingEventStore(tmp_path / "events.db")
    store.start()
    try:
        try:
            store.append(
                {
                    "version": 99,
                    "seq": 1,
                    "run_id": "run-1",
                    "type": "archive_started",
                }
            )
        except ValueError:
            pass
        else:
            raise AssertionError("invalid event version must be rejected")
    finally:
        store.close()


def test_event_publisher_falls_back_to_journal(
    tmp_path: Path, monkeypatch
) -> None:
    journal = tmp_path / "events.db"
    monkeypatch.setenv("JUDGMENT_EVENT_JOURNAL", str(journal))
    publisher = EventPublisher(tmp_path / "missing.sock")
    events: list[dict] = []
    try:
        publisher.emit(
            "run_started",
            run_id="fallback-run",
            status="running",
            message="後端離線時仍要保存",
        )
        for _ in range(100):
            if journal.exists():
                store = ProcessingEventStore(journal)
                store.start()
                events, _ = store.replay_after(0)
                store.close()
                if events:
                    break
            import time

            time.sleep(0.02)
        assert events
        assert events[-1]["event"]["type"] == "run_started"
        assert events[-1]["event"]["run_id"] == "fallback-run"
    finally:
        publisher.close()


def test_processing_event_store_migrates_legacy_jsonl(
    tmp_path: Path,
) -> None:
    legacy = tmp_path / "processing_events.jsonl"
    legacy.write_text(
        "\n".join(
            [
                json.dumps(
                    {
                        "seq": 1,
                        "run_id": "run-1",
                        "type": "archive_started",
                        "month": "2024-04",
                    }
                ),
                json.dumps(
                    {
                        "seq": 2,
                        "run_id": "run-1",
                        "type": "archive_completed",
                        "month": "2024-04",
                    }
                ),
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    store = ProcessingEventStore(
        tmp_path / "events.db",
        legacy_jsonl=legacy,
    )
    store.start()
    try:
        events, complete = store.replay_after(0)
        assert complete is True
        assert [item["event"]["seq"] for item in events] == [1, 2]
        assert not legacy.exists()
        assert legacy.with_name(legacy.name + ".migrated").exists()
    finally:
        store.close()


def test_processing_event_store_replays_after_last_id(
    tmp_path: Path,
) -> None:
    store = ProcessingEventStore(tmp_path / "events.db")
    store.start()
    try:
        first = store.append(
            {
                "seq": 1,
                "run_id": "run-1",
                "type": "archive_started",
                "month": "2024-04",
            }
        )
        second = store.append(
            {
                "seq": 2,
                "run_id": "run-1",
                "type": "archive_completed",
                "month": "2024-04",
            }
        )
        events, complete = store.replay_after(first)
        assert complete is True
        assert [item["event_id"] for item in events] == [second]
        assert events[0]["event"]["type"] == "archive_completed"
        assert store.latest_id() == second
    finally:
        store.close()


def test_event_broker_replays_progress_after_last_event_id(
    tmp_path: Path,
) -> None:
    store = ProcessingEventStore(tmp_path / "events.db")
    store.start()
    first = store.append(
        {
            "seq": 1,
            "run_id": "run-1",
            "type": "archive_started",
            "month": "2024-04",
        }
    )
    second = store.append(
        {
            "seq": 2,
            "run_id": "run-1",
            "type": "stage_progress",
            "month": "2024-04",
        }
    )
    broker = EventBroker(
        {
            "processing": TopicSpec(
                interval=10.0,
                min_interval=0.0,
                replay=lambda last_id: store.replay_after(last_id),
                latest_event_id=store.latest_id,
            )
        }
    )

    async def scenario() -> None:
        stream = broker.stream(["processing"], last_event_id=str(first))
        try:
            message = await asyncio.wait_for(
                stream.__anext__(), timeout=1.0
            )
            assert f"id: {second}" in message
            assert "event: progress" in message
            payload = _payload(message)
            assert payload["event"]["seq"] == 2
        finally:
            await stream.aclose()

    asyncio.run(scenario())
    asyncio.run(broker.close())
    store.close()


def test_processing_event_server_tails_shared_journal(
    tmp_path: Path,
) -> None:
    socket_dir = Path(tempfile.mkdtemp(prefix="je-", dir="/tmp"))
    socket_path = socket_dir / "events.sock"
    broker = EventBroker(
        {
            "processing": TopicSpec(
                interval=10.0,
                min_interval=0.0,
            )
        }
    )
    server = ProcessingEventServer(
        broker=broker,
        socket_path=socket_path,
        journal_path=tmp_path / "events.db",
    )

    async def scenario() -> None:
        await server.start()
        stream = broker.stream(["processing"])
        try:
            await stream.__anext__()
            assert server.store is not None
            server.store.append(
                {
                    "version": 1,
                    "seq": 1,
                    "run_id": "shared-run",
                    "type": "archive_started",
                    "month": "2024-04",
                }
            )
            message = await asyncio.wait_for(
                stream.__anext__(), timeout=1.0
            )
            assert "event: progress" in message
            payload = _payload(message)
            assert payload["event"]["run_id"] == "shared-run"
        finally:
            await stream.aclose()
            await server.stop()
            shutil.rmtree(socket_dir, ignore_errors=True)

    asyncio.run(scenario())
    asyncio.run(broker.close())


def test_event_publisher_sends_socket_json_line(tmp_path: Path) -> None:
    socket_dir = Path(tempfile.mkdtemp(prefix="je-", dir="/tmp"))
    socket_path = socket_dir / "publisher.sock"
    received: list[dict] = []

    async def handler(
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> None:
        line = await reader.readline()
        received.append(json.loads(line.decode("utf-8")))
        writer.close()
        await writer.wait_closed()

    async def scenario() -> None:
        server = await asyncio.start_unix_server(
            handler, path=str(socket_path)
        )
        publisher = EventPublisher(socket_path)
        try:
            publisher.emit(
                "archive_started",
                run_id="run-1",
                month="2024-04",
                archive="202404.rar",
                stage="filter",
                status="running",
                message="開始篩選",
                month_stages={"filter": "processing"},
                month_overall="processing",
            )
            for _ in range(100):
                if received:
                    break
                await asyncio.sleep(0.01)
            assert received
            assert received[0]["type"] == "archive_started"
            assert received[0]["month"] == "2024-04"
            assert received[0]["seq"] >= 1
        finally:
            publisher.close()
            server.close()
            await server.wait_closed()
            shutil.rmtree(socket_dir, ignore_errors=True)

    asyncio.run(scenario())


def _create_event_table(path: Path) -> None:
    conn = sqlite3.connect(path)
    conn.execute(
        """
        CREATE TABLE processing_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT NOT NULL DEFAULT '',
            seq INTEGER NOT NULL DEFAULT 0,
            type TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT '',
            payload TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def _insert_event(
    path: Path,
    run_id: str,
    seq: int,
    event_type: str,
    created_at: str = "",
) -> None:
    conn = sqlite3.connect(path)
    payload = json.dumps(
        {
            "version": 1,
            "run_id": run_id,
            "seq": seq,
            "type": event_type,
            "timestamp": created_at,
        }
    )
    conn.execute(
        "INSERT INTO processing_events "
        "(run_id, seq, type, created_at, payload) VALUES (?, ?, ?, ?, ?)",
        (run_id, seq, event_type, created_at, payload),
    )
    conn.commit()
    conn.close()


def test_processing_event_store_dedupes_identified_runs_only(
    tmp_path: Path,
) -> None:
    path = tmp_path / "events.db"
    _create_event_table(path)
    _insert_event(path, "run-1", 1, "archive_started", "2026-01-01")
    _insert_event(path, "run-1", 1, "archive_started", "2026-01-02")
    _insert_event(path, "", 1, "archive_started", "2026-01-03")
    _insert_event(path, "", 1, "archive_started", "2026-01-04")
    _insert_event(path, "run-2", 2, "archive_completed", "2026-01-05")

    store = ProcessingEventStore(path)
    store.start()
    try:
        rows = store.connection.execute(
            "SELECT run_id, seq, COUNT(*) FROM processing_events "
            "GROUP BY run_id, seq ORDER BY run_id, seq"
        ).fetchall()
        assert rows == [("", 1, 2), ("run-1", 1, 1), ("run-2", 2, 1)]
        index_sql = store.connection.execute(
            "SELECT sql FROM sqlite_master "
            "WHERE name = 'idx_processing_events_unique_run_seq'"
        ).fetchone()[0]
        assert "run_id <> ''" in " ".join(index_sql.split())

        event_id = store.append(
            {
                "version": 1,
                "run_id": "run-1",
                "seq": 1,
                "type": "archive_started",
            }
        )
        assert event_id == 2
        count = store.connection.execute(
            "SELECT COUNT(*) FROM processing_events"
        ).fetchone()[0]
        assert count == 4
        events, complete = store.replay_after(1)
        assert complete is True
        assert len(events) == 4
    finally:
        store.close()


def test_processing_event_store_close_waits_for_inflight_replay(
    tmp_path: Path,
    monkeypatch,
) -> None:
    path = tmp_path / "events.db"
    store = ProcessingEventStore(path)
    store.start()
    try:
        store.append(
            {
                "version": 1,
                "run_id": "run-1",
                "seq": 1,
                "type": "archive_started",
            }
        )
        original = store._replay_after_locked
        replay_started = threading.Event()
        replay_release = threading.Event()

        def blocked_replay(last_event_id: int, *, limit: int = 1000):
            replay_started.set()
            assert replay_release.wait(timeout=5)
            return original(last_event_id, limit=limit)

        monkeypatch.setattr(store, "_replay_after_locked", blocked_replay)
        close_started = threading.Event()

        def close_store() -> None:
            close_started.set()
            store.close()

        with ThreadPoolExecutor(max_workers=2) as pool:
            replay_future = pool.submit(store.replay_after, 0)
            assert replay_started.wait(timeout=5)
            close_future = pool.submit(close_store)
            assert close_started.wait(timeout=5)
            time.sleep(0.2)
            assert not close_future.done()
            replay_release.set()
            events, complete = replay_future.result(timeout=5)
            assert complete is True
            assert len(events) == 1
            close_future.result(timeout=5)

        assert store.latest_id() == 0
    finally:
        store.close()


def test_processing_event_store_rebuilds_old_unique_index_scope(
    tmp_path: Path,
) -> None:
    path = tmp_path / "events.db"
    _create_event_table(path)
    _insert_event(path, "run-1", 1, "archive_started")
    conn = sqlite3.connect(path)
    conn.execute(
        "CREATE UNIQUE INDEX idx_processing_events_unique_run_seq "
        "ON processing_events(run_id, seq) WHERE seq > 0"
    )
    conn.commit()
    conn.close()

    store = ProcessingEventStore(path)
    store.start()
    try:
        index_sql = store.connection.execute(
            "SELECT sql FROM sqlite_master "
            "WHERE name = 'idx_processing_events_unique_run_seq'"
        ).fetchone()[0]
        normalized = " ".join(index_sql.split())
        assert "run_id <> ''" in normalized
    finally:
        store.close()
