import { api } from "../api.js";
import { demoLockMarkup, isDemoVisitor } from "../demo.js";
import { createQuestionBankController } from "./question_bank.js";
import {
  downloadText,
  emptyState,
  escapeHtml,
  formatBytes,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  notice,
  setBusy,
  statusBadge,
  toast,
} from "../utils.js";

function percent(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number.toFixed(number >= 10 ? 1 : 2)}%`;
}

function valueOrDash(value) {
  if (value === null || value === undefined) return "—";
  return formatNumber(value);
}

function checkStatus(check) {
  if (!check.count) return statusBadge("success", "通過");
  if (check.severity === "danger") return statusBadge("failed", "需處理");
  if (check.severity === "warn") return statusBadge("warning", "注意");
  return statusBadge("preview", "提示");
}

function checkClass(check) {
  if (!check.count) return "is-ok";
  if (check.severity === "danger") return "is-danger";
  if (check.severity === "warn") return "is-warn";
  return "is-info";
}

function renderCheck(check) {
  const value = Number(check.count) || 0;
  const width = Math.max(0, Math.min(100, Number(check.percent) || 0));
  return `<div class="quality-check ${checkClass(check)}">
    <div class="quality-check-head">
      <span class="quality-check-label">${escapeHtml(check.label)}</span>
      ${checkStatus(check)}
    </div>
    <div class="quality-check-value">
      <strong>${formatNumber(value)}</strong>
      <span>筆</span>
      <em>${escapeHtml(percent(check.percent))}</em>
    </div>
    <div class="quality-check-desc">${escapeHtml(check.description)}</div>
    <div class="quality-check-track" aria-hidden="true">
      <span style="width:${width}%"></span>
    </div>
  </div>`;
}

function renderDistribution(title, note, items) {
  const rows = Array.isArray(items) ? items : [];
  if (!rows.length) {
    return `<div class="index-chart-card">
      <div class="index-chart-head"><span>${escapeHtml(title)}</span><span>${escapeHtml(note)}</span></div>
      <div class="index-chart-empty">DuckDB 掃描後沒有可呈現的資料。</div>
    </div>`;
  }
  const max = Math.max(...rows.map((item) => Number(item.value) || 0), 1);
  return `<div class="index-chart-card">
    <div class="index-chart-head"><span>${escapeHtml(title)}</span><span>${escapeHtml(note)}</span></div>
    <div class="distribution">
      ${rows
        .map((item) => {
          const value = Number(item.value) || 0;
          const width = Math.max(1.5, (value / max) * 100);
          return `<div class="dist-row">
            <span class="dist-label" title="${escapeHtml(item.label || "未分類")}">${escapeHtml(
              item.label || "未分類",
            )}</span>
            <span class="dist-track"><span class="dist-bar" style="width:${width.toFixed(
              2,
            )}%"></span></span>
            <span class="dist-value">${formatNumber(value)}</span>
          </div>`;
        })
        .join("")}
    </div>
  </div>`;
}

function renderCoverage(data) {
  const coverage = data.coverage || {};
  const totals = data.totals || {};
  const source = data.source || {};
  const matchedUnique = Number(
    totals.matched_unique_jids ?? totals.matched_rows ?? 0,
  );
  const matchedRows = Number(totals.matched_rows ?? matchedUnique);
  const matchedDuplicates = Math.max(0, matchedRows - matchedUnique);
  const pgDiff = coverage.postgres_diff;
  const pgFoot =
    pgDiff === null || pgDiff === undefined
      ? "—"
      : pgDiff === 0
        ? "與原始精確命中（去重 JID）一致"
        : `與原始精確命中（去重 JID）相差 ${formatNumber(
            Math.abs(pgDiff),
          )} 筆`;
  const vectorFoot =
    coverage.vector_indexed === null || coverage.vector_indexed === undefined
      ? coverage.detail || "無法取得索引統計"
      : `${formatNumber(coverage.vector_indexed)} / ${formatNumber(
          coverage.vector_total,
        )} · ${coverage.model || "—"}`;
  return `<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${icon("filter", 13)}<span>原始精確命中（去重 JID）</span></div>
      <div class="metric-value">${formatNumber(matchedUnique)}</div>
      <div class="metric-foot">citation_count &gt; 0；含重複 ${formatNumber(
        matchedRows,
      )} 筆${matchedDuplicates ? `，重複 ${formatNumber(matchedDuplicates)} 筆` : ""}；共 ${formatNumber(
        totals.citation_total,
      )} 筆引用</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${icon("database", 13)}<span>PostgreSQL 收錄</span></div>
      <div class="metric-value">${valueOrDash(coverage.postgres_judgments)}</div>
      <div class="metric-foot">${escapeHtml(pgFoot)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${icon("brain", 13)}<span>向量索引</span></div>
      <div class="metric-value">${escapeHtml(percent(coverage.vector_coverage_pct))}</div>
      <div class="metric-foot">${escapeHtml(vectorFoot)}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">${icon("layers", 13)}<span>DuckDB 候選</span></div>
      <div class="metric-value">${valueOrDash(source.candidate_total)}</div>
      <div class="metric-foot">${formatNumber(
        source.candidate_archive_count,
      )} / ${formatNumber(source.archive_count)} 個 manifest 有 candidate_count</div>
    </div>
  </div>`;
}

function renderArchiveTable(archives) {
  if (!archives.length) {
    return emptyState({
      iconName: "table",
      title: "沒有原始 Parquet 檔案",
      text: "完成判決 RAR 匯入後，這裡會顯示每個壓縮檔的 DuckDB 統計。",
    });
  }
  return `<div class="table-wrap">
    <table class="data-table is-compact quality-archive-table">
      <thead>
        <tr>
          <th scope="col">壓縮檔</th>
          <th scope="col" class="cell-number">筆數</th>
          <th scope="col" class="cell-number">候選</th>
          <th scope="col" class="cell-number">精確命中 JID</th>
          <th scope="col" class="cell-number">命中率</th>
          <th scope="col" class="cell-number">過短</th>
          <th scope="col" class="cell-number" title="缺少法院、正規化法院、裁判日期或案由的欄位次數">缺中繼</th>
          <th scope="col" class="cell-number">重複內容</th>
          <th scope="col">日期範圍</th>
        </tr>
      </thead>
      <tbody>
        ${archives
          .map((item) => {
            const missingMeta =
              (Number(item.missing_court_rows) || 0) +
              (Number(item.missing_normalized_rows) || 0) +
              (Number(item.missing_date_rows) || 0) +
              (Number(item.invalid_date_rows) || 0) +
              (Number(item.missing_title_rows) || 0);
            const candidate =
              item.candidate_count === null || item.candidate_count === undefined
                ? "—"
                : formatNumber(item.candidate_count);
            return `<tr>
              <td class="cell-jid">
                <span class="mono">${escapeHtml(item.archive || "—")}</span>
                ${item.version ? `<span class="chip">v${escapeHtml(item.version)}</span>` : ""}
              </td>
              <td class="cell-number">${formatNumber(item.rows)}</td>
              <td class="cell-number">${candidate}</td>
              <td class="cell-number">${formatNumber(
                item.matched_unique_jids ?? item.matched_rows,
              )}</td>
              <td class="cell-number">${escapeHtml(percent(item.match_rate))}</td>
              <td class="cell-number">${formatNumber(item.short_text_rows)}</td>
              <td class="cell-number">${formatNumber(missingMeta)}</td>
              <td class="cell-number">${formatNumber(item.duplicate_content_rows)}</td>
              <td class="cell-date">${escapeHtml(formatDate(item.date_min))} – ${escapeHtml(
                formatDate(item.date_max),
              )}</td>
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderQualityReport(data) {
  const totals = data.totals || {};
  const matchedUnique = Number(
    totals.matched_unique_jids ?? totals.matched_rows ?? 0,
  );
  const source = data.source || {};
  const checks = Array.isArray(data.checks) ? data.checks : [];
  const summary = data.summary || {};
  const distributions = data.distributions || {};
  const warnings = Array.isArray(data.warnings) ? data.warnings : [];
  const bytes = formatBytes(source.compressed_bytes || 0);
  return `<div class="report-card quality-report" data-database="quality">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">DUCKDB DATA QUALITY</div>
        <div class="report-title">
          原始 Parquet 資料品質 ${statusBadge(data.status || "operational")}
          <span class="chip">raw.parquet</span>
        </div>
        <div class="report-sub">
          ${formatNumber(totals.rows)} 筆 · ${formatNumber(source.raw_files)} 個檔案 ·
          ${bytes} · 掃描 ${formatDuration(data.scan_ms || 0)} ·
          ${escapeHtml(formatDateTime(data.generated_at))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-quality">
          ${icon("download", 14)}<span>JSON</span>
        </button>
      </div>
    </div>
    ${
      warnings.length
        ? `<div class="report-alert">${notice({
            tone: "warn",
            title: "目前限制與差異",
            text: warnings.map((item) => escapeHtml(item)).join("<br>"),
          })}</div>`
        : ""
    }
    <div class="summary-strip quality-summary-strip">
      <div class="summary-item">
        <div class="summary-label">原始筆數</div>
        <div class="summary-value">${formatNumber(totals.rows)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">精確命中（去重）</div>
        <div class="summary-value">${formatNumber(matchedUnique)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">命中率</div>
        <div class="summary-value">${escapeHtml(percent(totals.match_rate))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">重複案號</div>
        <div class="summary-value">${formatNumber(totals.duplicate_jid_rows)}</div>
      </div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">品質檢查</span>
        <span class="muted" style="font-size:9.5px">
          ${formatNumber(summary.ok_count)} 項通過 ·
          ${formatNumber(summary.warning_count)} 項注意 ·
          ${formatNumber(summary.danger_count)} 項需處理 ·
          ${formatNumber(summary.info_count)} 項提示
        </span>
      </div>
      <div class="quality-checks">${checks.map(renderCheck).join("")}</div>
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">收錄覆蓋</span>
        <span class="muted" style="font-size:9.5px">PostgreSQL 與向量索引為即時查詢，不是從 Parquet 推估</span>
      </div>
      ${renderCoverage(data)}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">檔案明細</span>
        <span class="muted" style="font-size:9.5px">${formatNumber(
          source.archive_count,
        )} 個原始 Parquet</span>
      </div>
      ${renderArchiveTable(Array.isArray(data.archives) ? data.archives : [])}
    </div>
    <div class="report-section quality-section">
      <div class="report-section-head">
        <span class="report-section-title">分布統計</span>
        <span class="muted" style="font-size:9.5px">DuckDB group by / unnest</span>
      </div>
      <div class="quality-dist-grid">
        ${renderDistribution("法院", "判決筆數", distributions.courts)}
        ${renderDistribution("裁判年份", "判決筆數", distributions.years)}
        ${renderDistribution("熱門法規", "提及判決數", distributions.laws)}
        ${renderDistribution("熱門案由", "判決筆數", distributions.titles)}
      </div>
    </div>
  </div>`;
}

export async function render(root) {
  const demoReadOnly = isDemoVisitor();
  const cacheKey = `judgment.quality.snapshot.${
    demoReadOnly ? "visitor" : "admin"
  }`;
  const readCachedSnapshot = () => {
    try {
      const cached = JSON.parse(
        window.localStorage.getItem(cacheKey) || "null",
      );
      if (!cached?.snapshot) return null;
      if (Date.now() - Number(cached.saved_at || 0) > 10 * 60 * 1000) {
        return null;
      }
      return cached.snapshot;
    } catch (error) {
      return null;
    }
  };
  const saveCachedSnapshot = (snapshot) => {
    if (!snapshot) return;
    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify({ snapshot, saved_at: Date.now() }),
      );
    } catch (error) {
      /* cache is best effort */
    }
  };
  root.innerHTML = `<section class="page data-page quality-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA QUALITY · ITEM REVIEW</div>
        <div class="data-title-line">
          <h1 class="page-title">資料品質</h1>
          <p class="page-subtitle data-page-subtitle">
            以五項題目評比為核心，整合原始 Parquet 掃描、題庫版本、人工驗收與 Benchmark 題庫；每個題目都使用同一套評分與狀態規格。
          </p>
        </div>
      </div>
      <div class="page-actions">
        ${demoReadOnly ? `<span class="badge badge-neutral badge-mono">展示模式 · 唯讀</span>` : ""}
        <span class="badge badge-neutral badge-mono" id="quality-meta">DUCKDB · 讀取中</span>
        <button class="btn btn-secondary" type="button" id="quality-refresh">
          ${icon("refresh", 15)}<span>${demoReadOnly ? "重新整理" : "重新掃描"}</span>
        </button>
      </div>
    </div>

    <div class="quality-rubric-panel" aria-label="五項題目評比標準">
      <div class="quality-rubric-head">
        <div>
          <div class="eyebrow">5-POINT ITEM REVIEW</div>
          <strong>五項題目評比</strong>
          <p>題庫、人工驗收與 Benchmark 共用同一套五項評分；每項 1–5 分。</p>
        </div>
        <span class="badge badge-neutral badge-mono" id="quality-rubric-counts">尚無評比</span>
      </div>
      <div class="quality-rubric-grid">
        ${[
          ["clarity", "題目清晰"],
          ["labels", "法條標注"],
          ["answer", "參考答案"],
          ["difficulty", "難度與標籤"],
          ["overall", "整體"],
        ].map(([key, label]) => `<div class="quality-rubric-item">
          <span>${label}</span>
          <strong id="quality-rubric-${key}">—</strong>
          <small>/ 5</small>
        </div>`).join("")}
      </div>
    </div>

    <nav class="quality-step-nav" aria-label="資料品質工作流程">
      <button class="quality-step is-active" type="button" data-quality-tab="overview" aria-current="page">
        <span class="quality-step-index">01</span>
        <span class="quality-step-copy"><strong>品質總覽</strong><small>原始資料、覆蓋率與五項評比</small></span>
        <span class="badge badge-neutral" id="quality-badge-overview">—</span>
      </button>
      <button class="quality-step" type="button" data-quality-tab="bank">
        <span class="quality-step-index">02</span>
        <span class="quality-step-copy"><strong>題庫工作台</strong><small>新增、編輯、版本與標籤</small></span>
        <span class="badge badge-neutral" id="quality-badge-bank">—</span>
      </button>
      <button class="quality-step" type="button" data-quality-tab="review">
        <span class="quality-step-index">03</span>
        <span class="quality-step-copy"><strong>人工驗收</strong><small>逐題五項評分、批注與核准</small></span>
        <span class="badge badge-warn" id="quality-badge-review">—</span>
      </button>
      <button class="quality-step" type="button" data-quality-tab="suite">
        <span class="quality-step-index">04</span>
        <span class="quality-step-copy"><strong>Benchmark 題庫</strong><small>凍結 suite 與可評測題目</small></span>
        <span class="badge badge-neutral" id="quality-badge-suite">—</span>
      </button>
    </nav>

    <div class="quality-subview-bar" id="quality-subview-bar" hidden>
      <button class="btn btn-ghost btn-sm" type="button" id="quality-back-to-bank">← 返回題庫</button>
      <span>新增／編輯題目</span>
    </div>

    <section class="quality-workspace">
      <div id="quality-panel-overview">
        <div id="quality-content">${`<div class="report-card">
          <div class="report-head">
            <div class="report-title-group">
              <div class="report-kicker">DUCKDB DATA QUALITY</div>
              <div class="report-title">讀取原始 Parquet 統計</div>
              <div class="report-sub">正在掃描最新 manifest 與查詢欄位…</div>
            </div>
            <span class="spinner" aria-hidden="true"></span>
          </div>
          <div class="report-loading">
            <div class="skeleton skeleton-line" style="width:92%"></div>
            <div class="skeleton skeleton-line" style="width:84%"></div>
            <div class="skeleton skeleton-line" style="width:68%;margin-bottom:0"></div>
          </div>
        </div>`}</div>
      </div>
      <div id="quality-panel-question-create" hidden></div>
      <div id="quality-panel-question-manage" hidden></div>
      <div id="quality-panel-benchmark-bank" hidden></div>
      <div id="quality-panel-question-review" hidden></div>
    </section>
  </section>`;

  const content = root.querySelector("#quality-content");
  const refresh = root.querySelector("#quality-refresh");
  const meta = root.querySelector("#quality-meta");
  const tabs = [...root.querySelectorAll("[data-quality-tab]")];
  const panels = {
    overview: root.querySelector("#quality-panel-overview"),
    create: root.querySelector("#quality-panel-question-create"),
    manage: root.querySelector("#quality-panel-question-manage"),
    suite: root.querySelector("#quality-panel-benchmark-bank"),
    review: root.querySelector("#quality-panel-question-review"),
  };
  let current = null;
  let activeTab = "overview";

  const paint = () => {
    if (!current) return;
    content.innerHTML = renderQualityReport(current);
    meta.textContent = `DUCKDB · ${formatNumber(current.totals?.rows)} 筆 · ${formatDuration(
      current.scan_ms || 0,
    )}`;
    const badge = root.querySelector("#quality-badge-overview");
    if (badge) badge.textContent = formatNumber(current.totals?.rows || 0);
  };

  const STEP_BY_PANEL = {
    overview: "overview",
    create: "bank",
    manage: "bank",
    review: "review",
    suite: "suite",
  };
  const PANEL_BY_STEP = {
    overview: "overview",
    bank: "manage",
    review: "review",
    suite: "suite",
  };
  const STEP_META = {
    bank: "題庫工作台 · 5 分項目評比",
    review: "人工驗收 · 5 分項目評比",
    suite: "Benchmark 題庫 · 5 分項目評比",
  };

  const syncTab = (panelName) => {
    const nextPanel = panels[panelName] ? panelName : "overview";
    activeTab = nextPanel;
    const step = STEP_BY_PANEL[nextPanel] || "overview";
    for (const button of tabs) {
      const active = button.dataset.qualityTab === step;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    }
    for (const [name, panel] of Object.entries(panels)) {
      if (panel) panel.hidden = name !== nextPanel;
    }
    const subview = root.querySelector("#quality-subview-bar");
    if (subview) subview.hidden = nextPanel !== "create";
    if (nextPanel === "overview") {
      if (current) paint();
    } else {
      meta.textContent = STEP_META[step] || "QUESTION BANK · 題庫工作區";
    }
  };

  const controller = createQuestionBankController(root, {
    onNavigate: (panelName) => syncTab(panelName),
    onStats: (stats) => {
      const values = stats || {};
      const bankBadge = root.querySelector("#quality-badge-bank");
      const suiteBadge = root.querySelector("#quality-badge-suite");
      const reviewBadge = root.querySelector("#quality-badge-review");
      if (bankBadge) bankBadge.textContent = formatNumber(values.total || 0);
      if (suiteBadge) {
        suiteBadge.textContent = formatNumber(values.benchmark_ready || 0);
      }
      const pending =
        Number(values.pending_review || 0) +
        Number(values.changes_requested || 0);
      if (reviewBadge) reviewBadge.textContent = formatNumber(pending);
      const rubric = values.rubric_scores || {};
      for (const key of ["clarity", "labels", "answer", "difficulty", "overall"]) {
        const element = root.querySelector(`#quality-rubric-${key}`);
        if (!element) continue;
        const value = rubric[key];
        element.textContent =
          value === null || value === undefined || value === ""
            ? "—"
            : Number(value).toFixed(1);
      }
      const counts = root.querySelector("#quality-rubric-counts");
      if (counts) {
        const reviewed = Number(values.rubric_review_count || 0);
        counts.textContent =
          reviewed > 0
            ? `${formatNumber(reviewed)} 次評比 · ${formatNumber(pending)} 待驗收`
            : "尚無評比";
      }
    },
  });

  root
    .querySelector("#quality-back-to-bank")
    ?.addEventListener("click", () => {
      syncTab("manage");
      controller.show("manage");
    });

  const activate = (step) => {
    const panelName = PANEL_BY_STEP[step] || "overview";
    syncTab(panelName);
    if (panelName === "overview") return;
    if (demoReadOnly) {
      const target = panels[panelName];
      if (target) {
        target.innerHTML = demoLockMarkup(
          "題庫管理需要管理者權限",
          "展示模式可瀏覽完整的資料品質總覽；題庫工作台、Benchmark 與人工驗收由管理者操作。",
        );
      }
      return;
    }
    controller.show(panelName);
  };

  const load = async ({ cached = false } = {}) => {
    setBusy(refresh, true, cached ? "整理中…" : "掃描中…");
    try {
      current = await api.quality({ cached });
      saveCachedSnapshot(current);
      paint();
    } catch (error) {
      content.innerHTML = `<div class="report-card">
        <div class="report-head">
          <div class="report-title-group">
            <div class="report-kicker">DUCKDB DATA QUALITY</div>
            <div class="report-title">資料品質掃描失敗</div>
            <div class="report-sub">請求未完成，沒有顯示任何推測資料。</div>
          </div>
        </div>
        <div class="report-section">
          ${notice({
            tone: "danger",
            title: "無法取得資料品質統計",
            text: escapeHtml(error.message || "請稍後再試。"),
          })}
        </div>
      </div>`;
      meta.textContent = "DUCKDB · 讀取失敗";
      toast("資料品質掃描失敗，請稍後再試。", "danger");
    } finally {
      setBusy(refresh, false);
    }
  };

  const onRefresh = async () => {
    if (activeTab === "overview") await load();
    else await controller.refresh();
  };

  refresh.addEventListener("click", onRefresh);
  root.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-quality-tab]");
    if (!tabButton) return;
    activate(tabButton.dataset.qualityTab || "overview");
  });
  content.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='export-quality']");
    if (!button || !current) return;
    downloadText(
      `judgment-quality-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(current, null, 2),
      "application/json;charset=utf-8",
    );
  });

  syncTab("overview");
  const cachedSnapshot = readCachedSnapshot();
  if (cachedSnapshot) {
    current = cachedSnapshot;
    paint();
  }
  if (demoReadOnly) {
    for (const button of tabs) {
      if (button.dataset.qualityTab === "overview") continue;
      button.classList.add("is-demo-locked");
      button.removeAttribute("title");
      button.dataset.demoLockTooltip = "展示模式不提供題庫管理";
      const badge = button.querySelector(".badge");
      if (badge) badge.textContent = "LOCK";
    }
  }
  await load({ cached: true });
}
