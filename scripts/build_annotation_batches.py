#!/usr/bin/env python3
"""Build blind annotation batches for pilot and title precision.

This script is read-only with respect to the frozen sampler outputs.  It
creates a mixed title-precision batch (30 title-precision cases + 20 formal
primary controls) so annotators cannot infer the source of an individual
case.  The analysis key stays separate.

Usage:
    uv run python scripts/build_annotation_batches.py
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from judgment.fraud_sampling import assign_case_ids, jid_digest, sample_sorted
from judgment.text_normalization import NORMALIZATION_VERSION


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def _write_jsonl(path: Path, items: List[Dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for item in items:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")


def _write_template(path: Path, items: List[Dict[str, Any]]) -> None:
    fields = [
        "batch_id",
        "grade",
        "primary_offence",
        "fraud_conviction",
        "evidence_section",
        "evidence_quote",
        "relevance_reason",
        "confidence",
        "notes",
        "normalization_version",
        "full_text_sha256",
    ]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for item in items:
            writer.writerow(
                {
                    "batch_id": item["batch_id"],
                    "normalization_version": NORMALIZATION_VERSION,
                    "full_text_sha256": hashlib.sha256(
                        item["text"].encode("utf-8")
                    ).hexdigest(),
                }
            )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", default=".run/fraud_relevance")
    parser.add_argument("--output-dir", default=".run/fraud_relevance/batches")
    parser.add_argument("--controls", type=int, default=20)
    parser.add_argument("--seed", type=int, default=44)
    parser.add_argument("--shuffle-seed", type=int, default=45)
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    formal_cases = {
        str(item["case_id"]): item
        for item in _read_jsonl(input_dir / "formal_cases.jsonl")
    }
    analysis = {
        str(item["case_id"]): item
        for item in _read_jsonl(input_dir / "analysis_key.jsonl")
    }
    pilot_analysis = _read_jsonl(input_dir / "pilot_analysis_key.jsonl")
    pilot_jids = {str(item["jid"]) for item in pilot_analysis}

    title_items: List[Dict[str, Any]] = []
    primary_items: List[Dict[str, Any]] = []
    for case_id, key in analysis.items():
        case = formal_cases.get(case_id)
        if case is None:
            continue
        item = {
            "jid": key["jid"],
            "source_case_id": case_id,
            "text": case["text"],
            "highlight_terms": case.get("highlight_terms") or [],
            "normalization_version": case.get(
                "normalization_version", NORMALIZATION_VERSION
            ),
            "sampling_stratum": key["sampling_stratum"],
            "sample_source": key["sample_source"],
            "is_pilot": bool(key.get("is_pilot", False)),
            "court": key.get("court", ""),
            "jdate": key.get("jdate", ""),
            "title": key.get("title", ""),
            "criminal_signal": bool(key.get("criminal_signal", False)),
        }
        if key["sample_source"] == "title_precision":
            title_items.append(item)
        elif key["sample_source"] == "primary" and key["jid"] not in pilot_jids:
            primary_items.append(item)

    if len(title_items) != 30:
        raise SystemExit(
            f"expected 30 title-precision cases, got {len(title_items)}"
        )
    controls = sample_sorted(primary_items, args.controls, seed=args.seed)
    combined = title_items + controls
    assigned = assign_case_ids(
        combined, seed=args.shuffle_seed, prefix="title"
    )

    batch_cases: List[Dict[str, Any]] = []
    batch_key: List[Dict[str, Any]] = []
    for item in assigned:
        batch_cases.append(
            {
                "batch_id": item["case_id"],
                "text": item["text"],
                "highlight_terms": item["highlight_terms"],
                "normalization_version": item["normalization_version"],
            }
        )
        batch_key.append(
            {
                "batch_id": item["case_id"],
                "source_case_id": item["source_case_id"],
                "jid": item["jid"],
                "sampling_stratum": item["sampling_stratum"],
                "sample_source": item["sample_source"],
                "is_pilot": item["is_pilot"],
                "court": item["court"],
                "jdate": item["jdate"],
                "title": item["title"],
                "criminal_signal": item["criminal_signal"],
                "batch": "title_precision_50",
            }
        )

    _write_jsonl(output_dir / "title_batch.jsonl", batch_cases)
    _write_jsonl(output_dir / "title_batch_analysis_key.jsonl", batch_key)
    _write_template(output_dir / "title_batch_template.csv", batch_cases)

    # Pilot packet is copied into the same folder for a single handoff.
    pilot_cases = _read_jsonl(input_dir / "pilot_cases.jsonl")
    _write_jsonl(output_dir / "pilot_batch.jsonl", pilot_cases)
    pilot_template = input_dir / "pilot_template.csv"
    if pilot_template.exists():
        (output_dir / "pilot_batch_template.csv").write_text(
            pilot_template.read_text(encoding="utf-8"),
            encoding="utf-8",
        )

    manifest = {
        "created_at": datetime.now(timezone.utc).isoformat(),
        "normalization_version": NORMALIZATION_VERSION,
        "seed": args.seed,
        "shuffle_seed": args.shuffle_seed,
        "title_precision_count": len(title_items),
        "control_count": len(controls),
        "title_batch_count": len(batch_cases),
        "pilot_count": len(pilot_cases),
        "title_jid_sha256": jid_digest(item["jid"] for item in title_items),
        "control_jid_sha256": jid_digest(item["jid"] for item in controls),
        "batch_jid_sha256": jid_digest(item["jid"] for item in assigned),
    }
    (output_dir / "batch_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
