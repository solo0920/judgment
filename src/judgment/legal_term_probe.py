from __future__ import annotations

import re
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Sequence, Tuple

from sqlalchemy import func, or_, select

from .legal_terms import REGISTRY_TERMS
from .models import JudgmentDocument
from .query_parser import COURT_ALIASES, ParsedJudgmentQuery
from .text_normalization import normalize_for_match

# These are question/boilerplate words, not legal concepts.  The list is
# intentionally conservative: single characters that commonly appear inside
# legal terms (for example 不、非、未、給) are not removed globally.
GENERIC_PHRASES = tuple(
    sorted(
        {
            "有哪些",
            "有那些",
            "有什麼",
            "什麼樣",
            "列出",
            "列舉",
            "找出",
            "尋找",
            "搜尋",
            "清單",
            "所有",
            "全部",
            "幾筆",
            "多少",
            "判決",
            "案件",
            "案子",
            "案例",
            "裁判",
            "結果",
            "資料",
            "實務",
            "見解",
            "爭點",
            "法律意見",
            "規定",
            "法條",
            "條文",
            "法律",
            "責任",
            "刑責",
            "罰則",
            "要件",
            "適用",
            "構成",
            "定義",
            "範圍",
            "量刑",
            "理由",
            "態樣",
            "比較",
            "差異",
            "評價",
            "沒收",
            "舉證",
            "證據",
            "論罪",
            "科刑",
            "競合",
            "成立",
            "認定",
            "如何",
            "為什麼",
            "是否",
            "請問",
            "幫我",
            "查詢",
            "關於",
            "有關",
            "相關",
            "對於",
            "以及",
            "或是",
            "還是",
            "年間",
            "之間",
            "左右",
            "前後",
            "附近",
            "期間",
            "可以",
            "能不能",
            "有沒有",
            "法院",
            "地方法院",
            "地院",
            "分院",
            "臺灣",
            "福建",
            "與",
            "和",
            "及",
            "或",
        },
        key=lambda value: (-len(value), value),
    )
)

EDGE_STOPWORDS = (
    "的",
    "了",
    "嗎",
    "呢",
    "吧",
    "啊",
    "在",
    "與",
    "和",
    "及",
    "或",
    "對",
    "向",
    "從",
    "到",
    "為",
    "是",
    "有",
    "無",
    "這",
    "那",
    "其",
    "該",
    "本",
    "此",
    "何",
    "哪",
    "請",
    "幫",
    "找",
    "查",
    "想",
    "要",
    "能",
    "會",
    "將",
    "把",
    "被",
    "讓",
    "給",
    "就",
    "也",
    "都",
    "還",
    "再",
    "又",
    "更",
    "最",
    "很",
    "裡",
    "中",
    "上",
    "下",
    "內",
    "外",
    "間",
)

GENERIC_LAW_SUFFIXES = (
    "法",
    "條例",
    "辦法",
    "規則",
    "命令",
    "細則",
    "準則",
    "規程",
    "法規",
)

MAX_SCOPE_TERMS = 3


@dataclass(frozen=True)
class ScopeTerm:
    """A question phrase that can be probed against the court/year scope."""

    term: str
    scope: str
    term_id: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "term": self.term,
            "scope": self.scope,
            "term_id": self.term_id,
        }


@dataclass(frozen=True)
class ScopeTermCount:
    term: str
    scope: str
    term_id: str
    document_count: int
    occurrence_count: int
    matched_jids: Tuple[str, ...]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "term": self.term,
            "scope": self.scope,
            "term_id": self.term_id,
            "document_count": self.document_count,
            "occurrence_count": self.occurrence_count,
            "matched_jids": list(self.matched_jids[:20]),
        }


@dataclass(frozen=True)
class ScopeProbeResult:
    terms: Tuple[ScopeTermCount, ...]
    status: str = "ok"
    skipped_reason: str = ""
    scope_document_count: int = 0
    max_hit_documents: int = 0
    elapsed_ms: float = 0.0

    @property
    def skipped(self) -> bool:
        return self.status != "ok"

    @property
    def hit_terms(self) -> Tuple[ScopeTermCount, ...]:
        if self.skipped:
            return ()
        return tuple(term for term in self.terms if term.document_count > 0)

    @property
    def zero_terms(self) -> Tuple[ScopeTermCount, ...]:
        if self.skipped:
            return ()
        return tuple(term for term in self.terms if term.document_count == 0)

    @property
    def has_hits(self) -> bool:
        return bool(self.hit_terms)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "enabled": bool(self.terms),
            "status": self.status,
            "skipped_reason": self.skipped_reason,
            "scope_document_count": self.scope_document_count,
            "max_hit_documents": self.max_hit_documents,
            "elapsed_ms": self.elapsed_ms,
            "terms": [term.to_dict() for term in self.terms],
            "hit_terms": [term.to_dict() for term in self.hit_terms],
            "zero_terms": [term.to_dict() for term in self.zero_terms],
        }


def _registry_hits(
    text: str,
) -> Tuple[List[ScopeTerm], str]:
    """Remove all registry phrases and classify active vs candidate hits."""

    phrases = []
    for term in REGISTRY_TERMS:
        for phrase in term.phrases or (term.key,):
            if phrase:
                phrases.append((phrase, term))
    phrases.sort(key=lambda item: (-len(item[0]), item[0]))

    hits: List[ScopeTerm] = []
    seen = set()
    for phrase, term in phrases:
        if term.key in seen or phrase not in text:
            continue
        seen.add(term.key)
        hits.append(
            ScopeTerm(
                term=term.key,
                scope="must" if term.active else "registry_candidate",
                term_id=term.term_id,
            )
        )
        text = text.replace(phrase, "，")
    return hits, text


def _strip_courts(text: str, parsed_query: ParsedJudgmentQuery) -> str:
    for court in sorted(parsed_query.courts, key=len, reverse=True):
        text = text.replace(court, "，")
        short = court.replace("臺灣", "").replace("福建", "")
        for suffix in ("地方法院", "地院", "法院", "分院"):
            text = text.replace(f"{short}{suffix}", "，")
    for short in COURT_ALIASES:
        for suffix in ("地方法院", "地院", "法院"):
            text = text.replace(f"{short}{suffix}", "，")
    text = re.sub(
        r"(?:臺灣|福建)?(?:高等|最高|智慧財產|最高行政|臺北高等行政|"
        r"臺中高等行政|高雄高等行政)法院(?:臺中|臺南|高雄|花蓮|嘉義)?分院?",
        "，",
        text,
    )
    return text


def _strip_scope_noise(text: str) -> str:
    text = re.sub(r"第\s*\d+\s*條(?:之\s*\d+)?", "，", text)
    text = re.sub(r"第\s*\d+\s*項(?:之\s*\d+)?", "，", text)
    text = re.sub(r"第\s*\d+\s*款(?:之\s*\d+)?", "，", text)
    text = re.sub(r"(?:民國)?\d{2,4}\s*年?(?:度|間)?", "，", text)
    text = re.sub(r"\d{1,4}", "，", text)
    text = re.sub(r"[~～\-－—–−至到]+", "，", text)
    for phrase in GENERIC_PHRASES:
        text = text.replace(phrase, "，")
    return text


def _clean_chunk(chunk: str) -> str:
    value = chunk.strip("，。！？、；：,.!?;:（）()[]【】「」『』 ")
    changed = True
    while changed and len(value) >= 2:
        changed = False
        for stopword in EDGE_STOPWORDS:
            if value.startswith(stopword) and len(value) > len(stopword) + 1:
                value = value[len(stopword) :]
                changed = True
                break
            if value.endswith(stopword) and len(value) > len(stopword) + 1:
                value = value[: -len(stopword)]
                changed = True
                break
    return value


def _is_generic_law_name(value: str) -> bool:
    if len(value) < 2 or len(value) > 14:
        return False
    return any(
        value.endswith(suffix) for suffix in GENERIC_LAW_SUFFIXES
    ) and not any(value == term.key for term in REGISTRY_TERMS)


def extract_scope_terms(
    question: str,
    parsed_query: ParsedJudgmentQuery,
    *,
    limit: int = MAX_SCOPE_TERMS,
) -> List[ScopeTerm]:
    """Extract non-must phrases after removing registry terms and filters.

    The extractor is deliberately conservative.  It is used only inside a
    court+year scope, where a false positive costs one bounded full-text
    probe; it is not a general-purpose NLP parser.
    """

    text = normalize_for_match(question)
    registry_terms, text = _registry_hits(text)
    text = _strip_courts(text, parsed_query)
    text = _strip_scope_noise(text)

    registry_phrase_set = {
        phrase
        for term in REGISTRY_TERMS
        for phrase in (term.phrases or (term.key,))
        if phrase
    }
    generic = {
        "判決",
        "案件",
        "案子",
        "案例",
        "裁判",
        "結果",
        "資料",
        "實務",
        "見解",
        "規定",
        "法律",
        "法條",
        "責任",
        "刑責",
        "要件",
        "適用",
        "構成",
        "定義",
        "範圍",
        "理由",
    }

    extracted: List[ScopeTerm] = []
    seen = {term.term for term in registry_terms}
    for chunk in re.split(r"[，。！？、；：,.!?;:（）()\[\]【】「」『』\s]+", text):
        value = _clean_chunk(chunk)
        if not value or len(value) < 2 or len(value) > 20:
            continue
        if value in generic or value in registry_phrase_set:
            continue
        if _is_generic_law_name(value):
            continue
        if value in seen:
            continue
        seen.add(value)
        extracted.append(ScopeTerm(term=value, scope="external"))
        if len(extracted) >= max(0, limit):
            break

    return registry_terms + extracted


def _scope_filters(parsed_query: ParsedJudgmentQuery) -> List[Any]:
    filters: List[Any] = [JudgmentDocument.is_current.is_(True)]
    if parsed_query.courts:
        filters.append(
            JudgmentDocument.court_normalized.in_(
                list(parsed_query.courts)
            )
        )
    if parsed_query.year_from is not None:
        filters.append(
            JudgmentDocument.jdate.between(
                f"{parsed_query.year_from}0101",
                f"{parsed_query.year_to or parsed_query.year_from}1231",
            )
        )
    return filters


def probe_scope_terms(
    *,
    session_factory,
    parsed_query: ParsedJudgmentQuery,
    terms: Sequence[ScopeTerm],
    max_scope_documents: int = 50_000,
    max_hit_documents: int = 5_000,
    timeout_ms: int = 10_000,
) -> ScopeProbeResult:
    """Count exact phrases in a court/year scope with cost guards."""

    terms = tuple(
        term for term in terms if str(term.term).strip()
    )
    if not terms:
        return ScopeProbeResult(terms=())
    filters = _scope_filters(parsed_query)
    if len(filters) <= 1:
        return ScopeProbeResult(
            terms=(),
            status="no_scope",
            skipped_reason="法院與年份條件皆缺少",
        )

    started = time.perf_counter()
    with session_factory() as session:
        try:
            if session.bind is not None and session.bind.dialect.name == "postgresql":
                session.connection().exec_driver_sql(
                    f"SET LOCAL statement_timeout = {max(1, int(timeout_ms))}"
                )
            scope_count = int(
                session.scalar(
                    select(func.count(JudgmentDocument.id)).where(*filters)
                )
                or 0
            )
            if scope_count > max_scope_documents:
                return ScopeProbeResult(
                    terms=tuple(
                        ScopeTermCount(
                            term=term.term,
                            scope=term.scope,
                            term_id=term.term_id,
                            document_count=0,
                            occurrence_count=0,
                            matched_jids=(),
                        )
                        for term in terms
                    ),
                    status="scope_too_large",
                    skipped_reason=(
                        f"scope_count={scope_count} > "
                        f"max_scope_documents={max_scope_documents}"
                    ),
                    scope_document_count=scope_count,
                    max_hit_documents=max_hit_documents,
                    elapsed_ms=round(
                        (time.perf_counter() - started) * 1000.0, 2
                    ),
                )
            phrases = [term.term for term in terms]
            records = list(
                session.scalars(
                    select(JudgmentDocument).where(
                        *filters,
                        or_(
                            *[
                                JudgmentDocument.full_text.contains(phrase, autoescape=True)
                                for phrase in phrases
                            ]
                        ),
                    )
                ).all()
            )
        except Exception as exc:  # noqa: BLE001 - timeout/degraded fallback
            session.rollback()
            return ScopeProbeResult(
                terms=tuple(
                    ScopeTermCount(
                        term=term.term,
                        scope=term.scope,
                        term_id=term.term_id,
                        document_count=0,
                        occurrence_count=0,
                        matched_jids=(),
                    )
                    for term in terms
                ),
                status="timeout",
                skipped_reason=f"{exc.__class__.__name__}: {exc}",
                scope_document_count=0,
                max_hit_documents=max_hit_documents,
                elapsed_ms=round(
                    (time.perf_counter() - started) * 1000.0, 2
                ),
            )

    counts: Dict[str, List[Any]] = {
        term.term: [0, 0, []] for term in terms
    }
    for record in records:
        normalized = normalize_for_match(record.full_text or "")
        for term in terms:
            occurrences = normalized.count(term.term)
            if occurrences:
                bucket = counts[term.term]
                bucket[0] += 1
                bucket[1] += occurrences
                bucket[2].append(record.jid)

    result: List[ScopeTermCount] = []
    for term in terms:
        document_count, occurrence_count, jids = counts[term.term]
        result.append(
            ScopeTermCount(
                term=term.term,
                scope=term.scope,
                term_id=term.term_id,
                document_count=int(document_count),
                occurrence_count=int(occurrence_count),
                matched_jids=tuple(
                    sorted(
                        str(jid or "") for jid in jids if jid
                    )
                ),
            )
        )
    too_many = [
        term for term in result if term.document_count > max_hit_documents
    ]
    return ScopeProbeResult(
        terms=tuple(result),
        status="too_many_hits" if too_many else "ok",
        skipped_reason=(
            "terms_over_max_hit_documents="
            + ",".join(term.term for term in too_many)
            if too_many
            else ""
        ),
        scope_document_count=scope_count,
        max_hit_documents=max_hit_documents,
        elapsed_ms=round((time.perf_counter() - started) * 1000.0, 2),
    )
