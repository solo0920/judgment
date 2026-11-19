from __future__ import annotations

import os

LOOPBACK_HOSTS = frozenset({"127.0.0.1", "::1", "localhost"})


def _env_flag(name: str) -> bool:
    return str(os.getenv(name, "") or "").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def validate_forwarded_allow_ips(value: str) -> None:
    entries = {
        part.strip()
        for part in str(value or "").split(",")
        if part.strip()
    }
    if "*" in entries:
        raise RuntimeError(
            "FORWARDED_ALLOW_IPS must not contain '*': it would trust "
            "client-supplied X-Forwarded-For headers. Use 127.0.0.1 behind "
            "the local tunnel."
        )


def validate_runtime_security(
    *,
    host: str,
    forwarded_allow_ips: str,
    allow_local_admin_bypass: bool,
) -> None:
    """Fail closed when the proxy/IP trust boundary is unsafe."""

    bind_host = str(host or "").strip().lower()
    validate_forwarded_allow_ips(forwarded_allow_ips)

    allow_public_bind = _env_flag("JUDGMENT_ALLOW_PUBLIC_BIND")
    if bind_host not in LOOPBACK_HOSTS and not allow_public_bind:
        raise RuntimeError(
            f"refusing non-loopback bind {host!r}; bind 127.0.0.1 and use "
            "the Cloudflare tunnel. Set JUDGMENT_ALLOW_PUBLIC_BIND=1 only for "
            "an explicit development exception."
        )
    if allow_local_admin_bypass and bind_host not in LOOPBACK_HOSTS:
        raise RuntimeError(
            "JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=1 requires a loopback bind; "
            "refusing to expose a local admin bypass on a public interface."
        )
