from __future__ import annotations

import importlib.util
import sys
from collections import Counter
from pathlib import Path
from types import ModuleType
from typing import Any, Dict

import pytest

from judgment.legal_terms import LEGAL_TERM_REGISTRY

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"


def _load_script(name: str) -> ModuleType:
    path = SCRIPTS / name
    spec = importlib.util.spec_from_file_location(f"test_{name}", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(scope="module")
def evidence_module() -> ModuleType:
    return _load_script("legal_term_evidence.py")


@pytest.fixture(scope="module")
def priority_module() -> ModuleType:
    return _load_script("legal_term_priority.py")


@pytest.fixture(scope="module")
def ground_truth_module() -> ModuleType:
    return _load_script("legal_term_ground_truth_candidates.py")


@pytest.fixture(scope="module")
def benchmark_module() -> ModuleType:
    return _load_script("legal_term_trgm_benchmark.py")


@pytest.fixture(scope="module")
def expansion_probe_module() -> ModuleType:
    return _load_script("legal_term_expansion_probe.py")


def _term_template(
    evidence_module: ModuleType,
    term_name: str,
) -> Dict[str, Any]:
    return evidence_module._term_template(
        LEGAL_TERM_REGISTRY[term_name],
        "snapshot",
        "2026-11-16T00:00:00+00:00",
    )


def test_length_buckets(evidence_module: ModuleType) -> None:
    assert evidence_module._length_bucket("洗錢") == "2"
    assert evidence_module._length_bucket("假交易") == "3"
    assert evidence_module._length_bucket("違約交割") == "4-5"
    assert evidence_module._length_bucket("中小企業信用保證") == "6-8"
    assert evidence_module._length_bucket("董事違反善良管理人注意義務") == "9+"


def test_variant_index_counts_contained_terms_without_double_counting(
    evidence_module: ModuleType,
) -> None:
    names = [
        "洗錢",
        "分層洗錢",
        "非法吸金",
        "財報不實",
        "財務報告虛偽記載",
        "違約交割",
        "內線交易",
        "期貨內線交易",
    ]
    terms = [LEGAL_TERM_REGISTRY[name] for name in names]
    variant_to_term, closure, pattern = evidence_module._variant_index(terms)

    assert pattern.search("違約不履行交割").group(0) == "違約不履行交割"
    assert evidence_module._match_term_counts(
        "違約不履行交割", variant_to_term, closure
    ) == {"違約交割": 1}
    assert evidence_module._match_term_counts(
        "分層洗錢", variant_to_term, closure
    ) == {"分層洗錢": 1, "洗錢": 1}
    assert evidence_module._match_term_counts(
        "非法吸金", variant_to_term, closure
    ) == {"非法吸金": 1}
    assert evidence_module._match_term_counts(
        "期貨內線交易", variant_to_term, closure
    ) == {"期貨內線交易": 1, "內線交易": 1}
    counts = evidence_module._match_term_counts(
        "財務報告虛偽記載", variant_to_term, closure
    )
    assert counts["財務報告虛偽記載"] == 1
    assert counts["財報不實"] == 1


def test_bottom_k_sampler_is_order_independent(
    evidence_module: ModuleType,
) -> None:
    first = evidence_module._BottomKSampler("term", 10, 42)
    second = evidence_module._BottomKSampler("term", 10, 42)
    for index in range(100):
        first.add(str(index), {"jid": str(index)})
    for index in reversed(range(100)):
        second.add(str(index), {"jid": str(index)})
    assert [record["jid"] for record in first.records()] == [
        record["jid"] for record in second.records()
    ]
    assert len(first.records()) == 10
    assert evidence_module._BottomKSampler("term", 0, 42).records() == []


def test_finalize_item_computes_diversity_and_estimates(
    evidence_module: ModuleType,
) -> None:
    item = _term_template(evidence_module, "違約交割")
    item["document_frequency"] = 10
    item["occurrence_count"] = 25
    item["court_distribution"] = Counter({"A": 7, "B": 3})
    item["year_distribution"] = Counter({"2019": 6, "2020": 4})
    item["title_distribution"] = Counter({"T1": 8, "T2": 2})
    evidence_module._finalize_item(item, sample_fraction=0.5, top_n=1)

    assert item["term_density"] == 2.5
    assert item["estimated_full_corpus_df"] == 20
    assert item["court_diversity"] == 2
    assert item["court_other_count"] == 3
    assert item["title_diversity"] == 2
    assert item["title_other_count"] == 2
    assert item["year_coverage"] == 2
    assert item["year_min"] == "2019"
    assert item["year_max"] == "2020"
    assert item["sample_support"] == "insufficient_sample"


def test_derive_negative_candidates_prefers_same_title(
    evidence_module: ModuleType,
) -> None:
    target = _term_template(evidence_module, "違約交割")
    sibling = _term_template(evidence_module, "內線交易")
    target["category"] = "securities_capital_markets"
    sibling["category"] = "securities_capital_markets"
    target["document_frequency"] = 5
    target["title_distribution"] = Counter({"T": 5})
    target["court_distribution"] = Counter({"C": 5})
    target["year_distribution"] = Counter({"2020": 5})
    sibling["positive_jid_candidates"] = [
        {
            "jid": "J1",
            "court": "C",
            "year": "2020",
            "title": "T",
            "document_terms": ["內線交易"],
            "document_terms_truncated": False,
        }
    ]
    evidence = {"違約交割": target, "內線交易": sibling}
    evidence_module._derive_negative_candidates(evidence, size=5, seed=42)
    negatives = target["negative_jid_candidates"]
    assert len(negatives) == 1
    assert negatives[0]["jid"] == "J1"
    assert "same_title" in negatives[0]["reason"]


def test_priority_specificity_and_tiers(priority_module: ModuleType) -> None:
    generic, _ = priority_module._specificity_score(
        "侵權行為損害賠償", "civil_contract_debt"
    )
    financial, _ = priority_module._specificity_score(
        "違約交割", "securities_capital_markets"
    )
    assert financial > generic

    item = {
        "document_frequency": 100,
        "estimated_full_corpus_df": 2000,
        "occurrence_count": 300,
        "term_density": 3.0,
        "paragraph_frequency": 250,
        "court_diversity": 15,
        "year_coverage": 15,
        "title_diversity": 8,
        "title_distribution": {"T": 100},
        "positive_jid_sample_size": 50,
        "negative_jid_sample_size": 10,
        "sample_support": "proxy_supported",
    }
    assert priority_module._coverage_score(0) == 0.0
    assert priority_module._coverage_score(10_000) == 40.0
    assert priority_module._discrimination_score(item) == 13.0
    assert (
        priority_module._tier_and_action(
            "違約交割", item, active=False, score=90.0
        )[0]
        == "P0_review_now"
    )
    assert (
        priority_module._tier_and_action(
            "侵權行為損害賠償", item, active=False, score=90.0
        )[0]
        == "P1_review_next"
    )
    assert (
        priority_module._tier_and_action(
            "違約交割", {"document_frequency": 0}, active=False, score=0.0
        )[0]
        == "P3_hold_no_data"
    )
    flags = priority_module._risk_flags(
        "侵權行為損害賠償", item, top_title_share=0.5
    )
    assert "generic_civil_broad" in flags
    assert "not_legal_reviewed" in flags


def test_priority_build_row_keeps_dense_complement_pending(
    priority_module: ModuleType,
) -> None:
    term = LEGAL_TERM_REGISTRY["中小企業信用保證"]
    item = {
        "document_frequency": 100,
        "estimated_full_corpus_df": 2000,
        "occurrence_count": 300,
        "term_density": 3.0,
        "paragraph_frequency": 250,
        "court_diversity": 15,
        "year_coverage": 15,
        "title_diversity": 8,
        "title_distribution": {"T": 100},
        "positive_jid_sample_size": 50,
        "negative_jid_sample_size": 10,
        "sample_support": "proxy_supported",
    }
    row = priority_module._build_row(
        term, item, evidence_snapshot_id="snapshot"
    )
    assert row["term"] == "中小企業信用保證"
    assert row["dense_complement_status"] == "pending_dense_benchmark"
    assert row["dense_complement_score"] == ""
    assert row["priority_tier"] == "P0_review_now"
    assert row["rationale"]
    assert row["review_status"] == "engineering_pending"


def test_ground_truth_candidate_shapes(ground_truth_module: ModuleType) -> None:
    positive = ground_truth_module._positive_candidate(
        "id:positive:J",
        {
            "jid": "J",
            "court": "C",
            "year": "2020",
            "title": "T",
            "occurrences": 3,
            "paragraphs": 2,
            "matched_variants": ["違約交割"],
        },
        "snapshot",
    )
    assert positive["candidate_role"] == "positive_exact_proxy"
    assert positive["relevance_label"] == ""
    assert positive["promotion_allowed"] is False
    negative = ground_truth_module._negative_candidate(
        "id:negative:J",
        {
            "jid": "J",
            "court": "C",
            "year": "2020",
            "title": "T",
            "sibling_terms": ["內線交易"],
            "reason": "same_title_exact_miss_proxy",
            "score": 8,
        },
        "snapshot",
    )
    assert negative["candidate_role"] == "negative_confuser_proxy"
    assert negative["label_status"] == "unlabeled"
    assert ground_truth_module._recommended_next_step(
        positive_count=20,
        negative_count=5,
        proxy_ready=True,
        active=False,
    ) == "human_review_then_abc_benchmark"
    assert ground_truth_module._recommended_next_step(
        positive_count=0,
        negative_count=0,
        proxy_ready=False,
        active=False,
    ) == "hold_no_proxy_data"
    assert ground_truth_module._query_templates("違約交割")["term_query"]


def test_expansion_probe_scope_and_recall(
    expansion_probe_module: ModuleType,
) -> None:
    scope = expansion_probe_module._scope_for_term(
        {
            "positive_jid_candidates": [
                {
                    "jid": "A",
                    "court": "C",
                    "year": "2020",
                },
                {
                    "jid": "B",
                    "court": "C",
                    "year": "2021",
                },
                {
                    "jid": "D",
                    "court": "D",
                    "year": "2022",
                },
            ]
        }
    )
    assert scope["court"] == "C"
    assert scope["year_from"] == 2020
    assert scope["year_to"] == 2021
    assert scope["relevant_jids"] == ["A", "B"]
    hits = [
        {"payload": {"jid": "A"}},
        {"payload": {"jid": "X"}},
        {"payload": {"jid": "B"}},
    ]
    assert expansion_probe_module._recall_at(hits, {"A", "B"}, 2) == 0.5
    assert expansion_probe_module._precision_at(hits, {"A", "B"}, 3) == 0.6667


def test_benchmark_plan_parsing_and_selection(
    benchmark_module: ModuleType,
) -> None:
    assert benchmark_module._percentile([1, 2, 3, 4], 0.5) == 2.5
    payload = [
        {
            "Plan": {
                "Node Type": "Aggregate",
                "Shared Hit Blocks": 10,
                "Shared Read Blocks": 2,
                "Plans": [
                    {
                        "Node Type": "Bitmap Heap Scan",
                        "Actual Rows": 7,
                        "Plans": [
                            {
                                "Node Type": "Bitmap Index Scan",
                                "Index Name": benchmark_module.BENCH_INDEX,
                                "Actual Rows": 20,
                            }
                        ],
                    }
                ],
            },
            "Execution Time": 1.5,
            "Planning Time": 0.2,
        }
    ]
    parsed = benchmark_module._parse_plan(
        payload,
        wall_ms=2.0,
        index_name=benchmark_module.BENCH_INDEX,
    )
    assert parsed["index_used"] is True
    assert parsed["planner"] == "bitmap_index"
    assert parsed["matched_rows"] == 7
    assert parsed["index_scan_rows"] == 20
    assert parsed["execution_ms"] == 1.5

    terms, metadata = benchmark_module._select_terms(
        explicit="違約交割,洗錢",
        evidence={},
        per_bucket=1,
        max_terms=10,
    )
    assert [term.key for term in terms] == ["違約交割", "洗錢"]
    assert len(metadata) == 2
    with pytest.raises(SystemExit):
        benchmark_module._select_terms(
            explicit="不存在",
            evidence={},
            per_bucket=1,
            max_terms=10,
        )
