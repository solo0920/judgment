#!/usr/bin/env python3
"""Render a live progress bar for ``judgment-index-vectors`` output.

The indexer logs one line per batch:

    ... INFO judgment.judgment_index: indexed=1280 scanned=1280 points=1280 ...

This filter keeps the log file intact (``tee`` runs before the filter) and
turns those lines into a 10-line progress bar on a terminal: every line is
10 percent, every character is 0.1 percent (100 characters x 10 lines =
1,000 cells = 100 percent). When the output is redirected, it prints a
compact progress line at most every ``--interval`` seconds instead.

Press Ctrl-C to stop. The indexer commits each batch, so the next run can
detect the remaining rows and continue.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
import time
from collections import deque
from typing import Deque, List, Optional, TextIO, Tuple

PROGRESS_RE = re.compile(
    r"indexed=(?P<indexed>\d+)\s+scanned=(?P<scanned>\d+)\s+points=(?P<points>\d+)"
)

# These repeat for every batch and would otherwise drown the progress bar.
NOISE_PREFIXES = ("httpx: HTTP Request:",)

FULL_CELL = "█"
EMPTY_CELL = "░"


def human_duration(seconds: float) -> str:
    total = max(0, int(round(seconds)))
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def render_bar_lines(
    filled_cells: int,
    *,
    width: int = 100,
    lines: int = 10,
) -> List[str]:
    """Render ``lines`` rows of ``width`` cells, each row representing 10%.

    ``filled_cells`` is clamped to ``width * lines``. The returned strings
    include a left-hand percentage label, so each line is ``width + 5``
    characters long.
    """

    width = max(1, int(width))
    lines = max(1, int(lines))
    total_cells = width * lines
    filled_cells = max(0, min(total_cells, int(filled_cells)))
    rendered: List[str] = []
    for index in range(lines):
        start = index * width
        filled = max(0, min(width, filled_cells - start))
        label = f"{int(round(100 * index / lines)):3d}% "
        rendered.append(label + FULL_CELL * filled + EMPTY_CELL * (width - filled))
    return rendered


class ProgressRenderer:
    def __init__(
        self,
        *,
        limit: int,
        label: str = "全量索引",
        interval: float = 30.0,
        overall_start: int = 0,
        overall_total: int = 0,
        bar_lines: int = 10,
        bar_width: int = 100,
        stream: Optional[TextIO] = None,
    ) -> None:
        self.limit = max(0, int(limit))
        self.label = str(label or "").strip()
        self.interval = max(1.0, float(interval))
        self.overall_start = max(0, int(overall_start))
        self.overall_total = max(0, int(overall_total))
        self.bar_lines = max(1, int(bar_lines))
        self.requested_width = max(10, int(bar_width))
        self.stream = stream or sys.stdout
        self.is_tty = bool(getattr(self.stream, "isatty", lambda: False)())

        if self.is_tty:
            columns = shutil.get_terminal_size(
                (self.requested_width + 8, 24)
            ).columns
            self.columns = max(20, int(columns))
            self.bar_width = min(
                self.requested_width, max(20, self.columns - 6)
            )
        else:
            self.columns = 0
            self.bar_width = self.requested_width

        self.block_lines = self.bar_lines + 2
        self.started = time.perf_counter()
        self.last_print_at = 0.0
        self.last_emit_at = 0.0
        self.last_indexed = 0
        self.last_scanned = 0
        self.last_points = 0
        self.bar_visible = False
        self.final_status = ""
        self.summary_pending = False
        self._samples: Deque[Tuple[float, int]] = deque(maxlen=240)

    def start(self) -> None:
        """Print the one-time header before the live block."""

        if not self.is_tty:
            return
        header = (
            f"{self.label}：本次待索引 {self.limit:,} 筆"
            if self.label
            else f"本次待索引 {self.limit:,} 筆"
        )
        if self.overall_total > 0:
            percent = 100.0 * self.overall_start / self.overall_total
            header += (
                f" · 目前 {self.overall_start:,} / {self.overall_total:,}"
                f"（{percent:.1f}%）"
            )
        self.stream.write(header + "\n")
        if self.bar_width < self.requested_width:
            self.stream.write(
                f"提示：終端寬度 {self.columns} 欄，進度條每行自動縮為 "
                f"{self.bar_width} 字元；放大視窗可顯示完整 "
                f"{self.requested_width} 字元（每字元 0.1%）。\n"
            )
        self.stream.flush()

    def _record_sample(self) -> None:
        now = time.perf_counter()
        self._samples.append((now, self.last_indexed))
        while self._samples and now - self._samples[0][0] > 60.0:
            self._samples.popleft()

    def _rate(self) -> float:
        now = time.perf_counter()
        if len(self._samples) >= 2:
            first_at, first_value = self._samples[0]
            span = now - first_at
            if span > 0:
                return max(0.0, (self.last_indexed - first_value) / span)
        elapsed = max(0.001, now - self.started)
        return self.last_indexed / elapsed

    def _ratio(self) -> float:
        if not self.limit:
            return 0.0
        return max(0.0, min(1.0, self.last_indexed / self.limit))

    def _eta(self, rate: float) -> float:
        remaining = max(0, self.limit - self.last_indexed)
        return remaining / rate if rate > 0 else 0.0

    def _overall(self) -> Tuple[int, float]:
        if self.overall_total <= 0:
            return 0, 0.0
        count = min(
            self.overall_total,
            self.overall_start + self.last_indexed,
        )
        return count, 100.0 * count / self.overall_total

    def _status_lines(
        self, ratio: float, rate: float, elapsed: float
    ) -> List[str]:
        percent = 100.0 * ratio
        eta = self._eta(rate)
        first = (
            f"本次 {self.last_indexed:,} / {self.limit:,}"
            f"（{percent:.1f}%）· {rate:.1f} 筆/秒"
        )
        second = f"已用 {human_duration(elapsed)} · 剩餘 {human_duration(eta)}"
        overall_count, overall_percent = self._overall()
        if self.overall_total > 0:
            second += (
                f" · 總進度 {overall_count:,}/{self.overall_total:,}"
                f"（{overall_percent:.1f}%）"
            )
        return [first, second]

    def _render_block(self) -> List[str]:
        ratio = self._ratio()
        filled_cells = int(ratio * self.bar_width * self.bar_lines)
        rate = self._rate()
        elapsed = time.perf_counter() - self.started
        bars = render_bar_lines(
            filled_cells,
            width=self.bar_width,
            lines=self.bar_lines,
        )
        return bars + self._status_lines(ratio, rate, elapsed)

    def _compact_line(self) -> str:
        ratio = self._ratio()
        percent = 100.0 * ratio
        rate = self._rate()
        elapsed = time.perf_counter() - self.started
        eta = self._eta(rate)
        prefix = f"{self.label} " if self.label else ""
        line = (
            f"{prefix}進度 {self.last_indexed:,} / {self.limit:,}"
            f"（{percent:.1f}%）· {rate:.1f} 筆/秒"
            f" · 已用 {human_duration(elapsed)}"
            f" · 剩餘 {human_duration(eta)}"
        )
        overall_count, overall_percent = self._overall()
        if self.overall_total > 0:
            line += (
                f" · 總進度 {overall_count:,}/{self.overall_total:,}"
                f"（{overall_percent:.1f}%）"
            )
        return line

    def _erase_block(self) -> None:
        if not self.bar_visible:
            return
        self.stream.write(f"\033[{self.block_lines}A")
        for _ in range(self.block_lines):
            self.stream.write("\r\033[K\n")
        self.stream.write(f"\033[{self.block_lines}A")
        self.stream.flush()
        self.bar_visible = False

    def _paint(self, force: bool = False) -> None:
        now = time.perf_counter()
        if self.is_tty:
            lines = self._render_block()
            if self.bar_visible:
                self.stream.write(f"\033[{len(lines)}A")
            for line in lines:
                self.stream.write("\r\033[K" + line + "\n")
            self.stream.flush()
            self.bar_visible = True
            return
        if (
            force
            or self.last_print_at == 0.0
            or now - self.last_print_at >= self.interval
            or self.last_indexed >= self.limit
        ):
            self.stream.write(self._compact_line() + "\n")
            self.stream.flush()
            self.last_print_at = now

    def feed(self, line: str) -> None:
        stripped = line.rstrip("\n")
        if any(prefix in stripped for prefix in NOISE_PREFIXES):
            return
        if stripped.strip() == "{":
            self.summary_pending = True
        if '"status": "failed"' in stripped:
            self.final_status = "failed"
        elif (
            '"status": "success"' in stripped
            or '"status": "dry_run"' in stripped
        ):
            self.final_status = "success"

        match = PROGRESS_RE.search(stripped)
        if match:
            self.last_indexed = int(match.group("indexed"))
            self.last_scanned = int(match.group("scanned"))
            self.last_points = int(match.group("points"))
            self._record_sample()
            self._paint()
            return

        if self.is_tty and not stripped.strip():
            return
        self._erase_block()
        self.stream.write(stripped + "\n")
        self.stream.flush()
        if (
            self.is_tty
            and not self.final_status
            and not self.summary_pending
            and self.last_indexed > 0
        ):
            self._paint(force=True)

    def finish(self) -> None:
        elapsed = time.perf_counter() - self.started
        rate = self.last_indexed / elapsed if elapsed > 0 else 0.0
        if self.final_status == "failed":
            label = "中止"
        elif self.final_status == "success":
            label = "完成"
        else:
            label = "結束"
        self._erase_block()
        summary = (
            f"{label}：{self.last_indexed:,} / {self.limit:,} 筆"
            f" · {rate:.1f} 筆/秒"
            f" · 耗時 {human_duration(elapsed)}"
        )
        overall_count, overall_percent = self._overall()
        if self.overall_total > 0:
            summary += (
                f" · 總進度 {overall_count:,}/{self.overall_total:,}"
                f"（{overall_percent:.1f}%）"
            )
        self.stream.write(summary + "\n")
        self.stream.flush()


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--limit", type=int, required=True, help="本次索引上限")
    parser.add_argument("--label", default="全量索引", help="顯示在進度列前的標籤")
    parser.add_argument(
        "--interval",
        type=float,
        default=30.0,
        help="非 TTY 模式下每隔幾秒輸出一行（預設 30）",
    )
    parser.add_argument(
        "--overall-start",
        type=int,
        default=0,
        help="本次執行前已索引的總筆數",
    )
    parser.add_argument(
        "--overall-total",
        type=int,
        default=0,
        help="判決總筆數，用於顯示總進度",
    )
    parser.add_argument(
        "--bar-lines",
        type=int,
        default=10,
        help="進度條列數（預設 10，每列代表 10%%）",
    )
    parser.add_argument(
        "--bar-width",
        type=int,
        default=100,
        help="每列進度條字元數（預設 100，每字元 0.1%%）",
    )
    args = parser.parse_args(argv)

    renderer = ProgressRenderer(
        limit=args.limit,
        label=args.label,
        interval=args.interval,
        overall_start=args.overall_start,
        overall_total=args.overall_total,
        bar_lines=args.bar_lines,
        bar_width=args.bar_width,
    )
    renderer.start()
    interrupted = False
    try:
        for line in sys.stdin:
            renderer.feed(line)
    except KeyboardInterrupt:
        interrupted = True
    finally:
        renderer.finish()
    return 130 if interrupted else 0


if __name__ == "__main__":
    raise SystemExit(main())
