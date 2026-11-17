#!/usr/bin/env bash
# Fail if a Judgment-related TCP port is listening beyond loopback.
#
# Run after boot / deploy on macOS or Linux:
#   bash scripts/security_listener_check.sh
#
# The check intentionally ignores unrelated services (rapportd, Logitech
# Options, etc.).  It covers Judgment local services and the AI/DB ports that
# have been exposed in the past.  On Linux it uses ss; on macOS lsof.
set -euo pipefail

PORTS="${SECURITY_LISTENER_PORTS:-11434,11435,11436,11437,5432,6333,6334,9200,9201}"

rows=""
if command -v lsof >/dev/null 2>&1; then
  rows="$(
    lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk -v ports="${PORTS}" '
      BEGIN {
        n = split(ports, wanted, ",")
        for (i = 1; i <= n; i++) want[wanted[i]] = 1
      }
      NR == 1 { next }
      {
        addr = $9
        split(addr, parts, ":")
        port = parts[length(parts)]
        gsub(/[^0-9]/, "", port)
        if (!(port in want)) next
        if (addr ~ /^127\.0\.0\.1:/ || addr ~ /^\[::1\]:/) next
        print
      }
    '
  )"
elif command -v ss >/dev/null 2>&1; then
  rows="$(
    ss -ltnH 2>/dev/null | awk -v ports="${PORTS}" '
      BEGIN {
        n = split(ports, wanted, ",")
        for (i = 1; i <= n; i++) want[wanted[i]] = 1
      }
      {
        addr = $4
        split(addr, parts, ":")
        port = parts[length(parts)]
        gsub(/[^0-9]/, "", port)
        if (!(port in want)) next
        if (addr ~ /^127\.0\.0\.1:/ || addr ~ /^\[::1\]:/) next
        print
      }
    '
  )"
else
  echo "FAIL: neither lsof nor ss is available; cannot verify listeners." >&2
  exit 1
fi

if [[ -n "${rows}" ]]; then
  echo "FAIL: Judgment-related port is not loopback-only:" >&2
  printf '%s\n' "${rows}" >&2
  exit 1
fi

echo "OK: Judgment-related listeners are loopback-only (${PORTS})."
