from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Tuple

MODE_EXACT = "exact"
MODE_EXPANSION = "expansion"
MODE_BOTH = "both"

REGISTRY_PATH = (
    Path(__file__).resolve().parent / "data" / "legal_terms_registry.json"
)


@dataclass(frozen=True)
class LegalTerm:
    key: str
    phrases: Tuple[str, ...]
    description: str
    scope: Tuple[str, ...] = ()
    normalization_version: str = "remove-unicode-space-v2"
    review_status: str = "engineering_approved"
    evidence: str = ""
    positive_jids: Tuple[str, ...] = ()
    negative_jids: Tuple[str, ...] = ()
    mode: str = MODE_EXACT
    priority: int = 50
    expansion_terms: Tuple[str, ...] = ()
    expansion_enabled: bool = True
    expansion_decision: str = "proxy_approved"
    expansion_evaluation: Dict[str, Any] = field(
        default_factory=lambda: {
            "baseline_version": "original-query-v1",
            "benchmark_version": "legal-term-benchmark-v1",
            "ground_truth_type": "exact_match_proxy",
            "sample_size": 0,
            "recall_at_20_delta": None,
            "recall_at_50_delta": None,
            "precision_at_10_delta": None,
            "ndcg_at_10_delta": None,
            "latency_p95_delta_ms": None,
            "reviewed_at": None,
        }
    )
    term_id: str = ""
    primary_laws: Tuple[str, ...] = ()
    legal_concept_category: str = ""
    active: bool = True
    ground_truth: Dict[str, Any] = field(default_factory=dict)
    notes: str = ""

    def __post_init__(self) -> None:
        if not self.expansion_enabled and self.expansion_decision == "proxy_approved":
            object.__setattr__(self, "expansion_decision", "disabled")


def _load_registry() -> Dict[str, Any]:
    if not REGISTRY_PATH.exists():
        raise RuntimeError(f"Legal term registry not found: {REGISTRY_PATH}")
    payload = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    terms = payload.get("terms")
    if not isinstance(terms, list) or not terms:
        raise RuntimeError("Legal term registry has no terms")
    seen: set[str] = set()
    for item in terms:
        term = str(item.get("term") or "").strip()
        if not term:
            raise RuntimeError("Legal term registry contains an empty term")
        if term in seen:
            raise RuntimeError(f"Duplicate legal term: {term}")
        seen.add(term)
    return payload


def _term_from_dict(item: Dict[str, Any]) -> LegalTerm:
    term = str(item["term"])
    laws = tuple(str(value) for value in item.get("primary_laws") or ())
    return LegalTerm(
        key=term,
        phrases=tuple(
            str(value) for value in (item.get("exact_variants") or [term])
        ),
        description=str(item.get("description") or term),
        scope=tuple(str(value) for value in item.get("scope") or ()),
        normalization_version=str(
            item.get("normalization_version") or "remove-unicode-space-v2"
        ),
        review_status=str(item.get("review_status") or "candidate"),
        evidence=str(item.get("evidence") or ""),
        positive_jids=tuple(
            str(value) for value in item.get("positive_jids") or ()
        ),
        negative_jids=tuple(
            str(value) for value in item.get("negative_jids") or ()
        ),
        mode=str(item.get("mode") or MODE_EXACT),
        priority=int(item.get("priority") or 0),
        expansion_terms=tuple(
            str(value) for value in item.get("expansion_terms") or ()
        ),
        expansion_enabled=bool(item.get("expansion_enabled") or False),
        expansion_decision=str(
            item.get("expansion_decision") or "candidate"
        ),
        expansion_evaluation=dict(item.get("expansion_evaluation") or {}),
        term_id=str(item.get("id") or ""),
        primary_laws=laws,
        legal_concept_category=str(
            item.get("legal_concept_category") or ""
        ),
        active=bool(item.get("active") or False),
        ground_truth=dict(item.get("ground_truth") or {}),
        notes=str(item.get("notes") or ""),
    )


_REGISTRY = _load_registry()
REGISTRY_VERSION = str(_REGISTRY.get("version") or "")
REGISTRY_CREATED_AT = str(_REGISTRY.get("created_at") or "")
REGISTRY_TERMS: Tuple[LegalTerm, ...] = tuple(
    _term_from_dict(item) for item in _REGISTRY["terms"]
)
LEGAL_TERM_REGISTRY: Dict[str, LegalTerm] = {
    term.key: term for term in REGISTRY_TERMS
}
LEGAL_TERMS: Tuple[LegalTerm, ...] = tuple(
    term for term in REGISTRY_TERMS if term.active
)
LEGAL_TERM_CANDIDATES: Tuple[LegalTerm, ...] = tuple(
    term for term in REGISTRY_TERMS if not term.active
)


def detect_legal_terms(question: str) -> List[LegalTerm]:
    normalized = normalize_question(question)
    return [
        term
        for term in LEGAL_TERMS
        if any(phrase in normalized for phrase in term.phrases)
    ]


def detect_exact_terms(question: str) -> List[LegalTerm]:
    return [
        term
        for term in detect_legal_terms(question)
        if term.mode in {MODE_EXACT, MODE_BOTH}
    ]


def detect_expansion_terms(
    question: str, *, include_disabled: bool = False
) -> List[LegalTerm]:
    return [
        term
        for term in detect_legal_terms(question)
        if (
            term.mode in {MODE_EXPANSION, MODE_BOTH}
            and term.expansion_terms
            and (term.expansion_enabled or include_disabled)
        )
    ]


def expand_semantic_query(
    question: str,
    *,
    limit: int = 4,
    include_disabled: bool = False,
) -> Tuple[str, dict]:
    """Append the highest-priority expansion terms to a semantic query.

    The original question remains the citation/rerank question.  Only the
    embedding query is expanded, so a semantic search is nudged toward the
    legal concept without turning it into an exact-match query.
    """

    terms = sorted(
        detect_expansion_terms(
            question, include_disabled=include_disabled
        ),
        key=lambda term: (-term.priority, term.key),
    )
    selected: List[str] = []
    normalized_question = normalize_question(question)
    for term in terms:
        for expansion in term.expansion_terms:
            if len(selected) >= max(0, int(limit)):
                break
            if expansion in selected:
                continue
            if normalize_question(expansion) in normalized_question:
                continue
            selected.append(expansion)
        if len(selected) >= max(0, int(limit)):
            break
    expanded = question
    if selected:
        expanded = f"{question} {' '.join(selected)}"
    return expanded, {
        "enabled": bool(selected),
        "matched_terms": [term.key for term in terms],
        "expansion_terms": selected,
        "original_length": len(question),
        "expanded_length": len(expanded),
    }


def phrases_for_terms(terms: List[LegalTerm]) -> Tuple[str, ...]:
    seen: List[str] = []
    for term in terms:
        for phrase in term.phrases:
            if phrase not in seen:
                seen.append(phrase)
    return tuple(seen)


def normalize_question(text: str) -> str:
    from .text_normalization import normalize_for_match

    return normalize_for_match(text)
