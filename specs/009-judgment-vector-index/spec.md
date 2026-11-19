# Qdrant 判決向量索引版本建置規格

**Status**: Active（canonical feature spec）

**Version**: 1.15

**Last Updated**: 2026-11-19

**Applies To**: `#/processing` 的「Qdrant判決向量索引版本建置」workflow、索引檔案時間表（A／R／E）、覆蓋率模式（coverage-only）、建置模式（build mode）與相關 SSE／快取。

**Parent Specification**: [`../004-web-console/spec.md`](../004-web-console/spec.md)

**Related Specifications**:

- [`../004-web-console/progress-visualization.md`](../004-web-console/progress-visualization.md)（25% 未完成淺色、完成色填充、月份框線）
- [`../004-web-console/pipeline-waterfall.md`](../004-web-console/pipeline-waterfall.md)（索引 pipeline waterfall）
- [`../010-llama-server-runtime/spec.md`](../010-llama-server-runtime/spec.md)（llama-server 端點、優先順序、全站命名與 host strip）

---

## 1. 目的

本規格定義 Qdrant 判決向量索引版本建置的資料來源、A／R／E 判斷、coverage-only 顯示、archive 選擇、月份統計與 UI 契約，避免把「RAR 檔數」與「待索引月份數」混為一談。

本規格是此 workflow 的 canonical source；`progress-visualization.md` 只定義通用進度視覺規則，衝突時以本規格對 A／R／E 與 archive 的判斷為準。

---

## 2. 名詞

| 名詞 | 定義 |
| --- | --- |
| Current document | `JudgmentDocument.is_current = true` 的判決。 |
| Source archive | 該判決最後一次新增／修改時所屬的 `source_archive`。 |
| Issue month | 判決所屬月份 `YYYYMM`。 |
| Active collection | 目前 alias 指向的 Qdrant collection。 |
| Baseline archive | 同月份中，不是最新 archive 的舊 archive；代表上一個正式版本的既有覆蓋。 |
| Latest archive | 同月份中，archive 名稱內 `YYYYMMDDUpdate` 日期最大的 archive。 |
| A | Active baseline：baseline archive 的既有覆蓋。 |
| R | Reuse：本次沿用既有向量、不重新計算 embedding。 |
| E | Embed：最新 archive 中需要新 embedding 的判決。 |
| Coverage-only | 沒有本次建置 run，只顯示 active collection 的實際月份覆蓋。 |
| Build mode | 有本次建置 run，顯示該版本的重用／新 embedding 進度。 |

---

## 3. 資料來源

### 3.1 判決與 archive

- `JudgmentDocument.is_current = true`：目前有效判決。
- `JudgmentDocument.issue_month`：判決月份。
- `JudgmentDocument.source_archive`：判決最後一次新增／修改時所屬的 archive。
- 同一月份 MAY 有多個 `source_archive`，例如：
  - `202601--(20261016Update).rar`：舊的完整 archive。
  - `202601--(20261116Update).rar`：新的更新 archive，只包含新增／變更判決。

### 3.2 Qdrant 索引

- `JudgmentVectorIndex` 以 `version_id` 或 `(collection, model)` 過濾。
- 以 `(issue_month, source_archive)` 聚合已索引判決數。
- `indexed / total` 代表該 archive 的月份文件在目前 collection 中的覆蓋比例。

### 3.3 掃描順序

- 新建索引版本 MUST 依 `issue_month ASC, JudgmentDocument.id ASC` 掃描，也就是由最舊月份處理到最新月份；同一月份再依匯入 ID。
- 續跑 MUST 使用 `(last_indexed_month, last_indexed_id)` 作為 cursor；不得只使用 `last_indexed_id`，否則切換月份排序後會漏掉月份。
- 既有 in-flight 版本若只有 `last_indexed_id`、沒有 `last_indexed_month`，MAY 繼續使用原本的 ID 順序完成該版本；新版本 MUST 使用月份順序。`index_runtime.scan_order` MUST 提供 `issue_month` 或 `id` 讓 UI 說明目前 run 的順序。
- `index_runtime.current.month` 是目前批次最後一筆判決所屬月份；綠框只表示目前批次所在月份，不代表其他月份已完成。新 run 的綠框會由舊月份往新月份移動。
- 準備中（copy／probe 尚未進入第一批）時，`current` 預覽 MUST 使用與實際批次相同的掃描順序與 cursor；月份排序 run MUST NOT 用 ID 順序挑第一個 pending 月份，否則會短暫顯示錯誤月份。
- 索引 summary MUST 顯示掃描順序：`issue_month` 顯示「月份（舊→新）」，舊 in-flight `id` 顯示「ID（舊 run）」，讓使用者知道目前 run 是否已套用新順序。
- 若未來調整排序，MUST 同步更新 cursor／resume、runtime payload、UI 說明與測試，不得只改 SQL 排序。

### 3.4 後端函式

- `src/judgment/judgment_index.py`
  - `_month_source_totals()`：目前判決依 `(issue_month, source_archive)` 的總數。
  - `_indexed_month_counts()`：已索引判決依 `(issue_month, source_archive)` 的數量。
  - `_month_runtime_rows()`：合併 total／processed／status。
  - `index_month_coverage()`：coverage-only 的月份覆蓋資料。
- `src/judgment/web/processing.py`
  - `_index_runtime_view()`：從 run meta 取得 build mode runtime。
  - `_merge_prior_index_runtime()`：續跑時恢復 R／E counters。
  - `_index_month_coverage_runtime()`：沒有 run 時的 coverage-only payload。
  - `_coverage_month_map()`：active coverage 對照。
- `src/judgment/web/static/assets/js/pages/processing.js`
  - `indexMonthGridMarkup()`：A／R／E 月份時間表。
  - `archiveUpdateRank()`：最新 archive 判斷。
  - `indexRuntimeMarkup()`：索引版本面板與 summary。

---

## 4. Archive 判斷機制

### 4.1 最新 archive

```text
latest archive = archive 名稱中 --(YYYYMMDDUpdate) 的日期最大者
```

- `202601--(20261116Update).rar` > `202601--(20261016Update).rar`。
- 沒有 `Update` 日期的一般 archive（例如 `202601.rar`）rank 為 `0`，視為較舊。
- 同月份只有一個 archive 時，該 archive 同時是最新與 baseline。

### 4.2 Baseline archive

- `baseline archives = 同月份所有 archive - latest archive`。
- 若沒有較舊 archive，`baseline archive = latest archive`。
- A／R 的填充比例使用 baseline archives 的 `processed / total`。
- E 的填充比例使用 latest archive 的 `processed / total`。

### 4.3 不可相加

- MUST NOT 將同月份所有 archive 的 `total`、`processed` 相加後作為 A／R／E 的單一比例。
- 原因：新 archive 可能只包含 delta 判決，舊 archive 可能已被新版本沿用以外的完整基線；相加會重複計算並讓已完成月份看起來仍是淺色。
- 只有「最新 archive」用於 E；「baseline archives」用於 A／R。

---

## 5. A／R／E 判斷

### 5.1 Coverage-only

沒有本次建置 run 時：

| 分格 | 來源 | 填充比例 |
| --- | --- | --- |
| A 基線 | baseline archives | `baselineProcessed / baselineTotal` |
| R 沿用 | baseline archives | 同 A；代表舊版文件沿用既有向量 |
| E 新 embedding | latest archive | `latestProcessed / latestTotal` |

- `baselineTotal > 0 && baselineProcessed >= baselineTotal`：A／R 完成。
- `latestTotal > 0 && latestProcessed >= latestTotal`：E 完成。
- 沒有 baseline coverage 的月份：A／R 未完成。
- 沒有 latest archive coverage 的月份：E 未完成。

### 5.2 Build mode

有本次建置 run 時：

- Runtime `months[].reused`、`embedded`、`processed`、`total` 來自 `_month_runtime_rows()` 與 run checkpoint；同一月份仍以 archive 分組，不得把新舊 archive 的 total／processed 相加。
- 最新 archive 用於 E；較舊 archive 作為 A／R 基線；只有一個 archive 時 baseline = latest。
- Build mode 先判斷該月 latest archive 是否仍有 E backlog：
  - `latestActiveComplete = active archive processed >= total`（latest archive 已被 active collection 完整覆蓋）。
  - **無 E backlog（未變更月份）**：R／E MAY 使用 active collection 覆蓋顯示完成；這些月份不需要新 embedding，即使本次 run 尚未掃到，也 MUST 保持實心。
  - **有 E backlog**：R／E MUST 只使用本次 run checkpoint（`runtime.months[].processed / total`）；本次 run 尚未處理的 archive／月份 MUST 顯示 25% 淺色，不得用 active collection 覆蓋提前標成實心。
  - 有 E backlog 的月份，只有本次 run 實際 `processed >= total` 時，R／E 才轉為實心完成。
- A 分格 MUST 使用 active collection 的月份覆蓋；沒有 active 覆蓋時使用 baseline 進度。A 與 R／E 是不同來源，不得互相填入。
- `runtime.active_archive_coverage` MAY 用於 A、無 E backlog 的未變更月份與 sidebar backlog 計算，但 MUST NOT 用來把仍有 E backlog 且尚未處理的 R／E 標成完成。
- `currentComplete = processed >= total` 用於仍有 E backlog 月份的 R／E 完成判定。
- `_merge_prior_index_runtime()` 會在續跑時恢復相同版本的 R／E counters；不得因 resume 把已完成月份顯示成空白。

### 5.3 Summary 統計

- A 基線月份：A 分格完成（active collection 已覆蓋）的月份數；不得以 R 完成數代替。
- R 完成月份：基線 archive 已完成且可沿用的月份數；包含 latest archive 已完整覆蓋、無 E backlog 的未變更月份，以及本次 run 已完成的 E backlog 月份。
- R 未完成月份：仍有 E backlog 且 R 尚未完成的月份數。
- E 完成月份：latest archive 已完整覆蓋、無需新 embedding 的月份數；包含未變更月份。
- E 未完成月份：latest archive 仍有待補新 embedding 的月份數。
- 總月份：時間表涵蓋的 `YYYYMM` 月份數。
- Summary 的 R／E MUST 與時間表方塊使用同一份狀態；不得另外用一套公式計算。
- Sidebar 的 E 待補 badge 以 E 未完成 backlog 月份計，與 summary 的 E 未完成月份一致；不得使用本次 run 尚未掃到所造成的暫時 0% 當成 backlog。

**單位 MUST 是月份，不是 RAR 檔數。**

### 5.4 計算責任與一致性

A／R／E 有兩個不同用途，MUST 分開計算，不得互相代替：

| 用途 | 計算來源 | 可使用的資料 | 不得使用 |
| --- | --- | --- | --- |
| 時間表方塊與 summary | `processing.js` `indexMonthGridMarkup()` | A：`active_coverage`；R／E：無 E backlog 月份用 active 覆蓋，有 E backlog 月份用本次 run `months[].processed / total` | 用 active 覆蓋填有 E backlog 的 R／E |
| Sidebar／workflow 待補 badge | 後端 `_index_month_are()`／`_index_month_counts()` | latest archive 仍有新 embedding 的 E backlog 月份 | 本次 run 尚未掃到造成的暫時 0% |

- 時間表的 A／R／E summary MUST 由畫面同一批 `activeState`／`reuseState`／`embedState` 聚合；A 數量 MUST 使用 `activeState.complete`，不得使用 `reuseState.complete`。
- 後端 `_index_month_are()` 是 backlog 計算，MUST NOT 用來取代時間表方塊的 E backlog 判斷；前端判斷 `latestActiveComplete` 後，才決定 R／E 是否可用 active 覆蓋。
- 若未來把時間表計算移到後端，MUST 同時提供「時間表顯示狀態」與「E backlog」兩個獨立 payload／函式，不得共用同一份 counts。
- 任何 A／R／E 顯示變更 MUST 同時更新本規格、`progress-visualization.md` 與對應測試；只改 CSS 或只改其中一個計算來源不算完成。

回歸案例：

- 201805 只有一個 archive，latest active 19,705 / 19,705 = 100%、本次 run 0% → 無 E backlog，R／E MUST 為實心完成。
- 202608 latest archive active 14 / 1,232（1.1%）、本次 run 0% → 有 E backlog，R／E MUST 為 0% 淺色，不得實心。
- 202512 latest archive 只有 3 筆、active 0 / 3 → 雖 baseline 36,971 / 36,971 已覆蓋，仍有 E backlog，R／E MUST 為 0% 淺色；202512 之前的無 backlog 月份則維持實心。
- 202607 本次 run processed 68.9% → R MUST 為 68.9% 實色 + 31.1% 淺色。
- 202609 active 0%、本次 run 0% → A／R／E 均為 0% 淺色，不是實心也不是無資料空心。
- Summary `A 基線月份` MUST 以 A 完成數計算；不得再出現「A 367、E 待補 42」這種由 R 完成數冒充 A 的矛盾。

---

## 6. 更新檔案與未變更判決

### 6.1 `source_archive` 的寫入規則

`apply_versioned_batch()` 對判決的處理：

- `added`：新判決，寫入本次 `source_archive`。
- `modified`：內容變更，寫入本次 `source_archive`。
- `restored`：恢復為 current，保留／更新對應 archive。
- `unchanged`：內容與目前版本相同，**不更新 `source_archive`**，只更新 `last_seen_snapshot_id`、`issue_month`。

因此：

- 新下載的 RAR 檔即使存在，若其中判決全部是 `unchanged`，那些判決仍掛在舊的 `source_archive`。
- 這些判決已存在於 active collection，索引可直接沿用，不需要重新 embedding。
- 它們不會被列為最新 archive 的 E 未完成。
- 因此 coverage-only 的 latest archive 是從 `runtime.months` 的 `source_archive` rows 選出，不是從 `raw_rar` 檔案清單選出；全部 `unchanged` 的新 RAR 不會出現在月份表，也不會被算成 E 未完成。

### 6.2 94 個檔案只有 42 個未完成的原因

- 94 是「本次更新的 RAR 檔數」。
- 時間表以「月份」為單位，且同一月份可以有多個 archive。
- 只有實際 `added`／`modified` 的判決會掛到最新 archive。
- 若新 RAR 內全部是 `unchanged`，該月份不會產生新的 E 待辦。
- 因此：

```text
RAR 檔數 ≠ 待索引月份數
E 未完成 = 最新 archive 尚未完成的「月份數」
```

實務範例（2026-11-19 快照）：

- 11/15、11/16 共 94 個 RAR。
- 56 個月份有實際新增／變更判決。
- 42 個月份的最新 archive 尚未完成 E。
- 其餘 38 個 RAR 內容未變更或已被沿用，不列為未完成。

---

## 7. UI 契約

### 7.1 月份 cell

- 中性底色，不使用整格綠／紅／灰狀態背景。
- 三個分格：A（綠）、R（藍）、E（紫）。
- 每個分格 MUST 明確標記 `is-complete`／`is-incomplete`／`is-empty`，不得只依 `--fill:0%` 的預設背景判定狀態。
- 完成：100% 實心。
- 未完成：未完成區段 25% 淺色 + 同色外框；`25% 淺色` 是狀態色，不是固定 25% 進度。
- `--fill: 0%` 時整格皆為 25% 淺色；`--fill: N%` 時 0–N% 為完成色實心、N–100% 為同色 25% 淺色。
- 執行中：完成色進度條，未完成區段 25% 淺色。
- 無資料：淡色空心，不是 25% 淺色；只有 total=0／沒有 archive 才算無資料。
- A／R／E 可以同時為 25% 淺色（例如新月份尚無 active baseline，且本次 run 尚未處理）；只要該月 total>0，就屬未完成，不是無資料。
- 目前索引月份：實線 accent 外框，padding 不使用狀態底色，無脈動動畫。
- Build mode 的 latest archive 若已被 active collection 完整覆蓋（無 E backlog），R／E MAY 使用 active 覆蓋顯示完成；仍有 E backlog 的月份，R／E MUST 使用本次 run 的 `processed / total`，不得以 active 覆蓋提前標成完成。
- 仍有 E backlog 且尚未處理的月份 MUST 顯示 25% 淺色；目前 run 進行中的 R／E 分格 MUST 顯示「已完成比例實色 + 其餘 25% 淺色」；run 停止／stale 後仍保留該 run 最後的 `processed / total`，不得回退成 active 100% 完成。
- 綠框只代表目前批次所在月份，不代表該月已完成；目前月份 MUST NOT 因綠框或 active 覆蓋而被算入「已處理月份」。

### 7.2 Summary

固定顯示：

```text
A 基線月份
R 完成月份
R 未完成月份
E 完成月份
E 未完成月份
總月份
```

- 標籤與 tooltip MUST 明示「以月份計，不是 RAR 檔數」。
- 不得使用彩色 badge 作為唯一狀態來源。

### 7.3 Tooltip

Coverage-only 月份 tooltip MUST 顯示：

- 最新 archive 的 `processed / total`。
- A／R 基線 `processed / total`。
- E 新 embedding `processed / total`。
- 待完成 E 時顯示「待完成：E 新 embedding」。
- 目前索引月份顯示「目前索引」或「最後索引」。

### 7.4 更新提示與 badge

E 待補月份（active collection 與各月份 latest archive 的覆蓋比對）MUST 被視為此 workflow 的待更新工作，不能只在時間表顯示而沒有其他入口提示。此處 backlog 與時間表本次 run 的 E 未完成進度不同：badge 不受目前 run 是否已掃到該月份影響。

後端 `index_versions` workflow entry MUST 提供：

| 欄位 | 值 |
| --- | --- |
| `pending_count` | E 待補月份數（active 覆蓋 backlog） |
| `update_available` | `E 待補月份數 > 0` |
| `update_count` | E 待補月份數（active 覆蓋 backlog） |
| `update_origin` | `Qdrant／PostgreSQL` |
| `update_mechanism` | active collection 與各月份最新 archive 的覆蓋比對；只計算 E 未完成月份 |
| `update_message` | `待建立 N 個月份的新 embedding` |

`pending_count`、`update_count` 與 badge 數字 MUST 以月份為單位，不得使用 RAR 檔數、Qdrant point 數或 `index_backlog` 筆數。

前端 MUST 在下列位置顯示更新提示：

- 資料處理 workflow 側邊清單的 `index_versions` 按鈕：顯示 refresh icon 與 E 未完成月份數。
- Qdrant workflow 面板上方：顯示更新提示、偵測機制、月份數與「更新」按鈕；按鈕啟動 `index_versions` workflow。
- 全站左側「資料處理」導覽：顯示更新 badge。
- 更新 badge 的 tooltip MUST 說明是「Qdrant 向量索引待補 N 個月」。

後端 snapshot MUST 在 `capabilities.index_pending_months` 提供相同月份數。`/api/updates/status` MUST 從 processing snapshot cache 回傳 `index_pending_count`，讓全站 sidebar 在未開啟資料處理頁時也能顯示 badge；processing 頁載入新 snapshot 時 MUST 以 `judgment:processing-pending` 事件同步 `index_pending`。

### 7.5 目前處理列

`index-current-row` MUST 在月份、archive 之後顯示本批次的 R／E 動作，不能只顯示 archive 與 JID 而讓使用者猜測目前是在沿用向量或計算新 embedding。

- 後端 `index_runtime.current` MUST 提供 `reused`、`embedded` 與 `phase`。
- `phase` 值為 `reuse`（本批全部沿用）、`embed`（本批全部新 embedding）、`mixed`（兩者都有）或 `embedding`（正在計算新 embedding 的瞬時狀態）。
- 前端 MUST 依序顯示非零的 R／E chip：
  - R chip：藍色，文字 `R 沿用 N 筆`。
  - E chip：紫色，文字 `E 新 embedding N 筆`；`phase=embedding` 且 run 仍在執行時顯示 `E 計算中 N 筆`。
- 混合批次 MUST 同時顯示 R 與 E chip；不得只顯示累計 `summary.reused`／`summary.embedded` 而沒有本批動作。
- A 是 active collection 的基線覆蓋，不是批次動作；目前處理列 MUST NOT 以 A chip 假裝正在執行 A。
- chip 的 tooltip MUST 說明動作語意與本批筆數。
- 目前處理列仍 MUST 保留月份、archive、JID、法院／案由與批次筆數；390px viewport MUST 可換行且無水平溢出。

### 7.6 llama-server 主機／模型入口

索引卡片 MUST NOT 重複顯示第二份 llama-server 主機 strip。全站唯一的主機／模型入口是 workflow 執行資訊卡片中的「Embedding 主機／模型」selector；端點、優先順序、chip 狀態與命名依 [`../010-llama-server-runtime/spec.md`](../010-llama-server-runtime/spec.md)。

- 索引 runtime 卡片只保留索引版本、collection、模式、目前處理列、A／R／E 時間表與 metrics。
- 索引卡片 MUST NOT 再顯示 `index-host-strip`、「llama-server 連線測試」或另一份主機／模型 chips。
- 主機／模型異動仍由「Embedding 主機／模型」的「檢查模型」與可點選 chip 完成；不另設 live probe endpoint。

### 7.7 Pipeline 準備階段與 A／R／E

- 「複製可重用向量」是版本準備階段（準備中）；在 copy 完成前，「金融判決向量索引」階段 MUST 顯示為等待，不得同時顯示兩個執行中階段。
- copy 階段明細 MUST 顯示已複製／總 points、複製速度與預估剩餘時間。
- 索引階段明細 MUST 顯示本次 run 的 R／E 計數、目前月份與預估剩餘時間。
- A／R／E 是同一批掃描中的並行分類，MUST NOT 被拆成 waterfall 的 sequential 子階段；A 是 active 月份基線，不是「準備中」的一部分。
- 若 A／R／E 要做成視覺小格，只能放在索引階段內部的並行 sub-progress，不得改變 6 個 sequential 階段的順序與時間軸。

---

## 8. 快取與 SSE

- Coverage-only payload 快取 60 秒（`_INDEX_MONTH_CACHE`）。
- Build mode 由 processing state／SSE 更新；不得以固定前端 polling 取代。
- 初次載入由 processing topic 推送完整 snapshot；後續以 live payload 更新。
- A／R／E 的計算必須在後端或同一份 runtime payload 中完成，不得由前端混用不同來源的 total／processed。
- `capabilities.index_pending_months` 寫入 processing snapshot cache；`/api/updates/status` 的 `index_pending_count` 由該 cache 讀取，避免每次 sidebar badge 更新都查詢 Qdrant／PostgreSQL。
- 資料處理頁收到新 snapshot 時 MUST 同步 `judgment:processing-pending` 事件的 `index_pending`，讓全站 sidebar badge 立即更新。

---

## 9. 邊界條件

- 同月份只有一個 archive：baseline = latest；A／R／E 皆使用該 archive。
- 同月份有多個舊 archive：baseline 為所有舊 archive 的總和；latest 仍為最新 archive。
- `total = 0`：該分格視為無資料，不得假設 100%。
- `processed > total`：clamp 至 100%。
- 沒有 `active_coverage`：A／R 使用 baseline archive；不得顯示 0% 卻聲稱完成。
- 沒有 `source_archive` 月份：空白 cell，不列入 A／R／E counts。

---

## 10. 驗收清單

- [ ] 同一月份多個 archive 時，E 只使用最新 archive，不與舊 archive 相加。
- [ ] 舊 archive 作為 A／R 基線；已完成時為實心，不是 25% 淺色。
- [ ] latest archive 無 E backlog 的未變更月份（例如 201805）R／E 為實心，即使本次 run 尚未處理。
- [ ] latest archive 仍有 E backlog 的月份（例如 202607／202608）R／E 使用本次 run 進度；尚未處理時為 25% 淺色。
- [ ] A 基線月份以 A 分格完成數計算，不得用 R 完成數代替。
- [ ] Summary 的 R／E 與時間表方塊一致；sidebar E badge 與 summary E 未完成一致。
- [ ] 每個 A／R／E 分格有明確完成／未完成／無資料狀態，不以 0% fill 的預設色冒充未完成。
- [ ] 新 RAR 全部 unchanged 時，不會產生新的 E 未完成月份。
- [ ] Summary 標籤明確標示「月份」，不是 RAR 檔數。
- [ ] E 未完成月份會在 workflow 側邊清單、workflow 面板與全站「資料處理」導覽顯示更新 badge。
- [ ] Qdrant workflow 面板上方有更新提示與「更新」按鈕。
- [ ] `/api/updates/status` 回傳 `index_pending_count`，且與 E 未完成月份數一致。
- [ ] Coverage-only 沒有 run 時仍能顯示正確 A／R／E。
- [ ] Build mode 續跑能恢復 R／E counters。
- [ ] 目前索引月份只有實線外框，無脈動動畫。
- [ ] 目前處理列顯示本批 R／E chip；全部沿用時只顯示 R，含新 embedding 時顯示 E，混合時兩者都顯示。
- [ ] 正在處理的 archive 其 R／E 分格使用本次 run 進度，不得被 active 100% 覆蓋提前畫成整格實心。
- [ ] 正在處理的 R／E 分格為「已完成比例實色 + 其餘 25% 淺色」，停止後保留最後進度。
- [ ] 0% 未完成分格整格為 25% 淺色，不是空心；只有 total=0／無 archive 才是空心。
- [ ] A／R／E 同時為 25% 淺色時，tooltip 顯示各自 0/total 與「未完成」，不得顯示「無資料」。
- [ ] 正在計算新 embedding 時，目前處理列的 E chip 顯示「計算中」。
- [ ] 索引 runtime 卡片不得出現第二份主機／模型 strip。
- [ ] 新 run 由最舊月份開始，runtime.scan_order 為 `issue_month`；舊 in-flight run 顯示 ID 順序說明。
- [ ] 續跑使用 `(last_indexed_month, last_indexed_id)`，不得漏月份。
- [ ] 390px 無水平溢出。
- [ ] Tooltip 顯示最新 archive、A／R 基線與 E 進度。

---

## 11. 變更記錄

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-11-19 | 建立 Qdrant 判決向量索引版本建置規格：archive 最新版判斷、A／R／E 基線與 E 分離、unchange 判決不更新 source_archive、月份 vs RAR 檔數、coverage-only／build mode 與 UI 契約。 |
| 1.1 | 2026-11-19 | 新增 E 未完成月份驅動的更新提示：workflow badge、workflow 面板更新按鈕、全站資料處理 sidebar badge、`index_pending_count` 與 snapshot 快取契約。 |
| 1.2 | 2026-11-19 | 修正 build mode A／R／E：以 active archive 覆蓋補上本次 run 尚未處理的未變更月份，完成分格必為實心；A／R／E 分格加上明確完成／未完成／無資料狀態，不再以 0% fill 顯示 25% 淺色。 |
| 1.3 | 2026-11-19 | 目前處理列新增本批 R／E chip（含 embedding 計算中狀態）；llama-server 連線測試改為與 Embedding 主機／模型相同的 compact chip strip。 |
| 1.4 | 2026-11-19 | 全站可見文字由 Ollama 改為 llama-server；非執行中 run 顯示目前設定的即時主機測試，x570 為 primary、MBP 為 fallback。 |
| 1.5 | 2026-11-19 | 將 llama-server 執行環境、主機優先順序與全站顯示契約抽出為 spec 010，本規格改為引用該 canonical source。 |
| 1.6 | 2026-11-19 | 修正 build mode 目前批次 archive 的 R／E 顯示：不得以 active 100% 覆蓋提前標成完成，必須顯示本次 run 的實色進度與 25% 淺色未完成區段。 |
| 1.7 | 2026-11-19 | 澄清 25% 淺色是未完成區段狀態色，0% 時整格為淺色；A／R／E 可同時淺色，只有 total=0／無 archive 才是無資料空心。 |
| 1.8 | 2026-11-19 | 將 build mode 的 R／E 統一改為本次 run 進度，不再以 active 覆蓋提前標成完成；A 只使用 active 覆蓋，summary R／E 與方塊一致，sidebar badge 維持 active backlog。 |
| 1.9 | 2026-11-19 | 新增計算責任與一致性專節：時間表與 backlog badge 分開計算，summary 與 cell 同源，A 不得用 R 完成數；補 202607／202608／202609 回歸案例。 |
| 1.10 | 2026-11-19 | 補回「無 E backlog 的未變更月份可用 active 覆蓋顯示實心」規則；仍有 E backlog 的月份才使用本次 run 進度，避免舊月份被全部畫成淺色。 |
| 1.11 | 2026-11-19 | 移除索引 runtime 卡片重複的 llama-server 主機 strip；主機／模型只保留執行資訊卡片的 Embedding selector，live probe endpoint 同步移除。 |
| 1.12 | 2026-11-19 | 明訂索引掃描依 JudgmentDocument.id（匯入順序），不是月份順序；綠框只標示目前批次月份，並在 UI 加上對應提示。 |
| 1.13 | 2026-11-19 | 新索引版本改為依 issue_month 由舊到新掃描，同月依 id；新增 last_indexed_month cursor 與 runtime.scan_order；舊 in-flight 版本保留原 ID 順序完成。 |
| 1.14 | 2026-11-19 | 準備中 current 預覽改用與實際批次相同的月份 cursor，修正 v7 copy 期間綠框停在 202601 的預覽錯誤。 |
| 1.15 | 2026-11-19 | 明訂 copy 是版本準備階段，索引階段需等待；新增 copy／index ETA 與 A／R／E 並行子進度規則。 |
