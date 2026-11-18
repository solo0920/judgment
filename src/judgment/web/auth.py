from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import secrets
import time
from typing import Any, Dict, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx
from fastapi import Request
from fastapi.responses import RedirectResponse, Response

from ..config import Settings

logger = logging.getLogger(__name__)

SESSION_COOKIE = "judgment_session"
OAUTH_STATE_COOKIE = "judgment_oauth_state"
OAUTH_STATE_TTL_SECONDS = 600
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPE = "openid email profile"


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64decode(value: str) -> bytes:
    padded = value + ("=" * (-len(value) % 4))
    return base64.urlsafe_b64decode(padded.encode("ascii"))


def session_secret(settings: Settings) -> str:
    return str(settings.auth_session_secret or settings.admin_token or "").strip()


def google_login_enabled(settings: Settings) -> bool:
    return bool(
        settings.google_oauth_client_id
        and settings.google_oauth_client_secret
        and session_secret(settings)
    )


def allowed_email(email: str, settings: Settings) -> bool:
    normalized = str(email or "").strip().lower()
    allowed = {
        str(value).strip().lower()
        for value in settings.google_allowed_emails
        if str(value).strip()
    }
    return bool(normalized and normalized in allowed)


def _sign(payload: bytes, secret: str) -> str:
    return _b64encode(
        hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).digest()
    )


def make_signed_token(
    payload: Dict[str, Any], secret: str, ttl_seconds: int
) -> str:
    if not secret:
        raise ValueError("session secret is not configured")
    now = int(time.time())
    data = dict(payload)
    data.setdefault("iat", now)
    data["exp"] = now + max(1, int(ttl_seconds))
    raw = json.dumps(
        data, ensure_ascii=False, separators=(",", ":"), sort_keys=True
    ).encode("utf-8")
    return f"{_b64encode(raw)}.{_sign(raw, secret)}"


def verify_signed_token(token: str, secret: str) -> Optional[Dict[str, Any]]:
    if not token or not secret:
        return None
    try:
        body, signature = str(token).split(".", 1)
        raw = _b64decode(body)
        expected = _sign(raw, secret)
        if not hmac.compare_digest(signature, expected):
            return None
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            return None
        expires = int(data.get("exp") or 0)
        if expires <= int(time.time()):
            return None
        return data
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def make_session_token(user: Dict[str, Any], settings: Settings) -> str:
    return make_signed_token(
        {
            "purpose": "session",
            "sub": str(user.get("sub") or ""),
            "email": str(user.get("email") or "").strip().lower(),
            "name": str(user.get("name") or ""),
            "picture": str(user.get("picture") or ""),
        },
        session_secret(settings),
        settings.auth_session_ttl_seconds,
    )


def read_session(
    request: Request, settings: Settings
) -> Optional[Dict[str, Any]]:
    data = verify_signed_token(
        str(request.cookies.get(SESSION_COOKIE) or ""),
        session_secret(settings),
    )
    if not data or data.get("purpose") != "session":
        return None
    email = str(data.get("email") or "").strip().lower()
    if not allowed_email(email, settings):
        return None
    data["email"] = email
    return data


def make_oauth_state_token(state: str, next_url: str, settings: Settings) -> str:
    return make_signed_token(
        {
            "purpose": "google_oauth",
            "state": state,
            "next": next_url,
        },
        session_secret(settings),
        OAUTH_STATE_TTL_SECONDS,
    )


def read_oauth_state(
    request: Request, settings: Settings
) -> Optional[Dict[str, Any]]:
    data = verify_signed_token(
        str(request.cookies.get(OAUTH_STATE_COOKIE) or ""),
        session_secret(settings),
    )
    if not data or data.get("purpose") != "google_oauth":
        return None
    return data


def cookie_secure(request: Request, settings: Settings) -> bool:
    mode = str(settings.auth_cookie_secure or "auto").strip().lower()
    if mode in {"1", "true", "yes", "on", "always"}:
        return True
    if mode in {"0", "false", "no", "off", "never"}:
        return False
    forwarded = (
        str(request.headers.get("x-forwarded-proto") or "")
        .split(",", 1)[0]
        .strip()
        .lower()
    )
    return request.url.scheme == "https" or forwarded == "https"


def cookie_samesite(settings: Settings) -> str:
    value = str(settings.auth_cookie_samesite or "lax").strip().lower()
    return value if value in {"lax", "strict", "none"} else "lax"


def set_session_cookie(
    response: Response, request: Request, settings: Settings, token: str
) -> None:
    samesite = cookie_samesite(settings)
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=max(1, int(settings.auth_session_ttl_seconds)),
        httponly=True,
        secure=cookie_secure(request, settings) or samesite == "none",
        samesite=samesite,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/")


def set_oauth_state_cookie(
    response: Response, request: Request, settings: Settings, token: str
) -> None:
    # The callback is a cross-site top-level GET from Google.  Lax is required
    # for the state cookie to be sent; Strict would break the OAuth flow.
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        token,
        max_age=OAUTH_STATE_TTL_SECONDS,
        httponly=True,
        secure=cookie_secure(request, settings),
        samesite="lax",
        path="/",
    )


def clear_oauth_state_cookie(response: Response) -> None:
    response.delete_cookie(OAUTH_STATE_COOKIE, path="/")


def google_redirect_uri(request: Request, settings: Settings) -> str:
    configured = str(settings.google_oauth_redirect_uri or "").strip()
    if configured:
        return configured
    return str(request.url_for("google_callback"))


def build_google_authorization_url(
    *, client_id: str, redirect_uri: str, state: str
) -> str:
    query = urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": GOOGLE_SCOPE,
            "state": state,
            "access_type": "online",
            "include_granted_scopes": "true",
            "prompt": "select_account",
        }
    )
    return f"{GOOGLE_AUTH_URL}?{query}"


async def exchange_google_code(
    *,
    code: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str,
) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        token_response.raise_for_status()
        token_payload = token_response.json()
        access_token = str(token_payload.get("access_token") or "")
        if not access_token:
            raise ValueError("Google token response did not contain access_token")
        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_response.raise_for_status()
        user = user_response.json()
        if not isinstance(user, dict):
            raise ValueError("Google userinfo response was not an object")
        return user


def email_verified(user: Dict[str, Any]) -> bool:
    value = user.get("email_verified")
    if isinstance(value, bool):
        return value
    return str(value or "").strip().lower() in {"1", "true", "yes"}


def _request_origins(request: Request, settings: Settings) -> set[str]:
    origins = {
        str(origin).strip().rstrip("/")
        for origin in settings.cors_allow_origins
        if str(origin).strip()
    }
    scheme = (
        str(request.headers.get("x-forwarded-proto") or "")
        .split(",", 1)[0]
        .strip()
        .lower()
        or request.url.scheme
    )
    origins.add(f"{scheme}://{request.url.netloc}".rstrip("/"))
    return origins


def safe_next_url(raw: Any, request: Request, settings: Settings) -> str:
    value = str(raw or "").strip()
    if not value:
        return "/"
    if value.startswith("/") and not value.startswith("//"):
        return value
    try:
        parts = urlsplit(value)
    except ValueError:
        return "/"
    if parts.scheme not in {"http", "https"} or not parts.netloc:
        return "/"
    origin = f"{parts.scheme}://{parts.netloc}".rstrip("/")
    if origin not in _request_origins(request, settings):
        return "/"
    return value


def origin_allowed(
    request: Request, settings: Settings, cors_origins: tuple[str, ...]
) -> bool:
    origin = request.headers.get("Origin")
    if origin is None:
        return True
    if origin == "null":
        return False
    normalized = origin.rstrip("/")
    allowed = {
        str(value).strip().rstrip("/")
        for value in cors_origins
        if str(value).strip()
    }
    allowed |= _request_origins(request, settings)
    return normalized in allowed


def redirect_with_auth(target: str, *, ok: bool = False, error: str = "") -> RedirectResponse:
    try:
        parts = urlsplit(target or "/")
    except ValueError:
        parts = urlsplit("/")
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key not in {"auth", "auth_error"}
    ]
    if ok:
        query.append(("auth", "ok"))
    elif error:
        query.append(("auth_error", error))
    location = urlunsplit(
        (
            parts.scheme,
            parts.netloc,
            parts.path or "/",
            urlencode(query),
            parts.fragment,
        )
    )
    return RedirectResponse(location, status_code=302)


def new_oauth_state() -> str:
    return secrets.token_urlsafe(32)
