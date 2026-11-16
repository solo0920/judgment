#!/usr/bin/env python3
"""Summarize the 20-case pilot and write the disagreement log.

Usage:
    uv run python scripts/pilot_report.py \
      --annotator-1 .run/fraud_relevance/annotations/pilot_annotator_1.jsonl \
      --annotator-2 .run/fraud_relevance/annotations/pilot_annotator_2.jsonl \
      --output .run/fraud_relevance/pilot_report.json \
      --disagreements .run/fraud_relevance/pilot_disagreement_log.csv
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List

from judgment.annotation_report import summarize_pilot
from judgment.fraud_annotation import validate_annotation


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def _annotations(
    path: Path, keys: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    rows = _read_jsonl(path)
    merged = []
    for row in rows:
        case_id = str(row.get("case_id") or "")
        key = keys.get(case_id)
        if key is None:
            raise SystemExit(f"unknown pilot case_id: {case_id}")
        record = dict(key)
        record.update(row)
        record["case_id"] = case_id
        merged.append(validate_annotation(record))
    return merged


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--annotator-1", required=True)
    parser.add_argument("--annotator-2", required=True)
    parser.add_argument(
        "--analysis-key",
        default=".run/fraud_relevance/pilot_analysis_key.jsonl",
    )
    parser.add_argument("--output", default=".run/fraud_relevance/pilot_report.json")
    parser.add_argument(
        "--disagreements",
        default=".run/fraud_relevance/pilot_disagreement_log.csv",
    )
    args = parser.parse_args()

    keys = {
        str(row["case_id"]): row
        for row in _read_jsonl(Path(args.analysis_key))
    }
    summary = summarize_pilot(
        _annotations(Path(args.annotator_1), keys),
        _annotations(Path(args.annotator_2), keys),
    )
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    disagreement_path = Path(args.disagreements)
    disagreement_path.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "case_id",
        "annotator_1_grade",
        "annotator_2_grade",
        "annotator_1_primary_offence",
        "annotator_2_primary_offence",
        "disagreement",
        "rule_question",
        "resolution",
    ]
    with disagreement_path.open(
        "w", encoding="utf-8", newline=""
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(summary["disagreements"])

    print(
        json.dumps(
            {
                "cases": summary["cases"],
                "disagreement_count": summary["disagreement_count"],
                "output": str(output),
                "disagreements": str(disagreement_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
