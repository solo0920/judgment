#!/usr/bin/env bash
# Apply and verify x570 AI-port network isolation from the MBP.
#
# Usage:
#   ADMIN_IP=100.x.y.z MBP_IP=100.a.b.c \
#     bash scripts/x570_apply_network_isolation.sh
#
#   X570_HOST=user@x570 ADMIN_IP=... MBP_IP=... \
#     bash scripts/x570_apply_network_isolation.sh
#
# ADMIN_IP is the source IP used by your SSH/admin device (Tailscale IP is
# preferred). MBP_IP is the source IP that the Judgment backend will use to
# reach x570. Both must be valid IPv4/IPv6 addresses. Keep a second SSH
# session open while this runs.
set -euo pipefail

HOST="${X570_HOST:-x570}"
API_HOST="${X570_API_HOST:-${HOST#*@}}"
ADMIN_IP="${ADMIN_IP:-}"
MBP_IP="${MBP_IP:-}"
CONFIRM="${CONFIRM:-}"

usage() {
  cat >&2 <<'EOF'
用法：
  ADMIN_IP=<管理設備IP> MBP_IP=<MBP的IP> \
    bash scripts/x570_apply_network_isolation.sh

可選：
  X570_HOST=user@x570
  X570_API_HOST=x570
  CONFIRM=APPLY   # 非互動執行（仍會顯示警告）
EOF
  exit 2
}

if [[ -z "${ADMIN_IP}" && -t 0 ]]; then
  read -r -p "管理設備 SSH 來源 IP（建議 Tailscale IP）: " ADMIN_IP
fi
if [[ -z "${MBP_IP}" && -t 0 ]]; then
  read -r -p "MBP 的來源 IP（建議 Tailscale IP）: " MBP_IP
fi
[[ -n "${ADMIN_IP}" && -n "${MBP_IP}" ]] || usage

python3 - "${ADMIN_IP}" "${MBP_IP}" <<'PY'
import ipaddress
import sys
for value in sys.argv[1:]:
    ipaddress.ip_address(value)
PY

cat <<EOF
即將在 ${HOST} 套用：
  1. UFW allow from ${ADMIN_IP} to 22/tcp
  2. UFW allow from ${MBP_IP} to 11434:11437/tcp
  3. UFW default deny incoming / allow outgoing / enable
  4. 顯示 ufw status 與 Docker 警告

請先確認：
  - 你已開著第二個 SSH session，且 ${ADMIN_IP} 是正確的來源 IP。
  - 若 AI 服務在 Docker，UFW 不會自動處理 published ports；腳本只會警告，
    不會替你改 DOCKER-USER。
EOF

if [[ "${CONFIRM}" != "APPLY" ]]; then
  read -r -p "輸入 APPLY 才會執行，其他任意輸入取消: " CONFIRM
fi
[[ "${CONFIRM}" == "APPLY" ]] || { echo "取消。"; exit 1; }

echo "確認 SSH 與 sudo 可用（必要時先輸入 sudo 密碼）…"
ssh -o ConnectTimeout=10 -t "${HOST}" 'sudo -v'

echo "在 ${HOST} 套用 UFW 規則…"
ssh -t "${HOST}" \
  "sudo env ADMIN_IP='${ADMIN_IP}' MBP_IP='${MBP_IP}' bash -s" <<'REMOTE'
set -euo pipefail

UFW="$(command -v ufw || true)"
if [[ -z "${UFW}" ]]; then
  echo "錯誤：x570 找不到 ufw；請先安裝或改用 nftables/iptables。" >&2
  exit 1
fi

"${UFW}" allow from "${ADMIN_IP}" to any port 22 proto tcp
"${UFW}" allow from "${MBP_IP}" to any port 11434:11437 proto tcp
"${UFW}" default deny incoming
"${UFW}" default allow outgoing
"${UFW}" --force enable
"${UFW}" status numbered

echo
echo "AI listener bindings（仍需靠 UFW／Tailscale 限制來源）："
ss -ltnp | grep -E ':(11434|11435|11436|11437)\b' || true

if command -v docker >/dev/null 2>&1 && \
  docker ps -q 2>/dev/null | grep -q .; then
  echo
  echo "WARNING: Docker containers are running. UFW does not govern Docker"
  echo "published ports. Add the same source restrictions to DOCKER-USER"
  echo "before considering the AI ports isolated."
fi
REMOTE

echo
echo "從 MBP 驗證（應成功）："
for port in 11434 11435 11436 11437; do
  if nc -z -w 3 "${API_HOST}" "${port}" >/dev/null 2>&1; then
    echo "  ${API_HOST}:${port} OK"
  else
    echo "  ${API_HOST}:${port} FAILED（請檢查 MBP_IP 與 UFW 規則）" >&2
  fi
done

echo
echo "請從第二台區網設備與手機行動網路驗證（應失敗）："
for port in 11434 11435 11436 11437; do
  echo "  nc -vz -w3 ${API_HOST} ${port}"
done
echo
echo "最後在 x570 重開機，再執行："
echo "  ssh ${HOST} 'sudo ufw status numbered; ss -ltnp | grep -E \":(11434|11435|11436|11437)\\b\"'"
