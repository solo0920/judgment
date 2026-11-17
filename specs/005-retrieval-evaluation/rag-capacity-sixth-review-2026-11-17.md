# RAG 容量第六輪評估：檢索／摘要分階段與非同步 LLM

- 日期：2026-11-17
- 目的：回應第六輪審查，把 RAG stream 拆成「檢索階段」與「摘要階段」，檢索完成即釋放 worker，摘要改用 async HTTP；並補 admission 計數、DB pool 對齊、LLM 斷路器
- 範圍：只改 RAG stream 執行模型、admission、DB pool 與 LLM 傳輸；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 前一份報告：`specs/005-retrieval-evaluation/rag-capacity-fifth-review-2026-11-17.md`
- 實作 commit：`c5fdb3a feat: split retrieval and async summary lanes`
- 原始資料：`rag-twophase-2026-11-17.json`／`.csv`

## 摘要

```text
兩階段拆分完成：40 mixed 的 40/40 都收到檢索結果；
summary 只由 LLM admission 控制，entry admission 不再拒絕檢索。
```

結果：

| 情境 | 檢索結果比例 | first_partial p50 | first_partial p95 | summary 取得 | 忙碌 | error |
|---|---:|---:|---:|---:|---:|---:|
| 20 mixed | 20／20（100%） | 1,919 ms | **3,455 ms** | 4／10 LLM | 6 llm_busy | 0 |
| 40 mixed | 40／40（100%） | 5,588 ms | **5,752 ms** | 4／20 LLM | 16 llm_busy | 0 |

判定：

- **20 mixed：100% 檢索，first_partial p95 ≤4 秒，暫定通過。**
- **40 mixed：100% 檢索，但 first_partial p95 5.75 秒，沒有通過 4 秒目標。**
- 「忙碌」已只出現在摘要；40 個請求都先看到檢索結果，16 個 LLM 請求在摘要階段收到 `llm_busy`。
- 40 mixed 的殘餘延遲主要不是 retrieval 或 LLM：server-side `client.request_ms` p95 5,218 ms，是 40 個新 TCP 連線在 flow 開始前的 accept／排隊時間；retrieval span p95 只有 2.49 秒。這是 40-thread probe 的連線成本，不是 admission 或 LLM。即使如此，使用者角度仍是 5.75 秒，不能宣稱達標。

## 一、兩階段執行模型

### 1. 流程

```text
POST /api/rag/query/stream
  → entry admission（只保護檢索）
  → 檢索 executor：answer_question(settings 去除 LLM)
  → 取得 citations／law_sources／contexts
  → 立即釋放 entry admission
  → emit retrieval partial（所有請求都有）
  → LLM admission（4 並行，非阻塞）
      → async httpx.AsyncClient.stream()
      → token 直接進 SSE queue
  → result
```

實作：

- `run_query_two_phase()`：檢索在 `ThreadPoolExecutor`，完成後立刻 release 入口 ticket。
- 檢索階段使用 `llm_url=""` 的 settings，確保不會在 worker 內生成。
- `answer_question(..., return_retrieval_state=True)` 回傳內部 `_retrieval_state`（contexts、citations、law_sources、citation_total），不會出現在 API 回應。
- `generate_answer_with_model_async()`：`httpx.AsyncClient.stream`，不占 executor worker；支援 OpenAI／llama-server SSE、strict retry、token callback。
- 摘要階段使用獨立的 `llm_admission`（max 4、queue 0）；取不到立即 retrieval-only + `degraded_reason=llm_busy`，不排隊占 worker。
- 入口 admission 不再控制摘要，因此 retrieval 不會被 20 秒 LLM 占住。

### 2. 預設值

```text
RAG_ADMISSION_MAX_CONCURRENCY=40
RAG_ADMISSION_MAX_QUEUE=40
RAG_ADMISSION_ETA_LIMIT_SECONDS=30
RAG_STREAM_EXECUTOR_WORKERS=40
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=20
LLM_MAX_CONCURRENT=4
```

DB pool 總量 40，與 retrieval executor 40 對齊；`/api/health` 增加：

```json
"database_pool": {"size": 20, "checked_out": 0, "overflow": -10}
```

40 mixed 後 checked_out 回到 0，沒有觀察到 DB pool 等待成為主因。

## 二、20／40 mixed 結果

### 1. 20 mixed

```text
requests 20
retrieval partial 20/20（100%）
first_partial p50 1,919／p95 3,455／max 3,531 ms
statuses：11 operational／9 retrieval_only
LLM admission：4 admitted／6 rejected（llm_busy）
error 0
```

非 LLM 的 Q3 列表與 Q4 結構化查詢都是 operational；9 個 retrieval_only 是 LLM 摘要忙碌或失敗。20 個使用者都先看到引用。

### 2. 40 mixed

```text
requests 40
retrieval partial 40/40（100%）
first_partial p50 5,588／p95 5,752／max 5,755 ms
statuses：24 operational／16 retrieval_only
LLM admission：4 admitted／16 rejected（llm_busy）
error 0
```

- Q3/Q4 等非 LLM 查詢都拿到 operational 的檢索結果。
- 20 個 LLM 查詢中只有 4 個取得摘要，16 個在摘要階段 `llm_busy`；這是刻意設計，不是 entry 拒絕。
- first_partial p95 5.75 秒，未達 4 秒。

### 3. 40 mixed 延遲的來源

使用 `X-Judgment-Client-Started-At` 量測：

```text
client.request_ms p50 1,500／p95 5,218／max 5,458 ms
retrieval span p95 2,489 ms
first_partial p95 5,752 ms
```

`client.request_ms` 是從客戶端按下送出到 server flow 開始，包含 40 個新 TCP 連線的建立與 accept。40-thread probe 同時開 40 條新連線，這個成本主導了 p95；應用內的 retrieval 與 LLM 已經不是主因。

但這不代表可以忽略：demo 現場 40 個新連線也會遇到類似成本。若要真正達到 40 p95 ≤4 秒，下一步要量 uvicorn accept backlog、HTTP keep-alive／連線重用、以及是否用反向代理統一接管連線；不是再加大 executor。

## 三、一致性與可觀測性

`RagAdmission` 現在回報：

```text
admitted_total
queued_total
rejected_busy_total
completed_total
```

40 mixed 後：

```text
client retrieval partial：40/40
server admission：admitted_total=40、queued_total=0、rejected_busy_total=0、completed_total=40
LLM admission：admitted_total=4、rejected_busy_total=16、completed_total=4
client 摘要忙碌：16 個 llm_busy
```

三者相等；沒有請求在途中遺失或重複計算。

`/api/health` 也回報 `llm_admission`、`database_pool`、`llm_circuit`。

## 四、LLM 斷路器

新增 process-wide breaker：

- 只計 `ConnectError`／`ConnectTimeout`／`OSError`。
- 連續 2 次失敗 → 該 provider 開啟 30 秒；期間直接跳過，不再等逾時。
- 成功一次即清除。
- `/api/health` 的 `llm_circuit` 可看到 failures 與 open_for_s。
- 單元測試：`test_llm_circuit_breaker_opens_after_two_connect_errors`。

這是對 MBP 測試 server 無聲退出的直接防護：即使服務消失，後續請求不會每個都花時間等 connection refused。

## 五、Ollama 與 MBP 24576

- 上一輪已停止 Ollama，並修正 runtime_settings 不再自動把 active Ollama host 加成 LLM fallback；本輪測試期間沒有再使用 11434。
- MBP `-c 24576 -np 4` 的 4×5,749-token 驗證仍成立：4/4 HTTP 200、finish stop、total tokens <6,144。
- MBP 測試 server 在 4×5.7k 之後、20 mixed 之前退出的原因仍未找到；log 沒有明確錯誤。斷路器只能降低影響，不能取代根因調查。
- 因此仍不宣稱 MBP 20 mixed 的 retrieval_only 比例已改善。

## 六、限制與未解問題

- 40 mixed first_partial p95 5.75 秒，未達 4 秒；主因是 40 條新連線在 flow 前的 accept／排隊，應用層無法單獨解決。
- 20 mixed summary 只有 4/10 LLM 取得；40 mixed 只有 4/20。摘要比例是回報數字，不是通過門檻。
- 入口 admission 仍只套在 stream endpoint；sync `/api/rag/query` 沒有同一個 gate。公開網域白名單必須只開串流端點，否則可直接繞過。
- 精確 tokenization／KV slot 預算尚未做；目前 LLM gate 是併發數，不是 token 數。
- MBP test server 退出原因未驗證；x570 長期連續負載穩定性也未測。
- `ground_truth_cases` 仍是 0；沒有 Recall／nDCG 宣稱。
- Registry 未觸碰：429 terms／10 active／419 candidates；candidate 未啟用；RAG 文字維持 14px。
- 沒有 push；所有 commit 只在本機。

## 七、下一步

1. 量 uvicorn accept backlog、keep-alive／連線重用、反向代理連線池；確認 40 新連線的 p95 能否降到 4 秒內。
2. x570 權限、`-c 24576 -np 4`、4×Q5、`nvidia-smi`；同時測長時間連續負載。
3. 精確 tokenization＋token gate＋citation-only retry＋absolute deadline。
4. 40 mixed 重測：100% 檢索、first_partial p95 ≤4 秒、摘要忙碌 <10 秒通知、0 error。
5. 10 題盲看 rerank 複核＋C 組（只 rerank 前 12–15 筆）。
6. reranker semaphore、demo 關閉 MBP fallback、字母標籤、答案快取。
7. 公開網域路由白名單只含串流端點；session、Turnstile、全域上限、安全驗證。

## 附錄

- `rag-twophase-2026-11-17.json`／`.csv`：20／40 mixed 兩階段原始結果、health snapshot、client gap。
- `rag-resource-breakdown-2026-11-17.json`：上一輪的 20 vs 40 span 與 queue gap。
- `rag-admission-policy-2026-11-17.json`：上一輪 admission 策略比較。
- `tests/test_admission.py`：admission FIFO、ETA、counters。
- `tests/test_rag.py`：LLM breaker、llm_busy／llm_error、unranked partial。
- `tests/test_web.py`：兩階段 stream step／partial／token／result。
