# Supply Chain／CI 現況

- 日期：2026-11-21
- 目的：把建置、依賴與秘密掃描變成可重複的 CI 檢查

## 已加入

- `.github/workflows/ci.yml`
  - pytest
  - ruff
  - frontend build（esbuild 固定 `0.28.2`）
  - pip-audit
  - gitleaks 全歷史掃描
  - Syft SBOM（SPDX JSON artifact）
- `.github/dependabot.yml`
  - pip／docker／github-actions 每週更新
- Docker image digest pinning：
  - `postgres:16-alpine@sha256:0cefaabd...`
  - `qdrant/qdrant:v1.19.1@sha256:12364fe...`
- `scripts/build_frontend.py` 固定 esbuild `0.28.2`；若 PATH 中的版本不同，改用 `npx esbuild@0.28.2`。

## 已知且暫時接受的 pip-audit 風險

`pip-audit` 目前找到兩個問題，CI 以 `--ignore-vuln` 暫時排除，這裡記錄原因與後續條件：

| 套件 | 目前版本 | Advisory | 修正版本 | 為什麼暫不升級 |
|---|---:|---|---:|---|
| `pyarrow` | 18.1.0 | PYSEC-2026-113 | 23.0.1 | `pyproject.toml` 目前限制 `pyarrow>=15,<19`，且專案支援 Python 3.9；升級到 23.x 需要先確認 Python／Parquet／Arrow API 相容性與完整資料流程測試。 |
| `pytest` | 8.4.2 | PYSEC-2026-1845 | 9.0.3 | 開發依賴目前限制 `pytest>=8,<9`；pytest 9 可能改變 plugin／fixture 行為，需單獨跑完整測試。 |

處理原則：

1. 每週 Dependabot 會嘗試更新；若 CI 的 pip-audit 出現**新的** advisory，會 fail。
2. 升級 pyarrow 或 pytest 時，先移除對應的 `--ignore-vuln`，跑完整 `pytest`、`ruff`、資料匯入／查詢 smoke test。
3. 不要把 ignore 當成永久豁免；在 `specs/security/security-acceptance-matrix.md` 的 `SUP-01` 更新狀態。

## 手動驗證

```bash
uv run --with pip-audit pip-audit \
  --ignore-vuln PYSEC-2026-113 \
  --ignore-vuln PYSEC-2026-1845

npx --yes esbuild@0.28.2 --version
docker compose config
```
