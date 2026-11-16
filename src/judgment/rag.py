from __future__ import annotations

import json
import logging
import math
import re
import time
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

import httpx
from sqlalchemy import func, or_, select

from .config import Settings
from .embeddings import EmbeddingError, OllamaEmbedder
from .judgment_citations import law_citations_for_record
from .judgment_index import index_coverage
from .index_versions import active_version
from .law_rag import (
    LAW_ALIASES,
    _article_ref_key,
    _extract_article_refs,
    build_insurance_responsibility_framework,
    extract_stat_entity,
    is_article_count_question,
    is_citation_stats_question,
    is_history_question,
    is_law_first_question,
    is_related_laws_question,
    judgment_law_stats,
    law_source_text,
    law_sources_for_question,
    structured_law_answer,
)
from .legal_term_probe import (
    ScopeProbeResult,
    extract_scope_terms,
    probe_scope_terms,
)
from .legal_terms import (
    LegalTerm,
    detect_exact_terms,
    expand_semantic_query,
    phrases_for_terms,
)
from .llm_backends import (
    chat_content,
    chat_payload,
    chat_providers,
    chat_url,
    chat_usage,
    is_openai_api,
    stream_delta,
)
from .models import JudgmentDocument
from .observability import trace_segment, traced
from .query_plan import build_query_plan
from .query_parser import (
    LIST_ANALYSIS_TERMS,
    build_query_filter,
    is_structured_case_list,
    parse_judgment_query,
    violations,
)
from .rerank import RerankOutcome, RerankResult, RerankerClient
from .text_normalization import normalize_for_match, normalize_with_offsets
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "你是法律資料檢索助理。只能根據下方提供的判決片段、法規與命令內容回答，"
    "不得使用資料以外的知識，也不得創造案號、法院、日期或法條。"
    "引用條文時必須完整保留來源的條號，包括「之幾」與連字號，"
    "例如來源是第 157-1 條時不得寫成第 157 條。"
    "每個結論後必須標註對應來源編號，例如 [1]；回答時要區分判決、法規與命令。"
    "若資料不足以回答，請直接說明「檢索到的資料不足以回答」，不要猜測。"
    "回答使用繁體中文，2 到 4 句，並提醒這不是法律意見。"
)

_CASE_NO_RE = re.compile(r"\b[A-Z]{2,6},\d{2,3},[^,\s]+,\d+,\d{8},\d+\b")
_CITATION_RE = re.compile(r"\[(\d{1,2}(?:\s*[,，、]\s*\d{1,2})*)\]")
_CITATION_NUMBER_RE = re.compile(r"\d{1,2}")
_INSUFFICIENT_RE = re.compile(r"(不足以回答|無法回答|沒有足夠|查無相關|未提及|無法判斷)")
_LIST_ALL_TERMS_RE = re.compile(
    r"(所有|全部|完整|逐一|逐筆|全數|不限|列出|列舉|清單|清冊)"
)
_LIST_CASE_SCOPE_RE = re.compile(r"(判決|案件|案例|案子|裁判|結果)")
_LIST_ALL_EN_RE = re.compile(
    r"\b(?:all|every|complete|full)\b.{0,24}\b(?:judg(?:ment|ments)?|cases?|results?)\b"
    r"|\blist\s+all\b",
    re.IGNORECASE,
)


def is_list_all_question(question: str) -> bool:
    """Detect explicit requests for an exhaustive judgment/case list."""

    text = str(question or "").strip()
    if not text:
        return False
    if _LIST_ALL_EN_RE.search(text):
        return True
    return bool(
        _LIST_ALL_TERMS_RE.search(text)
        and _LIST_CASE_SCOPE_RE.search(text)
    )


_LIST_DIRECT_CASE_RE = re.compile(
    r"(判決|案件|案例|裁判|結果).{0,3}(?:有哪些|有那些|哪幾個|哪些|幾件|幾筆)"
)
_LIST_LEAD_CASE_RE = re.compile(
    r"(?:有哪些|有那些|哪幾個|哪些|列出|列舉|清單).{0,12}"
    r"(判決|案件|案例|裁判|結果)"
)
def is_judgment_list_question(question: str) -> bool:
    """Return True when the user asks for one or more judgments."""

    text = str(question or "").strip()
    if not text or not _LIST_CASE_SCOPE_RE.search(text):
        return False
    if _LIST_ALL_TERMS_RE.search(text):
        return True
    direct = bool(_LIST_DIRECT_CASE_RE.search(text))
    lead = bool(_LIST_LEAD_CASE_RE.search(text))
    if not direct and not lead:
        return is_structured_case_list(text)
    if any(term in text for term in LIST_ANALYSIS_TERMS) and not re.search(
        r"(列出|列舉|清單)", text
    ):
        return False
    return True


def _mentions_law(question: str, law_name: str) -> bool:
    text = str(question or "")
    name = str(law_name or "").strip()
    if not text or not name:
        return False
    if name in text:
        return True
    return any(
        alias in text
        for alias, canonical in LAW_ALIASES.items()
        if canonical == name
    )


def _list_query_notice(
    question: str,
    retrieval: Dict[str, Any],
    shown_count: int,
) -> str:
    if not is_list_all_question(question):
        return ""
    unique = int(retrieval.get("unique_judgments") or 0)
    shown = max(0, int(shown_count or 0))
    if unique and shown and unique > shown:
        scope = (
            f"本次檢索共有 {unique:,} 筆候選判決，RAG 只保留前 {shown:,} 筆。"
        )
    elif shown:
        scope = f"RAG 只保留語意最相關的前 {shown:,} 筆判決。"
    else:
        scope = "RAG 只會回傳語意最相關的少量判決。"
    return (
        f"此問題要求列出全部判決；{scope}"
        "若要查詢全部符合條件的判決，請改用「資料庫查詢」頁面的判決分類，"
        "以案由、關鍵字與裁判日期範圍篩選，並使用分頁或匯出 CSV／JSON。"
    )


def _elapsed_ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)


def _ns_to_ms(value: Any) -> Optional[float]:
    try:
        return round(float(value) / 1_000_000, 2)
    except (TypeError, ValueError):
        return None


@traced(
    "rag.preview_fallback",
    module=__name__,
    params_fn=lambda question, **_: {"question_length": len(question or "")},
)
def _preview_fallback(
    *,
    session_factory,
    question: str,
    started: float,
    notice: str,
    retrieval: Dict[str, Any],
    coverage: Dict[str, Any],
) -> Dict[str, Any]:
    from .web.query import rag_preview

    payload = rag_preview(
        session_factory=session_factory,
        question=question,
        limit=3,
    )
    payload["status"] = "preview"
    list_notice = _list_query_notice(question, retrieval, 0)
    payload["notice"] = (
        f"{notice} {list_notice}".strip() if list_notice else notice
    )
    payload["retrieval"] = retrieval
    payload["coverage"] = coverage
    payload["judgments"] = []
    payload["duration_ms"] = _elapsed_ms(started)
    return payload


def _question_terms(question: str) -> List[str]:
    terms: List[str] = []
    seen = set()
    compact = normalize_for_match(question)
    for chunk in re.findall(r"[\u4e00-\u9fffA-Za-z0-9]{2,}", compact):
        if re.search(r"[\u4e00-\u9fff]", chunk):
            pieces = [chunk[index : index + 2] for index in range(len(chunk) - 1)]
        else:
            pieces = [chunk.lower()]
        for piece in pieces:
            if piece not in seen:
                seen.add(piece)
                terms.append(piece)
    return [term for term in terms if term not in {"如何", "什麼", "哪些", "規定", "問題"}]


def _paragraph_score(paragraph: str, terms: Sequence[str]) -> int:
    return sum(len(term) * paragraph.count(term) for term in terms)


@traced(
    "rag.extract_excerpt",
    module=__name__,
    params_fn=lambda text, question, *, budget=1200: {
        "text_length": len(text or ""),
        "question_length": len(question or ""),
        "budget": budget,
    },
)
def extract_excerpt(text: str, question: str, *, budget: int = 1200) -> str:
    text = str(text or "")
    if not text:
        return ""
    paragraphs = [item.strip() for item in re.split(r"\n+", text) if item.strip()]
    if not paragraphs:
        return text[:budget]
    terms = _question_terms(question)
    normalized_paragraphs = [
        normalize_for_match(paragraph) for paragraph in paragraphs
    ]
    scored = []
    for index, paragraph in enumerate(paragraphs):
        window = normalized_paragraphs[index]
        if index > 0:
            window = normalized_paragraphs[index - 1] + window
        if index + 1 < len(normalized_paragraphs):
            window += normalized_paragraphs[index + 1]
        scored.append(
            (index, _paragraph_score(window, terms), paragraph)
        )
    ranked = sorted(scored, key=lambda item: (-item[1], item[0]))
    selected: List[Tuple[int, str]] = []
    total = 0
    for index, score, paragraph in ranked:
        if score <= 0 and selected:
            break
        clipped = paragraph[: max(120, budget // 2)]
        if total + len(clipped) > budget:
            continue
        selected.append((index, clipped))
        total += len(clipped)
        if total >= budget * 0.85:
            break
    if not selected:
        selected = [(0, text[:budget])]
    selected.sort(key=lambda item: item[0])
    return "\n".join(paragraph for _, paragraph in selected)[:budget]


@traced(
    "rag.fetch_documents",
    module=__name__,
    params_fn=lambda session_factory, jids: {"jid_count": len(jids or [])},
)
def _fetch_documents(session_factory, jids: Sequence[str]) -> Dict[str, JudgmentDocument]:
    if not jids:
        return {}
    with trace_segment(
        "rag.postgres_fetch",
        module=__name__,
        function="Session.scalars",
        params={"jid_count": len(jids)},
    ):
        with session_factory() as session:
            records = session.scalars(
                select(JudgmentDocument).where(
                    JudgmentDocument.jid.in_(list(jids)),
                    JudgmentDocument.is_current.is_(True),
                )
            ).all()
    return {record.jid: record for record in records}


def _rerank_text(
    record: JudgmentDocument,
    question: str,
    *,
    max_chars: int,
) -> str:
    heading = " ".join(
        value
        for value in (
            str(record.court_normalized or "").strip(),
            str(record.title or "").strip(),
        )
        if value
    )
    excerpt = extract_excerpt(
        record.full_text or "",
        question,
        budget=max(200, int(max_chars)),
    )
    text = "\n".join(value for value in (heading, excerpt) if value)
    return text[: max(200, int(max_chars))]


def _rerank_hits(
    *,
    settings: Settings,
    question: str,
    hits: Sequence[Dict[str, Any]],
    documents: Dict[str, JudgmentDocument],
) -> Tuple[List[Dict[str, Any]], RerankOutcome]:
    """Rerank candidate hits, falling back to the original vector order."""

    fallback_hits = list(hits[: max(1, settings.rag_top_k)])
    client = RerankerClient(
        [settings.rerank_url, settings.rerank_fallback_url],
        model=settings.rerank_model,
        timeout=settings.rerank_timeout_seconds,
        connect_timeout=settings.rerank_connect_timeout_seconds,
    )
    if not client.configured:
        return fallback_hits, RerankOutcome(
            status="disabled",
            model=settings.rerank_model,
            candidate_count=len(hits),
        )
    if not hits:
        return [], RerankOutcome(
            status="empty",
            model=settings.rerank_model,
            candidate_count=0,
        )

    candidate_hits: List[Dict[str, Any]] = []
    documents_for_rerank: List[str] = []
    for hit in hits:
        jid = str((hit.get("payload") or {}).get("jid") or "")
        record = documents.get(jid)
        if record is None:
            continue
        text = _rerank_text(
            record,
            question,
            max_chars=settings.rerank_max_chars,
        )
        if not text.strip():
            continue
        candidate_hits.append(hit)
        documents_for_rerank.append(text)
    if not documents_for_rerank:
        return fallback_hits, RerankOutcome(
            status="empty",
            model=settings.rerank_model,
            candidate_count=0,
        )

    outcome = client.rerank(
        question,
        documents_for_rerank,
        top_n=settings.rag_top_k,
    )
    if outcome.status != "ok":
        return fallback_hits, outcome

    reranked: List[Dict[str, Any]] = []
    for rank, result in enumerate(outcome.results, start=1):
        if not 0 <= result.index < len(candidate_hits):
            continue
        hit = dict(candidate_hits[result.index])
        hit["vector_score"] = float(hit.get("score") or 0)
        hit["rerank_score"] = float(result.score)
        hit["rerank_rank"] = rank
        reranked.append(hit)
    if not reranked:
        return fallback_hits, RerankOutcome(
            status="degraded",
            model=outcome.model,
            provider=outcome.provider,
            url=outcome.url,
            fallback_used=outcome.fallback_used,
            latency_ms=outcome.latency_ms,
            candidate_count=outcome.candidate_count,
            errors=outcome.errors + ["rerank returned no usable indexes"],
        )
    return reranked, outcome


def _trim_law_sources(
    law_sources: Sequence[Dict[str, Any]],
    article_limit: int,
) -> List[Dict[str, Any]]:
    limit = max(0, int(article_limit))
    return [
        {
            **source,
            "articles": list(source.get("articles") or [])[:limit],
        }
        for source in law_sources
    ]


def _rerank_law_sources(
    *,
    settings: Settings,
    question: str,
    law_sources: Sequence[Dict[str, Any]],
    article_limit: int,
) -> Tuple[List[Dict[str, Any]], RerankOutcome]:
    """Rerank law and order article candidates in separate groups.

    Law articles and order articles have different citation conventions and
    are retrieved from different source records.  Sending them through one
    cross-encoder batch lets a long order outrank a directly applicable
    statute, so each ``source_type`` gets its own rerank request and metadata.
    """

    fallback = _trim_law_sources(law_sources, article_limit)
    client = RerankerClient(
        [settings.rerank_url, settings.rerank_fallback_url],
        model=settings.rerank_model,
        timeout=settings.rerank_timeout_seconds,
        connect_timeout=settings.rerank_connect_timeout_seconds,
    )
    if not client.configured:
        return fallback, RerankOutcome(
            status="disabled",
            model=settings.rerank_model,
            candidate_count=0,
        )

    groups: Dict[str, List[int]] = {}
    for source_index, source in enumerate(law_sources):
        source_type = str(source.get("source_type") or "law").strip() or "law"
        groups.setdefault(source_type, []).append(source_index)

    law_max_chars = max(200, int(settings.rag_law_rerank_max_chars))
    explicit_refs = _extract_article_refs(question)
    weight = max(0.0, min(1.0, float(settings.rag_law_rerank_weight)))
    reranked_articles: Dict[int, List[Dict[str, Any]]] = {}
    group_metadata: List[Dict[str, Any]] = []
    merged_results: List[RerankResult] = []
    merged_errors: List[str] = []
    merged_usage: Dict[str, Any] = {}
    statuses: List[str] = []
    merged_candidates = 0
    merged_selected = 0
    merged_latency = 0
    merged_model = ""
    provider = ""
    url = ""
    fallback_used = False
    flat_offset = 0

    for source_type, source_indexes in groups.items():
        documents: List[str] = []
        positions: List[Tuple[int, int]] = []
        for source_index in source_indexes:
            source = law_sources[source_index]
            for article_index, article in enumerate(
                source.get("articles") or []
            ):
                # Score the provision text itself.  Repeating the law name in
                # every document makes the cross-encoder over-weight generic
                # articles that merely mention the statute.
                text = str(article.get("article_content") or "").strip()
                if not text:
                    text = (
                        f"{source.get('law_name') or ''} "
                        f"{article.get('article_no') or ''}"
                    ).strip()
                if not text:
                    continue
                documents.append(text[:law_max_chars])
                positions.append((source_index, article_index))

        if not documents:
            statuses.append("empty")
            group_metadata.append(
                {
                    "source_type": source_type,
                    "status": "empty",
                    "model": settings.rerank_model,
                    "provider": "",
                    "url": "",
                    "candidate_count": 0,
                    "selected_count": 0,
                    "latency_ms": 0,
                    "fallback_used": False,
                    "top_score": None,
                    "errors": [],
                }
            )
            for source_index in source_indexes:
                reranked_articles[source_index] = list(
                    law_sources[source_index].get("articles") or []
                )[: max(0, int(article_limit))]
            continue

        outcome = client.rerank(
            question,
            documents,
            top_n=len(documents),
        )
        statuses.append(outcome.status)
        merged_candidates += outcome.candidate_count
        merged_selected += outcome.selected_count
        merged_latency += outcome.latency_ms
        merged_errors.extend(outcome.errors)
        if outcome.usage:
            merged_usage.update(outcome.usage)
        if not merged_model and outcome.model:
            merged_model = outcome.model
        if not provider and outcome.provider:
            provider = outcome.provider
        if not url and outcome.url:
            url = outcome.url
        fallback_used = fallback_used or outcome.fallback_used
        for result in outcome.results:
            merged_results.append(
                RerankResult(
                    index=flat_offset + result.index,
                    score=result.score,
                )
            )
        flat_offset += len(documents)
        group_top_score = max(
            (result.score for result in outcome.results),
            default=None,
        )
        group_metadata.append(
            {
                "source_type": source_type,
                "status": outcome.status,
                "model": outcome.model,
                "provider": outcome.provider,
                "url": outcome.url,
                "candidate_count": outcome.candidate_count,
                "selected_count": outcome.selected_count,
                "latency_ms": outcome.latency_ms,
                "fallback_used": outcome.fallback_used,
                "top_score": (
                    round(float(group_top_score), 4)
                    if group_top_score is not None
                    else None
                ),
                "errors": list(outcome.errors),
            }
        )

        if outcome.status != "ok":
            for source_index in source_indexes:
                reranked_articles[source_index] = list(
                    law_sources[source_index].get("articles") or []
                )[: max(0, int(article_limit))]
            continue

        rerank_rank: Dict[Tuple[int, int], int] = {}
        for rank, result in enumerate(outcome.results):
            if 0 <= result.index < len(positions):
                rerank_rank[positions[result.index]] = rank
        rank_span = max(1, len(documents) - 1)
        for source_index in source_indexes:
            articles = list(law_sources[source_index].get("articles") or [])
            ordered = sorted(
                enumerate(articles),
                key=lambda pair: (
                    0
                    if _article_ref_key(pair[1].get("article_no"))
                    in explicit_refs
                    else 1,
                    # Blend normalized pre-rerank and rerank ranks.  The BM25
                    # / hybrid order remains an anchor so the cross-encoder
                    # can improve the order without dropping the strongest
                    # matches.
                    (1.0 - weight) * (pair[0] / rank_span)
                    + weight
                    * (
                        rerank_rank.get(
                            (source_index, pair[0]),
                            len(documents) + pair[0],
                        )
                        / rank_span
                    ),
                    pair[0],
                ),
            )
            reranked_articles[source_index] = [
                article
                for _, article in ordered[: max(0, int(article_limit))]
            ]

    reranked: List[Dict[str, Any]] = [
        {
            **source,
            "articles": reranked_articles.get(
                source_index,
                list(source.get("articles") or [])[: max(0, int(article_limit))],
            ),
        }
        for source_index, source in enumerate(law_sources)
    ]
    if all(status == "empty" for status in statuses):
        status = "empty"
    elif any(status == "degraded" for status in statuses):
        status = "degraded"
    else:
        status = "ok"
    merged_results.sort(key=lambda result: (-result.score, result.index))
    return reranked, RerankOutcome(
        status=status,
        results=merged_results,
        model=merged_model or settings.rerank_model,
        provider=provider,
        url=url,
        fallback_used=fallback_used,
        latency_ms=merged_latency,
        candidate_count=merged_candidates,
        selected_count=merged_selected,
        errors=merged_errors,
        usage=merged_usage,
        groups=group_metadata,
    )


def _embed_question(
    *,
    settings: Settings,
    question: str,
    embedder: OllamaEmbedder,
) -> List[float]:
    """Embed one question so judgment and law searches share the vector."""

    with trace_segment(
        "rag.embed_query",
        module=__name__,
        function="OllamaEmbedder.embed_query",
        params={
            "model": settings.embedding_model,
            "question_length": len(question),
        },
    ) as embed_segment:
        vector = embedder.embed_query(question)
        if embed_segment is not None:
            embed_segment["metadata"].update(
                dict(getattr(embedder, "last_call", {}) or {})
            )
    return vector


@traced(
    "rag.search",
    module=__name__,
    params_fn=lambda *, question, settings, collection=None, limit=None, **_: {
        "question_length": len(question or ""),
        "collection": collection or settings.judgment_vector_collection,
        "embedding_model": settings.embedding_model,
        "top_k": limit or settings.rag_top_k,
        "score_threshold": settings.rag_score_threshold,
    },
)
def _lexical_tokens(text: str) -> List[str]:
    lowered = normalize_for_match(text).lower()
    tokens = re.findall(r"[a-z0-9]+", lowered)
    for run in re.findall(r"[\u4e00-\u9fff]+", lowered):
        if len(run) == 1:
            tokens.append(run)
            continue
        tokens.extend(run[index : index + 2] for index in range(len(run) - 1))
    return tokens


def _apply_lexical_rrf(
    hits: Sequence[Dict[str, Any]],
    question: str,
    *,
    rrf_k: int = 60,
    lexical_weight: float = 2.0,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """Fuse dense rank with a BM25-style lexical score over dense candidates.

    This is P1: the existing collection is dense-only, so lexical scoring is
    applied to the candidate set and fused with weighted Reciprocal Rank
    Fusion.  A true sparse/BM25 index is P1.5 and requires reindexing.
    """

    query_tokens = _lexical_tokens(question)
    if not hits or not query_tokens:
        return list(hits), {
            "method": "dense_lexical_rrf",
            "applied": False,
            "reason": "empty_candidates_or_query",
            "candidates": len(hits),
        }
    documents: List[List[str]] = []
    for hit in hits:
        payload = hit.get("payload") or {}
        text = " ".join(
            str(value or "")
            for value in (
                payload.get("title"),
                payload.get("court"),
                " ".join(payload.get("matched_laws") or []),
                payload.get("snippet"),
            )
        )
        documents.append(_lexical_tokens(text))
    lengths = [max(1, len(tokens)) for tokens in documents]
    average_length = sum(lengths) / len(lengths)
    document_frequency = {
        token: sum(1 for tokens in documents if token in set(tokens))
        for token in set(query_tokens)
    }
    total_documents = len(documents)
    k1 = 1.5
    b = 0.75
    lexical_scores: List[float] = []
    for tokens, length in zip(documents, lengths):
        counts = {}
        for token in tokens:
            counts[token] = counts.get(token, 0) + 1
        score = 0.0
        for token in set(query_tokens):
            frequency = counts.get(token, 0)
            if not frequency:
                continue
            df = document_frequency.get(token, 0)
            idf = math.log(
                1.0 + (total_documents - df + 0.5) / (df + 0.5)
            )
            denominator = frequency + k1 * (
                1.0 - b + b * length / average_length
            )
            score += idf * frequency * (k1 + 1.0) / denominator
        lexical_scores.append(score)
    max_score = max(lexical_scores) if lexical_scores else 0.0
    if max_score <= 0:
        return list(hits), {
            "method": "dense_lexical_rrf",
            "applied": False,
            "reason": "no_lexical_match",
            "candidates": len(hits),
        }
    dense_rank = {index: index for index in range(len(hits))}
    lexical_order = sorted(
        range(len(hits)), key=lambda index: (-lexical_scores[index], index)
    )
    lexical_rank = {
        index: rank for rank, index in enumerate(lexical_order)
    }
    fused = []
    for index, hit in enumerate(hits):
        score = 1.0 / (rrf_k + dense_rank[index] + 1) + lexical_weight / (
            rrf_k + lexical_rank[index] + 1
        )
        enriched = dict(hit)
        enriched["_lexical_score"] = round(lexical_scores[index], 6)
        enriched["_rrf_score"] = round(score, 8)
        fused.append(enriched)
    fused.sort(
        key=lambda item: float(item.get("_rrf_score") or 0),
        reverse=True,
    )
    return fused, {
        "method": "dense_lexical_rrf",
        "applied": True,
        "rrf_k": rrf_k,
        "lexical_weight": lexical_weight,
        "candidates": len(hits),
        "lexical_matches": sum(1 for score in lexical_scores if score > 0),
        "top_lexical_score": round(max_score, 6),
    }


def _search_hits(
    *,
    settings: Settings,
    question: str,
    store: QdrantStore,
    embedder: OllamaEmbedder,
    collection: Optional[str] = None,
    limit: Optional[int] = None,
    vector: Optional[Sequence[float]] = None,
    query_filter: Optional[Dict[str, Any]] = None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    collection = collection or settings.judgment_vector_collection
    search_limit = max(1, int(limit or settings.rag_top_k))
    if not vector:
        vector = _embed_question(
            settings=settings,
            question=question,
            embedder=embedder,
        )
    started = time.perf_counter()
    with trace_segment(
        "rag.qdrant_search",
        module=__name__,
        function="QdrantStore.search",
        params={
            "collection": collection,
            "limit": search_limit,
            "score_threshold": settings.rag_score_threshold,
        },
    ) as qdrant_segment:
        hits = store.search(
            collection,
            vector,
            limit=search_limit,
            score_threshold=settings.rag_score_threshold,
            query_filter=query_filter,
        )
    latency_ms = _elapsed_ms(started)
    deduped: List[Dict[str, Any]] = []
    seen = set()
    for hit in hits:
        payload = hit.get("payload") or {}
        jid = str(payload.get("jid") or "")
        if not jid or jid in seen:
            continue
        seen.add(jid)
        deduped.append(hit)
    if qdrant_segment is not None:
        qdrant_segment["metadata"].update(
            {
                "collection": collection,
                "filter": {
                    "score_threshold": settings.rag_score_threshold,
                    **(query_filter or {}),
                },
                "top_k": search_limit,
                "hits": len(hits),
                "unique_judgments": len(deduped),
                "top_score": (
                    round(float(deduped[0].get("score") or 0), 4)
                    if deduped
                    else None
                ),
            }
        )
    return deduped, {
        "status": "ok",
        "latency_ms": latency_ms,
        "top_k": search_limit,
        "candidate_k": search_limit,
        "score_threshold": settings.rag_score_threshold,
        "hits": len(hits),
        "unique_judgments": len(deduped),
        "top_score": round(float(deduped[0].get("score") or 0), 4) if deduped else None,
    }


@traced(
    "rag.law_vector_search",
    module=__name__,
    params_fn=lambda *, settings, question, **_: {
        "question_length": len(question or ""),
        "alias": settings.legal_article_vector_alias,
        "candidate_k": settings.rag_law_vector_candidates,
        "score_threshold": settings.rag_law_score_threshold,
    },
)
def _search_legal_articles(
    *,
    settings: Settings,
    question: str,
    store: QdrantStore,
    vector: Sequence[float],
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    alias = settings.legal_article_vector_alias
    collection = settings.legal_article_vector_collection
    alias_target: Optional[str] = None
    try:
        alias_target = store.get_alias(alias)
    except Exception:
        alias_target = None
    search_name = alias if alias_target else collection
    try:
        info = store.collection_info(search_name)
    except Exception as exc:
        return [], {
            "status": "degraded",
            "alias": alias,
            "collection": search_name,
            "error": f"{exc.__class__.__name__}: {exc}",
        }
    if info is None:
        return [], {
            "status": "not_indexed",
            "alias": alias,
            "collection": search_name,
        }

    search_limit = max(1, int(settings.rag_law_vector_candidates))
    started = time.perf_counter()
    try:
        hits = store.search(
            search_name,
            vector,
            limit=search_limit,
            score_threshold=settings.rag_law_score_threshold,
        )
    except Exception as exc:
        return [], {
            "status": "degraded",
            "alias": alias,
            "collection": search_name,
            "candidate_k": search_limit,
            "error": f"{exc.__class__.__name__}: {exc}",
        }
    latency_ms = _elapsed_ms(started)
    deduped: List[Dict[str, Any]] = []
    seen = set()
    for hit in hits:
        payload = hit.get("payload") or {}
        law_name = str(payload.get("law_name") or "").strip()
        article_no = str(payload.get("article_no") or "").strip()
        if not law_name or not article_no:
            continue
        key = (
            str(payload.get("law_key") or law_name),
            str(payload.get("article_type") or ""),
            article_no,
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(hit)
    laws: Dict[str, Dict[str, Any]] = {}
    for hit in deduped:
        payload = hit.get("payload") or {}
        law_name = str(payload.get("law_name") or "")
        entry = laws.setdefault(
            law_name,
            {
                "law_name": law_name,
                "source_type": payload.get("source_type"),
                "hits": 0,
                "top_score": 0.0,
            },
        )
        entry["hits"] = int(entry["hits"]) + 1
        entry["top_score"] = max(
            float(entry["top_score"]),
            float(hit.get("score") or 0),
        )
    ranked_laws = sorted(
        laws.values(),
        key=lambda item: (
            -float(item.get("top_score") or 0),
            str(item.get("law_name") or ""),
        ),
    )
    top_score = (
        round(float(deduped[0].get("score") or 0), 4)
        if deduped
        else None
    )
    return deduped, {
        "status": "ok",
        "alias": alias,
        "alias_target": alias_target,
        "collection": search_name,
        "latency_ms": latency_ms,
        "candidate_k": search_limit,
        "score_threshold": settings.rag_law_score_threshold,
        "hits": len(hits),
        "unique_articles": len(deduped),
        "law_count": len(ranked_laws),
        "laws": [
            {
                "law_name": item["law_name"],
                "source_type": item.get("source_type"),
                "hits": item["hits"],
                "top_score": round(float(item["top_score"]), 4),
            }
            for item in ranked_laws[:8]
        ],
        "top_score": top_score,
    }


@traced(
    "rag.build_citations",
    module=__name__,
    params_fn=lambda *, hits, question, max_context_chars, **_: {
        "hit_count": len(hits or []),
        "question_length": len(question or ""),
        "max_context_chars": max_context_chars,
    },
)
def _build_citations(
    *,
    hits: Sequence[Dict[str, Any]],
    documents: Dict[str, JudgmentDocument],
    question: str,
    max_context_chars: int,
    start_index: int = 1,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    citations: List[Dict[str, Any]] = []
    contexts: List[Dict[str, Any]] = []
    budget = max(600, int(max_context_chars) // max(1, len(hits)))
    budget = min(1600, budget)
    for index, hit in enumerate(hits, start=start_index):
        payload = hit.get("payload") or {}
        jid = str(payload.get("jid") or "")
        record = documents.get(jid)
        if record is None:
            continue
        excerpt = extract_excerpt(record.full_text or "", question, budget=budget)
        citation = {
            "index": index,
            "jid": record.jid,
            "court": record.court_normalized or payload.get("court") or "",
            "jdate": record.jdate,
            "title": record.title,
            "score": round(float(hit.get("score") or 0), 4),
            "snippet": excerpt[:420],
            "matched_laws": list(record.matched_laws or []),
            "law_citations": [
                {
                    "law_name": item["law_name"],
                    "article_no": item["article_no"],
                    "paragraphs": list(item.get("paragraphs") or []),
                }
                for item in law_citations_for_record(record)
            ],
            "citation_count": int(record.citation_count or 0),
            "pdf_url": record.pdf_url or "",
        }
        citations.append(citation)
        contexts.append(
            {
                "index": index,
                "jid": record.jid,
                "court": citation["court"],
                "jdate": record.jdate,
                "title": record.title,
                "matched_laws": citation["matched_laws"],
                "text": excerpt,
            }
        )
    return citations, contexts


def _law_answer_summary(law_sources: Sequence[Dict[str, Any]]) -> str:
    """Summarize the law/order retrieval result before the LLM answer."""
    if not law_sources:
        return ""
    lines = []
    for source in law_sources:
        label = source.get("source_label") or (
            "命令" if source.get("source_type") == "order" else "法規"
        )
        line = (
            f"- {source.get('law_name') or '未命名法規'}"
            f"（{label}，{int(source.get('article_count') or 0)} 條）"
        )
        article_nos = [
            str(article.get("article_no") or "").strip()
            for article in (source.get("articles") or [])
            if str(article.get("article_no") or "").strip()
        ]
        if article_nos:
            line += "；相關條文：" + "、".join(article_nos)
        if source.get("index") is not None:
            line += f" [{source['index']}]"
        lines.append(line)
    return "\n".join(lines)


def _retrieval_answer(
    citations: Sequence[Dict[str, Any]],
    law_sources: Sequence[Dict[str, Any]] = (),
) -> str:
    parts: List[str] = []
    if law_sources:
        first_law = law_sources[0]
        parts.append(
            f"在目前法規資料庫中，最相關的是「{first_law['law_name']}」"
            f"（{first_law.get('source_label') or '法規'}，"
            f"{int(first_law.get('article_count') or 0)} 條）。"
        )
    if citations:
        first = citations[0]
        parts.append(
            f"在目前索引的判決中，最相關的是「{first['jid']}」"
            f"（{first['court'] or '法院未知'}，{first['jdate'] or '日期未知'}，"
            f"案由：{first['title'] or '未載明'}）。"
        )
    if not parts:
        return "目前沒有可引用的法規、命令或判決片段。"
    parts.append(
        f"共檢索到 {len(law_sources)} 筆法規／命令與 {len(citations)} 筆判決片段；"
        "以下引用皆可回到原始資料核對。"
    )
    return "".join(parts)


_BOILERPLATE_SENTENCE_RE = re.compile(
    r"(公\s*訴\s*人|聲\s*請\s*人|檢\s*察\s*官|本院判決如下|"
    r"如不服本判決|書記官|中華民國|地方檢察署|上訴狀|判決如主文|"
    r"逕送上級法院|上列被告因|經檢察官提起公訴|案經|移送併辦|起訴書)"
)
_SNIPPET_FACT_TERMS = (
    "詐騙",
    "詐欺",
    "被害人",
    "告訴人",
    "匯款",
    "提款",
    "車手",
    "集團",
    "犯罪所得",
    "沒收",
    "洗錢",
    "有期徒刑",
    "判刑",
    "處刑",
    "面交",
    "帳戶",
)


def _best_judgment_snippet(
    text: str,
    question: str,
    *,
    limit: int = 170,
) -> str:
    """Pick the sentence that best matches the question.

    PDF-derived judgment text contains hard line breaks in the middle of
    sentences.  Matching uses normalized text, but the returned snippet keeps
    readable spaces between Latin words and amounts.  Factual sentences (fraud
    method, victim, cash flow, sentence) win over procedural boilerplate such
    as the prosecutor or appeal notice.
    """

    raw = str(text or "")
    if not raw:
        return ""
    display = re.sub(r"[ \t]*\r?\n[ \t]*", " ", raw)
    display = re.sub(r"[ \t]+", " ", display).strip()
    # Join PDF line breaks inside Chinese words, but keep spaces between
    # Latin words and amounts (e.g. "Telegram 暱稱", "10 萬元").
    display = re.sub(
        r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", display
    )
    if not display:
        return ""
    sentences = [
        sentence.strip()
        for sentence in re.split(r"(?<=[。！？])", display)
        if len(normalize_for_match(sentence)) >= 12
    ]
    terms = _question_terms(question)
    best = ""
    best_score = -1
    for sentence in sentences:
        normalized = normalize_for_match(sentence)
        fact_hits = sum(
            1 for term in _SNIPPET_FACT_TERMS if term in normalized
        )
        score = fact_hits * 4 + min(
            _paragraph_score(normalized, terms), 12
        )
        boilerplate = bool(_BOILERPLATE_SENTENCE_RE.search(normalized))
        if boilerplate:
            score -= 6
            if fact_hits == 0:
                continue
        if score > best_score:
            best = sentence
            best_score = score
    if not best:
        best = display
    if len(best) > limit:
        best = best[:limit].rstrip() + "…"
    return best


def _judgment_list_answer(
    question: str,
    citations: Sequence[Dict[str, Any]],
    documents: Optional[Dict[str, JudgmentDocument]] = None,
    *,
    total_matches: Optional[int] = None,
    filter_meta: Optional[Dict[str, Any]] = None,
) -> str:
    """Render a deterministic, citation-safe list of retrieved judgments."""

    if not citations:
        return "目前沒有檢索到可列出的判決。"
    total = int(total_matches if total_matches is not None else len(citations))
    if total > len(citations):
        intro = (
            f"符合條件的判決共 {total:,} 筆，"
            f"以下列出前 {len(citations):,} 筆："
        )
    else:
        intro = f"符合條件的判決共 {total:,} 筆："
    lines = [intro]
    criteria: List[str] = []
    meta = filter_meta or {}
    if meta.get("courts"):
        criteria.append("法院＝" + "／".join(meta["courts"]))
    if meta.get("year_from") is not None:
        criteria.append(
            f"裁判年份＝{meta['year_from']}–{meta['year_to']}"
        )
    if meta.get("topics"):
        criteria.append("案由含「" + "／".join(meta["topics"]) + "」")
    exact_phrases = [
        str(value) for value in (meta.get("exact_phrases") or [])
    ]
    if exact_phrases:
        criteria.append(
            "正規化全文含「" + "／".join(exact_phrases) + "」"
        )
    if criteria:
        lines.append("查詢條件（可複製）：" + "；".join(criteria))
    if exact_phrases:
        lines.append(
            "注意：此清單依正規化全文片語精確比對，不是案由 filter。"
        )
    topics = [str(topic) for topic in (meta.get("topics") or [])]
    if any("詐" in topic for topic in topics):
        lines.append(
            "注意：此清單依「案由含詐欺」篩選，不含案由不同但內容涉及詐欺"
            "的判決（例如案由為洗錢或偽造文書者）。"
        )
    courts = {str(item.get("court") or "") for item in citations}
    if "板橋" in question and any("新北" in court for court in courts):
        lines.append(
            "板橋地方法院現已改制為臺灣新北地方法院，"
            "以下為新北地院的相關判決。"
        )
    for citation in citations:
        index = int(citation.get("index") or 0)
        jid = str(citation.get("jid") or "")
        record = (documents or {}).get(jid)
        source_text = (
            record.full_text
            if record is not None
            else citation.get("snippet") or ""
        )
        snippet = _best_judgment_snippet(source_text, question)
        lines.append(
            f"[{index}] {jid or '案號未載明'}\n"
            f"{citation.get('court') or '法院未載明'}｜"
            f"{citation.get('jdate') or '日期未載明'}｜"
            f"案由：{citation.get('title') or '未載明'}\n"
            f"{snippet} [{index}]"
        )
    if total > len(citations):
        lines.append(
            f"完整 {total:,} 筆清單請至「資料庫查詢」頁，"
            "以上述條件查詢。"
        )
    lines.append("這不是法律意見。")
    return "\n\n".join(lines)


def _phrase_excerpt(
    text: str, phrases: Sequence[str], *, budget: int = 420
) -> str:
    """Return a readable excerpt centred on the first exact phrase."""
    normalized = normalize_with_offsets(text)
    best_position = None
    best_phrase = ""
    for phrase in phrases:
        position = normalized.text.find(phrase)
        if position >= 0 and (
            best_position is None or position < best_position
        ):
            best_position = position
            best_phrase = phrase
    if best_position is None:
        return re.sub(r"\s+", " ", str(text or "")).strip()[:budget]
    start = max(0, best_position - 160)
    end = min(
        len(normalized.text),
        best_position + len(best_phrase) + 260,
    )
    raw_start, raw_end = normalized.raw_span(start, end)
    excerpt = re.sub(r"\s+", " ", text[raw_start:raw_end]).strip()
    return excerpt[:budget]


def _keyword_list_payload(
    *,
    session_factory,
    question: str,
    parsed_query,
    terms: Sequence[LegalTerm],
    coverage: Dict[str, Any],
    law_sources: Sequence[Dict[str, Any]],
    settings: Settings,
    started: float,
) -> Dict[str, Any]:
    """Answer a filtered list query with exact full-text term matching."""
    phrases = phrases_for_terms(list(terms))
    with session_factory() as session:
        records = list(
            session.scalars(
                select(JudgmentDocument).where(
                    JudgmentDocument.is_current.is_(True),
                    JudgmentDocument.court_normalized.in_(
                        list(parsed_query.courts)
                    ),
                    JudgmentDocument.jdate.between(
                        f"{parsed_query.year_from}0101",
                        f"{parsed_query.year_to}1231",
                    ),
                    or_(
                        *[
                            JudgmentDocument.full_text.contains(phrase)
                            for phrase in phrases
                        ]
                    ),
                )
            ).all()
        )
        min_date, max_date, court_total = session.execute(
            select(
                func.min(JudgmentDocument.jdate),
                func.max(JudgmentDocument.jdate),
                func.count(JudgmentDocument.id),
            ).where(
                JudgmentDocument.is_current.is_(True),
                JudgmentDocument.court_normalized.in_(
                    list(parsed_query.courts)
                ),
            )
        ).one()

    matched = []
    for record in records:
        normalized = normalize_for_match(record.full_text or "")
        hits = sum(normalized.count(phrase) for phrase in phrases)
        if hits:
            matched.append((hits, record))
    # Date order is the primary presentation order; term frequency is only
    # an auxiliary field.  Frequency must not decide which judgment is "first".
    matched.sort(key=lambda item: (item[1].jdate, item[1].jid))
    total_matches = len(matched)
    selected = matched[:20]
    documents = {record.jid: record for _, record in selected}
    hits = [
        {
            "id": record.jid,
            "score": float(occurrences),
            "payload": {
                "jid": record.jid,
                "court": record.court_normalized,
                "jdate": record.jdate,
                "title": record.title,
                "matched_laws": list(record.matched_laws or []),
                "term_occurrences": int(occurrences),
                "snippet": _phrase_excerpt(
                    record.full_text or "", phrases
                ),
            },
        }
        for occurrences, record in selected
    ]
    occurrences_by_jid = {
        record.jid: int(occurrences) for occurrences, record in selected
    }
    citations, _ = _build_citations(
        hits=hits,
        documents=documents,
        question=question,
        max_context_chars=settings.rag_max_context_chars,
    )
    for citation in citations:
        record = documents.get(str(citation.get("jid") or ""))
        if record is not None:
            citation["snippet"] = _phrase_excerpt(
                record.full_text or "", phrases
            )
            citation["term_occurrences"] = occurrences_by_jid.get(
                record.jid, 0
            )

    coverage_note = ""
    min_year = int(str(min_date)[:4]) if min_date else None
    max_year = int(str(max_date)[:4]) if max_date else None
    if min_year is not None and parsed_query.year_from < min_year:
        coverage_note += (
            f"資料庫在該法院最早收錄 {min_year} 年判決；"
            f"{parsed_query.year_from}–{min_year - 1} 年沒有資料。"
        )
    if max_year is not None and parsed_query.year_to > max_year:
        coverage_note += (
            f"資料庫在該法院目前收錄至 {max_year} 年；"
            f"{max_year + 1}–{parsed_query.year_to} 年沒有資料。"
        )

    filter_meta = {
        **parsed_query.to_dict(),
        "titles": [],
        "exact_phrases": list(phrases),
        "term_keys": [term.key for term in terms],
    }
    term_label = "／".join(term.key for term in terms)
    if total_matches:
        answer = _judgment_list_answer(
            question,
            citations,
            documents,
            total_matches=total_matches,
            filter_meta=filter_meta,
        )
        notice = (
            f"以下判決清單由 PostgreSQL 正規化全文精確比對「{term_label}」"
            "後直接整理；沒有使用向量近似結果。這不是法律意見。"
        )
    else:
        answer = (
            f"在法院 {'／'.join(parsed_query.courts)}、"
            f"裁判年份 {parsed_query.year_from}–{parsed_query.year_to} 的判決中，"
            f"查無正規化全文含「{term_label}」的判決。"
        )
        if coverage_note:
            answer += coverage_note
        answer += "系統沒有改用其他近似詞的向量結果。"
        notice = (
            "已套用法院與年份條件，並以 PostgreSQL 正規化全文做片語比對；"
            "沒有使用未套用條件的向量結果。這不是法律意見。"
        )
        citations = []
    if coverage_note and total_matches:
        notice = f"{coverage_note}{notice}"

    return {
        "status": "operational",
        "answer": answer,
        "notice": notice,
        "citations": citations,
        "judgments": citations,
        "law_sources": list(law_sources),
        "law_answer": _law_answer_summary(law_sources),
        "matched_terms": [term.key for term in terms],
        "answer_source": "retrieval_list",
        "llm_model": None,
        "embedding_model": settings.embedding_model or None,
        "retrieval": {
            "status": "ok" if total_matches else "empty",
            "mode": "keyword_list",
            "retrieval_mode": "keyword_list",
            "hits": len(citations),
            "unique_judgments": len(citations),
            "total_matches": total_matches,
            "query_filters": filter_meta,
            "exact_phrases": list(phrases),
            "court_year_coverage": {
                "first_date": min_date,
                "last_date": max_date,
                "court_total": int(court_total or 0),
            },
        },
        "coverage": coverage,
        "duration_ms": _elapsed_ms(started),
    }


def _scope_probe_legal_terms(
    result: ScopeProbeResult,
) -> List[LegalTerm]:
    """Wrap exact scope hits so the existing keyword-list path can use them."""

    terms: List[LegalTerm] = []
    for term in result.hit_terms:
        terms.append(
            LegalTerm(
                key=term.term,
                phrases=(term.term,),
                description=f"{term.term}（court+year scope probe）",
                normalization_version="remove-unicode-space-v2",
                review_status=(
                    "engineering_pending"
                    if term.scope == "registry_candidate"
                    else "external_probe"
                ),
                mode="exact",
                priority=0,
                expansion_terms=(),
                expansion_enabled=False,
                expansion_decision="candidate",
                term_id=term.term_id,
                legal_concept_category="",
                active=False,
            )
        )
    return terms


def _scope_probe_notice(
    result: ScopeProbeResult,
    *,
    exact_hits: bool,
) -> str:
    zero_terms = list(result.zero_terms)
    if not zero_terms:
        return ""
    labels = "、".join(f"「{term.term}」" for term in zero_terms)
    if exact_hits:
        notice = (
            f"{labels}未在指定法院與年份的判決內文出現，未列入精確清單。"
        )
    else:
        notice = (
            f"在指定法院與年份的判決內文未出現{labels}字樣；"
            "以下改以語意檢索顯示相近結果，並非精確詞命中。"
        )
    candidate_labels = [
        f"「{term.term}」"
        for term in zero_terms
        if term.scope == "registry_candidate"
    ]
    if candidate_labels:
        notice += (
            " "
            + "、".join(candidate_labels)
            + " 目前仍是 candidate，尚未啟用精確拒答。"
        )
    external_labels = [
        f"「{term.term}」"
        for term in zero_terms
        if term.scope == "external"
    ]
    if external_labels:
        notice += (
            " "
            + "、".join(external_labels)
            + " 是 registry 外詞，因此不改為零命中拒答。"
        )
    return notice


def _scope_probe_hit_notice(result: ScopeProbeResult) -> str:
    non_must = [
        term
        for term in result.hit_terms
        if term.scope != "must"
    ]
    if not non_must:
        return ""
    labels = "、".join(f"「{term.term}」" for term in non_must)
    return (
        f"此清單包含 {labels} 的非 active 精確全文命中；"
        "該詞尚未完成法律審閱。"
    )


def _empty_judgment_list_payload(
    *,
    question: str,
    parsed_query,
    filter_meta: Dict[str, Any],
    coverage: Dict[str, Any],
    law_sources: Sequence[Dict[str, Any]],
    settings: Settings,
    started: float,
    query_plan=None,
) -> Dict[str, Any]:
    """Return an explicit no-match answer for a structured list query."""

    criteria: List[str] = []
    if parsed_query.courts:
        criteria.append("法院 " + "／".join(parsed_query.courts))
    if parsed_query.year_from is not None:
        criteria.append(
            f"裁判年份 {parsed_query.year_from}–{parsed_query.year_to}"
        )
    if parsed_query.topics:
        criteria.append("案由含 " + "／".join(parsed_query.topics))
    condition = "、".join(criteria) or "指定條件"
    if filter_meta.get("title_unresolved"):
        answer = (
            f"在法院 {('／'.join(parsed_query.courts) or '指定範圍')}、"
            f"裁判年份 {parsed_query.year_from}–{parsed_query.year_to}、"
            f"案由含 {'／'.join(parsed_query.topics)} 的範圍內，"
            "查無案由符合的判決。"
            "系統沒有改用未套用條件的向量結果，因此不會列出無關案件。"
        )
        notice = (
            "已套用法院與日期 filter；案由 facet 沒有找到符合主題的 "
            "title，因此判定為查無結果。這不是法律意見。"
        )
    else:
        answer = (
            f"查無符合條件的判決（{condition}）。"
            "請放寬年份、法院或案由條件後再查詢。"
        )
        notice = (
            "已套用法院、日期與案由的結構化 filter；"
            "沒有使用未套用條件的向量結果。這不是法律意見。"
        )
    terms = [
        str(source.get("law_name") or "")
        for source in law_sources
        if str(source.get("law_name") or "")
    ]
    return {
        "status": "operational",
        "answer": answer,
        "notice": notice,
        "citations": [],
        "judgments": [],
        "law_sources": list(law_sources),
        "law_answer": _law_answer_summary(law_sources),
        "matched_terms": terms,
        "answer_source": "retrieval_list",
        "llm_model": None,
        "embedding_model": settings.embedding_model or None,
        "retrieval": {
            "status": "empty",
            "mode": "judgment_first",
            "retrieval_mode": "structured_list",
            "hits": 0,
            "unique_judgments": 0,
            "total_matches": 0,
            "query_filters": filter_meta,
            "query_plan": query_plan.to_dict() if query_plan else None,
        },
        "coverage": coverage,
        "duration_ms": _elapsed_ms(started),
    }


def _build_llm_prompt(
    *,
    question: str,
    contexts: Sequence[Dict[str, Any]],
    list_judgments: bool = False,
) -> str:
    blocks = []
    for context in contexts:
        if context.get("kind") == "law":
            blocks.append(
                f"[{context['index']}] 法規／命令來源"
                f"（引用此法規時請標 [{context['index']}]）："
                f"{law_source_text(context)}"
            )
            continue
        laws = "、".join(context.get("matched_laws") or []) or "—"
        blocks.append(
            f"[{context['index']}] 判決案號：{context['jid']}\n"
            f"法院：{context['court']}｜裁判日期：{context['jdate']}｜案由：{context['title']}\n"
            f"命中法規：{laws}\n片段：{context['text']}"
        )
    heading = (
        "參考資料（以判決為主）："
        if list_judgments
        else "參考資料（法規、命令與判決）："
    )
    if list_judgments:
        instruction = (
            "使用者要求列出判決。請以判決來源為主，逐筆列出案號、法院、裁判日期與案由，"
            "並用一句話說明與問題的關聯；最多列出 8 筆。"
            "不得改答法規問題；若同時有法規來源，只能作為補充。"
            "每個結論後標註對應的 [n]；不得虛構未提供的判決。"
            "使用繁體中文條列，最後提醒這不是法律意見。"
        )
    else:
        instruction = (
            "請直接回答問題，不要重複參考資料原文、案號清單或標題；"
            "使用 2 到 3 句繁體中文，每個結論後標註對應的 [n]；"
            "[n] 是參考資料來源編號，不是法律條號，條號請寫「第15條」。"
            "引用法規或命令的內容時，必須使用該法規／命令區塊標示的來源編號，"
            "不可改用判決編號或條號代替。"
            "不要自行創造多個問題，並提醒這不是法律意見。"
        )
    return (
        f"問題：{question}\n\n{heading}\n"
        + "\n\n".join(blocks)
        + f"\n\n{instruction}"
    )


def _llm_request_payload(
    *,
    settings: Settings,
    model: str,
    question: str,
    contexts: Sequence[Dict[str, Any]],
    strict: bool,
    stream: bool,
    api: str | None = None,
) -> Tuple[Dict[str, Any], int]:
    list_judgments = is_judgment_list_question(question)
    user_prompt = _build_llm_prompt(
        question=question,
        contexts=contexts,
        list_judgments=list_judgments,
    )
    system_prompt = SYSTEM_PROMPT
    if list_judgments:
        system_prompt += (
            " 本次問題要求列出判決，必須逐筆引用判決來源，"
            "不得以法規條文取代判決清單。"
        )
    if contexts and contexts[0].get("kind") == "law":
        system_prompt += (
            " 本次問題以法規／命令條文為主要依據；若參考資料包含法規或命令，"
            "必須優先整理並引用條文內容，判決僅作實務補充，不得以判決取代條文。"
            "若條文不足，請明確說明資料不足。"
        )
    if strict:
        system_prompt += (
            " 你上一次的回答缺少有效引用標記；這次每個結論後都必須加上 "
            "對應的 [n]，不得省略，也不得使用未提供的來源。"
        )
    payload = chat_payload(
        api=api if api is not None else settings.llm_api,
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        stream=stream,
        temperature=0.1,
        num_predict=settings.llm_num_predict,
        num_ctx=settings.llm_num_ctx,
        keep_alive=settings.llm_keep_alive_value,
    )
    return payload, len(user_prompt)


def generate_answer_with_model(
    *,
    settings: Settings,
    model: str,
    question: str,
    contexts: Sequence[Dict[str, Any]],
    timeout: Optional[float],
    strict: bool = False,
    on_token: Optional[Callable[[str], None]] = None,
) -> str:
    """Generate one grounded answer with an explicit model and timeout.

    Test mode passes ``timeout=None`` so a slow local model is not cut off.
    ``strict`` is used for one retry when the first answer omitted citation
    markers. When ``on_token`` is provided, the provider's streaming response
    is consumed and each content chunk is forwarded before the final answer is
    validated.

    The primary provider is tried first.  A configured Ollama fallback is used
    when the primary fails before emitting any token, so a stopped x570 does
    not interrupt RAG answers.
    """
    providers = chat_providers(settings, model)
    if not providers:
        raise RuntimeError("LLM_URL 或 LLM_MODEL 未設定")
    streaming = on_token is not None
    errors: List[str] = []
    last_error: Optional[Exception] = None

    for provider in providers:
        request_payload, prompt_chars = _llm_request_payload(
            settings=settings,
            model=provider.model,
            question=question,
            contexts=contexts,
            strict=strict,
            stream=streaming,
            api=provider.api,
        )
        url = chat_url(provider.base_url, provider.api)
        request_started = time.perf_counter()
        tokens_emitted = False
        try:
            with trace_segment(
                "rag.llm_request",
                module=__name__,
                function="httpx.stream" if streaming else "httpx.post",
                params={
                    "url": url,
                    "model": provider.model,
                    "api": provider.api,
                    "provider": provider.role,
                    "stream": streaming,
                    "temperature": 0.1,
                    "num_ctx": settings.llm_num_ctx,
                    "num_predict": settings.llm_num_predict,
                    "keep_alive": settings.llm_keep_alive,
                    "timeout": timeout,
                    "prompt_chars": prompt_chars,
                    "strict": strict,
                },
            ) as llm_segment:
                if not streaming:
                    response = httpx.post(
                        url, json=request_payload, timeout=timeout
                    )
                    _raise_for_llm_status(response)
                    payload = response.json()
                    answer = chat_content(provider.api, payload).strip()
                    if not answer:
                        raise RuntimeError("LLM 回傳空回答")
                    if llm_segment is not None:
                        usage = chat_usage(provider.api, payload)
                        llm_segment["metadata"].update(
                            {
                                "model": provider.model,
                                "base_url": provider.base_url,
                                "api": provider.api,
                                "provider": provider.role,
                                "fallback": provider.role == "fallback",
                                "stream": False,
                                "strict": strict,
                                "input_tokens": usage["input_tokens"],
                                "output_tokens": usage["output_tokens"],
                                "ttft_ms": None,
                                "total_duration_ms": _ns_to_ms(
                                    usage["total_duration_ms"]
                                ),
                                "load_duration_ms": _ns_to_ms(
                                    usage["load_duration_ms"]
                                ),
                                "eval_duration_ms": _ns_to_ms(
                                    usage["eval_duration_ms"]
                                ),
                            }
                        )
                    return answer

                chunks: List[str] = []
                first_token_at: Optional[float] = None
                final_event: Dict[str, Any] = {}
                with httpx.stream(
                    "POST", url, json=request_payload, timeout=timeout
                ) as response:
                    _raise_for_llm_status(response, streaming=True)
                    for line in response.iter_lines():
                        if not line.strip():
                            continue
                        if is_openai_api(provider.api):
                            if not line.startswith("data:"):
                                continue
                            data = line[5:].strip()
                            if data == "[DONE]":
                                break
                            event = json.loads(data)
                        else:
                            event = json.loads(line)
                        error = event.get("error")
                        if error:
                            raise RuntimeError(f"LLM 串流失敗：{error}")
                        content, done = stream_delta(
                            provider.api, event
                        )
                        if done or event.get("usage"):
                            final_event = event
                        if not content:
                            continue
                        if first_token_at is None:
                            first_token_at = time.perf_counter()
                        tokens_emitted = True
                        chunks.append(content)
                        try:
                            on_token(content)
                        except Exception:
                            logger.debug(
                                "LLM token callback failed", exc_info=True
                            )
                answer = "".join(chunks).strip()
                if not answer:
                    raise RuntimeError("LLM 回傳空回答")
                if llm_segment is not None:
                    usage = chat_usage(provider.api, final_event)
                    llm_segment["metadata"].update(
                        {
                            "model": provider.model,
                            "base_url": provider.base_url,
                            "api": provider.api,
                            "provider": provider.role,
                            "fallback": provider.role == "fallback",
                            "stream": True,
                            "strict": strict,
                            "input_tokens": usage["input_tokens"],
                            "output_tokens": usage["output_tokens"],
                            "ttft_ms": (
                                round(
                                    (first_token_at - request_started) * 1000,
                                    2,
                                )
                                if first_token_at is not None
                                else None
                            ),
                            "total_duration_ms": _ns_to_ms(
                                usage["total_duration_ms"]
                            ),
                            "load_duration_ms": _ns_to_ms(
                                usage["load_duration_ms"]
                            ),
                            "eval_duration_ms": _ns_to_ms(
                                usage["eval_duration_ms"]
                            ),
                        }
                    )
                return answer
        except Exception as exc:  # noqa: BLE001 - fallback is intentional
            last_error = exc
            if tokens_emitted:
                raise
            errors.append(
                f"{provider.role} ({provider.base_url}): "
                f"{exc.__class__.__name__}: {exc}"
            )
            if provider.role != "fallback":
                logger.warning(
                    "LLM primary failed; trying fallback if configured: %s",
                    exc,
                )

    raise RuntimeError("; ".join(errors) or "LLM 沒有可用的 provider") from last_error


@traced(
    "rag.llm",
    module=__name__,
    params_fn=lambda *, settings, contexts, **_: {
        "model": settings.llm_model,
        "temperature": 0.1,
        "num_ctx": settings.llm_num_ctx,
        "num_predict": settings.llm_num_predict,
        "keep_alive": settings.llm_keep_alive,
        "context_count": len(contexts or []),
        "context_chars": sum(
            len(str(context.get("text") or "")) for context in (contexts or [])
        ),
    },
)
def _raise_for_llm_status(response, *, streaming: bool = False) -> None:
    """Raise an error that keeps the provider's response body in the trace."""

    status = getattr(response, "status_code", None)
    if status is None:
        # Test doubles and older clients may only expose raise_for_status().
        response.raise_for_status()
        return
    if status < 400:
        return
    try:
        body = (
            response.read().decode("utf-8", "replace")
            if streaming
            else response.text
        )
    except Exception:
        body = ""
    detail = re.sub(r"\s+", " ", body).strip()[:1000]
    raise RuntimeError(
        f"LLM HTTP {status}: {detail or '(empty body)'}"
    )


def _generate_answer(
    *,
    settings: Settings,
    question: str,
    contexts: Sequence[Dict[str, Any]],
    strict: bool = False,
    on_token: Optional[Callable[[str], None]] = None,
) -> str:
    if not settings.llm_url or not settings.llm_model:
        raise RuntimeError("LLM_URL 或 LLM_MODEL 未設定")
    return generate_answer_with_model(
        settings=settings,
        model=settings.llm_model,
        question=question,
        contexts=contexts,
        timeout=settings.llm_timeout_seconds,
        strict=strict,
        on_token=on_token,
    )


@traced(
    "rag.validate_citations",
    module=__name__,
    params_fn=lambda answer, count: {
        "answer_length": len(answer or ""),
        "citation_count": count,
    },
)
def _valid_citation_markers(answer: str, count: int) -> bool:
    markers: List[int] = []
    for group in _CITATION_RE.findall(answer):
        markers.extend(int(value) for value in _CITATION_NUMBER_RE.findall(group))
    if markers:
        return all(1 <= value <= count for value in markers)
    # A grounded refusal is acceptable when the retrieved excerpts do not
    # support an answer. It must not invent case numbers or citations.
    if _INSUFFICIENT_RE.search(answer):
        return not _CASE_NO_RE.search(answer)
    return False


@traced(
    "rag.answer_question",
    module=__name__,
    params_fn=lambda *, question, settings, **_: {
        "question_length": len(question or ""),
        "collection": settings.judgment_vector_collection,
        "embedding_model": settings.embedding_model,
        "llm_model": settings.llm_model or None,
        "top_k": settings.rag_top_k,
        "score_threshold": settings.rag_score_threshold,
    },
)
def answer_question(
    *,
    session_factory,
    question: str,
    settings: Settings,
    store: Optional[QdrantStore] = None,
    embedder: Optional[OllamaEmbedder] = None,
    on_partial: Optional[Callable[[Dict[str, Any]], None]] = None,
    on_token: Optional[Callable[[str], None]] = None,
    on_token_reset: Optional[Callable[[], None]] = None,
    enable_law_retrieval: bool = True,
) -> Dict[str, Any]:
    started = time.perf_counter()
    raw_question = str(question or "")
    parsed_query = parse_judgment_query(raw_question)
    with trace_segment(
        "rag.parse_question",
        module=__name__,
        function="answer_question",
        params={
            "input_length": len(raw_question),
            "normalized_length": len(raw_question.strip()),
        },
    ) as parse_segment:
        question = raw_question.strip()
        if not question:
            raise ValueError("問題不可為空")
        if parse_segment is not None:
            parse_segment["metadata"].update(
                {
                    "input_length": len(raw_question),
                    "normalized_length": len(question),
                    "trimmed_chars": len(raw_question) - len(question),
                    "parsed_query": parsed_query.to_dict(),
                }
            )

    def emit_partial(payload: Dict[str, Any]) -> None:
        if on_partial is None:
            return
        try:
            on_partial(payload)
        except Exception:
            logger.debug("partial answer callback failed", exc_info=True)

    active_index = active_version(
        session_factory, alias_name=settings.judgment_vector_alias
    )
    collection = (
        active_index["physical_collection"]
        if active_index
        else settings.judgment_vector_collection
    )
    try:
        with trace_segment(
            "rag.coverage",
            module=__name__,
            function="index_coverage",
            params={"collection": collection, "model": settings.embedding_model},
        ):
            coverage = index_coverage(
                session_factory,
                collection=collection,
                model=settings.embedding_model,
                version_id=active_index["version_id"] if active_index else None,
            )
    except Exception:
        coverage = {
            "total_judgments": 0,
            "indexed_judgments": 0,
            "remaining_judgments": 0,
            "collection": collection,
            "model": settings.embedding_model,
            "latest_indexed_at": None,
        }

    store = store or QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=30.0,
    )
    embedder = embedder or OllamaEmbedder(
        settings.embedding_url,
        settings.embedding_model,
        api=settings.embedding_api,
        timeout=settings.embedding_timeout_seconds,
        query_timeout=settings.embedding_query_timeout_seconds,
        health_timeout=settings.embedding_health_timeout_seconds,
        fallback_base_url=settings.embedding_fallback_url,
        fallback_api=settings.embedding_fallback_api,
        fallback_base_urls=settings.embedding_failover_urls,
        fallback_apis=settings.embedding_failover_apis,
    )
    search_collection = collection
    if settings.qdrant_url:
        try:
            alias_target = store.get_alias(settings.judgment_vector_alias)
        except Exception:
            alias_target = None
        if alias_target:
            search_collection = settings.judgment_vector_alias

    law_sources: List[Dict[str, Any]] = []
    law_stats: Dict[str, Any] = {}
    law_first_hint = is_law_first_question(question)
    judgment_list_hint = is_judgment_list_question(question)
    exact_terms = detect_exact_terms(question)
    exact_channel_available = bool(
        exact_terms
        and (judgment_list_hint or parsed_query.list_intent)
        and parsed_query.courts
        and parsed_query.year_from is not None
    )
    scope_probe_result: Optional[ScopeProbeResult] = None
    scope_probe_zero = False
    scope_probe_notice = ""
    scope_probe_payload: Optional[Dict[str, Any]] = None
    if (
        not law_first_hint
        and (judgment_list_hint or parsed_query.list_intent)
        and parsed_query.courts
        and parsed_query.year_from is not None
        and not parsed_query.topics
    ):
        scope_terms = extract_scope_terms(question, parsed_query)
        probe_terms = [
            term for term in scope_terms if term.scope != "must"
        ]
        if probe_terms:
            scope_probe_result = probe_scope_terms(
                session_factory=session_factory,
                parsed_query=parsed_query,
                terms=probe_terms,
            )
            if scope_probe_result.terms:
                scope_probe_payload = scope_probe_result.to_dict()
                if scope_probe_result.has_hits and not exact_terms:
                    probe_legal_terms = _scope_probe_legal_terms(
                        scope_probe_result
                    )
                    if probe_legal_terms:
                        payload = _keyword_list_payload(
                            session_factory=session_factory,
                            question=question,
                            parsed_query=parsed_query,
                            terms=probe_legal_terms,
                            coverage=coverage,
                            law_sources=law_sources,
                            settings=settings,
                            started=started,
                        )
                        payload["retrieval"]["scope_probe"] = (
                            scope_probe_payload
                        )
                        payload["retrieval"]["scope_probe_exact"] = True
                        payload["retrieval"]["scope_probe_notice"] = None
                        extra_notice = " ".join(
                            part
                            for part in (
                                _scope_probe_notice(
                                    scope_probe_result,
                                    exact_hits=True,
                                ),
                                _scope_probe_hit_notice(
                                    scope_probe_result
                                ),
                            )
                            if part
                        )
                        if extra_notice:
                            payload["notice"] = (
                                f"{payload['notice']} {extra_notice}".strip()
                            )
                            payload["retrieval"][
                                "scope_probe_notice"
                            ] = extra_notice
                        return payload
                elif not scope_probe_result.has_hits and not exact_terms:
                    scope_probe_zero = True
                    scope_probe_notice = _scope_probe_notice(
                        scope_probe_result,
                        exact_hits=False,
                    )
    semantic_question = question
    legal_expansion: Dict[str, Any] = {
        "enabled": False,
        "matched_terms": [],
        "expansion_terms": [],
        "original_length": len(question),
        "expanded_length": len(question),
    }
    if (
        settings.rag_legal_expansion_enabled
        and not law_first_hint
        and not exact_channel_available
    ):
        semantic_question, legal_expansion = expand_semantic_query(
            question,
            limit=settings.rag_legal_expansion_terms,
        )
    structured_law_question = bool(
        is_article_count_question(question)
        or is_history_question(question)
        or is_related_laws_question(question)
        or is_citation_stats_question(question)
    )
    law_article_limit = (
        settings.rag_law_article_limit_law_first
        if law_first_hint
        else settings.rag_law_article_limit
    )
    rerank_law_articles = bool(
        settings.rag_rerank_enabled
        and (settings.rerank_url or settings.rerank_fallback_url)
        and not structured_law_question
    )
    law_candidate_limit = (
        max(
            settings.rag_law_article_limit,
            settings.rag_law_article_limit_law_first,
            settings.rag_law_candidate_article_limit,
        )
        if rerank_law_articles
        else law_article_limit
    )
    law_fusion = {
        "method": "rrf",
        "rrf_k": settings.rag_law_rrf_k,
        "dense_weight": settings.rag_law_dense_weight,
    }
    query_vector: Optional[List[float]] = None
    law_vector_hits: List[Dict[str, Any]] = []
    law_vector: Dict[str, Any] = {
        "status": (
            "disabled"
            if (
                not settings.rag_law_vector_enabled
                or not enable_law_retrieval
            )
            else (
                "not_configured"
                if not settings.qdrant_url
                else "pending"
            )
        )
    }
    if settings.rag_law_vector_enabled and structured_law_question:
        law_vector = {
            "status": "skipped",
            "reason": "structured_law_question",
        }
    if (
        enable_law_retrieval
        and settings.rag_law_vector_enabled
        and not structured_law_question
        and settings.qdrant_url
        and embedder.configured
    ):
        try:
            query_vector = _embed_question(
                settings=settings,
                question=question,
                embedder=embedder,
            )
            law_vector_hits, law_vector = _search_legal_articles(
                settings=settings,
                question=question,
                store=store,
                vector=query_vector,
            )
        except EmbeddingError as exc:
            query_vector = None
            law_vector = {
                "status": "degraded",
                "alias": settings.legal_article_vector_alias,
                "error": f"{exc.__class__.__name__}: {exc}",
            }
        except Exception as exc:
            law_vector = {
                "status": "degraded",
                "alias": settings.legal_article_vector_alias,
                "error": f"{exc.__class__.__name__}: {exc}",
            }
    law_rerank: Dict[str, Any] = {
        "status": "disabled" if not settings.rag_rerank_enabled else "skipped"
    }
    stat_entity = (
        extract_stat_entity(question)
        if enable_law_retrieval and is_citation_stats_question(question)
        else ""
    )
    if enable_law_retrieval:
        try:
            with trace_segment(
                "rag.law_retrieval",
                module=__name__,
                function="law_sources_for_question",
                params={
                    "question_length": len(question),
                    "stat_entity": stat_entity or None,
                    "article_limit": law_candidate_limit,
                    "law_vector_hits": len(law_vector_hits),
                    "fusion": "rrf",
                    "rrf_k": settings.rag_law_rrf_k,
                    "dense_weight": settings.rag_law_dense_weight,
                },
            ):
                if stat_entity:
                    law_stats = judgment_law_stats(
                        session_factory, stat_entity
                    )
                law_sources = law_sources_for_question(
                    session_factory,
                    settings.law_data_dir,
                    question,
                    stats=law_stats,
                    article_limit=law_candidate_limit,
                    vector_hits=law_vector_hits,
                    dense_weight=settings.rag_law_dense_weight,
                    rrf_k=settings.rag_law_rrf_k,
                )
        except Exception as exc:
            logger.warning("law/order retrieval failed: %s", exc)
            law_sources = []
            law_stats = {}

    if rerank_law_articles and law_sources:
        try:
            with trace_segment(
                "rag.law_rerank",
                module=__name__,
                function="RerankerClient.rerank",
                params={
                    "model": settings.rerank_model,
                    "question_length": len(question),
                    "candidate_count": sum(
                        len(source.get("articles") or [])
                        for source in law_sources
                    ),
                    "article_limit": law_article_limit,
                },
            ) as law_rerank_segment:
                law_sources, law_rerank_outcome = _rerank_law_sources(
                    settings=settings,
                    question=question,
                    law_sources=law_sources,
                    article_limit=law_article_limit,
                )
                law_rerank = law_rerank_outcome.to_dict()
                if law_rerank_segment is not None:
                    law_rerank_segment["metadata"].update(
                        {
                            "status": law_rerank_outcome.status,
                            "provider_name": law_rerank_outcome.provider,
                            "base_url": law_rerank_outcome.url,
                            "candidates": law_rerank_outcome.candidate_count,
                            "selected": law_rerank_outcome.selected_count,
                            "fallback_used": law_rerank_outcome.fallback_used,
                            "errors": law_rerank_outcome.errors,
                            "groups": [
                                {
                                    "source_type": group.get("source_type"),
                                    "status": group.get("status"),
                                    "candidates": group.get("candidate_count"),
                                    "selected": group.get("selected_count"),
                                }
                                for group in law_rerank_outcome.groups
                            ],
                        }
                    )
        except Exception as exc:
            law_sources = _trim_law_sources(
                law_sources, law_article_limit
            )
            law_rerank = {
                "status": "degraded",
                "model": settings.rerank_model,
                "error": f"{exc.__class__.__name__}: {exc}",
            }
    elif rerank_law_articles:
        law_rerank = {
            "status": "empty",
            "model": settings.rerank_model,
            "candidate_count": 0,
        }
    else:
        law_sources = _trim_law_sources(law_sources, law_article_limit)

    if (
        not law_first_hint
        and law_sources
        and not any(
            _mentions_law(question, str(source.get("law_name") or ""))
            for source in law_sources
        )
    ):
        # Judgment-first questions should not be hijacked by incidental
        # law/order matches (e.g. "地方法院…處務規程" from a court name).
        # Keep law sources only when the question explicitly names a law.
        law_sources = []
        law_stats = {}
        law_rerank = {
            "status": "skipped",
            "reason": "judgment_first_without_explicit_law",
        }

    def assign_law_indexes(sources: Sequence[Dict[str, Any]], start: int = 1) -> None:
        for offset, source in enumerate(sources, start=start):
            source["index"] = offset

    test_mode_enabled = False
    try:
        from .runtime_settings import get_test_mode

        test_mode_enabled = bool(get_test_mode(session_factory))
    except Exception:
        test_mode_enabled = False

    if (
        exact_channel_available
        and (judgment_list_hint or parsed_query.list_intent)
        and not test_mode_enabled
    ):
        with trace_segment(
            "rag.keyword_probe",
            module=__name__,
            function="_keyword_list_payload",
            params={
                "question_length": len(question),
                "terms": [term.key for term in exact_terms],
                "courts": list(parsed_query.courts),
                "year_from": parsed_query.year_from,
                "year_to": parsed_query.year_to,
            },
        ):
            payload = _keyword_list_payload(
                session_factory=session_factory,
                question=question,
                parsed_query=parsed_query,
                terms=exact_terms,
                coverage=coverage,
                law_sources=law_sources,
                settings=settings,
                started=started,
            )
            if scope_probe_payload and scope_probe_result is not None:
                payload["retrieval"]["scope_probe"] = (
                    scope_probe_payload
                )
                extra_notice = _scope_probe_notice(
                    scope_probe_result, exact_hits=True
                )
                if scope_probe_result.has_hits:
                    labels = "、".join(
                        f"「{term.term}」"
                        for term in scope_probe_result.hit_terms
                    )
                    extra_notice = " ".join(
                        part
                        for part in (
                            extra_notice,
                            (
                                f"另有 {labels} 在判決內文有精確命中，"
                                "但本次 must-term 清單只包含 active 術語。"
                            ),
                        )
                        if part
                    )
                if extra_notice:
                    payload["notice"] = (
                        f"{payload['notice']} {extra_notice}".strip()
                    )
                    payload["retrieval"]["scope_probe_notice"] = (
                        extra_notice
                    )
            return payload

    if law_sources and not test_mode_enabled and (
        is_article_count_question(question)
        or is_history_question(question)
        or is_related_laws_question(question)
        or (law_stats and law_stats.get("articles"))
    ):
        assign_law_indexes(law_sources)
        structured_answer = structured_law_answer(question, law_sources, law_stats)
        if structured_answer:
            if (
                is_article_count_question(question)
                or is_history_question(question)
                or is_related_laws_question(question)
            ):
                for source in law_sources:
                    source["articles"] = []
            terms = [source["law_name"] for source in law_sources]
            if law_stats.get("entity") and law_stats["entity"] not in terms:
                terms.append(law_stats["entity"])
            return {
                "status": "operational",
                "answer": structured_answer,
                "notice": (
                    "本回答由法規資料庫的 metadata、條文與判決引用統計直接整理；"
                    "引用編號可對應下方來源。這不是法律意見。"
                ),
                "citations": [],
                "judgments": [],
                "law_sources": law_sources,
                "matched_terms": terms,
                "answer_source": "structured",
                "llm_model": None,
                "embedding_model": settings.embedding_model or None,
                "retrieval": {
                    "status": "law_only",
                    "law_hits": len(law_sources),
                    "law_stats": law_stats or None,
                    "law_vector": law_vector,
                    "law_rerank": law_rerank,
                    "law_fusion": law_fusion,
                    "hits": 0,
                },
                "coverage": coverage,
                "duration_ms": _elapsed_ms(started),
            }

    if on_partial is not None and law_sources and not test_mode_enabled:
        try:
            partial_sources = [{**source} for source in law_sources]
            for source in partial_sources:
                source.pop("index", None)
            early_framework = build_insurance_responsibility_framework(
                question=question,
                session_factory=session_factory,
                law_data_dir=settings.law_data_dir,
                law_sources=partial_sources,
            )
            emit_partial(
                {
                    "status": "retrieving",
                    "answer": "正在檢索判決並生成 LLM 回答…",
                    "notice": (
                        "法規／命令結果已先顯示；判決檢索與 LLM 回答完成後"
                        "會自動接續更新。"
                    ),
                    "citations": [],
                    "judgments": [],
                    "law_sources": partial_sources,
                    "law_answer": _law_answer_summary(partial_sources),
                    "law_framework": early_framework,
                    "matched_terms": [
                        source["law_name"] for source in partial_sources
                    ],
                    "answer_source": "partial",
                    "llm_model": settings.llm_model or None,
                    "embedding_model": settings.embedding_model or None,
                    "retrieval": {
                        "status": "pending",
                        "hits": 0,
                        "law_hits": len(partial_sources),
                    },
                    "coverage": coverage,
                    "duration_ms": _elapsed_ms(started),
                    "partial": True,
                    "streaming": False,
                    "show_sources": False,
                }
            )
        except Exception:
            logger.debug("early law partial failed", exc_info=True)

    retrieval: Dict[str, Any] = {
        "status": "not_configured" if not settings.qdrant_url else "pending",
        "hits": 0,
        "unique_judgments": 0,
        "law_hits": len(law_sources),
        "law_article_limit": law_article_limit,
        "law_vector": law_vector,
        "law_rerank": law_rerank,
        "law_fusion": law_fusion,
        "query_expansion": legal_expansion,
    }
    if scope_probe_payload:
        retrieval["scope_probe"] = scope_probe_payload
        retrieval["scope_probe_notice"] = scope_probe_notice
    rerank_active = bool(
        settings.rag_rerank_enabled
        and (settings.rerank_url or settings.rerank_fallback_url)
    )
    candidate_k = max(
        1,
        settings.rag_rerank_candidates
        if rerank_active
        else settings.rag_top_k,
    )
    if rerank_active:
        candidate_k = max(candidate_k, settings.rag_top_k)
    query_filter: Optional[Dict[str, Any]] = None
    filter_meta: Dict[str, Any] = parsed_query.to_dict()
    query_plan = None
    structured_list_path = False
    qdrant_available = bool(settings.qdrant_url)
    if qdrant_available:
        try:
            with trace_segment(
                "rag.qdrant_precheck",
                module=__name__,
                function="QdrantStore.collection_info",
                params={"collection": search_collection},
            ):
                collection_info = store.collection_info(search_collection)
        except QdrantError as exc:
            qdrant_available = False
            retrieval = {
                "status": "unavailable",
                "hits": 0,
                "law_hits": len(law_sources),
                "law_vector": law_vector,
                "law_rerank": law_rerank,
                "law_fusion": law_fusion,
            }
            if not law_sources:
                return _preview_fallback(
                    session_factory=session_factory,
                    question=question,
                    started=started,
                    notice=f"Qdrant 無法連線（{exc}），先顯示法規 metadata 預覽。",
                    retrieval=retrieval,
                    coverage=coverage,
                )
        else:
            if collection_info is None:
                qdrant_available = False
                retrieval = {
                    "status": "not_indexed",
                    "hits": 0,
                    "law_hits": len(law_sources),
                    "law_vector": law_vector,
                    "law_rerank": law_rerank,
                    "law_fusion": law_fusion,
                }
                if not law_sources:
                    return _preview_fallback(
                        session_factory=session_factory,
                        question=question,
                        started=started,
                        notice=(
                            f"Qdrant collection「{search_collection}」尚未建立，"
                            "請先執行 judgment-index-vectors。"
                        ),
                        retrieval=retrieval,
                        coverage=coverage,
                    )

    if qdrant_available:
        should_apply_filters = bool(
            parsed_query.year_from is not None
            or parsed_query.courts
            or (parsed_query.topics and judgment_list_hint)
        )
        if parsed_query.has_filter and should_apply_filters:
            with trace_segment(
                "rag.query_filter",
                module=__name__,
                function="build_query_filter",
                params={
                    "question_length": len(question),
                    "parsed_query": parsed_query.to_dict(),
                },
            ) as filter_segment:
                query_filter, filter_meta = build_query_filter(
                    store, search_collection, parsed_query
                )
                if filter_segment is not None:
                    filter_segment["metadata"].update(filter_meta)
            if query_filter:
                candidate_k = max(candidate_k, 50)
        query_plan = build_query_plan(
            parsed_query=parsed_query,
            query_filter=bool(query_filter),
            judgment_list_hint=judgment_list_hint,
            law_first_hint=law_first_hint,
            rerank_available=rerank_active,
            lexical_available=settings.rag_lexical_rrf_enabled,
        )
        with trace_segment(
            "rag.query_plan",
            module=__name__,
            function="build_query_plan",
            params={"question_length": len(question)},
        ) as plan_segment:
            if plan_segment is not None:
                plan_segment["metadata"].update(query_plan.to_dict())
        try:
            if test_mode_enabled:
                from .observability import current_flow
                from .performance_test import run_test_mode

                flow = current_flow()
                with trace_segment(
                    "rag.test_mode",
                    module=__name__,
                    function="run_test_mode",
                    params={"request_id": flow.request_id if flow else ""},
                ):
                    return run_test_mode(
                        session_factory=session_factory,
                        question=question,
                        settings=settings,
                        coverage=coverage,
                        store=store,
                        request_id=flow.request_id if flow else "",
                        law_sources=law_sources,
                    )
        except Exception as exc:  # test mode must not break the normal RAG path
            logger.warning("test mode failed, falling back to normal RAG: %s", exc)

        try:
            structured_store_ok = (
                hasattr(store, "count") and hasattr(store, "scroll")
            )
            structured_list_ready = bool(
                query_plan
                and query_plan.enumerate
                and query_filter
                and structured_store_ok
                and not filter_meta.get("facet_error")
                and not scope_probe_zero
            )
            if structured_list_ready:
                total_matches = store.count(
                    search_collection,
                    query_filter=query_filter,
                    exact=True,
                )
                if total_matches == 0 or filter_meta.get(
                    "title_unresolved"
                ):
                    return _empty_judgment_list_payload(
                        question=question,
                        parsed_query=parsed_query,
                        filter_meta=filter_meta,
                        coverage=coverage,
                        law_sources=law_sources,
                        settings=settings,
                        started=started,
                        query_plan=query_plan,
                    )
                points, _ = store.scroll(
                    search_collection,
                    query_filter=query_filter,
                    limit=20,
                    order_by={
                        "key": "jdate_num",
                        "direction": "asc",
                    },
                    with_payload=True,
                )
                hits = [
                    {
                        "id": point.get("id"),
                        "payload": point.get("payload") or {},
                        "score": None,
                    }
                    for point in points
                ]
                structured_list_path = True
                retrieval = {
                    "status": "ok",
                    "mode": "structured_list",
                    "hits": len(hits),
                    "unique_judgments": len(hits),
                    "top_k": len(hits),
                    "score_threshold": None,
                    "total_matches": total_matches,
                    "query_filters": filter_meta,
                    "query_plan": query_plan.to_dict() if query_plan else None,
                }
            else:
                hits, retrieval = _search_hits(
                    settings=settings,
                    question=semantic_question,
                    store=store,
                    embedder=embedder,
                    collection=search_collection,
                    limit=candidate_k,
                    vector=(
                        None
                        if semantic_question != question
                        else query_vector
                    ),
                    query_filter=query_filter,
                )
                retrieval["query_expansion"] = legal_expansion
                if query_plan and query_plan.lexical and hits:
                    with trace_segment(
                        "rag.lexical_rrf",
                        module=__name__,
                        function="_apply_lexical_rrf",
                        params={
                            "candidate_count": len(hits),
                            "question_length": len(question),
                        },
                    ) as lexical_segment:
                        hits, hybrid_meta = _apply_lexical_rrf(
                            hits,
                            question,
                            lexical_weight=settings.rag_lexical_rrf_weight,
                        )
                        if lexical_segment is not None:
                            lexical_segment["metadata"].update(hybrid_meta)
                    retrieval["hybrid"] = hybrid_meta
            retrieval.setdefault("query_expansion", legal_expansion)
            retrieval["law_hits"] = len(law_sources)
            retrieval["law_article_limit"] = law_article_limit
            retrieval["law_vector"] = law_vector
            retrieval["law_rerank"] = law_rerank
            retrieval["law_fusion"] = law_fusion
            retrieval["candidate_k"] = candidate_k
            retrieval["query_filters"] = filter_meta
            retrieval["query_plan"] = (
                query_plan.to_dict() if query_plan else None
            )
        except (EmbeddingError, QdrantError) as exc:
            retrieval = {
                "status": "degraded",
                "hits": 0,
                "law_hits": len(law_sources),
                "law_vector": law_vector,
                "law_rerank": law_rerank,
                "law_fusion": law_fusion,
            }
            if not law_sources:
                return _preview_fallback(
                    session_factory=session_factory,
                    question=question,
                    started=started,
                    notice=f"向量檢索失敗（{exc}），先顯示法規 metadata 預覽。",
                    retrieval=retrieval,
                    coverage=coverage,
                )
            hits = []
    else:
        hits = []

    law_first = bool(
        law_sources
        and any(source.get("articles") for source in law_sources)
        and is_law_first_question(question, law_sources)
    )
    retrieval["mode"] = "law_first" if law_first else "judgment_first"
    retrieval["retrieval_mode"] = (
        "structured_list" if structured_list_path else "vector"
    )
    citation_start = 1
    if law_first:
        assign_law_indexes(law_sources, start=1)
        citation_start = len(law_sources) + 1

    citations: List[Dict[str, Any]] = []
    judgment_contexts: List[Dict[str, Any]] = []
    context_segment = None
    documents: Dict[str, JudgmentDocument] = {}
    if hits:
        documents = _fetch_documents(
            session_factory,
            [
                str((hit.get("payload") or {}).get("jid") or "")
                for hit in hits
            ],
        )
        hits = [
            hit
            for hit in hits
            if str((hit.get("payload") or {}).get("jid") or "")
            in documents
        ]
        deduped_hits: List[Dict[str, Any]] = []
        seen_jids = set()
        for hit in hits:
            jid = str((hit.get("payload") or {}).get("jid") or "")
            if not jid or jid in seen_jids:
                continue
            seen_jids.add(jid)
            deduped_hits.append(hit)
        hits = deduped_hits
        if parsed_query.has_filter:
            valid_hits = [
                hit
                for hit in hits
                if not violations(hit.get("payload") or {}, parsed_query)
            ]
            removed = len(hits) - len(valid_hits)
            if removed:
                retrieval["filter_violations_removed"] = removed
            hits = valid_hits
        if rerank_active and not structured_list_path:
            with trace_segment(
                "rag.rerank",
                module=__name__,
                function="RerankerClient.rerank",
                params={
                    "model": settings.rerank_model,
                    "question_length": len(question),
                    "candidate_count": len(hits),
                    "top_k": settings.rag_top_k,
                },
            ) as rerank_segment:
                hits, rerank_outcome = _rerank_hits(
                    settings=settings,
                    question=question,
                    hits=hits,
                    documents=documents,
                )
                if rerank_segment is not None:
                    top_scores = [
                        round(result.score, 4)
                        for result in rerank_outcome.results[:10]
                    ]
                    rerank_segment["metadata"].update(
                        {
                            "model": (
                                rerank_outcome.model
                                or settings.rerank_model
                            ),
                            "provider_name": rerank_outcome.provider,
                            "base_url": rerank_outcome.url,
                            "status": rerank_outcome.status,
                            "candidates": rerank_outcome.candidate_count,
                            "selected": rerank_outcome.selected_count,
                            "fallback_used": rerank_outcome.fallback_used,
                            "top_score": top_scores[0] if top_scores else None,
                            "scores": top_scores,
                            "errors": rerank_outcome.errors,
                            "usage": rerank_outcome.usage,
                        }
                    )
            retrieval["rerank"] = rerank_outcome.to_dict()
        elif structured_list_path:
            retrieval["rerank"] = {
                "status": "skipped",
                "reason": "structured_list",
            }
        else:
            hits = hits[: settings.rag_top_k]
            retrieval["rerank"] = {"status": "disabled"}
        if law_first:
            judgment_limit = max(
                1, settings.rag_law_first_judgment_limit
            )
            if len(hits) > judgment_limit:
                hits = hits[:judgment_limit]
            retrieval["judgment_limit"] = judgment_limit
        retrieval["top_k"] = len(hits)
        if hits:
            with trace_segment(
                "rag.context",
                module=__name__,
                function="_build_citations",
                params={
                    "hit_count": len(hits),
                    "max_context_chars": settings.rag_max_context_chars,
                },
            ) as context_segment:
                citations, judgment_contexts = _build_citations(
                    hits=hits,
                    documents=documents,
                    question=question,
                    max_context_chars=settings.rag_max_context_chars,
                    start_index=citation_start,
                )
                if context_segment is not None:
                    context_chars = sum(
                        len(str(context.get("text") or ""))
                        for context in judgment_contexts
                    )
                    context_segment["metadata"].update(
                        {
                            "documents": len(documents),
                            "chunks": len(judgment_contexts),
                            "citation_count": len(citations),
                            "context_chars": context_chars,
                            "token_estimate": max(1, context_chars // 3),
                        }
                    )
        elif rerank_active:
            retrieval["rerank"] = {
                "status": "empty",
                "model": settings.rerank_model,
                "candidate_count": 0,
            }
    elif rerank_active:
        retrieval["rerank"] = {
            "status": "empty",
            "model": settings.rerank_model,
            "candidate_count": 0,
        }

    if not citations and not law_sources:
        if not qdrant_available:
            status = retrieval.get("status")
            if not settings.qdrant_url:
                notice = "QDRANT_URL 未設定，目前先顯示可驗證的法規 metadata 預覽。"
            elif status == "unavailable":
                notice = "Qdrant 無法連線，先顯示法規 metadata 預覽。"
            elif status == "not_indexed":
                notice = (
                    f"Qdrant collection「{collection}」尚未建立，"
                    "先顯示法規 metadata 預覽。"
                )
            elif status == "degraded":
                notice = "向量檢索失敗，先顯示法規 metadata 預覽。"
            else:
                notice = "Qdrant 尚未就緒，先顯示法規 metadata 預覽。"
            return _preview_fallback(
                session_factory=session_factory,
                question=question,
                started=started,
                notice=notice,
                retrieval=retrieval,
                coverage=coverage,
            )
        return {
            "status": "retrieval_only",
            "answer": (
                "在目前已建立向量索引的判決中，找不到與這個問題足夠相似的片段，"
                "問題中也沒有可直接對應的法規或命令。"
                "請嘗試更具體的案件事實、法規名稱或爭點；系統不會在沒有來源時生成答案。"
            ),
            "notice": " ".join(
                part
                for part in (
                    (
                        f"索引涵蓋 {coverage['indexed_judgments']:,} / "
                        f"{coverage['total_judgments']:,} 筆判決，相似度門檻 "
                        f"{settings.rag_score_threshold}。"
                    ),
                    _list_query_notice(question, retrieval, 0),
                    scope_probe_notice,
                )
                if part
            ),
            "citations": [],
            "judgments": [],
            "law_sources": [],
            "matched_terms": [],
            "retrieval": retrieval,
            "coverage": coverage,
            "duration_ms": _elapsed_ms(started),
        }

    if not law_first:
        assign_law_indexes(law_sources, start=len(citations) + 1)
    law_answer = _law_answer_summary(law_sources)
    law_framework = build_insurance_responsibility_framework(
        question=question,
        session_factory=session_factory,
        law_data_dir=settings.law_data_dir,
        law_sources=law_sources,
    )
    law_contexts = [
        {**source, "text": law_source_text(source)} for source in law_sources
    ]
    contexts = (
        law_contexts + judgment_contexts
        if law_first
        else judgment_contexts + law_contexts
    )
    citation_total = len(law_sources) + len(citations)
    if context_segment is not None:
        context_chars = sum(
            len(str(context.get("text") or "")) for context in contexts
        )
        context_segment["metadata"].update(
            {
                "mode": "law_first" if law_first else "judgment_first",
                "chunks": len(contexts),
                "judgment_chunks": len(judgment_contexts),
                "law_chunks": len(law_contexts),
                "citation_count": citation_total,
                "context_chars": context_chars,
                "token_estimate": max(1, context_chars // 3),
            }
        )
    terms = [source["law_name"] for source in law_sources]
    if law_stats.get("entity") and law_stats["entity"] not in terms:
        terms.append(law_stats["entity"])
    llm_configured = bool(settings.llm_url and settings.llm_model)
    structured_judgment_list = bool(
        (structured_list_path or judgment_list_hint)
        and citations
        and not law_first
    )
    if on_partial is not None and (llm_configured or structured_judgment_list):
        emit_partial(
            {
                "status": "streaming",
                "answer": "",
                "notice": (
                    "判決清單整理中；完成後會顯示來源。"
                    if structured_judgment_list
                    else "判決與法規來源已先顯示；LLM 回答生成中，"
                    "完成後會驗證引用編號。"
                ),
                "citations": [],
                "judgments": citations,
                "law_sources": law_sources,
                "law_answer": law_answer,
                "law_framework": law_framework,
                "matched_terms": terms,
                "answer_source": "streaming",
                "llm_model": (
                    None
                    if structured_judgment_list
                    else settings.llm_model
                ),
                "embedding_model": settings.embedding_model or None,
                "retrieval": retrieval,
                "coverage": coverage,
                "duration_ms": _elapsed_ms(started),
                "partial": True,
                "streaming": True,
                "show_sources": True,
            }
        )
    if structured_judgment_list:
        answer = _judgment_list_answer(
            question,
            citations,
            documents,
            total_matches=retrieval.get("total_matches"),
            filter_meta=retrieval.get("query_filters"),
        )
        status = "operational"
        notice = (
            "以下判決清單由檢索到的判決來源直接整理，"
            "引用編號可對應下方判決。這不是法律意見。"
        )
    elif llm_configured:
        answer: Optional[str] = None
        last_error: Optional[Exception] = None
        for strict in (False, True):
            if strict and on_token is not None and on_token_reset is not None:
                try:
                    on_token_reset()
                except Exception:
                    logger.debug("LLM token reset callback failed", exc_info=True)
            try:
                candidate = _generate_answer(
                    settings=settings,
                    question=question,
                    contexts=contexts,
                    strict=strict,
                    on_token=on_token,
                )
                if not _valid_citation_markers(candidate, citation_total):
                    raise RuntimeError("LLM 回答缺少有效引用標記")
                answer = candidate
                break
            except Exception as exc:
                last_error = exc
        if answer is not None:
            status = "operational"
            if law_sources and citations:
                notice = (
                    "回答只根據檢索到的法規／命令與判決片段生成，"
                    "引用編號可對應下方來源。這不是法律意見。"
                )
            elif law_sources:
                notice = (
                    "回答只根據法規資料庫中的法規／命令與條文生成，"
                    "引用編號可對應下方來源。這不是法律意見。"
                )
            else:
                notice = (
                    "回答只根據檢索到的判決片段生成，引用編號可對應下方判決。"
                    "這不是法律意見。"
                )
        else:
            answer = _retrieval_answer(citations, law_sources)
            status = "retrieval_only"
            notice = (
                "LLM 無法產生可驗證的回答"
                f"（{last_error.__class__.__name__ if last_error else 'Error'}: "
                f"{last_error or '未知錯誤'}），"
                "已改為只顯示檢索結果，不生成推測內容。"
            )
    else:
        answer = _retrieval_answer(citations, law_sources)
        status = "retrieval_only"
        notice = "LLM_URL／LLM_MODEL 未設定，只顯示檢索結果，不生成推測內容。"

    if scope_probe_payload:
        retrieval["scope_probe"] = scope_probe_payload
        retrieval["scope_probe_notice"] = scope_probe_notice or None
    retrieval["law_hits"] = len(law_sources)
    retrieval["law_stats"] = law_stats or None
    list_notice = _list_query_notice(question, retrieval, len(citations))
    if list_notice:
        notice = f"{notice} {list_notice}".strip() if notice else list_notice
    if scope_probe_notice:
        notice = (
            f"{notice} {scope_probe_notice}".strip()
            if notice
            else scope_probe_notice
        )
    retrieval["scope_probe_notice"] = scope_probe_notice or None
    return {
        "status": status,
        "answer": answer,
        "notice": notice,
        "citations": [],
        "judgments": citations,
        "law_sources": law_sources,
        "law_answer": law_answer,
        "law_framework": law_framework,
        "matched_terms": terms,
        "answer_source": (
            "retrieval_list"
            if structured_judgment_list
            else "llm"
            if llm_configured and status == "operational"
            else "retrieval"
        ),
        "llm_model": (
            None
            if structured_judgment_list
            else settings.llm_model
            if llm_configured
            else None
        ),
        "embedding_model": settings.embedding_model or None,
        "retrieval": retrieval,
        "coverage": coverage,
        "duration_ms": _elapsed_ms(started),
    }
