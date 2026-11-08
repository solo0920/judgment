#!/usr/bin/env python3
"""Report judgment vector index coverage and the number of rows left."""

from __future__ import annotations

import argparse
import json
import os
from typing import Any, Dict

from sqlalchemy import text

from judgment.config import Settings
from judgment.db import build_engine, build_session_factory

RATES = {1600: 7.7, 1200: 9.6, 1000: 10.9, 800: 12.5, 600: 15.0}


def index_counts() -> Dict[str, Any]:
    """Return indexed / total / remaining counts for the configured collection."""

    settings = Settings.from_env()
    engine = build_engine(settings.database_url)
    factory = build_session_factory(engine)
    try:
        with factory() as session:
            total = session.execute(
                text(
                    "SELECT count(*) FROM judgment_documents "
                    "WHERE full_text IS NOT NULL AND full_text <> ''"
                )
            ).scalar_one()
            indexed = session.execute(
                text(
                    "SELECT count(*) FROM judgment_documents d "
                    "JOIN judgment_vector_index v ON v.jid = d.jid "
                    "WHERE d.full_text IS NOT NULL AND d.full_text <> '' "
                    "AND v.collection = :collection AND v.model = :model "
                    "AND v.content_hash = d.content_hash"
                ),
                {
                    "collection": settings.judgment_vector_collection,
                    "model": settings.embedding_model,
                },
            ).scalar_one()
    finally:
        engine.dispose()

    indexed = int(indexed)
    total = int(total)
    max_chars = int(os.getenv("MAX_CHARS", "1600") or 1600)
    rate = RATES.get(max_chars, RATES[1600])
    remaining = max(0, total - indexed)
    return {
        "indexed": indexed,
        "total": total,
        "remaining": remaining,
        "coverage": round((100.0 * indexed / total) if total else 0.0, 2),
        "max_chars": max_chars,
        "estimated_points_per_second": rate,
        "estimated_seconds": round(remaining / rate, 1) if remaining else 0.0,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--json",
        action="store_true",
        help="輸出 JSON（含覆蓋率與時間估算）",
    )
    parser.add_argument(
        "--fields",
        action="store_true",
        help="只輸出 indexed total remaining 三個整數，供 shell 讀取",
    )
    args = parser.parse_args(argv)

    values = index_counts()
    if args.fields:
        print(f"{values['indexed']} {values['total']} {values['remaining']}")
        return 0
    if args.json:
        print(json.dumps(values, ensure_ascii=False))
        return 0

    coverage = float(values["coverage"])
    width = 28
    filled = int(round(width * coverage / 100.0))
    bar = "█" * filled + "░" * (width - filled)
    print(
        f"索引 [{bar}] {values['indexed']:,} / {values['total']:,}"
        f"（{coverage:.1f}%）"
    )
    print(f"剩餘 {values['remaining']:,} 筆")
    if values["remaining"]:
        seconds = float(values["estimated_seconds"])
        print(
            f"以 {values['max_chars']} 字、約 "
            f"{values['estimated_points_per_second']:.1f} 筆/秒估算，剩餘約 "
            f"{seconds / 3600:.1f} 小時（{seconds / 60:.0f} 分鐘）"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
