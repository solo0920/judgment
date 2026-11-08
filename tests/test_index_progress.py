from __future__ import annotations

import importlib.util
import io
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "index_progress.py"
spec = importlib.util.spec_from_file_location("index_progress", SCRIPT)
assert spec and spec.loader
index_progress = importlib.util.module_from_spec(spec)
spec.loader.exec_module(index_progress)


def test_render_bar_lines_has_ten_rows_of_one_hundred_cells() -> None:
    rows = index_progress.render_bar_lines(0, width=100, lines=10)
    assert len(rows) == 10
    assert all(len(row) == 105 for row in rows)
    assert rows[0].startswith("  0% ")
    assert rows[9].startswith(" 90% ")
    assert all(index_progress.FULL_CELL not in row for row in rows)


def test_render_bar_lines_maps_each_character_to_one_tenth_percent() -> None:
    half = index_progress.render_bar_lines(500, width=100, lines=10)
    assert all(
        row.count(index_progress.FULL_CELL) == 100 for row in half[:5]
    )
    assert all(
        row.count(index_progress.FULL_CELL) == 0 for row in half[5:]
    )

    partial = index_progress.render_bar_lines(503, width=100, lines=10)
    assert partial[5].count(index_progress.FULL_CELL) == 3
    assert partial[5].count(index_progress.EMPTY_CELL) == 97

    complete = index_progress.render_bar_lines(1000, width=100, lines=10)
    assert all(
        row.count(index_progress.FULL_CELL) == 100 for row in complete
    )


def test_progress_renderer_non_tty_reports_run_and_overall_counts() -> None:
    stream = io.StringIO()
    renderer = index_progress.ProgressRenderer(
        limit=1000,
        label="全量索引",
        interval=0,
        overall_start=500,
        overall_total=2000,
        stream=stream,
    )
    renderer.feed(
        "INFO judgment.judgment_index: "
        "indexed=250 scanned=250 points=250 collection=judgment_documents\n"
    )
    renderer.feed('{"status": "success", "indexed_count": 250}\n')
    renderer.finish()

    output = stream.getvalue()
    assert "250 / 1,000" in output
    assert "25.0%" in output
    assert "總進度 750/2,000" in output
    assert "完成：" in output
