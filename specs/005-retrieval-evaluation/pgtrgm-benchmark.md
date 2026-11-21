# pg_trgm A/B/C Benchmark（隔離環境）

- 狀態：Benchmark-only；**本文件的結論只適用於 `full_text`，不是 production 的 keyword filter index**
- 日期：2026-11-16；2026-11-21 補充
- 2026-11-21 更新：production `judgment_documents` 已建立 `jid`、`court`、`court_normalized`、`title`、`matched_laws_text` 五個 GIN trigram indexes（約 401 MB），供 `/api/query` keyword filter 使用；`full_text` 仍未建立 GIN index。
- 執行檔：`scripts/legal_term_trgm_benchmark.py`
- 報告：`.run/pg_trgm-benchmark-report.json`

## 1. 問題

`keyword_list` 目前只在有法院＋年份時啟用。若要支援無法院條件的全庫精確術語查詢，必須先回答：

> `pg_trgm` GIN 是否能在 4.68M 筆判決全文上，以可接受的延遲、索引大小與維護成本，加速精確片語查詢？

## 2. 隔離設計

```text
schema  legal_term_benchmark
table   judgment_documents_bench
index   judgment_documents_bench_trgm_idx
```

- Table 是 `judgment_documents` 的 deterministic `id_mod` sample，不是 production table。
- `normalized_fulltext` 使用 `SQL_NORMALIZE_EXPR`（`remove-unicode-space-v2` 的 SQL 對應）。
- 報告記錄 SQL 與 Python normalization 的抽查一致性。
- Index 只存在 benchmark schema；production table 沒有新增 GIN index。
- 報告明確標記 `is_formal_retrieval_index=false`。

## 3. A/B/C

| 組 | 查詢 | Index | 用途 |
|---|---|---|---|
| A | `LIKE '%term%'` | 無 | sequential scan baseline |
| B | `LIKE '%term%'` | GIN + pg_trgm | 預設 planner 的索引效果 |
| C | `LIKE '%term%' AND strpos(...) > 0` | GIN + pg_trgm | 候選加速＋完整片語驗證 |

另跑 `enable_seqscan=off` 的 forced B/C，只作診斷，不用來取代 default planner 結果。

每次查詢：

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT count(*) FROM legal_term_benchmark.judgment_documents_bench
WHERE normalized_fulltext LIKE '%term%';
```

記錄 p50／p95 execution time、planner node、index 使用率、shared hit/read blocks、matched rows。

## 4. 術語選擇

依字元長度分組，避免只用 `違約交割` 代表全部：

```text
2 字
3 字
4–5 字
6–8 字
9 字以上
```

優先納入 active 術語，再從 evidence snapshot 的每個長度 bucket 取高資料量術語；若某 bucket 沒有 sample 命中，仍放入一個 fallback 術語，確認短詞與長詞的 planner 行為。

## 4.1 本次結果（100k sample）

Environment：PostgreSQL 16.15、pg_trgm 1.6、`shared_buffers=128MB`、`work_mem=4MB`、benchmark build `maintenance_work_mem=512MB`。

```text
table rows                 101,769（id_mod:46；total 4,681,502）
table size                 97 MB
index build                227.05s
index size                 839 MB（after maintenance 840 MB）
normalization mismatches   0 / 20 checked
benchmark elapsed          545.67s
```

A/B/C default planner（20 terms，2 次 measurement + 1 warmup）：

| Mode | p50 median | p95 median | index usage | planner |
|---|---:|---:|---:|---|
| A：no index LIKE | 2,670.5 ms | 2,714.5 ms | 0% | 40/40 seq scan |
| B：GIN + LIKE | 14.5 ms | 14.6 ms | 90% | 36 bitmap / 4 seq |
| C：GIN + LIKE + strpos | 25.8 ms | 26.1 ms | 90% | 36 bitmap / 4 seq |

B vs A median p50 speedup：**182.8x**；C vs A：**102.6x**；C 比 B 多 **11.3 ms** median（完整片語 recheck）。

By length bucket（default planner，p50 median）：

| Length | Terms | A | B | C |
|---|---:|---:|---:|---:|
| 2 字 | 2 | 2,488.9 ms | 2,494.2 ms | 2,811.7 ms |
| 3 字 | 2 | 2,919.5 ms | 24.2 ms | 44.2 ms |
| 4–5 字 | 12 | 2,640.8 ms | 9.6 ms | 19.0 ms |
| 6–8 字 | 2 | 2,569.8 ms | 154.9 ms | 259.7 ms |
| 9 字以上 | 2 | 2,755.4 ms | 14.9 ms | 25.7 ms |

重要 finding：

- **2 字中文詞沒有加速**：`洗錢`、`抵銷` 的 default planner 選擇 sequential scan；forced bitmap index 反而約 2.6 倍慢（2 字 bucket forced B 6,467 ms），因為 trigram 候選幾乎涵蓋全部資料，還要 heap recheck。
- 4–5 字與 9+ 字選擇性最好；3 字也可用，但仍受詞頻影響。
- 6–8 字 bucket 的 median 較高，是因為 `侵權行為損害賠償`、`最高限額抵押權` 屬於高頻廣義詞，不是長度本身造成。
- B 的 20 個術語中有 10 個在 forced index 下比 default planner 慢；default planner 對其中 2 個直接選 seq scan。
- C 的 `strpos` 驗證成本約 11 ms；對 selective terms 可接受，但不能解決索引大小與 2 字詞選擇性問題。

維護成本（with-index，1000 筆 synthetic probe）：

```text
INSERT 1,000 rows     40.46 ms
UPDATE 1,000 rows     57.74 ms
DELETE 1,000 rows      3.66 ms
VACUUM (ANALYZE)     293.65 ms
index size delta       1.0 MB
```

Index 大小外推（線性近似，僅供量級判斷）：

```text
index bytes / row      839 MB / 101,769 ≈ 8.6 KB/row
full corpus estimate   ≈ 40.5 GB（4,681,502 rows）
build time estimate    ≈ 2.9 hours（227s × 46，僅量級）
```

這些是 benchmark sample 的實測與粗略外推，不是 production index 的保證值。

## 4.2 判讀

**不建議在現階段建立正式全庫 GIN index。**

理由：

1. **索引大小不可接受**：100k sample 已 839 MB；線性外推全庫約 40 GB。這會超過目前 DB 的維運與備份假設。
2. **2 字中文詞沒有選擇性**：`洗錢`、`抵銷` 的 trigram 候選幾乎等於全表；index 不會加速，甚至更慢。
3. **default planner 不一定用 index**：低選擇性術語仍會 seq scan；不能用「有 index」推論所有 `keyword_list` 查詢都會變快。
4. **C 的 exact verification 有成本**：約 11 ms；可接受，但無法解決前兩點。
5. **寫入與 VACUUM 成本**：benchmark 的 1000 筆 probe 很小，但全庫 index 的維護成本會隨 index 大小放大。

因此 `keyword_list` 仍只保有法院＋年份條件的精確通道；零命中 abstain，不退回 semantic。若要支援無法院條件的全庫查詢，應另外評估：

- 只對 `title` 或較小欄位建 index，而不是全文；
- 預先計算 term-document postings／inverted table；
- 外部全文搜尋（例如 OpenSearch／Tantivy）或 CJK tokenizer；
- `pg_bigm` 若未來可用，重新 benchmark；
- 針對 active 少量術語建立離線候選表，而不是全庫 GIN。

正式 index 的門檻仍見第 6 節；本階段不建立。

## 5. 判讀原則

- A/B/C 只比較候選掃描成本，不比較回答品質或 Recall。
- B 的 default planner 可能對低選擇性術語選擇 sequential scan；這是結果，不是失敗。
- C 的 `strpos` 是完整片語驗證；`LIKE` 本身已是精確匹配，C 主要測 recheck 成本。
- 索引大小與 build time 必須用同一 sample size 解讀；不能把小型 sample 的絕對值直接外推到 4.68M。
- 2 字中文詞的 trigram 選擇性可能很差；不能用 4 字詞的結果代表全部術語。

## 6. 正式採用門檻

在建立 production index 前，至少需要：

1. 全庫或足夠大 sample 的 A/B/C p50／p95。
2. Index size 與 build time 可接受。
3. 2／3／4–5／6–8／9+ 各長度組都有結果。
4. Normalization mismatch = 0，或已解釋並修正。
5. INSERT／UPDATE／VACUUM 成本可接受。
6. 有明確的 candidate_k 與 false-positive 控制；不能只用 trigram index 當最終答案。
7. 不改 Qdrant／embedding／reranker 的前提下，`keyword_list` 零命中仍必須 abstain。

## 7. 明確不做的事

- 不在 `judgment_documents` 建正式 GIN index。
- 不把 benchmark index 接入 RAG。
- 不用 pg_trgm 取代精確片語驗證。
- 不用小型 sample 的 speedup 宣稱全庫效能。
- 不因為 benchmark 有加速就自動啟用 429 個 candidate。
