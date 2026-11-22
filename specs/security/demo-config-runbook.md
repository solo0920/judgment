# Demo 上線／關閉 Runbook

- 日期：2026-11-21
- 用途：換機器、重建環境或展示結束時，避免漏掉只在 `.env` 的設定

## 1. 必要環境變數

以下值以目前 production 為準；不要提交 `.env`。

| 變數 | 預期值／說明 |
|---|---|
| `APP_ENV` | `production`（`/api/status` 顯示用） |
| `CORS_ALLOW_ORIGINS` | `https://judgment.ragdemo.win,https://judgment-61m.pages.dev`；不要含 `*`、localhost 或已無 DNS 的 `judement.ragdemo.win` |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_SAMESITE` | `none`（目前 pages.dev 預覽跨站需要；若只保留 `judgment.ragdemo.win`，可評估改 `lax`） |
| `AUTH_SESSION_SECRET` | 獨立隨機值，不要等於 `JUDGMENT_ADMIN_TOKEN` |
| `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS` | `0` |
| `FORWARDED_ALLOW_IPS` | `127.0.0.1` |
| `PERFORMANCE_RETENTION_DAYS` | `90`（目前 UI 文案寫 90 天；若改值，前端文案要同步） |
| `TRUSTED_HOSTS` | 只列實際 hostname；不要把 `*` 放進 production |

訪客查詢唯讀角色：

| 變數 | 說明 |
|---|---|
| `DEMO_QUERY_DATABASE_URL` | `demo_reader` 連線字串；**未設定時訪客 data 功能 fail closed**，不可 fallback 到 superuser |

## 2. 展示開啟

1. 以 Google session 登入 production 管理頁。
2. 選擇功能與到期時間（2h／24h／7d）。
3. 按「開啟展示」。
4. 以無痕視窗確認：
   - `GET /api/demo/status` 回 `enabled: true`
   - `GET /api/quality`、`/api/processing`、`/api/performance`、`/api/status` 回 200
   - `GET /api/performance?process=RAG%20問答` 不含已知問題／答案
   - `GET /api/processing` 不含 `/Users/`
   - 已移除的 demo 路由（題庫、下載狀態、processing plan 等）回 401
   - `/api/catalog` 的 `detail` 不可含 `127.0.0.1`、內網 host 或絕對路徑；回歸測試：`test_demo_catalog_sanitizes_internal_endpoints`

## 3. 展示關閉

### 3.1 管理頁

按「立即關閉展示」。

### 3.2 Admin token fallback（沒有 Google session 時）

```bash
TOKEN="$(grep -E '^JUDGMENT_ADMIN_TOKEN=' .env | head -1 | cut -d= -f2-)"
curl -sS -X POST \
  -H "X-Judgment-Admin-Token: ${TOKEN}" \
  https://api-mbp.ragdemo.win/api/admin/demo/close
```

這個路徑不需要 `Origin`；`admin_token` principal 不會被 Google session 的 Origin 檢查擋住。

### 3.3 外部驗證

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -X POST https://api-mbp.ragdemo.win/api/rag/query \
  -H 'Content-Type: application/json' \
  -d '{"question":"test"}'
# 預期 403（demo_closed）

curl -sS -o /dev/null -w '%{http_code}\n' \
  https://api-mbp.ragdemo.win/api/status
# 預期 403（demo_closed；不是 401，因為 /api/status 是 DEMO_READ）

curl -sS https://api-mbp.ragdemo.win/api/demo/status
# 預期 enabled:false
```

最後再決定是否停止 cloudflared tunnel；停止前確認沒有其他服務依賴它。

## 4. CSP 收集端點與 enforce 狀態

> 2026-11-21：Cloudflare Web Analytics 已關閉並 purge；CSP 已從 Report-Only 切到 enforce。Enforce 後用 Chromium／WebKit／Firefox 跑 RAG 串流、Postgres／Qdrant 查詢、JSON 匯出與各頁面，0 CSP violation、0 page error、下載正常。

已加入公開 `POST /api/csp-report`：

- 只接受 8 KB 以下 body。
- per-IP `30/min`、`200/hr`、`1000/day`，全域 `5000/day`。
- 只記錄 `document_uri`、`blocked_uri`、`violated_directive`、`disposition`、`status_code`；不記 query／fragment／完整 body。
- 寫入 `.run/csp-report.log`（`0600`、1 MB 輪替、保留 3 份），不寫主資料庫。
- API 與 Pages 的 CSP 都已加 `report-uri https://api-mbp.ragdemo.win/api/csp-report`。

2026-11-21 檢查與處置：

- 初次 Report-Only 檢查發現兩個違規：inline theme script 與 Cloudflare Web Analytics beacon。
- inline theme script 已搬到 `assets/js/boot.js`；inline violation 消失。
- Cloudflare Web Analytics 已由管理者關閉並 purge；beacon 在 `judgment.ragdemo.win` 與 `api-mbp.ragdemo.win` 都已消失。
- Enforce 後用 Chromium／WebKit／Firefox 跑 RAG 串流、Postgres／Qdrant 查詢、JSON 匯出與各頁面：0 CSP violation、0 page error、下載正常。
- Firefox 曾對 `/api/csp-report` 顯示 `OpaqueResponseBlocking` warning；報告請求仍有到達 API，屬 console 噪音，不是 CSP violation。
- `style-src 'unsafe-inline'` 目前保留（動態 style 屬性需要）。
- 若日後重新啟用 Cloudflare Web Analytics，必須在 API 與 Pages 兩邊的 CSP 加 `https://static.cloudflareinsights.com`（`script-src`）與 `https://cloudflareinsights.com`（`connect-src`），或再次關閉 Web Analytics。

### CSP enforce 回滾

若 enforce 後頁面異常：

1. 把 `app.py` 的 `Content-Security-Policy` 改回 `Content-Security-Policy-Report-Only`。
2. 把 `frontend/_headers` 與 `scripts/build_frontend.py` 的 header 名稱改回 Report-Only。
3. `uv run python scripts/build_frontend.py --api-base https://api-mbp.ragdemo.win`
4. `npx wrangler pages deploy frontend --project-name judgment --branch main`
5. 重啟 `judgment-web`（`tmux kill-session -t judgment-web` 後執行 `JUDGMENT_SKIP_UPDATE_CHECK=1 ./up.sh`）。
6. 確認 response header 已回到 Report-Only，頁面可正常載入。

實際切換前先演練一次這個流程，記錄從改檔到生效的時間。Enforce 後前幾天每天檢查 `.run/csp-report.log`。

## 5. Demo 唯讀資料庫角色

`DEMO_QUERY_DATABASE_URL` 指向 `demo_reader`；demo 訪客的 `/api/query?database=postgres`、`/api/data/suggest`、`/api/judgment`（postgres）、`/api/law`、`/api/schema/suggest` 全部使用它。未設定時訪客 data 功能回 403 `demo_data_unavailable`，不會 fallback 到主連線。

已建立的限制：

- `NOSUPERUSER NOCREATEDB NOCREATEROLE`、`CONNECTION LIMIT 10`
- `statement_timeout=10s`、`idle_in_transaction_session_timeout=15s`、`work_mem=16MB`
- `default_transaction_read_only=on`、`search_path=public`
- `law_documents`、`judgment_documents`、`law_article_versions`、`law_article_change_events` 為 **table-level SELECT**；這些是 demo 報表需要的公開法規／判決內容。
- `law_dataset_versions`、`download_runs`、`judgment_import_runs` 維持 **column-level SELECT**；不授權 `parquet_path`、`zip_path`、`data_dir`、`law_list_path` 等內部欄位。
- `/api/query` 只 select 授權欄位；`/api/schema/suggest` 對 demo visitor 另外封鎖敏感欄位並套用 `sanitize_query_payload()`。
- 已 `REVOKE CREATE ON SCHEMA public FROM PUBLIC`
- `pg_hba.conf`：`local judgment demo_reader reject`、`samehost`／`samenet` 用 `scram-sha-256`、其他來源 `reject`。Docker Desktop 的 app 來源是 bridge gateway（實測 `192.168.107.1`），所以用 `samenet` 而不是只寫 `127.0.0.1`；DB port 仍只綁 host loopback。

驗證指令（不印密碼）：

```bash
# 以 demo_reader 連線後
select current_user, rolsuper from pg_roles where rolname=current_user;
show statement_timeout;                 -- 10s
show default_transaction_read_only;     -- on
select count(*) from law_documents;     -- 成功
select full_text from judgment_documents limit 1; -- 成功（公開判決內容）
select pdf_url from judgment_documents limit 1;   -- 成功（公開 PDF）
select count(*) from law_article_versions; -- 成功（公開法規條文）
select data_dir from judgment_import_runs limit 1; -- permission denied
select parquet_path from law_dataset_versions limit 1; -- permission denied
create table should_fail(id int);       -- permission denied
select count(*) from question_bank_items; -- permission denied
select pg_read_file('/etc/passwd');     -- permission denied
copy (select 1) to program 'id';        -- permission denied
```

回滾：移除 `.env` 的 `DEMO_QUERY_DATABASE_URL` 並重啟，訪客 data 會 fail closed；管理員與其他功能不受影響。

## 6. Query 輸出去敏

`/api/query` 的 demo 回應會經 `sanitize_query_payload()`：

- 清空 `parquet_path`、`zip_path`、`error_message` 等敏感 key。
- 清除字串內的 `/Users/`、`/home/`、`/var/` 與內網 endpoint。

回歸測試：`test_sanitize_query_payload_redacts_operational_fields`。

## 7. 備份加密

- `backup.sh` 會把 PostgreSQL dump 用 age 加密成 `postgres/judgment.dump.age`；`.env` 仍不進備份。
- `BACKUP_REQUIRE_ENCRYPTION=1` 時，沒有 `BACKUP_AGE_RECIPIENT` 會直接失敗。
- `restore.sh` 偵測 `.age` 後用 `BACKUP_AGE_IDENTITY`（預設 `~/.config/judgment/age.key`）解密到暫存檔再 `pg_restore`。
- 空間檢查已納入 PostgreSQL 大小與 Qdrant reserve；目前資料量約需 150 GB+。
- 已完成加密 subset restore drill：`law_dataset_versions` 4 筆，age 解密後 `pg_restore` 到 scratch DB，筆數一致。
- 2026-11-21 完整備份已寫入 `/Volumes/T500_2TB/judgment-backup-20261121-1846`：
  - 總大小 157 GB：`data/` 114 GB＋PostgreSQL dump 13.7 GB（age）＋Qdrant snapshot 29.4 GB（4,714,967 points）。
  - `data/judgments` 1,388 files、`data/laws` 16 files，與來源逐檔大小一致。
  - 安全退出、重新掛載後 `checksums.sha256` 仍 OK。
  - `pg_restore --list` rc=0，443 行；包含 `question_bank_items`、`performance_records`、`demo_settings`、`judgment_documents`。
  - manifest 已移除 `hostname`、`project_root`、source 絕對路徑；沒有 password/token/secret；只保留 `http://127.0.0.1:6333` 這個 localhost Qdrant URL。
- **完整 150 GB＋Qdrant restore drill 尚未執行**；目前只驗證 dump 可讀與 subset restore，需安排維護窗口做完整還原。

## 8. 管理權杖與 session secret 輪替

2026-11-21 已輪替 `JUDGMENT_ADMIN_TOKEN` 與 `AUTH_SESSION_SECRET`；舊 admin token 回 401，舊 session cookie 失效。輪替 `AUTH_SESSION_SECRET` 會讓所有既有 Google session 登出，需重新登入。

安全輪替順序：

1. 產生新值（不要貼到終端機或 issue）：
   ```bash
   openssl rand -base64 48
   ```
2. 更新 `.env` 的 `JUDGMENT_ADMIN_TOKEN` 與 `AUTH_SESSION_SECRET`，保持檔案 `600`。
3. 重啟 `judgment-web`。
4. 先驗證新 admin token 可用，再確認舊 token 回 401。
5. 用新 secret 簽發的 session cookie 測 `/api/auth/me` 的 `authenticated` 為 `true`；舊 cookie 應為 `false`。
6. 重新以 Google 登入管理頁。

不要把 token／secret 寫進 shell 指令參數、issue、commit 或截圖。若曾出現在終端機輸出，視為已外洩並立即輪替。

## 9. 已知未完成

- CSP 已 enforce；`report-uri` 收集端點已上線；`report-to`／Reporting-Endpoints 尚未設定。
- 管理權杖已改存 `sessionStorage`，且已於 2026-11-21 輪替；但仍是靜態長效權杖，沒有 server-side 撤銷（SESSION-01）。
- `AUTH_COOKIE_SAMESITE` 已改為 `lax`；logout 拒絕 cross-site，admin-token 寫入也檢查 Origin／Sec-Fetch-Site。
- 完整備份 restore drill（DB＋Qdrant＋data）尚未執行；目前只有 subset restore。
- `demo_reader` 已是 column-level SELECT；`pg_hba` 已收斂到 `samehost`／`samenet`。主應用仍使用 `judgment` superuser／createdb（APP-DB-01）。
- AUDIT-01、SSE ticket 一次性／綁定、PRIV-01（Google Fonts 自架）尚未完成。
