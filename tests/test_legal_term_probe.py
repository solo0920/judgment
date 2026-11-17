from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.legal_term_probe import (
    ScopeTerm,
    extract_scope_terms,
    probe_scope_terms,
)
from judgment.models import Base, JudgmentDocument
from judgment.query_parser import parse_judgment_query


def _session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )


def _add_document(
    session_factory,
    *,
    jid: str,
    text: str,
    jdate: str = "20260101",
    title: str = "返還借款",
) -> None:
    with session_factory() as session:
        session.add(
            JudgmentDocument(
                jid=jid,
                jyear="114",
                jcase="訴",
                jno=jid.split(",")[3],
                jdate=jdate,
                court="臺灣臺北地方法院民事",
                court_normalized="臺灣臺北地方法院",
                title=title,
                full_text=text,
                full_text_length=len(text),
                content_hash=jid,
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()


def test_extracts_external_phrase_after_court_year_and_registry_terms() -> None:
    question = "士林地方法院在1995到2000年間有什麼和借款糾紛相關的案子?"
    parsed = parse_judgment_query(question)
    terms = extract_scope_terms(question, parsed)
    assert [(term.term, term.scope) for term in terms] == [
        ("借款糾紛", "external")
    ]


def test_extracts_registry_candidate_and_keeps_must_term_separate() -> None:
    candidate_question = "臺灣臺北地方法院2000年關係人交易案件"
    candidate_terms = extract_scope_terms(
        candidate_question, parse_judgment_query(candidate_question)
    )
    assert [(term.term, term.scope) for term in candidate_terms] == [
        ("關係人交易", "registry_candidate")
    ]

    must_question = "士林地方法院在1995到2000年間有什麼和違約交割相關的案子?"
    must_terms = extract_scope_terms(
        must_question, parse_judgment_query(must_question)
    )
    assert [(term.term, term.scope) for term in must_terms] == [
        ("違約交割", "must")
    ]


def test_extracts_multiple_external_phrases_deterministically() -> None:
    question = "士林地方法院2000年借款糾紛與票據糾紛有哪些"
    terms = extract_scope_terms(question, parse_judgment_query(question))
    assert [term.term for term in terms] == ["借款糾紛", "票據糾紛"]


def test_probe_counts_only_normalized_exact_phrase_in_scope() -> None:
    session_factory = _session_factory()
    _add_document(
        session_factory,
        jid="TPDV,114,訴,9,20260101,1",
        text="原告主張兩造間有借款糾紛，借款糾紛的金額為一百萬元。",
    )
    _add_document(
        session_factory,
        jid="TPDV,114,訴,10,20260101,1",
        text="原告主張返還借款，兩造間沒有系爭字樣。",
    )
    parsed = parse_judgment_query("臺灣臺北地方法院2026年借款糾紛案件")
    result = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=parsed,
        terms=[ScopeTerm(term="借款糾紛", scope="external")],
    )
    assert len(result.terms) == 1
    assert result.terms[0].document_count == 1
    assert result.terms[0].occurrence_count == 2
    assert result.terms[0].matched_jids == (
        "TPDV,114,訴,9,20260101,1",
    )
    assert result.zero_terms == ()

    court_only = parse_judgment_query("臺灣臺北地方法院借款糾紛案件")
    court_result = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=court_only,
        terms=[ScopeTerm(term="借款糾紛", scope="external")],
    )
    assert court_result.status == "ok"
    assert court_result.terms[0].document_count == 1

    year_only = parse_judgment_query("2026年借款糾紛案件")
    year_result = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=year_only,
        terms=[ScopeTerm(term="借款糾紛", scope="external")],
    )
    assert year_result.status == "ok"
    assert year_result.terms[0].document_count == 1

    too_large = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=court_only,
        terms=[ScopeTerm(term="借款糾紛", scope="external")],
        max_scope_documents=1,
    )
    assert too_large.status == "scope_too_large"
    assert too_large.skipped is True

    too_many = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=court_only,
        terms=[ScopeTerm(term="借款糾紛", scope="external")],
        max_hit_documents=0,
    )
    assert too_many.status == "too_many_hits"
    assert too_many.skipped is True

    wildcard = probe_scope_terms(
        session_factory=session_factory,
        parsed_query=court_only,
        terms=[ScopeTerm(term="借款%", scope="external")],
    )
    assert wildcard.terms[0].document_count == 0
