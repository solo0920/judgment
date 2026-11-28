#!/usr/bin/env bash
# Login-time wrapper for the Judgment web console on the MBP.
#
# Installed by scripts/deploy_web_macos.sh as the com.judgment.web
# LaunchAgent.  OrbStack/Docker Desktop may still be starting when launchd
# runs this, so wait for the daemon before handing off to up.sh.  up.sh is
# idempotent: if the backend is already healthy it reports that and exits
# without starting a second tmux session.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${HOME}/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export TERM="${TERM:-xterm-256color}"

cd "${REPO_DIR}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "com.judgment.web autostart: ${REPO_DIR}"

if ! command -v docker >/dev/null 2>&1; then
  log "ERROR: docker not found in PATH"
  exit 1
fi

# OrbStack may not auto-start at login.  Only request it when Docker is not
# ready, and never activate its window: this wrapper also runs as a periodic
# watchdog, so `open -a` would steal focus every interval.
if ! docker info >/dev/null 2>&1; then
  log "Docker not ready; requesting OrbStack start in background"
  open -gja OrbStack >/dev/null 2>&1 || true
fi
docker_ready=0
for _ in $(seq 1 150); do
  if docker info >/dev/null 2>&1; then
    docker_ready=1
    break
  fi
  sleep 2
done
if [[ "${docker_ready}" != "1" ]]; then
  log "ERROR: Docker daemon not ready after 300 seconds"
  exit 1
fi

log "Docker ready; running ./up.sh"
set +e
"${REPO_DIR}/up.sh"
status=$?
set -e
log "./up.sh exited with status ${status}"
exit "${status}"
