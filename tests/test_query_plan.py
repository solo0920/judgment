from __future__ import annotations

from judgment.query_parser import parse_judgment_query
from judgment.query_plan import build_query_plan


def _plan(question: str, *, query_filter: bool, list_hint: bool, law: bool = False):
    return build_query_plan(
        parsed_query=parse_judgment_query(question),
        query_filter=query_filter,
        judgment_list_hint=list_hint,
        law_first_hint=law,
        rerank_available=True,
    )


def test_query_plan_structured_judgment_list() -> None:
    plan = _plan(
        "2000年至2010年板橋地院詐欺判決有哪些",
        query_filter=True,
        list_hint=True,
    )
    assert plan.intent == "judgment_list"
    assert plan.structured is True
    assert plan.enumerate is True
    assert plan.dense is False
    assert plan.lexical is False


def test_query_plan_structured_semantic() -> None:
    plan = _plan(
        "2007年板橋地院詐欺判決的爭點",
        query_filter=True,
        list_hint=False,
    )
    assert plan.intent == "structured_semantic"
    assert plan.structured is True
    assert plan.dense is True
    assert plan.lexical is True
    assert plan.enumerate is False


def test_query_plan_law_first() -> None:
    plan = _plan(
        "銀行法對從業人員有哪些規定",
        query_filter=False,
        list_hint=False,
        law=True,
    )
    assert plan.intent == "law_first"
    assert plan.dense is True
    assert plan.lexical is True


def test_query_plan_semantic() -> None:
    plan = _plan("第三人詐欺的舉證責任", query_filter=False, list_hint=False)
    assert plan.intent == "semantic"
    assert plan.structured is False
    assert plan.enumerate is False


def test_query_plan_can_disable_lexical_rrf() -> None:
    plan = build_query_plan(
        parsed_query=parse_judgment_query("第三人詐欺的舉證責任"),
        query_filter=False,
        judgment_list_hint=False,
        law_first_hint=False,
        rerank_available=True,
        lexical_available=False,
    )
    assert plan.lexical is False
