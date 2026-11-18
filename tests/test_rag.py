from __future__ import annotations

import json
from pathlib import Path

import httpx
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.judgment_index import (
    build_index_text,
    cached_index_staleness,
    index_coverage,
    index_judgments,
)
from judgment.models import (
    Base,
    JudgmentDocument,
    LawDatasetVersion,
    LawDocument,
    PerformanceRecord,
)
from judgment.observability import clear_flow, start_flow
from judgment.rag import (
    _best_judgment_snippet,
    _fit_contexts_to_prompt_budget,
    _guard_prompt_tokens,
    _raise_for_llm_status,
    _judgment_list_answer,
    _llm_request_payload,
    _map_letter_markers,
    _CitationMarkerMapper,
    _citation_audit,
    _citation_retry_action,
    CitationValidationError,
    _search_legal_articles,
    _valid_citation_markers,
    answer_question,
    estimate_prompt_tokens,
    extract_excerpt,
    generate_answer_with_model,
    is_judgment_list_question,
    is_list_all_question,
    warm_index_coverage,
    warm_index_staleness,
)
from judgment.rerank import RerankOutcome, RerankResult
from judgment.law_rag import (
    _article_ref_key,
    _extract_article_refs,
    _rrf_fuse,
    build_insurance_responsibility_framework,
    is_law_first_question,
    is_related_laws_question,
    law_sources_for_question,
    select_law_articles,
)


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("data/laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
        "judgment_vector_collection": "judgment_documents",
        "embedding_model": "bge-m3",
    }
    values.update(overrides)
    return Settings(**values)


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


def test_prompt_token_estimate_is_conservative_for_chinese() -> None:
    text = "違約交割" * 100
    assert estimate_prompt_tokens(text) >= 400
    assert estimate_prompt_tokens(text) > len(text) // 3


def test_fit_contexts_truncates_to_prompt_budget() -> None:
    settings = _settings(llm_num_ctx=4096, llm_num_predict=384)
    contexts = [
        {"index": 1, "text": "違約交割" * 4000},
        {"index": 2, "text": "人頭帳戶" * 4000},
    ]
    fitted, meta = _fit_contexts_to_prompt_budget(
        settings=settings,
        question="違約交割的判決",
        contexts=contexts,
    )
    assert meta["prompt_tokens_estimated"] <= meta["context_budget_tokens"]
    assert meta["contexts_after"] < meta["contexts_before"]
    assert meta["text_truncated"] is True or meta["contexts_dropped"] > 0


def test_prompt_token_guard_rejects_actual_overflow() -> None:
    provider = type(
        "Provider", (), {"role": "primary", "api": "openai"}
    )()
    with pytest.raises(RuntimeError, match="exceeded context window"):
        _guard_prompt_tokens(
            usage={"input_tokens": 4300},
            budget_meta={"ctx_tokens": 4096},
            provider=provider,
        )
    with pytest.raises(RuntimeError, match="too close to context window"):
        _guard_prompt_tokens(
            usage={"input_tokens": 4020},
            budget_meta={
                "ctx_tokens": 4096,
                "prompt_tokens_estimated": 3900,
            },
            provider=provider,
        )
    budget_meta = {
        "ctx_tokens": 4096,
        "prompt_tokens_estimated": 2600,
    }
    _guard_prompt_tokens(
        usage={"input_tokens": 2000},
        budget_meta=budget_meta,
        provider=provider,
    )
    assert budget_meta["prompt_token_estimate_ratio"] == 1.3
    assert budget_meta["prompt_tokens_suspected_truncation"] is True


def test_llm_request_payload_sends_numeric_keep_alive_as_number() -> None:
    numeric, _ = _llm_request_payload(
        settings=_settings(llm_keep_alive="-1"),
        model="gemma3:4b",
        question="測試",
        contexts=[],
        strict=False,
        stream=False,
    )
    assert numeric["keep_alive"] == -1

    duration, _ = _llm_request_payload(
        settings=_settings(llm_keep_alive="30m"),
        model="gemma3:4b",
        question="測試",
        contexts=[],
        strict=False,
        stream=False,
    )
    assert duration["keep_alive"] == "30m"


def _seed_judgments(session_factory, count: int = 3) -> None:
    with session_factory() as session:
        for index in range(count):
            text = (
                f"臺灣臺北地方法院民事判決 114年度訴字第{index + 1}號\n"
                "原告主張被告向其借款，屆期未清償，依消費借貸法律關係請求返還。\n"
                "被告辯稱已部分清償，惟未舉證以實其說。\n"
                "本院審酌借據、匯款紀錄與兩造陳述，認原告主張為有理由。\n"
                "主文：被告應給付原告新臺幣壹佰萬元及法定遲延利息。"
            )
            session.add(
                JudgmentDocument(
                    jid=f"TPDV,114,訴,{index + 1},20260101,1",
                    jyear="114",
                    jcase="訴",
                    jno=str(index + 1),
                    jdate="20260101",
                    court="臺灣臺北地方法院民事",
                    court_normalized="臺灣臺北地方法院",
                    title="清償借款",
                    full_text=text,
                    full_text_length=len(text),
                    content_hash=f"{index + 1:064d}",
                    matched_laws=["銀行法"],
                    matched_laws_text="銀行法",
                    citations=[
                        {"law_name": "銀行法", "article_no": "第 1 條"}
                    ],
                    citation_count=1,
                    source_archive="test.rar",
                )
            )
        session.commit()


class FakeEmbedder:
    configured = True

    def __init__(self) -> None:
        self.calls = []

    def embed(self, texts):
        self.calls.append(list(texts))
        return [[0.1, 0.2, 0.3, 0.4] for _ in texts]

    def embed_query(self, text):
        self.calls.append([text])
        return [0.1, 0.2, 0.3, 0.4]


class FakeStore:
    configured = True

    def __init__(self) -> None:
        self.points = {}
        self.collection_created = False
        self.indexes = []

    def ensure_collection(self, collection, *, size, distance="Cosine"):
        created = not self.collection_created
        self.collection_created = True
        self.size = size
        return created

    def ensure_payload_index(self, collection, field_name, field_schema="keyword"):
        self.indexes.append(field_name)

    def upsert(self, collection, points, *, wait=True):
        for point in points:
            self.points[point["id"]] = point

    def collection_count(self, collection):
        return len(self.points)

    def delete_collection(self, collection):
        self.points.clear()

    def collection_info(self, collection):
        return {"points_count": len(self.points)}

    def search(self, collection, vector, **kwargs):
        return [
            {
                "score": 0.91,
                "payload": {
                    "jid": "TPDV,114,訴,1,20260101,1",
                    "court": "臺灣臺北地方法院",
                    "title": "清償借款",
                    "jdate": "20260101",
                    "matched_laws": ["銀行法"],
                    "snippet": "原告主張被告向其借款。",
                },
            }
        ]


class MultiHitStore(FakeStore):
    def search(self, collection, vector, *, limit=4, **kwargs):
        hits = []
        for index in range(1, 4):
            hits.append(
                {
                    "score": round(0.9 - index * 0.01, 4),
                    "payload": {
                        "jid": f"TPDV,114,訴,{index},20260101,1",
                        "court": "臺灣臺北地方法院",
                        "title": "清償借款",
                        "jdate": "20260101",
                        "matched_laws": ["銀行法"],
                        "snippet": "原告主張被告向其借款。",
                    },
                }
            )
        return hits[:limit]


class LegalVectorStore(MultiHitStore):
    def get_alias(self, alias):
        if alias == "legal_articles_current":
            return "legal_articles_v001"
        if alias == "judgments_current":
            return "judgments_v002"
        return None

    def collection_info(self, collection):
        return {"points_count": 10}

    def search(self, collection, vector, *, limit=4, **kwargs):
        if "legal_articles" in collection:
            return [
                {
                    "score": 0.88,
                    "payload": {
                        "law_name": "銀行法",
                        "law_key": "BANK",
                        "source_type": "law",
                        "article_no": "第 18 條",
                    },
                }
            ][:limit]
        return super().search(collection, vector, limit=limit, **kwargs)


class NoLegalVectorStore(MultiHitStore):
    def get_alias(self, alias):
        if alias == "judgments_current":
            return "judgments_v002"
        return None

    def collection_info(self, collection):
        if "legal_articles" in collection:
            return None
        return super().collection_info(collection)


def _security_law_articles() -> list[dict]:
    return [
        {
            "article_no": "第 153 條",
            "article_content": (
                "證券交易所之會員或證券經紀商、證券自營商在證券交易所市場"
                "買賣證券，買賣一方不履行交付義務時，證券交易所應指定其他會員代為交付。"
            ),
        },
        {
            "article_no": "第 155 條",
            "article_content": (
                "對於在證券交易所上市之有價證券，不得有下列各款之行為："
                "意圖抬高或壓低集中交易市場某種有價證券之交易價格，"
                "自行或以他人名義連續以高價買入或以低價賣出。"
            ),
        },
        {
            "article_no": "第 157-1 條",
            "article_content": (
                "下列各款之人，實際知悉發行股票公司有重大影響其股票價格之消息時，"
                "在該消息明確後，未公開前或公開後十八小時內，不得對該公司之"
                "上市或在證券商營業處所買賣之股票自行或以他人名義買入或賣出。"
            ),
        },
        {
            "article_no": "第 171 條",
            "article_content": (
                "有下列情事之一者，處三年以上十年以下有期徒刑："
                "一、違反第一百五十五條第一項、第二項、第一百五十七條之一"
                "第一項或第二項規定。"
            ),
        },
        {
            "article_no": "第 43 條",
            "article_content": (
                "在證券交易所上市或證券商營業處所買賣之有價證券之給付或交割，"
                "應以現款、現貨為之。"
            ),
        },
    ]



def test_build_index_text_keeps_head_and_tail() -> None:
    text = "A" * 2000 + "MIDDLE" + "B" * 2000
    built = build_index_text(
        court="臺灣臺北地方法院",
        title="清償借款",
        jdate="20260101",
        matched_laws=["銀行法", "民法"],
        full_text=text,
        max_chars=800,
    )
    assert "臺灣臺北地方法院" in built
    assert "命中法規：銀行法、民法" in built
    assert "…" in built
    assert built.endswith("B")
    assert len(built) <= 840


def test_extract_excerpt_prefers_paragraph_with_question_terms() -> None:
    text = "第一段與問題無關。\n第二段說明銀行法吸收存款與授信的限制。\n第三段是其他內容。"
    excerpt = extract_excerpt(text, "銀行法吸收存款的限制", budget=200)
    assert "吸收存款" in excerpt


def test_extract_excerpt_handles_term_split_across_lines() -> None:
    text = "第一段無關。\n主文：被告犯詐\r\n欺取財罪。\n第三段無關。"
    excerpt = extract_excerpt(text, "詐欺取財罪", budget=200)
    assert "詐" in excerpt
    assert "欺取財罪" in excerpt


def test_extract_excerpt_preserves_original_spacing() -> None:
    text = "第一段無關。\n被告使用 Telegram 暱稱，詐騙新臺幣 10 萬元。"
    excerpt = extract_excerpt(text, "詐騙金額與聯絡方式", budget=200)
    assert "Telegram 暱稱" in excerpt
    assert "新臺幣 10 萬元" in excerpt


def test_valid_citation_markers_accepts_lists_and_grounded_refusals() -> None:
    assert _valid_citation_markers("依判決片段 [1] 可知。", 3)
    assert _valid_citation_markers("依判決片段 [1, 2, 3] 可知。", 3)
    assert not _valid_citation_markers("依判決片段 [9] 可知。", 3)
    assert not _valid_citation_markers("沒有來源的回答。", 3)
    assert _valid_citation_markers("檢索到的判決片段不足以回答。", 3)
    assert not _valid_citation_markers(
        "檢索到的判決片段不足以回答，但可參考 TPDV,114,訴,99,20260101,1。",
        3,
    )


def test_index_judgments_is_resumable_and_reports_coverage() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    store = FakeStore()
    embedder = FakeEmbedder()
    settings = _settings()

    first = index_judgments(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        batch_size=2,
        run_label="2",
    )
    assert first["status"] == "success"
    assert first["task"] == "2"
    assert first["scanned_count"] == 3
    assert first["indexed_count"] == 3
    assert first["dimensions"] == 4
    assert store.collection_created is True
    assert set(store.indexes) == {
        "jid",
        "court",
        "jdate",
        "source_archive",
        "title",
        "source_year",
        "jdate_num",
    }
    assert first["coverage"]["indexed_judgments"] == 3
    assert first["coverage"]["remaining_judgments"] == 0
    assert first["batch_count"] == 2
    assert first["points_per_second"] > 0
    assert first["batch_avg_ms"] >= 0
    with session_factory() as session:
        record = session.scalars(
            select(PerformanceRecord)
            .where(PerformanceRecord.process == "判決向量索引")
            .order_by(PerformanceRecord.id.desc())
            .limit(1)
        ).one()
    assert record.details["batch_count"] == 2
    assert record.details["points_per_second"] > 0
    assert record.details["progress"]
    assert record.details["task"] == "2"
    assert record.params["task"] == "2"

    second = index_judgments(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        batch_size=2,
    )
    assert second["scanned_count"] == 0
    assert second["indexed_count"] == 0
    assert len(store.points) == 3


def test_index_judgments_dry_run_does_not_call_services() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    summary = index_judgments(
        session_factory=session_factory,
        settings=_settings(),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        dry_run=True,
    )
    assert summary["status"] == "dry_run"
    assert summary["scanned_count"] == 3
    assert summary["indexed_count"] == 0
    assert index_coverage(
        session_factory,
        collection="judgment_documents",
        model="bge-m3",
    )["indexed_judgments"] == 0


def test_cached_index_coverage_reuses_and_invalidates(monkeypatch) -> None:
    from judgment import judgment_index as module

    session_factory = _session_factory()
    calls = {"n": 0}

    def fake_index_coverage(
        session_factory,
        *,
        collection: str,
        model: str,
        version_id: int | None = None,
    ) -> dict:
        calls["n"] += 1
        return {
            "total_judgments": 10,
            "indexed_judgments": calls["n"],
            "remaining_judgments": 10 - calls["n"],
            "collection": collection,
            "model": model,
            "version_id": version_id,
            "latest_indexed_at": None,
        }

    monkeypatch.setattr(module, "index_coverage", fake_index_coverage)
    module.invalidate_index_coverage()
    try:
        first = module.cached_index_coverage(
            session_factory,
            collection="coverage-test",
            model="bge-m3",
            version_id=1,
        )
        second_stats: dict = {}
        second = module.cached_index_coverage(
            session_factory,
            collection="coverage-test",
            model="bge-m3",
            version_id=1,
            cache_stats=second_stats,
        )
        assert calls["n"] == 1
        assert second["indexed_judgments"] == first["indexed_judgments"] == 1
        assert second_stats["cache_hit"] is True

        module.invalidate_index_coverage(
            collection="coverage-test",
            model="bge-m3",
            version_id=1,
        )
        third = module.cached_index_coverage(
            session_factory,
            collection="coverage-test",
            model="bge-m3",
            version_id=1,
        )
        assert calls["n"] == 2
        assert third["indexed_judgments"] == 2
    finally:
        module.invalidate_index_coverage()


def test_warm_index_coverage_populates_and_forces_refresh(monkeypatch) -> None:
    from judgment import judgment_index as module

    session_factory = _session_factory()
    calls = {"n": 0}

    def fake_index_coverage(
        session_factory,
        *,
        collection: str,
        model: str,
        version_id: int | None = None,
    ) -> dict:
        calls["n"] += 1
        return {
            "total_judgments": 10,
            "indexed_judgments": calls["n"],
            "remaining_judgments": 10 - calls["n"],
            "collection": collection,
            "model": model,
            "version_id": version_id,
            "latest_indexed_at": None,
        }

    monkeypatch.setattr(module, "index_coverage", fake_index_coverage)
    module.invalidate_index_coverage()
    try:
        first = warm_index_coverage(session_factory, _settings())
        second = warm_index_coverage(
            session_factory, _settings(), force_refresh=False
        )
        assert calls["n"] == 1
        assert second == first

        forced = warm_index_coverage(session_factory, _settings())
        assert calls["n"] == 2
        assert forced["indexed_judgments"] == 2
    finally:
        module.invalidate_index_coverage()


def test_cached_index_staleness_reuses_and_invalidates(monkeypatch) -> None:
    from judgment import judgment_index as module

    session_factory = _session_factory()
    calls = {"n": 0}

    def fake_index_staleness(
        session_factory,
        *,
        collection: str,
        model: str,
        version_id: int | None = None,
    ) -> dict:
        calls["n"] += 1
        return {
            "status": "fresh" if calls["n"] > 1 else "stale",
            "fresh": calls["n"] > 1,
            "total_judgments": 10,
            "indexed_judgments": 10,
            "missing_judgments": 0,
            "changed_judgments": 0,
            "stale_judgments": 0,
            "pending_judgments": 0,
            "collection": collection,
            "model": model,
            "version_id": version_id,
        }

    monkeypatch.setattr(module, "index_staleness", fake_index_staleness)
    module.invalidate_index_coverage()
    try:
        first = cached_index_staleness(
            session_factory,
            collection="staleness-test",
            model="bge-m3",
            version_id=1,
        )
        second_stats: dict = {}
        second = cached_index_staleness(
            session_factory,
            collection="staleness-test",
            model="bge-m3",
            version_id=1,
            cache_stats=second_stats,
        )
        assert calls["n"] == 1
        assert second["status"] == first["status"] == "stale"
        assert second_stats["cache_hit"] is True

        module.invalidate_index_coverage(
            collection="staleness-test",
            model="bge-m3",
            version_id=1,
        )
        third = cached_index_staleness(
            session_factory,
            collection="staleness-test",
            model="bge-m3",
            version_id=1,
        )
        assert calls["n"] == 2
        assert third["status"] == "fresh"
    finally:
        module.invalidate_index_coverage()


def test_warm_index_staleness_populates_and_forces_refresh(monkeypatch) -> None:
    from judgment import judgment_index as module

    session_factory = _session_factory()
    calls = {"n": 0}

    def fake_index_staleness(
        session_factory,
        *,
        collection: str,
        model: str,
        version_id: int | None = None,
    ) -> dict:
        calls["n"] += 1
        return {
            "status": "fresh",
            "fresh": True,
            "total_judgments": 10,
            "indexed_judgments": 10,
            "missing_judgments": 0,
            "changed_judgments": 0,
            "stale_judgments": 0,
            "pending_judgments": 0,
            "collection": collection,
            "model": model,
            "version_id": version_id,
        }

    monkeypatch.setattr(module, "index_staleness", fake_index_staleness)
    module.invalidate_index_coverage()
    try:
        first = warm_index_staleness(session_factory, _settings())
        second = warm_index_staleness(
            session_factory, _settings(), force_refresh=False
        )
        assert calls["n"] == 1
        assert second == first

        warm_index_staleness(session_factory, _settings())
        assert calls["n"] == 2
    finally:
        module.invalidate_index_coverage()


def test_llm_error_segment_records_provider(monkeypatch) -> None:
    def fake_post(url, **kwargs):
        raise httpx.ConnectError("x570 unavailable")

    monkeypatch.setattr("judgment.rag.httpx.post", fake_post)
    flow = start_flow(request_id="provider-error", entrypoint="/api/rag/query")
    try:
        with pytest.raises(RuntimeError):
            generate_answer_with_model(
                settings=_settings(
                    llm_url="http://x570:11436",
                    llm_api="openai",
                    llm_model="gemma3:4b",
                ),
                model="gemma3:4b",
                question="測試問題",
                contexts=_rag_context(),
                timeout=1,
            )
    finally:
        clear_flow()

    segments = [
        segment
        for segment in flow.to_dict()["segments"]
        if segment["name"] == "rag.llm_request"
    ]
    assert len(segments) == 1
    assert segments[0]["status"] == "error"
    assert segments[0]["metadata"]["provider"] == "primary"
    assert segments[0]["metadata"]["base_url"] == "http://x570:11436"
    assert segments[0]["metadata"]["stream"] is False


def test_answer_question_returns_retrieval_only_without_llm(monkeypatch) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(qdrant_url="http://qdrant.test", embedding_url="http://ollama.test")

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法如何處理消費借貸爭議？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )
    assert payload["status"] == "retrieval_only"
    assert payload["citations"] == []
    assert len(payload["judgments"]) == 1
    assert payload["judgments"][0]["jid"] == "TPDV,114,訴,1,20260101,1"
    assert payload["coverage"]["indexed_judgments"] == 0
    assert "LLM_URL" in payload["notice"]


def test_is_list_all_question_detects_exhaustive_judgment_requests() -> None:
    assert is_list_all_question("可以找出近5年所有違約交割的判決嗎?")
    assert is_list_all_question("請列出全部返還借款案件")
    assert is_list_all_question("list all judgments about loan repayment")
    assert not is_list_all_question("違約交割有那些罰則?")
    assert not is_list_all_question("原告如何請求返還借款?")


def test_judgment_list_answer_has_fraud_caveat_and_complete_list_hint() -> None:
    answer = _judgment_list_answer(
        "2000年至2010年在板橋地方法院相關詐騙的判決有那些",
        [
            {
                "index": 1,
                "jid": "PCDM,96,簡,1,20070504,1",
                "court": "臺灣新北地方法院",
                "jdate": "20070504",
                "title": "洗錢防制法",
                "snippet": "被告幫助洗錢。",
            }
        ],
        total_matches=210,
        filter_meta={
            "courts": ["臺灣新北地方法院", "臺灣板橋地方法院"],
            "year_from": 2000,
            "year_to": 2010,
            "topics": ["詐欺"],
        },
    )
    assert "查詢條件（可複製）" in answer
    assert "案由含詐欺" in answer
    assert "不含案由不同但內容涉及詐欺" in answer
    assert "完整 210 筆清單" in answer
    assert "資料庫查詢" in answer


def test_semantic_query_stays_unexpanded_when_registry_disabled() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory, count=1)
    embedder = FakeEmbedder()
    payload = answer_question(
        session_factory=session_factory,
        question="人頭帳戶有什麼實務見解",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
            rag_legal_expansion_enabled=True,
        ),
        store=FakeStore(),
        embedder=embedder,
        enable_law_retrieval=False,
    )
    embedded_queries = [call[0] for call in embedder.calls if call]
    assert embedded_queries
    assert all("幫助詐欺" not in query for query in embedded_queries)
    assert payload["retrieval"]["query_expansion"]["enabled"] is False


def test_semantic_query_legal_expansion_is_off_by_default() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory, count=1)
    embedder = FakeEmbedder()
    payload = answer_question(
        session_factory=session_factory,
        question="人頭帳戶有什麼實務見解",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
        ),
        store=FakeStore(),
        embedder=embedder,
        enable_law_retrieval=False,
    )
    embedded_queries = [call[0] for call in embedder.calls if call]
    assert embedded_queries
    assert all("幫助詐欺" not in query for query in embedded_queries)
    assert payload["retrieval"]["query_expansion"]["enabled"] is False


def test_answer_question_uses_exact_keyword_list_for_settlement_default() -> None:
    session_factory = _session_factory()
    with session_factory() as session:
        target_text = (
            "臺灣士林地方法院民事判決 八十九年度訴字第三六七號\n"
            "原告主張被告未依約給付交割款，為避免違約交割，"
            "乃調度資金存入客戶帳戶。\n"
            "本院審酌兩造陳述與交易紀錄，認原告主張為有理由。"
        )
        session.add(
            JudgmentDocument(
                jid="SLDV,89,訴,367,20000728",
                jyear="89",
                jcase="訴",
                jno="367",
                jdate="20000728",
                court="臺灣士林地方法院民事",
                court_normalized="臺灣士林地方法院",
                title="侵權行為損害賠償",
                full_text=target_text,
                full_text_length=len(target_text),
                content_hash="target",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        noise_text = (
            "臺灣士林地方法院民事判決 八十八年度訴字第四五八號\n"
            "兩造約定違約金二百萬元，被告未履行契約，原告請求給付違約金。"
        )
        session.add(
            JudgmentDocument(
                jid="SLDV,88,訴,458,20000706",
                jyear="88",
                jcase="訴",
                jno="458",
                jdate="20000706",
                court="臺灣士林地方法院民事",
                court_normalized="臺灣士林地方法院",
                title="給付違約金",
                full_text=noise_text,
                full_text_length=len(noise_text),
                content_hash="noise",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()

    payload = answer_question(
        session_factory=session_factory,
        question="士林地方法院在1995到2000年間有什麼和違約交割相關的案子?",
        settings=_settings(qdrant_url=""),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["answer_source"] == "retrieval_list"
    assert payload["retrieval"]["retrieval_mode"] == "keyword_list"
    assert payload["retrieval"]["total_matches"] == 1
    assert payload["judgments"][0]["jid"] == "SLDV,89,訴,367,20000728"
    assert "違約交割" in payload["answer"]
    assert "給付違約金" not in payload["answer"]


def test_answer_question_refuses_when_exact_keyword_has_no_match() -> None:
    session_factory = _session_factory()
    with session_factory() as session:
        text = (
            "臺灣士林地方法院民事判決 八十八年度訴字第四五八號\n"
            "兩造約定違約金二百萬元，被告未履行契約，原告請求給付違約金。"
        )
        session.add(
            JudgmentDocument(
                jid="SLDV,88,訴,458,20000706",
                jyear="88",
                jcase="訴",
                jno="458",
                jdate="20000706",
                court="臺灣士林地方法院民事",
                court_normalized="臺灣士林地方法院",
                title="給付違約金",
                full_text=text,
                full_text_length=len(text),
                content_hash="noise",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()

    payload = answer_question(
        session_factory=session_factory,
        question="士林地方法院在1995到2000年間有什麼和違約交割相關的案子?",
        settings=_settings(qdrant_url=""),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] == "keyword_list"
    assert payload["retrieval"]["total_matches"] == 0
    assert "查無" in payload["answer"]
    assert "沒有改用其他近似詞" in payload["answer"]
    assert payload["judgments"] == []


def test_external_scope_term_zero_hit_uses_semantic_disclosure() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="臺灣臺北地方法院2026年借款糾紛案件有哪些",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
        ),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] != "keyword_list"
    probe = payload["retrieval"]["scope_probe"]
    assert probe["zero_terms"][0]["term"] == "借款糾紛"
    assert "借款糾紛" in payload["notice"]
    assert "語意" in payload["notice"]
    assert "沒有改用其他近似詞" not in payload["answer"]


def test_external_scope_term_zero_hit_skips_structured_list() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)

    class StructuredButUnsafeStore(FakeStore):
        def facet(
            self,
            collection,
            key,
            *,
            query_filter=None,
            limit=500,
            exact=True,
        ):
            return [{"value": "清償借款", "count": 1}]

        def count(self, collection, *, query_filter=None, exact=True):
            raise AssertionError("external zero-hit must not enumerate titles")

        def scroll(self, collection, **kwargs):
            raise AssertionError("external zero-hit must not enumerate titles")

    payload = answer_question(
        session_factory=session_factory,
        question="臺灣臺北地方法院2026年借款糾紛案件有哪些",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
        ),
        store=StructuredButUnsafeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] != "structured_list"
    assert payload["retrieval"]["scope_probe"]["zero_terms"][0][
        "term"
    ] == "借款糾紛"
    assert "語意" in payload["notice"]


def test_scope_probe_year_only_uses_semantic_disclosure() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="2026年關於借款糾紛的見解",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
        ),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] != "keyword_list"
    assert payload["retrieval"]["scope_probe"]["zero_terms"][0][
        "term"
    ] == "借款糾紛"
    assert "語意" in payload["notice"]


def test_scope_probe_year_only_hit_returns_keyword_list() -> None:
    session_factory = _session_factory()
    with session_factory() as session:
        text = (
            "臺灣臺北地方法院民事判決 114年度訴字第9號\n"
            "原告主張兩造間有借款糾紛，被告屆期未清償。"
        )
        session.add(
            JudgmentDocument(
                jid="TPDV,114,訴,9,20260101,1",
                jyear="114",
                jcase="訴",
                jno="9",
                jdate="20260101",
                court="臺灣臺北地方法院民事",
                court_normalized="臺灣臺北地方法院",
                title="返還借款",
                full_text=text,
                full_text_length=len(text),
                content_hash="year-only-hit",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()

    payload = answer_question(
        session_factory=session_factory,
        question="2026年借款糾紛案件有哪些",
        settings=_settings(qdrant_url=""),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] == "keyword_list"
    assert payload["retrieval"]["total_matches"] == 1
    assert payload["retrieval"]["query_filters"]["courts"] == []


def test_scope_probe_zero_hit_does_not_call_llm(monkeypatch) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)

    def fail_generate_answer(*args, **kwargs):
        raise AssertionError("zero-hit scope probe must not call the LLM")

    monkeypatch.setattr(
        "judgment.rag._generate_answer", fail_generate_answer
    )
    payload = answer_question(
        session_factory=session_factory,
        question="臺灣臺北地方法院2026年借款糾紛案件有哪些",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
            llm_url="http://llm.test",
            llm_model="fake",
        ),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["answer_source"] == "retrieval_list"
    assert "語意" in payload["notice"]


def test_scope_probe_too_large_discloses_and_uses_semantic() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="臺灣臺北地方法院2026年借款糾紛案件有哪些",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
            rag_scope_probe_max_documents=1,
        ),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["scope_probe"]["status"] == (
        "scope_too_large"
    )
    assert "超過精確探測上限" in payload["notice"]
    assert "語意" in payload["notice"]


def test_external_scope_term_hit_returns_keyword_list() -> None:
    session_factory = _session_factory()
    with session_factory() as session:
        text = (
            "臺灣臺北地方法院民事判決 114年度訴字第9號\n"
            "原告主張兩造間有借款糾紛，被告屆期未清償。\n"
            "本院審酌借據與匯款紀錄，認原告主張為有理由。"
        )
        session.add(
            JudgmentDocument(
                jid="TPDV,114,訴,9,20260101,1",
                jyear="114",
                jcase="訴",
                jno="9",
                jdate="20260101",
                court="臺灣臺北地方法院民事",
                court_normalized="臺灣臺北地方法院",
                title="返還借款",
                full_text=text,
                full_text_length=len(text),
                content_hash="external-scope-hit",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()

    payload = answer_question(
        session_factory=session_factory,
        question="臺灣臺北地方法院2026年借款糾紛案件有哪些",
        settings=_settings(qdrant_url=""),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] == "keyword_list"
    assert payload["retrieval"]["total_matches"] == 1
    assert payload["judgments"][0]["jid"] == "TPDV,114,訴,9,20260101,1"
    probe = payload["retrieval"]["scope_probe"]
    assert probe["hit_terms"][0]["term"] == "借款糾紛"
    assert "非 active" in payload["notice"]


def test_must_term_hit_still_discloses_zero_external_phrase() -> None:
    session_factory = _session_factory()
    with session_factory() as session:
        text = (
            "臺灣士林地方法院民事判決 89年度訴字第367號\n"
            "原告主張被告未依約給付交割款，為避免違約交割，"
            "乃調度資金存入客戶帳戶。"
        )
        session.add(
            JudgmentDocument(
                jid="SLDV,89,訴,367,20000728",
                jyear="89",
                jcase="訴",
                jno="367",
                jdate="20000728",
                court="臺灣士林地方法院民事",
                court_normalized="臺灣士林地方法院",
                title="侵權行為損害賠償",
                full_text=text,
                full_text_length=len(text),
                content_hash="must-external",
                matched_laws=[],
                matched_laws_text="",
                citations=[],
                citation_count=0,
                source_archive="test.rar",
            )
        )
        session.commit()

    payload = answer_question(
        session_factory=session_factory,
        question="士林地方法院2000年違約交割與借款糾紛案件有哪些",
        settings=_settings(qdrant_url=""),
        store=FakeStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert payload["retrieval"]["retrieval_mode"] == "keyword_list"
    assert payload["retrieval"]["total_matches"] == 1
    probe = payload["retrieval"]["scope_probe"]
    assert probe["zero_terms"][0]["term"] == "借款糾紛"
    assert "借款糾紛" in payload["notice"]
    assert "未在" in payload["notice"]


def test_answer_question_suggests_database_for_all_results() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        rag_top_k=1,
    )

    class ThreeHitStore(MultiHitStore):
        def search(self, collection, vector, *, limit=4, **kwargs):
            return super().search(collection, vector, limit=3, **kwargs)

    payload = answer_question(
        session_factory=session_factory,
        question="可以找出近5年所有返還借款的判決嗎？",
        settings=settings,
        store=ThreeHitStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )

    assert payload["status"] == "operational"
    assert payload["answer_source"] == "retrieval_list"
    assert len(payload["judgments"]) == 1
    assert "TPDV,114,訴,1,20260101,1" in payload["answer"]
    assert payload["retrieval"]["unique_judgments"] == 3
    assert "資料庫查詢" in payload["notice"]
    assert "全部" in payload["notice"]
    assert "前 1 筆" in payload["notice"]


def test_answer_question_reranks_candidates_and_traces_provider(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        rag_rerank_enabled=True,
        rerank_url="http://x570:11435",
        rag_rerank_candidates=3,
        rag_top_k=2,
    )

    class FakeReranker:
        configured = True

        def __init__(self, *args, **kwargs):
            pass

        def rerank(self, query, documents, *, top_n, deadline=None):
            assert len(documents) == 3
            return RerankOutcome(
                status="ok",
                results=[
                    RerankResult(index=2, score=0.93),
                    RerankResult(index=0, score=0.55),
                ],
                model="bge-reranker-v2-m3",
                provider="x570",
                url="http://x570:11435/v1/rerank",
                fallback_used=False,
                latency_ms=4,
                candidate_count=3,
                selected_count=2,
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", FakeReranker)
    flow = start_flow(
        request_id="test-rag-rerank",
        entrypoint="/api/rag/query",
        method="POST",
        path="/api/rag/query",
    )
    try:
        payload = answer_question(
            session_factory=session_factory,
            question="原告如何請求返還借款？",
            settings=settings,
            store=MultiHitStore(),
            embedder=FakeEmbedder(),
            enable_law_retrieval=False,
        )
        flow.finish()
    finally:
        clear_flow()

    assert payload["status"] == "retrieval_only"
    assert [item["jid"] for item in payload["judgments"]] == [
        "TPDV,114,訴,3,20260101,1",
        "TPDV,114,訴,1,20260101,1",
    ]
    assert payload["retrieval"]["top_k"] == 2
    assert payload["retrieval"]["candidate_k"] == 3
    assert payload["retrieval"]["rerank"]["status"] == "ok"
    assert payload["retrieval"]["rerank"]["provider"] == "x570"
    assert payload["retrieval"]["rerank"]["candidate_count"] == 3
    assert payload["retrieval"]["rerank"]["selected_count"] == 2

    segment = next(
        item for item in flow.segments if item["name"] == "rag.rerank"
    )
    assert segment["metadata"]["model"] == "bge-reranker-v2-m3"
    assert segment["metadata"]["provider_name"] == "x570"
    assert segment["metadata"]["candidates"] == 3
    assert segment["metadata"]["selected"] == 2
    assert segment["metadata"]["fallback_used"] is False
    assert segment["metadata"]["top_score"] == 0.93


def test_answer_question_keeps_vector_order_when_reranker_degrades(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        rag_rerank_enabled=True,
        rerank_url="http://x570:11435",
        rag_rerank_candidates=3,
        rag_top_k=2,
    )

    class DegradedReranker:
        configured = True

        def __init__(self, *args, **kwargs):
            pass

        def rerank(self, query, documents, *, top_n, deadline=None):
            return RerankOutcome(
                status="degraded",
                model="bge-reranker-v2-m3",
                provider="x570",
                url="http://x570:11435/v1/rerank",
                candidate_count=len(documents),
                errors=["connect failed"],
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", DegradedReranker)
    payload = answer_question(
        session_factory=session_factory,
        question="原告如何請求返還借款？",
        settings=settings,
        store=MultiHitStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )

    assert [item["jid"] for item in payload["judgments"]] == [
        "TPDV,114,訴,1,20260101,1",
        "TPDV,114,訴,2,20260101,1",
    ]
    assert payload["retrieval"]["rerank"]["status"] == "degraded"
    assert payload["retrieval"]["top_k"] == 2


def test_answer_question_accepts_grounded_llm_answer(monkeypatch) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依檢索到的判決，原告可請求返還借款 [1]。",
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法如何處理消費借貸爭議？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )
    assert payload["status"] == "operational"
    assert "返還借款" in payload["answer"]
    assert payload["judgments"][0]["index"] == 1


def test_llm_answer_includes_law_retrieval_summary(monkeypatch, tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依檢索到的判決與法規，原告可請求返還借款 [1]。",
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法如何處理消費借貸爭議？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "operational"
    assert payload["law_answer"].startswith("- ")
    assert "銀行法" in payload["law_answer"]
    assert "返還借款" in payload["answer"]
    assert payload["answer_source"] == "llm"


def test_article_reference_regex_handles_chinese_and_hyphen_forms() -> None:
    assert _article_ref_key("第 157-1 條") == "157-1"
    assert _article_ref_key("第157條之1") == "157-1"
    assert _article_ref_key("第一百五十七條之一") == "157-1"
    assert _article_ref_key("第一百七十一條") == "171"
    assert _extract_article_refs(
        "證券交易法第一百七十一條及第 157-1 條"
    ) == {"171", "157-1"}


def test_select_law_articles_expands_insider_trading_concept() -> None:
    selected = select_law_articles(
        _security_law_articles(),
        "證券交易法對內線交易有什麼規範？",
    )
    assert [article["article_no"] for article in selected] == [
        "第 157-1 條",
        "第 171 條",
    ]


def test_select_law_articles_honors_explicit_article_reference() -> None:
    selected = select_law_articles(
        _security_law_articles(),
        "證券交易法第171條的刑責是什麼？",
    )
    assert selected[0]["article_no"] == "第 171 條"


def test_related_laws_question_does_not_match_provision_questions() -> None:
    assert not is_related_laws_question(
        "銀行法對從業人員有那些規定？"
    )
    assert not is_related_laws_question("銀行法有哪些規定？")
    assert not is_related_laws_question("有哪些法律規定？")
    assert is_related_laws_question(
        "有哪些法規是和壽險及產險相關的？"
    )
    assert is_related_laws_question("內線交易的法律有哪些？")
    assert is_related_laws_question("銀行法相關法規有哪些？")


def test_law_first_question_detects_bank_personnel_question() -> None:
    assert is_law_first_question("銀行法對從業人員有那些規定？")
    assert is_law_first_question("銀行法有哪些規定？")
    assert not is_law_first_question(
        "銀行法在法院實務上如何適用？"
    )
    assert not is_law_first_question("有哪些判決涉及銀行法？")


def test_select_law_articles_expands_bank_personnel_terms() -> None:
    articles = [
        {
            "article_no": "第 35-2 條",
            "article_content": (
                "銀行負責人及職員辦理授信時，應遵守利害關係人交易規定。"
            ),
        },
        {
            "article_no": "第 1 條",
            "article_content": "本法所稱銀行，指依本法組織登記之銀行。",
        },
        {
            "article_no": "第 99 條",
            "article_content": "銀行分派盈餘時，應先提法定盈餘公積。",
        },
    ]
    selected = select_law_articles(
        articles,
        "銀行法對從業人員有那些規定？",
        limit=1,
    )
    assert selected[0]["article_no"] == "第 35-2 條"


def test_select_law_articles_uses_dense_scores_when_bm25_is_empty() -> None:
    articles = [
        {
            "article_no": "第 35 條",
            "article_content": "銀行負責人及職員不得收受佣金。",
        },
        {
            "article_no": "第 99 條",
            "article_content": "銀行分派盈餘時，應先提法定盈餘公積。",
        },
    ]

    selected = select_law_articles(
        articles,
        "請問",
        limit=1,
        dense_scores={"第 99 條": 0.9, "第 35 條": 0.1},
    )

    assert selected[0]["article_no"] == "第 99 條"


def test_rrf_fuse_uses_ranks_and_dense_weight() -> None:
    def candidates():
        return [
            {
                "article_no": "第 1 條",
                "article_content": "keyword anchor",
                "bm25_score": 1.0,
                "dense_score": 0.1,
                "score": 0.0,
            },
            {
                "article_no": "第 2 條",
                "article_content": "dense anchor",
                "bm25_score": 0.99,
                "dense_score": 0.99,
                "score": 0.0,
            },
            {
                "article_no": "第 3 條",
                "article_content": "runner up",
                "bm25_score": 0.98,
                "dense_score": 0.98,
                "score": 0.0,
            },
        ]

    weak_dense = candidates()
    _rrf_fuse(weak_dense, dense_weight=0.2, rrf_k=60)
    ranked = sorted(
        weak_dense, key=lambda item: (-item["score"], item["article_no"])
    )
    # Rank 1 in the keyword list still wins when dense is only a weak vote.
    assert [item["article_no"] for item in ranked] == [
        "第 1 條",
        "第 2 條",
        "第 3 條",
    ]

    equal_dense = candidates()
    _rrf_fuse(equal_dense, dense_weight=1.0, rrf_k=60)
    ranked = sorted(
        equal_dense, key=lambda item: (-item["score"], item["article_no"])
    )
    # With equal voting power, the article ranked first by dense wins.
    assert ranked[0]["article_no"] == "第 2 條"


def test_law_sources_adds_dense_law_when_keyword_lookup_finds_none(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    contents = {
        ("law", "民法"): {
            "article_count": 1439,
            "law_articles": [
                {
                    "article_no": "第 184 條",
                    "article_content": (
                        "因故意或過失不法侵害他人之權利者，負損害賠償責任。"
                    ),
                }
            ],
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    vector_hits = [
        {
            "score": 0.81,
            "payload": {
                "law_name": "民法",
                "law_key": "CIVIL",
                "source_type": "law",
                "article_no": "第 184 條",
            },
        }
    ]

    sources = law_sources_for_question(
        session_factory,
        tmp_path,
        "損害賠償責任如何認定？",
        vector_hits=vector_hits,
    )

    assert [source["law_name"] for source in sources] == ["民法"]
    assert sources[0]["articles"][0]["article_no"] == "第 184 條"


def test_dense_law_fallback_prefers_statute_over_near_tied_order(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    contents = {
        ("law", "民法"): {
            "article_count": 1439,
            "law_articles": [
                {
                    "article_no": "第 184 條",
                    "article_content": "不法侵害他人之權利者，負損害賠償責任。",
                }
            ],
        },
        ("order", "銀行法施行細則"): {
            "article_count": 11,
            "law_articles": [
                {
                    "article_no": "第 1 條",
                    "article_content": "本細則依銀行法規定訂定之。",
                }
            ],
        },
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    vector_hits = [
        {
            "score": 0.69,
            "payload": {
                "law_name": "銀行法施行細則",
                "law_key": "BANK-RULE",
                "source_type": "order",
                "article_no": "第 1 條",
            },
        },
        {
            "score": 0.68,
            "payload": {
                "law_name": "民法",
                "law_key": "CIVIL",
                "source_type": "law",
                "article_no": "第 184 條",
            },
        },
    ]

    sources = law_sources_for_question(
        session_factory,
        tmp_path,
        "損害賠償責任如何認定？",
        limit=1,
        vector_hits=vector_hits,
    )

    assert [source["law_name"] for source in sources] == ["民法"]


def test_explicit_law_anchor_ignores_unrelated_dense_laws(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    contents = {
        ("law", "銀行法"): {
            "article_count": 204,
            "law_articles": [
                {
                    "article_no": "第 35 條",
                    "article_content": "銀行負責人及職員不得收受佣金。",
                }
            ],
        },
        ("law", "民法"): {
            "article_count": 1439,
            "law_articles": [
                {
                    "article_no": "第 184 條",
                    "article_content": "不法侵害他人之權利者，負損害賠償責任。",
                }
            ],
        },
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    vector_hits = [
        {
            "score": 0.9,
            "payload": {
                "law_name": "民法",
                "law_key": "CIVIL",
                "source_type": "law",
                "article_no": "第 184 條",
            },
        }
    ]

    sources = law_sources_for_question(
        session_factory,
        tmp_path,
        "銀行法對從業人員有那些規定？",
        vector_hits=vector_hits,
    )

    assert [source["law_name"] for source in sources] == ["銀行法"]
    assert sources[0]["articles"][0]["article_no"] == "第 35 條"


def test_insider_trading_law_sources_select_157_1_and_171(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    contents = {
        ("law", "證券交易法"): {
            "article_count": 229,
            "law_articles": _security_law_articles(),
            "law_histories": "中華民國五十七年四月三十日制定公布全文 183 條",
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    sources = law_sources_for_question(
        session_factory,
        tmp_path,
        "證券交易法對內線交易有什麼規範？",
    )
    assert len(sources) == 1
    assert sources[0]["law_name"] == "證券交易法"
    assert [article["article_no"] for article in sources[0]["articles"]] == [
        "第 157-1 條",
        "第 171 條",
    ]


def test_concept_lookup_finds_security_law_without_name(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    contents = {
        ("law", "證券交易法"): {
            "article_count": 229,
            "law_articles": _security_law_articles(),
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    sources = law_sources_for_question(
        session_factory,
        tmp_path,
        "內線交易有什麼規範？",
    )
    assert sources
    assert sources[0]["law_name"] == "證券交易法"
    assert [article["article_no"] for article in sources[0]["articles"]] == [
        "第 157-1 條",
        "第 171 條",
    ]


def test_llm_answer_includes_insider_trading_articles(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    contents = {
        ("law", "證券交易法"): {
            "article_count": 229,
            "law_articles": _security_law_articles(),
            "law_histories": "中華民國五十七年四月三十日制定公布全文 183 條",
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依證券交易法第一百五十七條之一及第一百七十一條 [2]。",
    )

    payload = answer_question(
        session_factory=session_factory,
        question="證券交易法對內線交易有什麼規範？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "operational"
    assert "第 157-1 條" in payload["law_answer"]
    assert "第 171 條" in payload["law_answer"]
    assert [
        article["article_no"]
        for article in payload["law_sources"][0]["articles"]
    ] == ["第 157-1 條", "第 171 條"]


def test_answer_question_streams_law_partial_and_tokens(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    partials = []
    tokens = []
    resets = []

    def fake_generate(**kwargs):
        on_token = kwargs.get("on_token")
        if on_token:
            on_token("依")
            on_token("法規")
        return "依法規與判決，原告可請求返還借款 [1]。"

    monkeypatch.setattr("judgment.rag._generate_answer", fake_generate)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
        on_partial=partials.append,
        on_token=tokens.append,
        on_token_reset=lambda: resets.append(True),
    )

    assert [partial["streaming"] for partial in partials] == [False, True]
    assert partials[0]["law_sources"][0]["law_name"] == "銀行法"
    assert partials[0]["show_sources"] is False
    assert partials[0]["law_framework"] is None
    assert partials[1]["show_sources"] is True
    assert partials[1]["judgments"]
    assert partials[1]["answer"] == ""
    assert tokens == ["依", "法規"]
    assert resets == []
    assert payload["status"] == "operational"
    assert "返還借款" in payload["answer"]


def test_answer_question_streams_unranked_preview_before_rerank(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_rerank_enabled=True,
        rerank_url="http://reranker.test",
        rerank_fallback_url="",
    )
    partials = []

    class FakeReranker:
        configured = True

        def __init__(self, *args, **kwargs) -> None:
            pass

        def rerank(self, query, documents, *, top_n, deadline=None):
            return RerankOutcome(
                status="ok",
                results=[
                    RerankResult(index=0, score=9.0),
                ],
                model="bge-reranker-v2-m3",
                provider="x570",
                latency_ms=1,
                candidate_count=len(documents),
                selected_count=1,
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", FakeReranker)
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依法規與判決，原告可請求返還借款 [1]。",
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
        on_partial=partials.append,
    )

    unranked = [
        partial
        for partial in partials
        if partial.get("answer_source") == "retrieval_unranked"
    ]
    assert len(unranked) == 1
    assert unranked[0]["partial"] is True
    assert unranked[0]["show_sources"] is True
    assert unranked[0]["judgments"][0]["jid"] == "TPDV,114,訴,1,20260101,1"
    assert unranked[0]["rerank_degraded"] is False
    assert any(
        partial.get("answer_source") == "streaming"
        for partial in partials
    )
    assert payload["rerank_degraded"] is False


def test_answer_question_marks_degraded_rerank(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_rerank_enabled=True,
        rerank_url="http://reranker.test",
        rerank_fallback_url="",
    )

    class FakeReranker:
        configured = True

        def __init__(self, *args, **kwargs) -> None:
            pass

        def rerank(self, query, documents, *, top_n, deadline=None):
            return RerankOutcome(
                status="degraded",
                model="bge-reranker-v2-m3",
                errors=["deadline"],
                candidate_count=len(documents),
            )

    monkeypatch.setattr("judgment.rag.RerankerClient", FakeReranker)
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依法規與判決，原告可請求返還借款 [1]。",
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["rerank_degraded"] is True
    assert payload["retrieval"]["rerank"]["status"] == "degraded"


def test_answer_question_degrades_when_llm_gate_is_busy(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )

    class BusyGate:
        def acquire(self, blocking: bool = False) -> bool:
            return False

        def release(self) -> None:
            raise AssertionError("busy gate must not be released")

    monkeypatch.setattr(
        "judgment.rag._llm_gate_for", lambda limit: BusyGate()
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: (_ for _ in ()).throw(
            AssertionError("LLM must not run while the gate is busy")
        ),
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "retrieval_only"
    assert payload["degraded_reason"] == "llm_busy"
    assert "摘要服務忙碌" in payload["notice"]


def test_answer_question_marks_llm_error(monkeypatch, tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: (_ for _ in ()).throw(
            RuntimeError("context size has been exceeded")
        ),
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "retrieval_only"
    assert payload["degraded_reason"] == "llm_error"
    assert "context size has been exceeded" in payload["notice"]


def test_llm_circuit_breaker_opens_after_two_connect_errors() -> None:
    from judgment import rag as rag_module

    rag_module._llm_breaker_reset()
    try:
        base_url = "http://breaker.test:11436"
        assert rag_module._llm_breaker_allow(base_url, "openai")
        error = httpx.ConnectError("connection refused")
        rag_module._llm_breaker_record(base_url, "openai", error)
        assert rag_module._llm_breaker_allow(base_url, "openai")
        rag_module._llm_breaker_record(base_url, "openai", error)
        assert not rag_module._llm_breaker_allow(base_url, "openai")
        snapshot = rag_module.llm_circuit_snapshot()
        assert snapshot["openai|http://breaker.test:11436"]["failures"] == 2
        rag_module._llm_breaker_record(base_url, "openai", None)
        assert rag_module._llm_breaker_allow(base_url, "openai")
    finally:
        rag_module._llm_breaker_reset()


def test_answer_question_resets_tokens_before_strict_retry(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    tokens = []
    resets = []
    calls = {"count": 0}

    def fake_generate(**kwargs):
        calls["count"] += 1
        on_token = kwargs.get("on_token")
        if kwargs.get("strict"):
            if on_token:
                on_token("正確回答 [1]")
            return "正確回答 [1]"
        if on_token:
            on_token("缺少引用")
        return "缺少引用的回答。"

    monkeypatch.setattr("judgment.rag._generate_answer", fake_generate)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
        on_token=tokens.append,
        on_token_reset=lambda: resets.append(True),
    )

    assert calls["count"] == 2
    assert resets == [True]
    assert tokens == ["缺少引用", "正確回答 [1]"]
    assert payload["status"] == "operational"
    assert payload["answer"] == "正確回答 [1]"


def test_answer_question_does_not_retry_non_citation_error(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
    )
    calls = {"count": 0}

    def fake_generate(**kwargs):
        calls["count"] += 1
        raise RuntimeError("Context size has been exceeded.")

    monkeypatch.setattr("judgment.rag._generate_answer", fake_generate)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對於吸收存款與授信有哪些限制？",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )

    assert calls["count"] == 1
    assert payload["status"] == "retrieval_only"
    assert payload["degraded_reason"] == "llm_error"


def test_insurance_responsibility_framework(monkeypatch, tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    question = "保險法對於業務員不當招攬的責任規定？"
    contents = {
        ("order", "保險業務員管理規則"): {
            "law_articles": [
                {"article_no": "第 15 條", "article_content": "招攬連帶責任"},
                {"article_no": "第 19 條", "article_content": "不當招攬處分"},
            ]
        },
        ("law", "金融消費者保護法"): {
            "law_articles": [
                {"article_no": "第 8 條", "article_content": "不實招攬"},
                {"article_no": "第 9 條", "article_content": "適合度"},
                {"article_no": "第 10 條", "article_content": "說明揭露"},
                {"article_no": "第 11 條", "article_content": "損害賠償"},
                {"article_no": "第 11-3 條", "article_content": "懲罰性賠償"},
            ]
        },
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    sources = law_sources_for_question(
        session_factory, tmp_path, question
    )
    assert [source["law_name"] for source in sources] == [
        "保險法",
        "金融消費者保護法",
        "保險業務員管理規則",
    ]
    for index, source in enumerate(sources, start=1):
        source["index"] = index

    framework = build_insurance_responsibility_framework(
        question=question,
        session_factory=session_factory,
        law_data_dir=tmp_path,
        law_sources=sources,
    )
    assert framework is not None
    assert framework["title"] == "相關法規的責任架構"
    assert [row["article_no"] for row in framework["rows"]] == [
        "第 15 條",
        "第 19 條",
        "第 8 條",
        "第 9 條",
        "第 10 條",
        "第 11 條",
        "第 11-3 條",
    ]
    assert [row["focus"] for row in framework["rows"]] == [
        "業務員招攬及公司連帶責任",
        "不當招攬及停止招攬",
        "禁止不實、詐欺、隱匿招攬",
        "商品適合度義務",
        "商品說明及風險揭露",
        "損害賠償責任",
        "懲罰性賠償",
    ]
    assert framework["sources"] == [
        {"law_name": "保險法", "index": 1},
        {"law_name": "金融消費者保護法", "index": 2},
        {"law_name": "保險業務員管理規則", "index": 3},
    ]


def test_answer_question_without_qdrant_degrades_to_preview() -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法如何處理消費借貸爭議？",
        settings=_settings(),
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )
    assert payload["status"] == "preview"
    assert payload["retrieval"]["status"] == "not_configured"
    assert "QDRANT_URL" in payload["notice"]


def _seed_laws(session_factory) -> None:
    with session_factory() as session:
        version = LawDatasetVersion(
            source_type="law",
            source_url="https://example.test/law",
            update_date="2026/10/30",
            content_sha256="a" * 64,
            raw_json_sha256="b" * 64,
            zip_sha256="c" * 64,
            zip_path="/tmp/law.zip",
            parquet_path="/tmp/laws.parquet",
            law_count=4,
            article_count=1240,
            is_current=True,
        )
        session.add(version)
        session.flush()
        common = {
            "law_level": "法律",
            "law_category": "金融法規",
            "law_url": "https://law.test/item",
            "law_modified_date": "20230628",
            "law_effective_date": "",
            "content_hash": "d" * 64,
            "first_seen_version_id": version.id,
            "last_seen_version_id": version.id,
            "is_current": True,
        }
        session.add_all(
            [
                LawDocument(
                    source_type="law",
                    law_key="BANK",
                    law_name="銀行法",
                    article_count=204,
                    law_histories=(
                        "1.中華民國二十年三月二十八日國民政府制定公布全文 51 條\n"
                        "2.中華民國三十六年九月一日修正公布全文 119 條"
                    ),
                    **common,
                ),
                LawDocument(
                    source_type="law",
                    law_key="FCP",
                    law_name="金融消費者保護法",
                    article_count=30,
                    **common,
                ),
                LawDocument(
                    source_type="order",
                    law_key="BANK-RULE",
                    law_name="銀行法施行細則",
                    article_count=11,
                    law_histories=(
                        "1.中華民國八十三年七月二十六日財政部令訂定發布全文 11 條"
                    ),
                    **{**common, "law_level": "命令"},
                ),
                LawDocument(
                    source_type="law",
                    law_key="SEC",
                    law_name="證券交易法",
                    article_count=229,
                    law_histories=(
                        "1.中華民國五十七年四月三十日總統令制定公布全文 183 條"
                    ),
                    **common,
                ),
                LawDocument(
                    source_type="order",
                    law_key="INS-RULE",
                    law_name="保險業務員管理規則",
                    article_count=23,
                    **{**common, "law_level": "命令"},
                ),
                LawDocument(
                    source_type="law",
                    law_key="INS",
                    law_name="保險法",
                    article_count=266,
                    **common,
                ),
                LawDocument(
                    source_type="law",
                    law_key="CIVIL",
                    law_name="民法",
                    article_count=1439,
                    **common,
                ),
                LawDocument(
                    source_type="law",
                    law_key="LIFE",
                    law_name="簡易人壽保險法",
                    article_count=44,
                    **common,
                ),
                LawDocument(
                    source_type="order",
                    law_key="LIFE-NAME",
                    law_name="人壽保險各類保險定名準則",
                    article_count=5,
                    **{**common, "law_level": "命令"},
                ),
                LawDocument(
                    source_type="order",
                    law_key="PROPERTY-REPORT",
                    law_name="財產保險業財務報告編製準則",
                    article_count=32,
                    **{**common, "law_level": "命令"},
                ),
            ]
        )
        session.commit()


def _seed_insurance_stats(session_factory) -> None:
    with session_factory() as session:
        for index in range(3):
            session.add(
                JudgmentDocument(
                    jid=f"TPDV,114,保險,{index + 1},20260101,1",
                    jyear="114",
                    jcase="保險",
                    jno=str(index + 1),
                    jdate="20260101",
                    court="臺灣臺北地方法院民事",
                    court_normalized="臺灣臺北地方法院",
                    title="保險爭議",
                    full_text="保險業務員招攬爭議。",
                    full_text_length=10,
                    content_hash=f"{index + 10:064d}",
                    matched_laws=["保險業務員管理規則", "民法"],
                    matched_laws_text="保險業務員管理規則\n民法",
                    citations=[
                        {
                            "law_name": "保險業務員管理規則",
                            "article_no": "第19條",
                            "text": "保險業務員管理規則第19條",
                        },
                        {
                            "law_name": "民法",
                            "article_no": "第184條",
                            "text": "民法第184條",
                        },
                    ],
                    citation_count=2,
                    source_archive="test.rar",
                )
            )
        session.commit()


def test_law_article_count_uses_alias_and_order_metadata(tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    settings = _settings(law_data_dir=tmp_path)

    alias = answer_question(
        session_factory=session_factory,
        question="證交法有多少條文?",
        settings=settings,
    )
    assert alias["status"] == "operational"
    assert alias["answer_source"] == "structured"
    assert alias["law_sources"][0]["law_name"] == "證券交易法"
    assert alias["law_sources"][0]["article_count"] == 229
    assert "229 條" in alias["answer"]
    assert alias["llm_model"] is None

    order = answer_question(
        session_factory=session_factory,
        question="銀行法施行細則有多少條文?",
        settings=settings,
    )
    assert order["law_sources"][0]["law_name"] == "銀行法施行細則"
    assert order["law_sources"][0]["source_label"] == "命令"
    assert order["law_sources"][0]["article_count"] == 11
    assert "11 條" in order["answer"]


def test_law_history_answer_uses_roc_date(tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法是何時開始有的?",
        settings=_settings(law_data_dir=tmp_path),
    )
    assert payload["status"] == "operational"
    assert "中華民國二十年三月二十八日" in payload["answer"]
    assert "1931-03-28" in payload["answer"]
    assert payload["law_sources"][0]["first_promulgation"]["gregorian_date"] == "1931-03-28"


def test_insurance_salesperson_citation_stats(tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    _seed_insurance_stats(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="保險業務員常觸犯什麼法條?",
        settings=_settings(law_data_dir=tmp_path),
    )
    assert payload["status"] == "operational"
    assert payload["answer_source"] == "structured"
    assert "3 筆提及「保險業務員」" in payload["answer"]
    assert "保險業務員管理規則第19條" in payload["answer"]
    assert "民法第184條" in payload["answer"]
    assert [source["law_name"] for source in payload["law_sources"][:2]] == [
        "保險業務員管理規則",
        "民法",
    ]
    assert payload["retrieval"]["law_stats"]["judgment_count"] == 3


def test_related_life_and_property_insurance_laws(tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_laws(session_factory)
    payload = answer_question(
        session_factory=session_factory,
        question="有哪些法規是和壽險及產險相關的？",
        settings=_settings(law_data_dir=tmp_path),
    )
    assert payload["status"] == "operational"
    assert payload["answer_source"] == "structured"
    names = [source["law_name"] for source in payload["law_sources"]]
    assert "保險法" in names
    assert "簡易人壽保險法" in names
    assert "人壽保險各類保險定名準則" in names
    assert "財產保險業財務報告編製準則" in names
    assert "相關的法規／命令" in payload["answer"]


def test_llm_prompt_includes_law_sources(tmp_path: Path) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        law_data_dir=tmp_path,
    )
    captured = {}

    def fake_generate(**kwargs):
        captured["contexts"] = kwargs["contexts"]
        return "依判決與法規資料，銀行法有相關限制 [1]。"

    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr("judgment.rag._generate_answer", fake_generate)
    try:
        payload = answer_question(
            session_factory=session_factory,
            question="銀行法對吸收存款有哪些限制？",
            settings=settings,
            store=FakeStore(),
            embedder=FakeEmbedder(),
        )
    finally:
        monkeypatch.undo()
    assert payload["status"] == "operational"
    assert len(payload["law_sources"]) == 1
    assert payload["law_sources"][0]["index"] == 2
    assert [context.get("kind") for context in captured["contexts"]] == [None, "law"]


def test_bank_personnel_question_keeps_articles_and_law_first_context(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_top_k=4,
        rag_law_first_judgment_limit=2,
    )
    bank_source = {
        "index": 0,
        "kind": "law",
        "law_name": "銀行法",
        "law_key": "BANK",
        "source_type": "law",
        "source_label": "法規",
        "law_level": "法律",
        "law_category": "金融法規",
        "law_url": "https://law.test/bank",
        "article_count": 204,
        "law_modified_date": "20230628",
        "law_effective_date": "",
        "first_promulgation": None,
        "law_histories": "",
        "stats": None,
        "articles": [
            {
                "article_no": "第 35-2 條",
                "article_content": (
                    "銀行負責人及職員辦理授信時，應遵守利害關係人交易規定。"
                ),
            }
        ],
    }
    captured = {}

    monkeypatch.setattr(
        "judgment.rag.law_sources_for_question",
        lambda *args, **kwargs: [bank_source],
    )

    def fake_generate(**kwargs):
        captured["contexts"] = kwargs["contexts"]
        return "依銀行法第 35-2 條，銀行負責人及職員辦理授信時應遵守相關規定 [1]。"

    monkeypatch.setattr("judgment.rag._generate_answer", fake_generate)
    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對從業人員有那些規定？",
        settings=settings,
        store=MultiHitStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "operational"
    assert payload["retrieval"]["mode"] == "law_first"
    assert payload["law_sources"][0]["articles"][0]["article_no"] == "第 35-2 條"
    assert payload["law_sources"][0]["index"] == 1
    assert payload["judgments"][0]["index"] == 2
    assert payload["judgments"][1]["index"] == 3
    assert captured["contexts"][0]["kind"] == "law"
    assert captured["contexts"][1]["jid"] == "TPDV,114,訴,1,20260101,1"


def test_law_vector_search_reuses_query_embedding(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    contents = {
        ("law", "銀行法"): {
            "article_count": 204,
            "law_articles": [
                {
                    "article_no": "第 18 條",
                    "article_content": "本法稱銀行負責人，謂依公司法規定應負責之人。",
                },
                {
                    "article_no": "第 35 條",
                    "article_content": "銀行負責人及職員不得收受佣金。",
                },
                {
                    "article_no": "第 125-2 條",
                    "article_content": "銀行負責人或職員違背職務者，處有期徒刑。",
                },
            ],
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依銀行法第 35 條，銀行負責人及職員不得收受佣金 [1]。",
    )
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_law_vector_enabled=True,
    )
    embedder = FakeEmbedder()

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對從業人員有那些規定？",
        settings=settings,
        store=LegalVectorStore(),
        embedder=embedder,
    )

    assert payload["status"] == "operational"
    assert payload["retrieval"]["law_vector"]["status"] == "ok"
    assert payload["retrieval"]["law_vector"]["unique_articles"] == 1
    assert payload["retrieval"]["law_vector"]["alias"] == "legal_articles_current"
    assert payload["retrieval"]["law_rerank"]["status"] == "disabled"
    assert payload["retrieval"]["mode"] == "law_first"
    assert embedder.calls == [["銀行法對從業人員有那些規定？"]]
    assert payload["law_sources"][0]["index"] == 1


def test_legal_vector_search_filters_non_article_payloads() -> None:
    class MixedStore:
        configured = True

        def get_alias(self, alias):
            return "legal_articles_v001"

        def collection_info(self, collection):
            return {"points_count": 3}

        def search(self, collection, vector, **kwargs):
            return [
                {
                    "score": 0.99,
                    "payload": {"jid": "TPDV,114,訴,1,20260101,1"},
                },
                {
                    "score": 0.88,
                    "payload": {
                        "law_name": "銀行法",
                        "law_key": "BANK",
                        "source_type": "law",
                        "article_no": "第 35 條",
                    },
                },
                {
                    "score": 0.77,
                    "payload": {
                        "law_name": "銀行法",
                        "law_key": "BANK",
                        "source_type": "law",
                        "article_no": "",
                    },
                },
            ]

    hits, metadata = _search_legal_articles(
        settings=_settings(),
        question="銀行法對從業人員有那些規定？",
        store=MixedStore(),
        vector=[0.1, 0.2],
    )

    assert metadata["status"] == "ok"
    assert metadata["unique_articles"] == 1
    assert metadata["law_count"] == 1
    assert hits[0]["payload"]["article_no"] == "第 35 條"


def test_missing_law_vector_alias_falls_back_to_bm25(
    monkeypatch, tmp_path: Path
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    _seed_laws(session_factory)
    contents = {
        ("law", "銀行法"): {
            "article_count": 204,
            "law_articles": [
                {
                    "article_no": "第 35 條",
                    "article_content": "銀行負責人及職員不得收受佣金。",
                }
            ],
        }
    }
    monkeypatch.setattr(
        "judgment.law_rag.load_law_contents",
        lambda data_dir, records: contents,
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "依銀行法第 35 條，銀行負責人及職員不得收受佣金 [1]。",
    )
    settings = _settings(
        law_data_dir=tmp_path,
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_law_vector_enabled=True,
    )

    payload = answer_question(
        session_factory=session_factory,
        question="銀行法對從業人員有那些規定？",
        settings=settings,
        store=NoLegalVectorStore(),
        embedder=FakeEmbedder(),
    )

    assert payload["status"] == "operational"
    assert payload["retrieval"]["law_vector"]["status"] == "not_indexed"
    assert payload["law_sources"][0]["law_name"] == "銀行法"
    assert payload["law_sources"][0]["articles"][0]["article_no"] == "第 35 條"


def test_answer_question_rejects_empty_question() -> None:
    with pytest.raises(ValueError):
        answer_question(
            session_factory=_session_factory(),
            question="   ",
            settings=_settings(),
        )


def test_llm_flow_records_tokens_ttft_and_finish_times(monkeypatch) -> None:
    class FakeStream:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def raise_for_status(self):
            return None

        def iter_lines(self):
            yield json.dumps({"message": {"content": "測試回答 [1]"}})
            yield json.dumps(
                {
                    "done": True,
                    "prompt_eval_count": 20,
                    "eval_count": 6,
                    "total_duration": 2_000_000,
                    "load_duration": 500_000,
                    "eval_duration": 1_200_000,
                }
            )

    monkeypatch.setattr(
        "judgment.rag.httpx.stream",
        lambda *args, **kwargs: FakeStream(),
    )
    flow = start_flow(
        request_id="test-rag-llm",
        entrypoint="/api/rag/query/stream",
        method="POST",
        path="/api/rag/query/stream",
    )
    try:
        answer = generate_answer_with_model(
            settings=_settings(
                llm_url="http://llm.test:11434",
                llm_model="test-model",
            ),
            model="test-model",
            question="測試問題",
            contexts=[
                {
                    "index": 1,
                    "jid": "TEST,114,訴,1,20260101,1",
                    "court": "測試法院",
                    "jdate": "20260101",
                    "title": "測試案由",
                    "matched_laws": ["銀行法"],
                    "text": "測試內容",
                }
            ],
            timeout=10,
            on_token=lambda token: None,
        )
        flow.finish()
    finally:
        clear_flow()
    assert answer == "測試回答 [1]"
    segment = next(
        item for item in flow.segments if item["name"] == "rag.llm_request"
    )
    assert segment["metadata"]["model"] == "test-model"
    assert segment["metadata"]["base_url"] == "http://llm.test:11434"
    assert segment["metadata"]["input_tokens"] == 20
    assert segment["metadata"]["output_tokens"] == 6
    assert segment["metadata"]["ttft_ms"] is not None
    assert segment["metadata"]["total_duration_ms"] == 2.0
    assert segment["metadata"]["load_duration_ms"] == 0.5
    assert segment["metadata"]["eval_duration_ms"] == 1.2
    assert segment["finished_at"]
    assert segment["end_offset_ms"] >= segment["offset_ms"]


def _rag_context() -> list[dict]:
    return [
        {
            "index": 1,
            "jid": "TEST,114,訴,1,20260101,1",
            "court": "測試法院",
            "jdate": "20260101",
            "title": "測試案由",
            "matched_laws": ["銀行法"],
            "text": "測試內容",
        }
    ]


def test_raise_for_llm_status_keeps_response_body() -> None:
    response = httpx.Response(400, text='{"error":"context length exceeded"}')
    with pytest.raises(RuntimeError, match="context length exceeded"):
        _raise_for_llm_status(response)


def test_generate_answer_uses_openai_chat_completions(monkeypatch) -> None:
    calls = []

    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "choices": [{"message": {"content": "llama-server 回答 [1]"}}],
                "usage": {"prompt_tokens": 11, "completion_tokens": 4},
            }

    def fake_post(url, **kwargs):
        calls.append((url, kwargs["json"]))
        return FakeResponse()

    monkeypatch.setattr("judgment.rag.httpx.post", fake_post)
    answer = generate_answer_with_model(
        settings=_settings(
            llm_url="http://x570:11436",
            llm_api="openai",
            llm_model="gemma3:4b",
        ),
        model="gemma3:4b",
        question="測試問題",
        contexts=_rag_context(),
        timeout=10,
    )
    assert answer == "llama-server 回答 [1]"
    assert calls[0][0] == "http://x570:11436/v1/chat/completions"
    payload = calls[0][1]
    assert payload["model"] == "gemma3:4b"
    assert payload["max_tokens"] == 384
    assert "options" not in payload


def test_generate_answer_maps_letter_markers_to_numeric(monkeypatch) -> None:
    class FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "choices": [{"message": {"content": "依法規及判決 [A]。"}}],
                "usage": {"prompt_tokens": 11, "completion_tokens": 4},
            }

    monkeypatch.setattr(
        "judgment.rag.httpx.post", lambda *args, **kwargs: FakeResponse()
    )
    answer = generate_answer_with_model(
        settings=_settings(
            llm_url="http://x570:11436",
            llm_api="openai",
            llm_model="gemma3:4b",
        ),
        model="gemma3:4b",
        question="測試問題",
        contexts=_rag_context(),
        timeout=10,
    )
    assert answer == "依法規及判決 [1]。"


def test_generate_answer_streams_openai_sse(monkeypatch) -> None:
    class FakeStream:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, traceback):
            return False

        def raise_for_status(self):
            return None

        def iter_lines(self):
            yield 'data: {"choices":[{"delta":{"content":"測試"}}]}'
            yield ""
            yield 'data: {"choices":[{"delta":{"content":"回答 [1]"}}]}'
            yield "data: [DONE]"

    calls = []

    def fake_stream(method, url, **kwargs):
        calls.append((method, url, kwargs["json"]))
        return FakeStream()

    monkeypatch.setattr("judgment.rag.httpx.stream", fake_stream)
    tokens: list[str] = []
    answer = generate_answer_with_model(
        settings=_settings(
            llm_url="http://x570:11436",
            llm_api="openai",
            llm_model="gemma3:4b",
        ),
        model="gemma3:4b",
        question="測試問題",
        contexts=_rag_context(),
        timeout=10,
        on_token=tokens.append,
    )
    assert answer == "測試回答 [1]"
    assert tokens == ["測試", "回答 [1]"]
    assert calls[0][0] == "POST"
    assert calls[0][1] == "http://x570:11436/v1/chat/completions"
    assert calls[0][2]["stream"] is True


def test_citation_validation_rejects_dropped_context_indexes() -> None:
    assert _valid_citation_markers(
        "依判決 [1] 與 [2]。",
        4,
        allowed_indexes={1, 2},
    )
    assert not _valid_citation_markers(
        "依判決 [1] 與 [3]。",
        4,
        allowed_indexes={1, 2},
    )


def test_answer_marks_contexts_used_for_generation(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory, count=3)
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: "測試回答 [1]",
    )
    payload = answer_question(
        session_factory=session_factory,
        question="借款糾紛的實務見解是什麼？",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
            llm_url="http://llm.test",
            llm_model="test-model",
            llm_num_ctx=1024,
            llm_num_predict=384,
            rag_top_k=3,
            rag_max_context_chars=4000,
        ),
        store=MultiHitStore(),
        embedder=FakeEmbedder(),
        enable_law_retrieval=False,
    )
    assert len(payload["judgments"]) == 3
    assert any(
        judgment.get("used_for_generation") is False
        for judgment in payload["judgments"]
    )
    prompt_context = payload["retrieval"]["prompt_context"]
    assert prompt_context["contexts_dropped"] >= 1
    assert prompt_context["used_indexes"]


def test_generate_answer_rejects_actual_context_overflow(
    monkeypatch,
) -> None:
    calls = []

    class OverflowResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {
                "choices": [{"message": {"content": "overflow [1]"}}],
                "usage": {"prompt_tokens": 5000, "completion_tokens": 4},
            }

    def fake_post(url, **kwargs):
        calls.append(url)
        return OverflowResponse()

    monkeypatch.setattr("judgment.rag.httpx.post", fake_post)
    with pytest.raises(RuntimeError, match="exceeded context window"):
        generate_answer_with_model(
            settings=_settings(
                llm_url="http://x570:11436",
                llm_api="openai",
                llm_model="gemma3:4b",
                llm_num_ctx=4096,
                llm_fallback_url="http://127.0.0.1:11434",
                llm_fallback_model="gemma3:4b",
                llm_fallback_api="ollama",
            ),
            model="gemma3:4b",
            question="測試問題",
            contexts=_rag_context(),
            timeout=10,
        )
    assert calls == ["http://x570:11436/v1/chat/completions"]


def test_generate_answer_falls_back_to_ollama_before_any_token(
    monkeypatch,
) -> None:
    calls = []

    class OllamaResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return {"message": {"content": "Ollama 回答 [1]"}}

    def fake_post(url, **kwargs):
        calls.append((url, kwargs["json"]))
        if "x570" in url:
            raise httpx.ConnectError("x570 offline")
        return OllamaResponse()

    monkeypatch.setattr("judgment.rag.httpx.post", fake_post)
    answer = generate_answer_with_model(
        settings=_settings(
            llm_url="http://x570:11436",
            llm_api="openai",
            llm_model="gemma3:4b",
            llm_fallback_url="http://127.0.0.1:11434",
            llm_fallback_model="gemma3:4b",
            llm_fallback_api="ollama",
        ),
        model="gemma3:4b",
        question="測試問題",
        contexts=_rag_context(),
        timeout=10,
    )
    assert answer == "Ollama 回答 [1]"
    assert [url for url, _ in calls] == [
        "http://x570:11436/v1/chat/completions",
        "http://127.0.0.1:11434/api/chat",
    ]
    assert calls[0][1]["max_tokens"] == 384
    assert calls[1][1]["options"]["num_predict"] == 384


def test_is_judgment_list_question_detects_judgment_queries() -> None:
    assert is_judgment_list_question(
        "在板橋地方法院相關詐騙的判決有那些"
    )
    assert is_judgment_list_question("請列出近五年的詐欺判決")
    assert is_judgment_list_question("有哪些洗錢案例")
    assert not is_judgment_list_question("詐騙判決的法律責任有哪些")
    assert not is_judgment_list_question("違約交割有那些罰則?")
    assert not is_judgment_list_question("原告如何請求返還借款?")


def test_citation_retry_policy_is_shared_and_bounded() -> None:
    citation_error = CitationValidationError("missing marker")
    assert _citation_retry_action(
        strict=False, error=citation_error
    ) == "retry"
    assert _citation_retry_action(
        strict=True, error=citation_error
    ) == "stop"
    assert _citation_retry_action(
        strict=False, error=RuntimeError("context exceeded")
    ) == "stop"


def test_citation_audit_counts_uncited_and_unsupported_sentences() -> None:
    citations = [
        {
            "index": 1,
            "jid": "TPDV,114,訴,1,20260101,1",
            "title": "銀行法",
            "snippet": "銀行法禁止非銀行收受存款。",
            "matched_laws": ["銀行法"],
        }
    ]
    audit = _citation_audit(
        "銀行法禁止非銀行收受存款 [1]。這是一句沒有來源的事實。",
        citations,
        [],
        allowed_indexes={1},
    )
    assert audit["invalid_marker_count"] == 0
    assert audit["uncited_sentence_count"] == 1
    assert audit["unsupported_citation_count"] == 0

    unsupported = _citation_audit(
        "保險法要求業務員通過考試 [1]。",
        citations,
        [],
        allowed_indexes={1},
    )
    assert unsupported["unsupported_citation_count"] == 1
    assert unsupported["unsupported_sentences"]


def test_citation_marker_mapper_handles_split_tokens() -> None:
    mapper = _CitationMarkerMapper({1: "A", 2: "B"})
    assert mapper.feed("依[") == "依"
    assert mapper.feed("A") == ""
    assert mapper.feed("]及[") == "[1]及"
    assert mapper.feed("B]") == "[2]"
    assert mapper.flush() == ""

    invalid = _CitationMarkerMapper({1: "A"})
    assert invalid.feed("銀行法第[19]條") == "銀行法第[19]條"


def test_llm_prompt_uses_letter_labels_and_strict_at_end() -> None:
    payload, _ = _llm_request_payload(
        settings=_settings(llm_keep_alive="30m"),
        model="gemma3:4b",
        question="銀行法對吸收存款有哪些限制？",
        contexts=[
            {
                "kind": "law",
                "index": 1,
                "law_name": "銀行法",
                "source_type": "law",
                "source_label": "法規",
                "law_level": "法律",
                "article_count": 1,
                "articles": [{"article_no": "第29條", "article_content": "非銀行不得經營收受存款業務。"}],
            },
            {
                "kind": "judgment",
                "index": 2,
                "jid": "TPDV,114,訴,1,20260101,1",
                "court": "臺灣臺北地方法院",
                "jdate": "20260101",
                "title": "銀行法",
                "matched_laws": ["銀行法"],
                "text": "被告違法吸收存款。",
            },
        ],
        strict=True,
        stream=False,
    )
    system_prompt = payload["messages"][0]["content"]
    user_prompt = payload["messages"][1]["content"]
    assert "[A] 法規／命令來源" in user_prompt
    assert "[B] 判決案號" in user_prompt
    assert "方括號內只能是來源標籤" in user_prompt
    assert "上一次回答缺少有效來源標籤" in user_prompt
    assert "上一次回答" not in system_prompt
    assert user_prompt.rstrip().endswith("未提供的來源。")


def test_map_letter_markers_to_numeric_indexes() -> None:
    labels = {1: "A", 2: "B", 3: "C"}
    assert (
        _map_letter_markers("依[A]及[B, C]辦理。", labels)
        == "依[1]及[2,3]辦理。"
    )
    assert (
        _map_letter_markers("依[A][B]。", labels)
        == "依[1][2]。"
    )
    assert _map_letter_markers("銀行法第[19]條。", labels) == "銀行法第[19]條。"


def test_llm_prompt_for_judgment_list_requests_case_details() -> None:
    payload, _ = _llm_request_payload(
        settings=_settings(llm_keep_alive="30m"),
        model="gemma3:4b",
        question="在板橋地方法院相關詐騙的判決有那些",
        contexts=[
            {
                "kind": "judgment",
                "index": 1,
                "jid": "PCDM,114,審金訴,482,20251222,2",
                "court": "臺灣新北地方法院",
                "jdate": "20251222",
                "title": "詐欺等",
                "matched_laws": ["洗錢防制法"],
                "text": "被告加入詐騙集團擔任面交車手。",
            }
        ],
        strict=False,
        stream=False,
    )
    user_prompt = payload["messages"][1]["content"]
    assert "參考資料（以判決為主）" in user_prompt
    assert "逐筆列出案號、法院、裁判日期與案由" in user_prompt
    assert "不要重複參考資料原文、案號清單" not in user_prompt
    system_prompt = payload["messages"][0]["content"]
    assert "不得以法規條文取代判決清單" in system_prompt


def test_answer_question_drops_incidental_law_sources_for_judgment_list(
    monkeypatch,
) -> None:
    session_factory = _session_factory()
    _seed_judgments(session_factory)
    settings = _settings(
        qdrant_url="http://qdrant.test",
        embedding_url="http://ollama.test",
        llm_url="http://ollama.test",
        llm_model="test-model",
        rag_rerank_enabled=True,
        rerank_url="http://reranker.test",
    )
    monkeypatch.setattr(
        "judgment.rag._rerank_law_sources",
        lambda **kwargs: (_ for _ in ()).throw(
            AssertionError("judgment list must not rerank law sources")
        ),
    )
    monkeypatch.setattr(
        "judgment.rag.law_sources_for_question",
        lambda *args, **kwargs: [
            {
                "law_name": "地方法院及其分院處務規程",
                "source_type": "order",
                "articles": [
                    {
                        "article_no": "第 2 條",
                        "article_content": "地方法院及其分院處理事務，依本規程行之。",
                    }
                ],
            }
        ],
    )
    monkeypatch.setattr(
        "judgment.rag._generate_answer",
        lambda **kwargs: (_ for _ in ()).throw(
            AssertionError("judgment list must not call the LLM")
        ),
    )
    payload = answer_question(
        session_factory=session_factory,
        question="在法院相關的判決有那些",
        settings=settings,
        store=FakeStore(),
        embedder=FakeEmbedder(),
    )
    assert payload["retrieval"]["mode"] == "judgment_first"
    assert payload["law_sources"] == []
    assert payload["matched_terms"] == []
    assert len(payload["judgments"]) == 1
    assert payload["answer_source"] == "retrieval_list"
    assert payload["llm_model"] is None
    assert "TPDV,114,訴,1,20260101,1" in payload["answer"]
    assert "這不是法律意見" in payload["answer"]


def test_best_judgment_snippet_joins_pdf_lines_and_skips_boilerplate() -> None:
    text = (
        "臺灣新北地方法院刑事判決\n"
        "公  訴  人  臺灣新北地方檢察署檢察官\n"
        "11號），本院判決如下：\n"
        "入詐騙集團擔任面交車手之工作，侵害他人之財產法益，助\n"
        "長詐騙歪風，嚴重影響社會治安及交易秩序，所為實值非難。\n"
        "如不服本判決應於收受判決後20日內向本院提出上訴書狀。\n"
    )
    snippet = _best_judgment_snippet(
        text,
        "在板橋地方法院相關詐騙的判決有那些",
        limit=200,
    )
    assert "詐騙集團" in snippet
    assert "公  訴  人" not in snippet
    assert "如不服本判決" not in snippet


def test_best_judgment_snippet_keeps_latin_and_amount_spaces() -> None:
    text = (
        "被告使用 Telegram 暱稱，向被害人詐騙新臺幣 10 萬元。\n"
        "如不服本判決應於收受判決後20日內向本院提出上訴書狀。"
    )
    snippet = _best_judgment_snippet(
        text,
        "詐騙金額與聯絡方式",
        limit=200,
    )
    assert "Telegram 暱稱" in snippet
    assert "新臺幣 10 萬元" in snippet
    assert "Telegram暱稱" not in snippet


def test_answer_question_uses_structured_list_filter() -> None:
    session_factory = _session_factory()
    jid = "PCDM,96,簡,1,20070504,1"
    text = (
        "臺灣新北地方法院刑事判決 96年度簡字第1號\n"
        "被告加入詐騙集團擔任車手，向被害人收取款項。\n"
        "主文：被告犯詐欺取財罪，處有期徒刑陸月。"
    )
    with session_factory() as session:
        session.add(
            JudgmentDocument(
                jid=jid,
                jyear="96",
                jcase="簡",
                jno="1",
                jdate="20070504",
                court="臺灣板橋地方法院刑事",
                court_normalized="臺灣新北地方法院",
                title="詐欺等",
                full_text=text,
                full_text_length=len(text),
                content_hash="a" * 64,
                matched_laws=["洗錢防制法"],
                matched_laws_text="洗錢防制法",
                citations=[],
                citation_count=0,
                source_archive="200705.rar",
            )
        )
        session.commit()

    class StructuredStore(FakeStore):
        def facet(self, collection, key, *, query_filter=None, limit=500, exact=True):
            return [{"value": "詐欺等", "count": 1}]

        def count(self, collection, *, query_filter=None, exact=True):
            return 1

        def scroll(
            self,
            collection,
            *,
            query_filter=None,
            limit=20,
            offset=None,
            order_by=None,
            with_payload=True,
        ):
            return (
                [
                    {
                        "id": 1,
                        "payload": {
                            "jid": jid,
                            "court": "臺灣新北地方法院",
                            "title": "詐欺等",
                            "jdate": "20070504",
                            "jdate_num": 20070504,
                        },
                    }
                ],
                None,
            )

        def search(self, collection, vector, **kwargs):
            raise AssertionError("structured list must not run vector search")

    payload = answer_question(
        session_factory=session_factory,
        question="2000年至2010年板橋地院詐欺判決有哪些",
        settings=_settings(
            qdrant_url="http://qdrant.test",
            embedding_url="http://ollama.test",
        ),
        store=StructuredStore(),
        embedder=FakeEmbedder(),
    )
    assert payload["retrieval"]["retrieval_mode"] == "structured_list"
    assert payload["retrieval"]["total_matches"] == 1
    assert payload["answer"].startswith("符合條件的判決共 1 筆")
    assert payload["judgments"][0]["jid"] == jid
    assert payload["judgments"][0]["court"] == "臺灣新北地方法院"
    assert payload["judgments"][0]["title"] == "詐欺等"


def test_lexical_rrf_reorders_dense_candidates() -> None:
    hits = [
        {
            "score": 0.9,
            "payload": {
                "jid": "A",
                "title": "本票裁定",
                "court": "臺灣臺北地方法院",
                "matched_laws": ["票據法"],
                "snippet": "本票准許強制執行。",
            },
        },
        {
            "score": 0.8,
            "payload": {
                "jid": "B",
                "title": "詐欺等",
                "court": "臺灣新北地方法院",
                "matched_laws": ["洗錢防制法"],
                "snippet": "被告加入詐騙集團擔任車手，向被害人收取款項。",
            },
        },
    ]
    from judgment.rag import _apply_lexical_rrf

    reordered, meta = _apply_lexical_rrf(hits, "詐騙判決")
    assert meta["applied"] is True
    assert [hit["payload"]["jid"] for hit in reordered] == ["B", "A"]
    assert reordered[0]["_lexical_score"] > 0
