# RAG 容量與同事架構建議評估

- 日期：2026-11-17
- 目的：逐項評估同事提出的容量、降級與兩階段設計，並用實測數據回答「可不可行」
- 測試環境：
  - 應用：MBP `127.0.0.1:9200`（FastAPI）
  - 推論：x570 llama-server
    - chat `gemma3:4b`，`11436`，build `b1-631109b34`
    - embedding `bge-m3`，`11437`
    - reranker `bge-reranker-v2-m3`，`11435`
  - x570 `/props`：`n_ctx=8192`、`total_slots=4`
  - fallback：MBP llama-server `127.0.0.1:11436/11437/11435`
- 相關基線：`specs/005-retrieval-evaluation/rag-pipeline-five-question-benchmark.md`

## 結論

同事的方向大致正確，而且有一項比原本預期更嚴重：

```text
x570 的 8192 不是「每個 slot 8192」，而是四個 slot 共用的 KV 池。
目前只要兩個 5,000-token 的問題同時到達，就會出現 Context size has been exceeded；
應用端會重試 4 次，約 22–23 秒後才降級成 retrieval_only。
```

因此，優先順序應該是：

1. **先把 x570 chat server 的總 context 調成 `24576`（4 × 6144）**，否則任何並行設計都會被 500 淹沒。
2. **應用端要有 context-aware 的閘門**：不是只數「4 個 slot」，而是估算「目前所有進行中請求的 prompt + output tokens 總和」。
3. **只對 citation 驗證失敗重試**；context exceeded、HTTP 500、timeout 不應再重試與 fallback。
4. 之後才做 JSON grammar、分道、快取、session 與 Turnstile。

## 一、逐項可行性

| 同事建議 | 判定 | 實測／程式證據 | 備註 |
|---|---|---|---|
| 用 grammar／JSON schema 約束輸出，取代驗證失敗重試 | **部分可行** | `response_format` 在 x570 與 MBP 都回 400 `Failed to initialize samplers`；原生 `grammar` GBNF 可用 | 要用 `grammar` 欄位，不是 `response_format`；JSON PoC 三個 LLM 題都一次產出合法引用，耗時 0.92–1.45 秒 |
| 縮短 prompt 與輸出（`num_predict` 384 → 256） | **可行** | 384 tokens 解碼 2.19 秒、256 tokens 1.46 秒（約 175 tok/s） | 每次 LLM 呼叫可省約 0.73 秒；若仍呼叫兩次，約省 1.5 秒 |
| Reranker 失敗退回向量排序 | **已實作，說法需修正** | `rag.py` 在 `outcome.status != "ok"` 時直接回傳 `fallback_hits`；暖機逾時那次回應仍有 2 筆引用 | trace 的 `selected=0` 只代表 rerank 選了 0 筆，不代表回應沒有來源；這是 trace 欄位的誤導 |
| Reranker 逾時改 6 秒 | **不建議** | 目前 3 秒 × 兩個 endpoint（x570 + MBP）順序嘗試，暖機實測 6.10 秒 | 改成 6 秒會讓最壞情況變 12 秒；應維持 3 秒或更低，並在第一個 timeout 後直接降級 |
| 兩階段回應：先檢索、後摘要 | **已部分實作** | `/api/rag/query/stream` 在 LLM 前先送 `partial`，內含 judgments／law_sources；前端已處理 `partial`／`token`／`token_reset` | 單人 first partial 1.80 秒；4 並行 LLM 時 first partial 1.96–3.37 秒 |
| 分道：輕量／檢索／摘要 | **可行，且有必要** | 8 並行混合：4 個非 LLM 全部成功（2.1–4.1 秒），4 個 LLM 全部在 17.6 秒後降級 | 非 LLM 與 LLM 不應排同一條隊 |
| `LlmGate` 以 slot 數為上限 | **方向可行，但不能只數 slot** | 目前 4 slots 共用 8192；4 個 3,000-token 請求會 500 | 閘門必須依 context 預算，不是依 slot 數 |
| 快取＋single-flight＋預熱範例題 | **可行，尚未實作** | 目前沒有 answer cache；`cache_prompt` 預設已是 true | 相同問題同時到達時，single-flight 可直接省掉重複 GPU 工作 |
| 匿名 session＋Turnstile＋全域上限 | **可行，本次未測** | 目前沒有 session、Turnstile、rate limit 或 `MAX_ACTIVE` | 屬於下一階段；需先有 context gate，否則擋不住 500 |
| 用並行爬升找 p95 拐點 | **方法正確，但現在量不到真正的拐點** | 目前並行測試先撞到 context 上限，不是 GPU 上限 | 先修 `-c`，再重跑 1/2/3/4/5/6/8 |

## 二、最關鍵發現：8192 是共用池

### 直接對 llama-server 壓測

每次請求約 2,833 tokens，`cache_prompt=false`，同時送出：

| 服務 | 並行數 | 結果 | 觀察 |
|---|---:|---|---|
| x570 `11436` | 2 | 2/2 成功 | wall 0.94–0.96 秒；prompt_ms 492–706 |
| x570 `11436` | 3（每題約 2,033 tokens） | 3/3 成功 | wall 0.98–1.01 秒 |
| x570 `11436` | 3（每題約 2,833 tokens） | **3/3 HTTP 500** | `Context size has been exceeded.` |
| x570 `11436` | 4（每題約 2,833 tokens） | **4/4 HTTP 500** | 同上 |
| MBP 現行 `8192` | 4（每題約 2,833 tokens） | **4/4 HTTP 500** | 與 x570 相同 |
| MBP 測試 `-c 24576 -np 4` | 4（每題約 2,833 tokens） | **4/4 成功** | `/props` n_ctx=6144；`/slots` 四個 slot 都是 6144 |

結論：

```text
x570 /props 的 n_ctx=8192 是總池，不是每 slot。
3 × 2,833 = 8,499 > 8,192 → 全部 500。
4 × 2,833 = 11,332 > 8,192 → 全部 500。
```

`-c 24576 -np 4` 的 MBP 驗證證明這個修法是有效的：四個 2,833-token 請求全部成功。MBP 的 wall 13.2–13.4 秒是 MBP 的速度，不代表 x570；x570 的 prefill 在 2 並行時約 0.5–0.7 秒，修好後應由 x570 重測。

### 對應用端的影響

目前 `LLM_NUM_CTX=8192` 只用在「單一請求」的 context fitting，並不知道同時有其他請求。所以：

- 一個 5,000-token 的 Q5 可以單獨跑。
- 兩個 Q5 同時到 → 10,000 tokens > 8,192 → 兩個都失敗。
- 失敗後 `answer_question` 會跑 `strict=False`、`strict=True` 兩輪；每輪又先試 primary、再試 fallback，所以一個請求最多 4 次 LLM 呼叫。

實測：

| 情境 | 結果 | 耗時 | LLM 呼叫 |
|---|---|---:|---:|
| 單題 Q1 | operational / llm | 5.32–5.45 秒 | 2 |
| 兩題 Q5 同時 | 2/2 retrieval_only | 22.1–23.5 秒 | 各 4 |
| 四題 LLM 同時 | 4/4 retrieval_only | 23.4–23.5 秒 | 各 4 |
| 四題混合（Q1/Q2/Q3/Q4） | 4/4 operational | Q4 1.57–1.70 秒；Q3 2.30–2.64 秒；Q1 5.22–8.98 秒；Q2 8.68–10.01 秒 | 2 |
| 八題非 LLM（Q3/Q4 ×4） | 8/8 operational | 中位數 3.97 秒；最大 5.08 秒 | 0 |
| 八題混合（4 LLM + 4 非 LLM） | 非 LLM 4/4 成功；LLM 4/4 retrieval_only | 非 LLM 2.1–4.1 秒；LLM 17.6 秒 | 4 |

這組數字同時證明兩件事：

1. **context 是目前第一瓶頸，不是 GPU 算力。** 4 個 3,000-token 請求的總量超過 8,192，所以還沒開始比 GPU 就先 500。
2. **分道是有效的。** 8 並行下，非 LLM 題仍可在 2–4 秒完成；LLM 題則會拖到 17–23 秒。把兩者分開，至少能保住一半的服務品質。

## 三、兩階段 SSE 實測

以 `/api/rag/query/stream` 量測第一個 `partial`（檢索結果）與最終 `result`：

| 情境 | first partial | first token | 最終 result | 狀態 |
|---|---:|---:|---:|---|
| 單題 Q1 | 1.80 秒 | 2.69 秒 | 3.96 秒 | operational |
| 4 並行 LLM（Q1/Q2/Q5/Q1） | 1.96–3.37 秒 | 2.54–10.07 秒 | 5.28–19.66 秒 | 1 題 retrieval_only，3 題 operational |
| 4 並行混合（Q1/Q2/Q3/Q4） | 2.15–2.57 秒 | 3.74–3.96 秒 | Q4 1.73 秒；Q3 2.58 秒；Q1 4.91 秒；Q2 8.53 秒 | 全部 operational |

判讀：

- 同事要求的「所有人 p95 看到第一批結果 ≤ 3 秒」在本次小樣本大致成立：單人 1.8 秒，4 並行 2.0–3.4 秒。
- 但最終摘要完成時間在 4 並行 LLM 時最差到 19.66 秒，且結果不穩定（同一題有時 operational、有時 retrieval_only）。這是 context 溢出與重試造成的，不是兩階段設計本身。
- 因此「先檢索、後摘要」是正確的，且已經存在；下一個工作是把「摘要道」的 admission 與降級做對。

## 四、Citation retry 的真正原因

### 不是「缺少引用」，而是「把法律條號寫成來源編號」

實際抓取第一次 LLM 輸出：

| 題目 | prompt 內的來源數 | 第一次輸出看到的 markers | 問題 |
|---|---:|---|---|
| Q2 銀行法 | 2（銀行法、判決） | `[1]`、`[2]`、`[3]` | `[3]` 不存在；模型自己多編一個來源 |
| Q5 保險法 | 3（保險法、金融消費者保護法、保險業務員管理規則） | `[19]`、`[17]`、`[15]`、`[4]` | 這些是法律條號（第19條、第17條、第15條），不是來源編號 |
| Q1 侵權 | 3 | `[1]`、`[1, 2]` | 正常，第一次就通過 |

所以 strict retry 大部分時候不是「補 citation」，而是「把條號誤認成來源編號」後，再生成一次。這也解釋了為什麼 Q5 會連續兩次失敗：模型仍然把第19條寫成 `[19]`。

### 三種格式的 PoC

用同一組 retrieved contexts，直接對 x570 呼叫一次：

| 題目 | 格式 | 耗時 | 引用 | 判定 |
|---|---|---:|---|---|
| Q1 侵權 | JSON + grammar | 1.45 秒 | `[1,2,1,2]` | 有效 |
| Q2 銀行法 | 目前 `[n]` | 2.19 秒 | `[33, 35, 2]` | 無效（條號與來源編號衝突） |
| Q2 銀行法 | `{{n}}` | 1.38 秒 | `[12, 12, 35]` | 無效（仍把條號放進大括號） |
| Q2 銀行法 | JSON + grammar | **0.92 秒** | `[1]` | 有效 |
| Q5 保險法 | 目前 `[n]` | 2.87 秒 | `[19, 19, 15, 23]` | 無效（條號與來源編號衝突） |
| Q5 保險法 | `{{n}}` | 3.07 秒 | `[1,1,1,2,2,3,3,3]` | 有效 |
| Q5 保險法 | JSON + grammar | **1.43 秒** | `[1,2,3]` | 有效 |

基線（目前 app）：

```text
Q1：LLM 3.24 秒（2 次呼叫）
Q2：LLM 3.61 秒（2 次呼叫）
Q5：LLM 4.10 秒（2 次呼叫）
```

PoC 的 JSON 模式：

```text
Q1：1.45 秒（1 次呼叫，169 output tokens）
Q2：0.92 秒（1 次呼叫，76 output tokens）
Q5：1.43 秒（1 次呼叫，128 output tokens）
```

三個會用到 LLM 的題目，JSON + grammar 都是**一次呼叫就產生合法引用**。

注意：

- `response_format: {"type":"json_schema"}` 在 x570 與 MBP 都回 **400** `Failed to initialize samplers`；`response_format: {"type":"json_object"}` 也一樣。
- 原生 `grammar` 欄位可用。這是因為這個 build 的 sampler 初始化不支援 OpenAI 的 `response_format`，但支援 GBNF。
- JSON PoC 的 prompt 比正式 pipeline 簡化，三題也不足以代表答案品質；它證明的是「格式可行、延遲大幅下降」，不是「答案一定更好」。上線前要用 27 題 benchmark 比較覆蓋率與忠實度。

### 對 retry 的建議

短期最小修改：

1. 新增 `CitationValidationError`，只對這個例外重試。
2. HTTP 500（context exceeded）、timeout、連線錯誤不要重試，也不要再試 fallback。
3. 若 context 已滿，直接回 `retrieval_only`，並在 SSE 送 `degraded` 事件，不要讓使用者等 20 秒。

這樣即使不做 JSON grammar，也能把 22–23 秒的降級降到約 5–6 秒。

## 五、Cache 與輸出長度的實測

### `cache_prompt`

- 這個 llama-server 的 `cache_prompt` 預設就是 **true**。
- 相同 prefix 第二次請求只處理 1 token（第一次 cold prefill 2,826 tokens 約 314 ms）。
- 但 strict retry 會修改 **system prompt 開頭**，整段 prefix 會失效，所以 cache 幫不上第二次重試。
- 若把 strict 指示改放在 user prompt 的**最後面**，第二次重試可只 prefill 新增的幾十個 tokens，約省 0.3–0.5 秒；但主要成本仍是重新 decode 一次（約 1.5–2 秒），所以收益有限。

### `num_predict`

以固定 prompt、`ignore_eos=true` 量測：

| `max_tokens` | 解碼時間 | 速度 |
|---:|---:|---:|
| 128 | 0.73 秒 | 約 176 tok/s |
| 256 | 1.46 秒 | 約 175 tok/s |
| 384 | 2.19 秒 | 約 175 tok/s |

`384 → 256` 每次呼叫省約 0.73 秒；若仍是兩次呼叫，約省 1.5 秒。若改用 JSON 模式且輸出只有 76–128 tokens，解碼本身約 0.4–0.8 秒。

## 六、Reranker 的正確處理

- 正常情況：rerank 325–676 ms。
- 暖機第一次：6.10 秒，x570 與 MBP 都 `ReadTimeout`，trace 顯示 `status=degraded`、`selected=0`。
- 但 `_rerank_hits` 在 `outcome.status != "ok"` 時會回傳 `fallback_hits`（向量排序前 `rag_top_k` 筆），所以那次回應仍有 2 筆引用。
- 因此同事說的「selected=0 比慢更糟、什麼都不回」**不成立**；實際是 trace 欄位誤導。應該修的是：
  1. 啟動時送一筆暖機 rerank，成功後才對外開放。
  2. timeout 維持 3 秒（或降到 2 秒），第一個 endpoint timeout 後直接降級，不要順序再等第二個 3 秒。
  3. trace 增加 `fallback_selected`／`final_selected`，避免再誤判。

## 七、容量估算

以本次實測與 llama-server 行為為基礎：

| 情境 | 可安全同時進行的 LLM 請求 | 說明 |
|---|---:|---|
| 現況 `-c 8192`，3,000-token prompt | **1–2** | 2 × 2,833 = 5,666 可；3 × 2,833 = 8,499 不可 |
| 現況 `-c 8192`，5,000-token prompt | **1** | 兩個 Q5 就超過 |
| 修正 `-c 24576 -np 4`，3,000-token prompt | **4** | 4 × 6,144 = 24,576；4 × 3,000 = 12,000 |
| 修正 `-c 24576 -np 4`，5,000-token prompt | **3–4** | 4 × 5,000 = 20,000，扣掉 output reservation 仍接近上限 |
| 加上 JSON 模式（一次呼叫、約 100 output tokens） | 同上，但每次佔用時間約 1–1.5 秒 | LLM 階段約為目前 1/3–1/2；實際 throughput 需在 x570 重測 |

以目前的 5 題中位數：

```text
現況 LLM 題：5.3–6.6 秒／次
若 JSON 模式成功：有機會降到 2.5–4.0 秒／次（估算，未在 x570 實測）
非 LLM 題：1.2–2.6 秒／次，且 8 並行仍可在 2–4 秒完成
```

「同時活躍人數」不能只用 slot 數乘，因為：

- prompt 長度差異很大（Q5 5,006 tokens，Q3 幾乎不用 LLM）。
- rerank 與 LLM 會互搶 GPU。
- 超載時目前的降級不是快速拒絕，而是 17–23 秒的重試。

## 八、建議的實作順序

### P0：先讓服務不會因並行而 500

1. x570 chat server 改成：

   ```bash
   llama-server -m gemma3-4b.gguf --host 127.0.0.1 --port 11436 \
     -ngl 99 -np 4 -c 24576 -fa \
     --cache-type-k q8_0 --cache-type-v q8_0
   ```

   或使用這個 build 的新旗標：

   ```bash
   llama-server ... -np 4 --kv-unified-per-slot 6144
   ```

2. 套用後確認：

   ```bash
   curl -s http://x570:11436/props   # n_ctx 應為 6144
   curl -s http://x570:11436/slots   # 四個 slot 都 6144
   ```

   並用 4 個各約 3,000-token 的請求同時測試，必須 4/4 成功。

3. `.env` 的 `LLM_NUM_CTX` 改成 **6144**（每 slot），不是 24576。應用端的 context fitting 要用每 slot 值。

### P0：應用端 context-aware admission

不是 `Semaphore(4)`，而是：

```text
admit(request) 若：
  sum(進行中請求的 estimated_prompt_tokens + num_predict) + 本請求 <= total_context
否則：
  立即回 retrieval_only + degraded 事件
```

需要從 llama-server `/props` 或設定取得 `total_context`（修正後 24,576），並在請求結束時扣回。這樣才能避免「4 個 slot 但總 context 不夠」的 500。

同時：

- `CitationValidationError` 才重試；HTTP 500／timeout 不重試。
- context exceeded 不嘗試 fallback（fallback 也是同一個 8,192 池）。
- SSE 增加 `queued`、`degraded` 事件；`degraded` 時保留 citations。

### P1：JSON grammar 模式

- 用 `grammar`，不要用 `response_format`。
- 由程式把 `{"sentences":[{"text":...,"cite":[...]}]}` 重組回 `text [n]`，或直接回結構化資料給前端。
- 串流模式可先停用 raw token 串流，只送 `partial`（來源）與最終 `result`；這樣前端不會看到 JSON token。
- 用 27 題 benchmark 比較：citation 合法率、答案覆蓋率、忠實度、平均延遲。若 4B 模型在 JSON 模式下答案太短，再考慮 12B 或保留兩次呼叫。

### P1：分道與快取

- Lane A：structured／list／cache hit，不進 LLM 佇列。
- Lane B：embedding + rerank，限制 rerank 並行 2。
- Lane C：LLM，使用 context-aware gate。
- Answer cache key：正規化問題 + 檢索參數版本 + 索引快照 + 模型 ID；single-flight 合併相同問題。
- 預熱 10–20 個 demo 範例題。

### P2：匿名 session／Turnstile／全域上限

- `POST /api/session` 發 HMAC 簽章 id；每個 session 同時一個請求。
- Turnstile 在建立 session 時驗證。
- 全域新 session 速率、佇列長度、總連線數上限。
- 主持人通道用簽章 token，不靠 IP。

## 九、限制

- 沒有 x570 SSH／`nvidia-smi`，所以沒有 VRAM、溫度、GPU 使用率；所有 x570 數字都是應用端 trace。
- 並行測試每級只有 1–2 輪，不足以估 p95；適合當 baseline，不適合直接定 `MAX_ACTIVE`。
- MBP `-c 24576` 測試只證明「4 × 2,833 不會 500」，不證明 x570 的速度。
- JSON PoC 只有 3 題，且 prompt 比正式 pipeline 簡化；不能直接推論答案品質。
- 尚未實作 session、Turnstile、rate limit、cache、single-flight；本次只驗證可行性與成本。

## 十、一句話給同事

```text
方向可行，但第一個要修的不是 retry，而是 x570 的共用 context：
8192 是總池，不是每 slot。先把 -c 改成 24576（4 × 6144），
再加 context-aware admission；否則 4 個 slot 只是 4 個會回 500 的 slot。
retry 的真正原因是模型把法律條號寫成 [n]；JSON grammar 可在一次呼叫內解決，
但 response_format 在這個 build 是壞的，要用原生 grammar。
```
