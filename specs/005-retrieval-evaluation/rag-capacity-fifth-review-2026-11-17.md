# RAG 容量第五輪評估：資源分解、入口 admission 與 MBP 24576 驗證

- 日期：2026-11-17
- 目的：回應第五輪審查，先做 40 並行的資源占用分解，再實作入口 admission、獨立 RAG executor 與 LLM 併發閘門，最後在 MBP 驗證 `-c 24576 -np 4`
- 範圍：只改 RAG 請求入口、executor、LLM 併發與 Ollama fallback 行為；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 前一份報告：`specs/005-retrieval-evaluation/rag-capacity-fourth-review-2026-11-17.md`
- 實作 commit：`d9652c3 feat: add RAG entry admission and LLM gate`
- 原始資料：
  - `rag-resource-breakdown-2026-11-17.json`／`.csv`
  - `rag-admission-policy-2026-11-17.json`／`.csv`
  - `rag-stream-40-admission-raw-2026-11-17.json`／`.csv`
  - `rag-mbp-24576-2026-11-17.json`／`.csv`

## 摘要

```text
40 mixed 的根因不是 coverage、Qdrant、DB 或 rerank，而是入口沒有 admission：
40 個同步請求同時排進 14 個 default executor worker；
LLM 長請求占住 worker，Q3/Q4 連 trace 都還沒開始。
```

三個修正：

1. **入口 admission**：stream demo path 限制同時 12 個、佇列 8 個；ETA 超過 5 秒立即回 `degraded`。40 mixed 的 admitted first_partial p95 3,959 ms，20 個 busy 通知 p95 152 ms。
2. **獨立 RAG executor**：12 個 worker，不再與其他 endpoint 共用 default executor。
3. **LLM 併發閘門**：`LLM_MAX_CONCURRENT=4`，取不到就立即 retrieval-only，`degraded_reason=llm_busy`，不占住 worker 等待。

但仍有明確缺口：

- 入口 admission 只套在 `/api/rag/query/stream` demo path；sync `/api/rag/query` 仍沒有同一個 gate。
- 20 mixed 有 8/20 立即 busy；這是 admission 的取捨，不是全部服務。
- MBP `-c 24576 -np 4` 只驗證 4×5,749-token 成功；20 mixed 沒有完成，不能宣稱 retrieval_only 已改善。
- Ollama 在測試期間被發現仍會自動載入；已停止並修正「自動把 Ollama 當 LLM fallback」的行為。

## 一、40 並行資源分解

### 1. Span 沒有膨脹，排隊發生在 trace 之前

40 mixed（無 admission）與 20 mixed 的 span 中位數：

| Span | 20 mixed p50 | 40 mixed p50 | 40 mixed p95 |
|---|---:|---:|---:|
| rag.coverage | 0.04 ms | 0.04 ms | 0.08 ms |
| rag.embed_query | 224 ms | 112 ms | 200 ms |
| rag.qdrant_search | 143 ms | 81 ms | 482 ms |
| rag.fetch_documents | 43 ms | 7.5 ms | 161 ms |
| rag.rerank | 830 ms | 628 ms | 1,437 ms |
| rag.llm_request | 1,625 ms | 1,872 ms | 26,564 ms |
| rag.answer_question | 6,682 ms | 2,449 ms | 48,187 ms |

coverage、embedding、Qdrant、DB fetch 都沒有變慢；40 並行反而因請求混合而中位數更低。唯一明顯變高的是 LLM p95（26.6 秒），但 Q3/Q4 沒有 LLM，first_partial 仍被拖到 19–29 秒。

### 2. 直接證據：Q3 的 flow 只有 2 秒，客戶端看到 27 秒

40 mixed 的 Q3 判決列表：

```text
performance_records duration：2.0–2.3 秒
client first_partial：19.4–29.3 秒
```

Performance record 是在 `run_query` 被 worker thread 撿起來後才建立；差距就是 **default executor 的排隊時間**。trace 本身沒有變慢，是因為請求還沒開始跑。

### 3. Executor 與事件迴圈

- stream endpoint 原本用 `asyncio.to_thread(run_query)`，MBP 10 cores → default executor `min(32, cpu+4)=14`。
- 40 mixed 中 20 個 LLM 請求會長時間占住 worker；14 個 worker 被占滿後，Q3/Q4 根本沒有 worker。
- 40 個純非 LLM 請求（無 LLM 占住 worker）在同一個 endpoint 只花 5.4 秒完成；first_partial p50 4.6／p95 5.37 秒，health p95 276 ms。事件迴圈沒有被同步呼叫卡死，主要是 executor 排隊。
- DB pool 等待時間沒有直接 instrumentation；但 DB span 在 40 並行下仍是 7–161 ms，沒有證據顯示它是主因。

結論：**入口 admission＋獨立 executor 是必要的，而且必須在 LLM 佔用 worker 之前生效。**

## 二、入口 admission

### 1. 實作

新增 `src/judgment/admission.py`：

- process-wide async gate，FIFO 等待。
- `max_concurrency`、`max_queue`、`eta_limit_seconds`、service-time EMA。
- 超過 ETA 或佇列上限時立刻 `RagBusy`，不讓請求等到 30 秒。
- stream endpoint 在進入 `run_query` 前 acquire；busy 時送 `degraded` 事件與 `result(status=degraded, degraded_reason=busy)`。
- 佇列中的請求送 `queued {position, eta_s}`；first_partial 從 POST 開始計時，包含入口排隊。
- 獨立 `ThreadPoolExecutor`（預設 12）處理 RAG stream，不再使用 default executor。
- `/api/health` 新增 `admission` snapshot：active、waiters、limits、service EMA。

### 2. 策略比較（40 mixed）

| concurrency／queue／initial service | first_partial p50 | first_partial p95 | busy p95 | queued | operational／retrieval／degraded | error |
|---|---:|---:|---:|---:|---|---:|
| 12／24／2 | 3,238 | 23,903 | 172 | 24 | 22／14／4 | 0 |
| 6／18／2 | 1,802 | 6,978 | 85 | 12 | 13／5／22 | 0 |
| 6／0／8 | 691 | 1,101 | 92 | 0 | 5／1／34 | 0 |
| 12／0／8 | 1,655 | 1,708 | 144 | 0 | 8／4／28 | 0 |
| **12／8／2** | **2,212** | **3,959** | **152** | **8** | **11／9／20** | **0** |

選擇 `12／8／2` 的原因：

- 12 個 active 不超過 14 個 executor，也不超過 12 個專用 worker。
- 8 個佇列讓 40 個請求中約 20 個有機會被服務；其餘 20 個立即 busy。
- 40 mixed admitted first_partial p95 3,959 ms（max 4,058 ms），busy p95 152 ms，0 error。
- 12／24 讓 24 個請求排隊，LLM 長請求把 p95 拖到 23.9 秒；queue 太大反而更糟。

### 3. 20 mixed 的取捨

20 mixed（12／8／2）：

```text
first_partial n 9：p50 1,418／p95 1,661 ms
statuses：6 operational／6 retrieval_only／8 degraded
error 0
```

20 個請求中 12 個被接受、8 個因 ETA 超過 5 秒立即 busy。這符合「寧可讓第 13 位看到清楚忙碌訊息，也不要 20 個都等」的方向，但代價是正常 20 並行也有 40% 被拒。若 demo 希望 20 個全收，需把 LLM lane 與 retrieval lane 真正分開，而不是放寬入口。

### 4. 限制

- Admission 只套在 stream endpoint。sync `/api/rag/query` 仍走 AnyIO threadpool，沒有同一個入口 gate；它目前是 benchmark 路徑，不是 demo 路徑，但這仍是待補項。
- Admission 是 process-wide、單 worker；多 worker 需共享狀態或 sticky routing。

## 三、LLM 併發閘門與降級原因

`LLM_MAX_CONCURRENT=4`，在 `answer_question` 進入 LLM 生成前用非阻塞 `threading.BoundedSemaphore`：

- 取得到：正常生成，finally release。
- 取不到：立即 retrieval-only，`degraded_reason=llm_busy`，不占住 executor 等 LLM。
- LLM 重試後仍失敗：`degraded_reason=llm_error`。
- 未設定 LLM：`degraded_reason=llm_not_configured`。
- rerank 降級仍用獨立的 `rerank_degraded`。

這不是精確 token gate，只是防止 LLM 長請求占滿 worker 的粗閘門。精確 tokenization／KV slot 預算仍待做。

## 四、MBP `-c 24576 -np 4` 驗證

### 1. 啟動與 slot

```text
llama-server --ctx-size 24576 --parallel 4
/props：total_slots=4，slot n_ctx=6144
```

### 2. 4×5,749-token

四個並行請求，每個 prompt 5,749 tokens、輸出約 146–170 tokens：

| 指標 | 結果 |
|---|---|
| HTTP 200 | 4／4 |
| finish_reason | 4／4 `stop` |
| total tokens | 5,895／5,919／5,895／5,895 |
| slot 上限 | 6,144 |
| 延遲 | 21.7–22.5 秒 |

這證明 4×Q5 等級的 prompt 可以放進 6144 slot，沒有 context exceeded。

### 3. 20 mixed 沒有完成

- 測試 server 在 4×5.7k 之後、20 mixed 之前退出。
- 20 mixed 的 10 個 LLM 請求全部 `ConnectError: connection refused`，結果 10 operational／10 retrieval_only。
- log 沒有明確錯誤，退出原因未驗證；不能把它解讀成「10 個 LLM 一定 OOM」。
- 因此本輪**不宣稱** retrieval_only 比例已因 `-c 24576` 改善；只宣稱 4×Q5 安全點已驗證。

### 4. Ollama 事件與修正

測試期間發現 Ollama app 與 child llama-server（11434／55584）仍在執行；20 mixed 的 fallback 曾打到 11434。已：

- 停止 Ollama app 與 child process。
- 修正 `runtime_settings`：當 primary 是 OpenAI-compatible llama-server 時，不再自動把 active Ollama host 加成 LLM fallback；必須明確設定 `LLM_FALLBACK_*`。
- 更新 `tests/test_ollama_hosts.py`，現在斷言 auto fallback 為空。

這是 requirement「Ollama 不得成為 runtime fallback」的必要修正。

## 五、目前判定

```text
20 mixed：admitted first_partial p95 1,661 ms；8/20 立即 busy。
40 mixed：admitted first_partial p95 3,959 ms；20/40 立即 busy；busy p95 152 ms；0 error。
```

如果驗收只看「被接受的請求是否快速」，20 與 40 都暫定通過；如果要求 40 個全部被服務且 first_partial p95 ≤4 秒，**沒有通過**。目前是「少數快速完成、其餘清楚忙碌」，不是「40 個都成功」。

## 六、下一步

1. 精確 tokenization＋token gate（依 primary／fallback slot）＋citation-only retry＋absolute deadline。
2. Sync `/api/rag/query` 補同一個 admission，或明確標示它非 demo 路徑。
3. x570 `-c 24576 -np 4` 與 4×Q5；MBP 測試 server 需由 supervised service 啟動，並記錄退出原因。
4. 20 mixed 用 MBP 24576 重跑，前提是 server 穩定；分開計數 `busy`、`llm_busy`、`llm_error`、`context_exceeded`、`gate_reject`、`citation_invalid`。
5. 40 mixed 重測，確認 admitted first_partial p95 ≤4 秒、busy 通知 <10 秒、0 error。
6. 10 題盲看 rerank 複核＋C 組（只 rerank 前 12–15 筆）。
7. reranker semaphore（上限 2）、demo 關閉 MBP fallback、字母標籤、答案快取。
8. session／Turnstile／全域上限與安全驗證。

## 限制

- Admission 樣本只有 40 mixed 一輪；first_partial p95 3,959 ms 貼近 4 秒，沒有穩定承諾。
- 20 mixed 的 8/20 busy 是刻意取捨；若 demo 需要更高接受率，需先分 LLM／retrieval lane。
- LLM 閘門是併發數，不是 token 預算；Q5 的 5,006-token prompt 仍可能在 slot 邊緣被裁剪。
- MBP 24576 只驗證 4×5.7k；20 mixed 未完成。
- `ground_truth_cases` 仍是 0；沒有 Recall／nDCG 宣稱。
- Registry 未觸碰：429 terms／10 active／419 candidates；candidate 未啟用；RAG 文字維持 14px。
- 沒有 push；所有 commit 只在本機。

## 附錄：檔案

- `rag-resource-breakdown-2026-11-17.json`／`.csv`：20 vs 40 span、Q3 queue gap、40 非 LLM health probe。
- `rag-admission-policy-2026-11-17.json`／`.csv`：五種 admission 策略比較。
- `rag-stream-40-admission-raw-2026-11-17.json`／`.csv`：12／8／2 的 40 mixed 原始結果。
- `rag-mbp-24576-2026-11-17.json`／`.csv`：MBP 24576 / 4×5.7k 與 20 mixed 未完成記錄。
- `src/judgment/admission.py`：entry gate。
- `tests/test_admission.py`：busy ETA 與 FIFO 佇列測試。
- `tests/test_rag.py`：unranked partial、rerank_degraded、llm_busy／llm_error 測試。
