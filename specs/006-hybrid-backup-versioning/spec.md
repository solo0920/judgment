# Feature Specification: 判決與法規混合版本備份（Hybrid Backup & Versioning）

**Feature Branch**: `006-hybrid-backup-versioning`

**Created**: 2026-11-11

**Updated**: 2026-11-11

**Status**: Implemented

> 線上更新檢查、更新紀錄與 header/sidebar 橘色提醒見 [`specs/007-update-notifications/spec.md`](../007-update-notifications/spec.md)。

**Input**: 使用者需求（原文摘要）：

> 當偵測到新版檔案出現時，採用混合機制作備份處理，使 Parquet、PostgreSQL、Qdrant、IndexedDB 都能有新舊資料可以查詢及 audit，但又不致於讓 backup 成本過大。實作後需測試可用，確保不遺失新舊檔案資料及記錄，並將混合備份方式納入 spec。

**需求解讀**: 不保存每個版本的完整 RAR/ZIP，也不只保留最新版。以「current 完整資料 + 變更紀錄 delta + 少量 baseline」保存：

1. 目前版本放在 current 表，供查詢與 RAG 使用。
2. 被取代或移除的完整內容放在歷史版本表；新增資料不重複寫入歷史表。
3. Parquet 保留 current 完整 raw snapshot，變更/移除的舊 raw JSON 寫入 delta Parquet；驗證成功後才移除舊 full snapshot。
4. Qdrant current collection 保留最新向量；被取代/移除的舊向量寫入 history collection。
5. IndexedDB 快取版本變更 audit metadata，讓瀏覽器可離線檢視最近的變更紀錄。
6. 任何一層都不得 hard delete 唯一一份資料；移除只標記 `is_current=false` 或寫入 tombstone/change event。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 新版本出現時保留舊內容 (Priority: P1)

當同一個月份出現新的判決 RAR（例如 `202606--(20260816Update).rar` → `202606--(20261016Update).rar`），系統偵測到新的 archive hash/update date，建立新的 snapshot，並比較 JID：

- 新增：寫入 current，記錄 added event。
- 修改：先將舊內容寫入歷史版本，再更新 current，記錄 modified event。
- 移除：將舊內容寫入歷史版本，標記 current 為非現行，記錄 removed event。
- 未變更：只更新 last seen snapshot，不建立重複版本。

**Independent Test**: 用兩個測試 archive 依序匯入；確認 current 是最新版、舊版全文可透過版本查詢取得、delta Parquet 可重建舊 raw JSON，且舊 full Parquet 在 delta 驗證成功後才被移除。

**Acceptance Scenarios**:

1. **Given** 舊 archive 已有 3 筆判決，**When** 新 archive 修改 1 筆、移除 1 筆、新增 1 筆，**Then** current 為 3 筆最新資料，歷史版本保留被修改/移除的 2 筆舊內容。
2. **Given** 同一 JID 只改空白或換行，**When** 比對內容，**Then** 仍建立版本但標記 `is_formatting_only=true`，不重複 embedding。
3. **Given** 新 archive 與舊 archive 的 JID 完全相同且內容相同，**When** 匯入，**Then** 不建立新版本、不新增 change event。
4. **Given** 匯入中斷，**When** 重新執行，**Then** snapshot/版本/事件以唯一鍵避免重複，已完成的資料不遺失。

### User Story 2 - 查詢 current 與歷史判決 (Priority: P1)

使用者與 API 預設只查 current。需要 audit 時，可依 JID 查版本清單、變更事件與舊版全文，或依月份查 snapshot 與 Parquet delta。

**Independent Test**: 呼叫 `/api/versioning/judgments/{jid}`、`/api/versioning/judgments/versions/{version_id}`、`/api/versioning/judgments/snapshots`、`/api/versioning/parquet/changes`，確認回傳 current、舊版全文、snapshot 與 delta。

**Acceptance Scenarios**:

1. **Given** 某 JID 有一個舊版本，**When** 查詢該 JID，**Then** 回傳 current、versions 與 change events。
2. **Given** 舊版 version id，**When** 查詢版本明細，**Then** 回傳舊版完整全文與 metadata。
3. **Given** 某月份有 delta，**When** 查詢 Parquet changes，**Then** 回傳 delta 內的 added/modified/removed 紀錄與舊 raw JSON。
4. **Given** 使用者查一般判決列表，**When** 未指定歷史模式，**Then** 只回傳 `is_current=true` 的判決。

### User Story 3 - Qdrant 與 IndexedDB audit (Priority: P2)

Qdrant 在建立新索引版本時，將被取代/移除的舊向量寫入 history collection，保留 `jid`、`history_version_id`、`valid_to_version_id` 與 `is_current=false`。IndexedDB 新增 `audit_events` store，同步 `/api/versioning/audit` 的變更 metadata。

**Independent Test**: 用 Fake Qdrant store 建立新索引，確認舊向量進入 history collection；在瀏覽器資料頁選擇 `audit_events`，確認可列出同步後的 change events。

**Acceptance Scenarios**:

1. **Given** JID 內容改變，**When** 建立新索引版本，**Then** 舊向量寫入 history collection，current collection 使用新向量。
2. **Given** JID 被移除，**When** 建立新索引版本，**Then** 舊向量寫入 history collection，current collection 不再有該 point。
3. **Given** IndexedDB 可用，**When** 使用者開啟 `audit_events`，**Then** 從 API 同步事件並可依 jid/change type 檢視。
4. **Given** IndexedDB 不可用，**When** 同步失敗，**Then** 系統降級到記憶體並在頁面顯示警告，不影響後端查詢。

### User Story 4 - 控制備份成本 (Priority: P1)

系統不得為每次更新保存完整 RAR/ZIP 或完整 raw Parquet。舊 full raw Parquet 僅在 delta 寫入並驗證成功後刪除；新增資料只存在 current，不重複寫入歷史表；法規/命令歷史以變更條文與事件為主。

**Independent Test**: 匯入新版後檢查舊 full Parquet 是否被移除、delta 是否存在、歷史版本列數是否只等於 modified/removed 數量；以 `JUDGMENT_RAW_PARQUET_KEEP_VERSIONS=true` 可保留舊 full 版本。

**Acceptance Scenarios**:

1. **Given** 新版本與舊版本有 1 修改、1 移除、1 新增，**When** 匯入完成，**Then** 歷史版本只有 2 筆被取代/移除的內容，新增資料不另建歷史列。
2. **Given** delta 寫入失敗，**When** 匯入，**Then** 不得刪除舊 full Parquet，並記錄錯誤。
3. **Given** `JUDGMENT_RAW_PARQUET_KEEP_VERSIONS=true`，**When** 匯入新版，**Then** 舊 full Parquet 保留供比對。

## Edge Cases

- 同一月份有多個 update 檔案：以 `source_update_date` 排序，較舊的 snapshot 不得覆蓋 current。
- `JID` 相同但內容不同：保留舊版並建立 modified event。
- `JID` 從新 snapshot 消失：只在同一 `issue_month` 內標記 removed；不得因其他月份 archive 缺少該 JID 而移除。
- 範圍限制（`--limit`）或中斷：不得執行 removal finalization；保留舊 full raw 與 current。
- 重新匯入同一個 archive：snapshot 以 `(issue_month, archive_sha256)` 去重，事件以 `(jid, to_snapshot_id, change_type)` 去重。
- 舊版全文含隱私資料：歷史表與 raw delta 需權限控管；必要時以 tombstone/雜湊取代可讀舊全文。
- Qdrant 未設定或 history collection 不存在：索引主流程不得失敗，僅記錄 warning。
- IndexedDB 版本升級失敗：使用記憶體 fallback，不影響伺服器端版本資料。

## Functional Requirements

- **FR-001**: 系統 MUST 為每個判決 archive 建立 `judgment_snapshots`，記錄 issue month、archive 名稱、SHA-256、update date、raw Parquet、delta Parquet 與 current 狀態。
- **FR-002**: 系統 MUST 以 JID 維護 current 判決；`is_current=false` 只代表已被新 snapshot 取代或移除，不得 hard delete 唯一資料。
- **FR-003**: 系統 MUST 在 current 被判決修改或移除前，將舊全文寫入 `judgment_document_versions`；新增資料不得重複建立歷史列。
- **FR-004**: 系統 MUST 建立 `judgment_change_events`，記錄 added/modified/removed/restored、changed fields、before/after metadata、formatting-only 與 snapshot/version 關聯。
- **FR-005**: 系統 MUST 以 `(issue_month, archive_sha256)`、`(jid, snapshot_id)`、`(jid, to_snapshot_id, change_type)` 等唯一鍵保證重跑 idempotent。
- **FR-006**: 系統 MUST 在欄位 `is_current=true` 的查詢中排除歷史判決；歷史查詢必須走專用 API。
- **FR-007**: 系統 MUST 在原始 Parquet 層保存 current full snapshot，並為 modified/removed 的舊 raw JSON 寫入 delta Parquet；added 只記錄 JID/hash，不重複保存 new raw JSON。
- **FR-008**: 系統 MUST 在 delta Parquet 寫入後重新讀取驗證 row count；驗證成功且 DB 完成後才可移除舊 full raw Parquet。
- **FR-009**: 舊 full raw Parquet 的保留與否 MUST 由 `JUDGMENT_RAW_PARQUET_KEEP_VERSIONS` 控制，預設 `false`（節省空間）。
- **FR-010**: Qdrant 建立新索引版本時 MUST 將 modified/removed 的舊向量寫入 history collection，payload 至少包含 `jid`、`is_current=false`、`history_version_id`、`valid_to_version_id`。
- **FR-011**: Qdrant history collection 不得成為 current alias；current 查詢仍使用 `judgments_current`。
- **FR-012**: 系統 MUST 提供 snapshot、change events、JID 歷史、版本全文、Parquet delta、vector version metadata 的唯讀 API。
- **FR-013**: 系統 MUST 提供 `/api/versioning/audit` 供 IndexedDB 增量同步，回傳 `latest_event_id`、events、snapshots 與 deltas。
- **FR-014**: IndexedDB MUST 新增 `audit_events` object store，支援新增、列出、清除與上限 pruning；同步失敗時降級到記憶體。
- **FR-015**: 文件與 README MUST 說明 current/history/delta 的查詢方式、環境變數與成本策略。
- **FR-016**: 匯入流程 MUST 在失敗或中斷時保留舊 full raw Parquet 與已完成的版本/事件，不得留下半寫入的 delta 或 snapshot。
- **FR-017**: 法規/命令沿用既有 `law_dataset_versions`、`law_article_versions` 與 change events；新版不得刪除舊版，`is_current` 只允許一個現行版本。
- **FR-018**: 歷史資料查詢 MUST 能回答「某 JID 在某 snapshot 的內容」與「某月份有哪些 added/modified/removed」。
- **FR-019**: 舊版資料的 API 與 UI MUST 標示來源 snapshot/version，不得把歷史資料誤標為 current。
- **FR-020**: 任何自動 pruning MUST 先驗證替代資料（delta/版本/事件）可讀且數量正確；不得只依檔案存在與否刪除。
- **FR-021**: 判決下載偵測到同月份新版本時 MUST 將舊 RAR/7z/zip 移到 `raw_rar/history/`，並在 `download_manifest.json` 的 `history_files` 保留 fileset、檔名與封存時間；`JUDGMENT_RAW_RAR_KEEP_VERSIONS=false` 才允許直接刪除。
- **FR-022**: `raw_rar/history/` MUST 不被 current 月份掃描、匯入或下載狀態視為現行檔案；它只作為容器級舊版封存。
- **FR-023**: Qdrant 舊完整 index collection MAY 保留供 rollback；超過保留政策時 MUST 可透過 `judgment-index-vectors --discard-version` 清除，history collection 仍保留 changed/removed 舊向量。

## Key Entities

- **JudgmentSnapshot**：一次判決 archive 匯入的不可變快照；issue month、archive hash、update date、raw/delta path、current 狀態。
- **JudgmentDocument**：目前判決投影；`is_current`、first/last/content-first-seen snapshot、removed snapshot。
- **JudgmentDocumentVersion**：被取代或移除的舊判決全文與 metadata；`valid_from/valid_to` snapshot。
- **JudgmentChangeEvent**：added/modified/removed/restored 的 audit event。
- **Raw Delta Parquet**：current full raw snapshot 以外的舊 raw 變更；added 只存 JID/hash。
- **Qdrant History Collection**：被取代/移除的舊向量；不屬於 current alias。
- **IndexedDB audit_events**：瀏覽器端 audit metadata 快取，不含完整判決全文。

## Success Criteria *(mandatory)*

- **SC-001**: 匯入修改/移除/新增各 1 筆的新 archive 後，current 只顯示最新 3 筆，舊版全文可查，歷史版本只有 2 筆。
- **SC-002**: 重新匯入同一 snapshot 不產生重複 snapshot、版本或事件。
- **SC-003**: 舊 full raw Parquet 在 delta 驗證成功後才移除；delta 可重建 modified/removed 的舊 raw JSON。
- **SC-004**: 一般判決查詢不包含 `is_current=false` 的歷史列；歷史 API 可查到。
- **SC-005**: Qdrant 新索引版本建立後，changed/removed JID 的舊向量在 history collection，current collection 只有最新 point。
- **SC-006**: `audit_events` 可由 `/api/versioning/audit` 同步並在 IndexedDB 列出；同步失敗不影響後端。
- **SC-007**: `JUDGMENT_RAW_PARQUET_KEEP_VERSIONS=true` 時舊 full raw 保留；預設 false 時舊 full raw 被移除且 delta 存在。
- **SC-008**: 30 年歷史的增量成本以變更量為主，不隨完整 archive 版本數線性成長；新增判決不重複進入歷史表。

## Assumptions

- 判決 archive 的檔名可解析出 `YYYYMM` 與 `YYYYMMDDUpdate`；無法解析時以 `jdate`/檔名 fallback。
- 現有 `judgment_documents` 只存符合金融法規清單的判決；raw Parquet 仍保存完整 archive。
- 既有 738k 筆 current 判決不強制一次性建立歷史版本；第一次被修改/移除時才 lazy 建立 baseline version。
- Qdrant history collection 使用與 current 相同的 embedding model/維度；不同維度時建立新 collection。
- 精確 archive byte-level 審計以 `raw_rar/history/` 的舊 RAR/ZIP 與 `download_manifest.json` 的 `history_files` 為準；record-level 重建則使用 DB 版本與 delta Parquet。
