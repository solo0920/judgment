#!/usr/bin/env bash
# Refresh pending Holdout rotation proposals. Intended for a monthly timer.
#
# Example crontab (first day of the month, 08:00):
#   0 8 1 * * /path/to/judgment/scripts/run_holdout_rotation.sh
#
# Proposals are never auto-applied; an admin must review them in the console.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"
mkdir -p .run
LOCK_DIR=".run/holdout_rotation.lock"

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
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) holdout rotation already running; skip" >> .run/holdout_rotation.log
  exit 0
fi
echo "$$" > "${LOCK_DIR}/pid"
trap 'rm -rf "${LOCK_DIR}"' EXIT

set -a
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi
set +a

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) planning holdout rotation" >> .run/holdout_rotation.log
set +e
uv run python scripts/plan_holdout_rotation.py >> .run/holdout_rotation.log 2>&1
code=$?
set -e
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) finished exit=${code}" >> .run/holdout_rotation.log
exit "${code}"
