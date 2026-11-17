# RAG 引用重試修正：字母標籤與非引用錯誤不再重試

- 日期：2026-11-17
- 目的：回應第七輪審查，修正「Q5 第一次回答被刪除後重生成」的根因，並量測 retry 率
- 範圍：只改 LLM 來源標籤、prompt、串流 token 映射、retry 分類與 fallback 分類；不改 registry、不啟用 expansion、不改 Qdrant／embedding／reranker 模型、不進行法律審查、不 push
- 實作 commit：`44ca510 fix: use letter citations and retry only citation errors`
- 原始資料：`rag-citation-retry-2026-11-17.json`／`.csv`

## 摘要

先前的解釋把 Q5 retry 主因歸給「context 被裁掉」，這個判斷不成立。實際輸出是 `[19]`、`[17]`、`[15]` 這類法條號被放進來源括號；被裁掉的 context 只會在 1–8 之間，不會出現 15–19。因此本輪先做字母標籤，而不是調 context 預算。

修正後：

```text
27 題 sync benchmark：11 個 LLM 問題，retry 0 次，error 0。
20 mixed stream：8 個 LLM 問題，8 次嘗試，retry 0 次；
first_partial p95 2,786 ms、done p95 4,755 ms、error 0。
```

## 一、修正內容

### 1. 字母來源標籤

`_build_llm_prompt()` 現在把來源標成 `[A]`、`[B]`、`[C]`，並在 prompt 明確寫：

```text
方括號內只能是來源標籤（A、B、C…），不是法律條號；
條號請寫「第15條」，不要寫成 [15]。
```

- `_source_label_map()`：numeric index → letter。
- `_map_letter_markers()`：`[A]`、`[A, B]`、`[A][B]` → `[1]`、`[1,2]`、`[1][2]`。
- 只轉換合法字母 marker；`[19]` 這類法條號保持原樣，由 citation 驗證決定是否有效。
- 前端 citation schema 仍是 numeric `[1]`，不需要改。

### 2. strict 指示移到 user prompt 末尾

原本 strict 文字接在 system prompt 後面，會讓 prefix cache 失效；現在移到 user prompt 最後：

```text
重要：上一次回答缺少有效來源標籤。這次每個結論後都必須加上
對應的 [A]／[B]／[C] 標籤，不得省略，也不得使用法條號或未提供的來源。
```

system prompt 保持穩定，retry 才能重用 prefix cache。

### 3. 串流 token 映射

新增 `_CitationMarkerMapper`：

- 遇到 `[` 先緩衝，等 `]` 出現再轉換。
- `[A]` 在 token 串流時直接變成 `[1]`，前端不會先看到字母再跳成數字。
- 不完整或非法 bracket 原樣輸出。
- 同步與非同步串流路徑都套用。

實測 Q5 token：

```text
[1]。 [1]。 [2]。 [3]。
```

沒有出現 `[A]`。

### 4. 只對 citation 錯誤 retry

新增 `CitationValidationError`。strict 迴圈改成：

```text
第一次回答 citation 無效 → strict=True 再試一次
strict=True 仍 citation 無效 → 停止，不再第三次
HTTP 500、context exceeded、timeout、其他錯誤 → 不 retry
```

Non-citation 錯誤現在直接降級為 retrieval-only，`degraded_reason=llm_error`；citation 無效則是 `citation_invalid`。

### 5. fallback 只留給連線失敗

`_should_try_fallback()` 只允許：

```text
httpx.ConnectError
httpx.ConnectTimeout
ConnectionError
OSError
```

HTTP 500、context exceeded、ReadTimeout 不再改打 fallback。這是因為：

- x570 與 MBP fallback 的 context 都是 8192；context exceeded 換一台不會成功。
- HTTP 500／timeout 再打 fallback 只會多花 8–25 秒與 GPU。
- 只有「primary 連不上」才值得 fallback。

對應測試 `test_generate_answer_rejects_actual_context_overflow` 已改為只打 primary 並拋出錯誤。

## 二、量測

### 1. 27 題 sync benchmark

- 11 題會呼叫 LLM，其餘 16 題是 structured list／keyword，不呼叫 LLM。
- Fallback 關閉，只打 x570。
- 結果：

| 指標 | 結果 |
|---|---:|
| LLM 問題 | 11 |
| retry 問題 | 0 |
| retry 率 | 0% |
| operational | 11 |
| retrieval_only | 0 |
| error | 0 |

這證明字母標籤足以讓 27 題的第一輪回答全部通過 citation 驗證；不需要靠 retry。

### 2. 20 mixed stream

修正後重跑：

```text
LLM 問題 8、LLM 嘗試 8、retry 0
first_partial p50 2,097／p95 2,786 ms
done p50 3,221／p95 4,755 ms
operational 10／retrieval_only 10／error 0
```

其中 retrieval_only 是 x570 context exceeded 後立即降級，不是 citation retry。先前同樣的 20 mixed 有 8/9 次 retry；現在是 0/8。

### 3. 40 mixed stream（修正後）

```text
檢索結果 40/40（100%）
first_partial p50 5,478／p95 5,554 ms
statuses：operational 20／retrieval_only 20
degraded_reason：llm_busy 16、llm_error 4
LLM 嘗試 4、retry 0、error 0
```

40 個人都先看到檢索結果；20 個非 LLM 查詢 operational，20 個 LLM 查詢全部降級（4 個 context exceeded、16 個 llm_busy）。這是 x570 context 容量問題，不是 citation retry；在 `-c 24576 -np 4` 之前，摘要比例沒有代表性。

## 三、判定

- Q5 的 `[19]`／`[17]`／`[15]` 是法條號，不是被裁掉的 context index；字母標籤是正確修正。
- 27 題 retry 率由先前的常態性重試降到 0。
- 串流畫面不再因 citation retry 刪除第一版回答；token 直接顯示 numeric marker。
- context exceeded 仍會讓摘要降級，但這是容量問題，不應再觸發第二次 LLM。

## 四、限制

- 27 題 benchmark 沒有 ground truth relevance label；`ground_truth_cases` 仍是 0，不能宣稱 Recall／nDCG。
- 尚未做 sentence-level citation 檢查；`_valid_citation_markers` 仍只要求至少一個合法 marker。`invalid_marker_count`、`uncited_sentence_count` 尚未進 trace。
- 同步與串流各有一份 strict 迴圈，尚未抽成同一個 helper。
- 40 mixed 修正後已重跑：100% 檢索、first_partial p95 5.55 秒、摘要 0/20（4 llm_error、16 llm_busy）；未達 4 秒，且摘要容量仍 blocked。
- x570 權限、`-c 24576 -np 4`、`nvidia-smi` 仍 blocked。
- Registry 未觸碰：429 terms／10 active／419 candidates；candidate 未啟用；RAG 文字維持 14px。
- 沒有 push；所有 commit 只在本機。

## 五、下一步

1. 在 trace 加 `citation_retry`、`invalid_marker_count`、`uncited_sentence_count`，重跑 27 題。
2. 實作 sentence-level citation 檢查與串流時丟棄非法 marker；未附來源的句子加淡色標記。
3. 40 mixed 重測：確認 retry 0、100% 檢索、摘要比例分開回報。
4. 同步／串流 strict 邏輯抽成同一個 helper。
5. 10 題盲看 rerank 複核＋C 組；x570 `-c 24576` 與 4×Q5。
6. reranker semaphore、demo 關閉 MBP fallback、答案快取、安全驗證。

## 附錄

- `rag-citation-retry-2026-11-17.json`／`.csv`：27 題 sync benchmark、20／40 mixed stream retry 統計。
- `rag-citation-review-2026-11-17.csv`：11 題 LLM 回答、完整引用來源與人工複核欄位；`q1_source_supports_claim`、`q2_uncited_fact_sentence` 尚待填寫。
- `src/judgment/rag.py`：`_source_label_map`、`_map_letter_markers`、`_CitationMarkerMapper`、`CitationValidationError`、`_should_try_fallback`。
- `tests/test_rag.py`：字母 prompt、marker 映射、token mapper、非 citation 錯誤不 retry、context overflow 不 fallback。
- `src/judgment/web/app.py`：串流 strict 迴圈的分類與 `citation_invalid` 降級原因。
