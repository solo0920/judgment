#!/usr/bin/env bash
# x570 llama-server service audit / chat-context change helper.
#
# Run this ON x570, not from the MBP. It never changes embedding/reranker
# slots. The only mutating mode is apply-chat-ctx.
#
#   bash x570_service_audit.sh before
#   sudo bash x570_service_audit.sh apply-chat-ctx 24576
#   bash x570_service_audit.sh verify
#   sudo bash x570_service_audit.sh rollback
set -euo pipefail

MODE="${1:-before}"
CTX="${2:-24576}"
CHAT_UNIT="/etc/systemd/system/judgment-llm-chat.service"
OUT="$HOME/judgment-x570-${MODE}-$(date +%Y%m%d-%H%M%S).txt"
UNITS=(judgment-llm-chat judgment-llm-embedding judgment-reranker)

exec > >(tee "$OUT") 2>&1

echo "mode=$MODE ctx=$CTX host=$(hostname) date=$(date -Is)"
echo "output=$OUT"

show_units() {
  for unit in "${UNITS[@]}"; do
    echo
    echo "=== $unit ==="
    systemctl is-enabled "$unit" 2>&1 || true
    systemctl is-active "$unit" 2>&1 || true
    systemctl status "$unit" --no-pager -n 20 2>&1 || true
  done
}

show_gpu() {
  echo
  echo "=== nvidia-smi ==="
  if command -v nvidia-smi >/dev/null 2>&1; then
    nvidia-smi || true
    nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu --format=csv || true
  else
    echo "nvidia-smi not found"
  fi
  echo
  echo "=== ollama / listeners ==="
  systemctl is-active ollama 2>&1 || true
  ss -ltnp 2>/dev/null | grep -E ':(11435|11436|11437|11434)\b' || true
}

show_props() {
  echo
  echo "=== chat /props ==="
  curl -fsS --max-time 5 http://127.0.0.1:11436/props 2>/dev/null \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); print({k:d.get(k) for k in ("model_alias","total_slots","n_ctx")}); print("slot_ctx",(d.get("default_generation_settings") or {}).get("n_ctx"))' \
    || echo "props unavailable"
  echo "=== embedding /props ==="
  curl -fsS --max-time 5 http://127.0.0.1:11437/props 2>/dev/null \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); print({k:d.get(k) for k in ("model_alias","total_slots")}); print("slot_ctx",(d.get("default_generation_settings") or {}).get("n_ctx"))' \
    || echo "props unavailable"
  echo "=== rerank /props ==="
  curl -fsS --max-time 5 http://127.0.0.1:11435/props 2>/dev/null \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); print({k:d.get(k) for k in ("model_alias","total_slots")}); print("slot_ctx",(d.get("default_generation_settings") or {}).get("n_ctx"))' \
    || echo "props unavailable"
}

show_journal() {
  echo
  echo "=== journal (chat) ==="
  sudo journalctl -u judgment-llm-chat -n 200 --no-pager 2>&1 || true
  echo "=== journal (embedding) ==="
  sudo journalctl -u judgment-llm-embedding -n 100 --no-pager 2>&1 || true
  echo "=== journal (reranker) ==="
  sudo journalctl -u judgment-reranker -n 100 --no-pager 2>&1 || true
}

show_firewall() {
  echo
  echo "=== ufw ==="
  sudo ufw status verbose 2>&1 || true
}

wait_chat() {
  for _ in $(seq 1 120); do
    if curl -fsS --max-time 2 http://127.0.0.1:11436/health >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
  done
  echo "chat health did not become ready" >&2
  return 1
}

case "$MODE" in
  before)
    show_units
    show_gpu
    show_props
    show_journal
    show_firewall
    ;;
  verify)
    show_units
    show_gpu
    show_props
    sudo journalctl -u judgment-llm-chat -n 80 --no-pager 2>&1 || true
    ;;
  apply-chat-ctx)
    if [[ ! -f "$CHAT_UNIT" ]]; then
      echo "missing $CHAT_UNIT" >&2
      exit 1
    fi
    backup="${CHAT_UNIT}.bak.$(date +%Y%m%d-%H%M%S)"
    sudo cp -a "$CHAT_UNIT" "$backup"
    echo "backup=$backup"
    sudo sed -i -E "s/--ctx-size[ =]+[0-9]+/--ctx-size ${CTX}/" "$CHAT_UNIT"
    sudo systemctl daemon-reload
    sudo systemctl restart judgment-llm-chat
    wait_chat
    show_units
    show_gpu
    show_props
    echo "rollback command: sudo cp -a '$backup' '$CHAT_UNIT' && sudo systemctl daemon-reload && sudo systemctl restart judgment-llm-chat"
    ;;
  rollback)
    latest="$(ls -1t ${CHAT_UNIT}.bak.* 2>/dev/null | head -1 || true)"
    if [[ -z "$latest" ]]; then
      echo "no backup found" >&2
      exit 1
    fi
    echo "restoring $latest"
    sudo cp -a "$latest" "$CHAT_UNIT"
    sudo systemctl daemon-reload
    sudo systemctl restart judgment-llm-chat
    wait_chat
    show_units
    show_props
    ;;
  *)
    echo "usage: $0 [before|verify|apply-chat-ctx [ctx]|rollback]" >&2
    exit 2
    ;;
esac
