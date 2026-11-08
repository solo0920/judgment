from __future__ import annotations

import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from judgment.judgment_duckdb import candidate_count, iter_candidate_batches
from judgment.judgment_raw_parquet import RAW_JUDGMENT_SCHEMA


def _row(jid: str, citation_count: int, full_text: str) -> dict:
    return {
        "source_archive": "202601--test.rar",
        "entry_index": 1 if jid == "A" else 2,
        "jid": jid,
        "jyear": "115",
        "jcase": "金訴",
        "jno": "1",
        "jdate": "20260101",
        "court": "臺灣臺北地方法院民事",
        "court_normalized": "臺灣臺北地方法院",
        "title": "返還借款",
        "pdf_url": "https://example.test/a.pdf",
        "content_hash": "a" * 64,
        "full_text_length": len(full_text),
        "matched_laws": ["民法"] if citation_count else [],
        "matched_laws_text": "\n民法\n" if citation_count else "\n\n",
        "citations": json.dumps(
            [{"law_name": "民法", "article_no": "第1條", "text": "民法第1條"}]
            if citation_count
            else [],
            ensure_ascii=False,
        ),
        "citation_count": citation_count,
        "raw_json": json.dumps({"JID": jid, "JFULL": full_text}, ensure_ascii=False),
    }


def test_duckdb_candidate_filter_and_full_text(tmp_path: Path) -> None:
    path = tmp_path / "raw.parquet"
    rows = [
        _row("A", 1, "臺灣臺北地方法院民事判決\n依民法第1條規定。"),
        _row("B", 0, "臺灣臺北地方法院刑事判決\n被告涉犯刑法第1條。"),
    ]
    pq.write_table(pa.Table.from_pylist(rows, schema=RAW_JUDGMENT_SCHEMA), path)

    assert candidate_count(path) == 1
    batches = list(iter_candidate_batches(path, batch_size=1))
    assert len(batches) == 1
    result = batches[0][0]
    assert result["jid"] == "A"
    assert result["citation_count"] == 1
    assert "民法第1條" in result["full_text"]
