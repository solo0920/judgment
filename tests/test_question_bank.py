from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment import question_bank_ai
from judgment.benchmark import BenchmarkManager, deterministic_metrics
from judgment.config import Settings
from judgment.models import (
    Base,
    BenchmarkCaseResult,
    BenchmarkRun,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
)
from judgment.question_bank import (
    create_item,
    create_suite,
    delete_item,
    get_item,
    get_suite,
    list_items,
    remove_suite_item,
    revalidate_items,
    restore_item,
    review_item,
    submit_for_review,
    tag_suggestions,
    update_item,
)


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    yield factory
    engine.dispose()


def _seed_security_law(session_factory) -> None:
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
            law_count=1,
            article_count=2,
            is_current=True,
        )
        session.add(version)
        session.flush()
        law = LawDocument(
            source_type="law",
            law_key="SEC",
            law_name="證券交易法",
            law_level="法律",
            law_category="金融法規",
            law_url="https://law.test/sec",
            law_modified_date="20240807",
            law_effective_date="",
            content_hash="d" * 64,
            first_seen_version_id=version.id,
            last_seen_version_id=version.id,
            is_current=True,
            article_count=2,
        )
        session.add(law)
        session.flush()
        session.add_all(
            [
                LawArticleVersion(
                    law_id=law.id,
                    law_key=law.law_key,
                    law_version_id=version.id,
                    article_key="157-1",
                    article_type="A",
                    article_no="第 157-1 條",
                    article_index=1,
                    article_content="實際知悉重大消息，未公開前不得買賣。",
                    content_hash="e" * 64,
                ),
                LawArticleVersion(
                    law_id=law.id,
                    law_key=law.law_key,
                    law_version_id=version.id,
                    article_key="171",
                    article_type="A",
                    article_no="第 171 條",
                    article_index=2,
                    article_content="違反第一百五十七條之一者，處有期徒刑。",
                    content_hash="f" * 64,
                ),
            ]
        )
        session.commit()


def _payload() -> dict:
    return {
        "question": "證券交易法對內線交易有什麼規範？",
        "question_type": "law_concept",
        "difficulty": "medium",
        "expected_laws": [{"law_name": "證券交易法", "source_type": "law"}],
        "expected_articles": [
            {"law_name": "證券交易法", "article_no": "第 157-1 條"},
            {"law_name": "證券交易法", "article_no": "第 171 條"},
        ],
        "reference_answer": "第157-1條禁止內線交易，第171條規定刑責。",
        "tags": ["內線交易"],
    }


def test_create_review_and_benchmark_suite(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(
        session_factory,
        {**_payload(), "status": "pending_review"},
        actor="tester",
    )
    assert item["status"] == "pending_review"
    assert item["version"] == 1
    assert item["stale"] is False

    reviewed = review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
        rubric_scores={"overall": 5},
        comment="標註正確",
    )
    assert reviewed["status"] == "accepted"
    assert reviewed["benchmark_ready"] is True
    assert reviewed["reviews"][0]["decision"] == "approved"

    suite = create_suite(
        session_factory,
        name="Pilot 30",
        tier="core",
        item_ids=[item["id"]],
        actor="tester",
    )
    assert suite["item_count"] == 1
    frozen = create_suite(
        session_factory,
        name="Pilot 30 Frozen",
        tier="core",
        item_ids=[item["id"]],
        actor="tester",
    )
    from judgment.question_bank import update_suite

    frozen = update_suite(session_factory, frozen["id"], freeze=True)
    assert frozen["status"] == "frozen"
    assert frozen["version"] == 2
    assert get_suite(session_factory, frozen["id"])["item_count"] == 1


def test_submit_for_review_moves_item_into_queue(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(session_factory, _payload(), actor="tester")
    assert item["status"] == "draft"
    stats = list_items(session_factory, status="draft", limit=1)["stats"]
    assert stats["draft"] == 1
    assert stats["pending_review"] == 0

    submitted = submit_for_review(session_factory, item["id"], actor="tester")
    assert submitted["status"] == "pending_review"
    assert submitted["version"] == 1
    stats = list_items(session_factory, status="pending_review", limit=1)["stats"]
    assert stats["draft"] == 0
    assert stats["pending_review"] == 1

    reviewed = review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
    )
    assert reviewed["status"] == "accepted"
    resubmitted = submit_for_review(session_factory, item["id"], actor="tester")
    assert resubmitted["status"] == "pending_review"


def test_tag_suggestions_and_multi_tag_filter(session_factory) -> None:
    _seed_security_law(session_factory)
    create_item(
        session_factory,
        {
            **_payload(),
            "question": "證券交易法對內線交易有什麼規範？",
            "tags": ["內線交易", "證券交易法"],
        },
        actor="tester",
    )
    create_item(
        session_factory,
        {
            **_payload(),
            "question": "證券交易法對公開收購有什麼規定？",
            "tags": ["公開收購", "證券交易法"],
        },
        actor="tester",
    )

    suggestions = tag_suggestions(session_factory, query="證交")
    assert [item["tag"] for item in suggestions["tags"]] == ["證券交易法"]
    fuzzy = tag_suggestions(session_factory, query="證卷")
    assert [item["tag"] for item in fuzzy["tags"]] == ["證券交易法"]
    inner = tag_suggestions(session_factory, query="內線")
    assert [item["tag"] for item in inner["tags"]] == ["內線交易"]

    single = list_items(session_factory, tags=["證券交易法"], limit=10)
    assert single["total"] == 2
    assert len(single["items"]) == 2
    combined = list_items(
        session_factory,
        tags=["證券交易法", "內線交易"],
        limit=10,
    )
    assert combined["total"] == 1
    assert combined["items"][0]["question"].startswith("證券交易法對內線交易")


def test_restore_item_lists_and_restores_retired(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(
        session_factory,
        {**_payload(), "status": "pending_review"},
        actor="tester",
    )
    assert delete_item(session_factory, item["id"], actor="tester") is True

    listing = list_items(session_factory, status="retired", limit=10)
    assert listing["total"] == 1
    assert [entry["id"] for entry in listing["items"]] == [item["id"]]

    restored = restore_item(session_factory, item["id"])
    assert restored["status"] == "pending_review"
    assert restored["deleted_at"] is None
    assert list_items(session_factory, status="retired", limit=10)["total"] == 0


def test_update_item_can_restore_retired_item(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(
        session_factory,
        {**_payload(), "status": "pending_review"},
        actor="tester",
    )
    assert delete_item(session_factory, item["id"], actor="tester") is True
    assert get_item(session_factory, item["id"]) is None

    restored = update_item(
        session_factory,
        item["id"],
        {**_payload(), "status": "pending_review"},
        actor="tester",
        restore=True,
    )
    assert restored["status"] == "pending_review"
    assert restored["deleted_at"] is None
    assert restored["version"] == 2


def test_create_ai_item_uses_law_candidates(session_factory, monkeypatch) -> None:
    _seed_security_law(session_factory)
    fake_source = {
        "law_name": "證券交易法",
        "source_type": "law",
        "source_label": "法規",
        "articles": [
            {
                "article_no": "第 157-1 條",
                "article_content": "實際知悉重大消息，未公開前不得買賣。",
            },
            {
                "article_no": "第 171 條",
                "article_content": "違反第一百五十七條之一者，處有期徒刑。",
            },
        ],
    }
    parsed = {
        "question_type": "law_concept",
        "difficulty": "medium",
        "visibility": "shared",
        "expected_laws": [
            {"law_name": "證券交易法", "source_type": "law"},
            {"law_name": "不存在的法規", "source_type": "law"},
        ],
        "expected_articles": [
            {"law_name": "證券交易法", "article_no": "第 157-1 條"},
            {"law_name": "證券交易法", "article_no": "第 999 條"},
        ],
        "expected_judgments": [{"jid": "FAKE,000,000,0,20260101,1"}],
        "reference_answer": "證券交易法第 157-1 條禁止內線交易。",
        "tags": ["內線交易", "證券交易法"],
        "notes": "",
        "rubric": {"must_refuse": False},
    }
    monkeypatch.setattr(
        question_bank_ai,
        "law_sources_for_question",
        lambda *args, **kwargs: [fake_source],
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_answer",
        lambda **kwargs: parsed["reference_answer"],
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_labels",
        lambda **kwargs: (
            {key: value for key, value in parsed.items() if key != "reference_answer"},
            [],
        ),
    )
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        llm_model="test-model",
    )

    result = question_bank_ai.create_ai_item(
        session_factory,
        settings=settings,
        law_data_dir=Path("data/laws"),
        question="證券交易法對內線交易有什麼規範？",
        actor="ai-test",
    )
    item = result["item"]
    assert item["status"] == "pending_review"
    assert item["source"] == "ollama_auto"
    assert item["question_type"] == "law_concept"
    assert item["expected_judgments"] == []
    assert [law["law_name"] for law in item["expected_laws"]] == ["證券交易法"]
    assert [article["article_no"] for article in item["expected_articles"]] == [
        "第 157-1 條"
    ]
    assert "test-model" in item["notes"]
    assert result["warnings"]


def test_create_ai_item_falls_back_to_answer_labels(
    session_factory, monkeypatch
) -> None:
    _seed_security_law(session_factory)
    fake_source = {
        "law_name": "證券交易法",
        "source_type": "law",
        "source_label": "法規",
        "articles": [
            {
                "article_no": "第 157-1 條",
                "article_content": "實際知悉重大消息，未公開前不得買賣。",
            },
            {
                "article_no": "第 171 條",
                "article_content": "違反第一百五十七條之一者，處有期徒刑。",
            },
        ],
    }
    monkeypatch.setattr(
        question_bank_ai,
        "law_sources_for_question",
        lambda *args, **kwargs: [fake_source],
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_answer",
        lambda **kwargs: "依證券交易法第 157-1 條，內部人不得在重大消息公開前買賣。",
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_labels",
        lambda **kwargs: ({}, ["Ollama 未能產生標註 JSON。"]),
    )
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        llm_model="test-model",
    )

    result = question_bank_ai.create_ai_item(
        session_factory,
        settings=settings,
        law_data_dir=Path("data/laws"),
        question="證券交易法對內線交易有什麼規範？",
        actor="ai-test",
    )
    item = result["item"]
    assert item["status"] == "pending_review"
    assert [article["article_no"] for article in item["expected_articles"]] == [
        "第 157-1 條"
    ]
    assert item["tags"] == ["證券交易法"]
    assert result["warnings"]


def test_create_ai_item_restores_retired_duplicate(
    session_factory, monkeypatch
) -> None:
    _seed_security_law(session_factory)
    original = create_item(
        session_factory,
        {**_payload(), "status": "pending_review"},
        actor="tester",
    )
    assert delete_item(session_factory, original["id"], actor="tester") is True

    fake_source = {
        "law_name": "證券交易法",
        "source_type": "law",
        "source_label": "法規",
        "articles": [
            {
                "article_no": "第 157-1 條",
                "article_content": "實際知悉重大消息，未公開前不得買賣。",
            }
        ],
    }
    monkeypatch.setattr(
        question_bank_ai,
        "law_sources_for_question",
        lambda *args, **kwargs: [fake_source],
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_answer",
        lambda **kwargs: "證券交易法第 157-1 條禁止內線交易。",
    )
    monkeypatch.setattr(
        question_bank_ai,
        "_ollama_labels",
        lambda **kwargs: (
            {
                "question_type": "law_concept",
                "difficulty": "medium",
                "expected_laws": [
                    {"law_name": "證券交易法", "source_type": "law"}
                ],
                "expected_articles": [
                    {"law_name": "證券交易法", "article_no": "第 157-1 條"}
                ],
                "tags": ["內線交易"],
            },
            [],
        ),
    )
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        llm_model="test-model",
    )

    result = question_bank_ai.create_ai_item(
        session_factory,
        settings=settings,
        law_data_dir=Path("data/laws"),
        question=original["question"],
        actor="ai-test",
    )
    restored = result["item"]
    assert restored["id"] == original["id"]
    assert restored["status"] == "pending_review"
    assert restored["deleted_at"] is None
    assert restored["version"] == 2


def test_update_creates_version_and_returns_to_review(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(session_factory, _payload(), actor="tester")
    reviewed = review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
    )
    assert reviewed["status"] == "accepted"
    updated = update_item(
        session_factory,
        item["id"],
        {**_payload(), "question": "證券交易法對內線交易的禁止規定？"},
        actor="tester",
        change_note="調整題目文字",
    )
    assert updated["version"] == 2
    assert updated["status"] == "pending_review"
    assert updated["fingerprint"] != item["fingerprint"]


def test_revalidate_marks_changed_article_as_stale(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(session_factory, _payload(), actor="tester")
    review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
    )
    with session_factory() as session:
        article = session.scalars(
            select(LawArticleVersion).where(
                LawArticleVersion.article_no == "第 157-1 條"
            )
        ).one()
        article.article_content = "修正後的條文"
        article.content_hash = "9" * 64
        session.commit()
    result = revalidate_items(session_factory)
    assert result["checked"] == 1
    assert result["stale"] == 1
    refreshed = get_item(session_factory, item["id"])
    assert refreshed["stale"] is True
    assert refreshed["benchmark_ready"] is False
    stats = list_items(session_factory, limit=1)["stats"]
    assert stats["benchmark_ready"] == 0


def test_deterministic_metrics_compare_expected_sources() -> None:
    item = _payload()
    payload = {
        "answer": "依證券交易法第157-1條及第171條 [1] [2]。",
        "law_sources": [
            {
                "law_name": "證券交易法",
                "articles": [
                    {"article_no": "第 157-1 條", "article_content": "..."},
                    {"article_no": "第 171 條", "article_content": "..."},
                ],
            }
        ],
        "citations": [
            {"jid": "TPDM,113,金訴,27,20241128,1"},
            {"jid": "TPDM,114,金訴,1,20260101,1"},
        ],
    }
    metrics = deterministic_metrics(item, payload)
    assert metrics["law_recall"] == 1.0
    assert metrics["article_recall"] == 1.0
    assert metrics["citation_valid"] is True
    assert metrics["retrieved_laws"] == ["證券交易法"]
    assert metrics["retrieved_articles"] == ["157-1", "171"]


def _settings() -> Settings:
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
    )


def test_remove_suite_item_keeps_question_in_bank(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(session_factory, _payload(), actor="tester")
    review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
    )
    suite = create_suite(
        session_factory,
        name="Pilot 30",
        item_ids=[item["id"]],
        actor="tester",
    )
    updated = remove_suite_item(session_factory, suite["id"], item["id"])
    assert updated["item_count"] == 0
    assert get_suite(session_factory, suite["id"])["item_count"] == 0
    assert get_item(session_factory, item["id"]) is not None


def test_latest_successful_answers_uses_latest_success(session_factory) -> None:
    _seed_security_law(session_factory)
    item = create_item(session_factory, _payload(), actor="tester")
    review_item(
        session_factory,
        item["id"],
        decision="approved",
        reviewer="reviewer",
    )
    suite = create_suite(
        session_factory,
        name="Pilot 30",
        item_ids=[item["id"]],
        actor="tester",
    )
    with session_factory() as session:
        session.add_all(
            [
                BenchmarkRun(
                    run_id="run-old",
                    suite_id=suite["id"],
                    label="舊 run",
                    status="success",
                ),
                BenchmarkRun(
                    run_id="run-new",
                    suite_id=suite["id"],
                    label="新 run",
                    status="success",
                ),
                BenchmarkRun(
                    run_id="run-failed",
                    suite_id=suite["id"],
                    label="失敗 run",
                    status="failed",
                ),
            ]
        )
        session.flush()
        session.add_all(
            [
                BenchmarkCaseResult(
                    run_id="run-old",
                    item_id=item["id"],
                    item_version=1,
                    question=item["question"],
                    status="success",
                    answer="較舊的成功答案",
                    duration_ms=1000,
                ),
                BenchmarkCaseResult(
                    run_id="run-new",
                    item_id=item["id"],
                    item_version=1,
                    question=item["question"],
                    status="success",
                    answer="最新的成功答案",
                    law_sources=[
                        {
                            "law_name": "證券交易法",
                            "law_url": "https://law.test/sec",
                            "articles": [
                                {
                                    "article_no": "第 157-1 條",
                                    "article_content": "不應回傳完整條文",
                                }
                            ],
                        }
                    ],
                    metrics={
                        "law_recall": 1.0,
                        "scores": {"deterministic": 0.8},
                    },
                    duration_ms=2000,
                ),
                BenchmarkCaseResult(
                    run_id="run-failed",
                    item_id=item["id"],
                    item_version=1,
                    question=item["question"],
                    status="failed",
                    answer="",
                    error_message="timeout",
                ),
            ]
        )
        session.commit()

    manager = BenchmarkManager(
        settings=_settings(), session_factory=session_factory
    )
    answers = manager.latest_successful_answers([item["id"]])
    latest = answers[item["id"]]
    assert latest["answer"] == "最新的成功答案"
    assert latest["run_id"] == "run-new"
    assert latest["duration_ms"] == 2000
    assert latest["law_sources"][0]["law_name"] == "證券交易法"
    assert latest["law_sources"][0]["articles"] == [{"article_no": "第 157-1 條"}]
    assert latest["metrics"]["law_recall"] == 1.0
