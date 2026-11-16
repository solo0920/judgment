#!/usr/bin/env bash
# Deploy all three x570 llama-server services from the MBP.
#
#   judgment-llm-chat        gemma3:4b            http://x570:11436/v1
#   judgment-llm-embedding   bge-m3               http://x570:11437/v1
#   judgment-reranker        bge-reranker-v2-m3   http://x570:11435/v1
#
# The single installer is copied to /tmp on x570, run with sudo, and the
# systemd units plus HTTP endpoints are verified from the MBP afterwards.
#
# Usage:
#   bash scripts/deploy_x570_llama_services.sh
#   X570_HOST=solo@x570 bash scripts/deploy_x570_llama_services.sh
#   bash scripts/deploy_x570_llama_services.sh --uninstall
#   bash scripts/deploy_x570_llama_services.sh --skip-rerank
#
# If scp/ssh is unavailable, the script falls back to Taildrop when the
# `tailscale` CLI exists; the printed commands can then be run on x570.
set -euo pipefail

cd "$(dirname "$0")/.."

SSH_HOST="${X570_HOST:-x570}"
API_HOST="${X570_API_HOST:-${SSH_HOST#*@}}"
INSTALLER="scripts/deploy_llama_services_systemd.sh"
REMOTE="/tmp/judgment-llama-services.sh"
CONTROL_PATH="/tmp/judgment-x570-ssh-%C"
CHAT_URL="${JUDGMENT_X570_LLM_URL:-http://${API_HOST}:11436}"
EMBEDDING_URL="${JUDGMENT_X570_EMBEDDING_URL:-http://${API_HOST}:11437}"
RERANK_URL="${RERANK_URL:-http://${API_HOST}:11435}"
CHAT_MODEL="${CHAT_MODEL:-gemma3:4b}"
EMBEDDING_MODEL="${EMBEDDING_MODEL:-bge-m3}"
RERANK_MODEL="${RERANK_MODEL:-bge-reranker-v2-m3}"
UNINSTALL=0
SKIP_RERANK=0

usage() {
  cat <<'EOF'
Deploy the x570 llama-server chat, embedding and reranker services.

Usage:
  bash scripts/deploy_x570_llama_services.sh [options]

Options:
  --uninstall     Stop, disable and remove all three services on x570.
  --skip-rerank   Install only chat and embedding.
  --help          Show this help.

Environment:
  X570_HOST=solo@x570
  X570_API_HOST=x570
  X570_SUDO_ENV="LLAMA_SERVER_BIN=/usr/local/lib/ollama/llama-server"
  LLAMA_SERVER_BIN=/path/to/llama-server
  LLAMA_LIB_DIR=/path/to/llama/libs
  CHAT_CTX_SIZE=8192
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --uninstall) UNINSTALL=1 ;;
    --skip-rerank) SKIP_RERANK=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知參數：$1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

if [[ ! -f "${INSTALLER}" ]]; then
  echo "找不到 ${INSTALLER}；請在 repo 根目錄執行。" >&2
  exit 1
fi

REMOTE_FLAGS=""
if [[ "${SKIP_RERANK}" == "1" ]]; then
  REMOTE_FLAGS="--skip-rerank"
fi

taildrop_fallback() {
  if ! command -v tailscale >/dev/null 2>&1; then
    return 1
  fi
  echo >&2
  echo "scp/ssh 無法使用，改用 Taildrop 傳送安裝腳本…" >&2
  tailscale file cp "${INSTALLER}" "${SSH_HOST}:" || return 1
  echo >&2
  echo "檔案已透過 Taildrop 送到 ${SSH_HOST}。請在 x570 上執行：" >&2
  echo "  sudo bash ~/Downloads/$(basename "${INSTALLER}") ${REMOTE_FLAGS}" >&2
  echo >&2
  echo "完成後從 MBP 驗證：" >&2
  echo "  curl -s ${CHAT_URL}/v1/models" >&2
  echo "  curl -s ${EMBEDDING_URL}/v1/models" >&2
  echo "  curl -s ${RERANK_URL}/health" >&2
  return 1
}

if ! command -v scp >/dev/null 2>&1 || ! command -v ssh >/dev/null 2>&1; then
  taildrop_fallback
  exit 1
fi

SSH_OPTS=(
  -o ControlMaster=auto
  -o ControlPath="${CONTROL_PATH}"
  -o ControlPersist=120
)

cleanup() {
  ssh "${SSH_OPTS[@]}" -O exit "${SSH_HOST}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "複製安裝腳本到 ${SSH_HOST}:${REMOTE} …"
if ! scp "${SSH_OPTS[@]}" "${INSTALLER}" "${SSH_HOST}:${REMOTE}"; then
  taildrop_fallback
  exit 1
fi

SUDO_ENV="${X570_SUDO_ENV:-}"
if [[ -n "${LLAMA_SERVER_BIN:-}" ]]; then
  SUDO_ENV="${SUDO_ENV} LLAMA_SERVER_BIN=${LLAMA_SERVER_BIN}"
fi
if [[ -n "${LLAMA_LIB_DIR:-}" ]]; then
  SUDO_ENV="${SUDO_ENV} LLAMA_LIB_DIR=${LLAMA_LIB_DIR}"
fi
if [[ -n "${CHAT_CTX_SIZE:-}" ]]; then
  SUDO_ENV="${SUDO_ENV} CHAT_CTX_SIZE=${CHAT_CTX_SIZE}"
fi

echo
if [[ "${UNINSTALL}" == "1" ]]; then
  echo "在 ${SSH_HOST} 上移除 llama-server 服務（需要 sudo 密碼）…"
  ssh "${SSH_OPTS[@]}" -t "${SSH_HOST}" \
    "sudo bash ${REMOTE} --uninstall"
  echo "完成。Ollama 本身仍保留；若要恢復開機預載："
  echo "  bash scripts/deploy_x570_ollama_preload.sh"
  exit 0
fi

echo "在 ${SSH_HOST} 上安裝 llama-server 服務（需要 sudo 密碼）…"
ssh "${SSH_OPTS[@]}" -t "${SSH_HOST}" \
  "sudo ${SUDO_ENV} bash ${REMOTE} ${REMOTE_FLAGS}"

echo
echo "驗證 systemd 開機設定 …"
units=(
  judgment-llm-chat.service
  judgment-llm-embedding.service
)
if [[ "${SKIP_RERANK}" != "1" ]]; then
  units+=(judgment-reranker.service)
fi
for unit in "${units[@]}"; do
  enabled="$(ssh "${SSH_OPTS[@]}" "${SSH_HOST}" "systemctl is-enabled ${unit}" 2>/dev/null || true)"
  active="$(ssh "${SSH_OPTS[@]}" "${SSH_HOST}" "systemctl is-active ${unit}" 2>/dev/null || true)"
  echo "  ${unit}: enabled=${enabled:-unknown} active=${active:-unknown}"
  if [[ "${enabled}" != "enabled" || "${active}" != "active" ]]; then
    echo "systemd 驗證失敗：${unit}" >&2
    exit 1
  fi
done

preload_enabled="$(ssh "${SSH_OPTS[@]}" "${SSH_HOST}" \
  'systemctl is-enabled judgment-ollama-preload.service 2>/dev/null || true')"
echo "  judgment-ollama-preload.service: enabled=${preload_enabled:-unknown}"
if [[ "${preload_enabled}" == "enabled" ]]; then
  echo "警告：Ollama 預載服務仍為 enabled，會與 llama-server 重複占用 VRAM。" >&2
fi

echo
echo "驗證 chat ${CHAT_URL}/v1/chat/completions …"
curl -fsS --max-time 120 "${CHAT_URL}/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"${CHAT_MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"只回答 OK\"}],\"max_tokens\":16,\"temperature\":0,\"stream\":false}" \
  | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
content = ((payload.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
if not content.strip():
    print("FAIL：chat 回應沒有 content", file=sys.stderr)
    sys.exit(1)
print(f"OK：{content.strip()[:80]}")
'

echo "驗證 embedding ${EMBEDDING_URL}/v1/embeddings …"
curl -fsS --max-time 120 "${EMBEDDING_URL}/v1/embeddings" \
  -H 'Content-Type: application/json' \
  -d "{\"model\":\"${EMBEDDING_MODEL}\",\"input\":[\"測試\"]}" \
  | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
vector = ((payload.get("data") or [{}])[0].get("embedding") or [])
if len(vector) != 1024:
    print(f"FAIL：embedding 維度 {len(vector)}，預期 1024", file=sys.stderr)
    sys.exit(1)
print("OK：1024 維")
'

if [[ "${SKIP_RERANK}" != "1" ]]; then
  echo "驗證 reranker ${RERANK_URL}/v1/rerank …"
  curl -fsS --max-time 60 "${RERANK_URL}/v1/rerank" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${RERANK_MODEL}\",\"query\":\"保險理賠\",\"documents\":[\"保險理賠範圍\",\"公司法\"]}" \
    | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
results = payload.get("results") or []
if not results:
    print("FAIL：rerank 沒有 results", file=sys.stderr)
    sys.exit(1)
print(f"OK：{len(results)} 筆")
'
fi

echo
echo "完成。請在 MBP 的 .env 設定："
echo "  LLM_URL=${CHAT_URL}"
echo "  LLM_API=openai"
echo "  LLM_MODEL=${CHAT_MODEL}"
echo "  LLM_FALLBACK_URL=http://127.0.0.1:11434"
echo "  LLM_FALLBACK_MODEL=${CHAT_MODEL}"
echo "  LLM_FALLBACK_API=ollama"
echo "  EMBEDDING_URL=${EMBEDDING_URL}"
echo "  EMBEDDING_API=openai"
echo "  EMBEDDING_MODEL=${EMBEDDING_MODEL}"
echo "  EMBEDDING_FALLBACK_URL=http://127.0.0.1:11434"
echo "  EMBEDDING_FALLBACK_API=ollama"
echo "  RERANK_URL=${RERANK_URL}"
echo "  RERANK_MODEL=${RERANK_MODEL}"
echo
echo "也可以直接執行 bash up.sh，讓它自動偵測 x570 llama-server。"
echo "若要驗證真正的開機行為，請重開 x570，再執行："
echo "  systemctl is-enabled judgment-llm-chat judgment-llm-embedding judgment-reranker"
echo "  curl -s ${CHAT_URL}/v1/models"
echo "  curl -s ${EMBEDDING_URL}/v1/models"
echo "  curl -s ${RERANK_URL}/health"