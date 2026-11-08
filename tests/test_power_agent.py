from __future__ import annotations

import threading
from http.server import ThreadingHTTPServer

import httpx
import pytest

from judgment.web.power_agent import ensure_power_agent, make_handler


class StubController:
    def status(self):
        return {
            "status": "operational",
            "backend": {"running": True, "host": "127.0.0.1", "port": 9200},
        }

    def start(self):
        return {"status": "started", "running": True}

    def stop(self):
        return {"status": "stopped", "running": False}


@pytest.fixture()
def power_agent_url():
    server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(StubController()))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_address[1]}"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def test_power_status_allows_file_and_local_origins(power_agent_url) -> None:
    with httpx.Client() as client:
        response = client.get(
            f"{power_agent_url}/api/power/status",
            headers={"Origin": "null"},
        )
    assert response.status_code == 200
    assert response.json()["backend"]["running"] is True
    assert response.headers["access-control-allow-origin"] == "null"

    with httpx.Client() as client:
        response = client.get(
            f"{power_agent_url}/api/power/status",
            headers={"Origin": "http://127.0.0.1:9200"},
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:9200"


def test_power_start_and_stop_require_header(power_agent_url) -> None:
    with httpx.Client() as client:
        denied = client.post(
            f"{power_agent_url}/api/power/start",
            headers={"Origin": "null"},
        )
        started = client.post(
            f"{power_agent_url}/api/power/start",
            headers={"Origin": "null", "X-Judgment-Power": "1"},
        )
        stopped = client.post(
            f"{power_agent_url}/api/power/stop",
            headers={"Origin": "null", "X-Judgment-Power": "1"},
        )
    assert denied.status_code == 403
    assert started.status_code == 200
    assert started.json()["running"] is True
    assert stopped.status_code == 200
    assert stopped.json()["running"] is False


def test_power_preflight_is_limited_to_local_origins(power_agent_url) -> None:
    with httpx.Client() as client:
        allowed = client.options(
            f"{power_agent_url}/api/power/start",
            headers={
                "Origin": "http://localhost:9200",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "x-judgment-power",
            },
        )
        denied = client.options(
            f"{power_agent_url}/api/power/start",
            headers={
                "Origin": "https://evil.example",
                "Access-Control-Request-Method": "POST",
            },
        )
    assert allowed.status_code == 204
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:9200"
    assert "x-judgment-power" in allowed.headers["access-control-allow-headers"].lower()
    assert denied.status_code == 403
    assert "access-control-allow-origin" not in denied.headers


def test_power_unknown_route_returns_404(power_agent_url) -> None:
    with httpx.Client() as client:
        response = client.get(f"{power_agent_url}/api/power/unknown")
    assert response.status_code == 404


def test_power_agent_can_be_disabled(monkeypatch) -> None:
    monkeypatch.setenv("JUDGMENT_POWER_AGENT", "0")
    assert ensure_power_agent(agent_port=1) is False
