#!/usr/bin/env python3
"""Run a layered RAG retrieval benchmark against the Judgment API.

Usage:
    uv run python scripts/rag_query_benchmark.py
    uv run python scripts/rag_query_benchmark.py --suite tests/benchmarks/rag_query_suite.json
    uv run python scripts/rag_query_benchmark.py --output .run/rag_benchmark.json

Each case may assert:
  - answer_source / retrieval_mode / mode
  - min_judgments / min_law_sources
  - no_match
  - answer_prefix
  - max_latency_ms

Structured cases are additionally checked with the same parser used by RAG:
every returned judgment must satisfy year, court, and topic conditions.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

import httpx

from judgment.query_parser import parse_judgment_query, violations
from judgment.retrieval_eval import retrieval_metrics


def _check_case(
    case: Dict[str, Any],
    payload: Dict[str, Any],
    latency_ms: int,
) -> tuple[List[str], Dict[str, float]]:
    errors: List[str] = []
    expect = case.get("expect") or {}
    retrieval = payload.get("retrieval") or {}
    judgments = payload.get("judgments") or []
    law_sources = payload.get("law_sources") or []
    answer = str(payload.get("answer") or "")

    if "answer_source" in expect and payload.get("answer_source") != expect["answer_source"]:
        errors.append(
            f"answer_source={payload.get('answer_source')} expected={expect['answer_source']}"
        )
    if "retrieval_mode" in expect and retrieval.get("retrieval_mode") != expect["retrieval_mode"]:
        errors.append(
            f"retrieval_mode={retrieval.get('retrieval_mode')} expected={expect['retrieval_mode']}"
        )
    if "mode" in expect and retrieval.get("mode") != expect["mode"]:
        errors.append(
            f"mode={retrieval.get('mode')} expected={expect['mode']}"
        )
    if "min_judgments" in expect and len(judgments) < int(expect["min_judgments"]):
        errors.append(
            f"judgments={len(judgments)} expected>={expect['min_judgments']}"
        )
    if "min_law_sources" in expect and len(law_sources) < int(expect["min_law_sources"]):
        errors.append(
            f"law_sources={len(law_sources)} expected>={expect['min_law_sources']}"
        )
    if expect.get("no_match"):
        if judgments:
            errors.append(f"expected no_match but got {len(judgments)} judgments")
        if "查無" not in answer:
            errors.append("no_match answer does not contain 查無")
    prefix = str(expect.get("answer_prefix") or "")
    if prefix and not answer.startswith(prefix):
        errors.append(f"answer prefix mismatch: {answer[:80]!r}")
    max_latency = expect.get("max_latency_ms")
    if max_latency is not None and latency_ms > int(max_latency):
        errors.append(f"latency={latency_ms}ms expected<={max_latency}ms")

    parsed = parse_judgment_query(str(case.get("question") or ""))
    for judgment in judgments:
        item_errors = violations(judgment, parsed)
        if item_errors:
            errors.append(
                f"{judgment.get('jid')}: {', '.join(item_errors)}"
            )

    expected = case.get("expected") or {}
    metrics = retrieval_metrics(
        judgments,
        relevant_jids=expected.get("relevant_jids") or (),
        graded_relevance=expected.get("graded_relevance"),
        k=10,
    )
    if metrics:
        if "min_recall_at_20" in expect and metrics["recall_at_20"] < float(
            expect["min_recall_at_20"]
        ):
            errors.append(
                f"recall@20={metrics['recall_at_20']} "
                f"expected>={expect['min_recall_at_20']}"
            )
        if "min_ndcg_at_10" in expect and metrics["ndcg_at_10"] < float(
            expect["min_ndcg_at_10"]
        ):
            errors.append(
                f"ndcg@10={metrics['ndcg_at_10']} "
                f"expected>={expect['min_ndcg_at_10']}"
            )
        if "min_mrr" in expect and metrics["mrr"] < float(
            expect["min_mrr"]
        ):
            errors.append(
                f"mrr={metrics['mrr']} expected>={expect['min_mrr']}"
            )
    return errors, (metrics or {})


def _summarize(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(results)
    passed = sum(1 for item in results if item["passed"])
    violation_cases = sum(1 for item in results if item["violations"])
    latencies = [item["latency_ms"] for item in results]
    metric_names = (
        "recall_at_10",
        "recall_at_20",
        "precision_at_10",
        "ndcg_at_10",
        "mrr",
    )
    metric_averages = {}
    for name in metric_names:
        values = [
            item["metrics"][name]
            for item in results
            if item.get("metrics") and name in item["metrics"]
        ]
        if values:
            metric_averages[name + "_avg"] = round(
                sum(values) / len(values), 4
            )
    return {
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "pass_rate": round(passed / total, 4) if total else 0.0,
        "filter_violation_cases": violation_cases,
        "filter_violation_rate": (
            round(violation_cases / total, 4) if total else 0.0
        ),
        "avg_latency_ms": round(sum(latencies) / total, 1) if total else 0,
        "max_latency_ms": max(latencies) if latencies else 0,
        "ground_truth_cases": sum(
            1 for item in results if item.get("metrics")
        ),
        **metric_averages,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Run RAG retrieval benchmark.")
    parser.add_argument("--api-base", default="http://127.0.0.1:9200")
    parser.add_argument(
        "--suite",
        default="tests/benchmarks/rag_query_suite.json",
    )
    parser.add_argument("--timeout", type=float, default=180.0)
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    suite_path = Path(args.suite)
    cases = json.loads(suite_path.read_text(encoding="utf-8"))
    if not isinstance(cases, list):
        print("suite 必須是 JSON array", file=sys.stderr)
        return 1

    results: List[Dict[str, Any]] = []
    with httpx.Client(base_url=args.api_base.rstrip("/"), timeout=args.timeout) as client:
        for case in cases:
            question = str(case.get("question") or "")
            started = time.perf_counter()
            try:
                response = client.post(
                    "/api/rag/query", json={"question": question}
                )
                response.raise_for_status()
                payload = response.json()
            except Exception as exc:
                latency_ms = int((time.perf_counter() - started) * 1000)
                results.append(
                    {
                        "id": case.get("id") or question,
                        "question": question,
                        "passed": False,
                        "latency_ms": latency_ms,
                        "violations": [f"{exc.__class__.__name__}: {exc}"],
                        "answer_source": None,
                        "retrieval_mode": None,
                        "metrics": {},
                    }
                )
                print(f"FAIL {case.get('id') or question}: {exc}")
                continue
            latency_ms = int((time.perf_counter() - started) * 1000)
            errors, metrics = _check_case(case, payload, latency_ms)
            results.append(
                {
                    "id": case.get("id") or question,
                    "question": question,
                    "passed": not errors,
                    "latency_ms": latency_ms,
                    "violations": errors,
                    "answer_source": payload.get("answer_source"),
                    "retrieval_mode": (payload.get("retrieval") or {}).get(
                        "retrieval_mode"
                    ),
                    "judgments": len(payload.get("judgments") or []),
                    "total_matches": (payload.get("retrieval") or {}).get(
                        "total_matches"
                    ),
                    "metrics": metrics,
                }
            )
            status = "PASS" if not errors else "FAIL"
            print(f"{status} {case.get('id') or question} ({latency_ms} ms)")
            for error in errors:
                print(f"  - {error}")

    summary = _summarize(results)
    if summary["ground_truth_cases"] == 0:
        print(
            "警告：此 suite 沒有 relevant_jids／graded_relevance；"
            "只驗證 filter 與 routing，未計算 Recall/nDCG/MRR。"
        )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    output = {
        "api_base": args.api_base,
        "suite": str(suite_path),
        "summary": summary,
        "results": results,
    }
    if args.output:
        Path(args.output).write_text(
            json.dumps(output, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"written {args.output}")
    return 0 if summary["failed"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
