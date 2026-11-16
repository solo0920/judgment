#!/usr/bin/env python3
"""Benchmark pg_trgm GIN for exact legal-term retrieval.

This script is isolated from the formal retrieval pipeline.  It creates:

    schema legal_term_benchmark
    table  judgment_documents_bench
    index  judgment_documents_bench_trgm_idx

The table is a deterministic id-modulo sample of ``judgment_documents``.  The
index is created only in this benchmark schema; it is never created on the
production table and is not used by RAG.

Groups:
    A  LIKE '%term%' with no index (sequential scan baseline)
    B  GIN + pg_trgm on normalized_fulltext, LIKE
    C  GIN + LIKE + strpos exact verification

B/C are also run with ``enable_seqscan=off`` as diagnostics.  The default
planner run is the one used for the A/B/C comparison.

Usage:
    uv run python scripts/legal_term_trgm_benchmark.py
    uv run python scripts/legal_term_trgm_benchmark.py --rows 100000
    uv run python scripts/legal_term_trgm_benchmark.py \
      --terms "違約交割,洗錢,本票裁定"
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import statistics
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import psycopg

from judgment.config import Settings
from judgment.legal_terms import REGISTRY_TERMS
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    SQL_NORMALIZE_EXPR,
    normalize_for_match,
)

BENCH_SCHEMA = "legal_term_benchmark"
BENCH_TABLE = "judgment_documents_bench"
BENCH_INDEX = "judgment_documents_bench_trgm_idx"
BENCH_FQN = f"{BENCH_SCHEMA}.{BENCH_TABLE}"
BENCH_INDEX_FQN = f"{BENCH_SCHEMA}.{BENCH_INDEX}"
LENGTH_BUCKETS = ("2", "3", "4-5", "6-8", "9+")
PROBE_ID_BASE = 1_500_000_000
PROBE_ROWS = 1_000

MODE_DEFS = (
    # name, uses_index, force_index, exact_verification
    ("a_baseline", False, False, False),
    ("b_gin_like", True, False, False),
    ("b_gin_like_forced", True, True, False),
    ("c_gin_exact", True, False, True),
    ("c_gin_exact_forced", True, True, True),
)
PRIMARY_MODES = ("a_baseline", "b_gin_like", "c_gin_exact")


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _length_bucket(term: str) -> str:
    length = len(term)
    if length <= 2:
        return "2"
    if length == 3:
        return "3"
    if length <= 5:
        return "4-5"
    if length <= 8:
        return "6-8"
    return "9+"


def _percentile(values: Sequence[float], fraction: float) -> Optional[float]:
    if not values:
        return None
    ordered = sorted(values)
    if len(ordered) == 1:
        return round(ordered[0], 3)
    position = (len(ordered) - 1) * max(0.0, min(1.0, fraction))
    lower = int(math.floor(position))
    upper = int(math.ceil(position))
    if lower == upper:
        return round(ordered[lower], 3)
    weight = position - lower
    return round(
        ordered[lower] * (1.0 - weight) + ordered[upper] * weight, 3
    )


def _summarize_runs(runs: List[Dict[str, Any]]) -> Dict[str, Any]:
    execution = [float(run["execution_ms"]) for run in runs]
    p50 = _percentile(execution, 0.50)
    p95 = _percentile(execution, 0.95)
    planner_counts = Counter(str(run["planner"]) for run in runs)
    return {
        "runs": len(runs),
        "p50_ms": p50,
        "p95_ms": p95,
        "min_ms": round(min(execution), 3) if execution else None,
        "max_ms": round(max(execution), 3) if execution else None,
        "mean_ms": round(statistics.mean(execution), 3) if execution else None,
        "index_used_rate": (
            round(
                sum(1 for run in runs if run["index_used"]) / len(runs), 4
            )
            if runs
            else 0.0
        ),
        "planner_counts": dict(planner_counts),
        "matched_rows": (
            int(runs[0]["matched_rows"]) if runs else 0
        ),
        "index_scan_rows": (
            int(runs[0]["index_scan_rows"]) if runs else 0
        ),
        "representative_plan": runs[0]["plan"] if runs else None,
    }


def _walk_plan(node: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
    yield node
    for child in node.get("Plans") or []:
        yield from _walk_plan(child)


def _plan_payload(value: Any) -> Dict[str, Any]:
    payload = value
    if isinstance(payload, str):
        payload = json.loads(payload)
    if isinstance(payload, list):
        payload = payload[0]
    if not isinstance(payload, dict):
        raise RuntimeError("Unexpected EXPLAIN JSON shape")
    return payload


def _parse_plan(
    payload_value: Any,
    *,
    wall_ms: float,
    index_name: str,
) -> Dict[str, Any]:
    payload = _plan_payload(payload_value)
    root = payload.get("Plan") or {}
    nodes = list(_walk_plan(root))
    node_types = sorted({str(node.get("Node Type") or "") for node in nodes})
    index_used = any(
        str(node.get("Index Name") or "") == index_name for node in nodes
    )
    planner = "other"
    if "Bitmap Index Scan" in node_types:
        planner = "bitmap_index"
    elif "Index Scan" in node_types or "Index Only Scan" in node_types:
        planner = "index_scan"
    elif "Seq Scan" in node_types:
        planner = "seq_scan"

    scan_types = {"Seq Scan", "Bitmap Heap Scan", "Index Scan", "Index Only Scan"}
    scan_rows = [
        int(node.get("Actual Rows") or 0)
        for node in nodes
        if str(node.get("Node Type") or "") in scan_types
    ]
    index_rows = [
        int(node.get("Actual Rows") or 0)
        for node in nodes
        if str(node.get("Node Type") or "") == "Bitmap Index Scan"
    ]
    return {
        "execution_ms": round(float(payload.get("Execution Time") or 0.0), 3),
        "planning_ms": round(float(payload.get("Planning Time") or 0.0), 3),
        "wall_ms": round(wall_ms, 3),
        "index_used": bool(index_used),
        "planner": planner,
        "matched_rows": max(scan_rows) if scan_rows else 0,
        "index_scan_rows": max(index_rows) if index_rows else 0,
        "shared_hit_blocks": int(root.get("Shared Hit Blocks") or 0),
        "shared_read_blocks": int(root.get("Shared Read Blocks") or 0),
        "temp_read_blocks": int(root.get("Temp Read Blocks") or 0),
        "temp_written_blocks": int(root.get("Temp Written Blocks") or 0),
        "plan_nodes": node_types,
        "plan": root,
    }


def _table_rows(conn: psycopg.Connection, fqn: str) -> int:
    with conn.cursor() as cur:
        cur.execute(f"SELECT count(*) FROM {fqn}")
        return int(cur.fetchone()[0])


def _pretty_bytes(value: int) -> str:
    size = float(max(0, int(value)))
    for unit in ("bytes", "kB", "MB", "GB", "TB"):
        if size < 1024.0 or unit == "TB":
            return f"{size:.0f} {unit}" if unit == "bytes" else f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"


def _relation_size(
    conn: psycopg.Connection, relation: str
) -> Tuple[int, str]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT pg_relation_size(%s::regclass), "
            "pg_size_pretty(pg_relation_size(%s::regclass))",
            [relation, relation],
        )
        size, pretty = cur.fetchone()
        return int(size or 0), str(pretty or "0 bytes")


def _create_table(conn: psycopg.Connection, target_rows: int) -> Dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(f"CREATE SCHEMA IF NOT EXISTS {BENCH_SCHEMA}")
        cur.execute(
            f"""
            CREATE TABLE IF NOT EXISTS {BENCH_FQN} (
                id integer PRIMARY KEY,
                jid varchar(255) NOT NULL,
                court_normalized text,
                jdate varchar(16),
                title text,
                normalized_fulltext text NOT NULL
            )
            """
        )
        cur.execute(
            "SELECT count(*), max(id) FROM judgment_documents "
            "WHERE is_current = true AND full_text IS NOT NULL"
        )
        total_rows, _ = cur.fetchone()
        total_rows = int(total_rows or 0)
        step = max(1, total_rows // max(1, target_rows))
        started = time.perf_counter()
        cur.execute(
            f"""
            INSERT INTO {BENCH_FQN}
                (id, jid, court_normalized, jdate, title, normalized_fulltext)
            SELECT id, jid, court_normalized, jdate, title,
                   {SQL_NORMALIZE_EXPR}
            FROM judgment_documents
            WHERE is_current = true
              AND full_text IS NOT NULL
              AND jid IS NOT NULL
              AND id % {step} = 0
            """
        )
        elapsed = time.perf_counter() - started
        cur.execute(f"ANALYZE {BENCH_FQN}")
        cur.execute(f"SELECT count(*) FROM {BENCH_FQN}")
        rows = int(cur.fetchone()[0])
    return {
        "reused": False,
        "target_rows": target_rows,
        "rows": rows,
        "total_current_rows": total_rows,
        "sample_method": f"id_mod:{step}",
        "build_seconds": round(elapsed, 2),
    }


def _ensure_table(
    conn: psycopg.Connection, target_rows: int, rebuild: bool
) -> Dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT to_regclass(%s)",
            [BENCH_FQN],
        )
        exists = cur.fetchone()[0] is not None
    if exists and rebuild:
        with conn.cursor() as cur:
            cur.execute(f"DROP TABLE IF EXISTS {BENCH_FQN} CASCADE")
        exists = False
    if exists:
        rows = _table_rows(conn, BENCH_FQN)
        if rows > 0:
            return {
                "reused": True,
                "target_rows": target_rows,
                "rows": rows,
                "sample_method": "existing_table",
                "build_seconds": None,
            }
        with conn.cursor() as cur:
            cur.execute(f"DROP TABLE IF EXISTS {BENCH_FQN} CASCADE")
    return _create_table(conn, target_rows)


def _ensure_extension(conn: psycopg.Connection) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT extversion FROM pg_extension WHERE extname = 'pg_trgm'")
        row = cur.fetchone()
        if row:
            return str(row[0])
        cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
        cur.execute("SELECT extversion FROM pg_extension WHERE extname = 'pg_trgm'")
        return str(cur.fetchone()[0])


def _index_exists(conn: psycopg.Connection) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT to_regclass(%s)", [BENCH_INDEX_FQN])
        return cur.fetchone()[0] is not None


def _drop_index(conn: psycopg.Connection) -> None:
    with conn.cursor() as cur:
        cur.execute(f"DROP INDEX IF EXISTS {BENCH_INDEX_FQN}")


def _create_index(conn: psycopg.Connection) -> Dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute("SET maintenance_work_mem = '512MB'")
        cur.execute("SHOW maintenance_work_mem")
        maintenance_work_mem = str(cur.fetchone()[0])
        started = time.perf_counter()
        cur.execute(
            f"CREATE INDEX {BENCH_INDEX} ON {BENCH_FQN} "
            "USING GIN (normalized_fulltext gin_trgm_ops)"
        )
        elapsed = time.perf_counter() - started
        cur.execute(f"ANALYZE {BENCH_FQN}")
        cur.execute(
            "SELECT indexdef FROM pg_indexes "
            "WHERE schemaname = %s AND indexname = %s",
            [BENCH_SCHEMA, BENCH_INDEX],
        )
        definition = str(cur.fetchone()[0])
    size, pretty = _relation_size(conn, BENCH_INDEX_FQN)
    return {
        "reused": False,
        "build_seconds": round(elapsed, 2),
        "size_bytes": size,
        "size_pretty": pretty,
        "definition": definition,
        "maintenance_work_mem": maintenance_work_mem,
    }


def _normalization_consistency(
    conn: psycopg.Connection, sample_size: int = 20
) -> Dict[str, Any]:
    mismatches: List[Dict[str, Any]] = []
    checked = 0
    with conn.cursor() as cur:
        cur.execute(
            f"""
            SELECT id, full_text, {SQL_NORMALIZE_EXPR} AS normalized
            FROM judgment_documents
            WHERE is_current = true AND full_text IS NOT NULL
            ORDER BY id
            LIMIT %s
            """,
            [sample_size],
        )
        for row_id, full_text, sql_normalized in cur:
            checked += 1
            python_normalized = normalize_for_match(str(full_text or ""))
            if python_normalized != str(sql_normalized or ""):
                mismatches.append(
                    {
                        "id": int(row_id),
                        "python_length": len(python_normalized),
                        "sql_length": len(str(sql_normalized or "")),
                    }
                )
    return {
        "normalization_version": NORMALIZATION_VERSION,
        "sql_expression": SQL_NORMALIZE_EXPR,
        "checked_rows": checked,
        "mismatches": len(mismatches),
        "examples": mismatches[:5],
    }


def _load_evidence(path: Path) -> Dict[str, Dict[str, Any]]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("terms") or {}


def _select_terms(
    *,
    explicit: str,
    evidence: Dict[str, Dict[str, Any]],
    per_bucket: int,
    max_terms: int,
) -> Tuple[List[Any], List[Dict[str, Any]]]:
    by_key = {term.key: term for term in REGISTRY_TERMS}
    if explicit:
        requested = [
            value.strip() for value in explicit.split(",") if value.strip()
        ]
        missing = [value for value in requested if value not in by_key]
        if missing:
            raise SystemExit(
                "Unknown legal terms: " + ", ".join(sorted(missing))
            )
        selected = [by_key[value] for value in requested]
        metadata = [
            {
                "term": term.key,
                "term_id": term.term_id,
                "active": term.active,
                "category": term.legal_concept_category,
                "length_bucket": _length_bucket(term.key),
                "evidence_df": int(
                    (evidence.get(term.key) or {}).get("document_frequency")
                    or 0
                ),
                "estimated_full_corpus_df": int(
                    (evidence.get(term.key) or {}).get(
                        "estimated_full_corpus_df"
                    )
                    or 0
                ),
                "selected_by": "explicit",
            }
            for term in selected
        ]
        return selected[:max_terms], metadata[:max_terms]

    selected: Dict[str, Any] = {}
    metadata_by_term: Dict[str, Dict[str, Any]] = {}

    # Active terms are always included, even when the sample has no hit.
    for term in REGISTRY_TERMS:
        item = evidence.get(term.key) or {}
        if term.active:
            selected[term.key] = term
            metadata_by_term[term.key] = {
                "term": term.key,
                "term_id": term.term_id,
                "active": term.active,
                "category": term.legal_concept_category,
                "length_bucket": _length_bucket(term.key),
                "evidence_df": int(item.get("document_frequency") or 0),
                "estimated_full_corpus_df": int(
                    item.get("estimated_full_corpus_df") or 0
                ),
                "selected_by": "active",
            }

    by_bucket: Dict[str, List[Any]] = defaultdict(list)
    for term in REGISTRY_TERMS:
        item = evidence.get(term.key) or {}
        if int(item.get("document_frequency") or 0) <= 0:
            continue
        by_bucket[_length_bucket(term.key)].append(term)

    for bucket in LENGTH_BUCKETS:
        candidates = sorted(
            by_bucket.get(bucket, []),
            key=lambda term: (
                -int(
                    (evidence.get(term.key) or {}).get(
                        "estimated_full_corpus_df"
                    )
                    or 0
                ),
                term.key,
            ),
        )
        picked = 0
        for term in candidates:
            if picked >= max(1, per_bucket):
                break
            if term.key in selected:
                continue
            item = evidence.get(term.key) or {}
            selected[term.key] = term
            metadata_by_term[term.key] = {
                "term": term.key,
                "term_id": term.term_id,
                "active": term.active,
                "category": term.legal_concept_category,
                "length_bucket": _length_bucket(term.key),
                "evidence_df": int(item.get("document_frequency") or 0),
                "estimated_full_corpus_df": int(
                    item.get("estimated_full_corpus_df") or 0
                ),
                "selected_by": f"bucket:{bucket}",
            }
            picked += 1

    # Ensure every length bucket is represented even when the sample has no
    # hit for that length.  This tests index behavior for short and very long
    # phrases, not just the terms with the most documents.
    for bucket in LENGTH_BUCKETS:
        if any(
            _length_bucket(term.key) == bucket
            for term in selected.values()
        ):
            continue
        fallback = next(
            (
                term
                for term in REGISTRY_TERMS
                if _length_bucket(term.key) == bucket
            ),
            None,
        )
        if fallback is not None:
            selected[fallback.key] = fallback
            item = evidence.get(fallback.key) or {}
            metadata_by_term[fallback.key] = {
                "term": fallback.key,
                "term_id": fallback.term_id,
                "active": fallback.active,
                "category": fallback.legal_concept_category,
                "length_bucket": bucket,
                "evidence_df": int(item.get("document_frequency") or 0),
                "estimated_full_corpus_df": int(
                    item.get("estimated_full_corpus_df") or 0
                ),
                "selected_by": f"fallback:{bucket}",
            }

    order = {bucket: index for index, bucket in enumerate(LENGTH_BUCKETS)}
    terms = sorted(
        selected.values(),
        key=lambda term: (
            order.get(_length_bucket(term.key), 99),
            -int(
                (evidence.get(term.key) or {}).get(
                    "estimated_full_corpus_df"
                )
                or 0
            ),
            term.key,
        ),
    )
    if len(terms) > max_terms:
        # Keep at least one term per bucket, then fill by rank.
        kept = []
        for bucket in LENGTH_BUCKETS:
            first = next(
                (
                    term
                    for term in terms
                    if _length_bucket(term.key) == bucket
                ),
                None,
            )
            if first is not None:
                kept.append(first)
        for term in terms:
            if len(kept) >= max_terms:
                break
            if term not in kept:
                kept.append(term)
        terms = kept
    metadata = [
        metadata_by_term[term.key]
        for term in terms
        if term.key in metadata_by_term
    ]
    return terms, metadata


def _mode_query(
    *,
    term: str,
    exact_verification: bool,
) -> Tuple[str, List[Any]]:
    pattern = f"%{term}%"
    sql = (
        f"SELECT count(*) FROM {BENCH_FQN} "
        "WHERE normalized_fulltext LIKE %s"
    )
    params: List[Any] = [pattern]
    if exact_verification:
        sql += " AND strpos(normalized_fulltext, %s) > 0"
        params.append(term)
    return sql, params


def _run_mode(
    conn: psycopg.Connection,
    *,
    term: str,
    exact_verification: bool,
    force_index: bool,
    repetitions: int,
    include_plan: bool,
) -> Dict[str, Any]:
    sql, params = _mode_query(
        term=term,
        exact_verification=exact_verification,
    )
    explain_sql = (
        "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) " + sql
    )
    runs: List[Dict[str, Any]] = []
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute("SET LOCAL statement_timeout = '300s'")
            cur.execute(
                "SET LOCAL enable_seqscan = "
                + ("off" if force_index else "on")
            )
            # Warm cache/planning once; discard the result.
            cur.execute(explain_sql, params)
            cur.fetchone()
            for index in range(max(0, repetitions)):
                started = time.perf_counter()
                cur.execute(explain_sql, params)
                payload = cur.fetchone()[0]
                wall_ms = (time.perf_counter() - started) * 1000.0
                parsed = _parse_plan(
                    payload,
                    wall_ms=wall_ms,
                    index_name=BENCH_INDEX,
                )
                if not include_plan and index > 0:
                    parsed["plan"] = None
                runs.append(parsed)
    summary = _summarize_runs(runs)
    if not include_plan:
        summary["representative_plan"] = None
    return summary


def _aggregate_modes(
    term_results: List[Dict[str, Any]],
) -> Dict[str, Any]:
    by_mode: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for result in term_results:
        for mode, stats in result["modes"].items():
            by_mode[mode].append(stats)
    aggregate: Dict[str, Any] = {}
    for mode in [definition[0] for definition in MODE_DEFS]:
        stats_list = by_mode.get(mode, [])
        p50s = [
            float(stats["p50_ms"])
            for stats in stats_list
            if stats.get("p50_ms") is not None
        ]
        p95s = [
            float(stats["p95_ms"])
            for stats in stats_list
            if stats.get("p95_ms") is not None
        ]
        planner_counts: Counter = Counter()
        for stats in stats_list:
            planner_counts.update(stats.get("planner_counts") or {})
        aggregate[mode] = {
            "terms": len(stats_list),
            "p50_ms_median": (
                round(statistics.median(p50s), 3) if p50s else None
            ),
            "p95_ms_median": (
                round(statistics.median(p95s), 3) if p95s else None
            ),
            "p50_ms_mean": (
                round(statistics.mean(p50s), 3) if p50s else None
            ),
            "index_usage_rate": (
                round(
                    sum(
                        float(stats.get("index_used_rate") or 0.0)
                        for stats in stats_list
                    )
                    / len(stats_list),
                    4,
                )
                if stats_list
                else 0.0
            ),
            "planner_counts": dict(planner_counts),
        }
    return aggregate


def _aggregate_buckets(
    term_results: List[Dict[str, Any]],
) -> Dict[str, Any]:
    by_bucket: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for result in term_results:
        by_bucket[result["length_bucket"]].append(result)
    output: Dict[str, Any] = {}
    for bucket in LENGTH_BUCKETS:
        results = by_bucket.get(bucket, [])
        bucket_modes: Dict[str, Any] = {}
        for mode in [definition[0] for definition in MODE_DEFS]:
            p50s = [
                float(result["modes"][mode]["p50_ms"])
                for result in results
                if result["modes"].get(mode)
                and result["modes"][mode].get("p50_ms") is not None
            ]
            bucket_modes[mode] = {
                "terms": len(p50s),
                "p50_ms_median": (
                    round(statistics.median(p50s), 3) if p50s else None
                ),
            }
        output[bucket] = bucket_modes
    return output


def _comparisons(term_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    speedups_b: List[float] = []
    speedups_c: List[float] = []
    speedups_b_with_hits: List[float] = []
    speedups_c_with_hits: List[float] = []
    verification_overhead: List[float] = []
    seq_scan_terms: List[str] = []
    forced_seq_scan_terms: List[str] = []
    forced_slower_terms: List[str] = []
    for result in term_results:
        modes = result["modes"]
        a = modes.get("a_baseline") or {}
        b = modes.get("b_gin_like") or {}
        c = modes.get("c_gin_exact") or {}
        forced_b = modes.get("b_gin_like_forced") or {}
        has_hits = int((a.get("matched_rows") or 0)) > 0
        if a.get("p50_ms") and b.get("p50_ms"):
            speedup = float(a["p50_ms"]) / float(b["p50_ms"])
            speedups_b.append(speedup)
            if has_hits:
                speedups_b_with_hits.append(speedup)
        if a.get("p50_ms") and c.get("p50_ms"):
            speedup = float(a["p50_ms"]) / float(c["p50_ms"])
            speedups_c.append(speedup)
            if has_hits:
                speedups_c_with_hits.append(speedup)
        if b.get("p50_ms") and c.get("p50_ms"):
            verification_overhead.append(
                float(c["p50_ms"]) - float(b["p50_ms"])
            )
        if b.get("planner_counts", {}).get("seq_scan"):
            seq_scan_terms.append(result["term"])
        if forced_b.get("planner_counts", {}).get("seq_scan"):
            forced_seq_scan_terms.append(result["term"])
        if (
            forced_b.get("p50_ms")
            and b.get("p50_ms")
            and float(forced_b["p50_ms"]) > float(b["p50_ms"])
        ):
            forced_slower_terms.append(result["term"])
    return {
        "terms_with_hits": sum(
            1
            for result in term_results
            if int(
                (result["modes"].get("a_baseline") or {}).get(
                    "matched_rows"
                )
                or 0
            )
            > 0
        ),
        "b_vs_a_p50_speedup_median_all": (
            round(statistics.median(speedups_b), 3) if speedups_b else None
        ),
        "b_vs_a_p50_speedup_median_terms_with_hits": (
            round(statistics.median(speedups_b_with_hits), 3)
            if speedups_b_with_hits
            else None
        ),
        "c_vs_a_p50_speedup_median_all": (
            round(statistics.median(speedups_c), 3) if speedups_c else None
        ),
        "c_vs_a_p50_speedup_median_terms_with_hits": (
            round(statistics.median(speedups_c_with_hits), 3)
            if speedups_c_with_hits
            else None
        ),
        "c_minus_b_p50_ms_median": (
            round(statistics.median(verification_overhead), 3)
            if verification_overhead
            else None
        ),
        "terms_default_planner_seq_scan_b": seq_scan_terms,
        "terms_forced_seq_scan_b": forced_seq_scan_terms,
        "terms_forced_b_slower_than_default": forced_slower_terms,
    }


def _maintenance_probe(
    conn: psycopg.Connection,
    *,
    enabled: bool,
) -> Dict[str, Any]:
    if not enabled:
        return {"enabled": False}
    before_size, before_pretty = _relation_size(conn, BENCH_INDEX_FQN)
    table_size_before, table_pretty_before = _relation_size(
        conn, BENCH_FQN
    )
    with conn.cursor() as cur:
        cur.execute(
            f"DELETE FROM {BENCH_FQN} WHERE id >= %s",
            [PROBE_ID_BASE],
        )
    started = time.perf_counter()
    with conn.cursor() as cur:
        cur.execute(
            f"""
            INSERT INTO {BENCH_FQN}
                (id, jid, court_normalized, jdate, title, normalized_fulltext)
            SELECT %s + g,
                   'BENCH-legal-term-' || g::text,
                   'benchmark',
                   '20260101',
                   'benchmark',
                   repeat('違約交割benchmark測試', 20)
            FROM generate_series(1, %s) AS g
            """,
            [PROBE_ID_BASE, PROBE_ROWS],
        )
    insert_ms = (time.perf_counter() - started) * 1000.0

    started = time.perf_counter()
    with conn.cursor() as cur:
        cur.execute(
            f"UPDATE {BENCH_FQN} "
            "SET normalized_fulltext = normalized_fulltext || '更新測試' "
            "WHERE id >= %s",
            [PROBE_ID_BASE],
        )
    update_ms = (time.perf_counter() - started) * 1000.0

    started = time.perf_counter()
    with conn.cursor() as cur:
        cur.execute(
            f"DELETE FROM {BENCH_FQN} WHERE id >= %s",
            [PROBE_ID_BASE],
        )
    delete_ms = (time.perf_counter() - started) * 1000.0

    started = time.perf_counter()
    with conn.cursor() as cur:
        cur.execute(f"VACUUM (ANALYZE) {BENCH_FQN}")
    vacuum_ms = (time.perf_counter() - started) * 1000.0

    after_size, after_pretty = _relation_size(conn, BENCH_INDEX_FQN)
    table_size_after, table_pretty_after = _relation_size(conn, BENCH_FQN)
    return {
        "enabled": True,
        "probe_rows": PROBE_ROWS,
        "insert_ms": round(insert_ms, 2),
        "update_ms": round(update_ms, 2),
        "delete_ms": round(delete_ms, 2),
        "vacuum_analyze_ms": round(vacuum_ms, 2),
        "index_size_before_bytes": before_size,
        "index_size_before_pretty": before_pretty,
        "index_size_after_bytes": after_size,
        "index_size_after_pretty": after_pretty,
        "index_size_delta_bytes": after_size - before_size,
        "table_size_before_bytes": table_size_before,
        "table_size_before_pretty": table_pretty_before,
        "table_size_after_bytes": table_size_after,
        "table_size_after_pretty": table_pretty_after,
        "note": (
            "With-index maintenance probe on the benchmark table only. "
            "The delete/vacuum may leave reusable index space; this measures "
            "cost, not a formal production write path."
        ),
    }


def _database_info(conn: psycopg.Connection) -> Dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute("SELECT version()")
        version = str(cur.fetchone()[0])
        cur.execute(
            "SELECT current_setting('shared_buffers'), "
            "current_setting('work_mem'), "
            "current_setting('maintenance_work_mem'), "
            "current_setting('max_parallel_maintenance_workers')"
        )
        settings = cur.fetchone()
    return {
        "version": version,
        "shared_buffers": str(settings[0]),
        "work_mem": str(settings[1]),
        "maintenance_work_mem_session_start": str(settings[2]),
        "max_parallel_maintenance_workers": str(settings[3]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rows", type=int, default=200_000)
    parser.add_argument("--rebuild", action="store_true")
    parser.add_argument("--rebuild-index", action="store_true")
    parser.add_argument("--skip-a", action="store_true")
    parser.add_argument("--repetitions", type=int, default=3)
    parser.add_argument("--per-bucket", type=int, default=3)
    parser.add_argument("--max-terms", type=int, default=30)
    parser.add_argument("--terms", default="")
    parser.add_argument(
        "--evidence", default=".run/legal_term_evidence.json"
    )
    parser.add_argument("--maintenance", action="store_true", default=True)
    parser.add_argument(
        "--no-maintenance",
        action="store_false",
        dest="maintenance",
    )
    parser.add_argument("--include-plans", action="store_true", default=True)
    parser.add_argument(
        "--no-include-plans",
        action="store_false",
        dest="include_plans",
    )
    parser.add_argument(
        "--output", default=".run/pg_trgm-benchmark-report.json"
    )
    parser.add_argument(
        "--csv-output", default=".run/pg_trgm-benchmark-report.csv"
    )
    parser.add_argument("--cleanup", action="store_true")
    args = parser.parse_args()

    settings = Settings.from_env()
    dsn = _pg_dsn(settings.database_url)
    evidence = _load_evidence(Path(args.evidence))
    terms, term_metadata = _select_terms(
        explicit=args.terms,
        evidence=evidence,
        per_bucket=args.per_bucket,
        max_terms=args.max_terms,
    )
    if not terms:
        raise SystemExit(
            "No benchmark terms selected. Run legal_term_evidence.py first "
            "or pass --terms."
        )

    started = time.perf_counter()
    with psycopg.connect(dsn, autocommit=True) as conn:
        db_info = _database_info(conn)
        trgm_version = _ensure_extension(conn)
        table_build = _ensure_table(
            conn, target_rows=max(1, args.rows), rebuild=args.rebuild
        )
        normalization = _normalization_consistency(conn)
        if table_build["reused"]:
            table_size, table_pretty = _relation_size(conn, BENCH_FQN)
            table_build["table_size_bytes"] = table_size
            table_build["table_size_pretty"] = table_pretty

        index_existed = _index_exists(conn)
        if not args.skip_a:
            if index_existed:
                _drop_index(conn)
            index_existed = False

        term_results: List[Dict[str, Any]] = []
        for term in terms:
            results: Dict[str, Any] = {}
            if not args.skip_a:
                results["a_baseline"] = _run_mode(
                    conn,
                    term=term.key,
                    exact_verification=False,
                    force_index=False,
                    repetitions=args.repetitions,
                    include_plan=args.include_plans,
                )
            term_results.append(
                {
                    "term": term.key,
                    "term_id": term.term_id,
                    "active": term.active,
                    "category": term.legal_concept_category,
                    "length_bucket": _length_bucket(term.key),
                    "modes": results,
                }
            )

        index_report: Dict[str, Any]
        if index_existed and not args.rebuild_index:
            index_report = {
                "reused": True,
                "build_seconds": None,
                "definition": "existing benchmark index",
            }
            index_size, index_pretty = _relation_size(
                conn, BENCH_INDEX_FQN
            )
            index_report["size_bytes"] = index_size
            index_report["size_pretty"] = index_pretty
        else:
            if _index_exists(conn):
                _drop_index(conn)
            index_report = _create_index(conn)

        for result in term_results:
            for name, _uses_index, force_index, exact in MODE_DEFS:
                if name == "a_baseline":
                    continue
                result["modes"][name] = _run_mode(
                    conn,
                    term=result["term"],
                    exact_verification=exact,
                    force_index=force_index,
                    repetitions=args.repetitions,
                    include_plan=args.include_plans,
                )

        maintenance = _maintenance_probe(
            conn, enabled=args.maintenance
        )
        if args.cleanup:
            with conn.cursor() as cur:
                cur.execute(f"DROP SCHEMA IF EXISTS {BENCH_SCHEMA} CASCADE")
        table_size_after, table_pretty_after = _relation_size(
            conn, BENCH_FQN
        ) if not args.cleanup else (0, "0 bytes")
        index_size_after, index_pretty_after = _relation_size(
            conn, BENCH_INDEX_FQN
        ) if not args.cleanup else (0, "0 bytes")

    total_current_rows = int(
        table_build.get("total_current_rows")
        or evidence.get("total_current_rows")
        or 0
    )
    index_bytes = int(index_report.get("size_bytes") or 0)
    table_rows = int(table_build.get("rows") or 0)
    index_bytes_per_row = (
        round(index_bytes / table_rows, 2) if table_rows and index_bytes else None
    )
    estimated_full_index_bytes = (
        int(round(index_bytes_per_row * total_current_rows))
        if index_bytes_per_row and total_current_rows
        else None
    )

    elapsed = time.perf_counter() - started
    aggregate = _aggregate_modes(term_results)
    by_bucket = _aggregate_buckets(term_results)
    comparisons = _comparisons(term_results)

    csv_rows: List[Dict[str, Any]] = []
    for result in term_results:
        for mode, stats in result["modes"].items():
            csv_rows.append(
                {
                    "term": result["term"],
                    "term_id": result["term_id"],
                    "active": result["active"],
                    "length_bucket": result["length_bucket"],
                    "category": result["category"],
                    "mode": mode,
                    "p50_ms": stats.get("p50_ms"),
                    "p95_ms": stats.get("p95_ms"),
                    "index_used_rate": stats.get("index_used_rate"),
                    "planner_counts": json.dumps(
                        stats.get("planner_counts") or {},
                        ensure_ascii=False,
                    ),
                    "matched_rows": stats.get("matched_rows"),
                    "index_scan_rows": stats.get("index_scan_rows"),
                }
            )

    output = {
        "version": "pg-trgm-benchmark-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "normalization_version": NORMALIZATION_VERSION,
        "database": db_info,
        "pg_trgm_version": trgm_version,
        "benchmark_schema": BENCH_SCHEMA,
        "benchmark_table": BENCH_FQN,
        "benchmark_index": BENCH_INDEX_FQN,
        "is_formal_retrieval_index": False,
        "table_build": table_build,
        "index": index_report,
        "index_extrapolation": {
            "total_current_rows": total_current_rows,
            "index_bytes_per_row": index_bytes_per_row,
            "estimated_full_corpus_index_bytes": estimated_full_index_bytes,
            "estimated_full_corpus_index_pretty": (
                _pretty_bytes(estimated_full_index_bytes)
                if estimated_full_index_bytes
                else None
            ),
            "note": (
                "Approximate linear extrapolation from the benchmark sample; "
                "trigram index size is not guaranteed to be linear."
            ),
        },
        "table_size": {
            "bytes": table_size_after,
            "pretty": table_pretty_after,
        },
        "index_size_after": {
            "bytes": index_size_after,
            "pretty": index_pretty_after,
        },
        "normalization_consistency": normalization,
        "query_settings": {
            "repetitions": args.repetitions,
            "warmup_runs": 1,
            "statement_timeout": "300s",
            "force_mode": "enable_seqscan=off for *_forced modes",
            "baseline_runs_before_index": not args.skip_a,
        },
        "selection": {
            "mode": (
                "explicit"
                if args.terms
                else "evidence_buckets"
                if evidence
                else "active_and_bucket_fallback"
            ),
            "per_bucket": args.per_bucket,
            "max_terms": args.max_terms,
            "terms": term_metadata,
        },
        "terms": term_results,
        "aggregate": {
            "by_mode": aggregate,
            "by_bucket": by_bucket,
            "comparisons": comparisons,
        },
        "maintenance": maintenance,
        "elapsed_seconds": round(elapsed, 2),
        "limitations": [
            "The benchmark table is a deterministic sample, not the full corpus.",
            "The index exists only in legal_term_benchmark; it is not used by RAG.",
            "EXPLAIN ANALYZE on count(*) measures scan/filter cost, not answer quality.",
            "The default planner may choose a sequential scan for low-selectivity terms; forced modes show the index lower bound.",
            "C adds strpos exact verification, but LIKE on normalized text is already exact; C is a diagnostic for candidate recheck cost.",
            "No embedding, Qdrant, reranker, or formal retrieval path is modified.",
        ],
        "note": (
            "Do not promote a term or create a production GIN index from this "
            "report alone. Review planner choices, latency, and write cost."
        ),
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    csv_path = Path(args.csv_output)
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "term",
                "term_id",
                "active",
                "length_bucket",
                "category",
                "mode",
                "p50_ms",
                "p95_ms",
                "index_used_rate",
                "planner_counts",
                "matched_rows",
                "index_scan_rows",
            ],
            lineterminator="\n",
        )
        writer.writeheader()
        writer.writerows(csv_rows)

    print(
        json.dumps(
            {
                "output": str(output_path),
                "csv_output": str(csv_path),
                "terms": len(term_results),
                "table_rows": table_build["rows"],
                "index_build_seconds": index_report.get("build_seconds"),
                "index_size": index_report.get("size_pretty"),
                "normalization_mismatches": normalization["mismatches"],
                "aggregate": {
                    mode: {
                        "p50_ms_median": stats["p50_ms_median"],
                        "index_usage_rate": stats["index_usage_rate"],
                        "planner_counts": stats["planner_counts"],
                    }
                    for mode, stats in aggregate.items()
                },
                "comparisons": comparisons,
                "elapsed_seconds": round(elapsed, 2),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
