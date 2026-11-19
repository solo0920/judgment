from __future__ import annotations

from starlette.requests import Request

from judgment.web.client_ip import (
    client_ip_key,
    effective_client_ip,
    hashed_client_ip_key,
    suspicious_proxy_chain,
)


def _request(client, headers=None):
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "https",
            "path": "/",
            "raw_path": b"/",
            "query_string": b"",
            "headers": list(headers or []),
            "client": client,
            "server": ("testserver", 443),
        }
    )


def test_effective_client_ip_uses_uvicorn_client_host() -> None:
    request = _request(("203.0.113.9", 12345))
    assert effective_client_ip(request) == "203.0.113.9"


def test_effective_client_ip_handles_missing_client() -> None:
    assert effective_client_ip(_request(None)) == "unknown"


def test_client_ip_key_groups_ipv6_by_64() -> None:
    assert (
        client_ip_key("2001:b400:ea90:3b07:7c5c:a4cb:cb3d:2cb4")
        == "2001:b400:ea90:3b07::"
    )
    assert (
        client_ip_key("2001:b400:ea90:3b07::1")
        == "2001:b400:ea90:3b07::"
    )
    assert (
        client_ip_key("2001:b400:ea90:3b08::1")
        == "2001:b400:ea90:3b08::"
    )


def test_client_ip_key_keeps_ipv4_and_invalid_values() -> None:
    assert client_ip_key("203.0.113.9") == "203.0.113.9"
    assert client_ip_key("not-an-ip") == "not-an-ip"
    assert client_ip_key("") == "unknown"


def test_client_ip_key_normalizes_ipv4_mapped_ipv6() -> None:
    assert client_ip_key("::ffff:203.0.113.9") == "203.0.113.9"


def test_hashed_client_ip_key_is_keyed_and_deterministic() -> None:
    first = hashed_client_ip_key("203.0.113.9", "secret-a")
    assert first == hashed_client_ip_key("203.0.113.9", "secret-a")
    assert first != hashed_client_ip_key("203.0.113.9", "secret-b")
    assert first != hashed_client_ip_key("203.0.113.10", "secret-a")


def test_hashed_client_ip_key_requires_secret() -> None:
    try:
        hashed_client_ip_key("203.0.113.9", "")
    except ValueError as exc:
        assert "secret" in str(exc)
    else:
        raise AssertionError("empty secret must be rejected")


def test_suspicious_proxy_chain_flags_loopback_with_cloudflare_marker() -> None:
    assert suspicious_proxy_chain(
        _request(("127.0.0.1", 12345), [(b"cf-ray", b"abc-HKG")]),
        "127.0.0.1",
    )
    assert not suspicious_proxy_chain(
        _request(("127.0.0.1", 12345)),
        "127.0.0.1",
    )
    assert not suspicious_proxy_chain(
        _request(("203.0.113.9", 12345), [(b"cf-ray", b"abc-HKG")]),
        "203.0.113.9",
    )
