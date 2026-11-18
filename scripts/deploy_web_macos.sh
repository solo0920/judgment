#!/usr/bin/env bash
# Install the Judgment web console as a per-user LaunchAgent on macOS.
#
# The MBP runs the FastAPI backend plus PostgreSQL/Qdrant containers.  Without
# a LaunchAgent the backend only comes up when someone runs ./up.sh by hand,
# so the Cloudflare tunnel has no origin after a reboot.  This installs
# com.judgment.web, which runs scripts/mbp_web_autostart.sh at login.  That
# wrapper waits for the Docker daemon (OrbStack/Docker Desktop may still be
# starting) and then runs the idempotent ./up.sh.
#
# Usage:
#   bash scripts/deploy_web_macos.sh
#   bash scripts/deploy_web_macos.sh --status
#   bash scripts/deploy_web_macos.sh --restart
#   bash scripts/deploy_web_macos.sh --uninstall
#
# Optional environment variables:
#   JUDGMENT_WEB_AGENT_LABEL=com.judgment.web
#   JUDGMENT_REPO_DIR=/path/to/judgment
#   JUDGMENT_PORT=9200
set -euo pipefail

LABEL="${JUDGMENT_WEB_AGENT_LABEL:-com.judgment.web}"
DOMAIN="gui/$(id -u)"
PORT="${JUDGMENT_PORT:-9200}"
TMUX_SESSION="${JUDGMENT_WEB_TMUX_SESSION:-judgment-web}"
REPO_DIR="${JUDGMENT_REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
WRAPPER="${REPO_DIR}/scripts/mbp_web_autostart.sh"
PLIST="${HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG_FILE="${HOME}/Library/Logs/judgment-web-autostart.log"

usage() {
  cat <<'EOF'
Install the Judgment web console as a per-user LaunchAgent on macOS.

Usage:
  bash scripts/deploy_web_macos.sh
  bash scripts/deploy_web_macos.sh --status
  bash scripts/deploy_web_macos.sh --restart
  bash scripts/deploy_web_macos.sh --uninstall
  bash scripts/deploy_web_macos.sh --help

Optional environment variables:
  JUDGMENT_WEB_AGENT_LABEL=com.judgment.web
  JUDGMENT_REPO_DIR=/path/to/judgment
  JUDGMENT_PORT=9200
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

api_ready() {
  curl -fsS --max-time 3 "http://127.0.0.1:${PORT}/api/health" 2>/dev/null \
    | grep -q '"status":"ok"'
}

agent_loaded() {
  launchctl print "${DOMAIN}/${LABEL}" >/dev/null 2>&1
}

show_status() {
  echo "LaunchAgent：${LABEL}"
  if [[ -f "${PLIST}" ]]; then
    echo "Plist：${PLIST}"
  else
    echo "Plist：未安裝"
  fi
  echo "程式：${WRAPPER}"
  echo "儲存庫：${REPO_DIR}"
  echo "健康檢查：http://127.0.0.1:${PORT}/api/health"
  echo "日誌：${LOG_FILE}"
  echo
  if agent_loaded; then
    echo "launchd：已載入"
    launchctl print "${DOMAIN}/${LABEL}" 2>/dev/null \
      | grep -E '^\s*(state|pid|last exit code|program) =' | sed 's/^/  /' || true
  else
    echo "launchd：未載入"
  fi
  if api_ready; then
    echo "後端：運作中（/api/health status=ok）"
  else
    echo "後端：沒有回應" >&2
  fi
  if [[ -f "${LOG_FILE}" ]]; then
    echo
    echo "最近日誌："
    tail -n 10 "${LOG_FILE}" | sed 's/^/  /'
  fi
  api_ready
}

wait_for_backend() {
  local label="$1"
  local attempts="${2:-120}"
  echo -n "等待後端就緒"
  local _ ready=0
  for _ in $(seq 1 "${attempts}"); do
    if api_ready; then
      ready=1
      echo " OK"
      break
    fi
    echo -n "."
    sleep 1
  done
  if [[ "${ready}" != "1" ]]; then
    echo
    echo "警告：${label} 未就緒，最近日誌：" >&2
    tail -n 60 "${LOG_FILE}" >&2 || true
    tail -n 40 "${REPO_DIR}/.run/web.log" >&2 || true
    return 1
  fi
}

restart_agent() {
  if ! agent_loaded; then
    echo "尚未載入 ${LABEL}；請先執行 bash $0。" >&2
    exit 1
  fi
  # up.sh is idempotent and leaves a healthy backend alone, so stop the
  # current process first; otherwise edits to .env would never be reloaded.
  stop_backend
  launchctl kickstart -k "${DOMAIN}/${LABEL}"
  wait_for_backend "${LABEL}" 180
  echo "已重啟 ${LABEL}（含後端，會重新載入 .env）。"
}

stop_backend() {
  if command -v tmux >/dev/null 2>&1; then
    tmux kill-session -t "${TMUX_SESSION}" >/dev/null 2>&1 || true
  fi
  local _ pid
  for _ in $(seq 1 20); do
    if ! lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  pid="$(lsof -nP -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
  if [[ -n "${pid}" ]]; then
    echo "連接埠 ${PORT} 仍被 pid ${pid} 佔用，嘗試終止…"
    kill "${pid}" 2>/dev/null || true
    for _ in $(seq 1 10); do
      kill -0 "${pid}" 2>/dev/null || return 0
      sleep 0.5
    done
    kill -9 "${pid}" 2>/dev/null || true
  fi
}

uninstall() {
  launchctl bootout "${DOMAIN}/${LABEL}" >/dev/null 2>&1 \
    || launchctl bootout "${DOMAIN}" "${PLIST}" >/dev/null 2>&1 \
    || true
  rm -f "${PLIST}"
  echo "已移除 ${LABEL}。"
  echo "後端與 Docker 容器不會被停止；需要時執行 ./down.sh。"
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
    restart_agent
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

if [[ ! -f "${WRAPPER}" ]]; then
  echo "找不到啟動包裝腳本：${WRAPPER}" >&2
  exit 1
fi
if [[ ! -x "${WRAPPER}" ]]; then
  chmod 755 "${WRAPPER}"
fi
if [[ ! -f "${REPO_DIR}/up.sh" ]]; then
  echo "找不到 ${REPO_DIR}/up.sh；請確認 JUDGMENT_REPO_DIR。" >&2
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "警告：目前 PATH 找不到 docker；LaunchAgent 會在登入後等待 Docker。" >&2
fi

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "${value}"
}

WRAPPER_XML="$(xml_escape "${WRAPPER}")"
LOG_XML="$(xml_escape "${LOG_FILE}")"

mkdir -p "${HOME}/Library/LaunchAgents" "${HOME}/Library/Logs"

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
    <string>${WRAPPER_XML}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>ThrottleInterval</key>
  <integer>30</integer>
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
# bootstrap starts the job because RunAtLoad=true; do not kickstart again or
# two ./up.sh runs would race each other.
launchctl bootstrap "${DOMAIN}" "${PLIST}"

echo "已安裝 ${LABEL}。"
echo "  Plist：${PLIST}"
echo "  日誌：${LOG_FILE}"
echo "  後端：http://127.0.0.1:${PORT}/"
echo

wait_for_backend "${LABEL}" 240

echo
echo "完成。登入後會自動執行 ./up.sh（已啟動時不會重複啟動）。"
echo
echo "常用指令："
echo "  bash $0 --status"
echo "  bash $0 --restart"
echo "  launchctl print ${DOMAIN}/${LABEL}"
echo "  launchctl kickstart -k ${DOMAIN}/${LABEL}"
echo "  tail -f ${LOG_FILE}"
echo "  bash $0 --uninstall"
