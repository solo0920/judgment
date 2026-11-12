from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import NAMESPACE_URL, uuid5

from sqlalchemy import delete, func, inspect, select, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .models import (
    JudgmentDocument,
    JudgmentIndexVersion,
    JudgmentVectorIndex,
)
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

VERSION_STATUSES = {
    "building",
    "validating",
    "ready",
    "switching",
    "active",
    "retired",
    "failed",
}
ACTIVE_STATUSES = {"active"}


def recipe_version(settings: Settings, max_chars: Optional[int] = None) -> str:
    return (
        f"{settings.judgment_index_recipe_version}-"
        f"{int(max_chars or settings.judgment_index_max_chars)}"
    )


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _point_id(jid: str) -> str:
    return str(uuid5(NAMESPACE_URL, f"judgment:{jid}"))


def _version_dict(version: Optional[JudgmentIndexVersion]) -> Optional[Dict[str, Any]]:
    if version is None:
        return None
    return {
        "version_id": int(version.version_id),
        "physical_collection": version.physical_collection,
        "alias_name": version.alias_name,
        "build_mode": version.build_mode,
        "embedding_model": version.embedding_model,
        "embedding_version": version.embedding_version,
        "embedding_dimension": int(version.embedding_dimension or 0),
        "index_recipe_version": version.index_recipe_version,
        "point_id_version": version.point_id_version,
        "document_count": int(version.document_count or 0),
        "indexed_count": int(version.indexed_count or 0),
        "source_snapshot": version.source_snapshot or {},
        "validation_result": version.validation_result or {},
        "status": version.status,
        "previous_version_id": version.previous_version_id,
        "last_indexed_id": int(version.last_indexed_id or 0),
        "created_at": _iso(version.created_at),
        "validated_at": _iso(version.validated_at),
        "activated_at": _iso(version.activated_at),
        "retired_at": _iso(version.retired_at),
        "failure_reason": version.failure_reason,
    }


def get_version(
    session_factory: sessionmaker[Session], version_id: int
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        version = session.get(JudgmentIndexVersion, int(version_id))
        return _version_dict(version)


def active_version(
    session_factory: sessionmaker[Session],
    *,
    alias_name: str = "judgments_current",
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        version = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias_name,
                JudgmentIndexVersion.status.in_(ACTIVE_STATUSES),
            )
            .order_by(JudgmentIndexVersion.version_id.desc())
            .limit(1)
        ).first()
        return _version_dict(version)


def list_versions(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        rows = session.scalars(
            select(JudgmentIndexVersion)
            .order_by(JudgmentIndexVersion.version_id.desc())
            .limit(max(1, int(limit)))
        ).all()
        return [_version_dict(row) for row in rows if row is not None]


def capture_source_snapshot(
    session_factory: sessionmaker[Session],
) -> Dict[str, Any]:
    with session_factory() as session:
        max_id = int(
            session.scalar(select(func.max(JudgmentDocument.id))) or 0
        )
        count = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(
                    JudgmentDocument.full_text != "",
                    JudgmentDocument.is_current.is_(True),
                )
            )
            or 0
        )
        updated = session.scalar(
            select(func.max(JudgmentDocument.updated_at))
        )
    return {
        "max_judgment_id": max_id,
        "document_count": count,
        "captured_at": _now().isoformat(),
        "latest_document_update": updated.isoformat() if updated else None,
    }


def next_collection_name(
    session_factory: sessionmaker[Session],
    *,
    prefix: str,
) -> str:
    with session_factory() as session:
        collections = [
            str(item or "")
            for item in session.scalars(
                select(JudgmentIndexVersion.physical_collection)
            ).all()
        ]
        numbers = []
        for collection in collections:
            import re

            match = re.search(r"(\d+)$", collection)
            if match:
                numbers.append(int(match.group(1)))
        next_number = max(numbers, default=len(collections)) + 1
    return f"{prefix}_v{next_number:03d}"


def ensure_legacy_version(
    session_factory: sessionmaker[Session],
    *,
    settings: Settings,
    collection: Optional[str] = None,
) -> int:
    physical = collection or settings.judgment_vector_collection
    with session_factory() as session:
        existing = session.scalars(
            select(JudgmentIndexVersion)
            .where(JudgmentIndexVersion.physical_collection == physical)
            .limit(1)
        ).first()
        if existing is not None:
            return int(existing.version_id)
        total = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentDocument)
                .where(
                    JudgmentDocument.full_text != "",
                    JudgmentDocument.is_current.is_(True),
                )
            )
            or 0
        )
        version = JudgmentIndexVersion(
            physical_collection=physical,
            alias_name=settings.judgment_vector_alias,
            build_mode="legacy",
            embedding_model=settings.embedding_model,
            embedding_version=settings.judgment_embedding_version,
            embedding_dimension=0,
            index_recipe_version=recipe_version(settings),
            point_id_version=settings.judgment_point_id_version,
            document_count=total,
            indexed_count=0,
            source_snapshot={"legacy": True},
            validation_result={"legacy": True},
            status="active",
            activated_at=_now(),
        )
        session.add(version)
        session.commit()
        session.refresh(version)
        return int(version.version_id)


def create_version(
    session_factory: sessionmaker[Session],
    *,
    settings: Settings,
    source_snapshot: Dict[str, Any],
    physical_collection: Optional[str] = None,
    build_mode: str = "full",
    previous_version_id: Optional[int] = None,
    alias_name: Optional[str] = None,
    index_recipe_version: Optional[str] = None,
) -> Dict[str, Any]:
    alias = alias_name or settings.judgment_vector_alias
    collection = physical_collection or next_collection_name(
        session_factory, prefix=settings.judgment_vector_collection_prefix
    )
    with session_factory() as session:
        version = JudgmentIndexVersion(
            physical_collection=collection,
            alias_name=alias,
            build_mode=build_mode,
            embedding_model=settings.embedding_model,
            embedding_version=settings.judgment_embedding_version,
            embedding_dimension=0,
            index_recipe_version=index_recipe_version or recipe_version(settings),
            point_id_version=settings.judgment_point_id_version,
            document_count=int(source_snapshot.get("document_count") or 0),
            indexed_count=0,
            source_snapshot=source_snapshot,
            validation_result={},
            status="building",
            previous_version_id=previous_version_id,
            last_indexed_id=0,
        )
        session.add(version)
        session.commit()
        session.refresh(version)
        return _version_dict(version) or {}


def find_resumable_version(
    session_factory: sessionmaker[Session],
    *,
    alias_name: str,
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        version = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias_name,
                JudgmentIndexVersion.status == "building",
            )
            .order_by(JudgmentIndexVersion.version_id.desc())
            .limit(1)
        ).first()
        return _version_dict(version)


def update_version_progress(
    session_factory: sessionmaker[Session],
    *,
    version_id: int,
    indexed_count: int,
    last_indexed_id: int,
    embedding_dimension: int = 0,
) -> None:
    with session_factory() as session:
        version = session.get(JudgmentIndexVersion, int(version_id))
        if version is None:
            return
        version.indexed_count = int(indexed_count)
        version.last_indexed_id = int(last_indexed_id)
        if embedding_dimension:
            version.embedding_dimension = int(embedding_dimension)
        session.commit()


def mark_version_failed(
    session_factory: sessionmaker[Session],
    *,
    version_id: int,
    reason: str,
    validation_result: Optional[Dict[str, Any]] = None,
) -> None:
    with session_factory() as session:
        version = session.get(JudgmentIndexVersion, int(version_id))
        if version is None:
            return
        version.status = "failed"
        version.failure_reason = str(reason)[:2000]
        if validation_result is not None:
            version.validation_result = validation_result
        session.commit()


def discard_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version_id: int,
) -> Dict[str, Any]:
    """Delete a non-active building/failed/ready version and its collection."""

    with session_factory() as session:
        version = session.get(JudgmentIndexVersion, int(version_id))
        if version is None:
            raise LookupError(f"找不到索引版本：{version_id}")
        if version.status == "active":
            raise ValueError("active 版本不可直接刪除；請先啟用其他版本")
        collection = version.physical_collection
        session.execute(
            delete(JudgmentVectorIndex).where(
                JudgmentVectorIndex.version_id == version.version_id
            )
        )
        session.delete(version)
        session.commit()
    store.delete_collection(collection)
    return {
        "version_id": int(version_id),
        "deleted_collection": collection,
        "status": "discarded",
    }


def validate_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version: Dict[str, Any],
    sample_size: int = 20,
) -> Dict[str, Any]:
    version_id = int(version["version_id"])
    collection = str(version["physical_collection"])
    checks: Dict[str, Any] = {
        "version_id": version_id,
        "physical_collection": collection,
        "checked_at": _now().isoformat(),
    }
    with session_factory() as session:
        db_count = int(
            session.scalar(
                select(func.count())
                .select_from(JudgmentVectorIndex)
                .where(JudgmentVectorIndex.version_id == version_id)
            )
            or 0
        )
        sample_rows = session.scalars(
            select(JudgmentVectorIndex)
            .where(JudgmentVectorIndex.version_id == version_id)
            .order_by(JudgmentVectorIndex.jid)
            .limit(max(1, int(sample_size)))
        ).all()
        sample_jids = [row.jid for row in sample_rows]
    expected = int(version.get("document_count") or 0)
    try:
        qdrant_count = store.exact_count(collection)
        dimension = store.collection_dimension(collection)
    except QdrantError as exc:
        result = {
            **checks,
            "status": "failed",
            "expected_count": expected,
            "postgres_count": db_count,
            "qdrant_count": None,
            "dimension": None,
            "error": f"{exc.__class__.__name__}: {exc}",
        }
        mark_version_failed(
            session_factory,
            version_id=version_id,
            reason=result["error"],
            validation_result=result,
        )
        return result

    sample_payloads_ok = True
    sample_payload_jids: List[str] = []
    if sample_jids:
        try:
            points = store.retrieve_points(
                collection,
                [_point_id(jid) for jid in sample_jids],
                with_payload=True,
                with_vector=False,
            )
            sample_payload_jids = [
                str((point.get("payload") or {}).get("jid") or "")
                for point in points
            ]
            sample_payloads_ok = all(
                jid in sample_payload_jids for jid in sample_jids
            )
        except Exception:
            sample_payloads_ok = False

    expected_dimension = int(version.get("embedding_dimension") or 0)
    checks.update(
        {
            "expected_count": expected,
            "postgres_count": db_count,
            "qdrant_count": qdrant_count,
            "dimension": dimension,
            "expected_dimension": expected_dimension,
            "sample_jids": sample_jids,
            "sample_payloads_ok": sample_payloads_ok,
        }
    )
    failures = []
    if expected <= 0:
        failures.append("snapshot document_count 為 0")
    if db_count != expected:
        failures.append(f"PostgreSQL per-version count {db_count} != {expected}")
    if qdrant_count != expected:
        failures.append(f"Qdrant exact count {qdrant_count} != {expected}")
    if not dimension:
        failures.append("無法讀取 Qdrant vector dimension")
    if dimension and expected_dimension and int(dimension) != expected_dimension:
        failures.append(
            f"Qdrant dimension {dimension} != {expected_dimension}"
        )
    if not sample_payloads_ok:
        failures.append("Qdrant collection sample 讀取失敗")

    result = {
        **checks,
        "status": "ready" if not failures else "failed",
        "failures": failures,
    }
    with session_factory() as session:
        row = session.get(JudgmentIndexVersion, version_id)
        if row is not None:
            row.validation_result = result
            row.validated_at = _now()
            if failures:
                row.status = "failed"
                row.failure_reason = "; ".join(failures)[:2000]
            elif row.status == "active":
                row.failure_reason = None
            else:
                row.status = "ready"
                row.failure_reason = None
            session.commit()
    return result


def activate_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version_id: int,
    alias_name: Optional[str] = None,
) -> Dict[str, Any]:
    with session_factory() as session:
        target = session.get(JudgmentIndexVersion, int(version_id))
        if target is None:
            raise LookupError(f"找不到索引版本：{version_id}")
        if target.status not in {"ready", "active", "retired"}:
            raise ValueError(
                f"索引版本 #{version_id} 狀態為 {target.status}，不可啟用"
            )
        if (target.source_snapshot or {}).get("limited"):
            raise ValueError("部分建置（--limit）的索引版本不可啟用")
        alias = alias_name or target.alias_name
        current = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias,
                JudgmentIndexVersion.status == "active",
            )
            .order_by(JudgmentIndexVersion.version_id.desc())
            .limit(1)
        ).first()
        physical_collection = target.physical_collection
        if current is not None and current.version_id == target.version_id:
            return _version_dict(target) or {}

    # Re-check outside the session: the Qdrant alias is the actual serving
    # pointer. If the switch succeeds but the DB commit fails, reconcile will
    # report the mismatch and can repair the DB from Qdrant.
    store.switch_alias(alias, physical_collection)

    with session_factory() as session:
        target = session.get(JudgmentIndexVersion, int(version_id))
        if target is None:
            raise LookupError(f"找不到索引版本：{version_id}")
        current = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias,
                JudgmentIndexVersion.status == "active",
            )
        ).all()
        for old in current:
            if old.version_id != target.version_id:
                old.status = "retired"
                old.retired_at = _now()
        target.status = "active"
        target.alias_name = alias
        target.previous_version_id = (
            current[0].version_id if current else target.previous_version_id
        )
        target.activated_at = _now()
        session.commit()
        session.refresh(target)
        return _version_dict(target) or {}


def rollback_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    alias_name: Optional[str] = None,
) -> Dict[str, Any]:
    alias = alias_name or "judgments_current"
    with session_factory() as session:
        current = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias,
                JudgmentIndexVersion.status == "active",
            )
            .order_by(JudgmentIndexVersion.version_id.desc())
            .limit(1)
        ).first()
        if current is None or not current.previous_version_id:
            raise LookupError("目前沒有可回滾的上一個索引版本")
        previous = session.get(
            JudgmentIndexVersion, int(current.previous_version_id)
        )
        if previous is None or previous.status not in {"retired", "ready", "active"}:
            raise LookupError("上一個索引版本不存在或狀態不可回滾")
        previous_id = previous.version_id
        previous_collection = previous.physical_collection
    store.switch_alias(alias, previous_collection)
    with session_factory() as session:
        current = session.scalars(
            select(JudgmentIndexVersion)
            .where(
                JudgmentIndexVersion.alias_name == alias,
                JudgmentIndexVersion.status == "active",
            )
        ).all()
        for old in current:
            old.status = "retired"
            old.retired_at = _now()
        previous = session.get(JudgmentIndexVersion, int(previous_id))
        if previous is None:
            raise LookupError("回滾目標不存在")
        previous.status = "active"
        previous.alias_name = alias
        previous.activated_at = _now()
        session.commit()
        session.refresh(previous)
        return _version_dict(previous) or {}


def reconcile_alias(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    alias_name: Optional[str] = None,
    repair: bool = False,
) -> Dict[str, Any]:
    alias = alias_name or "judgments_current"
    qdrant_target = store.get_alias(alias)
    active = active_version(session_factory, alias_name=alias)
    db_target = active["physical_collection"] if active else None
    consistent = qdrant_target == db_target
    result = {
        "alias_name": alias,
        "qdrant_target": qdrant_target,
        "postgres_target": db_target,
        "consistent": consistent,
    }
    if not consistent and repair and qdrant_target:
        with session_factory() as session:
            target = session.scalars(
                select(JudgmentIndexVersion)
                .where(JudgmentIndexVersion.physical_collection == qdrant_target)
                .limit(1)
            ).first()
            if target is not None:
                for old in session.scalars(
                    select(JudgmentIndexVersion).where(
                        JudgmentIndexVersion.alias_name == alias,
                        JudgmentIndexVersion.status == "active",
                    )
                ).all():
                    old.status = "retired"
                    old.retired_at = _now()
                target.status = "active"
                target.alias_name = alias
                target.activated_at = target.activated_at or _now()
                session.commit()
                result["repaired"] = True
                result["postgres_target"] = target.physical_collection
    return result


def serving_collection(
    session_factory: sessionmaker[Session],
    settings: Settings,
    *,
    store: Optional[QdrantStore] = None,
) -> Dict[str, Any]:
    """Resolve the collection used for retrieval and coverage.

    Search should use the alias when available; coverage should use the active
    physical collection because PostgreSQL rows are keyed by physical name.
    """

    alias = settings.judgment_vector_alias
    active = active_version(session_factory, alias_name=alias)
    physical = active["physical_collection"] if active else None
    alias_target = None
    if store is not None and store.configured:
        try:
            alias_target = store.get_alias(alias)
        except Exception:
            alias_target = None
    if alias_target:
        physical = alias_target
    return {
        "alias": alias,
        "alias_target": alias_target,
        "physical": physical or settings.judgment_vector_collection,
        "active_version": active,
        "uses_alias": bool(alias_target),
    }


def ensure_index_version_schema(engine: Engine) -> None:
    """Create version table and migrate the legacy vector index in place.

    The migration is intentionally idempotent. Fresh SQLite databases created
    from SQLAlchemy models already have the composite primary key and skip the
    PostgreSQL-specific ALTER statements.
    """

    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "judgment_index_versions" not in tables:
        return
    if "judgment_vector_index" not in tables:
        return
    columns = {
        column["name"]
        for column in inspector.get_columns("judgment_vector_index")
    }
    if engine.dialect.name != "postgresql":
        if "version_id" not in columns:
            logger.warning(
                "SQLite legacy judgment_vector_index 尚未支援自動版本化 migration"
            )
        return

    with engine.begin() as connection:
        for statement in (
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS version_id INTEGER",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS embedding_version VARCHAR(128) "
            "NOT NULL DEFAULT ''",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS index_recipe_version VARCHAR(128) "
            "NOT NULL DEFAULT ''",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS source_year VARCHAR(8) "
            "NOT NULL DEFAULT ''",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS index_text_hash VARCHAR(64) "
            "NOT NULL DEFAULT ''",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS payload_hash VARCHAR(64) "
            "NOT NULL DEFAULT ''",
            "ALTER TABLE judgment_vector_index "
            "ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMPTZ",
        ):
            connection.execute(text(statement))

        version_count = int(
            connection.execute(
                text("SELECT count(*) FROM judgment_index_versions")
            ).scalar()
            or 0
        )
        legacy_rows = int(
            connection.execute(
                text(
                    "SELECT count(*) FROM judgment_vector_index "
                    "WHERE version_id IS NULL"
                )
            ).scalar()
            or 0
        )
        if version_count == 0 and legacy_rows > 0:
            row = connection.execute(
                text(
                    "SELECT collection, model, MAX(dimensions) AS dimensions, "
                    "count(*) AS rows FROM judgment_vector_index "
                    "GROUP BY collection, model ORDER BY rows DESC LIMIT 1"
                )
            ).mappings().first()
            if row is not None:
                total = int(
                    connection.execute(
                        text(
                            "SELECT count(*) FROM judgment_documents "
                            "WHERE full_text <> ''"
                        )
                    ).scalar()
                    or 0
                )
                alias = os.getenv(
                    "JUDGMENT_VECTOR_ALIAS", "judgments_current"
                ).strip() or "judgments_current"
                model = str(row.get("model") or "")
                recipe = (
                    os.getenv(
                        "JUDGMENT_INDEX_RECIPE_VERSION", "doc-head-tail-v1"
                    ).strip()
                    or "doc-head-tail-v1"
                ) + "-" + (
                    os.getenv("JUDGMENT_INDEX_MAX_CHARS", "1600").strip()
                    or "1600"
                )
                version_id = int(
                    connection.execute(
                        text(
                            "INSERT INTO judgment_index_versions "
                            "(physical_collection, alias_name, build_mode, "
                            "embedding_model, embedding_version, "
                            "embedding_dimension, index_recipe_version, "
                            "point_id_version, document_count, indexed_count, "
                            "source_snapshot, validation_result, status, "
                            "last_indexed_id, created_at, activated_at) VALUES "
                            "(:collection, :alias, 'legacy', :model, :embedding_version, "
                            ":dimension, :recipe, 'jid-uuid5-v1', :total, :indexed, "
                            "CAST(:snapshot AS jsonb), CAST(:validation AS jsonb), "
                            "'active', :last_indexed_id, now(), now()) RETURNING version_id"
                        ),
                        {
                            "collection": row.get("collection") or "judgment_documents",
                            "alias": alias,
                            "model": model,
                            "embedding_version": os.getenv(
                                "JUDGMENT_EMBEDDING_VERSION", f"{model}@v1"
                            ).strip()
                            or f"{model}@v1",
                            "dimension": int(row.get("dimensions") or 0),
                            "recipe": recipe,
                            "total": total,
                            "indexed": legacy_rows,
                            "last_indexed_id": int(
                                connection.execute(
                                    text(
                                        "SELECT max(id) FROM judgment_documents"
                                    )
                                ).scalar()
                                or 0
                            ),
                            "snapshot": '{"legacy": true}',
                            "validation": '{"legacy": true}',
                        },
                    ).scalar()
                )
                connection.execute(
                    text(
                        "UPDATE judgment_vector_index SET version_id = :version_id "
                        "WHERE version_id IS NULL"
                    ),
                    {"version_id": version_id},
                )

        connection.execute(
            text(
                "UPDATE judgment_vector_index v "
                "SET embedding_version = COALESCE(NULLIF(v.embedding_version, ''), iv.embedding_version), "
                "index_recipe_version = COALESCE(NULLIF(v.index_recipe_version, ''), iv.index_recipe_version), "
                "source_year = COALESCE(NULLIF(v.source_year, ''), substring(d.jdate, 1, 4)), "
                "source_updated_at = COALESCE(v.source_updated_at, d.updated_at) "
                "FROM judgment_index_versions iv, judgment_documents d "
                "WHERE v.version_id = iv.version_id AND d.jid = v.jid "
                "AND (v.embedding_version = '' OR v.index_recipe_version = '' "
                "OR v.source_year = '' OR v.source_updated_at IS NULL)"
            )
        )
        # Make version_id non-null before installing the composite PK.
        remaining_null = int(
            connection.execute(
                text(
                    "SELECT count(*) FROM judgment_vector_index "
                    "WHERE version_id IS NULL"
                )
            ).scalar()
            or 0
        )
        if remaining_null == 0:
            connection.execute(
                text(
                    "ALTER TABLE judgment_vector_index "
                    "ALTER COLUMN version_id SET NOT NULL"
                )
            )

        pk = connection.execute(
            text(
                "SELECT conname, pg_get_constraintdef(oid) AS definition "
                "FROM pg_constraint WHERE conrelid = "
                "'judgment_vector_index'::regclass AND contype = 'p'"
            )
        ).mappings().first()
        if pk and "version_id" not in str(pk.get("definition") or ""):
            connection.execute(
                text(
                    "ALTER TABLE judgment_vector_index "
                    f"DROP CONSTRAINT {pk['conname']}"
                )
            )
            connection.execute(
                text(
                    "ALTER TABLE judgment_vector_index "
                    "ADD CONSTRAINT judgment_vector_index_pkey "
                    "PRIMARY KEY (jid, version_id)"
                )
            )
        fk_exists = int(
            connection.execute(
                text(
                    "SELECT count(*) FROM pg_constraint "
                    "WHERE conrelid = 'judgment_vector_index'::regclass "
                    "AND contype = 'f' AND confrelid = "
                    "'judgment_index_versions'::regclass"
                )
            ).scalar()
            or 0
        )
        if fk_exists == 0:
            connection.execute(
                text(
                    "ALTER TABLE judgment_vector_index "
                    "ADD CONSTRAINT fk_judgment_vector_index_version "
                    "FOREIGN KEY (version_id) "
                    "REFERENCES judgment_index_versions(version_id)"
                )
            )
        connection.execute(
            text(
                "CREATE INDEX IF NOT EXISTS "
                "ix_judgment_vector_index_version "
                "ON judgment_vector_index (version_id)"
            )
        )
