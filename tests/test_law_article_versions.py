from __future__ import annotations

import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.law_article_versions import (
    backfill_article_versions,
    build_article_rows,
    persist_article_rows,
)
from judgment.models import (
    Base,
    LawArticleChangeEvent,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
)


def _session_factory():
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
    return engine, factory


def _version(source_type: str = "law") -> LawDatasetVersion:
    return LawDatasetVersion(
        source_type=source_type,
        source_url="https://example.test/law",
        update_date="2026/10/30",
        content_sha256="a" * 64,
        raw_json_sha256="b" * 64,
        zip_sha256="c" * 64,
        zip_path="/tmp/law.zip",
        parquet_path="",
        law_count=1,
        article_count=1,
    )


def _document(version: LawDatasetVersion, law_key: str = "L0001") -> LawDocument:
    return LawDocument(
        source_type=version.source_type,
        law_key=law_key,
        law_name="測試法",
        content_hash="d" * 64,
        first_seen_version_id=version.id,
        last_seen_version_id=version.id,
    )


def test_persist_article_rows_detects_modified_added_removed() -> None:
    engine, factory = _session_factory()
    with factory() as session:
        version1 = _version()
        session.add(version1)
        session.flush()
        document = _document(version1)
        session.add(document)
        session.flush()

        first_rows = build_article_rows(
            law_id=document.id,
            law_key=document.law_key,
            law_version_id=version1.id,
            articles=[
                {
                    "article_type": "A",
                    "article_no": "第1條",
                    "article_content": "old",
                },
                {
                    "article_type": "A",
                    "article_no": "第2條",
                    "article_content": "removed",
                },
            ],
        )
        result1 = persist_article_rows(
            session,
            version_id=version1.id,
            law_rows=[(document, first_rows)],
            previous_version_id=None,
        )
        assert result1 == {
            "articles_inserted": 2,
            "article_changes_inserted": 0,
        }

        version2 = _version()
        version2.content_sha256 = "e" * 64
        session.add(version2)
        session.flush()
        second_rows = build_article_rows(
            law_id=document.id,
            law_key=document.law_key,
            law_version_id=version2.id,
            articles=[
                {
                    "article_type": "A",
                    "article_no": "第1條",
                    "article_content": "new",
                },
                {
                    "article_type": "A",
                    "article_no": "第3條",
                    "article_content": "added",
                },
            ],
        )
        result2 = persist_article_rows(
            session,
            version_id=version2.id,
            law_rows=[(document, second_rows)],
            previous_version_id=version1.id,
        )
        assert result2 == {
            "articles_inserted": 2,
            "article_changes_inserted": 3,
        }
        session.commit()

        changes = session.scalars(
            select(LawArticleChangeEvent).order_by(LawArticleChangeEvent.article_key)
        ).all()
        assert {item.change_type for item in changes} == {
            "modified",
            "added",
            "removed",
        }
        modified = next(item for item in changes if item.change_type == "modified")
        assert modified.article_no == "第1條"
        assert modified.before_content == "old"
        assert modified.after_content == "new"
        removed = next(item for item in changes if item.change_type == "removed")
        assert removed.article_no == "第2條"
        assert removed.before_content == "removed"
        assert removed.after_content is None
    engine.dispose()


def test_backfill_article_versions_from_raw_parquet(tmp_path: Path) -> None:
    engine, factory = _session_factory()
    raw_dir = tmp_path / "raw_parquet" / "law" / "20261030" / "abc"
    raw_dir.mkdir(parents=True)
    raw_path = raw_dir / "laws.parquet"
    table = pa.table(
        {
            "law_key": ["L0001"],
            "law_articles": [
                [
                    {
                        "article_type": "A",
                        "article_no": "第1條",
                        "article_content": "內容",
                    }
                ]
            ],
            "law_effective_date": ["2026/10/30"],
        }
    )
    pq.write_table(table, raw_path)
    manifest = {
        "source_type": "law",
        "zip_sha256": "c" * 64,
        "raw_json_sha256": "b" * 64,
        "parquet_path": str(raw_path),
    }
    (raw_dir / "manifest.json").write_text(json.dumps(manifest), encoding="utf-8")

    with factory() as session:
        version = _version()
        session.add(version)
        session.flush()
        document = _document(version)
        session.add(document)
        session.commit()

    result = backfill_article_versions(factory, tmp_path)
    assert result["articles_inserted"] == 1
    assert result["missing_versions"] == []

    with factory() as session:
        rows = session.scalars(select(LawArticleVersion)).all()
        assert len(rows) == 1
        assert rows[0].article_no == "第1條"
        assert rows[0].law_version_id == 1

    second = backfill_article_versions(factory, tmp_path)
    assert second["articles_inserted"] == 0
    assert second["skipped_versions"] == 1
    engine.dispose()


def test_persist_article_rows_rejects_duplicate_article_keys() -> None:
    engine, factory = _session_factory()
    with factory() as session:
        version = _version()
        session.add(version)
        session.flush()
        document = _document(version)
        session.add(document)
        session.flush()
        rows = build_article_rows(
            law_id=document.id,
            law_key=document.law_key,
            law_version_id=version.id,
            articles=[
                {"article_type": "A", "article_no": "第1條", "article_content": "a"},
                {"article_type": "A", "article_no": "第1條", "article_content": "b"},
            ],
        )
        assert len({row["article_key"] for row in rows}) == 2
        persist_article_rows(
            session,
            version_id=version.id,
            law_rows=[(document, rows)],
            previous_version_id=None,
        )
        session.commit()
        assert len(session.scalars(select(LawArticleVersion)).all()) == 2
    engine.dispose()
