#!/usr/bin/env bash
# Verify x570 UFW rejection / Tailscale-only model access.
#
# Run on the MBP, on the same LAN as x570:
#   X570_LAN_IP=<x570-lan-ip> bash scripts/x570_ufw_reject_test.sh
#
# Run on a second LAN device (macOS/Linux), Tailscale OFF:
#   X570_LAN_IP=<x570-lan-ip> bash x570_ufw_reject_test.sh --lan-only
#
# The script only reads state. It never changes UFW, services, or listeners.
#
# Exit 0 means the local-side checks passed. A second device and a mobile
# network test are still required before NET-01/NET-02 can be marked verified.
set -uo pipefail

MODE="${1:-full}"
case "$MODE" in
  full|--lan-only) ;;
  *)
    echo "usage: $0 [--lan-only]" >&2
    exit 2
    ;;
esac

TS_HOST="${X570_TS_HOST:-x570}"
SSH_HOST="${X570_SSH_HOST:-$TS_HOST}"
LAN_IP="${X570_LAN_IP:-}"
TIMEOUT="${PROBE_TIMEOUT:-3}"
OUT="${REPORT:-$HOME/judgment-x570-ufw-reject-$(date +%Y%m%d-%H%M%S).txt}"

case "$TIMEOUT" in
  ''|*[!0-9]*)
    echo "PROBE_TIMEOUT must be an integer (seconds)" >&2
    exit 2
    ;;
esac

if [[ -z "$LAN_IP" ]]; then
  cat >&2 <<'EOF'
X570_LAN_IP is required.
  X570_LAN_IP=<x570 LAN IPv4> bash scripts/x570_ufw_reject_test.sh
EOF
  exit 2
fi

if ! python3 -c 'import ipaddress,sys; ipaddress.ip_address(sys.argv[1])' "$LAN_IP" 2>/dev/null; then
  echo "X570_LAN_IP is not a valid IP address: $LAN_IP" >&2
  exit 2
fi

PASS=0
FAIL=0
WARN=0

pass() { PASS=$((PASS + 1)); printf 'PASS  %s\n' "$*"; }
fail() { FAIL=$((FAIL + 1)); printf 'FAIL  %s\n' "$*"; }
warn() { WARN=$((WARN + 1)); printf 'WARN  %s\n' "$*"; }
section() { printf '\n=== %s ===\n' "$*"; }

exec > >(tee "$OUT") 2>&1

printf 'mode=%s host=%s date=%s\n' "$MODE" "$(hostname)" "$(date '+%Y-%m-%dT%H:%M:%S%z')"
printf 'tailscale_host=%s ssh_host=%s lan_ip=%s timeout=%ss\n' "$TS_HOST" "$SSH_HOST" "$LAN_IP" "$TIMEOUT"
printf 'output=%s\n' "$OUT"

# Best-effort local LAN IPv4, used only to match the x570 UFW block log.
local_ip=""
if command -v ipconfig >/dev/null 2>&1; then
  for iface in en0 en1; do
    candidate="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "$candidate" ]]; then
      local_ip="$candidate"
      break
    fi
  done
elif command -v ip >/dev/null 2>&1; then
  local_ip="$(ip -4 route get "$LAN_IP" 2>/dev/null | awk '{for (i=1; i<=NF; i++) if ($i == "src") {print $(i+1); exit}}' || true)"
fi
if [[ -n "$local_ip" ]]; then
  echo "local_lan_ip=$local_ip"
  if [[ "${local_ip%.*}" == "${LAN_IP%.*}" ]]; then
    pass "local device and x570 are on the same /24"
  else
    warn "local device and x570 are not on the same /24; LAN rejection may be inconclusive"
  fi
else
  warn "could not detect local LAN IPv4; UFW log matching will be weaker"
fi

tcp_probe() {
  python3 - "$1" "$2" "$TIMEOUT" <<'PY'
import socket
import sys
import time

host = sys.argv[1]
port = int(sys.argv[2])
timeout = float(sys.argv[3])

start = time.monotonic()
try:
    sock = socket.create_connection((host, port), timeout=timeout)
    sock.close()
except socket.timeout:
    elapsed = (time.monotonic() - start) * 1000
    print("timeout %.0fms" % elapsed)
    sys.exit(2)
except ConnectionRefusedError:
    elapsed = (time.monotonic() - start) * 1000
    print("refused %.0fms" % elapsed)
    sys.exit(3)
except OSError as exc:
    elapsed = (time.monotonic() - start) * 1000
    print("error %s: %s (%.0fms)" % (exc.errno, exc.strerror, elapsed))
    sys.exit(4)
else:
    elapsed = (time.monotonic() - start) * 1000
    print("open %.0fms" % elapsed)
    sys.exit(0)
PY
}

check_open() {
  local label="$1"
  local host="$2"
  local port="$3"
  local out
  local rc
  out="$(tcp_probe "$host" "$port" 2>&1)"
  rc=$?
  if [[ $rc -eq 0 ]]; then
    pass "$label open ($out)"
  else
    fail "$label expected open, got $out"
  fi
}

check_blocked() {
  local label="$1"
  local host="$2"
  local port="$3"
  local out
  local rc
  out="$(tcp_probe "$host" "$port" 2>&1)"
  rc=$?
  if [[ $rc -ne 0 ]]; then
    pass "$label blocked ($out)"
  else
    fail "$label expected blocked, got $out"
  fi
}

check_health() {
  local label="$1"
  local url="$2"
  local body
  local rc
  body="$(curl --noproxy '*' -fsS --connect-timeout 3 --max-time 5 "$url" 2>&1)"
  rc=$?
  if [[ $rc -eq 0 ]] && printf '%s' "$body" | python3 -c 'import json,sys; raise SystemExit(0 if json.load(sys.stdin).get("status") == "ok" else 1)' 2>/dev/null; then
    pass "$label health 200 ($body)"
  else
    fail "$label health failed ($body)"
  fi
}

check_tailscale_dns() {
  python3 - "$TS_HOST" <<'PY'
import ipaddress
import socket
import sys

host = sys.argv[1]
try:
    infos = socket.getaddrinfo(host, None, socket.AF_INET, socket.SOCK_STREAM)
except OSError as exc:
    print("resolve failed: %s" % exc)
    sys.exit(1)

addrs = sorted({info[4][0] for info in infos})
print("%s -> %s" % (host, ", ".join(addrs)))
tailnet = ipaddress.ip_network("100.64.0.0/10")
if not any(ipaddress.ip_address(addr) in tailnet for addr in addrs):
    print("no 100.64.0.0/10 address; the app would not use the Tailscale path")
    sys.exit(1)
sys.exit(0)
PY
}

check_tailscale_online() {
  local json
  json="$(tailscale status --json 2>/dev/null || true)"
  if [[ -z "$json" ]]; then
    echo "tailscale status --json returned nothing"
    return 1
  fi
  printf '%s' "$json" | python3 -c '
import json
import sys

data = json.load(sys.stdin)
state = data.get("BackendState")
self_online = (data.get("Self") or {}).get("Online")
peers = [p for p in (data.get("Peer") or {}).values() if p.get("Online")]
print("backend=%s self_online=%s online_peers=%d" % (state, self_online, len(peers)))
raise SystemExit(0 if state == "Running" and self_online else 1)
'
}

if [[ "$MODE" == "full" ]]; then
  section "Tailscale path / DNS"
  if command -v tailscale >/dev/null 2>&1; then
    if check_tailscale_online; then
      pass "local Tailscale is running"
    else
      fail "local Tailscale is not running"
    fi
    echo "--- tailscale status ---"
    tailscale status 2>&1 | head -20
  else
    fail "tailscale command not found"
  fi

  if check_tailscale_dns; then
    pass "$TS_HOST resolves to a Tailscale 100.64.0.0/10 address"
  else
    fail "$TS_HOST does not resolve to a Tailscale address"
  fi

  if command -v tailscale >/dev/null 2>&1; then
    ping_out="$(tailscale ping -c 1 "$TS_HOST" 2>&1 || true)"
    echo "tailscale_ping=$ping_out"
    if printf '%s' "$ping_out" | grep -q 'pong'; then
      pass "tailscale ping $TS_HOST"
    else
      warn "tailscale ping $TS_HOST did not return pong"
    fi
  fi

  section "Tailscale path (expected allow)"
  for port in 11435 11436 11437; do
    check_open "tailscale $TS_HOST:$port" "$TS_HOST" "$port"
    check_health "tailscale $TS_HOST:$port" "http://$TS_HOST:$port/health"
  done
  check_blocked "tailscale $TS_HOST:11434 (Ollama disabled)" "$TS_HOST" 11434
  if ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$SSH_HOST" 'echo ssh-ok' >/dev/null 2>&1; then
    pass "SSH via $SSH_HOST"
  else
    fail "SSH via $SSH_HOST"
  fi
fi

section "LAN path (expected block)"
for port in 11435 11436 11437; do
  check_blocked "lan $LAN_IP:$port" "$LAN_IP" "$port"
done
check_blocked "lan $LAN_IP:11434 (Ollama disabled)" "$LAN_IP" 11434

if [[ "$MODE" == "full" ]]; then
  section "x570 UFW block log corroboration"
  if [[ -n "$local_ip" ]]; then
    block_log="$(ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$SSH_HOST" "journalctl -k --since '2 min ago' --no-pager 2>/dev/null | grep '\\[UFW BLOCK\\]' | grep 'SRC=${local_ip}' | grep -E 'DPT=1143[4-7]' | tail -12" 2>/dev/null || true)"
  else
    block_log="$(ssh -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new "$SSH_HOST" 'journalctl -k --since "2 min ago" --no-pager 2>/dev/null | grep "\[UFW BLOCK\]" | grep -E "DPT=1143[4-7]" | tail -12' 2>/dev/null || true)"
  fi
  if [[ -n "$block_log" ]]; then
    printf '%s\n' "$block_log"
    if [[ -n "$local_ip" ]] && printf '%s' "$block_log" | grep -q "SRC=${local_ip}"; then
      pass "x570 kernel logged [UFW BLOCK] for local LAN source $local_ip"
    else
      warn "UFW block entries found, but not for local IP $local_ip"
    fi
  else
    warn "no [UFW BLOCK] entry found; check UFW logging or journal permissions"
  fi
fi

section "external device evidence (still required for NET-01/NET-02)"
cat <<EOF
Second LAN device (not this host), Tailscale OFF:
  nc -vz -w 3 ${LAN_IP} 11434
  nc -vz -w 3 ${LAN_IP} 11435
  nc -vz -w 3 ${LAN_IP} 11436
  nc -vz -w 3 ${LAN_IP} 11437
  Expected: timeout / no route / refused; any failure means blocked.
  curl -v --connect-timeout 3 http://${LAN_IP}:11436/health
  Expected: connection timed out.

Phone on home Wi-Fi, Tailscale OFF:
  Open http://${LAN_IP}:11436/health in a browser.
  Expected: cannot connect.
  If the phone has Termius/Network Tools:
    nc -vz -w 3 ${LAN_IP} 11436

Phone on mobile data, Tailscale OFF:
  No public tunnel is running, so there is no public origin to test.
  Record this as N/A; do not count it as UFW evidence.
  After a public hostname exists, test https://<host>/api/health from mobile data.

Optional: second device with Tailscale ON (same tailnet):
  curl -fsS http://${TS_HOST}:11436/health
  Expected: {"status":"ok"}
EOF

if [[ "${SHOW_PUBLIC_IP:-0}" == "1" ]]; then
  public_ip="$(curl -4 --noproxy '*' -fsS --max-time 5 https://ifconfig.me 2>/dev/null || true)"
  if [[ -n "$public_ip" ]]; then
    printf '\nRouter public IPv4 (for an external test only): %s\n' "$public_ip"
    printf '  nc -vz -w 3 %s 11436   # expected timeout; NAT alone can cause this\n' "$public_ip"
  fi
fi

section "summary"
printf 'pass=%d fail=%d warn=%d\n' "$PASS" "$FAIL" "$WARN"
printf 'report=%s\n' "$OUT"
if [[ $FAIL -eq 0 ]]; then
  if [[ "$MODE" == "full" ]]; then
    echo "RESULT: PASS (local MBP-side only; second device + mobile evidence still required)"
  else
    echo "RESULT: PASS (second-device LAN-only path)"
  fi
  exit 0
fi

echo "RESULT: FAIL"
exit 1
