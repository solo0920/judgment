# Feature Specification: 線上更新檢查與通知（Update Notifications）

**Feature Branch**: `007-update-notifications`

**Created**: 2026-11-11

**Status**: Implemented

**Input**: 使用者需求（原文摘要）：

> 把法規下載和命令下載也建立更新記錄表，當偵測到有新版存在時下載檔案；若檔名相同，可建立以下載日期命名的 folder 存放更新資料檔。`up.sh` 啟動服務時對法規、命令、判決三者線上資料作檢查；若有新版，在 header 的「資料處理」標籤右下角註記橘色 icon，並在 sidebar 的法規下載／命令下載／判決下載右側把「待命」改為橘色「更新」。

## User Scenarios & Testing

### User Story 1 - 服務啟動時檢查三類資料 (Priority: P1)

`up.sh` 在後端就緒後呼叫 `POST /api/updates/check`，檢查：

- 法規：`LAW_API_URL` 的遠端 ZIP headers（filename、Content-Length）。
- 命令：`ORDER_API_URL` 的遠端 ZIP headers。
- 判決：司法院裁判書 resources 與本機 `raw_rar` 月份狀態。

檢查結果寫入 `download_update_records`，同一 source 只保留一筆 current；即使檢查失敗也不影響服務啟動。

**Acceptance Scenarios**:

1. **Given** 本機法規 ZIP 大小與遠端 Content-Length 相同，**When** 啟動檢查，**Then** 記錄 `up_to_date`，不顯示更新。
2. **Given** 遠端法規 ZIP 大小變更，**When** 啟動檢查，**Then** 記錄 `update_available=true`。
3. **Given** 判決有缺少／舊版月份，**When** 啟動檢查，**Then** 記錄待補齊數量與 `update_available=true`。
4. **Given** 任一來源檢查失敗，**When** 啟動檢查，**Then** 記錄 `error`，不影響後端啟動或其他來源。

### User Story 2 - Header 與 Sidebar 更新提醒 (Priority: P1)

Header 的「資料處理」導覽項目右下角顯示橘色 badge，數字為有更新的來源數（1–3）。Sidebar 的 `law_download`、`order_download`、`judgment_download` 在沒有執行中的 run、但有更新時，右側狀態 badge 顯示橘色「更新」，而不是「待命」。每個 workflow 面板必須顯示最近執行紀錄與版本檢查紀錄；法規／命令／判決面板提供「檢查更新」按鈕。

**Acceptance Scenarios**:

1. **Given** 只有法規有更新，**When** 載入任一頁面，**Then** header「資料處理」右下角顯示 `1`。
2. **Given** 法規、命令、判決都有更新，**When** 載入頁面，**Then** badge 顯示 `3`。
3. **Given** 法規有更新，**When** 開啟 `#/processing` 並選取法規下載，**Then** sidebar 法規下載右側顯示橘色「更新」。
4. **Given** 該流程正在執行，**When** 顯示 sidebar，**Then** 顯示「執行中」優先於「更新」。
5. **Given** 下載流程完成且本地已是最新，**When** 重新整理，**Then** 更新 badge 消失。
6. **Given** 法規下載曾執行且結果為 `no_change`，**When** 選取法規下載，**Then** 執行紀錄列表顯示該次 run 的狀態、時間、耗時與訊息。
7. **Given** `up.sh` 或「檢查更新」已執行，**When** 選取法規／命令／判決下載，**Then** 版本檢查紀錄顯示 `up_to_date`／`update_available`／`error`、檢查時間與訊息。
8. **Given** 法規下載目前為 `up_to_date`，**When** 按下「執行此流程」，**Then** 先檢查法規來源並顯示「已是最新版本，仍要強制重新下載？」確認；取消時不建立 run。
9. **Given** 法規下載檢查失敗，**When** 按下「執行此流程」，**Then** 顯示檢查失敗警告，但允許使用者直接執行下載。

### User Story 3 - 更新紀錄與下載日期資料夾 (Priority: P1)

法規／命令下載成功時，ZIP 存到 `LAW_DATA_DIR/raw/{source}/{YYYYMMDD}/{原始檔名}`；若同一天同檔名已存在但內容不同，使用 `{stem}.{hash8}{suffix}` 保留兩份。更新紀錄保存遠端 filename、Content-Length、local version、下載路徑與下載日期。

**Acceptance Scenarios**:

1. **Given** 首次下載 `ChLaw.json.zip`，**When** 儲存，**Then** 路徑為 `raw/law/20261111/ChLaw.json.zip`。
2. **Given** 同日再次下載同名但不同 hash 的檔案，**When** 儲存，**Then** 舊檔保留，新檔為 `ChLaw.json.{hash8}.zip`。
3. **Given** 下載成功，**When** 查詢更新紀錄，**Then** `update_available=false`、`download_path` 與 `download_date` 正確。

## Functional Requirements

- **FR-001**: 系統 MUST 建立 `download_update_records`，記錄 source_type、status、update_available、checked_at、remote filename/length/ETag/Last-Modified、local version/update date/hash、download path/date、message、details 與 is_current。
- **FR-002**: 同一 source_type 只能有一筆 `is_current=true`；每次檢查或下載完成 MUST 將舊 current 標記為 false。
- **FR-003**: 法規／命令檢查 MUST 以 GET stream 讀取 headers 後立即關閉，不讀取完整 ZIP body；HEAD 405 不視為失敗。
- **FR-004**: 法規／命令更新判斷 MUST 比較遠端 Content-Length 與本地 ZIP 大小；不同即 `update_available=true`。長度相同但內容變更的情況由實際下載流程的 SHA/UpdateDate 再確認。
- **FR-005**: 判決檢查 MUST 使用 authenticated resources 與本機 raw_rar/month manifest 比較，pending 月份數 > 0 即 `update_available=true`。
- **FR-006**: `GET /api/updates/status` MUST 回傳 law/order/judgment 的 current 狀態、`update_count` 與 `any_update`。
- **FR-007**: `POST /api/updates/check` MUST 執行三類檢查並回傳最新狀態；同一時間只允許一個檢查，重疊時回傳目前狀態。
- **FR-008**: `up.sh` MUST 在後端就緒後呼叫檢查；失敗只顯示警告，不阻止服務啟動；`JUDGMENT_SKIP_UPDATE_CHECK=1` 可略過。
- **FR-009**: `/api/processing` 的 workflow entries MUST 包含 `update_available` 與 `update_status`，供 sidebar 顯示橘色「更新」。
- **FR-010**: Header「資料處理」導覽項目 MUST 顯示 1–3 的橘色更新 badge；無更新時隱藏；每 60 秒與視窗 focus 時重新取得狀態。
- **FR-011**: 法規／命令下載成功或 no_change MUST 寫入更新紀錄 `update_available=false`，避免 sidebar 持續顯示更新。
- **FR-012**: 判決下載流程結束 MUST 寫入更新紀錄；pending > 0 時保持 `update_available=true`，成功補齊時清除。
- **FR-013**: 法規／命令 ZIP MUST 使用下載日期資料夾與原始檔名；同檔名不同內容 MUST 以 hash suffix 保留，不得覆寫。
- **FR-014**: 檢查失敗不得清除既有可靠的 update 狀態；應記錄 error 並在 UI 顯示可辨識狀態。
- **FR-015**: `/api/processing` 的每個 workflow entry MUST 包含 `recent_runs`（服務層執行歷史）與 `update_history`（版本檢查歷史）；`law_download`／`order_download` 的服務層 run 為 `branch=law/order, kind=download`，不得只顯示 workflow runner 包裝 run。
- **FR-016**: 法規／命令／判決下載面板 MUST 顯示「執行紀錄」與「版本檢查紀錄」列表，並提供「檢查更新」按鈕呼叫 `/api/updates/check`。
- **FR-017**: `POST /api/updates/check` MUST 接受選用 body `{"source_types": ["law"|"order"|"judgment"]}`，只檢查指定來源；未提供或空陣列時檢查全部。未知來源 MUST 回傳 400。
- **FR-018**: 法規／命令／判決下載的「執行此流程」MUST 先只檢查該來源；`up_to_date` 時 MUST 要求確認是否強制重新下載，取消時不得建立 run。檢查失敗 MAY 顯示警告後允許執行。

## Key Entities

- **DownloadUpdateRecord**：一次線上檢查或下載完成的歷史紀錄；`is_current` 指向目前狀態。
- **Update status**：law/order/judgment 的 current 狀態與 update_count。
- **Update badge**：header 的橘色數字 badge 與 sidebar 的「更新」badge。

## Success Criteria

- **SC-001**: `up.sh` 啟動後 120 秒內完成三類檢查，且檢查失敗不影響後端啟動。
- **SC-002**: 法規 ZIP 大小變更時，`/api/updates/status` 的 `update_count` 增加，sidebar 顯示「更新」。
- **SC-003**: 判決 pending 月份 > 0 時，judgment 更新狀態為 true；補齊後為 false。
- **SC-004**: Header badge 在 1–3 個來源更新時顯示正確數字，無更新時隱藏。
- **SC-005**: 同一天同檔名但不同內容的 ZIP 不會互相覆寫，且更新紀錄可追溯兩者路徑。
- **SC-006**: 重新載入 processing 頁面時，執行中的流程顯示「執行中」而非「更新」。

## Assumptions

- 法規／命令端點沒有 ETag/Last-Modified，因此以 Content-Length 作快速提示；最終版本仍以下載後的 ZIP/JSON hash 與 UpdateDate 為準。
- 判決檢查需要司法院帳密；未設定時記錄 error，不顯示更新。
- Header badge 只反映 current update record，不重新下載檔案。
- 法規／命令下載 workflow 實際包含原始 Parquet、解析與 PostgreSQL，不包含 Qdrant 或 IndexedDB；IndexedDB 僅保存瀏覽器提問紀錄與版本 audit metadata。面板不得為未執行的儲存層建立虛構進度。
