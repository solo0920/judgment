# Supply Chain／CI 現況

- 日期：2026-11-21
- 目的：把建置、依賴與秘密掃描變成可重複的 CI 檢查

## 已加入

- `.github/workflows/ci.yml`
  - pytest
  - ruff
  - frontend build（esbuild 固定 `0.28.2`）
  - pip-audit
  - gitleaks 全歷史掃描（CLI 8.24.3；binary 以 version＋SHA-256 固定；本機掃描 273 commits、CI 掃描 285 commits，約 40 MB，0 credential leaks）
  - Syft SBOM（SPDX JSON artifact）
- `.github/dependabot.yml`
  - pip／docker／github-actions 每週更新
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

- GitHub Actions 仍使用 `@v4`／`@v5` 等 tag，尚未以 commit SHA 固定。
- `actions/checkout` 尚未設 `persist-credentials: false`。
- CI 仍是 `uv sync --extra dev`，尚未加 `--frozen`／`uv lock --check`；Dependabot PR 也不一定同步更新 `uv.lock`。
- `main` 尚未設定 branch protection；目前可直接 push。

## 手動驗證

```bash
uv sync --extra dev
uv run pytest -q
uv run ruff check .
uv run --with pip-audit pip-audit

npx --yes esbuild@0.28.2 --version
docker compose config
```

若本機已安裝 gitleaks，可重跑全歷史掃描：

```bash
gitleaks detect --source . --log-opts=--all --redact -v --exit-code=2
```
