#!/usr/bin/env python3
"""Build a compact term-document postings table from judgment full text.

The postings table is the alternative to a full-text GIN index:

    legal_term_evidence.legal_term_postings
        (jid, term_id, term, occurrences, court_normalized, jdate, title)

It is populated by one deterministic full/sample scan.  The table supports
exact term filtering, counts, court/year filters, and date ordering without
scanning the 25 GB judgment table.

Usage:
    uv run python scripts/legal_term_postings.py --limit 200000 --rebuild
    uv run python scripts/legal_term_postings.py --full --rebuild
    uv run python scripts/legal_term_postings.py --terms "違約交割,洗錢"
"""

from __future__ import annotations

import argparse
import csv
import json
import tempfile
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple

import psycopg

from judgment.config import Settings
from judgment.legal_term_matching import (
    build_variant_index,
    match_term_counts,
)
from judgment.legal_terms import LEGAL_TERMS, REGISTRY_TERMS, REGISTRY_VERSION
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    normalize_for_match,
)

POSTINGS_SCHEMA = "legal_term_evidence"
POSTINGS_TABLE = "legal_term_postings"
POSTINGS_FQN = f"{POSTINGS_SCHEMA}.{POSTINGS_TABLE}"
POSTINGS_TERM_INDEX = "legal_term_postings_term_date_idx"


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _select_terms(active_only: bool, raw_terms: str) -> Tuple[Any, ...]:
    if active_only and raw_terms:
        raise SystemExit("--active-only and --terms cannot be used together")
    if raw_terms:
        requested = {
            value.strip() for value in raw_terms.split(",") if value.strip()
        }
        selected = tuple(
            term for term in REGISTRY_TERMS if term.key in requested
        )
        missing = requested - {term.key for term in selected}
        if missing:
            raise SystemExit(
                "Unknown legal terms: " + ", ".join(sorted(missing))
            )
        return selected
    return LEGAL_TERMS if active_only else REGISTRY_TERMS


def _create_table(conn: psycopg.Connection, *, rebuild: bool) -> None:
    with conn.cursor() as cur:
        cur.execute(f"CREATE SCHEMA IF NOT EXISTS {POSTINGS_SCHEMA}")
        if rebuild:
            cur.execute(f"DROP TABLE IF EXISTS {POSTINGS_FQN} CASCADE")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {POSTINGS_FQN} (
                jid varchar(255) NOT NULL,
                term_id varchar(64) NOT NULL,
                term varchar(255) NOT NULL,
                occurrences integer NOT NULL CHECK (occurrences > 0),
                court_normalized text,
                jdate varchar(16),
                title text,
                PRIMARY KEY (jid, term_id)
            )
            """
        )
        cur.execute(f"SELECT count(*) FROM {POSTINGS_FQN}")
        count = int(cur.fetchone()[0])
    if count and not rebuild:
        raise SystemExit(
            f"{POSTINGS_FQN} already has {count:,} rows; use --rebuild."
        )


def _create_index(conn: psycopg.Connection) -> Dict[str, Any]:
    started = time.perf_counter()
    with conn.cursor() as cur:
        cur.execute(
            f"CREATE INDEX IF NOT EXISTS {POSTINGS_TERM_INDEX} "
            f"ON {POSTINGS_FQN} (term_id, jdate)"
        )
        cur.execute(f"ANALYZE {POSTINGS_FQN}")
    elapsed = time.perf_counter() - started
    with conn.cursor() as cur:
        cur.execute(
            "SELECT pg_relation_size(%s::regclass), "
            "pg_size_pretty(pg_relation_size(%s::regclass))",
            [f"{POSTINGS_SCHEMA}.{POSTINGS_TERM_INDEX}"] * 2,
        )
        size, pretty = cur.fetchone()
    return {
        "name": POSTINGS_TERM_INDEX,
        "build_seconds": round(elapsed, 2),
        "size_bytes": int(size or 0),
        "size_pretty": str(pretty or "0 bytes"),
    }


def _relation_size(
    conn: psycopg.Connection, relation: str
) -> Tuple[int, str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT pg_total_relation_size(%s::regclass), "
            "pg_size_pretty(pg_total_relation_size(%s::regclass))",
            [relation, relation],
        )
        size, pretty = cur.fetchone()
    return int(size or 0), str(pretty or "0 bytes")


def _scan_postings(
    conn: psycopg.Connection,
    *,
    terms: Sequence[Any],
    full: bool,
    limit: int,
) -> Dict[str, Any]:
    variant_to_term, closure, pattern = build_variant_index(terms)
    term_ids = {term.key: term.term_id for term in terms}
    with conn.cursor() as meta:
        meta.execute(
            "SELECT count(*) FROM judgment_documents WHERE is_current = true"
        )
        total_rows = int(meta.fetchone()[0] or 0)
    if full:
        step = 1
        target = total_rows
        sample_method = "full"
    else:
        target = min(max(1, int(limit)), total_rows)
        step = max(1, total_rows // target)
        sample_method = f"id_mod:{step}"

    where = "is_current = true"
    if not full:
        where += f" AND id % {step} = 0"

    scanned = 0
    docs_with_rows = 0
    rows_written = 0
    term_document_hits: Counter = Counter()
    started = time.perf_counter()
    sql = f"""
        SELECT jid, court_normalized, jdate, title, full_text
        FROM judgment_documents
        WHERE {where}
    """
    temp_file = tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        newline="",
        suffix=".csv",
        prefix="legal_term_postings_",
        delete=False,
    )
    temp_path = Path(temp_file.name)
    try:
        with conn.cursor(
            name="legal_term_postings_cursor"
        ) as read_cur:
            read_cur.itersize = 2000
            read_cur.execute(sql)
            writer = csv.writer(temp_file)
            for jid, court, jdate, title, full_text in read_cur:
                scanned += 1
                normalized = normalize_for_match(str(full_text or ""))
                matches = list(pattern.finditer(normalized))
                if matches:
                    counts: Counter = Counter()
                    for match in matches:
                        for canonical, count in match_term_counts(
                            match.group(0), variant_to_term, closure
                        ).items():
                            counts[canonical] += count
                    if counts:
                        docs_with_rows += 1
                        for canonical, occurrences in counts.items():
                            term_id = term_ids.get(canonical)
                            if not term_id:
                                continue
                            writer.writerow(
                                (
                                    str(jid or ""),
                                    term_id,
                                    canonical,
                                    int(occurrences),
                                    str(court or ""),
                                    str(jdate or ""),
                                    str(title or ""),
                                )
                            )
                            term_document_hits[canonical] += 1
                            rows_written += 1
                if scanned % 25_000 == 0:
                    elapsed = time.perf_counter() - started
                    print(
                        f"scanned={scanned:,} rows={rows_written:,} "
                        f"elapsed={elapsed:.1f}s",
                        flush=True,
                    )
        temp_file.close()

        copy_sql = (
            f"COPY {POSTINGS_FQN} "
            "(jid, term_id, term, occurrences, court_normalized, jdate, title) "
            "FROM STDIN WITH (FORMAT csv)"
        )
        with conn.cursor() as write_cur:
            with write_cur.copy(copy_sql) as copy:
                with temp_path.open("rb") as handle:
                    while True:
                        chunk = handle.read(1024 * 1024)
                        if not chunk:
                            break
                        copy.write(chunk)
        conn.commit()
    finally:
        if not temp_file.closed:
            temp_file.close()
        temp_path.unlink(missing_ok=True)
    elapsed = time.perf_counter() - started
    return {
        "sample_method": sample_method,
        "id_mod_step": step,
        "target_rows": target,
        "total_current_rows": total_rows,
        "scanned_rows": scanned,
        "documents_with_postings": docs_with_rows,
        "rows_written": rows_written,
        "terms_with_postings": len(term_document_hits),
        "term_document_hits": dict(
            term_document_hits.most_common()
        ),
        "elapsed_seconds": round(elapsed, 2),
        "rows_per_second": round(rows_written / elapsed, 2)
        if elapsed
        else 0.0,
        "sample_fraction": round(
            scanned / total_rows, 8
        )
        if total_rows
        else 0.0,
    }


def _validate_postings(
    conn: psycopg.Connection,
    *,
    terms: Sequence[Any],
    full: bool,
    limit: int,
    build_step: int,
    validate_limit: int,
) -> Dict[str, Any]:
    """Compare postings rows with a fresh normalized-text scan for a subset."""

    if validate_limit <= 0:
        return {"enabled": False}
    with conn.cursor() as meta:
        meta.execute(
            "SELECT count(*) FROM judgment_documents WHERE is_current = true"
        )
        total_rows = int(meta.fetchone()[0] or 0)
    if full:
        stride = max(1, total_rows // max(1, validate_limit))
    else:
        build_rows = max(1, total_rows // max(1, build_step))
        stride = max(1, build_rows // max(1, validate_limit))
    validation_step = max(1, build_step * stride)

    variant_to_term, closure, pattern = build_variant_index(terms)
    term_ids = {term.term_id: term.key for term in terms}
    term_id_by_key = {term.key: term.term_id for term in terms}
    expected: Dict[Tuple[str, str], int] = {}
    jids: List[str] = []
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT jid, full_text
            FROM judgment_documents
            WHERE is_current = true AND id %% {validation_step} = 0
            LIMIT %s
            """,
            [max(1, validate_limit)],
        )
        for jid, full_text in cur:
            jid_value = str(jid or "")
            jids.append(jid_value)
            normalized = normalize_for_match(str(full_text or ""))
            counts: Counter = Counter()
            for match in pattern.finditer(normalized):
                for canonical, count in match_term_counts(
                    match.group(0), variant_to_term, closure
                ).items():
                    counts[canonical] += count
            for canonical, occurrences in counts.items():
                term_id = term_id_by_key.get(canonical, "")
                if term_id:
                    expected[(jid_value, term_id)] = int(occurrences)

    actual: Dict[Tuple[str, str], int] = {}
    if jids:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT jid, term_id, occurrences
                FROM {POSTINGS_FQN}
                WHERE jid = ANY(%s)
                """,
                [jids],
            )
            for jid, term_id, occurrences in cur:
                actual[(str(jid), str(term_id))] = int(occurrences)

    keys = set(expected) | set(actual)
    mismatches = []
    for key in sorted(keys):
        if expected.get(key, 0) != actual.get(key, 0):
            mismatches.append(
                {
                    "jid": key[0],
                    "term_id": key[1],
                    "term": term_ids.get(key[1], ""),
                    "expected": expected.get(key, 0),
                    "actual": actual.get(key, 0),
                }
            )

    expected_by_term: Counter = Counter()
    actual_by_term: Counter = Counter()
    for _, term_id in expected:
        expected_by_term[term_id] += 1
    for _, term_id in actual:
        actual_by_term[term_id] += 1
    term_mismatches = []
    for term_id in sorted(set(expected_by_term) | set(actual_by_term)):
        if expected_by_term[term_id] != actual_by_term[term_id]:
            term_mismatches.append(
                {
                    "term_id": term_id,
                    "term": term_ids.get(term_id, ""),
                    "expected_documents": expected_by_term[term_id],
                    "actual_documents": actual_by_term[term_id],
                }
            )
    return {
        "enabled": True,
        "validation_step": validation_step,
        "checked_documents": len(jids),
        "checked_terms": len(set(expected_by_term) | set(actual_by_term)),
        "checked_postings": len(keys),
        "mismatch_count": len(mismatches),
        "term_level_mismatch_count": len(term_mismatches),
        "mismatches": mismatches[:20],
        "term_mismatches": term_mismatches[:20],
        "status": (
            "ok" if not mismatches and not term_mismatches else "mismatch"
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=200_000)
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--active-only", action="store_true")
    parser.add_argument("--terms", default="")
    parser.add_argument("--rebuild", action="store_true")
    parser.add_argument("--validate-limit", type=int, default=2_000)
    parser.add_argument(
        "--output", default=".run/legal_term_postings_report.json"
    )
    args = parser.parse_args()

    terms = _select_terms(args.active_only, args.terms)
    settings = Settings.from_env()
    dsn = _pg_dsn(settings.database_url)
    generated_at = datetime.now(timezone.utc).isoformat()
    snapshot_id = (
        "legal-term-postings-"
        + generated_at[:19].replace(":", "").replace("-", "")
        + f"-{REGISTRY_VERSION}"
    )

    with psycopg.connect(dsn) as conn:
        _create_table(conn, rebuild=args.rebuild)
        scan = _scan_postings(
            conn,
            terms=terms,
            full=args.full,
            limit=args.limit,
        )
        index = _create_index(conn)
        table_size, table_pretty = _relation_size(conn, POSTINGS_FQN)
        validation = _validate_postings(
            conn,
            terms=terms,
            full=args.full,
            limit=args.limit,
            build_step=int(scan["id_mod_step"]),
            validate_limit=args.validate_limit,
        )
        with conn.cursor() as cur:
            cur.execute(
                f"SELECT count(*), count(distinct term_id), "
                f"count(distinct jid) FROM {POSTINGS_FQN}"
            )
            rows, term_count, doc_count = cur.fetchone()

    fraction = float(scan["sample_fraction"] or 0.0)
    estimated_rows = (
        int(round(int(rows or 0) / fraction))
        if fraction > 0 and not args.full
        else int(rows or 0)
    )
    estimated_size = (
        int(round(table_size / fraction))
        if fraction > 0 and not args.full
        else table_size
    )
    report = {
        "version": "legal-term-postings-v1",
        "generated_at": generated_at,
        "evidence_snapshot_id": snapshot_id,
        "registry_version": REGISTRY_VERSION,
        "normalization_version": NORMALIZATION_VERSION,
        "matching_rule": "longest_exact_variant_with_containment_v1",
        "table": POSTINGS_FQN,
        "index": index,
        "sample": {
            "method": scan["sample_method"],
            "id_mod_step": scan["id_mod_step"],
            "target_rows": scan["target_rows"],
            "scanned_rows": scan["scanned_rows"],
            "total_current_rows": scan["total_current_rows"],
            "sample_fraction": scan["sample_fraction"],
            "is_full_scan": bool(args.full),
        },
        "rows": int(rows or 0),
        "terms_with_postings": int(term_count or 0),
        "documents_with_postings": int(doc_count or 0),
        "term_document_hits": scan["term_document_hits"],
        "elapsed_seconds": scan["elapsed_seconds"],
        "rows_per_second": scan["rows_per_second"],
        "table_size_bytes": table_size,
        "table_size_pretty": table_pretty,
        "estimated_full_rows": estimated_rows,
        "estimated_full_table_size_bytes": estimated_size,
        "validation": validation,
        "limitations": [
            "Postings are exact phrase matches, not substantive relevance.",
            "A sample build is not a complete corpus; use --full before production use.",
            "The table is derived data and can be rebuilt from judgment_documents.",
            "No formal GIN index was created on judgment_documents.",
            "Postings do not replace the court/year keyword_list abstain contract.",
        ],
        "note": (
            "The table is isolated in legal_term_evidence and is not used by "
            "RAG until a full build and a separate integration review."
        ),
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "output": str(output),
                "table": POSTINGS_FQN,
                "rows": int(rows or 0),
                "terms": int(term_count or 0),
                "documents": int(doc_count or 0),
                "scanned_rows": scan["scanned_rows"],
                "sample_fraction": scan["sample_fraction"],
                "estimated_full_rows": estimated_rows,
                "table_size": table_pretty,
                "index_size": index["size_pretty"],
                "validation": {
                    "status": validation.get("status"),
                    "checked_documents": validation.get("checked_documents"),
                    "checked_postings": validation.get("checked_postings"),
                    "mismatch_count": validation.get("mismatch_count"),
                },
                "elapsed_seconds": scan["elapsed_seconds"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
