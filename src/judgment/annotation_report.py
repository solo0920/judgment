from __future__ import annotations

from collections import Counter
from typing import Dict, Iterable, List, Mapping, Sequence

from judgment.fraud_stats import clopper_pearson

DISAGREEMENT_FIELDS = (
    "grade",
    "primary_offence",
    "fraud_conviction",
    "evidence_section",
)


def _by_case(records: Iterable[Mapping[str, object]]) -> Dict[str, Mapping[str, object]]:
    result: Dict[str, Mapping[str, object]] = {}
    for record in records:
        case_id = str(record.get("case_id") or "")
        if not case_id:
            raise ValueError("annotation is missing case_id")
        if case_id in result:
            raise ValueError(f"duplicate annotation for {case_id}")
        result[case_id] = record
    return result


def _grade_counts(records: Sequence[Mapping[str, object]]) -> Dict[str, int]:
    counts = Counter(int(record["grade"]) for record in records)
    return {str(grade): counts.get(grade, 0) for grade in (0, 1, 2)}


def summarize_pilot(
    annotator_1: Sequence[Mapping[str, object]],
    annotator_2: Sequence[Mapping[str, object]],
) -> Dict[str, object]:
    first = _by_case(annotator_1)
    second = _by_case(annotator_2)
    if set(first) != set(second):
        raise ValueError("annotators did not annotate the same pilot cases")
    disagreements: List[Dict[str, object]] = []
    for case_id in sorted(first):
        left = first[case_id]
        right = second[case_id]
        fields = [
            field
            for field in DISAGREEMENT_FIELDS
            if left.get(field) != right.get(field)
        ]
        if not fields:
            continue
        disagreements.append(
            {
                "case_id": case_id,
                "annotator_1_grade": left.get("grade"),
                "annotator_2_grade": right.get("grade"),
                "annotator_1_primary_offence": left.get(
                    "primary_offence"
                ),
                "annotator_2_primary_offence": right.get(
                    "primary_offence"
                ),
                "disagreement": "|".join(fields),
                "rule_question": "",
                "resolution": "",
            }
        )
    return {
        "cases": len(first),
        "annotator_1_grades": _grade_counts(list(first.values())),
        "annotator_2_grades": _grade_counts(list(second.values())),
        "disagreement_count": len(disagreements),
        "disagreements": disagreements,
    }


def summarize_title_precision(
    records: Sequence[Mapping[str, object]],
    *,
    title_hits: int = 210,
    alpha: float = 0.05,
) -> Dict[str, object]:
    title_records = [
        record
        for record in records
        if str(record.get("sample_source") or "") == "title_precision"
        or str(record.get("sampling_stratum") or "") == "T"
    ]
    if len(title_records) != 30:
        raise ValueError(
            f"expected 30 title-precision annotations, got {len(title_records)}"
        )
    loose = sum(1 for record in title_records if int(record["grade"]) >= 1)
    strict = sum(
        1 for record in title_records if bool(record["fraud_conviction"])
    )
    loose_interval = clopper_pearson(loose, len(title_records), alpha=alpha)
    strict_interval = clopper_pearson(strict, len(title_records), alpha=alpha)
    p_loose = loose / len(title_records)
    p_strict = strict / len(title_records)
    return {
        "n": len(title_records),
        "loose_count": loose,
        "strict_count": strict,
        "p_title_loose": round(p_loose, 6),
        "p_title_strict": round(p_strict, 6),
        "p_title_loose_interval": {
            "lower": round(loose_interval[0], 6),
            "upper": round(loose_interval[1], 6),
        },
        "p_title_strict_interval": {
            "lower": round(strict_interval[0], 6),
            "upper": round(strict_interval[1], 6),
        },
        "projected_title_hits_loose": round(title_hits * p_loose, 2),
        "projected_title_hits_strict": round(title_hits * p_strict, 2),
        "alpha": alpha,
    }
