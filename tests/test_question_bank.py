from __future__ import annotations

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.benchmark import deterministic_metrics
from judgment.models import (
    Base,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
)
from judgment.question_bank import (
    create_item,
    create_suite,
    get_item,
    get_suite,
    list_items,
    revalidate_items,
    review_item,
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
