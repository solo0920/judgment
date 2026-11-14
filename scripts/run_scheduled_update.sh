#!/usr/bin/env bash
# Run the resumable data update once. Intended for cron/launchd/systemd timers.
#
# Example crontab (03:30 every day):
#   30 3 * * * /path/to/judgment/scripts/run_scheduled_update.sh
#
# The script creates a small lock directory so overlapping timers do not start
# two updates. A stale lock from a killed process is detected and replaced.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"
mkdir -p .run
LOCK_DIR=".run/scheduled_update.lock"

acquire_lock() {
  if mkdir "${LOCK_DIR}" 2>/dev/null; then
    return 0
  fi
  if [[ -f "${LOCK_DIR}/pid" ]]; then
    local pid
    pid="$(cat "${LOCK_DIR}/pid" 2>/dev/null || true)"
    if [[ "${pid}" =~ ^[0-9]+$ ]] && kill -0 "${pid}" 2>/dev/null; then
      return 1
    fi
  fi
  rm -rf "${LOCK_DIR}"
  mkdir "${LOCK_DIR}"
}

if ! acquire_lock; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) update already running; skip" >> .run/scheduled_update.log
  exit 0
fi
echo "$$" > "${LOCK_DIR}/pid"
trap 'rm -rf "${LOCK_DIR}"' EXIT

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) starting scheduled update" >> .run/scheduled_update.log
set +e
uv run python -m judgment.processing_update --index >> .run/scheduled_update.log 2>&1
code=$?
set -e
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) finished exit=${code}" >> .run/scheduled_update.log
exit "${code}"
