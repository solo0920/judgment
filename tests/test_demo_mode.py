from __future__ import annotations

from dataclasses import replace
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.models import Base
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
