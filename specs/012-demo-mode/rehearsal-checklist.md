# 完整真實流程排練檢查表

**目的**: 在面試前實際跑一次「訪客回饋 → 管理者 triage → 題庫 draft → JSONL → 隔離 worktree PR → CI → 關閉展示」，找出串接問題。

## 事前

- [ ] 確認目前 demo 關閉，`GET /api/demo/status` 回 `enabled=false`。
- [ ] 確認完整備份可用；至少完成一次 restore 演練。
- [ ] 準備另一個瀏覽器與另一個網路（例如手機熱點），避免與管理者 session 混在一起。
- [ ] 確認 `.env` 的 feedback secret、admin token 不在錄影畫面。
- [ ] 開始錄影；記錄 commit、時間、瀏覽器版本。

## 步驟

1. [ ] 管理者開啟 demo，只開啟 RAG 與必要功能。
2. [ ] 訪客送出 3–5 則回饋：一則 👍、兩則 👎、一則多輪「整段對話」回饋；其中一則包含容易造成 prompt injection 的文字。
3. [ ] 管理者在 `#/quality` 查看回饋、重現 snapshot、設定狀態／嚴重度／主要錯誤階段／`expected_behavior`；`review_comment` 只寫內部備註。
4. [ ] 將一則 actionable 回饋轉成題庫 draft，確認 `pending_review`、`visibility=shared`、`source=user_feedback`；完成人工審核。
5. [ ] 匯出 JSONL，實際打開檔案檢查：不得有 `comment`、`review_comment`、holdout 題目、絕對路徑、host、prompt。
6. [ ] 用 `scripts/prepare_feedback_worktree.sh` 建立隔離 worktree；確認讀不到 production `.env`、DB、內部網路。
7. [ ] 讓 OpenCode 依 JSONL 產生一個小 PR；確認只開 PR、不改 protected paths、不 merge／deploy。
8. [ ] 等待 CI；人工審核 PR；回到管理者介面把回饋改為 resolved 並填 linked PR。
9. [ ] 關閉 demo；從外部網路確認 `/api/rag/query`、`/api/rag/feedback` 回 403，首頁仍可讀取但 RAG 鎖定。
10. [ ] 停止錄影，保存 JSONL 檢查結果、CI run、PR 連結與關閉驗證截圖。

## 失敗紀錄

每次排練發現的問題都要記錄：

- 步驟、實際結果、預期結果
- 是否為程式錯誤、文件錯誤、環境錯誤或操作錯誤
- 修正 PR 或明確延後理由
- 是否需要在面試腳本加註

這份紀錄比新增功能更能支撐面試說明。
