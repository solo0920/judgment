# Legal Review Status

- 狀態：**paused**（文件已備，尚無法律審閱者；標註計畫暫停）
- 審閱者：`legal_reviewer_1`（**unassigned**；真實姓名待填）
- 送出日期：TBD（找到審閱者後）
- 截止日期：2026-11-23
- 對應規格：`specs/006-fraud-relevance-annotation/spec.md` 第 7 節

## 給審閱者的文件

只給這一份：

- `specs/006-fraud-relevance-annotation/legal-review-examples.md`

**不要先給**：

- `legal-review-engineering-notes.md`（工程建議，審閱後才對照）
- `annotation-status.md`（內部排程）
- 任何標註結果或預期答案

## 審閱者要回答

1. 實例 1：grade／primary_offence／fraud_conviction？
2. 實例 2：洗錢人頭帳戶案 grade 0、1 或 2？
3. 實例 3：民事詐欺求償 grade 1 或 2？
4. 實例 4：抗辯提及 grade 0 或 1？
5. 是否同意民事 grade 2 不代表刑事詐欺定罪？
6. 是否同意 7.4 節的 `fraud_role` 完整組合表？

## 簽核後要凍結的規則

- 洗錢人頭帳戶的 grade。
- 民事詐欺求償的 grade。
- `primary_offence` 與 `fraud_conviction` 的組合。
- `fraud_role` 推導表。
- 規則版本：`grade-rules-v1`（簽核後填入日期與審閱者代號）。

## 簽核紀錄

```text
審閱者代號：legal_reviewer_1
真實姓名：私密 roster
日期：
規則版本：grade-rules-v1
實例 1：grade ___ / primary_offence ___ / fraud_conviction ___
實例 2：grade ___ / primary_offence ___ / fraud_conviction ___
實例 3：grade ___ / primary_offence ___ / fraud_conviction ___
實例 4：grade ___ / primary_offence ___ / fraud_conviction ___
實例 5：grade ___ / primary_offence ___ / fraud_conviction ___
fraud_role 表：同意 / 修正如下
備註：
```

簽核後，Pilot 與正式標註才可以凍結 grade 規則；在那之前，Pilot 可以開始，但結果視為 provisional。
