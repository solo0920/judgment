# llama-server 服務檢查：MBP / x570 開機載入與中斷原因

- 日期：2026-11-17
- 範圍：只檢查服務設定與中斷原因，不改 model／registry／RAG 品質
- 原始資料：`service-audit-2026-11-17.json`

## 結論

```text
MBP：三個 llama-server 由 LaunchAgent 管理，RunAtLoad + KeepAlive，登入時自動載入。
x570：三個 llama-server systemd 服務目前都在跑；部署腳本會 enable 開機啟動與 Restart=on-failure。
「24576 測試 server 無聲消失」不是 llama-server crash，而是它當時只是 tmux 前景程序，沒有 launchd/KeepAlive；
改用臨時 LaunchAgent 後，2 分鐘 77 個 5.7k-token 請求全部 200，runs=1、never exited。
```

## MBP

### 1. 開機載入的三個 model

`launchctl list` 與 `launchctl print`：

| Label | Port | Model | RunAtLoad | KeepAlive | 目前 |
|---|---:|---|---|---|---|
| `com.judgment.rerank` | 11435 | bge-reranker-v2-m3-q8_0 | true | true | running，runs=1，never exited |
| `com.judgment.llm-chat` | 11436 | gemma3-4b | true | true | running，runs=2，last status -15 |
| `com.judgment.llm-embedding` | 11437 | bge-m3-f16 | true | true | running，runs=2，last status -15 |

- 三個都是 `~/Library/LaunchAgents/*.plist`，`RunAtLoad=true`、`KeepAlive=true`、`ThrottleInterval=5`。
- 它們是**使用者登入時**載入，不是開機前；macOS LaunchAgent 的正常行為。
- chat／embedding 的 `runs=2`、last status `-15` 與 13:39 的 `deploy_llama_services_macos.sh` 重新 `bootout/bootstrap/kickstart` 一致；這是部署重啟，不是自發崩潰。rerank 沒有重啟過。

### 2. 24576 測試 server 為什麼消失

- 它是用 `tmux` 直接跑 `llama-server`，不是 LaunchAgent；沒有 `KeepAlive`，也沒有 launchd 的退出碼。
- 這種程序會隨 tmux session／process group／shell 清理一起消失；log 沒有 exit line，正是 process group 被終止的特徵。
- 為排除「server 自己崩潰」，建立臨時 LaunchAgent `com.judgment.llm-chat-24576`：
  - `-c 24576 -np 4`、slot 6144。
  - RunAtLoad + KeepAlive。
  - 2 分鐘、3 並行、5,749-token 請求：**77/77 HTTP 200**，runs=1，last exit = never exited。
- 測試後已 `bootout` 並刪除該 plist；目前 MBP 沒有 11440 服務，維持原本三個 model。

### 3. MBP 的 context 設定

- chat 11436 啟動 log：`n_slots=4, n_ctx_slot=8192, kv_unified=true`。
- plist 沒有指定 `--parallel`，llama-server 預設就是 4 slots。
- 所以 11436 不是「單一 8192」；並行時 Q5 會 context exceeded。
- 24576 / 4 slots = 6144 是唯一已驗證能放 5,749-token 的設定，但沒有留在 MBP。

## x570

### 1. 目前實際運行的三個 model

直接查 `/props`（不需 SSH）：

| Port | Model | total_slots | default n_ctx |
|---|---:|---:|---:|
| 11435 | bge-reranker-v2-m3-q8_0 | 4 | 8192 |
| 11436 | gemma3-4b-q4_k_m | 4 | 8192 |
| 11437 | bge-m3-f16 | 4 | 8192 |

三個服務都在回應 `/v1/models`。

### 2. 開機啟動設定

`scripts/deploy_llama_services_systemd.sh` 會建立：

```text
judgment-llm-chat.service
judgment-llm-embedding.service
judgment-reranker.service
```

並執行：

```text
systemctl enable ...
Restart=on-failure
RestartSec=3
```

所以設計上是開機載入三個 model，失敗會自動重啟。

### 3. 無法確認的部分

- SSH port 22 可連，但 `solo@x570` publickey／password 被拒；`ssh-add -l` 沒有已載入金鑰；Tailscale SSH host key 也不可用。
- 因此**無法直接確認** `systemctl is-enabled`／`is-active` 與 journal。 `/props` 只證明目前三個服務在跑，不證明開機 enable 狀態。
- 請在 x570 上跑（或提供 SSH 後我來跑）：

```bash
for u in judgment-llm-chat judgment-llm-embedding judgment-reranker; do
  systemctl is-enabled "$u"; systemctl is-active "$u"; systemctl status "$u" --no-pager -n 20
done
journalctl -u judgment-llm-chat -n 200 --no-pager
```

### 4. x570 中斷原因目前不能定論

- systemd `Restart=on-failure` 會讓崩潰後自動重啟；如果服務中斷後又恢復，`journalctl` 應有 restart 記錄。
- `/props` 無法提供 uptime；需要 journal 才能分辨 OOM、CUDA error、model load 失敗或手動 restart。
- 目前沒有 x570 SSH，不能把「服務中斷」歸因於程式或硬體。

## 立即修正：x570 序列化 LLM

x570 仍是 8192、4 slots。先把 `.env` 設為：

```text
LLM_MAX_CONCURRENT=1
LLM_NUM_CTX=8192
```

這樣一次只有一個 LLM 使用 8192 池，Q5 5,749 tokens 可放進；20 mixed 實測：

```text
operational 16／retrieval_only 4
first_partial p95 2,802 ms
done p95 9,939 ms
error 0
```

比 4 並行全部 context exceeded 好。等 x570 套用 `-c 24576 -np 4` 後再改回 4。

## 建議

1. x570 實體登入或提供 SSH key／密碼，確認三個 systemd unit 是 enabled + active，並抓 `journalctl`。
2. x570 套用 `-c 24576 -np 4`，4×Q5 驗證、`nvidia-smi` 記錄。
3. MBP 若要再開 24576，必須用 LaunchAgent／launchd（不要用 tmux），並保留 exit code 與 30 分鐘負載紀錄。
4. 保持 `.env` `LLM_MAX_CONCURRENT=1` 直到 x570 context 修好。
