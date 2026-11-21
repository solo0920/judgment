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

`DEMO_QUERY_DATABASE_URL` 指向 `demo_reader`；只有 demo 訪客的 `/api/query?database=postgres` 使用它。未設定時訪客 data 功能回 403 `demo_data_unavailable`，不會 fallback 到主連線。

已建立的限制：

- `NOSUPERUSER NOCREATEDB NOCREATEROLE`、`CONNECTION LIMIT 10`
- `statement_timeout=10s`、`idle_in_transaction_session_timeout=15s`、`work_mem=16MB`
- `default_transaction_read_only=on`、`search_path=public`
- 只 grant `SELECT` 於 `law_documents`、`law_dataset_versions`、`download_runs`、`judgment_documents`、`judgment_import_runs`
- 已 `REVOKE CREATE ON SCHEMA public FROM PUBLIC`

驗證指令（不印密碼）：

```bash
# 以 demo_reader 連線後
select current_user, rolsuper from pg_roles where rolname=current_user;
show statement_timeout;                 -- 10s
show default_transaction_read_only;     -- on
select count(*) from law_documents;     -- 成功
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

## 7. 已知未完成

- CSP 尚未 enforce；Report-Only 尚無 `report-uri` 收集端點。
- `AUTH_COOKIE_SAMESITE=none` 尚未改 Lax。
- 備份加密與 restore drill 未做。
- `demo_reader` 的欄位層級授權尚未做；目前是五張表的 table-level SELECT。
