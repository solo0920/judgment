#!/usr/bin/env bash
# Preload an Ollama model at boot on x570 (Linux/systemd).
#
# Ollama does not keep a model in memory across reboots by itself.  This
# installs a small oneshot service that calls /api/generate with an empty
# prompt after ollama.service starts.  keep_alive=-1 keeps the model resident
# until it is explicitly unloaded or Ollama restarts.
#
# Recommended usage from the MBP:
#   scp scripts/deploy_ollama_preload_systemd.sh x570:/tmp/
#   ssh -t x570 'sudo bash /tmp/deploy_ollama_preload_systemd.sh'
#
# Optional environment variables:
#   OLLAMA_MODEL=gemma3:4b
#   OLLAMA_URL=http://127.0.0.1:11434
#   OLLAMA_KEEP_ALIVE=-1          # -1 = keep loaded; "30m" also works
#   OLLAMA_SERVICE=ollama         # systemd unit name without .service
#   OLLAMA_PRELOAD_SERVICE_NAME=judgment-ollama-preload
#   OLLAMA_PRELOAD_WAIT_SECONDS=300
#
# Examples:
#   sudo bash /tmp/deploy_ollama_preload_systemd.sh
#   sudo OLLAMA_MODEL=gemma3:4b OLLAMA_KEEP_ALIVE=-1 \
#     bash /tmp/deploy_ollama_preload_systemd.sh
#   sudo bash /tmp/deploy_ollama_preload_systemd.sh --uninstall
set -euo pipefail

MODEL="${OLLAMA_MODEL:-gemma3:4b}"
OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
OLLAMA_SERVICE="${OLLAMA_SERVICE:-ollama}"
SERVICE_NAME="${OLLAMA_PRELOAD_SERVICE_NAME:-judgment-ollama-preload}"
WAIT_SECONDS="${OLLAMA_PRELOAD_WAIT_SECONDS:-300}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
INSTALL_DIR="/usr/local/lib/judgment"
PRELOAD_SCRIPT="${INSTALL_DIR}/ollama-preload.sh"

usage() {
  cat <<'EOF'
Preload an Ollama model at boot on x570 (Linux/systemd).

Usage:
  scp scripts/deploy_ollama_preload_systemd.sh x570:/tmp/
  ssh -t x570 'sudo bash /tmp/deploy_ollama_preload_systemd.sh'

Options:
  --uninstall    Stop, disable and remove the preload service.
  --help         Show this help.

Optional environment variables:
  OLLAMA_MODEL=gemma3:4b
  OLLAMA_URL=http://127.0.0.1:11434
  OLLAMA_KEEP_ALIVE=-1
  OLLAMA_SERVICE=ollama
  OLLAMA_PRELOAD_SERVICE_NAME=judgment-ollama-preload
  OLLAMA_PRELOAD_WAIT_SECONDS=300
EOF
}

uninstall() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl disable --now "${SERVICE_NAME}.service" 2>/dev/null || true
  fi
  rm -f "${SERVICE_FILE}" "${PRELOAD_SCRIPT}"
  rmdir "${INSTALL_DIR}" 2>/dev/null || true
  systemctl daemon-reload 2>/dev/null || true
  curl -fsS --max-time 30 -X POST "${OLLAMA_URL}/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${MODEL}\",\"keep_alive\":0}" >/dev/null 2>&1 || true
  echo "已移除 ${SERVICE_NAME}.service，並嘗試卸載 ${MODEL}。"
}

case "${1:-}" in
  -h|--help)
    usage
    exit 0
    ;;
  --uninstall)
    if [[ "$(id -u)" -ne 0 ]]; then
      echo "請使用 sudo 執行 --uninstall。" >&2
      exit 1
    fi
    uninstall
    exit 0
    ;;
esac

if [[ "$(id -u)" -ne 0 ]]; then
  echo "請使用 sudo 執行此腳本。" >&2
  echo "  sudo bash $0" >&2
  exit 1
fi

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "此腳本只支援 Linux／systemd（目前：$(uname -s)）。" >&2
  exit 1
fi

if ! command -v systemctl >/dev/null 2>&1; then
  echo "找不到 systemctl；請確認 x570 使用 systemd。" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "找不到 curl；請先安裝 curl。" >&2
  exit 1
fi

if ! systemctl cat "${OLLAMA_SERVICE}.service" >/dev/null 2>&1; then
  echo "找不到 ${OLLAMA_SERVICE}.service；請確認 Ollama 已安裝。" >&2
  echo "可用 OLLAMA_SERVICE=你的服務名稱 指定。" >&2
  exit 1
fi

if ! curl -fsS --max-time 5 "${OLLAMA_URL}/api/version" >/dev/null 2>&1; then
  echo "Ollama 目前沒有回應：${OLLAMA_URL}" >&2
  echo "請先啟動：sudo systemctl start ${OLLAMA_SERVICE}.service" >&2
  exit 1
fi

if ! curl -fsS --max-time 10 "${OLLAMA_URL}/api/tags" \
  | tr -d ' ' | grep -F "\"name\":\"${MODEL}\"" >/dev/null; then
  echo "找不到模型 ${MODEL}。" >&2
  echo "請先在 x570 執行：" >&2
  echo "  ollama pull ${MODEL}" >&2
  exit 1
fi

install -d -m 0755 "${INSTALL_DIR}"
cat >"${PRELOAD_SCRIPT}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

MODEL="${1:?usage: ollama-preload.sh <model>}"
OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
WAIT_SECONDS="${OLLAMA_PRELOAD_WAIT_SECONDS:-300}"

# keep_alive is a JSON number for -1/seconds and a JSON string for "30m".
if [[ "${KEEP_ALIVE}" =~ ^-?[0-9]+$ ]]; then
  KEEP_ALIVE_JSON="${KEEP_ALIVE}"
else
  KEEP_ALIVE_JSON="\"${KEEP_ALIVE}\""
fi

curl -fsS \
  --retry 60 \
  --retry-delay 2 \
  --retry-connrefused \
  --max-time "${WAIT_SECONDS}" \
  -X POST "${OLLAMA_URL}/api/generate" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"${MODEL}\",\"keep_alive\":${KEEP_ALIVE_JSON},\"stream\":false}" \
  >/dev/null
EOF
chmod 0755 "${PRELOAD_SCRIPT}"

cat >"${SERVICE_FILE}" <<EOF
[Unit]
Description=Preload ${MODEL} into Ollama
Documentation=https://github.com/solo0920/judgment
After=network-online.target ${OLLAMA_SERVICE}.service
Wants=network-online.target
Requires=${OLLAMA_SERVICE}.service
PartOf=${OLLAMA_SERVICE}.service

[Service]
Type=oneshot
Environment=OLLAMA_URL=${OLLAMA_URL}
Environment=OLLAMA_KEEP_ALIVE=${KEEP_ALIVE}
Environment=OLLAMA_PRELOAD_WAIT_SECONDS=${WAIT_SECONDS}
ExecStart=${PRELOAD_SCRIPT} ${MODEL}
RemainAfterExit=yes
TimeoutStartSec=${WAIT_SECONDS}
Nice=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"
if ! systemctl restart "${SERVICE_NAME}.service"; then
  echo "警告：${SERVICE_NAME}.service 啟動失敗，最近 log：" >&2
  journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager 2>/dev/null || true
  exit 1
fi

echo -n "等待 ${MODEL} 載入"
ready=0
for _ in $(seq 1 60); do
  if curl -fsS --max-time 2 "${OLLAMA_URL}/api/ps" \
    | tr -d ' ' | grep -F "\"name\":\"${MODEL}\"" >/dev/null; then
    ready=1
    echo " OK"
    break
  fi
  echo -n "."
  sleep 1
done

if [[ "${ready}" != "1" ]]; then
  echo
  echo "警告：${MODEL} 尚未載入，最近 log：" >&2
  journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager 2>/dev/null || true
  exit 1
fi

echo
echo "完成。"
echo "服務：${SERVICE_NAME}.service（已設為開機自動啟動）"
echo "模型：${MODEL}（keep_alive=${KEEP_ALIVE}）"
echo "Ollama：${OLLAMA_URL}"
echo
echo "目前載入狀態："
curl -fsS "${OLLAMA_URL}/api/ps" || true
echo
echo "常用指令："
echo "  sudo systemctl status ${SERVICE_NAME}.service"
echo "  sudo systemctl restart ${SERVICE_NAME}.service"
echo "  sudo journalctl -u ${SERVICE_NAME}.service -f"
echo "  curl -sS ${OLLAMA_URL}/api/ps"
echo
echo "注意：若之後有請求送出較短的 keep_alive（例如 30m），該模型仍會在期限後卸載。"
echo "若要一直保留，請把應用端的 LLM_KEEP_ALIVE 設為 -1。"
