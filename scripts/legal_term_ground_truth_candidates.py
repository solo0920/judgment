#!/usr/bin/env python3
"""Build review-ready exact-match proxy candidates for legal terms.

This script does not label relevance and does not promote any term.  It turns
the evidence snapshot into a bounded candidate set:

- positives: documents whose normalized full text contains an exact term or an
  exact variant (``exact_match_proxy``);
- negatives/confusers: same-category documents that do not contain the term
  (``exact_match_proxy_confuser``).

A human reviewer must assign graded relevance (2/1/0) before the set can be
called ``human_reviewed`` or used for a benchmark-approved decision.

Usage:
    uv run python scripts/legal_term_ground_truth_candidates.py
    uv run python scripts/legal_term_ground_truth_candidates.py \
      --terms "違約交割,洗錢,內線交易"
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from judgment.legal_terms import REGISTRY_TERMS, REGISTRY_VERSION
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    SQL_NORMALIZE_EXPR,
)

DEFAULT_POSITIVE_COUNT = 20
DEFAULT_NEGATIVE_COUNT = 5


def _select_terms(raw_terms: str) -> List[Any]:
    if not raw_terms:
        return list(REGISTRY_TERMS)
    requested = {
        value.strip() for value in raw_terms.split(",") if value.strip()
    }
    selected = [term for term in REGISTRY_TERMS if term.key in requested]
    missing = requested - {term.key for term in selected}
    if missing:
        raise SystemExit("Unknown legal terms: " + ", ".join(sorted(missing)))
    return selected


def _positive_candidate(
    candidate_id: str,
    record: Dict[str, Any],
    snapshot_id: str,
) -> Dict[str, Any]:
    return {
        "candidate_id": candidate_id,
        "jid": str(record.get("jid") or ""),
        "court": str(record.get("court") or ""),
        "year": str(record.get("year") or ""),
        "title": str(record.get("title") or ""),
        "term_occurrences": int(record.get("occurrences") or 0),
        "term_paragraphs": int(record.get("paragraphs") or 0),
        "matched_variants": list(record.get("matched_variants") or [])[:10],
        "candidate_role": "positive_exact_proxy",
        "ground_truth_type": "exact_match_proxy",
        "selection_reason": (
            "normalized_fulltext_contains_exact_term_or_variant"
        ),
        "relevance_label": "",
        "label_status": "unlabeled",
        "human_reviewed": False,
        "legal_reviewed": False,
        "promotion_allowed": False,
        "evidence_snapshot_id": snapshot_id,
    }


def _negative_candidate(
    candidate_id: str,
    record: Dict[str, Any],
    snapshot_id: str,
) -> Dict[str, Any]:
    return {
        "candidate_id": candidate_id,
        "jid": str(record.get("jid") or ""),
        "court": str(record.get("court") or ""),
        "year": str(record.get("year") or ""),
        "title": str(record.get("title") or ""),
        "sibling_terms": list(record.get("sibling_terms") or [])[:20],
        "confuser_reason": str(record.get("reason") or ""),
        "confuser_score": int(record.get("score") or 0),
        "candidate_role": "negative_confuser_proxy",
        "ground_truth_type": "exact_match_proxy_confuser",
        "selection_reason": (
            "same_category_or_same_title_exact_term_absent"
        ),
        "relevance_label": "",
        "label_status": "unlabeled",
        "human_reviewed": False,
        "legal_reviewed": False,
        "promotion_allowed": False,
        "evidence_snapshot_id": snapshot_id,
    }


def _query_templates(term: str) -> Dict[str, str]:
    return {
        "term_query": f"{term}的判決",
        "concept_query": f"法院實務上關於{term}的見解",
    }


def _sql_predicate(term: Any) -> str:
    clauses = []
    for variant in term.phrases or (term.key,):
        escaped = str(variant).replace("'", "''")
        clauses.append(f"{SQL_NORMALIZE_EXPR} LIKE '%{escaped}%'")
    return " OR ".join(clauses)


def _recommended_next_step(
    *,
    positive_count: int,
    negative_count: int,
    proxy_ready: bool,
    active: bool,
) -> str:
    if proxy_ready:
        if active:
            return "human_review_then_abc_benchmark_for_active_term"
        return "human_review_then_abc_benchmark"
    if positive_count == 0:
        return "hold_no_proxy_data"
    if positive_count < DEFAULT_POSITIVE_COUNT:
        return "expand_evidence_or_confirm_low_volume"
    return "collect_more_confuser_negatives"


def _load_priority(path: Path) -> Dict[str, Dict[str, Any]]:
    if not path.exists():
        return {}
    payload = json.loads(path.read_text(encoding="utf-8"))
    rows = (
        payload.get("all_terms")
        or payload.get("candidates")
        or payload.get("top_20_candidates")
        or []
    )
    return {str(row.get("term")): row for row in rows}


def _priority_fields(
    priority: Dict[str, Any],
) -> Dict[str, Any]:
    if not priority:
        return {
            "priority_tier": "",
            "priority_rank": None,
            "priority_score": None,
        }
    rank = priority.get("priority_rank")
    if rank == "":
        rank = None
    return {
        "priority_tier": str(priority.get("priority_tier") or ""),
        "priority_rank": rank,
        "priority_score": priority.get("priority_score"),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--evidence", default=".run/legal_term_evidence.json"
    )
    parser.add_argument(
        "--priority", default=".run/legal_term_priority.json"
    )
    parser.add_argument("--terms", default="")
    parser.add_argument(
        "--max-positive", type=int, default=DEFAULT_POSITIVE_COUNT
    )
    parser.add_argument(
        "--max-negative", type=int, default=DEFAULT_NEGATIVE_COUNT
    )
    parser.add_argument(
        "--output",
        default=".run/legal_term_ground_truth_candidates.json",
    )
    parser.add_argument(
        "--csv-output",
        default=".run/legal_term_ground_truth_candidates.csv",
    )
    args = parser.parse_args()

    evidence_path = Path(args.evidence)
    if not evidence_path.exists():
        raise SystemExit(
            f"Evidence snapshot not found: {evidence_path}. "
            "Run scripts/legal_term_evidence.py first."
        )
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    evidence_terms: Dict[str, Dict[str, Any]] = evidence.get("terms") or {}
    snapshot_id = str(evidence.get("evidence_snapshot_id") or "")
    if not snapshot_id:
        snapshot_id = str(evidence.get("generated_at") or "unknown")
    priority_by_term = _load_priority(Path(args.priority))

    selected_terms = _select_terms(args.terms)
    term_payloads: List[Dict[str, Any]] = []
    csv_rows: List[Dict[str, Any]] = []
    proxy_ready_count = 0
    positive_ready_count = 0
    negative_ready_count = 0

    for term in selected_terms:
        item = evidence_terms.get(term.key) or {}
        priority = priority_by_term.get(term.key) or {}
        positive_records = list(
            item.get("positive_jid_candidates") or []
        )
        negative_records = list(
            item.get("negative_jid_candidates") or []
        )
        positives = [
            _positive_candidate(
                f"{term.term_id}:positive:{record.get('jid', '')}",
                record,
                snapshot_id,
            )
            for record in positive_records[: max(0, args.max_positive)]
        ]
        negatives = [
            _negative_candidate(
                f"{term.term_id}:negative:{record.get('jid', '')}",
                record,
                snapshot_id,
            )
            for record in negative_records[: max(0, args.max_negative)]
        ]
        positive_count = len(positives)
        negative_count = len(negatives)
        proxy_ready = (
            positive_count >= DEFAULT_POSITIVE_COUNT
            and negative_count >= DEFAULT_NEGATIVE_COUNT
        )
        if positive_count >= DEFAULT_POSITIVE_COUNT:
            positive_ready_count += 1
        if negative_count >= DEFAULT_NEGATIVE_COUNT:
            negative_ready_count += 1
        if proxy_ready:
            proxy_ready_count += 1

        term_payload = {
            "term_id": term.term_id,
            "term": term.key,
            "category": term.legal_concept_category,
            "active": term.active,
            "review_status": term.review_status,
            "exact_variants": list(term.phrases),
            "normalization_version": NORMALIZATION_VERSION,
            "sql_predicate": _sql_predicate(term),
            "queries": _query_templates(term.key),
            "document_frequency_in_snapshot": int(
                item.get("document_frequency") or 0
            ),
            "estimated_full_corpus_df": int(
                item.get("estimated_full_corpus_df") or 0
            ),
            "sample_support": str(item.get("sample_support") or ""),
            "available_positive_sample_size": len(positive_records),
            "available_negative_sample_size": len(negative_records),
            "positive_candidate_count": positive_count,
            "negative_candidate_count": negative_count,
            "proxy_ready": proxy_ready,
            "benchmark_ready": False,
            "human_reviewed": False,
            "legal_reviewed": False,
            "promotion_allowed": False,
            "recommended_next_step": _recommended_next_step(
                positive_count=positive_count,
                negative_count=negative_count,
                proxy_ready=proxy_ready,
                active=term.active,
            ),
            "positives": positives,
            "negatives": negatives,
            "evidence_snapshot_id": snapshot_id,
            "registry_version": REGISTRY_VERSION,
            **_priority_fields(priority),
        }
        term_payloads.append(term_payload)

        for candidate in positives + negatives:
            csv_rows.append(
                {
                    "term_id": term.term_id,
                    "term": term.key,
                    "category": term.legal_concept_category,
                    "candidate_role": candidate["candidate_role"],
                    "candidate_id": candidate["candidate_id"],
                    "jid": candidate["jid"],
                    "court": candidate["court"],
                    "year": candidate["year"],
                    "title": candidate["title"],
                    "term_occurrences": candidate.get(
                        "term_occurrences", ""
                    ),
                    "term_paragraphs": candidate.get(
                        "term_paragraphs", ""
                    ),
                    "matched_variants": "|".join(
                        candidate.get("matched_variants", [])
                    ),
                    "sibling_terms": "|".join(
                        candidate.get("sibling_terms", [])
                    ),
                    "selection_reason": candidate["selection_reason"],
                    "confuser_reason": candidate.get(
                        "confuser_reason", ""
                    ),
                    "relevance_label": "",
                    "label_status": "unlabeled",
                    "human_reviewed": False,
                    "legal_reviewed": False,
                    "proxy_ready": proxy_ready,
                    "benchmark_ready": False,
                    "evidence_snapshot_id": snapshot_id,
                    "priority_tier": term_payload["priority_tier"],
                    "priority_rank": (
                        term_payload["priority_rank"]
                        if term_payload["priority_rank"] is not None
                        else ""
                    ),
                }
            )

    term_payloads.sort(
        key=lambda payload: (
            0 if payload["active"] else 1,
            (
                int(payload["priority_rank"])
                if payload["priority_rank"] is not None
                else 10**9
            ),
            str(payload["term"]),
        )
    )
    output = {
        "version": "legal-term-ground-truth-candidates-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "evidence_snapshot_id": snapshot_id,
        "registry_version": REGISTRY_VERSION,
        "normalization_version": NORMALIZATION_VERSION,
        "seed": int(evidence.get("sample", {}).get("seed") or 42),
        "selection": {
            "positive": (
                "first N records from the evidence bottom-k exact-match "
                "sample"
            ),
            "negative": (
                "first N tiered same-title/court/year exact-miss confusers"
            ),
            "max_positive": args.max_positive,
            "max_negative": args.max_negative,
        },
        "review_protocol": {
            "labels": {
                "2": "judgment directly handles the legal concept",
                "1": "partially relevant or mentioned as a supporting issue",
                "0": "not substantively relevant despite exact phrase presence",
                "": "unlabeled",
            },
            "rules": [
                "Review the judgment, not only the extracted snippet.",
                "Exact phrase presence does not imply substantive relevance.",
                "A confuser may still be relevant for another concept; label it "
                "for this term only.",
                "Do not promote a term or enable expansion from this file.",
                "Human-reviewed labels must be stored separately; this file is "
                "not a legal opinion.",
            ],
        },
        "totals": {
            "terms": len(term_payloads),
            "terms_with_20_positives": positive_ready_count,
            "terms_with_5_negatives": negative_ready_count,
            "terms_proxy_ready": proxy_ready_count,
            "positive_candidates": sum(
                len(payload["positives"]) for payload in term_payloads
            ),
            "negative_candidates": sum(
                len(payload["negatives"]) for payload in term_payloads
            ),
        },
        "terms": term_payloads,
        "limitations": [
            "Positive candidates are exact-phrase proxies, not relevance labels.",
            "Negative candidates are confusers, not substantive negatives.",
            "No candidate has been human-reviewed or legal-reviewed.",
            "This file must not be written back into the registry automatically.",
        ],
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    csv_path = Path(args.csv_output)
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    csv_columns = [
        "term_id",
        "term",
        "category",
        "candidate_role",
        "candidate_id",
        "jid",
        "court",
        "year",
        "title",
        "term_occurrences",
        "term_paragraphs",
        "matched_variants",
        "sibling_terms",
        "selection_reason",
        "confuser_reason",
        "relevance_label",
        "label_status",
        "human_reviewed",
        "legal_reviewed",
        "proxy_ready",
        "benchmark_ready",
        "evidence_snapshot_id",
        "priority_tier",
        "priority_rank",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=csv_columns, lineterminator="\n"
        )
        writer.writeheader()
        writer.writerows(csv_rows)

    print(
        json.dumps(
            {
                "output": str(output_path),
                "csv_output": str(csv_path),
                "terms": len(term_payloads),
                "positive_candidates": output["totals"][
                    "positive_candidates"
                ],
                "negative_candidates": output["totals"][
                    "negative_candidates"
                ],
                "terms_proxy_ready": proxy_ready_count,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
