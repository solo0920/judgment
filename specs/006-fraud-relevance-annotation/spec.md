# Fraud Relevance Sampling & Annotation Specification v2.0

- 狀態：Final（Sampler v2.0；標註暫停，無人力）；抽樣母體是歷史凍結快照

> **Historical snapshot**：本文的 4,681,502 筆母體與抽樣 manifest 是當時凍結的研究資料；目前 current 判決為 4,714,967 筆。重跑 sampler 時必須建立新 manifest，不可把舊抽樣結果直接套到新資料。
- 日期：2026-11-16
- 修訂：2026-11-16（雙尾超幾何上限、空白正規化、Coverage 門檻、盲標、凍結母體、組合驗證；母體 1,581）
- 適用範圍：Judgment 判決的 fraud relevance ground truth
- 本版取代先前的 224-title-strata、3 層草案與 A/B/C 草案
- 凍結：自 2026-11-16 起凍結抽樣、統計、Coverage 門檻與 `remove-unicode-space-v2`；除非法律簽核或 Pilot 發現定義錯誤，不得調整。

## 1. 研究問題與範圍

本研究的 primary frame 只有：

> 板橋／新北地院、2000–2010 年、全文經 `remove-unicode-space-v2` 正規化後含「詐欺」或「詐騙」、但 `title` 不在動態案由清單（`詐欺`、`詐欺等`）的 1,581 筆判決中，有多少筆實質與詐騙相關？

不得把結果稱為整體 100,312 筆判決的 Recall，也不得稱為 Judgment 系統的整體 Recall。

Phase 2 另外處理兩個相鄰缺口，但必須與 primary frame 分開報告：

- G1：`title` 未命中、正規化全文含「詐術」或「詐取」，但不含「詐欺」「詐騙」。
- G2：`title` 未命中、M 層（刑事）正規化全文完全不含「詐欺」「詐騙」「詐術」「詐取」。

## 2. JID 刑事／民事分類

- 分類訊號：JID 第一段末碼。
  - `M`：刑事。
  - `V`：民事。
- 本 frame 內部一致（非官方 M/V 定義驗證）：
  - full-text-only：M 233、V 1,348，合計 1,581。
  - court+date：M 2,375、V 97,937，合計 100,312。
  - title 命中：M 210、V 0，合計 210。
- 必須對照司法院法院／案件類別代碼表，保存來源、版本與下載日期。
- 無法判定的 suffix MUST 記為 `unknown`，不得強制歸入 M 或 V。
- 在官方對照完成前，M/V 只作為抽樣分層訊號，不作為法律結論。

## 3. `criminal_signal`

定義：判決全文**去除所有空白、換行與表格分隔字元**後，出現下列任一詞：

```text
詐欺取財罪
詐欺得利罪
三人以上共同詐欺
幫助詐欺
常業詐欺
```

- 正規化方式：`regexp_replace(full_text, '[[:space:]]+', '', 'g')`。
- MUST 掃描正規化後的全文，MUST NOT 只掃前 1,600 字。
- 實測：正規化全文命中 240 筆（M 158、V 82）；前 1,600 字只命中 179 筆，漏 61 筆（25.4%）。
- 若不正規化，`常業詐\r\n欺` 這類因排版換行而被切開的詞會漏掉；實測有 7 筆因此從 A/C1 錯分到 B/C2。
- 變體檢查：以「詐 + 1–5 個非中日韓字元 + 欺/騙」掃描 primary frame，只有 5 筆分隔符變體；4 筆是空白、1 筆是表格邊框 `│`。v2 規則已一併移除 `│`、`｜`、`|`；未發現跨空白行的誤接。
- `criminal_signal` 是抽樣種子，不是 grade 的替代品；仍須人工標註。
- `criminal_signal` 只用於分層與抽樣；MUST NOT 顯示在盲標介面，也不得作為預先標亮的依據。

## 4. 分層與母體

### 4.1 Primary frame（1,581）

| 層 | 定義 | 母體 | 策略 |
|---|---|---:|---|
| A | M + `criminal_signal=true` | 158 | 全量 |
| B | M + `criminal_signal=false` | 75 | 全量 |
| C1 | V + `criminal_signal=true` | 82 | 全量 |
| C2 | V + `criminal_signal=false` | 1,266 | 隨機抽 50 |

正式標註案件數：

```text
158 + 75 + 82 + 50 = 365
```

- A/B/C1 全量，沒有抽樣誤差。
- C2 是唯一需要加權的層。
- 固定 random seed：`42`；抽樣結果必須可重跑。
- 抽樣前 MUST 先按 `jid` 排序，再使用固定的 PRNG；不得依賴 SQL 回傳順序。
- 1,581 而非先前的 1,560：正規化後新增 21 筆 V 判決，均是「詐\r\n欺」或「詐\r\n騙」因排版換行被切開；已逐筆檢視，不是新資料或新法院。其中 3 筆 V 同時是 `criminal_signal` 新增的 3 筆，不是額外第二批。

### 4.2 Phase 2 相鄰缺口（互斥）

| 層 | 定義 | 母體 | 策略 |
|---|---|---:|---|
| G1 | title 未命中、正規化全文含「詐術」或「詐取」，但不含「詐欺」「詐騙」 | 82（M 31、V 51） | 全量 |
| G2 | title 未命中、M 層，正規化全文不含「詐欺」「詐騙」「詐術」「詐取」 | 1,901 | 抽 50–100 |

- G1 與 G2 MUST 以 `jid` 去重，兩者互斥。
- G2 母體已扣除 G1 中屬於 M 的 31 筆。
- Phase 2 也使用與 primary frame 相同的正規化；舊版 84／1,904／207 已作廢，正式為 G1 82、G2 1,901、M title 210。
- G1/G2 的正規化差異已逐筆檢視：G1 raw 83 → 82（3 筆因 `詐\r\n欺` 移至 primary、2 筆因 `詐\r\n取/術` 新增）；G2 raw 1,902 → 1,901（1 筆因 `詐\r\n取` 移至 G1）。全部是真實詞，沒有跨段誤接。
- Phase 2 只有在 Phase 1 顯示 title 缺口可能很大時才啟動。

算術檢查（獨立 count，不是差額回推）：

```text
M total 2,375
= M full-text-only 233
+ M G1 31
+ M G2 1,901
+ M title 命中 210
= 2,375
```

### 4.3 凍結母體與 manifest

資料來源檔名含 `Update`，代表資料會更新。抽樣前 MUST 產生並保存不可變 manifest：

- 檔案：`.run/fraud_relevance/manifest.json`
- 內容 MUST 包含：
  - manifest 版本、建立時間、`annotation_version`、Python 版本
  - 資料庫識別（主機／資料庫名稱，不含密碼）、`judgment_documents` 的資料版本或最大 `last_seen_snapshot_id`
  - 完整 SQL predicate、法院清單、日期範圍、排除的 title 清單、`criminal_signal` regex
  - 固定 seed、抽樣腳本版本
  - A/B/C1/C2 與 title precision 的母體數與排序後 `jid` 清單的 SHA-256；Phase 2 啟動時另含 G1/G2 的母體數與 digest
  - 實際抽出的 `jid` 清單、權重與 `sample_source`
- 重跑 sampler MUST 產生相同的 `sampling_sha256` 與 `formal_jid_sha256`；若資料庫已更新，MUST 產生新版本 manifest，不得覆寫舊版。
- 所有後續分析 MUST 以 manifest 中的 `jid` 清單為準，不得重新查詢後默默替換案件。

## 5. 信賴區間與統計方法

### 5.1 區間口徑

本規格的主要區間為**雙尾 95%**。門檻比較是雙向的（跨 67% 或 83%），不得混用單尾 Rule of Three。

- 單一比例：Clopper-Pearson 精確區間。
- C2 有限母體：超幾何精確法。
- 不得使用 Wald 常態近似。
- 所有數字 MUST 由 `scripts/fraud_sampling_stats.py` 產生並寫入報告，不得手寫。

### 5.2 C2 零命中

C2 是有限母體、無放回抽樣。令 `N=1,266`、`n=50`、`x=0`：

- 雙尾 95% 超幾何上限：**88 筆（6.95%）**。
- 單尾 95% 上限：72 筆（5.69%）；本規格不採用單尾作為決策口徑。
- `n=30` 的雙尾 95% 上限：**144 筆（11.37%）**。
- 因此 C2 正式抽樣量固定為 **50**。
- grade 1 與 grade 2 MUST 分開估計，不得只報 `grade >= 1`。

### 5.3 Title precision

- 從 210 筆 title 命中隨機抽 **30 筆**（固定 seed 42；排序後抽樣）。
- 使用 Clopper-Pearson 雙尾 95% 計算 precision 區間。
- 分別估計：
  - `p_title_loose`：title 命中樣本中 `grade >= 1` 的比例。
  - `p_title_strict`：title 命中樣本中 `fraud_conviction=true` 的比例。
- 最終 coverage 的分子是 `210 × p_title_*`，不是假設 `p_title=1`。
- title precision 樣本 MUST 與正式 365 筆一起混排盲標，但 MUST NOT 計入 T。

### 5.4 覆蓋率名稱與公式

本研究的 primary frame 指標名稱：

```text
Title-filter Coverage Estimate
```

Loose 口徑：

```text
Coverage_loose =
  (210 × p_title_loose)
  / (210 × p_title_loose + T_loose)
```

Strict 口徑：

```text
Coverage_strict =
  (210 × p_title_strict)
  / (210 × p_title_strict + T_strict)
```

其中：

```text
T_loose  = A+_loose  + B+_loose  + C1+_loose  + N_C2 × p_C2_loose
T_strict = A+_strict + B+_strict + C1+_strict + N_C2 × p_C2_strict
```

- `A+`、`B+`、`C1+`：全量標註中符合該口徑的數量。
- `p_C2_*`：C2 抽樣中符合該口徑的比例。
- 分母是「210 筆 title 命中」與「1,581 筆 primary frame」的相關案件聯集；不是 100,312 筆，也不是整體資料庫。
- 若 `p_title_*` 與 `T_*` 同時為 0，Coverage 未定義，MUST 標記 `undefined`，不得報成 0 或 1。
- 這個數字只涵蓋上述 primary frame 與 title 命中的聯集；MUST NOT 稱為整體 Recall。
- Phase 2 的 G1/G2 另外報告，不得直接併入 primary coverage 後仍使用同一個名稱。

### 5.5 C2 抽樣權重

```text
w_i = N_C2 / n_C2 = 1,266 / 50 = 25.32
```

A/B/C1 權重為 1。報告 MUST 分開呈現 grade 1、grade 2 與 strict/loose。

### 5.6 Coverage 區間：Bayesian Monte Carlo（明確定義）

Clopper-Pearson 區間不是機率分布，不得把上下限當成抽樣分布。Coverage 的聯合不確定性採**明確定義的 Bayesian Monte Carlo**，並如實標示為「95% credible interval」，不宣稱 strict frequentist coverage。

- 抽樣次數：10,000；固定 seed 42。
- `p_title_loose` / `p_title_strict`：
  - posterior 為 `Beta(x + 0.5, n - x + 0.5)`（Jeffreys prior）。
- `p_C2_loose` / `p_C2_strict`：
  - 有限母體模型：`K ∈ {0, ..., N_C2}` 為母體中符合口徑的案件數。
  - prior：`K/N ~ Beta(0.5, 0.5)`。
  - likelihood：`X | K ~ Hypergeometric(N_C2, K, n_C2)`。
  - 在 `K` 的整數格點上計算 posterior，正規化後抽 `K`，令 `p_C2 = K/N`。
- 每次 draw 計算 `Coverage_loose` 與 `Coverage_strict`，取 2.5% 與 97.5% 百分位。
- 另外 MUST 並列報告 frequentist 成分區間：
  - title precision：Clopper-Pearson 雙尾 95%。
  - C2：超幾何精確雙尾 95% 上限。
- 決策門檻使用 Bayesian Monte Carlo 的 95% credible interval；兩種區間不得混用後宣稱單一的 frequentist 保證。選擇 Bayesian MC 的理由是能聯合傳遞 `p_title` 與 C2 的不確定性，不是因為它在 0 命中時較窄；不得以結果寬窄作為選擇依據。
- grade 1／grade 2 的分開估計：把各 grade 視為 binary indicator，分別用 Clopper-Pearson（title）與超幾何（C2）計算，僅作描述性 marginal interval，不宣稱 simultaneous coverage。

## 6. 標註 Schema 與驗證

```json
{
  "case_id": "case_0001",
  "jid": "PCDM,95,訴緝,201,20070504,3",
  "sampling_stratum": "A",
  "sample_source": "primary",
  "is_pilot": false,
  "grade": 2,
  "primary_offence": "fraud",
  "fraud_conviction": true,
  "fraud_role": "core",
  "relevance_reason": "主文論以詐欺取財罪，詐欺是主要罪名",
  "evidence_section": "main_text",
  "evidence_quote": "詐\r\n欺取財罪",
  "evidence_quote_normalized": "詐欺取財罪",
  "evidence_start": 1200,
  "evidence_end": 1207,
  "normalization_version": "remove-unicode-space-v2",
  "full_text_sha256": "原始全文的 SHA-256",
  "annotator": "annotator_1",
  "confidence": 0.95,
  "adjudicated": false,
  "annotation_version": "v2.0"
}
```

### 6.1 欄位規則

- `sampling_stratum` 固定枚舉：`A`、`B`、`C1`、`C2`、`T`、`G1`、`G2`。
- `sample_source` 固定枚舉：`primary`、`title_precision`、`phase2`。
- `is_pilot`：pilot 階段為 `true`；指引定稿後重標才可改為 `false` 並進入 ground truth。
- `fraud_role` MUST NOT 手填；由 `grade`、`primary_offence`、`fraud_conviction` 推導。範例中的 `fraud_role` 是系統推導後的值，不是標註者輸入欄位。若輸入含 `fraud_role`，MUST 與推導結果一致，否則拒絕存檔。
- `evidence_section` 固定枚舉：`main_text`、`facts`、`reasoning`、`cited_law`、`other`。
- `evidence_start`／`evidence_end` MUST 是**原始全文** offset，MUST NOT 使用正規化後 offset；由程式以共用正規化函式從 `evidence_quote` 反推原始 span。
- `evidence_quote` MUST 保存原始全文的實際子字串（可含 `\r\n`）；`evidence_quote_normalized` 保存去除空白後的字串，供搜尋與比對。
- 標註介面 MAY 顯示原始段落文字；若顯示正規化文字，MUST 保留可映射回原始 offset 的資訊。無論顯示方式，`evidence_quote` 經共用正規化函式後 MUST 能找到唯一 raw span，並映射回原始 `evidence_start`／`evidence_end`。
- `normalization_version` MUST 等於 `remove-unicode-space-v2`（或目前版本）。
- `full_text_sha256` MUST 是標註當下原始全文的 SHA-256；文字版本改變時，舊標註不得默默重用。
- Annotation template MUST 預填 `normalization_version` 與 `full_text_sha256`；標註者不得手動修改這兩個欄位。
- `evidence_quote` 在 `grade >= 1` 時必填；`grade=0` 時可空白。
- 若 `evidence_quote` 在全文找不到，或找到多個不確定匹配，MUST 進入人工確認，不得自動選第一個 offset。
- `annotator` 不得使用可識別個人的真實姓名；使用 `annotator_1` 等代號。
- `confidence` 介於 0 與 1。

### 6.2 組合驗證

標註寫入前 MUST 通過下列檢查；不合法組合一律拒絕存檔：

- `grade` 只能是 `0`、`1`、`2`。
- `grade=0` 時：`primary_offence=other`、`fraud_conviction=false`。
- `fraud_conviction=true` 時：JID suffix MUST 為 `M`，且 `grade >= 1`，且 `evidence_quote` 非空。
- `primary_offence=fraud_civil` 時：JID suffix MUST 為 `V`，且 `fraud_conviction=false`。
- `primary_offence=fraud_civil` 時：`grade` 只能是 `1` 或 `2`。
- `primary_offence=money_laundering` 時：`grade` 只能是 `1`。
- `grade=2` 時：`primary_offence` 只能是 `fraud`、`mixed`、`fraud_civil`。
- `grade=1` 時：`primary_offence` 只能是 `fraud`、`mixed`、`money_laundering`、`fraud_civil`。
- 任何未列於 7.4 合法組合表的組合，一律拒絕。
- 有 `full_text` 時，`full_text_sha256` MUST 與原始全文一致；`normalization_version` MUST 與目前版本一致。
- `evidence_start`／`evidence_end` MUST 能用共用正規化函式映射回原始全文；若只對正規化文字有效、對原始文字無效，拒絕存檔。
- 驗證失敗時不得寫入 null `fraud_role` 或猜測值；MUST 要求標註者修正。

## 7. Grade 定義

### 7.1 Grade

- **2**：詐欺取財／得利／加重詐欺是主要罪名；或民事判決以詐欺侵權為核心爭點。
- **1**：洗錢是主罪名，但事實核心是詐騙集團／車手／人頭帳戶；或詐欺是部分罪名／幫助犯；或民事詐欺只是眾多請求原因之一。
- **0**：只是事實欄提及「被告辯稱被詐欺」、民事主張受騙但法院未以詐欺為核心、背景敘述提及詐欺，或僅引用法條。

### 7.2 民事判決的 Grade 0／1／2 區分

| 情況 | Grade |
|---|---:|
| 原告主張遭詐欺，但法院未認定詐欺是案件核心 | 0 |
| 法院實際審理詐欺侵權責任，詐欺是主要爭點 | 2 |
| 判決只在背景敘述提及詐欺 | 0 |
| 詐欺只是眾多請求原因之一，非主要爭點 | 1 |

- 民事 Grade 2 **不代表**刑事詐欺定罪；`fraud_conviction=false` 是正常組合。
- 民事 Grade 2 的 `primary_offence` MUST 為 `fraud_civil`。

### 7.3 Strict / Loose

| 口徑 | 定義 | 用途 |
|---|---|---|
| Strict | `fraud_conviction=true` | 法律上的詐欺定罪 |
| Loose | `grade >= 1` | 使用者搜尋「詐騙判決」的實用相關性 |

- 決策門檻 MUST 使用 Loose。
- Strict MUST 一併報告，不得省略。
- 洗錢車手案與民事詐欺求償的 grade 由法律背景人員拍板，並附 5 個實例；工程團隊不得自行決定。

### 7.4 `fraud_role` 完整合法組合表

| grade | primary_offence | fraud_conviction | fraud_role |
|---:|---|---|---|
| 0 | other | false | mention_only |
| 1 | money_laundering | false | predicate_core |
| 1 | fraud | true | partial |
| 1 | fraud | false | peripheral |
| 1 | mixed | true | partial |
| 1 | mixed | false | peripheral |
| 1 | fraud_civil | false | civil_partial |
| 2 | fraud | true | core |
| 2 | fraud | false | alleged_core |
| 2 | mixed | true | core |
| 2 | fraud_civil | false | civil_core |

- 表外組合 MUST 拒絕。
- `grade=2 + mixed + false`、`grade=2 + money_laundering + *`、`grade=2 + fraud_civil + true`、`grade=0` 搭配非 `other` 或 `fraud_conviction=true`，均為不合法。
- `alleged_core` 用於「詐欺是主要起訴／審理罪名，但判決未為詐欺有罪認定」；不得計入 Strict。

## 8. Pilot、正式標註與盲標

| 階段 | 數量 | 規則 |
|---|---:|---|
| Pilot | 20 | 只從 A/B/C1 抽；不納入正式一致性 |
| Title precision | 30 | 從 210 筆 title 命中抽；不計入 T |
| 正式標註 | 365 | A/B/C1 全量 + C2 50 |
| 正式雙人標註 | 20 | 從 365 分層抽，獨立盲標 |
| 最終 Ground Truth | 365 | 分歧經 adjudication |

### 8.1 Pilot

- Pilot 只從 A/B/C1 抽，避免與 C2 的隨機樣本互相影響。
- 分層配置：A 10、B 5、C1 5；排序後以 seed 43 抽。
- Pilot 不用來宣稱 kappa 或一致性；目的是修正指引與 grade 規則。
- Pilot 案件在指引定稿後 MUST 重標；只有重標結果進入 ground truth。
- Pilot 的舊標註保留為指引修正紀錄，不得與正式結果混合。

### 8.2 盲標與混排

- 正式佇列 MUST 包含 365 筆 primary 與 30 筆 title precision，共 395 筆。
- 為加速 Pilot／title precision，可先建立 50 筆 pre-formal title batch：30 筆 title precision + 20 筆 primary controls，混合盲標；不得標示個案來源。控制組結果在指引未變時可沿用至正式，否則重標。
- 正式佇列 MUST 以 seed 42 隨機混排；pre-formal title batch 使用 seed 45。`case_id`／`batch_id` 不得透露來源或分層。
- 標註介面 MUST 隱藏：
  - `sampling_stratum`
  - `sample_source`
  - `title`
  - JID 與 JID suffix
  - `criminal_signal`
  - 任何「title 命中／未命中」提示
- 標註者只看得到 `case_id` 與判決全文。
- 詐欺相關詞（`詐欺`、`詐騙`、`詐術`、`詐取`、`洗錢`）可在全文均勻標亮；MUST NOT 只標亮 `criminal_signal` 的命中處，也不得因來源不同而改變標亮規則。
- `sampling_stratum`、`sample_source` 與 `jid` 只在分析階段用 `analysis_key` join 回去。
- 標註佇列不得按分層、案由、法院或日期排序。

### 8.3 正式雙人標註

- 從正式 365 筆分層抽 20 筆；抽樣 seed 與清單 MUST 寫入 manifest。
- 兩位標註者獨立盲標，先不看對方結果。
- grade 使用 weighted Cohen's kappa。
- `primary_offence`、`fraud_conviction`、`evidence_section` 分別計算類別一致性。
- 分歧由第三人裁決；最終 ground truth 使用裁決結果。
- 20 筆的 kappa 只作描述，不設硬性通過門檻。

## 9. 決策門檻

以 Loose 的 `Coverage_loose` 與其 95% credible interval 為準：

- 區間上限 < 67% → Tier 1：值得做 Legal Concept Layer／罪名標註。
- 區間下限 >= 83% → Tier 3：維持現狀，只加延伸提示。
- 其餘（區間跨越 67% 或 83%）→ Tier 2 或「決策未定」：
  - 先做兩層回答與延伸提示。
  - 必要時擴大 C2 樣本，不強行分類。

等價關係（僅在 `p_title=1` 時）：

```text
Coverage = 67%  ↔  T = 105
Coverage = 83%  ↔  T = 42
```

不得只看 T 或 Coverage 的點估計。

**Tier 決策的唯一依據是 `Coverage_loose` 的 Bayesian 95% credible interval。** Clopper-Pearson 與超幾何成分區間只用於報告與診斷，不得在事後挑選較窄的區間來改變 Tier。Jeffreys prior 已在 5.6 節預先指定；不得在看到結果後改用其他 prior。

### 9.1 序列式標註規則

為節省標註量，採預先註冊的序列規則：

1. 先標 title precision 30、pilot 20 與 A 層 158。
2. 若 `A+_loose >= 105`，則 `T_loose >= 105`，且 `p_title <= 1`，因此 `Coverage_loose` 上限必然 <= 66.7%，Tier 1 已確定；C2 可延後，不必為了分類而抽。若延後 C2，報告只能宣稱 Tier 1 的保守結論，不得報告完整的 Coverage 點估計。
3. 若 `A+_loose < 105`，繼續標 B、C1、C2。
4. 任何階段都不得因為「看起來差不多」而跳過 C2 後仍宣稱 Tier 2／Tier 3。

### 9.2 決策未定

- 若 95% credible interval 同時跨越 67% 與 83%，標記為「決策未定」，不得強行分類。
- 可擴大 C2 至 100 筆；擴大後的樣本 MUST 以原 C2 50 筆為基礎增加，不得重抽替換。
- 擴大後仍跨越門檻，則以 Tier 2 的兩層回答與延伸提示作為保守處置，並在報告中明示不確定性。

## 10. 執行順序

1. M/V 內部對照已完成（附錄 A）；官方代碼表 URL 待補，不阻塞 Pilot。
2. 跑精確 SQL count，確認 A/B/C1/C2/G1/G2 母體，產生凍結 manifest。
3. 法律背景人員先獨立判斷 `specs/006-fraud-relevance-annotation/legal-review-examples.md` 的 5 個實例；工程團隊的建議另存 `legal-review-engineering-notes.md`，審閱後才對照。
4. Title precision 抽 30 筆。
5. Pilot 20 筆（A 10、B 5、C1 5），依 `specs/006-fraud-relevance-annotation/pilot-guide.md` 執行；可與法律審閱並行。
6. Pilot 重標，確認指引定稿。
7. 正式標註：先 A 層 158；必要時再 B、C1、C2。
8. 正式雙人標註 20 筆 + adjudication。
9. 計算 Loose/Strict T、Title-filter Coverage、95% credible interval 與成分 frequentist 區間。
10. 依 9.1 與 9.2 決定 Tier 1/2/3。
11. Phase 2 視 Phase 1 結果決定是否啟動 G1/G2。

## 11. 統計與 sampler 的可重現性

- `scripts/fraud_sampling_stats.py` MUST 實作：
  - 超幾何精確 upper bound（含 `x=0` 與一般 `x`）
  - Clopper-Pearson 雙尾區間
  - Coverage Bayesian Monte Carlo（Jeffreys prior、超幾何有限母體 posterior、seed 42）
- `scripts/build_fraud_relevance_sample.py` MUST：
  - 使用 manifest 中固定的 SQL predicate
  - 排序後抽樣
  - 輸出 blind queue 與 analysis key 分離的檔案
  - 輸出 manifest digest
- `src/judgment/text_normalization.py` MUST 是唯一的正規化實作，提供 `normalize_for_match`、`normalize_with_offsets`、`resolve_evidence_span` 與 `NORMALIZATION_VERSION`；sampler、audit、annotation 與 snippet 邏輯 MUST 共用，不得各自實作。
- PostgreSQL 的 `SQL_NORMALIZE_EXPR` MUST 與 Python `normalize_for_match` 等價；已對 primary frame 全部 1,581 筆逐筆比對，差異 0。
- `scripts/fraud_relevance_report.py` MUST 讀取 manifest、analysis key 與標註檔，驗證所有正式案件，輸出 T、Coverage、區間，並可輸出含 raw offset 與 derived role 的 verified annotations。
- 上述腳本 MUST 有單元測試；統計常數（88、144、67%、83%）MUST 由測試鎖定。
- 報告中的所有區間與 coverage 數字 MUST 可直接由 manifest、標註檔與腳本重算。

## 12. 正規化與索引的邊界

- 抽樣、關鍵字掃描、evidence offset 與 snippet 匹配使用 `remove-unicode-space-v2`。
- **Qdrant 索引文字與既有 4,681,502 筆向量暫不變更。** 200 筆隨機 head/tail embedding 稽核（seed 42）結果：
  - cosine median 0.9858、p05 0.9689、min 0.9539。
  - 38/200 筆 cosine < 0.98，0 筆 < 0.95。
  - 5 個代表性查詢的 top-10 overlap 為 8–10/10，top-20 為 17–19/20；這是在 200 筆樣本內比較，不是全庫排名。
- 針對性稽核（200 筆隨機 + 最多 50 筆已知被空白／表格切開的判決，n=250）：
  - 59 筆含 split 詞；split 組 cosine mean 0.9809，非 split 組 0.9839。
  - split 次數與 cosine 的 correlation 0.062，關聯很弱。
  - top-10 overlap 仍為 8–10/10；59 筆 split docs 的 top-10 命中數在 raw/normalized 分別為 7/7、8/9、9/9、9/9、10/10，沒有系統性下降。`幫助詐欺 常業詐欺` 是邊界案例，列為後續監控。
  - 依預先定義的「median < 0.98、p05 < 0.95、或任一 top-10 overlap < 8」才重算，兩次稽核結果都是 **defer re-embed**。
- 監測條件：若語意路徑的失敗案例（問 A 答 B、候選未召回）集中在含 split 詞的判決，先分辨是 embedding、candidate recall、reranking 或 query formulation，再決定是否建立新 recipe；不要直接把所有問題歸因於 embedding。
- 顯示 snippet 與 `extract_excerpt` 的詞語匹配已改用共用正規化；lexical bigram tokenization 也使用同一函式，但 lexical RRF 仍預設關閉。這不改變 Qdrant 向量或 retrieval filter。
- 若未來 retrieval 失敗案例與被切開的詞明顯相關，才建立新的 index recipe/version 並重算；不得直接修改 `doc-head-tail-v1` 的文字而期待 payload hash 不變。
- 變更 index text 會改變 payload hash（`snippet` 在 hash 內），必須以新 recipe version 重建，不得原地覆寫。

## 13. 明確不做的事

- 不改 Qdrant collection。
- 不改 retrieval filter、embedding 或 reranker；只調整 matching／display 正規化（見第 12 節）。
- 不啟用 lexical RRF。
- 不提前開發 Legal Concept Layer。
- 不把 1,581 primary frame 的結果稱為整體 Recall。
- 不把 Phase 2 的 G1/G2 與 primary frame 直接相加而不去重。
- 不讓 sampler 自行重新解讀統計規則；所有母體、predicate、seed、權重與 CI 演算法以本規格與 manifest 為準。

## 14. 單一標註者 contingency（目前狀態）

目前專案只有一位開發者，沒有第二位標註者、裁決人與法律審閱者。允許的 reduced scope：

- 可以單人完成：Pilot 20、title precision 30、A 層 158。
- 不建議單人直接完成 365 + 雙人 20；沒有第二人就沒有 kappa、裁決與法律簽核。
- 單人報告 MUST 標記：
  - `single_annotator: true`
  - `inter_annotator_agreement: not_available`
  - `adjudication: not_available`
  - `legal_review: pending`
  - `ground_truth_status: provisional`
- 單人先算 `A+_loose`：
  - `A+_loose >= 105`：Tier 1 已確定（`Coverage_loose` 上限 <= 66.7%）；可停止，不必抽 C2，但只能宣稱保守上界。
  - `A+_loose < 105`：標記 `decision_undecided`，不得宣稱 Tier 2／Tier 3；先找第二位標註者或法律審閱者，再繼續。
- 沒有法律審閱者時，grade 規則只能標記 `engineering_provisional`，不得寫成法律簽核版本。

## 附錄 A：M/V 代碼表 provenance

```text
provenance_status：internal_consistency_checked_official_url_pending
來源名稱：司法院資料開放平台「裁判書」資料集 JID 格式
來源 URL：https://opendata.judicial.gov.tw/（category 051）
版本／公告日期：raw_rar 檔名含 2026-10-15 Update
下載日期：2026-11-16
內部對照：src/judgment/courts.py 的 JID_COURT_PREFIXES
  PCDM/PCDV、TPDM/TPDV、TCDM/TCDV、KSDM/KSDV… 均以末碼 M/V 成對
M 的定義：JID 第一段末碼 M；刑事
V 的定義：JID 第一段末碼 V；民事
分佈一致性：court+date 100,312 = M 2,375 + V 97,937；title 命中 210 全為 M
無法判定或例外 suffix：unknown（不得強制歸入 M/V）
官方代碼表 URL：待補；平台 category 004「統一代碼」目前無可讀 resources
對照人：OpenCode
對照日期：2026-11-16
```

- 在官方 URL 補齊前，M/V 只作抽樣分層訊號，不作為法律結論；Pilot 不需要等待此 URL。
- 若後續找到官方表且定義與此處不同，MUST 建立新 manifest 版本，不得覆寫 v2.0。

