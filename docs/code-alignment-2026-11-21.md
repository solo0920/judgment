# Code Alignment Snapshot — 2026-11-21

> 這份文件是目前程式與部署狀態的對照基準。**程式碼是唯一事實來源**；本文件只記錄 2026-11-21 當下可重現的程式、設定與資料快照。會隨資料變動的數字，使用前仍應以 API 回傳值為準。

## 1. Runtime 與測試

| 項目 | 目前值 |
|---|---|
| Python | `>=3.10`；本機 `.python-version` 為 3.12 |
| pyarrow | `25.0.1` |
| pytest | `9.2.0` |
| 測試 | `uv run pytest -q`：690 tests pass |
| Lint | `uv run ruff check .`：clean |
| CI | pytest、ruff、frontend build、pip-audit、gitleaks 全歷史、Syft SBOM |
| pip-audit | 無已知 advisory，CI 無 `--ignore-vuln` |
| gitleaks | 8.24.3，`--log-opts=--all`；0 credential leaks |
| esbuild | `0.28.2` |
| Docker images | PostgreSQL 16.15、Qdrant 1.19.1，皆以 digest 固定 |

CI 尚未完成：GitHub Actions commit SHA pinning、`persist-credentials: false`、`uv sync --frozen`、`main` branch protection。詳見 `specs/security/supply-chain.md`。

## 2. 目前資料快照

以下為 2026-11-21 `/api/home` 與 `/api/status` 的回傳值；資料更新後可能變動。

| 項目 | 目前值 |
|---|---:|
| 法規 | 1,351 |
| 命令 | 10,454 |
| 法規／命令條文 | 222,126 |
| current 判決 | 4,714,967 |
| raw 判決 | 22,881,015 |
| raw archive | 371 |
| 金融判決佔比 | 20.6% |
| 判決向量索引 | `judgments_v005`、version #7、4,714,967 / 4,714,967（100%） |
| 法規向量索引 | `legal_articles_v006`、version #9、222,126 points、1,024 維 |

文件中的舊數字（例如 4,681,502、`judgments_v003`、version #5）是歷史快照，不代表目前狀態。README 與 current-state spec 應以本節或 API 為準；dated benchmark 報告保留當時數據，不應改寫成現在的數字。

## 3. Demo mode

- DB 表：`demo_settings`；六個 feature flags：`rag`、`data`、`quality`、`performance`、`processing`、`status`；`home` 為隱含功能。
- 目前執行狀態是動態的，存在 `demo_settings`；不要用文件硬編碼「開啟」或「關閉」。
- 狀態 API：`GET /api/demo/status`；管理 API：`GET /api/admin/demo`、`PUT /api/admin/demo`、`POST /api/admin/demo/close`。
- 訪客 route allowlist 以 `src/judgment/web/demo_policies.json` 為唯一來源，目前 15 條：

```text
GET  /api/catalog
GET  /api/data/suggest
GET  /api/demo/processing
GET  /api/demo/quality
GET  /api/home
GET  /api/judgment
GET  /api/law
GET  /api/performance
GET  /api/processing
GET  /api/quality
GET  /api/schema/suggest
GET  /api/status
POST /api/query
POST /api/rag/query
POST /api/rag/query/stream
```

- `GET /api/question-bank/*`、`GET /api/performance/options`、`GET /api/processing/plan`、`GET /api/processing/active`、`GET /api/updates/status`、`GET /api/courts/check`、`GET /api/law-versions/check`、`GET /api/judgment-download/status` 都是 admin-only，不在 demo allowlist。
- Demo 限流預設：RAG 10/min、60/hour、200/day，另有每日 400 次與 1,000,000 token 預算；query 20/min、200/hour、500/day；poll 120/min、3,000/hour、20,000/day。設定在 `src/judgment/config.py`。
- Demo visitors 目前多數 demo route 使用主 `judgment` 連線；只有 `POST /api/query?database=postgres` 使用 `demo_reader`。`demo_reader` 是 column-level SELECT、`NOSUPERUSER NOCREATEDB NOCREATEROLE`、`default_transaction_read_only=on`。

## 4. Auth／security 現況

- 管理員：`solo4study@gmail.com` Google session，或 `X-Judgment-Admin-Token` break-glass token。
- Session：HttpOnly signed cookie，TTL 7 天（`AUTH_SESSION_TTL_SECONDS=604800`），`SameSite=None`；沒有 server-side session table／撤銷。
- `JUDGMENT_ADMIN_TOKEN` 與 `AUTH_SESSION_SECRET` 已於 2026-11-21 輪替；舊值失效。
- 管理 token 存在瀏覽器 `sessionStorage`，舊 `localStorage` 值會遷移並刪除。
- CSP 已 enforce；有 `X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`；`report-uri` 已接 `/api/csp-report`，`report-to` 尚未設定。CSP 仍允許 Google Fonts 與 production `connect-src` 的 localhost。
- 未完成：SESSION-01、AUDIT-01、SameSite 改 Lax 的評估、SSE ticket 一次性／綁定、HSTS 延長。
- HIST-01：gitleaks 全歷史 0 credential leaks；但 public history 仍有主機名稱／port。

## 5. 備份與資料庫角色

- PostgreSQL dump 使用 age 加密（`postgres/judgment.dump.age`）；`.env` 不進備份；`data/` 與 Qdrant snapshot 仍為明文。
- 已完成完整備份與 subset restore；完整 157 GB＋Qdrant restore drill 尚未執行。
- `demo_reader` 已建立並限制；主應用仍使用 `judgment`，目前 `rolsuper=t`、`rolcreatedb=t`。APP-DB-01 尚未完成。
- age 私鑰：`~/.config/judgment/age.key`，權限 `600`，不可進 repo／備份。

## 6. 文件狀態規則

- `README.md`、`specs/*/spec.md`、`specs/security/*.md`：current-state 文件，應以程式與 API 為準。
- `specs/005-retrieval-evaluation/*-2026-11-17.md`、`specs/006-fraud-relevance-annotation/*`：dated 研究／benchmark 快照；保留當時數據，不強行改成目前值，但會標示 snapshot 性質。
- 任何與本文件衝突的 current-state 敘述，以程式碼、`demo_policies.json`、`route_policies.json`、`config.py` 與 API 回傳為準。
