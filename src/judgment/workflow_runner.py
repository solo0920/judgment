from __future__ import annotations

import argparse
import os
import signal
import subprocess
import time
from pathlib import Path

from .processing_state import ProcessingStateStore, default_state_path
from .workflows import workflow_definition

PARTIAL_EXIT_CODE = 3


def _finish(
    store: ProcessingStateStore,
    run_id: str,
    stage: str,
    started: float,
    *,
    status: str,
    message: str,
) -> None:
    store.finish_stage(
        run_id,
        stage,
        status=status,
        message=message,
        duration_ms=int((time.perf_counter() - started) * 1000),
    )
    store.finish_run(run_id, status=status, message=message)


def run_workflow(*, workflow_id: str, run_id: str) -> int:
    definition = workflow_definition(workflow_id)
    if definition is None:
        raise SystemExit(f"未知工作流程：{workflow_id}")
    root = Path(__file__).resolve().parents[2]
    if not (root / "pyproject.toml").is_file():
        root = Path.cwd()
    store = ProcessingStateStore(default_state_path())
    store.update_run(
        run_id,
        pid=os.getpid(),
        meta={
            "workflow": definition.id,
            "program": definition.program,
            "script": definition.script,
            "pid_pending": False,
        },
        message=f"已啟動 {definition.label}。",
    )
    started = time.perf_counter()
    store.start_stage(
        run_id,
        definition.stage,
        message=definition.description,
    )
    env = os.environ.copy()
    env["JUDGMENT_PROCESSING_STATE"] = str(default_state_path())
    env["JUDGMENT_PROCESSING_PARENT"] = run_id
    command = list(definition.command)
    if not command:
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="failed",
            message="工作流程沒有可執行命令。",
        )
        return 1
    try:
        process = subprocess.Popen(
            command,
            cwd=str(root),
            env=env,
            stdin=subprocess.DEVNULL,
        )
    except Exception as exc:
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="failed",
            message=(
                f"{definition.label}無法啟動：{exc.__class__.__name__}: {exc}"
            ),
        )
        return 1
    store.update_run(run_id, meta={"child_pid": process.pid})
    try:
        code = int(process.wait())
    except KeyboardInterrupt:
        try:
            process.send_signal(signal.SIGINT)
            process.wait(timeout=30)
        except Exception:
            try:
                process.kill()
            except OSError:
                pass
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="interrupted",
            message=f"{definition.label}已中止；下次執行會重新掃描可續跑的資料。",
        )
        return 130
    except Exception as exc:
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="failed",
            message=f"{definition.label}執行失敗：{exc.__class__.__name__}: {exc}",
        )
        return 1
    if code == 0:
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="success",
            message=f"{definition.label}完成。",
        )
        return 0
    if code == PARTIAL_EXIT_CODE:
        _finish(
            store,
            run_id,
            definition.stage,
            started,
            status="partial",
            message=(
                f"{definition.label}部分完成；進度已保留，"
                "下次執行會續傳。"
            ),
        )
        return 0
    _finish(
        store,
        run_id,
        definition.stage,
        started,
        status="failed",
        message=f"{definition.label}失敗（exit {code}）。",
    )
    return code or 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="執行單一資料處理工作流程")
    parser.add_argument("--workflow", required=True)
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args(argv)
    return run_workflow(workflow_id=args.workflow, run_id=args.run_id)


if __name__ == "__main__":
    raise SystemExit(main())
