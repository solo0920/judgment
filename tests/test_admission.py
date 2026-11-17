from __future__ import annotations

import asyncio

import pytest

from judgment.admission import RagAdmission, RagBusy


def test_admission_rejects_when_eta_exceeds_limit() -> None:
    async def scenario() -> None:
        gate = RagAdmission(
            max_concurrency=1,
            max_queue=10,
            eta_limit_seconds=1.0,
            initial_service_seconds=2.0,
        )
        await gate.acquire()
        with pytest.raises(RagBusy) as exc:
            await gate.acquire()
        assert exc.value.position == 1
        assert exc.value.eta_s == 2.0
        assert gate.snapshot["admitted_total"] == 1
        assert gate.snapshot["rejected_busy_total"] == 1
        await gate.release(elapsed_s=0.1)
        assert gate.snapshot["completed_total"] == 1

    asyncio.run(scenario())


def test_admission_queues_and_promotes_in_order() -> None:
    async def scenario() -> None:
        gate = RagAdmission(
            max_concurrency=1,
            max_queue=2,
            eta_limit_seconds=10.0,
            initial_service_seconds=1.0,
        )
        await gate.acquire()
        order = []

        async def waiter(index: int) -> None:
            ticket = await gate.acquire()
            order.append((index, ticket.position, ticket.waited))
            await gate.release(elapsed_s=0.1)

        tasks = [
            asyncio.create_task(waiter(0)),
            asyncio.create_task(waiter(1)),
        ]
        await asyncio.sleep(0.05)
        assert gate.snapshot["active"] == 1
        assert gate.snapshot["waiters"] == 2

        await gate.release(elapsed_s=0.5)
        await asyncio.wait_for(asyncio.gather(*tasks), timeout=1.0)

        assert [item[0] for item in order] == [0, 1]
        assert [item[1] for item in order] == [1, 2]
        assert all(item[2] for item in order)
        assert gate.snapshot["active"] == 0
        assert gate.snapshot["waiters"] == 0
        assert gate.snapshot["admitted_total"] == 3
        assert gate.snapshot["queued_total"] == 2
        assert gate.snapshot["completed_total"] == 3

    asyncio.run(scenario())
