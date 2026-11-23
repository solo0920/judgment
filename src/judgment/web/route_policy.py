from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Iterable, Mapping, Pattern, Sequence

from starlette.routing import Mount, WebSocketRoute

ROUTE_POLICY_PATH = Path(__file__).with_name("route_policies.json")
DEMO_POLICY_PATH = Path(__file__).with_name("demo_policies.json")
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
        "DEMO_READ",
        "DEMO_QUERY",
        "DEMO_ACTION",
    }
)
DEMO_POLICIES = frozenset({"DEMO_READ", "DEMO_QUERY", "DEMO_ACTION"})
VALID_DEMO_FEATURES = frozenset(
    {"rag", "data", "quality", "performance", "processing", "status", "home"}
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


def load_demo_policies(path: Path | None = None) -> Dict[str, str]:
    """Load the demo feature mapping for DEMO_READ / DEMO_QUERY routes."""

    table_path = path or DEMO_POLICY_PATH
    try:
        raw = json.loads(table_path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(
            f"demo policy table is missing: {table_path}"
        ) from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"demo policy table is not valid JSON: {table_path}"
        ) from exc
    routes = raw.get("routes") if isinstance(raw, dict) else None
    if not isinstance(routes, dict):
        raise RuntimeError(
            f"demo policy table must contain a routes object: {table_path}"
        )
    policies: Dict[str, str] = {}
    for key, value in routes.items():
        if not isinstance(key, str) or " " not in key:
            raise RuntimeError(f"invalid demo policy key: {key!r}")
        feature = str(value or "").strip().lower()
        if feature not in VALID_DEMO_FEATURES:
            raise RuntimeError(
                f"invalid demo feature for {key}: {value!r}"
            )
        policies[key] = feature
    return policies


@lru_cache(maxsize=1)
def cached_demo_policies() -> Dict[str, str]:
    return load_demo_policies()


def _pattern_matcher(pattern: str) -> Pattern[str]:
    parts = re.split(r"(\{[^}]+\})", pattern)
    expression = "".join(
        "[^/]+" if part.startswith("{") and part.endswith("}") else re.escape(part)
        for part in parts
    )
    return re.compile(f"^{expression}$")


def _build_matchers(
    table: Mapping[str, str],
) -> Dict[str, list[tuple[str, Pattern[str], str]]]:
    matchers: Dict[str, list[tuple[str, Pattern[str], str]]] = {}
    for key, category in table.items():
        method, _, pattern = key.partition(" ")
        if method in {"MOUNT", "WS"} or not pattern.startswith("/"):
            continue
        matchers.setdefault(method, []).append(
            (pattern, _pattern_matcher(pattern), category)
        )
    for entries in matchers.values():
        # More specific (longer) patterns win when both match.
        entries.sort(key=lambda item: len(item[0]), reverse=True)
    return matchers


@lru_cache(maxsize=1)
def cached_route_matchers() -> Dict[str, list[tuple[str, Pattern[str], str]]]:
    return _build_matchers(cached_route_policies())


@lru_cache(maxsize=1)
def cached_demo_matchers() -> Dict[str, list[tuple[str, Pattern[str], str]]]:
    return _build_matchers(cached_demo_policies())


def demo_feature_for(
    method: str,
    path: str,
    policies: Mapping[str, str] | None = None,
) -> str | None:
    normalized_method = str(method or "").upper()
    if normalized_method == "HEAD":
        normalized_method = "GET"
    table = policies if policies is not None else cached_demo_policies()
    exact = table.get(route_key(normalized_method, path))
    if exact is not None:
        return exact
    matchers = (
        _build_matchers(table)
        if policies is not None
        else cached_demo_matchers()
    )
    for _pattern, matcher, feature in matchers.get(normalized_method, []):
        if matcher.match(path):
            return feature
    return None


def policy_for(
    method: str,
    path: str,
    policies: Mapping[str, str] | None = None,
) -> str:
    normalized_method = str(method or "").upper()
    if normalized_method == "HEAD":
        normalized_method = "GET"
    table = policies if policies is not None else cached_route_policies()
    exact = table.get(route_key(normalized_method, path))
    if exact is not None:
        return exact
    matchers = (
        _build_matchers(table)
        if policies is not None
        else cached_route_matchers()
    )
    for _pattern, matcher, category in matchers.get(normalized_method, []):
        if matcher.match(path):
            return category
    return DEFAULT_CATEGORY


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
    if any(category in DEMO_POLICIES for category in table.values()):
        demo_table = cached_demo_policies()
        demo_routes = {
            key for key, category in table.items() if category in DEMO_POLICIES
        }
        missing_demo = sorted(demo_routes - set(demo_table))
        stale_demo = sorted(set(demo_table) - demo_routes)
        if missing_demo:
            listed = "\n".join(f"- {key}" for key in missing_demo)
            raise RuntimeError(
                "demo routes have no feature mapping; add them to "
                f"{DEMO_POLICY_PATH.name}:\n{listed}"
            )
        if stale_demo:
            listed = "\n".join(f"- {key}" for key in stale_demo)
            raise RuntimeError(
                "stale demo feature mappings remain; regenerate "
                f"{DEMO_POLICY_PATH.name}:\n{listed}"
            )
