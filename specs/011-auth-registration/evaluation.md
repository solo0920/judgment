# 使用者註冊、角色權限與公開存取評估報告

**Status**: Draft（評估中，尚未實作）

**Version**: 0.1

**Last Updated**: 2026-11-19

**Applies To**: `#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`、Google OAuth、SSE、所有 `/api/*` 路由與前端 action 按鈕。

**Related Specifications**:

- [`../004-web-console/spec.md`](../004-web-console/spec.md)
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)
- [`../008-realtime-event-stream/spec.md`](../008-realtime-event-stream/spec.md)

---

## 1. 結論摘要

方向可行，但不建議先做註冊 UI。應先建立 **default-deny 的路由分類與四角色測試矩陣**，再依序加入：

1. 後端角色／狀態（anonymous、pending、user、admin）。
2. 使用者資料表、申請與管理員核准。
3. 公開唯讀摘要與登入後詳細資料分層。
4. 公開 RAG 的速率限制、每日預算 kill switch 與串流端點保護。
5. 前端 disabled／pending 頁面與管理員通知 badge。

目前程式是二元權限：有效 admin token 或 `GOOGLE_ALLOWED_EMAILS` 內的 Google session，兩者都等於管理員；沒有一般使用者、待審核或唯讀角色。因此不能只在前端鎖按鈕，必須先改後端 middleware。

---

## 2. 目前程式現況

| 項目 | 現況 | 風險／缺口 |
| --- | --- | --- |
| Google 登入 | Authorization Code flow，後端以 client secret 換 token，再讀 userinfo | 沒有把 Google `sub` 對應到本地使用者 |
| Google 白名單 | `GOOGLE_ALLOWED_EMAILS` | 白名單內帳號全部被視為 admin；email 可能變更 |
| Session | HttpOnly cookie、`SameSite`、`Secure`（正式環境） | session 只驗 env 白名單，沒有 DB 狀態回查 |
| Admin token | `X-Judgment-Admin-Token`／Bearer，`hmac.compare_digest` | 沒有 audit log；不進前端但目前沒有使用紀錄 |
| API 保護 | `/api/*` 除 `PUBLIC_API_PATHS` 外，admin token 或任何允許的 Google session 皆可完整使用 | 沒有 read／write／admin 分層 |
| 公開 API | 目前 repo 只公開 `/api/health`、`/api/home`、`/api/auth/*` | 使用者提到 RAG 已公開；若 production 手動開放，尚未回寫 repo 與測試 |
| 本機 bypass | `_is_local_request()` 直接放行本機 client | Cloudflare tunnel／反向代理下，remote 可能被視為 127.0.0.1；需優先確認 |
| RAG 成本控制 | 有 RagAdmission 併發／佇列控制 | 沒有 per-IP rate limit、每日預算、公開 kill switch；`/stream` 容易漏掉 |
| 使用者資料 | 無 `app_users` 資料表 | 無 pending、核准、停用、角色、audit |
| 前端 auth | `auth.js` 只區分登入／登出；`admin: bool(session)` | 沒有 role、pending、canWrite、pending badge |
| 管理員通知 | 無 | 新申請不會通知管理員 |

### 2.1 必須先確認的本機 bypass

目前 `admin_auth_middleware` 在 `_is_local_request(request)` 為真時直接放行所有 API。production 若由 cloudflared／反向代理從 localhost 轉送，FastAPI 看到的 client 可能是 `127.0.0.1`，會使所有遠端請求被當成本機管理員。

上線前 MUST 驗證：

- 遠端經 tunnel 的請求，`request.client.host` 實際是什麼。
- `X-Forwarded-For` 是否可信、是否由 trusted proxy 覆寫。
- 本機 bypass 是否只允許「直接連線且沒有 forwarded headers」的請求。
- 若無法可靠區分，正式環境 MUST 關閉本機 bypass，改用 admin session／token。

---

## 3. 已確認的產品決策

| 決策 | 內容 |
| --- | --- |
| 一般 User 寫入 | 先只開放「範圍限於自己的低風險寫入」：RAG 回答讚／倒讚、修正意見、個人回饋；不開放題庫新增、AI 生成、Benchmark、處理流程 |
| 未登入其他分頁 | 公開聚合資訊（統計、涵蓋範圍、法規目錄）；`#/status`、`#/processing`、`#/system-usage` 等主機／處理細節登入後才看；未登入只顯示去識別化摘要，不回傳原始 API |
| Pending session | 建立受限 session，只能呼叫 `/api/auth/me` 與申請狀態 API；可顯示「審核中」、避免重複申請 |
| Rejected | 不建立 session；顯示結果並設重新申請冷卻期 |
| 管理員核准 | 只有 admin 可以核准／拒絕／停用／改角色；所有操作寫 audit log |
| 通知 | Admin 右上角帳號顯示待審核 badge；有新申請時即時提示 |

---

## 4. 角色與權限矩陣

### 4.1 角色

| 角色 | 定義 |
| --- | --- |
| Anonymous | 未登入；只能使用公開頁面與公開 RAG |
| Pending | Google 已驗證、已送出申請，尚未核准；只能看審核狀態 |
| User | 已核准的一般使用者；可使用公開功能與登入後唯讀頁面、自己的低風險回饋 |
| Admin | 全部功能、使用者管理、處理流程、模型管理、audit |
| Admin token | break-glass 管理身分；不進前端，使用時寫 audit |

### 4.2 建議權限矩陣

| 功能／API | Anonymous | Pending | User | Admin |
| --- | --- | --- | --- | --- |
| 首頁 `/api/home` | ✅ | ✅ | ✅ | ✅ |
| RAG 查詢／串流 | ✅（限流＋預算） | ❌ | ✅ | ✅ |
| 公開統計／法規目錄 | ✅（去識別化） | ❌ | ✅ | ✅ |
| `#/status`、`#/processing` 詳細資料 | 只給公開摘要 | ❌ | ✅ 唯讀 | ✅ |
| 資料查詢／匯出 | 公開聚合或摘要 | ❌ | ✅ 唯讀／匯出 | ✅ |
| 題庫新增／AI 生成 | ❌ | ❌ | ❌（第二階段再評估） | ✅ |
| RAG 回饋／修正意見 | ❌ | ❌ | ✅ 僅自己的資料 | ✅ |
| 處理流程／下載／索引／更新 | ❌ | ❌ | ❌ | ✅ |
| Model Provider 管理 | ❌ | ❌ | ❌ | ✅ |
| Benchmark／測試模式 | ❌ | ❌ | ❌ | ✅ |
| 使用者核准／停用／角色 | ❌ | ❌ | ❌ | ✅ |

> 公開 RAG 是否允許 anonymous 送出回饋需另定；若要避免匿名洗版，建議 anonymous 只能提問，回饋需登入。

---

## 5. 建議資料模型

### 5.1 `app_users`

```text
email             VARCHAR primary key / normalized lower-case
google_sub        VARCHAR unique（主要身分依據）
name              VARCHAR
picture           VARCHAR
role              admin | user
status            pending | active | rejected | disabled
requested_at      TIMESTAMPTZ
approved_at       TIMESTAMPTZ nullable
approved_by       VARCHAR nullable
last_login_at     TIMESTAMPTZ nullable
rejected_at       TIMESTAMPTZ nullable
cooldown_until    TIMESTAMPTZ nullable
note              TEXT
```

- `google_sub` 是登入身分主鍵；email 只用於顯示、白名單 bootstrap 與通知。
- 現有 `GOOGLE_ALLOWED_EMAILS` 一次性 bootstrap 成 `role=admin,status=active`。
- 最後一位 admin 不可降級／停用；檢查必須在 DB transaction 內完成。

### 5.2 `app_user_audit`

```text
id
actor_email
action            request | approve | reject | disable | role_change | admin_token_use
target_email
before            JSONB
after             JSONB
created_at
```

### 5.3 `rag_feedback`

```text
id
user_email        nullable（anonymous 不寫入或另存匿名 token）
request_id        RAG request／message id
rating            up | down
comment           TEXT nullable
created_at
```

- User 只能新增／讀取自己的回饋。
- Admin 可讀取全部，用於專家回饋迴路。
- 若 anonymous 開放回饋，必須加 per-IP 限流與去重。

---

## 6. 註冊與核准流程

```text
Google OAuth callback
  -> 驗證 Google 身分（sub / email / email_verified）
  -> 查 app_users by google_sub
     -> active: 建立正常 session
     -> disabled/rejected: 顯示結果，不建立 session（rejected 需冷卻期）
     -> pending: 建立受限 session
     -> 不存在: 建立 pending 申請 + 建立受限 session + admin 通知
```

- Pending session 只允許：
  - `GET /api/auth/me`
  - `GET /api/auth/application`
  - `POST /api/auth/logout`
- Admin 核准後，下一次請求回查 DB status 即生效；不依賴舊 session 內容。
- Rejected 帳號在 `cooldown_until` 前不得重新申請。
- 待審核總數上限與同一帳號申請頻率需限制，避免 badge 洗版。

### 6.1 Google 驗證細節

目前使用 Authorization Code flow，後端以 client secret 換 token，再讀 Google userinfo；這已經避免信任前端傳來的 email。若改用 Google Identity Services ID token，後端 MUST 驗證：

- 簽章與 Google JWKS
- `aud` 等於 client id
- `iss` 為 Google
- `exp`／`iat`
- `email_verified = true`
- 以 `sub` 作為身分，不以 email 當唯一鍵

兩種流程只能選一種；不要同時信任前端 ID token 與後端 code flow 而沒有清楚規則。

---

## 7. API 路由分類與 default-deny

### 7.1 分類

每條 `/api/*` 路由 MUST 被標記為以下其中之一：

| 分類 | 說明 |
| --- | --- |
| `PUBLIC_READ` | 可匿名 GET（首頁、公開統計、公開 RAG） |
| `AUTH_READ` | 登入後可 GET；pending 不行 |
| `SELF_WRITE` | 登入使用者只能改自己的低風險資料（RAG 回饋） |
| `ADMIN_WRITE` | 只有 admin／admin token |
| `AUTH_ONLY` | 只允許 auth／application 狀態端點，pending 也可 |

### 7.2 Middleware

- 未分類路由 MUST 預設拒絕（403），不得預設放行。
- 測試 MUST 列舉 `app.routes` 全部 `/api/*`，任何未分類路由讓測試失敗。
- 公開路由也 MUST 經過 method 檢查；PUBLIC_READ 不得允許 POST／PATCH／DELETE。
- 本機 bypass 必須與 forwarded header 規則一起測試，避免 tunnel 遠端被當成本機。

### 7.3 敏感資料分層

不可直接把 `#/status`、`#/processing`、`/api/system-usage` 的原始 payload 公開。建議新增：

- `GET /api/public/summary`：只含統計數字、涵蓋月份、服務正常／降級、法規目錄等去識別化資訊。
- 未登入前端只呼叫 public summary；登入後才呼叫原始 `/api/status`、`/api/processing`。
- `/api/status` 的 endpoints、Docker 路徑、volume、host、container、日誌位置等 MUST 不對 anonymous 回傳。

---

## 8. 公開 RAG 的成本與濫用控制

公開 RAG 是最大風險，必須與公開功能同時上線，不可延後。

### 8.1 限流

- Per-IP：每分鐘／每小時請求數與併發數。
- Per-IP 每日上限。
- 全站每日預算上限（問題數、token 數或估算成本）。
- 超限回 429，附 `Retry-After`；前端顯示友善訊息。
- `/api/rag/query` 與 `/api/rag/query/stream` MUST 使用同一套限制；stream 連線建立時就要扣額度。
- 問題長度上限、回答 `max_tokens`／`num_predict` 上限。
- 必要時加 Cloudflare Turnstile 或同等的人機驗證。

### 8.2 Kill switch

- `PUBLIC_RAG_ENABLED=false` 可立即停止匿名提問，登入使用者可另行設定。
- 每日預算到達時自動停止匿名提問，不影響 admin／User（或依設定）。
- 設定與目前用量 MUST 顯示在 admin 狀態頁，並寫 audit。

### 8.3 儲存

- 單機部署可先用 SQLite／現有 event journal 儲存 counters；若多 instance，改用共享 DB。
- 計數器需有每日重置與原子遞增，避免併發超額。
- 不得只存在前端或單一 process 記憶體，否則重啟即重置。

---

## 9. 前端行為

### 9.1 Auth state

`/api/auth/me` 建議回傳：

```json
{
  "authenticated": true,
  "role": "user",
  "status": "active",
  "pending_user_count": 0,
  "google_enabled": true
}
```

- Pending 回傳 `role: null`、`status: "pending"`、`application` 狀態。
- Admin 回傳 `pending_user_count`，供右上角 badge。
- 停用使用者下一次請求即失效，前端收到 401／403 後清除 auth state。

### 9.2 按鈕狀態

- 建立 `canWrite`、`isAdmin`、`isPending` 狀態。
- Anonymous：首頁／RAG 可用；其他分頁顯示公開摘要；所有寫入按鈕 disabled，tooltip 說明需登入。
- Pending：只顯示審核中頁面，不載入其他資料。
- User：可看詳細唯讀頁面與自己的回饋；管理／處理按鈕 disabled。
- Admin：全部按鈕可用。
- 前端 disabled 只是 UX；API MUST 再次拒絕。

### 9.3 管理員通知與核准

- 右上角頭像 badge：待審核數量。
- 帳號選單新增「使用者申請 (N)」。
- 點擊開啟待審核清單：核准、拒絕、查看申請時間／email／name。
- 完整管理可放在 `#/status` 的「使用者管理」分類。
- 通知可用現有 SSE 新增 `auth` topic；若短期不做 SSE，至少在登入後、開啟選單與每頁初次載入時取得 count。

---

## 10. 安全與邊界條件

- Session 每次請求回查 `app_users.status`；停用立即生效。
- Admin token 使用常數時間比較、只在後端、使用時寫 audit；定期更換。
- 最後一位 admin 的降級／停用必須在 transaction 內檢查，避免競態。
- 核准／拒絕／停用／角色變更全部寫 audit。
- Google email 變更不影響 `google_sub` 身分；email 只用於顯示與通知。
- Rejected 冷卻期與 pending 總數上限。
- CSRF：cookie session 的寫入請求需 Origin／SameSite 檢查；敏感操作可加 CSRF token。
- 公開 RAG 不得繞過 admission 或 stream 限制。
- 公開摘要不得包含主機路徑、container、volume、token、內部 IP、API endpoints、日誌位置。
- 測試矩陣：anonymous／pending／user／admin × GET／POST／PATCH／DELETE，任何未分類路由失敗。

---

## 11. 建議實作順序

### Phase 0：權限骨架（最高優先）

1. 盤點所有 `/api/*`，建立路由分類表。
2. 實作 default-deny middleware 與分類 decorator／metadata。
3. 加入「所有路由必須被分類」測試。
4. 檢查並修正 `_is_local_request` 在 tunnel／proxy 下的 bypass。
5. 建四角色 × method 的測試矩陣。

### Phase 1：使用者資料與 session

1. `app_users`、`app_user_audit`、migration、bootstrap admin。
2. `read_session` 改為 DB 回查 status／role。
3. Google callback 建立 pending／active／rejected 流程。
4. Pending 受限 session。

### Phase 2：核准與通知

1. Admin 使用者管理 API：list pending／approve／reject／disable／role。
2. 最後 admin 保護與 audit。
3. `/api/auth/me` pending count。
4. 右上角 badge、管理員核准 UI、通知。

### Phase 3：公開唯讀與前端鎖定

1. `GET /api/public/summary` 去識別化摘要。
2. Anonymous 其他分頁只載入公開摘要。
3. User 詳細唯讀頁面與按鈕 disabled 狀態。
4. 前端 auth state／canWrite／isAdmin。

### Phase 4：公開 RAG 保護

1. Per-IP rate limit、每日／全站預算、kill switch。
2. `/stream` 同步限制。
3. 問題長度與 token 上限。
4. 429／預算用盡 UI。
5. 可選 Turnstile。

### Phase 5：回饋與 hardening

1. RAG 回饋／修正意見（User 自己）。
2. Admin 回饋檢視。
3. CSRF／audit／session 撤銷／最後 admin 競態測試。
4. 文件與驗收。

---

## 12. 預估工作量

以目前程式與 endpoint 數量，這是 **中等偏大** 變更，主要成本在：

- 100+ 個 API 路由分類與測試（Phase 0）。
- 全站前端 action 盤點與 disabled 狀態（Phase 3）。
- 公開摘要與敏感資料清理（Phase 3）。
- 公開 RAG 限流與預算（Phase 4）。

程式碼本身不是最大風險；最大風險是 **漏掉某個 API 或 tunnel bypass**。因此 Phase 0 必須先做，且不能以「先上線再補」處理公開 RAG。

粗估：

- Phase 0+1：約 1–2 個開發日
- Phase 2：約 1 個開發日
- Phase 3：約 1–2 個開發日
- Phase 4：約 1 個開發日
- Phase 5＋驗收：約 1 個開發日

不含 Google OAuth 設定、Cloudflare Turnstile 申請與人工驗收。

---

## 13. 待討論決策

1. 公開摘要要做到什麼程度？是否包含各頁的即時統計，或只有首頁／法規目錄？
2. User 除了 RAG 回饋，是否允許資料匯出、查詢歷史、個人設定？是否允許題庫唯讀？
3. 公開 RAG 每日預算用「請求數」還是「token／估算成本」計算？全站上限值是多少？
4. Anonymous 是否可送 RAG 回饋？若可，如何防洗版？
5. 管理員核准 UI 要放 `#/status` 新分類，或只放在右上角帳號選單？
6. `GOOGLE_ALLOWED_EMAILS` 是否正式更名為 `GOOGLE_ADMIN_EMAILS`，或保留相容名稱？
7. 本機 bypass 在 production 是否完全關閉？若保留，forwarded header 的白名單規則是什麼？

---

## 14. 建議下一步

先做 Phase 0 的路由盤點與 default-deny 測試，不急著做註冊 UI。Phase 0 會直接暴露目前哪些 API 會被公開、哪些會被 tunnel bypass，並成為後續角色與前端鎖定的可靠基礎。
