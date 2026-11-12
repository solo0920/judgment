# Feature Specification: Web 主控台與查詢報表

**Feature Branch**: 未建立（無 `before_specify` hook；以規格目錄 `004-web-console` 識別）

**Created**: 2026-11-06

**Status**: Implemented (MVP, standalone deployment, law/judgment detail, performance Flow report, test-mode multi-model runs, live test flowchart, processing workflows and live download progress, law/judgment data categories, judgment court normalization, versioned judgment vector index/RAG with law/order sources, question bank and benchmark management, Ollama host management, judgment raw-Parquet full-text link, NVIDIA default theme)

**Input**: 使用者提供之需求（原文摘要）：

> 首頁右上角要有 Style 選擇器，提供十種科技網站設計，參考 https://getdesign.md/。Header 以橫向排列三個頁面：RAG 問答、資料庫資料檢視、前後端架構與服務狀態。資料庫頁左側以 radio 選擇資料庫，metadata 篩選條件依資料庫改變；按下搜尋後在右側顯示查詢報表。前端必須使用 vanilla JS，不得捏造 RAG 答案或無法取得的服務資料。

**需求解讀**: 建立一個由 FastAPI 提供 API 與靜態資源的單頁 Web 主控台，讓使用者能在同一個介面完成判決向量檢索與 RAG 問答、資料庫瀏覽與系統狀態檢查。所有顯示的資料都必須可追溯到 PostgreSQL、Qdrant、Parquet、Ollama 或瀏覽器本機儲存；尚未設定的向量索引、RAG 管線與 LLM 必須明確標示為未設定，且不得生成沒有來源的答案。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 以 header 在主要工作頁面間切換 (Priority: P1)

使用者開啟主控台後，看到橫向 header 提供「RAG 提問」、「資料庫」、「資料品質」、「效能報表」、「資料處理」與「系統狀態」六個入口。切換頁面不會整頁重新載入，目前頁面會顯示明顯的選取狀態，並可直接用網址片段回到指定頁面；另有獨立 `#/tests` 路由供系統測試使用。

**Why this priority**: 這些頁面是整個主控台的主要工作流程；沒有穩定的導覽與路由，其他功能無法被使用。

**Independent Test**: 依序點擊六個 header 連結，確認 URL、頁面標題、選取狀態與內容都正確；重新整理或直接輸入 `#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests` 仍能開啟對應頁面。

**Acceptance Scenarios**:

1. **Given** 使用者開啟主控台根路徑，**When** 頁面載入完成，**Then** 預設顯示 RAG 提問頁，且 header 的 RAG 入口為選取狀態。
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

### User Story 3 - 以 radio 選擇資料庫並產生查詢報表 (Priority: P1)

使用者在資料庫頁左側以 radio 選擇 PostgreSQL、Parquet、Qdrant 或 IndexedDB。系統依選擇的資料表／資料集載入不同的 metadata 篩選欄位；按下執行查詢後，右側顯示摘要、分布、實際查詢語句、警告、資料列、分頁與匯出選項。

**Why this priority**: 資料瀏覽與查詢報表是使用者檢查資料品質、版本與匯入結果的主要工具。

**Independent Test**: 分別選擇四種資料來源，確認 radio 狀態、篩選欄位與報表內容正確；在 PostgreSQL 切換 `law_documents`、`law_dataset_versions`、`download_runs`，確認可見欄位會跟著改變。

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

使用者可從 header 右上角的 `Style` 選單選擇十種科技網站風格。選擇後整份介面立即套用對應的顏色、字體、圓角與元件質感，並在下次開啟時保留。

**Why this priority**: 這是明確的視覺需求，能讓同一個工具符合不同展示或品牌情境，但不影響資料正確性。

**Independent Test**: 逐一選擇十種風格，確認選單項目、啟用狀態、頁面色彩與 header 標籤都改變；重新整理後仍維持上次選擇；以鍵盤操作也能完成選擇。

**Acceptance Scenarios**:

1. **Given** 使用者開啟 `Style` 選單，**When** 選單展開，**Then** 顯示十種風格名稱、說明、色票與目前選取狀態。
2. **Given** 使用者選擇任一種風格，**When** 選擇完成，**Then** 介面立即套用該風格，不需要重新載入頁面。
3. **Given** 使用者已選擇風格，**When** 重新整理或再次開啟主控台，**Then** 自動套用上次選擇的風格。
4. **Given** 使用者以鍵盤操作選單，**When** 使用方向鍵、Home、End、Esc 或 Enter，**Then** 可移動焦點、選擇風格或關閉選單。
5. **Given** 使用者選擇深色風格，**When** 瀏覽主要頁面，**Then** 文字、背景、表格與狀態標籤仍保持可讀且對比足夠。
6. **Given** 瀏覽器沒有儲存任何風格選擇，**When** 使用者首次開啟主控台，**Then** 預設套用 NVIDIA 風格，且 `Style` 選單標示 NVIDIA 為目前選擇。

---

### User Story 5 - 檢視架構與誠實的服務狀態 (Priority: P2)

使用者在系統狀態頁查看前端、FastAPI、PostgreSQL、Parquet、Qdrant、Embedding、RAG 管線與 LLM 的健康狀態，以及判決索引覆蓋率、資料量、架構圖、API 端點、最新版本與最近下載執行。未設定的服務會明確標示，不會以正常狀態呈現。

**Why this priority**: 使用者需要快速判斷資料是否可用、哪些元件尚未接入，以及最近的匯入是否成功。

**Independent Test**: 在 PostgreSQL 正常但 Qdrant／RAG／LLM 未設定的環境開啟狀態頁，確認核心服務顯示正常、AI 元件顯示未設定、資料量與最近執行紀錄來自實際資料。

**Acceptance Scenarios**:

1. **Given** 核心服務正常，**When** 開啟狀態頁，**Then** 顯示整體健康狀態、各服務卡片與實際資料筆數。
2. **Given** Qdrant、Embedding、RAG 或 LLM 未設定，**When** 檢視服務卡片，**Then** 狀態為「未設定」或「降級」，並說明缺少的設定或尚未建立的 collection。
3. **Given** PostgreSQL 或 Parquet 無法使用，**When** 檢視狀態頁，**Then** 對應服務顯示降級或離線，整體狀態不標示為正常。
4. **Given** 使用者按下重新整理，**When** 請求完成，**Then** 頁面更新檢查時間、服務狀態與資料量。
5. **Given** 使用者啟用 30 秒自動更新，**When** 停留在狀態頁，**Then** 頁面定期更新；離開頁面後停止計時器。
6. **Given** 使用者查看架構圖，**When** 檢視節點，**Then** 已接入且正常的節點與尚未設定的節點有明顯區別。
7. **Given** 使用者查看最近下載執行，**When** 有成功、無變更或失敗紀錄，**Then** 可看到狀態、時間、耗時、法規數、條文數與錯誤訊息。

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

1. **Given** 測試模式已開啟且 RAG 正在執行，**When** 使用者開啟效能報表頁，**Then** 上方顯示測試流程圖表，並以 1.5 秒 polling 更新。
2. **Given** 一個測試包含 1 個 embedding、1 個 retrieval、1 個 context、4 個 LLM、4 個 validation，**When** 圖表渲染，**Then** 顯示 5 個階段群組與 11 條子程序進度條。
3. **Given** 某個模型失敗，**When** 圖表更新，**Then** 該子進度條以紅色與錯誤訊息顯示；執行中的子進度條以 animated bar 顯示。
4. **Given** 測試完成，**When** 使用者查看最下方，**Then** 總流程進度為 100%，並顯示測試狀態（success／partial／failed）。
5. **Given** 多筆歷史測試，**When** 使用者從「歷史」選單選擇一筆，**Then** 載入該測試的 stages、models、status、duration 與 step 結果。
6. **Given** 後端重啟，**When** 使用者重新開啟效能報表，**Then** 仍可從 PostgreSQL 讀取歷史測試並還原 flowchart。
7. **Given** 390px 行動版，**When** 檢視測試流程圖表，**Then** 不得有水平溢出，階段與進度條仍可閱讀。

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
- 服務狀態在兩次自動更新之間發生變化時，畫面是否可能顯示過期資料？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 主控台 MUST 提供 `#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status` 六個主要頁面，並以橫向 header 導覽；`#/tests` 為可獨立開啟的系統測試路由，不列於 header。
- **FR-002**: header MUST 顯示目前頁面的選取狀態，且切換頁面時不得重新載入整份靜態資源。
- **FR-003**: 主控台 MUST 在無法辨識路由時回到預設的 RAG 頁。
- **FR-004**: RAG 頁 MUST 接受 1–500 字的問題，並以 Enter 送出、Shift+Enter 換行。
- **FR-005**: RAG 頁 MUST 以 Qdrant 判決向量檢索與法規／命令檢索為來源；每個引用 MUST 對應 PostgreSQL `judgment_documents` 中實際存在的案號，或現行法規／命令資料中的條文。
- **FR-006**: RAG 回答 MUST 根據檢索到的法規／命令與判決片段生成，並標示 `[n]` 引用編號；缺少有效引用或引用越界時 MUST 先以 strict prompt 重試一次，仍失敗才降級為 `retrieval_only`。
- **FR-007**: RAG 頁 MUST 在 Qdrant、Embedding、LLM 或資料庫無法使用時顯示明確狀態（`preview`、`retrieval.status` 的 `not_configured`、`unavailable`、`not_indexed`、`degraded`、`retrieval_only`），不得顯示推測內容；有法規／命令來源時仍應使用法規內容回答。
- **FR-008**: 資料庫頁 MUST 以 radio 提供 PostgreSQL、Parquet、Qdrant、IndexedDB 四種資料來源，且同時只有一個被選取。
- **FR-009**: 資料庫頁 MUST 依目前資料表或資料集動態顯示 metadata 篩選欄位，並在切換後清除不相容的條件。
- **FR-010**: PostgreSQL 查詢 MUST 支援 `law_documents`、`law_dataset_versions`、`download_runs` 三個資料表，並拒絕未知資料表。
- **FR-011**: Parquet 查詢 MUST 讀取目前最新的 `law` 或 `order` 快照，不得混用不同版本。
- **FR-012**: Qdrant 查詢 MUST 先以 Embedding 將語意查詢轉為向量；未設定、collection 不存在或查無結果時 MUST 回傳對應狀態與空資料列，不得回傳虛構的向量結果。
- **FR-013**: IndexedDB 查詢 MUST 只在瀏覽器端執行，不得將查詢歷史或設定傳送到伺服器。
- **FR-014**: 查詢報表 MUST 包含符合筆數、結果分布、實際查詢語句、資料列與分頁資訊。
- **FR-015**: 查詢報表 MUST 支援 CSV 與 JSON 匯出，且只匯出目前頁面的資料。
- **FR-016**: 查詢報表 MUST 在無資料、警告、降級或錯誤時顯示對應訊息，不得以空白畫面取代。
- **FR-017**: 查詢歷史與頁面設定 MUST 儲存在瀏覽器本機；IndexedDB 不可用時 MUST 退回記憶體暫存並明確標示。
- **FR-018**: `Style` 選單 MUST 提供十種科技網站風格，套用時不得重新載入頁面。
- **FR-019**: 使用者選擇的風格 MUST 在重新開啟主控台後保留。
- **FR-020**: `Style` 選單 MUST 支援滑鼠與鍵盤操作，並在關閉後恢復焦點。
- **FR-021**: 狀態頁 MUST 顯示前端、API、PostgreSQL、Parquet、Qdrant、Embedding、RAG 與 LLM 的狀態。
- **FR-022**: 狀態頁 MUST 將未設定的服務標示為 `not_configured`、降級的服務標示為 `degraded`，不得以正常或推測數據呈現。
- **FR-023**: 狀態頁 MUST 顯示實際資料筆數、Parquet 快照數、最新版本與最近下載執行。
- **FR-024**: 狀態頁 MUST 支援手動重新整理與可選的 30 秒自動更新，離開頁面後停止自動更新。
- **FR-025**: 架構圖 MUST 區分已接入且正常的節點與尚未設定或尚未接入的節點。
- **FR-026**: 查詢頁（`#/data`）的 PostgreSQL／Parquet／Qdrant 查詢 MUST 為唯讀；`#/processing`、題庫、benchmark 與 Ollama 主機管理屬於獨立的管理介面，可執行寫入與啟動程序。
- **FR-027**: API MUST 對未知資料庫、未知資料表、無效分頁與空白問題回傳明確的 4xx 錯誤。
- **FR-028**: 主控台 MUST 在桌面與 390px 寬的行動裝置上保持可操作，且不得產生水平溢位。
- **FR-039**: PostgreSQL 與 Parquet 的 `law_documents` 查詢結果 MUST 讓 `law_name` 可點選並開啟單一法規報表；其他資料表不得顯示法規明細入口。
- **FR-040**: 單一法規報表 MUST 顯示可追溯的 metadata、最新 Parquet 快照中的結構化條文（若有）、資料來源與快照資訊；缺少條文時 MUST 顯示警告，不得補造內容。
- **FR-041**: 單一法規報表 MUST 提供「返回查詢結果」，回到原本的查詢報表、頁碼與資料列，且不得重新執行查詢。
- **FR-042**: 法規條文 MUST 一次載入全部條文，不得使用上一頁／下一頁分頁；MUST 提供「跳至第幾條」輸入，跳轉不得影響法規 metadata 或其他查詢狀態。
- **FR-043**: `GET /api/law` MUST 唯讀查詢，對未知法規回傳 404、對不支援的 `source_type` 回傳 400，且不得因缺少 Parquet 條文而回傳虛構內容。
- **FR-044**: 法規報表的「法規沿革」MUST 預設收合，使用者點擊後展開／收合；跳轉條文時 MUST 保留目前的展開狀態。
- **FR-045**: `#/status` 的「系統測試」分類（或 `#/tests`）MUST 提供可點擊的測試模式開關；開關 MUST 為無外框膠囊；測試模式 ON 時 MUST 顯示綠色「ON」與右側白色旋鈕，OFF 時 MUST 顯示紅色「OFF」與左側白色旋鈕。header 只保留 Style 選單與六個主要導覽。
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
- **FR-088**: `/api/test-mode` MUST 提供測試模式讀取與切換；模型清單 MUST 從 Ollama 自動偵測，排除 reranker，並以 `TEST_EMBEDDING_MODELS`／`TEST_LLM_MODELS` 支援覆寫。
- **FR-089**: 測試模式 ON 時，RAG 請求 MUST 依序執行所有可用 embedding 模型（embedding、Qdrant 檢索）與所有可用 LLM 模型（生成、引用驗證）；前端與後端模型呼叫 MUST 不設 timeout。
- **FR-090**: 每次測試 MUST 寫入 `performance_test_runs` 與 `performance_test_steps`，包含 run id、request id、問題、主要答案、狀態、stage、model、module、function、progress、duration、error 與 summary；後端重啟後 MUST 可查詢。
- **FR-091**: 效能報表頁上方與 RAG 提問頁下方 MUST 顯示測試流程圖表；圖表 MUST 標記 RAG 問題、RAG 答案、每步驟 module／function；每個階段依模型數量顯示子程序進度條，最下方顯示總流程進度與依階段耗時比例的 stacked time bar（含 legend 的階段、耗時、百分比），執行中 MUST 以 polling 更新。
- **FR-092**: 測試流程圖表 MUST 提供歷史選單，可依 run id 載入過去的 stages／steps／status／duration，還原歷史 flowchart。
- **FR-093**: 測試模式的主要回答 MUST 優先使用 `LLM_MODEL`，其次使用第一個通過引用驗證的模型；全部失敗時 MUST 降級為 `retrieval_only`。
- **FR-094**: 測試模式中的個別模型失敗（例如 HTTP 400）MUST 記錄為 failed step，不得中斷其他模型；測試狀態 MAY 為 `partial`。
- **FR-095**: 測試模式開關 MUST 位於 `#/status` 的「系統測試」分類或 `#/tests`；header 不再提供電源或測試模式膠囊開關。後端電源 MUST 由 `./up.sh`／`./down.sh` 或本機電源控制器管理。
- **FR-096**: 判決 Parquet 匯出 workflow（`python -m judgment.judgment_parquet`）MAY 將 `judgment_documents` 匯出為過濾後的 Parquet 快照；但 `GET /api/judgment?source=parquet`、資料頁與 Schema 模式 MUST 讀取原始判決 Parquet（`parquet/raw_judgments/.../raw.parquet`），找不到時回傳 404 並提示先建立原始備份。
- **FR-097**: RAG 引用卡 MUST 可點擊案號標題（`citation-head`）開啟原文，點擊後 MUST 以 dialog 顯示原始判決 Parquet 中的完整判決、案號、法院、日期、案由、命中法規與 PDF 連結；不得以 PostgreSQL 或虛構內容冒充 Parquet；dialog MUST 可透過右上角 X、「返回回答」或點擊 dialog 外部關閉。
- **FR-098**: RAG 一般模式 MUST 使用可設定的快速 profile（`.env.example` 預設 `gemma3:4b`；程式 `LLM_MODEL` 預設空，未設定時只回傳檢索結果。`RAG_TOP_K=4`、`RAG_MAX_CONTEXT_CHARS=4000`、`LLM_NUM_CTX=4096`、`LLM_NUM_PREDICT=384`、`LLM_KEEP_ALIVE=30m`），並 MUST 允許改回 27B 品質模式；測試模式不受快速 profile 限制。
- **FR-099**: RAG 回答標頭 MUST 在狀態與耗時旁顯示實際使用的 LLM 模型名稱；測試模式 MUST 顯示 `test_run.primary_model`，tooltip MUST 同時提供 LLM 與 embedding 模型資訊。
- **FR-100**: 法規／命令／判決下載 workflow 的「執行此流程」MUST 先以 `POST /api/updates/check` 只檢查該來源；若結果為 `up_to_date`，MUST 顯示「已是最新版本，仍要強制重新下載？」確認，取消時不得啟動流程。檢查失敗 MAY 顯示警告後允許執行。
- **FR-101**: 每個 workflow 面板 MUST 顯示實際階段的獨立進度條、狀態、筆數／bytes、耗時與訊息，並以不同顏色標記；下方 MUST 顯示由各階段加總的整體進度堆疊條與 legend。滑鼠移到階段、色塊或 legend 時 MUST 只保留該項目並以浮動提示顯示名稱、進度、整體占比、耗時與訊息。不得顯示流程未實際執行或不存在的階段（例如法規／命令下載不得虛構 Qdrant／IndexedDB 階段）。
- **FR-102**: Qdrant 版本建置 workflow MUST 在開始前測試主要／備援 Ollama 的 `/api/tags` 與 embedding 模型可用性，記錄每台主機 URL／host／port／模型清單、最後選用主機與執行中實際使用主機；若無可用主機 MUST 明確失敗。索引期間 MUST 顯示與判決下載相同的「年份列 × 月份欄」時間表；完成索引為綠色、已開始但未完成為紅色、新檔／尚未索引為灰色、無資料為空白，目前索引月份 MUST 有動態標示。月份 tooltip MUST 包含來源檔案、已處理／總筆數、進度、重用、新 embedding 與目前案號。若尚無本次索引 run，系統 MUST 以 active collection 的實際月份覆蓋率顯示同一張表，並可快取避免每次 poll 重算。
- **FR-103**: 判決匯入 workflow MUST 顯示與判決下載相同的「年份列 × 月份欄」時間表，依下載 manifest 與 PostgreSQL `source_archive` 比對：已匯入為綠色、未匯入為紅色、有新檔或遠端新版本待匯入為灰色，無資料為空白；目前匯入月份 MUST 有動態標示。月份 tooltip MUST 包含本機壓縮檔、已匯入檔案、manifest latest／local fileset 與目前匯入檔名。
- **FR-104**: 法院名稱正規化分頁 MUST 提供「檢查法院名稱」並以年份列 × 月份欄顯示檢查結果：全部已正規化為綠色、完全未檢查為紅色、部分未正規化或有無效值為灰色、無資料為空白。結果 MUST 包含每月總筆數、已檢查、未檢查、無效值、需正規化與有效比例；進入分頁 MAY 自動檢查，並 MUST 可手動重新檢查。
- **FR-105**: 建立條文歷史分頁最上方 MUST 提供「檢查條文歷史／檢查是否需建立」，以年份列 × 月份欄顯示：該月所有版本都有歷史條文為綠色、完全未建立為紅色、部分版本已建立為灰色、無資料為空白；目前版本 MUST 有可辨識外框。結果 MUST 包含版本數、法規／命令版本數、版本 ID、已建立／未建立版本、需建立／可建立／缺原始檔版本、條文列與預期條文數。需建立版本 MUST 逐筆標示是否能找到原始 Parquet；缺原始檔者 MUST 標示無法建立。進入分頁 MAY 自動檢查，並 MUST 可手動重新檢查。面板 MUST 顯示 Qdrant Docker context、container、image、容器內儲存路徑、volume 名稱／容量、host 來源路徑與 collection points／segments。
- **FR-100**: 效能報表的 Flow 時間軸 MUST 顯示每個 segment 的實際開始時間（`started_at`）與「本點到下一點」區間；區間 MUST 以下一點 `offset_ms` 減本點 `offset_ms` 計算，最後一點使用本段 `duration_ms`。長條 MUST 依 `offset_ms` 定位、依該區間佔總 Flow 時間的比例決定寬度。「累計」MUST 採流水線累加：第一點 `offset_ms` 到本點結束的差額，不得使用父區段自身的 `duration_ms`；第一點的累計等於其點位區間，最後一點的累計等於總 Flow 時間。
- **FR-101**: RAG MUST 將法規與命令納入檢索：以 PostgreSQL `law_documents` 比對問題中的法規／命令名稱與常見簡稱（例如 `證交法` → `證券交易法`），並從最新法規 Parquet 讀取相關條文、沿革與制定日期；回應 MUST 包含 `law_sources`，且法規來源不得被虛構或誤標為判決。
- **FR-102**: 問題為條文數、制定／開始日期或判決引用統計時，系統 MUST 以檢索到的法規 metadata、條文與判決引用次數產生可驗證的結構化回答，並標示引用編號；引用統計 MUST 說明其為判決引用次數，不得宣稱定罪率或勝訴率。
- **FR-103**: 法規／命令來源存在時，即使 Qdrant 未設定、無法連線或沒有相似判決，RAG MUST 仍能使用法規／命令內容回答；只有在法規與判決來源都不存在時才可降級為預覽或 `retrieval_only`。
- **FR-104**: RAG 回覆中的法規／命令卡 MUST 可點擊開啟原文 dialog，內容 MUST 從本地法規 Parquet 快照讀取完整 `law_articles`；dialog MUST 一次列出全部條文（不得分段分頁），並顯示來源快照、法規沿革與來源網站，且 MUST 可透過 X、「返回回答」或點擊外部關閉。
- **FR-105**: 法規／命令發現型問題（例如「有哪些法規和壽險及產險相關？」）MUST 依資料庫名稱與類別關鍵字整理相關法規與命令，回應 MUST 包含 `law_sources` 清單並標示這不是完整列舉；判決引用統計若改用全文比對，MUST 在回答中標示「全文提及」。
- **FR-106**: 資料庫頁 MUST 在資料庫選項下方提供「查詢／Schema」切換；Schema 模式 MUST 依目前法規命令或判決分類，列出所選資料庫的資料表／collection／object store；點選資料表後 MUST 留在 Schema 模式，並在右側顯示欄位名稱、前 10 筆資料與總筆數。表頭 MUST 可依實際欄位名稱排序；欄位名稱上方 MUST 提供逐欄 fuzzy 搜尋列與下拉建議。建議 MUST 回傳所有符合值（上限 1,000 筆），依相似度排序（完全相同、前綴、出現位置、長度與序列相似度）；模糊查詢 MUST 以 2-gram token 聯集找候選，例如「證券設置」MUST 找到「證券商設置標準」與「證券投資信託事業設置標準」。列表 MUST 標示輸入關鍵字（可分段標示），選取建議後 MUST 套用該欄位值並顯示符合記錄。Schema 預覽中的法規名稱 MUST 可點選，並開啟該法規的完整報表；報表條文 MUST 從本地 Parquet 快照讀取。
- **FR-107**: 判決分類 MUST 提供 Parquet 資料庫選項，查詢 MUST 讀取最新原始判決 `raw.parquet` 並支援關鍵字、法院、裁判日期、引用數與排序；結果的案號 MUST 可點選並以 `source=parquet` 開啟原判決。
- **FR-108**: 一般查詢報表 MUST 使用單列精簡表格：每筆記錄不得因欄寬不足換行，欄寬 MUST 依內容調整並允許水平捲動；表頭 MUST 可依實際欄位排序，並 MUST 提供逐欄 fuzzy 搜尋與相似度排序建議。
- **FR-109**: 法規報表 MUST 一次載入並顯示全部條文，不得使用條文上一頁／下一頁分頁；MUST 提供「跳至第幾條」輸入框，接受 `100`、`第100條`、`37-1` 等格式，按 Enter 或按鈕後 MUST 捲動至該條並醒目提示；條文超過 100 條時 SHOULD 提供浮動跳轉控制。
- **FR-110**: 全站 sticky／fixed 的 header 與導覽列 MUST 使用不透明背景，MUST NOT 依賴 `backdrop-filter` 即時模糊背景；連續滾動時 MUST NOT 閃爍、消失或重新播放進場動畫。
- **FR-111**: 所有 `scroll` 事件處理器 MUST 在沒有實際可見狀態變更時提前返回，不得在每次 scroll 重建、清空或查詢與滾動無關的 DOM；此類 listener SHOULD 以 passive 模式註冊。查詢報表的換頁、排序與每頁筆數切換 MUST 保留目前內容並以低調的更新狀態呈現，不得先替換為骨架或重播進場動畫；表格、報表卡片與其內部資料呈現元素（例如分布條）MUST NOT 套用會隨資料重繪而重播的 animation 或 transition。
- **FR-112**: 全站所有頁面（`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`）凡因自動更新、polling、手動重新整理、換頁、排序、每頁筆數切換、篩選、分類切換或 dialog 內容替換而重新繪製的區塊，MUST 直接以最終樣式呈現；MUST NOT 套用進場動畫、淡入／淡出、`opacity` transition、位移 transform、會重播的 keyframes、半透明 refreshing 覆蓋或先替換為骨架。表格、報表卡片、分布條、時間表、清單、統計卡與 dialog MUST 在新資料抵達前保留目前內容，抵達後一次更新。
- **FR-113**: 僅表達實際執行狀態的視覺回饋 MAY 使用動畫：進度條、spinner、串流游標、狀態脈動、toast、展開／收合與 hover／focus 效果。這些效果 MUST NOT 因資料輪詢、重新整理或區塊重繪而從頭播放，且 MUST NOT 以淡出、變透明或遮罩方式隱藏目前資料。全站 MUST NOT 使用 `backdrop-filter` 或類似的即時背景模糊裝飾 sticky／fixed 導覽列（依 FR-110）。
- **FR-114**: 路由切換時舊頁面 MUST 保持顯示直到新頁面內容同步就緒，不得先插入整頁 skeleton、白屏或重播頁面進場動畫。裝飾性固定背景 MUST 使用獨立固定圖層或等效方式呈現，不得讓主要捲動容器在每次 scroll 時重繪固定背景。
- **FR-115**: `#/processing` 中含 embedding 的流程執行資訊 MUST 顯示已知 Ollama 主機與模型清單；可用主機與模型 MUST 以綠色呈現，無回應、斷線或不可用者 MUST 以灰色呈現。主機清單 MUST 支援拖移或等效控制以調整優先順序並持久化；第一優先主機無法提供 embedding 時，系統 MUST 依序自動嘗試下一台，直到成功或全部失敗。調整順序後 MUST 同步更新目前主機與 embedding fallback 設定。
- **FR-116**: `#/performance` MUST 提供 RAG Pipeline waterfall，且每次 `#/rag` 回答的最下方 MUST 以相同規格與相同視覺格式嵌入該次請求的 waterfall；二者 MUST 共用同一套階段、摘要、時間軸與展開明細。Waterfall MUST 將單次 RAG Trace 的 Parsing、Embedding、Qdrant、Reranker、Context、LLM 與 Response 依執行順序由左至右緊密排列，每一階段 bar MUST 從上一階段 bar 的結束位置接續開始，不得留下未追蹤空隙或互相重疊；實際 `started_at`／`finished_at`／`offset_ms`／`end_offset_ms` MUST 保留在展開明細與 hover 資訊中。每個 span SHOULD 記錄模組、函式、參數與階段監控欄位：Parsing 輸入長度、Embedding Model／Token／Batch、Qdrant Collection／Filter／Top K、Reranker Model／候選數、Context Chunk／Token、LLM Model／Input／Output Token／TTFT、Response 總耗時／引用數／Abstain。點選階段 MUST 可查看上述欄位與開始／結束時間。
- **FR-117**: `#/rag` 首頁狀態區 MUST 彙整所有可用主機已確認支援 chat 的模型按鈕，按鈕名稱 MUST 使用「主機名稱:模型名稱」（例如 `mbp:gemma3:4b`、`x570:gemma3:4b`）；可用模型 MUST 以綠色呈現，目前使用中的 provider／模型 MUST 有明確標示，點選其他模型 MUST 切換並持久化，且下一次提問 MUST 立即使用新模型。切換 LLM provider MUST NOT 改變 embedding 主機的優先順序。若模型尚未測試 chat 能力，介面 MUST 提供重新檢查入口；不得把未測試或確定不支援 chat 的模型標示為可用。
- **FR-118**: `#/status` 的 Model Provider 主機模型清單 MUST 顯示每個模型已測試的能力標籤（至少 Chat、Embedding、Vision、Tools、Thinking、Speech、Reranker 中適用的項目）；尚未測試的模型 MUST 明確標示「未測試」，不得推測其能力。介面 MUST 提供「檢查模型能力」動作，檢查所有可用主機並更新快取。
- **FR-119**: 全站所有「以時間呈現執行流程」的視圖 MUST 共用同一套 waterfall 元件與視覺規格（axis、階段列、bar、可展開明細、hover 資訊卡）；至少涵蓋 `#/rag` 回答底部、`#/rag` 後端處理流程、`#/performance` 的 RAG Pipeline、效能 Flow 紀錄與測試 Flow。RAG Pipeline MUST 採依執行順序接續的水平排列；效能 Flow 與測試 Flow MAY 依實際 offset 呈現平行 span。靜態架構圖、資料流程圖與處理頁的 pipeline canvas 不屬於時間軸流程，可維持原呈現，但不得另外發明不同的時間軸視覺。
- **FR-120**: waterfall 中任何使用模型的 span（Embedding、LLM、Reranker 等）與其 Model Load 區段 MUST 在階段列、明細與 hover 資訊中標註「主機名稱:模型名稱」；主機名稱取自 Model Provider 設定，舊資料找不到名稱時才退回 URL hostname。
- **FR-121**: 使用模型的 span SHOULD 記錄 Ollama `load_duration`，並在對應 Embedding／LLM 階段的 bar 內，以獨立的藍色前段呈現 Model Load；不得把不同來源的載入合併，也不得另列成與來源階段未對齊的子階段。展開明細 MUST 將 Model Load 與推論分成兩個區塊，各自顯示實際開始／結束時間與耗時，且 Model Load 的結束時間 MUST 等於推論的開始時間。該區段 MUST 分開呈現冷啟動載入耗時、模型呼叫總耗時、扣除載入後（熱啟動）流程時間與載入占比，讓冷啟動與熱啟動可直接比較。載入時間為 0 或低於門檻時 MUST 標示為熱啟動。
- **FR-122**: 滑鼠移到任一 waterfall bar 上時 MUST 顯示該 span 的資訊卡，內容與該階段展開明細一致，至少包含開始／結束時間、耗時、模型／主機與可用監控欄位；資訊卡 MUST 跟隨指標並避開視窗邊界，離開 bar 或捲動時 MUST 隱藏。
- **FR-123**: 根網址與預設路由 MUST 顯示獨立 `#/home` 首頁；品牌標誌 MUST 導回首頁。首頁 MUST 包含原 RAG 頁主視覺文案、可直接輸入問題的輸入框、七個主要分頁的介紹 section，以及包含 MIT 授權、Copyright 與法律免責聲明的 footer。首頁送出問題後 MUST 導向 `#/rag` 並自動以該題目發問。
- **FR-124**: RAG MUST 支援 cross-encoder reranker。啟用時 MUST 先向 Qdrant 取得 `RAG_RERANK_CANDIDATES` 筆候選，依序嘗試 `RERANK_URL` 與 `RERANK_FALLBACK_URL` 的 `/v1/rerank` 或 `/rerank`，再依 rerank 分數取 `RAG_TOP_K` 筆進入 Context；不得把 reranker 當成 Ollama chat 模型。`rag.rerank` Flow MUST 記錄 model、provider、候選數、選用數、top score、fallback 與錯誤。主要與 fallback 都失敗時 MUST 保留原本 Qdrant 排序並將 `retrieval.rerank.status` 標示為 `degraded`，不得因此讓回答失敗。第一輪預設模型為 `bge-reranker-v2-m3`。
- **FR-125**: `#/rag` 的模型狀態區 MUST 另列 Rerank models，顯示主要與 fallback reranker 的「主機:模型」；可用者 MUST 以綠色呈現，離線、degraded 或未啟用者 MUST 以灰色呈現，並標示目前實際使用的 reranker。區塊 MUST 提供重新檢查健康狀態的動作；reranker 設定未啟用時 MUST 顯示「未啟用」，不得把離線模型標示為可用。
- **FR-126**: RAG MUST 區分法規優先（law-first）與判決優先（judgment-first）。問題含明確法規名稱或法規導向詞彙（規定、條文、義務、責任、限制、罰則、從業人員、負責人、職員等）時 MUST 採 law-first；含判決、案例、法院、實務等詞彙時 MUST 採 judgment-first。law-first 時法規／命令 context MUST 排在判決前、法規 citation MUST 從 `[1]` 開始、判決最多保留 `RAG_LAW_FIRST_JUDGMENT_LIMIT` 筆；LLM prompt MUST 要求以現行法規／命令條文為主要依據，判決僅作實務補充。`那些規定`／`有哪些規定` 不得被誤判為「列出相關法規」，且未實際回傳結構化清單前 MUST NOT 清空已選出的法規 articles。
- **FR-050**: 文件 MUST 說明電源控制器的啟動方式、日誌位置、停用設定，以及由後端提供頁面時停止後重新整理的限制。

### Key Entities

- **Console Route**: 主控台的主要頁面與 URL 片段，包含 RAG、資料庫、資料品質、效能報表、資料處理、系統狀態，以及獨立的 `#/tests` 系統測試路由。
- **Service Status**: 單一服務元件的識別、名稱、類型、狀態、延遲與說明；狀態必須來自實際檢查或明確設定。
- **Database Catalog**: 可用資料來源、狀態、說明與動態 metadata 欄位定義。
- **Query Report**: 一次查詢的資料庫、資料表、條件、摘要、分布、查詢語句、資料列、分頁、警告與耗時。
- **Law Detail Report**: 單一法規的 metadata、狀態、沿革、附件、條文、資料來源與 Parquet 快照資訊，以及返回原查詢報表的狀態。
- **Power Controller**: 綁定本機 loopback 的獨立控制器，可啟動／停止 `judgment-web`，並在後端停止後繼續存活。
- **Data Category**: 資料庫頁的「法規命令」或「判決」分類；每個分類擁有各自的資料庫、資料表與篩選條件。
- **Judgment Document**: 已命中金融法規清單的判決文件，包含案號、法院（原始與正規化）、裁判日期、案由、全文、命中法規、引用與來源壓縮檔。
- **Court Normalization**: 判決法院名稱的正規化結果；保留原始 `court`，並以 `court_normalized` 儲存標準法院名稱；程式定義 40 個現行／歷史名稱，目前資料實際出現 37 個。
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
- **Local History Entry**: 儲存在瀏覽器的提問或查詢紀錄，包含類型、標題、摘要、參數與建立時間。
- **Architecture Layer**: 系統架構中的一層節點，例如 Client、Application、Data 與 Intelligence。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 使用者可在 3 次點擊內從任一主要頁面切換到其他 header 頁面。
- **SC-002**: 六個主要頁面與 `#/tests` 在桌面與 390px 行動版皆無水平溢位，且 header 導覽仍可操作。
- **SC-003**: 十種風格皆可從 `Style` 選單套用，重新整理後仍保留上次選擇。
- **SC-004**: RAG 回答的每一筆判決引用都能在 PostgreSQL 中找到對應案號；法規／命令引用的每一筆都能在現行法規資料中找到對應名稱與條文。
- **SC-005**: 沒有相似度足夠的判決且沒有法規來源時回傳零筆引用，且回答明確說明無法產生有依據的答案；有法規來源時仍使用法規內容回答。
- **SC-006**: 四種資料來源都能產生查詢報表或明確的未設定／錯誤狀態，且沒有虛構資料列。
- **SC-007**: PostgreSQL 的三個資料表切換後，畫面只顯示該資料表適用的篩選欄位。
- **SC-008**: 查詢報表可在 2 秒內完成一般關鍵字查詢（不含首次資料載入與網路傳輸）。
- **SC-009**: 未設定的 Qdrant、Embedding、RAG 與 LLM 在狀態頁與 RAG 頁皆顯示 `not_configured` 或 `degraded`，不會顯示為正常。
- **SC-010**: 狀態頁的資料筆數與最近下載執行與 PostgreSQL／資料目錄的實際內容一致。
- **SC-011**: IndexedDB 不可用時，查詢與提問仍可在記憶體模式下完成，且畫面明確標示資料不會持久化。
- **SC-012**: 在實際資料集上，Playwright 檢查主要頁面、四種資料來源與十種風格時，沒有 console error 或失敗請求。
- **SC-017**: 從 PostgreSQL 與 Parquet 的法規查詢結果皆可開啟法規完整報表，並以「返回查詢結果」回到原本的查詢頁碼與資料列。
- **SC-018**: 從 `#/status` 的「系統測試」或 `#/tests` 可切換測試模式 ON／OFF，狀態顏色、標籤與 `aria-checked` 和 `/api/test-mode` 一致；後端電源仍由本機腳本／控制器管理。
- **SC-028**: 測試模式 ON 時，一次 RAG 請求會執行所有可用 embedding／LLM 模型；實際 4 個 LLM 的測試產生 11 個 steps，總耗時約 82–149 秒，前端不得因 45 秒 timeout 中止。
- **SC-029**: 測試流程圖表在執行中會 polling 更新進度；完成後顯示問題、答案、每個步驟的 module／function、5 個階段、每個模型一條子進度條、100% 總進度與依階段耗時比例的總流程時間 bar；失敗模型顯示紅色與錯誤訊息。
- **SC-030**: 重新載入效能報表後，可從歷史選單載入先前的 test run，還原相同的 stages、models、status、duration 與 step 狀態。
- **SC-031**: 原始判決 Parquet 目前有 2,485,151 筆、約 6.23 GB；以 `jid` 讀取單筆全文可在 1 秒內完成，RAG 引用卡的 Parquet dialog 顯示的案號與全文與原始 `raw.parquet` 一致。過濾後的 `judgments.parquet` 只能由「判決 Parquet 匯出」workflow 選擇性產生，不是查詢來源。
- **SC-032**: 快速 profile（`.env.example` 的 `gemma3:4b`、top_k=4、4,000 字上下文、num_ctx=4096、num_predict=384）在實際金融法規問題上 MUST 於 10 秒內完成一般 RAG 回答；實測約 2–5 秒。
- **SC-033**: 「證交法有多少條文?」MUST 回傳 `證券交易法` 229 條並附法規來源；「銀行法是何時開始有的?」MUST 回傳中華民國 20 年 3 月 28 日（1931-03-28）；「保險業務員最常觸犯什麼法條?」MUST 依判決引用統計列出熱門法條並標示引用次數，不得虛構數字。
- **SC-035**: 「證券營業員常觸犯什麼法規或命令?」MUST 依判決引用統計列出法規／命令並標示次數；「有哪些法規是和壽險及產險相關的?」MUST 回傳含保險法、簡易人壽保險法與財產保險相關命令的法規清單。
- **SC-036**: 判決分類的 Schema 模式 MUST 顯示 `judgment_documents` 與 `judgment_import_runs`；切換 Parquet 後 MUST 顯示原始判決 Parquet 資料表，點選後 MUST 在右側顯示欄位、前 10 筆資料與目前總數（2026-11-11 為 2,485,151 筆）；表頭排序與逐欄搜尋建議 MUST 正常，並可開啟 Parquet 原判決。
- **SC-037**: 以滑鼠或觸控板在所有主要頁面連續上下滾動至少 10 秒時，header MUST 保持不透明且不得出現可視閃爍、消失或重新進場；資料頁切換每頁 10／25／50／100 筆、上／下一頁與排序時，表格 MUST 維持顯示直到新結果抵達，不得先閃成骨架，且表格、報表卡片與分布條不得重播進場動畫或淡入淡出效果。
- **SC-038**: 在 `#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests` 分別連續觸發自動更新、重新整理、換頁、排序、每頁筆數切換、篩選與分類切換至少三次時，畫面 MUST NOT 出現可視閃爍、白屏、淡入淡出、透明度變化或進場動畫重播；表格、報表卡片、分布條、時間表、清單與統計卡 MUST 保持穩定並直接更新為最終狀態。
- **SC-039**: 連續在七個主要頁面之間切換路由至少 10 次時，不得先出現整頁 skeleton、白屏或頁面進場動畫；header 與固定背景 MUST 保持穩定，舊頁面 MUST 直接由新頁面內容取代。
- **SC-040**: 在 `#/processing` 的 `full_update`、`judgment_import` 或 `index_versions` 執行資訊中，至少三台 Ollama 主機（含一台離線）時，離線主機 MUST 顯示灰色、可用主機與模型 MUST 顯示綠色；拖移或箭頭調整順序後重新整理頁面，順序 MUST 保持；將第一優先設為離線主機時，embedding MUST 自動改由下一台可用主機完成，且不得回傳模擬向量。
- **SC-041**: 在 `#/performance` 的 RAG Pipeline 分頁選擇任一含 Flow 的 RAG Trace 時，以及 `#/rag` 每次完成回答後，waterfall MUST 依序顯示 Parsing、Embedding、Qdrant、Reranker、Context、LLM、Response；每列 MUST 顯示耗時，且 bar MUST 依執行順序接續排列，上一階段 bar 的結束位置 MUST 等於下一階段 bar 的開始位置。Embedding／LLM 的 bar MUST 以藍色前段標示 Model Load。點選階段後 MUST 顯示該 span 的實際開始／結束時間、module／function 與可用監控欄位。RAG 回答中的 waterfall MUST 位於回答內容與來源清單之後，且與效能頁使用相同階段與摘要格式。
- **SC-042**: 在 `#/rag` 首頁至少有兩台主機、每台各有一個已確認支援 chat 的模型時，模型按鈕 MUST 以「主機:模型」顯示並全部為綠色，目前 provider／模型 MUST 標示使用中；點選另一台主機的模型後，按鈕選取狀態與「目前」文字 MUST 更新，重新整理頁面後仍保持，且 `/api/status` 的 LLM model／URL 與下一次 RAG 請求使用的 provider 模型 MUST 一致，embedding 主機順序 MUST 不變。
- **SC-043**: Model Provider 至少兩台可用主機時，主機模型清單 MUST 顯示各模型已測試能力標籤；Chat、Embedding、Vision、Tools、Speech、Reranker 範例各自出現於對應模型，未測試模型 MUST 顯示「未測試」。按下「檢查模型能力」後，新安裝但尚未快取的模型 MUST 更新為其實際能力，且重新載入頁面後仍保留。
- **SC-044**: 在 `#/performance` 的 RAG Pipeline、任一 Flow 紀錄、測試 Flow，以及 `#/rag` 回答底部與後端處理流程中，時間軸 MUST 使用相同的 `.rag-wf-*` waterfall 結構；不得再使用舊的 `flow-timeline` 或 `test-flow-time` 作為主要流程呈現。RAG Pipeline MUST 依階段耗時接續排列，效能 Flow 與測試 Flow MAY 依實際 offset 定位並重疊平行 span。階段可展開且資料不足時顯示「未記錄」。
- **SC-045**: 任一含模型呼叫的 waterfall 在 Embedding、LLM、Reranker 階段列，以及 Embedding／LLM bar 的 Model Load 區段 MUST 顯示「主機:模型」，例如 `mbp:bge-m3`、`x570:gemma3:4b`；展開明細與 hover 資訊 MUST 顯示相同主機與模型。舊 Flow 缺少 `provider_name` 時 MUST 從 endpoint URL 顯示 hostname。
- **SC-046**: 當 Ollama 回應包含 `load_duration` 時，waterfall MUST 在來源 Embedding／LLM 階段 bar 的開始處顯示藍色 Model Load 區段，且該區段 MUST 與後續階段時間精準接續，不得另列成未對齊的子階段，也不得將不同來源的載入合併；展開明細 MUST 分成 Model Load 與推論兩個區塊，各自顯示正確且不同的開始／結束時間，兩者交界時間 MUST 相同；冷啟動案例 MUST 顯示載入耗時、模型呼叫總耗時、扣除載入後時間與載入占比，且載入時間大於等於 100 ms 時標示冷啟動；熱啟動案例載入為 0 或低於門檻時 MUST 標示熱啟動。滑鼠移到藍色 Model Load bar 時 MUST 顯示上述數值。
- **SC-047**: 直接開啟 `/` 或 `#/home` MUST 顯示首頁，內容包含主視覺、提問輸入框、七個分頁介紹與 footer；品牌標誌 MUST 連到 `#/home`。在首頁輸入題目並送出後 MUST 導向 `#/rag`、保留題目並自動發問。footer MUST 顯示 `© 2026 Judgment RAG Console`、`MIT License` 與「法規資料僅供檢索與研究參考，不構成法律意見」。
- **SC-048**: 啟用 reranker 且主要端點可用時，RAG 回覆的判決順序 MUST 依 rerank 分數排列，`retrieval.rerank.status` MUST 為 `ok`，`rag.rerank` Flow MUST 顯示「主機:模型」、候選數、選用數與 top score。主要端點失敗但 fallback 可用時 MUST 自動改用 fallback，並將 `fallback_used` 標示為真。兩者都失敗時 MUST 保留 Qdrant 原排序、只取 `RAG_TOP_K` 筆，且 `retrieval.rerank.status` MUST 為 `degraded`，回答不得因 reranker 失敗而中斷。
- **SC-049**: 當主要 reranker 離線、fallback 可用時，`#/rag` 的 Rerank models MUST 將主要模型顯示為灰色「離線」、fallback 顯示為綠色「使用中」，並以 fallback 作為目前 reranker。兩者都離線時 MUST 全部灰色並顯示「無可用模型」；`RAG_RERANK_ENABLED=false` 時 MUST 顯示「未啟用」。按下重新檢查後 MUST 依最新健康狀態更新顏色與目前使用標示。
- **SC-050**: 當使用者詢問「銀行法對從業人員有那些規定？」時，RAG MUST 判定為 law-first、保留銀行法已選出的 articles、將法規 source 編號為 `[1]`，並讓判決從 `[2]` 開始；`retrieval.mode` MUST 為 `law_first`，判決 context 數 MUST 不超過 `RAG_LAW_FIRST_JUDGMENT_LIMIT`。同時，「有哪些法規和壽險及產險相關？」仍 MUST 觸發 related-laws 結構化清單；「銀行法有哪些規定？」MUST NOT 被當成相關法規清單。
- **SC-034**: 點擊 `證券交易法` 法規卡 MUST 從本地 Parquet 開啟 229 條原文 dialog，一次列出全部條文並顯示 `Parquet 條文` 來源，不得出現分頁控制；X、「返回回答」與點擊外部 MUST 可關閉，且 390px 無水平溢出。
- **SC-019**: 資料庫頁可在法規命令與判決間切換；判決分類可查詢已篩選的 `judgment_documents`，且未匯入或未命中時顯示 0 筆，不出現虛構資料。
- **SC-020**: 從判決查詢結果可開啟判決原文，並以「返回查詢結果」回到原本的判決頁碼與資料列。
- **SC-021**: 執行 API 或 CLI 後，效能報表可查到對應的 process、module、timestamp、duration 與 flow；以程序、狀態或模型篩選時只回傳符合的紀錄，並顯示平均與 P95 耗時。
- **SC-022**: 以目前 738,743 筆判決回填後，法院下拉選單只包含程式定義的標準法院名稱（目前資料出現 37 個）且無空值或重複；以「臺灣臺北地方法院」篩選得到 106,638 筆，排序與判決原文顯示的法院名稱一致。
- **SC-023**: 向量索引中斷後重跑時，已索引且 content hash 未變更的判決不會重複寫入 Qdrant；`judgment_vector_index` 與 Qdrant points 數量一致。
- **SC-024**: 在向量索引與 LLM 就緒時，RAG 回答包含可對應下方判決的 `[n]` 引用；移除 LLM 設定後，同一問題降級為 `retrieval_only` 且仍列出實際檢索到的判決。
- **SC-025**: 一次實際 RAG 請求的 Flow 至少包含 `http.request`、`api.endpoint`、`rag.answer_question`、`rag.search`、`rag.embed_query`、`rag.qdrant_search`、`rag.fetch_documents`、`rag.llm` 與 `rag.validate_citations`，且 `summary.models` 包含 `bge-m3` 與 `gemma3:4b`。
- **SC-026**: 前端完成 RAG render 後，同一個 request id 的 Flow 會出現 `client.render` segment，且 `client.total_ms` 大於 0、`client.render_ms` 大於等於 0；不會新增第二筆 performance record。
- **SC-027**: 效能報表頁的模型篩選可只顯示使用指定模型的 Flow；Flow JSON 可展開，390px 寬度沒有水平溢出，且沒有 console error。

## Assumptions

- 主控台與法規下載模組共用 `DATABASE_URL` 與 `LAW_DATA_DIR`；使用前至少完成一次法規下載。
- 判決向量索引需要 PostgreSQL、Qdrant 與 Ollama；法規／命令檢索只需 PostgreSQL 與法規 Parquet。未啟動 Qdrant 時判決向量檢索必須降級，但法規／命令問題仍可回答，不得提供模擬資料。
- Qdrant、Embedding、RAG 回答管線與 LLM 在未設定時以 `not_configured` 或 `degraded` 呈現；不提供模擬資料。
- RAG 以法規／命令內容與判決片段為依據；當判決檢索或 LLM 不可用但有法規來源時，仍以法規內容回答；兩者都不可用時只顯示可驗證的預覽或檢索結果，不生成法律意見。
- 效能 Flow 的 instrumentation 為 best-effort；寫入或 client beacon 失敗不得中斷原請求，且參數只保留摘要值，不作為完整稽核日誌。
- 沒有瀏覽器 timing header 或 beacon 的請求（例如 curl、CLI）不會有 `client.total_ms`／`render_ms`，但仍有伺服器端 Flow。
- 效能報表 API 本身不寫入效能紀錄，避免查詢報表時產生自我遞迴紀錄。
- 測試模式開關位於 `#/status` 的「系統測試」分類（或 `#/tests`），不再控制後端電源；電源由本機 `./up.sh`／`./down.sh` 或 `127.0.0.1:9201` 控制器管理。
- 測試模式會依序執行所有可用模型，可能耗時數分鐘；個別模型失敗只會標示該 step，不會中止其他模型。
- 測試模型的偵測依賴 Ollama `/api/tags`；reranker 會排除，非 chat 模型若被誤判為 LLM，失敗會記錄在該 step。
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
