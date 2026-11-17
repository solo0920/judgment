# Legal Term Expansion Evaluation Specification v1.0

- 狀態：Draft（Benchmark-ready）
- 日期：2026-11-16
- 適用範圍：`semantic`／`structured_semantic` 路徑的法律術語 query expansion
- 不適用：`keyword_list` 精確通道；該通道另有零命中 abstain 契約

## 1. 目的

定義一套可重現的 A/B/C 實驗，回答一個問題：

> 對某個法律術語，把相關詞附加到 embedding query，是否真的提升檢索品質，而不是只把更多同類案件塞進 top 50？

Expansion 不是越多越好。某些術語（例如「內線交易」）原始語意已足夠明確，expansion 可能反而降低 top precision；有些術語（例如「財報不實」）原始召回很低，expansion 才值得測試。

## 2. 三条路徑

| 模式 | 用途 | 是否套用 expansion |
|---|---|---|
| `keyword_list` | 精確術語＋法院／年份 | 否 |
| `structured_semantic` | 結構 filter＋語意 | 是，僅限 `expansion_enabled=true` |
| `semantic` | 一般語意 | 是，僅限 `expansion_enabled=true` |

Expansion 只改變 embedding query；原問題仍用於 reranker、citation 與回答。`retrieval.query_expansion` 必須記錄 `enabled`、`matched_terms`、`expansion_terms` 與長度。

## 3. Ground Truth

### 3.1 兩層 ground truth

| 類型 | 產生方式 | 可支持的結論 |
|---|---|---|
| `exact_match_proxy` | PostgreSQL 正規化全文含該術語的 JID，固定 seed 抽樣 | 只能說「proxy 召回／排序有變化」 |
| `human_reviewed` | 人工確認判決實質上是否處理該法律概念 | 才能說「benchmark_approved」 |

`exact_match_proxy` 不是 substantive relevance；判決全文提到「違約交割」不代表本案就是違約交割案件。報告必須明確標示 `ground_truth_type`。

### 3.2 每術語資料量

- 每個術語至少 **20 筆 positive**（全文含該術語）。
- 每個術語至少 **5 筆 negative／confuser**（語意相近但不是同一概念）。
- 若該術語全庫少於 20 筆，如實記錄 `n`，不得標記 `benchmark_approved`。
- 固定 `seed=42`，先按 `jid` 排序再抽樣。
- 正例與負例清單存入 `legal_term_benchmark_v1.json`，並記錄 SQL predicate、資料庫版本、抽樣日期。

### 3.3 Evidence Pipeline v1.0

2026-11-16 已建立 200k deterministic sample 的證據快照（203,543 筆）：

- 429 術語中 147 個有 sample 命中、72 個達到 sample df>=20。
- 產生 1,818 個 positive exact-match proxy 與 720 個 confuser。
- 70 個術語達到 `proxy_ready`（>=20 positives、>=5 negatives），但**沒有一個是 `human_reviewed` 或 `benchmark_approved`**。
- 檔案與流程見 `legal-term-evidence-pipeline.md`。

2026-11-17 起 `RAG_LEGAL_EXPANSION_ENABLED` 預設為 `false`；5 個術語的 registry 也已改為 `expansion_enabled=false`、`expansion_decision=disabled`。歷史 proxy 數據保留在 `expansion_evaluation`，但正式 semantic 查詢不套用。

2026-11-17 另跑了一次 **免人工標註的 exact-match proxy probe**（`scripts/legal_term_expansion_probe.py`）：

- 5 個 expansion 啟用術語；每個術語取 exact positives 最多的法院＋年份範圍，A/B 使用相同 filter、top 50、score threshold 0.35。
- Relevant set 是正規化全文含該術語的 JID，不是 substantive relevance。
- 結果：只有 `違約交割` 的 Recall@8 從 0 變成 0.083（1/12）；其餘 4 個術語 A/B 都是 0；5 術語 mean ΔRecall@8 = +0.0167，median = 0。
- 所有 proxy positives 都在 Qdrant alias 中（`indexed_relevant_ratio=1.0`），所以這不是單純索引覆蓋不足；但 scope 仍寬，且只測 5 個術語。
- 這不足以支持保留 expansion；因此 runtime 維持預設關閉。報告為 `.run/legal_term_expansion_probe.json`，`claim_recall_improvement=false`。

這些候選只能支撐 `exact_match_proxy`；不得用來說「Recall 改善」。人工標註必須使用 graded relevance 2/1/0，且不得把 proxy 清單直接回寫 Registry。

### 3.4 Query 設計

每個術語至少兩個 query：

```text
term_query:       "違約交割的判決"
concept_query:    "證券交易法裡關於違約交割的實務見解"
```

不得把法院／年份放入 expansion benchmark；expansion 的目標是語意召回，不是結構 filter。結構 filter 由 `structured_semantic` 另行測試。

## 4. A/B/C 實驗

三組使用完全相同的 ground truth、candidate_k、Qdrant collection、embedding model 與 reranker 設定：

| 組 | Query | Retrieval | Reranker |
|---|---|---|---|
| A | original | dense top 50 | 否 |
| B | original + legal expansion | dense top 50 | 否 |
| C | original + legal expansion | dense top 50 | 是，top 10 |

C 只用來判斷 reranker 是否補救或放大 expansion 的影響；**expansion 是否核准，以 B vs A 為主**。

固定參數：

```text
candidate_k = 50
top_k = 10
score_threshold = 0.35
reranker_model = bge-reranker-v2-m3
seed = 42
```

## 5. 指標

| 指標 | 定義 | 用途 |
|---|---|---|
| Recall@20 | relevant JIDs 在 top 20 的比例 | 是否找回更多相關判決 |
| Recall@50 | relevant JIDs 在 top 50 的比例 | 候選召回是否增加 |
| Precision@10 | top 10 中 relevant 的比例 | 是否引入不相關判決 |
| Precision@20 | top 20 中 relevant 的比例 | 同上，較寬鬆 |
| nDCG@10 | graded relevance 的排序品質 | 相關判決是否排在前面 |
| MRR | 第一筆 relevant 的倒數排名 | 第一筆相關判決的位置 |
| Candidate Diversity | top 20 中 unique title 數／20 | 是否只找到同一類案件 |
| Latency p50 / p95 | embedding＋search（C 再加 rerank） | expansion 的效能成本 |

`exact_match_proxy` 的 relevant set 為該術語 positive JIDs；negative／confuser JIDs 視為 non-relevant。`human_reviewed` 使用 graded relevance：2 = 直接處理該概念，1 = 部分相關，0 = 不相關。

## 6. 決策門檻（預先註冊）

以 B vs A 的 absolute delta 為準，C 只作診斷：

### 6.1 `benchmark_approved`

同時滿足：

```text
Recall@20 delta >= +0.05
Precision@10 delta >= -0.02
nDCG@10 delta >= +0.02
Latency p95 delta <= +500 ms
```

且 ground truth 必須是 `human_reviewed`；`exact_match_proxy` 只能得到 `proxy_approved`。

### 6.2 `proxy_approved`

- 已有 proxy 數據，且沒有明顯 precision 崩壞。
- 尚未完成 human-reviewed ground truth。
- 可以保留 expansion 進行測試，但不得對外宣稱 Recall 改善。

### 6.3 `disabled`

任一條件成立：

```text
Precision@10 delta <= -0.05
nDCG@10 delta <= -0.02
Latency p95 delta >= +1000 ms
```

或 human review 發現 expansion terms 會引入不同法律概念。

### 6.4 `legal_reviewed`

- 法律背景人員確認術語、變體與 expansion terms 的法律語義。
- `legal_reviewed` 不能替代 `benchmark_approved`；兩者獨立。

## 7. Registry 評估欄位

`src/judgment/data/legal_terms_registry.json` 的每個術語增加（由 `src/judgment/legal_terms.py` 載入）：

```text
expansion_decision: proxy_approved | benchmark_approved | disabled | legal_reviewed
expansion_evaluation:
  baseline_version: original-query-v1
  benchmark_version: legal-term-benchmark-v1
  ground_truth_type: exact_match_proxy | human_reviewed
  sample_size: int
  recall_at_20_delta: float | null
  recall_at_50_delta: float | null
  precision_at_10_delta: float | null
  ndcg_at_10_delta: float | null
  latency_p95_delta_ms: float | null
  reviewed_at: ISO date | null
```

三個狀態不可互相替代：

- `proxy_approved`：proxy 數據支持測試。
- `benchmark_approved`：human-reviewed ground truth 證明有效。
- `legal_reviewed`：法律語義確認。

## 8. 報告格式

`legal_term_expansion_report.json`：

```json
{
  "benchmark_version": "legal-term-benchmark-v1",
  "ground_truth_type": "exact_match_proxy",
  "seed": 42,
  "candidate_k": 50,
  "terms": [
    {
      "term": "違約交割",
      "query": "違約交割的判決",
      "sample_size": 20,
      "a": {"recall_at_20": 0.0, "precision_at_10": 0.0, "ndcg_at_10": 0.0, "mrr": 0.0},
      "b": {"recall_at_20": 0.0, "precision_at_10": 0.0, "ndcg_at_10": 0.0, "mrr": 0.0},
      "c": {"recall_at_20": 0.0, "precision_at_10": 0.0, "ndcg_at_10": 0.0, "mrr": 0.0},
      "delta_b_vs_a": {"recall_at_20": 0.0, "precision_at_10": 0.0, "ndcg_at_10": 0.0},
      "latency": {"a_p50_ms": 0, "a_p95_ms": 0, "b_p50_ms": 0, "b_p95_ms": 0},
      "decision": "proxy_approved"
    }
  ],
  "aggregate": {
    "terms": 10,
    "mean_recall_at_20_delta": 0.0,
    "mean_precision_at_10_delta": 0.0,
    "mean_ndcg_at_10_delta": 0.0,
    "p95_latency_delta_ms": 0
  }
}
```

## 9. 執行順序

1. 從 `.run/legal_term_ground_truth_candidates.json` 取 10 個 active 術語的 `exact_match_proxy` positives／negatives；不足 20 positives 或 5 negatives 的術語如實記錄。
2. 跑 A/B（必要時 C），輸出 report。
3. 依 6.1–6.3 標記 `proxy_approved`／`disabled`。
4. 對 `proxy_approved` 且值得投入的術語，建立 human-reviewed ground truth。
5. 重跑 A/B；符合 6.1 才改為 `benchmark_approved`。
6. 法律審閱獨立進行，通過才加 `legal_reviewed`。

## 10. 明確不做的事

- 不用 expansion 取代 `keyword_list`。
- 不用 proxy 數據宣稱 Recall 或 precision 改善。
- 不用 expansion 放寬法院／年份／案由 filter。
- 不改 embedding model、Qdrant collection 或 reranker。
- 不因為某術語有 expansion 就自動加入更多同義詞。
- `pg_trgm` extension 已安裝（2026-11-16），但不在本階段建立正式 GIN index，也不接入正式 retrieval pipeline。
