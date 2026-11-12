#!/usr/bin/env bash
# Start a llama.cpp rerank server for BGE-reranker-v2-m3.
#
# The same GGUF that Ollama already stores can be served directly. Ollama
# itself does not expose a rerank endpoint, so this runs a dedicated
# llama-server process on RERANK_PORT (default 11435).
#
# Usage:
#   ./scripts/rerank_server.sh
#   RERANK_HOST=0.0.0.0 RERANK_PORT=11435 ./scripts/rerank_server.sh
#
# Required:
#   A llama-server binary. The script checks common Ollama locations and
#   PATH. Set LLAMA_SERVER_BIN if it lives elsewhere.
#
# Optional:
#   RERANK_MODEL_PATH       Path to the BGE reranker GGUF.
#   RERANK_OLLAMA_MODEL     Ollama tag used to locate the GGUF when
#                           RERANK_MODEL_PATH is not set.
#   RERANK_HOST             Bind address (default 127.0.0.1).
#   RERANK_PORT             Port (default 11435).
#   RERANK_GPU_LAYERS       GPU layers (default all; use 0 for CPU).
#   RERANK_THREADS          CPU threads passed to llama-server.
set -euo pipefail

HOST="${RERANK_HOST:-127.0.0.1}"
PORT="${RERANK_PORT:-11435}"
OLLAMA_MODEL="${RERANK_OLLAMA_MODEL:-qllama/bge-reranker-v2-m3:latest}"
MODEL_PATH="${RERANK_MODEL_PATH:-}"
THREADS="${RERANK_THREADS:-}"

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
    "/Applications/Ollama.app/Contents/Resources/llama-server"
    "/usr/local/lib/ollama/llama-server"
    "/usr/lib/ollama/llama-server"
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

if [[ -z "${MODEL_PATH}" ]]; then
  if command -v ollama >/dev/null 2>&1; then
    MODEL_PATH="$(
      ollama show "${OLLAMA_MODEL}" --modelfile 2>/dev/null \
        | awk '/^FROM /{print $2; exit}'
    )"
  fi
fi

if ! LLAMA_SERVER="$(find_llama_server)"; then
  echo "找不到 llama-server。請設定 LLAMA_SERVER_BIN，或先安裝 llama.cpp。" >&2
  exit 1
fi

if [[ -z "${MODEL_PATH}" || ! -f "${MODEL_PATH}" ]]; then
  echo "找不到 reranker GGUF。請設定 RERANK_MODEL_PATH，或先執行：" >&2
  echo "  ollama pull ${OLLAMA_MODEL}" >&2
  exit 1
fi

if [[ "$(uname -s)" == "Linux" ]]; then
  LLAMA_DIR="$(cd "$(dirname "${LLAMA_SERVER}")" && pwd)"
  CUDA_BACKEND="$(
    find "${LLAMA_DIR}" -maxdepth 2 -name 'libggml-cuda.so' -print -quit 2>/dev/null \
      || true
  )"
  if [[ -n "${CUDA_BACKEND}" ]]; then
    export GGML_BACKEND_PATH="${CUDA_BACKEND}"
    export LD_LIBRARY_PATH="${LLAMA_DIR}:$(dirname "${CUDA_BACKEND}"):${LD_LIBRARY_PATH:-}"
  else
    export LD_LIBRARY_PATH="${LLAMA_DIR}:${LD_LIBRARY_PATH:-}"
  fi
fi

echo "Reranker:  ${MODEL_PATH}"
echo "Endpoint:  http://${HOST}:${PORT}/v1/rerank"
echo "Model:     ${RERANK_MODEL:-bge-reranker-v2-m3}"

ARGS=(
  --model "${MODEL_PATH}"
  --host "${HOST}"
  --port "${PORT}"
  --reranking
  --pooling rank
  --gpu-layers "${RERANK_GPU_LAYERS:-all}"
  --ctx-size 8192
  --batch-size 2048
  --ubatch-size 1024
  --no-webui
)
if [[ -n "${THREADS}" ]]; then
  ARGS+=(--threads "${THREADS}")
fi

exec "${LLAMA_SERVER}" "${ARGS[@]}"
