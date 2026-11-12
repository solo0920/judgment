# Judgment RAG 專案憲章

## 核心原則

### I. 可追溯與不虛構

所有提供給使用者的判決、法規、條文、引用編號與服務狀態，都必須能追溯到 PostgreSQL、Parquet、Qdrant、Ollama 或瀏覽器本機儲存中的實際資料。資料不足時必須明確顯示 `retrieval_only`、`preview` 或錯誤狀態，不得以模型知識補造案號、條文、日期或統計數字。

### II. 原始資料不可變，衍生資料版本化

判決壓縮檔、原始 JSON 與原始 Parquet 備份必須保留，不因篩選、重新匯入或索引重建而刪除。法規版本、判決匯入批次、Qdrant 索引與 alias 切換都必須留下版本紀錄；正式向量查詢使用 `judgments_current` alias 指向版本化 collection，不以覆寫 active collection 的方式更新。

### III. 明確降級，不偽裝可用

PostgreSQL、Parquet、Qdrant、Embedding、LLM 或外部下載服務未設定、離線或降級時，API 與前端必須回傳可辨識的狀態（例如 `not_configured`、`unavailable`、`not_indexed`、`degraded`、`preview`）。不得以模擬資料、過期資料或推測數值冒充即時結果。

### IV. 查詢唯讀，管理操作顯式

資料庫查詢頁與 RAG 提問對資料來源維持唯讀。資料下載、匯入、Parquet 匯出、索引建置、alias 切換、題庫與 benchmark 管理屬於獨立的管理介面，只能透過白名單 workflow、明確的 API 端點或 CLI 執行，並共用處理狀態與日誌。

### V. 可驗證的變更

程式變更必須以測試與靜態檢查驗證；前端變更必須同時更新 `src/judgment/web/static/` 與可 standalone 開啟的 `frontend/` 產物。文件中的路由、workflow、環境變數、資料表、CLI 選項與狀態值必須以實際程式為準，架構變更時同步更新 README、規格與架構文件。

## 技術與資料約束

- 後端：Python 3.12（`.python-version`）、FastAPI、SQLAlchemy、DuckDB、PyArrow。
- 前端：Vanilla JavaScript SPA，由 FastAPI 直接服務 ES modules；`scripts/build_frontend.py` 產生 IIFE bundle 與 `frontend/`。
- 資料層：PostgreSQL 保存版本與中繼資料；Parquet 保存原始與查詢快照；Qdrant 保存判決文件級向量；IndexedDB 只保存瀏覽器本機設定與歷史。
- 模型層：Ollama 提供 embedding 與 LLM；模型、索引 recipe 與 embedding version 必須記錄在索引版本中。
- 判決納入範圍以 `documents/金融法規.md` 為白名單；未命中者保留原始檔，但不寫入 `judgment_documents` 或判決索引。
- 版本備份：判決舊版以 snapshot／version／change event 保存；raw Parquet 以 current full + delta 保存；Qdrant 被取代或移除的舊向量進 history collection；一般查詢只使用 `is_current=true`。
- 文件：`documents/` 是主要文件存放位置；架構、評估、API 規格、法規清單與分析報告都放此目錄，不再新增 `docs/`。

## 開發流程與品質閘門

1. 變更前先確認實際入口、設定與資料流，不以舊文件或推測取代程式事實。
2. 後端與資料流程變更需新增或更新測試；文件與 schema 變更需同步更新對應規格。
3. 完成前執行 `uv run pytest -q` 與 `uv run ruff check .`。
4. 前端原始碼變更後執行 `uv run python scripts/build_frontend.py`，並驗證 HTTP 與 `file://` 模式。
5. 不提交 `.env`、資料檔、執行日誌、`.run/`、大型 Parquet 或個人設定。

## 治理

本憲章以目前程式架構為事實基準。當程式與文件不一致時，先確認程式行為，再修正文件；若程式行為本身是錯誤，應另開變更修正程式並同步更新測試與文件。憲章修訂需說明原因、影響範圍與對應的程式／文件變更。

**Version**: 1.0.0 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-11
