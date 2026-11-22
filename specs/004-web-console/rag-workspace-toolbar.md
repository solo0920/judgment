# RAG 工作區工具列設計規格

**Status**: Implemented · code-aligned 2026-11-22

**Scope**: `#/rag` 右側工作區上方功能按鈕區（`.rag-workspace-toolbar`），包含「分享給朋友」、三點對話選單與「建立公開連結」。

**Source of truth**: 目前程式碼為唯一事實來源：

- `src/judgment/web/static/assets/js/pages/rag.js`
- `src/judgment/web/static/assets/styles.css`
- `src/judgment/web/static/assets/js/utils.js`
- `src/judgment/web/app.py`
- `src/judgment/models.py`
- `src/judgment/web/route_policies.json`
- `src/judgment/web/demo_policies.json`

若本文件與程式行為不一致，以程式為準，並 MUST 在同一次變更同步更新本文件。

## 1. 目的與範圍

此工具列集中 RAG 工作區的全域操作，避免將分享與對話管理動作分散到內容卡片內。工具列只處理：

1. **分享給朋友**：分享網站本身，使用瀏覽器原生分享面板。
2. **三點選單**：重新命名、釘選／取消釘選、刪除、移至專案。
3. **建立公開連結**：將目前完整 RAG 對話建立為唯讀快照，複製專屬公開連結。

工具列 MUST NOT 包含分享選單、專案管理或設定的替代入口；這些功能仍由既有元件負責。

## 2. 版面與視覺

- 工具列 MUST 位於 `.rag-workspace` 內、`.rag-hero` 之前。
- 工具列 MUST 使用 `display:flex`、`justify-content:flex-end`、`align-items:center`、`gap:6px`，靠右排列且不佔用獨立卡片背景。
- 工具列 MUST 有 `position:relative` 與足夠的 `z-index`，讓三點選單可覆蓋下方內容。
- 「分享給朋友」MUST 使用 `.rag-friend-link`：
  - inline-flex、`gap:6px`、pill 圓角、`12px` 字級、`600` 字重。
  - 顏色 MUST 使用 `var(--accent)`；hover 背景 MUST 使用 `var(--accent-soft)`。
  - icon MUST 為 14px gift 圖示。
- 右側兩個圖示按鈕 MUST 使用 `.rag-workspace-icon`：
  - 固定 `36px × 36px`、`display:grid`、`place-items:center`。
  - 邊框 `1px solid var(--line)`、圓角 `10px`、背景 `var(--surface)`、文字 `var(--ink)`。
  - hover 背景 MUST 為 `var(--surface-2)`。
- 鍵盤聚焦時 MUST 顯示 `2px solid var(--accent)` 的 `focus-visible` 外框，offset `2px`。
- 三點選單 MUST 使用 `.rag-history-menu.rag-workspace-menu`，絕對定位在工具列下方 `6px`、右緣對齊，最小寬度 `210px`。
- 分享檢視 `.rag-page.is-shared-view` MUST 以 `display:none` 隱藏整個 `.rag-workspace-toolbar`；分享頁不得出現任何工作區操作。

## 3. Canonical DOM

```html
<div class="rag-workspace-toolbar">
  <a
    class="rag-friend-link"
    href="https://judgment.ragdemo.win"
    target="_blank"
    rel="noopener noreferrer"
    data-workspace-action="friend-share"
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="4" rx="1"></rect>
      <path d="M12 8v13"></path>
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></path>
      <path d="M12 8H7.5a2.5 2.5 0 1 1 0-5H12"></path>
      <path d="M12 8h4.5a2.5 2.5 0 1 0 0-5H12"></path>
    </svg>
    <span>分享給朋友</span>
  </a>

  <button
    class="rag-workspace-icon"
    type="button"
    data-workspace-action="menu"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="rag-workspace-menu"
    title="更多對話操作"
    aria-label="更多對話操作"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="4.2" cy="12" r="2.6" fill="currentColor" stroke="none"></circle>
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none"></circle>
      <circle cx="19.8" cy="12" r="2.6" fill="currentColor" stroke="none"></circle>
    </svg>
  </button>

  <button
    class="rag-workspace-icon"
    type="button"
    data-workspace-action="share"
    title="建立公開連結"
    aria-label="建立公開連結"
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4"></path>
      <path d="m8 8 4-4 4 4"></path>
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"></path>
    </svg>
  </button>

  <div
    class="rag-history-menu rag-workspace-menu"
    id="rag-workspace-menu"
    role="menu"
    hidden
  ></div>
</div>
```

圖示 MUST 使用 `aria-hidden="true"`；按鈕 MUST 有可讀的 `title` 與 `aria-label`。`hidden` 屬性 MUST 用於關閉三點選單，不得只以視覺透明度假裝關閉。

## 4. 元件契約

### 4.1 分享給朋友（`.rag-friend-link`）

- 顯示文字 MUST 為「分享給朋友」。
- `href` MUST 為 `https://judgment.ragdemo.win`，並保留 `target="_blank"` 與 `rel="noopener noreferrer"` 作為 JavaScript 不可用時的退路。
- 點擊 MUST 攔截預設導覽，MUST NOT 直接開啟新視窗，也 MUST NOT 顯示自訂分享選單。
- 若瀏覽器支援 Web Share API，MUST 呼叫：

```js
navigator.share({
  title: "Judgment RAG Console",
  url: "https://judgment.ragdemo.win",
});
```

- 使用者在原生分享面板按取消（`AbortError`）時 MUST 安靜結束，不顯示錯誤 toast。
- 不支援 Web Share API 或分享失敗時，MUST 將 `https://judgment.ragdemo.win` 複製到剪貼簿：
  - 成功 toast：`已複製網站連結。`
  - 失敗 toast：`無法分享網站連結。`
- 由滑鼠／觸控觸發時，完成後 MUST 釋放按鈕焦點，避免留下 focus 外框；鍵盤觸發時 MAY 保留焦點以維持無障礙操作。
- 「分享給朋友」只分享網站首頁，不建立 RAG 快照，也不包含目前對話。

### 4.2 三點對話選單（`data-workspace-action="menu"`）

- 按鈕 MUST 以 `aria-expanded` 表示選單狀態，並以 `aria-controls="rag-workspace-menu"` 指向選單。
- 選單開啟時 MUST 關閉左側歷史選單；兩者不得同時展開。
- 選單項目固定為：
  1. `重新命名`
  2. `釘選對話`／`取消釘選`
  3. `刪除`
  4. `移至專案`
- 選單 MUST NOT 包含分享項目；分享只能由右側獨立按鈕或問題／回答工具列建立。
- 選單操作對象 MUST 為目前 `currentConversationId` 對應的對話。
- 沒有可管理對話時，四個項目 MUST 顯示為 `disabled`，並顯示提示 `目前沒有可管理的對話。`。
- 點擊外部、按 Escape 或頁面捲動時 MUST 關閉選單。
- 「移至專案」開啟專案子選單時，MUST 提供返回上一層的 `返回` 項目。

### 4.3 建立公開連結（`data-workspace-action="share"`）

- 按鈕 MUST 使用 share 圖示，`title` 與 `aria-label` 均為「建立公開連結」。
- 點擊 MUST 分享目前完整對話（所有輪次），MUST NOT 只分享目前畫面可見的單一回答。
- 若記憶體中的 `conversationTurns` 為空，但歷史紀錄有目前對話，MUST 改用歷史紀錄的 `turns`。
- 若仍無任何輪次，MUST 顯示 warning toast `目前沒有可建立公開連結的對話。`，且 MUST NOT 呼叫建立 API。
- 由滑鼠／觸控觸發時，MUST 在開始與完成後釋放按鈕焦點；即使 API 失敗或剪貼簿失敗也 MUST 釋放，不得留下焦點外框。
- 建立成功後 MUST 只複製公開連結，MUST NOT 開啟系統分享面板，MUST NOT 複製問題、答案或引用全文。

## 5. 公開分享流程（主要規格）

### 5.1 建立快照

前端 MUST 呼叫 `POST /api/rag/share`，payload 形狀為：

```json
{
  "title": "對話標題，最多 200 字元",
  "turns": [
    {
      "question": "問題文字，最多 500 字元",
      "asked_at": "ISO-8601 或空字串",
      "payload": {
        "status": "operational",
        "answer": "回答文字",
        "citations": [],
        "judgments": [],
        "law_sources": []
      }
    }
  ]
}
```

限制與行為：

- `turns` MUST 至少 1 輪、最多 30 輪；空問題 MUST 被拒絕。
- 快照 JSON MUST 不超過 1,000,000 bytes；超過時 API MUST 回 `413`。
- 標題 MUST 最多 200 字元；問題 MUST 最多 500 字元。
- `payload` MUST 只保留允許清單欄位，並經 `sanitize_rag_result()` 清理：
  - MUST NOT 保存 `pipeline_flow`、`test_run`、內部主機、模型端點或其他基礎設施細節。
  - `retrieval` MUST 經 `sanitize_infrastructure()` 清理後才保存。
  - `partial` 與 `streaming` MUST 強制為 `false`，避免分享頁重播串流狀態。
- 快照 MUST 寫入 PostgreSQL `rag_share_snapshots`。
- token MUST 使用 `secrets.token_urlsafe(16)` 產生，長度上限 64；不得使用可預測的流水號。
- 快照 MUST 保留 7 天（168 小時）；建立時 MUST 清除已過期快照。
- API MUST 回傳 `{ "id": "<token>", "expires_at": "<ISO-8601>" }`，並加上 `Cache-Control: no-store`。

### 5.2 公開連結格式

前端 MUST 使用目前頁面的 origin 與 pathname 建立連結，清除一般查詢參數，hash 固定為：

```text
#/rag/share?contentId=<token>
```

例如：

```text
https://judgment.ragdemo.win/#/rag/share?contentId=abc123
```

- 新分享 MUST 使用 `contentId`，MUST NOT 使用舊版 `?share=` 或 `?q=` 作為新連結格式。
- 複製到剪貼簿的內容 MUST 只有完整公開 URL，不得包含其他說明文字。
- 在 demo 開放且 RAG feature 啟用時，連結 MUST 可直接貼到其他瀏覽器或裝置開啟，不需登入。
- `POST /api/rag/share` 與 `GET /api/rag/share/{share_id}` MUST 屬於 RAG feature 的 `DEMO_QUERY`／`DEMO_READ` 例外；demo 關閉或 RAG feature 關閉時 MUST 拒絕，既有連結在該期間內視為失效。

### 5.3 成功回饋

建立並複製成功後，MUST 顯示 `ok` toast，內容固定為：

- 主文字：`已複製公開連結`（不得加句號）
- 詳細文字：`任何擁有此連結的人都可以查看這段對話。`
- 動作按鈕：`開啟連結`
- 關閉控制：`×`，`aria-label="關閉通知"`
- 預設停留時間：7 秒

點擊「開啟連結」MUST 以新分頁開啟同一個公開 URL，使用 `noopener,noreferrer`。toast MUST 有 `role="status"`；失敗 toast MUST 使用 `role="alert"`。

### 5.4 失敗狀態

| 情境 | 行為 | 文字 |
| --- | --- | --- |
| 沒有可分享輪次 | warning toast，不呼叫 API | `目前沒有可建立公開連結的對話。` |
| 建立 API 失敗或無回傳 id | danger toast，6 秒 | `無法建立公開連結，請稍後再試。` |
| 剪貼簿寫入失敗 | danger toast，6 秒 | `無法複製公開連結，請確認瀏覽器剪貼簿權限。` |
| 分享快照不存在或過期 | 回到一般 RAG 頁並顯示 warning toast | `分享連結已失效或無法載入。` |
| 分享快照格式錯誤／空內容 | 視為載入失敗 | `分享連結已失效或無法載入。` |

失敗時 MUST NOT 顯示假的成功連結、MUST NOT 將部分內容複製到剪貼簿。

### 5.5 開啟分享連結

- 前端 MUST 解析 `#/rag/share?contentId=<token>`，也 MAY 相容舊版 `?share=` 與 `/rag/share/<token>`。
- 前端 MUST 呼叫 `GET /api/rag/share/{share_id}` 取得快照；API 回應 MUST 加上 `Cache-Control: no-store`。
- 找到快照時 MUST：
  - 直接渲染快照中的所有問題與回答，不得重新呼叫 `/api/rag/query`、Embedding、Qdrant、Reranker 或 LLM。
  - 保留原本的 citations、judgments、law sources、status 與 notice。
  - 將 URL canonicalize 為 `#/rag/share?contentId=<token>`。
  - 加上 `.rag-page.is-shared-view`。
  - 以 `display:none` 隱藏 `.rag-library` 與 `.rag-workspace-toolbar`。
  - 保留右側 `.rag-workspace` 內容；分享頁不得顯示左側歷史側欄或任何工作區操作按鈕。
  - 顯示 `已載入分享的對話。` ok toast，約 3.2 秒。
- 重新整理相同有效連結 MUST 仍能載入相同快照。
- 分享檢視後以 hash 導覽至 `#/home`、`#/data` 等其他頁面 MUST 正常切換，不得殘留 `.is-shared-view` 或隱藏中的工具列。
- 快照不存在、已過期或內容為空時 MUST 回 `404` 或顯示載入失敗，不得產生替代答案。

### 5.6 分享入口的差異

| 入口 | 分享範圍 | 行為 |
| --- | --- | --- |
| 問題泡泡「分享」 | 從第一輪到該問題所在輪次 | 建立公開快照並複製連結 |
| 回答卡「分享」 | 從第一輪到該回答所在輪次 | 建立公開快照並複製連結 |
| 工作區右上「建立公開連結」 | 目前完整對話（所有輪次） | 建立公開快照並複製連結 |
| 工作區右上「分享給朋友」 | 不建立快照 | 以 Web Share API 分享網站首頁 |

三個公開連結入口 MUST 共用同一個 `shareRagTurns()` 流程與相同 toast／失敗處理，避免行為分歧。

## 6. 隱私與安全

- 公開連結 MUST 為不可猜測的隨機 token，且不得提供列表 API。
- 快照 MUST 於 7 天後失效；`GET` 不得延長期限。
- 快照 MUST 經過允許清單與 sanitizer 雙重清理，不得包含 pipeline、測試 Flow、主機 URL、模型端點、內部錯誤或基礎設施資訊。
- 在 demo 開放且 RAG feature 啟用時，公開連結 MUST NOT 需要登入，任何持有連結的人都能查看快照內容；UI 必須以 toast 詳細文字明確告知。demo 關閉時，連結依目前 route policy 失效。
- 快照建立屬於 demo 的受限寫入例外；不得用於上傳任意檔案、執行查詢或修改既有對話。
- `Cache-Control: no-store` MUST 同時套用於建立與讀取回應，避免中間快取保存對話。
- 問題與回答文字會保留於快照 7 天；不得聲稱分享連結會在讀取後立即刪除。

## 7. 無障礙

- 「分享給朋友」MUST 為可見文字連結；不得只顯示 icon。
- 兩個圖示按鈕 MUST 有 `aria-label`，並保有 36×36 的可點擊區域。
- 三點選單 MUST 使用 `role="menu"`，項目 MUST 使用 `role="menuitem"`。
- `aria-expanded` MUST 與選單實際 `hidden` 狀態同步。
- Escape MUST 關閉三點選單並將焦點留在觸發按鈕或頁面合理位置。
- Toast 的動作按鈕與關閉按鈕 MUST 可用鍵盤操作；關閉按鈕 MUST 有可讀名稱。
- 分享成功後 MUST NOT 留下可見的 focus 外框；鍵盤操作仍 MUST 保留可見的 `focus-visible` 樣式。

## 8. 響應式

- 390px viewport 時工具列 MUST 仍靠右排列，不得溢出頁面。
- 「分享給朋友」文字 MUST 保持顯示；不得因寬度不足而只留下 icon。
- 兩個圖示按鈕 MUST 維持 36×36。
- 三點選單開啟時 MUST 保持在 viewport 內；必要時向左延伸，不得造成水平捲動。
- 分享檢視在 390px 時 MUST 隱藏左側對話庫與工具列，只顯示右側對話內容。

## 9. 驗收情境

- **SC-TB-01**：開啟 `#/rag` 後，右上角 MUST 顯示「分享給朋友」、三點按鈕與建立公開連結按鈕；三者不得重疊，390px 無水平溢出。
- **SC-TB-02**：點擊「分享給朋友」MUST 呼叫 Web Share API，參數包含 `title: "Judgment RAG Console"` 與 `url: "https://judgment.ragdemo.win"`；MUST NOT 導覽目前頁面。取消原生面板 MUST 不顯示錯誤。瀏覽器不支援時 MUST 複製網站 URL 並顯示 `已複製網站連結。`。
- **SC-TB-03**：點擊三點按鈕 MUST 顯示且只顯示「重新命名」「釘選對話」「刪除」「移至專案」；MUST NOT 顯示分享。無對話時四個項目 MUST 停用並顯示 `目前沒有可管理的對話。`；點擊外部或 Escape MUST 關閉。
- **SC-TB-04**：完成兩輪對話後點擊工作區分享按鈕，MUST 建立包含兩輪的公開快照，只將 `#/rag/share?contentId=<token>` 複製到剪貼簿，並顯示主文字 `已複製公開連結`、詳細文字 `任何擁有此連結的人都可以查看這段對話。`、動作 `開啟連結` 與關閉 `×`。
- **SC-TB-05**：分享按鈕完成後 MUST 沒有可見焦點外框；API 失敗或剪貼簿失敗時也 MUST 釋放焦點並顯示對應 danger toast。
- **SC-TB-06**：在 demo 開放且 RAG feature 啟用時，於全新瀏覽器開啟有效公開連結 MUST 還原完整多輪對話與引用，MUST NOT 呼叫 `/api/rag/query` 或 LLM；重新整理 MUST 仍可載入；`.rag-library` 與 `.rag-workspace-toolbar` 的 computed `display` MUST 為 `none`。
- **SC-TB-07**：公開連結過期或不存在時 MUST 顯示 `分享連結已失效或無法載入。`，不得顯示其他對話或生成替代答案。
- **SC-TB-08**：問題泡泡分享 MUST 分享至該輪次為止；回答卡分享 MUST 分享至該回答為止；工作區分享 MUST 分享全部輪次。三者 MUST 使用相同成功／失敗文案。
- **SC-TB-09**：分享快照 MUST 不包含 `pipeline_flow`、`test_run`、模型端點或主機 URL；API 回應 MUST 為 `Cache-Control: no-store`，7 天後 GET MUST 回 `404`。

## 10. 測試對應

- `tests/test_web.py::test_rag_share_snapshot_round_trip`
- `tests/test_web.py::test_rag_share_snapshot_rejects_expired_links`
- `tests/test_web.py::test_rag_question_and_answer_actions_are_bundled`
- `tests/test_demo_mode.py` 的 RAG share allowlist／sanitizer 測試
- Playwright 驗證：桌面與 390px 工具列、原生分享、公開連結 round-trip、分享頁隱藏 library／toolbar、焦點外框、console error 為 0

## 11. 變更紀錄

| 日期 | 變更 |
| --- | --- |
| 2026-11-22 | 建立 RAG 工作區工具列設計規格，明確定義分享給朋友、三點選單、公開連結快照、分享頁與隱私／無障礙契約。 |
