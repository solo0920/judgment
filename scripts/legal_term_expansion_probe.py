#!/usr/bin/env python3
"""Measure expansion on/off with exact-match proxy relevance.

This is deliberately not a human-reviewed expansion benchmark.  It asks a
narrow question:

    For a scope where exact term positives exist, does appending expansion
    terms change dense Recall@8/@20 for those positives?

The relevant set is ``exact_match_proxy``: judgments whose normalized full
text contains the term.  It is not substantive relevance.  The report must
not be used to claim legal Recall or nDCG improvement.

Usage:
    uv run python scripts/legal_term_expansion_probe.py
    uv run python scripts/legal_term_expansion_probe.py \
      --terms "違約交割,人頭帳戶"
"""

from __future__ import annotations

import argparse
import json
import statistics
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

from judgment.config import Settings
from judgment.embeddings import OllamaEmbedder
from judgment.legal_terms import REGISTRY_TERMS, expand_semantic_query
from judgment.query_parser import ParsedJudgmentQuery, build_base_filter
from judgment.rag import _search_hits
from judgment.vector_store import QdrantStore

EXPANSION_TERMS = (
    "違約交割",
    "人頭帳戶",
    "財報不實",
    "非法吸金",
    "短線交易",
)


def _load_evidence(path: Path) -> Dict[str, Dict[str, Any]]:
    if not path.exists():
        raise SystemExit(
            f"Evidence snapshot not found: {path}. "
            "Run scripts/legal_term_evidence.py first."
        )
    payload = json.loads(path.read_text(encoding="utf-8"))
    return payload.get("terms") or {}


def _scope_for_term(item: Dict[str, Any]) -> Dict[str, Any]:
    records = list(item.get("positive_jid_candidates") or [])
    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for record in records:
        grouped[str(record.get("court") or "")].append(record)
    if not grouped:
        return {
            "court": "",
            "year_from": None,
            "year_to": None,
            "relevant_jids": [],
            "scope_positive_count": 0,
        }
    court, court_records = max(
        grouped.items(), key=lambda pair: (len(pair[1]), pair[0])
    )
    years = sorted(
        int(record.get("year"))
        for record in court_records
        if str(record.get("year") or "").isdigit()
    )
    relevant = sorted(
        {
            str(record.get("jid") or "")
            for record in court_records
            if record.get("jid")
        }
    )
    return {
        "court": court,
        "year_from": years[0] if years else None,
        "year_to": years[-1] if years else None,
        "relevant_jids": relevant,
        "scope_positive_count": len(relevant),
    }


def _recall_at(
    hits: Sequence[Dict[str, Any]], relevant: set, k: int
) -> Optional[float]:
    if not relevant:
        return None
    jids = {
        str((hit.get("payload") or {}).get("jid") or "")
        for hit in hits[:k]
    }
    return round(len(jids & relevant) / len(relevant), 4)


def _precision_at(
    hits: Sequence[Dict[str, Any]], relevant: set, k: int
) -> Optional[float]:
    if not hits or not relevant:
        return None
    jids = [
        str((hit.get("payload") or {}).get("jid") or "")
        for hit in hits[:k]
    ]
    return round(
        sum(1 for jid in jids if jid in relevant) / min(k, len(jids)),
        4,
    )


def _run(
    *,
    settings: Settings,
    store: QdrantStore,
    embedder: OllamaEmbedder,
    collection: str,
    question: str,
    query_filter: Optional[Dict[str, Any]],
    relevant: set,
    limit: int,
    top_k: int,
    repetitions: int,
) -> Dict[str, Any]:
    runs = []
    last_hits: List[Dict[str, Any]] = []
    for _ in range(max(1, repetitions)):
        started = time.perf_counter()
        hits, retrieval = _search_hits(
            settings=settings,
            question=question,
            store=store,
            embedder=embedder,
            collection=collection,
            limit=limit,
            query_filter=query_filter,
        )
        wall_ms = (time.perf_counter() - started) * 1000.0
        runs.append(
            {
                "wall_ms": round(wall_ms, 2),
                "search_latency_ms": retrieval.get("latency_ms"),
                "hits": len(hits),
            }
        )
        last_hits = hits
    return {
        "question": question,
        "runs": runs,
        "p50_wall_ms": round(
            statistics.median(run["wall_ms"] for run in runs), 2
        ),
        "recall_at_8": _recall_at(last_hits, relevant, 8),
        "recall_at_20": _recall_at(last_hits, relevant, top_k),
        "precision_at_10": _precision_at(last_hits, relevant, 10),
        "hits": len(last_hits),
        "top_jids": [
            str((hit.get("payload") or {}).get("jid") or "")
            for hit in last_hits[:top_k]
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--terms", default=",".join(EXPANSION_TERMS)
    )
    parser.add_argument(
        "--evidence", default=".run/legal_term_evidence.json"
    )
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--top-k", type=int, default=20)
    parser.add_argument("--repetitions", type=int, default=2)
    parser.add_argument(
        "--output", default=".run/legal_term_expansion_probe.json"
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    if not settings.qdrant_url:
        raise SystemExit("QDRANT_URL is not configured")
    evidence = _load_evidence(Path(args.evidence))
    requested = [
        value.strip() for value in args.terms.split(",") if value.strip()
    ]
    by_key = {term.key: term for term in REGISTRY_TERMS}
    missing = [value for value in requested if value not in by_key]
    if missing:
        raise SystemExit("Unknown legal terms: " + ", ".join(missing))

    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=60.0,
    )
    alias = None
    try:
        alias = store.get_alias(settings.judgment_vector_alias)
    except Exception:
        alias = None
    collection = alias or settings.judgment_vector_collection
    embedder = OllamaEmbedder(
        settings.embedding_url,
        settings.embedding_model,
        api=settings.embedding_api,
        timeout=settings.embedding_timeout_seconds,
        query_timeout=settings.embedding_query_timeout_seconds,
        health_timeout=settings.embedding_health_timeout_seconds,
        fallback_base_url=settings.embedding_fallback_url,
        fallback_api=settings.embedding_fallback_api,
        fallback_base_urls=settings.embedding_failover_urls,
        fallback_apis=settings.embedding_failover_apis,
    )
    if not embedder.configured:
        raise SystemExit("Embedding backend is not configured")

    results: List[Dict[str, Any]] = []
    for term_key in requested:
        term = by_key[term_key]
        item = evidence.get(term_key) or {}
        scope = _scope_for_term(item)
        if not scope["court"] or scope["year_from"] is None:
            results.append(
                {
                    "term": term_key,
                    "status": "skipped",
                    "reason": "no exact-match positive scope",
                }
            )
            continue
        parsed = ParsedJudgmentQuery(
            year_from=int(scope["year_from"]),
            year_to=int(scope["year_to"]),
            courts=[scope["court"]],
        )
        query_filter = build_base_filter(parsed)
        relevant = set(scope["relevant_jids"])
        term_query = f"{term_key}的判決"
        expanded, expansion_meta = expand_semantic_query(
            term_query,
            limit=settings.rag_legal_expansion_terms,
            include_disabled=True,
        )
        indexed_relevant = store.count(
            collection,
            query_filter={
                "must": [
                    {
                        "key": "jid",
                        "match": {"any": sorted(relevant)},
                    }
                ]
            },
            exact=True,
        ) if relevant else 0
        a = _run(
            settings=settings,
            store=store,
            embedder=embedder,
            collection=collection,
            question=term_query,
            query_filter=query_filter,
            relevant=relevant,
            limit=args.limit,
            top_k=args.top_k,
            repetitions=args.repetitions,
        )
        b = _run(
            settings=settings,
            store=store,
            embedder=embedder,
            collection=collection,
            question=expanded,
            query_filter=query_filter,
            relevant=relevant,
            limit=args.limit,
            top_k=args.top_k,
            repetitions=args.repetitions,
        )
        results.append(
            {
                "term": term_key,
                "term_id": term.term_id,
                "active": term.active,
                "expansion_enabled": term.expansion_enabled,
                "expansion_decision": term.expansion_decision,
                "expansion_meta": expansion_meta,
                "scope": {
                    **scope,
                    "query_filter": query_filter,
                    "indexed_relevant_count": int(indexed_relevant),
                    "indexed_relevant_ratio": (
                        round(indexed_relevant / len(relevant), 4)
                        if relevant
                        else None
                    ),
                },
                "a_original": a,
                "b_expanded": b,
                "delta_recall_at_8": (
                    round(
                        (b["recall_at_8"] or 0)
                        - (a["recall_at_8"] or 0),
                        4,
                    )
                    if b["recall_at_8"] is not None
                    and a["recall_at_8"] is not None
                    else None
                ),
                "delta_recall_at_20": (
                    round(
                        (b["recall_at_20"] or 0)
                        - (a["recall_at_20"] or 0),
                        4,
                    )
                    if b["recall_at_20"] is not None
                    and a["recall_at_20"] is not None
                    else None
                ),
                "delta_p50_wall_ms": round(
                    b["p50_wall_ms"] - a["p50_wall_ms"], 2
                ),
                "ground_truth_type": "exact_match_proxy",
                "human_reviewed": False,
                "claim_recall_improvement": False,
            }
        )

    deltas_8 = [
        result["delta_recall_at_8"]
        for result in results
        if result.get("delta_recall_at_8") is not None
    ]
    deltas_20 = [
        result["delta_recall_at_20"]
        for result in results
        if result.get("delta_recall_at_20") is not None
    ]
    report = {
        "version": "legal-term-expansion-probe-v1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "evidence_snapshot_id": evidence.get("evidence_snapshot_id"),
        "registry_version": "1.0",
        "ground_truth_type": "exact_match_proxy",
        "human_reviewed": False,
        "claim_recall_improvement": False,
        "settings": {
            "candidate_k": args.limit,
            "top_k": args.top_k,
            "repetitions": args.repetitions,
            "score_threshold": settings.rag_score_threshold,
            "collection": collection,
            "embedding_model": settings.embedding_model,
            "expansion_enabled_runtime": settings.rag_legal_expansion_enabled,
        },
        "coverage": {
            "note": (
                "Qdrant collection may not contain every exact positive; "
                "indexed_relevant_ratio is reported per term."
            ),
            "collection_points": (
                store.collection_info(collection) or {}
            ).get("points_count"),
        },
        "terms": results,
        "aggregate": {
            "terms": len(results),
            "terms_with_delta": len(deltas_8),
            "mean_delta_recall_at_8": (
                round(statistics.mean(deltas_8), 4)
                if deltas_8
                else None
            ),
            "median_delta_recall_at_8": (
                round(statistics.median(deltas_8), 4)
                if deltas_8
                else None
            ),
            "mean_delta_recall_at_20": (
                round(statistics.mean(deltas_20), 4)
                if deltas_20
                else None
            ),
        },
        "limitations": [
            "Relevant set is exact phrase presence, not substantive relevance.",
            "Do not claim legal Recall or nDCG improvement from this report.",
            "The Qdrant index may not cover every exact positive.",
            "Runtime expansion remains off by default until this and human review justify it.",
        ],
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
                "terms": len(results),
                "aggregate": report["aggregate"],
                "terms_detail": [
                    {
                        "term": result.get("term"),
                        "scope": result.get("scope", {}).get("court"),
                        "positives": result.get("scope", {}).get(
                            "scope_positive_count"
                        ),
                        "indexed": result.get("scope", {}).get(
                            "indexed_relevant_count"
                        ),
                        "a_r8": result.get("a_original", {}).get(
                            "recall_at_8"
                        ),
                        "b_r8": result.get("b_expanded", {}).get(
                            "recall_at_8"
                        ),
                        "delta_r8": result.get("delta_recall_at_8"),
                        "delta_r20": result.get("delta_recall_at_20"),
                    }
                    for result in results
                ],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
