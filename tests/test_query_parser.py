from __future__ import annotations

from datetime import date

import pytest

from judgment.query_parser import (
    build_base_filter,
    build_query_filter,
    parse_judgment_query,
    violations,
)

CASES = [
    (
        "2000年至2010年在板橋地方法院相關詐騙的判決有那些",
        2000,
        2010,
        ["臺灣新北地方法院", "臺灣板橋地方法院"],
        ["詐欺"],
        True,
    ),
    (
        "民國95年到99年新北地院詐欺案件",
        2006,
        2010,
        ["臺灣新北地方法院", "臺灣板橋地方法院"],
        ["詐欺"],
        False,
    ),
    (
        "2007年士林地方法院的洗錢判決",
        2007,
        2007,
        ["臺灣士林地方法院"],
        ["洗錢"],
        False,
    ),
    (
        "台北地院 95~99年 詐欺",
        2006,
        2010,
        ["臺灣臺北地方法院"],
        ["詐欺"],
        False,
    ),
    ("詐騙判決有哪些", None, None, [], ["詐欺"], True),
    ("近5年的判決", None, None, [], [], False),
]


@pytest.mark.parametrize(
    "question,year_from,year_to,courts,topics,list_intent", CASES
)
def test_parse_judgment_query(
    question: str,
    year_from,
    year_to,
    courts,
    topics,
    list_intent: bool,
) -> None:
    parsed = parse_judgment_query(question)
    assert (parsed.year_from, parsed.year_to) == (year_from, year_to)
    assert parsed.courts == courts
    assert parsed.topics == topics
    assert parsed.list_intent is list_intent


def test_build_base_filter_is_optional_and_combined() -> None:
    assert build_base_filter(parse_judgment_query("詐騙判決有哪些")) is None

    parsed = parse_judgment_query("2000年至2010年板橋地院詐欺")
    query_filter = build_base_filter(parsed)
    assert query_filter is not None
    assert {"key": "court", "match": {"any": parsed.courts}} in (
        query_filter["must"]
    )
    range_condition = next(
        item for item in query_filter["must"] if item["key"] == "jdate_num"
    )
    assert range_condition["range"] == {
        "gte": 20000101,
        "lte": 20101231,
    }


def test_relative_two_years_becomes_absolute_date_filter() -> None:
    parsed = parse_judgment_query(
        "近二年證券違約交割的判決有那些?",
        today=date(2026, 11, 23),
    )
    assert parsed.date_from == "2024-11-23"
    assert parsed.date_to == "2026-11-23"
    assert parsed.has_filter is True
    assert parsed.to_dict()["date_from"] == "2024-11-23"

    query_filter = build_base_filter(parsed)
    assert query_filter is not None
    range_condition = next(
        item for item in query_filter["must"] if item["key"] == "jdate_num"
    )
    assert range_condition["range"] == {
        "gte": 20241123,
        "lte": 20261123,
    }


def test_relative_range_violations_use_exact_dates() -> None:
    parsed = parse_judgment_query(
        "最近兩年判決",
        today=date(2026, 11, 23),
    )
    assert violations({"jdate": "20141020"}, parsed) == ["date=20141020"]
    assert violations({"jdate": "20250101"}, parsed) == []
    assert violations({"jdate": "20261123"}, parsed) == []


class FakeFacetStore:
    def __init__(self, titles):
        self.titles = titles
        self.calls = []

    def facet(self, collection, key, *, query_filter=None, limit=500, exact=True):
        self.calls.append(
            {
                "collection": collection,
                "key": key,
                "query_filter": query_filter,
                "limit": limit,
            }
        )
        return [{"value": title, "count": 1} for title in self.titles]


def test_build_query_filter_uses_dynamic_titles_without_hardcoded_list() -> None:
    parsed = parse_judgment_query("2000年至2010年板橋地院詐騙判決")
    store = FakeFacetStore(["詐欺", "詐欺等", "加重詐欺等", "本票裁定"])
    query_filter, meta = build_query_filter(store, "judgments_v003", parsed)

    assert query_filter is not None
    title_condition = next(
        item for item in query_filter["must"] if item["key"] == "title"
    )
    assert title_condition["match"]["any"] == [
        "加重詐欺等",
        "詐欺",
        "詐欺等",
    ]
    assert meta["titles"] == ["加重詐欺等", "詐欺", "詐欺等"]
    assert meta["title_unresolved"] is False
    assert store.calls[0]["query_filter"] == build_base_filter(parsed)


def test_build_query_filter_reports_unresolved_titles() -> None:
    parsed = parse_judgment_query("2000年至2010年板橋地院洗錢判決")
    store = FakeFacetStore(["詐欺", "本票裁定"])
    query_filter, meta = build_query_filter(store, "judgments_v003", parsed)

    assert query_filter is not None
    assert not any(
        item["key"] == "title" for item in query_filter["must"]
    )
    assert meta["title_unresolved"] is True


def test_violations_use_or_semantics_for_topics() -> None:
    parsed = parse_judgment_query("2000年至2010年板橋地院詐欺洗錢")
    ok = {
        "jdate": "20070504",
        "court": "臺灣新北地方法院",
        "title": "詐欺等",
    }
    assert violations(ok, parsed) == []

    bad = {
        "jdate": "20260706",
        "court": "臺灣新竹地方法院",
        "title": "本票裁定",
    }
    assert len(violations(bad, parsed)) == 3


def test_parser_recognizes_appellate_and_supreme_courts() -> None:
    supreme = parse_judgment_query("最高法院的詐欺判決")
    assert supreme.courts == ["最高法院"]
    high = parse_judgment_query("高等法院的詐欺判決")
    assert "臺灣高等法院" in high.courts


def test_query_variants_parse_the_same_hard_conditions() -> None:
    variants = [
        "2000年至2010年在板橋地方法院相關詐騙的判決有那些",
        "板橋地院在 2000 至 2010 年間有哪些詐騙案件？",
        "涉及詐欺的板橋地院判決，時間限定在 2000–2010 年",
    ]
    for question in variants:
        parsed = parse_judgment_query(question)
        assert (parsed.year_from, parsed.year_to) == (2000, 2010)
        assert parsed.courts == [
            "臺灣新北地方法院",
            "臺灣板橋地方法院",
        ]
        assert parsed.topics == ["詐欺"]


def test_before_rename_variant_keeps_court_and_topic_but_has_no_year() -> None:
    parsed = parse_judgment_query(
        "新北地院改制前，板橋地院的詐欺案件有哪些？"
    )
    assert parsed.year_from is None
    assert parsed.courts == [
        "臺灣新北地方法院",
        "臺灣板橋地方法院",
    ]
    assert parsed.topics == ["詐欺"]
