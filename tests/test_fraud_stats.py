from __future__ import annotations

import random

import pytest

from judgment.fraud_sampling import (
    assign_case_ids,
    jid_digest,
    pilot_sample,
    sample_sorted,
    sort_by_jid,
)
from judgment.fraud_stats import (
    clopper_pearson,
    coverage_monte_carlo,
    hypergeom_posterior_weights,
    hypergeom_upper_bound,
)


def test_hypergeom_two_sided_upper_bounds_match_spec() -> None:
    assert hypergeom_upper_bound(1266, 50, 0, alpha=0.025) == 88
    assert hypergeom_upper_bound(1266, 30, 0, alpha=0.025) == 144
    assert hypergeom_upper_bound(1266, 50, 0, alpha=0.05) == 72


def test_clopper_pearson_zero_and_midpoint() -> None:
    lower, upper = clopper_pearson(0, 30)
    assert lower == 0.0
    assert upper == pytest.approx(0.115703, abs=1e-5)

    lower, upper = clopper_pearson(15, 30)
    assert lower == pytest.approx(0.31297, abs=1e-5)
    assert upper == pytest.approx(0.68703, abs=1e-5)


def test_hypergeom_posterior_sums_to_one() -> None:
    weights = hypergeom_posterior_weights(200, 20, 0)
    assert sum(weights) == pytest.approx(1.0, abs=1e-9)
    assert weights[0] > weights[1] > weights[2]


def test_coverage_monte_carlo_is_deterministic_and_bounded() -> None:
    first = coverage_monte_carlo(
        title_loose=(30, 30),
        title_strict=(30, 30),
        c2_loose=(0, 50, 1266),
        c2_strict=(0, 50, 1266),
        fixed_loose=50,
        fixed_strict=50,
        draws=2000,
        seed=42,
    )
    second = coverage_monte_carlo(
        title_loose=(30, 30),
        title_strict=(30, 30),
        c2_loose=(0, 50, 1266),
        c2_strict=(0, 50, 1266),
        fixed_loose=50,
        fixed_strict=50,
        draws=2000,
        seed=42,
    )
    assert first == second
    assert 0.75 < first.loose_lower <= first.loose_upper < 0.85
    assert 0.75 < first.strict_lower <= first.strict_upper < 0.85


def _items() -> list[dict[str, str]]:
    return [{"jid": f"PCDM,95,訴,{index},20070504,3"} for index in range(20)]


def test_sample_sorted_ignores_input_order() -> None:
    items = _items()
    shuffled = list(items)
    random.Random(7).shuffle(shuffled)
    assert [item["jid"] for item in sample_sorted(items, 5, seed=42)] == [
        item["jid"] for item in sample_sorted(shuffled, 5, seed=42)
    ]


def test_assign_case_ids_is_reproducible_and_opaque() -> None:
    items = _items()
    shuffled = list(items)
    random.Random(9).shuffle(shuffled)
    first = assign_case_ids(items, seed=42)
    second = assign_case_ids(shuffled, seed=42)
    assert [item["case_id"] for item in first] == [
        item["case_id"] for item in second
    ]
    assert [item["jid"] for item in first] == [
        item["jid"] for item in second
    ]
    assert first[0]["case_id"] == "case_0001"


def test_jid_digest_is_order_independent() -> None:
    assert jid_digest(["b", "a"]) == jid_digest(["a", "b"])


def test_pilot_sample_uses_census_strata_only() -> None:
    strata = {
        "A": _items(),
        "B": _items(),
        "C1": _items(),
    }
    pilot = pilot_sample(strata, {"A": 3, "B": 2, "C1": 1}, seed=43)
    assert len(pilot) == 6
    assert [item["jid"] for item in pilot] == [
        item["jid"] for item in sort_by_jid(pilot)
    ]
