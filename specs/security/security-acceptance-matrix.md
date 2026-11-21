# Judgment Security Acceptance Matrix v1.0

- 日期：2026-11-18
- 原則：程式有防護不等於部署已驗收；每一列都要有可重現證據
- 目前唯一已確認的真實暴露：**x570 四個 AI 服務的區網存取**。2026-11-17 已套用 UFW：移除 11434 與 SMB 139/445，11435–11437 只允許 `tailscale0`。MBP 端 LAN 拒絕、Tailscale allow、完整 sudo UFW 驗證與套用後重開機持續性均已通過；第二台設備仍待測。Cloudflare tunnel 已於 2026-11-18 上線，`api-mbp.ragdemo.win` 的 Access application 已移除，改由 FastAPI 的 admin token／Google session 驗證；公開 origin 的受保護 API 無憑證時回 401。
- 狀態定義：
  - `not_started`：尚未實作或尚未開始驗證
  - `implemented`：程式／設定已存在，尚無部署實測
  - `verified`：有可重現測試或外部實測證據
  - `accepted`：負責人看過證據並簽核

## 1. 攻擊面與驗收條件

| ID | 攻擊面 | 驗收條件 | 必要證據 | 狀態 | 負責角色 |
|---|---|---|---|---|---|
| NET-01 | x570 Ollama 11434／AI 服務 | 未授權區網與公網無法存取 | 防火牆規則 + 第二台設備 + 手機行動網路失敗紀錄 | `implemented`（完整 sudo UFW／重開機／MBP LAN 拒絕已驗證；第二台設備待測） | Infra／x570 sudo |
| NET-02 | x570 llama-server 11435／11436／11437 | 只允許應用主機／管理設備 | 同上；若加 `--api-key`，應用端與 health check 均帶 Bearer | `implemented`（完整 sudo UFW／重開機／MBP LAN 拒絕已驗證；第二台設備待測） | Infra／工程 |
| NET-03 | MBP 本機 Ollama 11434（目前已停用） | 只綁 127.0.0.1／::1，不得 listen `*` | `lsof` 顯示 127.0.0.1:11434；LAN IP `nc` 失敗；loopback API 200 | `verified`（目前無 listener） | 工程／本機管理 |
| NET-04 | 本機 listener 回歸 | Judgment 相關 ports 不得非 loopback；`up.sh` 啟動前失敗即拒絕啟動 | `bash scripts/security_listener_check.sh` 無 FAIL；`up.sh` 兩處 gate | `verified`（每次開機／部署重跑） | 工程 |
| NET-05 | 第三方本機服務（Logi Options+） | 更新或移除；macOS 應用程式防火牆開啟 | `logioptionsplus_agent` version；`socketfilterfw` state；非 loopback listener | `not_started`（目前 listener `*:59869`、防火牆關閉） | 使用者／本機管理 |
| NET-06 | MBP llama-server fallback 11436／11437 | 只綁 loopback；x570 不可用時可接手 chat／embedding | `lsof` 顯示 `127.0.0.1:11436`／`11437`；`/health`、`/v1/models`、fallback 實測 | `verified` | 工程 |
| CF-01 | Cloudflare 公開入口 | 公開 origin 可達，但受保護 API 無 session／token 一律拒絕；CORS 只回白名單 origin | 公開 GET／POST 401、evil Origin 無 ACAO、正式 Origin preflight 200 | `verified`（Access 已移除；2026-11-18 公開實測） | Cloudflare admin／工程 |
| CF-02 | 公開 origin 的應用層驗證 | GET 與寫入 API 都不可無 token／session 取得或修改 | 公開 `/api/status`、`/api/processing`、`/api/system-usage`、`/api/ollama/hosts` GET 401；`POST /api/processing/update` 401 | `verified`（抽樣 4 個 GET + 1 個 POST；Access 不再使用） | 工程 |
| CF-03 | cloudflared origin | tunnel 實際執行位置與 origin 正確 | `cloudflared` process／config、公開 `/api/health` 200、origin request 紀錄 | `verified`（LaunchAgent 執行中；origin `127.0.0.1:9200`；Access 已移除） | Infra |
| WEB-01 | 跨站 loopback 寫入 | 跨站 POST／PUT／PATCH／DELETE 被拒絕 | Origin／Sec-Fetch-Site 測試與 curl 證據 | `verified` | 工程 |
| WEB-02 | Host header／DNS rebinding | 未列入白名單 Host 回 400 | `Host: evil.example` 400；localhost／公開網域含 port 測試 | `verified` | 工程 |
| WEB-03 | CORS `null`／file:// | 預設不允許 file:// 讀取或寫入 | `Origin: null` GET 無 ACAO；POST 403 | `verified` | 工程 |
| WEB-04 | SQL LIKE wildcard | `%`、`_`、`\`、`%%`、空字串不擴大查詢 | scope probe／keyword list wildcard regression tests | `verified` | 工程 |
| XSS-01 | 問題／案由／JID／LLM 答案 XSS | payload 不執行，URL 只允許 http(s) | 無頭瀏覽器注入測試、`safeUrl()` 測試 | `not_started` | Frontend |
| HDR-01 | Security headers／CSP | 所有 HTML／API 回應有指定 headers；CSP 不破壞功能 | header curl、Report-Only、瀏覽器 console 無違規 | `not_started` | 工程 |
| BAK-01 | 備份明文 | `.env` 不進備份；敏感資料加密 | 備份內容清單、age 加密檔、無明文 secrets | `not_started` | Infra |
| BAK-02 | Restore drill | 可從加密備份完整還原並驗證 DB／Qdrant | 實際 restore 報告、checksum、資料筆數差異 0 | `not_started` | Infra |
| ABUSE-01 | 昂貴 RAG 端點 | 無限制消耗被限制 | 429／Retry-After、併發測試 | `not_started` | 工程 |
| AUTH-01 | Actor 身分可信 | actor 由驗證層產生，不信任使用者 header | 遠端／本機 actor 測試、audit log | `not_started` | 工程 |
| AUTH-02 | 題庫狀態機 | 不可直接建立／更新為 accepted | 狀態轉換 API 測試、角色矩陣 | `not_started` | 工程／法律審閱 |
| AUTH-03 | Google 帳號登入 | 僅 allowlist 內且 email_verified 的 Google 帳號可取得管理員 session；state／CSRF／cookie 安全 | OAuth start／callback、allowlist 拒絕、HttpOnly／SameSite、remote session 測試 | `implemented`（程式與自動測試完成；Google Cloud 實機待設定） | 工程 |
| DATA-01 | RAG 問題與答案保留 | 有保留天數與遮罩 | retention job／DB policy／備份清單 | `not_started` | PM／工程 |
| SUP-01 | 供應鏈 | 依賴與 image 可重現、無高風險 CVE | pip-audit、SBOM、digest pinning、npx 固定版 | `implemented`（CI／Dependabot／SBOM／digest／esbuild pin；pyarrow 與 pytest 兩個 advisory 已記錄並暫時 ignore） | 工程 |
| HIST-01 | Git history | push 前 history 搜不到公開網域與內部連接埠；不含憑證 | `git log -S`／`git log -p` 掃描；目前只有工作樹 redact，歷史仍有 host/ports | `partial` | 工程 |

## 2. 目前已驗證的證據

```text
公開 /api/health                        → 200（Access 已移除；CF-03）
公開 /api/status／processing／system-usage／ollama/hosts → 401（應用層驗證）
公開 POST /api/processing/update        → 401
公開 Origin: https://judgment.ragdemo.win OPTIONS /api/query → 200；ACAO 與 credentials 正確
公開 Origin: https://evil.example GET /api/health → 200，但無 ACAO
本機 + X-Forwarded-For: 203.0.113.9     → 401（origin 要求 token）
本機 Host: evil.example                 → 400（TrustedHost）
本機 Origin: null + POST                → 403
本機 Origin: null + GET /api/health     → 200，但無 ACAO
本機 Origin evil + POST                 → 403
本機 Sec-Fetch-Site: cross-site + POST  → 403
本機 curl 無 Origin／Sec-Fetch           → 200（CLI 信任）
MBP Ollama                                → 未執行；11434 無 listener
MBP llama-server fallback                 → 127.0.0.1:11436／11437；health 200；fallback 實測成功
MBP Logi Options+                         → *:59869；macOS firewall disabled
x570 UFW（2026-11-17 21:18–21:24）         → 11434、139/445 已移除；11435–11437 只允許 tailscale0（v4/v6）
MBP → x570 LAN 11434–11437                → timeout；x570 kernel 記錄 [UFW BLOCK]（IN=wlp4s0，DPT=11434–11437）
MBP → x570 Tailscale 11435–11437          → TCP open；/health 200；11434 refused
MBP Tailscale／MagicDNS                    → BackendState=Running；x570 解析為 100.64.0.0/10；peer active/direct
x570 UFW 套用後重開（21:32:55）            → boot_id 改變；三個 unit 14 秒後自動 active、NRestarts=0；ufw/tailscaled enabled+active
重開後 MBP → x570 LAN 11434–11437          → 仍 timeout；kernel 仍有 [UFW BLOCK]；Tailscale 11435–11437 /health 200
x570 完整 sudo 驗證（21:37）               → pass=54 fail=0 warn=1；UFW status／numbered 與預期規則一致
Google OAuth（2026-11-18）                  → /api/auth/me、state cookie、callback allowlist、HttpOnly session、remote admin session、Origin 拒絕測試通過；Google Cloud client 尚未設定
Cloudflare Pages（2026-11-18）               → `main` @ `73b6806` 自動部署成功；`judgment.ragdemo.win` 200；`config.js` 的 `apiBase` 為 `https://api-mbp.ragdemo.win`；舊拼字 `judement.ragdemo.win` 已無 DNS
cloudflared（2026-11-18）                     → LaunchAgent `com.cloudflare.cloudflared` running；origin `127.0.0.1:9200`；4 條 tunnel connection；公開 `/api/health` 200；Access application 已移除
MBP Web 自動啟動（2026-11-18）                → LaunchAgent `com.judgment.web` 已安裝；冷啟動測試殺掉 `judgment-web` 後 kickstart，13 秒內 `/api/health` 恢復 200
```

測試：

```text
499 tests pass
ruff clean
```

## 3. 尚未完成的外部驗收

1. **x570 網路隔離**：MBP 端 LAN 拒絕（含 `[UFW BLOCK]`）、Tailscale allow、完整 sudo UFW 驗證與套用後重開機持續性已驗證；仍需第二台設備失敗證據。手機行動網路應測 `api-mbp.ragdemo.win` 的公開入口，但 x570 模型埠不可從公網直達。
2. **Google Cloud OAuth client**：建立 Web application client、填入正確 redirect URI 與 `GOOGLE_CLIENT_ID`／`GOOGLE_CLIENT_SECRET`，完成一次真實 Google 登入；自動測試只涵蓋程式流程，沒有 Google 實機憑證。
3. **XSS**：先做 payload 自動測試與 `safeUrl()`，再上 CSP。
4. **備份**：先做敏感資料分類；`.env` 不進備份；age 加密與 restore drill。
5. **API abuse**：先保護 RAG 昂貴端點，而不是只做 admin token 失敗節流。
6. **Tailscale 路徑依賴**：`.env` 使用 MagicDNS `x570`，目前解析為 `100.64.0.0/10`。Tailscale 離線時 embedding／rerank 會失敗；需確認應用端是明確錯誤或降級，不是無限等待。
7. **重開機／重新登入持續性**：`com.judgment.web` 冷啟動已驗證，但尚未在真正重開機後確認 LaunchAgent 與 tunnel 都會自動恢復；同時確認 Ollama 不再被 Squirrel 拉起。
8. **對外前的 SSH 硬化**：x570 目前仍開放 `22/tcp` 與密碼登入，公開 tunnel 上線後應限制來源。

## 4. 驗收規則

- `verified` 只代表有證據，不代表正式 accepted；需 owner 簽核。
- 不以測試總數取代攻擊面證據。
- 沒有外部失敗證據，不得把 `NET-01`／`NET-02` 標成 `verified`。
- 沒有公開 origin 的 GET／POST 401 實測，不得把 `CF-01`／`CF-02` 標成 `verified`。
- 沒有真實 Google 登入與 allowlist 拒絕實測，不得把 `AUTH-03` 標成 `verified`。
- 沒有 restore drill，不得把 `BAK-02` 標成 `verified`。
- 沒有無頭瀏覽器注入測試，不得把 `XSS-01` 標成 `verified`。
