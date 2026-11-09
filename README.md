# Judgment RAG

判決檢索與法規引用問答系統。目前已包含「法規／命令資料下載」與「判決金融法規篩選匯入」模組，以及以 FastAPI + Vanilla JS 建置的 Web 主控台：從全國法規資料庫下載最新資料、判斷是否有新版、將原始資料寫入 Parquet、把版本與中繼資料寫入 PostgreSQL；判決資料會先將 RAR 內原始 JSON 寫入不可變的原始 Parquet 備份，再依金融法規清單篩選後寫入 PostgreSQL，最後建立 Qdrant 向量索引，透過本機 Ollama 提供有引用依據的 RAG 回答。

## 法規下載模組

### 資料來源

| 類型 | 端點 | 壓縮檔內檔案 |
| --- | --- | --- |
| 法規（法律） | <https://law.moj.gov.tw/api/ch/law/json> | `ChLaw.json` |
| 命令 | <https://law.moj.gov.tw/api/ch/order/json> | `ChOrder.json` |

端點回傳的是 ZIP 壓縮檔（內含 JSON 與 schema/manifest CSV），不是裸 JSON。下載後會驗證 ZIP 結構、JSON 編碼與 `Laws` 陣列。

### 處理流程

1. 建立 `download_runs` 執行紀錄（`running`）。
2. 下載 ZIP，計算 ZIP 與原始 JSON 的 SHA-256；遇到 429、5xx 或網路錯誤會重試。
3. 與資料庫中最新版本的 `raw_json_sha256` 比對；相同即為 `no_change`，不重新解析。
4. 解析法規並計算語意雜湊（依 `law_key` 排序後，對每筆法規內容雜湊再彙總）。
5. 語意雜湊相同時視為 `no_change`，可忽略 JSON 欄位順序或格式差異。
6. 有新版本時：
   - 保存原始 ZIP 與 manifest。
   - 將每筆法規寫成一列 Parquet（含完整 `raw_json` 與巢狀 `law_articles`）。
   - 在 PostgreSQL 建立 `law_dataset_versions` 版本，更新 `law_documents`，寫入 `law_article_versions` 條文快照，並記錄法規層級與條文層級的 `added`／`modified`／`removed` 變更事件。
7. 更新 `download_runs` 與 `law_sources` 狀態。
8. 若寫入資料庫失敗，會清除本次新產生但未被引用的檔案。

### 新版本判斷

- **原始雜湊**：ZIP 內 JSON 位元組的 SHA-256，用於快速跳過未變動的下載。
- **語意雜湊**：`SHA256(law_key + ":" + content_hash)` 依 `law_key` 排序後彙總；`content_hash` 是單筆法規正規化 JSON 的 SHA-256。
- 因此 API 只調整 JSON 欄位順序、空白或外層 `UpdateDate` 時，不會產生新版本；條文或法規中繼資料變動才會建立新版本。
- 全國法規 API 未提供可用的 `ETag`／`Last-Modified` 版本查詢（`HEAD` 回傳 405），因此每次檢查仍需下載完整壓縮檔，再以雜湊判斷是否更新。
- 舊版本不會被覆蓋：每次新版本都保留獨立的 ZIP、Parquet 與資料庫版本紀錄。被移除的法規只標記 `is_current = false`，不刪除歷史資料。

## 環境需求

- Python 3.12（`.python-version` 已固定；避免 3.14 尚無 `pyarrow` wheel）
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL 16（本機可用 `docker compose` 啟動）

## 快速開始

```bash
# 安裝依賴（含測試與 lint）
uv sync --extra dev

# 啟動本機 PostgreSQL
docker compose up -d postgres

# 建立設定檔
cp .env.example .env
# 依環境修改 DATABASE_URL、LAW_DATA_DIR

# 下載法規與命令，寫入 Parquet 與 PostgreSQL
uv run judgment-law-download --source all
```

只處理單一來源：

```bash
uv run judgment-law-download --source law --data-dir ./data/laws
uv run judgment-law-download --source order --data-dir ./data/laws
```

既有資料補建條文版本：

```bash
uv run judgment-backfill-law-articles --data-dir ./data/laws
```

其他選項：

```text
--source {all,law,order}   要下載的資料集（預設 all）
--data-dir PATH            覆寫 LAW_DATA_DIR
--database-url URL         覆寫 DATABASE_URL
--log-level LEVEL          DEBUG / INFO / WARNING / ERROR
--skip-init-db             不自動建立資料表
```

成功時 CLI 會輸出 JSON 摘要，例如：

```json
[
  {
    "source_type": "law",
    "status": "success",
    "message": "new version 1: +1351 ~0 -0 =0",
    "version_id": 1,
    "law_count": 1351,
    "article_count": 47377,
    "parquet_path": "/data/laws/parquet/law/20261030/52a175716a11e2c5/laws.parquet"
  }
]
```

重複執行且來源未變動時，`status` 會是 `no_change`，不會新增版本或重複寫入檔案。

### 啟動 Web 主控台

```bash
# 一鍵啟動 PostgreSQL、Qdrant、後端與本機電源控制器
./up.sh

# 停止後端、電源控制器與 Docker 服務（保留 PostgreSQL／Qdrant volume）
./down.sh

# 或手動啟動後端
uv run judgment-web --host 127.0.0.1 --port 9200 --data-dir ./data/laws
```

`up.sh` 會依序啟動 Docker Compose 的 PostgreSQL 與 Qdrant、等待健康檢查、探測 x570 Ollama 的 `bge-m3`，在 `127.0.0.1:9200` 啟動後端，並確認 `127.0.0.1:9201` 電源控制器可用；重複執行不會啟動第二個後端。若 x570 不可用，`up.sh` 會立即把 `EMBEDDING_URL` 改成本機 Ollama；x570 可用時則以本機作為 runtime fallback。若 `frontend/` 尚未建立或來源檔較新，會先重新產生 standalone 前端。日誌位於 `.run/web.log`，啟動完成後會印出系統測試網址。`down.sh` 會先停止後端與控制器（必要時強制結束），再執行 `docker compose stop`，不會刪除 `judgment_pgdata` 或 `judgment_qdrant` volume。可用 `JUDGMENT_PORT` 與 `JUDGMENT_POWER_PORT` 覆寫連接埠；設定 `JUDGMENT_SKIP_QDRANT=1` 可略過 Qdrant，`JUDGMENT_SKIP_DOCKER=1` 可略過 Docker 啟動／停止，`JUDGMENT_POWER_AGENT=0` 可停用電源控制器。

開啟 <http://127.0.0.1:9200/>，預設進入 RAG 提問頁。主控台是純靜態的 Vanilla JS SPA，由 FastAPI 直接服務，原始碼模式不需要 Node.js 建置步驟。若要以 `file://` 直接開啟，或部署到 Cloudflare Pages，請先產生 `frontend/`，見〈靜態前端與部署〉。

`judgment-web` 啟動時會自動在 `127.0.0.1:9201` 建立本機電源控制器，供 `./up.sh`／`./down.sh` 與電源 API 使用；header 右上角現在是**系統測試**入口，測試模式與 API 連線設定都整合在該頁。設定 `JUDGMENT_POWER_AGENT=0` 可停用控制器。

### 完整環境備份與還原

`backup.sh` 會先檢查專案、資料目錄、Docker／PostgreSQL／Qdrant collection、備份目錄空間與執行中的處理程序，再匯出到指定的空目錄：

```bash
./backup.sh -s /path/to/judgment -d /Volumes/USB/judgment-backup-20261108
```

`-s` 可省略（預設為 `backup.sh` 所在專案），`-d` 必須是新的空目錄。備份內容包含：

- `data/`：判決 RAR、原始判決 Parquet、法規／命令原始資料
- `postgres/judgment.dump`：`pg_dump -Fc`，含判決、法規 metadata 與 `judgment_vector_index`
- `qdrant/`：`judgments_current` alias 指向的 active collection snapshot；manifest 同時記錄 alias 與 physical collection。若當時 alias 不存在，才使用 `JUDGMENT_VECTOR_COLLECTION`。
- `config/`：`.env`、`docker-compose.yml`、`pyproject.toml`、`uv.lock`
- `manifest.json`、checksums、`restore.sh` 與 `USAGE.md`（兩個腳本的使用說明）

`restore.sh` 會直接複製到備份目錄根目錄，並產生 `USAGE.md`。偵測到索引／匯入／下載程序執行中時會中止，避免 PostgreSQL 與 Qdrant 進度不一致；只有確定只備份部分資料時才使用 `--allow-running`。

在新電腦上，先 clone 專案，然後直接執行備份目錄中的 `restore.sh`：

```bash
cd /Volumes/USB/judgment-backup-20261108
./restore.sh -d /path/to/judgment
```

也可以從專案執行：

```bash
./restore.sh -s /Volumes/USB/judgment-backup-20261108 -d /path/to/judgment
```

`restore.sh` 會先檢查目標是否已 clone 專案（`pyproject.toml`、`src/judgment`、`up.sh`）、Docker 是否可用、備份 manifest／checksum 與目標磁碟空間。`-d` 是目標專案目錄；`-s` 可省略，預設為 `restore.sh` 所在備份目錄。

還原流程會：

1. 停止目前後端與 Docker 服務
2. 還原 `.env`、PostgreSQL dump 與 Qdrant collection snapshot
3. 將 `data/judgments`、`data/laws` 複製回 `.env` 指定的位置
4. 執行 `uv sync`（可用 `--no-deps` 略過）
5. 執行 `./up.sh` 啟動後端（可用 `--no-start` 略過）

可用 `--dry-run` 先檢查備份內容與目標路徑。`restore.sh` 會覆蓋 PostgreSQL schema 與 Qdrant collection，執行前會要求輸入 `YES` 確認；自動化環境可加 `--yes`。

> PostgreSQL 的 `judgment_vector_index` 必須與 Qdrant collection 一起還原。若只還原 PostgreSQL、Qdrant 是空的，索引器會誤以為部分索引已完成；此時必須先 `DELETE FROM judgment_vector_index;` 再重新索引。若只還原 Qdrant、PostgreSQL 是空的，則會重新 embedding 全部判決。還原時 `restore.sh` 會依 manifest 的 alias mapping 重建 `judgments_current`。

以目前資料量估算，完整備份約需 16–18 GB 以上空間（`data/` 約 13 GB、PostgreSQL dump 約 2 GB、Qdrant snapshot 約 1.5 GB，索引越大會再增加）；建議使用 32 GB 以上的 USB，並加密保存，因為 `config/.env` 可能包含資料庫密碼。

## 設定

| 環境變數 | 預設值 | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://judgment:judgment@localhost:5432/judgment` | PostgreSQL 連線字串 |
| `LAW_DATA_DIR` | `/data/laws` | 法規產物根目錄（與判決資料 `/data/judgments` 分開）；`.env.example` 本機預設為 `./data/laws` |
| `JUDGMENT_DATA_DIR` | `/data/judgments` | 判決資料根目錄；原始 `.rar` 可放在根目錄或 `raw_rar/` 子目錄。`.env.example` 本機預設為 `./data/judgments` |
| `JUDGMENT_LAW_LIST` | `documents/金融法規.md` | 判決納入資料庫所依據的金融法規白名單 |
| `LAW_API_URL` | 全國法規「中文法規」端點 | 法規來源 |
| `ORDER_API_URL` | 全國法規「中文命令」端點 | 命令來源 |
| `HTTP_TIMEOUT_SECONDS` | `300` | HTTP 逾時秒數 |
| `HTTP_RETRIES` | `3` | 下載重試次數 |
| `USER_AGENT` | `judgment-law-downloader/0.1` | 請求 User-Agent |
| `LOG_LEVEL` | `INFO` | 日誌等級 |
| `AUTO_CREATE_SCHEMA` | `true` | 啟動時自動建立缺少的資料表 |
| `MAX_UNCOMPRESSED_BYTES` | `536870912` | 解壓後 JSON 大小上限（512 MiB） |
| `CORS_ALLOW_ORIGINS` | `*` | 允許呼叫 API 的前端來源，以逗號分隔；`*` 僅供本機開發 |
| `FORWARDED_ALLOW_IPS` | `*` | 信任 `X-Forwarded-*` 的來源；cloudflared 位於本機時使用 `*` |
| `JUDGMENT_POWER_AGENT` | `1` | 啟動時自動建立 `127.0.0.1:9201` 電源控制器；設為 `0` 可停用 |
| `PERFORMANCE_RETENTION_DAYS` | `90` | 效能紀錄保留天數；實際清理時不會低於 90 天 |
| `QDRANT_URL` | 空 | Qdrant 連線位址；`.env.example` 本機預設 `http://127.0.0.1:6333` |
| `QDRANT_API_KEY` | 空 | Qdrant API key（本機不需要） |
| `JUDGMENT_VECTOR_COLLECTION` | `judgment_documents` | 判決文件級向量 collection（legacy 實體名稱） |
| `JUDGMENT_VECTOR_ALIAS` | `judgments_current` | 正式查詢使用的 Qdrant alias |
| `JUDGMENT_VECTOR_COLLECTION_PREFIX` | `judgments` | 版本化實體 collection 前綴，例如 `judgments_v002` |
| `JUDGMENT_EMBEDDING_VERSION` | `bge-m3@v1` | 向量重用指紋的一部分；模型或前處理改變時必須更新 |
| `JUDGMENT_INDEX_RECIPE_VERSION` | `doc-head-tail-v1` | index text 規則版本；會自動附加 max_chars |
| `EMBEDDING_URL` | 空 | 主要 Ollama embedding API；本機預設 `http://127.0.0.1:11434` |
| `EMBEDDING_FALLBACK_URL` | 空 | 主要 embedding API 無法連線時的本機 fallback；`up.sh` 會自動設定 |
| `JUDGMENT_X570_EMBEDDING_URL` | `http://x570:11434` | `up.sh` 啟動時探測的 x570 Ollama |
| `JUDGMENT_LOCAL_EMBEDDING_URL` | `http://127.0.0.1:11434` | x570 不可用時使用的本機 Ollama |
| `JUDGMENT_EMBEDDING_PROBE_TIMEOUT` | `2` | `up.sh` 探測 Ollama 的逾時秒數 |
| `EMBEDDING_MODEL` | `bge-m3` | 判決與查詢使用的 embedding 模型（1024 維） |
| `EMBEDDING_TIMEOUT_SECONDS` | `120` | Embedding 請求逾時 |
| `LLM_URL` | 空 | Ollama API 位址；本機預設 `http://127.0.0.1:11434` |
| `LLM_MODEL` | 空 | RAG 回答模型；`.env.example` 快速預設 `gemma3:4b`，品質優先可改 `gemma3:27b` |
| `LLM_TIMEOUT_SECONDS` | `180` | LLM 請求逾時 |
| `LLM_NUM_CTX` | `4096` | Ollama context window |
| `LLM_NUM_PREDICT` | `384` | 最多生成 tokens；降低可縮短回答時間 |
| `LLM_KEEP_ALIVE` | `30m` | Ollama 模型保持載入時間，避免反覆載入 |
| `RAG_TOP_K` | `4` | 每次回答檢索的判決數 |
| `RAG_SCORE_THRESHOLD` | `0.35` | 向量相似度下限；低於門檻不提供給 LLM |
| `RAG_MAX_CONTEXT_CHARS` | `4000` | 提供給 LLM 的判決片段總字數上限 |
| `JUDGMENT_INDEX_MAX_CHARS` | `1600` | 每筆判決 embedded 的頭尾視窗字數 |
| `JUDGMENT_PROCESSING_STATE` | `.run/processing_state.json` | 資料處理共用狀態檔；Web、匯入、Parquet、索引與下載程序都會寫入同一個檔案。測試會以環境變數隔離，不會覆寫正式狀態。 |
| `TEST_EMBEDDING_MODELS` | 空 | 測試模式要跑的 embedding 模型（逗號分隔）；空值自動從 Ollama 偵測 |
| `TEST_LLM_MODELS` | 空 | 測試模式要跑的 LLM 模型（逗號分隔）；空值自動從 Ollama 偵測 |

## 檔案配置

`LAW_DATA_DIR` 下的結構：

```text
/data/laws/
├── raw/
│   └── law/20261030/b8533d2feed281b0.zip
├── parquet/
│   └── law/20261030/52a175716a11e2c5/laws.parquet
├── manifests/
│   └── law/20261030/52a175716a11e2c5.json
└── tmp/
```

- 分區目錄使用來源 `UpdateDate` 的 `YYYYMMDD`。
- ZIP 檔名使用 ZIP SHA-256 前 16 碼；Parquet 與 manifest 使用語意雜湊前 16 碼。
- 所有寫入先落到 `tmp/`，再以原子 rename 移到目的地。
- `parquet_path` 與 `zip_path` 會以絕對路徑寫入 PostgreSQL。

### Parquet 欄位

每列代表一筆法規／命令，主要欄位如下：

| 欄位 | 說明 |
| --- | --- |
| `source_type` | `law` 或 `order` |
| `source_url`、`source_update_date` | 來源與來源更新日期 |
| `zip_sha256`、`raw_json_sha256`、`semantic_sha256` | 三種版本識別 |
| `fetched_at` | 下載時間（UTC） |
| `law_key` | 優先使用 `LawURL`，否則 `name:<法規名稱>` |
| `law_name`、`law_level`、`law_category`、`law_url` | 法規基本資料 |
| `law_modified_date`、`law_effective_date`、`law_effective_note` | 異動與生效資訊 |
| `law_abandon_note`、`law_has_eng_version`、`eng_law_name` | 廢止與英譯資訊 |
| `law_attachments_json`、`law_histories`、`law_foreword` | 附件、沿革、前言 |
| `article_count` | `ArticleType == "A"` 的條文數（不含章節標題 `C`） |
| `content_hash` | 單筆法規正規化 JSON 的 SHA-256 |
| `raw_json` | 該筆法規的完整原始 JSON（正規化排序） |
| `law_articles` | 巢狀條文陣列：`article_type`、`article_no`、`article_content` |

## PostgreSQL 資料表

| 資料表 | 用途 |
| --- | --- |
| `law_sources` | 每個來源的最後檢查時間、最後變更時間 |
| `law_dataset_versions` | 每次成功匯入的版本；保留 ZIP/Parquet 路徑、三種雜湊、數量與 `is_current` |
| `law_documents` | 每筆法規的現行中繼資料、首次／最後出現版本、移除版本與 `is_current` |
| `law_change_events` | 法規層級的 `added`／`modified`／`removed` 事件、變更欄位與前後中繼資料 |
| `law_article_versions` | 每個法規版本的完整條文快照；`law_id + law_version_id + article_key` 唯一 |
| `law_article_change_events` | 條文層級的 `added`／`modified`／`removed` 事件、變更前後內容與版本 |
| `download_runs` | 每次執行的狀態、HTTP 狀態、耗時、雜湊、數量、錯誤訊息與版本關聯 |

查看目前版本：

```sql
SELECT id, source_type, update_date, law_count, article_count, is_current
FROM law_dataset_versions
ORDER BY id DESC
LIMIT 5;

SELECT change_type, count(*)
FROM law_change_events
GROUP BY change_type;

SELECT change_type, count(*)
FROM law_article_change_events
GROUP BY change_type;
```

### 法規條文版本

法規下載現在會為每個 `law_dataset_versions` 建立完整的 `law_article_versions` 條文快照：

- `article_key` 由 `article_type` 與 `article_no` 組成，例如 `A:第 19 條`。
- `content_hash` 用於判斷同一條文是否在新版本中變更。
- `law_article_change_events` 記錄條文層級的 `added`／`modified`／`removed`、變更前後內容、來源版本與目標版本。
- 既有資料可用 `uv run judgment-backfill-law-articles --data-dir ./data/laws` 補建；命令可重複執行，已回填的版本會跳過。
- `GET /api/law` 預設回傳目前版本；加上 `version_id=1` 可讀取指定歷史版本，回應包含 `versions`、`selected_version_id`、`change_summary` 與 `changes`。加上 `article_no=第%2019%20條` 只回傳該條文，可用來直接開啟單一條款。
- 資料頁的法規報表提供「條文版本」下拉選單；歷史版本會標示提醒，條文變更以可展開的「版本變更」區塊呈現。

```bash
# 指定歷史版本
curl "http://127.0.0.1:9200/api/law?source_type=law&law_key=...&version_id=1"
```

## 判決匯入與金融法規篩選

判決 `.rar` 原始檔放在 `JUDGMENT_DATA_DIR/raw_rar/`（預設 `/data/judgments/raw_rar`；本機可用 `./data/judgments/raw_rar`），匯入器也相容根目錄下的 `.rar`。以 `documents/金融法規.md` 作為納入資料庫的白名單。系統會從判決全文擷取「法規名稱＋條號」的引用；只有至少命中清單中一項法規或命令的判決，才會寫入 PostgreSQL 的 `judgment_documents`。

```bash
# 完整匯入；--replace 會在成功後移除本次未命中的舊資料
uv run judgment-import-judgments \
  --data-dir ./data/judgments \
  --law-list ./documents/金融法規.md \
  --replace

# 只補建既有 RAR 的原始 Parquet 備份，不重新篩選或匯入
uv run judgment-import-judgments \
  --data-dir ./data/judgments \
  --law-list ./documents/金融法規.md \
  --raw-only
```

- `--dry-run`：只掃描與統計，不寫入資料庫。
- `--raw-only`：只建立原始 Parquet 備份，不篩選、不寫入 PostgreSQL；可用來補建既有 `.rar` 的原始備份。
- `--limit 2000`：限制 DuckDB 候選處理筆數，適合測試。
- `--archive PATH`：只處理指定的 `.rar`，可重複指定。
- `--batch-size 500`：調整每批寫入筆數。
- 匯入過程使用 macOS 內建的 `bsdtar` 讀取 RAR；Linux 需安裝 `libarchive-tools`。
- 每次匯入會寫入 `judgment_import_runs`，記錄掃描、命中、寫入、引用數與耗時。
- 匯入前會先將解壓縮後的每個 JSON 物件寫入 `parquet/raw_judgments/.../raw.parquet`；`raw_json` 保留原始文字內容，且包含未命中金融法規的判決，作為不可變的原始備份。
- 未命中的判決不會寫入資料庫，但會保留在原始 Parquet 備份與原始 `.rar` 中。

### DuckDB 候選篩選（Phase 1 + Phase 2）

DuckDB 現在同時負責原始備份的前置候選篩選與 PostgreSQL 匯入的候選掃描；Python Regex 只做精確引用解析。

原始 Parquet 建立流程：

1. 邊解壓縮邊寫入 base raw Parquet（`raw_json` 保持原文）
2. DuckDB 讀取 base Parquet，移除空白後以法規名稱做寬鬆候選篩選：
   ```sql
   WHERE regexp_matches(
     regexp_replace(json_extract_string(raw_json, '$.JFULL'), '[\s\p{Z}\x{000B}\x{001C}-\x{001F}\x{0085}]+', '', 'g'),
     '<法規名稱 alternation>'
   )
   ```
3. Python 只對 DuckDB 候選執行精確的法規名稱＋條號解析
4. 將 base 欄位與精確匹配結果合併成最終 `raw.parquet`

DuckDB 候選 Regex 會把每個法規名稱字元展開成所有 NFKC 等價字元（例如 `U+F9BE` 會對應到「料」），避免判決全文使用相容異體字時漏掉候選；Python 端仍以 NFKC 正規化後的精確解析為準。

PostgreSQL 匯入階段：

```sql
SELECT ...
FROM read_parquet('raw.parquet')
WHERE citation_count > 0 AND jid <> ''
```

- DuckDB 掃描 2,485,151 筆原始 Parquet，只保留 `citation_count > 0` 且 `jid` 非空的精確命中資料。
- Python 只接收這些候選，組裝 `judgment_documents` row，不再重跑 2,485,151 筆 Regex。
- 原始 Parquet manifest 的 `candidate_count` 是 DuckDB 寬鬆預篩候選數；匯入摘要的 `candidate_count` 則是 PostgreSQL 匯入候選數（`citation_count > 0 AND jid <> ''`）。兩者定義不同。
- DuckDB 預篩使用寬鬆的法規名稱比對，避免漏資料；Python 精確解析仍是最終判斷。例如只提到「銀行法」但沒有條號的判決會是 DuckDB 候選，但不會寫入 PostgreSQL。
- 以 `202602--(20261016Update).rar` 為例：74,719 筆原始資料 → 44,253 筆 DuckDB 候選 → 22,593 筆精確命中。

### DuckDB 資料品質與統計（Phase 3）

`GET /api/quality` 會用 DuckDB 掃描最新 manifest 指向的原始 `raw.parquet`，只讀取查詢欄位，不重新解析全文：

- 總量與唯一性：原始筆數、唯一 JID、重複 JID、缺少 JID。
- 內容品質：全文為空、全文過短、缺少內容雜湊、重複內容雜湊。
- 中繼資料：缺少法院、法院未正規化、缺少裁判日期、日期格式異常、缺少案由、缺少 PDF。
- 引用一致性：`citation_count > 0` 但沒有命中法規，或 `citation_count = 0` 但引用陣列非空。
- 分布：法院、裁判年份、熱門法規（提及判決數）、熱門案由。
- 檔案明細：每個 archive 的筆數、DuckDB 候選數、精確命中、命中率、過短、缺少中繼資料、重複內容與日期範圍。
- 收錄覆蓋：PostgreSQL `judgment_documents` 筆數與 `judgment_vector_index` 覆蓋率；數值即時查詢，不從 Parquet 推估。

品質頁面位於 `#/quality`，會標示每項檢查的通過／注意／需處理狀態與比例；資料不足或查詢失敗時顯示「—」或錯誤訊息，不以推測值補齊。實測 24 個 archive（2,485,151 筆）DuckDB 掃描約 0.6–0.8 秒。

### 題庫與 RAG Benchmark（Pilot 30）

`#/quality` 的 sidebar 提供題庫工作區：

- **題庫新增**：手動建立或貼上 JSON 匯入；預期法規、條文與判決 jid 會對現行 PostgreSQL metadata／條文驗證。
- **題庫管理**：狀態、版本、fingerprint、標籤、stale 標記、soft delete 與 JSON 匯出。
- **Benchmark 題庫**：只允許 accepted、未 stale 的題目；可建立 smoke／core／full suite、凍結版本。
- **題庫人工驗收批注**：approve／changes requested／reject、rubric 分數、批注與審核紀錄。
- 題目修改會建立新版本；法規條文內容變更時，啟動與「重新驗證」會自動標記 stale，提醒人工重新驗收。
- 題目 fingerprint 以正規化問題文字計算，跨版本保留相同題目身份，供長期同題比較。

`#/performance` 的 sidebar 新增 **RAG Benchmark**：

- 以正式 `judgments_current` alias 執行，保存 suite 版本、config hash、index version（含 physical collection）、題目版本與 fingerprint。
- 可選 embedding model、LLM model、judge model、Top K、相似度門檻、重複次數與法規檢索開關。
- 儲存逐題 answer、citations、law sources、stage timing、Flow、deterministic metrics、LLM judge 與人工 rubric。
- 指標包含 Law Recall、Article Recall、Citation Valid Rate、Refusal Accuracy、人工／LLM 分數、p50／p95 與成功／失敗數。
- 每題可查詢同 fingerprint 的跨 run 歷史。

Pilot 題庫檔位於 `data/benchmarks/pilot_30.json`；執行 `uv run python scripts/seed_question_bank.py` 可建立 30 題並凍結 `Pilot 30` suite。若題目已存在則跳過，不覆寫人工修改。

收錄欄位包含：案號、年度／字別／號碼、裁判日期、法院、正規化法院、案由、判決全文、PDF 連結、來源壓縮檔、命中法規清單、引用條號、引用數與內容雜湊。

### 原始判決 Parquet 與原判決連結

點擊 RAG 引用卡內容（`citation-body`）會直接從原始判決 Parquet 讀取完整判決，不再只連到外部 PDF。

- 輸出：`data/judgments/parquet/raw_judgments/<archive>/<YYYYMMDD>/<snapshot>/raw.parquet`
- `raw_json` 保留未修改的原始 JSON 文字；同一份 Parquet 另含案號、法院、案由、裁判日期、命中法規與引用等查詢欄位。
- 資料頁、Schema 模式與 `source=parquet` API 都直接查詢這份原始 Parquet，不再產生過濾後的 `judgments.parquet` 快照。
- 查詢時只載入所需欄位；點選案號時才解析 `raw_json` 取得完整判決全文與 PDF。
- 支援可中斷續跑的 `--raw-only` 補建；既有 24 個 RAR 已建立 2,485,151 筆原始備份。
- `data/judgments/` 已加入 `.gitignore`，避免把原始 `.rar` 與大型 Parquet 提交到 git。

API：

```http
GET /api/judgment?jid=SLDV%2C115%2C%E8%A8%B4%2C1369%2C20260625%2C1&source=parquet
```

未指定 `source` 時仍讀取 PostgreSQL；`source=parquet` 會從原始判決 Parquet 讀取，找不到時回傳 404 並提示先執行 `judgment-import-judgments --raw-only`，不會以其他來源冒充。

資料頁的判決分類可直接查詢原始 Parquet，也可切換 PostgreSQL 與 Qdrant；Parquet 查詢不會載入完整全文，點選案號時才解析 `raw_json` 取得原判決。

### 判決法院名稱正規化

判決原始資料的法院欄位可能夾雜「民事／刑事／簡易庭／小額」等字尾，或抓到內文提到的其他法院。系統保留原始 `court` 供追溯，並以 `court_normalized` 儲存 37 個標準法院名稱（含歷史名稱，例如智慧財產法院、公務員懲戒委員會）。解析順序為：

1. 原始法院值開頭即為標準法院名稱時直接採用。
2. 否則取判決全文前 8,000 字中最早出現的法院名稱。
3. 仍無法判斷時，以 JID 前綴（官方法院代碼）對應。

```bash
# 只處理尚未正規化的資料（預設）
uv run judgment-normalize-courts

# 只統計、不寫入
uv run judgment-normalize-courts --dry-run

# 重新計算全部判決（規則更新後使用）
uv run judgment-normalize-courts --all
```

- `--limit N`：最多處理 N 筆；`--batch-size N`：調整每批筆數。
- 回填會寫入 `performance_records`，可在效能報表查看耗時與處理筆數。
- 資料頁的法院下拉選單、精確篩選、排序、結果欄位與判決原文皆使用 `court_normalized`；API 仍回傳 `court_raw` 供追溯，但不會出現在法院選項中。

## Web 主控台

### 頁面路由

| 路由 | 頁面 | 功能 |
| --- | --- | --- |
| `#/rag` | RAG 提問 | 問題輸入、Qdrant 判決向量檢索、LLM 引用回答、索引覆蓋率、判決引用、瀏覽器端提問紀錄，以及可展開的即時後端處理流程。 |
| `#/data` | 資料庫查詢 | 先切換「法規命令／判決」，再選擇資料庫；側欄提供「查詢／Schema」切換，Schema 模式列出該資料庫的資料表，點選後在右側預覽欄位名稱、前 10 筆資料與總筆數，支援分頁與 CSV／JSON 匯出。 |
| `#/quality` | 資料品質 | 左側 sidebar：品質總覽、題庫新增、題庫管理、Benchmark 題庫、題庫人工驗收批注。品質總覽以 DuckDB 直接掃描最新原始判決 Parquet：案號重複／缺少、全文為空或過短、法院／日期／案由缺漏、引用欄位一致性、重複內容、archive 明細、法院／年份／法規／案由分布，以及 PostgreSQL／向量索引覆蓋。題庫工作區支援法規／條文／判決驗證、版本、JSON 匯入匯出、suite 凍結與人工批注。 |
| `#/performance` | 效能報表 | 左側 sidebar：效能總覽、RAG Benchmark。效能總覽保留測試流程、索引效能與完整 Flow；RAG Benchmark 可選擇題庫、embedding／LLM／judge model、Top K、threshold、重複次數與法規檢索開關，顯示逐題結果、LLM judge、人工評分、同題 fingerprint 歷史與延遲／檢索召回率。 |
| `#/processing` | 資料處理 | 左側工作流程 sidebar 列出處理總覽與 8 個可執行流程；右側顯示所選流程的 Python 程式、Shell／入口腳本、實際命令、執行按鈕與最近一次結果。另含判決、法規、命令三條即時流程圖、判決壓縮檔逐檔進度、各階段子進度與顏色、整體時間堆疊圖；「資料更新」會檢查線上法規／命令與本機未處理 `.rar`，必要時自動接續處理。 |
| `#/status` | 系統狀態 | 左側分類切換服務總覽、系統資料使用、前後端架構、資料版本、API 端點與最近下載；包含核心與 AI 服務健康、判決索引覆蓋率、資料量、CPU／RAM／Swap、Docker 容器與 volume 用量、PostgreSQL／Qdrant 資源、磁碟空間、架構圖與下載執行紀錄。 |

### HTTP API

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| `GET` | `/api/health` | 存活檢查，回傳版本。 |
| `GET` | `/api/status` | 服務狀態、資料筆數、架構、最近版本與下載執行。 |
| `GET` | `/api/system-usage` | 主機 CPU／RAM／Swap、Docker 容器與 system df、前端／後端程式大小、PostgreSQL／Qdrant volume 與資料庫容量、Parquet 容量、磁碟空間與元件合計。 |
| `GET` | `/api/index-versions` | 列出索引版本、active alias 與版本狀態。 |
| `POST` | `/api/index-versions/{id}/validate` | 驗證指定版本（count、dimension、collection）。 |
| `POST` | `/api/index-versions/{id}/activate` | 原子切換 alias 到指定版本。 |
| `POST` | `/api/index-versions/rollback` | 將 alias 切回上一個成功版本。 |
| `GET` | `/api/index-alias/reconcile` | 比對 Qdrant alias 與 PostgreSQL active 版本，可加 `?repair=true`。 |
| `GET` | `/api/catalog` | 依「法規命令／判決」分類回傳資料庫清單與各資料表可用的篩選欄位。 |
| `GET` | `/api/quality` | DuckDB 原始判決 Parquet 品質檢查、分布統計、archive 明細、PostgreSQL 收錄與向量索引覆蓋。 |
| `GET` | `/api/question-bank/items` | 題庫列表；支援搜尋、狀態、題型、難度、標籤與 stale 篩選。 |
| `POST` | `/api/question-bank/items` | 新增題目；驗證現行法規、條文與判決 jid，並建立 fingerprint 與版本 1。 |
| `GET` / `PATCH` / `DELETE` | `/api/question-bank/items/{id}` | 讀取、修改建立新版本、soft delete（retired）。 |
| `POST` | `/api/question-bank/items/{id}/review` | 人工驗收：approved／rejected／changes_requested、rubric 分數與批注。 |
| `POST` | `/api/question-bank/import` | JSON 批次匯入；以 fingerprint upsert。 |
| `GET` | `/api/question-bank/export` | 匯出題庫 JSON。 |
| `POST` | `/api/question-bank/revalidate` | 重新驗證全部題目；法規條文內容變更時標記 stale。 |
| `GET` / `POST` | `/api/benchmark/suites` | 列出／建立 benchmark suite；只允許 accepted、未 stale 的題目。 |
| `PATCH` / `DELETE` | `/api/benchmark/suites/{id}` | 更新題目清單、凍結版本或 soft delete suite。 |
| `GET` / `POST` | `/api/benchmark/runs` | 列出或啟動 benchmark；使用正式 `judgments_current` alias，保存 suite／config／index 快照。 |
| `GET` | `/api/benchmark/runs/{run_id}` | 讀取 run、逐題結果、LLM judge、人工評分、stage timing 與 Flow。 |
| `POST` | `/api/benchmark/runs/{run_id}/stop` | 停止 benchmark；未執行題目標記 skipped。 |
| `POST` | `/api/benchmark/results/{id}/review` | 儲存單題人工 rubric 分數與批注。 |
| `GET` | `/api/benchmark/fingerprints/{fingerprint}` | 以題目 fingerprint 查詢跨 run 的同題歷史。 |
| `POST` | `/api/query` | 執行唯讀查詢並回傳摘要、分布、查詢語句、資料列與分頁資訊。 |
| `GET` | `/api/law` | 依 `law_key`（或法規名稱）取得單一法規的 metadata、沿革、附件、條文版本清單與指定版本條文；可加 `source_type`、`version_id`、`article_no`。指定 `article_no` 時只回傳該條文，未指定時使用目前版本。 |
| `GET` | `/api/judgment` | 依 `jid` 取得單一判決的 metadata、命中法規、引用與判決全文；`source=parquet` 改從原始判決 Parquet 讀取。 |
| `GET` | `/api/performance` | 查詢 PostgreSQL 效能紀錄與 Flow JSON，支援程序、模組、模型、狀態、日期、耗時等 metadata 篩選。 |
| `GET` | `/api/performance/options` | 回傳效能報表可用的程序、模組、模型、狀態與方法選項。 |
| `POST` | `/api/performance/client` | 接收前端回報的 total／render 時間，合併到同一個 request_id 的 Flow。 |
| `GET` | `/api/processing` | 資料處理快照：三條流程、各階段進度、逐檔壓縮檔狀態、階段耗時堆疊、外部程序偵測、更新能力與注意事項。 |
| `GET` | `/api/processing/plan` | 更新前檢查結果：未處理壓縮檔、索引待補筆數與建議步驟；不會啟動任何程序。 |
| `POST` | `/api/processing/update` | 啟動可中斷續跑的資料更新；body 為 `{"index": false}`。已在執行中或外部匯入／更新程序佔用時回傳 409。 |
| `POST` | `/api/processing/workflows/{workflow_id}/run` | 啟動白名單中的單一工作流程（法規下載、命令下載、判決匯入、判決 Parquet 匯出、Qdrant 版本建置、法院名稱正規化、法規條文版本回填）；同一時間僅允許一個處理程序，衝突或外部程序佔用時回傳 409。 |
| `POST` | `/api/processing/stop` | 對由 Web 啟動的資料更新或工作流程送出 SIGINT；外部程序不會被強制停止。 |
| `POST` | `/api/rag/query` | 以 Qdrant 檢索判決並由 LLM 產生有引用編號的回答；問題上限 500 字，服務未就緒時降級。 |
| `POST` | `/api/rag/query/stream` | 與 `/api/rag/query` 相同，但以 SSE 逐段回傳 `step`、`partial`、`token`、`token_reset`、`result`、`error`；RAG 頁用來即時顯示後端處理流程、先顯示法規結果，再逐 token 顯示 LLM 回答。 |
| `GET` | `/api/docs` | Swagger UI 互動式 API 文件。 |
| `GET` | `/api/openapi.json` | OpenAPI schema。 |

`POST /api/query` 的 request body 範例：

```json
{
  "database": "postgres",
  "filters": {"table": "law_documents", "keyword": "銀行法", "is_current": true},
  "page": 1,
  "page_size": 25
}
```

`database` 可為 `postgres`、`parquet`、`qdrant`、`indexeddb`；`page_size` 上限 200。所有查詢皆為唯讀，不會修改 PostgreSQL 或 Parquet。

### 資料處理頁與資料更新

`#/processing` 會讀取 `.run/processing_state.json`（可用 `JUDGMENT_PROCESSING_STATE` 覆寫），並同時查詢 PostgreSQL、Qdrant 與本機 `.rar`，因此畫面只顯示可驗證的數值：

- **流程圖**：判決、法規、命令三條分支。判決分支依序為 RAR 解壓縮 → 原始 Parquet 備份 → DuckDB 候選篩選＋金融法規篩選 → PostgreSQL metadata → Qdrant；法規／命令分支為下載 → 原始 Parquet → 解析 → PostgreSQL。每個階段都有獨立顏色、筆數、百分比與進度條；無法計算總量時顯示「進度未知」，不以猜測值代替。
- **原始備份**：判決 RAR 會先將每個 JSON 物件以原始文字寫入 `JUDGMENT_DATA_DIR/parquet/raw_judgments/.../raw.parquet`；`raw_json` 保留未修改的原始文字，另外附加案號、法院、案由、裁判日期、命中法規與引用等查詢欄位。這個階段在金融法規篩選之前完成。法規／命令則在解析前寫入 `LAW_DATA_DIR/raw_parquet/.../laws.parquet`，原始 ZIP 仍保留在 `raw/`。
  - 2026-11-08 已補建既有 24 個判決 RAR：2,485,151 筆原始 JSON，Parquet 約 6.2 GB；既有法規／命令也補建原始 Parquet（法規 1,351、命令 10,454）。
- **逐檔進度**：從狀態檔的 `archives` 讀取每個壓縮檔的解壓縮、原始備份、篩選與 PostgreSQL 進度，直接顯示在檔名後方。沒有狀態檔時，改用 PostgreSQL 的 `source_archive` 顯示哪些壓縮檔已處理。
- **整體時間**：以各階段實際耗時比例組成堆疊長條，而非用筆數推估。
- **外部程序**：後端以 `ps` 偵測直接在 terminal 啟動的 `judgment-index-vectors`、`judgment-import-judgments`、`judgment-law-download` 與 `judgment.processing_update`。這些程序若沒有寫入狀態檔，只會標示「外部程序」與可驗證的整體覆蓋率；不會替它們產生假的逐階段百分比。外部匯入／更新執行中時，資料更新按鈕會停用；外部索引執行中時，仍可更新但不可勾選接續索引。
- **工作流程 sidebar**：左側列出「處理總覽」與 8 個白名單流程（完整資料更新、法規下載、命令下載、判決匯入、判決 Parquet 匯出、Qdrant 版本建置、法院名稱正規化、法規條文版本回填）。右側面板顯示該流程使用的 Python 程式、Shell／入口腳本與實際命令，並提供「執行此流程」按鈕；結果寫入共用狀態檔，面板顯示最近一次 run 的狀態、開始時間、耗時、訊息與日誌路徑。
- **執行與停止**：單一流程由 `judgment.workflow_runner` 在背景啟動，可執行命令只來自 `src/judgment/workflows.py` 白名單；完整資料更新仍走 `ProcessingManager.start_update`，可勾選接續索引。所有長流程共用「停止」與可續跑機制；已有 Web 或 terminal 程序執行時，按鈕停用或回傳 409，不會同時啟動第二個處理程序。

「資料更新」按鈕會依序：

1. 下載並比對線上法規與命令 ZIP（以 SHA-256 判斷是否變更）。
2. 掃描 `JUDGMENT_DATA_DIR` 與 `raw_rar/`，找出 PostgreSQL 尚未處理的 `.rar`。
3. 將未處理壓縮檔解壓縮為原始 Parquet 備份（同時補齊查詢欄位）。
4. 依金融法規清單篩選，將命中判決的 metadata 寫入 PostgreSQL。
5. 若勾選「完成後接續 Qdrant 索引」，執行可中斷續跑的向量索引；預設不勾選。

也可直接從 terminal 執行同一個流程：

```bash
uv run python -m judgment.processing_update          # 下載比對 + 原始 Parquet + 匯入
uv run python -m judgment.processing_update --index  # 完成後接續 Qdrant
```

更新程序與索引都支援 `Ctrl-C`；下次執行會重新掃描剩餘工作並接續。Web API 啟動的程序會把日誌寫到 `.run/processing_update_<timestamp>.log`。

### 本機電源控制器

header 右上角已改為**系統測試**入口；後端電源仍由 `./up.sh`、`./down.sh` 或本機電源控制器管理。

控制器是獨立程序，因此後端停止後仍能把它重新啟動。`judgment-web` 預設會自動啟動控制器；若後端已經停止且控制器也不在執行，可手動啟動：

```bash
uv run judgment-power-agent --backend-port 9200 --data-dir ./data/laws
```

控制器只綁定 `127.0.0.1:9201`，僅接受本機、`file://` 或 localhost 來源，且啟動／停止請求必須帶 `X-Judgment-Power: 1`。日誌位於系統暫存目錄的 `judgment-power-agent.log` 與 `judgment-web.log`。

> 電源控制只支援本機 API。部署在 Cloudflare Pages 並透過 cloudflared 連線時，仍需由本機執行 `./up.sh`／`./down.sh` 管理後端；系統測試頁的測試模式只切換模型測試行為，不會啟動或停止後端。

單一法規報表範例：

```bash
curl "http://127.0.0.1:9200/api/law?source_type=law&law_key=https%3A%2F%2Flaw.moj.gov.tw%2FLawClass%2FLawAll.aspx%3Fpcode%3DB0000001"
```

`GET /api/law` 會以 PostgreSQL 的現行／歷史 metadata 為準，並從對應的原始法規 Parquet 讀取結構化條文。若快照中沒有條文，回應會帶 `warnings`，前端只顯示可驗證的 metadata，不會補造內容。

### 資料庫查詢頁

左側最上方先以「法規命令／判決」切換資料類別，再以 radio 選擇該類別的資料庫；選定後才會載入對應的資料表與 metadata 表單。

**法規命令**

| 資料來源 | 可查詢對象 | 主要條件 |
| --- | --- | --- |
| PostgreSQL | `law_documents`、`law_dataset_versions`、`download_runs` | 資料類型、關鍵字、法規位階／類別、異動日期區間、條文數下限、執行狀態、版本日期、排序；欄位依資料表顯示 |
| Parquet | 原始 `raw_parquet` 的 `law`／`order` | 資料集、法規位階／類別、關鍵字、條文數下限、異動日期、回傳欄位、排序 |
| Qdrant | `law_articles`（預留）、`judgment_documents` | collection、語意查詢、Top K、相似度門檻；collection 尚未建立或服務未設定時回傳明確狀態，不產生虛構結果 |
| IndexedDB | 瀏覽器內的 `query_history`、`settings` | object store、關鍵字；完全在瀏覽器端執行，不經過伺服器 |

**判決**

| 資料來源 | 可查詢對象 | 主要條件 |
| --- | --- | --- |
| PostgreSQL | `judgment_documents`、`judgment_import_runs` | 案號／法院／案由／命中法規關鍵字、法院（標準名稱）、命中法規／命令、裁判日期區間、匯入狀態；判決文件的案號、法院、案由、裁判日期、命中法規可點選表頭排序 |
| Parquet | 原始 `raw.parquet` | 案號／法院／案由／命中法規關鍵字、法院、裁判日期區間、引用數下限、回傳欄位與排序；結果可點選案號直接解析原始 JSON 取得原判決 |
| Qdrant | `judgment_documents`（文件級向量）、`judgment_segments`（預留） | 語意查詢、Top K、相似度門檻；以 Ollama `bge-m3` 將問題轉為向量後檢索，結果可點選案號開啟判決原文 |
| IndexedDB | 瀏覽器內的 `query_history`、`settings` | 完全在瀏覽器端執行 |

判決除了 PostgreSQL 外，資料頁與 Schema 模式也提供原始 Parquet 查詢；查詢直接讀取 `raw.parquet` 的查詢欄位，不載入全文，點選案號會以 `source=parquet` 解析 `raw_json` 開啟原判決。判決的法院選項只包含正規化後的標準法院名稱；查詢結果與判決原文顯示標準名稱，API 另保留 `court_raw` 供追溯原始欄位。

按下「執行查詢」後，右側報表會包含：

- 符合筆數、現行筆數／平均條文等摘要。
- 結果分布長條圖。
- 實際使用的 SQL 或查詢語句，可複製。
- 警告訊息（例如 IndexedDB 降級為記憶體）。
- 資料列、分頁與每頁筆數。
- 查詢報表表格採單列精簡模式：每筆記錄不換行、欄寬依內容自動調整並可水平捲動；表頭可依實際欄位排序，表頭上方提供逐欄 fuzzy 搜尋與相似度排序建議。
- 側欄「Schema」模式：依目前「法規命令／判決」與資料庫，列出可用資料表／collection／object store；點選資料表後留在 Schema 模式，右側顯示欄位名稱、前 10 筆資料與總筆數；表頭可排序，欄位名稱上方有各欄位搜尋列，支援 fuzzy 搜尋與下拉建議。建議會列出所有符合值（上限 1,000 筆），依相似度排序並以 `<mark>` 標示輸入關鍵字。模糊比對以 2-gram token 聯集找候選，再依字元覆蓋率、出現位置、長度與序列相似度排序；例如「證券設置」會優先列出「證券商設置標準」「證券投資信託事業設置標準」，並分別標示「證券」與「設置」。選取後套用該值並顯示符合記錄。Schema 預覽中的法規名稱可點選，開啟該法規的完整報表；報表條文直接來自本地原始法規 Parquet。
- PostgreSQL／Parquet 法規查詢結果中的法規名稱可點選，切換成該法規的完整報表；報表包含 metadata、法規沿革（預設收合，點擊展開）、附件與可翻頁的條文內容，上方「返回查詢結果」可回到原本的查詢報表與頁碼。
- 法規報表的條文內容一次載入全部條文，不再使用上一頁／下一頁分頁；上方提供「跳至第幾條」輸入框，可輸入 `100`、`第100條` 或 `37-1`，按 Enter 或「跳至條文」即捲動並高亮該條；超過 100 條時另有右下角浮動跳轉控制。
- 判決查詢結果中的案號與裁判日期會以單行完整顯示，案號可點選切換成判決原文報表；報表包含案號、法院、案由、裁判日期、命中法規、引用條號、PDF 連結與判決全文，上方「返回查詢結果」可回到原本的判決查詢結果與頁碼。
- CSV／JSON 匯出（僅匯出目前頁面）。

查詢歷史與頁面設定會寫入瀏覽器 IndexedDB（資料庫名稱 `judgment-console`）：最多保留 120 筆查詢歷史，並記錄 `data.last_category`、`data.last_database.law`、`data.last_database.judgment`、`data.page_size` 與 `data.last_query`。若瀏覽器停用 IndexedDB，系統會退回記憶體暫存，並在報表與側欄明確標示，重新整理後資料會消失。

### 效能報表（Flow）

header 的 `效能報表` 頁面會顯示 PostgreSQL `performance_records` 內的執行紀錄。每一筆 API 請求（按下資料頁或 RAG 頁的執行按鈕）都會建立一筆 Flow，記錄從收到前端命令到回傳結果、以及前端完成 render 的完整流程。

主要欄位：

- `process`：執行程序，例如「資料查詢」「RAG 問答」「法規明細」。
- `module`：進入點的模組或函式。
- `started_at` / `finished_at` / `duration_ms`：伺服器端執行 timestamp 與總耗時。
- `status`、`status_code`、`error_message`：成功、失敗與 HTTP 狀態。
- `request_id`：前後端共用的請求識別碼（回應標頭 `X-Judgment-Request-Id`）。
- `params`：請求層級的參數摘要。
- `flow.metadata`：RAG 請求會保存 `question`、`answer`、`rag_status` 與 `test_run_id`，效能報表展開後會顯示「RAG 問題／RAG 答案」。
- `flow`：JSON 欄位，保存整條流程。格式如下：

```json
{
  "version": 1,
  "request_id": "8f4c…",
  "entrypoint": "/api/rag/query",
  "method": "POST",
  "path": "/api/rag/query",
  "started_at": "2026-11-07T04:20:00+00:00",
  "finished_at": "2026-11-07T04:20:37+00:00",
  "total_ms": 37322.4,
  "status": "success",
  "client": {
    "request_ms": 2.4,
    "total_ms": 13768,
    "render_ms": 33
  },
  "summary": {
    "segment_count": 21,
    "models": ["bge-m3", "gemma3:4b"],
    "slowest": {"name": "rag.llm", "duration_ms": 36318.7}
  },
  "segments": [
    {
      "seq": 3,
      "parent_seq": 2,
      "depth": 2,
      "name": "rag.answer_question",
      "module": "judgment.rag",
      "function": "answer_question",
      "started_at": "2026-11-07T04:20:00.001+00:00",
      "params": {
        "question_length": 13,
        "collection": "judgment_documents",
        "embedding_model": "bge-m3",
        "llm_model": "gemma3:4b",
        "top_k": 4,
        "score_threshold": 0.35
      },
      "param_names": ["collection", "embedding_model", "llm_model", "question_length", "score_threshold", "top_k"],
      "offset_ms": 0.8,
      "duration_ms": 37321.36,
      "status": "ok",
      "error": null
    }
  ]
}
```

每一段 `segment` 都包含：

- `module`、`function`：實際執行的 Python 模組與函式（或外部服務呼叫，例如 `QdrantStore.search`）。
- `params` / `param_names`：參數名稱與安全摘要值；長字串、物件與列表會截斷或只保留型別、長度與 key。
- `started_at`、`offset_ms`、`duration_ms`：實際開始時間、相對於 Flow 開始的位移與該段原始耗時。報表時間軸會顯示每個點位的開始時鐘時間（例如 `20:59:13.912`）。
- 每個點位的主要數字是「本點到下一點」的區間：`下一點 offset_ms - 本點 offset_ms`；最後一點使用本段 `duration_ms`。長條左端依 `offset_ms` 定位、寬度依該區間佔總 Flow 時間的比例計算。
- 「累計」是流水線累計：從第一點開始，依序加上每個點位區間，也就是第一點 `offset_ms` 到本點結束的差額。不能使用父區段自身的 `duration_ms`；例如 `http.request` 的點位區間是 1 ms，累計就是 1 ms，而不是 3.9 秒。隨流水線推進，累計會逐步增加，最後一點才等於總時間。
- `parent_seq`、`depth`：巢狀呼叫關係，前端據此縮排顯示。
- `status`、`error`：成功或錯誤。

前端每次 API 請求會送出 `X-Judgment-Client-Started-At` 與 `X-Judgment-Request-Id`；回應後再以 `POST /api/performance/client` 回報 `total_ms` 與 `render_ms`，合併成 `client.render` 區段。因此一筆 Flow 可以同時比較：

- 伺服器端總耗時與前端實際等待時間。
- Embedding、Qdrant、PostgreSQL、LLM 各段耗時。
- 不同 embedding／LLM 模型（例如 `bge-m3` 與 `gemma3:27b`）的效能差異。
- 不同函式與參數組合（`top_k`、`score_threshold`、`page_size`、`table`）的耗時。

效能報表頁面提供：

- 程式、模組、模型、狀態、方法、關鍵字、日期區間與耗時下限篩選。
- 摘要：符合筆數、成功率、平均耗時、P95、平均段數。
- Flow 統計：模型使用次數與平均模型呼叫耗時、最慢區段排行、Client 全流程與 Render 平均。
- 每筆紀錄可展開點位時間軸，查看實際開始時間、本點到下一點的區間、流水線累計、module／function／params；長條以開始時間定位、長度表示點位區間，並可展開原始 Flow JSON。
- CSV／JSON 匯出與分頁。
- CLI 紀錄若沒有逐段 instrumentation，會自動建立單一 summary segment，仍可在報表查看總耗時。
- 既有資料庫啟動時會自動執行 `ALTER TABLE performance_records ADD COLUMN flow JSON`；舊紀錄的 `flow` 可為空，頁面會顯示 fallback 訊息。

### 測試模式與模型測試 Flow

header 右上角的「系統測試」頁整合**API 連線設定**與**測試模式開關**；後端電源仍由 `./up.sh`、`./down.sh` 或 `127.0.0.1:9201` 電源控制器管理。

測試模式為 ON 時：

- 下一次 RAG 提問會依序執行目前可用的 **所有 embedding 模型與所有 LLM 模型**。
- 前端不設請求 timeout；後端 embedding 與 LLM 呼叫也使用 `timeout=None`。
- 模型清單從 Ollama `/api/tags` 自動偵測，排除 reranker；`bge-m3` 歸類為 embedding，其餘可聊天模型歸類為 LLM。
- 可用 `TEST_EMBEDDING_MODELS`、`TEST_LLM_MODELS` 以逗號分隔覆寫要測試的模型。
- 每個模型、每個階段都會建立一筆 `performance_test_steps`，記錄 `module`、`function`、status、progress、duration、error 與模型輸出摘要；整個測試是 `performance_test_runs`，並保存原始問題與主要回答。
- 回覆仍會選出主要回答：優先使用 `LLM_MODEL`，若失敗或引用驗證不通過，改用第一個通過驗證的模型；若全部失敗則只回傳檢索結果。

#### 測試流程圖表

系統測試頁整合 API 連線表單、測試模式開關與測試 Flow；效能報表頁上方也有「測試流程」panel。RAG 提問頁在送出測試模式問題後，也會在頁面下方即時生成同一個 panel：

- 顯示目前執行中的測試，或最近一筆測試。
- 標記原始 RAG 問題與 RAG 引擎產生的答案。
- 每個步驟顯示使用的 `module`、`function`、模型、狀態與耗時。
- 依階段分組：Embedding、Qdrant 檢索、PostgreSQL 取文、LLM 生成、引用驗證。
- 每個階段有幾個模型，就顯示幾條子程序進度條；模型失敗以紅色、略過以灰色、執行中以藍色 animated bar 顯示。
- 最下方先顯示總流程進度條，再顯示**總流程時間（依階段）** stacked bar：每個階段依耗時比例顯示不同顏色，下方 legend 標記階段名稱、耗時與百分比；LLM 生成通常占最大比例，執行中會即時估算。
- 測試開始後每 1.5 秒 poll `/api/test-runs/current`，自動綁定進度；完成後停止更新。
- 「歷史」下拉選單可載入 `performance_test_runs` 的歷史紀錄，還原當時的 flowchart。
- 測試步驟與結果保存在 PostgreSQL，後端重啟後仍可查詢。

一次實際測試（4 個 LLM、1 個 embedding）：

- 11 個子程序：1 embedding + 1 retrieval + 1 context + 4 LLM + 4 validation。
- 一次歷史實測（27B 預設時期）：4 個 LLM、11 個子程序、總耗時約 82 秒；`gemma3:27b`、`granite4:small-h`、`command-r:latest` 成功，`phonon:latest` 不是 chat 模型而回傳 HTTP 400，測試狀態為 `partial`。
- 主要回答由 `gemma3:27b` 產生，RAG 回應狀態 `operational`，並包含 `test_run` metadata。現在快速預設為 `gemma3:4b`，測試模式會自動多跑 4B 模型。

測試相關 API：

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| `GET` | `/api/test-mode` | 讀取測試模式與自動偵測到的模型清單 |
| `POST` | `/api/test-mode` | 切換測試模式（`{"enabled": true/false}`） |
| `GET` | `/api/test-runs/current` | 最新執行中或最近一筆測試 Flow |
| `GET` | `/api/test-runs` | 歷史測試列表（`limit`） |
| `GET` | `/api/test-runs/{run_id}` | 單一測試的完整 stages／steps |

測試模式設定儲存在 PostgreSQL `app_settings`（key `test_mode`），重啟後保留；測試 Flow 儲存在 `performance_test_runs` 與 `performance_test_steps`。



header 右上角的 `Style` 選單提供十種科技網站風格，對應 <https://getdesign.md/> 的公開設計參考：

| # | 風格 | 特色 |
| --- | --- | --- |
| 01 | Vercel | 黑白精準、Geist 感、幾何留白 |
| 02 | Apple | SF Pro、大圓角、沉浸留白 |
| 03 | Meta | Optimistic、明亮藍、膠囊元件 |
| 04 | NVIDIA（預設） | GPU 綠、黑底、銳利直角 |
| 05 | IBM | Carbon、Plex Sans、企業藍 |
| 06 | Stripe | 紫靛漸層、精密金融感 |
| 07 | Linear | 深空黑、靛紫、極簡線條 |
| 08 | Figma | 多彩色塊、協作感、藍色焦點 |
| 09 | Notion | 暖白紙張、襯線標題、知識庫 |
| 10 | OpenAI | 暖灰畫布、黑色行動、綠色訊號 |

主題只改變 CSS 設計 token，不會重新載入頁面；選擇會存在 `localStorage` 的 `judgment.theme`，下次開啟時自動套用。選單支援鍵盤操作（方向鍵、Home／End、Esc）。

### 靜態前端與部署

`src/judgment/web/static/` 的原始碼使用 ES modules，由 FastAPI 直接服務。`scripts/build_frontend.py` 會用 esbuild 將同一份前端打包成 IIFE，產生可獨立開啟、也可直接上傳到 Cloudflare Pages 的 `frontend/`：

```bash
uv run python scripts/build_frontend.py

# 也可把固定的 cloudflared 位址寫進 config.js
uv run python scripts/build_frontend.py --api-base https://api.example.com
```

建置需要 Node.js：腳本優先使用 PATH 中的 `esbuild`，找不到時透過 `npx` 取得。修改前端原始碼後需重新執行才會更新 `frontend/`。

```text
frontend/
├── index.html       # 相對資源路徑，載入 config.js 與 bundled app.js
├── config.js        # window.JUDGMENT_CONFIG.apiBase
├── favicon.svg
├── _headers         # Cloudflare Pages 安全標頭
└── assets/
    ├── styles.css
    ├── themes.css
    └── js/app.js    # esbuild IIFE bundle
```

#### 本機直接開啟 `index.html`

1. 啟動後端：`uv run judgment-web --host 127.0.0.1 --port 9200`
2. 用 Chrome 直接開啟 `frontend/index.html`（`file://` 路徑）。
3. 前端預設連到 `http://127.0.0.1:9200`。若後端使用其他連接埠，點擊 header 的「系統測試」後修改 API Base，或在網址加上 `?api=http://127.0.0.1:8765`。

API 位址的優先順序：

1. 網址參數 `?api=...`（最高，適合臨時測試）
2. 系統測試頁 API 表單儲存在 `localStorage` 的 `judgment.api_base`
3. `frontend/config.js` 的 `apiBase`
4. `file://` 模式的預設值 `http://127.0.0.1:9200`
5. 同源（目前網域）

系統測試頁的 API 表單提供連線測試、儲存後重新載入與恢復預設。若頁面是 HTTPS，卻填入非 localhost 的 `http://` 位址，瀏覽器會以 mixed content 阻擋；此時必須使用 cloudflared 的 `https://` 位址。

#### 部署到 Cloudflare Pages

`frontend/` 沒有建置步驟，直接將整個目錄部署即可：

```bash
npx wrangler pages deploy frontend --project-name judgment-rag
```

也可在 Cloudflare Pages 以 Git 整合設定：Framework preset 選 `None`、Build command 留空、Build output directory 填 `frontend`。`_headers` 會一併套用。部署後開啟 Pages 網址，若尚未設定 API，前端會自動導向系統測試頁要求填入後端位址。

#### 以 cloudflared 連到本機後端

macOS 可用 `brew install cloudflared` 安裝。快速通道（每次重啟會換網址，適合開發）：

```bash
cloudflared tunnel --url http://127.0.0.1:9200
```

Quick Tunnel 只適合臨時測試，且可能受網路環境或邊緣節點影響。將輸出的 `https://xxxx.trycloudflare.com` 填入系統測試頁的 API 表單並測試連線，或建置時寫入：

```bash
uv run python scripts/build_frontend.py --api-base https://xxxx.trycloudflare.com
```

需要固定網址時使用具名通道：

```bash
cloudflared tunnel login
cloudflared tunnel create judgment-api
cloudflared tunnel route dns judgment-api api.example.com
cloudflared tunnel run --url http://127.0.0.1:9200 judgment-api
```

後端建議只綁定 `127.0.0.1`，由本機的 cloudflared 對外提供 HTTPS。`judgment-web` 已啟用 proxy headers，並預設信任本機 cloudflared 的 `X-Forwarded-*`。

#### CORS 設定

FastAPI 預設 `CORS_ALLOW_ORIGINS=*`，方便 `file://` 與本機靜態伺服器測試。正式環境建議在 `.env` 改成明確的 Pages 網址後重啟後端：

```bash
CORS_ALLOW_ORIGINS=https://judgment-rag.pages.dev
FORWARDED_ALLOW_IPS=*
```

需要多個來源（例如正式網域與預覽網域）時以逗號分隔。`*` 代表任何網站都能從瀏覽器讀取這個唯讀 API；目前 API 不提供寫入操作，但仍不建議在正式環境長期開放。

### 判決向量索引與 RAG

完整的元件架構、請求流程、回應契約與已知限制，見 [`docs/rag-architecture.md`](docs/rag-architecture.md)（含 SVG 架構圖）。

RAG 的資料流如下：

1. 提問時先從 PostgreSQL `law_documents` 比對問題中的法規／命令名稱與常見簡稱（例如「證交法」對應「證券交易法」），取出 metadata；再從原始法規 Parquet 讀取條文、沿革與制定日期。若問題沒有直接寫出法規名稱，會以法律概念索引找出對應法規（例如「內線交易」對應證券交易法）。條文排名不是只看名稱或 2-gram 次數，而是結合法規概念展開（例如「內線交易」展開為「實際知悉」、「重大影響其股票價格」、「未公開」與第 157-1、171 條）、條號 regex、CJK BM25 與詞組覆蓋率；法規與命令都會納入檢索。前端「法規／命令檢索結果」中的法規名稱、各條文與命中詞彙都可直接點擊開啟完整原文。
2. 若問題是「有多少條文」、「何時開始有」或「最常觸犯什麼法條」，系統會以法規 metadata、條文與判決引用統計直接產生可驗證的結構化回答；統計會明確標示判決筆數與「被引用次數」，不宣稱定罪或勝訴比例。
3. 判決端仍從 PostgreSQL `judgment_documents` 取出判決，保留法院、裁判日期、案由與命中法規，並擷取全文頭尾視窗（預設 1,600 字）作為文件級 embedding 文字。
4. 以本機 Ollama `bge-m3`（1024 維）產生向量，寫入 Qdrant collection `judgment_documents`；每筆判決一個 point，point id 由案號決定，重跑可覆寫而不會重複。
5. 在 `judgment_vector_index` 記錄 `jid`、collection、模型、content hash 與維度；重跑時跳過未變更的判決，因此索引可中斷後繼續。
6. 判決提問以同一個 `bge-m3` 將問題轉為向量，從 Qdrant 取 Top K（預設 4）且高於相似度門檻（預設 0.35）的判決，再從 PostgreSQL 取回全文並挑選與問題詞彙最相關的段落。
7. 將法規／命令條文、判決片段與嚴格系統提示交給 Ollama LLM（快速預設 `gemma3:4b`，可改 `gemma3:27b`）。回答必須標註 `[1]`、`[2]` 等來源編號；若缺少有效引用、引用越界或模型回傳空回答，系統會降級為只顯示檢索結果，不保留推測內容。
8. 若問題與檢索資料無關，模型可明確回答「檢索到的資料不足以回答」；此類拒絕回答不要求引用編號，但不得憑空產生案號。

```bash
# 只統計候選判決，不呼叫 Ollama 或 Qdrant
uv run judgment-index-vectors --dry-run --limit 1000

# 建立前 1,000 筆判決索引
uv run judgment-index-vectors --limit 1000 --batch-size 16

# 跨語料抽樣：只索引 id 為 24 倍數的判決（約 1 萬筆）
uv run judgment-index-vectors --stride 24 --batch-size 16

# 只處理指定日期之後或指定案號
uv run judgment-index-vectors --since 20260101
uv run judgment-index-vectors --jid "TPDV,114,訴,1,20260101,1"

# 重新索引全部判決（--recreate 會先刪除 collection）
uv run judgment-index-vectors --all --batch-size 16
uv run judgment-index-vectors --recreate --batch-size 16
```

- `--stride N`：只索引 `id % N == 0` 的判決，適合在完整索引前建立跨法院、跨月份的抽樣索引。
- `--max-chars N`：調整每筆 embedding 的字數上限。
- `--collection`、`--embedding-url`、`--embedding-model`：覆寫設定。
- 每次執行都會寫入 `performance_records`，可在效能報表查看掃描數、索引數、耗時與 coverage。
- 本機實測 embedding 吞吐量約 7.7–8.1 筆/秒（含 Qdrant 寫入與 PostgreSQL 記錄）。2026-11-08 完成第一段全量索引：141,554 筆、耗時 4 小時 52 分 43 秒、8.06 筆/秒、1,106 批、平均每批約 15.9 秒。索引可分批或中斷後重跑，不需一次完成。
- 狀態頁與 RAG 側欄會顯示「已索引／判決總數／索引覆蓋率／collection points」；未建立 collection 或服務離線時會明確標示，不以其他數字代替。
- 狀態頁左側提供分類 sidebar；「系統資料使用」分頁呼叫 `GET /api/system-usage`，顯示主機 CPU／RAM／Swap、Docker 容器 CPU／RAM／Net I/O／Block I/O／PIDs、Docker images／containers／volumes／build cache、PostgreSQL 資料庫與前 6 大資料表容量、Qdrant collection／points／segments，以及磁碟 total／used／free／百分比。硬碟使用組成另列前端、後端、Docker 映像／容器／快取、PostgreSQL volume、Qdrant volume、Parquet（法規＋判決）與 Judgment 元件合計，並顯示目前 HDD 已使用量。

### 版本化索引與 Qdrant Alias

正式索引改用 Blue-Green collection：

```text
judgments_v001
judgments_v002
judgments_current -> 目前正式版本
```

新版本建置期間不修改 active collection；完成驗證後才以 Qdrant `POST /collections/aliases` 原子切換。PostgreSQL `judgment_index_versions` 保存版本、physical collection、alias、embedding model／version、維度、來源 snapshot、驗證結果、前後版本與時間；`judgment_vector_index` 使用 `(jid, version_id)` 複合主鍵。

```bash
# 將現有 judgment_documents 登記為 active 版本並建立 alias（不重新 embedding）
uv run judgment-index-vectors --bootstrap

# 建立新版本；相同 model／recipe 時複製舊 points，只 embedding 差異資料
uv run judgment-index-vectors --build-version

# 驗證後啟用
uv run judgment-index-vectors --validate-version 3
uv run judgment-index-vectors --activate-version 3

# 建置並在驗證通過後自動切換
uv run judgment-index-vectors --build-version --activate

# 查看版本、回滾、檢查 alias 與 PostgreSQL 是否一致
uv run judgment-index-vectors --list-versions
uv run judgment-index-vectors --rollback
curl "http://127.0.0.1:9200/api/index-versions"
curl "http://127.0.0.1:9200/api/index-alias/reconcile"
```

- `--build-version` 在終端機顯示 1 行狀態（百分比、已處理／總數、reused、embedded、速度、ETA）＋10 行 × 100 字元進度＋第 11 行全寬總進度；每個字元代表 0.1%。按 `Ctrl-C` 可中斷，下次執行會接續同一個 building 版本。
- 相容條件：相同 `JUDGMENT_EMBEDDING_VERSION`、`JUDGMENT_INDEX_RECIPE_VERSION`、embedding model、維度與 point ID 規則。
- 增量重用的指紋包含 `content_hash`、`index_text_hash`、`payload_hash`、`source_updated_at`；metadata-only 變更也會重新 embedding。
- 已刪除或不再符合資格的判決會從新 collection 刪除。
- 驗證失敗不得切換；第一階段保留 active＋前一個成功版本，不自動刪除舊 collection。
- `JUDGMENT_VECTOR_ALIAS` 預設 `judgments_current`，`JUDGMENT_VECTOR_COLLECTION_PREFIX` 預設 `judgments`。
- 目前本機可將 `EMBEDDING_URL` 指向 x570 Ollama、`EMBEDDING_FALLBACK_URL` 指向 MBP `http://127.0.0.1:11434`；x570 關機時自動改用本機，兩端必須使用同一個 `bge-m3` digest。

#### 全量索引：自動接續

索引腳本不再分五次；每次執行都會先查詢 PostgreSQL，算出尚未索引的判決筆數，再從那裡開始：

```bash
./scripts/index_full_task.sh          # 自動偵測剩餘筆數並開始索引
./scripts/index_full_task.sh status   # 只顯示進度，不執行索引
```

- 執行中按 `Ctrl-C` 可中止；下次再執行 `./scripts/index_full_task.sh` 會接續同一個 building 版本，已完成的判決不會重複 embedding。
- `LIMIT=2000 ./scripts/index_full_task.sh` 可限制本次最多索引筆數，適合測試。
- `PLAN_ONLY=1 ./scripts/index_full_task.sh` 只顯示偵測到的剩餘筆數與即將執行的指令，不會啟動索引。
- `AUTO_ACTIVATE=0 ./scripts/index_full_task.sh` 建置完成後只標記 ready，不自動切換 alias。
- `FORCE=1 ./scripts/index_full_task.sh` 即使目前 coverage 100% 仍建立新版本；`RECREATE=1` 會忽略既有 building 版本，但不會刪除 active collection。
- `BATCH_SIZE`、`MAX_CHARS` 仍可用環境變數覆寫。
- 日誌寫入 `.run/index_full_task_<timestamp>.log`，`.run/index_full_task.log` 指向最新一份。
- 執行中會在 terminal 顯示 10 行進度條：每行代表 10%，每行 100 個字元，每個字元代表 0.1%，合計 1,000 個字元 = 100%。例如：

  ```text
  全量索引：本次待索引 551,368 筆 · 目前 187,375 / 738,743（25.4%）
    0% ████████████████████████████████████████████████████████████████████████████████████████████████████
   10% ████████████████████████████████████████████████████████████████████████████████████████████████████
   20% ████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   30% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   40% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   50% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   60% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   70% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   80% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   90% ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  本次 132,328 / 551,368（24.0%）· 7.8 筆/秒
  已用 2:11:05 · 剩餘 2:51:10 · 總進度 319,703 / 738,743（43.3%）
  ```

  若 terminal 寬度不足，每行會自動縮短，並提示放大視窗可顯示完整 100 字元；輸出被重導向時會改成每 30 秒一行的精簡格式。進度條由 `scripts/index_progress.py` 解析每批日誌產生。
- 每次索引完成後會寫入 `performance_records`（程序：`判決向量索引`，任務標籤：`自動接續`），效能報表上方會出現「索引效能」面板：當次執行筆數、平均每秒筆數、當次使用時間、平均每批時間，以及最近多次吞吐、最新一次時間組成（Embedding／Qdrant／PostgreSQL）與本次索引進度折線圖。舊紀錄若沒有階段計時，會以總耗時與 `batch_size` 推算批數與每批平均時間。
- 建議在離峰時段執行；索引期間會與 Ollama 爭用資源，RAG 仍可用但可能變慢。
- 全部完成後，覆蓋率應為 738,743 / 738,743（100%）。

#### 索引效能實測與優化結論（2026-11-08）

以 768 筆真實判決、`bge-m3`、batch 128 實測：

| 階段 | 時間 | 占比 |
|---|---:|---:|
| Ollama embedding | 91.6 秒 | 99.0% |
| PostgreSQL 讀取 | 0.45 秒 | 0.5% |
| Qdrant upsert（目前 HTTP） | 0.40 秒 | 0.4% |
| 文字組裝 | 0.06 秒 | 0.07% |
| PostgreSQL 索引紀錄 | 0.03 秒 | 0.03% |

- Qdrant 傳輸優化對總時間影響很小：HTTP 長效連線 0.30 秒、`wait=false` 0.27 秒、gRPC 0.12 秒；即使 30,720 筆，gRPC 也只比 HTTP 快約 11 秒，相對 embedding 的 3,700 秒可忽略。
- batch 64／128／256 的 embedding 吞吐皆約 8.3 筆/秒；2／4／8 個並行請求也相同，Ollama 會序列化，增加 batch 或 pipeline 不會加速。
- 真正有效的是縮短 embedding 文字：`max_chars` 1,600／1,200／1,000／800／600 的吞吐約 8.3／10.3／11.7／13.4／16.1 筆/秒。以當時剩餘 707,770 筆估算，全量索引約 25.5／20.5／18／16／13 小時。
- 品質代理測試（768 筆、10 題）：1,000 字的 top-4 Jaccard 為 0.60、top-1 相同 8/10；800 字為 0.33、6/10。正式調整前應以 20–50 題做人工或 LLM 相關性評估。
- 建議：若可接受少量召回變化，將 `JUDGMENT_INDEX_MAX_CHARS` 設為 1000，並以 `--recreate` 重建全部索引以維持一致；否則維持 1600。HTTP client 重用與 collection 檢查移出迴圈可作為程式品質改善，但不是主要的加速手段。

服務降級行為：

| 情況 | 行為 |
| --- | --- |
| 問題可對應法規／命令，但 `QDRANT_URL` 未設定 | 仍以法規 metadata／條文回答；有 LLM 時狀態 `operational`，否則 `retrieval_only` |
| 問題無法對應法規／命令，且 `QDRANT_URL` 未設定 | 回傳法規 metadata 預覽，標示 `not_configured` |
| Qdrant 無法連線或 Collection 尚未建立 | 有法規／命令來源時仍可回答；沒有來源時標示 `unavailable`／`not_indexed` |
| Embedding 失敗 | 有法規／命令來源時仍可回答；沒有來源時標示 `unavailable` |
| 沒有相似度足夠的判決 | 若問題可對應法規／命令，改用該來源回答；否則標示 `retrieval_only` |
| `LLM_URL`／`LLM_MODEL` 未設定 | 標示 `retrieval_only`，只列出檢索結果 |
| LLM 回答缺少有效引用 | 降級為 `retrieval_only`，不顯示未經驗證的回答 |

Qdrant 資料頁提供「語意查詢」「Collection」「Top K」「相似度門檻」；結果包含相似度、案號、法院、案由、裁判日期、命中法規與相似片段，點選案號可開啟判決原文。RAG 回答與所有引用皆不是法律意見。 點擊 RAG 回覆中的法規／命令卡，會從本地原始法規 Parquet 開啟完整原始條文 dialog；dialog 一次列出全部條文、法規沿革與來源網站，並可透過右上角 X、「返回回答」或點擊外部關閉。點擊卡內的單一條文預覽，則只顯示該條文的完整內容，不列出其他條文。

### RAG 速度調校（10 秒內）

實測 RAG 的主要耗時在 LLM（27B 模型約 30–50 秒），embedding 與 Qdrant 檢索通常低於 1 秒。目前快速設定：

```bash
ollama pull gemma3:4b
```

```dotenv
LLM_MODEL=gemma3:4b
LLM_NUM_CTX=4096
LLM_NUM_PREDICT=384
LLM_KEEP_ALIVE=30m
RAG_TOP_K=4
RAG_MAX_CONTEXT_CHARS=4000
```

目前實測：

| 問題 | 回應時間 | 檢索判決 |
| --- | ---: | ---: |
| 侵權行為損害賠償的舉證責任 | 約 2.0 秒 | 4 筆 |
| 銀行法對於吸收存款與授信有哪些限制？ | 約 2.3–3.8 秒 | 4 筆 |
| 證券交易法對內線交易有什麼規範？ | 約 3.8 秒 | 4 筆 |
| 金融消費者保護法如何處理金融消費爭議？ | 約 3.2 秒 | 4 筆 |
| 有關內線交易的法律有哪些? | 約 5.1 秒 | 4 筆 |

權衡：

- `gemma3:4b` 速度快，適合互動問答；複雜法律推理的深度可能不如 27B。
- 若需要較高品質，將 `LLM_MODEL` 改回 `gemma3:27b`，並可把 `RAG_TOP_K`／`RAG_MAX_CONTEXT_CHARS` 調高；代價是每次約 30–50 秒。
- 測試模式不受此限制：仍會依序執行所有可用模型，且不設 timeout。
- `LLM_KEEP_ALIVE=30m` 讓 Ollama 保持模型載入，避免第一次請求反覆載入造成延遲。

### 本階段驗證

- `uv run pytest`：147 passed（含靜態資源、服務狀態、系統資源使用、索引版本與 alias、索引進度條、embedding fallback、法規／判決 catalog、PostgreSQL／Parquet／Qdrant 查詢、判決篩選匯入、DuckDB 原始 Parquet 品質統計、法規條文版本與變更事件、法院正規化與回填、判決向量索引、索引效能統計與圖表資料、索引進度條 10×100 格渲染、資料處理工作流程 catalog 與啟動 endpoint、法規概念展開／條號 regex／BM25 條文排序、題庫版本／人工驗收／stale 驗證／benchmark suite、RAG benchmark 指標、RAG 串流處理流程與逐步輸出、RAG 引用驗證、效能 Flow 與 client timing、測試模式與測試 Flow、判決 Parquet 匯出與原判決讀取、單一法規報表、單一條文篩選、判決原文報表、電源控制器、request validation、CORS 設定與 standalone frontend）。
- `uv run ruff check .`：clean。
- 實際資料：1,351 筆法規、10,454 筆命令、222,124 條文、2 個原始法規 Parquet（約 45 MB）。
- 判決原始檔：`data/judgments/raw_rar/` 共 24 個月份（202409–202608）的 `.rar`，合計 6.2 GB；已建立 `manifest.json` 記錄檔名、月份、大小與 SHA-256。
- 判決匯入：24 個月份共掃描 2,485,151 筆（既有 8 個月 + 新增 16 個月），命中 99 項金融法規清單並寫入 738,743 筆判決、1,578,718 筆引用；`judgment_documents` 約 4.4 GB。新增 16 個月份掃描 1,655,684 筆、寫入 494,413 筆，耗時 858.6 秒。
- 原始判決 Parquet：24 個壓縮檔共 2,485,151 筆，約 6.2 GB；以 `jid` filter 單筆讀取後解析 `raw_json`，點擊 RAG 引用卡內容可開啟完整判決 dialog，並保留 PDF 連結。
- 判決法院正規化：738,743 筆全部有 `court_normalized`，對應 37 個標準法院，0 筆未解析、原始 `court` 保留。
- 判決向量索引：已完成全量 738,743 筆（1,024 維、`bge-m3`）；Qdrant `judgments_v002`（`judgments_current` alias）與 PostgreSQL `judgment_vector_index` coverage 738,743 / 738,743＝100%。正式查詢使用 `judgments_current` alias，後續版本以 Blue-Green collection 建置。
- 全量索引已完成：一般 RAG 的語意候選涵蓋全部 738,743 筆；PostgreSQL 關鍵字／條件查詢、法規與引用統計、Parquet 全文快照仍可獨立使用。
- 全量索引資源估算：Qdrant 由目前 229 MB 增至約 5–5.5 GB（向量約 2.8 GB、payload 約 1.2 GB、索引與 WAL 另計），索引期間峰值可能短暫達 7–8 GB；Qdrant 記憶體約 3–4 GB。以 HNSW 對數成長推算，單次搜尋由實測中位 6.9 ms 增至約 10–20 ms，RAG 總時間（2–6.5 秒，主要為 LLM）影響小於 1%。索引期間會與 Ollama embedding 競爭資源，建議離峰執行。每月新增約 3 萬筆判決的增量索引約需 1.1 小時。
- 法規／命令範例問題：以「證券營業員常觸犯什麼法規或命令?」提問，系統在 30 筆全文提及「證券營業員」的判決中統計引用次數，回傳洗錢防制法、民法、保險法、證券交易法等法規卡；「有哪些法規是和壽險及產險相關的?」會依名稱與類別關鍵字整理保險法、簡易人壽保險法、人壽保險各類保險定名準則、財產保險業財務報告編製準則等 8 筆法規／命令。
- 法規／命令 RAG 實測：以「證交法有多少條文?」提問，別名解析為 `證券交易法`，回傳 229 條與法規卡，約 0.16 秒；「銀行法是何時開始有的?」回傳民國 20 年 3 月 28 日（1931-03-28），約 0.08 秒；「保險業務員最常觸犯什麼法條?」依 42 筆判決的引用統計列出 `保險業務員管理規則` 第 19、15 條與 `民法` 第 184 條等，約 0.21 秒。法規／命令與判決並存時，回答卡會同時顯示判決卡與法規／命令卡，引用編號共用。
- RAG 實測（快速 profile）：以「侵權行為損害賠償的舉證責任」提問，狀態 `operational`，回傳 4 筆判決與 `[1, 2, 3, 4]` 引用，約 2.0–2.4 秒；回答標頭顯示狀態、耗時與模型 `gemma3:4b`，tooltip 另列 embedding `bge-m3`；「銀行法對於吸收存款與授信有哪些限制？」約 2.3–3.8 秒；「有關內線交易的法律有哪些?」約 5.1 秒。皆未產生虛構案號。
- RAG 串流處理流程：正常提問改用 `POST /api/rag/query/stream`，前端逐行顯示 FastAPI、PostgreSQL、Qdrant、Ollama embedding、LLM 生成與引用驗證等步驟；顯示第一個法規結果時自動收合流程清單，完成後維持收合，可點擊展開。實測一般問答 21 步、約 11 秒，法規結構化問答 7–8 步、約 0.2 秒。
- 檢索速度差異：結構化法規問題（例如「有哪些法規是和壽險及產險相關的？」）只查 PostgreSQL metadata 與法規 Parquet，命中後直接以 `answer_source=structured` 回傳，不呼叫 Qdrant embedding、向量搜尋或 LLM，實測約 0.1–0.3 秒；「保險法對於業務員不當招攬的責任規定？」需要建立保險責任架構、進行判決向量檢索，並等待 Ollama LLM 生成與引用驗證，主要耗時在 embedding（數秒）與 LLM token 生成（約 5–10 秒）。
- 回答逐步顯示：串流端點先送 `partial` 顯示法規／命令責任架構或法規摘要，再送含判決／法規來源的 `partial`，LLM 以 `stream: true` 逐 token 送 `token`；前端在原回答區先顯示法規結果，再逐字接上 LLM 回答，最後以通過引用驗證的 `result` 更新。若 LLM 引用驗證失敗，會送出重試或清除未驗證草稿，改顯示可驗證的檢索結果摘要。
- 逐步輸出實測（「銀行法對於吸收存款與授信有哪些限制？」）：法規摘要約 0.6 秒先出現，第一個 LLM token 約 4.3 秒，完整回答約 6.6 秒；流程面板在法規結果出現時先收合，避免即時步驟把回答推到畫面下方。
- 處理流程的子步驟直接顯示耗時（`ms`）；有子步驟的父流程只顯示流程名稱，右側不顯示耗時。
- 流程控制固定分成左右兩部分：左側為「展開後端處理流程」／「收合後端處理流程」按鈕，右側為「完成 · N 步 · 耗時 ms」摘要。展開時控制項留在回答標頭原位置，步驟清單直接從下方展開，不會把整塊面板移到標頭下方。窄版（≤480px）控制項獨占一列，按鈕靠左、摘要靠右。
- LLM RAG 回答會先顯示「法規／命令檢索結果」，再顯示「LLM 綜合回答」；`/api/rag/query` 與串流結果都包含 `law_answer`，避免 LLM 回答掩蓋實際檢索到的法規／命令。
- 保險業務員招攬責任類問題會額外先列「相關法規的責任架構」表（法規、條文、規範重點）與法規來源，再顯示 LLM 回答；目前規則涵蓋保險業務員管理規則第 15、19 條與金融消費者保護法第 8、9、10、11、11-3 條。
- 以 Playwright 驗證法規／命令卡 dialog：點擊 `證券交易法` 卡可從本地 Parquet 一次讀取並列出 229 條原文，顯示來源快照、法規沿革與來源網站；沒有分頁控制，對話框內可連續捲動全部條文，並可以 X／返回回答／點擊外部關閉。點擊卡內的單一條文預覽（例如 `保險法` 第 163 條）只顯示該條完整內容（1 條），標題為「法規 · 條號」，不顯示其他條文與法規沿革；390px 無水平溢出、無 console error。
- 以 Playwright 驗證內線交易問題：法規／命令檢索結果列出 `證券交易法` 第 157-1 條與第 171 條，點擊任一條文會開啟該條完整內容；點擊「命中詞彙」的 `證券交易法` 會開啟 229 條全文 dialog；下方來源卡同步顯示第 157-1、171 條，390px 無水平溢出、0 console error。
- 以 Playwright 驗證全站法規跳轉一致性：RAG 判決卡只在標題／metadata 區開啟判決，點擊摘要不再觸發；判決卡與判決 dialog 內的 `公司法`、`洗錢防制法`、`證券交易法` chips 均可開啟對應法規全文；法規 dialog 提供「跳至第幾條」輸入，實測可跳至並標示第 171 條。資料頁判決報表的命中法規名稱也可點擊開啟完整法規報表，該報表同樣具備條文跳轉與標示。
- 以 Playwright 驗證 Qdrant 資料頁：語意查詢、Top K、相似度門檻、相似度／案號／法院／案由／裁判日期／命中法規欄位、點選案號開啟判決原文，以及返回後查詢條件保留；RAG 頁驗證索引覆蓋率、4 筆判決引用與引用編號，狀態頁驗證 Qdrant／Embedding／RAG／LLM 均為正常；390px 無水平溢出、無 console error。
- 以 Playwright 驗證狀態頁 sidebar：6 個分類切換、服務總覽、系統資料使用、架構、資料版本與最近下載；系統資料使用顯示 CPU／RAM／Swap、Docker 2 個容器、PostgreSQL／Qdrant 資源與磁碟空間；390px 無水平溢出、無 console error。
- 效能 Flow 實測：快速 profile 的 RAG 請求產生約 20 段 Flow，包含 `http.request`、`rag.answer_question`、`rag.embed_query`、`rag.qdrant_search`、`rag.fetch_documents`、`rag.llm`、`rag.validate_citations` 與 `client.render`；`summary.models` 為 `bge-m3`、`gemma3:4b`。伺服器端 LLM 區段約 1–4 秒，前端 client 全流程與伺服器總耗時接近。時間軸以每個點位的 `started_at` 顯示開始時間，主要數字為「本點到下一點」區間；「累計」採流水線累加，例如 `http.request` 顯示 1 ms 並累計 1 ms，`rag.coverage` 顯示 30 ms 並累計 32 ms，`rag.llm_request` 顯示 2.9 s，最後 `client.render` 才累計到整體 3.9–4.0 秒。
- 以 Playwright 驗證效能 Flow 頁：模型篩選、21 段巢狀時間軸、每點實際開始時間、點到點區間、流水線累計、module／function／params、時間軸比例條、模型統計、最慢區段、Flow JSON 展開、390px 無水平溢出與 0 console error。
- 以 Playwright 驗證十種主題切換與持久化、四個頁面、法規／判決類別切換、判決命中法規查詢、匯入紀錄查詢、查詢報表、法規明細、判決原文與返回流程、服務狀態與 390px 行動版；無 console error、無失敗請求、無水平溢出。
- 以 Playwright 驗證資料處理頁工作流程 sidebar：9 個項目（總覽＋8 個流程）、選取「法規下載」顯示程式 `judgment-law-download --source law`、Shell／入口 `src/judgment/law_download/cli.py`、實際命令與執行按鈕；桌面 1300px 與行動版 390px 均無水平溢出、0 console error。
- 以 Playwright 驗證判決法院正規化：下拉選單只有 37 個標準法院＋全部、無重複或髒值，以標準名稱篩選／排序／開啟原文皆一致，返回查詢結果後條件與資料列保留。
- 以 Playwright 驗證 `file://frontend/index.html`、系統測試頁的 API 連線測試／儲存流程，以及靜態主機（含 `?api=` 覆寫）的跨來源 API 呼叫。
- 以 Playwright 驗證系統測試頁：header「系統測試」入口、API 表單、測試模式 ON/OFF 切換、模型清單、測試 Flow、RAG 頁測試模式提示，以及 `/api/test-mode` 狀態一致；後端電源改由 `./up.sh`／`./down.sh` 管理。
- 以 Playwright 驗證測試模式 RAG：4 個 LLM 全數執行、耗時 149 秒、無前端 timeout，回答卡顯示 `test_run` 與「查看測試 Flow」連結。
- 以 Playwright 驗證測試流程圖表：問題、RAG 答案、每步驟 module／function、即時 poll 更新、11 個子程序進度條（1 embedding + 1 retrieval + 1 context + 4 LLM + 4 validation）、失敗模型紅色 bar、總流程進度與依階段時間 bar、歷史選單還原舊 Flow、390px 與 0 console error。
- 以 Playwright 驗證 RAG 提問頁下方的即時測試 Flow panel：測試模式提問時顯示問題、答案、module／function、5 個階段、子進度條與總時間 bar。

## Case Assessment 文件（未來）

Case Assessment & Legal Strategy Engine 尚未實作；目前先保留可行性評估與資料契約，供未來「專案評估／案件評估」功能使用。

- [`documents/CASE_ASSESSMENT_FEASIBILITY_v1.0.md`](documents/CASE_ASSESSMENT_FEASIBILITY_v1.0.md)：可行性、現有資產重用、架構衝突、缺口、分期與風險。
- [`documents/CASE_ASSESSMENT_DATA_DICTIONARY_v1.0.md`](documents/CASE_ASSESSMENT_DATA_DICTIONARY_v1.0.md)：案件、事實、證據、法律要件、判決比較、風險、策略、Analysis Run 與 Provenance 的資料字典。

這兩份文件是架構參考，不代表 CASE 已核准開發；Auth、文件儲存、Tenant、條文版本與 Feature Schema 仍待決策。

## 測試與檢查

```bash
uv run pytest
uv run ruff check .
```

測試涵蓋解析與雜湊、ZIP 下載與重試、首次匯入、無變更偵測、版本更新、新增／修改／移除事件、判決法規清單解析與引用擷取、判決匯入篩選、法院名稱正規化與回填、判決向量索引與續跑、RAG 片段擷取與引用驗證、效能 Flow 巢狀區段與 client timing、測試模式開關與模型分類、測試 Flow run/step 持久化、判決 Parquet 匯出與依 jid 讀取、效能紀錄與 metadata／模型篩選，以及靜態主控台、服務狀態、法規／判決 catalog、PostgreSQL／Parquet／Qdrant 查詢、單一法規報表、判決原文報表、電源控制器、request validation、跨來源 CORS 與 standalone frontend 產物。

## 排程建議

此模組本身不內建排程器，適合由 cron、systemd timer 或容器排程每日執行一次：

```cron
15 3 * * * cd /path/to/judgment && /path/to/uv run judgment-law-download --source all
```

重複執行是安全的：相同內容會回報 `no_change`，不會建立重複版本。

## 注意事項

- 法規資料根目錄預設為 `/data/laws`，判決資料維持 `/data/judgments`，兩者分開以避免清理或備份政策互相影響。
- API 一次回傳全部法規／命令；`order` 資料集較大（約 10,000 筆命令、17 萬條文），但仍以單一 Parquet 檔保存。
- `raw_json` 內已包含條文，`law_articles` 另外提供結構化欄位以利 DuckDB／Arrow 查詢。
- Web 主控台與法規下載模組共用 `DATABASE_URL` 與 `LAW_DATA_DIR`；啟動 `judgment-web` 前請先完成至少一次下載，資料頁與狀態頁才會有實際內容。
- Qdrant、Embedding、RAG 回答管線與 LLM 未設定或離線時，主控台會明確標示 `not_configured`、`unavailable`、`not_indexed` 或 `retrieval_only`；RAG 只會顯示可驗證的檢索結果，不會生成虛構答案。
- 判決向量索引需要 PostgreSQL、Qdrant 與 Ollama；完整索引 244,330 筆約需 10–12 小時，可用 `--stride` 先建立抽樣索引，或分批續跑。
- 本階段 Web 查詢涵蓋法規／命令、已篩選判決、Qdrant 向量檢索與效能紀錄；RAG 回答會標示引用編號並可回到判決原文，但不是法律意見。
