# RAG Pipeline 五題實測報告（單人、循序）

- 日期：2026-11-17
- 目的：提供架構評估用的實際 pipeline 分段耗時，不用推估值
- 應用：MBP `127.0.0.1:9200`（FastAPI）
- 模型：x570 llama-server
  - chat：`gemma3:4b`，`11436`
  - embedding：`bge-m3`，`11437`
  - reranker：`bge-reranker-v2-m3`，`11435`
- x570 `/props`：`n_ctx=8192`、`total_slots=4`（三個服務相同）
- 相關設定：
  - `RAG_TOP_K=8`
  - `RAG_RERANK_CANDIDATES=30`
  - `RERANK_MAX_CHARS=1200`
  - `RERANK_TIMEOUT_SECONDS=3`
  - `LLM_NUM_CTX=8192`
  - `LLM_NUM_PREDICT=384`

## 測試方法

- 每題連續跑 3 次，取中位數；表中同時列出最小／最大值。
- 全部循序執行，沒有並行負載。
- 正式五題之前先跑一次 warm-up，不列入統計。
- 所有量測都是 `/api/rag/query` 非串流端點；串流 UI 的總 GPU 工作相同，但使用者感知的 TTFT 會較低。
- 本次量測沒有使用 MBP fallback；LLM provider 為 `primary`、rerank `fallback_used=false`、embedding 指向 x570。

## 五題結果（中位數）

| 題目 | 類型 | 狀態／來源 | 總耗時（範圍） | Embedding | Qdrant | 取文件 | Rerank | Context | 引用組裝 | LLM | LLM 呼叫 |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Q1 侵權行為損害賠償的舉證責任 | 語意 | operational / llm，3 引用 | 5,325 ms（3,597–5,609） | 96.8 | 60.9 | 4.7 | 358.5 | 2.2 | 1.5 | 3,244.0 | 2（1–2） |
| Q2 銀行法對於吸收存款與授信有哪些限制？ | 法規優先 | operational / llm，2 引用 | 5,908 ms（5,494–6,384） | 90.8 | 19.2 | 8.3 | 546.4 | 10.9 | 9.7 | 3,610.1 | 2 |
| Q3 在板橋地方法院相關詐騙的判決有那些 | 判決清單 | operational / retrieval_list，20 判決 | 2,046 ms（1,865–2,070） | 89.8 | 0 | 4.7 | 0 | 20.6 | 16.8 | 0 | 0 |
| Q4 銀行法有多少條文？ | 結構化 | operational / structured，1 法規 | 1,188 ms（1,174–1,217） | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Q5 保險法對於業務員不當招攬的責任規定？ | 法規優先 | retrieval_only / retrieval，4 引用 | 6,590 ms（6,501–6,849） | 123.4 | 64.2 | 9.7 | 666.1 | 25.7 | 24.7 | 4,096.9 | 2 |

單位：毫秒。總耗時包含未列出的 API／解析／序列化等小幅 overhead。

## 觀察

### 1. LLM 是主要成本

三個會呼叫 LLM 的題目中，LLM 佔總耗時約 61–62%：

```text
Q1：3,244 / 5,325 = 60.9%
Q2：3,610 / 5,908 = 61.1%
Q5：4,097 / 6,590 = 62.2%
```

Embedding、Qdrant、取文件、Context、引用組裝合計通常不到 0.5 秒。Rerank 正常約 0.33–0.67 秒，是第二大成本，但遠小於 LLM。

### 2. Strict citation retry 幾乎讓 LLM 時間加倍

9 次含 LLM 的執行中，有 8 次呼叫 LLM 兩次：

- Q2 三次都是兩次。
- Q5 三次都是兩次。
- Q1 只有一次成功第一次；另外兩次重試。

第一次回答常缺少有效引用標記，第二次 `strict=True` 才補上。這是目前最大的延遲放大器：若第一次就能穩定產生 citation，LLM 階段可從約 3.2–4.2 秒降到約 1.7–2.1 秒。

Q5 更嚴重：兩次 LLM 都無法產生可驗證引用，最後回傳 `retrieval_only`，等於浪費約 4.1 秒 GPU 時間，使用者只拿到檢索摘要。

### 3. Rerank 正常很快，但第一次可能 timeout

正式 15 次執行的 rerank 為 325–676 ms，沒有 fallback。

但 warm-up 第一次查詢出現：

```text
x570:11435  ReadTimeout
127.0.0.1:11435 ReadTimeout
rag.rerank 6,096 ms
status degraded
selected 0
```

兩個 reranker 都在 3 秒 timeout。之後的查詢就恢復正常。這比較像第一次請求的冷啟動／暫時性 GPU 排程問題，不是常態，但 demo 前必須先 warm-up，並考慮把 `RERANK_TIMEOUT_SECONDS` 從 3 秒提高，或把候選數／每段字數降下來。

### 4. 非 LLM 路徑明顯便宜

```text
Q3 判決清單：2,046 ms，20 筆判決，無 rerank／LLM
Q4 結構化：  1,188 ms，直接查 metadata
```

如果實際流量中有一半是這類問題，平均成本會遠低於 LLM 題目。架構評估不能只用最慢的 LLM 題目算容量。

### 5. Context 接近上限但不是目前瓶頸

本次最大 LLM input tokens 約 5,040（Q5），低於每個 slot 的 8,192。Q2 的 prompt token 估算比約 1.32，trace 標示 `prompt_tokens_suspected_truncation=true`，但實際 input tokens 約 3,000；目前沒有看到因 context 爆掉造成的失敗。若要把每 slot 降到 6,144，需用接近上限的請求重新驗證。

## 對容量設計的初步含義

以本次中位數粗估：

```text
LLM 題目：5.9 秒／次 → 單一請求約 0.17 次/秒
非 LLM 題目：1.5 秒／次 → 單一請求約 0.67 次/秒
```

x570 目前 `total_slots=4`，但這不代表可以直接乘 4：

- LLM prefill 與 decode 會互相搶 GPU。
- Rerank 是 compute-heavy prefill，會拖慢同時進行的 LLM decode。
- 需要實測 1／2／3／4／5／6／8 並行，找 p95 拐點。

若把 strict retry 的問題修好，LLM 題目有機會從約 5.9 秒降到 3.5–4.5 秒，對容量是接近 1.5–2 倍的改善，優先於增加 slot。

## 建議的下一步壓測

1. 並行爬升：1、2、3、4、5、6、8 個同時查詢，每級 20–30 次，記錄 p50／p95／錯誤率。
2. 同一時間在 x570 跑：
   ```bash
   nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu,power.draw --format=csv -l 2
   ```
3. A/B 測試：
   - strict citation retry 改善前後
   - rerank candidates 30 → 20／24
   - `RERANK_MAX_CHARS` 1200 → 512／800
   - `LLM_NUM_PREDICT` 384 → 256
   - 關閉 rerank 的 baseline
4. 串流模式量測 TTFT、第一個 citation 事件時間、總完成時間。
5. 用最常被點的範例問題模擬 cache 命中率，再算實際 GPU 需求。

## 限制

- 每題只有 3 次，不足以估計 p95；目前數字適合做 baseline，不適合直接定 `MAX_ACTIVE`。
- 沒有並行負載，也沒有 x570 的 `nvidia-smi`／VRAM／溫度資料（目前沒有 x570 SSH 權限）。
- warm-up 的 6 秒 rerank timeout 是獨立觀察，未列入五題中位數。
- Q5 是品質失敗（citation validation），不只是速度問題；架構調整不能只看時間表。

## 後續

並行、context 上限與格式 PoC 見 `rag-capacity-colleague-review-2026-11-17.md`。
