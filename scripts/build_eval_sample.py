#!/usr/bin/env python3
"""Deprecated exploratory sampler; use build_fraud_relevance_sample.py.

This version uses title strata and scans only the first 1,600 characters for
``criminal_signal``.  It is retained for ad-hoc exploration only and MUST NOT
be used as the v2.0 ground-truth sampler.

Usage:
    uv run python scripts/build_eval_sample.py \
      --question "2000年至2010年在板橋地方法院相關詐騙的判決有那些" \
      --limit 60

The sample is drawn from PostgreSQL rows that match court/date/full-text
terms but whose title is not in the current title facet.  It intentionally
does not use the parser's title filter as ground truth.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List

import psycopg

from judgment.config import Settings
from judgment.query_parser import build_query_filter, parse_judgment_query
from judgment.vector_store import QdrantStore

TOPIC_TERMS = {
    "詐欺": ("詐欺", "詐騙"),
    "洗錢": ("洗錢",),
}


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _allocate(
    strata: Dict[str, List[Dict[str, Any]]],
    limit: int,
    *,
    minimum: int = 1,
) -> List[Dict[str, Any]]:
    total = sum(len(items) for items in strata.values())
    if total <= limit:
        return [item for items in strata.values() for item in items]
    if len(strata) > limit:
        # More title strata than the annotation budget.  Keep important
        # offence-related titles first, then fill by stratum size.
        priority_terms = (
            "偽造文書",
            "洗錢",
            "侵占",
            "背信",
            "票據",
            "本票",
            "詐欺",
            "證券",
            "銀行",
        )
        priority = [
            title
            for title in strata
            if any(term in title for term in priority_terms)
        ]
        priority.sort(key=lambda title: len(strata[title]), reverse=True)
        rest = [
            title
            for title in strata
            if title not in priority
        ]
        rest.sort(key=lambda title: len(strata[title]), reverse=True)
        chosen = (priority + rest)[:limit]
        return [strata[title][0] for title in chosen]
    allocation = {}
    remaining = limit
    for title, items in strata.items():
        if len(items) == 0:
            continue
        count = max(minimum, round(limit * len(items) / total))
        count = min(count, len(items))
        allocation[title] = count
        remaining -= count
    # Adjust largest strata first without exceeding the sample limit.
    while remaining > 0:
        candidates = [
            title
            for title, items in strata.items()
            if allocation.get(title, 0) < len(items)
        ]
        if not candidates:
            break
        candidates.sort(key=lambda title: len(strata[title]), reverse=True)
        title = candidates[0]
        allocation[title] = allocation.get(title, 0) + 1
        remaining -= 1
    while remaining < 0:
        candidates = [
            title
            for title, count in allocation.items()
            if count > minimum
        ]
        if not candidates:
            break
        candidates.sort(key=lambda title: len(strata[title]), reverse=True)
        title = candidates[0]
        allocation[title] -= 1
        remaining += 1
    selected: List[Dict[str, Any]] = []
    for title, count in allocation.items():
        selected.extend(strata[title][:count])
    return selected


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build a stratified annotation sample from PostgreSQL."
    )
    parser.add_argument("--question", required=True)
    parser.add_argument("--limit", type=int, default=60)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--output", default=".run/rag_eval_sample.csv")
    parser.add_argument(
        "--json-output", default=".run/rag_eval_sample.json"
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    parsed = parse_judgment_query(args.question)
    if not parsed.courts or parsed.year_from is None or not parsed.topics:
        print("需要法院、年份與主題條件才能建立分層樣本")
        return 1
    terms = sorted(
        {
            term
            for topic in parsed.topics
            for term in TOPIC_TERMS.get(topic, (topic,))
        }
    )
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=60.0,
    )
    collection = (
        store.get_alias(settings.judgment_vector_alias)
        or settings.judgment_vector_collection
    )
    _, meta = build_query_filter(store, collection, parsed)
    excluded_titles = list(meta.get("titles") or [])
    like = " OR ".join(["full_text LIKE %s" for _ in terms])
    params: List[Any] = [
        list(parsed.courts),
        f"{parsed.year_from}0101",
        f"{parsed.year_to}1231",
        *[f"%{term}%" for term in terms],
    ]
    title_clause = ""
    if excluded_titles:
        title_clause = " AND NOT (title = ANY(%s))"
        params.append(excluded_titles)
    sql = f"""
        SELECT jid, court_normalized, jdate, title,
               substr(full_text, 1, 1600) AS text_head,
               (full_text ~ '詐欺取財罪|詐欺得利罪|三人以上共同詐欺|幫助詐欺|常業詐欺')
                   AS criminal_signal
        FROM judgment_documents
        WHERE is_current = true
          AND court_normalized = ANY(%s)
          AND jdate BETWEEN %s AND %s
          AND ({like})
          {title_clause}
    """
    with psycopg.connect(_pg_dsn(settings.database_url)) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

    strata: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for jid, court, jdate, title, text_head, criminal_signal in rows:
        jid_text = str(jid or "")
        parts = jid_text.split(",")
        case_type = parts[2] if len(parts) >= 3 else ""
        item = {
            "jid": jid_text,
            "court": str(court or ""),
            "jdate": str(jdate or ""),
            "title": str(title or ""),
            "case_type": case_type,
            "criminal_signal": bool(criminal_signal),
            "text_head": str(text_head or ""),
            "grade": "",
            "notes": "",
            "question": args.question,
            "source": "postgres_fulltext",
        }
        strata[item["title"] or "（未載明）"].append(item)
    for items in strata.values():
        items.sort(key=lambda item: item["jid"])
        random.Random(args.seed).shuffle(items)

    selected = _allocate(strata, max(1, args.limit))
    selected.sort(key=lambda item: (item["title"], item["jid"]))
    selected_per_title = defaultdict(int)
    for item in selected:
        selected_per_title[item["title"] or "（未載明）"] += 1
    for index, item in enumerate(selected, 1):
        title = item["title"] or "（未載明）"
        item["sample_id"] = f"eval_{index:04d}"
        item["stratum_size"] = len(strata[title])
        item["weight"] = round(
            len(strata[title]) / selected_per_title[title], 4
        )

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "sample_id",
                "grade",
                "notes",
                "jid",
                "court",
                "jdate",
                "title",
                "case_type",
                "criminal_signal",
                "text_head",
                "question",
                "source",
                "stratum_size",
                "weight",
            ],
        )
        writer.writeheader()
        writer.writerows(selected)
    json_output = Path(args.json_output)
    json_output.write_text(
        json.dumps(
            {
                "question": args.question,
                "parsed": parsed.to_dict(),
                "seed": args.seed,
                "limit": args.limit,
                "fulltext_candidates": len(rows),
                "excluded_titles": excluded_titles,
                "strata": {
                    title: len(items) for title, items in strata.items()
                },
                "samples": selected,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    print(
        f"fulltext_candidates={len(rows)} strata={len(strata)} "
        f"sample={len(selected)}"
    )
    print(f"written {output}")
    print(f"written {json_output}")
    print(
        "標註 grade：2=核心相關、1=部分相關、0=僅提及關鍵詞；"
        "notes 請寫理由或是否為詐欺案件。"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
