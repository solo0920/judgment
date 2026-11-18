from __future__ import annotations

from pathlib import Path

import pytest

from judgment.config import Settings
from starlette.requests import Request

from judgment.web.auth import (
    allowed_email,
    cookie_secure,
    google_login_enabled,
    make_session_token,
    make_signed_token,
    request_samesite,
    session_secret,
    verify_signed_token,
)


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("/tmp/judgment-laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
        "auth_session_secret": "unit-test-secret",
    }
    values.update(overrides)
    return Settings(**values)


def test_signed_token_round_trip_and_tamper_rejected() -> None:
    token = make_signed_token({"email": "admin@example.com"}, "secret", 60)
    assert verify_signed_token(token, "secret")["email"] == "admin@example.com"
    assert verify_signed_token(token + "x", "secret") is None
    assert verify_signed_token(token, "other-secret") is None


def test_signed_token_expiry(monkeypatch) -> None:
    monkeypatch.setattr("judgment.web.auth.time.time", lambda: 1000)
    token = make_signed_token({"email": "admin@example.com"}, "secret", 10)
    monkeypatch.setattr("judgment.web.auth.time.time", lambda: 1011)
    assert verify_signed_token(token, "secret") is None


def test_google_login_requires_client_and_session_secret() -> None:
    assert google_login_enabled(_settings()) is False
    settings = _settings(
        google_oauth_client_id="client",
        google_oauth_client_secret="secret",
        auth_session_secret="",
        admin_token="",
    )
    assert session_secret(settings) == ""
    assert google_login_enabled(settings) is False
    settings = _settings(
        google_oauth_client_id="client",
        google_oauth_client_secret="secret",
    )
    assert google_login_enabled(settings) is True


def test_session_secret_falls_back_to_admin_token() -> None:
    settings = _settings(auth_session_secret="", admin_token="admin-secret")
    assert session_secret(settings) == "admin-secret"


def test_allowed_email_is_case_insensitive() -> None:
    settings = _settings(google_allowed_emails=("Solo4Study@Gmail.com",))
    assert allowed_email("solo4study@gmail.com", settings) is True
    assert allowed_email("other@gmail.com", settings) is False


def test_make_session_token_requires_secret() -> None:
    settings = _settings(auth_session_secret="", admin_token="")
    with pytest.raises(ValueError):
        make_session_token({"email": "admin@example.com"}, settings)


def _request(host: str, scheme: str = "http") -> Request:
    return Request(
        {
            "type": "http",
            "scheme": scheme,
            "server": (host, 9200),
            "client": ("127.0.0.1", 12345),
            "path": "/",
            "query_string": b"",
            "headers": [(b"host", f"{host}:9200".encode())],
        }
    )


def test_local_http_uses_lax_non_secure_cookie_despite_production_config() -> None:
    settings = _settings(
        auth_cookie_samesite="none",
        auth_cookie_secure="true",
    )
    local = _request("127.0.0.1")
    assert request_samesite(local, settings) == "lax"
    assert cookie_secure(local, settings) is False


def test_external_https_honors_production_cookie_config() -> None:
    settings = _settings(
        auth_cookie_samesite="none",
        auth_cookie_secure="true",
    )
    external = _request("api-mbp.ragdemo.win", scheme="https")
    assert request_samesite(external, settings) == "none"
    assert cookie_secure(external, settings) is True
