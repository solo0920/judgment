from __future__ import annotations

from starlette.applications import Starlette
from starlette.routing import Mount, WebSocketRoute

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
