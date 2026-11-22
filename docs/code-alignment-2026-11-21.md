# Code Alignment Snapshot — 2026-11-21

> 這份文件是目前程式與部署狀態的對照基準。**程式碼是唯一事實來源**；本文件只記錄 2026-11-21 當下可重現的程式、設定與資料快照。會隨資料變動的數字，使用前仍應以 API 回傳值為準。

## 1. Runtime 與測試

| 項目 | 目前值 |
|---|---|
| Python | `>=3.10`；本機 `.python-version` 為 3.12 |
| pyarrow | `25.0.1` |
| pytest | `9.2.0` |
| 測試 | `uv run pytest -q`：697 tests pass |
| Lint | `uv run ruff check .`：clean |
| CI | pytest、ruff、frontend build、pip-audit、gitleaks 全歷史、Syft SBOM |
| pip-audit | 無已知 advisory，CI 無 `--ignore-vuln` |
| gitleaks | 8.24.3，`--log-opts=--all`；0 credential leaks |
| esbuild | `0.28.2` |
| Docker images | PostgreSQL 16.15、Qdrant 1.19.1，皆以 digest 固定 |

CI 尚未完成：GitHub Actions commit SHA pinning、`persist-credentials: false`、`uv sync --frozen`、`main` branch protection。詳見 `specs/security/supply-chain.md`。

## 2. 目前資料快照

以下為 2026-11-21 `/api/home` 與 `/api/status` 的回傳值；資料更新後可能變動。

| 項目 | 目前值 |
|---|---:|
| 法規 | 1,351 |
| 命令 | 10,454 |
| 法規／命令條文 | 222,126 |
| current 判決 | 4,714,967 |
| raw 判決 | 22,881,015 |
| raw archive | 371 |
| 金融判決佔比 | 20.6% |
| 判決向量索引 | `judgments_v005`、version #7、4,714,967 / 4,714,967（100%） |
| 法規向量索引 | `legal_articles_v006`、version #9、222,126 points、1,024 維 |

文件中的舊數字（例如 4,681,502、`judgments_v003`、version #5）是歷史快照，不代表目前狀態。README 與 current-state spec 應以本節或 API 為準；dated benchmark 報告保留當時數據，不應改寫成現在的數字。

## 3. Demo mode

- DB 表：`demo_settings`；六個 feature flags：`rag`、`data`、`quality`、`performance`、`processing`、`status`；`home` 為隱含功能。
- 目前執行狀態是動態的，存在 `demo_settings`；不要用文件硬編碼「開啟」或「關閉」。
- 狀態 API：`GET /api/demo/status`；管理 API：`GET /api/admin/demo`、`PUT /api/admin/demo`、`POST /api/admin/demo/close`。
- 訪客 route allowlist 以 `src/judgment/web/demo_policies.json` 為唯一來源，目前 17 條：

```text
GET  /api/catalog
GET  /api/data/suggest
GET  /api/demo/processing
GET  /api/demo/quality
GET  /api/home
GET  /api/judgment
GET  /api/law
GET  /api/performance
GET  /api/processing
GET  /api/quality
GET  /api/rag/share/{share_id}
GET  /api/schema/suggest
GET  /api/status
POST /api/query
POST /api/rag/query
POST /api/rag/query/stream
POST /api/rag/share
```

- `GET /api/question-bank/*`、`GET /api/performance/options`、`GET /api/processing/plan`、`GET /api/processing/active`、`GET /api/updates/status`、`GET /api/courts/check`、`GET /api/law-versions/check`、`GET /api/judgment-download/status` 都是 admin-only，不在 demo allowlist。
- Demo 限流預設：RAG 10/min、60/hour、200/day，另有每日 400 次與 1,000,000 token 預算；query 20/min、200/hour、500/day；poll 120/min、3,000/hour、20,000/day。設定在 `src/judgment/config.py`。
- Demo visitors 的 `POST /api/query?database=postgres`、`GET /api/data/suggest`、`GET /api/judgment`（postgres）、`GET /api/law`、`GET /api/schema/suggest` 全部使用 `demo_reader`；未設定時 fail closed。`demo_reader` 為 `NOSUPERUSER NOCREATEDB NOCREATEROLE`、`default_transaction_read_only=on`；`law_documents`／`law_article_versions`／`law_article_change_events` 為 table-level SELECT，`judgment_documents` 與版本／下載／匯入表為 column-level SELECT；不授權 `source_archive`、`import_run_id`、`parquet_path`、`zip_path`、`error_message` 等內部欄位。`/api/query` 對 demo 會排除 `DEMO_HIDDEN_QUERY_COLUMNS`。

## 4. RAG 法規／判決範圍

- 裸法規名稱或簡介問題（例如「證券交易法」、「刑法」、「介紹銀行法」）回傳結構化法規簡介：立法目的、主管機關、章節架構、核心條文；不呼叫 LLM，也不列判決。
- 官方名稱有「中華民國」前綴時，支援常用簡稱（例如「刑法」→「中華民國刑法」）。
- 判決 RAG 只處理與 `documents/金融法規.md` 的 99 項金融相關法規有關的問題。若問題與清單及金融詞彙無關，回傳 `answer_source=notice`、`retrieval.status=not_financial`，提示「本RAG提問功能主要以金融相關判決為主」，不生成判決回答。
- RAG 回答完成後，問題泡泡與回答卡提供 hover／focus 操作工具列：問題可複製、分享、編輯、重新提問；回答可複製、分享、重新生成。觸控裝置固定顯示按鈕；編輯會帶入目前可見的提問輸入框（對話中為下方續問框）。分享會先將目前對話（最多 30 輪、1 MB）寫入 PostgreSQL `rag_share_snapshots`，直接複製專屬公開連結 `#/rag/share?contentId=<token>`；舊版 `?share=`／`?q=` 查詢參數仍可讀取，但新連結不再使用。開啟後優先讀取快照並渲染完整對話，不重新呼叫 LLM。分享頁加上 `.is-shared-view`，保留一般 RAG 雙欄版面與左側 `.rag-library`；只以 `display:none` 隱藏 `.rag-workspace-toolbar`。分享／複製完成後會釋放按鈕焦點並顯示「已複製公開連結」toast。RAG 工作區右上 `.rag-workspace-toolbar` 提供「分享給朋友」按鈕（以 Web Share API 開啟系統分享選單並帶入 `https://judgment.ragdemo.win`；不支援時複製連結）、三點選單（重新命名、釘選對話、刪除、移至專案）與建立公開連結按鈕；`.is-shared-view` 會隱藏整個工具列。RAG 檢索狀態卡預設收合，只顯示綠色狀態 icon、標題、模型數與 chevron；`is-expanded` 時才顯示說明與 `.rag-model-strip`。模型表文字為 12px；Chat／Embedding／Rerank 的 active 皆為 x570、fallback 皆為 MBP，優先順序 x570 > MBP。快照保留 7 天、回應 `Cache-Control: no-store`。全站分頁標題由 `utils.js` 的 `SITE_TITLE` 統一提供，值為短版「Judgment｜金融法律判決 RAG AI 智慧分析平台」（29 字元），路由切換、展示模式鎖定與頁面非同步 `setTitle()` 都不會覆寫；靜態 `<title>` 使用相同短版，`meta description` 與 Open Graph／Twitter 描述保留完整站點簡介。Header 品牌圖形為天平＋三個電路節點的 inline SVG，搭配襯線體 `JUDGMENT` 與等寬體 `LEGAL RAG INTELLIGENCE`；`favicon.svg` 使用相同圖形與 `#76b900` 品牌綠。RAG 工作區工具列的完整設計與公開分享契約見 `specs/004-web-console/rag-workspace-toolbar.md`。

## 5. Auth／security 現況

- 管理員：`solo4study@gmail.com` Google session，或 `X-Judgment-Admin-Token` break-glass token。
- Session：HttpOnly signed cookie，TTL 7 天（`AUTH_SESSION_TTL_SECONDS=604800`），production `SameSite=Lax`；token 含 `jti`，logout 會寫入 server-side 撤銷清單，重播已登出 cookie 會失效；尚無全裝置撤銷與短 TTL。
- `JUDGMENT_ADMIN_TOKEN` 與 `AUTH_SESSION_SECRET` 已於 2026-11-21 輪替；舊值失效。
- 管理 token 存在瀏覽器 `sessionStorage`，舊 `localStorage` 值會遷移並刪除。
- SSE ticket：60 秒、一次性 `jti`、綁 client IP（IPv6 /64）與 principal binding；access log 會將 `ticket`、OAuth `code`／`state` 等敏感 query 遮蔽為 `[redacted]`。ticket store 在記憶體，重啟後最多重新開放 60 秒 replay 窗口。
- CSP 已 enforce；有 `X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`；`report-uri` 已接 `/api/csp-report`，`report-to` 尚未設定。CSP 仍允許 Google Fonts 與 production `connect-src` 的 localhost。
- 未完成：SESSION-01 全裝置撤銷／短 TTL、AUDIT-01、HSTS 延長、`report-to`、PRIV-01。DB-ROLE-01 已完成主應用降權。
- HIST-01：gitleaks 全歷史 0 credential leaks；但 public history 仍有主機名稱／port。

## 6. 查詢索引

- `judgment_documents` 已有五個 `pg_trgm` GIN indexes：`jid`、`court`、`court_normalized`、`title`、`matched_laws_text`，合計約 401 MB。
- 這些是 `/api/query` keyword filter 實際使用的欄位；`full_text` 沒有建立 trigram index（會約 40 GB，且 2 字中文詞沒有明顯加速）。
- 建立腳本：`scripts/create_judgment_trgm_indexes.sql`。

## 7. 備份與資料庫角色

- PostgreSQL dump 使用 age 加密（`postgres/judgment.dump.age`）；`.env` 不進備份；`data/` 與 Qdrant snapshot 仍為明文。
- 已完成完整備份與 subset restore；完整 157 GB＋Qdrant restore drill 尚未執行。
- 主應用已改用 `judgment_app`：`rolsuper=f`、`rolcreatedb=f`、`rolcreaterole=f`，擁有 public tables／sequences；`judgment` superuser 僅保留給 break-glass／備份／初次建立。`demo_reader` 仍為受限角色。Provision／回滾見 `specs/security/app-db-role-runbook.md`。
- age 私鑰：`~/.config/judgment/age.key`，權限 `600`，不可進 repo／備份。

## 8. 文件狀態規則

- `README.md`、`specs/*/spec.md`、`specs/security/*.md`：current-state 文件，應以程式與 API 為準。
- `specs/005-retrieval-evaluation/*-2026-11-17.md`、`specs/006-fraud-relevance-annotation/*`：dated 研究／benchmark 快照；保留當時數據，不強行改成目前值，但會標示 snapshot 性質。
- 任何與本文件衝突的 current-state 敘述，以程式碼、`demo_policies.json`、`route_policies.json`、`config.py` 與 API 回傳為準。
