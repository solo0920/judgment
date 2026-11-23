#!/usr/bin/env python3
"""Export human-triaged RAG feedback as agent-safe JSONL.

The export intentionally excludes the visitor's raw comment.  Only feedback
marked actionable, with a non-empty expected_behavior, and not resolved or
dismissed is included.  Holdout question-bank references are never emitted.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from judgment.config import Settings
from judgment.db import build_engine, build_session_factory
from judgment.web.feedback import export_agent_feedback, record_feedback_export


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=".run/rag-feedback-agent.jsonl",
        help="Output JSONL path (default: .run/rag-feedback-agent.jsonl)",
    )
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument(
        "--include-unready",
        action="store_true",
        help="Include feedback without actionable/expected_behavior (not for agents)",
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    engine = build_engine(settings.database_url)
    session_factory = build_session_factory(engine)
    try:
        rows = export_agent_feedback(
            session_factory,
            limit=args.limit,
            require_ready=not args.include_unready,
        )
        output = Path(args.output).expanduser()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(
            "".join(
                json.dumps(row, ensure_ascii=False, default=str) + "\n"
                for row in rows
            ),
            encoding="utf-8",
        )
        export_id = record_feedback_export(
            session_factory,
            settings,
            filters={"require_ready": not args.include_unready},
            feedback_ids=[int(row["feedback_id"]) for row in rows],
            format="jsonl",
        )
        print(
            json.dumps(
                {
                    "output": str(output),
                    "count": len(rows),
                    "export_id": export_id,
                    "contains_comment": False,
                    "require_ready": not args.include_unready,
                },
                ensure_ascii=False,
            )
        )
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
