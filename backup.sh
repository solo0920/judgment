#!/usr/bin/env bash
#
# Back up the complete Judgment environment to a removable disk.
#
# Usage:
#   ./backup.sh -s /path/to/judgment -d /Volumes/USB/judgment-backup
#   ./backup.sh -d /Volumes/USB/judgment-backup
#
# The target directory is the backup directory itself. It must be empty.
# restore.sh is copied into it automatically.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SOURCE_DIR=""
TARGET_DIR=""
SKIP_DATA=0
SKIP_POSTGRES=0
SKIP_QDRANT=0
ALLOW_RUNNING=0
DRY_RUN=0

usage() {
  cat <<'EOF'
用法：
  ./backup.sh -s <專案目錄> -d <備份目錄>
  ./backup.sh -d <備份目錄>

選項：
  -s, --source DIR     Judgment 專案目錄（預設：backup.sh 所在目錄）
  -d, --dest DIR       備份目錄；必須是空目錄或不存在（必填）
  --skip-data          不複製 data/
  --skip-postgres      不匯出 PostgreSQL
  --skip-qdrant        不匯出 Qdrant snapshot
  --allow-running      允許在資料處理程序執行中備份（不建議）
  --dry-run            只檢查環境並顯示計畫，不寫入備份
  -h, --help           顯示說明

backup.sh 會先檢查：
  - 專案是否包含 pyproject.toml、docker-compose.yml、restore.sh
  - JUDGMENT_DATA_DIR 與 LAW_DATA_DIR 是否存在
  - Docker daemon、PostgreSQL、Qdrant collection 是否可用
  - 目標目錄是否可寫入、是否為空、空間是否足夠
  - 是否有索引／匯入／下載程序仍在執行
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

file_size() {
  python3 -c 'import os,sys; print(os.path.getsize(sys.argv[1]))' "$1"
}

dir_size() {
  if [[ -d "$1" ]]; then
    du -sk "$1" | awk '{print $1 * 1024}'
  else
    echo 0
  fi
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

load_env() {
  if [[ -f "$PROJECT_ROOT/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    . "$PROJECT_ROOT/.env"
    set +a
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
      --exclude='*.tmp' \
      "$source/" "$destination/"
  else
    (cd "$source" && tar -cf - --exclude='.DS_Store' .) | (cd "$destination" && tar -xf -)
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -s|--source)
      [[ $# -ge 2 ]] || die "$1 需要一個目錄"
      SOURCE_DIR="$2"
      shift 2
      ;;
    -d|--dest|--target)
      [[ $# -ge 2 ]] || die "$1 需要一個目錄"
      TARGET_DIR="$2"
      shift 2
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
    --allow-running)
      ALLOW_RUNNING=1
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

[[ -n "$TARGET_DIR" ]] || {
  usage
  exit 2
}

need python3
need curl
need docker
docker compose version >/dev/null 2>&1 || die "找不到 docker compose"

# Resolve source: accept either the project root or its data/ directory.
if [[ -z "$SOURCE_DIR" ]]; then
  SOURCE_DIR="$SCRIPT_DIR"
fi
SOURCE_DIR="$(abs_path "$SOURCE_DIR")"
[[ -d "$SOURCE_DIR" ]] || die "找不到來源目錄：$SOURCE_DIR"

if [[ -f "$SOURCE_DIR/pyproject.toml" ]]; then
  PROJECT_ROOT="$SOURCE_DIR"
elif [[ -f "$SOURCE_DIR/../pyproject.toml" && -d "$SOURCE_DIR/judgments" ]]; then
  PROJECT_ROOT="$(abs_path "$SOURCE_DIR/..")"
  echo "偵測到 data 目錄，專案根目錄為：$PROJECT_ROOT"
else
  die "來源目錄不像 Judgment 專案：$SOURCE_DIR（需含 pyproject.toml，或為含 judgments/ 的 data 目錄）"
fi

cd "$PROJECT_ROOT"
[[ -f "$PROJECT_ROOT/docker-compose.yml" ]] || die "找不到 docker-compose.yml：$PROJECT_ROOT"
[[ -f "$PROJECT_ROOT/restore.sh" ]] || die "找不到 restore.sh：$PROJECT_ROOT"

load_env
JUDGMENT_DATA_DIR="${JUDGMENT_DATA_DIR:-./data/judgments}"
LAW_DATA_DIR="${LAW_DATA_DIR:-./data/laws}"
QDRANT_URL="${QDRANT_URL:-http://127.0.0.1:6333}"
JUDGMENT_VECTOR_COLLECTION="${JUDGMENT_VECTOR_COLLECTION:-judgment_documents}"
JUDGMENT_PG_SERVICE="${JUDGMENT_PG_SERVICE:-postgres}"
JUDGMENT_PG_USER="${JUDGMENT_PG_USER:-judgment}"
JUDGMENT_PG_DB="${JUDGMENT_PG_DB:-judgment}"
JUDGMENT_PG_PASSWORD="${JUDGMENT_PG_PASSWORD:-judgment}"

JUDGMENT_DATA_ABS="$(abs_path "$JUDGMENT_DATA_DIR")"
LAW_DATA_ABS="$(abs_path "$LAW_DATA_DIR")"

info "環境預檢"
[[ -f "$PROJECT_ROOT/pyproject.toml" ]] || die "找不到 pyproject.toml"
if [[ "$SKIP_DATA" != "1" ]]; then
  [[ -d "$JUDGMENT_DATA_ABS" ]] || die "找不到判決資料目錄：$JUDGMENT_DATA_ABS"
  [[ -d "$LAW_DATA_ABS" ]] || die "找不到法規資料目錄：$LAW_DATA_ABS"
  [[ -n "$(find "$JUDGMENT_DATA_ABS" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]] \
    || die "判決資料目錄是空的：$JUDGMENT_DATA_ABS"
fi
if ! docker info >/dev/null 2>&1; then
  die "Docker daemon 沒有執行，請先啟動 OrbStack／Docker Desktop"
fi

info "啟動並檢查資料庫"
START_SERVICES=()
if [[ "$SKIP_POSTGRES" != "1" ]]; then
  START_SERVICES+=(postgres)
fi
if [[ "$SKIP_QDRANT" != "1" ]]; then
  START_SERVICES+=(qdrant)
fi
if [[ ${#START_SERVICES[@]} -gt 0 ]]; then
  docker compose up -d "${START_SERVICES[@]}"
fi

if [[ "$SKIP_POSTGRES" != "1" ]]; then
  for _ in {1..60}; do
    if docker compose exec -T "$JUDGMENT_PG_SERVICE" \
      env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
      pg_isready -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  if ! docker compose exec -T "$JUDGMENT_PG_SERVICE" \
    env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
    pg_isready -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" >/dev/null 2>&1; then
    die "PostgreSQL 未就緒"
  fi
  docker compose exec -T "$JUDGMENT_PG_SERVICE" \
    env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
    psql -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" -tAc \
    'select 1 from judgment_documents limit 1;' >/dev/null 2>&1 \
    || die "PostgreSQL 沒有可用的 judgment_documents 資料表"
fi

if [[ "$SKIP_QDRANT" != "1" ]]; then
  if ! curl -fsS --max-time 3 "$QDRANT_URL/collections" >/dev/null 2>&1; then
    die "Qdrant 無法連線：$QDRANT_URL"
  fi
  curl -fsS "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION" >/dev/null 2>&1 \
    || die "找不到 Qdrant collection：$JUDGMENT_VECTOR_COLLECTION（尚未建立索引時可用 --skip-qdrant）"
fi

if [[ "$ALLOW_RUNNING" != "1" ]]; then
  if pgrep -f 'judgment-index-vectors|judgment\.judgment_index|judgment-import-judgments|judgment\.judgment_import|judgment-law-download|judgment\.law_download\.cli|judgment\.processing_update' >/dev/null 2>&1; then
    die "偵測到資料處理程序仍在執行。請等待結束，或使用 --allow-running 強制備份。"
  fi
fi

TARGET_DIR="$(abs_path "$TARGET_DIR")"
if [[ -e "$TARGET_DIR" && ! -d "$TARGET_DIR" ]]; then
  die "目標不是目錄：$TARGET_DIR"
fi
if [[ -d "$TARGET_DIR" && -n "$(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
  die "備份目錄不是空的：$TARGET_DIR（請指定新的空目錄）"
fi
mkdir -p "$TARGET_DIR"
[[ -w "$TARGET_DIR" ]] || die "備份目錄不可寫入：$TARGET_DIR"

JUDGMENT_BYTES="$(dir_size "$JUDGMENT_DATA_ABS")"
LAW_BYTES="$(dir_size "$LAW_DATA_ABS")"
TOTAL_BYTES=$((JUDGMENT_BYTES + LAW_BYTES))
if [[ "$SKIP_DATA" != "1" ]]; then
  AVAILABLE_BYTES="$(df -Pk "$TARGET_DIR" | awk 'NR==2 {print $4 * 1024}')"
  REQUIRED_BYTES=$((TOTAL_BYTES + 4 * 1024 * 1024 * 1024))
  if [[ -n "$AVAILABLE_BYTES" && "$AVAILABLE_BYTES" -lt "$REQUIRED_BYTES" ]]; then
    die "備份空間不足：需要約 $((REQUIRED_BYTES / 1024 / 1024 / 1024)) GB，可用 $((AVAILABLE_BYTES / 1024 / 1024 / 1024)) GB"
  fi
fi

info "備份計畫"
printf '專案目錄：%s\n' "$PROJECT_ROOT"
printf '備份目錄：%s\n' "$TARGET_DIR"
printf '判決資料：%s（%s bytes）\n' "$JUDGMENT_DATA_ABS" "$JUDGMENT_BYTES"
printf '法規資料：%s（%s bytes）\n' "$LAW_DATA_ABS" "$LAW_BYTES"
printf 'PostgreSQL：%s / %s\n' "$JUDGMENT_PG_DB" "$JUDGMENT_PG_USER"
printf 'Qdrant：%s / %s\n' "$QDRANT_URL" "$JUDGMENT_VECTOR_COLLECTION"
printf '略過 data：%s；略過 PostgreSQL：%s；略過 Qdrant：%s\n' \
  "$SKIP_DATA" "$SKIP_POSTGRES" "$SKIP_QDRANT"

if [[ "$DRY_RUN" == "1" ]]; then
  echo
  echo "dry-run：環境檢查通過，未寫入任何檔案。"
  exit 0
fi

mkdir -p "$TARGET_DIR"/{postgres,qdrant,data,config}
cp "$PROJECT_ROOT/restore.sh" "$TARGET_DIR/restore.sh"
chmod +x "$TARGET_DIR/restore.sh"
echo "已複製 restore.sh 到 $TARGET_DIR/restore.sh"

PG_DUMP_REL=""
PG_DUMP_SHA=""
QDRANT_SNAPSHOT_REL=""
QDRANT_SNAPSHOT_SHA=""
QDRANT_POINTS=""
QDRANT_COLLECTION_SNAPSHOT=""

if [[ "$SKIP_POSTGRES" != "1" ]]; then
  info "匯出 PostgreSQL"
  PG_DUMP_REL="postgres/judgment.dump"
  if ! docker compose exec -T "$JUDGMENT_PG_SERVICE" \
    env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
    pg_dump -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" -Fc \
    > "$TARGET_DIR/$PG_DUMP_REL"; then
    rm -f "$TARGET_DIR/$PG_DUMP_REL"
    die "pg_dump 失敗"
  fi
  [[ -s "$TARGET_DIR/$PG_DUMP_REL" ]] || die "pg_dump 產生空檔案"
  PG_DUMP_SHA="$(sha256_file "$TARGET_DIR/$PG_DUMP_REL")"
  printf '%s  %s\n' "$PG_DUMP_SHA" "$PG_DUMP_REL" >> "$TARGET_DIR/checksums.sha256"
  printf 'PostgreSQL dump：%s bytes\n' "$(file_size "$TARGET_DIR/$PG_DUMP_REL")"
fi

if [[ "$SKIP_QDRANT" != "1" ]]; then
  info "建立 Qdrant snapshot"
  COLLECTION_INFO="$(curl -fsS "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION")"
  QDRANT_POINTS="$(printf '%s' "$COLLECTION_INFO" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("result") or {}).get("points_count") or 0)')"
  SNAPSHOT_RESPONSE="$(curl -fsS -X POST "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots")" \
    || die "建立 Qdrant snapshot 失敗"
  QDRANT_COLLECTION_SNAPSHOT="$(printf '%s' "$SNAPSHOT_RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("result") or {}).get("name") or "")')"
  [[ -n "$QDRANT_COLLECTION_SNAPSHOT" ]] || die "Qdrant 未回傳 snapshot 名稱"
  ENCODED_SNAPSHOT="$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$QDRANT_COLLECTION_SNAPSHOT")"
  QDRANT_SNAPSHOT_REL="qdrant/$QDRANT_COLLECTION_SNAPSHOT"
  curl -fsS "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots/$ENCODED_SNAPSHOT" \
    -o "$TARGET_DIR/$QDRANT_SNAPSHOT_REL" || die "下載 Qdrant snapshot 失敗"
  [[ -s "$TARGET_DIR/$QDRANT_SNAPSHOT_REL" ]] || die "Qdrant snapshot 是空檔案"
  QDRANT_SNAPSHOT_SHA="$(sha256_file "$TARGET_DIR/$QDRANT_SNAPSHOT_REL")"
  printf '%s  %s\n' "$QDRANT_SNAPSHOT_SHA" "$QDRANT_SNAPSHOT_REL" >> "$TARGET_DIR/checksums.sha256"
  printf 'Qdrant snapshot：%s bytes（%s points）\n' \
    "$(file_size "$TARGET_DIR/$QDRANT_SNAPSHOT_REL")" "$QDRANT_POINTS"
  curl -sS -X DELETE "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots/$ENCODED_SNAPSHOT" >/dev/null 2>&1 || true
fi

if [[ "$SKIP_DATA" != "1" ]]; then
  info "複製 data/"
  copy_tree "$JUDGMENT_DATA_ABS" "$TARGET_DIR/data/judgments"
  copy_tree "$LAW_DATA_ABS" "$TARGET_DIR/data/laws"
  echo "判決資料 → $TARGET_DIR/data/judgments"
  echo "法規資料 → $TARGET_DIR/data/laws"
fi

info "複製設定"
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  cp "$PROJECT_ROOT/.env" "$TARGET_DIR/config/.env"
  echo "已包含 .env（內含資料庫連線資訊，請妥善保管）" >&2
fi
for file in docker-compose.yml pyproject.toml uv.lock; do
  if [[ -f "$PROJECT_ROOT/$file" ]]; then
    cp "$PROJECT_ROOT/$file" "$TARGET_DIR/config/$file"
  fi
done

GIT_COMMIT=""
GIT_BRANCH=""
if git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_COMMIT="$(git -C "$PROJECT_ROOT" rev-parse HEAD 2>/dev/null || true)"
  GIT_BRANCH="$(git -C "$PROJECT_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi

export TARGET_DIR PROJECT_ROOT JUDGMENT_DATA_ABS LAW_DATA_ABS
export JUDGMENT_BYTES LAW_BYTES TOTAL_BYTES
export JUDGMENT_PG_SERVICE JUDGMENT_PG_USER JUDGMENT_PG_DB
export PG_DUMP_REL PG_DUMP_SHA
export QDRANT_URL JUDGMENT_VECTOR_COLLECTION
export QDRANT_SNAPSHOT_REL QDRANT_SNAPSHOT_SHA QDRANT_POINTS QDRANT_COLLECTION_SNAPSHOT
export GIT_COMMIT GIT_BRANCH
export SKIP_DATA SKIP_POSTGRES SKIP_QDRANT
export BACKUP_CREATED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
export BACKUP_HOSTNAME="$(hostname)"

python3 - <<'PY' > "$TARGET_DIR/manifest.json"
import json
import os
from pathlib import Path

def number(name):
    try:
        return int(os.environ.get(name) or 0)
    except ValueError:
        return 0

manifest = {
    "version": 1,
    "created_at": os.environ["BACKUP_CREATED_AT"],
    "hostname": os.environ["BACKUP_HOSTNAME"],
    "project_root": os.environ["PROJECT_ROOT"],
    "git": {
        "branch": os.environ.get("GIT_BRANCH", ""),
        "commit": os.environ.get("GIT_COMMIT", ""),
    },
    "skipped": {
        "data": os.environ.get("SKIP_DATA") == "1",
        "postgres": os.environ.get("SKIP_POSTGRES") == "1",
        "qdrant": os.environ.get("SKIP_QDRANT") == "1",
    },
    "postgres": {
        "service": os.environ["JUDGMENT_PG_SERVICE"],
        "user": os.environ["JUDGMENT_PG_USER"],
        "database": os.environ["JUDGMENT_PG_DB"],
        "dump": os.environ.get("PG_DUMP_REL", ""),
        "sha256": os.environ.get("PG_DUMP_SHA", ""),
        "bytes": 0,
    },
    "qdrant": {
        "url": os.environ["QDRANT_URL"],
        "collection": os.environ["JUDGMENT_VECTOR_COLLECTION"],
        "snapshot": os.environ.get("QDRANT_SNAPSHOT_REL", ""),
        "snapshot_name": os.environ.get("QDRANT_COLLECTION_SNAPSHOT", ""),
        "sha256": os.environ.get("QDRANT_SNAPSHOT_SHA", ""),
        "bytes": 0,
        "points_count": number("QDRANT_POINTS"),
    },
    "data": {
        "judgment_source_dir": os.environ["JUDGMENT_DATA_ABS"],
        "law_source_dir": os.environ["LAW_DATA_ABS"],
        "judgment_bytes": number("JUDGMENT_BYTES"),
        "law_bytes": number("LAW_BYTES"),
        "total_bytes": number("TOTAL_BYTES"),
        "judgment_backup_dir": "data/judgments" if os.environ.get("SKIP_DATA") != "1" else "",
        "law_backup_dir": "data/laws" if os.environ.get("SKIP_DATA") != "1" else "",
    },
}
for section in ("postgres", "qdrant"):
    relative = manifest[section].get("dump" if section == "postgres" else "snapshot")
    if relative:
        path = Path(os.environ["TARGET_DIR"]) / relative
        if path.is_file():
            manifest[section]["bytes"] = path.stat().st_size
print(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True))
PY

cat > "$TARGET_DIR/README-RESTORE.md" <<'EOF'
# Judgment environment restore

This directory was produced by `backup.sh`.

## Restore

1. Clone the project repository at the commit in `manifest.json`.
2. Install Docker and `uv`; start Docker.
3. From this directory, run:

```bash
./restore.sh -d /path/to/judgment
```

`restore.sh` will check the project checkout, Docker, backup files, and then
restore PostgreSQL, Qdrant, `data/`, and `.env`.

4. Resume Qdrant indexing:

```bash
cd /path/to/judgment
./scripts/index_full_task.sh
```

The PostgreSQL dump includes `judgment_vector_index`; restoring it together
with the Qdrant snapshot keeps index progress synchronized.

## Important

- Keep this directory encrypted; `config/.env` may contain credentials.
- Do not restore PostgreSQL and Qdrant independently. If you skip Qdrant,
  clear `judgment_vector_index` before a full re-index.
EOF

if [[ -f "$TARGET_DIR/checksums.sha256" ]]; then
  (cd "$TARGET_DIR" && shasum -a 256 -c checksums.sha256 2>/dev/null || sha256sum -c checksums.sha256) || true
fi

info "備份完成"
printf '位置：%s\n' "$TARGET_DIR"
printf '大小：%s\n' "$(du -sh "$TARGET_DIR" | awk '{print $1}')"
printf '還原：%s/restore.sh -d /path/to/judgment\n' "$TARGET_DIR"
