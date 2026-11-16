from __future__ import annotations

from judgment.retrieval_eval import retrieval_metrics


def _judgments(*jids: str):
    return [{"jid": jid} for jid in jids]


def test_retrieval_metrics_recall_precision_ndcg_mrr() -> None:
    metrics = retrieval_metrics(
        _judgments("A", "B", "C"),
        graded_relevance={"A": 2, "C": 1},
        k=10,
    )
    assert metrics is not None
    assert metrics["recall_at_10"] == 1.0
    assert metrics["recall_at_20"] == 1.0
    assert metrics["precision_at_10"] == round(2 / 3, 4)
    assert metrics["ndcg_at_10"] == 0.9639
    assert metrics["mrr"] == 1.0


def test_retrieval_metrics_penalizes_missing_relevant() -> None:
    metrics = retrieval_metrics(
        _judgments("A", "B", "C"),
        relevant_jids=["A", "C", "D"],
        k=10,
    )
    assert metrics is not None
    assert metrics["recall_at_10"] == round(2 / 3, 4)
    assert metrics["recall_at_20"] == round(2 / 3, 4)
    assert metrics["mrr"] == 1.0


def test_retrieval_metrics_requires_ground_truth() -> None:
    assert retrieval_metrics(_judgments("A"), relevant_jids=[]) is None
