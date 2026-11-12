from __future__ import annotations

import argparse
import hashlib
import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import pyarrow.parquet as pq
from sqlalchemy import func, insert, select
from sqlalchemy.orm import Session, sessionmaker

from .db import build_engine, build_session_factory, init_db
from .models import (
    LawArticleChangeEvent,
    LawArticleVersion,
    LawDatasetVersion,
    LawDocument,
)

logger = logging.getLogger(__name__)

INSERT_CHUNK_SIZE = 1000


def _text(value: Any) -> str:
    return str(value or "").strip()


def _article_key(article_type: str, article_no: str, index: int) -> str:
    type_key = re.sub(r"\s+", "", _text(article_type) or "A")
    no_key = re.sub(r"\s+", "", _text(article_no))
    if no_key:
        return f"{type_key}:{no_key}"
    return f"{type_key}:#{index}"


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def build_article_rows(
    *,
    law_id: int,
    law_key: str,
    law_version_id: int,
    articles: Iterable[Dict[str, Any]],
    effective_date: str = "",
) -> List[Dict[str, Any]]:
    """Build immutable article rows for one law/version snapshot."""

    rows: List[Dict[str, Any]] = []
    seen = set()
    for index, article in enumerate(articles or []):
        if not isinstance(article, dict):
            continue
        content = _text(article.get("article_content"))
        if not content:
            continue
        article_type = _text(article.get("article_type"))
        article_no = _text(article.get("article_no"))
        key = _article_key(article_type, article_no, index)
        if key in seen:
            key = f"{key}#{index}"
        seen.add(key)
        rows.append(
            {
                "law_id": int(law_id),
                "law_key": str(law_key),
                "law_version_id": int(law_version_id),
                "article_key": key,
                "article_type": article_type,
                "article_no": article_no,
                "article_index": index,
                "article_content": content,
                "content_hash": _content_hash(content),
                "effective_date": _text(effective_date),
            }
        )
    return rows


def _previous_articles(
    session: Session, version_id: Optional[int]
) -> Dict[int, Dict[str, LawArticleVersion]]:
    if not version_id:
        return {}
    rows = session.scalars(
        select(LawArticleVersion).where(
            LawArticleVersion.law_version_id == int(version_id)
        )
    ).all()
    result: Dict[int, Dict[str, LawArticleVersion]] = {}
    for row in rows:
        result.setdefault(int(row.law_id), {})[row.article_key] = row
    return result


def _changes_for_rows(
    *,
    law_id: int,
    law_key: str,
    current_rows: Sequence[Dict[str, Any]],
    previous: Optional[Dict[str, LawArticleVersion]],
    from_version_id: Optional[int],
    to_version_id: int,
    detected_at: datetime,
) -> List[Dict[str, Any]]:
    if not previous:
        return []
    current = {row["article_key"]: row for row in current_rows}
    changes: List[Dict[str, Any]] = []
    for key, row in current.items():
        old = previous.get(key)
        if old is None:
            changes.append(
                {
                    "law_id": int(law_id),
                    "law_key": law_key,
                    "from_version_id": from_version_id,
                    "to_version_id": to_version_id,
                    "article_key": key,
                    "article_type": row["article_type"],
                    "article_no": row["article_no"],
                    "change_type": "added",
                    "changed_fields": ["article_content"],
                    "before_content": None,
                    "after_content": row["article_content"],
                    "effective_date": row["effective_date"],
                    "detected_at": detected_at,
                }
            )
        elif old.content_hash != row["content_hash"]:
            changes.append(
                {
                    "law_id": int(law_id),
                    "law_key": law_key,
                    "from_version_id": from_version_id,
                    "to_version_id": to_version_id,
                    "article_key": key,
                    "article_type": row["article_type"],
                    "article_no": row["article_no"],
                    "change_type": "modified",
                    "changed_fields": ["article_content"],
                    "before_content": old.article_content,
                    "after_content": row["article_content"],
                    "effective_date": row["effective_date"],
                    "detected_at": detected_at,
                }
            )
    for key, old in previous.items():
        if key in current:
            continue
        changes.append(
            {
                "law_id": int(law_id),
                "law_key": law_key,
                "from_version_id": from_version_id,
                "to_version_id": to_version_id,
                "article_key": key,
                "article_type": old.article_type,
                "article_no": old.article_no,
                "change_type": "removed",
                "changed_fields": ["article_content"],
                "before_content": old.article_content,
                "after_content": None,
                "effective_date": old.effective_date,
                "detected_at": detected_at,
            }
        )
    return changes


def _insert_rows(
    session: Session,
    model,
    rows: Sequence[Dict[str, Any]],
    *,
    chunk_size: int = INSERT_CHUNK_SIZE,
) -> int:
    inserted = 0
    for start in range(0, len(rows), chunk_size):
        chunk = list(rows[start : start + chunk_size])
        if not chunk:
            continue
        session.execute(insert(model), chunk)
        inserted += len(chunk)
    return inserted


def persist_article_rows(
    session: Session,
    *,
    version_id: int,
    law_rows: Sequence[Tuple[LawDocument, Sequence[Dict[str, Any]]]],
    previous_version_id: Optional[int],
    detected_at: Optional[datetime] = None,
) -> Dict[str, int]:
    """Persist article snapshots and article-level changes for one version."""

    when = detected_at or datetime.now(timezone.utc)
    previous_by_law = _previous_articles(session, previous_version_id)
    article_rows: List[Dict[str, Any]] = []
    change_rows: List[Dict[str, Any]] = []
    for document, rows in law_rows:
        if not rows:
            continue
        article_rows.extend(rows)
        change_rows.extend(
            _changes_for_rows(
                law_id=int(document.id),
                law_key=str(document.law_key),
                current_rows=rows,
                previous=previous_by_law.get(int(document.id)),
                from_version_id=previous_version_id,
                to_version_id=int(version_id),
                detected_at=when,
            )
        )
    articles_inserted = _insert_rows(session, LawArticleVersion, article_rows)
    changes_inserted = _insert_rows(session, LawArticleChangeEvent, change_rows)
    return {
        "articles_inserted": articles_inserted,
        "article_changes_inserted": changes_inserted,
    }


def persist_article_snapshot(
    session: Session,
    *,
    version_id: int,
    records: Sequence[Any],
    documents_by_key: Dict[str, LawDocument],
    previous_version_id: Optional[int],
    detected_at: Optional[datetime] = None,
) -> Dict[str, int]:
    law_rows: List[Tuple[LawDocument, List[Dict[str, Any]]]] = []
    for record in records:
        document = documents_by_key.get(str(record.law_key))
        if document is None:
            continue
        rows = build_article_rows(
            law_id=int(document.id),
            law_key=str(document.law_key),
            law_version_id=int(version_id),
            articles=record.law_articles,
            effective_date=str(record.law_effective_date or ""),
        )
        if rows:
            law_rows.append((document, rows))
    return persist_article_rows(
        session,
        version_id=version_id,
        law_rows=law_rows,
        previous_version_id=previous_version_id,
        detected_at=detected_at,
    )


def persist_article_removals(
    session: Session,
    *,
    version_id: int,
    documents: Sequence[LawDocument],
    previous_version_id: Optional[int],
    detected_at: Optional[datetime] = None,
) -> int:
    if not previous_version_id or not documents:
        return 0
    when = detected_at or datetime.now(timezone.utc)
    previous_by_law = _previous_articles(session, previous_version_id)
    changes: List[Dict[str, Any]] = []
    for document in documents:
        for key, old in previous_by_law.get(int(document.id), {}).items():
            changes.append(
                {
                    "law_id": int(document.id),
                    "law_key": document.law_key,
                    "from_version_id": previous_version_id,
                    "to_version_id": int(version_id),
                    "article_key": key,
                    "article_type": old.article_type,
                    "article_no": old.article_no,
                    "change_type": "removed",
                    "changed_fields": ["article_content"],
                    "before_content": old.article_content,
                    "after_content": None,
                    "effective_date": old.effective_date,
                    "detected_at": when,
                }
            )
    return _insert_rows(session, LawArticleChangeEvent, changes)


def _find_raw_parquet(data_dir: Path, version: LawDatasetVersion) -> Optional[Path]:
    root = Path(data_dir).expanduser().resolve() / "raw_parquet" / version.source_type
    if root.is_dir():
        for manifest_path in root.glob("*/*/manifest.json"):
            try:
                payload = json.loads(manifest_path.read_text(encoding="utf-8"))
            except (OSError, ValueError):
                continue
            if not isinstance(payload, dict):
                continue
            if payload.get("zip_sha256") != version.zip_sha256 and payload.get(
                "raw_json_sha256"
            ) != version.raw_json_sha256:
                continue
            candidate = manifest_path.parent / "laws.parquet"
            if candidate.is_file():
                return candidate
    fallback = Path(version.parquet_path or "").expanduser()
    if fallback.is_file():
        return fallback
    return None


def backfill_article_versions(
    session_factory: sessionmaker[Session],
    data_dir: Path,
) -> Dict[str, Any]:
    """Backfill article snapshots for existing law dataset versions.

    Matching is performed by the raw Parquet manifest hashes. Versions without
    a readable raw snapshot are reported and skipped; no content is invented.
    """

    summary: Dict[str, Any] = {
        "versions": 0,
        "skipped_versions": 0,
        "missing_versions": [],
        "articles_inserted": 0,
        "article_changes_inserted": 0,
    }
    with session_factory() as session:
        versions = session.scalars(
            select(LawDatasetVersion).order_by(LawDatasetVersion.id)
        ).all()
        summary["versions"] = len(versions)
        documents_by_source: Dict[str, Dict[str, LawDocument]] = {}
        for version in versions:
            existing_count = int(
                session.scalar(
                    select(func.count())
                    .select_from(LawArticleVersion)
                    .where(LawArticleVersion.law_version_id == int(version.id))
                )
                or 0
            )
            if existing_count:
                summary["skipped_versions"] += 1
                continue
            raw_path = _find_raw_parquet(data_dir, version)
            if raw_path is None:
                summary["missing_versions"].append(
                    {"version_id": int(version.id), "source_type": version.source_type}
                )
                continue
            if version.source_type not in documents_by_source:
                documents_by_source[version.source_type] = {
                    document.law_key: document
                    for document in session.scalars(
                        select(LawDocument).where(
                            LawDocument.source_type == version.source_type
                        )
                    )
                }
            documents = documents_by_source[version.source_type]
            table = pq.read_table(
                raw_path,
                columns=["law_key", "law_articles", "law_effective_date"],
            )
            law_rows: List[Tuple[LawDocument, List[Dict[str, Any]]]] = []
            for row in table.to_pylist():
                document = documents.get(str(row.get("law_key") or ""))
                if document is None:
                    continue
                rows = build_article_rows(
                    law_id=int(document.id),
                    law_key=str(document.law_key),
                    law_version_id=int(version.id),
                    articles=row.get("law_articles") or [],
                    effective_date=str(row.get("law_effective_date") or ""),
                )
                if rows:
                    law_rows.append((document, rows))
            previous_version = session.scalars(
                select(LawDatasetVersion)
                .where(
                    LawDatasetVersion.source_type == version.source_type,
                    LawDatasetVersion.id < version.id,
                )
                .order_by(LawDatasetVersion.id.desc())
                .limit(1)
            ).first()
            previous_version_id = (
                int(previous_version.id) if previous_version is not None else None
            )
            result = persist_article_rows(
                session,
                version_id=int(version.id),
                law_rows=law_rows,
                previous_version_id=previous_version_id,
            )
            summary["articles_inserted"] += result["articles_inserted"]
            summary["article_changes_inserted"] += result[
                "article_changes_inserted"
            ]
        session.commit()
    return summary


def _version_month(version: LawDatasetVersion) -> str:
    match = re.search(r"(\d{4})[/-](\d{1,2})", str(version.update_date or ""))
    if match:
        year, month = match.groups()
        if 1 <= int(month) <= 12:
            return f"{year}{int(month):02d}"
    downloaded = version.downloaded_at
    if downloaded is not None:
        return downloaded.strftime("%Y%m")
    return ""


def check_law_version_status(
    session_factory,
    *,
    data_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Read-only per-month check of law/order article-history coverage."""

    counts = (
        select(
            LawArticleVersion.law_version_id.label("law_version_id"),
            func.count().label("article_rows"),
        )
        .group_by(LawArticleVersion.law_version_id)
        .subquery()
    )
    with session_factory() as session:
        rows = session.execute(
            select(
                LawDatasetVersion,
                func.coalesce(counts.c.article_rows, 0),
            )
            .outerjoin(
                counts,
                counts.c.law_version_id == LawDatasetVersion.id,
            )
            .order_by(LawDatasetVersion.id.desc())
        ).all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for version, article_rows in rows:
        key = _version_month(version)
        if not key:
            continue
        item = grouped.setdefault(
            key,
            {
                "month": key,
                "year": int(key[:4]),
                "month_no": int(key[4:6]),
                "version_count": 0,
                "backfilled_count": 0,
                "missing_count": 0,
                "needs_backfill_count": 0,
                "backfillable_count": 0,
                "blocked_count": 0,
                "article_rows": 0,
                "article_count": 0,
                "law_count": 0,
                "law_versions": 0,
                "order_versions": 0,
                "current": False,
                "versions": [],
            },
        )
        row_count = int(article_rows or 0)
        status = "green" if row_count > 0 else "red"
        needs_backfill = row_count == 0
        raw_path: Optional[Path] = None
        if needs_backfill and data_dir is not None:
            raw_path = _find_raw_parquet(
                Path(data_dir).expanduser().resolve(), version
            )
        raw_available = bool(raw_path)
        backfillable = needs_backfill and raw_available
        blocked = needs_backfill and data_dir is not None and not raw_available
        if row_count > 0:
            reason = "已有條文快照"
        elif data_dir is None:
            reason = "需建立；未檢查原始 Parquet"
        elif raw_available:
            reason = "可建立：找到原始 Parquet"
        else:
            reason = "無法建立：找不到原始 Parquet"
        item["version_count"] += 1
        item["backfilled_count"] += 1 if row_count > 0 else 0
        item["missing_count"] += 0 if row_count > 0 else 1
        item["needs_backfill_count"] += 1 if needs_backfill else 0
        item["backfillable_count"] += 1 if backfillable else 0
        item["blocked_count"] += 1 if blocked else 0
        item["article_rows"] += row_count
        item["article_count"] += int(version.article_count or 0)
        item["law_count"] += int(version.law_count or 0)
        if version.source_type == "law":
            item["law_versions"] += 1
        elif version.source_type == "order":
            item["order_versions"] += 1
        item["current"] = item["current"] or bool(version.is_current)
        item["versions"].append(
            {
                "version_id": int(version.id),
                "source_type": version.source_type,
                "update_date": str(version.update_date or ""),
                "downloaded_at": version.downloaded_at.isoformat()
                if version.downloaded_at
                else None,
                "is_current": bool(version.is_current),
                "status": status,
                "needs_backfill": needs_backfill,
                "backfillable": backfillable,
                "blocked": blocked,
                "raw_parquet_available": raw_available,
                "raw_parquet_path": str(raw_path) if raw_path else "",
                "reason": reason,
                "article_rows": row_count,
                "article_count": int(version.article_count or 0),
                "law_count": int(version.law_count or 0),
            }
        )

    months: List[Dict[str, Any]] = []
    summary = {"green": 0, "red": 0, "gray": 0}
    for item in grouped.values():
        if item["missing_count"] == 0:
            item["status"] = "green"
        elif item["backfilled_count"] == 0:
            item["status"] = "red"
        else:
            item["status"] = "gray"
        summary[item["status"]] += 1
        item["versions"].sort(key=lambda value: value["version_id"], reverse=True)
        months.append(item)
    months.sort(
        key=lambda item: (int(item["year"]), int(item["month_no"])),
        reverse=True,
    )
    total_versions = sum(item["version_count"] for item in months)
    backfilled_versions = sum(item["backfilled_count"] for item in months)
    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "months": months,
        "summary": summary,
        "totals": {
            "versions": total_versions,
            "backfilled_versions": backfilled_versions,
            "missing_versions": total_versions - backfilled_versions,
            "needs_backfill_versions": sum(
                item["needs_backfill_count"] for item in months
            ),
            "backfillable_versions": sum(
                item["backfillable_count"] for item in months
            ),
            "blocked_versions": sum(
                item["blocked_count"] for item in months
            ),
            "article_rows": sum(item["article_rows"] for item in months),
            "article_count": sum(item["article_count"] for item in months),
            "law_count": sum(item["law_count"] for item in months),
        },
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(
        description="Backfill law_article_versions from stored raw Parquet snapshots."
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=None,
        help="law artifact root (default: LAW_DATA_DIR or data/laws)",
    )
    parser.add_argument("--database-url", default=None, help="SQLAlchemy database URL")
    parser.add_argument(
        "--skip-init-db",
        action="store_true",
        help="do not create missing tables before running",
    )
    args = parser.parse_args(argv)

    from .config import Settings

    settings = Settings.from_env()
    if args.data_dir is not None:
        settings = settings.with_overrides(law_data_dir=args.data_dir)
    if args.database_url:
        settings = settings.with_overrides(database_url=args.database_url)
    engine = build_engine(settings.database_url)
    if settings.auto_create_schema and not args.skip_init_db:
        init_db(engine)
    session_factory = build_session_factory(engine)
    try:
        result = backfill_article_versions(session_factory, settings.law_data_dir)
    finally:
        engine.dispose()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
