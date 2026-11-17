# x570 本機檢查與 chat context 變更 runbook

- 日期：2026-11-17
- 目的：在 x570 本機取得 systemd／journal／nvidia-smi 證據，再套用 chat `-c 24576 -np 4`
- 原則：**先蒐集 before，再改設定；embedding／reranker 的 `-np` 先不動**
- 工具：`scripts/x570_service_audit.sh`
- 目前 app 基準：x570 primary、`LLM_MAX_CONCURRENT=1`、20 mixed 16/4 operational、first_partial p95 2,802 ms

## 1. 先存修改前狀態（不改任何設定）

在 x570 本機終端機：

```bash
bash scripts/x570_service_audit.sh before
```

會輸出到 `~/judgment-x570-before-<timestamp>.txt`，內容包含：

- 三個 unit 的 `is-enabled`、`is-active`、`status`
- chat／embedding／reranker 的 journal
- `nvidia-smi` 與 port listener
- 三個服務的 `/props`（total_slots、slot_ctx）
- `ufw status verbose`

請把整份輸出貼回來。這一步不重啟、不修改。

## 2. 判斷 chat context

看 `nvidia-smi`：

- 若 free VRAM 足夠（保守看 >4 GB 餘裕），套用 `--ctx-size 24576`。
- 若 free VRAM 很緊，先不要改；考慮 KV cache q8_0 或 `32768` 之後再評估。
- 不要憑感覺直接上 32768。

chat 現況是 `--ctx-size 8192`，沒有明確 `--parallel`；`/props` 的 `total_slots` 為 4。套用 24576 後應看到：

```text
total_slots 4
slot_ctx 6144
```

以 `/props` 為準，不要只看 unit 檔。

## 3. 套用 chat context（可 rollback）

```bash
sudo bash scripts/x570_service_audit.sh apply-chat-ctx 24576
```

腳本會：

- 備份 `/etc/systemd/system/judgment-llm-chat.service` 到 `.bak.<timestamp>`
- 將 `--ctx-size 8192` 改成 `--ctx-size 24576`
- `systemctl daemon-reload`
- `systemctl restart judgment-llm-chat`
- 等待 `/health`，再印出 unit、GPU、`/props`

如果 chat 起不來，腳本會留下 backup 與 rollback 指令。手動 rollback：

```bash
sudo bash scripts/x570_service_audit.sh rollback
```

**不要在这个阶段改 embedding／reranker 的 `-np`。** 它們目前是預設 4 slots；先量測 chat 24576 的 VRAM 與 4×Q5，再決定是否值得降成 2。

## 4. 4×Q5 驗證

在 MBP 或 x570 上跑 4 個並行、每個約 5,700 tokens 的請求。最簡單是重用 `/tmp/probe_mbp_24576_5k.py`，把 URL 改成 `http://x570:11436`。預期：

```text
4/4 HTTP 200
finish_reason=stop 4/4
total tokens < 6,144
```

重啟後立即跑一次，再連續跑 5–10 分鐘後跑第二次，確認沒有 VRAM 緩慢增加或 context exceeded。

## 5. 重開機驗證（真正的開機載入）

```bash
sudo reboot
```

重開後在 x570 本機：

```bash
bash scripts/x570_service_audit.sh verify
```

確認：

```text
systemctl is-enabled 三個 unit → enabled
systemctl is-active 三個 unit → active
nvidia-smi 三個 model 都載入，VRAM 與重開前接近
/props total_slots=4, slot_ctx=6144
journal 沒有重複失敗或 CUDA/OOM
```

若某個服務第一次啟動失敗、之後 `Restart=on-failure` 才起來，journal 會留下錯誤；這也算未通過開機驗證。

## 6. 同一次登入順便處理

### SSH 公鑰

在 x570 上把自己的公鑰加入：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# 貼上 MBP 的 ~/.ssh/id_ed25519.pub 內容
echo 'ssh-ed25519 AAAA...' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

之後 MBP 的 `ssh x570` 應可直接使用，不需要每次實體登入。不要把私鑰貼到 x570。

### 防火牆

```bash
sudo ufw status verbose
```

若尚未設定，先確認允許的來源與 port；不要直接 `ufw default deny` 後把自己鎖在外面。這一步可以在 SSH 金鑰確認可用後再做。

## 7. 回到 app 設定

x570 24576 驗證通過後，才改 `.env`：

```text
LLM_MAX_CONCURRENT=4
LLM_NUM_CTX=6144
```

重跑 20／40 mixed，與目前 `LLM_MAX_CONCURRENT=1` 的基準比較：

```text
目前：20 mixed 16/4 operational、first_partial p95 2,802 ms
目標：4×Q5 不 context exceeded；摘要比例提升；0 error
```

若 4 並行仍有 context exceeded，先不要硬上；保留 `LLM_MAX_CONCURRENT=1` 或加精確 token gate。

## 8. embedding／reranker `-np`

只有在 chat 24576 後仍發現 VRAM 吃緊，才做這個量測：

1. 記錄目前 4 slots 的 `nvidia-smi` 與 4 並行 rerank p95。
2. 把 embedding／reranker 的 unit 加 `--parallel 2`，重啟。
3. 再記錄 VRAM 與 4 並行 rerank p95。
4. 若 rerank 變慢或 chat VRAM 沒有明顯下降，rollback。

`-np` 不是 batch size；它不直接降低單次 30-candidate rerank 的計算量。

## 目前決策

- **保留 `LLM_MAX_CONCURRENT=1` 作為 x570 的安全下限**，不再調整。
- chat 24576 由 x570 本機執行；在 before 輸出與 nvidia-smi 之前不改。
- embedding／reranker `-np` 先不動；先量測。
- 人工複核留到之後；工程面先把 x570 證據與設定做好。
