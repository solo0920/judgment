from __future__ import annotations

import hmac
import os

LOOPBACK_HOSTS = frozenset(
    {"127.0.0.1", "::1", "localhost", "testserver"}
)


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


def server_bind_allowed(host: str) -> bool:
    """Fail closed when a server reports a non-loopback bind.

    This is a request-time guard for launch paths that bypass ``judgment-web``
    (direct uvicorn or a container entrypoint).  It cannot replace the CLI
    startup check, but it prevents accidentally serving API traffic from a
    publicly bound socket.
    """

    value = str(host or "").strip().lower()
    if not value:
        return True
    return value in LOOPBACK_HOSTS or _env_flag("JUDGMENT_ALLOW_PUBLIC_BIND")


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


def validate_auth_security(settings) -> None:
    """Reject production Google login with a blank or reused session secret."""

    if not (
        str(getattr(settings, "google_oauth_client_id", "") or "").strip()
        and str(getattr(settings, "google_oauth_client_secret", "") or "").strip()
    ):
        return
    redirect_uri = str(
        getattr(settings, "google_oauth_redirect_uri", "") or ""
    ).strip().lower()
    production = (
        str(getattr(settings, "auth_cookie_secure", "") or "").strip().lower()
        == "true"
        or redirect_uri.startswith("https://")
    )
    if not production:
        return
    secret = str(getattr(settings, "auth_session_secret", "") or "").strip()
    admin_token = str(getattr(settings, "admin_token", "") or "").strip()
    if not secret:
        raise RuntimeError(
            "AUTH_SESSION_SECRET must be explicitly set in production; "
            "refusing to fall back to JUDGMENT_ADMIN_TOKEN."
        )
    if len(secret) < 32:
        raise RuntimeError(
            "AUTH_SESSION_SECRET must be at least 32 characters in production."
        )
    if admin_token and hmac.compare_digest(secret, admin_token):
        raise RuntimeError(
            "AUTH_SESSION_SECRET must differ from JUDGMENT_ADMIN_TOKEN."
        )
