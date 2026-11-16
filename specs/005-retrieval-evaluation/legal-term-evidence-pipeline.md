# Legal Term Evidence Pipeline v1.0

- 狀態：Engineering snapshot（尚無法律審閱、尚無 human-reviewed ground truth）
- 日期：2026-11-16
- 適用範圍：429 個 registry 術語的全文證據、候選排序與 ground-truth 候選
- 不適用：自動啟用術語、修改 Qdrant／embedding／reranker、正式 retrieval pipeline

## 1. 目的

Registry 解決「有哪些金融法律概念」，Evidence Pipeline 解決下一個問題：

> 哪一個術語真的有司法資料、分布可解釋，值得投入人工標註與 A/B/C benchmark？

這不是把命中次數當成相關性。全文命中只是 `exact_match_proxy`，判決提到術語不代表本案實質處理該概念。

## 2. 輸出檔案

| 檔案 | 用途 | 是否會改 Registry |
|---|---|---|
| `.run/legal_term_evidence.json` | 429 術語的全文統計快照 | 否 |
| `.run/legal_term_priority.csv` | 可排序的人工審閱佇列 | 否 |
| `.run/legal_term_priority.json` | 排序摘要與完整 tier 清單 | 否 |
| `.run/legal_term_ground_truth_candidates.json` | 正例／反例候選與標註協定 | 否 |
| `.run/legal_term_ground_truth_candidates.csv` | 逐候選標註工作表 | 否 |
| `.run/pg_trgm-benchmark-report.json` | pg_trgm A/B/C benchmark（獨立 schema） | 否 |

Registry 仍是唯一術語來源；證據與排序結果不直接回寫 `legal_terms_registry.json`。

## 3. Evidence Snapshot

### 3.1 抽樣

指令：

```bash
uv run python scripts/legal_term_evidence.py \
  --limit 200000 \
  --output .run/legal_term_evidence.json
```

本次快照：

```text
requested_limit       200,000
scanned_rows          203,543
total_current_rows    4,681,502
sample_fraction       4.35%
sample_method         id_mod:23
matched_documents     90,699（44.6%）
terms_with_hits       147 / 429
terms_zero_hits       282 / 429
terms_proxy_supported 72（sample df >= 20）
elapsed               239.18s
```

`id_mod` 是 deterministic systematic sample，不是 random sample，也不是全庫普查。`estimated_full_corpus_df = sample_df / actual_sample_fraction` 只是估計值。

### 3.2 匹配規則

- 使用 `remove-unicode-space-v2` 正規化全文。
- 同時匹配標準術語與 `exact_variants`。
- 採 longest exact variant 匹配；較長變體包含較短 registry 術語時，較短術語仍計入（例如 `分層洗錢` 會讓 `洗錢` 得到一次 document frequency）。
- 同一術語的重疊變體不重複計數。
- 這仍是 exact phrase match，不是語意相似度，也不是法律要件判斷。

### 3.3 每個術語的欄位

```text
term / term_id / category / active / review_status
term_length / length_bucket
document_frequency
estimated_full_corpus_df
occurrence_count
term_density
paragraph_frequency
court_distribution / court_diversity / court_other_count
year_distribution / year_coverage / year_min / year_max
title_distribution / title_diversity / title_other_count
positive_jid_candidates / positive_jid_sample_size
negative_jid_candidates / negative_jid_sample_size
sample_support
evidence_snapshot_id / evidence_generated_at
```

`document_frequency` 是快照內含該術語（或變體）的判決數；`term_density` 是每份命中判決的平均出現次數；`paragraph_frequency` 以換行分段計算，不是法律上的段落意義。

### 3.4 正例候選

每個術語用 stable hash bottom-k 抽樣，固定 `seed=42`。正例候選只代表「正規化全文含精確術語／變體」，不代表實質相關。記錄 JID、法院、年份、案由、出現次數、命中變體與同判決中的其他 registry 術語。

### 3.5 反例／confuser 候選

反例由同類別其他術語的正例樣本推導，優先順序：

1. 同案由
2. 同法院
3. 同年份
4. 僅同類別

再以 stable hash bottom-k 抽樣。它們是 exact-match confuser，不是 substantive negative。

## 4. Priority Queue

指令：

```bash
uv run python scripts/legal_term_priority.py \
  --evidence .run/legal_term_evidence.json \
  --output .run/legal_term_priority.csv
```

分數不是單一命中量排序，而是四個訊號：

| 訊號 | 上限 | 說明 |
|---|---:|---|
| Coverage | 40 | `log1p(estimated_full_corpus_df)`，避免少數高頻詞獨大 |
| Specificity | 45 | 詞長、類別、專業構詞、generic civil 懲罰 |
| Discrimination | 13 | 案由集中度、法院廣度、年份廣度 |
| Evidence quality | 10 | 正／反例樣本是否足夠 |

Dense-retrieval complementarity 暫列 `pending_dense_benchmark`，不納入目前分數；必須等 A/B/C retrieval benchmark 後才能填。

本次快照 tier：

```text
P0_review_now      35
P1_review_next     28
P2_collect_data    74
P3_hold_no_data   282
```

Tier 是審閱順序，不是啟用狀態。Generic civil 與高頻程序性術語（例如 `侵權行為損害賠償`、`本票裁定`）即使 coverage 高，也不會只因命中量進入 P0。

## 5. Ground Truth Candidate Protocol

指令：

```bash
uv run python scripts/legal_term_ground_truth_candidates.py \
  --evidence .run/legal_term_evidence.json \
  --priority .run/legal_term_priority.json \
  --output .run/legal_term_ground_truth_candidates.json
```

本次快照：

```text
terms                    429
positive_candidates    1,818（每術語最多 20）
negative_candidates      720（每術語最多 5）
terms_proxy_ready         70（>=20 positives 且 >=5 negatives）
```

`proxy_ready` 只表示候選數量足夠做 proxy benchmark，不表示 `benchmark_ready` 或 `human_reviewed`。

標註欄位：

```text
relevance_label = "" / 0 / 1 / 2
label_status    = unlabeled
human_reviewed  = false
legal_reviewed  = false
benchmark_ready = false
promotion_allowed = false
```

建議標註：

- `2`：判決實質處理該法律概念。
- `1`：部分相關，或僅作為支持性爭點。
- `0`：雖然出現精確詞，但實質不相關。
- 空白：尚未標註。

人工標註結果必須另存，不得直接改寫 registry 或把 proxy 當成 legal review。

## 6. 已知限制

- 200k 是 4.35% systematic sample；282 個術語在樣本內零命中，不代表全庫零命中。
- 全文命中不是 relevance；`短線交易` 可能出現在夫妻剩餘財產分配判決。
- 反例是 confuser，不是法律上的 negative。
- `estimated_full_corpus_df` 受抽樣與術語變體影響，不能當精確統計。
- Registry 內 419 個 candidate 仍全部 `engineering_pending`。
- 沒有法律背景人員簽核，因此沒有任何術語是 `legal_reviewed`。
- 沒有 dense A/B/C benchmark，因此 `dense_complement_score` 仍為空。

## 7. 下一步

1. 對 P0 佇列做法律 relevance 標註，優先處理 `proxy_ready` 的 70 個術語。
2. 對 active 10 術語補齊 human-reviewed ground truth，重跑既有 proxy A/B/C。
3. 在獨立 benchmark schema 完成 pg_trgm A/B/C 與維護成本測試；尚未建立正式 GIN index。
4. 依標註與 benchmark 結果，才考慮把 candidate 升為 active；一次只升少量術語。
5. 若需要全庫統計，再跑 `--full`；這會是約 4.68M 筆的長時掃描，不應與線上查詢同時進行。

pg_trgm 的隔離 A/B/C 結果另行記錄於 `pgtrgm-benchmark.md`：100k sample 的 index 已達 839 MB，2 字中文詞沒有加速，因此現階段不建立正式全庫 GIN index。
