#!/usr/bin/env bash
#
# Restore a Judgment environment from a directory produced by backup.sh.
#
# Usage:
#   ./restore.sh --backup-dir /Volumes/USB/judgment-backup-YYYYmmdd-HHMMSS
#   ./restore.sh --backup-dir /Volumes/USB/... --project-dir /path/to/judgment
#   /Volumes/USB/judgment-backup-.../restore.sh --project-dir /path/to/judgment
#
# The restore replaces the target PostgreSQL schema and Qdrant collection.
# It does not delete extra files already present under data/.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_PROJECT_DIR="$SCRIPT_DIR"

BACKUP_DIR=""
PROJECT_DIR=""
ASSUME_YES=0
SKIP_DATA=0
SKIP_POSTGRES=0
SKIP_QDRANT=0
NO_START=0
NO_DEPS=0
DRY_RUN=0

usage() {
  cat <<'EOF'
用法：
  ./restore.sh --backup-dir <備份目錄> [--project-dir <專案目錄>] [選項]

選項：
  --backup-dir DIR      backup.sh 產生的 timestamp 目錄（必填）
  --project-dir DIR     要還原的專案目錄（預設：restore.sh 所在目錄）
  --yes                 不顯示互動確認
  --skip-data           不還原 data/
  --skip-postgres       不還原 PostgreSQL
  --skip-qdrant         不還原 Qdrant snapshot
  --no-start            還原後不執行 ./up.sh
  --no-deps             不執行 uv sync
  --dry-run             只顯示計畫，不變更任何資料
  -h, --help            顯示說明

注意：
  - PostgreSQL schema 與 Qdrant collection 會被覆蓋。
  - 若跳過 Qdrant，但 PostgreSQL 的 judgment_vector_index 已還原，
    索引進度會與空的 Qdrant 不一致；請在重新索引前清空該表。
EOF
}

die() {
  printf '錯誤：%s\n' "$*" >&2
  exit 1
}

info() {
  printf '\n== %s ==\n' "$*"
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "找不到 $1"
}

abs_path() {
  python3 -c 'import os,sys; print(os.path.abspath(os.path.expanduser(sys.argv[1])))' "$1"
}

sha256_file() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  else
    python3 -c 'import hashlib,sys; h=hashlib.sha256(); f=open(sys.argv[1],"rb"); [h.update(b) for b in iter(lambda: f.read(1024*1024), b"")]; print(h.hexdigest())' "$1"
  fi
}

copy_tree() {
  local source="$1"
  local destination="$2"
  mkdir -p "$destination"
  if command -v rsync >/dev/null 2>&1; then
    rsync -rlt \
      --exclude='.DS_Store' \
      --exclude='._*' \
      "$source/" "$destination/"
  else
    (cd "$source" && tar -cf - .) | (cd "$destination" && tar -xf -)
  fi
}

load_env() {
  if [[ -f "$PROJECT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    . "$PROJECT_DIR/.env"
    set +a
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup-dir)
      [[ $# -ge 2 ]] || die "--backup-dir 需要一個目錄"
      BACKUP_DIR="$2"
      shift 2
      ;;
    --project-dir)
      [[ $# -ge 2 ]] || die "--project-dir 需要一個目錄"
      PROJECT_DIR="$2"
      shift 2
      ;;
    --yes)
      ASSUME_YES=1
      shift
      ;;
    --skip-data)
      SKIP_DATA=1
      shift
      ;;
    --skip-postgres)
      SKIP_POSTGRES=1
      shift
      ;;
    --skip-qdrant)
      SKIP_QDRANT=1
      shift
      ;;
    --no-start)
      NO_START=1
      shift
      ;;
    --no-deps)
      NO_DEPS=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      die "未知選項：$1"
      ;;
    *)
      [[ -z "$BACKUP_DIR" ]] || die "只能指定一個備份目錄"
      BACKUP_DIR="$1"
      shift
      ;;
  esac
done

[[ -n "$BACKUP_DIR" ]] || {
  usage
  exit 2
}
BACKUP_DIR="$(abs_path "$BACKUP_DIR")"
[[ -f "$BACKUP_DIR/manifest.json" ]] || die "找不到 $BACKUP_DIR/manifest.json"

if [[ -z "$PROJECT_DIR" ]]; then
  PROJECT_DIR="$DEFAULT_PROJECT_DIR"
fi
if [[ ! -f "$PROJECT_DIR/pyproject.toml" && ! -f "$PROJECT_DIR/docker-compose.yml" ]]; then
  die "專案目錄不像 Judgment 專案：$PROJECT_DIR（請用 --project-dir 指定）"
fi
PROJECT_DIR="$(abs_path "$PROJECT_DIR")"

need python3
need docker
docker compose version >/dev/null 2>&1 || die "找不到 docker compose"

# Read manifest values without eval'ing untrusted JSON.
eval "$(python3 - "$BACKUP_DIR/manifest.json" <<'PY'
import json
import shlex
import sys

payload = json.load(open(sys.argv[1], encoding="utf-8"))
postgres = payload.get("postgres") or {}
qdrant = payload.get("qdrant") or {}
data = payload.get("data") or {}
skipped = payload.get("skipped") or {}

values = {
    "BACKUP_VERSION": payload.get("version"),
    "BACKUP_CREATED_AT": payload.get("created_at", ""),
    "PG_SERVICE": postgres.get("service", "postgres"),
    "PG_USER": postgres.get("user", "judgment"),
    "PG_DB": postgres.get("database", "judgment"),
    "PG_DUMP_REL": postgres.get("dump", ""),
    "PG_SHA": postgres.get("sha256", ""),
    "QDRANT_URL": qdrant.get("url", "http://127.0.0.1:6333"),
    "QDRANT_COLLECTION": qdrant.get("collection", "judgment_documents"),
    "QDRANT_SNAPSHOT_REL": qdrant.get("snapshot", ""),
    "QDRANT_SHA": qdrant.get("sha256", ""),
    "QDRANT_POINTS": qdrant.get("points_count", 0),
    "JUDGMENT_BACKUP_DIR": data.get("judgment_backup_dir", ""),
    "LAW_BACKUP_DIR": data.get("law_backup_dir", ""),
    "BACKUP_SKIP_DATA": "1" if skipped.get("data") else "0",
    "BACKUP_SKIP_POSTGRES": "1" if skipped.get("postgres") else "0",
    "BACKUP_SKIP_QDRANT": "1" if skipped.get("qdrant") else "0",
}
for key, value in values.items():
    print(f"{key}={shlex.quote('' if value is None else str(value))}")
PY
)"

if [[ "$BACKUP_SKIP_POSTGRES" == "1" ]]; then
  SKIP_POSTGRES=1
fi
if [[ "$BACKUP_SKIP_QDRANT" == "1" ]]; then
  SKIP_QDRANT=1
fi
if [[ "$BACKUP_SKIP_DATA" == "1" ]]; then
  SKIP_DATA=1
fi

PG_DUMP="$BACKUP_DIR/$PG_DUMP_REL"
QDRANT_SNAPSHOT="$BACKUP_DIR/$QDRANT_SNAPSHOT_REL"

if [[ "$SKIP_POSTGRES" != "1" ]]; then
  [[ -n "$PG_DUMP_REL" && -f "$PG_DUMP" ]] || die "找不到 PostgreSQL dump：$PG_DUMP"
  if [[ -n "$PG_SHA" ]]; then
    [[ "$(sha256_file "$PG_DUMP")" == "$PG_SHA" ]] || die "PostgreSQL dump checksum 不符"
  fi
fi
if [[ "$SKIP_QDRANT" != "1" ]]; then
  [[ -n "$QDRANT_SNAPSHOT_REL" && -f "$QDRANT_SNAPSHOT" ]] || die "找不到 Qdrant snapshot：$QDRANT_SNAPSHOT"
  if [[ -n "$QDRANT_SHA" ]]; then
    [[ "$(sha256_file "$QDRANT_SNAPSHOT")" == "$QDRANT_SHA" ]] || die "Qdrant snapshot checksum 不符"
  fi
fi

info "還原計畫"
printf '備份：%s\n' "$BACKUP_DIR"
printf '建立時間：%s\n' "$BACKUP_CREATED_AT"
printf '專案：%s\n' "$PROJECT_DIR"
printf 'PostgreSQL：%s / %s\n' "$PG_DB" "$PG_USER"
printf 'Qdrant：%s / %s（snapshot points %s）\n' "$QDRANT_URL" "$QDRANT_COLLECTION" "$QDRANT_POINTS"
printf '略過 data：%s；略過 PostgreSQL：%s；略過 Qdrant：%s\n' \
  "$SKIP_DATA" "$SKIP_POSTGRES" "$SKIP_QDRANT"

if [[ "$DRY_RUN" == "1" ]]; then
  echo
  echo "dry-run：未變更任何資料。"
  exit 0
fi

if [[ "$ASSUME_YES" != "1" ]]; then
  cat >&2 <<'EOF'
警告：這會覆蓋目前 PostgreSQL schema 與 Qdrant collection。
請先確認備份來源正確，且目前環境沒有要保留的資料。
EOF
  read -r -p "輸入 YES 繼續：" answer
  [[ "$answer" == "YES" ]] || {
    echo "已取消。"
    exit 1
  }
fi

cd "$PROJECT_DIR"

info "停止目前後端與服務"
if [[ -x "$PROJECT_DIR/down.sh" ]]; then
  "$PROJECT_DIR/down.sh" || true
else
  docker compose stop || true
fi

info "還原設定"
STAMP="$(date '+%Y%m%d-%H%M%S')"
if [[ -f "$BACKUP_DIR/config/.env" ]]; then
  if [[ -f "$PROJECT_DIR/.env" ]]; then
    cp "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.before-restore.$STAMP"
    echo "已保留舊 .env 為 .env.before-restore.$STAMP"
  fi
  cp "$BACKUP_DIR/config/.env" "$PROJECT_DIR/.env"
  echo "已還原 .env；若新電腦路徑或主機不同，請先檢查內容。"
fi
if [[ ! -f "$PROJECT_DIR/docker-compose.yml" && -f "$BACKUP_DIR/config/docker-compose.yml" ]]; then
  cp "$BACKUP_DIR/config/docker-compose.yml" "$PROJECT_DIR/docker-compose.yml"
  echo "已補回 docker-compose.yml"
fi

load_env
JUDGMENT_DATA_DIR="${JUDGMENT_DATA_DIR:-./data/judgments}"
LAW_DATA_DIR="${LAW_DATA_DIR:-./data/laws}"
JUDGMENT_DATA_ABS="$(abs_path "$JUDGMENT_DATA_DIR")"
LAW_DATA_ABS="$(abs_path "$LAW_DATA_DIR")"
QDRANT_COLLECTION="${JUDGMENT_VECTOR_COLLECTION:-$QDRANT_COLLECTION}"

info "啟動 PostgreSQL 與 Qdrant"
docker compose up -d postgres qdrant

for _ in {1..60}; do
  if docker compose exec -T postgres \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    pg_isready -U "$PG_USER" -d "$PG_DB" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
for _ in {1..60}; do
  if curl -fsS --max-time 2 "$QDRANT_URL/collections" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if [[ "$SKIP_POSTGRES" != "1" ]]; then
  info "還原 PostgreSQL"
  docker compose exec -T postgres \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 \
    -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;' >/dev/null
  docker compose exec -T postgres \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    pg_restore -U "$PG_USER" -d "$PG_DB" \
    --no-owner --no-privileges --exit-on-error < "$PG_DUMP"
  JUDGMENT_COUNT="$(docker compose exec -T postgres \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    psql -U "$PG_USER" -d "$PG_DB" -tAc \
    'select count(*) from judgment_documents;' 2>/dev/null || echo '?')"
  printf 'PostgreSQL judgment_documents：%s 筆\n' "$JUDGMENT_COUNT"
fi

if [[ "$SKIP_QDRANT" != "1" ]]; then
  info "還原 Qdrant snapshot"
  curl -sS -X DELETE "$QDRANT_URL/collections/$QDRANT_COLLECTION" >/dev/null 2>&1 || true
  curl -fsS -X POST \
    "$QDRANT_URL/collections/$QDRANT_COLLECTION/snapshots/upload?priority=snapshot" \
    -F "snapshot=@$QDRANT_SNAPSHOT" >/dev/null
  RESTORED_INFO="$(curl -fsS "$QDRANT_URL/collections/$QDRANT_COLLECTION")"
  RESTORED_POINTS="$(printf '%s' "$RESTORED_INFO" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("result") or {}).get("points_count") or 0)')"
  printf 'Qdrant points：%s（備份 %s）\n' "$RESTORED_POINTS" "$QDRANT_POINTS"
  if [[ "$QDRANT_POINTS" != "0" && "$RESTORED_POINTS" != "$QDRANT_POINTS" ]]; then
    echo "警告：Qdrant points 數量與備份 manifest 不一致。" >&2
  fi
fi

if [[ "$SKIP_DATA" != "1" ]]; then
  info "還原 data/"
  if [[ -n "$JUDGMENT_BACKUP_DIR" && -d "$BACKUP_DIR/$JUDGMENT_BACKUP_DIR" ]]; then
    copy_tree "$BACKUP_DIR/$JUDGMENT_BACKUP_DIR" "$JUDGMENT_DATA_ABS"
    echo "判決資料 → $JUDGMENT_DATA_ABS"
  else
    echo "警告：備份不含判決資料。" >&2
  fi
  if [[ -n "$LAW_BACKUP_DIR" && -d "$BACKUP_DIR/$LAW_BACKUP_DIR" ]]; then
    copy_tree "$BACKUP_DIR/$LAW_BACKUP_DIR" "$LAW_DATA_ABS"
    echo "法規資料 → $LAW_DATA_ABS"
  else
    echo "警告：備份不含法規資料。" >&2
  fi
fi

if [[ "$SKIP_QDRANT" == "1" && "$SKIP_POSTGRES" != "1" ]]; then
  cat >&2 <<'EOF'

警告：已還原 PostgreSQL，但未還原 Qdrant。
PostgreSQL 的 judgment_vector_index 會顯示部分索引已完成，但 Qdrant 可能是空的。
重新索引前請執行：
  docker compose exec -T postgres psql -U judgment -d judgment \
    -c 'DELETE FROM judgment_vector_index;'
EOF
fi

if [[ "$NO_DEPS" != "1" ]] && command -v uv >/dev/null 2>&1 && [[ -f "$PROJECT_DIR/pyproject.toml" ]]; then
  info "同步 Python 依賴"
  (cd "$PROJECT_DIR" && uv sync)
fi

if [[ "$NO_START" != "1" ]]; then
  info "啟動後端"
  "$PROJECT_DIR/up.sh" || die "後端啟動失敗；請檢查 .run/web.log"
fi

info "還原完成"
printf '備份版本：%s\n' "$BACKUP_VERSION"
printf '資料庫：PostgreSQL %s / Qdrant %s\n' "$PG_DB" "$QDRANT_COLLECTION"
cat <<'EOF'

下一步：
  ./scripts/index_full_task.sh
若 PostgreSQL 與 Qdrant 都已完整還原，索引會從已完成的進度接續。
EOF
