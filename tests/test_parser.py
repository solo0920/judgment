from __future__ import annotations

import pytest

from judgment.law_download.parser import LawParseError, parse_dataset

from .helpers import law, payload, source


def test_parse_dataset_extracts_metadata_and_articles() -> None:
    data = payload(
        [
            law("銀行法", "https://law.test/L0001", "銀行法第一條"),
            law("保險法", "https://law.test/L0002", "保險法第一條"),
        ]
    )

    parsed = parse_dataset(data, source())

    assert parsed.law_count == 2
    assert parsed.article_count == 2
    assert parsed.update_date == "2026/10/30 上午 12:00:00"
    assert parsed.semantic_sha256
    assert len(parsed.semantic_sha256) == 64
    assert {record.law_name for record in parsed.laws} == {"銀行法", "保險法"}

    bank = next(record for record in parsed.laws if record.law_name == "銀行法")
    assert bank.law_key == "https://law.test/L0001"
    assert bank.law_category == "金融法規"
    assert bank.law_has_eng_version is False
    assert bank.article_count == 1
    assert bank.law_articles[0]["article_type"] == "C"
    assert bank.law_articles[1]["article_content"] == "銀行法第一條"
    assert '"LawName":"銀行法"' in bank.raw_json


def test_semantic_hash_changes_when_article_changes() -> None:
    first = parse_dataset(
        payload([law("銀行法", "https://law.test/L0001", "舊條文")]), source()
    )
    second = parse_dataset(
        payload([law("銀行法", "https://law.test/L0001", "新條文")]), source()
    )

    assert first.semantic_sha256 != second.semantic_sha256
    assert first.laws[0].content_hash != second.laws[0].content_hash


def test_duplicate_law_url_is_rejected() -> None:
    data = payload(
        [
            law("銀行法", "https://law.test/L0001"),
            law("銀行法（重複）", "https://law.test/L0001"),
        ]
    )

    with pytest.raises(LawParseError, match="duplicate law key"):
        parse_dataset(data, source())


def test_payload_without_usable_laws_is_rejected() -> None:
    with pytest.raises(LawParseError, match="no usable law entries"):
        parse_dataset(payload([{"LawName": ""}]), source())
