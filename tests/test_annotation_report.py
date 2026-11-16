from __future__ import annotations

import pytest

from judgment.annotation_report import (
    summarize_pilot,
    summarize_title_precision,
)


def _record(case_id: str, grade: int, offence: str = "fraud", conviction: bool = True):
    return {
        "case_id": case_id,
        "grade": grade,
        "primary_offence": offence,
        "fraud_conviction": conviction,
        "evidence_section": "main_text",
    }


def test_summarize_pilot_counts_disagreements() -> None:
    first = [
        _record("pilot_0001", 2),
        _record("pilot_0002", 1, "money_laundering", False),
        _record("pilot_0003", 0, "other", False),
    ]
    second = [
        _record("pilot_0001", 2),
        _record("pilot_0002", 0, "other", False),
        _record("pilot_0003", 0, "other", False),
    ]
    summary = summarize_pilot(first, second)
    assert summary["cases"] == 3
    assert summary["disagreement_count"] == 1
    assert summary["disagreements"][0]["case_id"] == "pilot_0002"
    assert "grade" in summary["disagreements"][0]["disagreement"]


def test_summarize_pilot_requires_same_cases() -> None:
    with pytest.raises(ValueError):
        summarize_pilot(
            [_record("a", 0)],
            [_record("b", 0)],
        )


def test_summarize_title_precision() -> None:
    records = []
    for index in range(30):
        records.append(
            {
                "sample_source": "title_precision",
                "sampling_stratum": "T",
                "grade": 1 if index < 28 else 0,
                "fraud_conviction": index < 25,
            }
        )
    summary = summarize_title_precision(records)
    assert summary["n"] == 30
    assert summary["loose_count"] == 28
    assert summary["strict_count"] == 25
    assert summary["p_title_loose"] == pytest.approx(28 / 30)
    assert summary["p_title_strict"] == pytest.approx(25 / 30)
    assert summary["projected_title_hits_loose"] == pytest.approx(196.0)
    assert summary["projected_title_hits_strict"] == pytest.approx(175.0)


def test_summarize_title_precision_requires_30() -> None:
    with pytest.raises(ValueError):
        summarize_title_precision([])
