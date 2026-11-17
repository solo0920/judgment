#!/usr/bin/env bash
# x570 UFW audit / cleanup.
#
# Run ON x570:
#   sudo bash x570_ufw_cleanup.sh audit
#   sudo REMOVE_SMB=1 bash x570_ufw_cleanup.sh apply
#
# The apply mode:
#   - backs up /etc/ufw files
#   - keeps SSH 22 allowed
#   - removes the 11434 rule (Ollama is disabled)
#   - optionally removes 139,445/tcp when REMOVE_SMB=1
#   - adds explicit Tailscale-only allows for 11435/11436/11437
set -euo pipefail

MODE="${1:-audit}"
OUT="$HOME/judgment-ufw-${MODE}-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$OUT") 2>&1

if [[ "${EUID}" -ne 0 ]]; then
  echo "請用 sudo 執行：sudo bash $0 ${MODE}" >&2
  exit 1
fi

echo "mode=$MODE host=$(hostname) date=$(date -Is)"
echo "output=$OUT"

show() {
  echo
  echo "=== ufw status verbose ==="
  ufw status verbose || true
  echo
  echo "=== ufw status numbered ==="
  ufw status numbered || true
  echo
  echo "=== interfaces ==="
  ip -brief addr || true
  echo
  echo "=== listeners ==="
  ss -ltnp 2>/dev/null | grep -E ':(11434|11435|11436|11437|22)\b' || true
}

delete_matching() {
  local pattern="$1"
  mapfile -t numbers < <(
    ufw status numbered \
      | awk -v pat="$pattern" '
          {
            line=$0;
            if (match(line, /\[[[:space:]]*[0-9]+[[:space:]]*\]/)) {
              n=substr(line, RSTART, RLENGTH);
              gsub(/[^0-9]/, "", n);
              if (line ~ pat) print n;
            }
          }' \
      | sort -rn
  )
  if [[ ${#numbers[@]} -eq 0 ]]; then
    echo "no rule matching: $pattern"
    return 0
  fi
  local n
  for n in "${numbers[@]}"; do
    [[ -z "$n" ]] && continue
    echo "delete rule [$n] matching $pattern"
    ufw --force delete "$n"
  done
}

apply() {
  show

  backup="/root/ufw-backup-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$backup"
  for file in /etc/ufw/user.rules /etc/ufw/user6.rules /etc/ufw/before.rules; do
    if [[ -f "$file" ]]; then
      cp -a "$file" "$backup/"
    fi
  done
  echo "backup=$backup"

  # Keep SSH reachable before touching anything else.
  if ! ufw status | grep -qE '22/tcp[[:space:]]+ALLOW'; then
    echo "SSH rule missing; adding 22/tcp"
    ufw allow 22/tcp
  fi

  # Ollama is disabled; remove its old allow rule if present.
  delete_matching '11434'

  if [[ "${REMOVE_SMB:-0}" == "1" ]]; then
    delete_matching '139,445/tcp'
  else
    echo "keep 139,445/tcp; set REMOVE_SMB=1 to remove it"
  fi

  # Model ports are for the MBP over Tailscale, not the public internet.
  for port in 11435 11436 11437; do
    if ! ufw status | grep -qE "${port}/tcp.*on tailscale0"; then
      ufw allow in on tailscale0 to any port "$port" proto tcp
    fi
  done

  echo
  echo "=== after ==="
  show
  echo
  echo "從 MBP 測試："
  echo "  ssh -o BatchMode=yes x570 'curl -fsS http://127.0.0.1:11436/health'"
  echo "  curl -fsS http://x570:11436/health"
  echo "rollback: sudo cp -a '$backup/user.rules' /etc/ufw/user.rules && sudo ufw reload"
}

case "$MODE" in
  audit)
    show
    echo
    echo "目前不會修改。要清理請執行："
    echo "  sudo REMOVE_SMB=1 bash $0 apply"
    ;;
  apply)
    apply
    ;;
  *)
    echo "usage: sudo bash $0 [audit|apply]" >&2
    exit 2
    ;;
esac
