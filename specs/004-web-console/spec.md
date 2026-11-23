# Feature Specification: Web 主控台與查詢報表

**Feature Branch**: 未建立（無 `before_specify` hook；以規格目錄 `004-web-console` 識別）

**Created**: 2026-11-06

**Last Updated**: 2026-11-23

**Status**: Implemented · code-aligned 2026-11-22. 本規格以目前程式為唯一事實來源，涵蓋 `#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests` 八個路由；首頁即時摘要（`/api/home`）、99 條金融法規 11 欄清單、首頁 Pipeline waterfall、服務總覽載入 Pipeline、前後端架構與 SVG 流程圖、資料版本（PostgreSQL／IndexedDB／Qdrant／Parquet）、FastAPI route table 動態 API 端點目錄、判決匯入 waterfall、Qdrant R／E 索引月份、RAG／reranker、題庫與 benchmark、SSE 即時更新、standalone `file://` 部署、設定 sidebar、明確 CORS、遠端管理權杖與 SSE ticket、llama-server host allowlist、Docker loopback 綁定與資料庫／Qdrant 憑證均已納入。

**Pipeline Waterfall 規格**: [`pipeline-waterfall.md`](pipeline-waterfall.md)（全站所有以時間軸呈現 pipeline 的視圖 MUST 依此建置）

**Progress Visualization 規格**: [`progress-visualization.md`](progress-visualization.md)（全站階段進度圖 MUST 使用 25% 未完成淺色、完成色進度填充與 100% 實心完成；四階段共用同一組 class、CSS 與 SSE 契約）

**RAG 工作區工具列規格**: [`rag-workspace-toolbar.md`](rag-workspace-toolbar.md)（`#/rag` 右上功能按鈕區、分享給朋友、三點選單、公開連結快照、分享頁與隱私／無障礙契約）

**Qdrant 判決向量索引規格**: [`../009-judgment-vector-index/spec.md`](../009-judgment-vector-index/spec.md)（索引版本建置的 archive 選擇、R／E 判斷、A 內部 baseline、月份 vs RAR 檔數與 coverage-only 顯示）

**llama-server 執行環境與全站顯示規格**: [`../010-llama-server-runtime/spec.md`](../010-llama-server-runtime/spec.md)（全站 llama-server 名稱、端點、優先順序、Model Provider 與 host strip）

**Source of Truth**: 目前程式碼（`src/judgment/web/`、`src/judgment/web/static/assets/js/`、`src/judgment/*.py` 與 `scripts/`）為唯一事實來源。若本文件與程式行為不一致，以程式為準，並 MUST 在同一次變更同步更新本規格，不得保留未實作的 MUST 或已移除的 UI／API。

**Input**: 使用者提供之需求（原文摘要）：

> 首頁右上角要有 Style 選擇器，提供十種科技網站設計，參考 https://getdesign.md/。Header 以橫向排列三個頁面：RAG 問答、資料庫資料檢視、前後端架構與服務狀態。資料庫頁左側以單選控制（目前為下拉選單）選擇資料庫，metadata 篩選條件依資料庫改變；按下搜尋後在右側顯示查詢報表。前端必須使用 vanilla JS，不得捏造 RAG 答案或無法取得的服務資料。

**需求解讀**: 建立一個由 FastAPI 提供 API 與靜態資源的單頁 Web 主控台，讓使用者能在同一個介面完成判決向量檢索與 RAG 問答、資料庫瀏覽與系統狀態檢查。所有顯示的資料都必須可追溯到 PostgreSQL、Qdrant、Parquet、llama-server 或瀏覽器本機儲存；尚未設定的向量索引、RAG 管線與 LLM 必須明確標示為未設定，且不得生成沒有來源的答案。

### Implementation Map（程式事實來源）

本節列出目前程式實際提供的路由、頁面與核心模組；後續需求若與程式衝突，以程式為準並更新本規格。

| 路由／介面 | 前端模組 | 後端／資料來源 |
| --- | --- | --- |
| `#/home` | `pages/home.js`、`judgment-stats.js` | `/api/home`、`/api/events/stream?topic=processing`；PostgreSQL、Qdrant、原始判決 manifest、`documents/金融法規.md` |
| `#/rag` | `pages/rag.js`、`pages/performance.js`（waterfall） | `/api/rag/query`、`/api/rag/query/stream`、`/api/status`、`judgment.rag` |
| `#/data` | `pages/data.js`、`store.js` | `/api/query`、`/api/law`、`/api/judgment`、`/api/data/suggest`、`/api/schema/suggest`、`/api/catalog` |
| `#/quality` | `pages/quality.js`、`pages/question_bank.js` | `/api/quality`、`/api/question-bank/*` |
| `#/performance` | `pages/performance.js`、`pages/benchmark_page.js` | `/api/performance`、`/api/performance/options`、`/api/benchmark/*`、`/api/test-runs/*` |
| `#/processing` | `pages/processing.js` | `/api/processing*`、`/api/processing/events/status`、`/api/updates/*`、`/api/courts/check`、`/api/law-versions/check` |
| `#/status` | `pages/status.js`、`pages/tests.js`（系統測試分類） | `/api/status`、`/api/system-usage`、`/api/llama-server/hosts`、`/api/index-versions`、`/api/versioning/*`、`/api/rerank/*` |
| `#/tests` | `pages/tests.js` | `/api/test-mode`、`/api/llm/models`、`/api/rerank/status`、`/api/rerank/test` |
| 全站 API 目錄 | `pages/status.js` | `/api/status.endpoints`（由 FastAPI `APIRoute` route table 產生） |
| 即時更新 | `api.js`、各頁 SSE 訂閱 | `/api/events/stream`、`ProcessingEventServer`、SQLite event journal |
| 本機儲存 | `store.js` | IndexedDB `judgment-console` v2：`query_history`、`settings`、`audit_events` |

### llama-server 全站契約

全站 llama-server 的端點、優先順序、環境變數、主機 registry、live probe、命名與顯示方式，MUST 依 [`../010-llama-server-runtime/spec.md`](../010-llama-server-runtime/spec.md)。

- 使用者可見名稱 MUST 為 `llama-server`；MUST NOT 出現 `Ollama`。
- x570 MUST 為 chat／embedding／rerank 的 primary，MBP MUST 為 fallback；`11434` MUST NOT 作為目前 llama-server 端點。
- Model Provider 與 processing host strip MUST 使用同一套主機狀態：選用實心「使用中」、其他可用淡色「可用」、失敗灰色「無法取得」。
- Embedding strip 模型標籤 MUST 去除結尾 `:latest` 後再比較與顯示；同一「主機＋模型」只能有一個 chip，不得重複顯示 `bge-m3:latest` 與 `bge-m3`。
- Canonical host API 為 `/api/llama-server/hosts`；舊 `/api/ollama/*` 只保留為隱藏 alias，MUST NOT 出現在 API 端點目錄。
- 索引 runtime 卡片 MUST NOT 重複顯示第二份主機／模型 strip；llama-server 主機與模型只在 workflow 執行資訊卡片的「Embedding 主機／模型」selector 顯示一次。
- 全站時間表一致性 MUST 同時包含視覺與資料語意：每個分格的 `is-complete` 只能由該 series 的完成條件判定；active collection 等基線只能是獨立 series。R／E 僅在 latest archive 已完整覆蓋、沒有 E backlog 的未變更月份，才可用 active 覆蓋顯示完成；仍有 E backlog 時 MUST 使用本次 run 進度。summary MUST 與畫面 cell 同源，backlog badge MUST 分開計算。詳見 [`progress-visualization.md`](progress-visualization.md) §5.1。

### 全站月份／archive 處理順序

所有以月份 archive 為輸入的處理流程 MUST 由最舊月份處理到最新月份：

- 主要排序：`issue_month ASC`（或 archive 檔名 `YYYYMM` 升冪）。
- 同月份多個 archive：依 archive 更新日期／檔名升冪（舊 archive 先、最新 update archive 後）。
- 同月份同 archive 的多筆資料：再依穩定 ID 升冪。
- 續跑 cursor MUST 保存月份（與 archive）及 ID；MUST NOT 只用 ID cursor 跨月份排序。
- 適用流程：判決下載 pending／verification、判決匯入、Qdrant判決向量索引版本建置、完整資料更新、法院名稱正規化（掃描判決時）。
- 法規／命令下載與法規／命令索引以「目前版本」為輸入，沒有月份 archive 迴圈，不適用本排序；仍 MUST 使用穩定的版本／ID 順序。
- 任何流程若因舊版 in-flight run 保留舊排序，MUST 在 runtime／UI 明示，不得默默混用。
- UI 月份表 MAY 維持年份由新到舊顯示；顯示順序與處理順序分開，綠框／目前列 MUST 跟隨實際處理月份。

### Current Functional Surface（目前網站功能）

| 頁面 | 目前功能 |
| --- | --- |
| `#/home` | 主視覺與提問輸入；即時資料卡（法規／命令、金融判決、裁判年份、判決向量索引）；六張重要數據卡與三項事實條；RAG 能力卡（判決／法規索引、Embedding／LLM／Reranker）與判決／法規引用追溯路徑；司法院 OpenData／全國法規資料庫來源卡；可收合的 99 條金融法規清單（11 欄 × 9 列、來源 SHA-256、下載）；`/api/home` 實際階段計時的 Pipeline waterfall、最慢階段標示與展開明細；七個分頁功能卡、footer；`processing` SSE 更新時重新取得摘要。 |
| `#/rag` | 法規優先／判決優先模式、SSE 串流回答、引用驗證與重試、判決／法規引用卡、Parquet 判決原文 dialog、模型 strip、reranker 狀態、IndexedDB 提問歷史、RAG Pipeline waterfall。 |
| `#/data` | 法規命令／判決分類、PostgreSQL／Parquet／Qdrant／IndexedDB 四種來源、動態篩選、查詢報表、分布、實際查詢、分頁、CSV／JSON 匯出、法規報表、判決原文、查詢歷史。 |
| `#/quality` | DuckDB raw Parquet 品質統計與警告，以及題庫列表、AI 生成、匯入匯出、驗證、人工評分、benchmark-ready 狀態。 |
| `#/performance` | 效能總覽、完整 Flow、RAG Pipeline 分頁、判決向量索引 Pipeline 分頁、RAG Benchmark suite/run、模型清單與 regression gate。 |
| `#/processing` | 處理總覽三張月份時間表；9 個白名單 workflow；判決匯入／下載／索引／法規索引／法院正規化／條文歷史進度；Embedding 主機模型選擇；更新 notice。 |
| `#/status` | 服務總覽與載入 Pipeline、系統測試、系統資料使用、Model Provider、四層架構與 SVG、資料版本（PostgreSQL／IndexedDB／Qdrant／Parquet）、動態 API 端點、最近下載。 |
| `#/tests` | API Base 設定與連線測試、測試模式、LLM 模型測試、Reranker 服務測試。 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 以 header 在主要工作頁面間切換 (Priority: P1)

使用者開啟主控台後，看到橫向 header 提供「RAG 提問」、「資料庫」、「資料品質」、「效能報表」、「資料處理」與「系統狀態」六個入口。切換頁面不會整頁重新載入，目前頁面會顯示明顯的選取狀態，並可直接用網址片段回到指定頁面；另有獨立 `#/tests` 路由供系統測試使用。

**Why this priority**: 這些頁面是整個主控台的主要工作流程；沒有穩定的導覽與路由，其他功能無法被使用。

**Independent Test**: 依序點擊六個 header 連結與品牌首頁，確認 URL、頁面標題、選取狀態與內容都正確；重新整理或直接輸入 `#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests` 仍能開啟對應頁面。

**Acceptance Scenarios**:

1. **Given** 使用者開啟主控台根路徑，**When** 頁面載入完成，**Then** 預設顯示 `#/home` 首頁，且 header 的首頁入口為選取狀態。
2. **Given** 使用者在任一頁面，**When** 點擊另一個 header 入口，**Then** 只更新主要內容區與 URL 片段，不重新載入整份靜態資源。
3. **Given** 使用者直接開啟帶有 `#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status` 或 `#/tests` 的網址，**When** 頁面載入，**Then** 顯示對應頁面，而不是先閃回預設頁。
4. **Given** 使用者位於 RAG 頁，**When** 按下 `/` 且焦點不在輸入元件，**Then** 焦點移到問題輸入框。
5. **Given** 使用行動裝置，**When** 開啟任一頁面，**Then** header 與主要內容不得產生水平溢出。
6. **Given** 使用者在任一主要頁面，**When** 以滑鼠或觸控板連續上下滾動，**Then** header 保持不透明、不得閃爍或消失，且滾動不得觸發與畫面狀態無關的 DOM 重建。
7. **Given** 任一頁面正在顯示資料，**When** 自動更新、手動重新整理、換頁、排序、每頁筆數切換、篩選或分類切換完成，**Then** 區塊直接呈現新內容，不得先變淡、變透明、位移、閃成骨架或重播進場動畫。
8. **Given** 使用者在任一頁面，**When** 點擊另一個 header 入口，**Then** 舊頁面保持顯示直到新頁面內容就緒，不得先插入整頁 skeleton、白屏或重播頁面進場動畫。

---

### User Story 2 - 以判決向量檢索回答法律問題 (Priority: P1)

使用者在 RAG 提問頁輸入問題，系統先比對法規／命令，再以 Qdrant 檢索相似的金融法規判決，由 LLM 依檢索到的法規與判決片段生成回答，並標示可回到判決原文或法規條文的引用編號。若向量索引、Embedding 或 LLM 尚未就緒，但有法規／命令來源，系統仍可用法規內容回答或顯示可驗證的檢索結果；只有在法規與判決來源都不存在時，才降級為法規 metadata 預覽，不生成沒有來源的答案。

**Why this priority**: 這是主控台的名稱來源與主要使用情境，也是「不得捏造答案」這項限制最直接體現的地方。

**Independent Test**: 完成判決向量索引後輸入金融法規問題，確認回答包含 `[1]` 等引用編號、下方列出對應案號與片段；停止 LLM 後再測一次，確認狀態為 `retrieval_only` 且仍列出判決；未建立 collection 時確認回傳 `not_indexed`。

**Acceptance Scenarios**:

1. **Given** 法規／命令資料與 LLM 均可使用，**When** 送出問題，**Then** 回答根據檢索到的法規／命令與判決片段生成，並以 `[n]` 標示引用編號。
2. **Given** LLM 回傳缺少有效引用、引用編號越界或空白回答，**When** 系統驗證回答，**Then** 先以嚴格提示重試一次；仍失敗則降級為 `retrieval_only`，不顯示未經驗證的內容。
3. **Given** 檢索片段與問題無關，**When** LLM 明確回答資料不足以回答，**Then** 系統接受此拒絕回答，但不得出現虛構案號。
4. **Given** 無法對應法規／命令且 Qdrant、Embedding 或 LLM 未設定，**When** 送出問題，**Then** 系統回傳 `preview`／`retrieval_only`，並在 `retrieval.status` 說明 `not_configured`、`unavailable`、`not_indexed` 或 `degraded`，不顯示推測引用。
5. **Given** 問題為空字串或超過 500 字，**When** 送出請求，**Then** Pydantic 回傳 422 並提示修正；純空白問題由 RAG 回傳 400。
6. **Given** 使用者完成一次提問，**When** 回到 RAG 頁或重新開啟瀏覽器，**Then** 可在最近提問中看到紀錄與來源數並重新執行。
7. **Given** 回答下方有判決引用卡，**When** 點擊判決卡的案號標題（`citation-head`），**Then** 系統從原始判決 Parquet 讀取並以 dialog 顯示完整判決，不使用 PostgreSQL 或虛構內容冒充。

---

### User Story 3 - 以單選控制選擇資料庫並產生查詢報表 (Priority: P1)

使用者在資料庫頁左側以單選控制（目前為下拉選單）選擇 PostgreSQL、Parquet、Qdrant 或 IndexedDB。系統依選擇的資料表／資料集載入不同的 metadata 篩選欄位；按下執行查詢後，右側顯示摘要、分布、實際查詢語句、警告、資料列、分頁與匯出選項。

**Why this priority**: 資料瀏覽與查詢報表是使用者檢查資料品質、版本與匯入結果的主要工具。

**Independent Test**: 分別選擇四種資料來源，確認單選狀態、篩選欄位與報表內容正確；在 PostgreSQL 切換 `law_documents`、`law_dataset_versions`、`download_runs`，確認可見欄位會跟著改變。

**Acceptance Scenarios**:

1. **Given** 使用者開啟資料庫頁，**When** 頁面載入完成，**Then** 左側顯示四個資料庫選項，且只有一個處於選取狀態。
2. **Given** 使用者選擇 PostgreSQL，**When** 切換資料表，**Then** 只顯示該資料表適用的 metadata 條件，並清除先前不相容的條件。
3. **Given** 使用者選擇 Parquet，**When** 設定資料集、關鍵字與回傳欄位後執行查詢，**Then** 報表讀取目前最新的快照，不混用舊版本。
4. **Given** 使用者選擇 Qdrant 且服務未設定，**When** 執行查詢，**Then** 報表回傳 `not_configured`、空資料列與設定提示，不產生虛構的向量結果。
5. **Given** 使用者選擇 IndexedDB，**When** 執行查詢，**Then** 只查詢目前瀏覽器的查詢歷史或設定，不將資料送到伺服器。
6. **Given** 查詢回傳資料，**When** 檢視報表，**Then** 可看到符合筆數、分布、實際查詢語句、資料列與分頁資訊。
7. **Given** 查詢回傳資料，**When** 使用者選擇 CSV 或 JSON 匯出，**Then** 下載目前頁面的資料，且檔名包含資料來源、資料表與頁碼。
8. **Given** 查詢沒有符合資料，**When** 報表顯示，**Then** 顯示零筆結果與可調整條件的提示，不顯示錯誤的資料列。
9. **Given** 使用者執行查詢後重新整理頁面，**When** 回到資料庫頁，**Then** 可還原上次選擇的資料庫與每頁筆數，並在查詢歷史中看到最近一次的查詢條件。

---

### User Story 4 - 以十種科技品牌風格個人化介面 (Priority: P2)

使用者可從 header 右上角齒輪「設定選項」sidebar 的「介面風格」分類選擇十種科技網站風格。選擇後整份介面立即套用對應的顏色、字體、圓角與元件質感，並在下次開啟時保留。

**Why this priority**: 這是明確的視覺需求，能讓同一個工具符合不同展示或品牌情境，但不影響資料正確性。

**Independent Test**: 逐一選擇十種風格，確認介面風格項目、啟用狀態、頁面色彩與項目外觀都改變；重新整理後仍維持上次選擇；以滑鼠與鍵盤操作也能完成選擇。

**Acceptance Scenarios**:

1. **Given** 使用者開啟「設定選項」並切換到「介面風格」，**When** 功能表顯示，**Then** 顯示十種風格名稱、說明、色票與目前選取狀態，且每個項目以該風格在 header 的底色、文字色、邊角與品牌線呈現。
2. **Given** 使用者選擇任一種風格，**When** 選擇完成，**Then** 介面立即套用該風格，不需要重新載入頁面。
3. **Given** 使用者已選擇風格，**When** 重新整理或再次開啟主控台，**Then** 自動套用上次選擇的風格。
4. **Given** 使用者以鍵盤操作介面風格項目，**When** 使用 Tab 移動並按 Enter，**Then** 可選擇風格。
5. **Given** 使用者選擇深色風格，**When** 瀏覽主要頁面，**Then** 文字、背景、表格與狀態標籤仍保持可讀且對比足夠。
6. **Given** 瀏覽器沒有儲存任何風格選擇，**When** 使用者首次開啟主控台，**Then** 預設套用 NVIDIA 風格，且「介面風格」項目標示 NVIDIA 為目前選擇。

---

### User Story 5 - 檢視架構與誠實的服務狀態 (Priority: P2)

使用者在系統狀態頁查看服務總覽載入 Pipeline、前端／FastAPI／PostgreSQL／Parquet／Qdrant／法規索引／Embedding／Reranker／RAG／LLM 的健康狀態、判決索引覆蓋率、資料版本、前後端架構與 SVG 流程圖、動態 API 端點目錄、系統資源、llama-server 主機、最近下載執行與系統測試。未設定的服務會明確標示，不會以正常狀態呈現。

**Why this priority**: 使用者需要快速判斷資料是否可用、哪些元件尚未接入、頁面載入時間花在哪裡，以及最近的匯入是否成功。

**Independent Test**: 在 PostgreSQL 正常但 Qdrant／RAG／LLM 未設定的環境開啟狀態頁，確認核心服務顯示正常、AI 元件顯示未設定、資料量與最近執行紀錄來自實際資料；再切換資料版本、架構與 API 端點分類，確認五張資料版本卡、四層架構與 SVG、100 個動態端點皆可顯示。

**Acceptance Scenarios**:

1. **Given** 核心服務正常，**When** 開啟狀態頁，**Then** 顯示整體健康狀態、服務總覽載入 Pipeline、各服務卡片與實際資料筆數。
2. **Given** Qdrant、Embedding、RAG 或 LLM 未設定，**When** 檢視服務卡片，**Then** 狀態為「未設定」或「降級」，並說明缺少的設定或尚未建立的 collection。
3. **Given** PostgreSQL 或 Parquet 無法使用，**When** 檢視狀態頁，**Then** 對應服務顯示降級或離線，整體狀態不標示為正常。
4. **Given** 使用者按下重新整理，**When** 請求完成，**Then** 頁面更新檢查時間、服務狀態、載入 Pipeline 與資料量。
5. **Given** 使用者啟用 30 秒自動更新，**When** 停留在狀態頁，**Then** 後端 `status` topic 每 30 秒推送含最新狀態的 SSE payload 並更新頁面；離開頁面或取消勾選後關閉 SSE，前端不以固定 timer 查詢。
6. **Given** 使用者查看「資料版本」，**When** 頁面載入完成，**Then** 顯示 PostgreSQL 資料版本、IndexedDB 本機資料、Qdrant 判決向量索引、Qdrant 法規／命令向量索引與 Parquet／執行狀態五張卡片，以及目前 alias、collection、版本、模型、points、dimension、fresh／stale 與容量。
7. **Given** 使用者查看「前後端架構」，**When** 檢視節點與 SVG，**Then** Client、Application、Pipelines、Data 四層節點有正常／降級區別，下方 SVG 顯示 REST、SSE、RAG、workflow、資料讀寫、排程與 IndexedDB 方向。
8. **Given** 使用者查看「API 端點」，**When** 頁面載入完成，**Then** 由目前 FastAPI route table 產生 hero、method 統計與分類端點清單，並提供 Swagger UI／OpenAPI JSON 連結。
9. **Given** 使用者查看最近下載執行，**When** 有成功、無變更或失敗紀錄，**Then** 可看到狀態、時間、耗時、法規數、條文數與錯誤訊息。

---

### User Story 7 - 從查詢結果檢視單一法規的完整報表 (Priority: P2)

使用者在 PostgreSQL 或 Parquet 的 `law_documents` 查詢結果中點選法規名稱，右側查詢報表會切換成該法規的完整報表，顯示 metadata、沿革、附件與最新 Parquet 快照中的條文。報表上方保留「返回查詢結果」按鈕，可回到原本的查詢報表與頁碼。

**Why this priority**: 查詢結果目前只呈現中繼資料；使用者需要在不離開資料頁的情況下，沿著法規名稱查看可追溯的完整條文。

**Independent Test**: 在 PostgreSQL 以關鍵字查詢法規，點選「民法」後確認顯示民法 metadata 與條文；按「返回查詢結果」確認原本的查詢報表、頁碼與資料列仍存在。再以 Parquet 查詢重複一次。

**Acceptance Scenarios**:

1. **Given** PostgreSQL 或 Parquet 的 `law_documents` 查詢結果，**When** 使用者點選法規名稱，**Then** 右側切換為該法規的完整報表，且不重新載入整個頁面。
2. **Given** 法規完整報表，**When** 使用者查看內容，**Then** 可看到法規位階、類別、異動日期、狀態、來源網站、沿革、附件與條文，並標示 metadata 與條文各自的資料來源及 Parquet 快照。
3. **Given** 法規完整報表，**When** 使用者點選上方的「返回查詢結果」，**Then** 回到同一個查詢報表、頁碼與資料列，不需要重新執行查詢。
4. **Given** 法規條文已載入，**When** 使用者輸入條號並按下跳轉，**Then** 系統捲動至該條並醒目提示，不影響法規 metadata 或其他查詢狀態。
5. **Given** 最新 Parquet 快照缺少該法規的條文，**When** 開啟法規報表，**Then** 顯示可取得的 metadata 與明確警告，不生成或補造條文內容。
6. **Given** 查詢對象是版本、下載紀錄、Qdrant 或 IndexedDB，**When** 檢視資料列，**Then** 不會出現誤導性的法規明細入口。
7. **Given** 390px 行動裝置，**When** 開啟法規完整報表與條文分頁，**Then** 內容不得產生水平溢出。
8. **Given** 法規報表包含「法規沿革」，**When** 報表載入，**Then** 沿革預設收合；點擊標題後展開，再點擊可收合，且展開狀態在跳轉條文後保留。

---

### User Story 8 - 以系統測試頁的測試模式開關執行全模型測試 (Priority: P1)

使用者可從 `#/status` 的「系統測試」分類（或 `#/tests`）切換測試模式。開關為無外框的膠囊與白色圓形旋鈕；測試模式為 ON 時顯示綠色「ON」，RAG 提問會依序執行目前可用的所有 embedding 與 LLM 模型，且不設 timeout；OFF 時顯示紅色「OFF」，回到一般單一模型 RAG。後端電源改由 `./up.sh`／`./down.sh` 或本機電源控制器管理。

**Why this priority**: 使用者需要比較不同模型與函式的效率；若只能執行單一模型，無法在同一題目下取得可比較的測試紀錄。

**Independent Test**: 將測試模式設為 ON，確認系統測試頁顯示 ON 與模型數；在 RAG 頁提問，確認所有可用模型都出現在測試 Flow，且請求超過 45 秒仍不中斷；切換 OFF 後再提問，確認只使用一般 RAG 設定。

**Acceptance Scenarios**:

1. **Given** 後端 API 可用，**When** 開啟 `#/status` 的「系統測試」或 `#/tests`，**Then** 測試模式開關依 `app_settings.test_mode` 顯示 ON／OFF，並在 title 顯示 embedding／LLM 模型數。
2. **Given** 測試模式為 OFF，**When** 使用者按下開關，**Then** 模式切換為 ON 並持久化；RAG 頁顯示「測試模式已開啟」與模型數。
3. **Given** 測試模式為 ON，**When** 使用者送出 RAG 問題，**Then** 系統依序對所有可用 embedding 模型執行 embedding／Qdrant 檢索，並對所有可用 LLM 模型執行生成與引用驗證。
4. **Given** 測試模式執行中，**When** 模型生成超過 45 秒，**Then** 前端不得中止請求；embedding 與 LLM HTTP client 使用無 timeout 模式。
5. **Given** 某個模型失敗（例如不支援 chat 的 400），**When** 測試完成，**Then** 該模型的 step 標示 failed，測試狀態可為 `partial`；其他成功模型仍會完成。
6. **Given** 所有 LLM 都失敗或引用驗證不通過，**When** 測試完成，**Then** RAG 回應降級為 `retrieval_only`，不顯示未經驗證的回答。
7. **Given** 後端離線，**When** 頁面載入，**Then** 測試模式開關顯示 OFF，且不偽裝已連線；電源須由本機腳本或控制器處理。
8. **Given** 測試模式已開啟，**When** 使用者重新整理頁面或重啟後端，**Then** 狀態仍從 PostgreSQL `app_settings` 還原。

---

### User Story 9 - 切換法規命令與判決資料 (Priority: P1)

使用者在資料庫頁最上方以「法規命令／判決」切換資料類別。法規命令類別保留法規、命令、版本與下載紀錄查詢；判決類別只顯示已依 `documents/金融法規.md` 篩選並寫入 PostgreSQL 的判決文件與匯入紀錄。

**Why this priority**: 法規與判決的資料來源、欄位與查詢目的不同；若混在同一個資料庫清單，使用者難以判斷目前瀏覽的是法規 metadata 還是判決全文。

**Independent Test**: 開啟 `#/data`，確認預設顯示法規命令；切換到判決後，資料庫選項包含 PostgreSQL／Parquet／Qdrant／IndexedDB，PostgreSQL 可選擇 `judgment_documents` 與 `judgment_import_runs`，並可用命中法規、法院與裁判日期查詢。

**Acceptance Scenarios**:

1. **Given** 使用者開啟資料庫頁，**When** 頁面載入，**Then** 最上方顯示「法規命令」與「判決」兩個可切換選項，且只有一個被選取。
2. **Given** 使用者選擇法規命令，**When** 檢視資料庫選項，**Then** 可選擇 PostgreSQL、Parquet、Qdrant、IndexedDB，並保留原本法規資料表與篩選欄位。
3. **Given** 使用者選擇判決，**When** 檢視資料庫選項，**Then** 顯示 PostgreSQL、Parquet（原始判決 Parquet 可用時）、Qdrant、IndexedDB；Parquet 查詢讀取原始 `raw.parquet`。
4. **Given** 判決類別的 PostgreSQL，**When** 選擇 `judgment_documents`，**Then** 可依案號／法院／案由／命中法規關鍵字、法院、命中法規／命令與裁判日期區間查詢；案號、法院、案由、裁判日期、命中法規五個欄位標題可點擊切換排序。
5. **Given** 判決類別的 PostgreSQL，**When** 選擇 `judgment_import_runs`，**Then** 可查看每次判決掃描的掃描數、命中數、寫入數、引用數、狀態與耗時。
6. **Given** 判決尚未匯入或查無符合條件資料，**When** 執行查詢，**Then** 顯示 0 筆與明確空狀態，不得顯示虛構判決。
7. **Given** 判決資料已匯入，**When** 使用者以「命中法規」選擇銀行法，**Then** 只回傳 `matched_laws_text` 確實包含銀行法的判決，不得以部分字串誤匹配其他法規。
8. **Given** 390px 行動裝置，**When** 切換法規命令／判決並執行查詢，**Then** 頁面不得產生水平溢出。
9. **Given** 判決原始法院欄位夾雜「民事／刑事／簡易庭／小額」等字尾或內文片段，**When** 使用者檢視法院下拉選單與查詢結果，**Then** 只顯示標準法院名稱，且可用標準名稱精確篩選、排序與開啟判決原文。
10. **Given** 既有判決資料尚未正規化，**When** 執行 `judgment-normalize-courts`，**Then** 只更新 `court_normalized` 並保留原始 `court`；`--dry-run` 不寫入、`--all` 可重新計算全部資料。

---

### User Story 10 - 從判決查詢結果檢視判決原文 (Priority: P1)

使用者在判決類別的 `judgment_documents` 查詢結果中點選案號，右側查詢報表會切換成該判決的原文報表，顯示案號、法院、案由、裁判日期、命中法規、引用條號、PDF 連結與完整判決全文。上方保留「返回查詢結果」按鈕，可回到原本的查詢報表與頁碼。

**Why this priority**: 判決清單只顯示摘要；使用者需要能直接閱讀可追溯的判決全文，才能判斷引用法規與案件內容是否符合需求。

**Independent Test**: 在判決類別執行預設查詢，點選第一筆案號，確認顯示該案判決全文與引用；點「返回查詢結果」確認原本的查詢頁碼與資料列仍存在。

**Acceptance Scenarios**:

1. **Given** `judgment_documents` 查詢結果，**When** 使用者點選案號，**Then** 右側切換為判決原文報表，不重新載入整個頁面。
2. **Given** 判決原文報表，**When** 使用者查看內容，**Then** 可看到案號、法院、案由、裁判日期、來源壓縮檔、命中法規、引用條號、PDF 連結與完整全文。
3. **Given** 判決原文報表，**When** 使用者點選上方「返回查詢結果」，**Then** 回到同一個判決查詢報表、頁碼與資料列，不需要重新查詢。
4. **Given** 判決缺少 PDF 或引用明細，**When** 開啟判決原文，**Then** 對應區塊顯示明確空狀態，不生成不存在的連結或引用。
5. **Given** 判決 API 無法取得資料，**When** 開啟判決原文，**Then** 顯示明確錯誤與返回按鈕，不顯示推測內容。
6. **Given** 390px 行動裝置，**When** 開啟判決原文，**Then** 全文與引用內容不得產生水平溢出。
7. **Given** `judgment_documents` 查詢結果，**When** 檢視案號欄，**Then** 案號 MUST 以單行完整顯示，不得逐字換行；過寬時由表格容器水平捲動。

---

### User Story 11 - 以 header 效能報表檢視完整執行 Flow (Priority: P1)

使用者在 header 點選「效能報表」，可查看每次執行按鈕從接收前端命令到回傳結果的完整 Flow：program、module、function、params、segment duration、模型、HTTP 狀態、request id，以及前端回報的總等待與 render 時間。頁面提供類似資料庫查詢的 sidebar metadata 篩選、Flow 統計、可展開時間軸、原始 Flow JSON、分頁與 CSV／JSON 匯出。

**Why this priority**: 目前已有多個 API、判決匯入與法規下載流程；沒有統一的 Flow 紀錄，難以判斷哪個程序、模型或函式變慢，也無法比較不同執行條件的耗時。

**Independent Test**: 開啟 `#/performance`，展開一筆 RAG Flow，確認可看到 `rag.answer_question`、`rag.embed_query`、`rag.qdrant_search`、`rag.llm` 等 segment 的 module／function／params／duration；以模型 `gemma3:4b` 篩選後只顯示使用該模型的 Flow；確認 client render segment 存在。

**Acceptance Scenarios**:

1. **Given** 使用者完成一次 API 請求，**When** 開啟效能報表，**Then** 可看到一筆 Flow，包含 process、request id、總耗時、status，以及至少 `http.request` 與 endpoint segment。
2. **Given** 一筆 Flow，**When** 展開紀錄，**Then** 每個 segment 顯示 name、module、function、params、param_names、offset、duration 與 status，並以巢狀縮排表示 parent/child。
3. **Given** 前端完成請求與 render，**When** 回報 client timing，**Then** 同一個 request id 的 Flow 會新增 `client.render` segment，並更新 `client.total_ms`、`client.render_ms`，不得建立重複紀錄。
4. **Given** 效能報表頁面，**When** 使用者依程序、模組、模型、狀態、方法、日期區間、耗時下限或關鍵字篩選，**Then** 只顯示符合 metadata 的紀錄。
5. **Given** 效能報表結果，**When** 使用者查看摘要，**Then** 可看到符合筆數、成功率、平均耗時、P95 耗時與平均段數，以及模型使用次數與最慢區段。
6. **Given** 查詢失敗的請求，**When** 檢視效能報表，**Then** 該紀錄標示 `failed`，Flow segment 標示 `error` 並保留 HTTP 狀態與錯誤訊息。
7. **Given** 效能紀錄數量超過一頁，**When** 使用者切換頁碼或每頁筆數，**Then** 報表正確更新且不重新載入整個頁面。
8. **Given** 使用者需要離線分析，**When** 點選 CSV 或 JSON 匯出，**Then** 匯出目前頁面的效能紀錄與 Flow JSON。
9. **Given** 效能紀錄超過保留期限，**When** 系統執行清理，**Then** 只刪除超過保留天數的紀錄，預設至少保留 90 天。

---

### User Story 12 - 在效能報表即時查看模型測試 Flow (Priority: P1)

使用者可在效能報表頁上方查看目前或歷史的模型測試 flowchart：每個測試階段依模型數量顯示多條子程序進度條，最下方顯示總流程進度；測試執行期間自動更新，完成後可從歷史選單還原。

**Why this priority**: 測試模式會執行多個模型與階段；若沒有即時進度與歷史紀錄，無法判斷是哪個模型或階段拖慢整體流程。

**Independent Test**: 開啟測試模式並送出 RAG 問題，切換到效能報表頁，確認圖表在測試期間更新；完成後重新載入頁面，從歷史選單選取同一測試，確認所有階段、模型與耗時可還原。

**Acceptance Scenarios**:

1. **Given** 測試模式已開啟且 RAG 正在執行，**When** 使用者開啟效能報表頁，**Then** 上方顯示測試流程圖表，並由 `test-runs` SSE topic 在 DB run／step 變更時推送更新。
2. **Given** 一個測試包含 1 個 embedding、1 個 retrieval、1 個 context、4 個 LLM、4 個 validation，**When** 圖表渲染，**Then** 顯示 5 個階段群組與 11 條子程序進度條。
3. **Given** 某個模型失敗，**When** 圖表更新，**Then** 該子進度條以紅色與錯誤訊息顯示；執行中的子進度條以 animated bar 顯示。
4. **Given** 測試完成，**When** 使用者查看最下方，**Then** 總流程進度為 100%，並顯示測試狀態（success／partial／failed）。
5. **Given** 多筆歷史測試，**When** 使用者從「歷史」選單選擇一筆，**Then** 載入該測試的 stages、models、status、duration 與 step 結果。
6. **Given** 後端重啟，**When** 使用者重新開啟效能報表，**Then** 仍可從 PostgreSQL 讀取歷史測試並還原 flowchart。
7. **Given** 390px 行動版，**When** 檢視測試流程圖表，**Then** 不得有水平溢出，階段與進度條仍可閱讀。

---

### User Story 13 - 以設定選項 sidebar 調整字型與介面風格 (Priority: P2)

使用者可從 header 右上角齒輪開啟右側「設定選項」sidebar。Sidebar 將 header、主要內容與 footer 向左推，上方提供設定分類按鈕，分隔線下方顯示目前分類的功能表。「字型大小」列出目前頁面出現的文字區塊，讓使用者以滑桿或數值輸入即時調整，並在 hover／focus 時標示受影響範圍；「介面風格」以各主題 header 的外觀呈現十個選項，選取後立即套用。

**Why this priority**: 不同頁面與資料密度需要不同的文字大小；使用者需要在同一個工作區快速確認調整範圍、儲存偏好，並在不離開頁面的情況下切換品牌風格。

**Independent Test**: 在資料庫頁開啟設定 sidebar，確認頁面左移、字型清單只列出目前頁面區塊；調整頁面標題並觀察即時變化與 hover highlight；儲存後重新載入確認保留；取消、關閉與回復預設值確認回到正確狀態；切換到介面風格並套用 Apple，確認頁面立即變化且 header 沒有獨立調色盤按鈕。

**Acceptance Scenarios**:

1. **Given** 使用者在任一主要頁面，**When** 點擊 header 右上角齒輪，**Then** 右側出現設定 sidebar，header／main／footer 同步向左推，且 header 不再有獨立的 Style／調色盤按鈕。
2. **Given** 使用者開啟「字型大小」，**When** 功能表載入，**Then** 只列出目前頁面實際出現的文字區塊，每列包含名稱、滑桿、可輸入的 px 數值與即時預覽。
3. **Given** 使用者拖動滑桿或輸入數值，**When** 數值改變，**Then** 頁面對應文字立即更新；滑鼠移到列上或列內控制項取得焦點時，所有對應的可見文字以 outline 與半透明背景標示，移出後立即移除。
4. **Given** 使用者調整多個區塊，**When** 按「儲存」，**Then** 設定寫入瀏覽器本機，重新載入或切換頁面後仍套用；按「取消」或直接關閉 sidebar 回復上次儲存值；按「回復預設值」清除尚未儲存的覆寫。
5. **Given** 使用者切換到「介面風格」，**When** 功能表顯示，**Then** 十個項目保留原名稱，但各自呈現該主題 header 的底色、文字色、品牌線、邊角與陰影；選取後全站立即套用並保留。
6. **Given** 使用者在「介面風格」右上角切換「亮／暗／系統」，**When** 選擇完成，**Then** 「亮」回到目前主題原本的配色定義、「暗」套用共用暗色配置，整體頁面、header 與 sidebar 立即更新；「系統」模式跟隨 `prefers-color-scheme`，重新載入後仍保留選擇。
7. **Given** 使用者以鍵盤操作，**When** 按 Tab 移動、Enter 選取或按 Esc 關閉，**Then** 焦點順序正確，關閉後回到 header 齒輪按鈕。
8. **Given** 390px 行動版，**When** 開啟設定 sidebar，**Then** sidebar 改為全寬、頁面無水平溢出，所有控制項仍可操作。

---

### Edge Cases

- 資料庫完全沒有資料時，RAG、資料頁與狀態頁應如何呈現空狀態？
- PostgreSQL 可連線但資料表尚未建立時，catalog 與查詢應如何回應？
- Parquet 目錄存在但沒有可讀的快照時，資料頁應如何處理？
- API 逾時、網路中斷或伺服器回傳 5xx 時，頁面是否保留可理解的錯誤與重試入口？
- 使用者手動修改網址片段為不存在的路由時，應回到哪個頁面？
- 查詢回傳大量資料或勾選完整 `raw_json` 時，如何避免畫面卡死？
- 瀏覽器停用 IndexedDB、進入無痕模式或儲存空間不足時，歷史與設定如何處理？
- 使用行動裝置或窄視窗時，表格、篩選側欄與 header 是否仍可操作？
- 同一使用者在多個分頁同時操作時，主題、查詢歷史與設定是否會互相覆蓋？
- 瀏覽器停用 `localStorage` 或儲存空間不足時，字型設定是否仍能在本次工作階段生效，且不影響頁面操作？
- 設定 sidebar 開啟時切換路由、載入動態表格或開啟法規／判決 dialog，字型設定與 hover highlight 是否仍能正確套用且不造成無限重繪？
- 服務狀態在兩次後端推送之間發生變化時，畫面是否可能顯示過期資料？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 主控台 MUST 提供 `#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status` 七個主要頁面與可獨立開啟的 `#/tests`；header 以品牌連到首頁，並以橫向導覽提供 RAG、資料庫、資料品質、效能報表、資料處理與系統狀態六個入口。
- **FR-002**: header MUST 顯示目前頁面的選取狀態，且切換頁面時不得重新載入整份靜態資源。
- **FR-003**: 主控台 MUST 在無法辨識路由時回到預設的 `#/home` 首頁；RAG 提問頁仍可透過 `#/rag` 直接開啟。
- **FR-004**: RAG 頁 MUST 接受 1–500 字的問題，並以 Enter 送出、Shift+Enter 換行。
- **FR-005**: RAG 頁 MUST 以 Qdrant 判決向量檢索與法規／命令檢索為來源；每個引用 MUST 對應 PostgreSQL `judgment_documents` 中實際存在的案號，或現行法規／命令資料中的條文。
- **FR-006**: RAG 回答 MUST 根據檢索到的法規／命令與判決片段生成，並標示 `[n]` 引用編號；缺少有效引用或引用越界時 MUST 先以 strict prompt 重試一次，仍失敗才降級為 `retrieval_only`。
- **FR-007**: RAG 頁 MUST 在 Qdrant、Embedding、LLM 或資料庫無法使用時顯示明確狀態（`preview`、`retrieval.status` 的 `not_configured`、`unavailable`、`not_indexed`、`degraded`、`retrieval_only`），不得顯示推測內容；有法規／命令來源時仍應使用法規內容回答。
- **FR-008**: 資料庫頁 MUST 以單選控制（目前為下拉選單）提供 PostgreSQL、Parquet、Qdrant、IndexedDB 四種資料來源，且同時只有一個被選取。
- **FR-009**: 資料庫頁 MUST 依目前資料表或資料集動態顯示 metadata 篩選欄位，並在切換後清除不相容的條件。
- **FR-010**: PostgreSQL 查詢 MUST 支援 `law_documents`、`law_dataset_versions`、`download_runs` 三個資料表，並拒絕未知資料表。
- **FR-011**: Parquet 查詢 MUST 讀取目前最新的 `law` 或 `order` 快照，不得混用不同版本。
- **FR-012**: Qdrant 查詢 MUST 先以 Embedding 將語意查詢轉為向量；未設定、collection 不存在或查無結果時 MUST 回傳對應狀態與空資料列，不得回傳虛構的向量結果。
- **FR-013**: IndexedDB 查詢 MUST 只在瀏覽器端執行，不得將查詢歷史或設定傳送到伺服器。
- **FR-014**: 查詢報表 MUST 包含符合筆數、結果分布、實際查詢語句、資料列與分頁資訊。
- **FR-015**: 查詢報表 MUST 支援 CSV 與 JSON 匯出，且只匯出目前頁面的資料。
- **FR-016**: 查詢報表 MUST 在無資料、警告、降級或錯誤時顯示對應訊息，不得以空白畫面取代。
- **FR-017**: 查詢歷史與頁面設定 MUST 儲存在瀏覽器本機；IndexedDB 不可用時 MUST 退回記憶體暫存並明確標示。
- **FR-018**: 設定選項 sidebar 的「介面風格」分類 MUST 提供十種科技網站風格；每一項目 MUST 以該風格在 header 的呈現方式顯示（header 底色、文字色、品牌線、邊角與陰影），但項目名稱不變；套用時不得重新載入頁面。
- **FR-019**: 使用者選擇的風格 MUST 在重新開啟主控台後保留。
- **FR-020**: 「介面風格」分類 MUST 支援滑鼠與鍵盤（Tab／Enter）操作；header MUST NOT 另設 Style／調色盤按鈕。
- **FR-021**: 狀態頁 MUST 顯示前端、API、PostgreSQL、Parquet、Qdrant、法規／命令索引、Embedding、Reranker、RAG 與 LLM 共 10 個服務元件的狀態。
- **FR-022**: 狀態頁 MUST 將未設定的服務標示為 `not_configured`、降級的服務標示為 `degraded`，不得以正常或推測數據呈現。
- **FR-023**: 狀態頁 MUST 顯示服務總覽載入 Pipeline、10 個服務元件、實際資料筆數、Parquet 快照數、判決／法規索引覆蓋率、資料版本（PostgreSQL、IndexedDB、Qdrant、Parquet）、前後端架構與 SVG 流程圖、動態 API 端點目錄、系統資源、llama-server 主機、最新版本與最近下載執行。
- **FR-024**: 狀態頁 MUST 支援手動重新整理與可選的 30 秒自動更新；啟用時前端 MUST 訂閱 SSE `status` topic，由後端每 30 秒推送含最新狀態的 payload，離開頁面或取消勾選後 MUST 關閉訂閱，MUST NOT 使用前端 `setInterval` 或定期 GET `/api/status`。
- **FR-025**: 架構分類 MUST 顯示 Client、Application、Pipelines、Data 四層目前節點，區分已接入且正常的節點與尚未設定或尚未接入的節點，並在下方提供 SVG 流程方向示意圖。
- **FR-026**: 查詢頁（`#/data`）的 PostgreSQL／Parquet／Qdrant 查詢 MUST 為唯讀；`#/processing`、題庫、benchmark 與 llama-server 主機管理屬於獨立的管理介面，可執行寫入與啟動程序。
- **FR-027**: API MUST 對未知資料庫、未知資料表、無效分頁與空白問題回傳明確的 4xx 錯誤。
- **FR-028**: 主控台 MUST 在桌面與 390px 寬的行動裝置上保持可操作，且不得產生水平溢位。
- **FR-039**: PostgreSQL 與 Parquet 的 `law_documents` 查詢結果 MUST 讓 `law_name` 可點選並開啟單一法規報表；其他資料表不得顯示法規明細入口。
- **FR-040**: 單一法規報表 MUST 顯示可追溯的 metadata、最新 Parquet 快照中的結構化條文（若有）、資料來源與快照資訊；缺少條文時 MUST 顯示警告，不得補造內容。
- **FR-041**: 單一法規報表 MUST 提供「返回查詢結果」，回到原本的查詢報表、頁碼與資料列，且不得重新執行查詢。
- **FR-042**: 法規條文 MUST 一次載入全部條文，不得使用上一頁／下一頁分頁；MUST 提供「跳至第幾條」輸入，跳轉不得影響法規 metadata 或其他查詢狀態。
- **FR-043**: `GET /api/law` MUST 唯讀查詢，對未知法規回傳 404、對不支援的 `source_type` 回傳 400，且不得因缺少 Parquet 條文而回傳虛構內容。
- **FR-044**: 法規報表的「法規沿革」MUST 預設收合，使用者點擊後展開／收合；跳轉條文時 MUST 保留目前的展開狀態。
- **FR-045**: `#/status` 的「系統測試」分類（或 `#/tests`）MUST 提供可點擊的測試模式開關；開關 MUST 為無外框膠囊；測試模式 ON 時 MUST 顯示綠色「ON」與右側白色旋鈕，OFF 時 MUST 顯示紅色「OFF」與左側白色旋鈕。header 只保留齒輪「設定選項」與六個主要導覽。
- **FR-046**: 測試模式狀態 MUST 儲存在 PostgreSQL `app_settings`，並由 `/api/test-mode` 讀取／切換；ON 時 RAG 提問 MUST 執行所有可用 embedding 與 LLM 模型，OFF 時回到一般 RAG。
- **FR-047**: 電源控制器 MUST 綁定 `127.0.0.1:9201`，由 `judgment-web` 預設自動啟動，且 MUST 在後端停止後繼續存活；`JUDGMENT_POWER_AGENT=0` MUST 可停用。
- **FR-048**: 啟動與停止請求 MUST 要求 `X-Judgment-Power: 1`，且控制器 MUST 只接受本機、localhost 或 `file://`（Origin `null`）來源；非本機 API Base MUST 不提供遠端電源控制。
- **FR-049**: 測試模式切換進行中 MUST 停用開關並顯示載入狀態；API 失敗或逾時時 MUST 顯示明確錯誤，不得偽裝成功。
- **FR-051**: 測試模式開關的白色旋鈕 MUST 在 ON／OFF 狀態下保持垂直置中；水平寬度 MUST 約為 70px，較原 88px 縮小五分之一。
- **FR-052**: 資料庫頁 MUST 以可切換的「法規命令／判決」分類呈現，且每個分類各自保有資料庫、資料表與查詢條件。
- **FR-053**: 法規命令分類 MUST 提供法規 PostgreSQL、Parquet、Qdrant 與 IndexedDB；判決分類 MUST 提供判決 PostgreSQL、Parquet（原始判決 Parquet 可用時）、Qdrant 與 IndexedDB。
- **FR-054**: 判決 PostgreSQL MUST 支援 `judgment_documents` 與 `judgment_import_runs`，並提供案號、法院、案由、命中法規、裁判日期與匯入狀態篩選。
- **FR-055**: 判決查詢 MUST 只回傳已寫入 `judgment_documents` 的資料；空資料時 MUST 顯示明確空狀態，不得生成虛構判決。
- **FR-056**: 判決的「命中法規」篩選 MUST 採完整法規名稱邊界比對，不得以子字串誤匹配其他法規。
- **FR-057**: 判決分類 MUST 顯示目前已匯入的判決筆數，並保留使用者的分類與各分類資料庫選擇。
- **FR-058**: `judgment_documents` 查詢結果中的案號 MUST 可點選並開啟判決原文報表。
- **FR-059**: 判決原文報表 MUST 顯示案號、法院、案由、裁判日期、命中法規、引用條號、PDF 連結（若存在）與完整判決全文；缺少資料時 MUST 顯示明確空狀態。
- **FR-060**: 判決原文報表 MUST 提供「返回查詢結果」，回到原本的判決查詢報表、頁碼與資料列，且不得重新執行查詢。
- **FR-061**: 瀏覽器沒有已儲存風格時，主控台 MUST 預設套用 NVIDIA 風格；使用者已儲存的風格選擇仍應優先。
- **FR-062**: 判決查詢結果的案號欄 MUST 使用單行、不換行顯示，並依內容保留足夠寬度；手機版由表格容器水平捲動，不得造成頁面水平溢出。
- **FR-063**: 裁判日期欄 MUST 使用單行、不換行顯示，並依 `YYYY/MM/DD` 內容保留足夠寬度。
- **FR-064**: `judgment_documents` 的案號、法院、案由、裁判日期、命中法規五個表頭 MUST 可點擊切換升冪／降冪，並以箭頭與 `aria-sort` 顯示目前排序。
- **FR-065**: 判決篩選表單 MUST 不顯示「引用數下限」與「排序」欄位。
- **FR-066**: 資料表 `#` 欄 MUST 保留至少 52px 寬度並禁止換行，使 3 位數列號仍以單行顯示。
- **FR-067**: header MUST 提供「效能報表」入口，路由為 `#/performance`。
- **FR-068**: API 與 CLI 執行 MUST 將 process、module、started_at、finished_at、duration_ms、status、request_id、params、details 與 flow 寫入 PostgreSQL `performance_records`；寫入失敗不得中斷原請求。
- **FR-069**: 效能報表 API MUST 支援程序、模組、模型、狀態、方法、關鍵字、日期區間、耗時下限、分頁與排序篩選，並回傳符合筆數、成功率、平均耗時、P95 耗時、平均段數與 flow_stats。
- **FR-070**: 效能報表頁 MUST 提供 sidebar metadata 篩選、Flow 統計、可展開的巢狀 segment 時間軸、原始 Flow JSON、摘要、分頁與 CSV／JSON 匯出。
- **FR-071**: 失敗的請求或匯入 MUST 仍寫入效能紀錄，並標示 `failed`、HTTP 狀態與錯誤訊息。
- **FR-072**: 效能紀錄 MUST 至少保留 90 天；清理不得刪除仍在保留期限內的資料。
- **FR-073**: `judgment_documents` MUST 保留原始 `court` 並新增 `court_normalized`；正規化順序 MUST 為「原始值開頭即標準法院 → 全文前 8,000 字最早出現的法院 → 原始值中任意位置的標準法院 → JID 前綴」，且不得覆寫原始欄位。
- **FR-074**: 法院下拉選單、精確篩選、排序、查詢結果與判決原文 MUST 使用 `court_normalized`；API MAY 回傳 `court_raw` 供追溯，但法院選項不得包含原始字串或民事／刑事／簡易庭等字尾。
- **FR-075**: `judgment-normalize-courts` MUST 支援 `--dry-run`、`--all`、`--limit` 與 `--batch-size`；預設只處理 `court_normalized` 為空的資料，且每次執行 MUST 寫入效能紀錄。
- **FR-076**: `judgment-index-vectors` MUST 以 PostgreSQL 判決為來源，支援 legacy collection `judgment_documents` 與版本化流程：建立 `judgments_vNNN` 實體 collection，驗證後切換 `judgments_current` alias。主控台與 `--build-version --activate` 使用版本化 collection；point id MUST 由案號決定，重跑不得產生重複 point。
- **FR-077**: 向量索引 MUST 在 `judgment_vector_index` 記錄案號、collection、模型、content hash 與維度；未變更的判決 MUST 跳過，且支援 `--limit`、`--since`、`--jid`、`--stride`、`--all`、`--recreate`、`--dry-run`。
- **FR-078**: 問答 API MUST 先以 Embedding 檢索 Qdrant，再從 PostgreSQL 取回判決全文並擷取與問題相關的片段；不得只憑向量 payload 生成回答。
- **FR-079**: LLM 回答 MUST 通過引用編號驗證；缺少引用、引用越界或空白回答時 MUST 降級為 `retrieval_only`。
- **FR-080**: 系統 MAY 接受 LLM 的「片段不足以回答」拒絕回答，但該回答不得包含虛構案號。
- **FR-081**: 狀態 API MUST 回傳判決總數、已索引數、剩餘數、collection、模型、points 與最後索引時間；RAG 頁 MUST 顯示索引覆蓋率。
- **FR-082**: Qdrant 資料頁 MUST 提供語意查詢、Top K、相似度門檻；判決結果 MUST 顯示相似度、案號、法院、案由、裁判日期、命中法規與片段，並可開啟判決原文。
- **FR-083**: 經 instrument 的 API 請求 MUST 建立一筆帶著 `flow` JSON 的效能紀錄，涵蓋從 middleware 接收請求、endpoint、RAG／查詢子流程到回應組裝的完整路徑。`/api/performance`、`/api/processing`、`/api/quality`、`/api/question-bank`、`/api/benchmark`、`/api/test-*`、`/api/health`、docs 與 OPTIONS 不經 middleware；`/api/rag/query/stream` 由端點自身寫入。
- **FR-084**: `flow.segments` 的每個 segment MUST 包含 `seq`、`parent_seq`、`depth`、`name`、`module`、`function`、`params`、`param_names`、`offset_ms`、`duration_ms`、`status`；參數值 MUST 截斷或摘要，避免寫入過大或敏感的內容。
- **FR-085**: 需要 client timing 的前端請求 MUST 在送出時提供 request id 與 client start timestamp；收到回應並完成 render 後 MUST 以 `POST /api/performance/client` 回報 total／render 時間，後端 MUST 合併到同一 request id 的 flow，不得產生重複紀錄。狀態、processing、question-bank、benchmark 等背景查詢不追蹤 client timing。
- **FR-086**: 效能 API MUST 回傳每筆紀錄的 `flow`、`flow_segments`、`flow_models` 與 `flow_stats`（模型分布、平均段數、最慢區段、client 平均）；並 MUST 支援以模型名稱篩選 flow JSON。
- **FR-087**: 舊紀錄或沒有逐段 instrumentation 的 CLI 紀錄 MUST 仍可顯示；缺少 flow 時 MUST 顯示 fallback 訊息，不得讓報表失敗。新產生的 CLI 紀錄 SHOULD 至少包含一個 summary segment。
- **FR-088**: `/api/test-mode` MUST 提供測試模式讀取與切換；模型清單 MUST 從 llama-server `/v1/models` 自動偵測（legacy Ollama `/api/tags` 僅相容），排除 reranker，並以 `TEST_EMBEDDING_MODELS`／`TEST_LLM_MODELS` 支援覆寫。
- **FR-089**: 測試模式 ON 時，RAG 請求 MUST 依序執行所有可用 embedding 模型（embedding、Qdrant 檢索）、Reranker、PostgreSQL 取文，以及所有可用 LLM 模型（生成、引用驗證）；測試 Flow MUST 顯示 Reranker 階段，包含模型、primary／fallback、候選數、選用數、top score、耗時與錯誤。測試 Flow 的 Embedding／Qdrant／Reranker／LLM／引用驗證模型標籤 MUST 使用實際執行端點的「主機:模型」格式（例如 `x570:bge-m3`、`x570:bge-reranker-v2-m3`、`mbp:gemma3:4b`），PostgreSQL 取文階段 MUST 使用「主機:DB名稱」格式（例如 `mbp:judgment`），RAG 引擎答案標頭與 footer primary 也 MUST 使用同一模型格式；無法取得主機時才可只顯示模型或 DB 名稱。前端與後端模型呼叫 MUST 不設 timeout。
- **FR-090**: 每次測試 MUST 寫入 `performance_test_runs` 與 `performance_test_steps`，包含 run id、request id、問題、主要答案、狀態、stage、model、module、function、progress、duration、error 與 summary；後端重啟後 MUST 可查詢。
- **FR-091**: 效能報表頁上方與 RAG 提問頁下方 MUST 顯示測試流程圖表；圖表 MUST 標記 RAG 問題、RAG 答案、每步驟 module／function；每個階段依模型數量顯示子程序進度條，最下方顯示總流程進度與依階段耗時比例的 stacked time bar（含 legend 的階段、耗時、百分比），執行中 MUST 由 SSE `test-runs` topic 在 `performance_test_runs`／`performance_test_steps` 變更時推送更新。
- **FR-092**: 測試流程圖表 MUST 提供歷史選單，可依 run id 載入過去的 stages／steps／status／duration，還原歷史 flowchart。
- **FR-093**: 測試模式的主要回答 MUST 優先使用 `LLM_MODEL`，其次使用第一個通過引用驗證的模型；全部失敗時 MUST 降級為 `retrieval_only`。
- **FR-094**: 測試模式中的個別模型失敗（例如 HTTP 400）MUST 記錄為 failed step，不得中斷其他模型；測試狀態 MAY 為 `partial`。
- **FR-095**: 測試模式開關 MUST 位於 `#/status` 的「系統測試」分類或 `#/tests`；header 不再提供電源或測試模式膠囊開關。後端電源 MUST 由 `./up.sh`／`./down.sh` 或本機電源控制器管理。
- **FR-096**: **資料來源角色**：PostgreSQL `judgment_documents` + Qdrant 是判決清單、RAG 檢索、統計與篩選的**正式查詢來源**；原始判決 Parquet（`parquet/raw_judgments/.../raw.parquet`）主要為**備份原始檔案內容與完整原文追溯**，不是一般查詢來源。一般 lists／filters／统计 MUST 查 PostgreSQL／Qdrant，MUST NOT 直接掃描原始 Parquet。只有以下情況才讀原始 Parquet：明確指定 `source=parquet` 的單筆原文、資料頁／Schema 的 Parquet 選項、備份驗證與還原追溯。判決 Parquet 匯出 workflow（`python -m judgment.judgment_parquet`）MAY 產生過濾後快照；`GET /api/judgment?source=parquet` 讀不到時回傳 404 並提示先建立原始備份。JID 含 8 位裁判日期時，MUST 以該日期的 `YYYYMM` 限定只讀取對應月份的 `raw.parquet`；目前資料中 `issue_month` 與 `jdate` 前 6 位 100% 一致，未parse 出月份時才退回完整 dataset。此規則 MUST 讓單筆判決讀取從全庫 371 檔／45 GB 的 8–10 秒降到 1 秒內，查無資料亦同。
- **FR-097**: RAG 引用卡 MUST 可點擊案號標題（`citation-head`）開啟原文，點擊後 MUST 以 dialog 顯示原始判決 Parquet 中的完整判決、案號、法院、日期、案由、命中法規與 PDF 連結；不得以 PostgreSQL 或虛構內容冒充 Parquet；dialog MUST 可透過右上角 X、「返回回答」或點擊 dialog 外部關閉。
- **FR-098**: RAG 一般模式 MUST 使用可設定的快速 profile（程式預設 `RAG_TOP_K=4`、`RAG_RERANK_ENABLED=false`；目前 `.env` 覆寫為 `RAG_TOP_K=8`、`RAG_RERANK_ENABLED=true`、`LLM_MODEL=gemma3:4b`。`RAG_SCORE_THRESHOLD=0.35`、`RAG_MAX_CONTEXT_CHARS=4000`、`LLM_NUM_CTX=4096`、`LLM_NUM_PREDICT=384`、`LLM_KEEP_ALIVE=-1`；程式未設定 LLM 時只回傳檢索結果），並 MUST 允許改回 27B 品質模式；測試模式不受快速 profile 限制。
- **FR-099**: RAG 回答標頭 MUST 在狀態與耗時旁顯示實際使用的 LLM 模型名稱；測試模式 MUST 顯示 `test_run.primary_model`，tooltip MUST 同時提供 LLM 與 embedding 模型資訊。
- **FR-100**: 法規／命令／判決下載 workflow 的「執行此流程」MUST 先以 `POST /api/updates/check` 只檢查該來源；若結果為 `up_to_date`，MUST 顯示「已是最新版本，仍要強制重新下載？」確認，取消時不得啟動流程。檢查失敗 MAY 顯示警告後允許執行。
- **FR-101**: 每個 workflow 面板 MUST 顯示實際階段的獨立進度條、狀態、筆數／bytes、耗時與訊息，並以不同顏色標記；下方 MUST 顯示由各階段加總的整體進度堆疊條與 legend。滑鼠移到階段、色塊或 legend 時 MUST 只保留該項目並以浮動提示顯示名稱、進度、整體占比、耗時與訊息。不得顯示流程未實際執行或不存在的階段（例如法規／命令下載不得虛構 Qdrant／IndexedDB 階段）。
- **FR-102**: Qdrant判決向量索引版本建置 workflow MUST 在開始前測試主要／備援 llama-server 的 `/v1/models`、`/health` 與 embedding 模型可用性，記錄每台主機 URL／host／port／模型清單、最後選用主機與執行中實際使用主機；若無可用主機 MUST 明確失敗。索引期間 MUST 顯示與判決下載相同的「年份列 × 月份欄」時間表；完成索引為綠色、部分完成月份為紅色、新檔／尚未索引為灰色、無資料為空白；目前索引月份 MUST 以 border／outline 標示，padding 保持透明，不得有背景或陰影。月份 tooltip MUST 包含來源檔案、已處理／總筆數、進度、重用、新 embedding 與目前案號。若尚無本次索引 run，系統 MUST 以 active collection 的實際月份覆蓋率顯示同一張表，並可快取避免每次 refresh event 重算。
- **FR-103**: 判決匯入 workflow MUST 顯示與判決下載相同的「年份列 × 月份欄」時間表，依下載 manifest、PostgreSQL `judgment_documents.source_archive` 與 `judgment_snapshots.source_archive` 比對：已匯入為綠色、未匯入為紅色、有新檔或遠端新版本待匯入為灰色，無資料為空白；目前匯入月份 MUST 有動態標示。更新 archive 匯入後，即使所有判決內容未變、`judgment_documents.source_archive` 仍指向舊檔名，只要 `judgment_snapshots.source_archive` 已有該檔名，就 MUST 視為已匯入，不得重複列入未匯入清單或更新 badge。月份 tooltip MUST 包含本機壓縮檔、已匯入檔案、manifest latest／local fileset 與目前匯入檔名。
- **FR-104**: 法院名稱正規化分頁 MUST 提供「檢查法院名稱」並以年份列 × 月份欄顯示檢查結果：全部已正規化為綠色、需正規化為紅色（含完全未檢查、部分未正規化或無效值）、無資料為空白。summary MUST 只顯示「已檢查」與「需正規化」月份數，不得再顯示獨立的「未檢查」badge；下方明細與月份 tooltip MUST 保留未檢查與無效值筆數。結果 MUST 包含每月總筆數、已檢查、未檢查、無效值、需正規化與有效比例；進入分頁 MAY 自動檢查，並 MUST 可手動重新檢查。
- **FR-105**: 建立條文歷史分頁最上方 MUST 提供「檢查條文歷史／檢查是否需建立」，以年份列 × 月份欄顯示：該月所有版本都有歷史條文為綠色、完全未建立為紅色、部分版本已建立為灰色、無資料為空白；目前版本 MUST 有可辨識外框。結果 MUST 包含版本數、法規／命令版本數、版本 ID、已建立／未建立版本、需建立／可建立／缺原始檔版本、條文列與預期條文數。需建立版本 MUST 逐筆標示是否能找到原始 Parquet；缺原始檔者 MUST 標示無法建立。進入分頁 MAY 自動檢查，並 MUST 可手動重新檢查。面板 MUST 顯示 Qdrant Docker context、container、image、容器內儲存路徑、volume 名稱／容量、host 來源路徑與 collection points／segments。
- **FR-100**: 效能報表的 Flow 時間軸 MUST 顯示每個 segment 的實際開始時間（`started_at`）與「本點到下一點」區間；區間 MUST 以下一點 `offset_ms` 減本點 `offset_ms` 計算，最後一點使用本段 `duration_ms`。長條 MUST 依 `offset_ms` 定位、依該區間佔總 Flow 時間的比例決定寬度。「累計」MUST 採流水線累加：第一點 `offset_ms` 到本點結束的差額，不得使用父區段自身的 `duration_ms`；第一點的累計等於其點位區間，最後一點的累計等於總 Flow 時間。
- **FR-101**: RAG MUST 將法規與命令納入檢索：以 PostgreSQL `law_documents` 比對問題中的法規／命令名稱與常見簡稱（例如 `證交法` → `證券交易法`），並從最新法規 Parquet 讀取相關條文、沿革與制定日期；回應 MUST 包含 `law_sources`，且法規來源不得被虛構或誤標為判決。
- **FR-102**: 問題為條文數、制定／開始日期、首條／末條或判決引用統計時，系統 MUST 以檢索到的法規 metadata、條文與判決引用次數產生可驗證的結構化回答，並標示引用編號。「最後／末條／第一條／最先」等語句 MUST 轉為首末條查詢碼，直接回傳**最後／第一條有效條文**的條號與內容；若最後或第一個條號已刪除，MUST 由模板補上「最後／第一個條號第 X 條已刪除：內容」並明寫「有效條文」，全部由資料產生，不得交給 LLM 改寫。「有幾條／共有／總共／多少條文」MUST 以最新 Parquet 的 `ArticleType == "A"` 區分條號總數、已刪除條數與現行有效條數，且**現行有效數 MUST 為第一個數字**；含「之」條時補「條號含『之』條（如第 156-1 條）」。回答 MUST 以資料集版本日標示「資料截至」，法規最後異動日為輔，不得寫成「現行」而隱含即時性。一般法律問題的回答本文 MUST NOT 附條數統計；來源卡則一律保留精簡行「N 條生效（共 M 條號，已刪除 K 條）」並帶資料版本日。 quantity/order 類問題若未命中任何已實作規則（例如「第三章有幾條」「最近一次修正是哪天」「這部法有幾章」），MUST 直接回「無法確認：本系統目前不支援這類統計或排序查詢」，不得交給 LLM 自由回答。引用統計 MUST 說明其為判決引用次數，不得宣稱定罪率或勝訴率。
- **FR-103**: 法規／命令來源存在時，即使 Qdrant 未設定、無法連線或沒有相似判決，RAG MUST 仍能使用法規／命令內容回答；只有在法規與判決來源都不存在時才可降級為預覽或 `retrieval_only`。
- **FR-104**: RAG 回覆中的法規／命令卡 MUST 可點擊開啟原文 dialog，內容 MUST 從本地法規 Parquet 快照讀取完整 `law_articles`；dialog MUST 一次列出全部條文（不得分段分頁），並顯示來源快照、法規沿革與來源網站，且 MUST 可透過 X、「返回回答」或點擊外部關閉。
- **FR-105**: 法規／命令發現型問題（例如「有哪些法規和壽險及產險相關？」）MUST 依資料庫名稱與類別關鍵字整理相關法規與命令，回應 MUST 包含 `law_sources` 清單並標示這不是完整列舉；判決引用統計若改用全文比對，MUST 在回答中標示「全文提及」。
- **FR-106**: 資料庫頁 MUST 在資料庫選項下方提供「查詢／Schema」切換；Schema 模式 MUST 依目前法規命令或判決分類，列出所選資料庫的資料表／collection／object store；點選資料表後 MUST 留在 Schema 模式，並在右側顯示欄位名稱、前 10 筆資料與總筆數。表頭 MUST 可依實際欄位名稱排序；欄位名稱上方 MUST 提供逐欄 fuzzy 搜尋列與下拉建議。建議 MUST 回傳所有符合值（上限 1,000 筆），依相似度排序（完全相同、前綴、出現位置、長度與序列相似度）；模糊查詢 MUST 以 2-gram token 聯集找候選，例如「證券設置」MUST 找到「證券商設置標準」與「證券投資信託事業設置標準」。列表 MUST 標示輸入關鍵字（可分段標示），選取建議後 MUST 套用該欄位值並顯示符合記錄。Schema 預覽中的法規名稱 MUST 可點選，並開啟該法規的完整報表；報表條文 MUST 從本地 Parquet 快照讀取。
- **FR-107**: 判決分類 MUST 提供 Parquet 資料庫選項，查詢 MUST 讀取最新原始判決 `raw.parquet` 並支援關鍵字、法院、裁判日期、引用數與排序；結果的案號 MUST 可點選並以 `source=parquet` 開啟原判決。
- **FR-108**: 一般查詢報表 MUST 使用單列精簡表格：每筆記錄不得因欄寬不足換行，欄寬 MUST 依內容調整並允許水平捲動；表頭 MUST 可依實際欄位排序，並 MUST 提供逐欄 fuzzy 搜尋與相似度排序建議。
- **FR-109**: 法規報表 MUST 一次載入並顯示全部條文，不得使用條文上一頁／下一頁分頁；MUST 提供「跳至第幾條」輸入框，接受 `100`、`第100條`、`37-1` 等格式，按 Enter 或按鈕後 MUST 捲動至該條並醒目提示；條文超過 100 條時 SHOULD 提供浮動跳轉控制。
- **FR-110**: 相對時間語意（近／最近／過去 N 年、N 年內，含中文數字「近二年」「最近兩年」）MUST 在 query parser 轉成絕對 `date_from`／`date_to`（以今日為終點），不可只轉成整年 `year_from`。此日期範圍 MUST 同時套用到 PostgreSQL `judgment_documents.jdate`、Qdrant `jdate_num` range filter、keyword list 的 hard-constraint violations，並寫入 `query_filters` trace metadata。未命中相對時間規則時 MUST NOT 猜測年份。挖到 2026-11-23 問「近二年」時範圍 MUST 為 `2024-11-23`～`2026-11-23`，超出範圍的舊判決不得出現在清單或引用卡。只有相對日期、沒有法院／年份／案由等可列舉條件的語意題（例如「近二年證券違約交割的判決有那些」）MUST 走套用日期 filter 的向量檢索，不得把日期範圍內的全部判決當成語意命中清單。
- **FR-110**: 全站 sticky／fixed 的 header 與導覽列 MUST 使用不透明背景，MUST NOT 依賴 `backdrop-filter` 即時模糊背景；連續滾動時 MUST NOT 閃爍、消失或重新播放進場動畫。
- **FR-111**: 所有 `scroll` 事件處理器 MUST 在沒有實際可見狀態變更時提前返回，不得在每次 scroll 重建、清空或查詢與滾動無關的 DOM；此類 listener SHOULD 以 passive 模式註冊。查詢報表的換頁、排序與每頁筆數切換 MUST 保留目前內容並以低調的更新狀態呈現，不得先替換為骨架或重播進場動畫；表格、報表卡片與其內部資料呈現元素（例如分布條）MUST NOT 套用會隨資料重繪而重播的 animation 或 transition。
- **FR-112**: 全站所有頁面（`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`）凡因自動更新、後端推送、手動重新整理、換頁、排序、每頁筆數切換、篩選、分類切換或 dialog 內容替換而重新繪製的區塊，MUST 直接以最終樣式呈現；MUST NOT 套用進場動畫、淡入／淡出、`opacity` transition、位移 transform、會重播的 keyframes、半透明 refreshing 覆蓋或先替換為骨架。表格、報表卡片、分布條、時間表、清單、統計卡與 dialog MUST 在新資料抵達前保留目前內容，抵達後一次更新。
- **FR-113**: 僅表達實際執行狀態的視覺回饋 MAY 使用動畫：進度條、spinner、串流游標、狀態脈動、toast、展開／收合與 hover／focus 效果。這些效果 MUST NOT 因後端推送、重新整理或區塊重繪而從頭播放，且 MUST NOT 以淡出、變透明或遮罩方式隱藏目前資料。全站 MUST NOT 使用 `backdrop-filter` 或類似的即時背景模糊裝飾 sticky／fixed 導覽列（依 FR-110）。
- **FR-114**: 路由切換時舊頁面 MUST 保持顯示直到新頁面內容同步就緒，不得先插入整頁 skeleton、白屏或重播頁面進場動畫。裝飾性固定背景 MUST 使用獨立固定圖層或等效方式呈現，不得讓主要捲動容器在每次 scroll 時重繪固定背景。
- **FR-115**: `#/processing` 中含 embedding 的流程執行資訊 MUST 顯示「Embedding 主機／模型」按鈕列，按鈕文字 MUST 為「主機:模型」，列出所有線上且已確認具備 `embedding` 能力的模型；目前使用中的模型 MUST 以 active 按鈕標示。點選按鈕 MUST 以 `role=embedding` 儲存該主機的模型、將該主機設為第一優先並持久化，其餘主機依序作為備援；第一優先主機無法提供 embedding 時，系統 MUST 依序自動嘗試下一台，直到成功或全部失敗。後續的法規／命令索引、判決向量索引與完整資料更新 MUST 使用此持久化設定，不得只套用到部分工作流程；CLI 明確指定的 embedding URL／模型 MAY 覆寫此設定。MUST NOT 再顯示拖移主機卡片或上下箭頭作為主要選擇方式。離線主機與未確認 embedding 能力的模型 MUST NOT 出現在按鈕列。
- **FR-116**: `#/performance` MUST 提供 RAG Pipeline waterfall，且每次 `#/rag` 回答 MUST 在「後端處理流程」收合面板內以相同規格與相同視覺格式嵌入該次請求的完整 waterfall card（含 header、Trace ID、摘要、完整 Flow 連結、時間軸與展開明細）；二者 MUST 共用同一套階段、摘要、時間軸與展開明細。`#/rag` 回答底部 MUST NOT 再重複第二份相同 waterfall。Waterfall MUST 將單次 RAG Trace 的 Parsing、Embedding、Qdrant、Reranker、Context、LLM 與 Response 依執行順序由左至右緊密排列，每一階段 bar MUST 從上一階段 bar 的結束位置接續開始，不得留下未追蹤空隙或互相重疊；實際 `started_at`／`finished_at`／`offset_ms`／`end_offset_ms` MUST 保留在展開明細與 hover 資訊中。每個 span SHOULD 記錄模組、函式、參數與階段監控欄位：Parsing 輸入長度、Embedding Model／Token／Batch、Qdrant Collection／Filter／Top K、Reranker Model／候選數、Context Chunk／Token、LLM Model／Input／Output Token／TTFT、Response 總耗時／引用數／Abstain。點選階段 MUST 可查看上述欄位與開始／結束時間。
- **FR-117**: `#/rag` 首頁狀態區 MUST 彙整所有可用主機已確認支援 chat 的模型按鈕，按鈕名稱 MUST 使用「主機名稱:模型名稱」（例如 `mbp:gemma3:4b`、`x570:gemma3:4b`）；可用模型 MUST 以綠色呈現，目前使用中的 provider／模型 MUST 有明確標示，點選其他模型 MUST 切換並持久化，且下一次提問 MUST 立即使用新模型。切換 LLM provider MUST NOT 改變 embedding 主機的優先順序。同一主機名稱同時對應 Ollama 與 llama-server 兩種 provider 時（例如 `x570:11434` 與 `x570:11436`），MUST 以實際 effective provider 顯示該模型按鈕，MUST NOT 產生重複的「主機:模型」按鈕；按鈕 hover title MUST 顯示實際 base URL，讓使用者可區分同名主機。若模型尚未測試 chat 能力，介面 MUST 提供重新檢查入口；不得把未測試或確定不支援 chat 的模型標示為可用。
- **FR-118**: `#/status` 的 Model Provider 主機模型清單 MUST 顯示每個模型已測試的能力標籤（至少 Chat、Embedding、Vision、Tools、Thinking、Speech、Reranker 中適用的項目）；尚未測試的模型 MUST 明確標示「未測試」，不得推測其能力。介面 MUST 提供「檢查模型能力」動作，檢查所有可用主機並更新快取。
- **FR-119**: 全站所有「以時間呈現執行流程」的視圖 MUST 共用同一套 waterfall 元件與視覺規格（以 [`pipeline-waterfall.md`](pipeline-waterfall.md) 為準；axis、階段列、bar、可展開明細、hover 資訊卡）；至少涵蓋 `#/rag` 後端處理流程收合面板（內含完整 RAG Pipeline card）、`#/performance` 的 RAG Pipeline、效能 Flow 紀錄、測試 Flow、`#/processing` 的 Qdrant 判決向量索引版本建置 Pipeline、判決匯入與非索引 workflow 流程進度、`#/status` 服務總覽載入 Pipeline，以及 `#/home` 即時摘要載入 Pipeline。RAG Pipeline MUST 採依執行順序接續的水平排列；效能 Flow 與測試 Flow MAY 依實際 offset 呈現平行 span。靜態架構圖與資料流程圖不屬於時間軸流程，可維持原呈現。`#/processing` 的處理總覽 MUST NOT 使用 waterfall；改用 FR-142 的「法規」「命令」「判決」三張四階段月份時間表。
- **FR-120**: waterfall 中任何使用模型的 span（Embedding、LLM、Reranker 等）與其 Model Load 區段 MUST 在階段列、明細與 hover 資訊中標註「主機名稱:模型名稱」；主機名稱取自 Model Provider 設定，舊資料找不到名稱時才退回 URL hostname。
- **FR-121**: 使用模型的 span SHOULD 記錄 Ollama `load_duration`，並在對應 Embedding／LLM 階段的 bar 內，以獨立的藍色前段呈現 Model Load；不得把不同來源的載入合併，也不得另列成與來源階段未對齊的子階段。展開明細 MUST 將 Model Load 與推論分成兩個區塊，各自顯示實際開始／結束時間與耗時，且 Model Load 的結束時間 MUST 等於推論的開始時間。該區段 MUST 分開呈現冷啟動載入耗時、模型呼叫總耗時、扣除載入後（熱啟動）流程時間與載入占比，讓冷啟動與熱啟動可直接比較。載入時間為 0 或低於門檻時 MUST 標示為熱啟動。
- **FR-122**: 滑鼠移到任一 waterfall bar 上時 MUST 顯示該 span 的資訊卡，內容與該階段展開明細一致，至少包含開始／結束時間、耗時、模型／主機與可用監控欄位；資訊卡 MUST 跟隨指標並避開視窗邊界，離開 bar 或捲動時 MUST 隱藏。
- **FR-123**: 根網址與預設路由 MUST 顯示獨立 `#/home` 首頁；品牌標誌 MUST 導回首頁。首頁 MUST 包含主視覺、可直接輸入問題的輸入框、七個主要分頁的介紹 section，以及包含 MIT 授權、Copyright 與法律免責聲明的 footer。首頁送出問題後 MUST 導向 `#/rag` 並自動以該題目發問。首頁 MUST 另包含即時資料卡、重要數據卡、RAG 能力與引用追溯區、司法院 OpenData／全國法規資料庫來源卡、金融法規清單，以及 `/api/home` 載入 Pipeline waterfall；實際內容與資料契約見 FR-166–FR-168。
- **FR-124**: RAG MUST 支援 cross-encoder reranker。程式預設 `RAG_RERANK_ENABLED=false`，目前 `.env` 覆寫為 `true`。啟用時 MUST 先向 Qdrant 取得 `RAG_RERANK_CANDIDATES` 筆候選，依序嘗試 `RERANK_URL` 與 `RERANK_FALLBACK_URL` 的 `/v1/rerank` 或 `/rerank`，再依 rerank 分數取 `RAG_TOP_K` 筆進入 Context；不得把 reranker 當成 chat 模型。`rag.rerank` Flow MUST 記錄 model、provider、候選數、選用數、top score、fallback 與錯誤。主要與 fallback 都失敗時 MUST 保留原本 Qdrant 排序並將 `retrieval.rerank.status` 標示為 `degraded`，不得因此讓回答失敗。第一輪預設模型為 `bge-reranker-v2-m3`。
- **FR-125**: `#/rag` 的模型狀態區 MUST 另列 Rerank models，顯示主要與 fallback reranker 的「主機:模型」；可用者 MUST 以綠色呈現，離線、degraded 或未啟用者 MUST 以灰色呈現，並標示目前實際使用的 reranker。區塊 MUST 提供重新檢查健康狀態的動作；reranker 設定未啟用時 MUST 顯示「未啟用」，不得把離線模型標示為可用。
- **FR-126**: RAG MUST 區分法規優先（law-first）與判決優先（judgment-first）。問題含明確法規名稱或法規導向詞彙（規定、條文、義務、責任、限制、罰則、從業人員、負責人、職員等）時 MUST 採 law-first；含判決、案例、法院、實務等詞彙時 MUST 採 judgment-first。law-first 時法規／命令 context MUST 排在判決前、法規 citation MUST 從 `[1]` 開始、判決最多保留 `RAG_LAW_FIRST_JUDGMENT_LIMIT` 筆；LLM prompt MUST 要求以現行法規／命令條文為主要依據，判決僅作實務補充。`那些規定`／`有哪些規定` 不得被誤判為「列出相關法規」，且未實際回傳結構化清單前 MUST NOT 清空已選出的法規 articles。純判決列表問題（例如「在板橋地方法院相關詐騙的判決有那些」）MUST 採 judgment-first，MUST 以檢索到的判決產生 `retrieval_list` 清單，逐筆包含案號、法院、裁判日期、案由與和問題相關的事實句；MUST NOT 讓僅因法院名稱命中的法規／命令（例如「地方法院…處務規程」）進入最終 `law_sources`，且 MUST NOT 以法規條文取代判決清單。
- **FR-127**: 法規／命令條文 MUST 使用獨立於判決的 Qdrant collection 與 alias（預設 `legal_articles_vNNN`／`legal_articles_current`），MUST NOT 寫入判決 collection。索引 MUST 使用 `bge-m3`，只收錄有條號與內容的現行條文，payload MUST 包含 `source_type`、`law_key`、`law_name`、`article_no`、`article_content`、`content_hash` 與版本 metadata。CLI MUST 支援全量建置、`--incremental`、`--if-changed`、`--dry-run`、`--status`、`--list-versions`、`--rollback`、`--no-activate` 與 `--discard-version`；建置 MUST 驗證 Qdrant 筆數、維度與取樣 payload 後才切換 alias，舊版本 MUST 保留供 rollback。
- **FR-128**: RAG 的法規／命令檢索 MUST 與判決檢索共用同一個查詢 embedding，MUST NOT 為兩邊重複呼叫 embedding。法規候選 MUST 以 BM25／概念排名與 dense 排名做 RRF（Reciprocal Rank Fusion）融合，`RAG_LAW_RRF_K` 與 `RAG_LAW_DENSE_WEIGHT` MUST 可調整；問題明確指名法規時，該法規 MUST 作為 anchor，dense 分數只用於排序其條文。法規與命令條文 MUST 分組 rerank，且法規條文 rerank MUST 與判決 rerank 分開執行；`retrieval.law_vector`、`retrieval.law_fusion` 與 `retrieval.law_rerank` MUST 記錄 alias／collection、候選數、top score、provider、延遲、fallback 與各 `source_type` 分組結果。alias 不存在、Qdrant 或 embedding 失敗時 MUST 退回 PostgreSQL／Parquet + BM25，不得讓 RAG 中斷。
- **FR-129**: x570 MUST 以 llama-server 作為 `gemma3:4b`、`bge-m3` 與 `bge-reranker-v2-m3` 的主要推論服務。`judgment-llm-chat.service` MUST 以 `--alias gemma3:4b` 提供 `/v1/chat/completions`（預設 `11436`），`judgment-llm-embedding.service` MUST 以 `--embedding --pooling cls --alias bge-m3` 提供 `/v1/embeddings`（預設 `11437`），`judgment-reranker.service` MUST 以 `--reranking --pooling rank` 提供 `/v1/rerank`（預設 `11435`）；三個 unit MUST 開機自動啟動並在 process 生命週期內常駐模型（llama-server 無 `keep_alive` 參數，此常駐語意等同 `keep_alive=-1`，詳見 FR-173）。`ollama.service` MUST 保留，但 `judgment-ollama-preload.service` MUST 停用，避免與 llama-server 重複占用 VRAM。MBP MUST 以 per-user launchd LaunchAgents `com.judgment.llm-chat` 與 `com.judgment.llm-embedding` 提供 `gemma3:4b` 與 `bge-m3` 的 llama-server fallback，兩者 MUST 只綁 loopback、登入自動啟動並在 process 生命週期內常駐；reranker MUST 由 `com.judgment.rerank` 的 llama-server 提供。Ollama MUST NOT 作為 runtime fallback。launchd 服務 MUST 可查詢狀態、重啟與解除安裝，且 MUST NOT 以假造狀態通過驗證。應用端 MUST 以 `LLM_API`／`EMBEDDING_API` 區分 OpenAI 相容與 Ollama API；`LLM_KEEP_ALIVE` 預設 `30m`，設為 `-1` 時以 JSON 數字送出，後續 Ollama fallback 請求 MUST NOT 縮短預載模型的保留時間。
- **FR-130**: BGE reranker MUST 以獨立的 `llama-server` 服務提供，MUST NOT 由 Ollama 載入或與 Ollama 共用 process。x570 MUST 使用 `judgment-reranker.service` systemd 服務開機啟動；MBP MUST 使用 per-user LaunchAgent `com.judgment.rerank` 於登入後啟動 llama-server。兩者啟動參數 MUST 以 `--model` 載入 `bge-reranker-v2-m3` GGUF 並啟用 `--reranking`；模型 MUST 在 process 生命週期內常駐，沒有 Ollama 式 `keep_alive` 或閒置卸載。`/health`、`/props`、`/v1/models`、`/slots` MUST 可查詢；`/metrics` 未以 `--metrics` 啟動時回傳 501，MUST NOT 視為服務失敗。應用端 MUST 以 `RERANK_URL` 為主要端點、`RERANK_FALLBACK_URL` 為備援，主要端點失敗時 MUST 自動 fallback。MBP 部署腳本 MUST 可查詢狀態、重啟與解除安裝，且 MUST 以實際 `/v1/rerank` 分數回應驗證服務。
- **FR-173**: x570 的三個 llama-server 模型 MUST 以「等同 Ollama `keep_alive=-1`」的方式預載並常駐，但 MUST NOT 假造 llama-server 不存在的 `keep_alive` 參數。實作 MUST 為：`scripts/deploy_llama_services_systemd.sh` 建立 `judgment-llm-chat.service`、`judgment-llm-embedding.service`、`judgment-reranker.service`，三個 unit 皆使用 `Type=simple`，`ExecStart` 一次載入 GGUF，`Restart=on-failure`、`RestartSec=3`，並 `systemctl enable`；service 存活期間 MUST NOT 閒置卸載模型，MUST NOT 傳入 `--idle-timeout` 或其他卸載旗標。安裝腳本 MUST 支援 `--skip-rerank`、`--uninstall`，並以 `JUDGMENT_INSTALL_RERANK`、`JUDGMENT_DISABLE_OLLAMA_PRELOAD`、`CHAT_PORT`、`EMBEDDING_PORT`、`RERANK_PORT`、`CHAT_ALIAS`、`EMBEDDING_ALIAS`、`RERANK_ALIAS`、`JUDGMENT_INSTALL_DIR`、`JUDGMENT_SERVICE_USER`、`LLAMA_SERVER_BIN`、`LLAMA_LIB_DIR` 等環境變數覆寫預設值。應用端 `LLM_KEEP_ALIVE=-1` 只用於 Ollama fallback；OpenAI 相容的 chat payload MUST NOT 包含 `keep_alive` 或 `options`。`up.sh` MUST 優先探測 x570 的 `11436`／`11437`，設定 `LLM_API=openai`／`EMBEDDING_API=openai`，並以 MBP llama-server `127.0.0.1:11436`／`11437` 作為 fallback；x570 llama-server 不可用時 MUST 改用 MBP llama-server。Ollama MUST NOT 作為 runtime fallback。
- **FR-174**: RAG MUST 在向量檢索前解析判決的結構化條件。`parse_judgment_query()` MUST 支援西元與民國年份、年份範圍、法院新舊名稱、主題（詐騙→詐欺、洗錢）與列舉意圖；法院別名 MUST 同時涵蓋歷史與現行名稱，並搭配 `jdate_num` 日期範圍避免把改制後判決納入舊年份查詢。Qdrant payload MUST 有整數 `jdate_num`（YYYYMMDD）與 `source_year`；`jdate_num` MUST 回填至所有 point 並建立 integer payload index，新匯入資料 MUST 同步寫入，MUST NOT 只依賴有缺漏的 `source_year` 做年份 filter。案由 MUST 在法院／日期 filter 範圍內用 `facet(title)` 動態取得含主題子字串的實際 title 值，MUST NOT 以手寫清單取代。`_search_hits()` MUST 將 `query_filter` 傳給 `QdrantStore.search()`；列舉意圖且具法院、年份或案由等可列舉 filter 時 MUST 以 `count()` + `scroll(order_by=jdate_num)` 回傳總筆數與前 20 筆，MUST NOT 用未套用條件的向量結果補位。只有相對日期而無主題／法院／年份時，MUST 使用套用日期 filter 的向量結果，不得 enumerate 整個日期範圍。回傳前 MUST 以 `violations()` 逐筆檢查年份、法院與案由；不符者 MUST 剔除。查無結果時 MUST 明確回答查無符合條件的判決，不得退回無 filter 的相似度結果。
- **FR-175**: RAG MUST 在檢索前建立 Query Plan，至少區分 `judgment_list`、`law_first`、`structured_semantic`、`semantic`，並記錄 structured／dense／lexical／enumerate／rerank 決策與原因。Query Plan MUST 寫入 `rag.query_plan` span 與 `retrieval.query_plan`。`judgment_list` MUST 使用 count + scroll 列舉；其餘路徑 MUST 先執行 dense 檢索。Dense 候選上的中文 bigram BM25＋weighted RRF lexical rescoring MAY 啟用，預設 MUST 為關閉（`RAG_LEXICAL_RRF_ENABLED=false`），直到 A/B Benchmark 顯示可量測的排序收益；啟用時 MUST 記錄 `retrieval.hybrid` 的 method、applied、candidates、lexical_matches、top score、rrf_k 與 lexical_weight。P1 的 lexical 通道是 dense 候選上的 RRF rescoring；真正的 sparse／BM25 索引需重建 collection，MUST 標示為 P1.5，不得把候選內 rescoring 宣稱為完整 BM25 retrieval。`scripts/rag_query_benchmark.py` MUST 可重跑分層測試，逐題檢查 filter violation、answer source、retrieval mode、no-match 與延遲。
- **FR-176**: RAG 回答完成後，問題泡泡與回答卡 MUST 提供操作工具列；桌面以 hover／focus 顯示，觸控裝置 MUST 固定顯示。問題工具列 MUST 支援複製、分享、編輯、重新提問；回答工具列 MUST 支援複製、分享、重新生成。複製回答 MUST 取得該回答的主要回答文字；分享 MUST 先將目前對話（最多 30 輪、1 MB）寫入 PostgreSQL `rag_share_snapshots`，快照 payload MUST 經欄位 allowlist 與 deep scrub 遞迴清除內部 host、端點、絕對路徑與錯誤訊息；直接複製專屬公開連結 `#/rag/share?contentId=<token>` 到剪貼簿，MUST NOT 開啟系統分享面板，也 MUST NOT 只複製問答文字。成功後 MUST 顯示「已複製公開連結」與「任何擁有此連結的人都可以查看這段對話。」的 toast，並提供開啟連結的動作。開啟分享連結 MUST 優先讀取快照並直接還原完整對話，MUST NOT 重新呼叫 LLM。分享頁 MUST 加上 `.is-shared-view`，並保留一般 RAG 頁面的雙欄版面與左側 `.rag-library`（顯示被分享者自己的本機歷史／專案，可能為空）；`.is-shared-view` MUST 只隱藏 `.rag-workspace-toolbar`；後續以 hash 導覽至其他頁面時 MUST 正常切換。快照 MUST 保留 7 天、回應 `Cache-Control: no-store`。舊版 `?share=`／`?q=` 查詢參數 MAY 保持相容，但新分享連結 MUST 使用 `#/rag/share?contentId=`。分享與複製操作完成後 MUST 釋放按鈕焦點，不得留下焦點外框。編輯 MUST 直接將原提問泡泡切換為 inline 編輯模式，全選原問題文字並聚焦；MUST NOT 在下方或續問框另開新輸入框。Enter MUST 以編輯後問題送出，Shift+Enter MAY 換行，Escape MUST 取消並還原原問題；失焦亦 MUST 還原原問題。送出後 MUST 以編輯後問題重新產生同一則提問的回答，更新原 turn 的問題泡泡、回答與歷史 payload，MUST NOT 在下方新增第二個 turn，也 MUST NOT 只改問題文字而保留舊回答。重新提問／重新生成 MUST 以原問題再次送出。工具列 MUST NOT 造成版面位移，390px viewport MUST 無水平溢出。
- **FR-177**: RAG 工作區右上方 MUST 顯示 `.rag-workspace-toolbar`，包含「分享給朋友」按鈕、三點對話選單按鈕與建立公開連結按鈕。「分享給朋友」點擊 MUST NOT 直接導覽，MUST 以 Web Share API 開啟系統分享選單並帶入 `https://judgment.ragdemo.win`；瀏覽器不支援或分享失敗時 MUST 複製該 URL 並顯示「已複製網站連結。」toast。分享完成後 MUST 釋放按鈕焦點。三點選單 MUST 只提供「重新命名」「釘選對話／取消釘選」「刪除」「移至專案」四項功能，不得包含分享；分享 MUST 由右側獨立按鈕建立公開連結並複製。選單 MUST 對目前 `currentConversationId` 操作；沒有可管理對話時 MUST 顯示停用項目與「目前沒有可管理的對話。」提示。分享按鈕 MUST 分享目前完整對話（含所有輪次）。`.is-shared-view` 分享檢視 MUST 隱藏整個工具列；390px viewport MUST 無水平溢出。完整 DOM、視覺、分享快照、toast、分享頁與無障礙契約見 [`rag-workspace-toolbar.md`](rag-workspace-toolbar.md)。
- **FR-178**: RAG 檢索狀態卡 MUST 預設收合，只顯示綠色狀態 icon、狀態標題、模型數 badge 與展開 chevron；收合時 MUST 隱藏說明文字與 `.rag-model-strip`。點擊狀態列或在其上按 Enter／Space MUST 展開／收合；展開時 MUST 顯示說明與模型表。重新檢查模型後 MUST 保留目前的展開／收合狀態。狀態列 MUST 有 `role="button"`、`tabindex="0"` 與同步的 `aria-expanded`。展開後 `.rag-model-strip` 內的標題、表頭、Chat／Embedding／Rerank 類型、模型名稱與備註文字 MUST 使用 `12px`；模型表 MUST 以 Chat／Embedding／Rerank 三列顯示，x570 MUST 為使用中、MBP MUST 為 Fallback，優先順序 MUST 為 x570 > MBP。
- **FR-179**: 全站分頁標題（`document.title` 與靜態 `<title>`）MUST 使用短版「Judgment｜金融法律判決 RAG AI 智慧分析平台」，包含英文品牌名稱且長度 MUST ≤ 35 字元，以適合瀏覽器分頁 hover 浮窗；路由切換、展示模式鎖定、管理頁攔截與頁面非同步 `setTitle()` MUST NOT 以頁面名稱覆寫。`meta description` 與 Open Graph／Twitter 分享描述 MUST 保留完整站點簡介「Judgment｜金融法律判決智慧分析平台。整合金融法規與法院判決，透過 AI 語意檢索與分析，協助快速查找相關案例、理解法律爭點，並提供具參考價值的判決分析。」。
- **FR-180**: Header 品牌標誌 MUST 使用「天平＋電路節點」幾何圖形，同時表達法律／判決（天平）與 RAG AI（三個節點與連線）；圖形 MUST 為 inline SVG、以 `currentColor` 著色，並在 34px 品牌磚內保持可辨識。品牌字標 MUST 使用襯線體 `JUDGMENT`，副標 MUST 為等寬體 `LEGAL RAG INTELLIGENCE`；`/favicon.svg` MUST 使用相同圖形與 `#76b900` 品牌綠。品牌連結的 `aria-label` MUST 為「Judgment 金融法律判決智慧分析平台 首頁」。
- **FR-181**: RAG Pipeline waterfall MUST 在既有 timing segments 之外提供 `decisions[]` 決策軌跡，記錄實際會改變結果的分支；每個 decision MUST 包含 `id`、`stage`、`question`、`method`、`offset_ms`、`duration_ms`、`options[]`、`selected`、`result`、`opaque` 與 `evaluated`（option 層級）。`selected` MAY 為單一字串或多選陣列；未實際評估的 option MUST 標示 `evaluated=false` 並附上實際短路原因，MUST NOT 事後編造拒絕理由。決策 MUST 由實際執行的程式碼路徑產生，MUST NOT 另外以結果反推一套解釋。至少 MUST 覆蓋：金融範圍 guard、未支援統計 guard、日期語意解析、法院／案由／列表意圖、route.intent、route.plan、filter.apply、retrieve.channel、post-filter violations、rerank、context budget、answer.mode 與 citation.audit。LLM 生成階段 MUST 標示 `opaque=true`，只記錄模型輸入摘要、輸出、Token 與耗時，MUST NOT 記錄完整 prompt、內部推理或其他使用者資料。`pipeline_flow.decisions` MUST 隨一般回應與串流結果送出，並保留在 `performance_records.flow` 供事後調校；`decision_version` MUST 為 additive schema version，舊 flow 缺少 decisions 時前端 MUST 仍可顯示原有 waterfall。決策數量與字串長度 MUST 有上限（例如 40 decisions、12 options/decision），記錄失敗 MUST NOT 影響回答。
- **FR-182**: `#/rag` 的「後端處理流程」完成後 MUST 以該次 `pipeline_flow` 的完整 canonical RAG Pipeline card 取代即時 step list；card MUST 包含 header、Trace ID、摘要、完整 Flow 連結、canonical RAG stages（Parsing／Embedding／Qdrant／Reranker／Context／LLM／Response，或結構化法規的 Parsing／法規檢索與統計／法條載入／Response）與 `decisions[]`。MUST NOT 直接把 raw `FlowTrace.segments`（例如 `http.request`、`rag.answer_question`、巢狀 `rag.extract_excerpt`）當成 waterfall 階段。canonical stages MUST 依 FR-116 由左至右接續排列，上一階段 bar 結束即下一階段開始；每一階段 MUST 使用同一份 `decisions[]` 顯示決策 badge 與可展開選項，MUST NOT 另建一套解釋資料。raw spans MAY 僅出現在展開明細或除錯 JSON，MUST NOT 形成第二套重疊的 waterfall。此完整 card MUST 直接嵌入收合面板內容；完成後面板 SHOULD 預設收合，展開時顯示完整 card。`#/rag` 回答底部 MUST NOT 再重複另一份相同 card。
- **FR-183**: 當使用者詢問「99 項金融法規是什麼／是那 99 條？」或追問「為什麼這個問題被拒絕回答／依據是什麼？」時，RAG MUST 以 deterministic 白名單回答，MUST NOT 呼叫 LLM，也 MUST NOT 將「99」解析成某部法律的第 99 條。回答 MUST 說明 `documents/金融法規.md` 目前有 99 項法規／命令、列出全部名稱、說明判斷依據（命中白名單名稱或銀行／證券／保險／洗錢等金融關鍵詞），並在拒絕原因題說明未支援統計／排序與非金融範圍是不同 guard。回應 MUST 使用 `answer_source=structured`、`llm_model=null`、`retrieval.status=scope_whitelist`、`retrieval.whitelist_count=99`，並在 `pipeline_flow.decisions` 記錄 `scope.whitelist` 的 list／refusal selection。
- **FR-131**: RAG 判決引用卡 MUST 以該判決 `citations` 中實際引用的法規／命令顯示「法規名稱＋條號」；判決全文在條號後緊接「第 n 項」時 MUST 一併顯示項次，同一法規／條號／項次 MUST NOT 重複。點選任一引用 MUST 開啟該法規／命令的完整條文，且 `第136條之1` 與本地 Parquet 的 `第 136-1 條` MUST 視為同一條文。回答上方已顯示「法規／命令檢索結果」時，回答下方 MUST NOT 再重複整張法規來源卡；結構化 framework 或 structured answer 仍可保留法規來源區塊。
- **FR-132**: Header MUST 在右上角提供齒輪「設定選項」按鈕，MUST NOT 另設 Style／調色盤按鈕；設定按鈕 MUST 使用 36px 圓形、與 header 一致的邊框與 accent 齒輪 icon，並以 `aria-expanded`／`aria-controls` 表示 sidebar 狀態。點擊後 MUST 從右側開啟設定 sidebar；桌機寬度 MUST 為 `380px`，`≤1100px` 時 MUST 縮為 `340px`，`≤760px` 時 MUST 改為全寬。Sidebar 開啟時 MUST 將 `.app-shell` 的 header、main、footer 與 toast 區域往左推，不得以覆蓋方式遮住目前頁面內容。Sidebar 上方 MUST 列出多個設定分類按鈕，按鈕區下方 MUST 有分隔線，分隔線下方 MUST 顯示目前分類的功能表；第一個分類 MUST 為「字型大小」。Sidebar MUST 支援齒輪再次點擊、右上角 X 與 Esc 關閉；關閉後 MUST 將焦點還給齒輪按鈕，隱藏時 MUST 使用 `inert`／`aria-hidden` 避免焦點進入。
- **FR-133**: 「字型大小」功能表 MUST 只列出目前頁面實際有匹配元素的文字區塊，以及已有儲存覆寫的區塊；分類至少 MUST 涵蓋頁面標題、首頁主視覺標題、區塊標題、內文與說明、表格內容、標籤與輔助文字、按鈕與導覽、表單與輸入、程式碼與數值、法規條文（頁面）、法規條文（彈出視窗）與判決全文（彈出視窗）。每列 MUST 有區塊名稱、說明、滑桿、可直接輸入的 px 數值與即時預覽；數值 MUST 限制在該區塊的合法範圍內，並允許小數。拉動滑桿或輸入數值時 MUST 立即套用到頁面對應 elements，MUST NOT 需要重新載入或按儲存才預覽。
- **FR-134**: 滑鼠移到字型區塊列上方，或列內控制項取得焦點時，MUST 以固定紅色（`#ef4444`）outline 與主題 accent 半透明背景標示所有對應的可見文字 elements，並在該列顯示預覽中狀態；紅色 outline MUST 與目前主題 accent 色有明顯區別。移出或失焦後 MUST 立即移除全部標示。Highlight MUST 只使用不影響 layout 的屬性（outline／background-color），MUST NOT 改變元素尺寸、位置或觸發頁面重排。Sidebar 內自身元素 MUST NOT 被列入 highlight 範圍。
- **FR-135**: 字型大小功能表最下方 MUST 提供「儲存」、「取消」、「回復預設值」。儲存 MUST 將目前覆寫寫入 `localStorage` 的 `judgment.fontSizes.v1`，重新載入、切換路由與動態新增內容後 MUST 繼續套用；取消 MUST 回到上次儲存值；直接關閉 sidebar MUST 視同取消未儲存變更；回復預設值 MUST 清除目前工作階段的覆寫，並在使用者再次按下儲存後清除本機設定。`localStorage` 不可用時，變更 MUST 仍在本次工作階段生效，且 MUST NOT 讓設定介面或頁面失敗。
- **FR-136**: 「介面風格」分類 MUST 重用既有 10 種主題，且分類按鈕 icon MUST 使用調色盤。每個主題項目 MUST 保留原名稱，但 MUST 以該主題 header 的呈現方式顯示：header 底色、header 文字色、muted 說明色、品牌頂部漸層線、header 邊框、主題圓角與 header 陰影；目前選取項目 MUST 有明確 active 狀態與 check。每個項目 MUST 在名稱／說明與右側色票之間顯示一個「作用中按鈕」預覽，使用該主題 header 作用中導覽項目的背景色、文字色、icon 色、pill 圓角與 notification badge 樣式，讓右側三色票的第一色能直接對應作用中按鈕。選取任一項目 MUST 立即套用該主題並寫入 `judgment.theme`，MUST NOT 重新載入頁面。Header MUST NOT 再顯示獨立的主題預覽按鈕或下拉選單。
- **FR-137**: 「介面風格」功能表標頭右側 MUST 提供「亮／暗／系統」三種明暗配置切換，預設為「亮」。切換 MUST 立即套用整體頁面、header、sidebar、卡片、表格與表單，不得重新載入頁面；「亮」MUST 使用目前主題原本的設計 token 與配色，MUST NOT 額外覆寫主題的 `--bg`／`--surface`／`--ink` 等顏色；「暗」MUST 套用共用暗色 palette；「系統」模式 MUST 跟隨 `prefers-color-scheme`，亮色系統偏好使用主題原始配色、暗色系統偏好使用暗色 palette，並在作業系統明暗改變時即時更新。選擇 MUST 寫入 `localStorage` 的 `judgment.appearance`，重新載入與切換頁面後仍保留；三個選項 MUST 有 active／`aria-pressed` 狀態且支援鍵盤操作。暗色模式 MUST 保持文字與背景對比、主題 accent 與品牌線可辨識，且不得出現大面積白色元件。
- **FR-138**: 完整資料更新（`POST /api/processing/update` 或 `judgment.processing_update`）MUST 在法規／命令下載後自動執行法規／命令條文索引更新，順序 MUST 為 `download → legal_qdrant → postgres → qdrant`；法規索引 MUST 使用 `judgment-index-legal-articles --incremental --if-changed` 語意，內容未變更時 MUST 跳過，變更時 MUST 建立新版本、驗證 points／維度後才切換 `legal_articles_current`，失敗時 MUST 保留舊 alias。`#/processing` 頁首 MUST NOT 顯示「資料更新」按鈕或「完成後接續 Qdrant 索引」checkbox；各階段 MUST 由 sidebar workflow 面板獨立操作。Processing workflow catalog MUST 提供可獨立執行的「法規／命令索引」workflow，且 MUST NOT 再提供 `full_update` workflow。「法規／命令索引」面板的「更新」按鈕 MUST 依 `legal_index_versions.update_available` 鎖定：只有 `update_available=true`（索引 stale／not_indexed）時才能點選；`false` 時 MUST 停用並顯示「目前未偵測到可重建的索引內容。」，不得讓使用者在沒有變更時誤觸重建。
- **FR-139**: `/api/status` MUST 回傳法規／命令索引的 alias、physical collection、active version、points、維度、法規數、條文數、最後建置時間與 freshness；freshness MUST 比對目前 PostgreSQL 法規數／條文數、最新資料版本時間與 active snapshot，並回傳 `fresh`／`stale`／`not_indexed`／`unknown` 與 reasons。`/api/status` 同時 MUST 回傳判決索引的 missing／changed／stale／pending 數量；`/api/processing/plan` MUST 包含 `legal_index` 狀態與 `recommended.legal_index`。
- **FR-140**: 判決索引更新 MUST 先偵測 missing、content hash changed 與 removed／non-current 的 stale points；任一 pending 大於 0 時 MUST 使用 `build-index-version` 的 blue-green 流程建立新版本、重用未變更向量、刪除 stale points、驗證後才切換 `judgments_current`。建置或驗證失敗時 MUST 保留舊 alias，MUST NOT 直接修改 active collection。
- **FR-141**: RAG Benchmark MUST 在 summary 計算 regression gate，固定檢查 law recall、article recall、judgment recall、citation valid rate、refusal accuracy 與 P95 latency；門檻 MUST 可由 `RAG_GATE_*` 環境變數覆寫。Benchmark API MUST 回傳 `summary.gate`，且 `scripts/rag_regression_gate.py` MUST 以 exit code 0 表示 pass／no_data、1 表示 fail、2 表示沒有完成的 run。`scripts/run_scheduled_update.sh` MUST 提供可給 cron／launchd／systemd timer 使用的單次更新入口，並以 lock 避免重疊執行。
- **FR-142**: `#/processing` 處理總覽 MUST 分為「法規」「命令」「判決」三個 section，每個 section MUST 使用 `import-files-card` 時間表框架，並與 `index-files-card` 索引檔案時間表使用一致的月份格視覺：`side-card-head index-runtime-head` MUST 以 2×3 `index-runtime-metrics` 顯示完成月份、未完成月份、有更新月份、總月份、完成率與完成階段；Embedding／Rerank 主機模型 MUST 顯示於 `index-runtime-summary`；目前版本或目前匯入列 MUST 使用 `index-current-row`；可水平捲動的年份×月份表格 MUST 使用 `judgment-months-table index-months-table processing-months-table`。每個月份 cell MUST 使用 `judgment-month index-month index-month-are processing-month is-neutral`（無資料月份為 `is-empty`），月份格底色 MUST 保持中性，不得以紅／綠／灰底色表示整體處理狀態；格內 MUST 以 `index-month-blocks` 的四個 `index-month-block processing-month-stage` 由左至右表示下載、Parquet、PostgreSQL、Qdrant，並固定使用綠色 `#22c55e`、粉色 `#ec4899`、藍色 `#3b82f6`、橘色 `#f59e0b`。已完成階段 MUST 為該階段顏色的實心方塊；未完成階段 MUST 為同色 1px 空心框、內部透明；執行中階段 MUST 以與「已處理（淡色）」相同的淡色垂直進度條填充已完成比例，不得使用完成時的實心階段色，外框仍使用階段色，且不得再顯示灰色「處理中」方塊；無資料 MUST 為淡色空心方塊。Qdrant 若已有先前處理進度但尚未完成（包含 active collection 覆蓋或同版本先前 run 的 `processed > 0`），MUST 以較淡的橘色實心方塊表示；alias 切換完成後 MUST 轉為實心橘色；完全未處理 MUST 保持空心。處理總覽判決時間表的 Qdrant 階段 MUST 隨 SSE `index_runtime` 即時更新：`current.month` 變更時，新月份 MUST 立即成為執行中進度條，前一月份 MUST 轉為已處理淡橙色；alias 切換後 MUST 轉為實心橘色，不得等待下一次完整 snapshot、頁面重新整理或固定輪詢。法規／命令 MUST 以來源版本月份（`update_date`）建立月份，目前列與月份 tooltip MUST 顯示 `version_code`；判決 MUST 以 1996-01–2026-08 的 368 個月建立月份，四階段分別由本機 `.rar`、raw Parquet manifest、PostgreSQL `issue_month`、Qdrant 月份覆蓋率判定，執行中的階段 MUST 以淡色垂直進度條標示目前進度。判決時間表 MUST 在 `index-runtime-summary` 顯示 Embedding 與 Rerank 使用的主機與模型，格式為「主機 模型」（例如 `x570 bge-m3:latest`、`x570 bge-reranker-v2-m3`）；hover 資訊 MUST 包含對應端點。法規／命令僅最新 current 來源版本的 Qdrant 階段需要索引；舊版本 Qdrant MUST 顯示淡色空心方塊與「已取代」tooltip，MUST NOT 標示為未完成紅色空心框，也不得要求重建舊月份索引。空心未完成階段方塊 MUST 可點選並切換到對應 workflow 面板：下載→法規／命令下載或判決下載；Parquet／PostgreSQL→法規／命令下載或判決匯入；Qdrant→法規／命令索引或 Qdrant判決向量索引版本建置。點選 MUST 只切換面板，不得自動啟動流程。時間表 MUST 訂閱 SSE `/api/events/stream` 的 `processing` topic；初次連線 MUST 收到完整 snapshot，後續 MUST 收到由 processing state 直接組成的 live payload（active import、workflow 階段訊息與進度、import timeline 月份更新），前端 MUST 直接套用 payload 並就地更新，不得再 GET `/api/processing` 取得進度。狀態變更時後端應在 0.5 秒內推送，不得重建表格或重設捲動位置，前端 MUST NOT 使用固定 timer 查詢進度。 `#/processing` 頁首 MUST 只保留標題、位於 h1 右側的副標題與執行中的停止按鈕；MUST NOT 顯示重新整理、資料更新或接續 Qdrant 索引控制項。
- **FR-143**: 時間表月份 cell MUST 顯示四階段 tooltip（下載／Parquet／PostgreSQL／Qdrant）與該月份檔案／版本資訊；目前處理月份 MUST 以清楚外框與 `aria-current` 標示；MAY 使用低強度脈動輔助辨識，但 MUST NOT 以動畫取代實際進度，也不得使用閃爍或滑動動畫。時間表 MUST 在表格上方以 `index-month-are-key` 顯示兩組 legend：階段顏色（下載綠、Parquet 粉、PostgreSQL 藍、Qdrant 橘）與階段狀態（實心完成、同色空心未完成、淡橙色實心已處理、同色垂直進度條執行中、淡色空心無資料），不得再顯示「處理中」灰階方塊；切換 workflow 或後端推送更新時，時間表、目前列與捲動位置 MUST 保持穩定。
- **FR-144**: 時間表的 hover／focus MUST 顯示該月份四階段狀態與檔案／版本資訊；workflow 流程進度的 hover MUST 顯示階段名稱、狀態、進度、筆數／耗時／訊息；tooltip MUST 避開視窗邊界，離開或捲動時 MUST 隱藏。
- **FR-145**: 法規／命令下載建立新 `law_dataset_versions` 版本時 MUST 產生以本地下載時間（Asia/Taipei）為基礎的單一版本編號 `YYYYMMDDHHMM`（例如 `2026/11/13 18:21` → `202611131821`），並持久化於 `version_code`；舊資料 MUST 由 `downloaded_at` 回填。法規／命令時間表的目前版本列與月份 tooltip MUST 顯示 `version_code`；下載、raw Parquet、解析、PostgreSQL 與法規／命令索引 MUST 使用同一版本編號，不得顯示空白版本編號。
- **FR-146**: `#/processing` MUST 在「法規／命令索引」「判決匯入」「Qdrant判決向量索引版本建置」workflow 面板提供 Embedding 主機／模型選擇器，不得放在頁面標頭；選擇器 MUST 使用可點選的 model 按鈕（與 RAG model strip 相同的視覺語言），列出所有線上且已確認具備 `embedding` 能力的模型，按鈕文字 MUST 為「主機:模型」（例如 `x570:bge-m3:latest`、`mbp:bge-m3:latest`）。選擇後 MUST 以 `role=embedding` 儲存該模型、將該主機設為第一優先，並在切換前警告既有向量索引可能需要重建。選擇器 MUST 可手動重新檢查線上主機；目前使用中的模型 MUST 以 active 按鈕標示，且 MUST NOT 列出離線主機或未確認 embedding 能力的模型。面板 MUST NOT 再顯示舊的逐列主機卡片、拖移把手或上下箭頭。
- **FR-147**: `#/processing` 的 workflow 面板 MUST 以實際完成百分比顯示各階段進度，不得顯示虛構百分比；尚無 bytes 總量時 MAY 使用不確定等待動畫，取得實際 bytes 後 MUST 顯示實際百分比與大小。「執行此流程」按下後 MUST 同步停用並顯示「執行中」，不得等待版本檢查或啟動 API 回應；版本檢查與啟動期間的 SSE 重繪 MUST 維持停用。後端 snapshot 確認新 run 執行中後 MUST 繼續停用並顯示「執行中」，不得因 snapshot 重繪恢復可按；只有啟動失敗或 run 結束且可再次執行時才恢復。法規下載、命令下載與判決下載的成功終態 MUST 使用同一個「完成」badge：`success`（有變更並套用）與 `no_change`（檢查後內容相同）不得顯示成不同完成標籤，是否真的變更 MUST 由執行訊息區分。按下後 MUST 立即顯示中止選項，且 MUST 保留目前的流程進度表與目前處理月份，不得清空、移除或隱藏；啟動期間的 SSE／panel 重繪 MUST 維持表格可見並標示「啟動中／執行中」，直到新 run 的 snapshot 抵達後才替換為新進度。若 workflow 沒有月份概念，MUST 顯示目前階段名稱。法院名稱檢查等輔助表格載入完成後 MUST 立即重繪，不得依賴下一次 SSE 才出現。判決匯入 MUST 在開始掃描壓縮檔前建立處理狀態 run 與逐檔清單；stage 訊息與月份時間表 MUST 立即顯示目前處理的 archive／月份，不得先對全部壓縮檔做大小掃描而延後狀態建立。判決匯入階段若尚無最終總筆數（例如原始 Parquet 與 PostgreSQL metadata），MUST 以已完成／執行中的壓縮檔數推算百分比，並保留累計筆數作為輔助資訊；尚未開始的階段 MUST 顯示 `0%`，已完成階段 MUST 顯示 `100%`。失敗階段的「失敗」badge MUST 支援 hover／focus 顯示失敗原因與建議解法；原因 MUST 從 run 錯誤訊息擷取並移除 SQL 參數／traceback，解法 MUST 依錯誤類型提供（例如 NUL 位元組→重新執行、連線失敗→檢查服務）。失敗 tooltip MUST 不被一般 stage hover 資訊卡遮蓋。`#/processing` 非索引 workflow 的流程進度（含判決匯入）MUST 使用與 RAG Pipeline／索引 Pipeline 相同的 waterfall 結構：標頭 MUST 以 `side-card-head index-runtime-head` 與 2×3 `index-runtime-metrics` 顯示完成階段、執行中、等待、略過、總耗時與整體進度；圖表 MUST 使用 `rag-wf-axis`、`rag-wf-stages`、`rag-wf-stage`、`rag-wf-track`、`rag-wf-bar`，階段依執行順序由左至右接續排列，已完成階段填滿階段色，執行中或未完成階段只著色已完成比例，其餘為同色 1px 空心框，等待／略過階段不繪製 bar，極短階段 MUST 以最小可見寬度呈現且不得與相鄰階段重疊。每個階段 MUST 提供以穩定 key 保存的展開明細與 hover 資訊卡，SSE 更新後展開狀態 MUST 保持；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **FR-148**: `#/processing` 的「判決匯入」workflow 面板月份時間表 MUST 使用與處理總覽相同的卡片格式：`side-card-head index-runtime-head` + 2×3 `index-runtime-metrics`、`index-current-row` 目前匯入列、`index-month-are-key` 兩組 legend 與可水平捲動的 `judgment-months-table index-months-table processing-months-table`；metrics MUST 顯示完成月份、未完成月份、有更新月份、總月份、完成率與完成階段。每個月份 cell MUST 使用 `judgment-month index-month index-month-are processing-month is-neutral`（無資料為 `is-empty`），月份底色保持中性。格內 MUST 以四個 `index-month-block processing-month-stage` 由左至右表示 RAR 檢查／解壓縮、原始資料檢查／Parquet 備份、金融法規篩選、PostgreSQL metadata，固定使用橘色 `#f59e0b`、粉色 `#ec4899`、紫色 `#a78bfa`、藍色 `#3b82f6`；完成 MUST 為實心方塊，未完成 MUST 為同色 1px 空心框，本次處理中 MUST 為同色調淡色垂直進度條，無資料 MUST 為淡色空心方塊，不得再以整格綠／紅／灰底色表示。可沿用原始 Parquet 的 archive，其 RAR 階段 MUST 標示為完成並註明「沿用、略過解壓縮」。「原始資料檢查／Parquet 備份」階段 MUST 先檢查既有原始 Parquet；可沿用時 MUST NOT 重新建立備份，只有缺少可用備份時才解壓縮並寫入新備份，stage 訊息 MUST 明確區分「沿用既有備份」與「缺少備份而新建」。缺少備份時，執行中訊息 MUST 顯示「建立 YYYY-MM 原始 Parquet 備份」，完成訊息 MUST 顯示「已建立 YYYY-MM 原始 Parquet 備份」；沿用時 MUST 顯示「沿用 YYYY-MM 既有原始 Parquet、未重新備份」，不得只顯示「檢查」或「沿用」。金融法規篩選與 PostgreSQL metadata 的 stage 訊息 MUST 顯示目前處理的 `YYYY-MM` 與 archive 檔名。金融法規篩選的執行中訊息 MUST 只顯示「已處理 current/total 筆候選。」，MUST NOT 再附加「命中 N 筆」；命中數只由右側金融案件欄位呈現。PostgreSQL metadata 階段的執行中筆數 MUST 顯示「總計 N 筆」，不得顯示「已寫入 current / total 筆」；階段訊息與耗時仍 MUST 保留。金融法規篩選的訊息列右側 MUST 顯示 `金融案件{matched} / 全部案件{raw_total_rows} 金融佔比{percent}%`（例如 `金融案件4,714,967 / 全部案件22,881,015 金融佔比20.6%`）；金融案件數 MUST 使用該 run 目前命中的金融案件數（`matched`），全部案件數 MUST 使用本次累計已處理原始判決數（`raw_total_rows`，例如 `22,881,015`），不得使用金融法規候選總數（`candidate_total`）或已掃描候選數（`scanned`）。百分比 MUST 以 `matched ÷ raw_total_rows` 計算並四捨五入至整數（例如 `4,714,967 ÷ 22,881,015 ≈ 20.6%`）；「金融佔比」標籤與百分比數字 MUST 以 strong 顯示，`金融案件`／`全部案件` 的數字也 MUST 以 strong 顯示。MUST NOT 使用 filter 進度百分比或 stage percent 代替。兩者 MUST 隨 SSE 即時更新。建立版本快照與 DuckDB 候選統計屬準備階段，MUST NOT 以 `current_archive` 逐檔移動時間表月份圈選；只有實際進入 filter／postgres 的 archive 才 MUST 更新目前月份、processing month 與灰色階段，確保逐月執行時逐月顯示。已由先前 run 匯入且本次尚未重跑的月份 MUST 保持該階段完成實心方塊；本次 run 開始處理時，尚無可用備份的 RAR／原始資料階段 MUST 以同色調淡色垂直進度條表示，完成後轉為實心方塊；若 archive 的既有原始 Parquet 仍可沿用，RAR 與原始資料階段 MUST 維持完成實心方塊（可顯示「沿用」訊息），不得因重新檢查而變回空心。metrics MUST 顯示完成月份、未完成月份（含處理中）、有更新月份、總月份、完成率與完成階段。目前匯入月份 MUST 以清楚外框與 `aria-current="true"` 標示（MAY 使用低強度脈動），目前執行階段 MUST 以同色調淡色垂直進度條表示；可沿用的 RAR／原始資料階段 MUST 維持完成實心方塊。目前列 MUST 顯示外框月份、archive、階段名稱，以及實際處理中的月份與 archive；當外框月份與處理中月份不同時，目前列 MUST 另顯示「處理中 YYYY-MM archive」。同一 run 的四個階段會重新走訪所有 archive，外框 MUST 維持在最高已啟動且尚未完成的月份，不得在後續階段退回較早月份；篩選階段從較早月份重新開始時，只有實際處理中且尚未完成的階段 block MUST 顯示進度條，外框月份的 cell MUST NOT 被標成該階段的處理中。月份 tooltip MUST 包含四階段狀態、本機壓縮檔與已匯入檔名。空心未完成階段 MUST 可點選並切換到判決匯入 workflow 面板，但 MUST NOT 自動啟動流程；表格 MUST 隨 SSE `processing` topic 推送就地更新（狀態變更時後端應在 0.5 秒內推送），不得重建表格或重設捲動位置，前端 MUST NOT 使用固定 timer 輪詢。
- **FR-149**: 判決匯入重新執行時，若目前金融法規清單 SHA 與最近一次 import run 相同，且 archive 的 raw Parquet 仍可沿用，系統 MUST 跳過先前 run 已完成（filter 與 postgres 均成功）或 PostgreSQL 已有 current 資料的 archive，從最新中斷／失敗／未完成的 archive 接續；MUST NOT 從第一個 archive 重跑已完成月份。中斷或失敗的 archive MUST 重新處理；金融法規清單 SHA 不同時 MUST NOT 跳過任何 archive。跳過狀態 MUST 寫入目前 run 的 archive 階段（extract skipped、raw_parquet／filter／postgres success），並在進度訊息標示「接續上次進度」。接續判斷 MUST NOT 對已完成 archive 逐檔重新掃描 RAR／raw Parquet；MUST 以先前 state 與 PostgreSQL snapshot 建立跳過清單。重新執行時 MUST 在開始階段一次掃描 raw Parquet manifest，批次比對 archive 路徑、大小與 mtime；相符的 archive MUST 直接標記 extract skipped／raw_parquet success，並排除於 extraction 排程，不得逐檔呼叫 manifest 查詢或逐檔更新 state。尚未完成 filter／postgres 但有可沿用備份的月份 MUST 只跳過 RAR／raw 階段，仍 MUST 進入 filter／postgres 排程。若判決下載替換 archive，導致路徑、大小或 mtime 改變，舊 manifest MUST NOT 再用於沿用；該月份 MUST 重新解壓縮並建立新備份，舊備份 MUST 依混合版本備份政策保留。RAR 檢查與 raw Parquet 階段訊息 MUST 顯示目前實際處理的 archive 檔名與已檢查／總數，讓使用者可判斷目前處理到哪個 `.rar`。
- **FR-150**: `#/processing` 的「判決匯入」目前月份外框、`processing_month` 與目前列 MUST 由 SSE `/api/events/stream` 的 `processing` topic 單一來源更新。初次連線 MUST 推送完整 snapshot；後續 MUST 由 processing state 直接產生 live payload，包含 `active_import`、workflow 階段訊息／進度與 import timeline 月份更新。前端 MUST 直接套用 payload，不得另開 `/api/processing/active/stream` 作為第二進度來源，也不得為了更新外框或階段訊息重新 GET `/api/processing`。`/api/processing/active/stream` MAY 保留給相容 API 用戶端，但 `#/processing` MUST NOT 使用。SSE 斷線時 MUST 自動重連，並由重新連線的初始 snapshot 補齊目前狀態。Event／active import 的 `month` MUST 以 canonical `YYYYMM` 對應時間表 `data-month`；前端 MUST 接受 `YYYY-MM`／`YYYY/MM`／`YYYYMM` 並正規化為 `YYYYMM`，目前列顯示時才格式化為 `YYYY-MM`。所有 SSE payload MUST 為 JSON-safe；`datetime`／`date`／`Path` 等型別 MUST 轉為字串，單一 payload 序列化錯誤 MUST NOT 中斷整條 SSE stream。
- **FR-151**: 全站即時資料 MUST 使用後端推送，前端 MUST NOT 以 `setInterval`／自迴圈 `setTimeout` 定期查詢 API。後端 MUST 提供通用 SSE `/api/events/stream?topic=...`，支援 `processing`、`judgment-download`、`test-runs`、`benchmark`、`updates`、`status`、`system-usage`、`ollama`、`court-check`、`law-version-check`；檔案／DB 類 topic MUST 在 state、manifest、progress 檔 mtime／size 或 DB 聚合簽章變更時推送 `refresh` event，外部服務狀態類 topic MUST 由後端每 30–60 秒推送。進度／流程類 topic MUST 在 event 中直接附帶完整 snapshot 或增量 payload，前端 MUST 直接套用並渲染，MUST NOT 因 event 再查詢進度 API。非進度類輔助資料 MAY 以 refresh event 觸發載入；同一 topic 每次推送可重新取得，但 MUST NOT 由前端固定 timer 發起。`#/status` 的系統資源與 llama-server 區塊 MAY 在 `status` topic 更新時重新取得 `/api/system-usage` 與 `/api/llama-server/hosts`。SSE MUST 每 15 秒送出 heartbeat，斷線時 MUST 自動重連並補送目前 topic 的初始 event；初始 event MUST 提供目前進度 payload，第一次連線 MUST NOT 觸發重複的進度查詢。判決下載月份表、更新 badge、測試 Flow、benchmark run、processing 時間表、系統狀態／資源與 llama-server 主機 MUST 全部改用此推送機制。
- **FR-152**: 全站所有進度與流程狀態 MUST 以後端執行狀態為唯一來源，並只由後端 SSE 發布；涵蓋 processing workflow 的階段／訊息／百分比、判決下載月份與檔案進度、Qdrant 索引進度、測試 Flow、benchmark run、更新檢查／下載進度、系統資源與服務狀態。前端 MUST NOT 使用 `setInterval`、自迴圈 `setTimeout`、固定延遲重試、`requestAnimationFrame` timer 或任何週期性 fetch/XHR 取得進度；MUST NOT 在收到進度 event 後再 GET 進度 API。由後端 topic 推送觸發的非進度輔助資料載入（例如 `#/status` 的資源與 llama-server 區塊）不在此限，但 MUST NOT 由前端自行建立固定 timer。後端 MUST 在 event 中直接提供完整 snapshot 或增量 payload，前端只負責套用 payload 並更新既有 DOM。初次連線 MUST 收到目前進度 payload；斷線重連 MUST 補送目前 payload。EventSource 不可用時 MAY 執行一次性 fallback GET 顯示目前狀態或錯誤，但 MUST NOT 轉為輪詢。執行中的進度事件 SHOULD 在 state 變更後 0.5 秒內推送；閒置且狀態未變時 MUST NOT 推送週期性進度事件。
- **FR-153**: 首頁「本站特點說明」、`#/data` 資料庫分頁與 `#/processing` 處理總覽 MUST 顯示「判決總件數」、「金融相關總件數」與「金融案件佔比」三項數值。判決總件數 MUST 使用最新判決原始 Parquet manifest 的 `row_count` 加總（全部已備份判決）；金融相關總件數 MUST 使用 PostgreSQL `judgment_documents` 中 `is_current = true` 的判決筆數；佔比 MUST 為 `金融相關總件數 ÷ 判決總件數 × 100`，四捨五入至小數 1 位。三者 MUST 來自同一份後端統計 payload；首頁與資料庫分頁 MUST 使用 `/api/judgment-stats` 與 catalog 的 `judgment_stats`，處理總覽 MUST 使用 processing snapshot 的 `judgment_stats`。任一數值無法取得時 MUST 顯示 `—`，不得以 0、候選數或索引數替代。首頁、`#/data` 與 `#/processing` 處理總覽 MUST 使用相同的三張 summary 卡片與順序：「判決總件數」、「金融相關總件數」、「JUDGMENT COVERAGE · 金融案件佔比」。判決總件數卡片 MUST 顯示「全部已備份判決」說明；金融相關總件數卡片 MUST 顯示「PostgreSQL current 判決」說明；金融案件佔比卡片 MUST 合併統計標題、佔比數值與「金融相關判決占全部已備份判決的比例。」說明。`#/processing` MUST 將三張卡片合併於 `.processing-summary` 卡片區，不得另顯示獨立的統計區塊。此統計 MUST NOT 使用 `matched ÷ scanned` 或 `matched ÷ candidate_total`。
- **FR-154**: `#/performance` MUST 新增「判決向量索引 Pipeline」分頁，資料來源為 `performance_records` 中 process 前綴 `判決向量索引` 的版本化建置紀錄。每次版本化建置 MUST 在 `details.pipeline` 記錄 `version_id`、`collection`、`alias`、`build_mode`、`resumed`、`resumed_indexed`、實際 `host`（host／port／url／role／using_fallback）、`model`、`total_ms`，以及 probe／version／copy／embedding／qdrant／postgres／validate／activate／report 階段的 `label`、`duration_ms`、`status` 與 `detail`。`probe` 與 `embedding` 階段 MUST 包含實際使用的 host 與 model。後端 `/api/performance` MUST 回傳不受一般篩選影響的 `index_pipeline` 統計；前端 MUST 顯示 host/model、版本／collection／alias、build mode、是否接續、各階段耗時與百分比，並支援切換最近 30 次紀錄。舊紀錄若無 `pipeline` MUST 顯示明確提示，不得以總耗時推測或虛構各階段時間。
- **FR-155**: `#/processing` 的「Qdrant判決向量索引版本建置」流程進度 MUST 使用 waterfall 形式，至少顯示 llama-server 主機／模型測試、建立／接續 Blue-Green 版本、複製可重用向量、金融判決向量索引、驗證新版本與切換 alias 六個階段。Waterfall 的 axis、階段列、bar、可展開明細與 hover 資訊卡 MUST 依 [`pipeline-waterfall.md`](pipeline-waterfall.md) 建置，並與 RAG Pipeline waterfall 相同規格；bar MUST 依階段耗時由左至右接續排列，上一階段 bar 的結束 MUST 等於下一階段 bar 的開始；極短階段 MUST 以最小可見寬度呈現，不得因寬度趨近 0 而與相鄰階段重疊。已完成階段 MUST 以該階段顏色填滿 bar；進行中或未完成階段 MUST 只以該階段顏色著色已完成比例，其餘部分 MUST 為同色 1px 外框、內部透明的空心 bar；等待與略過階段不繪製 bar；執行中的金融索引階段以目前時間延伸；金融索引階段的 bar 顏色 MUST 跟隨目前 phase：R 重用為藍色 `#3b82f6`、E 新 embedding 為紫色 `#a78bfa`，階段列左側識別色仍固定為 `#a78bfa`；展開狀態 MUST 在 SSE live 更新後保留。金融索引階段 MUST 在明細只顯示 R／E 兩條獨立分流 bar（R 藍、E 紫），兩條各自以自己的 total 計算，不得相加或畫成同一條 100% bar；A baseline 不得畫成第三條 bar，也不得畫入 04 本次 run 的進度 bar。複製可重用向量 MUST 獨立顯示 `copied / total points`，不得把舊 collection 筆數當成金融判決索引進度；金融判決向量索引階段 MUST 顯示 `indexed / expected_count 筆`（例如 `0 / 4,714,967 筆`）與重用／新 embedding 筆數。執行期間 MUST 顯示實際 host／model、版本、collection、build mode、目前月份與整體進度；複製階段尚無第一批時，目前月份 MUST 標示「準備索引」或「準備中」，第一批開始後 MUST 切換為目前索引月份。既有 active collection 只用於 E 無 backlog 判斷，MUST NOT 顯示為橘色 A 月份分格，也不得因新版本 `processed=0` 而全部轉灰；月份 tooltip MUST 只顯示 R／E 本次 run 進度，E 無 backlog 時可說明 active 版本已覆蓋。每個索引月份 cell MUST 拆成 R／E 兩格：R 為重用向量、E 為新 embedding；各格 MUST 以填充高度表示該月比例，並提供 R／E 圖例。summary MUST 顯示 R 完成、R 未完成、E 完成、E 未完成與總月份，不得再顯示 A 基線或泛用的「待索引」統計；R/E 分類 MUST 以該月是否包含新 embedding 為優先（`embedded > 0` 歸 E，否則歸 R），完成以新版本 `processed >= total` 判定，未完成以尚未完成判定，尚未開始的月份 MUST 依 active 基線歸入 R 未完成或 E 未完成。R、E MUST 使用兩種不同字色；未完成 badge 的背景 MUST 與頁面背景相同（透明），只有完成 badge 使用淡色背景。月份 cell 的 R/E 未完成 MUST 使用該組 font color 的 1px 內框；尚未開始的 R/E 月份中心 MUST 為頁面背景並以對應空心框標示，讓使用者直接看出尚待完成的 R/E 月份。目前索引中的月份 cell MUST 只以 border／outline 標示，padding 與兩個小格外部 MUST 保持透明，不得使用綠色背景、進度底色、脈動 box-shadow 或任何 padding 陰影；該月進度 MUST 只顯示在 R／E 小格內，該月未完成的 R／E 小格 MUST 顯示已完成比例，不得固定為 0%，tooltip MUST 顯示目前百分比。完成的 R/E MUST 使用填滿色彩；新版本處理中的月份 MUST 以外框標示，不得只以單一整體顏色取代 R／E 兩格。SSE live payload MUST 同步更新 `index_runtime`，不得只依賴初次 snapshot。版本建置中斷後以相同 `version_id` 續跑時，已完成月份的 R／E 計數 MUST 從同一版本所有先前 run 的 runtime 逐月份取最完整值恢復並合併；MUST NOT 只以 PostgreSQL `processed` 筆數重建月份而把 `reused`／`embedded` 歸零，也不得只選單一「最完整 run」而漏掉其他 run 已完成月份的計數。若目前顯示的 run 是續跑且其 runtime 尚未包含舊月份的 R／E，後端 snapshot 與 SSE live payload MUST 都以同一版本所有先前 run 的逐月份最佳值補齊後再提供前端。索引檔案時間表 MUST 在 `side-card-head` 內靠右顯示單一 2×3 指標表格，第一列為「已處理月份」、「已處理筆數」、「本次平均」，第二列為 `Elapsed Time`、`Estimated Total`、`Time Remaining`；六格 MUST 使用相同的 label／value 格式與視覺，不得混用 badge 或獨立時間 chip。「已處理月份」MUST 以 `processed >= total` 的完整月份計算，目前處理中的月份不列入；總月份 MUST 為唯一有效 `YYYYMM` 月份數。若頁面在索引執行中途才載入，MUST 以首次觀察到的時間與首次觀察到的已處理筆數作為基準，計算 `(最新筆數 - 基準筆數) ÷ (目前時間 - 基準時間)`；已結束或失效時使用 `finished_at`／`updated_at`。若首次載入時索引已完成，MUST 使用 `started_at` 至 `finished_at` 與全部已處理筆數計算。格式為「本次平均 N.N 筆/秒」，不得以未扣除中途基準的總筆數除以全程時間取代；該格 tooltip MUST 說明此為自本次頁面開始觀察的累計平均，後段若以新 embedding 為主速度會下降。
- **FR-156**: `#/processing` 的「法規／命令索引」workflow 面板 MUST 顯示「法規」與「命令」兩張索引版本月份時間表，每張卡片 MUST 使用與處理總覽相同的 `side-card-head index-runtime-head` + 2×3 `index-runtime-metrics`、`index-current-row` 目前版本列、`index-month-are-key` 圖例與可水平捲動的 `judgment-months-table index-months-table processing-months-table`。「法規下載」「命令下載」workflow 面板 MUST 分別顯示「法規 下載時間表」與「命令 下載時間表」，並重用相同 D／P／I 卡片格式與 `index_timelines` 資料；法規下載僅顯示 law timeline，命令下載僅顯示 order timeline。Metrics MUST 顯示完成月份、未完成月份、已取代月份、總月份、完成率與完成階段；完成率 MUST 將已取代月份視為已解決。每格 MUST 使用 `judgment-month index-month index-month-are processing-month`（無資料月份為 `is-empty`），以三個 `index-month-block processing-month-stage` 由左至右表示 D／P／I，固定使用綠色 `#22c55e`、粉色 `#ec4899`、藍色 `#3b82f6`；D 為下載版本、P 為 raw Parquet 與 PostgreSQL 就緒、I 為目前 active 法規／命令索引覆蓋。完成階段 MUST 為實心方塊，未完成 MUST 為同色空心框，執行中 MUST 為與「已處理」相同的淡色垂直進度條，無資料／已取代 MUST 為淡色空心方塊。舊版本 MUST 在 I 顯示「已取代」且不得列為未完成；同月多版本 MUST 顯示最新版本，tooltip MUST 包含版本編號、下載時間、法規數與條文數。月份表 MUST 顯示完成／未完成／已取代統計與目前版本列，處理中由階段進度條表示；並沿用既有 `file_timelines` 資料，不得新增重複的版本資料表。
- **FR-157**: `#/processing` sidebar 的「法院名稱正規化」MUST 在存在可正規化判決時顯示 numeric pending badge；數量 MUST 來自 PostgreSQL `judgment_documents` 中 `is_current = true` 且 `court_normalized = ''` 的筆數。badge MUST 顯示數字並以 tooltip 說明需正規化的筆數與 PostgreSQL 來源（例如「偵測到 N 筆判決需要法院名稱正規化。」）；無待處理或該 workflow 正在執行時 MUST 改回正常狀態 badge。後端 snapshot MUST 在 `database.court_pending_count` 與 workflow `pending_count` 提供同一數字。完成正規化後 pending 為 0 時 badge MUST 消失。
- **FR-158**: `#/processing` 的可更新 notice MUST 明確標示偵測來源（`update_origin`）、偵測機制（`update_mechanism`）、訊息（`update_message`）、數量（`update_count`）與檢查時間。法規／命令 MUST 標示為「線上來源」，機制為線上 ZIP 的 Content-Length 與本機版本 ZIP 大小比對；Last-Modified／ETag 僅記錄供追蹤，不得宣稱已用於更新判斷；判決 MUST 標示為「線上來源」，機制為司法院 resources 月份／fileset 與本機 `raw_rar`／下載 manifest 比對；法院名稱正規化 MUST 標示為「PostgreSQL／本機」，機制為 current 且 `court_normalized` 空值的筆數。sidebar MUST 對所有偵測到可更新內容的 workflow 顯示 numeric badge，tooltip MUST 使用同一 `update_message`；法院正規化 badge 仍以「可正規化判決 N 筆」說明。全站代表「可更新」的 icon MUST 一致使用 refresh（重新整理）圖示，不得使用 download 圖示代表可更新；download 圖示僅保留給實際下載動作。workflow 執行中時 sidebar MUST 顯示執行狀態，不得同時顯示更新數字。
- **FR-159**: `up.sh` MUST 以 detached session／process group 啟動 `judgment-web`，使啟動它的終端或 shell process group 結束時 MUST NOT 終止後端。優先使用 tmux session `judgment-web`，session 名稱 MUST 可由 `JUDGMENT_WEB_TMUX_SESSION` 覆寫；tmux 不可用時 MAY 回退 `nohup`，但 MUST 顯示警告。`up.sh` MUST 具冪等性：健康檢查正常的後端 MUST NOT 啟動第二個實例；同名 stale tmux session MUST 先停止再重啟。`.run/web.pid` MUST 寫入 9200 的實際 listener PID，不得只寫外層 wrapper PID。`down.sh` MUST 先停止同名 tmux session，等待 9200 port 關閉後再清理殘留 listener；並 MUST 繼續停止電源控制器與設定的 reranker。兩個腳本 MUST 支援同一個自訂 session 名稱。
- **FR-160**: `#/tests` MUST 提供「Reranker 服務測試」卡，顯示 `RAG_RERANK_ENABLED`、模型、primary／fallback URL、健康狀態、啟用狀態與最近測試時間。`GET /api/rerank/status` MUST 回傳 health-only 狀態；`POST /api/rerank/test` MUST 對每個設定的 reranker 執行實際 rerank 請求（固定 sample query／documents），回傳每個端點的 status、latency、candidate／selected 數、top score、scores、top result 文件片段與錯誤。任一端點可用時整體 status MUST 為 `operational`；全部失敗為 `degraded`；`RAG_RERANK_ENABLED=false` 或未設定 URL 為 `not_configured` 並顯示原因。測試 MUST NOT 修改索引、選取結果或 reranker 設定。UI MUST 在測試中停用按鈕並顯示「測試中…」，完成後以 toast／status 顯示結果。
- **FR-161**: `#/processing` 的「索引檔案時間表」MUST 以單一 2×3 指標表格顯示「已處理月份」、「已處理筆數」、「本次平均」、`Elapsed Time`、`Estimated Total` 與 `Time Remaining`，六格格式一致，且 MUST 位於該時間表的 `side-card-head` 內靠右，與標題同一列或自動換行，不得另設於標題列下方的時間區塊。`Elapsed Time` MUST 以本次索引 run 的 `started_at` 至 `finished_at` 計算，執行中則計算至目前時間；`Time Remaining` MUST 以「總筆數減去目前已索引筆數」的剩餘件數除以「本次平均」速度估算；`Estimated Total` MUST 為 `Elapsed Time` 加 `Time Remaining`。中途停止後重新執行時，MUST 使用新 run 的 `started_at` 重新計時，並只以剩餘件數估算，不得沿用停止前的 Elapsed 或已完成件數。缺少 `started_at`、總筆數或可用速度時 MUST 顯示「—」，不得顯示虛構時間；索引完成時 `Time Remaining` MUST 為 `0s`。時間格式 MUST 包含小時／分鐘／秒（例如 `12m 35s`、`10h 24m 01s`），390px viewport MUST 自動換行且無水平溢出。
- **FR-162**: `#/status` 的「服務總覽」MUST 在 hero 與服務卡片之間顯示「服務總覽載入 Pipeline」waterfall，依 [`pipeline-waterfall.md`](pipeline-waterfall.md) 建置。後端 `/api/status` MUST 回傳 `pipeline`，包含 `total_ms`、`started_at`、`finished_at` 與依執行順序排列的階段 `postgres`、`parquet`、`version`、`qdrant`、`embedding`、`llm`、`reranker`、`rag`、`coverage`、`staleness`、`legal_index`（可另有 `assemble` 彙整階段）；每個階段 MUST 包含 `key`、`label`、`caption`、`color`、`status`、`duration_ms`、`started_at`、`finished_at` 與 `message`，且階段耗時合計 MUST 等於 `total_ms`。前端 MUST 另外量測頁面初始化與 HTTP 往返，將瀏覽器端時間與後端階段結合成單一接續時間軸；標頭 MUST 以 2×3 指標顯示總耗時、Server、HTTP 傳輸、頁面初始化、最慢階段與完成階段；axis、階段列、bar、可展開明細與 hover 資訊 MUST 與 RAG Pipeline waterfall 相同。完成階段 MUST 填滿階段色，失敗階段 MUST 以 danger 色標示，略過階段不繪製 bar；極短階段 MUST 保留最小可見寬度。SSE 狀態更新後已展開階段 MUST 保持展開；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **FR-163**: `#/status` 的「前後端架構」MUST 以目前專案內容顯示四層架構：`Client · Browser`（RAG Console SPA、API Client + SSE、IndexedDB、Standalone Frontend）、`Application · FastAPI`（REST API :9200、SSE Broker、RAG Endpoint、Power Agent :9201）、`Pipelines · RAG / Batch`（RAG Orchestrator、Processing Runtime、Embedding / Rerank / LLM、Scheduler / CLI）與 `Data · Storage`（PostgreSQL、Qdrant、Parquet / Files、llama-server Hosts）。每個節點 MUST 有標題與副說明；有對應服務的節點 MUST 依 `/api/status` 服務狀態顯示正常或虛線降級樣式。架構卡片下方 MUST 另外內嵌一張可縮放的 SVG 流程方向示意圖，說明瀏覽器 REST／SSE、FastAPI → RAG、FastAPI → Processing Runtime、RAG／處理流程 → PostgreSQL／Qdrant／Parquet／llama-server、Scheduler／CLI → Processing Runtime 與瀏覽器 ↔ IndexedDB 的方向；SVG MUST 有 `role="img"`、`title`、`desc` 與圖例，使用主題 CSS variables 以支援亮／暗主題。390px viewport MUST 讓 SVG 在卡片內水平捲動，不得造成頁面水平溢出；console error MUST 為 0。
- **FR-164**: `#/status` 的「資料版本」MUST 沿用目前服務總覽的視覺語言重新呈現：頂部 hero MUST 顯示資料版本狀態、判決索引落後筆數、檢查時間、現行資料量、Parquet 檔案數／容量與 alias → collection，並以圓環顯示判決索引覆蓋率；索引落後時 MUST 使用 warning 色並以「判決索引尚缺 N 筆」為標題，不得只顯示靜態版本清單。Hero 下方 MUST 使用 2×3 指標卡顯示現行法規、現行命令、條文總數、資料版本、判決文件與判決向量索引；再以 `data-version-card` 顯示「PostgreSQL 資料版本」「IndexedDB 本機資料」「Qdrant 判決向量索引」「Qdrant 法規／命令向量索引」「Parquet 與執行狀態」五張卡片。PostgreSQL 卡 MUST 顯示資料版本總數、下載執行總數、最新版本 ID／類型／來源更新日／條文數／下載時間／current 狀態與 Parquet 路徑；IndexedDB 卡 MUST 顯示資料庫名稱、schema 版本、儲存模式、query_history／settings／audit_events 筆數與上限、總紀錄數、已用容量、可用配額，並說明本機只保存提問歷史、設定與版本稽核。每張卡片 MUST 使用 `index-current-row`、`data-version-facts`、`data-version-coverage` 等目前 status 元件；判決索引與法規／命令索引 MUST 分別顯示 alias、collection、版本、模型、Qdrant points、覆蓋率、剩餘／待補筆數與最近索引時間；法規／命令索引 MUST 顯示 dimension 與 fresh／stale；索引落後時 MUST 顯示可前往 Qdrant 判決向量索引版本建置的提示。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **FR-165**: `#/status` 的「API 端點」MUST 由 FastAPI 目前 route table 動態產生，不得只顯示固定 curation 清單；後端 `/api/status` 的 `endpoints` MUST 包含所有 `/api/` `APIRoute` 的 `method`、`path`、`label`、`deprecated`，排除 `HEAD`／`OPTIONS`，並包含 `/api/docs` 與 `/api/openapi.json`。前端 MUST 顯示 hero（OpenAPI 最新、端點數、分類數、API Base、GET／POST／PATCH／PUT／DELETE 數量、更新時間、Swagger UI／OpenAPI JSON 連結），並依分類分組：系統與即時狀態、資料處理與更新、查詢與資料、RAG 問答、版本與索引、模型與服務、測試與效能、題庫、Benchmark。每列 MUST 顯示 method 色彩、path 與 label；deprecated 端點 MUST 有刪除線或降級樣式。端點變更後重新整理頁面 MUST 取得最新 route table；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **FR-166**: `/api/home` MUST 回傳首頁即時摘要，包含 `data.laws`（現行法規／命令與條文數、資料版本數、下載執行數）、`data.judgments`（原始判決總數、金融 current 判決數、金融佔比、裁判日期與年份範圍）、`data.raw`（原始 manifest 的 archive 數、筆數與壓縮容量）、`data.rag.judgment_index`（已索引／總筆數、覆蓋率、alias、collection、version、model、最近索引時間）、`data.rag.legal_index`（points、條文數、法規數、alias、collection、version、dimension）、`data.rag.models`（embedding／LLM／reranker 名稱與 rerank 啟用狀態）、`data.financial_laws`（清單筆數、法規名稱、原始內容、來源路徑、SHA-256、修改時間）與 `data.sources`（司法院 OpenData、全國法規資料庫、金融法規清單）。金融判決總數與佔比 MUST 與 `/api/judgment-stats`、processing snapshot 使用相同的 `judgment_stats_from_counts` 定義；法規／命令數 MUST 與 `/api/status` 的 PostgreSQL current 統計一致；法規清單 MUST 直接讀取 `documents/金融法規.md`，不得在前端或後端複製固定名單。端點 MUST NOT 等待 `/api/status`、`/api/processing` 或 `/api/quality`，任一階段失敗時 MUST 回傳其餘可用資料、`status` 標示 `degraded`、`errors` 說明失敗原因，不得捏造數值。
- **FR-167**: `#/home` MUST 以 `/api/home` 顯示即時資料卡：法規／命令數、金融判決數、裁判年份與年數、判決向量索引筆數與覆蓋率；並顯示六張重要數據卡（判決總件數、金融相關總件數、金融案件佔比、法規、命令、法規／命令條文）與三項事實（原始判決備份、金融判決年份、向量索引覆蓋）。RAG 能力區 MUST 顯示判決索引、法規／命令索引、Embedding／LLM／Reranker、判決與法規引用追溯路徑，並提供 `#/rag`、`#/data`、`#/performance` 入口。來源區 MUST 顯示司法院資料開放平臺與全國法規資料庫的實際筆數與外部連結，並以 `<details>` 收合金融法規清單；展開後 MUST 列出 `documents/金融法規.md` 全部 99 條法規，固定每列 11 條（共 9 列），顯示編號、名稱、來源路徑、SHA-256 與修改時間，並可下載原始清單。390px viewport MUST 仍維持 11 欄且無水平溢出。
- **FR-168**: `#/home` MUST 以 [`pipeline-waterfall.md`](pipeline-waterfall.md) 的共用 `.rag-wf-*` 結構顯示 `/api/home` 載入 Pipeline，階段 MUST 依實際執行順序排列，至少包含 `laws`、`judgments`、`raw`、`judgment_index`、`legal_index`、`financial_laws` 與 `assemble`；每個階段 MUST 有穩定 `key`、`label`、`caption`、`color`、`status`、`started_at`、`finished_at`、`duration_ms` 與 `message`。前端 MUST 顯示階段總耗時、HTTP 往返、傳輸／排隊、最慢階段、完成階段數與更新時間，並在階段列標示「最慢」；bar MUST 依階段耗時接續排列，極短階段 MUST 保留最小可見寬度，點擊階段 MUST 可展開開始／結束、耗時、占比與說明。首頁 MUST 訂閱 `processing` SSE，收到非 initial 更新時重新取得 `/api/home` 並就地更新數據與 waterfall；為避免執行中的索引每 2 秒觸發一次完整摘要查詢，前端 MUST 以 15 秒最小間隔節流並保留最後一次更新，手動重新整理不受節流限制。已展開階段 MUST 保持展開，不得重設法規清單收合狀態或捲動位置。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **FR-169**: CORS MUST 使用明確來源清單，MUST NOT 採用 `*`；預設允許 `http://127.0.0.1:9200`、`http://localhost:9200` 與 `null`（供 `file://`），其他來源需加入 `CORS_ALLOW_ORIGINS`。`allow_headers` MUST 明確包含 `X-Judgment-Request-Id`、`X-Judgment-Client-Started-At`、`X-Judgment-Admin-Token` 與 `Authorization`；`expose_headers` MUST 只暴露 `X-Judgment-Request-Id`。設定含 `*` 時 MUST 忽略並記錄 warning，不得回傳 wildcard CORS header。
- **FR-170**: `/api/health` MUST 保持公開；`/api/home` 是 `DEMO_READ`，demo 關閉時回 403、demo 開啟且 `home` feature 可用時回 200。其餘 `/api/*` MUST 依 `route_policies.json` default-deny，管理員可使用 allowlist 內的 Google session 或 `X-Judgment-Admin-Token`；demo 訪客只能使用 `demo_policies.json` 的 17 條 allowlist。未設定管理權杖時遠端管理請求 MUST 回 403，權杖錯誤 MUST 回 401；`JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=1` 時 loopback 可直接使用，production MUST 為 `0`。遠端 SSE MUST 先取得 `/api/auth/sse-ticket` 的 120 秒短效 ticket，EventSource URL 只放 ticket，不得放長期權杖。`#/tests` 的「後端 API 連線」MUST 提供管理權杖輸入，權杖 MUST 存在 `sessionStorage` 並以 `X-Judgment-Admin-Token` 送出；`?api=` 指定的 API Base MUST NOT 收到權杖。Google session 的 actor email MUST 由驗證層提供；admin token 的 actor 目前記為 `admin`，`X-Judgment-Actor` MUST NOT 作為遠端稽核身分。
- **FR-171**: llama-server 主機新增與更新 MUST 只允許 `OLLAMA_ALLOWED_HOSTS`（legacy 內部名稱）中的 `host:port`，以及由 `EMBEDDING_URL`、`EMBEDDING_FALLBACK_URL`、`EMBEDDING_FAILOVER_URLS`、`LLM_URL`、`RERANK_URL`、`RERANK_FALLBACK_URL` 自動加入的目標。MUST 封鎖 link-local、metadata、multicast、unspecified 與 reserved 位址；主機名稱解析後亦 MUST 檢查。主機數量上限 MUST 為 20。既有的未列入主機 MUST 在列表顯示 `blocked` 且不得發出探測請求；`/api/llama-server/hosts`、capabilities 與 LLM model 測試 MUST 只探測允許的主機；舊 `/api/ollama/hosts` alias MUST 隱藏且不得出現在 API 目錄。
- **FR-172**: Docker Compose 的 PostgreSQL 與 Qdrant MUST 只綁定 `127.0.0.1`，MUST NOT 使用 `0.0.0.0` 或未指定 host 的 port mapping。PostgreSQL 密碼 MUST 由 `POSTGRES_PASSWORD` 提供，不得使用 `judgment/judgment` 預設值；`pg_hba.conf` 的 `127.0.0.1/32` 與 `::1/128` MUST 使用 `scram-sha-256`，不得使用 `trust`。Qdrant MUST 以 `QDRANT__SERVICE__API_KEY` 啟用 API key，後端、`up.sh`、`backup.sh`、`restore.sh` MUST 在請求中帶 `api-key`。`.env`、`.run` 與日誌 MUST 分別使用 0600／0700／0600 權限。備份與還原腳本 MUST 使用相同的 PostgreSQL 密碼來源與 Qdrant 認證。
- **FR-050**: 文件 MUST 說明電源控制器的啟動方式、日誌位置、停用設定，以及由後端提供頁面時停止後重新整理的限制。

### Runtime Deployment Baseline（2026-11-16）

以下為 2026-11-16 以現行 `.env`、`/api/home`、`/api/status`、`/api/quality` 與測試套件驗證的建置值；systemd 的 enable／active 狀態若未登入主機確認，會標示為待 shell 驗證。變更主機、模型、版本或啟動參數時 MUST 同步更新本節與相關 FR／SC。

#### x570 llama-server

| 項目 | 目前值 |
|---|---|
| 主要 runtime | `llama-server`（Ollama 內附的 llama.cpp 執行檔） |
| Chat | `judgment-llm-chat.service` · `gemma3:4b` · `0.0.0.0:11436` · `/v1/chat/completions` |
| Embedding | `judgment-llm-embedding.service` · `bge-m3` · `0.0.0.0:11437` · `/v1/embeddings`（1024 維） |
| Reranker | `judgment-reranker.service` · `bge-reranker-v2-m3` · `0.0.0.0:11435` · `/v1/rerank` |
| Embedding 參數 | `--embedding --pooling cls`（與 Ollama bge-m3 向量 cosine `1.00000000`） |
| Reranker 參數 | `--reranking --pooling rank` |
| Chat 參數 | `--alias gemma3:4b --ctx-size 4096`；OpenAI 路徑不送 `keep_alive` |
| GPU | `--gpu-layers all`；啟動前偵測 `libggml-cuda.so` 並設定 `GGML_BACKEND_PATH` |
| 模型路徑 | `/opt/judgment/models/gemma3-4b-q4_k_m.gguf`、`bge-m3-f16.gguf`、`bge-reranker-v2-m3-q8_0.gguf` |
| 模型來源 | 由 Ollama 已下載的 GGUF 取出後複製 |
| systemd | 三個 unit 皆 `Type=simple`、`Restart=on-failure`、`enable`；enable／active 待 shell 驗證 |
| 常駐行為 | 等同 Ollama `keep_alive=-1`：process 存活期間模型常駐，無閒置卸載；MUST NOT 傳入 `--idle-timeout` |
| Ollama 預載 | `judgment-ollama-preload.service` MUST 停用，避免重複占用 VRAM |
| 部署腳本 | `scripts/deploy_llama_services_systemd.sh`（x570 自包含）、`scripts/deploy_x570_llama_services.sh`（MBP scp／ssh） |
| 舊 reranker 腳本 | `scripts/deploy_rerank_systemd.sh` 保留為只安裝 reranker 的相容路徑 |

#### Legacy Ollama（模型來源；非 runtime fallback）

| 項目 | 目前值 |
|---|---|
| 主機／API | x570 · `http://x570:11434`（僅模型來源；MUST NOT 作為 runtime fallback） |
| Ollama 版本 | `0.40.2` |
| systemd | `ollama.service`（保留；不再是三個模型的主要 runtime） |
| 開機預載 | `judgment-ollama-preload.service`（保留但停用；需要時可手動 enable） |
| 模型格式 | GGUF · Q4_K_M · 3.9B（`gemma3:4b`） |
| 模型大小 | `2,876,191,538` bytes |
| VRAM | `size_vram = 2,876,191,538`（100% GPU，僅在 Ollama 實際載入時） |
| Context | `4096` |
| Runner | `llamacpp` |
| 應用端 keep_alive | 舊 Ollama 路徑使用；llama-server 不使用 |
| MBP 開機啟動 | `com.judgment.llm-chat`、`com.judgment.llm-embedding` LaunchAgents（登入後執行） |
| MBP fallback 模型 | `gemma3:4b`（`127.0.0.1:11436`）、`bge-m3`（`127.0.0.1:11437`） |
| 其他模型 | `gemma3:12b`、`gpt-oss:20b`、`bge-m3:latest`、`nomic-embed-text-v2-moe:latest`、`qllama/bge-reranker-v2-m3:latest` |
| Embedding fallback | `bge-m3` · 1024 維 · `http://127.0.0.1:11437`（MBP llama-server） |
| 部署腳本 | `scripts/deploy_llama_services_macos.sh`（MBP chat／embedding）、`scripts/deploy_rerank_macos.sh`（MBP reranker）、`scripts/deploy_llama_services_systemd.sh`（x570） |

應用端相關設定：

```dotenv
LLM_URL=http://x570:11436
LLM_API=openai
LLM_FALLBACK_URL=http://127.0.0.1:11436
LLM_FALLBACK_MODEL=gemma3:4b
LLM_FALLBACK_API=openai
EMBEDDING_URL=http://x570:11437
EMBEDDING_API=openai
EMBEDDING_FALLBACK_URL=http://127.0.0.1:11437
EMBEDDING_FALLBACK_API=openai
EMBEDDING_MODEL=bge-m3
LLM_MODEL=gemma3:4b
LLM_NUM_CTX=8192
LLM_NUM_PREDICT=384
LLM_KEEP_ALIVE=-1
```

`LLM_NUM_CTX` 只用於 Ollama fallback；llama-server 的 context 由 `--ctx-size` 決定。

##### llama-server 預載與 `keep_alive=-1` 等價設定

llama-server 沒有 Ollama 的 `keep_alive` 參數，因此 x570 不以請求欄位控制保留時間，而是用 systemd 讓 llama-server process 永久存活；這在行為上等同 `keep_alive=-1`：

| 行為 | Ollama `keep_alive=-1` | x570 llama-server 等價做法 |
|---|---|---|
| 開機載入 | `judgment-ollama-preload.service` 呼叫 API | 三個 unit 的 `ExecStart` 直接以 `--model` 載入 GGUF |
| 永久保留 | `expires_at` 為長期 | `Type=simple`，process 存活期間模型常駐 |
| 避免閒置卸載 | `keep_alive=-1` | MUST NOT 傳入 `--idle-timeout` 或任何卸載旗標 |
| 重新載入 | 再次呼叫 API／重啟預載服務 | `systemctl restart` 或 `Restart=on-failure` |
| 開機自動啟動 | `systemctl enable` | 三個 unit 皆 `systemctl enable` |
| 應用端請求 | 可送 `keep_alive=-1` | OpenAI payload MUST NOT 送 `keep_alive`／`options` |

安裝腳本 `scripts/deploy_llama_services_systemd.sh` 的預設設定：

| 環境變數 | 預設值 | 用途 |
|---|---|---|
| `CHAT_PORT` | `11436` | chat llama-server 監聽埠 |
| `CHAT_HOST` | `0.0.0.0` | chat 綁定位址 |
| `CHAT_ALIAS` | `gemma3:4b` | OpenAI `model` 別名 |
| `CHAT_OLLAMA_MODEL` | `gemma3:4b` | 取出 GGUF 的 Ollama tag |
| `CHAT_CTX_SIZE` | `4096` | chat context |
| `EMBEDDING_PORT` | `11437` | embedding llama-server 監聽埠 |
| `EMBEDDING_HOST` | `0.0.0.0` | embedding 綁定位址 |
| `EMBEDDING_ALIAS` | `bge-m3` | OpenAI `model` 別名 |
| `EMBEDDING_OLLAMA_MODEL` | `bge-m3:latest` | 取出 GGUF 的 Ollama tag |
| `EMBEDDING_CTX_SIZE` | `8192` | embedding context |
| `RERANK_PORT` | `11435` | reranker 監聽埠 |
| `RERANK_HOST` | `0.0.0.0` | reranker 綁定位址 |
| `RERANK_ALIAS` | `bge-reranker-v2-m3` | `/v1/rerank` 模型名稱 |
| `RERANK_OLLAMA_MODEL` | `qllama/bge-reranker-v2-m3:latest` | 取出 GGUF 的 Ollama tag |
| `JUDGMENT_INSTALL_DIR` | `/opt/judgment` | 模型與工作目錄 |
| `JUDGMENT_SERVICE_USER` | `sudo` 使用者或目前使用者 | systemd `User=`／`Group=` |
| `JUDGMENT_INSTALL_RERANK` | `1` | 設 `0` 或 `--skip-rerank` 只安裝 chat／embedding |
| `JUDGMENT_DISABLE_OLLAMA_PRELOAD` | `1` | 停用 `judgment-ollama-preload.service` |
| `LLAMA_SERVER_BIN` | 自動尋找 | llama-server 執行檔 |
| `LLAMA_LIB_DIR` | llama-server 目錄 | shared library／CUDA backend 路徑 |

三個 unit 的 `ExecStart` 核心參數：

```text
judgment-llm-chat:
  --model /opt/judgment/models/gemma3-4b-q4_k_m.gguf
  --alias gemma3:4b --host 0.0.0.0 --port 11436
  --jinja --gpu-layers all --ctx-size 4096
  --batch-size 1024 --ubatch-size 512 --no-webui

judgment-llm-embedding:
  --model /opt/judgment/models/bge-m3-f16.gguf
  --alias bge-m3 --host 0.0.0.0 --port 11437
  --embedding --pooling cls --gpu-layers all --ctx-size 8192
  --batch-size 2048 --ubatch-size 2048 --no-webui

judgment-reranker:
  --model /opt/judgment/models/bge-reranker-v2-m3-q8_0.gguf
  --alias bge-reranker-v2-m3 --host 0.0.0.0 --port 11435
  --reranking --pooling rank --gpu-layers all --ctx-size 8192
  --batch-size 2048 --ubatch-size 1024 --no-webui
```

`--jinja`／`--no-webui` 只在 llama-server `--help` 支援時加入；CUDA backend 由安裝腳本自動偵測 `libggml-cuda.so` 並設定 `GGML_BACKEND_PATH`。

#### llama-server reranker

| 項目 | 目前值 |
|---|---|
| 主機／API | x570 · `http://x570:11435`（primary）；MBP · `http://127.0.0.1:11435`（fallback） |
| systemd | `judgment-reranker.service`（`Type=simple`；API 正提供服務；`Restart=on-failure`、`RestartSec=3`；enable／active 待 shell 驗證） |
| 服務使用者 | `solo` |
| 模型路徑 | `/opt/judgment/models/bge-reranker-v2-m3-q8_0.gguf` |
| 模型 | `bge-reranker-v2-m3` · Q8_0 · 567,753,729 params |
| 模型大小 | `628,831,364` bytes |
| Context | `8192`（`/props` 的 `default_generation_settings.n_ctx`；`/v1/models` meta `n_ctx=8192`、`n_ctx_train=8192`） |
| Slots | `4`（`total_slots=4`、`is_sleeping=false`） |
| 啟動參數 | `--reranking --pooling rank --gpu-layers all --ctx-size 8192 --batch-size 2048 --ubatch-size 1024 --no-webui` |
| 監聽 | `0.0.0.0:11435` |
| Build | `b1-631109b34` |
| Metrics | `/metrics` 未啟用（`endpoint_metrics=false`；回傳 501） |
| 常駐行為 | 啟動時載入模型，process 存活期間常駐；停止服務或 crash 重啟才重新載入 |
| MBP LaunchAgent | `com.judgment.rerank`（登入後啟動；停止或 crash 時 `KeepAlive` 自動重啟；每 5 秒節流） |
| MBP llama-server | Homebrew `llama-server 1.0.0`（build 12359；Metal；`-ngl 99`） |
| MBP 模型路徑 | `~/Library/Application Support/Judgment/models/bge-reranker-v2-m3-q8_0.gguf`（自 Ollama blob 複製，`0600`） |
| MBP 監聽 | `127.0.0.1:11435`（不對外開放） |
| 應用端設定 | `RAG_RERANK_ENABLED=true`、`RERANK_URL=http://x570:11435`、`RERANK_FALLBACK_URL=http://127.0.0.1:11435`、`RERANK_MODEL=bge-reranker-v2-m3` |
| 法規 rerank | `RAG_LAW_RERANK_WEIGHT=0.15`、`RAG_LAW_CANDIDATE_ARTICLE_LIMIT=8` |
| 部署腳本 | `scripts/deploy_llama_services_systemd.sh`（x570 三服務）、`scripts/deploy_x570_llama_services.sh`（MBP wrapper）、`scripts/deploy_rerank_systemd.sh`（x570 reranker-only）、`scripts/deploy_rerank_macos.sh`（MBP） |

#### 資料流程設定基線（2026-11-15）

本節為 `#/processing` 與資料流程 spec 的現行設定基準。未特別標示者以目前 `.env` 與 workflow catalog 為準；變更設定時 MUST 同步更新本節。

| 項目 | 目前值 |
|---|---|
| 判決資料根目錄 | `JUDGMENT_DATA_DIR=./data/judgments`（程式預設 `/data/judgments`；production 應使用持久化絕對路徑） |
| 法規資料根目錄 | `LAW_DATA_DIR=./data/laws` |
| 金融法規清單 | `JUDGMENT_LAW_LIST=./documents/金融法規.md` |
| 法規／命令下載 | HTTP timeout 300 秒、retries 3、`MAX_UNCOMPRESSED_BYTES=536870912`；ZIP 存到 `LAW_DATA_DIR/raw/{source}/{YYYYMMDD}/` |
| 判決下載來源 | 司法院裁判書分類 `051`；`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`；一次只下載一個檔案 |
| 判決版本保留 | `JUDGMENT_RAW_RAR_KEEP_VERSIONS=true`；`JUDGMENT_RAW_PARQUET_KEEP_VERSIONS=false` |
| 判決匯入 | `judgment.judgment_import`；raw Parquet manifest + delta；`--dry-run` 僅 CLI，不寫 DB |
| 判決索引 | `judgment_documents` 為 legacy 基準；版本化建置使用 `judgments_vNNN`，alias `judgments_current`，prefix `judgments`，history `judgment_documents_history` |
| 判決索引批次 | `judgment.judgment_index --build-version --activate --batch-size 64`；`JUDGMENT_INDEX_MAX_CHARS=1600` |
| 法規／命令索引 | `legal_articles_vNNN`，alias `legal_articles_current`，prefix `legal_articles`；`LEGAL_ARTICLE_INDEX_BATCH_SIZE=32`、`LEGAL_ARTICLE_INDEX_MAX_CHARS=4000` |
| 法規／命令索引 workflow | `judgment.legal_index --incremental --if-changed` |
| Embedding | `bge-m3`、1024 維；primary `x570:11437`（llama-server，`EMBEDDING_API=openai`）、fallback `127.0.0.1:11437`（MBP llama-server）；UI 選擇的主機／模型持久化後 MUST 套用到法規索引、判決索引與完整更新 |
| RAG 檢索 | 程式預設 `RAG_TOP_K=4`；目前 `.env` 覆寫 `RAG_TOP_K=8`、`RAG_SCORE_THRESHOLD=0.35`、`RAG_MAX_CONTEXT_CHARS=4000` |
| Reranker | 程式預設 `RAG_RERANK_ENABLED=false`；目前 `.env` 覆寫 `true`、候選 30、`bge-reranker-v2-m3`、primary `x570:11435`、fallback `127.0.0.1:11435` |
| LLM | 程式預設空（只回傳檢索結果）；目前 `.env` 為 `LLM_URL=http://x570:11436`、`LLM_API=openai`、`gemma3:4b`、fallback `127.0.0.1:11436`（`LLM_FALLBACK_API=openai`）、`LLM_NUM_CTX=8192`、`LLM_NUM_PREDICT=384` |
| 更新檢查 | 法規／命令比較遠端 `Content-Length` 與本機 ZIP 大小；判決比較司法院 resources／fileset 與本機 `raw_rar`／manifest；`Last-Modified`／`ETag` 只記錄 |
| 更新檢查排程 | `up.sh` 啟動後檢查一次；定期檢查由外部 cron／`scripts/run_scheduled_update.sh` 執行，程式本身沒有內建排程器 |
| 完整資料更新 | `download → legal_qdrant → postgres → qdrant` |
| 法院正規化 | 44 個標準名稱（含歷史機關）；預設只處理 current 且 `court_normalized=''` 的資料 |
| 法院檢查 | 全部已正規化綠色；需正規化（未檢查、部分未正規化、無效值）紅色；summary 只顯示已檢查與需正規化月份數 |
| 效能紀錄保留 | `PERFORMANCE_RETENTION_DAYS=90` |
| SSE topics | `processing`、`judgment-download`、`test-runs`、`benchmark`、`updates`、`status`、`system-usage`、`ollama`、`court-check`、`law-version-check` |
| 前端即時更新 | 進度／流程類 topic 直接套用 payload；`#/status` 的資源與 llama-server 區塊可在 `status` topic 更新時重新取得輔助資料，但 MUST NOT 由前端固定 timer 發起 |
| 後端常駐啟動 | `up.sh` 優先使用 detached tmux session `judgment-web`（`JUDGMENT_WEB_TMUX_SESSION` 可覆寫）；tmux 不可用時回退 `nohup`；`down.sh` 先停止 session，再清理 9200 listener |

#### Current Data & UI Snapshot（2026-11-16）

以下為目前程式與實際資料的同步快照；數值變動時以 API 回傳為準，規格結構與行為不得任意變更。

| 項目 | 目前值 |
|---|---|
| 原始判決 | 371 個 archive、22,881,015 筆（DuckDB raw Parquet） |
| PostgreSQL current 判決 | 4,714,967 筆 |
| Qdrant 判決索引 | 4,714,967 / 4,714,967（100%）、剩餘 0、`judgments_current → judgments_v005`、version #7、`bge-m3` |
| 法規／命令 | 1,351 法規、10,454 命令、222,126 條文、4 個資料版本、14 次下載執行 |
| Qdrant 法規索引 | 222,126 / 222,126、`legal_articles_current → legal_articles_v006`、version #9、1,024 維 |
| 服務總覽 Pipeline | 11 個後端檢查階段＋彙整；目前最慢階段為 `staleness`（約 3.2–3.5 秒） |
| 首頁即時摘要 Pipeline | 7 個階段（法規／命令、金融判決、原始 manifest、判決索引、法規索引、金融法規清單、彙整）；目前最慢階段為 `judgments`（約 0.6–1.4 秒） |
| 金融法規清單 | `documents/金融法規.md` · 99 條 · 11 欄 × 9 列 |
| API 端點目錄 | 100 個端點、9 個分類（GET 59／POST 34／PATCH 3／DELETE 4） |
| IndexedDB | `judgment-console` v2；`query_history` 上限 120、`audit_events` 上限 2,000、`settings` |
| 測試 | 358 tests collected |

### Key Entities

- **Console Route**: 主控台的主要頁面與 URL 片段，包含 RAG、資料庫、資料品質、效能報表、資料處理、系統狀態，以及獨立的 `#/tests` 系統測試路由。
- **Service Status**: 單一服務元件的識別、名稱、類型、狀態、延遲與說明；狀態必須來自實際檢查或明確設定。
- **Legal Article Index**: 法規／命令條文的版本化 Qdrant collection、alias、embedding／recipe 版本、法規數、條文數、驗證結果與增量建置 snapshot；不得與判決索引共用 collection。
- **Llama Server Runtime**: x570 上三個由 systemd 管理的 `llama-server` 服務（chat、embedding、reranker），包含模型路徑、alias、量化格式、port、context、GPU layers、API 種類（OpenAI 相容）與常駐行為；Ollama 僅保留為模型來源，不是 runtime fallback。
- **Ollama Runtime**: x570 上由 systemd 管理的 legacy `ollama.service` 與 MBP 上由 launchd 管理的 Ollama.app、模型清單、keep_alive、VRAM／context 與模型來源設定；MUST NOT 作為 runtime fallback。
- **Reranker Service**: x570 上獨立的 `llama-server` process，包含模型路徑、量化格式、context、slots、啟動參數、常駐行為與 health／props／models 端點。
- **Database Catalog**: 可用資料來源、狀態、說明與動態 metadata 欄位定義。
- **Query Report**: 一次查詢的資料庫、資料表、條件、摘要、分布、查詢語句、資料列、分頁、警告與耗時。
- **Law Detail Report**: 單一法規的 metadata、狀態、沿革、附件、條文、資料來源與 Parquet 快照資訊，以及返回原查詢報表的狀態。
- **Power Controller**: 綁定本機 loopback 的獨立控制器，可啟動／停止 `judgment-web`，並在後端停止後繼續存活。
- **Data Category**: 資料庫頁的「法規命令」或「判決」分類；每個分類擁有各自的資料庫、資料表與篩選條件。
- **Judgment Document**: 已命中金融法規清單的判決文件，包含案號、法院（原始與正規化）、裁判日期、案由、全文、命中法規、引用與來源壓縮檔。
- **Court Normalization**: 判決法院名稱的正規化結果；保留原始 `court`，並以 `court_normalized` 儲存標準法院名稱；程式定義 44 個現行／歷史名稱（含司法院冤獄賠償／刑事補償法庭與臺灣板橋地方法院），目前 4,714,967 筆 current 判決實際出現 44 個且無空值。
- **Judgment Detail Report**: 單一判決的 metadata、命中法規、引用條號、PDF 連結與判決全文，以及返回原判決查詢報表的狀態。
- **Judgment Vector Index Entry**: 判決向量索引的追蹤紀錄，包含案號、`version_id`、collection、embedding 模型、content hash、index text／payload hash、向量維度與索引時間；用於續跑與 per-version coverage 計算。
- **Judgment Index Version**: `judgment_index_versions` 的版本，包含 physical collection `judgments_vNNN`、alias、embedding model／version、recipe、來源 snapshot、驗證結果、狀態與 `previous_version_id`。
- **RAG Answer**: 一次判決 RAG 問答的結果，包含狀態（`operational`、`retrieval_only`、`preview` 等）、回答、判決引用、檢索 metadata、索引 coverage 與耗時。
- **Performance Record**: 一次 API、CLI 下載或判決匯入執行的程序、模組、timestamp、耗時、狀態、request id、參數、結果 metadata 與 Flow JSON；Flow 記錄從請求接收到回應的巢狀執行區段。
- **Performance Flow Segment**: Flow 中的一個執行區段，包含名稱、模組、函式、參數名稱與摘要值、相對 offset、耗時、巢狀 parent、狀態與錯誤訊息；用於比較不同模型、函式與參數組合的效率。
- **Performance Test Run**: 一次測試模式 RAG 執行的測試流程，包含 run id、request id、問題、狀態（running／success／partial／failed）、目前 stage、總進度、總耗時、模型清單與 summary。
- **Performance Test Step**: 測試 Flow 的單一階段／模型進度，包含 stage（embedding／retrieval／context／llm／validation）、model、status、progress、started_at、duration 與錯誤。
- **App Setting**: PostgreSQL 的執行期設定，目前用於持久化 `test_mode` 開關狀態。
- **Judgment Parquet Snapshot**: 原始判決 Parquet，包含 jid、法院、日期、案由、全文、命中法規、引用、PDF 與來源；`/api/judgment?source=parquet`、資料頁與 RAG 引用卡連結都讀取 `parquet/raw_judgments/.../raw.parquet`。過濾後的 `judgments.parquet` 是另一個可選匯出產物，不用於查詢。
- **Client Timing**: 前端回報的 request 總等待與 render 時間，透過 request id 合併到同一筆 Performance Record 的 `client` 與 `client.render` segment。
- **Theme**: 一種視覺風格的識別、名稱、說明、色票與設計 token。
- **Settings Sidebar**: 從 header 齒輪開啟的右側設定面板，包含分類按鈕、分隔線、目前分類功能表、開關狀態與焦點管理；開啟時將主要頁面左推。
- **Settings Category**: Settings sidebar 上方的分類，例如「字型大小」與「介面風格」；每個分類有獨立 icon、名稱、說明與下方功能表。
- **Font Size Group**: 一組具有共同語意的文字 elements（例如頁面標題、表格、法規條文），包含名稱、selector 集合、預設值、合法範圍與目前顯示值；用於滑桿、數值輸入、即時套用與 hover highlight。
- **Font Size Preference**: 使用者儲存在 `localStorage` `judgment.fontSizes.v1` 的字型覆寫，包含 group id 與 px 值；另有目前草稿值、上次儲存值與回復預設狀態。
- **Theme Preview Item**: 「介面風格」中的單一主題項目，保留主題名稱，但以該主題 header 的底色、文字色、品牌線、邊框、圓角與陰影呈現，並顯示 active／check 狀態。
- **Appearance Mode**: 全站明暗配置，分為 `light`、`dark`、`system`；`light` 不覆寫主題 token，直接使用目前主題的原始配色；`dark` 以 `data-appearance="dark"` 套用共用暗色 palette；`system` 依 `prefers-color-scheme` 解析，並以 `judgment.appearance` 持久化。
- **Local History Entry**: 儲存在瀏覽器的提問或查詢紀錄，包含類型、標題、摘要、參數與建立時間。
- **Architecture Layer**: 系統架構中的一層節點；目前為 `Client · Browser`、`Application · FastAPI`、`Pipelines · RAG / Batch`、`Data · Storage`，節點包含標題、副說明與可選的服務狀態對應。
- **IndexedDB Store**: 瀏覽器 `judgment-console` v2 的三個 object store：`query_history`、`settings`、`audit_events`；資料版本頁顯示 schema 版本、儲存模式、筆數上限、目前筆數、總紀錄與 storage estimate。
- **Status Pipeline Stage**: 服務總覽載入 Pipeline 的單一階段；包含 `key`、`label`、`caption`、`color`、`status`、`duration_ms`、`started_at`、`finished_at`、`message`，後端階段與瀏覽器 HTTP／初始化階段共用同一 waterfall。
- **API Endpoint Catalog**: 由 FastAPI `APIRoute` route table 產生的 `method`／`path`／`label`／`deprecated` 清單；前端依系統、處理、查詢、RAG、索引、模型、測試、題庫與 Benchmark 分組。
- **Data Version Card**: 狀態頁資料版本分類的卡片，涵蓋 PostgreSQL、IndexedDB、Qdrant 判決向量索引、Qdrant 法規／命令索引與 Parquet／執行狀態。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可在 3 次點擊內從任一主要頁面切換到其他 header 頁面。
- **SC-002**: 八個路由（`#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`）在桌面與 390px 行動版皆無水平溢位，且 header 導覽仍可操作。
- **SC-003**: 十種風格皆可從「設定選項」→「介面風格」套用；每個項目 MUST 以該風格 header 的底色、文字色、品牌線與邊角顯示，重新整理後仍保留上次選擇。
- **SC-004**: RAG 回答的每一筆判決引用都能在 PostgreSQL 中找到對應案號；法規／命令引用的每一筆都能在現行法規資料中找到對應名稱與條文。
- **SC-005**: 沒有相似度足夠的判決且沒有法規來源時回傳零筆引用，且回答明確說明無法產生有依據的答案；有法規來源時仍使用法規內容回答。
- **SC-006**: 四種資料來源都能產生查詢報表或明確的未設定／錯誤狀態，且沒有虛構資料列。
- **SC-007**: PostgreSQL 的三個資料表切換後，畫面只顯示該資料表適用的篩選欄位。
- **SC-008**: 查詢報表可在 2 秒內完成一般關鍵字查詢（不含首次資料載入與網路傳輸）。
- **SC-009**: 未設定的 Qdrant、Embedding、RAG 與 LLM 在狀態頁與 RAG 頁皆顯示 `not_configured` 或 `degraded`，不會顯示為正常。
- **SC-010**: 狀態頁的資料筆數與最近下載執行與 PostgreSQL／資料目錄的實際內容一致。
- **SC-011**: IndexedDB 不可用時，查詢與提問仍可在記憶體模式下完成，且畫面明確標示資料不會持久化。
- **SC-012**: 在實際資料集上，Playwright 檢查八個路由、四種資料來源、十種風格與狀態頁的服務總覽 Pipeline／資料版本／架構 SVG／API 端點目錄時，沒有 console error 或失敗請求。
- **SC-017**: 從 PostgreSQL 與 Parquet 的法規查詢結果皆可開啟法規完整報表，並以「返回查詢結果」回到原本的查詢頁碼與資料列。
- **SC-018**: 從 `#/status` 的「系統測試」或 `#/tests` 可切換測試模式 ON／OFF，狀態顏色、標籤與 `aria-checked` 和 `/api/test-mode` 一致；後端電源仍由本機腳本／控制器管理。
- **SC-028**: 測試模式 ON 時，一次 RAG 請求會執行所有可用 embedding／LLM 模型；實際 4 個 LLM 的測試產生 11 個 steps，總耗時約 82–149 秒，前端不得因 45 秒 timeout 中止。
- **SC-029**: 測試流程圖表在執行中會由 `test-runs` SSE topic 推送更新進度；完成後顯示問題、答案、每個步驟的 module／function、5 個階段、每個模型一條子進度條、100% 總進度與依階段耗時比例的總流程時間 bar；失敗模型顯示紅色與錯誤訊息。
- **SC-030**: 重新載入效能報表後，可從歷史選單載入先前的 test run，還原相同的 stages、models、status、duration 與 step 狀態。
- **SC-031**: 原始判決資料目前涵蓋 371 個 archive、DuckDB raw Parquet 共 22,881,015 筆（去重值以 manifest 為準，原始壓縮檔約 45,010,293,667 bytes）；以 `jid` 讀取單筆全文可在 1 秒內完成，RAG 引用卡的 Parquet dialog 顯示的案號與全文與原始 `raw.parquet` 一致。過濾後的 `judgments.parquet` 只能由「判決 Parquet 匯出」workflow 選擇性產生，不是查詢來源。
- **SC-032**: 快速 profile（`.env.example` 的 `gemma3:4b`、top_k=4、4,000 字上下文、num_ctx=4096、num_predict=384）在實際金融法規問題上 MUST 於 10 秒內完成一般 RAG 回答；實測約 2–5 秒。
- **SC-033**: 「證交法有多少條文?」MUST 回傳 `證券交易法` 229 條並附法規來源；「銀行法是何時開始有的?」MUST 回傳中華民國 20 年 3 月 28 日（1931-03-28）；「保險業務員最常觸犯什麼法條?」MUST 依判決引用統計列出熱門法條並標示引用次數，不得虛構數字。
- **SC-035**: 「證券營業員常觸犯什麼法規或命令?」MUST 依判決引用統計列出法規／命令並標示次數；引用統計 MUST 以最多 100 筆符合判決取樣，達到上限時 MUST 標示「取樣」並讓回答文案明確寫成「取樣 N 筆」，不得讓人誤讀為母體全數；統計有獨立 5 秒 `statement_timeout`，逾時時 MUST 降級為「統計暫時無法提供」而仍送出回答。以 entity 為 key 的快取 MUST 有最多 128 筆的 LRU 上限與 10 分鐘 TTL，不得為取得完整 1,268 筆計數而掃描全部 4.7M 筆全文。「有哪些法規是和壽險及產險相關的?」MUST 回傳含保險法、簡易人壽保險法與財產保險相關命令的法規清單。
- **SC-089**: 結構性法規問句 MUST 由規則與模板回答，不得由 LLM 猜測。「公司法最後一條是什麼內容?」MUST 回第 449 條條號與全文，並標示「依本系統資料版本（2026-11-13）」；「公司法有幾條」MUST 第一個數字為現行有效 436 條，接著標示「條號共 534，其中 98 條已刪除」與「條號含『之』條（如第 156-1 條）」，最後一條與資料截至日期由模板產生。「第一條」與「最後一條」如原本條號已刪除，MUST 改回有效條文並在括號內寫明已刪除條號與內容（例如民事訴訟法最後一個條號第 640 條已刪除）。沒有刪除條的法規 MUST NOT 顯示「已刪除 0 條」。所有法規來源卡 MUST 顯示「436 條生效（共 534 條號，已刪除 98 條）」與資料版本日。「第三章有幾條」「最近一次修正是哪天」「這部法有幾章」等未命中規則的統計／排序問句 MUST 回「無法確認：本系統目前不支援這類統計或排序查詢」，不得進入 LLM 回答。排序 MUST 以（主號，之號）數字為之，不得用字串排序。
- **SC-036**: 判決分類的 Schema 模式 MUST 顯示 `judgment_documents` 與 `judgment_import_runs`；切換 Parquet 後 MUST 顯示原始判決 Parquet 資料表，點選後 MUST 在右側顯示欄位、前 10 筆資料與目前總數（現行 22,881,015 筆，實際值以查詢 API 為準）；表頭排序與逐欄搜尋建議 MUST 正常，並可開啟 Parquet 原判決。
- **SC-037**: 以滑鼠或觸控板在所有主要頁面連續上下滾動至少 10 秒時，header MUST 保持不透明且不得出現可視閃爍、消失或重新進場；資料頁切換每頁 10／25／50／100 筆、上／下一頁與排序時，表格 MUST 維持顯示直到新結果抵達，不得先閃成骨架，且表格、報表卡片與分布條不得重播進場動畫或淡入淡出效果。
- **SC-038**: 在 `#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests` 分別連續觸發自動更新、後端推送、重新整理、換頁、排序、每頁筆數切換、篩選與分類切換至少三次時，畫面 MUST NOT 出現可視閃爍、白屏、淡入淡出、透明度變化或進場動畫重播；表格、報表卡片、分布條、時間表、清單與統計卡 MUST 保持穩定並直接更新為最終狀態。
- **SC-039**: 連續在七個主要頁面之間切換路由至少 10 次時，不得先出現整頁 skeleton、白屏或頁面進場動畫；header 與固定背景 MUST 保持穩定，舊頁面 MUST 直接由新頁面內容取代。
- **SC-040**: 在 `#/processing` 的 `legal_index_versions`、`judgment_import` 或 `index_versions` 執行資訊中，至少兩台線上主機各具備 `bge-m3:latest` 時，MUST 顯示 `x570:bge-m3:latest`、`mbp:bge-m3:latest` 按鈕，目前使用中的模型 MUST 為 active；點選另一台按鈕後 MUST 儲存該主機 embedding model、將該主機移到第一優先，重新整理後仍保持。MUST NOT 顯示主機卡片、拖移把手或上下箭頭；離線主機與未確認 embedding 能力的模型 MUST NOT 出現在按鈕列。第一優先主機無法提供 embedding 時，系統 MUST 依序自動嘗試下一台，且不得回傳模擬向量。
- **SC-041**: 在 `#/performance` 的 RAG Pipeline 分頁選擇任一含 Flow 的 RAG Trace 時，以及 `#/rag` 每次完成回答後展開「後端處理流程」時，標準 LLM RAG trace 的 waterfall MUST 依序顯示 Parsing、Embedding、Qdrant、Reranker、Context、LLM、Response；結構化法規查詢 trace（`answer_source=structured` 且含 `rag.law_retrieval`）MUST 改為顯示 Parsing、法規檢索與統計、法條載入、Response，未執行的 Embedding／Qdrant／Reranker／Context／LLM MUST NOT 以「未記錄」列成缺失階段。每列 MUST 顯示耗時，且 bar MUST 依執行順序接續排列，上一階段 bar 的結束位置 MUST 等於下一階段 bar 的開始位置。Embedding／LLM 的 bar MUST 以藍色前段標示 Model Load。點選階段後 MUST 顯示該 span 的實際開始／結束時間、module／function 與可用監控欄位。`#/rag` 的完整 waterfall card MUST 位於後端處理流程收合面板內，與效能頁使用相同階段、摘要與完整 Flow 連結；回答底部 MUST NOT 重複第二份相同 card。
- **SC-042**: 在 `#/rag` 首頁至少有兩台主機、每台各有一個已確認支援 chat 的模型時，模型按鈕 MUST 以「主機:模型」顯示並全部為綠色，目前 provider／模型 MUST 標示使用中；點選另一台主機的模型後，按鈕選取狀態與「目前」文字 MUST 更新，重新整理頁面後仍保持，且 `/api/status` 的 LLM model／URL 與下一次 RAG 請求使用的 provider 模型 MUST 一致，embedding 主機順序 MUST 不變。當 `x570` 同時有 Ollama `http://x570:11434` 與 llama-server `http://x570:11436` 時，`x570:gemma3:4b` MUST 只出現一次，且該按鈕 MUST 指向 effective 的 llama-server provider；滑鼠移入時 title MUST 顯示 base URL。390px viewport 無水平溢出，console error MUST 為 0。
- **SC-043**: Model Provider 至少兩台可用主機時，主機模型清單 MUST 顯示各模型已測試能力標籤；Chat、Embedding、Vision、Tools、Speech、Reranker 範例各自出現於對應模型，未測試模型 MUST 顯示「未測試」。按下「檢查模型能力」後，新安裝但尚未快取的模型 MUST 更新為其實際能力，且重新載入頁面後仍保留。
- **SC-044**: 在 `#/performance` 的 RAG Pipeline、任一 Flow 紀錄、測試 Flow，以及 `#/rag` 回答底部與後端處理流程中，時間軸 MUST 使用相同的 `.rag-wf-*` waterfall 結構；不得再使用舊的 `flow-timeline` 或 `test-flow-time` 作為主要流程呈現。RAG Pipeline MUST 依階段耗時接續排列，效能 Flow 與測試 Flow MAY 依實際 offset 定位並重疊平行 span。階段可展開且資料不足時顯示「未記錄」。
- **SC-045**: 任一含模型呼叫的 waterfall 在 Embedding、LLM、Reranker 階段列，以及 Embedding／LLM bar 的 Model Load 區段 MUST 顯示「主機:模型」，例如 `mbp:bge-m3`、`x570:gemma3:4b`；展開明細與 hover 資訊 MUST 顯示相同主機與模型。舊 Flow 缺少 `provider_name` 時 MUST 從 endpoint URL 顯示 hostname。
- **SC-046**: 當 Ollama 回應包含 `load_duration` 時，waterfall MUST 在來源 Embedding／LLM 階段 bar 的開始處顯示藍色 Model Load 區段，且該區段 MUST 與後續階段時間精準接續，不得另列成未對齊的子階段，也不得將不同來源的載入合併；展開明細 MUST 分成 Model Load 與推論兩個區塊，各自顯示正確且不同的開始／結束時間，兩者交界時間 MUST 相同；冷啟動案例 MUST 顯示載入耗時、模型呼叫總耗時、扣除載入後時間與載入占比，且載入時間大於等於 100 ms 時標示冷啟動；熱啟動案例載入為 0 或低於門檻時 MUST 標示熱啟動。滑鼠移到藍色 Model Load bar 時 MUST 顯示上述數值。
- **SC-047**: 直接開啟 `/` 或 `#/home` MUST 顯示首頁，內容包含主視覺、提問輸入框、即時資料卡、六張重要數據卡、RAG 能力與引用追溯區、資料來源卡、可收合的金融法規清單、Pipeline waterfall、七個分頁介紹與 footer；品牌標誌 MUST 連到 `#/home`。在首頁輸入題目並送出後 MUST 導向 `#/rag`、保留題目並自動發問。footer MUST 顯示 `© 2026 Judgment RAG Console`、`MIT License` 與「法規資料僅供檢索與研究參考，不構成法律意見」。
- **SC-048**: 啟用 reranker 且主要端點可用時，RAG 回覆的判決順序 MUST 依 rerank 分數排列，`retrieval.rerank.status` MUST 為 `ok`，`rag.rerank` Flow MUST 顯示「主機:模型」、候選數、選用數與 top score。主要端點失敗但 fallback 可用時 MUST 自動改用 fallback，並將 `fallback_used` 標示為真。兩者都失敗時 MUST 保留 Qdrant 原排序、只取 `RAG_TOP_K` 筆，且 `retrieval.rerank.status` MUST 為 `degraded`，回答不得因 reranker 失敗而中斷。
- **SC-049**: 當主要 reranker 離線、fallback 可用時，`#/rag` 的 Rerank models MUST 將主要模型顯示為灰色「離線」、fallback 顯示為綠色「使用中」，並以 fallback 作為目前 reranker。兩者都離線時 MUST 全部灰色並顯示「無可用模型」；`RAG_RERANK_ENABLED=false` 時 MUST 顯示「未啟用」。按下重新檢查後 MUST 依最新健康狀態更新顏色與目前使用標示。
- **SC-050**: 當使用者詢問「銀行法對從業人員有那些規定？」時，RAG MUST 判定為 law-first、保留銀行法已選出的 articles、將法規 source 編號為 `[1]`，並讓判決從 `[2]` 開始；`retrieval.mode` MUST 為 `law_first`，判決 context 數 MUST 不超過 `RAG_LAW_FIRST_JUDGMENT_LIMIT`。同時，「有哪些法規和壽險及產險相關？」仍 MUST 觸發 related-laws 結構化清單；「銀行法有哪些規定？」MUST NOT 被當成相關法規清單。
- **SC-051**: 以現行法規／命令 Parquet 建置時，`legal_articles_current` MUST 指向新版本 collection，索引筆數 MUST 等於可檢索條文數（目前 222,126），維度 MUST 為 1,024，且判決 collection `judgments_v005` 的 points 數 MUST 不變。第二次以未變更來源執行 `--incremental --if-changed` MUST 回傳 `unchanged` 且不新增 collection；變更一部法規後執行 `--incremental` MUST 只替換該法規的 points，未變動法規的 points 與向量 MUST 保留。
- **SC-052**: 啟用法規向量檢索時，同一次 RAG 查詢 MUST 只呼叫一次 `bge-m3` embedding；`retrieval.law_vector.status` MUST 為 `ok` 並包含命中的法規，`retrieval.law_rerank` MUST 獨立記錄法規 rerank。把 `legal_articles_current` alias 移除後，同一題 MUST 仍能由 PostgreSQL／Parquet + BM25 產出法規來源，且不得回傳 5xx。
- **SC-053**: 同一題同時有法規與命令候選時，`retrieval.law_fusion.method` MUST 為 `rrf` 並包含 `rrf_k`／`dense_weight`；`retrieval.law_rerank.groups` MUST 至少包含 `law` 與 `order` 兩組。兩組 MUST 使用不同的 rerank 批次；其中一組失敗時，另一組 MUST 仍套用 rerank，失敗組 MUST 保留原順序，整體 `status` MUST 標示 `degraded`。
- **SC-054**: x570 開機後 `systemctl is-enabled judgment-llm-chat judgment-llm-embedding judgment-reranker` MUST 皆為 `enabled` 且 `is-active` 皆為 `active`；`judgment-ollama-preload.service` MUST NOT 為 `enabled`。`/v1/models` MUST 顯示 `gemma3:4b` 與 `bge-m3`；`/v1/chat/completions` MUST 回傳非空 `choices[0].message.content`；`/v1/embeddings` MUST 回傳 1024 維向量；`/v1/rerank` MUST 回傳至少一筆 `relevance_score`。process 清單 MUST 顯示三個 `llama-server`，且模型由 service 常駐，不依賴 Ollama 的 `keep_alive`。應用端 OpenAI 路徑 MUST NOT 送出 `options` 或 `keep_alive`；Ollama fallback 的 `LLM_KEEP_ALIVE=-1` MUST 以 JSON 數字送出。
- **SC-094**: MBP 登入後 `launchctl print gui/$(id -u)/com.judgment.llm-chat` 與 `com.judgment.llm-embedding` MUST 顯示已載入且 running；`http://127.0.0.1:11436/v1/models` MUST 顯示 `gemma3:4b`，`http://127.0.0.1:11437/v1/models` MUST 顯示 `bge-m3`；兩者 MUST 只監聽 loopback。`--status` MUST 顯示 plist、health 與模型，`--uninstall` MUST 移除兩個 LaunchAgent；模型檔可保留。
- **SC-095**: MBP 登入後 `launchctl print gui/$(id -u)/com.judgment.rerank` MUST 顯示已載入的 LaunchAgent，且程序 MUST 為 `llama-server`；`/health` MUST 回傳 200，`/v1/rerank` MUST 回傳至少一筆 `relevance_score`。`/api/ps` MUST NOT 因 reranker 而載入 `qllama/bge-reranker-v2-m3:latest`。停止 llama-server 後 launchd MUST 自動重啟；`--status` MUST 顯示 LaunchAgent、模型與日誌路徑並完成實際 rerank；`--uninstall` MUST 移除 LaunchAgent，且 MUST NOT 刪除已複製的 GGUF。
- **SC-096**: x570 執行 `scripts/deploy_llama_services_systemd.sh` 後，三個 unit MUST 存在且 `systemctl is-enabled` 皆為 `enabled`；重新開機後 `systemctl is-active` 皆為 `active`，`ps -C llama-server` MUST 顯示三個 process，且分別載入 `gemma3-4b-q4_k_m.gguf`、`bge-m3-f16.gguf`、`bge-reranker-v2-m3-q8_0.gguf`。閒置至少 10 分鐘後再次查詢 MUST 仍為 `active`，模型 MUST NOT 被卸載；這等同 Ollama `keep_alive=-1`。`systemctl show -p ExecStart` MUST 顯示 `--gpu-layers all`，且 MUST NOT 顯示 `--idle-timeout`。`judgment-ollama-preload.service` MUST NOT 為 `enabled`；`ollama.service` MAY 保持 `active`。`/v1/chat/completions`、`/v1/embeddings`（1024 維）與 `/v1/rerank` MUST 在重開機後直接可用，無需先呼叫 Ollama。`up.sh` 在 x570 llama-server endpoint 可用時 MUST 匯出 `LLM_API=openai`、`EMBEDDING_API=openai`，並將 MBP llama-server `127.0.0.1:11436`／`11437` 設為 fallback；x570 不可用時 MUST 改用 MBP llama-server。
- **SC-097**: 詢問「在板橋地方法院相關詐騙的判決有那些」時，`retrieval.mode` MUST 為 `judgment_first`、`retrieval.retrieval_mode` MUST 為 `structured_list`、`answer_source` MUST 為 `retrieval_list`、`llm_model` MUST 為 `null`、`law_sources` MUST 為空陣列；`retrieval.total_matches` MUST 等於 filter 後的 `count()`，回答 MUST 以「符合條件的判決共 N 筆」開頭，且列出的每一筆 `court` MUST 為 `臺灣新北地方法院` 或 `臺灣板橋地方法院`、`title` MUST 含「詐欺」。回答 MUST 說明板橋地方法院已改制為臺灣新北地方法院，並提醒不是法律意見；MUST NOT 出現「地方法院及其分院處務規程」「晉敘」「審查委員會」等無關法規內容。相同請求 MUST NOT 呼叫 LLM，完成時間 SHOULD 低於 5 秒。
- **SC-098**: 詢問「2000年至2010年在板橋地方法院相關詐騙的判決有那些」時，`retrieval.retrieval_mode` MUST 為 `structured_list`，`retrieval.total_matches` MUST 等於 filter 後的 `count()`；回答開頭 MUST 顯示「符合條件的判決共 N 筆」，且列出的每一筆 `jdate` 年份 MUST 在 2000–2010、`court` MUST 為 `臺灣新北地方法院` 或 `臺灣板橋地方法院`、`title` MUST 含「詐欺」；MUST NOT 出現年份、法院或案由不符的判決，也 MUST NOT 出現無關法規。詢問無結果的「1990年至1991年新北地院詐欺判決有哪些」時 MUST 明確回覆查無符合條件的判決，`judgments` MUST 為空，且 MUST NOT 退回未套用 filter 的向量結果。`source_year`／`jdate_num` 缺值 MUST 於回填後為 0，新 point MUST 同時寫入 `jdate_num` 與 `source_year`。
- **SC-099**: 對「2000年至2010年在板橋地方法院相關詐騙的判決有那些」，`retrieval.query_plan.intent` MUST 為 `judgment_list`、`enumerate=true`、`dense=false`。對語意問題，`retrieval.query_plan` MUST 不為 null；`RAG_LEXICAL_RRF_ENABLED=false`（預設）時 `retrieval.query_plan.lexical` MUST 為 `false` 且不執行 lexical RRF；設為 `true` 時 `retrieval.hybrid.method` MUST 為 `dense_lexical_rrf`、`applied=true`，並包含 `rrf_k` 與 `lexical_weight`，Flow MUST 出現 `rag.query_plan` 與 `rag.lexical_rrf` span。`scripts/rag_query_benchmark.py` 對 `tests/benchmarks/rag_query_suite.json` 的 23 題 MUST 全部通過，Filter Violation Rate MUST 為 0，且輸出 pass rate、average latency 與 max latency；正式驗收 SHOULD 擴充至 100–300 題分層題庫。
- **SC-100**: 完成一則 RAG 回答後，桌面滑入問題泡泡或回答卡 MUST 顯示對應工具列，移出後 MUST 隱藏；以鍵盤 Tab 聚焦工具列按鈕時 MUST 保持可見。點擊問題複製 MUST 複製完整問題；點擊回答複製 MUST 複製主要回答文字；點擊分享 MUST 直接建立 `#/rag/share?contentId=<token>` 連結並複製到剪貼簿；成功 toast MUST 顯示「已複製公開連結」與「任何擁有此連結的人都可以查看這段對話。」，且 MUST 提供開啟連結動作。在全新瀏覽器開啟該連結後 MUST 直接從 `rag_share_snapshots` 還原完整對話，MUST NOT 呼叫 RAG query／LLM。分享頁 MUST 保留一般 RAG 雙欄版面與左側 `.rag-library`；`.rag-library` MUST NOT 為 `display:none`，`.rag-workspace-toolbar` MUST 為 `display:none`；重新整理有效分享連結 MUST 仍能載入快照，且從分享頁導覽至 `#/home` 等其他頁面 MUST 正常切換。分享與複製完成後 MUST 釋放按鈕焦點並移除可見外框。快照不存在或過期時 MUST 顯示連結失效訊息。點擊編輯 MUST 將原提問泡泡切換為 inline 編輯框並全選原問題文字，MUST NOT 在下方生成新輸入框；按 Enter MUST 以編輯後問題重新產生同一則提問的回答，更新原 turn 的問題泡泡、回答與歷史 payload，MUST NOT 在下方新增第二個 turn；Shift+Enter MAY 換行，Escape／失焦 MUST 取消並還原原問題。點擊重新提問／重新生成 MUST 再送出原問題並新增一則回答。390px 觸控裝置 MUST 固定顯示工具列，且 MUST 無水平溢出、console error MUST 為 0。
- **SC-101**: 開啟 `#/rag` 後，右上方 MUST 顯示「分享給朋友」按鈕；點擊後 MUST 呼叫 Web Share API 並帶入 `https://judgment.ragdemo.win`，不得直接導覽；若瀏覽器不支援或分享失敗則 MUST 將該 URL 寫入剪貼簿並顯示「已複製網站連結。」toast。三點按鈕點擊後 MUST 顯示且只顯示「重新命名」「釘選對話」「刪除」「移至專案」四個選單項目，點擊外部或 Escape MUST 關閉。完成一則對話後，選單的釘選 MUST 切換為「取消釘選」，重新命名 MUST 更新左側標題，移至專案 MUST 顯示專案清單，刪除 MUST 清除目前對話。右側分享按鈕 MUST 建立並複製 `#/rag/share?contentId=<token>` 公開連結，顯示「已複製公開連結」toast 與「任何擁有此連結的人都可以查看這段對話。」詳細文字、`開啟連結` 動作與關閉 `×`；分享後按鈕焦點外框 MUST 消失。分享檢視 `#/rag/share?contentId=...` MUST 隱藏整個 `.rag-workspace-toolbar`，390px viewport MUST 無水平溢出、console error MUST 為 0。工具列設計與分享驗收細節見 [`rag-workspace-toolbar.md`](rag-workspace-toolbar.md)。
- **SC-102**: 開啟 `#/rag` 時檢索狀態卡 MUST 為收合狀態，`.rag-model-strip` 與說明文字的 computed `display` MUST 為 `none`，狀態列 MUST 顯示綠色勾勾、狀態標題、模型數與 chevron。點擊狀態列後 MUST 加上 `is-expanded`、`aria-expanded="true"`，並顯示模型表與說明；再次點擊或按 Enter／Space MUST 收合。按「重新檢查」後展開狀態 MUST 保留。展開後模型表 MUST 顯示 Chat／Embedding／Rerank 三列，使用中 MUST 為 `x570`、Fallback MUST 為 `mbp`；表頭、類型、模型名稱與備註的 computed `font-size` MUST 為 `12px`。390px viewport MUST 無水平溢出、console error MUST 為 0。
- **SC-103**: 直接開啟任一支援路由（`#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`）或展示模式鎖定頁後，`document.title` MUST 等於「Judgment｜金融法律判決 RAG AI 智慧分析平台」且長度 ≤ 35 字元；靜態 `index.html` 的 `<title>` MUST 使用相同短版文字，`meta[name=description]` 與 `og:description` MUST 保留完整站點簡介。
- **SC-104**: Header MUST 顯示天平與三個電路節點組成的品牌圖形、襯線體 `JUDGMENT` 與等寬體 `LEGAL RAG INTELLIGENCE`；品牌連結可用鍵盤聚焦並導向 `#/home`，`aria-label` MUST 為「Judgment 金融法律判決智慧分析平台 首頁」。`/favicon.svg` MUST 回傳 `image/svg+xml`、含 `#76b900` 背景與同一品牌圖形。390px viewport MUST 無水平溢出，品牌列 MUST 不與 header 右側操作按鈕重疊。
- **SC-105**: 對「近二年返還借款的判決有那些?」請求，`pipeline_flow.decisions` MUST 至少包含 `parse.query`（selected=`relative_range`、result 含 `date_from`）、`route.plan`（selected=`structured_semantic`）、`filter.apply`（selected 含 `date_range`）、`retrieve.channel`（selected=`vector`）與 `answer.mode`；對「公司法最後一條是什麼內容?」，`law.structured` MUST selected 含 `article_boundary`；對「這部法有幾章?」，`guard.statistics` MUST selected=`unsupported` 且 `answer_source` 為 `structured`，不得呼叫 LLM。`rerank` 在未設定 reranker 時 MUST selected=`skip`，且 `rerank` option MUST `evaluated=false`。所有決策列的 selected MUST 與實際 `retrieval_mode`／`answer_source`／`query_filters` 一致；demo visitor 的 `pipeline_flow` MUST 只包含去敏後的決策、選項、結果與 timing，MUST NOT 包含 prompt、collection、host、絕對路徑、positive/negative JID 或模型識別碼。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-106**: 完成一則標準 RAG 問答後，「後端處理流程」收合面板內容 MUST 被完整 canonical RAG Pipeline card 取代，card MUST 包含 header、Trace ID、摘要、完整 Flow 連結、canonical 七階段（Parsing／Embedding／Qdrant／Reranker／Context／LLM／Response）或結構化法規四階段，以及 `decisions` badge 與展開列表；回答底部 MUST NOT 再出現第二份相同 card。MUST NOT 將 `http.request`、`rag.answer_question`、`rag.extract_excerpt` 等 raw nested spans 當成頂層階段。axis MUST 為 `0 ms` 至該次 pipeline 總耗時，所有 bar MUST 由左至右接續，上一階段結束位置 MUST 等於下一階段開始位置。面板完成後 MUST 預設收合；再展開時 MUST 顯示同一份完整 card，且 MUST NOT 出現第二套重疊的 raw waterfall。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-107**: 詢問「此問題未對應 99 項金融相關法規，是那99條?」時，回答 MUST 明確說明「99」是 99 項法規／命令白名單、不是某部法律的第 99 條，列出全部 99 項名稱，`answer_source` MUST 為 `structured`、`llm_model` MUST 為 `null`、`retrieval.status` MUST 為 `scope_whitelist`、`retrieval.whitelist_count` MUST 為 99，且 MUST NOT 出現證券投資信託及顧問法第 99 條的無關推論。詢問「為什麼這個問題被拒絕回答?」時，回答 MUST 說明白名單／金融關鍵詞依據，並區分「未支援統計或排序」與「非金融範圍」兩種拒絕原因。`pipeline_flow.decisions` MUST 包含 `scope.whitelist`，selected 為 `list` 或 `refusal`；390px viewport 無水平溢出，console error 為 0。
- **SC-055**: `systemctl is-enabled judgment-reranker` MUST 為 `enabled`；`/health` MUST 回傳 200；`/props` MUST 顯示 `/opt/judgment/models/bge-reranker-v2-m3-q8_0.gguf`、`default_generation_settings.n_ctx=8192`、`total_slots=4`、`is_sleeping=false`；`/v1/models` meta MUST 顯示 `n_ctx=8192`、`n_ctx_train=8192`、567,753,729 params、628,831,364 bytes、Q8_0。`/metrics` 在未加 `--metrics` 時回傳 501 MUST NOT 被判定為服務失敗；停止服務後 MUST 不再提供 rerank，重啟後 MUST 重新載入模型。
- **SC-056**: 詢問「銀行法對從業人員有那些規定？」時，判決卡 MUST 顯示該判決實際引用的 `銀行法第125條第1項、第3項`、`銀行法第29條第1項`、`銀行法第136條之1`、`公司法第8條第3項` 等條號，且不得只顯示「銀行法」、「公司法」；點選 `銀行法第136條之1` MUST 成功開啟本地 Parquet 的 `第 136-1 條` 完整條文。同一回答上方已有法規檢索結果時，下方 MUST NOT 再出現「引用法規／命令」的重複來源卡。
- **SC-057**: 在資料庫頁打開「設定選項」後，sidebar MUST 佔用右側 `380px`，`.app-header`、`.app-main`、`.app-footer` 的右緣 MUST 位於 sidebar 左緣；字型大小清單 MUST 只包含目前頁面有匹配元素的區塊。將「頁面標題」滑桿改為 `32px` 時，頁面 h1 MUST 立即變成 `32px`；滑鼠移到「表格內容」列時，所有 `.data-table th/td` MUST 出現固定紅色 `#ef4444` outline 與半透明背景，移出後 MUST 全部移除；按「儲存」後重新載入 MUST 維持 `32px`；按「取消」或直接關閉 sidebar MUST 回到上次儲存值；按「回復預設值」後再儲存 MUST 清除本機覆寫。390px viewport 開啟 sidebar MUST 無水平溢出，且 MUST NOT 出現 console error。
- **SC-058**: Header MUST 只有齒輪「設定選項」，不得有 `#style-trigger`、`#style-menu` 或獨立調色盤按鈕；「介面風格」分類按鈕 MUST 使用調色盤 icon。十個主題項目 MUST 保留名稱，但分別呈現該主題 header 的底色、文字色、品牌線、邊框、圓角與陰影；每個項目 MUST 顯示該主題 header 作用中導覽按鈕的迷你預覽（背景色、文字色、pill 圓角與 badge），且該預覽的第一色 MUST 與右側第一個色票一致。NVIDIA 項目 MUST 為黑底白字、0px 圓角與綠色作用中按鈕；Apple 項目 MUST 為淺色底、深色字與主題圓角。只有 active 項目 MUST 顯示 check；點選 Apple 後 `document.documentElement.dataset.theme`、`localStorage.judgment.theme`、`theme-color` meta 與 active 狀態 MUST 同步更新，且不得重新載入頁面。
- **SC-059**: 齒輪按鈕 MUST 具備 `aria-expanded` 與 `aria-controls`；sidebar 關閉時 MUST 為 `aria-hidden="true"` 且不可聚焦。開啟後焦點 MUST 落在目前分類按鈕；按 Esc、X 或再次點擊齒輪 MUST 關閉 sidebar 並將焦點還給齒輪。儲存字型設定後切換到另一頁，新頁面相同 group 的 elements MUST 套用同一設定；動態新增的表格列或 dialog 內容 MUST 也套用設定。停用 `localStorage` 時，字型變更 MUST 仍於本次工作階段生效，且 MUST NOT 產生未捕捉例外或 console error。
- **SC-060**: 「介面風格」標頭右側 MUST 顯示「亮／暗／系統」三個按鈕，預設「亮」為 active。切換「暗」後 `<html data-appearance="dark">`、`localStorage.judgment.appearance="dark"`、body 背景 `#0b0f14`、body 文字 `#eef3f8`、header 與 sidebar 深色背景 MUST 立即生效且無需重新載入。切換「亮」後 MUST 移除暗色覆寫，直接回到目前主題的原始配色；以 NVIDIA 主題驗證時 body 背景為 `#ffffff`，以 Linear 主題驗證時 body 背景為 `#010102`，不得被強制改成白色。在 `prefers-color-scheme: dark` 環境選擇「系統」時，`data-appearance` MUST 解析為 `dark`、`data-appearance-mode` MUST 為 `system`，且 `localStorage` MUST 儲存 `system`。三個按鈕 MUST 只有一個 `aria-pressed="true"`，且不得出現 console error。
- **SC-061**: 完成一次 `POST /api/processing/update`（或 `judgment.processing_update`）時，Flow／processing run MUST 包含 `download`、`legal_qdrant`、`postgres` 與 `qdrant` 階段。法規索引內容未變時 `legal_qdrant` MUST 標示 skipped／無變更；有變更時 MUST 回報新版本與條文數，且 `/api/status` 的 `data.legal_index.status` 為 `fresh`、`points_count` 等於 active snapshot `article_count`。模擬 legal index 失敗時，舊 alias MUST 保持可用，run MUST 標示 partial／failed 並保留錯誤訊息。
- **SC-062**: 建立一個內容 hash 與索引不同的判決、一個缺少索引的判決與一個已移除但仍有 point 的判決後，`/api/status` MUST 回報 changed／missing／stale 均大於 0；執行完整更新且啟用索引時 MUST 走 `build-index-version`、建立新 collection、重用未變更向量、刪除 stale point，驗證後切換 `judgments_current`。若驗證失敗，alias MUST 仍指向舊 collection，`/api/status` 的 pending 數量 MUST 大於 0。
- **SC-063**: 使用低於門檻的 law recall／article recall／citation valid rate／P95 latency 執行 benchmark 後，`summary.gate.status` MUST 為 `fail`，且 `scripts/rag_regression_gate.py` MUST 回傳 exit code 1；所有門檻通過時 MUST 為 `pass` 並回傳 0。`RAG_GATE_LAW_RECALL_MIN` 等環境變數 MUST 能覆寫預設門檻。
- **SC-064**: `/api/processing.file_timelines` MUST 依序包含 `law`、`order`、`judgment` 三項；每項 MUST 有 `months`、`summary`、`current`，且每個 month 的四階段鍵為 download／parquet／postgres／qdrant。法規／命令在目前資料 MUST 顯示 2026-10 與 2026-11，2026-11 四階段全部完成（四色實心方塊）、2026-10 的 Qdrant MUST 為 `not_applicable`（已取代空白），summary 完成 2、未完成 0；判決 MUST 顯示 368 個月、24 個四階段全部完成的月份；月份格 MUST 使用 `judgment-month index-month index-month-are processing-month is-neutral`（無資料月份為 `is-empty`）與四個 `index-month-block processing-month-stage`，四格固定使用綠色下載、粉色 Parquet、藍色 PostgreSQL、橘色 Qdrant；完成階段 MUST 為實心方塊，未完成 MUST 為同色空心框，執行中 MUST 為與「已處理」相同的淡色垂直進度條，Qdrant 已有先前處理進度但未完成 MUST 為淡橙色實心方塊，alias 完成後 MUST 轉為實心橘色，不得再顯示灰色「處理中」方塊。目前匯入 archive 所在月份有執行中階段時，該階段 MUST 顯示進度條。SSE `index_runtime.current.month` 變更時，處理總覽 MUST 在 live payload 套用後立即把新月份顯示為執行中、前一月份顯示為已處理淡橙色，不得停留在舊月份或等待完整 snapshot。點選判決時間表的空心 PostgreSQL 階段方塊 MUST 切換到「判決匯入」workflow 面板，且 MUST NOT 自動啟動流程。390px viewport 表格 MUST 可水平捲動且頁面無水平溢出，console error 為 0。 頁首 MUST NOT 存在 `#processing-refresh`、`#processing-update` 或 `#processing-index-toggle`；`.processing-page-subtitle` MUST 與 h1 同列顯示。
- **SC-065**: 以 `2026-11-13T10:21:00+00:00`（台北時間 18:21）建立法規下載版本後，`version_code` MUST 為 `202611131821`；`/api/processing.file_timelines.law.current.file` MUST 為 `202611131821`，該月份 tooltip MUST 顯示相同版本編號。舊資料沒有 `version_code` 時 MUST 由 `downloaded_at` 回填，不得顯示空白。
- **SC-066**: 選取 `#/processing` sidebar 的「法規／命令索引」「判決匯入」或「Qdrant判決向量索引版本建置」workflow 面板後，MUST 顯示 Embedding 主機／模型按鈕列；x570 與 mbp 均在線且各有 `bge-m3:latest` 時 MUST 同時列出 `x570:bge-m3:latest` 與 `mbp:bge-m3:latest` 按鈕，不得只顯示模型名稱或合併成單一選項。選擇 `mbp:bge-m3:latest` 後 MUST 儲存 mbp 的 embedding model、將 mbp 設為第一優先；切換前 MUST 顯示索引可能需要重建的警告。離線主機或未確認 embedding 能力的模型 MUST NOT 出現在選項中；面板 MUST NOT 顯示舊的主機卡片、拖移把手或上下箭頭；頁面標頭 MUST NOT 再顯示重複的 Embedding 選擇器。
- **SC-067**: 判決匯入 run 失敗且錯誤訊息包含 `NUL (0x00)` 時，filter 與 postgres 的「失敗」badge MUST 在 hover／focus 顯示 `原因：...NUL...` 與 `建議：...重新執行...`；tooltip MUST 位於一般 stage hover 卡之上，390px 無水平溢出，console error 為 0。
- **SC-068**: 判決匯入面板的月份表 MUST 使用與處理總覽相同的卡片格式：`side-card-head index-runtime-head` 內以 2×3 `index-runtime-metrics` 顯示完成月份、未完成月份、有更新月份、總月份、完成率與完成階段，並提供 `index-current-row` 目前匯入列、`index-month-are-key` 階段顏色與狀態兩組 legend。每個月份 cell MUST 使用 `judgment-month index-month index-month-are processing-month is-neutral`，橫向顯示四個 `index-month-block processing-month-stage`：RAR 檢查／解壓縮（橘）、原始資料檢查／Parquet 備份（粉）、金融法規篩選（紫）、PostgreSQL metadata（藍）；已完成 MUST 為實心方塊，尚未完成 MUST 為同色空心框，執行中且尚未完成的階段 MUST 以同色調淡色垂直進度條表示，無資料 MUST 為淡色空心方塊，不得使用整格綠／紅／灰底色。已有可用原始 Parquet 的 archive MUST 顯示「沿用 YYYY-MM 既有原始 Parquet、未重新備份」；缺少備份而新建時，執行中 MUST 顯示「建立 YYYY-MM 原始 Parquet 備份」，完成後 MUST 顯示「已建立 YYYY-MM 原始 Parquet 備份」，不得只顯示「檢查」或「沿用」，也不得讓使用者誤以為每次都在重新備份。金融法規篩選與 PostgreSQL metadata 訊息 MUST 包含目前處理的 `YYYY-MM` 與 archive。金融法規篩選訊息列右側 MUST 顯示 `金融案件{matched} / 全部案件{raw_total_rows} 金融佔比{percent}%`，例如 `金融案件4,714,967 / 全部案件22,881,015 金融佔比20.6%`，並隨 SSE 更新；不得只在 run 結束後才顯示。百分比 MUST 由 `matched ÷ raw_total_rows` 計算並四捨五入至整數；「金融佔比」與百分比數字、兩個案件數 MUST 以 strong 顯示。MUST NOT 使用 `matched ÷ scanned`、`matched ÷ candidate_total`，也不得直接沿用 filter stage 的 84.5% 進度。可沿用原始 Parquet 的 archive MUST 在 RAR 與原始資料階段顯示完成實心方塊並註明沿用／略過解壓縮，不得因本次重新檢查而變回空心或進度條，也不得標示為重新解壓縮。尚未匯入且無可用備份的階段開始處理時，狀態順序 MUST 為「空心 → 同色調進度條 → 實心方塊」；已由先前 run 匯入的月份在本次重跑前 MUST 維持實心方塊，開始重跑時依實際尚未完成的階段顯示進度條、完成後轉為實心方塊。執行中的判決匯入 MUST 以清楚外框與 `aria-current="true"` 標示目前月份（MAY 使用低強度脈動）；若有實際執行中且尚未完成的階段，該階段 MUST 顯示同色調淡色垂直進度條，metrics 的未完成月份 MUST 計入處理中。若目前僅在沿用既有 Parquet 備份，RAR 與原始資料階段 MUST 保持完成實心方塊，不得為了顯示執行中而強制變成進度條；目前列 MUST 顯示月份、archive 與階段名稱。當篩選或 PostgreSQL 階段重新處理較早月份時，外框 MUST 維持在最高已啟動且未完成的月份，目前列 MUST 另顯示「處理中 YYYY-MM archive」，且不得把外框月份的階段 block 標成執行中進度條。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-069**: 在相同金融法規清單 SHA 下重新執行判決匯入時，已完成且 raw Parquet 可沿用的 archive MUST 被標示為接續完成，第一個 active month MUST 是最新中斷／失敗／未完成的 archive，不得從 1996 或其他已完成月份重新開始；被跳過的 archive MUST NOT 再呼叫 candidate_count 或重新執行 filter/postgres。若中斷的 archive 已有部分 PostgreSQL 資料，該 archive MUST 重新處理，不得因 DB 已有資料而跳過。尚未完成 filter／postgres 而已有可沿用 raw Parquet 的 archive MUST 在啟動掃描時批次標記為 raw 完成，不再重新解壓縮或逐檔查詢 manifest；下載檔案改變而 manifest 不再相符時，該 archive MUST 重新建立備份。
- **SC-070**: 判決匯入 active month 由 202601 切換到 202602 時，外框與 `aria-current="true"` MUST 在 1 秒內移動到 202602，舊月份 MUST 移除 `is-current`／`aria-current`；目前列 MUST 同步顯示 202602 的 archive 與階段，不得等待完整 snapshot 的 2 秒週期。390px viewport 無水平溢出，console error 為 0。
- **SC-071**: 在 `#/processing`、`#/tests`、`#/performance`、`#/rag`、`#/status` 停留 10 秒且後端資料沒有變更時，瀏覽器 MUST NOT 發出重複的 `/api/processing`、`/api/judgment-download/status`、`/api/test-runs/current`、`/api/benchmark/runs` 或 `/api/status` 查詢；每個頁面只允許初始 snapshot／SSE 載入與使用者操作。變更 state／manifest／progress 檔或 DB run 資料後，後端 MUST 在 0.5 秒內透過 SSE 推送含最新進度的完整或增量 payload；前端 MUST 直接套用 payload 更新畫面，MUST NOT 再發出進度查詢。非進度類輔助資料 MAY 由後端 topic 推送觸發載入（例如 `#/status` 的資源與 llama-server 區塊），但 MUST NOT 由前端固定 timer 發起。390px viewport 無水平溢出，console error 為 0。
- **SC-072**: 判決匯入執行金融法規篩選或 PostgreSQL metadata 時，processing state 更新後 MUST 由 `/api/events/stream` 的 `processing` topic 推送 live payload；前端 MUST 在 1 秒內更新 workflow 階段訊息、目前處理月份與下方時間表，network log MUST NOT 出現重複的 `/api/processing` GET，且 MUST NOT 使用 `/api/processing/active/stream` 作為 UI 進度來源。初次連線 MUST 由同一 topic 的完整 snapshot 建立頁面；後續只套用 SSE payload。390px viewport 無水平溢出，console error 為 0。
- **SC-073**: 首頁、`#/data` 資料庫分頁與 `#/processing` 處理總覽 MUST 同時顯示判決總件數、金融相關總件數與佔比；目前值為 `22,881,015`、`4,714,967`、`20.6%`（實際值 MUST 以後端相同定義的統計 payload 為準）。首頁使用 `/api/home`，資料庫分頁使用 `/api/judgment-stats`／catalog，處理總覽使用 processing snapshot；三處 MUST 由後端 `judgment_stats_from_counts` 提供，MUST NOT 由前端自行以候選數或索引數推導。390px viewport 無水平溢出，console error 為 0。
- **SC-074**: 完成一次 Qdrant判決向量索引版本建置後，`#/performance` 的「判決向量索引 Pipeline」分頁 MUST 顯示實際 host/model、版本／collection／alias、build mode、是否接續，以及 probe／version／copy／embedding／qdrant／postgres／validate／activate／report 各階段耗時與百分比。舊紀錄若缺少 pipeline MUST 顯示明確提示。390px viewport 無水平溢出，console error 為 0。
- **SC-075**: 執行 Qdrant判決向量索引版本建置時，`#/processing` 的流程進度 MUST 以 waterfall 顯示六個階段，包含時間軸、接續排列的階段 bar、可展開明細與 hover 資訊卡；每個 bar MUST 從上一階段結束的位置開始，進行中的金融索引階段 bar MUST 依目前 phase 使用 R 藍色 `#3b82f6` 或 E 紫色 `#a78bfa` 著色已完成比例，未完成比例 MUST 以同色 1px 外框、同色 25% 淺色空心 bar 呈現，不得整條填滿；階段列 MUST 提供 R／E 兩色圖例，不得再顯示 A 圖例；已完成階段 MUST 整條著色。複製舊 collection 時，複製列 MUST 顯示 `copied / total points`，金融判決向量索引列 MUST 顯示 `indexed / expected_count 筆`，不得把舊 collection points（例如歷史的 738,743）當成金融判決索引總數。複製期間目前月份 MUST 顯示「準備索引」或「準備中」，第一批開始後 MUST 切換為實際目前月份。SSE live payload 更新後畫面 MUST 隨之更新，且已展開的階段 MUST 保持展開。390px viewport 無水平溢出，console error 為 0。
- **SC-076**: 開啟 `#/processing` 的「法規／命令索引」workflow 面板時，MUST 顯示法規與命令兩張 D／P／I 版本月份表，並使用與處理總覽相同的 metrics、目前版本列、legend 與月份格幾何。2026-11 目前版本 MUST 顯示綠色 D、粉色 P、藍色 I 三個實心方塊，並顯示版本編號、下載時間、法規數與條文數；2026-10 舊版本 MUST 在 D／P 顯示綠／粉實心方塊、I 顯示淡色空心方塊與「已取代」，且 metrics 的已取代月份 MUST 為 1、完成階段 MUST 為 5 / 5。「法規下載」「命令下載」workflow 面板 MUST 分別顯示標題為「法規 下載時間表」「命令 下載時間表」的同格式卡片，並重用 law／order D／P／I timeline 資料。390px viewport 無水平溢出，console error 為 0。
- **SC-077**: PostgreSQL 有 15 筆 `is_current = true` 且 `court_normalized = ''` 的判決時，`#/processing` sidebar 的「法院名稱正規化」MUST 顯示 `15` badge 與 refresh icon，tooltip MUST 說明「偵測到 15 筆判決需要法院名稱正規化。」與 PostgreSQL／本機來源；workflow 執行中或 pending 為 0 時 MUST NOT 顯示 numeric badge。390px viewport 無水平溢出，console error 為 0。
- **SC-078**: 按下「執行此流程」後，按鈕 MUST 立即停用並顯示「執行中／啟動中」，MUST 立即出現「中止執行」按鈕；下方流程進度表與目前處理月份 MUST 保持可見，不得消失或閃退。法院名稱檢查表載入完成後 MUST 立即顯示，不得等待下一次 SSE。run 完成後 MUST 恢復可執行狀態並保留最新進度。390px viewport 無水平溢出，console error 為 0。
- **SC-084**: 開啟 `#/processing` 的「判決匯入」workflow 面板時，流程進度 MUST 以 pipeline waterfall 顯示 RAR 檢查／解壓縮、原始資料檢查／Parquet 備份、金融法規篩選、PostgreSQL metadata 四個階段；標頭 MUST 以 2×3 指標顯示完成階段、執行中、等待、略過、總耗時與整體進度；axis MUST 顯示 `0 ms` 與總耗時，四個 bar MUST 依階段耗時接續排列，上一階段結束位置 MUST 等於下一階段開始位置，極短階段 MUST 保留最小可見寬度；已完成階段 MUST 填滿階段色，執行中階段 MUST 只填滿 `percent`，其餘為同色 1px 空心框；展開明細 MUST 顯示狀態、開始、結束、耗時、進度、筆數與訊息。SSE 更新後已展開階段 MUST 保持展開；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-085**: 開啟 `#/status` 的「服務總覽」時，MUST 顯示「服務總覽載入 Pipeline」waterfall；在目前資料下，`/api/status` 的 `pipeline.stages` MUST 依序包含 11 個後端檢查階段，且索引鮮度（`staleness`）的耗時 MUST 反映實際查詢時間，例如約 3.3 秒；前端 MUST 顯示總耗時、Server、HTTP 傳輸、最慢階段與完成階段等指標，axis MUST 從 `0 ms` 到實際總耗時，階段 bar MUST 由左至右接續排列，並可展開查看開始／結束、耗時、占比與說明。SSE 更新後已展開階段 MUST 保持展開；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-086**: 開啟 `#/status` 的「前後端架構」時，MUST 顯示 Client、Application、Pipelines、Data 四層與目前專案節點（RAG Console SPA、SSE Broker、RAG Orchestrator、Processing Runtime、PostgreSQL、Qdrant、Parquet、llama-server 等）；下方 MUST 顯示內嵌 SVG 流程方向示意圖，包含 REST、SSE、RAG、workflow run、資料讀寫、排程與 IndexedDB 方向，並有 `role="img"`、title／desc 與圖例。亮色與暗色主題皆可辨識；390px viewport 的 SVG MUST 只在卡片內水平捲動，頁面 MUST 無水平溢出，console error MUST 為 0。以 `file:///…/frontend/index.html#/status` 開啟 standalone frontend 時，架構頁與 SVG MUST 同樣可顯示。
- **SC-087**: 開啟 `#/status` 的「資料版本」時，MUST 顯示 hero、判決索引覆蓋圓環（目前為 100%）、2×3 指標與五張 `data-version-card`：PostgreSQL 資料版本、IndexedDB 本機資料、Qdrant 判決向量索引、Qdrant 法規／命令向量索引、Parquet 與執行狀態。Hero 標題 MUST 顯示「判決索引已完整」時使用正常色；PostgreSQL 卡 MUST 顯示 4 個資料版本、14 次下載執行與版本 #4 current；IndexedDB 卡 MUST 顯示 `judgment-console v2`、indexeddb 模式、query_history 0/120、audit_events 0/2,000、settings 0 與可用配額；判決向量索引卡 MUST 顯示 `judgments_current → judgments_v005`、版本 #7、模型 bge-m3、4,714,967 / 4,714,967 筆與剩餘 0 筆；法規／命令索引卡 MUST 顯示 `legal_articles_current → legal_articles_v006`、版本 #9、222,126 / 222,126 條、1,024 維與 fresh；Parquet 卡 MUST 顯示 4 個檔案、174.6 MB、最近下載執行與耗時。390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-088**: 開啟 `#/status` 的「API 端點」時，MUST 顯示「API 端點目錄」hero 與 `api-endpoint-groups`；目前 `/api/status` 的 `endpoints` MUST 至少包含 100 個端點、9 個分類，且 MUST 包含 `GET /api/home`、`GET /api/status`、`GET /api/events/stream`、`POST /api/auth/sse-ticket`、`POST /api/processing/workflows/{workflow_id}/run`、`GET /api/versioning/audit`、`POST /api/benchmark/runs`、`POST /api/rag/query/stream`、`GET /api/docs` 與 `GET /api/openapi.json`。分類 MUST 依序顯示系統與即時狀態、資料處理與更新、查詢與資料、RAG 問答、版本與索引、模型與服務、測試與效能、題庫、Benchmark；method summary MUST 顯示 GET／POST／PATCH／DELETE 數量。以 `file:///…/frontend/index.html#/status` 開啟時 MUST 同樣載入 100 個端點；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-089**: `GET /api/home` 在目前資料集 MUST 回傳 `data.laws.law_count=1,351`、`order_count=10,454`、`article_count=222,126`，`data.judgments.financial_total=4,714,967`、`raw_total=22,881,015`、`financial_ratio=20.6`、年份 `1996–2026`（31 年），`data.rag.judgment_index.indexed=4,714,967`、`total=4,714,967`、`coverage_pct=100.0`，`data.financial_laws.count=99` 且第一筆為 `民法`；`pipeline.stages` MUST 包含 `laws`、`judgments`、`raw`、`judgment_index`、`legal_index`、`financial_laws`。以 `file:///…/frontend/index.html#/home` 開啟時，展開金融法規清單 MUST 顯示 99 筆、11 欄 × 9 列、無水平溢出，並可下載原始清單；console error MUST 為 0。
- **SC-090**: `#/home` 的「首頁即時資料載入 Pipeline」MUST 顯示 `/api/home` 的 7 個實際階段（含 `assemble`）、階段總耗時、HTTP 往返、傳輸／排隊、最慢階段與完成階段數；最慢階段 MUST 標示「最慢」並有 warning 色，展開後 MUST 顯示開始、結束、耗時、占比與說明。`processing` SSE 非 initial 更新後 MUST 重新取得 `/api/home`，但同一頁面 15 秒內最多一次；重新取得後 MUST 保留已展開階段；390px viewport MUST 無水平溢出，console error MUST 為 0。
- **SC-091**: 以 `Origin: https://evil.example` 呼叫 `/api/health` MUST NOT 回傳 `access-control-allow-origin`；以 `Origin: http://127.0.0.1:9200` 或 `Origin: null` MUST 回傳對應的 `access-control-allow-origin`。即使 `CORS_ALLOW_ORIGINS=*`，也 MUST 忽略 wildcard 並不回傳 `*`。390px viewport 無水平溢出，console error 為 0。
- **SC-092**: 設定 `JUDGMENT_ADMIN_TOKEN` 後，非 loopback 請求（例如 `X-Forwarded-For: 203.0.113.9`）呼叫 `/api/catalog` MUST 回 401；帶正確 `X-Judgment-Admin-Token` MUST 回 200；錯誤權杖 MUST 回 401；未設定權杖時 MUST 回 403。`/api/health` 與 `/api/home` MUST 保持 200。以正確權杖呼叫 `/api/auth/sse-ticket` MUST 取得 120 秒 ticket；EventSource URL MUST 只含 ticket，不含長期權杖。`file:///…/frontend/index.html#/home` 與本機 `http://127.0.0.1:9200` MUST 仍可正常使用。
- **SC-093**: 新增 llama-server 主機時，未列入 `OLLAMA_ALLOWED_HOSTS`（legacy 內部名稱）的 `evil.test:11434` MUST 回 422；`169.254.169.254:80` MUST 回 422；既有但未列入的主機在 `/api/llama-server/hosts` MUST 顯示 `blocked` 且不得發出 `/api/tags` 請求。Docker Compose 的 PostgreSQL／Qdrant MUST 只顯示 `127.0.0.1:5432`、`127.0.0.1:6333`、`127.0.0.1:6334`；未帶 `api-key` 的 Qdrant `/collections` MUST 回 401，帶正確 key MUST 回 200；PostgreSQL 的 `127.0.0.1/32` 與 `::1/128` MUST 使用 `scram-sha-256`，預設 `judgment/judgment` MUST 無法連線。
- **SC-079**: 執行 `./down.sh` 後再執行 `./up.sh`，後端 MUST 在 tmux session `judgment-web` 啟動，`/api/health` MUST 回應 ok，`.run/web.pid` MUST 指向 9200 的 listener PID。後端健康時再次執行 `./up.sh` MUST NOT 建立第二個 session 或 process。`./down.sh` MUST 停止該 session 並關閉 9200。tmux 不可用時 `./up.sh` MUST 顯示警告並回退 `nohup`；`./down.sh` MUST 仍能停止 listener。自訂 `JUDGMENT_WEB_TMUX_SESSION` 時兩個腳本 MUST 使用同一名稱。
- **SC-080**: 開啟 `#/tests` 時 MUST 顯示「Reranker 服務測試」卡；`RAG_RERANK_ENABLED=false` 或未設定 URL 時 MUST 顯示 `not_configured` 與原因，不得誤報可用。設定 primary／fallback 且至少一端可用時，按下「執行 Reranker 服務測試」MUST 顯示各端點 status、latency、top score、scores 與文件片段；失敗端點 MUST 顯示錯誤。測試 Flow 的 Reranker 階段 MUST 顯示於 Qdrant 檢索與 PostgreSQL 取文之間。390px viewport 無水平溢出，console error 為 0。
- **SC-081**: 新的 test-mode run MUST 在 waterfall 顯示 `x570:bge-m3`、`x570:bge-reranker-v2-m3`、`mbp:gemma3:4b` 等「主機:模型」標籤，PostgreSQL 取文階段 MUST 顯示 `mbp:judgment` 形式的「主機:DB名稱」；RAG 引擎答案標頭與 footer primary MUST 使用相同模型格式。歷史 run 若沒有 host metadata，MAY 只顯示原始模型或 DB 名稱，不得推測或偽造主機。390px viewport 無水平溢出，console error 為 0。
- **SC-082**: 執行中的索引 run 顯示 `2,625,280 / 4,714,967 筆` 與 `本次平均 39.5 筆/秒` 時，索引檔案時間表 MUST 以 2×3 指標表格同時顯示「已處理月份」、「已處理筆數」、「本次平均」、`Elapsed Time`、`Estimated Total`、`Time Remaining`；`Elapsed Time` MUST 為 run `started_at` 至目前時間，`Time Remaining` MUST 以 `4,714,967 - 2,625,280 = 2,089,687` 筆除以本次平均速度計算，`Estimated Total` MUST 等於兩者相加。中途停止後重新執行時，`Elapsed Time` MUST 從新 run 的 `started_at` 重新起算，`Time Remaining` MUST 只使用新的剩餘件數。缺少可用總筆數或速度時三個欄位中的估算值 MUST 顯示「—」；索引完成時 `Time Remaining` MUST 顯示 `0s`。390px viewport MUST 自動換行且無水平溢出，console error 為 0。
- **SC-083**: 索引執行中的月份顯示 `8,526 / 14,548（58.6%）` 時，該月份 cell MUST 保持透明 padding，不得使用綠色背景、進度底色、脈動 box-shadow 或任何 padding 陰影；僅該月未完成的 E 小格 MUST 以 `58.6%` 填充，不得顯示為 0%；目前索引月份 MUST 以 border／outline 標示，進度只顯示在 R／E 小格內；尚未開始的月份 MUST 維持空心框。月份 tooltip MUST 顯示 `新版本 8,526 / 14,548（58.6%）`。390px viewport 無水平溢出，console error 為 0。
- **SC-034**: 點擊 `證券交易法` 法規卡 MUST 從本地 Parquet 開啟 229 條原文 dialog，一次列出全部條文並顯示 `Parquet 條文` 來源，不得出現分頁控制；X、「返回回答」與點擊外部 MUST 可關閉，且 390px 無水平溢出。
- **SC-019**: 資料庫頁可在法規命令與判決間切換；判決分類可查詢已篩選的 `judgment_documents`，且未匯入或未命中時顯示 0 筆，不出現虛構資料。
- **SC-020**: 從判決查詢結果可開啟判決原文，並以「返回查詢結果」回到原本的判決頁碼與資料列。
- **SC-021**: 執行 API 或 CLI 後，效能報表可查到對應的 process、module、timestamp、duration 與 flow；以程序、狀態或模型篩選時只回傳符合的紀錄，並顯示平均與 P95 耗時。
- **SC-022**: 以目前 4,714,967 筆 current 判決回填後，法院下拉選單只包含程式定義的 44 個標準法院名稱且無空值或重複；以「臺灣臺北地方法院」篩選的回傳筆數 MUST 與 PostgreSQL current 查詢結果一致，排序與判決原文顯示的法院名稱一致。
- **SC-023**: 向量索引中斷後重跑時，已索引且 content hash 未變更的判決不會重複寫入 Qdrant；`judgment_vector_index` 與 Qdrant points 數量一致。
- **SC-024**: 在向量索引與 LLM 就緒時，RAG 回答包含可對應下方判決的 `[n]` 引用；移除 LLM 設定後，同一問題降級為 `retrieval_only` 且仍列出實際檢索到的判決。
- **SC-025**: 一次實際 RAG 請求的 Flow 至少包含 `http.request`、`api.endpoint`、`rag.answer_question`、`rag.search`、`rag.embed_query`、`rag.qdrant_search`、`rag.fetch_documents`、`rag.llm` 與 `rag.validate_citations`，且 `summary.models` 包含 `bge-m3` 與 `gemma3:4b`。
- **SC-026**: 前端完成 RAG render 後，同一個 request id 的 Flow 會出現 `client.render` segment，且 `client.total_ms` 大於 0、`client.render_ms` 大於等於 0；不會新增第二筆 performance record。
- **SC-027**: 效能報表頁的模型篩選可只顯示使用指定模型的 Flow；Flow JSON 可展開，390px 寬度沒有水平溢出，且沒有 console error。

## Assumptions

- 主控台與法規下載模組共用 `DATABASE_URL` 與 `LAW_DATA_DIR`；使用前至少完成一次法規下載。
- 判決向量索引需要 PostgreSQL、Qdrant 與 llama-server；法規／命令檢索只需 PostgreSQL 與法規 Parquet。未啟動 Qdrant 時判決向量檢索必須降級，但法規／命令問題仍可回答，不得提供模擬資料。
- Qdrant、Embedding、RAG 回答管線與 LLM 在未設定時以 `not_configured` 或 `degraded` 呈現；不提供模擬資料。
- RAG 以法規／命令內容與判決片段為依據；當判決檢索或 LLM 不可用但有法規來源時，仍以法規內容回答；兩者都不可用時只顯示可驗證的預覽或檢索結果，不生成法律意見。
- 效能 Flow 的 instrumentation 為 best-effort；寫入或 client beacon 失敗不得中斷原請求，且參數只保留摘要值，不作為完整稽核日誌。
- 沒有瀏覽器 timing header 或 beacon 的請求（例如 curl、CLI）不會有 `client.total_ms`／`render_ms`，但仍有伺服器端 Flow。
- 效能報表 API 本身不寫入效能紀錄，避免查詢報表時產生自我遞迴紀錄。
- 測試模式開關位於 `#/status` 的「系統測試」分類（或 `#/tests`），不再控制後端電源；電源由本機 `./up.sh`／`./down.sh` 或 `127.0.0.1:9201` 控制器管理。
- 測試模式會依序執行所有可用模型，可能耗時數分鐘；個別模型失敗只會標示該 step，不會中止其他模型。
- 測試模型的偵測依賴 llama-server `/v1/models`（legacy Ollama `/api/tags` 僅相容）；reranker 會排除，非 chat 模型若被誤判為 LLM，失敗會記錄在該 step。
- 主題、查詢歷史與設定只存在使用者瀏覽器；不同瀏覽器或裝置不會同步。
- 匯出功能只匯出目前頁面，完整匯出可由後續報表或資料管線模組提供。

## Out of Scope

- 判決下載與判決引用法規篩選的實作（已完成，屬其他模組）。
- 判決向量索引與 RAG 回答生成（已完成；本規格只描述主控台行為與可驗證性）。
- 使用者帳號、權限管理、多人協作與跨裝置同步。
- 查詢頁的資料寫入操作；`#/data` 只提供唯讀查詢。`#/processing` 可啟動／停止資料更新與白名單 workflow，`#/quality` 的題庫與 benchmark 管理可寫入，屬於獨立的管理介面。
- 自訂主題編輯器或使用者上傳設計 token。

## Addendum: 靜態前端與雲端部署 (2026-11-06)

**Input**: 開發時可在 local，production 首頁放在 Cloudflare，並使用 cloudflared 連到本機後端；建立本地直接開啟 `index.html` 即可測試的首頁，並將同一個 frontend 直接 deploy 到 Cloudflare。

### User Story 6 - 以同一份靜態前端連到可設定的後端 (Priority: P2)

使用者可直接以 `file://` 開啟打包後的 `frontend/index.html`，或把同一個 `frontend/` 部署到 Cloudflare Pages。前端預設連到本機 FastAPI；必要時可透過 `#/tests`（或 `#/status` 的「系統測試」分類）的 API 表單、網址參數或部署設定指定 cloudflared 的 HTTPS 位址。

**Acceptance Scenarios**:

1. **Given** 後端在 `127.0.0.1:9200` 執行，**When** 使用者以 `file://` 開啟 `frontend/index.html`，**Then** 主要頁面可載入資料，且預設 API Base 為 `http://127.0.0.1:9200`。
2. **Given** 後端使用其他連接埠，**When** 使用者在 `#/tests`（或 `#/status` 的「系統測試」）的 API 表單輸入位址並測試成功後儲存，**Then** 頁面重新載入並改用該位址。
3. **Given** 前端部署在 HTTPS 靜態主機，**When** 使用者填入非 localhost 的 `http://` 位址，**Then** 介面明確說明 mixed content 限制，不送出必然失敗的請求。
4. **Given** 前端部署在非 localhost 且未設定 API Base，**When** 頁面載入，**Then** standalone 前端會自動導向 `#/tests` 提示設定 cloudflared HTTPS 位址。
5. **Given** 網址包含 `?api=https://...`，**When** 頁面載入，**Then** 該位址優先於瀏覽器儲存值與 `config.js`，且對話框說明此頁不可覆寫。
6. **Given** 狀態頁透過跨來源 API 載入，**When** 使用者查看 API 卡片，**Then** 顯示目前生效的 API Base 與來源，文件連結指向同一個後端。
7. **Given** 前端來源不在後端網域，**When** 瀏覽器發出 GET 或 JSON POST，**Then** FastAPI 依 `CORS_ALLOW_ORIGINS` 回應，預設開發值 `*` 允許請求。
8. **Given** cloudflared 將請求轉送到本機 FastAPI，**When** 後端讀取 forwarded headers，**Then** 使用受信任的 `X-Forwarded-*` 資訊。

### Addendum Requirements

- **FR-029**: FastAPI MUST 繼續直接服務未建置的 ES module 前端，作為開發模式。
- **FR-030**: 建置腳本 MUST 從同一份前端原始碼產生 `frontend/`，包含相對資源路徑、IIFE bundle、`config.js` 與 Cloudflare `_headers`。
- **FR-031**: `frontend/index.html` MUST 可用 `file://` 直接開啟，且不得依賴絕對 `/assets` 路徑或 ES module 載入。
- **FR-032**: API Base 優先順序 MUST 為 `?api=` → `localStorage` → `config.js` → `file://` 預設值 → 同源。
- **FR-033**: `#/tests`（或 `#/status` 的「系統測試」）API 表單 MUST 提供目前位址、來源說明、連線測試、儲存與恢復預設。
- **FR-034**: 非 localhost 的 hosted 頁面若沒有明確 API Base，MUST 自動提示設定；不得在未設定時偽裝連線成功。
- **FR-035**: FastAPI MUST 支援可設定的 CORS 來源，並允許 JSON POST 的 preflight 請求。
- **FR-036**: `judgment-web` MUST 啟用 proxy headers，讓 cloudflared 轉送的請求可取得正確的 scheme／host。
- **FR-037**: 狀態頁 MUST 顯示目前 API Base 與來源，並以該位址產生 Swagger／OpenAPI 連結。
- **FR-038**: 文件 MUST 說明本機 `file://`、Cloudflare Pages、cloudflared quick／named tunnel、CORS 與 HTTPS mixed content 限制。

### Addendum Success Criteria

- **SC-013**: `uv run python scripts/build_frontend.py` 可重複產生可用的 `frontend/`，且無絕對資源路徑。
- **SC-014**: 以 `file://` 開啟時，主要頁面與查詢功能皆可透過可設定的 API Base 運作。
- **SC-015**: Cloudflare Pages 的 HTTPS 前端可透過 cloudflared HTTPS 位址完成跨來源狀態與查詢請求。
- **SC-016**: `CORS_ALLOW_ORIGINS` 可限制或開放指定前端來源，且測試涵蓋簡單請求與 preflight。


### Addendum Requirements — Performance Caching

- **FR-039**: 首頁、系統狀態、Catalog、效能篩選選項、更新狀態與題庫統計等唯讀聚合端點 MUST 使用 per-app TTL 快取（Home 60s、Status 20s、Catalog 60s、Performance options 120s、Updates 5s、Question-bank stats 30s），避免同一資料在短時間內重複掃描。
- **FR-040**: 上述聚合端點 SHOULD 由背景 warmer 預熱；重啟後 first request 仍可 cold build，但後續請求 MUST 命中快取。
- **FR-041**: 首頁、系統狀態、資料庫、資料品質、效能報表、資料處理頁 SHOULD 將最近一次成功 payload 快取在瀏覽器（Home 5 分鐘、Status 2 分鐘、Catalog 10 分鐘、Performance 2–5 分鐘、Quality 10 分鐘、Processing 10 分鐘），重開或切回路由時立即 first paint，再背景更新。
- **FR-042**: 資料處理 first paint MUST 使用 `GET /api/processing?cached=1&slim=1`；資料品質 first paint MUST 使用 `GET /api/quality?cached=1`；完整 DB／DuckDB 掃描只保留給手動重新整理或執行操作後。
- **FR-043**: 管理員 auth/demo 狀態 MAY 快取 5 分鐘；backend route policy 仍 MUST 是最終授權來源，前端快取不得繞過 API 權限檢查。

### Addendum Success Criteria — Performance

- **SC-017**: 同一 production 分頁重複切換主要頁面 SHOULD 在 1.5 秒內完成 first paint；Quality／Processing 使用 cached snapshot 時應低於 1 秒。
- **SC-018**: 資料品質與資料處理頁不得因開啟頁面而執行 15–20 秒的完整 DB／DuckDB 掃描。


### Addendum Requirements — Data Quality Reconciliation

- **FR-044**: 資料品質頁的 PostgreSQL 收錄差異 MUST 以「原始 Parquet `citation_count > 0` 的 distinct JID」為比較基準，不得使用含重複列的 `matched_rows`。
- **FR-045**: 頁面 MAY 同時顯示含重複的 matched rows 與重複列數，但「精確命中」主數字與 PostgreSQL 差異 MUST 使用去重 JID。

### Addendum Success Criteria — Data Quality

- **SC-019**: 同月份新舊 update archive 重複收錄相同 JID 時，品質頁不得誤報 PostgreSQL 匯入短少；差異必須為 0，並可另外看到重複列數。

## Addendum: RAG 使用者回饋與品質改善 (2026-11-24)

**Input**: 在 RAG 回答下方提供滿意度回饋；不滿意時收集原因與留言；資料品質頁提供管理者檢視、重現與 triage；未來可由 OpenCode 依結構化回饋產生 PR 提案，但不得自動修改 production。

### 使用者故事

1. **作為展示訪客**，我可以在 RAG 回答下方按「回應良好」或「回應欠佳」；按「回應欠佳」後可以選白話原因並留言，讓我不用登入也能指出回答錯在哪裡。
2. **作為管理者**，我可以在 `#/quality` 的「使用者回饋」看到不滿意原因、完整問題與回答重現、Pipeline 決策與模型版本，並標記 triage 狀態、嚴重度、可行動與「人工建議 Agent 修正的方向 prompt」（資料欄位 `expected_behavior`）。
3. **作為維運者**，我可以匯出不含原始留言的結構化 JSONL 給 OpenCode 在隔離 worktree 產生 PR 提案；代理不得讀 production DB、不得取得 secrets、不得自動 merge。
4. **作為訪客**，我不能讀取任何其他人的回饋、問題、回答快照或留言；展示關閉時回饋寫入也一起關閉。

### 資料模型

- **FR-184**: 系統 MUST 新增 `rag_interactions`，每次 RAG 回答寫入一列 server-side 快照；`request_id` MUST 唯一。快照 MUST 由後端依實際回應產生，MUST NOT 信任前端送來的 question／answer。欄位 MUST 至少包含 `request_id`、`question`、`answer`、`answer_source`、`status`、`notice`、`response_snapshot`、`snapshot_version`、`system_version`、`client_key_hash`、`is_demo`、`created_at`、`expires_at`。`response_snapshot` MUST 使用欄位 allowlist，只保留問題、回答、notice、引用／判決／法規來源的顯示欄位、retrieval、pipeline_flow 與模型／耗時；MUST NOT 儲存判決 `full_text`、LLM prompt、messages、contexts、API key、絕對路徑、內部 host／port／URL 或 collection 名稱。
- **FR-185**: `system_version` MUST 記錄 `git_commit`、`law_dataset_version_id`、`judgment_snapshot_id`、`judgment_index_version_id`、`legal_article_index_version_id`、`decision_trace_version`、`prompt_version`、`llm_model`、`embedding_model` 與 `reranker_model`。無法取得的值 MUST 記為 `null` 或 `unknown`，不得捏造。
- **FR-186**: 系統 MUST 新增 `rag_feedback`、`rag_feedback_reasons`、`rag_feedback_events`。`rag_feedback` MUST 有 `(request_id, client_key_hash)` 唯一約束，讓同一則回答對同一訪客只有一筆 active 回饋；`rag_feedback_reasons` MUST 以 `(feedback_id, reason_code)` 為主鍵；`rag_feedback_events` MUST 記錄建立、修改與 triage 的稽核事件。回饋 MUST 保存送出當時的 `snapshot`、`snapshot_version` 與 `system_version` 副本，避免 interaction 到期後無法重現。
- **FR-187**: 回饋狀態 MUST 為 `new`／`triaged`／`planned`／`resolved`／`dismissed`；嚴重度 MUST 為 `low`／`medium`／`high`；並 MUST 有 `actionable`、`expected_behavior`、`linked_question_id`、`linked_pr_url`、`reviewed_by`、`review_comment` 與 `reviewed_at` 欄位。`expected_behavior` MUST 由人工 triage 填寫，MUST NOT 由 LLM 或代理自行猜測；其使用者介面名稱 MUST 為「人工建議 Agent 修正的方向 prompt（會進 Agent JSONL，不含原始留言）」，底層欄位名稱維持 `expected_behavior` 以保持 API／JSONL 相容。`review_comment` MUST 僅作為管理者內部審查備註，MUST NOT 進入 Agent JSONL、題庫題目 notes 或使用者畫面，且 MUST NOT 影響 RAG 回答、promote 資格或 export 資格。

### 回饋能力與 API

- **FR-188**: 每次 RAG 回應（含 SSE 最終 result）MUST 附帶 `request_id` 與 `feedback` capability，至少包含 `token`、`expires_at`；token MUST 為 HMAC 簽章並綁定 `request_id`、`iat` 與 `exp`。token 預設有效期 MUST 為 7 天，`rag_interactions` 預設保留 180 天。簽章秘密 MUST 優先使用 `JUDGMENT_FEEDBACK_SECRET`，其次 `AUTH_SESSION_SECRET`、`JUDGMENT_ADMIN_TOKEN`；皆未設定時 MAY 使用 process-local 隨機秘密，但重啟後舊 token 會失效。
- **FR-189**: `POST /api/rag/feedback` MUST 只接受 `request_id`、`feedback_token`、`sentiment`、`reasons`、`comment`；MUST NOT 接受前端 question／answer。sentiment MUST 為 `satisfied`／`unsatisfied`；不滿意 MUST 至少選一個 allowlist 原因；comment MUST ≤ 4,000 字並以純文字呈現。Token 無效／與 request 不符 MUST 回 403；request 不存在 MUST 回 404；token 或 interaction 過期 MUST 回 410；同一訪客在 15 分鐘內重送 MUST 更新原 row、`revision += 1` 並寫入 event，超過 15 分鐘 MUST 回 409。滿意與不滿意都 MUST 收集，才能計算不滿意率。
- **FR-190**: `POST /api/rag/feedback` MUST 分類為 `DEMO_ACTION` 並映射到 `rag` feature；展示關閉或 `rag` feature 關閉時 MUST 回 403 且不得寫 DB。展示訪客寫入 MUST 受每 IP 每分鐘／每小時／每日限流、全站每日筆數上限、Origin／CSRF 與 body 大小限制；超過限制 MUST 回 429 並帶 `Retry-After`。admin MUST 可寫入；讀取、triage 與匯出 MUST 為 `ADMIN_ONLY`／`ADMIN_WRITE`。`GET /export`、`GET /stats` MUST 在 `GET /{feedback_id}` 之前註冊，避免被當成 id。
- **FR-191**: 管理端 MUST 提供 `GET /api/rag/feedback`、`GET /api/rag/feedback/stats`、`GET /api/rag/feedback/{id}`、`GET /api/rag/feedback/export`、`PATCH /api/rag/feedback/{id}`。列表 MUST 支援 sentiment、status、reason、severity、actionable、keyword、request_id 與日期篩選；明細 MUST 回傳完整重現快照、reasons、events、system_version 與三欄 triage 資料。匯出 MUST 為 JSONL，預設只含不滿意回饋，且 MUST NOT 包含原始 `comment`；MUST 包含 `reason_codes`、人工填寫的 `expected_behavior`、問題、回答、去敏 retrieval／decisions 與 system_version。

### 使用者介面

- **FR-192**: RAG 回答工具列 MUST 新增滿意度按鈕（圖示，非 emoji），並保留既有複製／分享／重新生成。按「回應良好」MUST 直接送出 `satisfied`；按「回應欠佳」MUST 開啟 modal，提供白話原因複選（引用或條號有誤、答案不完整、不是我問的、不該拒答卻拒答、回應太慢或出錯、內容沒有幫助或無法使用、風格或語氣、安全或法律疑慮、其他）與選填留言。Modal MUST 提醒「請勿輸入個人資料」、回饋保留 180 天或結案後 180 天，以及原始留言不會直接進代理提示。送出後 MUST 在該回答顯示已回饋狀態，同一則回答再次送出 MUST 更新原回饋。按鈕 MUST 可鍵盤操作、符合 CSP（不得使用 inline handler）、390px viewport MUST 無水平溢出。沒有 `feedback.token` 的舊回答或分享快照 MUST 隱藏回饋按鈕，MUST NOT 顯示偽造的可用狀態。
- **FR-193**: `#/quality` MUST 新增「使用者回饋」tab（admin-only）。列表 MUST 顯示時間、滿意度、原因、問題摘要、answer_source、狀態、嚴重度與可行動；明細 MUST 重現使用者問題泡泡、回答全文、notice、判決引用、法規來源、retrieval、Pipeline waterfall 與 decisions、系統版本、使用者原因與留言。管理者 MUST 能更新 status、severity、actionable、expected_behavior 與 review_comment。展示訪客 MUST 只看到鎖定說明，MUST NOT 取得任何回饋資料。代理匯出按鈕 MUST 只下載 JSONL，不得把原始留言放入檔案。
- **FR-194**: 保留與隱私文案 MUST 同步：`rag_interactions` 與 `rag_feedback` 預設 180 天；已結案回饋 MUST 自結案時間起再保留 180 天（取較晚者）。每日背景維護 MUST 清理過期 interactions、feedback、reasons 與 events。RAG 頁隱私文案 MUST 說明提問與回答快照 180 天、使用者回饋 180 天或結案後 180 天、安全稽核 180 天；備份輪替仍為 90 天營運政策。
- **FR-195**: OpenCode 自動改善 MUST 只處理人工 triage 後、標記 `actionable=true` 且具 `expected_behavior` 的回饋；MUST 在隔離 worktree／sandbox 執行，MUST NOT 讀 production secrets／DB／內部網路，MUST 只產生 PR、MUST NOT 自動 merge。原始留言 MUST 視為不可信資料且不得放入代理提示；holdout 題庫 MUST NOT 匯出。代理 MUST NOT 修改或刪除既有測試來讓 CI 通過；認證、路由分類、展示政策、CI、備份腳本、DB schema 與測試／holdout MUST 由 CODEOWNERS 保護並人工審核。第一階段只允許修改程式與測試；prompt／規則變更 MUST 走提案流程。

### 驗收

- **SC-108**: 完成一則 RAG 回答後，回應 MUST 含 `request_id` 與 `feedback.token`；資料庫 MUST 有一筆 `rag_interactions`，其 `response_snapshot.question`／`answer` 與畫面一致。前端 POST feedback 時只送 request_id、token、sentiment、reasons、comment；即使前端自行改 question／answer，DB 快照 MUST 不變。送出 👎 後 `rag_feedback` MUST 只有一筆 `(request_id, client_key_hash)`，15 分鐘內再次送出 MUST 更新同一筆且 `revision` 增加；超過 15 分鐘 MUST 回 409。
- **SC-109**: 展示關閉時，`POST /api/rag/feedback` MUST 回 403 且 DB 不新增 row；展示開啟且 `rag` 開啟時，訪客可用有效 token 送出；訪客呼叫 `GET /api/rag/feedback`、`GET /api/rag/feedback/stats`、明細或匯出 MUST 被拒，admin 才可讀取。token 無效／不符回 403、request 不存在回 404、過期回 410；同一 IP 超過限流或全站超過每日上限 MUST 回 429。
- **SC-110**: 管理者在 `#/quality` 的「使用者回饋」可看到不滿意回饋列表與統計（總數、不滿意數、不滿意率、待處理、可行動）；點擊一筆 MUST 顯示問題、回答、notice、判決引用、法規來源、Pipeline 與 decisions、原因與留言。儲存 triage 後列表／明細 MUST 更新，並新增 `rag_feedback_events`。匯出 JSONL MUST 含 reason codes、expected_behavior、問題、回答與去敏 trace，MUST NOT 含 comment；檔案 MUST 不含 `/Users/`、`/home/`、內部 host／port、collection、prompt、messages 或 API key。
- **SC-111**: 390px viewport 下 RAG 回饋 modal 與資料品質回饋列表 MUST 無水平溢出，console error MUST 為 0；所有回饋按鈕 MUST 可用 Tab／Enter／Space 操作，modal MUST 可用 Escape 關閉；HTML MUST NOT 使用 inline event handler。
- **SC-112**: `uv run pytest`、`uv run ruff check .`、Node 測試與 `node --check frontend/assets/js/app.js` MUST 通過；`scripts/build_frontend.py` 重建後 standalone frontend MUST 包含相同回饋 UI，且分享 payload MUST NOT 包含 feedback token。

### 回饋轉題庫與代理邊界（第二階段）

- **FR-196**: 管理者 MUST 能將「不滿意、已標記 actionable、且已填 expected_behavior」的回饋轉成題庫 draft。新題目 MUST 為 `status=pending_review`、`visibility=shared`、`source=user_feedback`，MUST NOT 建立為 `holdout`。`reference_answer` MAY 使用當時 RAG 回答作為草稿，但 MUST 在 notes 標示需人工改寫與驗收。題庫 notes MUST NOT 複製使用者原始留言。重複題目 MUST 以 fingerprint 判斷；若已存在 shared 題目 MAY 連結並回 `reused=true`，若已存在 holdout 題目 MUST 回 409，不得自動連結或外洩。成功後 MUST 更新 `rag_feedback.linked_question_id` 並寫入 `promoted` event。
- **FR-197**: `GET /api/rag/feedback/export` 與 `scripts/export_rag_feedback.py` MUST 預設只匯出同時滿足 `actionable=true`、`expected_behavior` 非空、且 status 不是 `resolved`／`dismissed` 的回饋；MUST NOT 包含 `comment`。Holdout 題庫項目 MUST NOT 出現在代理輸入或 `linked_question_id` 參照中。每次 API／CLI 匯出 MUST 寫入 `rag_feedback_exports` 稽核紀錄（filter、feedback_ids、format、prompt_version、時間）。
- **FR-198**: `.github/CODEOWNERS` MUST 保護認證／授權、路由與 demo policy、CI workflow、`models.py`／DB、備份還原、`tests/` 與 holdout 評測資產；正式合併 MUST 啟用「Require review from Code Owners」（單人維護時需第二位 reviewer 或明確的 admin bypass，否則會阻擋自己的 PR）。`.github/workflows/feedback-agent-guard.yml` MUST 在 `feedback/*` PR 執行 `scripts/check_feedback_agent_changes.py`，無 secrets，並拒絕修改既有測試、CI、認證、policy、DB schema、備份、guard 腳本與 holdout；允許新增測試檔。`scripts/prepare_feedback_worktree.sh` MUST 只從已 triage 的 JSONL 建立隔離 git worktree 與 TASK.md，MUST 拒絕含 `comment` 或未達 actionable／expected_behavior 的輸入。預設 MUST NOT 自動執行代理；`--run` 為人工明示 opt-in，代理 MUST 只開 PR、MUST NOT merge／deploy，且 MUST NOT 修改既有測試、CI、認證、policy、DB schema、備份腳本、prompt 或 routing 規則。
- **SC-113**: 對一筆 actionable 且 expected_behavior 非空的回饋按「建立題庫 draft」後，題庫 MUST 出現一筆 `pending_review`／`shared`／`source=user_feedback` 題目，回饋明細 MUST 顯示 linked question id；再次按下 MUST 回傳同一題目且不建立第二筆。未 actionable 或未填 expected_behavior 時 MUST 回 422；同題已存在 holdout 時 MUST 回 409。代理 JSONL MUST 不含 comment、未 triage 或 holdout 資料，且每次匯出 MUST 有 `rag_feedback_exports` 紀錄。390px viewport 無水平溢出。
- **FR-199**: 回饋 triage UI MUST 明確區分兩個人工文字欄位：`expected_behavior`（顯示為「人工建議 Agent 修正的方向 prompt」）是給 Agent 與題庫 draft 的可驗證修正方向，MUST 進入 Agent JSONL；`review_comment`（顯示為「審查備註」）是 admin-only 內部備忘，用於記錄重現方式、triage 判斷、處理方式、重複回饋、關聯 issue／PR／題庫 draft、風險與後續追蹤。`review_comment` MUST NOT 被視為 prompt、MUST NOT 影響 RAG 回答或排序、MUST NOT 改變 actionable／promote／export 的判定。UI SHOULD 在兩個欄位提供可直接照寫的 placeholder；`review_comment` SHOULD 建議使用「重現／判斷／處理／連結／後續」格式。管理者儲存 triage 後，`review_comment` MUST 保留並可在明細再次編輯；事件紀錄 MAY 保存該次審查備註的快照，但 MUST 僅供 admin 讀取。
- **SC-114**: 回饋明細 MUST 顯示「人工建議 Agent 修正的方向 prompt（會進 Agent JSONL，不含原始留言）」與「審查備註（僅管理者可見）」兩個清楚標籤。填寫 `expected_behavior` 並勾選 actionable 後，promote 與 export MUST 使用該內容；未填時 MUST 回 422 或停用按鈕。填寫 `review_comment` MUST NOT 改變 promote／export 結果，且 `GET /api/rag/feedback/export` 與 `scripts/export_rag_feedback.py` 產生的 JSONL MUST NOT 包含 `review_comment` 或 `comment`。重新載入明細時 `review_comment` MUST 仍存在且僅 admin 可讀。390px viewport 無水平溢出。
- **FR-200**: 回饋 triage MUST 支援結構化歸因欄位：`root_cause_stage`（query_parse／financial_scope／law_retrieval／judgment_retrieval／reranker／context_builder／llm_generation／citation_audit／answer_routing／refusal_policy／data_quality／unknown）、`answer_verdict`（correct／partial／incorrect／unknown）、`expected_answer_mode`（law_first／list／structured／semantic／refusal／unknown）、`expected_refusal`（should_answer／should_refuse／unspecified）、`expected_date_from`／`expected_date_to`（YYYY-MM-DD）與 `citation_verdicts`。`citation_verdicts` MUST 以 `jid:<jid>` 或 `law:<law_name>:<article_no>` 為 key，值 MUST 為 `supports`／`irrelevant`／`wrong`／`unsure`，並 MAY 含 `missing=true` 表示有應引用但漏掉的來源。UI MUST 以可快速選取的 radio pills／select／date input 呈現，MUST NOT 要求管理者手寫 JSON。API PATCH MUST 驗證 allowlist、日期格式與起訖順序；錯誤 MUST 回 422。上述欄位 MUST 進入 admin 明細與 Agent JSONL，但 `review_comment`／`comment` MUST NOT 進入 JSONL。
- **FR-201**: 管理者 MUST 能對單筆回饋按「用目前系統重跑」；`POST /api/rag/feedback/{id}/rerun` MUST 使用 snapshot 的問題與目前 runtime settings 重新執行 `answer_question()`，MUST NOT 覆寫原始 feedback snapshot。回應 MUST 包含 `previous`、`current` 與 `diff`；diff MUST 至少比較 answer 正規化文字、answer_source、status、retrieval_mode、判決引用新增／移除與法規來源新增／移除。UI MUST 以 before／after 並排與 diff badge 顯示，讓管理者判斷修正是否真的改善、是否造成其他來源退化。Rerun MUST 為 ADMIN_WRITE，且不得在 demo 訪客路徑提供。
- **SC-115**: 在回饋明細填入主要錯誤階段、答案判定、預期回答模式、預期拒答、預期日期範圍與引用來源判定後，儲存 triage MUST 保留所有欄位；重新載入明細 MUST 顯示相同值。`GET /api/rag/feedback/export` 與 CLI JSONL MUST 包含這些結構化歸因與 citation verdicts，且 MUST NOT 包含 `review_comment`／`comment`。按下「用目前系統重跑」後 MUST 顯示原始與目前回答、answer_source／retrieval mode 差異，以及判決／法規來源新增移除清單；原始 snapshot MUST 不變。390px viewport 無水平溢出，console error 為 0。
