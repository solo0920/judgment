#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

HOST="127.0.0.1"
PORT="${JUDGMENT_PORT:-9200}"
AGENT_PORT="${JUDGMENT_POWER_PORT:-9201}"
RUN_DIR=".run"
WEB_LOG="${RUN_DIR}/web.log"
AGENT_LOG="${RUN_DIR}/agent.log"
PID_FILE="${RUN_DIR}/web.pid"
AGENT_PID_FILE="${RUN_DIR}/agent.pid"

mkdir -p "${RUN_DIR}"

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

if [[ ! -f .env ]]; then
  export LAW_DATA_DIR="${LAW_DATA_DIR:-./data/laws}"
  export JUDGMENT_DATA_DIR="${JUDGMENT_DATA_DIR:-./data/judgments}"
  export JUDGMENT_LAW_LIST="${JUDGMENT_LAW_LIST:-./documents/金融法規.md}"
  export DATABASE_URL="${DATABASE_URL:-postgresql+psycopg://judgment:judgment@localhost:5432/judgment}"
  export QDRANT_URL="${QDRANT_URL:-http://127.0.0.1:6333}"
  export JUDGMENT_VECTOR_COLLECTION="${JUDGMENT_VECTOR_COLLECTION:-judgment_documents}"
  export EMBEDDING_URL="${EMBEDDING_URL:-http://127.0.0.1:11434}"
  export EMBEDDING_MODEL="${EMBEDDING_MODEL:-bge-m3}"
  export LLM_URL="${LLM_URL:-http://127.0.0.1:11434}"
  export LLM_MODEL="${LLM_MODEL:-gemma3:27b}"
fi

need_frontend_build() {
  [[ -f frontend/index.html ]] || return 0
  find src/judgment/web/static -type f -newer frontend/index.html -print -quit \
    2>/dev/null | grep -q .
}

if need_frontend_build; then
  echo "建置 standalone frontend…"
  uv run python scripts/build_frontend.py
fi

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
      if curl -fsS --max-time 2 "http://127.0.0.1:6333/collections" >/dev/null 2>&1; then
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

probe_ollama_model() {
  local url="$1"
  local model="$2"
  local timeout="${JUDGMENT_EMBEDDING_PROBE_TIMEOUT:-3}"
  local tags
  tags="$(curl -fsS --max-time "${timeout}" "${url}/api/tags" 2>/dev/null || true)"
  [[ -n "${tags}" ]] || return 1
  printf '%s' "${tags}" | grep -q "${model}" 2>/dev/null
}

X570_EMBEDDING_URL="${JUDGMENT_X570_EMBEDDING_URL:-http://x570:11434}"
LOCAL_EMBEDDING_URL="${JUDGMENT_LOCAL_EMBEDDING_URL:-http://127.0.0.1:11434}"
EMBEDDING_MODEL="${EMBEDDING_MODEL:-bge-m3}"

remote_embedding_ok=0
local_embedding_ok=0
if probe_ollama_model "${X570_EMBEDDING_URL}" "${EMBEDDING_MODEL}"; then
  remote_embedding_ok=1
fi
if probe_ollama_model "${LOCAL_EMBEDDING_URL}" "${EMBEDDING_MODEL}"; then
  local_embedding_ok=1
fi

if [[ "${remote_embedding_ok}" == "1" ]]; then
  export EMBEDDING_URL="${X570_EMBEDDING_URL}"
  if [[ "${local_embedding_ok}" == "1" ]]; then
    export EMBEDDING_FALLBACK_URL="${LOCAL_EMBEDDING_URL}"
    echo "Embedding：x570（${X570_EMBEDDING_URL}）· fallback：本機 Ollama"
  else
    export EMBEDDING_FALLBACK_URL=""
    echo "Embedding：x570（${X570_EMBEDDING_URL}）· 本機 Ollama 未就緒"
  fi
else
  export EMBEDDING_URL="${LOCAL_EMBEDDING_URL}"
  export EMBEDDING_FALLBACK_URL=""
  if [[ "${local_embedding_ok}" == "1" ]]; then
    echo "x570 Ollama 不可用，Embedding 改用本機 Ollama（${LOCAL_EMBEDDING_URL}）"
  else
    echo "警告：x570 與本機 Ollama 都無法使用，Embedding 會降級。"
  fi
fi

health="$(curl -fsS --max-time 2 "http://${HOST}:${PORT}/api/health" 2>/dev/null || true)"
if [[ "${health}" == *'"status":"ok"'* ]]; then
  echo "後端已在執行：http://${HOST}:${PORT}/"
else
  if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "錯誤：連接埠 ${PORT} 已被其他程式占用。"
    lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN || true
    exit 1
  fi

  echo "啟動後端（http://${HOST}:${PORT}）…"
  nohup uv run judgment-web --host "${HOST}" --port "${PORT}" >"${WEB_LOG}" 2>&1 &
  echo $! >"${PID_FILE}"

  for _ in {1..60}; do
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
    exit 1
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

echo "完成。"
echo "後端：http://${HOST}:${PORT}/"
echo "系統測試：http://${HOST}:${PORT}/#/tests"
echo "日誌：${WEB_LOG}"
