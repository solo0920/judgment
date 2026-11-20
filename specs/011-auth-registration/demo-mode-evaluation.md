# 展示模式（Demo Mode）評估報告

**Status**: Approved · Implemented（staging 驗證完成 2026-11-20；production 待 v7 完成後重啟）

**Version**: 0.3

**Last Updated**: 2026-11-20

**Applies To**: `judgment.ragdemo.win` 首頁、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、右上角帳號選單、管理設定頁、`/api/*` 訪客邊界。

**Related**:

- [`./evaluation.md`](./evaluation.md)（既有 auth、route policy 與公開存取評估）
- [`./restart-checklist.md`](./restart-checklist.md)
- [`../004-web-console/spec.md`](../004-web-console/spec.md)
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)

---

## 1. 結論

這個需求不是「多使用者權限系統」，而是 **單一管理者的全站展示開關**。方向正確，實作量比先前的逐人權限方案小很多。

建議做成：

1. **只有兩種視角**：管理者（現有 Google 登入）與匿名訪客。
2. **一個總開關**：預設關閉；關閉時首頁只顯示「展示目前未開放」，其他 API 一律拒絕，只留健康檢查與管理者登入所需的四條 auth 路徑。
3. **六個功能旗標**：總開關開啟後，各自決定訪客能否使用該功能。
4. **自動到期**：開啟時選 2 小時／24 小時／7 天，時間到視同關閉。
5. **訪客只用公開展示 API**：不直接開放管理者版 API；站上判決、法規、品質與進度資料都是司法院 opendata，可以直接呈現。訪客碰不到主機、模型、index、匯出、啟動 workflow 等操作。
6. **兩層關閉**：應用層一鍵關閉；Cloudflare tunnel 作為第二層保險。
7. **預設關閉、失敗也關閉**：DB 讀不到、設定壞掉、到期、例外，全部視同關閉。

可行性：**可以執行，粗估 3–5 個工作日**。最花時間的是訪客頁面與 RAG 限流／預算，不是開關本身。

**不要**建立 `app_users`、邀請、pending、逐人權限、使用者管理頁、SSE 逐人 topic 綁定或使用者操作稽核。這些都不符合目前需求。

---

## 2. 名詞與狀態

| 名詞 | 定義 |
| --- | --- |
| 管理者 | `solo4study@gmail.com`；現有 Google 登入；永遠可用全部功能 |
| 訪客 | 未登入使用者；只能看首頁與展示模式允許的功能 |
| 總開關 | `demo_settings.enabled`；決定訪客是否能看到展示內容 |
| 功能旗標 | 六個 boolean；總開關開啟後，各自決定該功能是否開放 |
| 到期時間 | `expires_at`；到期後視同總開關關閉 |

展示模式有三種狀態：

| 狀態 | 行為 |
| --- | --- |
| OFF | 首頁靜態「展示目前未開放」；訪客只允許 `/api/health`、`/api/demo/status`，以及 `PUBLIC_AUTH` 的 `GET /api/auth/google/start`、`GET /api/auth/google/callback`、`POST /api/auth/logout`、`GET /api/auth/me`；其他 API 401／403。管理者登入後仍可使用全部功能。 |
| ON | 首頁與已開啟功能可用；未開啟功能顯示「此功能未開放」 |
| EXPIRED | 與 OFF 相同；管理頁顯示「已到期」；下一次請求即生效 |

管理者不受總開關影響；即使展示關閉，管理者仍可登入並使用全部功能。

---

## 3. 範圍調整

### 3.1 可以砍掉

| 項目 | 原因 |
| --- | --- |
| `app_users`、邀請、pending、核准 | 沒有一般使用者帳號 |
| 逐人六項權限表 | 改成全站共用六個旗標 |
| 使用者管理頁 | 不需要 |
| SSE 逐人 topic 綁定 | 訪客展示頁改用輪詢，不訂閱 SSE |
| 使用者操作稽核 | 只需要記錄管理者何時切換展示開關 |
| 多角色 middleware | 維持 anonymous／admin／admin_token 即可 |

### 3.2 保留

| 項目 | 用途 |
| --- | --- |
| 現有 Google 管理者登入 | 管理者唯一入口 |
| `route_policies.json` default-deny | 新 API 沒分類就啟動失敗 |
| `JUDGMENT_ADMIN_TOKEN` | break-glass；不進前端 |
| `RagAdmission` | 沿用併發與佇列控制 |
| Cloudflare tunnel | 第二層關閉 |
| `restart-checklist.md` | 補上展示結束的關閉步驟 |

### 3.3 新增

| 項目 | 用途 |
| --- | --- |
| `demo_settings` 單列設定表 | 總開關、六個旗標、到期時間 |
| `demo_mode_audit` | 記錄誰在何時開關、開了哪些功能 |
| `demo_usage_daily` | 每日 token／請求用量，供預算控制 |
| `/api/demo/*` 展示 API | 訪客專用，不重用管理者版 API |
| 展示模式管理面板 | 帳號選單 →「管理設定」 |
| 訪客用簡化頁面 | 首頁、RAG、資料、品質、效能、處理、狀態 |
| per-IP 限流與每日 token 預算 | 保護 RAG 成本 |
| Cloudflare 關閉 runbook | 面試後第二層關閉 |

---

## 4. 訪客功能矩陣

| 功能 | 訪客可用 | 永遠只限管理者 | 備註 |
| --- | --- | --- | --- |
| RAG 提問 | 送出問題、看回答與引用 | 模型／主機管理、測試模式 | 判決與法規內容是公開 opendata；不顯示 host／model 等基礎設施細節 |
| 資料庫 | 瀏覽、篩選、分頁（有列數上限） | 匯出、原始查詢語句、完整 schema | 判決／法規欄位可直接呈現；不回傳檔案路徑與 SQL |
| 資料品質 | 唯讀統計與題庫摘要 | 重掃、改題庫、AI 出題、匯入、驗收 | 統計與題目來自公開資料；不提供寫入 |
| 效能報表 | 看已產生的報表 | 重新計算、匯出、完整 pipeline 明細 | 報表數據可公開；不顯示主機／模型細節 |
| 資料處理 | 看進度摘要 | 啟動／停止 workflow、檢查更新、index 切換 | 月份、JID、archive 屬公開 opendata；不顯示主機、路徑、錯誤堆疊 |
| 系統狀態 | 看服務摘要 | 主機／模型管理、index 切換、API docs | 只顯示服務 up/down 與聚合量；hostname、IP、port、DSN 不公開 |

另外，以下永遠只限管理者：

- `/api/docs`、`/api/openapi.json`、`/docs/oauth2-redirect`
- 測試模式、`#/tests`、benchmark run
- 管理設定、展示模式 API、audit
- 任何 `POST/PATCH/DELETE` 的資料寫入、workflow 啟動、index activation／rollback
- 任何匯出（CSV／JSON／題庫）

### 4.1 功能關閉時的行為

建議 **功能關閉 = 鎖定頁**，而不是半殘的唯讀資料頁：

- 訪客仍可看到頁面標題與「此功能未開放」說明。
- 不載入該功能的資料 API。
- 不顯示操作按鈕，或顯示 disabled 並說明「展示模式未開放」。
- 這比「可以讀取但按鈕 disabled」簡單，也避免半殘的頁面。

若你們堅持功能關閉時仍要看部分公開資料，才需要另外做唯讀 API；本報告先不納入 MVP。

---

## 5. 設定資料模型

### 5.1 `demo_settings`（單列）

```sql
CREATE TABLE demo_settings (
  id                 SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled            BOOLEAN NOT NULL DEFAULT FALSE,
  allow_rag          BOOLEAN NOT NULL DEFAULT FALSE,
  allow_data         BOOLEAN NOT NULL DEFAULT FALSE,
  allow_quality      BOOLEAN NOT NULL DEFAULT FALSE,
  allow_performance  BOOLEAN NOT NULL DEFAULT FALSE,
  allow_processing   BOOLEAN NOT NULL DEFAULT FALSE,
  allow_status       BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at         TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by         TEXT NOT NULL DEFAULT '',
  version            INTEGER NOT NULL DEFAULT 1
);
```

- Migration 首次建立時，插入 `enabled=false`、六個功能旗標 **全部 true**；這是「初始值」，不是「開啟展示」。
- 若這一列不存在、讀取失敗或格式錯誤，一律視同 `enabled=false` 且六個旗標 false（fail-closed），不要自動建立全開設定。
- 功能旗標持久保存：管理者個別關閉後，下次開啟展示仍沿用上次設定；關閉總開關不會重設旗標。
- 不建立 `app_users`。
- `expires_at` 為 null 時，代表沒有自動到期；但 UI 只提供 2h／24h／7d，不提供永久，避免忘記關。
- 每次讀取時檢查 `enabled AND (expires_at IS NULL OR expires_at > now())`。
- 到期不需要背景 job；下一個請求就會當成關閉。可選一個低頻 job 把 `enabled` 實際寫回 false，方便報表。

### 5.2 `demo_mode_audit`

```sql
CREATE TABLE demo_mode_audit (
  id           BIGSERIAL PRIMARY KEY,
  actor_email  TEXT NOT NULL DEFAULT '',
  action       TEXT NOT NULL,          -- enable / disable / update / expire
  before       JSONB,
  after        JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

只記錄管理者切換，不記錄訪客操作。

### 5.3 `demo_usage_daily`

```sql
CREATE TABLE demo_usage_daily (
  usage_date   DATE PRIMARY KEY,
  requests     INTEGER NOT NULL DEFAULT 0,
  tokens       BIGINT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- 每日 token 預算與請求數。
- 也可以用來顯示「今日已用 N 題／N tokens」給管理者。
- 訪客不需要看到這張表。

---

## 6. API 設計

### 6.1 公開狀態

```text
GET /api/demo/status
```

回傳最小資訊，讓前端知道要不要顯示靜態關閉頁：

```json
{
  "enabled": true,
  "expires_at": "2026-11-20T20:00:00Z",
  "server_time": "2026-11-20T18:00:00Z",
  "features": {
    "rag": true,
    "data": true,
    "quality": true,
    "performance": true,
    "processing": true,
    "status": true
  }
}
```

- 永遠公開、`Cache-Control: no-store`。
- 不包含管理者 email、主機、模型、DB 狀態。
- 關閉時也回 200，`enabled=false`，讓前端顯示靜態頁；不要用 401 讓前端只能顯示錯誤。

### 6.2 管理者 API

```text
GET  /api/admin/demo
PUT  /api/admin/demo
POST /api/admin/demo/close
GET  /api/admin/demo/audit?limit=
```

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

- `duration_hours` 只接受 `2`、`24`、`168`。
- 開啟時至少一個 feature 為 true。
- 關閉時忽略 duration，將 `enabled=false`、`expires_at=null`。
- `version` 樂觀鎖；不符回 409。
- 每次變更寫 `demo_mode_audit`。
- `POST /api/admin/demo/close` 是一鍵關閉：只設 `enabled=false`、`expires_at=null`，**保留六個 flags**；下次開啟沿用上次設定。回傳最新狀態。
- `GET /api/admin/demo` 回傳 DB 值與 `effective` 值（套用 `JUDGMENT_DEMO_HARD_DISABLE`、到期後的實際狀態）及 `reason`。
- 所有 admin demo API 都是 `ADMIN_ONLY`，列入 route policy 與 startup validation。

### 6.3 訪客展示 API

建議用獨立命名空間，避免不小心把管理者版 API 開放：

```text
GET  /api/demo/home
POST /api/demo/rag/query
POST /api/demo/rag/query/stream
POST /api/demo/data/query
GET  /api/demo/quality
GET  /api/demo/performance
GET  /api/demo/processing
GET  /api/demo/service-status
```

- 判決、法規、JID、月份、品質統計、進度與效能數據都是司法院 opendata，可直接回傳，不需要額外遮蔽。
- 仍須排除非公開的基礎設施與管理資訊：hostname、IP、port、DSN、模型路徑、admin email、token、session、原始 SQL、schema 內部細節、錯誤堆疊。
- `rag` 可直接重用 RAG orchestrator，但 response 不顯示 host／model／token 等內部細節。
- `data` 限制 DB 類型、每頁筆數（建議 50）與總筆數（建議 100），不回傳原始 SQL 或檔案路徑。
- `quality` 回傳公開統計與題庫資料，不讓訪客觸發 DuckDB 重掃。
- `performance` 只讀已產生資料，不提供重新計算。
- `processing` 回目前 workflow、百分比、ETA、月份與 JID 等公開進度；不回 host、path、error stack。
- `service-status` 只回服務 up/down、延遲、聚合筆數；不回 host／model／port／DSN。

> 不要直接把 `/api/status`、`/api/processing`、`/api/question-bank/items` 改成公開；它們包含太多管理者資訊。

### 6.4 Middleware 與 route policy

新增 route 類別：

- `DEMO_READ`：訪客可讀，但需要總開關 + 對應 feature flag。
- `DEMO_QUERY`：訪客可執行查詢，但需要總開關 + 對應 feature flag + 限流。
- `PUBLIC_ALWAYS`：只列出精確路徑：`/api/health`、`/api/demo/status`、`/api/auth/me`、`/api/auth/google/start`、`/api/auth/google/callback`、`/api/auth/logout`。這些只是讓管理者能登入／登出；訪客呼叫 `/api/auth/me` 只會得到 `authenticated=false`。**不得使用 `/api/auth/*` 前綴放行**，避免未來新增的 auth 路由自動公開；沿用既有 `PUBLIC_AUTH` 分類與 startup route validation。

Middleware 邏輯：

```text
if path in PUBLIC_ALWAYS: allow
if principal.is_admin: allow
if policy in {DEMO_READ, DEMO_QUERY}:
    state = load_demo_settings()
    if not state.active: deny 403 {code: "demo_closed"}
    feature = feature_for(route)
    if not state.features[feature]: deny 403 {code: "demo_feature_disabled", feature}
    if policy == DEMO_QUERY: check_rate_limit_and_budget()
    allow
otherwise: existing route policy
```

- `load_demo_settings()` 失敗 → 視同關閉，回 `demo_closed`；不要 fail-open。
- `expires_at <= now()` → 視同關閉。
- 快取 1–2 秒；管理者切換時主動失效，最慢 2 秒生效。
- 環境變數改為 `JUDGMENT_DEMO_HARD_DISABLE`：
  - **未設定或 `0`**：不干預，完全由 DB 的總開關與六個旗標決定。
  - **設為 `1`**：所有 `/api/demo/*` 一律拒絕，回 `403 demo_hard_disabled`，即使 DB 顯示開啟也無效；管理者版 API 不受影響。
  - 不再使用 `PUBLIC_RAG_ENABLED` 當展示模式的 hard-off；上線前從 `.env` 移除舊值，避免「管理頁顯示開啟、實際被舊環境變數擋住」。
- 管理頁與 `GET /api/admin/demo` 必須回傳 **實際生效狀態**與原因，例如：
  - `effective.enabled=true`、`effective.features.rag=true`
  - 若 hard-disable：`effective.enabled=false`、`reason="JUDGMENT_DEMO_HARD_DISABLE=1"`
  - 若某功能被管理者關閉：`effective.features.rag=false`、`reason="feature_disabled_by_admin"`
- `GET /api/demo/status` 也必須回傳套用 hard-disable 後的實際 features，不能只回 DB 值，否則前端會顯示 RAG 可用但 API 一直 403。

---

## 7. 管理設定頁

### 7.1 入口

- 右上角帳號選單，只有管理者看到「管理設定」。
- 點下後開 `#/admin`；一般訪客沒有這個選項，直接開也會被導回首頁。
- 只有一個功能區塊，不需要複雜 sidebar；若要有 sidebar，先放「展示模式」一項即可。

```text
solo4study@gmail.com
管理員
────────────
管理設定
登出
```

### 7.2 展示模式面板

```text
展示模式

目前狀態：關閉（實際生效：關閉）
原因：—
剩餘時間：—
今日用量：0 題 / 0 tokens

[ 總開關：開 / 關 ]

功能開放（旗標會保留上次設定）
[x] RAG 提問
[x] 資料庫
[x] 資料品質
[x] 效能報表
[x] 資料處理
[x] 系統狀態

開放時間
( ) 2 小時  ( ) 24 小時  ( ) 7 天

[ 套用並開啟 ]   [ 立即關閉展示 ]
```

- 總開關關閉時，六個 feature toggle 顯示 disabled，但保留目前值；下次開啟沿用，不重設。
- Migration 初始值：總開關關閉、六個旗標全開；開啟展示時直接沿用，考官可以試用全部功能。
- 開啟時至少選一個功能；若六個都 false，拒絕開啟並提示。
- 按下「套用並開啟」才生效；避免只點一個 toggle 就意外對外開放。
- 「立即關閉展示」只關總開關，**不重設六個旗標**；下次開啟仍保留上次設定。一鍵生效，不需要確認（或只做一次快速確認）。
- 顯示「實際生效狀態」與原因；若 `JUDGMENT_DEMO_HARD_DISABLE=1`，即使 DB 顯示開啟，也要顯示：
  - 「實際生效：關閉」
  - 「原因：JUDGMENT_DEMO_HARD_DISABLE=1」
  - 六個功能全部標示「環境變數強制關閉」
- 顯示到期倒數；到期後自動變回關閉。
- 下方顯示最近 10 筆 audit：時間、動作、開啟了哪些功能。
- 390px：卡片上下排列，toggle 使用完整寬度；不得水平溢出。

### 7.3 管理者仍可使用完整功能

- 展示模式關閉時，管理者登入後仍看到完整導覽與管理頁。
- 訪客看到的是靜態關閉頁；管理者看到的是正常 console。
- 不要用同一個 `enabled` 狀態把管理者也鎖住。

---

## 8. 訪客前端行為

### 8.1 啟動流程

```text
載入頁面
  -> GET /api/demo/status
     -> 失敗 / enabled=false / expired：顯示「展示目前未開放」
     -> enabled=true：顯示首頁與已開啟功能
```

- `/api/demo/status` 失敗時一律顯示關閉頁，不要顯示錯誤堆疊或重試無限迴圈。
- 關閉頁只保留：標題、簡短說明、管理者登入入口。
- 不載入 `/api/home`、SSE、processing snapshot。

### 8.2 展示中的頁面

- 導覽只顯示已開啟功能；未開啟的可隱藏或顯示鎖定。
- 訪客頁面使用 `/api/demo/*`，不呼叫管理者版 API。
- 不做 SSE；用 5–10 秒輪詢公開摘要即可。這正好避開 SSE ticket／topic 的權限工作。
- 頁面上標示「展示模式」與到期時間，讓考官知道這是臨時開放。
- 若功能在瀏覽期間被管理者關閉，下一個 API 回 403，前端顯示「展示已關閉」並回到靜態頁。
- 若之後發現多訪客輪詢造成 DuckDB／processing 負擔，再加共用快取；MVP 先不做。

### 8.3 靜態關閉頁

```text
Judgment RAG Console

展示目前未開放

此網站僅在面試展示期間暫時開放。
若你是管理者，請由右上角登入。
```

- 不顯示任何資料、統計、主機狀態或 API 錯誤。
- 可用快取的靜態 HTML；不要依賴後端才能顯示。
- 若後端 tunnel 已停止，這頁仍應能由 Cloudflare Pages 提供。

---

## 9. 限流與成本控制

### 9.1 可沿用

- `RagAdmission`：併發、佇列、ETA 控制。
- 既有 token 用量紀錄（若 RAG response 已有 usage）。
- `effective_client_ip()`：取得 Cloudflare 後的實際訪客 IP。

### 9.2 需要新增

`RagAdmission` **沒有** per-IP 限流、每日 token 預算或查詢逾時，這些要補。限流必須分 bucket，不能用同一個 RAG 額度承擔所有頁面。

| 項目 | 建議初始值 | 說明 |
| --- | --- | --- |
| 展示 RAG 併發 | 4–8 | 建議 demo 專用 gate，不影響管理者 |
| RAG 佇列上限 | 8–16 | 超過回 429／busy |
| RAG ETA 上限 | 10–15 秒 | 避免訪客等太久 |
| RAG per-IP | 10 次／分、60 次／小時、200 次／日 | 公司 NAT 可調高 |
| 全站每日 token | **1,000,000**（預設；可調 2,000,000） | 1M ≈ 244 題（P95 4,096）～356 題（P50 2,809） |
| 全站每日提問 | 400 題 | 與 token 預算取較嚴格者 |
| 資料／效能查詢 per-IP | 20 次／分、200 次／小時、500 次／日 | 防止用不同篩選重複抓資料 |
| 資料／效能查詢逾時 | **10 秒** | 逾時回 504／408，不讓查詢佔用 worker |
| 資料查詢列數 | 每頁 50、總計 100 | 單次上限，仍需搭配每日次數 |
| 頁面輪詢 per-IP | 120 次／分、3,000 次／小時、20,000 次／日 | 獨立 bucket，不與 RAG／查詢共用 |

- **1,000,000 tokens 是刻意保守的展示預設**：以實測 P50 2,809、P95 4,096 換算，約 244–356 題；面試期間少數考官使用足夠。若要用 2,000,000，約 488–712 題。
- 真正防線是 per-IP 限流、併發上限與自動到期；token 數字影響相對小。若模型是本機執行，限制的其實是 GPU 時間，併發數比 token 數更重要。
- 若考官從同一公司網路進來，per-IP 會共用；展示期間可調高 per-IP，主要靠全站預算與併發控制。
- 預算用完回 `429 demo_budget_exhausted`，前端顯示「今日展示額度已用完」。
- 預算檢查應在 RAG 開始前 reserve，結束後以實際 usage reconcile；若無法取得精確 token，使用保守估算。
- 資料／效能查詢必須有 10 秒 timeout；超時要取消後端工作，不能只讓前端放棄。
- 限流器錯誤時，RAG 與資料查詢採 fail-closed（拒絕），避免成本與資料被抓取；頁面輪詢可記錄後回 503，不影響 RAG。

---

## 10. 公開資料與基礎設施邊界

站上判決、法規、JID、法院、日期、月份、品質統計、進度與效能數據都來自司法院 opendata，**不需要額外遮蔽**，可以直接提供給訪客。

### 10.1 可直接公開

- 判決與法規內容、JID、法院、案由、日期、月份、archive 名稱。
- 由 opendata 計算的品質統計、覆蓋率、進度百分比、效能數據。
- RAG 回答與引用；不顯示 host／model／token 等執行細節。
- 題庫唯讀內容；是否公開由管理者決定，預設跟隨「資料品質」旗標。

### 10.2 仍需隔離（這是安全邊界，不是資料遮蔽）

訪客 response 不得包含：

- 主機名稱、IP、port、DSN、資料庫連線字串
- 模型路徑、llama-server host、GPU／記憶體細節
- 原始 SQL、完整 schema、內部 table 名稱
- 錯誤堆疊、module／function、request id、admin email
- 其他訪客的 IP、usage、session
- 管理 API 的 token、ticket、secret
- 任何寫入、workflow 啟動、index activation／rollback、匯出端點

### 10.3 驗證方式

- 為每個 `/api/demo/*` 寫 response schema 測試；公開 opendata 欄位可以出現，但不得出現 10.2 的基礎設施 key。
- 用 curl 直接打管理者 API，確認 401／403。
- 確認 `/api/docs`、`/api/openapi.json`、`/api/status`、`/api/processing` 在訪客模式仍是 401／403。
- 確認展示關閉時，除了 `/api/health`、`/api/demo/status` 與四條 `PUBLIC_AUTH` 精確路徑之外全部拒絕；不得用 `/api/auth/*` 前綴。

---

## 11. 兩層關閉

### 11.1 第一層：應用層

- 管理頁「立即關閉展示」→ `POST /api/admin/demo/close`。
- `enabled=false`、`expires_at=null`；六個 flags **保留**，下次開啟沿用。
- 下一個請求即生效，不需重啟。
- 寫 audit。

### 11.2 第二層：Cloudflare tunnel

目前 tunnel 由 LaunchAgent 管理：

```bash
# 關閉
launchctl bootout gui/$(id -u)/com.cloudflare.cloudflared

# 恢復
launchctl bootstrap gui/$(id -u) \
  "$HOME/Library/LaunchAgents/com.cloudflare.cloudflared.plist"
```

關閉後確認：

```bash
curl -I --max-time 5 https://api-mbp.ragdemo.win/api/health
```

應為連線失敗或非 200。前端 `judgment.ragdemo.win` 仍由 Cloudflare Pages 提供，會顯示靜態「展示目前未開放」，不會打到後端。

若要做到「連前端也完全關閉」，可再停用 Pages deployment 或加上 Cloudflare Access；這不是 MVP 必需，但可在 runbook 註明。

### 11.3 面試結束 checklist

1. 管理頁按「立即關閉展示」。
2. 確認訪客首頁顯示「展示目前未開放」。
3. 確認 `/api/demo/status` 回 `enabled=false`。
4. 停掉 `com.cloudflare.cloudflared`。
5. 確認 `api-mbp.ragdemo.win` 已無法連線。
6. 視需要移除臨時存取碼／DNS／Pages deployment。
7. 隔天檢查 audit 與 `demo_usage_daily`，確認沒有異常流量。

把以上步驟補進 [`restart-checklist.md`](./restart-checklist.md)。

---

## 12. 與現有程式和 v7 的關係

| 項目 | 現況 | 本需求 |
| --- | --- | --- |
| Google 登入 | 只有 `solo4study@gmail.com` 白名單 | 維持不變 |
| 角色 | anonymous／admin／admin_token | 不新增 user |
| Route policy | 118 條，default deny | 新增 `DEMO_READ`／`DEMO_QUERY` |
| `JUDGMENT_DEMO_HARD_DISABLE` | 新環境變數，未設定＝不干預 | `1` 時所有 `/api/demo/*` 強制關閉；管理頁顯示實際生效原因 |
| `RagAdmission` | 併發／佇列 | 沿用；另加 per-IP 與每日 token |
| v7 索引 | 仍在執行 | **不要在索引期間重啟 production** |
| Auth 熱修 | 程式完成，待重啟 | 展示模式上線前先完成重啟與 smoke test |

部署順序：

1. 在 branch 完成程式與測試。
2. 9202 staging 驗證展示關閉／開啟／到期／一鍵關閉。
3. 等 v7 索引完成。
4. 依 restart checklist 重啟 production，讓 auth 熱修生效。
5. 執行 migration，建立 `demo_settings` 預設列：`enabled=false`，六個旗標全 true（初始值；總開關關閉不會暴露）。
6. 管理者登入，確認關閉狀態與靜態首頁。
7. 需要面試時再開啟，結束後兩層關閉。

---

## 13. 工作量估算

| 工作 | 工作日 |
| --- | --- |
| `demo_settings`／audit／usage model、migration、預設列 | 0.5–1 |
| 展示模式 middleware、route policy、fail-closed、到期檢查 | 0.5–1 |
| 管理者 API（get／put／close／audit） | 0.5–1 |
| 管理面板（總開關、六 flags、到期、倒數、一鍵關閉） | 0.5–1 |
| 訪客 `/api/demo/*` endpoint | 1–1.5 |
| 訪客首頁與六頁鎖定／展示狀態 | 1–1.5 |
| per-IP 限流、每日 token 預算、429 處理 | 0.5–1 |
| 測試、staging、runbook | 0.5–1 |
| **合計** | **約 3–5 個工作日** |

若要做到很完整的訪客頁面與多輪限流測試，可能到 5–6 天；但已遠小於逐人權限方案的 14–21 天。

---

## 14. 驗收條件

### 14.1 預設與關閉

- [ ] Migration 後 `demo_settings.enabled=false`，六 flags 全 true（初始值）；若設定列缺失或讀取失敗，則視同六 flags 全 false。
- [ ] 關閉時首頁顯示「展示目前未開放」。
- [ ] 關閉時 `/api/health` 200；`/api/demo/status` 200 且 `enabled=false`。
- [ ] 關閉時除 `/api/health`、`/api/demo/status` 與 `PUBLIC_AUTH` 的登入／登出四條精確路徑外，其他 `/api/*` 回 401／403，包括 `/api/home`、`/api/status`、`/api/processing`、`/api/rag/query`。不得用 `/api/auth/*` 前綴放行。
- [ ] 關閉時管理者仍可登入並使用完整功能。
- [ ] DB 讀取失敗或設定壞掉時，訪客一律視同關閉。

### 14.2 開啟與功能旗標

- [ ] 管理者可選 2h／24h／7d 並開啟；`expires_at` 正確。
- [ ] 只開放已勾選功能；未勾選功能顯示「此功能未開放」且 API 403。
- [ ] 訪客可使用已開放的 RAG、資料、品質、效能、處理、狀態頁。
- [ ] 訪客不能匯出、重掃、改題庫、啟動 workflow、管理主機、切換 index。
- [ ] 訪客 response 不含基礎設施／管理資訊（見 10.2）；公開 opendata 欄位可完整呈現。
- [ ] 到期後下一個請求即視同關閉；管理頁顯示已到期。
- [ ] `JUDGMENT_DEMO_HARD_DISABLE=1` 時，即使 DB 總開關開啟，`/api/demo/status` 的 effective 狀態仍是關閉，管理頁顯示環境變數原因。

### 14.3 一鍵關閉與第二層

- [ ] 「立即關閉展示」下一個請求生效，不需重啟。
- [ ] 關閉後 `enabled=false`、`expires_at=null`、六 flags 保留、audit 有記錄。
- [ ] 停掉 cloudflared 後 `api-mbp.ragdemo.win` 無法連線。
- [ ] 前端仍顯示靜態關閉頁。
- [ ] runbook 的恢復步驟可正常啟動 tunnel。

### 14.4 限流與成本

- [ ] 超過 RAG per-IP 限制回 429，不進入 RAG。
- [ ] 超過每日 token 預算回 429，前端顯示額度用完；預設 1,000,000。
- [ ] 資料／效能查詢有 per-IP 每日上限，重複篩選會被擋。
- [ ] 資料／效能查詢超過 10 秒 timeout 會取消並回 504／408。
- [ ] 頁面輪詢使用獨立 bucket，不會消耗 RAG 額度。
- [ ] 併發／佇列上限生效。
- [ ] 管理頁可看今日 requests／tokens 與實際生效狀態。
- [ ] 限流器錯誤時 RAG／資料查詢 fail-closed。

### 14.5 UI 與品質

- [ ] 390px 無水平 overflow。
- [ ] 管理面板可用鍵盤操作。
- [ ] console error 0。
- [ ] 既有測試、ruff、frontend build 通過。
- [ ] 關閉／開啟不影響 v7 索引程序。

---

## 15. 已確認決策與待定參數

### 15.1 已確認

| # | 決策 |
| --- | --- |
| 1 | 功能關閉時顯示鎖定頁「此功能目前未開放展示」，不展示任何資料。 |
| 2 | 六個旗標持久保存；初始值全開，總開關預設關；關閉總開關不重設旗標。 |
| 3 | 資料查詢每頁 50、總計 100；另加 10 秒 timeout、per-IP 每分鐘／每小時／每日上限。 |
| 4 | 每日 token 預算預設 1,000,000；文件寫明 1M ≈ 244–356 題、2M ≈ 488–712 題。 |
| 5 | 管理頁用 `#/admin` 路由。 |
| 6 | 不做展示存取碼；2 小時到期已足夠。 |
| 7 | 用 `JUDGMENT_DEMO_HARD_DISABLE`（未設定＝不干預），不再用 `PUBLIC_RAG_ENABLED` 當展示 hard-off。 |
| 8 | `/api/auth` 只放行四條精確路徑，不用前綴。 |

### 15.2 待定參數

- Per-IP 的實際數字（RAG 10/分、60/時、200/日；資料／效能 20/分、200/時、500/日）是否需要因公司 NAT 調整。
- 若之後輪詢造成 DuckDB／processing 負擔，是否再加共用快取（MVP 先不做）。
- 第二層只停 cloudflared，還是同時停用 Pages deployment／加 Cloudflare Access。

---

## 16. 建議

採用這個簡化版本，不要建立多使用者權限系統。

- 單一管理者、匿名訪客、全站展示開關。
- 預設關閉、自動到期、一鍵關閉、兩層保險。
- 訪客只用公開 `/api/demo/*`，不直接開管理者 API。
- 公開 opendata 直接呈現；若後續輪詢成本過高，再加共用快取。
- RAG 加上 per-IP 限流與每日 1,000,000 tokens 預算；`RagAdmission` 沿用於併發。
- 資料／效能查詢加上 10 秒 timeout 與 per-IP 每日次數上限。
- `JUDGMENT_DEMO_HARD_DISABLE` 未設定時不干預；設為 1 時所有展示 API 強制關閉，管理頁顯示實際原因。
- 面試前完成 production 重啟與 smoke test；面試後應用層與 Cloudflare 兩層都關。

這樣的面試展示範圍足夠、風險可控，而且「預設關閉、自動到期、成本預算、兩層關閉」本身就是很好的面試設計題材。
