#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

HOST="127.0.0.1"
PORT="${JUDGMENT_PORT:-9200}"
AGENT_PORT="${JUDGMENT_POWER_PORT:-9201}"
RUN_DIR=".run"
WEB_LOG="${RUN_DIR}/web.log"
AGENT_LOG="${RUN_DIR}/agent.log"
RERANK_LOG="${RUN_DIR}/rerank_server.log"
PID_FILE="${RUN_DIR}/web.pid"
AGENT_PID_FILE="${RUN_DIR}/agent.pid"
RERANK_PID_FILE="${RUN_DIR}/rerank_server.pid"
TMUX_SESSION="${JUDGMENT_WEB_TMUX_SESSION:-judgment-web}"

mkdir -p "${RUN_DIR}"
chmod 700 "${RUN_DIR}" 2>/dev/null || true
chmod 600 .env 2>/dev/null || true
touch "${WEB_LOG}" 2>/dev/null || true
chmod 600 "${WEB_LOG}" 2>/dev/null || true

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

if [[ -z "${RAG_RERANK_ENABLED:-}" ]]; then
  RAG_RERANK_ENABLED="$(read_env_value RAG_RERANK_ENABLED)"
fi
if [[ -z "${RERANK_URL:-}" ]]; then
  RERANK_URL="$(read_env_value RERANK_URL)"
fi
if [[ -z "${RERANK_FALLBACK_URL:-}" ]]; then
  RERANK_FALLBACK_URL="$(read_env_value RERANK_FALLBACK_URL)"
fi
if [[ -z "${RERANK_PORT:-}" ]]; then
  RERANK_PORT="$(read_env_value RERANK_PORT)"
fi
if [[ -z "${RERANK_LOCAL_HOST:-}" ]]; then
  RERANK_LOCAL_HOST="$(read_env_value RERANK_LOCAL_HOST)"
fi
if [[ -z "${RERANK_START_LOCAL:-}" ]]; then
  RERANK_START_LOCAL="$(read_env_value RERANK_START_LOCAL)"
fi
if [[ -z "${RERANK_OLLAMA_MODEL:-}" ]]; then
  RERANK_OLLAMA_MODEL="$(read_env_value RERANK_OLLAMA_MODEL)"
fi
if [[ -z "${RERANK_MODEL_PATH:-}" ]]; then
  RERANK_MODEL_PATH="$(read_env_value RERANK_MODEL_PATH)"
fi
if [[ -z "${LLAMA_SERVER_BIN:-}" ]]; then
  LLAMA_SERVER_BIN="$(read_env_value LLAMA_SERVER_BIN)"
fi
if [[ -z "${QDRANT_API_KEY:-}" ]]; then
  QDRANT_API_KEY="$(read_env_value QDRANT_API_KEY)"
fi
if [[ -z "${FRONTEND_API_BASE:-}" ]]; then
  FRONTEND_API_BASE="$(read_env_value FRONTEND_API_BASE)"
fi

RERANK_PORT="${RERANK_PORT:-11435}"
RERANK_LOCAL_HOST="${RERANK_LOCAL_HOST:-127.0.0.1}"
RERANK_START_LOCAL="${RERANK_START_LOCAL:-auto}"
RERANK_OLLAMA_MODEL="${RERANK_OLLAMA_MODEL:-qllama/bge-reranker-v2-m3:latest}"
RERANK_HEALTH_HOST="${RERANK_LOCAL_HOST}"
if [[ "${RERANK_HEALTH_HOST}" == "0.0.0.0" ]]; then
  RERANK_HEALTH_HOST="127.0.0.1"
fi

cleanup_stale_pid() {
  local file="$1"
  [[ -f "${file}" ]] || return 0
  local pid
  pid="$(cat "${file}" 2>/dev/null || true)"
  if [[ -z "${pid}" ]] || ! kill -0 "${pid}" 2>/dev/null; then
    rm -f "${file}"
  fi
}

cleanup_stale_pid "${PID_FILE}"
cleanup_stale_pid "${AGENT_PID_FILE}"
cleanup_stale_pid "${RERANK_PID_FILE}"

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

tmux_session_exists() {
  command -v tmux >/dev/null 2>&1 \
    && tmux has-session -t "${TMUX_SESSION}" 2>/dev/null
}

stop_web_tmux_session() {
  if tmux_session_exists; then
    echo "停止舊的 tmux session ${TMUX_SESSION}…"
    tmux kill-session -t "${TMUX_SESSION}" 2>/dev/null || true
    wait_for_port_close "${PORT}" 20 || true
  fi
}

write_web_pid() {
  local pid
  pid="$(lsof -nP -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
  if [[ -n "${pid}" ]]; then
    echo "${pid}" >"${PID_FILE}"
  fi
}

start_backend_detached() {
  local uv_bin
  uv_bin="$(command -v uv || true)"
  if [[ -z "${uv_bin}" ]]; then
    echo "錯誤：找不到 uv。"
    return 1
  fi

  if command -v tmux >/dev/null 2>&1; then
    local command_line
    printf -v command_line \
      'exec %q run judgment-web --host %q --port %q >> %q 2>&1' \
      "${uv_bin}" "${HOST}" "${PORT}" "${WEB_LOG}"
    tmux new-session -d -s "${TMUX_SESSION}" -c "${PWD}" "${command_line}"
    echo "後端以 detached tmux session ${TMUX_SESSION} 啟動。"
    return 0
  fi

  echo "警告：找不到 tmux，改用 nohup；若啟動端 shell 被終止，後端可能一起結束。"
  nohup "${uv_bin}" run judgment-web --host "${HOST}" --port "${PORT}" \
    >>"${WEB_LOG}" 2>&1 &
  echo $! >"${PID_FILE}"
}

if [[ ! -f .env ]]; then
  export LAW_DATA_DIR="${LAW_DATA_DIR:-./data/laws}"
  export JUDGMENT_DATA_DIR="${JUDGMENT_DATA_DIR:-./data/judgments}"
  export JUDGMENT_LAW_LIST="${JUDGMENT_LAW_LIST:-./documents/金融法規.md}"
  export DATABASE_URL="${DATABASE_URL:-postgresql+psycopg://judgment:judgment@localhost:5432/judgment}"
  export QDRANT_URL="${QDRANT_URL:-http://127.0.0.1:6333}"
  export JUDGMENT_VECTOR_COLLECTION="${JUDGMENT_VECTOR_COLLECTION:-judgment_documents}"
  export EMBEDDING_URL="${EMBEDDING_URL:-http://127.0.0.1:11437}"
  export EMBEDDING_MODEL="${EMBEDDING_MODEL:-bge-m3}"
  export LLM_URL="${LLM_URL:-http://127.0.0.1:11436}"
  export LLM_MODEL="${LLM_MODEL:-gemma3:4b}"
fi

need_frontend_build() {
  [[ -f frontend/index.html ]] || return 0
  find src/judgment/web/static -type f -newer frontend/index.html -print -quit \
    2>/dev/null | grep -q .
}

frontend_api_base() {
  if [[ -n "${FRONTEND_API_BASE:-}" ]]; then
    printf '%s' "${FRONTEND_API_BASE}"
    return 0
  fi
  # Preserve the deployed API base when rebuilding from a newer checkout.
  sed -n 's/^[[:space:]]*apiBase:[[:space:]]*"\([^"]*\)",.*/\1/p' \
    frontend/config.js 2>/dev/null | head -1
}

if need_frontend_build; then
  api_base="$(frontend_api_base || true)"
  echo "建置 standalone frontend…"
  if [[ -n "${api_base}" ]]; then
    uv run python scripts/build_frontend.py --api-base "${api_base}"
  else
    uv run python scripts/build_frontend.py
  fi
fi

should_start_reranker() {
  local mode
  mode="$(printf '%s' "${RERANK_START_LOCAL}" | tr '[:upper:]' '[:lower:]')"
  case "${mode}" in
    0|false|no|off) return 1 ;;
    1|true|yes|on) return 0 ;;
  esac
  local enabled
  enabled="$(printf '%s' "${RAG_RERANK_ENABLED}" | tr '[:upper:]' '[:lower:]')"
  case "${enabled}" in
    1|true|yes|on) ;;
    *) return 1 ;;
  esac
  local urls="${RERANK_URL} ${RERANK_FALLBACK_URL}"
  [[ "${urls}" == *"127.0.0.1"* || "${urls}" == *"localhost"* ]]
}

start_reranker() {
  local health_url="http://${RERANK_HEALTH_HOST}:${RERANK_PORT}/health"
  if curl -fsS --max-time 2 "${health_url}" >/dev/null 2>&1; then
    echo "Reranker：已在執行（${health_url}）"
    return 0
  fi

  local agent_label="${RERANK_AGENT_LABEL:-com.judgment.rerank}"
  local agent_plist="${HOME}/Library/LaunchAgents/${agent_label}.plist"
  if [[ -f "${agent_plist}" ]] && command -v launchctl >/dev/null 2>&1; then
    echo "啟動本機 reranker LaunchAgent（${agent_label}）…"
    launchctl bootstrap "gui/$(id -u)" "${agent_plist}" >/dev/null 2>&1 || true
    launchctl kickstart -k "gui/$(id -u)/${agent_label}" >/dev/null 2>&1 || true
    local agent_ready=0
    for _ in {1..360}; do
      if curl -fsS --max-time 2 "${health_url}" >/dev/null 2>&1; then
        agent_ready=1
        break
      fi
      sleep 0.5
    done
    if [[ "${agent_ready}" == "1" ]]; then
      echo "Reranker：${health_url}（LaunchAgent）"
      return 0
    fi
    echo "警告：LaunchAgent reranker 未就緒，改用手動啟動。"
  fi

  if lsof -nP -iTCP:"${RERANK_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "警告：連接埠 ${RERANK_PORT} 已被其他程式占用，略過本機 reranker。"
    return 1
  fi
  if [[ ! -x scripts/rerank_server.sh ]]; then
    echo "警告：找不到可執行的 scripts/rerank_server.sh，略過本機 reranker。"
    return 1
  fi

  echo "啟動本機 reranker（${RERANK_HEALTH_HOST}:${RERANK_PORT}）…"
  nohup env \
    RERANK_HOST="${RERANK_LOCAL_HOST}" \
    RERANK_PORT="${RERANK_PORT}" \
    RERANK_OLLAMA_MODEL="${RERANK_OLLAMA_MODEL}" \
    RERANK_MODEL_PATH="${RERANK_MODEL_PATH:-}" \
    LLAMA_SERVER_BIN="${LLAMA_SERVER_BIN:-}" \
    ./scripts/rerank_server.sh >"${RERANK_LOG}" 2>&1 &
  echo $! >"${RERANK_PID_FILE}"

  local ready=0
  for _ in {1..60}; do
    if curl -fsS --max-time 2 "${health_url}" >/dev/null 2>&1; then
      ready=1
      break
    fi
    if [[ -f "${RERANK_PID_FILE}" ]] && ! kill -0 "$(cat "${RERANK_PID_FILE}")" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done
  if [[ "${ready}" != "1" ]]; then
    echo "警告：本機 reranker 未就緒，最近日誌："
    tail -n 20 "${RERANK_LOG}" 2>/dev/null || true
    rm -f "${RERANK_PID_FILE}"
    return 1
  fi
  echo "Reranker：${health_url}"
}

security_listener_gate() {
  if [[ "${SKIP_LISTENER_CHECK:-0}" == "1" ]]; then
    echo "WARNING: SKIP_LISTENER_CHECK=1 — listener security gate bypassed." >&2
    return 0
  fi
  bash scripts/security_listener_check.sh
}

if [[ "${JUDGMENT_SKIP_DOCKER:-0}" == "1" ]]; then
  echo "略過 Docker 啟動（JUDGMENT_SKIP_DOCKER=1）。"
else
  if ! command -v docker >/dev/null 2>&1; then
    echo "錯誤：找不到 docker。"
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "錯誤：Docker daemon 沒有執行，請先啟動 Docker Desktop。"
    exit 1
  fi

  compose_services=(postgres)
  if [[ "${JUDGMENT_SKIP_QDRANT:-0}" != "1" ]]; then
    compose_services+=(qdrant)
  fi
  echo "啟動 Docker 服務（${compose_services[*]}）…"
  docker compose up -d "${compose_services[@]}"

  echo -n "等待 PostgreSQL 健康檢查"
  status=""
  for _ in {1..30}; do
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' judgment-postgres 2>/dev/null || true)"
    if [[ "${status}" == "healthy" || "${status}" == "running" ]]; then
      echo " OK"
      break
    fi
    echo -n "."
    sleep 1
  done
  if [[ "${status:-}" != "healthy" && "${status:-}" != "running" ]]; then
    echo
    echo "錯誤：PostgreSQL 未就緒，請檢查 docker compose logs postgres。"
    exit 1
  fi

  if [[ "${JUDGMENT_SKIP_QDRANT:-0}" != "1" ]]; then
    echo -n "等待 Qdrant"
    qdrant_ready=0
    for _ in {1..30}; do
      if [[ -n "${QDRANT_API_KEY:-}" ]]; then
        qdrant_ok="$(curl -fsS -H "api-key: ${QDRANT_API_KEY}" --max-time 2 "http://127.0.0.1:6333/collections" >/dev/null 2>&1 && echo 1 || true)"
      else
        qdrant_ok="$(curl -fsS --max-time 2 "http://127.0.0.1:6333/collections" >/dev/null 2>&1 && echo 1 || true)"
      fi
      if [[ "${qdrant_ok}" == "1" ]]; then
        qdrant_ready=1
        echo " OK"
        break
      fi
      echo -n "."
      sleep 1
    done
    if [[ "${qdrant_ready}" != "1" ]]; then
      echo
      echo "警告：Qdrant 未就緒，資料頁與 RAG 會顯示降級狀態。請檢查 docker compose logs qdrant。"
    fi
  fi
fi

# Do not start the web console with a known non-loopback Judgment listener.
if ! security_listener_gate; then
  echo "SECURITY: listener check failed; refusing to start web." >&2
  exit 1
fi

if should_start_reranker; then
  if ! start_reranker; then
    echo "警告：RAG 會改用遠端 reranker 或降級為原向量排序。"
  fi
else
  echo "略過本機 reranker 啟動（RAG_RERANK_ENABLED=${RAG_RERANK_ENABLED:-false}，RERANK_START_LOCAL=${RERANK_START_LOCAL}）。"
fi

probe_openai_model() {
  local url="$1"
  local model="$2"
  local timeout="${JUDGMENT_EMBEDDING_PROBE_TIMEOUT:-2}"
  local models
  models="$(curl -fsS --max-time "${timeout}" "${url}/v1/models" 2>/dev/null || true)"
  if [[ -n "${models}" ]]; then
    printf '%s' "${models}" | grep -q "\"${model}\"" 2>/dev/null && return 0
    return 1
  fi
  curl -fsS --max-time "${timeout}" "${url}/health" >/dev/null 2>&1
}

X570_LLM_URL="${JUDGMENT_X570_LLM_URL:-http://x570:11436}"
X570_EMBEDDING_URL="${JUDGMENT_X570_EMBEDDING_URL:-http://x570:11437}"
MBP_LLM_URL="${JUDGMENT_MBP_LLM_URL:-http://127.0.0.1:11436}"
MBP_EMBEDDING_URL="${JUDGMENT_MBP_EMBEDDING_URL:-http://127.0.0.1:11437}"
LLM_MODEL="${LLM_MODEL:-$(read_env_value LLM_MODEL)}"
LLM_MODEL="${LLM_MODEL:-gemma3:4b}"
EMBEDDING_MODEL="${EMBEDDING_MODEL:-$(read_env_value EMBEDDING_MODEL)}"
EMBEDDING_MODEL="${EMBEDDING_MODEL:-bge-m3}"

x570_llm_ok=0
x570_embedding_ok=0
mbp_llm_ok=0
mbp_embedding_ok=0
if probe_openai_model "${X570_LLM_URL}" "${LLM_MODEL}"; then
  x570_llm_ok=1
fi
if probe_openai_model "${X570_EMBEDDING_URL}" "${EMBEDDING_MODEL}"; then
  x570_embedding_ok=1
fi
if probe_openai_model "${MBP_LLM_URL}" "${LLM_MODEL}"; then
  mbp_llm_ok=1
fi
if probe_openai_model "${MBP_EMBEDDING_URL}" "${EMBEDDING_MODEL}"; then
  mbp_embedding_ok=1
fi

if [[ "${x570_llm_ok}" == "1" ]]; then
  export LLM_URL="${X570_LLM_URL}"
  export LLM_API="openai"
  export LLM_MODEL
  if [[ "${mbp_llm_ok}" == "1" ]]; then
    export LLM_FALLBACK_URL="${MBP_LLM_URL}"
    export LLM_FALLBACK_MODEL="${LLM_MODEL}"
    export LLM_FALLBACK_API="openai"
    echo "LLM：x570 llama-server（${X570_LLM_URL}）· fallback：MBP llama-server（${MBP_LLM_URL}）"
  else
    export LLM_FALLBACK_URL=""
    echo "LLM：x570 llama-server（${X570_LLM_URL}）· MBP llama-server 未就緒"
  fi
elif [[ "${mbp_llm_ok}" == "1" ]]; then
  export LLM_URL="${MBP_LLM_URL}"
  export LLM_API="openai"
  export LLM_MODEL
  export LLM_FALLBACK_URL=""
  echo "x570 llama-server 不可用，LLM 改用 MBP llama-server（${MBP_LLM_URL}）"
else
  export LLM_URL="${X570_LLM_URL}"
  export LLM_API="openai"
  export LLM_MODEL
  export LLM_FALLBACK_URL=""
  echo "警告：x570 與 MBP llama-server 都無法使用，RAG 會降級為檢索結果。"
fi

if [[ "${x570_embedding_ok}" == "1" ]]; then
  export EMBEDDING_URL="${X570_EMBEDDING_URL}"
  export EMBEDDING_API="openai"
  export EMBEDDING_MODEL
  if [[ "${mbp_embedding_ok}" == "1" ]]; then
    export EMBEDDING_FALLBACK_URL="${MBP_EMBEDDING_URL}"
    export EMBEDDING_FALLBACK_API="openai"
    echo "Embedding：x570 llama-server（${X570_EMBEDDING_URL}）· fallback：MBP llama-server（${MBP_EMBEDDING_URL}）"
  else
    export EMBEDDING_FALLBACK_URL=""
    echo "Embedding：x570 llama-server（${X570_EMBEDDING_URL}）· MBP llama-server 未就緒"
  fi
elif [[ "${mbp_embedding_ok}" == "1" ]]; then
  export EMBEDDING_URL="${MBP_EMBEDDING_URL}"
  export EMBEDDING_API="openai"
  export EMBEDDING_MODEL
  export EMBEDDING_FALLBACK_URL=""
  echo "x570 llama-server embedding 不可用，改用 MBP llama-server（${MBP_EMBEDDING_URL}）"
else
  export EMBEDDING_URL="${X570_EMBEDDING_URL}"
  export EMBEDDING_API="openai"
  export EMBEDDING_MODEL
  export EMBEDDING_FALLBACK_URL=""
  echo "警告：x570 與 MBP llama-server 都無法使用，Embedding 會降級。"
fi

# up.sh owns the embedding failover chain; clear stale comma-separated values
# from .env so the detected primary/fallback pair is exactly what is used.
export EMBEDDING_FAILOVER_URLS=""
export EMBEDDING_FAILOVER_APIS=""

health="$(curl -fsS --max-time 2 "http://${HOST}:${PORT}/api/health" 2>/dev/null || true)"
if [[ "${health}" == *'"status":"ok"'* ]]; then
  echo "後端已在執行：http://${HOST}:${PORT}/"
  write_web_pid
else
  # A tmux session may be left over after a crash or port conflict. Stop only
  # the session this script owns, then verify the port is actually free.
  stop_web_tmux_session
  if port_is_listening "${PORT}"; then
    echo "錯誤：連接埠 ${PORT} 已被其他程式占用。"
    lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN || true
    exit 1
  fi

  echo "啟動後端（http://${HOST}:${PORT}）…"
  start_backend_detached

  # Cold start can spend time on Qdrant, reranker and model probes.  Allow
  # three minutes before declaring the backend failed.
  for _ in {1..360}; do
    health="$(curl -fsS --max-time 2 "http://${HOST}:${PORT}/api/health" 2>/dev/null || true)"
    if [[ "${health}" == *'"status":"ok"'* ]]; then
      break
    fi
    if [[ -f "${PID_FILE}" ]] && ! kill -0 "$(cat "${PID_FILE}")" 2>/dev/null; then
      break
    fi
    sleep 0.5
  done

  if [[ "${health}" != *'"status":"ok"'* ]]; then
    echo "錯誤：後端啟動失敗，最近日誌："
    tail -n 30 "${WEB_LOG}" || true
    stop_web_tmux_session
    exit 1
  fi
  write_web_pid
fi

if [[ "${JUDGMENT_SKIP_UPDATE_CHECK:-0}" == "1" ]]; then
  echo "略過線上更新檢查（JUDGMENT_SKIP_UPDATE_CHECK=1）。"
else
  echo -n "檢查法規／命令／判決線上更新"
  if curl -fsS --max-time 120 -X POST "http://${HOST}:${PORT}/api/updates/check" >/dev/null 2>&1; then
    echo " OK"
  else
    echo " 警告：更新檢查失敗，不影響服務啟動。"
  fi
fi

if [[ "${JUDGMENT_POWER_AGENT:-1}" == "0" ]]; then
  echo "略過電源控制器（JUDGMENT_POWER_AGENT=0）。"
else
  if ! curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
    echo "啟動電源控制器（127.0.0.1:${AGENT_PORT}）…"
    nohup uv run judgment-power-agent --backend-port "${PORT}" >"${AGENT_LOG}" 2>&1 &
    echo $! >"${AGENT_PID_FILE}"
    for _ in {1..20}; do
      if curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
        break
      fi
      sleep 0.25
    done
  fi

  if curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
    echo "電源控制器：http://127.0.0.1:${AGENT_PORT}/api/power/status"
  else
    echo "警告：電源控制器未就緒，本機電源 API 可能無法使用。"
  fi
fi

# Check again after web/reranker startup; this is a loud warning rather than
# tearing down an already-running service.
if ! security_listener_gate; then
  echo "SECURITY WARNING: a Judgment-related listener is not loopback-only." >&2
fi

echo "完成。"
echo "後端：http://${HOST}:${PORT}/"
echo "系統測試：http://${HOST}:${PORT}/#/tests"
echo "日誌：${WEB_LOG}"
