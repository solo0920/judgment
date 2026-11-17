# RAG 容量第四輪評估：rerank A/B、先送向量結果與 readiness

> 後續評估（第五輪）：`specs/005-retrieval-evaluation/rag-capacity-fifth-review-2026-11-17.md`。

- 日期：2026-11-17
- 目的：回應第四輪審查，先做 rerank 候選數／每段字數 A/B，再實作「先送向量結果、rerank 後取代」與 `rerank_degraded`，最後補上暖機完成前的 readiness
- 範圍：只改 RAG rerank 參數、串流 partial、rerank 降級標示與健康檢查；不改 registry、不啟用 expansion、不改 Qdrant／embedding 模型、不進行法律審查、不 push
- 前一份報告：`specs/005-retrieval-evaluation/rag-capacity-third-review-2026-11-17.md`
- 實作 commits：
  - `4e425da feat: stream unranked results and gate readiness`
  - `27584d4 perf: share rerank deadline across retrieval phases`
- 原始資料：
  - `rag-rerank-ab-2026-11-17.json`／`.csv`
  - `rag-rerank-ab-review-2026-11-17.csv`（10 題人工複核佇列，尚未填寫）
  - `rag-stream-unranked-b-raw-2026-11-17.json`／`.csv`

## 摘要

第四輪的三個工程判斷都成立：

```text
1. 14k tokens 的 rerank batch 是設定問題，先縮小工作量比先寫 semaphore 便宜。
2. 向量結果應在 rerank 前先送；rerank 完成後取代，不應讓畫面空白。
3. rerank 降級要明確標示，不能讓降級結果看起來像正常排序。
```

A/B 與串流重測結果：

```text
現況不是 50x1200，而是 30x1200。
B = 20 candidates x 500 chars：
  judgment rerank p50 572 → 157 ms
  judgment rerank p95 907 → 379 ms
  20 mixed first_partial p95 6.02 → 2.92–3.04 秒（兩輪）
  0 error、11 operational／9 retrieval_only
  40 mixed first_partial p95 29.3 秒（未通過）
```

但這是**暫定通過**，不是正式驗收：

- A/B 只量 retrieval，LLM 關閉；沒有量答案忠實度。
- 27 題中只有 11 題真的走 judgment rerank、6 題走 law rerank；其餘是 structured list，會跳過 rerank。
- top-8 與 baseline 的重疊率是穩定性 proxy，不是 relevance 分數。
- 10 題人工複核還沒做；`ground_truth_cases` 仍是 0，不宣稱 Recall／nDCG。
- B 的 ranking 與 baseline 有明顯差異（semantic top-8 平均重疊 3.71/8，top-1 相同 2/7），所以先用在 local demo，`.env.example` 預設仍保留 30x1200。

## 一、逐項判定

| 第四輪主張 | 判定 | 本輪證據 | 處理 |
|---|---|---|---|
| 14k tokens 對 rerank 太多，先降候選數／字數 | **同意，已做 A/B** | 30x1200 → 20x500：rerank p50 572→157 ms、p95 907→379 ms | local demo 暫用 20x500；正式預設等人工複核 |
| 不要只靠 semaphore | **同意** | B 把工作量降到 0.278×，20 mixed 已不再出現 4 秒耗盡 | semaphore 延後，僅作 40 mixed 的保險 |
| rerank 降級要標示 | **同意，已實作** | `rerank_degraded` 進 partial／final；前端顯示「排序精簡模式」 | 以 9202 黑箱 reranker 驗證 true |
| 先送向量結果，rerank 後取代 | **同意，已實作** | 657 ms law partial → 827 ms unranked 8 筆 → 1,151 ms reranked partial | 重用既有 `partial` 事件，不改 client protocol |
| 暖機完成前不要接受流量 | **同意，已實作** | `/api/health` 先 503 `starting`，coverage 暖完轉 200 `coverage_warmed` | cloudflared health check 會等到暖機完成 |
| `-c 24576 -np 4` 先套 | **同意，但仍 blocked** | 沒有 x570 SSH／sudo，`nvidia-smi` 仍不可得 | 不憑感覺改；列為 P0-0 |
| done p95 33.6 秒／9–10 retrieval_only 先不解讀 | **同意** | 本輪 done p95 39.0 秒、9/20 retrieval_only；fallback span 8–25 秒 | 等 `-c 24576`＋token gate 後再重測 |

## 二、Rerank A/B

### 1. 設定校正

同事的表格假設現況是 50×1200；實際 `.env` 是：

```text
RAG_RERANK_CANDIDATES=30
RERANK_MAX_CHARS=1200
```

所以本輪比較的是：

| 設定 | 候選數 | 每段字數 | 相對工作量 |
|---|---:|---:|---:|
| 現況 | 30 | 1200 | 1.000 |
| A | 30 | 800 | 0.667 |
| B | 20 | 500 | 0.278 |

### 2. 方法

- 27 題：`tests/benchmarks/rag_query_suite.json`。
- 關閉 LLM（`LLM_URL=""`），只看 retrieval／rerank；避免生成時間干擾。
- 關閉 reranker fallback，只打 x570，避免 MBP 延遲混合。
- 每題只跑一次，順序為現況 → A → B；先做一次 warmup。
- 記錄：judgment rerank latency、law rerank latency、候選數、degraded、top-8 JIDs、law source／article。
- 品質指標只用「與 baseline 的 top-8 重疊」與「top-1 是否相同」；這不是 relevance label。

### 3. 結果

| 設定 | judgment rerank p50 | p95 | degraded | 全部 retrieval p50 | p95 | semantic top-8 平均重疊 | top-1 相同 |
|---|---:|---:|---:|---:|---:|---:|---:|
| 現況 30×1200 | 572 ms | 907 ms | 0 | 613 ms | 1,714 ms | 6.00／8 | baseline |
| A 30×800 | 478 ms | 1,260 ms | 0 | 531 ms | 1,299 ms | 4.71／8 | 4／7 |
| B 20×500 | **157 ms** | **379 ms** | 0 | 530 ms | **787 ms** | 3.71／8 | 2／7 |

判讀：

- B 的 judgment rerank 中位數快 3.6 倍、p95 快 2.4 倍；全部 retrieval p95 也由 1,714 降到 787 ms。
- A 的中位數只快 16%，p95 反而被一個 1,260 ms 樣本拉高；不划算。
- B 的 top-1 與 baseline 差異較大，不能說「品質不變」。例如：
  - 第三人詐欺舉證責任：B 的 top-1 與 baseline 相同，top-8 重疊 5/8。
  - 幫助詐欺不確定故意：B 的 top-1 變成 PCDM,107,簡,5322（baseline 第 2），top-8 重疊 5/8。
  - 洗錢常見態樣：B 的 top-1 變成 SCDM,114,金簡,14（baseline 第 2），top-8 重疊 3/8。
- 這些差異不一定是退步；但沒有 relevance label，不能宣稱等價。
- 10 題人工複核佇列已產生：`rag-rerank-ab-review-2026-11-17.csv`；欄位 `quality_label`、`quality_reason`、`reviewer`、`reviewed_at` 仍空白。

### 4. 暫定採用

local `.env` 已改為 B：

```text
RAG_RERANK_CANDIDATES=20
RERANK_MAX_CHARS=500
```

但 `.env.example` 預設仍是 30×1200，並加註 A/B 結果與「等人工複核」。原因是：

- B 是目前最有效的 first_partial 修正，值得在 demo 使用。
- 但 ranking 變動明顯，沒有理由在人工複核前把它變成所有人的預設。
- 若人工複核認為 B 的排序退步，應回 30×1200；A 目前沒有足夠優勢。

## 三、先送向量結果與 rerank 降級標示

### 1. 串流順序

`answer_question` 在 Qdrant 回傳、去重與 filter 驗證後、rerank 之前，先送一筆 `partial`：

```text
answer_source=retrieval_unranked
judgments=向量排序前 4 筆（rag_top_k）
law_sources=目前法規來源
show_sources=true
partial=true
streaming=false
```

rerank 完成後，原本的 `answer_source=streaming` partial 會取代它；LLM token 再往後接。實際單題 Q5 事件：

```text
657 ms   partial            law sources 3、judgments 0
827 ms   retrieval_unranked judgments 8、law sources 3
1,151 ms partial (streaming) judgments 1、law sources 3
5,382 ms result             retrieval_only
```

使用者最晚在 0.83 秒看到向量結果；rerank 與 LLM 都只是後續更新。前端沿用既有 partial renderer，沒有新增 SSE event type。

### 2. `rerank_degraded`

- `answer_question` 回傳 top-level `rerank_degraded`。
- law rerank 或 judgment rerank 任一 `status=degraded` 時為 true。
- partial 與 final payload 都帶這個欄位。
- 前端在回答下方顯示：「排序精簡模式：本次部分 rerank 逾時或降級，來源可能以向量順序顯示。」

端到端驗證：另開 9202，把 `RERANK_URL` 指到 closed port、關閉 fallback 與 LLM，串流事件為：

```text
partial (law)          rerank_degraded=true
partial (unranked)     rerank_degraded=false
partial (streaming)    rerank_degraded=true
result                 status=retrieval_only, rerank_degraded=true,
                       rerank.status=degraded, law_rerank.status=degraded
```

### 3. 20 mixed stream（B＋unranked）

| 指標 | 第三輪 request-level deadline | 本輪 B＋unranked |
|---|---:|---:|
| first_partial p50 | 2,063 ms | 2,157 ms |
| first_partial p95 | 6,024 ms | **3,038 ms** |
| first_partial max | 6,655 ms | 3,039 ms |
| done p50 | 5,752 ms | 6,845 ms |
| done p95 | 33,633 ms | 39,030 ms |
| operational／retrieval_only | 11／9 | 11／9 |
| error | 0 | 0 |

兩輪 B 的 first_partial：

```text
run 1：p50 2,220／p95 2,959／max 3,178 ms
run 2：p50 2,157／p95 3,038／max 3,039 ms
```

所以在 20 mixed、coverage 已暖、B 設定的條件下，first_partial p95 暫定 ≤4 秒。這是兩輪樣本，不是 SLA。

### 4. 40 mixed 未通過

同樣的 B＋unranked 設定，40 同時到達（20 LLM＋20 非 LLM）：

| 指標 | 40 mixed |
|---|---:|
| first_partial n | 30 |
| first_partial p50 | 3,818 ms |
| first_partial p95 | **29,323 ms** |
| first_partial max | 29,857 ms |
| done p50／p95 | 28,688／48,314 ms |
| operational／retrieval_only | 24／16 |
| error | 0 |

- Q3 判決列表 first_partial 19.4–29.3 秒；Q4 structured 27.9–29.4 秒；Q5 4.6–19.9 秒。
- 這不是 rerank 問題：coverage 都在 0.02–0.15 秒，Q3/Q4 根本沒有 rerank。
- 原因是 40 個請求同時穿過同一個 process：sync LLM 占住 default executor、DB／Qdrant／embedding／rerank 共用資源，且沒有 admission gate。
- 所以目前只能說「20 mixed 暫定通過」；**40 mixed 沒有通過 4 秒目標**，不能對外宣稱容量驗收完成。

## 四、Readiness

`/api/health` 現在回傳 readiness：

```json
{
  "status": "starting",
  "version": "...",
  "readiness": {
    "ready": false,
    "coverage_warmed": false,
    "detail": "starting"
  }
}
```

- `ready=false` 時 HTTP 503；cloudflared／uptime check 不會把冷啟動當成可用。
- coverage 暖機成功後轉 200，`detail=coverage_warmed`。
- 暖機失敗仍會轉 ready（避免 transient count 失敗讓服務永久 503），但 `coverage_warmed=false`、`detail=coverage_warmup_failed`，並記 warning。
- 暖機停用或測試注入 session factory 時，ready 直接為 true。
- 實測啟動序列：`503 starting` → `503 starting` → `200 coverage_warmed`；heartbeat 同時回 `ok`、23 ms、provider x570。

## 五、Semaphore 與 done 尾巴

### 1. Semaphore 暫不實作

同意「先縮小工作量，再加 semaphore」。B 已把 judgment rerank 的工作量降到 0.278×，20 mixed 不再出現 4 秒耗盡；此時先加 semaphore 只會把排隊延遲變成另一種尾。保留為 rerank 專用的保險，但 40 mixed 的主因是 process-wide admission／executor，不是 reranker：

```text
若 40 mixed 仍出現 rerank deadline exhausted 集中在少數請求，
再加 reranker semaphore（上限 2）＋ queued/ETA。
```

### 2. done p95 仍高

本輪 done p95 39.0 秒、9/20 retrieval_only。失敗 span 顯示：

- x570 primary 仍常回 context exceeded。
- MBP llama-server fallback 單次 8–25 秒，且一樣 context exceeded。
- 這不是 rerank 造成；rerank 的 first_partial 已在 3 秒內。

所以在 `-c 24576 -np 4` 與 token gate 完成前，done p95 與 retrieval_only 比例不能解讀成「摘要容量不足」。下一步仍應先取得 x570 權限，再做精確 tokenization／gate。

## 六、限制與未解問題

- A/B 只跑一輪、27 題；structured list 佔多數，真正 rerank 樣本只有 11 題 judgment＋6 題 law。
- Top-8 重疊不是 relevance；沒有人工 label，`ground_truth_cases` 仍是 0。
- B 只暫用於 local demo；`.env.example` 預設未改。
- 20 mixed 只跑兩輪 B；40 mixed 跑一輪，p95 29.3 秒，**未通過**。
- done p95 39.0 秒（20 mixed）／48.3 秒（40 mixed）、9–16 retrieval_only；等 `-c 24576`＋token gate。
- x570 `nvidia-smi`、reranker 服務日誌仍不可得；無法判斷 3 秒 timeout 是 GPU 滿載、模型載入、批次設定或 CPU 後處理。
- semaphore 尚未實作。
- MBP fallback 仍是 llama-server，不是 Ollama；demo 應關閉或獨立 gate。
- 14px、registry 429 terms／10 active／419 candidates、candidate 未啟用、無 `legal_reviewed` 宣告，皆維持不變。

## 七、下一步

1. 人工複核 `rag-rerank-ab-review-2026-11-17.csv` 10 題；若 B 排序退步，回 30×1200。
2. 先做 admission／executor 分道：40 mixed 的 p95 29.3 秒不是 rerank，而是 40 個 sync 請求同時穿過同一 process；沒有 gate 與 bounded executor，40 不可能達標。
3. x570 權限、`nvidia-smi`、reranker log、`-c 24576 -np 4`、4×Q5 驗證。
4. 精確 tokenization＋token gate＋citation-only retry＋absolute deadline＋async LLM。
5. 40 mixed stream 重測；必要時再加 reranker semaphore（上限 2）。
6. demo 關閉或獨立 gate MBP fallback；完成後再解讀 done p95 與 retrieval_only 比例。
7. 字母標籤、答案快取／範例題預熱、session／Turnstile／安全驗證。

## 附錄：檔案

- `rag-rerank-ab-2026-11-17.json`：A/B 原始結果（27 題 × 3 設定）。
- `rag-rerank-ab-2026-11-17.csv`：A/B 摘要。
- `rag-rerank-ab-review-2026-11-17.csv`：10 題人工複核佇列。
- `rag-stream-unranked-b-raw-2026-11-17.json`：20 mixed stream（B＋unranked）。
- `rag-stream-unranked-b-2026-11-17.csv`：上述摘要。
- `rag-stream-40-b-raw-2026-11-17.json`：40 mixed stream（B＋unranked，未通過）。
- `rag-stream-40-b-2026-11-17.csv`：上述摘要。
- `tests/test_rag.py`：unranked partial、`rerank_degraded`、coverage 快取／暖機、失敗 span provider。
- `tests/test_rerank.py`：總 deadline、request-level deadline、heartbeat。
