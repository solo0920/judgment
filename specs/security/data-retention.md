# 資料保留與清理

- 日期：2026-11-24
- 目的：把資料保留期限、清理機制與備份例外寫成可驗證的營運契約

## 保留矩陣

| 資料 | 位置 | 保留期限 | 清理方式 |
| --- | --- | --- | --- |
| RAG server-side 回答快照 | PostgreSQL `rag_interactions`（同一對話以 `conversation_id` 分組） | 180 天（`RAG_INTERACTION_RETENTION_DAYS`） | 每日背景維護刪除 `expires_at` 到期資料 |
| RAG 使用者回饋 | PostgreSQL `rag_feedback`（含 reasons／events） | 180 天；已結案自結案起再 180 天（`RAG_FEEDBACK_RETENTION_DAYS`） | 每日背景維護刪除 `expires_at` 到期資料 |
| RAG 回饋問題群組 | PostgreSQL `rag_feedback_issues` | 無 feedback 且超過 180 天未更新時刪除 | 每日背景維護刪除孤兒 issue |
| RAG 批次評估報告 | PostgreSQL `rag_feedback_evaluations` | 180 天 | 每日背景維護刪除過期報告 |
| RAG A/B 實驗報告 | PostgreSQL `rag_feedback_experiments` | 180 天 | 每日背景維護刪除過期報告 |
| Holdout 輪替提案與審查 | PostgreSQL `rag_holdout_rotations` | 365 天 | 每日背景維護刪除過期提案 |
| RAG 提問／回答與效能紀錄 | PostgreSQL `performance_records` | 90 天（`PERFORMANCE_RETENTION_DAYS`） | 每日背景維護＋每 200 次寫入備援清理 |
| 安全稽核事件 | PostgreSQL `security_audit_events` | 180 天 | 每日背景維護＋每 200 次寫入備援清理 |
| 公開分享快照 | PostgreSQL `rag_share_snapshots` | 7 天 | 每日背景維護＋建立新分享時清理 |
| 處理事件 journal | `.run/processing_events.db` | 200,000 筆 | event store 自動修剪最舊事件 |
| 備份檔 | `backup.sh` 目標目錄／離線媒體 | 90 天 | 由維運依輪替政策刪除；程式不自動刪除 |
| `.env`／密鑰 | 密鑰管理器 | 現行版本；輪替期間保留舊版 | 不進備份、不進 Git |

## 注意事項

- 資料庫刪除不會回溯刪除既有備份。備份可能包含刪除前的提問、回答與稽核事件，因此備份輪替期限就是這些資料在備份中的最大額外壽命。
- 90 天備份輪替是營運政策，不是程式自動刪除；若未實際刪除舊備份，資料仍可能存在。
- `rag_interactions` 只存顯示所需的去敏快照，不存判決全文、LLM prompt／messages／contexts、API key、絕對路徑或內部主機；`rag_feedback.snapshot` 在送出時複製一份，interaction 到期後仍可重現。
- 多輪對話以隨機 UUID `conversation_id` 分組，管理者時間線只查同一 `(conversation_id, client_key_hash)`；此 ID 不是授權憑證。每個對話最多 50 輪、每個 client hash 每日最多 20 個新對話，超過時仍回答但不分組。
- `conversation_id`、`turn_index`、`feedback_scope` 與 `rag_holdout_rotations` 都包含在完整 PostgreSQL `pg_dump`／`pg_restore` 備份；新欄位皆有預設值，舊資料升級不會重寫既有列。
- `rag_feedback` 的唯一鍵是 `(request_id, client_key_hash)`；15 分鐘內修改會更新同一筆並增加 revision，不新增第二筆 active 回饋。
- 回饋的 `expected_behavior` 由人工 triage 填寫；匯出給 OpenCode 的 JSONL 不含原始 `comment`，避免匿名留言成為間接提示注入管道。
- `security_audit_events` 的 180 天期限用於追查登入與管理操作。
- 公開分享快照的 7 天期限同時受 demo 狀態影響：demo 關閉時連結失效，重新開啟不會讓已過期快照復活。分享 payload 不含 feedback token。
- 品質週報的 Slack／email 傳送不保存副本；`.run/quality-report-*.md` 只留在本機排程目錄，且只含聚合資料與警示。
- Holdout 輪替提案套用後只改 visibility 或 stale 旗標，不刪除題目、benchmark 結果或歷史 run。
- 隱私文案位於 `#/rag` 的提問區與側欄，內容必須與本表一致。

## 驗證

```bash
uv run pytest tests/test_maintenance.py -q
```

每日維護會執行：

```text
run_retention_maintenance()
  ├─ prune_performance_records()   # 90 天
  ├─ prune_security_events()       # 180 天
  ├─ prune_expired_rag_shares()    # 7 天
  ├─ prune_rag_interactions()      # 180 天
  ├─ prune_rag_feedback()          # 180 天／結案後 180 天
  ├─ prune_rag_feedback_issues()   # 無 feedback 且 180 天未更新
  ├─ prune_rag_feedback_evaluations() # 180 天
  ├─ prune_rag_feedback_experiments()  # 180 天
  └─ prune_rag_holdout_rotations()     # 365 天
```
