from __future__ import annotations

import json
from dataclasses import replace
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.models import Base
from judgment.observability import record_performance
from judgment.web.app import create_app

ADMIN_HEADERS = {"X-Judgment-Admin-Token": "secret-demo-token"}
ALL_FEATURES = {
    "rag": True,
    "data": True,
    "quality": True,
    "performance": True,
    "processing": True,
    "status": True,
}


@pytest.fixture()
def demo_client(tmp_path: Path):
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
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "data",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path / "judgments",
        judgment_law_list=Path(__file__).resolve().parents[1]
        / "documents"
        / "金融法規.md",
        auto_create_schema=False,
        disable_background_tasks=True,
        allow_local_admin_bypass=False,
        admin_token="secret-demo-token",
        demo_rag_daily_token_budget=1_000_000,
        demo_rag_daily_request_limit=400,
        demo_rag_rate_per_minute=10,
        demo_rag_rate_per_hour=60,
        demo_rag_rate_per_day=200,
        demo_query_rate_per_minute=20,
        demo_query_rate_per_hour=200,
        demo_query_rate_per_day=500,
        demo_poll_rate_per_minute=120,
        demo_poll_rate_per_hour=3000,
        demo_poll_rate_per_day=20000,
    )
    app = create_app(
        settings=settings,
        session_factory=session_factory,
        data_dir=tmp_path / "data",
    )
    with TestClient(app) as client:
        yield client, app


def test_demo_defaults_closed_and_admin_can_open(demo_client) -> None:
    client, _app = demo_client
    assert client.get("/api/health").status_code == 200
    status = client.get("/api/demo/status")
    assert status.status_code == 200
    assert status.json()["enabled"] is False
    assert status.json()["features"] == {
        "rag": False,
        "data": False,
        "quality": False,
        "performance": False,
        "processing": False,
        "status": False,
    }

    assert client.get("/api/home").status_code == 403
    assert client.get("/api/status").status_code == 403
    assert client.get("/api/catalog").status_code == 403
    assert client.get("/api/admin/demo").status_code == 401

    admin = client.get("/api/admin/demo", headers=ADMIN_HEADERS)
    assert admin.status_code == 200
    version = admin.json()["stored"]["version"]
    opened = client.put(
        "/api/admin/demo",
        headers=ADMIN_HEADERS,
        json={
            "enabled": True,
            "duration_hours": 2,
            "features": ALL_FEATURES,
            "version": version,
        },
    )
    assert opened.status_code == 200, opened.text
    payload = opened.json()
    assert payload["effective"]["enabled"] is True
    assert payload["effective"]["features"] == ALL_FEATURES
    assert payload["stored"]["features"] == ALL_FEATURES

    public = client.get("/api/demo/status").json()
    assert public["enabled"] is True
    assert public["features"] == ALL_FEATURES
    assert public["expires_at"]

    assert client.get("/api/home").status_code == 200
    assert client.get("/api/catalog").status_code == 200

    closed = client.post("/api/admin/demo/close", headers=ADMIN_HEADERS)
    assert closed.status_code == 200
    closed_payload = closed.json()
    assert closed_payload["effective"]["enabled"] is False
    assert closed_payload["stored"]["features"] == ALL_FEATURES
    assert client.get("/api/demo/status").json()["enabled"] is False
    assert client.get("/api/home").status_code == 403


def test_demo_feature_flags_only_open_selected_features(demo_client) -> None:
    client, _app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    opened = client.put(
        "/api/admin/demo",
        headers=ADMIN_HEADERS,
        json={
            "enabled": True,
            "duration_hours": 24,
            "features": {
                **{key: False for key in ALL_FEATURES},
                "data": True,
            },
            "version": version,
        },
    )
    assert opened.status_code == 200, opened.text
    assert client.get("/api/demo/status").json()["features"]["data"] is True
    assert client.get("/api/catalog").status_code == 200
    assert client.get("/api/status").status_code == 403
    assert client.get("/api/quality").status_code == 403
    assert client.get("/api/processing").status_code == 403


def test_demo_hard_disable_wins_over_database(demo_client) -> None:
    client, app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": ALL_FEATURES,
                "version": version,
            },
        ).status_code
        == 200
    )
    app.state.settings = replace(app.state.settings, demo_hard_disable=True)
    public = client.get("/api/demo/status").json()
    assert public["enabled"] is False
    assert "JUDGMENT_DEMO_HARD_DISABLE" in public["reason"]
    assert client.get("/api/home").status_code == 403


def test_demo_rate_limit_is_per_bucket(demo_client) -> None:
    client, app = demo_client
    app.state.settings = replace(
        app.state.settings,
        demo_poll_rate_per_minute=2,
    )
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": {**{key: False for key in ALL_FEATURES}, "data": True},
                "version": version,
            },
        ).status_code
        == 200
    )
    assert client.get("/api/catalog").status_code == 200
    assert client.get("/api/catalog").status_code == 200
    limited = client.get("/api/catalog")
    assert limited.status_code == 429
    assert limited.json()["code"] == "demo_rate_limited"
    assert limited.headers.get("Retry-After")


def test_demo_status_and_processing_sanitize_infrastructure(demo_client) -> None:
    client, _app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": ALL_FEATURES,
                "version": version,
            },
        ).status_code
        == 200
    )
    status = client.get("/api/status")
    assert status.status_code == 200
    payload = status.json()
    assert payload["endpoints"] == []
    assert payload["model_summary"] == []
    assert payload["data"]["judgment_vector_collection"] == ""
    assert payload["data"]["judgment_vector_alias"] == ""
    for service in payload.get("services") or []:
        assert service.get("detail") == ""

    from judgment.web.demo_mode import sanitize_processing_payload

    cleaned = sanitize_processing_payload(
        {
            "workflows": [
                {
                    "index_runtime": {
                        "host": "internal.example",
                        "port": 11437,
                        "collection": "private_collection",
                    },
                    "stages": [
                        {
                            "message": (
                                "選用 http://x570:11437 · bge-m3 · port 11437"
                            )
                        }
                    ],
                }
            ]
        }
    )
    runtime = cleaned["workflows"][0]["index_runtime"]
    assert runtime["host"] == ""
    assert runtime["port"] == 0
    assert runtime["collection"] == ""
    assert cleaned["workflows"][0]["stages"][0]["message"] == ""

    from judgment.web.demo_mode import sanitize_status_payload

    status = sanitize_status_payload(
        {
            "services": [
                {
                    "active_url": "http://x570:11437",
                    "active_model": "bge-m3",
                    "detail": "http://x570:11437",
                    "providers": [{"name": "x570", "role": "primary"}],
                    "active": {"name": "x570", "role": "primary"},
                }
            ],
            "pipeline": {
                "stages": [{"message": "模型：bge-m3 · http://x570:11437"}]
            },
            "architecture": {
                "layers": [
                    {
                        "nodes": [
                            {"label": "REST API · :9200", "detail": "x570"},
                            {"label": "Power Agent · :9201", "detail": "port 9201"},
                        ]
                    }
                ]
            }
        }
    )
    labels = [
        node["label"]
        for layer in status["architecture"]["layers"]
        for node in layer["nodes"]
    ]
    assert labels == ["REST API", "Power Agent"]
    assert status["services"][0]["providers"][0]["name"] == "主要主機"
    assert status["services"][0]["active"]["name"] == "主要主機"
    assert all(
        node.get("detail") == ""
        for layer in status["architecture"]["layers"]
        for node in layer["nodes"]
    )
    assert status["services"][0]["active_url"] == ""
    assert status["services"][0]["active_model"] == ""
    assert status["pipeline"]["stages"][0]["message"] == ""


def test_sanitize_performance_payload_redacts_rag_text() -> None:
    from judgment.web.demo_mode import sanitize_performance_payload

    payload = {
        "rows": [
            {
                "id": 1,
                "process": "RAG 問答",
                "duration_ms": 1234,
                "params_text": '{"question_length": 16}',
                "flow": {
                    "request_id": "req-1",
                    "total_ms": 1234,
                    "status": "success",
                    "params": {"question_length": 16},
                    "metadata": {
                        "question": "測試機密問題",
                        "answer": "測試機密答案",
                        "rag_status": "operational",
                        "asgi_to_handler_ms": 9.1,
                        "rag_response": {
                            "status": "operational",
                            "citation_count": 2,
                            "llm_model": "secret-model",
                            "has_answer": True,
                        },
                        "citation_audit": {
                            "unsupported_sentences": ["測試機密答案片段"]
                        },
                    },
                    "client": {"route": "/#/rag", "total_ms": 1200},
                    "summary": {
                        "segment_count": 1,
                        "models": ["secret-model"],
                    },
                    "segments": [
                        {
                            "seq": 1,
                            "name": "rag.parse_question",
                            "params": {
                                "question_length": 16,
                                "stat_entity": "測試實體",
                            },
                            "metadata": {
                                "parsed_query": {"topics": ["測試主題"]},
                                "filter": {"keyword": "測試關鍵字"},
                                "input_length": 16,
                                "status": "ok",
                            },
                            "duration_ms": 10,
                            "status": "ok",
                        }
                    ],
                },
            }
        ]
    }

    cleaned = sanitize_performance_payload(payload)
    dumped = json.dumps(cleaned, ensure_ascii=False)
    for secret in (
        "測試機密問題",
        "測試機密答案",
        "測試機密答案片段",
        "測試實體",
        "測試主題",
        "測試關鍵字",
    ):
        assert secret not in dumped

    row = cleaned["rows"][0]
    assert row["params_text"] == ""
    flow = row["flow"]
    assert "params" not in flow
    assert "client" not in flow
    assert flow["metadata"]["rag_status"] == "operational"
    assert flow["metadata"]["rag_response"]["citation_count"] == 2
    assert "llm_model" not in flow["metadata"]["rag_response"]
    assert "citation_audit" not in flow["metadata"]
    assert flow["summary"]["segment_count"] == 1
    assert flow["summary"]["models"] == []
    segment = flow["segments"][0]
    assert segment["params"]["question_length"] == 16
    assert "stat_entity" not in segment["params"]
    assert segment["metadata"]["input_length"] == 16
    assert "parsed_query" not in segment["metadata"]
    assert "filter" not in segment["metadata"]


def test_demo_performance_redacts_rag_question_and_answer(demo_client) -> None:
    client, app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": ALL_FEATURES,
                "version": version,
            },
        ).status_code
        == 200
    )

    now = datetime.now(timezone.utc)
    record_performance(
        app.state.session_factory,
        process="RAG 問答",
        module="judgment.rag.answer_question",
        status="success",
        started_at=now,
        finished_at=now,
        duration_ms=1234,
        method="POST",
        path="/api/rag/query",
        request_id="demo-leak-regression",
        params={"question_length": 12},
        flow={
            "version": "1",
            "request_id": "demo-leak-regression",
            "entrypoint": "/api/rag/query",
            "method": "POST",
            "path": "/api/rag/query",
            "started_at": now.isoformat(),
            "finished_at": now.isoformat(),
            "total_ms": 1234,
            "status": "success",
            "params": {"question_length": 12},
            "metadata": {
                "question": "測試機密問題",
                "answer": "測試機密答案",
                "rag_status": "operational",
                "rag_response": {
                    "status": "operational",
                    "citation_count": 2,
                },
                "citation_audit": {
                    "unsupported_sentences": ["測試機密答案片段"]
                },
            },
            "client": {"route": "/#/rag"},
            "summary": {"segment_count": 1},
            "segments": [
                {
                    "seq": 1,
                    "name": "rag.answer_question",
                    "params": {"question_length": 12},
                    "metadata": {"status": "ok", "input_length": 12},
                    "offset_ms": 0,
                    "duration_ms": 1234,
                    "status": "success",
                }
            ],
        },
    )

    response = client.get(
        "/api/performance",
        params={"process": "RAG 問答", "page_size": 10},
    )
    assert response.status_code == 200
    payload = response.json()
    dumped = json.dumps(payload, ensure_ascii=False)
    for secret in ("測試機密問題", "測試機密答案", "測試機密答案片段"):
        assert secret not in dumped
    row = next(
        item
        for item in payload["rows"]
        if item["request_id"] == "demo-leak-regression"
    )
    assert row["params_text"] == ""
    assert "params" not in row["flow"]
    assert "client" not in row["flow"]
    assert "question" not in row["flow"]["metadata"]
    assert "answer" not in row["flow"]["metadata"]
    assert "citation_audit" not in row["flow"]["metadata"]

    admin = client.get(
        "/api/performance",
        params={"process": "RAG 問答", "page_size": 10},
        headers=ADMIN_HEADERS,
    )
    assert admin.status_code == 200
    admin_row = next(
        item
        for item in admin.json()["rows"]
        if item["request_id"] == "demo-leak-regression"
    )
    assert admin_row["flow"]["metadata"]["question"] == "測試機密問題"
    assert admin_row["flow"]["metadata"]["answer"] == "測試機密答案"


def test_demo_route_feature_mapping_is_explicit() -> None:
    from judgment.web.route_policy import demo_feature_for, load_demo_policies

    mapping = load_demo_policies()
    assert mapping["GET /api/status"] == "status"
    assert mapping["GET /api/processing"] == "processing"
    assert mapping["POST /api/rag/query"] == "rag"
    assert mapping["POST /api/query"] == "data"
    assert demo_feature_for("GET", "/api/status") == "status"
    assert demo_feature_for("GET", "/api/question-bank/items/abc") == "quality"
    assert demo_feature_for("GET", "/api/not-demo") is None


def test_demo_ui_assets_are_served(demo_client) -> None:
    client, _app = demo_client
    index = client.get("/")
    assert index.status_code == 200
    assert 'id="demo-banner"' in index.text
    assert "assets/js/app.js" in index.text

    demo = client.get("/assets/js/demo.js")
    assert demo.status_code == 200
    assert "loadDemoContext" in demo.text
    assert "renderDemoClosed" in demo.text

    admin = client.get("/assets/js/pages/admin.js")
    assert admin.status_code == 200
    assert "管理設定" in admin.text
    assert "儲存設定" in admin.text
    assert "開啟展示" in admin.text
    assert "立即關閉展示" in admin.text
    assert "不會改變目前開關" in admin.text

    pages = client.get("/assets/js/demo_pages.js")
    assert pages.status_code == 200
    assert "renderDemoProcessing" in pages.text
    assert "目前索引進度" in pages.text
    assert "最近執行紀錄" in pages.text
    assert "renderDemoStatus" in pages.text
    api_js = client.get("/assets/js/api.js")
    assert api_js.status_code == 200
    assert "demoProcessing" in api_js.text

    css = client.get("/assets/styles.css")
    assert css.status_code == 200
    assert ".demo-banner" in css.text
    assert ".demo-switch" in css.text
    assert ".demo-switch input:checked + span" in css.text
    assert ".btn-success" in css.text
    assert "body.is-demo-visitor" in css.text


def test_admin_demo_put_cors_preflight_is_allowed(demo_client) -> None:
    client, _app = demo_client
    response = client.options(
        "/api/admin/demo",
        headers={
            "Origin": "http://127.0.0.1:9200",
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:9200"
    assert "PUT" in response.headers["access-control-allow-methods"]


def test_api_host_console_assets_revalidate_after_deploy(demo_client) -> None:
    client, _app = demo_client
    index = client.get("/")
    assert "no-cache" in index.headers.get("cache-control", "")
    asset = client.get("/assets/js/pages/admin.js")
    assert "no-cache" in asset.headers.get("cache-control", "")


def test_demo_processing_uses_cached_bootstrap(
    demo_client, monkeypatch
) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
    client, _app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": {
                    **{key: False for key in ALL_FEATURES},
                    "processing": True,
                },
                "version": version,
            },
        ).status_code
        == 200
    )

    cached = {
        "status": "operational",
        "mode": "running",
        "generated_at": "2026-11-20T15:00:00+00:00",
        "workflows": [
            {
                "id": "index_versions",
                "label": "Qdrant判決向量索引版本建置",
                "index_runtime": {
                    "version_id": 7,
                    "build_mode": "reuse",
                    "expected_count": 100,
                    "summary": {
                        "indexed": 55,
                        "total": 100,
                        "reused": 50,
                        "embedded": 5,
                    },
                    "current": {"month": "201905", "phase": "reuse"},
                    "copy": {
                        "status": "success",
                        "copied": 100,
                        "total": 100,
                        "duration_ms": 1000,
                        "resumed": True,
                    },
                },
            }
        ],
        "active_runs": [],
        "recent_runs": [],
        "capabilities": {"index_pending_months": 2},
    }
    monkeypatch.setattr(
        app_module, "build_processing_bootstrap", lambda **_kwargs: cached
    )

    def fail_full_snapshot(**_kwargs):
        raise AssertionError("visitor request built a full snapshot")

    monkeypatch.setattr(
        app_module, "build_processing_snapshot", fail_full_snapshot
    )
    response = client.get("/api/processing")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"

    compact = client.get("/api/demo/processing")
    assert compact.status_code == 200
    payload = compact.json()
    assert payload["status"] == "operational"
    assert payload["index"]["version_id"] == 7
    assert payload["index"]["current"]["month"] == "201905"
    assert payload["index"]["copy"]["resumed"] is True
    assert payload["capabilities"]["index_pending_months"] == 2
    assert "workflows" not in payload


def test_demo_quality_uses_cached_bootstrap(demo_client, monkeypatch) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
    client, _app = demo_client
    version = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()[
        "stored"
    ]["version"]
    assert (
        client.put(
            "/api/admin/demo",
            headers=ADMIN_HEADERS,
            json={
                "enabled": True,
                "duration_hours": 2,
                "features": {
                    **{key: False for key in ALL_FEATURES},
                    "quality": True,
                },
                "version": version,
            },
        ).status_code
        == 200
    )

    cached = {
        "status": "degraded",
        "available": True,
        "generated_at": "2026-11-20T15:00:00+00:00",
        "scan_ms": 6300,
        "totals": {"rows": 100, "unique_jids": 99, "missing_pdf_rows": 12},
        "archives": [{"name": "a.rar"}],
        "checks": [
            {
                "key": "missing_pdf",
                "label": "缺少 PDF 連結",
                "count": 12,
                "percent": 12.0,
                "severity": "warn",
            }
        ],
        "coverage": {"status": "operational", "postgres_diff": 0},
        "warnings": ["w1", "w2"],
    }
    monkeypatch.setattr(
        app_module, "build_quality_bootstrap", lambda **_kwargs: cached
    )

    def fail_full_scan(**_kwargs):
        raise AssertionError("visitor request built a full quality scan")

    monkeypatch.setattr(app_module, "build_quality_snapshot", fail_full_scan)
    response = client.get("/api/quality")
    assert response.status_code == 200
    assert response.json()["status"] == "degraded"

    compact = client.get("/api/demo/quality")
    assert compact.status_code == 200
    payload = compact.json()
    assert payload["status"] == "degraded"
    assert payload["totals"]["rows"] == 100
    assert payload["archive_count"] == 1
    assert payload["checks"][0]["count"] == 12
    assert "archives" not in payload


def test_demo_full_pages_use_admin_layout_with_locked_actions(
    demo_client,
) -> None:
    client, _app = demo_client
    pages = {
        "quality": ("renderDemoQuality", "demoLockMarkup"),
        "performance": ("renderDemoPerformance", "demoLockMarkup"),
        "processing": ("renderDemoProcessing", "DEMO_ALLOWED_ACTIONS"),
        "status": ("renderDemoStatus", "DEMO_LOCKED_STATUS_TABS"),
    }
    for page, (removed, locked) in pages.items():
        response = client.get(f"/assets/js/pages/{page}.js")
        assert response.status_code == 200
        assert removed not in response.text
        assert locked in response.text

    css = client.get("/assets/styles.css")
    assert css.status_code == 200
    assert "body.is-demo-visitor .processing-actions" not in css.text
    assert ".demo-lock-card" in css.text
    assert ".demo-lock-tooltip" in css.text

    demo_js = client.get("/assets/js/demo.js")
    assert demo_js.status_code == 200
    assert "initDemoLockTooltips" in demo_js.text
    assert "200" in demo_js.text
    assert "data-demo-lock-tooltip" in demo_js.text
    app_js = client.get("/assets/js/app.js")
    assert app_js.status_code == 200
    assert "initDemoLockTooltips" in app_js.text
    for page in ("quality", "performance", "status"):
        text = client.get(f"/assets/js/pages/{page}.js").text
        assert 'title="展示模式' not in text
    processing_js = client.get("/assets/js/pages/processing.js").text
    assert 'title = "展示模式' not in processing_js
    assert 'if ("disabled" in button) button.disabled = false;' in processing_js
