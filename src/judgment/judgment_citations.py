from __future__ import annotations

import re
import unicodedata
from typing import Any, Dict, List

_ARTICLE_NUMBER = r"[0-9〇零一二三四五六七八九十百千萬億]+"
_PARAGRAPH_TOKEN = rf"第{_ARTICLE_NUMBER}項"
_PARAGRAPH_GROUP_RE = re.compile(rf"{_PARAGRAPH_TOKEN}(?:[、,，及或]?{_PARAGRAPH_TOKEN})*")
_PARAGRAPH_RE = re.compile(_PARAGRAPH_TOKEN)
_ARTICLE_WITH_SUB_RE = re.compile(rf"^第({_ARTICLE_NUMBER})條之({_ARTICLE_NUMBER})$")


def normalize_for_match(value: str) -> str:
    """Normalize a citation fragment the same way judgment text is scanned."""

    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", value or ""))


def article_match_key(value: str) -> str:
    """Return a comparable article number.

    Judgment citations use ``第136條之1`` while law Parquet snapshots use
    ``第 136-1 條``.  Both forms must resolve to the same article.
    """

    key = normalize_for_match(value)
    match = _ARTICLE_WITH_SUB_RE.fullmatch(key)
    if match:
        return f"第{match.group(1)}-{match.group(2)}條"
    return key


def article_paragraphs(
    full_text: str,
    law_name: str,
    article_no: str,
    *,
    limit: int = 6,
) -> List[str]:
    """Find the paragraph numbers immediately attached to a citation.

    Judgment metadata only records article numbers (``第125條``), while the
    judgment itself often cites ``第125條第1項`` or ``第125條第1項、第3項``.
    The paragraph tokens are display-only; the article number remains the
    lookup key used by the law detail API.
    """

    text = normalize_for_match(full_text)
    law = normalize_for_match(law_name)
    article = normalize_for_match(article_no)
    if not text or not law or not article:
        return []

    prefix = f"{law}{article}"
    paragraphs: List[str] = []
    start = 0
    while len(paragraphs) < limit:
        position = text.find(prefix, start)
        if position < 0:
            break
        tail = text[position + len(prefix) : position + len(prefix) + 96]
        match = _PARAGRAPH_GROUP_RE.match(tail)
        if match:
            for token in _PARAGRAPH_RE.findall(match.group(0)):
                if token not in paragraphs:
                    paragraphs.append(token)
                    if len(paragraphs) >= limit:
                        break
        start = position + len(prefix)
    return paragraphs


def law_citations_from_items(
    items: Any,
    full_text: str,
    *,
    limit: int = 16,
) -> List[Dict[str, Any]]:
    """Serialize stored citations and attach display-only paragraph hints."""

    citations: List[Dict[str, Any]] = []
    seen = set()
    for item in items or []:
        if not isinstance(item, dict):
            continue
        law_name = str(item.get("law_name") or "").strip()
        article_no = normalize_for_match(str(item.get("article_no") or ""))
        if not law_name or not article_no:
            continue
        key = (law_name, article_no)
        if key in seen:
            continue
        seen.add(key)
        citation = dict(item)
        citation["law_name"] = law_name
        citation["article_no"] = article_no
        citation["paragraphs"] = article_paragraphs(
            full_text,
            law_name,
            article_no,
        )
        citations.append(citation)
        if len(citations) >= limit:
            break
    return citations


def law_citations_for_record(record: Any, *, limit: int = 16) -> List[Dict[str, Any]]:
    """Serialize a judgment ORM record's citations for the API response."""

    return law_citations_from_items(
        getattr(record, "citations", None),
        getattr(record, "full_text", "") or "",
        limit=limit,
    )
