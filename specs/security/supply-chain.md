# Supply Chain／CI 現況

- 日期：2026-11-22
- 目的：把建置、依賴與秘密掃描變成可重複的 CI 檢查

## 已加入

- `.github/workflows/ci.yml`
  - pytest／ruff／frontend build／pip-audit／Syft SBOM。
  - GitHub Actions 全部以 commit SHA 固定：`actions/checkout`、`actions/setup-python`、`actions/setup-node`、`astral-sh/setup-uv` 為 major v7，`anchore/sbom-action` 為 v0；註解保留可讀版本。
  - `actions/checkout` 設 `persist-credentials: false`，避免 checkout token 留在 workspace。
  - `uv sync --frozen --extra dev`，lockfile 過期時 CI 直接失敗。
  - gitleaks CLI 8.24.3；binary 以 version＋SHA-256 固定；全歷史掃描 305 commits、約 45.7 MB，0 credential leaks。
  - `.gitleaks.toml` 自訂規則：Judgment token／secret assignment、PostgreSQL DSN、age identity；分隔符只允許同行的空白，避免把下一個變數名稱誤判為 secret。
  - `scripts/gitleaks_selftest.sh` 負向／正向對照：假 token 必須被偵測（exit 2），placeholder 必須乾淨（exit 0）。
- `.github/dependabot.yml`
  - pip／docker／github-actions 每週更新。
- `main` branch protection（2026-11-22 設定）：
  - required checks：`test`、`frontend`、`security`
  - 需要 PR、分支需為最新、conversation 需 resolved
  - 禁止 force push／刪除；`enforce_admins=true`
  - 核准數 0，適合單人 repo；仍保留 PR 與 CI 關卡
- Docker image digest pinning：
  - `postgres:16-alpine@sha256:0cefaabd...`
  - `qdrant/qdrant:v1.19.1@sha256:12364fe...`
- `scripts/build_frontend.py` 固定 esbuild `0.28.2`；若 PATH 中的版本不同，改用 `npx esbuild@0.28.2`。
- Python 最低版本：`>=3.10`（pytest 9 與 pyarrow 25 都已不支援 Python 3.9；3.9 已 EOL）。

## pip-audit 現況

2026-11-21 升級後：

| 套件 | 版本 | 狀態 |
|---|---:|---|
| `pyarrow` | 25.0.1 | 無已知 advisory |
| `pytest` | 9.2.0 | 無已知 advisory |

CI 已移除 `--ignore-vuln`。若未來出現新的 advisory，security job 會 fail；例外必須先記錄在此文件並加上 `review_by`，不能直接永久 ignore。

### 為什麼可以升級

- `PYSEC-2026-113`（pyarrow）：advisory 明文指出受影響的是 Arrow C++ 的 IPC file pre-buffering，且該功能未暴露在 Python／Ruby／C GLib bindings；本專案只用 `pyarrow.parquet`、`pyarrow.dataset`、`pyarrow.compute`，沒有 IPC／Feather／`pre_buffer` 路徑。
- `PYSEC-2026-1845`（pytest）：pytest 9.0.3 已修正 tmpdir 處理；本專案只在開發與 CI 執行 pytest，展示站 runtime 不會載入。
- pyarrow 25.0.1 與 pytest 9.2.0 都要求 Python `>=3.10`，因此同步把 `requires-python` 提高到 `>=3.10`。

### 隔離驗證

先在 temp venv 完成相容性測試；正式 `.venv` 同步後也重跑一次：

- `pyarrow 25.0.1` + `pytest 9.2.0`：697 tests pass。
- `pytest-cov 6.3.0` 可搭配 pytest 9.2.0，`--cov` 正常。
- 法規 Parquet（1,351 rows／26 columns）與判決 Parquet（1,295 rows／18 columns）：pyarrow 18 與 25 的 schema、row count、前 100 筆 SHA-256 相同。
- pyarrow 25 寫出的 ZSTD Parquet 可被 pyarrow 18 與 DuckDB 讀取；DuckDB 寫出的 Parquet 也可被 pyarrow 18 與 25 讀取。
- `pip-audit` 在 pyarrow 25.0.1 + pytest 9.2.0 環境回報 no known vulnerabilities。

正式環境升級仍應在備份完成、展示關閉時進行，並先跑一個月份的匯入與查詢 smoke test；不要只在測試套件通過後就直接切 production。

## 尚未完成的 CI 硬化

- Dependabot 的 pip major PR（FastAPI、uvicorn、ruff、pyarrow、pytest 等）仍待逐一評估；`uv.lock` 需與 `pyproject.toml` 同步更新後再合併。
- Actions 目前已 pin 到 v7／v0 的 commit SHA；未來 Dependabot 更新時需保持 SHA pin 與版本註解，不接受只改 tag。
- `uv sync --frozen` 已進 CI；可再視需要加 `uv lock --check` 作為獨立步驟。

## 手動驗證

```bash
uv sync --frozen --extra dev
uv run pytest -q
uv run ruff check .
uv run --with pip-audit pip-audit

npx --yes esbuild@0.28.2 --version
docker compose config
```

若本機已安裝 gitleaks，先跑自訂規則的負向／正向對照，再跑全歷史掃描：

```bash
bash scripts/gitleaks_selftest.sh
gitleaks detect --source . --config .gitleaks.toml \
  --log-opts=--all --redact -v --exit-code=2
```
