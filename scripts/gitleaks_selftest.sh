#!/usr/bin/env bash
# Negative/positive control for the repository's custom gitleaks rules.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="$ROOT/.gitleaks.toml"
command -v gitleaks >/dev/null 2>&1 || {
  echo "gitleaks not found" >&2
  exit 127
}
[[ -f "$CONFIG" ]] || {
  echo "missing gitleaks config: $CONFIG" >&2
  exit 1
}

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

fake_token="unit_test_fake_token_1234567890"
printf 'JUDGMENT_ADMIN_TOKEN=%s\n' "$fake_token" > "$tmp/leak.txt"
set +e
gitleaks detect --source "$tmp" --no-git --config "$CONFIG" \
  --redact --exit-code 2 >/dev/null 2>&1
leak_rc=$?
set -e
if [[ "$leak_rc" -ne 2 ]]; then
  echo "gitleaks negative control failed: expected exit 2, got $leak_rc" >&2
  exit 1
fi

printf 'JUDGMENT_ADMIN_TOKEN=change-me\n' > "$tmp/leak.txt"
set +e
gitleaks detect --source "$tmp" --no-git --config "$CONFIG" \
  --redact --exit-code 2 >/dev/null 2>&1
clean_rc=$?
set -e
if [[ "$clean_rc" -ne 0 ]]; then
  echo "gitleaks clean control failed: expected exit 0, got $clean_rc" >&2
  exit 1
fi

echo "gitleaks self-test passed"
