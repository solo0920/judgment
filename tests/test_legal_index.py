from __future__ import annotations

import copy
from pathlib import Path

import pyarrow as pa
import pyarrow.compute as pc
import pyarrow.parquet as pq
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.embeddings import EmbeddingError
from judgment.legal_index import (
    _embed_texts,
    _processing_progress_callback,
    assess_legal_index_freshness,
    build_legal_article_index,
    build_source_snapshot,
    legal_index_status,
    next_collection_name,
    read_legal_articles,
)
from judgment.models import Base
from judgment.processing_state import ProcessingStateStore


def _settings(**overrides) -> Settings:
    values = {
        "database_url": "sqlite+pysqlite:///:memory:",
        "law_data_dir": Path("data/laws"),
        "law_api_url": "https://example.test/law",
        "order_api_url": "https://example.test/order",
        "embedding_model": "bge-m3",
        "legal_article_vector_alias": "legal_articles_current",
        "legal_article_vector_collection_prefix": "legal_articles",
    }
    values.update(overrides)
    return Settings(**values)


def _session_factory():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    return sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )


def _write_laws(root: Path, laws) -> None:
    rows = []
    for law in laws:
        rows.append(
            {
                "source_type": law.get("source_type", "law"),
                "law_key": law["law_key"],
                "law_name": law["law_name"],
                "law_level": law.get("law_level", "法律"),
                "law_category": law.get("law_category", "金融法規"),
                "law_url": law.get("law_url", "https://law.test/item"),
                "law_modified_date": law.get("law_modified_date", "20230628"),
                "law_effective_date": law.get("law_effective_date", ""),
                "article_count": len(law["articles"]),
                "law_articles": law["articles"],
            }
        )
    table = pa.Table.from_pylist(rows)
    for source_type in sorted({row["source_type"] for row in rows}):
        path = (
            root
            / "raw_parquet"
            / source_type
            / "20261030"
            / "snapshot"
            / "laws.parquet"
        )
        path.parent.mkdir(parents=True, exist_ok=True)
        subset = table.filter(pc.equal(table["source_type"], source_type))
        pq.write_table(subset, path)


class FakeLegalEmbedder:
    configured = True

    def __init__(self) -> None:
        self.calls = []

    def embed(self, texts):
        self.calls.append(list(texts))
        return [
            [float(len(text) % 97), 1.0, 2.0, 3.0]
            for text in texts
        ]


class FakeLegalStore:
    configured = True

    def __init__(self) -> None:
        self.collections = {}
        self.aliases = {}
        self.indexes = []

    def ensure_collection(self, collection, *, size, distance="Cosine"):
        current = self.collections.get(collection)
        if current is not None:
            if int(current["size"]) != int(size):
                raise AssertionError("unexpected dimension change")
            return False
        self.collections[collection] = {"size": int(size), "points": {}}
        return True

    def ensure_payload_index(self, collection, field_name, field_schema="keyword"):
        self.indexes.append((collection, field_name))

    def upsert(self, collection, points, *, wait=True):
        target = self.collections.setdefault(
            collection, {"size": 0, "points": {}}
        )
        for point in points:
            target["points"][point["id"]] = copy.deepcopy(point)
        if points and not target["size"]:
            target["size"] = len(points[0]["vector"])

    def collection_info(self, collection):
        current = self.collections.get(collection)
        if current is None:
            return None
        return {
            "points_count": len(current["points"]),
            "config": {"params": {"vectors": {"size": current["size"]}}},
        }

    def collection_count(self, collection):
        info = self.collection_info(collection)
        return info["points_count"] if info else None

    def collection_dimension(self, collection):
        info = self.collection_info(collection)
        if not info:
            return None
        return int(info["config"]["params"]["vectors"]["size"])

    def exact_count(self, collection):
        return len(self.collections[collection]["points"])

    def retrieve_points(
        self,
        collection,
        point_ids,
        *,
        with_payload=True,
        with_vector=False,
    ):
        points = self.collections[collection]["points"]
        return [
            copy.deepcopy(points[point_id])
            for point_id in point_ids
            if point_id in points
        ]

    def copy_collection(self, source, target, *, batch_size=256, on_progress=None):
        data = copy.deepcopy(self.collections[source])
        self.collections[target] = data
        if on_progress:
            on_progress(len(data["points"]), len(data["points"]))
        return len(data["points"])

    def delete_points_by_filter(self, collection, query_filter, *, wait=True):
        must = {
            item["key"]: item["match"]["value"]
            for item in query_filter.get("must") or []
        }
        points = self.collections[collection]["points"]
        remove = [
            point_id
            for point_id, point in points.items()
            if all(
                (point.get("payload") or {}).get(key) == value
                for key, value in must.items()
            )
        ]
        for point_id in remove:
            points.pop(point_id, None)

    def delete_collection(self, collection):
        self.collections.pop(collection, None)

    def get_alias(self, alias):
        return self.aliases.get(alias)

    def switch_alias(self, alias, collection):
        self.aliases[alias] = collection

    def list_collections(self):
        return list(self.collections)


def _laws(content: str = "銀行負責人及職員不得收受佣金。") -> list[dict]:
    return [
        {
            "law_key": "BANK",
            "law_name": "銀行法",
            "articles": [
                {
                    "article_type": "C",
                    "article_no": "",
                    "article_content": "第一章 通則",
                },
                {
                    "article_type": "A",
                    "article_no": "第 35 條",
                    "article_content": content,
                },
                {
                    "article_type": "A",
                    "article_no": "第 125-2 條",
                    "article_content": "銀行負責人或職員違背職務者，處有期徒刑。",
                },
            ],
        },
        {
            "law_key": "INS",
            "law_name": "保險法",
            "articles": [
                {
                    "article_type": "A",
                    "article_no": "第 1 條",
                    "article_content": "為規範保險業務，特制定本法。",
                }
            ],
        },
    ]


def test_read_legal_articles_skips_chapter_headings(tmp_path: Path) -> None:
    _write_laws(tmp_path, _laws())

    records = read_legal_articles(tmp_path)
    snapshot = build_source_snapshot(records)

    assert len(records) == 3
    assert snapshot["law_count"] == 2
    assert snapshot["article_count"] == 3
    assert {record.article_no for record in records} == {
        "第 35 條",
        "第 125-2 條",
        "第 1 條",
    }
    bank = [record for record in records if record.law_name == "銀行法"]
    assert len({record.point_id for record in bank}) == 2
    assert len({record.point_id for record in records}) == 3
    assert all(len(record.content_hash) == 64 for record in records)


def test_build_legal_index_full_then_incremental(tmp_path: Path) -> None:
    _write_laws(tmp_path, _laws())
    session_factory = _session_factory()
    settings = _settings(law_data_dir=tmp_path)
    store = FakeLegalStore()
    embedder = FakeLegalEmbedder()

    first = build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        records=read_legal_articles(tmp_path),
    )

    assert first["status"] == "success"
    assert first["version"]["status"] == "active"
    assert first["version"]["article_count"] == 3
    assert first["version"]["indexed_count"] == 3
    assert first["validation"]["status"] == "passed"
    assert store.get_alias("legal_articles_current") == "legal_articles_v001"
    collection = store.collections["legal_articles_v001"]
    assert len(collection["points"]) == 3
    payloads = {
        point["payload"]["article_no"]: point["payload"]
        for point in collection["points"].values()
    }
    assert payloads["第 35 條"]["law_name"] == "銀行法"
    assert "佣金" in payloads["第 35 條"]["article_content"]
    assert len(payloads["第 35 條"]["content_hash"]) == 64
    assert ("legal_articles_v001", "law_key") in store.indexes
    assert embedder.calls

    # Rewrite after the first build only changes the bank law.
    changed = _laws("銀行負責人及職員不得收受佣金、酬金或不當利益。")
    _write_laws(tmp_path, changed)
    second = build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        records=read_legal_articles(tmp_path),
        mode="incremental",
    )

    assert second["status"] == "success"
    assert second["version"]["build_mode"] == "incremental"
    assert store.get_alias("legal_articles_current") == "legal_articles_v002"
    collection = store.collections["legal_articles_v002"]
    assert len(collection["points"]) == 3
    payloads = {
        point["payload"]["article_no"]: point["payload"]
        for point in collection["points"].values()
    }
    assert "酬金" in payloads["第 35 條"]["article_content"]
    assert payloads["第 1 條"]["law_name"] == "保險法"

    unchanged = build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        records=read_legal_articles(tmp_path),
        mode="incremental",
    )
    assert unchanged["status"] == "unchanged"
    assert unchanged["version"]["version_id"] == second["version"]["version_id"]


def test_legal_index_progress_callback_updates_parent_run(
    tmp_path: Path, monkeypatch
) -> None:
    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE", str(tmp_path / "processing_state.json")
    )
    store = ProcessingStateStore()
    run_id = store.start_run(
        branch="law",
        kind="legal_index",
        title="法規／命令索引",
        stages=["legal_qdrant"],
        pid=1,
    )
    store.start_stage(run_id, "legal_qdrant", total=10)
    callback = _processing_progress_callback(run_id)
    assert callback is not None

    callback(4, 10)
    stage = store.read()["runs"][0]["stages"]["legal_qdrant"]
    assert stage["current"] == 4
    assert stage["total"] == 10
    assert stage["message"] == "索引建置中：4 / 10 條。"

    callback(10, 10)
    stage = store.read()["runs"][0]["stages"]["legal_qdrant"]
    assert stage["current"] == 10
    assert stage["total"] == 10


def test_build_legal_index_reports_copy_progress(tmp_path: Path) -> None:
    _write_laws(tmp_path, _laws())
    session_factory = _session_factory()
    settings = _settings(law_data_dir=tmp_path)
    store = FakeLegalStore()
    embedder = FakeLegalEmbedder()
    build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        records=read_legal_articles(tmp_path),
    )
    _write_laws(tmp_path, _laws("銀行負責人及職員不得收受佣金、酬金。"))
    progress = []
    build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        records=read_legal_articles(tmp_path),
        mode="incremental",
        on_progress=lambda current, total: progress.append((current, total)),
    )

    assert progress
    assert progress[0][1] == 3
    assert progress[-1] == (3, 3)


def test_embed_texts_splits_on_context_length_error() -> None:
    class SplittingEmbedder:
        configured = True

        def __init__(self) -> None:
            self.batch_sizes = []

        def embed(self, texts):
            self.batch_sizes.append(len(texts))
            if sum(len(text) for text in texts) > 20:
                raise EmbeddingError("HTTP 413: context length")
            return [[1.0, 2.0] for _ in texts]

    embedder = SplittingEmbedder()
    vectors = _embed_texts(embedder, ["x" * 8] * 4)

    assert len(vectors) == 4
    assert embedder.batch_sizes == [4, 2, 2]


def test_embed_texts_truncates_one_oversized_article() -> None:
    class LengthEmbedder:
        configured = True

        def __init__(self) -> None:
            self.lengths = []

        def embed(self, texts):
            self.lengths.append(len(texts[0]))
            if any(len(text) > 1200 for text in texts):
                raise EmbeddingError("HTTP 413: context length")
            return [[1.0] for _ in texts]

    embedder = LengthEmbedder()
    vectors = _embed_texts(embedder, ["x" * 2000])

    assert len(vectors) == 1
    assert embedder.lengths == [2000, 1000]


def test_legal_index_status_reports_alias_and_summary(tmp_path: Path) -> None:
    _write_laws(tmp_path, _laws())
    session_factory = _session_factory()
    settings = _settings(law_data_dir=tmp_path)
    store = FakeLegalStore()
    build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=FakeLegalEmbedder(),
        records=read_legal_articles(tmp_path),
    )

    status = legal_index_status(
        session_factory=session_factory,
        settings=settings,
        store=store,
    )

    assert status["alias"] == "legal_articles_current"
    assert status["alias_collection"] == "legal_articles_v001"
    assert status["points_count"] == 3
    assert status["dimension"] == 4
    assert status["active_version"]["status"] == "active"
    snapshot = status["active_version"]["source_snapshot"]
    assert snapshot["article_count"] == 3
    assert "laws" not in snapshot


def test_legal_index_freshness_detects_counts_and_newer_source(tmp_path: Path) -> None:
    _write_laws(tmp_path, _laws())
    session_factory = _session_factory()
    settings = _settings(law_data_dir=tmp_path)
    store = FakeLegalStore()
    build_legal_article_index(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=FakeLegalEmbedder(),
        records=read_legal_articles(tmp_path),
    )
    status = legal_index_status(
        session_factory=session_factory,
        settings=settings,
        store=store,
    )
    active = status["active_version"]
    captured = active["source_snapshot"]["captured_at"]

    fresh = assess_legal_index_freshness(
        active_version=active,
        points_count=status["points_count"],
        current_law_count=2,
        current_article_count=3,
        latest_source_at=captured,
    )
    assert fresh["status"] == "fresh"
    assert fresh["stale"] is False

    stale = assess_legal_index_freshness(
        active_version=active,
        points_count=status["points_count"],
        current_law_count=3,
        current_article_count=3,
        latest_source_at=captured,
    )
    assert stale["status"] == "stale"
    assert "law_count_mismatch" in stale["reasons"]

    newer = assess_legal_index_freshness(
        active_version=active,
        points_count=status["points_count"],
        current_law_count=2,
        current_article_count=3,
        latest_source_at="2099-01-01T00:00:00+00:00",
    )
    assert newer["status"] == "stale"
    assert "newer_source_version" in newer["reasons"]


def test_next_collection_name_avoids_qdrant_orphans() -> None:
    session_factory = _session_factory()
    store = FakeLegalStore()
    store.collections["legal_articles_v007"] = {"size": 4, "points": {}}
    store.collections["judgments_v002"] = {"size": 4, "points": {}}

    name = next_collection_name(
        session_factory,
        prefix="legal_articles",
        store=store,
    )

    assert name == "legal_articles_v008"
