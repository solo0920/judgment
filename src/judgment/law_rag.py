from __future__ import annotations

import copy
import logging
import math
import re
import threading
import time
from collections import Counter, OrderedDict
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Mapping, Optional, Sequence, Tuple

import pyarrow.parquet as pq
from sqlalchemy import or_, select, text
from sqlalchemy.exc import OperationalError

from .models import JudgmentDocument, LawDatasetVersion, LawDocument
from .observability import traced

logger = logging.getLogger(__name__)

LAW_ALIASES = {
    "證交法": "證券交易法",
    "證交": "證券交易法",
    "期交法": "期貨交易法",
    "投信投顧法": "證券投資信託及顧問法",
    "金保法": "金融消費者保護法",
    "金消法": "金融消費者保護法",
    "個資法": "個人資料保護法",
    "勞基法": "勞動基準法",
    "洗防法": "洗錢防制法",
    "都更條例": "都市更新條例",
    "公司法": "公司法",
}

_SOURCE_LABELS = {"law": "法規", "order": "命令"}

_ROC_DATE_RE = re.compile(
    r"中華民國\s*([零〇一二三四五六七八九十百千兩]+)\s*年"
    r"\s*([零〇一二三四五六七八九十百千兩]+)\s*月"
    r"\s*([零〇一二三四五六七八九十百千兩]+)\s*日"
)

_CN_DIGITS = {
    "零": 0,
    "〇": 0,
    "一": 1,
    "二": 2,
    "兩": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
}
_CN_UNITS = {"十": 10, "百": 100, "千": 1000}

_STATS_STOP_WORDS = (
    "最常",
    "常見",
    "經常",
    "常",
    "最多",
    "大多",
    "主要",
    "通常",
    "排行",
    "統計",
    "前幾名",
    "前幾",
    "觸犯",
    "違反",
    "引用",
    "被",
    "什麼",
    "哪些",
    "哪一些",
    "法條",
    "法規",
    "命令",
    "條文",
    "規定",
    "或",
    "和",
    "及",
    "與",
    "有關",
    "相關",
    "實務",
    "案例",
    "判決",
    "次數",
    "請",
    "問題",
    "是",
    "的",
    "有",
    "嗎",
    "呢",
    "？",
    "?",
    "，",
    ",",
    "。",
    "、",
    " ",
    "\n",
)


def _chinese_number(text: str) -> Optional[int]:
    total = 0
    current = 0
    for char in text:
        if char in _CN_DIGITS:
            current = _CN_DIGITS[char]
        elif char in _CN_UNITS:
            unit = _CN_UNITS[char]
            total += (current or 1) * unit
            current = 0
        else:
            continue
    value = total + current
    return value or None


def parse_first_promulgation(histories: str) -> Optional[Dict[str, str]]:
    text = str(histories or "")
    head = "\n".join(text.splitlines()[:8])
    match = None
    for candidate in _ROC_DATE_RE.finditer(head):
        window = head[candidate.end() : candidate.end() + 60]
        if re.search(r"制定|訂定", window):
            match = candidate
            break
    if not match:
        return None
    year_text, month_text, day_text = match.groups()
    year = _chinese_number(year_text)
    month = _chinese_number(month_text)
    day = _chinese_number(day_text)
    if not year or not month or not day:
        return None
    return {
        "roc_date": match.group(0).replace(" ", ""),
        "roc_year": str(year),
        "roc_month": str(month),
        "roc_day": str(day),
        "gregorian_date": f"{year + 1911:04d}-{month:02d}-{day:02d}",
    }


def _normalize(text: str) -> str:
    return re.sub(r"\s+", "", str(text or ""))


def _short_law_name(name: str) -> str:
    normalized = _normalize(name)
    prefix = "中華民國"
    if normalized.startswith(prefix) and len(normalized) > len(prefix):
        return normalized[len(prefix) :]
    return normalized


def _law_name_matches_text(name: str, text: str) -> bool:
    normalized = _normalize(name)
    if normalized and normalized in text:
        return True
    short = _short_law_name(normalized)
    return bool(
        short
        and short != normalized
        and (text == short or text.startswith(short))
    )


def _latest_parquet_files(data_dir: Path) -> Dict[str, Path]:
    base = Path(data_dir).expanduser().resolve() / "raw_parquet"
    latest: Dict[str, Tuple[str, float, Path]] = {}
    for path in base.glob("*/*/*/laws.parquet"):
        try:
            relative = path.relative_to(base)
            source = relative.parts[0]
            partition = relative.parts[1]
            mtime = path.stat().st_mtime
        except (ValueError, OSError):
            continue
        current = latest.get(source)
        candidate = (partition, mtime, path)
        if current is None or candidate[:2] > current[:2]:
            latest[source] = candidate
    return {source: item[2] for source, item in latest.items()}


@traced(
    "rag.law_lookup",
    module=__name__,
    params_fn=lambda session_factory, question, **_: {
        "question_length": len(question or "")
    },
)
def find_law_records(
    session_factory,
    question: str,
    *,
    limit: int = 4,
) -> List[LawDocument]:
    text = _normalize(question)
    if not text:
        return []
    alias_targets = {
        target for alias, target in LAW_ALIASES.items() if _normalize(alias) in text
    }
    with session_factory() as session:
        rows = session.execute(
            select(
                LawDocument.id,
                LawDocument.law_name,
                LawDocument.law_key,
                LawDocument.source_type,
            ).where(LawDocument.is_current.is_(True))
        ).all()

    exact: List[Tuple[int, str, int]] = []
    for row in rows:
        name = _normalize(row.law_name)
        if not name:
            continue
        if _law_name_matches_text(name, text) or name in alias_targets:
            exact.append((0 if row.source_type == "law" else 1, name, int(row.id)))
    selected: List[int] = []
    if exact:
        names = {item[1] for item in exact}
        exact = [
            item
            for item in exact
            if not any(
                item[1] != other and item[1] in other for other in names
            )
        ]
        exact.sort(key=lambda item: (-len(item[1]), item[0], item[1]))
        selected = [item[2] for item in exact[:limit]]
    else:
        prefix_hits: List[Tuple[int, int, str, int]] = []
        for row in rows:
            name = _normalize(row.law_name)
            if len(name) < 4:
                continue
            for length in range(len(name), 3, -1):
                if name[:length] in text:
                    prefix_hits.append(
                        (
                            0 if row.source_type == "law" else 1,
                            length,
                            name,
                            int(row.id),
                        )
                    )
                    break
        if prefix_hits:
            best_length = max(item[1] for item in prefix_hits)
            prefix_hits = [item for item in prefix_hits if item[1] == best_length]
            prefix_hits.sort(key=lambda item: (item[0], item[2]))
            selected = [item[3] for item in prefix_hits[:limit]]

    if not selected:
        concept_names: List[str] = []
        for concept in _matched_legal_concepts(question):
            for name in _LEGAL_CONCEPT_LAWS.get(concept, ()):
                if name not in concept_names:
                    concept_names.append(name)
        if concept_names:
            with session_factory() as session:
                concept_records = session.scalars(
                    select(LawDocument).where(
                        LawDocument.is_current.is_(True),
                        LawDocument.law_name.in_(concept_names),
                    )
                ).all()
            by_name = {record.law_name: record for record in concept_records}
            selected = [
                int(by_name[name].id)
                for name in concept_names
                if name in by_name
            ]

    if not selected:
        return []
    with session_factory() as session:
        records = session.scalars(
            select(LawDocument).where(LawDocument.id.in_(selected))
        ).all()
    by_id = {record.id: record for record in records}
    return [by_id[item] for item in selected if item in by_id]


_CHAPTER_HEADING_RE = re.compile(
    r"^第\s*[零〇一二三四五六七八九十百千兩\d之-]+\s*章"
)


def _law_chapter_outline(
    articles: Sequence[Mapping[str, Any]],
) -> List[Dict[str, Any]]:
    """Return chapter headings and their substantive-article ranges."""

    chapters: List[Dict[str, Any]] = []
    current: Optional[Dict[str, Any]] = None
    for article in articles:
        content = str(article.get("article_content") or "").strip()
        article_no = str(article.get("article_no") or "").strip()
        article_type = str(article.get("article_type") or "").strip().upper()
        is_heading = article_type in {"C", "H"} or bool(
            _CHAPTER_HEADING_RE.match(content)
        )
        if is_heading and _CHAPTER_HEADING_RE.match(content):
            current = {
                "title": content,
                "first_article": "",
                "last_article": "",
                "article_count": 0,
            }
            chapters.append(current)
            continue
        if current is None or not article_no:
            continue
        current["first_article"] = (
            current["first_article"] or article_no
        )
        current["last_article"] = article_no
        current["article_count"] = int(current["article_count"]) + 1
    return chapters


def _law_key_articles(
    articles: Sequence[Mapping[str, Any]],
    *,
    limit: int = 6,
) -> List[Dict[str, str]]:
    """Small set of substantive articles useful for a law overview."""

    result: List[Dict[str, str]] = []
    for article in articles:
        article_no = str(article.get("article_no") or "").strip()
        content = str(article.get("article_content") or "").strip()
        article_type = str(article.get("article_type") or "").strip().upper()
        if not article_no or not content or article_type in {"C", "H"}:
            continue
        result.append(
            {
                "article_no": article_no,
                "article_content": re.sub(r"\s+", " ", content)[:220],
            }
        )
        if len(result) >= limit:
            break
    return result


def _law_parquet_columns() -> List[str]:
    return [
        "law_key",
        "law_name",
        "law_level",
        "law_category",
        "law_url",
        "law_modified_date",
        "law_effective_date",
        "law_effective_note",
        "law_abandon_note",
        "law_histories",
        "law_foreword",
        "article_count",
        "law_articles",
    ]


@traced(
    "rag.law_content",
    module=__name__,
    params_fn=lambda law_data_dir, records, **_: {
        "law_count": len(records or []),
    },
)
def load_law_contents(
    law_data_dir: Path,
    records: Sequence[LawDocument],
) -> Dict[Tuple[str, str], Dict[str, Any]]:
    if not records:
        return {}
    files = _latest_parquet_files(Path(law_data_dir))
    grouped: Dict[str, List[str]] = {}
    for record in records:
        grouped.setdefault(str(record.source_type or ""), []).append(record.law_name)
    contents: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for source_type, names in grouped.items():
        path = files.get(source_type)
        if path is None:
            continue
        try:
            table = pq.read_table(
                path,
                columns=_law_parquet_columns(),
                filters=[("law_name", "in", sorted(set(names)))],
            )
        except Exception:
            continue
        for row in table.to_pylist():
            key = (str(row.get("source_type") or source_type), str(row.get("law_key") or ""))
            contents[(source_type, str(row.get("law_name") or ""))] = row
            if key[1]:
                contents[key] = row
    return contents


def _question_terms(question: str) -> List[str]:
    terms: List[str] = []
    seen = set()
    for chunk in re.findall(r"[\u4e00-\u9fffA-Za-z0-9]{2,}", question):
        if re.search(r"[\u4e00-\u9fff]", chunk):
            pieces = [chunk[index : index + 2] for index in range(len(chunk) - 1)]
        else:
            pieces = [chunk.lower()]
        for piece in pieces:
            if piece not in seen:
                seen.add(piece)
                terms.append(piece)
    return [term for term in terms if term not in {"如何", "什麼", "哪些", "規定", "問題"}]


# Query expansion for common legal concepts.  Article text rarely repeats the
# popular name of a legal issue (for example, insider-trading provisions do not
# contain the phrase「內線交易」), so article ranking needs the vocabulary used
# by the statute itself.
_LEGAL_CONCEPT_EXPANSIONS: Dict[str, Tuple[Tuple[str, float], ...]] = {
    "內線交易": (
        ("內線交易", 4.0),
        ("內線", 3.0),
        ("內部人", 2.0),
        ("實際知悉", 3.0),
        ("重大影響其股票價格", 4.0),
        ("未公開", 2.0),
        ("第一百五十七條之一", 4.0),
        ("第一百七十一條", 3.0),
        ("消息", 0.5),
    ),
    "短線交易": (
        ("短線交易", 4.0),
        ("六個月內", 2.0),
        ("買進", 1.5),
        ("賣出", 1.5),
        ("第一百五十七條", 3.0),
    ),
    "操縱市場": (
        ("操縱市場", 4.0),
        ("操縱", 3.0),
        ("抬高", 2.0),
        ("壓低", 2.0),
        ("連續以高價買入", 3.0),
        ("連續以低價賣出", 3.0),
        ("第一百五十五條", 3.0),
        ("第一百七十一條", 2.0),
    ),
    "公開收購": (
        ("公開收購", 3.0),
        ("收購", 1.5),
        ("有價證券", 1.0),
    ),
    "洗錢": (
        ("洗錢", 3.0),
        ("掩飾", 2.0),
        ("隱匿", 2.0),
        ("犯罪所得", 2.0),
    ),
    "非常規交易": (
        ("非常規交易", 3.0),
        ("不合營業常規", 3.0),
        ("不利益之交易", 3.0),
        ("重大損害", 2.0),
    ),
    "銀行法": (
        ("從業人員", 3.0),
        ("銀行負責人或職員", 5.0),
        ("銀行負責人及職員", 5.0),
        ("銀行負責人", 4.0),
        ("銀行職員", 4.0),
        ("負責人", 2.5),
        ("職員", 2.5),
        ("受僱人", 2.0),
        ("董事", 1.5),
        ("監察人", 1.5),
        ("經理人", 1.5),
        ("兼職", 2.5),
        ("佣金", 2.0),
        ("酬金", 2.0),
        ("不當利益", 2.0),
        ("資格條件", 2.0),
        ("利益衝突", 2.0),
        ("違背職務", 3.0),
        ("辦理授信", 2.5),
        ("利害關係人", 2.0),
        ("第十八條", 3.0),
        ("第三十五條", 4.0),
        ("第三十五條之一", 4.0),
        ("第三十五條之二", 4.0),
        ("第一百二十五條之二", 5.0),
        ("第一百二十七條之二", 3.0),
        ("銀行", 1.0),
    ),
}

_LEGAL_CONCEPT_ALIASES: Dict[str, str] = {
    "內線": "內線交易",
    "股市內線": "內線交易",
    "短線": "短線交易",
    "炒股": "操縱市場",
    "操縱股價": "操縱市場",
    "洗錢防制": "洗錢",
    "非常規": "非常規交易",
}

_LEGAL_CONCEPT_LAWS: Dict[str, Tuple[str, ...]] = {
    "內線交易": ("證券交易法",),
    "短線交易": ("證券交易法",),
    "操縱市場": ("證券交易法",),
    "公開收購": ("證券交易法",),
    "洗錢": ("洗錢防制法",),
    "非常規交易": ("證券交易法", "公司法"),
}

_ARTICLE_NUM = "零〇一二三四五六七八九十百千兩"
_ARTICLE_REF_RE = re.compile(
    rf"第\s*(\d{{1,4}}|[{_ARTICLE_NUM}]{{1,8}})\s*"
    rf"(?:條\s*之\s*(\d{{1,3}}|[{_ARTICLE_NUM}]{{1,4}})"
    rf"|[-－]\s*(\d{{1,3}})\s*條"
    rf"|條)"
)
_CJK_SEQUENCE_RE = re.compile(r"[\u4e00-\u9fff]+")
_ASCII_TOKEN_RE = re.compile(r"[A-Za-z0-9]+(?:[-_.][A-Za-z0-9]+)*")


def _article_number_value(value: Any) -> int:
    text = str(value or "").strip()
    if text.isdigit():
        return int(text)
    return _chinese_number(text) or 0


def _article_ref_key(value: Any) -> str:
    match = _ARTICLE_REF_RE.search(_normalize(value))
    if not match:
        return ""
    base = _article_number_value(match.group(1))
    suffix_text = match.group(2) or match.group(3)
    suffix = _article_number_value(suffix_text) if suffix_text else 0
    if not base:
        return ""
    return f"{base}-{suffix}" if suffix else str(base)


def _extract_article_refs(question: str) -> set[str]:
    refs: set[str] = set()
    for match in _ARTICLE_REF_RE.finditer(_normalize(question)):
        base = _article_number_value(match.group(1))
        suffix_text = match.group(2) or match.group(3)
        suffix = _article_number_value(suffix_text) if suffix_text else 0
        if base:
            refs.add(f"{base}-{suffix}" if suffix else str(base))
    return refs


def _matched_legal_concepts(question: str) -> List[str]:
    text = _normalize(question)
    concepts: List[str] = []
    for concept in _LEGAL_CONCEPT_EXPANSIONS:
        if _normalize(concept) in text:
            concepts.append(concept)
    for alias, concept in _LEGAL_CONCEPT_ALIASES.items():
        if _normalize(alias) in text and concept not in concepts:
            concepts.append(concept)
    return concepts


def _expanded_legal_terms(question: str) -> List[Tuple[str, float]]:
    concepts = _matched_legal_concepts(question)
    terms: List[Tuple[str, float]] = []
    seen = set()
    for concept in concepts:
        for term, weight in _LEGAL_CONCEPT_EXPANSIONS.get(concept, ()):
            normalized = _normalize(term)
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            terms.append((term, weight))
    return terms


def _bm25_tokens(text: str) -> List[str]:
    normalized = _normalize(text)
    tokens: List[str] = []
    for chunk in _CJK_SEQUENCE_RE.findall(normalized):
        if len(chunk) == 1:
            tokens.append(chunk)
        else:
            tokens.extend(chunk[index : index + 2] for index in range(len(chunk) - 1))
    tokens.extend(match.group(0).casefold() for match in _ASCII_TOKEN_RE.finditer(text))
    return tokens


def _bm25_scores(
    documents: Sequence[Sequence[str]],
    query_tokens: Sequence[str],
    *,
    k1: float = 1.5,
    b: float = 0.75,
) -> List[float]:
    if not documents:
        return []
    query = [token for token in query_tokens if token]
    if not query:
        return [0.0 for _ in documents]
    term_frequencies = [Counter(document) for document in documents]
    document_frequencies: Counter[str] = Counter()
    for frequencies in term_frequencies:
        document_frequencies.update(frequencies.keys())
    total = len(documents)
    average_length = sum(len(document) for document in documents) / total or 1.0
    idf = {
        term: math.log(1.0 + (total - frequency + 0.5) / (frequency + 0.5))
        for term, frequency in document_frequencies.items()
    }
    scores: List[float] = []
    for frequencies, document in zip(term_frequencies, documents):
        length = len(document)
        score = 0.0
        for term in query:
            frequency = frequencies.get(term, 0)
            if not frequency:
                continue
            denominator = frequency + k1 * (
                1.0 - b + b * length / average_length
            )
            score += (
                idf.get(term, 0.0) * frequency * (k1 + 1.0) / denominator
            )
        scores.append(score)
    return scores


def _article_scores(
    articles: Sequence[Dict[str, Any]],
    question: str,
) -> List[float]:
    normalized_texts = [
        _normalize(article.get("article_content") or "") for article in articles
    ]
    expanded_terms = _expanded_legal_terms(question)
    explicit_refs = _extract_article_refs(question)
    expanded_refs = {
        _article_ref_key(term)
        for term, _ in expanded_terms
        if _article_ref_key(term)
    }
    query_terms = list(_question_terms(question))
    query_terms.extend(term for term, _ in expanded_terms)
    bm25 = _bm25_scores(
        [_bm25_tokens(text) for text in normalized_texts],
        _bm25_tokens(" ".join(query_terms)),
    )
    scores: List[float] = []
    for index, article in enumerate(articles):
        text = normalized_texts[index]
        score = bm25[index] if index < len(bm25) else 0.0
        matched_terms = 0
        for term, weight in expanded_terms:
            normalized_term = _normalize(term)
            count = text.count(normalized_term) if normalized_term else 0
            if count:
                score += weight * min(count, 3)
                matched_terms += 1
        if matched_terms:
            # Reward articles that cover several facets of the same concept.
            score += 0.4 * matched_terms
        if _article_ref_key(article.get("article_no")) in explicit_refs:
            score += 1000.0
        elif _article_ref_key(article.get("article_no")) in expanded_refs:
            # Concept-level article index, e.g. 內線交易 -> 第 157-1、171 條.
            score += 500.0
        scores.append(score)
    return scores


def _article_key(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or ""))


def _dense_article_scores(
    scores: Optional[Mapping[str, float]],
) -> Dict[str, float]:
    normalized: Dict[str, float] = {}
    for article_no, score in (scores or {}).items():
        try:
            value = float(score)
        except (TypeError, ValueError):
            continue
        if value <= 0:
            continue
        key = _article_key(article_no)
        if key:
            normalized[key] = max(normalized.get(key, 0.0), value)
        ref = _article_ref_key(article_no)
        if ref:
            normalized[ref] = max(normalized.get(ref, 0.0), value)
    return normalized


def _rrf_fuse(
    candidates: Sequence[Dict[str, Any]],
    *,
    dense_weight: float = 0.2,
    rrf_k: int = 60,
) -> None:
    """Assign Reciprocal Rank Fusion scores to article candidates in place.

    BM25/concept scores and Qdrant dense scores live on different scales, so
    fusing their raw values lets one signal dominate by accident.  RRF uses
    each candidate's rank instead: an article that is consistently near the
    top of both lists wins over one that is only strong in a single list.
    Candidates with no positive signal are left at zero and filtered later.
    """

    k = max(1, int(rrf_k))
    weight = max(0.0, float(dense_weight))
    bm25_ranked = sorted(
        (
            item
            for item in candidates
            if float(item.get("bm25_score") or 0) > 0
        ),
        key=lambda item: (
            -float(item.get("bm25_score") or 0),
            len(str(item.get("article_content") or "")),
            str(item.get("article_no") or ""),
        ),
    )
    dense_ranked = sorted(
        (
            item
            for item in candidates
            if float(item.get("dense_score") or 0) > 0
        ),
        key=lambda item: (
            -float(item.get("dense_score") or 0),
            len(str(item.get("article_content") or "")),
            str(item.get("article_no") or ""),
        ),
    )
    bm25_ranks = {
        id(item): rank for rank, item in enumerate(bm25_ranked, start=1)
    }
    dense_ranks = {
        id(item): rank for rank, item in enumerate(dense_ranked, start=1)
    }
    for item in candidates:
        score = 0.0
        bm25_rank = bm25_ranks.get(id(item))
        if bm25_rank:
            score += 1.0 / (k + bm25_rank)
        dense_rank = dense_ranks.get(id(item))
        if dense_rank:
            score += weight / (k + dense_rank)
        item["score"] = score


def select_law_articles(
    articles: Sequence[Dict[str, Any]],
    question: str,
    *,
    priority: Optional[Sequence[str]] = None,
    limit: int = 4,
    budget: int = 3000,
    dense_scores: Optional[Mapping[str, float]] = None,
    dense_weight: float = 0.2,
    rrf_k: int = 60,
) -> List[Dict[str, str]]:
    usable = [
        article
        for article in (articles or [])
        if str(article.get("article_content") or "").strip()
        and str(article.get("article_no") or "").strip()
    ]
    if not usable:
        return []
    relevance = _article_scores(usable, question)
    dense = _dense_article_scores(dense_scores)
    priority_order = {
        _article_key(article_no): index
        for index, article_no in enumerate(priority or [])
    }
    explicit_refs = _extract_article_refs(question)
    candidates: List[Dict[str, Any]] = []
    for index, article in enumerate(usable):
        article_no = str(article.get("article_no") or "").strip()
        article_key = _article_key(article_no)
        ref = _article_ref_key(article_no)
        dense_score = max(
            dense.get(article_key, 0.0),
            dense.get(ref, 0.0) if ref else 0.0,
        )
        in_priority = article_key in priority_order
        candidates.append(
            {
                "article_no": article_no,
                "article_content": str(article.get("article_content") or "").strip(),
                "is_priority": in_priority,
                "priority_rank": priority_order.get(article_key, len(priority_order) + 1),
                "bm25_score": relevance[index] if index < len(relevance) else 0.0,
                "dense_score": dense_score,
                "score": 0.0,
                "relevance": 0.0,
            }
        )
    if explicit_refs:
        explicit_candidates = [
            item
            for item in candidates
            if _article_ref_key(item["article_no"]) in explicit_refs
        ]
        if explicit_candidates:
            candidates = explicit_candidates
    _rrf_fuse(
        candidates,
        dense_weight=dense_weight,
        rrf_k=rrf_k,
    )
    # RRF ranks candidates, but its scores are tightly clustered, so they are
    # not a reliable relevance floor on their own.  Keep the normalized
    # BM25/dense blend as a separate floor to avoid padding an answer with
    # dozens of weakly related sections from a 200+ article statute.
    best_bm25 = max(
        (item["bm25_score"] for item in candidates), default=0.0
    )
    best_dense = max(
        (item["dense_score"] for item in candidates), default=0.0
    )
    dense_weight = max(0.0, float(dense_weight))
    for item in candidates:
        bm25_part = (
            item["bm25_score"] / best_bm25 if best_bm25 > 0 else 0.0
        )
        dense_part = (
            item["dense_score"] / best_dense if best_dense > 0 else 0.0
        )
        item["relevance"] = bm25_part + dense_weight * dense_part
    best_relevance = max(
        (item["relevance"] for item in candidates), default=0.0
    )
    threshold = best_relevance * 0.2
    candidates.sort(
        key=lambda item: (
            0 if item["is_priority"] else 1,
            item["priority_rank"],
            -item["score"],
            -item["bm25_score"],
            -item["dense_score"],
            len(item["article_content"]),
            item["article_no"],
        )
    )
    selected: List[Dict[str, str]] = []
    total = 0
    for item in candidates:
        if len(selected) >= limit:
            break
        # Priority articles come from explicit judgment-citation statistics and
        # are always kept.  Otherwise avoid padding the answer with unrelated
        # articles just because a law has 200+ sections.
        if not item["is_priority"] and (
            item["relevance"] <= 0 or item["relevance"] < threshold
        ):
            continue
        content = item["article_content"]
        if total + len(content) > budget and selected:
            continue
        selected.append(
            {
                "article_no": item["article_no"],
                "article_content": content,
            }
        )
        total += len(content)
    return selected


def build_insurance_responsibility_framework(
    *,
    question: str,
    session_factory,
    law_data_dir: Path,
    law_sources: Sequence[Dict[str, Any]],
) -> Optional[Dict[str, Any]]:
    """Build a curated responsibility table for insurance sales questions.

    The table is only emitted when the question is about insurance sales
    conduct and the required articles exist in the current law Parquet. It
    does not infer legal conclusions beyond the listed provisions.
    """

    if not is_insurance_responsibility_question(question):
        return None
    records = _records_by_names(session_factory, _INSURANCE_RESPONSIBILITY_SOURCES)
    contents = load_law_contents(law_data_dir, records)
    by_name = {record.law_name: record for record in records}
    source_index = {
        str(source.get("law_name") or ""): source.get("index")
        for source in law_sources
    }
    rows: List[Dict[str, Any]] = []
    for law_name, article_no, focus in _INSURANCE_RESPONSIBILITY_RULES:
        record = by_name.get(law_name)
        if record is None:
            continue
        content = contents.get((record.source_type, record.law_name)) or {}
        target = _article_key(article_no)
        article = next(
            (
                item
                for item in (content.get("law_articles") or [])
                if _article_key(item.get("article_no")) == target
            ),
            None,
        )
        if article is None:
            continue
        rows.append(
            {
                "law_name": law_name,
                "article_no": article.get("article_no") or article_no,
                "focus": focus,
                "index": source_index.get(law_name),
            }
        )
    if not rows:
        return None
    sources = [
        {
            "law_name": name,
            "index": source_index.get(name),
        }
        for name in _INSURANCE_RESPONSIBILITY_SOURCES
        if name in by_name
    ]
    return {
        "title": "相關法規的責任架構",
        "rows": rows,
        "sources": sources,
    }


def _source_label(source_type: str) -> str:
    return _SOURCE_LABELS.get(str(source_type or ""), "法規")


def _format_date(value: Any) -> str:
    text = str(value or "").strip()
    if re.fullmatch(r"\d{8}", text):
        return f"{text[:4]}-{text[4:6]}-{text[6:]}"
    return text


def _date_ymd(value: Any) -> str:
    text = str(value or "").strip()
    match = re.search(r"(\d{4})[/-](\d{1,2})[/-](\d{1,2})", text)
    if match:
        return f"{match.group(1)}-{int(match.group(2)):02d}-{int(match.group(3)):02d}"
    if re.fullmatch(r"\d{8}", text):
        return f"{text[:4]}-{text[4:6]}-{text[6:]}"
    return text


def _article_sort_key(article_no: Any) -> Tuple[int, int]:
    key = _article_ref_key(article_no)
    if not key:
        return (0, 0)
    parts = key.split("-")
    base = int(parts[0]) if parts[0].isdigit() else 0
    suffix = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
    return (base, suffix)


def _law_article_metadata(
    articles: Sequence[Mapping[str, Any]],
) -> Dict[str, Any]:
    """Derive article-slot / effective-article / boundary metadata."""

    rows = [
        item
        for item in articles or []
        if str(item.get("article_type") or "").strip().upper() == "A"
        and str(item.get("article_no") or "").strip()
    ]
    live: List[Mapping[str, Any]] = []
    deleted = 0
    for item in rows:
        content = str(item.get("article_content") or "").strip()
        if content.startswith("（刪除）"):
            deleted += 1
        else:
            live.append(item)
    ordered_all = sorted(
        rows,
        key=lambda item: _article_sort_key(item.get("article_no")),
    )
    ordered = [item for item in ordered_all if item in live]
    first_slot = ordered_all[0] if ordered_all else None
    last_slot = ordered_all[-1] if ordered_all else None
    first = ordered[0] if ordered else (first_slot)
    last = ordered[-1] if ordered else (last_slot)
    zhi_rows = [
        item
        for item in rows
        if "-" in str(item.get("article_no") or "")
        or "之" in str(item.get("article_no") or "")
    ]
    bases = [_article_sort_key(item.get("article_no"))[0] for item in rows]
    return {
        "article_total": len(rows),
        "article_deleted": deleted,
        "article_live": len(live),
        "zhi_count": len(zhi_rows),
        "zhi_example": str(
            zhi_rows[0].get("article_no") if zhi_rows else ""
        ).strip(),
        "max_base": max(bases) if bases else 0,
        "first_article": dict(first) if first else None,
        "last_article": dict(last) if last else None,
        "first_slot": dict(first_slot) if first_slot else None,
        "last_slot": dict(last_slot) if last_slot else None,
        "first_slot_deleted": bool(
            first_slot
            and str(first_slot.get("article_content") or "")
            .strip()
            .startswith("（刪除）")
        ),
        "last_slot_deleted": bool(
            last_slot
            and str(last_slot.get("article_content") or "")
            .strip()
            .startswith("（刪除）")
        ),
    }


_BOUNDARY_FIRST_RE = re.compile(
    r"(第一條|第\s*1\s*條|首條|最先一條|最早一條|第一個條文)"
)
_BOUNDARY_LAST_RE = re.compile(
    r"(最後一條|末條|最後一個條文|最後的條文|最終條|最後一條條文)"
)


def law_article_boundary_question(question: str) -> str:
    """Map common phrasings to a first/last article query code."""

    text = _normalize(question)
    if _BOUNDARY_LAST_RE.search(text):
        return "last"
    if _BOUNDARY_FIRST_RE.search(text):
        return "first"
    return ""


_UNSUPPORTED_STATS_RE = re.compile(
    r"(有幾|多少|共有|總共|第幾|最早|最近|哪一年|何年|哪天|修正日期|最近一次|幾章|幾款|幾項)"
)


def is_unsupported_statistics_question(question: str) -> bool:
    """Detect quantity/order questions with no matching structured rule."""

    if (
        is_article_count_question(question)
        or law_article_boundary_question(question)
        or is_history_question(question)
    ):
        return False
    return bool(_UNSUPPORTED_STATS_RE.search(_normalize(question)))


def law_boundary_answer(
    question: str,
    source: Mapping[str, Any],
    which: str,
) -> Optional[str]:
    article_key = "last_article" if which == "last" else "first_article"
    article = source.get(article_key) or {}
    article_no = str(article.get("article_no") or "").strip()
    content = re.sub(
        r"\s+", " ", str(article.get("article_content") or "")
    ).strip()
    if not article_no or not content:
        return None
    slot_key = "last_slot" if which == "last" else "first_slot"
    slot_deleted = bool(source.get(f"{which}_slot_deleted"))
    slot = source.get(slot_key) or {}
    slot_no = str(slot.get("article_no") or "").strip()
    slot_content = re.sub(
        r"\s+", " ", str(slot.get("article_content") or "")
    ).strip()
    if which == "last":
        label = "最後一條有效條文" if slot_deleted else "最後一條"
        slot_label = "最後一個條號"
    else:
        label = "第一條有效條文" if slot_deleted else "第一條"
        slot_label = "第一個條號"
    index = int(source.get("index") or 1)
    date = _date_ymd(source.get("dataset_update_date"))
    provenance = f"依本系統資料版本（{date}）" if date else "依本系統資料版本"
    deleted_note = ""
    if slot_deleted and slot_no and slot_no != article_no:
        deleted_note = f"（{slot_label}{slot_no}已刪除：{slot_content}）"
    return (
        f"{source.get('law_name') or '該法規'}的{label}是{article_no}"
        f"{deleted_note}：{content} [{index}]。"
        f"{provenance}，條文內容以全國法規資料庫公告為準；這不是法律意見。"
    )


def _dataset_update_date(session_factory: Any, source_type: str) -> str:
    """Return the current law dataset version date for answer provenance."""

    try:
        with session_factory() as session:
            version = session.scalars(
                select(LawDatasetVersion)
                .where(
                    LawDatasetVersion.source_type == source_type,
                    LawDatasetVersion.is_current.is_(True),
                )
                .order_by(LawDatasetVersion.id.desc())
                .limit(1)
            ).first()
        if version is None:
            return ""
        return str(
            getattr(version, "update_date", "")
            or getattr(version, "downloaded_at", "")
            or ""
        )
    except Exception:
        return ""


def build_law_source(
    record: LawDocument,
    content: Optional[Dict[str, Any]],
    question: str,
    *,
    stats: Optional[Dict[str, Any]] = None,
    priority_articles: Optional[Sequence[str]] = None,
    article_limit: int = 4,
    article_budget: int = 3000,
    dense_scores: Optional[Mapping[str, float]] = None,
    dense_weight: float = 0.2,
    rrf_k: int = 60,
    dataset_update_date: str = "",
) -> Dict[str, Any]:
    content = content or {}
    histories = str(
        content.get("law_histories") or record.law_histories or ""
    ).strip()
    articles = content.get("law_articles") or []
    article_count = int(content.get("article_count") or record.article_count or 0)
    selected_articles = select_law_articles(
        articles,
        question,
        priority=priority_articles,
        limit=article_limit,
        budget=article_budget,
        dense_scores=dense_scores,
        dense_weight=dense_weight,
        rrf_k=rrf_k,
    )
    promulgation = parse_first_promulgation(histories)
    article_meta = _law_article_metadata(content.get("law_articles") or [])
    return {
        "kind": "law",
        "index": 0,
        "law_name": record.law_name,
        "law_key": record.law_key,
        "source_type": record.source_type,
        "source_label": _source_label(record.source_type),
        "law_level": content.get("law_level") or record.law_level,
        "law_category": content.get("law_category") or record.law_category,
        "law_url": content.get("law_url") or record.law_url,
        "article_count": article_count,
        "article_total": article_meta["article_total"] or article_count,
        "article_deleted": article_meta["article_deleted"],
        "article_live": article_meta["article_live"] or article_count,
        "first_article": article_meta["first_article"],
        "last_article": article_meta["last_article"],
        "first_slot": article_meta["first_slot"],
        "last_slot": article_meta["last_slot"],
        "first_slot_deleted": article_meta["first_slot_deleted"],
        "last_slot_deleted": article_meta["last_slot_deleted"],
        "zhi_count": article_meta["zhi_count"],
        "zhi_example": article_meta["zhi_example"],
        "max_base": article_meta["max_base"],
        "dataset_update_date": dataset_update_date,
        "law_modified_date": content.get("law_modified_date")
        or record.law_modified_date,
        "law_effective_date": content.get("law_effective_date")
        or record.law_effective_date,
        "first_promulgation": promulgation,
        "law_histories": histories[:1200],
        "law_foreword": str(content.get("law_foreword") or "").strip()[:1200],
        "chapters": _law_chapter_outline(articles),
        "key_articles": _law_key_articles(articles),
        "articles": selected_articles,
        "stats": stats or None,
    }


def law_source_text(source: Dict[str, Any]) -> str:
    article_total = int(
        source.get("article_total") or source.get("article_count") or 0
    )
    article_live = int(source.get("article_live") or article_total)
    article_deleted = int(source.get("article_deleted") or 0)
    count_text = f"{article_total} 條（現行有效 {article_live} 條"
    if article_deleted:
        count_text += f"，已刪除 {article_deleted} 條"
    count_text += "）"
    lines = [
        f"{source['source_label']}：{source['law_name']}"
        f"（{source.get('law_level') or '位階未載明'}；"
        f"{count_text}；"
        f"最後異動 {_format_date(source.get('law_modified_date')) or '未載明'}）"
    ]
    promulgation = source.get("first_promulgation")
    if promulgation:
        lines.append(
            f"最早制定：{promulgation['roc_date']}"
            f"（西元 {promulgation['gregorian_date']}）"
        )
    elif source.get("law_effective_date"):
        lines.append(f"生效日期：{source['law_effective_date']}")
    stats = source.get("stats") or {}
    if stats:
        article_counts = stats.get("articles") or []
        top = "、".join(
            f"{item['article_no']} {item['count']} 次"
            for item in article_counts[:5]
        )
        sampled = bool(stats.get("sampled"))
        sample = "取樣 " if sampled else ""
        cited = "本法規在取樣中被引用" if sampled else "本法規被引用"
        lines.append(
            f"判決引用統計：{sample}{int(stats.get('judgment_count') or 0)} 筆提及"
            f"「{stats.get('entity') or ''}」的判決中，{cited} "
            f"{int(stats.get('law_count') or 0)} 次"
            + (f"；熱門條文：{top}" if top else "")
        )
    if source.get("law_histories"):
        lines.append(f"沿革：{source['law_histories'][:600]}")
    for article in source.get("articles") or []:
        lines.append(
            f"{article.get('article_no') or '條文'}：{article.get('article_content')}"
        )
    return "\n".join(lines)


def extract_stat_entity(question: str) -> str:
    text = _normalize(question)
    for word in sorted(_STATS_STOP_WORDS, key=len, reverse=True):
        text = text.replace(word, "")
    text = re.sub(r"^[在於對針對有關關於]+", "", text)
    return text.strip()


def is_citation_stats_question(question: str) -> bool:
    text = _normalize(question)
    return bool(
        re.search(r"最常|常見|經常|常|最多|大多|主要|通常|排行|統計|前幾", text)
        and re.search(r"觸犯|違反|引用|法條|法規|條文", text)
    )


def is_article_count_question(question: str) -> bool:
    text = _normalize(question)
    # 章／節／款／項層級的數量不是全法條文數，交給統計防護處理。
    if re.search(r"(章|節|款|項).{0,8}(有幾|多少|幾)", text) or re.search(
        r"(有幾|多少|幾).{0,8}(章|節|款|項)", text
    ):
        return False
    return bool(
        re.search(
            r"(多少|幾|共有|總共)\s*(條|條文)|條文數|有多少條",
            text,
        )
    )


def is_history_question(question: str) -> bool:
    return bool(
        re.search(r"何時|什麼時候|開始有|制定|公布|沿革|歷史|最早", _normalize(question))
    )


LAW_TERM_EXPANSIONS = {
    "壽險": ["人壽保險", "保險法"],
    "產險": ["財產保險", "保險法"],
    "證券營業員": ["證券營業員", "證券業務員"],
}

_INSURANCE_RESPONSIBILITY_TERMS = (
    "業務員",
    "招攬",
    "不當招攬",
    "適合度",
    "風險揭露",
    "責任",
)

_INSURANCE_RESPONSIBILITY_RULES = (
    ("保險業務員管理規則", "第15條", "業務員招攬及公司連帶責任"),
    ("保險業務員管理規則", "第19條", "不當招攬及停止招攬"),
    ("金融消費者保護法", "第8條", "禁止不實、詐欺、隱匿招攬"),
    ("金融消費者保護法", "第9條", "商品適合度義務"),
    ("金融消費者保護法", "第10條", "商品說明及風險揭露"),
    ("金融消費者保護法", "第11條", "損害賠償責任"),
    ("金融消費者保護法", "第11-3條", "懲罰性賠償"),
)

_INSURANCE_RESPONSIBILITY_SOURCES = (
    "保險法",
    "金融消費者保護法",
    "保險業務員管理規則",
)


def is_insurance_responsibility_question(question: str) -> bool:
    text = _normalize(question)
    return "保險" in text and any(
        term in text for term in _INSURANCE_RESPONSIBILITY_TERMS
    )


def responsibility_related_law_names(question: str) -> List[str]:
    if not is_insurance_responsibility_question(question):
        return []
    return ["金融消費者保護法", "保險業務員管理規則"]

_RELATED_LAW_PATTERNS = (
    re.compile(
        r"(?:有哪些|哪些|那些|什麼|何種)(?:相關|有關|涉及|適用)?"
        r"(?:法規|法律|法令|命令)"
        r"(?!規定|條文|內容|責任|義務|罰則|要件|範圍)"
    ),
    re.compile(r"(?:相關|有關|涉及|適用|依據)的?(?:法規|法律|法令|命令)"),
    re.compile(r"(?:法規|法律|法令|命令)(?:有哪些|清單|列表)"),
)


def is_related_laws_question(question: str) -> bool:
    text = _normalize(question)
    if re.search(r"列出.{0,24}(?:法規|法律|法令|命令)", text):
        return True
    return any(pattern.search(text) for pattern in _RELATED_LAW_PATTERNS)


_CASE_SIGNAL_TERMS = (
    "判決",
    "案例",
    "裁判",
    "法院",
    "實務",
    "起訴",
    "被告",
    "原告",
    "勝訴",
    "敗訴",
    "判刑",
)

_LAW_PROVISION_TERMS = (
    "規定",
    "規範",
    "條文",
    "法條",
    "法規",
    "法律",
    "命令",
    "義務",
    "責任",
    "罰則",
    "處罰",
    "要件",
    "定義",
    "範圍",
    "資格",
    "適用",
    "限制",
    "禁止",
    "許可",
    "罰金",
    "刑責",
    "刑度",
    "法律效果",
    "從業人員",
    "負責人",
    "職員",
    "董事",
    "監察人",
    "經理人",
    "受僱人",
    "授信",
    "利害關係人",
)


def is_law_first_question(
    question: str,
    law_sources: Optional[Sequence[Dict[str, Any]]] = None,
) -> bool:
    """Return True when the question should prioritize legal provisions."""

    text = _normalize(question)
    if any(term in text for term in _CASE_SIGNAL_TERMS):
        return False
    if any(term in text for term in _LAW_PROVISION_TERMS):
        return True
    if law_sources:
        for source in law_sources:
            name = _normalize(source.get("law_name") or "")
            if name and name in text:
                return True
    return False


def find_related_law_records(
    session_factory,
    question: str,
    *,
    limit: int = 8,
) -> List[LawDocument]:
    text = _normalize(question)
    terms: List[str] = []
    for keyword, expansions in LAW_TERM_EXPANSIONS.items():
        if keyword in text:
            for term in expansions:
                if term not in terms:
                    terms.append(term)
    if not terms:
        return []
    with session_factory() as session:
        rows = session.scalars(
            select(LawDocument)
            .where(
                LawDocument.is_current.is_(True),
                or_(
                    *[
                        LawDocument.law_name.contains(term, autoescape=True)
                        for term in terms
                    ],
                    *[
                        LawDocument.law_category.contains(term, autoescape=True)
                        for term in terms
                    ],
                ),
            )
            .order_by(LawDocument.source_type, LawDocument.law_name)
        ).all()
    records = list(rows)
    # Prefer the canonical 保險法 when the question asks about insurance.
    if "保險法" in terms:
        with session_factory() as session:
            canonical = session.scalars(
                select(LawDocument).where(
                    LawDocument.is_current.is_(True),
                    LawDocument.source_type == "law",
                    LawDocument.law_name == "保險法",
                )
            ).first()
        if canonical is not None and all(
            record.id != canonical.id for record in records
        ):
            records.insert(0, canonical)
    def related_score(record: LawDocument) -> int:
        name = record.law_name
        score = 0
        if name == "保險法":
            score += 15
        if "人壽保險" in name:
            score += 8
        if "財產保險" in name:
            score += 8
        if "人身保險" in name:
            score += 5
        if "保險" in name:
            score += 2
        if record.source_type == "law":
            score += 1
        if len(name) > 30:
            score -= 4
        if any(
            other in name
            for other in (
                "健康保險",
                "勞工保險",
                "就業保險",
                "公教人員保險",
                "軍人保險",
                "農民健康保險",
                "存款保險",
                "再保險",
            )
        ):
            score -= 6
        return score

    records.sort(
        key=lambda record: (
            -related_score(record),
            0 if record.source_type == "law" else 1,
            record.law_name,
        )
    )
    return records[:limit]


_LAW_STATS_LIMIT_ROWS = 100
_LAW_STATS_CACHE_TTL_SECONDS = 600.0
_LAW_STATS_CACHE_MAX_ENTRIES = 128
_LAW_STATS_CACHE: OrderedDict[
    Tuple[Any, str, int], Tuple[float, Dict[str, Any]]
] = OrderedDict()
_LAW_STATS_LOCKS: Dict[Tuple[Any, str, int], threading.Lock] = {}
_LAW_STATS_CACHE_GUARD = threading.Lock()


def _law_stats_cache_key(
    session_factory: Any,
    entity: str,
    limit_rows: int,
) -> Tuple[Any, str, int]:
    return (session_factory, entity, int(limit_rows))


def _cached_law_stats(
    key: Tuple[Any, str, int],
) -> Optional[Dict[str, Any]]:
    now = time.monotonic()
    with _LAW_STATS_CACHE_GUARD:
        entry = _LAW_STATS_CACHE.get(key)
        if entry is None:
            return None
        if entry[0] <= now:
            _LAW_STATS_CACHE.pop(key, None)
            return None
        _LAW_STATS_CACHE.move_to_end(key)
        return copy.deepcopy(entry[1])


def _store_law_stats(
    key: Tuple[Any, str, int],
    stats: Dict[str, Any],
) -> None:
    expires_at = time.monotonic() + _LAW_STATS_CACHE_TTL_SECONDS
    with _LAW_STATS_CACHE_GUARD:
        _LAW_STATS_CACHE[key] = (expires_at, copy.deepcopy(stats))
        _LAW_STATS_CACHE.move_to_end(key)
        while len(_LAW_STATS_CACHE) > _LAW_STATS_CACHE_MAX_ENTRIES:
            _LAW_STATS_CACHE.popitem(last=False)


def _law_stats_lock(key: Tuple[Any, str, int]) -> threading.Lock:
    with _LAW_STATS_CACHE_GUARD:
        return _LAW_STATS_LOCKS.setdefault(key, threading.Lock())


def _law_stats_timeout_result(
    entity: str,
    limit_rows: int,
) -> Dict[str, Any]:
    return {
        "entity": entity,
        "judgment_count": 0,
        "matched_by": "full_text_timeout",
        "sampled": False,
        "limit_rows": limit_rows,
        "timeout": True,
        "laws": [],
        "articles": [],
    }


def _compute_judgment_law_stats(
    session_factory: Any,
    entity: str,
    limit_rows: int,
) -> Dict[str, Any]:
    with session_factory() as session:
        rows = session.execute(
            select(JudgmentDocument.citations, JudgmentDocument.jid)
            .where(
                JudgmentDocument.matched_laws_text.contains(
                    entity, autoescape=True
                ),
                JudgmentDocument.is_current.is_(True),
            )
            .limit(limit_rows)
        ).all()
        matched_by = "matched_laws"
        if not rows:
            # The fallback scans full_text.  Keep the sample small and give
            # the statistics query its own budget so it can never hold the
            # whole answer hostage again.
            if getattr(getattr(session, "bind", None), "dialect", None):
                if session.bind.dialect.name == "postgresql":
                    session.execute(text("SET LOCAL statement_timeout = '5s'"))
            try:
                rows = session.execute(
                    select(JudgmentDocument.citations, JudgmentDocument.jid)
                    .where(
                        JudgmentDocument.full_text.contains(
                            entity, autoescape=True
                        ),
                        JudgmentDocument.is_current.is_(True),
                    )
                    .limit(limit_rows)
                ).all()
            except OperationalError as exc:
                message = str(exc).lower()
                if "timeout" in message or "canceling statement" in message:
                    return _law_stats_timeout_result(entity, limit_rows)
                raise
            matched_by = "full_text"
    law_counts: Counter[str] = Counter()
    article_counts: Counter[Tuple[str, str]] = Counter()
    for citations, _jid in rows:
        for citation in citations or []:
            if not isinstance(citation, dict):
                continue
            law_name = str(citation.get("law_name") or "").strip()
            article_no = str(citation.get("article_no") or "").strip()
            if not law_name:
                continue
            law_counts[law_name] += 1
            if article_no:
                article_counts[(law_name, article_no)] += 1
    return {
        "entity": entity,
        "judgment_count": len(rows),
        "matched_by": matched_by,
        "sampled": len(rows) >= limit_rows,
        "limit_rows": limit_rows,
        "timeout": False,
        "laws": [
            {"law_name": name, "count": count}
            for name, count in law_counts.most_common(10)
        ],
        "articles": [
            {"law_name": name, "article_no": article_no, "count": count}
            for (name, article_no), count in article_counts.most_common(12)
        ],
    }


@traced(
    "rag.law_stats",
    module=__name__,
    params_fn=lambda session_factory, entity, **_: {
        "entity_length": len(entity or "")
    },
)
def judgment_law_stats(
    session_factory,
    entity: str,
    *,
    limit_rows: int = _LAW_STATS_LIMIT_ROWS,
) -> Dict[str, Any]:
    entity = str(entity or "").strip()
    if not entity:
        return {}
    limit_rows = max(1, int(limit_rows))
    key = _law_stats_cache_key(session_factory, entity, limit_rows)
    cached = _cached_law_stats(key)
    if cached is not None:
        return cached
    # Single-flight per entity so concurrent identical questions do not each
    # start the expensive full-text scan.
    lock = _law_stats_lock(key)
    with lock:
        cached = _cached_law_stats(key)
        if cached is not None:
            return cached
        try:
            stats = _compute_judgment_law_stats(
                session_factory, entity, limit_rows
            )
        except OperationalError as exc:
            message = str(exc).lower()
            if "timeout" in message or "canceling statement" in message:
                return _law_stats_timeout_result(entity, limit_rows)
            raise
        except Exception:
            logger.warning(
                "judgment law stats failed for entity=%s", entity,
                exc_info=True,
            )
            stats = {}
        if stats and not stats.get("timeout"):
            _store_law_stats(key, stats)
        return copy.deepcopy(stats)


def _stats_for_law(stats: Dict[str, Any], law_name: str) -> Optional[Dict[str, Any]]:
    if not stats:
        return None
    law_count = 0
    for item in stats.get("laws") or []:
        if item.get("law_name") == law_name:
            law_count = int(item.get("count") or 0)
            break
    articles = [
        item
        for item in (stats.get("articles") or [])
        if item.get("law_name") == law_name
    ]
    if not law_count and not articles:
        return None
    return {
        "entity": stats.get("entity"),
        "judgment_count": stats.get("judgment_count", 0),
        "law_count": law_count,
        "sampled": bool(stats.get("sampled")),
        "matched_by": stats.get("matched_by") or "",
        "limit_rows": int(stats.get("limit_rows") or 0),
        "timeout": bool(stats.get("timeout")),
        "articles": articles,
    }


def _records_by_names(session_factory, names: Sequence[str]) -> List[LawDocument]:
    wanted = [str(name) for name in names if str(name or "").strip()]
    if not wanted:
        return []
    with session_factory() as session:
        records = session.scalars(
            select(LawDocument).where(
                LawDocument.is_current.is_(True),
                LawDocument.law_name.in_(wanted),
            )
        ).all()
    by_name = {record.law_name: record for record in records}
    return [by_name[name] for name in wanted if name in by_name]


def _dense_hits_by_law(
    vector_hits: Optional[Sequence[Dict[str, Any]]],
) -> Tuple[Dict[str, Dict[str, float]], Dict[str, float]]:
    by_law: Dict[str, Dict[str, float]] = {}
    law_scores: Dict[str, float] = {}
    for hit in vector_hits or []:
        if not isinstance(hit, dict):
            continue
        payload = hit.get("payload") or {}
        law_name = str(payload.get("law_name") or "").strip()
        if not law_name:
            continue
        try:
            score = float(hit.get("score") or 0)
        except (TypeError, ValueError):
            continue
        if score <= 0:
            continue
        article_no = str(payload.get("article_no") or "").strip()
        if article_no:
            law_scores_for_articles = by_law.setdefault(law_name, {})
            law_scores_for_articles[article_no] = max(
                law_scores_for_articles.get(article_no, 0.0),
                score,
            )
        law_scores[law_name] = max(law_scores.get(law_name, 0.0), score)
    return by_law, law_scores


def law_sources_for_question(
    session_factory,
    law_data_dir: Path,
    question: str,
    *,
    stats: Optional[Dict[str, Any]] = None,
    limit: int = 4,
    article_limit: int = 4,
    article_budget: int = 3000,
    vector_hits: Optional[Sequence[Dict[str, Any]]] = None,
    dense_weight: float = 0.2,
    rrf_k: int = 60,
) -> List[Dict[str, Any]]:
    dense_by_law, dense_law_scores = _dense_hits_by_law(vector_hits)
    effective_limit = limit
    if is_related_laws_question(question):
        effective_limit = max(limit, 8)
    elif stats and (stats.get("articles") or stats.get("laws")):
        effective_limit = max(limit, 5)
    if stats and (stats.get("articles") or stats.get("laws")):
        names: List[str] = []
        for item in stats.get("laws") or []:
            name = str(item.get("law_name") or "")
            if name and name not in names:
                names.append(name)
        for item in stats.get("articles") or []:
            name = str(item.get("law_name") or "")
            if name and name not in names:
                names.append(name)
        records = _records_by_names(session_factory, names[:effective_limit])
        if not records:
            records = find_law_records(
                session_factory, question, limit=effective_limit
            )
    else:
        records = find_law_records(
            session_factory, question, limit=effective_limit
        )
        if not records and is_related_laws_question(question):
            records = find_related_law_records(
                session_factory, question, limit=effective_limit
            )

    related_names = responsibility_related_law_names(question)
    if related_names:
        existing_names = {record.law_name for record in records}
        extras = _records_by_names(
            session_factory,
            [name for name in related_names if name not in existing_names],
        )
        if extras:
            records = list(records) + extras
            effective_limit = max(effective_limit, len(records))
    if dense_law_scores:
        existing_names = {record.law_name for record in records}
        question_text = _normalize(question)
        explicit_law = any(
            _normalize(record.law_name) in question_text
            for record in records
        )
        # Dense law candidates are most useful when keyword lookup found
        # nothing or when the question asks for related statutes.  When the
        # user named a statute explicitly, keep that statute as the anchor and
        # only use dense scores to rank its articles.
        if (
            not records
            or not explicit_law
            or is_related_laws_question(question)
        ):
            ranked_names = [
                name
                for name in sorted(
                    dense_law_scores,
                    key=lambda name: (-dense_law_scores[name], name),
                )
                if name not in existing_names
            ]
            room = max(0, effective_limit - len(records))
            if records:
                # Keep keyword/concept matches as the main sources; dense may
                # add one complementary statute, not replace the whole list.
                room = min(room, 1)
            else:
                # A purely dense lookup should stay focused instead of
                # surrounding one question with four unrelated statutes.
                room = min(room, 2)
            if room and ranked_names:
                candidate_names = ranked_names[: max(room * 3, room)]
                extras = _records_by_names(
                    session_factory, candidate_names
                )
                by_name = {record.law_name: record for record in extras}
                ordered_extras = sorted(
                    (
                        by_name[name]
                        for name in candidate_names
                        if name in by_name
                    ),
                    key=lambda record: (
                        -(
                            dense_law_scores.get(
                                record.law_name, 0.0
                            )
                            + (
                                0.02
                                if record.source_type == "law"
                                else 0.0
                            )
                        ),
                        record.law_name,
                    ),
                )[:room]
                if ordered_extras:
                    records = list(records) + ordered_extras
                    effective_limit = max(
                        effective_limit, len(records)
                    )
    if not records:
        return []
    contents = load_law_contents(law_data_dir, records)
    dataset_date = _dataset_update_date(
        session_factory,
        str(records[0].source_type or "") if records else "",
    )
    sources: List[Dict[str, Any]] = []
    for record in records[:effective_limit]:
        content = contents.get((record.source_type, record.law_name)) or contents.get(
            (record.source_type, record.law_key)
        )
        priority = None
        if stats:
            priority = [
                item["article_no"]
                for item in (stats.get("articles") or [])
                if item.get("law_name") == record.law_name
            ]
        sources.append(
            build_law_source(
                record,
                content,
                question,
                stats=_stats_for_law(stats, record.law_name) if stats else None,
                priority_articles=priority,
                article_limit=article_limit,
                article_budget=article_budget,
                dense_scores=dense_by_law.get(record.law_name),
                dense_weight=dense_weight,
                rrf_k=rrf_k,
                dataset_update_date=dataset_date,
            )
        )
    return sources


def _primary_law_source(
    question: str,
    law_sources: Sequence[Dict[str, Any]],
) -> Dict[str, Any]:
    text = _normalize(question)
    matched = [
        source
        for source in law_sources
        if _normalize(source.get("law_name") or "") in text
    ]
    if matched:
        return max(matched, key=lambda source: len(_normalize(source["law_name"])))
    return next(
        (source for source in law_sources if source.get("source_type") == "law"),
        law_sources[0],
    )


_LAW_OVERVIEW_PREFIXES = (
    "請",
    "想",
    "我要",
    "幫我",
    "介紹",
    "簡介",
    "說明",
    "概述",
    "解釋",
    "告訴我",
)
_LAW_OVERVIEW_SUFFIXES = (
    "是什麼",
    "的介紹",
    "的簡介",
    "的概述",
    "介紹",
    "簡介",
    "概述",
    "重點",
    "架構",
    "內容",
    "規範",
    "條文",
)


def _law_overview_key(question: str) -> str:
    text = _normalize(question)
    text = re.sub(r"[？?。.!！、，,\s]", "", text)
    changed = True
    while changed and text:
        changed = False
        for prefix in _LAW_OVERVIEW_PREFIXES:
            if text.startswith(prefix) and len(text) > len(prefix):
                text = text[len(prefix) :]
                changed = True
        for suffix in _LAW_OVERVIEW_SUFFIXES:
            if text.endswith(suffix) and len(text) > len(suffix):
                text = text[: -len(suffix)]
                changed = True
    return text


def is_law_overview_question(
    question: str,
    law_sources: Sequence[Dict[str, Any]],
) -> bool:
    """True for a bare law name / short law introduction question."""

    key = _law_overview_key(question)
    if not key or len(key) > 40:
        return False
    canonical = _normalize(LAW_ALIASES.get(key, key))
    return any(
        _normalize(source.get("law_name") or "") == canonical
        or _short_law_name(source.get("law_name") or "") == canonical
        for source in law_sources
    )


_FINANCIAL_QUERY_TERMS = (
    "金融",
    "銀行",
    "證券",
    "期貨",
    "保險",
    "票據",
    "洗錢",
    "資恐",
    "信託",
    "金控",
    "存款",
    "授信",
    "放款",
    "借款",
    "借貸",
    "返還",
    "債務",
    "清償",
    "利息",
    "保證",
    "連帶",
    "欠款",
    "匯款",
    "支付",
    "外匯",
    "債券",
    "基金",
    "上市",
    "上櫃",
    "內線交易",
    "操縱市場",
    "非常規交易",
    "公開收購",
    "公司治理",
    "財報",
    "背信",
    "侵占",
    "詐欺",
    "詐騙",
    "車手",
    "人頭帳戶",
    "信用卡",
    "利率",
    "匯率",
    "投資",
    "理財",
    "虛擬資產",
    "電子支付",
    "融資",
    "租賃",
    "擔保",
    "抵押",
    "質押",
    "破產",
    "重整",
    "清算",
    "董監",
    "股東",
    "增資",
    "減資",
    "私募",
    "承銷",
    "自營",
    "經紀",
    "證券交易所",
    "櫃買",
    "集保",
    "金融消費者",
    "金融科技",
    "監理沙盒",
    "保險業務員",
    "業務員",
    "理賠",
    "保單",
    "貸款",
    "房貸",
    "信貸",
    "第三方支付",
)


@lru_cache(maxsize=8)
def load_financial_law_entries(path: str) -> Tuple[str, ...]:
    """Load the 99 raw entries from the financial-law whitelist.

    This intentionally does not add aliases; the returned tuple is the exact
    list users see when they ask what the 99-law scope contains.
    """

    source = Path(path).expanduser()
    try:
        lines = source.read_text(encoding="utf-8").splitlines()
    except OSError:
        return ()
    entries: List[str] = []
    for line in lines:
        raw = line.strip()
        if not raw or raw.startswith("#"):
            continue
        name = re.split(r"[（(]", raw, 1)[0].strip()
        if len(name) < 2 or not re.search(r"[\u4e00-\u9fff]", name):
            continue
        entries.append(raw)
    return tuple(entries)


@lru_cache(maxsize=8)
def load_financial_law_names(path: str) -> frozenset[str]:
    """Load the 99-law whitelist, including aliases and base names."""

    entries = load_financial_law_entries(path)
    if not entries:
        return frozenset()
    names: set[str] = set()
    for entry in entries:
        name = re.split(r"[（(]", entry, 1)[0].strip()
        if not name:
            continue
        names.add(name)
        names.add(_normalize(name))
    for alias, canonical in LAW_ALIASES.items():
        if canonical in names or _normalize(canonical) in names:
            names.add(alias)
            names.add(_normalize(alias))
    return frozenset(names)


def is_financial_query(
    question: str,
    law_sources: Sequence[Dict[str, Any]],
    law_list_path: Path,
) -> bool:
    """Return True when the question is within the financial-law corpus."""

    names = load_financial_law_names(str(law_list_path))
    if not names:
        # Do not break RAG if the whitelist is unavailable.
        return True
    for source in law_sources:
        name = _normalize(source.get("law_name") or "")
        if name and name in names:
            return True
    text = _normalize(question)
    if any(name and name in text for name in names):
        return True
    return any(term in text for term in _FINANCIAL_QUERY_TERMS)


_WHITELIST_QUERY_RE = re.compile(
    r"(?:99|九十九)\s*(?:項|條|個)?\s*(?:金融|相關)*\s*(?:法規|法律|命令)"
    r"|(?:金融|相關)*\s*(?:法規|法律|命令)\s*"
    r"(?:有(?:哪|那)些|清單|白名單|範圍)(?:[？?。！!]|$)"
)
_REFUSAL_EXPLANATION_RE = re.compile(
    r"(?:為什麼|為何|原因|理由|依據).{0,30}"
    r"(?:拒絕|不能回答|無法回答|未回答|不回答|不行|未對應|不在範圍|沒有回答)"
    r"|(?:拒絕|未對應|不在範圍|不能回答|無法回答).{0,30}"
    r"(?:為什麼|為何|原因|理由|依據)"
)
_REFUSAL_CONTEXT_TERMS = (
    "99",
    "九十九",
    "金融法規",
    "本系統",
    "剛剛",
    "剛才",
    "上一個",
    "這個問題",
    "拒絕回答",
)


def is_financial_law_list_question(question: str) -> bool:
    """Return True when the user asks for the 99-law scope or refusal basis."""

    text = _normalize(question)
    if _WHITELIST_QUERY_RE.search(text):
        return True
    if _REFUSAL_EXPLANATION_RE.search(text):
        return any(term in text for term in _REFUSAL_CONTEXT_TERMS)
    return False


def financial_law_scope_answer(
    question: str,
    law_list_path: Path,
) -> Dict[str, Any]:
    """Return a deterministic explanation of the financial-law whitelist.

    The answer must never call the LLM: the scope is defined by a static
    whitelist, and the user is asking for the rule/basis rather than a legal
    analysis.
    """

    entries = load_financial_law_entries(str(law_list_path))
    text = _normalize(question)
    refusal_mode = bool(_REFUSAL_EXPLANATION_RE.search(text))
    if not entries:
        return {
            "answer": (
                "目前無法讀取金融法規白名單，因此無法列出 99 項法規／命令。"
                "請確認 documents/金融法規.md 存在且可讀取。"
            ),
            "count": 0,
            "mode": "unavailable",
        }
    count = len(entries)
    lines = [
        (
            "您問的是本系統的金融法規範圍。"
            if not refusal_mode
            else "若上一題的訊息是「未對應 99 項金融相關法規」，系統依據的是金融法規白名單與金融關鍵詞判斷，不是任意推測。"
        ),
        (
            f"本系統目前納入判決檢索與 RAG 範圍的是金融法規白名單中的 {count} 項法規／命令；"
            "這裡的「99」不是某一部法律的第 99 條。"
        ),
        "",
        f"白名單來源：{Path(law_list_path).name}",
        f"以下為目前 {count} 項法規／命令：",
    ]
    lines.extend(f"{index}. {name}" for index, name in enumerate(entries, 1))
    lines.append("")
    lines.append(
        "判斷方式：問題文字或檢索到的法規名稱必須命中上述白名單，"
        "或命中銀行、證券、保險、洗錢等金融關鍵詞；否則系統會回覆"
        "「未對應 99 項金融相關法規」並拒絕生成判決 RAG 回答。"
    )
    if refusal_mode:
        lines.append(
            "若上一題的訊息是「無法確認：本系統目前不支援這類統計或排序查詢」，"
            "則是因為沒有可用的結構化 handler，與這 99 項白名單無關。"
        )
    lines.append("這不是法律意見。")
    return {
        "answer": "\n".join(lines),
        "count": count,
        "mode": "refusal" if refusal_mode else "list",
    }


def _law_overview_answer(source: Mapping[str, Any]) -> str:
    name = str(source.get("law_name") or "法規")
    level = str(source.get("law_level") or "位階未載明")
    count = int(source.get("article_count") or 0)
    modified = _format_date(source.get("law_modified_date")) or "未載明"
    index = int(source.get("index") or 1)
    lines = [name, ""]
    meta = (
        f"{name}是{level}，目前資料庫共 {count} 條，"
        f"最後異動日為 {modified} [{index}]。"
    )
    promulgation = source.get("first_promulgation")
    if promulgation:
        meta += (
            f" 最早於 {promulgation['roc_date']} 制定公布"
            f"（西元 {promulgation['gregorian_date']}）。"
        )
    lines.append(meta)

    lines.extend(["", "一、立法目的與主管機關"])
    foreword = str(source.get("law_foreword") or "").strip()
    key_articles = list(source.get("key_articles") or [])
    if foreword:
        lines.append(f"立法目的／前言：{foreword[:500]}")
    elif key_articles:
        first = key_articles[0]
        lines.append(
            f"立法目的（{first['article_no']}）：{first['article_content']}"
        )

    authority = next(
        (
            article
            for article in key_articles
            if "主管機關" in str(article.get("article_content") or "")
        ),
        None,
    )
    if authority:
        lines.append(
            f"主管機關（{authority['article_no']}）："
            f"{authority['article_content'][:260]}"
        )

    chapters = list(source.get("chapters") or [])
    if chapters:
        lines.extend(["", f"二、章節架構（共 {len(chapters)} 章）"])
        for chapter in chapters:
            first_no = chapter.get("first_article") or "—"
            last_no = chapter.get("last_article") or "—"
            article_range = (
                first_no
                if first_no == last_no
                else f"{first_no}–{last_no}"
            )
            lines.append(
                f"- {chapter.get('title') or '未命名章節'}："
                f"{article_range}（{int(chapter.get('article_count') or 0)} 條）"
            )

    if key_articles:
        lines.extend(["", "三、核心條文"])
        for article in key_articles[:6]:
            lines.append(
                f"- {article['article_no']}：{article['article_content']}"
            )

    lines.extend(
        [
            "",
            "以上是法規資料庫的章節與條文整理；點擊來源卡可查看本地 Parquet 的完整條文。"
            "這不是法律意見。",
        ]
    )
    return "\n".join(lines)


def structured_law_answer(
    question: str,
    law_sources: Sequence[Dict[str, Any]],
    stats: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    if not law_sources:
        return None
    primary = _primary_law_source(question, law_sources)
    boundary = law_article_boundary_question(question)
    if boundary:
        answer = law_boundary_answer(question, primary, boundary)
        if answer:
            return answer
    if is_law_overview_question(question, law_sources):
        return _law_overview_answer(primary)
    if is_article_count_question(question):
        label = primary["source_label"]
        dataset_date = _date_ymd(primary.get("dataset_update_date"))
        modified_date = _format_date(primary.get("law_modified_date")) or "未載明"
        article_total = int(
            primary.get("article_total") or primary.get("article_count") or 0
        )
        article_live = int(primary.get("article_live") or article_total)
        article_deleted = int(primary.get("article_deleted") or 0)
        last_no = str(
            (primary.get("last_article") or {}).get("article_no") or ""
        ).strip()
        zhi_count = int(primary.get("zhi_count") or 0)
        zhi_example = str(primary.get("zhi_example") or "").strip()
        detail = f"現行有效 {article_live} 條"
        if article_deleted:
            detail += (
                f"（條號共 {article_total}，其中 {article_deleted} 條已刪除）"
            )
        else:
            detail += f"（條號共 {article_total}）"
        if zhi_count and zhi_example:
            detail += f"；條號含『之』條（如{zhi_example}）"
        if primary.get("last_slot_deleted") and last_no:
            detail += f"，最後一條有效條文是 {last_no}"
        elif last_no:
            detail += f"，最後一條是 {last_no}"
        provenance = (
            f"資料截至 {dataset_date}" if dataset_date else "資料截至本系統版本日"
        )
        return (
            f"{primary['law_name']}{detail} [{primary['index']}]。"
            f"{provenance}，來源：全國法規資料庫；該{label}最後異動日為 {modified_date}。"
        )
    if is_history_question(question):
        promulgation = primary.get("first_promulgation")
        if promulgation:
            return (
                f"{primary['law_name']}最早於{promulgation['roc_date']}制定公布，"
                f"換算西元為 {promulgation['gregorian_date']} [{primary['index']}]。"
                f"目前資料最後異動日為 {_format_date(primary.get('law_modified_date')) or '未載明'}。"
            )
        first_line = str(primary.get("law_histories") or "").splitlines()
        if first_line and first_line[0].strip():
            return (
                f"依資料庫沿革，{primary['law_name']}的早期紀錄為："
                f"{first_line[0].strip()[:160]} [{primary['index']}]。"
            )
    if is_related_laws_question(question) and len(law_sources) > 1:
        items = []
        for source in law_sources:
            items.append(
                f"{source['law_name']}（{source.get('source_label') or '法規'}，"
                f"{int(source.get('article_count') or 0)} 條）[{source['index']}]"
            )
        if items:
            return (
                "依資料庫的法規名稱與類別關鍵字，相關的法規／命令包括："
                f"{'、'.join(items)}。這是關鍵字整理出的清單，可能不是完整列舉；"
                "點擊來源卡可查看本地 Parquet 的原始條文。這不是法律意見。"
            )
    if stats and stats.get("laws") and re.search(r"法規|命令", question) and not re.search(
        r"法條|條文", question
    ):
        by_law = {source["law_name"]: source for source in law_sources}
        parts: List[str] = []
        for item in stats["laws"][:5]:
            source = by_law.get(item["law_name"])
            if source is None:
                continue
            parts.append(
                f"{item['law_name']}（{item['count']} 次） [{source['index']}]"
            )
        if parts:
            entity = stats.get("entity") or ""
            count = int(stats.get("judgment_count") or 0)
            sample_size = int(
                stats.get("limit_rows") or stats.get("judgment_count") or 0
            )
            sampled = f"（取樣 {sample_size} 筆）" if stats.get("sampled") else ""
            if stats.get("matched_by") == "full_text":
                scope = f"在 {count} 筆全文提及「{entity}」的判決中{sampled}"
            else:
                scope = f"在 {count} 筆提及「{entity}」的判決中{sampled}"
            return (
                f"{scope}，最常被引用的法規／命令是"
                f"{'、'.join(parts)}。這是判決引用次數統計，不代表定罪或勝訴比例；"
                "也不是法律意見。"
            )
    if stats and stats.get("articles"):
        by_law = {source["law_name"]: source for source in law_sources}
        parts: List[str] = []
        cited: List[str] = []
        for item in stats["articles"][:5]:
            source = by_law.get(item["law_name"])
            if source is None:
                continue
            parts.append(
                f"{item['law_name']}{item['article_no']}（{item['count']} 次）"
                f" [{source['index']}]"
            )
            if source["index"] not in cited:
                cited.append(str(source["index"]))
        if parts:
            entity = stats.get("entity") or ""
            count = int(stats.get("judgment_count") or 0)
            sample_size = int(
                stats.get("limit_rows") or stats.get("judgment_count") or 0
            )
            sampled = f"（取樣 {sample_size} 筆）" if stats.get("sampled") else ""
            if stats.get("matched_by") == "full_text":
                scope = f"在 {count} 筆全文提及「{entity}」的判決中{sampled}"
            else:
                scope = f"在 {count} 筆提及「{entity}」的判決中{sampled}"
            return (
                f"{scope}，最常被引用的法條是"
                f"{'、'.join(parts[:5])}。這是判決引用次數統計，不代表定罪或勝訴比例；"
                "也不是法律意見。"
            )
    return None
