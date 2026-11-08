from __future__ import annotations

import hashlib
import json
from typing import Any, Dict, List

from .types import LawRecord, ParsedDataset, SourceSpec


class LawParseError(RuntimeError):
    """Raised when the law/order JSON payload cannot be normalized safely."""


def _text(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def _canonical_json(value: Any) -> str:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    )


def _law_key(source: SourceSpec, law: Dict[str, Any]) -> str:
    law_url = _text(law.get("LawURL")).strip()
    if law_url:
        return law_url
    law_name = _text(law.get("LawName")).strip()
    if not law_name:
        raise LawParseError("law entry has neither LawURL nor LawName")
    return f"name:{law_name}"


def _content_hash(law: Dict[str, Any]) -> str:
    return hashlib.sha256(_canonical_json(law).encode("utf-8")).hexdigest()


def parse_dataset(payload: Dict[str, Any], source: SourceSpec) -> ParsedDataset:
    laws_payload = payload.get("Laws")
    if not isinstance(laws_payload, list):
        raise LawParseError("payload does not contain a Laws array")

    records: List[LawRecord] = []
    warnings: List[str] = []
    seen_keys: Dict[str, int] = {}
    article_count = 0

    for index, law in enumerate(laws_payload):
        if not isinstance(law, dict):
            warnings.append(f"laws[{index}] is not an object; skipped")
            continue

        law_name = _text(law.get("LawName")).strip()
        if not law_name:
            warnings.append(f"laws[{index}] has no LawName; skipped")
            continue

        law_key = _law_key(source, law)
        if law_key in seen_keys:
            raise LawParseError(
                f"duplicate law key {law_key!r} at laws[{index}] "
                f"and laws[{seen_keys[law_key]}]"
            )
        seen_keys[law_key] = index

        articles: List[Dict[str, str]] = []
        for article in law.get("LawArticles") or []:
            if not isinstance(article, dict):
                continue
            articles.append(
                {
                    "article_type": _text(article.get("ArticleType")),
                    "article_no": _text(article.get("ArticleNo")),
                    "article_content": _text(article.get("ArticleContent")),
                }
            )

        law_article_count = sum(
            1 for article in articles if article["article_type"] == "A"
        )
        article_count += law_article_count

        attachments = law.get("LawAttachements")
        if attachments is None:
            attachments_json = "[]"
        else:
            attachments_json = _canonical_json(attachments)

        records.append(
            LawRecord(
                law_key=law_key,
                law_name=law_name,
                law_level=_text(law.get("LawLevel")),
                law_category=_text(law.get("LawCategory")),
                law_url=_text(law.get("LawURL")),
                law_modified_date=_text(law.get("LawModifiedDate")),
                law_effective_date=_text(law.get("LawEffectiveDate")),
                law_effective_note=_text(law.get("LawEffectiveNote")),
                law_abandon_note=_text(law.get("LawAbandonNote")),
                law_has_eng_version=_text(law.get("LawHasEngVersion")).upper() == "Y",
                eng_law_name=_text(law.get("EngLawName")),
                law_attachments_json=attachments_json,
                law_histories=_text(law.get("LawHistories")),
                law_foreword=_text(law.get("LawForeword")),
                law_articles=articles,
                article_count=law_article_count,
                content_hash=_content_hash(law),
                raw_json=_canonical_json(law),
            )
        )

    if not records:
        raise LawParseError("payload contains no usable law entries")

    digest = hashlib.sha256()
    for record in sorted(records, key=lambda item: item.law_key):
        digest.update(record.law_key.encode("utf-8"))
        digest.update(b":")
        digest.update(record.content_hash.encode("ascii"))
        digest.update(b"\n")

    return ParsedDataset(
        source=source,
        update_date=_text(payload.get("UpdateDate")),
        laws=records,
        law_count=len(records),
        article_count=article_count,
        semantic_sha256=digest.hexdigest(),
        warnings=warnings,
    )
