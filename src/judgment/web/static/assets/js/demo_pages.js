import { api } from "./api.js";
import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  notice,
} from "./utils.js";

function pageHeader({ kicker, title, subtitle, badge = "" }) {
  return `<div class="page-header">
    <div class="data-page-heading">
      <div class="eyebrow">${escapeHtml(kicker)}</div>
      <div class="data-title-line">
        <h1 class="page-title">${escapeHtml(title)}</h1>
        <p class="page-subtitle data-page-subtitle">${escapeHtml(subtitle)}</p>
      </div>
    </div>
    <div class="page-actions">
      <span class="badge badge-neutral badge-mono">${escapeHtml(badge || "DEMO · 唯讀")}</span>
    </div>
  </div>`;
}

function errorCard(error, title = "讀取失敗") {
  return `<div class="report-card"><div class="report-head">
    <div class="report-title-group">
      <div class="report-kicker">DEMO READ ONLY</div>
      <div class="report-title">${escapeHtml(title)}</div>
      <div class="report-sub">沒有顯示任何推測資料。</div>
    </div>
  </div><div class="report-section">
    ${notice({
      tone: "danger",
      title: "無法取得資料",
      text: escapeHtml(error?.message || "請稍後再試。"),
    })}
  </div></div>`;
}

function statCards(items) {
  return `<div class="summary-strip demo-summary-strip">${items
    .map(
      (item) => `<div class="summary-item">
        <span class="summary-label">${escapeHtml(item.label)}</span>
        <strong class="summary-value">${escapeHtml(item.value)}</strong>
      </div>`,
    )
    .join("")}</div>`;
}

function progressBar(percent, label = "") {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="demo-progress" title="${escapeHtml(label || `${value}%`)}">
    <span style="width:${value.toFixed(1)}%"></span>
  </div>`;
}

export async function renderDemoQuality(root) {
  root.innerHTML = `<section class="page data-page quality-page">
    ${pageHeader({
      kicker: "DATA QUALITY",
      title: "資料品質",
      subtitle: "司法院 opendata 的判決、法規與 archive 統計；展示模式為唯讀。",
      badge: "DEMO · QUALITY",
    })}
    <div id="demo-quality-body"><div class="report-card"><div class="report-head"><div class="report-title">讀取資料品質統計…</div></div></div></div>
  </section>`;
  const body = root.querySelector("#demo-quality-body");
  try {
    const data = await api.quality();
    const totals = data?.totals || {};
    const checks = Array.isArray(data?.checks) ? data.checks : [];
    const archives = Array.isArray(data?.archives) ? data.archives : [];
    body.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DUCKDB · OPENDATA</div>
          <div class="report-title">資料品質總覽</div>
          <div class="report-sub">掃描 ${formatNumber(totals.rows || 0)} 筆 · ${formatDuration(data?.scan_ms || 0)}</div>
        </div>
      </div>
      <div class="report-section">
        ${statCards([
          { label: "判決筆數", value: formatNumber(totals.rows || 0) },
          { label: "Archive", value: formatNumber(archives.length) },
          { label: "檢查項目", value: formatNumber(checks.length) },
          { label: "掃描耗時", value: formatDuration(data?.scan_ms || 0) },
        ])}
        <div class="demo-list">${checks
          .slice(0, 20)
          .map(
            (check) => `<div class="demo-list-row">
              <span>${escapeHtml(check.label || check.key || "檢查")}</span>
              <strong>${escapeHtml(check.value ?? "—")}</strong>
              <small>${escapeHtml(check.note || check.status || "")}</small>
            </div>`,
          )
          .join("")}</div>
      </div>
    </div>`;
  } catch (error) {
    body.innerHTML = errorCard(error, "資料品質讀取失敗");
  }
}

export async function renderDemoPerformance(root) {
  root.innerHTML = `<section class="page data-page performance-page">
    ${pageHeader({
      kicker: "PERFORMANCE",
      title: "效能報表",
      subtitle: "已產生的 RAG、索引與 API 執行紀錄；展示模式不提供重新計算或匯出。",
      badge: "DEMO · PERFORMANCE",
    })}
    <div id="demo-performance-body"><div class="report-card"><div class="report-head"><div class="report-title">讀取效能報表…</div></div></div></div>
  </section>`;
  const body = root.querySelector("#demo-performance-body");
  try {
    const data = await api.performance({}, 1, 25);
    const summary = Array.isArray(data?.summary) ? data.summary : [];
    const distribution = Array.isArray(data?.distribution)
      ? data.distribution
      : [];
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    body.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">POSTGRESQL · PERFORMANCE</div>
          <div class="report-title">效能總覽</div>
          <div class="report-sub">共 ${formatNumber(data?.total || 0)} 筆紀錄 · 第 ${formatNumber(data?.page || 1)} 頁</div>
        </div>
      </div>
      <div class="report-section">
        ${statCards(
          summary.slice(0, 6).map((item) => ({
            label: item.label || "指標",
            value: item.value ?? "—",
          })),
        )}
        <div class="demo-split">
          <div class="demo-list">${distribution
            .slice(0, 12)
            .map(
              (item) => `<div class="demo-list-row">
                <span>${escapeHtml(item.label || "—")}</span>
                <strong>${escapeHtml(item.value ?? "—")}</strong>
              </div>`,
            )
            .join("")}</div>
          <div class="demo-table-wrap">
            <table class="data-table demo-table">
              <thead><tr><th>開始</th><th>程序</th><th>狀態</th><th>耗時</th></tr></thead>
              <tbody>${rows
                .slice(0, 12)
                .map(
                  (row) => `<tr>
                    <td>${escapeHtml(formatDateTime(row.started_at))}</td>
                    <td>${escapeHtml(row.process || row.module || "—")}</td>
                    <td>${escapeHtml(row.status || "—")}</td>
                    <td>${escapeHtml(formatDuration(row.duration_ms || 0))}</td>
                  </tr>`,
                )
                .join("")}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
  } catch (error) {
    body.innerHTML = errorCard(error, "效能報表讀取失敗");
  }
}

export async function renderDemoProcessing(root) {
  root.innerHTML = `<section class="page processing-page">
    ${pageHeader({
      kicker: "DATA PIPELINE",
      title: "資料處理",
      subtitle: "判決、法規與命令的公開處理進度；展示模式不提供啟動、停止或主機管理。",
      badge: "DEMO · PROCESSING",
    })}
    <div id="demo-processing-body"><div class="report-card"><div class="report-head"><div class="report-title">讀取處理進度…</div></div></div></div>
  </section>`;
  const body = root.querySelector("#demo-processing-body");
  try {
    const data = await api.processing();
    const workflows = Array.isArray(data?.workflows) ? data.workflows : [];
    const activeRuns = Array.isArray(data?.active_runs) ? data.active_runs : [];
    const timeline = data?.import_timeline || {};
    body.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">PROCESSING · OPENDATA</div>
          <div class="report-title">處理進度摘要</div>
          <div class="report-sub">狀態 ${escapeHtml(data?.status || "—")} · ${escapeHtml(data?.mode || "—")}</div>
        </div>
      </div>
      <div class="report-section">
        ${statCards([
          { label: "Workflow", value: formatNumber(workflows.length) },
          { label: "執行中", value: formatNumber(activeRuns.length) },
          { label: "目前月份", value: timeline.active_month || "—" },
          { label: "目前階段", value: timeline.active_phase || "—" },
        ])}
        <div class="demo-list">${workflows
          .slice(0, 10)
          .map((workflow) => {
            const progress = workflow.progress || {};
            const percent = Number(progress.percent || 0);
            return `<div class="demo-list-row demo-workflow-row">
              <span>${escapeHtml(workflow.label || workflow.id || "Workflow")}</span>
              <strong>${escapeHtml(progress.message || workflow.last_run?.status || "待執行")}</strong>
              <small>${percent ? `${percent.toFixed(1)}%` : ""}</small>
              ${progressBar(percent, workflow.label || "")}
            </div>`;
          })
          .join("")}</div>
      </div>
    </div>`;
  } catch (error) {
    body.innerHTML = errorCard(error, "處理進度讀取失敗");
  }
}

export async function renderDemoStatus(root) {
  root.innerHTML = `<section class="page data-page">
    ${pageHeader({
      kicker: "SERVICE STATUS",
      title: "系統狀態",
      subtitle: "公開服務與 opendata 統計摘要；展示模式不顯示主機、模型或管理設定。",
      badge: "DEMO · STATUS",
    })}
    <div id="demo-status-body"><div class="report-card"><div class="report-head"><div class="report-title">讀取服務狀態…</div></div></div></div>
  </section>`;
  const body = root.querySelector("#demo-status-body");
  try {
    const data = await api.status();
    const services = Array.isArray(data?.services) ? data.services : [];
    const stats = data?.data || {};
    body.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">FASTAPI · SERVICES</div>
          <div class="report-title">服務摘要</div>
          <div class="report-sub">狀態 ${escapeHtml(data?.status || "—")} · 檢查時間 ${escapeHtml(formatDateTime(data?.checked_at))}</div>
        </div>
      </div>
      <div class="report-section">
        ${statCards([
          { label: "法規", value: formatNumber(stats.law_count || 0) },
          { label: "命令", value: formatNumber(stats.order_count || 0) },
          { label: "判決", value: formatNumber(stats.judgment_count || 0) },
          { label: "索引筆數", value: formatNumber(stats.judgment_indexed_count || 0) },
        ])}
        <div class="demo-list">${services
          .map(
            (service) => `<div class="demo-list-row">
              <span>${escapeHtml(service.name || service.id || "服務")}</span>
              <strong class="demo-status-${escapeHtml(service.status || "unknown")}">${escapeHtml(service.status || "—")}</strong>
              <small>${service.latency_ms == null ? "" : `${formatNumber(service.latency_ms)} ms`}</small>
            </div>`,
          )
          .join("")}</div>
      </div>
    </div>`;
  } catch (error) {
    body.innerHTML = errorCard(error, "服務狀態讀取失敗");
  }
}
