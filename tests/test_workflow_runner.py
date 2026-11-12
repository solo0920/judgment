from __future__ import annotations

from pathlib import Path

import pytest

from judgment import workflow_runner


class _Store:
    instances: list["_Store"] = []

    def __init__(self, path: Path) -> None:
        self.path = path
        self.events: list[tuple] = []
        _Store.instances.append(self)

    def update_run(self, run_id: str, **fields) -> None:
        self.events.append(("update_run", run_id, fields))

    def start_stage(self, run_id: str, stage: str, **fields) -> None:
        self.events.append(("start_stage", run_id, stage, fields))

    def finish_stage(self, run_id: str, stage: str, **fields) -> None:
        self.events.append(("finish_stage", run_id, stage, fields))

    def finish_run(self, run_id: str, **fields) -> None:
        self.events.append(("finish_run", run_id, fields))


class _Process:
    pid = 4321
    exit_code = 0

    def wait(self) -> int:
        return _Process.exit_code


@pytest.mark.parametrize(
    ("exit_code", "expected_status", "expected_return"),
    [
        (0, "success", 0),
        (workflow_runner.PARTIAL_EXIT_CODE, "partial", 0),
        (1, "failed", 1),
    ],
)
def test_exit_code_maps_to_workflow_status(
    tmp_path: Path,
    monkeypatch,
    exit_code: int,
    expected_status: str,
    expected_return: int,
) -> None:
    _Store.instances.clear()
    _Process.exit_code = exit_code
    monkeypatch.setattr(workflow_runner, "ProcessingStateStore", _Store)
    monkeypatch.setattr(
        workflow_runner,
        "default_state_path",
        lambda: tmp_path / "processing.json",
    )
    monkeypatch.setattr(
        workflow_runner.subprocess,
        "Popen",
        lambda *args, **kwargs: _Process(),
    )

    assert (
        workflow_runner.run_workflow(
            workflow_id="judgment_download", run_id="run-1"
        )
        == expected_return
    )
    finish = [
        event for event in _Store.instances[0].events if event[0] == "finish_run"
    ][-1]
    assert finish[2]["status"] == expected_status
    if expected_status == "partial":
        assert "續傳" in finish[2]["message"]
