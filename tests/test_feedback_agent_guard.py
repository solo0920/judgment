from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPT = Path("scripts/check_feedback_agent_changes.py").resolve()


def _run(repo: Path, base: str = "HEAD~1", head: str = "HEAD"):
    return subprocess.run(
        [
            sys.executable,
            str(SCRIPT),
            "--base",
            base,
            "--head",
            head,
        ],
        cwd=repo,
        text=True,
        capture_output=True,
    )


def _git(repo: Path, *args: str) -> None:
    subprocess.run(["git", *args], cwd=repo, check=True, capture_output=True)


def _repo(tmp_path: Path) -> Path:
    repo = tmp_path / "repo"
    repo.mkdir()
    _git(repo, "init", "-q")
    _git(repo, "config", "user.email", "test@example.test")
    _git(repo, "config", "user.name", "Test")
    (repo / "tests").mkdir()
    (repo / "tests" / "test_existing.py").write_text("def test_x():\n    pass\n")
    (repo / "src").mkdir()
    (repo / "src" / "app.py").write_text("VALUE = 1\n")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-qm", "base")
    return repo


def test_feedback_agent_guard_rejects_protected_and_existing_tests(
    tmp_path: Path,
) -> None:
    repo = _repo(tmp_path)
    (repo / "tests" / "test_existing.py").write_text(
        "def test_x():\n    assert False\n"
    )
    (repo / "src" / "app.py").write_text("VALUE = 2\n")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-qm", "agent change")
    result = _run(repo)
    assert result.returncode == 1
    assert "existing tests may not be modified or deleted" in result.stderr
    assert "tests/test_existing.py" in result.stderr


def test_feedback_agent_guard_rejects_codeowners_and_policy(tmp_path: Path) -> None:
    repo = _repo(tmp_path)
    (repo / ".github").mkdir()
    (repo / ".github" / "CODEOWNERS").write_text("* @someone\n")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-qm", "agent change")
    result = _run(repo)
    assert result.returncode == 1
    assert "protected path changed by feedback agent" in result.stderr
    assert ".github/CODEOWNERS" in result.stderr


def test_feedback_agent_guard_allows_new_tests_and_normal_code(
    tmp_path: Path,
) -> None:
    repo = _repo(tmp_path)
    (repo / "tests" / "test_new_regression.py").write_text(
        "def test_regression():\n    assert True\n"
    )
    (repo / "src" / "app.py").write_text("VALUE = 3\n")
    _git(repo, "add", "-A")
    _git(repo, "commit", "-qm", "agent change")
    result = _run(repo)
    assert result.returncode == 0, result.stderr
    assert "Feedback agent guard passed." in result.stdout
