#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

MODE="${1:-run}"
BATCH_SIZE="${BATCH_SIZE:-128}"
MAX_CHARS="${MAX_CHARS:-1600}"
RECREATE="${RECREATE:-0}"
LOG_DIR=".run"
export MAX_CHARS

status() {
  uv run python scripts/index_status.py
}

case "$MODE" in
  status)
    status
    exit 0
    ;;
  run | "") ;;
  1 | 2 | 3 | 4 | 5)
    echo "提示：已改為自動接續模式，忽略任務編號 ${MODE}；本次會自動偵測剩餘筆數。"
    ;;
  *)
    echo "usage: $0 [run|status]" >&2
    echo "  run     自動偵測剩餘筆數並開始索引（預設）" >&2
    echo "  status  只顯示目前索引進度" >&2
    exit 2
    ;;
esac

COUNTS="$(uv run python scripts/index_status.py --fields)"
read -r INDEXED TOTAL REMAINING <<<"$COUNTS"

if (( TOTAL == 0 )); then
  echo "資料庫沒有可索引的判決（full_text 為空）。"
  exit 1
fi

if [[ "$RECREATE" == "1" ]]; then
  INDEXED=0
  REMAINING="$TOTAL"
fi

if (( REMAINING == 0 )); then
  echo "索引已完成：${TOTAL} / ${TOTAL}（100%），無需執行。"
  exit 0
fi

CAP="${LIMIT:-$REMAINING}"
if (( CAP > REMAINING )); then
  CAP="$REMAINING"
fi
if (( CAP < 1 )); then
  echo "LIMIT 必須大於 0。" >&2
  exit 2
fi

args=(
  --limit "$CAP"
  --batch-size "$BATCH_SIZE"
  --max-chars "$MAX_CHARS"
)
if [[ "$RECREATE" == "1" ]]; then
  args+=(--recreate)
fi

if [[ "${PLAN_ONLY:-0}" == "1" ]]; then
  percent="$(awk -v i="$INDEXED" -v t="$TOTAL" 'BEGIN { printf "%.1f", (t ? 100 * i / t : 0) }')"
  echo "偵測結果：目前 ${INDEXED} / ${TOTAL}（${percent}%），剩餘 ${REMAINING} 筆。"
  echo "本次上限：${CAP} 筆；batch ${BATCH_SIZE}；max_chars ${MAX_CHARS}；recreate=${RECREATE}。"
  echo "指令：uv run judgment-index-vectors ${args[*]}"
  exit 0
fi

mkdir -p "$LOG_DIR"
STAMP="$(date '+%Y%m%d_%H%M%S')"
LOG="$LOG_DIR/index_full_task_${STAMP}.log"
ln -sfn "$(basename "$LOG")" "$LOG_DIR/index_full_task.log"

export INDEX_TASK="${INDEX_TASK:-auto}"

INTERRUPTED=0
trap 'INTERRUPTED=1' INT

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto run start (limit=${CAP}, batch=${BATCH_SIZE}, max_chars=${MAX_CHARS}, recreate=${RECREATE})"
  echo "本次待索引 ${CAP} 筆；目前 ${INDEXED} / ${TOTAL}（$(awk -v i="$INDEXED" -v t="$TOTAL" 'BEGIN { printf "%.1f", (t ? 100 * i / t : 0) }')%），剩餘 ${REMAINING} 筆。"
  echo "日誌：${LOG}"
  status
} | tee -a "$LOG"

RC=0
uv run judgment-index-vectors "${args[@]}" 2>&1 \
  | tee -a "$LOG" \
  | python3 -u scripts/index_progress.py \
      --limit "$CAP" \
      --label "全量索引" \
      --overall-start "$INDEXED" \
      --overall-total "$TOTAL" \
  || RC=$?

if (( INTERRUPTED )); then
  RC=130
fi

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] auto run stopped (exit=${RC})"
  if (( RC != 0 )); then
    echo "索引已中止；下次執行 ./scripts/index_full_task.sh 會自動偵測剩餘筆數並接續。"
  fi
  status
} | tee -a "$LOG"

exit "$RC"
