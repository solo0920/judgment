#!/usr/bin/env python3
"""Generate candidate co-occurring terms for human glossary review.

This is read-only.  It does NOT modify ``legal_terms.py`` or add synonyms.
Each candidate must be reviewed before it becomes an exact-match phrase.

Usage:
    uv run python scripts/legal_term_cooccurrence.py \
      --output .run/legal_term_cooccurrence.json
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List

import psycopg

from judgment.config import Settings
from judgment.legal_terms import LEGAL_TERMS
from judgment.text_normalization import normalize_for_match

STOPWORDS = {
    "法院",
    "判決",
    "裁定",
    "原告",
    "被告",
    "上訴人",
    "被上訴人",
    "聲請人",
    "相對人",
    "中華民國",
    "民國",
    "年度",
    "字第",
    "字號",
    "附件",
    "理由",
    "事實",
    "主文",
    "本院",
    "臺灣",
    "台北",
    "臺北",
    "新北",
    "士林",
    "板橋",
    "規定",
    "條文",
    "法律",
    "契約",
    "約定",
    "給付",
    "請求",
    "相關",
    "案件",
    "本案",
    "公司",
    "新台幣",
    "新臺幣",
}


def _pg_dsn(database_url: str) -> str:
    return database_url.replace("postgresql+psycopg", "postgresql")


def _tokens(text: str) -> List[str]:
    return re.findall(r"[\u4e00-\u9fff]{2,4}", text)


def _candidate_counter(text: str, term: str) -> Counter:
    normalized = normalize_for_match(text)
    counter: Counter = Counter()
    start = 0
    while True:
        position = normalized.find(term, start)
        if position < 0:
            break
        window = normalized[max(0, position - 120) : position + len(term) + 160]
        for token in _tokens(window):
            if token == term or token in STOPWORDS:
                continue
            if term in token:
                continue
            if any(
                fragment in token
                for fragment in (
                    "條第",
                    "項第",
                    "款第",
                    "法第",
                    "交易法第",
                    "券交易法",
                    "易法第",
                    "條之",
                    "項之",
                    "款之",
                    "約交割之",
                    "線交易之",
                    "縱股價之",
                    "等語",
                    "部分",
                    "日至",
                )
            ):
                continue
            if token.endswith("之") or token.startswith("第"):
                continue
            counter[token] += 1
        start = position + len(term)
    return counter


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--terms",
        default=",".join(term.key for term in LEGAL_TERMS),
    )
    parser.add_argument("--top", type=int, default=30)
    parser.add_argument(
        "--output", default=".run/legal_term_cooccurrence.json"
    )
    args = parser.parse_args()

    settings = Settings.from_env()
    terms = [value.strip() for value in args.terms.split(",") if value.strip()]
    report: Dict[str, Any] = {"terms": {}, "note": "candidates only; no auto-merge"}

    with psycopg.connect(_pg_dsn(settings.database_url)) as conn:
        with conn.cursor() as cur:
            for term in terms:
                cur.execute(
                    """
                    SELECT jid, title, court_normalized, substr(jdate, 1, 4),
                           full_text
                    FROM judgment_documents
                    WHERE is_current = true AND full_text LIKE %s
                    """,
                    [f"%{term}%"],
                )
                rows = cur.fetchall()
                title_counts: Counter = Counter()
                court_counts: Counter = Counter()
                year_counts: Counter = Counter()
                candidates: Counter = Counter()
                examples: Dict[str, str] = {}
                for jid, title, court, year, full_text in rows:
                    title_counts[str(title or "未載明")] += 1
                    court_counts[str(court or "未載明")] += 1
                    year_counts[str(year or "未載明")] += 1
                    local = _candidate_counter(str(full_text or ""), term)
                    candidates.update(local)
                    if local:
                        top_local = local.most_common(1)[0][0]
                        if top_local not in examples:
                            normalized = normalize_for_match(str(full_text or ""))
                            idx = normalized.find(term)
                            examples[top_local] = normalized[
                                max(0, idx - 80) : idx + len(term) + 160
                            ]
                report["terms"][term] = {
                    "documents": len(rows),
                    "top_titles": title_counts.most_common(15),
                    "top_courts": court_counts.most_common(10),
                    "top_years": year_counts.most_common(15),
                    "candidate_terms": [
                        {
                            "term": candidate,
                            "count": count,
                            "example": examples.get(candidate, ""),
                        }
                        for candidate, count in candidates.most_common(
                            args.top
                        )
                    ],
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
