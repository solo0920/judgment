from __future__ import annotations

import json
import logging
import re
import time
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple

import httpx
from sqlalchemy import select

from .config import Settings
from .embeddings import EmbeddingError, OllamaEmbedder
from .judgment_index import index_coverage
from .law_rag import (
    build_insurance_responsibility_framework,
    extract_stat_entity,
    is_article_count_question,
    is_citation_stats_question,
    is_history_question,
    is_related_laws_question,
    judgment_law_stats,
    law_source_text,
    law_sources_for_question,
    structured_law_answer,
)
from .models import JudgmentDocument
from .observability import trace_segment, traced
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "你是法律資料檢索助理。只能根據下方提供的判決片段、法規與命令內容回答，"
    "不得使用資料以外的知識，也不得創造案號、法院、日期或法條。"
    "每個結論後必須標註對應來源編號，例如 [1]；回答時要區分判決、法規與命令。"
    "若資料不足以回答，請直接說明「檢索到的資料不足以回答」，不要猜測。"
    "回答使用繁體中文，2 到 4 句，並提醒這不是法律意見。"
)

_CASE_NO_RE = re.compile(r"\b[A-Z]{2,6},\d{2,3},[^,\s]+,\d+,\d{8},\d+\b")
_CITATION_RE = re.compile(r"\[(\d{1,2}(?:\s*[,，、]\s*\d{1,2})*)\]")
_CITATION_NUMBER_RE = re.compile(r"\d{1,2}")
_INSUFFICIENT_RE = re.compile(r"(不足以回答|無法回答|沒有足夠|查無相關|未提及|無法判斷)")


def _elapsed_ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)


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
    payload["notice"] = notice
    payload["retrieval"] = retrieval
    payload["coverage"] = coverage
    payload["judgments"] = []
    payload["duration_ms"] = _elapsed_ms(started)
    return payload


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
    scored = [
        (index, _paragraph_score(paragraph, terms), paragraph)
        for index, paragraph in enumerate(paragraphs)
    ]
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
                select(JudgmentDocument).where(JudgmentDocument.jid.in_(list(jids)))
            ).all()
    return {record.jid: record for record in records}


@traced(
    "rag.search",
    module=__name__,
    params_fn=lambda *, question, settings, **_: {
        "question_length": len(question or ""),
        "collection": settings.judgment_vector_collection,
        "embedding_model": settings.embedding_model,
        "top_k": settings.rag_top_k,
        "score_threshold": settings.rag_score_threshold,
    },
)
def _search_hits(
    *,
    settings: Settings,
    question: str,
    store: QdrantStore,
    embedder: OllamaEmbedder,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    with trace_segment(
        "rag.embed_query",
        module=__name__,
        function="OllamaEmbedder.embed_query",
        params={
            "model": settings.embedding_model,
            "question_length": len(question),
        },
    ):
        vector = embedder.embed_query(question)
    started = time.perf_counter()
    with trace_segment(
        "rag.qdrant_search",
        module=__name__,
        function="QdrantStore.search",
        params={
            "collection": settings.judgment_vector_collection,
            "limit": settings.rag_top_k,
            "score_threshold": settings.rag_score_threshold,
        },
    ):
        hits = store.search(
            settings.judgment_vector_collection,
            vector,
            limit=max(1, settings.rag_top_k),
            score_threshold=settings.rag_score_threshold,
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
    return deduped, {
        "status": "ok",
        "latency_ms": latency_ms,
        "top_k": settings.rag_top_k,
        "score_threshold": settings.rag_score_threshold,
        "hits": len(hits),
        "unique_judgments": len(deduped),
        "top_score": round(float(deduped[0].get("score") or 0), 4) if deduped else None,
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
            line += "；相關條文：" + "、".join(article_nos[:3])
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


def _build_llm_prompt(
    *,
    question: str,
    contexts: Sequence[Dict[str, Any]],
) -> str:
    blocks = []
    for context in contexts:
        if context.get("kind") == "law":
            blocks.append(f"[{context['index']}] {law_source_text(context)}")
            continue
        laws = "、".join(context.get("matched_laws") or []) or "—"
        blocks.append(
            f"[{context['index']}] 判決案號：{context['jid']}\n"
            f"法院：{context['court']}｜裁判日期：{context['jdate']}｜案由：{context['title']}\n"
            f"命中法規：{laws}\n片段：{context['text']}"
        )
    return (
        f"問題：{question}\n\n參考資料（法規、命令與判決）：\n"
        + "\n\n".join(blocks)
        + "\n\n請直接回答問題，不要重複參考資料原文、案號清單或標題；"
        "使用 2 到 3 句繁體中文，每個結論後標註對應的 [n]；"
        "[n] 是參考資料來源編號，不是法律條號，條號請寫「第15條」。"
        "不要自行創造多個問題，並提醒這不是法律意見。"
    )


def _llm_request_payload(
    *,
    settings: Settings,
    model: str,
    question: str,
    contexts: Sequence[Dict[str, Any]],
    strict: bool,
    stream: bool,
) -> Tuple[Dict[str, Any], int]:
    user_prompt = _build_llm_prompt(question=question, contexts=contexts)
    system_prompt = SYSTEM_PROMPT
    if strict:
        system_prompt += (
            " 你上一次的回答缺少有效引用標記；這次每個結論後都必須加上 "
            "對應的 [n]，不得省略，也不得使用未提供的來源。"
        )
    return (
        {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": stream,
            "keep_alive": settings.llm_keep_alive,
            "options": {
                "temperature": 0.1,
                "num_ctx": settings.llm_num_ctx,
                "num_predict": settings.llm_num_predict,
            },
        },
        len(user_prompt),
    )


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
    markers. When ``on_token`` is provided, Ollama's streaming chat response is
    consumed and each content chunk is forwarded before the final answer is
    validated.
    """
    if not settings.llm_url or not model:
        raise RuntimeError("LLM_URL 或 LLM_MODEL 未設定")
    streaming = on_token is not None
    request_payload, prompt_chars = _llm_request_payload(
        settings=settings,
        model=model,
        question=question,
        contexts=contexts,
        strict=strict,
        stream=streaming,
    )
    url = f"{settings.llm_url.rstrip('/')}/api/chat"
    with trace_segment(
        "rag.llm_request",
        module=__name__,
        function="httpx.stream" if streaming else "httpx.post",
        params={
            "url": url,
            "model": model,
            "stream": streaming,
            "temperature": 0.1,
            "num_ctx": settings.llm_num_ctx,
            "num_predict": settings.llm_num_predict,
            "keep_alive": settings.llm_keep_alive,
            "timeout": timeout,
            "prompt_chars": prompt_chars,
        },
    ):
        if not streaming:
            response = httpx.post(url, json=request_payload, timeout=timeout)
            response.raise_for_status()
            payload = response.json()
            answer = str((payload.get("message") or {}).get("content") or "").strip()
        else:
            chunks: List[str] = []
            with httpx.stream(
                "POST", url, json=request_payload, timeout=timeout
            ) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if not line.strip():
                        continue
                    event = json.loads(line)
                    error = event.get("error")
                    if error:
                        raise RuntimeError(f"LLM 串流失敗：{error}")
                    content = str(
                        (event.get("message") or {}).get("content") or ""
                    )
                    if not content:
                        continue
                    chunks.append(content)
                    try:
                        on_token(content)
                    except Exception:
                        logger.debug("LLM token callback failed", exc_info=True)
            answer = "".join(chunks).strip()
    if not answer:
        raise RuntimeError("LLM 回傳空回答")
    return answer


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
) -> Dict[str, Any]:
    started = time.perf_counter()
    question = str(question or "").strip()
    if not question:
        raise ValueError("問題不可為空")

    def emit_partial(payload: Dict[str, Any]) -> None:
        if on_partial is None:
            return
        try:
            on_partial(payload)
        except Exception:
            logger.debug("partial answer callback failed", exc_info=True)

    collection = settings.judgment_vector_collection
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
        timeout=settings.embedding_timeout_seconds,
    )

    law_sources: List[Dict[str, Any]] = []
    law_stats: Dict[str, Any] = {}
    stat_entity = extract_stat_entity(question) if is_citation_stats_question(question) else ""
    try:
        with trace_segment(
            "rag.law_retrieval",
            module=__name__,
            function="law_sources_for_question",
            params={
                "question_length": len(question),
                "stat_entity": stat_entity or None,
            },
        ):
            if stat_entity:
                law_stats = judgment_law_stats(session_factory, stat_entity)
            law_sources = law_sources_for_question(
                session_factory,
                settings.law_data_dir,
                question,
                stats=law_stats,
            )
    except Exception as exc:
        logger.warning("law/order retrieval failed: %s", exc)
        law_sources = []
        law_stats = {}

    def assign_law_indexes(sources: Sequence[Dict[str, Any]], start: int = 1) -> None:
        for offset, source in enumerate(sources, start=start):
            source["index"] = offset

    test_mode_enabled = False
    try:
        from .runtime_settings import get_test_mode

        test_mode_enabled = bool(get_test_mode(session_factory))
    except Exception:
        test_mode_enabled = False

    if law_sources and not test_mode_enabled and (
        is_article_count_question(question)
        or is_history_question(question)
        or is_related_laws_question(question)
        or (law_stats and law_stats.get("articles"))
    ):
        assign_law_indexes(law_sources)
        if (
            is_article_count_question(question)
            or is_history_question(question)
            or is_related_laws_question(question)
        ):
            for source in law_sources:
                source["articles"] = []
        structured_answer = structured_law_answer(question, law_sources, law_stats)
        if structured_answer:
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
    }
    qdrant_available = bool(settings.qdrant_url)
    if qdrant_available:
        try:
            with trace_segment(
                "rag.qdrant_precheck",
                module=__name__,
                function="QdrantStore.collection_info",
                params={"collection": collection},
            ):
                collection_info = store.collection_info(collection)
        except QdrantError as exc:
            qdrant_available = False
            retrieval = {"status": "unavailable", "hits": 0, "law_hits": len(law_sources)}
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
                retrieval = {"status": "not_indexed", "hits": 0, "law_hits": len(law_sources)}
                if not law_sources:
                    return _preview_fallback(
                        session_factory=session_factory,
                        question=question,
                        started=started,
                        notice=(
                            f"Qdrant collection「{collection}」尚未建立，"
                            "請先執行 judgment-index-vectors。"
                        ),
                        retrieval=retrieval,
                        coverage=coverage,
                    )

    if qdrant_available:
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
            hits, retrieval = _search_hits(
                settings=settings,
                question=question,
                store=store,
                embedder=embedder,
            )
            retrieval["law_hits"] = len(law_sources)
        except (EmbeddingError, QdrantError) as exc:
            retrieval = {"status": "degraded", "hits": 0, "law_hits": len(law_sources)}
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

    citations: List[Dict[str, Any]] = []
    judgment_contexts: List[Dict[str, Any]] = []
    if hits:
        documents = _fetch_documents(
            session_factory,
            [str((hit.get("payload") or {}).get("jid") or "") for hit in hits],
        )
        hits = [
            hit
            for hit in hits
            if str((hit.get("payload") or {}).get("jid") or "") in documents
        ]
        citations, judgment_contexts = _build_citations(
            hits=hits,
            documents=documents,
            question=question,
            max_context_chars=settings.rag_max_context_chars,
            start_index=1,
        )

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
            "notice": (
                f"索引涵蓋 {coverage['indexed_judgments']:,} / "
                f"{coverage['total_judgments']:,} 筆判決，相似度門檻 "
                f"{settings.rag_score_threshold}。"
            ),
            "citations": [],
            "judgments": [],
            "law_sources": [],
            "matched_terms": [],
            "retrieval": retrieval,
            "coverage": coverage,
            "duration_ms": _elapsed_ms(started),
        }

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
    contexts = judgment_contexts + law_contexts
    citation_total = len(law_sources) + len(citations)
    terms = [source["law_name"] for source in law_sources]
    if law_stats.get("entity") and law_stats["entity"] not in terms:
        terms.append(law_stats["entity"])
    llm_configured = bool(settings.llm_url and settings.llm_model)
    if on_partial is not None and llm_configured:
        emit_partial(
            {
                "status": "streaming",
                "answer": "",
                "notice": (
                    "判決與法規來源已先顯示；LLM 回答生成中，"
                    "完成後會驗證引用編號。"
                ),
                "citations": [],
                "judgments": citations,
                "law_sources": law_sources,
                "law_answer": law_answer,
                "law_framework": law_framework,
                "matched_terms": terms,
                "answer_source": "streaming",
                "llm_model": settings.llm_model,
                "embedding_model": settings.embedding_model or None,
                "retrieval": retrieval,
                "coverage": coverage,
                "duration_ms": _elapsed_ms(started),
                "partial": True,
                "streaming": True,
                "show_sources": True,
            }
        )
    if llm_configured:
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

    retrieval["law_hits"] = len(law_sources)
    retrieval["law_stats"] = law_stats or None
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
        "answer_source": "llm" if llm_configured and status == "operational" else "retrieval",
        "llm_model": settings.llm_model if llm_configured else None,
        "embedding_model": settings.embedding_model or None,
        "retrieval": retrieval,
        "coverage": coverage,
        "duration_ms": _elapsed_ms(started),
    }
