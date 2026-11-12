#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${JUDGMENT_PORT:-9200}"
AGENT_PORT="${JUDGMENT_POWER_PORT:-9201}"
RUN_DIR=".run"
PID_FILE="${RUN_DIR}/web.pid"
AGENT_PID_FILE="${RUN_DIR}/agent.pid"
RERANK_PID_FILE="${RUN_DIR}/rerank_server.pid"

read_env_value() {
  local key="$1"
  [[ -f .env ]] || return 0
  awk -v key="${key}" -F= '
    $1 == key {
      sub(/^[^=]*=/, "")
      gsub(/\r$/, "")
      print
      exit
    }
  ' .env
}

if [[ -z "${RERANK_PORT:-}" ]]; then
  RERANK_PORT="$(read_env_value RERANK_PORT)"
fi
RERANK_PORT="${RERANK_PORT:-11435}"

kill_matching_listener() {
  local port="$1"
  local pattern="$2"
  local signal="${3:-TERM}"
  local pid cmd
  for pid in $(lsof -nP -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true); do
    cmd="$(ps -o command= -p "${pid}" 2>/dev/null || true)"
    if [[ "${cmd}" == *"${pattern}"* ]]; then
      kill "-${signal}" "${pid}" 2>/dev/null || true
    fi
  done
}

port_is_listening() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_port_close() {
  local port="$1"
  local attempts="${2:-20}"
  for _ in $(seq 1 "${attempts}"); do
    if ! port_is_listening "${port}"; then
      return 0
    fi
    sleep 0.25
  done
  return 1
}

stop_backend() {
  echo "停止後端…"
  if curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
    curl -fsS -X POST -H "X-Judgment-Power: 1" --max-time 40 \
      "http://127.0.0.1:${AGENT_PORT}/api/power/stop" >/dev/null 2>&1 || true
  fi

  kill_matching_listener "${PORT}" "judgment" "TERM"
  if ! wait_for_port_close "${PORT}"; then
    kill_matching_listener "${PORT}" "judgment" "KILL"
    wait_for_port_close "${PORT}" 8 || true
  fi
  rm -f "${PID_FILE}"
}

stop_agent() {
  echo "停止電源控制器…"
  kill_matching_listener "${AGENT_PORT}" "power_agent" "TERM"
  kill_matching_listener "${AGENT_PORT}" "judgment-power-agent" "TERM"
  if ! wait_for_port_close "${AGENT_PORT}"; then
    kill_matching_listener "${AGENT_PORT}" "power_agent" "KILL"
    kill_matching_listener "${AGENT_PORT}" "judgment-power-agent" "KILL"
    wait_for_port_close "${AGENT_PORT}" 8 || true
  fi
  rm -f "${AGENT_PID_FILE}"
}

stop_reranker() {
  echo "停止本機 reranker…"
  if [[ -f "${RERANK_PID_FILE}" ]]; then
    local pid
    pid="$(cat "${RERANK_PID_FILE}" 2>/dev/null || true)"
    if [[ -n "${pid}" ]]; then
      kill -TERM "${pid}" 2>/dev/null || true
    fi
  fi
  kill_matching_listener "${RERANK_PORT}" "llama-server" "TERM"
  if ! wait_for_port_close "${RERANK_PORT}"; then
    kill_matching_listener "${RERANK_PORT}" "llama-server" "KILL"
    wait_for_port_close "${RERANK_PORT}" 8 || true
  fi
  rm -f "${RERANK_PID_FILE}"
}

stop_backend
stop_agent
stop_reranker

if [[ "${JUDGMENT_SKIP_DOCKER:-0}" == "1" ]]; then
  echo "略過 Docker 停止（JUDGMENT_SKIP_DOCKER=1）。"
elif docker info >/dev/null 2>&1; then
  echo "停止 Docker 服務（保留 PostgreSQL volume）…"
  docker compose stop
else
  echo "Docker daemon 未執行，略過 Docker 服務。"
fi

echo "已停止後端與相關服務。"
