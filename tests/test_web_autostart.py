from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_autostart_opens_orbstack_without_stealing_focus() -> None:
    wrapper = (ROOT / "scripts/mbp_web_autostart.sh").read_text(
        encoding="utf-8"
    )
    assert "open -a OrbStack" not in wrapper
    assert "open -gja OrbStack" in wrapper
    assert "if ! docker info" in wrapper
    subprocess.run(
        ["bash", "-n", str(ROOT / "scripts/mbp_web_autostart.sh")],
        check=True,
        cwd=ROOT,
    )


def test_launch_agent_template_has_periodic_watchdog() -> None:
    deploy = (ROOT / "scripts/deploy_web_macos.sh").read_text(
        encoding="utf-8"
    )
    assert "<key>StartInterval</key>" in deploy
    assert "<integer>300</integer>" in deploy
