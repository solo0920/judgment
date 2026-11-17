# RAG 容量第三輪評估：coverage 快取、串流 first_partial 與下一個瓶頸

- 日期：2026-11-17
- 目的：回應同事第三輪審查，先用 trace／程式碼確認「每查詢約 1.1 秒固定成本」，再實作 coverage 快取，最後用串流端點重測 20 mixed 與 40 non-LLM
- 範圍：只改 RAG 請求路徑的 coverage 快取與觀測；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 前一份報告：`specs/005-retrieval-evaluation/rag-capacity-second-review-2026-11-17.md`
- 實作 commit：`f412396 perf: cache exact index coverage on RAG path`
- 原始資料：`specs/005-retrieval-evaluation/rag-capacity-coverage-cache-raw-2026-11-17.json`
- 摘要 CSV：`specs/005-retrieval-evaluation/rag-capacity-coverage-cache-2026-11-17.csv`

## 測試環境

- 應用：MBP FastAPI（loopback），單一 uvicorn worker。
- 推論：x570 llama-server（chat／embedding／reranker）；x570 chat 仍是 `n_ctx=8192`、4 slots 共用 KV 池，尚未套用 `-c 24576` 或 `-c 32768`。
- Fallback：MBP llama-server `127.0.0.1:11436`（OpenAI API）。**不是 Ollama**；Ollama 沒有成為 runtime fallback。
- Reranker：x570 `:11435` primary、MBP `:11435` fallback，每個 endpoint timeout 3 秒。
- 索引：`judgments_v003`、`bge-m3`、version 5；`JudgmentDocument` current rows 與 `JudgmentVectorIndex` rows 都是 4,681,502。
- 20 mixed stream：10 LLM（Q1／Q2／Q5）＋10 非 LLM（Q3／Q4）。
- 40 non-LLM：20 Q3＋20 Q4，走非串流 `/api/rag/query`。

## 摘要

同事第三輪的五點，四點成立，一點要補正：

```text
1. coverage 是固定成本，而且是 40 並行 p50 13 秒的主因：成立，已修。
2. 非串流 20/40 不是 demo 指標，要在串流端點量 first_partial：成立。
3. 要回報 provider 分布，demo 關閉 MBP fallback：成立；但 fallback 是 MBP llama-server，不是 Ollama。
4. 排隊要用 ETA 立即降級：方向成立；公式要改成 token／service-time 加權，不能只用 ahead/slots。
5. LLM 要用 async HTTP、executor 分道：成立；目前串流端點是 14-worker default executor，sync httpx 會占住 worker。
```

但量測結果有一個重要修正：

```text
coverage 快取把 first_partial 中位數從 8.34 秒降到 2.20–3.56 秒，
也把 40 non-LLM p95 從 18.57 秒降到 6.66 秒（cold）／5.46 秒（warm）。

可是串流 20 mixed 的 first_partial p95 仍不穩定：
cold run 3.76 秒，warm run 8.68 秒。
原因已經不是 coverage，而是 reranker 的 6.1 秒雙 endpoint timeout
（3 秒 x570 + 3 秒 MBP），以及 Q5 的 law rerank／judgment rerank 序列。
```

也就是說：

```text
第 1 點先做是對的，coverage 快取已把檢索段的主要固定成本拿掉。
但「first_partial p95 ≤ 4 秒」要穩定通過，下一個必須先修的是 reranker 暖機／心跳／總 deadline，
不是 token gate。
```

## 一、逐項判定

| 同事的主張 | 判定 | 本輪證據 | 要做的事 |
|---|---|---|---|
| coverage 約 1.1 秒是 40 並行 p50 13 秒主因 | **同意，已實作** | 直接量測 `index_coverage` 1,207–1,281 ms；Q4 總耗時 1,188 ms；40 non-LLM p50 12.4 秒 | 已完成 TTL＋single-flight 快取；再加啟動暖機／背景刷新 |
| 非串流 20/40 不是 demo 指標 | **同意** | 串流 baseline first_partial p50 8.34／p95 10.83 秒；非串流 p50 12.4 秒不能代表 SSE | 之後的容量驗收以串流 first_partial、queued、degraded、done 為主 |
| 要列出 provider 分布 | **同意** | baseline 20 mixed：2 次 x570 primary 成功、1 次 MBP fallback 成功、其餘 25 次 LLM 嘗試失敗；fallback 那題 9.49 秒 | error span 也要記 provider；demo 關閉或獨立 gate MBP fallback |
| 「MBP 的 Ollama」fallback | **用詞要修正** | `.env` 是 `LLM_FALLBACK_URL=http://127.0.0.1:11436`、`LLM_FALLBACK_API=openai`、`LLM_FALLBACK_MODEL=gemma3:4b` | 文件與回報一律寫 MBP llama-server；Ollama 不是 runtime fallback |
| ETA admission，不要固定等 8 秒 | **方向同意，公式要改** | 目前沒有 gate；done p95 仍 35 秒，降級多在 10–20 秒後才發生 | token 加權 ETA、`queued {position, eta_s}`、逾時立即 `degraded` |
| LLM 改 async HTTP | **同意** | stream 用 `asyncio.to_thread`，default executor 14；LLM 是 sync `httpx.stream` | `httpx.AsyncClient`；retrieval／DB 用獨立 bounded executor；DB pool 對齊 |
| `-c 32768 -np 4` | **暫不決定** | 沒有 x570 `nvidia-smi`；MBP 只驗證 `-c 24576 -np 4` 的 4×2,833 | 先取得 x570 權限與 VRAM，再決定 24576 或 32768 |
| 答案快取／預熱排在 gate 之前 | **同意，但要加條件** | 範例題命中可省 LLM；但 cache key 與 citation 驗證不能省略 | 先 coverage 快取與暖機，再做 answer cache；key 要含索引快照與檢索參數 |
| x570 權限排最前 | **同意，但不能讓其他工作全停** | x570 仍不可 SSH／sudo；MBP 只能驗邏輯 | x570 與本地快取／reranker／async 並行；GPU 結論仍等 x570 |

## 二、Coverage 固定成本：已證實，已快取

### 1. 成本位置

`answer_question` 在 embedding 之前先做：

```text
active_version()                   2.7–52.5 ms
index_coverage()                   1,207–1,281 ms
  count(JudgmentDocument current)  4,681,502 rows
  count(JudgmentVectorIndex ...)   4,681,502 rows
```

Q4「銀行法有多少條文？」是最乾淨的證據：總耗時 1,188 ms，embedding、Qdrant、rerank、LLM 都是 0，幾乎全部是 coverage。20 mixed 的 coverage span 是 3.3–8.0 秒，40 non-LLM 是 3.3–9.4 秒；40 個請求同時做 40 次全 collection count，正是 p50 13 秒的来源。

### 2. 實作

新增 `cached_index_coverage()`，放在 `src/judgment/judgment_index.py`：

- key：`(session_factory identity, collection, model, version_id)`。
- process-wide `threading.Lock`＋per-key single-flight：同一個 key 只有一個請求真的做 count，其他請求等它完成後讀快取。
- TTL：預設 300 秒，可用 `RAG_COVERAGE_CACHE_TTL_SECONDS` 調整；設 0 可停用。
- 失敗時若有舊值，回傳舊值並把重試時間縮短到 30 秒，避免失敗時每個請求都重打 DB。
- invalidation：`activate_version()`、`rollback_version()`、`reconcile_alias(repair)`、`index_judgments()` 完成後清除。
- trace metadata：`cache_hit`、`cache_wait_ms`、`cache_refresh_ms`、`cache_stale`，可直接在 `rag.coverage` span 看到。
- `rag.coverage` 已加入 RAG pipeline snapshot 的顯示清單，前端 waterfall 會看到這個 span。

不是把 `index_coverage()` 本人改成有快取；admin／indexing 仍用 exact 版本，避免管理頁拿到過期數字。

### 3. 量測

Q4 單題（連續 3 次）：

| 狀態 | duration |
|---|---:|
| 快取前 | 1,203／1,177／1,353 ms |
| 快取後第一次（cold） | 1,338 ms |
| 快取後第二次、第三次 | 68／94 ms |

40 non-LLM：

| 情境 | n | p50 | p95 | max | 結果 |
|---|---:|---:|---:|---:|---|
| 快取前 | 40 | 12,449 ms | 18,568 ms | 19,236 ms | 40/40 operational |
| 快取後，warm | 40 | 2,560 ms | 5,463 ms | 5,537 ms | 40/40 operational |
| 快取後，cold | 40 | 5,592 ms | 6,664 ms | 6,719 ms | 40/40 operational |

cold 是指重啟後、快取內沒有值；40 個請求同時到達，只有一個真的做 count，其他 39 個在 single-flight 等它。8 並行的直接證據：

```text
1 個 cache_hit=false，cache_refresh_ms=1,148.5
7 個 cache_hit=true，cache_wait_ms=1,080–1,148
Q3 完成 2.55–2.69 秒；Q4 完成 1.43–1.46 秒
```

所以：

- 快取把「每個請求都做一次 count」變成「每個 TTL 週期做一次」。
- cold burst 仍要等那一次 count；span 顯示 1.1 秒不代表快取失效，要看 `cache_hit` 與 `cache_wait_ms`。
- 要讓 demo 的第一個 burst 也不等，應在啟動時暖機，或在 TTL 到期前背景刷新。這是下一步，不是本次已完成的範圍。

### 4. facet／count 快取

`/api/query` 的 facet、total、summary 是另一條瀏覽路徑，不在本次 RAG demo 的請求路徑上；本次 40 non-LLM 的 span 沒有 facet count，主要固定成本就是 coverage。因此：

- 先做完 coverage 快取與暖機。
- facet／count 快取另案量測 `/api/query` 後再做，不把它和 RAG 請求路徑混在一起。
- 若 demo 會大量使用瀏覽頁，再把 `(database, table, normalized filters)` 做 TTL 快取；仍要保留 exact 查詢給管理／除錯。

## 三、串流端點：真正的 demo 指標

### 1. Baseline

20 mixed（10 LLM＋10 非 LLM），SSE `/api/rag/query/stream`，coverage 尚未快取：

| 指標 | 結果 |
|---|---:|
| first_partial n | 15 |
| first_partial p50／p95／max | 8,342／10,832／10,968 ms |
| first_token n | 10 |
| first_token p50／p95／max | 11,564／28,346／28,346 ms |
| done p50／p95／max | 9,423／25,111／34,636 ms |
| operational／retrieval_only | 13／7 |
| HTTP error | 0 |

這才是 demo 會看到的曲線：引用要 8–11 秒才出現，done 最慢 34.6 秒。

### 2. 快取後

| 情境 | first_partial p50 | first_partial p95 | first_partial max | done p50 | done p95 | operational／retrieval_only | error |
|---|---:|---:|---:|---:|---:|---|---:|
| 快取前 | 8,342 ms | 10,832 ms | 10,968 ms | 9,423 ms | 25,111 ms | 13／7 | 0 |
| 快取後 cold | 3,561 ms | 3,762 ms | 10,259 ms | 6,534 ms | 35,812 ms | 10／10 | 0 |
| 快取後 warm | 2,201 ms | 8,677 ms | 8,867 ms | 5,579 ms | 34,945 ms | 10／10 | 0 |

判讀：

- 中位數明顯改善：8.34 秒 → 2.20–3.56 秒。
- cold run 的 p95 3.76 秒「剛好」低於 4 秒，但 max 10.26 秒；warm run 的 p95 8.68 秒，沒有通過。**不能說 first_partial p95 已穩定 ≤4 秒。**
- warm run 的 coverage 幾乎都是 0.02–0.06 秒，p95 卻被三題拉高：
  - Q5-5：`rag.rerank` 6,092 ms（3 秒 x570 timeout＋3 秒 MBP timeout）。
  - Q5-8：`rag.rerank` 6,196 ms。
  - Q3-12：first_partial 5,232 ms，也是 reranker／檢索尾端。
- cold run 的 Q5-5 也是 10.26 秒，原因同樣是 6.1 秒 rerank timeout，不是 coverage。
- 因此下一個 first_partial 瓶頸是 **reranker 的雙 endpoint 3 秒 timeout**；這與第二輪報告的「冷啟動 6.10 秒」是同一個問題，只是在 burst 中再次出現。

### 3. done 的尾巴沒有被 coverage 快取修好

done p95 仍是 34.9–35.8 秒，主要不是檢索，而是：

```text
10 個 LLM 請求同時打到 x570 4-slot／8192 共用池
  → context exceeded
  → 目前 retry 仍會再試 strict、primary、fallback
  → 最壞 4 次 LLM
  → done 被拉到 35 秒
```

快取讓檢索更快，反而讓 10 個 LLM 請求更集中地打到同一個池；LLM 降級比例由 baseline 7/20 變成 10/20。這不是快取造成品質退步，而是**下一個瓶頸被暴露出來**：

```text
coverage 快取解決的是「檢索固定成本」；
done 尾巴與 degraded 比例要由 token gate、retry 分類、absolute deadline 解決。
```

### 4. SSE 事件缺口

目前串流事件只有：

```text
partial、token、token_reset、result、error
```

還沒有的：

- `queued {position, eta_s}`：排隊時就讓使用者知道前面還有幾位。
- `degraded {reason}`：`context_exceeded`、`llm_timeout`、`citation_invalid`、`queue_full` 要能區分。
- heartbeat：排隊或長 LLM 時每 10–15 秒送一次，避免 proxy／瀏覽器切斷。
- `first_partial` 與 `queued`／`degraded` 的時間要進 performance record，不能只看 done。

## 四、Provider 分布與 MBP fallback

### 1. 20 mixed 的實際分布

| 情境 | x570 primary 成功 | MBP fallback 成功 | 失敗的 LLM 嘗試 | LLM 降級 |
|---|---:|---:|---:|---:|
| 快取前 baseline | 2 | 1 | 25 | 7/10 |
| 快取後 cold | 2 | 0 | 27 | 10/10 |
| 快取後 warm | 1 | 0 | 29 | 10/10 |

baseline 的 fallback 成功是 Q2-4，stream LLM 呼叫 9.49 秒；先前非串流同一台 fallback 曾出現 26.8 秒。這代表：

- MBP fallback 的延遲與 x570 完全不同，混合後的容量數字不能用來推估 x570 修好後的容量。
- 這次 fallback 只服務 1/20，比例不高，但足以讓 p95 與 done 的解釋失真。
- **demo 應關閉 MBP fallback，或把它放在獨立 gate／獨立容量假設後面；x570 失敗時直接降級，不要讓開發機與應用程式爭用資源。**

### 2. 用詞修正

同事寫「MBP 的 Ollama」，實際設定是：

```text
LLM_FALLBACK_URL=http://127.0.0.1:11436
LLM_FALLBACK_MODEL=gemma3:4b
LLM_FALLBACK_API=openai
```

這是 MBP 上的 llama-server，不是 Ollama。Ollama 沒有被設成 runtime fallback，也不應該被自動啟動來補位。這一點要寫進 demo runbook，避免有人看到 `gemma3:4b` 就誤以為是 Ollama。

### 3. error span 缺少 provider

目前只有成功的 `rag.llm_request` 有 `provider`／`base_url`；失敗的 span 是 `None`。所以 provider 分布只能從成功呼叫推算，不能回答「這次失敗是 primary 還是 fallback 造成」。要補：

```text
rag.llm_request metadata:
  provider=primary/fallback
  base_url=...
  status=ok/error
  error_class=...
  http_status=...
```

否則下一次 burst 還是只能看到「有 27 次失敗」，不知道失敗打到哪裡。

## 五、ETA admission：方向對，公式要改

同事的 `admit(need)` 方向正確：預估等不到就立即降級，不要讓使用者白等 8 秒。但 `eta = (ahead / slots) * ema_service` 只在「所有請求大小相同、service time 固定」時成立；LLM 的 service time 會隨 prompt＋output tokens 變動，Q1/Q2/Q5 差異很大。

建議：

```python
eta = estimate_wait(
    waiters_ahead=queue[:position],
    slots=slots,
    throughput_tokens_per_s=ema_throughput,
    service_time_per_request=ema_service,
)
if eta > remaining_deadline_s * 0.8:
    raise Degrade(reason="busy", eta=eta)
```

更具體：

- 用 token 加權：`eta = sum(need_ahead) / throughput_tokens_per_s`，或用 `ceil(ahead / slots) * ema_service` 當下限。
- `ema_service` 要分 provider（x570 primary／MBP fallback）與 lane（LLM／retrieval），不能共用一個平均。
- `queued {position, eta_s}` 的 ETA 是估計值，前端要允許它變動；不要承諾精確秒數。
- `max_queue` 可以由 ETA 決定，但仍要有絕對上限（例如 12–16），避免連線與記憶體累積。
- `need > slot_tokens` 的請求先縮 context；縮到最小仍放不下就 `degraded`，不要丟 `ValueError` 變成 500。
- gate 必須 process-wide；單 worker 最簡單。若未來開多 worker，要共享 admission，否則每個 worker 各自超賣。
- `acquire` 與 `release` 要在 `try/finally`；timeout 與 grant 的 race 要處理（`fut.done()` 但已 timeout 時要 release）。

還有一個實作順序問題：目前的 `answer_question` 是 sync，不能在裡面直接 `await` async gate。要先決定 execution model（見下一節），否則 gate 只會變成另一個 blocking thread。

## 六、Async HTTP 與 executor 分道

### 1. 現況

- 非串流 `/api/rag/query`：FastAPI／Starlette 丟到 AnyIO threadpool，limiter 40。
- 串流 `/api/rag/query/stream`：`asyncio.to_thread(run_query)`，MBP 10 cores 的 default executor 上限 `min(32, cpu+4)=14`。
- LLM 呼叫在 worker thread 內用 sync `httpx.post`／`httpx.stream`。

所以 10 個生成中的 LLM 請求會占住 10 個 asyncio worker；14 個 worker 的池子在 20 mixed 時只剩 4 個給非 LLM／DB／CPU。這不是「gate 還沒生效」而已，而是**執行資源本身已經被 LLM 占住**。

### 2. 建議

```text
LLM lane:
  httpx.AsyncClient
  async stream
  直接由 SSE event loop 消費 token
  不占 executor worker

Retrieval／DB／CPU lane:
  專用 ThreadPoolExecutor（例如 8）
  bounded queue
  與 LLM lane 分開

DB:
  pool size >= retrieval executor 並行數
  否則多出來的 thread 只是在等連線
```

實作邊界：

- 把 `answer_question` 拆成「retrieval（sync）＋ generation（async）」兩段，或提供一個 async 入口給 stream endpoint。
- 不要只把 sync `httpx.stream` 包進 `asyncio.to_thread`；那仍然是 thread-per-LLM。
- 非串流 endpoint 可以維持 sync wrapper，但 LLM 階段也要走 async client；必要時用 `anyio.from_thread` 或把 endpoint 改成 async。
- SSE 在等待 gate 時送 `queued` 與 heartbeat；token 回來時直接寫入 queue，不經 worker thread。
- 這樣才真正實現「分道」：LLM 長請求不再占住 retrieval 的 thread。

## 七、`-c 32768 -np 4`：暫不決定

目前沒有 x570 SSH／sudo，所以以下都不能定案：

- x570 的 VRAM 總量、已用、free、溫度、GPU 使用率。
- chat、embedding、reranker 三個模型同時駐留後，KV cache 還剩多少。
- 4×5,000 tokens 是否真的能同時跑。
- 32768 是否比 24576 更適合這個 build。

算術上：

```text
24576 / 4 = 6144 per slot
32768 / 4 = 8192 per slot

Q5 實際 prompt 5,006 + output 384 = 5,390
6144 slot 只剩約 754 tokens 餘裕
8192 slot 約有 2,802 tokens 餘裕
```

所以 32768 對 Q5 明顯更安全；但 KV 成本也增加。以 Gemma 3 4B 的公開架構粗估，f16 KV 約 136 KiB/token：

```text
24,576 tokens ≈ 3.2 GiB
32,768 tokens ≈ 4.3 GiB
q8_0 KV 約一半，但需要 flash attention，且要驗證品質
```

這只是估算，不能取代 `nvidia-smi` 與模型 config。若 VRAM 夠，32768 比 24576 更適合「4×Q5 不必在邊緣裁剪」；若不夠，24576＋exact token gate 仍是合理選擇。決策程序：

```text
1. nvidia-smi 記錄 total/used/free/temperature/utilization
2. /props 確認 total slots 與 n_ctx
3. 套用候選 -c -np
4. 4×3,000 與 4×Q5 各跑一輪
5. 同時記錄 VRAM、溫度、是否 context exceeded
6. 再決定 24576 或 32768
```

`LLM_NUM_CTX` 在應用端是「單一請求可用的 context」，不是 pool；不要把它設成 24576 或 32768。應新增 `LLM_POOL_CTX`、`LLM_SLOTS`、`LLM_SLOT_CTX`，並讓 gate 對 primary／fallback 分開計算。MBP fallback 目前仍是 8192，不能假設它放得下 5,000-token prompt。

## 八、快取與預熱的順序

### 1. 已經完成的 coverage 快取

- TTL 300 秒、process-wide、single-flight、失敗保留舊值、版本切換失效。
- 40 non-LLM p95 由 18.57 秒降到 6.66 秒（cold）／5.46 秒（warm）。
- 這是目前成本最低、效果最直接的一個修正。

### 2. 還缺的 coverage 暖機

cold burst 仍要等一次 1.1 秒 count。建議：

- 啟動時在背景做一次 `cached_index_coverage` 暖機。
- 或每 TTL/2 做一次背景刷新（例如 150 秒），避免 demo 前剛好過期。
- 暖機失敗只記 warning，不阻擋應用啟動。

### 3. 答案快取與範例題預熱

同意 cache 的成本最低；若 key、失效與 citation 驗證都已具備，應排在 gate 之前。若尚未具備，不要讓 gate 等 cache。key 不能只有問題字串，至少包含：

```text
正規化問題
檢索參數版本（top_k、threshold、rerank、law-first、filter）
索引快照／version_id
LLM model／provider
lane／session 權限（若不同權限不能共用）
prompt／citation schema 版本
```

而且：

- 只快取 `operational` 且有合法 citations 的答案；`retrieval_only`／`degraded` 不快取。
- 命中後仍要跑 citation 驗證；不要因為 cache 繞過品質檢查。
- 索引版本切換要失效；文件更新／重建也要失效。
- 相同問題的 single-flight 可以合併，但不同 session／權限不能共用。
- 範例題預熱要在索引啟動後做，且要記錄命中率與版本。

## 九、修正後的實作順序

| 階段 | 工作 | 驗收 | 狀態 |
|---|---|---|---|
| P0-0 | x570 權限、`nvidia-smi`、`/props`、`-c 24576` 或 `32768`、4×3,000／4×Q5 | 4/4 或至少 3/4；VRAM／溫度有紀錄；無 context exceeded | **blocked：沒有 SSH／sudo** |
| P0-1 | coverage TTL／single-flight 快取；啟動暖機或背景刷新；error span 記 provider | 40 non-LLM p95 < 10 秒；Q4 warm < 100 ms；first burst 不再等 1.1 秒 | 快取已完成；暖機／provider metadata 待做 |
| P0-2 | reranker 暖機、每 60 秒 heartbeat、3 秒總 deadline／fallback 策略 | 20 mixed first_partial p95 穩定 ≤ 4 秒；不再出現 6.1 秒雙 timeout | **本輪新發現，應排在 gate 前** |
| P0-3 | exact tokenization；token budget gate；ETA 立即降級；citation-only retry；absolute deadline；SSE `queued`／`degraded`／heartbeat | Q5 不被 estimate 誤擋；500／timeout 不再重試；done p95 < 20 秒；降級 < 10 秒 | 待做 |
| P0-4 | LLM 改 `httpx.AsyncClient`；retrieval／DB 專用 executor；DB pool 對齊；demo 關閉或獨立 gate MBP fallback | 10 個 LLM 不再占滿 14 workers；非 LLM p95 不受 LLM lane 影響 | 待做 |
| P1-1 | 字母標籤；27 題＋至少 10 題人工抽查；再評估 grammar | citation 合法率、來源覆蓋、忠實度不退步 | 待做 |
| P1-2 | 答案快取、範例題預熱、single-flight；coverage 背景刷新 | 範例題命中不占 LLM／GPU；cache key／失效正確 | 可提前與 P0-3 並行；key 未完成則不阻塞 gate |
| P1-3 | 串流 20/40 重測；記錄 first_partial、queued、degraded、done、provider 分布 | 20 mixed p95 ≤ 4 秒；40 mixed 超量請求 < 5 秒 degraded；0 連線中斷 | 待 P0-2～P0-4 |
| P2 | session、Turnstile、全域上限；Cloudflare origin／安全驗證 | 公開前全部通過 | 待做 |

與同事順序的差異：

1. **x570 仍是第一優先，但不能讓所有工程停在那裡。** coverage 快取已在沒有 x570 的情況下完成並量測；reranker／async 也可以先用 MBP 驗邏輯。
2. **coverage 快取已完成，但 first_partial p95 還沒穩定。** 下一個要修的是 reranker，不是 token gate；否則 20 mixed 會一直出現 6–10 秒的 first_partial 尾。
3. **token gate 與 retry／deadline 要同一輪做。** 只做 gate 而不改 retry，done 仍會被 4 次 LLM 呼叫拉長。
4. **answer cache／預熱在 key、失效、citation 驗證都具備時，可以排在 gate 之前；但不要讓 gate 等 cache。** 無論順序如何，都要先完成 coverage 暖機與 reranker 暖機，不然 cache 命中前的第一個 burst 仍會被這兩個固定成本拖慢。
5. **串流 20/40 重測應在 P0-2～P0-4 之後。** 現在重測只會量到 reranker 與 LLM retry 的尾，不能驗收 gate。
6. **安全與 Turnstile 仍在公開之前，不能因為容量測試 0 error 就開 tunnel。**

## 十、限制與未解問題

- 20 mixed 串流只跑兩輪（cold／warm），p95 會受 reranker 與 x570 排隊影響；3.76 與 8.68 都是樣本，不是 SLA。
- 40 non-LLM 也只跑 cold／warm 各一輪；p95 6.66／5.46 秒是 baseline，不是穩定承諾。
- 沒有 x570 `nvidia-smi`；所有 VRAM、KV、溫度的結論都還是推論。
- MBP `-c 24576 -np 4` 只驗證 4×2,833，沒有驗證 4×5,000。
- provider 分布只來自成功呼叫；error span 沒有 provider，還不能回答「失敗打 primary 還是 fallback」。
- coverage cache 是 process-wide、單 worker；若未來開多 worker，每個 worker 會各自有一份快取，需要共享快取或 sticky routing。
- cold burst 仍要等一次 1.1 秒 count；啟動暖機／背景刷新尚未實作。
- 答案快取尚未實作；本輪沒有 cache 命中率、沒有答案忠實度比較。
- facet／count 快取尚未做；它不在本次 RAG demo 路徑上。
- `ground_truth_cases` 仍是 0；本輪不宣稱 Recall／nDCG。
- registry 未觸碰：429 terms、10 active、419 candidates 維持不變；候選沒有啟用，也沒有 `legal_reviewed` 宣告。
- 法律品質仍未經 30 題人工審查；字母標籤與 grammar 都還是 PoC 階段。

## 十一、回覆同事（濃縮版）

```text
同意你的五點，尤其是第 1 點。coverage 已證實是固定成本：
index_coverage 單次 1.2 秒，Q4 總耗時 1,188 ms，幾乎全是它。
40 並行時每個請求都做一次全 collection count，p50 13 秒合理。

已實作 TTL 300 秒＋process-wide single-flight：
- 40 non-LLM：p50 12.4 → 5.6 秒（cold）／2.6 秒（warm）
- p95 18.6 → 6.7 秒（cold）／5.5 秒（warm）
- Q4 warm 68–94 ms
- cold burst 仍等一次 1.1 秒，所以還要啟動暖機。

第 2 點成立：串流才是 demo。baseline first_partial p50 8.34／p95 10.83 秒。
快取後 p50 2.20–3.56 秒，但 p95 3.76–8.68 秒，不穩定。
原因不是 coverage，而是 reranker 6.1 秒雙 endpoint timeout（3 秒＋3 秒）。
所以 first_partial p95 ≤4 秒要先把 reranker 暖機／心跳／總 deadline 做完，
不是直接進 token gate。

第 3 點成立：baseline 20 mixed 是 2 次 x570 primary、1 次 MBP fallback、其餘失敗。
但 fallback 是 MBP llama-server（127.0.0.1:11436，openai API），不是 Ollama。
demo 應關閉或獨立 gate fallback，否則容量會混合兩台機器。

第 4 點 ETA 方向對；公式要改成 token 加權，且 max_queue 仍要有絕對上限。
第 5 點 async HTTP 同意；目前 stream 用 14-worker default executor，
sync httpx.stream 會占住 worker，10 個 LLM 就吃掉大部分池子。

-c 32768 暫不決定；沒有 x570 nvidia-smi。32768/4=8192 對 Q5 更安全，
但 KV 約 4.3 GiB（f16 粗估），要確認三個模型同時駐留的 VRAM。
先取得 x570 權限，再套 24576 或 32768，跑 4×3,000 與 4×Q5。

順序調整：
1. x570 權限（blocked，但持續）
2. coverage 快取（已完成）＋暖機
3. reranker 暖機／心跳／deadline（新提前）
4. token gate＋ETA＋citation-only retry＋absolute deadline＋SSE 事件
5. async LLM＋executor／DB pool＋關閉 demo fallback
6. 字母標籤＋27 題＋10 題人工
7. 答案快取／範例題預熱（key／驗證完成才提前；否則與 gate 並行）
8. 串流 20/40 重測
9. session／Turnstile／安全驗證
```

## 附錄：量測資料與檔案

- `specs/005-retrieval-evaluation/rag-capacity-coverage-cache-raw-2026-11-17.json`：本輪原始結果（Q4 前後、40 non-LLM 前後、20 stream 前後、provider 與 coverage cache metadata）。
- `specs/005-retrieval-evaluation/rag-capacity-coverage-cache-2026-11-17.csv`：摘要表。
- `specs/005-retrieval-evaluation/rag-capacity-burst-raw-2026-11-17.json`：第二輪 20 mixed／40 non-LLM 原始結果。
- `specs/005-retrieval-evaluation/rag-capacity-second-review-2026-11-17.md`：第二輪評估與共用 KV 池量測。
- `specs/005-retrieval-evaluation/rag-capacity-context-poc.csv`：`-c 24576` 與 context 壓測。
- `specs/005-retrieval-evaluation/rag-capacity-tokenization-poc.csv`：estimator vs actual tokens。
- `specs/005-retrieval-evaluation/rag-capacity-letter-poc.csv`：字母標籤 PoC。
- `tests/test_rag.py`：`test_cached_index_coverage_reuses_and_invalidates` 覆蓋 TTL 快取、invalidation、cache hit metadata。
