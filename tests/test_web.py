from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse

import pyarrow as pa
import pyarrow.parquet as pq
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from starlette.requests import Request
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
from judgment.web import processing as processing_module
from judgment.web.app import create_app, route_policy_guard
from judgment.web.auth import make_session_token
from judgment.web.principal import anonymous_principal
from judgment.web.route_policy import (
    VALID_CATEGORIES,
    load_route_policies,
    policy_for,
    registered_route_keys,
    validate_route_policies,
)


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
        allow_local_admin_bypass=True,
        ollama_allowed_hosts=(
            "127.0.0.1:11434",
            "first.test:11434",
            "second.test:11434",
        ),
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
    assert 'id="settings-trigger"' in page.text
    assert 'aria-label="設定選項"' in page.text
    assert 'id="settings-sidebar"' in page.text
    assert 'id="settings-panel"' in page.text
    assert 'id="auth-slot"' in page.text
    assert "judgment.appearance" in page.text
    assert 'id="style-trigger"' not in page.text
    assert 'id="style-menu"' not in page.text
    assert 'class="style-picker"' not in page.text
    assert 'id="system-test-trigger"' not in page.text
    assert 'data-route="tests"' not in page.text
    assert 'href="#/tests"' not in page.text
    assert 'id="header-status"' not in page.text
    assert 'data-route="home"' not in page.text
    assert '<a class="brand" href="#/home"' in page.text
    assert "MIT License" in page.text
    assert "© 2026 Judgment RAG Console" in page.text
    assert 'data-route="performance"' in page.text
    assert 'data-route="quality"' in page.text

    home_js = web_client.get("/assets/js/pages/home.js")
    assert home_js.status_code == 200
    assert "home-ask-form" in home_js.text
    assert "home-judgment-stats" in home_js.text
    assert "judgmentStatsCardsMarkup" in home_js.text
    assert "homeSummary" in home_js.text
    assert "home-live-card" in home_js.text
    assert "home-rag-values" in home_js.text
    assert "home-laws-grid" in home_js.text
    assert "home-waterfall-slot" in home_js.text
    assert "subscribeRefresh" in home_js.text
    assert "HOME_REFRESH_MIN_INTERVAL" in home_js.text
    assert "scheduleLiveRefresh" in home_js.text
    stats_js = web_client.get("/assets/js/judgment-stats.js")
    assert stats_js.status_code == 200
    assert "判決總件數" in stats_js.text
    assert "金融相關總件數" in stats_js.text
    assert "JUDGMENT COVERAGE · 金融案件佔比" in stats_js.text
    assert "data-judgment-stat" in stats_js.text
    data_js = web_client.get("/assets/js/pages/data.js")
    assert data_js.status_code == 200
    assert "data-judgment-stats" in data_js.text
    assert "judgmentStatsCardsMarkup" in data_js.text
    processing_js = web_client.get("/assets/js/pages/processing.js")
    assert processing_js.status_code == 200
    assert "judgmentStatsCardsMarkup" in processing_js.text
    assert "全部案件" in processing_js.text
    assert "金融佔比" in processing_js.text
    assert "index-month-are" in processing_js.text
    assert "index-month-are-key" in processing_js.text
    assert "index-month-are-summary" in processing_js.text
    assert "R／E 階段圖例" in processing_js.text
    assert "目前索引月份（實線）" in processing_js.text
    assert "indexMonthAreBlock" in processing_js.text
    assert "archiveUpdateRank" in processing_js.text
    assert "latestProcessed" in processing_js.text
    assert "baselineProcessed" in processing_js.text
    assert "active_archive_coverage" in processing_js.text
    assert "is-complete" in processing_js.text
    assert "is-incomplete" in processing_js.text
    assert "is-empty" in processing_js.text
    assert "coverage_only" in processing_js.text
    assert "lawIndexTimelinesMarkup" in processing_js.text
    assert "lawIndexTimelinesMarkup(workflow.index_timelines" in processing_js.text
    assert "下載時間表" in processing_js.text
    assert "law-index-timeline-card" in processing_js.text
    assert "pending_count" in processing_js.text
    assert "update_mechanism" in processing_js.text
    assert "processing-update-action" in processing_js.text
    assert "data-processing-update-notice" in processing_js.text
    assert "judgment:processing-pending" in processing_js.text
    assert "index_pending_months" in processing_js.text
    assert "index_pending:" in processing_js.text
    assert "立即執行" in processing_js.text
    assert "processing-download-active" in processing_js.text
    assert "data-judgment-downloads-list" in processing_js.text
    assert "stopRequested" in processing_js.text
    assert "import_stage_progress" in processing_js.text
    assert "processing-run-strip" in processing_js.text
    assert "中止執行" in processing_js.text
    assert "index-wf-chart" in processing_js.text
    assert "index-wf-stage" in processing_js.text
    assert "data-index-stage" in processing_js.text
    assert "index-wf-bar is-hollow" in processing_js.text
    assert "minBarPercent" in processing_js.text
    assert "rag-wf-axis" in processing_js.text
    assert "workflow-wf-card" in processing_js.text
    assert "workflow-wf-stage" in processing_js.text
    assert "data-workflow-wf-stage" in processing_js.text
    assert "workflow-wf-bar is-hollow" in processing_js.text
    assert "workflow-wf-legend" in processing_js.text
    assert "workflow-wf-metrics" in processing_js.text
    assert "WORKFLOW_WF_OPEN_STAGES" in processing_js.text
    assert "index-wf-row" not in processing_js.text
    assert "index-runtime-metrics" in processing_js.text
    assert "index-runtime-metric" in processing_js.text
    assert "index-runtime-head" in processing_js.text
    assert "已處理月份" in processing_js.text
    assert "Elapsed Time" in processing_js.text
    assert "Estimated Total" in processing_js.text
    assert "Time Remaining" in processing_js.text
    assert "停止後重新執行會重新計時" in processing_js.text
    assert "目前索引月份" in processing_js.text
    assert "padding 不使用狀態底色" in processing_js.text
    assert "processingTimelineMetricsMarkup" in processing_js.text
    assert "FILE_TIMELINE_STAGE_PROGRESS_KEYS" in processing_js.text
    assert "processingTimelineProgressContext" in processing_js.text
    assert "processing-timeline-legend" in processing_js.text
    assert "index-month-block" in processing_js.text
    assert "indexCurrentPhaseMarkup" in processing_js.text
    assert "index-current-phase" in processing_js.text
    assert "rag-model-buttons" in processing_js.text
    assert "index-host-strip" not in processing_js.text
    assert "scan_order" in processing_js.text
    assert "掃描順序" in processing_js.text
    assert "E 無 E backlog" in processing_js.text
    assert "本次 run " in processing_js.text
    assert "目前批次" in processing_js.text
    assert "本批 R／E" in processing_js.text
    assert "R 一律使用本次 run 的 processed／total" in processing_js.text
    assert "R 完成：本次 run 已處理完成的月份數" in processing_js.text
    assert "R 未完成：本次 run 尚未完成 R 的月份數" in processing_js.text
    assert "全域 points；不列入月份 R／E" in processing_js.text
    assert "04 逐月掃描沿用；03 複製為全域 points" in processing_js.text
    assert "03 複製可重用向量是全域 points 準備階段" in processing_js.text
    assert "index-wf-phase" in processing_js.text
    assert "phaseLabel" in processing_js.text
    assert "03 複製（全域）" in processing_js.text
    assert "R · 本次沿用既有向量" in processing_js.text
    assert "A 已覆蓋月份" not in processing_js.text
    assert "A 既有版本" not in processing_js.text
    assert "04 金融判決向量索引 · 月份 R／E" in processing_js.text
    assert "index-wf-are-legend" in processing_js.text
    assert "index-wf-are-breakdown" in processing_js.text
    assert "R／E 分流" in processing_js.text
    assert "R 本次沿用" in processing_js.text
    assert "E 本次新 embedding" in processing_js.text
    assert "R 藍／E 紫" in processing_js.text
    assert "barColor" in processing_js.text
    assert "月份（舊→新）" in processing_js.text
    assert "等待版本準備（複製可重用向量）完成" in processing_js.text
    assert "第一批開始前不標示目前月份" in processing_js.text
    assert "預估剩餘" in processing_js.text
    assert "indexScanOrderHint" in processing_js.text
    assert "依匯入 ID" in processing_js.text
    assert "由舊到新" in processing_js.text
    assert "normalizeModelLabel" in processing_js.text
    assert "R 完成月份" in processing_js.text
    assert "R 未完成月份" in processing_js.text
    assert "E 完成月份" in processing_js.text
    assert "latestActiveComplete" in processing_js.text
    assert "processing-month-stage" in processing_js.text
    assert "is-download" in processing_js.text
    assert "is-parquet" in processing_js.text
    assert "is-postgres" in processing_js.text
    assert "is-qdrant" in processing_js.text
    assert "is-prepared" in processing_js.text
    assert "is-indexed" in processing_js.text
    assert "lawIndexTimelineMetricsMarkup" in processing_js.text
    assert "已取代月份" in processing_js.text
    assert "is-running" in processing_js.text
    assert "is-complete" in processing_js.text
    assert "is-pending" in processing_js.text
    assert "待更新（淺色）" in processing_js.text
    assert "archive-level percent from the processing snapshot" in processing_js.text
    assert "is-current-frame" in processing_js.text
    assert "is-processing-frame" in processing_js.text
    assert "is-partial" in processing_js.text
    assert "is-partial-state" in processing_js.text
    assert "patchProcessingTimelines" in processing_js.text
    assert "active_coverage" in processing_js.text
    assert "--stage-progress" in processing_js.text
    assert 'style="--stage-progress:' in processing_js.text
    assert "完成月份" in processing_js.text
    assert "完成率" in processing_js.text
    assert "完成階段" in processing_js.text
    assert "importTimelineMetricsMarkup" in processing_js.text
    assert 'variant: "import"' in processing_js.text
    assert "is-raw-parquet" in processing_js.text
    assert "is-extract" in processing_js.text
    status_js = web_client.get("/assets/js/pages/status.js")
    assert status_js.status_code == 200
    assert "statusPipelineMarkup" in status_js.text
    assert "buildStatusPagePipeline" in status_js.text
    assert "data-status-pipeline" in status_js.text
    assert "STATUS_WF_OPEN_STAGES" in status_js.text
    assert "服務總覽載入 Pipeline" in status_js.text
    assert "renderArchitectureFlowSvg" in status_js.text
    assert "arch-diagram-svg" in status_js.text
    assert "流程方向示意圖" in status_js.text
    assert "arch-diagram-legend" in status_js.text
    assert "data-version-hero" in status_js.text
    assert "data-version-ring" in status_js.text
    assert "dataVersionCoverage" in status_js.text
    assert "data-version-facts" in status_js.text
    assert "Qdrant 判決向量索引" in status_js.text
    assert "Qdrant 法規／命令向量索引" in status_js.text
    assert "IndexedDB 本機資料" in status_js.text
    assert "PostgreSQL 資料版本" in status_js.text
    assert "indexedDbStats" in status_js.text
    assert "API_ENDPOINT_GROUPS" in status_js.text
    assert "renderApiEndpointGroups" in status_js.text
    assert "api-endpoint-groups" in status_js.text
    assert "apiEndpointGroup" in status_js.text
    store_js = web_client.get("/assets/js/store.js")
    assert store_js.status_code == 200
    assert "indexedDbStats" in store_js.text
    assert "audit_events" in store_js.text
    tests_js = web_client.get("/assets/js/pages/tests.js")
    assert tests_js.status_code == 200
    assert "tests-rerank" in tests_js.text
    assert "Reranker 服務測試" in tests_js.text
    assert "tests-admin-token-input" in tests_js.text
    assert "getAdminToken" in tests_js.text
    assert "setAdminToken" in tests_js.text
    api_js = web_client.get("/assets/js/api.js")
    assert api_js.status_code == 200
    assert "X-Judgment-Admin-Token" in api_js.text
    assert "/api/auth/sse-ticket" in api_js.text
    assert "adminTokenForRequest" in api_js.text
    assert "authMe" in api_js.text
    assert "getAuthApiBase" in api_js.text
    stream_fetch = api_js.text.split(
        'apiUrl("/api/rag/query/stream"', 1
    )[1].split("});", 1)[0]
    assert 'credentials: "include"' in stream_fetch
    auth_js = web_client.get("/assets/js/auth.js")
    assert auth_js.status_code == 200
    assert "google_enabled" in auth_js.text
    assert "auth-slot" in auth_js.text
    performance_js = web_client.get("/assets/js/pages/performance.js")
    assert performance_js.status_code == 200
    assert "判決向量索引 Pipeline" in performance_js.text
    assert "renderIndexPipelinePanel" in performance_js.text
    app_js = web_client.get("/assets/js/app.js")
    assert app_js.status_code == 200
    assert 'DEFAULT_ROUTE = "home"' in app_js.text
    assert "judgment:processing-pending" in app_js.text
    assert "index_pending_count" in app_js.text
    assert "Qdrant 向量索引待補" in app_js.text

    css = web_client.get("/assets/styles.css")
    assert css.status_code == 200
    assert "--accent" in css.text
    assert ".index-month-are.is-active" in css.text
    assert ".index-month-block.is-active" not in css.text
    assert "--block-color: #f97316" not in css.text
    assert ".index-month-are-key i.is-current" in css.text
    assert ".index-current-phase.is-reuse" in css.text
    assert ".index-current-phase.is-embed" in css.text
    assert ".index-wf-bar.is-hollow" in css.text
    assert ".index-wf-are-legend i.is-active" not in css.text
    assert ".index-wf-are-breakdown" in css.text
    assert ".index-wf-are-row.is-reuse" in css.text
    assert ".index-wf-are-row.is-embed" in css.text
    assert ".workflow-wf-card" in css.text
    assert ".workflow-wf-bar.is-hollow" in css.text
    assert ".workflow-wf-card .rag-wf-stage-head" in css.text
    assert "border: 1px solid var(--bar-color, var(--stage-color))" in css.text
    assert ".processing-month-stage.is-download" in css.text
    assert ".processing-month-stage.is-prepared" in css.text
    assert ".processing-month-stage.is-extract" in css.text
    assert ".processing-month-stage.is-raw_parquet" in css.text
    assert ".processing-month-stage.is-filter" in css.text
    assert (
        ".processing-month.index-month .processing-month-stage.is-pending"
        in css.text
    )
    assert (
        ".processing-month.import-month .processing-month-stage.is-pending"
        in css.text
    )
    assert (
        ".processing-month.import-month .processing-month-stage.is-running"
        in css.text
    )
    assert ".processing-timeline-swatch.is-pending-state" in css.text
    assert (
        ".workflow-wf-stage.is-pending .rag-wf-track" in css.text
    )
    assert "var(--stage-color) 25%, transparent" in css.text
    assert "var(--block-color) var(--stage-progress, 0%)" in css.text
    assert "color-mix(in srgb, var(--block-color) 25%, transparent)" in css.text
    assert (
        "var(--block-color, var(--line-strong)) 25%"
        in css.text
    )
    assert (
        "var(--bar-color, var(--stage-color)) 25%"
        in css.text
    )
    assert "var(--ink) 25%, transparent" in css.text
    assert ".processing-timeline-swatch.is-current-frame" in css.text
    assert ".processing-timeline-swatch.is-processing-frame" in css.text
    assert ".processing-month.is-processing-current:not(.is-current)" in css.text
    assert "outline: 2px dashed var(--info)" in css.text
    assert "judgment-month-pulse" not in css.text
    assert ".judgment-month.is-green" in css.text
    assert "background: #76b900" in css.text
    assert "background: #d32f2f" in css.text
    assert "background: #dfe3e8" in css.text
    assert "--month-progress" in css.text
    assert ".judgment-month.is-downloading" in css.text
    assert "border-color: #000000" in css.text
    assert "background-color: var(--bg)" in css.text
    assert ".processing-timeline-swatch.is-raw-parquet" in css.text
    assert ".home-hero" in css.text
    assert ".home-rag-flow" in css.text
    assert ".home-laws-grid" in css.text
    assert "repeat(var(--home-law-columns, 11)" in css.text
    assert ".home-wf-card" in css.text
    assert ".home-wf-slow" in css.text
    assert ".status-wf-card" in css.text
    assert ".status-wf-stage.is-error" in css.text
    assert ".workflow-wf-legend i.is-failed-state" in css.text
    assert ".arch-diagram-svg" in css.text
    assert ".arch-diagram-flow" in css.text
    assert ".arch-node-detail" in css.text
    assert ".data-version-hero" in css.text
    assert ".data-version-ring" in css.text
    assert ".data-version-coverage" in css.text
    assert ".data-version-facts" in css.text
    assert ".api-endpoint-groups" in css.text
    assert ".endpoint-method.is-get" in css.text
    assert ".api-endpoint-actions" in css.text
    assert ".processing-month-stage.is-indexed" in css.text
    assert ".processing-month.index-month .processing-month-stage.is-running" in css.text
    assert ".processing-month-stage.is-partial" in css.text
    assert ".processing-timeline-swatch.is-partial-state" in css.text
    assert ".processing-timeline-swatch.is-prepared" in css.text
    assert ".processing-timeline-swatch.is-indexed" in css.text
    assert ".processing-timeline-legend" in css.text

    themes = web_client.get("/assets/themes.css")
    assert themes.status_code == 200
    assert 'data-theme="linear"' in themes.text

    theme_script = web_client.get("/assets/js/themes.js")
    assert theme_script.status_code == 200
    assert 'DEFAULT_THEME = "nvidia"' in theme_script.text
    assert "initThemePicker" not in theme_script.text
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
    assert services["legal_index"]["status"] == "degraded"
    assert services["embedding"]["status"] == "not_configured"
    assert services["reranker"]["status"] == "not_configured"
    assert services["llm"]["status"] == "not_configured"
    assert services["rag"]["status"] == "not_configured"
    assert payload["data"]["judgment_indexed_count"] == 0
    assert payload["data"]["judgment_index_pending"] == 2
    assert payload["data"]["judgment_vector_collection"] == "judgment_documents"
    assert payload["data"]["legal_index"]["status"] == "not_indexed"
    assert payload["data"]["law_count"] == 2
    assert payload["data"]["order_count"] == 1
    assert payload["data"]["article_count"] == 5
    assert [row["kind"] for row in payload["model_summary"]] == [
        "chat",
        "embedding",
        "rerank",
    ]
    assert all(row["active"] is None for row in payload["model_summary"])
    assert payload["recent_runs"][0]["status"] == "success"
    assert [layer["id"] for layer in payload["architecture"]["layers"]] == [
        "client",
        "api",
        "pipeline",
        "data",
    ]
    client_nodes = payload["architecture"]["layers"][0]["nodes"]
    assert isinstance(client_nodes[0], dict)
    assert "RAG Console SPA" in client_nodes[0]["label"]
    endpoints = {
        (item["method"], item["path"]): item for item in payload["endpoints"]
    }
    assert len(endpoints) >= 80
    for key in [
        ("GET", "/api/status"),
        ("GET", "/api/events/stream"),
        ("POST", "/api/processing/workflows/{workflow_id}/run"),
        ("GET", "/api/processing/events/status"),
        ("GET", "/api/versioning/audit"),
        ("POST", "/api/benchmark/runs"),
        ("GET", "/api/question-bank/items"),
        ("POST", "/api/rag/query/stream"),
        ("GET", "/api/docs"),
        ("GET", "/api/openapi.json"),
    ]:
        assert key in endpoints
    assert ("GET", "/api/llama-server/hosts") in endpoints
    assert ("GET", "/api/ollama/hosts") not in endpoints
    assert all(method not in {"HEAD", "OPTIONS"} for method, _ in endpoints)
    pipeline = payload["pipeline"]
    pipeline_stages = pipeline["stages"]
    by_key = {stage["key"]: stage for stage in pipeline_stages}
    assert [stage["key"] for stage in pipeline_stages[:11]] == [
        "postgres",
        "parquet",
        "version",
        "qdrant",
        "embedding",
        "llm",
        "reranker",
        "rag",
        "coverage",
        "staleness",
        "legal_index",
    ]
    assert by_key["postgres"]["status"] == "success"
    assert by_key["parquet"]["status"] == "success"
    assert by_key["qdrant"]["status"] == "skipped"
    assert by_key["embedding"]["status"] == "skipped"
    assert by_key["llm"]["status"] == "skipped"
    assert by_key["coverage"]["status"] == "success"
    assert by_key["staleness"]["status"] == "success"
    assert pipeline["total_ms"] >= 0
    assert sum(stage["duration_ms"] for stage in pipeline_stages) == pipeline[
        "total_ms"
    ]


def test_status_model_summary_labels_host_and_model(tmp_path: Path) -> None:
    from judgment.web.status import _model_summary

    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path,
        law_api_url="",
        order_api_url="",
        embedding_url="http://x570:11437",
        embedding_fallback_url="http://127.0.0.1:11437",
        llm_url="http://x570:11436",
        llm_fallback_url="http://127.0.0.1:11436",
        llm_model="gemma3:4b",
        llm_fallback_model="gemma3:4b",
        rerank_url="http://x570:11435",
        rerank_fallback_url="http://127.0.0.1:11435",
        rerank_model="bge-reranker-v2-m3",
    )
    summary = _model_summary(
        settings,
        embedding={
            "status": "operational",
            "active_role": "primary",
            "active_url": settings.embedding_url,
            "active_model": "bge-m3",
        },
        llm={
            "status": "operational",
            "active_role": "primary",
            "active_url": settings.llm_url,
            "active_model": "gemma3:4b",
        },
        rerank={
            "status": "operational",
            "active": {
                "role": "primary",
                "url": settings.rerank_url,
                "model": settings.rerank_model,
                "status": "operational",
            },
            "providers": [
                {
                    "name": "x570",
                    "role": "primary",
                    "url": settings.rerank_url,
                    "model": settings.rerank_model,
                    "status": "operational",
                },
                {
                    "name": "local",
                    "role": "fallback",
                    "url": settings.rerank_fallback_url,
                    "model": settings.rerank_model,
                    "status": "operational",
                },
            ],
        },
    )
    rows = {row["kind"]: row for row in summary}
    assert rows["chat"]["active"]["label"] == "x570:gemma3:4b"
    assert rows["chat"]["fallback"]["label"] == "mbp:gemma3:4b"
    assert rows["embedding"]["active"]["label"] == "x570:bge-m3"
    assert rows["embedding"]["fallback"]["label"] == "mbp:bge-m3"
    assert rows["rerank"]["active"]["label"] == "x570:bge-reranker-v2-m3"
    assert rows["rerank"]["fallback"]["label"] == "mbp:bge-reranker-v2-m3"


def test_llm_final_result_reports_dropped_context_indexes(
    tmp_path: Path,
) -> None:
    from judgment.web.app import _llm_final_result

    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path,
        law_api_url="",
        order_api_url="",
        llm_url="http://x570:11436",
        llm_model="gemma3:4b",
    )
    state = {
        "retrieval": {},
        "citations": [{"index": 2, "jid": "J1", "snippet": "判決片段"}],
        "reference_judgments": [{"jid": "J2", "title": "參考判決"}],
        "law_sources": [
            {
                "index": 1,
                "law_name": "證券交易法",
                "source_label": "法規",
            }
        ],
        "terms": ["證券交易法"],
    }
    result = _llm_final_result(
        {},
        state,
        settings,
        "依證券交易法 [1]。",
        {"contexts_after": 1},
        {1},
        0.0,
    )
    prompt_context = result["retrieval"]["prompt_context"]
    assert prompt_context["used_indexes"] == [1]
    assert prompt_context["dropped_indexes"] == [2]
    assert result["law_sources"][0]["citation_status"] == "cited"
    assert result["judgments"][0]["citation_status"] == "reference_only"
    assert result["reference_judgments"][0]["jid"] == "J2"

    result = _llm_final_result(
        {},
        state,
        settings,
        "依證券交易法 [1]。",
        {"contexts_after": 2},
        {1, 2},
        0.0,
    )
    prompt_context = result["retrieval"]["prompt_context"]
    assert prompt_context["dropped_indexes"] == []
    assert result["judgments"][0]["citation_status"] == "provided_not_cited"


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
    assert payload["totals"]["matched_unique_jids"] == 2
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


def test_updates_status_includes_index_pending_months(
    web_client, monkeypatch
) -> None:
    coverage = {
        "available": True,
        "coverage_only": True,
        "run_status": "partial",
        "months": [
            {
                "month": "202601",
                "archive": "202601--(20261116Update).rar",
                "total": 10,
                "processed": 4,
                "status": "pending",
            },
            {
                "month": "202602",
                "archive": "202602--(20261116Update).rar",
                "total": 8,
                "processed": 8,
                "status": "success",
            },
        ],
    }
    monkeypatch.setattr(
        processing_module,
        "_index_month_coverage_runtime",
        lambda *args, **kwargs: coverage,
    )
    processing_module.build_processing_snapshot(
        settings=web_client.app.state.settings,
        session_factory=web_client.app.state.session_factory,
    )

    status = web_client.get("/api/updates/status")
    assert status.status_code == 200
    body = status.json()
    assert body["index_pending_count"] == 1


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
    payload = response.json()
    assert payload["judgment_stats"] == {
        "judgment_total": 2,
        "financial_total": 2,
        "financial_ratio": 100.0,
    }
    categories = {item["id"]: item for item in payload["categories"]}
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


def test_judgment_stats_returns_total_financial_and_ratio(web_client) -> None:
    response = web_client.get("/api/judgment-stats")
    assert response.status_code == 200
    payload = response.json()

    assert payload["judgment_total"] == 2
    assert payload["financial_total"] == 2
    assert payload["financial_ratio"] == 100.0
    assert payload["available"] is True
    assert payload["error"] == ""


def test_home_summary_returns_live_metrics_and_pipeline(web_client) -> None:
    response = web_client.get("/api/home")
    assert response.status_code == 200
    payload = response.json()

    assert payload["status"] == "operational"
    data = payload["data"]
    assert data["laws"]["law_count"] == 2
    assert data["laws"]["order_count"] == 1
    assert data["laws"]["article_count"] == 5
    assert data["laws"]["version_count"] == 1
    assert data["laws"]["run_count"] == 1

    judgments = data["judgments"]
    assert judgments["financial_total"] == 2
    assert judgments["raw_total"] == 2
    assert judgments["financial_ratio"] == 100.0
    assert judgments["date_min"] == "20260110"
    assert judgments["date_max"] == "20260112"
    assert judgments["year_min"] == 2026
    assert judgments["year_max"] == 2026
    assert judgments["year_span"] == 1

    index = data["rag"]["judgment_index"]
    assert index["indexed"] == 0
    assert index["total"] == 2
    assert index["coverage_pct"] == 0.0
    assert index["alias"] == "judgments_current"
    assert data["rag"]["legal_index"]["current_article_count"] == 5
    assert data["rag"]["models"]["embedding"]

    laws = data["financial_laws"]
    assert laws["count"] == 99
    assert laws["laws"][0] == "民法"
    assert laws["source_path"] == "documents/金融法規.md"
    assert laws["source_sha256"]
    assert laws["content"].startswith("民法\n")

    assert data["sources"]["opendata"]["url"] == "https://opendata.judicial.gov.tw/"
    assert data["sources"]["laws"]["url"] == "https://law.moj.gov.tw/"

    pipeline = payload["pipeline"]
    assert pipeline["label"] == "首頁即時摘要載入"
    assert pipeline["total_ms"] >= 0
    stage_keys = [stage["key"] for stage in pipeline["stages"]]
    for key in (
        "laws",
        "judgments",
        "raw",
        "judgment_index",
        "legal_index",
        "financial_laws",
    ):
        assert key in stage_keys
    assert all(stage["duration_ms"] >= 0 for stage in pipeline["stages"])


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


def test_performance_exposes_judgment_index_pipeline(web_client) -> None:
    pipeline = {
        "version_id": 3,
        "collection": "judgments_v003",
        "alias": "judgments_current",
        "build_mode": "reuse",
        "resumed": False,
        "resumed_indexed": 0,
        "host": {
            "host": "x570",
            "port": 11434,
            "model": "bge-m3:latest",
        },
        "model": "bge-m3:latest",
        "total_ms": 12_345,
        "stages": [
            {
                "key": "probe",
                "label": "測試 embedding 主機",
                "duration_ms": 1_200,
                "status": "success",
                "detail": "1 台主機 · x570:11434 · bge-m3:latest",
            },
            {
                "key": "embedding",
                "label": "差異 embedding",
                "duration_ms": 8_000,
                "status": "success",
                "detail": "新 embedding 100 筆",
            },
            {
                "key": "activate",
                "label": "原子切換 alias",
                "duration_ms": 300,
                "status": "success",
                "detail": "alias judgments_current → v003",
            },
        ],
    }
    record_performance(
        web_client.app.state.session_factory,
        process="判決向量索引版本",
        module="judgment.judgment_index.build_index_version",
        status="success",
        duration_ms=12_345,
        params={"model": "bge-m3:latest", "build_mode": "reuse"},
        details={
            "indexed_count": 100,
            "scanned_count": 100,
            "pipeline": pipeline,
        },
    )

    payload = web_client.get(
        "/api/performance",
        params={"process": "判決向量索引版本", "page_size": 10},
    ).json()

    assert payload["index_stats"]["latest"]["pipeline"] == pipeline
    assert payload["index_pipeline"]["latest"]["pipeline"] == pipeline
    assert payload["index_pipeline"]["latest"]["model"] == "bge-m3:latest"
    assert payload["index_pipeline"]["latest"]["build_mode"] == "reuse"
    assert payload["index_pipeline"]["latest"]["version_id"] == 3


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
    live_settings = replace(
        web_client.app.state.settings,
        llm_url="http://llm.test",
        llm_api="openai",
        llm_model="test-model",
        llm_fallback_url="",
    )

    def fake_answer_question(
        *,
        session_factory,
        question,
        settings,
        on_partial=None,
        on_token=None,
        on_token_reset=None,
        return_retrieval_state=False,
    ):
        with trace_segment(
            "rag.fake_step",
            module="test.rag",
            function="fake_answer_question",
            params={"question_length": len(question)},
        ):
            pass
        citations = [
            {
                "index": 1,
                "jid": "TEST,114,訴,1,20260101,1",
                "court": "測試法院",
                "jdate": "20260101",
                "title": "測試案由",
                "snippet": "測試內容",
            }
        ]
        if on_partial:
            on_partial(
                {
                    "partial": True,
                    "streaming": False,
                    "status": "retrieving",
                    "answer": "法規結果先顯示",
                }
            )
        state = {
            "contexts": [{"index": 1, "text": "測試內容"}],
            "citations": citations,
            "law_sources": [],
            "terms": [],
            "law_answer": "",
            "law_framework": None,
            "citation_total": 1,
            "coverage": {},
            "retrieval": {},
        }
        return {
            "status": "retrieval_only",
            "answer": "檢索結果",
            "notice": "test",
            "citations": [],
            "judgments": citations,
            "law_sources": [],
            "matched_terms": [],
            "answer_source": "retrieval",
            "duration_ms": 1,
            "_retrieval_state": state,
        }

    async def fake_async_generate(**kwargs):
        on_token = kwargs.get("on_token")
        if on_token:
            on_token("測試")
            on_token("回答")
        return "測試回答 [1]"

    monkeypatch.setattr(app_module, "answer_question", fake_answer_question)
    monkeypatch.setattr(
        app_module,
        "generate_answer_with_model_async",
        fake_async_generate,
    )
    monkeypatch.setattr(
        app_module, "runtime_settings", lambda settings, sf: live_settings
    )
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
    assert "event: token" in body
    assert "法規結果先顯示" in body
    assert "測試回答 [1]" in body
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


def test_rerank_system_test_endpoints(web_client, monkeypatch) -> None:
    status = web_client.get("/api/rerank/status")
    assert status.status_code == 200
    payload = status.json()
    assert payload["status"] in {
        "not_configured",
        "operational",
        "degraded",
    }
    assert "providers" in payload

    app_module = sys.modules["judgment.web.app"]
    monkeypatch.setattr(
        app_module,
        "rerank_service_test",
        lambda settings: {
            "status": "operational",
            "enabled": True,
            "model": "bge-reranker-v2-m3",
            "providers": [],
            "active": None,
            "detail": "test",
        },
    )
    tested = web_client.post("/api/rerank/test")
    assert tested.status_code == 200
    assert tested.json()["status"] == "operational"


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


def test_cors_defaults_to_local_origins(web_client) -> None:
    local = "http://127.0.0.1:9200"

    simple = web_client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert simple.status_code == 200
    assert "access-control-allow-origin" not in simple.headers

    allowed = web_client.get("/api/health", headers={"Origin": local})
    assert allowed.headers["access-control-allow-origin"] == local

    file_origin = web_client.get("/api/health", headers={"Origin": "null"})
    assert "access-control-allow-origin" not in file_origin.headers

    preflight = web_client.options(
        "/api/query",
        headers={
            "Origin": local,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-judgment-admin-token",
        },
    )
    assert preflight.status_code == 200
    assert preflight.headers["access-control-allow-origin"] == local
    assert "POST" in preflight.headers["access-control-allow-methods"]
    assert "x-judgment-admin-token" in preflight.headers[
        "access-control-allow-headers"
    ].lower()


def test_trusted_host_rejects_dns_rebinding_host(web_client) -> None:
    response = web_client.get(
        "/api/status", headers={"Host": "evil.example"}
    )
    assert response.status_code == 400


def test_file_origin_cannot_modify_data(web_client) -> None:
    response = web_client.post(
        "/api/query",
        headers={"Origin": "null"},
        json={"database": "postgres", "filters": {}, "page_size": 10},
    )
    assert response.status_code == 403


def test_local_write_requires_trusted_origin_or_no_browser_headers(
    web_client,
) -> None:
    allowed = web_client.post(
        "/api/auth/sse-ticket",
        headers={
            "Origin": "http://127.0.0.1:9200",
            "Sec-Fetch-Site": "same-origin",
        },
    )
    assert allowed.status_code == 200

    no_browser_headers = web_client.post("/api/auth/sse-ticket")
    assert no_browser_headers.status_code == 200

    evil_origin = web_client.post(
        "/api/auth/sse-ticket",
        headers={"Origin": "https://evil.example"},
    )
    assert evil_origin.status_code == 403

    cross_site = web_client.post(
        "/api/auth/sse-ticket",
        headers={"Sec-Fetch-Site": "cross-site"},
    )
    assert cross_site.status_code == 403

    same_origin_without_origin = web_client.post(
        "/api/auth/sse-ticket",
        headers={"Sec-Fetch-Site": "same-origin"},
    )
    assert same_origin_without_origin.status_code == 200


def test_trusted_host_accepts_allowed_hosts_with_ports(web_client) -> None:
    for host in ("127.0.0.1:9200", "localhost:9200", "testserver"):
        response = web_client.get(
            "/api/health", headers={"Host": host}
        )
        assert response.status_code == 200, host

    settings = replace(
        web_client.app.state.settings,
        trusted_hosts=("api.example.test", "testserver"),
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        assert (
            client.get(
                "/api/health", headers={"Host": "api.example.test"}
            ).status_code
            == 200
        )
        assert (
            client.get(
                "/api/health", headers={"Host": "api.example.test:443"}
            ).status_code
            == 200
        )


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
        assert (
            allowed.headers["access-control-allow-credentials"] == "true"
        )

        denied = client.get("/api/health", headers={"Origin": "https://other.example"})
        assert "access-control-allow-origin" not in denied.headers


def test_cors_wildcard_is_ignored(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        cors_allow_origins=("*",),
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        response = client.get(
            "/api/health", headers={"Origin": "https://evil.example"}
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" not in response.headers


def test_remote_admin_api_requires_configured_token(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        admin_token="secret-token",
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    remote_client = ("203.0.113.9", 50000)
    with TestClient(app, client=remote_client) as remote:
        assert remote.get("/api/health").status_code == 200
        assert remote.get("/api/home").status_code == 403

        denied = remote.get("/api/question-bank/stats")
        assert denied.status_code in {401, 403}

        wrong = remote.get(
            "/api/question-bank/stats",
            headers={"X-Judgment-Admin-Token": "wrong"},
        )
        assert wrong.status_code in {401, 403}

        allowed = remote.get(
            "/api/question-bank/stats",
            headers={"X-Judgment-Admin-Token": "secret-token"},
        )
        assert allowed.status_code == 200

        ticket = remote.post(
            "/api/auth/sse-ticket",
            headers={"X-Judgment-Admin-Token": "secret-token"},
        )
        assert ticket.status_code == 200
        assert ticket.json()["ticket"]
        assert ticket.json()["expires_in"] > 0


def test_remote_admin_api_without_token_is_forbidden(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        admin_token="",
        cors_allow_origins=("https://app.example",),
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app, client=("203.0.113.9", 50000)) as remote:
        denied = remote.get(
            "/api/catalog",
            headers={"Origin": "https://app.example"},
        )
        assert denied.status_code == 403
        # Auth errors must still be readable by the browser.
        assert (
            denied.headers["access-control-allow-origin"]
            == "https://app.example"
        )
        assert denied.headers["access-control-allow-credentials"] == "true"


def _oauth_settings(web_client, **overrides):
    settings = replace(
        web_client.app.state.settings,
        google_oauth_client_id="test-client-id",
        google_oauth_client_secret="test-client-secret",
        google_oauth_redirect_uri="http://testserver/api/auth/google/callback",
        google_allowed_emails=("admin@example.com",),
        auth_session_secret="test-session-secret",
        admin_token="",
        cors_allow_origins=("https://app.example",),
    )
    return replace(settings, **overrides)


def _oauth_app(web_client, **overrides):
    return create_app(
        settings=_oauth_settings(web_client, **overrides),
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )


def test_google_login_disabled_reports_and_redirects(web_client) -> None:
    me = web_client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["authenticated"] is False
    assert me.json()["google_enabled"] is False

    start = web_client.get("/api/auth/google/start", follow_redirects=False)
    assert start.status_code == 302
    assert start.headers["location"].endswith("/?auth_error=google_not_configured")


def test_google_login_start_sets_state_and_google_url(web_client) -> None:
    with TestClient(_oauth_app(web_client)) as client:
        response = client.get(
            "/api/auth/google/start?next=/#/rag", follow_redirects=False
        )
        assert response.status_code == 302
        location = response.headers["location"]
        assert location.startswith("https://accounts.google.com/o/oauth2/v2/auth?")
        query = parse_qs(urlparse(location).query)
        assert query["client_id"] == ["test-client-id"]
        assert query["redirect_uri"] == [
            "http://testserver/api/auth/google/callback"
        ]
        assert query["scope"] == ["openid email profile"]
        assert query["state"][0]
        assert response.cookies.get("judgment_oauth_state")


def test_google_callback_rejects_state_mismatch(web_client) -> None:
    with TestClient(_oauth_app(web_client)) as client:
        start = client.get("/api/auth/google/start", follow_redirects=False)
        assert start.status_code == 302

        response = client.get(
            "/api/auth/google/callback?state=wrong&code=fake",
            follow_redirects=False,
        )
        assert response.status_code == 302
        assert response.headers["location"].endswith(
            "/?auth_error=state_mismatch"
        )


def test_google_callback_creates_session(web_client, monkeypatch) -> None:
    async def fake_exchange_google_code(**_kwargs):
        return {
            "sub": "google-sub-1",
            "email": "admin@example.com",
            "email_verified": True,
            "name": "Admin User",
            "picture": "",
        }

    monkeypatch.setattr(
        sys.modules["judgment.web.app"],
        "exchange_google_code",
        fake_exchange_google_code,
    )
    with TestClient(_oauth_app(web_client)) as client:
        start = client.get(
            "/api/auth/google/start?next=" + quote("/#/rag", safe=""),
            follow_redirects=False,
        )
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]

        callback = client.get(
            f"/api/auth/google/callback?state={state}&code=fake",
            follow_redirects=False,
        )
        assert callback.status_code == 302
        assert callback.headers["location"] == "/?auth=ok#/rag"
        assert client.cookies.get("judgment_session")

        me = client.get("/api/auth/me")
        assert me.status_code == 200
        assert me.json()["authenticated"] is True
        assert me.json()["email"] == "admin@example.com"
        assert me.json()["admin"] is True


def test_google_callback_allows_configured_frontend_next(
    web_client, monkeypatch
) -> None:
    async def fake_exchange_google_code(**_kwargs):
        return {
            "sub": "google-sub-next",
            "email": "admin@example.com",
            "email_verified": True,
            "name": "Admin User",
        }

    monkeypatch.setattr(
        sys.modules["judgment.web.app"],
        "exchange_google_code",
        fake_exchange_google_code,
    )
    with TestClient(_oauth_app(web_client)) as client:
        start = client.get(
            "/api/auth/google/start?next="
            + quote("https://app.example/#/rag", safe=""),
            follow_redirects=False,
        )
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
        callback = client.get(
            f"/api/auth/google/callback?state={state}&code=fake",
            follow_redirects=False,
        )
        assert callback.headers["location"] == "https://app.example/?auth=ok#/rag"


def test_google_callback_ignores_untrusted_next(web_client, monkeypatch) -> None:
    async def fake_exchange_google_code(**_kwargs):
        return {
            "sub": "google-sub-untrusted",
            "email": "admin@example.com",
            "email_verified": True,
            "name": "Admin User",
        }

    monkeypatch.setattr(
        sys.modules["judgment.web.app"],
        "exchange_google_code",
        fake_exchange_google_code,
    )
    with TestClient(_oauth_app(web_client)) as client:
        start = client.get(
            "/api/auth/google/start?next="
            + quote("https://evil.example/", safe=""),
            follow_redirects=False,
        )
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
        callback = client.get(
            f"/api/auth/google/callback?state={state}&code=fake",
            follow_redirects=False,
        )
        assert callback.headers["location"] == "/?auth=ok"


def test_google_callback_rejects_unlisted_email(web_client, monkeypatch) -> None:
    async def fake_exchange_google_code(**_kwargs):
        return {
            "sub": "google-sub-2",
            "email": "other@example.com",
            "email_verified": True,
            "name": "Other User",
        }

    monkeypatch.setattr(
        sys.modules["judgment.web.app"],
        "exchange_google_code",
        fake_exchange_google_code,
    )
    with TestClient(_oauth_app(web_client)) as client:
        start = client.get("/api/auth/google/start", follow_redirects=False)
        state = parse_qs(urlparse(start.headers["location"]).query)["state"][0]
        callback = client.get(
            f"/api/auth/google/callback?state={state}&code=fake",
            follow_redirects=False,
        )
        assert callback.status_code == 302
        assert callback.headers["location"].endswith("/?auth_error=not_allowed")
        assert not client.cookies.get("judgment_session")


def test_local_admin_bypass_is_opt_in_and_ignores_forwarded_requests(
    web_client,
) -> None:
    base = replace(
        web_client.app.state.settings,
        admin_token="local-secret",
        allow_local_admin_bypass=False,
    )
    app = create_app(
        settings=base,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as local:
        assert local.get("/api/question-bank/stats").status_code in {401, 403}

    enabled = replace(base, allow_local_admin_bypass=True)
    app = create_app(
        settings=enabled,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as local:
        assert local.get("/api/question-bank/stats").status_code == 200
        for headers in (
            {"X-Forwarded-For": "203.0.113.9"},
            {"CF-Connecting-IP": "203.0.113.9"},
            {"Forwarded": "for=203.0.113.9"},
            {"X-Real-IP": "203.0.113.9"},
        ):
            forwarded = local.get(
                "/api/question-bank/stats",
                headers=headers,
            )
            assert forwarded.status_code in {401, 403}, headers


def test_route_policy_enforces_public_and_admin_boundaries(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        admin_token="secret-token",
        allow_local_admin_bypass=False,
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        assert client.get("/api/health").status_code == 200
        # HEAD is normalized to the GET policy; FastAPI reports 405 for the
        # unsupported method instead of falling through to auth denial.
        assert client.head("/api/health").status_code == 405
        assert client.get("/api/home").status_code == 403
        assert client.get("/api/auth/me").status_code == 200
        assert client.post("/api/auth/logout").status_code == 200

        for method, path in (
            ("GET", "/api/status"),
            ("GET", "/api/processing"),
            ("POST", "/api/processing/stop"),
            ("DELETE", "/api/llama-server/hosts/1"),
            ("POST", "/api/rag/query"),
            ("GET", "/api/does-not-exist"),
        ):
            assert client.request(method, path).status_code in {401, 403}, (
                method,
                path,
            )
        assert client.head("/api/status").status_code in {401, 403}

        assert (
            client.get(
                "/api/question-bank/stats",
                headers={"X-Judgment-Admin-Token": "secret-token"},
            ).status_code
            == 200
        )


def test_route_policy_guard_denies_anonymous_on_protected_route(web_client) -> None:
    route = next(
        route
        for route in web_client.app.routes
        if getattr(route, "path", "") == "/api/status"
    )
    request = Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "https",
            "path": "/api/status",
            "raw_path": b"/api/status",
            "query_string": b"",
            "headers": [],
            "client": ("127.0.0.1", 12345),
            "server": ("testserver", 443),
            "app": web_client.app,
            "route": route,
        }
    )
    request.state.principal = anonymous_principal()
    with pytest.raises(HTTPException) as exc:
        route_policy_guard(request)
    assert exc.value.status_code in {401, 403}


def test_smoke_instance_can_disable_background_tasks(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        disable_background_tasks=True,
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        assert client.get("/api/health").status_code == 200


def test_every_registered_route_keeps_public_or_denied_boundary(web_client) -> None:
    policies = load_route_policies()
    settings = replace(
        web_client.app.state.settings,
        admin_token="secret-token",
        allow_local_admin_bypass=False,
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    public_policies = {"PUBLIC_READ", "PUBLIC_QUERY", "PUBLIC_AUTH"}
    skip_paths = {"/api/events/stream", "/api/processing/active/stream"}
    with TestClient(app) as client:
        for key in registered_route_keys(app.routes):
            if key.startswith(("MOUNT ", "WS ")):
                continue
            method, path = key.split(" ", 1)
            if method not in {"GET", "POST", "PATCH", "PUT", "DELETE"}:
                continue
            if path in skip_paths:
                continue
            concrete = re.sub(r"\{[^}]+\}", "1", path)
            policy = policy_for(method, path, policies)
            response = client.request(method, concrete)
            if policy in public_policies:
                assert response.status_code != 401, (
                    method,
                    path,
                    response.status_code,
                )
            elif policy in {"DEMO_READ", "DEMO_QUERY"}:
                assert response.status_code == 403, (
                    method,
                    path,
                    response.status_code,
                )
            else:
                assert response.status_code == 401, (
                    method,
                    path,
                    response.status_code,
                )


def test_protected_route_variants_do_not_bypass_auth(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        admin_token="secret-token",
        allow_local_admin_bypass=False,
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    variants = (
        "/api/status/",
        "http://testserver//api/status",
        "/%61pi/status",
        "/API/status",
        "/api/home/../status",
        "/api/home%2f..%2fstatus",
        "/api/%2e%2e/status",
        "/api/llama-server/hosts/1",
        "/api/question-bank/items/1",
    )
    with TestClient(app) as client:
        for path in variants:
            response = client.get(path)
            assert response.status_code in {401, 403}, (path, response.status_code)
        assert client.head("/api/status").status_code in {401, 403}
        preflight = client.options(
            "/api/status",
            headers={
                "Origin": "http://127.0.0.1:9200",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert preflight.status_code == 200
        assert preflight.headers["access-control-allow-origin"] == (
            "http://127.0.0.1:9200"
        )


def test_route_policies_cover_every_registered_route(web_client) -> None:
    policies = load_route_policies()
    registered = set(registered_route_keys(web_client.app.routes))
    assert not registered - set(policies)
    assert all(category in VALID_CATEGORIES for category in policies.values())

    assert policy_for("GET", "/api/status", policies) == "DEMO_READ"
    assert policy_for("POST", "/api/processing/stop", policies) == "ADMIN_WRITE"
    assert policy_for("POST", "/api/rag/query", policies) == "DEMO_QUERY"
    assert policy_for("GET", "/api/auth/google/start", policies) == "PUBLIC_AUTH"
    assert policy_for("POST", "/api/auth/sse-ticket", policies) == "AUTH_READ"
    assert policy_for("GET", "/api/unknown", policies) == "ADMIN_ONLY"
    assert (
        policy_for("GET", "/api/question-bank/items/abc", policies)
        == "DEMO_READ"
    )
    assert (
        policy_for("PATCH", "/api/question-bank/items/abc", policies)
        == "ADMIN_WRITE"
    )
    assert (
        policy_for("POST", "/api/processing/workflows/run-1/run", policies)
        == "ADMIN_WRITE"
    )
    assert policy_for("GET", "/api/index-versions/7", policies) == "AUTH_READ"

    with pytest.raises(RuntimeError, match="unclassified routes"):
        validate_route_policies(
            web_client.app.routes,
            {"GET /api/health": "PUBLIC_READ"},
        )
    with pytest.raises(RuntimeError, match="stale route policies"):
        validate_route_policies(
            web_client.app.routes,
            {**policies, "GET /api/removed": "ADMIN_ONLY"},
        )


def test_oauth_redirect_helper_is_not_public(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        admin_token="secret-token",
        allow_local_admin_bypass=False,
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app) as client:
        assert client.get("/docs/oauth2-redirect").status_code == 401


def test_remote_google_session_authorizes_and_rejects_bad_origin(web_client) -> None:
    settings = _oauth_settings(web_client)
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    token = make_session_token(
        {
            "sub": "google-sub-3",
            "email": "admin@example.com",
            "name": "Admin User",
        },
        settings,
    )
    with TestClient(app, client=("203.0.113.9", 50000)) as remote:
        assert remote.get("/api/question-bank/stats").status_code == 403

        remote.cookies.set("judgment_session", token)
        assert remote.get("/api/question-bank/stats").status_code == 200

        bad_origin = remote.post(
            "/api/auth/sse-ticket",
            headers={"Origin": "https://evil.example"},
        )
        assert bad_origin.status_code == 403

        good_origin = remote.post(
            "/api/auth/sse-ticket",
            headers={"Origin": "https://app.example"},
        )
        assert good_origin.status_code == 200
        assert good_origin.json()["ticket"]


def test_google_logout_clears_session(web_client) -> None:
    settings = _oauth_settings(web_client)
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    token = make_session_token(
        {
            "sub": "google-sub-4",
            "email": "admin@example.com",
            "name": "Admin User",
        },
        settings,
    )
    with TestClient(app) as client:
        client.cookies.set("judgment_session", token)
        assert client.get("/api/auth/me").json()["authenticated"] is True

        logout = client.post("/api/auth/logout")
        assert logout.status_code == 200
        assert logout.json()["ok"] is True
        set_cookie = logout.headers.get("set-cookie", "")
        assert "judgment_session=" in set_cookie
        assert "Max-Age=0" in set_cookie
        client.cookies.delete("judgment_session")
        assert client.get("/api/auth/me").json()["authenticated"] is False


def test_ollama_host_rejects_unlisted_and_metadata_targets(web_client) -> None:
    unlisted = web_client.post(
        "/api/llama-server/hosts",
        json={"name": "Unlisted", "url": "http://evil.test", "port": 11434},
    )
    assert unlisted.status_code == 422

    metadata = web_client.post(
        "/api/llama-server/hosts",
        json={"name": "Metadata", "url": "http://169.254.169.254", "port": 80},
    )
    assert metadata.status_code == 422


def test_ollama_host_priority_reorder_api(web_client) -> None:
    first = web_client.post(
        "/api/llama-server/hosts",
        json={"name": "First", "url": "http://first.test", "port": 11434},
    )
    second = web_client.post(
        "/api/llama-server/hosts",
        json={"name": "Second", "url": "http://second.test", "port": 11434},
    )
    assert first.status_code == 200
    assert second.status_code == 200
    first_id = first.json()["id"]
    second_id = second.json()["id"]

    response = web_client.post(
        "/api/llama-server/hosts/reorder",
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
        "/api/llama-server/hosts/reorder",
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


def test_settings_sidebar_source_and_bundle_are_present() -> None:
    root = Path(__file__).resolve().parents[1]
    static_assets = root / "src" / "judgment" / "web" / "static" / "assets"
    settings_js = (static_assets / "js" / "settings.js").read_text(encoding="utf-8")
    source_css = (static_assets / "styles.css").read_text(encoding="utf-8")
    bundle_css = (root / "frontend" / "assets" / "styles.css").read_text(
        encoding="utf-8"
    )
    bundle_js = (root / "frontend" / "assets" / "js" / "app.js").read_text(
        encoding="utf-8"
    )

    assert "judgment.fontSizes.v1" in settings_js
    assert "font-size-slider" in settings_js
    assert "回復預設值" in settings_js
    assert 'icon("palette", 15)' in settings_js
    assert 'data-theme="${escapeHtml(theme.id)}"' in settings_js
    assert "theme-option-active-preview" in settings_js
    assert "judgment.appearance" in settings_js
    assert "data-appearance-option" in settings_js
    assert "settings-open" in source_css
    assert "appearance-switch" in source_css
    assert ':root[data-appearance="dark"]' in source_css
    assert ':root[data-appearance="light"]' not in source_css
    assert "settings-open" in bundle_css
    assert "appearance-switch" in bundle_css
    assert ':root[data-appearance="dark"]' in bundle_css
    assert ':root[data-appearance="light"]' not in bundle_css
    assert "font-size-slider" in bundle_js
    assert "theme-option-active-preview" in bundle_js
    assert "data-appearance-option" in bundle_js
    assert "judgment.fontSizes.v1" in bundle_js


def test_standalone_frontend_artifact_is_relative_and_bundled() -> None:
    frontend = Path(__file__).resolve().parents[1] / "frontend"
    index = (frontend / "index.html").read_text(encoding="utf-8")
    assert re.search(
        r'<script src="\./config\.js(?:\?v=\d+)?"></script>', index
    )
    assert re.search(
        r'<script src="\./assets/js/app\.js(?:\?v=\d+)?"></script>',
        index,
    )
    assert re.search(
        r'href="\./assets/styles\.css(?:\?v=\d+)?"', index
    )
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


def test_progress_visualization_spec_is_canonical() -> None:
    spec = (
        Path(__file__).resolve().parents[1]
        / "specs"
        / "004-web-console"
        / "progress-visualization.md"
    )
    text = spec.read_text(encoding="utf-8")
    for phrase in (
        "25%",
        "var(--block-color)",
        "is-pending",
        "is-running",
        "is-complete",
        "SSE",
        "Progress Visualization",
        "全站統一使用條款",
        "processing-month-stages",
        "outline-offset: -3px",
        "archive-level",
        "MUST NOT 使用 `judgment-month-pulse`",
    ):
        assert phrase in text


def test_judgment_vector_index_spec_is_canonical() -> None:
    spec = (
        Path(__file__).resolve().parents[1]
        / "specs"
        / "009-judgment-vector-index"
        / "spec.md"
    )
    text = spec.read_text(encoding="utf-8")
    for phrase in (
        "Qdrant 判決向量索引",
        "latest archive",
        "baseline archives",
        "archiveUpdateRank",
        "source_archive",
        "unchanged",
        "不是從 `raw_rar` 檔案清單選出",
        "以月份計，不是 RAR 檔數",
        "coverage-only",
        "R／E",
        "index_pending_count",
        "Qdrant 向量索引待補",
        "capabilities.index_pending_months",
    ):
        assert phrase in text


def test_google_start_uses_loopback_callback_for_local_console(web_client) -> None:
    settings = replace(
        web_client.app.state.settings,
        google_oauth_client_id="client-id.apps.googleusercontent.com",
        google_oauth_client_secret="client-secret",
        google_oauth_redirect_uri=(
            "https://api-mbp.ragdemo.win/api/auth/google/callback"
        ),
        admin_token="test-secret",
    )
    app = create_app(
        settings=settings,
        session_factory=web_client.app.state.session_factory,
        data_dir=web_client.app.state.data_dir,
    )
    with TestClient(app, base_url="http://localhost:9200") as client:
        response = client.get("/api/auth/google/start", follow_redirects=False)
    assert response.status_code == 302
    query = parse_qs(urlparse(response.headers["location"]).query)
    assert query["redirect_uri"] == [
        "http://localhost:9200/api/auth/google/callback"
    ]


def test_question_bank_review_scores_use_five_clickable_cells() -> None:
    root = Path(__file__).resolve().parents[1]
    source = (
        root
        / "src"
        / "judgment"
        / "web"
        / "static"
        / "assets"
        / "js"
        / "pages"
        / "question_bank.js"
    ).read_text(encoding="utf-8")
    css = (
        root / "src" / "judgment" / "web" / "static" / "assets" / "styles.css"
    ).read_text(encoding="utf-8")
    utils = (
        root
        / "src"
        / "judgment"
        / "web"
        / "static"
        / "assets"
        / "js"
        / "utils.js"
    ).read_text(encoding="utf-8")
    benchmark = (
        root
        / "src"
        / "judgment"
        / "web"
        / "static"
        / "assets"
        / "js"
        / "pages"
        / "benchmark_page.js"
    ).read_text(encoding="utf-8")
    assert "scoreCellsMarkup" in source
    assert "reviewScoresHistoryMarkup" in source
    assert "latestReviewScoresMarkup" in source
    assert "await api.questionBankItem(id)" in source
    assert "scoreCellsMarkup" in benchmark
    assert "qb-score-cells" in utils
    assert "data-score-cell" in utils
    assert "data-score-input" in utils
    assert "qb-score-cell.is-active" in css
    assert "background: #76b900" in css
    assert ".qb-score-history-table" in css
    assert ".qb-latest-scores" in css
    assert 'data-score="3"' in css
    assert "#eab308" in css
    assert "#dc2626" in css
    assert 'type="number" min="1" max="5" name="score_' not in benchmark
