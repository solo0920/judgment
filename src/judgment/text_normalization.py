from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import List, Optional, Tuple

# Bump this whenever the normalization rule changes.  It is stored in the
# sampling manifest and in every annotation that uses offsets.
NORMALIZATION_VERSION = "remove-unicode-space-v2"

_IGNORABLE = {
    "\u200b",  # zero width space
    "\u200c",  # zero width non-joiner
    "\u200d",  # zero width joiner
    "\ufeff",  # byte order mark
    "\u2502",  # box drawing vertical bar, common in judgment tables
    "\uff5c",  # full-width vertical bar
    "|",       # ASCII table separator
}

# SQL equivalent used by PostgreSQL-side samplers/audits.  Keep this in sync
# with normalize_for_match; tests cover the Python side and the constant is
# recorded in the manifest for reproducibility.
SQL_NORMALIZE_EXPR = (
    "regexp_replace(full_text, '[[:space:]\u200b\u200c\u200d\ufeff\u2502\uff5c|]+', '', 'g')"
)


def _should_remove(character: str) -> bool:
    return character.isspace() or character in _IGNORABLE


def normalize_for_match(text: str) -> str:
    """Remove whitespace and invisible separators for matching only.

    This is intentionally not a display normalization.  It makes
    ``詐\r\n欺`` and ``詐 欺`` comparable while leaving the original text
    untouched for evidence display and citation.
    """

    return "".join(
        character for character in str(text or "") if not _should_remove(character)
    )


@dataclass(frozen=True)
class NormalizedText:
    raw: str
    text: str
    offsets: Tuple[int, ...]
    version: str = NORMALIZATION_VERSION

    def raw_span(self, start: int, end: int) -> Tuple[int, int]:
        """Map a [start, end) span in normalized text to raw offsets."""

        if start < 0 or end < start or end > len(self.text):
            raise ValueError("normalized offset is outside the text")
        if start == end:
            raw_start = self.offsets[start]
            return raw_start, raw_start
        return self.offsets[start], self.offsets[end - 1] + 1

    def normalized_span(self, raw_start: int, raw_end: int) -> Tuple[int, int]:
        """Map a raw span to the shortest normalized span covering it."""

        if raw_start < 0 or raw_end < raw_start or raw_end > len(self.raw):
            raise ValueError("raw offset is outside the text")
        start = None
        end = None
        for index, raw_index in enumerate(self.offsets[:-1]):
            if raw_start <= raw_index < raw_end:
                start = index if start is None else start
                end = index + 1
        if start is None or end is None:
            raise ValueError("raw span contains no matchable characters")
        return start, end

    def sha256(self) -> str:
        return hashlib.sha256(self.raw.encode("utf-8")).hexdigest()

    def metadata(self) -> dict:
        return {
            "normalization_version": self.version,
            "full_text_sha256": self.sha256(),
            "raw_length": len(self.raw),
            "normalized_length": len(self.text),
        }


def normalize_with_offsets(text: str) -> NormalizedText:
    raw = str(text or "")
    normalized: List[str] = []
    offsets: List[int] = []
    for index, character in enumerate(raw):
        if _should_remove(character):
            continue
        normalized.append(character)
        offsets.append(index)
    offsets.append(len(raw))
    return NormalizedText(
        raw=raw,
        text="".join(normalized),
        offsets=tuple(offsets),
    )


@dataclass(frozen=True)
class EvidenceSpan:
    raw_start: int
    raw_end: int
    raw_quote: str
    normalized_start: int
    normalized_end: int
    normalized_quote: str
    normalization_version: str = NORMALIZATION_VERSION


def resolve_evidence_span(
    raw_text: str,
    quote: str,
    *,
    normalized_start: Optional[int] = None,
    raw_start: Optional[int] = None,
) -> EvidenceSpan:
    """Resolve a quote to raw offsets using the shared normalization.

    A quote may be copied from a normalized display.  If it occurs more than
    once, the caller must pass either ``normalized_start`` or ``raw_start``.
    The first occurrence is never selected silently.
    """

    normalized_quote = normalize_for_match(quote)
    if not normalized_quote:
        raise ValueError("evidence quote is empty after normalization")
    normalized = normalize_with_offsets(raw_text)
    positions: List[int] = []
    cursor = 0
    while True:
        index = normalized.text.find(normalized_quote, cursor)
        if index < 0:
            break
        positions.append(index)
        cursor = index + 1
    if not positions:
        raise ValueError("evidence quote was not found after normalization")

    chosen = None
    if normalized_start is not None:
        if normalized_start not in positions:
            raise ValueError(
                "selected normalized occurrence does not match evidence quote"
            )
        chosen = int(normalized_start)
    elif raw_start is not None:
        for position in positions:
            candidate_start, _ = normalized.raw_span(
                position, position + len(normalized_quote)
            )
            if candidate_start == int(raw_start):
                chosen = position
                break
        if chosen is None:
            raise ValueError(
                "selected raw occurrence does not match evidence quote"
            )
    elif len(positions) == 1:
        chosen = positions[0]
    else:
        raise ValueError(
            "evidence quote occurs more than once; manual occurrence "
            "selection is required"
        )

    raw_span_start, raw_span_end = normalized.raw_span(
        chosen, chosen + len(normalized_quote)
    )
    raw_quote = raw_text[raw_span_start:raw_span_end]
    if normalize_for_match(raw_quote) != normalized_quote:
        raise ValueError(
            "raw evidence slice does not match the normalized quote"
        )
    return EvidenceSpan(
        raw_start=raw_span_start,
        raw_end=raw_span_end,
        raw_quote=raw_quote,
        normalized_start=chosen,
        normalized_end=chosen + len(normalized_quote),
        normalized_quote=normalized_quote,
    )
