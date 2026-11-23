from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import threading
import time
from dataclasses import replace
from datetime import date, datetime, timedelta, timezone
from typing import (
    Any,
    Dict,
    Iterable,
    List,
    Mapping,
    Optional,
    Sequence,
    Tuple,
)

from sqlalchemy import Text, cast, delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..index_versions import active_version
from ..legal_index import active_legal_version
from ..models import (
    JudgmentSnapshot,
    LawDatasetVersion,
    QuestionBankItem,
    RagFeedback,
    RagFeedbackEvaluation,
    RagFeedbackEvent,
    RagFeedbackExperiment,
    RagFeedbackExport,
    RagFeedbackIssue,
    RagFeedbackReason,
    RagInteraction,
)
from ..question_bank import (
    QuestionBankError,
    create_item,
    question_fingerprint,
    serialize_item,
)
from .client_ip import hashed_client_ip_key
from .demo_mode import sanitize_feedback_snapshot

logger = logging.getLogger(__name__)

FEEDBACK_REASONS: Dict[str, str] = {
    "wrong_citation": "引用或條號有誤",
    "incomplete": "答案不完整",
    "wrong_question": "不是我問的",
    "wrong_refusal": "不該拒答卻拒答",
    "slow_or_error": "回應太慢或出錯",
    "not_helpful": "內容沒有幫助或無法使用",
    "tone_style": "風格或語氣",
    "safety_legal": "安全或法律疑慮",
    "other": "其他",
}

FEEDBACK_STATUSES = (
    "new",
    "triaged",
    "planned",
    "resolved",
    "dismissed",
)
FEEDBACK_STATUS_LABELS = {
    "new": "待處理",
    "triaged": "已分類",
    "planned": "已排入",
    "resolved": "已解決",
    "dismissed": "不處理",
}
SEVERITIES = ("low", "medium", "high")
SEVERITY_LABELS = {"low": "低", "medium": "中", "high": "高"}

ROOT_CAUSE_STAGES: Dict[str, str] = {
    "unknown": "尚未判定",
    "query_parse": "問題解析／日期條件",
    "financial_scope": "金融範圍判斷",
    "law_retrieval": "法規／命令檢索",
    "judgment_retrieval": "判決檢索",
    "reranker": "Reranker 排序",
    "context_builder": "Context 組裝",
    "llm_generation": "LLM 生成",
    "citation_audit": "引用驗證",
    "answer_routing": "回答模式路由",
    "refusal_policy": "拒答政策",
    "data_quality": "資料品質／版本",
}

ANSWER_VERDICTS: Dict[str, str] = {
    "unknown": "尚未判定",
    "correct": "正確",
    "partial": "部分正確",
    "incorrect": "錯誤",
}

EXPECTED_ANSWER_MODES: Dict[str, str] = {
    "unknown": "尚未指定",
    "law_first": "法規優先",
    "list": "判決列表",
    "structured": "結構化回答",
    "semantic": "一般語意問答",
    "refusal": "應拒答",
}

EXPECTED_REFUSALS: Dict[str, str] = {
    "unspecified": "未指定",
    "should_answer": "應該回答",
    "should_refuse": "應該拒答",
}

CITATION_VERDICTS: Dict[str, str] = {
    "supports": "支持答案",
    "irrelevant": "與答案無關",
    "wrong": "內容或條號錯誤",
    "unsure": "不確定",
}

ISSUE_STATUSES: Dict[str, str] = {
    "open": "待處理",
    "triaged": "已分類",
    "planned": "已排入",
    "resolved": "已解決",
    "dismissed": "不處理",
}

REVIEW_STATUSES = ("new", "reviewed", "dismissed")
REVIEW_STATUS_LABELS = {
    "new": "待審",
    "reviewed": "已檢視",
    "dismissed": "略過",
}

SNAPSHOT_VERSION = 1
SNAPSHOT_MAX_BYTES = 256 * 1024
COMMENT_MAX_LENGTH = 4000
_FALLBACK_SECRET = secrets.token_urlsafe(32)

_VERSION_CACHE_LOCK = threading.Lock()
_VERSION_CACHE: Dict[str, Any] = {"expires_at": 0.0, "value": {}}

_PRIVATE_TRACE_KEYS = frozenset(
    {
        "question",
        "answer",
        "prompt",
        "prompts",
        "messages",
        "context",
        "contexts",
        "full_text",
        "raw_text",
        "positive_jids",
        "negative_jids",
        "excluded_jids",
    }
)

_JUDGMENT_KEYS = (
    "index",
    "jid",
    "court",
    "jdate",
    "title",
    "score",
    "snippet",
    "matched_laws",
    "law_citations",
    "citation_count",
    "pdf_url",
    "used_for_generation",
)
_LAW_SOURCE_KEYS = (
    "index",
    "law_name",
    "law_level",
    "source_label",
    "article_no",
    "article_count",
    "snippet",
    "text",
    "matched_terms",
    "score",
    "used_for_generation",
)
_REFERENCE_KEYS = (
    "jid",
    "court",
    "jdate",
    "title",
    "score",
    "matched_laws",
)
_SNAPSHOT_KEYS = (
    "question",
    "answer",
    "status",
    "answer_source",
    "notice",
    "matched_terms",
    "law_answer",
    "law_framework",
    "llm_model",
    "embedding_model",
    "duration_ms",
    "show_sources",
    "rerank_degraded",
    "degraded_reason",
    "citation_retry",
    "citation_audit",
    "coverage",
)


class FeedbackError(Exception):
    """A feedback request failure with an HTTP status and stable code."""

    def __init__(
        self,
        status_code: int,
        code: str,
        detail: str,
    ) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.code = code
        self.detail = detail


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _aware(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    aware = _aware(value)
    return aware.isoformat() if aware else None


def _secret(settings: Settings) -> str:
    return str(
        settings.feedback_secret
        or settings.auth_session_secret
        or settings.admin_token
        or _FALLBACK_SECRET
    )


def _client_hash(client_ip: str, settings: Settings) -> str:
    return hashed_client_ip_key(client_ip, _secret(settings))


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64decode(value: str) -> bytes:
    padded = value + ("=" * (-len(value) % 4))
    return base64.urlsafe_b64decode(padded.encode("ascii"))


def make_feedback_token(
    request_id: str,
    settings: Settings,
    *,
    issued_at: Optional[datetime] = None,
    ttl_seconds: Optional[int] = None,
) -> str:
    """Return a signed capability token bound to one RAG request."""

    now = _aware(issued_at or _utcnow()) or _utcnow()
    ttl = max(
        1,
        int(
            ttl_seconds
            if ttl_seconds is not None
            else settings.rag_feedback_token_ttl_seconds
        ),
    )
    payload = {
        "v": 1,
        "rid": str(request_id),
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + ttl,
    }
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode(
        "utf-8"
    )
    body = _b64encode(raw)
    signature = hmac.new(
        _secret(settings).encode("utf-8"),
        body.encode("ascii"),
        hashlib.sha256,
    ).digest()
    return f"{body}.{_b64encode(signature)}"


def parse_feedback_token(token: str, settings: Settings) -> Optional[Dict[str, Any]]:
    """Validate the token signature and return its payload.

    Expiry is checked separately by the caller so the API can distinguish an
    expired capability (410) from a forged or malformed one (403).
    """

    try:
        body, signature = str(token or "").split(".", 1)
        expected = hmac.new(
            _secret(settings).encode("utf-8"),
            body.encode("ascii"),
            hashlib.sha256,
        ).digest()
        if not hmac.compare_digest(signature, _b64encode(expected)):
            return None
        payload = json.loads(_b64decode(body).decode("utf-8"))
    except (TypeError, ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict) or payload.get("v") != 1:
        return None
    if not str(payload.get("rid") or ""):
        return None
    return payload


def _trim_snapshot(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    """Keep the replay under the configured per-row size budget."""

    encoded = json.dumps(snapshot, ensure_ascii=False, default=str)
    if len(encoded.encode("utf-8")) <= SNAPSHOT_MAX_BYTES:
        return snapshot

    snapshot.pop("reference_judgments", None)
    for key in ("citations", "judgments", "law_sources"):
        rows = snapshot.get(key)
        if isinstance(rows, list):
            snapshot[key] = rows[:20]
            for row in snapshot[key]:
                if isinstance(row, dict):
                    for text_key in ("snippet", "text", "law_answer"):
                        value = row.get(text_key)
                        if isinstance(value, str) and len(value) > 600:
                            row[text_key] = value[:600]
    encoded = json.dumps(snapshot, ensure_ascii=False, default=str)
    if len(encoded.encode("utf-8")) <= SNAPSHOT_MAX_BYTES:
        return snapshot

    snapshot.pop("law_framework", None)
    snapshot.pop("law_answer", None)
    flow = snapshot.get("pipeline_flow")
    if isinstance(flow, dict):
        segments = flow.get("segments")
        if isinstance(segments, list):
            flow["segments"] = [
                {key: value for key, value in segment.items() if key != "params"}
                if isinstance(segment, dict)
                else segment
                for segment in segments
            ]
        decisions = flow.get("decisions")
        if isinstance(decisions, list):
            flow["decisions"] = decisions[:100]
    return snapshot


def _strip_private_keys(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _strip_private_keys(item)
            for key, item in value.items()
            if key not in _PRIVATE_TRACE_KEYS
        }
    if isinstance(value, list):
        return [_strip_private_keys(item) for item in value]
    return value


def _pick(value: Mapping[str, Any], keys: Sequence[str]) -> Dict[str, Any]:
    return {key: value[key] for key in keys if key in value}


def build_interaction_snapshot(
    question: str,
    result: Mapping[str, Any],
    pipeline_flow: Optional[Mapping[str, Any]],
) -> Dict[str, Any]:
    """Build the admin-only replay snapshot from the server result."""

    snapshot = _pick(result, _SNAPSHOT_KEYS)
    snapshot["question"] = str(question or "")
    snapshot["citations"] = [
        _pick(item, _JUDGMENT_KEYS)
        for item in result.get("citations") or []
        if isinstance(item, Mapping)
    ]
    snapshot["judgments"] = [
        _pick(item, _JUDGMENT_KEYS)
        for item in result.get("judgments") or []
        if isinstance(item, Mapping)
    ]
    snapshot["reference_judgments"] = [
        _pick(item, _REFERENCE_KEYS)
        for item in result.get("reference_judgments") or []
        if isinstance(item, Mapping)
    ]
    snapshot["law_sources"] = [
        _pick(item, _LAW_SOURCE_KEYS)
        for item in result.get("law_sources") or []
        if isinstance(item, Mapping)
    ]
    if isinstance(result.get("retrieval"), Mapping):
        snapshot["retrieval"] = _strip_private_keys(
            dict(result["retrieval"])
        )
    if isinstance(pipeline_flow, Mapping):
        snapshot["pipeline_flow"] = _strip_private_keys(
            dict(pipeline_flow)
        )
    clean = sanitize_feedback_snapshot(snapshot)
    return _trim_snapshot(clean)


def _database_versions(
    session_factory: Optional[sessionmaker[Session]],
    settings: Settings,
) -> Dict[str, Any]:
    now = time.monotonic()
    with _VERSION_CACHE_LOCK:
        if now < float(_VERSION_CACHE["expires_at"] or 0):
            return dict(_VERSION_CACHE["value"])
    versions: Dict[str, Any] = {
        "law_dataset_version_id": None,
        "judgment_snapshot_id": None,
        "judgment_index_version_id": None,
        "legal_article_index_version_id": None,
    }
    if session_factory is not None:
        try:
            with session_factory() as session:
                versions["law_dataset_version_id"] = session.scalar(
                    select(func.max(LawDatasetVersion.id))
                )
                versions["judgment_snapshot_id"] = session.scalar(
                    select(func.max(JudgmentSnapshot.id))
                )
            judgment_index = active_version(
                session_factory, alias_name=settings.judgment_vector_alias
            )
            if judgment_index:
                versions["judgment_index_version_id"] = judgment_index.get(
                    "version_id"
                )
            legal_index = active_legal_version(
                session_factory,
                alias_name=settings.legal_article_vector_alias,
            )
            if legal_index:
                versions["legal_article_index_version_id"] = legal_index.get(
                    "version_id"
                )
        except Exception:
            logger.debug("feedback system version lookup failed", exc_info=True)
    with _VERSION_CACHE_LOCK:
        _VERSION_CACHE["expires_at"] = now + 60.0
        _VERSION_CACHE["value"] = dict(versions)
    return versions


def system_version(
    session_factory: Optional[sessionmaker[Session]],
    settings: Settings,
    *,
    result: Optional[Mapping[str, Any]] = None,
    pipeline_flow: Optional[Mapping[str, Any]] = None,
) -> Dict[str, Any]:
    versions = _database_versions(session_factory, settings)
    result = result or {}
    flow = pipeline_flow or {}
    return {
        "git_commit": (
            os.getenv("JUDGMENT_GIT_COMMIT", "").strip()
            or os.getenv("GIT_COMMIT", "").strip()
            or "unknown"
        ),
        **versions,
        "decision_trace_version": flow.get("decision_version", 1),
        "prompt_version": settings.rag_prompt_version or "unknown",
        "llm_model": result.get("llm_model") or settings.llm_model or "",
        "embedding_model": (
            result.get("embedding_model") or settings.embedding_model or ""
        ),
        "reranker_model": settings.rerank_model or "",
    }


def record_interaction(
    session_factory: Optional[sessionmaker[Session]],
    settings: Settings,
    *,
    request_id: str,
    question: str,
    result: Mapping[str, Any],
    pipeline_flow: Optional[Mapping[str, Any]],
    client_ip: str,
    is_demo: bool,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Persist a replay snapshot and return the feedback capability.

    This is best-effort and must never fail the RAG response.  A duplicate
    request id (for example a retried stream) updates the existing snapshot.
    """

    request_id = str(request_id or "").strip()
    if not request_id or session_factory is None:
        return {}
    created_at = _aware(now or _utcnow()) or _utcnow()
    expires_at = created_at + timedelta(
        days=max(1, int(settings.rag_interaction_retention_days))
    )
    snapshot = build_interaction_snapshot(
        question, result, pipeline_flow
    )
    version = system_version(
        session_factory,
        settings,
        result=result,
        pipeline_flow=pipeline_flow,
    )
    try:
        client_hash = _client_hash(client_ip, settings)
    except Exception:
        client_hash = ""
    try:
        with session_factory() as session:
            row = session.scalars(
                select(RagInteraction).where(
                    RagInteraction.request_id == request_id
                )
            ).first()
            if row is None:
                row = RagInteraction(
                    request_id=request_id,
                    created_at=created_at,
                    expires_at=expires_at,
                )
                session.add(row)
            row.question = str(question or "")
            row.answer = str(result.get("answer") or "")
            row.answer_source = str(result.get("answer_source") or "")[:32]
            row.status = str(result.get("status") or "")[:32]
            row.notice = str(result.get("notice") or "")
            row.response_snapshot = snapshot
            row.snapshot_version = SNAPSHOT_VERSION
            row.system_version = version
            row.client_key_hash = client_hash
            row.is_demo = bool(is_demo)
            row.expires_at = expires_at
            session.commit()
    except Exception:
        logger.warning("RAG interaction snapshot write failed", exc_info=True)
        return {}
    token = make_feedback_token(request_id, settings, issued_at=created_at)
    payload = parse_feedback_token(token, settings) or {}
    return {
        "token": token,
        "expires_at": datetime.fromtimestamp(
            int(payload.get("exp") or 0), tz=timezone.utc
        ).isoformat(),
        "editable_seconds": max(0, int(settings.rag_feedback_edit_seconds)),
    }


def _reason_codes(reasons: Iterable[str]) -> List[str]:
    result: List[str] = []
    for value in reasons:
        code = str(value or "").strip()
        if not code:
            continue
        if code not in FEEDBACK_REASONS:
            raise FeedbackError(
                422,
                "invalid_feedback_reason",
                f"未知的回饋原因：{code}",
            )
        if code not in result:
            result.append(code)
    return result


def submit_feedback(
    session_factory: sessionmaker[Session],
    settings: Settings,
    *,
    request_id: str,
    feedback_token: str,
    sentiment: str,
    reasons: Iterable[str],
    comment: str,
    client_ip: str,
    is_demo: bool,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Create or update one feedback row for a RAG answer."""

    request_id = str(request_id or "").strip()
    sentiment = str(sentiment or "").strip().lower()
    if sentiment not in {"satisfied", "unsatisfied"}:
        raise FeedbackError(422, "invalid_sentiment", "回饋必須是滿意或不滿意。")
    payload = parse_feedback_token(feedback_token, settings)
    if payload is None:
        raise FeedbackError(
            403, "invalid_feedback_token", "回饋連結無效，請重新取得回答。"
        )
    if str(payload.get("rid") or "") != request_id:
        raise FeedbackError(
            403, "feedback_token_mismatch", "回饋連結與這則回答不符。"
        )
    current = _aware(now or _utcnow()) or _utcnow()
    if int(payload.get("exp") or 0) <= int(current.timestamp()):
        raise FeedbackError(
            410, "feedback_expired", "此回答已超過回饋期限。"
        )

    codes = _reason_codes(reasons)
    text = str(comment or "").strip()
    if len(text) > COMMENT_MAX_LENGTH:
        raise FeedbackError(422, "comment_too_long", "留言最多 4000 字。")
    if sentiment == "unsatisfied" and not codes:
        raise FeedbackError(
            422, "feedback_reason_required", "請至少選一個不滿意的原因。"
        )

    with session_factory() as session:
        interaction = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == request_id
            )
        ).first()
        if interaction is None:
            raise FeedbackError(
                404, "interaction_not_found", "找不到這則回答的快照。"
            )
        interaction_expires = _aware(interaction.expires_at)
        if interaction_expires and interaction_expires <= current:
            raise FeedbackError(
                410, "feedback_expired", "此回答已超過回饋期限。"
            )
        client_hash = _client_hash(client_ip, settings)
        row = session.scalars(
            select(RagFeedback).where(
                RagFeedback.request_id == request_id,
                RagFeedback.client_key_hash == client_hash,
            )
        ).first()
        created = row is None
        if row is None:
            row = RagFeedback(
                interaction_id=interaction.id,
                request_id=request_id,
                client_key_hash=client_hash,
                sentiment=sentiment,
                primary_reason=codes[0] if codes else "",
                comment=text,
                snapshot=interaction.response_snapshot or {},
                snapshot_version=int(interaction.snapshot_version or 1),
                system_version=interaction.system_version or {},
                is_demo=bool(is_demo),
                status="new",
                severity="medium",
                actionable=False,
                created_at=current,
                editable_until=current
                + timedelta(
                    seconds=max(0, int(settings.rag_feedback_edit_seconds))
                ),
                expires_at=current
                + timedelta(
                    days=max(1, int(settings.rag_feedback_retention_days))
                ),
            )
            session.add(row)
            session.flush()
        else:
            if _aware(row.editable_until) and _aware(row.editable_until) < current:
                raise FeedbackError(
                    409,
                    "feedback_edit_window_closed",
                    "此回饋已超過 15 分鐘修改期限。",
                )
            row.revision = int(row.revision or 1) + 1
            row.updated_at = current
            session.execute(
                delete(RagFeedbackReason).where(
                    RagFeedbackReason.feedback_id == row.id
                )
            )
        row.sentiment = sentiment
        row.primary_reason = codes[0] if codes else ""
        row.comment = text
        row.snapshot = interaction.response_snapshot or {}
        row.snapshot_version = int(interaction.snapshot_version or 1)
        row.system_version = interaction.system_version or {}
        row.is_demo = bool(is_demo)
        row.expires_at = max(
            _aware(row.expires_at) or current,
            current
            + timedelta(
                days=max(1, int(settings.rag_feedback_retention_days))
            ),
        )
        for code in codes:
            session.add(
                RagFeedbackReason(feedback_id=row.id, reason_code=code)
            )
        session.add(
            RagFeedbackEvent(
                feedback_id=row.id,
                event_type="created" if created else "updated",
                from_status="" if created else row.status,
                to_status=row.status,
                actor="visitor" if is_demo else "user",
                comment="",
            )
        )
        try:
            session.commit()
        except IntegrityError as exc:
            session.rollback()
            raise FeedbackError(
                409, "feedback_conflict", "回饋已存在，請重新整理後再試。"
            ) from exc
        session.refresh(row)
        return serialize_feedback(row, codes)


def serialize_feedback(
    row: RagFeedback,
    reasons: Optional[Sequence[str]] = None,
    *,
    include_snapshot: bool = False,
) -> Dict[str, Any]:
    snapshot = row.snapshot or {}
    payload = {
        "id": row.id,
        "request_id": row.request_id,
        "sentiment": row.sentiment,
        "reasons": list(reasons or []),
        "primary_reason": row.primary_reason,
        "comment": row.comment,
        "revision": int(row.revision or 1),
        "editable_until": _iso(row.editable_until),
        "status": row.status,
        "severity": row.severity,
        "actionable": bool(row.actionable),
        "expected_behavior": row.expected_behavior,
        "root_cause_stage": row.root_cause_stage or "unknown",
        "answer_verdict": row.answer_verdict or "unknown",
        "expected_answer_mode": row.expected_answer_mode or "unknown",
        "expected_refusal": row.expected_refusal or "unspecified",
        "expected_date_from": (
            row.expected_date_from.isoformat()
            if row.expected_date_from
            else None
        ),
        "expected_date_to": (
            row.expected_date_to.isoformat()
            if row.expected_date_to
            else None
        ),
        "citation_verdicts": row.citation_verdicts or {},
        "issue_id": row.issue_id,
        "linked_question_id": row.linked_question_id,
        "linked_pr_url": row.linked_pr_url,
        "reviewed_by": row.reviewed_by,
        "review_comment": row.review_comment,
        "created_at": _iso(row.created_at),
        "updated_at": _iso(row.updated_at),
        "reviewed_at": _iso(row.reviewed_at),
        "is_demo": bool(row.is_demo),
        "question": str(snapshot.get("question") or ""),
        "answer_source": str(snapshot.get("answer_source") or ""),
        "answer_status": str(snapshot.get("status") or ""),
        "llm_model": str(snapshot.get("llm_model") or ""),
        "duration_ms": snapshot.get("duration_ms"),
        "system_version": row.system_version or {},
    }
    if include_snapshot:
        payload["snapshot"] = snapshot
        payload["events"] = []
    return payload


def _reasons_for(
    session: Session, feedback_ids: Sequence[int]
) -> Dict[int, List[str]]:
    if not feedback_ids:
        return {}
    rows = session.execute(
        select(
            RagFeedbackReason.feedback_id,
            RagFeedbackReason.reason_code,
        ).where(RagFeedbackReason.feedback_id.in_(feedback_ids))
    ).all()
    grouped: Dict[int, List[str]] = {}
    for feedback_id, reason_code in rows:
        grouped.setdefault(int(feedback_id), []).append(str(reason_code))
    order = {code: index for index, code in enumerate(FEEDBACK_REASONS)}
    for feedback_id, codes in grouped.items():
        grouped[feedback_id] = sorted(
            codes, key=lambda code: order.get(code, len(order))
        )
    return grouped


def _feedback_filters(statement, filters: Mapping[str, Any]):
    sentiment = str(filters.get("sentiment") or "").strip()
    if sentiment:
        statement = statement.where(RagFeedback.sentiment == sentiment)
    status = str(filters.get("status") or "").strip()
    if status:
        statement = statement.where(RagFeedback.status == status)
    severity = str(filters.get("severity") or "").strip()
    if severity:
        statement = statement.where(RagFeedback.severity == severity)
    if filters.get("actionable") in {True, "1", "true", "yes"}:
        statement = statement.where(RagFeedback.actionable.is_(True))
    issue_id = str(filters.get("issue_id") or "").strip()
    if issue_id:
        try:
            statement = statement.where(
                RagFeedback.issue_id == int(issue_id)
            )
        except (TypeError, ValueError) as exc:
            raise FeedbackError(
                422, "invalid_issue_id", "問題群組編號不正確。"
            ) from exc
    root_cause = str(filters.get("root_cause_stage") or "").strip()
    if root_cause:
        statement = statement.where(
            RagFeedback.root_cause_stage == root_cause
        )
    answer_verdict = str(filters.get("answer_verdict") or "").strip()
    if answer_verdict:
        statement = statement.where(
            RagFeedback.answer_verdict == answer_verdict
        )
    expected_refusal = str(filters.get("expected_refusal") or "").strip()
    if expected_refusal:
        statement = statement.where(
            RagFeedback.expected_refusal == expected_refusal
        )
    reason = str(filters.get("reason") or "").strip()
    if reason:
        statement = statement.where(
            RagFeedback.id.in_(
                select(RagFeedbackReason.feedback_id).where(
                    RagFeedbackReason.reason_code == reason
                )
            )
        )
    request_id = str(filters.get("request_id") or "").strip()
    if request_id:
        statement = statement.where(RagFeedback.request_id == request_id)
    keyword = str(filters.get("keyword") or "").strip()
    if keyword:
        pattern = f"%{keyword}%"
        statement = statement.where(
            or_(
                RagFeedback.request_id.ilike(pattern),
                RagFeedback.comment.ilike(pattern),
                RagFeedback.expected_behavior.ilike(pattern),
                cast(RagFeedback.snapshot, Text).ilike(pattern),
            )
        )
    date_from = filters.get("from_date")
    if date_from:
        statement = statement.where(
            RagFeedback.created_at
            >= datetime.combine(
                _parse_date(date_from), datetime.min.time(), tzinfo=timezone.utc
            )
        )
    date_to = filters.get("to_date")
    if date_to:
        statement = statement.where(
            RagFeedback.created_at
            <= datetime.combine(
                _parse_date(date_to), datetime.max.time(), tzinfo=timezone.utc
            )
        )
    return statement


def _parse_date(value: Any):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        text = value.strip()
        for fmt in ("%Y-%m-%d", "%Y%m%d", "%Y/%m/%d"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
    raise FeedbackError(422, "invalid_date", "日期格式必須是 YYYY-MM-DD。")


def list_feedback(
    session_factory: sessionmaker[Session],
    *,
    filters: Optional[Mapping[str, Any]] = None,
    page: int = 1,
    page_size: int = 25,
) -> Dict[str, Any]:
    filters = filters or {}
    current_page = max(1, int(page or 1))
    size = max(1, min(200, int(page_size or 25)))
    with session_factory() as session:
        statement = _feedback_filters(select(RagFeedback), filters)
        total = int(
            session.scalar(
                select(func.count()).select_from(statement.subquery())
            )
            or 0
        )
        rows = session.scalars(
            statement.order_by(RagFeedback.created_at.desc())
            .offset((current_page - 1) * size)
            .limit(size)
        ).all()
        reasons = _reasons_for(session, [int(row.id) for row in rows])
        items = [
            serialize_feedback(row, reasons.get(int(row.id), []))
            for row in rows
        ]
    return {
        "items": items,
        "page": current_page,
        "page_size": size,
        "total": total,
        "pages": max(1, (total + size - 1) // size),
        "filters": dict(filters),
        "reason_options": [
            {"code": code, "label": label}
            for code, label in FEEDBACK_REASONS.items()
        ],
        "status_options": [
            {"code": code, "label": FEEDBACK_STATUS_LABELS[code]}
            for code in FEEDBACK_STATUSES
        ],
        "severity_options": [
            {"code": code, "label": SEVERITY_LABELS[code]}
            for code in SEVERITIES
        ],
    }


def feedback_stats(session_factory: sessionmaker[Session]) -> Dict[str, Any]:
    with session_factory() as session:
        total = int(
            session.scalar(select(func.count()).select_from(RagFeedback)) or 0
        )
        satisfied = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedback)
                .where(RagFeedback.sentiment == "satisfied")
            )
            or 0
        )
        unsatisfied = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedback)
                .where(RagFeedback.sentiment == "unsatisfied")
            )
            or 0
        )
        new_count = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedback)
                .where(RagFeedback.status == "new")
            )
            or 0
        )
        actionable = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedback)
                .where(RagFeedback.actionable.is_(True))
            )
            or 0
        )
        reason_rows = session.execute(
            select(
                RagFeedbackReason.reason_code,
                func.count(),
            )
            .group_by(RagFeedbackReason.reason_code)
            .order_by(func.count().desc())
        ).all()
        status_rows = session.execute(
            select(RagFeedback.status, func.count()).group_by(RagFeedback.status)
        ).all()
        root_cause_rows = session.execute(
            select(RagFeedback.root_cause_stage, func.count())
            .where(RagFeedback.root_cause_stage != "unknown")
            .group_by(RagFeedback.root_cause_stage)
            .order_by(func.count().desc())
        ).all()
        answer_verdict_rows = session.execute(
            select(RagFeedback.answer_verdict, func.count())
            .where(RagFeedback.answer_verdict != "unknown")
            .group_by(RagFeedback.answer_verdict)
            .order_by(func.count().desc())
        ).all()
        expected_refusal_rows = session.execute(
            select(RagFeedback.expected_refusal, func.count())
            .where(RagFeedback.expected_refusal != "unspecified")
            .group_by(RagFeedback.expected_refusal)
        ).all()
        open_issues = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedbackIssue)
                .where(
                    RagFeedbackIssue.status.notin_(("resolved", "dismissed"))
                )
            )
            or 0
        )
        issue_rows = session.execute(
            select(
                RagFeedbackIssue.id,
                RagFeedbackIssue.title,
                RagFeedbackIssue.status,
                RagFeedbackIssue.root_cause_stage,
                func.count(RagFeedback.id),
            )
            .outerjoin(
                RagFeedback,
                RagFeedback.issue_id == RagFeedbackIssue.id,
            )
            .group_by(
                RagFeedbackIssue.id,
                RagFeedbackIssue.title,
                RagFeedbackIssue.status,
                RagFeedbackIssue.root_cause_stage,
            )
            .order_by(func.count(RagFeedback.id).desc())
            .limit(20)
        ).all()
    return {
        "total": total,
        "satisfied": satisfied,
        "unsatisfied": unsatisfied,
        "unsatisfied_rate": (
            round(unsatisfied / total * 100, 2) if total else None
        ),
        "new": new_count,
        "actionable": actionable,
        "by_reason": [
            {
                "code": str(code),
                "label": FEEDBACK_REASONS.get(str(code), str(code)),
                "count": int(count),
            }
            for code, count in reason_rows
        ],
        "by_status": {
            str(code): int(count) for code, count in status_rows
        },
        "by_root_cause": [
            {
                "code": str(code),
                "label": ROOT_CAUSE_STAGES.get(str(code), str(code)),
                "count": int(count),
            }
            for code, count in root_cause_rows
        ],
        "by_answer_verdict": [
            {
                "code": str(code),
                "label": ANSWER_VERDICTS.get(str(code), str(code)),
                "count": int(count),
            }
            for code, count in answer_verdict_rows
        ],
        "by_expected_refusal": {
            str(code): int(count) for code, count in expected_refusal_rows
        },
        "open_issues": open_issues,
        "by_issue": [
            {
                "id": int(issue_id),
                "title": str(title),
                "status": str(status),
                "root_cause_stage": str(stage),
                "count": int(count),
            }
            for issue_id, title, status, stage, count in issue_rows
        ],
    }


def _report_markdown(report: Mapping[str, Any]) -> str:
    period = report.get("period") or {}
    totals = report.get("totals") or {}
    lines = [
        f"# RAG 品質週報（最近 {period.get('days', 7)} 天）",
        "",
        f"- 產生時間：{report.get('generated_at')}",
        f"- 期間：{period.get('start')} ～ {period.get('end')}",
        f"- 回饋總數：{totals.get('feedback', 0)}",
        f"- 不滿意：{totals.get('unsatisfied', 0)}",
        f"- 不滿意率：{totals.get('unsatisfied_rate') if totals.get('unsatisfied_rate') is not None else '—'}%",
        f"- 可行動：{totals.get('actionable', 0)}",
        f"- 待處理 Issue：{totals.get('open_issues', 0)}",
        f"- 待審抽樣：{totals.get('unreviewed_reviews', 0)}",
        "",
        "## 警示",
    ]
    alerts = report.get("alerts") or []
    if alerts:
        for alert in alerts:
            lines.append(
                f"- [{alert.get('level')}] {alert.get('message')}"
            )
    else:
        lines.append("- 無")
    lines.extend(["", "## 錯誤階段"])
    roots = report.get("by_root_cause") or []
    if roots:
        for row in roots:
            lines.append(f"- {row.get('label')}: {row.get('count')}")
    else:
        lines.append("- 尚未標註")
    lines.extend(["", "## 原因分布"])
    reasons = report.get("by_reason") or []
    if reasons:
        for row in reasons:
            lines.append(f"- {row.get('label')}: {row.get('count')}")
    else:
        lines.append("- 無")
    lines.extend(["", "## 每日趨勢"])
    daily = report.get("daily") or []
    if daily:
        for row in daily:
            lines.append(
                f"- {row.get('date')}: 回饋 {row.get('total')} / 不滿意 {row.get('unsatisfied')}"
            )
    else:
        lines.append("- 無")
    lines.append("")
    return "\n".join(lines)


def build_quality_report(
    session_factory: sessionmaker[Session],
    *,
    days: int = 7,
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    current = _aware(now or _utcnow()) or _utcnow()
    days = max(1, min(90, int(days or 7)))
    start = current - timedelta(days=days)
    previous_start = start - timedelta(days=days)
    with session_factory() as session:
        rows = session.execute(
            select(
                RagFeedback.created_at,
                RagFeedback.sentiment,
                RagFeedback.status,
                RagFeedback.actionable,
                RagFeedback.root_cause_stage,
            ).where(RagFeedback.created_at >= start)
        ).all()
        previous_sentiments = session.scalars(
            select(RagFeedback.sentiment).where(
                RagFeedback.created_at >= previous_start,
                RagFeedback.created_at < start,
            )
        ).all()
        reason_rows = session.execute(
            select(RagFeedbackReason.reason_code, func.count())
            .join(
                RagFeedback,
                RagFeedback.id == RagFeedbackReason.feedback_id,
            )
            .where(RagFeedback.created_at >= start)
            .group_by(RagFeedbackReason.reason_code)
            .order_by(func.count().desc())
        ).all()
        open_issues = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedbackIssue)
                .where(
                    RagFeedbackIssue.status.notin_(("resolved", "dismissed"))
                )
            )
            or 0
        )
        issue_rows = session.execute(
            select(
                RagFeedbackIssue.id,
                RagFeedbackIssue.title,
                RagFeedbackIssue.status,
                func.count(RagFeedback.id),
            )
            .outerjoin(
                RagFeedback,
                RagFeedback.issue_id == RagFeedbackIssue.id,
            )
            .where(
                RagFeedbackIssue.status.notin_(("resolved", "dismissed"))
            )
            .group_by(
                RagFeedbackIssue.id,
                RagFeedbackIssue.title,
                RagFeedbackIssue.status,
            )
            .order_by(func.count(RagFeedback.id).desc())
            .limit(5)
        ).all()
        feedback_exists = (
            select(RagFeedback.id)
            .where(RagFeedback.request_id == RagInteraction.request_id)
            .exists()
        )
        unreviewed_reviews = int(
            session.scalar(
                select(func.count())
                .select_from(RagInteraction)
                .where(
                    RagInteraction.review_status == "new",
                    ~feedback_exists,
                )
            )
            or 0
        )
        evaluations = session.scalars(
            select(RagFeedbackEvaluation).where(
                RagFeedbackEvaluation.created_at >= start
            )
        ).all()
        experiments = session.scalars(
            select(RagFeedbackExperiment).where(
                RagFeedbackExperiment.created_at >= start
            )
        ).all()

    total = len(rows)
    unsatisfied = sum(
        1 for row in rows if row.sentiment == "unsatisfied"
    )
    actionable = sum(1 for row in rows if row.actionable)
    untriaged_actionable = sum(
        1
        for row in rows
        if row.actionable and row.status == "new"
    )
    previous_total = len(previous_sentiments)
    previous_unsatisfied = sum(
        1 for value in previous_sentiments if value == "unsatisfied"
    )
    rate = round(unsatisfied / total * 100, 2) if total else None
    previous_rate = (
        round(previous_unsatisfied / previous_total * 100, 2)
        if previous_total
        else None
    )
    daily: Dict[str, Dict[str, int]] = {}
    roots: Dict[str, int] = {}
    for row in rows:
        row_date = _aware(row.created_at)
        key = row_date.date().isoformat() if row_date else ""
        bucket = daily.setdefault(
            key, {"date": key, "total": 0, "unsatisfied": 0}
        )
        bucket["total"] += 1
        if row.sentiment == "unsatisfied":
            bucket["unsatisfied"] += 1
        stage = str(row.root_cause_stage or "unknown")
        if stage != "unknown":
            roots[stage] = roots.get(stage, 0) + 1
    failed_evaluations = sum(
        int((row.summary or {}).get("failed") or 0)
        for row in evaluations
    )
    alerts: List[Dict[str, str]] = []
    if total == 0:
        alerts.append(
            {
                "level": "info",
                "code": "no_feedback",
                "message": "本期沒有收到回饋，請確認展示或收集管道。",
            }
        )
    if 0 < total < 10:
        alerts.append(
            {
                "level": "info",
                "code": "small_sample",
                "message": f"本期只有 {total} 筆回饋，比例不宜過度解讀。",
            }
        )
    if total >= 10 and rate is not None and rate >= 30:
        alerts.append(
            {
                "level": "warning",
                "code": "high_unsatisfied_rate",
                "message": f"不滿意率 {rate:.2f}% 偏高（樣本 {total} 筆）。",
            }
        )
    if (
        total >= 10
        and rate is not None
        and previous_rate is not None
        and rate - previous_rate >= 10
    ):
        alerts.append(
            {
                "level": "warning",
                "code": "unsatisfied_rate_up",
                "message": (
                    f"不滿意率較前一期上升 {rate - previous_rate:.2f} 個百分點。"
                ),
            }
        )
    if untriaged_actionable:
        alerts.append(
            {
                "level": "warning",
                "code": "untriaged_actionable",
                "message": f"{untriaged_actionable} 筆可行動回饋仍是待處理。",
            }
        )
    if open_issues > 5:
        alerts.append(
            {
                "level": "warning",
                "code": "open_issues",
                "message": f"目前有 {open_issues} 個未結案問題群組。",
            }
        )
    if unreviewed_reviews > 20:
        alerts.append(
            {
                "level": "warning",
                "code": "review_backlog",
                "message": f"主動抽樣待審 {unreviewed_reviews} 筆。",
            }
        )
    if failed_evaluations:
        alerts.append(
            {
                "level": "danger",
                "code": "evaluation_failures",
                "message": f"本期批次評估有 {failed_evaluations} 筆失敗。",
            }
        )
    report = {
        "period": {
            "days": days,
            "start": start.isoformat(),
            "end": current.isoformat(),
        },
        "generated_at": current.isoformat(),
        "totals": {
            "feedback": total,
            "unsatisfied": unsatisfied,
            "unsatisfied_rate": rate,
            "actionable": actionable,
            "untriaged_actionable": untriaged_actionable,
            "previous_feedback": previous_total,
            "previous_unsatisfied_rate": previous_rate,
            "open_issues": open_issues,
            "unreviewed_reviews": unreviewed_reviews,
            "evaluations": len(evaluations),
            "failed_evaluations": failed_evaluations,
            "experiments": len(experiments),
        },
        "by_root_cause": [
            {
                "code": code,
                "label": ROOT_CAUSE_STAGES.get(code, code),
                "count": count,
            }
            for code, count in sorted(
                roots.items(), key=lambda item: item[1], reverse=True
            )
        ],
        "by_reason": [
            {
                "code": str(code),
                "label": FEEDBACK_REASONS.get(str(code), str(code)),
                "count": int(count),
            }
            for code, count in reason_rows
        ],
        "top_issues": [
            {
                "id": int(issue_id),
                "title": str(title),
                "status": str(status),
                "count": int(count),
            }
            for issue_id, title, status, count in issue_rows
        ],
        "daily": [daily[key] for key in sorted(daily)],
        "alerts": alerts,
    }
    report["markdown"] = _report_markdown(report)
    return report


def _review_signals(
    interaction: RagInteraction,
) -> Tuple[int, List[str]]:
    snapshot = interaction.response_snapshot or {}
    retrieval = snapshot.get("retrieval") or {}
    score = 1
    reasons: List[str] = ["unreviewed_recent"]
    status = str(interaction.status or snapshot.get("status") or "")
    answer_source = str(
        interaction.answer_source or snapshot.get("answer_source") or ""
    )

    def add(points: int, reason: str) -> None:
        nonlocal score
        score += points
        if reason not in reasons:
            reasons.append(reason)

    if status in {
        "degraded",
        "retrieval_only",
        "unavailable",
        "preview",
        "not_configured",
        "failed",
    }:
        add(35, f"status:{status}")
    if answer_source == "retrieval":
        add(22, "answer_source:retrieval")
    if not str(snapshot.get("answer") or "").strip():
        add(25, "missing_answer")

    retrieval_status = str(retrieval.get("status") or "")
    if retrieval_status and retrieval_status not in {"ok", "not_configured"}:
        add(25, f"retrieval:{retrieval_status}")
    if retrieval_status == "not_configured":
        add(18, "retrieval:not_configured")
    hits = int(retrieval.get("hits") or 0)
    if retrieval_status == "ok" and hits == 0:
        add(35, "retrieval:zero_hits")
    citations = snapshot.get("citations") or snapshot.get("judgments") or []
    laws = snapshot.get("law_sources") or []
    if retrieval_status == "ok" and not citations and not laws:
        add(28, "retrieval:no_sources")

    citation_audit = snapshot.get("citation_audit") or {}
    unsupported = int(
        citation_audit.get("unsupported_citation_count") or 0
    )
    if unsupported > 0:
        add(35, f"citation_audit:unsupported:{unsupported}")
    if citation_audit.get("citation_retry"):
        add(20, "citation_audit:retry")

    rerank = retrieval.get("rerank") or {}
    rerank_status = str(rerank.get("status") or "")
    if rerank_status and rerank_status not in {"ok", "disabled"}:
        add(18, f"rerank:{rerank_status}")
    if rerank.get("fallback_used"):
        add(12, "rerank:fallback")
    top_score = retrieval.get("top_score")
    threshold = retrieval.get("score_threshold")
    try:
        if (
            top_score is not None
            and threshold is not None
            and float(top_score) < float(threshold) + 0.08
        ):
            add(12, "retrieval:low_margin")
    except (TypeError, ValueError):
        pass

    if snapshot.get("degraded_reason"):
        add(15, f"degraded:{snapshot.get('degraded_reason')}")
    if snapshot.get("scope_probe_notice"):
        add(12, "scope_probe:notice")
    if int(score) > 100:
        score = 100
    return int(score), reasons


def _serialize_review_candidate(
    interaction: RagInteraction,
) -> Dict[str, Any]:
    snapshot = interaction.response_snapshot or {}
    retrieval = snapshot.get("retrieval") or {}
    score, reasons = _review_signals(interaction)
    return {
        "request_id": interaction.request_id,
        "question": interaction.question,
        "answer_preview": str(interaction.answer or "")[:360],
        "created_at": _iso(interaction.created_at),
        "answer_source": interaction.answer_source,
        "status": interaction.status,
        "duration_ms": snapshot.get("duration_ms"),
        "risk_score": score,
        "reasons": reasons,
        "review_status": interaction.review_status or "new",
        "retrieval": {
            "status": retrieval.get("status"),
            "mode": retrieval.get("mode"),
            "hits": retrieval.get("hits"),
            "top_score": retrieval.get("top_score"),
            "score_threshold": retrieval.get("score_threshold"),
        },
        "llm_model": snapshot.get("llm_model") or "",
    }


def list_review_candidates(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
    scan_limit: int = 500,
) -> Dict[str, Any]:
    with session_factory() as session:
        interactions = session.scalars(
            select(RagInteraction)
            .where(RagInteraction.review_status == "new")
            .order_by(RagInteraction.created_at.desc())
            .limit(max(1, min(2000, int(scan_limit))))
        ).all()
        request_ids = [row.request_id for row in interactions]
        feedback_ids = set(
            session.scalars(
                select(RagFeedback.request_id).where(
                    RagFeedback.request_id.in_(request_ids)
                )
            ).all()
        ) if request_ids else set()
    candidates = [
        _serialize_review_candidate(row)
        for row in interactions
        if row.request_id not in feedback_ids
    ]
    candidates.sort(
        key=lambda item: (item["risk_score"], item["created_at"] or ""),
        reverse=True,
    )
    return {
        "candidates": candidates[: max(1, min(100, int(limit)))],
        "scanned": len(interactions),
        "unreviewed": len(candidates),
    }


def get_review_candidate(
    session_factory: sessionmaker[Session],
    request_id: str,
) -> Dict[str, Any]:
    with session_factory() as session:
        row = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == str(request_id)
            )
        ).first()
        if row is None:
            raise FeedbackError(
                404, "interaction_not_found", "找不到這筆 RAG 紀錄。"
            )
        feedback = session.scalars(
            select(RagFeedback).where(
                RagFeedback.request_id == str(request_id)
            )
        ).first()
        candidate = _serialize_review_candidate(row)
        return {
            **candidate,
            "has_feedback": feedback is not None,
            "snapshot": row.response_snapshot or {},
            "system_version": row.system_version or {},
        }


def mark_review_candidate(
    session_factory: sessionmaker[Session],
    request_id: str,
    *,
    status: str,
    actor: str,
) -> Dict[str, Any]:
    status = str(status or "").strip()
    if status not in REVIEW_STATUSES:
        raise FeedbackError(
            422, "invalid_review_status", "審查狀態不正確。"
        )
    with session_factory() as session:
        row = session.scalars(
            select(RagInteraction).where(
                RagInteraction.request_id == str(request_id)
            )
        ).first()
        if row is None:
            raise FeedbackError(
                404, "interaction_not_found", "找不到這筆 RAG 紀錄。"
            )
        row.review_status = status
        row.reviewed_by = str(actor or "")[:120]
        row.reviewed_at = _utcnow() if status != "new" else None
        session.commit()
        session.refresh(row)
        return _serialize_review_candidate(row)


def serialize_issue(
    row: RagFeedbackIssue,
    *,
    feedback_count: int = 0,
) -> Dict[str, Any]:
    return {
        "id": row.id,
        "title": row.title,
        "description": row.description,
        "root_cause_stage": row.root_cause_stage or "unknown",
        "status": row.status or "open",
        "severity": row.severity or "medium",
        "linked_pr_url": row.linked_pr_url or "",
        "created_by": row.created_by or "",
        "feedback_count": int(feedback_count or 0),
        "created_at": _iso(row.created_at),
        "updated_at": _iso(row.updated_at),
    }


def list_feedback_issues(
    session_factory: sessionmaker[Session],
    *,
    status: str = "",
    root_cause_stage: str = "",
    limit: int = 100,
) -> Dict[str, Any]:
    with session_factory() as session:
        statement = select(RagFeedbackIssue)
        if status:
            statement = statement.where(RagFeedbackIssue.status == status)
        if root_cause_stage:
            statement = statement.where(
                RagFeedbackIssue.root_cause_stage == root_cause_stage
            )
        rows = session.scalars(
            statement.order_by(RagFeedbackIssue.updated_at.desc()).limit(
                max(1, min(500, int(limit)))
            )
        ).all()
        counts = {
            int(issue_id): int(count)
            for issue_id, count in session.execute(
                select(RagFeedback.issue_id, func.count())
                .where(RagFeedback.issue_id.isnot(None))
                .group_by(RagFeedback.issue_id)
            ).all()
        }
        return {
            "issues": [
                serialize_issue(
                    row, feedback_count=counts.get(int(row.id), 0)
                )
                for row in rows
            ],
            "status_options": [
                {"code": code, "label": label}
                for code, label in ISSUE_STATUSES.items()
            ],
            "root_cause_options": [
                {"code": code, "label": label}
                for code, label in ROOT_CAUSE_STAGES.items()
            ],
        }


def create_feedback_issue(
    session_factory: sessionmaker[Session],
    *,
    title: str,
    description: str,
    root_cause_stage: str,
    severity: str,
    actor: str,
) -> Dict[str, Any]:
    title = str(title or "").strip()
    if len(title) < 4:
        raise FeedbackError(
            422, "issue_title_required", "問題群組標題至少需要 4 個字。"
        )
    if len(title) > 300:
        raise FeedbackError(
            422, "issue_title_too_long", "問題群組標題最多 300 字。"
        )
    stage = str(root_cause_stage or "unknown").strip()
    if stage not in ROOT_CAUSE_STAGES:
        raise FeedbackError(422, "invalid_root_cause_stage", "錯誤階段不正確。")
    severity = str(severity or "medium").strip()
    if severity not in SEVERITIES:
        raise FeedbackError(422, "invalid_severity", "嚴重度不正確。")
    with session_factory() as session:
        row = RagFeedbackIssue(
            title=title,
            description=str(description or "").strip()[:4000],
            root_cause_stage=stage,
            status="open",
            severity=severity,
            created_by=str(actor or "")[:120],
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return serialize_issue(row)


def get_feedback_issue_detail(
    session_factory: sessionmaker[Session],
    issue_id: int,
    *,
    days: int = 30,
) -> Dict[str, Any]:
    days = max(1, min(90, int(days or 30)))
    with session_factory() as session:
        issue = session.get(RagFeedbackIssue, int(issue_id))
        if issue is None:
            raise FeedbackError(404, "issue_not_found", "找不到這個問題群組。")
        rows = session.execute(
            select(
                RagFeedback.id,
                RagFeedback.request_id,
                RagFeedback.sentiment,
                RagFeedback.status,
                RagFeedback.severity,
                RagFeedback.created_at,
                RagFeedback.snapshot,
            )
            .where(RagFeedback.issue_id == int(issue_id))
            .order_by(RagFeedback.created_at.desc())
            .limit(200)
        ).all()
        feedback_ids = [int(row.id) for row in rows]
        reasons = _reasons_for(session, feedback_ids)
        issue_count = len(rows)
        issue_payload = serialize_issue(
            issue, feedback_count=issue_count
        )
        cutoff = _utcnow() - timedelta(days=days)
        daily: Dict[str, Dict[str, Any]] = {}
        reason_counts: Dict[str, int] = {}
        status_counts: Dict[str, int] = {}
        feedback_rows: List[Dict[str, Any]] = []
        for row in rows:
            created = _aware(row.created_at)
            if created and created >= cutoff:
                key = created.date().isoformat()
                bucket = daily.setdefault(
                    key,
                    {
                        "date": key,
                        "total": 0,
                        "unsatisfied": 0,
                    },
                )
                bucket["total"] += 1
                if row.sentiment == "unsatisfied":
                    bucket["unsatisfied"] += 1
            status_counts[str(row.status)] = (
                status_counts.get(str(row.status), 0) + 1
            )
            for code in reasons.get(int(row.id), []):
                reason_counts[code] = reason_counts.get(code, 0) + 1
            snapshot = row.snapshot or {}
            feedback_rows.append(
                {
                    "id": int(row.id),
                    "request_id": row.request_id,
                    "question": str(snapshot.get("question") or ""),
                    "sentiment": row.sentiment,
                    "status": row.status,
                    "severity": row.severity,
                    "reasons": reasons.get(int(row.id), []),
                    "created_at": _iso(row.created_at),
                }
            )
    return {
        "issue": issue_payload,
        "feedback": feedback_rows,
        "daily": [daily[key] for key in sorted(daily)],
        "by_reason": [
            {
                "code": code,
                "label": FEEDBACK_REASONS.get(code, code),
                "count": count,
            }
            for code, count in sorted(
                reason_counts.items(), key=lambda item: item[1], reverse=True
            )
        ],
        "by_status": status_counts,
        "days": days,
    }


def update_feedback_issue(
    session_factory: sessionmaker[Session],
    issue_id: int,
    updates: Mapping[str, Any],
) -> Dict[str, Any]:
    allowed = {
        "title",
        "description",
        "root_cause_stage",
        "status",
        "severity",
        "linked_pr_url",
    }
    unknown = sorted(set(updates) - allowed)
    if unknown:
        raise FeedbackError(
            422,
            "invalid_issue_field",
            f"不支援的問題群組欄位：{', '.join(unknown)}",
        )
    with session_factory() as session:
        row = session.get(RagFeedbackIssue, int(issue_id))
        if row is None:
            raise FeedbackError(404, "issue_not_found", "找不到這個問題群組。")
        if "title" in updates:
            title = str(updates.get("title") or "").strip()
            if len(title) < 4 or len(title) > 300:
                raise FeedbackError(
                    422, "invalid_issue_title", "問題群組標題需為 4–300 字。"
                )
            row.title = title
        if "description" in updates:
            row.description = str(updates.get("description") or "").strip()[:4000]
        if "root_cause_stage" in updates:
            stage = str(updates.get("root_cause_stage") or "").strip()
            if stage not in ROOT_CAUSE_STAGES:
                raise FeedbackError(
                    422, "invalid_root_cause_stage", "錯誤階段不正確。"
                )
            row.root_cause_stage = stage
        if "status" in updates:
            status = str(updates.get("status") or "").strip()
            if status not in ISSUE_STATUSES:
                raise FeedbackError(
                    422, "invalid_issue_status", "問題群組狀態不正確。"
                )
            row.status = status
        if "severity" in updates:
            severity = str(updates.get("severity") or "").strip()
            if severity not in SEVERITIES:
                raise FeedbackError(
                    422, "invalid_severity", "嚴重度不正確。"
                )
            row.severity = severity
        if "linked_pr_url" in updates:
            row.linked_pr_url = str(
                updates.get("linked_pr_url") or ""
            ).strip()[:1000]
        session.commit()
        session.refresh(row)
        count = int(
            session.scalar(
                select(func.count())
                .select_from(RagFeedback)
                .where(RagFeedback.issue_id == row.id)
            )
            or 0
        )
        return serialize_issue(row, feedback_count=count)


def _attach_issue(
    session: Session,
    row: RagFeedback,
    payload: Dict[str, Any],
) -> Dict[str, Any]:
    issue = (
        session.get(RagFeedbackIssue, int(row.issue_id))
        if row.issue_id
        else None
    )
    if issue is None:
        payload["issue"] = None
        return payload
    issue_count = int(
        session.scalar(
            select(func.count())
            .select_from(RagFeedback)
            .where(RagFeedback.issue_id == issue.id)
        )
        or 0
    )
    payload["issue"] = serialize_issue(issue, feedback_count=issue_count)
    return payload


def get_feedback(
    session_factory: sessionmaker[Session], feedback_id: int
) -> Dict[str, Any]:
    with session_factory() as session:
        row = session.get(RagFeedback, int(feedback_id))
        if row is None:
            raise FeedbackError(404, "feedback_not_found", "找不到這筆回饋。")
        reasons = _reasons_for(session, [int(row.id)]).get(int(row.id), [])
        events = session.scalars(
            select(RagFeedbackEvent)
            .where(RagFeedbackEvent.feedback_id == int(row.id))
            .order_by(RagFeedbackEvent.created_at.desc())
            .limit(50)
        ).all()
        payload = _attach_issue(
            session,
            row,
            serialize_feedback(row, reasons, include_snapshot=True),
        )
        payload["events"] = [
            {
                "id": event.id,
                "event_type": event.event_type,
                "from_status": event.from_status,
                "to_status": event.to_status,
                "actor": event.actor,
                "comment": event.comment,
                "created_at": _iso(event.created_at),
            }
            for event in events
        ]
        return payload


def _citation_key(item: Mapping[str, Any]) -> str:
    jid = str(item.get("jid") or "").strip()
    if jid:
        return f"jid:{jid}"
    law_name = str(item.get("law_name") or "").strip()
    article_no = str(item.get("article_no") or "").strip()
    return f"law:{law_name}:{article_no}"


def _rerun_view(result: Mapping[str, Any]) -> Dict[str, Any]:
    citations = [
        item
        for item in result.get("citations") or []
        if isinstance(item, Mapping)
    ]
    laws = [
        item
        for item in result.get("law_sources") or []
        if isinstance(item, Mapping)
    ]
    return {
        "answer": str(result.get("answer") or ""),
        "status": str(result.get("status") or ""),
        "answer_source": str(result.get("answer_source") or ""),
        "duration_ms": result.get("duration_ms"),
        "notice": str(result.get("notice") or ""),
        "citations": [
            {
                "key": _citation_key(item),
                "jid": item.get("jid") or "",
                "title": item.get("title") or "",
                "court": item.get("court") or "",
                "jdate": item.get("jdate") or "",
            }
            for item in citations
        ],
        "law_sources": [
            {
                "key": _citation_key(item),
                "law_name": item.get("law_name") or "",
                "article_no": item.get("article_no") or "",
                "source_label": item.get("source_label") or "",
            }
            for item in laws
        ],
        "retrieval_mode": (result.get("retrieval") or {}).get("mode"),
        "query_filters": (result.get("retrieval") or {}).get(
            "query_filters"
        ),
    }


def rerun_feedback(
    session_factory: sessionmaker[Session],
    settings: Settings,
    feedback_id: int,
) -> Dict[str, Any]:
    """Re-run the stored question with the current pipeline (admin only)."""

    with session_factory() as session:
        row = session.get(RagFeedback, int(feedback_id))
        if row is None:
            raise FeedbackError(404, "feedback_not_found", "找不到這筆回饋。")
        snapshot = row.snapshot or {}
        question = str(snapshot.get("question") or "").strip()
        if len(question) < 1:
            raise FeedbackError(
                422, "feedback_question_missing", "這筆回饋沒有問題文字。"
            )

    from ..rag import answer_question

    current = answer_question(
        session_factory=session_factory,
        question=question,
        settings=settings,
    )
    previous_view = _rerun_view(snapshot)
    current_view = _rerun_view(current)
    previous_keys = {
        item["key"] for item in previous_view["citations"]
    }
    current_keys = {item["key"] for item in current_view["citations"]}
    previous_law_keys = {
        item["key"] for item in previous_view["law_sources"]
    }
    current_law_keys = {
        item["key"] for item in current_view["law_sources"]
    }
    return {
        "feedback_id": int(feedback_id),
        "question": question,
        "previous": previous_view,
        "current": current_view,
        "diff": {
            "answer_changed": (
                " ".join(previous_view["answer"].split())
                != " ".join(current_view["answer"].split())
            ),
            "answer_source_changed": (
                previous_view["answer_source"]
                != current_view["answer_source"]
            ),
            "status_changed": (
                previous_view["status"] != current_view["status"]
            ),
            "retrieval_mode_changed": (
                previous_view["retrieval_mode"]
                != current_view["retrieval_mode"]
            ),
            "citations_added": sorted(current_keys - previous_keys),
            "citations_removed": sorted(previous_keys - current_keys),
            "laws_added": sorted(current_law_keys - previous_law_keys),
            "laws_removed": sorted(previous_law_keys - current_law_keys),
        },
    }


def serialize_evaluation(
    row: RagFeedbackEvaluation,
    *,
    include_results: bool = False,
) -> Dict[str, Any]:
    payload = {
        "id": row.id,
        "filters": row.filters or {},
        "feedback_ids": row.feedback_ids or [],
        "total": int(row.total or 0),
        "summary": row.summary or {},
        "status": row.status,
        "created_by": row.created_by,
        "duration_ms": int(row.duration_ms or 0),
        "created_at": _iso(row.created_at),
    }
    if include_results:
        payload["results"] = row.results or []
    return payload


def evaluate_feedback_batch(
    session_factory: sessionmaker[Session],
    settings: Settings,
    *,
    feedback_ids: Optional[Sequence[int]] = None,
    filters: Optional[Mapping[str, Any]] = None,
    limit: int = 10,
    actor: str = "",
) -> Dict[str, Any]:
    """Re-run selected feedback with the current pipeline and diff the result."""

    filters = dict(filters or {})
    requested_limit = max(1, min(20, int(limit or 10)))
    started = time.perf_counter()
    selected: List[int] = []
    with session_factory() as session:
        if feedback_ids:
            selected = [int(value) for value in feedback_ids][:requested_limit]
        else:
            statement = _feedback_filters(select(RagFeedback.id), filters)
            selected = [
                int(value)
                for value in session.scalars(
                    statement.order_by(RagFeedback.created_at.desc()).limit(
                        requested_limit
                    )
                ).all()
            ]
        existing = set(
            int(value)
            for value in session.scalars(
                select(RagFeedback.id).where(
                    RagFeedback.id.in_(selected)
                )
            ).all()
        )
        selected = [value for value in selected if value in existing]

    results: List[Dict[str, Any]] = []
    summary = {
        "succeeded": 0,
        "failed": 0,
        "answer_changed": 0,
        "answer_source_changed": 0,
        "status_changed": 0,
        "retrieval_mode_changed": 0,
        "citations_added_total": 0,
        "citations_removed_total": 0,
        "laws_added_total": 0,
        "laws_removed_total": 0,
    }
    for feedback_id in selected:
        try:
            rerun = rerun_feedback(
                session_factory, settings, feedback_id
            )
            diff = rerun.get("diff") or {}
            summary["succeeded"] += 1
            for key in (
                "answer_changed",
                "answer_source_changed",
                "status_changed",
                "retrieval_mode_changed",
            ):
                if diff.get(key):
                    summary[key] += 1
            summary["citations_added_total"] += len(
                diff.get("citations_added") or []
            )
            summary["citations_removed_total"] += len(
                diff.get("citations_removed") or []
            )
            summary["laws_added_total"] += len(diff.get("laws_added") or [])
            summary["laws_removed_total"] += len(
                diff.get("laws_removed") or []
            )
            results.append(
                {
                    "feedback_id": feedback_id,
                    "question": rerun.get("question") or "",
                    "status": "success",
                    "diff": diff,
                    "previous": {
                        "answer": (rerun.get("previous") or {}).get("answer")
                        or "",
                        "answer_source": (
                            rerun.get("previous") or {}
                        ).get("answer_source")
                        or "",
                        "retrieval_mode": (
                            rerun.get("previous") or {}
                        ).get("retrieval_mode")
                        or "",
                    },
                    "current": {
                        "answer": (rerun.get("current") or {}).get("answer")
                        or "",
                        "answer_source": (
                            rerun.get("current") or {}
                        ).get("answer_source")
                        or "",
                        "retrieval_mode": (
                            rerun.get("current") or {}
                        ).get("retrieval_mode")
                        or "",
                    },
                }
            )
        except Exception as exc:
            summary["failed"] += 1
            results.append(
                {
                    "feedback_id": feedback_id,
                    "question": "",
                    "status": "failed",
                    "error": f"{exc.__class__.__name__}: {exc}",
                    "diff": {},
                }
            )

    duration_ms = round((time.perf_counter() - started) * 1000, 1)
    with session_factory() as session:
        row = RagFeedbackEvaluation(
            filters=filters,
            feedback_ids=selected,
            total=len(selected),
            summary=summary,
            results=results,
            status="completed" if selected else "empty",
            created_by=str(actor or "")[:120],
            duration_ms=int(duration_ms),
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return serialize_evaluation(row, include_results=True)


EXPERIMENT_OVERRIDES: Dict[str, Tuple[type, Any, Any]] = {
    "rag_top_k": (int, 1, 50),
    "rag_rerank_enabled": (bool, False, True),
    "rag_max_context_chars": (int, 500, 20_000),
    "rag_law_first_judgment_limit": (int, 0, 10),
    "rag_law_article_limit": (int, 1, 20),
    "rag_law_article_limit_law_first": (int, 1, 20),
    "rag_law_vector_enabled": (bool, False, True),
    "rag_score_threshold": (float, 0.0, 1.0),
    "rag_law_score_threshold": (float, 0.0, 1.0),
    "llm_num_predict": (int, 64, 2048),
    "llm_num_ctx": (int, 2048, 32768),
    "llm_model": (str, 1, 200),
}


def _normalize_experiment_variants(
    variants: Sequence[Mapping[str, Any]],
) -> List[Dict[str, Any]]:
    if not variants:
        raise FeedbackError(
            422, "experiment_variants_required", "至少需要一個實驗變體。"
        )
    if len(variants) > 5:
        raise FeedbackError(
            422, "too_many_experiment_variants", "實驗變體最多 5 個。"
        )
    normalized: List[Dict[str, Any]] = []
    seen: set[str] = set()
    for raw in variants:
        if not isinstance(raw, Mapping):
            raise FeedbackError(
                422, "invalid_experiment_variant", "實驗變體格式不正確。"
            )
        name = str(raw.get("name") or "").strip()
        if not name or len(name) > 80:
            raise FeedbackError(
                422, "invalid_experiment_name", "實驗變體名稱需為 1–80 字。"
            )
        if name in seen:
            raise FeedbackError(
                422, "duplicate_experiment_name", "實驗變體名稱不可重複。"
            )
        seen.add(name)
        overrides = raw.get("overrides") or {}
        if not isinstance(overrides, Mapping):
            raise FeedbackError(
                422, "invalid_experiment_overrides", "實驗參數格式不正確。"
            )
        clean: Dict[str, Any] = {}
        for key, value in overrides.items():
            if key not in EXPERIMENT_OVERRIDES:
                raise FeedbackError(
                    422,
                    "unsupported_experiment_override",
                    f"不支援的實驗參數：{key}",
                )
            kind, minimum, maximum = EXPERIMENT_OVERRIDES[key]
            try:
                if kind is bool:
                    parsed = bool(value)
                elif kind is int:
                    parsed = int(value)
                elif kind is float:
                    parsed = float(value)
                else:
                    parsed = str(value).strip()
            except (TypeError, ValueError) as exc:
                raise FeedbackError(
                    422,
                    "invalid_experiment_override_value",
                    f"實驗參數 {key} 的值不正確。",
                ) from exc
            if kind in {int, float} and not (
                float(minimum) <= float(parsed) <= float(maximum)
            ):
                raise FeedbackError(
                    422,
                    "invalid_experiment_override_range",
                    f"實驗參數 {key} 超出允許範圍。",
                )
            if kind is str and len(parsed) < int(minimum):
                raise FeedbackError(
                    422,
                    "invalid_experiment_override_value",
                    f"實驗參數 {key} 不可空白。",
                )
            clean[key] = parsed
        normalized.append({"name": name, "overrides": clean})
    return normalized


def serialize_experiment(
    row: RagFeedbackExperiment,
    *,
    include_results: bool = False,
) -> Dict[str, Any]:
    payload = {
        "id": row.id,
        "filters": row.filters or {},
        "feedback_ids": row.feedback_ids or [],
        "variants": row.variants or [],
        "summary": row.summary or {},
        "status": row.status,
        "created_by": row.created_by,
        "duration_ms": int(row.duration_ms or 0),
        "created_at": _iso(row.created_at),
    }
    if include_results:
        payload["results"] = row.results or []
    return payload


def run_feedback_experiment(
    session_factory: sessionmaker[Session],
    settings: Settings,
    *,
    variants: Sequence[Mapping[str, Any]],
    feedback_ids: Optional[Sequence[int]] = None,
    filters: Optional[Mapping[str, Any]] = None,
    limit: int = 5,
    actor: str = "",
) -> Dict[str, Any]:
    normalized_variants = _normalize_experiment_variants(variants)
    filters = dict(filters or {})
    requested_limit = max(1, min(10, int(limit or 5)))
    started = time.perf_counter()
    with session_factory() as session:
        if feedback_ids:
            selected = [int(value) for value in feedback_ids][:requested_limit]
        else:
            statement = _feedback_filters(select(RagFeedback.id), filters)
            selected = [
                int(value)
                for value in session.scalars(
                    statement.order_by(RagFeedback.created_at.desc()).limit(
                        requested_limit
                    )
                ).all()
            ]
        existing = set(
            int(value)
            for value in session.scalars(
                select(RagFeedback.id).where(
                    RagFeedback.id.in_(selected)
                )
            ).all()
        )
        selected = [value for value in selected if value in existing]

    variant_runs: List[Dict[str, Any]] = []
    summary_by_variant: Dict[str, Any] = {}
    for variant in normalized_variants:
        name = variant["name"]
        overrides = variant["overrides"]
        try:
            variant_settings = replace(settings, **overrides)
        except TypeError as exc:
            raise FeedbackError(
                422,
                "invalid_experiment_override",
                f"實驗參數無法套用：{exc}",
            ) from exc
        summary = {
            "succeeded": 0,
            "failed": 0,
            "answer_changed": 0,
            "answer_source_changed": 0,
            "status_changed": 0,
            "retrieval_mode_changed": 0,
            "citations_added_total": 0,
            "citations_removed_total": 0,
            "laws_added_total": 0,
            "laws_removed_total": 0,
            "current_citations_total": 0,
            "current_laws_total": 0,
            "avg_duration_ms": 0.0,
        }
        duration_total = 0.0
        cases: List[Dict[str, Any]] = []
        for feedback_id in selected:
            try:
                rerun = rerun_feedback(
                    session_factory, variant_settings, feedback_id
                )
                diff = rerun.get("diff") or {}
                current = rerun.get("current") or {}
                citations = current.get("citations") or []
                laws = current.get("law_sources") or []
                summary["succeeded"] += 1
                for key in (
                    "answer_changed",
                    "answer_source_changed",
                    "status_changed",
                    "retrieval_mode_changed",
                ):
                    if diff.get(key):
                        summary[key] += 1
                summary["citations_added_total"] += len(
                    diff.get("citations_added") or []
                )
                summary["citations_removed_total"] += len(
                    diff.get("citations_removed") or []
                )
                summary["laws_added_total"] += len(
                    diff.get("laws_added") or []
                )
                summary["laws_removed_total"] += len(
                    diff.get("laws_removed") or []
                )
                summary["current_citations_total"] += len(citations)
                summary["current_laws_total"] += len(laws)
                duration = float(current.get("duration_ms") or 0)
                duration_total += duration
                cases.append(
                    {
                        "feedback_id": feedback_id,
                        "question": rerun.get("question") or "",
                        "status": "success",
                        "diff": diff,
                        "current": {
                            "answer_source": current.get("answer_source")
                            or "",
                            "retrieval_mode": current.get("retrieval_mode")
                            or "",
                            "duration_ms": current.get("duration_ms"),
                            "citation_count": len(citations),
                            "law_count": len(laws),
                        },
                    }
                )
            except Exception as exc:
                summary["failed"] += 1
                cases.append(
                    {
                        "feedback_id": feedback_id,
                        "question": "",
                        "status": "failed",
                        "error": f"{exc.__class__.__name__}: {exc}",
                        "diff": {},
                    }
                )
        if summary["succeeded"]:
            summary["avg_duration_ms"] = round(
                duration_total / summary["succeeded"], 1
            )
        variant_runs.append(
            {
                "name": name,
                "overrides": overrides,
                "summary": summary,
                "cases": cases,
            }
        )
        summary_by_variant[name] = summary

    duration_ms = round((time.perf_counter() - started) * 1000, 1)
    with session_factory() as session:
        row = RagFeedbackExperiment(
            filters=filters,
            feedback_ids=selected,
            variants=normalized_variants,
            summary=summary_by_variant,
            results=variant_runs,
            status="completed" if selected else "empty",
            created_by=str(actor or "")[:120],
            duration_ms=int(duration_ms),
        )
        session.add(row)
        session.commit()
        session.refresh(row)
        return serialize_experiment(row, include_results=True)


def list_feedback_experiments(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
) -> Dict[str, Any]:
    with session_factory() as session:
        rows = session.scalars(
            select(RagFeedbackExperiment)
            .order_by(RagFeedbackExperiment.created_at.desc())
            .limit(max(1, min(100, int(limit))))
        ).all()
        return {
            "experiments": [
                serialize_experiment(row) for row in rows
            ]
        }


def list_feedback_evaluations(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
) -> Dict[str, Any]:
    with session_factory() as session:
        rows = session.scalars(
            select(RagFeedbackEvaluation)
            .order_by(RagFeedbackEvaluation.created_at.desc())
            .limit(max(1, min(100, int(limit))))
        ).all()
        return {
            "evaluations": [
                serialize_evaluation(row) for row in rows
            ]
        }


def promote_feedback_to_question_bank(
    session_factory: sessionmaker[Session],
    settings: Settings,
    feedback_id: int,
    *,
    actor: str,
) -> Dict[str, Any]:
    """Create a shared, pending-review question-bank draft from a feedback.

    The generated item is deliberately a draft: ``pending_review`` and
    ``source=user_feedback``.  It is never created as holdout, and it never
    copies the visitor's raw comment into the question bank or the agent
    export.
    """

    now = _utcnow()
    existing_item: Optional[Dict[str, Any]] = None
    already_linked = False
    request_id = ""
    with session_factory() as session:
        row = session.get(RagFeedback, int(feedback_id))
        if row is None:
            raise FeedbackError(404, "feedback_not_found", "找不到這筆回饋。")
        if row.sentiment != "unsatisfied":
            raise FeedbackError(
                422,
                "feedback_not_unsatisfied",
                "只有不滿意回饋可以建立改善題目。",
            )
        if not row.actionable:
            raise FeedbackError(
                422,
                "feedback_not_actionable",
                "請先將回饋標記為可行動。",
            )
        expected_behavior = str(row.expected_behavior or "").strip()
        if not expected_behavior:
            raise FeedbackError(
                422,
                "expected_behavior_required",
                "請先填寫人工建議 Agent 修正方向的 prompt，才能建立題庫 draft。",
            )
        snapshot = row.snapshot or {}
        question = str(snapshot.get("question") or "").strip()
        if len(question) < 4:
            raise FeedbackError(
                422,
                "feedback_question_missing",
                "這筆回饋沒有可建立題目的問題文字。",
            )
        reasons = _reasons_for(session, [int(row.id)]).get(int(row.id), [])
        request_id = str(row.request_id or "")
        if row.linked_question_id:
            linked = session.get(QuestionBankItem, int(row.linked_question_id))
            if linked is not None and linked.deleted_at is None:
                if linked.visibility == "holdout":
                    raise FeedbackError(
                        409,
                        "feedback_holdout_duplicate",
                        "此回饋已連結 holdout 題目，禁止自動匯出或再連結。",
                    )
                existing_item = serialize_item(linked)
                already_linked = True
        duplicate = session.scalars(
            select(QuestionBankItem).where(
                QuestionBankItem.fingerprint == question_fingerprint(question),
                QuestionBankItem.deleted_at.is_(None),
            )
        ).first()
        if duplicate is not None:
            if duplicate.visibility == "holdout":
                raise FeedbackError(
                    409,
                    "feedback_holdout_duplicate",
                    "相同題目已存在於 holdout，禁止自動連結或匯出。",
                )
            existing_item = serialize_item(duplicate)
        law_refs: List[Dict[str, str]] = []
        seen_laws: set[str] = set()
        for source in snapshot.get("law_sources") or []:
            if not isinstance(source, Mapping):
                continue
            law_name = str(source.get("law_name") or "").strip()
            if not law_name or law_name in seen_laws:
                continue
            seen_laws.add(law_name)
            law_refs.append({"law_name": law_name})
        verdicts = row.citation_verdicts or {}
        supported_judgments: List[Dict[str, str]] = []
        seen_jids: set[str] = set()
        for citation in snapshot.get("citations") or []:
            if not isinstance(citation, Mapping):
                continue
            jid = str(citation.get("jid") or "").strip()
            if (
                not jid
                or jid in seen_jids
                or verdicts.get(f"jid:{jid}") != "supports"
            ):
                continue
            seen_jids.add(jid)
            supported_judgments.append({"jid": jid})

    if already_linked and existing_item is not None:
        return {
            "feedback": get_feedback(session_factory, feedback_id),
            "item": existing_item,
            "reused": True,
        }

    if existing_item is None:
        payload: Dict[str, Any] = {
            "question": question,
            "question_type": "general",
            "difficulty": "medium",
            "status": "pending_review",
            "visibility": "shared",
            "source": "user_feedback",
            "reference_answer": str(snapshot.get("answer") or "").strip(),
            "expected_laws": law_refs,
            "expected_articles": [],
            "expected_judgments": supported_judgments,
            "rubric": {
                "source_feedback_id": int(feedback_id),
                "must_refuse": False,
            },
            "tags": list(
                dict.fromkeys(
                    [
                        "user_feedback",
                        f"rag-feedback-{int(feedback_id)}",
                        *[f"reason:{code}" for code in reasons],
                    ]
                )
            ),
            "notes": (
                f"由 RAG 使用者回饋 #{int(feedback_id)} 建立；"
                f"request_id={request_id}。"
                f"原因：{', '.join(reasons) or '未分類'}。"
                f"錯誤階段：{row.root_cause_stage or 'unknown'}；"
                f"答案判定：{row.answer_verdict or 'unknown'}；"
                f"預期回答模式：{row.expected_answer_mode or 'unknown'}；"
                f"預期拒答判定：{row.expected_refusal or 'unspecified'}。"
                f"人工建議 Agent 修正方向 prompt：{expected_behavior}。"
                "此題為 pending_review draft，需人工改寫與驗收；"
                "未自動進入 holdout，也不含使用者原始留言。"
            ),
        }
        try:
            item = create_item(
                session_factory,
                payload,
                actor=str(actor or "")[:120],
            )
        except QuestionBankError as exc:
            if payload["expected_laws"] or payload["expected_judgments"]:
                payload["expected_laws"] = []
                payload["expected_judgments"] = []
                try:
                    item = create_item(
                        session_factory,
                        payload,
                        actor=str(actor or "")[:120],
                    )
                except QuestionBankError as retry_exc:
                    raise FeedbackError(
                        422,
                        "question_bank_validation_failed",
                        "；".join(retry_exc.errors)
                        or "題庫 draft 驗證失敗。",
                    ) from retry_exc
            else:
                raise FeedbackError(
                    422,
                    "question_bank_validation_failed",
                    "；".join(exc.errors) or "題庫 draft 驗證失敗。",
                ) from exc
    else:
        item = existing_item

    with session_factory() as session:
        row = session.get(RagFeedback, int(feedback_id))
        if row is None:
            raise FeedbackError(404, "feedback_not_found", "找不到這筆回饋。")
        row.linked_question_id = int(item["id"])
        row.expires_at = max(
            _aware(row.expires_at) or now,
            now + timedelta(
                days=max(1, int(settings.rag_feedback_retention_days))
            ),
        )
        session.add(
            RagFeedbackEvent(
                feedback_id=row.id,
                event_type="promoted",
                from_status=row.status,
                to_status=row.status,
                actor=str(actor or "")[:120],
                comment=f"題庫 draft #{item['id']}",
            )
        )
        session.commit()

    return {
        "feedback": get_feedback(session_factory, feedback_id),
        "item": item,
        "reused": existing_item is not None,
    }


def _parse_optional_date(value: Any, field: str) -> Optional[date]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    try:
        return date.fromisoformat(text)
    except ValueError as exc:
        raise FeedbackError(
            422,
            "invalid_feedback_date",
            f"{field} 必須是 YYYY-MM-DD。",
        ) from exc


def _normalize_citation_verdicts(value: Any) -> Dict[str, Any]:
    if value is None or value == "":
        return {}
    if not isinstance(value, Mapping):
        raise FeedbackError(
            422, "invalid_citation_verdicts", "引用判定格式不正確。"
        )
    result: Dict[str, Any] = {}
    for key, verdict in value.items():
        name = str(key or "").strip()
        if not name or len(name) > 240:
            raise FeedbackError(
                422, "invalid_citation_key", "引用判定鍵值不正確。"
            )
        if name == "missing":
            result["missing"] = bool(verdict)
            continue
        code = str(verdict or "").strip()
        if code not in CITATION_VERDICTS:
            raise FeedbackError(
                422,
                "invalid_citation_verdict",
                f"未知的引用判定：{code or '空白'}",
            )
        result[name] = code
    return result


def update_feedback(
    session_factory: sessionmaker[Session],
    feedback_id: int,
    updates: Mapping[str, Any],
    *,
    actor: str,
    settings: Settings,
) -> Dict[str, Any]:
    allowed = {
        "status",
        "severity",
        "actionable",
        "expected_behavior",
        "root_cause_stage",
        "answer_verdict",
        "expected_answer_mode",
        "expected_refusal",
        "expected_date_from",
        "expected_date_to",
        "citation_verdicts",
        "issue_id",
        "review_comment",
        "linked_pr_url",
        "linked_question_id",
    }
    unknown = sorted(set(updates) - allowed)
    if unknown:
        raise FeedbackError(
            422,
            "invalid_feedback_field",
            f"不支援的回饋欄位：{', '.join(unknown)}",
        )
    with session_factory() as session:
        row = session.get(RagFeedback, int(feedback_id))
        if row is None:
            raise FeedbackError(404, "feedback_not_found", "找不到這筆回饋。")
        before = row.status
        if "status" in updates:
            status = str(updates.get("status") or "").strip()
            if status not in FEEDBACK_STATUSES:
                raise FeedbackError(422, "invalid_status", "回饋狀態不正確。")
            row.status = status
        if "severity" in updates:
            severity = str(updates.get("severity") or "").strip()
            if severity not in SEVERITIES:
                raise FeedbackError(422, "invalid_severity", "嚴重度不正確。")
            row.severity = severity
        if "actionable" in updates:
            row.actionable = bool(updates.get("actionable"))
        if "expected_behavior" in updates:
            text = str(updates.get("expected_behavior") or "").strip()
            if len(text) > COMMENT_MAX_LENGTH:
                raise FeedbackError(
                    422, "expected_behavior_too_long", "人工建議 Agent 修正方向的 prompt 最多 4000 字。"
                )
            row.expected_behavior = text
        if "root_cause_stage" in updates:
            stage = str(updates.get("root_cause_stage") or "").strip()
            if stage not in ROOT_CAUSE_STAGES:
                raise FeedbackError(
                    422, "invalid_root_cause_stage", "錯誤階段不正確。"
                )
            row.root_cause_stage = stage
        if "answer_verdict" in updates:
            verdict = str(updates.get("answer_verdict") or "").strip()
            if verdict not in ANSWER_VERDICTS:
                raise FeedbackError(
                    422, "invalid_answer_verdict", "答案判定不正確。"
                )
            row.answer_verdict = verdict
        if "expected_answer_mode" in updates:
            mode = str(updates.get("expected_answer_mode") or "").strip()
            if mode not in EXPECTED_ANSWER_MODES:
                raise FeedbackError(
                    422, "invalid_expected_answer_mode", "預期回答模式不正確。"
                )
            row.expected_answer_mode = mode
        if "expected_refusal" in updates:
            expected_refusal = str(
                updates.get("expected_refusal") or ""
            ).strip()
            if expected_refusal not in EXPECTED_REFUSALS:
                raise FeedbackError(
                    422,
                    "invalid_expected_refusal",
                    "預期拒答判定不正確。",
                )
            row.expected_refusal = expected_refusal
        if "expected_date_from" in updates:
            row.expected_date_from = _parse_optional_date(
                updates.get("expected_date_from"), "expected_date_from"
            )
        if "expected_date_to" in updates:
            row.expected_date_to = _parse_optional_date(
                updates.get("expected_date_to"), "expected_date_to"
            )
        if (
            row.expected_date_from
            and row.expected_date_to
            and row.expected_date_from > row.expected_date_to
        ):
            raise FeedbackError(
                422,
                "invalid_feedback_date_range",
                "預期日期起日不可晚於迄日。",
            )
        if "citation_verdicts" in updates:
            row.citation_verdicts = _normalize_citation_verdicts(
                updates.get("citation_verdicts")
            )
        if "issue_id" in updates:
            value = updates.get("issue_id")
            if value in {None, ""}:
                row.issue_id = None
            else:
                issue_id = int(value)
                if session.get(RagFeedbackIssue, issue_id) is None:
                    raise FeedbackError(
                        422, "issue_not_found", "連結的問題群組不存在。"
                    )
                row.issue_id = issue_id
        if "review_comment" in updates:
            text = str(updates.get("review_comment") or "").strip()
            if len(text) > COMMENT_MAX_LENGTH:
                raise FeedbackError(
                    422, "review_comment_too_long", "審查備註最多 4000 字。"
                )
            row.review_comment = text
        if "linked_pr_url" in updates:
            row.linked_pr_url = str(updates.get("linked_pr_url") or "").strip()[:1000]
        if "linked_question_id" in updates:
            value = updates.get("linked_question_id")
            if value in {None, ""}:
                row.linked_question_id = None
            else:
                question_id = int(value)
                if session.get(QuestionBankItem, question_id) is None:
                    raise FeedbackError(
                        422,
                        "linked_question_not_found",
                        "連結的題庫題目不存在。",
                    )
                row.linked_question_id = question_id
        now = _utcnow()
        row.reviewed_by = str(actor or "")[:120]
        row.reviewed_at = now
        row.updated_at = now
        row.expires_at = max(
            _aware(row.expires_at) or now,
            now
            + timedelta(days=max(1, int(settings.rag_feedback_retention_days))),
        )
        session.add(
            RagFeedbackEvent(
                feedback_id=row.id,
                event_type="triaged",
                from_status=before,
                to_status=row.status,
                actor=str(actor or "")[:120],
                comment=str(updates.get("review_comment") or "")[
                    :COMMENT_MAX_LENGTH
                ],
            )
        )
        session.commit()
        session.refresh(row)
        reasons = _reasons_for(session, [int(row.id)]).get(int(row.id), [])
        payload = _attach_issue(
            session,
            row,
            serialize_feedback(row, reasons, include_snapshot=True),
        )
        payload["events"] = [
            {
                "id": event.id,
                "event_type": event.event_type,
                "from_status": event.from_status,
                "to_status": event.to_status,
                "actor": event.actor,
                "comment": event.comment,
                "created_at": _iso(event.created_at),
            }
            for event in session.scalars(
                select(RagFeedbackEvent)
                .where(RagFeedbackEvent.feedback_id == int(row.id))
                .order_by(RagFeedbackEvent.created_at.desc())
                .limit(50)
            ).all()
        ]
        return payload


def feedback_count_since(
    session_factory: Optional[sessionmaker[Session]],
    since: datetime,
) -> int:
    if session_factory is None:
        return 0
    try:
        with session_factory() as session:
            return int(
                session.scalar(
                    select(func.count())
                    .select_from(RagFeedback)
                    .where(RagFeedback.created_at >= since)
                )
                or 0
            )
    except Exception:
        logger.warning("feedback daily count failed", exc_info=True)
        return 0


def export_agent_feedback(
    session_factory: sessionmaker[Session],
    *,
    filters: Optional[Mapping[str, Any]] = None,
    limit: int = 500,
    require_ready: bool = True,
) -> List[Dict[str, Any]]:
    """Return the structured, comment-free export used for agent proposals.

    By default only feedback that a human marked ``actionable`` and supplied
    ``expected_behavior`` for is exported.  The free-text comment is
    intentionally excluded: anonymous visitors can write it and it will be read
    by an agent that can change code.  Operators read the original comment in
    the admin UI instead.  Holdout question-bank items are never referenced.
    """

    filters = dict(filters or {})
    filters.setdefault("sentiment", "unsatisfied")
    with session_factory() as session:
        statement = _feedback_filters(select(RagFeedback), filters)
        if require_ready:
            statement = statement.where(
                RagFeedback.actionable.is_(True),
                RagFeedback.expected_behavior != "",
                RagFeedback.status.notin_(("resolved", "dismissed")),
            )
        rows = session.scalars(
            statement.order_by(RagFeedback.created_at.asc()).limit(
                max(1, min(2000, int(limit)))
            )
        ).all()
        reasons = _reasons_for(session, [int(row.id) for row in rows])
        linked_ids = {
            int(row.linked_question_id)
            for row in rows
            if row.linked_question_id
        }
        issue_ids = {
            int(row.issue_id) for row in rows if row.issue_id
        }
        issue_map = {}
        if issue_ids:
            issue_map = {
                int(issue.id): issue
                for issue in session.scalars(
                    select(RagFeedbackIssue).where(
                        RagFeedbackIssue.id.in_(issue_ids)
                    )
                ).all()
            }
        holdout_ids: set[int] = set()
        if linked_ids:
            holdout_ids = {
                int(value)
                for value in session.scalars(
                    select(QuestionBankItem.id).where(
                        QuestionBankItem.id.in_(linked_ids),
                        QuestionBankItem.visibility == "holdout",
                    )
                ).all()
            }
        result: List[Dict[str, Any]] = []
        for row in rows:
            snapshot = row.snapshot or {}
            retrieval = snapshot.get("retrieval") or {}
            flow = snapshot.get("pipeline_flow") or {}
            linked_id = (
                int(row.linked_question_id)
                if row.linked_question_id
                and int(row.linked_question_id) not in holdout_ids
                else None
            )
            result.append(
                {
                    "feedback_id": row.id,
                    "request_id": row.request_id,
                    "created_at": _iso(row.created_at),
                    "sentiment": row.sentiment,
                    "reason_codes": reasons.get(int(row.id), []),
                    "expected_behavior": row.expected_behavior,
                    "root_cause_stage": row.root_cause_stage or "unknown",
                    "answer_verdict": row.answer_verdict or "unknown",
                    "expected_answer_mode": (
                        row.expected_answer_mode or "unknown"
                    ),
                    "expected_refusal": (
                        row.expected_refusal or "unspecified"
                    ),
                    "expected_date_from": (
                        row.expected_date_from.isoformat()
                        if row.expected_date_from
                        else None
                    ),
                    "expected_date_to": (
                        row.expected_date_to.isoformat()
                        if row.expected_date_to
                        else None
                    ),
                    "citation_verdicts": row.citation_verdicts or {},
                    "issue": (
                        {
                            "id": int(issue_map[int(row.issue_id)].id),
                            "title": issue_map[int(row.issue_id)].title,
                            "root_cause_stage": (
                                issue_map[int(row.issue_id)].root_cause_stage
                            ),
                            "status": issue_map[int(row.issue_id)].status,
                            "linked_pr_url": (
                                issue_map[int(row.issue_id)].linked_pr_url
                            ),
                        }
                        if row.issue_id
                        and int(row.issue_id) in issue_map
                        else None
                    ),
                    "severity": row.severity,
                    "actionable": bool(row.actionable),
                    "linked_question_id": linked_id,
                    "question": str(snapshot.get("question") or ""),
                    "answer": str(snapshot.get("answer") or ""),
                    "answer_source": snapshot.get("answer_source") or "",
                    "answer_status": snapshot.get("status") or "",
                    "trace": {
                        "retrieval_status": retrieval.get("status"),
                        "retrieval_mode": retrieval.get("mode"),
                        "query_filters": retrieval.get("query_filters"),
                        "decisions": flow.get("decisions") or [],
                        "decision_version": flow.get("decision_version", 1),
                    },
                    "system_version": row.system_version or {},
                }
            )
        return result


def record_feedback_export(
    session_factory: Optional[sessionmaker[Session]],
    settings: Settings,
    *,
    filters: Mapping[str, Any],
    feedback_ids: Sequence[int],
    format: str = "jsonl",
    status: str = "created",
) -> Optional[int]:
    """Record one agent-facing export for later audit."""

    if session_factory is None:
        return None
    try:
        with session_factory() as session:
            row = RagFeedbackExport(
                filter_json=dict(filters),
                feedback_ids=[int(value) for value in feedback_ids],
                format=str(format or "jsonl")[:16],
                status=str(status or "created")[:24],
                model="",
                prompt_version=settings.rag_prompt_version or "",
            )
            session.add(row)
            session.commit()
            session.refresh(row)
            return int(row.id)
    except Exception:
        logger.warning("feedback export audit write failed", exc_info=True)
        return None


def prune_rag_interactions(
    session_factory: Optional[sessionmaker[Session]],
    *,
    now: Optional[datetime] = None,
) -> int:
    if session_factory is None:
        return 0
    current = _aware(now or _utcnow()) or _utcnow()
    try:
        with session_factory() as session:
            result = session.execute(
                delete(RagInteraction).where(
                    RagInteraction.expires_at < current
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("RAG interaction retention failed", exc_info=True)
        return 0


def prune_rag_feedback_experiments(
    session_factory: Optional[sessionmaker[Session]],
    *,
    now: Optional[datetime] = None,
) -> int:
    if session_factory is None:
        return 0
    current = _aware(now or _utcnow()) or _utcnow()
    cutoff = current - timedelta(days=180)
    try:
        with session_factory() as session:
            result = session.execute(
                delete(RagFeedbackExperiment).where(
                    RagFeedbackExperiment.created_at < cutoff
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("RAG feedback experiment retention failed", exc_info=True)
        return 0


def prune_rag_feedback_evaluations(
    session_factory: Optional[sessionmaker[Session]],
    *,
    now: Optional[datetime] = None,
) -> int:
    if session_factory is None:
        return 0
    current = _aware(now or _utcnow()) or _utcnow()
    cutoff = current - timedelta(days=180)
    try:
        with session_factory() as session:
            result = session.execute(
                delete(RagFeedbackEvaluation).where(
                    RagFeedbackEvaluation.created_at < cutoff
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("RAG feedback evaluation retention failed", exc_info=True)
        return 0


def prune_rag_feedback_issues(
    session_factory: Optional[sessionmaker[Session]],
    *,
    now: Optional[datetime] = None,
) -> int:
    if session_factory is None:
        return 0
    current = _aware(now or _utcnow()) or _utcnow()
    cutoff = current - timedelta(days=180)
    try:
        with session_factory() as session:
            linked = select(RagFeedback.issue_id).where(
                RagFeedback.issue_id.isnot(None)
            )
            result = session.execute(
                delete(RagFeedbackIssue).where(
                    RagFeedbackIssue.updated_at < cutoff,
                    RagFeedbackIssue.id.notin_(linked),
                )
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("RAG feedback issue retention failed", exc_info=True)
        return 0


def prune_rag_feedback(
    session_factory: Optional[sessionmaker[Session]],
    *,
    now: Optional[datetime] = None,
) -> int:
    if session_factory is None:
        return 0
    current = _aware(now or _utcnow()) or _utcnow()
    try:
        with session_factory() as session:
            expired = select(RagFeedback.id).where(
                RagFeedback.expires_at < current
            )
            ids = list(session.scalars(expired).all())
            if not ids:
                return 0
            session.execute(
                delete(RagFeedbackReason).where(
                    RagFeedbackReason.feedback_id.in_(ids)
                )
            )
            session.execute(
                delete(RagFeedbackEvent).where(
                    RagFeedbackEvent.feedback_id.in_(ids)
                )
            )
            result = session.execute(
                delete(RagFeedback).where(RagFeedback.id.in_(ids))
            )
            session.commit()
            return int(result.rowcount or 0)
    except Exception:
        logger.warning("RAG feedback retention failed", exc_info=True)
        return 0
