from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Iterable, Mapping, Sequence

from starlette.routing import Mount, WebSocketRoute

ROUTE_POLICY_PATH = Path(__file__).with_name("route_policies.json")
DEFAULT_CATEGORY = "ADMIN_ONLY"
VALID_CATEGORIES = frozenset(
    {
        "PUBLIC_READ",
        "PUBLIC_QUERY",
        "PUBLIC_AUTH",
        "AUTH_READ",
        "AUTH_QUERY",
        "SELF_WRITE",
        "AUTH_ONLY",
        "ADMIN_ONLY",
        "ADMIN_WRITE",
    }
)


def route_key(method: str, path: str) -> str:
    return f"{str(method or '').upper()} {path}"


def load_route_policies(path: Path | None = None) -> Dict[str, str]:
    """Load the versioned route classification table.

    A missing or malformed table is a startup error: default-deny must not
    silently fall back to an allow rule when a new route is added.
    """

    table_path = path or ROUTE_POLICY_PATH
    try:
        raw = json.loads(table_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"route policy table is missing: {table_path}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"route policy table is not valid JSON: {table_path}"
        ) from exc

    routes = raw.get("routes") if isinstance(raw, dict) else None
    if not isinstance(routes, dict):
        raise RuntimeError(
            f"route policy table must contain a routes object: {table_path}"
        )

    policies: Dict[str, str] = {}
    for key, value in routes.items():
        if not isinstance(key, str) or " " not in key:
            raise RuntimeError(f"invalid route policy key: {key!r}")
        category = str(value or "").strip().upper()
        if category not in VALID_CATEGORIES:
            raise RuntimeError(
                f"invalid route category for {key}: {value!r}"
            )
        policies[key] = category
    return policies


@lru_cache(maxsize=1)
def cached_route_policies() -> Dict[str, str]:
    return load_route_policies()


def policy_for(
    method: str,
    path: str,
    policies: Mapping[str, str] | None = None,
) -> str:
    table = policies if policies is not None else cached_route_policies()
    return table.get(route_key(method, path), DEFAULT_CATEGORY)


def registered_route_keys(
    routes: Iterable[Any], prefix: str = ""
) -> list[str]:
    """Return every route entry that must have an explicit policy.

    Starlette ``Mount`` and ``WebSocketRoute`` are not ``APIRoute`` instances,
    so they need separate handling.  Mounted applications are expanded
    recursively with their mount path as a prefix.
    """

    keys: set[str] = set()
    for route in routes:
        path = f"{prefix}{str(getattr(route, 'path', '') or '')}"
        if not path:
            continue
        if isinstance(route, WebSocketRoute):
            keys.add(f"WS {path}")
            continue
        if isinstance(route, Mount):
            subroutes = getattr(route, "routes", None)
            if subroutes:
                keys.update(registered_route_keys(subroutes, path))
            else:
                keys.add(f"MOUNT {path}")
            continue
        methods = getattr(route, "methods", None)
        if methods:
            for method in methods:
                if method in {"HEAD", "OPTIONS"}:
                    continue
                keys.add(route_key(method, path))
        else:
            keys.add(f"MOUNT {path}")
    return sorted(keys)


def validate_route_policies(
    routes: Sequence[Any],
    policies: Mapping[str, str] | None = None,
) -> None:
    table = policies if policies is not None else cached_route_policies()
    registered = set(registered_route_keys(routes))
    missing = sorted(registered - set(table))
    stale = sorted(set(table) - registered)
    if missing:
        listed = "\n".join(f"- {key}" for key in missing)
        raise RuntimeError(
            "unclassified routes would be exposed; add them to "
            f"{ROUTE_POLICY_PATH.name} before starting the app:\n{listed}"
        )
    if stale:
        listed = "\n".join(f"- {key}" for key in stale)
        raise RuntimeError(
            "stale route policies remain after routes were removed or "
            f"renamed; regenerate {ROUTE_POLICY_PATH.name}:\n{listed}"
        )
