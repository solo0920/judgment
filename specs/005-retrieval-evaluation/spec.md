# Judgment Retrieval Evaluation Specification v1.0

- 狀態：Draft（P1.6）；2026-11-16 baseline 的歷史快照

> **Historical snapshot**：本文的 baseline、召回稽核與筆數是 2026-11-16 的研究快照；目前資料為 4,714,967 筆 current 判決、`judgments_current → judgments_v005`。若要拿數字做決策，請先重跑 benchmark／稽核，不要直接把舊值當成現況。
- 日期：2026-11-16
- 適用範圍：Judgment RAG 的結構化檢索、語意檢索、混合排序與引用驗證
- 現行實作：P0 Structured Retrieval + P1 Query Plan / Lexical RRF（預設關閉）

## 1. 目的

本規格定義 Judgment Retrieval 的可重現評估方式，避免把「功能完成」誤認為「檢索品質已證明」。評估必須能區分：

1. 條件式檢索是否正確（precision / filter violation）
2. 應出現的判決是否被找回（recall）
3. 排序是否合理（nDCG / MRR）
4. 回答是否有證據支持（citation / faithfulness）
5. 什麼情況下應該 abstain（abstention）

## 2. 測試資料格式

每一題使用獨立 JSON 物件：

```json
{
  "id": "eval_0001",
  "split": "dev",
  "question": "2000年至2010年在板橋地方法院相關詐騙的判決有那些",
  "intent": "judgment_list",
  "expected": {
    "filters": {
      "year_from": 2000,
      "year_to": 2010,
      "courts": ["臺灣新北地方法院", "臺灣板橋地方法院"],
      "topics": ["詐欺"]
    },
    "relevant_jids": [
      "PCDM,94,簡,2998,20050630,1"
    ],
    "graded_relevance": {
      "PCDM,94,簡,2998,20050630,1": 2
    },
    "must_have_fields": ["jid", "court", "jdate", "title"],
    "answer_required": true,
    "abstain_expected": false,
    "reference_answer": "符合條件的判決共 … 筆"
  }
}
```

### 2.1 標註規則

- `graded_relevance`：
  - `2`：直接回答問題，法院、年份、案由與事實均相關。
  - `1`：部分相關，可作為補充但不能單獨回答。
  - `0`：不相關。
- `relevant_jids` 必須由**獨立於 parser** 的流程產生：
  - PostgreSQL `judgment_documents` 條件查詢
  - 判決全文關鍵字／人工確認
  - 不得只使用 `parse_judgment_query()` 的輸出當唯一標準
- 若問題沒有明確答案，必須標記 `abstain_expected=true` 並註明原因。
- 每一題至少保留 1 位標註者；正式測試集建議 2 位標註並計算 agreement。

### 2.2 Query Variants

同一需求可有多種自然語言問法，必須共用同一個 `group_id` 與 ground truth：

```json
[
  {
    "id": "banqiao_fraud_2000_2010_v1",
    "group_id": "banqiao_fraud_2000_2010",
    "question": "2000年至2010年在板橋地方法院相關詐騙的判決有那些"
  },
  {
    "id": "banqiao_fraud_2000_2010_v2",
    "group_id": "banqiao_fraud_2000_2010",
    "question": "板橋地院在 2000 至 2010 年間有哪些詐騙案件？"
  },
  {
    "id": "banqiao_fraud_2000_2010_v3",
    "group_id": "banqiao_fraud_2000_2010",
    "question": "新北地院改制前，板橋地院的詐欺案件有哪些？"
  },
  {
    "id": "banqiao_fraud_2000_2010_v4",
    "group_id": "banqiao_fraud_2000_2010",
    "question": "涉及詐欺的板橋地院判決，時間限定在 2000–2010 年"
  }
]
```

評估時必須同時檢查：

- 同一 group 的 parser 條件是否一致。
- 同一 group 的 retrieval mode 是否合理一致。
- 不同問法是否導致 Recall/nDCG 明顯變動。

注意：若 variant 省略明確年份（例如「新北地院改制前」），目前 parser 不會自行推導 2000–2010；這種相對時間條件必須記在 `expected.filters`，或由 Court Registry／時間推理模組補上。未補上前不得假設它與原始題共用完全相同的 ground truth。

### 2.3 專有名詞精確通道（keyword_list）

- 法律術語、法條、案由、專有名詞 MUST 優先走精確比對，不得只靠 dense embedding。
- 術語來源：`src/judgment/data/legal_terms_registry.json`（由 `src/judgment/legal_terms.py` 載入），包含 `違約交割`、`內線交易`、`操縱股價`；審核流程與資料證據見 `specs/005-retrieval-evaluation/legal-term-registry.md`。
- `keyword_list` 預設按裁判日期排序；詞頻只作 `term_occurrences` 輔助欄位，不決定排序優先順序。
- 語意路徑可對 `expansion_enabled=true` 的術語附加高優先順序的相關詞，僅用於 embedding query；原問題仍用於 rerank、citation 與回答。`retrieval.query_expansion` MUST 記錄 `enabled`、`matched_terms`、`expansion_terms` 與長度。
- 是否啟用某術語的 expansion，以無法院條件的 top20／top50 全文命中 proxy 決定；proxy 不是 Recall/precision ground truth，見 `legal-term-registry.md`。
- 觸發條件：問題有 list intent、法院與年份條件，且偵測到術語。
- 比對範圍：該法院／年份內的 PostgreSQL `judgment_documents.full_text`，使用 `remove-unicode-space-v2` 正規化後片語比對。
- 命中時：`retrieval_mode=keyword_list`，按出現次數與日期排序，顯示條件回顯與資料覆蓋年份。
- 0 命中時：直接回答「查無正規化全文含該術語的判決」，不得退回「違約金」等近似詞的向量結果。
- 若法院／年份要求超出資料庫收錄範圍（例如士林地院 1995–1997 無資料），回答 MUST 顯示實際收錄年份。
- 沒有法院條件時，暫不逐筆掃全庫；需先完成 `pg_bigm`／`pg_trgm` 等全文索引 benchmark，再擴充精確通道。2026-11-16 已在隔離 schema 跑 pg_trgm A/B/C，尚未建立正式 index；見 `pgtrgm-benchmark.md`。
- 回歸案例：`士林地方法院在1995到2000年間有什麼和違約交割相關的案子?` MUST 回傳 `SLDV,89,訴,367,20000728`，不得只回傳「給付違約金」案件。
- 資料診斷：全庫 1,589 筆含「違約交割」，只有 603 筆在 head 1,600 字內；head/tail dense index 對這類中段詞不足，這是精確通道的必要性證據。

### 2.4 資料切分

- `dev`：70%，可調整 Router、權重、案由規則。
- `test`：30%，只評估，不參與調校。
- 題型分層：
  - A 結構化查詢（法院、年份、案由、案號）
  - B 精確查詢（案號、法條、日期）
  - C 純語意查詢（事實、爭點、裁判理由）
  - D 複合查詢（法院＋年份＋案由＋爭點）
  - E 多跳查詢（判決→法條→其他判決）
  - F 無答案／資料不足
  - G 誤路由反例（概念題 vs 列表題）

## 3. 評估指標

### 3.1 檢索

| 指標 | 定義 |
|---|---|
| Filter Violation Rate | 回傳判決中，不符合硬條件的比例 |
| Recall@10 / @20 | `relevant_jids` 在前 K 筆中的比例 |
| Precision@10 | 前 10 筆中 graded relevance > 0 的比例 |
| nDCG@10 | 使用 graded relevance 計算排序品質 |
| MRR | 第一個 relevant judgment 的倒數排名 |
| Expected Count Match | 結構化題的 `total_matches` 與獨立基準筆數是否一致 |

### 3.2 回答

| 指標 | 定義 |
|---|---|
| Citation Existence | 引用 jid 是否存在於資料庫 |
| Citation Accuracy | 引用 jid、法院、日期、條號是否對應正確 |
| Faithfulness | 回答主張是否有檢索證據支持 |
| Answer Correctness | 與人工標準答案的一致性 |
| Abstention Accuracy | 無答案題是否正確拒答 |
| p50 / p95 Latency | 分題型統計 |

## 4. A/B 組別

| 組別 | 檢索方式 |
|---|---|
| A | Dense only |
| B | Dense + 現有 lexical RRF（候選內重排） |
| C | Dense + 真正 Sparse/BM25 候選來源 |
| D | Structured filter + Dense + Sparse + RRF |

比較：

- Retrieval metrics
- Answer metrics
- Latency / memory / index cost
- 統計顯著性（bootstrap confidence interval）

只有 C 或 D 在 test split 上有可重現且統計顯著的提升，才值得進行 P1.5 重建 collection。

## 5. 通過門檻（草案）

### 硬性門檻

| 指標 | 門檻 |
|---|---:|
| 結構化題 Filter Violation Rate | 0% |
|  Citation Existence | 100% |
| Citation Accuracy | ≥ 98% |
| 結構化題 Expected Count Match | 100%（人工確認基準） |
| 無答案題 Abstention Accuracy | ≥ 95% |

### 品質門檻

| 指標 | 門檻 |
|---|---:|
| Recall@20 | 相對 baseline +10% 或絕對 +0.05 |
| nDCG@10 | 相對 baseline +5% |
| Answer Correctness | A/B 有統計顯著改善 |
| 結構化題 p95 latency | < 3 秒 |
| 語意題 p95 latency | < 15 秒 |

未達門檻時不得替換正式檢索流程；新功能必須以 Shadow Mode 或 feature flag 執行。

## 6. 現行 Baseline（2026-11-16）

### Benchmark

```text
suite: tests/benchmarks/rag_query_suite.json
cases: 23
passed: 23
filter violation rate: 0
avg latency: 4.44s
structured p95: 1.96s
semantic avg: 8.86s
semantic p95: 10.76s
```

### 召回稽核

問題：

```text
2000年至2010年在板橋地方法院相關詐騙的判決有那些
```

| 項目 | 數值 |
|---|---:|
| Qdrant base court+date | 100,312 |
| PostgreSQL court+date total | 100,312 |
| Coverage gap | 0 |
| Qdrant total | 210 |
| Qdrant unique jids | 210 |
| Duplicate jids | 0 |
| PostgreSQL title matches | 210 |
| PostgreSQL normalized full-text `詐欺`/`詐騙` matches | 1,788 |
| Full-text only（title 未命中） | 1,581 |
| Title/full-text ratio | 11.74% |

判讀：

- Qdrant 在該 court+date 範圍的覆蓋率為 100%，沒有索引缺漏；問題是 **title 作為案由代理偏窄**，不是 Qdrant 少索引。
- 1,788 是去除空白後的寬鬆全文參考，不是 precision oracle；`給付票款`、`確認本票債權不存在` 等案由也可能在全文提到詐欺。
- 1,788 = 1,581（title 未命中）+ 207（title 命中且正規化全文命中）；另有 3 筆 title 命中但全文未命中，仍納入 title precision 母體 210。此處 207 是全文交集，不是舊版 M 層差額。
- **11.74% 不得引用為 Recall**；它是 title-only 覆蓋率的下限警示。正式 Recall 必須用人工標註的 `relevant_jids`。

### 分層標註（v2.0）

正式抽樣與標註規則已移至 `specs/006-fraud-relevance-annotation/spec.md`。摘要：

- primary frame：1,581 筆 title 未命中、正規化全文含「詐欺」或「詐騙」。
- A/B/C1 全量標註；C2 抽 50。
- title precision 另抽 30；pilot 20 只從 A/B/C1 抽。
- 盲標佇列混排 365 + 30 筆，`sampling_stratum` 與 JID 只在分析階段 join。
- 舊 `scripts/build_eval_sample.py` 只供 exploratory 使用，不是正式 ground truth。

建立 v2.0 樣本與 manifest：

```bash
uv run python scripts/build_fraud_relevance_sample.py
```

輸出 `.run/fraud_relevance/`，包含盲標佇列、pilot、analysis key 與凍結 manifest。未完成標註與 adjudication 前不得計算 Recall 或 Coverage。

### 已知限制

1. 案由 filter 依賴 `title`；全文涉及詐欺但案由不同的判決會漏。列舉模式 MUST 顯示：「此清單依案由含詐欺篩選，不含案由不同但內容涉及詐欺的判決（例如案由為洗錢或偽造文書者）。」若有 `total_matches >` 顯示筆數，MUST 附「完整清單請至資料庫查詢頁」與可複製的查詢條件。
2. 索引文字仍是 `doc-head-tail-v1`，未套用 `remove-unicode-space-v2`；200 筆稽核 cosine median 0.9858、p05 0.9689、top-10 overlap 8–10/10，暫不重算 4,681,502 筆向量。若後續 retrieval 失敗與被切開的詞明顯相關，再建立新 recipe/version。
3. 目前 lexical RRF 只在 dense 候選內重排，不增加召回，且預設關閉。
4. 尚未建立 Court Registry 的 `valid_from`／`valid_to`。
5. 尚未有 Chunk-level evidence retrieval。
6. 23 題 Benchmark 只覆蓋 regression，不足以證明整體品質。

## 7. 執行方式

```bash
# 23 題 regression
uv run python scripts/rag_query_benchmark.py \
  --suite tests/benchmarks/rag_query_suite.json \
  --output .run/rag_benchmark.json

# 單題 duplicate / PostgreSQL recall audit
uv run python scripts/rag_recall_audit.py \
  --question "2000年至2010年在板橋地方法院相關詐騙的判決有那些" \
  --output .run/rag_recall_audit.json

# Lexical A/B（目前預設關閉）
RAG_LEXICAL_RRF_ENABLED=false uv run python scripts/rag_query_benchmark.py
RAG_LEXICAL_RRF_ENABLED=true  uv run python scripts/rag_query_benchmark.py
```

## 8. 後續工作

| 階段 | 工作 | 完成標準 |
|---|---|---|
| P1.6 | 100–300 題人工標註 | dev/test split、graded relevance |
| P1.7 | A/B retrieval | Recall/nDCG 統計顯著 |
| P1.8 | Query Plan 調校 | 誤路由率下降 |
| P2.0 | Chunk-level index | 可定位判決內證據段落 |
| P2.1 | Evidence reranking | 證據排序改善 |
| P2.2 | Claim verification | 每項主張可對應原文 |

在 P1.6 完成前，不得以 23 題通過率宣稱整體檢索準確度已提升。
