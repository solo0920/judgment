# Pilot Annotation Guide (20 Cases)

- 狀態：Pilot-ready；目前為單人模式（provisional）
- 日期：2026-11-16
- 對應規格：`specs/006-fraud-relevance-annotation/spec.md`
- 目的：找出 grade 規則的實際歧義，不用來計算正式 kappa 或 ground truth。

## 輸入

```text
.run/fraud_relevance/batches/pilot_batch.jsonl   20 筆 pilot 盲標案件
.run/fraud_relevance/batches/pilot_batch_template.csv  pilot 空白標註表
.run/fraud_relevance/batches/title_batch.jsonl   50 筆 title precision 盲標（30 title + 20 controls）
.run/fraud_relevance/batches/title_batch_template.csv  title precision 空白標註表
.run/fraud_relevance/batches/title_batch_analysis_key.jsonl  分析用，標註者不得查看
```

Pilot 只從 A/B/C1 抽（A10、B5、C1 5），不會污染 C2 隨機樣本。這 20 筆之後仍會在正式 365 筆中重標；Pilot 標籤不進 ground truth。

Pilot 表使用 `case_id`；title batch 表使用 `batch_id`。兩者都是不透明識別碼，不得用來推測來源。

## 作法

1. 目前專案只有 1 位標註者，直接單人標；每筆在 `notes` 寫下不確定點。若之後有第二位，再另跑一次獨立標註，不覆蓋第一份。
2. 只使用 batch JSONL 的 `case_id`／`batch_id` 與全文；不要打開 analysis key。
3. 依 spec 第 7 節填 `grade`、`primary_offence`、`fraud_conviction`、`evidence_section`、`evidence_quote`、`relevance_reason`、`confidence`。
4. Pilot 先只要求 `evidence_quote`，不要求 `evidence_start/end`；正式標註才由程式計算 raw offset。
5. 不提供工程團隊的建議答案；遇到不確定，填入 `notes`，不要猜。
6. 單人模式沒有第二位標註者，先跳過「兩人逐筆討論」；把 `notes` 整理成不確定點清單，特別是：
   - 洗錢人頭帳戶：grade 0 或 1？
   - 民事詐欺求償：grade 1 或 2？
   - 詐欺只出現在抗辯／法條引用：grade 0？
   - 詐欺與洗錢同時存在：`primary_offence=mixed`？
7. 若日後有第二位標註者，才把每一筆分歧記到 `pilot_disagreement_log.csv`：

```text
case_id,annotator_1_grade,annotator_2_grade,disagreement,rule_question,resolution
```

8. 單人先依 `notes` 修訂 spec 第 7 節或 `fraud_role` 表；若修訂，Pilot 的 20 筆依新指引重標，舊標籤只保留為紀錄。
9. 將最清楚的真實歧義案例補進 `legal-review-examples.md`，連同原本 5 個實例送法律審閱。

## 不要做的事

- 不要用 Pilot 計算正式 kappa 或宣稱一致性。
- 不要看 `sampling_stratum`、`criminal_signal`、`title` 或 `jid` 來推測答案。
- 不要把 Pilot 標籤直接併入正式 365 筆。
- 不要在 Pilot 期間改抽樣、樣本數、prior 或 Tier 門檻。

## Title Precision 30

Title precision 30 可與 Pilot 同時進行，使用 `title_batch.jsonl`（30 title + 20 primary controls，混合盲標）；完成後只計算 `p_title_loose` 與 `p_title_strict`，不進入 Pilot 的規則討論。控制組是正式 365 的一部分，指引未變時可沿用。單人模式下 `p_title` 仍是 provisional。
