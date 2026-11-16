from __future__ import annotations

import pytest

from judgment.fraud_report import build_report, decide_tier, summarize_strata


def _records(stratum: str, n: int, loose: int, strict: int) -> list[dict]:
    records = []
    for index in range(n):
        grade = 1 if index < loose else 0
        records.append(
            {
                "sampling_stratum": stratum,
                "grade": grade,
                "fraud_conviction": index < strict,
            }
        )
    return records


def _annotations() -> list[dict]:
    return (
        _records("A", 154, 100, 80)
        + _records("B", 79, 10, 5)
        + _records("C1", 79, 30, 20)
        + _records("C2", 50, 1, 1)
        + _records("T", 30, 28, 25)
    )


def test_summarize_strata() -> None:
    counts = summarize_strata(_annotations())
    assert counts["A"].n == 154
    assert counts["A"].loose == 100
    assert counts["A"].strict == 80
    assert counts["C2"].loose == 1
    assert counts["T"].strict == 25


def test_build_report_point_estimates() -> None:
    report = build_report(_annotations(), draws=1000)
    assert report["t_loose"] == pytest.approx(140 + 1266 * (1 / 50))
    assert report["t_strict"] == pytest.approx(105 + 1266 * (1 / 50))
    assert report["p_title_loose"] == pytest.approx(28 / 30)
    assert report["coverage_loose"] == pytest.approx(
        (210 * 28 / 30) / (210 * 28 / 30 + 140 + 1266 / 50)
    )
    interval = report["coverage_loose_interval"]
    assert 0 <= interval["lower"] <= interval["upper"] <= 1


def test_build_report_requires_all_strata() -> None:
    without_title = [
        record
        for record in _annotations()
        if record["sampling_stratum"] != "T"
    ]
    with pytest.raises(ValueError):
        build_report(without_title)


def test_build_report_marks_all_zero_coverage_undefined() -> None:
    zeros = (
        _records("A", 154, 0, 0)
        + _records("B", 75, 0, 0)
        + _records("C1", 82, 0, 0)
        + _records("C2", 50, 0, 0)
        + _records("T", 30, 0, 0)
    )
    report = build_report(zeros, draws=200)
    assert report["coverage_loose"] is None
    assert report["coverage_loose_interval"] == {
        "lower": None,
        "upper": None,
    }
    assert report["decision"] == "undefined"


def test_decide_tier_uses_preregistered_thresholds() -> None:
    assert decide_tier(0.40, 0.66) == "tier1"
    assert decide_tier(0.67, 0.84) == "tier2_or_undecided"
    assert decide_tier(0.84, 0.90) == "tier3"
    assert decide_tier(0.60, 0.70) == "tier2_or_undecided"
    assert decide_tier(0.80, 0.85) == "tier2_or_undecided"
