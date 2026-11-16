#!/usr/bin/env bash
# Preload Ollama models at boot on x570 (Linux/systemd).
#
# Ollama does not keep models in memory across reboots by itself.  This
# installs a small oneshot service that loads each requested model after
# ollama.service starts.  Chat models are loaded through /api/generate;
# embedding-only models (which reject /api/generate) fall back to /api/embed.
# keep_alive=-1 keeps the models resident until they are explicitly unloaded
# or Ollama restarts.
#
# Recommended usage from the MBP:
#   scp scripts/deploy_ollama_preload_systemd.sh x570:/tmp/
#   ssh -t x570 'sudo bash /tmp/deploy_ollama_preload_systemd.sh'
#
# Optional environment variables:
#   OLLAMA_MODELS="gemma3:4b bge-m3:latest"   # space-separated list
#   OLLAMA_URL=http://127.0.0.1:11434
#   OLLAMA_KEEP_ALIVE=-1          # -1 = keep loaded; "30m" also works
#   OLLAMA_SERVICE=ollama         # systemd unit name without .service
#   OLLAMA_PRELOAD_SERVICE_NAME=judgment-ollama-preload
#   OLLAMA_PRELOAD_WAIT_SECONDS=300
#
# Examples:
#   sudo bash /tmp/deploy_ollama_preload_systemd.sh
#   sudo OLLAMA_MODELS="gemma3:4b bge-m3:latest" OLLAMA_KEEP_ALIVE=-1 \
#     bash /tmp/deploy_ollama_preload_systemd.sh
#   sudo bash /tmp/deploy_ollama_preload_systemd.sh --uninstall
set -euo pipefail

MODELS="${OLLAMA_MODELS:-gemma3:4b bge-m3:latest}"
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
Preload Ollama models at boot on x570 (Linux/systemd).

Usage:
  scp scripts/deploy_ollama_preload_systemd.sh x570:/tmp/
  ssh -t x570 'sudo bash /tmp/deploy_ollama_preload_systemd.sh'

Options:
  --uninstall    Stop, disable and remove the preload service.
  --help         Show this help.

Optional environment variables:
  OLLAMA_MODELS="gemma3:4b bge-m3:latest"
  OLLAMA_URL=http://127.0.0.1:11434
  OLLAMA_KEEP_ALIVE=-1
  OLLAMA_SERVICE=ollama
  OLLAMA_PRELOAD_SERVICE_NAME=judgment-ollama-preload
  OLLAMA_PRELOAD_WAIT_SECONDS=300
EOF
}

json_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "${value}"
}

if [[ "${KEEP_ALIVE}" =~ ^-?[0-9]+$ ]]; then
  KEEP_ALIVE_JSON="${KEEP_ALIVE}"
else
  KEEP_ALIVE_JSON="\"${KEEP_ALIVE}\""
fi

unload_model() {
  local model="$1"
  local model_json
  model_json="$(json_escape "${model}")"
  curl -fsS --max-time 30 -X POST "${OLLAMA_URL}/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${model_json}\",\"keep_alive\":0}" >/dev/null 2>&1 || true
  # Embedding-only models reject /api/generate; /api/embed can unload them too.
  curl -fsS --max-time 30 -X POST "${OLLAMA_URL}/api/embed" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${model_json}\",\"input\":\"unload\",\"keep_alive\":0}" >/dev/null 2>&1 || true
}

uninstall() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl disable --now "${SERVICE_NAME}.service" 2>/dev/null || true
  fi
  rm -f "${SERVICE_FILE}" "${PRELOAD_SCRIPT}"
  rmdir "${INSTALL_DIR}" 2>/dev/null || true
  systemctl daemon-reload 2>/dev/null || true
  for model in ${MODELS}; do
    unload_model "${model}"
  done
  echo "已移除 ${SERVICE_NAME}.service，並嘗試卸載 ${MODELS}。"
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

install -d -m 0755 "${INSTALL_DIR}"
cat >"${PRELOAD_SCRIPT}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

OLLAMA_URL="${OLLAMA_URL:-http://127.0.0.1:11434}"
KEEP_ALIVE="${OLLAMA_KEEP_ALIVE:--1}"
WAIT_SECONDS="${OLLAMA_PRELOAD_WAIT_SECONDS:-300}"
MODELS="$*"

if [[ -z "${MODELS}" ]]; then
  echo "usage: ollama-preload.sh <model> [model...]" >&2
  exit 2
fi

# keep_alive is a JSON number for -1/seconds and a JSON string for "30m".
if [[ "${KEEP_ALIVE}" =~ ^-?[0-9]+$ ]]; then
  KEEP_ALIVE_JSON="${KEEP_ALIVE}"
else
  KEEP_ALIVE_JSON="\"${KEEP_ALIVE}\""
fi

json_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "${value}"
}

api_ready() {
  curl -fsS --max-time 3 "${OLLAMA_URL}/api/version" >/dev/null 2>&1
}

load_model() {
  local model="$1"
  local model_json payload
  model_json="$(json_escape "${model}")"
  payload="$(curl -sS --max-time "${WAIT_SECONDS}" -X POST "${OLLAMA_URL}/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${model_json}\",\"prompt\":\"\",\"stream\":false,\"keep_alive\":${KEEP_ALIVE_JSON},\"options\":{\"num_predict\":1}}" \
    2>&1 || true)"
  if ! printf '%s' "${payload}" | grep -qE '"(done|embeddings)"'; then
    # Embedding-only models reject /api/generate; load them through /api/embed.
    payload="$(curl -sS --max-time "${WAIT_SECONDS}" -X POST "${OLLAMA_URL}/api/embed" \
      -H 'Content-Type: application/json' \
      -d "{\"model\":\"${model_json}\",\"input\":\"warmup\",\"keep_alive\":${KEEP_ALIVE_JSON}}" \
      2>&1 || true)"
  fi
  if printf '%s' "${payload}" | grep -qE '"(done|embeddings)"'; then
    return 0
  fi
  echo "ERROR ${model}: $(printf '%s' "${payload}" | tr '\n' ' ' | cut -c1-300)" >&2
  return 1
}

waited=0
while ! api_ready; do
  if (( waited >= WAIT_SECONDS )); then
    echo "Ollama API 未就緒：${OLLAMA_URL}" >&2
    exit 1
  fi
  sleep 2
  waited=$((waited + 2))
done

failures=0
load_errors=""
for model in ${MODELS}; do
  if ! load_model "${model}"; then
    failures=$((failures + 1))
    load_errors="${load_errors} ${model}=error"
  fi
done

sleep 1
PS_JSON="$(curl -sS --max-time 5 "${OLLAMA_URL}/api/ps" 2>/dev/null || true)"
status=""
for model in ${MODELS}; do
  if ! printf '%s' "${PS_JSON}" | tr -d ' ' | grep -F "\"name\":\"${model}\"" >/dev/null; then
    failures=$((failures + 1))
    status="${status} ${model}=not-loaded"
    continue
  fi
  if command -v python3 >/dev/null 2>&1; then
    if ! printf '%s' "${PS_JSON}" | python3 -c '
import json
import sys

try:
    loaded = {item.get("name"): item for item in json.load(sys.stdin).get("models", [])}
except Exception:
    sys.exit(1)
value = str((loaded.get(sys.argv[1]) or {}).get("expires_at") or "")
if not value[:4].isdigit() or int(value[:4]) < 2100:
    sys.exit(1)
' "${model}"; then
      failures=$((failures + 1))
      status="${status} ${model}=keep_alive-not-applied"
      continue
    fi
  fi
  status="${status} ${model}=ok"
done

status="${load_errors}${status}"
if (( failures > 0 )); then
  echo "FAILED${status}" >&2
  exit 1
fi

echo "OK${status} keep_alive=${KEEP_ALIVE}"
EOF
chmod 0755 "${PRELOAD_SCRIPT}"

cat >"${SERVICE_FILE}" <<EOF
[Unit]
Description=Preload Ollama models (${MODELS})
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
ExecStart=${PRELOAD_SCRIPT} ${MODELS}
RemainAfterExit=yes
TimeoutStartSec=$((WAIT_SECONDS + 300))
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

echo -n "等待模型載入：${MODELS}"
ready=0
for _ in $(seq 1 90); do
  PS_JSON="$(curl -fsS --max-time 3 "${OLLAMA_URL}/api/ps" 2>/dev/null || true)"
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

try:
    loaded = {item.get("name"): item for item in json.load(sys.stdin).get("models", [])}
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
    echo " OK"
    break
  fi
  echo -n "."
  sleep 1
done

if [[ "${ready}" != "1" ]]; then
  echo
  echo "警告：部分模型尚未載入或 keep_alive 尚未生效，最近 log：" >&2
  journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager 2>/dev/null || true
  exit 1
fi

echo
echo "完成。"
echo "服務：${SERVICE_NAME}.service（已設為開機自動啟動）"
echo "模型：${MODELS}（keep_alive=${KEEP_ALIVE}）"
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
