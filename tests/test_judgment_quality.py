from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

import pyarrow as pa
import pyarrow.parquet as pq

from judgment.config import Settings
from judgment.judgment_quality import compute_raw_quality
from judgment.judgment_raw_parquet import RAW_JUDGMENT_SCHEMA
from judgment.web.quality import build_quality_snapshot


def _row(
    *,
    jid: str,
    archive: str,
    text_length: int,
    court: str = "臺灣臺北地方法院民事",
    normalized: str = "臺灣臺北地方法院",
    jdate: str = "20260101",
    title: str = "返還借款",
    pdf_url: str = "https://example.test/j.pdf",
    content_hash: str = "a" * 64,
    matched_laws: List[str] | None = None,
    citations: List[Dict[str, str]] | None = None,
    citation_count: int = 0,
) -> Dict[str, Any]:
    matched = matched_laws or []
    citation_rows = citations or []
    return {
        "source_archive": archive,
        "entry_index": 1,
        "jid": jid,
        "jyear": "115",
        "jcase": "訴",
        "jno": "1",
        "jdate": jdate,
        "court": court,
        "court_normalized": normalized,
        "title": title,
        "pdf_url": pdf_url,
        "content_hash": content_hash,
        "full_text_length": text_length,
        "matched_laws": matched,
        "matched_laws_text": "\n" + "\n".join(matched) + "\n",
        "citations": json.dumps(citation_rows, ensure_ascii=False),
        "citation_count": citation_count,
        "raw_json": json.dumps({"JID": jid, "JFULL": "判決" * max(1, text_length // 2)}),
    }


def _write_archive(
    root: Path,
    name: str,
    rows: List[Dict[str, Any]],
    *,
    candidate_count: int | None,
) -> Dict[str, Any]:
    directory = root / "parquet" / "raw_judgments" / name / "20261108" / "120000-demo"
    directory.mkdir(parents=True)
    path = directory / "raw.parquet"
    pq.write_table(pa.Table.from_pylist(rows, schema=RAW_JUDGMENT_SCHEMA), path)
    manifest = {
        "version": 3,
        "archive_name": f"{name}.rar",
        "archive_path": f"/tmp/{name}.rar",
        "archive_size_bytes": 1,
        "archive_mtime_ns": 1,
        "row_count": len(rows),
        "candidate_count": candidate_count,
        "compressed_bytes": path.stat().st_size,
        "raw_path": str(path),
        "created_at": "2026-11-08T12:00:00+00:00",
    }
    if candidate_count is None:
        manifest.pop("candidate_count")
    (directory / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False),
        encoding="utf-8",
    )
    return {"path": path, "manifest": manifest}


def test_compute_raw_quality_reports_checks_and_distributions(
    tmp_path: Path,
) -> None:
    archive_a = _write_archive(
        tmp_path,
        "202601",
        [
            _row(
                jid="A1",
                archive="202601.rar",
                text_length=500,
                content_hash="h" * 64,
                matched_laws=["民法"],
                citations=[
                    {
                        "law_name": "民法",
                        "article_no": "第184條",
                        "text": "民法第184條",
                    }
                ],
                citation_count=1,
            ),
            _row(
                jid="A2",
                archive="202601.rar",
                text_length=100,
                court="",
                normalized="",
                jdate="",
                title="",
                pdf_url="",
                content_hash="b" * 64,
            ),
        ],
        candidate_count=2,
    )
    archive_b = _write_archive(
        tmp_path,
        "202602",
        [
            _row(
                jid="A1",
                archive="202602.rar",
                text_length=500,
                court="臺灣臺中地方法院民事",
                normalized="臺灣臺中地方法院",
                jdate="20260201",
                title="清償借款",
                content_hash="h" * 64,
                matched_laws=["保險法"],
                citations=[
                    {
                        "law_name": "保險法",
                        "article_no": "第2條",
                        "text": "保險法第2條",
                    }
                ],
                citation_count=1,
            ),
            _row(
                jid="B2",
                archive="202602.rar",
                text_length=600,
                content_hash="c" * 64,
                citations=[
                    {
                        "law_name": "民法",
                        "article_no": "第1條",
                        "text": "民法第1條",
                    }
                ],
                citation_count=0,
            ),
            _row(
                jid="B3",
                archive="202602.rar",
                text_length=700,
                content_hash="d" * 64,
                citation_count=1,
            ),
            _row(
                jid="",
                archive="202602.rar",
                text_length=0,
                court="",
                normalized="",
                jdate="2026-02-01",
                title="",
                pdf_url="",
                content_hash="",
            ),
        ],
        candidate_count=None,
    )

    result = compute_raw_quality([archive_a, archive_b])
    totals = result["totals"]

    assert totals["rows"] == 6
    assert totals["unique_jids"] == 4
    assert totals["duplicate_jid_groups"] == 1
    assert totals["duplicate_jid_rows"] == 1
    assert totals["missing_jid_rows"] == 1
    assert totals["empty_text_rows"] == 1
    assert totals["short_text_rows"] == 1
    assert totals["missing_court_rows"] == 2
    assert totals["missing_normalized_rows"] == 2
    assert totals["missing_date_rows"] == 1
    assert totals["invalid_date_rows"] == 1
    assert totals["missing_title_rows"] == 2
    assert totals["missing_pdf_rows"] == 2
    assert totals["matched_rows"] == 3
    assert totals["citation_total"] == 3
    assert totals["inconsistent_law_rows"] == 1
    assert totals["inconsistent_citation_rows"] == 1
    assert totals["missing_hash_rows"] == 1
    assert totals["duplicate_content_groups"] == 1
    assert totals["duplicate_content_rows"] == 1
    assert totals["date_min"] == "20260101"
    assert totals["date_max"] == "20260201"
    assert result["candidate_total"] == 2
    assert result["candidate_archive_count"] == 1
    assert result["schema_versions"] == [3]

    checks = {item["key"]: item for item in result["checks"]}
    assert checks["missing_jid"]["count"] == 1
    assert checks["missing_jid"]["severity"] == "danger"
    assert checks["empty_text"]["count"] == 1
    assert checks["duplicate_jid"]["count"] == 1
    assert checks["duplicate_jid"]["severity"] == "warn"
    assert checks["missing_court"]["count"] == 2
    assert checks["duplicate_content"]["count"] == 1

    laws = {item["label"]: item["value"] for item in result["distributions"]["laws"]}
    assert laws == {"保險法": 1, "民法": 1}
    years = {
        item["label"]: item["value"] for item in result["distributions"]["years"]
    }
    assert years == {"2026": 4}
    archives = {item["archive"]: item for item in result["archives"]}
    assert archives["202601.rar"]["candidate_count"] == 2
    assert archives["202601.rar"]["match_rate"] == 50.0
    assert archives["202602.rar"]["candidate_count"] is None
    assert archives["202602.rar"]["duplicate_jid_rows"] == 0


def test_compute_raw_quality_empty_manifests() -> None:
    result = compute_raw_quality([])

    assert result["totals"] == {}
    assert result["archives"] == []
    assert result["checks"] == []
    assert result["candidate_total"] is None
    assert result["distributions"]["laws"] == []


def test_build_quality_snapshot_without_raw_parquet(tmp_path: Path) -> None:
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path / "laws",
        judgment_data_dir=tmp_path / "judgments",
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        auto_create_schema=False,
    )

    result = build_quality_snapshot(settings=settings)

    assert result["status"] == "empty"
    assert result["available"] is False
    assert result["source"]["engine"] == "duckdb"
    assert result["source"]["raw_files"] == 0
    assert result["totals"]["rows"] == 0
    assert result["coverage"]["status"] == "unavailable"
    assert result["warnings"]
