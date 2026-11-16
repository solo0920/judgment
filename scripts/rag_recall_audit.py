#!/usr/bin/env python3
"""Audit structured retrieval against PostgreSQL and duplicate JIDs.

Usage:
    uv run python scripts/rag_recall_audit.py \
      --question "2000年至2010年在板橋地方法院相關詐騙的判決有那些"

The Qdrant side uses the same parser/filter as RAG. The PostgreSQL side is an
independent baseline over judgment_documents:
  - title matches (same as Qdrant title filter)
  - normalized full_text matches (broader coverage reference, not a precision
    oracle and not Recall)
  - duplicate JIDs inside the Qdrant filter

Full-text terms are matched after removing whitespace/newlines so that
`常業詐\r\n欺` is treated as the same term.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List

import psycopg

from judgment.config import Settings
from judgment.query_parser import (
    build_base_filter,
    build_query_filter,
    parse_judgment_query,
)
from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    SQL_NORMALIZE_EXPR,
)
from judgment.vector_store import QdrantStore

TOPIC_TERMS = {
    "詐欺": ("詐欺", "詐騙"),
    "洗錢": ("洗錢",),
}


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _postgres_baseline(
    settings: Settings,
    parsed,
    titles: List[str],
) -> Dict[str, Any]:
    if not parsed.courts or parsed.year_from is None:
        return {
            "skipped": True,
            "reason": "需要法院與年份條件才能安全掃描 PostgreSQL 全文",
        }
    terms = sorted(
        {
            term
            for topic in parsed.topics
            for term in TOPIC_TERMS.get(topic, (topic,))
        }
    )
    clauses = [
        "is_current = true",
        "court_normalized = ANY(%s)",
        "jdate BETWEEN %s AND %s",
    ]
    params: List[Any] = [
        list(parsed.courts),
        f"{parsed.year_from}0101",
        f"{parsed.year_to}1231",
    ]
    with psycopg.connect(_pg_dsn(settings.database_url)) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FROM judgment_documents WHERE "
                + " AND ".join(clauses),
                params,
            )
            total = int(cur.fetchone()[0])

            title_count = 0
            if titles:
                cur.execute(
                    "SELECT count(*) FROM judgment_documents WHERE "
                    + " AND ".join(clauses)
                    + " AND title = ANY(%s)",
                    params + [titles],
                )
                title_count = int(cur.fetchone()[0])

            fulltext_count = 0
            fulltext_only = 0
            top_titles: List[Dict[str, Any]] = []
            if terms:
                normalized = SQL_NORMALIZE_EXPR
                like = " OR ".join(
                    [f"{normalized} LIKE %s" for _ in terms]
                )
                like_params = [f"%{term}%" for term in terms]
                cur.execute(
                    "SELECT count(*) FROM judgment_documents WHERE "
                    + " AND ".join(clauses)
                    + f" AND ({like})",
                    params + like_params,
                )
                fulltext_count = int(cur.fetchone()[0])
                if titles:
                    cur.execute(
                        "SELECT count(*) FROM judgment_documents WHERE "
                        + " AND ".join(clauses)
                        + f" AND ({like})"
                        + " AND NOT (title = ANY(%s))",
                        params + like_params + [titles],
                    )
                    fulltext_only = int(cur.fetchone()[0])
                cur.execute(
                    "SELECT title, count(*) FROM judgment_documents WHERE "
                    + " AND ".join(clauses)
                    + f" AND ({like})"
                    + " GROUP BY title ORDER BY count(*) DESC LIMIT 15",
                    params + like_params,
                )
                top_titles = [
                    {"title": row[0] or "", "count": int(row[1])}
                    for row in cur.fetchall()
                ]
    return {
        "skipped": False,
        "normalization_version": NORMALIZATION_VERSION,
        "court_date_total": total,
        "title_matches": title_count,
        "fulltext_matches": fulltext_count,
        "fulltext_only": fulltext_only,
        "fulltext_terms": terms,
        "top_fulltext_titles": top_titles,
        "title_vs_fulltext_ratio": (
            round(title_count / fulltext_count, 4)
            if fulltext_count
            else None
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit RAG structured recall.")
    parser.add_argument("--question", required=True)
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    settings = Settings.from_env()
    parsed = parse_judgment_query(args.question)
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=60.0,
    )
    collection = (
        store.get_alias(settings.judgment_vector_alias)
        or settings.judgment_vector_collection
    )
    base = build_base_filter(parsed)
    qdrant_base_total = (
        store.count(collection, query_filter=base, exact=True)
        if base
        else 0
    )
    query_filter, meta = build_query_filter(store, collection, parsed)
    qdrant_total = (
        store.count(collection, query_filter=query_filter, exact=True)
        if query_filter
        else 0
    )
    jid_hits = (
        store.facet(
            collection,
            "jid",
            query_filter=query_filter,
            limit=10000,
            exact=True,
        )
        if query_filter
        else []
    )
    unique_jids = len(jid_hits)
    duplicate_jids = [
        {"jid": hit.get("value"), "count": int(hit.get("count") or 0)}
        for hit in jid_hits
        if int(hit.get("count") or 0) > 1
    ]
    baseline = _postgres_baseline(
        settings,
        parsed,
        list(meta.get("titles") or []),
    )
    report = {
        "question": args.question,
        "parsed": parsed.to_dict(),
        "collection": collection,
        "base_filter": base,
        "qdrant_base_total": qdrant_base_total,
        "query_filter": query_filter,
        "titles": meta.get("titles"),
        "titles_count": meta.get("titles_count"),
        "facet_truncated": meta.get("facet_truncated"),
        "qdrant_total": qdrant_total,
        "qdrant_unique_jids": unique_jids,
        "duplicate_jids": duplicate_jids,
        "duplicate_jid_count": len(duplicate_jids),
        "postgres": baseline,
    }
    pg_total = baseline.get("court_date_total")
    if pg_total:
        report["coverage"] = {
            "qdrant_base_total": qdrant_base_total,
            "postgres_court_date_total": pg_total,
            "coverage_ratio": round(qdrant_base_total / pg_total, 6),
            "coverage_gap": int(pg_total) - qdrant_base_total,
        }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if args.output:
        Path(args.output).write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"written {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
