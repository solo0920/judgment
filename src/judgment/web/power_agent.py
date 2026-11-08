from __future__ import annotations

import argparse
import json
import logging
import os
import signal
import socket
import subprocess
import sys
import tempfile
import threading
import time
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import urlopen

DEFAULT_AGENT_PORT = 9201
DEFAULT_BACKEND_PORT = 9200
PROJECT_ROOT = Path(__file__).resolve().parents[3]
AGENT_LOG_FILE = Path(tempfile.gettempdir()) / "judgment-power-agent.log"
BACKEND_LOG_FILE = Path(tempfile.gettempdir()) / "judgment-web.log"

logger = logging.getLogger("judgment.power_agent")


def _configure_logging(verbose: bool = False) -> None:
    handlers: List[logging.Handler] = [
        logging.FileHandler(AGENT_LOG_FILE, encoding="utf-8")
    ]
    if verbose:
        handlers.append(logging.StreamHandler())
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        handlers=handlers,
        force=True,
    )


def _probe_health(host: str, port: int, timeout: float = 1.5) -> bool:
    try:
        with urlopen(f"http://{host}:{port}/api/health", timeout=timeout) as response:
            return 200 <= response.status < 300
    except (URLError, OSError, ValueError):
        return False


def _port_listening(host: str, port: int, timeout: float = 0.4) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _pid_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def _pid_is_judgment(pid: int) -> bool:
    try:
        completed = subprocess.run(
            ["ps", "-o", "command=", "-p", str(int(pid))],
            capture_output=True,
            text=True,
            timeout=2,
            check=False,
        )
    except (FileNotFoundError, OSError, subprocess.SubprocessError):
        return False
    command = (completed.stdout or "").lower()
    return "judgment" in command or "uvicorn" in command


def _listener_pids(port: int) -> List[int]:
    try:
        completed = subprocess.run(
            ["lsof", "-nP", f"-tiTCP:{int(port)}", "-sTCP:LISTEN"],
            capture_output=True,
            text=True,
            timeout=3,
            check=False,
        )
    except (FileNotFoundError, OSError, subprocess.SubprocessError):
        return []
    pids = set()
    for line in (completed.stdout or "").splitlines():
        text = line.strip()
        if text.isdigit():
            pids.add(int(text))
    return sorted(pids)


def _agent_available(host: str, port: int) -> bool:
    try:
        with urlopen(
            f"http://{host}:{port}/api/power/status", timeout=1.5
        ) as response:
            return 200 <= response.status < 300
    except (URLError, OSError, ValueError):
        return False


class BackendController:
    def __init__(
        self,
        *,
        backend_host: str,
        backend_port: int,
        data_dir: Optional[str] = None,
        database_url: Optional[str] = None,
        parent_pid: Optional[int] = None,
        agent_host: str = "127.0.0.1",
        agent_port: int = DEFAULT_AGENT_PORT,
    ) -> None:
        self.backend_host = backend_host
        self.health_host = (
            "127.0.0.1"
            if backend_host in {"0.0.0.0", "::", "[::]"}
            else backend_host
        )
        self.backend_port = int(backend_port)
        self.data_dir = (
            str(Path(data_dir).expanduser().resolve()) if data_dir else None
        )
        self.database_url = database_url
        self.parent_pid = parent_pid
        self.agent_host = agent_host
        self.agent_port = int(agent_port)
        self.lock = threading.Lock()
        self.process: Optional[subprocess.Popen[bytes]] = None
        self.started_at: Optional[str] = None

    def _start_command(self) -> List[str]:
        command = [
            sys.executable,
            "-m",
            "judgment.web.app",
            "--host",
            self.backend_host,
            "--port",
            str(self.backend_port),
        ]
        if self.data_dir:
            command.extend(["--data-dir", self.data_dir])
        if self.database_url:
            command.extend(["--database-url", self.database_url])
        return command

    def _pids(self) -> List[int]:
        pids = set(_listener_pids(self.backend_port))
        if self.process is not None and self.process.poll() is None:
            pids.add(self.process.pid)
        if (
            self.parent_pid is not None
            and _pid_alive(self.parent_pid)
            and _pid_is_judgment(self.parent_pid)
            and self.is_running()
        ):
            pids.add(self.parent_pid)
        pids.discard(os.getpid())
        return sorted(pid for pid in pids if _pid_alive(pid))

    def is_running(self) -> bool:
        return _probe_health(self.health_host, self.backend_port)

    def status(self) -> Dict[str, Any]:
        running = self.is_running()
        pids = self._pids()
        return {
            "status": "operational",
            "agent": {
                "host": self.agent_host,
                "port": self.agent_port,
                "checked_at": datetime.now(timezone.utc).isoformat(),
            },
            "backend": {
                "running": running,
                "healthy": running,
                "host": self.backend_host,
                "port": self.backend_port,
                "pids": pids,
                "started_at": self.started_at,
                "log_file": str(BACKEND_LOG_FILE),
            },
        }

    def start(self) -> Dict[str, Any]:
        with self.lock:
            if self.is_running():
                return {
                    "status": "already_running",
                    "running": True,
                    "pids": self._pids(),
                    "log_file": str(BACKEND_LOG_FILE),
                }

            if self.process is None or self.process.poll() is not None:
                BACKEND_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
                log_handle = open(BACKEND_LOG_FILE, "ab", buffering=0)
                environment = os.environ.copy()
                try:
                    self.process = subprocess.Popen(
                        self._start_command(),
                        cwd=str(PROJECT_ROOT),
                        stdin=subprocess.DEVNULL,
                        stdout=log_handle,
                        stderr=subprocess.STDOUT,
                        start_new_session=True,
                        env=environment,
                        close_fds=True,
                    )
                finally:
                    log_handle.close()
                self.started_at = datetime.now(timezone.utc).isoformat()
                logger.info("started backend pid=%s", self.process.pid)

            deadline = time.monotonic() + 25
            while time.monotonic() < deadline:
                if self.is_running():
                    return {
                        "status": "started",
                        "running": True,
                        "pids": self._pids(),
                        "log_file": str(BACKEND_LOG_FILE),
                    }
                if self.process is not None and self.process.poll() is not None:
                    return {
                        "status": "failed",
                        "running": False,
                        "returncode": self.process.returncode,
                        "detail": "後端啟動失敗，請查看電源控制器日誌。",
                        "log_file": str(BACKEND_LOG_FILE),
                    }
                time.sleep(0.25)

            return {
                "status": "timeout",
                "running": False,
                "detail": "後端啟動逾時，請查看電源控制器日誌。",
                "log_file": str(BACKEND_LOG_FILE),
            }

    def stop(self) -> Dict[str, Any]:
        with self.lock:
            pids = self._pids()
            if not pids:
                return {"status": "already_stopped", "running": False, "pids": []}

            for pid in pids:
                try:
                    os.kill(pid, signal.SIGTERM)
                except ProcessLookupError:
                    continue
            logger.info("sent SIGTERM to backend pids=%s", pids)

            deadline = time.monotonic() + 10
            while time.monotonic() < deadline:
                if not any(_pid_alive(pid) for pid in pids) and not _port_listening(
                    self.health_host, self.backend_port
                ):
                    break
                time.sleep(0.2)

            remaining = [pid for pid in pids if _pid_alive(pid)]
            for pid in remaining:
                try:
                    os.kill(pid, signal.SIGKILL)
                except ProcessLookupError:
                    continue
            if remaining:
                logger.warning("sent SIGKILL to backend pids=%s", remaining)

            if self.process is not None and self.process.pid in pids:
                try:
                    self.process.wait(timeout=2)
                except subprocess.TimeoutExpired:
                    pass
            self.process = None
            running = self.is_running()
            return {
                "status": "stopped" if not running else "stopping",
                "running": running,
                "detail": None
                if not running
                else "後端仍在停止中，請稍後再試。",
                "pids": pids,
            }


class PowerRequestHandler(BaseHTTPRequestHandler):
    controller: BackendController

    def _allowed_origin(self, origin: Optional[str]) -> bool:
        if not origin:
            return True
        if origin == "null":
            return True
        try:
            hostname = (urlparse(origin).hostname or "").lower()
        except ValueError:
            return False
        return hostname in {"localhost", "127.0.0.1", "::1", "[::1]"}

    def _cors_headers(self, origin: Optional[str]) -> bool:
        if not self._allowed_origin(origin):
            return False
        self.send_header("Access-Control-Allow-Origin", origin or "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers", "Accept, Content-Type, X-Judgment-Power"
        )
        self.send_header("Access-Control-Max-Age", "600")
        self.send_header("Vary", "Origin")
        self.send_header("Cache-Control", "no-store")
        return True

    def _send_json(
        self,
        status: int,
        payload: Dict[str, Any],
        origin: Optional[str] = None,
    ) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._cors_headers(origin)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        if not self._allowed_origin(origin):
            self.send_response(HTTPStatus.FORBIDDEN)
            self.end_headers()
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self._cors_headers(origin)
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if path != "/api/power/status":
            self._send_json(HTTPStatus.NOT_FOUND, {"detail": "找不到電源控制端點。"}, origin)
            return
        try:
            self._send_json(HTTPStatus.OK, self.controller.status(), origin)
        except Exception as exc:  # pragma: no cover - defensive response
            logger.exception("power status failed")
            self._send_json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"detail": f"無法取得電源狀態：{exc.__class__.__name__}"},
                origin,
            )

    def do_POST(self) -> None:  # noqa: N802
        origin = self.headers.get("Origin")
        path = urlparse(self.path).path
        if self.headers.get("X-Judgment-Power") != "1":
            self._send_json(
                HTTPStatus.FORBIDDEN,
                {"detail": "缺少電源控制標頭。"},
                origin,
            )
            return
        try:
            if path == "/api/power/start":
                result = self.controller.start()
            elif path == "/api/power/stop":
                result = self.controller.stop()
            else:
                self._send_json(
                    HTTPStatus.NOT_FOUND,
                    {"detail": "找不到電源控制端點。"},
                    origin,
                )
                return
            status = HTTPStatus.OK
            if result.get("status") in {"failed", "timeout"}:
                status = HTTPStatus.SERVICE_UNAVAILABLE
            self._send_json(status, result, origin)
        except Exception as exc:  # pragma: no cover - defensive response
            logger.exception("power action failed: %s", path)
            self._send_json(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                {"detail": f"電源切換失敗：{exc.__class__.__name__}"},
                origin,
            )

    def log_message(self, format: str, *args: Any) -> None:
        logger.info("%s - %s", self.address_string(), format % args)


def make_handler(controller: BackendController):
    return type(
        "BoundPowerRequestHandler",
        (PowerRequestHandler,),
        {"controller": controller},
    )


def ensure_power_agent(
    *,
    backend_host: str = "127.0.0.1",
    backend_port: int = DEFAULT_BACKEND_PORT,
    data_dir: Optional[str] = None,
    database_url: Optional[str] = None,
    parent_pid: Optional[int] = None,
    agent_host: str = "127.0.0.1",
    agent_port: int = DEFAULT_AGENT_PORT,
) -> bool:
    if os.getenv("JUDGMENT_POWER_AGENT", "1").strip().lower() in {
        "0",
        "false",
        "no",
        "off",
    }:
        return False
    if _agent_available(agent_host, agent_port):
        return True
    if _port_listening(agent_host, agent_port):
        return False

    AGENT_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    command = [
        sys.executable,
        "-m",
        "judgment.web.power_agent",
        "--host",
        agent_host,
        "--port",
        str(agent_port),
        "--backend-host",
        backend_host,
        "--backend-port",
        str(backend_port),
    ]
    if data_dir:
        command.extend(["--data-dir", str(Path(data_dir).expanduser().resolve())])
    if database_url:
        command.extend(["--database-url", database_url])
    if parent_pid is not None:
        command.extend(["--parent-pid", str(parent_pid)])

    environment = os.environ.copy()
    environment["JUDGMENT_POWER_AGENT_CHILD"] = "1"
    log_handle = open(AGENT_LOG_FILE, "ab", buffering=0)
    try:
        subprocess.Popen(
            command,
            cwd=str(PROJECT_ROOT),
            stdin=subprocess.DEVNULL,
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            start_new_session=True,
            env=environment,
            close_fds=True,
        )
    finally:
        log_handle.close()

    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        if _agent_available(agent_host, agent_port):
            return True
        time.sleep(0.1)
    logger.warning("power agent did not become available on %s:%s", agent_host, agent_port)
    return False


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Judgment 本機電源控制器：啟動／停止 judgment-web 後端"
    )
    parser.add_argument("--host", default="127.0.0.1", help="控制器綁定位址")
    parser.add_argument("--port", type=int, default=DEFAULT_AGENT_PORT, help="控制器連接埠")
    parser.add_argument("--backend-host", default="127.0.0.1", help="後端綁定位址")
    parser.add_argument("--backend-port", type=int, default=DEFAULT_BACKEND_PORT, help="後端連接埠")
    parser.add_argument("--data-dir", default=None, help="啟動後端時使用的 LAW_DATA_DIR")
    parser.add_argument("--database-url", default=None, help="啟動後端時使用的 DATABASE_URL")
    parser.add_argument("--parent-pid", type=int, default=None, help="原始 judgment-web PID")
    parser.add_argument("--verbose", action="store_true", help="同時輸出日誌到終端")
    args = parser.parse_args()

    _configure_logging(args.verbose)
    controller = BackendController(
        backend_host=args.backend_host,
        backend_port=args.backend_port,
        data_dir=args.data_dir,
        database_url=args.database_url,
        parent_pid=args.parent_pid,
        agent_host=args.host,
        agent_port=args.port,
    )
    server = ThreadingHTTPServer(
        (args.host, args.port),
        make_handler(controller),
    )
    server.daemon_threads = True
    logger.info(
        "power agent listening on http://%s:%s (backend %s:%s, parent pid=%s)",
        args.host,
        args.port,
        args.backend_host,
        args.backend_port,
        args.parent_pid,
    )
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        logger.info("power agent interrupted")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
