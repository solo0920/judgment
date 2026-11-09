from __future__ import annotations

import hashlib
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Sequence, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, sessionmaker

from .models import (
    BenchmarkSuite,
    BenchmarkSuiteItem,
    JudgmentDocument,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
    QuestionBankItem,
    QuestionBankItemVersion,
    QuestionBankReview,
)

QUESTION_STATUSES = (
    "draft",
    "pending_review",
    "changes_requested",
    "accepted",
    "rejected",
    "retired",
)
QUESTION_TYPES = (
    "law_concept",
    "article_lookup",
    "judgment_lookup",
    "structured",
    "general",
    "refusal",
)
DIFFICULTIES = ("easy", "medium", "hard")
VISIBILITIES = ("shared", "holdout")
SUITE_TIERS = ("smoke", "core", "full", "holdout")


class QuestionBankError(ValueError):
    def __init__(
        self,
        message: str,
        *,
        errors: Optional[Sequence[str]] = None,
        warnings: Optional[Sequence[str]] = None,
    ) -> None:
        super().__init__(message)
        self.errors = list(errors or [message])
        self.warnings = list(warnings or [])


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def normalize_question(value: str) -> str:
    return re.sub(r"\s+", "", str(value or "")).strip()


def question_fingerprint(value: str) -> str:
    return hashlib.sha256(normalize_question(value).encode("utf-8")).hexdigest()


def _normalize_article_no(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or ""))


def _hash_payload(payload: Any) -> str:
    encoded = json.dumps(
        payload, ensure_ascii=False, sort_keys=True, default=str
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def _as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, (list, tuple)):
        return list(value)
    return [value]


def _normalize_law_ref(value: Any) -> Dict[str, str]:
    if isinstance(value, str):
        return {"law_name": value.strip(), "source_type": ""}
    if not isinstance(value, dict):
        return {"law_name": "", "source_type": ""}
    return {
        "law_name": str(value.get("law_name") or value.get("name") or "").strip(),
        "source_type": str(value.get("source_type") or "").strip(),
    }


def _normalize_article_ref(value: Any) -> Dict[str, str]:
    if isinstance(value, str):
        return {
            "law_name": "",
            "law_key": "",
            "source_type": "",
            "article_no": value.strip(),
            "content_hash": "",
        }
    if not isinstance(value, dict):
        return {
            "law_name": "",
            "law_key": "",
            "source_type": "",
            "article_no": "",
            "content_hash": "",
        }
    return {
        "law_name": str(value.get("law_name") or value.get("law") or "").strip(),
        "law_key": str(value.get("law_key") or "").strip(),
        "source_type": str(value.get("source_type") or "").strip(),
        "article_no": str(value.get("article_no") or value.get("article") or "").strip(),
        "content_hash": str(value.get("content_hash") or "").strip(),
    }


def _normalize_judgment_ref(value: Any) -> Dict[str, str]:
    if isinstance(value, str):
        return {"jid": value.strip(), "court": "", "title": ""}
    if not isinstance(value, dict):
        return {"jid": "", "court": "", "title": ""}
    return {
        "jid": str(value.get("jid") or value.get("case_id") or "").strip(),
        "court": str(value.get("court") or "").strip(),
        "title": str(value.get("title") or "").strip(),
    }


def _normalize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    question = str(payload.get("question") or "").strip()
    question_type = str(payload.get("question_type") or "general").strip()
    difficulty = str(payload.get("difficulty") or "medium").strip()
    visibility = str(payload.get("visibility") or "shared").strip()
    rubric = payload.get("rubric")
    if not isinstance(rubric, dict):
        rubric = {}
    expected_laws = [
        item for item in (_normalize_law_ref(value) for value in _as_list(payload.get("expected_laws")))
        if item["law_name"]
    ]
    expected_articles = [
        item for item in (
            _normalize_article_ref(value)
            for value in _as_list(payload.get("expected_articles"))
        )
        if item["article_no"] and (item["law_name"] or item["law_key"])
    ]
    expected_judgments = [
        item for item in (
            _normalize_judgment_ref(value)
            for value in _as_list(payload.get("expected_judgments"))
        )
        if item["jid"]
    ]
    tags = [
        str(value).strip()
        for value in _as_list(payload.get("tags"))
        if str(value).strip()
    ]
    return {
        "question": question,
        "question_type": question_type,
        "difficulty": difficulty,
        "visibility": visibility,
        "expected_laws": expected_laws,
        "expected_articles": expected_articles,
        "expected_judgments": expected_judgments,
        "reference_answer": str(payload.get("reference_answer") or "").strip(),
        "rubric": rubric,
        "tags": list(dict.fromkeys(tags)),
        "source": str(payload.get("source") or "manual").strip(),
        "notes": str(payload.get("notes") or "").strip(),
    }


def _article_cache_key(law_key: str, version_id: int) -> str:
    return f"{law_key}:{version_id}"


def _current_versions(session: Session) -> Dict[str, int]:
    rows = session.scalars(
        select(LawDatasetVersion).where(LawDatasetVersion.is_current.is_(True))
    ).all()
    return {str(row.source_type): int(row.id) for row in rows}


def _articles_for_law(
    session: Session,
    *,
    law_key: str,
    version_id: int,
) -> Dict[str, LawArticleVersion]:
    rows = session.scalars(
        select(LawArticleVersion).where(
            LawArticleVersion.law_key == law_key,
            LawArticleVersion.law_version_id == version_id,
            LawArticleVersion.article_type == "A",
        )
    ).all()
    return {
        _normalize_article_no(row.article_no): row
        for row in rows
    }


def validate_payload(
    session_factory: sessionmaker[Session],
    payload: Dict[str, Any],
    *,
    item_id: Optional[int] = None,
    article_cache: Optional[Dict[str, Dict[str, LawArticleVersion]]] = None,
) -> Dict[str, Any]:
    normalized = _normalize_payload(payload)
    errors: List[str] = []
    warnings: List[str] = []
    stale = False
    stale_reasons: List[str] = []
    question = normalized["question"]
    if len(question) < 4:
        errors.append("題目至少需要 4 個字。")
    if normalized["question_type"] not in QUESTION_TYPES:
        errors.append(f"不支援的題型：{normalized['question_type']}")
    if normalized["difficulty"] not in DIFFICULTIES:
        errors.append(f"不支援的難度：{normalized['difficulty']}")
    if normalized["visibility"] not in VISIBILITIES:
        errors.append(f"不支援的可見性：{normalized['visibility']}")

    cache = article_cache if article_cache is not None else {}
    with session_factory() as session:
        current_versions = _current_versions(session)
        fingerprint = question_fingerprint(question)
        duplicate = session.scalars(
            select(QuestionBankItem).where(
                QuestionBankItem.fingerprint == fingerprint,
                QuestionBankItem.deleted_at.is_(None),
            )
        ).first()
        if duplicate is not None and int(duplicate.id) != int(item_id or 0):
            errors.append(f"題目已存在（題庫編號 {duplicate.id}）。")

        law_by_name: Dict[Tuple[str, str], LawDocument] = {}
        for ref in normalized["expected_laws"]:
            statement = select(LawDocument).where(
                LawDocument.is_current.is_(True),
                LawDocument.law_name == ref["law_name"],
            )
            if ref["source_type"]:
                statement = statement.where(
                    LawDocument.source_type == ref["source_type"]
                )
            record = session.scalars(statement).first()
            if record is None:
                errors.append(f"找不到現行法規／命令：{ref['law_name']}")
                continue
            law_by_name[(record.law_name, record.source_type)] = record

        resolved_articles: List[Dict[str, str]] = []
        for ref in normalized["expected_articles"]:
            law_name = ref["law_name"]
            law_ref: Optional[LawDocument] = None
            if law_name:
                candidates = [
                    record
                    for (name, _), record in law_by_name.items()
                    if name == law_name
                ]
                if candidates:
                    law_ref = candidates[0]
                else:
                    statement = select(LawDocument).where(
                        LawDocument.is_current.is_(True),
                        LawDocument.law_name == law_name,
                    )
                    if ref["source_type"]:
                        statement = statement.where(
                            LawDocument.source_type == ref["source_type"]
                        )
                    law_ref = session.scalars(statement).first()
            elif ref["law_key"]:
                law_ref = session.scalars(
                    select(LawDocument).where(
                        LawDocument.is_current.is_(True),
                        LawDocument.law_key == ref["law_key"],
                    )
                ).first()
            if law_ref is None:
                errors.append(
                    f"找不到條文所屬法規：{law_name or ref['law_key'] or '未指定'}"
                )
                continue
            version_id = current_versions.get(law_ref.source_type)
            if version_id is None:
                errors.append(f"找不到 {law_ref.law_name} 的現行版本。")
                continue
            cache_key = _article_cache_key(law_ref.law_key, version_id)
            if cache_key not in cache:
                cache[cache_key] = _articles_for_law(
                    session,
                    law_key=law_ref.law_key,
                    version_id=version_id,
                )
            article_no = _normalize_article_no(ref["article_no"])
            current = cache[cache_key].get(article_no)
            if current is None:
                errors.append(
                    f"找不到條文：{law_ref.law_name} {ref['article_no']}"
                )
                continue
            current_hash = str(current.content_hash or "")
            expected_hash = ref["content_hash"]
            if expected_hash and expected_hash != current_hash:
                stale = True
                stale_reasons.append(
                    f"{law_ref.law_name} {current.article_no} 條文內容已變更。"
                )
            resolved_articles.append(
                {
                    "law_name": law_ref.law_name,
                    "law_key": law_ref.law_key,
                    "source_type": law_ref.source_type,
                    "article_no": current.article_no,
                    "content_hash": current_hash,
                }
            )

        for ref in normalized["expected_judgments"]:
            exists = session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(JudgmentDocument.jid == ref["jid"])
            )
            if not exists:
                errors.append(f"找不到判決：{ref['jid']}")

    if not normalized["expected_laws"] and not normalized["expected_articles"]:
        if not normalized["expected_judgments"] and not bool(
            normalized["rubric"].get("must_refuse")
        ):
            warnings.append(
                "尚未標註 expected laws/articles/judgments；可建立草稿，但不可作為 benchmark-ready 題目。"
            )
    if stale and stale_reasons:
        warnings.extend(stale_reasons)

    return {
        "valid": not errors,
        "errors": errors,
        "warnings": warnings,
        "stale": stale,
        "stale_reason": " ".join(stale_reasons),
        "normalized": {
            **normalized,
            "expected_articles": resolved_articles
            or normalized["expected_articles"],
        },
        "fingerprint": question_fingerprint(question),
        "content_hash": _hash_payload(
            {
                **normalized,
                "expected_articles": resolved_articles
                or normalized["expected_articles"],
            }
        ),
    }


def _item_benchmark_ready(item: QuestionBankItem) -> bool:
    if item.deleted_at is not None or item.status != "accepted" or item.stale:
        return False
    return bool(
        item.expected_laws
        or item.expected_articles
        or item.expected_judgments
        or (item.rubric or {}).get("must_refuse")
    )


def _item_snapshot(item: QuestionBankItem) -> Dict[str, Any]:
    return {
        "fingerprint": item.fingerprint,
        "question": item.question,
        "question_type": item.question_type,
        "difficulty": item.difficulty,
        "expected_laws": item.expected_laws or [],
        "expected_articles": item.expected_articles or [],
        "expected_judgments": item.expected_judgments or [],
        "reference_answer": item.reference_answer,
        "rubric": item.rubric or {},
        "tags": item.tags or [],
        "visibility": item.visibility,
        "source": item.source,
        "notes": item.notes,
        "content_hash": item.content_hash,
    }


def serialize_item(
    item: QuestionBankItem,
    *,
    reviews: Optional[Sequence[QuestionBankReview]] = None,
) -> Dict[str, Any]:
    return {
        "id": item.id,
        "lineage_id": item.lineage_id,
        "fingerprint": item.fingerprint,
        "question": item.question,
        "question_type": item.question_type,
        "difficulty": item.difficulty,
        "status": item.status,
        "version": item.version,
        "expected_laws": item.expected_laws or [],
        "expected_articles": item.expected_articles or [],
        "expected_judgments": item.expected_judgments or [],
        "reference_answer": item.reference_answer,
        "rubric": item.rubric or {},
        "tags": item.tags or [],
        "visibility": item.visibility,
        "source": item.source,
        "notes": item.notes,
        "created_by": item.created_by,
        "reviewed_by": item.reviewed_by,
        "review_comment": item.review_comment,
        "content_hash": item.content_hash,
        "stale": bool(item.stale),
        "stale_reason": item.stale_reason,
        "benchmark_ready": _item_benchmark_ready(item),
        "last_reviewed_at": _iso(item.last_reviewed_at),
        "deleted_at": _iso(item.deleted_at),
        "created_at": _iso(item.created_at),
        "updated_at": _iso(item.updated_at),
        "reviews": [
            {
                "id": review.id,
                "item_version": review.item_version,
                "reviewer": review.reviewer,
                "decision": review.decision,
                "rubric_scores": review.rubric_scores or {},
                "comment": review.comment,
                "created_at": _iso(review.created_at),
            }
            for review in (reviews or [])
        ],
    }


def _reviews_for(session: Session, item_id: int) -> List[QuestionBankReview]:
    return list(
        session.scalars(
            select(QuestionBankReview)
            .where(QuestionBankReview.item_id == item_id)
            .order_by(QuestionBankReview.created_at.desc())
        ).all()
    )


def _initial_status(payload: Dict[str, Any]) -> str:
    requested = str(payload.get("status") or "").strip()
    if requested in QUESTION_STATUSES:
        return requested
    return "draft"


def create_item(
    session_factory: sessionmaker[Session],
    payload: Dict[str, Any],
    *,
    actor: str = "",
    article_cache: Optional[Dict[str, Dict[str, LawArticleVersion]]] = None,
) -> Dict[str, Any]:
    validation = validate_payload(
        session_factory, payload, article_cache=article_cache
    )
    if not validation["valid"]:
        raise QuestionBankError(
            "題目驗證失敗",
            errors=validation["errors"],
            warnings=validation["warnings"],
        )
    normalized = validation["normalized"]
    with session_factory() as session:
        item = QuestionBankItem(
            lineage_id=uuid.uuid4().hex,
            fingerprint=validation["fingerprint"],
            question=normalized["question"],
            question_type=normalized["question_type"],
            difficulty=normalized["difficulty"],
            status=_initial_status(payload),
            version=1,
            expected_laws=normalized["expected_laws"],
            expected_articles=normalized["expected_articles"],
            expected_judgments=normalized["expected_judgments"],
            reference_answer=normalized["reference_answer"],
            rubric=normalized["rubric"],
            tags=normalized["tags"],
            visibility=normalized["visibility"],
            source=normalized["source"],
            notes=normalized["notes"],
            created_by=str(actor or payload.get("created_by") or "")[:120],
            content_hash=validation["content_hash"],
            stale=bool(validation["stale"]),
            stale_reason=validation["stale_reason"],
        )
        session.add(item)
        session.flush()
        session.add(
            QuestionBankItemVersion(
                item_id=item.id,
                version=1,
                snapshot=_item_snapshot(item),
                editor=item.created_by,
                change_note="建立題目",
            )
        )
        session.commit()
        session.refresh(item)
        return serialize_item(item)


def update_item(
    session_factory: sessionmaker[Session],
    item_id: int,
    payload: Dict[str, Any],
    *,
    actor: str = "",
    change_note: str = "",
    article_cache: Optional[Dict[str, Dict[str, LawArticleVersion]]] = None,
) -> Dict[str, Any]:
    validation = validate_payload(
        session_factory,
        payload,
        item_id=item_id,
        article_cache=article_cache,
    )
    if not validation["valid"]:
        raise QuestionBankError(
            "題目驗證失敗",
            errors=validation["errors"],
            warnings=validation["warnings"],
        )
    normalized = validation["normalized"]
    with session_factory() as session:
        item = session.get(QuestionBankItem, int(item_id))
        if item is None or item.deleted_at is not None:
            raise QuestionBankError("找不到題目。", errors=["找不到題目。"])
        item.fingerprint = validation["fingerprint"]
        item.question = normalized["question"]
        item.question_type = normalized["question_type"]
        item.difficulty = normalized["difficulty"]
        item.expected_laws = normalized["expected_laws"]
        item.expected_articles = normalized["expected_articles"]
        item.expected_judgments = normalized["expected_judgments"]
        item.reference_answer = normalized["reference_answer"]
        item.rubric = normalized["rubric"]
        item.tags = normalized["tags"]
        item.visibility = normalized["visibility"]
        item.source = normalized["source"]
        item.notes = normalized["notes"]
        item.content_hash = validation["content_hash"]
        item.stale = bool(validation["stale"])
        item.stale_reason = validation["stale_reason"]
        item.version = int(item.version or 1) + 1
        requested_status = str(payload.get("status") or "").strip()
        item.status = (
            requested_status
            if requested_status in QUESTION_STATUSES
            else "pending_review"
        )
        session.add(
            QuestionBankItemVersion(
                item_id=item.id,
                version=item.version,
                snapshot=_item_snapshot(item),
                editor=str(actor or payload.get("created_by") or "")[:120],
                change_note=str(change_note or "修改題目")[:4000],
            )
        )
        session.commit()
        session.refresh(item)
        return serialize_item(item, reviews=_reviews_for(session, item.id))


def get_item(
    session_factory: sessionmaker[Session],
    item_id: int,
    *,
    include_deleted: bool = False,
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        item = session.get(QuestionBankItem, int(item_id))
        if item is None:
            return None
        if item.deleted_at is not None and not include_deleted:
            return None
        return serialize_item(item, reviews=_reviews_for(session, item.id))


def delete_item(
    session_factory: sessionmaker[Session],
    item_id: int,
    *,
    actor: str = "",
) -> bool:
    with session_factory() as session:
        item = session.get(QuestionBankItem, int(item_id))
        if item is None or item.deleted_at is not None:
            return False
        item.deleted_at = _now()
        item.status = "retired"
        item.reviewed_by = str(actor or item.reviewed_by or "")[:120]
        session.commit()
        return True


def list_items(
    session_factory: sessionmaker[Session],
    *,
    query: str = "",
    status: str = "",
    question_type: str = "",
    difficulty: str = "",
    tag: str = "",
    stale: Optional[bool] = None,
    include_deleted: bool = False,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    limit = max(1, min(200, int(limit or 50)))
    offset = max(0, int(offset or 0))
    with session_factory() as session:
        statement = select(QuestionBankItem)
        if not include_deleted:
            statement = statement.where(QuestionBankItem.deleted_at.is_(None))
        if query:
            needle = f"%{query.strip()}%"
            statement = statement.where(
                or_(
                    QuestionBankItem.question.ilike(needle),
                    QuestionBankItem.reference_answer.ilike(needle),
                )
            )
        if status:
            statement = statement.where(QuestionBankItem.status == status)
        if question_type:
            statement = statement.where(
                QuestionBankItem.question_type == question_type
            )
        if difficulty:
            statement = statement.where(QuestionBankItem.difficulty == difficulty)
        if stale is not None:
            statement = statement.where(QuestionBankItem.stale.is_(bool(stale)))
        items = list(
            session.scalars(
                statement.order_by(QuestionBankItem.updated_at.desc())
                .offset(offset)
                .limit(limit)
            ).all()
        )
        if tag:
            items = [
                item
                for item in items
                if tag in [str(value) for value in (item.tags or [])]
            ]
        total_statement = select(func.count()).select_from(QuestionBankItem)
        if not include_deleted:
            total_statement = total_statement.where(
                QuestionBankItem.deleted_at.is_(None)
            )
        total = int(session.scalar(total_statement) or 0)
        return {
            "items": [serialize_item(item) for item in items],
            "total": total,
            "limit": limit,
            "offset": offset,
            "stats": question_bank_stats(session),
        }


def question_bank_stats(session: Session) -> Dict[str, Any]:
    items = session.scalars(
        select(QuestionBankItem).where(QuestionBankItem.deleted_at.is_(None))
    ).all()
    status_counts: Dict[str, int] = {}
    for item in items:
        status_counts[item.status] = status_counts.get(item.status, 0) + 1
    return {
        "total": len(items),
        "status_counts": status_counts,
        "draft": status_counts.get("draft", 0),
        "pending_review": status_counts.get("pending_review", 0),
        "changes_requested": status_counts.get("changes_requested", 0),
        "accepted": status_counts.get("accepted", 0),
        "rejected": status_counts.get("rejected", 0),
        "retired": status_counts.get("retired", 0),
        "stale": sum(1 for item in items if item.stale),
        "benchmark_ready": sum(1 for item in items if _item_benchmark_ready(item)),
    }


def review_item(
    session_factory: sessionmaker[Session],
    item_id: int,
    *,
    decision: str,
    reviewer: str = "",
    rubric_scores: Optional[Dict[str, Any]] = None,
    comment: str = "",
) -> Dict[str, Any]:
    decision = str(decision or "").strip()
    status_map = {
        "approved": "accepted",
        "rejected": "rejected",
        "changes_requested": "changes_requested",
    }
    if decision not in status_map:
        raise QuestionBankError(
            "不支援的審核結果。",
            errors=["decision 必須是 approved、rejected 或 changes_requested。"],
        )
    with session_factory() as session:
        item = session.get(QuestionBankItem, int(item_id))
        if item is None or item.deleted_at is not None:
            raise QuestionBankError("找不到題目。", errors=["找不到題目。"])
        validation = validate_payload(
            session_factory,
            _item_snapshot(item),
            item_id=item.id,
        )
        if decision == "approved" and not validation["valid"]:
            raise QuestionBankError(
                "題目驗證失敗，不能核准。",
                errors=validation["errors"],
            )
        item.status = status_map[decision]
        item.reviewed_by = str(reviewer or "")[:120]
        item.review_comment = str(comment or "")[:4000]
        item.last_reviewed_at = _now()
        item.stale = bool(validation["stale"])
        item.stale_reason = validation["stale_reason"]
        session.add(
            QuestionBankReview(
                item_id=item.id,
                item_version=item.version,
                reviewer=item.reviewed_by,
                decision=decision,
                rubric_scores=rubric_scores or {},
                comment=str(comment or "")[:4000],
            )
        )
        session.commit()
        session.refresh(item)
        return serialize_item(item, reviews=_reviews_for(session, item.id))


def revalidate_items(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    updated = stale = 0
    errors: List[Dict[str, Any]] = []
    with session_factory() as session:
        items = session.scalars(
            select(QuestionBankItem).where(QuestionBankItem.deleted_at.is_(None))
        ).all()
    article_cache: Dict[str, Dict[str, LawArticleVersion]] = {}
    for item in items:
        try:
            validation = validate_payload(
                session_factory,
                _item_snapshot(item),
                item_id=item.id,
                article_cache=article_cache,
            )
        except Exception as exc:
            errors.append({"id": item.id, "error": str(exc)})
            continue
        with session_factory() as session:
            current = session.get(QuestionBankItem, item.id)
            if current is None:
                continue
            current.stale = bool(validation["stale"])
            current.stale_reason = validation["stale_reason"]
            session.commit()
        updated += 1
        if validation["stale"]:
            stale += 1
    return {"checked": updated, "stale": stale, "errors": errors}


def import_items(
    session_factory: sessionmaker[Session],
    payload: Any,
    *,
    actor: str = "",
    mode: str = "upsert",
) -> Dict[str, Any]:
    if isinstance(payload, dict):
        raw_items = payload.get("items")
    else:
        raw_items = payload
    if not isinstance(raw_items, list):
        raise QuestionBankError(
            "JSON 格式錯誤。",
            errors=["JSON 必須是題目陣列，或包含 items 陣列的物件。"],
        )
    created = updated = 0
    errors: List[Dict[str, Any]] = []
    article_cache: Dict[str, Dict[str, LawArticleVersion]] = {}
    for index, raw in enumerate(raw_items):
        if not isinstance(raw, dict):
            errors.append({"index": index, "error": "項目必須是物件。"})
            continue
        try:
            fingerprint = question_fingerprint(str(raw.get("question") or ""))
            existing_id = None
            with session_factory() as session:
                existing = session.scalars(
                    select(QuestionBankItem).where(
                        QuestionBankItem.fingerprint == fingerprint,
                        QuestionBankItem.deleted_at.is_(None),
                    )
                ).first()
                existing_id = int(existing.id) if existing else None
            if existing_id and mode == "upsert":
                update_item(
                    session_factory,
                    existing_id,
                    raw,
                    actor=actor,
                    change_note="JSON 匯入更新",
                    article_cache=article_cache,
                )
                updated += 1
            elif existing_id:
                errors.append(
                    {"index": index, "error": f"題目已存在（#{existing_id}）。"}
                )
            else:
                create_item(
                    session_factory,
                    raw,
                    actor=actor,
                    article_cache=article_cache,
                )
                created += 1
        except QuestionBankError as exc:
            errors.append(
                {
                    "index": index,
                    "errors": exc.errors,
                    "warnings": exc.warnings,
                }
            )
        except Exception as exc:
            errors.append(
                {"index": index, "error": f"{exc.__class__.__name__}: {exc}"}
            )
    return {
        "created": created,
        "updated": updated,
        "errors": errors,
        "stats": list_items(session_factory, limit=1)["stats"],
    }


def _suite_item_dict(
    link: BenchmarkSuiteItem,
    item: QuestionBankItem,
) -> Dict[str, Any]:
    payload = serialize_item(item)
    payload["suite_item_id"] = link.id
    payload["suite_item_version"] = link.item_version
    payload["weight"] = int(link.weight or 1)
    payload["enabled"] = bool(link.enabled)
    return payload


def serialize_suite(
    suite: BenchmarkSuite,
    *,
    items: Optional[Sequence[Tuple[BenchmarkSuiteItem, QuestionBankItem]]] = None,
) -> Dict[str, Any]:
    return {
        "id": suite.id,
        "name": suite.name,
        "tier": suite.tier,
        "version": suite.version,
        "description": suite.description,
        "status": suite.status,
        "created_by": suite.created_by,
        "frozen_at": _iso(suite.frozen_at),
        "created_at": _iso(suite.created_at),
        "updated_at": _iso(suite.updated_at),
        "item_count": len(items or []),
        "enabled_count": sum(1 for link, _ in (items or []) if link.enabled),
        "items": [
            _suite_item_dict(link, item)
            for link, item in (items or [])
        ],
    }


def _suite_rows(
    session: Session,
    suite_id: int,
) -> List[Tuple[BenchmarkSuiteItem, QuestionBankItem]]:
    return list(
        session.execute(
            select(BenchmarkSuiteItem, QuestionBankItem)
            .join(
                QuestionBankItem,
                QuestionBankItem.id == BenchmarkSuiteItem.item_id,
            )
            .where(BenchmarkSuiteItem.suite_id == int(suite_id))
            .order_by(BenchmarkSuiteItem.id.asc())
        ).all()
    )


def list_suites(
    session_factory: sessionmaker[Session],
    *,
    include_items: bool = True,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        suites = session.scalars(
            select(BenchmarkSuite)
            .where(BenchmarkSuite.status != "deleted")
            .order_by(BenchmarkSuite.updated_at.desc())
        ).all()
        return [
            serialize_suite(
                suite,
                items=_suite_rows(session, suite.id) if include_items else [],
            )
            for suite in suites
        ]


def get_suite(
    session_factory: sessionmaker[Session],
    suite_id: int,
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        suite = session.get(BenchmarkSuite, int(suite_id))
        if suite is None:
            return None
        return serialize_suite(suite, items=_suite_rows(session, suite.id))


def create_suite(
    session_factory: sessionmaker[Session],
    *,
    name: str,
    tier: str = "core",
    description: str = "",
    item_ids: Optional[Sequence[int]] = None,
    actor: str = "",
) -> Dict[str, Any]:
    name = str(name or "").strip()
    if not name:
        raise QuestionBankError("題庫名稱不可為空。", errors=["題庫名稱不可為空。"])
    tier = str(tier or "core")
    if tier not in SUITE_TIERS:
        raise QuestionBankError("不支援的題庫等級。", errors=[f"未知 tier：{tier}"])
    ids = [int(value) for value in (item_ids or []) if int(value)]
    with session_factory() as session:
        if session.scalars(
            select(BenchmarkSuite).where(
                BenchmarkSuite.name == name,
                BenchmarkSuite.status != "deleted",
            )
        ).first():
            raise QuestionBankError("題庫名稱已存在。", errors=["題庫名稱已存在。"])
        if not ids:
            ids = [
                int(item.id)
                for item in session.scalars(
                    select(QuestionBankItem).where(
                        QuestionBankItem.status == "accepted",
                        QuestionBankItem.stale.is_(False),
                        QuestionBankItem.deleted_at.is_(None),
                    )
                ).all()
                if _item_benchmark_ready(item)
            ]
        items = list(
            session.scalars(
                select(QuestionBankItem).where(
                    QuestionBankItem.id.in_(ids),
                    QuestionBankItem.deleted_at.is_(None),
                )
            ).all()
        ) if ids else []
        not_ready = [
            item.question for item in items if not _item_benchmark_ready(item)
        ]
        if not_ready:
            raise QuestionBankError(
                "題庫只能加入已驗收且 benchmark-ready 的題目。",
                errors=not_ready,
            )
        suite = BenchmarkSuite(
            name=name,
            tier=tier,
            description=str(description or ""),
            status="draft",
            created_by=str(actor or "")[:120],
        )
        session.add(suite)
        session.flush()
        for item in items:
            session.add(
                BenchmarkSuiteItem(
                    suite_id=suite.id,
                    item_id=item.id,
                    item_version=item.version,
                )
            )
        session.commit()
        session.refresh(suite)
        return serialize_suite(suite, items=_suite_rows(session, suite.id))


def update_suite(
    session_factory: sessionmaker[Session],
    suite_id: int,
    *,
    name: Optional[str] = None,
    tier: Optional[str] = None,
    description: Optional[str] = None,
    item_ids: Optional[Sequence[int]] = None,
    freeze: Optional[bool] = None,
) -> Dict[str, Any]:
    with session_factory() as session:
        suite = session.get(BenchmarkSuite, int(suite_id))
        if suite is None:
            raise QuestionBankError("找不到 benchmark 題庫。", errors=["找不到 benchmark 題庫。"])
        if name is not None:
            suite.name = str(name).strip()
        if tier is not None:
            if tier not in SUITE_TIERS:
                raise QuestionBankError("不支援的題庫等級。", errors=[f"未知 tier：{tier}"])
            suite.tier = tier
        if description is not None:
            suite.description = str(description)
        if item_ids is not None:
            ids = [int(value) for value in item_ids if int(value)]
            items = list(
                session.scalars(
                    select(QuestionBankItem).where(
                        QuestionBankItem.id.in_(ids),
                        QuestionBankItem.deleted_at.is_(None),
                    )
                ).all()
            ) if ids else []
            not_ready = [
                item.question for item in items if not _item_benchmark_ready(item)
            ]
            if not_ready:
                raise QuestionBankError(
                    "題庫只能加入已驗收且 benchmark-ready 的題目。",
                    errors=not_ready,
                )
            for link in session.scalars(
                select(BenchmarkSuiteItem).where(
                    BenchmarkSuiteItem.suite_id == suite.id
                )
            ).all():
                session.delete(link)
            session.flush()
            for item in items:
                session.add(
                    BenchmarkSuiteItem(
                        suite_id=suite.id,
                        item_id=item.id,
                        item_version=item.version,
                    )
                )
        if freeze:
            suite.status = "frozen"
            suite.frozen_at = _now()
            suite.version = int(suite.version or 1) + 1
        suite.updated_at = _now()
        session.commit()
        session.refresh(suite)
        return serialize_suite(suite, items=_suite_rows(session, suite.id))


def delete_suite(
    session_factory: sessionmaker[Session],
    suite_id: int,
) -> bool:
    with session_factory() as session:
        suite = session.get(BenchmarkSuite, int(suite_id))
        if suite is None or suite.status == "deleted":
            return False
        # Keep the suite row because historical benchmark runs reference it.
        # The run already has its own frozen suite snapshot.
        suite.status = "deleted"
        suite.updated_at = _now()
        for link in session.scalars(
            select(BenchmarkSuiteItem).where(
                BenchmarkSuiteItem.suite_id == suite.id
            )
        ).all():
            session.delete(link)
        session.commit()
        return True


def benchmark_ready_items(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 200,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        items = session.scalars(
            select(QuestionBankItem)
            .where(
                QuestionBankItem.deleted_at.is_(None),
                QuestionBankItem.status == "accepted",
                QuestionBankItem.stale.is_(False),
            )
            .order_by(QuestionBankItem.updated_at.desc())
            .limit(max(1, min(500, int(limit or 200))))
        ).all()
        return [
            serialize_item(item)
            for item in items
            if _item_benchmark_ready(item)
        ]
