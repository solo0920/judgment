#!/usr/bin/env python3
"""Generate full-text evidence for the legal term registry.

The default run is a deterministic 200k-row sample because a full no-index
scan of the 4.68M-row table takes roughly an hour.  Use ``--full`` for the
complete snapshot.  This script is read-only and does not promote terms.

The evidence file is a snapshot, not a registry mutation.  It records exact
phrase occurrences, court/year/title distributions, paragraph frequency, and
deterministic positive/negative JID candidates for later human review.

Usage:
    uv run python scripts/legal_term_evidence.py
    uv run python scripts/legal_term_evidence.py --full
    uv run python scripts/legal_term_evidence.py --active-only
    uv run python scripts/legal_term_evidence.py --terms "洗錢,內線交易"
"""

from __future__ import annotations

import argparse
import bisect
import hashlib
import heapq
import json
import re
import time
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

import psycopg

from judgment.config import Settings
from judgment.legal_term_matching import (
    build_variant_index as _variant_index,
    length_bucket as _length_bucket,
    match_term_counts as _match_term_counts,
)
from judgment.legal_terms import LEGAL_TERMS, REGISTRY_TERMS, REGISTRY_VERSION
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    normalize_for_match,
    normalize_with_offsets,
)

POSITIVE_SAMPLE_SIZE = 50
NEGATIVE_SAMPLE_SIZE = 10
MAX_DOCUMENT_TERMS = 100
MAX_MATCHED_VARIANTS = 10
NEWLINE_RE = re.compile(r"\r\n|\r|\n")


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


class _BottomKSampler:
    """Order-independent deterministic sample based on a stable hash."""

    def __init__(self, term: str, size: int, seed: int) -> None:
        self.term = term
        self.size = max(0, int(size))
        self.seed = int(seed)
        self.heap: List[Tuple[int, Dict[str, Any]]] = []

    def add(self, jid: str, record: Dict[str, Any]) -> None:
        if self.size == 0:
            return
        digest = hashlib.blake2b(
            f"{self.seed}:{self.term}:{jid}".encode("utf-8"),
            digest_size=8,
        ).digest()
        rank = int.from_bytes(digest, "big")
        if len(self.heap) < self.size:
            heapq.heappush(self.heap, (-rank, record))
            return
        largest = -self.heap[0][0]
        if rank < largest:
            heapq.heapreplace(self.heap, (-rank, record))

    def records(self) -> List[Dict[str, Any]]:
        return [
            record
            for _, record in sorted(self.heap, key=lambda item: -item[0])
        ]


def _derive_negative_candidates(
    evidence: Dict[str, Dict[str, Any]],
    *,
    size: int,
    seed: int,
) -> None:
    """Derive hard negatives from sibling-term positive samples.

    A document that matched another term in the same category but did not
    contain this term is a useful exact-match confuser.  It is not a
    substantive negative; human review is still required.
    """

    by_category: Dict[str, List[str]] = defaultdict(list)
    for term, item in evidence.items():
        by_category[item["category"]].append(term)

    for term, item in evidence.items():
        if item["document_frequency"] == 0:
            item["negative_jid_candidates"] = []
            item["negative_jid_candidate_count"] = 0
            item["negative_jid_sample_size"] = 0
            item["negative_candidate_reason"] = (
                "not_generated_for_zero_hit_term"
            )
            continue

        top_titles = {
            title for title, _ in item["title_distribution"].most_common(10)
        }
        top_courts = {
            court for court, _ in item["court_distribution"].most_common(5)
        }
        top_years = {
            year for year, _ in item["year_distribution"].most_common(5)
        }

        candidates: Dict[str, Dict[str, Any]] = {}
        for sibling in by_category[item["category"]]:
            if sibling == term:
                continue
            for record in evidence[sibling]["positive_jid_candidates"]:
                if record.get("document_terms_truncated"):
                    continue
                if term in record.get("document_terms", ()):
                    continue
                jid = record.get("jid") or ""
                if not jid:
                    continue
                title = record.get("title") or ""
                court = record.get("court") or ""
                year = record.get("year") or ""
                score = 0
                reasons = []
                if title in top_titles:
                    score += 8
                    reasons.append("same_title")
                if court in top_courts:
                    score += 4
                    reasons.append("same_court")
                if year in top_years:
                    score += 2
                    reasons.append("same_year")
                if not reasons:
                    reasons.append("same_category")
                reason = "+".join(reasons) + "_exact_miss_proxy"
                existing = candidates.get(jid)
                if existing is not None and existing["score"] >= score:
                    continue
                candidates[jid] = {
                    "jid": jid,
                    "court": court,
                    "year": year,
                    "title": title,
                    "sibling_terms": record.get("document_terms", [])[:20],
                    "score": score,
                    "reason": reason,
                }

        buckets: Dict[int, List[Dict[str, Any]]] = defaultdict(list)
        for record in candidates.values():
            buckets[int(record["score"])].append(record)
        selected: List[Dict[str, Any]] = []
        for score in sorted(buckets, reverse=True):
            if len(selected) >= size:
                break
            sampler = _BottomKSampler(
                f"negative:{term}:{score}", size, seed
            )
            for record in buckets[score]:
                sampler.add(record["jid"], record)
            selected.extend(sampler.records())
        # A lower-tier bucket can overshoot the requested size; keep the
        # highest-scoring records and then deterministically trim.
        selected = selected[: max(0, size)]
        item["negative_jid_candidates"] = selected
        item["negative_jid_candidate_count"] = len(candidates)
        item["negative_jid_sample_size"] = len(selected)
        item["negative_candidate_reason"] = (
            "tiered_same_title_court_year_exact_miss_proxy"
        )


def _sample_support(document_frequency: int) -> str:
    if document_frequency == 0:
        return "zero_in_sample"
    if document_frequency < 20:
        return "insufficient_sample"
    return "proxy_supported"


def _term_template(term: Any, snapshot_id: str, generated_at: str) -> Dict[str, Any]:
    return {
        "term_id": term.term_id,
        "term": term.key,
        "category": term.legal_concept_category,
        "active": term.active,
        "review_status": term.review_status,
        "term_length": len(term.key),
        "length_bucket": _length_bucket(term.key),
        "document_frequency": 0,
        "estimated_full_corpus_df": 0,
        "occurrence_count": 0,
        "term_density": 0.0,
        "paragraph_frequency": 0,
        "court_distribution": Counter(),
        "court_diversity": 0,
        "court_other_count": 0,
        "year_distribution": Counter(),
        "year_coverage": 0,
        "year_min": "",
        "year_max": "",
        "title_distribution": Counter(),
        "title_diversity": 0,
        "title_other_count": 0,
        "positive_jid_candidates": [],
        "positive_jid_candidate_count": 0,
        "positive_jid_sample_size": 0,
        "negative_jid_candidates": [],
        "negative_jid_candidate_count": 0,
        "negative_jid_sample_size": 0,
        "negative_candidate_reason": "",
        "evidence_snapshot_id": snapshot_id,
        "evidence_generated_at": generated_at,
        "sample_support": "zero_in_sample",
    }


def _update_distribution(counter: Counter, value: str) -> None:
    # Keep the counter complete during the scan; truncation happens once at
    # the end so diversity and long-tail counts stay correct.
    counter[value] += 1


def _finalize_item(
    item: Dict[str, Any],
    *,
    sample_fraction: float,
    top_n: int,
) -> None:
    df = int(item["document_frequency"])
    occurrences = int(item["occurrence_count"])
    item["term_density"] = round(occurrences / df, 4) if df else 0.0
    item["estimated_full_corpus_df"] = (
        int(round(df / sample_fraction))
        if sample_fraction > 0
        else df
    )

    court_counter: Counter = item["court_distribution"]
    year_counter: Counter = item["year_distribution"]
    title_counter: Counter = item["title_distribution"]
    item["court_diversity"] = len(court_counter)
    item["title_diversity"] = len(title_counter)
    numeric_years = sorted(
        int(year) for year in year_counter if str(year).isdigit()
    )
    item["year_coverage"] = len(numeric_years)
    item["year_min"] = str(numeric_years[0]) if numeric_years else ""
    item["year_max"] = str(numeric_years[-1]) if numeric_years else ""

    top_courts = court_counter.most_common(top_n)
    top_titles = title_counter.most_common(top_n)
    item["court_distribution"] = dict(top_courts)
    item["title_distribution"] = dict(top_titles)
    item["court_other_count"] = df - sum(count for _, count in top_courts)
    item["title_other_count"] = df - sum(count for _, count in top_titles)
    item["year_distribution"] = dict(
        sorted(year_counter.items(), key=lambda pair: str(pair[0]))
    )
    item["sample_support"] = _sample_support(df)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, default=200_000)
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--active-only", action="store_true")
    parser.add_argument("--terms", default="")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--max-positive-jids", type=int, default=POSITIVE_SAMPLE_SIZE
    )
    parser.add_argument(
        "--max-negative-jids", type=int, default=NEGATIVE_SAMPLE_SIZE
    )
    parser.add_argument(
        "--top-courts", type=int, default=20
    )
    parser.add_argument(
        "--top-titles", type=int, default=20
    )
    parser.add_argument(
        "--output", default=".run/legal_term_evidence.json"
    )
    args = parser.parse_args()

    terms = _select_terms(args.active_only, args.terms)
    variant_to_term, closure, pattern = _variant_index(terms)
    generated_at = datetime.now(timezone.utc).isoformat()
    snapshot_id = (
        "legal-term-evidence-"
        + generated_at[:19].replace(":", "").replace("-", "")
        + f"-{REGISTRY_VERSION}"
    )
    evidence: Dict[str, Dict[str, Any]] = {
        term.key: _term_template(term, snapshot_id, generated_at)
        for term in terms
    }
    samplers: Dict[str, _BottomKSampler] = {
        term.key: _BottomKSampler(
            term.key, args.max_positive_jids, args.seed
        )
        for term in terms
    }

    settings = Settings.from_env()
    dsn = _pg_dsn(settings.database_url)
    started = time.perf_counter()
    scanned = 0
    matched_documents = 0
    term_document_hits = 0
    total_occurrences = 0
    sample_fraction = 1.0
    sample_method = "full"
    id_mod_step = 0
    total_rows = 0

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as meta:
            meta.execute(
                "SELECT count(*), max(last_seen_snapshot_id) "
                "FROM judgment_documents WHERE is_current = true"
            )
            total_rows, db_snapshot_id = meta.fetchone()
        total_rows = int(total_rows or 0)
        if not args.full:
            requested = max(1, int(args.limit))
            target_sample_size = min(requested, total_rows)
            id_mod_step = max(1, total_rows // target_sample_size)
            sample_fraction = min(
                1.0, 1.0 / id_mod_step
            )
            sample_method = f"id_mod:{id_mod_step}"
            where = "is_current = true AND id %% %s = 0"
            params: List[Any] = [id_mod_step]
        else:
            sample_fraction = 1.0
            sample_method = "full"
            where = "is_current = true"
            params = []

        with conn.cursor(name="legal_term_evidence_cursor") as cur:
            cur.itersize = 2000
            cur.execute(
                f"""
                SELECT jid, court_normalized, substr(jdate, 1, 4), title, full_text
                FROM judgment_documents
                WHERE {where}
                """,
                params,
            )
            for jid, court, year, title, full_text in cur:
                scanned += 1
                raw = str(full_text or "")
                normalized = normalize_for_match(raw)
                matches = list(pattern.finditer(normalized))
                if matches:
                    matched_documents += 1
                    normalized_text = normalize_with_offsets(raw)
                    newlines = [
                        match.start()
                        for match in NEWLINE_RE.finditer(raw)
                    ]
                    term_occurrences: Counter = Counter()
                    term_paragraphs: Dict[str, Set[int]] = defaultdict(set)
                    term_variants: Dict[str, Set[str]] = defaultdict(set)
                    for match in matches:
                        matched_variant = match.group(0)
                        counts = _match_term_counts(
                            matched_variant, variant_to_term, closure
                        )
                        raw_start = normalized_text.offsets[match.start()]
                        line_index = bisect.bisect_right(
                            newlines, raw_start
                        )
                        for canonical, count in counts.items():
                            term_occurrences[canonical] += count
                            term_paragraphs[canonical].add(line_index)
                            if len(term_variants[canonical]) < MAX_MATCHED_VARIANTS:
                                term_variants[canonical].add(matched_variant)

                    document_terms = sorted(term_occurrences)
                    document_terms_truncated = (
                        len(document_terms) > MAX_DOCUMENT_TERMS
                    )
                    stored_document_terms = document_terms[:MAX_DOCUMENT_TERMS]
                    for canonical in document_terms:
                        item = evidence.get(canonical)
                        if item is None:
                            continue
                        occurrences = int(term_occurrences[canonical])
                        paragraphs = len(term_paragraphs[canonical])
                        item["document_frequency"] += 1
                        item["occurrence_count"] += occurrences
                        item["paragraph_frequency"] += paragraphs
                        court_value = str(court or "未載明")
                        year_value = str(year or "未載明")
                        title_value = str(title or "未載明")
                        _update_distribution(
                            item["court_distribution"], court_value
                        )
                        _update_distribution(
                            item["year_distribution"], year_value
                        )
                        _update_distribution(
                            item["title_distribution"], title_value
                        )
                        term_document_hits += 1
                        total_occurrences += occurrences
                        samplers[canonical].add(
                            str(jid or ""),
                            {
                                "jid": str(jid or ""),
                                "court": court_value,
                                "year": year_value,
                                "title": title_value,
                                "occurrences": occurrences,
                                "paragraphs": paragraphs,
                                "matched_variants": sorted(
                                    term_variants[canonical]
                                )[:MAX_MATCHED_VARIANTS],
                                "document_terms": stored_document_terms,
                                "document_terms_truncated": (
                                    document_terms_truncated
                                ),
                            },
                        )

                if scanned % 25_000 == 0:
                    elapsed = time.perf_counter() - started
                    rate = scanned / elapsed if elapsed else 0.0
                    print(
                        f"scanned={scanned:,} matched_docs={matched_documents:,} "
                        f"elapsed={elapsed:.1f}s rows/s={rate:.0f}",
                        flush=True,
                    )

    actual_sample_fraction = (
        scanned / total_rows if total_rows else 0.0
    )

    for term, item in evidence.items():
        records = samplers[term].records()
        item["positive_jid_candidates"] = records
        item["positive_jid_candidate_count"] = item["document_frequency"]
        item["positive_jid_sample_size"] = len(records)

    _derive_negative_candidates(
        evidence, size=args.max_negative_jids, seed=args.seed
    )

    for item in evidence.values():
        _finalize_item(
            item,
            sample_fraction=actual_sample_fraction,
            top_n=max(args.top_courts, args.top_titles),
        )

    elapsed = time.perf_counter() - started
    terms_with_hits = sum(
        1 for item in evidence.values() if item["document_frequency"] > 0
    )
    terms_proxy_supported = sum(
        1
        for item in evidence.values()
        if item["sample_support"] == "proxy_supported"
    )
    report = {
        "version": "legal-term-evidence-v1.1",
        "generated_at": generated_at,
        "evidence_snapshot_id": snapshot_id,
        "registry_version": REGISTRY_VERSION,
        "normalization_version": NORMALIZATION_VERSION,
        "matching_rule": (
            "longest_exact_variant_with_containment_v1; "
            "contained registry variants count toward shorter terms; "
            "same-term overlapping variants are not double counted"
        ),
        "db_snapshot_id": db_snapshot_id,
        "total_current_rows": total_rows,
        "sample": {
            "method": sample_method,
            "id_mod_step": id_mod_step,
            "requested_limit": None if args.full else args.limit,
            "target_sample_size": (
                total_rows if args.full else min(args.limit, total_rows)
            ),
            "scanned_rows": scanned,
            "target_sample_fraction": round(sample_fraction, 8),
            "actual_sample_fraction": round(actual_sample_fraction, 8),
            "is_full_scan": bool(args.full),
            "seed": args.seed,
        },
        "sample_size": scanned,
        "scanned_rows": scanned,
        "matched_documents": matched_documents,
        "matched_document_rate": (
            round(matched_documents / scanned, 6) if scanned else 0.0
        ),
        "term_document_hits": term_document_hits,
        "total_occurrences": total_occurrences,
        "elapsed_seconds": round(elapsed, 2),
        "rows_per_second": round(scanned / elapsed, 2) if elapsed else 0.0,
        "totals": {
            "terms": len(evidence),
            "terms_with_hits": terms_with_hits,
            "terms_zero_hits": len(evidence) - terms_with_hits,
            "terms_proxy_supported": terms_proxy_supported,
        },
        "terms": evidence,
        "limitations": [
            "Full-text occurrence is a candidate signal, not substantive relevance.",
            "A document that mentions a term may not be a case about that term.",
            "A 200k id-modulo sample is an estimate, not a census.",
            "Positive JID candidates are deterministic bottom-k samples, not legal labels.",
            "Negative JID candidates are same-category exact-miss confusers, not substantive negatives.",
            "Nothing in this file promotes a term to active or legal_reviewed.",
        ],
        "note": (
            "Snapshot only.  Registry status is unchanged; human review and "
            "benchmark evidence are still required before promotion."
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
                "terms": len(evidence),
                "sample_method": sample_method,
                "scanned_rows": scanned,
                "total_current_rows": total_rows,
                "sample_fraction": round(actual_sample_fraction, 6),
                "matched_documents": matched_documents,
                "terms_with_hits": terms_with_hits,
                "terms_proxy_supported": terms_proxy_supported,
                "elapsed_seconds": round(elapsed, 2),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
