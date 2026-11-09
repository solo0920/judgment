from __future__ import annotations

from io import StringIO

from judgment.index_progress import IndexProgress


def test_progress_renders_ten_fixed_lines_and_a_wide_total() -> None:
    stream = StringIO()
    progress = IndexProgress(
        1000,
        stream=stream,
        enabled=True,
        min_interval_seconds=0,
    )
    progress.update(250, reused=200, embedded=50)
    text = stream.getvalue()
    assert "\x1b[12A" not in text
    cleaned = text.replace("\x1b[2K", "")
    lines = [line for line in cleaned.splitlines() if line]
    assert len(lines) == 12
    assert "25.0%" in lines[0]
    assert "reused 200" in lines[0]
    assert "embedded 50" in lines[0]
    assert all(len(line) == 100 for line in lines[1:11])
    assert len(lines[11]) >= 20
    assert lines[1].count("█") == 100
    assert lines[2].count("█") == 100
    assert lines[3].count("█") == 50
    assert lines[4].count("█") == 0

    progress.update(1000)
    progress.finish()
    final = stream.getvalue().replace("\x1b[2K", "")
    final_lines = [line for line in final.splitlines() if line]
    assert "100.0%" in final_lines[-12]
    assert final_lines[-11].count("█") == 100
    assert final_lines[-1].count("█") == len(final_lines[-1])
