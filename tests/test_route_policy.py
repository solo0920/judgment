from __future__ import annotations

from fastapi import FastAPI
from starlette.applications import Starlette
from starlette.routing import Mount, WebSocketRoute

from judgment.web.app import _match_route, _policy_for_matched_route
from judgment.web.route_policy import registered_route_keys


async def _websocket_endpoint(scope, receive, send) -> None:
    return None


def test_registered_route_keys_expands_mounted_apps_and_websockets() -> None:
    mounted = Starlette(
        routes=[WebSocketRoute("/live", _websocket_endpoint)]
    )
    keys = registered_route_keys(
        [
            Mount("/nested", app=mounted),
            WebSocketRoute("/direct", _websocket_endpoint),
        ]
    )
    assert "WS /nested/live" in keys
    assert "WS /direct" in keys


def test_registered_route_keys_marks_static_mounts() -> None:
    class StaticLike:
        routes = []

    keys = registered_route_keys([Mount("/assets", app=StaticLike())])
    assert keys == ["MOUNT /assets"]


async def _http_endpoint(request) -> None:
    return None


def test_router_match_handles_path_converter() -> None:
    app = FastAPI()
    app.add_route(
        "/api/files/{file_path:path}",
        _http_endpoint,
        methods=["GET"],
    )
    route = _match_route(
        app,
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "https",
            "path": "/api/files/a/b",
            "raw_path": b"/api/files/a/b",
            "query_string": b"",
            "headers": [],
            "root_path": "",
        },
    )
    assert route is not None
    assert route.path == "/api/files/{file_path:path}"
    # Not in the global policy table: fail closed.
    assert _policy_for_matched_route(route, "GET") == "ADMIN_ONLY"
