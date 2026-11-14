from __future__ import annotations

import asyncio
import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Optional, Set, Tuple

from sqlalchemy import case, func, select

from ..models import (
    BenchmarkCaseResult,
    BenchmarkRun,
    DownloadUpdateRecord,
    PerformanceTestRun,
    PerformanceTestStep,
)
from ..processing_state import (
    ProcessingStateError,
    ProcessingStateStore,
    default_state_path,
    pid_alive,
)

Signature = Callable[[], Any]
_UNSET = object()


@dataclass(frozen=True)
class TopicSpec:
    """How a refresh topic is watched and pushed to subscribers."""

    interval: float = 1.0
    min_interval: float = 0.5
    periodic: Optional[float] = None
    signature: Optional[Signature] = None
    payload: Optional[Callable[[], Any]] = None
    initial_payload: Optional[Callable[[], Any]] = None
    warm_payload: Optional[Callable[[], Any]] = None
    replay: Optional[Callable[..., Any]] = None
    latest_event_id: Optional[Callable[[], int]] = None


def _stat_stamp(path: Path) -> Optional[Tuple[int, int]]:
    try:
        stat = path.stat()
    except OSError:
        return None
    return (int(stat.st_mtime_ns), int(stat.st_size))


def _database_updates_signature(session_factory) -> Any:
    if session_factory is None:
        return None
    with session_factory() as session:
        row = session.execute(
            select(
                func.count(DownloadUpdateRecord.id),
                func.max(DownloadUpdateRecord.id),
                func.max(DownloadUpdateRecord.checked_at),
                func.coalesce(
                    func.sum(
                        case(
                            (DownloadUpdateRecord.update_available.is_(True), 1),
                            else_=0,
                        )
                    ),
                    0,
                ),
            )
        ).one()
    return tuple(row)


def _database_test_runs_signature(session_factory) -> Any:
    if session_factory is None:
        return None
    with session_factory() as session:
        runs = session.execute(
            select(
                func.count(PerformanceTestRun.id),
                func.max(PerformanceTestRun.id),
                func.max(PerformanceTestRun.finished_at),
                func.coalesce(func.sum(PerformanceTestRun.progress), 0),
            )
        ).one()
        steps = session.execute(
            select(
                func.count(PerformanceTestStep.id),
                func.max(PerformanceTestStep.id),
                func.max(PerformanceTestStep.started_at),
                func.max(PerformanceTestStep.finished_at),
                func.coalesce(func.sum(PerformanceTestStep.progress), 0),
            )
        ).one()
    return tuple(runs) + tuple(steps)


def _database_benchmark_signature(session_factory) -> Any:
    if session_factory is None:
        return None
    with session_factory() as session:
        runs = session.execute(
            select(
                func.count(BenchmarkRun.id),
                func.max(BenchmarkRun.id),
                func.max(BenchmarkRun.updated_at),
                func.coalesce(func.sum(BenchmarkRun.progress), 0),
                func.coalesce(func.sum(BenchmarkRun.completed_cases), 0),
            )
        ).one()
        cases = session.execute(
            select(
                func.count(BenchmarkCaseResult.id),
                func.max(BenchmarkCaseResult.id),
                func.max(BenchmarkCaseResult.started_at),
                func.max(BenchmarkCaseResult.finished_at),
                func.coalesce(func.sum(BenchmarkCaseResult.duration_ms), 0),
            )
        ).one()
    return tuple(runs) + tuple(cases)


_PROCESSING_ACTIVE_CACHE: Dict[str, Any] = {
    "path": "",
    "stamp": None,
    "checked_at": 0.0,
    "active": False,
}


def _has_active_processing_run(state_path: Path) -> bool:
    """Return whether any run in the shared state is still alive."""

    stamp = _stat_stamp(state_path)
    now = time.monotonic()
    if (
        _PROCESSING_ACTIVE_CACHE.get("path") == str(state_path)
        and _PROCESSING_ACTIVE_CACHE.get("stamp") == stamp
        and now - float(_PROCESSING_ACTIVE_CACHE.get("checked_at") or 0)
        < 2.0
    ):
        return bool(_PROCESSING_ACTIVE_CACHE.get("active"))
    try:
        payload = ProcessingStateStore(state_path).read()
    except (ProcessingStateError, OSError):
        payload = {}
    active = any(
        isinstance(run, dict)
        and run.get("status") == "running"
        and pid_alive(run.get("pid"))
        for run in (payload.get("runs") or [])
    )
    _PROCESSING_ACTIVE_CACHE.update(
        {
            "path": str(state_path),
            "stamp": stamp,
            "checked_at": now,
            "active": active,
        }
    )
    return active


def _processing_signature(
    *,
    settings_provider: Callable[[], Any],
) -> Any:
    state_path = default_state_path()
    settings = settings_provider()
    raw_dir = (
        Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
    )
    # The active run changes the UI outline immediately, while elapsed times
    # and aggregate counters need a small periodic refresh.  Sending a tick
    # only while a processing run is alive keeps idle consoles completely
    # quiet.
    tick = int(time.time() // 2) if _has_active_processing_run(state_path) else 0
    return (
        str(state_path),
        _stat_stamp(state_path),
        _stat_stamp(raw_dir / "download_manifest.json"),
        _stat_stamp(raw_dir / "download_progress.json"),
        _stat_stamp(raw_dir),
        tick,
    )


def _judgment_download_signature(
    *,
    settings_provider: Callable[[], Any],
) -> Any:
    settings = settings_provider()
    raw_dir = (
        Path(settings.judgment_data_dir).expanduser().resolve() / "raw_rar"
    )
    return (
        str(raw_dir),
        _stat_stamp(raw_dir / "download_manifest.json"),
        _stat_stamp(raw_dir / "download_progress.json"),
        _stat_stamp(raw_dir),
    )


def build_event_broker(
    *,
    settings_provider: Callable[[], Any],
    session_factory_provider: Callable[[], Any],
    processing_snapshot_provider: Optional[Callable[[], Any]] = None,
    processing_bootstrap_provider: Optional[Callable[[], Any]] = None,
    processing_live_provider: Optional[Callable[[], Any]] = None,
    processing_replay_provider: Optional[Callable[..., Any]] = None,
    processing_latest_event_id_provider: Optional[Callable[[], int]] = None,
    updates_payload_provider: Optional[Callable[[], Any]] = None,
    status_payload_provider: Optional[Callable[[], Any]] = None,
    judgment_download_payload_provider: Optional[Callable[[], Any]] = None,
    system_usage_payload_provider: Optional[Callable[[], Any]] = None,
    ollama_payload_provider: Optional[Callable[[], Any]] = None,
    court_check_payload_provider: Optional[Callable[[], Any]] = None,
    law_version_payload_provider: Optional[Callable[[], Any]] = None,
    test_runs_payload_provider: Optional[Callable[[], Any]] = None,
    benchmark_payload_provider: Optional[Callable[[], Any]] = None,
) -> "EventBroker":
    """Build the site-wide refresh topic catalog for the web console."""

    specs: Dict[str, TopicSpec] = {
        "updates": TopicSpec(
            interval=1.0,
            min_interval=2.0,
            signature=lambda: _database_updates_signature(
                session_factory_provider()
            ),
            payload=updates_payload_provider,
        ),
        "processing": TopicSpec(
            interval=0.25,
            min_interval=0.5,
            signature=lambda: _processing_signature(
                settings_provider=settings_provider
            ),
            payload=processing_live_provider,
            initial_payload=(
                processing_bootstrap_provider or processing_snapshot_provider
            ),
            replay=processing_replay_provider,
            latest_event_id=processing_latest_event_id_provider,
        ),
        "judgment-download": TopicSpec(
            interval=0.5,
            min_interval=1.0,
            signature=lambda: _judgment_download_signature(
                settings_provider=settings_provider
            ),
            payload=judgment_download_payload_provider,
        ),
        "test-runs": TopicSpec(
            interval=0.75,
            min_interval=1.0,
            signature=lambda: _database_test_runs_signature(
                session_factory_provider()
            ),
            payload=test_runs_payload_provider,
        ),
        "benchmark": TopicSpec(
            interval=1.0,
            min_interval=2.0,
            signature=lambda: _database_benchmark_signature(
                session_factory_provider()
            ),
            payload=benchmark_payload_provider,
        ),
        # These values depend on external services or wall-clock state, so the
        # backend probes them on a schedule and pushes a refresh event.  The
        # browser never runs a fetch timer.
        "status": TopicSpec(
            interval=1.0,
            min_interval=30.0,
            periodic=30.0,
            payload=status_payload_provider,
        ),
        "system-usage": TopicSpec(
            interval=1.0,
            min_interval=30.0,
            periodic=30.0,
            payload=system_usage_payload_provider,
        ),
        "ollama": TopicSpec(
            interval=1.0,
            min_interval=30.0,
            periodic=30.0,
            payload=ollama_payload_provider,
        ),
        "court-check": TopicSpec(
            interval=1.0,
            min_interval=60.0,
            periodic=60.0,
            payload=court_check_payload_provider,
        ),
        "law-version-check": TopicSpec(
            interval=1.0,
            min_interval=60.0,
            periodic=60.0,
            payload=law_version_payload_provider,
        ),
    }
    return EventBroker(specs)


class EventBroker:
    """Broadcast refresh events to SSE subscribers.

    Watchers start lazily when the first browser subscribes to a topic and
    stop when the last subscriber disconnects.  The backend may inspect a
    state file or aggregate DB rows, but the browser receives only pushed
    events and never has to poll for data.
    """

    def __init__(self, specs: Dict[str, TopicSpec]) -> None:
        self._specs = dict(specs)
        self._subscribers: Dict[str, Set[asyncio.Queue]] = {
            topic: set() for topic in self._specs
        }
        self._watchers: Dict[str, asyncio.Task] = {}

    @property
    def topics(self) -> Tuple[str, ...]:
        return tuple(self._specs)

    def subscriber_count(self, topic: str) -> int:
        return len(self._subscribers.get(topic, ()))

    def _payload(
        self,
        topic: str,
        *,
        initial: bool = False,
        snapshot: Any = None,
        event_type: str = "",
        event_data: Any = None,
        event_id: int = 0,
    ) -> str:
        event_name = event_type or "refresh"
        data = {
            "topic": topic,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        if initial:
            data["initial"] = True
        if snapshot is not None:
            data["snapshot"] = snapshot
        if event_name != "refresh":
            data["event_type"] = event_name
            data["event"] = event_data
        id_line = f"id: {int(event_id)}\n" if event_id else ""
        return (
            f"{id_line}event: {event_name}\n"
            f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
        )

    def _publish(self, topic: str, snapshot: Any = None) -> None:
        payload = {
            "topic": topic,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        if snapshot is not None:
            payload["snapshot"] = snapshot
        for queue in list(self._subscribers.get(topic, ())):
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                # A slow client will receive the next change instead.
                continue

    def publish_event(
        self,
        topic: str,
        event_type: str,
        event_data: Any,
        *,
        event_id: int = 0,
    ) -> None:
        """Push one data event to every subscriber immediately."""
        payload = {
            "topic": topic,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "event": event_data,
        }
        if event_id:
            payload["event_id"] = int(event_id)
        for queue in list(self._subscribers.get(topic, ())):
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                # Slow client: skip this event and catch up from snapshot.
                continue

    def publish_snapshot(self, topic: str, snapshot: Any) -> None:
        """Broadcast a full snapshot as a refresh payload."""
        self._publish(topic, snapshot)

    def _subscribe(self, topic: str, queue: asyncio.Queue) -> None:
        self._subscribers[topic].add(queue)
        task = self._watchers.get(topic)
        if task is None or task.done():
            self._watchers[topic] = asyncio.create_task(
                self._watch(topic)
            )

    def _unsubscribe(self, topic: str, queue: asyncio.Queue) -> None:
        self._subscribers[topic].discard(queue)

    async def _watch(self, topic: str) -> None:
        spec = self._specs[topic]
        last: Any = _UNSET
        if spec.signature is not None:
            try:
                last = await asyncio.to_thread(spec.signature)
            except Exception:
                last = _UNSET
        next_periodic = (
            time.monotonic() + spec.periodic if spec.periodic else None
        )
        last_emit = 0.0
        try:
            while self._subscribers.get(topic):
                await asyncio.sleep(spec.interval)
                if not self._subscribers.get(topic):
                    break
                changed = False
                if spec.signature is not None:
                    try:
                        value = await asyncio.to_thread(spec.signature)
                    except Exception:
                        value = ("error",)
                    changed = last is _UNSET or value != last
                now = time.monotonic()
                periodic_due = bool(
                    next_periodic is not None and now >= next_periodic
                )
                if not changed and not periodic_due:
                    continue
                if now - last_emit < spec.min_interval:
                    # Keep the old signature so the change is not lost; the
                    # next loop retries once the minimum interval has passed.
                    continue
                if changed and spec.signature is not None:
                    last = value
                if periodic_due and spec.periodic:
                    next_periodic = now + spec.periodic
                last_emit = now
                snapshot = None
                if spec.payload is not None:
                    try:
                        snapshot = await asyncio.to_thread(spec.payload)
                    except Exception:
                        snapshot = None
                self._publish(topic, snapshot)
        finally:
            self._watchers.pop(topic, None)

    async def stream(
        self,
        topics: Iterable[str],
        last_event_id: Optional[str] = None,
    ) -> Any:
        selected: List[str] = []
        for topic in topics:
            if topic in self._specs and topic not in selected:
                selected.append(topic)
        if not selected:
            raise ValueError("no valid topics")
        last_id: Optional[int] = None
        if last_event_id is not None and str(last_event_id).strip().isdigit():
            last_id = int(str(last_event_id).strip())
        queue: asyncio.Queue = asyncio.Queue(maxsize=32)
        for topic in selected:
            self._subscribe(topic, queue)
        try:
            for topic in selected:
                spec = self._specs[topic]
                latest_id = 0
                if spec.latest_event_id is not None:
                    try:
                        latest_id = int(
                            await asyncio.to_thread(spec.latest_event_id) or 0
                        )
                    except Exception:
                        latest_id = 0
                if (
                    topic == "processing"
                    and last_id is not None
                    and spec.replay is not None
                ):
                    try:
                        events, complete = await asyncio.to_thread(
                            spec.replay, last_id
                        )
                    except Exception:
                        events, complete = [], False
                    if complete and last_id <= latest_id:
                        for item in events:
                            yield self._payload(
                                topic,
                                event_type="progress",
                                event_data=item.get("event"),
                                event_id=int(item.get("event_id") or 0),
                            )
                        continue
                provider = spec.initial_payload or spec.payload
                snapshot = None
                if provider is not None:
                    try:
                        snapshot = await asyncio.to_thread(provider)
                    except Exception:
                        snapshot = None
                yield self._payload(
                    topic,
                    initial=True,
                    snapshot=snapshot,
                    event_id=latest_id if topic == "processing" else 0,
                )
                if spec.warm_payload is not None:
                    try:
                        warm = await asyncio.to_thread(spec.warm_payload)
                    except Exception:
                        warm = None
                    if warm is not None:
                        yield self._payload(
                            topic,
                            snapshot=warm,
                            event_id=(
                                latest_id if topic == "processing" else 0
                            ),
                        )
            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15)
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
                    continue
                yield self._payload(
                    str(payload.get("topic") or ""),
                    snapshot=payload.get("snapshot"),
                    event_type=str(payload.get("event_type") or ""),
                    event_data=payload.get("event"),
                    event_id=int(payload.get("event_id") or 0),
                )
        finally:
            for topic in selected:
                self._unsubscribe(topic, queue)

    async def close(self) -> None:
        tasks = [task for task in self._watchers.values() if not task.done()]
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
        self._watchers.clear()
        self._subscribers.clear()


__all__ = ["EventBroker", "TopicSpec", "build_event_broker"]
