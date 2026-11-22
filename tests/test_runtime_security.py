from __future__ import annotations

from pathlib import Path

import pytest

from judgment.config import Settings
from judgment.web.runtime_security import (
    server_bind_allowed,
    validate_auth_security,
    validate_forwarded_allow_ips,
    validate_runtime_security,
)


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("/tmp/judgment-laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
        "google_oauth_client_id": "client-id",
        "google_oauth_client_secret": "client-secret",
        "google_oauth_redirect_uri": "https://api.example.test/callback",
        "auth_cookie_secure": "true",
        "auth_session_secret": "s" * 40,
        "admin_token": "a" * 40,
    }
    values.update(overrides)
    return Settings(**values)


def test_runtime_security_accepts_loopback_tunnel_configuration() -> None:
    validate_runtime_security(
        host="127.0.0.1",
        forwarded_allow_ips="127.0.0.1",
        allow_local_admin_bypass=False,
    )


def test_runtime_security_rejects_public_bind_by_default(monkeypatch) -> None:
    monkeypatch.delenv("JUDGMENT_ALLOW_PUBLIC_BIND", raising=False)
    with pytest.raises(RuntimeError, match="non-loopback bind"):
        validate_runtime_security(
            host="0.0.0.0",
            forwarded_allow_ips="127.0.0.1",
            allow_local_admin_bypass=False,
        )


def test_runtime_security_allows_explicit_public_bind_exception(monkeypatch) -> None:
    monkeypatch.setenv("JUDGMENT_ALLOW_PUBLIC_BIND", "1")
    validate_runtime_security(
        host="0.0.0.0",
        forwarded_allow_ips="127.0.0.1",
        allow_local_admin_bypass=False,
    )


@pytest.mark.parametrize("value", ["*", "127.0.0.1,*", "*,10.0.0.1"])
def test_runtime_security_rejects_wildcard_forwarded_ips(value: str) -> None:
    with pytest.raises(RuntimeError, match="must not contain"):
        validate_forwarded_allow_ips(value)


def test_runtime_security_rejects_public_bind_with_local_bypass(monkeypatch) -> None:
    monkeypatch.setenv("JUDGMENT_ALLOW_PUBLIC_BIND", "1")
    with pytest.raises(RuntimeError, match="loopback bind"):
        validate_runtime_security(
            host="0.0.0.0",
            forwarded_allow_ips="127.0.0.1",
            allow_local_admin_bypass=True,
        )


@pytest.mark.parametrize(
    "host,expected",
    [
        ("127.0.0.1", True),
        ("::1", True),
        ("localhost", True),
        ("testserver", True),
        ("0.0.0.0", False),
        ("::", False),
        ("192.168.1.20", False),
        ("", True),
    ],
)
def test_server_bind_guard(host: str, expected: bool, monkeypatch) -> None:
    monkeypatch.delenv("JUDGMENT_ALLOW_PUBLIC_BIND", raising=False)
    assert server_bind_allowed(host) is expected


def test_server_bind_guard_explicit_override(monkeypatch) -> None:
    monkeypatch.setenv("JUDGMENT_ALLOW_PUBLIC_BIND", "1")
    assert server_bind_allowed("0.0.0.0") is True


def test_auth_security_accepts_explicit_production_secret() -> None:
    validate_auth_security(_settings())


def test_auth_security_rejects_blank_production_secret() -> None:
    with pytest.raises(RuntimeError, match="explicitly set"):
        validate_auth_security(_settings(auth_session_secret=""))


def test_auth_security_rejects_short_production_secret() -> None:
    with pytest.raises(RuntimeError, match="at least 32"):
        validate_auth_security(_settings(auth_session_secret="short"))


def test_auth_security_rejects_admin_token_reuse() -> None:
    with pytest.raises(RuntimeError, match="must differ"):
        validate_auth_security(
            _settings(auth_session_secret="a" * 40, admin_token="a" * 40)
        )


def test_auth_security_allows_local_fallback() -> None:
    validate_auth_security(
        _settings(
            auth_cookie_secure="auto",
            google_oauth_redirect_uri="http://127.0.0.1:9200/callback",
            auth_session_secret="",
            admin_token="a" * 40,
        )
    )


def test_auth_security_skips_when_google_is_disabled() -> None:
    validate_auth_security(
        _settings(
            google_oauth_client_id="",
            google_oauth_client_secret="",
            auth_session_secret="",
        )
    )
