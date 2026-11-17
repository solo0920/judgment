# Paused / Deferred Work Register

- 日期：2026-11-17
- 目的：避免「暫停」在沒有負責人與重啟條件下變成永久擱置
- 原則：沒有具名負責人與重啟條件，不得重新啟動；所有 proxy 結果不得宣稱 Recall／nDCG 改善

| 工作 | 狀態 | 負責角色 | 重啟條件 | 目前依據 |
|---|---|---|---|---|
| 詐欺 relevance 標註 | **Paused** | 待指派：法律審閱者 + 標註者（目前一人產能不足） | 有具名審閱者與標註者、完成 pilot 一致性檢查、確認工時 | `specs/006-fraud-relevance-annotation/annotation-status.md` |
| 70 個 proxy-ready 術語的人工標註 | **Paused** | 待指派：法律領域審閱者 | 真實問題顯示該術語有需求，且有審閱者與 benchmark 預算 | `.run/legal_term_ground_truth_candidates.json`；`legal-term-evidence-pipeline.md` |
| 419 個 candidate 的審閱／升級 | **Paused** | 待指派：法律審閱者 | 真實問題或 retrieval 失敗型態顯示需求；一次只審一個術語；需 legal sign-off | Registry 全數 `engineering_pending` |
| Expansion A/B/C（human-reviewed） | **Disabled / paused** | Engineering（實驗負責） | 先有可量測 proxy 差異，再取得 human-reviewed ground truth | runtime 與 registry 都是 `expansion_enabled=false` |
| Full postings build | **Deferred to off-peak** | Engineering | 離峰窗口；完成後 manifest `complete=true` 且 validation 0 mismatch | 200k sample `complete=false` |
| x570 chat ctx 8192 redeploy | **Pending** | Infra / Engineering | 有 x570 sudo／SSH 存取；重啟後 `/props` n_ctx=8192 | 目前 server `n_ctx=4096` |
| 30 題 trace 答案品質人工複核 | **Pending human review** | PM / 法律領域審閱者 | 指派 reviewer；使用 `real_question_audit.csv` 的 quality 欄位 | 目前只有路由／狀態 tag，沒有品質標籤 |
| 新增 candidate 或術語 | **Paused** | 待指派：法律審閱者 | 真實問題需求 + exact variant 審閱 + tests | 目前不新增、不升級 |

## 重啟規則

1. 先確認負責人與可投入時段；沒有負責人就不重啟。
2. 先定義可觀察的完成條件（問題數、標註數、manifest、benchmark 指標）。
3. Proxy 結果只能支持保守決策，不可對外稱 Recall／nDCG 改善。
4. 任何 registry 變更仍需保留 `active=false`、`expansion_enabled=false`、`review_status=engineering_pending`，直到人工與法律審閱完成。
