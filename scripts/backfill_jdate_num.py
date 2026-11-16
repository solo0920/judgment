#!/usr/bin/env python3
"""Backfill judgment Qdrant payload fields used by structured filters.

Adds ``jdate_num`` (integer YYYYMMDD) and ``source_year`` (YYYY) to every
point that is missing them, then creates the payload indexes required by
the query parser.

Usage:
    uv run python scripts/backfill_jdate_num.py
    uv run python scripts/backfill_jdate_num.py --collection judgments_v003
    uv run python scripts/backfill_jdate_num.py --max-dates 10 --wait
    uv run python scripts/backfill_jdate_num.py --dry-run

The script is resumable: already-backfilled dates are skipped. Payload-only
updates do not touch vectors.
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from typing import Any, Dict, List, Optional

import httpx

from judgment.config import Settings


def _request(
    client: httpx.Client,
    method: str,
    path: str,
    *,
    json: Optional[Dict[str, Any]] = None,
    timeout: float = 300.0,
) -> Dict[str, Any]:
    response = client.request(method, path, json=json, timeout=timeout)
    response.raise_for_status()
    return response.json()


def _ensure_indexes(
    client: httpx.Client,
    collection: str,
) -> None:
    fields = (
        ("jdate", "keyword"),
        ("court", "keyword"),
        ("title", "keyword"),
        ("source_year", "keyword"),
        ("jid", "keyword"),
        ("jdate_num", "integer"),
    )
    for field, schema in fields:
        try:
            _request(
                client,
                "PUT",
                f"/collections/{collection}/index?wait=true",
                json={"field_name": field, "field_schema": schema},
            )
            print(f"index ok: {field} ({schema})")
        except httpx.HTTPStatusError as exc:
            text = exc.response.text[:200]
            if "already exists" in text.lower() or exc.response.status_code == 409:
                print(f"index exists: {field}")
            else:
                raise


def _missing_filter(date_value: str) -> Dict[str, Any]:
    return {
        "must": [
            {"key": "jdate", "match": {"value": date_value}},
        ],
        "min_should": {
            "conditions": [
                {"is_empty": {"key": "jdate_num"}},
                {"is_empty": {"key": "source_year"}},
            ],
            "min_count": 1,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Backfill jdate_num/source_year in a judgment Qdrant collection."
    )
    parser.add_argument("--collection", default="judgments_v003")
    parser.add_argument("--max-dates", type=int, default=0)
    parser.add_argument("--facet-limit", type=int, default=50000)
    parser.add_argument("--wait", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    url = os.getenv("QDRANT_URL", "").rstrip("/")
    key = os.getenv("QDRANT_API_KEY", "")
    if not url:
        settings = Settings.from_env()
        url = settings.qdrant_url.rstrip("/")
        key = settings.qdrant_api_key
    if not url:
        print("QDRANT_URL 未設定", file=sys.stderr)
        return 1

    headers = {"api-key": key} if key else {}
    with httpx.Client(base_url=url, headers=headers) as client:
        if not args.dry_run:
            _ensure_indexes(client, args.collection)

        missing = {"must": [{"is_empty": {"key": "jdate_num"}}]}
        facet = _request(
            client,
            "POST",
            f"/collections/{args.collection}/facet",
            json={
                "key": "jdate",
                "filter": missing,
                "limit": args.facet_limit,
                "exact": True,
            },
        )
        hits: List[Dict[str, Any]] = list(
            (facet.get("result") or {}).get("hits") or []
        )
        total_points = sum(int(hit.get("count") or 0) for hit in hits)
        initial_missing = total_points
        print(
            f"collection={args.collection} dates={len(hits)} "
            f"points={total_points:,} wait={args.wait} dry_run={args.dry_run}",
            flush=True,
        )
        if args.max_dates:
            hits = hits[: args.max_dates]
            print(f"限制本次處理 {len(hits)} 個日期")

        started = time.perf_counter()
        updated_dates = updated_points = 0
        for index, hit in enumerate(hits, 1):
            value = str(hit.get("value") or "")
            count = int(hit.get("count") or 0)
            if len(value) != 8 or not value.isdigit():
                print(f"skip invalid jdate: {value!r} ({count})")
                continue
            payload = {
                "jdate_num": int(value),
                "source_year": value[:4],
            }
            if args.dry_run:
                print(f"[dry-run] {value} {count} points {payload}")
                continue
            _request(
                client,
                "POST",
                f"/collections/{args.collection}/points/payload"
                f"?wait={'true' if args.wait else 'false'}",
                json={
                    "payload": payload,
                    "filter": _missing_filter(value),
                },
            )
            updated_dates += 1
            updated_points += count
            if index % 100 == 0 or index == len(hits):
                elapsed = max(0.001, time.perf_counter() - started)
                rate = updated_dates / elapsed
                eta = (len(hits) - index) / rate if rate else 0
                print(
                    f"{index}/{len(hits)} dates · {updated_points:,} points · "
                    f"{rate:.1f} dates/s · ETA {eta / 60:.1f} min",
                    flush=True,
                )

        if args.dry_run:
            return 0
        print(
            f"queued dates={updated_dates} points={updated_points:,}; "
            "waiting for jdate_num to drain",
            flush=True,
        )
        target_remaining = max(0, initial_missing - updated_points)
        for attempt in range(1200):
            count_payload = _request(
                client,
                "POST",
                f"/collections/{args.collection}/points/count",
                json={"exact": True, "filter": missing},
            )
            remaining = int(
                (count_payload.get("result") or {}).get("count") or 0
            )
            print(
                f"remaining jdate_num missing={remaining:,} "
                f"target<={target_remaining:,}",
                flush=True,
            )
            if remaining <= target_remaining:
                break
            time.sleep(1.0)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
