from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session, sessionmaker

from .models import AppSetting

TEST_MODE_KEY = "test_mode"
LLM_MODEL_PREFERENCE_KEY = "llm_model_preference"
REVOKED_SESSION_JTIS_KEY = "revoked_session_jtis"


def get_app_setting(
    session_factory: sessionmaker[Session],
    key: str,
    default: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    if session_factory is None:
        return dict(default or {})
    try:
        with session_factory() as session:
            record = session.get(AppSetting, key)
            if record is None or not isinstance(record.value, dict):
                return dict(default or {})
            return dict(record.value)
    except Exception:
        return dict(default or {})


def set_app_setting(
    session_factory: sessionmaker[Session],
    key: str,
    value: Dict[str, Any],
) -> Dict[str, Any]:
    if session_factory is None:
        return dict(value)
    now = datetime.now(timezone.utc)
    with session_factory() as session:
        record = session.get(AppSetting, key)
        if record is None:
            record = AppSetting(key=key, value=dict(value), updated_at=now)
            session.add(record)
        else:
            record.value = dict(value)
            record.updated_at = now
        session.commit()
    return dict(value)


def get_test_mode(session_factory: sessionmaker[Session]) -> bool:
    value = get_app_setting(session_factory, TEST_MODE_KEY, {"enabled": False})
    return bool(value.get("enabled"))


def set_test_mode(
    session_factory: sessionmaker[Session],
    enabled: bool,
) -> Dict[str, Any]:
    return set_app_setting(
        session_factory,
        TEST_MODE_KEY,
        {
            "enabled": bool(enabled),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )


def is_session_revoked(
    session_factory: sessionmaker[Session], jti: str
) -> bool:
    value = str(jti or "").strip()
    if not value:
        return False
    revoked = get_app_setting(session_factory, REVOKED_SESSION_JTIS_KEY, {})
    return value in revoked


def revoke_session(
    session_factory: sessionmaker[Session],
    jti: str,
    expires_at: int,
) -> None:
    value = str(jti or "").strip()
    if not value:
        return
    now = int(datetime.now(timezone.utc).timestamp())
    revoked = get_app_setting(session_factory, REVOKED_SESSION_JTIS_KEY, {})
    retained = {
        str(key): int(exp)
        for key, exp in revoked.items()
        if str(key) and isinstance(exp, (int, float)) and int(exp) > now
    }
    retained[value] = max(now + 1, int(expires_at or now + 1))
    set_app_setting(session_factory, REVOKED_SESSION_JTIS_KEY, retained)


def get_llm_model_preference(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    return get_app_setting(
        session_factory,
        LLM_MODEL_PREFERENCE_KEY,
        {},
    )


def set_llm_model_preference(
    session_factory: sessionmaker[Session],
    *,
    model: str,
    base_url: str,
) -> Dict[str, Any]:
    return set_app_setting(
        session_factory,
        LLM_MODEL_PREFERENCE_KEY,
        {
            "model": str(model or "").strip()[:200],
            "base_url": str(base_url or "").rstrip("/")[:300],
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
