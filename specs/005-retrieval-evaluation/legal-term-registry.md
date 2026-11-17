# Legal Term Registry

- 狀態：Engineering-approved registry（尚無法律審閱）
- 日期：2026-11-16
- 程式來源：`src/judgment/legal_terms.py`
- 資料來源：`src/judgment/data/legal_terms_registry.json`
- 規模：**429 個候選術語**；目前 **10 個 active**、**419 個 candidate**
- 用途：精確術語召回（`keyword_list`）與受控語意 expansion，不是一般同義詞表

429 個術語分為 17 類：

```text
aml_cft_virtual_assets                 31
banking_deposit_credit                 32
civil_contract_debt                    25
corporate_finance_mna_supervision      26
corporate_governance                   30
financial_consumer_protection          27
funds_asset_management                 20
futures_derivatives                    25
fx_cross_border                        19
insurance_contract_supervision         32
internal_control_audit_compliance      26
maritime_trade_agricultural_finance    20
negotiable_instruments_secured_finance 20
payments_fintech                       20
privacy_competition_consumer_disputes  25
securities_capital_markets             31
trust_securitization                   20
```

所有 candidate 的 `review_status=engineering_pending`、`expansion_enabled=false`、`active=false`；不會改變目前 retrieval 行為。只有原本 10 個 engineering-approved 術語是 active。

### Evidence snapshot（2026-11-16）

以 `scripts/legal_term_evidence.py --limit 200000` 產生 `.run/legal_term_evidence.json`：

```text
scanned_rows          203,543 / 4,681,502（4.35% deterministic sample）
matched_documents     90,699
terms_with_hits       147 / 429
terms_zero_hits       282 / 429（sample 內零命中，非全庫零命中）
terms_proxy_supported 72（sample df >= 20）
```

- 這是 `exact_match_proxy`，不是 substantive relevance。
- `scripts/legal_term_priority.py` 產生 35 個 P0、28 個 P1、74 個 P2、282 個 P3；tier 只是審閱順序。
- `scripts/legal_term_ground_truth_candidates.py` 產生 1,818 個正例候選、720 個 confuser、70 個 proxy-ready 術語。
- 沒有任何 candidate 因這份 snapshot 改變 `active`、`review_status` 或 `expansion_enabled`。
- 完整設計與限制見 `legal-term-evidence-pipeline.md`。

### Registry-external scope probe（2026-11-17）

只有 10 個 active 術語是 must-term：零命中維持拒答。其餘 419 個 candidate 與 registry 外名詞，在**有法院或年份條件**且 parser 沒有已知 topic facet 時，會用同一套正規化全文 probe；list intent 只影響顯示成清單或摘要，不再決定是否查證：

- 命中：回傳 `keyword_list` 精確清單，`retrieval.scope_probe` 記錄 hit terms；非 active 詞會加註「尚未完成法律審閱」。
- 零命中：不拒答；改用 semantic 檢索，並在 notice 揭露「判決內文未出現『該詞』字樣，以下為語意相近結果」。
- Registry 內 candidate 零命中時額外標示「仍是 candidate，尚未啟用精確拒答」。
- 有法院或年份單獨條件即可 probe；若候選集超過 `RAG_SCOPE_PROBE_MAX_DOCUMENTS`（預設 50,000）、逾時 `RAG_SCOPE_PROBE_TIMEOUT_MS`（10,000ms）或單詞命中超過 `RAG_SCOPE_PROBE_MAX_HITS`（5,000），會跳過精確清單並揭露。
- 零命中／跳過模式不呼叫 LLM，只顯示語意檢索清單與揭露文字；命中很多時顯示總數加前 20 筆。
- 目前 parser 已解析出 topic（例如 `詐欺`、`洗錢`）時不重複 probe，保留原有 structured list。
- 測試：`tests/test_legal_term_probe.py`、`tests/test_rag.py` 的 external scope 零命中／命中案例。

這個 probe 是精確片語存在性檢查，不是法律相關性；零命中語意結果不可標成 exact keyword list。

## 目前術語

| 術語 | 精確變體 | 語意擴展 | 適用範圍 | 正規化 | 審核狀態 | 資料證據 | 正例 | 反例 |
|---|---|---|---|---|---|---|---|---|
| 違約交割 | 違約交割／交割違約／未履行交割／違約不履行交割 | disabled（runtime 2026-11-17；top20 16→16、top50 20→35） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 全庫 1,589 筆；head 1,600 字只有 603 筆 | `SLDV,89,訴,367,20000728` | `SLDV,88,訴,458,20000706`（給付違約金） |
| 內線交易 | 內線交易／內部人交易 | disabled（20→18、50→44；直接詞已強） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 全庫 2,645 筆；案由以證券交易法為主 | 待補 | 待補 |
| 操縱股價 | 操縱股價／炒作股票／操縱市場 | disabled（15→10、31→24） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 全庫 1,284 筆；共現含相對成交、公司股價 | 待補 | 待補 |
| 人頭帳戶 | 人頭帳戶 | disabled（runtime 2026-11-17；16→20、38→44） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 詐欺／洗錢案件常見事實 | 待補 | 待補 |
| 掏空公司 | 掏空公司／掏空 | disabled（1→1、4→3） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 公司治理與證券犯罪常見概念 | 待補 | 待補 |
| 財報不實 | 財報不實／財務報告不實／虛偽記載 | disabled（runtime 2026-11-17；1→2、1→5） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 證券交易法第20條相關 | 待補 | 待補 |
| 非法吸金 | 非法吸金／吸金 | disabled（runtime 2026-11-17；14→18、25→35） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 銀行法第29條相關 | 待補 | 待補 |
| 證券詐欺 | 證券詐欺 | disabled（未測） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 證券交易法第20條相關 | 待補 | 待補 |
| 短線交易 | 短線交易 | disabled（runtime 2026-11-17；0→1、0→1） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 證券交易法第157條相關 | 待補 | 待補 |
| 非常規交易 | 非常規交易 | disabled（未測） | 法院＋年份的 list query | `remove-unicode-space-v2` | engineering_approved | 掏空與背信案件常見 | 待補 | 待補 |

> 語意擴展的「top20／top50」是 proxy：在無法院條件的語意查詢中，top20／top50 結果有多少筆的全文真的含該術語。這不是 Recall，也不是 precision ground truth；只用來決定是否啟用該術語的 expansion。2026-11-16 測量。
>
> 「資料證據」欄是先前個別測量或全庫查詢的結果；本節後方的 200k evidence snapshot 是另一個 deterministic sample，兩者統計方法不同，不應直接相加或視為同一普查。

每個術語另有 `expansion_decision` 與 `expansion_evaluation`：

- `proxy_approved`：proxy 數據支持繼續測試，尚未 human-reviewed。
- `benchmark_approved`：human-reviewed ground truth 證明有效。
- `disabled`：proxy 或 benchmark 顯示 precision／nDCG 變差。
- `legal_reviewed`：法律語義已確認，與 benchmark 狀態獨立。

目前 5 個原本 proxy-approved 的 expansion 術語也已改為 `disabled`／`expansion_enabled=false`，與 runtime 預設一致；歷史 proxy 數據保留在 `expansion_evaluation`。完整評估契約見 `legal-term-expansion-evaluation.md`。

> **Runtime default（2026-11-17）**：`RAG_LEGAL_EXPANSION_ENABLED=false`，且 5 個術語的 registry 已是 `expansion_enabled=false`／`expansion_decision=disabled`。需要做離線實驗時，使用 `expand_semantic_query(..., include_disabled=True)`；正式 semantic 查詢不套用。

## 加入新術語的流程

1. 跑共現分析（唯讀）：

   ```bash
   uv run python scripts/legal_term_cooccurrence.py \
     --terms "違法授信" \
     --output .run/legal_term_cooccurrence.json
   ```

   `--terms` 可指定任何 candidate；預設只跑目前 active 術語。

2. 人工檢查候選詞、案由、法院與年份分布。
   - 只把**精確、低歧義**的變體加入 `src/judgment/data/legal_terms_registry.json`；不要改核心 retrieval 程式。
   - 「交割」「履行」「交易」「股票」等一般詞不得因為共現高就變成等價詞。
   - 公司名、人物名、個案特殊用語不得成為全域同義詞。
3. 至少加入一筆正例與一筆反例（反例應語意相近但不是同一概念）。
4. 在 `tests/benchmarks/rag_query_suite.json` 增加正例與零命中案例。
5. 確認 `keyword_list`：
   - 命中時只回精確符合者；
   - 零命中時直接 abstain；
   - 不退回 `structured_semantic` 或 `semantic` 的近似結果。
6. 將審核狀態從 `engineering_approved` 改為 `legal_reviewed` 前，必須有法律背景人員簽核。

## 全庫搜尋擴充（benchmark-only）

目前 `keyword_list` 只在有法院＋年份時啟用，避免全庫 4.68M 筆逐筆 Python 掃描。`pg_trgm` benchmark 已在獨立 `legal_term_benchmark` schema 實作，但**尚未建立正式 GIN index，也未接入 retrieval pipeline**。

可用性檢查（2026-11-16）：

```text
PostgreSQL 16 / UTF8 / en_US.utf8
pg_trgm 1.6：**installed 2026-11-16**（database `judgment`）
pg_bigm：not available in this image
GIN index（formal `judgment_documents`）：**not created**
GIN index（isolated `legal_term_benchmark`）：created 2026-11-16 for benchmark only
Retrieval pipeline：**not integrated**
```

正式採用前必須用同一批查詢比較：

- p50／p95 延遲
- GIN index 大小
- 寫入與 VACUUM 成本
- 正規化片語比對是否一致
- 有／無法院年份條件時的差異

在完成比較前，不建立全庫 index，也不改 embedding／reranker。

安裝指令（已執行，僅 extension，未建 index）：

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT extname, extversion FROM pg_extension WHERE extname = 'pg_trgm';
```

後續 benchmark 必須使用 `EXPLAIN (ANALYZE, BUFFERS)` 確認查詢真的使用 GIN trigram index；`pg_trgm` 只負責候選加速，最終仍以正規化完整片語 `LIKE` 判定命中。

Benchmark 實作（隔離 schema，非正式 index）：

```bash
uv run python scripts/legal_term_trgm_benchmark.py \
  --rows 100000 \
  --output .run/pg_trgm-benchmark-report.json
```

- Schema：`legal_term_benchmark`
- Table：`legal_term_benchmark.judgment_documents_bench`（deterministic id-modulo sample）
- Index：`legal_term_benchmark.judgment_documents_bench_trgm_idx`（GIN `gin_trgm_ops`）
- A：無 index `LIKE '%term%'`
- B：GIN + `LIKE`
- C：GIN + `LIKE` + `strpos` 精確驗證
- 每組另跑 `enable_seqscan=off` 診斷，但不以 forced 結果取代 default planner 結果。
- 報告記錄 build time、index size、p50/p95、planner node、shared blocks、INSERT/UPDATE/DELETE/VACUUM 成本與 normalization mismatch。
- `is_formal_retrieval_index=false`；formal table 上沒有 GIN index。

2026-11-16 100k sample 結果（詳見 `pgtrgm-benchmark.md`）：

```text
table rows       101,769
index build      227.05s
index size       839 MB（約 8.6 KB/row；全庫線性外推約 40 GB）
A (no index)     p50 median 2,670.5 ms
B (GIN + LIKE)   p50 median   14.5 ms，default planner index usage 90%
C (GIN + exact)  p50 median   25.8 ms
2 字詞           B 2,494.2 ms，沒有加速；forced index 反而更慢
```

結論：**現階段不建立正式全庫 GIN index**。pg_trgm 對 selective 的 4–5 字／9+ 字術語有明顯加速，但索引大小、2 字中文詞選擇性與 planner 不確定性仍不可接受；`keyword_list` 繼續只使用法院＋年份條件。

替代方案：`legal_term_postings` sample 已有 127,513 筆 postings、35 MB，validation 0 mismatch；全庫線性外推約 2.93M 筆／805 MB，遠小於 40 GB GIN。尚未 full build、尚未接入 RAG。設計見 `legal-term-postings.md`。

2026-11-16 baseline（無 index）：

```text
SELECT count(*) FROM judgment_documents
WHERE is_current = true AND full_text LIKE '%違約交割%';

Execution Time: 63,493.608 ms
Shared Hit Blocks: 12,479,763
Shared Read Blocks: 3,277,414
```

這證明目前全庫精確搜尋不能直接在正式 pipeline 啟用；必須先完成 pg_trgm benchmark。

## 與其他檢索模式的界線

| 模式 | 意義 | 零命中 |
|---|---|---|
| `keyword_list` | 精確術語命中 | 查無即停止，不補位 |
| `structured_semantic` | 結構條件＋語意檢索 | 不放寬法院／年份／案由 |
| `semantic` | 一般語意檢索 | 依相關性與信心門檻處理 |

`keyword_list` 預設按裁判日期排序；詞頻只作 `term_occurrences` 輔助欄位，不決定排序優先順序。
