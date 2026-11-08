from __future__ import annotations

import logging
from pathlib import Path
from typing import Any, Dict, Iterator, List

import duckdb

logger = logging.getLogger(__name__)

CANDIDATE_COLUMNS = [
    "jid",
    "jyear",
    "jcase",
    "jno",
    "jdate",
    "court",
    "court_normalized",
    "title",
    "pdf_url",
    "source_archive",
    "content_hash",
    "full_text_length",
    "matched_laws",
    "matched_laws_text",
    "citations",
    "citation_count",
    "json_extract_string(raw_json, '$.JFULL') AS full_text",
]


def _path_literal(path: Path) -> str:
    return str(Path(path).as_posix()).replace("'", "''")


def _connect() -> duckdb.DuckDBPyConnection:
    connection = duckdb.connect()
    # Keep the scan deterministic and avoid unbounded memory for a single
    # archive. DuckDB streams results in batches from the caller.
    connection.execute("PRAGMA preserve_insertion_order=false")
    return connection


def candidate_count(path: Path) -> int:
    """Return the number of financially relevant candidates in one raw file."""

    connection = _connect()
    try:
        row = connection.execute(
            f"""
            SELECT count(*)
            FROM read_parquet('{_path_literal(path)}')
            WHERE citation_count > 0 AND jid <> ''
            """
        ).fetchone()
        return int(row[0] if row else 0)
    finally:
        connection.close()


def iter_candidate_batches(
    path: Path,
    *,
    batch_size: int = 5000,
) -> Iterator[List[Dict[str, Any]]]:
    """Yield PostgreSQL-ready candidate rows from a raw judgment Parquet file.

    The expensive financial-law regex was already evaluated when the raw
    Parquet was created. DuckDB performs the large-scale Parquet scan and
    candidate selection; Python only receives matched candidates.
    """

    size = max(1, int(batch_size))
    connection = _connect()
    try:
        cursor = connection.execute(
            f"""
            SELECT {", ".join(CANDIDATE_COLUMNS)}
            FROM read_parquet('{_path_literal(path)}')
            WHERE citation_count > 0 AND jid <> ''
            ORDER BY entry_index
            """
        )
        while True:
            rows = cursor.fetchmany(size)
            if not rows:
                break
            names = [description[0] for description in cursor.description]
            yield [dict(zip(names, row)) for row in rows]
    finally:
        connection.close()


__all__ = [
    "CANDIDATE_COLUMNS",
    "candidate_count",
    "iter_candidate_batches",
]
