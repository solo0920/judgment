from __future__ import annotations

from judgment.rag_gate import evaluate_regression_gate


def test_regression_gate_passes_when_all_thresholds_met() -> None:
    result = evaluate_regression_gate(
        {
            "law_recall": 0.9,
            "article_recall": 0.8,
            "judgment_recall": 0.7,
            "citation_valid_rate": 1.0,
            "refusal_accuracy": 1.0,
            "duration_p95_ms": 5000,
        }
    )

    assert result["status"] == "pass"
    assert result["passed"] is True
    assert result["failed"] == 0


def test_regression_gate_fails_on_low_recall_and_high_latency() -> None:
    result = evaluate_regression_gate(
        {
            "law_recall": 0.5,
            "article_recall": 0.8,
            "judgment_recall": 0.7,
            "citation_valid_rate": 1.0,
            "refusal_accuracy": 1.0,
            "duration_p95_ms": 25000,
        }
    )

    assert result["status"] == "fail"
    assert result["passed"] is False
    assert result["failed"] == 2
    assert {check["key"] for check in result["checks"] if check["status"] == "fail"} == {
        "law_recall",
        "duration_p95_ms",
    }


def test_regression_gate_skips_missing_metrics() -> None:
    result = evaluate_regression_gate({"law_recall": 0.9})

    assert result["status"] == "pass"
    assert result["evaluated"] == 1
    assert any(check["status"] == "skipped" for check in result["checks"])
