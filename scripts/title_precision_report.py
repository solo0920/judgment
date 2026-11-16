#!/usr/bin/env python3
"""Compute p_title_loose / p_title_strict from title-batch annotations.

The input can be raw title-batch annotations (with ``batch_id``) plus the
batch analysis key, or already-merged JSONL with ``case_id``.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List

from judgment.annotation_report import summarize_title_precision
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
    parser.add_argument(
        "--batch-key",
        default=".run/fraud_relevance/batches/title_batch_analysis_key.jsonl",
    )
    parser.add_argument(
        "--output", default=".run/fraud_relevance/title_precision_report.json"
    )
    parser.add_argument("--title-hits", type=int, default=210)
    args = parser.parse_args()

    key = {
        str(row["batch_id"]): row
        for row in _read_jsonl(Path(args.batch_key))
    }
    records: List[Dict[str, Any]] = []
    for raw in _read_annotations(Path(args.annotations)):
        batch_id = str(raw.get("batch_id") or "")
        if batch_id:
            if batch_id not in key:
                raise SystemExit(f"unknown batch_id: {batch_id}")
            row = dict(key[batch_id])
            row.update(raw)
            row["case_id"] = str(row["source_case_id"])
        else:
            row = dict(raw)
        row["grade"] = int(row["grade"])
        row["fraud_conviction"] = _parse_bool(row["fraud_conviction"])
        row["confidence"] = float(row.get("confidence") or 1.0)
        row["annotation_version"] = "v2.0"
        records.append(validate_annotation(row))

    summary = summarize_title_precision(
        records, title_hits=args.title_hits
    )
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
