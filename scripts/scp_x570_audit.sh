#!/usr/bin/env bash
# Copy the x570 audit script/runbook from the MBP to x570.
#
# Run on the MBP:
#   bash scripts/scp_x570_audit.sh
#   bash scripts/scp_x570_audit.sh --run-before
#
# Optional:
#   X570_HOST=solo@x570 bash scripts/scp_x570_audit.sh
#   X570_AUDIT_DIR=judgment-audit bash scripts/scp_x570_audit.sh
#
# It uses scp when SSH works; otherwise it falls back to Taildrop.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${X570_HOST:-x570}"
REMOTE_DIR="${X570_AUDIT_DIR:-}"
RUN_BEFORE=0
if [[ "${1:-}" == "--run-before" ]]; then
  RUN_BEFORE=1
fi

FILES=(
  "scripts/x570_service_audit.sh"
  "specs/005-retrieval-evaluation/x570-context-change-runbook-2026-11-17.md"
)
for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "missing $file" >&2
    exit 1
  fi
done

remote_target() {
  local name="$1"
  if [[ -n "$REMOTE_DIR" ]]; then
    printf '%s/%s' "${REMOTE_DIR%/}" "$name"
  else
    printf '%s' "$name"
  fi
}

echo "target=${HOST}"
echo "files: ${FILES[*]}"

SSH_OPTS=(
  -o BatchMode=yes
  -o ConnectTimeout=8
  -o StrictHostKeyChecking=accept-new
)

if ssh "${SSH_OPTS[@]}" "$HOST" "true" >/dev/null 2>&1; then
  if [[ -n "$REMOTE_DIR" ]]; then
    ssh "${SSH_OPTS[@]}" "$HOST" "mkdir -p '$REMOTE_DIR'"
  fi
  for file in "${FILES[@]}"; do
    target="${HOST}:$(remote_target "$(basename "$file")")"
    echo "scp $file -> $target"
    scp "${SSH_OPTS[@]}" "$file" "$target"
  done

  echo
  echo "已複製到 ${HOST}:${REMOTE_DIR:-$HOME}/"
  echo "在 x570 上執行："
  if [[ -n "$REMOTE_DIR" ]]; then
    echo "  cd ~/${REMOTE_DIR}"
  fi
  echo "  bash x570_service_audit.sh before"
  echo
  echo "若要從 MBP 直接跑 before（需要 sudo TTY）："
  echo "  bash scripts/scp_x570_audit.sh --run-before"

  if [[ "$RUN_BEFORE" == "1" ]]; then
    echo
    echo "=== running before on $HOST ==="
    remote_cmd="bash $(remote_target 'x570_service_audit.sh') before"
    ssh -t "${SSH_OPTS[@]}" "$HOST" "$remote_cmd"
  fi
  exit 0
fi

echo "SSH/scp 不可用，改用 Taildrop。" >&2
if ! command -v tailscale >/dev/null 2>&1; then
  echo "找不到 tailscale；請手動 scp：" >&2
  for file in "${FILES[@]}"; do
    echo "  scp '$file' '${HOST}:$(basename "$file")'" >&2
  done
  exit 1
fi

TAILDROP_HOST="${HOST#*@}"
for file in "${FILES[@]}"; do
  echo "tailscale file cp $file ${TAILDROP_HOST}:"
  if ! tailscale file cp "$file" "${TAILDROP_HOST}:"; then
    echo "Taildrop 失敗：$file" >&2
    exit 1
  fi
done

echo
echo "已透過 Taildrop 送到 ${HOST}。請在 x570 上接收："
echo "  tailscale file get ~/judgment-audit"
echo "  cd ~/judgment-audit"
echo "  bash x570_service_audit.sh before"
