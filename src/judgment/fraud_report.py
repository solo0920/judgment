from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, Mapping, Sequence

from judgment.fraud_stats import (
    clopper_pearson,
    coverage_monte_carlo,
    hypergeom_upper_bound,
)

TIER1_UPPER = 0.67
TIER3_LOWER = 0.83


def decide_tier(coverage_lower: float, coverage_upper: float) -> str:
    """Apply the pre-registered Coverage thresholds."""

    if coverage_upper < TIER1_UPPER:
        return "tier1"
    if coverage_lower >= TIER3_LOWER:
        return "tier3"
    return "tier2_or_undecided"


@dataclass(frozen=True)
class StratumCounts:
    n: int
    loose: int
    strict: int
    grade1: int
    grade2: int


def _counts(records: Iterable[Mapping[str, object]]) -> StratumCounts:
    items = list(records)
    return StratumCounts(
        n=len(items),
        loose=sum(1 for item in items if int(item["grade"]) >= 1),
        strict=sum(1 for item in items if bool(item["fraud_conviction"])),
        grade1=sum(1 for item in items if int(item["grade"]) == 1),
        grade2=sum(1 for item in items if int(item["grade"]) == 2),
    )


def summarize_strata(
    annotations: Sequence[Mapping[str, object]],
) -> Dict[str, StratumCounts]:
    strata: Dict[str, list[Mapping[str, object]]] = {
        "A": [],
        "B": [],
        "C1": [],
        "C2": [],
        "T": [],
    }
    for item in annotations:
        stratum = str(item["sampling_stratum"])
        if stratum not in strata:
            raise ValueError(f"unexpected sampling_stratum: {stratum}")
        strata[stratum].append(item)
    return {key: _counts(value) for key, value in strata.items()}


def build_report(
    annotations: Sequence[Mapping[str, object]],
    *,
    c2_population: int = 1_266,
    title_hits: int = 210,
    draws: int = 10_000,
    seed: int = 42,
) -> Dict[str, object]:
    """Aggregate formal annotations into T and Title-filter Coverage.

    ``annotations`` must contain only formal primary and title-precision
    records; pilot and phase-2 records are excluded by the caller.
    """

    counts = summarize_strata(annotations)
    required = ("A", "B", "C1", "C2", "T")
    if any(counts[key].n == 0 for key in required):
        missing = [key for key in required if counts[key].n == 0]
        raise ValueError(f"missing annotation strata: {missing}")

    fixed_loose = counts["A"].loose + counts["B"].loose + counts["C1"].loose
    fixed_strict = counts["A"].strict + counts["B"].strict + counts["C1"].strict
    c2_loose = counts["C2"].loose
    c2_strict = counts["C2"].strict
    title_loose = counts["T"].loose
    title_strict = counts["T"].strict

    t_loose = fixed_loose + c2_population * (c2_loose / counts["C2"].n)
    t_strict = fixed_strict + c2_population * (c2_strict / counts["C2"].n)
    p_title_loose = title_loose / counts["T"].n
    p_title_strict = title_strict / counts["T"].n
    loose_defined = bool(title_loose or t_loose)
    strict_defined = bool(title_strict or t_strict)
    coverage_loose = (
        title_hits * p_title_loose
        / (title_hits * p_title_loose + t_loose)
        if loose_defined
        else None
    )
    coverage_strict = (
        title_hits * p_title_strict
        / (title_hits * p_title_strict + t_strict)
        if strict_defined
        else None
    )

    interval = coverage_monte_carlo(
        title_loose=(title_loose, counts["T"].n),
        title_strict=(title_strict, counts["T"].n),
        c2_loose=(c2_loose, counts["C2"].n, c2_population),
        c2_strict=(c2_strict, counts["C2"].n, c2_population),
        fixed_loose=fixed_loose,
        fixed_strict=fixed_strict,
        title_hits=title_hits,
        draws=draws,
        seed=seed,
    )
    title_loose_cp = clopper_pearson(title_loose, counts["T"].n)
    title_strict_cp = clopper_pearson(title_strict, counts["T"].n)
    c2_loose_upper = hypergeom_upper_bound(
        c2_population, counts["C2"].n, c2_loose, alpha=0.025
    )
    c2_strict_upper = hypergeom_upper_bound(
        c2_population, counts["C2"].n, c2_strict, alpha=0.025
    )

    return {
        "strata": {
            key: {
                "n": value.n,
                "loose": value.loose,
                "strict": value.strict,
                "grade1": value.grade1,
                "grade2": value.grade2,
            }
            for key, value in counts.items()
        },
        "t_loose": round(t_loose, 4),
        "t_strict": round(t_strict, 4),
        "p_title_loose": round(p_title_loose, 6),
        "p_title_strict": round(p_title_strict, 6),
        "title_loose_interval": {
            "lower": round(title_loose_cp[0], 6),
            "upper": round(title_loose_cp[1], 6),
        },
        "title_strict_interval": {
            "lower": round(title_strict_cp[0], 6),
            "upper": round(title_strict_cp[1], 6),
        },
        "c2_loose_upper_count": c2_loose_upper,
        "c2_loose_upper_ratio": round(c2_loose_upper / c2_population, 6),
        "c2_strict_upper_count": c2_strict_upper,
        "c2_strict_upper_ratio": round(c2_strict_upper / c2_population, 6),
        "coverage_loose": (
            round(coverage_loose, 6) if coverage_loose is not None else None
        ),
        "coverage_strict": (
            round(coverage_strict, 6) if coverage_strict is not None else None
        ),
        "coverage_loose_interval": (
            {
                "lower": round(interval.loose_lower, 6),
                "upper": round(interval.loose_upper, 6),
            }
            if loose_defined
            else {"lower": None, "upper": None}
        ),
        "coverage_strict_interval": (
            {
                "lower": round(interval.strict_lower, 6),
                "upper": round(interval.strict_upper, 6),
            }
            if strict_defined
            else {"lower": None, "upper": None}
        ),
        "decision": (
            decide_tier(interval.loose_lower, interval.loose_upper)
            if loose_defined
            else "undefined"
        ),
        "draws": draws,
        "seed": seed,
    }
