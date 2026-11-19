#!/usr/bin/env python3
"""Record real-user questions and classify retrieval failure modes.

Input is a JSON array or JSONL with at least a ``question`` field:

    {"id": "q01", "question": "士林地院 2000 年借款糾紛有哪些？",
     "expected": "返還借款案件", "notes": "描述性說法"}

Output records retrieval mode, latency, counts, and heuristic failure tags.
Heuristic tags are a triage aid, not a ground-truth relevance label.

Usage:
    uv run python scripts/real_question_audit.py \
      --questions .run/real_questions.jsonl \
      --api-base http://127.0.0.1:9200 \
      --output .run/real_question_audit.json
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import time
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List

import httpx

from judgment.query_parser import parse_judgment_query, violations


def _load_cases(path: Path) -> List[Dict[str, Any]]:
    text = path.read_text(encoding="utf-8").strip()
    if not text:
        return []
    if text.startswith("["):
        payload = json.loads(text)
        if not isinstance(payload, list):
            raise SystemExit("questions JSON must be an array or JSONL")
        return [dict(item) for item in payload]
    cases = []
    for line in text.splitlines():
        line = line.strip()
        if line:
            cases.append(json.loads(line))
    return cases


def _classify(
    *,
    question: str,
    payload: Dict[str, Any],
    latency_ms: int,
    slow_ms: int,
) -> List[str]:
    retrieval = payload.get("retrieval") or {}
    answer = str(payload.get("answer") or "")
    notice = str(payload.get("notice") or "")
    judgments = payload.get("judgments") or []
    law_sources = payload.get("law_sources") or []
    mode = str(retrieval.get("retrieval_mode") or "")
    tags: List[str] = []
    if retrieval.get("mode") == "law_first":
        tags.append("law_first")
    if mode == "keyword_list":
        tags.append("exact_keyword")
    elif mode == "structured_list":
        tags.append("structured_list")
    elif mode == "vector":
        tags.append("semantic")
    scope_probe = retrieval.get("scope_probe") or {}
    if scope_probe.get("status") is not None:
        tags.append("scope_probe_attempted")
    if scope_probe.get("status") not in (None, "ok"):
        tags.append(f"scope_probe_{scope_probe['status']}")
        tags.append("scope_probe_skipped")
    if scope_probe.get("status") == "ok" and scope_probe.get("zero_terms"):
        tags.append("scope_probe_zero")
    if scope_probe.get("status") == "ok" and scope_probe.get("hit_terms"):
        tags.append("scope_probe_hit")
    if not judgments and not law_sources:
        tags.append("no_results")
    if "查無" in answer or "不足以回答" in answer:
        tags.append("abstained_or_insufficient")
    if "LLM 無法產生" in notice or "fallback" in notice.lower():
        tags.append("llm_fallback")
    if latency_ms > slow_ms:
        tags.append("slow")
    parsed = parse_judgment_query(question)
    for judgment in judgments:
        if violations(judgment, parsed):
            tags.append("filter_violation")
            break
    return tags


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--questions", required=True)
    parser.add_argument("--api-base", default="http://127.0.0.1:9200")
    parser.add_argument("--timeout", type=float, default=180.0)
    parser.add_argument("--slow-ms", type=int, default=20_000)
    parser.add_argument(
        "--output", default=".run/real_question_audit.json"
    )
    parser.add_argument(
        "--csv-output", default=".run/real_question_audit.csv"
    )
    parser.add_argument(
        "--admin-token",
        default=os.getenv("JUDGMENT_ADMIN_TOKEN", "").strip(),
        help="管理權杖；本機 bypass 關閉後 RAG API 需要此權杖。",
    )
    args = parser.parse_args()
    headers = (
        {"X-Judgment-Admin-Token": args.admin_token}
        if args.admin_token
        else {}
    )

    cases = _load_cases(Path(args.questions))
    results: List[Dict[str, Any]] = []
    with httpx.Client(
        base_url=args.api_base.rstrip("/"),
        timeout=args.timeout,
        headers=headers,
    ) as client:
        for case in cases:
            question = str(case.get("question") or "").strip()
            if not question:
                continue
            started = time.perf_counter()
            try:
                response = client.post(
                    "/api/rag/query", json={"question": question}
                )
                response.raise_for_status()
                payload = response.json()
                error = ""
            except Exception as exc:  # noqa: BLE001 - audit records errors
                payload = {}
                error = f"{exc.__class__.__name__}: {exc}"
            latency_ms = int((time.perf_counter() - started) * 1000)
            tags = (
                ["error"]
                if error
                else _classify(
                    question=question,
                    payload=payload,
                    latency_ms=latency_ms,
                    slow_ms=args.slow_ms,
                )
            )
            retrieval = payload.get("retrieval") or {}
            results.append(
                {
                    "id": case.get("id") or question,
                    "question": question,
                    "expected": case.get("expected") or "",
                    "notes": case.get("notes") or "",
                    "error": error,
                    "latency_ms": latency_ms,
                    "answer_source": payload.get("answer_source"),
                    "retrieval_mode": retrieval.get("retrieval_mode"),
                    "retrieval_status": retrieval.get("status"),
                    "judgments": len(payload.get("judgments") or []),
                    "law_sources": len(payload.get("law_sources") or []),
                    "total_matches": retrieval.get("total_matches"),
                    "scope_probe_status": (
                        retrieval.get("scope_probe") or {}
                    ).get("status"),
                    "scope_probe_scope_documents": (
                        retrieval.get("scope_probe") or {}
                    ).get("scope_document_count"),
                    "scope_probe_elapsed_ms": (
                        retrieval.get("scope_probe") or {}
                    ).get("elapsed_ms"),
                    "scope_probe_zero_terms": [
                        term.get("term")
                        for term in (
                            (retrieval.get("scope_probe") or {}).get(
                                "zero_terms"
                            )
                            or []
                        )
                    ],
                    "failure_tags": tags,
                    "answer_preview": str(
                        payload.get("answer") or ""
                    )[:300],
                    "notice_preview": str(
                        payload.get("notice") or ""
                    )[:300],
                    "quality_label": "",
                    "quality_reason": "",
                    "reviewer": "",
                    "reviewed_at": "",
                }
            )
            print(
                f"{results[-1]['id']}: {', '.join(tags) or 'ok'} "
                f"({latency_ms} ms)"
            )

    tag_counts: Dict[str, int] = {}
    for result in results:
        for tag in result["failure_tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    probe_results = [
        result for result in results
        if result.get("scope_probe_status") is not None
    ]
    probe_skipped = [
        result for result in probe_results
        if result["scope_probe_status"] != "ok"
    ]
    report = {
        "version": "real-question-audit-v1",
        "questions": len(results),
        "tag_counts": tag_counts,
        "scope_probe_stats": {
            "attempted": len(probe_results),
            "skipped": len(probe_skipped),
            "skipped_ratio": (
                round(len(probe_skipped) / len(probe_results), 4)
                if probe_results
                else 0.0
            ),
            "status_counts": dict(
                Counter(
                    str(result["scope_probe_status"])
                    for result in probe_results
                )
            ),
        },
        "results": results,
        "note": (
            "Failure tags are heuristic triage, not relevance labels. "
            "A human must review each question and expected result."
        ),
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    csv_path = Path(args.csv_output)
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "id",
                "question",
                "expected",
                "notes",
                "error",
                "latency_ms",
                "answer_source",
                "retrieval_mode",
                "retrieval_status",
                "judgments",
                "law_sources",
                "total_matches",
                "scope_probe_status",
                "scope_probe_scope_documents",
                "scope_probe_elapsed_ms",
                "scope_probe_zero_terms",
                "failure_tags",
                "answer_preview",
                "notice_preview",
                "quality_label",
                "quality_reason",
                "reviewer",
                "reviewed_at",
            ],
            lineterminator="\n",
        )
        writer.writeheader()
        for result in results:
            writer.writerow(
                {
                    **result,
                    "scope_probe_zero_terms": "|".join(
                        result["scope_probe_zero_terms"]
                    ),
                    "failure_tags": "|".join(result["failure_tags"]),
                }
            )
    print(
        json.dumps(
            {
                "output": str(output),
                "csv_output": str(csv_path),
                "questions": len(results),
                "tag_counts": tag_counts,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
