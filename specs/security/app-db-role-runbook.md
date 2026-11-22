# 主應用 PostgreSQL 角色 Runbook

- 日期：2026-11-22
- 目標：主應用不再使用 PostgreSQL superuser；`judgment_app` 只擁有應用 schema 所需的 DDL/DML，沒有伺服器檔案或建立資料庫權限。
- 關聯：`DB-ROLE-01`／`APP-DB-01`

## 1. 目前角色

| 角色 | 用途 | 權限 |
| --- | --- | --- |
| `judgment_app` | FastAPI 主應用 | `LOGIN`、`NOSUPERUSER`、`NOCREATEDB`、`NOCREATEROLE`；`public` schema `USAGE, CREATE`；擁有 public tables／sequences |
| `demo_reader` | demo 訪客資料查詢 | `NOSUPERUSER`、`NOCREATEDB`、`NOCREATEROLE`、`default_transaction_read_only=on`；column-level／table-level SELECT |
| `judgment` | 初次建立、break-glass、備份 | superuser；**不再提供給 FastAPI 使用** |

`DATABASE_URL` 目前指向 `judgment_app`；密碼只存在 `.env`（`600`），不得寫入 repo、log 或備份 manifest。

## 2. 已驗證

```text
current_user = judgment_app
rolsuper = false
rolcreatedb = false
rolcreaterole = false
public tables owned by judgment_app = 33
tables not owned by judgment_app = 0
```

負向測試：

```text
COPY (SELECT 1) TO PROGRAM 'id'          → permission denied
SELECT pg_read_file('/etc/passwd')       → permission denied
CREATE DATABASE should_fail              → permission denied
CREATE TABLE in demo_reader              → read-only / permission denied
```

正向測試：

```text
ALTER TABLE app_settings ...             → ok（table owner）
GET /api/home                            → 200
GET /api/status（admin）                 → 200
GET /api/system-usage（admin）           → 200
POST /api/query（demo）                  → 200
GET /api/data/suggest、/api/law、/api/judgment → 200
PUT /api/admin/demo、POST /api/test-mode → 200
POST/GET /api/rag/share                  → 200
```

## 3. 初次 provision 步驟

以下為重建環境時的操作摘要；密碼請用 `python -c 'import secrets; print(secrets.token_urlsafe(32))'` 產生，經 stdin 傳給 psql，不要放在指令參數或 shell history。

```sql
CREATE ROLE judgment_app LOGIN PASSWORD '<generated>'
  NOSUPERUSER NOCREATEDB NOCREATEROLE;

GRANT CONNECT ON DATABASE judgment TO judgment_app;
GRANT USAGE, CREATE ON SCHEMA public TO judgment_app;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO judgment_app', r.tablename);
  END LOOP;
  FOR r IN SELECT sequence_name FROM information_schema.sequences
           WHERE sequence_schema='public' LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO judgment_app', r.sequence_name);
  END LOOP;
  FOR r IN SELECT viewname FROM pg_views WHERE schemaname='public' LOOP
    EXECUTE format('ALTER VIEW public.%I OWNER TO judgment_app', r.viewname);
  END LOOP;
END $$;
```

再把 `.env` 的 `DATABASE_URL` 改成：

```text
postgresql+psycopg://judgment_app:<password>@localhost:5432/judgment
```

重啟 `judgment-web`，確認：

```bash
curl -fsS http://127.0.0.1:9200/api/health
curl -fsS -H "X-Judgment-Admin-Token: $JUDGMENT_ADMIN_TOKEN" \
  http://127.0.0.1:9200/api/status >/dev/null
```

## 4. 回滾

切換前已保留：

```text
.run/env.before-db-role
```

若啟動或寫入失敗：

```bash
tmux kill-session -t judgment-web
cp .run/env.before-db-role .env
chmod 600 .env
tmux new-session -d -s judgment-web -c "$PWD" \
  "set -a; source .env; set +a; exec uv run judgment-web --host 127.0.0.1 --port 9200 >> .run/web.log 2>&1"
```

確認 `/api/health` 與 `/api/status` 後，再檢查 `.run/web.log`。不要把 `.env` 或回滾檔提交到 git。

## 5. 注意事項

- `judgment` superuser 仍保留給備份／初次建立／緊急救援；不得放進 FastAPI 的 `DATABASE_URL`。
- 新增 migration 若需要 `CREATE EXTENSION`、`CREATE ROLE` 或跨 database 操作，必須由維護者以 `judgment` 執行，不能假設 `judgment_app` 有權限。
- 新增 table 由 `judgment_app` 建立時會自動由它擁有；若由 `judgment` 建立，需重新執行 ownership transfer。
- `demo_reader` 的 grant 不受主應用 ownership 轉移影響；仍以 `demo-config-runbook.md` 為準。
- 備份腳本使用 `judgment` 進行 `pg_dump`；備份檔不含 `.env`，還原後需從密鑰管理器重建 `DATABASE_URL`。

## 6. Restore 後的角色處理

`pg_restore --no-owner --no-privileges` 會讓還原物件由執行 restore 的 `judgment` 擁有，且不會還原 `demo_reader` grants。`restore.sh` 現在會：

1. 在 destructive restore 前確認 `judgment_app` 存在；不存在就失敗，避免把 schema 清掉後才發現不能轉移。
2. 還原後把 public tables／sequences／views ownership 轉移給 `judgment_app`，並重新 grant schema `USAGE, CREATE`。
3. 提示操作員重新套用 `demo_reader` grants（依 `demo-config-runbook.md`）。
4. Restore 前除了 `public`，也會 drop `legal_term_benchmark` 與 `legal_term_evidence`；新增其他非 `public` schema 時，必須同步加入 drop 清單，否則 `pg_restore` 會因 `CREATE SCHEMA ... already exists` 中止。
5. `restore.sh`／`backup.sh` 的 shell 變數若緊接中文標點，必須使用 `${VAR}`；Bash 3.2 會把全形字元的第一個 byte 當成變數名稱的一部分。

還原後請驗證：

```sql
select current_user, rolsuper, rolcreatedb, rolcreaterole
from pg_roles where rolname=current_user;

select count(*) from pg_tables
where schemaname='public' and tableowner='judgment_app';
```

並以 `/api/health`、`/api/status`、`/api/query` 確認應用角色可讀寫。
