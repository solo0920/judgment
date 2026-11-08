from __future__ import annotations

import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

import duckdb

SHORT_TEXT_THRESHOLD = 200

CORE_SQL = f"""
SELECT
    source_archive,
    count(*) AS rows,
    count(DISTINCT jid) FILTER (WHERE jid IS NOT NULL AND jid <> '') AS unique_jids,
    count(*) FILTER (WHERE jid IS NULL OR jid = '') AS missing_jid_rows,
    count(*) FILTER (
        WHERE full_text_length IS NULL OR full_text_length <= 0
    ) AS empty_text_rows,
    count(*) FILTER (
        WHERE full_text_length > 0 AND full_text_length < {SHORT_TEXT_THRESHOLD}
    ) AS short_text_rows,
    count(*) FILTER (WHERE court IS NULL OR court = '') AS missing_court_rows,
    count(*) FILTER (
        WHERE court_normalized IS NULL OR court_normalized = ''
    ) AS missing_normalized_rows,
    count(*) FILTER (WHERE jdate IS NULL OR jdate = '') AS missing_date_rows,
    count(*) FILTER (
        WHERE jdate IS NOT NULL
          AND jdate <> ''
          AND NOT regexp_matches(jdate, '^[0-9]{{8}}$')
    ) AS invalid_date_rows,
    count(*) FILTER (WHERE title IS NULL OR title = '') AS missing_title_rows,
    count(*) FILTER (WHERE pdf_url IS NULL OR pdf_url = '') AS missing_pdf_rows,
    count(*) FILTER (WHERE citation_count > 0) AS matched_rows,
    coalesce(sum(CASE WHEN citation_count > 0 THEN citation_count ELSE 0 END), 0)
        AS citation_total,
    count(*) FILTER (
        WHERE citation_count > 0
          AND (matched_laws IS NULL OR len(matched_laws) = 0)
    ) AS inconsistent_law_rows,
    count(*) FILTER (
        WHERE citation_count = 0
          AND citations IS NOT NULL
          AND citations <> '[]'
    ) AS inconsistent_citation_rows,
    count(*) FILTER (
        WHERE content_hash IS NULL OR content_hash = ''
    ) AS missing_hash_rows,
    count(*) FILTER (
        WHERE content_hash IS NOT NULL AND content_hash <> ''
    ) AS hash_rows,
    count(DISTINCT content_hash) FILTER (
        WHERE content_hash IS NOT NULL AND content_hash <> ''
    ) AS unique_hash_rows,
    min(jdate) FILTER (
        WHERE jdate IS NOT NULL AND regexp_matches(jdate, '^[0-9]{{8}}$')
    ) AS date_min,
    max(jdate) FILTER (
        WHERE jdate IS NOT NULL AND regexp_matches(jdate, '^[0-9]{{8}}$')
    ) AS date_max
FROM read_parquet(?)
GROUP BY source_archive
ORDER BY source_archive
"""

CORE_COLUMNS = [
    "source_archive",
    "rows",
    "unique_jids",
    "missing_jid_rows",
    "empty_text_rows",
    "short_text_rows",
    "missing_court_rows",
    "missing_normalized_rows",
    "missing_date_rows",
    "invalid_date_rows",
    "missing_title_rows",
    "missing_pdf_rows",
    "matched_rows",
    "citation_total",
    "inconsistent_law_rows",
    "inconsistent_citation_rows",
    "missing_hash_rows",
    "hash_rows",
    "unique_hash_rows",
    "date_min",
    "date_max",
]

GLOBAL_SQL = """
SELECT
    count(*) AS rows,
    count(DISTINCT jid) FILTER (WHERE jid IS NOT NULL AND jid <> '') AS unique_jids
FROM read_parquet(?)
"""

DUPLICATE_JID_SQL = """
SELECT
    count(*) AS duplicate_groups,
    coalesce(sum(row_count - 1), 0) AS duplicate_rows
FROM (
    SELECT count(*) AS row_count
    FROM read_parquet(?)
    WHERE jid IS NOT NULL AND jid <> ''
    GROUP BY jid
    HAVING count(*) > 1
) duplicates
"""

DUPLICATE_CONTENT_SQL = """
SELECT
    count(*) AS duplicate_groups,
    coalesce(sum(row_count - 1), 0) AS duplicate_rows
FROM (
    SELECT count(*) AS row_count
    FROM read_parquet(?)
    WHERE content_hash IS NOT NULL AND content_hash <> ''
    GROUP BY content_hash
    HAVING count(*) > 1
) duplicates
"""

COURT_SQL = """
SELECT
    coalesce(nullif(court_normalized, ''), nullif(court, ''), '（未標示）') AS label,
    count(*) AS value
FROM read_parquet(?)
GROUP BY 1
ORDER BY value DESC, label
LIMIT 12
"""

YEAR_SQL = """
SELECT substr(jdate, 1, 4) AS label, count(*) AS value
FROM read_parquet(?)
WHERE jdate IS NOT NULL
  AND regexp_matches(jdate, '^[0-9]{8}$')
GROUP BY 1
ORDER BY 1
"""

LAW_SQL = """
SELECT law AS label, count(*) AS value
FROM (
    SELECT unnest(matched_laws) AS law
    FROM read_parquet(?)
    WHERE citation_count > 0
) laws
WHERE law IS NOT NULL AND law <> ''
GROUP BY 1
ORDER BY value DESC, label
LIMIT 20
"""

TITLE_SQL = """
SELECT coalesce(nullif(title, ''), '（未標示）') AS label, count(*) AS value
FROM read_parquet(?)
GROUP BY 1
ORDER BY value DESC, label
LIMIT 12
"""


def _connect() -> duckdb.DuckDBPyConnection:
    connection = duckdb.connect()
    connection.execute("PRAGMA preserve_insertion_order=false")
    return connection


def _int(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def _ratio(count: int, total: int) -> Optional[float]:
    if total <= 0:
        return None
    return round(count / total * 100, 2)


def _check(
    key: str,
    label: str,
    severity: str,
    count: int,
    total: int,
    description: str,
) -> Dict[str, Any]:
    return {
        "key": key,
        "label": label,
        "severity": severity,
        "count": int(count),
        "percent": _ratio(int(count), int(total)),
        "description": description,
    }


def _distribution(
    connection: duckdb.DuckDBPyConnection,
    sql: str,
    paths: Sequence[str],
) -> List[Dict[str, Any]]:
    return [
        {"label": str(label), "value": _int(value)}
        for label, value in connection.execute(sql, [list(paths)]).fetchall()
    ]


def compute_raw_quality(manifests: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute data-quality metrics from the latest raw judgment Parquet files."""

    started = time.perf_counter()
    if not manifests:
        return {
            "totals": {},
            "archives": [],
            "distributions": {"courts": [], "years": [], "laws": [], "titles": []},
            "checks": [],
            "summary": {
                "danger_count": 0,
                "warning_count": 0,
                "info_count": 0,
                "ok_count": 0,
            },
            "schema_versions": [],
            "candidate_total": None,
            "candidate_archive_count": 0,
            "compressed_bytes": 0,
            "scan_ms": int((time.perf_counter() - started) * 1000),
        }

    paths = [str(Path(item["path"])) for item in manifests]
    manifest_by_archive: Dict[str, Dict[str, Any]] = {}
    schema_versions = set()
    candidate_values: List[int] = []
    compressed_bytes = 0
    for item in manifests:
        payload = item.get("manifest") or {}
        archive_name = str(payload.get("archive_name") or "")
        if archive_name:
            manifest_by_archive[archive_name] = payload
        version = _int(payload.get("version"))
        if version:
            schema_versions.add(version)
        compressed_bytes += _int(payload.get("compressed_bytes"))
        if payload.get("candidate_count") is not None:
            candidate_values.append(_int(payload.get("candidate_count")))

    connection = _connect()
    try:
        archive_rows = [
            dict(zip(CORE_COLUMNS, row))
            for row in connection.execute(CORE_SQL, [paths]).fetchall()
        ]
        global_row = connection.execute(GLOBAL_SQL, [paths]).fetchone() or (0, 0)
        duplicate_jid = connection.execute(
            DUPLICATE_JID_SQL, [paths]
        ).fetchone() or (0, 0)
        duplicate_content = connection.execute(
            DUPLICATE_CONTENT_SQL, [paths]
        ).fetchone() or (0, 0)
        distributions = {
            "courts": _distribution(connection, COURT_SQL, paths),
            "years": _distribution(connection, YEAR_SQL, paths),
            "laws": _distribution(connection, LAW_SQL, paths),
            "titles": _distribution(connection, TITLE_SQL, paths),
        }
    finally:
        connection.close()

    archives: List[Dict[str, Any]] = []
    for row in archive_rows:
        source_archive = str(row.get("source_archive") or "")
        payload = manifest_by_archive.get(source_archive) or {}
        rows = _int(row.get("rows"))
        unique_jids = _int(row.get("unique_jids"))
        missing_jid_rows = _int(row.get("missing_jid_rows"))
        hash_rows = _int(row.get("hash_rows"))
        unique_hash_rows = _int(row.get("unique_hash_rows"))
        candidate_count = (
            _int(payload.get("candidate_count"))
            if payload.get("candidate_count") is not None
            else None
        )
        archives.append(
            {
                "archive": source_archive,
                "version": _int(payload.get("version")) or None,
                "rows": rows,
                "unique_jids": unique_jids,
                "missing_jid_rows": missing_jid_rows,
                "duplicate_jid_rows": max(
                    0, rows - unique_jids - missing_jid_rows
                ),
                "empty_text_rows": _int(row.get("empty_text_rows")),
                "short_text_rows": _int(row.get("short_text_rows")),
                "missing_court_rows": _int(row.get("missing_court_rows")),
                "missing_normalized_rows": _int(row.get("missing_normalized_rows")),
                "missing_date_rows": _int(row.get("missing_date_rows")),
                "invalid_date_rows": _int(row.get("invalid_date_rows")),
                "missing_title_rows": _int(row.get("missing_title_rows")),
                "missing_pdf_rows": _int(row.get("missing_pdf_rows")),
                "matched_rows": _int(row.get("matched_rows")),
                "citation_total": _int(row.get("citation_total")),
                "inconsistent_law_rows": _int(row.get("inconsistent_law_rows")),
                "inconsistent_citation_rows": _int(
                    row.get("inconsistent_citation_rows")
                ),
                "missing_hash_rows": _int(row.get("missing_hash_rows")),
                "duplicate_content_rows": max(0, hash_rows - unique_hash_rows),
                "date_min": row.get("date_min"),
                "date_max": row.get("date_max"),
                "candidate_count": candidate_count,
                "match_rate": _ratio(_int(row.get("matched_rows")), rows),
                "candidate_rate": _ratio(candidate_count or 0, rows)
                if candidate_count is not None
                else None,
                "compressed_bytes": _int(payload.get("compressed_bytes")),
            }
        )

    total_rows = _int(global_row[0])
    unique_jids = _int(global_row[1])
    duplicate_jid_groups = _int(duplicate_jid[0])
    duplicate_jid_rows = _int(duplicate_jid[1])
    duplicate_content_groups = _int(duplicate_content[0])
    duplicate_content_rows = _int(duplicate_content[1])
    matched_rows = sum(item["matched_rows"] for item in archives)
    citation_total = sum(item["citation_total"] for item in archives)
    missing_jid_rows = sum(item["missing_jid_rows"] for item in archives)
    empty_text_rows = sum(item["empty_text_rows"] for item in archives)
    short_text_rows = sum(item["short_text_rows"] for item in archives)
    missing_court_rows = sum(item["missing_court_rows"] for item in archives)
    missing_normalized_rows = sum(
        item["missing_normalized_rows"] for item in archives
    )
    missing_date_rows = sum(item["missing_date_rows"] for item in archives)
    invalid_date_rows = sum(item["invalid_date_rows"] for item in archives)
    missing_title_rows = sum(item["missing_title_rows"] for item in archives)
    missing_pdf_rows = sum(item["missing_pdf_rows"] for item in archives)
    inconsistent_law_rows = sum(
        item["inconsistent_law_rows"] for item in archives
    )
    inconsistent_citation_rows = sum(
        item["inconsistent_citation_rows"] for item in archives
    )
    missing_hash_rows = sum(item["missing_hash_rows"] for item in archives)
    dates = [
        value
        for item in archives
        for value in (item.get("date_min"), item.get("date_max"))
        if value
    ]

    totals = {
        "rows": total_rows,
        "unique_jids": unique_jids,
        "duplicate_jid_groups": duplicate_jid_groups,
        "duplicate_jid_rows": duplicate_jid_rows,
        "missing_jid_rows": missing_jid_rows,
        "empty_text_rows": empty_text_rows,
        "short_text_rows": short_text_rows,
        "missing_court_rows": missing_court_rows,
        "missing_normalized_rows": missing_normalized_rows,
        "missing_date_rows": missing_date_rows,
        "invalid_date_rows": invalid_date_rows,
        "missing_title_rows": missing_title_rows,
        "missing_pdf_rows": missing_pdf_rows,
        "matched_rows": matched_rows,
        "citation_total": citation_total,
        "inconsistent_law_rows": inconsistent_law_rows,
        "inconsistent_citation_rows": inconsistent_citation_rows,
        "missing_hash_rows": missing_hash_rows,
        "duplicate_content_groups": duplicate_content_groups,
        "duplicate_content_rows": duplicate_content_rows,
        "match_rate": _ratio(matched_rows, total_rows),
        "date_min": min(dates) if dates else None,
        "date_max": max(dates) if dates else None,
    }

    checks = [
        _check(
            "missing_jid",
            "缺少案號",
            "danger",
            missing_jid_rows,
            total_rows,
            "JID 為 PostgreSQL 唯一鍵；缺少案號的判決無法匯入。",
        ),
        _check(
            "empty_text",
            "全文為空",
            "danger",
            empty_text_rows,
            total_rows,
            "全文長度為 0，無法作為原文或 RAG 來源。",
        ),
        _check(
            "missing_hash",
            "缺少內容雜湊",
            "danger",
            missing_hash_rows,
            total_rows,
            "content_hash 為空，無法判斷 Qdrant 索引是否需要更新。",
        ),
        _check(
            "inconsistent_laws",
            "命中法規與引用數不一致",
            "danger",
            inconsistent_law_rows,
            total_rows,
            "citation_count > 0，但 matched_laws 為空。",
        ),
        _check(
            "inconsistent_citations",
            "引用欄位與引用數不一致",
            "danger",
            inconsistent_citation_rows,
            total_rows,
            "citation_count = 0，但 citations 不是空陣列。",
        ),
        _check(
            "duplicate_jid",
            "重複案號",
            "warn",
            duplicate_jid_rows,
            total_rows,
            f"同一 JID 出現 {duplicate_jid_groups:,} 組；PostgreSQL 只保留一筆。",
        ),
        _check(
            "missing_court",
            "缺少法院",
            "warn",
            missing_court_rows,
            total_rows,
            "court 為空，查詢與顯示會缺少法院資訊。",
        ),
        _check(
            "missing_normalized_court",
            "法院未正規化",
            "warn",
            missing_normalized_rows,
            total_rows,
            "court_normalized 為空，法院篩選可能不完整。",
        ),
        _check(
            "missing_date",
            "缺少裁判日期",
            "warn",
            missing_date_rows,
            total_rows,
            "jdate 為空，日期區間查詢與年份統計會漏掉此列。",
        ),
        _check(
            "invalid_date",
            "裁判日期格式異常",
            "warn",
            invalid_date_rows,
            total_rows,
            "jdate 不是 8 碼西元日期（YYYYMMDD）。",
        ),
        _check(
            "short_text",
            "全文過短",
            "info",
            short_text_rows,
            total_rows,
            f"全文長度小於 {SHORT_TEXT_THRESHOLD} 字；可能影響語意檢索。",
        ),
        _check(
            "missing_title",
            "缺少案由",
            "info",
            missing_title_rows,
            total_rows,
            "title 為空，列表與搜尋結果較難辨識。",
        ),
        _check(
            "missing_pdf",
            "缺少 PDF 連結",
            "info",
            missing_pdf_rows,
            total_rows,
            "pdf_url 為空；原始 JSON 仍保留在 raw_json。",
        ),
        _check(
            "duplicate_content",
            "重複內容",
            "info",
            duplicate_content_rows,
            total_rows,
            f"相同 content_hash 出現 {duplicate_content_groups:,} 組；可能是重複匯入或相同判決。",
        ),
    ]
    summary = {
        "danger_count": sum(
            1 for item in checks if item["severity"] == "danger" and item["count"] > 0
        ),
        "warning_count": sum(
            1 for item in checks if item["severity"] == "warn" and item["count"] > 0
        ),
        "info_count": sum(
            1 for item in checks if item["severity"] == "info" and item["count"] > 0
        ),
        "ok_count": sum(1 for item in checks if item["count"] == 0),
    }

    return {
        "totals": totals,
        "archives": archives,
        "distributions": distributions,
        "checks": checks,
        "summary": summary,
        "schema_versions": sorted(schema_versions),
        "candidate_total": sum(candidate_values) if candidate_values else None,
        "candidate_archive_count": len(candidate_values),
        "compressed_bytes": compressed_bytes,
        "scan_ms": int((time.perf_counter() - started) * 1000),
    }
