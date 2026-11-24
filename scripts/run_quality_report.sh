#!/usr/bin/env bash
# Send the weekly aggregate RAG quality report. Intended for cron/launchd/systemd.
#
# Example crontab (Monday 09:00):
#   0 9 * * 1 /path/to/judgment/scripts/run_quality_report.sh
#
# Configure Slack or email with RAG_QUALITY_REPORT_* environment variables.
# The script never includes visitor comments or review notes.
#
# Run this outside demo hours and outside data-import windows.  Set
# RAG_QUALITY_REPORT_DATABASE_URL to a read-only database role; the script
# never uses JUDGMENT_ADMIN_TOKEN or the HTTP API.  Queries are bounded by
# RAG_QUALITY_REPORT_STATEMENT_TIMEOUT_MS.  Delivery is dry-run by default;
# set QUALITY_REPORT_SEND=1 only after the channels and recipients are verified.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"
mkdir -p .run
LOCK_DIR=".run/quality_report.lock"

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
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) quality report already running; skip" >> .run/quality_report.log
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

STAMP="$(date -u +%Y-%m-%d)"
SEND_MODE="${QUALITY_REPORT_SEND:-0}"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) starting quality report send=${SEND_MODE}" >> .run/quality_report.log
set +e
if [[ "${SEND_MODE}" = "1" ]]; then
  uv run python scripts/send_quality_report.py \
    --days 7 \
    --only-alerts \
    --send \
    --output ".run/quality-report-${STAMP}.md" >> .run/quality_report.log 2>&1
else
  uv run python scripts/send_quality_report.py \
    --days 7 \
    --only-alerts \
    --dry-run \
    --output ".run/quality-report-${STAMP}.md" >> .run/quality_report.log 2>&1
fi
code=$?
set -e
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) finished exit=${code}" >> .run/quality_report.log
exit "${code}"
