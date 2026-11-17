# RAG 容量第二輪評估：共用 KV 池、token 預算與 20/40 突發負載

- 日期：2026-11-17
- 目的：回應同事第二輪審查，並用新增的 tokenization、letter-label、JSON grammar 與 20/40 突發測試，修正上一輪的判斷
- 範圍：只做評估與量測，不改 runtime、不啟用 expansion、不改 Qdrant／embedding／reranker pipeline、不進行法律審查
- 前一份報告：`specs/005-retrieval-evaluation/rag-capacity-colleague-review-2026-11-17.md`
- 相關基線：`specs/005-retrieval-evaluation/rag-pipeline-five-question-benchmark.md`

## 測試環境

- 應用：MBP FastAPI（loopback）。
- 推論：x570 llama-server（chat／embedding／reranker；port 省略）。
- 測試時 x570 chat：`n_ctx=8192`、`total_slots=4`；尚未套用 `-c 24576 -np 4`。
- Fallback：MBP loopback llama-server（chat ctx 8192；本輪 burst 沒有使用 fallback）。Ollama 不得成為 runtime fallback。
- 20/40 burst 走非串流 `/api/rag/query`；SSE 的 4 並行測試走 `/api/rag/query/stream`。

## 摘要

同事第二輪的三個最高優先判斷成立：

```text
1. x570 的 8192 是四個 slot 共用的 KV 池，不是每 slot 8192。
2. HTTP 500、context exceeded、timeout 不應重試，也不應再試 fallback。
3. admission 不能只數 slot，必須以「在途 prompt + 預期輸出 tokens」的總量為預算。
```

但有三處不能直接照做：

1. **TokenBudgetGate 的 `need` 不能用目前的 `estimate_prompt_tokens`。** 這個估算高估實際 tokens 20–33%；若用它做 gate，Q5 會在 `slot_tokens=6144` 時被擋掉，但 Q5 的實際 prompt 是 5,006 tokens，加 384 output 仍放得下。必須用 `/apply-template` + `/tokenize` 的 exact count，或先用實際 usage 校準。
2. **分道目前只存在於邏輯，不存在於執行資源；但要先分清楚兩個 threadpool。** `/api/rag/query` 是 sync endpoint，FastAPI／Starlette 用 AnyIO threadpool（預設 limiter 40），不是 asyncio 的 14-worker executor；`/api/rag/query/stream` 才用 `asyncio.to_thread`（MBP 10 cores → 14 workers）。20 mixed 與 40 non-LLM 走的是前者，所以不能把延遲全歸因於 14-worker；比較可能是 AnyIO 40、DB pool、embedding／rerank／GPU 與 CPU 競爭。串流道的 14-worker 限制則是 SSE 特有的風險。無論哪一個，兩個 lane 仍然共用同一個 process 與下游資源，沒有真正隔離。
3. **`max_wait=20.0` 太長。** 排隊 20 秒再加 LLM 3–5 秒，仍會超過「20 秒內降級」的目標。要用請求的 absolute deadline，queue wait 約 8 秒，逾時立即送 `degraded` 並保留檢索結果。

排序上，同意同事的修正：**retry 不是第一個瓶頸，共用 KV 池才是。** 但 retry 是放大器：同樣的 context 溢出，單請求約 22–23 秒降級，20 個混合請求時最慢到 54 秒。因此 context 修好後，token gate 與「只對 citation 失敗重試」要同一輪完成，否則 burst 仍然會把 23 秒放大成 40 秒以上。

一句話：

```text
先讓 4 個並行真的可用，再讓每個並行更便宜。
不要用 estimate 做 gate，也不要把 default threadpool 當成分道。
```

## 一、逐項判定

| 同事的主張 | 判定 | 本輪證據 | 要做的事 |
|---|---|---|---|
| 共用 KV 池是最重要的問題 | **同意** | 2×2,833 成功；3×2,833、4×2,833 全部 HTTP 500 | 先改 x570 的 `-c 24576 -np 4`，再談其他 |
| 500／context exceeded／timeout 不重試 | **同意** | 目前每個 strict 輪次都會試 primary + fallback，最壞 4 次 LLM；單題 22–23 秒才降級 | 只對 `CitationValidationError` 重試一次；transport error 直接降級 |
| 用 token 預算做 admission | **方向同意，實作要改** | 估算高估 20–33%；Q5 6,017 estimated vs 5,006 actual；async gate 不能直接在目前的 sync pipeline 內 await | exact tokenization；sync gate 或把 LLM 階段 async 化；absolute deadline |
| 分道，輕量查詢不受摘要道影響 | **同意目標，不同意「現在已獨立」** | sync endpoint 用 AnyIO limiter 40；stream 用 asyncio default executor 14；20 mixed 的非 LLM 3.6–10.5 秒；40 non-LLM p50 13 秒；兩者仍共用 DB／embedding／GPU | 專用 executor／async LLM；LLM lane 上限 4；retrieval lane 分開；量測 AnyIO、asyncio、DB pool |
| 來源改用字母標籤 | **同意，成本最低** | Q1/Q2/Q5 皆合法，覆蓋 3/3、2/2、3/3；沒有 numeric brackets；wall 2.34／1.33／3.04 秒 | 先做 server-side `[A]`→`[1]` 映射，再做 27 題驗證 |
| JSON grammar 取代重試 | **部分同意** | 原生 `grammar` 可用；`response_format` 兩邊都 400；JSON+letters Q2 只引用 1/2、Q5 只引用 1/3 | 不預設上線；先做 27 題＋至少 10 題人工抽查 |
| Reranker timeout 不要加到 6 秒 | **同意** | 冷啟動 6.10 秒（3 秒 × 兩個 endpoint）；正常 325–676 ms；`selected=0` 仍有 vector fallback | 維持 3 秒；啟動暖機＋每分鐘 heartbeat；trace 加 fallback 欄位 |
| 要測 20/40 突發 | **同意** | 20 mixed：13 operational、7 degraded、0 error，p95 44.4 秒；40 non-LLM：40/40 operational，p50 13.0 秒、p95 19.0 秒 | 先修 gate 與執行資源，再重測；40 LLM 目前沒有意義 |
| x570 GPU 數據缺失 | **同意** | 沒有 SSH／`nvidia-smi`；MBP 24576 只證明邏輯，不證明 x570 VRAM | 拿到權限先盤點 VRAM、溫度、三個模型與 KV cache |
| session／Turnstile／全域上限 | **同意往後，但公開前必須有** | 目前沒有 session、Turnstile、rate limit 或 `MAX_ACTIVE` | 容量工作先做；對外曝光前補齊 |
| 「retry 是第一瓶頸」 | **不同意上一輪的排序** | 共用池未修時，retry 只是把 500 放大成 22–54 秒 | 先修池；同一輪再收斂 retry |

## 二、共用 KV 池：已證實，x570 仍未修

### 直接壓測

每次請求約 2,833 tokens，`cache_prompt=false`，同時送出：

| 服務 | 並行數 | 結果 | 觀察 |
|---|---:|---|---|
| x570，`-c 8192` | 2 | 2/2 成功 | wall 0.94–0.96 秒 |
| x570，`-c 8192` | 3（每題約 2,033） | 3/3 成功 | 3 × 2,033 = 6,099 < 8,192 |
| x570，`-c 8192` | 3（每題約 2,833） | **3/3 HTTP 500** | 3 × 2,833 = 8,499 > 8,192 |
| x570，`-c 8192` | 4（每題約 2,833） | **4/4 HTTP 500** | 4 × 2,833 = 11,332 > 8,192 |
| MBP，`-c 8192` | 4（每題約 2,833） | **4/4 HTTP 500** | 與 x570 同語義 |
| MBP，`-c 24576 -np 4` | 4（每題約 2,833） | **4/4 成功** | `/props` `n_ctx=6144`；四個 slot 都是 6144 |

算術本身就是證據：

```text
3 × 2,833 = 8,499 > 8,192 → 全部 500
4 × 2,833 = 11,332 > 8,192 → 全部 500
```

`/slots` 會顯示每個 slot 8192，但那是誤導；真正的上限是 `/props` 的總池。**不要用 `/slots` 的數字做容量規劃。**

### MBP 驗證不等於 x570 完成

MBP 的 `-c 24576 -np 4` 只證明「這個 flag 組合可以讓 4 × 2,833 不 500」，不證明：

- x570 的 VRAM 夠放 24,576 tokens 的 KV cache。
- x570 同時載入 chat、embedding、reranker 三個模型後還有餘量。
- x570 的 build 與 MBP 對 `-c` 的語義完全一致。
- 4 × 5,000 tokens 也能成功（MBP 還沒測這個組合）。

因此 x570 套用前，先由有權限的人跑：

```bash
nvidia-smi
nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu \
  --format=csv
```

確認三個模型與 KV cache 的實際佔用，再套用：

```bash
llama-server -m <chat-model> --host 127.0.0.1 --port <chat-port> \
  -ngl 99 -np 4 -c 24576 -fa
# 若 VRAM 吃緊，且這個 build 支援 quantized KV：
#   --cache-type-k q8_0 --cache-type-v q8_0
```

注意：

- `--kv-unified-per-slot 6144` 不是本輪驗證過的旗標；除非 `llama-server --help` 明確列出，不要直接使用。
- `--cache-type-k q8_0 --cache-type-v q8_0` 可把 KV 佔用約減半，但需要 flash attention，且可能影響輸出品質；要用 27 題比較後才採用。
- 以 Gemma 3 4B 公開架構估算，f16 KV 約 136 KiB/token，24,576 tokens 約 3.2 GiB；q8_0 約 1.6–1.8 GiB。實際值要用模型 config 與 `nvidia-smi` 校正。
- 三個模型（chat、embedding、reranker）同時駐留 GPU 時，VRAM 不是只有 KV cache；若不足，先考慮 q8 KV、降低 reranker 精度，或把 embedding／reranker 移到其他裝置。

### `.env` 的正確順序

`LLM_NUM_CTX` 在應用端是「單一請求可用的 context」，不是 pool。`-c 24576 -np 4` 之後，它應該是 **6144**，不是 24576；但**不要先改**，因為目前的 estimator 會讓 Q5 掉一個 context：

```text
Q5：estimated 6,017 + 384 = 6,401 > 6,144 → 被 estimate 擋掉
Q5：actual    5,006 + 384 = 5,390 < 6,144 → 實際放得下
```

正確順序是：

1. 先實作 exact tokenization（或至少用實際 usage 校準 estimator）。
2. 再改 `.env` 的 `LLM_NUM_CTX=6144`。
3. 同時新增 pool 設定，例如 `LLM_POOL_CTX=24576`、`LLM_SLOTS=4`、`LLM_SLOT_CTX=6144`，避免把「pool」與「slot」混在同一個變數。
4. 若 MBP fallback 仍是 `-c 8192`，它不能和 x570 共用同一個 `LLM_NUM_CTX=6144` 的假設；要嘛把 fallback 也調成 24576，要嘛讓 gate 依 provider 分開計算。**不要讓 fallback 接受一個它放不下的 5,000-token prompt。**

## 三、Retry 與 citation：同意「只重試引用驗證」，但 grammar 不是萬靈丹

### 目前為什麼會等 22–54 秒

現流程：

```text
answer_question
  for strict in (False, True):          # 兩輪
    generate_answer_with_model
      for provider in (primary, fallback):   # 每輪最多兩個 endpoint
        HTTP 500 / context exceeded / timeout 也被當成可重試
```

所以一個請求最壞是 **2 × 2 = 4 次 LLM 呼叫**。在共用 8192 池下，4 個 5,000-token 請求會讓每次呼叫都 500，重試只會把負載再放大一次。20 mixed 的 LLM 題最慢 54 秒，不是因為模型慢，而是因為重試與排隊。

### 建議的錯誤分類

| 錯誤 | 行為 |
|---|---|
| `CitationValidationError`（markers 缺失、越界、格式錯誤） | 最多再試一次；保留同一個 admission 名額與同一組 contexts |
| HTTP 500（含 context exceeded） | **不重試、不 fallback**；直接 `degraded`，保留檢索結果 |
| timeout／連線中斷 | **不重試、不 fallback**；避免在已過載的伺服器上複製工作 |
| 連線被拒絕（請求尚未送出） | 可試一次 fallback；fallback 也要有自己的容量檢查 |
| 模型／伺服器 4xx（非 context） | 不重試；記錄並降級 |

重點：

- `strict` 不要用「任何例外都重試」的 `except Exception`；要先把 citation 驗證失敗包成專用例外。
- 重試時不要重新檢索、不要重新 embed、不要重新 rerank；只重跑 LLM。
- 重試要共用同一個 token reservation；不要讓第二次呼叫重新排隊，否則 citation retry 會變成另一種 20 秒卡頓。
- `degraded` 事件要帶 `reason`（`context_exceeded`、`llm_timeout`、`citation_invalid`、`queue_full`），前端才能區分「檢索成功但摘要失敗」與「系統錯誤」。

### Grammar 的真實價值與限制

PoC 結果：

| 題目 | 格式 | 耗時 | 引用 | 覆蓋 | 判定 |
|---|---|---:|---|---|---|
| Q1 | JSON + grammar（numeric） | 1.45 秒 | `1;2;1;2` | 2/3 | 合法，但少用一個來源 |
| Q2 | JSON + grammar（numeric） | 0.92 秒 | `1` | 1/2 | 合法，但只引用一個來源 |
| Q5 | JSON + grammar（numeric） | 1.43 秒 | `1;2;3` | 3/3 | 合法 |
| Q2 | JSON + letters + grammar | 1.71 秒 | `A;A;A` | 1/2 | 合法，但只引用 A |
| Q5 | JSON + letters + grammar | 1.41 秒 | `C` | 1/3 | 合法，但只有一句、只引用 C |

判讀：

- `response_format: {"type":"json_schema"}` 與 `{"type":"json_object"}` 在 x570 與 MBP 都回 **400 `Failed to initialize samplers`**；原生 `grammar` GBNF 可用。這是 build 的限制，不是應用層。
- grammar 只保證「格式合法」，不保證「內容忠實」或「引用覆蓋」。Q2/Q5 的輸出變短、只引用第一個來源，正是同事擔心的「最短合法輸出」。
- JSON 模式還會失去 raw token streaming；前端只能先拿 `partial`，再等最終 `result`。這是 UX 成本。
- 因此 **不要用 grammar 當預設**；先做 27 題 A/B，至少 10 題人工抽查「每句是否有引用、是否只用了來源 1、敘述是否被簡化到失去資訊量」。若覆蓋率與忠實度沒有退步，再考慮上線。

### 字母標籤：成本最低的第一修正

PoC 用同一組 retrieved contexts，把來源寫成 `[A]`、`[B]`、`[C]`，並在 prompt 明確要求「法律條號寫第19條，不要寫成 [19]」：

| 題目 | 耗時 | 輸出 tokens | markers | 覆蓋 | numeric brackets |
|---|---:|---:|---|---:|---:|
| Q1 | 2.34 秒 | 269 | `B;A;C` | 3/3 | 0 |
| Q2 | 1.33 秒 | 158 | `A;B` | 2/2 | 0 |
| Q5 | 3.04 秒 | 376 | `A;B;C` | 3/3 | 0 |

優點：

- 不需要 grammar，也不需要改 sampler。
- 直接把「來源編號」與「法條號」的數字空間分開。
- 可由程式把 `[A]` 映射回 `[1]`，前端與 citation schema 不用改。

實作注意：

- **不要用 regex 把所有 `[\d+]` 改掉**；那會誤傷法條號。只轉換合法的字母 marker。
- 支援 `[A]`、`[A, B]`、`[A][B]`；遇到不存在的字母要視為 citation 驗證失敗，但只重試一次。
- 若模型把 `[A]` 寫成 `A` 或 `（A）`，可在 prompt 中固定格式；不要讓 post-processing 過度寬鬆，否則會把普通文字誤認成引用。
- Q2 的輸出把 `[A]、[B]` 放在句尾「資料來源」，不是每句都有引用；這代表 **marker 合法不等於句級覆蓋**。citation 驗證若只檢查「至少有一個合法 marker」，仍然會放過這種答案。
- 先用字母標籤，再評估 grammar；不要一次同時改字母、JSON、grammar，否則無法判斷哪個改動造成覆蓋率下降。

`{{n}}` 格式的 PoC 也支持這個結論：Q5 用 `{{n}}` 成功，Q2 仍產生 `[12,12,35]`。所以 `{{n}}` 可以當備援，但不是獨立解法。

## 四、Token budget gate：概念正確，設計要改

同事的 `TokenBudgetGate` 方向是對的：pool 與 slot 分開、FIFO、queue 上限、取消時 release。以下是需要修正的地方。

### 1. 不要用目前的 estimator

| 題目 | estimated | actual input | 高估比例 | `ctx=6144` 的結果 |
|---|---:|---:|---:|---|
| Q1 | 3,771 | 3,070 | 22.8% | 未測；8192 下不掉 context |
| Q2 | 3,965 | 2,972 | 33.4% | 2 → 2，不掉 |
| Q5 | 6,017 | 5,006 | 20.2% | **3 → 2，掉一個 context** |

Q5 是最關鍵的反例：

```text
estimated 6,017 + output 384 = 6,401 > 6,144 → gate 會拒絕
actual    5,006 + output 384 = 5,390 < 6,144 → 實際可以跑
```

所以「沿用上一輪的保守估算」是錯的。保守估算可以用來做 **circuit breaker**（例如估算超過 slot 的 1.5 倍就明顯不正常），但不能做 admission 的唯一依據。

### 2. 用 exact tokenization

在 llama-server 上，`/apply-template` 與 `/tokenize` 都可用：

```text
POST /apply-template  {"messages":[...]}
  → {"prompt":"<start_of_turn>user\n...<end_of_turn>\n<start_of_turn>model\n"}

POST /tokenize        {"content":"<exact templated prompt>","add_special":<match server>}
  → {"tokens":[...]}
```

做法：

1. 用與實際請求完全相同的 messages（system + user + contexts）呼叫 `/apply-template`。
2. 把回傳的 `prompt` 原字串送到 `/tokenize`；`add_special` 要與 server 實際 chat 行為一致，不要固定 `false`。本機 x570 實測：`add_special=true` 得到 22 tokens，與實際 `usage.prompt_tokens=22` 一致；`false` 得到 21。若 template 已含 BOS，才用 `false`。
3. `need = prompt_tokens + output_reserve + 16`（template／stop 的小 margin）。
4. 啟動時快取 system prompt 的固定 token 數；每次只 tokenize 變動的 contexts。
5. 用最近一次實際 `usage.prompt_tokens` 校正；若 `/tokenize` 不可用，才退回「校準後的 estimator」，且誤差要記錄在 trace。
6. 對 primary 與 fallback 分別計算，因為兩邊的 `-c`／slot 可能不同。

不要把 `LLM_NUM_CTX=24576` 當成 slot；`need` 要比的是 **slot_tokens=6144**，總量要比的是 **pool_tokens=24576**。

### 3. `max_wait=20` 改成 absolute deadline

建議：

```text
request_start
  → retrieval（約 1–4 秒）
  → gate wait（最多 8 秒）
  → LLM（約 2–6 秒）
  → 若超過 request deadline（18–20 秒）→ degraded
```

也就是 gate 的 timeout 不要固定 20 秒，而是 `min(8, remaining_deadline)`。這樣：

- 20 mixed 不會出現 44–54 秒的請求。
- queue 滿或等待過久，直接送 `degraded`，使用者仍拿到 citations。
- 若 LLM 已經開始，讓它跑完；不要中途再排一次。

### 4. FIFO 的 head-of-line blocking

`waiters[0]` 若需要 6,000 tokens，而目前只剩 5,000，後面的 2,000-token 請求其實可以跑，但 FIFO 會讓它一起等。建議：

- 先掃描 queue，找第一個 `_fits` 的 waiter（有界掃描，例如前 8 個）。
- 或把 queue 分成「大／小」兩級；但不要完全失去公平性。
- 對 `need > slot_tokens` 的請求，先縮減 contexts；縮到最小仍放不下就 `degraded`，不要丟 `ValueError` 變成 500。

### 5. timeout 與 grant 的 race

`release` 會 `pop` waiter、增加 `in_use`、`fut.set_result(None)`；如果 `asyncio.wait_for` 同時 timeout，`acquire` 可能進 `TimeoutError`，但名額已經被 grant，導致洩漏。至少要處理：

```python
except asyncio.TimeoutError:
    if fut.done() and not fut.cancelled():
        self.release(need)   # grant 與 timeout 同時發生
    raise Degrade()
```

並且 `acquire` 成功後，呼叫端一定要在 `try/finally` 裡 `release(need)`；double release 要有 assertion／metric。

### 6. Gate 的執行模型：這是目前最大的實作障礙

目前 `run_query` 是 **同步函式**。串流 endpoint 用 `asyncio.to_thread(run_query)` 丟到 asyncio default executor（14）；非串流 endpoint 由 FastAPI／Starlette 丟到 AnyIO threadpool（limiter 40）。`answer_question` 內部也是 sync；因此：

- 不能直接在 `answer_question` 裡 `await gate.acquire()`。
- `asyncio.Future` 不能跨 thread 使用；把同事的 async gate 貼進 sync pipeline 不會動。
- 如果在 worker thread 裡用 blocking gate，會佔住該 pool 的 worker；若 gate 和 retrieval 共用同一個 executor，10 個 LLM 等待就會讓非 LLM 沒有 thread 可用。所以 blocking gate 一定要搭配專用 executor，不能只加在同一個 pool 裡。

兩個可行方案：

**方案 A（較小改動）**

- 實作 `ThreadingTokenBudgetGate`（`threading.Condition`），在 worker thread 內 blocking acquire。
- 但 LLM 使用**專用 executor**（例如 4–8 workers），不要用 default threadpool；retrieval 用另一個 executor。
- queue wait 最多 8 秒；`acquire` 回傳後在 `finally` release。
- 缺點：等待仍佔 thread；需要嚴格分開 executor。

**方案 B（建議）**

- 把 pipeline 拆成「retrieval（sync，放 bounded threadpool）」與「LLM（async，`httpx.AsyncClient`）」兩段。
- LLM 階段用 async `TokenBudgetGate`；SSE 可在等待時送 `queued` 與 heartbeat。
- 這也自然實現 lane separation，讓非 LLM 不會被 LLM 長請求佔住 thread。
- 缺點：要改 `answer_question` 的呼叫邊界與 SSE callback，工作量比方案 A 大。

不論 A 或 B，gate 必須是 **process-wide**。如果 uvicorn 開多個 worker，每個 worker 各有一個 gate 只會各自超賣；要嘛單 worker，要嘛用共享的 admission 服務／Redis。以目前 demo 規模，單 worker 較簡單。

### 7. 建議參數與預算試算

```text
pool_tokens   = 24576
slot_tokens   = 6144
slots         = 4
headroom      = 0.95（exact tokenization 後；不要用 0.90 再加 20–33% 高估）
max_queue     = 12–16（不是 24；24 會讓 queue 等太久）
max_wait      = 8 秒（或 remaining deadline）
output_reserve= 256（先用 256；若 27 題品質不掉，再維持）
```

queue 大小是 tradeoff：12–16 會讓 40 突發中約一半立即 `degraded`，但 tail 較短；若要提高接受率，可把 queue 加到 24，但必須量 p95，不能只看 `error=0`。

預算：

| 情境 | 每個 request 的 need | 4 個總量 | 判定 |
|---|---:|---:|---|
| 3,000 prompt + 384 | 3,384 | 13,536 | 4 個可 |
| 5,006 prompt + 384（Q5） | 5,390 | 21,560 | 4 個可（pool 0.95 = 23,347） |
| 5,700 prompt + 384 | 6,084 | 24,336 | 超過 pool；只能 3 個 |
| 6,000 prompt + 384 | 6,384 | — | 單一 request 超過 slot 6,144；先縮 context 或 degrade |

這也修正上一輪「4 × 5,000 只能 3–4 個」的保守說法：**用 exact tokens，4 × Q5 應該放得下**；真正的不確定性是輸出長度與 template overhead，不是 5,006 本身。

## 五、分道：目前沒有真正隔離

同事說「輕量查詢看起來是獨立的，維持這個隔離」。方向對，但**現在的隔離只在程式邏輯，不在執行資源**。

證據要先分清楚兩個 pool：

- `/api/rag/query` 是 sync endpoint；Starlette 1.10 的 `run_in_threadpool` 透過 `anyio.to_thread.run_sync` 執行，AnyIO 預設 limiter 是 **40**（本機實測 `current_default_thread_limiter().total_tokens == 40`）。
- `/api/rag/query/stream` 明確使用 `asyncio.to_thread(run_query)`；MBP 10 cores 的 asyncio default executor 上限是 `min(32, 10 + 4) = 14`。
- 因此 20 mixed／40 non-LLM 走非串流 endpoint，**不是 14-worker 排隊**：20 < 40、40 = 40。40 non-LLM 的 p50 13 秒、p95 19 秒，比較可能是 DB pool／embedding server／CPU／GIL 或 rerank 競爭，需要用 span 才能定論。
- 20 mixed 的非 LLM 3.6–10.5 秒，也可能是同一組下游資源被 10 個 LLM 請求與 retry 拉高，不是 threadpool 直接被 LLM 佔滿。
- 串流道才是 14-worker 風險：20 mixed SSE 若同時進來，10 個 LLM 會佔住 10 個 asyncio worker；這一點本輪沒有測，不能直接套用非串流的結果。
- 8 non-LLM 中位數 3.97 秒、最大 5.08 秒；8 < 40 且 < 14，還沒有撞到這兩個上限，但已比單題慢，顯示 DB／embedding 也有成本。

所以：

1. **同意分道是必要的。**
2. **不同意「現在已經獨立」。**
3. 最小修改不是再加一個 semaphore，而是把執行資源與下游 pool 分開；但先量清楚是哪一個 pool 在排隊：
   - sync lane：AnyIO limiter（目前 40）與 DB pool；必要時用專用 executor／`anyio.CapacityLimiter`。
   - stream lane：asyncio default executor（目前 14）；必要時 `loop.set_default_executor` 或改用 async LLM。
   - LLM lane：專用 executor 或 async；同時最多 4 個 active，queue 12–16。
   - embedding／rerank：各自限制並行；rerank 建議 2。
4. 量測要加：
   - `threading.active_count()`、AnyIO limiter、asyncio executor queue、DB pool wait。
   - `asyncio` debug mode／`loop.slow_callback_duration`，確認 event loop 是否真的有長 callback。
   - 在 metadata／DB 路徑加 span；目前 trace 只看到 embed 65–157 ms、context 19–35 ms、citations 16–29 ms，大部分時間沒有被 span 覆蓋。
5. 不要直接把 default executor 開到 100 threads；那會把壓力轉到 DB 與 embedding，只是把排隊往後推。

## 六、20/40 突發測試：結果與判讀

### 20 mixed（10 LLM + 10 非 LLM）

| 指標 | 結果 |
|---|---:|
| HTTP 200 | 20/20 |
| operational | 13 |
| retrieval_only / degraded | 7 |
| errors | 0 |
| p50 | 12.3 秒 |
| p95 | 44.4 秒 |
| max | 54.1 秒 |
| 非 LLM 範圍 | 3.6–10.5 秒 |

LLM 題的分布：

- Q1：1 operational（12.3 秒）＋ 3 retrieval_only（35.5–44.4 秒）
- Q2：3 retrieval_only（35.7–44.3 秒）
- Q5：2 operational（37.1、54.1 秒）＋ 1 retrieval_only（44.3 秒）

判讀：

- 這不是「20 個人同時掃 QR code 仍可用」的結果。LLM 題有 7/10 降級，最慢 54 秒。
- 主要原因不是 4 個 slot 本身，而是 10 個 LLM 同時進來、共用 8192 池、每個又重試最多 4 次；server 端排隊加上 app 端 retry，把尾 latency 拉到 40 秒以上。
- 非 LLM 雖然全部成功，但 3.6–10.5 秒已超過「3 秒內看到第一批結果」的目標；這是共用 process 的下游資源（DB／embedding／rerank／GPU／CPU）被 LLM 與 retry 拉高的結果，不能直接歸因於 14-worker 的 asyncio executor。

### 40 non-LLM（20 Q3 + 20 Q4）

| 指標 | 結果 |
|---|---:|
| HTTP 200 | 40/40 |
| operational | 40 |
| errors | 0 |
| p50 | 13.0 秒 |
| p95 | 19.0 秒 |
| max | 19.2 秒 |

判讀：

- 40 個非 LLM 請求沒有錯誤，但 p50 13 秒、p95 19 秒，已經貼近 20 秒上限。
- 這組走 sync endpoint，AnyIO limiter 是 40，所以 40 個可以同時進入，不是 14-worker 排隊；延遲比較可能來自 DB pool、embedding server、CPU／GIL 或 rerank。需要先加 span 與 pool metrics，再決定要不要調 executor／DB pool，不能直接說「40 人非 LLM 沒問題」。
- 這也證明「非 LLM 題很輕」只在低並行成立；高並行時，執行資源的配置比查詢本身更重要。

### 40 mixed 尚未測

目前測 40 mixed 沒有意義：4 個 slot 的 LLM 容量就是 4，其餘 36 個只會排隊或降級。等 gate 上線後再測，重點不是「全部成功」，而是：

- 前 4 個 active 能穩定完成。
- 超過 queue 上限的請求在 5 秒內收到 `degraded`，不是等 20 秒。
- 非 LLM lane 的 p95 不受 LLM lane 影響。
- SSE 在排隊時有 heartbeat，連線不會被 proxy／瀏覽器切斷。

目前 SSE 事件只有 `partial`、`token`、`token_reset`、`result`、`error`；`queued`、`degraded`、heartbeat 都還沒有，這是 P0-1／P0-2 要補的。

### 建議的驗收門檻

| 情境 | 門檻 |
|---|---|
| 4 × 3,000 tokens | 4/4 成功；無 500；p95 < 10 秒 |
| 4 × Q5（約 5,000 tokens） | 4/4 成功或至少 3/4；降級要在 5 秒內 |
| 20 mixed | 0 HTTP error；非 LLM p95 < 5 秒；LLM p95 < 20 秒；降級率 < 20% |
| 40 non-LLM | 0 error；p95 < 10 秒（先調 executor／DB pool） |
| 40 mixed | 0 error；超量請求 < 5 秒內 degraded；無連線中斷 |
| SSE | 排隊時每 10–15 秒 heartbeat；`degraded` 保留 citations |

## 七、Reranker、快取與預熱

### Reranker

同意同事：**不要改成 6 秒**。

- 正常 325–676 ms。
- 冷啟動 6.10 秒，因為 x570 與 MBP 兩個 endpoint 各 3 秒 timeout，順序等待。
- `selected=0` 不是「沒有來源」；`_rerank_hits` 在失敗時回傳 vector-order fallback，回應仍有 citations。這是 trace 欄位誤導。
- 做法：
  1. 啟動時送一筆暖機 rerank，成功後才對外開放。
  2. 每 60 秒送一個 cheap heartbeat，保持模型熱度。
  3. timeout 維持 3 秒（或 2 秒）；第一個 endpoint timeout 後直接 fallback，不要順序再等第二個 3 秒。
  4. trace 增加 `fallback_selected`、`final_selected`、`fallback_reason`。
  5. 30 → 20 candidates 的 A/B 只在 27 題品質沒有明顯下降時才採用。

### 快取、single-flight、預熱

- `cache_prompt` 目前預設 true；相同 prefix 第二次只處理 1 token。但 strict retry 會改 system prompt 開頭，整段 prefix 失效；若保留 retry，把 strict 指示放在 user prompt 最後，可省 0.3–0.5 秒 prefill，但 decode 仍要重跑。
- answer cache key 要包含：正規化問題、檢索參數版本、索引快照、模型 ID、filter／lane。不要只 cache 問題字串。
- single-flight 合併相同問題的並行請求；但要小心 session／權限不同的問題不能共用答案。
- 預熱 10–20 個 demo 範例題，讓第一個真實使用者不會遇到冷啟動。
- `num_predict` 384 → 256 每次約省 0.73 秒；先用 27 題確認答案沒有變短到失去資訊，再改。gate 的 output reserve 也跟著用 256。

## 八、x570 GPU、安全與品質門檻

### GPU／VRAM

目前沒有 x570 SSH／`nvidia-smi`，所以以下都還是未知：

- 24,576 tokens KV cache 的實際 VRAM。
- chat、embedding、reranker 三個模型同時駐留的餘量。
- GPU 使用率、溫度、是否撞到 power／thermal limit。
- 4 × 5,000 tokens 是否真的能同時跑。

MBP 的 24576 測試只證明邏輯，不能代表 x570。若 VRAM 不足，優先順序是：

1. `--cache-type-k q8_0 --cache-type-v q8_0`（需 `-fa`，且要驗證品質）。
2. 降低 slot 數或 slot context（例如 3 × 6144 = 18,432），並讓 gate 用實際 pool。
3. 把 embedding／reranker 移到其他裝置或 CPU（會增加延遲，需重測）。
4. 不建議直接把 `-c` 降到會讓 4 × 3,000 失敗的值。

### 安全與曝光

這份報告只做容量評估；對外曝光前仍有 gating：

- x570 網路隔離與 API 綁定尚未完成。
- Cloudflare origin／service token 驗證尚未完成；tunnel 目前未運行。
- session、Turnstile、全域上限尚未實作。
- 安全 headers／CSP、XSS、備份加密、資料保留、供應鏈檢查仍 pending。

因此：**不要因為 20/40 測試「沒有 error」就開放公開 tunnel。** 容量與濫用防護是兩個獨立的門檻。

### 品質

- `ground_truth_cases` 仍是 0；本輪不宣稱 Recall／nDCG。
- grammar／letters 的 PoC 只有 3 題，不能代表 27 題 benchmark。
- 30 題人工審查仍是 gating；目前沒有品質 labels。
- 若要做字母標籤上線，先用 27 題比較「citation 合法率、來源覆蓋、答案忠實度、平均延遲」，至少 10 題人工抽查。
- 法律名詞 registry 本輪未觸碰；429 terms、10 active、419 candidates 維持不變，候選不得啟用。

## 九、修正後的實作順序

| 階段 | 工作 | 驗收 | 相依 |
|---|---|---|---|
| P0-0 | x570 取得權限；`nvidia-smi` 盤點；套用 `-c 24576 -np 4` | 4 × 3,000 4/4；4 × Q5 至少 3/4；無 context exceeded；VRAM 有紀錄 | 需要 x570 SSH／sudo |
| P0-1 | exact tokenization；token budget gate；citation-only retry；absolute deadline；`degraded` SSE | Q5 不再被 estimate 誤擋；500／timeout 不再重試；降級 < 20 秒 | P0-0 或先用 MBP 驗邏輯 |
| P0-2 | 分道：LLM 專用 executor／async；retrieval 分開；heartbeat；AnyIO／asyncio／DB metrics | 20 mixed 非 LLM p95 < 5 秒；LLM p95 < 20 秒；0 error | P0-1 |
| P1-1 | 來源字母標籤；server-side 映射；citation 驗證 | Q1/Q2/Q5 全合法；無 numeric brackets；27 題覆蓋不下降 | P0-1 |
| P1-2 | JSON grammar A/B（letters + grammar） | 27 題＋10 題人工；覆蓋／忠實度不退步才採用 | P1-1 |
| P1-3 | reranker 暖機／heartbeat；`num_predict=256`；cache／single-flight／預熱 | 冷啟動不 timeout；LLM 每次省約 0.7 秒；快取命中率有紀錄 | P0-2 |
| P2-1 | 20/40 突發重測；調整 max_queue／max_wait | 達到第六節門檻；無 40 秒尾延遲 | P0-2、P1-3 |
| P2-2 | session／Turnstile／全域上限；安全驗證 | 公開前全部通過；tunnel 只在 origin 驗證後開啟 | P2-1、安全清單 |

與同事順序的差異：

- 同意「x570 先改」與「token gate＋retry 同時做」。
- 但 **P0-1 之前要先決定 execution model**；否則 async gate 無法落地，sync gate 又會卡住 threadpool。這是本輪新增的重點。
- 20/40 突發測試不是最後才做的「驗收」而已；它應該在 gate 上線後立刻跑一輪，否則 max_queue／max_wait 沒有實際依據。真正的最後一輪可以放在 cache／prewarm 之後。
- session／Turnstile／全域上限在容量工作之後，但**必須在公開 tunnel 之前**；不能等到 demo 當天。

## 十、限制與未解問題

- 沒有 x570 SSH／`nvidia-smi`；所有 x570 GPU 結論都是推論。
- MBP `-c 24576 -np 4` 只測 4 × 2,833，沒有測 4 × 5,000。
- 20/40 突發各只跑一輪，不足以估穩定 p95；數字是 baseline，不是 SLA。
- 20 mixed 的 7 個 degraded 是現況（8192 + 重試）的結果；不能直接推論修正後的行為。
- 40 non-LLM 的 13–19 秒可能是 AnyIO limiter、DB pool、embedding server、CPU／GIL 或 rerank 造成；本輪沒有單獨拆開。它不是 14-worker asyncio executor 的直接證據，因為非串流 endpoint 走的是 AnyIO（limiter 40）。
- 3 題 grammar／letters PoC 不足以判斷答案品質；沒有 27 題與人工 labels。
- JSON grammar 的 GBNF 在 production 需要更完整的跳脫與長度限制；PoC 的 grammar 只是可行性證明。
- `response_format` 在兩個 build 都壞；若未來 build 更新，要重新測試，不要假設永久如此。
- MBP fallback 目前仍是 8192；若 x570 掛掉，fallback 不能承接 4 × 5,000。這一點尚未解決。
- 安全與 Cloudflare 的細節不在本報告；公開前仍以安全驗收矩陣為準。

## 十一、回覆同事（濃縮版）

```text
同意你的三個最高優先：共用 KV 池、500/timeout 不重試、token 預算 admission。
也同意 retry 不該排第一；它是放大器，不是第一因。

但你的 TokenBudgetGate 不能直接用：
- need 不能用目前的 estimate；它高估 20–33%，Q5 會被 6144 誤擋。
- max_wait=20 太長；要 absolute deadline，queue 約 8 秒。
- 目前的 pipeline 是 sync；非串流 endpoint 走 AnyIO limiter 40，
  串流 endpoint 走 asyncio.to_thread（MBP 14 workers）。
  async gate 不能直接在 sync pipeline 內 await；sync gate 又會佔住 worker。
  所以先分 executor／把 LLM 階段 async 化，再談 gate。

分道目前沒有真的存在；20 mixed 的非 LLM 3.6–10.5 秒、40 non-LLM p50 13 秒
是共用下游資源的證據，但不是 14-worker 的直接證據。先量 AnyIO／DB／embedding。

字母標籤先做，成本最低；grammar 再做 27 題＋人工抽查。
20 mixed 現在是 7/20 degraded、p95 44 秒；先修池與 gate，再重測。
```

## 附錄：量測資料

- `specs/005-retrieval-evaluation/rag-capacity-context-poc.csv`：共用 context 與 `-c 24576` 壓測。
- `specs/005-retrieval-evaluation/rag-capacity-format-poc.csv`：bracket／`{{n}}`／JSON grammar PoC。
- `specs/005-retrieval-evaluation/rag-capacity-tokenization-poc.csv`：estimator vs actual tokens。
- `specs/005-retrieval-evaluation/rag-capacity-letter-poc.csv`：字母標籤與 JSON+letters 覆蓋率。
- `specs/005-retrieval-evaluation/rag-capacity-burst-raw-2026-11-17.json`：20 mixed／40 non-LLM 原始結果。
- `specs/005-retrieval-evaluation/rag-capacity-concurrency-raw.json`：1/2/4 並行原始 runs。
