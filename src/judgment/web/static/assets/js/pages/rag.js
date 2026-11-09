import { api } from "../api.js";
import {
  addHistory,
  clearHistory,
  deleteHistoryEntry,
  getSetting,
  listHistory,
  setSetting,
  storageMode,
  updateHistoryEntry,
} from "../store.js";
import { renderTestFlowPanel } from "./performance.js";
import {
  copyText,
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
    <h2 class="empty-title">答案只會來自檢索到的判決及法規片段</h2>
    <p class="empty-text">送出問題後，系統會先以 Qdrant 檢索判決，再由 LLM 依檢索片段生成回答並標示引用編號。
      若向量索引或 LLM 尚未就緒，會明確顯示降級狀態，不會憑空生成答案。</p>
  </div>`;
}

function emptyConversationMarkup() {
  return `<section class="card answer-card rag-empty-answer">${answerPlaceholder()}</section>`;
}

function turnMarkup(question, answerHtml) {
  return `<div class="rag-turn">
    <div class="rag-user-bubble">${escapeHtml(question)}</div>
    <section class="card rag-assistant-turn" data-rag-answer>${answerHtml}</section>
  </div>`;
}

function compactAnswerPayload(payload) {
  return {
    status: payload.status,
    answer: payload.answer,
    answer_source: payload.answer_source,
    notice: payload.notice,
    citations: Array.isArray(payload.citations) ? payload.citations : [],
    judgments: Array.isArray(payload.judgments) ? payload.judgments : [],
    law_sources: Array.isArray(payload.law_sources) ? payload.law_sources : [],
    matched_terms: Array.isArray(payload.matched_terms)
      ? payload.matched_terms
      : [],
    law_answer: payload.law_answer,
    law_framework: payload.law_framework,
    llm_model: payload.llm_model,
    embedding_model: payload.embedding_model,
    duration_ms: payload.duration_ms,
    show_sources: payload.show_sources,
    test_run: payload.test_run || null,
    partial: false,
    streaming: false,
  };
}

const PROCESS_LABELS = {
  "http.request": "FastAPI 接收請求",
  "http.response": "回傳結果給前端",
  "rag.answer_question": "RAG 主流程",
  "rag.coverage": "PostgreSQL 索引覆蓋檢查",
  "rag.law_retrieval": "法規／命令檢索",
  "rag.law_lookup": "比對問題中的法規／命令名稱",
  "rag.law_content": "讀取法規／命令條文",
  "rag.qdrant_precheck": "Qdrant collection 檢查",
  "rag.search": "RAG 檢索",
  "rag.embed_query": "Ollama embedding 查詢向量",
  "rag.qdrant_search": "Qdrant 向量搜尋",
  "rag.fetch_documents": "PostgreSQL 讀取判決",
  "rag.postgres_fetch": "PostgreSQL 判決查詢",
  "rag.build_citations": "整理引用與判決片段",
  "rag.extract_excerpt": "擷取相關片段",
  "rag.llm": "LLM 回答生成",
  "rag.llm_request": "Ollama LLM 生成",
  "rag.validate_citations": "驗證引用編號",
  "rag.test_mode": "測試模式多模型流程",
  "rag.preview_fallback": "法規預覽降級",
};

function processLabel(segment) {
  const name = String(segment?.name || "");
  const params = segment?.params || {};
  const model = String(params.model || params.embedding_model || "").trim();
  if (name === "rag.llm_request") return `Ollama run ${model || "LLM"}`;
  if (name === "rag.llm") return `LLM 回答生成${model ? ` · ${model}` : ""}`;
  if (name === "rag.embed_query") {
    return `Ollama embedding 查詢向量${model ? ` · ${model}` : ""}`;
  }
  return PROCESS_LABELS[name] || name || "backend step";
}

function processDetail(segment) {
  return [segment?.module, segment?.function, segment?.name]
    .filter(Boolean)
    .join(" · ");
}

function formatProcessMs(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${formatNumber(Math.max(0, Math.round(number)))} ms`;
}

function setProcessExpanded(panel, expanded) {
  if (!panel) return;
  panel.classList.toggle("is-open", expanded);
  const body = panel.querySelector("#rag-process-body");
  const toggle = panel.querySelector(".rag-process-toggle");
  if (body) body.hidden = !expanded;
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.title = expanded ? "收合後端處理流程" : "展開後端處理流程";
  }
}

function processPanelMarkup() {
  return `<div class="rag-process is-open" id="rag-process">
    <div class="rag-process-control">
      <button type="button" class="rag-process-toggle" id="rag-process-toggle"
        aria-expanded="true" aria-controls="rag-process-body" title="收合後端處理流程">
        <span class="rag-process-toggle-label-collapsed">展開後端處理流程</span>
        <span class="rag-process-toggle-label-expanded">收合後端處理流程</span>
        ${icon("chevronDown", 11)}
      </button>
      <span class="rag-process-summary" id="rag-process-summary">執行中…</span>
    </div>
    <div class="rag-process-body" id="rag-process-body">
      <div class="rag-process-list" id="rag-process-list">
        <div class="rag-process-item is-running" data-process-key="frontend" style="--depth:0">
          <span class="rag-process-dot"></span>
          <span class="rag-process-label">frontend HTTP request → FastAPI</span>
          <span class="rag-process-meta">送出</span>
        </div>
      </div>
      <div class="rag-process-hint">顯示法規結果時會先收合；點擊按鈕可展開完整流程。</div>
    </div>
  </div>`;
}

function createProcessController(answerCard) {
  const panel = answerCard.querySelector("#rag-process");
  const list = panel?.querySelector("#rag-process-list");
  const summary = panel?.querySelector("#rag-process-summary");
  const started = performance.now();
  const items = new Map();

  const updateText = (element, selector, text) => {
    const target = element.querySelector(selector);
    if (target) target.textContent = text;
  };

  const renderFinishedMeta = (item) => {
    if (item.failed) {
      updateText(item.element, ".rag-process-meta", "失敗");
      return;
    }
    if (item.hasChildren) {
      updateText(item.element, ".rag-process-meta", "");
      return;
    }
    updateText(
      item.element,
      ".rag-process-meta",
      formatProcessMs(item.durationMs),
    );
  };

  const markAncestors = (depth) => {
    let target = depth - 1;
    const previous = [...items.values()].reverse();
    for (const item of previous) {
      if (target < 0) break;
      if (item.depth <= target) {
        if (!item.hasChildren) {
          item.hasChildren = true;
          item.element.dataset.hasChildren = "true";
          if (item.finished) renderFinishedMeta(item);
        }
        target = item.depth - 1;
      }
    }
  };

  const ensureItem = (segment) => {
    if (!list) return null;
    const key = String(segment?.seq ?? `step-${items.size + 1}`);
    let item = items.get(key);
    if (!item) {
      const depth = Math.max(
        0,
        Math.min(6, Number(segment?.depth) || 0),
      );
      markAncestors(depth);
      const element = document.createElement("div");
      element.className = "rag-process-item is-running";
      element.dataset.processKey = key;
      element.style.setProperty("--depth", String(depth));
      element.innerHTML = `<span class="rag-process-dot"></span>
        <span class="rag-process-label"></span>
        <span class="rag-process-meta">執行中…</span>`;
      list.appendChild(element);
      item = {
        element,
        depth,
        hasChildren: false,
        finished: false,
        failed: false,
        durationMs: 0,
      };
      items.set(key, item);
    }
    updateText(item.element, ".rag-process-label", processLabel(segment));
    item.element.title = processDetail(segment);
    return item;
  };

  const step = (payload) => {
    const segment = payload?.segment;
    if (!segment) return;
    const item = ensureItem(segment);
    if (!item) return;
    if (payload.type === "segment_start") {
      item.element.classList.add("is-running");
      updateText(item.element, ".rag-process-meta", "執行中…");
      return;
    }
    if (payload.type === "segment_end") {
      const failed = segment.status === "error";
      item.element.classList.remove("is-running");
      item.element.classList.toggle("is-error", failed);
      item.finished = true;
      item.failed = failed;
      item.durationMs = Number(segment.duration_ms) || 0;
      renderFinishedMeta(item);
      item.element.title = [
        processDetail(segment),
        failed ? segment.error || "" : "",
      ]
        .filter(Boolean)
        .join(" · ");
    }
  };

  const finish = (ok = true) => {
    if (!panel) return "";
    panel.querySelectorAll(".rag-process-item.is-running").forEach((element) => {
      element.classList.remove("is-running");
      const hasChildren = element.dataset.hasChildren === "true";
      updateText(
        element,
        ".rag-process-meta",
        hasChildren ? "" : ok ? "完成" : "中斷",
      );
    });
    const stepCount = list?.children.length || items.size;
    const elapsed = formatProcessMs(Math.max(0, performance.now() - started));
    if (summary) {
      summary.textContent = ok
        ? `完成 · ${stepCount} 步 · ${elapsed}`
        : `失敗 · ${stepCount} 步`;
    }
    panel.classList.add("is-complete");
    setProcessExpanded(panel, false);
    return panel.outerHTML;
  };

  return { step, finish, collapse: () => setProcessExpanded(panel, false) };
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
      ${testMode ? "" : processPanelMarkup()}
    </div>
    <div class="answer-body">
      <p class="answer-text">${detail}「${escapeHtml(question)}」</p>
      <div class="skeleton skeleton-line" style="margin-top:22px;width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>`;
}

function lawArticleJumpKey(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/^第/, "")
    .replace(/條$/, "")
    .replace(/之/g, "-");
}

function lawChipMarkup(lawName, { lawKey = "", sourceType = "", label = "" } = {}) {
  const name = String(lawName || "").trim();
  if (!name) return "";
  return `<button class="chip chip-action" type="button"
    data-action="open-law-source"
    data-law-key="${escapeHtml(lawKey || name)}"
    data-source-type="${escapeHtml(sourceType || "")}"
    title="點擊開啟 ${escapeHtml(name)} 的完整條文"
    aria-label="開啟 ${escapeHtml(name)} 的完整條文">${escapeHtml(
      label || name,
    )}</button>`;
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
    .map((law) => lawChipMarkup(law))
    .join("");
  const headAttributes = judgment.jid
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
    <div class="citation-body">
      <div class="citation-head"${headAttributes}>
        <h4 class="citation-name">${escapeHtml(judgment.jid || "未知案號")}</h4>
        <div class="citation-meta">${meta || "<span>判決 metadata</span>"}</div>
        ${
          judgment.title
            ? `<div class="citation-meta"><span>案由：${escapeHtml(judgment.title)}</span></div>`
            : ""
        }
      </div>
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
  const citationLawKey = citation.law_key || citation.law_name || "";
  const bodyAttributes = citationLawKey
    ? ` data-action="open-law-source"
        data-law-key="${escapeHtml(citationLawKey)}"
        data-source-type=""
        role="button"
        tabindex="0"
        title="點擊開啟法規／命令原始條文"
        aria-label="開啟 ${escapeHtml(citation.law_name || "法規")} 原始條文"`
    : "";
  return `<article class="citation">
    <span class="citation-index">${String(citation.index ?? index + 1).padStart(2, "0")}</span>
    <div class="citation-body"${bodyAttributes}>
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
  const lawKey = source.law_key || "";
  const sourceType = source.source_type || "";
  const articles = (Array.isArray(source.articles) ? source.articles : [])
    .map((article) => {
      const articleNo = String(article.article_no || "");
      const articleAttributes =
        lawKey && articleNo
          ? ` data-action="open-law-source"
        data-law-key="${escapeHtml(lawKey)}"
        data-source-type="${escapeHtml(sourceType)}"
        data-article-no="${escapeHtml(articleNo)}"
        role="button"
        tabindex="0"
        title="點選查看 ${escapeHtml(articleNo)} 的完整內容"
        aria-label="開啟 ${escapeHtml(source.law_name || "法規")} ${escapeHtml(
          articleNo,
        )} 的完整條文"`
          : "";
      return `<div class="law-source-article"${articleAttributes}>
        <span class="law-source-article-no">${escapeHtml(article.article_no || "條文")}</span>
        <p class="law-source-article-text">${escapeHtml(article.article_content || "")}</p>
      </div>`;
    })
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

function compactArticleText(value, maxLength = 150) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function lawAnswerMarkup(lawSources, fallback) {
  if (!Array.isArray(lawSources) || !lawSources.length) {
    return `<p class="answer-text">${escapeHtml(fallback)}</p>`;
  }
  return `<div class="law-answer-list">${lawSources
    .map((source) => {
      const lawKey = source.law_key || "";
      const sourceType = source.source_type || "";
      const lawName = source.law_name || "未命名法規";
      const sourceLabel =
        source.source_label || (sourceType === "order" ? "命令" : "法規");
      const articleCount = Number(source.article_count || 0);
      const index =
        source.index != null
          ? `<span class="law-answer-index">[${escapeHtml(String(source.index))}]</span>`
          : "";
      const laws = lawKey
        ? `<button class="law-answer-law" type="button"
            data-action="open-law-source"
            data-law-key="${escapeHtml(lawKey)}"
            data-source-type="${escapeHtml(sourceType)}"
            title="點擊開啟 ${escapeHtml(lawName)} 的完整條文"
            aria-label="開啟 ${escapeHtml(lawName)} 的完整條文">${escapeHtml(lawName)}</button>`
        : `<strong>${escapeHtml(lawName)}</strong>`;
      const articles = Array.isArray(source.articles) ? source.articles : [];
      const articleList = articles.length
        ? `<div class="law-answer-articles-label">相關條文</div>
          <div class="law-answer-articles">${articles
            .map((article) => {
              const articleNo = String(article.article_no || "").trim();
              const articleText = compactArticleText(article.article_content);
              if (!lawKey || !articleNo) {
                return `<div class="law-answer-article is-static">
                  <span class="law-answer-article-no">${escapeHtml(articleNo || "條文")}</span>
                  <span class="law-answer-article-text">${escapeHtml(articleText)}</span>
                </div>`;
              }
              return `<button class="law-answer-article" type="button"
                data-action="open-law-source"
                data-law-key="${escapeHtml(lawKey)}"
                data-source-type="${escapeHtml(sourceType)}"
                data-article-no="${escapeHtml(articleNo)}"
                title="點擊查看 ${escapeHtml(articleNo)} 的完整內容"
                aria-label="開啟 ${escapeHtml(lawName)} ${escapeHtml(articleNo)} 的完整條文">
                <span class="law-answer-article-no">${escapeHtml(articleNo)}</span>
                <span class="law-answer-article-text">${escapeHtml(articleText)}</span>
              </button>`;
            })
            .join("")}</div>`
        : "";
      return `<div class="law-answer-source">
        <div class="law-answer-source-head">
          ${laws}
          <span class="law-answer-source-meta">（${escapeHtml(sourceLabel)}，${formatNumber(
            articleCount,
          )} 條）</span>
          ${index}
        </div>
        ${articleList}
      </div>`;
    })
    .join("")}</div>`;
}

function matchedChipsMarkup(matched, lawSources) {
  if (!Array.isArray(matched) || !matched.length) return "";
  const sourcesByName = new Map(
    (Array.isArray(lawSources) ? lawSources : []).map((source) => [
      String(source.law_name || ""),
      source,
    ]),
  );
  return `<div class="answer-section-label" style="margin-top:18px">
      <span>命中詞彙</span>
    </div>
    <div class="chips">${matched
      .map((term) => {
        const source = sourcesByName.get(String(term));
        if (!source?.law_key) {
          return `<span class="chip">${escapeHtml(term)}</span>`;
        }
        return lawChipMarkup(term, {
          lawKey: source.law_key,
          sourceType: source.source_type || "",
        });
      })
      .join("")}</div>`;
}

function renderAnswerBody(payload) {
  const citations = Array.isArray(payload.citations) ? payload.citations : [];
  const judgments = Array.isArray(payload.judgments) ? payload.judgments : [];
  const lawSources = Array.isArray(payload.law_sources) ? payload.law_sources : [];
  const matched = Array.isArray(payload.matched_terms) ? payload.matched_terms : [];
  const status = payload.status || "preview";
  const partial = Boolean(payload.partial);
  const streaming = Boolean(payload.streaming);
  const showSources = Boolean(payload.show_sources) || !partial;

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
  let citationSection = showSources
    ? judgmentSection + lawSection + metadataSection
    : "";
  if (!citationSection && !partial) {
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

  const matchedChips = matchedChipsMarkup(matched, lawSources);

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
  const lawAnswer = String(payload.law_answer || "").trim();
  const framework = payload.law_framework || null;
  const frameworkRows = Array.isArray(framework?.rows) ? framework.rows : [];
  const frameworkSources = Array.isArray(framework?.sources)
    ? framework.sources
    : [];
  const hasFramework = frameworkRows.length > 0;
  const showLawAnswer = Boolean(lawAnswer) && !structuredAnswer && !hasFramework;
  const llmBlockTitle =
    streaming || payload.answer_source === "llm"
      ? "LLM 綜合回答"
      : "檢索結果摘要";
  const frameworkBlock = hasFramework
    ? `<div class="answer-block law-framework-block">
        <div class="answer-block-head">
          <span>${escapeHtml(framework.title || "相關法規的責任架構")}</span>
          <span>${frameworkRows.length} 條</span>
        </div>
        <div class="table-wrap law-framework-table-wrap">
          <table class="data-table is-compact law-framework-table">
            <thead>
              <tr><th scope="col">法規</th><th scope="col">條文</th><th scope="col">規範重點</th></tr>
            </thead>
            <tbody>
              ${frameworkRows
                .map(
                  (row) => `<tr>
                    <td>${escapeHtml(row.law_name || "—")}</td>
                    <td class="cell-number">${escapeHtml(row.article_no || "—")}</td>
                    <td>${escapeHtml(row.focus || "—")}</td>
                  </tr>`,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        ${
          frameworkSources.length
            ? `<div class="law-framework-sources">
                <span>法規來源</span>
                ${frameworkSources
                  .map((source) => {
                    const name = String(
                      source?.law_name || source || "",
                    ).trim();
                    const index =
                      source && source.index !== null && source.index !== undefined
                        ? ` [${escapeHtml(source.index)}]`
                        : "";
                    return lawChipMarkup(name, {
                      label: `${name}${index}`,
                    });
                  })
                  .join("")}
              </div>`
            : ""
        }
      </div>`
    : "";
  const modelChip =
    payload.answer_source === "llm" && llmModel
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
  const blockMeta = streaming
    ? `${llmModel || "LLM"} · 生成中`
    : modelChip
      ? llmModel || "structured"
      : "retrieval";
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

  const answerText = String(payload.answer || "").trim();
  const answerContent =
    answerText ||
    (streaming
      ? "正在生成回答…"
      : partial
        ? "正在檢索判決並生成 LLM 回答…"
        : "目前沒有可顯示的回答。");
  const streamingAttribute = streaming ? " data-partial-answer" : "";
  const streamingClass = streaming ? " is-streaming" : "";

  return `${frameworkBlock}
      ${
        showLawAnswer
          ? `<div class="answer-block law-answer-block">
              <div class="answer-block-head">
                <span>法規／命令檢索結果</span>
                <span>${partial && !showSources ? "法規資料庫" : `${lawSources.length} 筆來源`}</span>
              </div>
              <div class="law-answer-content">${lawAnswerMarkup(
                lawSources,
                lawAnswer,
              )}</div>
            </div>`
          : ""
      }
      <div class="answer-block">
        ${
          showLawAnswer || hasFramework
            ? `<div class="answer-block-head">
                <span>${escapeHtml(llmBlockTitle)}</span>
                <span>${escapeHtml(blockMeta)}</span>
              </div>`
            : ""
        }
        <p class="answer-text${streamingClass}"${streamingAttribute}>${escapeHtml(
          answerContent,
        )}</p>
      </div>
      ${
        payload.notice
          ? `<div class="answer-notice">${escapeHtml(payload.notice)}</div>`
          : ""
      }
      ${testRunBlock}
      ${matchedChips}
      ${citationSection}`;
}

function renderAnswer(question, payload, processHtml = "") {
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
  const modelChip =
    payload.answer_source === "llm" && llmModel
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
  return `<div class="answer-head">
      <div class="answer-head-left">${icon("sparkles", 16)}
        <span class="answer-head-title">檢索結果</span>
      </div>
      <div class="answer-head-meta">
        ${statusBadge(status, statusLabel)}
        <span>${Number(payload.duration_ms || 0)} ms</span>
        ${modelChip}
      </div>
      ${processHtml}
    </div>
    <div class="answer-body">${renderAnswerBody(payload)}</div>`;
}

function renderAnswerError(error, processHtml = "") {
  return `<div class="answer-head">
      <div class="answer-head-left">${icon("alert", 16)}
        <span class="answer-head-title">無法完成檢索</span>
      </div>
      ${processHtml}
    </div>
    <div class="answer-body">
      ${notice({
        tone: "danger",
        title: "請求失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}
    </div>`;
}

function historySourceCount(entry) {
  const turns = Array.isArray(entry.turns) ? entry.turns : [];
  const payload = turns.length
    ? turns[turns.length - 1].payload || {}
    : entry.payload || {};
  const citations = Array.isArray(payload.citations)
    ? payload.citations.length
    : 0;
  const judgments = Array.isArray(payload.judgments)
    ? payload.judgments.length
    : 0;
  const lawSources = Array.isArray(payload.law_sources)
    ? payload.law_sources.length
    : 0;
  return citations + judgments + lawSources;
}

function renderHistoryItem(
  entry,
  projectsById,
  index,
  activeConversationId = null,
) {
  const id = entry.id ?? index;
  const sources = historySourceCount(entry);
  const project = projectsById.get(String(entry.project_id || ""));
  const turns = Array.isArray(entry.turns) ? entry.turns : [];
  const updatedAt = entry.updated_at || entry.created_at;
  const isActive =
    activeConversationId !== null &&
    activeConversationId !== undefined &&
    String(activeConversationId) === String(id);
  return `<div class="rag-history-item${entry.pinned ? " is-pinned" : ""}${isActive ? " is-active" : ""}">
    <button class="rag-history-open" type="button" data-history-open data-history-id="${escapeHtml(String(id))}">
      <span class="history-question">${escapeHtml(entry.title || "未命名提問")}</span>
      <span class="history-meta">
        <span>${escapeHtml(formatRelativeTime(updatedAt))}</span>
        ${project ? `<span>· ${escapeHtml(project.name)}</span>` : ""}
        <span>· ${sources ? `${sources} 筆來源` : "無引用"}</span>
        ${turns.length > 1 ? `<span>· ${turns.length} 輪</span>` : ""}
      </span>
    </button>
    <div class="rag-history-actions">
      <button class="rag-history-pin${entry.pinned ? " is-pinned" : ""}" type="button"
        data-rag-action="toggle-pin" data-history-id="${escapeHtml(String(id))}"
        title="${entry.pinned ? "取消釘選" : "釘選此項目"}"
        aria-label="${entry.pinned ? "取消釘選" : "釘選此項目"}"
        aria-pressed="${entry.pinned ? "true" : "false"}">${icon("pin", 14)}</button>
      <button class="rag-history-more" type="button"
        data-rag-action="open-history-menu" data-history-id="${escapeHtml(String(id))}"
        title="更多操作" aria-label="更多操作" aria-haspopup="menu" aria-expanded="false">${icon(
          "more",
          14,
        )}</button>
    </div>
  </div>`;
}

function renderProjects(projects, historyEntries, activeProjectId) {
  const counts = new Map();
  for (const entry of historyEntries) {
    const key = String(entry.project_id || "");
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  }
  const rows = [
    `<button class="rag-project${!activeProjectId ? " is-active" : ""}" type="button" data-rag-action="select-project" data-project-id="" aria-pressed="${!activeProjectId ? "true" : "false"}">
      <span class="rag-project-name">${icon("grid", 13)}<span>全部</span></span>
      <span class="rag-project-count">${historyEntries.length}</span>
    </button>`,
  ];
  for (const project of projects) {
    const id = String(project.id);
    const count = counts.get(id) || 0;
    rows.push(`<button class="rag-project${activeProjectId === id ? " is-active" : ""}" type="button" data-rag-action="select-project" data-project-id="${escapeHtml(id)}" aria-pressed="${activeProjectId === id ? "true" : "false"}">
      <span class="rag-project-name">${icon("folder", 13)}<span>${escapeHtml(project.name)}</span></span>
      <span class="rag-project-count">${count}</span>
    </button>`);
  }
  if (!projects.length) {
    rows.push(`<div class="rag-library-empty">尚未建立專案。</div>`);
  }
  rows.push(`<div class="rag-project-add-wrap">
    <button class="rag-project-add" type="button" data-rag-action="show-project-form">${icon("plus", 13)}<span>建立專案</span></button>
    <form class="rag-project-form" data-rag-form="project" hidden>
      <input class="input" type="text" name="project_name" maxlength="60" placeholder="專案名稱" aria-label="專案名稱" autocomplete="off" />
      <div class="rag-project-form-actions">
        <button class="btn btn-primary btn-sm" type="submit">建立</button>
        <button class="btn btn-ghost btn-sm" type="button" data-rag-action="cancel-project">取消</button>
      </div>
    </form>
  </div>`);
  return rows.join("");
}

export async function render(root) {
  let disposed = false;
  let historyEntries = [];
  let historyLoaded = false;
  let projects = [];
  let projectsLoaded = false;
  let activeProjectId = "";
  let recentLimit = 8;
  let lastQuestion = "";
  let requestSeq = 0;
  let currentConversationId = null;
  let conversationTurns = [];
  let conversationActive = false;
  let testMode = false;
  let testModels = { embedding: [], llm: [] };

  root.innerHTML = `<section class="page rag-page">
    <div class="rag-layout">
      <aside class="rag-library" aria-label="對話庫">
        <button class="rag-new-chat" type="button" data-rag-action="new-chat">
          <span class="rag-new-chat-mark">${icon("plus", 16)}</span>
          <span class="rag-new-chat-copy"><strong>新對話</strong><small>開始新的法律檢索</small></span>
        </button>
        <div class="rag-library-context" id="rag-library-context" hidden></div>
        <section class="rag-library-section" data-rag-section="pinned">
          <button class="rag-library-head" type="button" data-rag-toggle="pinned" aria-expanded="true">
            <span class="rag-library-title">${icon("pin", 13)}已釘選</span>
            <span class="rag-library-count" id="rag-pinned-count">0</span>
            ${icon("chevronDown", 12, "rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-pinned-body">
            <div class="rag-library-empty">尚無釘選項目。</div>
          </div>
        </section>
        <section class="rag-library-section" data-rag-section="projects">
          <button class="rag-library-head" type="button" data-rag-toggle="projects" aria-expanded="true">
            <span class="rag-library-title">${icon("folder", 13)}專案</span>
            <span class="rag-library-count" id="rag-projects-count">0</span>
            ${icon("chevronDown", 12, "rag-library-chevron")}
          </button>
          <div class="rag-library-body" id="rag-projects-body"></div>
        </section>
        <section class="rag-library-section rag-library-recent">
          <div class="rag-library-head is-static">
            <span class="rag-library-title">${icon("history", 13)}最近項目 <span class="rag-library-count" id="rag-recent-count">0</span></span>
            <button class="btn btn-ghost btn-sm" type="button" id="rag-clear-history">清除</button>
          </div>
          <div class="rag-library-body" id="rag-history">
            <div class="rag-library-empty">讀取本機紀錄中…</div>
          </div>
          <div class="rag-library-foot" id="rag-storage-note">
            提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器。
          </div>
        </section>
      </aside>
      <div class="rag-workspace">
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

    <section class="rag-conversation" id="rag-conversation" aria-live="polite">
      <div class="rag-turns" id="rag-turns">
        ${emptyConversationMarkup()}
      </div>
      <form class="rag-followup" id="rag-followup-form" hidden>
        <label class="sr-only" for="rag-followup-question">繼續提問</label>
        <textarea class="rag-followup-input" id="rag-followup-question" name="question" rows="1"
          maxlength="500" placeholder="繼續問下一個問題…" aria-label="繼續提問"></textarea>
        <div class="rag-followup-actions">
          <span class="rag-followup-hint"><kbd>Enter</kbd> 送出 · <kbd>Shift</kbd> + <kbd>Enter</kbd> 換行</span>
          <button class="btn btn-primary" type="submit" id="rag-followup-submit">
            ${icon("sparkles", 15)}<span>繼續檢索</span>
          </button>
        </div>
      </form>
    </section>
      </div>
    </div>
    <div id="rag-test-flow" class="rag-test-flow"></div>
    <div class="rag-history-menu" id="rag-history-menu" role="menu" hidden></div>
    <dialog id="rag-judgment-dialog" class="judgment-dialog"></dialog>
    <dialog id="rag-law-dialog" class="judgment-dialog law-dialog"></dialog>
  </section>`;

  const form = root.querySelector("#rag-form");
  const input = root.querySelector("#rag-question");
  const submit = root.querySelector("#rag-submit");
  const page = root.querySelector(".rag-page");
  const turnsBox = root.querySelector("#rag-turns");
  const followupForm = root.querySelector("#rag-followup-form");
  const followupInput = root.querySelector("#rag-followup-question");
  const followupSubmit = root.querySelector("#rag-followup-submit");
  const historyBox = root.querySelector("#rag-history");
  const storageNote = root.querySelector("#rag-storage-note");
  const clearButton = root.querySelector("#rag-clear-history");
  const library = root.querySelector(".rag-library");
  const pinnedBox = root.querySelector("#rag-pinned-body");
  const projectsBox = root.querySelector("#rag-projects-body");
  const pinnedCount = root.querySelector("#rag-pinned-count");
  const projectsCount = root.querySelector("#rag-projects-count");
  const recentCount = root.querySelector("#rag-recent-count");
  const libraryContext = root.querySelector("#rag-library-context");
  const testModeBox = root.querySelector("#rag-test-mode");
  const testFlowBox = root.querySelector("#rag-test-flow");
  const historyMenu = root.querySelector("#rag-history-menu");
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
  let openHistoryMenuId = null;
  let openHistoryMenuTrigger = null;

  const resizeInput = () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
  };

  const resizeFollowupInput = () => {
    followupInput.style.height = "auto";
    followupInput.style.height = `${Math.min(followupInput.scrollHeight, 160)}px`;
  };

  const setConversationMode = (active) => {
    conversationActive = Boolean(active);
    page.classList.toggle("has-conversation", conversationActive);
  };

  const showFollowup = () => {
    if (!conversationActive) return;
    followupForm.hidden = false;
    resizeFollowupInput();
  };

  const hideFollowup = () => {
    followupForm.hidden = true;
  };

  const closeHistoryMenu = () => {
    if (historyMenu.hidden && !openHistoryMenuTrigger) return;
    historyMenu.hidden = true;
    historyMenu.innerHTML = "";
    if (openHistoryMenuTrigger) {
      openHistoryMenuTrigger.setAttribute("aria-expanded", "false");
    }
    openHistoryMenuId = null;
    openHistoryMenuTrigger = null;
  };

  const appendConversationTurn = (question, answerHtml) => {
    const placeholder = turnsBox.querySelector(".rag-empty-answer");
    if (placeholder) placeholder.remove();
    turnsBox.insertAdjacentHTML("beforeend", turnMarkup(question, answerHtml));
    const turnElement = turnsBox.lastElementChild;
    const answerElement = turnElement?.querySelector("[data-rag-answer]");
    window.requestAnimationFrame(() => {
      turnElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return { turnElement, answerElement };
  };

  const renderStoredConversation = () => {
    turnsBox.innerHTML = conversationTurns.length
      ? conversationTurns
          .map((turn) =>
            turnMarkup(
              turn.question,
              renderAnswer(turn.question, turn.payload || {}, ""),
            ),
          )
          .join("")
      : emptyConversationMarkup();
  };

  const openConversation = (entry) => {
    const turns = Array.isArray(entry.turns) ? entry.turns : [];
    if (!turns.length) return false;
    requestSeq += 1;
    stopFlowPoll();
    paintTestFlow(null);
    currentConversationId = entry.id ?? null;
    conversationTurns = turns.map((turn) => ({ ...turn }));
    lastQuestion =
      conversationTurns[conversationTurns.length - 1]?.question || "";
    setConversationMode(true);
    renderStoredConversation();
    showFollowup();
    renderLibrary();
    setBusy(submit, false);
    setBusy(followupSubmit, false);
    window.setTimeout(() => {
      followupForm.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);
    return true;
  };

  const renderLibrary = () => {
    if (disposed) return;
    closeHistoryMenu();
    if (!historyLoaded) {
      historyBox.innerHTML = `<div class="rag-library-empty">讀取本機紀錄中…</div>`;
      pinnedBox.innerHTML = `<div class="rag-library-empty">讀取本機紀錄中…</div>`;
      pinnedCount.textContent = "0";
      recentCount.textContent = "0";
      if (projectsLoaded) {
        projectsBox.innerHTML = renderProjects(projects, [], activeProjectId);
      }
      return;
    }
    const activeProject =
      projects.find((project) => String(project.id) === activeProjectId) || null;
    if (activeProjectId && !activeProject) activeProjectId = "";
    const projectMap = new Map(
      projects.map((project) => [String(project.id), project]),
    );
    const pinned = historyEntries.filter((entry) => Boolean(entry.pinned));
    const filtered = activeProjectId
      ? historyEntries.filter(
          (entry) => String(entry.project_id || "") === activeProjectId,
        )
      : historyEntries;
    const visible = filtered.slice(0, recentLimit);
    const renderEntry = (entry, index) =>
      renderHistoryItem(
        entry,
        projectMap,
        index,
        currentConversationId,
      );
    pinnedBox.innerHTML = pinned.length
      ? pinned.map(renderEntry).join("")
      : `<div class="rag-library-empty">尚無釘選項目。將最近項目釘選後會顯示在這裡。</div>`;
    projectsBox.innerHTML = renderProjects(
      projects,
      historyEntries,
      activeProjectId,
    );
    historyBox.innerHTML = visible.length
      ? visible.map(renderEntry).join("")
      : `<div class="rag-library-empty">${
          activeProjectId
            ? "這個專案還沒有項目。"
            : "尚無提問紀錄。送出第一個問題後會保存在此瀏覽器。"
        }</div>`;
    if (filtered.length > recentLimit) {
      historyBox.insertAdjacentHTML(
        "beforeend",
        `<button class="rag-library-more" type="button" data-rag-action="more-recent">顯示更多 · ${formatNumber(
          filtered.length - recentLimit,
        )} 筆</button>`,
      );
    }
    pinnedCount.textContent = String(pinned.length);
    projectsCount.textContent = String(projects.length);
    recentCount.textContent = String(filtered.length);
    if (activeProject) {
      libraryContext.hidden = false;
      libraryContext.innerHTML = `<span>${icon(
        "folder",
        12,
      )}<strong>${escapeHtml(
        activeProject.name,
      )}</strong></span><button type="button" data-rag-action="clear-project" title="返回全部項目" aria-label="返回全部項目">${icon(
        "x",
        12,
      )}</button>`;
    } else {
      libraryContext.hidden = true;
      libraryContext.innerHTML = "";
    }
  };

  const loadProjects = async () => {
    try {
      const stored = await getSetting("rag.projects", []);
      projects = Array.isArray(stored)
        ? stored
            .map((project) => ({
              id: String(project?.id || ""),
              name: String(project?.name || "").trim(),
            }))
            .filter((project) => project.id && project.name)
        : [];
    } catch (error) {
      projects = [];
    }
    projectsLoaded = true;
    if (!disposed) renderLibrary();
  };

  const selectProject = (projectId) => {
    activeProjectId = String(projectId || "");
    recentLimit = 8;
    renderLibrary();
  };

  const showProjectForm = () => {
    const form = projectsBox.querySelector('[data-rag-form="project"]');
    if (!form) return;
    form.hidden = false;
    form.querySelector("input")?.focus();
  };

  const cancelProjectForm = () => {
    const form = projectsBox.querySelector('[data-rag-form="project"]');
    if (!form) return;
    form.hidden = true;
    form.reset();
  };

  const createProject = async (form) => {
    const field = form.elements.project_name;
    const name = String(field?.value || "").trim();
    if (!name) {
      toast("請輸入專案名稱。", "warn");
      field?.focus();
      return;
    }
    if (
      projects.some(
        (project) => project.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      toast("已有同名專案。", "warn");
      field?.focus();
      return;
    }
    const id =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    projects = [
      ...projects,
      { id, name: name.slice(0, 60), created_at: new Date().toISOString() },
    ];
    activeProjectId = id;
    recentLimit = 8;
    await setSetting("rag.projects", projects);
    renderLibrary();
    toast(`已建立專案「${name}」。`, "ok");
  };

  const togglePin = async (entryId) => {
    const entry = historyEntries.find(
      (item) => String(item.id) === String(entryId),
    );
    if (!entry) return;
    const pinned = !entry.pinned;
    const updated = await updateHistoryEntry(entry.id, { pinned });
    if (!updated) {
      toast("無法更新釘選狀態。", "danger");
      return;
    }
    entry.pinned = pinned;
    renderLibrary();
    toast(pinned ? "已釘選項目。" : "已取消釘選。", "ok");
  };

  const newChat = () => {
    requestSeq += 1;
    stopFlowPoll();
    paintTestFlow(null);
    lastQuestion = "";
    currentConversationId = null;
    conversationTurns = [];
    setConversationMode(false);
    hideFollowup();
    turnsBox.innerHTML = emptyConversationMarkup();
    input.value = "";
    resizeInput();
    followupInput.value = "";
    resizeFollowupInput();
    setBusy(submit, false);
    setBusy(followupSubmit, false);
    renderLibrary();
    if (judgmentDialog?.open) judgmentDialog.close();
    if (lawDialog?.open) lawDialog.close();
    input.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const positionHistoryMenu = (trigger) => {
    if (!trigger || historyMenu.hidden) return;
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = historyMenu.getBoundingClientRect();
    const gap = 6;
    let top = triggerRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight - 8) {
      top = Math.max(8, triggerRect.top - menuRect.height - gap);
    }
    let left = triggerRect.right - menuRect.width;
    left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
    historyMenu.style.left = `${Math.round(left)}px`;
    historyMenu.style.top = `${Math.round(top)}px`;
  };

  const renderHistoryMenu = (entry) => {
    historyMenu.innerHTML = `
      <button type="button" role="menuitem" data-menu-action="rename">${icon("edit", 13)}<span>重新命名</span></button>
      <button type="button" role="menuitem" data-menu-action="toggle-pin">${icon("pin", 13)}<span>${entry.pinned ? "取消釘選" : "釘選"}</span></button>
      <button type="button" role="menuitem" data-menu-action="share">${icon("link", 13)}<span>分享</span></button>
      <button type="button" role="menuitem" data-menu-action="move">${icon("folder", 13)}<span>移至專案</span></button>
      <div class="rag-history-menu-divider"></div>
      <button class="is-danger" type="button" role="menuitem" data-menu-action="delete">${icon("trash", 13)}<span>刪除</span></button>`;
  };

  const renderMoveProjectMenu = (entry) => {
    const current = String(entry.project_id || "");
    const options = [
      { id: "", name: "未分類" },
      ...projects.map((project) => ({
        id: String(project.id),
        name: project.name,
      })),
    ];
    historyMenu.innerHTML = `
      <div class="rag-history-menu-head">${icon("folder", 13)}<span>移至專案</span></div>
      ${options
        .map(
          (option) => `<button type="button" role="menuitem"
            data-menu-action="assign-project" data-project-id="${escapeHtml(option.id)}">
            <span class="rag-history-menu-check">${
              current === option.id ? icon("check", 12) : ""
            }</span>
            <span>${escapeHtml(option.name)}</span>
          </button>`,
        )
        .join("")}
      ${
        projects.length
          ? ""
          : `<div class="rag-history-menu-note">尚未建立專案，可先從左側建立。</div>`
      }
      <div class="rag-history-menu-divider"></div>
      <button type="button" role="menuitem" data-menu-action="back">${icon(
        "chevronLeft",
        13,
      )}<span>返回</span></button>`;
  };

  const openHistoryMenu = (trigger, entryId) => {
    const entry = historyEntries.find(
      (item) => String(item.id) === String(entryId),
    );
    if (!entry) return;
    closeHistoryMenu();
    openHistoryMenuId = String(entry.id);
    openHistoryMenuTrigger = trigger;
    renderHistoryMenu(entry);
    historyMenu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    positionHistoryMenu(trigger);
  };

  const renameHistory = async (entry) => {
    const next = window.prompt("重新命名對話", entry.title || "");
    if (next === null) return;
    const title = next.trim();
    if (!title) {
      toast("名稱不能空白。", "warn");
      return;
    }
    if (title === entry.title) return;
    const updated = await updateHistoryEntry(entry.id, { title });
    if (!updated) {
      toast("重新命名失敗。", "danger");
      return;
    }
    entry.title = title;
    renderLibrary();
    toast("對話已重新命名。", "ok");
  };

  const shareHistory = async (entry) => {
    const turns = Array.isArray(entry.turns) ? entry.turns : [];
    const lines = [`# ${entry.title || "未命名對話"}`, ""];
    if (turns.length) {
      for (const turn of turns) {
        lines.push("## 問題", "", turn.question || "", "");
        lines.push("## 回答", "", turn.payload?.answer || "（沒有回答內容）", "");
        const sources = Array.isArray(turn.payload?.law_sources)
          ? turn.payload.law_sources
              .map((source) => source.law_name)
              .filter(Boolean)
          : [];
        if (sources.length) {
          lines.push(`引用：${[...new Set(sources)].join("、")}`, "");
        }
      }
    } else {
      lines.push(entry.title || "");
    }
    const ok = await copyText(lines.join("\n"));
    toast(
      ok ? "對話內容已複製，可直接貼上分享。" : "無法複製對話內容。",
      ok ? "ok" : "warn",
    );
  };

  const deleteHistory = async (entry) => {
    if (
      !window.confirm(
        `刪除對話「${entry.title || "未命名對話"}」？此操作無法復原。`,
      )
    ) {
      return;
    }
    const deleted = await deleteHistoryEntry(entry.id);
    if (!deleted) {
      toast("刪除失敗。", "danger");
      return;
    }
    const wasCurrent =
      currentConversationId !== null &&
      String(currentConversationId) === String(entry.id);
    historyEntries = historyEntries.filter(
      (item) => String(item.id) !== String(entry.id),
    );
    if (wasCurrent) {
      newChat();
    } else {
      renderLibrary();
    }
    toast("對話已刪除。", "ok");
  };

  const assignProject = async (entry, projectId) => {
    const updated = await updateHistoryEntry(entry.id, {
      project_id: projectId,
    });
    if (!updated) {
      toast("移至專案失敗。", "danger");
      return;
    }
    entry.project_id = projectId;
    const project = projects.find(
      (item) => String(item.id) === String(projectId),
    );
    renderLibrary();
    toast(
      project ? `已移至專案「${project.name}」。` : "已移出專案。",
      "ok",
    );
  };

  const handleHistoryMenuClick = async (event) => {
    const button = event.target.closest("[data-menu-action]");
    if (!button) return;
    const entry = historyEntries.find(
      (item) => String(item.id) === openHistoryMenuId,
    );
    if (!entry) {
      closeHistoryMenu();
      return;
    }
    const action = button.dataset.menuAction;
    if (action === "rename") {
      closeHistoryMenu();
      await renameHistory(entry);
    } else if (action === "toggle-pin") {
      closeHistoryMenu();
      await togglePin(entry.id);
    } else if (action === "share") {
      closeHistoryMenu();
      await shareHistory(entry);
    } else if (action === "move") {
      renderMoveProjectMenu(entry);
      positionHistoryMenu(openHistoryMenuTrigger);
    } else if (action === "assign-project") {
      closeHistoryMenu();
      await assignProject(entry, button.dataset.projectId || "");
    } else if (action === "back") {
      renderHistoryMenu(entry);
      positionHistoryMenu(openHistoryMenuTrigger);
    } else if (action === "delete") {
      closeHistoryMenu();
      await deleteHistory(entry);
    }
  };

  const onDocumentClick = (event) => {
    if (historyMenu.hidden) return;
    const path =
      typeof event.composedPath === "function" ? event.composedPath() : [];
    if (path.includes(historyMenu) || historyMenu.contains(event.target)) {
      return;
    }
    if (event.target.closest('[data-rag-action="open-history-menu"]')) return;
    closeHistoryMenu();
  };

  const onDocumentKeydown = (event) => {
    if (event.key === "Escape") closeHistoryMenu();
  };

  const onWindowScroll = (event) => {
    if (event.target instanceof Node && historyMenu.contains(event.target)) {
      return;
    }
    closeHistoryMenu();
  };

  const refreshHistory = async () => {
    try {
      historyEntries = await listHistory({ limit: 120 });
      if (disposed) return;
      historyLoaded = true;
      renderLibrary();
      storageNote.textContent =
        storageMode() === "indexeddb"
          ? "提問紀錄儲存在瀏覽器 IndexedDB，不會上傳到伺服器。"
          : "瀏覽器儲存不可用，提問紀錄只保留在本次工作階段。";
    } catch (error) {
      if (disposed) return;
      historyEntries = [];
      historyLoaded = true;
      renderLibrary();
      historyBox.innerHTML = `<div class="rag-library-empty">無法讀取本機紀錄。</div>`;
    }
  };

  const recordTurn = async (question, payload, projectId, requestToken) => {
    const turns = conversationTurns;
    const conversationId = currentConversationId;
    turns.push({
      question,
      asked_at: new Date().toISOString(),
      payload: compactAnswerPayload(payload),
    });
    const citations = Array.isArray(payload.citations) ? payload.citations : [];
    const judgments = Array.isArray(payload.judgments) ? payload.judgments : [];
    const summary = {
      question,
      status: payload.status,
      citations: citations.map((item) => item.law_name),
      judgments: judgments.map((item) => item.jid),
    };
    const detail = `${payload.status || "preview"} · ${turns.length} 輪`;
    const updatedAt = new Date().toISOString();
    const applyId = (id) => {
      if (requestToken === requestSeq) currentConversationId = id;
    };
    if (conversationId) {
      const updated = await updateHistoryEntry(conversationId, {
        turns,
        detail,
        payload: summary,
        updated_at: updatedAt,
      });
      if (!updated) {
        const id = await addHistory({
          kind: "rag",
          title: turns[0]?.question || question,
          detail,
          project_id: projectId,
          turns,
          payload: summary,
          updated_at: updatedAt,
        });
        applyId(id);
      }
    } else {
      const id = await addHistory({
        kind: "rag",
        title: turns[0]?.question || question,
        detail,
        project_id: projectId,
        turns,
        payload: summary,
        updated_at: updatedAt,
      });
      applyId(id);
    }
    await refreshHistory();
  };

  const loadModeNotice = async () => {
    try {
      const status = await api.status();
      if (disposed) return;
      const data = status.data || {};
      const services = new Map(
        (status.services || []).map((item) => [item.id, item]),
      );
      const rag = services.get("rag");
      const indexed = Number(data.judgment_indexed_count || 0);
      const totalJudgments = Number(data.judgment_count || 0);
      const heroNotice = root.querySelector("#rag-mode-notice");
      if (!heroNotice) return;
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
    } catch (error) {
      if (disposed) return;
      const heroNotice = root.querySelector("#rag-mode-notice");
      if (heroNotice) {
        heroNotice.innerHTML = notice({
          tone: "warn",
          title: "無法取得 RAG 服務狀態",
          text: escapeHtml(
            error.message || "請稍後再試，或前往系統狀態頁查看。",
          ),
        });
      }
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
      text: `每次提問會依序執行 ${embedding} 個 embedding 與 ${llm} 個 LLM 模型，且不設逾時。測試 Flow 會在頁面下方即時顯示，也可到 <a href="#/tests">系統測試</a> 或 <a href="#/performance">效能報表</a> 查看歷史。`,
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
      .map((law) => lawChipMarkup(law))
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

  const renderLawSourceDetail = (detail, articleNo = "") => {
    const selectedArticleNo = String(
      detail.selected_article_no || articleNo || "",
    ).trim();
    const articleView = Boolean(selectedArticleNo);
    const articles = Array.isArray(detail.articles) ? detail.articles : [];
    const body = articles
      .map((article) => {
        const content = String(article.article_content || "").trim();
        if (!content) return "";
        if (article.article_type === "C") {
          return `<div class="law-chapter">${escapeHtml(content)}</div>`;
        }
        return `<article class="law-article" data-article-no="${escapeHtml(
          lawArticleJumpKey(article.article_no),
        )}">
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
    const articlesSource = detail.meta?.articles_source;
    const articleSource =
      articlesSource === "parquet"
        ? "Parquet 條文"
        : articlesSource === "postgresql"
          ? "PostgreSQL 條文"
          : "條文未提供";
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
    const history =
      !articleView && detail.law_histories
        ? `<details class="law-dialog-history">
          <summary>法規沿革</summary>
          <div>${escapeHtml(detail.law_histories)}</div>
        </details>`
        : "";
    const articleBadge = articleView
      ? `<span class="badge badge-mono">${escapeHtml(selectedArticleNo)}</span>`
      : "";
    const jumpControl =
      !articleView && articles.length > 1
        ? `<div class="law-dialog-jump">
          <div class="law-article-jump">
            <input class="input law-article-jump-input law-jump-input"
              id="rag-law-article-jump" type="text" inputmode="numeric"
              autocomplete="off" placeholder="跳至第幾條" aria-label="跳至指定條文" />
            <button class="btn btn-secondary btn-sm" type="button"
              data-action="jump-law-article"
              data-jump-input="rag-law-article-jump">跳至條文</button>
          </div>
        </div>`
        : "";
    const title = articleView
      ? `${detail.law_name || detail.law_key || "法規／命令"} · ${selectedArticleNo}`
      : detail.law_name || detail.law_key || "法規／命令";
    return lawDialogFrame(
      title,
      `<div class="judgment-dialog-meta">
        <span class="badge ${detail.source_type === "order" ? "badge-warn" : "badge-info"}">${escapeHtml(
          sourceTypeLabel,
        )}</span>
        ${articleBadge}
        ${meta}
      </div>
      <div class="judgment-dialog-source">${escapeHtml(
        [articleSource, snapshot].filter(Boolean).join(" · "),
      )}</div>
      ${warnings ? `<div class="law-dialog-warning">${warnings}</div>` : ""}
      ${history}
      ${jumpControl}
      <div class="law-dialog-articles">${
        body ||
        `<div class="report-empty-inline">${
          articleView ? "這條條文目前沒有可顯示的內容。" : "這個法規／命令目前沒有可顯示的條文。"
        }</div>`
      }</div>
      <div class="judgment-dialog-actions">
        ${lawLink}
        <button class="btn btn-secondary btn-sm" type="button"
          data-action="close-law-source">返回回答</button>
      </div>`,
    );
  };

  const jumpToLawArticle = (container, inputId) => {
    const input = container?.querySelector(`#${inputId}`);
    const key = lawArticleJumpKey(input?.value || "");
    if (!key) {
      toast("請輸入要跳至的條號，例如 100 或 第100條。", "warn");
      input?.focus();
      return;
    }
    const target = [...(container?.querySelectorAll("[data-article-no]") || [])].find(
      (element) => element.dataset.articleNo === key,
    );
    if (!target) {
      toast(`找不到第 ${key} 條。`, "warn");
      return;
    }
    target.scrollIntoView({ behavior: "instant", block: "center" });
    target.classList.add("is-jump-target");
    window.setTimeout(() => target.classList.remove("is-jump-target"), 2400);
  };

  const openLawSource = async (lawKey, sourceType = "", articleNo = "") => {
    if (!lawDialog || !lawKey) return;
    const seq = ++lawDialogSeq;
    if (!lawDialog.open) lawDialog.showModal();
    syncDialogScrollLock();
    lawDialog.innerHTML = lawDialogFrame(
      articleNo ? "讀取法規條文中…" : "讀取法規／命令中…",
      `<div class="judgment-dialog-loading">
        <span class="spinner"></span>
        <span>正在從本地 Parquet 讀取 ${escapeHtml(
          [lawKey, articleNo].filter(Boolean).join(" · "),
        )} 的原始條文…</span>
      </div>`,
    );
    try {
      const detail = await api.lawDetail(lawKey, sourceType, "", articleNo);
      if (disposed || seq !== lawDialogSeq) return;
      lawDialog.innerHTML = renderLawSourceDetail(detail, articleNo);
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
    const jumpButton = event.target.closest('[data-action="jump-law-article"]');
    if (jumpButton) {
      jumpToLawArticle(
        lawDialog,
        jumpButton.dataset.jumpInput || "rag-law-article-jump",
      );
      return;
    }
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

  lawDialog?.addEventListener("keydown", (event) => {
    if (!event.target.matches(".law-jump-input") || event.key !== "Enter") return;
    event.preventDefault();
    jumpToLawArticle(lawDialog, event.target.id);
  });

  judgmentDialog?.addEventListener("click", (event) => {
    const lawTarget = event.target.closest('[data-action="open-law-source"]');
    if (lawTarget) {
      openLawSource(
        lawTarget.dataset.lawKey || "",
        lawTarget.dataset.sourceType || "",
        lawTarget.dataset.articleNo || "",
      );
      return;
    }
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

  turnsBox.addEventListener("click", (event) => {
    const processToggle = event.target.closest(".rag-process-toggle");
    if (processToggle) {
      const panel = processToggle.closest(".rag-process");
      const expanded =
        processToggle.getAttribute("aria-expanded") === "true";
      setProcessExpanded(panel, !expanded);
      return;
    }
    const target = event.target.closest(
      '[data-action="open-parquet-judgment"], [data-action="open-law-source"]',
    );
    if (!target) return;
    if (target.dataset.action === "open-law-source") {
      openLawSource(
        target.dataset.lawKey || "",
        target.dataset.sourceType || "",
        target.dataset.articleNo || "",
      );
      return;
    }
    openParquetJudgment(target.dataset.jid || "");
  });

  turnsBox.addEventListener("keydown", (event) => {
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
        target.dataset.articleNo || "",
      );
      return;
    }
    openParquetJudgment(target.dataset.jid || "");
  });

  const runQuestion = async (
    question,
    { fresh = false, source = "hero" } = {},
  ) => {
    const trimmed = question.trim();
    if (!trimmed) {
      toast("請先輸入問題。", "warn");
      (source === "followup" ? followupInput : input).focus();
      return;
    }
    if (fresh || !conversationActive) {
      currentConversationId = null;
      conversationTurns = [];
      turnsBox.innerHTML = "";
      renderLibrary();
    }
    const requestToken = ++requestSeq;
    const isStale = () => disposed || requestToken !== requestSeq;
    const projectId = activeProjectId;
    lastQuestion = trimmed;
    setConversationMode(true);
    hideFollowup();
    if (source === "followup") {
      followupInput.value = "";
      resizeFollowupInput();
    } else {
      input.value = "";
      resizeInput();
    }
    const { answerElement } = appendConversationTurn(
      trimmed,
      answerLoading(trimmed, testMode),
    );
    const processController = testMode
      ? null
      : createProcessController(answerElement);
    if (testMode) {
      paintTestFlow(null);
      startFlowPoll();
    } else {
      stopFlowPoll();
      paintTestFlow(null);
    }
    setBusy(submit, true, "檢索中…");
    setBusy(followupSubmit, true, "檢索中…");
    let partialPayload = null;
    let partialAnswer = "";
    const applyPartialAnswer = (payload) => {
      if (isStale() || !payload?.partial) return;
      const body = answerElement.querySelector(".answer-body");
      if (!body) return;
      partialPayload = payload;
      partialAnswer = String(payload.answer || "");
      body.innerHTML = renderAnswerBody(payload);
      processController?.collapse?.();
      const title = answerElement.querySelector(".answer-head-title");
      if (title) {
        title.textContent = payload.streaming
          ? "LLM 回答生成中"
          : "法規結果已顯示";
      }
    };
    const appendPartialToken = (text) => {
      if (isStale() || !text || !partialPayload?.streaming) return;
      partialAnswer += text;
      const target = answerElement.querySelector("[data-partial-answer]");
      if (target) target.textContent = partialAnswer;
    };
    const resetPartialTokens = () => {
      if (isStale() || !partialPayload?.streaming) return;
      partialAnswer = "";
      const target = answerElement.querySelector("[data-partial-answer]");
      if (target) target.textContent = "正在重新生成回答…";
    };
    try {
      const payload = testMode
        ? await api.rag(trimmed, { testMode })
        : await api.ragStream(trimmed, {
            onStep: (event) => {
              if (!isStale()) processController?.step(event);
            },
            onPartial: applyPartialAnswer,
            onToken: appendPartialToken,
            onTokenReset: resetPartialTokens,
          });
      if (isStale()) return;
      stopFlowPoll();
      const processHtml = processController?.finish(true) || "";
      answerElement.innerHTML = renderAnswer(trimmed, payload, processHtml);
      if (payload.test_run?.run_id) {
        await loadExactTestFlow(payload.test_run.run_id);
      } else {
        paintTestFlow(null);
      }
      await recordTurn(trimmed, payload, projectId, requestToken);
      if (isStale()) return;
      showFollowup();
    } catch (error) {
      if (isStale()) return;
      stopFlowPoll();
      const processHtml = processController?.finish(false) || "";
      answerElement.innerHTML = renderAnswerError(error, processHtml);
      showFollowup();
      toast(error.message || "檢索失敗。", "danger");
    } finally {
      if (!isStale()) {
        stopFlowPoll();
        setBusy(submit, false);
        setBusy(followupSubmit, false);
      }
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runQuestion(input.value, { fresh: true, source: "hero" });
  });

  followupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runQuestion(followupInput.value, { fresh: false, source: "followup" });
  });

  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  followupInput.addEventListener("input", resizeFollowupInput);
  followupInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      followupForm.requestSubmit();
    }
  });

  root.querySelector("#example-chips").addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    input.value = button.dataset.question;
    resizeInput();
    form.requestSubmit();
  });

  library.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-rag-toggle]");
    if (toggle) {
      const section = toggle.closest(".rag-library-section");
      const collapsed = section.classList.toggle("is-collapsed");
      toggle.setAttribute("aria-expanded", String(!collapsed));
      return;
    }
    const actionTarget = event.target.closest("[data-rag-action]");
    const action = actionTarget?.dataset.ragAction || "";
    if (action === "new-chat") {
      newChat();
      return;
    }
    if (action === "open-history-menu") {
      openHistoryMenu(actionTarget, actionTarget.dataset.historyId);
      return;
    }
    if (action === "toggle-pin") {
      await togglePin(actionTarget.dataset.historyId);
      return;
    }
    if (action === "select-project") {
      selectProject(actionTarget.dataset.projectId || "");
      return;
    }
    if (action === "show-project-form") {
      showProjectForm();
      return;
    }
    if (action === "cancel-project") {
      cancelProjectForm();
      return;
    }
    if (action === "more-recent") {
      recentLimit += 12;
      renderLibrary();
      return;
    }
    if (action === "clear-project") {
      selectProject("");
      return;
    }
    const openButton = event.target.closest("[data-history-open]");
    if (!openButton) return;
    const entry = historyEntries.find(
      (item) => String(item.id) === String(openButton.dataset.historyId),
    );
    if (!entry) return;
    activeProjectId = String(entry.project_id || "");
    renderLibrary();
    if (openConversation(entry)) return;
    currentConversationId = null;
    conversationTurns = [];
    runQuestion(entry.title, { fresh: true, source: "history" });
  });

  library.addEventListener("submit", async (event) => {
    const form = event.target.closest('[data-rag-form="project"]');
    if (!form) return;
    event.preventDefault();
    await createProject(form);
  });

  historyMenu.addEventListener("click", handleHistoryMenuClick);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener("scroll", onWindowScroll, true);
  window.addEventListener("resize", closeHistoryMenu);

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
  await Promise.allSettled([
    loadModeNotice(),
    refreshHistory(),
    loadProjects(),
    loadTestMode(),
  ]);
  await loadCurrentTestFlow();

  return () => {
    disposed = true;
    stopFlowPoll();
    closeHistoryMenu();
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeydown);
    window.removeEventListener("scroll", onWindowScroll, true);
    window.removeEventListener("resize", closeHistoryMenu);
    document.documentElement.classList.remove("dialog-open");
    window.removeEventListener("judgment:test-mode", onTestModeChange);
    if (lastQuestion) {
      // Keep the last question available for screen readers after navigation.
      turnsBox.setAttribute("data-last-question", lastQuestion);
    }
  };
}
