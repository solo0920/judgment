#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${JUDGMENT_PORT:-9200}"
AGENT_PORT="${JUDGMENT_POWER_PORT:-9201}"
RUN_DIR=".run"
PID_FILE="${RUN_DIR}/web.pid"

stop_backend() {
  echo "停止後端…"
  if curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
    curl -fsS -X POST -H "X-Judgment-Power: 1" --max-time 40 \
      "http://127.0.0.1:${AGENT_PORT}/api/power/stop" >/dev/null 2>&1 || true
  fi

  for pid in $(lsof -nP -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true); do
    cmd="$(ps -o command= -p "${pid}" 2>/dev/null || true)"
    if [[ "${cmd}" == *judgment* ]]; then
      kill "${pid}" 2>/dev/null || true
    fi
  done

  for _ in {1..20}; do
    if ! lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
      break
    fi
    sleep 0.25
  done
}

stop_agent() {
  echo "停止電源控制器…"
  for pid in $(lsof -nP -tiTCP:"${AGENT_PORT}" -sTCP:LISTEN 2>/dev/null || true); do
    cmd="$(ps -o command= -p "${pid}" 2>/dev/null || true)"
    if [[ "${cmd}" == *power_agent* || "${cmd}" == *judgment-power-agent* ]]; then
      kill "${pid}" 2>/dev/null || true
    fi
  done
  rm -f "${PID_FILE}"
}

stop_backend
stop_agent

if docker info >/dev/null 2>&1; then
  echo "停止 Docker 服務（保留 PostgreSQL volume）…"
  docker compose stop
else
  echo "Docker daemon 未執行，略過 Docker 服務。"
fi

echo "已停止後端與相關服務。"
