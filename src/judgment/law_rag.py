from __future__ import annotations

import math
import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import pyarrow.parquet as pq
from sqlalchemy import or_, select

from .models import JudgmentDocument, LawDocument
from .observability import traced

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
        if name in text or name in alias_targets:
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


def select_law_articles(
    articles: Sequence[Dict[str, Any]],
    question: str,
    *,
    priority: Optional[Sequence[str]] = None,
    limit: int = 4,
    budget: int = 3000,
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
    priority_order = {
        _article_key(article_no): index
        for index, article_no in enumerate(priority or [])
    }
    candidates: List[Dict[str, Any]] = []
    for index, article in enumerate(usable):
        article_no = str(article.get("article_no") or "").strip()
        article_key = _article_key(article_no)
        in_priority = article_key in priority_order
        candidates.append(
            {
                "article_no": article_no,
                "article_content": str(article.get("article_content") or "").strip(),
                "is_priority": in_priority,
                "priority_rank": priority_order.get(article_key, len(priority_order) + 1),
                "score": relevance[index] if index < len(relevance) else 0.0,
            }
        )
    candidates.sort(
        key=lambda item: (
            0 if item["is_priority"] else 1,
            item["priority_rank"],
            -item["score"],
            len(item["article_content"]),
            item["article_no"],
        )
    )
    best_score = max((item["score"] for item in candidates), default=0.0)
    threshold = best_score * 0.2
    selected: List[Dict[str, str]] = []
    total = 0
    for item in candidates:
        if len(selected) >= limit:
            break
        # Priority articles come from explicit judgment-citation statistics and
        # are always kept.  Otherwise avoid padding the answer with unrelated
        # articles just because a law has 200+ sections.
        if not item["is_priority"] and (
            item["score"] <= 0 or item["score"] < threshold
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


def build_law_source(
    record: LawDocument,
    content: Optional[Dict[str, Any]],
    question: str,
    *,
    stats: Optional[Dict[str, Any]] = None,
    priority_articles: Optional[Sequence[str]] = None,
    article_limit: int = 4,
    article_budget: int = 3000,
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
    )
    promulgation = parse_first_promulgation(histories)
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
        "law_modified_date": content.get("law_modified_date")
        or record.law_modified_date,
        "law_effective_date": content.get("law_effective_date")
        or record.law_effective_date,
        "first_promulgation": promulgation,
        "law_histories": histories[:1200],
        "articles": selected_articles,
        "stats": stats or None,
    }


def law_source_text(source: Dict[str, Any]) -> str:
    lines = [
        f"{source['source_label']}：{source['law_name']}"
        f"（{source.get('law_level') or '位階未載明'}；"
        f"{int(source.get('article_count') or 0)} 條；"
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
        lines.append(
            f"判決引用統計：{int(stats.get('judgment_count') or 0)} 筆提及"
            f"「{stats.get('entity') or ''}」的判決中，本法規被引用 "
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
    return bool(re.search(r"(多少|幾)\s*(條|條文)|條文數|總共.{0,8}條", _normalize(question)))


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

_RELATED_LAW_RE = re.compile(r"哪些|那些|相關|有關|列出|清單")


def is_related_laws_question(question: str) -> bool:
    return bool(_RELATED_LAW_RE.search(_normalize(question)))


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
                        LawDocument.law_name.contains(term)
                        for term in terms
                    ],
                    *[
                        LawDocument.law_category.contains(term)
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
    limit_rows: int = 2000,
) -> Dict[str, Any]:
    entity = str(entity or "").strip()
    if not entity:
        return {}
    with session_factory() as session:
        rows = session.execute(
            select(JudgmentDocument.citations, JudgmentDocument.jid)
            .where(
                JudgmentDocument.matched_laws_text.contains(entity),
                JudgmentDocument.is_current.is_(True),
            )
            .limit(limit_rows)
        ).all()
        matched_by = "matched_laws"
        if not rows:
            rows = session.execute(
                select(JudgmentDocument.citations, JudgmentDocument.jid)
                .where(
                    JudgmentDocument.full_text.contains(entity),
                    JudgmentDocument.is_current.is_(True),
                )
                .limit(limit_rows)
            ).all()
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
        "laws": [
            {"law_name": name, "count": count}
            for name, count in law_counts.most_common(10)
        ],
        "articles": [
            {"law_name": name, "article_no": article_no, "count": count}
            for (name, article_no), count in article_counts.most_common(12)
        ],
    }


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


def law_sources_for_question(
    session_factory,
    law_data_dir: Path,
    question: str,
    *,
    stats: Optional[Dict[str, Any]] = None,
    limit: int = 4,
    article_limit: int = 4,
    article_budget: int = 3000,
) -> List[Dict[str, Any]]:
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
    if not records:
        return []
    contents = load_law_contents(law_data_dir, records)
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


def structured_law_answer(
    question: str,
    law_sources: Sequence[Dict[str, Any]],
    stats: Optional[Dict[str, Any]] = None,
) -> Optional[str]:
    if not law_sources:
        return None
    primary = _primary_law_source(question, law_sources)
    if is_article_count_question(question):
        label = primary["source_label"]
        date = _format_date(primary.get("law_modified_date")) or "未載明"
        return (
            f"{primary['law_name']}目前共有 {int(primary.get('article_count') or 0)} 條條文"
            f" [{primary['index']}]。這是{label}資料庫的現行條文數，資料最後異動日為 {date}。"
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
            sampled = "（取前 2,000 筆）" if stats.get("sampled") else ""
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
            sampled = "（取前 2,000 筆）" if stats.get("sampled") else ""
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
