from __future__ import annotations

from judgment.legal_terms import (
    LEGAL_TERM_CANDIDATES,
    LEGAL_TERM_REGISTRY,
    LEGAL_TERMS,
    REGISTRY_TERMS,
    detect_exact_terms,
    detect_expansion_terms,
    detect_legal_terms,
    expand_semantic_query,
    phrases_for_terms,
)


def test_detects_violation_of_settlement_term() -> None:
    terms = detect_legal_terms("士林地方法院 1995 到 2000 年違約交割有哪些案件")
    assert [term.key for term in terms] == ["違約交割"]
    assert "違約交割" in phrases_for_terms(terms)
    assert terms[0].review_status == "engineering_approved"
    assert terms[0].normalization_version == "remove-unicode-space-v2"
    assert "SLDV,89,訴,367,20000728" in terms[0].positive_jids
    assert terms[0].expansion_decision == "disabled"
    assert terms[0].expansion_enabled is False
    assert terms[0].expansion_evaluation["benchmark_version"] == "legal-term-benchmark-v1"


def test_does_not_treat_generic_penalty_as_settlement_term() -> None:
    assert detect_legal_terms("給付違約金的案件") == []


def test_detects_insider_trading_and_manipulation() -> None:
    assert [term.key for term in detect_legal_terms("內線交易")] == ["內線交易"]
    assert [term.key for term in detect_legal_terms("操縱股價")] == ["操縱股價"]


def test_exact_and_expansion_modes_are_separate() -> None:
    assert [term.key for term in detect_exact_terms("違約交割")] == ["違約交割"]
    assert detect_expansion_terms("違約交割") == []
    assert [
        term.key
        for term in detect_expansion_terms(
            "違約交割", include_disabled=True
        )
    ] == ["違約交割"]
    assert detect_exact_terms("給付違約金") == []


def test_expansion_prioritizes_high_confidence_terms() -> None:
    expanded, meta = expand_semantic_query(
        "違約交割的判決", limit=2, include_disabled=True
    )
    assert meta["enabled"] is True
    assert meta["expansion_terms"] == ["證券交易法", "交割款"]
    assert "違約交割" in expanded
    assert "證券交易法" in expanded


def test_expansion_limit_and_no_duplicate_terms() -> None:
    expanded, meta = expand_semantic_query(
        "人頭帳戶", limit=4, include_disabled=True
    )
    assert len(meta["expansion_terms"]) == 4
    assert len(set(meta["expansion_terms"])) == 4
    assert expanded.startswith("人頭帳戶")


def test_expansion_can_be_disabled_per_term() -> None:
    # 內線交易 is already a strong direct term; proxy measurement did not
    # improve when its expansion terms were added.
    expanded, meta = expand_semantic_query("內線交易", limit=4)
    assert meta["enabled"] is False
    assert expanded == "內線交易"
    term = detect_legal_terms("內線交易")[0]
    assert term.expansion_decision == "disabled"
    assert term.expansion_enabled is False


def test_registry_loads_429_terms_but_only_10_are_active() -> None:
    assert len(REGISTRY_TERMS) == 429
    assert len(LEGAL_TERMS) == 10
    assert len(LEGAL_TERM_CANDIDATES) == 419
    assert len(LEGAL_TERM_REGISTRY) == 429
    assert all(term.active for term in LEGAL_TERMS)
    assert all(not term.expansion_enabled for term in LEGAL_TERMS)
    assert all(not term.active for term in LEGAL_TERM_CANDIDATES)
    assert all(
        term.review_status == "engineering_pending"
        for term in LEGAL_TERM_CANDIDATES
    )
    assert all(
        not term.expansion_enabled for term in LEGAL_TERM_CANDIDATES
    )


def test_registry_has_unique_ids_and_categories() -> None:
    ids = [term.term_id for term in REGISTRY_TERMS]
    assert len(ids) == len(set(ids))
    categories = {term.legal_concept_category for term in REGISTRY_TERMS}
    assert "banking_deposit_credit" in categories
    assert "securities_capital_markets" in categories
    assert "insurance_contract_supervision" in categories
    assert "aml_cft_virtual_assets" in categories
