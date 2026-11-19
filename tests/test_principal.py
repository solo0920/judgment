from __future__ import annotations

import pytest

from judgment.web.principal import (
    ADMIN,
    ADMIN_TOKEN,
    ANONYMOUS,
    PENDING,
    POLICY_ALLOWED_KINDS,
    USER,
    admin_token_principal,
    anonymous_principal,
    local_admin_principal,
    principal_allows,
    principal_from_session,
)

KINDS = (ANONYMOUS, PENDING, USER, ADMIN, ADMIN_TOKEN)

EXPECTED_ALLOWED = {
    "PUBLIC_READ": set(KINDS),
    "PUBLIC_AUTH": set(KINDS),
    "AUTH_ONLY": {PENDING, USER, ADMIN, ADMIN_TOKEN},
    "AUTH_READ": {USER, ADMIN, ADMIN_TOKEN},
    "AUTH_QUERY": {USER, ADMIN, ADMIN_TOKEN},
    "SELF_WRITE": {USER, ADMIN, ADMIN_TOKEN},
    "ADMIN_ONLY": {ADMIN, ADMIN_TOKEN},
    "ADMIN_WRITE": {ADMIN, ADMIN_TOKEN},
}

POLICY_CASES = [
    (policy, kind, kind in allowed)
    for policy, allowed in EXPECTED_ALLOWED.items()
    for kind in KINDS
]


@pytest.mark.parametrize("policy,kind,expected", POLICY_CASES)
def test_policy_role_matrix(policy: str, kind: str, expected: bool) -> None:
    assert principal_allows(policy, kind) is expected


@pytest.mark.parametrize("kind", KINDS)
def test_public_query_is_gated_by_kill_switch(kind: str) -> None:
    assert principal_allows(
        "PUBLIC_QUERY", kind, public_rag_enabled=True
    ) is (kind in POLICY_ALLOWED_KINDS["PUBLIC_QUERY"])
    assert principal_allows(
        "PUBLIC_QUERY", kind, public_rag_enabled=False
    ) is (kind in {ADMIN, ADMIN_TOKEN})


def test_unknown_policy_denies_every_kind() -> None:
    for kind in KINDS:
        assert principal_allows("UNKNOWN", kind) is False


def test_session_without_role_stays_admin_for_compatibility() -> None:
    principal = principal_from_session({"sub": "google-1", "email": "a@example.com"})
    assert principal.kind == ADMIN
    assert principal.role == "admin"
    assert principal.source == "google"


@pytest.mark.parametrize(
    "session,expected",
    [
        ({"role": "user", "status": "active"}, USER),
        ({"role": "user", "status": "pending"}, PENDING),
        ({"role": "admin", "status": "pending"}, PENDING),
        ({"role": "user", "status": "disabled"}, ANONYMOUS),
        ({"role": "unknown", "status": "active"}, PENDING),
    ],
)
def test_session_role_status_mapping(session, expected) -> None:
    assert principal_from_session(session).kind == expected


def test_builtin_principals() -> None:
    assert anonymous_principal().kind == ANONYMOUS
    assert admin_token_principal().kind == ADMIN_TOKEN
    assert admin_token_principal().is_admin is True
    assert local_admin_principal().kind == ADMIN
    assert local_admin_principal().source == "local_bypass"
