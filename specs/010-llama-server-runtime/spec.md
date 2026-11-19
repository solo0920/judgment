# llama-server 執行環境與全站顯示規格

**Status**: Active（canonical infrastructure + UI naming spec）

**Version**: 1.2

**Last Updated**: 2026-11-19

**Applies To**: 全站八個路由（`#/home`、`#/rag`、`#/data`、`#/quality`、`#/performance`、`#/processing`、`#/status`、`#/tests`）、所有 workflow、Model Provider、Embedding／LLM／Reranker host strip、API 端點目錄、頁尾與使用者可見錯誤訊息。

**Parent Specification**: [`../004-web-console/spec.md`](../004-web-console/spec.md)

**Related Specifications**:

- [`../004-web-console/pipeline-waterfall.md`](../004-web-console/pipeline-waterfall.md)（pipeline 時間軸視覺）
- [`../004-web-console/progress-visualization.md`](../004-web-console/progress-visualization.md)（進度與完成狀態視覺）
- [`../009-judgment-vector-index/spec.md`](../009-judgment-vector-index/spec.md)（Qdrant 索引 A／R／E 與目前處理列）
- [`../security/security-acceptance-matrix.md`](../security/security-acceptance-matrix.md)（SSRF／allowlist 驗收）

---

## 1. 目的

本規格是全站 llama-server 的 canonical source，定義：

1. llama-server 的執行端點、API 種類、模型、主要／備援優先順序與環境變數。
2. 主機註冊、即時探測與模型能力分類方式。
3. 全站使用者可見名稱、主機／模型 strip、狀態 chip、tooltip、錯誤與 API 端點目錄的顯示契約。

若其他規格與本規格對 llama-server 的命名、端點或顯示方式有衝突，以本規格為準；A／R／E 索引語意仍以 [`../009-judgment-vector-index/spec.md`](../009-judgment-vector-index/spec.md) 為準。

---

## 2. 名詞

| 名詞 | 定義 |
| --- | --- |
| llama-server | 本專案使用的 OpenAI 相容推論服務；chat、embedding、rerank 各自為獨立 process／port。 |
| Primary | 第一優先端點；目前為 x570 llama-server。 |
| Fallback | Primary 不可用時自動改用的端點；目前為 MBP llama-server。 |
| Host registry | `ollama_hosts` 資料表所保存的主機清單；内部名稱保留相容性，使用者可見名稱一律為 llama-server。 |
| Live probe | 依目前 `.env` 與 host registry 即時測試主機，而非讀取上次索引 run 的歷史結果。 |
| Legacy alias | 舊 `/api/ollama/*` 路徑與 `OLLAMA_ALLOWED_HOSTS` 等內部相容名稱；MUST NOT 出現在使用者可見畫面或 API 端點目錄。 |

---

## 3. 執行環境與設定

### 3.1 Canonical endpoints

| 角色 | Primary | Fallback | API | Model | 備註 |
| --- | --- | --- | --- | --- | --- |
| Embedding | `http://x570:11437` | `http://127.0.0.1:11437` | OpenAI 相容（`openai`） | `bge-m3`（1024 維） | 判決／法規／命令索引與 RAG query embedding。 |
| LLM Chat | `http://x570:11436` | `http://127.0.0.1:11436` | OpenAI 相容（`openai`） | `gemma3:4b` | `LLM_NUM_CTX=6144`；llama-server context 由啟動參數決定。 |
| Rerank | `http://x570:11435` | `http://127.0.0.1:11435` | llama-server `/v1/rerank` | `bge-reranker-v2-m3` | 主要失敗時保留原 Qdrant 排序並標示 degraded。 |

規則：

- x570 MUST 為第一優先；MBP MUST 為 fallback。
- x570 可用時 MUST NOT 先連 MBP。
- x570 不可用時 MAY 自動改用 MBP，UI MUST 明確標示「已切換備援」或「目前使用 …」。
- `11434` 是舊 Ollama 連接埠，MUST NOT 作為目前 llama-server 的 primary／fallback，也不得出現在目前主機 chip。
- Ollama MUST NOT 作為 runtime fallback；舊 Ollama 服務與模型檔僅可作為歷史模型來源或離線備援，不得被誤顯示為目前執行中的 llama-server。

### 3.2 Environment variables

| 變數 | 目前值 | 說明 |
| --- | --- | --- |
| `EMBEDDING_URL` | `http://x570:11437` | Embedding primary。 |
| `EMBEDDING_API` | `openai` | 使用 `/v1/embeddings`、`/v1/models`、`/health`。 |
| `EMBEDDING_FALLBACK_URL` | `http://127.0.0.1:11437` | Embedding fallback。 |
| `EMBEDDING_FALLBACK_API` | `openai` | Fallback API 種類。 |
| `EMBEDDING_MODEL` | `bge-m3` | 1024 維；migration／相容性以 `JUDGMENT_EMBEDDING_VERSION` 管理。 |
| `LLM_URL` | `http://x570:11436` | Chat primary。 |
| `LLM_API` | `openai` | 使用 `/v1/chat/completions`。 |
| `LLM_FALLBACK_URL` | `http://127.0.0.1:11436` | Chat fallback。 |
| `LLM_FALLBACK_API` | `openai` | Fallback API 種類。 |
| `LLM_MODEL` | `gemma3:4b` | Chat 模型。 |
| `LLM_NUM_CTX` | `6144` | 單一併發 slot 的 context 預算；不得誤設為總池大小。 |
| `RERANK_URL` | `http://x570:11435` | Rerank primary。 |
| `RERANK_FALLBACK_URL` | `http://127.0.0.1:11435` | Rerank fallback。 |
| `RERANK_MODEL` | `bge-reranker-v2-m3` | Rerank 模型。 |
| `OLLAMA_ALLOWED_HOSTS` | 舊內部名稱 | 只作為 host allowlist 的相容名稱；可見 UI 不得顯示此名稱。 |

`LLM_KEEP_ALIVE` 只對舊 Ollama native API 有效；OpenAI 相容 llama-server MUST NOT 送出 `keep_alive` 或 `options`。

### 3.3 Host registry 與優先順序

- Canonical API：`GET/POST /api/llama-server/hosts`、`PATCH/DELETE /api/llama-server/hosts/{id}`、`POST /api/llama-server/hosts/{id}/activate`、`POST /api/llama-server/hosts/reorder`、`POST /api/llama-server/hosts/deactivate`、`POST /api/llama-server/hosts/capabilities/test`、`POST /api/llama-server/hosts/{id}/models/select`、`POST /api/llama-server/hosts/{id}/models/clear`。
- 舊 `/api/ollama/hosts` MAY 保留為相容 alias，但 MUST 以 `include_in_schema=False` 隱藏，且 MUST NOT 出現在 `/api/status.endpoints`。
- 目前 registry MUST 至少包含：
  - `x570` · `http://x570:11437` · `is_active=true` · `priority=0` · embedding。
  - `mbp` · `http://127.0.0.1:11437` · `is_active=false` · `priority=10` · embedding fallback。
- 同一主機的 chat／embedding／rerank process 以不同 port 區分；不得把 `11434` 的舊記錄當成 `11437`。
- 主機探測順序：
  1. 先嘗試 native `/api/tags`（相容舊 Ollama）。
  2. 失敗時嘗試 OpenAI 相容 `/v1/models` 與 `/health`。
  3. 成功時回傳 `api="openai"`；模型清單由 `/v1/models` 轉為 host chip／capability 所需格式。
  4. 兩者皆失敗時 `status="degraded"`，UI 顯示「無法取得」，不得偽裝可用。
- 模型能力分類：`bge-m3`／embedding 名稱 MUST 歸為 embedding，不得列為 chat；reranker 名稱 MUST 歸為 reranker；其餘 OpenAI 模型才可標示 chat。
- Host 數量上限維持 20；allowlist、link-local／metadata／multicast／reserved 封鎖規則不變。

### 3.4 Live probe endpoint

`GET /api/processing/embedding-hosts` MUST 依目前 `runtime_settings()` 即時測試 Embedding primary／fallback／failover，回傳：

```json
{
  "status": "operational",
  "model": "bge-m3",
  "tested_at": "2026-11-19T06:04:40+00:00",
  "hosts": [
    {"url": "http://x570:11437", "role": "primary", "status": "operational"},
    {"url": "http://127.0.0.1:11437", "role": "fallback", "status": "operational"}
  ],
  "selected": {"url": "http://x570:11437", "role": "primary"},
  "active": {"url": "http://x570:11437", "using_fallback": false},
  "error": ""
}
```

- 選用第一個 `status=operational` 的主機。
- 選到 fallback 時 `active.using_fallback=true`。
- 無可用主機時 `status="failed"`、`selected=null`、`active={}`，UI MUST 顯示失敗，不得沿用上一個 run 的成功狀態。

---

## 4. 全站命名契約

### 4.1 使用者可見名稱

- 所有 UI 標題、卡片、按鈕、狀態、tooltip、toast、錯誤訊息、空狀態、workflow 描述、階段名稱、架構圖、頁尾與 API 端點 label MUST 使用 **llama-server**。
- 使用者可見文字 MUST NOT 出現 `Ollama`（大小寫均同）。
- 允許保留的內部名稱：`ollama_hosts` 資料表、`OllamaHost`／`OllamaModelCapability` Python 類別、`/api/ollama/*` 隱藏 alias、`OLLAMA_ALLOWED_HOSTS` 環境變數、SSE topic `ollama`。這些名稱 MUST NOT 洩漏到畫面、API 端點目錄或使用者可見錯誤。

### 4.2 Canonical API 與顯示範例

| 位置 | Canonical 顯示 |
| --- | --- |
| 資料處理索引卡片 | `llama-server 連線測試` |
| 索引 workflow 階段 | `llama-server 主機／模型測試`、`llama-server 連線測試` |
| Model Provider 頁 | `llama-server 主機與模型` |
| Embedding strip | `Embedding 主機／模型`（主機 chip 使用 `主機:模型`） |
| RAG 流程 | `llama-server embedding 查詢向量`、`llama-server LLM 生成` |
| 效能報表 | `llama-server Embedding` |
| 題庫 | `llama-server 已建立題目`、`llama-server 參考答案` |
| 架構圖 | `llama-server Embedding`、`llama-server LLM`、`llama-server Hosts` |
| 頁尾 | `Built with FastAPI · PostgreSQL · Parquet · Qdrant · llama-server` |
| API 目錄 | `/api/llama-server/hosts` 等；MUST NOT 顯示 `/api/ollama/*` |

---

## 5. 顯示契約

### 5.1 主機／模型 strip

所有 llama-server 主機清單 MUST 使用既有 `rag-model-strip`／`rag-model-buttons`／`rag-model-button` 視覺語言，不得使用大型逐列卡片。

- Header：
  - 標題（例：`llama-server 連線測試`）。
  - 最後選用 URL（`rag-model-strip-base`，可省略）。
  - `目前：host:port:model`。
  - 狀態 badge（正常／失敗／待命）。
  - 非執行中 run 顯示「目前設定」badge 與「重新測試」按鈕。
  - 使用 fallback 時顯示「已切換備援」或「目前使用 …」。
- Chips：
  - 一台主機一個 chip，內含 `host:port:model` 與狀態文字。
  - 選用主機：實心 `is-active`，文字「使用中」。
  - 其他可用主機：淡色，文字「可用」。
  - 無法連線／degraded／缺模型：灰色 `is-unavailable`，文字「無法取得」。
  - Tooltip MUST 包含角色（主要／備援）、URL、狀態、模型清單與 detail。
- Hint：
  - 說明 primary／fallback 嘗試順序與 chip 顏色語意。
  - 測試時間顯示在 hint，不得另占大型 footer。
- 非執行中 run：
  - 卡片 MUST 自動呼叫 live probe，以目前 `.env`／registry 顯示，不得把上次 run 的舊主機當成目前狀態。
  - 顯示「目前設定」與「重新測試」。
  - 手動重新測試 MUST 更新 chips、status、selected 與測試時間。
- 390px viewport MUST 換行且無水平溢出。

### 5.2 Model Provider 頁

- 標題：`llama-server 主機與模型`。
- 說明文字 MUST 使用 llama-server，不得使用 Ollama。
- 新增主機表單：
  - 名稱 placeholder：`例如：x570 llama-server`。
  - Port 預設值：`11437`（embedding）；chat／rerank 由使用者改成 11436／11435。
- 主機卡片：
  - 顯示名稱、`已連線`／`無法連線`、base URL、模型數。
  - 目前主機顯示「目前使用」；其他主機顯示「使用此主機」。
  - 模型能力標籤 MUST 正確區分 `Embedding`／`Chat`／`Reranker`；`bge-m3` MUST NOT 顯示為 chat。
- API 偵測結果 `api="openai"` 為目前 llama-server；native `api="ollama"` 只保留相容性。

### 5.3 其他頁面

- `#/rag`：模型 strip 使用 `主機:模型`；目前使用中的 chip 實心心；hover 顯示 base URL；不得產生重複的同名主機 chip。
- Embedding 主機 strip：模型標籤正規化與去重 MUST 依 5.4；不得因 legacy `:latest` 後綴而多出一個重複的 `使用中` chip。
- `#/tests`：模型清單、測試文案、錯誤訊息使用 llama-server。
- `#/performance`：索引階段 label 使用 `llama-server Embedding`。
- `#/quality`／題庫：AI 生成文案與結果使用 llama-server。
- `#/status`：架構圖、Model Provider、API 端點目錄與頁尾不得出現 Ollama。
- 所有 workflow 的 stage key `ollama` 可保留為內部 key；label MUST 為 `llama-server 連線測試`。

### 5.4 模型標籤正規化與去重

Embedding strip 的「目前」標籤有兩個來源，必須先正規化再比較：

| 來源 | 範例 | 說明 |
| --- | --- | --- |
| 法規／命令索引階段 `legal_qdrant.model.label` | `x570:bge-m3:latest` | 可能是舊 Ollama run 留下的 tag 後綴。 |
| llama-server host registry `/v1/models` | `x570:bge-m3` | llama-server 回傳的 canonical alias。 |

規則：

- 正規化 MUST 去除字串前後空白，並只移除**結尾**的 `:latest`；其他 tag（例如 `gemma3:4b`）MUST 保持不變。
- 「目前」標籤、host chip 標籤與切換確認訊息 MUST 使用正規化後的值。
- 比較目前模型與 registry 選項時 MUST 使用正規化後的值；若相符，該選項直接標示 `is-active` 與「使用中」，不得再插入靜態 chip。
- 只有在目前模型無法對應任何 registry 選項時，才允許插入**一個**靜態「使用中」chip，避免目前模型在清單中消失。
- 去重 MUST 以「主機 + 正規化模型」為單位；不得合併不同主機，也不得合併不同 base model。

| 目前標籤 | Registry 標籤 | 顯示結果 |
| --- | --- | --- |
| `x570:bge-m3:latest` | `x570:bge-m3` | 一個 `x570:bge-m3 使用中` chip。 |
| `x570:bge-m3` | `x570:bge-m3` | 一個 `x570:bge-m3 使用中` chip。 |
| `x570:bge-m3:latest` | `x570:bge-m3`、`mbp:bge-m3` | `x570:bge-m3 使用中` 與 `mbp:bge-m3` 兩個 chip，沒有重複。 |
| `x570:gemma3:4b` | `x570:gemma3:4b` | tag `:4b` 不得被移除。 |

---

## 6. 錯誤與降級

| 情境 | 顯示 |
| --- | --- |
| x570 正常 | x570 chip 實心「使用中」；MBP 淡色「可用」。 |
| x570 不可用、MBP 正常 | MBP chip 實心「使用中」；header「已切換備援」；x570 灰色「無法取得」。 |
| 兩台皆不可用 | 所有 chip 灰色「無法取得」；status 失敗；不得顯示舊的成功資料。 |
| 模型不存在 | 該主機「無法取得」，detail 顯示缺模型；不得選為 primary。 |
| Probe timeout | 顯示「無法取得」與 timeout detail；不得偽裝 operational。 |
| 舊 run 資料 | 只在執行中顯示該 run 的 probe；非執行中一律以 live probe 取代。 |

---

## 7. 驗收清單

- [ ] 全站八個路由、Model Provider、API 端點目錄與頁尾均無可見 `Ollama`。
- [ ] `/api/status.endpoints` 包含 `/api/llama-server/hosts`，不包含 `/api/ollama/*`。
- [ ] `GET /api/llama-server/hosts` 顯示 x570 priority 0 active、MBP priority 10 fallback，兩者 `api="openai"`、`status="operational"`。
- [ ] `GET /api/processing/embedding-hosts` 選用 `http://x570:11437` primary，MBP 為 fallback。
- [ ] 索引卡片顯示 x570 實心「使用中」、MBP 淡色「可用」，不再顯示 11434。
- [ ] 非執行中索引 run 顯示「目前設定」與「重新測試」，按下後即時更新。
- [ ] x570 停止時自動選 MBP，並顯示「已切換備援」。
- [ ] 390px viewport 無水平溢出。
- [ ] `#/status` Model Provider 表單預設 port 為 11437，標題為 `llama-server 主機與模型`。
- [ ] `bge-m3` 在模型能力清單中為 `Embedding`，不得為 chat。
- [ ] Embedding strip 的 `x570:bge-m3:latest` 與 registry 的 `x570:bge-m3` 正規化為同一 chip，不得重複顯示。
- [ ] `x570:bge-m3:latest`、`x570:bge-m3`、`mbp:bge-m3` 同時存在時，畫面只有兩個 chip：x570 使用中、MBP 可用。
- [ ] `gemma3:4b` 等非 `:latest` tag 不會被正規化破壞。
- [ ] 目前模型不在 registry 時，只出現一個靜態「使用中」chip。
- [ ] 完整 `uv run pytest`、`ruff check`、`node --check` 通過。

---

## 8. 變更記錄

| 版本 | 日期 | 變更 |
| --- | --- | --- |
| 1.0 | 2026-11-19 | 建立全站 llama-server canonical 規格：x570 primary／MBP fallback、OpenAI 相容端點、host registry、live probe、全站命名與 strip 顯示契約。 |
| 1.1 | 2026-11-19 | Embedding strip 模型標籤正規化移除 `:latest`，避免 `bge-m3:latest` 與 `bge-m3` 重複顯示。 |
| 1.2 | 2026-11-19 | 新增模型標籤正規化與去重專節：來源、只移除結尾 `:latest`、主機＋模型去重、靜態 chip fallback 與範例。 |
