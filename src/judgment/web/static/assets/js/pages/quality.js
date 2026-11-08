import { api } from "../api.js";
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
  const pgDiff = coverage.postgres_diff;
  const pgFoot =
    pgDiff === null || pgDiff === undefined
      ? "—"
      : pgDiff === 0
        ? "與原始精確命中一致"
        : `與原始精確命中相差 ${formatNumber(Math.abs(pgDiff))} 筆`;
  const vectorFoot =
    coverage.vector_indexed === null || coverage.vector_indexed === undefined
      ? coverage.detail || "無法取得索引統計"
      : `${formatNumber(coverage.vector_indexed)} / ${formatNumber(
          coverage.vector_total,
        )} · ${coverage.model || "—"}`;
  return `<div class="metric-grid quality-coverage-grid">
    <div class="metric-card">
      <div class="metric-label">${icon("filter", 13)}<span>原始精確命中</span></div>
      <div class="metric-value">${formatNumber(totals.matched_rows)}</div>
      <div class="metric-foot">citation_count &gt; 0；共 ${formatNumber(
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
          <th scope="col" class="cell-number">精確命中</th>
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
              <td class="cell-number">${formatNumber(item.matched_rows)}</td>
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
        <div class="summary-label">精確命中</div>
        <div class="summary-value">${formatNumber(totals.matched_rows)}</div>
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
  root.innerHTML = `<section class="page data-page quality-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA QUALITY</div>
        <div class="data-title-line">
          <h1 class="page-title">資料品質</h1>
          <p class="page-subtitle data-page-subtitle">
            DuckDB 直接掃描原始判決 Parquet，檢查案號、全文、中繼資料、引用一致性與 archive 統計；數值不足時顯示「—」，不以推測補齊。
          </p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="quality-meta">DUCKDB · 讀取中</span>
        <button class="btn btn-secondary" type="button" id="quality-refresh">
          ${icon("refresh", 15)}<span>重新掃描</span>
        </button>
      </div>
    </div>
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
  </section>`;

  const content = root.querySelector("#quality-content");
  const refresh = root.querySelector("#quality-refresh");
  const meta = root.querySelector("#quality-meta");
  let current = null;

  const paint = () => {
    if (!current) return;
    content.innerHTML = renderQualityReport(current);
    meta.textContent = `DUCKDB · ${formatNumber(current.totals?.rows)} 筆 · ${formatDuration(
      current.scan_ms || 0,
    )}`;
  };

  const load = async () => {
    setBusy(refresh, true, "掃描中…");
    try {
      current = await api.quality();
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

  refresh.addEventListener("click", load);
  content.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='export-quality']");
    if (!button || !current) return;
    downloadText(
      `judgment-quality-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(current, null, 2),
      "application/json;charset=utf-8",
    );
  });

  await load();
}
