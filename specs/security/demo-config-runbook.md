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

未來訪客查詢唯讀角色完成後，新增：

| 變數 | 說明 |
|---|---|
| `DEMO_QUERY_DATABASE_URL` | `demo_reader` 連線字串；**未設定時訪客 data 功能必須 fail closed**，不可 fallback 到 superuser |

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
# 預期 401

curl -sS https://api-mbp.ragdemo.win/api/demo/status
# 預期 enabled:false
```

最後再決定是否停止 cloudflared tunnel；停止前確認沒有其他服務依賴它。

## 4. CSP Report-Only

目前只有 Report-Only，沒有 `report-uri` 收集端點。轉 enforce 前，至少：

- 用 Chrome／Safari 開首頁、RAG、data、performance、processing、status，檢查 console 是否有 CSP violation。
- 或加一個受 body 上限與 rate limit 保護的 `/api/csp-report`，並在 CSP 加 `report-uri`。

## 5. 已知未完成

- `DB-ROLE-01`：訪客 `data` 仍使用主連線（superuser）；展示後做 `demo_reader` 唯讀角色。
- CSP 尚未 enforce。
- `AUTH_COOKIE_SAMESITE=none` 尚未改 Lax。
- 備份加密與 restore drill 未做。
