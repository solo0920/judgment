from __future__ import annotations

from starlette.requests import Request

from judgment.web.client_ip import client_ip_key, effective_client_ip


def _request(client):
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "https",
            "path": "/",
            "raw_path": b"/",
            "query_string": b"",
            "headers": [],
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
