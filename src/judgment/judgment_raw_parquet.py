from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, Iterator, List, Optional, Tuple
from uuid import uuid4

import pyarrow as pa
import pyarrow.parquet as pq

logger = logging.getLogger(__name__)

RAW_SCHEMA_VERSION = 2

RAW_JUDGMENT_SCHEMA = pa.schema(
    [
        pa.field("source_archive", pa.string()),
        pa.field("entry_index", pa.int64()),
        pa.field("jid", pa.string()),
        pa.field("jyear", pa.string()),
        pa.field("jcase", pa.string()),
        pa.field("jno", pa.string()),
        pa.field("jdate", pa.string()),
        pa.field("court", pa.string()),
        pa.field("court_normalized", pa.string()),
        pa.field("title", pa.string()),
        pa.field("pdf_url", pa.string()),
        pa.field("content_hash", pa.string()),
        pa.field("full_text_length", pa.int32()),
        pa.field("matched_laws", pa.list_(pa.string())),
        pa.field("matched_laws_text", pa.string()),
        pa.field("citations", pa.string()),
        pa.field("citation_count", pa.int32()),
        pa.field("raw_json", pa.string()),
    ]
)

RowProgress = Callable[[int], None]


def raw_judgment_root(data_dir: Path) -> Path:
    return Path(data_dir).expanduser().resolve() / "parquet" / "raw_judgments"


def _archive_key(archive: Path) -> str:
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", archive.stem).strip("-") or "archive"
    digest = hashlib.sha1(str(archive.resolve()).encode("utf-8")).hexdigest()[:8]
    return f"{stem}-{digest}"


def _manifest_matches(
    payload: Dict[str, Any],
    *,
    archive: Path,
    size_bytes: int,
    mtime_ns: int,
) -> bool:
    try:
        recorded_size = int(payload.get("archive_size_bytes") or -1)
        recorded_mtime = int(payload.get("archive_mtime_ns") or -1)
    except (TypeError, ValueError):
        return False
    return (
        str(payload.get("archive_path") or "") == str(archive.resolve())
        and recorded_size == size_bytes
        and recorded_mtime == mtime_ns
    )


def find_reusable_raw_parquet(
    data_dir: Path,
    archive: Path,
) -> Optional[Dict[str, Any]]:
    """Return an existing raw Parquet backup for an unchanged archive."""

    try:
        stat = archive.stat()
    except OSError:
        return None
    base = raw_judgment_root(data_dir) / _archive_key(archive)
    if not base.is_dir():
        return None
    manifests = sorted(
        base.glob("*/*/manifest.json"),
        key=lambda item: item.stat().st_mtime if item.exists() else 0,
        reverse=True,
    )
    for manifest_path in manifests:
        try:
            payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(payload, dict):
            continue
        if int(payload.get("version") or 0) < RAW_SCHEMA_VERSION:
            continue
        if not _manifest_matches(
            payload,
            archive=archive,
            size_bytes=int(stat.st_size),
            mtime_ns=int(stat.st_mtime_ns),
        ):
            continue
        raw_path = manifest_path.parent / "raw.parquet"
        if not raw_path.is_file():
            continue
        return {
            "path": raw_path,
            "manifest_path": manifest_path,
            "rows": int(payload.get("row_count") or 0),
            "size_bytes": int(payload.get("compressed_bytes") or 0),
            "reused": True,
            "duration_ms": 0,
            "write_ms": 0,
        }
    return None


def write_archive_raw_parquet(
    archive: Path,
    data_dir: Path,
    entries: Iterable[Tuple[Dict[str, Any], str]],
    *,
    run_token: str = "",
    batch_size: int = 5000,
    row_progress: Optional[RowProgress] = None,
    entry_transform: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Write every extracted JSON object to an immutable raw Parquet file.

    ``raw_json`` is the exact JSON text read from the archive; it is not
    re-serialized from the parsed object, so the backup does not rewrite or
    normalize the source content.
    """

    try:
        stat = archive.stat()
        size_bytes = int(stat.st_size)
        mtime_ns = int(stat.st_mtime_ns)
    except OSError:
        size_bytes = 0
        mtime_ns = 0
    now = datetime.now(timezone.utc)
    token = (run_token or uuid4().hex)[:10]
    destination_dir = (
        raw_judgment_root(data_dir)
        / _archive_key(archive)
        / now.strftime("%Y%m%d")
        / f"{now.strftime('%H%M%S')}-{token}"
    )
    destination = destination_dir / "raw.parquet"
    destination_dir.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(
        f".{destination.name}.{os.getpid()}.{uuid4().hex[:6]}.tmp"
    )

    started = time.perf_counter()
    write_seconds = 0.0
    rows = 0
    writer: Optional[pq.ParquetWriter] = None
    batch: list[Dict[str, Any]] = []
    try:
        writer = pq.ParquetWriter(temporary, RAW_JUDGMENT_SCHEMA, compression="snappy")
        allowed = set(RAW_JUDGMENT_SCHEMA.names)
        for entry_index, (obj, raw_json) in enumerate(entries, start=1):
            row = {
                "source_archive": archive.name,
                "entry_index": entry_index,
                "jid": str(obj.get("JID") or "").strip(),
                "raw_json": raw_json,
            }
            if entry_transform is not None:
                extra = entry_transform(obj)
                if isinstance(extra, dict):
                    row.update(extra)
            batch.append({key: value for key, value in row.items() if key in allowed})
            rows += 1
            if len(batch) >= max(1, int(batch_size)):
                write_started = time.perf_counter()
                writer.write_table(
                    pa.Table.from_pylist(batch, schema=RAW_JUDGMENT_SCHEMA)
                )
                write_seconds += time.perf_counter() - write_started
                batch = []
                if row_progress is not None:
                    row_progress(rows)
        if batch:
            write_started = time.perf_counter()
            writer.write_table(pa.Table.from_pylist(batch, schema=RAW_JUDGMENT_SCHEMA))
            write_seconds += time.perf_counter() - write_started
            batch = []
        elif rows == 0:
            writer.write_table(pa.Table.from_pylist([], schema=RAW_JUDGMENT_SCHEMA))
        writer.close()
        writer = None
        os.replace(temporary, destination)
    except BaseException:
        if writer is not None:
            try:
                writer.close()
            except Exception:
                logger.exception("failed to close raw parquet writer")
            writer = None
        if temporary.exists():
            try:
                temporary.unlink()
            except OSError:
                logger.exception("failed to remove temporary raw parquet %s", temporary)
        raise

    compressed_bytes = destination.stat().st_size if destination.exists() else 0
    duration_ms = int((time.perf_counter() - started) * 1000)
    manifest = {
        "version": RAW_SCHEMA_VERSION,
        "archive_name": archive.name,
        "archive_path": str(archive.resolve()),
        "archive_size_bytes": size_bytes,
        "archive_mtime_ns": mtime_ns,
        "row_count": rows,
        "compressed_bytes": compressed_bytes,
        "raw_path": str(destination),
        "run_token": token,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    manifest_path = destination_dir / "manifest.json"
    temporary_manifest = manifest_path.with_name(
        f".{manifest_path.name}.{os.getpid()}.{uuid4().hex[:6]}.tmp"
    )
    try:
        temporary_manifest.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        os.replace(temporary_manifest, manifest_path)
    finally:
        if temporary_manifest.exists():
            try:
                temporary_manifest.unlink()
            except OSError:
                logger.exception(
                    "failed to remove temporary raw manifest %s", temporary_manifest
                )

    return {
        "path": destination,
        "manifest_path": manifest_path,
        "rows": rows,
        "size_bytes": compressed_bytes,
        "reused": False,
        "duration_ms": duration_ms,
        "write_ms": int(write_seconds * 1000),
    }


def iter_raw_judgment_json(
    path: Path,
    *,
    batch_size: int = 5000,
) -> Iterator[Dict[str, Any]]:
    """Yield parsed objects from a raw judgment Parquet backup."""

    parquet_file = pq.ParquetFile(path)
    for batch in parquet_file.iter_batches(
        batch_size=max(1, int(batch_size)),
        columns=["raw_json"],
    ):
        for raw_json in batch.column(0).to_pylist():
            if not raw_json:
                continue
            try:
                obj = json.loads(raw_json)
            except ValueError:
                logger.warning("ignoring invalid raw JSON row in %s", path)
                continue
            if isinstance(obj, dict):
                yield obj


def _latest_manifests(data_dir: Path) -> List[Dict[str, Any]]:
    root = raw_judgment_root(data_dir)
    if not root.is_dir():
        return []
    latest: Dict[str, tuple] = {}
    for manifest_path in root.glob("*/*/*/manifest.json"):
        try:
            payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(payload, dict):
            continue
        if int(payload.get("version") or 0) < RAW_SCHEMA_VERSION:
            continue
        raw_path = manifest_path.parent / "raw.parquet"
        if not raw_path.is_file():
            continue
        archive_key = manifest_path.relative_to(root).parts[0]
        try:
            mtime = manifest_path.stat().st_mtime
        except OSError:
            mtime = 0.0
        current = latest.get(archive_key)
        candidate = (mtime, payload, raw_path)
        if current is None or candidate[0] > current[0]:
            latest[archive_key] = candidate
    return [
        {"manifest": payload, "path": raw_path}
        for _, payload, raw_path in sorted(latest.values(), key=lambda item: str(item[2]))
    ]


def raw_judgment_files(data_dir: Path) -> List[Path]:
    return [item["path"] for item in _latest_manifests(data_dir)]


def raw_judgment_totals(data_dir: Path) -> Dict[str, Any]:
    manifests = _latest_manifests(data_dir)
    return {
        "file_count": len(manifests),
        "row_count": sum(
            int((item["manifest"] or {}).get("row_count") or 0)
            for item in manifests
        ),
        "compressed_bytes": sum(
            int((item["manifest"] or {}).get("compressed_bytes") or 0)
            for item in manifests
        ),
    }


def latest_raw_manifest(data_dir: Path) -> Optional[Dict[str, Any]]:
    manifests = _latest_manifests(data_dir)
    if not manifests:
        return None
    item = max(
        manifests,
        key=lambda entry: str((entry["manifest"] or {}).get("created_at") or ""),
    )
    payload = dict(item["manifest"])
    payload.setdefault("manifest_path", str(item["path"].parent / "manifest.json"))
    return payload


def count_raw_manifests(data_dir: Path) -> int:
    return len(_latest_manifests(data_dir))


__all__ = [
    "RAW_JUDGMENT_SCHEMA",
    "RAW_SCHEMA_VERSION",
    "count_raw_manifests",
    "find_reusable_raw_parquet",
    "iter_raw_judgment_json",
    "latest_raw_manifest",
    "raw_judgment_files",
    "raw_judgment_totals",
    "raw_judgment_root",
    "write_archive_raw_parquet",
]
