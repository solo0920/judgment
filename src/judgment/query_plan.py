from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass(frozen=True)
class QueryPlan:
    intent: str
    structured: bool
    dense: bool
    lexical: bool
    enumerate: bool
    rerank: bool
    reason: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "intent": self.intent,
            "structured": self.structured,
            "dense": self.dense,
            "lexical": self.lexical,
            "enumerate": self.enumerate,
            "rerank": self.rerank,
            "reason": self.reason,
        }


def build_query_plan(
    *,
    parsed_query,
    query_filter: bool,
    judgment_list_hint: bool,
    law_first_hint: bool,
    rerank_available: bool,
    lexical_available: bool = True,
) -> QueryPlan:
    """Choose the retrieval path from parsed conditions and question intent.

    P1 keeps the existing dense collection and adds a lexical RRF rescoring
    channel over dense candidates.  A true sparse/BM25 index is P1.5 because
    it requires reindexing every judgment.
    """

    if (
        judgment_list_hint
        and query_filter
        and not law_first_hint
    ):
        return QueryPlan(
            intent="judgment_list",
            structured=True,
            dense=False,
            lexical=False,
            enumerate=True,
            rerank=False,
            reason="explicit judgment list with court/date/topic filters",
        )
    if law_first_hint:
        return QueryPlan(
            intent="law_first",
            structured=query_filter,
            dense=True,
            lexical=lexical_available,
            enumerate=False,
            rerank=rerank_available,
            reason="law/provision-oriented question",
        )
    if query_filter:
        return QueryPlan(
            intent="structured_semantic",
            structured=True,
            dense=True,
            lexical=lexical_available,
            enumerate=False,
            rerank=rerank_available,
            reason="semantic question with hard court/date/topic filters",
        )
    return QueryPlan(
        intent="semantic",
        structured=False,
        dense=True,
        lexical=lexical_available,
        enumerate=False,
        rerank=rerank_available,
        reason="no hard filters; dense semantic retrieval",
    )
