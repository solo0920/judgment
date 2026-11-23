# Judgment RAG

判決檢索與法規引用問答系統。目前已包含「法規／命令資料下載」、「判決下載」、「判決金融法規篩選匯入」、「資料品質」、「題庫與 RAG Benchmark」、「版本化判決 Qdrant 索引」與「法規／命令條文向量索引」模組，以及以 FastAPI + Vanilla JS 建置的 Web 主控台：從全國法規資料庫與司法院開放資料下載最新資料、判斷是否有新版、將原始資料寫入 Parquet、把版本與中繼資料寫入 PostgreSQL；判決資料會先將壓縮檔內原始 JSON 寫入不可變的原始 Parquet 備份，再依金融法規清單篩選後寫入 PostgreSQL，最後建立 Qdrant 向量索引，透過 x570／MBP llama-server 提供有引用依據的 RAG 回答。

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
3. 先將本次 payload 寫入不可變的原始 Parquet（`raw_parquet/`）；此步驟會先解析一次資料。
4. 與資料庫中最新版本的 `raw_json_sha256` 比對；相同即為 `no_change`，不儲存 ZIP／manifest，也不寫入 PostgreSQL。
5. 解析法規並計算語意雜湊（依 `law_key` 排序後，對每筆法規內容雜湊再彙總）。
6. 語意雜湊相同時視為 `no_change`，可忽略 JSON 欄位順序或格式差異。
7. 有新版本時：
   - 保存原始 ZIP 與 manifest。
   - 以原始 Parquet 作為 DB 的 `parquet_path`；`parquet/` 目錄保留給舊版程式產生的歷史檔案。
   - 在 PostgreSQL 建立 `law_dataset_versions` 版本，更新 `law_documents`，寫入 `law_article_versions` 條文快照，並記錄法規層級與條文層級的 `added`／`modified`／`removed` 變更事件。
8. 更新 `download_runs` 與 `law_sources` 狀態。
9. 若寫入資料庫失敗，會清除本次新產生但未被引用的 ZIP／manifest；原始 Parquet 備份會保留。

### 新版本判斷

- **原始雜湊**：ZIP 內 JSON 位元組的 SHA-256，用於快速跳過未變動的下載。
- **語意雜湊**：`SHA256(concat(sorted(law_key + ":" + content_hash + "\n")))`；`content_hash` 是單筆法規正規化 JSON 的 SHA-256。
- 因此 API 只調整 JSON 欄位順序、空白或外層 `UpdateDate` 時，不會建立新的 `law_dataset_versions`；但 raw JSON 位元組改變時仍可能新增一個原始 Parquet 快照。條文或法規中繼資料變動才會建立新版本。
- 全國法規 API 的 `HEAD` 回傳 405；更新檢查改用 GET stream 只讀 headers，以遠端 `Content-Length` 與本機 ZIP 大小比對，`Last-Modified`／`ETag` 僅記錄供追蹤。完整 ZIP 只在下載 workflow 取得，再以雜湊與 `UpdateDate` 確認是否套用。
- 舊版本不會被覆蓋：每次新版本都保留獨立的 ZIP、Parquet 與資料庫版本紀錄。被移除的法規只標記 `is_current = false`，不刪除歷史資料。

## 環境需求

- 建議 Python 3.12（`.python-version` 已固定；`pyproject.toml` 宣告 `>=3.10`）
- 目前主要依賴：`pyarrow 25.0.1`、`pytest 9.2.0`；`uv.lock` 固定版本
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
    "parquet_path": "/data/laws/raw_parquet/law/20261030/52a175716a11e2c5/laws.parquet"
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

`up.sh` 會依序啟動 Docker Compose 的 PostgreSQL 與 Qdrant、等待健康檢查、視設定啟動本機 llama.cpp reranker，接著探測 x570 的 llama-server（chat `11436`、embedding `11437`）；可用時以 x570 llama-server 為主要 API、MBP llama-server 為 fallback；x570 llama-server 未就緒時改用 MBP llama-server。Ollama 不再作為 runtime fallback。之後在 `127.0.0.1:9200` 啟動後端，並確認 `127.0.0.1:9201` 電源控制器可用；重複執行不會啟動第二個後端或 reranker。後端優先以 detached tmux session `judgment-web` 啟動，避免啟動它的終端或 shell process group 結束時一起被終止；tmux 不可用時才回退 `nohup`。`down.sh` 會先停止 `judgment-web` session，再清理 9200 listener 與電源控制器。可用 `tmux attach -t judgment-web` 查看後端輸出；`tmux kill-session -t judgment-web` 只停止該 session。若使用自訂 session 名稱，設定環境變數 `JUDGMENT_WEB_TMUX_SESSION`。查詢 embedding 前會先做 2 秒健康檢查，非本機 llama-server／Ollama 未回應即直接改用 fallback；實際 embedding 若超過 `EMBEDDING_QUERY_TIMEOUT_SECONDS`（預設 2 秒）未回應，也會改用 fallback。若 `frontend/` 尚未建立或來源檔較新，會先重新產生 standalone 前端。日誌位於 `.run/web.log`，啟動完成後會印出系統測試網址。`down.sh` 會先停止後端、控制器與本機 reranker（必要時強制結束），再執行 `docker compose stop`，不會刪除 `judgment_pgdata` 或 `judgment_qdrant` volume。可用 `JUDGMENT_PORT` 與 `JUDGMENT_POWER_PORT` 覆寫連接埠；設定 `JUDGMENT_SKIP_QDRANT=1` 可略過 Qdrant，`JUDGMENT_SKIP_DOCKER=1` 可略過 Docker 啟動／停止，`JUDGMENT_POWER_AGENT=0` 可停用電源控制器，`JUDGMENT_SKIP_UPDATE_CHECK=1` 可略過啟動時的線上更新檢查。

開啟 <http://127.0.0.1:9200/>，預設進入 RAG 提問頁。主控台是純靜態的 Vanilla JS SPA，由 FastAPI 直接服務，原始碼模式不需要 Node.js 建置步驟。若要以 `file://` 直接開啟，或部署到 Cloudflare Pages，請先產生 `frontend/`，見〈靜態前端與部署〉。

`judgment-web` 啟動時會自動在 `127.0.0.1:9201` 建立本機電源控制器，供 `./up.sh`／`./down.sh` 與電源 API 使用。header 右上角有齒輪「設定選項」，介面風格移至設定 sidebar；測試模式與 API 連線設定位於 `#/status` 左側的「系統測試」分類，也可直接開啟 `#/tests`。設定 `JUDGMENT_POWER_AGENT=0` 可停用控制器。

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

`backup.sh` 會把 `restore.sh` 複製到備份根目錄並產生 `USAGE.md`；偵測到索引／匯入／下載程序執行中時會中止，避免 PostgreSQL 與 Qdrant 進度不一致；只有確定只備份部分資料時才使用 `--allow-running`（此選項屬於 `backup.sh`，`restore.sh` 沒有）。

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

> PostgreSQL 的索引版本、`judgment_vector_index` 與 Qdrant collection 必須一起還原。若只還原 Qdrant，仍需有 PostgreSQL 的 `judgment_documents` 才能重新建立索引；若只還原 PostgreSQL，Qdrant 會是空的，且 `judgment_index_versions` 可能仍標示 active，索引器不一定會自動重建。還原時 `restore.sh` 會依 manifest 的 alias mapping 重建 `judgments_current`；若刻意只還原部分元件，應先清除或退役 `judgment_index_versions` 與 `judgment_vector_index` 的對應版本，再重新建立 collection 與 alias。

以目前資料量估算，完整備份至少約 150 GB 以上（`data/` 約 115 GB、PostgreSQL 約 36 GB、Qdrant snapshot 另計）；建議使用 256 GB 以上的磁碟，並保持整顆磁碟加密。備份不會包含 `.env`；secrets 請另存於 1Password／Keychain 或加密 vault，還原前再放回。PostgreSQL dump 預設要求 age 加密成 `postgres/judgment.dump.age`；未設定 `BACKUP_AGE_RECIPIENT` 會直接失敗，只有明確加 `--allow-unencrypted` 才能產生明文 dump。還原時需要對應的 `BACKUP_AGE_IDENTITY`，且 `restore.sh` 不會自動套用備份內的 `.env`。`restore.sh` 會在清除 schema 前確認 `judgment_app` 存在，還原後把 public tables／sequences ownership 轉移給它；`demo_reader` grants 需依 demo runbook 重新套用。

## 設定

下表以 `src/judgment/config.py` 的程式預設值為主；`.env.example` 會把資料目錄覆寫成本機相對路徑（例如 `./data/laws`、`./data/judgments`）。

| 環境變數 | 預設值 | 說明 |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg://judgment_app:<password>@localhost:5432/judgment` | 主應用連線字串；production 使用 `NOSUPERUSER/NOCREATEDB/NOCREATEROLE` 的 `judgment_app`，不要使用 superuser `judgment` |
| `POSTGRES_PASSWORD` | `change-me` | Docker Compose 初始化 PostgreSQL 的密碼；`.env.example` 要求自行設定 |
| `JUDGMENT_PG_PASSWORD` | 空 | `backup.sh`／`restore.sh` 使用的 PostgreSQL 密碼；未設定時沿用 `POSTGRES_PASSWORD` |
| `BACKUP_AGE_RECIPIENT` | 空 | age 公鑰；設定後 PostgreSQL dump 會加密成 `.age` |
| `BACKUP_AGE_IDENTITY` | `~/.config/judgment/age.key` | `restore.sh` 解密用的 age 私鑰路徑 |
| `BACKUP_REQUIRE_ENCRYPTION` | `1` | 沒有 `BACKUP_AGE_RECIPIENT` 就拒絕備份；只有 `--allow-unencrypted` 可明確放行明文 |
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
| `CORS_ALLOW_ORIGINS` | `http://127.0.0.1:9200,http://localhost:9200` | 允許呼叫 API 的前端來源，以逗號分隔；`*` 會被忽略。`null`（file://）預設不允許，僅開發時可明確加入 |
| `TRUSTED_HOSTS` | `127.0.0.1,localhost,testserver,::1` | Host header 白名單；正式網域需明確加入，防止 DNS rebinding |
| `FORWARDED_ALLOW_IPS` | `127.0.0.1` | 只信任本機 cloudflared／反向代理送來的 `X-Forwarded-*`；不要在直接對外時使用 `*` |
| `JUDGMENT_ADMIN_TOKEN` | 空 | 遠端管理 API 權杖；本機 loopback 可直接使用，非 loopback 請求必須帶 `X-Judgment-Admin-Token` |
| `OLLAMA_ALLOWED_HOSTS` | 空 | 可新增／探測的 Ollama `host:port` 清單；設定的 `EMBEDDING_URL`／`LLM_URL`／`RERANK_URL` 會自動加入 |
| `JUDGMENT_POWER_AGENT` | `1` | 啟動時自動建立 `127.0.0.1:9201` 電源控制器；設為 `0` 可停用 |
| `PERFORMANCE_RETENTION_DAYS` | `90` | 效能紀錄與 RAG 提問／回答保留天數；每日背景維護＋每 200 次寫入清理 |
| `QDRANT_URL` | 空 | Qdrant 連線位址；`.env.example` 本機預設 `http://127.0.0.1:6333` |
| `QDRANT_API_KEY` | 空 | Qdrant API key；Docker Compose 透過 `QDRANT__SERVICE__API_KEY` 啟用，正式環境必須設定 |
| `JUDGMENT_VECTOR_COLLECTION` | `judgment_documents` | 判決文件級向量 collection（legacy 實體名稱） |
| `JUDGMENT_VECTOR_ALIAS` | `judgments_current` | 正式查詢使用的 Qdrant alias |
| `JUDGMENT_VECTOR_COLLECTION_PREFIX` | `judgments` | 版本化實體 collection 前綴，例如 `judgments_v005` |
| `JUDGMENT_EMBEDDING_VERSION` | `bge-m3@v1` | 向量重用指紋的一部分；模型或前處理改變時必須更新 |
| `JUDGMENT_INDEX_RECIPE_VERSION` | `doc-head-tail-v1` | index text 規則版本；會自動附加 max_chars |
| `EMBEDDING_URL` | 空 | 主要 embedding API；x570 llama-server 使用 `http://x570:11437`（OpenAI 相容） |
| `EMBEDDING_API` | `ollama` | Embedding API 種類；x570／MBP llama-server 設 `openai`，Ollama 設 `ollama` |
| `EMBEDDING_FALLBACK_URL` | 空 | 主要 embedding API 無法連線時的 fallback；x570 可用時指向 MBP llama-server `http://127.0.0.1:11437`，x570 不可用時改為 primary |
| `EMBEDDING_FALLBACK_API` | `ollama` | Embedding fallback 的 API 種類；x570／MBP llama-server 用 `openai` |
| `EMBEDDING_FAILOVER_URLS` | 空 | 額外的 embedding fallback 清單（逗號分隔）；DB 有設定 Ollama 主機時由優先順序自動附加 |
| `EMBEDDING_FAILOVER_APIS` | 空 | 與 `EMBEDDING_FAILOVER_URLS` 對齊的 API 種類清單（`openai`／`ollama`） |
| `JUDGMENT_X570_LLM_URL` | `http://x570:11436` | `up.sh` 啟動時探測的 x570 llama-server chat |
| `JUDGMENT_X570_EMBEDDING_URL` | `http://x570:11437` | `up.sh` 啟動時探測的 x570 llama-server embedding |
| `JUDGMENT_MBP_LLM_URL` | `http://127.0.0.1:11436` | `up.sh` 探測的 MBP llama-server chat fallback |
| `JUDGMENT_MBP_EMBEDDING_URL` | `http://127.0.0.1:11437` | `up.sh` 探測的 MBP llama-server embedding fallback |
| `JUDGMENT_EMBEDDING_PROBE_TIMEOUT` | `2` | `up.sh` 探測 x570／MBP llama-server 的逾時秒數 |
| `EMBEDDING_MODEL` | `bge-m3` | 判決、法規條文與查詢共用的 embedding 模型（1024 維） |
| `EMBEDDING_TIMEOUT_SECONDS` | `120` | Embedding 請求逾時 |
| `EMBEDDING_QUERY_TIMEOUT_SECONDS` | `2` | 非本機 embedding 查詢的逾時；超過即改用 fallback（若設定）；本機 primary 使用 `EMBEDDING_TIMEOUT_SECONDS` |
| `EMBEDDING_HEALTH_TIMEOUT_SECONDS` | `2` | 使用非本機 embedding 前的健康檢查逾時；未回應即直接改用 fallback |
| `LLM_URL` | 空 | LLM API 位址；x570 llama-server 使用 `http://x570:11436`（OpenAI 相容） |
| `LLM_API` | `ollama` | LLM API 種類；x570／MBP llama-server 設 `openai`，Ollama 設 `ollama` |
| `LLM_FALLBACK_URL` | 空 | 主要 LLM 無法使用時的 fallback；x570 可用時指向 MBP llama-server `http://127.0.0.1:11436`，x570 不可用時改為 primary |
| `LLM_FALLBACK_MODEL` | 空 | fallback LLM 模型；空值沿用 `LLM_MODEL` |
| `LLM_FALLBACK_API` | `ollama` | fallback LLM 的 API 種類；x570／MBP llama-server 用 `openai`，Ollama 用 `ollama` |
| `LLM_MODEL` | 空 | RAG 回答模型；x570 llama-server 別名為 `gemma3:4b` |
| `LLM_TIMEOUT_SECONDS` | `180` | LLM 請求逾時 |
| `LLM_NUM_CTX` | `8192` | 單一併發 slot 的 prompt context 預算。llama-server 使用 `--parallel N` 時應設為 `--ctx-size / N`（例：x570 `24576 / 4 = 6144`）；不要設成總池 `24576`，否則併發請求可能超過 slot 上限。Ollama 路徑則直接使用此值 |
| `LLM_NUM_PREDICT` | `384` | 最多生成 tokens；OpenAI 路徑送 `max_tokens` |
| `LLM_KEEP_ALIVE` | `30m` | 舊 Ollama 路徑的模型保持載入時間；llama-server 不使用此設定 |
| `RAG_TOP_K` | `4` | 最終提供給 LLM 的判決數；啟用 reranker 時建議 `8` |
| `RAG_SCORE_THRESHOLD` | `0.35` | 向量相似度下限；低於門檻不提供給 LLM |
| `RAG_MAX_CONTEXT_CHARS` | `4000` | 提供給 LLM 的判決片段總字數上限 |
| `RAG_LEGAL_EXPANSION_ENABLED` | `false` | 將高信心法律術語的相關詞附加到 embedding query；只用於語意路徑，不影響 `keyword_list`。Proxy A/B 完成前預設關閉 |
| `RAG_LEGAL_EXPANSION_TERMS` | `4` | 每次最多附加幾個 expansion terms；越少越保守 |
| `RAG_SCOPE_PROBE_MAX_DOCUMENTS` | `50000` | 法院／年份精確探測的候選集上限；超過就跳過並揭露 |
| `RAG_SCOPE_PROBE_MAX_HITS` | `5000` | 單一詞精確命中上限；超過改走語意摘要 |
| `RAG_SCOPE_PROBE_TIMEOUT_MS` | `3000` | 精確探測的 PostgreSQL statement timeout |
| `RAG_LAW_FIRST_JUDGMENT_LIMIT` | `1` | 法規優先題最多保留幾筆判決作為輔助 context |
| `LEGAL_ARTICLE_VECTOR_ALIAS` | `legal_articles_current` | 法規／命令條文索引 alias；與判決 alias 完全分開 |
| `LEGAL_ARTICLE_VECTOR_COLLECTION` | `legal_articles` | alias 不存在時的後備 collection 名稱 |
| `LEGAL_ARTICLE_VECTOR_COLLECTION_PREFIX` | `legal_articles` | 版本化法規條文 collection 前綴，例如 `legal_articles_v001` |
| `LEGAL_ARTICLE_EMBEDDING_VERSION` | `bge-m3@v1` | 法規條文向量指紋；模型或前處理改變時更新 |
| `LEGAL_ARTICLE_INDEX_RECIPE_VERSION` | `law-article-v1` | 法規條文 index text 規則版本 |
| `LEGAL_ARTICLE_INDEX_MAX_CHARS` | `4000` | 每筆法規條文送 embedding 的字數上限 |
| `LEGAL_ARTICLE_INDEX_BATCH_SIZE` | `32` | 法規條文索引每批 embedding／upsert 筆數 |
| `LEGAL_ARTICLE_PAYLOAD_MAX_CHARS` | `8000` | Qdrant payload 保留的條文原文上限 |
| `RAG_LAW_VECTOR_ENABLED` | `false` | 啟用法規／命令條文向量檢索；alias 不存在時自動退回 BM25（`.env.example` 預設開啟） |
| `RAG_LAW_VECTOR_CANDIDATES` | `30` | 法規條文向量候選數 |
| `RAG_LAW_SCORE_THRESHOLD` | `0.25` | 法規條文向量相似度下限 |
| `RAG_LAW_RRF_K` | `60` | RRF 排名平滑常數；越大越平緩 |
| `RAG_LAW_DENSE_WEIGHT` | `0.2` | dense 排名在 RRF 中的投票權重 |
| `RAG_LAW_ARTICLE_LIMIT` | `4` | 判決優先題每部法規最多保留幾條條文 |
| `RAG_LAW_ARTICLE_LIMIT_LAW_FIRST` | `6` | 法規優先題每部法規最多保留幾條條文 |
| `RAG_LAW_CANDIDATE_ARTICLE_LIMIT` | `8` | 啟用 reranker 時每部法規先取幾條候選條文 |
| `RAG_LAW_RERANK_WEIGHT` | `0.15` | 法規 rerank 與 BM25／dense 前置排序的融合權重（0–1） |
| `RAG_LAW_RERANK_MAX_CHARS` | `600` | 每條法規條文送 law reranker 的字數上限 |
| `RAG_RERANK_ENABLED` | `false` | 啟用 BGE reranker；x570 由 `judgment-reranker.service` 提供，本機可用 `scripts/rerank_server.sh` |
| `RAG_RERANK_CANDIDATES` | `30` | 啟用 reranker 時先向 Qdrant 取得的候選判決數 |
| `RAG_GATE_LAW_RECALL_MIN` | `0.75` | Benchmark regression gate 的法規 recall 下限 |
| `RAG_GATE_ARTICLE_RECALL_MIN` | `0.70` | Benchmark regression gate 的條文 recall 下限 |
| `RAG_GATE_JUDGMENT_RECALL_MIN` | `0.65` | Benchmark regression gate 的判決 recall 下限 |
| `RAG_GATE_CITATION_VALID_RATE_MIN` | `0.95` | Benchmark regression gate 的 citation 合法率下限 |
| `RAG_GATE_REFUSAL_ACCURACY_MIN` | `0.90` | Benchmark regression gate 的拒答正確率下限 |
| `RAG_GATE_DURATION_P95_MAX_MS` | `15000` | Benchmark regression gate 的 P95 延遲上限 |
| `RERANK_URL` | `http://x570:11435` | 主要 reranker 服務；llama.cpp 使用 `/v1/rerank` |
| `RERANK_FALLBACK_URL` | `http://127.0.0.1:11435` | x570 不可用時的本機 reranker fallback |
| `RERANK_MODEL` | `bge-reranker-v2-m3` | reranker 模型名稱，會記錄在 Flow |
| `RERANK_PORT` | `11435` | 本機 llama-server 監聽埠；`up.sh`／`down.sh` 共用 |
| `RERANK_LOCAL_HOST` | `127.0.0.1` | `up.sh` 啟動本機 reranker 的綁定位址 |
| `RERANK_START_LOCAL` | `auto` | `auto` 表示啟用 reranker 且設定了本機 URL 時由 `up.sh` 啟動；`1` 強制啟動、`0` 不啟動 |
| `RERANK_OLLAMA_MODEL` | `qllama/bge-reranker-v2-m3:latest` | 由 Ollama 模型庫取出 GGUF 時使用的 tag |
| `RERANK_TIMEOUT_SECONDS` | `3` | reranker 單次請求逾時 |
| `RERANK_CONNECT_TIMEOUT_SECONDS` | `0.75` | reranker 連線逾時；避免 x570 離線時拖慢回答 |
| `RERANK_MAX_CHARS` | `1200` | 每個候選文件送進 reranker 的最大字元數 |
| `JUDGMENT_INDEX_MAX_CHARS` | `1600` | 每筆判決 embedded 的頭尾視窗字數 |
| `JUDGMENT_POINT_ID_VERSION` | `jid-uuid5-v1` | Qdrant point ID 規則版本；變更會使舊向量不相容 |
| `OPENDATA_JUDICIAL_GOV_TW_ACCOUNT` | 空 | 司法院開放資料帳號；判決下載 workflow 使用 |
| `OPENDATA_JUDICIAL_GOV_TW_PASSWORD` | 空 | 司法院開放資料密碼；不得寫入日誌或 manifest |
| `JUDGMENT_DOWNLOAD_CATEGORY` | `051` | 判決下載使用的司法院主題分類代碼 |
| `JUDGMENT_DOWNLOAD_START_ID` | `71644` | 判決下載 baseline 起始 fileset |
| `JUDGMENT_DOWNLOAD_KNOWN_LATEST_ID` | `72011` | 判決下載 baseline 已知最新 fileset |
| `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS` | `true` | 允許在 00:00–06:00 以外下載判決檔案；預設最多 6 個月份檔案並行，設為 `false` 時恢復嚴格時段限制並改為循序下載。 |
| `JUDGMENT_DOWNLOAD_CONCURRENCY` | `6` | 判決下載同時進行的檔案數上限（1–6）；某個檔案完成後才會補上下一筆。 |
| `JUDGMENT_RAW_RAR_KEEP_VERSIONS` | `true` | 判決下載新版本時將舊 RAR/7z/zip 移到 `raw_rar/history/`，不直接刪除；設為 `false` 才刪除舊容器（record-level 舊資料仍由 delta/DB 保存）。 |
| `JUDGMENT_RAW_PARQUET_KEEP_VERSIONS` | `false` | 混合備份預設只保留 current full raw Parquet；變更/移除的舊 raw JSON 寫入 delta。設為 `true` 可保留舊 full Parquet 供比對。 |
| `JUDGMENT_VECTOR_HISTORY_COLLECTION` | `judgment_documents_history` | Qdrant 中被取代/移除的舊向量 history collection；不屬於 `judgments_current` alias。 |
| `JUDGMENT_PROCESSING_STATE` | `.run/processing_state.db` | 資料處理共用 SQLite WAL checkpoint；Web、匯入、Parquet、索引與 `workflow_runner` 都會讀寫同一個 DB。舊 `.json` 會自動遷移為 `.json.migrated`。測試會以環境變數隔離，不會覆寫正式狀態。 |
| `JUDGMENT_EVENT_SOCKET` | 依 state 路徑產生暫存 socket | Importer 推送即時 progress event 的 Unix domain socket；預設為 `judgment-pe-<hash>.sock`，避免 macOS 路徑長度限制。 |
| `JUDGMENT_EVENT_JOURNAL` | `.run/processing_events.db` | Web server 保存 importer progress event 的 SQLite WAL 事件 journal；支援 `Last-Event-ID` replay。 |
| `JUDGMENT_EVENT_RETENTION` | `200000` | SQLite event journal 保留筆數上限；超過後自動修剪最舊事件。 |
| `JUDGMENT_STATE_MAX_COMPLETED` | `20` | SQLite state checkpoint 保留的已完成 run 數；避免 state 無限成長。 |
| `TEST_EMBEDDING_MODELS` | 空 | 測試模式要跑的 embedding 模型（逗號分隔）；空值自動從 Ollama 偵測 |
| `TEST_LLM_MODELS` | 空 | 測試模式要跑的 LLM 模型（逗號分隔）；空值自動從 Ollama 偵測 |

## 檔案配置

`LAW_DATA_DIR` 下的結構：

```text
/data/laws/
├── raw/
│   └── law/20261111/ChLaw.json.zip
│       └── law/20261111/ChLaw.json.<hash8>.zip   # 同日同名不同內容時
├── raw_parquet/
│   └── law/20261030/03d5f6…/laws.parquet
│       └── manifest.json
├── parquet/                 # 舊版程式產生的歷史正規化 Parquet；目前下載流程不寫入
│   └── law/20261030/52a175716a11e2c5/laws.parquet
├── manifests/
│   └── law/20261030/52a175716a11e2c5.json
└── tmp/
```

- ZIP 存放下載日期 `YYYYMMDD` 資料夾與原始檔名（例如 `raw/law/20261111/ChLaw.json.zip`）；同一天同檔名但內容不同時加 ZIP hash 前 8 碼。原始 Parquet 與 manifest 分區仍使用來源 `UpdateDate` 的 `YYYYMMDD`。
- 原始 Parquet 目錄使用原始 JSON SHA-256 前 16 碼；manifest（及 legacy 正規化 Parquet）使用語意雜湊前 16 碼。
- 所有寫入先落到 `tmp/`，再以原子 rename 移到目的地。
- `parquet_path` 與 `zip_path` 會以絕對路徑寫入 PostgreSQL；新資料的 `parquet_path` 指向 `raw_parquet/`。

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

## 法規相關 PostgreSQL 資料表

以下只列法規模組使用的資料表；判決、索引版本、效能、題庫與 Ollama 設定的資料表分別在後續章節說明。

| 資料表 | 用途 |
| --- | --- |
| `law_sources` | 每個來源的最後檢查時間、最後變更時間 |
| `law_dataset_versions` | 每次成功匯入的版本；保留 ZIP/Parquet 路徑、三種雜湊、數量與 `is_current` |
| `law_documents` | 每筆法規的現行中繼資料、首次／最後出現版本、移除版本與 `is_current` |
| `law_change_events` | 法規層級的 `added`／`modified`／`removed` 事件、變更欄位與前後中繼資料 |
| `law_article_versions` | 每個法規版本的完整條文快照；`law_id + law_version_id + article_key` 唯一 |
| `law_article_change_events` | 條文層級的 `added`／`modified`／`removed` 事件、變更前後內容與版本 |
| `download_runs` | 每次執行的狀態、HTTP 狀態、耗時、雜湊、數量、錯誤訊息與版本關聯 |
| `download_update_records` | 法規／命令／判決的線上檢查與下載完成紀錄；每個來源保留一筆 `is_current`，含遠端 filename／length、本地版本與下載日期路徑 |

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

- `article_key` 由 `article_type` 與去空白後的 `article_no` 組成，例如 `A:第19條`；沒有條號時為 `A:#<index>`。
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

判決壓縮檔放在 `JUDGMENT_DATA_DIR/raw_rar/`（預設 `/data/judgments/raw_rar`；本機可用 `./data/judgments/raw_rar`），匯入器也相容根目錄下的壓縮檔，支援 `.rar`、`.7z`、`.zip`。以 `documents/金融法規.md` 作為納入資料庫的白名單。系統會從判決全文擷取「法規名稱＋條號」的引用；只有至少命中清單中一項法規或命令的判決，才會寫入 PostgreSQL 的 `judgment_documents`。

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

- `--replace`：刪除本次未重新匯入的舊資料，**包含因 `--archive`／`--limit` 而未處理的 archive**；使用這兩個限制時請勿搭配 `--replace`，以免刪除其他資料。
- `--dry-run`：只掃描與統計，不寫入資料庫，也不建立 `judgment_import_runs`。
- `--raw-only`：只建立原始 Parquet 備份，不篩選、不寫入 PostgreSQL；可用來補建既有壓縮檔的原始備份，不建立 `judgment_import_runs`。
- `--limit 2000`：限制 DuckDB 候選處理筆數，適合測試。
- `--archive PATH`：只處理指定的壓縮檔，可重複指定。
- `--batch-size 500`：調整每批寫入筆數。
- 匯入過程在 macOS 使用內建 `bsdtar` 讀取 RAR；Linux 需安裝 `libarchive-tools`。
- 實際寫入 PostgreSQL 的匯入會建立 `judgment_import_runs`，記錄掃描、命中、寫入、引用數與耗時。
- 匯入前會先將解壓縮後的每個 JSON 物件寫入 `parquet/raw_judgments/.../raw.parquet`；`raw_json` 保留原始文字內容，且包含未命中金融法規的判決，作為不可變的原始備份。
- 未命中的判決不會寫入資料庫，但會保留在原始 Parquet 備份與原始 `.rar` 中。

### DuckDB 候選篩選（Phase 1 + Phase 2）

DuckDB 現在同時負責原始備份的前置候選篩選與 PostgreSQL 匯入的候選掃描；Python Regex 只做精確引用解析。

原始 Parquet 建立流程（一次處理一個月份 archive）：

1. 串流解壓縮該月份，邊讀取邊把 `raw_json`（保持原文）與 base 欄位寫入暫存 Parquet（每 5,000 筆一批）
2. DuckDB 對暫存檔移除空白後，以法規名稱做寬鬆候選篩選：
   ```sql
   WHERE regexp_matches(
     regexp_replace(json_extract_string(raw_json, '$.JFULL'), '[\s\p{Z}\x{000B}\x{001C}-\x{001F}\x{0085}]+', '', 'g'),
     '<法規名稱 alternation>'
   )
   ```
3. Python 只對 DuckDB 候選執行精確的法規名稱＋條號解析
4. pyarrow 以 **ZSTD level 3** 輸出該月份最終 `raw.parquet`，然後刪除暫存 base 檔

每個月份最後只有一份 `raw.parquet`。實測 `pyarrow + ZSTD level 3` 與 DuckDB staging 的檔案大小幾乎相同（約 59 MB vs 58.6 MB / 102 MB 原始 archive），但少了 DuckDB staging 約 1.7 秒/月的成本，因此作為預設 writer；DuckDB staging 實作保留為 `_write_archive_raw_parquet_duckdb` 供實驗。

ZSTD 相較 Snappy 約可少 34–46% 檔案大小，壓縮本身只增加約 0.2–0.5 秒/月。

DuckDB 候選 Regex 會把每個法規名稱字元展開成所有 NFKC 等價字元（例如 `U+F9BE` 會對應到「料」），避免判決全文使用相容異體字時漏掉候選；Python 端仍以 NFKC 正規化後的精確解析為準。


單月 raw Parquet 寫入效能可用下列腳本在管線閒置時比較（2–3 次取中位數）：

```bash
uv run python scripts/benchmark_raw_parquet.py \
  --archive data/judgments/raw_rar/200212--(20261015Update).rar --runs 3
```

腳本會比較舊 pyarrow/Snappy、DuckDB/Snappy、DuckDB/ZSTD level 1 與 DuckDB/ZSTD 預設，並輸出耗時與檔案大小。

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

- **題庫新增**：輸入問題後由本機 llama-server 回答並自動產生題型、難度、法規／條文、參考答案與標籤，建立為待審題目；也可貼上 JSON 批次匯入。預期法規、條文與判決 jid 會對現行 PostgreSQL metadata／條文驗證。
- **題庫管理**：狀態、版本、fingerprint、標籤、stale 標記、soft delete 與 JSON 匯出；草稿、已拒絕或已核准題目可在此重新送審。狀態／題型／難度下拉選單變更會自動套用篩選；標籤支援 fuzzy 搜尋與多標籤（AND）篩選，選擇「已刪除／退役」可列出 soft delete 題目並復原為待審。
- **Benchmark 題庫**：只允許 accepted、未 stale 的題目；可建立 smoke／core／full suite、凍結版本。
- **題庫人工驗收批注**：左側題目清單、右側題目內容與核准／退回／拒絕／刪除；待審／退回、已核准、已拒絕、草稿分頁，rubric 分數、批注與審核紀錄。待審為 0 時會提示如何送審或切換到已核准題目重新驗收。
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

點擊 RAG 判決引用卡的案號標題（`citation-head`）會直接從原始判決 Parquet 讀取完整判決，不再只連到外部 PDF。若問題包含「所有／全部／列出／清單／近 N 年所有判決」等完整列表意圖，RAG 會在 `notice` 顯示本次候選數、實際保留的前 N 筆，並建議改用「資料庫查詢」頁面的判決分類，以案由、關鍵字與裁判日期範圍篩選或匯出 CSV／JSON；避免使用者誤以為 top-K 引用就是全部判決。

- 輸出：`data/judgments/parquet/raw_judgments/<archive>/<YYYYMMDD>/<snapshot>/raw.parquet`
- `raw_json` 保留未修改的原始 JSON 文字；同一份 Parquet 另含案號、法院、案由、裁判日期、命中法規與引用等查詢欄位。
- 資料頁、Schema 模式與 `source=parquet` API 都直接查詢原始判決 Parquet，不使用過濾後的 `judgments.parquet`；系統仍保留「判決 Parquet 匯出」workflow，可手動產生過濾後的快照。
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

判決原始資料的法院欄位可能夾雜「民事／刑事／簡易庭／小額」等字尾，或抓到內文提到的其他法院。系統保留原始 `court` 供追溯，並以 `court_normalized` 儲存標準法院名稱；程式定義 44 個名稱（含歷史名稱，例如智慧財產法院、公務員懲戒委員會、司法院冤獄賠償／刑事補償法庭、臺灣板橋地方法院），目前 4,714,967 筆 current 判決實際出現 44 個且無空值。解析順序為：

1. 原始法院值開頭即為標準法院名稱時直接採用。
2. 否則取判決全文前 8,000 字中最早出現的法院名稱。
3. 再嘗試原始法院值中任意位置出現的標準法院名稱。
4. 仍無法判斷時，以 JID 前綴（官方法院代碼）對應。

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

全站分頁標題（Chrome 分頁 hover 顯示）統一使用短版「Judgment｜金融法律判決 RAG AI 智慧分析平台」，含英文品牌名稱且 29 字元，可完整放入瀏覽器 hover 浮窗。路由切換、展示模式鎖定與頁面非同步更新都不會改成頁面名稱；靜態 `<title>` 使用相同短版，`meta description` 與 Open Graph／Twitter 描述則保留完整站點簡介。

Header 品牌標誌以「天平＋電路節點」表達法律／判決與 RAG AI：天平代表法律與裁判，三個節點與連線代表檢索與 AI；字標使用襯線體 `JUDGMENT`，副標使用等寬體 `LEGAL RAG INTELLIGENCE`。品牌連結的無障礙名稱為「Judgment 金融法律判決智慧分析平台 首頁」，`favicon.svg` 使用相同圖形與 `#76b900` 品牌綠。

RAG 工作區右上工具列的 DOM、視覺、分享給朋友、三點選單、公開連結快照、分享頁與隱私／無障礙契約，見 [`specs/004-web-console/rag-workspace-toolbar.md`](specs/004-web-console/rag-workspace-toolbar.md)。

### 頁面路由

| 路由 | 頁面 | 功能 |
| --- | --- | --- |
| `#/home` | 首頁 | 預設入口。主視覺與可直接輸入問題的提問框；即時資料卡顯示法規／命令、金融判決、裁判年份與判決向量索引；重要數據卡與資料庫、處理總覽、系統狀態使用相同後端定義；RAG 能力區顯示判決／法規索引、Embedding／LLM／Reranker 與判決、法規引用追溯路徑；來源區連結司法院 OpenData、全國法規資料庫與可收合的 99 條金融法規清單（11 欄 × 9 列，可下載原始 `.md`）；下方以共用 `.rag-wf-*` waterfall 顯示本次 `GET /api/home` 的實際階段計時與最慢 bottleneck，並列出七個分頁功能卡與完整頁尾。資料由 `/api/home` 取得，`processing` SSE 更新時自動重新整理。輸入問題按 Enter 會帶著題目前往 `#/rag` 並自動送出。品牌標誌固定返回首頁。 |
| `#/rag` | RAG 提問 | 問題輸入、Qdrant 判決向量檢索、可選 BGE reranker 精排、LLM 引用回答、索引覆蓋率、判決引用、瀏覽器端提問紀錄，以及可展開的即時後端處理流程。回答完成後，問題泡泡與回答卡會顯示 hover／focus 操作工具列：問題可複製、分享、編輯、重新提問；回答可複製、分享、重新生成；觸控裝置固定顯示操作按鈕。分享會將目前對話快照寫入 `rag_share_snapshots`，並直接複製專屬公開連結 `#/rag/share?contentId=<token>` 到剪貼簿；不再開啟系統分享面板或複製整段問答文字。開啟連結後直接還原完整對話，不重新呼叫 LLM，快照保留 7 天。分享頁保留一般 RAG 雙欄版面與左側對話庫／歷史記錄，讓被分享者看到與正常 `#/rag` 一致的畫面；只隱藏右上工作區工具列。分享與複製操作完成後會釋放按鈕焦點，不留下外框。成功時顯示「已複製公開連結」與「任何擁有此連結的人都可以查看這段對話。」RAG 工作區右上方另有「分享給朋友」按鈕（點擊以 Web Share API 開啟系統分享選單並帶入 `https://judgment.ragdemo.win`；不支援時複製連結並顯示 toast）、三點對話選單（重新命名、釘選對話、刪除、移至專案）與建立公開連結按鈕；分享檢視會隱藏此工具列。RAG 檢索狀態卡預設收合為單行（綠色勾勾、檢索與回答就緒、3 個模型與展開箭頭），點擊或按 Enter／Space 才展開說明與模型表；模型表文字固定 12px，Chat／Embedding／Rerank 皆以 x570 為使用中、MBP 為 Fallback，優先順序為 x570 > MBP。狀態卡彙整所有可用主機已確認支援 chat 的模型按鈕（以「主機:模型」顯示，例如 `mbp:gemma3:4b`、`x570:gemma3:4b`；綠色可切換，下一次提問生效），並可手動重新檢查所有主機的模型能力；另列 Rerank models，顯示主要與 fallback reranker 的可用狀態，離線或未啟用時以灰色呈現。每次回答最下方會嵌入與效能報表相同規格的 RAG Pipeline waterfall，依執行順序接續顯示 Parsing／Embedding／Qdrant／Reranker／Context／LLM／Response 的 Token、TTFT、主機／模型與引用數；Embedding／LLM 的 bar 以藍色前段標示 Model Load，後段為推論；展開後分成兩個明細區塊，各自顯示正確的開始／結束時間與耗時，載入結束時間等於推論開始時間；後端處理流程與測試 Flow 也使用同一套 waterfall。 |
| `#/data` | 資料庫查詢 | 左側 sidebar：查詢法規命令、查詢判決、資料庫 Schema。法規命令與判決查詢支援 fuzzy 多條件（AND）與 suggestion，選取後立即查詢；可展開進階 metadata 條件。Schema 模式可切換法規命令／判決與資料庫，列出資料表，點選後在右側預覽欄位名稱、前 10 筆資料與總筆數，支援分頁與 CSV／JSON 匯出。 |
| `#/quality` | 資料品質 | 左側 sidebar：品質總覽、題庫新增、題庫管理、Benchmark 題庫、題庫人工驗收批注。品質總覽以 DuckDB 直接掃描最新原始判決 Parquet：案號重複／缺少、全文為空或過短、法院／日期／案由缺漏、引用欄位一致性、重複內容、archive 明細、法院／年份／法規／案由分布，以及 PostgreSQL／向量索引覆蓋。題庫工作區支援法規／條文／判決驗證、版本、JSON 匯入匯出、suite 凍結與人工批注。 |
| `#/performance` | 效能報表 | 左側 sidebar：效能總覽、RAG Pipeline、RAG Benchmark。效能總覽保留測試流程、索引效能與完整 Flow；RAG Pipeline 依執行順序接續繪製 Parsing／Embedding／Qdrant／Reranker／Context／LLM／Response waterfall，上一階段結束位置即下一階段開始位置；顯示各 span 的開始／結束時間、Token、TTFT、模型與來源數量，滑鼠移到 bar 上會顯示該 span 的詳細資訊；使用模型的階段會標註「主機:模型」，Embedding／LLM bar 的藍色前段為 Model Load，後段為扣除載入後的推論時間，展開明細會分成兩段並各自顯示開始／結束時間；RAG Benchmark 可選擇題庫、embedding／LLM／judge model、Top K、threshold、重複次數與法規檢索開關，顯示逐題結果、LLM judge、人工評分、同題 fingerprint 歷史與延遲／檢索召回率。 |
| `#/processing` | 資料處理 | 左側工作流程 sidebar 列出處理總覽與 9 個可執行流程；右側顯示所選流程的 Python 程式、Shell／入口腳本、實際命令、執行按鈕與最近一次結果。含 embedding 的流程（法規／命令索引、判決匯入、Qdrant判決向量索引版本建置）在執行資訊卡片提供「Embedding 主機／模型」按鈕列，與 RAG model strip 使用相同的可點選按鈕；按鈕以「主機:模型」顯示，例如 `x570:bge-m3:latest`、`mbp:bge-m3:latest`，列出線上具備 embedding 能力的模型。選擇後會儲存該主機的 embedding model、把該主機設為第一優先，其餘主機依序作為備援，切換前警告既有索引可能需要重建；不再顯示主機卡片、拖移把手或上下箭頭。處理總覽分為「法規」「命令」「判決」三個時間表卡片，並與 Qdrant 索引檔案時間表使用一致幾何：標頭以 2×3 指標顯示完成月份、未完成月份、有更新月份、總月份、完成率與完成階段，Embedding／Rerank 主機模型顯示於 summary row，目前版本或目前匯入列使用 `index-current-row`，年份×月份表格可水平捲動。每個月份格內有四個 `index-month-block`，由左至右固定使用綠色下載、粉色 Parquet、藍色 PostgreSQL、橘色 Qdrant；完成階段為實心方塊，未完成階段為同色 25% 淺色，Qdrant 已有先前處理進度但未完成時以完成色進度條表示，alias 切換後轉為實心橘色，執行中的階段以與已處理相同的完成色垂直進度條填充，無資料為淡色空心框。不再顯示「處理中」灰階狀態，執行中的活動由小格進度條表示；SSE `index_runtime` 更新時，目前處理月份會立即移動到新月份，前一月份轉為已處理淡橙色，不等待重新整理；表格上方 legend 顯示四階段顏色與實心／25% 淺色／進度條狀態。法規／命令以來源版本月份顯示，判決以 1996-01–2026-09 的 369 個月顯示；判決四階段分別依本機 `.rar`、raw Parquet manifest、PostgreSQL `issue_month` 與 Qdrant 月份覆蓋率判定。完整資料更新仍可由 `judgment.processing_update`／`POST /api/processing/update`／排程腳本執行；頁首僅保留執行中的「停止更新」按鈕。`YYYYMMDDHHMM` 版本編號仍持久化，法規／命令時間表的目前版本列與 tooltip 會顯示版本編號。 |
| `#/status` | 系統狀態 | 左側分類依序為服務總覽、系統測試、系統資料使用、Model Provider、前後端架構、資料版本、API 端點與最近下載；包含核心與 AI 服務健康（含 Reranker 服務）、判決索引覆蓋率、資料量、CPU／RAM／Swap、Docker 容器與 volume 用量、PostgreSQL／Qdrant 資源、磁碟空間、架構圖與下載執行紀錄。服務總覽在 hero 與服務卡片之間顯示「服務總覽載入 Pipeline」waterfall，將頁面初始化、HTTP 往返、`/api/status` 的 PostgreSQL／Parquet／索引版本／Qdrant／Embedding／LLM／Reranker／RAG／覆蓋率／鮮度／法規索引等後端檢查與回應彙整，依 pipeline-waterfall 規格接續繪製；標頭以 2×3 指標顯示總耗時、Server、HTTP 傳輸、頁面初始化、最慢階段與完成階段，可展開查看每個階段的開始／結束、耗時、占比與說明。「前後端架構」顯示 Client → Application → Pipelines → Data 四層目前專案元件，下方另內嵌 SVG 流程方向示意圖，標示 REST、SSE、RAG、Processing Runtime、資料／模型服務、Scheduler／CLI 與 IndexedDB 的方向。「資料版本」沿用服務總覽的 hero、圓環、2×3 指標與 `index-current-row`／卡片語言，顯示 PostgreSQL 資料版本、IndexedDB 本機資料、Qdrant 判決向量索引、Qdrant 法規／命令向量索引與 Parquet／執行狀態；PostgreSQL 卡列出資料版本總數、下載執行總數與最新版本；IndexedDB 卡列出 `judgment-console` schema 版本、query_history／settings／audit_events 筆數與容量。判決索引落後時以 warning 色顯示待補筆數與覆蓋率，並可對照 alias、collection、版本、模型、points、dimension、fresh／stale 與最近索引時間。「API 端點」由 FastAPI route table 動態產生，以 hero 顯示端點數、分類數、API Base、method 統計與 Swagger／OpenAPI 連結，並依系統／處理／查詢／RAG／索引／模型／測試／題庫／Benchmark 分組列出目前 method、path 與 label。Model Provider 可管理 llama-server 主機與模型、切換使用中的主機；每個模型會顯示 Chat／Embedding／Vision／Tools／Thinking／Speech／Reranker 能力標籤，並可手動「檢查模型能力」更新尚未測試的模型。embedding 主機與模型可在資料處理頁以「主機:模型」按鈕選擇，選取後設為第一優先。 |
| `#/tests` | 系統測試 | 獨立路由，內容與 `#/status` 的「系統測試」分類相同：API 連線設定、測試模式開關、LLM 服務測試、Reranker 服務測試與測試 Flow。header 不直接列出此頁；未設定 API Base 的 standalone 前端會自動導向此頁。 |

### Pipeline Waterfall 規格

所有以時間軸呈現 pipeline 的視圖（首頁即時摘要載入 Pipeline、RAG Pipeline、Processing 判決向量索引與判決匯入／下載 workflow 流程進度、效能 Flow、測試 Flow 等）MUST 依 [`specs/004-web-console/pipeline-waterfall.md`](specs/004-web-console/pipeline-waterfall.md) 建置。階段進度的未完成區段、進度填充與完成狀態另 MUST 依 [`specs/004-web-console/progress-visualization.md`](specs/004-web-console/progress-visualization.md)：未完成為階段色 25% 淺色、進度填充為完成色 `var(--block-color)`、完成為 100% 實心；四階段共用同一組 `is-pending`／`is-running`／`is-complete` class、CSS selector 與 SSE 契約。Waterfall 規格定義共用時間軸、接續階段定位、極短階段最小可見寬度、已完成填色與未完成 25% 淺色、Model Load 分段、可展開明細、hover 資訊卡、SSE 展開狀態保存，以及 390px 無水平溢出等驗收條件；未來新增 pipeline waterfall 不得另建一套視覺語言。

### HTTP API

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| `GET` | `/api/health` | 存活檢查，回傳版本。 |
| `GET` | `/api/home` | 首頁即時摘要：法規／命令與條文數、金融判決數與裁判年份、原始 manifest、判決／法規索引、金融法規清單、來源連結，以及本次查詢的階段計時 `pipeline`。 |
| `GET` | `/api/status` | 服務狀態、資料筆數、架構、最近版本與下載執行。 |
| `GET` | `/api/system-usage` | 主機 CPU／RAM／Swap、Docker context／容器與 system df、Qdrant container 掛載路徑與 volume、前端／後端程式大小、PostgreSQL／Qdrant volume 與資料庫容量、Parquet 容量、磁碟空間與元件合計。 |
| `GET` | `/api/index-versions` | 列出索引版本、active alias 與版本狀態。 |
| `GET` | `/api/index-versions/{version_id}` | 讀取單一索引版本、驗證結果與來源 snapshot。 |
| `POST` | `/api/index-versions/{id}/validate` | 驗證指定版本（count、dimension、collection）。 |
| `POST` | `/api/index-versions/{id}/activate` | 原子切換 alias 到指定版本。 |
| `POST` | `/api/index-versions/rollback` | 將 alias 切回上一個成功版本。 |
| `GET` | `/api/index-alias/reconcile` | 比對 Qdrant alias 與 PostgreSQL active 版本，可加 `?repair=true`。 |
| `GET` | `/api/catalog` | 依「法規命令／判決」分類回傳資料庫清單與各資料表可用的篩選欄位。 |
| `GET` | `/api/schema/suggest` | Schema 模式的逐欄 fuzzy 建議；支援 database、table、column、query 與 limit。 |
| `GET` | `/api/data/suggest` | 法規／判決 fuzzy suggestion；判決包含法院、案件字號與命中法規。 |
| `GET` | `/api/quality` | DuckDB 原始判決 Parquet 品質檢查、分布統計、archive 明細、PostgreSQL 收錄與向量索引覆蓋。 |
| `GET` | `/api/question-bank/items` | 題庫列表；支援搜尋、狀態、題型、難度、多標籤（AND）與 stale 篩選。 |
| `GET` | `/api/question-bank/tags` | 標籤 fuzzy 搜尋；回傳相近標籤與題目數。 |
| `GET` | `/api/question-bank/stats` | 題庫統計：各狀態、題型、難度與 suite 題數。 |
| `GET` | `/api/question-bank/benchmark-ready` | 列出 accepted、未 stale、可用於 benchmark 的題目。 |
| `POST` | `/api/question-bank/items` | 新增題目；驗證現行法規、條文與判決 jid，並建立 fingerprint 與版本 1。`status` 可指定題庫支援的狀態（預設 `pending_review`，亦可 `draft` 等）。 |
| `POST` | `/api/question-bank/ai-items` | 輸入問題，由本機 llama-server 回答並自動產生題型、難度、法規／條文、參考答案與標籤，建立為待審題目。 |
| `GET` / `PATCH` / `DELETE` | `/api/question-bank/items/{id}` | 讀取、修改建立新版本、soft delete（retired）。 |
| `POST` | `/api/question-bank/items/{id}/submit` | 送交人工驗收；將非 retired 的題目改為 `pending_review`（含 draft、approved、rejected、changes_requested）。 |
| `POST` | `/api/question-bank/items/{id}/restore` | 復原 soft delete 題目，狀態改為 `pending_review`。 |
| `POST` | `/api/question-bank/items/{id}/review` | 人工驗收：approved／rejected／changes_requested、rubric 分數與批注。 |
| `GET` / `POST` | `/api/llama-server/hosts` | 列出 llama-server 主機（含即時狀態與模型）／新增主機。 |
| `PATCH` / `DELETE` | `/api/llama-server/hosts/{id}` | 編輯／刪除 llama-server 主機。 |
| `POST` | `/api/llama-server/hosts/{id}/activate` | 設為目前使用的 llama-server 主機，並移到優先順序第一。 |
| `POST` | `/api/llama-server/hosts/reorder` | 依 `host_ids` 順序設定 llama-server 主機優先順序；第一台設為目前主機，embedding 失敗時依序改用下一台。 |
| `POST` | `/api/llama-server/hosts/capabilities/test` | 檢查所有可用主機的模型能力（llama-server 使用 `/v1/models`／`/health`），更新 Chat／Embedding／Vision／Tools 等標籤。 |
| `POST` | `/api/llama-server/hosts/deactivate` | 停用目前主機，改回 `.env` 設定。 |
| `POST` | `/api/llama-server/hosts/{id}/models/select` | 設定主機的聊天或嵌入模型。 |
| `POST` | `/api/llama-server/hosts/{id}/models/clear` | 取消主機的聊天或嵌入模型設定。 |
| `POST` | `/api/question-bank/import` | JSON 批次匯入；以 fingerprint upsert。 |
| `GET` | `/api/question-bank/export` | 匯出題庫 JSON；預設只匯出 `accepted`、最多 200 筆，可用 `status`、`include_deleted` 調整。 |
| `POST` | `/api/question-bank/revalidate` | 重新驗證全部題目；法規條文內容變更時標記 stale。 |
| `GET` / `POST` | `/api/benchmark/suites` | 列出／建立 benchmark suite；只允許 accepted、未 stale 的題目。 |
| `GET` | `/api/benchmark/suites/{id}` | 讀取 suite、題目清單與凍結版本。 |
| `GET` | `/api/benchmark/suites/{id}/latest-answers` | 讀取 suite 各題最近一次 benchmark 答案。 |
| `PATCH` / `DELETE` | `/api/benchmark/suites/{id}` | 更新題目清單、凍結版本或 soft delete suite。 |
| `DELETE` | `/api/benchmark/suites/{id}/items/{item_id}` | 從 suite 移除單一題目。 |
| `GET` | `/api/benchmark/models` | 回傳經過 chat 能力過濾的 benchmark 模型清單與 active index 版本。 |
| `GET` | `/api/llm/models` | 讀取目前 provider 的 llama-server 模型與已記錄的 chat 能力（不重新探測）。 |
| `POST` | `/api/llm/models/test` | 執行 LLM 服務測試；只探測尚未記錄的新模型並寫入 `ollama_model_capabilities`。 |
| `POST` | `/api/llm/model` | 切換 RAG 使用的 chat model；可帶 `host_id` 指定 `主機:模型`，並持久化為 LLM override（不影響 embedding 主機優先順序）。 |
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
| `GET` | `/api/updates/status` | 回傳法規／命令／判決的 current 線上檢查狀態、`update_count` 與 `any_update`。 |
| `POST` | `/api/updates/check` | 檢查法規、命令、判決三類線上資料並寫入更新紀錄；body 可帶 `{"source_types": ["law"]}` 只檢查指定來源；`up.sh` 啟動後會呼叫。 |
| `GET` | `/api/processing` | 資料處理快照：`file_timelines`（法規／命令／判決三張年份×月份時間表，每格四階段狀態與 summary）、處理 summary、branch 流程、workflow catalog 與最近執行、逐檔壓縮檔狀態、階段耗時堆疊、`index_versions` 的 `index_runtime`（llama-server 測試／選用主機、索引月份檔案進度、目前 JID）、外部程序偵測、更新能力與注意事項。 |
| `GET` | `/api/processing/active` | 只讀 processing state 的目前 import archive／月份／階段；供需要一次性查詢的用戶端使用。 |
| `GET` | `/api/processing/active/stream` | 相容用 SSE，推送目前 import archive／月份／階段；`#/processing` 已改由 `/api/events/stream` 的 `processing` topic 單一來源取得，不再使用此流。 |
| `GET` | `/api/events/stream?topic=...` | 全站通用 SSE refresh stream，`topic` 可用逗號合併 `processing`、`judgment-download`、`test-runs`、`benchmark`、`updates`、`status`、`system-usage`、`ollama`、`court-check`、`law-version-check`。後端在 state／manifest／progress 檔或 DB 資料變更時推送 `refresh` event，外部服務狀態類 topic 由後端每 30–60 秒主動推送；前端不再以固定 timer 輪詢資料。遠端連線需先以管理權杖取得短效 ticket。 |
| `POST` | `/api/auth/sse-ticket` | 以 `X-Judgment-Admin-Token` 取得 120 秒 SSE ticket；僅供遠端 SSE 連線使用，ticket 會出現在 EventSource URL 但不含長期權杖。 |
| `GET` | `/api/processing/plan` | 更新前檢查結果：未處理壓縮檔、索引待補筆數與建議步驟；不會啟動任何程序。 |
| `GET` | `/api/courts/check` | 唯讀檢查各月份法院名稱正規化覆蓋率：總筆數、已檢查、未檢查、無效值、需正規化筆數與有效比例。 |
| `GET` | `/api/law-versions/check` | 唯讀檢查各月份法規／命令版本與條文歷史狀態：版本數、已建立／未建立版本、需建立／可建立／缺原始檔版本、條文列與預期條文數。 |
| `POST` | `/api/processing/update` | 啟動可中斷續跑的資料更新；body 為 `{"index": false}`。已在執行中，或外部法規／命令下載、判決匯入、資料更新程序佔用時回傳 409。 |
| `POST` | `/api/processing/workflows/{workflow_id}/run` | 啟動白名單中的單一工作流程。白名單共 9 個，包含法規下載、命令下載、法規／命令索引、判決下載、判決匯入、判決 Parquet 匯出、Qdrant判決向量索引版本建置、法院名稱正規化、建立條文歷史。完整資料更新請使用 `POST /api/processing/update` 並帶 `{"index": true}` 以在完成後接續索引。同一時間僅允許一個處理程序，衝突或外部程序佔用時回傳 409。 |
| `POST` | `/api/processing/stop` | 對由 Web 啟動的資料更新或工作流程送出 SIGINT；外部程序不會被強制停止。 |
| `GET` | `/api/judgment-download/status` | 回傳司法院判決下載的月份狀態、統計、manifest 資訊、待補齊／驗證進度與目前執行中的下載進度。 |
| `GET` | `/api/judgment-download/files/{fileset_id}` | 以 Bearer Token 代理下載指定 fileset；預設非 API 時段也可使用，一次僅處理一個下載。 |
| `GET` | `/api/versioning/summary` | 版本備份摘要：snapshot、current 判決、歷史版本、change events 與最新 event id。 |
| `GET` | `/api/versioning/judgments/snapshots` | 依月份列出判決 snapshot、archive hash、raw/delta Parquet 與 current 狀態。 |
| `GET` | `/api/versioning/judgments/changes` | 列出 added/modified/removed/restored audit events，可用 `since_id` 增量查詢。 |
| `GET` | `/api/versioning/judgments/{jid}` | 回傳指定 JID 的 current、歷史版本與 change events。 |
| `GET` | `/api/versioning/judgments/versions/{version_id}` | 回傳指定歷史版本的完整全文與 metadata。 |
| `GET` | `/api/versioning/judgments/{jid}/vectors` | 列出該 JID 在各 Qdrant 索引版本的向量 metadata。 |
| `GET` | `/api/versioning/judgments/{jid}/vectors/{version_id}` | 從 Qdrant history collection 取回指定舊版向量與 payload。 |
| `GET` | `/api/versioning/parquet/deltas` | 列出 raw Parquet delta manifests。 |
| `GET` | `/api/versioning/parquet/changes` | 回傳指定月份的 raw delta rows（含舊 raw JSON）。 |
| `GET` | `/api/versioning/audit` | 供 IndexedDB 增量同步的 events、snapshots、deltas 與 `latest_event_id`。 |
| `POST` | `/api/rag/query` | 以 Qdrant 檢索判決並由 LLM 產生有引用編號的回答；問題上限 500 字，服務未就緒時降級。 |
| `POST` | `/api/rag/query/stream` | 與 `/api/rag/query` 相同，但以 SSE 逐段回傳 `step`、`partial`、`token`、`token_reset`、`result`、`error`；RAG 頁用來即時顯示後端處理流程、先顯示法規結果，再逐 token 顯示 LLM 回答。 |
| `POST` | `/api/rag/share` | 將目前 RAG 對話（最多 30 輪、1 MB）寫入 `rag_share_snapshots`，回傳 `id` 與 7 天後到期的 `expires_at`。 |
| `GET` | `/api/rag/share/{share_id}` | 依分享 token 讀取對話快照；過期或不存在時回 404，回應使用 `Cache-Control: no-store`。 |
| `GET` | `/api/docs` | Swagger UI 互動式 API 文件。 |
| `GET` | `/api/openapi.json` | OpenAPI schema。 |

`POST /api/query` 的 request body 範例：

```json
{
  "database": "postgres",
  "filters": {"table": "law_documents", "keywords": ["銀行", "金融法規"], "is_current": true},
  "page": 1,
  "page_size": 25
}
```

`keywords` 可傳多個字串，後端會在法規／判決的搜尋欄位上以 AND 套用；`keyword` 仍保留單一關鍵字用法。`database` 可為 `postgres`、`parquet`、`qdrant`、`indexeddb`；`page_size` 上限 200。所有查詢皆為唯讀，不會修改 PostgreSQL 或 Parquet。

### 資料處理頁與資料更新

`#/processing` 會讀取 `.run/processing_state.db`（SQLite WAL，可用 `JUDGMENT_PROCESSING_STATE` 覆寫），並同時查詢 PostgreSQL、Qdrant 與本機 `.rar`，因此畫面只顯示可驗證的數值；舊 `.run/processing_state.json` 會自動遷移為 `.json.migrated`。Phase 1 低延遲事件通道已啟用：importer 子程序在 archive／月份／階段變更時，透過 Unix domain socket 立即發布 progress event；web server 接收後寫入 `.run/processing_events.jsonl` journal，並以 SSE `progress` event 立即推送。state 仍保留作 resume、stop、稽核與重啟恢復的 checkpoint，但即時進度不再依賴 web server 讀取 state：

- **判決金融覆蓋統計**：首頁「重要數據」、資料庫分頁與處理總覽會以相同 summary 卡片順序顯示「判決總件數」、「金融相關總件數」與「JUDGMENT COVERAGE · 金融案件佔比」，比例卡片下方註明「金融相關判決占全部已備份判決的比例。」。判決總件數取自最新判決原始 Parquet manifest 的 `row_count` 加總；金融相關總件數取自 PostgreSQL `judgment_documents` 的 current 筆數；佔比為兩者相除。首頁使用 `/api/home`，資料庫分頁使用 `/api/judgment-stats`／catalog 的 `judgment_stats`，處理總覽使用 processing snapshot 的 `judgment_stats`；三處皆由後端同一套 `judgment_stats_from_counts` 定義提供，資料不足時顯示 `—`。
- **處理總覽時間表**：分為「法規」「命令」「判決」三張 `import-files-card`，並與索引檔案時間表使用相同幾何（2×3 指標、summary row、`index-current-row`、可水平捲動表格）。每格四個 `index-month-block` 依序為下載／Parquet／PostgreSQL／Qdrant，固定使用綠色／粉色／藍色／橘色；完成階段為實心方塊、未完成為同色 25% 淺色、Qdrant 已處理但未完成以完成色進度條表示、alias 切換後轉為實心橘色、執行中為與已處理相同的完成色垂直進度條、無資料為淡色空心框，不再顯示灰色「處理中」方塊；SSE `index_runtime` 更新時目前處理月份會立即移動到新月份，前一月份轉為已處理淡橙色。法規／命令以來源版本月份（`update_date`）顯示，目前列與 tooltip 顯示 `version_code`；舊來源版本的 Qdrant 階段顯示淡色空心方塊與「已取代」，不列為未完成，只有最新 current 版本需要 Qdrant 索引。判決以 manifest／本機檔／DB 的 369 個月顯示，四個階段分別由本機 `.rar`、raw Parquet manifest、PostgreSQL `issue_month`、Qdrant 月份覆蓋率判定；目前匯入 archive 的執行中階段會以完成色垂直進度條標示。未完成階段可點選，會切換到對應 workflow 面板（下載→該來源下載、Parquet／PostgreSQL→下載或判決匯入、Qdrant→法規索引或 Qdrant判決向量索引版本建置），只切換面板、不會自動啟動流程。判決時間表標頭另顯示 Embedding 與 Rerank 使用的主機與模型（例如 `x570 bge-m3:latest`、`x570 bge-reranker-v2-m3`），滑鼠移入可查看端點。後端以 SSE `/api/events/stream` 的 `processing` topic 作為唯一即時進度來源：初次連線推送完整 snapshot，後續推送由 processing state 直接組成的 live payload（`active_import`、workflow 階段訊息／進度、import timeline 月份更新）；前端只套用 payload 並就地更新 DOM，不再 GET `/api/processing` 取得進度，也不重建時間表或重設捲動位置；沒有固定前端 polling timer。
- **NUL 位元組清理**：判決全文、標題、法院、引用與其他 metadata 寫入 PostgreSQL 前會移除 NUL（0x00）位元組；PostgreSQL text／JSONB 不接受 NUL，未清理會造成整個匯入 batch 失敗。原始 Parquet 與 `raw_json` 仍保留原始內容，不影響備份。
- **原始備份**：判決壓縮檔會先將每個 JSON 物件以原始文字寫入暫存 Parquet，再以 pyarrow `ZSTD level 3` 輸出該月份的 `JUDGMENT_DATA_DIR/parquet/raw_judgments/.../raw.parquet`；`raw_json` 保留未修改的原始文字，另外附加案號、法院、案由、裁判日期、命中法規與引用等查詢欄位。這個階段在金融法規篩選之前完成，且每個月份只保留一份最終 raw Parquet。法規／命令則在解析前寫入 `LAW_DATA_DIR/raw_parquet/.../laws.parquet`，原始 ZIP 仍保留在 `raw/`。
  - 2026-11-08 已補建既有 24 個判決 RAR：2,485,151 筆原始 JSON，Parquet 約 6.2 GB；既有法規／命令也補建原始 Parquet（法規 1,351、命令 10,454）。
- **整體時間**：以各階段實際耗時比例組成堆疊長條，而非用筆數推估。
- **外部程序**：後端以 `ps` 偵測直接在 terminal 啟動的 `judgment-index-vectors`、`judgment-index-legal-articles`、`judgment-import-judgments`、`judgment-law-download` 與 `judgment.processing_update`。這些程序若沒有寫入狀態檔，只會標示「外部程序」與可驗證的整體覆蓋率；不會替它們產生假的逐階段百分比。外部法規／命令下載、判決匯入或資料更新執行中時，各 workflow 的執行按鈕會停用，避免重疊處理。
- **工作流程 sidebar**：左側列出「處理總覽」與 9 個白名單流程（法規下載、命令下載、法規／命令索引、判決下載、判決匯入、判決 Parquet 匯出、Qdrant判決向量索引版本建置、法院名稱正規化、建立條文歷史）。完整資料更新由 CLI／API／排程腳本執行；sidebar 只列出可獨立操作的階段 workflow。右側面板顯示該流程使用的 Python 程式、Shell／入口腳本與實際命令，並提供「執行此流程」按鈕；按下後會同步停用並顯示「執行中／啟動中」，不等待版本檢查或啟動 API 回應；版本檢查、啟動期間與後端 snapshot 確認新 run 後都維持停用，SSE 重繪不會讓按鈕恢復可按，只有啟動失敗或 run 結束才恢復。「法規／命令索引」與「Qdrant判決向量索引版本建置」的「更新」按鈕另依偵測結果鎖定：索引 stale／not_indexed 或有待補月份時才能點選，否則停用並顯示「目前未偵測到可重建的索引內容。」。法規下載、命令下載與判決下載的成功終態統一顯示「完成」badge；`success` 表示有變更並套用、`no_change` 表示檢查後內容相同，兩者不顯示成不同完成標籤，是否變更由執行訊息區分。按下後會立即出現「中止執行」按鈕，並保留目前的「流程進度」表與目前處理月份，不會清空、移除或閃退；新 run 的 snapshot 抵達後才替換為新進度。法院名稱檢查等輔助表格載入完成後會立即重繪，不依賴下一次 SSE。結果寫入共用狀態檔，面板顯示最近一次 run 的狀態、開始時間、耗時、訊息與日誌路徑。
- **流程進度**：每個 workflow 面板依實際狀態檔顯示與 RAG／索引 Pipeline 相同規格的 waterfall；標頭以 2×3 指標顯示完成階段、執行中、等待、略過、總耗時與整體進度；階段依執行順序由左至右接續排列，已完成階段填滿階段色，執行中或未完成階段只著色已完成比例，其餘未完成區段為同色 25% 淺色，等待階段保留 25% 淺色軌道、略過階段不繪製 bar，極短階段保留最小可見寬度；axis、可展開明細、hover 資訊卡與 390px 行為沿用 `pipeline-waterfall.md`。以下為各階段狀態、筆數／bytes、耗時與訊息；判決匯入會先建立處理狀態 run 與逐檔清單，再逐檔檢查可沿用的 Parquet 備份與解壓縮，不會先掃描全部壓縮檔大小而延後狀態顯示；stage 訊息與月份時間表會立即標示目前處理的 archive／月份；RAR 檢查與 raw Parquet 階段會顯示目前檢查的 `.rar` 檔名與 `N/M` 進度。原始資料階段缺少可用 Parquet 時會明確顯示「建立 YYYY-MM 原始 Parquet 備份」，完成後顯示「已建立 YYYY-MM 原始 Parquet 備份」；可沿用時顯示「沿用 YYYY-MM 既有原始 Parquet、未重新備份」。金融法規篩選與 PostgreSQL 階段會顯示目前處理的 `YYYY-MM` 與 archive，例如「目前篩選 2026-01（202601.rar，1/2）」。篩選階段重新走訪較早 archive 時，時間表外框仍維持最高已啟動且未完成的月份，目前列另顯示「處理中 YYYY-MM archive」，且不會把外框月份的階段 cell 標成灰色。若金融法規清單 SHA 與先前 run 相同且 raw Parquet 仍可沿用，會跳過先前 run 已完成（filter／postgres 均成功）的 archive，從最新中斷或未完成的 archive 接續；中斷／失敗的 archive 會重新處理，不會從第一個 archive 重跑已完成月份。接續判斷只使用先前 state 與 PostgreSQL snapshot，不會逐檔重新檢查已完成 archive；RAR 檢查階段只處理實際需要解壓縮或沿用的未完成 archive。重新執行時會先一次掃描 raw Parquet manifest，批次比對 archive 路徑、大小與 mtime；相符的月份直接標記 extract skipped／raw_parquet success 並排除 extraction 排程，不再逐檔重讀 manifest 或重複更新 state。若判決下載替換了 archive（路徑、大小或 mtime 改變），舊 manifest 即不再相符，該月份會重新解壓縮並建立新備份；舊備份依混合版本備份政策保留。「RAR 檢查／解壓縮」「原始資料檢查／Parquet 備份」「金融法規篩選」「PostgreSQL metadata」在最終總筆數未知時，會以已完成／執行中的壓縮檔數推算實際百分比；可沿用原始 Parquet 的壓縮檔會標示「沿用、略過解壓縮」，不算重新解壓縮（例如 `157 / 344` → `45.6%`），且本次 run 重新檢查時 RAR 與原始資料階段會維持綠色，不會因短暫確認而轉紅或轉灰；只有缺少或無法沿用、需要重建備份時才顯示處理中。不顯示動畫或閃爍的不確定進度條。失敗階段的「失敗」狀態可展開查看失敗原因與建議解法；原因取自 run 錯誤訊息並移除 SQL 參數與 traceback，解法依錯誤類型提供（例如 NUL 位元組→重新執行、連線失敗→檢查服務）。滑鼠移到任一階段或 bar 時，會顯示階段名稱、進度、整體占比、耗時與訊息。法規／命令流程的實際階段為「線上版本比對／下載更新 → 原始 Parquet → 解析 → PostgreSQL → 法規／命令索引」；下載後若 raw JSON／語意內容未變更，會略過解析與 PostgreSQL，索引階段再以 `--if-changed` 判斷是否重建。判決下載只下載 RAR，匯入與向量索引需另執行對應流程或完整資料更新。
- **法規／命令索引版本時間表**：「法規／命令索引」workflow 面板顯示法規與命令兩張版本月份表，並與處理總覽使用相同的 2×3 metrics、目前版本列、legend 與月份格幾何。每格以三個 `index-month-block` 由左至右表示 D 下載版本（綠）、P raw Parquet 與 PostgreSQL 就緒（粉）、I active 法規／命令索引覆蓋（藍）；完成為實心方塊，未完成為同色 25% 淺色，執行中為與已處理相同的完成色垂直進度條，已取代／無資料為淡色空心方塊。metrics 顯示完成月份、未完成月份、已取代月份、總月份、完成率與完成階段；舊版本在 I 顯示「已取代」，不列為未完成；tooltip 顯示版本編號、下載時間、法規數與條文數。資料沿用既有 `file_timelines`，不另建版本表。「法規下載」「命令下載」workflow 面板也分別顯示同格式的「法規 下載時間表」與「命令 下載時間表」，重用同一 law／order D／P／I timeline 資料。
- **法院名稱檢查**：法院名稱正規化分頁提供「檢查法院名稱」，呼叫 `/api/courts/check` 後以年份×月份表格顯示：綠色全部已正規化、紅色需正規化（含完全未檢查、部分未正規化或無效值）；summary 只顯示已檢查與需正規化月份數，下方明細與 tooltip 仍保留總筆數、已檢查、未檢查、無效值與有效比例。進入分頁會自動檢查，也可手動重新檢查。`#/processing` sidebar 的「法院名稱正規化」會在 `court_normalized = ''` 的 current 判決大於 0 時顯示待更新數字 badge，tooltip 為「可正規化判決 N 筆」；workflow 執行中或數量歸零後改回一般狀態。
- **條文歷史狀態檢查**：建立條文歷史分頁最上方提供「檢查條文歷史／檢查是否需建立」，呼叫 `/api/law-versions/check` 後以年份×月份表格顯示：綠色該月所有版本都有歷史條文、紅色完全未建立、灰色部分版本已建立；目前版本以靜態外框標示。tooltip 顯示法規／命令版本數、版本 ID、已建立／未建立版本與條文列／預期條文數。下方另列出需建立歷史的版本，區分「可建立（找到原始 Parquet）」與「缺原始檔（無法建立）」，避免直接執行長時間流程才發現缺少快照。
- **判決匯入面板**：顯示與處理總覽相同格式的「年份列 × 月份欄」四階段時間表，依 `download_manifest.json` 目前 369 個月、本機 `.rar`、PostgreSQL `source_archive` 與目前 import run 的 archive 狀態判定。標頭使用 `side-card-head index-runtime-head` 與 2×3 指標顯示完成月份、未完成月份、有更新月份、總月份、完成率與完成階段；目前匯入列使用 `index-current-row`，並提供階段顏色與狀態兩組 legend。每個月份 cell 保持中性底色，內含四個 `index-month-block`，依序為 RAR 檢查／解壓縮（橘）、原始資料檢查／Parquet 備份（粉）、金融法規篩選（紫）、PostgreSQL metadata（藍）；完成為實心方塊，尚未完成為同色 25% 淺色，本次處理中為完成色垂直進度條，無資料為淡色空心方塊，不再使用整格綠／紅／灰底色。先前已匯入的月份在本次 run 尚未重跑前維持實心方塊；輪到它時依階段顯示進度條，完成後轉回實心。可沿用原始 Parquet 的 archive 會在 RAR 與原始資料階段維持完成實心方塊，並標示「沿用、略過解壓縮」，不會重新解壓縮；即使本次 run 重新確認備份，前兩格也不會變回 25% 淺色或進度條。缺少或無法沿用備份時，原始資料階段才會顯示「建立 YYYY-MM 原始 Parquet 備份」，完成後顯示「已建立 YYYY-MM 原始 Parquet 備份」。篩選與 PostgreSQL 階段的訊息會顯示目前處理的月份與 archive；金融法規篩選訊息列右側會顯示「金融案件{累計數} / 全部案件{本次累計已處理原始判決數} 金融佔比{整數百分比}%」，例如「金融案件4,714,967 / 全部案件22,881,015 金融佔比20.6%」，並由 SSE 即時更新；「金融佔比」與所有數字以 strong 顯示。階段訊息只顯示「已處理 current/total 筆候選。」，不再附加「命中 N 筆」。PostgreSQL metadata 階段的筆數顯示改為「總計 N 筆」，不再顯示「已寫入 current / total 筆」。建立版本快照／DuckDB 候選統計的準備階段只更新階段訊息，不會逐檔移動月份圈選，只有實際進入 filter／postgres 的 archive 才逐月顯示目前月份與處理中進度條。metrics 顯示完成月份、未完成月份（含處理中）、有更新月份、總月份、完成率與完成階段；目前匯入月份以實線外框與 `aria-current` 標示；實際處理中的月份另以虛線外框標示（篩選重新走訪較舊 archive 時可能與外框月份不同），目前階段以完成色垂直進度條表示，目前列標示外框月份、archive 與階段名稱。當篩選階段重新處理較早月份時，外框維持最高已啟動且未完成的月份，目前列另顯示「處理中 YYYY-MM archive」；只有實際處理中的階段 block 顯示進度條，外框月份的 block 不會被誤標為處理中。未完成階段可點選回到判決匯入流程，不會自動啟動流程；方格、階段訊息、目前匯入外框與 processing month 由兩層 SSE 更新：importer 先透過 Unix socket 發送 `progress` event，web server 立即轉發，前端第一時間套用；processing topic 的 0.5 秒 live payload 依 state checkpoint 作 reconciliation，補齊 workflow progress 與 timeline month updates。前端不再另開 active stream，也不重新 GET snapshot。初次連線仍由同一 topic 推送完整 snapshot 作為頁面初始資料。判決下載月份表的 `.rar` 狀態、manifest 與下載進度也由 `judgment-download` topic 推送，不再由前端輪詢。滑鼠移到月份可查看四階段狀態、本機壓縮檔與已匯入檔名。
- **低延遲處理事件（Phase 4 本機）**：importer 子程序在 run／archive／filter／postgres 狀態變更時，透過本機 Unix domain socket 立即發布 `progress` event；web server 接收後寫入 SQLite WAL event journal（`.run/processing_events.db`），並以 SSE `event: progress` 立即 fan-out。Socket 無法連線時 importer 會 fallback 直接寫 journal，lifecycle event 不會因 web server 離線遺失；`(run_id, seq)` 具唯一約束，重送不會重複。每個 event 有持久化 `event_id` 與 SSE `id:`；瀏覽器重連時以 `Last-Event-ID` 只補送缺少事件，若超出 journal 保留範圍才改送完整 snapshot。多個同機 web instance 共用 journal tailer，各自 fan-out 且去重。Processing state checkpoint 也改為 SQLite WAL per-run rows（`.run/processing_state.db`），只更新有變更的 run；舊 JSON 自動遷移。前端以 requestAnimationFrame 批次套用 event，直接更新階段訊息、目前月份與時間表，不查詢 `/api/processing`；0.5 秒的 processing live payload 僅作 checkpoint reconciliation。State 仍保留作 resume、stop、稽核與重啟恢復。Event latency／append error／tail error／subscriber 數可從 `/api/processing/events/status` 查看。Socket／journal／保留筆數可用 `JUDGMENT_EVENT_SOCKET`／`JUDGMENT_EVENT_JOURNAL`／`JUDGMENT_EVENT_RETENTION` 覆寫；Phase 1 JSONL 會自動遷移為 `.migrated`。完整規格見 [`specs/008-realtime-event-stream/spec.md`](specs/008-realtime-event-stream/spec.md)。
- **Qdrant 索引面板**：Qdrant判決向量索引版本建置開始前會測試主要／備援 llama-server 的 `/v1/models`、`/health` 與 embedding 模型，記錄每台主機的 URL、host、port、可用模型、最後選用主機與執行中實際使用主機。主機／模型只在「Embedding 主機／模型」compact chip strip 顯示一次：每個 chip 顯示 `host:model`，選用主機為實心「使用中」，其他可用主機為淡色；索引 runtime 卡片不再重複顯示第二份主機測試 strip。x570 llama-server 為 primary，MBP llama-server 為 fallback，不再顯示已停用的 11434 連線。流程進度卡以與 RAG Pipeline 相同規格的 waterfall 顯示 llama-server 測試、建立／接續 Blue-Green 版本、複製可重用向量、金融判決向量索引、驗證與切換 alias，包含時間軸、上一階段結束即下一階段開始的接續階段 bar、可展開明細與 hover 資訊卡；已完成階段整條著色，進行中或未完成階段只著色已完成比例，其餘未完成區段以同色 25% 淺色呈現；極短階段以最小可見寬度顯示，避免與相鄰階段重疊；執行中的金融索引階段以目前時間延伸，等待階段保留 25% 淺色軌道、略過階段不繪製 bar，SSE 更新後已展開的階段會保持展開。複製向量與金融索引筆數分開顯示，金融索引固定以 `indexed / expected_count`（例如 `0 / 4,714,967 筆`）表示，不會把舊 collection points 當成金融判決總數。複製期間會先標示第一個待索引月份為「準備索引」，第一批開始後切換為實際目前月份。目前處理列在月份與 archive 後顯示本批 R／E chip：全部沿用顯示「R 沿用 N 筆」，含新 embedding 顯示「E 新 embedding N 筆」，混合批次兩者都顯示；正在計算 embedding 時顯示「E 計算中 N 筆」，累計重用與新 embedding 仍顯示在上方 summary。`index_runtime.current` 會提供 `reused`、`embedded` 與 `phase`，讓 SSE 更新時可立即看出目前批次是在 R 或 E。新索引版本依 `issue_month` 由舊到新掃描，同一月份再依 `JudgmentDocument.id`；舊 in-flight run 仍可能顯示 ID 順序。綠框只標示目前批次所在月份。索引檔案時間表在標題列右側以 2×3 指標表格顯示六個同格式欄位：第一列為「已處理月份」、「已處理筆數」與「本次平均」，第二列為 `Elapsed Time`、`Estimated Total` 與 `Time Remaining`。「已處理月份」以 `processed >= total` 的完整月份計算，目前處理中的月份不列入，總月份為索引範圍內唯一有效的 `YYYYMM` 月份數；筆數欄位顯示「已索引 / 總筆數」。「本次平均 N.N 筆/秒」若頁面在執行中途才載入，以首次觀察到的時間與筆數為基準，計算 `(最新筆數 - 基準筆數) ÷ (目前時間 - 基準時間)`；已結束或失效時使用 `finished_at`／`updated_at`，首次載入即已完成則使用完整 `started_at` 至 `finished_at` 與全部筆數。此數值是從本次頁面觀察起算的累計平均；索引後段若只剩新 embedding，速度會比一開始重用階段明顯下降。`Elapsed Time` 從本次 run 的 `started_at` 起算（執行中到目前、結束後到 `finished_at`）；`Time Remaining` 以「總筆數 − 目前已索引筆數」的剩餘件數除以本次平均速度估算；`Estimated Total` 為 Elapsed 加 Time Remaining。中途停止後重新執行時，會使用新 run 的 `started_at` 重新計時，並只以剩餘件數估算，不會沿用停止前的時間或已完成件數。缺少開始時間、總筆數或可用速度時顯示「—」，完成時剩餘時間為 `0s`；390px 會自動換行且無水平溢出。新版本建置期間，A 以 active collection 覆蓋顯示；latest archive 無 E backlog 的未變更月份，R／E 以 active 覆蓋顯示實心；仍有 E backlog 的月份，R／E 使用本次 run 進度，尚未處理時維持 25% 淺色，處理完成後才轉為實心。月份 tooltip 會同時列出新版本進度與 active 覆蓋。索引月份 cell 進一步拆成 A／R／E 三格：A 為 active 覆蓋、R 為重用向量、E 為新 embedding，各格以填充高度表示該月比例，並提供圖例。summary 顯示 A 基線、R 完成／未完成、E 完成／未完成，不再顯示泛用「待索引」；A 基線是上一個正式版本的既有覆蓋，不列入新版本完成數。R 以較舊的基線 archive 判斷，E 以名稱中更新日期最新的 archive 判斷；同一月份只有一個 archive 時，該 archive 同時作為基線與 latest。build mode 只在 latest archive 無 E backlog 時以 active 覆蓋顯示未變更月份；有 E backlog 的月份使用本次 run 進度。summary 的 R／E 與時間表方塊一致。sidebar 的 E 待補 badge 與 summary E 未完成一致。summary 以中性文字顯示 A／R／E 數量，不再使用整排彩色 badge；每個 A／R／E 分格都有明確完成／未完成／無資料狀態，未完成才以該組顏色的 25% 淺色加外框表示，完成為實心，無資料為淡色空心。索引期間會顯示與判決匯入相同幾何的「年份列 × 月份欄」時間表：每格使用中性底色，內含 A／R／E 三個分格；完成為實心、未完成為 25% 淺色、執行中為完成色進度條，不再使用整格綠／紅／灰底色。目前索引月份只以實線 border／outline 標示，padding 不使用狀態底色，也不使用脈動陰影；進度只顯示在 A／R／E 小格內，tooltip 顯示目前百分比，未完成的 R／E 小格顯示局部完成比例與 25% 淺色，尚未處理的 archive／月份維持 25% 淺色。版本續跑時會從上一個 run 的 runtime 恢復已完成月份的 R／E 計數，不會因 resume 把已完成的 A／R／E 顯示成空白。滑鼠移到月份可查看來源檔案、active 覆蓋、A／R 基線、E 進度、重用、新 embedding 與目前案號。若尚無本次索引 run，會以 active collection 的實際月份覆蓋率顯示同一張表（每 60 秒快取）。coverage-only 時同一月份可能有多個 archive；A／R 以較舊的基線 archive 計算，E 以名稱中更新日期最新的 archive 計算，不可把新舊 archive 的 total／processed 相加，否則已完成月份會被誤判為未完成。面板另顯示 Qdrant 的 Docker context、container、image、容器內 `/qdrant/storage`、volume 名稱、volume 容量、host 實際來源路徑、collection／points／segments；資料由 `/api/system-usage` 取得並可手動重新整理。索引版本建置的 archive 選擇、A／R／E 判斷與「月份 vs RAR 檔數」規則見 [`specs/009-judgment-vector-index/spec.md`](specs/009-judgment-vector-index/spec.md)；llama-server 端點、主機優先順序、全站命名與 host strip 顯示契約見 [`specs/010-llama-server-runtime/spec.md`](specs/010-llama-server-runtime/spec.md)。E 待補月份（active 覆蓋 backlog）會同步顯示在 workflow 側邊清單、Qdrant workflow 面板的更新提示與「更新」按鈕，以及全站「資料處理」導覽 badge；`/api/updates/status` 的 `index_pending_count` 與 processing snapshot 的 `capabilities.index_pending_months` 使用相同月份數，讓 sidebar 不必每次查詢 Qdrant。
- **下載前版本確認**：法規下載、命令下載與判決下載按「執行此流程」時，會先以 `POST /api/updates/check` 只檢查該來源。若線上檢查為 `up_to_date`，顯示「已是最新版本，仍要強制重新下載？」確認；取消即不啟動，確認後才重新下載並依 SHA／UpdateDate 再比對。檢查失敗時顯示警告，但允許直接執行下載。
- **判決下載**：使用 `.env` 的 `OPENDATA_JUDICIAL_GOV_TW_ACCOUNT`／`OPENDATA_JUDICIAL_GOV_TW_PASSWORD` 取得 Token，讀取司法院裁判書分類（預設 `051`）的 resources，下載到 `JUDGMENT_DATA_DIR/raw_rar`。預設任何時段都可執行（`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`），預設最多 **6 個月份檔案並行**（`JUDGMENT_DOWNLOAD_CONCURRENCY=6`），任一下載完成後才補上下一筆；設為 `false` 時僅在 Asia/Taipei 00:00–06:00 執行，且為估算時段截止會維持循序下載。流程優先處理「待補齊」月份（缺少或舊版，依月份由舊到新）；待補齊清單、續傳月份／fileset 與上次停止原因會寫入 manifest 的 `backfill` 區塊，因此中斷後下一次只會續傳剩下月份，不會先重驗已完成的綠色月份。待補齊清單清空後，才由最舊月份往最新月份驗證綠色月份是否有遠端內容變更；驗證游標同樣持久化，當日已完成驗證會跳過重複驗證。以 HEAD（若 405 則 GET stream 只讀 headers）比對 `Content-Length`／`Last-Modified`／`ETag`，未變更檔案不重新下載；有更新時下載到 `.part`，驗證後原子取代；同月份舊檔預設移到 `raw_rar/history/`（`JUDGMENT_RAW_RAR_KEEP_VERSIONS=false` 才刪除），manifest 以 `history_files` 保留舊檔 metadata。下載中斷時保留 `.part` 與 validator sidecar；伺服器支援時以 HTTP Range／If-Range 續傳，validator 改變或回 200 時從零重新下載（目前官方端點忽略 Range，會回 200，因此實際會重新下載）。每個檔案的下載錯誤會隔離並重試，失敗月份留在待補齊清單，不會中止其他月份；嚴格時段模式（`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false`）下，接近 06:00 時會依近期吞吐量估算，不再開始無法在時段內完成的檔案。月份範圍由 resources 動態決定（本次資料快照為 1996-01 到 2026-09，共 369 個月；月份數會隨官方資料變動）；任何非 `YYYYMM` 命名或非 rar/7z/zip 的 fileset（例如 `Delete-Infor.csv`）都會被視為非判決壓縮檔並停止往後探測。`raw_rar/download_manifest.json` 記錄 `files`（以 fileset ID 為鍵）、validators、SHA-256、baseline、`months` 月份狀態與 `backfill` 續傳／驗證進度。執行中的暫存進度寫在 `raw_rar/download_progress.json`，狀態 API 會讀取並在程序結束或進度失效後清除。處理頁的判決下載面板會顯示動態月份表：綠色最新版、灰色舊版、紅色缺失；表格上方顯示待補齊月份數、續傳起點、驗證狀態與上次停止原因。表格的「重新整理」會重新掃描 `raw_rar`，手動放入的檔案也會立即反映；滑鼠移到月份會出現下載圖示，點擊後由後端帶 Token proxy 下載該月份 fileset；預設非 API 時段也可用，且 proxy 一次只允許一個下載。執行中會在月份表標示目前檢查／下載的月份，並在執行按鈕下方顯示每個進行中月份的檔名、獨立進度條、百分比與已下載／總大小；下載開始前會先計算待補齊檔案的總大小，完成後再顯示整體月份進度、已下載／總量、已花時間、預估剩餘與預估總時間。快速檢查既有檔案可用 `judgment-download --incremental`；只更新月份狀態可用 `--refresh-status`；強制只在 00:00–06:00 下載可用 `--require-window`。
- **混合版本備份**：判決新版檔案出現時，系統建立不可變 `judgment_snapshots`，只把被修改/移除的舊內容寫入 `judgment_document_versions` 與 `judgment_change_events`；新增判決只留在 current `judgment_documents`，不重複占歷史空間。Raw Parquet 保留 current full snapshot，舊 raw 變更寫入 `parquet/raw_judgment_deltas/`，delta 驗證成功後才移除舊 full snapshot；`JUDGMENT_RAW_PARQUET_KEEP_VERSIONS=true` 可保留舊 full 版本。Qdrant 新索引版本會把 changed/removed 的舊向量寫入 `JUDGMENT_VECTOR_HISTORY_COLLECTION`，current 仍由 `judgments_current` alias 提供；舊完整 index collection 仍保留供 rollback，可用 `judgment-index-vectors --discard-version` 依保留政策清除。IndexedDB 新增 `audit_events` store，從 `/api/versioning/audit` 同步版本變更 metadata。一般查詢與 RAG 只使用 `is_current=true`；歷史全文、snapshot、delta 與 vector metadata 由 `/api/versioning/*` 查詢。完整資料模型與 acceptance criteria 見 [`specs/006-hybrid-backup-versioning/spec.md`](specs/006-hybrid-backup-versioning/spec.md)。
- **線上更新通知**：導覽列更新 badge 由 SSE `/api/events/stream` 的 `updates` topic 推送，DB 更新紀錄變更時立即更新，不再每 60 秒從前端查詢。`up.sh` 在後端就緒後呼叫 `POST /api/updates/check`，檢查法規、命令 ZIP headers 與判決 resources／本機月份狀態，結果寫入 `download_update_records`（同一來源保留一筆 current）。法規／命令以遠端 Content-Length 與本地 ZIP 大小快速判斷；長度相同但內容變更時，實際下載 workflow 仍會以 ZIP/JSON hash 與 UpdateDate 再確認。判決以待補齊月份數判斷。Header 的「資料處理」導覽右下角橘色 badge 會顯示所有待處理項目的加總：來源更新數、判決匯入待處理月份、Qdrant 判決向量索引待補月份與法規／命令索引待重建項目，tooltip 列出各類別數量；processing sidebar 的所有 workflow 在偵測到可更新內容且無執行中 run 時，右側會顯示 refresh icon 加可更新數量的橘色 numeric badge；法院名稱正規化顯示 PostgreSQL current 且 `court_normalized` 空值的筆數。判決更新 archive 是否已匯入以 `judgment_snapshots.source_archive` 為準，即使更新後判決內容未變、文件仍保留舊 `source_archive`，也不得重複顯示未匯入。可更新 notice 會標示偵測來源（線上來源或 PostgreSQL／本機）、偵測機制、檢查時間、訊息與數量，例如法規／命令為線上 ZIP Content-Length 與本機版本 ZIP 大小比對（Last-Modified／ETag 僅記錄供追蹤）、判決為司法院 resources／fileset 與本機 manifest 比對、法院正規化為 PostgreSQL 空值計數。每個 workflow 面板新增「執行紀錄」與「版本檢查紀錄」，並提供「檢查更新」按鈕；按鈕只檢查目前面板對應的來源，執行此流程前也會先做同來源檢查，`up_to_date` 時要求確認是否強制更新。法規／命令 ZIP 存到 `LAW_DATA_DIR/raw/{source}/{YYYYMMDD}/{原始檔名}`；同一天同檔名但內容不同時以 hash suffix 保留兩份。`JUDGMENT_SKIP_UPDATE_CHECK=1` 可略過啟動檢查。完整規格見 [`specs/007-update-notifications/spec.md`](specs/007-update-notifications/spec.md)。
- **執行與停止**：單一流程由 `judgment.workflow_runner` 在背景啟動，可執行命令只來自 `src/judgment/workflows.py` 白名單；完整更新 API 走 `ProcessingManager.start_update`，可用 `index:true` 接續索引。所有長流程共用「停止」與可續跑機制；已有 Web 或 terminal 程序執行時，按鈕停用或回傳 409，不會同時啟動第二個處理程序。判決下載 CLI 的結束碼為 `0` 完成、`3` 部分完成且可續傳（無檔案錯誤）、`1` 失敗、`2` 嚴格時段模式下不在 API 時段；`workflow_runner` 會把 `3` 記為「部分完成」而非「失敗」，處理頁以黃色標示並保留待補齊進度。

完整資料更新（`judgment.processing_update`）會依序：

1. 下載並比對線上法規與命令 ZIP（以 SHA-256 判斷是否變更）。
2. 掃描 `JUDGMENT_DATA_DIR` 與 `raw_rar/`，找出 PostgreSQL 尚未處理的 `.rar`。
3. 將未處理壓縮檔解壓縮為原始 Parquet 備份（同時補齊查詢欄位）。
4. 依金融法規清單篩選，將命中判決的 metadata 寫入 PostgreSQL。
5. 若以 `--index` 或 API `index:true` 執行，接續可中斷續跑的向量索引；預設不執行。

也可直接從 terminal 執行同一個流程：

```bash
uv run python -m judgment.processing_update          # 下載比對 + 原始 Parquet + 匯入
uv run python -m judgment.processing_update --index  # 完成後接續 Qdrant
```

更新程序與索引都支援 `Ctrl-C`；下次執行會重新掃描剩餘工作並接續。Web API 啟動的程序會把日誌寫到 `.run/processing_update_<timestamp>.log`。

### 本機電源控制器

header 右上角有齒輪「設定選項」，介面風格移至設定 sidebar；系統測試與 API 連線設定位於 `#/status` 的「系統測試」分類，或直接開啟 `#/tests`。後端電源仍由 `./up.sh`、`./down.sh` 或本機電源控制器管理。

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
| Qdrant | `law_articles`（法規條文向量）、`judgment_segments`（判決片段向量，預留） | collection、語意查詢、Top K、相似度門檻；collection 尚未建立或服務未設定時回傳明確狀態，不產生虛構結果 |
| IndexedDB | 瀏覽器內的 `query_history`、`settings` | object store、關鍵字；完全在瀏覽器端執行，不經過伺服器 |

**判決**

| 資料來源 | 可查詢對象 | 主要條件 |
| --- | --- | --- |
| PostgreSQL | `judgment_documents`、`judgment_import_runs` | 案號／法院／案由／命中法規關鍵字、法院（標準名稱）、命中法規／命令、裁判日期區間、匯入狀態；判決文件的案號、法院、案由、裁判日期、命中法規可點選表頭排序 |
| Parquet | 原始 `raw.parquet` | 案號／法院／案由／命中法規關鍵字、法院、裁判日期區間、引用數下限、回傳欄位與排序；結果可點選案號直接解析原始 JSON 取得原判決 |
| Qdrant | `judgment_documents`（文件級向量）、`judgment_segments`（預留） | 語意查詢、Top K、相似度門檻；以 llama-server `bge-m3` 將問題轉為向量後檢索，結果可點選案號開啟判決原文 |
| IndexedDB | 瀏覽器內的 `query_history`、`settings`、`audit_events` | 完全在瀏覽器端執行；`audit_events` 會從 `/api/versioning/audit` 增量同步版本變更 metadata |

判決除了 PostgreSQL 外，資料頁與 Schema 模式也提供原始 Parquet 查詢；查詢直接讀取 `raw.parquet` 的查詢欄位，不載入全文，點選案號會以 `source=parquet` 解析 `raw_json` 開啟原判決。判決的法院選項只包含正規化後的標準法院名稱；查詢結果與判決原文顯示標準名稱，API 另保留 `court_raw` 供追溯原始欄位。歷史判決不屬於一般 current 查詢，需使用 `/api/versioning/judgments/{jid}`、`/api/versioning/judgments/versions/{version_id}` 或 `/api/versioning/parquet/changes`。

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

查詢歷史與頁面設定會寫入瀏覽器 IndexedDB（資料庫名稱 `judgment-console`）：最多保留 120 筆查詢歷史，並記錄 `data.last_category`、`data.last_database.law`、`data.last_database.judgment`、`data.page_size` 與 `data.last_query`。版本 audit metadata 存在 `audit_events`（最多 2,000 筆），由 `/api/versioning/audit` 依 `since_id` 增量同步；不含完整判決全文。若瀏覽器停用 IndexedDB，系統會退回記憶體暫存，並在報表與側欄明確標示，重新整理後資料會消失。

### 效能報表（Flow）

header 的 `效能報表` 頁面會顯示 PostgreSQL `performance_records` 內的執行紀錄。資料查詢、法規明細、判決原文、RAG 問答（stream 端點由自身流程寫入）等經 instrument 的 API 請求會建立 Flow，記錄從收到前端命令到回傳結果、以及前端完成 render 的完整流程。`/api/performance`、`/api/processing`、`/api/quality`、`/api/question-bank`、`/api/benchmark`、`/api/test-*`、`/api/health`、docs 與 OPTIONS 不經 performance middleware；`/api/rag/query/stream` 由端點自行建立 Flow。

主要欄位：

- `process`：執行程序，例如「資料查詢」「RAG 問答」「法規明細」。
- `module`：進入點的模組或函式。
- `started_at` / `finished_at` / `duration_ms`：伺服器端執行 timestamp 與總耗時。
- `status`、`status_code`、`error_message`：成功、失敗與 HTTP 狀態。
- `request_id`：前後端共用的請求識別碼（回應標頭 `X-Judgment-Request-Id`）。
- `params`：請求層級的參數摘要。
- `flow.metadata`：RAG 請求會保存 `question`、`answer`、`rag_status`、`rag_response` 與 `test_run_id`。`rag_response` 包含最終狀態、引用數、Abstain、模型與總耗時；效能報表展開後會顯示「RAG 問題／RAG 答案」。
- `flow.segments`：每個 span 除 `offset_ms`、`duration_ms` 外，另有 `started_at`、`finished_at` 與 `end_offset_ms`，可正確呈現平行執行的重疊區間與實際開始／結束時間。
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
- `started_at`、`finished_at`、`offset_ms`、`end_offset_ms`、`duration_ms`：實際開始／結束時間、相對於 Flow 開始的位移與該段原始耗時。報表時間軸會顯示每個點位的開始時鐘時間（例如 `20:59:13.912`）。效能 Flow 與測試 Flow 以絕對時間定位；RAG Pipeline waterfall 為清楚呈現先後順序，依階段耗時接續排列，實際 offset 仍保留在展開明細與 hover 資訊中。
- 每個點位的主要數字是「本點到下一點」的區間：`下一點 offset_ms - 本點 offset_ms`；最後一點使用本段 `duration_ms`。長條左端依 `offset_ms` 定位、寬度依該區間佔總 Flow 時間的比例計算。
- 「累計」是流水線累計：從第一點開始，依序加上每個點位區間，也就是第一點 `offset_ms` 到本點結束的差額。不能使用父區段自身的 `duration_ms`；例如 `http.request` 的點位區間是 1 ms，累計就是 1 ms，而不是 3.9 秒。隨流水線推進，累計會逐步增加，最後一點才等於總時間。
- `parent_seq`、`depth`：巢狀呼叫關係，前端據此縮排顯示。
- `status`、`error`：成功或錯誤。

需要 client timing 的請求（未設 `trackClient: false`）會在送出時提供 `X-Judgment-Client-Started-At` 與 `X-Judgment-Request-Id`；回應後再以 `POST /api/performance/client` 回報 `total_ms` 與 `render_ms`，合併成 `client.render` 區段。狀態、processing、question-bank、benchmark 等背景查詢不回報。因此一筆 Flow 可以同時比較：

- 伺服器端總耗時與前端實際等待時間。
- Embedding、Qdrant、PostgreSQL、LLM 各段耗時。
- 不同 embedding／LLM 模型（例如 `bge-m3` 與 `gemma3:27b`）的效能差異。
- 不同函式與參數組合（`top_k`、`score_threshold`、`page_size`、`table`）的耗時。

效能報表頁面提供：

- 程序、模組、模型、狀態、方法、關鍵字、日期區間與耗時下限篩選。
- 摘要：符合筆數、成功率、平均耗時、P95、平均段數。
- Flow 統計：模型使用次數與平均模型呼叫耗時、最慢區段排行、Client 全流程與 Render 平均。
- 每筆紀錄可展開點位時間軸，查看實際開始時間、本點到下一點的區間、流水線累計、module／function／params；長條以開始時間定位、長度表示點位區間，並可展開原始 Flow JSON。
- **RAG Pipeline** 分頁提供 Single Query Trace waterfall：Parsing（輸入長度）、Embedding（主機／Model／Token／Batch）、Qdrant（Collection／Filter／Top K）、Reranker（主機／Model／候選數／選用數／fallback 狀態）、Context（Chunk／Token）、LLM（主機／Model／Input／Output Token／TTFT）、Embedding／LLM bar 內的 Model Load 藍色前段（顯示冷啟動載入 vs 熱啟動，後段接續推論；展開後分成 Model Load 與推論兩段明細，各自顯示開始／結束時間）與 Response（總耗時／引用數／Abstain）。階段依執行順序接續排列；每個階段可展開查看 module、function、實際開始／結束時間與原始 params，滑鼠移到 bar 上會顯示同一份明細；可切換最近 50 筆 RAG Trace。效能 Flow 紀錄、測試 Flow 與 RAG 後端處理流程也使用相同 waterfall 元件。
- CSV／JSON 匯出與分頁。
- CLI 紀錄若沒有逐段 instrumentation，會自動建立單一 summary segment，仍可在報表查看總耗時。
- 既有資料庫啟動時會自動執行 `ALTER TABLE performance_records ADD COLUMN flow JSON`；舊紀錄的 `flow` 可為空，頁面會顯示 fallback 訊息。

### 測試模式與模型測試 Flow

系統測試位於 `#/status` 的「系統測試」分類（也可直接開啟 `#/tests`），整合 **API 連線設定** 與 **測試模式開關**；後端電源仍由 `./up.sh`、`./down.sh` 或 `127.0.0.1:9201` 電源控制器管理。

測試模式為 ON 時：

- 下一次 RAG 提問會依序執行目前可用的**所有 embedding 模型與所有具備 chat 能力的 LLM 模型**。
- 前端不設請求 timeout；後端 embedding 與 LLM 呼叫也使用 `timeout=None`。
- 模型清單從 llama-server `/v1/models` 自動偵測，排除 reranker；`bge-m3` 歸類為 embedding，其餘模型需經 **LLM 服務測試** 確認具備 chat 能力，才會列入 LLM 評測。
- 可用 `TEST_EMBEDDING_MODELS`、`TEST_LLM_MODELS` 以逗號分隔覆寫要測試的模型；LLM 仍只保留具備 chat 能力者。
- 每個 embedding 模型會建立 `embedding`／`retrieval` 各一筆 step；Reranker 共用一筆；PostgreSQL `context` 共用一筆；每個 LLM 建立 `llm`／`validation` 各一筆。每筆 step 記錄 `module`、`function`、status、progress、duration、error 與模型輸出摘要；整個測試是 `performance_test_runs`，並保存原始問題與主要回答。
- 回覆仍會選出主要回答：優先使用 `LLM_MODEL`，若失敗或引用驗證不通過，改用第一個通過驗證的模型；若全部失敗則只回傳檢索結果。

#### 測試流程圖表

系統測試頁整合 API 連線表單、測試模式開關與測試 Flow；效能報表頁上方也有「測試流程」panel。RAG 提問頁在送出測試模式問題後，也會在頁面下方即時生成同一個 panel：

- 顯示目前執行中的測試，或最近一筆測試。
- 標記原始 RAG 問題與 RAG 引擎產生的答案。
- 每個步驟顯示使用的 `module`、`function`、模型、狀態與耗時；模型標籤使用實際執行端點的「主機:模型」格式，例如 `x570:bge-m3`、`x570:bge-reranker-v2-m3`、`mbp:gemma3:4b`，PostgreSQL 取文階段則使用「主機:DB名稱」格式，例如 `mbp:judgment`。RAG 引擎答案標頭與 footer primary 也使用同一模型格式。
- 依階段分組：Embedding、Qdrant 檢索、Reranker、PostgreSQL 取文、LLM 生成、引用驗證；PostgreSQL 階段的模型欄顯示 `主機:DB名稱`。
- 每個階段有幾個模型，就顯示幾條子程序進度條；模型失敗以紅色、略過以灰色、執行中以藍色 animated bar 顯示。
- 最下方先顯示總流程進度條，再顯示**總流程時間（依階段）** stacked bar：每個階段依耗時比例顯示不同顏色，下方 legend 標記階段名稱、耗時與百分比；LLM 生成通常占最大比例，執行中會即時估算。
- 系統測試頁、效能報表與 RAG 頁的測試 Flow panel 訂閱 SSE `/api/events/stream` 的 `test-runs` topic；`performance_test_runs`／`performance_test_steps` 變更時由後端推送，前端收到後才查詢 `/api/test-runs/current` 並更新，完成後取消訂閱。
- 「歷史」下拉選單可載入 `performance_test_runs` 的歷史紀錄，還原當時的 flowchart。
- 測試步驟與結果保存在 PostgreSQL，後端重啟後仍可查詢。

一次實際測試（4 個 LLM、1 個 embedding）：

- 12 個子程序：1 embedding + 1 retrieval + 1 rerank + 1 context + 4 LLM + 4 validation。
- 一次歷史實測（27B 預設時期）：4 個 LLM、11 個子程序、總耗時約 82 秒；`gemma3:27b`、`granite4:small-h`、`command-r:latest` 成功，`phonon:latest` 不是 chat 模型而回傳 HTTP 400，測試狀態為 `partial`。
- 主要回答由 `gemma3:27b` 產生，RAG 回應狀態 `operational`，並包含 `test_run` metadata。現在快速預設為 `gemma3:4b`，測試模式會自動多跑 4B 模型。

測試相關 API：

| 方法 | 路徑 | 說明 |
| --- | --- | --- |
| `GET` | `/api/test-mode` | 讀取測試模式與模型清單；回應含 embedding、llm、available 等欄位，其中 LLM 子清單只含具備 chat 能力的模型 |
| `POST` | `/api/test-mode` | 切換測試模式（`{"enabled": true/false}`） |
| `GET` | `/api/test-runs/current` | 最新執行中或最近一筆測試 Flow |
| `GET` | `/api/test-runs` | 歷史測試列表（`limit`） |
| `GET` | `/api/test-runs/{run_id}` | 單一測試的完整 stages／steps |
| `GET` | `/api/llm/models` | 讀取 llama-server 目前模型與已記錄的 chat 能力（不重新探測） |
| `POST` | `/api/llm/models/test` | 執行 LLM 服務測試；只探測尚未記錄的新模型 |
| `GET` | `/api/rerank/status` | 讀取 primary／fallback reranker 健康狀態（不執行 rerank） |
| `POST` | `/api/rerank/test` | 對設定的 reranker 執行實際 rerank 測試並回傳分數 |

測試模式設定儲存在 PostgreSQL `app_settings`（key `test_mode`），重啟後保留；測試 Flow 儲存在 `performance_test_runs` 與 `performance_test_steps`。

#### LLM 服務測試與 chat 能力

系統測試頁的「LLM 服務測試」卡片會檢查 Ollama 上每個模型是否支援 chat，結果保存在 PostgreSQL `ollama_model_capabilities`，以 `(base_url, model)` 為唯一鍵。測試流程：

1. 讀取 Ollama `/api/tags` 取得目前模型清單。
2. 只對「沒有能力紀錄」的新模型呼叫 `/api/show`；已有紀錄的模型直接沿用，不再重測。
3. `/api/show` 的 `capabilities` 含 `completion` 視為支援 chat；名稱含 `rerank`／`reranker` 的模型一律排除。
4. 若 Ollama 版本未回傳 `capabilities`，改用最小 `/api/chat` 請求（`num_predict=1`）判定。
5. 網路錯誤、逾時或非預期 HTTP 狀態等暫時性失敗不會寫入紀錄，下次服務測試會自動重試。

開始 LLM 效能評估前（測試模式或 benchmark 啟動），系統會先呼叫同一個服務測試流程，只把具備 chat 能力的模型放進 LLM 候選清單：

- `/api/test-mode`、`/api/benchmark/models` 與測試 Flow 的 LLM 清單都經過 chat 能力過濾。
- Benchmark 啟動時若所選 LLM 不支援 chat 會直接拒絕，並提示可用模型。
- Benchmark judge 若未設定或不支援 chat，會自動改用另一個支援 chat 的模型；若沒有第二個 chat 模型，則關閉 judge。
- 這可避免 `phonon:latest`（`speech`）或 `bge-m3`（`embedding`）被當成 LLM，造成 Ollama 回傳 `HTTP 400 does not support chat`。

#### Reranker 服務測試

系統測試頁的「Reranker 服務測試」卡會檢查 `RAG_RERANK_ENABLED`、primary／fallback URL、模型與健康狀態；按下「執行 Reranker 服務測試」後，會用固定 sample query 與四段文件對每個設定的端點執行實際 `/v1/rerank` 請求，回傳：

- 每個端點的 status、latency、候選數與選用數
- top score、前幾個 scores 與 top result 文件片段
- 錯誤訊息與 primary／fallback 哪一個目前可用
- `RAG_RERANK_ENABLED=false` 或未設定 URL 時顯示 `not_configured`，不得誤報可用

測試不會修改索引、選取結果或 reranker 設定。測試模式的 Flow 也會在 Qdrant 檢索與 PostgreSQL 取文之間顯示 Reranker 階段，包含「主機:模型」、候選數、選用數、top score、耗時與 fallback 狀態；PostgreSQL 取文階段顯示「主機:DB名稱」，例如 `mbp:judgment`。歷史 run 若沒有 host metadata，只顯示原始模型或 DB 名稱。

「設定選項」→「介面風格」提供十種科技網站風格，對應 <https://getdesign.md/> 的公開設計參考。每個項目直接套用該風格在 header 的底色、文字顏色、品牌線、邊角與陰影，作為即時預覽：

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

header 右上角的齒輪按鈕會開啟右側「設定選項」sidebar，並把 header、主內容與 footer 往左推，而不是覆蓋頁面。Sidebar 上方是設定分類按鈕，分隔線下方是對應功能表：

- 「字型大小」列出目前頁面實際出現的文字區塊，例如頁面標題、區塊標題、內文、表格、標籤、按鈕、表單、程式碼與法規條文。
- 每個區塊都有滑桿、可直接輸入的 px 數值與即時預覽；拉動或輸入後會立即套用到頁面對應 elements。
- 滑鼠移到某個區塊列或列內控制項取得焦點時，頁面上所有對應的文字 elements 會以固定紅色 `#ef4444` outline 與主題 accent 半透明背景標示，列本身也會顯示預覽中狀態；紅色外框可與各主題 accent 色明顯區別，移出後立即恢復。
- 「儲存」會寫入 `localStorage` 的 `judgment.fontSizes.v1`，重新載入或切換頁面後仍會套用；「取消」回到上次儲存值；「回復預設值」清除尚未儲存的覆寫。
- 「介面風格」分類重用同一個 10 種主題清單；每個項目的名稱不變，但底色、文字色、品牌線、邊角與陰影直接採用該主題 header 的樣式，並在名稱與右側色票之間顯示該主題 header 作用中按鈕的迷你預覽（背景色、文字色、pill 圓角與 badge），讓第一個色票能直接對應作用中按鈕。
- 介面風格標頭右側提供「亮／暗／系統」明暗配置，切換後立即套用至頁面、header、sidebar、卡片、表格與表單；「亮」不覆寫主題顏色，直接使用目前主題的原始設計（例如 Linear 仍是深色），「暗」套用共用暗色 palette；選擇儲存在 `localStorage` 的 `judgment.appearance`，系統模式會跟隨 `prefers-color-scheme` 即時更新。
- 390px 行動版 sidebar 改為全寬，避免水平溢出。

### Phase 4：資料生命週期與 RAG 品質 gate

Phase 4 將資料更新、索引重建、狀態與品質檢查串成閉環：

- 完整資料更新現在依序執行 `download → legal_qdrant → postgres → qdrant`：
  - 法規／命令下載後自動執行 `judgment-index-legal-articles --incremental --if-changed`。
  - 條文未變時跳過；有變更時建立新版本、驗證 points／維度後才切換 `legal_articles_current`，失敗保留舊 alias。
  - 判決索引改用 stale 偵測：missing／content hash changed／removed points 任一存在時，走 `build-index-version` blue-green 流程，驗證後才切換 `judgments_current`。
- Processing workflow catalog 新增「法規／命令索引」workflow（stage `legal_qdrant`）。
- `/api/status` 新增：
  - `data.legal_index`：alias／collection／version／points／dimensions／law/article counts／freshness／reasons。
  - `judgment_index_missing`、`judgment_index_changed`、`judgment_index_stale`、`judgment_index_pending`、`judgment_index_fresh`。
- `/api/processing/plan` 新增 `legal_index` 與 `recommended.legal_index`。
- Benchmark summary 新增 `gate`，固定檢查 law recall、article recall、judgment recall、citation valid rate、refusal accuracy、P95 latency；可用 `RAG_GATE_*` 環境變數覆寫門檻。`scripts/rag_regression_gate.py` 可直接用 exit code 做 CI／排程 gate。
- `scripts/run_scheduled_update.sh` 提供 cron／launchd／systemd timer 使用的單次更新入口，內建 lock 避免重疊執行。

目前資料現況（2026-11-21；動態值以 `/api/home`／`/api/status` 為準）：

- 法規／命令：1,351 部法規、10,454 筆命令、222,126 條文；`legal_articles_v006`／`legal_articles_current` 為 222,126 points、1,024 維，freshness `fresh`。
- 判決：`raw_rar` 371 個 archive；PostgreSQL current 判決 4,714,967 筆，Qdrant `judgments_v005` 已索引 4,714,967 / 4,714,967（100%）。
- 後續月份更新可執行：
  ```bash
  uv run judgment-import-judgments --data-dir data/judgments
  uv run judgment-index-vectors --build-version --activate
  ```
  或直接使用 `scripts/run_scheduled_update.sh`，讓完整更新流程接續處理。

### 靜態前端與部署

`src/judgment/web/static/` 的原始碼使用 ES modules，由 FastAPI 直接服務。`scripts/build_frontend.py` 會用 esbuild 將同一份前端打包成 IIFE，產生可獨立開啟、也可直接上傳到 Cloudflare Pages 的 `frontend/`：

```bash
uv run python scripts/build_frontend.py

# 也可把固定的 cloudflared 位址寫進 config.js
uv run python scripts/build_frontend.py --api-base https://api.example.com
```

建置需要 Node.js：腳本優先使用 PATH 中的 `esbuild`，找不到時透過 `npx` 取得。修改前端原始碼後需重新執行才會更新 `frontend/`。

`./up.sh` 在偵測到前端原始碼較新時也會自動重建 `frontend/`。為避免把 Cloudflare Pages 使用的 API base 覆蓋成空字串，請在 `.env` 設定：

```dotenv
FRONTEND_API_BASE=https://api-mbp.ragdemo.win
```

未設定 `FRONTEND_API_BASE` 時，`up.sh` 會沿用現有 `frontend/config.js` 的 `apiBase`，不會直接改成空值。

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
3. 前端預設連到 `http://127.0.0.1:9200`。若後端使用其他連接埠，開啟 `#/tests`（或 `#/status` 的「系統測試」）修改 API Base，或在網址加上 `?api=http://127.0.0.1:8765`。

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
npx wrangler pages deploy frontend --project-name judgment
```

也可在 Cloudflare Pages 以 Git 整合設定：Framework preset 選 `None`、Build command 留空、Build output directory 填 `frontend`。`_headers` 會一併套用。部署後開啟 Pages 網址，若尚未設定 API，前端會自動導向 `#/tests` 要求填入後端位址。

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

後端建議只綁定 `127.0.0.1`，由本機的 cloudflared 對外提供 HTTPS。`judgment-web` 已啟用 proxy headers，`FORWARDED_ALLOW_IPS` 預設為 `127.0.0.1`，只信任本機 cloudflared／反向代理送來的 `X-Forwarded-*`；不要在直接對外時使用 `*`。

本次部署使用：

```text
Frontend  https://judgment.ragdemo.win       Cloudflare Pages project `judgment`
Backend   https://api-mbp.ragdemo.win        cloudflared tunnel → http://127.0.0.1:9200
CORS      https://judgment.ragdemo.win
Google    https://api-mbp.ragdemo.win/api/auth/google/callback
```

建置與部署 Pages：

```bash
uv run python scripts/build_frontend.py --api-base https://api-mbp.ragdemo.win
npx wrangler pages deploy frontend --project-name judgment --branch main
```

Pages 專案的 production branch 是 `main`；手動部署會立即上線，但之後 main 的 Git 部署可能覆蓋。要讓變更長期生效，應把部署分支合併到 main，或調整 Pages 的 production branch。

若 `api-mbp.ragdemo.win` 另外套用了 Cloudflare Access，瀏覽器從 Pages 發出的 fetch 會在 edge 先收到 403，永遠到不了 FastAPI。要走應用層 Google 登入時，應移除該 hostname 的 Access application，或至少對 `/api/*` 設 Bypass；不要在前端放置 Access service token。

#### 管理權杖與 CORS 設定

`#/tests`／`#/status` 的「系統測試」可設定 API Base 與管理權杖。本機 `127.0.0.1` 請求可直接使用；透過 cloudflared、LAN 或反向代理連線時，所有非公開 API 需要 `JUDGMENT_ADMIN_TOKEN`，前端會以 `X-Judgment-Admin-Token` 送出。`/api/health` 保持公開；`/api/home` 是 DEMO_READ，demo 關閉時回 403、demo 開啟且 `home` feature 可用時才回 200。其餘 `/api/*`（含 `/api/status`、`/api/performance`、`/api/system-usage`、SSE）都受保護。SSE 使用短效 ticket，避免把長期權杖放入 EventSource URL。`127.0.0.1`／`localhost` 被視為本機管理員；若主機有多個使用者，請限制本機登入權限或在反向代理前面再加一層驗證。

FastAPI 預設只允許本機 HTTP 來源，`file://`（`null`）不再預設放行；本機寫入另檢查 `Origin`／`Sec-Fetch-Site`，未帶瀏覽器標頭的 CLI 仍可使用：

```bash
CORS_ALLOW_ORIGINS=http://127.0.0.1:9200,http://localhost:9200
TRUSTED_HOSTS=127.0.0.1,localhost,testserver,::1
FORWARDED_ALLOW_IPS=127.0.0.1
JUDGMENT_ADMIN_TOKEN=<以 python -c "import secrets; print(secrets.token_urlsafe(32))" 產生>
```

#### Google 帳號登入

Header 右側提供 Google 登入；預設管理員是 `solo4study@gmail.com`。Google 登入是管理權杖之外的另一種管理員驗證方式，不會移除原本的 `JUDGMENT_ADMIN_TOKEN` 或本機 loopback 行為。

在 Google Cloud Console 建立 **Web application** OAuth client，加入授權 redirect URI：

```text
http://127.0.0.1:9200/api/auth/google/callback
https://<實際後端網域>/api/auth/google/callback
```

設定環境變數：

```bash
GOOGLE_CLIENT_ID=<Google OAuth client id>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
GOOGLE_REDIRECT_URI=https://<實際後端網域>/api/auth/google/callback
GOOGLE_ALLOWED_EMAILS=solo4study@gmail.com
AUTH_SESSION_SECRET=<python -c "import secrets; print(secrets.token_urlsafe(32))" 產生>
AUTH_SESSION_TTL_SECONDS=43200
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_SECURE=auto
```

- `GOOGLE_ALLOWED_EMAILS` 是登入白名單；只有列出的電子郵件可以取得管理員工作階段。多個帳號以逗號分隔。
- `GOOGLE_REDIRECT_URI` 留空時會由請求推導；正式環境建議明確設定，且必須與 Google Console 完全一致。
- `AUTH_SESSION_SECRET` 用於簽署 HttpOnly 工作階段 cookie；正式環境 MUST 設定至少 32 字元且不同於 `JUDGMENT_ADMIN_TOKEN` 的獨立值。當 `AUTH_COOKIE_SECURE=true` 或 redirect URI 為 HTTPS 時，啟動與 `--check-config` 會 fail fast；留空 fallback 僅供本機開發。
- 正式自訂網域（`judgment.ragdemo.win` → `api-mbp.ragdemo.win`）為同 site 的不同 origin，使用 `AUTH_COOKIE_SAMESITE=lax` 即可；`*.pages.dev` 預覽與 API 屬不同 site，若需要在預覽站登入，該預覽環境才需 `AUTH_COOKIE_SAMESITE=none` 並確認 HTTPS／CORS。
- 工作階段 token 含 `jti` 與 `sv`（session epoch）；絕對 TTL 12 小時（`AUTH_SESSION_TTL_SECONDS=43200`）。登出會撤銷該 `jti`；「登出所有裝置」會推進該帳號的 epoch，讓所有既有 cookie 立即失效。部署 SESSION-01 前簽發、沒有 `sv` 的舊 token 一律視為無效。跨站 `POST /api/auth/logout`／`logout-all` 會被拒絕。
- 登入後 header 會顯示帳號名稱與登出選單；`/api/auth/me` 回傳目前工作階段，`/api/auth/logout` 會清除 cookie，`POST /api/auth/logout-all` 會撤銷該帳號所有裝置的工作階段。
- 安全稽核寫入 `security_audit_events`，涵蓋 Google 登入成功／失敗、logout、logout-all、admin token 與 admin 寫入；`GET /api/admin/security-audit` 可讀取最近事件。事件保留 180 天，只記 path 不記 query string；未驗證失敗事件有每日上限，稽核失敗不會阻擋原請求。
- 資料保留矩陣與備份例外見 [`specs/security/data-retention.md`](specs/security/data-retention.md)：RAG 提問／回答 90 天、安全稽核 180 天、分享快照 7 天；備份依 90 天輪替政策由維運刪除。
- 未設定 `GOOGLE_CLIENT_ID`／`GOOGLE_CLIENT_SECRET` 時，header 仍會顯示登入按鈕，但會提示 Google 登入尚未設定；原有管理權杖與本機管理模式不受影響。

目前程式與文件的對照基準見 [`docs/code-alignment-2026-11-21.md`](docs/code-alignment-2026-11-21.md)。安全驗收狀態與證據見 [`specs/security/security-acceptance-matrix.md`](specs/security/security-acceptance-matrix.md)；2026-11-22 的資安提升評估與整改路線圖見 [`specs/security/security-improvement-assessment-2026-11-22.md`](specs/security/security-improvement-assessment-2026-11-22.md)；主應用 DB 角色 provision／回滾見 [`specs/security/app-db-role-runbook.md`](specs/security/app-db-role-runbook.md)。未完成的部署項不會因程式測試通過而標成 verified。

每次開機或部署後可跑 listener 回歸檢查；`up.sh` 在啟動 web 前也會自動執行，失敗會拒絕啟動：

```bash
bash scripts/security_listener_check.sh
```

預期 `OK: Judgment-related listeners are loopback-only`；有非 loopback 的 Judgment／AI／DB port（含 `*:`／`[::]:`）會 FAIL。

緊急誤判時可刻意覆寫，但會在啟動日誌留下 warning：

```bash
SKIP_LISTENER_CHECK=1 bash up.sh
```

x570 網路隔離可從 MBP 以 `scripts/x570_apply_network_isolation.sh` 執行；它會要求管理 IP／MBP IP、二次確認與 sudo，並在套用後提示第二台設備與外網驗證。

需要 Cloudflare Pages 或其他靜態主機時，把實際網址加入 `CORS_ALLOW_ORIGINS`，例如：

```bash
CORS_ALLOW_ORIGINS=http://127.0.0.1:9200,http://localhost:9200,https://judgment.pages.dev
```

`*` 會被程式忽略。正式環境請務必使用明確來源；若使用 Cloudflare Pages，建議再加上 Cloudflare Access 或同等的身分驗證。

#### 資料庫與 Qdrant 綁定

`docker-compose.yml` 只將 PostgreSQL 與 Qdrant 發佈到 `127.0.0.1`，且要求 `.env` 提供 `POSTGRES_PASSWORD` 與 `QDRANT_API_KEY`。既有 PostgreSQL volume 若曾以舊密碼初始化，請先以本機 socket 執行：

```bash
docker compose exec -T postgres psql -U judgment -d judgment \
  -c "ALTER USER judgment WITH PASSWORD '<new-password>';"
```

並確認 `pg_hba.conf` 的 `127.0.0.1/32`／`::1/128` 為 `scram-sha-256`，不要使用 `trust`。`up.sh`、`backup.sh`、`restore.sh` 與後端都會自動帶入 Qdrant `api-key`；若使用舊備份，請先更新 `.env` 後再還原。

### 判決向量索引與 RAG

完整的元件架構、請求流程、回應契約與已知限制，見 [`documents/rag-architecture.md`](documents/rag-architecture.md)（含 SVG 架構圖）。專案的架構、評估、API 規格與分析文件統一放在 `documents/`。

RAG 的資料流如下：

1. 提問時先從 PostgreSQL `law_documents` 比對問題中的法規／命令名稱與常見簡稱（例如「證交法」對應「證券交易法」），取出 metadata；再從原始法規 Parquet 讀取條文、沿革與制定日期。若問題沒有直接寫出法規名稱，會以法律概念索引找出對應法規（例如「內線交易」對應證券交易法）。條文排名不是只看名稱或 2-gram 次數，而是結合法規概念展開（例如「內線交易」展開為「實際知悉」、「重大影響其股票價格」、「未公開」與第 157-1、171 條）、條號 regex、CJK BM25 與詞組覆蓋率；法規與命令都會納入檢索。前端「法規／命令檢索結果」中的法規名稱、各條文與命中詞彙都可直接點擊開啟完整原文。
2. 若問題是「有多少條文」、「何時開始有」或「最常觸犯什麼法條」，系統會以法規 metadata、條文與判決引用統計直接產生可驗證的結構化回答；統計會明確標示判決筆數與「被引用次數」，不宣稱定罪或勝訴比例。
3. 若問題只輸入法規名稱（例如「證券交易法」）、「介紹證券交易法」或「證交法是什麼」，系統會回傳法規簡介：立法目的、主管機關、章節架構與核心條文；此路徑不呼叫 LLM，也不以判決清單取代法規介紹。官方名稱有「中華民國」前綴時，也接受常用簡稱（例如「刑法」對應「中華民國刑法」）。
4. 判決 RAG 只處理與 `documents/金融法規.md` 的 99 項金融相關法規有關的問題；若問題與清單及金融詞彙無關，系統不生成判決 RAG 回答，會回覆「本RAG提問功能主要以金融相關判決為主」。
3. 判決端仍從 PostgreSQL `judgment_documents` 取出判決，保留法院、裁判日期、案由與命中法規，並擷取全文頭尾視窗（預設 1,600 字）作為文件級 embedding 文字。
4. 以本機 Ollama `bge-m3`（1024 維）產生向量；版本化索引寫入 `judgments_vNNN`，正式查詢經 `judgments_current` alias。每筆判決一個 point，point id 由案號決定，重跑可覆寫而不會重複；`judgment_documents` 是未啟用版本化索引時的 legacy／default collection。
5. 在 `judgment_vector_index` 記錄 `jid`、`version_id`、collection、模型、content hash、index text／payload hash 與維度；重跑時跳過未變更的判決，因此索引可中斷後繼續。
6. 判決提問以同一個 `bge-m3` 將問題轉為向量，從 Qdrant 取 Top K（預設 4）且高於相似度門檻（預設 0.35）的判決，再從 PostgreSQL 取回全文並挑選與問題詞彙最相關的段落。
7. 將法規／命令條文、判決片段與嚴格系統提示交給 Ollama LLM（快速預設 `gemma3:4b`，可改 `gemma3:27b`）。回答必須標註 `[1]`、`[2]` 等來源編號；若缺少有效引用、引用越界或模型回傳空回答，系統會先以嚴格提示重試一次；仍失敗則降級為只顯示檢索結果，不保留推測內容。
8. 若問題與檢索資料無關，模型可明確回答「檢索到的資料不足以回答」；此類拒絕回答不要求引用編號，但不得憑空產生案號。

```bash
# 只統計候選判決，不呼叫 Ollama 或 Qdrant
uv run judgment-index-vectors --dry-run --limit 1000

# 建立前 1,000 筆判決索引
uv run judgment-index-vectors --limit 1000 --batch-size 16

# 跨語料抽樣：只索引 id 為 24 倍數的判決（以目前 4,714,967 筆約 19.6 萬筆）
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
- 狀態頁「資料版本」會顯示「已索引／判決總數／索引覆蓋率／collection points」；RAG 頁 hero notice 只顯示已索引／判決總數與整體 RAG 狀態。未建立 collection 或服務離線時會明確標示，不以其他數字代替。
- 狀態頁左側提供分類 sidebar；「系統資料使用」分頁呼叫 `GET /api/system-usage`，顯示主機 CPU／RAM／Swap、Docker 容器 CPU／RAM／Net I/O／Block I/O／PIDs、Docker images／containers／volumes／build cache、PostgreSQL 資料庫與前 6 大資料表容量、Qdrant collection／points／segments，以及磁碟 total／used／free／百分比。硬碟使用組成另列前端、後端、Docker 映像／容器／快取、PostgreSQL volume、Qdrant volume、Parquet（法規＋判決）與 Judgment 元件合計，並顯示目前 HDD 已使用量。

### 版本化索引與 Qdrant Alias

正式索引改用 Blue-Green collection：

```text
judgments_v001
judgments_v005
judgments_current -> 目前正式版本
```

新版本建置期間不修改 active collection；完成驗證後才以 Qdrant `POST /collections/aliases` 原子切換。PostgreSQL `judgment_index_versions` 保存版本、physical collection、alias、embedding model／version、維度、來源 snapshot、驗證結果、前一個版本（`previous_version_id`）與時間；`judgment_vector_index` 使用 `(jid, version_id)` 複合主鍵。

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
- 增量重用的指紋包含 `content_hash`、`index_text_hash`、`payload_hash`、`dimensions` 與 model／embedding version／index recipe；`source_updated_at` 僅在舊資料缺少 `index_text_hash` 時作為 fallback。metadata-only 變更也會重新 embedding。
- 已刪除或不再符合資格的判決會從新 collection 刪除。
- 驗證失敗不得切換；第一階段保留 active＋前一個成功版本，不自動刪除舊 collection。
- `JUDGMENT_VECTOR_ALIAS` 預設 `judgments_current`，`JUDGMENT_VECTOR_COLLECTION_PREFIX` 預設 `judgments`。
- x570 以 llama-server 的 `http://x570:11437`（`EMBEDDING_API=openai`）作為主要 embedding，MBP llama-server `http://127.0.0.1:11437` 為 fallback；x570 不可用時由 `up.sh` 改用 MBP llama-server。兩端使用同一個 `bge-m3` GGUF／pooling，輸出需維持相容。
- 在「系統狀態 → Model Provider」新增多台 llama-server 後，可到「資料處理」的「執行資訊」卡片點選「主機:模型」按鈕；選取的主機會設為第一優先，embedding 會依序嘗試後續主機，直到成功或全部失敗。此設定會套用到法規／命令索引、判決向量索引與完整資料更新；CLI 若明確指定 `--embedding-url`／`--embedding-model`，以 CLI 參數為優先。

#### 全量索引腳本

`scripts/index_full_task.sh` 會先查詢目前 active 版本的覆蓋率，再依剩餘筆數執行版本化建置：

```bash
./scripts/index_full_task.sh          # 查詢覆蓋率後執行索引
./scripts/index_full_task.sh status   # 只顯示進度，不執行索引
```

- 腳本每次都會傳 `--build-version --limit <CAP>`；`build_index_version()` 在收到 `--limit` 時會停用相容向量複製與自動 alias 切換，因此會建立／接續一個 full-build 版本。完成後需手動驗證與啟用：`--validate-version <id>`、`--activate-version <id>`；`AUTO_ACTIVATE=1` 在這個腳本路徑下目前不會真正切換 alias。
- `LIMIT=2000 ./scripts/index_full_task.sh` 可限制本次最多索引筆數，適合測試。
- `PLAN_ONLY=1 ./scripts/index_full_task.sh` 只顯示偵測到的剩餘筆數與即將執行的指令，不會啟動索引。
- `AUTO_ACTIVATE=0 ./scripts/index_full_task.sh` 會關閉腳本傳入的 `--activate`。
- `FORCE=1 ./scripts/index_full_task.sh` 即使目前 coverage 100% 仍執行；`RECREATE=1` 會加 `--no-resume`，忽略既有 building 版本並建立新版本，但不會刪除 active collection。
- `BATCH_SIZE`、`MAX_CHARS` 仍可用環境變數覆寫。
- 日誌寫入 `.run/index_full_task_<timestamp>.log`，`.run/index_full_task.log` 指向最新一份。
- 執行中會在 terminal 顯示 10 行進度條：每行代表 10%，每行 100 個字元，每個字元代表 0.1%，合計 1,000 個字元 = 100%。例如：

  ```text
  全量索引範例（數字為示意，實際值以執行時進度為準）：本次待索引 551,368 筆 · 目前 187,375 / 4,714,967（4.0%）
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
  已用 2:11:05 · 剩餘 2:51:10 · 總進度 319,703 / 4,714,967（6.8%）
  ```

  若 terminal 寬度不足，每行會自動縮短，並提示放大視窗可顯示完整 100 字元；輸出被重導向時會改成每 30 秒一行的精簡格式。進度條由 `scripts/index_progress.py` 解析每批日誌產生。
- 每次索引完成後會寫入 `performance_records`（版本化建置程序：`判決向量索引版本`；legacy 索引為 `判決向量索引`。任務標籤 DB 值為 `auto`，UI 顯示「自動接續」），效能報表上方會出現「索引效能」面板：當次執行筆數、平均每秒筆數、當次使用時間、平均每批時間，以及最近多次吞吐、最新一次時間組成（Embedding／Qdrant／PostgreSQL）與本次索引進度折線圖。舊紀錄若沒有階段計時，會以總耗時與 `batch_size` 推算批數與每批平均時間。效能報表另提供「判決向量索引 Pipeline」分頁，顯示每次版本化建置的實際 host／model、版本／collection／alias、build mode、是否接續，以及 probe／version／copy／embedding／qdrant／postgres／validate／activate／report 階段耗時與百分比；資料寫入 `performance_records.details.pipeline`，可切換最近 30 次紀錄。
- 建議在離峰時段執行；索引期間會與 Ollama 爭用資源，RAG 仍可用但可能變慢。
- 全部完成後，覆蓋率應為 4,714,967 / 4,714,967（100%）；目前已是 100%。

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
| 問題可對應法規／命令，但 `QDRANT_URL` 未設定 | 仍以法規 metadata／條文回答；有 LLM 時狀態 `operational`，否則 `retrieval_only`，`retrieval.status` 為 `not_configured` |
| 問題無法對應法規／命令，且 `QDRANT_URL` 未設定 | 回應 `status: preview`，`retrieval.status: not_configured`，顯示法規 metadata 預覽 |
| Qdrant 無法連線或 Collection 尚未建立 | 有法規／命令來源時仍可回答；沒有來源時回應 `preview`，`retrieval.status` 為 `unavailable`／`not_indexed` |
| Embedding 或向量檢索失敗 | 有法規／命令來源時仍可回答；沒有來源時回應 `preview`，`retrieval.status` 為 `degraded` |
| 沒有相似度足夠的判決 | 若問題可對應法規／命令，改用該來源回答；否則標示 `retrieval_only` |
| `LLM_URL`／`LLM_MODEL` 未設定 | 標示 `retrieval_only`，只列出檢索結果 |
| LLM 回答缺少有效引用 | 先以嚴格提示重試一次；仍失敗則降級為 `retrieval_only`，不顯示未經驗證的回答 |

Qdrant 資料頁提供「語意查詢」「Collection」「Top K」「相似度門檻」；結果包含相似度、案號、法院、案由、裁判日期、命中法規與相似片段，點選案號可開啟判決原文。RAG 回答與所有引用皆不是法律意見。 點擊 RAG 回覆中的法規／命令卡，會從本地原始法規 Parquet 開啟完整原始條文 dialog；dialog 一次列出全部條文、法規沿革與來源網站，並可透過右上角 X、「返回回答」或點擊外部關閉。點擊卡內的單一條文預覽，則只顯示該條文的完整內容，不列出其他條文。

### 法規優先題型（Phase 1）

RAG 現在會區分「法規條文題」與「判決檢索題」：

- 問題包含明確法規名稱，或出現「規定、條文、義務、責任、限制、罰則、從業人員、負責人、職員」等法規導向詞彙時，採 **law-first**。
- 問題出現「判決、案例、法院、實務、被告、原告」等詞彙時，仍以判決為主。
- law-first 時：
  - 法規／命令 context 排在判決前面。
  - 法規 citation 編號從 `[1]` 開始，判決接續在後。
  - 預設最多只保留 `RAG_LAW_FIRST_JUDGMENT_LIMIT`（預設 1）筆判決作為輔助，避免判決壓過條文。
  - 被縮減但仍在 rerank 前段的判決會以 `reference_judgments`（只含 JID、法院、日期、案由、向量/rerank 分數）隨結果回傳；前端顯示「本題…另有 N 筆相關判決，展開查看」，展開項目標示「僅供參考（未用於生成答案）」。這是固定模板，不經 LLM 改寫。
  - 引用卡使用三種狀態：`答案引用`、`已提供給模型，答案未引用`、`僅供參考`；`used_for_generation` 只表示是否進入 prompt，不再等同答案引用。
  - LLM system prompt 會要求以現行法規／命令條文為主要依據，判決僅作實務補充。
  - 判決卡的引用 chips 以判決實際 `citations` 顯示「法規＋條號＋項次」（例如 `銀行法第125條第1項、第3項`）；點擊可開啟該條完整條文。上方已顯示法規檢索結果時，不再重複下方的法規來源卡。
- 「銀行法對從業人員有那些規定？」這類問句不再被誤判為「列出相關法規」；`那些規定` 不會觸發 related-laws 清單，也不會提前清空已選出的法規 articles。
- 純判決列表題（例如「在板橋地方法院相關詐騙的判決有那些」）採 judgment-first，直接產生 `retrieval_list` 清單：每筆列案號、法院、裁判日期、案由與和問題相關的事實句；只保留判決來源，不讓僅因法院名稱命中的法規／命令（例如「地方法院…處務規程」）進入回答，也不以 LLM 改寫案號。
- 帶條件的判決查詢（法院、年份、案由）會先由 `parse_judgment_query()` 轉成 Qdrant filter：法院使用新北／板橋歷史別名，年份使用整數 `jdate_num` 範圍，案由在該範圍內用 `facet(title)` 動態取得，不寫死「詐欺、詐欺等」清單。列舉題以 `count()` 取得總筆數，再用 `scroll(order_by=jdate_num)` 列前 20 筆；回傳前以 `violations()` 逐筆驗證法院、年份與案由，不符即剔除。
- `jdate_num` 由 `scripts/backfill_jdate_num.py` 回填；新匯入資料也必須同步寫入 `jdate_num` 與 `source_year`。若沒有回填，年份 filter 會排除舊 points。

```bash
# 一次性回填（可中斷續跑；只改 payload，不動向量）
uv run python scripts/backfill_jdate_num.py
```

### P1：Query Plan 與 Dense + Lexical RRF

- `build_query_plan()` 會依問題與 filter 選路徑：
  - `judgment_list`：count + scroll，不經向量或 reranker。
  - `law_first`：法規優先，判決用 dense + lexical。
  - `structured_semantic`：法院／年份／案由 filter + dense。
  - `semantic`：一般語意檢索。
  - `keyword_list`：法院／年份 + 專有名詞（例如「違約交割」）的 PostgreSQL 正規化全文精確比對；0 命中直接拒答，不退回近似詞向量結果。
- Dense 候選可選擇再用中文 bigram BM25 分數做 weighted RRF（`rrf_k=60`、lexical weight 2.0），記錄在 `retrieval.hybrid`；這不是完整 sparse／BM25 索引，真正的 sparse collection 屬於 P1.5。此功能預設關閉：`RAG_LEXICAL_RRF_ENABLED=false`，需有 A/B 排序收益再開啟。
- Query Plan 與 RRF 決策會出現在 Flow 的 `rag.query_plan`、`rag.lexical_rrf` span。

分層回歸測試：

```bash
uv run python scripts/rag_query_benchmark.py \
  --suite tests/benchmarks/rag_query_suite.json \
  --output .run/rag_benchmark.json
```

目前 27 題（結構化、無結果、法規優先、語意、structured semantic、keyword_list、誤路由反例）全部通過，Filter Violation Rate 0；正式驗收應擴充到 100–300 題。

召回與重複稽核：

```bash
uv run python scripts/rag_recall_audit.py \
  --question "2000年至2010年在板橋地方法院相關詐騙的判決有那些" \
  --output .run/rag_recall_audit.json
```

此工具會比對 Qdrant 筆數、`jid` 重複數，以及 PostgreSQL 的 title／全文基準。以目標題為例：Qdrant court+date `100,312` = PostgreSQL `100,312`（coverage gap 0），title 命中 `210` = `210`，無重複 jid；正規化全文含詐欺／詐騙為 `1,788`，其中 title 未命中 `1,581`。這個比例只能當調查訊號，不能當 Recall。

正規化 embedding 稽核（唯讀，不改索引）：

```bash
uv run python scripts/normalization_embedding_audit.py \
  --sample-size 200 --include-split \
  --output .run/normalization_embedding_audit.json
```

200 筆 head/tail 的 raw vs normalized embedding：cosine median `0.9858`、p05 `0.9689`、min `0.9539`；5 個查詢 top-10 overlap `8–10/10`。另加 `--include-split` 的針對性稽核（n=250）：59 筆含 split 詞，split 組 cosine mean `0.9809`、非 split 組 `0.9839`，相關係數 `0.062`。依預先定義門檻（median < 0.98、p05 < 0.95、或任一 top-10 < 8）結果為 **暫不重算當時的 4,681,502 筆向量**（2026-11-16 快照；目前索引筆數以 `/api/home` 為準），只把正規化用在 matching／snippet。

金融法律術語 Registry：

- 資料：`src/judgment/data/legal_terms_registry.json`
- 規模：429 個術語，10 個 active、419 個 candidate。
- Candidate 均 `active=false`、`expansion_enabled=false`、`review_status=engineering_pending`，不會改變目前 retrieval。
- 分類、法規與審核流程見 `specs/005-retrieval-evaluation/legal-term-registry.md`；完整清單見 `specs/005-retrieval-evaluation/financial-terms-candidates.md`。
- 暫停／延後工作的負責角色與重啟條件見 `specs/005-retrieval-evaluation/paused-work.md`。

術語證據與優先佇列（唯讀，不改 Registry）：

```bash
uv run python scripts/legal_term_evidence.py \
  --limit 200000 --output .run/legal_term_evidence.json

uv run python scripts/legal_term_priority.py \
  --evidence .run/legal_term_evidence.json \
  --output .run/legal_term_priority.csv

uv run python scripts/legal_term_ground_truth_candidates.py \
  --evidence .run/legal_term_evidence.json \
  --priority .run/legal_term_priority.json \
  --output .run/legal_term_ground_truth_candidates.json
```

200k deterministic sample（203,543 筆）：147/429 術語有命中、72 個達到 sample df>=20；priority 產生 35 個 P0、28 個 P1；ground-truth candidates 有 1,818 個正例與 720 個 confuser，70 個術語達 proxy-ready。這些都是 `exact_match_proxy`，不是法律相關性標註。設計與限制見 `specs/005-retrieval-evaluation/legal-term-evidence-pipeline.md`。

本次沒有跑 4.68M 全庫 `--full`（以目前掃描速率估計約 90 分鐘）；全庫統計仍是後續離峰工作。

`pg_trgm` 的 `full_text` 100k sample benchmark 仍在獨立 `legal_term_benchmark` schema 執行；結論是不建立 `full_text` 的正式 GIN index（index 約 839 MB／100k 筆，線性外推約 40 GB；2 字中文詞沒有加速）：

```bash
uv run python scripts/legal_term_trgm_benchmark.py \
  --rows 100000 --output .run/pg_trgm-benchmark-report.json
```

2026-11-21 已在 production `judgment_documents` 建立 **keyword filter 實際搜尋欄位** 的五個 GIN trigram indexes：

- `jid`、`court`、`court_normalized`、`title`、`matched_laws_text`
- 合計約 401 MB；`full_text` 不在 `/api/query` 的 keyword filter 內，因此不建立。
- `EXPLAIN ANALYZE`：`證券交易法` count 約 124 ms、`非常規交易` 約 1.3 ms；2 字詞（如 `民法`）仍約 3.45 秒，planner 會依選擇性決定是否用 index。
- 建立指令（`CREATE INDEX CONCURRENTLY`，需在 transaction 外執行）：

```bash
docker exec -i judgment-postgres psql -U judgment -d judgment \
  -v ON_ERROR_STOP=1 < scripts/create_judgment_trgm_indexes.sql
```

完整 benchmark 數據見 `specs/005-retrieval-evaluation/pgtrgm-benchmark.md`。

Postings table（GIN 的替代方案，sample 已驗證；尚未接入 RAG）：

```bash
uv run python scripts/legal_term_postings.py \
  --limit 200000 --rebuild \
  --output .run/legal_term_postings_report.json
```

200k sample：127,513 筆 `(jid, term_id, occurrences)`、table 35 MB；線性外推全庫約 2.93M 筆／805 MB。2,000 筆 validation 的 row-level 與 term-level mismatch 都是 0。完整設計與限制見 `specs/005-retrieval-evaluation/legal-term-postings.md`。

Expansion proxy probe（免人工標註，不能宣稱 legal Recall 改善）：

```bash
uv run python scripts/legal_term_expansion_probe.py \
  --repetitions 2 --output .run/legal_term_expansion_probe.json
```

5 個 expansion 術語的 exact-match proxy：只有 `違約交割` 的 Recall@8 增加 0.083（1/12），其餘 A/B 都是 0；mean ΔRecall@8 +0.0167。runtime `RAG_LEGAL_EXPANSION_ENABLED` 因此維持預設 `false`，registry 內這 5 個術語也已改成 `expansion_enabled=false`／`expansion_decision=disabled`。

真實問題 intake（先收集 20–30 題，再排序術語；不是用語料 frequency 排序）：

```bash
uv run python scripts/real_question_audit.py \
  --questions .run/real_questions.jsonl \
  --api-base http://127.0.0.1:9200 \
  --output .run/real_question_audit.json
```

格式與失敗型態見 `specs/005-retrieval-evaluation/real-question-intake.md`。

分層標註種子（v2.0）：

```bash
uv run python scripts/build_fraud_relevance_sample.py
```

輸出 `.run/fraud_relevance/`：`manifest.json`、`formal_cases.jsonl`、`pilot_cases.jsonl`、`analysis_key.jsonl`、`pilot_analysis_key.jsonl`、`annotation_template.csv` 與 `pilot_template.csv`。A/B/C1 全量、C2 抽 50、title precision 抽 30；盲標佇列只含 `case_id` 與全文，分層與 JID 只存在 analysis key。舊的 `scripts/build_eval_sample.py` 僅供 exploratory 使用，不是正式 ground truth。

建立 Pilot／title precision 盲標批次：

```bash
uv run python scripts/build_annotation_batches.py
```

輸出 `.run/fraud_relevance/batches/`：`pilot_batch.jsonl`（20 筆）、`title_batch.jsonl`（30 title precision + 20 primary controls，共 50 筆盲標）、兩份 template 與 analysis key。標註完成後用 `scripts/merge_annotation_batch.py` 把 `batch_id` 還原成正式 `case_id`。

終端標註與報告：

```bash
uv run python scripts/annotate_batch.py \
  --batch .run/fraud_relevance/batches/pilot_batch.jsonl \
  --annotator annotator_1

uv run python scripts/pilot_report.py \
  --annotator-1 .run/fraud_relevance/annotations/pilot_batch_annotator_1.jsonl \
  --annotator-2 .run/fraud_relevance/annotations/pilot_batch_annotator_2.jsonl

uv run python scripts/title_precision_report.py \
  --annotations .run/fraud_relevance/annotations/title_batch_annotator_1.jsonl
```

`annotate_batch.py` 只顯示不透明 ID 與全文，逐筆寫入 JSONL，可中斷續標；不會讀取 analysis key。

統計區間：

```bash
uv run python scripts/fraud_sampling_stats.py c2 \
  --population 1266 --sample 50 --observed 0
```

標註完成後計算 T 與 Coverage：

```bash
uv run python scripts/fraud_relevance_report.py \
  --annotations .run/fraud_relevance/annotations.csv \
  --analysis-key .run/fraud_relevance/analysis_key.jsonl \
  --manifest .run/fraud_relevance/manifest.json \
  --verified-output .run/fraud_relevance/annotations_verified.jsonl \
  --output .run/fraud_relevance/report.json
```

抽樣、Coverage 公式、grade 規則、盲標與決策門檻見 `specs/006-fraud-relevance-annotation/spec.md`；評估資料格式與指標見 `specs/005-retrieval-evaluation/spec.md`。
- 銀行法加入從業人員概念擴展：銀行負責人、銀行職員、負責人、職員、兼職、佣金、酬金、不當利益、資格條件、利益衝突、違背職務，以及第 18、35、35-1、35-2、125-2、127-2 條等概念索引。

### 法規／命令條文向量索引（Phase 2）

法規／命令不再只靠 PostgreSQL／Parquet 關鍵字與 BM25。Phase 2 建立獨立的 Qdrant collection，**不與判決 `judgments_v005` 混合**：

```text
11,805 部法規／命令
→ 222,126 條可檢索條文
→ bge-m3（1,024 維）
→ legal_articles_v001
→ legal_articles_current alias
```

索引只包含有 `article_no` 與內容的條文；章節標題（14,840 筆）會跳過。Payload 保留 `source_type`、`law_key`、`law_name`、`law_level`、`law_category`、`article_no`、`article_content`、`content_hash`、`law_hash` 與模型版本，供混合檢索、rerank、citation 與 incremental diff 使用。

#### 建立與更新

```bash
# 全量建立（預設驗證通過後切換 alias）
uv run judgment-index-legal-articles

# 只統計，不呼叫 embedding／Qdrant
uv run judgment-index-legal-articles --dry-run

# 法規來源沒有變更就跳過
uv run judgment-index-legal-articles --incremental --if-changed

# 只重建有變動的法規；其餘向量由 active collection 複製
uv run judgment-index-legal-articles --incremental

# 先驗證但不切換 alias
uv run judgment-index-legal-articles --no-activate

# 狀態、版本、回滾與清除
uv run judgment-index-legal-articles --status
uv run judgment-index-legal-articles --list-versions
uv run judgment-index-legal-articles --rollback
uv run judgment-index-legal-articles --discard-version 3
```

每次建置會建立新的 `legal_articles_vNNN`，驗證 Qdrant 筆數、維度與取樣 payload 後才切換 `legal_articles_current`；舊版本保留供 rollback。`--incremental` 會比對每個法規的內容 hash，複製未變動向量、刪除變動／移除法規的舊 points，再只重新 embedding 有變動的條文。若 Ollama 因單批條文總長度回傳 413，索引器會自動拆分批次；單筆過長條文會截斷 embedding 文字後重試，payload 仍保留原文供 citation 使用。

#### 混合檢索流程

```text
問題
→ bge-m3 查詢向量（只算一次）
├─ 判決：judgments_current → 候選判決
└─ 法規：legal_articles_current → 候選條文
→ 法規：BM25／概念排名與 dense 排名以 RRF 融合
→ 每部法規取候選條文
→ BGE-reranker-v2-m3 分開 rerank 法規與命令條文（與判決分開）
→ law-first 或 judgment-first quota
→ LLM（法規優先題以條文為主、判決為輔）
```

重點：

- 判決與法規共用同一個查詢向量，避免重複 embedding。
- 法規候選以 `select_law_articles()` 的 BM25／概念排名與 Qdrant dense 排名做 RRF（Reciprocal Rank Fusion）；`RAG_LAW_RRF_K` 控制排名平滑，`RAG_LAW_DENSE_WEIGHT` 控制 dense 的投票權重。dense 可在關鍵字完全找不到時補上法規。
- RRF 只負責排序；為避免 200+ 條的法規被大量弱相關條文灌滿，仍保留 BM25／dense 正規化分數作為相關性下限。
- 若問題已明確指名法規（例如「銀行法對從業人員有那些規定？」），該法規是 anchor；其他 dense 法規不會蓋過它，dense 只用來排序該法規的條文。
- 法規與命令的 rerank 分成不同批次執行，`retrieval.law_rerank.groups` 會分別記錄 `law`／`order` 的狀態、候選數、top score 與錯誤；一組失敗時另一組仍會套用 rerank，失敗組保留原順序。
- 法規 rerank 與判決 rerank 分開執行；法規候選先取 `RAG_LAW_CANDIDATE_ARTICLE_LIMIT` 條，再以 `RAG_LAW_RERANK_WEIGHT` 將 rerank 排名與 BM25／dense 前置排名融合，最後縮到 `RAG_LAW_ARTICLE_LIMIT`／`RAG_LAW_ARTICLE_LIMIT_LAW_FIRST`。這樣可保留最強關鍵字／概念條文，不會被 cross-encoder 的單一偏好蓋掉。
- `retrieval.law_vector` 記錄 alias、collection、候選數、top score 與命中的法規；`retrieval.law_fusion` 記錄 RRF 參數；`retrieval.law_rerank` 記錄法規 rerank 狀態、provider、延遲、分數與分組結果。
- 條文數、沿革、相關法規清單與引用統計等結構化題型不呼叫法規向量與法規 rerank，維持原本的快速回應路徑。
- alias 不存在、Qdrant 失敗或 embedding 失敗時，法規檢索會退回 PostgreSQL／Parquet + BM25，不中斷 RAG；判決向量檢索維持原本的 fallback 行為。
- 不使用 Qwen 系列模型；embedding 固定 `bge-m3`、reranker 固定 `BGE-reranker-v2-m3`。

### Reranker（第一輪：BGE-reranker-v2-m3）

第一輪使用 `BAAI/bge-reranker-v2-m3` Q8 GGUF，透過 llama.cpp 的 `/v1/rerank` 提供服務。Ollama 目前沒有 rerank API，因此不使用 Ollama 的 reranker 模型端點。

架構：

```text
問題
→ bge-m3 embedding
→ Qdrant 取 RAG_RERANK_CANDIDATES 筆候選
→ x570 reranker（主要）
→ MBP reranker（fallback）
→ 取 RAG_TOP_K 筆進入 Context
→ LLM
```

啟動 x570 主要 reranker（在 x570 上執行）：

```bash
# 預設使用 Ollama 已下載的 qllama/bge-reranker-v2-m3 GGUF
RERANK_HOST=0.0.0.0 RERANK_PORT=11435 ./scripts/rerank_server.sh

# 若 llama-server 不在常見路徑
LLAMA_SERVER_BIN=/path/to/llama-server \
RERANK_HOST=0.0.0.0 RERANK_PORT=11435 \
./scripts/rerank_server.sh
```

注意：

- x570 若模型位於 `/usr/share/ollama`，目前使用者可能沒有讀取權限；請以 Ollama 服務使用者執行，或把 GGUF 複製到可讀路徑並設定 `RERANK_MODEL_PATH`。
- `RERANK_HOST=0.0.0.0` 會開放區網／Tailscale 存取；請只在受信任網路使用，並確認 x570 防火牆允許 11435。
- RTX 5070 Ti 需要支援 Blackwell 的 NVIDIA driver；llama.cpp 需使用 CUDA 12.8+ 建置。

#### x570 開機自動啟動（systemd）

不需要在 x570 clone 整個 repo。若只要安裝 reranker，把部署腳本傳過去執行即可：

```bash
scp scripts/deploy_rerank_systemd.sh x570:/tmp/
ssh -t x570 'sudo bash /tmp/deploy_rerank_systemd.sh'
```

若要一次安裝 chat、embedding 與 reranker 三個 llama-server 服務，請改用 `scripts/deploy_x570_llama_services.sh`（見「x570 開機載入 gemma3:4b、bge-m3、reranker」一節）。

`ssh -t` 是必要的：`sudo` 需要 TTY 才能輸入密碼。若不加 `-t`，會出現 `sudo: A terminal is required to authenticate`。

腳本會：

- 尋找 x570 上的 `llama-server`
- 自動偵測 Ollama 的 CUDA backend（例如 `/usr/local/lib/ollama/cuda_v13/libggml-cuda.so`）
- 設定 `GGML_BACKEND_PATH` 與 `LD_LIBRARY_PATH`，並使用 `--gpu-layers all`
- 從 Ollama 取得 `qllama/bge-reranker-v2-m3:latest` 的 GGUF
- 複製到 `/opt/judgment/models/bge-reranker-v2-m3-q8_0.gguf`
- 建立 `/etc/systemd/system/judgment-reranker.service`
- `systemctl enable --now`，之後 x570 開機自動啟動
- 等待 `/health` 並顯示結果

安裝時會印出 `llama-server devices`；應看到 `CUDA0`／NVIDIA 裝置。若只看到 CPU/BLAS，表示 CUDA backend 沒有載入，請確認：

```bash
ssh -t x570 'sudo journalctl -u judgment-reranker -n 80 --no-pager'
ssh x570 'nvidia-smi'
```

必要時指定 Ollama 的 CUDA 目錄重跑：

```bash
ssh -t x570 'sudo LLAMA_LIB_DIR=/usr/local/lib/ollama:/usr/local/lib/ollama/cuda_v13 bash /tmp/deploy_rerank_systemd.sh'
```

若 `llama-server` 不在常見路徑：

```bash
scp scripts/deploy_rerank_systemd.sh x570:/tmp/
ssh -t x570 'sudo LLAMA_SERVER_BIN=/path/to/llama-server bash /tmp/deploy_rerank_systemd.sh'
```

若需要指定 library 目錄（Ollama 內附 binary 常見）：

```bash
ssh -t x570 'sudo LLAMA_SERVER_BIN=/usr/local/lib/ollama/llama-server LLAMA_LIB_DIR=/usr/local/lib/ollama bash /tmp/deploy_rerank_systemd.sh'
```

常用管理：

```bash
ssh -t x570 'sudo systemctl status judgment-reranker.service'
ssh -t x570 'sudo systemctl restart judgment-reranker.service'
ssh -t x570 'sudo journalctl -u judgment-reranker.service -f'
ssh -t x570 'sudo bash /tmp/deploy_rerank_systemd.sh --uninstall'
```

若 x570 有 ufw，記得開放：

```bash
ssh -t x570 'sudo ufw allow 11435/tcp'
```

啟動後 MBP 的 `/api/status` 會自動顯示 x570 為主要 reranker；目前 `up.sh`／`down.sh` 只管理 MBP 本機 fallback，不遠端控制 x570。

啟動 MBP fallback（launchd，建議）：

MBP 由 `scripts/deploy_rerank_macos.sh` 安裝 per-user LaunchAgent `com.judgment.rerank`，登入後自動以 llama-server 載入 `bge-reranker-v2-m3` 並監聽 `127.0.0.1:11435`；程序持續執行期間模型常駐，崩潰時 launchd 會自動重啟。需要先以 Homebrew 安裝 llama.cpp：

```bash
brew install llama.cpp
bash scripts/deploy_rerank_macos.sh
```

`./up.sh` 若偵測到本機 `/health` 已可用會跳過重複啟動；若 LaunchAgent 已安裝但未執行，會以 `launchctl bootstrap`／`kickstart` 啟動。`./down.sh` 會 `bootout` `com.judgment.rerank`，避免 launchd 立即把程序重新啟動；未安裝 LaunchAgent 時仍使用 `RERANK_START_LOCAL=auto` 的手動啟動路徑。也可以手動前景啟動（在 MBP 上執行）：

```bash
RERANK_HOST=127.0.0.1 RERANK_PORT=11435 ./scripts/rerank_server.sh
```

驗證：

```bash
curl http://x570:11435/health
curl http://x570:11435/v1/rerank \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "bge-reranker-v2-m3",
    "query": "金融消費者保護法如何處理金融消費爭議？",
    "documents": [
      "金融消費者保護法第13條規定金融消費爭議處理程序。",
      "銀行法第33條規定借款利率。"
    ],
    "top_n": 2
  }'
```

`llama-server` 沒有 `ollama ps` 或 `/api/ps`；查詢目前載入的模型與 slot 狀態：

```bash
# 模型路徑、context、slot 數、是否 sleeping
curl -sS http://x570:11435/props | python3 -m json.tool

# 已載入模型、參數量、檔案大小、量化格式
curl -sS http://x570:11435/v1/models | python3 -m json.tool

# 各 slot 是否正在處理請求、目前 prompt token 數
curl -sS http://x570:11435/slots | python3 -m json.tool

# 健康檢查
curl -sS http://x570:11435/health
```

`/metrics` 預設不可用（回傳 501）；需要 Prometheus 指標時，在 service 的 `ExecStart` 加上 `--metrics`。主機層級則用：

```bash
ssh x570 'systemctl is-enabled judgment-reranker; systemctl is-active judgment-reranker'
ssh x570 'systemctl status judgment-reranker --no-pager'
ssh x570 'ps -o pid,etime,%cpu,%mem,rss,cmd -C llama-server'
ssh x570 'nvidia-smi'
```

reranker 是獨立的 `llama-server` 程序，啟動時以 `--model /opt/judgment/models/bge-reranker-v2-m3-q8_0.gguf` 一次載入，沒有 Ollama 的 `keep_alive` 或閒置卸載機制；只要 service 持續執行，模型就會常駐在 RAM／VRAM。用 `scripts/deploy_rerank_systemd.sh` 安裝時已執行 `systemctl enable`，所以正常情況下 x570 開機就會啟動並載入；停止 service 或程序崩潰（`Restart=on-failure` 會重啟）才會重新載入。

#### MBP 開機自動啟動（launchd）

`scripts/deploy_rerank_macos.sh` 會：

- 尋找 Homebrew 的 `llama-server`（必要時先執行 `brew install llama.cpp`）
- 從 Ollama 的 `qllama/bge-reranker-v2-m3:latest` 取得 GGUF，複製到 `~/Library/Application Support/Judgment/models/bge-reranker-v2-m3-q8_0.gguf`
- 建立 `~/Library/LaunchAgents/com.judgment.rerank.plist`
- 以 `--reranking --pooling rank -ngl 99 --ctx-size 8192 --batch-size 2048 --ubatch-size 1024 --no-webui` 啟動，監聽 `127.0.0.1:11435`
- 登入後自動啟動；程序停止或 crash 時 launchd 自動重啟（以 `--uninstall` 或 `launchctl bootout` 停止）
- 等待 `/health` 並實際呼叫 `/v1/rerank` 驗證分數回應；首次啟動可能需要 1–2 分鐘編譯 Metal shader

管理：

```bash
bash scripts/deploy_rerank_macos.sh --status
bash scripts/deploy_rerank_macos.sh --restart
launchctl print gui/$(id -u)/com.judgment.rerank
launchctl kickstart -k gui/$(id -u)/com.judgment.rerank
tail -f ~/Library/Logs/judgment-rerank.log
bash scripts/deploy_rerank_macos.sh --uninstall
```

`RERANK_URL` 預設指向 x570，`RERANK_FALLBACK_URL` 指向 MBP 的 `http://127.0.0.1:11435`；若希望 MBP 本機優先，將 `.env` 的 `RERANK_URL` 改為 `http://127.0.0.1:11435` 並重新啟動後端。移除 LaunchAgent 不會刪除已複製的 GGUF。

啟用設定：

```dotenv
RAG_RERANK_ENABLED=true
RAG_RERANK_CANDIDATES=30
RAG_LAW_VECTOR_ENABLED=true
RAG_LAW_VECTOR_CANDIDATES=30
RAG_LAW_SCORE_THRESHOLD=0.25
RAG_LAW_RRF_K=60
RAG_LAW_DENSE_WEIGHT=0.2
RAG_LAW_ARTICLE_LIMIT=4
RAG_LAW_ARTICLE_LIMIT_LAW_FIRST=6
RAG_LAW_CANDIDATE_ARTICLE_LIMIT=8
RAG_LAW_RERANK_WEIGHT=0.15
RAG_LAW_RERANK_MAX_CHARS=600
RAG_TOP_K=8
RERANK_URL=http://x570:11435
RERANK_FALLBACK_URL=http://127.0.0.1:11435
RERANK_MODEL=bge-reranker-v2-m3
RERANK_PORT=11435
RERANK_LOCAL_HOST=127.0.0.1
RERANK_START_LOCAL=auto
RERANK_OLLAMA_MODEL=qllama/bge-reranker-v2-m3:latest
RERANK_TIMEOUT_SECONDS=3
RERANK_CONNECT_TIMEOUT_SECONDS=0.75
RERANK_MAX_CHARS=1200
```

行為：

- x570 可用時使用 x570；失敗或 timeout 時自動改用 MBP fallback。
- 兩台都失敗時保留原本 Qdrant 排序，只取 `RAG_TOP_K` 筆，回答不會失敗；`retrieval.rerank.status` 會標示 `degraded`。
- `rag.rerank` Flow 會記錄 model、provider、候選數、選用數、top score、fallback 與錯誤。
- `RERANK_MAX_CHARS` 控制每個候選送進 cross-encoder 的長度；BGE v2-m3 實務上建議控制在約 1024–1200 字元/tokens 的量級，避免過長輸入拖慢並降低排序品質。
- 判決候選與法規／命令候選分開 rerank；法規與命令再依 `source_type` 分組，一組失敗不影響另一組，citation 編號維持原流程。

實測 MBP 使用 llama.cpp BGE Q8：

| 候選數 | 每篇約 450 tokens | 耗時 |
| ---: | ---: | ---: |
| 20 | 20 篇 | 約 1.16 秒 |
| 30 | 30 篇 | 約 1.73 秒 |
| 30 | 短文件 | 約 0.24 秒 |

x570 的 RTX 5070 Ti 16GB 會明顯快於 MBP；實際延遲主要由候選文件抓取與網路 hop 決定。

### RAG 速度調校（10 秒內）

實測 RAG 的主要耗時在 LLM（27B 模型約 30–50 秒），embedding 與 Qdrant 檢索通常低於 1 秒。目前快速設定：

```bash
ollama pull gemma3:4b
```

```dotenv
LLM_MODEL=gemma3:4b
LLM_NUM_CTX=8192
LLM_NUM_PREDICT=384
LLM_KEEP_ALIVE=-1
RAG_TOP_K=4
RAG_MAX_CONTEXT_CHARS=4000
RAG_RERANK_ENABLED=true
RAG_RERANK_CANDIDATES=30
RERANK_URL=http://x570:11435
RERANK_FALLBACK_URL=http://127.0.0.1:11435
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
- `LLM_KEEP_ALIVE=-1` 讓 Ollama 永久保持模型載入，避免第一次請求反覆載入造成延遲。

#### x570 開機載入 gemma3:4b、bge-m3、reranker（llama-server systemd）

x570 現在以 llama-server 作為主要推論服務，開機由三個 systemd unit 常駐載入，Ollama 只保留作為備援與模型來源：

| 服務 | 模型 | 連接埠 | OpenAI 相容端點 |
| --- | --- | ---: | --- |
| `judgment-llm-chat.service` | `gemma3:4b` | `11436` | `/v1/chat/completions` |
| `judgment-llm-embedding.service` | `bge-m3` | `11437` | `/v1/embeddings`（1024 維） |
| `judgment-reranker.service` | `bge-reranker-v2-m3` | `11435` | `/v1/rerank` |

安裝前先確認 x570 已由 Ollama 下載三個模型（安裝腳本會取出 GGUF 並複製到 `/opt/judgment/models`）：

```bash
ssh -t x570 'ollama pull gemma3:4b && ollama pull bge-m3:latest && ollama pull qllama/bge-reranker-v2-m3:latest'
```

從 MBP 一鍵部署（scp + ssh + sudo + 遠端驗證）：

```bash
bash scripts/deploy_x570_llama_services.sh
```

只安裝 chat／embedding、不碰 reranker：

```bash
bash scripts/deploy_x570_llama_services.sh --skip-rerank
```

移除三個服務（Ollama 與模型檔保留）：

```bash
bash scripts/deploy_x570_llama_services.sh --uninstall
```

SSH 不可用時，腳本會嘗試 Taildrop 把安裝檔送到 x570，並印出要在 x570 手動執行的指令。也可以直接手動執行：

```bash
scp scripts/deploy_llama_services_systemd.sh x570:/tmp/judgment-llama-services.sh
ssh -t x570 'sudo bash /tmp/judgment-llama-services.sh'
```

安裝腳本會：

- 尋找 x570 上的 `llama-server`（也接受 `LLAMA_SERVER_BIN`），偵測 Ollama 的 CUDA backend（`libggml-cuda.so`）並設定 `GGML_BACKEND_PATH`
- 從 Ollama 取出 `gemma3:4b`、`bge-m3:latest`、`qllama/bge-reranker-v2-m3:latest` 的 GGUF，複製到穩定路徑
- 建立三個 systemd unit：chat 使用 `--alias gemma3:4b --ctx-size 24576 --parallel 4`（每個 slot 6,144 tokens）；embedding 使用 `--embedding --pooling cls`；reranker 使用 `--reranking --pooling rank`；三者皆 `--gpu-layers all`
- 2026-11-17 修正 chat context：先前 `--ctx-size 4096` 會讓 4,292–4,652 token 的 RAG prompt 回 `HTTP 400 exceed_context_size_error`。目前 x570 是總池 24,576、4 slots，應用端 `LLM_NUM_CTX` 必須是 **每 slot 的 6,144**，不是 24,576。
- 調整 context 時，先確認 `/props` 的 `n_ctx` 與 `total_slots`，再設定：

  ```bash
  bash scripts/set_x570_llm_context.sh 24576   # server 總池；--parallel 4 時每 slot 6,144
  bash scripts/apply_local_llm_context.sh 6144  # .env 的每 slot 預算
  ```

  不要把 `LLM_NUM_CTX` 設成 24,576；啟動探測的 `min(LLM_NUM_CTX, /props n_ctx)` 不會自動除以 slot 數，超額請求會在 llama-server 端失敗。
- Token 估算已改為保守值（中文接近一字一 token，不再用 `chars // 3`）；超過 `num_ctx * 0.9 - num_predict` 時會先丟棄／截斷 context。trace 會記錄 `prompt_tokens_estimated`、`input_tokens`、estimate/actual 比例；實際超過或達到 98% context 會標記失敗並走 fallback，不再靜默接受。
- 後端啟動時會讀 llama-server `/props` 的 `default_generation_settings.n_ctx`，以 server 實際值作為上限；若與 `LLM_NUM_CTX` 不一致會在啟動日誌 warning。這個值是總池或 slot 值取決於 llama-server 的啟動參數，因此 `LLM_NUM_CTX` 仍應以每 slot 預算為準。
- `systemctl enable` 三個 unit，之後 x570 開機自動載入
- 停用 `judgment-ollama-preload.service`，避免 Ollama 與 llama-server 重複占用 VRAM（`ollama.service` 仍保留）
- 等 `/health` 就緒後，實際呼叫 chat、embedding（檢查 1024 維）與 rerank 端點

驗證：

```bash
curl -sS http://x570:11436/v1/models | python3 -m json.tool
curl -sS http://x570:11437/v1/models | python3 -m json.tool
curl -sS http://x570:11435/health
ssh x570 'systemctl is-enabled judgment-llm-chat judgment-llm-embedding judgment-reranker'
ssh x570 'systemctl is-active judgment-llm-chat judgment-llm-embedding judgment-reranker'
```

重新開機後再執行以上指令，即可確認三個模型是由 llama-server 在開機時載入，而不是 Ollama 預載。`llama-server` 沒有 `keep_alive`；三個 service 持續執行期間模型就常駐，行為等同 Ollama `keep_alive=-1`，且不會閒置卸載；`Restart=on-failure` 會在崩潰後重新載入。

x570 防火牆若使用 ufw：

```bash
ssh -t x570 'sudo ufw allow 11435/tcp && sudo ufw allow 11436/tcp && sudo ufw allow 11437/tcp'
```

MBP 的 `.env` 對應設定：

```bash
LLM_URL=http://x570:11436
LLM_API=openai
LLM_MODEL=gemma3:4b
LLM_FALLBACK_URL=http://127.0.0.1:11436
LLM_FALLBACK_MODEL=gemma3:4b
LLM_FALLBACK_API=openai
EMBEDDING_URL=http://x570:11437
EMBEDDING_API=openai
EMBEDDING_MODEL=bge-m3
EMBEDDING_FALLBACK_URL=http://127.0.0.1:11437
EMBEDDING_FALLBACK_API=openai
```

`up.sh` 會自動探測 x570 llama-server：`11436`／`11437` 可用時設為主要 API、MBP llama-server 為 fallback；x570 llama-server 未就緒時改用 MBP llama-server。Ollama 不再作為 runtime fallback。

舊的 Ollama 預載腳本仍保留，但不再是 x570 的主要路徑；只有在暫時不想使用 llama-server 時才需要重新啟用：

```bash
ssh -t x570 'sudo systemctl enable --now judgment-ollama-preload.service'
```

注意：這是 x570 的舊 Ollama 路徑，只在手動啟用時使用；MBP 現在以 llama-server 作為 fallback，不再依賴 Ollama。llama-server 不使用 `keep_alive`，模型是否常駐由 service 決定。

#### MBP 開機啟動 gemma3:4b、bge-m3（llama-server launchd）

MBP 的 chat 與 embedding fallback 由 llama-server 提供，不再由 Ollama.app 預載：

- `com.judgment.llm-chat`：`gemma3:4b`，`127.0.0.1:11436`
- `com.judgment.llm-embedding`：`bge-m3`，`127.0.0.1:11437`
- `com.judgment.rerank`：`bge-reranker-v2-m3`，`127.0.0.1:11435`（由 `scripts/deploy_rerank_macos.sh` 安裝）

安裝 chat 與 embedding：

```bash
bash scripts/deploy_llama_services_macos.sh
```

腳本會：

- 從 Ollama 的 GGUF blob 複製（APFS clone，不重複佔用磁碟）到 `~/Library/Application Support/Judgment/models/`
- 建立 `com.judgment.llm-chat.plist` 與 `com.judgment.llm-embedding.plist`
- 以 `launchctl bootstrap`／`kickstart` 立即啟動，之後登入自動執行
- 等待 `/health` 就緒，並確認 `/v1/models` 有 `gemma3:4b`／`bge-m3`
- 兩個服務都只監聽 `127.0.0.1`，不會暴露到區網

驗證：

```bash
bash scripts/deploy_llama_services_macos.sh --status
curl -s http://127.0.0.1:11436/health
curl -s http://127.0.0.1:11436/v1/models | python3 -m json.tool
curl -s http://127.0.0.1:11437/v1/models | python3 -m json.tool
```

管理與移除：

```bash
launchctl kickstart -k gui/$(id -u)/com.judgment.llm-chat
launchctl kickstart -k gui/$(id -u)/com.judgment.llm-embedding
bash scripts/deploy_llama_services_macos.sh --uninstall
```

注意：

- 兩個模型常駐約使用 3.4 GB 記憶體（gemma3:4b 約 2.3 GB、bge-m3 約 1.1 GB）。
- `scripts/deploy_ollama_preload_macos.sh` 是舊的 Ollama 預載路徑，會啟動 Ollama.app；已不再使用，請勿再執行。
- `qllama/bge-reranker-v2-m3` 只保留在 Ollama 模型庫作為 GGUF 來源，不再載入 Ollama runtime；rerank 由 MBP 的 llama-server LaunchAgent 提供。

#### MBP Web 主控台開機自動啟動（launchd）

`scripts/deploy_web_macos.sh` 會建立 `com.judgment.web`，讓 MBP 重新登入後不必手動執行 `./up.sh`，Cloudflare tunnel 才不會在重開機後失去 origin：

- 登入後執行 `scripts/mbp_web_autostart.sh`
- 先等待 Docker daemon（OrbStack／Docker Desktop 可能還在啟動）最多 180 秒
- 再執行 idempotent 的 `./up.sh`：已在執行的後端、reranker、容器不會重複啟動
- `up.sh` 會依序確認 PostgreSQL／Qdrant、探測 x570 與 MBP llama-server、啟動 `127.0.0.1:9200` 後端
- 只在登入時執行一次，沒有 `KeepAlive`；`up.sh` 失敗時不會每 30 秒重試
- 日誌：`~/Library/Logs/judgment-web-autostart.log` 與 `.run/web.log`

安裝與驗證：

```bash
bash scripts/deploy_web_macos.sh
bash scripts/deploy_web_macos.sh --status

# 冷啟動測試：停掉後端，確認 LaunchAgent 會把它拉回來
tmux kill-session -t judgment-web
launchctl kickstart -k gui/$(id -u)/com.judgment.web
curl -s http://127.0.0.1:9200/api/health
```

管理與移除：

```bash
bash scripts/deploy_web_macos.sh --restart
launchctl print gui/$(id -u)/com.judgment.web
tail -f ~/Library/Logs/judgment-web-autostart.log
bash scripts/deploy_web_macos.sh --uninstall
```

`--restart` 會先停止現有的 `judgment-web` session，再讓 LaunchAgent 重新執行 `./up.sh`，所以可用來套用 `.env` 變更；單純 kickstart 會因為 `up.sh` 的 idempotent 檢查而保留舊後端。

`com.judgment.web` 只負責後端與容器；Cloudflare tunnel 由另一個 LaunchAgent `com.cloudflare.cloudflared` 管理，tunnel ingress 指向 `http://127.0.0.1:9200`。

### 本階段驗證

- `uv run pytest`：734 tests pass（含靜態資源、首頁即時摘要 API／99 條金融法規 11 欄列表／首頁 Pipeline waterfall／管理權杖與 CORS／Ollama SSRF allowlist／Docker loopback 綁定、設定選項 sidebar／字型大小控制與 standalone bundle、通用 SSE refresh stream 初始事件與變更推送／DB 聚合簽章、processing SSE 初始完整 snapshot／後續 state-driven live payload／importer Unix socket progress event／金融案件累計數與佔比／首頁與資料庫／處理總覽判決金融覆蓋統計／判決向量索引 Pipeline host/model 與階段耗時／索引 workflow waterfall 與目前月份／active collection 月份覆蓋合併／續跑索引逐月份合併先前 run 的 R/E 計數（含 live payload）／Reranker 服務測試與 test-mode Reranker 階段／法規命令 D／P／I 索引版本時間表／法院名稱正規化待更新 badge／法院歷史機關名稱與 JID 行政訴訟代碼正規化／法規索引與完整更新套用 UI embedding 主機模型／更新 notice 來源與機制／workflow 執行中按鈕停用與進度表保留／RAG 列表查詢資料庫提示／filter 命中訊息清理／SQLite WAL journal／Phase 1 JSONL 遷移／Last-Event-ID replay／SQLite WAL state checkpoint 與 JSON 遷移／shared journal tailer 多 instance fan-out／event idempotency 與 schema validation／importer journal fallback／state/event DB 權限 0600／event metrics endpoint／snapshot bootstrap cache／前端 rAF 批次／filter 與 PostgreSQL 階段訊息及月份進度／準備階段不提前移動月份圈選、Phase 4 法規索引 freshness／判決 stale 偵測／RAG regression gate、處理總覽法規／命令／判決三張四階段月份時間表／下載時間版本編號／Embedding 主機模型選擇器／法規索引即時進度與累計平均速率／判決匯入 archive 進度百分比／workflow 流程進度百分比與累計平均速率／判決匯入月份圈選維持最高已啟動月份不前後跳動／處理中月份與外框月份分離時保留實際階段／可沿用 Parquet 備份時 RAR 與備份階段維持綠色不重設／啟動時一次掃描 raw manifest 並批次跳過已備份 archive／下載檔案變更時使舊 manifest 失效／prefetched 備份不提前移動目前匯入外框／原始 Parquet 備份建立與沿用訊息／篩選與 PostgreSQL 月份 archive 訊息／舊 run 階段名稱沿用目前 catalog 顯示名稱／失敗原因與解法 tooltip、服務狀態、系統資源使用、Qdrant 容器掛載與 volume、索引版本與 alias、Ollama 主機探測／優先順序持久化／多主機 embedding 備援／chat model 切換偏好／測試失敗狀態、RAG Pipeline span 時間與 Token／TTFT、BGE reranker 排序／主備切換／degraded fallback／Flow metadata、法規優先題型／related-laws 誤判／銀行法從業人員條文選擇／law-first citation 順序、判決引用條號與項次擷取／條號「之」與連字號正規化、法規條文向量索引全量／增量／alias 狀態／章節標題排除／embedding 批次自動拆分／dense+BM25 融合／法規 rerank／向量缺失 fallback、索引 run 的 `ollama`／`qdrant`／`validate` 階段與月份檔案進度、active collection 月份覆蓋 fallback、判決匯入月份時間表／有更新判定、法院名稱檢查月份表、條文歷史狀態月份表、索引進度條、embedding fallback、法規／判決 catalog、PostgreSQL／Parquet／Qdrant 查詢、判決篩選匯入、判決下載與月份狀態、待補齊續傳／驗證游標／失敗重試／Range 續傳／validator 變更／非時段下載／proxy 單一下載鎖／部分完成結束碼、混合版本備份／snapshot／舊版全文／Parquet delta／Qdrant history collection／舊 DB migration／dry-run 無副作用／current 查詢排除歷史、法規／命令線上更新檢查／指定來源檢查／更新紀錄表／下載日期資料夾／錯誤保留更新狀態、workflow 各階段進度與整體加總、DuckDB 原始 Parquet 品質統計、法規條文版本與變更事件、法院正規化與回填、判決向量索引、索引效能統計與圖表資料、索引進度條 10×100 格渲染、資料處理工作流程 catalog 與啟動 endpoint、法規概念展開／條號 regex／BM25 條文排序、題庫版本／人工驗收／stale 驗證／benchmark suite、RAG benchmark 指標、RAG 串流處理流程與逐步輸出、RAG 引用驗證、效能 Flow 與 client timing、測試模式與測試 Flow、判決 Parquet 匯出與原判決讀取、單一法規報表、單一條文篩選、判決原文報表、電源控制器、request validation、CORS 設定與 standalone frontend）。
- pytest 效能：macOS 對未解析的 `.test` 主機每次 `getaddrinfo` 會等待約 30 秒，原本 4 個 Ollama 主機測試因此佔用約 210 秒；`tests/conftest.py` 將 `.test` 解析為 loopback 後，全套由約 226 秒降至約 17 秒。IP 字面位址與真實主機名稱仍使用系統解析器，並保留 hostname 解析到 metadata IP 時阻擋的測試。
- P0 安全驗證（demo 關閉時）：`Origin: https://evil.example` 不回傳 CORS 允許；非 loopback 未帶權杖回 401、正確權杖回 200；Qdrant 未帶 key 回 401、帶 key 回 200；Docker ports 僅 `127.0.0.1`；PostgreSQL 只綁 loopback，連線密碼由環境設定提供；`file:///…/frontend/index.html#/home` 與 `#/tests` 正常載入，390px 無水平溢出，console error 為 0。
- `uv run ruff check .`：clean。
- 實際資料（2026-11-21）：1,351 筆法規、10,454 筆命令、222,126 條文；法規／命令原始 Parquet 目前由 manifest 管理，實際檔案數與大小以 `/api/status` 為準。
- 法規／命令條文向量索引：11,805 部法規／命令、222,126 條可檢索條文，`bge-m3` 1,024 維；Qdrant `legal_articles_v006` 由 `legal_articles_current` alias 提供。判決索引為 `judgments_v005`（4,714,967 筆），兩個 collection 完全分開。
- 法規／命令混合檢索實測（2026-11-13）：「銀行法對從業人員有那些規定？」為 `law_first`，`retrieval.law_vector.status=ok`（30 個候選）、`law_rerank.status=ok`（x570），選出銀行法第 35、35-2、125-2、35-1、127-2、18 條與 1 筆輔助判決；「證券交易法對內線交易有什麼規範？」先取第 157-1、171 條；「損害賠償責任如何認定？」在沒有明確法規名稱時由 dense 找到民法與國家賠償法；「有哪些法規和壽險及產險相關？」維持結構化清單，`law_vector`／`law_rerank` 為 `skipped`，約 0.35 秒。
- 判決原始檔：`data/judgments/raw_rar/` 目前有 371 個 archive，manifest 記錄的壓縮大小約 45 GB；`download_manifest.json` 以執行時掃描結果為準，不固定月份數。欄位包含 `files`（以 fileset ID 為鍵）、`months` 陣列、`backfill`（待補齊月份、續傳起點、驗證游標、失敗紀錄與上次停止原因）與 `history_files`（移至 `raw_rar/history/` 的舊版容器 metadata）。
- 判決匯入：目前 PostgreSQL current 判決 4,714,967 筆；raw manifest 為 371 個 archive、22,881,015 筆。歷史匯入批次與耗時保留在 `performance_records`；實際筆數以 `/api/home` 為準。
- 原始判決 Parquet：由 371 個 archive 產生並由 manifest 管理；以 `jid` filter 單筆讀取後解析 `raw_json`，點擊 RAG 引用卡標題可開啟完整判決 dialog，並保留 PDF 連結。實際檔案數與大小以 `/api/status` 為準。
- 判決法院正規化：4,714,967 筆 current 判決全部有 `court_normalized`，目前資料對應 44 個標準法院，0 筆未解析，原始 `court` 保留；程式定義 44 個標準名稱（含歷史法院與司法院冤獄賠償／刑事補償法庭）。
- 判決向量索引：已完成全量 4,714,967 筆（1,024 維、`bge-m3`）；Qdrant `judgments_v005`（`judgments_current` alias）與 PostgreSQL `judgment_vector_index` coverage 4,714,967 / 4,714,967＝100%。正式查詢使用 `judgments_current` alias，後續版本以 Blue-Green collection 建置。
- 全量索引已完成：一般 RAG 的語意候選涵蓋全部 4,714,967 筆；PostgreSQL 關鍵字／條件查詢、法規與引用統計、Parquet 全文快照仍可獨立使用。
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
- 以 Playwright 驗證內線交易問題：法規／命令檢索結果列出 `證券交易法` 第 157-1 條與第 171 條，點擊任一條文會開啟該條完整內容；點擊「命中詞彙」的 `證券交易法` 會開啟 229 條全文 dialog；上方已顯示法規結果時不再重複下方的法規來源卡，390px 無水平溢出、0 console error。
- 以 Playwright 驗證全站法規跳轉一致性：RAG 判決卡只在標題／metadata 區開啟判決，點擊摘要不再觸發；判決卡以判決實際引用顯示 `公司法第8條第3項`、`銀行法第125條第1項、第3項` 等 chips，點擊可開啟對應條文；判決 dialog 內的引用 chips 同樣可開啟法規全文；法規 dialog 提供「跳至第幾條」輸入，實測可跳至並標示第 171 條。資料頁判決報表的命中法規名稱也可點擊開啟完整法規報表，該報表同樣具備條文跳轉與標示。
- 以 Playwright 驗證 Qdrant 資料頁：語意查詢、Top K、相似度門檻、相似度／案號／法院／案由／裁判日期／命中法規欄位、點選案號開啟判決原文，以及返回後查詢條件保留；RAG 頁驗證索引覆蓋率、4 筆判決引用與引用編號，狀態頁驗證 Qdrant／Embedding／RAG／LLM 均為正常；390px 無水平溢出、無 console error。
- 以 Playwright 驗證狀態頁 sidebar：8 個分類切換（服務總覽、系統測試、系統資料使用、Model Provider、前後端架構、資料版本、API 端點、最近下載）；服務總覽顯示「服務總覽載入 Pipeline」waterfall，包含頁面初始化、HTTP 往返、`/api/status` 後端 11 個檢查階段與彙整階段，索引鮮度約 3.3 秒為最慢階段；展開狀態在重新整理後保留；前後端架構顯示 Client、Application、Pipelines、Data 四層目前元件與 SVG 流程方向示意圖，REST／SSE／RAG／workflow／資料讀寫／排程／IndexedDB 方向與圖例可見；資料版本顯示 hero、100% 覆蓋圓環、判決索引待補 0 筆、PostgreSQL 資料版本、IndexedDB 本機資料、判決／法規索引與 Parquet 五張卡片與目前 alias／collection／模型資訊；API 端點由 FastAPI route table 載入 100 個端點、9 個分類，GET／POST／PATCH／DELETE 統計與 Swagger／OpenAPI 連結正常；`file:///…/frontend/index.html#/status` standalone frontend 亦顯示相同內容；系統資料使用顯示 CPU／RAM／Swap、Docker 2 個容器、PostgreSQL／Qdrant 資源與磁碟空間；390px 無水平溢出、無 console error。
- 效能 Flow 實測：快速 profile 的 RAG 請求產生約 20 段 Flow，包含 `http.request`、`rag.answer_question`、`rag.embed_query`、`rag.qdrant_search`、`rag.fetch_documents`、`rag.llm`、`rag.validate_citations` 與 `client.render`；`summary.models` 為 `bge-m3`、`gemma3:4b`。伺服器端 LLM 區段約 1–4 秒，前端 client 全流程與伺服器總耗時接近。時間軸以每個點位的 `started_at` 顯示開始時間，主要數字為「本點到下一點」區間；「累計」採流水線累加，例如 `http.request` 顯示 1 ms 並累計 1 ms，`rag.coverage` 顯示 30 ms 並累計 32 ms，`rag.llm_request` 顯示 2.9 s，最後 `client.render` 才累計到整體 3.9–4.0 秒。
- 以 Playwright 驗證效能 Flow 頁：模型篩選、21 段巢狀時間軸、每點實際開始時間、點到點區間、流水線累計、module／function／params、時間軸比例條、模型統計、最慢區段、Flow JSON 展開、390px 無水平溢出與 0 console error。
- 以 Playwright 驗證設定選項 sidebar：桌機開啟後 sidebar 寬 380px，header／main／footer 右緣同步內縮；「字型大小」只列出目前頁面出現的區塊，滑桿與數字輸入會即時改變頁面 font size；滑鼠移到「表格內容」時所有表格 cell 出現紅色 `#ef4444` outline 與半透明背景，移出後完全移除；儲存後重新載入仍保留，取消與直接關閉會回到上次儲存值，回復預設值後儲存會清除本機覆寫；切換「暗」後 body 背景為 `#0b0f14`、文字為 `#eef3f8`，切換「亮」後 NVIDIA 回到 `#ffffff`、Linear 回到主題原始的 `#010102`，切換「系統」在 dark color scheme 下解析為 dark 並保留 `system`；390px 開啟 sidebar 無水平溢出、無 console error。
- 以 Playwright 驗證十種主題切換與持久化、介面風格項目以各主題 header 樣式呈現、每個項目包含對應的作用中按鈕預覽（NVIDIA 綠底黑字、IBM 藍底白字、Linear 深灰底白字）、header 無獨立調色盤按鈕、四個頁面、法規／判決類別切換、判決命中法規查詢、匯入紀錄查詢、查詢報表、法規明細、判決原文與返回流程、服務狀態與 390px 行動版；無 console error、無失敗請求、無水平溢出。
- 以 Playwright 驗證資料處理頁工作流程 sidebar：10 個項目（總覽＋9 個流程，含法規／命令索引）、不再顯示重複的「資料更新（完整）」、選取「判決下載」顯示程式 `judgment-download`、Shell／入口 `src/judgment/judgment_download.py`、實際命令與執行按鈕；桌面 1300px 與行動版 390px 均無水平溢出、0 console error。
- 以 Playwright 驗證處理總覽：三張時間表（法規、命令、判決）、法規／命令顯示 2026-10 與 2026-11 的四階段狀態、判決顯示 369 個月與四段格子、綠／紅／灰／空白語意、目前版本與目前匯入列、390px 無水平溢出、0 console error；「判決匯入」面板月份表顯示四階段方格（RAR 檢查／解壓縮、原始資料檢查／Parquet 備份、金融法規篩選、PostgreSQL metadata）、目前月份灰色階段與 summary；「法規／命令索引」「判決匯入」「Qdrant判決向量索引版本建置」面板的 Embedding 主機／模型按鈕列列出 `x570:bge-m3:latest`、`mbp:bge-m3:latest`，且不再顯示主機卡片或拖移箭頭。
- 以 Playwright 驗證判決法院正規化：下拉選單只有 44 個標準法院＋全部、無重複或髒值，以標準名稱篩選／排序／開啟原文皆一致，返回查詢結果後條件與資料列保留。
- 以 Playwright 驗證 `file://frontend/index.html`、系統測試頁的 API 連線測試／儲存流程，以及靜態主機（含 `?api=` 覆寫）的跨來源 API 呼叫。
- 以 Playwright 驗證系統測試：`#/status` 的「系統測試」分類與 `#/tests` 路由、API 表單、測試模式 ON/OFF 切換、模型清單、測試 Flow、RAG 頁測試模式提示，以及 `/api/test-mode` 狀態一致；後端電源改由 `./up.sh`／`./down.sh` 管理。
- 以 Playwright 驗證測試模式 RAG：4 個 LLM 全數執行、耗時 149 秒、無前端 timeout，回答卡顯示 `test_run` 與「查看測試 Flow」連結。
- 以 Playwright 驗證測試流程圖表：問題、RAG 答案、每步驟 module／function、`test-runs` SSE 即時推送更新、12 個子程序進度條（1 embedding + 1 retrieval + 1 rerank + 1 context + 4 LLM + 4 validation）、失敗模型紅色 bar、總流程進度與依階段時間 bar、歷史選單還原舊 Flow、390px 與 0 console error。
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
- Qdrant、Embedding、RAG 回答管線與 LLM 未設定或離線時，主控台會明確標示 `preview`、`not_configured`、`unavailable`、`not_indexed`、`degraded` 或 `retrieval_only`；RAG 只會顯示可驗證的檢索結果或法規內容，不會生成虛構答案。
- 判決向量索引需要 PostgreSQL、Qdrant 與 Ollama；全量 4,714,967 筆已完成，後續增量以 `--build-version --activate` 或 `scripts/run_scheduled_update.sh` 執行，也可用 `--stride` 建立抽樣索引。
- 本階段 Web 查詢涵蓋法規／命令、已篩選判決、Qdrant 向量檢索與效能紀錄；RAG 回答會標示引用編號並可回到判決原文，但不是法律意見。
