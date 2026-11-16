#!/usr/bin/env bash
# Install all three Judgment llama-server services on x570 (Linux).
#
#   judgment-reranker.service        bge-reranker-v2-m3   :11435  /v1/rerank
#   judgment-llm-chat.service        gemma3:4b            :11436  /v1/chat/completions
#   judgment-llm-embedding.service   bge-m3               :11437  /v1/embeddings
#
# Recommended usage from the MBP:
#   scp scripts/deploy_llama_services_systemd.sh x570:/tmp/
#   ssh -t x570 'sudo bash /tmp/deploy_llama_services_systemd.sh'
#
# The script is self-contained: x570 does not need the Judgment repository.
# It extracts the GGUF files already downloaded by Ollama, installs all three
# systemd units, disables the legacy Ollama preload unit (so VRAM is not used
# twice), enables everything at boot, and verifies the HTTP endpoints.
#
# Ollama itself stays installed. It is no longer the primary runtime for these
# three models; x570 primarily serves llama-server.
#
# Optional environment variables:
#   RERANK_PORT=11435
#   RERANK_HOST=0.0.0.0
#   RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
#   RERANK_MODEL_PATH=/path/to/model.gguf
#   CHAT_PORT=11436
#   CHAT_HOST=0.0.0.0
#   CHAT_OLLAMA_MODEL=gemma3:4b
#   CHAT_MODEL_PATH=/path/to/model.gguf
#   CHAT_CTX_SIZE=8192
#   EMBEDDING_PORT=11437
#   EMBEDDING_HOST=0.0.0.0
#   EMBEDDING_OLLAMA_MODEL=bge-m3:latest
#   EMBEDDING_MODEL_PATH=/path/to/model.gguf
#   EMBEDDING_CTX_SIZE=8192
#   LLAMA_SERVER_BIN=/path/to/llama-server
#   LLAMA_LIB_DIR=/path/to/llama/libs
#   JUDGMENT_SERVICE_USER=solo
#   JUDGMENT_INSTALL_DIR=/opt/judgment
#   JUDGMENT_INSTALL_RERANK=1
#   JUDGMENT_DISABLE_OLLAMA_PRELOAD=1
#
# Examples:
#   sudo bash /tmp/deploy_llama_services_systemd.sh
#   sudo LLAMA_SERVER_BIN=/usr/local/lib/ollama/llama-server \
#     bash /tmp/deploy_llama_services_systemd.sh
#   sudo bash /tmp/deploy_llama_services_systemd.sh --uninstall
set -euo pipefail

CHAT_SERVICE_NAME="${CHAT_SERVICE_NAME:-judgment-llm-chat}"
EMBEDDING_SERVICE_NAME="${EMBEDDING_SERVICE_NAME:-judgment-llm-embedding}"
RERANK_SERVICE_NAME="${RERANK_SERVICE_NAME:-judgment-reranker}"
SYSTEMD_DIR="${JUDGMENT_SYSTEMD_DIR:-/etc/systemd/system}"
CHAT_SERVICE_FILE="${SYSTEMD_DIR}/${CHAT_SERVICE_NAME}.service"
EMBEDDING_SERVICE_FILE="${SYSTEMD_DIR}/${EMBEDDING_SERVICE_NAME}.service"
RERANK_SERVICE_FILE="${SYSTEMD_DIR}/${RERANK_SERVICE_NAME}.service"
CHAT_PORT="${CHAT_PORT:-11436}"
CHAT_HOST="${CHAT_HOST:-0.0.0.0}"
EMBEDDING_PORT="${EMBEDDING_PORT:-11437}"
EMBEDDING_HOST="${EMBEDDING_HOST:-0.0.0.0}"
RERANK_PORT="${RERANK_PORT:-11435}"
RERANK_HOST="${RERANK_HOST:-0.0.0.0}"
INSTALL_DIR="${JUDGMENT_INSTALL_DIR:-/opt/judgment}"
MODEL_DIR="${INSTALL_DIR}/models"
CHAT_MODEL_TARGET="${MODEL_DIR}/gemma3-4b-q4_k_m.gguf"
EMBEDDING_MODEL_TARGET="${MODEL_DIR}/bge-m3-f16.gguf"
RERANK_MODEL_TARGET="${MODEL_DIR}/bge-reranker-v2-m3-q8_0.gguf"
CHAT_OLLAMA_MODEL="${CHAT_OLLAMA_MODEL:-gemma3:4b}"
EMBEDDING_OLLAMA_MODEL="${EMBEDDING_OLLAMA_MODEL:-bge-m3:latest}"
RERANK_OLLAMA_MODEL="${RERANK_OLLAMA_MODEL:-qllama/bge-reranker-v2-m3:latest}"
CHAT_CTX_SIZE="${CHAT_CTX_SIZE:-8192}"
EMBEDDING_CTX_SIZE="${EMBEDDING_CTX_SIZE:-8192}"
CHAT_ALIAS="${CHAT_ALIAS:-gemma3:4b}"
EMBEDDING_ALIAS="${EMBEDDING_ALIAS:-bge-m3}"
RERANK_ALIAS="${RERANK_ALIAS:-bge-reranker-v2-m3}"
INSTALL_RERANK="${JUDGMENT_INSTALL_RERANK:-1}"
OLLAMA_PRELOAD_SERVICE="${OLLAMA_PRELOAD_SERVICE:-judgment-ollama-preload}"
SERVICE_USER="${JUDGMENT_SERVICE_USER:-${SUDO_USER:-$(id -un)}}"

usage() {
  cat <<'EOF'
Install the Judgment chat, embedding and reranker llama-server services.

Usage:
  scp scripts/deploy_llama_services_systemd.sh x570:/tmp/
  ssh -t x570 'sudo bash /tmp/deploy_llama_services_systemd.sh'

Options:
  --uninstall      Stop, disable and remove all three systemd services.
  --skip-rerank    Install only chat and embedding.
  --help           Show this help.

Optional environment variables:
  RERANK_PORT=11435
  RERANK_HOST=0.0.0.0
  RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
  RERANK_MODEL_PATH=/path/to/model.gguf
  CHAT_PORT=11436
  CHAT_HOST=0.0.0.0
  CHAT_OLLAMA_MODEL=gemma3:4b
  CHAT_MODEL_PATH=/path/to/model.gguf
  CHAT_CTX_SIZE=8192
  EMBEDDING_PORT=11437
  EMBEDDING_HOST=0.0.0.0
  EMBEDDING_OLLAMA_MODEL=bge-m3:latest
  EMBEDDING_MODEL_PATH=/path/to/model.gguf
  EMBEDDING_CTX_SIZE=8192
  LLAMA_SERVER_BIN=/path/to/llama-server
  LLAMA_LIB_DIR=/path/to/llama/libs
  JUDGMENT_SERVICE_USER=solo
  JUDGMENT_INSTALL_DIR=/opt/judgment
  JUDGMENT_INSTALL_RERANK=1
  JUDGMENT_DISABLE_OLLAMA_PRELOAD=1
EOF
}

UNINSTALL=0
SKIP_RERANK=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --uninstall) UNINSTALL=1 ;;
    --skip-rerank) SKIP_RERANK=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知參數：$1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

if [[ "${SKIP_RERANK}" == "1" ]]; then
  INSTALL_RERANK=0
fi

service_files=("${CHAT_SERVICE_FILE}" "${EMBEDDING_SERVICE_FILE}")
service_names=("${CHAT_SERVICE_NAME}" "${EMBEDDING_SERVICE_NAME}")
if [[ "${INSTALL_RERANK}" == "1" ]]; then
  service_files+=("${RERANK_SERVICE_FILE}")
  service_names+=("${RERANK_SERVICE_NAME}")
fi

uninstall() {
  if command -v systemctl >/dev/null 2>&1; then
    for name in "${service_names[@]}"; do
      systemctl disable --now "${name}.service" 2>/dev/null || true
    done
  fi
  rm -f "${service_files[@]}"
  systemctl daemon-reload 2>/dev/null || true
  echo "已移除：${service_names[*]}"
  echo "模型仍保留在 ${MODEL_DIR}；如不需要可手動刪除。"
  echo "Ollama 本身仍保留；若要恢復開機預載："
  echo "  sudo systemctl enable --now ${OLLAMA_PRELOAD_SERVICE}.service"
}

if [[ "${UNINSTALL}" == "1" ]]; then
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "請使用 sudo 執行 --uninstall。" >&2
    exit 1
  fi
  uninstall
  exit 0
fi

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
    "/usr/local/lib/ollama/llama-server"
    "/usr/lib/ollama/llama-server"
    "/usr/local/bin/llama-server"
    "/usr/bin/llama-server"
    "/opt/llama.cpp/build/bin/llama-server"
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

if ! LLAMA_SERVER="$(find_llama_server)"; then
  echo "找不到 llama-server。" >&2
  echo "請設定 LLAMA_SERVER_BIN，例如：" >&2
  echo "  sudo LLAMA_SERVER_BIN=/usr/local/lib/ollama/llama-server bash $0" >&2
  echo "或先安裝 standalone llama.cpp（需支援 CUDA 12.8+）。" >&2
  exit 1
fi

LLAMA_BASE_DIR="$(cd "$(dirname "${LLAMA_SERVER}")" && pwd)"
if [[ -z "${LLAMA_LIB_DIR:-}" ]]; then
  LLAMA_LIB_DIR="${LLAMA_BASE_DIR}"
fi

# Ollama ships its CUDA backend in a subdirectory (e.g. cuda_v13).  The
# llama-server frontend silently falls back to CPU unless it can find
# libggml-cuda.so and GGML_BACKEND_PATH.
CUDA_BACKEND=""
for base in "${LLAMA_BASE_DIR}" ${LLAMA_LIB_DIR//:/ }; do
  [[ -d "${base}" ]] || continue
  CUDA_BACKEND="$(
    find "${base}" -maxdepth 2 -name 'libggml-cuda.so' -print -quit 2>/dev/null \
      || true
  )"
  if [[ -n "${CUDA_BACKEND}" ]]; then
    break
  fi
done
if [[ -n "${CUDA_BACKEND}" ]]; then
  CUDA_LIB_DIR="$(dirname "${CUDA_BACKEND}")"
  LLAMA_LIB_DIR="${LLAMA_BASE_DIR}:${CUDA_LIB_DIR}:${LLAMA_LIB_DIR}"
  export GGML_BACKEND_PATH="${CUDA_BACKEND}"
fi
export LD_LIBRARY_PATH="${LLAMA_LIB_DIR}:${LD_LIBRARY_PATH:-}"

if ! "${LLAMA_SERVER}" --version >/tmp/judgment-llama-version.log 2>&1; then
  echo "llama-server 無法執行，可能是缺少 shared library 或 CUDA runtime：" >&2
  cat /tmp/judgment-llama-version.log >&2 || true
  echo "可設定 LLAMA_LIB_DIR 指向 llama.cpp／Ollama 的 library 目錄。" >&2
  exit 1
fi

DEVICES="$("${LLAMA_SERVER}" --list-devices 2>&1 || true)"
if [[ -n "${DEVICES}" ]]; then
  echo "llama-server devices:"
  printf '%s\n' "${DEVICES}" | sed -n '1,12p'
fi
if ! printf '%s' "${DEVICES}" | grep -qiE 'CUDA|NVIDIA'; then
  echo "警告：llama-server 未偵測到 CUDA device；目前很可能會使用 CPU。" >&2
  echo "請確認 NVIDIA driver，或設定 LLAMA_LIB_DIR 指向正確的 cuda_v* 目錄。" >&2
fi

LLAMA_HELP="$("${LLAMA_SERVER}" --help 2>&1 || true)"
support_flag() {
  printf '%s' "${LLAMA_HELP}" | grep -q -- "$1"
}
JINJA_FLAG=""
if support_flag '--jinja'; then
  JINJA_FLAG="--jinja"
fi
NO_WEBUI_FLAG=""
if support_flag '--no-webui'; then
  NO_WEBUI_FLAG="--no-webui"
fi

ollama_gguf() {
  local model="$1"
  local path=""
  if command -v ollama >/dev/null 2>&1; then
    path="$(
      ollama show "${model}" --modelfile 2>/dev/null \
        | awk '/^FROM /{print $2; exit}'
    )"
  fi
  printf '%s\n' "${path}"
}

resolve_model() {
  local role="$1"
  local override="$2"
  local ollama_model="$3"
  local target="$4"
  local source=""
  if [[ -n "${override}" ]]; then
    source="${override}"
  else
    source="$(ollama_gguf "${ollama_model}")"
    if [[ -z "${source}" || ! -f "${source}" ]]; then
      echo "找不到 ${role} 模型 ${ollama_model} 的 GGUF（${source:-空}）。" >&2
      echo "請先在 x570 執行：ollama pull ${ollama_model}" >&2
      echo "或直接指定模型路徑。" >&2
      exit 1
    fi
  fi
  if [[ ! -f "${source}" ]]; then
    echo "找不到 ${role} 模型檔：${source}" >&2
    exit 1
  fi
install -d -m 0755 "${INSTALL_DIR}" "${MODEL_DIR}" "${SYSTEMD_DIR}"
  if [[ "${source}" != "${target}" ]]; then
    echo "複製 ${role} 模型到穩定路徑：${target}" >&2
    install -m 0644 "${source}" "${target}"
  fi
  printf '%s\n' "${target}"
}

CHAT_MODEL="$(resolve_model "chat" "${CHAT_MODEL_PATH:-}" "${CHAT_OLLAMA_MODEL}" "${CHAT_MODEL_TARGET}")"
EMBEDDING_MODEL="$(resolve_model "embedding" "${EMBEDDING_MODEL_PATH:-}" "${EMBEDDING_OLLAMA_MODEL}" "${EMBEDDING_MODEL_TARGET}")"
RERANK_MODEL=""
if [[ "${INSTALL_RERANK}" == "1" ]]; then
  RERANK_MODEL="$(resolve_model "reranker" "${RERANK_MODEL_PATH:-}" "${RERANK_OLLAMA_MODEL}" "${RERANK_MODEL_TARGET}")"
fi

if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
  echo "找不到服務使用者：${SERVICE_USER}" >&2
  echo "可用 JUDGMENT_SERVICE_USER=your-user 指定。" >&2
  exit 1
fi
SERVICE_GROUP="$(id -gn "${SERVICE_USER}")"

echo "llama-server：${LLAMA_SERVER}"
echo "chat 模型：${CHAT_MODEL}（$(du -h "${CHAT_MODEL}" | awk '{print $1}')） · 別名 ${CHAT_ALIAS}"
echo "embedding 模型：${EMBEDDING_MODEL}（$(du -h "${EMBEDDING_MODEL}" | awk '{print $1}')） · 別名 ${EMBEDDING_ALIAS}"
if [[ -n "${RERANK_MODEL}" ]]; then
  echo "reranker 模型：${RERANK_MODEL}（$(du -h "${RERANK_MODEL}" | awk '{print $1}')） · 別名 ${RERANK_ALIAS}"
fi
echo "服務使用者：${SERVICE_USER}:${SERVICE_GROUP}"
echo "監聽：rerank ${RERANK_HOST}:${RERANK_PORT} · chat ${CHAT_HOST}:${CHAT_PORT} · embedding ${EMBEDDING_HOST}:${EMBEDDING_PORT}"

BACKEND_ENV=""
if [[ -n "${CUDA_BACKEND}" ]]; then
  BACKEND_ENV="Environment=GGML_BACKEND_PATH=${CUDA_BACKEND}"
fi

write_unit() {
  local name="$1"
  local description="$2"
  local port="$3"
  local exec_args="$4"
  local file="${SYSTEMD_DIR}/${name}.service"

  cat >"${file}" <<EOF
[Unit]
Description=${description}
Documentation=https://github.com/solo0920/judgment
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_GROUP}
WorkingDirectory=${INSTALL_DIR}
Environment=LD_LIBRARY_PATH=${LLAMA_LIB_DIR}
${BACKEND_ENV}
ExecStart=${LLAMA_SERVER} ${exec_args}
Restart=on-failure
RestartSec=3
LimitNOFILE=65535
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${name}

[Install]
WantedBy=multi-user.target
EOF
  echo "已寫入 ${file}（port ${port}）"
}

write_unit \
  "${CHAT_SERVICE_NAME}" \
  "Judgment Chat LLM (llama.cpp, ${CHAT_ALIAS})" \
  "${CHAT_PORT}" \
  "--model ${CHAT_MODEL} --alias ${CHAT_ALIAS} --host ${CHAT_HOST} --port ${CHAT_PORT} ${JINJA_FLAG} --gpu-layers all --ctx-size ${CHAT_CTX_SIZE} --batch-size 1024 --ubatch-size 512 ${NO_WEBUI_FLAG}"

write_unit \
  "${EMBEDDING_SERVICE_NAME}" \
  "Judgment Embedding (llama.cpp, ${EMBEDDING_ALIAS})" \
  "${EMBEDDING_PORT}" \
  "--model ${EMBEDDING_MODEL} --alias ${EMBEDDING_ALIAS} --host ${EMBEDDING_HOST} --port ${EMBEDDING_PORT} --embedding --pooling cls --gpu-layers all --ctx-size ${EMBEDDING_CTX_SIZE} --batch-size 2048 --ubatch-size 2048 ${NO_WEBUI_FLAG}"

if [[ -n "${RERANK_MODEL}" ]]; then
  write_unit \
    "${RERANK_SERVICE_NAME}" \
    "Judgment BGE Reranker (llama.cpp, ${RERANK_ALIAS})" \
    "${RERANK_PORT}" \
    "--model ${RERANK_MODEL} --alias ${RERANK_ALIAS} --host ${RERANK_HOST} --port ${RERANK_PORT} --reranking --pooling rank --gpu-layers all --ctx-size 8192 --batch-size 2048 --ubatch-size 1024 ${NO_WEBUI_FLAG}"
fi

systemctl daemon-reload
systemctl enable "${service_names[@]/%/.service}"
systemctl restart "${service_names[@]/%/.service}"

if [[ "${JUDGMENT_DISABLE_OLLAMA_PRELOAD:-1}" == "1" ]]; then
  if systemctl cat "${OLLAMA_PRELOAD_SERVICE}.service" >/dev/null 2>&1; then
    systemctl disable --now "${OLLAMA_PRELOAD_SERVICE}.service" 2>/dev/null || true
    echo "已停用 ${OLLAMA_PRELOAD_SERVICE}.service（避免與 llama-server 重複占用 VRAM）。"
  else
    echo "找不到 ${OLLAMA_PRELOAD_SERVICE}.service；略過停用。"
  fi
fi

wait_for_health() {
  local name="$1"
  local port="$2"
  local ready=0
  echo -n "等待 ${name} health"
  for _ in $(seq 1 120); do
    if curl -fsS --max-time 2 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
      ready=1
      echo " OK"
      break
    fi
    echo -n "."
    sleep 0.5
  done
  if [[ "${ready}" != "1" ]]; then
    echo
    echo "警告：${name} 尚未就緒，最近 log：" >&2
    journalctl -u "${name}.service" -n 60 --no-pager 2>/dev/null || true
    return 1
  fi
}

wait_for_health "${CHAT_SERVICE_NAME}" "${CHAT_PORT}"
wait_for_health "${EMBEDDING_SERVICE_NAME}" "${EMBEDDING_PORT}"
if [[ -n "${RERANK_MODEL}" ]]; then
  wait_for_health "${RERANK_SERVICE_NAME}" "${RERANK_PORT}"
fi

echo -n "驗證 chat /v1/chat/completions"
CHAT_RESPONSE="$(
  curl -fsS --max-time 180 "http://127.0.0.1:${CHAT_PORT}/v1/chat/completions" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${CHAT_ALIAS}\",\"messages\":[{\"role\":\"user\",\"content\":\"只回答 OK\"}],\"max_tokens\":16,\"temperature\":0,\"stream\":false}" \
    2>/dev/null || true
)"
if printf '%s' "${CHAT_RESPONSE}" | grep -q '"content"'; then
  echo " OK"
else
  echo " 失敗"
  echo "chat 回應：${CHAT_RESPONSE:-（空）}" >&2
  exit 1
fi

echo -n "驗證 embedding /v1/embeddings"
EMBEDDING_RESPONSE="$(
  curl -fsS --max-time 120 "http://127.0.0.1:${EMBEDDING_PORT}/v1/embeddings" \
    -H 'Content-Type: application/json' \
    -d "{\"model\":\"${EMBEDDING_ALIAS}\",\"input\":[\"測試\"]}" \
    2>/dev/null || true
)"
DIMENSIONS="$(
  printf '%s' "${EMBEDDING_RESPONSE}" | python3 -c '
import json, sys
try:
    payload = json.load(sys.stdin)
    print(len(payload["data"][0]["embedding"]))
except Exception:
    print(0)
' 2>/dev/null || printf '0'
)"
if [[ "${DIMENSIONS}" == "1024" ]]; then
  echo " OK（1024 維）"
else
  echo " 失敗（維度：${DIMENSIONS:-0}）"
  echo "embedding 回應：${EMBEDDING_RESPONSE:-（空）}" >&2
  exit 1
fi

if [[ -n "${RERANK_MODEL}" ]]; then
  echo -n "驗證 reranker /v1/rerank"
  RERANK_RESPONSE="$(
    curl -fsS --max-time 60 "http://127.0.0.1:${RERANK_PORT}/v1/rerank" \
      -H 'Content-Type: application/json' \
      -d "{\"model\":\"${RERANK_ALIAS}\",\"query\":\"保險理賠\",\"documents\":[\"保險理賠範圍\",\"公司法\"]}" \
      2>/dev/null || true
  )"
  if printf '%s' "${RERANK_RESPONSE}" | grep -q '"results"'; then
    echo " OK"
  else
    echo " 失敗"
    echo "rerank 回應：${RERANK_RESPONSE:-（空）}" >&2
    exit 1
  fi
fi

echo
echo "完成。x570 開機後會由 llama-server 載入："
echo "  ${CHAT_ALIAS} · ${EMBEDDING_ALIAS}"
if [[ -n "${RERANK_MODEL}" ]]; then
  echo "  ${RERANK_ALIAS}"
fi
echo
echo "MBP .env 建議值："
echo "  LLM_URL=http://x570:${CHAT_PORT}"
echo "  LLM_API=openai"
echo "  LLM_MODEL=${CHAT_ALIAS}"
echo "  LLM_FALLBACK_URL=http://127.0.0.1:11434"
echo "  LLM_FALLBACK_MODEL=${CHAT_ALIAS}"
echo "  LLM_FALLBACK_API=ollama"
echo "  EMBEDDING_URL=http://x570:${EMBEDDING_PORT}"
echo "  EMBEDDING_API=openai"
echo "  EMBEDDING_MODEL=${EMBEDDING_ALIAS}"
echo "  EMBEDDING_FALLBACK_URL=http://127.0.0.1:11434"
echo "  EMBEDDING_FALLBACK_API=ollama"
echo "  RERANK_URL=http://x570:${RERANK_PORT}"
echo "  RERANK_MODEL=${RERANK_ALIAS}"
echo
echo "也可以直接執行 bash up.sh，讓它自動偵測 x570 llama-server。"
echo
echo "常用指令："
for name in "${service_names[@]}"; do
  echo "  sudo systemctl status ${name}.service"
  echo "  sudo journalctl -u ${name}.service -f"
done