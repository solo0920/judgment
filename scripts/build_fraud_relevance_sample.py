#!/usr/bin/env python3
"""Build the frozen v2.0 fraud-relevance annotation sample.

The primary frame is the 1,581 judgments that match the board/new Taipei
court and 2000-2010 filters, contain 詐欺/詐騙 in the normalized full text,
but whose title is not 詐欺/詐欺等.  A/B/C1 are annotated as a census; C2 is
a fixed-seed sample of 50.  Title-precision cases and pilot cases are kept
separate from the primary T estimate.

Usage:
    uv run python scripts/build_fraud_relevance_sample.py
    uv run python scripts/build_fraud_relevance_sample.py --phase2
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import platform
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Sequence

import psycopg

from judgment.config import Settings
from judgment.fraud_sampling import (
    assign_case_ids,
    jid_digest,
    manifest_payload,
    pilot_sample,
    sample_sorted,
    sort_by_jid,
)
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    SQL_NORMALIZE_EXPR,
)

COURTS = ["臺灣新北地方法院", "臺灣板橋地方法院"]
DATE_FROM = "20000101"
DATE_TO = "20101231"
TITLE_MATCHES = ["詐欺", "詐欺等"]
FRAUD_TERMS = ("詐欺", "詐騙")
ADJACENT_TERMS = ("詐術", "詐取")
SIGNAL_REGEX = "詐欺取財罪|詐欺得利罪|三人以上共同詐欺|幫助詐欺|常業詐欺"
HIGHLIGHT_TERMS = ["詐欺", "詐騙", "詐術", "詐取", "洗錢"]
NORMALIZED_TEXT = SQL_NORMALIZE_EXPR


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _base_sql() -> str:
    return """
        is_current = true
        AND court_normalized = ANY(%s)
        AND jdate BETWEEN %s AND %s
    """


def _row_to_item(row: Sequence[Any], *, with_signal: bool) -> Dict[str, Any]:
    if with_signal:
        jid, court, jdate, title, full_text, suffix, signal = row
    else:
        jid, court, jdate, title, full_text, suffix = row
        signal = False
    return {
        "jid": str(jid or ""),
        "court": str(court or ""),
        "jdate": str(jdate or ""),
        "title": str(title or ""),
        "full_text": str(full_text or ""),
        "suffix": str(suffix or ""),
        "criminal_signal": bool(signal),
    }


def _fetch_primary(cur: psycopg.Cursor) -> List[Dict[str, Any]]:
    sql = f"""
        SELECT jid, court_normalized, jdate, title,
               coalesce(full_text, '') AS full_text,
               right(split_part(jid, ',', 1), 1) AS suffix,
               ({NORMALIZED_TEXT} ~ %s) AS criminal_signal
        FROM judgment_documents
        WHERE {_base_sql()}
          AND ({NORMALIZED_TEXT} ~ '詐欺|詐騙')
          AND NOT (title = ANY(%s))
        ORDER BY jid
    """
    cur.execute(
        sql,
        [
            SIGNAL_REGEX,
            COURTS,
            DATE_FROM,
            DATE_TO,
            TITLE_MATCHES,
        ],
    )
    return [_row_to_item(row, with_signal=True) for row in cur.fetchall()]


def _fetch_title_matches(cur: psycopg.Cursor) -> List[Dict[str, Any]]:
    sql = f"""
        SELECT jid, court_normalized, jdate, title,
               coalesce(full_text, '') AS full_text,
               right(split_part(jid, ',', 1), 1) AS suffix
        FROM judgment_documents
        WHERE {_base_sql()}
          AND title = ANY(%s)
        ORDER BY jid
    """
    cur.execute(sql, [COURTS, DATE_FROM, DATE_TO, TITLE_MATCHES])
    return [_row_to_item(row, with_signal=False) for row in cur.fetchall()]


def _fetch_g1(cur: psycopg.Cursor) -> List[Dict[str, Any]]:
    sql = f"""
        SELECT jid, court_normalized, jdate, title,
               coalesce(full_text, '') AS full_text,
               right(split_part(jid, ',', 1), 1) AS suffix
        FROM judgment_documents
        WHERE {_base_sql()}
          AND NOT (title = ANY(%s))
          AND ({NORMALIZED_TEXT} ~ '詐術|詐取')
          AND NOT ({NORMALIZED_TEXT} ~ '詐欺|詐騙')
        ORDER BY jid
    """
    cur.execute(
        sql,
        [COURTS, DATE_FROM, DATE_TO, TITLE_MATCHES],
    )
    return [_row_to_item(row, with_signal=False) for row in cur.fetchall()]


def _fetch_g2(cur: psycopg.Cursor) -> List[Dict[str, Any]]:
    sql = f"""
        SELECT jid, court_normalized, jdate, title,
               coalesce(full_text, '') AS full_text,
               right(split_part(jid, ',', 1), 1) AS suffix
        FROM judgment_documents
        WHERE {_base_sql()}
          AND NOT (title = ANY(%s))
          AND right(split_part(jid, ',', 1), 1) = 'M'
          AND NOT ({NORMALIZED_TEXT} ~ '詐欺|詐騙|詐術|詐取')
        ORDER BY jid
    """
    cur.execute(
        sql,
        [COURTS, DATE_FROM, DATE_TO, TITLE_MATCHES],
    )
    return [_row_to_item(row, with_signal=False) for row in cur.fetchall()]


def _classify_primary(
    items: Sequence[Dict[str, Any]],
) -> Dict[str, List[Dict[str, Any]]]:
    strata: Dict[str, List[Dict[str, Any]]] = {
        "A": [],
        "B": [],
        "C1": [],
        "C2": [],
    }
    for item in items:
        suffix = item["suffix"]
        if suffix not in {"M", "V"}:
            raise ValueError(
                f"unknown JID suffix for {item['jid']}; refusing to force M/V"
            )
        if suffix == "M":
            key = "A" if item["criminal_signal"] else "B"
        else:
            key = "C1" if item["criminal_signal"] else "C2"
        strata[key].append(item)
    for key in strata:
        strata[key] = sort_by_jid(strata[key])
    return strata


def _tag(
    item: Dict[str, Any],
    *,
    stratum: str,
    source: str,
    is_pilot: bool = False,
) -> Dict[str, Any]:
    record = dict(item)
    record["sampling_stratum"] = stratum
    record["sample_source"] = source
    record["is_pilot"] = is_pilot
    return record


def _blind(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "case_id": item["case_id"],
        "text": item["full_text"],
        "highlight_terms": HIGHLIGHT_TERMS,
        "normalization_version": NORMALIZATION_VERSION,
    }


def _analysis_record(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "case_id": item["case_id"],
        "jid": item["jid"],
        "sampling_stratum": item["sampling_stratum"],
        "sample_source": item["sample_source"],
        "is_pilot": item["is_pilot"],
        "court": item["court"],
        "jdate": item["jdate"],
        "title": item["title"],
        "suffix": item["suffix"],
        "criminal_signal": item["criminal_signal"],
    }


def _write_jsonl(path: Path, items: Sequence[Dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for item in items:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")


def _write_template(path: Path, items: Sequence[Dict[str, Any]]) -> None:
    fieldnames = [
        "case_id",
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
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            writer.writerow(
                {
                    "case_id": item["case_id"],
                    "normalization_version": NORMALIZATION_VERSION,
                    "full_text_sha256": hashlib.sha256(
                        str(item.get("full_text") or "").encode("utf-8")
                    ).hexdigest(),
                }
            )


def _database_info(cur: psycopg.Cursor) -> Dict[str, Any]:
    cur.execute("SELECT current_database()")
    database = cur.fetchone()[0]
    cur.execute(
        """
        SELECT count(*), max(last_seen_snapshot_id)
        FROM judgment_documents
        WHERE is_current = true
        """
    )
    count, snapshot = cur.fetchone()
    return {
        "database": database,
        "current_documents": int(count or 0),
        "max_last_seen_snapshot_id": snapshot,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", default=".run/fraud_relevance")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--pilot-seed", type=int, default=43)
    parser.add_argument("--c2-sample", type=int, default=50)
    parser.add_argument("--title-sample", type=int, default=30)
    parser.add_argument("--phase2", action="store_true")
    parser.add_argument("--g2-sample", type=int, default=50)
    args = parser.parse_args()

    settings = Settings.from_env()
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    with psycopg.connect(_pg_dsn(settings.database_url)) as conn:
        with conn.cursor() as cur:
            database_info = _database_info(cur)
            primary = _fetch_primary(cur)
            title_matches = _fetch_title_matches(cur)
            strata = _classify_primary(primary)
            g1 = _fetch_g1(cur) if args.phase2 else []
            g2_population = _fetch_g2(cur) if args.phase2 else []

    expected = {"A": 158, "B": 75, "C1": 82, "C2": 1266}
    actual = {key: len(value) for key, value in strata.items()}
    if actual != expected:
        raise SystemExit(
            "primary strata do not match the frozen spec: "
            f"expected={expected}, actual={actual}. "
            "Create a new manifest version instead of overwriting v2.0."
        )
    if len(title_matches) != 210:
        raise SystemExit(
            f"title-match population is {len(title_matches)}, expected 210"
        )
    if args.phase2 and (len(g1) != 82 or len(g2_population) != 1901):
        raise SystemExit(
            "phase-2 populations do not match the frozen spec: "
            f"g1={len(g1)}, g2={len(g2_population)}; expected 82 and 1901"
        )
    if args.phase2:
        overlap = {item["jid"] for item in g1} & {
            item["jid"] for item in g2_population
        }
        if overlap:
            raise SystemExit(
                f"phase-2 strata overlap on {len(overlap)} JIDs; refusing"
            )

    c2_sample = sample_sorted(strata["C2"], args.c2_sample, seed=args.seed)
    title_sample = sample_sorted(
        title_matches, args.title_sample, seed=args.seed
    )
    pilot = pilot_sample(
        strata, {"A": 10, "B": 5, "C1": 5}, seed=args.pilot_seed
    )
    stratum_by_jid = {
        item["jid"]: key
        for key, items in strata.items()
        for item in items
    }

    primary_selected: Dict[str, List[Dict[str, Any]]] = {
        "A": [_tag(item, stratum="A", source="primary") for item in strata["A"]],
        "B": [_tag(item, stratum="B", source="primary") for item in strata["B"]],
        "C1": [_tag(item, stratum="C1", source="primary") for item in strata["C1"]],
        "C2": [
            _tag(item, stratum="C2", source="primary") for item in c2_sample
        ],
    }
    title_selected = [
        _tag(item, stratum="T", source="title_precision")
        for item in title_sample
    ]
    formal_items = []
    for key in ("A", "B", "C1", "C2"):
        formal_items.extend(primary_selected[key])
    formal_items.extend(title_selected)
    formal_queue = assign_case_ids(
        formal_items, seed=args.seed, prefix="case"
    )
    pilot_queue = assign_case_ids(
        [
            _tag(
                item,
                stratum=stratum_by_jid[item["jid"]],
                source="primary",
                is_pilot=True,
            )
            for item in pilot
        ],
        seed=args.pilot_seed,
        prefix="pilot",
    )

    selected = dict(primary_selected)
    selected["T"] = title_selected

    manifest = {
        "manifest_version": "v2.0",
        "annotation_version": "v2.0",
        "script_version": "v2.0",
        "normalization_version": NORMALIZATION_VERSION,
        "python_version": platform.python_version(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seed": args.seed,
        "pilot_seed": args.pilot_seed,
        "database": database_info,
        "frame": {
            "courts": COURTS,
            "date_from": DATE_FROM,
            "date_to": DATE_TO,
            "title_exclusions": TITLE_MATCHES,
            "fraud_terms": list(FRAUD_TERMS),
            "adjacent_terms": list(ADJACENT_TERMS),
            "criminal_signal_regex": SIGNAL_REGEX,
        },
        "counts": {
            "primary": len(primary),
            "strata": actual,
            "title_matches": len(title_matches),
            "formal_primary": sum(len(value) for value in primary_selected.values()),
            "formal_with_title_precision": len(formal_queue),
            "pilot": len(pilot_queue),
            "phase2_requested": args.phase2,
            "g1": len(g1),
            "g2_population": len(g2_population),
        },
        "sampling": manifest_payload(
            strata={**strata, "T": title_matches},
            selected=selected,
            title_sample=title_selected,
            pilot=pilot,
            seed=args.seed,
        ),
        "sql": {
            "base": _base_sql().strip(),
            "normalization": NORMALIZED_TEXT,
            "primary": (
                "normalized full_text ~ '詐欺|詐騙'; "
                "title NOT IN ('詐欺','詐欺等'); criminal_signal regex"
            ),
            "title": "title IN ('詐欺','詐欺等')",
            "g1": (
                "title NOT IN ('詐欺','詐欺等'); "
                "normalized full_text ~ '詐術|詐取'; "
                "NOT normalized full_text ~ '詐欺|詐騙'"
            ),
            "g2": (
                "title NOT IN ('詐欺','詐欺等'); JID suffix M; "
                "normalized full_text contains none of 詐欺/詐騙/詐術/詐取"
            ),
        },
    }

    manifest["sampling_sha256"] = hashlib.sha256(
        json.dumps(
            manifest["sampling"], sort_keys=True, ensure_ascii=False
        ).encode("utf-8")
    ).hexdigest()

    (output_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    _write_jsonl(
        output_dir / "formal_cases.jsonl",
        [_blind(item) for item in formal_queue],
    )
    _write_jsonl(
        output_dir / "pilot_cases.jsonl",
        [_blind(item) for item in pilot_queue],
    )
    _write_jsonl(
        output_dir / "analysis_key.jsonl",
        [_analysis_record(item) for item in formal_queue],
    )
    _write_jsonl(
        output_dir / "pilot_analysis_key.jsonl",
        [_analysis_record(item) for item in pilot_queue],
    )
    _write_template(output_dir / "annotation_template.csv", formal_queue)
    _write_template(output_dir / "pilot_template.csv", pilot_queue)

    if args.phase2:
        g1_selected = [
            _tag(item, stratum="G1", source="phase2") for item in sort_by_jid(g1)
        ]
        g2_selected = [
            _tag(item, stratum="G2", source="phase2")
            for item in sample_sorted(g2_population, args.g2_sample, seed=args.seed)
        ]
        gap_queue = assign_case_ids(
            g1_selected + g2_selected, seed=args.seed + 1, prefix="gap"
        )
        _write_jsonl(
            output_dir / "phase2_cases.jsonl",
            [_blind(item) for item in gap_queue],
        )
        _write_jsonl(
            output_dir / "phase2_analysis_key.jsonl",
            [_analysis_record(item) for item in gap_queue],
        )
        _write_template(output_dir / "phase2_template.csv", gap_queue)
        manifest["counts"]["g1_selected"] = len(g1_selected)
        manifest["counts"]["g2_selected"] = len(g2_selected)
        manifest["phase2"] = {
            "G1": {
                "population": len(g1),
                "jid_sha256": jid_digest(item["jid"] for item in g1),
                "selected": len(g1_selected),
                "jids": [item["jid"] for item in g1_selected],
            },
            "G2": {
                "population": len(g2_population),
                "jid_sha256": jid_digest(
                    item["jid"] for item in g2_population
                ),
                "selected": len(g2_selected),
                "jids": [item["jid"] for item in g2_selected],
            },
        }
        (output_dir / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    digest = jid_digest(item["jid"] for item in formal_queue)
    print(
        json.dumps(
            {
                "output_dir": str(output_dir),
                "strata": actual,
                "formal_primary": sum(
                    len(value) for value in primary_selected.values()
                ),
                "formal_queue": len(formal_queue),
                "pilot": len(pilot_queue),
                "title_sample": len(title_sample),
                "formal_jid_sha256": digest,
                "sampling_sha256": manifest["sampling_sha256"],
                "g1": len(g1),
                "g2_population": len(g2_population),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
