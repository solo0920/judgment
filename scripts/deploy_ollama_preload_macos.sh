#!/usr/bin/env bash
# DEPRECATED: MBP now uses llama-server LaunchAgents installed by
# scripts/deploy_llama_services_macos.sh.  This script starts Ollama.app and
# should not be used unless you intentionally want the legacy Ollama path.
#
# Preload Ollama models at login on the MBP (macOS/launchd).
#
# Ollama unloads idle models and starts with an empty memory state.  This
# installs a per-user LaunchAgent that waits for the Ollama API, loads each
# requested model with keep_alive=-1, and re-asserts the setting periodically
# so a restart of Ollama or a shorter keep_alive from another client does not
# leave the models unloaded.
#
# Usage:
#   bash scripts/deploy_ollama_preload_macos.sh
#   bash scripts/deploy_ollama_preload_macos.sh --status
#   bash scripts/deploy_ollama_preload_macos.sh --uninstall
#
# Optional environment variables:
#   OLLAMA_MODELS="gemma3:4b bge-m3:latest"
#   OLLAMA_URL=http://127.0.0.1:11434
#   OLLAMA_KEEP_ALIVE=-1          # -1 = keep loaded; "30m" also works
#   OLLAMA_PRELOAD_INTERVAL=120   # seconds between re-assert attempts
#   OLLAMA_PRELOAD_WAIT_SECONDS=300
set -euo pipefail

LABEL="com.judgment.ollama-preload"
DOMAIN="gui/$(id -u)"
MODELS="${OLLAMA_MODELS:-gemma3:4b bge-m3:latest}"
OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
INTERVAL="${OLLAMA_PRELOAD_INTERVAL:-120}"
WAIT_SECONDS="${OLLAMA_PRELOAD_WAIT_SECONDS:-300}"

INSTALL_DIR="${HOME}/Library/Application Support/Judgment"
PRELOAD_SCRIPT="${INSTALL_DIR}/ollama-preload.sh"
STATE_FILE="${INSTALL_DIR}/ollama-preload.state"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG_FILE="${HOME}/Library/Logs/judgment-ollama-preload.log"

usage() {
  cat <<'EOF'
Preload Ollama models at login on the MBP (macOS/launchd).

Usage:
  bash scripts/deploy_ollama_preload_macos.sh
  bash scripts/deploy_ollama_preload_macos.sh --status
  bash scripts/deploy_ollama_preload_macos.sh --uninstall
  bash scripts/deploy_ollama_preload_macos.sh --help

Optional environment variables:
  OLLAMA_MODELS="gemma3:4b bge-m3:latest"
  OLLAMA_URL=http://127.0.0.1:11434
  OLLAMA_KEEP_ALIVE=-1
  OLLAMA_PRELOAD_INTERVAL=120
  OLLAMA_PRELOAD_WAIT_SECONDS=300
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

api_ready() {
  curl -fsS --max-time 3 "${OLLAMA_URL}/api/version" >/dev/null 2>&1
}

wait_for_api() {
  local waited=0
  local opened=0
  while ! api_ready; do
    if (( waited >= WAIT_SECONDS )); then
      echo "Ollama API 未就緒：${OLLAMA_URL}" >&2
      return 1
    fi
    if (( opened == 0 )) && (( waited >= 5 )) && [[ -d "/Applications/Ollama.app" ]]; then
      open -ga Ollama >/dev/null 2>&1 || true
      opened=1
    fi
    sleep 2
    waited=$((waited + 2))
  done
}

json_string() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "${value}"
}

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "${value}"
}

show_status() {
  echo "LaunchAgent：${LABEL}"
  if [[ -f "${PLIST}" ]]; then
    echo "Plist：${PLIST}"
  else
    echo "Plist：未安裝"
  fi
  echo "模型：${MODELS}"
  echo "Ollama：${OLLAMA_URL}"
  echo
  if ! api_ready; then
    echo "Ollama API 目前沒有回應。" >&2
    return 1
  fi
  curl -sS --max-time 10 "${OLLAMA_URL}/api/ps" | python3 -m json.tool 2>/dev/null \
    || curl -sS --max-time 10 "${OLLAMA_URL}/api/ps"
  echo
  echo "日誌：${LOG_FILE}"
  echo "管理：launchctl print ${DOMAIN}/${LABEL}"
}

uninstall() {
  launchctl bootout "${DOMAIN}/${LABEL}" >/dev/null 2>&1 \
    || launchctl bootout "${DOMAIN}" "${PLIST}" >/dev/null 2>&1 \
    || true
  rm -f "${PLIST}" "${PRELOAD_SCRIPT}" "${STATE_FILE}"
  if command -v ollama >/dev/null 2>&1 && api_ready; then
    for model in ${MODELS}; do
      ollama stop "${model}" >/dev/null 2>&1 || true
    done
  fi
  echo "已移除 ${LABEL} 與預載腳本，並嘗試卸載模型。"
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

if ! wait_for_api; then
  if [[ -d "/Applications/Ollama.app" ]]; then
    open -ga Ollama >/dev/null 2>&1 || true
    wait_for_api || exit 1
  else
    exit 1
  fi
fi

TAGS="$(curl -fsS --max-time 10 "${OLLAMA_URL}/api/tags")"
MISSING=""
for model in ${MODELS}; do
  if ! printf '%s' "${TAGS}" | tr -d ' ' | grep -F "\"name\":\"${model}\"" >/dev/null; then
    MISSING="${MISSING} ${model}"
  fi
done
if [[ -n "${MISSING}" ]]; then
  echo "找不到下列模型：${MISSING}" >&2
  for model in ${MISSING}; do
    echo "  ollama pull ${model}" >&2
  done
  exit 1
fi

mkdir -p "${INSTALL_DIR}" "${HOME}/Library/LaunchAgents" "${HOME}/Library/Logs"
chmod 700 "${INSTALL_DIR}" 2>/dev/null || true

cat >"${PRELOAD_SCRIPT}" <<'RUNTIME'
#!/usr/bin/env bash
# Managed by scripts/deploy_ollama_preload_macos.sh
set -u

OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
MODELS="${OLLAMA_MODELS:-gemma3:4b bge-m3:latest}"
KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
WAIT_SECONDS="${OLLAMA_PRELOAD_WAIT_SECONDS:-300}"
STATE_DIR="${HOME}/Library/Application Support/Judgment"
STATE_FILE="${STATE_DIR}/ollama-preload.state"

mkdir -p "${STATE_DIR}" 2>/dev/null || true
chmod 700 "${STATE_DIR}" 2>/dev/null || true

if [[ "${KEEP_ALIVE}" =~ ^-?[0-9]+$ ]]; then
  KEEP_ALIVE_JSON="${KEEP_ALIVE}"
else
  KEEP_ALIVE_JSON="\"${KEEP_ALIVE}\""
fi

log() {
  printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

api_ready() {
  curl -fsS --max-time 3 "${OLLAMA_URL}/api/version" >/dev/null 2>&1
}

waited=0
opened=0
while ! api_ready; do
  if (( waited >= WAIT_SECONDS )); then
    log "ERROR Ollama API 未就緒：${OLLAMA_URL}"
    exit 1
  fi
  if (( opened == 0 )) && (( waited >= 5 )) && [[ -d "/Applications/Ollama.app" ]]; then
    open -ga Ollama >/dev/null 2>&1 || true
    opened=1
  fi
  sleep 2
  waited=$((waited + 2))
done

failures=0
status=""
BEFORE_JSON="$(curl -sS --max-time 5 "${OLLAMA_URL}/api/ps" 2>/dev/null || true)"
missing_before=0
for model in ${MODELS}; do
  if ! printf '%s' "${BEFORE_JSON}" | tr -d ' ' | grep -F "\"name\":\"${model}\"" >/dev/null; then
    missing_before=$((missing_before + 1))
  fi
done
for model in ${MODELS}; do
  payload="$(curl -sS --max-time 300 -X POST "${OLLAMA_URL}/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${model}\",\"prompt\":\"\",\"stream\":false,\"keep_alive\":${KEEP_ALIVE_JSON},\"options\":{\"num_predict\":1}}" \
    2>&1 || true)"
  if ! printf '%s' "${payload}" | grep -qE '"(done|embeddings)"'; then
    # Embedding-only models reject /api/generate; load them through /api/embed.
    payload="$(curl -sS --max-time 300 -X POST "${OLLAMA_URL}/api/embed" \
      -H 'Content-Type: application/json' \
      -d "{\"model\":\"${model}\",\"input\":\"warmup\",\"keep_alive\":${KEEP_ALIVE_JSON}}" \
      2>&1 || true)"
  fi
  if printf '%s' "${payload}" | grep -qE '"(done|embeddings)"'; then
    status="${status} ${model}=ok"
  else
    failures=$((failures + 1))
    status="${status} ${model}=error"
    log "ERROR ${model}: $(printf '%s' "${payload}" | tr '\n' ' ' | cut -c1-300)"
  fi
done

sleep 1
PS_JSON="$(curl -sS --max-time 5 "${OLLAMA_URL}/api/ps" 2>/dev/null || true)"
for model in ${MODELS}; do
  if ! printf '%s' "${PS_JSON}" | tr -d ' ' | grep -F "\"name\":\"${model}\"" >/dev/null; then
    failures=$((failures + 1))
    status="${status} ${model}=not-loaded"
  fi
done

if (( failures > 0 )); then
  log "FAILED${status}"
  exit 1
fi

current="loaded:$(printf '%s' "${MODELS}" | tr ' ' ',') keep_alive=${KEEP_ALIVE}"
previous="$(cat "${STATE_FILE}" 2>/dev/null || true)"
if [[ "${previous}" != "${current}" || "${missing_before}" -gt 0 ]]; then
  log "OK${status} keep_alive=${KEEP_ALIVE} reloaded=${missing_before}"
  printf '%s\n' "${current}" >"${STATE_FILE}"
fi
exit 0
RUNTIME
chmod 700 "${PRELOAD_SCRIPT}"

MODELS_XML="$(xml_escape "${MODELS}")"
URL_XML="$(xml_escape "${OLLAMA_URL}")"
SCRIPT_XML="$(xml_escape "${PRELOAD_SCRIPT}")"
LOG_XML="$(xml_escape "${LOG_FILE}")"
KEEP_ALIVE_XML="$(xml_escape "${KEEP_ALIVE}")"

cat >"${PLIST}" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${SCRIPT_XML}</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>OLLAMA_URL</key>
    <string>${URL_XML}</string>
    <key>OLLAMA_MODELS</key>
    <string>${MODELS_XML}</string>
    <key>OLLAMA_KEEP_ALIVE</key>
    <string>${KEEP_ALIVE_XML}</string>
    <key>OLLAMA_PRELOAD_WAIT_SECONDS</key>
    <string>${WAIT_SECONDS}</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>${INTERVAL}</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>LowPriorityIO</key>
  <true/>
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
launchctl bootstrap "${DOMAIN}" "${PLIST}"
launchctl kickstart -k "${DOMAIN}/${LABEL}"

echo "已安裝 ${LABEL}。"
echo "  模型：${MODELS}"
echo "  keep_alive：${KEEP_ALIVE}"
echo "  重新確認間隔：${INTERVAL} 秒"
echo "  LaunchAgent：${PLIST}"
echo "  預載腳本：${PRELOAD_SCRIPT}"
echo "  日誌：${LOG_FILE}"
echo
echo "等待模型載入…"
ready=0
for _ in $(seq 1 90); do
  PS_JSON="$(curl -sS --max-time 3 "${OLLAMA_URL}/api/ps" 2>/dev/null || true)"
  missing=0
  for model in ${MODELS}; do
    if ! printf '%s' "${PS_JSON}" | tr -d ' ' | grep -F "\"name\":\"${model}\"" >/dev/null; then
      missing=1
    fi
  done
  infinite=1
  if command -v python3 >/dev/null 2>&1; then
    if ! printf '%s' "${PS_JSON}" | python3 -c '
import json
import sys

raw = sys.stdin.read()
try:
    loaded = {item.get("name"): item for item in json.loads(raw).get("models", [])}
except Exception:
    sys.exit(1)
for name in sys.argv[1:]:
    value = str((loaded.get(name) or {}).get("expires_at") or "")
    if not value[:4].isdigit() or int(value[:4]) < 2100:
        sys.exit(1)
' ${MODELS}; then
      infinite=0
    fi
  fi
  if (( missing == 0 && infinite == 1 )); then
    ready=1
    break
  fi
  sleep 1
done

if (( ready != 1 )); then
  echo "警告：部分模型尚未載入或 keep_alive 尚未生效，請查看 ${LOG_FILE}。" >&2
  tail -n 20 "${LOG_FILE}" >&2 || true
  exit 1
fi

echo "完成。目前載入狀態："
curl -sS --max-time 10 "${OLLAMA_URL}/api/ps" | python3 -m json.tool 2>/dev/null \
  || curl -sS --max-time 10 "${OLLAMA_URL}/api/ps"
echo
echo "常用指令："
echo "  launchctl print ${DOMAIN}/${LABEL}"
echo "  launchctl kickstart -k ${DOMAIN}/${LABEL}"
echo "  tail -f ${LOG_FILE}"
echo "  bash $0 --status"
echo "  bash $0 --uninstall"
