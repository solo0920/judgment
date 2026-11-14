# Feature Specification: 低延遲處理事件串流

**Feature Branch**: 未建立（以規格目錄 `008-realtime-event-stream` 識別）

**Created**: 2026-11-14

**Status**: Phase 4 local implementation（reliability、shared journal bus、bootstrap、metrics、all progress topics）；Phase 5 remaining（cross-host bus、runtime DB backup）

**Input**: 使用者要求以金融交易服務的低延遲思維處理資料流程：importer 子程序執行到某個月份／階段時立即發布事件，web server 訂閱後第一時間 fan-out 到 SSE；不要讓 web server 為了即時進度反覆查詢 state。

## 目標

建立 publisher／subscriber 的即時進度通道：

- **Importer subprocess = publisher**：在 archive／月份／階段變更與進度更新時立即發布事件。
- **Web server = subscriber + broker**：接收 importer 事件，寫入 journal，立即推送 SSE 給瀏覽器。
- **Browser = consumer**：只接收 SSE event 並更新 DOM，不查詢進度 API。
- **State = checkpoint**：processing state 仍保留作為 resume、stop、稽核與 web server 重啟後的狀態來源，但不再是即時進度的唯一傳輸路徑。

## User Scenarios & Testing

### User Story 1 - 月份一開始就立即看到處理中 (Priority: P1)

使用者執行判決匯入，當 importer 進入某個月份的金融法規篩選或 PostgreSQL metadata 時，事件必須立即發布；瀏覽器在 1 秒內把該月份標成處理中並更新階段訊息，不得等到下一個 state 輪詢週期。

**Independent Test**: 以模擬 importer 依序處理四個月份，每 0.8 秒切換一次；SSE 客戶端必須依序收到四個 `archive_started` event，前端目前月份必須依序顯示四個月份，不得跳月。

**Acceptance Scenarios**:

1. **Given** importer 開始處理 `2024-04` 的 filter，**When** archive 進入 running，**Then** 立即發布 `archive_started` event，包含月份、archive、stage、message、開始時間。
2. **Given** filter 已處理 1,000/5,000 筆，**When** importer 更新進度，**Then** 發布 `stage_progress` event，包含 current／total／percent／message。
3. **Given** archive filter 與 postgres 完成，**When** importer 完成該月份，**Then** 發布 `archive_completed` event，包含完成的 stages 與 month overall。
4. **Given** SSE 客戶端停留在 processing 頁，**When** 收到 event，**Then** 必須直接更新目前月份、階段訊息與時間表，不得發出 `/api/processing` 查詢。

### User Story 2 - Web server 不查 state 也能即時轉發 (Priority: P1)

Web server 接收到 importer socket 事件後，必須直接 fan-out 到 SSE；即時路徑不得讀取完整 processing state 或建立完整 snapshot。

**Independent Test**: 送出單一 progress event，確認 SSE 在 50 ms 內收到；processing state 檔內容不變時，web server 不得重新讀取或重建 snapshot。

**Acceptance Scenarios**:

1. **Given** importer 透過 Unix socket 發送 event，**When** web server 收到完整 JSON line，**Then** 立即 append journal 並推送 `event: progress` SSE。
2. **Given** 有多個 processing SSE 訂閱者，**When** 收到一個 event，**Then** 所有訂閱者都收到同一 event，且順序一致。
3. **Given** web server 沒有收到 event，**When** state 檔內容未變，**Then** 不得為了即時進度建立 snapshot。

### User Story 3 - 斷線、重啟與 durability (Priority: P2)

事件通道必須有 journal 與序號，讓瀏覽器重連、web server 重啟或 importer 繼續執行時能補齊狀態；state checkpoint 仍負責 resume 與稽核。

**Independent Test**: 關閉 web server 後 importer 繼續處理；重啟 web server 與瀏覽器，確認 journal 保留事件、state 可重建目前進度。

**Acceptance Scenarios**:

1. **Given** web server 暫時不可用，**When** importer 發布事件，**Then** importer 不得因推送失敗而停止或阻塞流程。
2. **Given** event journal 已保存事件，**When** web server 重啟，**Then** 可由 journal／state checkpoint 恢復目前進度。
3. **Given** SSE 客戶端重連，**When** 提供最後收到的 sequence，**Then** 系統應補送缺少的事件，或由初始 snapshot 對齊目前狀態。

## Functional Requirements

- **FR-001**: Importer MUST 是 progress event publisher；event 必須在 archive／月份／階段狀態變更的同一處理點立即產生，不得等到整個 archive 完成才批次發布。
- **FR-002**: Event MUST 使用固定 envelope，至少包含 `version`、`seq`、`run_id`、`type`、`timestamp`、`month`、`archive`、`stage`、`status`、`message`、`current`、`total`、`percent`、`month_stages`、`month_overall`。
- **FR-003**: Phase 1 event type MUST 至少包含 `run_started`、`archive_started`、`stage_progress`、`archive_completed`、`run_finished`；`stage_started`／`stage_failed` MAY 在後續擴充使用，但 archive 開始／完成與 run 失敗已足以讓 UI 對齊。
- **FR-004**: Phase 1 transport MUST 使用本機 Unix domain socket；importer MUST 以非阻塞 queue 發送，web server MUST 以 async Unix server 接收。Socket 路徑 MUST 可由 `JUDGMENT_EVENT_SOCKET` 覆寫；預設 MUST 使用依 processing state 路徑雜湊產生的短檔名（例如 `judgment-pe-<hash>.sock`），避免 macOS AF_UNIX 路徑長度限制。
- **FR-005**: Web server MUST 在收到 event 後立即 append 到 append-only journal，並以 `event: progress` SSE 推送；journal 路徑 MUST 可由 `JUDGMENT_EVENT_JOURNAL` 覆寫。
- **FR-006**: Web server MUST NOT 為即時 event 讀取完整 state 或重建完整 snapshot；完整 snapshot 只用於初次連線或重連。輕量 state live payload MAY 用於 0.5 秒 reconciliation，但 MUST NOT 是唯一即時進度來源；`progress` event MUST 先到先推送。
- **FR-007**: Browser MUST 只套用 SSE event 更新 DOM；MUST NOT 因 progress event 查詢 `/api/processing`。
- **FR-008**: Browser MUST 以 `run_id` 與 `seq` 丟棄重複或過期 event，避免畫面倒退。
- **FR-009**: Importer 發送事件失敗時 MUST NOT 中斷或阻塞匯入；state checkpoint 仍必須更新，讓 web server 可從 state 對齊。
- **FR-010**: Processing state 仍 MUST 保留作為 resume、stop、稽核與 web server 重啟恢復來源；Phase 3 MUST 以 SQLite WAL checkpoint 取代 JSON 檔案，不得移除 resume、stop 或稽核能力。
- **FR-017**: Processing state MUST 使用 SQLite WAL（預設 `.run/processing_state.db`），以 per-run rows 保存；寫入時 SHOULD 只更新序列化內容有變更的 run，不得每次重寫整個 state。舊 `.json` checkpoint MUST 自動遷移並重新命名為 `.migrated`。
- **FR-018**: State checkpoint 寫入 MUST 保持 `ProcessingStateStore` 既有 API；`read()` 回傳相同 payload 結構，讓 importer、web、workflow runner、resume 與 stop 不需改呼叫端。
- **FR-019**: Importer 在 Unix socket 無法連線時 MUST 有本地 spool／journal fallback；lifecycle event MUST NOT 因 web server 不在而遺失，progress event MAY 合併或丟棄但 MUST 計數。
- **FR-020**: Event journal MUST 對 `(run_id, seq)` 建唯一約束並支援 idempotent append；重送或 fallback 寫入不得產生重複事件。
- **FR-021**: `.run/processing_state.db`、event journal、WAL／SHM、spool 與 lock 檔 MUST 僅限目前使用者讀寫（0600）；不得包含密碼、Token、完整判決內容或環境變數秘密。
- **FR-022**: Event envelope MUST 有 schema 版本與欄位驗證；未知版本或缺少必要欄位 MUST 被拒絕並記錄，不得讓 web server crash。
- **FR-023**: 初次 processing snapshot MUST 拆分為快速 bootstrap 與延遲載入的重查詢資料；bootstrap SHOULD 在 1 秒內開始渲染，完整 DB／Qdrant 統計 MAY 隨後補上。
- **FR-024**: State checkpoint 與 event journal MUST 有 compaction／pruning 策略；已完成且超過保留期的 run MUST 移到歷史或刪除，避免每次 read 重建全部 13 MB 以上 state。
- **FR-025**: 前端 progress event MUST 以動畫幀或短批次合併，採局部 DOM patch；高頻 event 不得造成整頁重繪、long task 或 hover／scroll 抖動。
- **FR-026**: 多 web server instance MUST 共用同一個 event bus 或 journal tail；同一個 event MUST 在 100 ms 內到達所有 instance 的 SSE 訂閱者，且每個 instance MUST 去重。
- **FR-027**: 判決下載、Qdrant 索引、測試 Flow、benchmark、系統狀態與其他進度頁 MUST 比照 processing，使用 SSE payload 與 topic-specific event id；MUST NOT 再以 refresh event 觸發 progress GET。
- **FR-028**: 系統 MUST 暴露 event latency、queue drop、journal append error、replay count、SSE subscriber 數與 state read/write 耗時等 observability 指標。
- **FR-029**: 備份／還原流程 MUST 包含 SQLite state checkpoint 與 event journal，或能從 PostgreSQL／manifest 完整重建；不得只備份 JSON 或只備份 WAL。
- **FR-030**: SQLite busy／corrupt／磁碟滿時，web server MUST 降級為 snapshot 顯示並記錄 error；importer MUST 繼續執行，不得因 checkpoint 或 journal 失敗中止匯入。
- **FR-011**: Journal MUST 保存事件順序與時間；Phase 2 MUST 使用 SQLite WAL 保存具單調遞增 `event_id` 的事件，並支援 SSE `Last-Event-ID` replay。重連時若缺少事件仍在保留範圍內，MUST 只補送缺少事件；若 `Last-Event-ID` 早於保留範圍或 journal 已重置，MUST 改送完整 snapshot 並附上最新 `event_id` 對齊。
- **FR-016**: Event journal MUST 支援保留上限（預設 200,000 筆，可用 `JUDGMENT_EVENT_RETENTION` 覆寫）與 Phase 1 JSONL 遷移；舊 `.jsonl` 在 SQLite journal 為空時 MUST 自動匯入並重新命名為 `.migrated`。
- **FR-012**: Event queue MUST 有界；queue 滿時 SHOULD 優先保留 lifecycle event（started／completed／failed），可丟棄舊的 `stage_progress`。
- **FR-013**: 即時 event 從 importer emit 到本機 SSE 訂閱者收到 SHOULD 在 50 ms 內；瀏覽器完成 DOM 更新 SHOULD 在 1 秒內。
- **FR-014**: 準備階段（版本快照、DuckDB 候選統計）MUST NOT 產生假的逐月 `archive_started`；只有實際進入 filter／postgres 的 archive 才發布當月 processing event。
- **FR-015**: Event payload MUST 不包含密碼、Token 或完整判決內容；只包含進度與識別資訊。

## Non-Functional Requirements

- **NFR-001**: Unix socket 權限 MUST 為 0600，只允許本機目前使用者。
- **NFR-002**: Importer 發送事件不得顯著降低匯入吞吐量；queue 操作必須是非阻塞。
- **NFR-003**: Web server 事件處理不得阻塞 FastAPI event loop；journal I/O SHOULD 使用背景或短時間 flush。
- **NFR-004**: 事件失敗、socket 中斷或 journal 寫入錯誤 MUST 記錄 warning，不得讓 web server 崩潰。
- **NFR-005**: 同一 run 的事件順序 MUST 單調遞增；不同 run 的 seq 可各自獨立。
- **NFR-006**: SQLite journal MUST 使用 WAL 與 `synchronous=NORMAL`；每次 append MUST commit，確保 web server 重啟後可 replay。Journal 寫入失敗 MUST 不中斷即時 SSE fan-out。
- **NFR-007**: Importer emit 到本機 SSE 的 p95 SHOULD 小於 50 ms；多 instance 跨 process 匯流排 p95 SHOULD 小於 100 ms。
- **NFR-008**: 前端處理單一 progress event SHOULD 小於 16 ms，且不得產生超過 200 ms 的 long task。
- **NFR-009**: Event journal 與 state checkpoint 的檔案權限、遷移與 retention MUST 可在不中斷 importer 的情況下完成。
- **NFR-010**: 所有低延遲機制 MUST 有可觀測的失敗計數與 log；不得以靜默丟棄作為正常路徑。

## Phase 1 Scope

Phase 1 MUST 完成：

1. Shared event publisher 與 envelope。
2. Importer 在 run／archive／filter／postgres 關鍵點發布事件。
3. Web server Unix socket listener、journal 與 SSE `progress` event。
4. Processing 頁接收 `progress` event 並即時更新訊息、目前月份與時間表。
5. 保留 processing state 作 checkpoint；不讀 state 於即時 event 路徑。
6. 測試：socket→SSE、event 順序、月份不跳躍、前端無 progress GET。

Phase 2 MUST 完成：

1. SQLite WAL event journal（`.run/processing_events.db`）。
2. 每個 event 配置持久化、單調遞增的 `event_id`，SSE 輸出 `id:`。
3. `Last-Event-ID` replay；超出保留範圍時以完整 snapshot 對齊。
4. Journal retention 與 Phase 1 JSONL 自動遷移。
5. 測試：event store replay、EventBroker replay、socket→journal→SSE。

Phase 3 MUST 完成：

1. 以 SQLite WAL checkpoint 取代 JSON processing state；預設 `.run/processing_state.db`。
2. State 以 per-run rows 保存，`ProcessingStateStore` API 不變。
3. 只寫入有變更的 run；讀取時重建相同 payload。
4. 舊 `.json` checkpoint 自動遷移為 `.json.migrated`。
5. 測試：state migration、API 相容、run 更新與 prune。

Phase 4 本機實作 MUST 完成：

1. **可靠性**：importer spool fallback、`(run_id, seq)` 唯一約束、event schema validation、SQLite busy／corrupt 降級。
2. **效能**：processing snapshot cache bootstrap、state retention、前端 rAF 批次與既有 morph DOM。
3. **多 instance（同機）**：所有 web instance 共用 SQLite journal tailer；event 去重與 replay。
4. **全站遷移**：updates、status、judgment-download、system-usage、ollama、court-check、law-version-check、test-runs、benchmark 使用 SSE payload。
5. **營運**：`/api/processing/events/status` latency／drop／error metrics、權限 0600。

Phase 5（跨主機與備份）：

- PostgreSQL LISTEN/NOTIFY、Redis Streams 或 NATS 跨主機 shared bus。
- Event journal／state checkpoint 的備份與還原流程。
- 事件壓縮、TLS、認證與多主機去重。

## Success Criteria

- **SC-001**: importer 進入新月份 filter 後，processing SSE 在 50 ms 內收到 `archive_started`，瀏覽器在 1 秒內顯示該月份處理中。
- **SC-002**: 連續四個月份每 0.8 秒切換時，SSE 與瀏覽器都完整顯示四個月份，不得跳月。
- **SC-003**: processing 頁收到 progress event 時，network log 沒有 `/api/processing` 查詢。
- **SC-004**: 關閉 web server 不影響 importer 執行；重啟後可由 state checkpoint 對齊目前進度。
- **SC-005**: event journal 保留每次 archive 開始／完成與 run 結束事件，順序可追溯。
- **SC-006**: 瀏覽器以 `Last-Event-ID` 重連時，若缺少事件仍在 SQLite journal 保留範圍內，MUST 只收到缺少的 `progress` event；若超出保留範圍，MUST 收到完整 snapshot 並更新為最新 event id，不得重播整份歷史。
- **SC-007**: 既有 `.run/processing_state.json` 在新版啟動後 MUST 自動遷移為 SQLite `.db`，原檔改名 `.json.migrated`；`ProcessingStateStore.read()` 回傳的 run／stage／archive 結構與舊版一致，resume、stop 與歷史 run 不得遺失。
- **SC-008**: Web server 不在線時，importer MUST 將 lifecycle event 寫入 spool／journal；web server 恢復後 MUST 補齊，不得因 socket 中斷中止匯入。
- **SC-009**: 同一 `(run_id, seq)` 重複送達時，event journal MUST 只保留一筆，SSE replay 不得重複推送。
- **SC-010**: `.run/processing_state.db`、event journal、WAL／SHM 與 spool MUST 為 0600；其他使用者不得讀取。
- **SC-011**: 初次 processing 頁 bootstrap SHOULD 在 1 秒內開始渲染；完整 DB／Qdrant 統計可延遲補上，不得讓空白頁等待 5 秒以上。
- **SC-012**: 兩個 web server instance 共用同一 event bus 時，同一 event MUST 在 100 ms 內到達兩邊的 SSE 訂閱者，且各 instance 不得重複推送。
- **SC-013**: 判決下載、索引、測試 Flow、benchmark 與 status 頁收到進度變更時，network log MUST 沒有 progress GET；MUST 只收到含 payload 的 SSE event 或使用 topic-specific replay。
