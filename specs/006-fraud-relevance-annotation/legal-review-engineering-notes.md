# Legal Review — Engineering Notes (Internal)

- 狀態：Internal；**不要先給法律審閱者看**
- 對應：`legal-review-examples.md`
- 用途：先讓審閱者獨立判斷，再對照工程團隊的內部建議，找出真正的歧義點。

## 工程團隊內部建議（審閱前不看）

| 實例 | 建議 grade | primary_offence | fraud_conviction | fraud_role |
|---|---:|---|---|---|
| 1. 詐欺＋洗錢同時存在 | 2 | mixed | true | core |
| 2. 主文只論洗錢、事實是詐騙人頭帳戶 | 1 | money_laundering | false | predicate_core |
| 3. 民事法院認定詐欺侵權 | 2 | fraud_civil | false | civil_core |
| 4. 民事只提到詐欺抗辯 | 0 | other | false | mention_only |
| 5. 案由偽造文書、主文論詐欺 | 2 | fraud | true | core |

## 為什麼是這些建議

- 實例 1：主文同時出現幫助常業詐欺與幫助洗錢，詐欺不是單純背景，故以 mixed／grade 2 處理。
- 實例 2：主文只有幫助洗錢，但事實核心是詐騙人頭帳戶；依目前 spec 的 grade 1 定義，這是 `predicate_core`。這是最需要法律審閱者拍板的一題；若認為搜尋「詐騙判決」不應包含此類，應改為 grade 0。
- 實例 3：民事法院實際認定詐欺侵權並判賠，詐欺是主要爭點；民事 grade 2 不代表刑事定罪。
- 實例 4：詐欺只出現在抗辯與法條引用，法院未以詐欺為核心，故 grade 0。
- 實例 5：案由未命中，但主文論以詐欺取財／得利罪，是 title gap 的典型。

## 對照流程

1. 審閱者先獨立填寫 `legal-review-examples.md` 的簽核表。
2. 工程團隊再打開本檔對照。
3. 只討論不一致的案例，並把最終規則與 5 個實例寫回 spec 第 7 節。
