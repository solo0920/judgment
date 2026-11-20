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
      subtitle: "讀取最近一次處理快照，顯示目前索引進度與最近執行紀錄；展示模式不提供啟動、停止或主機管理。",
      badge: "DEMO · PROCESSING",
    })}
    <div id="demo-processing-body"><div class="report-card"><div class="report-head"><div class="report-title">讀取最近一次處理進度…</div></div></div></div>
  </section>`;
  const body = root.querySelector("#demo-processing-body");
  const monthLabel = (value) => {
    const text = String(value || "");
    return /^\d{6}$/.test(text)
      ? `${text.slice(0, 4)}-${text.slice(4)}`
      : text || "—";
  };
  const statusLabel = (status) => {
    const value = String(status || "");
    return {
      running: "執行中",
      success: "完成",
      failed: "失敗",
      stale: "已中止",
      interrupted: "中斷",
      partial: "部分完成",
      no_change: "無變更",
      pending: "待執行",
    }[value] || value || "—";
  };
  const phaseLabel = (phase) => {
    const value = String(phase || "");
    if (value === "embedding") return "E 新 embedding";
    if (value === "reuse") return "R 重用";
    if (value === "mixed") return "R／E 混合";
    return value || "—";
  };
  try {
    const data = await api.demoProcessing();
    const index = data?.index || {};
    const summary = index.summary || {};
    const current = index.current || {};
    const runtime = {
      version_id: index.version_id,
      expected_count: index.expected_count,
      build_mode: index.build_mode,
      copy: index.copy || {},
      summary,
      current,
    };
    const indexed = Number(summary.indexed || 0);
    const expected = Number(summary.total || runtime.expected_count || 0);
    const percent = expected > 0 ? Math.min(100, (100 * indexed) / expected) : 0;
    const activeRuns = Array.isArray(data?.active_runs) ? data.active_runs : [];
    const recentRuns = (Array.isArray(data?.recent_runs)
      ? data.recent_runs
      : []
    ).filter((run) => run.status !== "running");
    const copy = index.copy || {};
    const copyLabel =
      copy.status === "success"
        ? `${formatNumber(copy.copied || 0)} / ${formatNumber(copy.total || 0)} points 完成`
        : copy.status === "running"
          ? `${formatNumber(copy.copied || 0)} / ${formatNumber(copy.total || 0)} points 執行中`
          : copy.status === "skipped"
            ? "本次不需複製"
            : "等待";
    const copyDetail =
      copy.status === "success" && copy.duration_ms
        ? `${copyLabel} · ${formatDuration(copy.duration_ms)}`
        : copyLabel;
    body.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">PROCESSING · LAST SNAPSHOT</div>
          <div class="report-title">目前索引進度</div>
          <div class="report-sub">狀態 ${escapeHtml(data?.status || "—")} · ${escapeHtml(
            data?.mode || "—",
          )} · 快照 ${escapeHtml(formatDateTime(data?.generated_at))}</div>
        </div>
        <span class="badge badge-neutral badge-mono">唯讀</span>
      </div>
      <div class="report-section">
        ${statCards([
          { label: "版本", value: runtime.version_id ? `v${String(runtime.version_id).padStart(3, "0")}` : "—" },
          { label: "已索引", value: `${formatNumber(indexed)} / ${formatNumber(expected)}` },
          { label: "目前月份", value: monthLabel(current.month) },
          { label: "目前階段", value: phaseLabel(current.phase) },
        ])}
        <div class="demo-index-progress">
          <div class="demo-index-progress-head"><span>索引進度</span><strong>${percent.toFixed(1)}%</strong></div>
          ${progressBar(percent, `索引 ${indexed} / ${expected}`)}
          <div class="demo-index-meta">
            <span>R 本次沿用 <strong>${formatNumber(summary.reused || 0)}</strong></span>
            <span>E 新 embedding <strong>${formatNumber(summary.embedded || 0)}</strong></span>
            <span>03 copy <strong>${escapeHtml(copyDetail)}</strong></span>
          </div>
        </div>
        <div class="demo-list">
          ${
            activeRuns.length
              ? activeRuns
                  .map(
                    (run) => `<div class="demo-list-row demo-workflow-row">
                      <span>${escapeHtml(run.title || "執行中")}</span>
                      <strong>${escapeHtml(statusLabel(run.status))}</strong>
                      <small>${escapeHtml(run.current_stage || "—")}</small>
                      <span class="demo-run-message">${escapeHtml(run.message || "")}</span>
                    </div>`,
                  )
                  .join("")
              : `<div class="demo-empty">目前沒有執行中的工作。</div>`
          }
        </div>
      </div>
    </div>
    <div class="report-card demo-recent-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">RECENT RUNS</div>
          <div class="report-title">最近執行紀錄</div>
          <div class="report-sub">只顯示最近完成或中止的工作，不列出所有待執行 workflow。</div>
        </div>
      </div>
      <div class="report-section">
        <div class="demo-list">${recentRuns
          .slice(0, 5)
          .map(
            (run) => `<div class="demo-list-row">
              <span>${escapeHtml(run.title || "工作流程")}</span>
              <strong>${escapeHtml(statusLabel(run.status))}</strong>
              <small>${escapeHtml(formatDateTime(run.started_at))} · ${escapeHtml(
                formatDuration(run.duration_ms || 0),
              )}</small>
            </div>`,
          )
          .join("")}</div>
        <p class="demo-open-hint">資料來源：最近一次處理 snapshot；背景約每 30 秒更新，訪客頁面不需要等待完整掃描。</p>
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
