from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.judgment_index import build_index_text, index_coverage, index_judgments
from judgment.models import (
    Base,
    JudgmentDocument,
    LawDatasetVersion,
    LawDocument,
    PerformanceRecord,
)
from judgment.rag import (
    _valid_citation_markers,
    answer_question,
    extract_excerpt,
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
    assert set(store.indexes) == {"jid", "court", "jdate", "source_archive"}
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


def test_answer_question_rejects_empty_question() -> None:
    with pytest.raises(ValueError):
        answer_question(
            session_factory=_session_factory(),
            question="   ",
            settings=_settings(),
        )
