# Feature Specification: 判決下載與月分下載狀態

**Feature Branch**: 未建立（以規格目錄 `005-judgment-download` 識別）

**Created**: 2026-11-10

**Updated**: 2026-11-11

**Status**: Implemented (MVP)

**Input**: 使用者提供之需求（原文摘要）：

> 在 `#/processing` 左側 sidebar 新增「判決下載」，位置在「命令下載」與「判決匯入」之間。71644 是第一個判決檔（1996 年 01 月），最新為 2026 年 08 月的 72011，中間約 30 年、三百多個月。要檢查 71644 到 72011 間每個月的檔案連結：`/data` 沒有該月份檔案就下載；已有檔案就檢查網站是否有新版，有新版就下載並取代舊檔。以 HEAD 檢查更新，不要用完整下載比對。API 每日 00:00–06:00（UTC+8）提供。判決下載頁面要產生 1996 年 1 月到目前的月份表：第一列最新年份、最後一列 1996 年，每列 1–12 月；綠色表示最新版已下載到 `/data`，灰色表示舊版尚未更新，紅色表示缺少該月份判決資料。需納入 spec-kit 規格。

**需求解讀**: 建立一個可重複執行、可跨多個 API 時段續傳的判決下載流程。以司法院裁判書分類（`051`）的 resources 為權威來源，將 `resourceDescription` 的 `YYYYMM` 視為月份；同月份若有多個更新版本，以下載最新 fileset。下載目錄為 `JUDGMENT_DATA_DIR/raw_rar`。處理頁顯示 1996-01 到最新月份的月曆表，依本機檔案與最新 fileset 判斷綠／灰／紅。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從處理頁啟動判決下載 (Priority: P1)

使用者在 `#/processing` 左側 sidebar 看到「判決下載」，位置在「命令下載」與「判決匯入」之間。按下執行後，系統以司法院開放資料帳號密碼取得 Token，檢查裁判書分類的壓縮檔，並將檔案下載到 `data/judgments/raw_rar`。

**Independent Test**: 開啟處理頁，確認 sidebar 順序；於 API 開放時段執行，確認 run 狀態、log 與 raw_rar 檔案更新；於非開放時段執行，確認立即顯示時段限制訊息。

**Acceptance Scenarios**:

1. **Given** 使用者開啟處理頁，**When** 載入 workflow 清單，**Then** 「判決下載」出現在「命令下載」與「判決匯入」之間。
2. **Given** 目前時間在 00:00–06:00（Asia/Taipei）且帳密有效，**When** 執行判決下載，**Then** 系統取得 Token 並開始檢查 1996-01 到最新月份的壓縮檔。
3. **Given** 目前時間不在 00:00–06:00，**When** 執行判決下載，**Then** 系統不發出下載請求，log 顯示目前時間與開放時段。
4. **Given** 帳號或密碼錯誤，**When** 執行判決下載，**Then** run 失敗並顯示驗證失敗，不顯示密碼或 Token。

### User Story 2 - 完整月份同步：缺檔下載、舊版更新 (Priority: P1)

系統以 `resourceDescription` 的 `YYYYMM` 建立 1996-01 到最新月份的清單，每個月份取最新 fileset。若本機沒有該月份檔案，下載；若本機有檔案但不是最新 fileset，下載新版本並取代同月份舊檔；若已是最新，略過。

**Independent Test**: 在只有 24 個月份檔案的環境執行，確認其他月份被下載；將某月份本機檔案換成舊版並更新 manifest，確認執行後下載最新版並移除舊版。以 `--check-only` 確認只檢查不下載。

**Acceptance Scenarios**:

1. **Given** 本機缺少 1996-01 到 2026-08 之間的某月份檔案，**When** 執行，**Then** 該月份最新 fileset 被下載到 raw_rar。
2. **Given** 本機已有某月份檔案且為最新 fileset，**When** 執行，**Then** metadata 未變更時略過，不重新下載。
3. **Given** 本機已有同月份舊版檔案，遠端有較新 fileset，**When** 執行，**Then** 下載新版本、原子取代，並移除同月份舊檔。
4. **Given** 同月份遠端檔案大小或 validator 改變，**When** 執行，**Then** 重新下載並取代。
5. **Given** 執行到 06:00，**When** 尚未完成全部月份，**Then** 停止並保留已完成檔案，下一次執行從缺少月份續傳。

### User Story 3 - 以 metadata 檢查，不重複下載 (Priority: P1)

系統以 HEAD 取得 `Content-Length`、`Last-Modified`、`ETag`。官方端點對 HEAD 回傳 405，因此改用 GET stream 只讀 headers 後立即關閉，不讀取 body。若本機檔案大小與 metadata 一致且 manifest validator 未變，略過下載。

**Independent Test**: 在已有 24 個檔案的環境執行，確認沒有重新下載未變更檔案；修改 manifest 或使用測試伺服器回傳不同 `Last-Modified`，確認該檔重新下載。

**Acceptance Scenarios**:

1. **Given** 本機檔案存在且遠端 metadata 未變，**When** 執行，**Then** 標記為 skipped，不重新下載。
2. **Given** 官方端點對 HEAD 回傳 405，**When** 檢查 metadata，**Then** 使用 GET stream 讀 headers 後立即關閉，不下載完整 body。
3. **Given** 下載中斷或長度不符，**When** 驗證失敗，**Then** 不覆蓋舊檔，刪除 `.part`，下次重試。

### User Story 4 - 月份下載狀態表 (Priority: P1)

判決下載頁面顯示 1996-01 到最新月份的月曆表。第一列是最新年度，最後一列是 1996；每列有 1–12 月。綠色表示最新版已下載到 `/data`，灰色表示本機仍是舊版，紅色表示缺少該月份判決資料。表格旁顯示三色統計與重新整理按鈕。執行流程時，目前正在檢查或下載的月份必須即時標示，執行按鈕區塊下方顯示該月份、檔名、進度條、百分比與已下載／總大小。

**Independent Test**: 以目前 manifest 開啟判決下載頁，確認 31 個年度列、2026 在最上、1996 在最下；2026 年 1–8 月可顯示狀態，9–12 月為空白；綠色 24、紅色 344。下載新月份後重新整理，確認該月份由紅轉綠。執行流程時確認月份表格會標示目前月份，進度區顯示檔名與大小變化，且輪詢期間表格不會被重繪或跳動。

**Acceptance Scenarios**:

1. **Given** manifest 有 368 個月狀態，**When** 開啟判決下載頁，**Then** 顯示 1996–2026 共 31 列，每列 12 個月份欄位。
2. **Given** 某月份最新 fileset 已存在本機，**When** 顯示表格，**Then** 該月份為綠色。
3. **Given** 某月份本機檔案是舊版，**When** 顯示表格，**Then** 該月份為灰色。
4. **Given** 某月份沒有本機檔案或官方沒有資料，**When** 顯示表格，**Then** 該月份為紅色。
5. **Given** 2026 年 9–12 月尚未有資料，**When** 顯示表格，**Then** 顯示為空白，不標示紅/綠。
6. **Given** 使用者手動把某月份檔案放入 raw_rar，**When** 按表格的重新整理，**Then** 系統重新掃描 raw_rar，最新檔變綠色、舊版變灰色，不需重跑下載流程。
7. **Given** 下載流程更新 manifest，**When** 使用者按重新整理，**Then** 表格數字顏色與統計更新。
8. **Given** 使用者將滑鼠移到某個月份，**When** 該月份有 fileset，**Then** 顯示該月份檔案下載連結；下載連結使用 manifest 記錄的 fileset ID，不需要自行輸入。
9. **Given** 判決下載正在檢查或下載某月份，**When** 處理頁輪詢狀態，**Then** 該月份儲存格加上處理中標示，執行按鈕區塊顯示月份、檔名、進度條、百分比與已下載／總大小。
10. **Given** 流程完成、中止或進度資料已失效，**When** 處理頁更新，**Then** 清除處理中標示與進度區，不顯示過期的下載進度。
11. **Given** 使用者在流程執行中檢視月份表，**When** 狀態每 2 秒更新，**Then** 只更新月份狀態與進度節點，不重繪整個工作流程面板，表格捲動位置保持不變。

### User Story 5 - 可追溯的 manifest 與續傳 (Priority: P2)

系統在 `raw_rar/download_manifest.json` 記錄 fileset ID、檔名、大小、Last-Modified、ETag、SHA-256、來源 URL、下載時間、月份狀態與 baseline。流程可跨多個 API 時段續傳，已完成的月份不重複下載。

**Independent Test**: 檢查 manifest 內容與實際檔案一致；中斷後重跑，確認已下載檔案 skipped，缺檔繼續下載。

**Acceptance Scenarios**:

1. **Given** 下載或更新成功，**When** 檢查 manifest，**Then** 包含 fileset、檔名、大小、validators、SHA-256 與時間。
2. **Given** 流程在 06:00 停止，**When** 下次執行，**Then** 已完成月份 skipped，缺檔繼續下載。
3. **Given** 使用者只想快速檢查既有檔案，**When** 使用 `--incremental`，**Then** 只檢查既有檔案、baseline 與最新 fileset 之後的新檔。

### Edge Cases

- 官方 API 在非 00:00–06:00 時段不提供服務：必須在發出請求前阻擋；流程跨時段時停止並保留進度。
- HEAD 回傳 405：使用 GET stream 只讀 headers，不能下載 body。
- Token 過期：遇到 401 時重新取得 Token，且不記錄敏感資訊。
- 檔案下載中斷：保留原檔，刪除 `.part`，下次重新下載。
- Content-Length 與實際下載長度不符：視為失敗，不取代舊檔。
- 72012 是 Delete-Infor CSV，不是判決壓縮檔：不得誤判為新月份。
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
- **FR-004**: 下載目錄固定為 `JUDGMENT_DATA_DIR/raw_rar`（預設 `data/judgments/raw_rar`）。
- **FR-005**: 必須建立 1996-01 到最新月份的清單；每個月份取最新 fileset。預設下載缺少月份，已存在月份檢查是否有新版。
- **FR-006**: 更新檢查必須使用 HEAD metadata；若 HEAD 不支援，使用 GET stream 只讀 headers，不得下載完整檔案。
- **FR-007**: 必須比較 `Content-Length`、`Last-Modified`、`ETag`、本機大小與 manifest；未變更檔案不重新下載。
- **FR-008**: 有更新或缺少檔案時，下載到暫存檔，驗證後原子取代，並更新 manifest。
- **FR-009**: 同月份出現新版本時，必須移除同月份舊版本檔案與 manifest 記錄。
- **FR-010**: 僅允許在 Asia/Taipei 00:00–06:00 執行；跨時段時停止、保留進度，下次續傳。
- **FR-011**: 必須探測最新 fileset 的下一個 ID；若為判決壓縮檔則納入，若為非壓縮檔或不存在則停止。
- **FR-012**: manifest 必須包含 `months` 陣列與 year-month → fileset ID 對照，記錄 1996-01 到最新月份的 local/remote fileset、狀態（green/gray/red）與檔名。
- **FR-013**: 必須提供唯讀狀態 API，讓處理頁讀取 manifest 與即時掃描 `raw_rar` 目錄，手動放入的檔案也要反映在月份表；不需在下載時段外呼叫官方 API。
- **FR-014**: 判決下載頁必須顯示月份表：第一列最新年度、最後一列 1996 年，每列 1–12 月；綠色最新版、灰色舊版、紅色缺失、超出最新月份為空白。滑鼠移到有 fileset 的月份時，必須顯示該月份的下載連結。
- **FR-015**: 表格必須顯示綠／灰／紅統計與重新整理按鈕。
- **FR-019**: 月份下載連結必須使用 manifest 的 year-month → fileset ID 對照，經後端帶 Token 的 proxy 下載，不得把密碼或 Token 暴露給前端。
- **FR-020**: 月份表 hover 連結僅在 API 開放時段（00:00–06:00 Asia/Taipei）可用；非時段顯示明確錯誤。
- **FR-021**: 下載流程必須將目前階段、月份、檔名、fileset、已下載位元組、總位元組與百分比寫入可讀取的進度狀態；狀態 API 必須回傳該進度，且不得包含帳密或 Token。
- **FR-022**: 處理頁輪詢時必須以區域更新方式維護月份表與進度區，不得因進度或月份狀態變更而重繪整個工作流程面板或重設表格捲動位置。
- **FR-023**: 進度狀態必須在流程正常結束或中止後清除；程序已不存在或進度逾時時，狀態 API 不得回傳過期進度。
- **FR-016**: log 不得輸出密碼或完整 Token。
- **FR-017**: 判決匯入流程必須能掃描 `.rar`、`.7z`、`.zip`。
- **FR-018**: 流程必須可重複執行；第二次執行未變更檔案不應重新下載。

### Key Entities

- **Fileset**：司法院開放資料的檔案來源，包含 `fileSetId`、`resourceFormat`、`resourceDescription`（`YYYYMM...`）。
- **Month status**：`download_manifest.json` 的 `months`，每個月份記錄最新 fileset、本機 fileset 與 green/gray/red 狀態。
- **Download manifest**：`raw_rar/download_manifest.json`，記錄 fileset、本機檔案、validators、SHA-256、下載時間與月份表。
- **Baseline**：71644（199601）與 72011（202608，目前最新判決壓縮檔）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 處理頁 sidebar 的「判決下載」位置正確，且在 workflow 清單中可執行。
- **SC-002**: 在非 00:00–06:00 時段執行時，0 次檔案下載請求，log 顯示明確時段訊息。
- **SC-003**: 對已存在的 24 個未變更檔案執行時，下載數為 0，skipped 數為 24。
- **SC-004**: 缺少月份會被下載；下載後該月份表格由紅轉綠。
- **SC-005**: 同月份遠端更新時，下載新檔、移除舊檔，manifest 更新。
- **SC-006**: 72012 被辨識為 Delete-Infor CSV，不會出現在 raw_rar 的壓縮檔清單。
- **SC-007**: 月份表顯示 1996–2026 共 31 列；第一列 2026、最後一列 1996；三色統計與 manifest 一致。
- **SC-008**: 第二次執行與第一次執行結果一致，沒有重複下載。
- **SC-009**: Token、密碼不出現在 log 或 manifest。
- **SC-010**: 執行判決下載後，處理頁在 2 秒內標示目前月份並顯示檔名、百分比與已下載／總大小；狀態更新期間月份表不閃爍、不重設捲動位置。
- **SC-011**: 流程結束或中止後，處理中標示與進度區不再顯示。

## Assumptions

- 使用司法院資料開放平臺 `opendata.judicial.gov.tw` 的 FilesetLists API。
- 官方 resources 清單是判決壓縮檔的權威來源；71644–72011 之間有些月份有多個更新版本，因此以 `YYYYMM` 分組並取最新 fileset，而不是直接把 fileset ID 當成月份。
- 1996-01 到 2026-08 共 368 個月；目前本機有 2024-09 到 2026-08 共 24 個月。
- 第一次完整同步可能需要下載數百個月份，會跨越多個 00:00–06:00 時段；流程會續傳。
- Delete-Infor CSV 的後續刪除套用不在本次範圍。

## Out of Scope

- 自動依 Delete-Infor CSV 刪除 PostgreSQL、Parquet 或 Qdrant 中的判決。
- 將下載流程加入「資料更新（完整）」的自動步驟；目前為獨立 workflow。
- 非裁判書分類的下載。
- PDF 中另一套 `data.judicial.gov.tw/jdg/api` 的 JList／JDoc 流程。
