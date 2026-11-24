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
from judgment.models import (
    Base,
    JudgmentDocument,
    LawDatasetVersion,
    LawDocument,
)
from judgment.observability import record_performance
from judgment.web.app import create_app
from judgment.web.demo_mode import sanitize_rag_result

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


def test_demo_visitor_can_submit_feedback_while_rag_is_open(demo_client) -> None:
    client, _app = demo_client
    admin = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()
    opened = client.put(
        "/api/admin/demo",
        headers=ADMIN_HEADERS,
        json={
            "enabled": True,
            "duration_hours": 2,
            "features": ALL_FEATURES,
            "version": admin["stored"]["version"],
        },
    )
    assert opened.status_code == 200

    answer = client.post(
        "/api/rag/query",
        json={"question": "銀行法如何規範吸收存款？"},
    )
    assert answer.status_code == 200, answer.text
    payload = answer.json()
    created = client.post(
        "/api/rag/feedback",
        json={
            "request_id": payload["request_id"],
            "feedback_token": payload["feedback"]["token"],
            "sentiment": "unsatisfied",
            "reasons": ["not_helpful"],
            "comment": "",
        },
    )
    assert created.status_code == 201, created.text
    assert created.json()["sentiment"] == "unsatisfied"


def test_demo_feedback_reads_stay_admin_only(demo_client) -> None:
    client, _app = demo_client
    admin = client.get("/api/admin/demo", headers=ADMIN_HEADERS).json()
    opened = client.put(
        "/api/admin/demo",
        headers=ADMIN_HEADERS,
        json={
            "enabled": True,
            "duration_hours": 2,
            "features": ALL_FEATURES,
            "version": admin["stored"]["version"],
        },
    )
    assert opened.status_code == 200
    assert client.get("/api/rag/feedback").status_code == 401
    assert client.get("/api/rag/feedback/stats").status_code == 401

    admin_read = client.get(
        "/api/rag/feedback", headers=ADMIN_HEADERS
    )
    assert admin_read.status_code == 200
    assert admin_read.json()["total"] == 0


def test_demo_feedback_write_is_gated_by_demo_mode(demo_client) -> None:
    client, _app = demo_client
    response = client.post(
        "/api/rag/feedback",
        json={
            "request_id": "abcdefgh",
            "feedback_token": "x" * 32,
            "sentiment": "satisfied",
            "reasons": [],
            "comment": "",
        },
    )
    assert response.status_code == 403
    assert response.json()["code"] == "demo_closed"


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

    home = client.get("/api/home")
    assert home.status_code == 200
    assert "/Users/" not in json.dumps(home.json(), ensure_ascii=False)
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
    assert client.get("/api/home").status_code == 200


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
    admin_status = client.get("/api/status", headers=ADMIN_HEADERS)
    assert admin_status.status_code == 200
    assert admin_status.json()["endpoints"]

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


def test_demo_performance_redacts_share_tokens(demo_client) -> None:
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
    token = "legacy-share-token"
    path = f"/api/rag/share/{token}"
    record_performance(
        app.state.session_factory,
        process=path,
        module=f"http{path}",
        status="success",
        started_at=now,
        finished_at=now,
        duration_ms=12,
        method="GET",
        path=path,
        request_id="demo-share-token-regression",
        flow={
            "version": "1",
            "request_id": "demo-share-token-regression",
            "entrypoint": path,
            "method": "GET",
            "path": path,
            "started_at": now.isoformat(),
            "finished_at": now.isoformat(),
            "total_ms": 12,
            "status": "success",
            "segments": [],
        },
    )

    response = client.get("/api/performance", params={"page_size": 10})
    assert response.status_code == 200
    dumped = json.dumps(response.json(), ensure_ascii=False)
    assert token not in dumped
    assert "/api/rag/share/:share_id" in dumped
    row = next(
        item
        for item in response.json()["rows"]
        if item["request_id"] == "demo-share-token-regression"
    )
    assert token not in json.dumps(row, ensure_ascii=False)


def test_demo_schema_suggest_blocks_sensitive_paths(
    demo_client, tmp_path: Path
) -> None:
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
    app.state.demo_query_session_factory = app.state.session_factory
    parquet_path = str(tmp_path / "secret-laws.parquet")
    with app.state.session_factory() as session:
        session.add(
            LawDatasetVersion(
                source_type="law",
                source_url="https://example.test/law",
                update_date="20261122",
                version_code="202611220001",
                content_sha256="a" * 64,
                raw_json_sha256="b" * 64,
                zip_sha256="c" * 64,
                zip_path=str(tmp_path / "secret-laws.zip"),
                parquet_path=parquet_path,
                law_count=1,
                article_count=2,
                is_current=True,
            )
        )
        session.commit()

    params = {
        "database": "postgres",
        "table": "law_dataset_versions",
        "column": "parquet_path",
    }
    demo = client.get("/api/schema/suggest", params=params)
    assert demo.status_code == 200
    assert demo.json()["values"] == []
    assert demo.json()["warnings"] == ["此欄位未開放展示。"]
    assert str(tmp_path) not in demo.text

    admin = client.get(
        "/api/schema/suggest", params=params, headers=ADMIN_HEADERS
    )
    assert admin.status_code == 200
    assert parquet_path in admin.json()["values"]

    visible = client.get(
        "/api/schema/suggest",
        params={**params, "column": "id"},
    )
    assert visible.status_code == 200
    assert visible.json()["values"] == ["1"]

    query = client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "law_dataset_versions"},
            "page_size": 1,
        },
    )
    assert query.status_code == 200
    columns = {item["key"] for item in query.json()["columns"]}
    assert "parquet_path" not in columns
    assert "zip_path" not in columns


def test_sanitize_processing_payload_redacts_paths() -> None:
    from judgment.web.demo_mode import sanitize_processing_payload

    cleaned = sanitize_processing_payload(
        {
            "raw_backups": {
                "latest": {
                    "manifest_path": "/Users/alice/project/data/manifest.json"
                }
            },
            "workflows": [
                {
                    "update_status": {
                        "download_path": "/home/alice/data/law.zip"
                    },
                    "note": "see /var/tmp/secret",
                }
            ],
            "law_list": "/Users/alice/docs/law.md",
        }
    )
    dumped = json.dumps(cleaned, ensure_ascii=False)
    assert "/Users/" not in dumped
    assert "/home/" not in dumped
    assert "/var/" not in dumped
    assert cleaned["raw_backups"]["latest"]["manifest_path"] == ""
    assert cleaned["workflows"][0]["update_status"]["download_path"] == ""
    assert cleaned["law_list"] == ""
    assert "[internal]" in cleaned["workflows"][0]["note"]


def test_sanitize_catalog_payload_hides_internal_endpoints() -> None:
    from judgment.web.demo_mode import sanitize_catalog_payload

    cleaned = sanitize_catalog_payload(
        {
            "categories": [
                {
                    "id": "law",
                    "databases": [
                        {
                            "id": "qdrant",
                            "detail": "已連線 http://127.0.0.1:6333；collection「law_articles」",
                        },
                        {
                            "id": "postgres",
                            "detail": "讀取 /Users/alice/project/data/laws.parquet",
                        },
                    ],
                }
            ]
        }
    )
    dumped = json.dumps(cleaned, ensure_ascii=False)
    assert "127.0.0.1" not in dumped
    assert "/Users/" not in dumped
    assert "[internal]" in dumped


def test_sanitize_query_payload_redacts_operational_fields() -> None:
    from judgment.web.demo_mode import sanitize_query_payload

    cleaned = sanitize_query_payload(
        {
            "rows": [
                {
                    "parquet_path": "/Users/alice/data/laws.parquet",
                    "zip_path": "/home/alice/data/laws.zip",
                    "error_message": "failed at /Users/alice/run.log",
                    "law_name": "銀行法",
                }
            ],
            "query_text": "SELECT * FROM laws -- /Users/alice/secret",
        }
    )
    dumped = json.dumps(cleaned, ensure_ascii=False)
    assert "/Users/" not in dumped
    assert "/home/" not in dumped
    row = cleaned["rows"][0]
    assert row["parquet_path"] == ""
    assert row["zip_path"] == ""
    assert row["error_message"] == ""
    assert row["law_name"] == "銀行法"


def test_demo_catalog_sanitizes_internal_endpoints(demo_client, monkeypatch) -> None:
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
                "features": ALL_FEATURES,
                "version": version,
            },
        ).status_code
        == 200
    )

    synthetic = {
        "categories": [
            {
                "id": "law",
                "databases": [
                    {
                        "id": "qdrant",
                        "detail": "已連線 http://127.0.0.1:6333；collection「law_articles」",
                    }
                ],
            }
        ]
    }
    monkeypatch.setattr(
        app_module, "build_catalog", lambda *_args, **_kwargs: synthetic
    )

    demo = client.get("/api/catalog")
    assert demo.status_code == 200
    assert "127.0.0.1" not in demo.text
    assert "[internal]" in demo.text

    admin = client.get("/api/catalog", headers=ADMIN_HEADERS)
    assert admin.status_code == 200
    assert "127.0.0.1" in admin.text


def test_demo_error_response_hides_exception_details(demo_client, monkeypatch) -> None:
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
                "features": ALL_FEATURES,
                "version": version,
            },
        ).status_code
        == 200
    )

    def fail(**_kwargs):
        raise RuntimeError("SECRET_INTERNAL_DETAIL")

    monkeypatch.setattr(app_module, "query_performance", fail)

    demo = client.get("/api/performance", params={"page_size": 1})
    assert demo.status_code == 500
    demo_payload = demo.json()
    assert "SECRET_INTERNAL_DETAIL" not in json.dumps(demo_payload)
    assert "RuntimeError" not in json.dumps(demo_payload)
    assert demo_payload["detail"] == "請求失敗，請稍後再試。"
    assert demo_payload["request_id"]

    admin = client.get(
        "/api/performance",
        params={"page_size": 1},
        headers=ADMIN_HEADERS,
    )
    assert admin.status_code == 500
    assert "SECRET_INTERNAL_DETAIL" in json.dumps(admin.json())


def test_demo_body_limit_rejects_large_payloads(demo_client) -> None:
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

    response = client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"keyword": "x" * 70_000},
            "page_size": 1,
        },
    )
    assert response.status_code == 413


def test_demo_query_postgres_fails_closed_without_readonly_engine(
    demo_client,
) -> None:
    client, app = demo_client
    app.state.demo_query_session_factory = None
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

    response = client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "law_documents"},
            "page_size": 1,
        },
    )
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "demo_data_unavailable"


def test_demo_query_uses_readonly_session_factory(demo_client) -> None:
    client, app = demo_client
    app.state.demo_query_session_factory = app.state.session_factory
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

    response = client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "law_documents"},
            "page_size": 1,
        },
    )
    assert response.status_code == 200
    assert response.json()["database"] == "postgres"


def test_demo_data_endpoints_use_restricted_session_factory(
    demo_client, monkeypatch
) -> None:
    import importlib

    app_module = importlib.import_module("judgment.web.app")
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

    app.state.demo_query_session_factory = None
    assert client.get(
        "/api/data/suggest", params={"kind": "law_name"}
    ).status_code == 403
    assert client.get(
        "/api/judgment", params={"jid": "TEST", "source": "postgres"}
    ).status_code == 403
    assert client.get(
        "/api/law", params={"law_key": "銀行法"}
    ).status_code == 403
    assert client.get(
        "/api/schema/suggest",
        params={
            "database": "postgres",
            "table": "law_documents",
            "column": "law_name",
        },
    ).status_code == 403

    sentinel = object()
    app.state.demo_query_session_factory = sentinel
    seen = {}

    def spy(name):
        def capture(**kwargs):
            seen[name] = kwargs.get("session_factory") is sentinel
            if name == "judgment":
                seen["judgment_internal"] = kwargs.get(
                    "include_internal_fields"
                )
            return {"ok": True}

        return capture

    monkeypatch.setattr(app_module, "data_suggestions", spy("data"))
    monkeypatch.setattr(app_module, "get_judgment_detail", spy("judgment"))
    monkeypatch.setattr(app_module, "get_law_detail", spy("law"))
    monkeypatch.setattr(app_module, "schema_suggestions", spy("schema"))

    assert client.get(
        "/api/data/suggest", params={"kind": "law_name"}
    ).status_code == 200
    assert client.get(
        "/api/judgment", params={"jid": "TEST", "source": "postgres"}
    ).status_code == 200
    assert client.get(
        "/api/law", params={"law_key": "銀行法"}
    ).status_code == 200
    assert client.get(
        "/api/schema/suggest",
        params={
            "database": "postgres",
            "table": "law_documents",
            "column": "law_name",
        },
    ).status_code == 200
    assert seen == {
        "data": True,
        "judgment": True,
        "judgment_internal": False,
        "law": True,
        "schema": True,
    }


def test_demo_data_routes_do_not_touch_primary_session(
    demo_client, monkeypatch
) -> None:
    import importlib
    from types import SimpleNamespace

    app_module = importlib.import_module("judgment.web.app")
    client, app = demo_client
    working = app.state.session_factory
    with working() as session:
        version = LawDatasetVersion(
            source_type="law",
            source_url="https://example.test/law",
            update_date="20261122",
            version_code="202611220002",
            content_sha256="d" * 64,
            raw_json_sha256="e" * 64,
            zip_sha256="f" * 64,
            zip_path="/tmp/demo.zip",
            parquet_path="/tmp/demo.parquet",
            law_count=1,
            article_count=1,
            is_current=True,
        )
        session.add(version)
        session.flush()
        session.add(
            LawDocument(
                source_type="law",
                law_key="DEMO-LAW-1",
                law_name="示範銀行法",
                law_level="法律",
                law_category="金融",
                law_url="https://example.test/law/1",
                law_modified_date="20261122",
                article_count=1,
                content_hash="a" * 64,
                first_seen_version_id=version.id,
                last_seen_version_id=version.id,
                is_current=True,
            )
        )
        session.add(
            JudgmentDocument(
                jid="DEMO,115,金訴,1,20260110,1",
                jyear="115",
                jcase="金訴",
                jno="1",
                jdate="20260110",
                court="臺灣臺北地方法院",
                court_normalized="臺灣臺北地方法院",
                title="示範判決",
                full_text="示範判決全文",
                pdf_url="https://example.test/demo.pdf",
                source_archive="202601.rar",
                content_hash="b" * 64,
                matched_laws=["示範銀行法"],
                matched_laws_text="示範銀行法",
                citations=[],
                citation_count=0,
                full_text_length=6,
                is_current=True,
            )
        )
        session.commit()

    app.state.demo_query_session_factory = working
    monkeypatch.setattr(
        app_module,
        "load_demo_state",
        lambda *_args, **_kwargs: SimpleNamespace(
            active=True, features=ALL_FEATURES
        ),
    )
    monkeypatch.setattr(
        app_module,
        "load_demo_usage",
        lambda *_args, **_kwargs: {"tokens": 0, "requests": 0},
    )
    monkeypatch.setattr(
        app_module,
        "runtime_settings",
        lambda settings, *_args, **_kwargs: settings,
    )

    def poison(*_args, **_kwargs):
        raise RuntimeError("primary session must not be used for demo data")

    app.state.session_factory = poison

    assert client.get(
        "/api/data/suggest", params={"kind": "law", "query": "示範"}
    ).status_code == 200
    assert client.get(
        "/api/law", params={"law_key": "DEMO-LAW-1"}
    ).status_code == 200
    assert client.get(
        "/api/judgment", params={"jid": "DEMO,115,金訴,1,20260110,1"}
    ).status_code == 200
    assert client.get(
        "/api/schema/suggest",
        params={
            "database": "postgres",
            "table": "law_documents",
            "column": "law_name",
        },
    ).status_code == 200
    assert client.post(
        "/api/query",
        json={
            "database": "postgres",
            "filters": {"table": "law_documents"},
            "page_size": 1,
        },
    ).status_code == 200


def test_demo_route_feature_mapping_is_explicit() -> None:
    from judgment.web.route_policy import demo_feature_for, load_demo_policies

    mapping = load_demo_policies()
    assert mapping["GET /api/status"] == "status"
    assert mapping["GET /api/processing"] == "processing"
    assert mapping["POST /api/rag/query"] == "rag"
    assert mapping["POST /api/rag/feedback"] == "rag"
    assert mapping["POST /api/rag/share"] == "rag"
    assert mapping["GET /api/rag/share/{share_id}"] == "rag"
    assert mapping["POST /api/query"] == "data"
    assert demo_feature_for("GET", "/api/status") == "status"
    assert demo_feature_for("GET", "/api/processing") == "processing"
    assert demo_feature_for("GET", "/api/quality") == "quality"
    assert demo_feature_for("GET", "/api/question-bank/items/abc") is None
    assert demo_feature_for("GET", "/api/judgment-download/status") is None
    assert demo_feature_for("GET", "/api/not-demo") is None


def test_demo_visible_routes_are_explicitly_allowlisted() -> None:
    from judgment.web.route_policy import load_demo_policies

    assert set(load_demo_policies()) == {
        "GET /api/catalog",
        "GET /api/data/suggest",
        "GET /api/demo/processing",
        "GET /api/demo/quality",
        "GET /api/home",
        "GET /api/judgment",
        "GET /api/law",
        "GET /api/performance",
        "GET /api/processing",
        "GET /api/quality",
        "GET /api/schema/suggest",
        "GET /api/rag/share/{share_id}",
        "GET /api/status",
        "POST /api/query",
        "POST /api/rag/feedback",
        "POST /api/rag/query",
        "POST /api/rag/query/stream",
        "POST /api/rag/share",
    }


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
    assert "展示已開啟，但 RAG 未勾選" in admin.text
    assert "demo-feature-all" in admin.text
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
    assert "sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)" in api_js.text
    assert "localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)" in api_js.text

    auth_js = client.get("/assets/js/auth.js")
    assert auth_js.status_code == 200
    assert 'setAdminToken("")' in auth_js.text
    assert "<span>Login</span>" in auth_js.text
    assert "Demo" in auth_js.text
    assert '"Admin"' in auth_js.text
    assert "auth-demo" in auth_js.text
    assert 'import { demoActive } from "./demo.js"' in auth_js.text

    app_js = client.get("/assets/js/app.js")
    assert app_js.status_code == 200
    assert 'route !== "home"' in app_js.text
    assert "renderDemoClosed" in app_js.text

    home_js = client.get("/assets/js/pages/home.js")
    assert home_js.status_code == 200
    assert "ragLocked" in home_js.text
    assert "展示目前未開放，RAG 提問已鎖定" in home_js.text
    assert "RAG 提問目前未開放展示" in home_js.text

    rag_js = client.get("/assets/js/pages/rag.js")
    assert rag_js.status_code == 200
    assert "請勿輸入個人資料" in rag_js.text

    css = client.get("/assets/styles.css")
    assert css.status_code == 200
    assert ".demo-banner" in css.text
    assert ".demo-switch" in css.text
    assert ".demo-switch input:checked + span" in css.text
    assert ".btn-success" in css.text
    assert "body.is-demo-visitor" in css.text
    assert ".home-ask.is-locked" in css.text
    assert ".auth-avatar-demo" in css.text
    assert "color: var(--ink)" in css.text


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


def test_sanitize_rag_result_keeps_public_decisions_without_internals() -> None:
    result = {
        "status": "operational",
        "answer_source": "llm",
        "retrieval": {
            "collection": "judgments_v005",
            "url": "http://internal:6333",
            "hits": 3,
        },
        "llm_model": "internal-model",
        "embedding_model": "internal-embed",
        "pipeline_flow": {
            "version": 1,
            "decision_version": 1,
            "total_ms": 120,
            "status": "success",
            "metadata": {
                "rag_status": "operational",
                "rag_response": {
                    "status": "operational",
                    "answer_source": "llm",
                    "citation_count": 2,
                    "duration_ms": 120,
                    "judgment_candidates": ["SECRET,2"],
                    "reference_judgments": [{"jid": "SECRET,3"}],
                },
            },
            "segments": [
                {
                    "seq": 1,
                    "name": "rag.qdrant_search",
                    "offset_ms": 10,
                    "duration_ms": 20,
                    "end_offset_ms": 30,
                    "status": "ok",
                    "params": {
                        "collection": "judgments_v005",
                        "url": "http://internal:6333",
                    },
                    "metadata": {
                        "hits": 3,
                        "collection": "judgments_v005",
                        "base_url": "http://internal:6333",
                    },
                }
            ],
            "decisions": [
                {
                    "id": "parse.query",
                    "stage": "parsing",
                    "question": "日期語意？",
                    "method": "query_parser.parse_judgment_query",
                    "selected": "relative_range",
                    "duration_ms": 0.4,
                    "opaque": False,
                    "options": [
                        {
                            "id": "relative_range",
                            "label": "相對日期",
                            "selected": True,
                            "evaluated": True,
                            "reason": "近二年",
                        }
                    ],
                    "result": {
                        "date_from": "2024-11-23",
                        "positive_jids": ["SECRET,1"],
                        "collection": "judgments_v005",
                    },
                }
            ],
        },
    }
    cleaned = sanitize_rag_result(result)
    serialized = json.dumps(cleaned, ensure_ascii=False)
    assert "judgments_v005" not in serialized
    assert "internal:6333" not in serialized
    assert "SECRET,1" not in serialized
    assert "SECRET,2" not in serialized
    assert "SECRET,3" not in serialized
    assert "internal-model" not in serialized
    assert "internal-embed" not in serialized
    flow = cleaned["pipeline_flow"]
    assert flow["decisions"][0]["selected"] == "relative_range"
    assert flow["decisions"][0]["result"] == {"date_from": "2024-11-23"}
    assert flow["segments"][0]["metadata"] == {"hits": 3}
    assert "params" not in flow["segments"][0]
    assert cleaned["retrieval"]["collection"] == ""
    assert cleaned["retrieval"]["url"] == ""
