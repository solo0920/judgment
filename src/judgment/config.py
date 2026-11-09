from __future__ import annotations

import os
from dataclasses import dataclass, replace
from pathlib import Path


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    return int(raw)


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    return float(raw)


def _env_csv(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    values = tuple(item.strip() for item in raw.split(",") if item.strip())
    return values or default


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the law download module."""

    database_url: str
    law_data_dir: Path
    law_api_url: str
    order_api_url: str
    judgment_data_dir: Path = Path("/data/judgments")
    judgment_law_list: Path = Path("documents/金融法規.md")
    http_timeout_seconds: float = 300.0
    http_retries: int = 3
    user_agent: str = "judgment-law-downloader/0.1"
    log_level: str = "INFO"
    auto_create_schema: bool = True
    max_uncompressed_bytes: int = 512 * 1024 * 1024
    cors_allow_origins: tuple[str, ...] = ("*",)
    forwarded_allow_ips: str = "*"
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    judgment_vector_collection: str = "judgment_documents"
    judgment_vector_alias: str = "judgments_current"
    judgment_vector_collection_prefix: str = "judgments"
    judgment_embedding_version: str = "bge-m3@v1"
    judgment_index_recipe_version: str = "doc-head-tail-v1"
    judgment_point_id_version: str = "jid-uuid5-v1"
    embedding_url: str = ""
    embedding_fallback_url: str = ""
    embedding_model: str = "bge-m3"
    embedding_timeout_seconds: float = 120.0
    embedding_query_timeout_seconds: float = 10.0
    llm_url: str = ""
    llm_model: str = ""
    llm_timeout_seconds: float = 180.0
    llm_num_ctx: int = 4096
    llm_num_predict: int = 384
    llm_keep_alive: str = "30m"
    rag_top_k: int = 4
    rag_score_threshold: float = 0.35
    rag_max_context_chars: int = 4000
    judgment_index_max_chars: int = 1600
    test_embedding_models: tuple[str, ...] = ()
    test_llm_models: tuple[str, ...] = ()

    @classmethod
    def from_env(cls) -> "Settings":
        try:
            from dotenv import load_dotenv

            load_dotenv()
        except ImportError:  # pragma: no cover - dotenv is an optional convenience
            pass

        return cls(
            database_url=os.getenv(
                "DATABASE_URL",
                "postgresql+psycopg://judgment:judgment@localhost:5432/judgment",
            ),
            law_data_dir=Path(os.getenv("LAW_DATA_DIR", "/data/laws")),
            law_api_url=os.getenv(
                "LAW_API_URL", "https://law.moj.gov.tw/api/ch/law/json"
            ),
            order_api_url=os.getenv(
                "ORDER_API_URL", "https://law.moj.gov.tw/api/ch/order/json"
            ),
            judgment_data_dir=Path(
                os.getenv("JUDGMENT_DATA_DIR", "/data/judgments")
            ),
            judgment_law_list=Path(
                os.getenv("JUDGMENT_LAW_LIST", "documents/金融法規.md")
            ),
            http_timeout_seconds=_env_float("HTTP_TIMEOUT_SECONDS", 300.0),
            http_retries=_env_int("HTTP_RETRIES", 3),
            user_agent=os.getenv("USER_AGENT", "judgment-law-downloader/0.1"),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
            auto_create_schema=_env_bool("AUTO_CREATE_SCHEMA", True),
            max_uncompressed_bytes=_env_int("MAX_UNCOMPRESSED_BYTES", 512 * 1024 * 1024),
            cors_allow_origins=_env_csv("CORS_ALLOW_ORIGINS", ("*",)),
            forwarded_allow_ips=os.getenv("FORWARDED_ALLOW_IPS", "*").strip() or "*",
            qdrant_url=os.getenv("QDRANT_URL", "").rstrip("/"),
            qdrant_api_key=os.getenv("QDRANT_API_KEY", ""),
            judgment_vector_collection=os.getenv(
                "JUDGMENT_VECTOR_COLLECTION", "judgment_documents"
            ).strip()
            or "judgment_documents",
            judgment_vector_alias=os.getenv(
                "JUDGMENT_VECTOR_ALIAS", "judgments_current"
            ).strip()
            or "judgments_current",
            judgment_vector_collection_prefix=os.getenv(
                "JUDGMENT_VECTOR_COLLECTION_PREFIX", "judgments"
            ).strip()
            or "judgments",
            judgment_embedding_version=os.getenv(
                "JUDGMENT_EMBEDDING_VERSION", "bge-m3@v1"
            ).strip()
            or "bge-m3@v1",
            judgment_index_recipe_version=os.getenv(
                "JUDGMENT_INDEX_RECIPE_VERSION", "doc-head-tail-v1"
            ).strip()
            or "doc-head-tail-v1",
            judgment_point_id_version=os.getenv(
                "JUDGMENT_POINT_ID_VERSION", "jid-uuid5-v1"
            ).strip()
            or "jid-uuid5-v1",
            embedding_url=os.getenv("EMBEDDING_URL", "").rstrip("/"),
            embedding_fallback_url=os.getenv(
                "EMBEDDING_FALLBACK_URL", ""
            ).rstrip("/"),
            embedding_model=os.getenv("EMBEDDING_MODEL", "bge-m3").strip()
            or "bge-m3",
            embedding_timeout_seconds=_env_float("EMBEDDING_TIMEOUT_SECONDS", 120.0),
            embedding_query_timeout_seconds=_env_float(
                "EMBEDDING_QUERY_TIMEOUT_SECONDS", 10.0
            ),
            llm_url=os.getenv("LLM_URL", "").rstrip("/"),
            llm_model=os.getenv("LLM_MODEL", "").strip(),
            llm_timeout_seconds=_env_float("LLM_TIMEOUT_SECONDS", 180.0),
            llm_num_ctx=_env_int("LLM_NUM_CTX", 4096),
            llm_num_predict=_env_int("LLM_NUM_PREDICT", 384),
            llm_keep_alive=os.getenv("LLM_KEEP_ALIVE", "30m").strip() or "30m",
            rag_top_k=_env_int("RAG_TOP_K", 4),
            rag_score_threshold=_env_float("RAG_SCORE_THRESHOLD", 0.35),
            rag_max_context_chars=_env_int("RAG_MAX_CONTEXT_CHARS", 4000),
            judgment_index_max_chars=_env_int("JUDGMENT_INDEX_MAX_CHARS", 1600),
            test_embedding_models=_env_csv("TEST_EMBEDDING_MODELS", ()),
            test_llm_models=_env_csv("TEST_LLM_MODELS", ()),
        )

    def with_overrides(
        self,
        *,
        database_url: str | None = None,
        law_data_dir: Path | None = None,
        judgment_data_dir: Path | None = None,
        judgment_law_list: Path | None = None,
        qdrant_url: str | None = None,
        qdrant_api_key: str | None = None,
        judgment_vector_collection: str | None = None,
        judgment_vector_alias: str | None = None,
        judgment_vector_collection_prefix: str | None = None,
        judgment_embedding_version: str | None = None,
        judgment_index_recipe_version: str | None = None,
        judgment_point_id_version: str | None = None,
        embedding_url: str | None = None,
        embedding_fallback_url: str | None = None,
        embedding_model: str | None = None,
        llm_url: str | None = None,
        llm_model: str | None = None,
        log_level: str | None = None,
    ) -> "Settings":
        changes = {}
        if database_url:
            changes["database_url"] = database_url
        if law_data_dir:
            changes["law_data_dir"] = law_data_dir
        if judgment_data_dir:
            changes["judgment_data_dir"] = judgment_data_dir
        if judgment_law_list:
            changes["judgment_law_list"] = judgment_law_list
        if qdrant_url is not None:
            changes["qdrant_url"] = qdrant_url.rstrip("/")
        if qdrant_api_key is not None:
            changes["qdrant_api_key"] = qdrant_api_key
        if judgment_vector_collection:
            changes["judgment_vector_collection"] = judgment_vector_collection
        if judgment_vector_alias:
            changes["judgment_vector_alias"] = judgment_vector_alias
        if judgment_vector_collection_prefix:
            changes["judgment_vector_collection_prefix"] = (
                judgment_vector_collection_prefix
            )
        if judgment_embedding_version:
            changes["judgment_embedding_version"] = judgment_embedding_version
        if judgment_index_recipe_version:
            changes["judgment_index_recipe_version"] = (
                judgment_index_recipe_version
            )
        if judgment_point_id_version:
            changes["judgment_point_id_version"] = judgment_point_id_version
        if embedding_url is not None:
            changes["embedding_url"] = embedding_url.rstrip("/")
        if embedding_fallback_url is not None:
            changes["embedding_fallback_url"] = (
                embedding_fallback_url.rstrip("/")
            )
        if embedding_model:
            changes["embedding_model"] = embedding_model
        if llm_url is not None:
            changes["llm_url"] = llm_url.rstrip("/")
        if llm_model is not None:
            changes["llm_model"] = llm_model
        if log_level:
            changes["log_level"] = log_level
        return replace(self, **changes) if changes else self
