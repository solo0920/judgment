# Annotation Status

- 狀態：**Paused — no annotation capacity**
- 日期：2026-11-16
- 規格：`specs/006-fraud-relevance-annotation/spec.md`
- 現實限制：目前只有專案負責人一人，沒有時間跑 Pilot 20、title 30 或正式 365。

> **目前決定：暫停標註。** 不填四個名字、不跑 Pilot、不宣稱 T／Coverage／Tier。保留已上線的使用者端誠實說明與完整清單指引；標註規格與工具留作未來有第二位標註者與法律審閱者時再啟動。

## 現在已經足夠的產品行為

- 列舉模式會說明：「此清單依案由含詐欺篩選，不含案由不同但內容涉及詐欺的判決。」
- 清單被截斷時會顯示：「完整 N 筆清單請至資料庫查詢頁，以上述條件查詢。」
- 查詢條件標示為可複製。
- 不再把 title filter 的比例稱為 Recall，也不宣稱 Coverage 或 Tier。

## 暫停後不要做的事

- 不要為了跑 Pilot 而填假人名。
- 不要用 AI 或工程人員代替法律審閱者。
- 不要單人硬跑 365 筆後宣稱完整 ground truth。
- 不要因為沒有標註結果就修改 Qdrant、embedding、retrieval filter 或 reranker。

## 未來若恢復的人力條件

最低限度：

1. 第二位標註者：Pilot 20 + 正式雙人 20，約 10–15 小時。
2. 法律審閱者：5 個案例與 `fraud_role` 表，約 2–3 小時。

在那之前，`specs/006` 與 `.run/fraud_relevance/` 的標註包只作為 future work，不是目前承諾。

## 保留的工件

- `specs/006-fraud-relevance-annotation/spec.md`：完整抽樣與標註規格。
- `specs/006-fraud-relevance-annotation/pilot-guide.md`：未來恢復時的 Pilot 操作說明。
- `.run/fraud_relevance/batches/`：Pilot 20 與 title batch 50 已產生，但尚未標註。
- `scripts/annotate_batch.py`、`pilot_report.py`、`title_precision_report.py`：未來可直接使用。

## 如果之後只有 30 分鐘

可以只做 5 筆、只填一個欄位「實質與詐騙相關嗎？0/1/2」，不填 evidence quote、不跑完整 schema。這只能當 anecdote，不是 ground truth，也不能用來宣稱 Coverage 或 Tier。
