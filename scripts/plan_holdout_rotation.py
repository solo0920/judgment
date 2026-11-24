#!/usr/bin/env python3
"""Create pending Holdout rotation proposals from benchmark evidence.

This script never applies a rotation.  An admin must review and apply each
proposal in the question-bank console.  The weekly/monthly cron entry only
refreshes proposals.
"""

from __future__ import annotations

import argparse
import json

from judgment.config import Settings
from judgment.db import (
    apply_statement_timeout,
    build_engine,
    build_session_factory,
)
from judgment.web.holdout_rotation import plan_holdout_rotation


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max-retirements", type=int, default=3)
    parser.add_argument("--min-holdout", type=int, default=20)
    args = parser.parse_args()

    settings = Settings.from_env()
    database_url = (
        settings.rag_holdout_rotation_database_url
        or settings.database_url
    )
    engine = build_engine(database_url)
    apply_statement_timeout(
        engine, settings.rag_quality_report_statement_timeout_ms
    )
    session_factory = build_session_factory(engine)
    try:
        result = plan_holdout_rotation(
            session_factory,
            actor="scheduler",
            max_retirements=args.max_retirements,
            min_holdout=args.min_holdout,
        )
        print(json.dumps(result, ensure_ascii=False, default=str))
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
