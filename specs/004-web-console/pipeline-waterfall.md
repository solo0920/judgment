# Pipeline Waterfall 圖表規格

**Status**: Active（canonical component spec）

**Version**: 1.6

**Last Updated**: 2026-11-19

**Applies To**: 所有以時間軸呈現 pipeline／flow 執行順序的視圖，包含 `#/rag` 回答底部與後端處理流程、`#/performance` 的 RAG Pipeline、效能 Flow、測試 Flow、`#/processing` 的判決向量索引 Pipeline、判決匯入與下載 workflow 流程進度、`#/status` 的服務總覽載入 Pipeline、`#/home` 的即時摘要載入 Pipeline，以及未來新增的任何 pipeline waterfall。

**Related Requirements**: FR-119、FR-120、FR-121、FR-147、FR-155、FR-162、FR-166、FR-167、FR-168、SC-075、SC-084、SC-085、SC-090

**Parent Specification**: [`spec.md`](spec.md)

**Visual Reference**: `#/performance` 的 RAG Pipeline waterfall。判決向量索引 Pipeline 是「接續階段 + 部分完成 + 25% 淺色未完成 bar」的參考實作。

**Related Specification**: [`progress-visualization.md`](progress-visualization.md)（全站階段進度的 25% 淺色、完成色填充與狀態 class 契約）

---

## 1. 目的

本規格定義全站 Pipeline Waterfall 的唯一視覺、資料與互動契約，讓不同頁面、不同 pipeline 都以相同方式呈現：

- 每個階段在共用時間軸上的實際位置。
- 階段之間的接續關係：上一階段結束即下一階段開始。
- 已完成、進行中、未完成、等待與略過階段的 bar 語意。
- 短階段在長時間軸上仍可辨識，且不與相鄰階段重疊。
- 可展開明細、hover 資訊卡、即時更新與行動版行為。

未來新增 pipeline waterfall 時 MUST 依本規格建置，不得各自建立不同的視覺語言。

---

## 2. 適用與不適用範圍

### 2.1 MUST 使用本規格

- RAG 查詢的 Parsing／Embedding／Qdrant／Reranker／Context／LLM／Response 流程。
- 判決向量索引的 Ollama 測試／Blue-Green 版本／向量複製／金融判決索引／驗證／alias 切換流程。
- 效能報表的 Flow 紀錄與測試 Flow。
- `#/status` 的服務總覽載入 Pipeline。
- `#/home` 的即時摘要載入 Pipeline：`/api/home` 的法規／命令統計、金融判決統計、原始 manifest、判決索引、法規索引、金融法規清單與回應彙整。
- 任何以 waterfall 形式呈現且具有開始時間、結束時間、耗時或進度的 pipeline／workflow 視圖。

### 2.2 不適用

- 靜態架構圖、資料流程圖、服務依賴圖。
- 單純的進度條、月份時間表、統計長條圖。
- 沒有時間或階段順序關聯的卡片列表。

---

## 3. 名詞

| 名詞 | 定義 |
| --- | --- |
| Stage（階段） | Pipeline 中一個具名稱的執行步驟，對應一列 waterfall。 |
| Span | 階段內的一次實際執行區間，具有 offset、duration、status 與 metadata。 |
| Segment | 階段內以不同顏色呈現的連續子區間，例如 Model Load 與推論。 |
| Slot | 階段在視覺時間軸上分配到的位置與寬度；通常等於階段耗時比例。 |
| Track | 每個階段列的完整灰色時間軸底軌。 |
| Bar | 放在 track 上、表示階段或 span 時間區間的色塊。 |
| Filled bar | 以階段顏色填滿的已完成部分。 |
| Hollow bar | 以階段顏色 25% 淺色填充、外加 1px 同色外框的未完成部分。 |
| Axis | Waterfall 頂端的 `0 ms` 至總耗時時間軸。 |
| Details | 點擊階段列後展開的明細區。 |
| Tooltip | 滑鼠移到階段或 bar 上顯示的資訊卡。 |

---

## 4. 圖表結構

由上而下固定為：

```text
0 ms                                              14h 15m 48s
──────────────────────────────────────────────────────────────
[選用] 圖例：已完成／未完成（25% 淺色）／Model Load
──────────────────────────────────────────────────────────────
■ 01  階段名稱                                  67 ms · 完成  >
      階段說明／主機:模型
      [════════ track + bars ═══════════════════════════════]
──────────────────────────────────────────────────────────────
■ 02  階段名稱                            14h 15m · 67.9% · 執行中  >
      階段說明
      [████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░]
──────────────────────────────────────────────────────────────
操作提示：接續排列、未完成 25% 淺色、點擊展開明細
```

### 4.1 Axis

- MUST 顯示左側 `0 ms` 與右側人類可讀的總耗時（例如 `5.7 s`、`14h 15m 48s`）。
- MUST 使用等寬字體，字級約 `8.5px`，顏色使用淡色文字 token。
- Track 的垂直格線 MUST 以 25% 間隔呈現，供視覺對齊；不要求顯示中間刻度文字。

### 4.2 圖例

- 當階段內含多種 bar 顏色（例如 Model Load 的藍色前段與推論的階段色）時，MUST 顯示圖例說明顏色語意。
- 未完成 25% 淺色 bar 的語意 SHOULD 在圖例或操作提示中說明。
- 圖例不得取代階段列的狀態文字；顏色不得是唯一資訊來源。

### 4.3 階段列

每一列 MUST 包含：

- 左側階段色塊（約 `8×8px`，圓角 `2px`）。
- Pipeline 階段編號（`01`、`02`…）；一般 Flow 可省略。
- 階段名稱（粗體）。
- 階段說明、主機／模型或其他副標。
- 右側 metadata：耗時、狀態或百分比、span 數、chevron。
- 下方完整寬度的 track 與 bars。

階段順序 MUST 依 pipeline 執行順序排列，不得依耗時、百分比或名稱排序。

### 4.4 操作提示

Chart 下方 MUST 有一段簡短提示，說明：

- bar 由左至右接續排列，上一階段結束即下一階段開始。
- 已完成階段填滿、未完成部分為同色 25% 淺色。
- 等待與略過階段不繪製 bar。
- 極短階段會以最小可見寬度呈現。
- 點擊階段可展開明細。

---

## 5. 資料契約

前端 waterfall adapter MUST 將後端資料整理為以下欄位。欄位命名可依既有 API 調整，但語意 MUST 一致。

| 欄位 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `key` | string | 是 | 穩定且唯一的階段識別碼；SSE 更新時不得改變。 |
| `label` | string | 是 | 階段名稱。 |
| `caption` / `hint` | string | 否 | 階段說明、參數摘要或資料來源。 |
| `color` | CSS color | 是 | 階段代表色；同一階段在每次 render 必須相同。 |
| `status` | enum | 是 | `pending`、`running`、`success`、`failed`、`stale`、`skipped`。 |
| `started_at` | ISO timestamp | 否 | 階段開始時間。 |
| `finished_at` | ISO timestamp | 否 | 階段結束時間。 |
| `duration_ms` | number | 否 | 階段耗時；執行中可由前端以目前時間延伸。 |
| `percent` | number | 否 | 階段完成百分比，`0`–`100`。 |
| `current` | number | 否 | 已處理數量。 |
| `total` | number | 否 | 總數量。 |
| `unit` | string | 否 | 數量單位，例如 `筆`、`points`、`台`。 |
| `spans` | array | 否 | 階段內的多個實際 span；用於平行 lane 或明細。 |
| `displaySegments` | array | 否 | 階段內要依序繪製的顏色分段，例如 Model Load 與推論。 |
| `details` | array | 否 | 額外的 `[label, value]` 明細。 |
| `message` | string | 否 | 狀態訊息、錯誤原因或目前處理內容。 |

### 5.1 Span 欄位

| 欄位 | 說明 |
| --- | --- |
| `offset_ms` | 相對於 pipeline 開始的位移。 |
| `end_offset_ms` | 相對於 pipeline 開始的結束位移；可由 offset + duration 計算。 |
| `duration` / `duration_ms` | span 耗時。 |
| `status` | span 狀態。 |
| `metadata` | 模型、主機、Token、Batch、Top K、錯誤等。 |
| `params` | 原始參數；供展開明細與 hover 使用。 |

### 5.2 Segment 欄位

| 欄位 | 說明 |
| --- | --- |
| `kind` | `load` 或 `stage`；`load` 使用藍色 `#0ea5e9`。 |
| `label` | 例如 `Model Load`、`LLM 推論`。 |
| `offset` | 相對於 pipeline 開始的位移。 |
| `duration` | 分段耗時。 |
| `color` | bar 顏色。 |
| `tip` | hover／aria 文字。 |

---

## 6. 時間軸與定位規則

### 6.1 共用絕對時間軸

- 所有階段 MUST 共用同一條時間軸，從 `0 ms` 到本次 pipeline 的總耗時。
- Bar 的位置 MUST 以實際 offset 計算：

```text
left  = clamp(offset / total * 100, 0, 100)%
width = clamp(duration / total * 100, 0, 100 - left)%
```

- MUST NOT 將每個階段平均分配為等寬，也 MUST NOT 讓每個 bar 都從 0 開始。
- 總耗時計算：
  - 已結束的 run：使用實際總耗時或最大 span 結束位移。
  - 執行中的 run：至少涵蓋所有可繪製階段的耗時合計（執行中階段以 `now - started_at` 計算），並隨時間延伸。
  - 若後端提供 `progress.duration_ms`、run 總耗時或最大 span 結束位移，取實際值與階段耗時合計的較大者。
  - 無資料時使用 `1 ms` 作為安全下限，避免除以零。

### 6.2 接續階段

- 對嚴格接續的 pipeline，階段 N 的 bar 起點 MUST 等於階段 N-1 的 bar 終點。
- 不得為了視覺美觀在階段之間加入固定間距。
- 若資料本身存在實際 idle gap，MUST 保留為空白或獨立的 Idle 段，不得把 gap 分攤進階段寬度。
- 階段 N 的 track 仍為完整寬度；只有 bar 依 slot 定位。

### 6.3 平行 span

- 同一階段內若有多個平行 span，MAY 使用 1–4 條 lane 疊放，lane 高度約 `6px`、間距約 `7px`。
- 平行 span 依實際 offset 重疊顯示；不得強制改成前後接續。
- 單一 span 或 `displaySegments` 模式使用單一 `12px` 高 bar。

### 6.4 極短階段的最小可見寬度

長時間 pipeline（例如 14 小時）中的毫秒階段若依實際比例繪製，會變成不可見的次像素並與下一階段重疊。因此：

- 短階段若依實際比例會小於約 `2px`，或最長與最短非零階段相差超過 1000 倍，SHOULD 套用最小可見 slot；建議值為 track 寬度的 `1.25%`，或至少 `2px`，同一張 chart MUST 使用一致規則。
- `0 ms` 階段 MAY 不配置 slot，或使用約 `2px` 的最小 marker；若該階段已完成，階段列仍 MUST 顯示完成狀態。
- 若所有 slot 合計超過 `100%`，MUST 等比例縮放回 `100%`，且維持順序與不重疊。
- 若 slot 合計小於 `100%`（代表有實際 idle gap），剩餘 track MUST 保持空白，不得強制填滿。
- 最小寬度是視覺可讀性規則，操作提示 MUST 說明此行為。
- 最小寬度不得讓已完成階段看起來比實際時間更長而誤導；階段右側仍 MUST 顯示實際耗時。

### 6.5 執行中階段

- `running` 階段的持續時間 MUST 以 `now - started_at` 計算，讓 bar 隨時間延伸。
- Bar 的 slot 代表目前已花費的時間；slot 內只著色 `percent` 的已完成比例。
- 未完成比例 MUST 以同色 25% 淺色 bar 呈現，不得把整個 slot 填滿。
- 若 `percent` 不可得，MUST 顯示 25% 淺色 bar 與 `—`／「進度未知」，不得假設 100%。

---

## 7. Bar 狀態與顏色規則

### 7.1 狀態對照表

| Status | Bar | 填色比例 | Metadata 範例 |
| --- | --- | --- | --- |
| `success` | 繪製 slot | `100%` 填滿 | `67 ms · 完成` |
| `running` | 繪製 slot 至目前時間 | `percent` 填滿，其餘 25% 淺色 | `14h 15m · 67.9% · 執行中` |
| `failed` | 繪製 slot | 已完成比例填滿，其餘 25% 淺色；錯誤色 | `— · 失敗` |
| `stale` | 繪製 slot | 已完成比例填滿，其餘 25% 淺色；錯誤色 | `— · 已中止` |
| `pending` | 不繪製 bar | — | `— · 等待` |
| `skipped` | 不繪製 bar | — | `— · 略過` |

### 7.2 已完成

- `success` 階段 MUST 以階段顏色填滿整個 slot。
- 階段顏色代表「是哪個階段」，不代表成功／失敗；狀態仍 MUST 以文字標示。

### 7.3 進行中／部分完成

- `running`、`failed`、`stale` 階段 MUST 只著色已完成比例：

```text
fillWidth   = slotWidth * clamp(percent, 0, 100) / 100
hollowWidth = slotWidth - fillWidth
```

- 未完成部分 MUST 是與填色相同顏色的 `25%` 淺色填充，外加 `1px` 同色外框。
- 未完成 bar MUST 與填色 bar 無縫接續，不得留下額外間距。
- 未完成 bar MUST 使用 `box-sizing: border-box`，確保高度不因外框增加。
- 不得以灰色底軌直接代替未完成 bar；未完成部分必須能看出是哪個階段的顏色。

### 7.4 等待與略過

- `pending` 與 `skipped` 階段不繪製 bar。
- 等待階段的 track SHOULD 以 25% 階段色呈現；略過階段 MAY 以較低透明度呈現。
- Metadata MUST 顯示 `— · 等待` 或 `— · 略過`。

### 7.5 多段 bar

- 階段內若包含 Model Load 與推論，MUST 以兩個連續 segment 呈現：
  - Model Load 使用藍色 `#0ea5e9`。
  - 推論使用階段色。
  - Load 的結束位置 MUST 等於推論的開始位置。
- `displaySegments` 的 segments MUST 依 offset 排序，不得重疊。
- 展開明細 MUST 分成兩個區塊，各自顯示開始、結束、耗時與載入占比。

### 7.6 錯誤狀態

- `failed`／`stale` MUST 在階段列顯示明確的失敗或中止文字。
- 錯誤階段的填滿與未完成區段 SHOULD 使用 danger 色，讓錯誤在時間軸上可直接辨識。
- 錯誤原因與解法 MUST 可在展開明細或 hover 資訊卡中查看。

---

### 7.7 準備階段與子進度

- 在 sequential waterfall 中，下游階段 MUST 保持 `pending`／等待，直到上游階段完成；不得同時顯示兩個 `running` 階段。判決向量索引 Pipeline 的「複製可重用向量」是版本準備階段，完成前「金融判決向量索引」MUST 顯示等待。
- 準備階段 MAY 在明細顯示速率與預估剩餘時間（例如 copy points/秒、剩餘時間）。
- 索引階段 MAY 在明細顯示 A／R／E 的並行子進度與預估剩餘時間；A／R／E 是同一批掃描中的並行分類，MUST NOT 被拆成多個 sequential waterfall 階段。
- 「準備中」是版本準備／copy 的全域狀態，不是 A 分格的一部分；A 仍是 active collection 的月份基線覆蓋。
- copy 是全域 points 準備階段，MUST NOT 被畫成第四個月份分格，也不得把 copy 完成填入 R／E；R 是 04 索引階段逐月掃描的沿用進度，不是 03 copy 的全域完成度。

## 8. 間距、尺寸與視覺 token

| 項目 | 規格 |
| --- | --- |
| Track 高度 | `12px`；多 lane 依 lane 數與間距調整 |
| Track 圓角 | `4px` |
| Track 背景 | `var(--surface-3)` |
| Track 格線 | `var(--line)` 1px，間隔 `25%` |
| Bar 高度 | `12px`（單 lane）；多 lane 為 `6px` |
| Bar 圓角 | `2px` |
| Bar 最小寬度 | 由 slot 規則控制；sequential bar 的 CSS `min-width` 為 `0` |
| 未完成外框 | `1px solid var(--bar-color, var(--stage-color))` |
| 未完成背景 | `color-mix(in srgb, var(--bar-color, var(--stage-color)) 25%, transparent)` |
| 階段色塊 | `8×8px`，圓角 `2px` |
| 階段名稱 | `10.5px`，粗體 |
| 階段說明 | `8.5px`，淡色 |
| 主機／模型行 | `8.5px`，等寬字體，accent 色 |
| Metadata | `9px`，等寬字體 |
| Axis | `8.5px`，等寬字體 |
| Details | `auto-fit, minmax(170px, 1fr)`，間距 `5px 16px` |
| 明細 label | 淡色；value 使用粗體或等寬字體 |

顏色 MUST 使用主題 CSS variables；不得寫死只在淺色主題可讀的背景色。階段色與 Model Load 藍色可為固定色，但 MUST 在淺色與深色主題維持可辨識度。

---

## 9. Metadata 與階段列互動

### 9.1 Metadata 格式

- 已完成：`<耗時> · 完成`
- 執行中：`<耗時> · <百分比> · 執行中`
- 失敗：`<耗時> · 失敗`
- 等待／略過：`— · 等待`／`— · 略過`
- 多 span：`<耗時> · <N> span`
- 右側 MUST 有 chevron；展開後旋轉 90 度。

### 9.2 展開明細

- 使用原生 `<details>`／`<summary>`，確保鍵盤可操作。
- 預設收合；頁面 MAY 預設展開目前執行中的階段。
- 每個階段 MUST 顯示：
  - 狀態、開始、結束、耗時、進度。
  - 階段專屬資料，例如主機、模型、版本、collection、筆數、Token、TTFT、Top K、引用數等。
  - 說明或目前處理訊息。
- 多段階段 MUST 使用分組明細，每組有自己的開始／結束／耗時。
- 明細不得只顯示在 hover tooltip 中；展開後必須能取得完整資訊。

### 9.3 Hover 資訊卡

- 滑鼠移到階段列或 bar 上時，SHOULD 顯示與明細一致的資訊卡。
- 內容至少包含：階段名稱、狀態、階段進度、整體占比、耗時、筆數／span 數、訊息。
- 資訊卡 MUST 限制在 viewport 內，不得造成 layout shift。
- 游標移出、頁面滾動或元件重新渲染時 MUST 清除，不得留下過期資訊。
- Tooltip 不是唯一存取方式；鍵盤與觸控使用者仍可透過展開明細取得相同內容。
- Bar 本身 MUST 有 `aria-label` 或等效文字。

---

## 10. 即時更新與狀態保存

- 階段列的展開狀態 MUST 以穩定的 `key` 保存（例如 `Set`），不得只依 DOM 位置。
- SSE、live payload 或自動更新重新 render 後，已展開的階段 MUST 保持展開。
- 更新期間 MUST NOT 重置使用者捲動位置、收合明細或重播進場動畫。
- 若階段被移除，對應的展開狀態 MUST 清除。
- Bar 的寬度與百分比 SHOULD 平滑更新；不得因更新造成階段順序跳動。
- Hover 中的階段若更新，資訊卡 SHOULD 更新內容或關閉，不得顯示舊資料。

---

## 11. 響應式與行動版

- `390px` viewport MUST 無水平溢出；頁面 `documentElement.scrollWidth` MUST 等於 viewport 寬度。
- Track 與階段列 MUST 使用可用寬度，不得因內容過長而撐破卡片。
- Metadata MAY 換行，但 track 必須保持完整寬度。
- `<= 640px` 時：
  - 明細改為單欄。
  - 階段列左右 padding 可縮小。
  - Axis 左右標籤仍必須可見。
- 不以 hover 作為行動版唯一互動；點擊 summary 必須能展開明細。
- 階段 summary 的可點擊區域 SHOULD 至少 `44px` 高，便於觸控。

---

## 12. 無障礙

- MUST 使用原生 `details`／`summary` 或等效的可鍵盤操作元件。
- Focus 狀態 MUST 明顯可見。
- 狀態不得只以顏色表示；必須有「完成／執行中／失敗／等待／略過」等文字。
- Bar 的 `role="img"` 與 `aria-label` MUST 描述階段、開始／結束、耗時與狀態。
- Tooltip 內容 SHOULD 可透過展開明細取得。
- 若使用動畫，MUST 尊重 `prefers-reduced-motion`；動畫不得是唯一進度表示。

---

## 13. 驗收清單

新增或修改 pipeline waterfall 時，必須逐項確認：

- [ ] Axis 左側為 `0 ms`，右側為正確總耗時。
- [ ] 階段順序與 pipeline 執行順序一致，不依耗時排序。
- [ ] 每個階段的 bar 依實際 offset 定位，不是每列都從 0 開始。
- [ ] 接續階段的「上一階段結束」等於「下一階段開始」。
- [ ] 極短階段有最小可見寬度，且不與相鄰階段重疊。
- [ ] 已完成階段整條填滿階段色。
- [ ] 進行中／部分完成階段只填滿 `percent`，其餘為同色 25% 淺色 + 1px 外框。
- [ ] 未完成 bar 為 25% 同色淺色、高度不因外框改變。
- [ ] 等待與略過階段不繪製 bar。
- [ ] Model Load 與推論 bar 接續，顏色與明細分組正確。
- [ ] 展開明細包含狀態、開始、結束、耗時、進度與階段專屬資料。
- [ ] Hover 資訊卡與明細內容一致，且會正常消失。
- [ ] SSE／live 更新後展開狀態保持。
- [ ] 390px 無水平溢出。
- [ ] Console error 為 0。
- [ ] 鍵盤可操作、focus 可見、狀態有文字。
- [ ] 淺色與深色主題皆可辨識。

### 13.1 幾何驗證範例

以判決向量索引 Pipeline 為例，驗證時應能觀察到：

```text
Ollama 測試：      left 0.000%    width 1.2195%   filled
Blue-Green 版本：  left 1.220%    width 1.2195%   filled
金融判決索引：     left 2.439%    width 66.2428%  filled
                    left 68.682%   width 31.3182%  hollow
```

重點不是固定百分比，而是：

- 第二段 left 等於第一段 left + width。
- 第三段 left 等於第二段 left + width。
- Filled + hollow 等於該階段的 slot。
- Unfilled 的 `background-color` 為階段色 25% 淺色，`border` 為階段色。

---

## 14. 參考實作

### 14.1 共用元件

- `src/judgment/web/static/assets/js/pages/performance.js`
  - `renderWaterfallStages(stages, total, hint, { legend })`
  - `renderRagPipelineStage(stage, total)`
- `src/judgment/web/static/assets/js/pages/rag.js`
  - RAG 回答底部與後端處理流程的 waterfall。
- `src/judgment/web/static/assets/js/pages/processing.js`
  - `indexWorkflowProgressMarkup(workflow)`：判決向量索引 Pipeline。
  - `workflowProgressMarkup(workflow)`：判決匯入與其他非索引 workflow 的流程進度；使用 `WORKFLOW_WF_OPEN_STAGES` 保存展開狀態。
  - 使用 `INDEX_WF_OPEN_STAGES` 保存索引 Pipeline 展開狀態。
- `src/judgment/web/status.py`
  - `build_status()` 的 `pipeline`：服務總覽載入的後端檢查階段與耗時。
- `src/judgment/web/static/assets/js/pages/status.js`
  - `statusPipelineMarkup(status)`：服務總覽載入 Pipeline；使用 `STATUS_WF_OPEN_STAGES` 保存展開狀態。
- `src/judgment/web/static/assets/js/pages/home.js`
  - `waterfallMarkup(data, options)`：首頁即時摘要載入 Pipeline；使用 `HOME_WF_OPEN_STAGES` 保存展開狀態，並以 `home-wf-slow` 標示最慢階段。
- `src/judgment/web/home.py`
  - `build_home_summary()` 的 `pipeline`：`/api/home` 的法規／命令、判決、manifest、判決索引、法規索引、金融法規清單與彙整階段計時。
- `src/judgment/web/static/assets/styles.css`
  - `.rag-wf-axis`、`.rag-wf-stages`、`.rag-wf-stage`、`.rag-wf-track`、`.rag-wf-bar`。
  - `.index-wf-*` 只保留索引 Pipeline 的包裝與階段編號。
  - `.workflow-wf-*` 只保留非索引 workflow 的包裝、階段編號、狀態圖例與整體進度。
  - `.status-wf-*` 只保留服務總覽載入 Pipeline 的包裝與階段編號。
  - `.index-wf-bar.is-hollow`、`.workflow-wf-bar.is-hollow`：未完成 25% 淺色 bar。

### 14.2 移植規則

- 新 pipeline MUST 重用 `.rag-wf-*` 的 DOM 結構與視覺樣式。
- MAY 增加頁面專屬 wrapper 或階段編號 class，但 MUST NOT 複製一套新的 waterfall CSS。
- 新 pipeline 的資料 adapter MUST 先轉成第 5 節的 stage／span／segment 契約，再交給 renderer。
- 若需要新的 bar 行為（例如新的 segment 類型），MUST 先更新本規格，再新增共用樣式。
- 既有 `renderWaterfallStages` 未涵蓋的行為（例如未完成 25% 淺色 bar）SHOULD 逐步抽成共用 helper，避免每個頁面各自實作。

### 14.3 新增 pipeline 的實作步驟

1. 在資料 adapter 定義 stage 陣列，為每個階段指定穩定的 `key`、`label`、`caption`、`color`、`status`、`started_at`、`finished_at`、`duration_ms`、`percent` 與階段專屬 `details`。
2. 依第 6 節計算總耗時、每個階段的 slot、filled width 與 hollow width；執行中階段的 duration 以 `now - started_at` 更新。
3. 使用共用的 `.rag-wf-axis`、`.rag-wf-stages`、`.rag-wf-stage`、`.rag-wf-track`、`.rag-wf-bar` 結構；頁面專屬 wrapper 只能包在外層。
4. 已完成階段輸出單一 filled bar；進行中／部分完成階段輸出 filled + hollow 兩個無縫接續的 bar；等待／略過階段不輸出 bar。
5. 在 summary 顯示階段名稱、說明、耗時、狀態／百分比與 chevron；在 details 顯示與 hover 相同的完整資訊。
6. 以穩定 key 保存展開狀態，確保 SSE／live 更新後不收合。
7. 依第 13 節驗收清單與第 13.1 節幾何驗證方式測試桌機、390px、淺色／深色主題與 console error。

### 14.4 最小 DOM 結構

```html
<div class="rag-wf-axis">
  <span>0 ms</span>
  <span>14h 15m 48s</span>
</div>
<div class="rag-wf-stages">
  <details class="rag-wf-stage is-running" data-stage-key="index" style="--stage-color:#a78bfa">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong>金融判決向量索引</strong><small>批次進度</small></span>
        </span>
        <span class="rag-wf-stage-meta">14h 15m · 67.9% · 執行中</span>
      </span>
      <span class="rag-wf-track" style="height:12px">
        <span class="rag-wf-bar is-sequential"
              style="left:2.439%;width:66.2428%;--bar-color:#a78bfa"></span>
        <span class="rag-wf-bar is-hollow is-sequential"
              style="left:68.682%;width:31.3182%;--bar-color:#a78bfa"></span>
      </span>
    </summary>
    <div class="rag-wf-details">…</div>
  </details>
</div>
```

實際 class 名稱可依共用 renderer 調整，但視覺與語意 MUST 對應本規格。

---

## 15. 反模式

以下做法 MUST NOT 出現在 pipeline waterfall：

- 每個階段都從 track 左端開始，看起來像多條獨立進度條。
- 每個階段平均分配相同寬度，忽略實際耗時。
- 進行中階段整條填滿，讓 67.9% 看起來像 100%。
- 未完成部分只留灰色底軌，沒有同色 25% 淺色填充。
- 已完成階段與進行中階段使用相同的填色比例。
- 以 CSS `min-width` 讓短 bar 重疊，而不是使用 slot 最小寬度。
- 只靠 hover 顯示開始／結束／Token／錯誤等必要資訊。
- live 更新後把已展開的階段全部收合。
- 390px 讓 track 或 metadata 撐出水平捲動。
- 使用固定淺色背景或固定深色文字，忽略主題。
- 把靜態架構圖硬套成時間軸 waterfall。

---

## 16. 變更記錄

| Version | Date | Change |
| --- | --- | --- |
| 1.4 | 2026-11-19 | 對齊全站進度規格：未完成區段改為階段色 25% 淺色 + 1px 外框；等待軌道使用 25% 階段色。 |
| 1.5 | 2026-11-19 | 明訂 sequential waterfall 下游階段必須等待上游完成；新增準備階段 ETA 與索引 A／R／E 子進度規則，A／R／E 不得拆成 sequential 階段。 |
| 1.6 | 2026-11-20 | 明訂 03 copy 是全域 points 準備階段，不得畫成第四個月份分格或填入 R／E；R 是 04 逐月掃描沿用進度。 |
| 1.3 | 2026-11-16 | 將 `#/home` 即時摘要載入 Pipeline 納入適用範圍；新增 `/api/home` 階段計時、`home-wf-slow` 最慢階段標示與 `HOME_WF_OPEN_STAGES` 參考實作。 |
| 1.2 | 2026-11-15 | 將 `#/status` 服務總覽載入 Pipeline 納入適用範圍；新增 `/api/status` 後端階段計時、瀏覽器初始化／HTTP 往返合成時間軸與 `status-wf-*` 參考實作。 |
| 1.1 | 2026-11-15 | 將判決匯入與非索引 workflow 流程進度納入適用範圍；新增 `workflow-wf-*` 包裝、2×3 指標、狀態圖例與 `WORKFLOW_WF_OPEN_STAGES` 參考實作。 |
| 1.0 | 2026-11-15 | 建立 canonical Pipeline Waterfall 規格；納入接續階段、最小可見寬度、部分完成空心 bar、展開狀態保存、響應式與驗收清單。 |
