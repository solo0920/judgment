from __future__ import annotations

import ipaddress

from fastapi import Request


def effective_client_ip(request: Request) -> str:
    """Return the client IP already resolved by uvicorn's proxy handling.

    ``judgment-web`` starts uvicorn with ``proxy_headers=True`` and
    ``forwarded_allow_ips=127.0.0.1``, and the production app binds only
    ``127.0.0.1``.  cloudflared connects from loopback and supplies the
    forwarding headers, so uvicorn rewrites ``request.client.host`` to the
    real client address before middleware runs.

    Do not parse ``CF-Connecting-IP`` or ``X-Forwarded-For`` again here: that
    would create a second trust boundary and make spoofing possible if the
    bind address or forwarded-allow setting changes.
    """

    host = str(getattr(request.client, "host", "") or "").strip()
    return host or "unknown"


def client_ip_key(value: str) -> str:
    """Return a stable rate-limit bucket key.

    IPv6 clients normally control a whole /64, so counting individual
    addresses would let them rotate addresses trivially.
    """

    raw = str(value or "").strip()
    try:
        address = ipaddress.ip_address(raw)
    except ValueError:
        return raw or "unknown"
    if isinstance(address, ipaddress.IPv6Address):
        network = ipaddress.IPv6Network((address, 64), strict=False)
        return str(network.network_address)
    return str(address)
