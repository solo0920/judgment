from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment.index_versions import activate_version, recipe_version, rollback_version
from judgment.judgment_index import build_index_version, vector_point_id
from judgment.models import (
    Base,
    JudgmentDocument,
    JudgmentIndexVersion,
    JudgmentVectorIndex,
)


class FakeVersionStore:
    configured = True

    def __init__(self) -> None:
        self.collections = {}
        self.aliases = {}

    def _target(self, name):
        return self.aliases.get(name, name)

    def ensure_collection(self, collection, *, size, distance="Cosine"):
        if collection in self.collections:
            return False
        self.collections[collection] = {"size": int(size), "points": {}}
        return True

    def collection_info(self, collection):
        target = self._target(collection)
        data = self.collections.get(target)
        if data is None:
            return None
        return {
            "points_count": len(data["points"]),
            "config": {"params": {"vectors": {"size": data["size"]}}},
        }

    def collection_dimension(self, collection):
        info = self.collection_info(collection)
        if not info:
            return None
        return int(info["config"]["params"]["vectors"]["size"])

    def ensure_payload_index(self, collection, field_name, field_schema="keyword"):
        return None

    def copy_collection(self, source, target, *, batch_size=256, on_progress=None):
        source_points = self.collections[self._target(source)]["points"]
        self.ensure_collection(
            target, size=self.collection_dimension(source) or 4
        )
        for point_id, point in source_points.items():
            self.collections[target]["points"][point_id] = {
                "id": point["id"],
                "vector": list(point["vector"]),
                "payload": dict(point["payload"]),
            }
        return len(source_points)

    def upsert(self, collection, points, *, wait=True):
        self.ensure_collection(collection, size=len(points[0]["vector"]))
        for point in points:
            self.collections[collection]["points"][point["id"]] = point

    def exact_count(self, collection):
        return len(self.collections[self._target(collection)]["points"])

    def delete_points(self, collection, point_ids, *, wait=True, batch_size=512):
        points = self.collections[self._target(collection)]["points"]
        for point_id in point_ids:
            points.pop(str(point_id), None)
        return len(point_ids)

    def retrieve_points(
        self,
        collection,
        point_ids,
        *,
        with_payload=True,
        with_vector=False,
    ):
        points = self.collections[self._target(collection)]["points"]
        return [
            points[str(point_id)]
            for point_id in point_ids
            if str(point_id) in points
        ]

    def switch_alias(self, alias, collection):
        self.aliases[alias] = collection

    def get_alias(self, alias):
        return self.aliases.get(alias)

    def search(self, collection, vector, **kwargs):
        return []


class FakeEmbedder:
    configured = True

    def __init__(self) -> None:
        self.calls = []

    def embed(self, texts):
        self.calls.append(list(texts))
        return [[0.1, 0.2, 0.3, 0.4] for _ in texts]


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


def _settings(tmp_path: Path) -> Settings:
    return Settings(
        database_url="sqlite+pysqlite:///:memory:",
        law_data_dir=tmp_path,
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        judgment_data_dir=tmp_path / "judgments",
        judgment_vector_collection="judgment_documents",
        qdrant_url="http://fake-qdrant",
        embedding_url="http://fake-ollama",
        embedding_model="test-model",
        judgment_index_max_chars=400,
    )


def _seed_legacy_version(session_factory, settings):
    now = datetime.now(timezone.utc)
    old_updated = now - timedelta(days=2)
    with session_factory() as session:
        first = JudgmentDocument(
            jid="J-1",
            jyear="115",
            jcase="訴",
            jno="1",
            jdate="20260101",
            court="臺灣臺北地方法院",
            court_normalized="臺灣臺北地方法院",
            title="返還借款",
            full_text="原告依消費借貸法律關係請求返還借款。" * 5,
            content_hash="a" * 64,
            matched_laws=["民法"],
            matched_laws_text="民法",
            full_text_length=80,
            source_archive="202601.rar",
            updated_at=old_updated,
        )
        second = JudgmentDocument(
            jid="J-2",
            jyear="115",
            jcase="訴",
            jno="2",
            jdate="20260201",
            court="臺灣臺北地方法院",
            court_normalized="臺灣臺北地方法院",
            title="清償借款",
            full_text="被告應給付原告借款及遲延利息。" * 5,
            content_hash="b" * 64,
            matched_laws=["民法"],
            matched_laws_text="民法",
            full_text_length=80,
            source_archive="202602.rar",
            updated_at=old_updated,
        )
        session.add_all([first, second])
        session.commit()
        old_version = JudgmentIndexVersion(
            physical_collection="judgments_v001",
            alias_name=settings.judgment_vector_alias,
            build_mode="legacy",
            embedding_model=settings.embedding_model,
            embedding_version=settings.judgment_embedding_version,
            embedding_dimension=4,
            index_recipe_version=recipe_version(settings),
            point_id_version=settings.judgment_point_id_version,
            document_count=1,
            indexed_count=1,
            source_snapshot={"max_judgment_id": first.id, "document_count": 1},
            validation_result={"legacy": True},
            status="active",
            last_indexed_id=first.id,
            activated_at=now,
        )
        session.add(old_version)
        session.commit()
        session.refresh(old_version)
        session.add(
            JudgmentVectorIndex(
                jid=first.jid,
                version_id=old_version.version_id,
                collection="judgments_v001",
                model=settings.embedding_model,
                embedding_version=settings.judgment_embedding_version,
                index_recipe_version=recipe_version(settings),
                source_year="2026",
                content_hash=first.content_hash,
                index_text_hash="",
                payload_hash="",
                dimensions=4,
                source_updated_at=old_updated,
                indexed_at=now,
            )
        )
        session.commit()


def test_build_version_reuses_unchanged_and_embeds_new(tmp_path: Path) -> None:
    session_factory = _session_factory()
    settings = _settings(tmp_path)
    _seed_legacy_version(session_factory, settings)
    store = FakeVersionStore()
    store.collections["judgments_v001"] = {
        "size": 4,
        "points": {
            f"{vector_point_id('J-1')}": {
                "id": vector_point_id("J-1"),
                "vector": [0.1, 0.2, 0.3, 0.4],
                "payload": {"jid": "J-1", "model": settings.embedding_model},
            }
        },
    }
    store.aliases[settings.judgment_vector_alias] = "judgments_v001"
    embedder = FakeEmbedder()

    summary = build_index_version(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=embedder,
        batch_size=2,
        auto_activate=True,
    )

    assert summary["status"] == "success"
    assert summary["build_mode"] == "reuse"
    assert summary["reused_count"] == 1
    assert summary["embedded_count"] == 1
    assert summary["indexed_count"] == 2
    assert summary["validation"]["status"] == "ready"
    assert store.aliases[settings.judgment_vector_alias] == "judgments_v002"
    assert "judgments_v001" in store.collections
    assert "judgments_v002" in store.collections
    assert len(store.collections["judgments_v002"]["points"]) == 2
    assert len(store.collections["judgments_v001"]["points"]) == 1
    assert len(embedder.calls) == 1
    assert len(embedder.calls[0]) == 1

    with session_factory() as session:
        versions = session.scalars(
            select(JudgmentIndexVersion).order_by(JudgmentIndexVersion.version_id)
        ).all()
        assert [item.status for item in versions] == ["retired", "active"]
        rows = session.scalars(
            select(JudgmentVectorIndex).where(
                JudgmentVectorIndex.version_id == versions[1].version_id
            )
        ).all()
        assert {row.jid for row in rows} == {"J-1", "J-2"}

    rolled = rollback_version(
        session_factory,
        store=store,
        alias_name=settings.judgment_vector_alias,
    )
    assert rolled["version_id"] == 1
    assert store.aliases[settings.judgment_vector_alias] == "judgments_v001"

    reactivated = activate_version(
        session_factory,
        store=store,
        version_id=2,
        alias_name=settings.judgment_vector_alias,
    )
    assert reactivated["version_id"] == 2
    assert store.aliases[settings.judgment_vector_alias] == "judgments_v002"


def test_build_version_does_not_switch_on_validation_failure(
    tmp_path: Path,
) -> None:
    session_factory = _session_factory()
    settings = _settings(tmp_path)
    _seed_legacy_version(session_factory, settings)

    class BrokenCountStore(FakeVersionStore):
        def exact_count(self, collection):
            return 0

    store = BrokenCountStore()
    store.collections["judgments_v001"] = {
        "size": 4,
        "points": {
            vector_point_id("J-1"): {
                "id": vector_point_id("J-1"),
                "vector": [0.1, 0.2, 0.3, 0.4],
                "payload": {"jid": "J-1"},
            }
        },
    }
    store.aliases[settings.judgment_vector_alias] = "judgments_v001"

    summary = build_index_version(
        session_factory=session_factory,
        settings=settings,
        store=store,
        embedder=FakeEmbedder(),
        batch_size=2,
        auto_activate=True,
    )

    assert summary["status"] == "validation_failed"
    assert summary["validation"]["status"] == "failed"
    assert store.aliases[settings.judgment_vector_alias] == "judgments_v001"
    with session_factory() as session:
        versions = session.scalars(
            select(JudgmentIndexVersion).order_by(JudgmentIndexVersion.version_id)
        ).all()
        assert [item.status for item in versions] == ["active", "failed"]
