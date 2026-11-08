from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List, Optional
from uuid import uuid4

import pyarrow as pa
import pyarrow.dataset as ds
import pyarrow.parquet as pq
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .judgment_raw_parquet import latest_raw_manifest, raw_judgment_files, raw_judgment_totals
from .models import JudgmentDocument
from .observability import record_performance
from .processing_state import ProcessingStateStore, parent_run_id

logger = logging.getLogger(__name__)

SCHEMA_VERSION = 1
JUDGMENT_PARQUET_COLUMNS = [
    "jid",
    "jyear",
    "jcase",
    "jno",
    "jdate",
    "court",
    "court_normalized",
    "title",
    "full_text",
    "pdf_url",
    "source_archive",
    "content_hash",
    "matched_laws",
    "matched_laws_text",
    "citations",
    "citation_count",
    "full_text_length",
    "import_run_id",
    "created_at",
    "updated_at",
]

JUDGMENT_PARQUET_SCHEMA = pa.schema(
    [
        pa.field("jid", pa.string()),
        pa.field("jyear", pa.string()),
        pa.field("jcase", pa.string()),
        pa.field("jno", pa.string()),
        pa.field("jdate", pa.string()),
        pa.field("court", pa.string()),
        pa.field("court_normalized", pa.string()),
        pa.field("title", pa.string()),
        pa.field("full_text", pa.string()),
        pa.field("pdf_url", pa.string()),
        pa.field("source_archive", pa.string()),
        pa.field("content_hash", pa.string()),
        pa.field("matched_laws", pa.list_(pa.string())),
        pa.field("matched_laws_text", pa.string()),
        pa.field("citations", pa.string()),
        pa.field("citation_count", pa.int32()),
        pa.field("full_text_length", pa.int32()),
        pa.field("import_run_id", pa.int32()),
        pa.field("created_at", pa.string()),
        pa.field("updated_at", pa.string()),
    ]
)


def _iso(value: Optional[datetime]) -> str:
    return value.isoformat() if value else ""


def _json_text(value: Any) -> str:
    return json.dumps(value or [], ensure_ascii=False, default=str)


def _record_to_dict(record: JudgmentDocument) -> Dict[str, Any]:
    return {
        "jid": str(record.jid or ""),
        "jyear": str(record.jyear or ""),
        "jcase": str(record.jcase or ""),
        "jno": str(record.jno or ""),
        "jdate": str(record.jdate or ""),
        "court": str(record.court or ""),
        "court_normalized": str(record.court_normalized or ""),
        "title": str(record.title or ""),
        "full_text": str(record.full_text or ""),
        "pdf_url": str(record.pdf_url or ""),
        "source_archive": str(record.source_archive or ""),
        "content_hash": str(record.content_hash or ""),
        "matched_laws": [str(value) for value in (record.matched_laws or [])],
        "matched_laws_text": str(record.matched_laws_text or ""),
        "citations": _json_text(record.citations),
        "citation_count": int(record.citation_count or 0),
        "full_text_length": int(record.full_text_length or 0),
        "import_run_id": int(record.import_run_id)
        if record.import_run_id is not None
        else None,
        "created_at": _iso(record.created_at),
        "updated_at": _iso(record.updated_at),
    }


def _chunks(records: Iterator[JudgmentDocument], size: int) -> Iterator[List[JudgmentDocument]]:
    chunk: List[JudgmentDocument] = []
    for record in records:
        chunk.append(record)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def _latest_manifest(path: Path) -> Dict[str, Any]:
    manifest_path = path.parent / "manifest.json"
    if not manifest_path.exists():
        return {}
    try:
        payload = json.loads(manifest_path.read_text(encoding="utf-8"))
        return payload if isinstance(payload, dict) else {}
    except (OSError, ValueError):
        return {}


def latest_judgment_parquet(data_dir: Path) -> Optional[Path]:
    base = Path(data_dir).expanduser().resolve() / "parquet" / "judgments"
    candidates = []
    for path in base.glob("*/*/judgments.parquet"):
        if not (path.parent / "manifest.json").exists():
            continue
        try:
            partition = path.parent.parent.name
            snapshot = path.parent.name
            candidates.append((partition, snapshot, path.stat().st_mtime, path))
        except OSError:
            continue
    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][3]


def get_judgment_from_parquet(
    data_dir: Path,
    jid: str,
) -> Dict[str, Any]:
    key = str(jid or "").strip()
    if not key:
        raise ValueError("jid 不可為空")
    paths = raw_judgment_files(data_dir)
    if not paths:
        raise FileNotFoundError(
            "尚未產生原始判決 Parquet；請先執行 judgment-import-judgments --raw-only。"
        )
    try:
        dataset = ds.dataset([str(path) for path in paths], format="parquet")
        table = dataset.to_table(
            filter=ds.field("jid") == key,
            columns=[
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
                "citations",
                "citation_count",
                "raw_json",
            ],
        )
    except Exception as exc:
        raise LookupError(
            f"無法從原始 Parquet 讀取判決：{exc.__class__.__name__}: {exc}"
        ) from exc
    if table.num_rows == 0:
        raise LookupError(f"原始 Parquet 中找不到判決：{key}")
    row = max(
        table.to_pylist(),
        key=lambda item: str(item.get("jdate") or ""),
    )
    try:
        raw = json.loads(row.get("raw_json") or "{}")
    except ValueError:
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    full_text = str(raw.get("JFULL") or "")
    try:
        citations = json.loads(row.get("citations") or "[]")
    except ValueError:
        citations = []
    if not isinstance(citations, list):
        citations = []
    manifest = latest_raw_manifest(data_dir) or {}
    totals = raw_judgment_totals(data_dir)
    raw_root = Path(data_dir).expanduser().resolve() / "parquet" / "raw_judgments"
    return {
        "status": "ok",
        "source": "parquet",
        "jid": row.get("jid") or key,
        "jyear": row.get("jyear") or "",
        "jcase": row.get("jcase") or "",
        "jno": row.get("jno") or "",
        "jdate": row.get("jdate") or "",
        "court": row.get("court_normalized") or row.get("court") or "",
        "court_raw": row.get("court") or "",
        "title": row.get("title") or "",
        "full_text": full_text,
        "pdf_url": row.get("pdf_url") or str(raw.get("JPDF") or ""),
        "source_archive": row.get("source_archive") or "",
        "content_hash": row.get("content_hash") or "",
        "matched_laws": row.get("matched_laws") or [],
        "citations": [
            dict(item) for item in citations if isinstance(item, dict)
        ],
        "citation_count": int(row.get("citation_count") or 0),
        "full_text_length": int(
            row.get("full_text_length") or len(full_text)
        ),
        "import_run_id": None,
        "created_at": None,
        "updated_at": None,
        "parquet_path": str(raw_root),
        "parquet_generated_at": manifest.get("created_at"),
        "parquet_schema_version": manifest.get("version"),
        "parquet_row_count": totals.get("row_count"),
    }


def export_judgments_to_parquet(
    session_factory: sessionmaker[Session],
    data_dir: Path,
    *,
    limit: Optional[int] = None,
    batch_size: int = 2000,
    dry_run: bool = False,
    write_manifest: bool = True,
    track_state: bool = False,
    state_parent_run_id: str = "",
) -> Dict[str, Any]:
    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    data_dir = Path(data_dir).expanduser().resolve()
    batch_size = max(100, int(batch_size))
    output_root = (
        data_dir
        / "parquet"
        / "judgments"
        / started_at.strftime("%Y%m%d")
        / f"{started_at.strftime('%H%M%S')}-{uuid4().hex[:8]}"
    )
    parquet_path = output_root / "judgments.parquet"
    count = 0
    total_full_text = 0
    target = 0
    state: Optional[ProcessingStateStore] = None
    state_run_id: Optional[str] = None
    try:
        with session_factory() as session:
            total = int(
                session.scalar(
                    select(func.count()).select_from(JudgmentDocument)
                )
                or 0
            )
            target = min(total, int(limit)) if limit else total
            if track_state and not dry_run:
                state = ProcessingStateStore()
                state_run_id = state.start_run(
                    branch="judgment",
                    kind="parquet",
                    title="判決 Parquet 快照",
                    stages=["parquet"],
                    meta={
                        "data_dir": str(data_dir),
                        "total_judgments": total,
                        "target_judgments": target,
                        "parent_run_id": parent_run_id() or state_parent_run_id,
                    },
                    message=f"準備匯出 {target:,} 筆判決。",
                )
                state.start_stage(
                    state_run_id,
                    "parquet",
                    total=target,
                    message=f"從 PostgreSQL 匯出 {target:,} 筆。",
                )
            if dry_run:
                summary = {
                    "status": "dry_run",
                    "parquet_path": str(parquet_path),
                    "total_judgments": total,
                    "target_judgments": target,
                    "row_count": 0,
                    "duration_ms": int((time.perf_counter() - started) * 1000),
                    "schema_version": SCHEMA_VERSION,
                }
                record_performance(
                    session_factory,
                    process="判決 Parquet 匯出（試跑）",
                    module="judgment.judgment_parquet.export_judgments_to_parquet",
                    status="success",
                    started_at=started_at,
                    finished_at=datetime.now(timezone.utc),
                    duration_ms=summary["duration_ms"],
                    params={
                        "data_dir": str(data_dir),
                        "limit": limit,
                        "batch_size": batch_size,
                    },
                    details={
                        "total_judgments": total,
                        "target_judgments": target,
                    },
                )
                return summary

            output_root.mkdir(parents=True, exist_ok=True)
            statement = (
                select(JudgmentDocument)
                .order_by(JudgmentDocument.jid.asc())
                .execution_options(stream_results=True)
            )
            if limit:
                statement = statement.limit(int(limit))
            records = session.execute(statement).scalars()
            with pq.ParquetWriter(
                parquet_path,
                JUDGMENT_PARQUET_SCHEMA,
                compression="zstd",
                use_dictionary=False,
            ) as writer:
                for batch in _chunks(records.yield_per(batch_size), batch_size):
                    rows = [_record_to_dict(record) for record in batch]
                    if not rows:
                        continue
                    table = pa.Table.from_pylist(
                        rows,
                        schema=JUDGMENT_PARQUET_SCHEMA,
                    )
                    writer.write_table(table, row_group_size=len(rows))
                    count += len(rows)
                    total_full_text += sum(
                        int(row.get("full_text_length") or 0) for row in rows
                    )
                    if count % 10000 == 0:
                        logger.info("parquet exported=%s", count)
                        if state is not None and state_run_id is not None:
                            state.update_stage(
                                state_run_id,
                                "parquet",
                                current=count,
                                total=target,
                                message=f"已寫入 {count:,} / {target:,} 筆。",
                            )

        size_bytes = parquet_path.stat().st_size if parquet_path.exists() else 0
        manifest = {
            "version": SCHEMA_VERSION,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "source": "postgresql:judgment_documents",
            "row_count": count,
            "size_bytes": size_bytes,
            "average_full_text_length": round(total_full_text / count, 1)
            if count
            else 0,
            "columns": JUDGMENT_PARQUET_COLUMNS,
            "path": parquet_path.name,
        }
        if write_manifest:
            (output_root / "manifest.json").write_text(
                json.dumps(manifest, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
        if state is not None and state_run_id is not None:
            state.finish_stage(
                state_run_id,
                "parquet",
                current=count,
                total=target or count,
                message=f"Parquet 快照完成：{count:,} 筆。",
            )
            state.finish_run(
                state_run_id,
                status="success",
                message=f"已產生 Parquet 快照：{count:,} 筆。",
                counts={"row_count": count, "size_bytes": size_bytes},
            )
        duration_ms = int((time.perf_counter() - started) * 1000)
        record_performance(
            session_factory,
            process="判決 Parquet 匯出",
            module="judgment.judgment_parquet.export_judgments_to_parquet",
            status="success",
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "data_dir": str(data_dir),
                "limit": limit,
                "batch_size": batch_size,
            },
            details={
                "row_count": count,
                "size_bytes": size_bytes,
                "parquet_path": str(parquet_path),
            },
        )
        return {
            "status": "success",
            "parquet_path": str(parquet_path),
            "manifest_path": str(output_root / "manifest.json"),
            "row_count": count,
            "size_bytes": size_bytes,
            "average_full_text_length": manifest["average_full_text_length"],
            "duration_ms": duration_ms,
            "schema_version": SCHEMA_VERSION,
        }
    except KeyboardInterrupt:
        if state is not None and state_run_id is not None:
            state.finish_run(
                state_run_id,
                status="interrupted",
                message="Parquet 匯出已中止。",
                counts={"row_count": count},
            )
        raise
    except Exception as exc:
        if state is not None and state_run_id is not None:
            state.finish_run(
                state_run_id,
                status="failed",
                message=f"{exc.__class__.__name__}: {exc}",
                counts={"row_count": count},
            )
        duration_ms = int((time.perf_counter() - started) * 1000)
        record_performance(
            session_factory,
            process="判決 Parquet 匯出",
            module="judgment.judgment_parquet.export_judgments_to_parquet",
            status="failed",
            started_at=started_at,
            finished_at=datetime.now(timezone.utc),
            duration_ms=duration_ms,
            params={
                "data_dir": str(data_dir),
                "limit": limit,
                "batch_size": batch_size,
            },
            details={"row_count": count},
            error_message=f"{exc.__class__.__name__}: {exc}",
        )
        raise


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )


def main() -> int:
    settings = Settings.from_env()
    parser = argparse.ArgumentParser(
        description="將 PostgreSQL judgment_documents 匯出為 Parquet 快照"
    )
    parser.add_argument("--data-dir", default=str(settings.judgment_data_dir))
    parser.add_argument("--batch-size", type=int, default=2000)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--log-level", default=settings.log_level)
    args = parser.parse_args()

    configure_logging(args.log_level)
    engine = build_engine(settings.database_url)
    try:
        init_db(engine)
        session_factory = build_session_factory(engine)
        summary = export_judgments_to_parquet(
            session_factory=session_factory,
            data_dir=Path(args.data_dir),
            limit=args.limit,
            batch_size=args.batch_size,
            dry_run=args.dry_run,
            track_state=not args.dry_run,
        )
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        return 0
    finally:
        engine.dispose()


if __name__ == "__main__":
    raise SystemExit(main())
