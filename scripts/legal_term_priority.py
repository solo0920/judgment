#!/usr/bin/env python3
"""Rank legal-term candidates for human review using evidence snapshots.

This tool is deliberately not an auto-promotion step.  It combines four
signals that answer different questions:

1. Coverage: is there enough judicial data to evaluate the term?
2. Specificity: is the phrase a precise financial/legal concept rather than a
   broad civil-law word?
3. Discrimination: does the term concentrate in identifiable case titles while
   still appearing across courts and years?
4. Evidence quality: does the snapshot contain enough positive/negative proxy
   candidates for a meaningful review?

Frequency alone is not the ranking.  Dense-retrieval complementarity is marked
as pending until the A/B/C retrieval benchmark exists.

Usage:
    uv run python scripts/legal_term_priority.py
    uv run python scripts/legal_term_priority.py \
      --evidence .run/legal_term_evidence.json \
      --output .run/legal_term_priority.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

from judgment.legal_terms import REGISTRY_TERMS, REGISTRY_VERSION

SCORING_VERSION = "legal-term-priority-v1"
DENSE_COMPLEMENT_STATUS = "pending_dense_benchmark"

LENGTH_BASE = {
    "2": 12.0,
    "3": 18.0,
    "4-5": 26.0,
    "6-8": 32.0,
    "9+": 36.0,
}
SHORT_TERM_SPECIFIC = {
    "洗錢",
    "掏空",
    "背信",
    "侵占",
    "詐欺",
    "吸金",
    "匯兌",
    "退票",
    "偽造",
    "變造",
}
CATEGORY_BONUS = {
    "aml_cft_virtual_assets": 6.0,
    "securities_capital_markets": 6.0,
    "banking_deposit_credit": 5.0,
    "insurance_contract_supervision": 5.0,
    "corporate_governance": 5.0,
    "internal_control_audit_compliance": 5.0,
    "futures_derivatives": 4.0,
    "financial_consumer_protection": 4.0,
    "corporate_finance_mna_supervision": 4.0,
    "funds_asset_management": 3.0,
    "trust_securitization": 3.0,
    "payments_fintech": 3.0,
    "fx_cross_border": 3.0,
    "negotiable_instruments_secured_finance": 2.0,
    "privacy_competition_consumer_disputes": 2.0,
    "civil_contract_debt": 1.0,
    "maritime_trade_agricultural_finance": 1.0,
}
SPECIFIC_MORPHEMES = (
    "申報",
    "揭露",
    "限額",
    "義務",
    "內部控制",
    "稽核",
    "客戶審查",
    "實質受益人",
    "洗錢防制",
    "資本適足",
    "關係人",
    "非常規",
    "操縱",
    "內線",
    "財報不實",
    "違約交割",
    "侵占",
    "背信",
    "詐欺",
    "吸金",
    "挪用",
    "混同",
    "偽造",
    "變造",
    "地下匯兌",
    "聯合行為",
    "公平待客",
    "適合度",
    "風險揭露",
    "法令遵循",
    "委外",
    "資安",
    "虛擬資產",
    "資恐",
    "制裁",
    "跨境",
    "保證金",
    "沖銷",
    "交割",
    "持股申報",
    "公開說明書",
    "私募",
    "承銷",
    "代客操作",
    "全權委託",
    "集中度",
    "逾期放款",
    "催收",
    "呆帳",
    "不良債權",
    "保證",
    "抵押權",
    "質權",
    "信用狀",
    "押匯",
    "併購",
    "收購",
    "重整",
    "清算",
    "退場",
    "存款保險",
    "評議",
    "仲裁",
)
GENERIC_CIVIL_TERMS = {
    "債務不履行",
    "給付不能",
    "給付遲延",
    "不完全給付",
    "債務不履行損害賠償",
    "契約解除",
    "契約終止",
    "契約撤銷",
    "意思表示錯誤",
    "詐欺意思表示",
    "脅迫意思表示",
    "通謀虛偽意思表示",
    "無權代理",
    "表見代理",
    "無因管理",
    "不當得利",
    "侵權行為損害賠償",
    "連帶債務",
    "保證債務",
    "最高限額抵押權",
    "債權讓與",
    "債務承擔",
    "抵銷",
    "消滅時效",
    "權利濫用",
}
# High-volume financial terms that are still broad procedural or debt-
# collection concepts.  They remain reviewable, but should not outrank a
# precise supervisory concept solely because they appear in many judgments.
BROAD_FINANCIAL_TERMS = {
    "本票裁定",
    "催收款",
    "支票退票",
    "債務協商",
}


def _length_bucket(term: str) -> str:
    length = len(term)
    if length <= 2:
        return "2"
    if length == 3:
        return "3"
    if length <= 5:
        return "4-5"
    if length <= 8:
        return "6-8"
    return "9+"


def _specificity_score(term: str, category: str) -> Tuple[float, List[str]]:
    notes: List[str] = []
    bucket = _length_bucket(term)
    score = LENGTH_BASE[bucket]
    notes.append(f"length={len(term)}({bucket})")
    if len(term) <= 2 and term in SHORT_TERM_SPECIFIC:
        score = 24.0
        notes.append("short_specific")
    bonus = CATEGORY_BONUS.get(category, 0.0)
    if bonus:
        score += bonus
        notes.append(f"category+{bonus:.0f}")
    if any(morpheme in term for morpheme in SPECIFIC_MORPHEMES):
        score += 4.0
        notes.append("specific_morpheme")
    if term in GENERIC_CIVIL_TERMS:
        score -= 8.0
        notes.append("generic_civil")
    return max(0.0, min(45.0, score)), notes


def _coverage_score(estimated_df: int) -> float:
    if estimated_df <= 0:
        return 0.0
    ratio = math.log1p(estimated_df) / math.log1p(10_000)
    return round(40.0 * min(1.0, ratio), 2)


def _discrimination_score(item: Dict[str, Any]) -> float:
    df = int(item.get("document_frequency") or 0)
    if df <= 0:
        return 0.0
    title_distribution = item.get("title_distribution") or {}
    top_title_share = (
        max(title_distribution.values()) / df if title_distribution else 0.0
    )
    court_breadth = min(1.0, int(item.get("court_diversity") or 0) / 15.0)
    year_breadth = min(1.0, int(item.get("year_coverage") or 0) / 15.0)
    score = top_title_share * 6.0 + court_breadth * 4.0 + year_breadth * 3.0
    return round(min(13.0, score), 2)


def _evidence_quality_score(item: Dict[str, Any]) -> float:
    support = str(item.get("sample_support") or "")
    score = {
        "proxy_supported": 5.0,
        "insufficient_sample": 2.0,
        "zero_in_sample": 0.0,
    }.get(support, 0.0)
    positive = int(item.get("positive_jid_sample_size") or 0)
    negative = int(item.get("negative_jid_sample_size") or 0)
    if positive >= 20:
        score += 3.0
    elif positive >= 5:
        score += 1.0
    if negative >= 5:
        score += 2.0
    elif negative >= 1:
        score += 1.0
    return round(min(10.0, score), 2)


def _risk_flags(
    term: str,
    item: Dict[str, Any],
    *,
    top_title_share: float,
) -> List[str]:
    flags: List[str] = ["not_legal_reviewed", "not_benchmark_approved"]
    df = int(item.get("document_frequency") or 0)
    if df == 0:
        flags.append("zero_hits_in_snapshot")
        return flags
    if item.get("sample_support") == "insufficient_sample":
        flags.append("insufficient_sample")
    if len(term) <= 2 and term not in SHORT_TERM_SPECIFIC:
        flags.append("short_term_ambiguity")
    if term in GENERIC_CIVIL_TERMS:
        flags.append("generic_civil_broad")
    if term in BROAD_FINANCIAL_TERMS:
        flags.append("broad_financial_term")
    if top_title_share >= 0.8 and df >= 20:
        flags.append("title_concentration")
    if float(item.get("term_density") or 0.0) >= 10.0:
        flags.append("high_density_possible_boilerplate")
    if (
        df >= 20
        and int(item.get("negative_jid_sample_size") or 0) == 0
    ):
        flags.append("no_negative_candidate")
    return flags


def _tier_and_action(
    term: str,
    item: Dict[str, Any],
    *,
    active: bool,
    score: float,
) -> Tuple[str, str]:
    if active:
        return "active_monitor", "keep_active_monitor"
    df = int(item.get("document_frequency") or 0)
    if df == 0:
        return "P3_hold_no_data", "hold_no_data_collect_evidence"
    if df < 20:
        return "P2_collect_data", "collect_more_data_before_review"
    if score >= 65.0:
        if term in GENERIC_CIVIL_TERMS or term in BROAD_FINANCIAL_TERMS:
            return "P1_review_next", "human_review_then_abc_benchmark"
        return "P0_review_now", "human_review_then_abc_benchmark"
    if score >= 50.0:
        return "P1_review_next", "human_review_then_abc_benchmark"
    return "P2_collect_data", "collect_more_data_or_lower_priority"


def _rationale(
    item: Dict[str, Any],
    *,
    specificity: float,
    top_title: str,
    top_title_share: float,
    specificity_notes: List[str],
) -> str:
    df = int(item.get("document_frequency") or 0)
    estimated = int(item.get("estimated_full_corpus_df") or 0)
    if df == 0:
        return (
            "此快照內零命中；先保留 candidate，確認是否為裁判實務用語，"
            "或改以較精確的變體／母概念建立證據。"
        )
    return (
        f"樣本 df={df:,}（估計全庫 {estimated:,}），"
        f"法院 {int(item.get('court_diversity') or 0)}、"
        f"年份 {int(item.get('year_coverage') or 0)}、"
        f"案由 {int(item.get('title_diversity') or 0)}；"
        f"最常見案由「{top_title}」占 {top_title_share:.0%}。"
        f"特異性 {specificity:.1f}（{'; '.join(specificity_notes)}）。"
        "尚待人工 relevance 標註與 A/B/C benchmark。"
    )


def _build_row(
    term: Any,
    item: Dict[str, Any],
    *,
    evidence_snapshot_id: str,
) -> Dict[str, Any]:
    df = int(item.get("document_frequency") or 0)
    title_distribution = item.get("title_distribution") or {}
    top_title = ""
    top_title_share = 0.0
    if title_distribution and df:
        top_title, top_count = max(
            title_distribution.items(), key=lambda pair: pair[1]
        )
        top_title_share = round(top_count / df, 4)
    specificity, specificity_notes = _specificity_score(
        term.key, term.legal_concept_category
    )
    coverage = _coverage_score(
        int(item.get("estimated_full_corpus_df") or 0)
    )
    discrimination = _discrimination_score(item)
    evidence_quality = _evidence_quality_score(item)
    score = round(
        min(100.0, coverage + specificity + discrimination + evidence_quality),
        2,
    )
    tier, action = _tier_and_action(
        term.key, item, active=term.active, score=score
    )
    flags = _risk_flags(
        term.key, item, top_title_share=top_title_share
    )
    return {
        "term_id": term.term_id,
        "term": term.key,
        "category": term.legal_concept_category,
        "active": term.active,
        "review_status": term.review_status,
        "priority_tier": tier,
        "recommended_action": action,
        "priority_score": score,
        "coverage_score": coverage,
        "specificity_score": round(specificity, 2),
        "discrimination_score": discrimination,
        "evidence_quality_score": evidence_quality,
        "dense_complement_score": "",
        "dense_complement_status": DENSE_COMPLEMENT_STATUS,
        "estimated_full_corpus_df": int(
            item.get("estimated_full_corpus_df") or 0
        ),
        "document_frequency": df,
        "occurrence_count": int(item.get("occurrence_count") or 0),
        "term_density": float(item.get("term_density") or 0.0),
        "paragraph_frequency": int(item.get("paragraph_frequency") or 0),
        "court_diversity": int(item.get("court_diversity") or 0),
        "year_coverage": int(item.get("year_coverage") or 0),
        "title_diversity": int(item.get("title_diversity") or 0),
        "top_title": top_title,
        "top_title_share": top_title_share,
        "term_length": len(term.key),
        "length_bucket": _length_bucket(term.key),
        "positive_jid_sample_size": int(
            item.get("positive_jid_sample_size") or 0
        ),
        "negative_jid_sample_size": int(
            item.get("negative_jid_sample_size") or 0
        ),
        "sample_support": str(item.get("sample_support") or ""),
        "risk_flags": ";".join(flags),
        "rationale": _rationale(
            item,
            specificity=specificity,
            top_title=top_title,
            top_title_share=top_title_share,
            specificity_notes=specificity_notes,
        ),
        "evidence_snapshot_id": evidence_snapshot_id,
        "registry_version": REGISTRY_VERSION,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--evidence", default=".run/legal_term_evidence.json"
    )
    parser.add_argument(
        "--output", default=".run/legal_term_priority.csv"
    )
    parser.add_argument(
        "--json-output", default=".run/legal_term_priority.json"
    )
    args = parser.parse_args()

    evidence_path = Path(args.evidence)
    if not evidence_path.exists():
        raise SystemExit(
            f"Evidence snapshot not found: {evidence_path}. "
            "Run scripts/legal_term_evidence.py first."
        )
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    evidence_terms: Dict[str, Dict[str, Any]] = evidence.get("terms") or {}
    snapshot_id = str(evidence.get("evidence_snapshot_id") or "")
    if not snapshot_id:
        snapshot_id = str(evidence.get("generated_at") or "unknown")

    rows: List[Dict[str, Any]] = []
    missing: List[str] = []
    for term in REGISTRY_TERMS:
        item = evidence_terms.get(term.key)
        if item is None:
            missing.append(term.key)
            item = {
                "term": term.key,
                "category": term.legal_concept_category,
                "active": term.active,
                "review_status": term.review_status,
                "document_frequency": 0,
                "estimated_full_corpus_df": 0,
                "sample_support": "missing_from_snapshot",
            }
        rows.append(
            _build_row(term, item, evidence_snapshot_id=snapshot_id)
        )

    active_rows = [row for row in rows if row["active"]]
    candidate_rows = [row for row in rows if not row["active"]]
    tier_order = {
        "P0_review_now": 0,
        "P1_review_next": 1,
        "P2_collect_data": 2,
        "P3_hold_no_data": 3,
    }
    candidate_rows.sort(
        key=lambda row: (
            tier_order.get(str(row["priority_tier"]), 99),
            -float(row["priority_score"]),
            -int(row["estimated_full_corpus_df"]),
            str(row["term"]),
        )
    )
    for rank, row in enumerate(candidate_rows, start=1):
        row["priority_rank"] = rank
    for row in active_rows:
        row["priority_rank"] = ""

    columns = [
        "priority_rank",
        "term_id",
        "term",
        "category",
        "active",
        "review_status",
        "priority_tier",
        "recommended_action",
        "priority_score",
        "coverage_score",
        "specificity_score",
        "discrimination_score",
        "evidence_quality_score",
        "dense_complement_score",
        "dense_complement_status",
        "estimated_full_corpus_df",
        "document_frequency",
        "occurrence_count",
        "term_density",
        "paragraph_frequency",
        "court_diversity",
        "year_coverage",
        "title_diversity",
        "top_title",
        "top_title_share",
        "term_length",
        "length_bucket",
        "positive_jid_sample_size",
        "negative_jid_sample_size",
        "sample_support",
        "risk_flags",
        "rationale",
        "evidence_snapshot_id",
        "registry_version",
    ]
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle, fieldnames=columns, lineterminator="\n"
        )
        writer.writeheader()
        writer.writerows(active_rows)
        writer.writerows(candidate_rows)

    tier_counts: Dict[str, int] = {}
    for row in candidate_rows:
        tier = str(row["priority_tier"])
        tier_counts[tier] = tier_counts.get(tier, 0) + 1
    summary = {
        "version": SCORING_VERSION,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "evidence_snapshot_id": snapshot_id,
        "registry_version": REGISTRY_VERSION,
        "terms": len(rows),
        "active": len(active_rows),
        "candidates": len(candidate_rows),
        "missing_from_snapshot": missing,
        "tier_counts": tier_counts,
        "weights": {
            "coverage_max": 40,
            "specificity_max": 45,
            "discrimination_max": 13,
            "evidence_quality_max": 10,
            "dense_complement": "pending",
        },
        "tiers": {
            "P0_review_now": "score>=65 and sample df>=20",
            "P1_review_next": "score>=50 and sample df>=20",
            "P2_collect_data": "sample df 1-19 or lower score",
            "P3_hold_no_data": "sample df=0",
            "active_monitor": "already active; no promotion implied",
        },
        "top_20_candidates": candidate_rows[:20],
        "all_terms": [
            {
                "term_id": row["term_id"],
                "term": row["term"],
                "active": row["active"],
                "priority_tier": row["priority_tier"],
                "priority_rank": row["priority_rank"],
                "priority_score": row["priority_score"],
            }
            for row in active_rows + candidate_rows
        ],
        "notes": [
            "Ranking is a review queue, not activation.",
            "Frequency alone is not the score.",
            "Dense-retrieval complementarity is pending the A/B/C benchmark.",
            "No term changes review_status or expansion_enabled here.",
        ],
    }
    json_output = Path(args.json_output)
    json_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(
        json.dumps(
            {
                "output": str(output),
                "json_output": str(json_output),
                "terms": len(rows),
                "active": len(active_rows),
                "candidates": len(candidate_rows),
                "tier_counts": tier_counts,
                "missing_from_snapshot": len(missing),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
