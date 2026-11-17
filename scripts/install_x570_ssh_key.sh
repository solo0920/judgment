#!/usr/bin/env bash
# Install the MBP public key on x570.
#
# Run on the MBP:
#   bash scripts/install_x570_ssh_key.sh
#   X570_HOST=solo@x570 bash scripts/install_x570_ssh_key.sh
#
# If SSH password auth is disabled, the script falls back to Taildrop and
# prints the exact commands to run on x570.
set -euo pipefail

cd "$(dirname "$0")/.."

HOST="${X570_HOST:-x570}"
KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519.pub}"

if [[ ! -f "$KEY" ]]; then
  echo "找不到公鑰：$KEY" >&2
  echo "先建立：" >&2
  echo "  ssh-keygen -t ed25519 -C \"$USER@mbp\"" >&2
  exit 1
fi

echo "host=$HOST"
echo "key=$KEY"
echo "fingerprint=$(ssh-keygen -lf "$KEY" 2>/dev/null || true)"

if command -v ssh-copy-id >/dev/null 2>&1; then
  echo
  echo "嘗試 ssh-copy-id（會詢問 x570 密碼）..."
  if ssh-copy-id \
      -i "$KEY" \
      -o StrictHostKeyChecking=accept-new \
      -o ConnectTimeout=8 \
      "$HOST"; then
    echo
    echo "ssh-copy-id 完成，測試金鑰登入："
    if ssh -o BatchMode=yes -o ConnectTimeout=5 "$HOST" "echo key-ok"; then
      echo "完成：之後可直接 ssh $HOST"
      exit 0
    fi
    echo "金鑰登入測試失敗；請看下方 Taildrop 備援。" >&2
  else
    echo "ssh-copy-id 失敗；改用 Taildrop。" >&2
  fi
else
  echo "找不到 ssh-copy-id；改用 Taildrop。" >&2
fi

if ! command -v tailscale >/dev/null 2>&1; then
  echo "找不到 tailscale；請手動把公鑰貼到 x570。" >&2
  echo "公鑰內容：" >&2
  cat "$KEY" >&2
  exit 1
fi

TAILDROP_HOST="${HOST#*@}"
TMPDIR="$(mktemp -d)"
KEY_FILE="$TMPDIR/judgment-mbp-ed25519.pub"
cp "$KEY" "$KEY_FILE"

echo
echo "透過 Taildrop 送到 ${TAILDROP_HOST}..."
tailscale file cp "$KEY_FILE" "${TAILDROP_HOST}:"

cat <<EOF

公鑰已送到 ${TAILDROP_HOST}。請在 x570 上執行：

  tailscale file get ~/judgment-ssh
  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  cat ~/judgment-ssh/judgment-mbp-ed25519.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys

然後回到 MBP 測試：

  ssh -o BatchMode=yes -o ConnectTimeout=5 ${HOST} 'echo key-ok'

公鑰內容（必要時可手動貼上）：

$(cat "$KEY")
EOF
