#!/usr/bin/env bash
# Install the Judgment BGE reranker as a systemd service on x570 (Linux).
#
# Recommended usage from the MBP:
#   scp scripts/deploy_rerank_systemd.sh x570:/tmp/
#   ssh -t x570 'sudo bash /tmp/deploy_rerank_systemd.sh'
#
# The script is self-contained: it does not require the Judgment repository on
# x570. It finds llama-server and the Ollama GGUF, copies the model to a stable
# path, installs judgment-reranker.service, enables it at boot, and checks
# /health.
#
# Optional environment variables:
#   RERANK_PORT=11435
#   RERANK_HOST=0.0.0.0
#   RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
#   RERANK_MODEL_PATH=/path/to/model.gguf
#   LLAMA_SERVER_BIN=/path/to/llama-server
#   LLAMA_LIB_DIR=/path/to/llama/libs
#   JUDGMENT_SERVICE_USER=solo
#   RERANK_INSTALL_DIR=/opt/judgment
#   RERANK_SERVICE_NAME=judgment-reranker
#
# Examples:
#   sudo bash /tmp/deploy_rerank_systemd.sh
#   sudo LLAMA_SERVER_BIN=/usr/local/lib/ollama/llama-server \
#     bash /tmp/deploy_rerank_systemd.sh
#   sudo bash /tmp/deploy_rerank_systemd.sh --uninstall
set -euo pipefail

SERVICE_NAME="${RERANK_SERVICE_NAME:-judgment-reranker}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
RERANK_PORT="${RERANK_PORT:-11435}"
RERANK_HOST="${RERANK_HOST:-0.0.0.0}"
INSTALL_DIR="${RERANK_INSTALL_DIR:-/opt/judgment}"
MODEL_DIR="${INSTALL_DIR}/models"
MODEL_TARGET="${MODEL_DIR}/bge-reranker-v2-m3-q8_0.gguf"
OLLAMA_MODEL="${RERANK_OLLAMA_MODEL:-qllama/bge-reranker-v2-m3:latest}"
SERVICE_USER="${JUDGMENT_SERVICE_USER:-${SUDO_USER:-$(id -un)}}"

usage() {
  cat <<'EOF'
Install the Judgment BGE reranker as a systemd service on x570 (Linux).

Usage:
  scp scripts/deploy_rerank_systemd.sh x570:/tmp/
  ssh -t x570 'sudo bash /tmp/deploy_rerank_systemd.sh'

Options:
  --uninstall    Stop, disable and remove the systemd service.
  --help         Show this help.

Optional environment variables:
  RERANK_PORT=11435
  RERANK_HOST=0.0.0.0
  RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
  RERANK_MODEL_PATH=/path/to/model.gguf
  LLAMA_SERVER_BIN=/path/to/llama-server
  LLAMA_LIB_DIR=/path/to/llama/libs
  JUDGMENT_SERVICE_USER=solo
  RERANK_INSTALL_DIR=/opt/judgment
  RERANK_SERVICE_NAME=judgment-reranker
EOF
}

uninstall() {
  if command -v systemctl >/dev/null 2>&1; then
    systemctl disable --now "${SERVICE_NAME}.service" 2>/dev/null || true
  fi
  rm -f "${SERVICE_FILE}"
  systemctl daemon-reload 2>/dev/null || true
  echo "已移除 ${SERVICE_NAME}.service。"
  echo "模型仍保留在 ${MODEL_TARGET}；如不需要可手動刪除。"
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
# llama-server frontend will silently fall back to CPU unless it can find
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

if ! "${LLAMA_SERVER}" --version >/tmp/judgment-reranker-version.log 2>&1; then
  echo "llama-server 無法執行，可能是缺少 shared library 或 CUDA runtime：" >&2
  cat /tmp/judgment-reranker-version.log >&2 || true
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

if [[ -n "${RERANK_MODEL_PATH:-}" ]]; then
  MODEL_SOURCE="${RERANK_MODEL_PATH}"
else
  if ! command -v ollama >/dev/null 2>&1; then
    echo "找不到 ollama，也無法自動定位 ${OLLAMA_MODEL}。" >&2
    echo "請設定 RERANK_MODEL_PATH=/path/to/bge-reranker-v2-m3-q8_0.gguf。" >&2
    exit 1
  fi
  MODEL_SOURCE="$(
    ollama show "${OLLAMA_MODEL}" --modelfile 2>/dev/null \
      | awk '/^FROM /{print $2; exit}'
  )"
fi

if [[ -z "${MODEL_SOURCE}" || ! -f "${MODEL_SOURCE}" ]]; then
  echo "找不到 reranker GGUF：${MODEL_SOURCE:-（空）}" >&2
  echo "請先在 x570 執行：" >&2
  echo "  ollama pull ${OLLAMA_MODEL}" >&2
  echo "或設定 RERANK_MODEL_PATH。" >&2
  exit 1
fi

if ! id "${SERVICE_USER}" >/dev/null 2>&1; then
  echo "找不到服務使用者：${SERVICE_USER}" >&2
  echo "可用 JUDGMENT_SERVICE_USER=your-user 指定。" >&2
  exit 1
fi
SERVICE_GROUP="$(id -gn "${SERVICE_USER}")"

install -d -m 0755 "${INSTALL_DIR}" "${MODEL_DIR}"
if [[ "${MODEL_SOURCE}" != "${MODEL_TARGET}" ]]; then
  echo "複製 reranker 模型到穩定路徑…"
  install -m 0644 "${MODEL_SOURCE}" "${MODEL_TARGET}"
fi

MODEL_SIZE="$(du -h "${MODEL_TARGET}" | awk '{print $1}')"
echo "llama-server：${LLAMA_SERVER}"
echo "模型：${MODEL_TARGET}（${MODEL_SIZE}）"
echo "服務使用者：${SERVICE_USER}:${SERVICE_GROUP}"
echo "監聽：${RERANK_HOST}:${RERANK_PORT}"

BACKEND_ENV=""
if [[ -n "${CUDA_BACKEND}" ]]; then
  BACKEND_ENV="Environment=GGML_BACKEND_PATH=${CUDA_BACKEND}"
fi

cat >"${SERVICE_FILE}" <<EOF
[Unit]
Description=Judgment BGE Reranker (llama.cpp)
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
ExecStart=${LLAMA_SERVER} --model ${MODEL_TARGET} --host ${RERANK_HOST} --port ${RERANK_PORT} --reranking --pooling rank --gpu-layers all --ctx-size 8192 --batch-size 2048 --ubatch-size 1024 --no-webui
Restart=on-failure
RestartSec=3
LimitNOFILE=65535
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${SERVICE_NAME}.service"
systemctl restart "${SERVICE_NAME}.service"

echo -n "等待 reranker health"
ready=0
for _ in $(seq 1 40); do
  if curl -fsS --max-time 2 "http://127.0.0.1:${RERANK_PORT}/health" >/dev/null 2>&1; then
    ready=1
    echo " OK"
    break
  fi
  echo -n "."
  sleep 0.5
done

if [[ "${ready}" != "1" ]]; then
  echo
  echo "警告：reranker 尚未就緒，最近 log：" >&2
  journalctl -u "${SERVICE_NAME}.service" -n 60 --no-pager 2>/dev/null || true
  exit 1
fi

echo
echo "完成。"
echo "服務：${SERVICE_NAME}.service（已設為開機自動啟動）"
echo "Endpoint：http://${RERANK_HOST}:${RERANK_PORT}/v1/rerank"
echo "Health：http://${RERANK_HOST}:${RERANK_PORT}/health"
echo
echo "若 x570 有防火牆，請開放 ${RERANK_PORT}/tcp，例如："
echo "  sudo ufw allow ${RERANK_PORT}/tcp"
echo
echo "常用指令："
echo "  sudo systemctl status ${SERVICE_NAME}.service"
echo "  sudo systemctl restart ${SERVICE_NAME}.service"
echo "  sudo journalctl -u ${SERVICE_NAME}.service -f"
