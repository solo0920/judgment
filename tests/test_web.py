from __future__ import annotations

import json
import os
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.models import (
    AppSetting,
    Base,
    DownloadRun,
    DownloadUpdateRecord,
    JudgmentChangeEvent,
    JudgmentDocument,
    JudgmentDocumentVersion,
    JudgmentImportRun,
    JudgmentSnapshot,
    LawArticleChangeEvent,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
    OllamaHost,
)
from judgment.observability import record_performance, trace_segment
from judgment.processing_state import ProcessingStateStore
from judgment.web.app import create_app


def _seed(session_factory) -> None:
    now = datetime.now(timezone.utc)
    with session_factory() as session:
        version = LawDatasetVersion(
            source_type="law",
            source_url="https://example.test/law",
            update_date="2026/10/30 上午 12:00:00",
            content_sha256="a" * 64,
            raw_json_sha256="b" * 64,
            zip_sha256="c" * 64,
            zip_path="/tmp/law.zip",
            parquet_path="/tmp/laws.parquet",
            law_count=2,
            article_count=4,
            downloaded_at=now,
            is_current=True,
        )
        session.add(version)
        session.flush()

        session.add_all(
            [
                LawDocument(
                    source_type="law",
                    law_key="L0001",
                    law_name="銀行法",
                    law_level="法律",
                    law_category="金融法規",
                    law_url="https://law.test/L0001",
                    law_modified_date="20260101",
                    law_effective_date="20260101",
                    article_count=2,
                    content_hash="d" * 64,
                    first_seen_version_id=version.id,
                    last_seen_version_id=version.id,
                    is_current=True,
                ),
                LawDocument(
                    source_type="law",
                    law_key="L0002",
                    law_name="保險法",
                    law_level="法律",
                    law_category="金融法規",
                    law_url="https://law.test/L0002",
                    law_modified_date="20251215",
                    law_effective_date="20251215",
                    article_count=2,
                    content_hash="e" * 64,
                    first_seen_version_id=version.id,
                    last_seen_version_id=version.id,
                    is_current=True,
                ),
                LawDocument(
                    source_type="order",
                    law_key="O0001",
                    law_name="銀行法施行細則",
                    law_level="命令",
                    law_category="金融法規",
                    law_url="https://law.test/O0001",
                    law_modified_date="20260101",
                    law_effective_date="20260101",
                    article_count=1,
                    content_hash="f" * 64,
                    first_seen_version_id=version.id,
                    last_seen_version_id=version.id,
                    is_current=True,
                ),
            ]
        )
        session.add(
            DownloadRun(
                source_type="law",
                source_url="https://example.test/law",
                status="success",
                started_at=now,
                finished_at=now,
                duration_ms=1200,
                http_status=200,
                law_count=2,
                article_count=4,
                version_id=version.id,
                parquet_path="/tmp/laws.parquet",
            )
        )
        import_run = JudgmentImportRun(
            status="success",
            data_dir="/tmp/judgments",
            law_list_path="/tmp/金融法規.md",
            law_list_sha256="a" * 64,
            law_list_count=4,
            archive_count=1,
            scanned_count=10,
            matched_count=2,
            stored_count=2,
            failed_count=0,
            citation_count=3,
            started_at=now,
            finished_at=now,
            duration_ms=900,
        )
        session.add(import_run)
        session.flush()
        session.add_all(
            [
                JudgmentDocument(
                    jid="TPDV,115,金訴,1,20260110,1",
                    jyear="115",
                    jcase="金訴",
                    jno="1",
                    jdate="20260110",
                    court="臺灣臺北地方法院民事",
                    court_normalized="臺灣臺北地方法院",
                    title="返還借款",
                    full_text="臺灣臺北地方法院民事判決\n依民法第184條規定。",
                    pdf_url="https://example.test/j1.pdf",
                    source_archive="202601.rar",
                    content_hash="1" * 64,
                    matched_laws=["民法"],
                    matched_laws_text="\n民法\n",
                    citations=[
                        {
                            "law_name": "民法",
                            "article_no": "第184條",
                            "text": "民法第184條",
                        }
                    ],
                    citation_count=1,
                    full_text_length=30,
                    import_run_id=import_run.id,
                ),
                JudgmentDocument(
                    jid="TPDV,115,保險,2,20260112,1",
                    jyear="115",
                    jcase="保險",
                    jno="2",
                    jdate="20260112",
                    court="臺灣臺北地方法院民事",
                    court_normalized="臺灣臺北地方法院",
                    title="保險給付",
                    full_text="臺灣臺北地方法院民事判決\n依保險法第2條及民法第184條。",
                    pdf_url="https://example.test/j2.pdf",
                    source_archive="202601.rar",
                    content_hash="2" * 64,
                    matched_laws=["保險法", "民法"],
                    matched_laws_text="\n保險法\n民法\n",
                    citations=[
                        {
                            "law_name": "保險法",
                            "article_no": "第2條",
                            "text": "保險法第2條",
                        },
                        {
                            "law_name": "民法",
                            "article_no": "第184條",
                            "text": "民法第184條",
                        },
                    ],
                    citation_count=2,
                    full_text_length=40,
                    import_run_id=import_run.id,
                ),
            ]
        )
        session.commit()


def _write_parquet(data_dir: Path) -> Path:
    path = data_dir / "parquet" / "law" / "20261030" / "abc123" / "laws.parquet"
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = [
        {
            "source_type": "law",
            "source_url": "https://example.test/law",
            "source_update_date": "2026/10/30 上午 12:00:00",
            "law_key": "L0001",
            "law_name": "銀行法",
            "law_level": "法律",
            "law_category": "金融法規",
            "law_url": "https://law.test/L0001",
            "law_modified_date": "20260101",
            "law_effective_date": "20260101",
            "law_effective_note": "",
            "law_abandon_note": "",
            "law_has_eng_version": False,
            "eng_law_name": "",
            "law_attachments_json": (
                '[{"FileName": "附件.pdf", "FileURL": "https://law.test/a.pdf"}]'
            ),
            "law_histories": "中華民國 115 年 1 月 1 日修正公布",
            "law_foreword": "",
            "article_count": 2,
            "content_hash": "d" * 64,
            "law_articles": [
                {
                    "article_type": "C",
                    "article_no": "",
                    "article_content": "第一章 總則",
                },
                {
                    "article_type": "A",
                    "article_no": "第 1 條",
                    "article_content": "為健全銀行業務經營。",
                },
                {
                    "article_type": "A",
                    "article_no": "第 2 條",
                    "article_content": "銀行之主管機關為金融監督管理委員會。",
                },
            ],
            "raw_json": '{"LawName": "銀行法"}',
        },
        {
            "source_type": "law",
            "source_url": "https://example.test/law",
            "source_update_date": "2026/10/30 上午 12:00:00",
            "law_key": "L0002",
            "law_name": "保險法",
            "law_level": "法律",
            "law_category": "金融法規",
            "law_url": "https://law.test/L0002",
            "law_modified_date": "20251215",
            "law_effective_date": "20251215",
            "law_effective_note": "",
            "law_abandon_note": "",
            "law_has_eng_version": False,
            "eng_law_name": "",
            "law_attachments_json": "[]",
            "law_histories": "",
            "law_foreword": "",
            "article_count": 2,
            "content_hash": "e" * 64,
            "law_articles": [
                {
                    "article_type": "A",
                    "article_no": "第 1 條",
                    "article_content": "為規範保險業務。",
                },
                {
                    "article_type": "A",
                    "article_no": "第 2 條",
                    "article_content": "保險業務由主管機關監督。",
                },
            ],
            "raw_json": '{"LawName": "保險法"}',
        },
        {
            "source_type": "order",
            "source_url": "https://example.test/order",
            "source_update_date": "2026/10/30 上午 12:00:00",
            "law_key": "O0001",
            "law_name": "銀行法施行細則",
            "law_level": "命令",
            "law_category": "金融法規",
            "law_url": "https://law.test/O0001",
            "law_modified_date": "20260101",
            "law_effective_date": "20260101",
            "law_effective_note": "",
            "law_abandon_note": "",
            "law_has_eng_version": False,
            "eng_law_name": "",
            "law_attachments_json": "[]",
            "law_histories": "",
            "law_foreword": "",
            "article_count": 1,
            "content_hash": "f" * 64,
            "law_articles": [
                {
                    "article_type": "A",
                    "article_no": "第 1 條",
                    "article_content": "本細則依銀行法規定。",
                }
            ],
            "raw_json": '{"LawName": "銀行法施行細則"}',
        },
    ]
    for source_type, subset in (
        ("law", [row for row in rows if row["source_type"] == "law"]),
        ("order", [row for row in rows if row["source_type"] == "order"]),
    ):
        if not subset:
            continue
        source_path = (
            data_dir
            / "raw_parquet"
            / source_type
            / "20261030"
            / "abc123"
            / "laws.parquet"
        )
        source_path.parent.mkdir(parents=True, exist_ok=True)
        pq.write_table(pa.Table.from_pylist(subset), source_path)
    return path


def _write_raw_judgments(data_dir: Path) -> Path:
    path = (
        Path(data_dir)
        / "parquet"
        / "raw_judgments"
        / "202601-demo"
        / "20261108"
        / "120000-demo"
        / "raw.parquet"
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = [
        {
            "source_archive": "202601.rar",
            "entry_index": 1,
            "jid": "TPDV,115,金訴,1,20260110,1",
            "jyear": "115",
            "jcase": "金訴",
            "jno": "1",
            "jdate": "20260110",
            "court": "臺灣臺北地方法院民事",
            "court_normalized": "臺灣臺北地方法院",
            "title": "返還借款",
            "pdf_url": "https://example.test/j1.pdf",
            "content_hash": "1" * 64,
            "full_text_length": 30,
            "matched_laws": ["民法"],
            "matched_laws_text": "\n民法\n",
            "citations": json.dumps(
                [{"law_name": "民法", "article_no": "第184條", "text": "民法第184條"}],
                ensure_ascii=False,
            ),
            "citation_count": 1,
            "raw_json": json.dumps(
                {
                    "JID": "TPDV,115,金訴,1,20260110,1",
                    "JFULL": "臺灣臺北地方法院民事判決\n依民法第184條規定。",
                    "JPDF": "https://example.test/j1.pdf",
                },
                ensure_ascii=False,
            ),
        },
        {
            "source_archive": "202601.rar",
            "entry_index": 2,
            "jid": "TPDV,115,保險,2,20260112,1",
            "jyear": "115",
            "jcase": "保險",
            "jno": "2",
            "jdate": "20260112",
            "court": "臺灣臺北地方法院民事",
            "court_normalized": "臺灣臺北地方法院",
            "title": "保險給付",
            "pdf_url": "https://example.test/j2.pdf",
            "content_hash": "2" * 64,
            "full_text_length": 40,
            "matched_laws": ["保險法", "民法"],
            "matched_laws_text": "\n保險法\n民法\n",
            "citations": json.dumps(
                [
                    {"law_name": "保險法", "article_no": "第2條", "text": "保險法第2條"},
                    {"law_name": "民法", "article_no": "第184條", "text": "民法第184條"},
                ],
                ensure_ascii=False,
            ),
            "citation_count": 2,
            "raw_json": json.dumps(
                {
                    "JID": "TPDV,115,保險,2,20260112,1",
                    "JFULL": "臺灣臺北地方法院民事判決\n依保險法第2條及民法第184條。",
                    "JPDF": "https://example.test/j2.pdf",
                },
                ensure_ascii=False,
            ),
        },
    ]
    pq.write_table(pa.Table.from_pylist(rows), path)
    (path.parent / "manifest.json").write_text(
        json.dumps(
            {
                "version": 2,
                "archive_name": "202601.rar",
                "archive_path": "/tmp/202601.rar",
                "archive_size_bytes": 1,
                "archive_mtime_ns": 1,
                "row_count": 2,
                "compressed_bytes": path.stat().st_size,
                "raw_path": str(path),
                "created_at": "2026-11-08T12:00:00+00:00",
            },
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    return path


@pytest.fixture()
def web_client(tmp_path: Path, monkeypatch):
    monkeypatch.delenv("QDRANT_URL", raising=False)
    monkeypatch.delenv("RAG_API_URL", raising=False)
    monkeypatch.delenv("LLM_MODEL", raising=False)
    monkeypatch.delenv("OPENAI_MODEL", raising=False)
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    _seed(session_factory)
    data_dir = tmp_path / "data"
    _write_parquet(data_dir)

    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=data_dir,
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path / "judgments",
        judgment_law_list=Path(__file__).resolve().parents[1] / "documents" / "金融法規.md",
        auto_create_schema=False,
    )
    _write_raw_judgments(settings.judgment_data_dir)
    app = create_app(
        settings=settings,
        session_factory=session_factory,
        data_dir=data_dir,
    )
    with TestClient(app) as client:
        yield client


def test_static_console_is_served(web_client) -> None:
    page = web_client.get("/")
    assert page.status_code == 200
    assert "Judgment RAG Console" in page.text
    assert "/assets/js/app.js" in page.text
    assert 'id="style-trigger"' in page.text
    assert 'aria-label="選擇介面風格"' in page.text
    assert 'class="style-trigger-copy"' not in page.text
    assert 'id="system-test-trigger"' not in page.text
    assert 'data-route="tests"' not in page.text
    assert 'href="#/tests"' not in page.text
    assert 'id="header-status"' not in page.text
    assert 'data-route="performance"' in page.text
    assert 'data-route="quality"' in page.text

    css = web_client.get("/assets/styles.css")
    assert css.status_code == 200
    assert "--accent" in css.text

    themes = web_client.get("/assets/themes.css")
    assert themes.status_code == 200
    assert 'data-theme="linear"' in themes.text

    theme_script = web_client.get("/assets/js/themes.js")
    assert theme_script.status_code == 200
    assert 'DEFAULT_THEME = "nvidia"' in theme_script.text
    assert 'id="style-menu"' in page.text
    assert 'id="theme-label"' not in page.text
    assert 'id="theme-swatches"' not in page.text

    favicon = web_client.get("/favicon.svg")
    assert favicon.status_code == 200
    assert favicon.headers["content-type"].startswith("image/svg")


def test_index_versions_endpoint_returns_alias(web_client) -> None:
    response = web_client.get("/api/index-versions")
    assert response.status_code == 200
    payload = response.json()
    assert payload["alias"] == "judgments_current"
    assert payload["versions"] == []


def test_courts_check_endpoint_returns_month_summary(web_client) -> None:
    response = web_client.get("/api/courts/check")
    assert response.status_code == 200
    payload = response.json()
    assert "months" in payload
    assert "summary" in payload
    assert "totals" in payload
    assert payload["canonical_count"] > 0


def test_law_versions_check_endpoint_returns_month_summary(web_client) -> None:
    response = web_client.get("/api/law-versions/check")
    assert response.status_code == 200
    payload = response.json()
    assert "months" in payload
    assert "summary" in payload
    assert "totals" in payload


def test_system_usage_endpoint_returns_resources(web_client, monkeypatch) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
    payload = {
        "status": "operational",
        "checked_at": "2026-11-09T00:00:00+00:00",
        "host": {
            "cpu": {"percent": 10.0, "logical_cores": 8},
            "memory": {"total": 1024, "used": 512, "percent": 50.0},
        },
        "disk": [{"label": "系統磁碟", "total": 2048, "used": 1024}],
        "docker": {"available": True, "containers": [], "system": []},
        "databases": [
            {"id": "postgres", "name": "PostgreSQL", "status": "operational"},
            {"id": "qdrant", "name": "Qdrant", "status": "operational"},
        ],
    }
    monkeypatch.setattr(
        app_module,
        "build_system_usage",
        lambda **kwargs: payload,
    )
    response = web_client.get("/api/system-usage")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "operational"
    assert body["host"]["cpu"]["percent"] == 10.0
    assert [item["id"] for item in body["databases"]] == ["postgres", "qdrant"]


def test_status_endpoint_reports_real_services(web_client) -> None:
    response = web_client.get("/api/status")
    assert response.status_code == 200
    payload = response.json()

    assert payload["status"] == "operational"
    services = {item["id"]: item for item in payload["services"]}
    assert services["postgres"]["status"] == "operational"
    assert services["parquet"]["status"] == "operational"
    assert services["qdrant"]["status"] == "not_configured"
    assert services["embedding"]["status"] == "not_configured"
    assert services["llm"]["status"] == "not_configured"
    assert services["rag"]["status"] == "not_configured"
    assert payload["data"]["judgment_indexed_count"] == 0
    assert payload["data"]["judgment_vector_collection"] == "judgment_documents"
    assert payload["data"]["law_count"] == 2
    assert payload["data"]["order_count"] == 1
    assert payload["data"]["article_count"] == 5
    assert payload["recent_runs"][0]["status"] == "success"
    assert [layer["id"] for layer in payload["architecture"]["layers"]] == [
        "client",
        "api",
        "data",
        "ai",
    ]


def test_quality_endpoint_reports_raw_parquet(web_client) -> None:
    response = web_client.get("/api/quality")
    assert response.status_code == 200
    payload = response.json()

    assert payload["available"] is True
    assert payload["source"]["engine"] == "duckdb"
    assert payload["source"]["raw_files"] == 1
    assert payload["totals"]["rows"] == 2
    assert payload["totals"]["unique_jids"] == 2
    assert payload["totals"]["matched_rows"] == 2
    assert len(payload["archives"]) == 1
    assert payload["archives"][0]["archive"] == "202601.rar"
    assert payload["coverage"]["postgres_judgments"] == 2
    assert payload["coverage"]["postgres_diff"] == 0
    assert payload["status"] == "operational"
    assert any("v2" in warning for warning in payload["warnings"])


def test_versioning_endpoints_expose_new_and_old_data(web_client) -> None:
    session_factory = web_client.app.state.session_factory
    jid = "TPDV,115,金訴,1,20260110,1"
    with session_factory() as session:
        old_snapshot = JudgmentSnapshot(
            issue_month="202601",
            source_archive="202601--(20260101Update).rar",
            archive_sha256="a" * 64,
            source_update_date="20260101",
            raw_row_count=10,
            matched_count=2,
            is_current=False,
        )
        new_snapshot = JudgmentSnapshot(
            issue_month="202601",
            source_archive="202601--(20260201Update).rar",
            archive_sha256="b" * 64,
            source_update_date="20260201",
            raw_row_count=11,
            matched_count=2,
            is_current=True,
        )
        session.add_all([old_snapshot, new_snapshot])
        session.flush()
        version = JudgmentDocumentVersion(
            jid=jid,
            issue_month="202601",
            snapshot_id=old_snapshot.id,
            content_hash="old" * 21,
            normalized_hash="norm" * 16,
            jyear="115",
            jcase="金訴",
            jno="1",
            jdate="20260110",
            court="臺灣臺北地方法院民事",
            court_normalized="臺灣臺北地方法院",
            title="返還借款",
            full_text="舊版判決全文",
            source_archive="202601--(20260101Update).rar",
            matched_laws=["民法"],
            matched_laws_text="\n民法\n",
            citations=[],
            citation_count=0,
            full_text_length=6,
            valid_from_snapshot_id=old_snapshot.id,
            valid_to_snapshot_id=new_snapshot.id,
        )
        session.add(version)
        session.flush()
        session.add(
            JudgmentChangeEvent(
                jid=jid,
                issue_month="202601",
                from_snapshot_id=old_snapshot.id,
                to_snapshot_id=new_snapshot.id,
                from_version_id=version.id,
                change_type="modified",
                changed_fields=["content_hash"],
                before_json={"content_hash": "old"},
                after_json={"content_hash": "new"},
            )
        )
        session.commit()
        version_id = int(version.id)

    summary = web_client.get("/api/versioning/summary")
    assert summary.status_code == 200
    assert summary.json()["historical_versions"] >= 1
    snapshots = web_client.get(
        "/api/versioning/judgments/snapshots",
        params={"issue_month": "202601"},
    )
    assert snapshots.status_code == 200
    assert [item["is_current"] for item in snapshots.json()["snapshots"]] == [
        True,
        False,
    ]
    history = web_client.get(
        f"/api/versioning/judgments/{jid}"
    )
    assert history.status_code == 200
    body = history.json()
    assert body["current"]["jid"] == jid
    assert body["versions"][0]["id"] == version_id
    assert body["events"][0]["change_type"] == "modified"
    detail = web_client.get(
        f"/api/versioning/judgments/versions/{version_id}"
    )
    assert detail.status_code == 200
    assert detail.json()["full_text"] == "舊版判決全文"
    audit = web_client.get(
        "/api/versioning/audit", params={"since_id": 0, "limit": 10}
    )
    assert audit.status_code == 200
    assert audit.json()["events"][0]["jid"] == jid
    assert audit.json()["latest_event_id"] >= 1
    vector = web_client.get(
        f"/api/versioning/judgments/{jid}/vectors/1"
    )
    assert vector.status_code == 200
    assert vector.json()["status"] == "not_configured"


def test_judgment_queries_exclude_historical_rows(web_client) -> None:
    session_factory = web_client.app.state.session_factory
    with session_factory() as session:
        document = session.scalars(
            select(JudgmentDocument).where(
                JudgmentDocument.jid == "TPDV,115,金訴,1,20260110,1"
            )
        ).one()
        document.is_current = False
        session.commit()

    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "judgment_documents"},
            "page": 1,
            "page_size": 10,
        },
    )
    assert response.status_code == 200
    assert response.json()["total"] == 1

    history = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_documents",
                "column_filters": {"is_current": "false"},
            },
            "page": 1,
            "page_size": 10,
        },
    )
    assert history.status_code == 200
    assert history.json()["total"] == 1
    assert history.json()["rows"][0]["jid"] == "TPDV,115,金訴,1,20260110,1"


def test_updates_status_and_processing_flags(web_client) -> None:
    session_factory = web_client.app.state.session_factory
    with session_factory() as session:
        session.add(
            DownloadUpdateRecord(
                source_type="law",
                source_url="https://example.test/law",
                status="update_available",
                update_available=True,
                remote_filename="ChLaw.json.zip",
                remote_content_length=123,
                message="法規遠端 ZIP 大小變更",
                is_current=True,
            )
        )
        session.commit()

    status = web_client.get("/api/updates/status")
    assert status.status_code == 200
    body = status.json()
    assert body["update_count"] == 1
    assert body["sources"]["law"]["update_available"] is True
    assert body["sources"]["order"]["update_available"] is False

    state = ProcessingStateStore()
    run_id = state.start_run(
        branch="law",
        kind="download",
        title="法規資料下載",
        stages=["download", "raw_parquet", "parse", "postgres"],
        pid=os.getpid(),
    )
    state.start_stage(run_id, "download", total=100)
    state.finish_stage(
        run_id, "download", status="success", current=100, total=100
    )
    state.start_stage(run_id, "raw_parquet", total=10)
    state.finish_stage(
        run_id, "raw_parquet", status="success", current=10, total=10
    )
    state.finish_stage(
        run_id, "parse", status="skipped", message="raw JSON unchanged"
    )
    state.finish_stage(
        run_id, "postgres", status="skipped", message="raw JSON unchanged"
    )
    state.finish_run(
        run_id, status="no_change", message="raw JSON unchanged"
    )

    processing = web_client.get("/api/processing")
    assert processing.status_code == 200
    workflows = {
        item["id"]: item for item in processing.json()["workflows"]
    }
    assert workflows["law_download"]["update_available"] is True
    assert workflows["order_download"]["update_available"] is False
    assert workflows["judgment_download"]["update_available"] is False
    assert (
        workflows["law_download"]["recent_runs"][0]["status"]
        == "no_change"
    )
    assert (
        workflows["law_download"]["update_history"][0]["status"]
        == "update_available"
    )
    progress = workflows["law_download"]["progress"]
    assert progress["available"] is True
    assert progress["overall_percent"] == 100.0
    assert progress["completed_stages"] == 2
    assert progress["total_stages"] == 2
    assert [stage["key"] for stage in progress["stages"]] == [
        "download",
        "raw_parquet",
        "parse",
        "postgres",
    ]
    assert [
        stage["status"] for stage in progress["stages"]
    ] == ["success", "success", "skipped", "skipped"]
    assert [
        stage["contribution_percent"] for stage in progress["stages"]
    ] == [50.0, 50.0, 0.0, 0.0]


def test_updates_check_can_filter_sources(web_client, monkeypatch) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
    captured = {}

    def fake_check(**kwargs):
        captured.update(kwargs)
        return {"sources": []}

    monkeypatch.setattr(app_module, "check_all_sources", fake_check)
    response = web_client.post(
        "/api/updates/check", json={"source_types": ["law"]}
    )
    assert response.status_code == 200
    assert captured["source_types"] == ["law"]

    no_body = web_client.post("/api/updates/check")
    assert no_body.status_code == 200
    assert captured["source_types"] is None

    invalid = web_client.post(
        "/api/updates/check", json={"source_types": ["unknown"]}
    )
    assert invalid.status_code == 400


def test_catalog_exposes_law_and_judgment_categories(web_client) -> None:
    response = web_client.get("/api/catalog")
    assert response.status_code == 200
    categories = {item["id"]: item for item in response.json()["categories"]}
    assert set(categories) == {"law", "judgment"}
    assert categories["judgment"]["count"] == 2

    law_databases = {
        item["id"]: item for item in categories["law"]["databases"]
    }
    assert set(law_databases) == {"postgres", "parquet", "qdrant", "indexeddb"}
    law_fields = {
        field["key"]: field for field in law_databases["postgres"]["fields"]
    }
    assert law_fields["table"]["default"] == "law_documents"
    assert "law_dataset_versions" in [
        option["value"] for option in law_fields["table"]["options"]
    ]
    assert law_databases["parquet"]["available"] is True

    judgment_databases = {
        item["id"]: item for item in categories["judgment"]["databases"]
    }
    assert set(judgment_databases) == {
        "postgres",
        "parquet",
        "qdrant",
        "indexeddb",
    }
    assert judgment_databases["parquet"]["available"] is True
    assert [table["id"] for table in judgment_databases["parquet"]["tables"]] == [
        "judgment_documents"
    ]
    assert [table["id"] for table in judgment_databases["postgres"]["tables"]] == [
        "judgment_documents",
        "judgment_import_runs",
    ]
    judgment_fields = {
        field["key"]: field for field in judgment_databases["postgres"]["fields"]
    }
    assert judgment_fields["table"]["default"] == "judgment_documents"
    table_options = [
        option["value"] for option in judgment_fields["table"]["options"]
    ]
    assert "judgment_import_runs" in table_options
    assert "min_citations" not in judgment_fields
    assert "sort" not in judgment_fields
    law_options = [
        option["value"] for option in judgment_fields["law_name"]["options"]
    ]
    assert "銀行法" in law_options
    court_options = [
        option["value"] for option in judgment_fields["court"]["options"]
    ]
    assert "臺灣臺北地方法院" in court_options
    assert "臺灣臺北地方法院民事" not in court_options
    assert judgment_databases["qdrant"]["status"] == "not_configured"


def test_performance_middleware_records_api_calls(web_client) -> None:
    web_client.get("/api/status")
    web_client.get("/api/catalog")

    response = web_client.get(
        "/api/performance",
        params={"process": "服務狀態", "page_size": 10},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["database"] == "performance"
    assert payload["total"] >= 1
    assert payload["rows"][0]["process"] == "服務狀態"
    assert payload["rows"][0]["module"] == "judgment.web.status.build_status"
    assert payload["rows"][0]["started_at"]
    assert payload["summary"][0]["label"] == "符合筆數"
    flow = payload["rows"][0]["flow"]
    assert isinstance(flow, dict)
    assert flow["request_id"] == payload["rows"][0]["request_id"]
    segment_names = [segment["name"] for segment in flow["segments"]]
    assert "http.request" in segment_names
    assert "api.endpoint" in segment_names
    for segment in flow["segments"]:
        assert segment["module"]
        assert segment["function"]
        assert isinstance(segment["params"], dict)
        assert isinstance(segment["param_names"], list)
        assert "duration_ms" in segment
    assert payload["rows"][0]["flow_segments"] >= 2
    assert payload["flow_stats"]["sample_size"] >= 1
    assert payload["flow_stats"]["avg_segments"] >= 2

    options = web_client.get("/api/performance/options")
    assert options.status_code == 200
    assert "服務狀態" in options.json()["processes"]

    filtered = web_client.get(
        "/api/performance",
        params={
            "process": "服務狀態",
            "status": "success",
            "from_date": "2000-01-01",
            "min_duration": 0,
        },
    )
    assert filtered.status_code == 200
    assert filtered.json()["total"] >= 1


def test_performance_report_includes_index_stats(web_client) -> None:
    started = datetime.now(timezone.utc)
    record_performance(
        web_client.app.state.session_factory,
        process="判決向量索引",
        module="judgment.judgment_index.index_judgments",
        status="success",
        started_at=started,
        finished_at=started,
        duration_ms=120_000,
        params={
            "batch_size": 128,
            "max_chars": 1600,
            "task": "2",
        },
        details={
            "indexed_count": 2560,
            "scanned_count": 2560,
            "batch_count": 20,
            "batch_avg_ms": 6000,
            "batch_min_ms": 5400,
            "batch_max_ms": 6600,
            "points_per_second": 21.33,
            "embedding_ms": 118000,
            "qdrant_ms": 1500,
            "db_write_ms": 500,
            "progress": [
                {"elapsed_s": 60, "indexed": 1280, "rate": 21.3},
                {"elapsed_s": 120, "indexed": 2560, "rate": 21.3},
            ],
            "coverage": {
                "total_judgments": 100,
                "indexed_judgments": 50,
                "remaining_judgments": 50,
            },
            "task": "2",
        },
    )

    payload = web_client.get(
        "/api/performance",
        params={"process": "判決向量索引", "page_size": 10},
    ).json()
    stats = payload["index_stats"]
    assert stats is not None
    assert stats["latest"]["indexed_count"] == 2560
    assert stats["latest"]["batch_count"] == 20
    assert stats["latest"]["points_per_second"] == 21.33
    assert stats["latest"]["task"] == "2"
    assert stats["latest"]["time_breakdown"][0]["key"] == "embedding"
    assert len(stats["latest"]["progress"]) == 2
    assert len(stats["runs"]) >= 1
    labels = [item["label"] for item in payload["summary"]]
    assert "索引執行筆數" in labels
    assert "平均每秒筆數" in labels


def test_index_stats_derives_batch_metrics_for_old_records(web_client) -> None:
    record_performance(
        web_client.app.state.session_factory,
        process="判決向量索引",
        module="judgment.judgment_index.index_judgments",
        status="success",
        duration_ms=60_000,
        params={"batch_size": 128},
        details={"indexed_count": 256, "scanned_count": 256},
    )

    payload = web_client.get(
        "/api/performance",
        params={"process": "判決向量索引", "page_size": 10},
    ).json()
    latest = payload["index_stats"]["latest"]
    assert latest["batch_count"] == 2
    assert latest["points_per_second"] == 4.27
    assert latest["batch_avg_ms"] == 30000.0
    assert latest["time_breakdown"] == []


def test_client_timing_merges_into_flow(web_client) -> None:
    web_client.get("/api/catalog")
    payload = web_client.get(
        "/api/performance",
        params={"process": "資料庫 catalog", "page_size": 1},
    ).json()
    row = payload["rows"][0]
    assert row["request_id"]

    timing = web_client.post(
        "/api/performance/client",
        json={
            "request_id": row["request_id"],
            "route": "/#/performance",
            "total_ms": 321,
            "render_ms": 88,
            "status": "success",
        },
    )
    assert timing.status_code == 200
    assert timing.json()["status"] == "ok"

    updated = web_client.get(
        "/api/performance",
        params={"process": "資料庫 catalog", "page_size": 1},
    ).json()
    flow = updated["rows"][0]["flow"]
    assert flow["client"]["total_ms"] == 321
    assert flow["client"]["render_ms"] == 88
    assert any(
        segment["name"] == "client.render" for segment in flow["segments"]
    )
    assert flow["summary"]["segment_count"] == len(flow["segments"])


def test_rag_flow_records_nested_segments_and_models(web_client) -> None:
    response = web_client.post(
        "/api/rag/query",
        json={"question": "銀行法如何規範吸收存款？"},
    )
    assert response.status_code == 200

    pipeline = response.json()["pipeline_flow"]
    assert pipeline["metadata"]["rag_response"]["status"]
    assert "rag.parse_question" in [
        segment["name"] for segment in pipeline["segments"]
    ]

    payload = web_client.get(
        "/api/performance",
        params={"process": "RAG 問答", "page_size": 1},
    ).json()
    flow = payload["rows"][0]["flow"]
    assert flow["metadata"]["question"] == "銀行法如何規範吸收存款？"
    assert flow["metadata"]["answer"]
    names = [segment["name"] for segment in flow["segments"]]
    assert "rag.answer_question" in names
    assert "rag.parse_question" in names
    assert "rag.coverage" in names
    assert "rag.law_lookup" in names
    assert "rag.law_content" in names
    assert "bge-m3" in flow["summary"]["models"]
    for segment in flow["segments"]:
        assert segment["finished_at"]
        assert segment["end_offset_ms"] >= segment["offset_ms"]
    response = flow["metadata"]["rag_response"]
    assert response["citation_count"] >= 0
    assert response["status"]
    assert "abstain" in response
    law_lookup = next(
        segment for segment in flow["segments"] if segment["name"] == "rag.law_lookup"
    )
    assert law_lookup["params"]["question_length"] == len("銀行法如何規範吸收存款？")
    law_content = next(
        segment for segment in flow["segments"] if segment["name"] == "rag.law_content"
    )
    assert law_content["params"]["law_count"] >= 1

    filtered = web_client.get(
        "/api/performance",
        params={"model": "bge-m3", "process": "RAG 問答"},
    )
    assert filtered.status_code == 200
    assert filtered.json()["total"] >= 1


def test_rag_stream_emits_live_steps_and_result(web_client, monkeypatch) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")

    def fake_answer_question(
        *,
        session_factory,
        question,
        settings,
        on_partial=None,
        on_token=None,
        on_token_reset=None,
    ):
        with trace_segment(
            "rag.fake_step",
            module="test.rag",
            function="fake_answer_question",
            params={"question_length": len(question)},
        ):
            pass
        if on_partial:
            on_partial(
                {
                    "partial": True,
                    "streaming": False,
                    "status": "retrieving",
                    "answer": "法規結果先顯示",
                }
            )
        if on_token_reset:
            on_token_reset()
        if on_token:
            on_token("測試")
            on_token("回答")
        return {
            "status": "operational",
            "answer": "測試回答 [1]",
            "notice": "test",
            "citations": [],
            "judgments": [],
            "law_sources": [],
            "matched_terms": [],
            "duration_ms": 1,
        }

    monkeypatch.setattr(app_module, "answer_question", fake_answer_question)
    with web_client.stream(
        "POST",
        "/api/rag/query/stream",
        json={"question": "測試問題"},
    ) as response:
        assert response.status_code == 200
        body = "".join(response.iter_text())

    assert "event: step" in body
    assert "http.request" in body
    assert "rag.fake_step" in body
    assert "event: partial" in body
    assert "event: token_reset" in body
    assert "event: token" in body
    assert "法規結果先顯示" in body
    assert "測試回答" in body
    assert "event: result" in body
    assert '"pipeline_flow"' in body
    assert body.index("event: partial") < body.index("event: result")
    assert body.index("event: token") < body.index("event: result")


def test_data_query_flow_records_function_params(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "law_documents", "keyword": "銀行"},
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200

    payload = web_client.get(
        "/api/performance",
        params={"process": "資料查詢", "page_size": 1},
    ).json()
    flow = payload["rows"][0]["flow"]
    segments = {segment["name"]: segment for segment in flow["segments"]}
    assert "query.run" in segments
    assert "query.postgres" in segments
    assert segments["query.postgres"]["params"]["table"] == "law_documents"
    assert "keyword" in segments["query.postgres"]["params"]["filter_keys"]
    assert segments["query.postgres"]["function"] == "_query_postgres"


def test_test_mode_endpoints_and_empty_test_runs(web_client) -> None:
    state = web_client.get("/api/test-mode")
    assert state.status_code == 200
    payload = state.json()
    assert payload["enabled"] is False
    assert "embedding" in payload["models"]
    assert "llm" in payload["models"]

    enabled = web_client.post("/api/test-mode", json={"enabled": True})
    assert enabled.status_code == 200
    assert enabled.json()["enabled"] is True
    assert web_client.get("/api/test-mode").json()["enabled"] is True

    current = web_client.get("/api/test-runs/current")
    assert current.status_code == 200
    assert current.json()["run"] is None

    runs = web_client.get("/api/test-runs")
    assert runs.status_code == 200
    assert runs.json()["runs"] == []




def test_judgment_parquet_source_reads_full_text(web_client) -> None:
    response = web_client.get(
        "/api/judgment",
        params={
            "jid": "TPDV,115,金訴,1,20260110,1",
            "source": "parquet",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["source"] == "parquet"
    assert payload["court"] == "臺灣臺北地方法院"
    assert "民法第184條" in payload["full_text"]
    assert payload["pdf_url"] == "https://example.test/j1.pdf"
    assert payload["parquet_row_count"] == 2

    missing = web_client.get(
        "/api/judgment",
        params={"jid": "NOPE,1,訴,1,20260101,1", "source": "parquet"},
    )
    assert missing.status_code == 404


def test_judgment_parquet_query_returns_report(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "parquet",
            "filters": {
                "table": "judgment_documents",
                "keyword": "民法",
                "columns": [
                    "jid",
                    "court_normalized",
                    "title",
                    "jdate",
                    "matched_laws",
                    "citation_count",
                ],
                "sort": "citation_count:desc",
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["database"] == "parquet"
    assert payload["table"] == "judgment_documents"
    assert payload["total"] >= 1
    assert payload["rows"][0]["_jid"]
    assert "raw.parquet" in payload["query_text"]
    assert [column["key"] for column in payload["columns"]][0] == "jid"


def test_schema_suggestions_rank_and_return_all_matches(web_client) -> None:
    response = web_client.get(
        "/api/schema/suggest",
        params={
            "database": "postgres",
            "table": "law_documents",
            "column": "law_name",
            "q": "銀行",
            "limit": 1000,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 2
    assert payload["values"] == ["銀行法", "銀行法施行細則"]
    assert payload["truncated"] is False


def test_schema_preview_column_filter_and_sort(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "law_documents",
                "schema_preview": True,
                "column_filters": {"law_name": "銀行"},
                "sort": "article_count:desc",
            },
            "page": 1,
            "page_size": 10,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 2
    assert {row["law_name"] for row in payload["rows"]} == {
        "銀行法",
        "銀行法施行細則",
    }
    assert payload["rows"][0]["law_name"] == "銀行法"
    assert payload["meta"]["sort"] == {
        "key": "article_count",
        "direction": "desc",
    }


def test_postgres_query_returns_report(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "law_documents",
                "source_type": "all",
                "keyword": "銀行",
                "law_level": "法律",
                "is_current": True,
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 1
    assert payload["rows"][0]["law_name"] == "銀行法"
    assert payload["rows"][0]["_law_key"] == "L0001"
    assert payload["rows"][0]["_law_source_type"] == "law"
    assert payload["summary"][0]["label"] == "符合筆數"
    assert "SELECT" in payload["query_text"]
    assert payload["distribution"][0]["label"] == "法律"


def test_judgment_documents_query_filters_by_law_and_keyword(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_documents",
                "keyword": "民法",
                "sort": "jdate:desc",
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 2
    assert payload["rows"][0]["jid"].startswith("TPDV,115")
    assert "民法" in payload["rows"][0]["matched_laws"]
    assert payload["summary"][1]["label"] == "引用總數"
    assert payload["meta"]["sort"] == {"key": "jdate", "direction": "desc"}
    assert "ORDER BY jdate DESC" in payload["query_text"]

    by_law = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_documents",
                "law_name": "保險法",
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert by_law.status_code == 200
    result = by_law.json()
    assert result["total"] == 1
    assert result["rows"][0]["jid"] == "TPDV,115,保險,2,20260112,1"
    assert "保險法" in result["rows"][0]["matched_laws"]

    by_court = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_documents",
                "court": "臺灣臺北地方法院",
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert by_court.status_code == 200
    court_result = by_court.json()
    assert court_result["total"] == 2
    assert court_result["rows"][0]["court"] == "臺灣臺北地方法院"
    assert court_result["rows"][0]["court_raw"] == "臺灣臺北地方法院民事"
    assert court_result["distribution"][0]["label"] == "臺灣臺北地方法院"


def test_judgment_query_supports_header_sort_fields(web_client) -> None:
    cases = [
        ("jid:asc", "jid", "asc", "ORDER BY jid ASC"),
        ("court:desc", "court", "desc", "ORDER BY court_normalized DESC"),
        ("title:asc", "title", "asc", "ORDER BY title ASC"),
        ("jdate:asc", "jdate", "asc", "ORDER BY jdate ASC"),
        (
            "matched_laws:asc",
            "matched_laws",
            "asc",
            "ORDER BY matched_laws_text ASC",
        ),
    ]
    for sort, key, direction, query_line in cases:
        response = web_client.post(
            "/api/query",
            json={
                "database": "postgres",
                "filters": {
                    "table": "judgment_documents",
                    "sort": sort,
                },
                "page": 1,
                "page_size": 25,
            },
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["meta"]["sort"] == {"key": key, "direction": direction}
        assert query_line in payload["query_text"]


def test_judgment_import_runs_query(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_import_runs",
                "status": "success",
                "sort": "jdate:desc",
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["rows"][0]["status"] == "success"
    assert payload["rows"][0]["matched_count"] == 2
    assert "ORDER BY started_at DESC" in payload["query_text"]


def test_postgres_query_unknown_table_is_rejected(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "sqlite_master"},
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 400
    assert "不支援" in response.json()["detail"]


def test_parquet_query_reads_latest_snapshot(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "parquet",
            "filters": {
                "dataset": "law",
                "keyword": "銀行",
                "columns": ["law_name", "law_level", "article_count"],
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["total"] == 1
    assert {row["law_name"] for row in payload["rows"]} == {"銀行法"}
    assert payload["rows"][0]["_law_key"] == "L0001"
    assert payload["rows"][0]["_law_source_type"] == "law"
    assert payload["query_text"].startswith("PARQUET SCAN")
    assert payload["meta"]["dataset"] == "law"


def test_law_detail_combines_postgres_metadata_and_parquet_articles(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={"law_key": "L0001", "source_type": "law"},
    )
    assert response.status_code == 200
    payload = response.json()

    assert payload["status"] == "ok"
    assert payload["law_name"] == "銀行法"
    assert payload["law_level"] == "法律"
    assert payload["is_current"] is True
    assert payload["article_count"] == 2
    assert payload["meta"]["metadata_source"] == "postgresql"
    assert payload["meta"]["articles_source"] == "parquet"
    assert payload["meta"]["snapshot"].endswith("laws.parquet")
    assert [article["article_no"] for article in payload["articles"] if article["article_type"] == "A"] == [
        "第 1 條",
        "第 2 條",
    ]
    assert payload["articles"][0]["article_content"] == "第一章 總則"
    assert payload["attachments"] == [
        {"name": "附件.pdf", "url": "https://law.test/a.pdf"}
    ]
    assert payload["warnings"] == []


def test_law_detail_accepts_law_name_instead_of_key(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={"law_key": "銀行法", "source_type": "law"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["law_name"] == "銀行法"
    assert payload["law_key"] == "L0001"
    assert [article["article_no"] for article in payload["articles"] if article["article_type"] == "A"] == [
        "第 1 條",
        "第 2 條",
    ]


def test_law_detail_filters_single_article(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={
            "law_key": "L0001",
            "source_type": "law",
            "article_no": "第 2 條",
        },
    )
    assert response.status_code == 200
    payload = response.json()

    assert payload["selected_article_no"] == "第 2 條"
    assert payload["meta"]["selected_article_no"] == "第 2 條"
    assert payload["articles"] == [
        {
            "article_type": "A",
            "article_no": "第 2 條",
            "article_content": "銀行之主管機關為金融監督管理委員會。",
        }
    ]


def test_law_detail_article_filter_ignores_whitespace(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={"law_key": "L0001", "source_type": "law", "article_no": "第2條"},
    )
    assert response.status_code == 200
    payload = response.json()

    assert [article["article_no"] for article in payload["articles"]] == ["第 2 條"]


def test_law_detail_returns_404_for_unknown_article(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={
            "law_key": "L0001",
            "source_type": "law",
            "article_no": "第 99 條",
        },
    )
    assert response.status_code == 404
    assert "找不到條文" in response.json()["detail"]


def test_law_detail_reads_selected_article_version(web_client) -> None:
    session_factory = web_client.app.state.session_factory
    with session_factory() as session:
        document = session.scalars(
            select(LawDocument).where(LawDocument.law_key == "L0001")
        ).first()
        assert document is not None
        version1 = session.get(LawDatasetVersion, 1)
        assert version1 is not None
        version1.is_current = False
        version2 = LawDatasetVersion(
            source_type="law",
            source_url="https://example.test/law",
            update_date="2026/11/06 上午 12:00:00",
            content_sha256="1" * 64,
            raw_json_sha256="2" * 64,
            zip_sha256="3" * 64,
            zip_path="/tmp/law-v2.zip",
            parquet_path="/tmp/laws-v2.parquet",
            law_count=2,
            article_count=4,
            is_current=True,
        )
        session.add(version2)
        session.flush()
        session.add_all(
            [
                LawArticleVersion(
                    law_id=document.id,
                    law_key=document.law_key,
                    law_version_id=1,
                    article_key="A:第1條",
                    article_type="A",
                    article_no="第 1 條",
                    article_index=1,
                    article_content="舊版條文內容",
                    content_hash="f" * 64,
                    effective_date="20260101",
                ),
                LawArticleVersion(
                    law_id=document.id,
                    law_key=document.law_key,
                    law_version_id=version2.id,
                    article_key="A:第1條",
                    article_type="A",
                    article_no="第 1 條",
                    article_index=1,
                    article_content="新版條文內容",
                    content_hash="e" * 64,
                    effective_date="20261106",
                ),
                LawArticleChangeEvent(
                    law_id=document.id,
                    law_key=document.law_key,
                    from_version_id=1,
                    to_version_id=version2.id,
                    article_key="A:第1條",
                    article_type="A",
                    article_no="第 1 條",
                    change_type="modified",
                    changed_fields=["article_content"],
                    before_content="舊版條文內容",
                    after_content="新版條文內容",
                    effective_date="20261106",
                ),
            ]
        )
        session.commit()
        version2_id = version2.id

    response = web_client.get(
        "/api/law",
        params={"law_key": "L0001", "source_type": "law"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["selected_version_id"] == version2_id
    assert payload["meta"]["selected_version_is_current"] is True
    assert payload["articles"][0]["article_content"] == "新版條文內容"
    assert payload["change_summary"] == {"modified": 1}
    assert payload["changes_available"] is True
    assert payload["changes"][0]["before_content"] == "舊版條文內容"

    old_response = web_client.get(
        "/api/law",
        params={"law_key": "L0001", "source_type": "law", "version_id": 1},
    )
    assert old_response.status_code == 200
    old_payload = old_response.json()
    assert old_payload["selected_version_id"] == 1
    assert old_payload["meta"]["selected_version_is_current"] is False
    assert old_payload["articles"][0]["article_content"] == "舊版條文內容"
    assert any("歷史" in warning for warning in old_payload["warnings"])


def test_law_detail_without_parquet_returns_metadata_warning(web_client, tmp_path) -> None:
    empty_dir = tmp_path / "empty-data"
    settings = replace(web_client.app.state.settings, law_data_dir=empty_dir)
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=empty_dir,
    )
    with TestClient(app) as client:
        response = client.get(
            "/api/law",
            params={"law_key": "L0001", "source_type": "law"},
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "degraded"
    assert payload["law_name"] == "銀行法"
    assert payload["articles"] == []
    assert any("Parquet" in warning for warning in payload["warnings"])


def test_judgment_detail_returns_full_text_and_citations(web_client) -> None:
    response = web_client.get(
        "/api/judgment",
        params={"jid": "TPDV,115,金訴,1,20260110,1"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["jid"] == "TPDV,115,金訴,1,20260110,1"
    assert payload["court"] == "臺灣臺北地方法院"
    assert payload["court_raw"] == "臺灣臺北地方法院民事"
    assert "民法第184條" in payload["full_text"]
    assert payload["matched_laws"] == ["民法"]
    assert payload["citations"][0]["article_no"] == "第184條"
    assert payload["citation_count"] == 1
    assert payload["full_text_length"] > 0
    assert payload["source_archive"] == "202601.rar"


def test_judgment_detail_returns_404_for_unknown_jid(web_client) -> None:
    response = web_client.get("/api/judgment", params={"jid": "missing"})
    assert response.status_code == 404
    assert "找不到判決" in response.json()["detail"]


def test_law_detail_returns_404_for_unknown_law(web_client) -> None:
    response = web_client.get("/api/law", params={"law_key": "missing"})
    assert response.status_code == 404
    assert "找不到法規" in response.json()["detail"]


def test_law_detail_rejects_unknown_source_type(web_client) -> None:
    response = web_client.get(
        "/api/law",
        params={"law_key": "L0001", "source_type": "unknown"},
    )
    assert response.status_code == 400
    assert "不支援" in response.json()["detail"]


def test_qdrant_query_requires_semantic_query(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "qdrant",
            "filters": {"collection": "judgment_segments", "top_k": 10},
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "missing_query"
    assert payload["rows"] == []
    assert "語意查詢" in payload["message"]


def test_qdrant_query_is_honest_about_configuration(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={
            "database": "qdrant",
            "filters": {
                "collection": "judgment_segments",
                "query": "銀行法吸收存款",
                "top_k": 10,
            },
            "page": 1,
            "page_size": 25,
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "not_configured"
    assert payload["rows"] == []
    assert "QDRANT_URL" in payload["message"]


def test_rag_law_sources_work_without_qdrant(web_client) -> None:
    response = web_client.post(
        "/api/rag/query",
        json={"question": "銀行法如何規範吸收存款？"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "retrieval_only"
    assert payload["answer_source"] == "retrieval"
    assert "銀行法" in payload["matched_terms"]
    assert payload["law_sources"][0]["law_name"] == "銀行法"
    assert payload["law_sources"][0]["source_label"] == "法規"
    assert payload["law_sources"][0]["article_count"] == 2
    assert any(
        article["article_no"] == "第 1 條"
        for article in payload["law_sources"][0]["articles"]
    )
    assert payload["judgments"] == []
    assert payload["retrieval"]["status"] == "not_configured"
    assert payload["coverage"]["total_judgments"] == 2
    assert payload["coverage"]["indexed_judgments"] == 0
    assert "法規資料庫" in payload["answer"]


def test_rag_law_article_count_and_order_metadata(web_client) -> None:
    law = web_client.post(
        "/api/rag/query",
        json={"question": "銀行法有多少條文？"},
    ).json()
    assert law["status"] == "operational"
    assert law["answer_source"] == "structured"
    assert law["law_sources"][0]["law_name"] == "銀行法"
    assert law["law_sources"][0]["source_label"] == "法規"
    assert law["law_sources"][0]["article_count"] == 2
    assert "2 條" in law["answer"]

    order = web_client.post(
        "/api/rag/query",
        json={"question": "銀行法施行細則有多少條文？"},
    ).json()
    assert order["status"] == "operational"
    assert order["law_sources"][0]["law_name"] == "銀行法施行細則"
    assert order["law_sources"][0]["source_label"] == "命令"
    assert order["law_sources"][0]["article_count"] == 1
    assert "1 條" in order["answer"]


def test_request_validation(web_client) -> None:
    response = web_client.post(
        "/api/query",
        json={"database": "postgres", "filters": {}, "page_size": 500},
    )
    assert response.status_code == 422

    rag = web_client.post("/api/rag/query", json={"question": ""})
    assert rag.status_code == 422


def test_settings_parse_cors_and_forwarded_ips(monkeypatch) -> None:
    monkeypatch.setenv(
        "CORS_ALLOW_ORIGINS",
        "https://app.example, https://preview.example ",
    )
    monkeypatch.setenv("FORWARDED_ALLOW_IPS", "127.0.0.1")

    settings = Settings.from_env()

    assert settings.cors_allow_origins == (
        "https://app.example",
        "https://preview.example",
    )
    assert settings.forwarded_allow_ips == "127.0.0.1"


def test_cors_allows_separately_hosted_frontend(web_client) -> None:
    origin = "https://judgment.pages.dev"

    simple = web_client.get("/api/health", headers={"Origin": origin})
    assert simple.status_code == 200
    assert simple.headers["access-control-allow-origin"] == "*"

    preflight = web_client.options(
        "/api/query",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == "*"
    assert "POST" in preflight.headers["access-control-allow-methods"]


def test_cors_honors_explicit_origin_configuration(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        cors_allow_origins=("https://allowed.example",),
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        allowed = client.get(
            "/api/health", headers={"Origin": "https://allowed.example"}
        )
        assert allowed.headers["access-control-allow-origin"] == "https://allowed.example"

        denied = client.get("/api/health", headers={"Origin": "https://other.example"})
        assert "access-control-allow-origin" not in denied.headers


def test_ollama_host_priority_reorder_api(web_client) -> None:
    first = web_client.post(
        "/api/ollama/hosts",
        json={"name": "First", "url": "http://first.test", "port": 11434},
    )
    second = web_client.post(
        "/api/ollama/hosts",
        json={"name": "Second", "url": "http://second.test", "port": 11434},
    )
    assert first.status_code == 200
    assert second.status_code == 200
    first_id = first.json()["id"]
    second_id = second.json()["id"]

    response = web_client.post(
        "/api/ollama/hosts/reorder",
        json={"host_ids": [second_id, first_id]},
    )
    assert response.status_code == 200
    assert response.json()["host_ids"] == [second_id, first_id]
    assert response.json()["active_host_id"] == second_id

    with web_client.app.state.session_factory() as session:
        rows = list(
            session.scalars(
                select(OllamaHost).order_by(
                    OllamaHost.priority.asc(), OllamaHost.id.asc()
                )
            ).all()
        )
        assert [row.id for row in rows] == [second_id, first_id]
        assert rows[0].is_active is True
        assert rows[1].is_active is False

    invalid = web_client.post(
        "/api/ollama/hosts/reorder",
        json={"host_ids": [first_id, first_id]},
    )
    assert invalid.status_code == 422


def test_llm_model_select_persists_env_provider_preference(
    web_client, monkeypatch
) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
    monkeypatch.setattr(
        app_module,
        "model_capability_status",
        lambda session_factory, settings: {
            "base_url": "http://env-llm:11434",
            "chat_models": ["gemma3:27b"],
        },
    )
    response = web_client.post(
        "/api/llm/model", json={"model": "gemma3:27b"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["provider_name"] == "env-llm"
    with web_client.app.state.session_factory() as session:
        setting = session.get(AppSetting, "llm_model_preference")
        assert setting is not None
        assert setting.value["model"] == "gemma3:27b"
        assert setting.value["base_url"] == "http://env-llm:11434"

    rejected = web_client.post(
        "/api/llm/model", json={"model": "not-a-chat-model"}
    )
    assert rejected.status_code == 422


def test_console_assets_avoid_flicker_prone_effects() -> None:
    root = Path(__file__).resolve().parents[1]
    static_assets = root / "src" / "judgment" / "web" / "static" / "assets"
    source_css = (static_assets / "styles.css").read_text(encoding="utf-8")
    bundle_css = (root / "frontend" / "assets" / "styles.css").read_text(
        encoding="utf-8"
    )
    for css in (source_css, bundle_css):
        assert "backdrop-filter" not in css
        assert "background-attachment: fixed" not in css
        assert "animation: page-in" not in css
        assert "@keyframes page-in" not in css
        assert "@keyframes shimmer" not in css
        assert "bar-grow" not in css
        assert ".report-card.is-refreshing" not in css

    app_js = (static_assets / "js" / "app.js").read_text(encoding="utf-8")
    data_js = (static_assets / "js" / "pages" / "data.js").read_text(
        encoding="utf-8"
    )
    performance_js = (
        static_assets / "js" / "pages" / "performance.js"
    ).read_text(encoding="utf-8")
    bundle_js = (root / "frontend" / "assets" / "js" / "app.js").read_text(
        encoding="utf-8"
    )
    assert "loadingMarkup" not in app_js
    for script in (app_js, data_js, performance_js, bundle_js):
        assert "is-refreshing" not in script
        assert "is-quiet" not in script


def test_standalone_frontend_artifact_is_relative_and_bundled() -> None:
    frontend = Path(__file__).resolve().parents[1] / "frontend"
    index = (frontend / "index.html").read_text(encoding="utf-8")
    assert '<script src="./config.js"></script>' in index
    assert '<script src="./assets/js/app.js"></script>' in index
    assert '<script type="module"' not in index
    assert 'href="/assets/' not in index
    assert 'src="/assets/' not in index
    assert 'data-route="quality"' in index

    config = (frontend / "config.js").read_text(encoding="utf-8")
    assert "window.JUDGMENT_CONFIG" in config
    assert "apiBase:" in config

    bundle = frontend / "assets" / "js" / "app.js"
    assert bundle.is_file()
    assert bundle.stat().st_size > 10_000
    assert (frontend / "assets" / "styles.css").is_file()
    assert (frontend / "assets" / "themes.css").is_file()
    assert (frontend / "favicon.svg").is_file()
    assert (frontend / "_headers").is_file()


def test_schema_suggestions_are_fuzzy(web_client) -> None:
    response = web_client.get(
        "/api/schema/suggest",
        params={
            "database": "postgres",
            "table": "law_documents",
            "column": "law_name",
            "q": "銀行施行",
            "limit": 1000,
        },
    )
    assert response.status_code == 200
    values = response.json()["values"]
    assert "銀行法施行細則" in values


def test_judgment_download_file_proxy(web_client, monkeypatch) -> None:
    import importlib

    web_app = importlib.import_module("judgment.web.app")
    web_client.app.state.settings = replace(
        web_client.app.state.settings,
        judgment_download_allow_off_hours=False,
    )

    monkeypatch.setattr(web_app, "ensure_window", lambda: None)
    monkeypatch.setattr(
        web_app,
        "file_response_headers",
        lambda settings, fileset_id: {
            "Content-Disposition": "attachment; filename=test.rar"
        },
    )
    monkeypatch.setattr(
        web_app,
        "iter_fileset",
        lambda settings, fileset_id: iter([b"hello"]),
    )
    response = web_client.get("/api/judgment-download/files/72011")
    assert response.status_code == 200
    assert response.content == b"hello"
    assert "attachment" in response.headers["content-disposition"]

    monkeypatch.setattr(
        web_app,
        "ensure_window",
        lambda: (_ for _ in ()).throw(
            web_app.DownloadWindowClosed("時段未開放")
        ),
    )
    blocked = web_client.get("/api/judgment-download/files/72011")
    assert blocked.status_code == 403


def test_judgment_download_file_proxy_allows_off_hours(
    web_client, monkeypatch
) -> None:
    import importlib

    web_app = importlib.import_module("judgment.web.app")
    web_client.app.state.settings = replace(
        web_client.app.state.settings,
        judgment_download_allow_off_hours=True,
    )
    monkeypatch.setattr(
        web_app,
        "ensure_window",
        lambda: (_ for _ in ()).throw(
            web_app.DownloadWindowClosed("時段未開放")
        ),
    )
    monkeypatch.setattr(
        web_app,
        "file_response_headers",
        lambda settings, fileset_id: {
            "Content-Disposition": "attachment; filename=test.rar"
        },
    )
    monkeypatch.setattr(
        web_app,
        "iter_fileset",
        lambda settings, fileset_id: iter([b"hello"]),
    )

    response = web_client.get("/api/judgment-download/files/72011")
    assert response.status_code == 200
    assert response.content == b"hello"


def test_judgment_download_file_proxy_allows_one_at_a_time(
    web_client, monkeypatch
) -> None:
    import importlib

    web_app = importlib.import_module("judgment.web.app")
    monkeypatch.setattr(
        web_app,
        "file_response_headers",
        lambda settings, fileset_id: {},
    )
    monkeypatch.setattr(
        web_app,
        "iter_fileset",
        lambda settings, fileset_id: iter([b"hello"]),
    )
    assert web_app._JUDGMENT_DOWNLOAD_LOCK.acquire(blocking=False)
    try:
        response = web_client.get("/api/judgment-download/files/72011")
        assert response.status_code == 409
        assert "一次只下載一個" in response.json()["detail"]
    finally:
        web_app._JUDGMENT_DOWNLOAD_LOCK.release()


def test_data_fuzzy_suggestions_and_multi_keyword_query(web_client) -> None:
    law_suggestions = web_client.get(
        "/api/data/suggest",
        params={"kind": "law", "query": "銀行"},
    )
    assert law_suggestions.status_code == 200
    law_values = [
        item["value"] for item in law_suggestions.json()["suggestions"]
    ]
    assert "銀行法" in law_values

    judgment_suggestions = web_client.get(
        "/api/data/suggest",
        params={"kind": "judgment", "query": "臺北"},
    )
    assert judgment_suggestions.status_code == 200
    assert any(
        item["type"] == "court"
        for item in judgment_suggestions.json()["suggestions"]
    )

    law_query = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "law_documents",
                "keywords": ["銀行", "金融法規"],
            },
            "page": 1,
            "page_size": 10,
        },
    )
    assert law_query.status_code == 200
    assert law_query.json()["total"] == 2

    judgment_query = web_client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {
                "table": "judgment_documents",
                "keywords": ["臺北", "返還借款"],
            },
            "page": 1,
            "page_size": 10,
        },
    )
    assert judgment_query.status_code == 200
    assert judgment_query.json()["total"] == 1
