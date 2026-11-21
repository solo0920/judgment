import { api, subscribeRefresh } from "../api.js";
import { judgmentStatsCardsMarkup } from "../judgment-stats.js";
import {
  downloadText,
  escapeHtml,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  readLocalCache,
  safeUrl,
  writeLocalCache,
} from "../utils.js";

const LAW_COLUMNS = 11;
const HOME_REFRESH_MIN_INTERVAL = 15000;
const HOME_CACHE_KEY = "judgment.home.summary.v1";
const HOME_WF_OPEN_STAGES = new Set();

const SECTIONS = [
  {
    route: "rag",
    icon: "message",
    kicker: "RAG",
    title: "RAG 提問",
    summary: "用自然語言找到相似判決與現行法規，回答附上可回溯的引用。",
    metric: "Citations first",
    tone: "feature",
    wide: true,
    metricKey: "rag",
  },
  {
    route: "data",
    icon: "database",
    kicker: "EXPLORE",
    title: "資料庫查詢",
    summary: "跨 PostgreSQL、Parquet、Qdrant 與 IndexedDB 檢視原始資料。",
    metric: "4 種資料來源",
    tone: "blue",
    metricKey: "data",
  },
  {
    route: "quality",
    icon: "shield",
    kicker: "QUALITY",
    title: "資料品質",
    summary: "用 DuckDB 檢查原始判決的重複、缺漏與引用一致性。",
    metric: "DuckDB native",
    tone: "green",
    metricKey: "quality",
  },
  {
    route: "performance",
    icon: "activity",
    kicker: "OBSERVE",
    title: "效能報表",
    summary: "從單次 RAG 到索引建置，追蹤每個階段的耗時與瓶頸。",
    metric: "Flow · Waterfall",
    tone: "amber",
    metricKey: "performance",
  },
  {
    route: "processing",
    icon: "sliders",
    kicker: "PIPELINE",
    title: "資料處理",
    summary: "下載、匯入、備份與索引，集中管理資料生命週期。",
    metric: "End-to-end",
    tone: "violet",
    metricKey: "processing",
  },
  {
    route: "status",
    icon: "server",
    kicker: "STATUS",
    title: "系統狀態",
    summary: "檢視服務健康、載入 Pipeline、架構、資料版本與 API 目錄。",
    metric: "10 服務元件",
    tone: "slate",
    metricKey: "status",
  },
  {
    route: "tests",
    icon: "check",
    kicker: "VERIFY",
    title: "系統測試",
    summary: "設定 API Base，測試 LLM 模型與 Reranker 服務。",
    metric: "LLM · Reranker",
    tone: "rose",
    metricKey: "tests",
  },
];

function pct(value, digits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number.toFixed(digits)}%`;
}

function yearRange(judgments) {
  const min = judgments?.year_min;
  const max = judgments?.year_max;
  if (!min && !max) return "—";
  if (min && max && min !== max) return `${min}–${max}`;
  return String(min || max);
}

function spanYears(judgments) {
  const span = Number(judgments?.year_span);
  return Number.isFinite(span) && span > 0 ? `${span} 年` : "—";
}

function renderSectionTile(section) {
  return `<a class="home-tile tone-${escapeHtml(section.tone)}${
    section.wide ? " is-wide" : ""
  }" href="#/${section.route}">
    <span class="home-tile-watermark" aria-hidden="true">${icon(section.icon, 148)}</span>
    <span class="home-tile-head">
      <span class="home-tile-icon">${icon(section.icon, 22)}</span>
      <span class="home-tile-kicker">${escapeHtml(section.kicker)}</span>
    </span>
    <span class="home-tile-copy">
      <strong>${escapeHtml(section.title)}</strong>
      <span>${escapeHtml(section.summary)}</span>
    </span>
    <span class="home-tile-foot">
      <span class="home-tile-metric" data-home-tile-metric="${escapeHtml(
        section.metricKey,
      )}">${escapeHtml(section.metric)}</span>
      <span class="home-tile-cta">探索 ${icon("arrowRight", 13)}</span>
    </span>
  </a>`;
}

function lawMetricsMarkup(summary, { loading = false } = {}) {
  const laws = summary?.laws || {};
  const value = (number) => (loading ? "讀取中…" : formatNumber(number));
  return `<div class="processing-summary-card">
    <span class="processing-summary-label">法規</span>
    <span class="processing-summary-value mono" data-home-law-stat="law">${value(
      laws.law_count,
    )}</span>
    <span class="processing-summary-hint">全國法規資料庫 current 版本</span>
  </div>
  <div class="processing-summary-card">
    <span class="processing-summary-label">命令</span>
    <span class="processing-summary-value mono" data-home-law-stat="order">${value(
      laws.order_count,
    )}</span>
    <span class="processing-summary-hint">現行命令與細則</span>
  </div>
  <div class="processing-summary-card is-ratio">
    <span class="processing-summary-label">法規／命令條文</span>
    <span class="processing-summary-value mono" data-home-law-stat="articles">${value(
      laws.article_count,
    )}</span>
    <span class="processing-summary-hint">${
      loading
        ? "條文索引來源"
        : `法規 ${formatNumber(laws.law_article_count)} · 命令 ${formatNumber(
            laws.order_article_count,
          )}`
    }</span>
  </div>`;
}

function liveRowsMarkup(data, { loading = false } = {}) {
  if (loading) {
    return `<div class="home-live-rows is-loading">
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
      <span class="skeleton skeleton-line"></span>
    </div>`;
  }
  const laws = data?.laws || {};
  const judgments = data?.judgments || {};
  const index = data?.rag?.judgment_index || {};
  return `<div class="home-live-rows">
    <div class="home-live-row">
      <span class="home-live-label">法規／命令</span>
      <span class="home-live-value mono">${formatNumber(
        laws.law_count,
      )} <i>/</i> ${formatNumber(laws.order_count)}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">金融判決</span>
      <span class="home-live-value mono" data-home-live="judgments">${formatNumber(
        judgments.financial_total,
      )}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">裁判年份</span>
      <span class="home-live-value mono">${escapeHtml(
        yearRange(judgments),
      )} <i>·</i> ${escapeHtml(spanYears(judgments))}</span>
    </div>
    <div class="home-live-row">
      <span class="home-live-label">判決向量索引</span>
      <span class="home-live-value mono">${formatNumber(
        index.indexed,
      )} <i>·</i> ${escapeHtml(pct(index.coverage_pct))}</span>
    </div>
  </div>`;
}

function liveCardMarkup(data, { loading = false, error = "", generatedAt = "" } = {}) {
  if (error) {
    return `<div class="home-live-error" role="status">
      <span class="home-live-error-icon">${icon("alert", 18)}</span>
      <div>
        <strong>即時摘要暫時無法取得</strong>
        <p>${escapeHtml(error)}</p>
        <button class="btn btn-secondary btn-sm" type="button" id="home-retry">
          ${icon("refresh", 13)}<span>重新載入</span>
        </button>
      </div>
    </div>`;
  }
  return `${liveRowsMarkup(data, { loading })}
    <div class="home-live-foot">
      <span class="home-live-source">${icon("link", 12)}司法院 OpenData · 全國法規資料庫</span>
      <span class="home-live-time">${
        loading || !generatedAt ? "同步中…" : `更新 ${formatDateTime(generatedAt)}`
      }</span>
    </div>`;
}

function metricStripMarkup(data, { loading = false } = {}) {
  if (loading) {
    return `<span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>
      <span class="home-fact is-loading"><span class="skeleton skeleton-line"></span></span>`;
  }
  const judgments = data?.judgments || {};
  const raw = data?.raw || {};
  const index = data?.rag?.judgment_index || {};
  return `<span class="home-fact">
      <span class="home-fact-label">原始判決備份</span>
      <strong>${formatNumber(raw.raw_total)}</strong>
      <small>${formatNumber(raw.archive_count)} 個 archive · 司法院 OpenData</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">金融判決年份</span>
      <strong>${escapeHtml(yearRange(judgments))}</strong>
      <small>${escapeHtml(spanYears(judgments))} · ${formatNumber(
        judgments.financial_total,
      )} 筆 current</small>
    </span>
    <span class="home-fact">
      <span class="home-fact-label">向量索引覆蓋</span>
      <strong>${escapeHtml(pct(index.coverage_pct))}</strong>
      <small>${formatNumber(index.indexed)} / ${formatNumber(
        index.total,
      )} 筆 · ${escapeHtml(index.model || "—")}</small>
    </span>`;
}

function sourceCardMarkup(kind, data) {
  const laws = data?.laws || {};
  const judgments = data?.judgments || {};
  const raw = data?.raw || {};
  const sources = data?.sources || {};
  if (kind === "opendata") {
    const source = sources.opendata || {};
    return `<article class="home-source-card">
      <div class="home-source-head">
        <span class="home-source-icon">${icon("cloud", 20)}</span>
        <div>
          <strong>${escapeHtml(source.label || "司法院資料開放平臺")}</strong>
          <small>裁判書原始資料</small>
        </div>
        <a class="home-source-link" href="${escapeHtml(
          safeUrl(source.url, "https://opendata.judicial.gov.tw/"),
        )}" target="_blank" rel="noopener noreferrer">${icon("external", 12)}來源</a>
      </div>
      <p class="home-source-copy">判決全文、案號、法院、裁判日期與 PDF 連結皆保留原始欄位；匯入前先寫入不可變的 raw Parquet 備份。</p>
      <dl class="home-source-facts">
        <div><dt>原始判決</dt><dd>${formatNumber(raw.raw_total)}</dd></div>
        <div><dt>Archive</dt><dd>${formatNumber(raw.archive_count)}</dd></div>
        <div><dt>裁判年份</dt><dd>${escapeHtml(yearRange(judgments))}</dd></div>
        <div><dt>分類代碼</dt><dd>${escapeHtml(source.category || "051")}</dd></div>
      </dl>
      <div class="home-source-flow"><span>RAR</span>${icon(
        "arrowRight",
        11,
      )}<span>raw Parquet</span>${icon("arrowRight", 11)}<span>PostgreSQL</span></div>
    </article>`;
  }
  const source = sources.laws || {};
  return `<article class="home-source-card">
    <div class="home-source-head">
      <span class="home-source-icon">${icon("layers", 20)}</span>
      <div>
        <strong>${escapeHtml(source.label || "全國法規資料庫")}</strong>
        <small>法規、命令與條文版本</small>
      </div>
      <a class="home-source-link" href="${escapeHtml(
        safeUrl(source.url, "https://law.moj.gov.tw/"),
      )}" target="_blank" rel="noopener noreferrer">${icon("external", 12)}來源</a>
    </div>
    <p class="home-source-copy">以官方 JSON 端點下載現行法規與命令，保留版本、條文與變更事件；判決引用可回到對應條號。</p>
    <dl class="home-source-facts">
      <div><dt>法規</dt><dd>${formatNumber(laws.law_count)}</dd></div>
      <div><dt>命令</dt><dd>${formatNumber(laws.order_count)}</dd></div>
      <div><dt>條文</dt><dd>${formatNumber(laws.article_count)}</dd></div>
      <div><dt>資料版本</dt><dd>${formatNumber(laws.version_count)}</dd></div>
    </dl>
    <div class="home-source-flow"><span>ZIP</span>${icon(
      "arrowRight",
      11,
    )}<span>Parquet</span>${icon("arrowRight", 11)}<span>PostgreSQL</span>${icon(
      "arrowRight",
      11,
    )}<span>Qdrant</span></div>
  </article>`;
}

function lawsMarkup(data, { loading = false, error = "" } = {}) {
  if (loading) {
    return `<div class="home-laws-loading skeleton skeleton-card"></div>`;
  }
  if (error) {
    return `<div class="home-laws-error" role="status">${icon(
      "alert",
      16,
    )}<span>${escapeHtml(error)}</span></div>`;
  }
  const financialLaws = data?.financial_laws || {};
  const laws = Array.isArray(financialLaws.laws) ? financialLaws.laws : [];
  const count = Number(financialLaws.count) || laws.length;
  const rows = Math.ceil(count / LAW_COLUMNS) || 0;
  const hash = String(financialLaws.source_sha256 || "");
  const hashLabel = hash ? `${hash.slice(0, 12)}…` : "—";
  const modified = financialLaws.modified_at
    ? formatDate(financialLaws.modified_at)
    : "—";
  return `<details class="home-laws" id="home-laws">
    <summary class="home-laws-summary">
      <span class="home-laws-count">${formatNumber(count)}</span>
      <span class="home-laws-title">
        <strong>金融法規清單</strong>
        <small>${escapeHtml(
          financialLaws.source_path || "documents/金融法規.md",
        )} · ${LAW_COLUMNS} 欄 × ${rows} 列</small>
      </span>
      <span class="home-laws-toggle">
        <span>展開清單</span>${icon("chevronDown", 14)}
      </span>
    </summary>
    <div class="home-laws-body">
      <div class="home-laws-toolbar">
        <span>來源 ${escapeHtml(
          financialLaws.source_path || "documents/金融法規.md",
        )} · SHA-256 <span class="mono">${escapeHtml(
          hashLabel,
        )}</span> · 修改 ${escapeHtml(modified)}</span>
        <button class="btn btn-secondary btn-sm" type="button" id="home-laws-download">
          ${icon("download", 13)}<span>下載清單</span>
        </button>
      </div>
      ${
        laws.length
          ? `<div class="home-laws-grid" style="--home-law-columns:${LAW_COLUMNS}" role="list">
              ${laws
                .map(
                  (law, index) => `<span class="home-law" role="listitem" title="${escapeHtml(
                    law,
                  )}">
                    <span class="home-law-index">${String(index + 1).padStart(
                      2,
                      "0",
                    )}</span>
                    <span class="home-law-name">${escapeHtml(law)}</span>
                  </span>`,
                )
                .join("")}
            </div>`
          : `<p class="home-laws-empty">目前沒有可顯示的法規名稱。</p>`
      }
    </div>
  </details>`;
}

function ragValuesMarkup(data, { loading = false, error = "" } = {}) {
  if (loading) {
    return `<div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>
      <div class="home-rag-card is-loading"><span class="skeleton skeleton-line"></span><span class="skeleton skeleton-line"></span></div>`;
  }
  if (error) {
    return `<div class="home-rag-error">${icon("alert", 16)}<span>${escapeHtml(
      error,
    )}</span></div>`;
  }
  const rag = data?.rag || {};
  const index = rag.judgment_index || {};
  const legal = rag.legal_index || {};
  const models = rag.models || {};
  const coverage = Number(index.coverage_pct);
  const coverageWidth = Number.isFinite(coverage)
    ? Math.max(0, Math.min(100, coverage))
    : 0;
  return `<article class="home-rag-card">
      <span class="home-rag-kicker">JUDGMENT RETRIEVAL</span>
      <strong class="home-rag-value mono">${formatNumber(index.indexed)}<small> / ${formatNumber(
        index.total,
      )}</small></strong>
      <span class="home-rag-label">已索引 / 金融判決</span>
      <span class="home-rag-progress" role="img" aria-label="判決向量索引覆蓋 ${escapeHtml(
        pct(index.coverage_pct),
      )}"><span style="width:${coverageWidth.toFixed(1)}%"></span></span>
      <span class="home-rag-meta">${escapeHtml(pct(index.coverage_pct))} · ${escapeHtml(
        index.model || "—",
      )} · ${escapeHtml(index.alias || "—")} → ${escapeHtml(
        index.collection || "—",
      )}</span>
      <a class="home-rag-link" href="#/rag">開始提問 ${icon("arrowRight", 12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LEGAL GROUNDING</span>
      <strong class="home-rag-value mono">${formatNumber(
        legal.points_count,
      )}<small> 條文</small></strong>
      <span class="home-rag-label">法規／命令向量索引</span>
      <span class="home-rag-progress" role="img" aria-label="法規命令索引 ${formatNumber(
        legal.points_count,
      )} 條文"><span style="width:${
        Number(legal.points_count) > 0 ? "100" : "0"
      }%"></span></span>
      <span class="home-rag-meta">${formatNumber(
        legal.current_article_count ?? legal.article_count,
      )} 現行條文 · ${escapeHtml(legal.model || "—")} · ${escapeHtml(
        legal.collection || "—",
      )}${legal.version_id ? ` · v${legal.version_id}` : ""}</span>
      <a class="home-rag-link" href="#/data">查看資料 ${icon("arrowRight", 12)}</a>
    </article>
    <article class="home-rag-card">
      <span class="home-rag-kicker">LLM · RERANK</span>
      <strong class="home-rag-value mono">${escapeHtml(models.llm || "—")}</strong>
      <span class="home-rag-label">回答模型</span>
      <span class="home-rag-chips">
        <span class="home-chip">Embedding ${escapeHtml(models.embedding || "—")}</span>
        <span class="home-chip ${models.rerank_enabled ? "is-on" : ""}">Rerank ${
          models.rerank_enabled ? "啟用" : "停用"
        }</span>
      </span>
      <span class="home-rag-meta">${escapeHtml(
        models.rerank || "—",
      )} · 回答必須附引用編號，缺少有效引用時降級為檢索結果。</span>
      <a class="home-rag-link" href="#/performance">查看 RAG Pipeline ${icon(
        "arrowRight",
        12,
      )}</a>
    </article>`;
}

function ragFlowMarkup() {
  const steps = [
    ["01", "問題", "1–500 字", "message"],
    ["02", "Embedding", "bge-m3", "brain"],
    ["03", "檢索", "判決 + 法規／命令", "database"],
    ["04", "Rerank", "cross-encoder", "sliders"],
    ["05", "LLM", "依檢索內容回答", "sparkles"],
    ["06", "引用", "[n] → 原始來源", "link"],
  ];
  return `<ol class="home-rag-flow" aria-label="RAG 執行流程">
    ${steps
      .map(
        ([number, label, detail, iconName]) => `<li class="home-rag-step">
          <span class="home-rag-step-icon">${icon(iconName, 17)}</span>
          <span class="home-rag-step-copy">
            <small>${number}</small>
            <strong>${escapeHtml(label)}</strong>
            <span>${escapeHtml(detail)}</span>
          </span>
        </li>`,
      )
      .join("")}
  </ol>`;
}

function traceMarkup() {
  return `<div class="home-trace">
    <div class="home-trace-row">
      <span class="home-trace-label">判決引用</span>
      <span class="home-trace-path">
        <span class="home-trace-node">回答 [n]</span>${icon("arrowRight", 11)}
        <span class="home-trace-node">案號 · 法院 · 日期</span>${icon(
          "arrowRight",
          11,
        )}
        <span class="home-trace-node">PDF / 原始 Parquet 全文</span>${icon(
          "arrowRight",
          11,
        )}
        <a class="home-trace-node is-link" href="#/data">PostgreSQL</a>
      </span>
    </div>
    <div class="home-trace-row">
      <span class="home-trace-label">法規引用</span>
      <span class="home-trace-path">
        <span class="home-trace-node">回答 [n]</span>${icon("arrowRight", 11)}
        <span class="home-trace-node">法規／命令 · 條號</span>${icon(
          "arrowRight",
          11,
        )}
        <a class="home-trace-node is-link" href="#/data">條文版本與來源</a>${icon(
          "arrowRight",
          11,
        )}
        <a class="home-trace-node is-link" href="https://law.moj.gov.tw/" target="_blank" rel="noopener noreferrer">全國法規資料庫 ${icon(
          "external",
          10,
        )}</a>
      </span>
    </div>
    <p class="home-trace-note">RAG 只根據實際檢索到的法規／命令與判決片段生成回答；沒有有效來源時顯示檢索結果，不以推測補齊。</p>
  </div>`;
}

function stageStatusLabel(status) {
  if (status === "failed") return "失敗";
  if (status === "skipped") return "略過";
  if (status === "running") return "執行中";
  if (status === "pending") return "等待";
  return "完成";
}

function waterfallRowMarkup(stage, index, left, width, share, slowestKey) {
  const statusKey = String(stage.status || "success");
  const skipped = statusKey === "skipped" || statusKey === "pending";
  const duration = Math.max(0, Number(stage.duration_ms) || 0);
  const durationLabel = skipped ? "—" : formatDuration(duration);
  const barTone =
    statusKey === "failed" ? "var(--danger)" : stage.color || "#64748b";
  const stageClass = [
    `is-${statusKey}`,
    statusKey === "failed" ? "is-error" : "",
    skipped ? "is-missing" : "",
    slowestKey && stage.key === slowestKey ? "is-slowest" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const stageId = String(stage.key || `stage-${index}`);
  const details = [
    ["狀態", stageStatusLabel(statusKey), true],
    ["開始", stage.started_at ? formatDateTime(stage.started_at) : "—", true],
    ["結束", stage.finished_at ? formatDateTime(stage.finished_at) : "—", true],
    ["耗時", durationLabel, true],
    ["占整體", pct(share), true],
    ["說明", stage.message || stage.caption || "", false],
  ]
    .map(([label, value, always]) =>
      always || value
        ? `<span class="rag-wf-detail"><span>${escapeHtml(
            label,
          )}</span><strong>${escapeHtml(
            String(value || "—"),
          )}</strong></span>`
        : "",
    )
    .join("");
  const barMarkup = skipped
    ? ""
    : `<span class="rag-wf-bar is-sequential" style="left:${left.toFixed(
        3,
      )}%;width:${width.toFixed(4)}%;top:0;height:12px;--bar-color:${escapeHtml(
        barTone,
      )}" aria-hidden="true"></span>`;
  return `<details class="rag-wf-stage home-wf-stage ${stageClass}${
    HOME_WF_OPEN_STAGES.has(stageId) ? " is-open" : ""
  }" data-home-wf-stage="${escapeHtml(stageId)}"${
    HOME_WF_OPEN_STAGES.has(stageId) ? " open" : ""
  } style="--stage-color:${escapeHtml(stage.color || "#64748b")}">
    <summary class="rag-wf-stage-summary">
      <span class="rag-wf-stage-head">
        <span class="rag-wf-stage-label">
          <i aria-hidden="true"></i>
          <span><strong><span class="home-wf-step">${String(index + 1).padStart(
            2,
            "0",
          )}</span> ${escapeHtml(stage.label || stage.key || "階段")}${
            slowestKey && stage.key === slowestKey
              ? ' <span class="home-wf-slow">最慢</span>'
              : ""
          }</strong>${stage.caption ? `<small>${escapeHtml(stage.caption)}</small>` : ""}</span>
        </span>
        <span class="rag-wf-stage-meta">${escapeHtml(
          durationLabel,
        )} · ${escapeHtml(stageStatusLabel(statusKey))} <span class="rag-wf-chevron">${icon(
          "chevronRight",
          12,
        )}</span></span>
      </span>
      <span class="rag-wf-track" style="height:12px" role="img" aria-label="${escapeHtml(
        `${stage.label || stage.key}：${stageStatusLabel(
          statusKey,
        )}，耗時 ${durationLabel}，占整體 ${pct(share)}`,
      )}">${barMarkup}</span>
    </summary>
    <div class="rag-wf-details">${details}</div>
  </details>`;
}

function waterfallMarkup(data, { loading = false, error = "", clientMs = null } = {}) {
  if (loading) {
    return `<div class="report-card home-wf-loading" aria-live="polite">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${icon(
          "activity",
          14,
        )}首頁即時資料載入 Pipeline</span>
        <span class="home-wf-loading-label">量測中…</span>
      </div>
      <div class="home-wf-loading-body">
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
        <span class="skeleton skeleton-line"></span>
      </div>
    </div>`;
  }
  if (error) {
    return `<div class="report-card home-wf-error" role="status">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${icon(
          "activity",
          14,
        )}首頁即時資料載入 Pipeline</span>
      </div>
      <div class="home-wf-error-body">${icon(
        "alert",
        16,
      )}<span>${escapeHtml(error)}</span></div>
    </div>`;
  }
  const pipeline = data?.pipeline;
  const stages = Array.isArray(pipeline?.stages) ? pipeline.stages : [];
  if (!pipeline || !stages.length) {
    return `<div class="report-card home-wf-error">
      <div class="side-card-head index-runtime-head">
        <span class="side-card-title">${icon(
          "activity",
          14,
        )}首頁即時資料載入 Pipeline</span>
      </div>
      <div class="home-wf-error-body">目前沒有可顯示的階段計時。</div>
    </div>`;
  }
  const serverMs = Math.max(
    0,
    Number(pipeline.total_ms) ||
      stages.reduce((sum, stage) => sum + (Number(stage.duration_ms) || 0), 0),
  );
  const clientTotal = Math.max(0, Number(clientMs) || 0);
  const transportMs = Math.max(0, clientTotal - serverMs);
  const totalForBars = Math.max(
    serverMs,
    stages.reduce((sum, stage) => sum + (Number(stage.duration_ms) || 0), 0),
    1,
  );
  const slowest = stages.reduce(
    (current, stage) =>
      (Number(stage.duration_ms) || 0) > (Number(current?.duration_ms) || 0)
        ? stage
        : current,
    stages[0],
  );
  const minBarPercent = 1.25;
  const slotPercents = stages.map((stage) =>
    String(stage.status || "success") === "skipped"
      ? 0
      : Math.max(
          ((Number(stage.duration_ms) || 0) / totalForBars) * 100,
          minBarPercent,
        ),
  );
  const slotTotal = slotPercents.reduce((sum, value) => sum + value, 0);
  const slotScale = slotTotal > 100 ? 100 / slotTotal : 1;
  let cursor = 0;
  const rows = stages
    .map((stage, index) => {
      const skipped = ["skipped", "pending"].includes(
        String(stage.status || "success"),
      );
      const width = skipped ? 0 : slotPercents[index] * slotScale;
      const left = cursor;
      if (!skipped) cursor += width;
      const share =
        totalForBars > 0
          ? ((Number(stage.duration_ms) || 0) / totalForBars) * 100
          : 0;
      return waterfallRowMarkup(
        stage,
        index,
        left,
        width,
        share,
        slowest?.key,
      );
    })
    .join("");
  const failed = stages.filter((stage) => stage.status === "failed").length;
  return `<section class="report-card status-wf-card home-wf-card" data-home-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${icon(
        "activity",
        14,
      )}首頁即時資料載入 Pipeline</span>
      <span class="home-wf-links">
        <a class="home-wf-link" href="#/status">完整服務 Pipeline ${icon(
          "arrowRight",
          11,
        )}</a>
        <a class="home-wf-link" href="#/performance">RAG Flow ${icon(
          "arrowRight",
          11,
        )}</a>
      </span>
    </div>
    <div class="index-runtime-metrics home-wf-metrics">
      <span class="index-runtime-metric" title="後端 /api/home 從第一個查詢到回應組裝完成的階段總耗時。"><span>階段總耗時</span><strong>${escapeHtml(
        formatDuration(serverMs),
      )}</strong></span>
      <span class="index-runtime-metric" title="瀏覽器從送出請求到收到回應的實際往返時間。"><span>HTTP 往返</span><strong>${escapeHtml(
        clientTotal ? formatDuration(clientTotal) : "—",
      )}</strong></span>
      <span class="index-runtime-metric" title="HTTP 往返扣掉後端階段總耗時後的傳輸與排隊時間。"><span>傳輸／排隊</span><strong>${escapeHtml(
        clientTotal ? formatDuration(transportMs) : "—",
      )}</strong></span>
      <span class="index-runtime-metric" title="本次載入耗時最長的階段，也就是目前最明顯的瓶頸。"><span>最慢階段</span><strong>${escapeHtml(
        `${slowest?.label || "—"} · ${formatDuration(
          slowest?.duration_ms || 0,
        )}`,
      )}</strong></span>
      <span class="index-runtime-metric" title="已完成階段數 / 總階段數。"><span>完成階段</span><strong>${formatNumber(
        stages.length - failed,
      )} / ${formatNumber(stages.length)}${
        failed ? ` · 失敗 ${formatNumber(failed)}` : ""
      }</strong></span>
      <span class="index-runtime-metric" title="本次摘要的產生時間。"><span>更新時間</span><strong>${escapeHtml(
        pipeline.finished_at ? formatDateTime(pipeline.finished_at) : "—",
      )}</strong></span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis"><span>0 ms</span><span>${escapeHtml(
        formatDuration(serverMs),
      )}</span></div>
      <div class="rag-wf-stages">${rows}</div>
      <p class="rag-wf-hint">階段依實際執行順序由左至右接續排列，bar 長度為該階段耗時占比；標示「最慢」的階段即本次載入瓶頸。點擊任一階段可查看開始／結束時間、耗時、占比與說明。</p>
    </div>
  </section>`;
}

function sourceFallbackMarkup(message) {
  return `<div class="home-source-error">${icon(
    "alert",
    16,
  )}<span>${escapeHtml(message)}</span></div>`;
}

function renderInitialMarkup() {
  const tiles = SECTIONS.map(renderSectionTile).join("");
  return `<section class="page home-page" id="home-page">
    <div class="home-hero">
      <div class="home-hero-copy">
        <span class="home-eyebrow">JUDICIAL OPEN DATA · FINANCIAL LAW RAG</span>
        <h1 class="home-title">讓金融法規，<span>回到判決與條文。</span></h1>
        <p class="home-lead">以金融法規清單、現行法規／命令條文與司法院判決全文為基礎。
          Qdrant 找出相似判決，LLM 依實際檢索內容生成附引用編號的回答；每個引用都能回到原始法規、命令或判決。</p>
        <form class="home-ask" id="home-ask-form" autocomplete="off">
          <label class="sr-only" for="home-question">輸入法律問題</label>
          <div class="home-ask-box">
            <textarea class="home-ask-input" id="home-question" name="question" rows="1"
              maxlength="500" placeholder="問一個法律問題，例如：金融消費者保護法如何處理金融消費爭議？"
              aria-describedby="home-ask-help"></textarea>
            <button class="btn btn-primary home-ask-submit" type="submit">
              ${icon("sparkles", 16)}<span>開始檢索</span>
            </button>
          </div>
          <div class="home-ask-help" id="home-ask-help">
            <span><kbd>Enter</kbd> 送出</span>
            <span><kbd>Shift</kbd> + <kbd>Enter</kbd> 換行</span>
            <span>送出後在 RAG 提問中開啟</span>
          </div>
        </form>
        <div class="home-hero-meta">
          <span>${icon("shield", 13)}引用可追溯</span>
          <span>${icon("database", 13)}法規＋命令＋判決</span>
          <span>${icon("activity", 13)}Pipeline waterfall</span>
        </div>
      </div>
      <aside class="home-live-card" id="home-live-card" aria-label="即時資料摘要">
        <div class="home-live-head">
          <span class="home-live-kicker">LIVE DATASET</span>
          <button class="home-live-refresh" type="button" id="home-refresh" aria-label="重新整理首頁即時資料">
            ${icon("refresh", 14)}
          </button>
        </div>
        <div id="home-live-body" aria-live="polite">${liveCardMarkup(
          null,
          { loading: true },
        )}</div>
      </aside>
    </div>

    <section class="home-section home-metrics-section" aria-labelledby="home-metrics-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">LIVE METRICS</span>
          <h2 id="home-metrics-title">重要數據，與其他頁面同步。</h2>
        </div>
        <p>所有數字都來自 PostgreSQL、Qdrant 與最新 manifest；與資料庫、處理總覽與系統狀態頁使用相同定義，不硬編碼。</p>
      </div>
      <div class="processing-summary judgment-stats-cards home-metric-grid">
        <div class="home-metric-group" id="home-judgment-stats">
          ${judgmentStatsCardsMarkup(null, { loading: true })}
        </div>
        <div class="home-metric-group" id="home-law-metrics">
          ${lawMetricsMarkup(null, { loading: true })}
        </div>
      </div>
      <div class="home-metric-strip" id="home-metric-strip">
        ${metricStripMarkup(null, { loading: true })}
      </div>
    </section>

    <section class="home-section home-rag-section" aria-labelledby="home-rag-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">RAG CAPABILITY</span>
          <h2 id="home-rag-title">從問題，到可以驗證的引用。</h2>
        </div>
        <p>判決與法規／命令使用獨立向量索引；必要時以 reranker 重新排序，再交給 LLM 生成回答。</p>
      </div>
      ${ragFlowMarkup()}
      <div class="home-rag-values" id="home-rag-values">
        ${ragValuesMarkup(null, { loading: true })}
      </div>
      ${traceMarkup()}
    </section>

    <section class="home-section home-source-section" aria-labelledby="home-source-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">PROVENANCE</span>
          <h2 id="home-source-title">每一筆資料，都有來源。</h2>
        </div>
        <p>判決來自司法院資料開放平臺，法規／命令來自全國法規資料庫；下載、版本與匯入狀態可在資料處理頁追蹤。</p>
      </div>
      <div class="home-source-grid" id="home-source-grid">
        ${sourceCardMarkup("opendata", null)}
        ${sourceCardMarkup("laws", null)}
      </div>
      <div id="home-laws-slot">
        ${lawsMarkup(null, { loading: true })}
      </div>
    </section>

    <section class="home-section home-wf-section" aria-labelledby="home-wf-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">PIPELINE WATERFALL</span>
          <h2 id="home-wf-title">載入時間花在哪裡，一眼看見。</h2>
        </div>
        <p>下圖是本次 <span class="mono">GET /api/home</span> 的實際階段計時；最慢階段會被標示出來，方便直接定位 bottleneck。</p>
      </div>
      <div id="home-waterfall-slot">
        ${waterfallMarkup(null, { loading: true })}
      </div>
    </section>

    <section class="home-section home-feature-section" aria-labelledby="home-feature-title">
      <div class="home-section-head">
        <div>
          <span class="home-kicker">EXPLORE THE CONSOLE</span>
          <h2 id="home-feature-title">一套系統，從提問走到資料維運。</h2>
        </div>
        <p>每個工作區都連到可驗證的資料來源與模型服務，沒有模擬資料，也不以推測補齊。</p>
      </div>
      <div class="home-tile-grid">${tiles}</div>
    </section>

    <section class="home-trust" aria-label="系統原則">
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("shield", 18)}</span>
        <strong>來源優先</strong>
        <p>回答只根據檢索到的法規、命令與判決片段生成，引用編號可回到原始資料。</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("server", 18)}</span>
        <strong>本機模型</strong>
        <p>透過 llama-server 使用本機或區網模型，模型與主機優先順序都可調整。</p>
      </div>
      <div class="home-trust-item">
        <span class="home-trust-icon">${icon("layers", 18)}</span>
        <strong>版本可追溯</strong>
        <p>法規、判決與向量索引保留版本與更新紀錄，資料變更不會默默消失。</p>
      </div>
    </section>
  </section>`;
}

function updateTileMetrics(root, data) {
  const laws = data?.laws || {};
  const judgments = data?.judgments || {};
  const raw = data?.raw || {};
  const index = data?.rag?.judgment_index || {};
  const metrics = {
    rag: `${formatNumber(index.indexed)} 筆索引`,
    data: `${formatNumber(laws.law_count)} 法規 · ${formatNumber(
      laws.order_count,
    )} 命令`,
    quality: `${formatNumber(raw.raw_total)} 原始判決`,
    processing: `${formatNumber(raw.archive_count)} archive`,
    performance: "Flow · Waterfall",
    status: "10 服務元件",
    tests: "LLM · Reranker",
  };
  root.querySelectorAll("[data-home-tile-metric]").forEach((node) => {
    const key = node.dataset.homeTileMetric;
    if (key && metrics[key]) node.textContent = metrics[key];
  });
}

function applySummary(root, payload, { clientMs = null } = {}) {
  const data = payload?.data || {};
  const generatedAt = payload?.generated_at || "";
  const liveBody = root.querySelector("#home-live-body");
  if (liveBody) {
    liveBody.innerHTML = liveCardMarkup(data, { generatedAt });
  }
  const judgmentStats = root.querySelector("#home-judgment-stats");
  const judgments = data.judgments || {};
  if (judgmentStats) {
    judgmentStats.innerHTML = judgmentStatsCardsMarkup({
      judgment_total: judgments.raw_total,
      financial_total: judgments.financial_total,
      financial_ratio: judgments.financial_ratio,
    });
  }
  const lawMetrics = root.querySelector("#home-law-metrics");
  if (lawMetrics) lawMetrics.innerHTML = lawMetricsMarkup(data);
  const metricStrip = root.querySelector("#home-metric-strip");
  if (metricStrip) metricStrip.innerHTML = metricStripMarkup(data);
  const ragValues = root.querySelector("#home-rag-values");
  if (ragValues) ragValues.innerHTML = ragValuesMarkup(data);
  const sourceGrid = root.querySelector("#home-source-grid");
  if (sourceGrid) {
    sourceGrid.innerHTML = `${sourceCardMarkup(
      "opendata",
      data,
    )}${sourceCardMarkup("laws", data)}`;
  }
  const lawsSlot = root.querySelector("#home-laws-slot");
  if (lawsSlot) {
    const previous = lawsSlot.querySelector("#home-laws");
    const wasOpen = Boolean(previous?.open);
    lawsSlot.innerHTML = lawsMarkup(data);
    const next = lawsSlot.querySelector("#home-laws");
    if (next && wasOpen) next.open = true;
  }
  const waterfallSlot = root.querySelector("#home-waterfall-slot");
  if (waterfallSlot) {
    waterfallSlot.innerHTML = waterfallMarkup(
      { ...data, pipeline: payload?.pipeline },
      { clientMs },
    );
  }
  updateTileMetrics(root, data);
}

function applyError(root, message) {
  const liveBody = root.querySelector("#home-live-body");
  if (liveBody) {
    liveBody.innerHTML = liveCardMarkup(null, { error: message });
  }
  const judgmentStats = root.querySelector("#home-judgment-stats");
  if (judgmentStats) judgmentStats.innerHTML = judgmentStatsCardsMarkup(null);
  const lawMetrics = root.querySelector("#home-law-metrics");
  if (lawMetrics) lawMetrics.innerHTML = lawMetricsMarkup(null);
  const metricStrip = root.querySelector("#home-metric-strip");
  if (metricStrip) {
    metricStrip.innerHTML = metricStripMarkup(null);
  }
  const ragValues = root.querySelector("#home-rag-values");
  if (ragValues) ragValues.innerHTML = ragValuesMarkup(null, { error: message });
  const sourceGrid = root.querySelector("#home-source-grid");
  if (sourceGrid) sourceGrid.innerHTML = sourceFallbackMarkup(message);
  const lawsSlot = root.querySelector("#home-laws-slot");
  if (lawsSlot) lawsSlot.innerHTML = lawsMarkup(null, { error: message });
  const waterfallSlot = root.querySelector("#home-waterfall-slot");
  if (waterfallSlot) waterfallSlot.innerHTML = waterfallMarkup(null, { error: message });
}

export async function render(root, ctx) {
  let disposed = false;
  let loading = false;
  let pending = false;
  let stopStream = null;
  let latestData = null;
  let latestFinancialLaws = null;
  let refreshTimer = null;
  let lastRefreshAt = 0;

  root.innerHTML = renderInitialMarkup();

  const form = root.querySelector("#home-ask-form");
  const input = root.querySelector("#home-question");
  const refreshButton = root.querySelector("#home-refresh");

  const submitQuestion = () => {
    const question = String(input?.value || "").trim().slice(0, 500);
    if (!question) {
      input?.focus();
      return;
    }
    try {
      window.sessionStorage.setItem("judgment.pending_question", question);
    } catch (error) {
      /* session storage is optional; the in-memory fallback is enough */
    }
    window.__judgmentPendingQuestion = question;
    if (ctx && typeof ctx.navigate === "function") ctx.navigate("rag");
    else window.location.hash = "#/rag";
  };

  const resizeInput = () => {
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  };

  const setRefreshing = (busy) => {
    if (!refreshButton) return;
    refreshButton.disabled = busy;
    refreshButton.classList.toggle("is-loading", busy);
    refreshButton.setAttribute("aria-busy", busy ? "true" : "false");
  };

  const loadSummary = async ({ quiet = false } = {}) => {
    if (disposed) return;
    if (loading) {
      pending = true;
      return;
    }
    loading = true;
    lastRefreshAt = Date.now();
    setRefreshing(true);
    if (!quiet) {
      const liveBody = root.querySelector("#home-live-body");
      if (liveBody) liveBody.innerHTML = liveCardMarkup(null, { loading: true });
    }
    const started = performance.now();
    try {
      const payload = await api.homeSummary();
      if (disposed || !root.isConnected) return;
      latestData = payload?.data || null;
      latestFinancialLaws = payload?.data?.financial_laws || null;
      writeLocalCache(HOME_CACHE_KEY, payload);
      applySummary(root, payload, {
        clientMs: Math.round(performance.now() - started),
      });
    } catch (error) {
      if (disposed || !root.isConnected) return;
      applyError(root, error.message || "無法取得首頁即時資料。");
    } finally {
      loading = false;
      setRefreshing(false);
      if (pending && !disposed) {
        pending = false;
        loadSummary({ quiet: true });
      }
    }
  };

  input?.addEventListener("input", resizeInput);
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitQuestion();
  });
  input?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      submitQuestion();
    }
  });

  const scheduleLiveRefresh = () => {
    if (disposed || refreshTimer) return;
    const wait = Math.max(
      0,
      HOME_REFRESH_MIN_INTERVAL - (Date.now() - lastRefreshAt),
    );
    if (wait === 0) {
      loadSummary({ quiet: true });
      return;
    }
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null;
      if (!disposed) loadSummary({ quiet: true });
    }, wait);
  };

  root.addEventListener("click", (event) => {
    if (
      event.target.closest("#home-refresh") ||
      event.target.closest("#home-retry")
    ) {
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      loadSummary();
      return;
    }
    if (event.target.closest("#home-laws-download")) {
      const content =
        latestFinancialLaws?.content ||
        `${(latestFinancialLaws?.laws || []).join("\n")}\n`;
      if (content.trim()) downloadText("金融法規.md", content);
    }
  });

  root.addEventListener(
    "toggle",
    (event) => {
      const details = event.target.closest?.("[data-home-wf-stage]");
      if (!details || !root.contains(details)) return;
      const key = details.dataset.homeWfStage || "";
      if (!key) return;
      if (details.open) HOME_WF_OPEN_STAGES.add(key);
      else HOME_WF_OPEN_STAGES.delete(key);
    },
    true,
  );

  resizeInput();
  input?.focus({ preventScroll: true });

  const cachedSummary = readLocalCache(HOME_CACHE_KEY, 5 * 60 * 1000);
  if (cachedSummary) {
    latestData = cachedSummary?.data || null;
    latestFinancialLaws = cachedSummary?.data?.financial_laws || null;
    applySummary(root, cachedSummary, { clientMs: 0 });
    void loadSummary({ quiet: true });
  } else {
    await loadSummary();
  }

  if (!disposed) {
    try {
      stopStream = subscribeRefresh(
        "processing",
        (_topic, payload) => {
          if (disposed || payload?.initial) return;
          scheduleLiveRefresh();
        },
        { onError: () => {} },
      );
    } catch (error) {
      stopStream = null;
    }
  }

  return () => {
    disposed = true;
    if (refreshTimer) {
      window.clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    if (typeof stopStream === "function") stopStream();
    stopStream = null;
  };
}
