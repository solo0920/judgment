from __future__ import annotations

import socket

import pytest

_REAL_GETADDRINFO = socket.getaddrinfo


@pytest.fixture(autouse=True)
def _fast_test_dns(monkeypatch):
    """Resolve fake ``.test`` hostnames locally.

    The Ollama SSRF guard resolves hostnames with ``socket.getaddrinfo``.
    On macOS an unresolvable ``.test`` name can block for 30 seconds in the
    system resolver, so tests that use allowlisted fake hosts would spend
    minutes waiting for DNS.  Only ``.test`` names are short-circuited;
    IP literals and real hostnames still use the system resolver.
    """

    def fake_getaddrinfo(host, port, *args, **kwargs):
        if str(host).endswith(".test"):
            return [
                (
                    socket.AF_INET,
                    socket.SOCK_STREAM,
                    socket.IPPROTO_TCP,
                    "",
                    ("127.0.0.1", int(port or 80)),
                )
            ]
        return _REAL_GETADDRINFO(host, port, *args, **kwargs)

    monkeypatch.setattr(socket, "getaddrinfo", fake_getaddrinfo)
