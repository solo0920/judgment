#!/usr/bin/env bash
#
# Restore a Judgment environment from a backup.sh directory.
#
# Usage (inside the backup directory):
#   ./restore.sh -d /path/to/judgment
#
# Usage (from the project):
#   ./restore.sh -b /Volumes/USB/judgment-backup -d /path/to/judgment
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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
  ./restore.sh -d <專案目錄>
  ./restore.sh -b <備份目錄> -d <專案目錄>

選項：
  -d, --dest DIR       要還原的 Judgment 專案目錄（必填）
  -b, --backup-dir DIR 備份目錄；預設為 restore.sh 所在目錄
  --yes                不顯示互動確認
  --skip-data          不還原 data/
  --skip-postgres      不還原 PostgreSQL
  --skip-qdrant        不還原 Qdrant snapshot
  --no-start           還原後不執行 ./up.sh
  --no-deps            不執行 uv sync
  --dry-run            只檢查環境與備份，不變更資料
  -h, --help           顯示說明

restore.sh 會先檢查：
  - 備份目錄是否有 manifest、PostgreSQL dump、Qdrant snapshot 與 data/
  - 目標目錄是否已 clone Judgment 專案（pyproject.toml、src/judgment、up.sh）
  - Docker daemon 與 docker compose 是否可用
  - PostgreSQL dump／Qdrant snapshot checksum
  - 目標資料目錄空間是否足夠
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
    -d|--dest|--project-dir)
      [[ $# -ge 2 ]] || die "$1 需要一個目錄"
      PROJECT_DIR="$2"
      shift 2
      ;;
    -b|--backup-dir)
      [[ $# -ge 2 ]] || die "$1 需要一個目錄"
      BACKUP_DIR="$2"
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
    *)
      die "未知參數：$1"
      ;;
  esac
done

if [[ -z "$BACKUP_DIR" ]]; then
  BACKUP_DIR="$SCRIPT_DIR"
fi
BACKUP_DIR="$(abs_path "$BACKUP_DIR")"

if [[ -z "$PROJECT_DIR" ]]; then
  if [[ -f "$PWD/pyproject.toml" ]]; then
    PROJECT_DIR="$PWD"
  else
    usage
    exit 2
  fi
fi
PROJECT_DIR="$(abs_path "$PROJECT_DIR")"

need python3
need docker
docker compose version >/dev/null 2>&1 || die "找不到 docker compose"

info "備份與專案預檢"
[[ -f "$BACKUP_DIR/manifest.json" ]] || die "找不到 $BACKUP_DIR/manifest.json；請在 backup.sh 產生的備份目錄執行，或使用 -b"
[[ -d "$PROJECT_DIR" ]] || die "找不到專案目錄：$PROJECT_DIR"
[[ -f "$PROJECT_DIR/pyproject.toml" ]] || die "專案目錄沒有 pyproject.toml，請先 clone Judgment 專案"
[[ -d "$PROJECT_DIR/src/judgment" ]] || die "專案目錄沒有 src/judgment，請確認已完整 clone"
[[ -f "$PROJECT_DIR/up.sh" ]] || die "專案目錄沒有 up.sh，請確認已完整 clone"

if ! docker info >/dev/null 2>&1; then
  die "Docker daemon 沒有執行。請先啟動 OrbStack／Docker Desktop。"
fi
if ! command -v uv >/dev/null 2>&1 && [[ "$NO_DEPS" != "1" ]]; then
  echo "警告：找不到 uv，將略過 uv sync；可用 --no-deps 明確略過。" >&2
  NO_DEPS=1
fi

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
    "BACKUP_GIT_COMMIT": (payload.get("git") or {}).get("commit", ""),
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
    "DATA_JUDGMENT_BYTES": data.get("judgment_bytes", 0),
    "DATA_LAW_BYTES": data.get("law_bytes", 0),
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
  [[ -n "$PG_SHA" ]] || die "manifest 缺少 PostgreSQL checksum"
  [[ "$(sha256_file "$PG_DUMP")" == "$PG_SHA" ]] || die "PostgreSQL dump checksum 不符"
fi
if [[ "$SKIP_QDRANT" != "1" ]]; then
  [[ -n "$QDRANT_SNAPSHOT_REL" && -f "$QDRANT_SNAPSHOT" ]] || die "找不到 Qdrant snapshot：$QDRANT_SNAPSHOT"
  [[ -n "$QDRANT_SHA" ]] || die "manifest 缺少 Qdrant checksum"
  [[ "$(sha256_file "$QDRANT_SNAPSHOT")" == "$QDRANT_SHA" ]] || die "Qdrant snapshot checksum 不符"
fi
if [[ "$SKIP_DATA" != "1" ]]; then
  [[ -n "$JUDGMENT_BACKUP_DIR" && -d "$BACKUP_DIR/$JUDGMENT_BACKUP_DIR" ]] || die "備份缺少 data/judgments"
  [[ -n "$LAW_BACKUP_DIR" && -d "$BACKUP_DIR/$LAW_BACKUP_DIR" ]] || die "備份缺少 data/laws"
fi

if git -C "$PROJECT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  PROJECT_COMMIT="$(git -C "$PROJECT_DIR" rev-parse HEAD 2>/dev/null || true)"
  if [[ -n "$BACKUP_GIT_COMMIT" && -n "$PROJECT_COMMIT" && "$BACKUP_GIT_COMMIT" != "$PROJECT_COMMIT" ]]; then
    echo "警告：專案 commit 與備份 manifest 不同。" >&2
    echo "  備份：$BACKUP_GIT_COMMIT" >&2
    echo "  專案：$PROJECT_COMMIT" >&2
  fi
fi

# Verify free space before stopping services.
if [[ "$SKIP_DATA" != "1" && "$DRY_RUN" != "1" ]]; then
  TARGET_FREE="$(df -Pk "$PROJECT_DIR" | awk 'NR==2 {print $4 * 1024}')"
  NEEDED=$((DATA_JUDGMENT_BYTES + DATA_LAW_BYTES))
  if [[ -n "$TARGET_FREE" && "$TARGET_FREE" -lt "$NEEDED" ]]; then
    die "專案所在磁碟空間不足：需要約 $((NEEDED / 1024 / 1024 / 1024)) GB，可用 $((TARGET_FREE / 1024 / 1024 / 1024)) GB"
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
  echo "dry-run：檢查通過，未變更任何資料。"
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
  if docker compose exec -T "$PG_SERVICE" \
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
  docker compose exec -T "$PG_SERVICE" \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    psql -U "$PG_USER" -d "$PG_DB" -v ON_ERROR_STOP=1 \
    -c 'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;' >/dev/null
  docker compose exec -T "$PG_SERVICE" \
    env PGPASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}" \
    pg_restore -U "$PG_USER" -d "$PG_DB" \
    --no-owner --no-privileges --exit-on-error < "$PG_DUMP"
  JUDGMENT_COUNT="$(docker compose exec -T "$PG_SERVICE" \
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
  copy_tree "$BACKUP_DIR/$JUDGMENT_BACKUP_DIR" "$JUDGMENT_DATA_ABS"
  copy_tree "$BACKUP_DIR/$LAW_BACKUP_DIR" "$LAW_DATA_ABS"
  echo "判決資料 → $JUDGMENT_DATA_ABS"
  echo "法規資料 → $LAW_DATA_ABS"
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
if [[ "$SKIP_POSTGRES" == "1" && "$SKIP_QDRANT" != "1" ]]; then
  echo "警告：未還原 PostgreSQL，Qdrant 索引進度不會出現在主控台。" >&2
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
