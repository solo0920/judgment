# Judgment 安全性補充評估報告

- 日期：2026-11-21
- 版本：v1.1（2026-11-21 與程式碼重新對照）
- 範圍：公開展示站 `judgment.ragdemo.win`、API `api-mbp.ragdemo.win`、本機主控台 `127.0.0.1:9200`、電源代理 `127.0.0.1:9201`、備份流程、題庫與 RAG 資料流
- 定位：補充 `specs/security/security-acceptance-matrix.md`，只列「本次新發現」與「尚未關閉的既有項目」
- 測試原則：只做唯讀驗證與程式碼追蹤；未執行破壞性測試、未取得或輸出任何真實密鑰

> **現況對照（2026-11-22 後續更新）**：本文件保留發現與修復歷程；目前控制狀態以 [`security-acceptance-matrix.md`](security-acceptance-matrix.md) 與 [`../../docs/code-alignment-2026-11-21.md`](../../docs/code-alignment-2026-11-21.md) 為準。CSP 已 enforce、admin token／session secret 已輪替、gitleaks 已做全歷史掃描、pyarrow／pytest 已升級；INFRA-09、AUDIT-01、SESSION-01 已完成，主應用已改用非 superuser 角色。仍未完成：APP-DB-01 剩餘項目、PRIV-01、完整 restore drill、HIST-01 歷史清理等。以下「當時」段落與 P1/P2 建議不應直接當成目前待辦。

## 0. 摘要

本次新增 **1 個 P0、5 個 P1、12 個 P2、5 個 P3／外部**。P0 已於 2026-11-21 修復並上線（見 0.1）。

當時最需要立即處理的五件事（多數已修復，見下方與 matrix）：

1. **P0：展示訪客可從 `/api/performance` 讀到完整的 RAG 問題與答案。** 已在正式站以匿名請求重現。
2. **P1：展示訪客可從 `/api/processing`、`/api/judgment-download/status` 讀到伺服器絕對路徑與 macOS 使用者名稱。**
3. **P1：展示 API 與 SSE 錯誤事件直接回傳 `ExceptionType: message`，可能洩漏 DSN、主機、路徑與套件細節。**
4. **P1：Google 登入 session 使用 `SameSite=None`，且 `GET /api/index-alias/reconcile?repair=true` 會改資料；Origin 檢查只涵蓋非 GET，形成 CSRF 路徑。**
5. **P1：電源代理接受 `Origin: null` 與任意 localhost 來源，只靠固定標頭 `X-Judgment-Power: 1`；沙箱 iframe 可跨站啟動／停止後端。**

當時備份腳本會把 `.env` 明文複製到 removable disk，與資料庫 dump、Qdrant snapshot 放在一起；後續已改為 age 加密 PostgreSQL dump、排除 `.env`，完整 restore drill 仍待執行。

> 展示狀態：2026-11-21T05:15Z 時，展示仍開啟，六個功能全開，到期時間為 `2026-11-21T16:55:18Z`。在 P0 修復前，最安全的作法是先關閉 `allow_performance`，或直接關閉展示；若必須保留展示，請先部署 P0 熱修復。

### 0.1 修復記錄（2026-11-21）

- **DEMO-PERF-01 已修復並上線**：
  - 新增 `sanitize_performance_payload()`（`demo_mode.py`），demo 訪客只會收到 allowlist 後的 flow metadata／segment 欄位。
  - 移除：`question`、`answer`、`citation_audit.unsupported_sentences`、`flow.params`、`flow.client`、`params_text`，以及 segment 內的 `parsed_query`／`filter`／`stat_entity`／`errors`。
  - 保留：RAG 狀態、引用數、耗時、token 數、分數、segment waterfall；管理員仍可看到完整問答。
  - 已新增單元測試與 demo/admin 整合測試，完整 pytest 與 ruff 通過。
  - 已重啟本機後端並以匿名請求複驗：已知問題／答案字串不再出現，`flow.metadata` 只剩 `rag_status`、timing、`rag_response` 統計欄位。

### 0.2 第二階段修復（2026-11-21）

已完成的展示前 hardening：

- **DEMO-PATH-01**：`/api/question-bank/*`、`/api/judgment-download/status`、`/api/processing/plan`、`/api/processing/active`、`/api/performance/options`、`/api/updates/status`、`/api/courts/check`、`/api/law-versions/check` 已從 `DEMO_READ` 移除；`/api/processing` 保留但加入絕對路徑 scrub（`manifest_path`、`download_path`、`law_list` 與 value-level `/Users/`、`/home/`、`/var/`）。
- **DEMO-ERR-01**：新增全域 `HTTPException`／未處理例外 handler；demo 5xx 只回 generic message + `request_id`；SSE error 事件同步套用。
- **CSRF-01（部分）**：`/api/index-alias/reconcile` 的 repair 改為 `POST`，GET 只讀；Google session 寫入要求 `Origin`，並拒絕 `Sec-Fetch-Site: cross-site`。`SameSite=None` 尚未改。
- **POWER-01**：power agent 拒絕 `Origin: null`、只允許 backend port 的 loopback origin、拒絕 `Sec-Fetch-Site: cross-site`。
- **BAK-01（部分）**：`backup.sh` 不再複製 `.env`；`restore.sh` 會在缺少 `.env` 時警告。備份加密與 restore drill 尚未做。
- **HDR-01（當時部分；後續已 enforce）**：API 加上 CSP Report-Only、X-Frame-Options、Referrer-Policy、Permissions-Policy；Pages `_headers` 同步加 CSP Report-Only。後續已切到 `Content-Security-Policy` enforce；`report-to` 仍待補。
- **XSS-01**：新增 `safeUrl()`，套用到判決 PDF、法規 URL、附件、首頁來源與題庫法規連結。
- **DEMO-QB-01**：題庫讀取改為 admin-only，demo 訪客不再取得內部批注／審核史。
- **RATE-01**：demo limiter 改用 `client_ip_key()`（IPv6 /64）；加 auth endpoint limiter、demo body 64 KB／admin 20 MB 上限、`filters` key/value 限制。
- **DATA-01（部分）**：前端文案改成「歷史清單只存在瀏覽器；提問會傳到伺服器產生答案，伺服器另保留效能紀錄」；retention floor 改為可設定（`.env` 仍為 90 天）。
- **INFO-01**：`/api/health` 只回 status／version／readiness；`.env` 設 `APP_ENV=production`。
- **CORS-01**：正式 CORS 移除 localhost、`127.0.0.1:9200`、已無 DNS 的 `judement.ragdemo.win`。

當時驗證：677 tests pass、ruff clean；Pages 部署 `2f8362be`；後端重啟後匿名複驗 performance 無已知問答、processing 無 `/Users/`、已移除的 demo 路由回 401、API/PAGES 均有 CSP Report-Only。目前為 697 tests pass、CSP enforce。

尚未完成：完整 restore drill、AUTH-02、PRIV-01、HIST-01 全歷史清理，以及第 8 節外部項目。TOKEN-01（admin token 與 session secret 已於 2026-11-21 輪替）、SESSION-01（12 小時 TTL、全裝置撤銷）、AUDIT-01、DB-ROLE-01、SSE-01 已完成。

### 0.3 匿名查詢邊界測試（2026-11-21）

在展示仍開啟時，以匿名請求驗證 `/api/query`：

| 測試 | 結果 |
|---|---|
| `filters.table=pg_shadow` | `400`，不支援的資料表 |
| `filters.table=information_schema.tables` | `400` |
| `table` 注入 `law_documents"; select 1 --` | `400` |
| `sort` 注入 `1; select pg_sleep(10)` | `400`，未延遲 |
| `order_by` 注入 | `200`，但 `order_by` 不是支援參數，會被忽略、不進 SQL |
| `page_size=100000` | `422`（上限 200） |
| `page=1000000000` | `200`，demo 路由截斷到最大頁，回應 < 1 秒 |
| `database=qdrant` | `200`（Qdrant 是 catalog 公開的展示資料源，非內部名稱） |
| `database=redis` | `422`（不在允許 enum） |
| 匿名 `/api/catalog` | `200`；無 `127.0.0.1`、`/Users/`、`x570`、`performance`、`question_bank`、`pg_` |
| 管理員 `/api/catalog` | `200`，仍保留完整 detail（含內部 endpoint），證明去敏只套用訪客 |

本輪另外修掉 catalog 的 `detail` 內嵌 `http://127.0.0.1:6333`：新增 `sanitize_catalog_payload()`，demo 訪客看不到內網 endpoint；管理員不受影響。`sort` 注入也改為直接 `400`。

**結論**：六項邊界測試沒有發現可直接利用的 SQL 注入或內部資料表讀取；`data` 不需要因此關閉。兩個「非失敗」的差異是：Qdrant 是刻意開放的展示資料源；`order_by` 不是支援參數，會被忽略而不是執行。若驗收要求這兩個也必須回 4xx，才需要再收斂。

### 0.4 展示關閉後（2026-11-21）

- **關閉驗證**：admin token `GET /api/admin/demo` → 200；`POST /api/admin/demo/close` 無 Origin → 200；`/api/demo/status` → `enabled:false`；外部 `/api/rag/query` → 403；`/api/status` → **403 `demo_closed`**（不是 401，因為它是 DEMO_READ）。
- **監聽位址**：llama-server 11435–11437、OrbStack 5432／6333／6334、web 9200、power agent 9201 全部只綁 `127.0.0.1`。
- **Qdrant 回應掃描**：以 admin token 查 `database=qdrant`，回應沒有 `/Users/`、`file_path`、`source_path`、`x570`、`:6333`、`:9200`；row 只含 jid／court／title／jdate／matched laws／snippet 等展示欄位。
- **PostgreSQL query 洩漏**：`law_dataset_versions` 原本會回傳 `parquet_path`、`zip_path` 絕對路徑，anon 可讀。已新增 `sanitize_query_payload()`，demo 回應會清空 `parquet_path`、`zip_path`、`error_message` 與字串中的 `/Users/`、`/home/`、`/var/`。
- **Demo 唯讀角色**：已建立 `demo_reader`（NOSUPERUSER、NOCREATEDB、NOCREATEROLE、CONNECTION LIMIT 10、statement_timeout 10s、default_transaction_read_only=on、search_path=public），只 grant 五張展示表的 **column-level SELECT**；`/api/query` 改為只 select 授權欄位。`judgment_documents.full_text`／`pdf_url`、`judgment_import_runs.data_dir` 等內部欄位 permission denied；`CREATE TABLE`、未授權表、`pg_read_file`、`COPY ... PROGRAM` 也都失敗。`pg_hba` 只允許 `samehost`／`samenet` 的 `demo_reader`，其他來源 reject。
- **Fail closed**：`DEMO_QUERY_DATABASE_URL` 已設定；未設定時 `/api/query?database=postgres` 的 demo 路徑回 403 `demo_data_unavailable`，不會 fallback 到主連線。管理員仍使用主連線，維持完整欄位。
- **Rate limit**：展示已關閉，無法再做匿名 30 次 live 測試；`DEMO_QUERY_RATE_PER_MINUTE=20` 的 429 路徑由 `DemoRateLimiter` 與既有測試覆蓋。
- **CSP 收集端點**：已實作 `POST /api/csp-report`（8 KB、per-IP/每日限流、`.run/csp-report.log` 輪替）；API 與 Pages 都已加 `report-uri`。
- **CSP 手動 console 檢查**：Playwright + Chrome／WebKit／Firefox，demo 開啟時跑 RAG 串流、Postgres／Qdrant 查詢、JSON 匯出、performance／quality／processing／status／admin；inline theme script 已移到 `assets/js/boot.js`。Cloudflare Web Analytics 已關閉並 purge，beacon 已消失。
- **CSP enforce**：2026-11-21 已從 Report-Only 切到 `Content-Security-Policy`；enforce 後同一組跨瀏覽器功能測試 0 CSP violation、0 page error、下載正常。當時 demo 已再次關閉；目前開關狀態以 `demo_settings`／`GET /api/demo/status` 為準。
- **TOKEN-01（部分）**：管理權杖改存 `sessionStorage`，舊 `localStorage` 權杖會自動遷移並刪除；Google session 驗證成功後會清掉 break-glass token。2026-11-21 已輪替 `JUDGMENT_ADMIN_TOKEN` 與 `AUTH_SESSION_SECRET`，舊 admin token 回 401、舊 session cookie 失效；但仍是靜態長效權杖，且沒有 server-side 撤銷。
- **SUP-01（CI／供應鏈）**：新增 GitHub Actions（pytest、ruff、frontend build、pip-audit、gitleaks 全歷史掃描、SBOM）、Dependabot、esbuild `0.28.2` pin、PostgreSQL／Qdrant digest pinning。依賴已升至 pyarrow 25.0.1、pytest 9.2.0；pip-audit 無已知 advisory，CI 不再使用 ignore。gitleaks 8.24.3 全歷史掃描 0 credential leaks；HIST-01 仍因歷史含主機／port 未結案。詳見 `specs/security/supply-chain.md`。
- **`SameSite=None`**：尚未改 Lax。
- **備份加密／restore drill**：PostgreSQL dump 已改為 age 加密（`postgres/judgment.dump.age`），`.env` 不進備份；`BACKUP_REQUIRE_ENCRYPTION=1` 會 fail closed。2026-11-21 完整備份已寫入 `/Volumes/T500_2TB/judgment-backup-20261121-1846`（157 GB；data 114 GB、PG 13.7 GB age、Qdrant 29.4 GB／4,714,967 points）。2026-11-22 完成完整隔離 restore drill：PostgreSQL 21m36s、Qdrant 3m51s、data 8m15s、data SHA 6m44s；核心 counts 0 差異、Qdrant 4,714,967 points、1,404 files SHA-256 相同。另完成正式 `down.sh`→`restore.sh`→`up.sh` 全流程（28m23s），修正非 public schema 與 Bash 3.2 `$VAR；` 兩個 bug；恢復後 health 200、demo disabled、RAG smoke 200。最新備份 `/Volumes/T500_2TB/judgment-backup-20261122-1500`（34 tables、5 trigram indexes、PG/Qdrant checksum OK）。詳見 `restore-drill-2026-11-22.md`。

## 1. 方法與證據

### 1.1 已實際驗證

| 檢查 | 結果 |
|---|---|
| 匿名 `GET /api/performance?process=RAG%20問答&page_size=2` | `200`，`total=2893`，回傳列含 `flow.metadata.question` 與 `flow.metadata.answer` |
| 匿名 `GET /api/processing` | `200`，回傳 20 個以上 `/Users/<user>/projects/judgment/...` 絕對路徑 |
| 匿名 `GET /api/judgment-download/status` | `200`，`manifest_path` 為 `/Users/<user>/projects/judgment/...` |
| 匿名 `GET /api/question-bank/items?limit=200` | `200`，32 筆；23 筆有 `review_comment`、1 筆有內部 `notes`、含 `reviewed_by` 與完整 `reviews` |
| 匿名 `GET /api/docs`、`/api/openapi.json` | `401`（良好） |
| `GET /api/health` | `200`；公開暴露 admission／pool／version 等運作參數 |
| API response headers | 只有 HSTS、`x-content-type-options`；無 CSP、XFO、Referrer-Policy、Permissions-Policy |
| Pages response headers | 有 XFO／Referrer-Policy／Permissions-Policy；**無 CSP**；`access-control-allow-origin: *` |
| HTTP → HTTPS | `301`（良好） |
| 本機 listener | web `127.0.0.1:9200`、power agent `127.0.0.1:9201`；PostgreSQL／Qdrant 也只綁 loopback（良好） |
| GitHub repo | `solo0920/judgment` 為 public；以已知 key 名稱與常見 token pattern 抽查 tracked files／歷史，未發現真實密鑰（仍建議用 gitleaks 做全歷史掃描） |

### 1.2 程式碼追蹤

主要檔案：

- `src/judgment/web/app.py`
- `src/judgment/web/demo_mode.py`
- `src/judgment/web/performance.py`
- `src/judgment/web/auth.py`
- `src/judgment/web/power_agent.py`
- `src/judgment/question_bank.py`
- `src/judgment/observability.py`
- `src/judgment/web/static/assets/js/*`
- `backup.sh`
- `frontend/_headers`、`scripts/build_frontend.py`

## 2. 風險總表

> 本表保留初次評估狀態；2026-11-21 第二階段已修項目見 0.2。

| ID | 等級 | 發現 | 主要影響 | 狀態 |
|---|---|---|---|---|
| DEMO-PERF-01 | **P0** | 展示可讀完整 RAG 問題／答案 | 跨訪客隱私洩漏、機密問題外流 | 已修復（2026-11-21） |
| DEMO-PATH-01 | **P1** | 展示可讀絕對路徑與使用者名稱 | 資訊洩漏、助長針對性攻擊 | 已重現 |
| DEMO-ERR-01 | **P1** | 展示錯誤／SSE 回傳例外細節 | DSN、主機、路徑、套件資訊洩漏 | 程式碼確認 |
| CSRF-01 | **P1** | `SameSite=None` + 會寫資料的 GET + Origin 檢查缺口 | 管理員被跨站誘導改索引狀態 | 程式碼確認 |
| POWER-01 | **P1** | 電源代理接受 `Origin: null`／任意 localhost | 跨站啟動／停止後端（DoS） | 程式碼＋測試確認 |
| BAK-01 | **P1** | 備份明文複製 `.env` 與 DB dump | 備份失竊即取得全部密鑰與資料 | 程式碼確認 |
| TOKEN-01 | P2 | 管理權杖存 localStorage、靜態長效 | 任一 XSS／供應鏈事件即取得完整管理權 | 程式碼確認；2026-11-21 已輪替 token／session secret |
| HDR-01 | P2 | API／Console 無 CSP 與多項 security headers | XSS 縱深不足、可被嵌入 | 已重現 |
| DEMO-QB-01 | P2 | 展示題庫露出內部批注、審核者、完整審核史 | 內部工作流程與未公開內容外流 | 已重現 |
| AUTH-02 | P2 | 題庫可直接建立／更新為 `accepted` | 繞過審核狀態機 | 程式碼確認 |
| RATE-01 | P2 | Demo limiter 用原始 IP；IPv6 /64 可輪換；無 auth 限流 | 配額繞過、成本與可用性風險 | 程式碼確認 |
| CORS-01 | P2 | 正式環境 CORS 仍含 localhost、拼錯網域、pages.dev | 攻擊面擴大、設定漂移 | 設定確認 |
| DATA-01 | P2 | RAG Q&A 保留 90 天；UI 卻說只存瀏覽器 | 隱私告知不一致、資料長期留存 | 程式碼確認 |
| XSS-01 | P2 | URL 未做 scheme allowlist；無 CSP | `javascript:` href 風險 | 程式碼確認 |
| SUP-01 | P2 | 無 CI；`npx --yes esbuild` 未鎖版；image 未鎖 digest | 供應鏈與回歸風險 | 設定確認 |
| DB-ROLE-01 | P2 | 應用程式使用 PostgreSQL superuser | SQLi／應用入侵後可執行 OS 命令 | 已驗證 `rolsuper=t` |
| SESSION-01 | P2 | 7 天 stateless session、無撤銷／輪替 | 被竊 cookie 長期有效 | 程式碼確認 |
| AUDIT-01 | P2 | 管理動作與登入事件無完整 audit／告警 | 事後追查與偵測不足 | 程式碼確認 |
| INFO-01 | P3 | `/api/health` 公開運作參數；`environment=development` | 指紋化、環境誤標 | 已重現 |
| SSE-01 | P3 | SSE ticket 120 秒可重複使用、未綁 session／IP | 短暫事件流外洩 | 程式碼確認 |
| PRIV-01 | P3 | Google Fonts 由訪客瀏覽器直連 | 訪客 IP 暴露給第三方 | 已重現 |
| HIST-01 | P3 | public repo 歷史含內部主機／port | 基礎設施情資 | 既有 matrix `partial` |
| EXT-01 | 外部 | Google OAuth 實機、第二台設備、restore drill、SSH／防火牆 | Google OAuth 已實機驗證；第二台設備、完整 restore drill、SSH／防火牆仍待驗收 | 見第 8 節 |

## 3. 詳細發現

### P0-01 `DEMO-PERF-01`：展示效能頁洩漏完整 RAG 問題與答案

**證據**

```text
GET https://api-mbp.ragdemo.win/api/performance?process=RAG%20問答&page_size=2
→ 200
total = 2893
rows[0].flow.metadata.question = "<訪客問題，已節錄>"
rows[0].flow.metadata.answer   = "<訪客答案，已節錄>"
```

同一回應也包含 `params_text`、`flow.params`、`flow.client`（瀏覽器 route、render 時間）與 `request_id`。

**根因**

- `src/judgment/web/app.py:3911-3912`（以及 `4017-4018`、`4398-4399`）把完整 `question`／`answer` 寫入 flow metadata。
- `src/judgment/web/performance.py:625,687` 將整份 `flow` 與 `params_text` 原樣回傳。
- `src/judgment/web/app.py:3881-3882` 的展示分支只呼叫 `sanitize_infrastructure`。
- `src/judgment/web/demo_mode.py:46-89` 的敏感 key 清單沒有 `metadata`、`question`、`answer`；`159-176` 只按 key 名稱空白化，不會處理 `flow.metadata` 內的值。
- `src/judgment/observability.py:684` 預設保留 90 天。

**影響**

- 任何匿名展示訪客都能列舉前一位訪客（包含面試官、記者、潛在客戶）問過的問題與完整答案。
- 問題可能包含當事人姓名、公司、訴訟策略或未公開資訊。
- 與前端文案「提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器」（`rag.js:1367`）直接矛盾。
- 只要展示再次開啟，過去 90 天的資料就會再次暴露。

**修復**

1. 新增 `sanitize_performance_payload(payload)`，採 **allowlist**，只保留：
   - 頂層：`id, started_at, process, module, status, duration_ms, method, status_code, request_id`
   - 統計：`summary, total, page, page_size, query_duration_ms, flow_stats, index_stats`
   - flow segment：`seq, parent_seq, depth, name, module, function, param_names, started_at, offset_ms, duration_ms, status`
2. 明確丟棄：`flow.metadata`、`flow.params`、`flow.client`、`flow.summary` 中的自由文字、`params_text`、`query_text` 中的篩選值。
3. 更根本的作法：RAG flow metadata 不要存完整問答，只存 `question_length`、`answer_length`、`question_hmac`（如需去重）。
4. 若管理頁真的需要看問題，另外做 admin-only 的短期除錯欄位，預設不寫入、不長期保留。
5. 新增回歸測試：以 demo principal 呼叫 `/api/performance`，斷言回應 JSON 不含 `question`、`answer`、`metadata`、`params_text`。

**立即緩解**

若無法在展示前部署：先將 `allow_performance` 設為 `false`，其餘功能可保留；或直接關閉展示。

---

### P1-01 `DEMO-PATH-01`：展示 API 洩漏絕對路徑與 macOS 使用者名稱

**證據**

```text
GET /api/processing → 200
raw_backups.latest.manifest_path = /Users/<user>/projects/judgment/data/judgments/...
workflows[0].update_status.download_path = /Users/<user>/projects/judgment/data/laws/...
archives.run.meta.law_list = /Users/<user>/projects/judgment/documents/金融法規.md

GET /api/judgment-download/status → 200
manifest_path = /Users/<user>/projects/judgment/data/judgments/raw_rar/download_manifest.json
```

**根因**

- `sanitize_processing_payload`（`demo_mode.py:253-262`）沿用 key-based `sanitize_infrastructure`；`manifest_path`、`download_path`、`law_list` 都不在 `_SENSITIVE_KEYS`。
- `/api/judgment-download/status`（`app.py:2666-2668`）直接回傳 `download_status()`，沒有經過任何展示清洗。
- `_scrub_internal_messages` 只處理訊息字串，不處理路徑值。

**影響**

- 洩漏作業系統帳號、專案目錄、資料分層、備份檔名與月份。
- 對攻擊者而言，這是後續針對備份、日誌、排程與本機權限提升的偵察素材。
- 與展示頁「唯讀」無關，因為這是後端回應本身的資料外洩。

**修復**

1. 對所有 demo 回應做 **value-level scrub**：將 `/Users/...`、`/home/...`、`C:\...`、`file://` 取代為相對名稱或 `[internal]`。
2. 更好的做法：API 根本不回傳 `manifest_path`、`download_path`、`law_list` 這類欄位；前端只需要顯示月份、狀態、檔名。
3. `judgment_download_state` 對 demo 訪客回傳專用 DTO（只保留 `month/status/latest_fileset_id/download_url` 等）。
4. 新增測試：demo 回應不得出現 `/Users/`、`/home/`、`manifest_path`、`download_path`。

---

### P1-02 `DEMO-ERR-01`：展示錯誤與 SSE 事件洩漏例外細節

**證據**

- `app.py:3944`：`detail=f"RAG 問答失敗：{exc.__class__.__name__}: {exc}"`
- `app.py:4070`、`4476`：SSE `"error"` 事件直接送出 `error_message`
- `app.py:3671,3718,3755,3793,3889`：查詢／報表錯誤也用同樣格式
- `app.py:2663,2944,2982`：更新、workflow、品質掃描錯誤同上

**影響**

- 例外訊息可能包含 PostgreSQL DSN、Qdrant URL、檔案路徑、模型名稱、套件版本、SQL 片段。
- 攻擊者可透過製造後端錯誤（服務暫時不可用、非法參數、逾時）主動取得內部資訊。
- SSE 錯誤事件會直接顯示在前端，訪客可截圖或轉存。

**修復**

1. 建立 `public_error(exc, request_id)`：回傳固定繁中訊息 + `request_id`，不包含例外類別或訊息。
2. 伺服器端以 `logger.exception` 記錄完整細節，並關聯 `X-Judgment-Request-Id`。
3. 所有 demo 可見的 500／502／504 與 SSE error 事件都改用此 helper。
4. 前端只顯示「請稍後再試，代碼：<request_id>」，並提供回報入口。
5. 測試：對 demo 觸發錯誤，斷言回應不含 `Error`、`Exception`、`Traceback`、`psycopg`、`qdrant`、`/Users`。

---

### P1-03 `CSRF-01`：SameSite=None 加上會寫資料的 GET

**證據**

- `.env`：`AUTH_COOKIE_SAMESITE=none`
- `auth.py:191-202`：session cookie 使用 `httponly=True`、`secure=True`、`samesite=none`
- `app.py:1831-1868`：只有 `request.method not in {"GET","HEAD","OPTIONS"}` 才檢查 Origin／Sec-Fetch-Site
- `route_policies.json:32`：`GET /api/index-alias/reconcile` 是 `ADMIN_ONLY`
- `index_versions.py:597-637`：`repair=true` 會 retire 舊版本、把 Qdrant alias 目標設為 active，並 commit
- `auth.py:336-352`：`origin_allowed` 在沒有 `Origin` header 時回傳 `True`

**影響**

- Google 登入後，session cookie 是 host-only + `SameSite=None`，跨站請求會帶上；實際是否送出仍受瀏覽器 third-party cookie 政策影響（Safari／Chrome 可能封鎖或部分封鎖），但不可依賴瀏覽器預設值當作防護。
- 攻擊網頁可用 `<img src="https://api-mbp.ragdemo.win/api/index-alias/reconcile?repair=true">` 觸發狀態變更；CORS 只阻擋讀取回應，不阻止副作用。
- 目前只有一個管理員，但這正是 CSRF 最有效的目標（管理員瀏覽任何網站時都可能觸發）。
- 未來若新增其他 GET 寫入端點，問題會擴大。

**修復**

1. 將 `/api/index-alias/reconcile` 改為 `POST`，前端同步修改；GET 只保留唯讀查詢。
2. 對所有管理寫入加 CSRF 防護：
   - double-submit token：`judgment_csrf` cookie（非 HttpOnly）＋ `X-Judgment-CSRF` header；或
   - 伺服器端 session 綁定 CSRF token。
3. 對 cookie-auth 的所有請求（含 GET）要求 `Sec-Fetch-Site` 為 `same-origin` 或 `none`，並比對精確 Origin；不要只在非 GET 檢查。
4. 若前端與 API 同屬 `ragdemo.win`（`judgment.ragdemo.win` → `api-mbp.ragdemo.win`），把 `AUTH_COOKIE_SAMESITE` 改為 `lax`，可消除大部分跨站攜帶 cookie 的情境；`pages.dev` 預覽另用開發設定或 CSRF token。
5. 不要依賴 CORS 當作 CSRF 防護。

---

### P1-04 `POWER-01`：電源代理接受 `Origin: null` 與任意 localhost

**證據**

- `power_agent.py:310-318`：`if not origin: return True`、`if origin == "null": return True`，且任何 `localhost`／`127.0.0.1`／`::1` 都允許。
- `power_agent.py:321-331`：反射 `Access-Control-Allow-Origin`，允許 `X-Judgment-Power` 標頭。
- `power_agent.py:373-380`：只檢查 `X-Judgment-Power == "1"`。
- `tests/test_power_agent.py` 也明確測 `Origin: null` 回 200。

**影響**

- 攻擊網頁可嵌入 sandboxed iframe（Origin 為 `null`），對 `http://127.0.0.1:9201` 發送 preflight；代理會允許，接著可 `POST /api/power/stop` 或 `/start`。
- 任何本機開發伺服器（任意 port 的 localhost）也能控制。
- 展示期間停止後端會直接中斷面試或展示。

**修復**

1. 拒絕 `Origin: null`。
2. 只允許精確的 console 來源（例如 `http://127.0.0.1:9200`、`http://localhost:9200`），不要用 hostname 判斷。
3. 要求 `Sec-Fetch-Site: same-origin`，並拒絕 `cross-site`。
4. 每次啟動產生隨機 token，寫入 `0600` 檔案或由桌面殼層注入；靜態 `X-Judgment-Power: 1` 不足以當認證。
5. 生產環境預設關閉 power agent，或改用 Unix domain socket + peer credential。
6. 對 start/stop 加 audit log 與速率限制。

---

### P1-05 `BAK-01`：備份明文包含 `.env`、DB dump 與 Qdrant snapshot

**證據**

- `backup.sh:377-379`：`cp "$PROJECT_ROOT/.env" "$TARGET_DIR/config/.env"`，並在線 539 自述「可能含資料庫密碼，請加密保存」。
- 備份同時包含 PostgreSQL dump、Qdrant snapshot、`data/`。
- manifest 內含 `QDRANT_URL`、DB service/user/database 等資訊。

**影響**

- 備份磁碟失竊或遺失，等於同時取得：
  - PostgreSQL 全量資料
  - `JUDGMENT_ADMIN_TOKEN`
  - `AUTH_SESSION_SECRET`
  - `GOOGLE_CLIENT_SECRET`
  - `QDRANT_API_KEY`
  - 可能還有 `OPENDATA_JUDICIAL_GOV_TW_PASSWORD`
- 這是本次評估中「單一事件影響最大」的路徑之一。

**修復**

1. `.env` 不進備份；由 1Password／Keychain／secret manager 還原。
2. 備份整體用 `age`（公開金鑰）或加密 APFS volume；金鑰離線保存。
3. manifest 只留必要欄位，移除含帳密的 URL。
4. 備份完成後驗證 checksum，並在另一台機器做 restore drill。
5. 文件化「備份失竊」的密鑰輪替程序（admin token、session secret、Google client secret、DB password、Qdrant key）。

---

### P2-01 `TOKEN-01`：管理權杖存 localStorage 且為靜態長效

**證據**

- `api.js:5`：`judgment.admin_token`
- `api.js:137-149`：`localStorage.getItem/setItem`
- `api.js:183`：每個請求帶 `X-Judgment-Admin-Token`
- `.env` 的 token 為 43 字元隨機值，但沒有到期、版本或撤銷機制

**影響**

- 任何 XSS、惡意瀏覽器擴充、供應鏈入侵或共用電腦，都能直接讀取完整管理權杖。
- 權杖長期有效；換 token 需要改 `.env` 並重啟。
- 與 `HDR-01`（無 CSP）疊加時，風險更高。

**修復**

1. 遠端管理優先使用 Google session；靜態 token 只保留為本機 break-glass。
2. 若必須在前端保存，改用 `sessionStorage`，或設計一次性交換：token → HttpOnly session cookie。
3. 加 `token_version`／輪替與撤銷；支援「登出所有裝置」。
4. 加 CSP、移除 inline script、縮小 XSS 面。
5. 管理頁顯示「目前登入方式」與「撤銷」按鈕。

---

### P2-02 `HDR-01`：API 與 Console 缺少 CSP 及多項 security headers

**證據**

```text
API /api/status:
  strict-transport-security: max-age=2592000
  x-content-type-options: nosniff
  （無 CSP、X-Frame-Options、Referrer-Policy、Permissions-Policy）

Pages /:
  x-frame-options: DENY
  referrer-policy: strict-origin-when-cross-origin
  permissions-policy: geolocation=(), microphone=(), camera=()
  （無 CSP；access-control-allow-origin: *）
```

**補充**

- `index.html` 有一個 inline theme script（第 21 行），CSP 需要 hash／nonce，或把它移到 `boot.js`。
- 前端使用 Google Fonts（`fonts.googleapis.com`、`fonts.gstatic.com`），CSP 需允許，或自架字型。
- 動態 HTML 有 `style="..."`，初期 `style-src` 可能需要 `'unsafe-inline'`。

**修復**

1. CSP 已 enforce；後續只需補 `report-to`／Reporting-Endpoints 與 header 全面抽查。
2. 建議政策：
   ```text
   default-src 'self';
   script-src 'self' 'sha256-<inline-boot-hash>';
   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
   font-src 'self' https://fonts.gstatic.com;
   img-src 'self' data:;
   connect-src 'self' https://api-mbp.ragdemo.win;
   frame-ancestors 'none';
   base-uri 'none';
   form-action 'self';
   object-src 'none'
   ```
3. 加 `X-Frame-Options: DENY`、`Referrer-Policy`、`Permissions-Policy`、`Cross-Origin-Opener-Policy: same-origin`、`Cross-Origin-Resource-Policy: same-origin`。
4. HSTS 由 30 天提高到 1 年（確認所有子網域 HTTPS 後再考虑 preload）。
5. 收斂後再切換為 enforce。

---

### P2-03 `DEMO-QB-01`：展示題庫露出內部批注、審核者與完整審核史

**證據**

```text
GET /api/question-bank/items?limit=200 → 200
32 筆；23 筆有 review_comment；1 筆有 notes
items[].created_by / reviewed_by / review_comment / reviews
```

`serialize_item`（`question_bank.py:448-489`）會回傳 `notes`、`created_by`、`reviewed_by`、`review_comment`、`latest_review`、`reviews`。`list_items` 預設不限制 status（`question_bank.py:663-705`），所以 draft／rejected／changes_requested 等非 accepted 狀態會被列出；retired 若未 soft-delete 也可能出現（目前資料剛好沒有 draft／rejected）。

**影響**

- 內部編輯註記、AI 產生標記、審核者身分、退件原因外流。
- 未公開題目與參考答案可能提前曝光。
- 若批注含人名、客戶或訴訟策略，風險更高。

**修復**

1. 為 demo 建立專用 DTO，只保留：`id, question, question_type, difficulty, status, tags, expected_laws, expected_articles, updated_at`。
2. 移除 `notes`、`created_by`、`reviewed_by`、`review_comment`、`reviews`、`latest_review`。
3. demo 只列 `accepted`（或明確允許的 status），不列 draft／rejected／retired。
4. 若面試需要展示審核流程，改用去識別化的假資料。

---

### P2-04 `AUTH-02`：題庫狀態機可被繞過

**證據**

- `question_bank.py:502-506`：`_initial_status` 接受任何 `QUESTION_STATUSES`，包含 `accepted`。
- `question_bank.py:609-616`：`update_item` 直接採用 payload 的 `status`，也包含 `accepted`。
- `question_bank.py:842-890`：`review_item` 不要求 item 目前是 `pending_review`；retired 也能被核准。
- 建立與更新 API 都是 `ADMIN_WRITE`，目前只有管理員能用，但狀態機沒有伺服器端保證。

**影響**

- 「先審核才能 accepted」的治理規則只存在 UI，不在 API。
- 若未來開放協作者、AI 自動產生或半自動流程，可能直接汙染 accepted 題庫。
- 稽核上難以區分「真的審核通過」與「直接寫入 accepted」。

**修復**

1. 建立明確 transition table：
   - `draft → pending_review`
   - `pending_review → accepted/rejected/changes_requested`
   - `changes_requested → pending_review`
   - `accepted → retired`（或 `pending_review` 需重新送審）
   - 其他一律 422
2. 只有 `review_item(decision=approved)` 能設 `accepted`。
3. create/update 不接受 `status=accepted`；必要時忽略或拒絕。
4. 每次 transition 寫 audit（actor、from、to、reason、review_id）。

---

### P2-05 `RATE-01`：Demo 限流可用 IPv6 /64 輪換繞過；缺少 auth 與 body 限制

**證據**

- `demo_mode.py:637-660`：limiter key 直接用 `client_ip` 字串。
- `client_ip.py:30-47` 已有 `client_ip_key()`（IPv6 收斂到 /64），但 demo limiter 沒使用。
- limiter 是 in-process `defaultdict(deque)`；多 worker 會各自計數。
- `POST /api/auth/google/callback`、`/api/auth/google/start` 沒有應用層 rate limit。
- `QueryRequest.filters: Dict[str, Any]`（`app.py:261-266`）沒有 key 數量或 value 長度限制；Cloudflare 免費方案 body 上限約 100 MB。

**影響**

- 單一 IPv6 用戶可在 /64 內輪換地址，繞過 per-IP 限流；全域每日預算仍有上限，但公平性與成本控制失效。
- 攻擊者可送大 body 讓 JSON 解析與後續 LIKE 查詢耗資源。
- OAuth callback 可被大量無效 code 觸發，造成對外請求與日誌噪音。

**修復**

1. Demo limiter 改用 `client_ip_key(client_ip)`。
2. 若要部署多 worker，limiter 改 Redis／Postgres 共享。
3. 對 auth 端點加 per-IP 限流（例如 10/min、100/hour）。
4. 加 request body 上限（例如一般 API 64 KB、import 1 MB）與 `filters` 的 key/value 限制。
5. 對 `keyword`、`filters` 等欄位限制長度與 wildcard 數量。

---

### P2-06 `CORS-01`：正式環境 CORS 仍含開發／死網域

**證據**

`.env`：

```text
CORS_ALLOW_ORIGINS=http://127.0.0.1:9200,http://localhost:9200,https://judgment.ragdemo.win,https://judement.ragdemo.win,https://judgment-61m.pages.dev
```

其中 `judement.ragdemo.win` 已無 DNS（matrix CF 證據也記載），`localhost` 與 `127.0.0.1:9200` 是開發用。

**影響**

- 設定漂移：未來若有人註冊 `judement.ragdemo.win`，會自動落入白名單。
- 正式站不需要 localhost 來源；保留只增加攻擊面。
- 目前 session cookie 是 host-only，影響有限，但仍是錯誤的信任邊界。

**修復**

1. 依環境分開 allowlist：production 只留 `https://judgment.ragdemo.win`（必要時加 Pages 預覽）。
2. 移除 `judement`、localhost、127.0.0.1（除非 dev 設定）。
3. 啟動時若 production 偵測到 localhost／`*`／死網域，fail fast 或 warning。
4. 定期以 `curl -H 'Origin: ...'` 驗證 ACAO。

---

### P2-07 `DATA-01`：RAG 問答保留 90 天，與前端告知不一致

**證據**

- `observability.py:684`：`PERFORMANCE_RETENTION_DAYS` 預設 90，最低 90。
- `.env` 也設 90。
- `rag.js:1367`、`1967`：前端寫「提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器。」

**影響**

- 訪客可能以為問題只留在本機，實際上完整問答存在伺服器 DB 90 天。
- 若展示重新開啟，舊問題會再次被其他訪客看到（P0）。
- 若問題含個資或機密，形成長期留存風險。

**修復**

1. 修改文案：明確說明「問題會傳送到伺服器以產生答案，並保留 N 天用於效能與品質分析」。
2. 將 RAG flow 的完整問答改為長度／hash，或將 retention 降到 7 天。
3. 提供「清除我的提問」或至少文件化刪除流程。
4. 在隱私說明揭露 IP 偽名化（`hashed_client_ip_key`）與日誌範圍。
5. 若無法律或維運必要，預設不保存完整答案。

---

### P2-08 `XSS-01`：URL 未做 scheme allowlist

**證據**

- `utils.js:128-131` 只有 `escapeHtml`，沒有 `safeUrl`。
- 直接將伺服器資料放入 `href`：
  - `rag.js:488` `judgment.pdf_url`
  - `rag.js:575` `citation.law_url`
  - `rag.js:659` `source.law_url`
  - `data.js:1042` `item.url`
  - `utils.js:284` cell URL
- 沒有 CSP 作為第二層。

**影響**

- 若任何匯入資料、題庫或 LLM 產生的 URL 是 `javascript:`，點擊即可執行腳本。
- 目前資料來源是官方資料，實際可利用性低；但 XSS-01 的驗收條件就是「URL 只允許 http(s)」，尚未達成。
- 若成功 XSS，localStorage 的管理權杖可直接被竊取（TOKEN-01）。

**修復**

1. 新增 `safeUrl(value)`：只允許 `http:`、`https:`、相對路徑 `#/`、`/`；其他回傳 `#`。
2. 所有 `href`、`src`、`window.open` 都經過 `safeUrl`。
3. 加單元測試：`javascript:`、`data:text/html`、`vbscript:`、`file:`、大小寫混合、前後空白。
4. 加 CSP（HDR-01）。
5. 用無頭瀏覽器跑一次注入測試（XSS-01 驗收）。

---

### P2-09 `SUP-01`：無 CI、build 工具未鎖版、image 未鎖 digest

**證據**

- 沒有 `.github/` 或 `.github/workflows`；push 不會自動跑 pytest／ruff／security scan。
- `scripts/build_frontend.py:33-43`：`npx --yes esbuild` 會下載最新版，版本不受控。
- `docker-compose.yml:3`：`postgres:16-alpine`（mutable tag）。
- `docker-compose.yml:21`：`qdrant/qdrant:v1.19.1`（tag，未鎖 digest）。
- 沒有 pip-audit、gitleaks、SBOM、Dependabot／Renovate。

**影響**

- 建置結果不可重現；供應鏈攻擊或新版 esbuild 破壞輸出無法及時發現。
- 依賴 CVE 只能靠人工發現。
- 沒有 CI 把關，P0 這類回歸容易再次發生。

**修復**

1. 固定 esbuild 版本（`npx esbuild@0.25.x` 或 devDependency + lockfile）。
2. Docker image 改用 digest（`postgres:16-alpine@sha256:...`）。
3. 加 GitHub Actions：
   - `pytest`
   - `ruff check`
   - `pip-audit`
   - `gitleaks`
   - frontend build + bundle size check
4. 加 Dependabot／Renovate。
5. 產生 SBOM（CycloneDX）。

---

### P2-10 `DB-ROLE-01`：應用程式使用 PostgreSQL superuser

**證據**

```text
docker exec judgment-postgres psql -U judgment -d judgment -tAc \
  "select current_user, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname=current_user;"
→ judgment|t|t|t
```

`docker-compose.yml` 的 `POSTGRES_USER=judgment` 由官方 image 建立為 superuser；應用程式使用同一帳號。

**影響**

- 若任何 SQL injection、ORM 誤用或應用入侵，攻擊者可建立／刪除任意資料庫、讀取其他 schema，甚至用 `COPY ... PROGRAM` 執行 OS 命令。
- 目前查詢路徑多用 SQLAlchemy 綁定參數，但這個權限讓「單一漏洞」變成「整台機器」。
- 不符合最小權限。

**修復**

1. 分離角色：
   - `judgment_owner`：migration／DDL
   - `judgment_app`：只具備必要 table 的 `SELECT/INSERT/UPDATE/DELETE`、sequence 使用權
   - `judgment_readonly`：僅供分析
2. 應用程式改用 `judgment_app`。
3. 撤銷 `PUBLIC` schema 的預設建立權限。
4. 驗證：`rolsuper=f`、`rolcreatedb=f`、`rolcreaterole=f`，且無法 `COPY ... PROGRAM`。

---

### P2-11 `SESSION-01`：7 天 stateless session，無撤銷與輪替

> **2026-11-22 更新（已修復）**：session 已加入 `jti`／`sv`、TTL 縮短為 12 小時、支援 `POST /api/auth/logout-all`，登入／登出與 admin 操作已寫入 `security_audit_events`；production `AUTH_SESSION_SECRET` 已 fail-fast。僅剩異常頻率告警。以下為當時發現。

**證據**

- `.env`：`AUTH_SESSION_TTL_SECONDS=604800`（7 天）
- `auth.py:39-40`：session secret 若空，fallback 到 `admin_token`
- `auth.py` 使用 HMAC 簽章 token，沒有伺服器端 session 表
- 沒有登入／登出／失敗的 audit 或告警

**影響**

- 被竊 cookie 最長可用 7 天；無法從伺服器端撤銷單一裝置。
- 權杖內容（email、exp）可被讀取（簽章不等于加密）。
- 若 `AUTH_SESSION_SECRET` 未設，session 與 admin token 共用密鑰，增加關聯風險。
- 管理員無法看到「目前有哪些 session」。

**修復**

1. 建 `admin_sessions` 表（id、email、created_at、last_seen、ip_hash、revoked_at、user_agent_hash），或至少加 `jti` + 撤銷清單。
2. TTL 縮短到 12–24 小時，滑動續期；支援「登出所有裝置」。
3. 啟動時強制 `AUTH_SESSION_SECRET` 非空且不同於 `admin_token`（production fail fast）。
4. 登入／登出／失敗／權限變更寫 audit，並對異常頻率告警。

---

### P2-12 `AUDIT-01`：管理動作與安全事件缺少完整 audit／告警

**現況**

- 已有 `demo_mode_audit`（demo 開關）。
- 題庫有 `QuestionBankItemVersion` 與 `QuestionBankReview`，可追溯部分變更。
- 但 index reconcile、版本啟用／退役、電源 start/stop、admin token 使用、Google 登入失敗、401/403 爆量、5xx 都沒有集中 audit／告警。

**影響**

- 事件發生後難以回答「誰在什麼時候改了什麼」。
- 無法即時發現暴力嘗試、CSRF、資料外洩或異常展示用量。
- 與 AUTH-01「actor 由驗證層產生」的驗收相關。

**修復**

1. 建 `security_audit` 表：`occurred_at, actor, actor_type, source_ip_hash, action, target, result, request_id, detail`。
2. 覆蓋：登入、登出、失敗、token 使用、demo 開關、index reconcile／activate、題庫狀態變更、電源控制、備份。
3. 加告警：
   - 401/403 每分鐘超過門檻
   - 5xx 比例
   - demo 預算耗盡
   - 同一 IP 多次 OAuth 失敗
   - power agent start/stop
4. 保留至少 180 天，備份加密。

---

### P3-01 `INFO-01`：公開健康檢查與環境標示

**證據**

- `app.py:2200-2213`：`/api/health` 公開回傳 `admission`、`llm_admission`、`database_pool`、`llm_circuit`、`version`。
- `status.py:1242`：`environment = APP_ENV or "development"`；正式站目前顯示 `development`。

**影響**

- 攻擊者可推算併發上限、佇列長度、pool 大小與版本。
- `environment=development` 會誤導維運與安全判斷。

**修復**

1. 公開 health 只回 `status`、`ready`、`version`（必要時）。
2. 詳細 metrics 移到 admin-only 或本機。
3. 正式環境設 `APP_ENV=production`。
4. 確認錯誤頁不顯示版本。

---

### P3-02 `SSE-01`：SSE ticket 可重複使用且出現在 query string

**證據**

- `app.py:713-739`：ticket 有效期 120 秒，HMAC 簽章，但沒有 nonce 儲存、沒有一次性、沒有綁 session／IP。
- `app.py:1869-1871`：`/api/events/stream?ticket=...` 可繞過一般 auth policy。
- ticket 由 `POST /api/auth/sse-ticket` 產生，該端點是 `AUTH_READ`（良好，匿名不能 mint）。

**影響**

- ticket 若出現在 access log、Referer、截圖或瀏覽器歷史，120 秒內任何人都能訂閱事件流。
- 事件流可能含處理狀態、檔名、錯誤訊息。

**修復**

1. ticket 一次性使用（伺服器端記錄 jti，使用後失效）。
2. 綁定 session id 或 client IP hash。
3. 縮短到 30–60 秒。
4. 避免放在 query string；改用 `Sec-WebSocket-Protocol` 或短效 cookie。

---

### P3-03 `PRIV-01`：Google Fonts 直連

**證據**

- `index.html` 載入 `fonts.googleapis.com` 與 `fonts.gstatic.com`。
- 訪客瀏覽器會直接連線 Google，暴露 IP、User-Agent、Referer。

**影響**

- 對隱私敏感的訪客，這是未揭露的第三方請求。
- 與 CSP 的 `font-src`／`style-src` 設定相關。

**修復**

1. 自架字型（下載 woff2，放在 `assets/fonts`）。
2. 或至少在主機端 proxy／cache，不讓訪客直連 Google。
3. 在隱私說明揭露第三方字型（若保留）。

---

### P3-04 `HIST-01`：public repo 歷史含內部主機與 port

**現況**

- `solo0920/judgment` 是 public。
- `.env.example` 與歷史含 `x570`、`11436`、`11437`、`9200`、`9201` 等內部資訊。
- 本次以已知 key 名稱與常見 token pattern 抽查 tracked files 與 git 歷史，**未發現真實密鑰**（都是 `change-me` 或空值）；仍建議用 gitleaks 做一次全歷史掃描。

**影響**

- 攻擊者可從原始碼直接得知端點、路由政策、Demo 清洗邏輯與潛在缺口（包含本報告的 CSRF 路徑）。
- 內部主機名稱／port 有助於網路偵察。

**修復**

1. 決定是否要維持 public；若要保持，接受「原始碼公開」並以縱深防禦為前提。
2. 若要移除歷史資訊，使用 `git filter-repo` 重寫並通知協作者；否則在 matrix 標記 accepted。
3. 加 gitleaks 防止未來誤 commit。
4. 不要把「原始碼不公開」當成安全控制。

## 4. 與既有 security-acceptance-matrix 的對應

| Matrix ID | 本次結論 |
|---|---|
| XSS-01 | `implemented`：`safeUrl()` 與 CSP enforce 已完成；Safari／完整瀏覽器注入測試待補 |
| HDR-01 | `implemented`：CSP enforce、XFO／Referrer／Permissions 已加；`report-to` 待補 |
| BAK-01 | `implemented`：PG dump age 加密、`.env` 排除；`data/` 與 Qdrant snapshot 仍明文 |
| BAK-02 | `partial`：subset restore 已通過；完整 157 GB＋Qdrant drill 尚未執行 |
| ABUSE-01 | `partial`：demo RAG／query／poll 限流與每日預算已實作；端到端 429／串流併發／Cloudflare edge 規則待驗 |
| AUTH-01 | `partial`：Google session actor email 已實機驗證；admin token actor 與 audit 待補 |
| AUTH-02 | `not_started`：狀態機仍可直接寫 accepted |
| DATA-01 | `partial`：90 天 prune 存在，但每 200 次寫入才觸發；備份保留政策待定 |
| SUP-01 | `implemented`：CI／Dependabot／SBOM／pip-audit／gitleaks 全歷史、esbuild 與 Docker digest pinning；pyarrow 25.0.1、pytest 9.2.0；Actions SHA pin／frozen lock／branch protection 待補 |
| HIST-01 | `partial`：gitleaks 全歷史 0 credential leaks，但 public repo 歷史仍含主機／port |
| CF-01/02 | `verified`；demo 關閉時受保護 API 401，demo 開啟時依 `demo_policies.json` |
| WEB-01/02/03 | `verified`；CSRF-01 仍待 SameSite 評估 |
| TOKEN-01 | `partial`：sessionStorage、token／session secret 已輪替；無 server-side 撤銷 |
| DB-ROLE-01 | `partial`：`demo_reader` 受限；主應用 `judgment` 仍 superuser／createdb |

建議在 matrix 新增：

- `DEMO-PERF-01`（P0）
- `DEMO-PATH-01`（P1）
- `DEMO-ERR-01`（P1）
- `CSRF-01`（P1）
- `POWER-01`（P1）
- `DB-ROLE-01`（P2）
- `AUDIT-01`（P2）

## 5. 已確認的良好控制

這些不是本次要修的地方，列出是為了避免「全部重做」：

- Web、PostgreSQL、Qdrant 都只綁 loopback；`runtime_security` 會拒絕非 loopback bind。
- 公開 `/api/docs`、`/api/openapi.json`、敏感 API 無憑證回 401。
- Route policy 採 default-deny，且有第二層 `route_policy_guard`。
- TrustedHost、CORS 不接受 `*`、`Origin: null` 的寫入被拒、local bypass 有 Origin／Sec-Fetch-Site 檢查。
- Admin token 用 `hmac.compare_digest`；local admin bypass 關閉。
- Google OAuth 有 state cookie、email_verified、allowlist、HttpOnly session。
- Demo 有每日 token／request 預算、per-IP 限流、demo audit。
- 多數 demo payload 已做 key-based 清洗（status／quality／部分 processing）。
- HTTP → HTTPS 301；HSTS、nosniff 已存在。
- `.env` 權限 600；cloudflared credentials 400。
- 以已知 key 名稱與常見 token pattern 抽查 tracked files 與 git 歷史，未發現真實密鑰；後續已完成 gitleaks 8.24.3 全歷史掃描，0 credential leaks。
- 前端未發現 `eval`、`new Function`、`document.write`；多數輸出有 `escapeHtml`。
- 備份有 checksum、manifest、restore script（但需加密）。

## 6. 建議修復順序

### 6.1 今日（展示期間，P0）— 已完成

1. ~~部署 `sanitize_performance_payload`（allowlist），或先關閉 `allow_performance`。~~ 已部署。
2. ~~用匿名 curl 驗證 `/api/performance` 不再含 `question`／`answer`／`metadata`／`params_text`。~~ 已驗證：已知問題／答案字串不再出現；`flow.metadata` 只剩狀態、timing 與統計欄位。
3. ~~若無法即時部署，關閉展示，避免面試期間累積新的訪客問答。~~ 不需要關閉展示。

### 6.2 48 小時內（P1）

1. Demo path scrub：`/api/processing`、`/api/judgment-download/status`。
2. Demo error scrub：API + SSE。
3. CSRF：`reconcile` 改 POST、加 CSRF token／SameSite=Lax、所有方法檢查 Origin。
4. Power agent：拒絕 `null`、精確 origin、一次性 token、production 預設關閉。
5. 備份：移除 `.env`、age 加密、密鑰輪替演練。

### 6.3 本週（P2）

1. CSP／security headers（CSP 已 enforce；`report-to` 與 header 全面抽查待補）。
2. Demo 題庫 DTO；限制 accepted。
3. 題庫狀態機。
4. Rate limit 用 `client_ip_key`；auth 限流；body 上限。
5. 分離 DB role。
6. 隱私文案與 retention。
7. `safeUrl` + XSS 測試。
8. CI／pip-audit／gitleaks／SBOM／pin build tools。

### 6.4 對外公開展示前（P3／外部）

1. 第二台設備驗證 x570 LAN 拒絕。
2. Google Cloud OAuth redirect URI + 真實登入。
3. Restore drill。
4. macOS 防火牆／Logi listener／SSH 22 硬化。
5. FileVault／磁碟加密確認。
6. Security audit 與告警上線。

## 7. 驗收命令

### 7.1 P0：performance 不再洩漏

```bash
curl -sS --get \
  --data-urlencode 'process=RAG 問答' \
  --data 'page_size=5' \
  'https://api-mbp.ragdemo.win/api/performance' \
| python3 -c '
import json,sys
d=json.load(sys.stdin)
s=json.dumps(d,ensure_ascii=False)
for needle in ("question","answer","metadata","params_text","flow.params"):
    assert needle not in s, needle
print("PASS", d.get("total"))
'
```

### 7.2 P1：processing／download status 不含絕對路徑

```bash
curl -sS https://api-mbp.ragdemo.win/api/processing \
| grep -E '/Users/|/home/|[A-Za-z]:\\' && echo FAIL || echo PASS

curl -sS https://api-mbp.ragdemo.win/api/judgment-download/status \
| grep -E 'manifest_path|/Users/|/home/' && echo FAIL || echo PASS
```

### 7.3 P1：錯誤不回傳例外類別

```bash
# 以會觸發 500 的無效請求測試（依實際端點調整）
curl -sS -X POST https://api-mbp.ragdemo.win/api/query \
  -H 'Content-Type: application/json' \
  -d '{"database":"postgres","filters":{"from_date":"not-a-date"}}' \
| grep -Ei 'Error|Exception|Traceback|psycopg|qdrant|/Users' && echo FAIL || echo PASS
```

### 7.4 P1：CSRF

```bash
# 需要有效的 Google session cookie；預期 403 或 405
curl -sS -i -H 'Origin: https://evil.example' \
  -H 'Sec-Fetch-Site: cross-site' \
  'https://api-mbp.ragdemo.win/api/index-alias/reconcile?repair=true' \
| head -20
```

### 7.5 P1：power agent

```bash
curl -sS -i -X OPTIONS http://127.0.0.1:9201/api/power/stop \
  -H 'Origin: null' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: X-Judgment-Power'
# 預期 403，且無 Access-Control-Allow-Origin
```

### 7.6 P1：備份不含明文 `.env`

```bash
find "$TARGET_DIR/config" -name '.env' -print
# 預期沒有輸出
```

### 7.7 P2：headers

```bash
curl -sS -D - -o /dev/null https://api-mbp.ragdemo.win/api/status \
| grep -iE 'content-security-policy|x-frame-options|referrer-policy|permissions-policy'

curl -sS -D - -o /dev/null https://judgment.ragdemo.win/ \
| grep -iE 'content-security-policy'
```

### 7.8 P2：DB role

```bash
docker exec judgment-postgres psql -U judgment -d judgment -tAc \
  "select current_user, rolsuper, rolcreatedb, rolcreaterole from pg_roles where rolname=current_user;"
# 應用帳號預期 f|f|f
```

## 8. 外部／非程式待辦

1. **Google Cloud OAuth**：加入 loopback redirect URI，完成一次真實登入與 allowlist 拒絕測試。
2. **x570 網路隔離**：第二台設備（手機熱點／另一台電腦）驗證 LAN 11434–11437 timeout，Tailscale 仍可用。
3. **NET-05**：關閉或更新 Logi Options+，開啟 macOS 應用程式防火牆，確認 `*:59869` 消失。
4. **SSH 硬化**：x570 的 `22/tcp` 限制來源、停用密碼登入、改用 key + Tailscale。
5. **Restore drill**：從加密備份完整還原 PostgreSQL／Qdrant／`data/`，筆數與 checksum 差異 0。
6. **磁碟加密**：確認 FileVault 與備份磁碟加密狀態。
7. **監控告警**：401/403、5xx、demo 預算、OAuth 失敗、power agent 操作。
8. **事件應變**：密鑰輪替、備份失竊、資料外洩的通報與演練。

## 9. 備註

- 本報告沒有執行破壞性測試，也沒有嘗試繞過 Google 登入或取得真實 session。
- 所有 live 請求皆為匿名唯讀；未修改任何資料。
- P0 的 Q&A 範例已節錄；完整問題與答案未保存到本文件。
- 若要在面試期間保留展示，建議至少先完成 6.1 的 P0 熱修復；否則 `allow_performance` 應保持關閉。
