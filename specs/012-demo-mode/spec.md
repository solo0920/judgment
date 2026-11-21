# 展示模式（Demo Mode）規格

**Status**: Implemented and deployed 2026-11-20；runtime 開關與到期狀態存在 `demo_settings`，本文件不記錄目前是開啟或關閉。

**Version**: 1.6

**Last Updated**: 2026-11-21

**Applies To**: `judgment.ragdemo.win` 首頁、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、右上角帳號選單、`#/admin`、Google 登入、`/api/*` 訪客邊界。

**Related**:

- [`../011-auth-registration/demo-mode-evaluation.md`](../011-auth-registration/demo-mode-evaluation.md)
- [`../011-auth-registration/evaluation.md`](../011-auth-registration/evaluation.md)
- [`../011-auth-registration/restart-checklist.md`](../011-auth-registration/restart-checklist.md)
- [`../004-web-console/spec.md`](../004-web-console/spec.md)
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)

---

## 1. 目的

提供面試展示用的全站臨時開放模式：

- 管理者維持現有 Google 登入，永遠可用全部功能。
- 未登入訪客只在展示模式開啟時，使用管理者勾選的公開功能。
- 展示模式預設關閉、可自動到期、可一鍵關閉。
- 訪客只能使用公開 opendata 與唯讀功能；不能執行寫入、workflow、index 切換、主機管理或匯出。
- 不建立一般使用者帳號、邀請、pending 或逐人權限。

## 2. 名詞

| 名詞 | 定義 |
| --- | --- |
| Admin | `solo4study@gmail.com`，現有 Google 登入；全部功能 |
| Visitor | 未登入訪客 |
| Demo master | `demo_settings.enabled` |
| Feature flag | `allow_rag`、`allow_data`、`allow_quality`、`allow_performance`、`allow_processing`、`allow_status` |
| Effective state | DB 設定套用 hard-disable 與到期後，實際提供給訪客的狀態 |

## 3. 功能需求

### FR-001 預設關閉

- `demo_settings` 第一次建立時 MUST 為 `enabled=false`、六個 feature flags 全 `true`。
- 若設定列缺失、讀取失敗或格式錯誤，訪客 MUST 視同全部關閉。
- 總開關關閉時，首頁 MUST 顯示靜態「展示目前未開放」；除 `PUBLIC_ALWAYS` 外，其他 API MUST 回 401／403。

### FR-002 管理者登入

- 維持現有 `GOOGLE_ALLOWED_EMAILS`，只允許管理者 Google 帳號登入。
- 展示關閉時仍 MUST 允許以下精確路徑，讓管理者登入／登出：
  - `GET /api/auth/google/start`
  - `GET /api/auth/google/callback`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- MUST NOT 使用 `/api/auth/*` 前綴放行。
- 管理者登入後 MUST 看到完整站台，不受 demo master 限制。

### FR-003 展示狀態

- `GET /api/demo/status` MUST 公開、`Cache-Control: no-store`，回傳：
  - `enabled`（effective）
  - `expires_at`
  - `server_time`
  - `features`（effective）
  - `reason`（非啟用時的原因）
- 回傳 MUST NOT 包含 host、model、DSN、admin email、token。
- `GET /api/admin/demo` MUST 回傳 stored 與 effective 狀態、hard-disable 原因、到期時間、今日用量。
- 管理頁 MUST 顯示「DB 狀態」與「實際生效狀態」。

### FR-004 六個功能旗標

| Flag | 訪客功能 |
| --- | --- |
| `allow_rag` | RAG 提問與串流回答 |
| `allow_data` | 資料庫瀏覽、篩選、查詢（列數上限） |
| `allow_quality` | 資料品質唯讀統計與題庫唯讀 |
| `allow_performance` | 效能報表唯讀 |
| `allow_processing` | 資料處理進度唯讀 |
| `allow_status` | 系統狀態服務摘要唯讀 |

- 功能關閉時，前端 MUST 顯示鎖定頁「此功能目前未開放展示」，且該功能 API MUST 回 403 `demo_feature_disabled`。
- 功能開啟時，訪客仍 MUST NOT 使用寫入、workflow 啟動／停止、index activation／rollback、主機／模型管理、匯出、測試模式、`/api/docs`、`/api/openapi.json`。

### FR-005 自動到期

- 管理頁 MUST 提供 2 小時、24 小時、7 天三種期限。
- `PUT /api/admin/demo` 開啟時 MUST 計算 `expires_at = now + duration`。
- `expires_at <= now` 時 MUST 視同關閉；下一個請求即生效。
- 不需要背景 job 才能關閉。

### FR-006 一鍵關閉

- `POST /api/admin/demo/close` MUST 只設定 `enabled=false`、`expires_at=null`，保留六個 feature flags。
- 下一個請求即生效，不需重啟。
- MUST 寫 audit。
- 管理頁 MUST 有顯眼的「立即關閉展示」按鈕。

### FR-007 Hard-disable

- 新增 `JUDGMENT_DEMO_HARD_DISABLE`：
  - 未設定或 `0`：不干預。
  - `1`：所有 demo 訪客 API MUST 回 403 `demo_hard_disabled`，即使 DB 顯示開啟。
- 管理頁與 `GET /api/admin/demo` MUST 顯示實際生效狀態與原因。
- 不再使用 `PUBLIC_RAG_ENABLED` 作為展示 hard-off；上線前移除舊值。

### FR-008 Route policy

- 新增 route 類別：
  - `DEMO_READ`：訪客可讀，需 master + feature flag。
  - `DEMO_QUERY`：訪客可查詢，需 master + feature flag + 限流。
- 每個 `DEMO_*` route MUST 有 feature mapping；startup validation MUST 拒絕缺 mapping 或 stale mapping。
- 未分類 route MUST default deny。
- `route_policy_guard` MUST 重複檢查，不能只依賴 middleware。

### FR-009 訪客 API 邊界

MVP 直接以既有唯讀端點加上 `DEMO_*` policy，不另建重複的 `/api/demo/*` 包裝；response MUST 依 principal 套用基礎設施欄位隔離。

訪客可用端點以 `src/judgment/web/demo_policies.json` 為唯一來源，目前為：

- RAG：`POST /api/rag/query`、`POST /api/rag/query/stream`
- 資料：`GET /api/catalog`、`POST /api/query`、`GET /api/data/suggest`、`GET /api/schema/suggest`、`GET /api/law`、`GET /api/judgment`
- 品質：`GET /api/quality`（訪客使用最近一次快取掃描）、`GET /api/demo/quality`（訪客專用摘要）
- 效能：`GET /api/performance`
- 處理：`GET /api/processing`（訪客版本回傳最近一次 cached、sanitized snapshot）、`GET /api/demo/processing`（輕量摘要；MUST NOT 建置完整 snapshot）
- 狀態：`GET /api/status`
- 首頁：`GET /api/home`

永遠 admin-only：

- 所有寫入類 `POST/PATCH/DELETE`、workflow、index、host、model、benchmark、test mode；`POST /api/query`、`POST /api/rag/query`、`POST /api/rag/query/stream` 是 READ-ONLY DEMO_QUERY 例外。
- 題庫所有端點，包括 `GET /api/question-bank/stats`、`items`、`tags`、`export` 與 `POST/PATCH/DELETE`。
- `GET /api/performance/options`、`GET /api/processing/plan`、`GET /api/processing/active`、`GET /api/updates/status`、`GET /api/courts/check`、`GET /api/law-versions/check`、`GET /api/judgment-download/status`。
- `/api/docs`、`/api/openapi.json`。
- 管理 API。

### FR-010 公開資料與基礎設施邊界

- 判決、法規、JID、法院、日期、月份、archive、品質統計、進度、效能數據為司法院 opendata，可直接提供。
- 訪客 response MUST NOT 包含：
  - hostname、IP、port、DSN、資料庫連線字串
  - 模型路徑、llama-server host、GPU／記憶體細節
  - 原始 SQL、schema 內部細節、錯誤堆疊
  - admin email、token、session、ticket
  - 其他訪客的 IP／usage
- `/api/status`、`/api/processing`、`/api/catalog`、`/api/query`、`/api/performance`、`/api/rag/query`、`/api/rag/query/stream` 對訪客 MUST 套用對應 sanitizer（`sanitize_status_payload`、`sanitize_processing_payload`、`sanitize_catalog_payload`、`sanitize_query_payload`、`sanitize_performance_payload`、`sanitize_rag_result`／SSE event sanitizer）；admin 版本不變。`/api/home` 使用 `sanitize_infrastructure`。
- `/api/judgment`、`/api/law`、`/api/quality` 目前沒有經過 query sanitizer；其 payload 只包含判決／法規公開資料與品質統計（archive 名稱、計數），不得再加入 host、path、DSN、token 或內部 endpoint。若欄位變更，必須同步加 sanitizer 與測試。

### FR-010a 訪客處理頁效能

- 訪客資料處理頁 MUST 使用最近一次 background processing snapshot（訪客版 `GET /api/processing` 為 cached、sanitized payload），呈現與 admin 相同的工作流程導覽、處理總覽、月份矩陣與索引 waterfall；MUST NOT 在請求中執行完整 `build_processing_snapshot()`。
- `GET /api/demo/processing` 保留為輕量摘要端點，只回傳索引 summary／current／copy、active runs、recent runs 與 backlog 數字；MUST NOT 建置完整 snapshot。
- 訪客 SSE MUST NOT 訂閱 admin-only event stream；頁面以 30 秒輪詢 cached snapshot 更新。
- 背景 warmer 每 120 秒更新 snapshot；訪客頁面 MUST 顯示「快照時間」，不得把舊快照冒充即時狀態。
- 管理員頁面 first paint SHOULD 使用 `GET /api/processing?cached=1&slim=1` 的 cached slim snapshot；完整重建只在使用者手動重新整理或執行操作後進行。
- 前端 MAY 將最近一次 slim snapshot 與 auth/demo 狀態快取在瀏覽器，供同一分頁重開時立即顯示；仍 MUST 在背景重新驗證，且 backend policy 為最終授權來源。

### FR-010b 訪客品質頁效能

- 訪客呼叫 `GET /api/quality` MUST 只回傳最近一次快取的品質掃描；cache miss 時 MUST 回傳 `warming` 狀態，不得在請求中執行完整 DuckDB 掃描。
- `GET /api/demo/quality` MUST 只回傳 totals、checks、coverage、archive 數量與快照時間；MUST NOT 回傳 archives 明細、host、path 或大型 distributions。
- 品質掃描快取 MUST 以原子寫入更新，權限 0600；admin 請求仍可建置最新掃描並更新快取。
- 同一時間 MUST 只允許一個品質掃描；已有掃描執行時，其他請求 MUST 回傳最近快取並標記 `refreshing`，不得排隊堆疊掃描。
- `/api/demo/quality` 回應 SHOULD 小於 20 KB；完整品質頁 first paint MUST 使用 cached `GET /api/quality?cached=1`，完整 DuckDB 掃描只在使用者手動重新整理時執行。
- 頁面 MUST 顯示快照時間，不得把舊掃描冒充即時結果；前端 MAY 快取最近一次品質 snapshot 供重開頁立即顯示。

### FR-010c 展示模式的完整頁面與鎖定

- demo mode 開啟且 feature 允許時，資料品質、效能報表、資料處理、系統狀態 MUST 使用與 admin 相同的頁面結構、資料視覺化與導覽分類；不得只顯示簡化摘要。
- 訪客 MUST NOT 執行任何寫入、workflow、索引驗證／切換、模型設定、主機管理、測試、Benchmark 或題庫管理操作。
- 上述執行／管理按鈕 MUST 以停用或 LOCK 狀態呈現，點擊不得送出請求；唯讀查詢、分頁、展開階段、切換唯讀分類與重新整理 MAY 保持可用。
- admin-only 分類（系統測試、系統資料使用、Model Provider、題庫管理、RAG Benchmark）在訪客頁面 MUST 顯示鎖定說明，不得呼叫 admin-only API。
- demo mode 關閉時，訪客 MUST 看到既有「展示目前未開放」狀態，不得顯示 cached 資料頁。

### FR-011 限流與成本

- RAG per-IP：
  - 10 次／分、60 次／小時、200 次／日（可設定）。
  - 另有全站每日 request limit 預設 400；全站每日 token 預算預設 1,000,000；約 244–356 題（P95 4,096／P50 2,809）。
- 資料／效能查詢 per-IP：
  - 20 次／分、200 次／小時、500 次／日。
  - 查詢 timeout 10 秒。
  - 每頁 50、總計 100。
- 頁面輪詢 per-IP：120 次／分、3,000 次／小時、20,000 次／日；獨立 bucket，不與 RAG／查詢共用。
- 超過限制回 429，附 `Retry-After`。
- 預算用完回 429 `demo_budget_exhausted`。
- 限流器錯誤時 RAG／查詢 fail-closed。

### FR-012 管理頁

- 右上角帳號選單只有 admin 顯示「管理設定」，連到 `#/admin`。
- 管理頁 sidebar 顯示「展示模式」；右側面板包含：
  - 目前狀態、實際生效狀態、原因、剩餘時間、今日用量
  - 總開關
  - 六個 feature toggle（關閉時 disabled，但保留值）
  - 2h／24h／7d
  - 「套用並開啟」與「立即關閉展示」
  - 最近 audit
- 開啟時至少一個 feature 為 true。
- 390px 無水平溢出；toggle 可用鍵盤操作。

### FR-013 Audit

- `demo_mode_audit` MUST 記錄每次 enable／disable／update／expire。
- 欄位：actor email、action、before、after、created_at。
- 只記錄管理者操作，不記錄訪客操作。

### FR-014 首頁與前端

- 訪客載入時先呼叫 `GET /api/demo/status`。
- 失敗、`enabled=false` 或到期：顯示靜態關閉頁，不載入其他資料 API。
- 展示中：只顯示已開啟功能；功能關閉顯示鎖定頁。
- 訪客 MUST NOT 使用 SSE；以 5–10 秒輪詢公開摘要。
- 管理者不受前端 demo gating 限制。

### FR-015 兩層關閉

- 應用層：管理頁一鍵關閉。
- Cloudflare：停止 `com.cloudflare.cloudflared`。
- runbook MUST 記錄於 `restart-checklist.md`。
- 面試後 MUST 兩層都關。

## 4. 資料模型

### `demo_settings`

```sql
id                 SMALLINT PRIMARY KEY CHECK (id = 1)
enabled            BOOLEAN NOT NULL DEFAULT FALSE
allow_rag          BOOLEAN NOT NULL DEFAULT FALSE
allow_data         BOOLEAN NOT NULL DEFAULT FALSE
allow_quality      BOOLEAN NOT NULL DEFAULT FALSE
allow_performance  BOOLEAN NOT NULL DEFAULT FALSE
allow_processing   BOOLEAN NOT NULL DEFAULT FALSE
allow_status       BOOLEAN NOT NULL DEFAULT FALSE
expires_at         TIMESTAMPTZ
updated_at         TIMESTAMPTZ NOT NULL
updated_by         TEXT NOT NULL DEFAULT ''
version            INTEGER NOT NULL DEFAULT 1
```

Migration seed：`enabled=false`，六 flags `true`。

### `demo_mode_audit`

```sql
id           SERIAL PRIMARY KEY
actor_email  TEXT NOT NULL DEFAULT ''
action       TEXT NOT NULL
before       JSONB
after        JSONB
created_at   TIMESTAMPTZ NOT NULL
```

### `demo_usage_daily`

```sql
usage_date  DATE PRIMARY KEY
requests    INTEGER NOT NULL DEFAULT 0
tokens      BIGINT NOT NULL DEFAULT 0
updated_at  TIMESTAMPTZ NOT NULL
```

## 5. API

| Method | Path | Policy | 說明 |
| --- | --- | --- | --- |
| GET | `/api/demo/status` | PUBLIC_READ | 公開 effective 狀態 |
| GET | `/api/admin/demo` | ADMIN_ONLY | stored／effective／usage |
| PUT | `/api/admin/demo` | ADMIN_ONLY | 更新 master、flags、期限 |
| POST | `/api/admin/demo/close` | ADMIN_ONLY | 一鍵關閉 |
| GET | `/api/admin/demo/audit` | ADMIN_ONLY | 最近 audit |

`PUT /api/admin/demo` body：

```json
{
  "enabled": true,
  "duration_hours": 24,
  "features": {
    "rag": true,
    "data": true,
    "quality": true,
    "performance": true,
    "processing": true,
    "status": true
  },
  "version": 3
}
```

- `duration_hours` 僅允許 2、24、168。
- 開啟時至少一個 feature true。
- `version` 不符回 409。
- 關閉時忽略 duration，`expires_at=null`。

## 6. 驗收

- [ ] Migration 後 `enabled=false`，六 flags true；缺列／讀取失敗時全關。
- [ ] 關閉時首頁靜態關閉頁；`/api/health` 與四條 auth 精確路徑可用；其他 API 拒絕。
- [ ] 管理者登入後完整站台可用。
- [ ] 開啟 2h／24h／7d；到期下一個請求即關閉。
- [ ] 六 flags 分別控制；關閉顯示鎖定頁與 403。
- [ ] 「立即關閉展示」只關 master，保留 flags；下一個請求生效。
- [ ] `JUDGMENT_DEMO_HARD_DISABLE=1` 時全部 demo API 403，管理頁顯示原因。
- [ ] `/api/status`、`/api/processing` 訪客版不含 host／IP／DSN／model path／error stack。
- [ ] RAG 限流、每日 token 預算、資料／效能 timeout 與每日上限 code 已存在；端到端 429／串流併發／Cloudflare edge 規則待驗。
- [x] 390px 無水平溢出；console error 0（Playwright 已驗證）。
- [x] 全站 692 tests、ruff、frontend build 通過。
- [x] 不影響 v7 索引；v7 已完成並由 `judgments_v005` 提供，production 已重啟多次。

**Revision**: 1.6（2026-11-21）與程式碼重新對照：訪客 route 以 `demo_policies.json` 為準、移除已改為 admin-only 的題庫／performance options、文件不再記錄 demo 開關狀態；資料品質頁 first paint 使用 cached snapshot，索引 coverage 共用 120 秒快取。
