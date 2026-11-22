# Judgment 資安提升評估報告 — 2026-11-22

- **日期**：2026-11-22
- **範圍**：Web 主控台、RAG 公開分享、demo mode、驗證／授權、工作排程與下载流程、備份還原、CI 供應鏈、正式站 runtime headers
- **方法**：程式碼靜態審查（4 個平行掃描面向）＋正式站／本機唯讀驗證
- **基準文件**：
  - [`security-acceptance-matrix.md`](security-acceptance-matrix.md)（控制項狀態與負責角色）
  - [`security-assessment-2026-11-21.md`](security-assessment-2026-11-21.md)（歷史修復紀錄，非目前 TODO）
  - [`../../docs/code-alignment-2026-11-21.md`](../../docs/code-alignment-2026-11-21.md)（程式碼現況）
- **原則**：程式碼是唯一事實來源；本報告只列「目前仍可改善」的事項，並標明已追蹤的 ticket，避免重複開單。
- **本次異動**：初版僅新增本報告；驗證時建立過一個測試用分享快照（7 天後自動過期），未讀取其他使用者資料。後續已修復 SEC-01、SEC-02，見第 8 節。

---

## 1. 執行摘要

### 1.1 最重要的結論

本次發現 **2 個已在正式站驗證、可實際利用的機密外洩路徑**，以及多項深度防禦不足：

| 優先 | ID | 問題 | 影響 | 狀態 |
| --- | --- | --- | --- | --- |
| **P0** | SEC-01 | RAG 分享 token 被寫入 performance 遙測，demo 訪客可從效能頁取得他人對話 | 分享連結的「不可猜測 token」防護完全失效 | 正式站已驗證 |
| **P0** | SEC-02 | `/api/schema/suggest` 對匿名訪客回傳本機絕對路徑 | 洩漏 OS 使用者、專案目錄、檔案配置 | 正式站已驗證 |
| **P1** | SEC-03 | 分享快照 sanitizer 只清理部分欄位 | 內部 host／錯誤訊息可能經公開連結外洩 | 程式碼可重現 |
| **P1** | SEC-04 | 分享渲染有 4 處未 escape 的插值 | 儲存式 HTML injection／釣魚覆蓋 | 程式碼可重現 |
| **P1** | INFRA-01 | 下载档案名来自上游 header 且未轉為 basename | 路徑遍歷／任意檔案寫入 | 程式碼可重現 |
| **P1** | AUTH-01 | Demo data endpoints 仍走主 DB superuser 連線 | 防禦縱深失效，放大其他洩漏 | 已追蹤 APP-DB-01 |
| **P2** | AUTH-02 | SSE ticket 可重播、未綁 session/IP | 120 秒內可訂閱管理事件流 | 已追蹤 SSE-01 |
| **P2** | AUTH-03 | 7 天無狀態 session、無撤銷、secret 可能共用 admin token | 竊取 cookie 後 7 天內無法撤銷 | 已修復（SESSION-01：12 小時 TTL、全裝置撤銷） |
| **P2** | INFRA-02 | 備份脚本把 Qdrant/DB 密碼放在 process command line | 本機其他使用者可讀取憑證 | 新發現 |
| **P2** | OPS-01 | 備份加密預設失敗開放、restore 會信任備份內 `.env` | 明文備份／設定被替換 | 新發現 |

### 1.2 統計

| 嚴重度 | 數量 | 說明 |
| --- | --- | --- |
| Critical | 0 | 未發現可直接 RCE 或公開取得管理權限的單一缺陷 |
| High | 2 | SEC-01、SEC-02（均已於正式站驗證） |
| Medium | 12 | 機密外洩、路徑遍歷、session/CSRF/SSE、DB 權限、DNS rebinding |
| Low | 10 | 速率、稽核、標頭、備份、設定、第三方字型 |
| 已良好實作 | 14 類 | 見第 6 節 |

### 1.3 建議順序

1. **24 小時內**：SEC-01、SEC-02、SEC-03、SEC-04、INFRA-01
2. **一週內**：AUTH-01～AUTH-05、INFRA-02～INFRA-04、OPS-01～OPS-02
3. **下次公開展示前**：完成 BAK-02 完整還原演練、ABUSE-01 端到端驗證、HDR-01 `report-to`、PRIV-01 自託管字型、NET-05、HIST-01 決策
4. **後續**：AUTH-05～08、OPS-04 等

---

## 2. 正式站驗證證據

以下為本次實際執行的唯讀／低影響驗證（demo 目前開放）：

```text
# SEC-01：分享 token 出現在公開 performance API
TOKEN=<測試分享 token>
GET https://api-mbp.ragdemo.win/api/performance?keyword=${TOKEN}
→ 回應中出現 3 次 ${TOKEN}（path / flow.path）

# SEC-02：匿名取得本機絕對路徑
GET https://api-mbp.ragdemo.win/api/schema/suggest?database=postgres&table=law_dataset_versions&column=parquet_path
→ [".../projects/judgment/data/laws/parquet/.../laws.parquet", ...]

GET .../schema/suggest?...&column=zip_path
→ [".../projects/judgment/data/laws/raw/...zip", ...]

# 分享快照 Cache-Control 正常
GET /api/rag/share/${TOKEN} → 200, cache-control: no-store

# Runtime headers 抽查
judgment.ragdemo.win：HSTS max-age=2592000（30 天）、無 CSP report-to、ACAO: *
api-mbp.ragdemo.win：同上，connect-src 仍含 http://127.0.0.1:9200 與 localhost:9200

# 依賴與秘密掃描
uv run --with pip-audit pip-audit → No known vulnerabilities found
CI gitleaks full history → 0 credential leaks（HIST-01 仍為 host/port 揭露）
```

---

## 3. 詳細發現

### A. 機密外洩與分享個資

#### SEC-01 — 分享 token 寫入 performance 遙測並對 demo 訪客可見

- **嚴重度**：High
- **證據**：
  - `src/judgment/web/app.py:2443-2516` — `performance_middleware` 記錄未正規化的 `request.url.path`；`/api/rag/share` 不在 skip list。
  - `src/judgment/web/observability.py:604,663` — path 持久化到 `PerformanceRecord.path` 與 flow JSON。
  - `src/judgment/web/demo_mode.py:387-424` — `sanitize_performance_payload()` 清理 `params_text`／flow metadata，但**未清理 `path`／`flow.path`**。
  - `src/judgment/web/static/assets/js/pages/performance.js:1982-1983` — 公開效能頁直接渲染 `row.path`。
  - `src/judgment/web/app.py:4334-4339` — token 為 GET path 的最後一段。
- **攻擊情境**：Alice 建立分享連結；Bob 以 demo 訪客身分打開 `#/performance`，搜尋 `rag/share` 即可看到完整 token 並直接開啟 Alice 的對話。
- **影響**：capability token 防護完全失效；所有分享對话可被同站訪客列舉。
- **建議**：
  1. 寫入遙測前將動態路徑正規化：`^/api/rag/share/[^/]+$` → `/api/rag/share/:share_id`（只改遙測副本，不碰授權比對）。
  2. `sanitize_performance_payload()` 主動移除 `path`、`flow.path`、`flow.entrypoint`。
  3. 新增回歸測試：建立分享後查 `/api/performance`，不得出現 token 字串。
- **工時**：S
- **關聯 ticket**：無（鄰近 TOKEN-01 / AUDIT-01）

#### SEC-02 — `/api/schema/suggest` 對匿名訪客回傳本機絕對路徑

- **嚴重度**：High
- **證據**：
  - `route_policies.json:60`、`demo_policies.json:13` — `GET /api/schema/suggest` 為 `DEMO_READ` / feature `data`。
  - `app.py:4157-4186` — 直接回傳 `schema_suggestions(...)`，沒有 `_is_demo_visitor()` 分支，也沒有 `sanitize_query_payload()`。
  - `query.py:67-77,89,114` — `parquet_path`、`zip_path`、`error_message` 都在允許欄位。
  - `law_download/service.py:285-297` — 這些值就是絕對檔案路徑。
  - 對照：`app.py:4047-4061` 的 `/api/query` 有套 sanitizer；`demo_mode.py:84-85` 已將這些欄名列為敏感。
- **攻擊情境**：匿名訪客在 demo 期間列舉 `table=law_dataset_versions&column=parquet_path|zip_path`，取得 OS 使用者、專案根目錄、資料版本與檔名。
- **影響**：recon 資訊，可銜接備份／log／路径攻击；DEMO-PATH-01／DEMO-ERR-01 被繞過。
- **建議**：
  1. 建立「demo 用 column allowlist」，從 `TABLE_COLUMNS` 移除 `parquet_path`、`zip_path`、`error_message` 等敏感欄位。
  2. 即使保留欄位，也對 `values` 做 `_scrub_absolute_paths()`（key-based sanitizer 不會清理字串陣列）。
  3. 補上 `tests/test_demo_mode.py` 對此端點的匿名輸出斷言。
- **工時**：S
- **關聯 ticket**：DEMO-PATH-01／DEMO-ERR-01 回歸，APP-DB-01

#### SEC-03 — 分享快照 sanitizer 未深度清理整個 payload

- **嚴重度**：Medium-High
- **證據**：
  - `app.py:312-333` — allowlist 保留 entire objects：`judgments`、`law_sources`、`citations`、`law_framework`、`notice`、`degraded_reason`。
  - `demo_mode.py:311-317` — `sanitize_rag_result()` 只 pop 3 個 top-level key，且只對 `retrieval` 做 `sanitize_infrastructure()`；沒有對整包做 `_scrub_absolute_paths()` / `_scrub_internal_endpoints()`。
  - 對照 `demo_mode.py:271-276` 的 `sanitize_query_payload()` 是對整包做完整清理。
  - `rag.py:4597-4602` — `notice` 由 exception class／`str(exception)` 組成，可能包含 `http://host:port`。
  - 規格 `rag-workspace-toolbar.md:218,301` 明確禁止保存內部 host、端點、錯誤與基礎設施資訊。
- **攻擊情境**：
  - 正常使用者分享一則 LLM 連線錯誤回答，`notice` 內的 `ConnectionError(host='internal', port=11434)` 被原樣保存。
  - 攻擊者直接 POST 自訂 JSON，在 `judgments: [{host:"10.0.0.5", api_key:"..."}]` 塞入敏感 key，因未做 deep scrub 而保留。
- **影響**：公開連結可能揭露內網 host、連接埠、模型端點與錯誤細節。
- **建議**：在 `_sanitize_rag_share_turns()` 對整個 `cleaned` 套用完整鏈：
  `cleaned = _scrub_internal_endpoints(_scrub_absolute_paths(sanitize_infrastructure(cleaned)))`
  並補 deep-scrub 回歸測試。
- **工時**：S
- **關聯 ticket**：HIST-01

#### SEC-04 — 分享渲染有 4 處未 escape 的插值

- **嚴重度**：Medium
- **證據**：
  - `rag.js:672` — `citation-index` 的 `index` 直接插值。
  - `rag.js:769`、`rag.js:852` — `String(index).padStart()` 未 escape。
  - `rag.js:787-796` — `lawSourceCard()` 的 `law_level`／`law_category` 直接放進 `<span>${value}</span>`；其他卡片都有 `escapeHtml()`。
  - 這些欄位可由 POST `/api/rag/share` 的 attacker-controlled JSON 提供。
- **攻擊情境**：攻擊者建立快照，把 `index` 設成全螢幕 `<a>` 或 `<form>`，寄給受害者；CSP 擋 inline script，但 HTML/CSS injection、`style-src 'unsafe-inline'` 與外部導覽仍可行。
- **影響**：UI 冒用、釣魚覆蓋、clickjacking；若 CSP 日後回退即為 XSS。
- **建議**：4 處全部包 `escapeHtml()`；指數類欄位改用 `Number()` clamp。補 render 測試。
- **工時**：S
- **關聯 ticket**：XSS-01 未涵蓋的路徑

#### SEC-05 — 分享連結有效期與 demo 狀態耦合，UI 卻暗示獨立 7 天

- **嚴重度**：Low
- **證據**：`app.py:685-707`（DEMO_READ/QUERY 要求 demo active + feature）、`rag-workspace-toolbar.md:243`、`rag.js:233` toast。
- **影響**：demo 關閉後連結失效，重新開啟後又復活；使用者對「7 天私人連結」認知錯誤。
- **建議**：二選一：
  1. 讓 `GET /api/rag/share/{id}` 成為 `PUBLIC_READ` 並搭配嚴格獨立限流（更符合「公開連結」語意）；
  2. 在 toast／文件明確說明 demo 依賴。
  建立仍維持 demo 限制。
- **工時**：M
- **關聯 ticket**：無

#### SEC-06 — 分享快照被動 TTL、無撤銷、無存取稽核

- **嚴重度**：Low-Medium
- **證據**：`app.py:4299-4303` 只在建立時清過期；`app.py:4340` GET 不刪除；`models.py:943-954` 無 `revoked_at`／owner；無 DELETE endpoint。
- **影響**：沒有新分享行為時，过期快照（含 SEC-03 可能洩漏的內容）會一直留在 DB 與備份；外洩連結無法撤銷；無法追查誰看過。
- **建議**：背景 purge job；`revoked_at` + owner capability 的 DELETE；audit 事件（hash IP，不記 token）；修正文件所述的實際 retention。
- **工時**：M
- **關聯 ticket**：AUDIT-01、PRIV-01

#### SEC-07 — 公開分享頁仍直連 Google Fonts

- **嚴重度**：Low
- **證據**：`index.html:23-26`、`app.py:1914-1915`、matrix `:45`。
- **影響**：分享連結接收者仍將 IP／UA／Referer 透露給 Google。
- **建議**：自託管 woff2、移除 preconnect、收斂 CSP。
- **工時**：M
- **關聯 ticket**：PRIV-01

#### SEC-08 — 分享檢視僅 CSS 隱藏管理動作，用戶端動作仍可用

- **嚴重度**：Low
- **證據**：`styles.css:4586-4589`；`rag.js:1636-1654,1762-1784` 仍綁定 handler，且 `showFollowup()` 讓訪客可續問再分享。
- **影響**：接收者可消耗 demo 配額並建立衍生快照；「不顯示管理操作」只是視覺層面。
- **建議**：shared view 下直接移除／禁用 toolbar 節點，並在 JS 對 share/menu 动作加上 `if (sharedRequest) return;`；或接受為 capability model 的一部分並文件化。
- **工時**：S
- **關聯 ticket**：無

---

### B. 驗證、授權、Session、CSRF

#### AUTH-01 — Demo data endpoints 使用主 DB superuser 連線

- **嚴重度**：Medium
- **證據**：`app.py:4073-4087,4089-4118,4120-4155,4157-4186` 都用 `app.state.session_factory`；只有 `/api/query` 在 `app.py:4011-4022` 改用 `demo_query_session_factory`。`docs/code-alignment-2026-11-21.md:69` 已記錄此差距。
- **影響**：匿名 traffic 直達 superuser；SEC-02 的路徑就是從這條連線取得。
- **建議**：抽出 `_session_for(request)` helper，demo visitor 一律用受限連線，未設定則 fail closed；長期完成 APP-DB-01。
- **工時**：M
- **關聯 ticket**：APP-DB-01 / DB-ROLE-01

#### AUTH-02 — SSE ticket 可重播、未綁定 session／IP、放在 URL

- **嚴重度**：Medium
- **證據**：`app.py:932-958`（HMAC + exp，無 jti／binding）、`app.py:2208-2211,783-790`（bypass policy）、`api.js:195-264`（EventSource query）。
- **建議**：一次性 jti + TTL set；綁 session hash／IP hash；TTL 降到 30–60 秒；改用短效 cookie。
- **工時**：M
- **關聯 ticket**：SSE-01

#### AUTH-03 — 7 天無狀態 session、無撤銷、secret 可能 fallback 到 admin token

- **嚴重度**：Medium
- **證據**：`auth.py:39-40,102-129`、`config.py:92`、`app.py:2421-2433`。
- **建議**：`jti` + revocation list／`admin_sessions` 表；TTL 縮短；開機時拒絕空或與 admin token 相同的 `AUTH_SESSION_SECRET`。
- **工時**：L
- **關聯 ticket**：SESSION-01、TOKEN-01

#### AUTH-04 — CSRF 仍主要依賴 Origin/Sec-Fetch，生產 SameSite=None

- **嚴重度**：Medium
- **證據**：`.env:91`、`auth.py:180-203`、`app.py:2155-2205`（只對 `local_bypass/google/anonymous` 檢查，admin_token 無分支）、`app.py:2421-2428`（logout 用 `require_origin=False`）、`route_policies.json:86,92`。
- **建議**：
  1. `.env` 改 `AUTH_COOKIE_SAMESITE=lax`；OAuth callback 是 top-level GET，Lax 不影響 state cookie。
  2. logout 使用 `require_origin=True`。
  3. 依政策 class 而非 principal source 檢查 Origin，含 admin_token。
- **工時**：M
- **關聯 ticket**：CSRF-01

#### AUTH-05 — 無集中安全稽核

- **嚴重度**：Low
- **證據**：`demo_mode.py:693-702,739-748` 只有 demo 設定稽核；Google login 成功／失敗、token 使用、admin write 無事件。`app.py:2337-2419`。
- **建議**：`security_audit` 表 + 單一 `record_security_event()`；覆蓋 login/logout/failure、admin token 使用、ADMIN_WRITE、401/403 burst 告警。
- **工時**：L
- **關聯 ticket**：AUDIT-01、AUTH-01

#### AUTH-06 — 靜態長效 admin token，接受兩個 header

- **嚴重度**：Low
- **證據**：`app.py:858-865,917-924`、`api.js:137-176`。
- **建議**：token 版本化 + 短重疊期；對 token 寫入做限流與稽核；若前端未用 `Authorization: Bearer` 則移除。
- **工時**：M
- **關聯 ticket**：TOKEN-01、AUTH-01

#### AUTH-07 — Demo body size 只檢查 Content-Length，chunked 可繞過

- **嚴重度**：Low
- **證據**：`app.py:2139-2154`、`config.py:74-82`（64 KB）；本機驗證 70 KB chunked 請求未回 413。
- **建議**：middleware 計數 `receive` bytes，或直接拒絕 demo principal 的 `Transfer-Encoding: chunked`。
- **工時**：S
- **關聯 ticket**：ABUSE-01

#### AUTH-08 — 題庫狀態機尚未實作

- **嚴重度**：Low（matrix 記 not_started）
- **建議**：限制直接建立／更新為 `accepted`，角色矩陣與狀態转换测试。
- **關聯 ticket**：AUTH-02（題庫）

---

### C. 基礎設施、檔案、SSRF

#### INFRA-01 — 上游 `Content-Disposition` 檔名未轉 basename，造成路徑遍歷

- **嚴重度**：Medium
- **證據**：`judgment_download.py:90-100` 使用 `unquote()` 但未取 `Path(name).name`；`:1331-1351` 直接存入 `entry["filename"]`；`:1910,2017-2020` 組出 `raw_dir / entry["filename"]` 並寫入；`:573-588,1244-1254` 也信任 manifest 的 filename。
- **攻擊情境**： malicious/遭入侵的上游回傳 `filename=../../documents/金融法規.md` 或 `%2e%2e%2f...`，下載寫出 `raw_rar/`，後續 prune 還可能移動／刪除該檔案。
- **建議**：所有外部檔名 `Path(value).name` + `_safe_filename()` + `^\d{6}.*\.(rar|7z|zip)$` 驗證；寫入前 `destination.resolve().is_relative_to(raw_dir.resolve())`；`quote(filename, safe='')`。
- **工時**：S
- **關聯 ticket**：無

#### INFRA-02 — 備份／還原把DB／Qdrant 密碼放在 process command line

- **嚴重度**：Low-Medium
- **證據**：`backup.sh:101-107,244-258,308-312,368-371`、`restore.sh:108-114,350-352,376-387` 使用 `curl -H "api-key: ..."` 與 `env PGPASSWORD=... psql/pg_dump`。
- **影響**：本機其他使用者可從 `ps`／`/proc/<pid>/cmdline` 取得憑證。
- **建議**：`curl -K - <<<"header = api-key: $KEY"`；使用 0600 `PGPASSFILE`。
- **工時**：S
- **關聯 ticket**：無

#### INFRA-03 — 備份加密預設失敗開放

- **嚴重度**：Low
- **證據**：`backup.sh:24` `BACKUP_REQUIRE_ENCRYPTION` 預設 `0`；`.env.example:70` 才設 `1`；检查在 `:222-224,361-363`。
- **建議**：脚本預設改 `1`，需明確 `--allow-unencrypted` 才能關閉。
- **工時**：S
- **關聯 ticket**：BAK-01

#### INFRA-04 — Restore 會自動覆蓋 `.env`

- **嚴重度**：Low
- **證據**：`restore.sh:323-332` 複製備份內 `config/.env` 到專案，`:338` source，`:446-448` 啟動後端。
- **影響**：惡意備份可替換 admin token、session secret、DB／LLM URL，形成持久化後門與 SSRF。
- **建議**：不自動還原 `.env`；由操作員從 secret manager 手動放置，或驗證分離簽章並印出 diff。
- **工時**：S
- **關聯 ticket**：BAK-02

#### INFRA-05 — llama-server host probe 有 DNS rebinding／TOCTOU

- **嚴重度**：Medium
- **證據**：`ollama_hosts.py:133-159` 只解析一次 IP 檢查；`:197-232` 之後 httpx 重新解析，fallback `provider_models_detail()` 無再次檢查；allowlist 比 hostname 字串。
- **建議**：鎖定已驗證 IP 直接連線（自訂 transport／literal IP + Host header），fallback 路徑重驗，必要時要求 allowlist 條目為 literal IP。
- **工時**：M
- **關聯 ticket**：無（既有 SSRF 防護未涵蓋 rebinding）

#### INFRA-06 — 判決 archive 解壓縮沒有大小上限

- **嚴重度**：Low
- **證據**：`judgment_import.py:215-242` 只計算 uncompressed bytes 做進度；`:245-314` `buffer += chunk` 無上限；`config.py:56` 的 512 MB 限制只在 law download 使用。
- **建議**：重複使用 `max_uncompressed_bytes` 限制 archive 與單一 JSON object buffer。
- **工時**：S
- **關聯 ticket**：無

#### INFRA-07 — 上游代理下载端點對一般 AUTH_READ 使用者開放

- **嚴重度**：Low
- **證據**：`route_policies.json:36`、`app.py:3052-3096`；僅一個全域 lock。
- **建議**：改 `ADMIN_ONLY` 或加 per-IP 限流與 bytes cap。
- **工時**：S
- **關聯 ticket**：ABUSE-01

#### INFRA-08 — Placeholder 憑證與弱 fallback 預設

- **嚴重度**：Low（部署不當則 High）
- **證據**：`.env.example:1,5,6,39,74` 的 `change-me`；`config.py:200-203` 預設 `judgment:judgment`；`auth.py:39-40` session secret fallback 到 admin token。
- **建議**：開機時對空值／`change-me`／admin token 相同的 secret fail fast；非 loopback 強制獨立 `AUTH_SESSION_SECRET`。
- **工時**：S
- **關聯 ticket**：TOKEN-01、APP-DB-01

#### INFRA-09 — 主應用 DB role 仍是 superuser

- **嚴重度**：Medium
- **證據**：`docker-compose.yml:6-9`、`config.py:202`、matrix `:39`、`rolsuper=t/rolcreatedb=t`。
- **建議**：建立 `judgment_app`（NOSUPERUSER、NOCREATEDB、僅 DML grants），主應用改連此 role；保留 migration role 分離。
- **工時**：M
- **關聯 ticket**：APP-DB-01 / DB-ROLE-01

#### INFRA-10 — Logi Options+ listener 與 macOS 防火牆

- **嚴重度**：Low（外部／本機）
- **證據**：matrix `:21`，`*:59869`，防火牆關閉。
- **建議**：更新／移除該服務並開啟應用程式防火牆。
- **工時**：S
- **關聯 ticket**：NET-05

---

### D. 標頭、供應鏈與可用性

#### OPS-01 — HSTS 僅 30 天、CSP 無 `report-to`、Pages ACAO `*`

- **嚴重度**：Low
- **證據**：正式站 headers：`strict-transport-security: max-age=2592000`；無 CSP `report-to`／`Reporting-Endpoints`；Pages `access-control-allow-origin: *`；API CSP `connect-src` 仍含 localhost。
- **建議**：HSTS 改 `max-age=31536000; includeSubDomains`（確認子網域皆 HTTPS 後）；補 `Reporting-Endpoints` + `report-to`；Pages 靜態資源若前端不需跨站讀取可移除 `ACAO:*`；production CSP 移除 localhost connect-src。
- **工時**：S
- **關聯 ticket**：HDR-01

#### OPS-02 — 已修復（完整 restore drill）

- **原問題**：matrix `:34`，157 GB + Qdrant 完整還原未演練。
- **修復／驗證**：2026-11-22 在 production 不停機下完成隔離 drill：age checksum、PostgreSQL scratch DB、第二個 Qdrant container、data SHA-256 全部通過；核心 counts 0 差異、Qdrant 4,714,967 points、1,404 files SHA-256 相同。總計 47m48s（checksum→data SHA）。
- **發現**：來源備份是 2026-11-21 舊快照，缺少 `rag_share_snapshots`、`security_audit_events` 與 5 個 trigram indexes；已重新建立最新備份。
- **報告**：`specs/security/restore-drill-2026-11-22.md`
- **關聯 ticket**：BAK-02

#### OPS-03 — 限流仍為 in-process，且未經端到端／edge 驗證

- **嚴重度**：Low
- **證據**：`demo_mode.py:779-823`、matrix `:34`；share create 不計入每日 RAG budget，無 global snapshot cap。
- **建議**：計入每日 budget、加總量上限、驗證 429／Retry-After／串流併發、補 Cloudflare edge rules。
- **工時**：M
- **關聯 ticket**：ABUSE-01、RS-05

#### OPS-04 — 已修復（2026-11-22）

- **原問題**：`.github/workflows/ci.yml` 使用 `@v4/@v5` tags、未 `persist-credentials: false`、`uv sync` 未 `--frozen`、無 branch protection。
- **修復**：Actions 全部改 commit SHA pin（checkout／setup-python／setup-node／setup-uv v7、sbom-action v0）；checkout `persist-credentials: false`；`uv sync --frozen --extra dev`；新增 `.gitleaks.toml` 自訂規則與 `scripts/gitleaks_selftest.sh` 負向／正向對照；`main` 啟用 required checks、PR、禁止 force push／刪除與管理員強制套用。
- **驗證**：本機 gitleaks 305 commits、45.7 MB、0 leaks；自訂規則 negative control exit 2、placeholder exit 0；branch protection API 回應已啟用。
- **關聯 ticket**：SUP-01

#### OPS-05 — Git history 仍有內部 host／port

- **嚴重度**：Low
- **證據**：matrix `:42`；gitleaks 0 credentials。
- **建議**：決定接受風險並簽核，或用 `git filter-repo` 重寫；重寫後輪替所有仍在文件中出現的敏感設定。
- **工時**：L
- **關聯 ticket**：HIST-01

---

## 4. 建議整改路線圖

| 階段 | 項目 | 驗收條件 |
| --- | --- | --- |
| **24h（最高優先）** | SEC-01、SEC-02、SEC-03、SEC-04、INFRA-01（已修復） | 分享後查 `/api/performance` 無 token；anonymous schema suggest 無絕對路徑；deep-scrub 測試通過；4 處 escape 測試通過；惡意 filename 無法寫出 raw_dir |
| **1 週（P1）** | AUTH-01、AUTH-02、AUTH-04、INFRA-02、INFRA-03、INFRA-04、INFRA-09（已修復）；INFRA-05（後續） | demo endpoints 使用受限 DB；SSE ticket 一次性；SameSite=Lax；備份 secret 不進 cmdline；加密 fail-closed；restore 不自動覆寫 `.env`；DB role 降權完成 |
| **下次展示前（P2）** | BAK-02、ABUSE-01、OPS-01、PRIV-01、NET-05、HIST-01、SEC-05、SEC-06 | 完整還原成功；429／edge 規則驗證；HSTS/report-to 補齊；字型自託管；防火牆開啟；HIST 決策簽核 |
| **後續（P3）** | AUTH-05、AUTH-06、OPS-04、INFRA-06/07/08/10 | CI 完全 pin；其餘縱深防禦 |

---

## 5. 已具備且良好的控制

為避免只見缺口，以下控制已有程式或實測證據：

1. **Route policy default-deny + 雙層檢查**：`route_policy.py:13,39-74,237-275`、`app.py:766-817,1863-1872`，未知路徑走 ADMIN_ONLY。
2. **HMAC token 與 constant-time 比較**：`auth.py:61-99`、`app.py:917-924`；purpose separation 防止 session／OAuth state 混用。
3. **OAuth 流程**：signed state、`email_verified`、allowlist、`safe_next_url`、HttpOnly/Secure cookie（`app.py:2358-2419`、`auth.py:294-333,358-381`）。
4. **Origin／Sec-Fetch-Site／Host／CORS 邊界**：`app.py:2086-2095,2155-2205,961-976`、`runtime_security.py:48-70`；`*` CORS 被忽略。
5. **Demo sanitizer 與 fail-closed**：`demo_mode.py:168-185,244-261,387-424,461-513`；`/api/query` 已套用。
6. **限流與預算**：`demo_mode.py:779-823`、`app.py:715-763`；IPv6 /64 bucket（`client_ip.py:30-47`）。
7. **分享 token 本身的設計**：`secrets.token_urlsafe(16)`、64 字長度上限、無列舉端點、404 on missing/expired、`Cache-Control: no-store`（`app.py:4304-4357`）。
8. **分享頁不呼叫 LLM**：`rag.js:1744-1779`，避免觀看連結產生推論成本。
9. **CSP 縱深**：`script-src 'self'`、`base-uri none`、`frame-ancestors none`、`form-action none`（實際為 self）、`object-src none`（`app.py:1911-1922`）。
10. **無 command injection**：全專案無 `shell=True`；`workflow_id` 對固定表驗證（`workflow_runner.py:75-80`、`web/processing.py:5765-5768`）。
11. **無典型 zip slip**：law download 只讀單一 JSON member 且檢查大小；judgment import 用 `bsdtar -xOf` 輸出到 stdout。
12. **機密落_disk 權限**：`.env` 600、`.run/` 700、logs 600、backup 排除 `.env`（`up.sh:19-22`、`backup.sh:420-425`）。
13. **Docker 綁定與 image pin**：`docker-compose.yml` 127.0.0.1 binding、digest pin、無 privileged／docker.sock。
14. **Power agent 防跨站**：拒 `Origin: null`、要求 `X-Judgment-Power: 1`、loopback bind（`power_agent.py:310-352,454-463`）。
15. **依賴與秘密掃描**：pip-audit 無已知漏洞；CI gitleaks 全歷史 0 credentials；SBOM 產出；esbuild 版本固定。

---

## 6. 追蹤與簽核建議

目前 matrix 中沒有任何控制項是 `accepted`。建議在 P0/P1 修復後，由負責人對每一列補上：

```text
控制了 which version / 何時驗證 / 驗證指令或截圖 / 簽核人 / 下次複審日
```

並把本報告的 SEC-01～SEC-08、AUTH-01～AUTH-08、INFRA-01～INFRA-10、OPS-01～OPS-05 對應到 matrix 或既有的 SESSION-01 / AUDIT-01 / APP-DB-01 / ABUSE-01 / BAK-02 / HDR-01 / PRIV-01 / HIST-01 / NET-05，避免重複開單。

---

## 8. P0 修復紀錄（2026-11-22）

### SEC-01 — 已修復

- `src/judgment/web/app.py` 新增 `_telemetry_path()`，在 performance middleware 寫入 flow／`PerformanceRecord` 前將 `/api/rag/share/<token>` 正規化為 `/api/rag/share/:share_id`。
- `src/judgment/web/demo_mode.py` 新增 `_scrub_share_paths()`，對既有或舊版 performance payload 的 `process`、`module`、`entrypoint`、`path` 等所有字串做 token redaction。
- 回歸測試：
  - `tests/test_web.py::test_rag_share_token_is_redacted_from_performance_telemetry`
  - `tests/test_demo_mode.py::test_demo_performance_redacts_share_tokens`

### SEC-02 — 已修復

- `/api/schema/suggest` 對 demo 訪客：
  - 封鎖 `law_dataset_versions.parquet_path`、`law_dataset_versions.zip_path`、`download_runs.error_message`、`judgment_import_runs.error_message`。
  - 其餘結果套用 `sanitize_query_payload()`，阻擋絕對路徑與內部錯誤字串。
- Admin 請求仍可取得完整欄位，不影響管理頁。
- 回歸測試：`tests/test_demo_mode.py::test_demo_schema_suggest_blocks_sensitive_paths`。

### SEC-03 — 已修復

- `_sanitize_rag_share_turns()` 在 allowlist 後對整包 payload 套用 `sanitize_query_payload()`，遞迴清除內部 host、URL、絕對路徑、error 與基礎設施欄位。
- 回歸測試：`tests/test_web.py::test_rag_share_snapshot_round_trip` 新增 nested `judgments`／`law_sources`／`notice`／`degraded_reason` 洩漏斷言。

### SEC-04 — 已修復

- `rag.js` 新增 `safeIndex()`，citation／law source 索引只允許有限數字，不再直接插值 attacker-controlled 字串。
- `law_level`、`law_category` 改為 `escapeHtml()` 後才放入 meta。
- 回歸測試：`tests/test_web.py::test_rag_shared_render_escapes_indexes_and_law_metadata`。

### INFRA-01 — 已修復

- `_filename_from_headers()` 與 `_probe_next()` 一律取 basename 並套用 `_safe_filename()`。
- `_load_manifest()` 載入時清理 `files`／`history_files` 的 filename。
- 新增 `_archive_path()`，所有 archive 讀寫／prune 路徑都限制在 `raw_rar` 內；`Content-Disposition` 使用 `quote(..., safe="")`。
- 回歸測試：
  - `tests/test_judgment_download.py::test_download_filename_headers_are_reduced_to_safe_basename`
  - `tests/test_judgment_download.py::test_archive_path_never_escapes_raw_rar`
  - `tests/test_judgment_download.py::test_probe_next_rejects_path_like_filenames`
  - `tests/test_judgment_download.py::test_load_manifest_sanitizes_archive_filenames`

### 第二批修復（AUTH／備份）

#### AUTH-01 — 已修復

- `/api/data/suggest`、`/api/judgment`（postgres）、`/api/law`、`/api/schema/suggest` 對 demo visitor 改用 `app.state.demo_query_session_factory`。
- 未設定時回 `403 demo_data_unavailable`，不 fallback 到主 superuser 連線。
- `demo_reader` 對 `law_documents`、`law_article_versions`、`law_article_change_events` 為 table-level SELECT；`judgment_documents` 維持 column-level，公開全文／PDF／metadata 可讀，但 `source_archive`、`import_run_id`、snapshot 關聯欄位不授權。`law_dataset_versions`、`download_runs`、`judgment_import_runs` 維持 column-level，查詢會排除內部欄位。
- 負向驗證已重跑：`parquet_path`、`zip_path`、`source_archive`、`import_run_id`、`error_message`、未授權表、`pg_read_file`、`COPY ... PROGRAM`、`CREATE TABLE` 全部失敗；`demo_reader` 不屬於任何 `pg_*_server_*` 角色。
- 回歸測試：`tests/test_demo_mode.py::test_demo_data_endpoints_use_restricted_session_factory`；正式站已驗證 `/api/data/suggest`、`/api/law`、`/api/judgment` 正常。

#### AUTH-02 — 已修復

- SSE ticket 改為 60 秒、一次性 `jti`、綁定 client IP 與 principal binding；middleware 消費後以 `sse_ticket_valid` 讓 route guard 放行。
- 重播同一 ticket 會失敗；前端每次重連會重新取得 ticket。
- 回歸測試：
  - `tests/test_web.py::test_sse_ticket_is_one_time_and_bound_to_client_ip`
  - `tests/test_web.py::test_sse_ticket_stream_is_single_use`

#### AUTH-03 — 已修復（session 生命週期；SESSION-01）

- session token 含 `jti` 與 `sv`；logout 撤銷單一 `jti`。
- `POST /api/auth/logout-all` 推進該帳號的 session epoch，所有裝置的既有 cookie 立即失效（包含目前裝置）。
- 絕對 TTL 由 7 天縮短為 12 小時；沒有 `sv` 的舊 token 一律拒絕，部署後需重新登入。
- 撤銷狀態讀取失敗時 fail closed（不因 DB 錯誤接受 session）。
- Production Google 登入 fail-fast：`AUTH_COOKIE_SECURE=true` 或 HTTPS redirect 時，`AUTH_SESSION_SECRET` 必須至少 32 字元、不得等於 `JUDGMENT_ADMIN_TOKEN`，且不可留空 fallback；可在啟動與 `--check-config` 時攔截。
- 回歸測試：`test_google_logout_clears_session`、`test_logout_all_revokes_every_session`、`test_session_without_version_is_rejected`、`test_runtime_security.py` 的 auth secret 測試。

#### AUTH-04 — 已修復

- production `.env` 改為 `AUTH_COOKIE_SAMESITE=lax`。
- logout 拒絕 `Sec-Fetch-Site: cross-site`；admin-token 寫入也納入 Origin／Sec-Fetch-Site 檢查。
- 回歸測試：logout cross-site 403、admin-token evil Origin 403。

#### INFRA-02 — 已修復

- `backup.sh`／`restore.sh` 的 PostgreSQL 密碼改由 `docker compose exec -e PGPASSWORD` 從 client 環境傳入，不再出現在 process arguments；Qdrant API key 改由 `curl -K -` stdin config 傳入。
- `bash -n` 通過。

#### INFRA-03 — 已修復

- `BACKUP_REQUIRE_ENCRYPTION` 預設改為 `1`；新增 `--allow-unencrypted` 明確放行明文 dump。

#### INFRA-04 — 已修復

- `restore.sh` 不再自動覆寫 `.env`；若備份含 `config/.env`，只提示操作員人工比對並從密鑰管理器設定。

#### INFRA-09 — 已修復

- 建立 `judgment_app`：`NOSUPERUSER`、`NOCREATEDB`、`NOCREATEROLE`。
- `public` schema `USAGE, CREATE`；33 張 public tables／sequences ownership 轉移給 `judgment_app`。
- `DATABASE_URL` 已切換至 `judgment_app`；`judgment` superuser 僅保留給 break-glass／備份／初次建立，不再供 FastAPI 使用。
- 驗證：`rolsuper=f`、`rolcreatedb=f`、`rolcreaterole=f`；`COPY PROGRAM`、`pg_read_file`、`CREATE DATABASE` 失敗；`ALTER TABLE`、`/api/home`、`/api/status`、`/api/query`、`/api/law`、`/api/judgment`、`/api/rag/share`、`PUT /api/admin/demo` 正常。
- Restore ownership 演練：schema dump → scratch DB restore → ownership transfer，33/33 public tables 轉為 `judgment_app`，再 drop scratch DB。
- `judgment_raw_parquet.py` 的 `COPY ... TO file` 是 DuckDB 在應用程式行程內寫檔，不是 PostgreSQL server-side COPY；不需要保留 `pg_write_server_files`。
- `restore.sh` 在 destructive restore 前確認 `judgment_app` 存在，還原後將 public tables／sequences ownership 轉移給它；`pg_restore --no-privileges` 不會還原的 `demo_reader` grants 仍需依 demo runbook 重新套用。
- Runbook：`specs/security/app-db-role-runbook.md`；回滾檔：`.run/env.before-db-role`（600）。

#### AUDIT-01 — 已修復

- 新增 `security_audit_events`：event type、outcome、actor、source、client IP hash、request id、method、path、detail、created_at。
- 新增 `record_security_event()` 與 `list_security_events()`；180 天保留，每 200 次寫入清理。
- 新增 `GET /api/admin/security-audit?limit=...`（ADMIN_ONLY、`Cache-Control: no-store`）。
- 已接線：Google login 成功／失敗、logout、logout-all、admin token 使用、admin write（含 status code）。
- 不記錄 token、OAuth code／state、密碼、cookie 或 query string；client IP 只存 keyed hash。
- 未驗證失敗事件（`auth.google_start`、`auth.google_login`）有每 IP／每日與全域每日上限，避免匿名流量灌大表格。
- 稽核事件建構或寫入失敗只記 warning，不阻塞原本的管理請求；admin token 路徑不讀取 session epoch。
- 回歸測試：`test_security_audit_records_admin_auth_and_writes`、`test_security_audit_failures_are_non_blocking`、`test_security_audit_caps_unauthenticated_failure_events`、`test_security_audit_does_not_store_query_string`、`test_admin_token_ignores_stale_session_epoch`、`tests/frontend_security.test.mjs`。
- 尚未完成：外部告警／dashboard、401/403 burst 偵測；目前提供結構化資料與讀取 API。

#### 驗證結果（2026-11-22）

- **Demo 資料隔離**：正式站 `/api/data/suggest`、`/api/law`、`/api/judgment`、`/api/query` 正常；`/api/judgment` 的 `source_archive`／`import_run_id` 對 demo 為 `None`；`/api/query` 的 `judgment_documents` columns 不含 `source_archive`。
- **demo_reader 負向測試**：`parquet_path`、`zip_path`、`source_archive`、`import_run_id`、`error_message`、`question_bank_items`、`pg_read_file`、`COPY ... PROGRAM`、`CREATE TABLE` 全部以 InsufficientPrivilege／ReadOnly 失敗；`demo_reader` 無任何 role membership。
- **毒化主連線測試**：`tests/test_demo_mode.py::test_demo_data_routes_do_not_touch_primary_session` 將主 session 換成一呼叫就丟例外的物件，四條 data 路由與 `/api/query` 仍成功。
- **Admin token 關閉路徑**：無 Origin 的 curl `POST /api/admin/demo/close` → 200；關閉後 `/api/demo/status` false、`/api/rag/query` 403、`/api/status` 403；再以 admin token 無 Origin 開啟 → 200，6 個功能與 2 小時期限恢復。2026-11-22 晚間已再次關閉展示，`/api/rag/query` 與 `/api/status` 均為 403，admin token 仍可讀取設定。
- **SSE**：正式站 ticket `expires_in=60`；第一次 stream 200，重播 401；access log 已遮蔽 `ticket=[redacted]`，日誌中找不到 ticket 值。
- **Session 撤銷**：`tests/test_web.py::test_google_logout_clears_session` 驗證 logout 後 `revoked_session_jtis` 已寫入 DB，重播 token `authenticated=false`。
- **備份機制**：`pg_dump --schema-only` → 建立 scratch DB → `pg_restore` 成功（33 張 public tables）→ drop；Qdrant API 以 `curl -K -` 驗證 200；`BACKUP_REQUIRE_ENCRYPTION=1` 缺 recipient 時 fail closed；`bash -n` 兩支腳本通過。2026-11-22 另跑 `backup.sh` 小規模 smoke：scratch DB → age 加密 dump → checksum 驗證 → age 解密 → 第二個 scratch DB `pg_restore`，34 tables 成功。
- **完整 restore drill**：2026-11-22 隔離還原 2026-11-21 備份；PG 21m36s、Qdrant 3m51s、data 8m15s、data SHA 6m44s；核心 counts 0 差異、Qdrant 4,714,967 points、1,404 files SHA-256 相同。舊備份缺少 2 張新 table／5 個 trigram indexes，已建立最新備份 `/Volumes/T500_2TB/judgment-backup-20261122-1500`（157 GB；34 tables、PG/Qdrant checksum OK、data SHA 一致）。詳見 `restore-drill-2026-11-22.md`。
- **Google 實機登入／管理頁**：使用者已在 `judgment.ragdemo.win` 完成 Google 登入。access log 顯示 `/api/auth/google/start` 302、callback 302、`/api/auth/me` 200，以及管理頁 `PUT /api/admin/demo`、`POST /api/admin/demo/close` 200。驗證期間發現 OAuth `code` 曾寫入 access log；已補 `code`／`state` 遮蔽，並清理舊 log。
- **Access log 遮蔽**：新 log 對 `ticket`、`code`、`state`、`access_token`、`refresh_token`、`id_token` 顯示 `[redacted]`；舊 `.run/web.log.*-pre-redaction` 已清理並維持 600。
- **安全稽核**：正式站以 admin token 觸發 `auth.admin_token` 與 `admin.write`，`GET /api/admin/security-audit` 回傳事件；`security_audit_events` owner 為 `judgment_app`；回應不含 admin token／Bearer。Google login 成功／失敗事件由 pytest 覆蓋，下一次實際登入會寫入。
- **Session 撤銷**：正式站以兩個獨立 `jti` 驗證；`POST /api/auth/logout-all` 回 200／`revoked=all`，兩個舊 token 的 `/api/auth/me` 都變成 `authenticated=false`；無 session 時回 200／`revoked=none`；epoch 由 0 變 1，`auth.logout_all` 已寫入稽核。
- **Chrome／Safari 實機驗收（2026-11-22）**：使用者分別在 Chrome 與 Safari 完成 Google 登入；`security_audit_events` 顯示 2 次 `auth.google_login` success（13:32、13:34 UTC，同一 allowlist 帳號），期間 `PUT /api/admin/demo` 與 `POST /api/admin/demo/close` 成功，並有 1 次 `auth.logout_all` success。最終 demo disabled，匿名 `/api/rag/query` 與 `/api/status` 均為 403。
- **pages.dev 預覽**：Lax 下預覽站與 API 不同 site，預覽登入會失效；已寫入 runbook，production 不受影響。

#### 仍待處理

- **SSE**：ticket `jti` 仍為 in-memory，重啟後最多重新開放 60 秒的 replay 窗口；每次簽發會清除過期項目。
- **INFRA-05**：llama-server host probe 的 DNS rebinding／IP pinning；需要修改 transport，另開批次。
- AUTH-05～08、OPS-01～05 等見第 4 節路線圖。

---

## 9. 變更紀錄

| 日期 | 變更 |
| --- | --- |
| 2026-11-22 | 初次建立；4 面向程式碼審查＋正式站唯讀驗證；列出 2 項 High、12 項 Medium、10 項 Low 與已良好控制。 |
| 2026-11-22 | 修復 SEC-01（分享 token 遙測 redaction）與 SEC-02（demo schema suggest 敏感欄位／路徑封鎖），補回歸測試。 |
| 2026-11-22 | 修復 SEC-03（分享 payload deep scrub）、SEC-04（索引與法規 metadata escape）、INFRA-01（下载档名 basename／archive path 限制），補回歸測試。 |
| 2026-11-22 | 第二批：AUTH-01 demo DB session 隔離、AUTH-02 一次性 SSE ticket、AUTH-03 logout jti 撤銷、AUTH-04 SameSite／logout／admin-token Origin、INFRA-02 備份密碼不進 cmdline、INFRA-03 加密預設 fail-closed、INFRA-04 restore 不自動覆寫 `.env`。 |
| 2026-11-22 | 驗證：demo_reader 負向測試、毒化主連線測試、admin token 關閉／重開、SSE 重播與日誌遮蔽、session 撤銷 DB 檢查、schema dump/restore、加密 fail-closed。Google 實機登入成功；另修補 OAuth code／state access-log 洩漏並清理舊 log。 |
| 2026-11-22 | INFRA-09：主應用改用 `judgment_app`（NOSUPERUSER/NOCREATEDB/NOCREATEROLE），ownership 轉移，完整讀寫與負向測試通過；新增 `app-db-role-runbook.md`。 |
| 2026-11-22 | AUDIT-01 初版：`security_audit_events`、`GET /api/admin/security-audit`、Google login／logout／admin token／admin write 事件；180 天保留；補 pytest。 |
| 2026-11-22 | SESSION-01：session 加入 `sv` epoch、`POST /api/auth/logout-all`、TTL 縮短為 12 小時、無 `sv` 舊 token 拒絕；撤銷狀態讀取 fail closed；補 pytest。正式站 epoch 0→1，舊 cookie 立即失效。 |
| 2026-11-22 | AUDIT-01 強化：未驗證失敗事件每 IP／每日上限、稽核建構／寫入失敗不阻塞請求、只記 path 不記 query string、前端 escape 測試；展示已關閉。 |
| 2026-11-22 | 小規模備份演練：scratch DB schema → `backup.sh` → age 加解密 → checksum → 第二個 scratch DB `pg_restore`，34 tables 成功。 |
| 2026-11-22 | 完整 restore drill：age checksum、PG scratch、Qdrant 4,714,967 points、data 1,404 files SHA-256 全部通過；發現舊備份缺少新 table／indexes，已建立並驗證最新備份 `/Volumes/T500_2TB/judgment-backup-20261122-1500`（157 GB）。 |
| 2026-11-22 | SUP-01／OPS-04：Actions SHA pin、`persist-credentials: false`、`uv sync --frozen`、gitleaks 自訂規則與 negative control、main branch protection；本機全歷史掃描 305 commits、0 leaks。 |
| 2026-11-22 | DATA-01：每日保留維護（performance 90 天、audit 180 天、分享快照 7 天），隱私文案與 `data-retention.md` 同步；備份 90 天輪替列為維運政策。 |
| 2026-11-22 | Chrome／Safari 實機驗收：2 次 Google 登入、管理頁開／關、logout-all；最終 demo disabled，匿名 RAG／status 403。 |
| 2026-11-22 | AUTH-03 收尾：production `AUTH_SESSION_SECRET` fail-fast（至少 32 字元、不得等於 admin token、不可空 fallback）；`--check-config` 與啟動皆驗證。 |
