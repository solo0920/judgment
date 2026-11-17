# Legal Term Postings Table

- 狀態：Sample build validated；尚無 full build，尚未接入 RAG
- 日期：2026-11-17
- 目的：用 compact postings table 取代 40GB 級全文 GIN index
- 執行檔：`scripts/legal_term_postings.py`
- 報告：`.run/legal_term_postings_report.json`

## 1. Schema

```text
schema  legal_term_evidence
table   legal_term_postings
columns jid, term_id, term, occurrences,
        court_normalized, jdate, title
primary key (jid, term_id)
index   (term_id, jdate)
```

這不是 `judgment_documents` 的 index，也不改變全文表。Table 是 derived data，可從判決全文重建。

Completeness manifest：

```text
legal_term_evidence.legal_term_postings_manifest
  build_id
  generated_at
  registry_version
  registry_sha256
  normalization_version
  matching_rule
  is_full_scan
  scanned_rows / total_current_rows
  max_last_seen_snapshot_id
  complete
```

`complete=true` 只在 full scan 且 scanned rows 等於 total current rows 時成立。未來接入 RAG 前必須核對 `registry_sha256`、`normalization_version`、`max_last_seen_snapshot_id`；任一不符就不得使用 postings table。

## 2. Build

```bash
# deterministic sample（驗證用）
uv run python scripts/legal_term_postings.py \
  --limit 200000 --rebuild \
  --output .run/legal_term_postings_report.json

# 全庫（離峰執行；尚未跑）
uv run python scripts/legal_term_postings.py \
  --full --rebuild \
  --output .run/legal_term_postings_report.json
```

匹配邏輯與 evidence pipeline 共用 `judgment.legal_term_matching`：longest exact variant + containment，正規化版本 `remove-unicode-space-v2`。

## 3. 200k sample 結果

```text
scanned rows             203,543 / 4,681,502（4.35%）
postings rows            127,513
documents with postings   90,699
terms with postings          147
table total size            35 MB（heap 19 MB）
secondary index size       3.6 MB
build + copy + validate   180.23s
estimated full rows     2.93M
estimated full size     ≈805 MB（線性外推）
```

對照：100k pg_trgm sample 的 GIN index 已 839 MB，線性外推全庫約 40 GB；postings 的量級小很多。

## 4. Validation

`--validate-limit 2000` 會：

1. 從同一 sample step 取 2,000 筆判決。
2. 用同一套 normalized matching 重新計算每筆判決的 `(jid, term_id, occurrences)`。
3. 與 postings table 逐筆、逐術語比較。

本次結果：

```text
checked documents   2,000
checked terms          50
checked postings    1,174
row mismatches          0
term-level mismatches   0
status                  ok
manifest.complete       false（sample build）
registry_sha256         7f7ac32d…
normalization_version   remove-unicode-space-v2
```

這支持「postings 與即時全文比對一致」的 sample 驗證；full build 仍要重跑同一驗證。

## 5. 查詢範例

無法院／年份條件的精確查詢，未來可用：

```sql
SELECT jid, term, occurrences
FROM legal_term_evidence.legal_term_postings
WHERE term_id = 'financial_term_018'
ORDER BY jdate DESC
LIMIT 20;
```

有法院／年份條件時也可直接在 postings table filter，再 join `judgment_documents` 取標題與 snippet。

200k sample 實測（`term_id` + `ORDER BY jdate DESC LIMIT 20`，第一次查詢含 cold cache）：

```text
financial_term_018（違約交割）  14.07 ms
financial_term_057（人頭帳戶）   3.33 ms
financial_term_056（洗錢）       0.55 ms
```

這只是 sample 的 query smoke，不是 full-table p50／p95；full build 後需重測。

## 6. 尚未做的事

- 尚未跑 full postings build；目前 table 只有 4.35% sample，不能當完整答案來源。
- 尚未接入 `keyword_list`。接入時必須有 completeness marker，避免 sample table 被誤認為全庫。
- 尚未建立 postings 的寫入／更新流程；目前是 rebuild-only snapshot。
- 不用 postings 取代 substantive relevance 或 human review。
- 沒有在 `judgment_documents` 建立 GIN index。

## 7. 下一步

1. 離峰跑 `--full --rebuild`，確認 rows／size／validation。
2. 在 `keyword_list` 增加 optional postings backend；若 table 不完整或 stale，回退到現有法院＋年份全文查詢。
3. 加測試：postings 與即時全文在同 scope 的 term/document counts 一致；零命中仍 abstain。
4. 確認 date ordering、court filter、term_occurrences 與 citation snippet 行為不變。
