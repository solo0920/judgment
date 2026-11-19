from __future__ import annotations

import pytest

from judgment.web.runtime_security import (
    server_bind_allowed,
    validate_forwarded_allow_ips,
    validate_runtime_security,
)


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
