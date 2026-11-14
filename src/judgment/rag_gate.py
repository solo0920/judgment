from __future__ import annotations

import os
from typing import Any, Dict, List, Mapping, Optional

DEFAULT_THRESHOLDS: Dict[str, Dict[str, Any]] = {
    "law_recall": {"min": 0.75, "label": "法規 recall"},
    "article_recall": {"min": 0.70, "label": "條文 recall"},
    "judgment_recall": {"min": 0.65, "label": "判決 recall"},
    "citation_valid_rate": {"min": 0.95, "label": "citation 合法率"},
    "refusal_accuracy": {"min": 0.90, "label": "拒答正確率"},
    "duration_p95_ms": {"max": 15000, "label": "P95 延遲"},
}

_ENV_KEYS = {
    "law_recall": "RAG_GATE_LAW_RECALL_MIN",
    "article_recall": "RAG_GATE_ARTICLE_RECALL_MIN",
    "judgment_recall": "RAG_GATE_JUDGMENT_RECALL_MIN",
    "citation_valid_rate": "RAG_GATE_CITATION_VALID_RATE_MIN",
    "refusal_accuracy": "RAG_GATE_REFUSAL_ACCURACY_MIN",
    "duration_p95_ms": "RAG_GATE_DURATION_P95_MAX_MS",
}


def thresholds_from_env() -> Dict[str, Dict[str, Any]]:
    """Return thresholds with optional environment overrides."""

    thresholds = {key: dict(value) for key, value in DEFAULT_THRESHOLDS.items()}
    for key, env_name in _ENV_KEYS.items():
        raw = os.getenv(env_name, "").strip()
        if not raw:
            continue
        try:
            value = float(raw)
        except ValueError:
            continue
        if "min" in thresholds[key]:
            thresholds[key]["min"] = value
        else:
            thresholds[key]["max"] = value
    return thresholds


def evaluate_regression_gate(
    summary: Optional[Mapping[str, Any]],
    *,
    thresholds: Optional[Mapping[str, Mapping[str, Any]]] = None,
) -> Dict[str, Any]:
    """Evaluate aggregate benchmark metrics against fixed thresholds."""

    metrics = dict(summary or {})
    limits = {
        key: dict(value)
        for key, value in (thresholds or thresholds_from_env()).items()
    }
    checks: List[Dict[str, Any]] = []
    for key, limit in limits.items():
        raw = metrics.get(key)
        if raw is None:
            checks.append(
                {
                    "key": key,
                    "label": limit.get("label") or key,
                    "status": "skipped",
                    "value": None,
                    "threshold": limit,
                    "message": "此 benchmark 沒有提供此指標。",
                }
            )
            continue
        try:
            value = float(raw)
        except (TypeError, ValueError):
            checks.append(
                {
                    "key": key,
                    "label": limit.get("label") or key,
                    "status": "skipped",
                    "value": raw,
                    "threshold": limit,
                    "message": "指標不是數值。",
                }
            )
            continue
        if "min" in limit:
            passed = value >= float(limit["min"])
            comparison = f">= {float(limit['min'])}"
        else:
            passed = value <= float(limit["max"])
            comparison = f"<= {float(limit['max'])}"
        checks.append(
            {
                "key": key,
                "label": limit.get("label") or key,
                "status": "pass" if passed else "fail",
                "value": round(value, 4),
                "threshold": limit,
                "message": f"{value:.4g} {comparison}",
            }
        )

    evaluated = [check for check in checks if check["status"] != "skipped"]
    if not evaluated:
        status = "no_data"
    elif any(check["status"] == "fail" for check in evaluated):
        status = "fail"
    else:
        status = "pass"
    return {
        "status": status,
        "passed": status == "pass",
        "checks": checks,
        "evaluated": len(evaluated),
        "failed": sum(1 for check in evaluated if check["status"] == "fail"),
    }
