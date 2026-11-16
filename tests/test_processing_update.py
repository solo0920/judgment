from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from judgment.config import Settings
from judgment import processing_update as update_module
from judgment.models import Base, OllamaHost


def _settings(db_path: Path) -> Settings:
    return Settings(
        database_url=f"sqlite+pysqlite:///{db_path}",
        law_data_dir=Path("data/laws"),
        law_api_url="https://example.test/law",
        order_api_url="https://example.test/order",
        embedding_url="http://env-host:11434",
        embedding_model="env-embedding",
        ollama_allowed_hosts=("env-host:11434", "ui-host:11434"),
    )


def test_run_update_applies_active_embedding_host(
    tmp_path: Path, monkeypatch
) -> None:
    db_path = tmp_path / "judgment.db"
    base_settings = _settings(db_path)
    engine = create_engine(
        base_settings.database_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(
        bind=engine, autoflush=False, expire_on_commit=False, future=True
    )
    with session_factory() as session:
        session.add(
            OllamaHost(
                name="ui-host",
                base_url="http://ui-host:11434",
                port=11434,
                is_active=True,
                priority=0,
                embedding_model="ui-embedding:latest",
            )
        )
        session.commit()
    engine.dispose()

    monkeypatch.setenv(
        "JUDGMENT_PROCESSING_STATE",
        str(tmp_path / "processing_state.db"),
    )
    monkeypatch.setattr(
        update_module,
        "Settings",
        type(
            "StubSettings",
            (),
            {"from_env": staticmethod(lambda: base_settings)},
        ),
    )
    monkeypatch.setattr(
        update_module, "_run_law_download", lambda store, run_id: True
    )
    captured = {}

    def fake_legal_index(store, run_id, *, settings, session_factory):
        captured["settings"] = settings
        return {
            "ok": True,
            "status": "success",
            "summary": {"snapshot": {"article_count": 3}},
        }

    monkeypatch.setattr(update_module, "_run_legal_index", fake_legal_index)
    monkeypatch.setattr(
        update_module,
        "_run_imports",
        lambda store, run_id, *, settings, session_factory: {
            "pending": 0,
            "stored_count": 0,
        },
    )
    monkeypatch.setattr(
        update_module,
        "_run_index",
        lambda store, run_id, *, settings, session_factory, enabled: {
            "indexed": False,
            "indexed_count": 0,
        },
    )

    assert update_module.run_update(run_id=None, index=False) == 0
    assert captured["settings"].embedding_url == "http://ui-host:11434"
    assert captured["settings"].embedding_model == "ui-embedding:latest"
