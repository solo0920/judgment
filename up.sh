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

mkdir -p "${RUN_DIR}"

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

if ! command -v docker >/dev/null 2>&1; then
  echo "錯誤：找不到 docker。"
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "錯誤：Docker daemon 沒有執行，請先啟動 Docker Desktop。"
  exit 1
fi

echo "啟動 Docker 服務（postgres、qdrant）…"
if [[ "${JUDGMENT_SKIP_QDRANT:-0}" == "1" ]]; then
  docker compose up -d postgres
else
  docker compose up -d postgres qdrant
fi

echo -n "等待 PostgreSQL 健康檢查"
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

if ! curl -fsS --max-time 2 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
  echo "警告：Ollama 未執行（127.0.0.1:11434），Embedding 與 LLM 會顯示未設定或降級。"
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

if ! curl -fsS --max-time 2 "http://127.0.0.1:${AGENT_PORT}/api/power/status" >/dev/null 2>&1; then
  echo "啟動電源控制器（127.0.0.1:${AGENT_PORT}）…"
  nohup uv run judgment-power-agent --backend-port "${PORT}" >"${AGENT_LOG}" 2>&1 &
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
  echo "警告：電源控制器未就緒，header 電源開關可能無法使用。"
fi

echo "完成。"
echo "後端：http://${HOST}:${PORT}/"
echo "日誌：${WEB_LOG}"
