# 資料保留與清理

- 日期：2026-11-22
- 目的：把資料保留期限、清理機制與備份例外寫成可驗證的營運契約

## 保留矩陣

| 資料 | 位置 | 保留期限 | 清理方式 |
| --- | --- | --- | --- |
| RAG 提問／回答與效能紀錄 | PostgreSQL `performance_records` | 90 天（`PERFORMANCE_RETENTION_DAYS`） | 每日背景維護＋每 200 次寫入備援清理 |
| 安全稽核事件 | PostgreSQL `security_audit_events` | 180 天 | 每日背景維護＋每 200 次寫入備援清理 |
| 公開分享快照 | PostgreSQL `rag_share_snapshots` | 7 天 | 每日背景維護＋建立新分享時清理 |
| 處理事件 journal | `.run/processing_events.db` | 200,000 筆 | event store 自動修剪最舊事件 |
| 備份檔 | `backup.sh` 目標目錄／離線媒體 | 90 天 | 由維運依輪替政策刪除；程式不自動刪除 |
| `.env`／密鑰 | 密鑰管理器 | 現行版本；輪替期間保留舊版 | 不進備份、不進 Git |

## 注意事項

- 資料庫刪除不會回溯刪除既有備份。備份可能包含刪除前的提問、回答與稽核事件，因此備份輪替期限就是這些資料在備份中的最大額外壽命。
- 90 天備份輪替是營運政策，不是程式自動刪除；若未實際刪除舊備份，資料仍可能存在。
- `security_audit_events` 的 180 天期限長於提問／回答，用於追查登入與管理操作。
- 公開分享快照的 7 天期限同時受 demo 狀態影響：demo 關閉時連結失效，重新開啟不會讓已過期快照復活。
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
  └─ prune_expired_rag_shares()    # 7 天
```
