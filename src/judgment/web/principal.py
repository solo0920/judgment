from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping

ANONYMOUS = "anonymous"
PENDING = "pending"
USER = "user"
ADMIN = "admin"
ADMIN_TOKEN = "admin_token"

AUTHENTICATED_KINDS = frozenset({PENDING, USER, ADMIN, ADMIN_TOKEN})
ADMIN_KINDS = frozenset({ADMIN, ADMIN_TOKEN})

POLICY_ALLOWED_KINDS = {
    "PUBLIC_READ": frozenset({ANONYMOUS, PENDING, USER, ADMIN, ADMIN_TOKEN}),
    "PUBLIC_QUERY": frozenset(
        {ANONYMOUS, PENDING, USER, ADMIN, ADMIN_TOKEN}
    ),
    "PUBLIC_AUTH": frozenset({ANONYMOUS, PENDING, USER, ADMIN, ADMIN_TOKEN}),
    "AUTH_ONLY": AUTHENTICATED_KINDS,
    "AUTH_READ": frozenset({USER, ADMIN, ADMIN_TOKEN}),
    "AUTH_QUERY": frozenset({USER, ADMIN, ADMIN_TOKEN}),
    "SELF_WRITE": frozenset({USER, ADMIN, ADMIN_TOKEN}),
    "ADMIN_ONLY": ADMIN_KINDS,
    "ADMIN_WRITE": ADMIN_KINDS,
}


@dataclass(frozen=True)
class Principal:
    kind: str = ANONYMOUS
    user_id: str = ""
    email: str = ""
    name: str = ""
    role: str = ""
    status: str = ""
    source: str = "anonymous"

    @property
    def is_authenticated(self) -> bool:
        return self.kind != ANONYMOUS

    @property
    def is_admin(self) -> bool:
        return self.kind in ADMIN_KINDS


def anonymous_principal() -> Principal:
    return Principal()


def admin_token_principal() -> Principal:
    return Principal(
        kind=ADMIN_TOKEN,
        user_id="admin-token",
        role="admin",
        status="active",
        source="admin_token",
    )


def local_admin_principal() -> Principal:
    return Principal(
        kind=ADMIN,
        user_id="local-admin",
        role="admin",
        status="active",
        source="local_bypass",
    )


def principal_from_session(session: Mapping[str, Any]) -> Principal:
    """Map a verified Google session to a principal.

    Until ``app_users`` exists, a Google session without an explicit role is
    treated as an active admin, preserving the current single-admin behavior.
    ``app_users`` will supply role/status later without changing the shape of
    the middleware.
    """

    role = str(session.get("role") or "admin").strip().lower()
    status = str(session.get("status") or "active").strip().lower()
    if status == PENDING:
        kind = PENDING
    elif status == "active" and role == "admin":
        kind = ADMIN
    elif status == "active" and role == "user":
        kind = USER
    elif status == "active":
        # Unknown active role: require review, do not grant read access.
        kind = PENDING
    else:
        kind = ANONYMOUS
    return Principal(
        kind=kind,
        user_id=str(session.get("sub") or ""),
        email=str(session.get("email") or "").strip().lower(),
        name=str(session.get("name") or ""),
        role=role,
        status=status,
        source="google",
    )


def principal_allows(
    policy: str,
    kind: str,
    *,
    public_rag_enabled: bool = False,
) -> bool:
    """Return whether a principal kind may use a route policy.

    ``PUBLIC_QUERY`` is intentionally gated by a separate kill switch so the
    route table cannot open anonymous RAG before throttling and budgets exist.
    """

    if policy == "PUBLIC_QUERY" and not public_rag_enabled:
        return kind in ADMIN_KINDS
    return kind in POLICY_ALLOWED_KINDS.get(policy, frozenset())
