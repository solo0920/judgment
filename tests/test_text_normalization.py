from __future__ import annotations

import pytest

from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    normalize_for_match,
    normalize_with_offsets,
    resolve_evidence_span,
)


def test_normalize_removes_unicode_whitespace_and_invisibles() -> None:
    raw = "詐\r\n欺 取\u3000財\u00a0罪\u200b。"
    assert normalize_for_match(raw) == "詐欺取財罪。"


def test_normalize_removes_table_separators() -> None:
    raw = "詐│\r\n│欺取財罪"
    assert normalize_for_match(raw) == "詐欺取財罪"


def test_normalize_preserves_non_whitespace_text() -> None:
    raw = "主文：被告犯詐欺取財罪。"
    assert normalize_for_match(raw) == raw


def test_offsets_map_crlf_span_back_to_raw() -> None:
    raw = "主文：被告犯詐\r\n欺取財罪，處有期徒刑。"
    normalized = normalize_with_offsets(raw)
    start = normalized.text.index("詐欺取財罪")
    raw_start, raw_end = normalized.raw_span(start, start + 5)
    assert raw[raw_start:raw_end] == "詐\r\n欺取財罪"
    assert normalized.text[start : start + 5] == "詐欺取財罪"


def test_resolve_evidence_span_prefers_normalized_quote() -> None:
    raw = "主文：被告犯詐\r\n欺取財罪。"
    span = resolve_evidence_span(raw, "詐欺取財罪")
    assert span.raw_quote == "詐\r\n欺取財罪"
    assert span.normalized_quote == "詐欺取財罪"
    assert span.normalization_version == NORMALIZATION_VERSION


def test_resolve_evidence_span_requires_disambiguation() -> None:
    raw = "詐\r\n欺取財罪。其後又論詐欺取財罪。"
    with pytest.raises(ValueError):
        resolve_evidence_span(raw, "詐欺取財罪")
    first = resolve_evidence_span(raw, "詐欺取財罪", raw_start=0)
    assert first.raw_start == 0
    second = resolve_evidence_span(raw, "詐欺取財罪", raw_start=12)
    assert second.raw_start == 12


def test_metadata_records_version_and_hash() -> None:
    normalized = normalize_with_offsets("詐\r\n欺")
    metadata = normalized.metadata()
    assert metadata["normalization_version"] == NORMALIZATION_VERSION
    assert len(metadata["full_text_sha256"]) == 64
    assert metadata["raw_length"] == 4
    assert metadata["normalized_length"] == 2
