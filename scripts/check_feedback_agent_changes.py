#!/usr/bin/env python3
"""Guard the offline OpenCode feedback workflow.

Agent work happens on branches named ``feedback/*``.  This check runs in CI
with no secrets and fails when the branch touches files that must stay human
owned.  New test files are allowed; modifying or deleting existing tests is
not.
"""

from __future__ import annotations

import argparse
import subprocess
import sys

PROTECTED_PREFIXES = (
    ".github/",
    "src/judgment/web/auth.py",
    "src/judgment/web/principal.py",
    "src/judgment/web/route_policy.py",
    "src/judgment/web/route_policies.json",
    "src/judgment/web/demo_policies.json",
    "src/judgment/web/demo_mode.py",
    "src/judgment/models.py",
    "src/judgment/db.py",
    "src/judgment/web/maintenance.py",
    "scripts/backup.sh",
    "scripts/restore.sh",
    "scripts/check_feedback_agent_changes.py",
    "specs/benchmarks/",
    "specs/security/",
)
PROTECTED_EXACT = frozenset({"scripts/check_feedback_agent_changes.py"})
TEST_PREFIX = "tests/"
ALLOWED_NEW_TEST_SUFFIXES = (".py", ".mjs", ".js", ".json", ".md")


def _git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True)


def _base(value: str) -> str:
    if value:
        return value
    return "origin/main"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", default="")
    parser.add_argument("--head", default="HEAD")
    args = parser.parse_args()
    base = _base(args.base)
    try:
        subprocess.check_call(
            ["git", "rev-parse", "--verify", base],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        print(f"base ref not found: {base}", file=sys.stderr)
        return 2

    name_status = _git(
        "diff", "--name-status", f"{base}...{args.head}"
    ).splitlines()
    errors: list[str] = []
    for line in name_status:
        if not line.strip():
            continue
        parts = line.split("\t")
        status = parts[0].strip()
        path = parts[-1].strip()
        if not path:
            continue
        if status.startswith("A") and path.startswith(TEST_PREFIX):
            if path.endswith(ALLOWED_NEW_TEST_SUFFIXES):
                continue
            errors.append(f"new test asset type is not allowed: {path}")
            continue
        if path.startswith(TEST_PREFIX):
            errors.append(
                f"existing tests may not be modified or deleted: {path}"
            )
            continue
        if path in PROTECTED_EXACT or path.startswith(PROTECTED_PREFIXES):
            errors.append(f"protected path changed by feedback agent: {path}")

    if errors:
        print("Feedback agent guard failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        print(
            "Revert these changes. CODEOWNERS paths, tests, CI, auth, "
            "policy, schema, backups and holdout assets require human work.",
            file=sys.stderr,
        )
        return 1
    print("Feedback agent guard passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
