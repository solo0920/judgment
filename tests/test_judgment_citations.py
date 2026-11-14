from __future__ import annotations

from types import SimpleNamespace

from judgment.judgment_citations import (
    article_match_key,
    article_paragraphs,
    law_citations_for_record,
)
from judgment.rag import _build_citations


def test_article_paragraphs_follows_line_breaks_and_multiple_items() -> None:
    text = (
        "上訴人共同犯銀行法第125條第1\n"
        "項後段之罪，另依銀行法第125條第3項規定，"
        "銀行法第136條之1定有沒收規定。"
    )

    assert article_paragraphs(text, "銀行法", "第125條") == ["第1項", "第3項"]
    assert article_paragraphs(text, "銀行法", "第136條之1") == []


def test_article_match_key_normalizes_whitespace_and_sub_articles() -> None:
    assert article_match_key("第 136 條之 1") == "第136-1條"
    assert article_match_key("第136-1條") == "第136-1條"
    assert article_match_key("第 184 條") == "第184條"


def test_law_citations_for_record_deduplicates_and_adds_paragraphs() -> None:
    record = SimpleNamespace(
        full_text="依銀行法第125條第1項及第3項規定，銀行法第29條第1項定有明文。",
        citations=[
            {"law_name": "銀行法", "article_no": "第 125 條", "text": "銀行法第125條"},
            {"law_name": "銀行法", "article_no": "第125條", "text": "重複"},
            {"law_name": "", "article_no": "第1條"},
            {"law_name": "銀行法", "article_no": "第29條"},
        ],
    )

    citations = law_citations_for_record(record)

    assert [item["article_no"] for item in citations] == ["第125條", "第29條"]
    assert citations[0]["paragraphs"] == ["第1項", "第3項"]
    assert citations[1]["paragraphs"] == ["第1項"]


def test_build_citations_exposes_article_level_law_citations() -> None:
    record = SimpleNamespace(
        jid="TPSM,113,台上,4874,20250122,1",
        court_normalized="最高法院",
        jdate="20250122",
        title="違反銀行法",
        full_text="上訴人共同犯銀行法第125條第1項後段之罪。",
        matched_laws=["銀行法"],
        citations=[{"law_name": "銀行法", "article_no": "第125條"}],
        citation_count=1,
        pdf_url="",
    )

    citations, _ = _build_citations(
        hits=[
            {
                "payload": {"jid": record.jid, "court": "最高法院"},
                "score": 0.9,
            }
        ],
        documents={record.jid: record},
        question="銀行法對從業人員有那些規定？",
        max_context_chars=2000,
    )

    assert citations[0]["law_citations"] == [
        {
            "law_name": "銀行法",
            "article_no": "第125條",
            "paragraphs": ["第1項"],
        }
    ]
