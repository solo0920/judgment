import { api } from "../api.js";
import { addHistory, clearHistory, listHistory, storageMode } from "../store.js";
import { renderTestFlowPanel } from "./performance.js";
import {
  emptyState,
  escapeHtml,
  formatDate,
  formatNumber,
  formatRelativeTime,
  icon,
  notice,
  setBusy,
  statusBadge,
  toast,
} from "../utils.js";

const EXAMPLES = [
  "金融消費者保護法如何處理金融消費爭議？",
  "證券交易法對內線交易有什麼規範？",
  "銀行法對吸收存款與授信有哪些限制？",
  "保險法對於業務員不當招攬的責任規定？",
  "銀行法有多少條文？",
  "證券營業員常觸犯什麼法規或命令？",
  "有哪些法規是和壽險及產險相關的？",
];

function answerPlaceholder() {
  return `<div class="answer-placeholder">
    <span class="empty-icon">${icon("sparkles", 26)}</span>
    <h2 class="empty-title">答案只會來自檢索到的判決片段</h2>
    <p class="empty-text">送出問題後，系統會先以 Qdrant 檢索判決，再由 LLM 依檢索片段生成回答並標示引用編號。
      若向量索引或 LLM 尚未就緒，會明確顯示降級狀態，不會憑空生成答案。</p>
  </div>`;
}

function answerLoading(question, testMode = false) {
  const detail = testMode
    ? "測試模式：正在依序執行所有可用 embedding 與 LLM 模型，可能需要數分鐘…"
    : "正在以向量相似度檢索判決片段並生成回答；快速模式通常 2–10 秒…";
  return `<div class="answer-head">
      <div class="answer-head-left">${icon("sparkles", 16)}
        <span class="answer-head-title">檢索中</span>
      </div>
      <div class="answer-head-meta"><span class="spinner"></span></div>
    </div>
    <div class="answer-body">
      <p class="answer-text">${detail}「${escapeHtml(question)}」</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`;
}

function judgmentCard(judgment, index) {
  const score =
    judgment.score === null || judgment.score === undefined
      ? ""
      : `相似度 ${Number(judgment.score).toFixed(4)}`;
  const meta = [judgment.court, judgment.jdate, score]
    .filter(Boolean)
    .map((value) => `<span>${escapeHtml(value)}</span>`)
    .join("");
  const laws = (Array.isArray(judgment.matched_laws) ? judgment.matched_laws : [])
    .slice(0, 5)
    .map((law) => `<span class="chip">${escapeHtml(law)}</span>`)
    .join("");
  const bodyAttributes = judgment.jid
    ? ` data-action="open-parquet-judgment"
        data-jid="${escapeHtml(judgment.jid)}"
        role="button"
        tabindex="0"
        title="點擊開啟 DB 儲存原文判決"
        aria-label="開啟 DB 儲存原文判決 ${escapeHtml(judgment.jid)}"`
    : "";
  const pdfLink = judgment.pdf_url
    ? `<a class="citation-link" href="${escapeHtml(judgment.pdf_url)}" target="_blank" rel="noopener noreferrer" title="開啟司法院原判決 PDF">司法院原判決 PDF${icon(
        "external",
        11,
      )}</a>`
    : "";
  return `<article class="citation">
    <span class="citation-index">[${judgment.index ?? index + 1}]</span>
    <div class="citation-body"${bodyAttributes}>
      <h4 class="citation-name">${escapeHtml(judgment.jid || "未知案號")}</h4>
      <div class="citation-meta">${meta || "<span>判決 metadata</span>"}</div>
      ${
        judgment.title
          ? `<div class="citation-meta"><span>案由：${escapeHtml(judgment.title)}</span></div>`
          : ""
      }
      ${laws ? `<div class="chips" style="margin-top:8px">${laws}</div>` : ""}
      ${
        judgment.snippet
          ? `<p class="citation-snippet">${escapeHtml(judgment.snippet)}</p>`
          : ""
      }
    </div>
    <div class="citation-links">${pdfLink}</div>
  </article>`;
}

function citationCard(citation, index) {
  const meta = [
    citation.law_level,
    citation.law_category,
    citation.article_count ? `${formatNumber(citation.article_count)} 條` : "",
  ]
    .filter(Boolean)
    .map((value) => `<span>${escapeHtml(value)}</span>`)
    .join("");
  const link = citation.law_url
    ? `<a class="citation-link" href="${escapeHtml(citation.law_url)}" target="_blank" rel="noopener noreferrer">來源${icon(
        "external",
        11,
      )}</a>`
    : "";
  return `<article class="citation">
    <span class="citation-index">${String(citation.index ?? index + 1).padStart(2, "0")}</span>
    <div class="citation-body">
      <h4 class="citation-name">${escapeHtml(citation.law_name || "未命名法規")}</h4>
      <div class="citation-meta">${meta || "<span>法規 metadata</span>"}</div>
      ${
        citation.snippet
          ? `<p class="citation-snippet">${escapeHtml(citation.snippet)}</p>`
          : ""
      }
    </div>
    ${link}
  </article>`;
}

function lawSourceCard(source, index) {
  const sourceLabel = source.source_label || (source.source_type === "order" ? "命令" : "法規");
  const level =
    source.law_level && source.law_level !== sourceLabel ? source.law_level : "";
  const meta = [
    `<span class="badge ${source.source_type === "order" ? "badge-warn" : "badge-info"}">${escapeHtml(sourceLabel)}</span>`,
    level,
    source.law_category,
    source.article_count ? `${formatNumber(source.article_count)} 條` : "",
    source.law_modified_date ? `異動 ${formatDate(source.law_modified_date)}` : "",
  ]
    .filter(Boolean)
    .map((value) => `<span>${value}</span>`)
    .join("");
  const promulgation = source.first_promulgation
    ? `<div class="citation-meta"><span>最早制定：${escapeHtml(
        source.first_promulgation.roc_date,
      )}（西元 ${escapeHtml(source.first_promulgation.gregorian_date)}）</span></div>`
    : "";
  const stats = source.stats;
  const statsBlock = stats
    ? `<div class="law-source-stats">
        <span>提及「${escapeHtml(stats.entity || "")}」的判決 ${formatNumber(
          stats.judgment_count || 0,
        )} 筆</span>
        <span>本法規被引用 ${formatNumber(stats.law_count || 0)} 次</span>
      </div>`
    : "";
  const articles = (Array.isArray(source.articles) ? source.articles : [])
    .slice(0, 2)
    .map(
      (article) => `<div class="law-source-article">
        <span class="law-source-article-no">${escapeHtml(article.article_no || "條文")}</span>
        <p class="law-source-article-text">${escapeHtml(article.article_content || "")}</p>
      </div>`,
    )
    .join("");
  const link = source.law_url
    ? `<a class="citation-link" href="${escapeHtml(source.law_url)}" target="_blank" rel="noopener noreferrer">法規來源${icon(
        "external",
        11,
      )}</a>`
    : "";
  const bodyAttributes = source.law_key
    ? ` data-action="open-law-source"
        data-law-key="${escapeHtml(source.law_key)}"
        data-source-type="${escapeHtml(source.source_type || "")}"
        role="button"
        tabindex="0"
        title="點擊開啟本地 Parquet 的法規／命令原始條文"
        aria-label="開啟 ${escapeHtml(source.law_name || "法規")} 原始條文"`
    : "";
  return `<article class="citation law-source">
    <span class="citation-index">${String(source.index ?? index + 1).padStart(2, "0")}</span>
    <div class="citation-body"${bodyAttributes}>
      <h4 class="citation-name">${escapeHtml(source.law_name || "未命名法規")}</h4>
      <div class="citation-meta">${meta}</div>
      ${promulgation}
      ${statsBlock}
      ${articles}
    </div>
    <div class="citation-links">${link}</div>
  </article>`;
}

function renderAnswer(question, payload) {
  const citations = Array.isArray(payload.citations) ? payload.citations : [];
  const judgments = Array.isArray(payload.judgments) ? payload.judgments : [];
  const lawSources = Array.isArray(payload.law_sources) ? payload.law_sources : [];
  const matched = Array.isArray(payload.matched_terms) ? payload.matched_terms : [];
  const status = payload.status || "preview";
  const statusLabel =
    status === "operational"
      ? "完成"
      : status === "retrieval_only"
        ? "僅檢索結果"
        : status === "preview"
          ? "法規預覽"
          : status === "unavailable" || status === "not_configured"
            ? "資料不可用"
            : status === "degraded"
              ? "降級"
              : "完成";

  const judgmentSection = judgments.length
    ? `<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>引用判決 · ${judgments.length} 筆</span>
        <span>vector retrieval · [編號] 對應回答引用</span>
      </div>
      <div class="citation-list">${judgments
        .map((judgment, index) => judgmentCard(judgment, index))
        .join("")}</div>`
    : "";
  const lawSection = lawSources.length
    ? `<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>引用法規／命令 · ${lawSources.length} 筆</span>
        <span>PostgreSQL metadata · Parquet 條文</span>
      </div>
      <div class="citation-list">${lawSources
        .map((source, index) => lawSourceCard(source, index))
        .join("")}</div>`
    : "";
  const metadataSection = !judgments.length && citations.length
    ? `<div class="answer-divider"></div>
      <div class="answer-section-label">
        <span>引用法規 · ${citations.length} 筆</span>
        <span>metadata match</span>
      </div>
      <div class="citation-list">${citations
        .map((citation, index) => citationCard(citation, index))
        .join("")}</div>`
    : "";
  let citationSection = judgmentSection + lawSection + metadataSection;
  if (!citationSection) {
    citationSection = `<div class="answer-divider"></div>
      ${emptyState({
        iconName: "file",
        title: "沒有可引用的來源",
        text:
          status === "retrieval_only"
            ? "目前已建立的向量索引中沒有足夠相似的判決，也沒有可對應的法規或命令。系統不會在沒有來源時生成答案。"
            : "向量索引或 LLM 尚未就緒，且問題中沒有可直接對應的現行法規名稱。",
      })}`;
  }

  const matchedChips = matched.length
    ? `<div class="answer-section-label" style="margin-top:18px">
        <span>命中詞彙</span>
      </div>
      <div class="chips">${matched
        .map((term) => `<span class="chip">${escapeHtml(term)}</span>`)
        .join("")}</div>`
    : "";

  const testRun = payload.test_run;
  const llmModel = String(
    payload.llm_model || testRun?.primary_model || "",
  ).trim();
  const embeddingModel = String(payload.embedding_model || "").trim();
  const modelTitle = [
    llmModel ? `LLM：${llmModel}` : "",
    embeddingModel ? `Embedding：${embeddingModel}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const structuredAnswer = payload.answer_source === "structured";
  const modelChip = llmModel
    ? `<span class="answer-model" title="${escapeHtml(modelTitle)}">${icon(
        "brain",
        11,
      )}${escapeHtml(llmModel)}</span>`
    : structuredAnswer
      ? `<span class="answer-model" title="由 PostgreSQL metadata、Parquet 條文與判決引用統計直接整理">${icon(
          "database",
          11,
        )}法規資料庫</span>`
      : "";
  const testRunBlock = testRun
    ? `<div class="test-run-summary">
        <div class="test-run-summary-head">
          <span class="badge badge-warn">測試模式</span>
          ${statusBadge(testRun.status)}
          <span class="mono">${escapeHtml(testRun.run_id || "")}</span>
        </div>
        <div class="test-run-summary-body">
          <span>Embedding ${Number(testRun.models?.embedding?.length || 0)} 個</span>
          <span>LLM ${Number(testRun.models?.llm?.length || 0)} 個</span>
          <span>主回答 ${escapeHtml(testRun.primary_model || "—")}</span>
          <span>${Number(testRun.total_ms || 0)} ms</span>
          <a href="#/performance">查看測試 Flow</a>
        </div>
      </div>`
    : "";

  return `<div class="answer-head">
      <div class="answer-head-left">${icon("sparkles", 16)}
        <span class="answer-head-title">檢索結果</span>
      </div>
      <div class="answer-head-meta">
        ${statusBadge(status, statusLabel)}
        <span>${Number(payload.duration_ms || 0)} ms</span>
        ${modelChip}
      </div>
    </div>
    <div class="answer-body">
      <p class="answer-text">${escapeHtml(payload.answer || "目前沒有可顯示的回答。")}</p>
      ${
        payload.notice
          ? `<div class="answer-notice">${escapeHtml(payload.notice)}</div>`
          : ""
      }
      ${testRunBlock}
      ${matchedChips}
      ${citationSection}
    </div>`;
}

function renderAnswerError(error) {
  return `<div class="answer-head">
      <div class="answer-head-left">${icon("alert", 16)}
        <span class="answer-head-title">無法完成檢索</span>
      </div>
    </div>
    <div class="answer-body">
      ${notice({
        tone: "danger",
        title: "請求失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}
    </div>`;
}

function renderHistory(entries) {
  if (!entries.length) {
    return `<div class="history-empty">尚無提問紀錄。送出第一個問題後會保存在此瀏覽器。</div>`;
  }
  return entries
    .map((entry, index) => {
      const citations = Array.isArray(entry.payload?.citations)
        ? entry.payload.citations.length
        : 0;
      const judgments = Array.isArray(entry.payload?.judgments)
        ? entry.payload.judgments.length
        : 0;
      const lawSources = Array.isArray(entry.payload?.law_sources)
        ? entry.payload.law_sources.length
        : 0;
      const sources = citations + judgments + lawSources;
      return `<button class="history-item" type="button" data-history-index="${index}">
        <span class="history-question">${escapeHtml(entry.title || "未命名提問")}</span>
        <span class="history-meta">
          <span>${escapeHtml(formatRelativeTime(entry.created_at))}</span>
          <span>·</span>
          <span>${sources ? `${sources} 筆來源` : "無引用"}</span>
        </span>
      </button>`;
    })
    .join("");
}

export async function render(root) {
  let disposed = false;
  let historyEntries = [];
  let lastQuestion = "";
  let testMode = false;
  let testModels = { embedding: [], llm: [] };

  root.innerHTML = `<section class="page rag-page">
    <header class="rag-hero">
      <span class="eyebrow">JUDGMENT · LEGAL RAG</span>
      <h1 class="rag-title">讓每一個答案，都能回到法規與判決</h1>
      <p class="rag-lead">以金融法規的現行條文與判決片段為檢索基礎。
        先從 Qdrant 檢索相似判決，再由 LLM 依檢索片段生成回答；若索引或模型尚未就緒，會降級為只顯示可驗證的檢索結果。</p>
      <div id="rag-mode-notice">${notice({
        tone: "info",
        title: "RAG 服務狀態檢查中",
        text: "正在確認 Qdrant、Embedding 與 LLM 狀態；所有回答都會標示可回溯的來源。",
      })}</div>
      <div id="rag-test-mode"></div>
      <form class="ask-card" id="rag-form" autocomplete="off">
        <label class="sr-only" for="rag-question">輸入法律問題</label>
        <textarea class="ask-input" id="rag-question" name="question" rows="3"
          maxlength="500" placeholder="例如：金融消費者保護法如何處理金融消費爭議？"
          aria-describedby="rag-input-help"></textarea>
        <div class="ask-footer">
          <div class="ask-hints" id="rag-input-help">
            <span><kbd>Enter</kbd> 送出</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> 換行</span>
            <span>最多 500 字 · 快速模式約 2–10 秒</span>
          </div>
          <button class="btn btn-primary btn-lg ask-submit" type="submit" id="rag-submit">
            ${icon("sparkles", 16)}<span>開始檢索</span>
          </button>
        </div>
      </form>
      <div class="example-chips" id="example-chips" aria-label="範例問題">
        ${EXAMPLES.map(
          (question) =>
            `<button class="example-chip" type="button" data-question="${escapeHtml(
              question,
            )}">${escapeHtml(question)}</button>`,
        ).join("")}
      </div>
    </header>

    <div class="rag-grid">
      <section class="card answer-card" id="answer-card" aria-live="polite">
        ${answerPlaceholder()}
      </section>

      <aside class="rag-side">
        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${icon("database", 14)}資料現況</span>
            <span id="rag-stats-mode" class="badge badge-neutral badge-mono">讀取中</span>
          </div>
          <div class="side-card-body" id="rag-stats">
            <div class="skeleton skeleton-line" style="width:88%"></div>
            <div class="skeleton skeleton-line" style="width:64%"></div>
            <div class="skeleton skeleton-line" style="width:74%"></div>
          </div>
          <div class="side-card-foot">
            PostgreSQL 判決文件、Qdrant 向量索引與 Ollama 模型狀態皆為即時檢查；未就緒時會明確降級。
          </div>
        </section>

        <section class="card">
          <div class="side-card-head">
            <span class="side-card-title">${icon("history", 14)}最近提問</span>
            <button class="btn btn-ghost btn-sm" type="button" id="rag-clear-history">清除</button>
          </div>
          <div class="history-list" id="rag-history">
            <div class="history-empty">讀取本機紀錄中…</div>
          </div>
          <div class="side-card-foot" id="rag-storage-note">
            提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器。
          </div>
        </section>
      </aside>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;

  const form = root.querySelector("#rag-form");
  const input = root.querySelector("#rag-question");
  const submit = root.querySelector("#rag-submit");
  const answerCard = root.querySelector("#answer-card");
  const statsBox = root.querySelector("#rag-stats");
  const statsMode = root.querySelector("#rag-stats-mode");
  const historyBox = root.querySelector("#rag-history");
  const storageNote = root.querySelector("#rag-storage-note");
  const clearButton = root.querySelector("#rag-clear-history");
  const testModeBox = root.querySelector("#rag-test-mode");
  const testFlowBox = root.querySelector("#rag-test-flow");
  const judgmentDialog = root.querySelector("#rag-judgment-dialog");
  const lawDialog = root.querySelector("#rag-law-dialog");
  const syncDialogScrollLock = () => {
    document.documentElement.classList.toggle(
      "dialog-open",
      Boolean(root.querySelector("dialog[open]")),
    );
  };
  judgmentDialog?.addEventListener("close", syncDialogScrollLock);
  lawDialog?.addEventListener("close", syncDialogScrollLock);
  let flowPollTimer = null;
  let activeTestFlow = null;

  const resizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
  };

  const refreshHistory = async () => {
    try {
      historyEntries = await listHistory({ limit: 6 });
      if (disposed) return;
      historyBox.innerHTML = renderHistory(historyEntries);
      storageNote.textContent =
        storageMode() === "indexeddb"
          ? "提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器。"
          : "瀏覽器儲存不可用，提問紀錄只保留在本次工作階段。";
    } catch (error) {
      if (disposed) return;
      historyBox.innerHTML = `<div class="history-empty">無法讀取本機紀錄。</div>`;
    }
  };

  const loadStats = async () => {
    try {
      const status = await api.status();
      if (disposed) return;
      const data = status.data || {};
      const services = new Map((status.services || []).map((item) => [item.id, item]));
      const qdrant = services.get("qdrant");
      const embedding = services.get("embedding");
      const rag = services.get("rag");
      const llm = services.get("llm");
      const indexed = Number(data.judgment_indexed_count || 0);
      const totalJudgments = Number(data.judgment_count || 0);
      const coverage = totalJudgments
        ? ((indexed / totalJudgments) * 100).toFixed(1)
        : "0.0";
      const points =
        data.judgment_vector_points === null ||
        data.judgment_vector_points === undefined
          ? "—"
          : formatNumber(data.judgment_vector_points);

      statsBox.innerHTML = `<div class="mini-stats">
          <div class="mini-stat">
            <div class="mini-stat-value">${formatNumber(totalJudgments)}</div>
            <div class="mini-stat-label">判決</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${formatNumber(indexed)}</div>
            <div class="mini-stat-label">已索引</div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-value">${coverage}%</div>
            <div class="mini-stat-label">索引覆蓋</div>
          </div>
        </div>
        <div class="side-status-list">
          <div class="side-status-row">
            <span>${icon("cube", 13)}Qdrant 向量索引</span>
            ${statusBadge(qdrant?.status, qdrant?.status === "not_configured" ? "未設定" : undefined)}
          </div>
          <div class="side-status-row">
            <span>${icon("layers", 13)}Embedding（${escapeHtml(
              data.judgment_vector_model || "—",
            )}）</span>
            ${statusBadge(
              embedding?.status,
              embedding?.status === "not_configured" ? "未設定" : undefined,
            )}
          </div>
          <div class="side-status-row">
            <span>${icon("brain", 13)}RAG 回答管線</span>
            ${statusBadge(rag?.status, rag?.status === "not_configured" ? "未設定" : undefined)}
          </div>
          <div class="side-status-row">
            <span>${icon("sparkles", 13)}LLM 模型</span>
            ${statusBadge(llm?.status, llm?.status === "not_configured" ? "未設定" : undefined)}
          </div>
        </div>
        <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
          Collection：${escapeHtml(data.judgment_vector_collection || "—")} ·
          ${points} points · 剩餘 ${formatNumber(
            data.judgment_index_remaining,
          )} 筆待索引
        </div>`;

      const heroNotice = root.querySelector("#rag-mode-notice");
      if (heroNotice) {
        if (rag?.status === "operational") {
          heroNotice.innerHTML = notice({
            tone: "ok",
            title: "檢索與回答就緒",
            text: `Qdrant、Embedding 與 LLM 均可使用；目前索引涵蓋 ${formatNumber(
              indexed,
            )} / ${formatNumber(totalJudgments)} 筆判決。回答不是法律意見。`,
          });
        } else if (rag?.status === "degraded") {
          heroNotice.innerHTML = notice({
            tone: "warn",
            title: "部分 AI 元件未就緒",
            text: escapeHtml(rag.detail || "RAG 會降級為只顯示檢索結果。"),
          });
        } else {
          heroNotice.innerHTML = notice({
            tone: "info",
            title: "向量索引尚未就緒 · 不是法律意見",
            text: escapeHtml(
              rag?.detail ||
                "設定 QDRANT_URL、EMBEDDING_URL 與 LLM_URL 並執行 judgment-index-vectors 後即可啟用判決檢索。",
            ),
          });
        }
      }

      statsMode.className = `badge ${
        rag?.status === "operational"
          ? "badge-ok"
          : rag?.status === "not_configured"
            ? "badge-neutral"
            : "badge-warn"
      } badge-mono`;
      statsMode.textContent =
        rag?.status === "operational"
          ? "RAG 就緒"
          : rag?.status === "not_configured"
            ? "未設定"
            : "降級";
    } catch (error) {
      if (disposed) return;
      statsBox.innerHTML = `<p class="muted" style="font-size:11px">目前無法取得服務狀態。</p>`;
      statsMode.className = "badge badge-danger badge-mono";
      statsMode.textContent = "離線";
    }
  };

  const paintTestMode = () => {
    if (!testModeBox) return;
    if (!testMode) {
      testModeBox.innerHTML = "";
      return;
    }
    const embedding = Array.isArray(testModels.embedding)
      ? testModels.embedding.length
      : 0;
    const llm = Array.isArray(testModels.llm) ? testModels.llm.length : 0;
    testModeBox.innerHTML = notice({
      tone: "warn",
      title: "測試模式已開啟",
      text: `每次提問會依序執行 ${embedding} 個 embedding 與 ${llm} 個 LLM 模型，且不設逾時。測試 Flow 會在頁面下方即時顯示，也可到 <a href="#/performance">效能報表</a> 查看歷史。`,
    });
  };

  const loadTestMode = async () => {
    try {
      const state = await api.testMode();
      if (disposed) return;
      testMode = Boolean(state.enabled);
      testModels = state.models || { embedding: [], llm: [] };
      paintTestMode();
    } catch (error) {
      if (disposed) return;
      testMode = false;
      paintTestMode();
    }
  };

  const onTestModeChange = (event) => {
    testMode = Boolean(event.detail?.enabled);
    testModels = event.detail?.models || { embedding: [], llm: [] };
    paintTestMode();
  };
  window.addEventListener("judgment:test-mode", onTestModeChange);

  const paintTestFlow = (run) => {
    if (!testFlowBox) return;
    activeTestFlow = run || null;
    testFlowBox.innerHTML = run
      ? renderTestFlowPanel(run, [], "", { showHistory: false })
      : "";
  };

  const stopFlowPoll = () => {
    if (flowPollTimer) {
      window.clearTimeout(flowPollTimer);
      flowPollTimer = null;
    }
  };

  const startFlowPoll = () => {
    stopFlowPoll();
    const poll = async () => {
      if (disposed) return;
      try {
        const data = await api.testRunCurrent();
        if (disposed) return;
        const run = data.run;
        if (run && run.status === "running") paintTestFlow(run);
      } catch (error) {
        /* keep the RAG request alive even if the test flow poll fails */
      }
      if (!disposed) {
        flowPollTimer = window.setTimeout(poll, 1500);
      }
    };
    poll();
  };

  const loadExactTestFlow = async (runId) => {
    if (!runId) {
      paintTestFlow(null);
      return;
    }
    try {
      const data = await api.testRun(runId);
      if (disposed) return;
      paintTestFlow(data.run || null);
    } catch (error) {
      if (!disposed) {
        toast("測試已完成，但無法載入測試 Flow。", "warn");
      }
    }
  };

  const loadCurrentTestFlow = async () => {
    if (!testMode) return;
    try {
      const data = await api.testRunCurrent();
      if (disposed) return;
      if (data.run?.status === "running") {
        paintTestFlow(data.run);
        startFlowPoll();
      }
    } catch (error) {
      /* the RAG page remains usable even if the test flow endpoint fails */
    }
  };

  let judgmentDialogSeq = 0;

  const judgmentDialogFrame = (title, body) => `<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">DB ORIGINAL JUDGMENT</div>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-parquet-judgment" aria-label="關閉">${icon("x", 14)}</button>
  </div>
  <div class="judgment-dialog-body">${body}</div>`;

  const renderParquetJudgment = (detail) => {
    const laws = (Array.isArray(detail.matched_laws) ? detail.matched_laws : [])
      .map((law) => `<span class="chip">${escapeHtml(law)}</span>`)
      .join("");
    const meta = [
      detail.court,
      detail.jdate,
      detail.title ? `案由：${detail.title}` : "",
      detail.full_text_length
        ? `${formatNumber(detail.full_text_length)} 字`
        : "",
      detail.citation_count
        ? `引用 ${formatNumber(detail.citation_count)} 筆`
        : "",
    ]
      .filter(Boolean)
      .map((value) => `<span>${escapeHtml(value)}</span>`)
      .join("");
    const generated = detail.parquet_generated_at
      ? `DB 儲存原文（原始 Parquet）· ${escapeHtml(
          String(detail.parquet_generated_at).replace("T", " ").slice(0, 19),
        )}`
      : "DB 儲存原文";
    const pdf = detail.pdf_url
      ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(
          detail.pdf_url,
        )}" target="_blank" rel="noopener noreferrer">${icon(
          "external",
          13,
        )}<span>司法院原判決 PDF</span></a>`
      : "";
    return judgmentDialogFrame(
      detail.jid || "判決全文",
      `<div class="judgment-dialog-meta">
        <span class="badge badge-info">${escapeHtml(
          detail.source === "parquet" ? "DB 儲存原文" : "PostgreSQL",
        )}</span>
        ${meta}
      </div>
      ${laws ? `<div class="chips" style="margin:8px 0 10px">${laws}</div>` : ""}
      <div class="judgment-dialog-source">${generated}</div>
      <pre class="judgment-dialog-text">${escapeHtml(
        detail.full_text || "此判決沒有全文。",
      )}</pre>
      <div class="judgment-dialog-actions">
        ${pdf}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-parquet-judgment">返回回答</button>
      </div>`,
    );
  };

  const openParquetJudgment = async (jid) => {
    if (!judgmentDialog || !jid) return;
    const seq = ++judgmentDialogSeq;
    if (!judgmentDialog.open) judgmentDialog.showModal();
    syncDialogScrollLock();
    judgmentDialog.innerHTML = judgmentDialogFrame(
      "讀取判決中…",
      `<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>正在從 DB 儲存原文讀取 ${escapeHtml(jid)}…</span>
      </div>`,
    );
    try {
      const detail = await api.judgmentDetail(jid, "parquet");
      if (disposed || seq !== judgmentDialogSeq) return;
      judgmentDialog.innerHTML = renderParquetJudgment(detail);
    } catch (error) {
      if (disposed || seq !== judgmentDialogSeq) return;
      judgmentDialog.innerHTML = judgmentDialogFrame(
        "無法讀取 DB 原文判決",
        `<div class="notice notice-danger">
          <div class="notice-body"><strong>讀取失敗</strong>
          <p>${escapeHtml(error.message || "找不到判決全文。")}</p>
          <p class="muted">請確認已執行 <span class="mono">uv run judgment-import-judgments --raw-only</span>，且原始 Parquet 存在。</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-parquet-judgment">關閉</button>
        </div>`,
      );
    }
  };

  let lawDialogSeq = 0;

  const lawDialogFrame = (title, body) => `<div class="judgment-dialog-head">
    <div>
      <div class="eyebrow">LOCAL PARQUET LAW</div>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <button class="judgment-dialog-close" type="button"
      data-action="close-law-source" aria-label="關閉">${icon("x", 14)}</button>
  </div>
  <div class="judgment-dialog-body">${body}</div>`;

  const renderLawSourceDetail = (detail) => {
    const articles = Array.isArray(detail.articles) ? detail.articles : [];
    const body = articles
      .map((article) => {
        const content = String(article.article_content || "").trim();
        if (!content) return "";
        if (article.article_type === "C") {
          return `<div class="law-chapter">${escapeHtml(content)}</div>`;
        }
        return `<article class="law-article">
          <div class="law-article-head">
            <span class="law-article-no">${escapeHtml(article.article_no || "條文")}</span>
          </div>
          <div class="law-article-text">${escapeHtml(content)}</div>
        </article>`;
      })
      .join("");
    const warnings = (Array.isArray(detail.warnings) ? detail.warnings : [])
      .map((warning) => escapeHtml(warning))
      .join("<br />");
    const sourceTypeLabel =
      detail.source_type === "order" ? "命令" : "法規";
    const articleSource =
      detail.meta?.articles_source === "parquet" ? "Parquet 條文" : "條文未提供";
    const snapshot = detail.meta?.snapshot || "";
    const meta = [
      detail.law_level,
      detail.law_category,
      detail.article_count ? `${formatNumber(detail.article_count)} 條` : "",
      detail.law_modified_date ? `異動 ${formatDate(detail.law_modified_date)}` : "",
    ]
      .filter(Boolean)
      .map((value) => `<span>${escapeHtml(value)}</span>`)
      .join("");
    const lawLink = detail.law_url
      ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(
          detail.law_url,
        )}" target="_blank" rel="noopener noreferrer">${icon(
          "external",
          13,
        )}<span>來源網站</span></a>`
      : "";
    const history = detail.law_histories
      ? `<details class="law-dialog-history">
          <summary>法規沿革</summary>
          <div>${escapeHtml(detail.law_histories)}</div>
        </details>`
      : "";
    return lawDialogFrame(
      detail.law_name || detail.law_key || "法規／命令",
      `<div class="judgment-dialog-meta">
        <span class="badge ${detail.source_type === "order" ? "badge-warn" : "badge-info"}">${escapeHtml(
          sourceTypeLabel,
        )}</span>
        ${meta}
      </div>
      <div class="judgment-dialog-source">${escapeHtml(
        [articleSource, snapshot].filter(Boolean).join(" · "),
      )}</div>
      ${warnings ? `<div class="law-dialog-warning">${warnings}</div>` : ""}
      ${history}
      <div class="law-dialog-articles">${
        body || `<div class="report-empty-inline">這個法規／命令目前沒有可顯示的條文。</div>`
      }</div>
      <div class="judgment-dialog-actions">
        ${lawLink}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">返回回答</button>
      </div>`,
    );
  };

  const openLawSource = async (lawKey, sourceType = "") => {
    if (!lawDialog || !lawKey) return;
    const seq = ++lawDialogSeq;
    if (!lawDialog.open) lawDialog.showModal();
    syncDialogScrollLock();
    lawDialog.innerHTML = lawDialogFrame(
      "讀取法規／命令中…",
      `<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>正在從本地 Parquet 讀取 ${escapeHtml(lawKey)} 的原始條文…</span>
      </div>`,
    );
    try {
      const detail = await api.lawDetail(lawKey, sourceType);
      if (disposed || seq !== lawDialogSeq) return;
      lawDialog.innerHTML = renderLawSourceDetail(detail);
    } catch (error) {
      if (disposed || seq !== lawDialogSeq) return;
      lawDialog.innerHTML = lawDialogFrame(
        "無法讀取法規／命令原文",
        `<div class="notice notice-danger">
          <div class="notice-body"><strong>讀取失敗</strong>
          <p>${escapeHtml(error.message || "找不到條文內容。")}</p>
          <p class="muted">請確認本地原始法規 Parquet 存在，且 PostgreSQL metadata 與其一致。</p>
          </div>
        </div>
        <div class="judgment-dialog-actions">
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="close-law-source">關閉</button>
        </div>`,
      );
    }
  };

  lawDialog?.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="close-law-source"]')) {
      lawDialog.close();
      return;
    }
    const rect = lawDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) lawDialog.close();
  });

  judgmentDialog?.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="close-parquet-judgment"]')) {
      judgmentDialog.close();
      return;
    }
    const rect = judgmentDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) judgmentDialog.close();
  });

  answerCard.addEventListener("click", (event) => {
    const target = event.target.closest(
      '[data-action="open-parquet-judgment"], [data-action="open-law-source"]',
    );
    if (!target) return;
    if (target.dataset.action === "open-law-source") {
      openLawSource(
        target.dataset.lawKey || "",
        target.dataset.sourceType || "",
      );
      return;
    }
    openParquetJudgment(target.dataset.jid || "");
  });

  answerCard.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest(
      '[data-action="open-parquet-judgment"], [data-action="open-law-source"]',
    );
    if (!target || target.closest("a, button")) return;
    event.preventDefault();
    if (target.dataset.action === "open-law-source") {
      openLawSource(
        target.dataset.lawKey || "",
        target.dataset.sourceType || "",
      );
      return;
    }
    openParquetJudgment(target.dataset.jid || "");
  });

  const runQuestion = async (question) => {
    const trimmed = question.trim();
    if (!trimmed) {
      toast("請先輸入問題。", "warn");
      input.focus();
      return;
    }
    lastQuestion = trimmed;
    input.value = trimmed;
    resizeInput();
    answerCard.innerHTML = answerLoading(trimmed, testMode);
    if (testMode) {
      paintTestFlow(null);
      startFlowPoll();
    } else {
      stopFlowPoll();
      paintTestFlow(null);
    }
    setBusy(submit, true, "檢索中…");
    try {
      const payload = await api.rag(trimmed, { testMode });
      if (disposed) return;
      stopFlowPoll();
      answerCard.innerHTML = renderAnswer(trimmed, payload);
      if (payload.test_run?.run_id) {
        await loadExactTestFlow(payload.test_run.run_id);
      } else {
        paintTestFlow(null);
      }
      const citations = Array.isArray(payload.citations) ? payload.citations : [];
      const judgments = Array.isArray(payload.judgments) ? payload.judgments : [];
      const sources = citations.length + judgments.length;
      await addHistory({
        kind: "rag",
        title: trimmed,
        detail: `${payload.status || "preview"} · ${sources} 筆來源`,
        payload: {
          question: trimmed,
          status: payload.status,
          citations: citations.map((item) => item.law_name),
          judgments: judgments.map((item) => item.jid),
        },
      });
      await refreshHistory();
    } catch (error) {
      stopFlowPoll();
      if (disposed) return;
      answerCard.innerHTML = renderAnswerError(error);
      toast(error.message || "檢索失敗。", "danger");
    } finally {
      stopFlowPoll();
      if (!disposed) setBusy(submit, false);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runQuestion(input.value);
  });

  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  root.querySelector("#example-chips").addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    input.value = button.dataset.question;
    resizeInput();
    form.requestSubmit();
  });

  historyBox.addEventListener("click", (event) => {
    const button = event.target.closest("[data-history-index]");
    if (!button) return;
    const entry = historyEntries[Number(button.dataset.historyIndex)];
    if (!entry) return;
    input.value = entry.title;
    resizeInput();
    runQuestion(entry.title);
  });

  clearButton.addEventListener("click", async () => {
    if (!historyEntries.length) {
      toast("目前沒有可清除的提問紀錄。", "info");
      return;
    }
    if (!window.confirm("確定清除這個瀏覽器的所有提問紀錄？")) return;
    await clearHistory();
    await refreshHistory();
    toast("已清除本機提問紀錄。", "ok");
  });

  resizeInput();
  await Promise.allSettled([loadStats(), refreshHistory(), loadTestMode()]);
  await loadCurrentTestFlow();

  return () => {
    disposed = true;
    stopFlowPoll();
    document.documentElement.classList.remove("dialog-open");
    window.removeEventListener("judgment:test-mode", onTestModeChange);
    if (lastQuestion) {
      // Keep the last question available for screen readers after navigation.
      answerCard.setAttribute("data-last-question", lastQuestion);
    }
  };
}
