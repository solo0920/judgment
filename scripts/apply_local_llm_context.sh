#!/usr/bin/env bash
# Update the local .env LLM_NUM_CTX and restart the web service.
#
# Run from the MBP repository after x570 has been restarted:
#   bash scripts/apply_local_llm_context.sh 8192
#
# The startup context probe reads llama-server /props and lowers the effective
# value if the server still reports a smaller n_ctx.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CTX="${1:-8192}"
ENV_FILE="${ROOT}/.env"
SESSION="${JUDGMENT_WEB_TMUX_SESSION:-judgment-web}"
PORT="${JUDGMENT_PORT:-9200}"

if ! [[ "${CTX}" =~ ^[0-9]+$ ]] || [[ "${CTX}" -lt 2048 ]]; then
  echo "用法：bash scripts/apply_local_llm_context.sh [ctx-size，預設 8192]" >&2
  exit 2
fi
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "找不到 ${ENV_FILE}" >&2
  exit 2
fi

python3 - "${ENV_FILE}" "${CTX}" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
ctx = str(sys.argv[2])
lines = path.read_text(encoding="utf-8").splitlines()
found = False
updated = []
for line in lines:
    if line.startswith("LLM_NUM_CTX="):
        updated.append(f"LLM_NUM_CTX={ctx}")
        found = True
    else:
        updated.append(line)
if not found:
    updated.append(f"LLM_NUM_CTX={ctx}")
path.write_text("\n".join(updated) + "\n", encoding="utf-8")
PY

chmod 600 "${ENV_FILE}"
echo "已設定 $(grep '^LLM_NUM_CTX=' "${ENV_FILE}")"

echo "重啟 web（${SESSION}）…"
LOG_FILE="${ROOT}/.run/web.log"
LOG_LINES=0
if [[ -f "${LOG_FILE}" ]]; then
  LOG_LINES="$(wc -l < "${LOG_FILE}" | tr -d ' ')"
fi
tmux kill-session -t "${SESSION}" 2>/dev/null || true
(
  cd "${ROOT}"
  bash up.sh
)

echo "等待 http://127.0.0.1:${PORT}/api/health …"
ready=0
for _ in $(seq 1 60); do
  if curl -fsS --max-time 2 "http://127.0.0.1:${PORT}/api/health" \
    >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "${ready}" != "1" ]]; then
  echo "web 未在 60 秒內就緒；查看 ${ROOT}/.run/web.log" >&2
  exit 1
fi

echo "web 已就緒。"
if [[ -f "${LOG_FILE}" ]] && \
  tail -n "+$((LOG_LINES + 1))" "${LOG_FILE}" \
  | grep -q "LLM context mismatch"; then
  echo "注意：啟動日誌有 LLM context mismatch；代表 x570 尚未套用 8192 或 /props 不一致。" >&2
  tail -n "+$((LOG_LINES + 1))" "${LOG_FILE}" \
    | grep -n "LLM context mismatch" | tail -3 >&2
else
  echo "啟動日誌沒有 context mismatch。"
fi
