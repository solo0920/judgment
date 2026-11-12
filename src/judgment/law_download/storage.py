from __future__ import annotations

import hashlib
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import pyarrow as pa
import pyarrow.parquet as pq

from .parser import parse_dataset
from .types import FetchedArchive, LawRecord, ParsedDataset

PARQUET_SCHEMA = pa.schema(
    [
        ("source_type", pa.string()),
        ("source_url", pa.string()),
        ("source_update_date", pa.string()),
        ("zip_sha256", pa.string()),
        ("raw_json_sha256", pa.string()),
        ("semantic_sha256", pa.string()),
        ("fetched_at", pa.timestamp("us", tz="UTC")),
        ("law_key", pa.string()),
        ("law_name", pa.string()),
        ("law_level", pa.string()),
        ("law_category", pa.string()),
        ("law_url", pa.string()),
        ("law_modified_date", pa.string()),
        ("law_effective_date", pa.string()),
        ("law_effective_note", pa.string()),
        ("law_abandon_note", pa.string()),
        ("law_has_eng_version", pa.bool_()),
        ("eng_law_name", pa.string()),
        ("law_attachments_json", pa.string()),
        ("law_histories", pa.string()),
        ("law_foreword", pa.string()),
        ("article_count", pa.int32()),
        ("content_hash", pa.string()),
        ("raw_json", pa.string()),
        (
            "law_articles",
            pa.list_(
                pa.struct(
                    [
                        ("article_type", pa.string()),
                        ("article_no", pa.string()),
                        ("article_content", pa.string()),
                    ]
                )
            ),
        ),
    ]
)

RAW_PARQUET_VERSION = 2

RAW_PARQUET_SCHEMA = pa.schema(
    [
        ("source_type", pa.string()),
        ("source_url", pa.string()),
        ("source_label", pa.string()),
        ("source_update_date", pa.string()),
        ("zip_sha256", pa.string()),
        ("raw_json_sha256", pa.string()),
        ("fetched_at", pa.timestamp("us", tz="UTC")),
        ("law_index", pa.int32()),
        ("law_key", pa.string()),
        ("law_name", pa.string()),
        ("law_level", pa.string()),
        ("law_category", pa.string()),
        ("law_url", pa.string()),
        ("law_modified_date", pa.string()),
        ("law_effective_date", pa.string()),
        ("law_effective_note", pa.string()),
        ("law_abandon_note", pa.string()),
        ("law_has_eng_version", pa.bool_()),
        ("eng_law_name", pa.string()),
        ("law_attachments_json", pa.string()),
        ("law_histories", pa.string()),
        ("law_foreword", pa.string()),
        ("article_count", pa.int32()),
        ("content_hash", pa.string()),
        (
            "law_articles",
            pa.list_(
                pa.struct(
                    [
                        ("article_type", pa.string()),
                        ("article_no", pa.string()),
                        ("article_content", pa.string()),
                    ]
                )
            ),
        ),
        ("raw_json", pa.string()),
    ]
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _partition(update_date: str) -> str:
    match = re.search(r"(\d{4})/(\d{1,2})/(\d{1,2})", update_date or "")
    if match:
        year, month, day = match.groups()
        return f"{year}{int(month):02d}{int(day):02d}"
    return "unknown"


class LawStorage:
    """Writes immutable raw ZIP, Parquet and manifest artifacts under a data root."""

    def __init__(self, data_dir: Path) -> None:
        self.data_dir = Path(data_dir).expanduser().resolve()

    def ensure_layout(self) -> None:
        for name in ("raw", "raw_parquet", "parquet", "manifests", "tmp"):
            (self.data_dir / name).mkdir(parents=True, exist_ok=True)

    def save_zip(self, fetched: FetchedArchive) -> Tuple[Path, bool]:
        download_date = datetime.now().astimezone().strftime("%Y%m%d")
        filename = Path(
            fetched.filename or f"{fetched.source.json_filename}.zip"
        ).name
        base_dir = (
            self.data_dir
            / "raw"
            / fetched.source.source_type.value
            / download_date
        )
        destination = base_dir / filename
        destination.parent.mkdir(parents=True, exist_ok=True)

        if destination.exists() and sha256_file(destination) == fetched.zip_sha256:
            return destination, False
        if destination.exists():
            stem = Path(filename).stem
            suffix = Path(filename).suffix or ".zip"
            destination = base_dir / f"{stem}.{fetched.zip_sha256[:8]}{suffix}"
            if destination.exists() and sha256_file(destination) == fetched.zip_sha256:
                return destination, False

        tmp_path = self._tmp_path("zip")
        try:
            os.replace(fetched.temp_zip_path, tmp_path)
            os.replace(tmp_path, destination)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return destination, True

    def write_raw_parquet(
        self,
        fetched: FetchedArchive,
    ) -> Tuple[Path, int, bool]:
        """Write an immutable raw copy of the API payload before parsing.

        The original ZIP is already retained under ``raw/``; this Parquet copy
        makes the pre-filter data directly queryable without touching the
        normalized ``parquet/`` dataset used by PostgreSQL.
        """

        partition = _partition(fetched.update_date)
        destination = (
            self.data_dir
            / "raw_parquet"
            / fetched.source.source_type.value
            / partition
            / fetched.raw_json_sha256[:16]
            / "laws.parquet"
        )
        if destination.exists() and destination.stat().st_size > 0:
            manifest_path = destination.parent / "manifest.json"
            try:
                manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                manifest = {}
            if int(manifest.get("version") or 0) >= RAW_PARQUET_VERSION:
                try:
                    row_count = int(pq.ParquetFile(destination).metadata.num_rows)
                except Exception:
                    row_count = 0
                return destination, row_count, False

        laws_payload = fetched.payload.get("Laws")
        if not isinstance(laws_payload, list):
            raise ValueError("下載內容沒有 Laws 陣列，無法建立原始 Parquet 備份")
        fetched_at = datetime.now(timezone.utc)
        parsed = parse_dataset(fetched.payload, fetched.source)
        rows: List[Dict[str, Any]] = []
        for index, record in enumerate(parsed.laws):
            row = self._row(parsed, fetched, record, fetched_at)
            row.update(
                {
                    "source_label": fetched.source.label,
                    "law_index": index,
                }
            )
            rows.append(row)
        table = pa.Table.from_pylist(rows, schema=RAW_PARQUET_SCHEMA)
        destination.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self._tmp_path("raw-parquet")
        try:
            pq.write_table(table, tmp_path, compression="snappy")
            os.replace(tmp_path, destination)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()

        manifest_path = destination.parent / "manifest.json"
        manifest = {
            "version": RAW_PARQUET_VERSION,
            "source_type": fetched.source.source_type.value,
            "source_url": fetched.source.url,
            "source_label": fetched.source.label,
            "update_date": fetched.update_date,
            "zip_sha256": fetched.zip_sha256,
            "raw_json_sha256": fetched.raw_json_sha256,
            "row_count": len(rows),
            "parquet_path": str(destination),
            "created_at": fetched_at.isoformat(),
        }
        tmp_manifest = self._tmp_path("raw-manifest")
        try:
            tmp_manifest.write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            os.replace(tmp_manifest, manifest_path)
        finally:
            if tmp_manifest.exists():
                tmp_manifest.unlink()
        return destination, len(rows), True

    def write_parquet(
        self,
        parsed: ParsedDataset,
        fetched: FetchedArchive,
        zip_path: Path,
    ) -> Tuple[Path, bool]:
        partition = _partition(parsed.update_date)
        destination = (
            self.data_dir
            / "parquet"
            / parsed.source.source_type.value
            / partition
            / parsed.semantic_sha256[:16]
            / "laws.parquet"
        )
        if destination.exists() and destination.stat().st_size > 0:
            return destination, False

        destination.parent.mkdir(parents=True, exist_ok=True)
        fetched_at = datetime.now(timezone.utc)
        rows: List[Dict[str, Any]] = [
            self._row(parsed, fetched, record, fetched_at) for record in parsed.laws
        ]
        table = pa.Table.from_pylist(rows, schema=PARQUET_SCHEMA)

        tmp_path = self._tmp_path("parquet")
        try:
            pq.write_table(table, tmp_path, compression="snappy")
            os.replace(tmp_path, destination)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return destination, True

    def write_manifest(
        self,
        parsed: ParsedDataset,
        fetched: FetchedArchive,
        zip_path: Path,
        parquet_path: Path,
    ) -> Tuple[Path, bool]:
        partition = _partition(parsed.update_date)
        destination = (
            self.data_dir
            / "manifests"
            / parsed.source.source_type.value
            / partition
            / f"{parsed.semantic_sha256[:16]}.json"
        )
        if destination.exists():
            return destination, False

        destination.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "source_type": parsed.source.source_type.value,
            "source_url": parsed.source.url,
            "source_label": parsed.source.label,
            "update_date": parsed.update_date,
            "zip_sha256": fetched.zip_sha256,
            "raw_json_sha256": fetched.raw_json_sha256,
            "semantic_sha256": parsed.semantic_sha256,
            "zip_path": str(zip_path),
            "parquet_path": str(parquet_path),
            "law_count": parsed.law_count,
            "article_count": parsed.article_count,
            "warnings": parsed.warnings,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        tmp_path = self._tmp_path("manifest")
        try:
            with tmp_path.open("w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2, sort_keys=True)
                handle.write("\n")
            os.replace(tmp_path, destination)
        finally:
            if tmp_path.exists():
                tmp_path.unlink()
        return destination, True

    def remove_file_and_empty_dirs(self, path: Path) -> None:
        try:
            if path.is_file():
                path.unlink()
        except FileNotFoundError:
            return

        parent = path.parent
        while parent != self.data_dir and self.data_dir in parent.parents:
            try:
                parent.rmdir()
            except OSError:
                break
            parent = parent.parent

    def _tmp_path(self, suffix: str) -> Path:
        return self.data_dir / "tmp" / f"{os.getpid()}-{id(self)}-{suffix}.tmp"

    def _row(
        self,
        parsed: ParsedDataset,
        fetched: FetchedArchive,
        record: LawRecord,
        fetched_at: datetime,
    ) -> Dict[str, Any]:
        return {
            "source_type": parsed.source.source_type.value,
            "source_url": parsed.source.url,
            "source_update_date": parsed.update_date,
            "zip_sha256": fetched.zip_sha256,
            "raw_json_sha256": fetched.raw_json_sha256,
            "semantic_sha256": parsed.semantic_sha256,
            "fetched_at": fetched_at,
            "law_key": record.law_key,
            "law_name": record.law_name,
            "law_level": record.law_level,
            "law_category": record.law_category,
            "law_url": record.law_url,
            "law_modified_date": record.law_modified_date,
            "law_effective_date": record.law_effective_date,
            "law_effective_note": record.law_effective_note,
            "law_abandon_note": record.law_abandon_note,
            "law_has_eng_version": record.law_has_eng_version,
            "eng_law_name": record.eng_law_name,
            "law_attachments_json": record.law_attachments_json,
            "law_histories": record.law_histories,
            "law_foreword": record.law_foreword,
            "article_count": record.article_count,
            "content_hash": record.content_hash,
            "raw_json": record.raw_json,
            "law_articles": record.law_articles,
        }
