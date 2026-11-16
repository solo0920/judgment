#!/usr/bin/env python3
"""Validate formal annotations and compute T / Title-filter Coverage.

The input annotations may be the filled annotation_template.csv or a JSONL
file with one record per case.  Hidden fields (jid, stratum, source) are
joined from analysis_key.jsonl and are never accepted from the annotator.

Usage:
    uv run python scripts/fraud_relevance_report.py \
      --annotations .run/fraud_relevance/annotations.jsonl \
      --analysis-key .run/fraud_relevance/analysis_key.jsonl \
      --manifest .run/fraud_relevance/manifest.json \
      --output .run/fraud_relevance/report.json
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List

import psycopg

from judgment.config import Settings
from judgment.fraud_annotation import validate_annotation
from judgment.fraud_report import build_report
from judgment.text_normalization import NORMALIZATION_VERSION


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [
            json.loads(line)
            for line in handle
            if line.strip()
        ]


def _read_csv(path: Path) -> List[Dict[str, Any]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _parse_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"true", "1", "yes", "y"}:
        return True
    if text in {"false", "0", "no", "n", ""}:
        return False
    raise ValueError(f"invalid boolean: {value!r}")


def _normalise(record: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(record)
    if "grade" in result:
        result["grade"] = int(result["grade"])
    if "fraud_conviction" in result:
        result["fraud_conviction"] = _parse_bool(result["fraud_conviction"])
    if "confidence" in result:
        result["confidence"] = float(result["confidence"] or 1.0)
    return result


def _fetch_full_texts(jids: List[str]) -> Dict[str, str]:
    settings = Settings.from_env()
    dsn = settings.database_url.replace("postgresql+psycopg", "postgresql")
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT jid, full_text
                FROM judgment_documents
                WHERE is_current = true AND jid = ANY(%s)
                """,
                [jids],
            )
            return {
                str(jid): str(full_text or "")
                for jid, full_text in cur.fetchall()
            }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--annotations", required=True)
    parser.add_argument("--analysis-key", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", default="")
    parser.add_argument(
        "--verified-output",
        default="",
        help="write validated annotations with derived roles/offsets as JSONL",
    )
    parser.add_argument("--draws", type=int, default=10_000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--no-text-verify",
        action="store_true",
        help="skip raw full-text hash and evidence-offset verification",
    )
    args = parser.parse_args()

    annotation_path = Path(args.annotations)
    if annotation_path.suffix.lower() == ".csv":
        raw_annotations = _read_csv(annotation_path)
    else:
        raw_annotations = _read_jsonl(annotation_path)
    key_rows = _read_jsonl(Path(args.analysis_key))
    keys = {str(row["case_id"]): row for row in key_rows}
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    if manifest.get("normalization_version") not in (
        None,
        NORMALIZATION_VERSION,
    ):
        raise SystemExit(
            "manifest normalization_version is stale: "
            f"{manifest.get('normalization_version')}"
        )
    full_texts: Dict[str, str] = {}
    if not args.no_text_verify:
        full_texts = _fetch_full_texts(
            [str(key["jid"]) for key in keys.values()]
        )

    annotations: Dict[str, Dict[str, Any]] = {}
    for raw in raw_annotations:
        case_id = str(raw.get("case_id") or "").strip()
        if not case_id:
            raise SystemExit("annotation record is missing case_id")
        if case_id not in keys:
            raise SystemExit(f"unknown case_id in annotations: {case_id}")
        if case_id in annotations:
            raise SystemExit(f"duplicate annotation for {case_id}")
        key = keys[case_id]
        merged = dict(key)
        merged.update(_normalise(raw))
        merged["case_id"] = case_id
        merged["jid"] = key["jid"]
        merged["sampling_stratum"] = key["sampling_stratum"]
        merged["sample_source"] = key["sample_source"]
        merged["is_pilot"] = bool(key.get("is_pilot", False))
        if merged.get("normalization_version") not in (
            None,
            NORMALIZATION_VERSION,
        ):
            raise SystemExit(
                f"stale normalization_version for {case_id}: "
                f"{merged.get('normalization_version')}"
            )
        if not merged.get("full_text_sha256"):
            raise SystemExit(
                f"missing full_text_sha256 for {case_id}; regenerate template"
            )
        full_text = None
        if not args.no_text_verify:
            full_text = full_texts.get(str(key["jid"]))
            if full_text is None:
                raise SystemExit(
                    f"full text not found for {key['jid']}; "
                    "use --no-text-verify only for offline review"
                )
        annotations[case_id] = validate_annotation(
            merged, full_text=full_text
        )

    expected = {case_id for case_id, key in keys.items() if not key.get("is_pilot")}
    missing = expected - set(annotations)
    extra = set(annotations) - expected
    if missing:
        raise SystemExit(
            f"missing {len(missing)} formal annotations; first cases: "
            f"{sorted(missing)[:5]}"
        )
    if extra:
        raise SystemExit(f"unexpected annotation cases: {sorted(extra)[:5]}")

    if args.verified_output:
        verified_path = Path(args.verified_output)
        verified_path.parent.mkdir(parents=True, exist_ok=True)
        with verified_path.open("w", encoding="utf-8") as handle:
            for key in sorted(annotations):
                handle.write(
                    json.dumps(annotations[key], ensure_ascii=False) + "\n"
                )

    c2_population = int(manifest["counts"]["strata"]["C2"])
    title_hits = int(manifest["counts"]["title_matches"])
    report = build_report(
        [annotations[key] for key in sorted(annotations)],
        c2_population=c2_population,
        title_hits=title_hits,
        draws=args.draws,
        seed=args.seed,
    )
    report["manifest"] = {
        "manifest_version": manifest.get("manifest_version"),
        "sampling_sha256": manifest.get("sampling_sha256"),
        "created_at": manifest.get("created_at"),
    }
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        Path(args.output).write_text(payload + "\n", encoding="utf-8")
    print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
