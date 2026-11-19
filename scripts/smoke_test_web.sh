#!/usr/bin/env bash
set -euo pipefail

# Start a second web instance without migrations, event socket or warmers, then
# exercise the public/admin boundary.  Requires JUDGMENT_ADMIN_TOKEN in the
# environment; never source .env inside this script.
PORT="${JUDGMENT_SMOKE_PORT:-9202}"
BASE="http://127.0.0.1:${PORT}"
: "${JUDGMENT_ADMIN_TOKEN:?set JUDGMENT_ADMIN_TOKEN before running this script}"

if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port ${PORT} is already in use" >&2
  exit 1
fi

LOG="$(mktemp -t judgment-smoke.XXXXXX.log)"
PID=""
cleanup() {
  if [ -n "${PID}" ]; then
    kill "${PID}" >/dev/null 2>&1 || true
    wait "${PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

JUDGMENT_DISABLE_BACKGROUND_TASKS=1 \
AUTO_CREATE_SCHEMA=0 \
JUDGMENT_POWER_AGENT=0 \
JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0 \
  uv run judgment-web --host 127.0.0.1 --port "${PORT}" >"${LOG}" 2>&1 &
PID=$!

ready=0
for _ in $(seq 1 60); do
  if curl -fsS --max-time 2 "${BASE}/api/health" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.5
done
if [ "${ready}" != "1" ]; then
  echo "smoke instance did not become ready; log follows" >&2
  cat "${LOG}" >&2
  exit 1
fi

check() {
  local expected="$1"
  shift
  local code
  code="$(curl -sS --max-time 10 -o /dev/null -w '%{http_code}' "$@")"
  if [ "${code}" != "${expected}" ]; then
    echo "FAIL: expected ${expected}, got ${code}: $*" >&2
    echo "--- smoke instance log ---" >&2
    cat "${LOG}" >&2
    exit 1
  fi
}

check 200 "${BASE}/api/health"
check 200 "${BASE}/"
check 200 "${BASE}/api/auth/me"
check 401 "${BASE}/api/status"
check 401 "${BASE}/api/processing"
check 401 -X POST "${BASE}/api/processing/stop"
check 401 -X DELETE "${BASE}/api/llama-server/hosts/1"
check 401 -X POST -H 'Content-Type: application/json' -d '{}' "${BASE}/api/rag/query"
check 401 "${BASE}/api/does-not-exist"
check 200 -H "X-Judgment-Admin-Token: ${JUDGMENT_ADMIN_TOKEN}" "${BASE}/api/question-bank/stats"

echo "smoke test passed on ${BASE}"
