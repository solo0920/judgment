from __future__ import annotations

import asyncio
import math
import time
from collections import deque
from dataclasses import dataclass
from typing import Deque, Dict


class RagBusy(RuntimeError):
    """Raised when the RAG entry queue cannot meet the ETA limit."""

    def __init__(self, *, position: int, eta_s: float) -> None:
        self.position = max(1, int(position))
        self.eta_s = max(0.0, float(eta_s))
        super().__init__(
            f"RAG busy: position={self.position} eta={self.eta_s:.1f}s"
        )

    def to_dict(self) -> Dict[str, float]:
        return {
            "reason": "busy",
            "position": self.position,
            "eta_s": round(self.eta_s, 2),
        }


@dataclass(frozen=True)
class AdmissionTicket:
    position: int
    eta_s: float
    waited: bool
    admitted_at: float


class RagAdmission:
    """Process-wide async admission gate for the RAG stream endpoint.

    Requests are admitted up to ``max_concurrency``. Additional requests wait
    in a FIFO queue while their ETA is below ``eta_limit_seconds``; if the
    queue is full or the ETA is too high, ``RagBusy`` is raised immediately so
    the caller can return a clear busy/degraded response instead of making
    everyone wait.
    """

    def __init__(
        self,
        *,
        max_concurrency: int = 12,
        max_queue: int = 24,
        eta_limit_seconds: float = 5.0,
        initial_service_seconds: float = 2.0,
    ) -> None:
        self.max_concurrency = max(1, int(max_concurrency))
        self.max_queue = max(0, int(max_queue))
        self.eta_limit_seconds = max(0.0, float(eta_limit_seconds))
        self._service_ema = max(0.05, float(initial_service_seconds))
        self._active = 0
        self._waiters: Deque[asyncio.Future] = deque()
        self._lock = asyncio.Lock()
        self._admitted_total = 0
        self._queued_total = 0
        self._rejected_busy_total = 0
        self._completed_total = 0

    @property
    def snapshot(self) -> Dict[str, float]:
        return {
            "active": self._active,
            "waiters": len(self._waiters),
            "max_concurrency": self.max_concurrency,
            "max_queue": self.max_queue,
            "service_ema_s": round(self._service_ema, 3),
            "admitted_total": self._admitted_total,
            "queued_total": self._queued_total,
            "rejected_busy_total": self._rejected_busy_total,
            "completed_total": self._completed_total,
        }

    def _eta(self, position: int) -> float:
        waves = math.ceil(max(1, position) / self.max_concurrency)
        return waves * self._service_ema

    async def acquire(self) -> AdmissionTicket:
        async with self._lock:
            if (
                self._active < self.max_concurrency
                and not self._waiters
            ):
                self._active += 1
                self._admitted_total += 1
                return AdmissionTicket(
                    position=0,
                    eta_s=0.0,
                    waited=False,
                    admitted_at=time.perf_counter(),
                )
            position = len(self._waiters) + 1
            eta_s = self._eta(position)
            if (
                len(self._waiters) >= self.max_queue
                or eta_s > self.eta_limit_seconds
            ):
                self._rejected_busy_total += 1
                raise RagBusy(position=position, eta_s=eta_s)
            future = asyncio.get_running_loop().create_future()
            self._waiters.append(future)
            self._queued_total += 1
        try:
            await future
        except BaseException:
            async with self._lock:
                promoted = (
                    future.done()
                    and not future.cancelled()
                    and future.exception() is None
                )
                try:
                    self._waiters.remove(future)
                except ValueError:
                    pass
                if promoted:
                    self._active = max(0, self._active - 1)
                self._promote_locked()
            raise
        return AdmissionTicket(
            position=position,
            eta_s=eta_s,
            waited=True,
            admitted_at=time.perf_counter(),
        )

    async def release(self, *, elapsed_s: float) -> None:
        elapsed = max(0.0, float(elapsed_s))
        async with self._lock:
            self._active = max(0, self._active - 1)
            self._completed_total += 1
            # Exponential moving average of admitted service time. This keeps
            # the ETA tied to the current workload instead of a fixed guess.
            self._service_ema = (
                0.8 * self._service_ema + 0.2 * max(0.05, elapsed)
            )
            self._promote_locked()

    def _promote_locked(self) -> None:
        while (
            self._waiters
            and self._active < self.max_concurrency
        ):
            future = self._waiters.popleft()
            if future.done():
                continue
            self._active += 1
            self._admitted_total += 1
            future.set_result(True)
