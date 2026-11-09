from __future__ import annotations

import shutil
import sys
import time
from typing import Optional, TextIO


def _duration(seconds: float) -> str:
    value = max(0, int(round(seconds)))
    if value < 60:
        return f"{value}s"
    minutes, secs = divmod(value, 60)
    if minutes < 60:
        return f"{minutes}m {secs:02d}s"
    hours, minutes = divmod(minutes, 60)
    return f"{hours}h {minutes:02d}m"


class IndexProgress:
    """Terminal progress display for versioned indexing.

    Layout:
    - 1 header line with phase, percentage, counts, rate and ETA.
    - 10 fixed lines, each 100 characters; one character = 0.1% of total.
    - 11th line uses the current terminal width and shows the overall progress.
    """

    def __init__(
        self,
        total: int,
        *,
        label: str = "",
        initial_indexed: int = 0,
        stream: Optional[TextIO] = None,
        enabled: Optional[bool] = None,
        min_interval_seconds: float = 0.15,
    ) -> None:
        self.total = max(0, int(total))
        self.label = str(label or "")
        self.initial_indexed = max(0, int(initial_indexed))
        self.stream = stream or sys.stderr
        self.enabled = (
            bool(getattr(self.stream, "isatty", lambda: False)())
            if enabled is None
            else bool(enabled)
        )
        self.min_interval_seconds = max(0.0, float(min_interval_seconds))
        self._started_at = time.monotonic()
        self._last_render_at = 0.0
        self._last_plain_bucket = -1
        self._rendered = False
        self._copy_started_at = self._started_at
        self._copy_last_at = 0.0
        self._last_phase = ""

    def _percent(self, indexed: int) -> float:
        if self.total <= 0:
            return 0.0
        return max(0.0, min(100.0, 100.0 * int(indexed) / self.total))

    def _wide_width(self) -> int:
        try:
            width = shutil.get_terminal_size(fallback=(100, 24)).columns
        except OSError:
            width = 100
        return max(20, min(240, int(width)))

    def _prefix(self) -> str:
        return f"{self.label} · " if self.label else ""

    def _header(
        self,
        *,
        indexed: int,
        reused: int,
        embedded: int,
        phase: str,
    ) -> str:
        percent = self._percent(indexed)
        elapsed = max(0.001, time.monotonic() - self._started_at)
        delta = max(0, int(indexed) - self.initial_indexed)
        rate = delta / elapsed if delta else 0.0
        remaining = max(0, self.total - int(indexed))
        eta = remaining / rate if rate > 0 else None
        phase_label = {
            "copying": "複製舊 collection",
            "indexing": "索引",
            "validating": "驗證",
            "done": "完成",
        }.get(phase, phase or "索引")
        parts = [
            f"{self._prefix()}{phase_label} {percent:5.1f}%",
            f"{int(indexed):,} / {self.total:,}",
            f"reused {int(reused):,}",
            f"embedded {int(embedded):,}",
        ]
        if rate > 0:
            parts.append(f"{rate:,.1f} 筆/秒")
            if eta is not None:
                parts.append(f"ETA {_duration(eta)}")
        return " · ".join(parts)

    def _render(self, header: str, percent: float) -> None:
        lines = []
        for line_index in range(10):
            fraction = (percent - line_index * 10.0) / 10.0
            fraction = max(0.0, min(1.0, fraction))
            filled = int(round(fraction * 100))
            lines.append("█" * filled + "░" * (100 - filled))
        wide = self._wide_width()
        wide_filled = int(round((percent / 100.0) * wide))
        lines.append("█" * wide_filled + "░" * (wide - wide_filled))

        if self.enabled:
            if self._rendered:
                self.stream.write("\x1b[12A")
            self.stream.write("\x1b[2K" + header + "\n")
            for line in lines:
                self.stream.write("\x1b[2K" + line + "\n")
            self.stream.flush()
            self._rendered = True
        else:
            bucket = int(percent // 5) * 5
            if bucket <= self._last_plain_bucket and percent < 100:
                return
            self._last_plain_bucket = bucket
            self.stream.write(header + "\n")
            self.stream.flush()

    def update(
        self,
        indexed: int,
        *,
        reused: int = 0,
        embedded: int = 0,
        phase: str = "indexing",
    ) -> None:
        now = time.monotonic()
        if phase != self._last_phase:
            self._last_phase = phase
            self._last_plain_bucket = -1
        if self.enabled and now - self._last_render_at < self.min_interval_seconds:
            return
        self._last_render_at = now
        self._render(
            self._header(
                indexed=indexed,
                reused=reused,
                embedded=embedded,
                phase=phase,
            ),
            self._percent(indexed),
        )

    def copy_update(self, copied: int, total: int) -> None:
        now = time.monotonic()
        if self.enabled and now - self._copy_last_at < self.min_interval_seconds:
            return
        self._copy_last_at = now
        elapsed = max(0.001, now - self._copy_started_at)
        rate = int(copied) / elapsed if elapsed else 0.0
        remaining = max(0, int(total) - int(copied))
        eta = remaining / rate if rate > 0 else None
        percent = 100.0 * int(copied) / max(1, int(total))
        parts = [
            f"{self._prefix()}複製舊 collection {percent:5.1f}%",
            f"{int(copied):,} / {int(total):,}",
        ]
        if rate > 0:
            parts.append(f"{rate:,.1f} points/秒")
            if eta is not None:
                parts.append(f"ETA {_duration(eta)}")
        self._render(" · ".join(parts), 0.0)

    def finish(self, indexed: Optional[int] = None) -> None:
        self._last_render_at = 0.0
        self.update(
            self.total if indexed is None else indexed,
            phase="done",
        )
        if self.enabled and self._rendered:
            self.stream.write("\n")
            self.stream.flush()
