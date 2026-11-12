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
    embedding_failover_urls: tuple[str, ...] = ()
    embedding_model: str = "bge-m3"
    embedding_timeout_seconds: float = 120.0
    embedding_query_timeout_seconds: float = 2.0
    embedding_health_timeout_seconds: float = 2.0
    llm_url: str = ""
    llm_model: str = ""
    llm_timeout_seconds: float = 180.0
    llm_num_ctx: int = 4096
    llm_num_predict: int = 384
    llm_keep_alive: str = "30m"
    rag_top_k: int = 4
    rag_score_threshold: float = 0.35
    rag_max_context_chars: int = 4000
    rag_rerank_enabled: bool = False
    rag_rerank_candidates: int = 30
    rag_law_first_judgment_limit: int = 1
    rag_law_vector_enabled: bool = False
    rag_law_vector_candidates: int = 30
    rag_law_score_threshold: float = 0.25
    rag_law_article_limit: int = 4
    rag_law_article_limit_law_first: int = 6
    rag_law_candidate_article_limit: int = 8
    rag_law_rerank_weight: float = 0.15
    rag_law_rerank_max_chars: int = 600
    rerank_url: str = ""
    rerank_fallback_url: str = ""
    rerank_model: str = "bge-reranker-v2-m3"
    rerank_timeout_seconds: float = 3.0
    rerank_connect_timeout_seconds: float = 0.75
    rerank_max_chars: int = 1200
    judgment_index_max_chars: int = 1600
    opendata_judicial_account: str = ""
    opendata_judicial_password: str = ""
    judgment_download_category: str = "051"
    judgment_download_start_id: int = 71644
    judgment_download_known_latest_id: int = 72011
    judgment_download_allow_off_hours: bool = True
    judgment_raw_rar_keep_versions: bool = True
    judgment_raw_parquet_keep_versions: bool = False
    judgment_vector_history_collection: str = "judgment_documents_history"
    legal_article_vector_collection: str = "legal_articles"
    legal_article_vector_alias: str = "legal_articles_current"
    legal_article_vector_collection_prefix: str = "legal_articles"
    legal_article_embedding_version: str = "bge-m3@v1"
    legal_article_index_recipe_version: str = "law-article-v1"
    legal_article_point_id_version: str = "law-article-uuid5-v1"
    legal_article_index_max_chars: int = 4000
    legal_article_index_batch_size: int = 32
    legal_article_payload_max_chars: int = 8000
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
            legal_article_vector_collection=os.getenv(
                "LEGAL_ARTICLE_VECTOR_COLLECTION", "legal_articles"
            ).strip()
            or "legal_articles",
            legal_article_vector_alias=os.getenv(
                "LEGAL_ARTICLE_VECTOR_ALIAS", "legal_articles_current"
            ).strip()
            or "legal_articles_current",
            legal_article_vector_collection_prefix=os.getenv(
                "LEGAL_ARTICLE_VECTOR_COLLECTION_PREFIX", "legal_articles"
            ).strip()
            or "legal_articles",
            legal_article_embedding_version=os.getenv(
                "LEGAL_ARTICLE_EMBEDDING_VERSION", "bge-m3@v1"
            ).strip()
            or "bge-m3@v1",
            legal_article_index_recipe_version=os.getenv(
                "LEGAL_ARTICLE_INDEX_RECIPE_VERSION", "law-article-v1"
            ).strip()
            or "law-article-v1",
            legal_article_point_id_version=os.getenv(
                "LEGAL_ARTICLE_POINT_ID_VERSION", "law-article-uuid5-v1"
            ).strip()
            or "law-article-uuid5-v1",
            legal_article_index_max_chars=_env_int(
                "LEGAL_ARTICLE_INDEX_MAX_CHARS", 4000
            ),
            legal_article_index_batch_size=_env_int(
                "LEGAL_ARTICLE_INDEX_BATCH_SIZE", 32
            ),
            legal_article_payload_max_chars=_env_int(
                "LEGAL_ARTICLE_PAYLOAD_MAX_CHARS", 8000
            ),
            embedding_url=os.getenv("EMBEDDING_URL", "").rstrip("/"),
            embedding_fallback_url=os.getenv(
                "EMBEDDING_FALLBACK_URL", ""
            ).rstrip("/"),
            embedding_failover_urls=tuple(
                url.rstrip("/")
                for url in _env_csv("EMBEDDING_FAILOVER_URLS", ())
                if url.rstrip("/")
            ),
            embedding_model=os.getenv("EMBEDDING_MODEL", "bge-m3").strip()
            or "bge-m3",
            embedding_timeout_seconds=_env_float("EMBEDDING_TIMEOUT_SECONDS", 120.0),
            embedding_query_timeout_seconds=_env_float(
                "EMBEDDING_QUERY_TIMEOUT_SECONDS", 2.0
            ),
            embedding_health_timeout_seconds=_env_float(
                "EMBEDDING_HEALTH_TIMEOUT_SECONDS", 2.0
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
            rag_rerank_enabled=_env_bool("RAG_RERANK_ENABLED", False),
            rag_rerank_candidates=_env_int("RAG_RERANK_CANDIDATES", 30),
            rag_law_first_judgment_limit=_env_int(
                "RAG_LAW_FIRST_JUDGMENT_LIMIT", 1
            ),
            rag_law_vector_enabled=_env_bool(
                "RAG_LAW_VECTOR_ENABLED", False
            ),
            rag_law_vector_candidates=_env_int(
                "RAG_LAW_VECTOR_CANDIDATES", 30
            ),
            rag_law_score_threshold=_env_float(
                "RAG_LAW_SCORE_THRESHOLD", 0.25
            ),
            rag_law_article_limit=_env_int("RAG_LAW_ARTICLE_LIMIT", 4),
            rag_law_article_limit_law_first=_env_int(
                "RAG_LAW_ARTICLE_LIMIT_LAW_FIRST", 6
            ),
            rag_law_candidate_article_limit=_env_int(
                "RAG_LAW_CANDIDATE_ARTICLE_LIMIT", 8
            ),
            rag_law_rerank_weight=_env_float(
                "RAG_LAW_RERANK_WEIGHT", 0.15
            ),
            rag_law_rerank_max_chars=_env_int(
                "RAG_LAW_RERANK_MAX_CHARS", 600
            ),
            rerank_url=os.getenv("RERANK_URL", "").rstrip("/"),
            rerank_fallback_url=os.getenv(
                "RERANK_FALLBACK_URL", ""
            ).rstrip("/"),
            rerank_model=os.getenv(
                "RERANK_MODEL", "bge-reranker-v2-m3"
            ).strip()
            or "bge-reranker-v2-m3",
            rerank_timeout_seconds=_env_float("RERANK_TIMEOUT_SECONDS", 3.0),
            rerank_connect_timeout_seconds=_env_float(
                "RERANK_CONNECT_TIMEOUT_SECONDS", 0.75
            ),
            rerank_max_chars=_env_int("RERANK_MAX_CHARS", 1200),
            judgment_index_max_chars=_env_int("JUDGMENT_INDEX_MAX_CHARS", 1600),
            opendata_judicial_account=os.getenv(
                "OPENDATA_JUDICIAL_GOV_TW_ACCOUNT", ""
            ).strip(),
            opendata_judicial_password=os.getenv(
                "OPENDATA_JUDICIAL_GOV_TW_PASSWORD", ""
            ),
            judgment_download_category=os.getenv(
                "JUDGMENT_DOWNLOAD_CATEGORY", "051"
            ).strip()
            or "051",
            judgment_download_start_id=_env_int(
                "JUDGMENT_DOWNLOAD_START_ID", 71644
            ),
            judgment_download_known_latest_id=_env_int(
                "JUDGMENT_DOWNLOAD_KNOWN_LATEST_ID", 72011
            ),
            judgment_download_allow_off_hours=_env_bool(
                "JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS", True
            ),
            judgment_raw_rar_keep_versions=_env_bool(
                "JUDGMENT_RAW_RAR_KEEP_VERSIONS", True
            ),
            judgment_raw_parquet_keep_versions=_env_bool(
                "JUDGMENT_RAW_PARQUET_KEEP_VERSIONS", False
            ),
            judgment_vector_history_collection=os.getenv(
                "JUDGMENT_VECTOR_HISTORY_COLLECTION",
                "judgment_documents_history",
            ).strip()
            or "judgment_documents_history",
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
        legal_article_vector_collection: str | None = None,
        legal_article_vector_alias: str | None = None,
        legal_article_vector_collection_prefix: str | None = None,
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
        if legal_article_vector_collection:
            changes["legal_article_vector_collection"] = (
                legal_article_vector_collection
            )
        if legal_article_vector_alias:
            changes["legal_article_vector_alias"] = legal_article_vector_alias
        if legal_article_vector_collection_prefix:
            changes["legal_article_vector_collection_prefix"] = (
                legal_article_vector_collection_prefix
            )
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
