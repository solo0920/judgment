from __future__ import annotations

import math
from typing import Any, Dict, Optional, Sequence


def _dcg(grades: Sequence[int]) -> float:
    return sum(
        (2**grade - 1) / math.log2(index + 2)
        for index, grade in enumerate(grades)
    )


def retrieval_metrics(
    judgments: Sequence[Dict[str, Any]],
    *,
    relevant_jids: Sequence[str] = (),
    graded_relevance: Optional[Dict[str, int]] = None,
    k: int = 10,
) -> Optional[Dict[str, float]]:
    """Compute Recall@K, Precision@K, nDCG@K and MRR for one query.

    Returns ``None`` when no ground truth is supplied.  ``graded_relevance``
    takes precedence over ``relevant_jids`` for nDCG; either can be used to
    define relevance.
    """

    graded = {
        str(jid): int(grade)
        for jid, grade in (graded_relevance or {}).items()
    }
    relevant = {
        str(jid)
        for jid in relevant_jids
        if str(jid).strip()
    }
    if not relevant and graded:
        relevant = {jid for jid, grade in graded.items() if grade > 0}
    if not relevant:
        return None

    returned = [
        str(item.get("jid") or "")
        for item in judgments
        if str(item.get("jid") or "")
    ]
    top_k = returned[:k]
    hits = [jid for jid in top_k if jid in relevant]
    precision = len(hits) / max(1, len(top_k))
    recall_at_20 = len(
        {jid for jid in returned[:20] if jid in relevant}
    ) / len(relevant)
    reciprocal_rank = 0.0
    for index, jid in enumerate(returned, 1):
        if jid in relevant:
            reciprocal_rank = 1.0 / index
            break
    if graded:
        grades = [graded.get(jid, 0) for jid in top_k]
        ideal_grades = sorted(
            (grade for grade in graded.values() if grade > 0),
            reverse=True,
        )[:k]
        ideal = _dcg(ideal_grades)
        ndcg = _dcg(grades) / ideal if ideal else 0.0
    else:
        ndcg = 0.0
    return {
        "recall_at_10": round(
            len({jid for jid in returned[:10] if jid in relevant})
            / len(relevant),
            4,
        ),
        "recall_at_20": round(recall_at_20, 4),
        "precision_at_10": round(precision, 4),
        "ndcg_at_10": round(ndcg, 4),
        "mrr": round(reciprocal_rank, 4),
        "relevant_count": len(relevant),
        "returned_count": len(returned),
    }
