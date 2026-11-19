# Progress Visualization 圖表規格

**Status**: Active（canonical component spec）

**Version**: 1.0

**Last Updated**: 2026-11-19

**Applies To**: 全站所有以「階段進度」呈現的月份方格、workflow waterfall bar、index waterfall bar 與等待軌道，包含 `#/processing` 的判決匯入、判決下載、判決／法規／命令時間表、判決向量索引 Pipeline、workflow 流程進度，以及未來新增的任何階段進度圖。

**Parent Specification**: [`spec.md`](spec.md)

**Related Specification**: [`pipeline-waterfall.md`](pipeline-waterfall.md)（時間軸、slot、展開明細與 hover 契約）

---

## 1. 目的

本規格定義全站階段進度圖的唯一視覺與資料契約，避免同一個階段在不同頁面使用不同深淺、不同填充方式或不同狀態 class。

核心原則只有一條：

> **未完成區段永远是該階段顏色的 25% 淺色；進度填充永遠是該階段的完成色；完成就是 100% 實心。**

因此同一個階段在 waiting、running、complete 之間只改變「完成色填充的比例」，不改變背景語意，也不使用另一套淡色或灰色進度條。

---

## 2. 適用範圍

### 2.1 MUST 使用本規格

- `#/processing` 判決匯入四階段月份時間表：
  - RAR 檢查／解壓縮
  - 原始資料檢查／Parquet 備份
  - 金融法規篩選
  - PostgreSQL metadata
- `#/processing` 判決下載、判決處理、法規處理、命令處理月份時間表。
- `#/processing` 法規／命令索引版本時間表（D／P／I）。
- `#/processing` 判決向量索引 Pipeline 與 workflow 流程進度 waterfall。
- `#/processing` Qdrant A／R／E 月份覆蓋圖的填充區段。
- 任何新增的 stage progress cell、month cell 或 filled／hollow waterfall bar。

### 2.2 不適用

- 只有耗時、沒有完成比例概念的純 duration bar（例如 RAG Pipeline 的 span bar）。
- 服務狀態、統計長條圖、靜態架構圖。
- 「無資料／已取代」的淡色空心外框；此狀態不是未完成，而是沒有可計算的進度。
- 整體流程的 aggregate progress bar（例如「整體進度 59.9%」），其填色為 aggregate gradient，不是單一階段色。

---

## 3. 名詞

| 名詞 | 定義 |
| --- | --- |
| Stage color | 該階段的完成色，透過 `--block-color` 或 `--bar-color` 傳入。 |
| Pending | 尚未開始，或本次更新尚未輪到；完成比例為 0%。 |
| Running | 正在處理；有 `percent` 或 `current / total`。 |
| Partial | 已有部分處理結果，但尚未完成；沿用 running 的填充規則。 |
| Complete | 完成比例 100%，整段實心。 |
| Empty | 沒有資料、已取代或略過；不適用 25% 規則。 |
| Fill | 由下往上（月份方格）或由左往右（waterfall）的完成色區段。 |
| Unfilled | 尚未完成的比例區段，固定使用 25% 淺色。 |

---

## 4. 共同規則（MUST）

1. **未完成區段**：該階段顏色的 `25%` 淺色。
2. **進度填充**：直接使用該階段的完成色 `var(--block-color)` 或 `var(--bar-color)`。
3. **完成**：`100%` 實心，顏色與進度填充完全一致。
4. **狀態 class**：`is-pending`、`is-running`、`is-complete`、`is-partial`、`is-incomplete`、`is-empty`。
5. **CSS 選擇器**：所有階段共用同一組 generic selector，不得為單一階段複製另一套進度樣式。
6. **SSE／即時更新**：進度資料必須經由同一份 state／SSE 契約傳遞，不得讓某一階段自行使用不同的輪詢或事件格式。

### 4.1 顏色公式

```css
/* 未完成／等待區段 */
background: color-mix(in srgb, var(--block-color) 25%, transparent);

/* 進度填充 */
background: var(--block-color);

/* 完成 */
background: var(--block-color);
```

waterfall 的 hollow bar 使用：

```css
border: 1px solid var(--bar-color, var(--stage-color));
background: color-mix(
  in srgb,
  var(--bar-color, var(--stage-color)) 25%,
  transparent
);
```

### 4.2 垂直月份方格

```css
background: linear-gradient(
  to top,
  var(--block-color) var(--stage-progress, 0%),
  color-mix(in srgb, var(--block-color) 25%, transparent)
    var(--stage-progress, 0%)
);
box-shadow: inset 0 0 0 1px var(--block-color);
```

- 0%：只看到 25% 淺色底。
- 37%：下方 37% 為完成色，上方 63% 為 25% 淺色。
- 100%：完成色填滿，視覺上等於 `is-complete`。

### 4.3 水平 waterfall bar

```text
fillWidth   = slotWidth * clamp(percent, 0, 100) / 100
unfilled    = slotWidth - fillWidth
```

- `fillWidth` 使用完成色。
- `unfilled` 使用同色 25% 淺色 + 1px 同色外框。
- 不得使用透明背景的空心 bar 取代未完成區段。
- 不得使用灰色 track 直接代表未完成區段。

---

## 5. 狀態對照

| 狀態 | class | 未完成區段 | 填充 | 完成 |
| --- | --- | --- | --- | --- |
| 待更新／等待 | `is-pending` | 25% 階段色 | 無 | 否 |
| 執行中 | `is-running` | 25% 階段色 | 完成色，依 `--stage-progress` 增加 | 否 |
| 部分完成 | `is-partial` | 25% 階段色 | 完成色，依 `--stage-progress` 增加 | 否 |
| 完成 | `is-complete` | 無 | 100% 完成色 | 是 |
| 未完成 | `is-incomplete` | 25% 階段色 + 同色外框 | 無 | 否 |
| 無資料／已取代 | `is-empty` | 淡色空心外框 | 無 | 不適用 |

`is-incomplete` 與 `is-pending` 使用相同的 25% 底色與外框，差別只在資料語意（待更新 vs 未完成），不是視覺深淺。

---

## 6. 元件對照

### 6.1 月份方格

- Selector：`.processing-month.index-month .processing-month-stage`
- 變數：`--block-color`、`--stage-progress`
- 階段色：
  - RAR：`#f59e0b`
  - Parquet：`#ec4899`
  - 金融法規篩選：`#a78bfa`
  - PostgreSQL：`#3b82f6`
- 不可為 `is-filter`、`is-postgres` 另外設定不同的填充深淺。

### 6.2 Workflow／Index waterfall

- Selector：`.workflow-wf-bar`、`.index-wf-bar`
- 變數：`--bar-color`、`--stage-color`
- `is-hollow` 必須是 25% 同色底 + 1px 同色外框。
- 等待階段的 track 使用 25% 階段色；`is-skipped`／`is-idle` 可降低透明度，但不得使用與完成色無關的灰色進度填充。

### 6.3 A／R／E 月份覆蓋

- Selector：`.index-month-block`
- 變數：`--block-color`、`--fill`
- `--fill` 為完成比例；`100%` 時實心，未滿時上方為 25% 同色淺色。
- `is-incomplete` 使用 25% 同色底 + 同色外框，不得使用與階段色無關的白色或灰色背景。

### 6.4 月份框線

- 實線框：目前匯入的外框月份（最高已啟動且尚未完成的月份），使用 `var(--accent)`。
- 虛線框：實際正在處理的月份，使用 `var(--info)`。
- 兩者皆為 `2px` outline、`outline-offset: -3px`；只有顏色與線型不同，幾何必須一致。
- 當金融法規篩選重新走訪較舊 archive 時，虛線月份可能與實線外框月份不同；此為刻意設計，避免外框在篩選舊月份時往回跳動。
- 同一個月份同時符合兩者時，只顯示實線外框，不疊加兩套框線。
- 圖例 MUST 顯示「目前匯入（實線）」與「實際處理（虛線）」。

### 6.5 圖例

- `is-hollow-state` 必須顯示 25% 同色淺色 + 外框，不得顯示透明空心。
- `is-pending-state` 使用四階段顏色的 25% 淺色示意。
- 圖例文字必須明確標示「25% 淺色」或「完成色進度條」，不得只靠顏色。

---

## 7. 資料與 SSE 契約

### 7.1 月份方格

- 狀態來源：`import_timeline.months[].import_stages`。
- 進度來源：`import_timeline.months[].import_stage_progress`。
- 每一階段的狀態值：`pending`、`processing`、`complete`、`incomplete`。
- `processing` 必須有 `0–100` 的百分比；沒有百分比時只能顯示 0%，不得假設完成。

### 7.2 Workflow waterfall

- 階段資料：`workflow.progress.stages[]` 的 `status`、`current`、`total`、`percent`。
- `percent = current / total * 100`，並 clamp 至 `0–100`。
- 若 `percent` 不可得，顯示 25% 淺色 bar 與 `—`／「進度未知」。

### 7.3 SSE

- 初次載入：`processing` topic 推送完整 snapshot。
- 後續更新：`processing` topic 的 live payload 更新 `workflow.progress` 與 `import_timeline_months`。
- importer `progress` event 的 `percent` 是**全域 pipeline percent**，只用於 workflow 階段進度，MUST NOT 寫入月份方格的 `import_stage_progress`；否則會與 processing snapshot 的 archive-level percent 使用不同分母，造成同一方格來回跳動。
- 月份方格的 `import_stage_progress` MUST 只使用 processing snapshot／state 中該 archive 的 `current / total`。
- 同一階段不得另建第二套事件格式或前端輪詢。

---

## 8. 反模式（MUST NOT）

- 使用 `--stage-mix` 或任何方式把進度填充調淡；進度填充必須等於完成色。
- 未完成區段使用 `transparent`、`--surface-3`、`--bg` 或灰色底。
- 為 RAR／Parquet 使用一套進度邏輯，為 filter／PostgreSQL 使用另一套。
- 把 `is-incomplete` 畫成透明空心框，但把 `is-pending` 畫成 25% 淺色。
- 等待階段沒有 bar，只留灰色 track，讓使用者無法看出階段顏色。
- 以固定 `42%`、`48%`、`74%` 等淡色填充 running 區段。
- 不同頁面各自複製一套 progress CSS。
- 只靠顏色表達狀態；狀態仍必須有文字、`aria-label` 或 tooltip。

---

## 9. 驗收清單

- [ ] 四階段 pending 底色皆為該階段色的 25%。
- [ ] 四階段 running 填充皆為完成色，未完成區段為 25% 淺色。
- [ ] 四階段 complete 皆為 100% 實心，顏色與填充一致。
- [ ] filter／PostgreSQL 與 RAR／Parquet 使用相同的 CSS selector 與 class。
- [ ] waterfall `is-hollow` 為 25% 同色底 + 1px 外框，不是透明。
- [ ] A／R／E 未完成區段為 25% 同色底，不是白色或灰色。
- [ ] 圖例顯示 25% 淺色與完成色進度條。
- [ ] SSE 更新後進度條立即反映 `percent`，不需要重新載入。
- [ ] 淺色／深色主題皆可辨識。
- [ ] 390px 無水平溢出。

---

## 10. 參考實作

- `src/judgment/web/static/assets/styles.css`
  - `.processing-month.index-month .processing-month-stage.is-pending`
  - `.processing-month.index-month .processing-month-stage.is-running`
  - `.processing-month.index-month .processing-month-stage.is-complete`
  - `.processing-month.index-month .processing-month-stage.is-partial`
  - `.processing-month.index-month .processing-month-stage.is-incomplete`
  - `.index-month-block`
  - `.index-wf-bar.is-hollow`
  - `.workflow-wf-bar.is-hollow`
  - `.workflow-wf-stage.is-pending .rag-wf-track`
  - `.index-wf-stage.is-pending .rag-wf-track`
- `src/judgment/web/static/assets/js/pages/processing.js`
  - `timelineMonthCellMarkup()`
  - `importTimelineMarkup()`
  - `workflowProgressMarkup()`
  - `indexWorkflowProgressMarkup()`
  - `applyProgressEvent()`
- `src/judgment/web/processing.py`
  - `_merge_import_timeline_stages()`
  - `_live_import_month_updates()`

---

## 11. 變更記錄

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-11-19 | 建立全站階段進度規格：25% 未完成淺色、完成色進度填充、100% 實心、統一 class／CSS／SSE 契約；涵蓋月份方格、waterfall hollow bar、A／R／E 與等待軌道。 |
