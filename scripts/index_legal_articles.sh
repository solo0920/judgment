#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
exec uv run judgment-index-legal-articles "$@"
