#!/usr/bin/env bash
# Install MBP-local llama-server chat and embedding fallback services.
#
#   com.judgment.llm-chat        gemma3:4b  127.0.0.1:11436
#   com.judgment.llm-embedding   bge-m3    127.0.0.1:11437
#
# These are the fallback when x570 llama-server is unavailable.  They are
# separate from the existing com.judgment.rerank service on 127.0.0.1:11435.
#
# Usage:
#   bash scripts/deploy_llama_services_macos.sh
#   bash scripts/deploy_llama_services_macos.sh --status
#   bash scripts/deploy_llama_services_macos.sh --uninstall
#
# Optional environment variables:
#   LLAMA_SERVER_BIN=/opt/homebrew/bin/llama-server
#   JUDGMENT_MODEL_DIR="$HOME/Library/Application Support/Judgment/models"
#   CHAT_PORT=11436
#   EMBEDDING_PORT=11437
#   CHAT_OLLAMA_MODEL=gemma3:4b
#   EMBEDDING_OLLAMA_MODEL=bge-m3:latest
#   CHAT_MODEL_PATH=/path/to/gemma3.gguf
#   EMBEDDING_MODEL_PATH=/path/to/bge-m3.gguf
#   CHAT_CTX_SIZE=8192
#   EMBEDDING_CTX_SIZE=8192
set -euo pipefail

LABEL_CHAT="com.judgment.llm-chat"
LABEL_EMBEDDING="com.judgment.llm-embedding"
DOMAIN="gui/$(id -u)"
LAUNCH_DIR="${HOME}/Library/LaunchAgents"
LOG_DIR="${HOME}/Library/Logs"
INSTALL_DIR="${HOME}/Library/Application Support/Judgment"
MODEL_DIR="${JUDGMENT_MODEL_DIR:-${INSTALL_DIR}/models}"
CHAT_MODEL_TARGET="${MODEL_DIR}/gemma3-4b.gguf"
EMBEDDING_MODEL_TARGET="${MODEL_DIR}/bge-m3-f16.gguf"
CHAT_PORT="${CHAT_PORT:-11436}"
EMBEDDING_PORT="${EMBEDDING_PORT:-11437}"
CHAT_HOST="${CHAT_HOST:-127.0.0.1}"
EMBEDDING_HOST="${EMBEDDING_HOST:-127.0.0.1}"
CHAT_OLLAMA_MODEL="${CHAT_OLLAMA_MODEL:-gemma3:4b}"
EMBEDDING_OLLAMA_MODEL="${EMBEDDING_OLLAMA_MODEL:-bge-m3:latest}"
CHAT_CTX_SIZE="${CHAT_CTX_SIZE:-8192}"
EMBEDDING_CTX_SIZE="${EMBEDDING_CTX_SIZE:-8192}"
CHAT_ALIAS="${CHAT_ALIAS:-gemma3:4b}"
EMBEDDING_ALIAS="${EMBEDDING_ALIAS:-bge-m3}"

usage() {
  cat <<'EOF'
Install MBP-local llama-server chat and embedding fallback services.

Usage:
  bash scripts/deploy_llama_services_macos.sh
  bash scripts/deploy_llama_services_macos.sh --status
  bash scripts/deploy_llama_services_macos.sh --uninstall
  bash scripts/deploy_llama_services_macos.sh --help

Optional environment variables:
  LLAMA_SERVER_BIN            llama-server binary (default: Homebrew)
  JUDGMENT_MODEL_DIR          model directory
  CHAT_PORT / EMBEDDING_PORT  default 11436 / 11437
  CHAT_OLLAMA_MODEL           default gemma3:4b
  EMBEDDING_OLLAMA_MODEL      default bge-m3:latest
  CHAT_MODEL_PATH /
  EMBEDDING_MODEL_PATH        explicit GGUF paths
  CHAT_CTX_SIZE /
  EMBEDDING_CTX_SIZE          default 8192
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
  local candidate
  for candidate in /opt/homebrew/bin/llama-server /usr/local/bin/llama-server; do
    if [[ -x "${candidate}" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done
  return 1
}

ollama_gguf() {
  local model="$1"
  if ! command -v ollama >/dev/null 2>&1; then
    return 1
  fi
  ollama show "${model}" --modelfile 2>/dev/null \
    | awk '/^FROM /{print $2; exit}'
}

ensure_model() {
  local role="$1"
  local override="$2"
  local ollama_model="$3"
  local target="$4"
  local source=""
  if [[ -n "${override}" ]]; then
    source="${override}"
  else
    source="$(ollama_gguf "${ollama_model}" || true)"
  fi
  if [[ -z "${source}" || ! -f "${source}" ]]; then
    echo "找不到 ${role} 模型 ${ollama_model} 的 GGUF（${source:-空}）。" >&2
    echo "請先執行：ollama pull ${ollama_model}" >&2
    echo "或設定 CHAT_MODEL_PATH／EMBEDDING_MODEL_PATH 指向現有 GGUF。" >&2
    exit 1
  fi
  mkdir -p "${MODEL_DIR}"
  chmod 700 "${INSTALL_DIR}" "${MODEL_DIR}" 2>/dev/null || true
  if [[ ! -f "${target}" || "$(stat -f%z "${target}" 2>/dev/null || echo 0)" != "$(stat -f%z "${source}")" ]]; then
    echo "複製 ${role} 模型到 ${target}…" >&2
    if ! cp -c "${source}" "${target}" 2>/dev/null; then
      cp "${source}" "${target}"
    fi
    chmod 600 "${target}"
  else
    echo "${role} 模型已存在：${target}" >&2
  fi
  printf '%s\n' "${target}"
}

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "${value}"
}

write_plist() {
  local label="$1"
  shift
  local plist="${LAUNCH_DIR}/${label}.plist"
  local log_file="${LOG_DIR}/${label}.log"
  mkdir -p "${LAUNCH_DIR}" "${LOG_DIR}"
  {
    cat <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
EOF
    local arg
    for arg in "$@"; do
      printf '    <string>%s</string>\n' "$(xml_escape "${arg}")"
    done
    cat <<EOF
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
  <string>$(xml_escape "${log_file}")</string>
  <key>StandardErrorPath</key>
  <string>$(xml_escape "${log_file}")</string>
</dict>
</plist>
EOF
  } >"${plist}"
  chmod 600 "${plist}"
}

install_label() {
  local label="$1"
  shift
  local plist="${LAUNCH_DIR}/${label}.plist"
  launchctl bootout "${DOMAIN}/${label}" >/dev/null 2>&1 || true
  write_plist "${label}" "$@"
  launchctl bootstrap "${DOMAIN}" "${plist}"
  launchctl kickstart -k "${DOMAIN}/${label}" >/dev/null 2>&1 || true
  echo "已安裝 ${label}：${plist}"
}

wait_for_health() {
  local label="$1"
  local url="$2"
  local log_file="${LOG_DIR}/${label}.log"
  local i
  for i in $(seq 1 60); do
    if curl -fsS --max-time 2 "${url}/health" >/dev/null 2>&1; then
      echo "OK ${label}：${url}/health"
      return 0
    fi
    sleep 1
  done
  echo "FAIL ${label} 未就緒；最近日誌：" >&2
  tail -30 "${log_file}" >&2 2>/dev/null || true
  return 1
}

verify_model() {
  local label="$1"
  local url="$2"
  local alias="$3"
  if curl -fsS --max-time 5 "${url}/v1/models" 2>/dev/null | grep -q "\"${alias}\""; then
    echo "OK ${label} model：${alias}"
  else
    echo "WARN ${label} 找不到模型 ${alias}" >&2
  fi
}

show_status() {
  local label url alias plist
  for spec in \
    "${LABEL_CHAT}|http://127.0.0.1:${CHAT_PORT}|${CHAT_ALIAS}" \
    "${LABEL_EMBEDDING}|http://127.0.0.1:${EMBEDDING_PORT}|${EMBEDDING_ALIAS}"; do
    IFS='|' read -r label url alias <<<"${spec}"
    plist="${LAUNCH_DIR}/${label}.plist"
    echo "--- ${label}"
    [[ -f "${plist}" ]] && echo "plist: ${plist}" || echo "plist: 未安裝"
    launchctl print "${DOMAIN}/${label}" 2>/dev/null | sed -n '1,6p' || true
    curl -fsS --max-time 3 "${url}/health" 2>/dev/null || echo "health: 無回應"
    echo
    curl -fsS --max-time 5 "${url}/v1/models" 2>/dev/null \
      | grep -o "\"${alias}\"" | head -1 || true
    echo
  done
  echo "日誌：${LOG_DIR}/${LABEL_CHAT}.log、${LOG_DIR}/${LABEL_EMBEDDING}.log"
}

uninstall() {
  local label
  for label in "${LABEL_CHAT}" "${LABEL_EMBEDDING}"; do
    launchctl bootout "${DOMAIN}/${label}" >/dev/null 2>&1 || true
    rm -f "${LAUNCH_DIR}/${label}.plist"
    echo "已移除 ${label}"
  done
  echo "模型仍保留在 ${MODEL_DIR}；如不需要可手動刪除。"
}

case "${1:-}" in
  -h|--help)
    usage
    exit 0
    ;;
  --status)
    require_macos
    show_status
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
  echo "找不到 llama-server；請先執行 brew install llama.cpp，或設定 LLAMA_SERVER_BIN。" >&2
  exit 1
fi

CHAT_MODEL="$(ensure_model chat "${CHAT_MODEL_PATH:-}" "${CHAT_OLLAMA_MODEL}" "${CHAT_MODEL_TARGET}")"
EMBEDDING_MODEL="$(ensure_model embedding "${EMBEDDING_MODEL_PATH:-}" "${EMBEDDING_OLLAMA_MODEL}" "${EMBEDDING_MODEL_TARGET}")"

install_label "${LABEL_CHAT}" \
  "${LLAMA_SERVER}" \
  --model "${CHAT_MODEL}" \
  --alias "${CHAT_ALIAS}" \
  --host "${CHAT_HOST}" \
  --port "${CHAT_PORT}" \
  --jinja \
  -ngl 99 \
  --ctx-size "${CHAT_CTX_SIZE}" \
  --batch-size 1024 \
  --ubatch-size 512 \
  --no-webui

install_label "${LABEL_EMBEDDING}" \
  "${LLAMA_SERVER}" \
  --model "${EMBEDDING_MODEL}" \
  --alias "${EMBEDDING_ALIAS}" \
  --host "${EMBEDDING_HOST}" \
  --port "${EMBEDDING_PORT}" \
  --embedding \
  --pooling cls \
  -ngl 99 \
  --ctx-size "${EMBEDDING_CTX_SIZE}" \
  --batch-size 2048 \
  --ubatch-size 2048 \
  --no-webui

wait_for_health "${LABEL_CHAT}" "http://127.0.0.1:${CHAT_PORT}"
wait_for_health "${LABEL_EMBEDDING}" "http://127.0.0.1:${EMBEDDING_PORT}"
verify_model "${LABEL_CHAT}" "http://127.0.0.1:${CHAT_PORT}" "${CHAT_ALIAS}"
verify_model "${LABEL_EMBEDDING}" "http://127.0.0.1:${EMBEDDING_PORT}" "${EMBEDDING_ALIAS}"

cat <<EOF

完成。MBP llama-server：
  chat       http://127.0.0.1:${CHAT_PORT}  ${CHAT_ALIAS}
  embedding  http://127.0.0.1:${EMBEDDING_PORT}  ${EMBEDDING_ALIAS}

對應 .env：
  LLM_FALLBACK_URL=http://127.0.0.1:${CHAT_PORT}
  LLM_FALLBACK_API=openai
  EMBEDDING_FALLBACK_URL=http://127.0.0.1:${EMBEDDING_PORT}
  EMBEDDING_FALLBACK_API=openai

狀態：bash scripts/deploy_llama_services_macos.sh --status
移除：bash scripts/deploy_llama_services_macos.sh --uninstall
EOF
