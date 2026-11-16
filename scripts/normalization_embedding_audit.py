#!/usr/bin/env python3
"""Measure whether whitespace normalization changes index embeddings.

This is a read-only audit.  It does not modify Qdrant or PostgreSQL.  For a
fixed-seed sample of current judgments it builds the existing head/tail index
text twice -- once from raw full text and once from normalized full text --
embeds both with the configured bge-m3 endpoint, and reports cosine similarity
plus top-k ranking overlap for representative queries.

Usage:
    uv run python scripts/normalization_embedding_audit.py \
      --sample-size 200 \
      --output .run/normalization_embedding_audit.json
"""

from __future__ import annotations

import argparse
import json
import math
import random
import re
import statistics
from pathlib import Path
from typing import Any, Dict, List, Sequence

import psycopg

from judgment.config import Settings
from judgment.embeddings import OllamaEmbedder
from judgment.judgment_index import build_index_text
from judgment.text_normalization import normalize_for_match

QUERIES = [
    "詐欺集團車手人頭帳戶",
    "洗錢 詐欺 犯罪所得",
    "被害人 匯款 詐騙",
    "幫助詐欺 常業詐欺",
    "侵權行為 詐欺 損害賠償",
]


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _split_fraud_count(text: str) -> int:
    return len(re.findall(r"詐[\s│｜|]+[欺騙]", str(text or "")))


def _fetch_rows(
    settings: Settings,
    sample_size: int,
    seed: int,
    *,
    include_split: bool = False,
    split_limit: int = 50,
) -> List[Dict[str, Any]]:
    with psycopg.connect(_pg_dsn(settings.database_url)) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id FROM judgment_documents
                WHERE is_current = true AND full_text <> ''
                ORDER BY id
                """
            )
            ids = [int(row[0]) for row in cur.fetchall()]
            if not ids:
                return []
            rng = random.Random(seed)
            chosen = set(rng.sample(ids, min(sample_size, len(ids))))
            if include_split:
                cur.execute(
                    """
                    SELECT id FROM judgment_documents
                    WHERE is_current = true AND full_text <> ''
                      AND full_text ~ '詐[[:space:]│｜|]+[欺騙]'
                    ORDER BY id
                    LIMIT %s
                    """,
                    [max(1, int(split_limit))],
                )
                chosen.update(int(row[0]) for row in cur.fetchall())
            cur.execute(
                """
                SELECT id, jid, court_normalized, jdate, title,
                       matched_laws, full_text
                FROM judgment_documents
                WHERE id = ANY(%s)
                ORDER BY id
                """,
                [sorted(chosen)],
            )
            rows = []
            for row in cur.fetchall():
                (
                    row_id,
                    jid,
                    court,
                    jdate,
                    title,
                    matched_laws,
                    full_text,
                ) = row
                text = str(full_text or "")
                rows.append(
                    {
                        "id": int(row_id),
                        "jid": str(jid or ""),
                        "court": str(court or ""),
                        "jdate": str(jdate or ""),
                        "title": str(title or ""),
                        "matched_laws": list(matched_laws or []),
                        "full_text": text,
                        "split_fraud_count": _split_fraud_count(text),
                    }
                )
            return rows


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    numerator = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(a * a for a in left))
    right_norm = math.sqrt(sum(b * b for b in right))
    if not left_norm or not right_norm:
        return 0.0
    return numerator / (left_norm * right_norm)


def _percentile(values: Sequence[float], probability: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0.0
    index = min(
        len(ordered) - 1,
        max(0, int(round(probability * (len(ordered) - 1)))),
    )
    return ordered[index]


def _top_k(scores: Sequence[float], k: int) -> List[int]:
    return [
        index
        for index, _ in sorted(
            enumerate(scores), key=lambda item: (-item[1], item[0])
        )[:k]
    ]


def _overlap(left: Sequence[int], right: Sequence[int]) -> int:
    return len(set(left) & set(right))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample-size", type=int, default=200)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--include-split",
        action="store_true",
        help="force-include documents with whitespace/table-split fraud terms",
    )
    parser.add_argument("--split-limit", type=int, default=50)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--max-chars", type=int, default=1600)
    parser.add_argument(
        "--output", default=".run/normalization_embedding_audit.json"
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    rows = _fetch_rows(
        settings,
        args.sample_size,
        args.seed,
        include_split=args.include_split,
        split_limit=args.split_limit,
    )
    if not rows:
        raise SystemExit("no current judgments with full text")
    raw_texts = [
        build_index_text(
            court=row["court"],
            title=row["title"],
            jdate=row["jdate"],
            matched_laws=row["matched_laws"],
            full_text=row["full_text"],
            max_chars=args.max_chars,
        )
        for row in rows
    ]
    normalized_texts = [
        build_index_text(
            court=row["court"],
            title=row["title"],
            jdate=row["jdate"],
            matched_laws=row["matched_laws"],
            full_text=normalize_for_match(row["full_text"]),
            max_chars=args.max_chars,
        )
        for row in rows
    ]

    embedder = OllamaEmbedder(
        settings.embedding_url,
        model=settings.embedding_model,
        api=settings.embedding_api,
        timeout=settings.embedding_timeout_seconds,
        query_timeout=settings.embedding_query_timeout_seconds,
        health_timeout=settings.embedding_health_timeout_seconds,
        fallback_base_url=settings.embedding_fallback_url,
        fallback_api=settings.embedding_fallback_api,
        fallback_base_urls=settings.embedding_failover_urls,
        fallback_apis=settings.embedding_failover_apis,
    )

    def embed_all(values: Sequence[str]) -> List[List[float]]:
        vectors: List[List[float]] = []
        batch_size = max(1, int(args.batch_size))
        for start in range(0, len(values), batch_size):
            vectors.extend(embedder.embed(values[start : start + batch_size]))
        return vectors

    raw_vectors = embed_all(raw_texts)
    normalized_vectors = embed_all(normalized_texts)
    similarities = [
        _cosine(raw, normalized)
        for raw, normalized in zip(raw_vectors, normalized_vectors)
    ]

    query_vectors = embed_all(QUERIES)
    query_results: List[Dict[str, Any]] = []
    split_ranks: Dict[str, Dict[str, Dict[str, int]]] = {
        row["jid"]: {"raw": {}, "normalized": {}}
        for row in rows
        if row["split_fraud_count"] > 0
    }
    for query, vector in zip(QUERIES, query_vectors):
        raw_scores = [_cosine(vector, doc) for doc in raw_vectors]
        normalized_scores = [
            _cosine(vector, doc) for doc in normalized_vectors
        ]
        for index, row in enumerate(rows):
            if row["jid"] not in split_ranks:
                continue
            split_ranks[row["jid"]]["raw"][query] = 1 + sum(
                1
                for score in raw_scores
                if score > raw_scores[index]
            )
            split_ranks[row["jid"]]["normalized"][query] = 1 + sum(
                1
                for score in normalized_scores
                if score > normalized_scores[index]
            )
        raw_top10 = _top_k(raw_scores, 10)
        normalized_top10 = _top_k(normalized_scores, 10)
        raw_top20 = _top_k(raw_scores, 20)
        normalized_top20 = _top_k(normalized_scores, 20)
        query_results.append(
            {
                "query": query,
                "top10_overlap": _overlap(raw_top10, normalized_top10),
                "top20_overlap": _overlap(raw_top20, normalized_top20),
                "raw_top_jids": [rows[index]["jid"] for index in raw_top10],
                "normalized_top_jids": [
                    rows[index]["jid"] for index in normalized_top10
                ],
            }
        )

    split_pairs = [
        (row["split_fraud_count"], similarity)
        for row, similarity in zip(rows, similarities)
        if row["split_fraud_count"] > 0
    ]
    split_cosines = [value for _, value in split_pairs]
    non_split_cosines = [
        similarity
        for row, similarity in zip(rows, similarities)
        if row["split_fraud_count"] == 0
    ]
    try:
        correlation = statistics.correlation(
            [count for count, _ in split_pairs],
            split_cosines,
        )
    except (statistics.StatisticsError, ValueError):
        correlation = None
    split_analysis = {
        "documents_with_split_terms": len(split_pairs),
        "split_cosine_mean": (
            round(statistics.mean(split_cosines), 6)
            if split_cosines
            else None
        ),
        "non_split_cosine_mean": (
            round(statistics.mean(non_split_cosines), 6)
            if non_split_cosines
            else None
        ),
        "correlation_split_count_cosine": (
            round(correlation, 6) if correlation is not None else None
        ),
        "documents": [
            {
                "jid": row["jid"],
                "split_fraud_count": row["split_fraud_count"],
                "cosine": round(similarity, 6),
                "raw_rank_by_query": split_ranks[row["jid"]]["raw"],
                "normalized_rank_by_query": split_ranks[row["jid"]][
                    "normalized"
                ],
            }
            for row, similarity in zip(rows, similarities)
            if row["split_fraud_count"] > 0
        ],
    }

    median = _percentile(similarities, 0.50)
    p05 = _percentile(similarities, 0.05)
    min_top10 = min(
        (query["top10_overlap"] for query in query_results), default=0
    )
    borderline_queries = [
        query["query"]
        for query in query_results
        if query["top10_overlap"] <= 8
    ]
    reembed_now = median < 0.98 or p05 < 0.95 or min_top10 < 8

    report = {
        "sample_size": len(rows),
        "seed": args.seed,
        "max_chars": args.max_chars,
        "embedding_model": settings.embedding_model,
        "embedding_url": settings.embedding_url,
        "cosine": {
            "min": round(min(similarities), 6),
            "p05": round(p05, 6),
            "p25": round(_percentile(similarities, 0.25), 6),
            "median": round(median, 6),
            "mean": round(sum(similarities) / len(similarities), 6),
            "p75": round(_percentile(similarities, 0.75), 6),
            "p95": round(_percentile(similarities, 0.95), 6),
            "max": round(max(similarities), 6),
            "below_098": sum(1 for value in similarities if value < 0.98),
            "below_095": sum(1 for value in similarities if value < 0.95),
        },
        "queries": query_results,
        "split_analysis": split_analysis,
        "decisions": {
            "reembed_now": reembed_now,
            "criteria": {
                "median_cosine_below": 0.98,
                "p05_cosine_below": 0.95,
                "min_top10_overlap_below": 8,
            },
            "observed": {
                "median": round(median, 6),
                "p05": round(p05, 6),
                "min_top10_overlap": min_top10,
                "borderline_queries": borderline_queries,
            },
            "recommendation": (
                "reembed_with_new_recipe"
                if reembed_now
                else "defer_reembed; apply normalization to matching/display only"
            ),
            "note": (
                "This audit does not change the index. A full re-embedding "
                "also requires a new index recipe/version because the payload "
                "hash covers snippet text. The global rule also removes spaces "
                "between Latin tokens, so this is a conservative upper bound "
                "on index drift."
            ),
        },
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
