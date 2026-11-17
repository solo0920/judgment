#!/usr/bin/env bash
# Verify x570 after a reboot.
#
# Run on x570:
#   sudo bash x570_postboot_verify.sh
#
# Run from the MBP (reboots x570 first):
#   bash scripts/x570_reboot_and_verify.sh
#
# Checks: boot time, unit enabled/active and boot auto-start, no restarts,
# Ollama disabled, UFW persistence/rules, Tailscale auto-connect, model health
# and /props, listeners, GPU/VRAM, and journal errors.
#
# The report is written to /tmp and chowned to SUDO_USER when run via sudo,
# so the MBP wrapper can copy it without a second password prompt.
set -uo pipefail

UNITS="judgment-llm-chat judgment-llm-embedding judgment-reranker"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="${X570_OUT_DIR:-/tmp}"
OUT="$OUT_DIR/judgment-x570-postboot-$STAMP.txt"

if ! mkdir -p "$OUT_DIR" 2>/dev/null || ! : > "$OUT" 2>/dev/null; then
  OUT_DIR="$HOME"
  OUT="$OUT_DIR/judgment-x570-postboot-$STAMP.txt"
  if ! : > "$OUT" 2>/dev/null; then
    echo "cannot write report to $OUT" >&2
    exit 1
  fi
fi

if [[ $EUID -eq 0 && -n "${SUDO_USER:-}" ]]; then
  chown "$SUDO_USER" "$OUT" 2>/dev/null || true
fi
chmod 600 "$OUT" 2>/dev/null || true

exec > >(tee "$OUT") 2>&1

PASS=0
FAIL=0
WARN=0

pass() { PASS=$((PASS + 1)); printf 'PASS  %s\n' "$*"; }
fail() { FAIL=$((FAIL + 1)); printf 'FAIL  %s\n' "$*"; }
warn() { WARN=$((WARN + 1)); printf 'WARN  %s\n' "$*"; }
section() { printf '\n=== %s ===\n' "$*"; }

if [[ $EUID -eq 0 ]]; then
  SUDO=""
  HAVE_ROOT=1
elif sudo -n true 2>/dev/null; then
  SUDO="sudo -n"
  HAVE_ROOT=1
else
  SUDO=""
  HAVE_ROOT=0
fi

section "boot"
printf 'host=%s\n' "$(hostname)"
printf 'date=%s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')"
printf 'boot_time=%s\n' "$(uptime -s 2>/dev/null || who -b 2>/dev/null || echo unknown)"
printf 'uptime=%s\n' "$(uptime -p 2>/dev/null || uptime)"
printf 'kernel=%s\n' "$(uname -r)"
printf 'output=%s\n' "$OUT"
printf 'root_checks=%s\n' "$HAVE_ROOT"

section "systemd units"
for unit in $UNITS; do
  printf '\n--- %s\n' "$unit"
  enabled="$(systemctl is-enabled "$unit" 2>&1 || true)"
  active="$(systemctl is-active "$unit" 2>&1 || true)"
  substate="$(systemctl show -p SubState --value "$unit" 2>/dev/null || true)"
  start_mono="$(systemctl show -p ExecMainStartTimestampMonotonic --value "$unit" 2>/dev/null || true)"
  start_ts="$(systemctl show -p ExecMainStartTimestamp --value "$unit" 2>/dev/null || true)"
  restarts="$(systemctl show -p NRestarts --value "$unit" 2>/dev/null || true)"

  printf 'enabled=%s active=%s sub_state=%s\n' "$enabled" "$active" "$substate"
  printf 'start=%s\n' "$start_ts"
  printf 'start_monotonic_us=%s\n' "$start_mono"
  printf 'n_restarts=%s\n' "$restarts"

  if [[ "$enabled" == "enabled" ]]; then
    pass "$unit enabled"
  else
    fail "$unit not enabled: $enabled"
  fi

  if [[ "$active" == "active" && "$substate" == "running" ]]; then
    pass "$unit active/running"
  else
    fail "$unit not active/running: $active/$substate"
  fi

  if [[ "$start_mono" =~ ^[0-9]+$ ]] && [[ "$start_mono" -gt 0 ]]; then
    start_s=$((start_mono / 1000000))
    if [[ "$start_s" -le 300 ]]; then
      pass "$unit started ${start_s}s after boot (auto-start)"
    else
      fail "$unit started ${start_s}s after boot (not boot auto-start)"
    fi
  else
    warn "$unit could not read monotonic start time"
  fi

  if [[ -z "$restarts" || "$restarts" == "0" ]]; then
    pass "$unit has no restarts"
  else
    fail "$unit NRestarts=$restarts"
  fi
done

section "ollama"
ollama_enabled="$(systemctl is-enabled ollama 2>&1 || true)"
ollama_active="$(systemctl is-active ollama 2>&1 || true)"
printf 'enabled=%s active=%s\n' "$ollama_enabled" "$ollama_active"
if [[ "$ollama_enabled" != "enabled" ]]; then
  pass "ollama is not enabled"
else
  fail "ollama is enabled"
fi
if [[ "$ollama_active" != "active" ]]; then
  pass "ollama is not active"
else
  fail "ollama is active"
fi
if pgrep -x ollama >/dev/null 2>&1; then
  fail "ollama process is running"
else
  pass "no ollama process"
fi

section "ufw"
if [[ "$HAVE_ROOT" == "1" ]]; then
  if [[ $EUID -eq 0 ]]; then
    ufw_conf="$(grep '^ENABLED=' /etc/ufw/ufw.conf 2>/dev/null || true)"
  else
    ufw_conf="$($SUDO grep '^ENABLED=' /etc/ufw/ufw.conf 2>/dev/null || true)"
  fi
  ufw_verbose="$($SUDO ufw status verbose 2>&1 || true)"
  ufw_num="$($SUDO ufw status numbered 2>&1 || true)"
  ufw_service_enabled="$(systemctl is-enabled ufw 2>&1 || true)"
  ufw_service_active="$(systemctl is-active ufw 2>&1 || true)"

  printf 'ufw.conf=%s\n' "${ufw_conf:-unreadable}"
  printf 'ufw.service enabled=%s active=%s\n' "$ufw_service_enabled" "$ufw_service_active"
  printf '%s\n' "$ufw_verbose"
  printf '%s\n' "$ufw_num"

  if [[ "$ufw_conf" == "ENABLED=yes" ]]; then
    pass "ufw.conf has ENABLED=yes"
  elif [[ -z "$ufw_conf" ]]; then
    warn "cannot read /etc/ufw/ufw.conf"
  else
    fail "ufw.conf does not have ENABLED=yes"
  fi

  if [[ "$ufw_service_enabled" == "enabled" ]]; then
    pass "ufw.service enabled at boot"
  else
    fail "ufw.service not enabled: $ufw_service_enabled"
  fi

  if [[ "$ufw_service_active" == "active" ]]; then
    pass "ufw.service active"
  else
    fail "ufw.service not active: $ufw_service_active"
  fi

  if printf '%s' "$ufw_verbose" | grep -q '^Status: active'; then
    pass "ufw status active"
  else
    fail "ufw status is not active"
  fi

  if printf '%s' "$ufw_verbose" | grep -q '^Default: deny (incoming)'; then
    pass "ufw default deny incoming"
  else
    fail "ufw default incoming policy is not deny"
  fi

  if printf '%s' "$ufw_num" | grep -qE '^\[[[:space:]]*[0-9]+\][[:space:]]+22/tcp[[:space:]]+ALLOW'; then
    pass "SSH 22/tcp allowed"
  else
    fail "SSH 22/tcp allow rule missing"
  fi

  for port in 11435 11436 11437; do
    if printf '%s' "$ufw_num" | grep -qE "${port}/tcp.*on tailscale0"; then
      pass "$port allowed on tailscale0"
    else
      fail "$port missing tailscale0 allow rule"
    fi
    if printf '%s' "$ufw_num" | grep -qE "${port}/tcp \(v6\) on tailscale0"; then
      pass "$port (v6) allowed on tailscale0"
    else
      warn "$port (v6) tailscale0 rule not found"
    fi
  done

  if printf '%s' "$ufw_num" | grep -q '11434'; then
    fail "old 11434 rule still present"
  else
    pass "old 11434 rule removed"
  fi

  if printf '%s' "$ufw_num" | grep -q '139,445'; then
    fail "SMB 139,445 rule still present"
  else
    pass "SMB 139,445 rule removed"
  fi
else
  warn "UFW checks skipped; rerun with sudo for full verification"
fi

section "tailscale"
ts_enabled="$(systemctl is-enabled tailscaled 2>&1 || true)"
ts_active="$(systemctl is-active tailscaled 2>&1 || true)"
ts_ip4="$(tailscale ip -4 2>&1 || true)"
printf 'tailscaled enabled=%s active=%s\n' "$ts_enabled" "$ts_active"
printf 'tailscale_ip4=%s\n' "$ts_ip4"

if [[ "$ts_enabled" == "enabled" ]]; then
  pass "tailscaled enabled at boot"
else
  fail "tailscaled not enabled: $ts_enabled"
fi
if [[ "$ts_active" == "active" ]]; then
  pass "tailscaled active"
else
  fail "tailscaled not active: $ts_active"
fi
if [[ "$ts_ip4" == 100.* ]]; then
  pass "Tailscale IPv4 assigned: $ts_ip4"
else
  fail "no Tailscale 100.x IPv4: $ts_ip4"
fi

ts_json="$(tailscale status --json 2>/dev/null || true)"
if [[ -n "$ts_json" ]] && printf '%s' "$ts_json" | python3 -c '
import json
import sys

data = json.load(sys.stdin)
state = data.get("BackendState")
self_online = (data.get("Self") or {}).get("Online")
peers = sum(1 for p in (data.get("Peer") or {}).values() if p.get("Online"))
print("backend_state=%s self_online=%s online_peers=%d" % (state, self_online, peers))
raise SystemExit(0 if state == "Running" and self_online else 1)
'; then
  pass "Tailscale backend running and online"
else
  fail "Tailscale backend not running/online"
fi

printf '%s\n' "--- tailscale status ---"
tailscale status 2>&1 | head -20

section "wait for model health"
ready=0
for i in $(seq 1 60); do
  all_ready=1
  for port in 11435 11436 11437; do
    if ! curl --noproxy '*' -fsS --max-time 2 "http://127.0.0.1:$port/health" >/dev/null 2>&1; then
      all_ready=0
    fi
  done
  if [[ "$all_ready" == "1" ]]; then
    ready=1
    printf 'all model health endpoints ready after %ss\n' "$((i * 2))"
    break
  fi
  sleep 2
done
if [[ "$ready" == "1" ]]; then
  pass "all model health endpoints ready"
else
  warn "model health endpoints not all ready after 120s"
fi

section "model health"
for port in 11435 11436 11437; do
  body="$(curl --noproxy '*' -fsS --max-time 5 "http://127.0.0.1:$port/health" 2>&1)"
  rc=$?
  printf '%s/health: %s\n' "$port" "$body"
  if [[ $rc -eq 0 ]] && printf '%s' "$body" | python3 -c 'import json,sys; raise SystemExit(0 if json.load(sys.stdin).get("status") == "ok" else 1)' 2>/dev/null; then
    pass "$port health 200"
  else
    fail "$port health failed"
  fi
done

check_props() {
  local port="$1"
  local alias="$2"
  local slots="$3"
  local ctx="$4"
  local body
  local rc
  body="$(curl --noproxy '*' -fsS --max-time 5 "http://127.0.0.1:$port/props" 2>&1)"
  rc=$?
  if [[ $rc -ne 0 ]]; then
    printf '%s/props error: %s\n' "$port" "$body"
    fail "$port /props unavailable"
    return
  fi
  if printf '%s' "$body" | python3 -c '
import json
import sys

expected_alias = sys.argv[1]
expected_slots = int(sys.argv[2])
expected_ctx = int(sys.argv[3])
data = json.load(sys.stdin)
got_alias = data.get("model_alias")
got_slots = data.get("total_slots")
got_ctx = (data.get("default_generation_settings") or {}).get("n_ctx")
print("alias=%r total_slots=%r slot_ctx=%r" % (got_alias, got_slots, got_ctx))
raise SystemExit(0 if (got_alias == expected_alias and got_slots == expected_slots and got_ctx == expected_ctx) else 1)
' "$alias" "$slots" "$ctx" 2>/dev/null; then
    pass "$port /props alias/slots/context"
  else
    printf '%s/props unexpected: %s\n' "$port" "$(printf '%s' "$body" | head -c 500)"
    fail "$port /props mismatch"
  fi
}

check_props 11436 "gemma3:4b" 4 24576
check_props 11437 "bge-m3" 4 8192
check_props 11435 "bge-reranker-v2-m3" 4 8192

section "listeners"
listen="$(ss -ltnp 2>/dev/null | grep -E ':(11434|11435|11436|11437)\b' || true)"
if [[ -n "$listen" ]]; then
  printf '%s\n' "$listen"
else
  echo "no model listeners found"
fi

if printf '%s' "$listen" | grep -qE ':11434[[:space:]]'; then
  fail "11434 still listening"
else
  pass "11434 closed"
fi

for port in 11435 11436 11437; do
  if printf '%s' "$listen" | grep -qE ":${port}[[:space:]]"; then
    pass "$port listening"
  else
    fail "$port not listening"
  fi
done

if printf '%s' "$listen" | grep -qE '(0\.0\.0\.0|\[::\]):1143[5-7]'; then
  warn "model ports bind 0.0.0.0/[::]; UFW/Tailscale is the only network barrier"
else
  pass "model ports do not bind all interfaces"
fi

section "nvidia-smi"
if command -v nvidia-smi >/dev/null 2>&1; then
  nvidia-smi 2>&1 || fail "nvidia-smi failed"
  gpu_csv="$(nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu --format=csv,noheader,nounits 2>&1 || true)"
  printf 'gpu=%s\n' "$gpu_csv"

  free_mib="$(nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d '[:space:]' || true)"
  temp="$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>/dev/null | head -1 | tr -d '[:space:]' || true)"

  if [[ "$free_mib" =~ ^[0-9]+$ ]]; then
    if [[ "$free_mib" -ge 2048 ]]; then
      pass "VRAM free ${free_mib} MiB"
    elif [[ "$free_mib" -ge 1024 ]]; then
      warn "VRAM free ${free_mib} MiB (less than 2 GiB)"
    else
      fail "VRAM free ${free_mib} MiB"
    fi
  else
    warn "could not parse free VRAM"
  fi

  if [[ "$temp" =~ ^[0-9]+$ ]]; then
    if [[ "$temp" -lt 85 ]]; then
      pass "GPU temperature ${temp}C"
    else
      fail "GPU temperature ${temp}C"
    fi
  else
    warn "could not parse GPU temperature"
  fi

  apps="$(nvidia-smi --query-compute-apps=pid,process_name,used_memory --format=csv,noheader 2>/dev/null || true)"
  printf '%s\n' "compute_apps:"
  printf '%s\n' "$apps"
  llama_count="$(printf '%s\n' "$apps" | grep -c 'llama-server' || true)"
  if [[ "$llama_count" -eq 3 ]]; then
    pass "3 llama-server GPU processes"
  else
    fail "expected 3 llama-server GPU processes, found $llama_count"
  fi
  if printf '%s\n' "$apps" | awk -F', ' '{n = split($2, parts, "/"); if (parts[n] == "ollama") found = 1} END {exit found ? 0 : 1}'; then
    fail "ollama process on GPU"
  else
    pass "no ollama GPU process"
  fi
else
  fail "nvidia-smi not found"
fi

section "journal since boot"
if journalctl -b -n 1 --no-pager >/dev/null 2>&1; then
  for unit in $UNITS; do
    printf '\n--- %s\n' "$unit"
    errs="$(journalctl -b -u "$unit" -p 3 --no-pager 2>/dev/null || true)"
    errs="$(printf '%s\n' "$errs" | grep -v '^-- No entries --$' | grep -v '^[[:space:]]*$' || true)"
    if [[ -n "$errs" ]]; then
      printf '%s\n' "$errs" | tail -20
      fail "$unit has priority<=3 journal entries since boot"
    else
      pass "$unit no priority<=3 journal entries since boot"
    fi

    fatal="$(journalctl -b -u "$unit" --no-pager 2>/dev/null | grep -Ei 'CUDA error|out of memory|oom-kill|killed process|Failed with result' | tail -10 || true)"
    if [[ -n "$fatal" ]]; then
      printf '%s\n' "$fatal"
      fail "$unit has fatal journal pattern"
    else
      pass "$unit no CUDA/OOM/failed-result pattern"
    fi
  done
else
  warn "journal not readable; rerun with sudo"
fi

section "summary"
printf 'pass=%d fail=%d warn=%d\n' "$PASS" "$FAIL" "$WARN"
printf 'report=%s\n' "$OUT"
if [[ "$HAVE_ROOT" != "1" ]]; then
  echo "NOTE: UFW checks were skipped; rerun with sudo for a full pass."
fi
if [[ "$FAIL" -eq 0 ]]; then
  echo "RESULT: PASS"
  exit 0
fi

echo "RESULT: FAIL"
exit 1
