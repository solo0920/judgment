#!/usr/bin/env bash
# Install the Judgment BGE reranker as a per-user LaunchAgent on macOS.
#
# Ollama does not expose a rerank API (it loads the reranker only as a
# completion model).  This installs a login-time LaunchAgent that runs
# llama-server with --reranking on 127.0.0.1:11435 and serves the GGUF taken
# from the local Ollama model store.  The model stays resident for the life of
# the llama-server process and is restarted automatically if it crashes.
#
# Prerequisite: llama-server from Homebrew (brew install llama.cpp) and the
# reranker model in Ollama (ollama pull qllama/bge-reranker-v2-m3:latest).
#
# Usage:
#   bash scripts/deploy_rerank_macos.sh
#   bash scripts/deploy_rerank_macos.sh --status
#   bash scripts/deploy_rerank_macos.sh --uninstall
#
# Optional environment variables:
#   RERANK_PORT=11435
#   RERANK_HOST=127.0.0.1
#   RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
#   RERANK_MODEL_PATH=/path/to/bge-reranker-v2-m3-q8_0.gguf
#   LLAMA_SERVER_BIN=/opt/homebrew/bin/llama-server
#   RERANK_INSTALL_DIR="$HOME/Library/Application Support/Judgment"
#   RERANK_AGENT_LABEL=com.judgment.rerank
set -euo pipefail

LABEL="${RERANK_AGENT_LABEL:-com.judgment.rerank}"
DOMAIN="gui/$(id -u)"
RERANK_PORT="${RERANK_PORT:-11435}"
RERANK_HOST="${RERANK_HOST:-127.0.0.1}"
OLLAMA_MODEL="${RERANK_OLLAMA_MODEL:-qllama/bge-reranker-v2-m3:latest}"
INSTALL_DIR="${RERANK_INSTALL_DIR:-${HOME}/Library/Application Support/Judgment}"
MODEL_DIR="${INSTALL_DIR}/models"
MODEL_TARGET="${MODEL_DIR}/bge-reranker-v2-m3-q8_0.gguf"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG_FILE="${HOME}/Library/Logs/judgment-rerank.log"
GPU_LAYERS="${RERANK_GPU_LAYERS:-99}"
CTX_SIZE="${RERANK_CTX_SIZE:-8192}"
BATCH_SIZE="${RERANK_BATCH_SIZE:-2048}"
UBATCH_SIZE="${RERANK_UBATCH_SIZE:-1024}"

usage() {
  cat <<'EOF'
Install the Judgment BGE reranker as a per-user LaunchAgent on macOS.

Usage:
  bash scripts/deploy_rerank_macos.sh
  bash scripts/deploy_rerank_macos.sh --status
  bash scripts/deploy_rerank_macos.sh --restart
  bash scripts/deploy_rerank_macos.sh --uninstall
  bash scripts/deploy_rerank_macos.sh --help

Optional environment variables:
  RERANK_PORT=11435
  RERANK_HOST=127.0.0.1
  RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
  RERANK_MODEL_PATH=/path/to/bge-reranker-v2-m3-q8_0.gguf
  LLAMA_SERVER_BIN=/opt/homebrew/bin/llama-server
  RERANK_INSTALL_DIR="$HOME/Library/Application Support/Judgment"
  RERANK_AGENT_LABEL=com.judgment.rerank
EOF
}

require_macos() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "此腳本只支援 macOS（目前：$(uname -s)）。" >&2
    exit 1
  fi
  if [[ "$(id -u)" -eq 0 ]]; then
    echo "請以一般使用者執行，不要使用 sudo；LaunchAgent 會安裝在目前使用者。" >&2
    exit 1
  fi
  if ! command -v curl >/dev/null 2>&1; then
    echo "找不到 curl。" >&2
    exit 1
  fi
  if ! command -v launchctl >/dev/null 2>&1; then
    echo "找不到 launchctl。" >&2
    exit 1
  fi
}

find_llama_server() {
  if [[ -n "${LLAMA_SERVER_BIN:-}" && -x "${LLAMA_SERVER_BIN}" ]]; then
    printf '%s\n' "${LLAMA_SERVER_BIN}"
    return 0
  fi
  if command -v llama-server >/dev/null 2>&1; then
    command -v llama-server
    return 0
  fi
  local candidates=(
    "/opt/homebrew/bin/llama-server"
    "/usr/local/bin/llama-server"
  )
  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -x "${candidate}" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  return 1
}

find_model_source() {
  if [[ -n "${RERANK_MODEL_PATH:-}" ]]; then
    printf '%s\n' "${RERANK_MODEL_PATH}"
    return 0
  fi
  if command -v ollama >/dev/null 2>&1; then
    ollama show "${OLLAMA_MODEL}" --modelfile 2>/dev/null \
      | awk '/^FROM /{print $2; exit}'
    return 0
  fi
  return 1
}

api_ready() {
  curl -fsS --max-time 2 "http://127.0.0.1:${RERANK_PORT}/health" >/dev/null 2>&1
}

rerank_ready() {
  local payload
  payload="$(curl -fsS --max-time 20 \
    -X POST "http://127.0.0.1:${RERANK_PORT}/v1/rerank" \
    -H 'Content-Type: application/json' \
    -d '{"model":"bge-reranker-v2-m3","query":"銀行未經許可吸收存款，應負什麼責任？","documents":["銀行法第29條規定，除法律另有規定者外，非銀行不得經營收受存款業務。","民法第184條規定，因故意或過失不法侵害他人權利者，負損害賠償責任。"],"top_n":2}' \
    2>/dev/null)" || return 1
  printf '%s' "${payload}" | python3 -c '
import json
import sys

data = json.load(sys.stdin)
results = data.get("results") or []
if not results:
    raise SystemExit(1)
print("rerank:", [(item.get("index"), round(float(item.get("relevance_score", item.get("score"))), 4)) for item in results])
' 2>/dev/null
}

show_status() {
  echo "LaunchAgent：${LABEL}"
  if [[ -f "${PLIST}" ]]; then
    echo "Plist：${PLIST}"
  else
    echo "Plist：未安裝"
  fi
  echo "Endpoints：http://${RERANK_HOST}:${RERANK_PORT}/v1/rerank"
  echo "模型：${MODEL_TARGET}"
  echo "日誌：${LOG_FILE}"
  echo
  if ! api_ready; then
    echo "reranker 目前沒有回應。" >&2
    return 1
  fi
  rerank_ready || {
    echo "reranker health 正常，但實際 rerank 請求失敗。" >&2
    return 1
  }
  echo "管理：launchctl print ${DOMAIN}/${LABEL}"
}

uninstall() {
  launchctl bootout "${DOMAIN}/${LABEL}" >/dev/null 2>&1 \
    || launchctl bootout "${DOMAIN}" "${PLIST}" >/dev/null 2>&1 \
    || true
  rm -f "${PLIST}"
  echo "已移除 ${LABEL}。"
  echo "模型仍保留在 ${MODEL_TARGET}；如不需要可手動刪除。"
}

case "${1:-}" in
  -h|--help)
    usage
    exit 0
    ;;
  --status)
    require_macos
    show_status
    exit $?
    ;;
  --restart)
    require_macos
    if [[ ! -f "${PLIST}" ]]; then
      echo "尚未安裝 ${LABEL}；請先執行 bash $0。" >&2
      exit 1
    fi
    launchctl kickstart -k "${DOMAIN}/${LABEL}"
    echo -n "等待 reranker 就緒"
    ready=0
    for _ in $(seq 1 360); do
      if api_ready; then
        ready=1
        echo " OK"
        break
      fi
      echo -n "."
      sleep 0.5
    done
    if [[ "${ready}" != "1" ]]; then
      echo
      echo "警告：reranker 未就緒，最近日誌：" >&2
      tail -n 40 "${LOG_FILE}" >&2 || true
      exit 1
    fi
    if ! rerank_ready; then
      echo "警告：health 正常，但實際 rerank 請求失敗。" >&2
      exit 1
    fi
    echo "已重啟 ${LABEL}。"
    exit 0
    ;;
  --uninstall)
    require_macos
    uninstall
    exit 0
    ;;
  "")
    ;;
  *)
    echo "未知參數：$1" >&2
    usage >&2
    exit 2
    ;;
esac

require_macos

if ! LLAMA_SERVER="$(find_llama_server)"; then
  echo "找不到 llama-server。" >&2
  echo "請先安裝：brew install llama.cpp" >&2
  echo "或設定 LLAMA_SERVER_BIN=/path/to/llama-server。" >&2
  exit 1
fi

LLAMA_SERVER="$(cd "$(dirname "${LLAMA_SERVER}")" && pwd)/$(basename "${LLAMA_SERVER}")"
if ! "${LLAMA_SERVER}" --version >/tmp/judgment-rerank-version.log 2>&1; then
  echo "llama-server 無法執行：" >&2
  cat /tmp/judgment-rerank-version.log >&2 || true
  exit 1
fi

MODEL_SOURCE="$(find_model_source || true)"
if [[ -z "${MODEL_SOURCE}" || ! -f "${MODEL_SOURCE}" ]]; then
  echo "找不到 reranker GGUF：${MODEL_SOURCE:-（空）}" >&2
  echo "請先執行：" >&2
  echo "  ollama pull ${OLLAMA_MODEL}" >&2
  echo "或設定 RERANK_MODEL_PATH=/path/to/bge-reranker-v2-m3-q8_0.gguf。" >&2
  exit 1
fi

# Refuse to install over a port already owned by another process.
if lsof -nP -iTCP:"${RERANK_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  owner="$(lsof -nP -iTCP:"${RERANK_PORT}" -sTCP:LISTEN 2>/dev/null | awk 'NR==2{print $1" (pid "$2")"}')"
  if ! api_ready; then
    echo "連接埠 ${RERANK_PORT} 已被其他程序使用：${owner}" >&2
    exit 1
  fi
  echo "連接埠 ${RERANK_PORT} 已有 llama-server 回應，將重新安裝 LaunchAgent。"
fi

mkdir -p "${MODEL_DIR}" "${HOME}/Library/LaunchAgents" "${HOME}/Library/Logs"
chmod 700 "${INSTALL_DIR}" "${MODEL_DIR}" 2>/dev/null || true

if [[ "${MODEL_SOURCE}" != "${MODEL_TARGET}" ]]; then
  echo "複製 reranker 模型到穩定路徑…"
  cp -f "${MODEL_SOURCE}" "${MODEL_TARGET}.tmp"
  chmod 600 "${MODEL_TARGET}.tmp"
  mv -f "${MODEL_TARGET}.tmp" "${MODEL_TARGET}"
else
  chmod 600 "${MODEL_TARGET}" 2>/dev/null || true
fi

MODEL_SIZE="$(du -h "${MODEL_TARGET}" | awk '{print $1}')"
echo "llama-server：${LLAMA_SERVER}（$("${LLAMA_SERVER}" --version 2>&1 | head -1)）"
echo "模型：${MODEL_TARGET}（${MODEL_SIZE}）"
echo "監聽：${RERANK_HOST}:${RERANK_PORT}"

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "${value}"
}

BIN_XML="$(xml_escape "${LLAMA_SERVER}")"
MODEL_XML="$(xml_escape "${MODEL_TARGET}")"
HOST_XML="$(xml_escape "${RERANK_HOST}")"
LOG_XML="$(xml_escape "${LOG_FILE}")"

cat >"${PLIST}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${BIN_XML}</string>
    <string>--model</string>
    <string>${MODEL_XML}</string>
    <string>--host</string>
    <string>${HOST_XML}</string>
    <string>--port</string>
    <string>${RERANK_PORT}</string>
    <string>--reranking</string>
    <string>--pooling</string>
    <string>rank</string>
    <string>-ngl</string>
    <string>${GPU_LAYERS}</string>
    <string>--ctx-size</string>
    <string>${CTX_SIZE}</string>
    <string>--batch-size</string>
    <string>${BATCH_SIZE}</string>
    <string>--ubatch-size</string>
    <string>${UBATCH_SIZE}</string>
    <string>--no-webui</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>5</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>Umask</key>
  <integer>63</integer>
  <key>StandardOutPath</key>
  <string>${LOG_XML}</string>
  <key>StandardErrorPath</key>
  <string>${LOG_XML}</string>
</dict>
</plist>
EOF
chmod 600 "${PLIST}"
touch "${LOG_FILE}"
chmod 600 "${LOG_FILE}" 2>/dev/null || true

plutil -lint "${PLIST}" >/dev/null
launchctl bootout "${DOMAIN}/${LABEL}" >/dev/null 2>&1 || true
for _ in $(seq 1 40); do
  lsof -nP -iTCP:"${RERANK_PORT}" -sTCP:LISTEN >/dev/null 2>&1 || break
  sleep 0.5
done
launchctl bootstrap "${DOMAIN}" "${PLIST}"
launchctl kickstart -k "${DOMAIN}/${LABEL}"

echo -n "等待 reranker 就緒"
ready=0
for _ in $(seq 1 360); do
  if api_ready; then
    ready=1
    echo " OK"
    break
  fi
  echo -n "."
  sleep 0.5
done

if [[ "${ready}" != "1" ]]; then
  echo
  echo "警告：reranker 尚未就緒，最近日誌：" >&2
  tail -n 40 "${LOG_FILE}" >&2 || true
  exit 1
fi

if ! rerank_ready; then
  echo "警告：health 正常，但實際 rerank 請求失敗，最近日誌：" >&2
  tail -n 40 "${LOG_FILE}" >&2 || true
  exit 1
fi

echo
echo "完成。"
echo "  LaunchAgent：${PLIST}"
echo "  Endpoint：http://${RERANK_HOST}:${RERANK_PORT}/v1/rerank"
echo "  Health：http://${RERANK_HOST}:${RERANK_PORT}/health"
echo "  模型常駐在 llama-server process，直到程序停止或重新啟動。"
echo
echo "常用指令："
echo "  launchctl print ${DOMAIN}/${LABEL}"
echo "  launchctl kickstart -k ${DOMAIN}/${LABEL}"
echo "  tail -f ${LOG_FILE}"
echo "  bash $0 --status"
echo "  bash $0 --uninstall"
