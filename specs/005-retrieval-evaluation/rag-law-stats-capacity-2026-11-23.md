# RAG 判決引用統計延遲調查（2026-11-23）

## 問題

提問「證券營業員常觸犯什麼法規或命令？」在 2026-11-23 08:44 UTC 花費 70,993 ms，其中 `rag.law_stats` 佔 70,755 ms，其餘 span 都接近 0。

## 方法與結論

### 1. 用 git 歷史排除程式碼 regression

```text
9abcbbe  初始提交：matched_laws_text → full_text fallback，limit 2000
16877d6  11/17：autoescape
1ae7107  11/21：is_current、法規總覽回答
a8477c3  11/23：取樣 100 + cache（本次修正）
```

在 `a8477c3` 之前，`judgment_law_stats` 的 SQL 沒有被改慢。`1ae7107` 的回答文案改變不是延遲來源。

### 2. 用最初 commit 對現在的資料庫重現

在 detached worktree `9abcbbe` 上執行最初的 `judgment_law_stats()`，連到**現在**的資料庫：

```text
耗時：51,586.7 ms
judgment_count：1,268
matched_by：full_text
熱門法規：民法 2175、證券交易法 2153、洗錢防制法 651
```

同一份程式碼在現在資料上仍然慢，因果確定：**主因是資料量，不是近期程式碼改動**。

### 3. 用 historical performance records 對照資料量

同一題的歷史紀錄：

| 時間 | 回答中的判決筆數 | law_stats 耗時 |
| --- | --- | --- |
| 11/07 | 30 筆 | 3,015 ms |
| 11/08 | 125 筆 | 9,142 ms |
| 11/23 | 1,268 筆 | 70,755 ms |

11/19 完整匯入後 `judgment_documents` 達 4,714,967 筆、`full_text` 約 20 GB。

### 4. 用 BUFFERS 確認是循序掃描／快取問題

`EXPLAIN (ANALYZE, BUFFERS) ... full_text LIKE '%證券營業員%' LIMIT 100`：

```text
Parallel Seq Scan on judgment_documents
Buffers: shared hit=1,605,145 read=444,106
Execution Time: 9,154 ms
```

即使只取 100 筆，仍讀了 444,106 個磁碟 block；成本取決於表大小與是否在快取，不是符合筆數。20 GB 全文無法完全放進快取，因此冷讀取是常態而非偶發。

### 5. 取樣偏誤檢查

以 `issue_month` 的年份／季節分布比較：

| 群組 | 199 | 200-Q1 | 200-Q3 | 201-Q1 | 201-Q3 | 202-Q1 | 202-Q3 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 母體 1,268 筆 | 3 | 35 | 384 | 41 | 416 | 54 | 335 |
| 順序 LIMIT 100 | 1 | 5 | 0 | 0 | 35 | 7 | 52 |
| TABLESAMPLE SYSTEM(8) 100 筆 | 0 | 5 | 35 | 1 | 35 | 2 | 22 |

順序 `LIMIT 100` 完全漏掉 200-Q3（母體 30%），確認有偏誤；因此所有統計文案 MUST 標示為取樣，不得宣稱母體比例。

## 已實作的止血

- `limit_rows` 從 2000 降為 100
- 以 entity 為 key 的 LRU cache：最多 128 筆、TTL 10 分鐘
- full-text fallback 有 5 秒 `statement_timeout`；逾時回 `timeout=true`，回答照常送出並標示「法規引用統計暫時無法提供」
- 來源卡與回答文案標示「取樣 N 筆」／「取樣中被引用 N 次」
- compact pipeline 保留 `rag.law_stats`、`rag.law_content`，結構化 waterfall 不再出現「未記錄」

效果：冷啟動約 3.1 秒、快取後約 0.2 秒（原 71 秒）。

## 不採用的方案

`full_text` 的 GIN trigram index：既有 100k sample benchmark 顯示索引約 839 MB／100k 筆，外推全庫約 40 GB，且 2 字中文詞沒有加速。詳見 `pgtrgm-benchmark.md`。

## 面試後的根治方向

- 把匯入時已解析的引用結果存成關聯表（判決 ID、法規、條號）並加 B-tree index，讓「提及某法規的判決數」變成精確、毫秒級索引查詢，不需要取樣
- 盤點 `full_text LIKE` 路徑：
  - `law_rag.py`：本次統計（已加取樣／逾時）
  - `rag.py`、`legal_term_probe.py`：短詞 probe，現有設計已限制法院＋年份，需逐一用 BUFFERS 驗證
- 判決關鍵字搜尋：短欄位用 trigram，全文交給 Qdrant 語意搜尋
- 在效能報表加 P95 門檻告警，避免下一次資料成長才被使用者發現
