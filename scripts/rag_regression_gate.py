#!/usr/bin/env python3
"""Evaluate the latest RAG benchmark against fixed regression thresholds."""

from __future__ import annotations

import argparse
import json
from typing import List, Optional

from sqlalchemy import select

from judgment.config import Settings
from judgment.db import build_engine, build_session_factory
from judgment.models import BenchmarkRun
from judgment.rag_gate import evaluate_regression_gate


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--run-id", default="", help="指定 benchmark run；預設取最新完成 run")
    parser.add_argument("--database-url", default="", help="覆寫 DATABASE_URL")
    parser.add_argument("--json", action="store_true", help="輸出完整 JSON")
    args = parser.parse_args(argv)

    settings = Settings.from_env()
    if args.database_url.strip():
        settings = settings.with_overrides(database_url=args.database_url.strip())
    engine = build_engine(settings.database_url)
    session_factory = build_session_factory(engine)
    try:
        with session_factory() as session:
            statement = select(BenchmarkRun).where(
                BenchmarkRun.status.in_(("success", "partial"))
            )
            if args.run_id.strip():
                statement = statement.where(BenchmarkRun.run_id == args.run_id.strip())
            else:
                statement = statement.order_by(BenchmarkRun.finished_at.desc()).limit(1)
            run = session.scalars(statement).first()
            if run is None:
                print(
                    json.dumps(
                        {"status": "no_data", "message": "找不到已完成的 benchmark run。"},
                        ensure_ascii=False,
                    )
                )
                return 2
            summary = dict(run.summary or {})
            gate = summary.get("gate") or evaluate_regression_gate(summary)
            payload = {
                "status": gate.get("status"),
                "run_id": run.run_id,
                "suite_id": run.suite_id,
                "finished_at": run.finished_at.isoformat()
                if run.finished_at
                else None,
                "summary": summary,
                "gate": gate,
            }
    finally:
        engine.dispose()

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print(f"run={payload['run_id']} gate={payload['status']}")
        for check in payload["gate"].get("checks") or []:
            print(
                f"  {check.get('status', '?'):7} {check.get('label') or check.get('key')}: "
                f"{check.get('message') or ''}"
            )
    return 0 if gate.get("status") in {"pass", "no_data"} else 1


if __name__ == "__main__":
    raise SystemExit(main())
