# 權限熱修重啟與 Smoke Test 檢查清單

**Status**: Ready（程式與 staging 演練已完成；production 尚未重啟）

**Last Updated**: 2026-11-20

**Related**:

- [`./evaluation.md`](./evaluation.md)
- [`./execution-report.md`](./execution-report.md)
- [`../../scripts/smoke_test_web.sh`](../../scripts/smoke_test_web.sh)

---

## 1. 安全不變量

重啟後 MUST 同時維持：

1. `judgment-web` 只綁 `127.0.0.1`。
2. `FORWARDED_ALLOW_IPS=127.0.0.1`，不得是 `*`。
3. `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0`。
4. Cloudflare tunnel 是唯一外部入口；origin 不得被直連。
5. `CF-Connecting-IP` 由 Cloudflare 管理；應用只使用 uvicorn 已解析的 `request.client.host`。

程式已在啟動時檢查：

- 非 loopback bind 預設拒絕啟動（除非 `JUDGMENT_ALLOW_PUBLIC_BIND=1`）。
- `FORWARDED_ALLOW_IPS` 含 `*` 拒絕啟動。
- local bypass 與非 loopback bind 同時開啟時拒絕啟動。
- route policy 未分類或 stale 時拒絕啟動。
- 若以 direct uvicorn／容器繞過 CLI，request-time `server_bind_allowed()` 會對非 loopback server 回 503。

若 Cloudflare 啟用 Managed Transform「Remove visitor IP headers」，遠端請求會變成 loopback effective IP；middleware 會記錄 `suspicious proxy chain` warning。限流會偏嚴（所有人共用 loopback bucket），必須查看 warning 並修正 header 鏈。

---

## 2. 本機呼叫者盤點

| 呼叫者 | 端點 | 重啟後影響 | 處理 |
| --- | --- | --- | --- |
| `scripts/deploy_web_macos.sh` | `/api/health` | 無（公開） | 不需改 |
| `scripts/apply_local_llm_context.sh` | `/api/health` | 無（公開） | 不需改 |
| `up.sh` | `/api/health` | 無（公開） | 不需改 |
| `src/judgment/web/power_agent.py` | `/api/health` | 無（公開） | 不需改 |
| `scripts/rag_query_benchmark.py` | `POST /api/rag/query` | 會 401 | 已加 `--admin-token`／`JUDGMENT_ADMIN_TOKEN` |
| `scripts/real_question_audit.py` | `POST /api/rag/query` | 會 401 | 已加 `--admin-token`／`JUDGMENT_ADMIN_TOKEN` |
| 手動 `curl http://127.0.0.1:9200/api/...` | 非公開 API | 會 401 | 加 `X-Judgment-Admin-Token` |
| CDP／本機驗證腳本 | 非公開 API | 會 401 | 使用 admin token header |
| Production 前端 | 非公開 API | 無（Google admin session） | 確認登入流程 |
| 本機 `file://` 前端 | 非公開 API | 會 401 | 在設定頁填入 admin token 或改用 Google 登入 |

重啟前再跑一次：

```bash
grep -R "127.0.0.1:9200\|localhost:9200" -n scripts src ~/Library/LaunchAgents
```

任何直接呼叫非公開 API 的呼叫者都必須改帶 `X-Judgment-Admin-Token`。

手動 curl 不建议把 token 直接放在 `-H` 參數（會進 shell history，也可能出現在 `ps`）。可用臨時 curl config：

```bash
umask 077
printf 'header = "X-Judgment-Admin-Token: %s"\n' "$JUDGMENT_ADMIN_TOKEN" > .run/admin.curl
curl --config .run/admin.curl http://127.0.0.1:9200/api/status
rm -f .run/admin.curl
```

Smoke test 只對 `/api/question-bank/stats` 使用 admin token，沒有用 admin token 迴圈呼叫所有 GET；避免誤觸有副作用或高成本的端點。

---

## 3. Staging 演練

已在 2026-11-19 以 `9202` 完成一次：

```bash
JUDGMENT_ADMIN_TOKEN=... ./scripts/smoke_test_web.sh
```

腳本會：

- 先執行 `judgment-web --check-config`，驗證 bind、forwarded allow list、bypass、route policy。
- 使用 `JUDGMENT_DISABLE_BACKGROUND_TASKS=1`：不啟動 event socket、processing snapshot warmup、coverage／staleness／rerank warmup。
- 使用 `AUTO_CREATE_SCHEMA=0`：不執行 migration。
- 使用 `JUDGMENT_POWER_AGENT=0`：不啟動 9201 電源控制器。
- 使用 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0`：以真實 admin token 驗證。
- 驗證公開端點 200、受保護端點 401、admin token 200；admin 只打 `/api/question-bank/stats`，不迴圈所有 GET。

結果：`smoke test passed on http://127.0.0.1:9202`。

Production 設定乾跑已通過：

```text
config check passed: bind=127.0.0.1:9200 forwarded_allow_ips=127.0.0.1
local_bypass=False public_rag=False routes=123
```

刻意使用 `--forwarded-allow-ips '*'` 時 exit 1，代表 fail-fast 生效。

限制：

- Smoke instance 共用 production DB；只讀取少量端點，未啟動背景工作。
- Google OAuth redirect URI 指向 9200，完整 Google 登入仍要在 production 重啟後驗證。

---

## 4. 重啟步驟

1. 確認 v7 copy／index 已完成，且沒有其他索引程序在跑。
2. 記錄目前 commit 與 `.env`（含 admin token、Google OAuth、CORS、tunnel 設定）。
3. 用 production `.env` 跑 `uv run judgment-web --check-config`；必須 exit 0。
4. 再跑一次 `./scripts/smoke_test_web.sh`。
5. 停止舊 `judgment-web`，以相同 `.env` 啟動新版本。
6. 確認啟動 log 沒有 route policy／runtime security 錯誤。
7. 執行第 5 節驗收。

回滾：

- 停止新版本，切回重啟前的 commit，恢復 `.env`，重新啟動。
- 回滾期間的已知風險是本機 bypass 仍開啟；只在必要時使用，並儘快修復。

---

## 5. 重啟後驗收

### 5.1 匿名邊界

- [ ] `GET /api/health` → 200
- [ ] `GET /api/demo/status` → 200，且 `enabled=false`（預設關閉）
- [ ] `GET /api/home` → 403（展示關閉時首頁只顯示靜態頁）
- [ ] `GET /api/auth/me` → 200（`authenticated=false`）
- [ ] `POST /api/auth/logout` → 200
- [ ] `GET /api/status` → 403
- [ ] `GET /api/processing` → 403
- [ ] `POST /api/processing/stop` → 401
- [ ] `DELETE /api/llama-server/hosts/1` → 401
- [ ] `POST /api/rag/query`（空 body）→ 403
- [ ] 未知 `/api/does-not-exist` → 401
- [ ] `/docs/oauth2-redirect` → 401
- [ ] `/api/docs`、`/api/openapi.json` → 401

### 5.2 Admin

- [ ] `GET /api/question-bank/stats` 帶 admin token → 200
- [ ] `GET /api/home` 帶 admin token → 200
- [ ] `GET /api/status` 帶 admin token → 200
- [ ] `GET /api/admin/demo` 帶 admin token → 200
- [ ] Google admin 登入 → `/api/auth/me` 顯示 `authenticated=true`、`admin=true`
- [ ] Google 登出 → session 清除

### 5.3 Header 與 IP

- [ ] 公開網址帶 `CF-Connecting-IP: 127.0.0.1` → Cloudflare 403（或應用 401，不可 200）
- [ ] 公開網址帶 `X-Forwarded-For: 127.0.0.1` → 401，log 顯示真實 client IP
- [ ] 公開網址帶 `Forwarded: for=127.0.0.1` → 401
- [ ] 本機 `curl 127.0.0.1:9200/api/status` 無 token → 401（bypass 已關）
- [ ] log 沒有大量 `suspicious proxy chain`

### 5.4 功能

- [ ] 管理者登入後首頁、RAG、資料、品質、處理、狀態頁正常
- [ ] SSE 訂閱正常；admin ticket 可用
- [ ] v7 copy／index 進度與 waterfall 正常
- [ ] 390px 無水平 overflow；console error 0

### 5.5 展示模式

- [ ] `/api/demo/status` 預設 `enabled=false`，六個 features 全 false
- [ ] 右上角帳號選單只有管理者看到「管理設定」
- [ ] 管理頁可開 2h／24h／7d，六個旗標可切換
- [ ] 開啟後訪客首頁與已開放功能可用；未開放功能顯示鎖定頁
- [ ] 訪客不能匯出、啟動 workflow、管理主機或切換 index
- [ ] 「立即關閉展示」下一個請求生效，六個旗標保留
- [ ] `JUDGMENT_DEMO_HARD_DISABLE=1` 時訪客 API 403，管理頁顯示原因
- [ ] 390px 無水平 overflow；console error 0

---

## 6. 重啟後才做的程式工作

- `app_users`、pending／user 角色與 Phase 1 session 流程。
- SSE ticket 綁 role／topic 與長連線重驗。
- 公開摘要、前端 disabled 狀態、Phase 4 公開 RAG 限流。

---

## 7. 展示模式關閉（面試後，Planned）

> 本節對應 [`./demo-mode-evaluation.md`](./demo-mode-evaluation.md)。展示模式程式尚未實作；實作後面試結束 MUST 完成以下兩層關閉。

### 7.1 第一層：應用層

1. 管理者登入 `https://judgment.ragdemo.win`。
2. 右上角帳號選單 →「管理設定」→「展示模式」。
3. 按「立即關閉展示」。
4. 確認 `GET https://api-mbp.ragdemo.win/api/demo/status` 回 `enabled=false`。
5. 確認訪客首頁顯示「展示目前未開放」。

### 7.2 第二層：Cloudflare tunnel

目前 tunnel 由 LaunchAgent `com.cloudflare.cloudflared` 管理：

```bash
# 關閉
launchctl bootout gui/$(id -u)/com.cloudflare.cloudflared

# 確認後端已無法從公開網址連線
curl -I --max-time 5 https://api-mbp.ragdemo.win/api/health
```

預期：連線失敗或非 200。前端 `judgment.ragdemo.win` 仍由 Cloudflare Pages 提供，會顯示靜態「展示目前未開放」。

恢復 tunnel：

```bash
launchctl bootstrap gui/$(id -u) \
  "$HOME/Library/LaunchAgents/com.cloudflare.cloudflared.plist"
```

### 7.3 面試後檢查

- [ ] 應用層已關閉，`/api/demo/status` 回 `enabled=false`。
- [ ] 六個功能旗標保留上次設定（關閉總開關不重設）。
- [ ] `GET /api/admin/demo` 顯示 `effective.enabled=false`；若 `JUDGMENT_DEMO_HARD_DISABLE=1`，`reason` 標示 hard-disable。
- [ ] audit 有「立即關閉」紀錄。
- [ ] cloudflared 已停止，`api-mbp.ragdemo.win` 無法連線。
- [ ] 隔天檢查 `demo_usage_daily`，沒有異常 token 用量。
