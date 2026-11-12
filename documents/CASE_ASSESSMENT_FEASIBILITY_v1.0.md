# Case Assessment & Legal Strategy Engine — Feasibility Assessment v1.0

- **Project:** ragdemo.win
- **Module:** Case Assessment & Legal Strategy Engine（CASE）
- **Document version:** 1.0.0-draft
- **Date:** 2026-11-08
- **Status:** Architecture / product feasibility assessment
- **Related document:** `documents/CASE_ASSESSMENT_DATA_DICTIONARY_v1.0.md`

---

## 1. Executive Conclusion

CASE 在目前的技術棧上**技術可行**，但它不是目前 RAG Console 的一個小型延伸功能，而是另一個產品層：

> 從「法規／判決檢索與 RAG 問答」擴展為「案件為核心的金融法律決策支援系統」。

目前 codebase 已具備以下可重用基礎：

- PostgreSQL + SQLAlchemy 的法規、判決、版本與執行紀錄。
- 原始判決 Parquet 與 DuckDB 品質／統計。
- 法規版本、法規異動事件與判決向量索引。
- FastAPI 查詢 API、RAG、Qdrant、Ollama 與效能觀測。

但 CASE v1.0 需要的以下能力，目前**尚未存在**：

- 案件、當事人、文件、事實、爭點、法律要件、證據、策略等 Domain Model。
- 案件文件上傳、OCR／文字抽取、檔案權限與保存政策。
- 使用者認證、RBAC、案件層級授權與 tenant isolation。
- LLM 結構化抽取、Schema 驗證、Provenance 與人工覆核流程。
- 法律要件與證據的關聯模型。
- 正反判決比較、風險矩陣、策略比較與情境分析。
- 可供評估的專家標註資料集。
- 案件專用 Qdrant collection／namespace 與資料隔離。

**建議：**
1. 先完成資料字典、Auth／Storage／Provenance 設計與一個垂直場景 POC。
2. 不要直接開始寫大量 Agent Prompt 或完整前端工作區。
3. CASE v1.0 應被視為獨立 workstream，而不是下一個 Phase 4 小幅功能。

---

## 2. Feasibility by Capability

| 能力 | 現況 | 可行性 | 主要缺口 |
|---|---|---|---|
| PostgreSQL 案件資料模型 | 有 SQLAlchemy、現有法規／判決表 | 高 | 全部 CASE 表需新增 |
| FastAPI 案件 API | 有 FastAPI、查詢／RAG API | 高 | 案件生命週期、非同步工作、授權 |
| 法規檢索與版本 | 有 `LawDocument`、`LawDatasetVersion`、`LawChangeEvent` | 中高 | 條文級結構化版本表仍缺 |
| 判決檢索 | 有 `JudgmentDocument`、Qdrant、Raw Parquet | 高 | Case-private collection／隔離 |
| 文件上傳與抽取 | 無上傳 API、無 OCR pipeline | 中 | 儲存、MIME 驗證、惡意檔案、OCR |
| 事實／爭點抽取 | 有 LLM 與 RAG，但無結構化抽取 | 中 | Schema、Prompt、驗證、人工確認 |
| 法律要件分析 | 無 | 中 | 需法律知識模型與專家標註 |
| 證據映射與缺口 | 無 | 中 | 證據與事實／要件的 link model |
| 正反判決比較 | 有判決資料與向量索引 | 中 | 多階段 retrieval、比較 schema |
| 風險／策略／情境 | 無 | 中低 | 規則、模板、專家覆核、避免單一 LLM 分數 |
| 使用者認證／RBAC | 無 | 低 | Google auth 尚未實作 |
| 案件資料隔離 | 無 | 低 | Auth + server-side authorization + tenant 設計 |
| 可重現性 | 有部分版本／執行紀錄概念 | 中 | Analysis Run、snapshot、model/prompt version |
| 評估資料集 | 無 | 低 | 專家標註、指標、benchmark |
| 前端工作區 | Vanilla JS Console | 中 | CASE UI 是新的大型工作區 |

---

## 3. Reusable Existing Assets

### 3.1 法規與版本

可重用：

- `law_documents`：法規主檔、名稱、類別、生效／廢止說明、內容雜湊、現行狀態。
- `law_dataset_versions`：每次下載／解析的資料版本與雜湊。
- `law_change_events`：法規欄位變更事件。
- 原始法規 Parquet 的 `law_articles`：`article_type`、`article_no`、`article_content`。

限制：

- `law_articles` 目前存在於 Parquet／JSON，不是 PostgreSQL 的獨立條文版本表。
- 要回答「交易發生當時適用哪個條文版本」，需要新增條文級 version key、生效區間與過渡規則，或建立可追溯的 Parquet snapshot 查詢層。
- 不能只比對條號；同一條號在不同版本可能有不同內容。

### 3.2 判決資料

可重用：

- `judgment_documents`：JID、法院、日期、案由、全文、PDF、命中法規、引用。
- 原始 `raw.parquet`：不可變的原始 JSON 與查詢欄位。
- `judgment_vector_index`、`judgment_index_versions` 與 Qdrant `judgments_current` alias（版本化 `judgments_vNNN`；legacy `judgment_documents`）。
- Phase 3 的 DuckDB 資料品質統計，可作為 CASE 取用判決前的品質 gate。

限制：

- CASE 需要引用判決的特定段落、法院認定與當事人主張，不能只存整篇全文。
- 需要新增 `case_precedents`、段落 offset、comparison dimensions 與 provenance。

### 3.3 執行與觀測

可重用：

- `JudgmentImportRun`、`PerformanceRecord`、`AppSetting`。
- 現有 FastAPI request tracing 與效能報表。

限制：

- `JudgmentImportRun` 是 ingestion run，不應與 CASE 的 `analysis_runs` 混用。
- CASE 的 `analysis_runs` 需要保存案件快照、法規版本、特徵版本、模型與 prompt 版本。

---

## 4. Architecture Conflicts and Required Decisions

### 4.1 Frontend Stack

Specification 建議：

- SvelteKit / Svelte 5
- shadcn-svelte

目前專案：

- Vanilla JS SPA。
- 必須支援 `file://` 與 Cloudflare Pages。
- 既有 console 由 FastAPI 直接服務。

**建議：**
- 在目前產品約束下，維持 Vanilla JS。
- CASE 以模組化頁面／工作區方式加入，不急著遷移 SvelteKit。
- 若未來要遷移，應作為獨立前端現代化專案，不與 CASE 同時進行。

### 4.2 Authentication and Authorization

CASE 涉及案件私有文件、交易資訊、個資與商業機密，但目前的 Google authentication 尚未實作。

**這必須是 P0，而不是最後補上：**

- Google OIDC / session。
- `owner_id`、`created_by`、`reviewer_id` 的真實身份。
- Case-level authorization。
- RBAC：owner、editor、reviewer、viewer、admin。
- Audit log。
- 對外 LLM 的資料傳輸政策。

在 auth 完成前，只能做：
- 單機／本機單人 POC。
- 不存放真實敏感案件資料。
- 不開放多人或對外服務。

### 4.3 Case-private Vector Isolation

目前 Qdrant 的公開判決索引使用 `judgments_current` alias（版本化 `judgments_vNNN`；legacy `judgment_documents`）。

CASE 需要：

- 案件文件 chunks 的獨立 collection／namespace。
- Server-side payload filter 與 case_id 授權，不能只靠前端過濾。
- 刪除案件時同步刪除向量與原始文件。
- 不把案件私有 chunk 寫入公開判決 collection。

### 4.4 Provenance

目前 repository 沒有找到 CM2／CM3 命名或對應的 provenance 資料表。

資料字典因此定義通用的 `provenance_records`：

- 來源文件／chunk／offset／hash。
- 抽取方法、模型、prompt 版本。
- confidence 與 verification status。

若 CM2／CM3 位於其他服務，應在實作前做 mapping；不要同時建立兩套互不相容的 provenance。

### 4.5 Law Article Versioning

目前法規版本以整部法規的 `LawDatasetVersion` 為主，條文內容在 Parquet 的 `law_articles`。

CASE 需要：

- `article_key`：穩定條文識別。
- 條文生效／失效區間。
- 修法前後版本。
- 過渡條款。
- 判決引用時的 applicable version。

**建議新增：**
- `law_article_versions`（資料字典已列入 required extension）。
- 或建立可查詢的 Parquet version snapshot，並以 `law_version_id + article_key + content_hash` 作為穩定鍵。

### 4.6 Feature Schema

Specification 引用 `Financial Legal Feature Schema v1.0`，但目前 repository 沒有這個檔案或資料表。

**建議：**
- 先建立 Feature Schema v0.1，不要直接開始寫 Polars。
- 明確區分：
  - retrieval score
  - extraction confidence
  - evidence support
  - legal assessment confidence
  - decision value
  - risk level
- 不得混合成單一「勝訴分數」。

Polars 仍建議保持 optional；DuckDB 繼續負責品質／統計，Polars 只在特徵工程與離線資料集使用。

### 4.7 Strategy Engine

策略建議不能只靠 LLM 產生一段文字。

需要：

- 策略模板與必要欄位。
- 法律依據與證據需求。
- 成本、風險、執行條件、不可逆性。
- 專家覆核。
- 不得以 LLM 自行產生的勝訴機率排序。

---

## 5. Recommended Delivery Strategy

### Phase 0 — Design Foundation（建議 2–4 週）

交付：

- CASE Data Dictionary v1.0（本文件附件）。
- Auth／RBAC／tenant 設計決策。
- 文件儲存與上傳安全設計。
- Provenance schema。
- `law_article_versions` 或 Parquet version snapshot 設計。
- Financial Legal Feature Schema v0.1。
- 一個垂直場景選擇（建議：金融商品適合度／風險揭露）。

**Gate：**
- 沒有 auth 與資料隔離設計，不進入真實案件資料。
- 沒有 provenance schema，不接受 LLM 抽取結果為事實。

### Phase 1 — Case Assessment MVP（建議 6–10 週）

範圍：

- 案件、當事人、文件、事實、事件時間軸。
- 事實來源、確認狀態、衝突標記。
- 法律爭點與適用法規（含版本）。
- 基本證據清單與事實關聯。
- 判決檢索與基本正反案例。
- Analysis Run 與標準化報告。
- 人工覆核。

**不做：**
- 全市場策略引擎。
- 自動勝訴預測。
- 大規模多 Agent 自由對話。

### Phase 2 — Evidence & Legal Intelligence（建議 8–12 週）

- Legal Element Analyzer。
- Evidence-to-Fact-to-Element mapping。
- Evidence gap / contradiction。
- 判決比較與 distinguishing analysis。
- 法規版本與時間有效性。
- 法律關聯圖譜。

### Phase 3 — Risk, Strategy & Evaluation（建議 8–12 週）

- 分項風險矩陣。
- 策略選項與比較。
- Scenario / what-if。
- 專家標註評估集。
- Retrieval / citation / claim support / abstention metrics。

### 總體估算

以目前 codebase、單一垂直場景、1 名後端 + 1 名前端 + 兼職法律專家的假設：

- **P0 + 基本 P1 垂直切片：約 2–4 個月。**
- **完整 CASE v1.0：約 6–9 個月**，不含大規模 OCR、法規資料清洗、LLM 微調與正式合規審查。

這些是規劃估算，不是固定承諾；實際取決於 auth、文件格式、專家可用性與評估資料量。

---

## 6. Minimum Viable Vertical Slice

建議不要一次做六種特徵。先選一個金融案例類型，例如：

> **金融商品適合度與風險揭露爭議**

原因：

- 已有相關法規與判決資料。
- 法律要件相對可拆解：客戶屬性、商品風險、銷售流程、揭露文件、適合度評估、因果關係、損害。
- 可同時驗證事實抽取、法律要件、證據缺口、正反判決與報告格式。

MVP 驗收：

- 20–50 個專家標註案例。
- 每項事實有來源與確認狀態。
- 每個法律要件可連到事實與證據。
- 能找出支持與不支持責任的判決。
- 能指出證據缺口。
- 能產生可追溯報告。
- 高風險結論需人工覆核。

---

## 7. Key Risks

| 風險 | 影響 | 對策 |
|---|---|---|
| 把 LLM 摘要當成已確認事實 | 法律分析錯誤 | 區分來源類型、provenance、人工確認 |
| 只做向量相似度 | 找到文字相似但法律情境不同的判決 | 多階段 retrieval + 法律爭點／事實特徵 |
| 法規版本錯誤 | 用今日法律回答過去交易 | article-level versioning + 過渡規則 |
| 案件資料外洩 | 個資／商業機密風險 | Auth、case-level authorization、tenant isolation |
| 沒有專家評估集 | 無法證明改善 | 建立標註資料與固定 benchmark |
| 策略引擎過度承諾 | 法律責任與信賴風險 | 決策支援定位、揭露不確定性、人工覆核 |
| Scope creep | 長期無法交付 | P0/P1 垂直切片、明確 out-of-scope |

---

## 8. Final Recommendation

**可行性結論：技術上可行，但應以獨立產品層規劃，不建議直接接到目前 Phase 1–3 pipeline 上。**

建議順序：

1. 完成並審閱 `CASE_ASSESSMENT_DATA_DICTIONARY_v1.0.md`。
2. 決定 Auth／Storage／Tenant 架構。
3. 建立 `law_article_versions` 或等價的條文版本方案。
4. 建立 Financial Legal Feature Schema v0.1。
5. 選定一個垂直場景，建立 20–50 個專家標註案例。
6. 再做 Case Assessment MVP。

在這些前置條件完成前，**不要開始大規模 Agent Prompt、策略引擎或前端工作區開發**。目前應保持 Phase 1–3 的穩定架構；Polars 維持 optional feature engineering，不進核心 ingestion。
