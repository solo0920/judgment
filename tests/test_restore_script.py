from __future__ import annotations

import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ("restore.sh", "backup.sh")


def test_shell_scripts_parse() -> None:
    for name in SCRIPTS:
        subprocess.run(
            ["bash", "-n", str(ROOT / name)],
            check=True,
            cwd=ROOT,
        )


def test_shell_vars_use_braces_before_non_ascii_punctuation() -> None:
    pattern = re.compile(r"\$[A-Za-z_][A-Za-z0-9_]*[^\x00-\x7F]")
    for name in SCRIPTS:
        text = (ROOT / name).read_text(encoding="utf-8")
        matches = pattern.findall(text)
        assert matches == [], (name, matches)


def test_restore_drops_known_non_public_schemas() -> None:
    text = (ROOT / "restore.sh").read_text(encoding="utf-8")
    assert "DROP SCHEMA IF EXISTS legal_term_benchmark CASCADE" in text
    assert "DROP SCHEMA IF EXISTS legal_term_evidence CASCADE" in text
