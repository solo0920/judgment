# 2026-11-22 完整 Restore Drill

- 狀態：**通過**（隔離還原；production 未停機）
- 備份來源：`/Volumes/T500_2TB/judgment-backup-20261121-1846`
- Manifest 時間：`2026-11-21T11:28:04Z`
- Manifest git：`d739379142eaa859f342444e92a1277142a02822`
- 還原目標：內部磁碟、scratch DB、第二個 Qdrant container
- 執行環境：macOS、Docker Desktop、PostgreSQL 16、Qdrant 1.19.1

## 1. 備份完整性

| 項目 | 結果 |
| --- | --- |
| PostgreSQL dump checksum | OK（13,675,500,400 bytes） |
| Qdrant snapshot checksum | OK（29,446,615,040 bytes） |
| age 私鑰解密 | OK；`pg_restore --list` 讀出 443 行、433 TOC entries |
| globals dump | 新產生 `pg_dumpall --globals-only`，age 加密，checksum OK |
| data 檔案 | 1,404 files、123,067,079,757 bytes |

Checksum 驗證耗時：`2026-11-22T14:11:04Z` → `14:13:24Z`（2 分 20 秒）。

## 2. 還原時間

| 階段 | 時間 | 備註 |
| --- | --- | --- |
| PostgreSQL restore | 14:14:59 → 14:36:35 | **21 分 36 秒**；age dump 串流進 `pg_restore` |
| Qdrant snapshot restore | 14:39:10 → 14:43:01 | **3 分 51 秒**；Qdrant 回報 192.14 秒 |
| `data/` rsync | 14:43:24 → 14:51:39 | **8 分 15 秒**；約 249 MB/s |
| data SHA-256 清單 | 14:52:08 → 14:58:52 | **6 分 44 秒** |
| 合計（checksum 開始到 data SHA 完成） | 14:11:04 → 14:58:52 | **47 分 48 秒** |

## 3. PostgreSQL 驗證

- Production DB size：39,524,154,391 bytes（約 39.5 GB）
- Backup dump：13.7 GB age 加密
- Restored schema：32 tables、154 indexes（備份當時的 schema）
- `judgment_app` ownership transfer：32/32 tables
- `judgment_app` 可讀取 `judgment_documents`、`law_documents`、`law_article_versions`、`app_settings`

核心資料 counts：

| Table | Production | Restored | 差異 |
| --- | ---: | ---: | ---: |
| `judgment_documents` | 4,714,969 | 4,714,969 | 0 |
| `judgment_change_events` | 3,976,282 | 3,976,282 | 0 |
| `law_documents` | 11,805 | 11,805 | 0 |
| `law_article_versions` | 473,933 | 473,933 | 0 |

備份後才有寫入的差異（預期）：

| Table | Production | Restored | 說明 |
| --- | ---: | ---: | --- |
| `app_settings` | 4 | 2 | 備份後新增的 runtime settings |
| `demo_mode_audit` | 51 | 32 | 備份後的 demo 操作 |
| `demo_usage_daily` | 3 | 2 | 備份後的 demo 使用 |
| `performance_records` | 17,641 | 17,204 | 備份後的效能紀錄 |

備份後新增、因此不在舊備份中的 schema：

- `rag_share_snapshots`
- `security_audit_events`
- `judgment_documents` 的 5 個 trigram indexes：
  - `ix_judgment_documents_court_normalized_trgm`
  - `ix_judgment_documents_court_trgm`
  - `ix_judgment_documents_jid_trgm`
  - `ix_judgment_documents_matched_laws_text_trgm`
  - `ix_judgment_documents_title_trgm`

這些是**備份時間點較早**造成，不是 restore 失敗。

## 4. Qdrant 驗證

- Collection：`judgments_v005`
- Points count：**4,714,967**
- Segments：11
- Vector config：1024 dimensions、Cosine
- Status：green
- 抽樣 100 筆 points：ID 與 payload 完全一致
- Alias `judgments_current` 建立後仍指向 4,714,967 points
- Snapshot checksum：OK

## 5. Data 驗證

- Source 與 restore 都是 1,404 files、123,067,079,757 bytes
- 兩邊完整 SHA-256 清單完全一致
- Manifest 總 bytes 為 123,070,644,224；差 3,564,467 bytes 是備份排除的 Apple metadata，不是資料差異
- 還原後 `data/` 已清理，未保留 115 GB 複本

## 6. 隔離與清理

- Production 全程未停機；`/api/health` 仍為 200
- PostgreSQL 使用 scratch DB `judgment_restore_drill`，完成後 drop
- Qdrant 使用第二個 container `judgment-qdrant-restore`（port 56333），完成後移除
- `data/` 複本完成 SHA 驗證後刪除
- globals dump 保留在 `/Volumes/T500_2TB/judgment-globals-20261122`
- 小型 log／counts／SHA manifest 保留在 `.run/restore-drill-20261122`（不進 Git）

## 7. 發現與後續

1. **舊備份已過期**：這是 2026-11-21 11:28Z 的快照，缺少之後新增的 table、audit 與 trigram indexes。正式依賴前必須使用最新完整備份。
2. 本次以元件隔離方式還原（PG scratch DB、第二個 Qdrant、獨立 data 目錄），沒有直接執行 `restore.sh` 的 `down.sh`，以避免停 production；`restore.sh` 的 schema／ownership 路徑已另行測過。
3. `age -d | pg_restore --list` 的 SIGPIPE 是 `pg_restore --list` 讀完 TOC 後關閉管線造成；實際 restore 成功。
4. 建議在這次 drill 後重新執行完整備份，讓安全網包含 2026-11-22 的 schema 與資料。

## 8. 最新備份（已驗證）

本次 drill 後已建立新的完整備份：

```text
/Volumes/T500_2TB/judgment-backup-20261122-1500
```

- 大小：157 GB
- Manifest 時間：`2026-11-22T15:38:52Z`
- PostgreSQL dump：13,675,860,677 bytes；age 加密；checksum `76c92be15a94312415c75bb422d5b7950c353787d8d7a9b28938c64caed570b9`
- Qdrant snapshot：29,446,615,040 bytes；4,714,967 points；checksum `7d9237b20a40897110043738acce4bbd5e76145bec08ebb4bf32d81a69a78296`
- 新 PG dump TOC：34 tables；包含 `security_audit_events`、`rag_share_snapshots` 與 5 個 `judgment_documents` trigram indexes
- `data/`：1,404 files，與 production `data/judgments`＋`data/laws` 的完整 SHA-256 清單一致
- `data/benchmarks/pilot_30.json` 是 Git-tracked seed fixture，不在 `backup.sh` 的 data 範圍；可由 repo 還原
- `.env` 未進備份；manifest 不含 hostname／project root
- checksum 驗證：PostgreSQL 與 Qdrant snapshot 都 OK

新備份的 `data/` SHA-256 比對耗時 6 分 37 秒（15:44:31 → 15:51:08）。
