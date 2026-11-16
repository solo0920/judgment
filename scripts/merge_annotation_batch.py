#!/usr/bin/env python3
"""Merge a blind batch's annotations back to formal case IDs.

The title-precision batch uses opaque ``batch_id`` values.  This script joins
them with ``title_batch_analysis_key.jsonl``, restores the formal
``source_case_id``, validates the annotation combination, and writes JSONL
that can later be merged with the formal 365 annotations.

Usage:
    uv run python scripts/merge_annotation_batch.py \
      --annotations .run/fraud_relevance/batches/title_batch_filled.csv \
      --batch-key .run/fraud_relevance/batches/title_batch_analysis_key.jsonl \
      --output .run/fraud_relevance/batches/title_batch_verified.jsonl
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List

from judgment.fraud_annotation import validate_annotation


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def _read_annotations(path: Path) -> List[Dict[str, Any]]:
    if path.suffix.lower() == ".csv":
        with path.open(encoding="utf-8-sig", newline="") as handle:
            return list(csv.DictReader(handle))
    return _read_jsonl(path)


def _parse_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"true", "1", "yes", "y"}:
        return True
    if text in {"false", "0", "no", "n", ""}:
        return False
    raise ValueError(f"invalid boolean: {value!r}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--annotations", required=True)
    parser.add_argument("--batch-key", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    key = {
        str(row["batch_id"]): row
        for row in _read_jsonl(Path(args.batch_key))
    }
    annotations = _read_annotations(Path(args.annotations))
    merged_rows: List[Dict[str, Any]] = []
    seen = set()
    for raw in annotations:
        batch_id = str(raw.get("batch_id") or "").strip()
        if not batch_id:
            raise SystemExit("annotation row is missing batch_id")
        if batch_id not in key:
            raise SystemExit(f"unknown batch_id: {batch_id}")
        if batch_id in seen:
            raise SystemExit(f"duplicate annotation for {batch_id}")
        seen.add(batch_id)
        row = dict(key[batch_id])
        row.update(raw)
        row["case_id"] = str(row["source_case_id"])
        row["grade"] = int(row["grade"])
        row["fraud_conviction"] = _parse_bool(row["fraud_conviction"])
        row["confidence"] = float(row.get("confidence") or 1.0)
        row["annotation_version"] = "v2.0"
        merged_rows.append(validate_annotation(row))

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        for row in merged_rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(
        json.dumps(
            {
                "annotations": len(merged_rows),
                "output": str(output),
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
