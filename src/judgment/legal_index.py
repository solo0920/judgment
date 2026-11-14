from __future__ import annotations

import argparse
import hashlib
import json
import logging
import re
import time
from dataclasses import dataclass, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Iterable, List, Optional, Sequence, Tuple
from uuid import NAMESPACE_URL, uuid5

import pyarrow.parquet as pq
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from .config import Settings
from .db import build_engine, build_session_factory, init_db
from .embeddings import EmbeddingError, OllamaEmbedder
from .law_rag import _latest_parquet_files
from .models import LegalArticleIndexVersion
from .processing_state import ProcessingStateStore, parent_run_id
from .vector_store import QdrantError, QdrantStore

logger = logging.getLogger(__name__)

PARQUET_COLUMNS = [
    "source_type",
    "law_key",
    "law_name",
    "law_level",
    "law_category",
    "law_url",
    "law_modified_date",
    "law_effective_date",
    "article_count",
    "law_articles",
]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: Optional[datetime]) -> Optional[str]:
    return value.isoformat() if value else None


def _text(value: Any) -> str:
    return str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()


def _article_key(article_type: str, article_no: str) -> str:
    return re.sub(r"\s+", "", f"{article_type}:{article_no}")


def _law_key_id(source_type: str, law_key: str) -> str:
    return f"{source_type}:{law_key}"


@dataclass(frozen=True)
class LegalArticleRecord:
    source_type: str
    law_key: str
    law_name: str
    law_level: str
    law_category: str
    law_url: str
    law_modified_date: str
    law_effective_date: str
    article_type: str
    article_no: str
    article_index: int
    article_content: str
    content_hash: str
    law_hash: str

    @property
    def law_key_id(self) -> str:
        return _law_key_id(self.source_type, self.law_key)

    @property
    def article_key(self) -> str:
        return _article_key(self.article_type, self.article_no)

    @property
    def point_id(self) -> str:
        return str(
            uuid5(
                NAMESPACE_URL,
                "legal-article:"
                f"{self.source_type}:{self.law_key}:{self.article_key}",
            )
        )


def _content_hash(value: str) -> str:
    return hashlib.sha256(str(value or "").encode("utf-8")).hexdigest()


def _law_hash(
    *,
    source_type: str,
    law_key: str,
    law_name: str,
    law_level: str,
    law_category: str,
    law_url: str,
    law_modified_date: str,
    law_effective_date: str,
    articles: Sequence[Tuple[str, str, int, str]],
) -> str:
    digest = hashlib.sha256()
    for value in (
        source_type,
        law_key,
        law_name,
        law_level,
        law_category,
        law_url,
        law_modified_date,
        law_effective_date,
    ):
        digest.update(str(value or "").encode("utf-8"))
        digest.update(b"\x1f")
    for article_type, article_no, article_index, content in sorted(articles):
        digest.update(str(article_type or "").encode("utf-8"))
        digest.update(b"\x1e")
        digest.update(str(article_no or "").encode("utf-8"))
        digest.update(b"\x1e")
        digest.update(str(article_index).encode("utf-8"))
        digest.update(b"\x1e")
        digest.update(str(content or "").encode("utf-8"))
        digest.update(b"\x1d")
    return digest.hexdigest()


def read_legal_articles(
    law_data_dir: Path,
    *,
    source_types: Sequence[str] = ("law", "order"),
    limit: Optional[int] = None,
) -> List[LegalArticleRecord]:
    """Read current law/order articles from the latest Parquet snapshots.

    Chapter headings and empty article numbers are skipped because they are
    navigation text, not retrievable provisions.  This keeps the index aligned
    with the 222,124 actual articles in the current dataset.
    """

    files = _latest_parquet_files(Path(law_data_dir))
    wanted = {str(value) for value in source_types if str(value)}
    records: List[LegalArticleRecord] = []
    for source_type, path in sorted(files.items()):
        if wanted and source_type not in wanted:
            continue
        try:
            table = pq.read_table(path, columns=PARQUET_COLUMNS)
        except Exception as exc:
            logger.warning("讀取法規 Parquet 失敗 %s: %s", path, exc)
            continue
        for row in table.to_pylist():
            law_key = _text(row.get("law_key"))
            law_name = _text(row.get("law_name"))
            if not law_key or not law_name:
                continue
            articles: List[Tuple[str, str, int, str]] = []
            usable: List[Tuple[str, str, int, str]] = []
            for index, article in enumerate(row.get("law_articles") or []):
                if not isinstance(article, dict):
                    continue
                article_type = _text(article.get("article_type"))
                article_no = _text(article.get("article_no"))
                content = _text(article.get("article_content"))
                if not article_no or not content:
                    continue
                articles.append((article_type, article_no, index, content))
                usable.append((article_type, article_no, index, content))
            if not usable:
                continue
            law_hash = _law_hash(
                source_type=source_type,
                law_key=law_key,
                law_name=law_name,
                law_level=_text(row.get("law_level")),
                law_category=_text(row.get("law_category")),
                law_url=_text(row.get("law_url")),
                law_modified_date=_text(row.get("law_modified_date")),
                law_effective_date=_text(row.get("law_effective_date")),
                articles=articles,
            )
            for article_type, article_no, article_index, content in usable:
                records.append(
                    LegalArticleRecord(
                        source_type=source_type,
                        law_key=law_key,
                        law_name=law_name,
                        law_level=_text(row.get("law_level")),
                        law_category=_text(row.get("law_category")),
                        law_url=_text(row.get("law_url")),
                        law_modified_date=_text(
                            row.get("law_modified_date")
                        ),
                        law_effective_date=_text(
                            row.get("law_effective_date")
                        ),
                        article_type=article_type,
                        article_no=article_no,
                        article_index=article_index,
                        article_content=content,
                        content_hash=_content_hash(content),
                        law_hash=law_hash,
                    )
                )
                if limit is not None and len(records) >= int(limit):
                    return records
    return records


def build_source_snapshot(
    records: Sequence[LegalArticleRecord],
) -> Dict[str, Any]:
    laws: Dict[str, Dict[str, Any]] = {}
    for record in records:
        entry = laws.setdefault(
            record.law_key_id,
            {
                "hash": record.law_hash,
                "articles": 0,
                "source_type": record.source_type,
                "law_key": record.law_key,
                "law_name": record.law_name,
            },
        )
        entry["articles"] = int(entry.get("articles") or 0) + 1
    digest = hashlib.sha256()
    for key in sorted(laws):
        digest.update(key.encode("utf-8"))
        digest.update(b"\x1e")
        digest.update(str(laws[key].get("hash") or "").encode("utf-8"))
        digest.update(b"\x1f")
    return {
        "snapshot_hash": digest.hexdigest(),
        "law_count": len(laws),
        "article_count": len(records),
        "laws": laws,
        "captured_at": _now().isoformat(),
    }


def index_text(
    record: LegalArticleRecord,
    *,
    max_chars: int = 4000,
) -> str:
    heading = " ".join(
        value
        for value in (
            record.law_name,
            record.law_level,
            record.law_category,
            record.article_no,
        )
        if value
    )
    text = f"{heading}\n{record.article_content}"
    return text[: max(200, int(max_chars))]


def _payload(
    record: LegalArticleRecord,
    *,
    settings: Settings,
    indexed_at: str,
    max_chars: int,
) -> Dict[str, Any]:
    content = record.article_content
    if max_chars > 0:
        content = content[:max_chars]
    return {
        "source_type": record.source_type,
        "law_key": record.law_key,
        "law_name": record.law_name,
        "law_level": record.law_level,
        "law_category": record.law_category,
        "law_url": record.law_url,
        "law_modified_date": record.law_modified_date,
        "law_effective_date": record.law_effective_date,
        "article_type": record.article_type,
        "article_no": record.article_no,
        "article_index": record.article_index,
        "article_content": content,
        "content_hash": record.content_hash,
        "law_hash": record.law_hash,
        "embedding_model": settings.embedding_model,
        "embedding_version": settings.legal_article_embedding_version,
        "index_recipe_version": settings.legal_article_index_recipe_version,
        "indexed_at": indexed_at,
    }


def _version_dict(
    version: Optional[LegalArticleIndexVersion],
) -> Optional[Dict[str, Any]]:
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
        "law_count": int(version.law_count or 0),
        "article_count": int(version.article_count or 0),
        "indexed_count": int(version.indexed_count or 0),
        "source_snapshot": version.source_snapshot or {},
        "validation_result": version.validation_result or {},
        "status": version.status,
        "previous_version_id": version.previous_version_id,
        "created_at": _iso(version.created_at),
        "validated_at": _iso(version.validated_at),
        "activated_at": _iso(version.activated_at),
        "retired_at": _iso(version.retired_at),
        "failure_reason": version.failure_reason,
    }


def _snapshot_summary(snapshot: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "snapshot_hash": snapshot.get("snapshot_hash"),
        "law_count": snapshot.get("law_count"),
        "article_count": snapshot.get("article_count"),
        "captured_at": snapshot.get("captured_at"),
    }


def _public_version(
    version: Optional[Dict[str, Any]],
) -> Optional[Dict[str, Any]]:
    if version is None:
        return None
    result = dict(version)
    result["source_snapshot"] = _snapshot_summary(
        version.get("source_snapshot") or {}
    )
    return result


def get_legal_version(
    session_factory: sessionmaker[Session], version_id: int
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        return _version_dict(
            session.get(LegalArticleIndexVersion, int(version_id))
        )


def active_legal_version(
    session_factory: sessionmaker[Session],
    *,
    alias_name: str = "legal_articles_current",
) -> Optional[Dict[str, Any]]:
    with session_factory() as session:
        version = session.scalars(
            select(LegalArticleIndexVersion)
            .where(
                LegalArticleIndexVersion.alias_name == alias_name,
                LegalArticleIndexVersion.status == "active",
            )
            .order_by(LegalArticleIndexVersion.version_id.desc())
            .limit(1)
        ).first()
        return _version_dict(version)


def list_legal_versions(
    session_factory: sessionmaker[Session],
    *,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    with session_factory() as session:
        rows = session.scalars(
            select(LegalArticleIndexVersion)
            .order_by(LegalArticleIndexVersion.version_id.desc())
            .limit(max(1, int(limit)))
        ).all()
        return [
            item
            for item in (
                _public_version(_version_dict(row)) for row in rows
            )
            if item is not None
        ]


def next_collection_name(
    session_factory: sessionmaker[Session],
    *,
    prefix: str,
    store: Optional[QdrantStore] = None,
) -> str:
    names: List[str] = []
    with session_factory() as session:
        names.extend(
            str(value or "")
            for value in session.scalars(
                select(LegalArticleIndexVersion.physical_collection)
            ).all()
        )
    if store is not None and store.configured:
        try:
            names.extend(store.list_collections())
        except Exception:
            pass
    numbers: List[int] = []
    pattern = re.compile(rf"^{re.escape(prefix)}_v(\d+)$")
    for name in names:
        match = pattern.match(name)
        if match:
            numbers.append(int(match.group(1)))
    number = max(numbers, default=0) + 1
    return f"{prefix}_v{number:03d}"


def create_legal_version(
    session_factory: sessionmaker[Session],
    *,
    settings: Settings,
    physical_collection: str,
    source_snapshot: Dict[str, Any],
    build_mode: str,
    previous_version_id: Optional[int] = None,
    alias_name: Optional[str] = None,
) -> Dict[str, Any]:
    with session_factory() as session:
        version = LegalArticleIndexVersion(
            physical_collection=physical_collection,
            alias_name=alias_name or settings.legal_article_vector_alias,
            build_mode=build_mode,
            embedding_model=settings.embedding_model,
            embedding_version=settings.legal_article_embedding_version,
            embedding_dimension=0,
            index_recipe_version=(
                settings.legal_article_index_recipe_version
            ),
            point_id_version=settings.legal_article_point_id_version,
            law_count=int(source_snapshot.get("law_count") or 0),
            article_count=int(source_snapshot.get("article_count") or 0),
            indexed_count=0,
            source_snapshot=source_snapshot,
            validation_result={},
            status="building",
            previous_version_id=previous_version_id,
        )
        session.add(version)
        session.commit()
        session.refresh(version)
        return _version_dict(version) or {}


def update_legal_version_progress(
    session_factory: sessionmaker[Session],
    *,
    version_id: int,
    indexed_count: int,
    embedding_dimension: int = 0,
) -> None:
    with session_factory() as session:
        version = session.get(LegalArticleIndexVersion, int(version_id))
        if version is None:
            return
        version.indexed_count = int(indexed_count)
        if embedding_dimension:
            version.embedding_dimension = int(embedding_dimension)
        session.commit()


def mark_legal_version_failed(
    session_factory: sessionmaker[Session],
    *,
    version_id: int,
    reason: str,
    validation_result: Optional[Dict[str, Any]] = None,
) -> None:
    with session_factory() as session:
        version = session.get(LegalArticleIndexVersion, int(version_id))
        if version is None:
            return
        version.status = "failed"
        version.failure_reason = str(reason)[:2000]
        if validation_result is not None:
            version.validation_result = validation_result
        session.commit()


def activate_legal_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version_id: int,
    alias_name: str,
) -> Dict[str, Any]:
    version = get_legal_version(session_factory, version_id)
    if version is None:
        raise LookupError(f"找不到法規索引版本：{version_id}")
    if version.get("status") == "failed":
        raise ValueError("驗證失敗的法規索引版本不可啟用")
    collection = str(version["physical_collection"])
    store.switch_alias(alias_name, collection)
    with session_factory() as session:
        target = session.get(LegalArticleIndexVersion, int(version_id))
        if target is None:
            raise LookupError(f"找不到法規索引版本：{version_id}")
        now = _now()
        for other in session.scalars(
            select(LegalArticleIndexVersion).where(
                LegalArticleIndexVersion.alias_name == alias_name,
                LegalArticleIndexVersion.status == "active",
                LegalArticleIndexVersion.version_id != int(version_id),
            )
        ).all():
            other.status = "retired"
            other.retired_at = now
        target.status = "active"
        target.activated_at = now
        target.retired_at = None
        session.commit()
    return get_legal_version(session_factory, version_id) or {}


def rollback_legal_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    alias_name: str,
) -> Dict[str, Any]:
    active = active_legal_version(session_factory, alias_name=alias_name)
    target: Optional[Dict[str, Any]] = None
    if active and active.get("previous_version_id"):
        target = get_legal_version(
            session_factory, int(active["previous_version_id"])
        )
    if target is None:
        with session_factory() as session:
            row = session.scalars(
                select(LegalArticleIndexVersion)
                .where(
                    LegalArticleIndexVersion.alias_name == alias_name,
                    LegalArticleIndexVersion.status.in_(
                        ("ready", "retired")
                    ),
                )
                .order_by(LegalArticleIndexVersion.version_id.desc())
                .limit(1)
            ).first()
            target = _version_dict(row)
    if target is None:
        raise LookupError("沒有可回復的法規索引版本")
    return activate_legal_version(
        session_factory,
        store=store,
        version_id=int(target["version_id"]),
        alias_name=alias_name,
    )


def discard_legal_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version_id: int,
) -> Dict[str, Any]:
    with session_factory() as session:
        version = session.get(LegalArticleIndexVersion, int(version_id))
        if version is None:
            raise LookupError(f"找不到法規索引版本：{version_id}")
        if version.status == "active":
            raise ValueError("active 版本不可直接刪除；請先啟用其他版本")
        collection = version.physical_collection
        session.delete(version)
        session.commit()
    store.delete_collection(collection)
    return {
        "version_id": int(version_id),
        "deleted_collection": collection,
        "status": "discarded",
    }


def _ensure_payload_indexes(store: QdrantStore, collection: str) -> None:
    for field in ("source_type", "law_key", "law_name", "law_category"):
        try:
            store.ensure_payload_index(collection, field, "keyword")
        except Exception as exc:
            logger.debug("payload index %s failed: %s", field, exc)


def _batches(
    values: Sequence[LegalArticleRecord], size: int
) -> Iterable[Sequence[LegalArticleRecord]]:
    batch_size = max(1, int(size))
    for start in range(0, len(values), batch_size):
        yield values[start : start + batch_size]


def _embed_texts(
    embedder: OllamaEmbedder,
    texts: Sequence[str],
) -> List[List[float]]:
    """Embed a batch, splitting it when the provider rejects its length.

    Ollama's bge-m3 endpoint accepts long single articles but can reject a
    batch that combines several long provisions with HTTP 413.  Recursively
    split the batch, and as a last resort truncate one oversized article.
    """

    try:
        return embedder.embed(texts)
    except EmbeddingError:
        if len(texts) > 1:
            middle = len(texts) // 2
            logger.debug(
                "embedding batch of %s rejected; splitting into %s + %s",
                len(texts),
                middle,
                len(texts) - middle,
            )
            return _embed_texts(
                embedder, texts[:middle]
            ) + _embed_texts(embedder, texts[middle:])
        text = str(texts[0] if texts else "")
        if len(text) <= 800:
            raise
        logger.warning(
            "單筆法規條文 embedding 長度過大，截斷後重試（%s chars）",
            len(text),
        )
        return _embed_texts(embedder, [text[: max(400, len(text) // 2)]])


def _index_records(
    *,
    settings: Settings,
    store: QdrantStore,
    embedder: OllamaEmbedder,
    collection: str,
    records: Sequence[LegalArticleRecord],
    batch_size: int,
    expected_dimension: int = 0,
    indexed_so_far: int = 0,
    on_progress: Optional[Callable[[int, int], None]] = None,
) -> Tuple[int, int]:
    indexed = int(indexed_so_far)
    dimension = int(expected_dimension or 0)
    ready = store.collection_info(collection) is not None
    total = indexed + len(records)
    indexed_at = _now().isoformat()
    max_chars = max(1, int(settings.legal_article_payload_max_chars))
    for batch in _batches(records, batch_size):
        texts = [
            index_text(
                record,
                max_chars=settings.legal_article_index_max_chars,
            )
            for record in batch
        ]
        vectors = _embed_texts(embedder, texts)
        if len(vectors) != len(batch):
            raise EmbeddingError("Embedding 回傳數量與法規條文批次不符")
        batch_dimension = len(vectors[0]) if vectors else 0
        if not batch_dimension:
            raise EmbeddingError("Embedding 回傳空向量")
        if dimension and batch_dimension != dimension:
            raise EmbeddingError(
                f"法規索引向量維度不一致：{dimension} != {batch_dimension}"
            )
        dimension = batch_dimension
        if not ready:
            store.ensure_collection(collection, size=dimension)
            _ensure_payload_indexes(store, collection)
            ready = True
        points = [
            {
                "id": record.point_id,
                "vector": vector,
                "payload": _payload(
                    record,
                    settings=settings,
                    indexed_at=indexed_at,
                    max_chars=max_chars,
                ),
            }
            for record, vector in zip(batch, vectors)
        ]
        store.upsert(collection, points, wait=True)
        indexed += len(points)
        if on_progress is not None:
            on_progress(indexed, total)
        if indexed == total or indexed % 1024 < len(points):
            logger.info("法規條文索引進度：%s / %s", indexed, total)
    return indexed, dimension


def _law_filter(source_type: str, law_key: str) -> Dict[str, Any]:
    return {
        "must": [
            {"key": "source_type", "match": {"value": source_type}},
            {"key": "law_key", "match": {"value": law_key}},
        ]
    }


def _split_law_key_id(value: str) -> Tuple[str, str]:
    source_type, _, law_key = str(value or "").partition(":")
    return source_type, law_key


def _diff_snapshots(
    previous: Dict[str, Any],
    current: Dict[str, Any],
) -> Tuple[List[str], List[str]]:
    old_laws = previous.get("laws") or {}
    new_laws = current.get("laws") or {}
    changed = [
        key
        for key, entry in new_laws.items()
        if (old_laws.get(key) or {}).get("hash") != (entry or {}).get("hash")
    ]
    removed = [key for key in old_laws if key not in new_laws]
    return changed, removed


def _expected_incremental_count(
    previous: Dict[str, Any],
    current: Dict[str, Any],
    changed: Sequence[str],
    removed: Sequence[str],
) -> Optional[int]:
    old_laws = previous.get("laws") or {}
    new_laws = current.get("laws") or {}
    total = previous.get("article_count")
    if total is None:
        return None
    expected = int(total)
    for key in list(changed) + list(removed):
        old_entry = old_laws.get(key) or {}
        if "articles" in old_entry:
            expected -= int(old_entry.get("articles") or 0)
    for key in changed:
        expected += int((new_laws.get(key) or {}).get("articles") or 0)
    return max(0, expected)


def validate_legal_version(
    session_factory: sessionmaker[Session],
    *,
    store: QdrantStore,
    version: Dict[str, Any],
    expected_count: Optional[int] = None,
    sample_records: Optional[Sequence[LegalArticleRecord]] = None,
) -> Dict[str, Any]:
    version_id = int(version["version_id"])
    collection = str(version["physical_collection"])
    checks: Dict[str, Any] = {
        "version_id": version_id,
        "physical_collection": collection,
        "checked_at": _now().isoformat(),
    }
    expected = int(
        expected_count
        if expected_count is not None
        else version.get("article_count") or 0
    )
    try:
        qdrant_count = store.exact_count(collection)
        dimension = store.collection_dimension(collection)
    except Exception as exc:
        result = {
            **checks,
            "status": "failed",
            "expected_count": expected,
            "qdrant_count": None,
            "dimension": None,
            "error": f"{exc.__class__.__name__}: {exc}",
        }
        mark_legal_version_failed(
            session_factory,
            version_id=version_id,
            reason=result["error"],
            validation_result=result,
        )
        return result

    sample_ok = True
    sample_ids: List[str] = []
    if sample_records:
        sample = list(sample_records[:10])
        sample_ids = [record.point_id for record in sample]
        try:
            points = store.retrieve_points(
                collection,
                sample_ids,
                with_payload=True,
                with_vector=False,
            )
            found = {str(point.get("id") or "") for point in points}
            sample_ok = all(point_id in found for point_id in sample_ids)
        except Exception:
            sample_ok = False

    expected_dimension = int(version.get("embedding_dimension") or 0)
    ok = (
        qdrant_count == expected
        and sample_ok
        and (
            not expected_dimension
            or not dimension
            or int(dimension) == int(expected_dimension)
        )
    )
    result = {
        **checks,
        "status": "passed" if ok else "failed",
        "expected_count": expected,
        "qdrant_count": qdrant_count,
        "dimension": dimension,
        "sample_ok": sample_ok,
        "sample_ids": sample_ids[:5],
    }
    with session_factory() as session:
        row = session.get(LegalArticleIndexVersion, version_id)
        if row is not None:
            row.validation_result = result
            row.validated_at = _now()
            if ok:
                row.status = "ready"
            else:
                row.status = "failed"
                row.failure_reason = (
                    f"validation failed: count {qdrant_count} != {expected}"
                )
            session.commit()
    return result


def build_legal_article_index(
    *,
    session_factory: sessionmaker[Session],
    settings: Settings,
    store: QdrantStore,
    embedder: Optional[OllamaEmbedder] = None,
    records: Optional[Sequence[LegalArticleRecord]] = None,
    batch_size: Optional[int] = None,
    mode: str = "full",
    auto_activate: bool = True,
    if_changed: bool = False,
    limit: Optional[int] = None,
    dry_run: bool = False,
    recreate: bool = False,
    on_progress: Optional[Callable[[int, int], None]] = None,
) -> Dict[str, Any]:
    """Build or incrementally update the law/order article vector index."""

    mode = "incremental" if str(mode or "").lower() == "incremental" else "full"
    if mode == "incremental" and limit is not None:
        raise ValueError("--limit 不可搭配 --incremental，以免誤刪未載入的法規")
    if records is None:
        records = read_legal_articles(
            Path(settings.law_data_dir),
            limit=limit,
        )
    else:
        records = list(records)
        if limit is not None:
            records = records[: int(limit)]
    snapshot = build_source_snapshot(records)
    active = active_legal_version(
        session_factory, alias_name=settings.legal_article_vector_alias
    )
    alias_target = None
    if store.configured:
        try:
            alias_target = store.get_alias(
                settings.legal_article_vector_alias
            )
        except Exception:
            alias_target = None
    if (
        if_changed
        and active is not None
        and alias_target == active.get("physical_collection")
        and (active.get("source_snapshot") or {}).get("snapshot_hash")
        == snapshot["snapshot_hash"]
    ):
        return {
            "status": "unchanged",
            "version": _public_version(active),
            "snapshot": _snapshot_summary(snapshot),
        }

    build_mode = "full"
    changed: List[str] = []
    removed: List[str] = []
    if mode == "incremental" and active is not None:
        previous_snapshot = active.get("source_snapshot") or {}
        compatible = (
            active.get("embedding_model") == settings.embedding_model
            and active.get("embedding_version")
            == settings.legal_article_embedding_version
            and active.get("index_recipe_version")
            == settings.legal_article_index_recipe_version
            and active.get("point_id_version")
            == settings.legal_article_point_id_version
            and bool(previous_snapshot.get("laws"))
        )
        if compatible:
            build_mode = "incremental"
            changed, removed = _diff_snapshots(previous_snapshot, snapshot)

    if dry_run:
        return {
            "status": "dry_run",
            "mode": build_mode,
            "law_count": snapshot["law_count"],
            "article_count": snapshot["article_count"],
            "changed_laws": len(changed),
            "removed_laws": len(removed),
            "active_version": _public_version(active),
            "snapshot": _snapshot_summary(snapshot),
        }

    if (
        build_mode == "incremental"
        and not changed
        and not removed
        and active is not None
        and alias_target == active.get("physical_collection")
    ):
        return {
            "status": "unchanged",
            "version": _public_version(active),
            "snapshot": _snapshot_summary(snapshot),
        }

    if not store.configured:
        raise QdrantError("QDRANT_URL 未設定")
    if embedder is None:
        embedder = OllamaEmbedder(
            settings.embedding_url,
            settings.embedding_model,
            timeout=settings.embedding_timeout_seconds,
            query_timeout=settings.embedding_query_timeout_seconds,
            health_timeout=settings.embedding_health_timeout_seconds,
            fallback_base_url=settings.embedding_fallback_url,
            fallback_base_urls=settings.embedding_failover_urls,
        )
    if not embedder.configured:
        raise EmbeddingError("EMBEDDING_URL 未設定")

    collection = next_collection_name(
        session_factory,
        prefix=settings.legal_article_vector_collection_prefix,
        store=store,
    )
    previous_version_id = (
        int(active["version_id"]) if active is not None else None
    )
    version = create_legal_version(
        session_factory,
        settings=settings,
        physical_collection=collection,
        source_snapshot=snapshot,
        build_mode=build_mode,
        previous_version_id=previous_version_id,
    )
    version_id = int(version["version_id"])
    batch_size = max(
        1,
        int(batch_size or settings.legal_article_index_batch_size),
    )

    try:
        records_to_index: List[LegalArticleRecord] = list(records)
        expected_count = len(records)
        expected_dimension = 0
        indexed_so_far = 0
        if build_mode == "incremental":
            assert active is not None
            expected_dimension = int(
                active.get("embedding_dimension") or 0
            )
            active_collection = str(active["physical_collection"])
            previous_snapshot = active.get("source_snapshot") or {}
            expected_count = _expected_incremental_count(
                previous_snapshot, snapshot, changed, removed
            )
            if expected_count is None:
                expected_count = int(snapshot["article_count"])
            changed_set = set(changed)
            records_to_index = [
                record
                for record in records
                if record.law_key_id in changed_set
            ]
            indexed_so_far = max(
                0,
                expected_count - len(records_to_index),
            )

            def copy_progress(copied: int, total: int) -> None:
                if on_progress is None:
                    return
                # The copied collection still contains the changed laws that
                # will be deleted and re-embedded.  Scale the copy progress to
                # the points that will remain, so the bar never reaches 100%
                # before the new embeddings have been written.
                source_total = max(1, int(total))
                remaining = round(
                    indexed_so_far
                    * min(max(0, int(copied)), source_total)
                    / source_total
                )
                on_progress(min(indexed_so_far, remaining), expected_count)

            store.copy_collection(
                active_collection,
                collection,
                batch_size=256,
                on_progress=copy_progress if on_progress is not None else None,
            )
            _ensure_payload_indexes(store, collection)
            for key in list(changed) + list(removed):
                source_type, law_key = _split_law_key_id(key)
                if source_type and law_key:
                    store.delete_points_by_filter(
                        collection,
                        _law_filter(source_type, law_key),
                        wait=True,
                    )
        elif (
            recreate
            and store.collection_info(collection) is not None
        ):
            store.delete_collection(collection)

        last_progress = [indexed_so_far]

        def report_progress(indexed_count: int, total: int) -> None:
            if (
                indexed_count == total
                or indexed_count - last_progress[0] >= 512
            ):
                update_legal_version_progress(
                    session_factory,
                    version_id=version_id,
                    indexed_count=indexed_count,
                )
                last_progress[0] = indexed_count
            if on_progress is not None:
                on_progress(indexed_count, total)

        indexed, dimension = _index_records(
            settings=settings,
            store=store,
            embedder=embedder,
            collection=collection,
            records=records_to_index,
            batch_size=batch_size,
            expected_dimension=expected_dimension,
            indexed_so_far=indexed_so_far,
            on_progress=report_progress,
        )
        if not dimension:
            dimension = expected_dimension
        update_legal_version_progress(
            session_factory,
            version_id=version_id,
            indexed_count=indexed,
            embedding_dimension=dimension,
        )
        version = get_legal_version(session_factory, version_id) or version
        validation = validate_legal_version(
            session_factory,
            store=store,
            version=version,
            expected_count=expected_count,
            sample_records=(records_to_index or records)[:10],
        )
        if validation.get("status") != "passed":
            raise RuntimeError(
                "法規索引驗證失敗："
                f"Qdrant {validation.get('qdrant_count')} / "
                f"預期 {validation.get('expected_count')}"
            )
        if auto_activate:
            activated = activate_legal_version(
                session_factory,
                store=store,
                version_id=version_id,
                alias_name=settings.legal_article_vector_alias,
            )
            return {
                "status": "success",
                "version": _public_version(activated),
                "validation": validation,
                "snapshot": _snapshot_summary(snapshot),
                "alias": settings.legal_article_vector_alias,
            }
        return {
            "status": "ready",
            "version": _public_version(
                get_legal_version(session_factory, version_id)
            ),
            "validation": validation,
            "snapshot": _snapshot_summary(snapshot),
        }
    except Exception as exc:
        mark_legal_version_failed(
            session_factory,
            version_id=version_id,
            reason=f"{exc.__class__.__name__}: {exc}",
        )
        raise


def assess_legal_index_freshness(
    *,
    active_version: Optional[Dict[str, Any]],
    points_count: Optional[int],
    current_law_count: int,
    current_article_count: int,
    latest_source_at: Optional[Any] = None,
) -> Dict[str, Any]:
    """Compare the active legal index with current PostgreSQL law metadata.

    This is intentionally a cheap check used by status/plan endpoints.  It
    compares counts and the latest source download time; the exact content
    hash check remains part of ``--incremental --if-changed``.
    """

    def _moment(value: Any) -> Optional[datetime]:
        if isinstance(value, datetime):
            return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        text = str(value or "").strip()
        if not text:
            return None
        try:
            parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)

    active = active_version or {}
    snapshot = active.get("source_snapshot") or {}
    indexed_law_count = int(snapshot.get("law_count") or active.get("law_count") or 0)
    indexed_article_count = int(
        snapshot.get("article_count") or active.get("article_count") or 0
    )
    indexed_at = _moment(
        active.get("activated_at")
        or active.get("validated_at")
        or active.get("created_at")
        or snapshot.get("captured_at")
    )
    source_at = _moment(latest_source_at)
    reasons: List[str] = []
    if not active:
        reasons.append("no_active_version")
    if active and points_count is None:
        reasons.append("qdrant_count_unavailable")
    if active and points_count is not None and int(points_count) != indexed_article_count:
        reasons.append("points_count_mismatch")
    if active and current_law_count != indexed_law_count:
        reasons.append("law_count_mismatch")
    if active and current_article_count != indexed_article_count:
        reasons.append("article_count_mismatch")
    if active and source_at and indexed_at and source_at > indexed_at:
        reasons.append("newer_source_version")

    if not active:
        status = "not_indexed"
    elif "qdrant_count_unavailable" in reasons:
        status = "unknown"
    elif reasons:
        status = "stale"
    else:
        status = "fresh"
    return {
        "status": status,
        "stale": status == "stale",
        "reasons": reasons,
        "active_version_id": active.get("version_id"),
        "indexed_law_count": indexed_law_count,
        "current_law_count": int(current_law_count),
        "indexed_article_count": indexed_article_count,
        "current_article_count": int(current_article_count),
        "indexed_points": points_count,
        "indexed_at": indexed_at.isoformat() if indexed_at else None,
        "latest_source_at": source_at.isoformat() if source_at else None,
    }


def legal_index_status(
    *,
    session_factory: sessionmaker[Session],
    settings: Settings,
    store: Optional[QdrantStore] = None,
) -> Dict[str, Any]:
    store = store or QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )
    alias = settings.legal_article_vector_alias
    alias_target = None
    if store.configured:
        try:
            alias_target = store.get_alias(alias)
        except Exception:
            alias_target = None
    active = active_legal_version(
        session_factory, alias_name=alias
    )
    collection = alias_target or (
        active["physical_collection"] if active else None
    )
    count = None
    dimension = None
    if collection and store.configured:
        try:
            count = store.collection_count(collection)
            dimension = store.collection_dimension(collection)
        except Exception:
            count = None
    return {
        "alias": alias,
        "alias_collection": alias_target,
        "collection": collection,
        "points_count": count,
        "dimension": dimension,
        "active_version": _public_version(active),
        "versions": list_legal_versions(session_factory),
    }


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, str(level or "INFO").upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="建立法規／命令條文的 Qdrant 向量索引。"
    )
    parser.add_argument("--database-url", default=None, help="SQLAlchemy database URL")
    parser.add_argument("--qdrant-url", default=None, help="Qdrant base URL")
    parser.add_argument("--qdrant-api-key", default=None, help="Qdrant API key")
    parser.add_argument("--law-data-dir", default=None, help="法規 Parquet 根目錄")
    parser.add_argument("--alias", default=None, help="alias 名稱")
    parser.add_argument("--prefix", default=None, help="版本 collection 前綴")
    parser.add_argument("--embedding-url", default=None, help="Ollama base URL")
    parser.add_argument("--embedding-fallback-url", default=None, help="Ollama fallback URL")
    parser.add_argument("--embedding-model", default=None, help="Embedding 模型")
    parser.add_argument("--batch-size", type=int, default=None, help="每批條文數")
    parser.add_argument("--max-chars", type=int, default=None, help="每筆 embedding 字數上限")
    parser.add_argument("--limit", type=int, default=None, help="最多索引幾筆條文（測試用）")
    parser.add_argument(
        "--incremental",
        action="store_true",
        help="沿用 active 版本，只重新 embedding 有變動的法規",
    )
    parser.add_argument(
        "--if-changed",
        action="store_true",
        help="來源 snapshot 與 active 版本相同時直接結束",
    )
    parser.add_argument(
        "--no-activate",
        action="store_true",
        help="驗證成功後僅標記 ready，不切換 alias",
    )
    parser.add_argument(
        "--recreate",
        action="store_true",
        help="目標 collection 已存在時先刪除（僅 full build）",
    )
    parser.add_argument("--dry-run", action="store_true", help="只統計，不呼叫 embedding")
    parser.add_argument("--status", action="store_true", help="顯示 alias、collection 與版本狀態")
    parser.add_argument("--list-versions", action="store_true", help="列出法規索引版本")
    parser.add_argument("--validate-version", type=int, default=None, metavar="ID")
    parser.add_argument("--activate-version", type=int, default=None, metavar="ID")
    parser.add_argument("--discard-version", type=int, default=None, metavar="ID")
    parser.add_argument("--rollback", action="store_true", help="切回上一個法規索引版本")
    parser.add_argument("--log-level", default=None, help="DEBUG, INFO, WARNING, ERROR")
    return parser.parse_args(argv)


def _processing_progress_callback(
    run_id: str,
    *,
    stage_key: str = "legal_qdrant",
) -> Optional[Callable[[int, int], None]]:
    """Publish index progress to the parent processing run.

    Workflow upgrades run this module as a standalone subprocess, so there is
    no shared Python object with the web process.  The parent run id is passed
    through ``JUDGMENT_PROCESSING_PARENT``; writing the current/total counts to
    the shared state file lets the dashboard show live progress.
    """

    run_id = str(run_id or "").strip()
    if not run_id:
        return None
    try:
        state = ProcessingStateStore()
    except Exception:
        logger.debug("無法建立處理狀態寫入器", exc_info=True)
        return None
    last_write = [0.0]

    def report(current: int, total: int) -> None:
        current = max(0, int(current))
        total = max(0, int(total))
        now = time.monotonic()
        if current < total and now - last_write[0] < 1.0:
            return
        last_write[0] = now
        try:
            state.update_stage(
                run_id,
                stage_key,
                current=current,
                total=total,
                message=f"索引建置中：{current:,} / {total:,} 條。",
            )
        except Exception:
            logger.debug("無法更新法規索引處理進度", exc_info=True)

    return report


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    settings = Settings.from_env().with_overrides(
        database_url=args.database_url,
        qdrant_url=args.qdrant_url,
        qdrant_api_key=args.qdrant_api_key,
        law_data_dir=Path(args.law_data_dir) if args.law_data_dir else None,
        legal_article_vector_alias=args.alias,
        legal_article_vector_collection_prefix=args.prefix,
        embedding_url=args.embedding_url,
        embedding_fallback_url=args.embedding_fallback_url,
        embedding_model=args.embedding_model,
        log_level=args.log_level,
    )
    if args.max_chars is not None:
        settings = replace(
            settings,
            legal_article_index_max_chars=int(args.max_chars),
        )
    configure_logging(settings.log_level)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    engine = build_engine(settings.database_url)
    init_db(engine)
    session_factory = build_session_factory(engine)
    store = QdrantStore(
        settings.qdrant_url,
        api_key=settings.qdrant_api_key,
        timeout=120.0,
    )
    try:
        if args.status:
            summary = {
                "status": "success",
                **legal_index_status(
                    session_factory=session_factory,
                    settings=settings,
                    store=store,
                ),
            }
        elif args.list_versions:
            summary = {
                "status": "success",
                "versions": list_legal_versions(session_factory),
            }
        elif args.validate_version is not None:
            version = get_legal_version(session_factory, args.validate_version)
            if version is None:
                raise LookupError(
                    f"找不到法規索引版本：{args.validate_version}"
                )
            summary = {
                "status": "success",
                "validation": validate_legal_version(
                    session_factory,
                    store=store,
                    version=version,
                ),
            }
        elif args.activate_version is not None:
            summary = {
                "status": "success",
                "version": activate_legal_version(
                    session_factory,
                    store=store,
                    version_id=args.activate_version,
                    alias_name=settings.legal_article_vector_alias,
                ),
            }
        elif args.discard_version is not None:
            summary = {
                "status": "success",
                "discarded": discard_legal_version(
                    session_factory,
                    store=store,
                    version_id=args.discard_version,
                ),
            }
        elif args.rollback:
            summary = {
                "status": "success",
                "version": rollback_legal_version(
                    session_factory,
                    store=store,
                    alias_name=settings.legal_article_vector_alias,
                ),
            }
        else:
            summary = build_legal_article_index(
                session_factory=session_factory,
                settings=settings,
                store=store,
                batch_size=args.batch_size,
                mode="incremental" if args.incremental else "full",
                auto_activate=not args.no_activate,
                if_changed=args.if_changed,
                limit=args.limit,
                dry_run=args.dry_run,
                recreate=args.recreate,
                on_progress=_processing_progress_callback(parent_run_id()),
            )
    except Exception as exc:
        logger.error("法規索引失敗：%s", exc)
        print(
            json.dumps(
                {
                    "status": "failed",
                    "error": f"{exc.__class__.__name__}: {exc}",
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 1
    finally:
        engine.dispose()
    print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
