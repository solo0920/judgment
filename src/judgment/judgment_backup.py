from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

import pyarrow as pa
import pyarrow.dataset as ds
import pyarrow.parquet as pq

from .judgment_raw_parquet import raw_judgment_root
from .judgment_versioning import archive_snapshot_info

DELTA_SCHEMA = pa.schema(
    [
        pa.field("jid", pa.string()),
        pa.field("issue_month", pa.string()),
        pa.field("change_type", pa.string()),
        pa.field("old_content_hash", pa.string()),
        pa.field("new_content_hash", pa.string()),
        pa.field("old_raw_json", pa.string()),
        pa.field("source_archive", pa.string()),
        pa.field("jdate", pa.string()),
        pa.field("created_at", pa.string()),
    ]
)

RAW_META_COLUMNS = ("jid", "content_hash", "jdate", "source_archive")
RAW_JSON_COLUMNS = ("jid", "raw_json")


def raw_delta_root(data_dir: Path) -> Path:
    return Path(data_dir).expanduser().resolve() / "parquet" / "raw_judgment_deltas"


def _manifest_issue_month(payload: Dict[str, Any]) -> str:
    archive_name = str(payload.get("archive_name") or "")
    month, _ = archive_snapshot_info(Path(archive_name))
    return month


def find_previous_raw_parquet(
    data_dir: Path,
    *,
    issue_month: str,
    current_path: Path,
) -> Optional[Path]:
    """Find the newest full raw Parquet for the same issue month."""

    root = raw_judgment_root(data_dir)
    if not root.is_dir():
        return None
    current_resolved = current_path.expanduser().resolve()
    candidates = []
    for manifest_path in root.glob("*/*/*/manifest.json"):
        try:
            payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if not isinstance(payload, dict):
            continue
        if _manifest_issue_month(payload) != issue_month:
            continue
        raw_path = manifest_path.parent / "raw.parquet"
        if not raw_path.is_file() or raw_path.resolve() == current_resolved:
            continue
        try:
            created = str(payload.get("created_at") or "")
            mtime = manifest_path.stat().st_mtime
        except OSError:
            created = ""
            mtime = 0.0
        candidates.append((created, mtime, raw_path))
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][2]


def _read_raw(path: Path) -> Dict[str, Dict[str, Any]]:
    table = pq.read_table(path, columns=list(RAW_META_COLUMNS))
    return {
        str(row.get("jid") or ""): row
        for row in table.to_pylist()
        if str(row.get("jid") or "").strip()
    }


def _read_raw_json_map(path: Path, jids: Sequence[str]) -> Dict[str, str]:
    if not jids:
        return {}
    dataset = ds.dataset(str(path), format="parquet")
    table = dataset.to_table(
        columns=list(RAW_JSON_COLUMNS),
        filter=ds.field("jid").isin([str(jid) for jid in jids]),
    )
    return {
        str(row.get("jid") or ""): str(row.get("raw_json") or "")
        for row in table.to_pylist()
        if str(row.get("jid") or "").strip()
    }


def write_raw_delta(
    *,
    data_dir: Path,
    issue_month: str,
    from_archive: str,
    to_archive: str,
    old_raw_path: Optional[Path],
    new_raw_path: Path,
) -> Dict[str, Any]:
    """Write a record-level delta between two full raw Parquet snapshots.

    Added rows are represented by their JID/hash because the new full snapshot
    already contains their raw JSON.  Modified and removed rows keep the old
    raw JSON so the old snapshot can always be reconstructed without keeping
    another full Parquet copy.
    """

    if old_raw_path is None or not Path(old_raw_path).is_file():
        return {"path": "", "added": 0, "modified": 0, "removed": 0}
    old_rows = _read_raw(Path(old_raw_path))
    new_rows = _read_raw(Path(new_raw_path))
    changes: List[Dict[str, Any]] = []
    for jid in sorted(set(old_rows) | set(new_rows)):
        old = old_rows.get(jid)
        new = new_rows.get(jid)
        if old is None:
            changes.append(
                {
                    "jid": jid,
                    "change_type": "added",
                    "old_hash": "",
                    "new_hash": str(new.get("content_hash") or ""),
                    "jdate": str(new.get("jdate") or ""),
                    "source_archive": str(
                        new.get("source_archive") or to_archive
                    ),
                }
            )
        elif new is None:
            changes.append(
                {
                    "jid": jid,
                    "change_type": "removed",
                    "old_hash": str(old.get("content_hash") or ""),
                    "new_hash": "",
                    "jdate": str(old.get("jdate") or ""),
                    "source_archive": str(
                        old.get("source_archive") or from_archive
                    ),
                }
            )
        elif str(old.get("content_hash") or "") != str(
            new.get("content_hash") or ""
        ):
            changes.append(
                {
                    "jid": jid,
                    "change_type": "modified",
                    "old_hash": str(old.get("content_hash") or ""),
                    "new_hash": str(new.get("content_hash") or ""),
                    "jdate": str(new.get("jdate") or old.get("jdate") or ""),
                    "source_archive": str(
                        old.get("source_archive") or from_archive
                    ),
                }
            )
    old_json = _read_raw_json_map(
        Path(old_raw_path),
        [
            str(change["jid"])
            for change in changes
            if change["change_type"] in {"modified", "removed"}
        ],
    )
    created_at = datetime.now(timezone.utc).isoformat()
    rows: List[Dict[str, Any]] = []
    for change in changes:
        old_raw_json = (
            old_json.get(str(change["jid"]))
            if change["change_type"] in {"modified", "removed"}
            else None
        )
        if change["change_type"] in {"modified", "removed"} and old_raw_json is None:
            raise RuntimeError(
                f"delta 缺少舊 raw JSON：{change['jid']} ({change['change_type']})"
            )
        rows.append(
            {
                "jid": change["jid"],
                "issue_month": issue_month,
                "change_type": change["change_type"],
                "old_content_hash": change["old_hash"],
                "new_content_hash": change["new_hash"],
                "old_raw_json": old_raw_json,
                "source_archive": change["source_archive"],
                "jdate": change["jdate"],
                "created_at": created_at,
            }
        )
    counts = {
        "added": sum(1 for row in rows if row["change_type"] == "added"),
        "modified": sum(1 for row in rows if row["change_type"] == "modified"),
        "removed": sum(1 for row in rows if row["change_type"] == "removed"),
    }
    if not rows:
        return {"path": "", **counts}
    destination_dir = raw_delta_root(data_dir) / issue_month
    destination_dir.mkdir(parents=True, exist_ok=True)
    from_key = Path(from_archive).stem.replace("/", "_")
    to_key = Path(to_archive).stem.replace("/", "_")
    destination = destination_dir / f"{from_key}__{to_key}.parquet"
    temporary = destination.with_name(
        f".{destination.name}.{os.getpid()}.tmp"
    )
    table = pa.Table.from_pylist(rows, schema=DELTA_SCHEMA)
    pq.write_table(table, temporary, compression="snappy")
    os.replace(temporary, destination)
    verified = pq.ParquetFile(destination).metadata.num_rows
    if int(verified) != len(rows):
        raise RuntimeError(
            f"delta Parquet 驗證失敗：預期 {len(rows)}，實際 {verified}"
        )
    manifest = {
        "version": 1,
        "issue_month": issue_month,
        "from_archive": from_archive,
        "to_archive": to_archive,
        "from_raw_parquet": str(Path(old_raw_path)),
        "to_raw_parquet": str(new_raw_path),
        "delta_parquet": str(destination),
        "row_count": len(rows),
        **counts,
        "created_at": created_at,
    }
    manifest_path = destination.with_suffix(".json")
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return {"path": str(destination), "manifest_path": str(manifest_path), **counts}


def prune_raw_parquet(raw_path: Optional[Path]) -> bool:
    """Remove a superseded full raw Parquet only after its delta is durable."""

    if raw_path is None:
        return False
    raw_path = Path(raw_path)
    if not raw_path.is_file():
        return False
    manifest = raw_path.parent / "manifest.json"
    try:
        raw_path.unlink()
        if manifest.is_file():
            manifest.unlink()
        parent = raw_path.parent
        if parent.is_dir() and not any(parent.iterdir()):
            parent.rmdir()
            if parent.parent.is_dir() and not any(parent.parent.iterdir()):
                parent.parent.rmdir()
        return True
    except OSError:
        return False


def apply_raw_deltas_backwards(
    current_raw_path: Path,
    delta_paths: Sequence[Path],
) -> Dict[str, str]:
    """Reconstruct old raw JSON rows from current full + deltas (newest first)."""

    state = {
        str(row.get("jid") or ""): str(row.get("raw_json") or "")
        for row in pq.read_table(
            current_raw_path, columns=["jid", "raw_json"]
        ).to_pylist()
        if str(row.get("jid") or "").strip()
    }
    for path in reversed(list(delta_paths)):
        table = pq.read_table(path, columns=list(DELTA_SCHEMA.names))
        for row in table.to_pylist():
            jid = str(row.get("jid") or "")
            change_type = str(row.get("change_type") or "")
            if change_type == "added":
                state.pop(jid, None)
            elif change_type == "removed":
                state[jid] = str(row.get("old_raw_json") or "")
            elif change_type == "modified":
                state[jid] = str(row.get("old_raw_json") or "")
    return state


def list_delta_manifests(
    data_dir: Path,
    *,
    issue_month: str = "",
    limit: int = 50,
) -> List[Dict[str, Any]]:
    root = raw_delta_root(data_dir)
    if not root.is_dir():
        return []
    patterns = (
        f"{issue_month}/*.json" if issue_month else "*/*.json"
    )
    manifests = []
    for path in root.glob(patterns):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(payload, dict):
            manifests.append(payload)
    manifests.sort(key=lambda item: str(item.get("created_at") or ""), reverse=True)
    return manifests[: max(1, int(limit))]


def list_delta_rows(
    data_dir: Path,
    *,
    issue_month: str,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """Return recent raw delta rows for audit without loading full snapshots."""

    manifests = list_delta_manifests(
        data_dir, issue_month=issue_month, limit=20
    )
    rows: List[Dict[str, Any]] = []
    for manifest in manifests:
        path = Path(str(manifest.get("delta_parquet") or ""))
        if not path.is_file():
            continue
        remaining = max(0, int(limit) - len(rows))
        if remaining <= 0:
            break
        table = pq.read_table(path, columns=list(DELTA_SCHEMA.names))
        rows.extend(table.slice(0, remaining).to_pylist())
    return rows
