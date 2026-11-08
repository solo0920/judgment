from __future__ import annotations

from judgment.courts import (
    canonical_court_prefix,
    court_from_jid,
    normalize_court,
)


def test_normalize_court_accepts_clean_names() -> None:
    assert normalize_court("臺灣臺北地方法院民事") == "臺灣臺北地方法院"
    assert normalize_court("臺灣高等法院臺中分院刑事") == "臺灣高等法院臺中分院"
    assert normalize_court("臺灣高雄少年及家事法院家事") == "臺灣高雄少年及家事法院"
    assert normalize_court("台北地方法院民事") == "臺灣臺北地方法院"


def test_normalize_court_ignores_spaces_in_header() -> None:
    full_text = "最  高  行  政  法  院  判  決\n114年度上字第193號"
    assert normalize_court("", full_text) == "最高行政法院"


def test_normalize_court_prefers_issuer_over_body_reference() -> None:
    raw = "月9日臺北高等行政法院112年度訴字第889號"
    full_text = "最  高  行  政  法  院  判  決\n114年度上字第193號"
    assert normalize_court(raw, full_text) == "最高行政法院"


def test_normalize_court_prefers_earliest_mention() -> None:
    full_text = (
        "桃園地方法院民事簡易判決\n114年度壢簡字第2146號\n"
        "原告莊春梅\n對造設臺灣臺北地方法院附近"
    )
    assert (
        normalize_court("桃園地方法院民事簡易", full_text)
        == "臺灣桃園地方法院"
    )


def test_normalize_court_recovers_masked_and_truncated_names() -> None:
    assert (
        normalize_court("○○臺南地方法院民事", "○○臺南地方法院民事裁定")
        == "臺灣臺南地方法院"
    )
    assert (
        normalize_court("臺灣臺中地方法民事", "臺灣臺中地方法民事裁定")
        == "臺灣臺中地方法院"
    )
    assert (
        normalize_court("臺臺灣高雄地方法院刑事", "臺臺灣高雄地方法院刑事判決")
        == "臺灣高雄地方法院"
    )


def test_normalize_court_uses_simple_court_and_jid_fallbacks() -> None:
    full_text = (
        "宣 示 判 決 筆 錄\n114年度湖小字第1189號\n"
        "上列當事人間事件，並於同日在內湖簡易庭簡易法庭公開宣示判決。"
    )
    assert normalize_court("公開宣示", full_text) == "臺灣士林地方法院"
    assert (
        normalize_court(
            "宣示",
            "宣示裁定筆錄\n115年度續收字第1989號\n在本院第十一法庭公開宣示裁定。",
            jid="TPTA,115,續收,1989,20260331,1",
        )
        == "臺北高等行政法院"
    )
    assert (
        normalize_court("", "", jid="KSYV,114,家,1,20260101,1")
        == "臺灣高雄少年及家事法院"
    )


def test_normalize_court_returns_empty_for_unknown() -> None:
    assert normalize_court("") == ""
    assert normalize_court("本院公開宣示", "本院公開宣示") == ""
    assert canonical_court_prefix("月9日臺北高等行政法院") == ""
    assert court_from_jid("UNKNOWN,1") == ""
