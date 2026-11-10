from __future__ import annotations

import hashlib
import json
import logging
import math
import re
import threading
import time
from dataclasses import replace
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence
from uuid import uuid4

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .index_versions import active_version
from .models import (
    BenchmarkCaseResult,
    BenchmarkRun,
    BenchmarkSuite,
    BenchmarkSuiteItem,
    QuestionBankItem,
)
from .observability import clear_flow, start_flow
from .performance_test import available_test_models
from .question_bank import (
    QuestionBankError,
    _item_benchmark_ready,
    _item_snapshot,
    serialize_suite,
)
from .rag import (
    _INSUFFICIENT_RE,
    _valid_citation_markers,
    answer_question,
)

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _norm_article(value: Any) -> str:
    text = re.sub(r"\s+", "", str(value or ""))
    text = re.sub(r"^第", "", text)
    text = re.sub(r"條$", "", text)
    return text.replace("之", "-")


def _norm_name(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or "")).strip()


def _ratio(hit: int, total: int) -> Optional[float]:
    if total <= 0:
        return None
    return round(hit / total, 4)


def _mean(values: Sequence[Optional[float]]) -> Optional[float]:
    usable = [float(value) for value in values if value is not None]
    if not usable:
        return None
    return round(sum(usable) / len(usable), 4)


def _percentile(values: Sequence[float], percentile: float) -> Optional[float]:
    ordered = sorted(float(value) for value in values if value is not None)
    if not ordered:
        return None
    index = max(0, min(len(ordered) - 1, int(math.ceil(percentile * len(ordered))) - 1))
    return round(ordered[index], 2)


def _config_hash(config: Dict[str, Any]) -> str:
    encoded = json.dumps(config, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def _default_config(config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    values = dict(config or {})
    return {
        "label": str(values.get("label") or "RAG Benchmark"),
        "embedding_model": str(values.get("embedding_model") or ""),
        "llm_model": str(values.get("llm_model") or ""),
        "top_k": max(1, min(20, int(values.get("top_k") or 4))),
        "score_threshold": max(0.0, min(1.0, float(values.get("score_threshold") or 0.35))),
        "enable_law_retrieval": bool(values.get("enable_law_retrieval", True)),
        "judge_enabled": bool(values.get("judge_enabled", True)),
        "judge_model": str(values.get("judge_model") or ""),
        "repeats": max(1, min(5, int(values.get("repeats") or 1))),
    }


def _active_index(session_factory: sessionmaker[Session], settings: Settings) -> Dict[str, Any]:
    try:
        version = active_version(
            session_factory, alias_name=settings.judgment_vector_alias
        )
    except Exception:
        version = None
    return version or {
        "version_id": None,
        "physical_collection": settings.judgment_vector_collection,
        "alias_name": settings.judgment_vector_alias,
    }


def _settings_for_config(settings: Settings, config: Dict[str, Any]) -> Settings:
    changes: Dict[str, Any] = {
        "rag_top_k": int(config["top_k"]),
        "rag_score_threshold": float(config["score_threshold"]),
    }
    if config.get("embedding_model"):
        changes["embedding_model"] = str(config["embedding_model"])
    if config.get("llm_model"):
        changes["llm_model"] = str(config["llm_model"])
    return replace(settings, **changes)


def _expected_sets(item: Dict[str, Any]) -> Dict[str, Any]:
    laws = {
        _norm_name(value.get("law_name"))
        for value in (item.get("expected_laws") or [])
        if isinstance(value, dict) and _norm_name(value.get("law_name"))
    }
    articles = {
        _norm_article(value.get("article_no"))
        for value in (item.get("expected_articles") or [])
        if isinstance(value, dict) and _norm_article(value.get("article_no"))
    }
    judgments = {
        str(value.get("jid") or "")
        for value in (item.get("expected_judgments") or [])
        if isinstance(value, dict) and value.get("jid")
    }
    return {"laws": laws, "articles": articles, "judgments": judgments}


def _retrieved_sets(payload: Dict[str, Any]) -> Dict[str, Any]:
    law_sources = payload.get("law_sources") or []
    laws = {
        _norm_name(source.get("law_name"))
        for source in law_sources
        if isinstance(source, dict) and _norm_name(source.get("law_name"))
    }
    articles = {
        _norm_article(article.get("article_no"))
        for source in law_sources
        if isinstance(source, dict)
        for article in (source.get("articles") or [])
        if isinstance(article, dict) and _norm_article(article.get("article_no"))
    }
    judgments = {
        str(citation.get("jid") or "")
        for citation in (payload.get("citations") or [])
        if isinstance(citation, dict) and citation.get("jid")
    }
    return {"laws": laws, "articles": articles, "judgments": judgments}


def deterministic_metrics(
    item: Dict[str, Any],
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    expected = _expected_sets(item)
    retrieved = _retrieved_sets(payload)
    law_hits = len(expected["laws"] & retrieved["laws"])
    article_hits = len(expected["articles"] & retrieved["articles"])
    judgment_hits = len(expected["judgments"] & retrieved["judgments"])
    answer = str(payload.get("answer") or "")
    source_count = len(payload.get("citations") or []) + len(payload.get("law_sources") or [])
    citation_valid = bool(source_count and _valid_citation_markers(answer, source_count))
    must_refuse = bool((item.get("rubric") or {}).get("must_refuse"))
    refusal_correct = None
    if must_refuse:
        refusal_correct = bool(_INSUFFICIENT_RE.search(answer)) and not bool(
            re.search(r"\[[0-9]", answer)
        )
    return {
        "expected_laws": sorted(expected["laws"]),
        "expected_articles": sorted(expected["articles"]),
        "expected_judgments": sorted(expected["judgments"]),
        "retrieved_laws": sorted(retrieved["laws"]),
        "retrieved_articles": sorted(retrieved["articles"]),
        "retrieved_judgments": sorted(retrieved["judgments"]),
        "law_hits": law_hits,
        "law_recall": _ratio(law_hits, len(expected["laws"])),
        "law_precision": _ratio(law_hits, len(retrieved["laws"])),
        "article_hits": article_hits,
        "article_recall": _ratio(article_hits, len(expected["articles"])),
        "article_precision": _ratio(article_hits, len(retrieved["articles"])),
        "judgment_hits": judgment_hits,
        "judgment_recall": _ratio(judgment_hits, len(expected["judgments"])),
        "citation_valid": citation_valid,
        "refusal_correct": refusal_correct,
        "answer_length": len(answer),
    }


def _judge_prompt(item: Dict[str, Any], payload: Dict[str, Any]) -> str:
    return (
        "你是法律 RAG 評審。請只根據題目、標準答案、預期法規／條文與待評答案，"
        "輸出一個 JSON 物件，不要輸出 Markdown。\n"
        "評分欄位：correctness、grounding、citation、clarity，皆為 1 到 5 的整數；"
        "overall 為 1 到 5 的整數；verdict 為 pass、partial 或 fail；"
        "rationale 用 2 到 4 句繁體中文說明。\n\n"
        f"題目：{item.get('question')}\n"
        f"標準答案：{item.get('reference_answer') or '未提供'}\n"
        f"預期法規：{json.dumps(item.get('expected_laws') or [], ensure_ascii=False)}\n"
        f"預期條文：{json.dumps(item.get('expected_articles') or [], ensure_ascii=False)}\n"
        f"待評答案：{payload.get('answer') or ''}\n"
        f"引用來源：{json.dumps(payload.get('law_sources') or [], ensure_ascii=False)[:6000]}\n"
        f"判決引用：{json.dumps(payload.get('citations') or [], ensure_ascii=False)[:3000]}\n"
    )


def _parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    cleaned = str(text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        match = re.search(r"\{.*\}", cleaned, re.S)
        if not match:
            return None
        try:
            parsed = json.loads(match.group(0))
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None


def judge_answer(
    *,
    settings: Settings,
    model: str,
    item: Dict[str, Any],
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    if not model or not settings.llm_url:
        return {"status": "skipped", "reason": "未設定 judge model 或 LLM URL"}
    url = f"{settings.llm_url.rstrip('/')}/api/chat"
    started = time.perf_counter()
    try:
        response = httpx.post(
            url,
            json={
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": "你是嚴謹的法律 RAG 評審，只輸出合法 JSON。",
                    },
                    {"role": "user", "content": _judge_prompt(item, payload)},
                ],
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.0, "num_predict": 700},
            },
            timeout=180.0,
        )
        response.raise_for_status()
        content = str(
            (response.json().get("message") or {}).get("content") or ""
        )
        parsed = _parse_json_object(content)
        if parsed is None:
            return {
                "status": "error",
                "model": model,
                "duration_ms": int((time.perf_counter() - started) * 1000),
                "raw": content[:4000],
                "reason": "judge 回應不是 JSON",
            }
        return {
            "status": "ok",
            "model": model,
            "duration_ms": int((time.perf_counter() - started) * 1000),
            **parsed,
        }
    except Exception as exc:
        return {
            "status": "error",
            "model": model,
            "duration_ms": int((time.perf_counter() - started) * 1000),
            "reason": f"{exc.__class__.__name__}: {exc}",
        }


def _stage_ms(flow: Dict[str, Any]) -> Dict[str, Any]:
    by_name = (flow.get("summary") or {}).get("by_name") or {}
    return {
        name: round(float((bucket or {}).get("total_ms") or 0), 2)
        for name, bucket in by_name.items()
        if name
    }


def _case_score(
    metrics: Dict[str, Any],
    judge: Dict[str, Any],
    human: Dict[str, Any],
) -> Dict[str, Any]:
    components = [
        value
        for value in (
            metrics.get("law_recall"),
            metrics.get("article_recall"),
            metrics.get("citation_valid"),
            metrics.get("refusal_correct"),
        )
        if value is not None
    ]
    deterministic = (
        round(sum(float(value) for value in components) / len(components), 4)
        if components
        else None
    )
    judge_overall = judge.get("overall") if judge.get("status") == "ok" else None
    human_overall = human.get("overall") if human.get("status") == "ok" else None
    return {
        "deterministic": deterministic,
        "judge": judge_overall,
        "human": human_overall,
    }


class BenchmarkManager:
    """Run a frozen question suite against the live RAG pipeline."""

    def __init__(self, *, settings: Settings, session_factory: sessionmaker[Session]) -> None:
        self.settings = settings
        self.session_factory = session_factory
        self._lock = threading.Lock()
        self._threads: Dict[str, threading.Thread] = {}
        self._stop_flags: Dict[str, bool] = {}

    def _stop(self, run_id: str) -> bool:
        with self._lock:
            return bool(self._stop_flags.get(run_id))

    def _set_stop(self, run_id: str) -> None:
        with self._lock:
            self._stop_flags[run_id] = True

    def _recover_stale_runs(self) -> None:
        """Mark runs left running by a previous web process as interrupted."""
        with self.session_factory() as session:
            running = session.scalars(
                select(BenchmarkRun).where(
                    BenchmarkRun.status.in_(["running", "stopping"])
                )
            ).all()
            changed = False
            for run in running:
                if run.run_id in self._threads:
                    continue
                run.status = "interrupted"
                run.finished_at = _now()
                run.error_message = "Web process restarted before the benchmark completed."
                changed = True
            if changed:
                session.commit()

    def _active_run(self) -> Optional[BenchmarkRun]:
        self._recover_stale_runs()
        with self.session_factory() as session:
            return session.scalars(
                select(BenchmarkRun)
                .where(BenchmarkRun.status.in_(["running", "stopping"]))
                .order_by(BenchmarkRun.started_at.desc())
            ).first()

    def start_run(
        self,
        *,
        suite_id: int,
        config: Optional[Dict[str, Any]],
        actor: str = "",
    ) -> Dict[str, Any]:
        with self._lock:
            active = self._active_run()
            if active is not None:
                raise RuntimeError(f"已有 benchmark 執行中：{active.run_id}")
            with self.session_factory() as session:
                suite = session.get(BenchmarkSuite, int(suite_id))
                if suite is None:
                    raise QuestionBankError(
                        "找不到 benchmark 題庫。",
                        errors=["找不到 benchmark 題庫。"],
                    )
                rows = list(
                    session.execute(
                        select(BenchmarkSuiteItem, QuestionBankItem)
                        .join(
                            QuestionBankItem,
                            QuestionBankItem.id == BenchmarkSuiteItem.item_id,
                        )
                        .where(
                            BenchmarkSuiteItem.suite_id == suite.id,
                            BenchmarkSuiteItem.enabled.is_(True),
                        )
                        .order_by(BenchmarkSuiteItem.id.asc())
                    ).all()
                )
                not_ready = [
                    item.question
                    for _, item in rows
                    if not _item_benchmark_ready(item)
                ]
                if not rows:
                    raise QuestionBankError(
                        "題庫沒有可執行題目。",
                        errors=["請先加入已驗收的題目。"],
                    )
                if not_ready:
                    raise QuestionBankError(
                        "題庫包含尚未驗收或已過期的題目。",
                        errors=not_ready,
                    )
                normalized_config = _default_config(config)
                if not normalized_config["llm_model"]:
                    normalized_config["llm_model"] = self.settings.llm_model
                if not normalized_config["embedding_model"]:
                    normalized_config["embedding_model"] = (
                        self.settings.embedding_model
                    )
                if (
                    normalized_config.get("judge_enabled")
                    and not normalized_config.get("judge_model")
                ):
                    models = available_test_models(self.settings)
                    candidates = [
                        model
                        for model in (models.get("llm") or [])
                        if model != normalized_config["llm_model"]
                    ]
                    normalized_config["judge_model"] = (
                        candidates[0] if candidates else ""
                    )
                run_id = uuid4().hex
                snapshot = {
                    "suite": serialize_suite(
                        suite, items=[(link, item) for link, item in rows]
                    ),
                    "items": [
                        {
                            "item_id": item.id,
                            "item_version": item.version,
                            "fingerprint": item.fingerprint,
                            **(_item_snapshot(item)),
                        }
                        for _, item in rows
                    ],
                }
                index = _active_index(self.session_factory, self.settings)
                run = BenchmarkRun(
                    run_id=run_id,
                    suite_id=suite.id,
                    label=normalized_config["label"],
                    status="running",
                    progress=0,
                    total_cases=len(rows) * int(normalized_config["repeats"]),
                    completed_cases=0,
                    suite_version=int(suite.version or 1),
                    config=normalized_config,
                    config_hash=_config_hash(normalized_config),
                    suite_snapshot=snapshot,
                    index_version=index,
                    created_by=str(actor or "")[:120],
                )
                session.add(run)
                session.flush()
                for link, item in rows:
                    for repeat_index in range(
                        int(normalized_config["repeats"])
                    ):
                        session.add(
                            BenchmarkCaseResult(
                                run_id=run_id,
                                item_id=item.id,
                                item_version=item.version,
                                fingerprint=item.fingerprint,
                                repeat_index=repeat_index,
                                question=item.question,
                                status="pending",
                            )
                        )
                session.commit()
                session.refresh(run)
            thread = threading.Thread(
                target=self._execute,
                args=(run_id,),
                name=f"benchmark-{run_id[:8]}",
                daemon=True,
            )
            self._threads[run_id] = thread
            self._stop_flags[run_id] = False
            thread.start()
            return self.get_run(run_id, include_cases=False) or {
                "run_id": run_id
            }

    def _execute(self, run_id: str) -> None:
        try:
            while True:
                with self.session_factory() as session:
                    run = session.scalars(
                        select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
                    ).first()
                    if run is None:
                        return
                    if self._stop(run_id):
                        run.status = "interrupted"
                        run.finished_at = _now()
                        pending = session.scalars(
                            select(BenchmarkCaseResult).where(
                                BenchmarkCaseResult.run_id == run_id,
                                BenchmarkCaseResult.status == "pending",
                            )
                        ).all()
                        for case in pending:
                            case.status = "skipped"
                            case.finished_at = _now()
                        session.commit()
                        break
                    case = session.scalars(
                        select(BenchmarkCaseResult)
                        .where(
                            BenchmarkCaseResult.run_id == run_id,
                            BenchmarkCaseResult.status == "pending",
                        )
                        .order_by(BenchmarkCaseResult.id.asc())
                    ).first()
                    if case is None:
                        run.status = "success"
                        run.progress = 100
                        run.finished_at = _now()
                        session.commit()
                        break
                    case.status = "running"
                    case.started_at = _now()
                    session.commit()
                    item = next(
                        (
                            entry
                            for entry in (run.suite_snapshot or {}).get(
                                "items", []
                            )
                            if int(entry.get("item_id") or 0)
                            == int(case.item_id)
                            and int(entry.get("item_version") or 0)
                            == int(case.item_version)
                        ),
                        None,
                    )
                    config = dict(run.config or {})
                    work_item = item or {
                        "item_id": case.item_id,
                        "question": case.question,
                        "fingerprint": case.fingerprint,
                        "expected_laws": [],
                        "expected_articles": [],
                        "expected_judgments": [],
                        "rubric": {},
                    }
                    case_id = int(case.id)
                started = time.perf_counter()
                flow = start_flow(
                    entrypoint="benchmark.case",
                    method="BENCHMARK",
                    path=f"/benchmark/{run_id}/{case_id}",
                    params={
                        "run_id": run_id,
                        "item_id": work_item.get("item_id"),
                        "fingerprint": work_item.get("fingerprint"),
                    },
                )
                try:
                    result = answer_question(
                        session_factory=self.session_factory,
                        question=str(work_item.get("question") or ""),
                        settings=_settings_for_config(self.settings, config),
                        enable_law_retrieval=bool(
                            config.get("enable_law_retrieval", True)
                        ),
                    )
                    flow.set_metadata(
                        "question", work_item.get("question") or ""
                    )
                    flow.set_metadata("answer", result.get("answer") or "")
                    flow.set_metadata(
                        "rag_status", result.get("status") or ""
                    )
                    flow.set_metadata(
                        "fingerprint", work_item.get("fingerprint") or ""
                    )
                    flow.finish(status="success")
                    flow_dict = flow.to_dict()
                    metrics = deterministic_metrics(work_item, result)
                    judge: Dict[str, Any] = {"status": "skipped"}
                    if config.get("judge_enabled"):
                        judge = judge_answer(
                            settings=self.settings,
                            model=str(config.get("judge_model") or ""),
                            item=work_item,
                            payload=result,
                        )
                    human: Dict[str, Any] = {"status": "pending"}
                    metrics["scores"] = _case_score(metrics, judge, human)
                    with self.session_factory() as session:
                        current = session.get(BenchmarkCaseResult, case_id)
                        if current is None:
                            return
                        current.status = "success"
                        current.answer = str(result.get("answer") or "")
                        current.answer_source = str(
                            result.get("answer_source") or ""
                        )
                        current.citations = result.get("citations") or []
                        current.law_sources = result.get("law_sources") or []
                        current.retrieval = result.get("retrieval") or {}
                        current.coverage = result.get("coverage") or {}
                        current.metrics = metrics
                        current.stage_ms = _stage_ms(flow_dict)
                        current.flow = flow_dict
                        current.judge = judge
                        current.duration_ms = int(
                            (time.perf_counter() - started) * 1000
                        )
                        current.finished_at = _now()
                        session.commit()
                except Exception as exc:
                    logger.exception("benchmark case failed: %s", case_id)
                    try:
                        flow.finish(status="error", error_message=str(exc))
                    except Exception:
                        pass
                    with self.session_factory() as session:
                        current = session.get(BenchmarkCaseResult, case_id)
                        if current is not None:
                            current.status = "failed"
                            current.error_message = (
                                f"{exc.__class__.__name__}: {exc}"
                            )[:4000]
                            current.duration_ms = int(
                                (time.perf_counter() - started) * 1000
                            )
                            current.finished_at = _now()
                            session.commit()
                finally:
                    clear_flow()
                with self.session_factory() as session:
                    run = session.scalars(
                        select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
                    ).first()
                    if run is not None:
                        completed = int(
                            session.scalar(
                                select(func.count())
                                .select_from(BenchmarkCaseResult)
                                .where(
                                    BenchmarkCaseResult.run_id == run_id,
                                    BenchmarkCaseResult.status.in_(
                                        ["success", "failed", "skipped"]
                                    ),
                                )
                            )
                            or 0
                        )
                        run.completed_cases = completed
                        run.progress = int(
                            round(
                                100
                                * completed
                                / max(1, int(run.total_cases or 1))
                            )
                        )
                        run.updated_at = _now()
                        session.commit()
            self._finalize(run_id)
        except Exception as exc:
            logger.exception("benchmark run failed: %s", run_id)
            with self.session_factory() as session:
                run = session.scalars(
                    select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
                ).first()
                if run is not None:
                    run.status = "failed"
                    run.finished_at = _now()
                    run.error_message = (
                        f"{exc.__class__.__name__}: {exc}"
                    )[:4000]
                    session.commit()
        finally:
            with self._lock:
                self._threads.pop(run_id, None)
                self._stop_flags.pop(run_id, None)

    def _finalize(self, run_id: str) -> None:
        with self.session_factory() as session:
            run = session.scalars(
                select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
            ).first()
            if run is None:
                return
            cases = list(
                session.scalars(
                    select(BenchmarkCaseResult)
                    .where(BenchmarkCaseResult.run_id == run_id)
                    .order_by(BenchmarkCaseResult.id.asc())
                ).all()
            )
            durations = [
                int(case.duration_ms or 0)
                for case in cases
                if case.status == "success"
            ]
            judges = [case.judge or {} for case in cases]
            metrics = [case.metrics or {} for case in cases]
            human = [case.human_review or {} for case in cases]
            judge_scores = [
                item.get("overall")
                for item in judges
                if item.get("status") == "ok" and item.get("overall") is not None
            ]
            human_scores = [
                item.get("overall")
                for item in human
                if item.get("status") == "ok" and item.get("overall") is not None
            ]
            stage_values: Dict[str, List[float]] = {}
            for case in cases:
                for stage_name, value in (case.stage_ms or {}).items():
                    if value is None:
                        continue
                    stage_values.setdefault(str(stage_name), []).append(
                        float(value)
                    )
            stage_summary = {
                stage_name: {
                    "count": len(values),
                    "mean_ms": _mean(values),
                    "p50_ms": _percentile(values, 0.5),
                    "p95_ms": _percentile(values, 0.95),
                }
                for stage_name, values in stage_values.items()
            }
            summary = {
                "total": len(cases),
                "success": sum(1 for case in cases if case.status == "success"),
                "failed": sum(1 for case in cases if case.status == "failed"),
                "skipped": sum(1 for case in cases if case.status == "skipped"),
                "law_recall": _mean(
                    [item.get("law_recall") for item in metrics]
                ),
                "article_recall": _mean(
                    [item.get("article_recall") for item in metrics]
                ),
                "judgment_recall": _mean(
                    [item.get("judgment_recall") for item in metrics]
                ),
                "citation_valid_rate": _mean(
                    [
                        1.0 if item.get("citation_valid") else 0.0
                        for item in metrics
                    ]
                ),
                "refusal_accuracy": _mean(
                    [
                        item.get("refusal_correct")
                        for item in metrics
                        if item.get("refusal_correct") is not None
                    ]
                ),
                "judge_overall": _mean(judge_scores),
                "human_overall": _mean(human_scores),
                "duration_p50_ms": _percentile(durations, 0.5),
                "duration_p95_ms": _percentile(durations, 0.95),
                "duration_ms": int(sum(durations)),
                "stages": stage_summary,
                "score_components": {
                    "law_recall": _mean(
                        [item.get("law_recall") for item in metrics]
                    ),
                    "article_recall": _mean(
                        [item.get("article_recall") for item in metrics]
                    ),
                    "citation_valid_rate": _mean(
                        [
                            1.0 if item.get("citation_valid") else 0.0
                            for item in metrics
                        ]
                    ),
                    "judge_overall": _mean(judge_scores),
                    "human_overall": _mean(human_scores),
                },
            }
            run.summary = summary
            run.finished_at = _now()
            if run.status == "running":
                run.status = "success"
            run.progress = 100
            session.commit()

    def stop_run(self, run_id: str) -> Dict[str, Any]:
        self._set_stop(run_id)
        with self.session_factory() as session:
            run = session.scalars(
                select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
            ).first()
            if run is None:
                raise RuntimeError("找不到 benchmark run。")
            if run.status == "running":
                run.status = "stopping"
                session.commit()
            return {"run_id": run_id, "status": run.status}

    def get_run(
        self,
        run_id: str,
        *,
        include_cases: bool = False,
    ) -> Optional[Dict[str, Any]]:
        with self.session_factory() as session:
            run = session.scalars(
                select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
            ).first()
            if run is None:
                return None
            payload = self._serialize_run(run)
            if include_cases:
                cases = session.scalars(
                    select(BenchmarkCaseResult)
                    .where(BenchmarkCaseResult.run_id == run_id)
                    .order_by(BenchmarkCaseResult.id.asc())
                ).all()
                payload["cases"] = [self._serialize_case(case) for case in cases]
            return payload

    def list_runs(self, *, limit: int = 20) -> List[Dict[str, Any]]:
        self._recover_stale_runs()
        with self.session_factory() as session:
            runs = session.scalars(
                select(BenchmarkRun)
                .order_by(BenchmarkRun.started_at.desc())
                .limit(max(1, min(100, int(limit or 20))))
            ).all()
            return [self._serialize_run(run) for run in runs]

    def review_case(
        self,
        result_id: int,
        *,
        reviewer: str = "",
        scores: Optional[Dict[str, Any]] = None,
        comment: str = "",
    ) -> Dict[str, Any]:
        with self.session_factory() as session:
            case = session.get(BenchmarkCaseResult, int(result_id))
            if case is None:
                raise RuntimeError("找不到 benchmark 題目結果。")
            values = scores or {}
            overall = values.get("overall")
            human = {
                "status": "ok",
                "reviewer": str(reviewer or "")[:120],
                "comment": str(comment or "")[:4000],
                "reviewed_at": _now().isoformat(),
                "scores": values,
                "overall": int(overall) if overall is not None else None,
            }
            case.human_review = human
            metrics = dict(case.metrics or {})
            metrics["scores"] = _case_score(metrics, case.judge or {}, human)
            case.metrics = metrics
            run_id = case.run_id
            session.commit()
        self._refresh_human_summary(run_id)
        with self.session_factory() as session:
            refreshed = session.get(BenchmarkCaseResult, int(result_id))
            return self._serialize_case(refreshed) if refreshed else {}

    def _refresh_human_summary(self, run_id: str) -> None:
        with self.session_factory() as session:
            run = session.scalars(
                select(BenchmarkRun).where(BenchmarkRun.run_id == run_id)
            ).first()
            if run is None:
                return
            cases = session.scalars(
                select(BenchmarkCaseResult).where(
                    BenchmarkCaseResult.run_id == run_id
                )
            ).all()
            human_scores = [
                (case.human_review or {}).get("overall")
                for case in cases
                if (case.human_review or {}).get("status") == "ok"
                and (case.human_review or {}).get("overall") is not None
            ]
            human_overall = _mean(human_scores)
            summary = dict(run.summary or {})
            summary["human_overall"] = human_overall
            components = dict(summary.get("score_components") or {})
            components["human_overall"] = human_overall
            summary["score_components"] = components
            run.summary = summary
            session.commit()

    def fingerprint_history(
        self, fingerprint: str, *, limit: int = 50
    ) -> List[Dict[str, Any]]:
        with self.session_factory() as session:
            rows = list(
                session.execute(
                    select(BenchmarkCaseResult, BenchmarkRun)
                    .join(
                        BenchmarkRun,
                        BenchmarkRun.run_id == BenchmarkCaseResult.run_id,
                    )
                    .where(
                        BenchmarkCaseResult.fingerprint == str(fingerprint or "")
                    )
                    .order_by(BenchmarkRun.started_at.desc())
                    .limit(max(1, min(200, int(limit or 50))))
                ).all()
            )
            return [
                {
                    **self._serialize_case(case),
                    "run": {
                        "run_id": run.run_id,
                        "label": run.label,
                        "status": run.status,
                        "config": run.config or {},
                        "index_version": run.index_version or {},
                        "started_at": _iso(run.started_at),
                        "suite_version": run.suite_version,
                        "summary": run.summary or {},
                    },
                }
                for case, run in rows
            ]

    def latest_successful_answers(
        self, item_ids: Sequence[int]
    ) -> Dict[int, Dict[str, Any]]:
        """Return the most recent successful RAG answer for each question item."""
        ids = sorted({int(value) for value in item_ids if int(value)})
        if not ids:
            return {}
        with self.session_factory() as session:
            latest = (
                select(
                    BenchmarkCaseResult.item_id.label("item_id"),
                    func.max(BenchmarkCaseResult.id).label("result_id"),
                )
                .where(
                    BenchmarkCaseResult.item_id.in_(ids),
                    BenchmarkCaseResult.status == "success",
                    BenchmarkCaseResult.answer != "",
                )
                .group_by(BenchmarkCaseResult.item_id)
                .subquery()
            )
            rows = session.execute(
                select(BenchmarkCaseResult, BenchmarkRun)
                .join(
                    BenchmarkRun,
                    BenchmarkRun.run_id == BenchmarkCaseResult.run_id,
                )
                .join(latest, BenchmarkCaseResult.id == latest.c.result_id)
                .order_by(BenchmarkCaseResult.id.asc())
            ).all()
            return {
                int(case.item_id): self._serialize_answer_summary(case, run)
                for case, run in rows
            }

    @staticmethod
    def _serialize_answer_summary(
        case: BenchmarkCaseResult, run: BenchmarkRun
    ) -> Dict[str, Any]:
        law_sources = []
        for source in case.law_sources or []:
            if not isinstance(source, dict):
                continue
            law_sources.append(
                {
                    "index": source.get("index"),
                    "law_name": source.get("law_name") or "",
                    "law_key": source.get("law_key") or "",
                    "law_url": source.get("law_url") or "",
                    "source_type": source.get("source_type") or "",
                    "source_label": source.get("source_label") or "",
                    "article_count": source.get("article_count"),
                    "articles": [
                        {"article_no": article.get("article_no") or ""}
                        for article in (source.get("articles") or [])
                        if isinstance(article, dict)
                    ],
                }
            )
        metrics = case.metrics or {}
        scores = metrics.get("scores")
        config = run.config or {}
        return {
            "result_id": int(case.id),
            "item_id": int(case.item_id),
            "item_version": int(case.item_version or 1),
            "run_id": run.run_id,
            "run_label": run.label,
            "run_status": run.status,
            "run_started_at": _iso(run.started_at),
            "finished_at": _iso(case.finished_at),
            "answer": case.answer,
            "answer_source": case.answer_source,
            "citations": case.citations or [],
            "law_sources": law_sources,
            "duration_ms": int(case.duration_ms or 0),
            "llm_model": str(config.get("llm_model") or ""),
            "embedding_model": str(config.get("embedding_model") or ""),
            "metrics": {
                "law_recall": metrics.get("law_recall"),
                "article_recall": metrics.get("article_recall"),
                "judgment_recall": metrics.get("judgment_recall"),
                "citation_valid": metrics.get("citation_valid"),
                "answer_length": metrics.get("answer_length"),
                "scores": scores if isinstance(scores, dict) else {},
            },
        }

    def _serialize_run(self, run: BenchmarkRun) -> Dict[str, Any]:
        return {
            "id": run.id,
            "run_id": run.run_id,
            "suite_id": run.suite_id,
            "label": run.label,
            "status": run.status,
            "progress": int(run.progress or 0),
            "total_cases": int(run.total_cases or 0),
            "completed_cases": int(run.completed_cases or 0),
            "suite_version": int(run.suite_version or 1),
            "config": run.config or {},
            "config_hash": run.config_hash,
            "index_version": run.index_version or {},
            "suite_snapshot": run.suite_snapshot or {},
            "started_at": _iso(run.started_at),
            "finished_at": _iso(run.finished_at),
            "updated_at": _iso(run.updated_at),
            "summary": run.summary or {},
            "error_message": run.error_message,
            "created_by": run.created_by,
        }

    def _serialize_case(self, case: BenchmarkCaseResult) -> Dict[str, Any]:
        return {
            "id": case.id,
            "run_id": case.run_id,
            "item_id": case.item_id,
            "item_version": case.item_version,
            "fingerprint": case.fingerprint,
            "repeat_index": case.repeat_index,
            "question": case.question,
            "status": case.status,
            "answer": case.answer,
            "answer_source": case.answer_source,
            "citations": case.citations or [],
            "law_sources": case.law_sources or [],
            "retrieval": case.retrieval or {},
            "coverage": case.coverage or {},
            "metrics": case.metrics or {},
            "stage_ms": case.stage_ms or {},
            "flow": case.flow or {},
            "judge": case.judge or {},
            "human_review": case.human_review or {},
            "duration_ms": int(case.duration_ms or 0),
            "error_message": case.error_message,
            "started_at": _iso(case.started_at),
            "finished_at": _iso(case.finished_at),
        }
