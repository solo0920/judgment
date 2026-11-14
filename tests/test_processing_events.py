from __future__ import annotations

import asyncio
import json
import shutil
import tempfile
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
