from __future__ import annotations

import hashlib
import hmac
import ipaddress

from fastapi import Request

LOOPBACK_IPS = frozenset({"127.0.0.1", "::1"})


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
        if address.ipv4_mapped is not None:
            return str(address.ipv4_mapped)
        network = ipaddress.IPv6Network((address, 64), strict=False)
        return str(network.network_address)
    return str(address)


def hashed_client_ip_key(value: str, secret: str) -> str:
    """Pseudonymize a rate-limit bucket with a keyed HMAC.

    A plain hash of an IPv4 address is reversible by enumeration; a keyed HMAC
    is not useful without the server secret.  This is still pseudonymization,
    not anonymization, and must be described honestly in the privacy notice.
    """

    key = str(secret or "").strip()
    if not key:
        raise ValueError("client IP hashing requires a non-empty secret")
    normalized = client_ip_key(value)
    return hmac.new(
        key.encode("utf-8"),
        normalized.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def suspicious_proxy_chain(request: Request, effective_ip: str) -> bool:
    """Detect a Cloudflare request that fell back to a loopback client IP.

    ``CF-Ray`` is not a visitor-IP header, so it can remain even when a
    Cloudflare Managed Transform removes X-Forwarded-For and CF-Connecting-IP.
    A loopback effective IP plus a Cloudflare marker means the header chain is
    broken and rate limiting would put every visitor in one bucket.
    """

    host = str(effective_ip or "").strip().lower()
    if host not in LOOPBACK_IPS:
        return False
    return any(
        str(request.headers.get(name) or "").strip()
        for name in ("cf-ray", "cf-connecting-ip", "x-forwarded-for")
    )
