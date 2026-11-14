# Feature Specification: 判決下載與月分下載狀態

**Feature Branch**: 未建立（以規格目錄 `005-judgment-download` 識別）

**Created**: 2026-11-10

**Updated**: 2026-11-11

**Status**: Implemented

> 新舊 archive 的 delta Parquet、PostgreSQL 歷史版本、Qdrant history collection 與 IndexedDB audit 見 [`specs/006-hybrid-backup-versioning/spec.md`](../006-hybrid-backup-versioning/spec.md)。線上更新檢查與 header/sidebar 通知見 [`specs/007-update-notifications/spec.md`](../007-update-notifications/spec.md)。

**Input**: 使用者提供之需求（原文摘要）：

> 在 `#/processing` 左側 sidebar 新增「判決下載」，位置在「命令下載」與「判決匯入」之間。71644 是第一個判決檔（1996 年 01 月），最新為 2026 年 08 月的 72011，中間約 30 年、三百多個月。要檢查 71644 到 72011 間每個月的檔案連結：`/data` 沒有該月份檔案就下載；已有檔案就檢查網站是否有新版，有新版就下載並取代舊檔。以 HEAD 檢查更新，不要用完整下載比對。API 每日 00:00–06:00（UTC+8）提供。判決下載頁面要產生 1996 年 1 月到目前的月份表：第一列最新年份、最後一列 1996 年，每列 1–12 月；綠色表示最新版已下載到 `/data`，灰色表示舊版尚未更新，紅色表示缺少該月份判決資料。需納入 spec-kit 規格。

> **2026-11-11 更新**：實測帶 Bearer Token 的 `FilesetLists/{id}/file`、resources 與 HEAD metadata 在非 00:00–06:00 時段仍可使用；因此預設允許非時段下載（`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`），批次與手動 proxy 都一次只處理一個檔案；設為 `false` 才恢復嚴格時段限制。

**需求解讀**: 建立一個可重複執行、可跨多個時段續傳的判決下載流程。以司法院裁判書分類（`051`）的 resources 為權威來源，將 `resourceDescription` 的 `YYYYMM` 視為月份；同月份若有多個更新版本，以下載最新 fileset。下載目錄為 `JUDGMENT_DATA_DIR/raw_rar`。處理頁顯示 1996-01 到最新月份的月曆表，依本機檔案與最新 fileset 判斷綠／灰／紅。預設允許非 API 時段下載，批次與手動 proxy 都一次只處理一個檔案。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從處理頁啟動判決下載 (Priority: P1)

使用者在 `#/processing` 左側 sidebar 看到「判決下載」，位置在「命令下載」與「判決匯入」之間。按下執行後，系統以司法院開放資料帳號密碼取得 Token，檢查裁判書分類的壓縮檔，並將檔案下載到 `JUDGMENT_DATA_DIR/raw_rar`（本機 `.env.example` 為 `./data/judgments/raw_rar`）。

**Independent Test**: 開啟處理頁，確認 sidebar 順序；於 API 開放時段執行，確認 run 狀態、log 與 raw_rar 檔案更新；於非開放時段執行，確認立即顯示時段限制訊息。

**Acceptance Scenarios**:

1. **Given** 使用者開啟處理頁，**When** 載入 workflow 清單，**Then** 「判決下載」出現在「命令下載」與「判決匯入」之間。
2. **Given** 帳密有效且 `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`（預設），**When** 執行判決下載，**Then** 不論目前時間，系統取得 Token 並開始檢查 1996-01 到最新月份的壓縮檔。
3. **Given** 目前時間不在 00:00–06:00 且 `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false`，**When** 執行判決下載，**Then** 系統不發出下載請求，log 顯示目前時間與開放時段。
4. **Given** 帳號或密碼錯誤，**When** 執行判決下載，**Then** run 失敗並顯示驗證失敗，不顯示密碼或 Token。

### User Story 2 - 完整月份同步：缺檔下載、舊版更新 (Priority: P1)

系統以 `resourceDescription` 的 `YYYYMM` 建立 1996-01 到最新月份的清單，每個月份取最新 fileset。若本機沒有該月份檔案，下載；若本機有檔案但不是最新 fileset，下載新版本並將同月份舊檔移至 `raw_rar/history/`（預設）；若已是最新，略過。

**Independent Test**: 在只有部分月份檔案的環境執行，確認其他缺少月份被下載；將某月份本機檔案換成舊版並更新 manifest，確認執行後下載最新版並移除舊版。以 `--check-only` 確認只檢查不下載。

**Acceptance Scenarios**:

1. **Given** 本機缺少 1996-01 到 2026-08 之間的某月份檔案，**When** 執行，**Then** 該月份最新 fileset 被下載到 raw_rar。
2. **Given** 本機已有某月份檔案且為最新 fileset，**When** 執行，**Then** metadata 未變更時略過，不重新下載。
3. **Given** 本機已有同月份舊版檔案，遠端有較新 fileset，**When** 執行，**Then** 下載新版本、原子取代，並將同月份舊檔移至 `raw_rar/history/` 或依設定刪除。
4. **Given** 同月份遠端檔案大小或 validator 改變，**When** 執行，**Then** 重新下載並取代。
5. **Given** 嚴格時段模式（`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false`）且執行到 06:00，**When** 尚未完成全部月份，**Then** 停止並保留已完成檔案，下一次執行從缺少月份續傳。

### User Story 3 - 以 metadata 檢查，不重複下載 (Priority: P1)

系統以 HEAD 取得 `Content-Length`、`Last-Modified`、`ETag`。官方端點對 HEAD 回傳 405，因此改用 GET stream 只讀 headers 後立即關閉，不讀取 body。若本機檔案大小與 metadata 一致且 manifest validator 未變，略過下載。

**Independent Test**: 在已有部分檔案的環境執行，確認沒有重新下載未變更檔案；修改 manifest 或使用測試伺服器回傳不同 `Last-Modified`，確認該檔重新下載。

**Acceptance Scenarios**:

1. **Given** 本機檔案存在且遠端 metadata 未變，**When** 執行，**Then** 標記為 skipped，不重新下載。
2. **Given** 官方端點對 HEAD 回傳 405，**When** 檢查 metadata，**Then** 使用 GET stream 讀 headers 後立即關閉，不下載完整 body。
3. **Given** 下載中斷或長度不符，**When** 驗證失敗，**Then** 不覆蓋舊檔；符合續傳條件時保留 `.part` 與 sidecar，伺服器支援 Range 時重試，validator 不符或回 200 時才丟棄。

### User Story 4 - 月份下載狀態表 (Priority: P1)

判決下載頁面顯示 1996-01 到最新月份的月曆表。第一列是最新年度，最後一列是 1996；每列有 1–12 月。綠色表示最新版已下載到 `/data`，灰色表示本機仍是舊版，紅色表示缺少該月份判決資料。表格旁顯示三色統計與重新整理按鈕。執行流程時，目前正在檢查或下載的月份必須即時標示，執行按鈕區塊下方顯示該月份、檔名、進度條、百分比與已下載／總大小。

**Independent Test**: 以目前 manifest 開啟判決下載頁，確認年度列由最新年份到 1996、每列 12 個月；2026 年 1–8 月可顯示狀態，9–12 月為空白；三色統計與 `download_manifest.json`／`raw_rar` 掃描結果一致。下載新月份後重新整理，確認該月份由紅轉綠。執行流程時確認月份表格會標示目前月份，進度區顯示檔名與大小變化，且 SSE 進度推送期間表格不會被重繪或跳動。

**Acceptance Scenarios**:

1. **Given** manifest 有 368 個月狀態，**When** 開啟判決下載頁，**Then** 顯示 1996–2026 共 31 列，每列 12 個月份欄位。
2. **Given** 某月份最新 fileset 已存在本機，**When** 顯示表格，**Then** 該月份為綠色。
3. **Given** 某月份本機檔案是舊版，**When** 顯示表格，**Then** 該月份為灰色。
4. **Given** 某月份沒有本機檔案或官方沒有資料，**When** 顯示表格，**Then** 該月份為紅色。
5. **Given** 2026 年 9–12 月尚未有資料，**When** 顯示表格，**Then** 顯示為空白，不標示紅/綠。
6. **Given** 使用者手動把某月份檔案放入 raw_rar，**When** 按表格的重新整理，**Then** 系統重新掃描 raw_rar，最新檔變綠色、舊版變灰色，不需重跑下載流程。
7. **Given** 下載流程更新 manifest，**When** 使用者按重新整理，**Then** 表格數字顏色與統計更新。
8. **Given** 使用者將滑鼠移到某個月份，**When** 該月份有 fileset，**Then** 顯示該月份檔案下載連結；下載連結使用 manifest 記錄的 fileset ID，不需要自行輸入；預設非 API 時段也可使用，但 proxy 一次只允許一個下載。
9. **Given** 判決下載正在檢查或下載某月份，**When** 處理頁收到後端 SSE 進度推送，**Then** 該月份儲存格加上處理中標示，執行按鈕區塊顯示月份、檔名、進度條、百分比與已下載／總大小。
10. **Given** 流程完成、中止或進度資料已失效，**When** 處理頁更新，**Then** 清除處理中標示與進度區，不顯示過期的下載進度。
11. **Given** 使用者在流程執行中檢視月份表，**When** 後端透過 SSE 推送狀態，**Then** 只更新月份狀態與進度節點，不重繪整個工作流程面板，表格捲動位置保持不變。

### User Story 5 - 可追溯的 manifest 與跨日續傳 (Priority: P1)

系統在 `raw_rar/download_manifest.json` 記錄 fileset ID、檔名、大小、Last-Modified、ETag、SHA-256、來源 URL、下載時間、月份狀態、baseline 與 `backfill` 續傳進度。每次執行先處理待補齊月份（缺少或舊版），由舊到新續傳；待補齊清單清空後，才由最新月份往回驗證綠色月份。中斷的下載保留 `.part` 與 validator sidecar，下次以 HTTP Range 續傳。

**Independent Test**: 檢查 manifest 內容與實際檔案一致；在流程中途模擬 06:00 停止後重跑，確認只下載剩下月份、不重新下載已完成月份，且待補齊／驗證游標正確更新。讓單一 fileset 下載失敗，確認其他月份仍完成、失敗月份留在待補齊清單。中斷 `.part` 後重跑，確認以 Range 續傳；validator 改變時確認從零重新下載。

**Acceptance Scenarios**:

1. **Given** 下載或更新成功，**When** 檢查 manifest，**Then** 包含 fileset、檔名、大小、validators、SHA-256 與時間。
2. **Given** 流程在 06:00 停止且仍有待補齊月份，**When** 下次執行，**Then** manifest 的 `backfill.pending_months`、`resume_from_month`、`resume_from_fileset_id` 指向剩餘月份，流程只處理這些月份，不先重驗綠色月份。
3. **Given** 待補齊月份已全部完成，**When** 流程仍有時間，**Then** 由最新月份往回驗證綠色月份，並將 `verification.next_fileset_id` 持久化。
4. **Given** 前一次驗證只完成一部分，**When** 下次執行，**Then** 從保存的驗證游標接續，不從最新月份重來。
5. **Given** 當日驗證已完成，**When** 同日再次執行，**Then** 跳過重複驗證，不發出多餘 metadata 請求。
6. **Given** 某個 fileset metadata 或下載失敗，**When** 流程執行，**Then** 其他月份繼續處理；失敗月份留在 `backfill.pending_months` 與 `backfill.failures`，run 標記為 partial。
7. **Given** 中斷的 `.part` 與 sidecar validator 仍相符，且伺服器支援 Range，**When** 下次下載，**Then** 以 `Range`／`If-Range` 從已寫入位元組續傳，成功後才原子取代正式檔。
8. **Given** 遠端 validator 已改變或伺服器忽略 Range 回傳 200（目前官方端點即為此行為），**When** 下載，**Then** 丟棄舊 `.part` 並從零重新下載，不附加到舊內容。
9. **Given** 嚴格時段模式且接近 06:00、依近期吞吐量估算目前檔案無法在時段內完成，**When** 準備下載下一個檔案，**Then** 不開始該檔案，保留待補齊月份並以 partial 結束。
10. **Given** 使用者只想快速檢查既有檔案，**When** 使用 `--incremental`，**Then** 先處理待補齊月份，再檢查既有檔案、baseline 與最新 fileset 之後的新檔。

### Edge Cases

- 非 API 時段：2026-11-11 實測 resources、metadata 與檔案 GET 仍可用；預設允許下載。若 `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false`，必須在發出下載請求前阻擋，流程跨時段時停止並保留進度。
- HEAD 回傳 405：使用 GET stream 只讀 headers，不能下載 body。
- Token 過期：遇到 401 時重新取得 Token，且不記錄敏感資訊。
- 檔案下載中斷：保留原檔與 `.part`／validator sidecar；伺服器支援 Range 時續傳，validator 改變或回 200 時從零重新下載。目前官方端點忽略 Range，會回 200。
- Content-Length 與實際下載長度不符：視為失敗，不取代舊檔；已寫入且可驗證的 `.part` 保留供下次續傳。
- 單一 fileset 失敗：不得中止整個流程；失敗月份維持 pending，其他月份照常處理。
- 嚴格時段模式且接近 06:00：不得只因還有一點時間就開始一個預估無法完成的檔案；保留 pending 給下次。
- 手動 proxy 同時開啟多個下載：只允許一個作用中的串流；第二個請求回 409，避免對官方伺服器同時下載多個檔案。
- 驗證游標：部分完成後必須保存下一個待驗證 fileset；同日已完成驗證不得重複執行。
- `Delete-Infor.csv` 或其他非 `YYYYMM`／非 rar、7z、zip 的 fileset：不得誤判為新月份或判決壓縮檔。
- 同月份有多個更新版本：以下載最新 fileset 為準，舊版本移除。
- 官方 resources 清單尚未更新但 fileset 已存在：探測下一個 fileset 作為安全網。
- 某月份官方沒有 RAR 資料：表格顯示紅色。
- 2026 年 9 月以後尚無資料：表格顯示空白，不誤標缺失。
- 流程被中止或程序遭強制結束：不得顯示殘留的處理中進度；狀態 API 依程序存活與更新時間判定失效並清除。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `#/processing` sidebar 必須新增「判決下載」，排序在「命令下載」之後、「判決匯入」之前。
- **FR-002**: 必須從 `.env` 讀取 `OPENDATA_JUDICIAL_GOV_TW_ACCOUNT` 與 `OPENDATA_JUDICIAL_GOV_TW_PASSWORD`，以 `POST /api/MemberTokens` 取得 Bearer Token。
- **FR-003**: 必須使用裁判書主題分類（預設 `051`）的 resources 清單，將 `resourceDescription` 的 `YYYYMM` 視為月份，支援 RAR、7Z、ZIP，排除 Delete-Infor。
- **FR-004**: 下載目錄固定為 `JUDGMENT_DATA_DIR/raw_rar`。`JUDGMENT_DATA_DIR` 程式預設 `/data/judgments`，`.env.example` 本機使用 `./data/judgments`。
- **FR-005**: 必須建立 1996-01 到最新月份的清單；每個月份取最新 fileset。預設下載缺少月份，已存在月份檢查是否有新版。
- **FR-006**: 更新檢查必須使用 HEAD metadata；若 HEAD 不支援，使用 GET stream 只讀 headers，不得下載完整檔案。
- **FR-007**: 必須比較 `Content-Length`、`Last-Modified`、`ETag`、本機大小與 manifest；未變更檔案不重新下載。
- **FR-008**: 有更新或缺少檔案時，下載到暫存檔，驗證後原子取代，並更新 manifest。
- **FR-009**: 同月份出現新版本時，必須將同月份舊版本檔案移至 `raw_rar/history/` 並在 manifest 的 `history_files` 保留 metadata；只有 `JUDGMENT_RAW_RAR_KEEP_VERSIONS=false` 時才可直接刪除。
- **FR-010**: 預設允許在 Asia/Taipei 00:00–06:00 以外下載（`JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=true`）；批次仍一次只下載一個檔案。設為 `false` 時，僅允許在 00:00–06:00 執行，且接近 06:00 時依近期下載吞吐量與 5 分鐘安全緩衝估算，若目前檔案預估無法完成則不開始，保留進度並以 partial 結束。
- **FR-011**: 必須探測最新 fileset 的下一個 ID；若為判決壓縮檔則納入，若為非壓縮檔或不存在則停止。
- **FR-012**: manifest 必須包含 `files`（以 fileset ID 為鍵，記錄檔名、大小、validators、SHA-256、來源與下載時間）、`months` 陣列（month、latest_fileset_id、local_fileset_id、status、filename）與 `backfill` 區塊，覆蓋 1996-01 到最新月份。
- **FR-013**: 必須提供唯讀狀態 API，讓處理頁讀取 manifest 與即時掃描 `raw_rar` 目錄，手動放入的檔案也要反映在月份表；不需在下載時段外呼叫官方 API。
- **FR-014**: 判決下載頁必須顯示月份表：第一列最新年度、最後一列 1996 年，每列 1–12 月；綠色最新版、灰色舊版、紅色缺失、超出最新月份為空白。滑鼠移到有 fileset 的月份時，必須顯示該月份的下載連結。
- **FR-015**: 表格必須顯示綠／灰／紅統計與重新整理按鈕。
- **FR-019**: 月份下載連結必須使用 `months[].latest_fileset_id`，經後端帶 Token 的 proxy 下載，不得把密碼或 Token 暴露給前端。
- **FR-020**: 月份表 hover 連結預設在非 API 時段也可用；只有在 `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false` 時才限制 00:00–06:00，非時段顯示明確錯誤。手動 proxy 一次只允許一個作用中的下載，第二個請求回 409。
- **FR-021**: 下載流程必須將目前階段、月份、檔名、fileset、已下載位元組、總位元組與百分比寫入可讀取的進度狀態；狀態 API 必須回傳該進度，且不得包含帳密或 Token。
- **FR-022**: 處理頁收到後端 SSE 進度推送時必須以區域更新方式維護月份表與進度區，不得因進度或月份狀態變更而重繪整個工作流程面板或重設表格捲動位置。前端 MUST NOT 以 timer 或定期查詢取得下載進度。
- **FR-023**: 進度狀態必須在流程正常結束或中止後清除；程序已不存在或進度逾時時，狀態 API 不得回傳過期進度。
- **FR-024**: 下載佇列必須優先處理 pending／gray 月份（依月份由舊到新）；`backfill` 必須記錄 `pending_months`、`pending_count`、`resume_from_month`、`resume_from_fileset_id`、`complete` 與上次停止原因；每次完成或失敗一個月份後立即持久化。
- **FR-025**: 待補齊月份清空後才可驗證綠色月份，驗證順序由最新 fileset 往回；`backfill.verification` 必須記錄 `status`、`next_fileset_id`、`next_month`、`cycle_started_at`、`verified_count`、`completed_at` 與 `last_error`。部分完成保留游標；同日已完成則跳過。
- **FR-026**: 單一 fileset 的 metadata 或下載錯誤必須隔離，最多重試 `2` 次；失敗月份留在 pending 並記錄於 `backfill.failures`（fileset、檔名、嘗試次數、錯誤、時間），其他月份繼續處理，run 標記 partial。
- **FR-027**: 下載中斷時必須保留 `.part` 與 `<檔名>.part.json` validator sidecar；下次下載若 fileset、`Content-Length`、ETag／Last-Modified 相符，使用 `Range` 與 `If-Range` 續傳。伺服器回 206 時附加並驗證長度；回 200 或 validator 不符時丟棄 `.part` 從零下載；成功後才原子取代正式檔並清除 sidecar。2026-11-11 實測官方端點忽略 Range 並回 200，因此目前實際行為是重新下載。
- **FR-028**: 狀態 API 必須回傳 `backfill` 摘要（待補齊數量、續傳月份／fileset、驗證狀態、上次停止原因、失敗數），並以即時掃描 `raw_rar` 的結果修正 pending；處理頁必須顯示這些資訊，且收到後端 SSE 推送時只局部更新，不重繪月份表。
- **FR-029**: CLI 結束碼必須區分完成（`0`）、可續傳的部分完成（`3`，無檔案錯誤）、失敗（`1`）與嚴格時段模式下不在 API 時段（`2`）；`workflow_runner` 必須把 `3` 記為 `partial`，不得記為 `failed`。
- **FR-030**: `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS` 預設 `true`；狀態 API 必須回傳 `off_hours_enabled`，處理頁據此顯示下載時段提示。`--require-window` 必須能覆寫設定，強制只在 00:00–06:00 下載。
- **FR-016**: log 不得輸出密碼或完整 Token。
- **FR-017**: 判決匯入流程必須能掃描 `.rar`、`.7z`、`.zip`。
- **FR-018**: 流程必須可重複執行；第二次執行未變更檔案不應重新下載。

### Key Entities

- **Fileset**：司法院開放資料的檔案來源，包含 `fileSetId`、`resourceFormat`、`resourceDescription`（`YYYYMM...`）。
- **Month status**：`download_manifest.json` 的 `months`，每個月份記錄最新 fileset、本機 fileset 與 green/gray/red 狀態。
- **Download manifest**：`raw_rar/download_manifest.json`，記錄 fileset、本機檔案、validators、SHA-256、下載時間、月份表與 `backfill`（待補齊月份、續傳月份／fileset、驗證游標、失敗紀錄、上次停止原因）。
- **Baseline**：71644（199601）與 72011（202608，目前最新判決壓縮檔）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 處理頁 sidebar 的「判決下載」位置正確，且在 workflow 清單中可執行。
- **SC-002**: `JUDGMENT_DOWNLOAD_ALLOW_OFF_HOURS=false` 時，在非 00:00–06:00 時段執行會有 0 次檔案下載請求，log 顯示明確時段訊息；預設模式則可正常下載。
- **SC-003**: 對本機已存在且 metadata 未變更的壓縮檔執行時，下載數為 0，所有已檢查檔案均計為 skipped；數量以執行時掃描到的月份為準。
- **SC-004**: 缺少月份會被下載；下載後該月份表格由紅轉綠。
- **SC-005**: 同月份遠端更新時，下載新檔、封存舊檔到 `raw_rar/history/`，manifest 更新。
- **SC-006**: 非 `YYYYMM` 命名或非 rar/7z/zip 的 fileset（例如 `Delete-Infor.csv`）不會出現在 raw_rar 的判決壓縮檔清單，也不會被當成新月份。
- **SC-007**: 月份表顯示 resources 動態產生的年度列；第一列最新年度、最後一列 1996；三色統計與 manifest／raw_rar 掃描結果一致。
- **SC-008**: 第二次執行與第一次執行結果一致，沒有重複下載。
- **SC-009**: Token、密碼不出現在 log 或 manifest。
- **SC-010**: 執行判決下載後，處理頁在 2 秒內標示目前月份並顯示檔名、百分比與已下載／總大小；狀態更新期間月份表不閃爍、不重設捲動位置。
- **SC-011**: 流程結束或中止後，處理中標示與進度區不再顯示。
- **SC-012**: 嚴格時段模式下第一次執行在 06:00 停止後，第二次執行只下載 `backfill.pending_months` 中的剩餘月份；已完成月份的下載次數為 0。
- **SC-013**: 單一 fileset 下載失敗時，其他月份仍完成；失敗月份留在 pending，下一次執行會重試。
- **SC-014**: 中斷的 `.part` 在 validator 相符時以 Range 續傳；validator 改變時最終檔案為完整新內容，不發生附加錯位。
- **SC-015**: 驗證中斷後，下一次從保存的 `next_fileset_id` 接續；同日已完成驗證時，月份 metadata 請求數為 0。
- **SC-016**: 處理頁顯示待補齊月份數、續傳起點、驗證狀態與上次停止原因，且這些更新不重建月份表或重設捲動位置。
- **SC-017**: 因嚴格時段或軟性截止而停止、且沒有檔案錯誤的執行，處理頁顯示「部分完成」，不標記為「失敗」。
- **SC-018**: 預設模式下，非 API 時段的批次與手動 proxy 下載均可成功；手動 proxy 同時只能有一個作用中的下載，第二個請求回 409。

## Assumptions

- 使用司法院資料開放平臺 `opendata.judicial.gov.tw` 的 FilesetLists API。
- 官方 resources 清單是判決壓縮檔的權威來源；71644–72011 之間有些月份有多個更新版本，因此以 `YYYYMM` 分組並取最新 fileset，而不是直接把 fileset ID 當成月份。
- 1996-01 到 2026-08 是目前資料快照的 368 個月；實際範圍與數量由執行時 resources 決定。本機 `raw_rar` 目前有 294 個月份壓縮檔（約 39 GB），`download_manifest.json` 為 294 green／0 gray／74 red，下一個待補齊月份為 `2014-10`（fileset `71869`；2026-11-11 觀測值，會隨下載變動）。
- 第一次完整同步可能需要下載數百個月份；預設非 API 時段也可續傳，嚴格時段模式則會跨越多個 00:00–06:00 時段；`backfill` 佇列會保留跨日進度。
- 2026-11-11 實測：帶 Bearer Token 的檔案 GET、resources 與 HEAD metadata 在非 00:00–06:00 時段仍可使用；官方檔案端點忽略 `Range`，回傳 200 與完整內容。
- Delete-Infor CSV 的後續刪除套用不在本次範圍。

## Out of Scope

- 自動依 Delete-Infor CSV 刪除 PostgreSQL、Parquet 或 Qdrant 中的判決。
- 將下載流程加入頁首「資料更新」的自動步驟；目前為獨立 workflow。
- 非裁判書分類的下載。
- PDF 中另一套 `data.judicial.gov.tw/jdg/api` 的 JList／JDoc 流程。
