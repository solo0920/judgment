from __future__ import annotations

import hashlib
from typing import Any, Dict, Optional, Tuple

from judgment.text_normalization import (
    NORMALIZATION_VERSION,
    normalize_for_match,
    resolve_evidence_span,
)

GRADES = (0, 1, 2)
PRIMARY_OFFENCES = (
    "fraud",
    "money_laundering",
    "fraud_civil",
    "mixed",
    "other",
)
EVIDENCE_SECTIONS = (
    "main_text",
    "facts",
    "reasoning",
    "cited_law",
    "other",
)
SAMPLING_STRATA = ("A", "B", "C1", "C2", "T", "G1", "G2")
SAMPLE_SOURCES = ("primary", "title_precision", "phase2")

# The complete legal combination table.  Any combination not present here is
# rejected rather than silently deriving a null role.
_ROLE_TABLE = {
    (0, "other", False): "mention_only",
    (1, "money_laundering", False): "predicate_core",
    (1, "fraud", True): "partial",
    (1, "fraud", False): "peripheral",
    (1, "mixed", True): "partial",
    (1, "mixed", False): "peripheral",
    (1, "fraud_civil", False): "civil_partial",
    (2, "fraud", True): "core",
    (2, "fraud", False): "alleged_core",
    (2, "mixed", True): "core",
    (2, "fraud_civil", False): "civil_core",
}


def jid_suffix(jid: str) -> str:
    """Return the M/V suffix of the first JID segment, or ``unknown``."""

    first = str(jid or "").split(",", 1)[0]
    suffix = first[-1:] if first else ""
    return suffix if suffix in {"M", "V"} else "unknown"


def derive_fraud_role(
    grade: int, primary_offence: str, fraud_conviction: bool
) -> str:
    """Derive ``fraud_role`` or raise for an invalid combination."""

    key = (int(grade), str(primary_offence), bool(fraud_conviction))
    try:
        return _ROLE_TABLE[key]
    except KeyError as exc:
        raise ValueError(
            "invalid annotation combination: "
            f"grade={grade}, primary_offence={primary_offence}, "
            f"fraud_conviction={fraud_conviction}"
        ) from exc


def _require(record: Dict[str, Any], field: str) -> Any:
    if field not in record or record[field] in (None, ""):
        raise ValueError(f"missing required field: {field}")
    return record[field]


def resolve_evidence_offsets(
    full_text: str, quote: str, *, start: Optional[int] = None
) -> Tuple[int, int]:
    """Resolve a quote to raw-text offsets using normalization.

    ``start`` is a raw-text offset.  If the quote occurs more than once, the
    caller must supply it; ambiguous quotes are sent to manual review rather
    than silently taking the first match.
    """

    span = resolve_evidence_span(full_text, quote, raw_start=start)
    return span.raw_start, span.raw_end


def validate_annotation(
    record: Dict[str, Any], *, full_text: Optional[str] = None
) -> Dict[str, Any]:
    """Validate one annotation and return it with a derived ``fraud_role``.

    Raises ``ValueError`` for any invalid or ambiguous combination.  The
    function never guesses a missing role and never picks the first evidence
    match when the quote is ambiguous.
    """

    jid = str(_require(record, "jid"))
    case_id = str(_require(record, "case_id"))
    grade = int(_require(record, "grade"))
    primary_offence = str(_require(record, "primary_offence"))
    fraud_conviction = bool(_require(record, "fraud_conviction"))
    evidence_section = str(_require(record, "evidence_section"))
    sample_source = str(_require(record, "sample_source"))
    sampling_stratum = str(_require(record, "sampling_stratum"))
    is_pilot = bool(record.get("is_pilot", False))
    annotation_version = str(record.get("annotation_version", "v2.0"))
    confidence = float(record.get("confidence", 1.0))
    evidence_quote = str(record.get("evidence_quote") or "")

    if annotation_version != "v2.0":
        raise ValueError("annotation_version must be v2.0")
    if grade not in GRADES:
        raise ValueError("grade must be 0, 1, or 2")
    if primary_offence not in PRIMARY_OFFENCES:
        raise ValueError("unknown primary_offence")
    if evidence_section not in EVIDENCE_SECTIONS:
        raise ValueError("unknown evidence_section")
    if sample_source not in SAMPLE_SOURCES:
        raise ValueError("unknown sample_source")
    if sampling_stratum not in SAMPLING_STRATA:
        raise ValueError("unknown sampling_stratum")
    if sample_source == "title_precision" and sampling_stratum != "T":
        raise ValueError("title_precision must use stratum T")
    if sample_source == "primary" and sampling_stratum not in {
        "A",
        "B",
        "C1",
        "C2",
    }:
        raise ValueError("primary samples must use A/B/C1/C2")
    if sample_source == "phase2" and sampling_stratum not in {"G1", "G2"}:
        raise ValueError("phase2 samples must use G1/G2")
    if not 0.0 <= confidence <= 1.0:
        raise ValueError("confidence must be between 0 and 1")

    suffix = jid_suffix(jid)
    if fraud_conviction:
        if suffix != "M":
            raise ValueError("fraud_conviction=true requires a criminal (M) JID")
        if grade < 1:
            raise ValueError("fraud_conviction=true requires grade >= 1")
        if not evidence_quote:
            raise ValueError("fraud_conviction=true requires evidence_quote")

    if primary_offence == "fraud_civil":
        if suffix != "V":
            raise ValueError("fraud_civil requires a civil (V) JID")
        if fraud_conviction:
            raise ValueError("civil fraud cannot be a criminal conviction")
        if grade not in {1, 2}:
            raise ValueError("fraud_civil requires grade 1 or 2")

    if primary_offence == "money_laundering" and grade != 1:
        raise ValueError("money_laundering requires grade 1")

    if grade == 2 and primary_offence not in {
        "fraud",
        "mixed",
        "fraud_civil",
    }:
        raise ValueError("grade 2 requires fraud, mixed, or fraud_civil")
    if grade == 1 and primary_offence not in {
        "fraud",
        "mixed",
        "money_laundering",
        "fraud_civil",
    }:
        raise ValueError("grade 1 has an invalid primary_offence")
    if grade == 0 and (
        primary_offence != "other" or fraud_conviction
    ):
        raise ValueError("grade 0 requires primary_offence=other and no conviction")

    if grade >= 1 and not evidence_quote:
        raise ValueError("grade >= 1 requires evidence_quote")

    derived = derive_fraud_role(grade, primary_offence, fraud_conviction)
    supplied_role = record.get("fraud_role")
    if supplied_role not in (None, "") and str(supplied_role) != derived:
        raise ValueError(
            f"fraud_role mismatch: supplied={supplied_role}, derived={derived}"
        )

    result = dict(record)
    result["case_id"] = case_id
    result["jid"] = jid
    result["grade"] = grade
    result["primary_offence"] = primary_offence
    result["fraud_conviction"] = fraud_conviction
    result["evidence_section"] = evidence_section
    result["sample_source"] = sample_source
    result["sampling_stratum"] = sampling_stratum
    result["is_pilot"] = is_pilot
    result["annotation_version"] = annotation_version
    result["confidence"] = confidence
    result["evidence_quote"] = evidence_quote
    result["fraud_role"] = derived

    start = record.get("evidence_start")
    end = record.get("evidence_end")
    if full_text is not None:
        actual_hash = hashlib.sha256(full_text.encode("utf-8")).hexdigest()
        expected_hash = str(record.get("full_text_sha256") or "")
        if expected_hash and expected_hash != actual_hash:
            raise ValueError(
                "full_text_sha256 does not match the supplied full text"
            )
        result["normalization_version"] = NORMALIZATION_VERSION
        result["full_text_sha256"] = actual_hash
        if evidence_quote:
            if start is not None or end is not None:
                if start is None or end is None:
                    raise ValueError(
                        "evidence_start and evidence_end must be supplied together"
                    )
                span = resolve_evidence_span(
                    full_text, evidence_quote, raw_start=int(start)
                )
                if span.raw_end != int(end):
                    raise ValueError(
                        "evidence offsets do not match evidence_quote"
                    )
            else:
                span = resolve_evidence_span(full_text, evidence_quote)
            result["evidence_start"] = span.raw_start
            result["evidence_end"] = span.raw_end
            result["evidence_quote"] = span.raw_quote
            result["evidence_quote_normalized"] = span.normalized_quote
    else:
        result["normalization_version"] = str(
            record.get("normalization_version") or NORMALIZATION_VERSION
        )
        if evidence_quote:
            result["evidence_quote_normalized"] = normalize_for_match(
                evidence_quote
            )
    if (
        result.get("evidence_start") is not None
        and result.get("evidence_end") is not None
        and int(result["evidence_start"]) >= int(result["evidence_end"])
    ):
        raise ValueError("evidence_start must be before evidence_end")

    return result
