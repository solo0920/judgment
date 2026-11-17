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
- MBP 的 24576 測試只用於驗證 4×5,749-token；x570 實際 `/props` 是 total_slots=4、slot_ctx=24576（kv_unified）。

## x570

### 1. 目前實際運行的三個 model

直接查 `/props`（不需 SSH）：

| Port | Model | total_slots | default n_ctx |
|---|---:|---:|---:|
| 11435 | bge-reranker-v2-m3-q8_0 | 4 | 8192 |
| 11436 | gemma3-4b-q4_k_m | 4 | 24576（slot_ctx 24576，kv_unified） |
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

### 3. 2026-11-17 本機輸出（已確認）

- 三個 unit 都是 `enabled` + `active`，自 12:50:13 起已運行 7 小時。
- chat 已套用 `--ctx-size 24576`；`/props` 回報 total_slots=4、slot_ctx=24576（log 也顯示 `n_slots=4, n_ctx_slot=24576, kv_unified=true`）。
- 4 個並行、每個 5,749-token 的請求：4/4 HTTP 200、finish stop，total tokens 5,888–5,916；沒有 context exceeded。
- `nvidia-smi`：RTX 5070 Ti，16303 MiB total、5408 MiB used、10431 MiB free、44°C、48% util。
- `ollama` systemd service 已 inactive；GPU 上只有三個 llama-server。
- 20 mixed：20/20 operational、0 error；40 mixed：32 operational／8 retrieval_only（8 llm_busy）、0 error。
- 重開機後 4×Q5 仍 4/4 HTTP 200、finish stop；20 mixed 20/20 operational（first_partial p95 3,572 ms）；40 mixed 32 operational／8 retrieval_only，first_partial p95 6,556 ms。
- UFW active；規則細節不寫進 repo，請在 x570 本機確認只允許必要來源與 port。
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
- 目前沒有觀察到 x570 service 中斷；7 小時內 active。套用 24576 後重啟一次是管理操作，不是崩潰。
- **重開機驗證已通過**（20:36:41）：三個 unit 都在開機時自動 active，沒有第一次啟動失敗；chat `/props` slot_ctx 24576，GPU 5311 MiB used／10529 MiB free。
- **UFW 套用後第二次重開已通過**（21:32:55）：boot_id 改變；三個 unit 14 秒後自動 active、NRestarts=0；`ufw`／`tailscaled` enabled+active。重開後 LAN 11434–11437 仍 timeout，kernel 仍有 `[UFW BLOCK]`；Tailscale 11435–11437 `/health` 200。

## x570 24576 後（2026-11-17 20:29）

`.env` 已改為：

```text
LLM_MAX_CONCURRENT=4
LLM_NUM_CTX=6144
```

20 mixed：

```text
operational 20／retrieval_only 0
first_partial p95 2,736 ms
done p95 14,529 ms
error 0
```

40 mixed：

```text
operational 32／retrieval_only 8（8 llm_busy）
first_partial p95 5,720 ms
done p95 14,128 ms
error 0
```

沒有 context exceeded；摘要比例 20/20（20 mixed）與 12/20（40 mixed）。

## 建議

1. x570 重開機，確認三個 unit 自動 active、`/props` slot_ctx 24576、VRAM 正常。
2. 加 SSH 公鑰，讓後續 `systemctl`／journal 檢查不必實體登入。
3. MBP 若要再開 24576，必須用 LaunchAgent／launchd（不要用 tmux），並保留 exit code 與 10 分鐘負載紀錄。
4. 觀察 40 mixed 的 8 個 llm_busy 是否可接受；若要提高摘要比例，再考慮佇列期限或 provider 速度。
