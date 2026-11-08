from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session, sessionmaker

from ..config import Settings
from ..judgment_import import load_law_list
from ..judgment_raw_parquet import raw_judgment_files
from ..models import JudgmentDocument, LawDocument
from ..observability import traced
from ..vector_store import QdrantError, QdrantStore

SOURCE_OPTIONS = [
    {"value": "all", "label": "全部"},
    {"value": "law", "label": "法規（法律）"},
    {"value": "order", "label": "命令"},
]

SORT_OPTIONS = [
    {"value": "law_name:asc", "label": "名稱 A → Z"},
    {"value": "article_count:desc", "label": "條文數多 → 少"},
    {"value": "law_modified_date:desc", "label": "異動日期新 → 舊"},
    {"value": "id:desc", "label": "最新建立"},
    {"value": "started_at:desc", "label": "執行時間新 → 舊"},
]

LAW_POSTGRES_TABLES = {
    "law_documents": {
        "label": "法規中繼資料",
        "description": "現行與歷史法規的 metadata、條文數與版本狀態",
    },
    "law_dataset_versions": {
        "label": "資料版本",
        "description": "每次成功匯入的 ZIP／Parquet 版本與雜湊",
    },
    "download_runs": {
        "label": "下載執行紀錄",
        "description": "每次下載、解析與資料庫更新的結果",
    },
}

JUDGMENT_POSTGRES_TABLES = {
    "judgment_documents": {
        "label": "判決文件",
        "description": "已篩選命中金融法規清單的判決全文與引用",
    },
    "judgment_import_runs": {
        "label": "判決匯入紀錄",
        "description": "每次判決掃描、篩選與寫入的結果",
    },
}

POSTGRES_TABLES = {**LAW_POSTGRES_TABLES, **JUDGMENT_POSTGRES_TABLES}

JUDGMENT_PARQUET_COLUMNS = [
    {"value": "jid", "label": "案號"},
    {"value": "court_normalized", "label": "法院"},
    {"value": "title", "label": "案由"},
    {"value": "jdate", "label": "裁判日期"},
    {"value": "matched_laws", "label": "命中法規"},
    {"value": "citation_count", "label": "引用數"},
    {"value": "full_text_length", "label": "全文長度"},
    {"value": "source_archive", "label": "來源壓縮檔"},
    {"value": "pdf_url", "label": "PDF"},
]

PARQUET_COLUMNS = [
    {"value": "law_name", "label": "法規名稱"},
    {"value": "law_level", "label": "法規位階"},
    {"value": "law_category", "label": "法規類別"},
    {"value": "law_modified_date", "label": "異動日期"},
    {"value": "article_count", "label": "條文數"},
    {"value": "source_update_date", "label": "來源更新日期"},
    {"value": "content_hash", "label": "內容雜湊"},
    {"value": "raw_json", "label": "完整原始 JSON"},
]


def _option(value: Any, label: Optional[str] = None) -> Dict[str, str]:
    return {"value": str(value), "label": label if label is not None else str(value)}


def _distinct(
    session_factory: sessionmaker[Session],
    column,
    *,
    current_only: bool = True,
    limit: int = 80,
) -> List[str]:
    try:
        with session_factory() as session:
            statement = select(column).where(column.is_not(None), column != "")
            if current_only:
                statement = statement.where(LawDocument.is_current.is_(True))
            statement = statement.distinct().order_by(column).limit(limit)
            return [str(value) for value in session.scalars(statement) if value]
    except Exception:
        return []


def _postgres_fields(
    session_factory: sessionmaker[Session],
    levels: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    levels = levels if levels is not None else _distinct(
        session_factory, LawDocument.law_level
    )
    categories = categories if categories is not None else _distinct(
        session_factory, LawDocument.law_category
    )
    table_options = [
        _option(key, value["label"]) for key, value in LAW_POSTGRES_TABLES.items()
    ]
    return [
        {
            "key": "table",
            "label": "資料表",
            "type": "select",
            "default": "law_documents",
            "options": table_options,
            "help": "選擇要瀏覽的 PostgreSQL 資料表，後續條件會依資料表調整。",
        },
        {
            "key": "source_type",
            "label": "資料類型",
            "type": "select",
            "default": "all",
            "options": SOURCE_OPTIONS,
            "visibleWhen": {
                "table": ["law_documents", "law_dataset_versions", "download_runs"]
            },
        },
        {
            "key": "keyword",
            "label": "關鍵字",
            "type": "text",
            "default": "",
            "placeholder": "法規名稱、類別或英譯名稱",
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "law_level",
            "label": "法規位階",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(v) for v in levels],
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "law_category",
            "label": "法規類別",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(v) for v in categories],
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "modified_from",
            "label": "異動日期起",
            "type": "date",
            "default": "",
            "help": "以法規異動日期篩選，格式 YYYY-MM-DD。",
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "modified_to",
            "label": "異動日期迄",
            "type": "date",
            "default": "",
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "min_articles",
            "label": "條文數下限",
            "type": "number",
            "default": "",
            "min": 0,
            "step": 1,
            "placeholder": "例如 10",
            "visibleWhen": {"table": ["law_documents"]},
        },
        {
            "key": "is_current",
            "label": "僅顯示現行資料",
            "type": "checkbox",
            "default": True,
            "visibleWhen": {"table": ["law_documents", "law_dataset_versions"]},
        },
        {
            "key": "status",
            "label": "執行狀態",
            "type": "select",
            "default": "",
            "options": [
                _option("", "全部"),
                _option("success", "成功"),
                _option("no_change", "無變更"),
                _option("failed", "失敗"),
                _option("running", "執行中"),
            ],
            "visibleWhen": {"table": ["download_runs"]},
        },
        {
            "key": "min_law_count",
            "label": "法規筆數下限",
            "type": "number",
            "default": "",
            "min": 0,
            "step": 1,
            "visibleWhen": {"table": ["law_dataset_versions"]},
        },
        {
            "key": "from_date",
            "label": "日期起",
            "type": "date",
            "default": "",
            "help": "版本表比對下載時間；執行紀錄比對開始時間。",
            "visibleWhen": {"table": ["law_dataset_versions", "download_runs"]},
        },
        {
            "key": "to_date",
            "label": "日期迄",
            "type": "date",
            "default": "",
            "visibleWhen": {"table": ["law_dataset_versions", "download_runs"]},
        },
        {
            "key": "sort",
            "label": "排序",
            "type": "select",
            "default": "law_name:asc",
            "options": SORT_OPTIONS,
            "visibleWhen": {
                "table": ["law_documents", "law_dataset_versions", "download_runs"]
            },
        },
    ]


def _distinct_judgment_courts(
    session_factory: sessionmaker[Session], limit: int = 1000
) -> List[str]:
    try:
        with session_factory() as session:
            statement = (
                select(JudgmentDocument.court_normalized)
                .where(
                    JudgmentDocument.court_normalized.is_not(None),
                    JudgmentDocument.court_normalized != "",
                )
                .distinct()
                .order_by(JudgmentDocument.court_normalized)
                .limit(limit)
            )
            return [str(value) for value in session.scalars(statement) if value]
    except Exception:
        return []


def _judgment_postgres_fields(
    session_factory: sessionmaker[Session],
    law_names: Optional[List[str]] = None,
    courts: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    law_names = law_names or []
    courts = courts if courts is not None else _distinct_judgment_courts(session_factory)
    table_options = [
        _option(key, value["label"]) for key, value in JUDGMENT_POSTGRES_TABLES.items()
    ]
    return [
        {
            "key": "table",
            "label": "資料表",
            "type": "select",
            "default": "judgment_documents",
            "options": table_options,
            "help": "判決文件或判決匯入紀錄；切換後條件會跟著調整。",
        },
        {
            "key": "keyword",
            "label": "關鍵字",
            "type": "text",
            "default": "",
            "placeholder": "案號、法院、案由或命中法規",
            "visibleWhen": {"table": ["judgment_documents"]},
        },
        {
            "key": "court",
            "label": "法院",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(value) for value in courts],
            "visibleWhen": {"table": ["judgment_documents"]},
        },
        {
            "key": "law_name",
            "label": "命中法規／命令",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(value) for value in law_names],
            "visibleWhen": {"table": ["judgment_documents"]},
        },
        {
            "key": "from_date",
            "label": "日期起",
            "type": "date",
            "default": "",
            "visibleWhen": {"table": ["judgment_documents", "judgment_import_runs"]},
        },
        {
            "key": "to_date",
            "label": "日期迄",
            "type": "date",
            "default": "",
            "visibleWhen": {"table": ["judgment_documents", "judgment_import_runs"]},
        },
        {
            "key": "status",
            "label": "匯入狀態",
            "type": "select",
            "default": "",
            "options": [
                _option("", "全部"),
                _option("success", "成功"),
                _option("failed", "失敗"),
                _option("running", "執行中"),
            ],
            "visibleWhen": {"table": ["judgment_import_runs"]},
        },
    ]


def _parquet_fields(
    levels: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    levels = levels or ["憲法", "法律", "命令"]
    categories = categories or []
    return [
        {
            "key": "dataset",
            "label": "資料集",
            "type": "select",
            "default": "all",
            "options": SOURCE_OPTIONS,
            "help": "讀取目前最新的法規／命令 Parquet 快照。",
        },
        {
            "key": "law_level",
            "label": "法規位階",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(v) for v in levels],
        },
        {
            "key": "law_category",
            "label": "法規類別",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(v) for v in categories],
            "help": "類別選項以 PostgreSQL 目前資料為準；留空表示全部。",
        },
        {
            "key": "keyword",
            "label": "關鍵字",
            "type": "text",
            "default": "",
            "placeholder": "法規名稱、類別或位階",
        },
        {
            "key": "min_articles",
            "label": "條文數下限",
            "type": "number",
            "default": "",
            "min": 0,
            "step": 1,
        },
        {
            "key": "modified_from",
            "label": "異動日期起",
            "type": "date",
            "default": "",
        },
        {
            "key": "modified_to",
            "label": "異動日期迄",
            "type": "date",
            "default": "",
        },
        {
            "key": "columns",
            "label": "回傳欄位",
            "type": "multiselect",
            "default": [
                "law_name",
                "law_level",
                "law_category",
                "law_modified_date",
                "article_count",
            ],
            "options": PARQUET_COLUMNS,
            "help": "完整原始 JSON 較大，需要時再勾選。",
        },
        {
            "key": "sort",
            "label": "排序",
            "type": "select",
            "default": "law_name:asc",
            "options": SORT_OPTIONS[:4],
        },
    ]


def _table_entries(mapping: Dict[str, Dict[str, str]]) -> List[Dict[str, str]]:
    return [
        {
            "id": key,
            "label": value.get("label") or key,
            "description": value.get("description") or "",
        }
        for key, value in mapping.items()
    ]


def _judgment_parquet_fields(courts: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    courts = courts or []
    return [
        {
            "key": "table",
            "label": "資料表",
            "type": "select",
            "default": "judgment_documents",
            "options": [
                _option("judgment_documents", "raw.parquet（原始判決）")
            ],
            "help": "讀取原始判決 Parquet；命中法規與引用欄位由原始資料一併保存。",
        },
        {
            "key": "keyword",
            "label": "關鍵字",
            "type": "text",
            "default": "",
            "placeholder": "案號、法院、案由或命中法規",
        },
        {
            "key": "court",
            "label": "法院",
            "type": "select",
            "default": "",
            "options": [_option("", "全部")] + [_option(value) for value in courts],
        },
        {
            "key": "jdate_from",
            "label": "裁判日期起",
            "type": "date",
            "default": "",
        },
        {
            "key": "jdate_to",
            "label": "裁判日期迄",
            "type": "date",
            "default": "",
        },
        {
            "key": "min_citations",
            "label": "引用數下限",
            "type": "number",
            "default": "",
            "min": 0,
            "step": 1,
        },
        {
            "key": "columns",
            "label": "回傳欄位",
            "type": "multiselect",
            "default": [
                "jid",
                "court_normalized",
                "title",
                "jdate",
                "matched_laws",
                "citation_count",
            ],
            "options": JUDGMENT_PARQUET_COLUMNS,
            "help": "只讀取選取的欄位；全文與引用明細不在此 Parquet 查詢載入。",
        },
        {
            "key": "sort",
            "label": "排序",
            "type": "select",
            "default": "jdate:desc",
            "options": [
                _option("jdate:desc", "裁判日期新 → 舊"),
                _option("citation_count:desc", "引用數多 → 少"),
                _option("court:asc", "法院 A → Z"),
                _option("jid:asc", "案號 A → Z"),
            ],
        },
    ]


def _qdrant_fields(category: str = "law") -> List[Dict[str, Any]]:
    if category == "judgment":
        collection_options = [
            _option("judgment_documents", "判決文件（文件級向量）"),
            _option("judgment_segments", "判決片段（預留）"),
        ]
        default_collection = "judgment_documents"
    else:
        collection_options = [
            _option("law_articles", "法規條文"),
            _option("judgment_segments", "判決片段（預留）"),
        ]
        default_collection = "law_articles"
    return [
        {
            "key": "query",
            "label": "語意查詢",
            "type": "text",
            "default": "",
            "placeholder": "例如：銀行法吸收存款的爭議",
        },
        {
            "key": "collection",
            "label": "Collection",
            "type": "select",
            "default": default_collection,
            "options": collection_options,
        },
        {
            "key": "top_k",
            "label": "Top K",
            "type": "number",
            "default": 10,
            "min": 1,
            "max": 100,
            "step": 1,
        },
        {
            "key": "score_threshold",
            "label": "相似度門檻",
            "type": "number",
            "default": 0.7,
            "min": 0,
            "max": 1,
            "step": 0.01,
        },
    ]


def _indexeddb_fields() -> List[Dict[str, Any]]:
    return [
        {
            "key": "store",
            "label": "Object Store",
            "type": "select",
            "default": "query_history",
            "options": [
                _option("query_history", "查詢歷史"),
                _option("settings", "本機設定"),
            ],
            "help": "IndexedDB 僅存在於瀏覽器，不會上傳到伺服器。",
        },
        {
            "key": "keyword",
            "label": "關鍵字",
            "type": "text",
            "default": "",
            "placeholder": "篩選查詢內容、摘要或設定值",
            "help": "報表右下方可調整每頁筆數。",
        },
    ]


def _parquet_available(data_dir: Path) -> bool:
    try:
        return any((data_dir / "raw_parquet").glob("*/*/*/laws.parquet"))
    except OSError:
        return False


def _postgres_status(
    session_factory: sessionmaker[Session],
) -> tuple[bool, str]:
    try:
        with session_factory() as session:
            session.execute(text("SELECT 1"))
        return True, "連線正常"
    except Exception as exc:
        return False, f"無法連線：{exc.__class__.__name__}"


def _judgment_count(session_factory: sessionmaker[Session]) -> int:
    try:
        with session_factory() as session:
            return int(
                session.scalar(select(func.count()).select_from(JudgmentDocument)) or 0
            )
    except Exception:
        return 0


def _qdrant_status(
    collection: str, *, base_url: str, api_key: str = ""
) -> tuple[bool, str, str]:
    base_url = base_url.rstrip("/")
    if not base_url:
        return False, "not_configured", "尚未設定 QDRANT_URL"
    store = QdrantStore(base_url, api_key=api_key, timeout=2.5)
    try:
        info = store.collection_info(collection)
    except QdrantError as exc:
        return True, "degraded", f"{exc.__class__.__name__} · {base_url}"
    if info is None:
        return True, "degraded", f"已連線 {base_url}；collection「{collection}」尚未建立"
    points = int(info.get("points_count") or 0)
    return True, "operational", f"{points:,} points · {collection}"


@traced("catalog.build", module=__name__, params_fn=lambda *args, **kwargs: {})
def build_catalog(
    session_factory: sessionmaker[Session],
    data_dir: Path,
    *,
    settings: Optional[Settings] = None,
    judgment_law_list: Optional[Path] = None,
) -> Dict[str, Any]:
    settings = settings or Settings.from_env()
    data_dir = Path(data_dir).expanduser().resolve()
    postgres_ok, postgres_detail = _postgres_status(session_factory)
    levels = _distinct(session_factory, LawDocument.law_level)
    categories = _distinct(session_factory, LawDocument.law_category)
    judgment_count = _judgment_count(session_factory)
    judgment_law_names: List[str] = []
    if judgment_law_list is not None:
        try:
            judgment_law_names = [
                str(entry["name"])
                for entry in load_law_list(judgment_law_list).entries
            ]
        except Exception:
            judgment_law_names = []
    judgment_courts = _distinct_judgment_courts(session_factory)
    judgment_collection = settings.judgment_vector_collection
    law_qdrant_available, law_qdrant_status, law_qdrant_detail = _qdrant_status(
        "law_articles",
        base_url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )
    judgment_qdrant_available, judgment_qdrant_status, judgment_qdrant_detail = (
        _qdrant_status(
            judgment_collection,
            base_url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
        )
    )
    parquet_available = _parquet_available(data_dir)
    judgment_parquet_paths = raw_judgment_files(settings.judgment_data_dir)
    judgment_parquet_available = bool(judgment_parquet_paths)

    law_databases = [
        {
            "id": "postgres",
            "label": "PostgreSQL",
            "shortLabel": "SQL",
            "description": "法規、版本與下載紀錄",
            "icon": "database",
            "available": postgres_ok,
            "status": "operational" if postgres_ok else "unavailable",
            "detail": postgres_detail,
            "fields": _postgres_fields(session_factory, levels, categories),
            "tables": _table_entries(LAW_POSTGRES_TABLES),
        },
        {
            "id": "parquet",
            "label": "Parquet",
            "shortLabel": "PARQUET",
            "description": "原始法規 Parquet",
            "icon": "layers",
            "available": parquet_available,
            "status": "operational" if parquet_available else "not_configured",
            "detail": "讀取原始法規 Parquet"
            if parquet_available
            else "尚未產生 Parquet 檔",
            "fields": _parquet_fields(levels, categories),
            "tables": [
                {
                    "id": "law_documents",
                    "label": "原始法規命令 Parquet",
                    "description": "原始 laws.parquet（法規與命令）",
                }
            ],
        },
        {
            "id": "qdrant",
            "label": "Qdrant",
            "shortLabel": "VECTOR",
            "description": "法規向量索引",
            "icon": "cube",
            "available": bool(law_qdrant_available),
            "status": law_qdrant_status,
            "detail": law_qdrant_detail,
            "fields": _qdrant_fields("law"),
            "tables": [
                {"id": "law_articles", "label": "law_articles", "description": "法規條文向量"},
                {"id": "judgment_segments", "label": "judgment_segments", "description": "判決片段向量（預留）"},
            ],
        },
        {
            "id": "indexeddb",
            "label": "IndexedDB",
            "shortLabel": "LOCAL",
            "description": "瀏覽器本機紀錄",
            "icon": "browser",
            "available": True,
            "status": "operational",
            "detail": "由瀏覽器端直接查詢",
            "fields": _indexeddb_fields(),
            "tables": [
                {"id": "query_history", "label": "query_history", "description": "提問與查詢歷史"},
                {"id": "settings", "label": "settings", "description": "瀏覽器本機設定"},
            ],
        },
    ]

    judgment_databases = [
        {
            "id": "postgres",
            "label": "PostgreSQL",
            "shortLabel": "SQL",
            "description": "判決全文與匯入紀錄",
            "icon": "database",
            "available": postgres_ok,
            "status": "operational" if postgres_ok else "unavailable",
            "detail": (
                f"已匯入 {judgment_count:,} 筆判決"
                if postgres_ok
                else postgres_detail
            ),
            "fields": _judgment_postgres_fields(
                session_factory, judgment_law_names, judgment_courts
            ),
            "tables": _table_entries(JUDGMENT_POSTGRES_TABLES),
        },
        {
            "id": "parquet",
            "label": "Parquet",
            "shortLabel": "PARQUET",
            "description": "原始判決 Parquet",
            "icon": "layers",
            "available": judgment_parquet_available,
            "status": "operational" if judgment_parquet_available else "not_configured",
            "detail": "讀取原始判決 raw.parquet"
            if judgment_parquet_available
            else "尚未產生原始判決 Parquet；請先執行 judgment-import-judgments --raw-only",
            "fields": _judgment_parquet_fields(judgment_courts),
            "tables": [
                {
                    "id": "judgment_documents",
                    "label": "原始判決 Parquet",
                    "description": "原始 raw.parquet（完整判決 JSON 與查詢欄位）",
                }
            ],
        },
        {
            "id": "qdrant",
            "label": "Qdrant",
            "shortLabel": "VECTOR",
            "description": "判決向量索引",
            "icon": "cube",
            "available": bool(judgment_qdrant_available),
            "status": judgment_qdrant_status,
            "detail": judgment_qdrant_detail,
            "fields": _qdrant_fields("judgment"),
            "tables": [
                {"id": "judgment_documents", "label": "judgment_documents", "description": "判決文件級向量"},
                {"id": "judgment_segments", "label": "judgment_segments", "description": "判決片段向量（預留）"},
            ],
        },
        {
            "id": "indexeddb",
            "label": "IndexedDB",
            "shortLabel": "LOCAL",
            "description": "瀏覽器本機紀錄",
            "icon": "browser",
            "available": True,
            "status": "operational",
            "detail": "由瀏覽器端直接查詢",
            "fields": _indexeddb_fields(),
            "tables": [
                {"id": "query_history", "label": "query_history", "description": "提問與查詢歷史"},
                {"id": "settings", "label": "settings", "description": "瀏覽器本機設定"},
            ],
        },
    ]

    judgment_description = (
        f"只包含引用金融法規清單的判決，目前 {judgment_count:,} 筆"
        if judgment_count
        else "只包含引用金融法規清單的判決；尚未匯入資料"
    )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "categories": [
            {
                "id": "law",
                "label": "法規命令",
                "description": "法規、命令、版本與下載紀錄",
                "databases": law_databases,
            },
            {
                "id": "judgment",
                "label": "判決",
                "description": judgment_description,
                "count": judgment_count,
                "databases": judgment_databases,
            },
        ],
    }
