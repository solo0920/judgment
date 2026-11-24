#!/usr/bin/env python3
"""Build the aggregate RAG quality report and deliver it to Slack or email.

Typical cron entry (Monday 09:00):

    0 9 * * 1 /path/to/judgment/scripts/run_quality_report.sh

The report contains aggregate counts and alerts only.  It never includes
visitor comments, review notes, prompts, paths, or hostnames.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from judgment.config import Settings
from judgment.db import (
    apply_statement_timeout,
    build_engine,
    build_session_factory,
)
from judgment.web.feedback import build_quality_report
from judgment.web.quality_notify import notify_quality_report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7)
    parser.add_argument(
        "--send",
        action="store_true",
        help="Actually deliver. Without this flag the script is dry-run.",
    )
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--only-alerts",
        action="store_true",
        help="Skip delivery when there is no warn/danger alert.",
    )
    parser.add_argument(
        "--alert-threshold",
        choices=("info", "warn", "danger"),
        default="warn",
    )
    parser.add_argument(
        "--channel",
        action="append",
        choices=("slack", "email"),
        default=[],
        help="Limit delivery to a channel (repeatable).",
    )
    parser.add_argument(
        "--output",
        default="",
        help="Optional Markdown output path.",
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    database_url = (
        settings.rag_quality_report_database_url or settings.database_url
    )
    engine = build_engine(database_url)
    apply_statement_timeout(
        engine, settings.rag_quality_report_statement_timeout_ms
    )
    session_factory = build_session_factory(engine)
    try:
        report = build_quality_report(
            session_factory, days=max(1, min(90, args.days))
        )
        if args.output:
            output = Path(args.output).expanduser()
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(report["markdown"], encoding="utf-8")
        result = notify_quality_report(
            report,
            settings,
            dry_run=args.dry_run or not args.send,
            only_alerts=args.only_alerts,
            alert_threshold=args.alert_threshold,
            channels=tuple(args.channel) or None,
        )
        print(
            json.dumps(
                {
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "days": report["period"]["days"],
                    "totals": report["totals"],
                    "alerts": len(report.get("alerts") or []),
                    "delivery": result,
                },
                ensure_ascii=False,
                default=str,
            )
        )
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
