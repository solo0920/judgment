#!/usr/bin/env bash
# Reboot x570 from the MBP and run the post-boot verification.
#
# Run on the MBP:
#   bash scripts/x570_reboot_and_verify.sh
#
# This is interactive. It asks for confirmation and for the x570 sudo
# password twice (once for reboot, once for the full verification). It checks
# that the Linux boot_id changed, so a cancelled sudo reboot is detected.
#
# Non-interactive use is only safe with passwordless sudo:
#   CONFIRM=REBOOT bash scripts/x570_reboot_and_verify.sh
#
# Preflight only (copy the verifier, do not reboot):
#   DRY_RUN=1 CONFIRM=REBOOT bash scripts/x570_reboot_and_verify.sh
set -uo pipefail

HOST="${X570_HOST:-x570}"
REMOTE_DIR="${X570_AUDIT_DIR:-judgment-audit}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_SCRIPT="$SCRIPT_DIR/x570_postboot_verify.sh"
REMOTE_SCRIPT="$REMOTE_DIR/x570_postboot_verify.sh"

if [[ ! -f "$LOCAL_SCRIPT" ]]; then
  echo "missing $LOCAL_SCRIPT" >&2
  exit 1
fi

SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=accept-new)

if ! ssh "${SSH_OPTS[@]}" "$HOST" 'echo ssh-ok' >/dev/null 2>&1; then
  echo "SSH key login failed for $HOST" >&2
  exit 1
fi

old_id="$(ssh "${SSH_OPTS[@]}" "$HOST" 'cat /proc/sys/kernel/random/boot_id' 2>/dev/null || true)"
if [[ -z "$old_id" ]]; then
  echo "cannot read /proc/sys/kernel/random/boot_id on $HOST" >&2
  exit 1
fi

echo "host=$HOST"
echo "old_boot_id=$old_id"
echo "remote_script=$REMOTE_SCRIPT"
echo
echo "This will reboot $HOST. All three model services should auto-start."
echo "Keep physical access available in case the network does not return."
echo

CONFIRM="${CONFIRM:-}"
if [[ "$CONFIRM" != "REBOOT" ]]; then
  if [[ -t 0 ]]; then
    read -r -p "Type REBOOT to continue: " CONFIRM
  else
    echo "Non-interactive run needs CONFIRM=REBOOT (sudo must be passwordless)." >&2
    exit 2
  fi
fi
if [[ "$CONFIRM" != "REBOOT" ]]; then
  echo "cancelled"
  exit 1
fi

echo "Copying the post-boot verifier to $HOST..."
ssh "${SSH_OPTS[@]}" "$HOST" "mkdir -p ~/$REMOTE_DIR"
scp -p "${SSH_OPTS[@]}" "$LOCAL_SCRIPT" "$HOST:~/$REMOTE_SCRIPT"

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1: copied $REMOTE_SCRIPT to $HOST; not rebooting."
  exit 0
fi

echo
echo "Rebooting $HOST; enter the sudo password if prompted."
ssh -t "${SSH_OPTS[@]}" "$HOST" 'sudo systemctl reboot' || true

echo
echo "Waiting for $HOST to return with a new boot_id (up to 300s)..."
new_id=""
i=0
while [[ "$i" -lt 60 ]]; do
  i=$((i + 1))
  sleep 5
  id="$(ssh "${SSH_OPTS[@]}" -o ConnectTimeout=3 -o ServerAliveInterval=2 -o ServerAliveCountMax=2 "$HOST" 'cat /proc/sys/kernel/random/boot_id' 2>/dev/null || true)"
  if [[ -n "$id" && "$id" != "$old_id" ]]; then
    new_id="$id"
    echo
    echo "new_boot_id=$new_id after $((i * 5))s"
    break
  fi
  printf '.'
done
echo

if [[ -z "$new_id" ]]; then
  echo "FAIL: $HOST did not return with a new boot_id (reboot cancelled or boot failed)" >&2
  exit 1
fi

local_report="$HOME/judgment-x570-postboot-$(date +%Y%m%d-%H%M%S).txt"
echo
echo "Running post-boot verification; enter the sudo password again if prompted."
ssh -t "${SSH_OPTS[@]}" "$HOST" "sudo bash ~/$REMOTE_SCRIPT" 2>&1 | tee "$local_report"
rc=${PIPESTATUS[0]}
chmod 600 "$local_report" 2>/dev/null || true
echo "local_report=$local_report"

exit "$rc"
