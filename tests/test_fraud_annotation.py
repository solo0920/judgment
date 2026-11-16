from __future__ import annotations

import pytest

from judgment.fraud_annotation import (
    derive_fraud_role,
    jid_suffix,
    resolve_evidence_offsets,
    validate_annotation,
)

M_JID = "PCDM,95,訴緝,201,20070504,3"
V_JID = "TPDV,109,司賠,123,20200101,1"


def _record(**overrides):
    record = {
        "case_id": "case_0001",
        "jid": M_JID,
        "sampling_stratum": "A",
        "sample_source": "primary",
        "is_pilot": False,
        "grade": 2,
        "primary_offence": "fraud",
        "fraud_conviction": True,
        "evidence_section": "main_text",
        "evidence_quote": "詐欺取財罪",
        "confidence": 0.95,
        "annotation_version": "v2.0",
    }
    record.update(overrides)
    return record


def test_jid_suffix() -> None:
    assert jid_suffix(M_JID) == "M"
    assert jid_suffix(V_JID) == "V"
    assert jid_suffix("UNKNOWN") == "unknown"


def test_derive_all_valid_combinations() -> None:
    assert derive_fraud_role(0, "other", False) == "mention_only"
    assert derive_fraud_role(1, "money_laundering", False) == "predicate_core"
    assert derive_fraud_role(1, "fraud", True) == "partial"
    assert derive_fraud_role(1, "fraud", False) == "peripheral"
    assert derive_fraud_role(1, "mixed", True) == "partial"
    assert derive_fraud_role(1, "mixed", False) == "peripheral"
    assert derive_fraud_role(1, "fraud_civil", False) == "civil_partial"
    assert derive_fraud_role(2, "fraud", True) == "core"
    assert derive_fraud_role(2, "fraud", False) == "alleged_core"
    assert derive_fraud_role(2, "mixed", True) == "core"
    assert derive_fraud_role(2, "fraud_civil", False) == "civil_core"


@pytest.mark.parametrize(
    "grade,offence,conviction",
    [
        (2, "money_laundering", False),
        (2, "fraud_civil", True),
        (1, "other", False),
        (0, "fraud", False),
        (0, "other", True),
        (2, "mixed", False),
        (1, "fraud_civil", True),
    ],
)
def test_derive_rejects_invalid_combinations(
    grade: int, offence: str, conviction: bool
) -> None:
    with pytest.raises(ValueError):
        derive_fraud_role(grade, offence, conviction)


def test_validate_derives_role_and_offsets() -> None:
    text = "主文：被告犯詐欺取財罪，處有期徒刑。"
    record = validate_annotation(_record(), full_text=text)
    assert record["fraud_role"] == "core"
    assert text[record["evidence_start"] : record["evidence_end"]] == "詐欺取財罪"


def test_validate_maps_normalized_quote_to_raw_offsets() -> None:
    text = "主文：被告犯詐\r\n欺取財罪，處有期徒刑。"
    record = validate_annotation(_record(), full_text=text)
    assert record["evidence_quote"] == "詐\r\n欺取財罪"
    assert record["evidence_quote_normalized"] == "詐欺取財罪"
    assert record["normalization_version"] == "remove-unicode-space-v2"
    assert text[record["evidence_start"] : record["evidence_end"]] == "詐\r\n欺取財罪"


def test_validate_rejects_stale_full_text_hash() -> None:
    text = "主文：被告犯詐欺取財罪，處有期徒刑。"
    with pytest.raises(ValueError):
        validate_annotation(
            _record(full_text_sha256="0" * 64),
            full_text=text,
        )


def test_validate_rejects_role_mismatch() -> None:
    with pytest.raises(ValueError):
        validate_annotation(_record(fraud_role="mention_only"))


def test_validate_rejects_conviction_on_civil_jid() -> None:
    with pytest.raises(ValueError):
        validate_annotation(
            _record(jid=V_JID, sampling_stratum="C1")
        )


def test_validate_rejects_civil_fraud_on_criminal_jid() -> None:
    with pytest.raises(ValueError):
        validate_annotation(
            _record(
                jid=M_JID,
                primary_offence="fraud_civil",
                fraud_conviction=False,
                grade=2,
            )
        )


def test_validate_rejects_grade_zero_with_fraud() -> None:
    with pytest.raises(ValueError):
        validate_annotation(
            _record(
                grade=0,
                primary_offence="fraud",
                fraud_conviction=False,
                evidence_quote="",
            )
        )


def test_validate_requires_quote_for_positive_grade() -> None:
    with pytest.raises(ValueError):
        validate_annotation(_record(evidence_quote=""))


def test_validate_title_precision_stratum() -> None:
    record = validate_annotation(
        _record(
            sampling_stratum="T",
            sample_source="title_precision",
            evidence_quote="詐欺取財罪",
        )
    )
    assert record["sampling_stratum"] == "T"
    with pytest.raises(ValueError):
        validate_annotation(
            _record(sampling_stratum="A", sample_source="title_precision")
        )


def test_resolve_evidence_offsets_requires_unique_or_explicit_start() -> None:
    text = "詐欺取財罪。其後又論詐欺取財罪。"
    with pytest.raises(ValueError):
        resolve_evidence_offsets(text, "詐欺取財罪")
    start, end = resolve_evidence_offsets(text, "詐欺取財罪", start=10)
    assert text[start:end] == "詐欺取財罪"


def test_validate_rejects_ambiguous_quote_without_occurrence() -> None:
    text = "詐欺取財罪。其後又論詐欺取財罪。"
    with pytest.raises(ValueError):
        validate_annotation(_record(), full_text=text)


def test_validate_checks_supplied_offsets() -> None:
    text = "主文：被告犯詐欺取財罪，處有期徒刑。"
    start = text.index("詐欺取財罪")
    record = validate_annotation(
        _record(evidence_start=start, evidence_end=start + 5),
        full_text=text,
    )
    assert record["evidence_start"] == start
