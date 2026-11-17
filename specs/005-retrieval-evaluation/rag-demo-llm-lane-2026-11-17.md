# Demo LLM lane 決策：x570 primary，MBP 24576 尚未穩定

- 日期：2026-11-17
- 目的：回應第八／九輪審查的 demo LLM 決策、40 mixed 佇列與 ASGI 缺口量測
- 範圍：只改 demo LLM 執行位置、LLM 佇列與量測；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 相關資料：`rag-demo-llm-lane-2026-11-17.json`／`.csv`
- 監督腳本：`scripts/run_mbp_llm_24576.sh`

## 決策（修正）

**x570 維持 primary；MBP 24576 暫時不作為 demo primary。**

原因不是 4×5.7k 放不下，而是 MBP llama-server 在重複負載後仍會無聲退出：

- 4×5,749-token 驗證成功：HTTP 200 4/4、finish_reason stop、total tokens <6,144。
- 但 server 在多次 20／40 mixed、累積約 536 個 task 後退出；supervisor 與 server 一起消失，log 沒有 exit line。
- `log show` 搜尋 jetsam／memorystatus 沒有輸出；`memory_pressure` 當時 free 78%、swap 0，沒有直接 OOM 證據。
- 因此「先啟動 supervisor 再啟動 web」只能繞過一次啟動順序，不能證明長時間穩定。
- demo 若使用 MBP 主 LLM，必須先完成 supervised service 與 30 分鐘 70% 負載測試；目前尚未通過。

x570 目前的限制仍是 `n_ctx=8192`；Q5 在併發下 context exceeded。實體登入 x570、套用 `-c 24576 -np 4` 仍是長期修正。在完成前，demo 的摘要是 best-effort，檢索與引用才是主展示。

## 已實作的 LLM 佇列

`llm_admission` 現在支援有界佇列：

```text
4 並行、8 佇列、ETA 上限 20 秒、絕對等待期限 20 秒
```

- 取不到時送 `queued {lane: summary, position, eta_s}`；前端顯示「摘要排隊中：前面 N 位，預估約 X 秒」。
- 等待超過 20 秒或佇列已滿才 `llm_busy`，不是一取不到就拒絕。
- 若使用 MBP 24576，建議 `LLM_ADMISSION_INITIAL_SERVICE_SECONDS=15`；x570 預設 4。

### 觀察到的摘要比例（MBP 24576 穩定窗口）

| 情境 | 檢索結果 | first_partial p95 | 摘要 | 忙碌 | done p95 |
|---|---:|---:|---:|---:|---:|
| 20 mixed | 20／20 | 2,758 ms | 7／10 | 3 | 31,487 ms |
| 40 mixed | 40／40 | 5,925 ms | 8／20 | 12 | 14,667 ms |

- 佇列把摘要由 4/10、4/20 提升到 7/10、8/20。
- 沒有到 12/20，因為 MBP 每個摘要約 15–18 秒，20 秒期限只能容納約兩輪。
- 這些數字只在 MBP server 存活時有效；server 之後仍退出，所以不能當成穩定 demo 承諾。

## ASGI accept → handler 量測

新增：

```text
asgi_to_handler_ms
handler_to_flow_ms
asgi_to_flow_ms
```

20 mixed：

```text
asgi_to_handler p50 51／p95 152 ms
handler_to_flow p50 93／p95 1,212 ms
asgi_to_flow p50 145／p95 1,367 ms
```

判讀：

- ASGI accept → handler p95 152 ms，伺服器 accept／路由不是 2.7 秒缺口的主因。
- 殘餘主要是 client/TCP 連線，以及 handler → flow 的 event-loop 排程。
- 多行程 client 把 `client.request_ms` p95 從 5,218 降到 3,944 ms，但 first_partial p95 仍有 5,574 ms；缺口沒有完全消失。
- 正式架構經 Cloudflare 少量長連線時，連線模式不同；tunnel 啟動後要從外網重測。

## 40 mixed 的兩個指標

目前可回報：

```text
收到檢索結果：40/40（100%）
收到摘要：4/20（x570 primary，無佇列）或 8/20（MBP 佇列，穩定窗口）
降級原因：llm_busy、llm_error（context exceeded）
```

40 first_partial p95 5.6–6.3 秒，未達 4 秒。

## 限制

- MBP 24576 無聲退出根因未確認；30 分鐘 70% 負載測試尚未完成。
- x570 `-c 24576 -np 4` 與 4×Q5 仍 blocked。
- 摘要比例受 LLM gate 4 並行與 provider service time 限制。
- 多行程測試只排除部分 client 因素；uvicorn/Cloudflare 連線模式尚未量。
- `ground_truth_cases` 仍是 0；沒有 Recall／nDCG 宣稱。
- Registry 未觸碰：429 terms／10 active／419 candidates；candidate 未啟用；RAG 文字維持 14px。
- 沒有 push；所有 commit 只在本機。

## 下一步

1. x570 實體登入、`-c 24576 -np 4`、4×Q5、`nvidia-smi`。
2. MBP 若要用於 demo：改成 launchd／systemd 等級 supervised service，跑 30 分鐘 70% 負載並記錄退出碼、RSS、GPU memory。
3. 11 題人工複核＋rerank 盲看。
4. 合併同步／串流 strict 迴圈。
5. 40 mixed 重測：100% 檢索、摘要比例、降級原因分布、first_partial p95。
6. 公開前安全驗證、路由白名單只含串流端點；tunnel 後外網重測。

## 附錄

- `scripts/run_mbp_llm_24576.sh`：MBP 24576 監督啟動腳本（尚未證明長時間穩定）。
- `rag-demo-llm-lane-2026-11-17.json`／`.csv`：20／40 mixed、4×5.7k、多行程 40、佇列與 ASGI 數據。
- `rag-citation-review-2026-11-17.csv`：11 題人工複核佇列。
