from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = (
    "scripts/run_quality_report.sh",
    "scripts/send_quality_report.py",
    "scripts/run_holdout_rotation.sh",
    "scripts/plan_holdout_rotation.py",
)


def test_scheduler_scripts_parse() -> None:
    for name in SCRIPTS:
        path = ROOT / name
        if path.suffix == ".sh":
            subprocess.run(["bash", "-n", str(path)], check=True, cwd=ROOT)
        else:
            subprocess.run(
                ["python3", "-m", "py_compile", str(path)],
                check=True,
                cwd=ROOT,
            )


def test_scheduler_uses_pid_lock_and_does_not_use_admin_token() -> None:
    for name in ("scripts/run_quality_report.sh", "scripts/run_holdout_rotation.sh"):
        text = (ROOT / name).read_text(encoding="utf-8")
        assert "LOCK_DIR" in text
        assert "kill -0" in text
        assert "trap 'rm -rf" in text
        assert "X-Judgment-Admin-Token" not in text
        assert "$JUDGMENT_ADMIN_TOKEN" not in text
        assert "/api/" not in text


def test_scheduler_uses_least_privilege_database_url_and_timeout() -> None:
    report = (ROOT / "scripts/send_quality_report.py").read_text(
        encoding="utf-8"
    )
    rotation = (ROOT / "scripts/plan_holdout_rotation.py").read_text(
        encoding="utf-8"
    )
    assert "rag_quality_report_database_url" in report
    assert "apply_statement_timeout" in report
    assert "rag_holdout_rotation_database_url" in rotation
    assert "apply_statement_timeout" in rotation
    shell = (ROOT / "scripts/run_quality_report.sh").read_text(
        encoding="utf-8"
    )
    assert "--only-alerts" in shell
    assert "QUALITY_REPORT_SEND" in shell
    assert "--dry-run" in shell


def test_new_notification_secrets_stay_blank_in_env_example() -> None:
    env = (ROOT / ".env.example").read_text(encoding="utf-8")
    for key in (
        "RAG_QUALITY_REPORT_SLACK_WEBHOOK",
        "RAG_QUALITY_REPORT_SMTP_PASSWORD",
    ):
        line = next(
            row for row in env.splitlines() if row.startswith(f"{key}=")
        )
        assert line == f"{key}="
