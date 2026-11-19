# 使用者註冊、角色權限與公開存取評估報告

**Status**: Draft（已納入 2026-11-19 覆核意見；Phase 0.1 熱修、Phase 0 路由政策、Principal、router 匹配與 staging 已完成，尚未重啟 production）

**Version**: 0.7

**Last Updated**: 2026-11-19

**Applies To**: `#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`、Google OAuth、SSE、所有 `/api/*` 路由與前端 action 按鈕。

**Related Specifications**:

- [`../004-web-console/spec.md`](../004-web-console/spec.md)
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)
- [`../008-realtime-event-stream/spec.md`](../008-realtime-event-stream/spec.md)
- [`./execution-report.md`](./execution-report.md)

---

## 1. 結論摘要

方向可行，且覆核意見的 10 點全部接受。其中 9 點可直接落地；SSE 長連線的權限撤銷需要額外的定期重驗機制，不能只靠「每次 HTTP 請求回查 DB」。

實作順序調整為：

1. **Phase 0.1（已完成程式熱修，待重啟生效）**：production 關閉本機 admin bypass，避免 tunnel 遠端被視為 `127.0.0.1`。
2. **Phase 0（部分完成）**：default-deny 路由分類、啟動時檢查、binary admin／anonymous 強制、client IP helper 已完成；四角色測試矩陣與 SSE topic 權限待補。
3. **Phase 1**：`app_users`、角色／狀態、DB session 回查、Google pending 流程。
4. **Phase 2**：管理員核准、audit、右上角 badge 與使用者管理頁。
5. **Phase 3**：公開摘要、匿名唯讀、登入後詳細頁、前端 disabled。
6. **Phase 4**：公開 RAG 的 per-IP 限流、每日預算、kill switch、串流扣款。
7. **Phase 5**：RAG 回饋、隱私／保留期限、hardening 與驗收。

目前程式是二元權限：有效 admin token 或 `GOOGLE_ALLOWED_EMAILS` 內的 Google session，兩者都等於管理員；沒有一般使用者、待審核或唯讀角色。因此不能只在前端鎖按鈕，必須先改後端 middleware。

目前 FastAPI 共有 **114 個 method route、100 個 `/api/*` path**（不含 `/`、`/favicon.svg`）。Phase 0 的分類成本主要來自逐條判斷「誰可以讀、誰可以寫」，不是張數本身。

**2026-11-19 外部驗證**：從公開 Cloudflare 網址不帶憑證呼叫 `/api/status`、`/api/processing`、`/api/question-bank/stats`、`/api/docs` 均回 401；本機 loopback 的 `/api/status` 回 200。這表示目前沒有觀察到公開 tunnel bypass，不需要緊急重啟；但舊版程式仍在本機 bypass，Phase 0.1 熱修要等下次重啟才生效。同一驗證也顯示匿名 RAG 尚未開放（`/api/rag/query` 空 body 回 401）。

---

## 2. 目前程式現況

| 項目 | 現況 | 風險／缺口 |
| --- | --- | --- |
| Google 登入 | Authorization Code flow；後端以 client secret 換 token，再讀 userinfo | 已驗證 `state` 與 `email_verified`；尚未對應本地 `google_sub`，也尚無 PKCE |
| Google 白名單 | 現行 `GOOGLE_ALLOWED_EMAILS` | 白名單內帳號全部被視為 admin；email 可能變更，不能當唯一身分 |
| Session | HttpOnly cookie、`SameSite`、正式環境 `Secure` | session 只驗 env 白名單，沒有 DB 狀態／角色回查 |
| Admin token | `X-Judgment-Admin-Token`／Bearer，`hmac.compare_digest` | 沒有 audit log、沒有使用紀錄、沒有定期更換流程 |
| API 保護 | `/api/*` 除 route policy 的 `PUBLIC_*` 外，admin token 或任何允許的 Google session 皆可完整使用 | 已加 default-deny 與 binary 權限；pending／user runtime 尚未接入 |
| 公開 API | repo 目前只公開 `/api/health`、`/api/home`、`/api/auth/*`；2026-11-19 外部實測 RAG 仍回 401 | 匿名 RAG 尚未真正開放，需先完成 Phase 4 最小限流與預算 |
| 本機 bypass | 已改為 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS`，預設 `0`；forwarded header 存在時不使用 bypass | 程式已熱修，但 production 尚未重啟；外部實測非公開端點 401、本機 loopback 200；重啟後仍要再驗證 |
| SSE | `/api/auth/sse-ticket` 發 120 秒 bearer ticket；`/api/events/stream` 可用 ticket 訂閱所有 topic | ticket 未綁角色／topic；pending／匿名若取得 ticket 可收到 processing／status；長連線不會因停用即時斷線 |
| API docs | `/api/docs`、`/api/openapi.json` 目前受 admin/session 保護 | 未來 default-deny 必須明確列為 admin-only 或 production 關閉，不能因分類漏掉而公開 |
| RAG 成本控制 | `RagAdmission` 有併發／佇列／ETA 控制 | 沒有 per-IP rate limit、每日 token 預算、公開 kill switch；`/stream` 容易漏掉 |
| 使用者資料 | 無 `app_users` 資料表 | 無 pending、核准、停用、角色、audit |
| 前端 auth | `auth.js` 只區分登入／登出；`admin: bool(session)` | 沒有 role、pending、canWrite、pending badge |
| 管理員通知 | 無 | 新申請不會通知管理員 |

### 2.1 本機 bypass（Phase 0.1 熱修）

原本 `admin_auth_middleware` 在 `_is_local_request(request)` 為真時直接放行所有 API。production 由 cloudflared／反向代理從 localhost 轉送時，FastAPI 看到的 client 可能是 `127.0.0.1`，會使所有遠端請求被當成本機管理員。

**已定案並熱修：**

- Production MUST 完全關閉本機 bypass；預設值為 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0`。
- 僅 direct local development 可設 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=1`。
- 即使開啟，帶有 `CF-Connecting-IP`、`X-Forwarded-For`、`Forwarded` 或 `X-Real-IP` 的請求 MUST NOT 使用 bypass。
- Production 的遠端請求 MUST 使用 admin token 或 Google admin session。
- 熱修已含測試：預設關閉時本機管理 API 回 401；開啟時可使用；帶 forwarded header 時回到 401。
- **尚未重啟 production**；目前 v7 索引 copy 正在進行，重啟會影響監控與 API，不應在 copy 期間重啟。下次重啟後 MUST 用真實 tunnel 請求驗證 `request.client.host` 與 forwarded headers。

---

## 3. 已確認的產品決策

| 決策 | 內容 |
| --- | --- |
| 未登入首頁／RAG | 可使用首頁與公開 RAG；RAG 受 per-IP 限流、每日預算與 kill switch 保護 |
| 未登入其他分頁 | 只顯示公開聚合摘要（統計、涵蓋月份、法規目錄、服務正常／降級）；`#/status`、`#/processing`、`#/system-usage` 的主機／處理細節登入後才看 |
| 一般 User 寫入 | 先只開放「範圍限於自己的低風險寫入」：RAG 回答讚／倒讚、修正意見、個人回饋；不開放題庫新增、AI 生成、Benchmark、處理流程、資料匯出 |
| Pending session | 建立受限 session；權限 MUST ⊇ Anonymous（首頁、RAG、公開摘要），額外多申請狀態頁；不得使用詳細資料、SSE、寫入 API |
| Rejected | 不建立 session；顯示結果並設重新申請冷卻期 |
| 管理員核准 | 只有 admin 可以核准／拒絕／停用／改角色；所有操作寫 audit log |
| 通知 | Admin 右上角帳號顯示待審核 badge；帳號選單有入口；完整管理放 `#/status` 的「使用者管理」分類 |
| Bootstrap | `GOOGLE_ALLOWED_EMAILS` 更名為 `GOOGLE_BOOTSTRAP_ADMIN_EMAILS`，只在 DB 沒有任何 admin 時生效；不再作為長期白名單 |
| 本機 bypass | Production 完全關閉；只保留 direct local development 的環境變數開關 |
| 公開摘要範圍 | 只做首頁、法規目錄、聚合統計；各分頁不放即時數據 |

---

## 4. 角色與權限矩陣

### 4.1 角色

| 角色 | 定義 |
| --- | --- |
| Anonymous | 未登入；首頁、公開 RAG、公開摘要 |
| Pending | Google 已驗證、已送出申請，尚未核准；權限 ⊇ Anonymous，額外可看申請狀態 |
| User | 已核准的一般使用者；公開功能、登入後唯讀頁面、自己的低風險回饋 |
| Admin | 全部功能、使用者管理、處理流程、模型管理、audit |
| Admin token | break-glass 管理身分；不進前端，使用時寫 audit |

### 4.2 權限矩陣

| 功能／API | Anonymous | Pending | User | Admin |
| --- | --- | --- | --- | --- |
| 首頁 `/api/home` | ✅ | ✅ | ✅ | ✅ |
| RAG 查詢／串流 | ✅（限流＋預算） | ✅（繼承匿名額度） | ✅ | ✅ |
| 公開統計／法規目錄 | ✅（去識別化） | ✅（去識別化） | ✅ | ✅ |
| 公開摘要 `/api/public/summary` | ✅ | ✅ | ✅ | ✅ |
| `#/status`、`#/processing` 詳細資料 | 只給公開摘要 | 只給公開摘要 | ✅ 唯讀 | ✅ |
| 資料查詢 | 公開聚合或摘要 | 公開聚合或摘要 | ✅ 唯讀 | ✅ |
| 資料匯出 | ❌ | ❌ | ❌（第二階段再評估） | ✅ |
| 題庫唯讀 | 公開摘要 | 公開摘要 | ✅ | ✅ |
| 題庫新增／AI 生成 | ❌ | ❌ | ❌（第二階段再評估） | ✅ |
| RAG 回饋／修正意見 | ❌ | ❌ | ✅ 僅自己的 request | ✅ |
| 處理流程／下載／索引／更新 | ❌ | ❌ | ❌ | ✅ |
| Model Provider 管理 | ❌ | ❌ | ❌ | ✅ |
| Benchmark／測試模式 | ❌ | ❌ | ❌ | ✅ |
| 使用者核准／停用／角色 | ❌ | ❌ | ❌ | ✅ |
| SSE 即時事件 | ❌ | ❌ | ✅ 唯讀 topic | ✅ 全部 topic |

> Pending 的權限 MUST ⊇ Anonymous：申請審核中仍可使用首頁、RAG 與公開摘要，只是額外多一個「審核中」頁面。Anonymous 不可送出回饋；回饋需 User 以上。

---

## 5. 建議資料模型

### 5.1 `app_users`

```text
id                INTEGER primary key
google_sub        VARCHAR unique（主要身分依據）
email             VARCHAR unique / normalized lower-case
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

- `google_sub` 是登入身分主鍵；email 只用於顯示、通知與 bootstrap 比對。使用者改 email 時更新顯示欄位，不改 `google_sub`。
- `GOOGLE_BOOTSTRAP_ADMIN_EMAILS` 只在資料庫沒有任何 admin 時，將對應帳號建立為 `role=admin,status=active`；一旦 DB 有 admin，就不再自動授權。
- 最後一位 admin 不可降級／停用；檢查必須在 DB transaction 內完成，避免兩個管理員同時降級對方。
- 停用使用者每次請求回查 DB status；可用短 TTL cache，但停用操作 MUST 主動失效。

### 5.2 `app_user_audit`

```text
id
actor_type        google | admin_token | system
actor_email
action            request | approve | reject | disable | enable | role_change | admin_token_use | bootstrap
target_email
before            JSONB
after             JSONB
request_id        VARCHAR nullable
ip_hash           VARCHAR nullable
created_at
```

- 核准、拒絕、停用、啟用、角色變更、bootstrap、admin token 使用全部寫 audit。
- audit 不可由一般 API 修改；保留期限另行訂定。

### 5.3 `rag_feedback`

```text
id
user_id           INTEGER
request_id        VARCHAR
rating            up | down
comment           TEXT nullable
review_status     new | reviewed | accepted | rejected
reviewed_by       VARCHAR nullable
reviewed_at       TIMESTAMPTZ nullable
created_at        TIMESTAMPTZ
```

- 回饋 MUST 綁定 `request_id`；後端 MUST 驗證該 request 屬於目前登入者，否則使用者可以對任意回答灌水。
- Anonymous 不可送出回饋。Pending 不可送出回饋。
- `comment` 長度上限（建議 2,000 字）且前端輸出必須 escape，避免儲存型 XSS。
- 回饋不會自動進入評估集或訓練資料；必須經 admin `review_status=accepted` 才可被後續流程使用。
- RAG 開始時記錄 `request_id` 與使用者關聯；匿名 request 沒有 owner，因此不能回饋。

---

## 6. 註冊與核准流程

```text
Google OAuth callback
  -> 驗證 state（已實作）與 PKCE（待加）
  -> 以 code 換 token，讀 userinfo
  -> 驗證 email_verified
  -> 查 app_users by google_sub
     -> active: 建立正常 session（role/status 以 DB 為準）
     -> pending: 建立受限 session
     -> disabled: 不建立 session，顯示停用狀態
     -> rejected: 不建立 session，顯示結果與冷卻期
     -> 不存在: 建立 pending 申請 + 受限 session + admin 通知
```

- Pending session 權限 MUST ⊇ Anonymous：
  - 可使用所有 `PUBLIC_READ`／`PUBLIC_QUERY`（首頁、公開 RAG、公開摘要）。
  - 可額外呼叫 `GET /api/auth/me`、`GET /api/auth/application`、`POST /api/auth/logout`。
  - MUST NOT 呼叫 `AUTH_READ` 詳細資料、`SELF_WRITE`、`ADMIN_WRITE` 或 SSE。
- Admin 核准後，下一次請求回查 DB status 即生效；不依賴舊 session 內容。
- Rejected 帳號在 `cooldown_until` 前不得重新申請。
- 不以「全站待審核總數」作為唯一上限，避免攻擊者灌滿名額阻擋真正申請者；改用每 IP／每日申請數、同帳號冷卻與 badge 分頁。
- Pending 清單與 badge 只顯示數字；列表分頁，避免大量申請造成 UI 負擔。

### 6.1 Google 驗證細節

目前使用 Authorization Code flow，後端以 client secret 換 token，再讀 Google userinfo；已驗證 `state` 與 `email_verified`，不信任前端傳來的 email。

上線前補強：

- 加入 PKCE：`code_challenge`、`code_challenge_method=S256`、`code_verifier` 存在 signed state cookie，callback 換 token 時帶入。
- 若改用 Google Identity Services ID token，後端 MUST 驗證簽章與 Google JWKS、`aud`、`iss`、`exp`／`iat`、`email_verified`，並以 `sub` 作為身分。
- 兩種流程只能選一種；不要同時信任前端 ID token 與後端 code flow 而沒有清楚規則。

### 6.2 Phase 1 cutover 設計

- **切換順序**：先 migration → 再 bootstrap admin → 最後才把 session 判斷切到 DB。切換前先確認 bootstrap 已完成且 admin email 正確，否則現有 Google session 會全部失效；恢復路徑是 admin token。
- **Bootstrap 綁定**：只在 DB 沒有任何 admin 時生效，且在單一 transaction 完成。第一次以 email 比對後，立即把該列的 `google_sub` 綁定；之後一律以 `sub` 為準，email 變更或被他人重用都不會接管帳號。Email 只做 lower-case 正規化，不做 Gmail 點號／加號折疊。
- **最後一位 admin**：PostgreSQL 使用 `SELECT ... FOR UPDATE` 鎖住 admin 列後再計數，避免兩位 admin 同時降級對方；需要並發測試，不能只測單執行緒。
- **Admin token audit**：不要每個請求逐筆寫，否則 audit 會被淹沒。記錄首次使用、每小時摘要（來源、次數、路徑類別）；敏感操作才逐筆記錄。
- **Session 撤銷**：session 內放 `session_version`；停用或降級時遞增，搭配短 TTL 快取與主動失效。文件要寫明最長生效延遲。
- **HMAC 金鑰管理**：`hashed_client_ip_key` 的金鑰不得進版控；要有輪替策略。若輪替週期比保留期限短，就無法跨期關聯濫用行為，這是隱私與偵測的取捨，必須明確記錄。

---

## 7. API 路由分類與 default-deny

### 7.1 分類

每條已註冊路由 MUST 被標記為以下其中之一：

| 分類 | 說明 |
| --- | --- |
| `PUBLIC_READ` | 可匿名 GET（首頁、公開摘要、法規目錄、公開統計） |
| `PUBLIC_QUERY` | 可匿名 POST，但只用於查詢、不改共享資料（`/api/rag/query`、`/api/rag/query/stream`）；必須限流與預算控制 |
| `PUBLIC_AUTH` | 匿名可用的登入流程端點（Google start／callback、logout） |
| `AUTH_READ` | 登入後可 GET；pending 不行；包含 SSE 與詳細狀態頁 |
| `AUTH_QUERY` | 登入後可 POST 的唯讀查詢（例如 `/api/query`） |
| `SELF_WRITE` | 登入使用者只能改自己的低風險資料（RAG 回饋、client timing） |
| `AUTH_ONLY` | 只允許已登入 session 的 application 狀態端點；pending 也可；SSE ticket 改列 `AUTH_READ`，pending 不可 |
| `ADMIN_ONLY` | 只有 admin／admin token 可讀或執行（含 API docs） |
| `ADMIN_WRITE` | 只有 admin／admin token 可寫 |

- `/api/docs`、`/api/openapi.json` MUST 列為 admin-only 或 production 關閉；OpenAPI 會列出全部路由，不應匿名公開。
- `/`、`/favicon.svg` 與前端靜態檔可公開，但必須在分類表中明列。
- SSE `/api/events/stream` 列為 `AUTH_READ`，且 topic 需再授權。
- Phase 4 完成前，`/api/rag/query` 與 `/api/rag/query/stream` 在 `route_policies.json` 暫列 `ADMIN_ONLY`；完成限流、預算與 kill switch 後才改成 `PUBLIC_QUERY`，避免分類先行造成意外公開。
- 即使未來改成 `PUBLIC_QUERY`，公開狀態仍 MUST 同時受 `PUBLIC_RAG_ENABLED`（預設 `false`）控制；分類表不是唯一的開關。

### 7.2 落地方式

- 使用 FastAPI router／route 層級的 `Depends` 或 metadata 做分類，比 middleware 內比對 path 字串可靠；middleware 只作 defense-in-depth。
- 分類表已建立於 `src/judgment/web/route_policies.json`，由 `scripts/generate_route_policies.py` 從 `app.routes` 產生；產生器只新增缺少的條目並預設 `ADMIN_ONLY`，不覆寫人工分類；`--reset` 才重建。
- 應用啟動時檢查所有已註冊路由（含非 `/api`）都有分類；發現未分類路由 MUST 拒絕啟動，而不是只靠測試。目前已於 lifespan 啟動時驗證，並有測試涵蓋。
- 路由刪除或改名後，分類表中的孤兒條目 MUST 被偵測；目前啟動驗證會列出 stale keys 並拒絕啟動，產生器會移除它們。
- 路由列舉涵蓋 `APIRoute`、Starlette `Route`、`Mount`（含子 app 遞迴）與 `WebSocketRoute`；HEAD 正規化為 GET policy，OPTIONS 由 CORS 處理。
- middleware 每個請求解析一次 `request.state.principal`；`Principal` 有 `anonymous`／`pending`／`user`／`admin`／`admin_token` 五種 kind。
- policy × kind 決策表已資料化；目前 runtime 仍只產生 anonymous／admin／admin_token，pending／user 由 Phase 1 的 `app_users` 提供。
- middleware 直接用 `route.matches(scope)` 取得 Starlette 實際分派的 route，再查該 route 的 policy；percent-decode／合併斜線只用於判斷 API 前綴。未知、尾斜線、大小寫變形、dot segment、編碼斜線與重複斜線路徑 default deny。
- `route_policy_guard` 全域 `Depends` 在 routing 後再檢查一次 policy，作為 middleware 漏判的第二道防線。
- 測試 MUST 列舉 `app.routes` 全部 method route，任何未分類路由讓測試失敗；另需測試參數路由、`{param:path}` 與變形路徑。
- `PUBLIC_READ` 不得允許 POST／PATCH／DELETE；`PUBLIC_QUERY` 只允許明確列出的查詢 POST，且另受 `PUBLIC_RAG_ENABLED` 控制。
- 本機 bypass 與 forwarded header 規則必須一起測試，避免 tunnel 遠端被當成本機。
- 未分類路由預設拒絕；有 admin token 設定時回 401，否則回 403，不得預設放行。

### 7.3 SSE 權限

- 匿名與 pending MUST NOT 取得 SSE ticket。
- Ticket MUST 綁定 `user_id`、`role`、允許的 topic 與短 TTL；不得再是「任何有效 ticket 可訂閱所有 topic」。
- User 只可訂閱唯讀 topic（例如 processing、judgment-download、status、system-usage、ollama、court-check、law-version-check 等）；admin 可訂閱全部。
- 長連線以使用者狀態版本號變更觸發重驗，並保留最長 60 秒的重驗間隔；停用或角色變更時 MUST 主動關閉連線。
- 單 process 可直接通知；多 process 需共用 pub/sub 或 DB 版本通知，不能只依賴單機記憶體。
- `POST /api/auth/sse-ticket` 只允許 active user／admin；pending 不行。

### 7.4 敏感資料分層

不可直接把 `#/status`、`#/processing`、`/api/system-usage` 的原始 payload 公開。新增：

- `GET /api/public/summary`：只含統計數字、涵蓋月份、服務正常／降級、法規目錄、最後更新時間等去識別化資訊。
- 未登入前端只呼叫 public summary；登入後才呼叫原始 `/api/status`、`/api/processing`。
- `/api/status` 的 endpoints、Docker 路徑、volume、host、container、日誌位置、內部 IP、token 等 MUST 不對 anonymous 回傳。
- 各分頁不提供即時統計；公開摘要只做首頁與法規目錄所需的聚合值。

---

## 8. 公開 RAG 的成本與濫用控制

公開 RAG 是最大風險，必須與公開功能同時上線，不可延後。

### 8.1 Client IP 與限流

- 以單一 `client_ip()` helper 取得來源。2026-11-19 已確認 production 由 `judgment-web` 以 `proxy_headers=True`、`FORWARDED_ALLOW_IPS=127.0.0.1`、bind `127.0.0.1` 啟動，uvicorn 會把 `request.client.host` 改寫成真實 client IP；因此 helper MUST 直接使用 `request.client.host`，不要再次解析 `CF-Connecting-IP` 或 `X-Forwarded-For`，避免第二個可偽造的信任邊界。
  - 前提是 origin 只綁 loopback 且只接受 tunnel；若 bind 或 `FORWARDED_ALLOW_IPS` 改變，MUST 重新驗證。
  - 若無法保證 origin 只接受 tunnel，MUST 以防火牆阻擋直連，並改回只使用 socket IP。
- Per-IP：每分鐘／每小時請求數、每日上限、併發數；使用 `client_ip_key()` 將 IPv6 正規化為 `/64` bucket，並把 IPv4-mapped IPv6（`::ffff:1.2.3.4`）正規化為 IPv4，避免同一人有兩個桶。
- 已登入者除 IP 外另加 per-user 限制，避免共用出口 IP 誤傷正常使用者。
- 全站每日 token 預算；匿名與已登入使用不同預算池，匿名池耗盡時登入者仍可使用；pending 共用匿名池或獨立小池。
- 超限回 429，附 `Retry-After`。
- `/api/rag/query` 與 `/api/rag/query/stream` MUST 使用同一套限制；stream 連線建立時就要預扣額度。
- 問題長度上限、回答 `max_tokens`／`num_predict` 上限、context 上限。
- Turnstile 建議列為預設防護（尤其匿名 RAG 與申請表單），不再只是可選項。
- 以 keyed HMAC（`hashed_client_ip_key()`）計數，不長期保存原始 IP；純雜湊可被 IPv4 枚舉反推，不算匿名化。

### 8.2 預算扣款與串流

- 串流開始時先依 `prompt tokens + max_output_tokens` 預扣；結束後依實際 usage 回補或補扣。
- 若 provider 沒有回傳精確 usage，保留保守估計，不可全額退還。
- 連線中斷、例外、client disconnect MUST 在 `finally` 釋放併發與未使用預留；避免提早斷線把額度鎖死。
- 扣款計數器 MUST 原子遞增、每日重置、持久化；不得只存在 process memory。

### 8.3 Kill switch

- `PUBLIC_RAG_ENABLED=false` 可立即停止匿名提問；登入使用者可另行設定。
- 每日預算到達時自動停止匿名提問，不影響 admin／User（或依設定）。
- 設定與目前用量 MUST 顯示在 admin 狀態頁，並寫 audit。
- 在 Phase 4 完成前，若 production 已公開 RAG，MUST 先以 Cloudflare rate limit 或暫時關閉匿名提問作為 interim，不得「先公開再補」。

### 8.4 儲存

- 單機部署可先用 SQLite WAL 或現有 DB 儲存 counters；若多 instance，改用共享 DB。
- 計數器需有每日重置與原子遞增，避免併發超額。

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
- Anonymous：首頁／RAG 可用；其他分頁只載入公開摘要；所有寫入按鈕 disabled，tooltip 說明需登入。
- Pending：仍可使用首頁／RAG／公開摘要，額外顯示「審核中」；詳細頁與寫入按鈕 disabled。
- User：可看詳細唯讀頁面與自己的回饋；管理／處理／匯出按鈕 disabled。
- Admin：全部按鈕可用。
- 前端 disabled 只是 UX；API MUST 再次拒絕。

### 9.3 管理員通知與核准

- 右上角頭像 badge：待審核數量。
- 帳號選單新增「使用者申請 (N)」。
- 點擊開啟待審核清單：核准、拒絕、查看申請時間／email／name；列表分頁。
- 完整管理放 `#/status` 的「使用者管理」分類。
- 通知可用現有 SSE 新增 `auth` topic；若短期不做 SSE，至少在登入後、開啟選單與每頁初次載入時取得 count。

---

## 10. 安全與邊界條件

- Session 每次請求回查 `app_users.status`；停用立即生效；可用短 TTL cache，但停用操作主動失效。
- Admin token 使用常數時間比較、只在後端、使用時寫 audit；定期更換。
- 最後一位 admin 的降級／停用必須在 transaction 內檢查，避免競態。
- 核准／拒絕／停用／啟用／角色變更全部寫 audit。
- Google email 變更不影響 `google_sub` 身分；email 只用於顯示與通知。
- Google OAuth 保留 `state` 驗證，加入 PKCE；callback 只接受 signed state cookie。
- Rejected 冷卻期、每 IP／每日申請數限制；不以全站 pending 總數作唯一上限。
- CSRF：cookie session 的寫入請求需 Origin／SameSite 檢查；敏感操作可加 CSRF token。
- 啟動安全檢查：非 loopback bind、`FORWARDED_ALLOW_IPS=*`、local bypass 與公開 bind 同時開啟時 MUST 拒絕啟動。
- 若以 direct uvicorn／容器繞過 CLI，request-time `server_bind_allowed()` MUST 對非 loopback server 回 503；`judgment-web --check-config` MUST 用 production `.env` 乾跑並在失敗時 exit 1。
- Cloudflare 若移除 visitor IP headers，遠端會變成 loopback effective IP；middleware MUST 記錄 `suspicious proxy chain` warning，限流在該情況下偏嚴但不可靜默。
- 公開 RAG 不得繞過 admission、rate limit 或 stream 限制。
- 公開摘要不得包含主機路徑、container、volume、token、內部 IP、API endpoints、日誌位置。
- 隱私：只保存必要的 Google 顯示資料；提問內容、回饋、audit、rate-limit IP hash 需有保留期限與刪除／匿名化流程；上線前提供簡短隱私說明，涉及台灣個資法部分建議找專業人士審閱。
- DB 回查可用短 TTL cache，但停用時 MUST 主動清除該使用者快取，並在文件寫明最長延遲。
- 監控：429 次數、預算消耗曲線、被擋 IP 數、SSE 訂閱數與重驗延遲 MUST 放進 admin 狀態頁。
- 測試矩陣：anonymous／pending／user／admin × GET／POST／PATCH／DELETE，任何未分類路由失敗。

---

## 11. 建議實作順序

### Phase 0.1：本機 bypass 熱修（程式已完成）

1. `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS` 預設 `0`。
2. forwarded header 存在時不使用 bypass。
3. 測試預設關閉、開發開啟、forwarded header 三種情境。
4. 下次 production 重啟後驗證真實 tunnel 的 client host 與 headers。

### Phase 0：權限骨架（1–2 個開發日）

1. 盤點 100 個 `/api/*` path 與 114 個 method route，建立分類表（已完成，含 `route_policies.json` 與產生腳本）。
2. 實作 route 層級分類與 default-deny middleware（已完成 binary 版）。
3. 啟動時檢查所有路由；未分類或 stale 即拒絕啟動（已完成）。
4. 關閉或限制 `/api/docs`、`/api/openapi.json`（目前已 admin/session 保護）。
5. 建四角色 × method 測試矩陣（policy 表已完成；runtime pending／user 待 Phase 1）。
6. 確認 tunnel／client IP 規則，定義 `client_ip()`（已完成並加 staging smoke test）。
7. SSE ticket 綁角色／topic，加入長連線定期重驗（待做）。

### Phase 1：使用者資料與 session（1.5–2 個開發日）

1. `app_users`、`app_user_audit`、migration、bootstrap admin。
2. `read_session` 改為 DB 回查 status／role。
3. Google callback 建立 pending／active／rejected／disabled 流程。
4. Pending 受限 session（權限 ⊇ Anonymous）。
5. PKCE。

### Phase 2：核准與通知（約 1 個開發日）

1. Admin 使用者管理 API：list pending／approve／reject／disable／role。
2. 最後 admin 保護與 audit。
3. `/api/auth/me` pending count。
4. 右上角 badge、帳號選單入口、`#/status` 使用者管理頁。

### Phase 3：公開唯讀與前端鎖定（1.5–2 個開發日）

1. `GET /api/public/summary` 去識別化摘要。
2. Anonymous 其他分頁只載入公開摘要。
3. User 詳細唯讀頁面與按鈕 disabled 狀態。
4. 前端 auth state／canWrite／isAdmin／isPending。
5. Pending 申請狀態頁。

### Phase 4：公開 RAG 保護（1–1.5 個開發日）

1. Per-IP rate limit（IPv6 `/64`）、per-user 限制、匿名／登入分池、每日 token 預算、kill switch。
2. `/stream` 同步限制、預扣／結算／斷線釋放。
3. 問題長度與 token 上限。
4. 429／預算用盡 UI 與 admin 監控。
5. Turnstile 建議預設啟用（至少匿名 RAG 與申請表單）。

### Phase 5：回饋與 hardening（約 1 個開發日）

1. RAG 回饋／修正意見（User 自己、request 歸屬驗證）。
2. Admin 回饋檢視與 review_status。
3. CSRF／audit／session 撤銷／最後 admin 競態測試。
4. 隱私說明、保留期限、文件與驗收。

---

## 12. 預估工作量

以目前程式與 endpoint 數量，這是 **中等偏大** 變更，主要成本在：

- 100 個 API path 的分類與測試（Phase 0）。
- 全站前端 action 盤點與 disabled 狀態（Phase 3）。
- 公開摘要與敏感資料清理（Phase 3）。
- 公開 RAG 限流、預算與串流扣款（Phase 4）。
- SSE ticket／topic／長連線重驗（Phase 0–1）。

粗估：

| 階段 | 開發日 |
| --- | --- |
| Phase 0.1 熱修 | 0.5（程式已完成） |
| Phase 0 權限骨架 | 1–2 |
| Phase 1 使用者資料與 session | 1.5–2 |
| Phase 2 核准與通知 | 1 |
| Phase 3 公開唯讀與前端鎖定 | 1.5–2 |
| Phase 4 公開 RAG 保護 | 1–1.5 |
| Phase 5 回饋與驗收 | 1 |
| **合計（不含 0.1）** | **7–10** |

不含 Google OAuth 設定、Cloudflare Turnstile 申請、隱私政策法律審閱與人工驗收。實際工時取決於 public summary 欄位範圍與前端 action 數量。

---

## 13. 已定案決策與待核定參數

### 13.1 已定案

| # | 決策 |
| --- | --- |
| 1 | 公開摘要只做首頁、法規目錄、聚合統計；各分頁不放即時數據 |
| 2 | User 不開放資料匯出；題庫唯讀保留 |
| 3 | 公開 RAG 預算以 token 為主、請求數為輔；先設保守值，依一週實際用量調整 |
| 4 | Anonymous 不可送出 RAG 回饋 |
| 5 | 通知與管理兩者都做：右上角 badge／選單入口＋`#/status` 使用者管理 |
| 6 | 使用 `GOOGLE_BOOTSTRAP_ADMIN_EMAILS`，只在 DB 沒有 admin 時生效 |
| 7 | Production 完全關閉本機 bypass |

### 13.2 待核定參數

1. 公開 RAG 每日 token 預算初始值（建議匿名池 2,000,000 tokens／日；以實際 P50 2,809、P95 4,096 估算，約 488–712 題，依一週用量調整）。
2. Per-IP 限制（建議 5 次／分、40 次／小時、**20–30 次／日**、同時 2 條串流；IPv6 以 `/64` 計）。
3. 已登入 per-user 限制（建議另訂，不與 IP 額度混用）。
4. 匿名與登入預算池比例（建議匿名池先占多數，登入池保留基本可用量；pending 不另給池）。
5. 保留期限（建議提問／效能紀錄 90 天、回饋 365 天、audit 730 天、已處理申請 180 天）。
6. Phase 4 完成前，production 公開 RAG 是否先以 Cloudflare rate limit 限制，或暫時要求登入。
7. `GET /api/public/summary` 的精確欄位清單。

---

## 14. 建議下一步

1. 先複核 [`execution-report.md`](./execution-report.md) 與本報告的 10 點回覆、工時與待核定參數。
2. Phase 0 已完成路由分類、default-deny、Principal、policy 矩陣、`client_ip()` 與 9202 staging smoke test；下一步是 `app_users`／Phase 1，讓 pending／user 真正由 DB 解析，再做 SSE ticket 綁 topic；不先做註冊 UI。重啟步驟見 [`restart-checklist.md`](./restart-checklist.md)。
3. 2026-11-19 外部驗證：公開 `/api/status`、`/api/processing`、`/api/question-bank/stats`、`/api/docs` 在無憑證下皆回 401，未觀察到 tunnel bypass；**不需要緊急重啟**。
4. Phase 0.1 程式已完成，但 **不要在 v7 索引 copy 期間重啟 production**；下次重啟後再驗證 tunnel。
5. 2026-11-19 外部驗證也顯示匿名 RAG 尚未開放（`/api/rag/query` 空 body 回 401）；在最小版限流、預算與 kill switch 完成前，不應直接開放。
6. 若決定提前開放匿名 RAG，先完成最小版 per-IP 限流＋每日預算＋kill switch；Cloudflare rate limit 只能作過渡。
