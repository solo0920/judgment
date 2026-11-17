#!/bin/bash
# Supervised MBP llama-server for the demo LLM lane.
#
# The test server previously exited silently between benchmark runs. This
# wrapper restarts it and records every exit, so the demo does not depend on a
# one-shot foreground process. It is intentionally separate from Ollama.
set -u

MODEL="${MBP_LLM_MODEL:-/Users/leesolomon/Library/Application Support/Judgment/models/gemma3-4b.gguf}"
PORT="${MBP_LLM_PORT:-11440}"
CTX="${MBP_LLM_CTX:-24576}"
SLOTS="${MBP_LLM_SLOTS:-4}"
LOG="${MBP_LLM_LOG:-.run/mbp-llm-24576.log}"
BIN="${MBP_LLM_BIN:-/opt/homebrew/bin/llama-server}"

mkdir -p "$(dirname "$LOG")"
while true; do
  {
    echo "[supervisor] $(date -u +%Y-%m-%dT%H:%M:%SZ) starting pid=$$ port=$PORT ctx=$CTX slots=$SLOTS"
  } >> "$LOG"
  "$BIN" \
    --model "$MODEL" \
    --alias gemma3:4b \
    --host 127.0.0.1 \
    --port "$PORT" \
    --jinja \
    -ngl 99 \
    --ctx-size "$CTX" \
    --batch-size 1024 \
    --ubatch-size 512 \
    --parallel "$SLOTS" \
    --no-webui >> "$LOG" 2>&1
  code=$?
  echo "[supervisor] $(date -u +%Y-%m-%dT%H:%M:%SZ) exited code=$code; restarting in 2s" >> "$LOG"
  sleep 2
done
