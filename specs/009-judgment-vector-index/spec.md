# Qdrant 判決向量索引版本建置規格

**Status**: Active（canonical feature spec）

**Version**: 1.0

**Last Updated**: 2026-11-19

**Applies To**: `#/processing` 的「Qdrant判決向量索引版本建置」workflow、索引檔案時間表（A／R／E）、覆蓋率模式（coverage-only）、建置模式（build mode）與相關 SSE／快取。

**Parent Specification**: [`../004-web-console/spec.md`](../004-web-console/spec.md)

**Related Specifications**:

- [`../004-web-console/progress-visualization.md`](../004-web-console/progress-visualization.md)（25% 未完成淺色、完成色填充、月份框線）
- [`../004-web-console/pipeline-waterfall.md`](../004-web-console/pipeline-waterfall.md)（索引 pipeline waterfall）

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

### 3.3 後端函式

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

- Runtime `months[].reused`、`embedded`、`processed`、`total` 來自 `_month_runtime_rows()` 與 run checkpoint。
- `kind = embed`：E 分格使用該月 `processed / total` 或 `embedded / total`。
- `kind = reuse`：R 分格使用該月 `processed / total` 或 `reused / total`。
- `currentComplete = processed >= total`。
- `_merge_prior_index_runtime()` 會在續跑時恢復相同版本的 R／E counters；不得因 resume 把已完成月份顯示成空白。

### 5.3 Summary 統計

- A 基線月份：baseline archive 完成的月份數。
- R 完成月份：baseline archive 完成且可沿用的月份數。
- R 未完成月份：baseline archive 尚未完成的月份數。
- E 完成月份：latest archive 已完成的月份數。
- E 未完成月份：latest archive 尚未完成的月份數。
- 總月份：時間表涵蓋的 `YYYYMM` 月份數。

**單位 MUST 是月份，不是 RAR 檔數。**

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
- 完成：100% 實心。
- 未完成：25% 淺色 + 同色外框。
- 執行中：完成色進度條，未完成區段 25% 淺色。
- 目前索引月份：實線 accent 外框，padding 不使用狀態底色，無脈動動畫。

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

---

## 8. 快取與 SSE

- Coverage-only payload 快取 60 秒（`_INDEX_MONTH_CACHE`）。
- Build mode 由 processing state／SSE 更新；不得以固定前端 polling 取代。
- 初次載入由 processing topic 推送完整 snapshot；後續以 live payload 更新。
- A／R／E 的計算必須在後端或同一份 runtime payload 中完成，不得由前端混用不同來源的 total／processed。

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
- [ ] 新 RAR 全部 unchanged 時，不會產生新的 E 未完成月份。
- [ ] Summary 標籤明確標示「月份」，不是 RAR 檔數。
- [ ] Coverage-only 沒有 run 時仍能顯示正確 A／R／E。
- [ ] Build mode 續跑能恢復 R／E counters。
- [ ] 目前索引月份只有實線外框，無脈動動畫。
- [ ] 390px 無水平溢出。
- [ ] Tooltip 顯示最新 archive、A／R 基線與 E 進度。

---

## 11. 變更記錄

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-11-19 | 建立 Qdrant 判決向量索引版本建置規格：archive 最新版判斷、A／R／E 基線與 E 分離、unchange 判決不更新 source_archive、月份 vs RAR 檔數、coverage-only／build mode 與 UI 契約。 |
