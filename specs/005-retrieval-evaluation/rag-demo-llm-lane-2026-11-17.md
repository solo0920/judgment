# Demo LLM lane 決策：MBP 24576 受監督 + x570 fallback

- 日期：2026-11-17
- 目的：回應第八輪審查的 demo 決策與 2.7 秒缺口重測
- 範圍：只改 demo LLM 執行位置與量測；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 相關資料：`rag-demo-llm-lane-2026-11-17.json`／`.csv`
- 監督腳本：`scripts/run_mbp_llm_24576.sh`

## 決策

**Demo 的 LLM 摘要 primary 改用 MBP llama-server `127.0.0.1:11440`，`-c 24576 -np 4`（slot 6144）；x570 只在連線失敗時作 fallback。**

原因：

- x570 目前仍是 `n_ctx=8192`，Q5 在併發下會 context exceeded；40 mixed 的摘要是 0/20。
- MBP 24576 已驗證 4×5,749-token 全部 HTTP 200、finish stop、total tokens <6,144。
- 用 supervisor 啟動後，20 mixed 與 40 mixed 都完成，MBP server 沒有再退出；4 個 LLM 並行可正常生成。
- x570 實體登入與 `-c 24576 -np 4` 仍是長期修正；在完成前，demo 不應該停留在「摘要一半失敗」。

`.env` demo 設定：

```text
LLM_URL=http://127.0.0.1:11440
LLM_API=openai
LLM_MODEL=gemma3:4b
LLM_NUM_CTX=6144
LLM_MAX_CONCURRENT=4
LLM_FALLBACK_URL=http://x570:11436
LLM_FALLBACK_API=openai
LLM_FALLBACK_MODEL=gemma3:4b
```

Fallback 只在 `ConnectError`／`ConnectTimeout`／`ConnectionError`／`OSError` 時使用；HTTP 500、context exceeded、ReadTimeout 不會 fallback。這是程式分類，不是巧合。

## 量測

### 1. MBP 4×5,749-token

```text
prompt_tokens 5,749
total_tokens 5,895／5,895／5,898／5,918
HTTP 200 4/4、finish_reason stop 4/4
slot 上限 6,144
```

### 2. 20 mixed（MBP primary）

```text
檢索結果 20/20
first_partial p50 2,633／p95 2,680 ms
statuses：operational 14／retrieval_only 6
LLM 摘要：4 個成功、6 個 llm_busy
error 0
```

### 3. 40 mixed（MBP primary）

```text
檢索結果 40/40
first_partial p50 5,635／p95 6,276 ms
statuses：operational 24／retrieval_only 16
LLM 摘要：4 個成功、16 個 llm_busy
error 0
```

摘要比例：20 mixed 4/10（40%）、40 mixed 4/20（20%）。這是回報數字，不是通過門檻；忙碌只出現在摘要，不出現在檢索。

40 mixed first_partial p95 6.28 秒，未達 4 秒。

## 2.7 秒缺口：多行程重測

用 4 個 process × 10 threads 重跑 40 mixed：

```text
first_partial p50 4,777／p95 5,574 ms
client.request_ms p50 1,118／p95 3,944 ms
statuses：operational 24／retrieval_only 16
error 0
```

判讀：

- 多行程把 `client.request_ms` p95 從 5,218 降到 3,944 ms，客戶端 GIL／執行緒排程確實貢獻了一部分。
- 但 first_partial p95 仍有 5,574 ms，缺口沒有消失；殘餘在伺服器端的 accept／event-loop／連線排隊，不能在應用層用 admission 解釋完。
- 下一步要量 uvicorn accept backlog、`--limit-concurrency`、keep-alive／連線重用，或把 Cloudflare 放在前面；目前不能斷言 2.7 秒全是 client 或全是 server。

## MBP 退出調查

- `log show --last 2h --info --debug` 搜尋 jetsam／memorystatus／llama-server：沒有輸出。
- `memory_pressure` 當時顯示 free 78%，swapins/swapouts 0；沒有觀察到 OOM 的直接證據。
- 但 supervisor 與 server 曾一起消失、log 沒有 exit line；這個模式仍像程序群被終止，不能排除記憶體壓力或 macOS 程序管理。
- 改用 supervisor 後，只要 server 先啟動，20／40 mixed 都能完成；若 server 在 app 啟動前不存在，app 會得到 connection refused。
- 因此 demo runbook 必須是：**先啟動 MBP supervisor，確認 `/health` 200，再啟動 judgment-web**。斷路器只能避免重複等待，不能取代啟動順序。

## Demo 文案

- `llm_busy`：後端 notice 已寫「摘要服務忙碌，先顯示檢索結果；請稍後再送出以取得 LLM 摘要。」
- `llm_error`：顯示檢索結果與錯誤原因，不顯示未驗證回答。
- 對外展示時，主軸是「檢索 + 來源引用」；摘要是附加功能，並如實標示容量限制。

## 限制

- MBP 24576 只有一個 supervisor，尚未做成 launchd/systemd 等級的服務；重開機不會自動啟動。
- 40 mixed first_partial p95 6.28 秒，未達 4 秒。
- 20／40 的摘要比例受 LLM gate 4 並行限制；這是刻意設計，不是失敗。
- x570 實體登入與 `-c 24576 -np 4` 仍待完成；完成後要重跑 4×Q5 與 40 mixed。
- 多行程重測只排除一部分 client 因素，還沒量到 uvicorn accept 時間。
- `ground_truth_cases` 仍是 0；沒有 Recall／nDCG 宣稱。
- Registry 未觸碰：429 terms／10 active／419 candidates；candidate 未啟用；RAG 文字維持 14px。
- 沒有 push；所有 commit 只在本機。

## 下一步

1. 量 uvicorn accept backlog／`--limit-concurrency`／keep-alive，確認 40 first_partial p95 能否降到 4 秒內。
2. x570 實體登入、`-c 24576 -np 4`、4×Q5、`nvidia-smi`；完成後把 x570 恢復為 primary 或獨立 gate。
3. sentence-level citation 檢查、`invalid_marker_count`、`uncited_sentence_count`、`unsupported_citation_count`。
4. 合併同步／串流 strict 迴圈。
5. 11 題人工複核＋rerank 盲看＋C 組。
6. reranker semaphore、答案快取、公開前安全驗證與路由白名單。

## 附錄

- `scripts/run_mbp_llm_24576.sh`：MBP 24576 監督啟動腳本。
- `rag-demo-llm-lane-2026-11-17.json`／`.csv`：20／40 mixed、4×5.7k、多行程 40 的原始數據。
- `rag-citation-review-2026-11-17.csv`：11 題人工複核佇列。
