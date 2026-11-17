#!/usr/bin/env bash
# Reinstall x570 llama-server services with a larger chat context.
#
# Run from the MBP repository:
#   bash scripts/set_x570_llm_context.sh 8192
#
# Requires SSH + sudo access to x570.  This changes the llama-server systemd
# unit, not the OpenAI request payload.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${X570_HOST:-x570}"
API_HOST="${X570_API_HOST:-${HOST#*@}}"
CTX="${1:-8192}"
INSTALLER="${ROOT}/scripts/deploy_llama_services_systemd.sh"

if ! [[ "${CTX}" =~ ^[0-9]+$ ]] || [[ "${CTX}" -lt 2048 ]]; then
  echo "用法：bash scripts/set_x570_llm_context.sh [ctx-size，預設 8192]" >&2
  exit 2
fi
if [[ ! -f "${INSTALLER}" ]]; then
  echo "找不到 ${INSTALLER}" >&2
  exit 2
fi

echo "複製 llama-server installer 到 ${HOST} …"
scp -o ConnectTimeout=10 "${INSTALLER}" \
  "${HOST}:/tmp/judgment-llama-services.sh"

echo "在 ${HOST} 重新部署，CHAT_CTX_SIZE=${CTX}（需要 sudo 密碼）…"
ssh -t "${HOST}" \
  "sudo env CHAT_CTX_SIZE=${CTX} bash /tmp/judgment-llama-services.sh"

echo
echo "systemd chat context："
ssh "${HOST}" \
  "systemctl show judgment-llm-chat.service -p ExecStart" \
  | grep -o -- '--ctx-size [0-9]*' || true

echo
echo "等待 llama-server /props …"
props_ok=0
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 "http://${API_HOST}:11436/props" \
    | python3 -c '
import json
import sys

payload = json.load(sys.stdin)
settings = payload.get("default_generation_settings") or {}
n_ctx = settings.get("n_ctx")
slots = payload.get("total_slots")
print(f"n_ctx={n_ctx} total_slots={slots}")
raise SystemExit(0 if n_ctx == int(sys.argv[1]) else 1)
' "${CTX}"; then
    props_ok=1
    break
  fi
  sleep 1
done
if [[ "${props_ok}" != "1" ]]; then
  echo "警告：/props 的 n_ctx 與要求的 ${CTX} 不一致或服務未就緒，請檢查 --parallel／--ctx-size。" >&2
  exit 1
fi

echo
echo "完成。下一步在 MBP 執行："
echo "  bash scripts/apply_local_llm_context.sh ${CTX}"
