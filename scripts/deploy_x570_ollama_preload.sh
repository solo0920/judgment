#!/usr/bin/env bash
# Deploy the x570 Ollama boot preload service from the MBP.
#
# This is the scp + ssh workflow:
#   1. copy scripts/deploy_ollama_preload_systemd.sh to /tmp on x570
#   2. run it there with sudo
#   3. verify the systemd unit and loaded models from the MBP
#
# The installer is self-contained; x570 does not need the repo cloned.
#
# Usage:
#   bash scripts/deploy_x570_ollama_preload.sh
#   X570_HOST=solo@x570 bash scripts/deploy_x570_ollama_preload.sh
#
# The first SSH connection may ask for the x570 password.  The same
# connection is reused for the install and verification commands.
set -euo pipefail

cd "$(dirname "$0")/.."

SSH_HOST="${X570_HOST:-x570}"
API_HOST="${X570_API_HOST:-${SSH_HOST#*@}}"
INSTALLER="scripts/deploy_ollama_preload_systemd.sh"
REMOTE="/tmp/judgment-ollama-preload.sh"
CONTROL_PATH="/tmp/judgment-x570-ssh-%C"

if [[ ! -f "${INSTALLER}" ]]; then
  echo "找不到 ${INSTALLER}；請在 repo 根目錄執行。" >&2
  exit 1
fi

if ! command -v scp >/dev/null 2>&1 || ! command -v ssh >/dev/null 2>&1; then
  echo "找不到 scp 或 ssh。" >&2
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
  echo >&2
  echo "scp 失敗。請確認 ${SSH_HOST} 的 SSH 金鑰或密碼可用；" >&2
  echo "也可先在 x570 加入 MBP 公鑰：ssh-copy-id -i ~/.ssh/id_ed25519.pub ${SSH_HOST}" >&2
  exit 1
fi

echo "在 ${SSH_HOST} 上執行安裝（需要 sudo 密碼）…"
ssh "${SSH_OPTS[@]}" -t "${SSH_HOST}" "sudo bash ${REMOTE}"

echo
echo "驗證 systemd 開機設定 …"
if ! ssh "${SSH_OPTS[@]}" "${SSH_HOST}" \
  'systemctl is-enabled judgment-ollama-preload; systemctl is-active judgment-ollama-preload'; then
  echo "systemd 驗證失敗：服務未啟用或未執行。" >&2
  exit 1
fi

echo
echo "驗證 x570 Ollama /api/ps …"
curl -fsS --max-time 15 "http://${API_HOST}:11434/api/ps" | python3 -c '
import json
import sys

expected = ("gemma3:4b", "bge-m3:latest")
try:
    loaded = {item.get("name"): item for item in json.load(sys.stdin).get("models", [])}
except Exception as exc:
    print(f"無法解析 /api/ps：{exc}", file=sys.stderr)
    sys.exit(1)

failed = False
for name in expected:
    item = loaded.get(name)
    if not item:
        print(f"MISSING {name}")
        failed = True
        continue
    expires = str(item.get("expires_at") or "")
    size_vram = item.get("size_vram")
    print(f"{name} expires_at={expires} size_vram={size_vram}")
    if not expires[:4].isdigit() or int(expires[:4]) < 2100:
        print(f"  keep_alive 未生效：{name}")
        failed = True

if failed:
    sys.exit(1)
print("OK：兩個模型都已載入且 keep_alive=-1。")
'

echo
echo "完成。若要驗證真正的開機行為，請重開 x570，再從 MBP 執行："
echo "  curl -s http://${API_HOST}:11434/api/ps | python3 -m json.tool"
