# 權限、註冊與公開存取覆核意見執行報告

**Status**: Phase 0 進行中（10 點意見已納入；外部驗證、Principal、policy 矩陣、路徑一致性、啟動安全檢查與 staging smoke test 已完成）

**Version**: 0.4

**Last Updated**: 2026-11-19

**Related**:

- [`./evaluation.md`](./evaluation.md)
- [`../008-realtime-event-stream/spec.md`](../008-realtime-event-stream/spec.md)
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)

---

## 1. 執行結論

同事提出的 10 點意見 **全部接受**，沒有需要否決的項目。差異只在落地方式與分期：

| 項目 | 結論 |
| --- | --- |
| 第 1 點：本機 bypass 熱修 | **已實作**，預設關閉；待 production 重啟後驗證 tunnel |
| 第 2 點：Pending 權限 ⊇ Anonymous | 接受；權限矩陣與流程已改 |
| 第 3 點：tunnel 後 per-IP 限流 | 接受；需新增 `client_ip()` 信任規則與 firewall 前提 |
| 第 4 點：SSE 角色分層 | 接受；ticket 需綁 role／topic，長連線需定期重驗 |
| 第 5 點：default-deny 範圍與落地 | 接受；改為 route 層級分類＋啟動時 fail-fast |
| 第 6 點：Google state／PKCE | `state` 已存在並驗證；PKCE 接受，列 Phase 1 |
| 第 7 點：RAG 回饋污染 | 接受；加 request 歸屬、review_status、長度與 escape |
| 第 8 點：預算扣款時機 | 接受；先預扣、後結算、斷線釋放 |
| 第 9 點：待審核上限反向利用 | 接受；改 per-IP／每日與分頁，不用全站總量上限 |
| 第 10 點：個資與保留期限 | 接受；列 Phase 5，上線前提供隱私說明 |

**工時**：原估 Phase 0+1 為 1–2 天過於樂觀。修正為 Phase 0 單獨 1–2 天，整體 **7–10 個開發日**（不含 Phase 0.1 熱修、Google／Turnstile 設定與人工驗收）。

**目前不應做的事**：

- 不先做註冊 UI。
- 不在 Phase 4 前把公開 RAG 直接暴露而沒有 rate limit／預算。
- 不在 v7 索引 copy 期間重啟 production。
- 不只在整個 `/api/*` middleware 比對 path；必須有 route 分類與啟動檢查。

---

## 2. 第 1 點熱修：本機 bypass（已完成程式）

### 2.1 問題

原本 `admin_auth_middleware` 只要 `_is_local_request(request)` 為真就放行所有 API。若 production 由 cloudflared／反向代理從 localhost 轉送，FastAPI 看到的 client 可能是 `127.0.0.1`，遠端請求就會被當成本機管理員。

### 2.2 已完成的修改

| 檔案 | 修改 |
| --- | --- |
| `src/judgment/config.py` | 新增 `allow_local_admin_bypass`，預設 `False`；由 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS` 控制 |
| `src/judgment/web/app.py` | 新增 `_has_forwarded_client_headers()`；bypass 需同時滿足「設定開啟、socket 為本機、沒有 forwarded header」 |
| `.env.example` | 新增 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0` 與 production 說明 |
| `tests/test_web.py` | 新增預設關閉、開發開啟、帶 `X-Forwarded-For` 三種測試 |

### 2.3 行為

| 情境 | 結果 |
| --- | --- |
| Production 預設（`0`） | 本機與遠端都不能靠 socket 位置取得 admin；需 token 或 Google session |
| 直接本機開發（`1`，無 forwarded header） | 可用本機 bypass |
| `1` 但帶 `CF-Connecting-IP`／`X-Forwarded-For`／`Forwarded`／`X-Real-IP` | 不使用 bypass |
| 遠端經 tunnel | 不使用 bypass；走 admin token／Google session |

### 2.4 驗證

- `uv run ruff check src/judgment/config.py src/judgment/web/app.py tests/test_web.py` 通過。
- `uv run pytest -q tests/test_web.py` 通過。
- 尚未重啟 production；目前 v7 copy 正在進行，重啟會影響 API 監控。下次重啟後 MUST 以真實 tunnel 請求確認 `request.client.host` 與 forwarded headers。

### 2.5 殘留工作

- 確認 production 是否只暴露 tunnel，origin 是否可被直連。
- 已確認 uvicorn 使用 trusted proxy headers 解析真實 client IP；重啟後仍需驗證 header 鏈沒有被 Cloudflare Managed Transform 改變。
- 若 origin 可被直連，MUST 以防火牆或 bind localhost 阻擋，否則 forwarded header 仍可被偽造。

### 2.6 外部驗證結果（2026-11-19 12:48 UTC）

從本機對公開網址 `https://api-mbp.ragdemo.win` 發出**不帶任何憑證**的請求；DNS 解析到 Cloudflare，回應標頭為 `server: cloudflare`，確認不是繞過 tunnel 直接打 origin。

| 端點 | 方法 | HTTP | 判定 |
| --- | --- | --- | --- |
| `/api/health` | GET | 200 | 公開健康檢查正常 |
| `/api/status` | GET | 401 | 非公開端點未被 tunnel 繞過 |
| `/api/processing` | GET | 401 | 非公開端點未被 tunnel 繞過 |
| `/api/question-bank/stats` | GET | 401 | 非公開端點未被 tunnel 繞過 |
| `/api/docs` | GET | 401 | 文件未公開 |
| `/api/rag/query` | POST（空 body） | 401 | RAG 目前不是匿名可用 |
| `/api/rag/query/stream` | POST（空 body） | 401 | RAG 串流目前不是匿名可用 |
| `/api/public/summary` | GET | 401 | 尚未實作 |

同時從本機 loopback 直接呼叫 `http://127.0.0.1:9200/api/status` 得到 **200**，證明目前 production 仍是舊版程式、本機 bypass 仍生效；但公開路徑沒有出現 200，代表 cloudflared／tunnel 這條路徑目前沒有被誤判為本機。

**結論**：

- 目前沒有觀察到「管理 API 對全網開放」的漏洞，**不需要緊急重啟**。
- v7 copy 可以繼續；Phase 0.1 熱修仍待下次重啟生效。
- 這個驗證不能取代 Phase 0 的 `client_ip()` 與 firewall 檢查；若之後 tunnel 設定改變，仍可能出現 bypass。
- bypass 判斷取決於應用看到的 socket 與 header，與請求從哪個網路發出無關；本次公開 DNS＋Cloudflare 路徑已足夠，不需要特地用手機熱點重測。重啟後應改測偽造 `CF-Connecting-IP`／`X-Forwarded-For` 與寫入方法。

### 2.7 公開 RAG 現況

外部 POST `/api/rag/query` 與 `/api/rag/query/stream` 在空 body 下都回 **401**，表示目前匿名 RAG **尚未開放**（若已公開，FastAPI 應該先回 422 驗證錯誤，而不是 401）。

因此：

- 不需要在 Phase 4 前緊急加最小版限流。
- 但「匿名可用 RAG」目前也還沒有真正上線；在 Phase 4 的最小限流、預算與 kill switch 完成前，不應直接把它加入 `PUBLIC_QUERY`。
- 若產品要求先開放，MUST 先完成最小版 per-IP 限流＋每日預算＋kill switch，不能只靠 Cloudflare rate limit（Cloudflare 只能限請求數，不能限 token）。

### 2.8 為什麼舊版回 401（已查明）

不需要重啟即可從現有設定與 access log 回答：

- `judgment-web` 以 `--host 127.0.0.1 --port 9200` 啟動。
- `src/judgment/web/app.py` 的 CLI 使用 `uvicorn.run(..., proxy_headers=True, forwarded_allow_ips=args.forwarded_allow_ips)`，預設 `FORWARDED_ALLOW_IPS=127.0.0.1`。
- `~/.cloudflared/config.yml` 的 ingress 是 `http://127.0.0.1:9200`。
- `.run/web.log` 顯示 tunnel 請求的 client 是 `223.143.244.45` 或 `2001:b400:...`，本機請求才是 `127.0.0.1`。

因此 cloudflared 雖然從 loopback 連入，uvicorn 已依 trusted proxy 設定把 `request.client.host` 改寫成真實 client IP；舊版 `_is_local_request()` 看到的是真實 IP，不是 loopback，所以回 401。這是**程式行為（uvicorn proxy headers）＋部署綁定 127.0.0.1** 的組合，不是 cloudflared socket 剛好不是 loopback。

2026-11-19 另做偽造 header 實測：

| 測試 | 結果 |
| --- | --- |
| `CF-Connecting-IP: 127.0.0.1` | Cloudflare 直接回 403（error code 1000，保護標頭） |
| 只帶 `X-Forwarded-For: 127.0.0.1` | 應用回 401，access log 仍是真實 client IP |
| `Forwarded: for=127.0.0.1` | 應用回 401 |
| 無憑證 POST `/api/processing/stop` | 401 |
| 無憑證 DELETE `/api/llama-server/hosts/1` | 401 |
| 未知 `/api/does-not-exist` | 401（不洩漏路由存在與否） |

**設計結論**：`client_ip()` 直接使用 `request.client.host`，不要再次解析 `CF-Connecting-IP` 或 `X-Forwarded-For`；否則會建立第二個可偽造的信任邊界。前提是維持「應用只綁 127.0.0.1」與 `FORWARDED_ALLOW_IPS=127.0.0.1`；任一改變就要重新驗證。已新增 `src/judgment/web/client_ip.py` 與 IPv6 `/64` bucket 測試。

本機 loopback 仍可直接取得管理權（200），這個風險還在；熱修不是不急，而是不必在 copy 中途硬重啟。明確條件：**v7 copy 完成後的第一個維護窗口**重啟，讓 Phase 0.1 熱修生效；若在此之前有安全事件，才提前重啟。

### 2.9 Principal、啟動安全檢查與 staging

已新增 `Principal` 抽象（`src/judgment/web/principal.py`）：

- `kind`：`anonymous`／`pending`／`user`／`admin`／`admin_token`。
- middleware 每個請求解析一次，放進 `request.state.principal`；route policy 決策只看這個物件。
- 目前 Google session 沒有 DB role 時仍視為 active admin，維持現行行為；Phase 1 由 `app_users` 提供 role／status。
- `PUBLIC_QUERY` 另受 `PUBLIC_RAG_ENABLED`（預設 `false`）控制，分類表本身不能開放匿名 RAG。

Policy 決策表已改成資料驅動，測試展開全部 policy × kind：

| Policy | Anonymous | Pending | User | Admin | Admin token |
| --- | --- | --- | --- | --- | --- |
| `PUBLIC_READ`／`PUBLIC_AUTH` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUBLIC_QUERY`（開關開） | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PUBLIC_QUERY`（開關關） | ❌ | ❌ | ❌ | ✅ | ✅ |
| `AUTH_ONLY` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `AUTH_READ`／`AUTH_QUERY`／`SELF_WRITE` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `ADMIN_ONLY`／`ADMIN_WRITE` | ❌ | ❌ | ❌ | ✅ | ✅ |

路徑一致性：

- middleware 會先 percent-decode、合併重複斜線，再用 policy 查詢；API 前綴判斷不分大小寫。
- `policy_for()` 現在支援 route pattern（例如 `/api/question-bank/items/{item_id}`），不是只比對完整字串。
- 未知路徑、尾斜線、大小寫變形、重複斜線一律 default deny。
- 測試會對全部已註冊 route 產生具體 URL，驗證公開／受保護邊界，並另外測 `//api/status`、`/%61pi/status`、`/API/status`、參數路由等變形。

啟動安全檢查（`src/judgment/web/runtime_security.py`）：

- 非 loopback bind 預設拒絕啟動；只有 `JUDGMENT_ALLOW_PUBLIC_BIND=1` 可例外。
- `FORWARDED_ALLOW_IPS` 含 `*` 拒絕啟動。
- local bypass 與非 loopback bind 同時開啟時拒絕啟動。
- `create_app()` 也會拒絕 `FORWARDED_ALLOW_IPS=*`。

Staging：

- 新增 `scripts/smoke_test_web.sh`，在 9202 起第二個 instance，使用 `JUDGMENT_DISABLE_BACKGROUND_TASKS=1`、`AUTO_CREATE_SCHEMA=0`、`JUDGMENT_POWER_AGENT=0`，不啟動 event socket／warmers／migration。
- 2026-11-19 已實際跑過：`smoke test passed on http://127.0.0.1:9202`。
- 重啟步驟、local caller 盤點與 header 驗收見 [`restart-checklist.md`](./restart-checklist.md)。

---

## 3. 十點意見逐項可行性

### 3.1 第 1 點：bypass 應為獨立熱修

**判定：接受，已完成。**

- 不再把 bypass 放在 Phase 0 第 4 步；Phase 0.1 先完成。
- Phase 0 只保留「tunnel／client IP 驗證」與測試，不重新設計 bypass。
- Production 完全關閉；只保留 `JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=1` 給 direct local development。

**驗收**：預設 `0` 時本機管理 API 401；`1` 且無 forwarded header 時可用；任何 forwarded header 存在時不可用。

---

### 3.2 第 2 點：Pending 權限應 ⊇ Anonymous

**判定：接受。**

- Pending 建立受限 session，但可使用所有 `PUBLIC_READ`／`PUBLIC_QUERY`：首頁、公開 RAG、公開摘要、法規目錄。
- Pending 額外可呼叫 `GET /api/auth/me`、`GET /api/auth/application`、`POST /api/auth/logout`。
- Pending 不可使用 `AUTH_READ` 詳細頁、`SELF_WRITE`、`ADMIN_WRITE`、SSE。
- 申請審核中不再被鎖在一個什麼都不能看的頁面。

**驗收**：pending 使用者可完成首頁與 RAG 問答；呼叫 `/api/status`、`/api/processing`、回饋、管理 API 皆被拒絕；申請狀態頁可正常顯示。

---

### 3.3 第 3 點：tunnel 後 per-IP 限流

**判定：接受；拓樸已從設定與 access log 查明。**

- 新增單一 `effective_client_ip()`：直接使用 `request.client.host`。
  - 2026-11-19 已確認 `judgment-web` 使用 `proxy_headers=True`、`FORWARDED_ALLOW_IPS=127.0.0.1`、bind `127.0.0.1`，uvicorn 已把真實 client IP 寫入 `request.client.host`。
  - 不要再次解析 `CF-Connecting-IP` 或 `X-Forwarded-For`，避免第二個可偽造的信任邊界。
  - 前提是 origin 只綁 loopback 且只接受 tunnel；若 bind 或 `FORWARDED_ALLOW_IPS` 改變，MUST 重新驗證。
- 以 keyed HMAC 計數，不長期保存原始 IP；`client_ip_key()` 將 IPv6 正規化為 `/64` bucket，`hashed_client_ip_key()` 使用伺服器密鑰。
- 若 origin 可被直連，MUST 以防火牆／bind localhost 阻擋。
- Per-IP：分鐘／小時／日限制、併發限制。
- 已登入者除 IP 外另加 per-user 限制，避免校園／公司共用出口 IP 時誤傷正常使用者。
- 全站每日 token 預算；匿名與已登入使用**不同預算池**，匿名池耗盡時登入者仍可使用。Pending 應共用匿名池或使用獨立小池，不能因「已登入」取得額外額度。
- `/api/rag/query` 與 `/stream` 共用同一套限制。

**驗收**：偽造 `X-Forwarded-For`／`Forwarded` 不改變計數；`CF-Connecting-IP` 由 Cloudflare 保護；IPv6 同一 `/64` 共用額度；直連 origin（若存在）被拒；429 含 `Retry-After`。

---

### 3.4 第 4 點：SSE 角色分層與長連線撤銷

**判定：接受；這是 10 點中唯一需要新增較多機制的項目。**

- 匿名與 pending 不發 SSE ticket。
- Ticket 綁 `user_id`、`role`、允許 topic、短 TTL；不再讓任何有效 ticket 訂閱所有 topic。
- User 只可訂閱唯讀 topic；admin 可全部。
- SSE 連線以「使用者狀態版本號變更」觸發重驗，不需要每 60 秒全量查 DB；仍需保留最長重驗間隔（建議 60 秒）作為保險。
- 停用或角色變更 MUST 主動關閉既有連線；單 process 可直接通知，多 process 需共用 pub/sub 或 DB 版本通知。
- `POST /api/auth/sse-ticket` 只允許 active user／admin。

**驗收**：anonymous／pending 取得 ticket 被拒；user 訂閱 admin-only topic 被拒；停用使用者既有 SSE 在一個重驗週期內斷線；admin 可收到 `auth` 通知；多 process 下停用也會斷線。

---

### 3.5 第 5 點：default-deny 範圍與落地

**判定：接受，且調整為比原報告更嚴格的實作。**

- 範圍不只 `/api/*`：`/api/docs`、`/api/openapi.json`、SSE、靜態路徑、frontend 入口都要進分類表。
- `/api/docs`、`/api/openapi.json` production 關閉或 admin-only。
- 用 FastAPI route／router 層級 `Depends` 或 metadata 分類；middleware 只作 defense-in-depth。
- 應用啟動時列舉所有 route；未分類即拒絕啟動。
- 測試列舉 `app.routes` 全部 method route；未分類失敗。
- `PUBLIC_READ` 不得允許寫入 method；RAG 的 POST 目標分類是 `PUBLIC_QUERY`，但 Phase 4 完成前在 `route_policies.json` 暫列 `ADMIN_ONLY`，只允許查詢語意且必須限流。

**驗收**：新增一條未分類路由時啟動失敗；測試失敗；`/api/docs` 匿名不可讀；`PUBLIC_QUERY` 只限 RAG 查詢路徑；所有 method 都有政策。

---

### 3.6 第 6 點：Google state 與 PKCE

**判定：部分已存在；PKCE 接受。**

- 目前 callback 已產生並驗證 signed `state` cookie，並驗證 `email_verified`；不是完全沒有 CSRF 防護。
- 補 PKCE：`code_challenge`、`S256`、`code_verifier` 存在 state cookie，換 token 時帶入。
- State cookie 的簽章只保證完整性，不等於加密；`code_verifier` 應放在 HttpOnly、短效、單次使用的 cookie，或改存伺服器端。若放 cookie，建議加密或使用伺服器端 session，避免外洩後被重放。
- 繼續使用 Authorization Code flow；不新增前端 ID token 信任路徑。
- 以 `google_sub` 作身分，email 只作顯示與 bootstrap。

**驗收**：state 不符／缺少時拒絕；PKCE verifier 不符時拒絕；`email_verified=false` 拒絕；同一 email 改 `sub` 不會接管舊帳號。

---

### 3.7 第 7 點：RAG 回饋污染與歸屬

**判定：接受。**

- `rag_feedback` 綁 `user_id` + `request_id`。
- 後端驗證 request 屬於目前使用者；不能對他人 request 回饋。
- `review_status`：`new | reviewed | accepted | rejected`；不自動進評估集或訓練資料。
- comment 長度上限（建議 2,000 字）；輸出 escape，避免儲存型 XSS。
- Anonymous／pending 不可回饋。

**驗收**：A 使用者不能對 B 的 request 回饋；超長 comment 被拒；HTML／script 內容以文字顯示；未 accepted 的回饋不出現在評估集。

---

### 3.8 第 8 點：預算扣款時機與斷線

**判定：接受。**

- 串流開始先依 `prompt tokens + max_output_tokens` 預扣。
- 結束後依實際 usage 結算；沒有 usage 時保留保守估計。
- `finally` 釋放併發與未使用預留；client disconnect 也要釋放。
- 計數器原子遞增、每日重置、持久化。
- 若模型在本機 GPU 執行，真正瓶頸是延遲與併發，不是雲端費用；`RagAdmission` 與 `LLM admission` 的併發／佇列限制仍是第一道保護，預算機制 MUST NOT 讓兩者互相等待或重複扣款。

**驗收**：提早斷線不鎖死額度；超額請求 429；跨 process／重啟後計數不歸零；每日重置正確；併發與預算同時到頂時回傳一致且可理解的錯誤。

---

### 3.9 第 9 點：待審核上限被反向利用

**判定：接受。**

- 不以全站 pending 總數作唯一上限。
- 改用每 IP／每日申請數、同帳號冷卻、rejected 冷卻。
- badge 只顯示數字；清單分頁。
- 管理員可拒絕／停用；不因大量申請而無法處理真正申請者。
- Turnstile 從「可選」升級為「建議」，特別是匿名 RAG 與申請表單；可有效降低低成本耗盡預算與灌申請。

**驗收**：大量申請不會讓新申請者被永久擋住；badge 數字正確；列表可分頁；重複申請受冷卻限制。

---

### 3.10 第 10 點：個資與保留期限

**判定：接受，列 Phase 5，但 privacy notice 必須在上線前完成。**

- 只保存必要的 Google 顯示資料（email、name、picture）。
- 提問內容、回饋、audit、IP hash 訂保留期限；到期刪除或匿名化。
- 提供簡短隱私說明：蒐集目的、保存期限、管理員可見範圍、刪除申請方式。
- Audit 不可由一般 API 修改；保留期限另訂。

**驗收**：文件可公開取得；保留期限有排程或手動程序；使用者可提出刪除；公開摘要與 log 不含不必要的個資。

### 3.11 實際 token 用量（2026-11-19 量測）

從 production `performance_records.flow` 的 `rag.llm_request` 取出最近 90 天、有 usage 的 301 筆成功 RAG 記錄：

| 指標 | P50 | P95 | 最小值 | 最大值 | 平均 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 每題總 tokens（input + output） | 2,809 | 4,096 | 1,671 | 5,216 | 3,012 |
| Input tokens | 2,635 | 3,960 | 1,568 | 5,011 | 2,817 |
| Output tokens | 191 | 300 | 38 | 384 | 194 |

結論：

- 原報告用 5,000 tokens／題是偏保守估計；實際 P50 約 2,809、P95 約 4,096。
- 每日 2,000,000 tokens 約可容納 P50 約 712 題、P95 約 488 題。若 per-IP 每日 25 題 × 2,809 tokens ≈ 70,000 tokens，約 **28 個 IP** 就能耗盡全站預算；因此單靠 per-IP 上限不夠，必須搭配匿名／登入分池與 Turnstile。
- 這 301 筆只是有 usage 的成功記錄；測試問題通常比公開使用者短，失敗、逾時、中途斷線的請求也可能消耗 token 但沒有完整 usage。上線前兩週應保留較大安全邊際，並用真實流量重算。
- 正式上限應在 Phase 4 前用同一份資料重算，並把 P50／P95、429 次數、預算曲線與被擋 IP 數放進 admin 狀態頁。

---

## 4. 七個待決事項的最終建議

| # | 項目 | 建議 | 狀態 |
| --- | --- | --- | --- |
| 1 | 公開摘要範圍 | 只做首頁、法規目錄、聚合統計；各分頁不放即時數據 | 採納 |
| 2 | User 匯出 | 先移除匯出；題庫唯讀保留 | 採納 |
| 3 | RAG 預算單位 | 以 token 為主、請求數為輔；先保守值，一週後調整 | 採納 |
| 4 | Anonymous 回饋 | 不可回饋；回饋需 User 以上 | 採納 |
| 5 | 核准 UI 位置 | 右上角 badge＋選單入口，完整管理放 `#/status` | 採納 |
| 6 | Bootstrap 名稱 | `GOOGLE_BOOTSTRAP_ADMIN_EMAILS`，只在 DB 沒有 admin 時生效 | 採納 |
| 7 | 本機 bypass | Production 完全關閉 | 採納並已熱修 |

---

## 5. 修訂後執行計畫

### Phase 0.1：熱修（已完成程式）

- 關閉 production 本機 bypass。
- forwarded header 防護。
- 測試與文件。
- **待辦**：下次 production 重啟後驗證真實 tunnel；不要在 v7 copy 期間重啟。

### Phase 0：權限骨架（1–2 天）

**本次已完成（骨架）**：

- `scripts/generate_route_policies.py` 從 `app.routes` 產生分類草稿；新路由預設 `ADMIN_ONLY`。
- `src/judgment/web/route_policies.json` 已進版控，涵蓋 118 個 route key（114 個 method route＋docs／static）。
- `src/judgment/web/route_policy.py` 提供載入、查詢、route 列舉與啟動驗證。
- 路由列舉涵蓋 `APIRoute`、Starlette `Route`、`Mount`（含子 app 遞迴）與 `WebSocketRoute`；orphan key 會被偵測。
- lifespan 啟動時驗證所有 route；未分類或 stale 即拒絕啟動。
- `/docs/oauth2-redirect` 已納入 admin/session 保護。
- 測試涵蓋 route policy 完整性、預設拒絕、`/docs/oauth2-redirect` 非公開。
- **Principal 抽象**：middleware 每個請求解析一次 `request.state.principal`；目前 Google session 仍視為 admin，Phase 1 由 `app_users` 提供 role／status。
- **Policy 決策表**：`PUBLIC_*`、`AUTH_ONLY`、`AUTH_READ`／`AUTH_QUERY`／`SELF_WRITE`、`ADMIN_ONLY`／`ADMIN_WRITE` 已用資料表展開全部 principal kind；`PUBLIC_QUERY` 另受 `PUBLIC_RAG_ENABLED` 控制。
- **路徑一致性**：percent-decode、合併重複斜線、API 前綴不分大小寫；`policy_for()` 支援 route pattern（含 `{param}`），未知／變形路徑 default deny。
- 受保護 route 的無憑證 GET／POST／DELETE 與未知 `/api/*` 均回 401；公開端點正常；`HEAD` 正規化為 `GET` policy。
- 全部 route × method 的公開／拒絕邊界測試已加入；另外測 `//api/status`、`/%61pi/status`、`/API/status`、參數路由與 OPTIONS preflight。
- `src/judgment/web/client_ip.py`：`effective_client_ip()` 使用 uvicorn 已解析的 `request.client.host`；`client_ip_key()` 提供 IPv6 `/64` bucket 與 IPv4-mapped IPv6 正規化；`hashed_client_ip_key()` 使用 keyed HMAC。
- `src/judgment/web/runtime_security.py`：非 loopback bind、`FORWARDED_ALLOW_IPS=*`、bypass 與公開 bind 同時開啟時拒絕啟動。
- `scripts/smoke_test_web.sh` 已在 9202 完成 staging：不啟動 event socket／warmers／migration，公開與 admin 邊界測試通過。
- 實測偽造 `CF-Connecting-IP` 被 Cloudflare 403 阻擋；偽造 `X-Forwarded-For`／`Forwarded` 不改變 client IP。

**待完成**：

1. `app_users` 與 Phase 1 session 流程，讓 `pending`／`user` 真正由 DB 解析；目前 policy 表已支援，但 runtime 只會產生 anonymous／admin／admin_token。
2. SSE ticket 綁 role／topic；長連線重驗。
3. `/api/docs`、`/api/openapi.json` production 關閉或 admin-only 的最終開關。
4. 將 `PUBLIC_READ`／`PUBLIC_AUTH` 與實際前端按鈕狀態對齊。

**Gate**：未分類路由會讓啟動與測試失敗；anonymous 無法呼叫任何受保護 API；公開端點維持可用。

### Phase 1：使用者資料與 session（1.5–2 天）

1. `app_users`、`app_user_audit`、migration。
2. `GOOGLE_BOOTSTRAP_ADMIN_EMAILS` 一次性 bootstrap。
3. `read_session` DB 回查 status／role。
4. Pending／active／rejected／disabled 流程。
5. Pending session 權限 ⊇ Anonymous。
6. PKCE。

**Gate**：pending 可看首頁／RAG／申請狀態；active user 可唯讀；停用立即失效。

### Phase 2：核准與通知（1 天）

1. Admin 使用者管理 API。
2. 最後 admin 保護與 audit。
3. `/api/auth/me` pending count。
4. 右上角 badge、帳號選單、`#/status` 使用者管理。

**Gate**：申請→badge→核准→使用者生效；所有操作有 audit。

### Phase 3：公開唯讀與前端鎖定（1.5–2 天）

1. `GET /api/public/summary`。
2. Anonymous 只載入公開摘要。
3. User 詳細唯讀、按鈕 disabled。
4. Auth state／canWrite／isAdmin／isPending。
5. Pending 申請狀態頁。

**Gate**：未登入看不到主機／處理細節；按鈕 disabled 與 API 拒絕一致。

### Phase 4：公開 RAG 保護（1–1.5 天）

1. Per-IP 限流（IPv6 `/64`）、per-user 限制、匿名／登入分池、每日 token 預算、kill switch。
2. `/stream` 同步限制、預扣／結算／斷線釋放。
3. 問題與 token 上限。
4. 429／預算用盡 UI 與 admin 監控曲線。
5. Turnstile 建議預設啟用（至少匿名 RAG 與申請表單）。

**Gate**：偽造 header 不影響限流；斷線不鎖額度；預算到頂可立即停止匿名提問；429、預算曲線與被擋 IP 數可觀測。

> 目前匿名 RAG 尚未開放（2026-11-19 實測 401）。若產品決定提前開放，MUST 先完成本階段的最小版，不能只靠 Cloudflare rate limit；Cloudflare 只能限請求數，不能限 token。未來即使 route policy 改成 `PUBLIC_QUERY`，仍需受 `PUBLIC_RAG_ENABLED`（預設 `false`）這個獨立 kill switch 控制。

### Phase 5：回饋與 hardening（1 天）

1. RAG 回饋與 request 歸屬。
2. review_status 與 admin 檢視。
3. CSRF／audit／session 撤銷／最後 admin 競態測試。
4. 隱私說明與保留期限。
5. 文件與驗收。

**Gate**：不能對他人 request 回饋；XSS 文字化；隱私文件可取得；完整測試通過。

---

## 6. 驗收清單

### 6.1 後端

- [ ] 所有 route 都有分類；未分類時啟動失敗。
- [ ] anonymous／pending／user／admin × GET／POST／PATCH／DELETE 矩陣通過。
- [ ] 本機 bypass 預設關閉；forwarded header 存在時停用。
- [ ] `client_ip()` 不被任意 `X-Forwarded-For` 影響。
- [ ] `/api/docs`、`/api/openapi.json` 匿名不可讀。
- [ ] SSE ticket 綁 role／topic；停用使用者連線會斷。
- [ ] RAG 串流與一般查詢共用限流與預算。
- [ ] 回饋 request 歸屬驗證。
- [ ] 最後一位 admin 不可降級／停用。
- [ ] 所有管理操作寫 audit。

### 6.2 前端

- [ ] Anonymous：首頁／RAG 可用；其他分頁只有公開摘要；寫入按鈕 disabled。
- [ ] Pending：首頁／RAG／公開摘要可用；申請狀態可見；詳細頁與寫入 disabled。
- [ ] User：詳細頁唯讀；管理／處理／匯出 disabled。
- [ ] Admin：全部功能可用；badge 與使用者管理可見。
- [ ] 390px 無水平 overflow；console error 0。
- [ ] disabled 不只靠前端；直接呼叫 API 仍被拒。

### 6.3 Production

- [ ] 重啟後以真實 tunnel 驗證 client host／forwarded headers。
- [ ] 匿名 RAG 開放前，先完成最小版限流、每日預算與 kill switch（目前實測尚未開放）。
- [ ] v7 索引 copy 完成後才安排重啟／部署。
- [ ] 部署後檢查 SSE、RAG 串流、admin badge、pending 流程。
- [ ] admin 狀態頁可看到 429、預算曲線與被擋 IP 數。

---

## 7. 風險與待確認

1. **Proxy header 鏈仍可能被改變**：目前 uvicorn 已解析真實 client IP，但若 Cloudflare 啟用「Remove visitor IP headers」、`FORWARDED_ALLOW_IPS` 改成 `*`、或 bind 改成非 loopback，風險會回來。已加啟動檢查與 `suspicious proxy chain` warning；重啟後仍要用偽造 header 回歸。
2. **Origin 直連尚未完全排除**：應用已 bind `127.0.0.1`，但仍要確認 firewall／其他轉送沒有開放 9200。
3. **匿名 RAG 尚未開放**：2026-11-19 實測 `/api/rag/query` 空 body 回 401；route policy 也維持 `ADMIN_ONLY`。這代表目前沒有立即的公開成本風險，但產品要求的匿名 RAG 也還沒真正上線。
4. **重啟時機**：v7 copy 正在進行；Phase 0.1 程式雖已完成，但重啟要等 copy 完成或另開維護窗口，避免影響索引與監控。
5. **DB 回查成本**：每次請求回查 `app_users` 會增加 DB 負載；需要用短 TTL cache＋停用時主動失效，不能只靠 cache。
6. **SSE 長連線重驗**：以狀態版本變更觸發重驗比每 60 秒全量查 DB 好；但停用必須有主動斷線，多 process 需共用通知機制。
7. **SQLite 併發**：若使用 SQLite 存 counters／users，需確認 WAL 與多 process 寫入；多 instance 時改用共享 DB。
8. **Admin token 的 break-glass 風險**：token 一旦洩漏即完整管理權；需常數時間比較、audit、定期更換，且不進前端。
9. **工時**：7–10 天是依目前 100 個 path 與前端 action 的估計；public summary 欄位與 SSE 重構可能再增加。
10. **參數仍需用實際流量校準**：目前以 301 筆有 usage 的成功記錄估算 P50/P95；上線後要用 429 曲線、預算消耗與實際併發重新調整。

---

## 8. 已核定與待執行

已由 2026-11-19 覆核確認：

1. Phase 0 先做，單獨估 1–2 天。
2. 保留期限以 90／365／730／180 天為起點。
3. Production 目標配置：cloudflared 與應用同機、應用只綁 `127.0.0.1`、防火牆不開放應用埠。
4. 若 RAG 已公開，Phase 4 前先做最小版限流；目前實測尚未公開。
5. v7 copy 完成前不重啟 production；Phase 0.1 熱修待下次重啟生效。

後續仍需確認：

- `request.client.host` 與 header 行為已從設定與 access log 查明；重啟後再以偽造 header 做一次回歸。
- origin 是否只能由 tunnel 存取；目前應用 bind `127.0.0.1`，仍需確認 firewall 沒有其他轉送。
- 匿名／登入預算池比例、per-IP 與 per-user 上限的最終數值（Phase 4 前）。

---

## 9. 本次變更清單

- `.env.example`：`JUDGMENT_ALLOW_LOCAL_ADMIN_BYPASS=0`、`PUBLIC_RAG_ENABLED=0`、`JUDGMENT_DISABLE_BACKGROUND_TASKS=0` 與 public-bind 例外說明。
- `src/judgment/config.py`：`allow_local_admin_bypass`、`public_rag_enabled`、`disable_background_tasks`。
- `src/judgment/web/app.py`：bypass 預設關閉、forwarded header 防護；lifespan 啟動時檢查 route policy；middleware 依 policy 與 `Principal` 區分公開／受保護 route；路徑正規化；`/docs/oauth2-redirect` 納入保護。
- `src/judgment/web/principal.py`：`Principal`、session role/status 映射、policy × kind 決策表、`PUBLIC_QUERY` kill switch。
- `src/judgment/web/runtime_security.py`：非 loopback bind、`FORWARDED_ALLOW_IPS=*`、bypass 與公開 bind 的啟動檢查。
- `src/judgment/web/route_policy.py`：route policy 載入、pattern 查詢、route 列舉（Mount／WebSocket）與啟動驗證。
- `src/judgment/web/route_policies.json`：118 個 route key 的分類表。
- `src/judgment/web/client_ip.py`：`effective_client_ip()`、IPv6 `/64` bucket、IPv4-mapped IPv6、keyed HMAC、broken proxy-chain 偵測。
- `scripts/generate_route_policies.py`：從 `app.routes` 產生／補齊分類草稿。
- `scripts/smoke_test_web.sh`：9202 staging smoke test；不啟動 event socket／warmers／migration。
- `scripts/rag_query_benchmark.py`、`scripts/real_question_audit.py`：支援 `--admin-token`／`JUDGMENT_ADMIN_TOKEN`。
- `tests/test_web.py`：bypass、route policy、binary 權限、路徑變形、全 route 邊界、OPTIONS preflight、smoke instance 測試。
- `tests/test_principal.py`：policy × kind 表格驅動測試。
- `tests/test_client_ip.py`：client IP、IPv6、HMAC、proxy-chain 測試。
- `tests/test_runtime_security.py`：bind／forwarded／bypass 啟動檢查。
- `tests/test_route_policy.py`：Mount／WebSocket 列舉測試。
- `tests/test_processing.py`：測試 fixture 明確開啟 local bypass。
- `specs/011-auth-registration/evaluation.md`：更新至 v0.6，納入 10 點、七項決策與實測結果。
- `specs/011-auth-registration/restart-checklist.md`：重啟前 local caller 盤點、staging、header 驗收與回滾。
- `specs/011-auth-registration/execution-report.md`：本報告。

> 本報告已涵蓋熱修、外部驗證、Phase 0 路由分類、Principal 與 binary 權限強制；四角色 runtime、註冊 UI、公開摘要、SSE topic 與公開 RAG 保護尚未完成，將依 Phase 0–5 繼續推進。
