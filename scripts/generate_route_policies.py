from __future__ import annotations

import argparse
import json

from judgment.web.app import app
from judgment.web.route_policy import (
    ROUTE_POLICY_PATH,
    VALID_CATEGORIES,
    registered_route_keys,
)

PUBLIC_READ = {"GET /", "GET /favicon.svg", "MOUNT /assets"}
PUBLIC_API = {"GET /api/health", "GET /api/home", "GET /api/auth/me"}
PUBLIC_AUTH = {
    "GET /api/auth/google/start",
    "GET /api/auth/google/callback",
    "POST /api/auth/logout",
}
AUTH_ONLY = {
    "POST /api/auth/sse-ticket",
}
# Anonymous RAG stays closed until Phase 4 adds rate limiting, budget and a
# kill switch.  Change these to PUBLIC_QUERY only when that gate is ready.
RAG_ADMIN_ONLY = {"POST /api/rag/query", "POST /api/rag/query/stream"}


def classify(method: str, path: str) -> str:
    key = f"{method.upper()} {path}"
    if key in PUBLIC_READ or key in PUBLIC_API:
        return "PUBLIC_READ"
    if key in PUBLIC_AUTH:
        return "PUBLIC_AUTH"
    if key in AUTH_ONLY:
        return "AUTH_ONLY"
    if key in RAG_ADMIN_ONLY:
        return "ADMIN_ONLY"
    if path in {"/api/docs", "/api/openapi.json", "/docs/oauth2-redirect"}:
        return "ADMIN_ONLY"
    if path.startswith("/api/ollama/") or path.startswith("/api/llama-server/"):
        return "ADMIN_ONLY"
    if path.startswith("/api/question-bank/"):
        if path == "/api/question-bank/export":
            return "ADMIN_ONLY"
        return "AUTH_READ" if method == "GET" else "ADMIN_WRITE"
    if (
        path.startswith("/api/benchmark/")
        or path.startswith("/api/test-")
        or path.startswith("/api/llm/")
        or path.startswith("/api/rerank/")
        or path == "/api/test-mode"
    ):
        return "ADMIN_ONLY"
    if path == "/api/index-alias/reconcile":
        return "ADMIN_ONLY"
    if path == "/api/query":
        return "AUTH_QUERY"
    if path == "/api/performance/client":
        return "SELF_WRITE"
    if method == "GET":
        return "AUTH_READ"
    return "ADMIN_WRITE"


def build_policies(existing: dict[str, str], reset: bool) -> dict[str, str]:
    policies: dict[str, str] = {}
    for key in registered_route_keys(app.routes):
        if reset:
            method, path = key.split(" ", 1)
            policies[key] = classify(method, path)
            continue
        if key in existing:
            policies[key] = existing[key]
            continue
        # New routes are added at the strictest level.  A human must review
        # and lower them explicitly; the generator never auto-publicizes.
        policies[key] = "ADMIN_ONLY"
    return policies


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate the default-deny route policy table."
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Discard manual categories and regenerate every route.",
    )
    args = parser.parse_args()

    existing: dict[str, str] = {}
    if ROUTE_POLICY_PATH.exists() and not args.reset:
        raw = json.loads(ROUTE_POLICY_PATH.read_text(encoding="utf-8"))
        routes = raw.get("routes") if isinstance(raw, dict) else None
        if isinstance(routes, dict):
            existing = {
                str(key): str(value)
                for key, value in routes.items()
                if str(value) in VALID_CATEGORIES
            }

    policies = build_policies(existing, args.reset)
    payload = {
        "version": 1,
        "default": "ADMIN_ONLY",
        "routes": dict(sorted(policies.items())),
    }
    ROUTE_POLICY_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    counts: dict[str, int] = {}
    for category in policies.values():
        counts[category] = counts.get(category, 0) + 1
    print(f"wrote {ROUTE_POLICY_PATH} ({len(policies)} routes)")
    for category in sorted(counts):
        print(f"  {category}: {counts[category]}")


if __name__ == "__main__":
    main()
