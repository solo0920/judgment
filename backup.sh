#!/usr/bin/env bash
#
# Back up the complete Judgment environment to a removable disk.
#
# Usage:
#   ./backup.sh /Volumes/USB/judgment-backups
#   ./backup.sh --dest /Volumes/USB/judgment-backups
#   ./backup.sh --dest /Volumes/USB --skip-qdrant
#
# The destination receives a timestamped directory containing:
#   data/                  raw RARs, raw Parquet, law/order artifacts
#   postgres/judgment.dump PostgreSQL custom-format dump
#   qdrant/               Qdrant collection snapshot
#   config/               .env, docker-compose.yml, project metadata
#   manifest.json         restore instructions and checksums
#   restore.sh            copy of the restore script
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

DEST=""
NAME=""
SKIP_DATA=0
SKIP_POSTGRES=0
SKIP_QDRANT=0
ALLOW_RUNNING=0
DRY_RUN=0

usage() {
  cat <<'EOF'
用法：
  ./backup.sh --dest <USB目錄> [選項]
  ./backup.sh <USB目錄>

選項：
  --dest DIR           備份根目錄（必填；會在其下建立 timestamp 子目錄）
  --name NAME          自訂備份子目錄名稱
  --skip-data          不複製 data/
  --skip-postgres      不匯出 PostgreSQL
  --skip-qdrant        不匯出 Qdrant collection snapshot
  --allow-running      允許在資料處理程序執行中備份（不建議）
  --dry-run            只顯示計畫，不寫入檔案
  -h, --help           顯示說明

環境變數：
  JUDGMENT_DATA_DIR    default: ./data/judgments
  LAW_DATA_DIR         default: ./data/laws
  QDRANT_URL           default: http://127.0.0.1:6333
  JUDGMENT_VECTOR_COLLECTION  default: judgment_documents
  JUDGMENT_PG_SERVICE  default: postgres
  JUDGMENT_PG_USER     default: judgment
  JUDGMENT_PG_DB       default: judgment
  JUDGMENT_PG_PASSWORD default: judgment
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
  python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$1"
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
  if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    . "$SCRIPT_DIR/.env"
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
    --dest)
      [[ $# -ge 2 ]] || die "--dest 需要一個目錄"
      DEST="$2"
      shift 2
      ;;
    --name)
      [[ $# -ge 2 ]] || die "--name 需要一個名稱"
      NAME="$2"
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
    -*)
      die "未知選項：$1"
      ;;
    *)
      [[ -z "$DEST" ]] || die "只能指定一個備份目錄"
      DEST="$1"
      shift
      ;;
  esac
done

[[ -n "$DEST" ]] || {
  usage
  exit 2
}

need python3
need curl
need docker
docker compose version >/dev/null 2>&1 || die "找不到 docker compose"

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
if [[ "$DRY_RUN" == "1" ]]; then
  JUDGMENT_DATA_ABS="$(python3 -c 'import os,sys; print(os.path.abspath(os.path.expanduser(sys.argv[1])))' "$JUDGMENT_DATA_DIR")"
  LAW_DATA_ABS="$(python3 -c 'import os,sys; print(os.path.abspath(os.path.expanduser(sys.argv[1])))' "$LAW_DATA_DIR")"
fi

if [[ "$ALLOW_RUNNING" != "1" ]]; then
  if pgrep -f 'judgment-index-vectors|judgment\.judgment_index|judgment-import-judgments|judgment\.judgment_import|judgment-law-download|judgment\.law_download\.cli|judgment\.processing_update' >/dev/null 2>&1; then
    die "偵測到資料處理程序仍在執行。請等待結束，或使用 --allow-running 強制備份。"
  fi
fi

STAMP="$(date '+%Y%m%d-%H%M%S')"
if [[ -n "$NAME" ]]; then
  BACKUP_DIR="$DEST/$NAME"
else
  BACKUP_DIR="$DEST/judgment-backup-$STAMP"
fi

JUDGMENT_BYTES="$(dir_size "$JUDGMENT_DATA_ABS")"
LAW_BYTES="$(dir_size "$LAW_DATA_ABS")"
TOTAL_BYTES=$((JUDGMENT_BYTES + LAW_BYTES))

info "備份計畫"
printf '專案目錄：%s\n' "$SCRIPT_DIR"
printf '備份目錄：%s\n' "$BACKUP_DIR"
printf '判決資料：%s（%s bytes）\n' "$JUDGMENT_DATA_ABS" "$JUDGMENT_BYTES"
printf '法規資料：%s（%s bytes）\n' "$LAW_DATA_ABS" "$LAW_BYTES"
printf 'PostgreSQL：%s / %s\n' "$JUDGMENT_PG_DB" "$JUDGMENT_PG_USER"
printf 'Qdrant：%s / %s\n' "$QDRANT_URL" "$JUDGMENT_VECTOR_COLLECTION"
printf '略過 data：%s；略過 PostgreSQL：%s；略過 Qdrant：%s\n' \
  "$SKIP_DATA" "$SKIP_POSTGRES" "$SKIP_QDRANT"

if [[ "$DRY_RUN" == "1" ]]; then
  echo
  echo "dry-run：未寫入任何檔案。"
  exit 0
fi

if [[ -e "$BACKUP_DIR" ]]; then
  die "備份目錄已存在：$BACKUP_DIR"
fi

mkdir -p "$DEST"
mkdir -p "$BACKUP_DIR"/{postgres,qdrant,data,config}
INFO_TMP="$(mktemp)"
trap 'rm -f "$INFO_TMP"' EXIT

PG_DUMP_REL=""
PG_DUMP_SHA=""
QDRANT_SNAPSHOT_REL=""
QDRANT_SNAPSHOT_SHA=""
QDRANT_POINTS=""
QDRANT_COLLECTION_SNAPSHOT=""

if [[ "$SKIP_POSTGRES" != "1" ]]; then
  info "啟動 PostgreSQL 並匯出 dump"
  docker compose up -d "$JUDGMENT_PG_SERVICE" >/dev/null
  for _ in {1..60}; do
    if docker compose exec -T "$JUDGMENT_PG_SERVICE" \
      env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
      pg_isready -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  PG_DUMP_REL="postgres/judgment.dump"
  if ! docker compose exec -T "$JUDGMENT_PG_SERVICE" \
    env PGPASSWORD="$JUDGMENT_PG_PASSWORD" \
    pg_dump -U "$JUDGMENT_PG_USER" -d "$JUDGMENT_PG_DB" -Fc \
    > "$BACKUP_DIR/$PG_DUMP_REL"; then
    rm -f "$BACKUP_DIR/$PG_DUMP_REL"
    die "pg_dump 失敗"
  fi
  [[ -s "$BACKUP_DIR/$PG_DUMP_REL" ]] || die "pg_dump 產生空檔案"
  PG_DUMP_SHA="$(sha256_file "$BACKUP_DIR/$PG_DUMP_REL")"
  printf '%s  %s\n' "$PG_DUMP_SHA" "$PG_DUMP_REL" >> "$BACKUP_DIR/checksums.sha256"
  printf 'PostgreSQL dump：%s bytes\n' "$(file_size "$BACKUP_DIR/$PG_DUMP_REL")"
fi

if [[ "$SKIP_QDRANT" != "1" ]]; then
  info "建立 Qdrant collection snapshot"
  if ! docker compose up -d qdrant >/dev/null 2>&1; then
    :
  fi
  for _ in {1..60}; do
    if curl -fsS --max-time 2 "$QDRANT_URL/collections" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  COLLECTION_INFO="$(curl -fsS "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION")" \
    || die "找不到 Qdrant collection：$JUDGMENT_VECTOR_COLLECTION（若尚未建立索引，請用 --skip-qdrant）"
  QDRANT_POINTS="$(printf '%s' "$COLLECTION_INFO" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("result") or {}).get("points_count") or 0)')"
  SNAPSHOT_RESPONSE="$(curl -fsS -X POST "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots")" \
    || die "建立 Qdrant snapshot 失敗"
  QDRANT_COLLECTION_SNAPSHOT="$(printf '%s' "$SNAPSHOT_RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print((d.get("result") or {}).get("name") or "")')"
  [[ -n "$QDRANT_COLLECTION_SNAPSHOT" ]] || die "Qdrant 未回傳 snapshot 名稱"
  ENCODED_SNAPSHOT="$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$QDRANT_COLLECTION_SNAPSHOT")"
  QDRANT_SNAPSHOT_REL="qdrant/$QDRANT_COLLECTION_SNAPSHOT"
  curl -fsS "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots/$ENCODED_SNAPSHOT" \
    -o "$BACKUP_DIR/$QDRANT_SNAPSHOT_REL" || die "下載 Qdrant snapshot 失敗"
  [[ -s "$BACKUP_DIR/$QDRANT_SNAPSHOT_REL" ]] || die "Qdrant snapshot 是空檔案"
  QDRANT_SNAPSHOT_SHA="$(sha256_file "$BACKUP_DIR/$QDRANT_SNAPSHOT_REL")"
  printf '%s  %s\n' "$QDRANT_SNAPSHOT_SHA" "$QDRANT_SNAPSHOT_REL" >> "$BACKUP_DIR/checksums.sha256"
  printf 'Qdrant snapshot：%s bytes（%s points）\n' \
    "$(file_size "$BACKUP_DIR/$QDRANT_SNAPSHOT_REL")" "$QDRANT_POINTS"
  curl -sS -X DELETE "$QDRANT_URL/collections/$JUDGMENT_VECTOR_COLLECTION/snapshots/$ENCODED_SNAPSHOT" >/dev/null 2>&1 || true
fi

if [[ "$SKIP_DATA" != "1" ]]; then
  info "複製 data/"
  if [[ -d "$JUDGMENT_DATA_ABS" ]]; then
    echo "複製判決資料：$JUDGMENT_DATA_ABS"
    copy_tree "$JUDGMENT_DATA_ABS" "$BACKUP_DIR/data/judgments"
  else
    echo "警告：找不到判決資料目錄 $JUDGMENT_DATA_ABS" >&2
  fi
  if [[ -d "$LAW_DATA_ABS" ]]; then
    echo "複製法規資料：$LAW_DATA_ABS"
    copy_tree "$LAW_DATA_ABS" "$BACKUP_DIR/data/laws"
  else
    echo "警告：找不到法規資料目錄 $LAW_DATA_ABS" >&2
  fi
fi

info "複製設定與還原腳本"
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  cp "$SCRIPT_DIR/.env" "$BACKUP_DIR/config/.env"
  echo "已包含 .env（內含資料庫連線資訊，請妥善保管備份）" >&2
fi
for file in docker-compose.yml pyproject.toml uv.lock; do
  if [[ -f "$SCRIPT_DIR/$file" ]]; then
    cp "$SCRIPT_DIR/$file" "$BACKUP_DIR/config/$file"
  fi
done
cp "$SCRIPT_DIR/restore.sh" "$BACKUP_DIR/restore.sh" 2>/dev/null || true
if [[ -f "$BACKUP_DIR/restore.sh" ]]; then
  chmod +x "$BACKUP_DIR/restore.sh"
fi

GIT_COMMIT=""
GIT_BRANCH=""
if git -C "$SCRIPT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_COMMIT="$(git -C "$SCRIPT_DIR" rev-parse HEAD 2>/dev/null || true)"
  GIT_BRANCH="$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi

export BACKUP_DIR JUDGMENT_DATA_ABS LAW_DATA_ABS
export JUDGMENT_BYTES LAW_BYTES TOTAL_BYTES
export JUDGMENT_PG_SERVICE JUDGMENT_PG_USER JUDGMENT_PG_DB
export PG_DUMP_REL PG_DUMP_SHA
export QDRANT_URL JUDGMENT_VECTOR_COLLECTION
export QDRANT_SNAPSHOT_REL QDRANT_SNAPSHOT_SHA QDRANT_POINTS QDRANT_COLLECTION_SNAPSHOT
export GIT_COMMIT GIT_BRANCH
export SKIP_DATA SKIP_POSTGRES SKIP_QDRANT
export BACKUP_CREATED_AT="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
export BACKUP_HOSTNAME="$(hostname)"
export PROJECT_ROOT="$SCRIPT_DIR"

python3 - <<'PY' > "$BACKUP_DIR/manifest.json"
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
        path = Path(os.environ["BACKUP_DIR"]) / relative
        if path.is_file():
            manifest[section]["bytes"] = path.stat().st_size
print(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True))
PY

cat > "$BACKUP_DIR/README-RESTORE.md" <<'EOF'
# Judgment environment restore

This directory was produced by `backup.sh`.

## Restore on a new computer

1. Install Docker, `uv`, Python 3, and Ollama (`bge-m3`).
2. Clone the project repository at the commit recorded in `manifest.json`.
3. From the project directory, run:

```bash
./restore.sh --backup-dir /Volumes/USB/judgment-backup-YYYYmmdd-HHMMSS \
  --project-dir /path/to/judgment
```

Or run the copy of `restore.sh` inside this backup directory:

```bash
./restore.sh --project-dir /path/to/judgment
```

4. Review the restored `.env` if the new machine uses different paths or hosts.
5. Start the backend with `./up.sh` (restore.sh does this by default).
6. Resume Qdrant indexing:

```bash
./scripts/index_full_task.sh
```

The PostgreSQL dump includes `judgment_vector_index`, so the restored Qdrant
snapshot and index progress remain synchronized and indexing resumes instead
of starting from zero.

## Important

- Keep the backup encrypted; `config/.env` may contain credentials.
- Do not restore a PostgreSQL dump and a Qdrant snapshot independently:
  `judgment_vector_index` must match the Qdrant collection. If you skip Qdrant,
  clear `judgment_vector_index` before running a full re-index.
- Data files preserve archive paths inside raw Parquet manifests. Restoring to
  the same project path is fastest; a different path may cause RARs to be
  re-extracted on the next import.
EOF

if [[ -f "$BACKUP_DIR/checksums.sha256" ]]; then
  (cd "$BACKUP_DIR" && shasum -a 256 -c checksums.sha256 2>/dev/null || sha256sum -c checksums.sha256) || true
fi

info "備份完成"
printf '位置：%s\n' "$BACKUP_DIR"
printf '大小：%s\n' "$(du -sh "$BACKUP_DIR" | awk '{print $1}')"
printf 'Manifest：%s/manifest.json\n' "$BACKUP_DIR"
printf '還原：%s/restore.sh --backup-dir %s --project-dir /path/to/judgment\n' \
  "$BACKUP_DIR" "$BACKUP_DIR"
