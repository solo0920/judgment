# Real Question Intake v1

- 狀態：Intake template；尚未收集 20–30 題真實問題
- 日期：2026-11-17
- 目的：用使用者問題排序術語與失敗型態，不用語料統計代替需求

## 1. 輸入格式

JSON array 或 JSONL：

```json
[
  {
    "id": "q01",
    "question": "士林地方法院 2000 年借款糾紛有哪些？",
    "expected": "返還借款案件",
    "notes": "描述性說法；案由不是借款糾紛"
  }
]
```

`expected` 與 `notes` 由提問者或 PM 填寫，不是 ground truth relevance label。

## 2. 稽核指令

```bash
uv run python scripts/real_question_audit.py \
  --questions .run/real_questions.jsonl \
  --api-base http://127.0.0.1:9200 \
  --output .run/real_question_audit.json
```

輸出 JSON 與 CSV，內含：

```text
retrieval_mode
retrieval_status
judgments / law_sources / total_matches
scope_probe_zero_terms
latency_ms
failure_tags
answer_preview / notice_preview
```

## 3. 失敗型態（heuristic triage）

| Tag | 意義 |
|---|---|
| `exact_keyword` | 走 `keyword_list` 精確通道 |
| `structured_list` | 走法院／年份／案由結構清單 |
| `semantic` | 走向量語意 |
| `law_first` | 法規優先 |
| `scope_probe_zero` | 法院＋年份內的 registry 外詞精確 probe 零命中，已改用語意並揭露 |
| `scope_probe_hit` | 非 active 詞精確 probe 命中 |
| `no_results` | 沒有判決與法規來源 |
| `abstained_or_insufficient` | 回答明確拒答或資料不足 |
| `filter_violation` | 回傳判決不符合解析出的法院／年份／案由 |
| `llm_fallback` | 主要 LLM 失敗，使用 fallback 或 retrieval-only |
| `slow` | 超過預設 20 秒 |
| `error` | API 或網路錯誤 |

Tag 只是分流，不是法律相關性判斷；每一題仍要人工看 answer、notice、retrieval mode 與來源。

## 4. 收集目標

- 20–30 題自然問句，涵蓋：法院＋年份、案由、描述性說法、registry 外詞、法規優先、要求列全部、零命中、口語錯字。
- 每題記錄預期結果與實際結果；不要只記錄「成功／失敗」。
- 用失敗型態與使用者需求排序術語，不要用 429 術語的 document frequency 直接排序。
- 在有 20–30 題之前，不新增或升級 candidate。

## 5. 下一步

1. 收集第一批 20–30 題（PM／使用者提供）。
2. 跑 `real_question_audit.py`，人工複核 `error`、`filter_violation`、`scope_probe_zero`、`no_results`。
3. 把高頻失敗型態轉成 regression cases；只有可重現且有預期結果的題目才進 `rag_query_suite.json`。
4. `ground_truth_cases` 在人工 relevance 標註前維持 0；proxy 結果不得宣稱 Recall／nDCG 改善。
