# 2026-11-22 完整 Restore Drill

- 狀態：**通過**（隔離 drill＋正式 `restore.sh` end-to-end）
- 備份來源：`/Volumes/T500_2TB/judgment-backup-20261121-1846`（隔離 drill）與 `judgment-backup-20261122-1500`（正式 restore）
- Manifest 時間：`2026-11-21T11:28:04Z`／`2026-11-22T15:38:52Z`
- Manifest git：`d739379142eaa859f342444e92a1277142a02822`／`e608f4ba71d246a81abf8cd75838f735b26fff6b`
- 還原目標：內部磁碟、scratch DB、第二個 Qdrant container；最後在正式 project 執行 `down.sh` → `restore.sh` → `up.sh`
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

## 6. 隔離 drill 與清理

- 隔離 drill 期間 production 未停機；正式 end-to-end restore 有停機，見 §7
- PostgreSQL 使用 scratch DB `judgment_restore_drill`，完成後 drop
- Qdrant 使用第二個 container `judgment-qdrant-restore`（port 56333），完成後移除
- `data/` 複本完成 SHA 驗證後刪除
- globals dump 保留在 `/Volumes/T500_2TB/judgment-globals-20261122`
- 小型 log／counts／SHA manifest 保留在 `.run/restore-drill-20261122`（不進 Git）

## 7. 正式 `down.sh` → `restore.sh` → `up.sh`

2026-11-22 `22:58:24Z` 執行 `down.sh`，production 預期中斷。第一次以 `judgment-backup-20261122-1500` 執行 `restore.sh` 失敗：

- `restore.sh` 只 drop `public`，但備份還包含 `legal_term_benchmark` 與 `legal_term_evidence`；`CREATE SCHEMA legal_term_benchmark` 因已存在而中止。
- 修正：restore 前同時 drop `public`、`legal_term_benchmark`、`legal_term_evidence`。

第二次重跑在 PostgreSQL 還原與 ownership transfer 成功後中止：

- Bash 3.2 把 `$APP_DB_ROLE；` 的全形分號視為變數名稱的一部分，`set -u` 報 `unbound variable`，因此 Qdrant／data／`up.sh` 尚未執行。
- 修正：`restore.sh`／`backup.sh` 所有 `$VAR` 緊接非 ASCII 字元的位置改成 `${VAR}`。
- 新增 `tests/test_restore_script.py`，檢查 shell 語法、brace 展開與非 `public` schema drop。

第三次完整 restore：

| 階段 | 時間 |
| --- | --- |
| `restore.sh` 開始 | `2026-11-22T23:26:20Z` |
| `restore.sh` 完成（含 `up.sh`） | `2026-11-22T23:54:43Z` |
| 耗時 | **28 分 23 秒** |
| Production downtime（含兩次失敗與修正） | **56 分 19 秒**（22:58:24 → 23:54:43） |

恢復後驗證：

- `/api/health` 200；demo disabled；匿名 `/api/rag/query`／`/api/status` 403
- 34 tables、167 indexes；`judgment_app` ownership 34/34
- `judgment_documents=4,714,969`、`judgment_change_events=3,976,282`、`law_documents=11,805`、`law_article_versions=473,933`
- Qdrant `judgments_current` → `judgments_v005`，4,714,967 points
- data：judgments 1,388 files／122,820,150,754 bytes；laws 16 files／246,929,003 bytes，與備份一致
- `demo_reader` grants 已重新套用；`data_dir`、`parquet_path`、未授權 table、`pg_read_file` 仍被拒絕
- `GET /api/admin/security-audit` 200；admin token 未出現在回應
- RAG smoke：`/api/rag/query` 200、`answer_source=llm`、`retrieval.status=ok`
- `up.sh` 的 `uv sync` 會移除 dev packages；已用 `uv sync --frozen --extra dev` 恢復本機測試工具，production runtime 不受影響

## 8. 發現與後續

1. **舊備份已過期**：這是 2026-11-21 11:28Z 的快照，缺少之後新增的 table、audit 與 trigram indexes；正式依賴前必須使用最新完整備份。
2. **`restore.sh` 已修正兩個實際 bug**：非 `public` schema 未先 drop，以及 Bash 3.2 對 `$VAR；` 的變數解析。已加入 `tests/test_restore_script.py` 防止回歸。
3. `age -d | pg_restore --list` 的 SIGPIPE 是 `pg_restore --list` 讀完 TOC 後關閉管線造成；實際 restore 成功。
4. 已在 drill 後建立並驗證最新完整備份；正式還原使用這份備份，而不是舊的 2026-11-21 快照。

## 9. 最新備份（已驗證）

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
