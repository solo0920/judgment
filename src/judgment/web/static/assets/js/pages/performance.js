import { api } from "../api.js";
import {
  copyText,
  downloadText,
  emptyState,
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  setBusy,
  statusBadge,
  toast,
} from "../utils.js";
import {
  exportCsv,
  exportableResult,
  reportError,
  reportLoading,
} from "./data.js";

const PAGE_SIZES = [10, 25, 50, 100];
const SORT_OPTIONS = [
  { value: "started_at:desc", label: "Timestamp 新 → 舊" },
  { value: "started_at:asc", label: "Timestamp 舊 → 新" },
  { value: "duration_ms:desc", label: "耗時多 → 少" },
  { value: "duration_ms:asc", label: "耗時少 → 多" },
];

function defaultFilters() {
  return {
    process: "",
    module: "",
    status: "",
    method: "",
    model: "",
    keyword: "",
    from_date: "",
    to_date: "",
    min_duration: "",
    sort: "started_at:desc",
  };
}

function option(value, label = value) {
  return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
}

function selectField(name, label, options, value, help = "") {
  return `<div class="field">
    <label class="field-label" for="performance-${name}">
      <span>${escapeHtml(label)}</span>
      <span class="field-tag">${escapeHtml(name)}</span>
    </label>
    <select class="select" id="performance-${name}" name="${escapeHtml(name)}">
      ${option("", "全部")}
      ${options
        .map(
          (item) =>
            `<option value="${escapeHtml(item)}" ${
              String(item) === String(value) ? "selected" : ""
            }>${escapeHtml(item)}</option>`,
        )
        .join("")}
    </select>
    ${help ? `<span class="field-help">${escapeHtml(help)}</span>` : ""}
  </div>`;
}

function renderFilterFields(options, filters) {
  const sortOptions = SORT_OPTIONS.map(
    (item) => `<option value="${item.value}" ${
      item.value === filters.sort ? "selected" : ""
    }>${item.label}</option>`,
  ).join("");
  return `
    ${selectField("process", "程序", options.processes || [], filters.process)}
    ${selectField("module", "模組", options.modules || [], filters.module)}
    ${selectField("model", "模型", options.models || [], filters.model)}
    ${selectField("status", "狀態", options.statuses || [], filters.status)}
    ${selectField("method", "方法", options.methods || [], filters.method)}
    <div class="field">
      <label class="field-label" for="performance-keyword">
        <span>關鍵字</span>
        <span class="field-tag">keyword</span>
      </label>
      <input class="input" type="text" id="performance-keyword" name="keyword"
        value="${escapeHtml(filters.keyword)}" placeholder="程序、模組、路徑或 Request ID" />
    </div>
    <div class="field-row">
      <div class="field">
        <label class="field-label" for="performance-from_date">
          <span>日期起</span>
          <span class="field-tag">from_date</span>
        </label>
        <input class="input" type="date" id="performance-from_date" name="from_date"
          value="${escapeHtml(filters.from_date)}" />
      </div>
      <div class="field">
        <label class="field-label" for="performance-to_date">
          <span>日期迄</span>
          <span class="field-tag">to_date</span>
        </label>
        <input class="input" type="date" id="performance-to_date" name="to_date"
          value="${escapeHtml(filters.to_date)}" />
      </div>
    </div>
    <div class="field">
      <label class="field-label" for="performance-min_duration">
        <span>耗時下限（ms）</span>
        <span class="field-tag">min_duration</span>
      </label>
      <input class="input" type="number" min="0" step="1" id="performance-min_duration"
        name="min_duration" value="${escapeHtml(filters.min_duration)}" placeholder="例如 100" />
    </div>
    <div class="field">
      <label class="field-label" for="performance-sort">
        <span>排序</span>
        <span class="field-tag">sort</span>
      </label>
      <select class="select" id="performance-sort" name="sort">${sortOptions}</select>
    </div>`;
}

function readFilterForm() {
  const form = document.getElementById("performance-filter-form");
  if (!form) return defaultFilters();
  const data = new FormData(form);
  return {
    process: String(data.get("process") || ""),
    module: String(data.get("module") || ""),
    status: String(data.get("status") || ""),
    method: String(data.get("method") || ""),
    model: String(data.get("model") || ""),
    keyword: String(data.get("keyword") || "").trim(),
    from_date: String(data.get("from_date") || ""),
    to_date: String(data.get("to_date") || ""),
    min_duration: String(data.get("min_duration") || ""),
    sort: String(data.get("sort") || "started_at:desc"),
  };
}

function formatParamValue(value) {
  if (value === null || value === undefined) return "null";
  if (typeof value === "object") {
    try {
      const text = JSON.stringify(value);
      return text.length > 160 ? `${text.slice(0, 157)}…` : text;
    } catch (error) {
      return String(value);
    }
  }
  return String(value);
}

function formatFlowClock(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function segmentTone(segment) {
  const module = String(segment?.module || "");
  if (module.includes("static") || module.includes("frontend")) return "is-client";
  if (module.includes("judgment.rag")) return "is-rag";
  if (module.includes("judgment.web.app")) return "is-api";
  if (module.includes("judgment.web.query")) return "is-data";
  if (module.includes("judgment.judgment_index")) return "is-index";
  return "is-other";
}

function segmentDepths(segments) {
  const bySeq = new Map(segments.map((segment) => [segment.seq, segment.parent_seq]));
  const depths = new Map();
  for (const segment of segments) {
    if (Number.isInteger(segment.depth)) {
      depths.set(segment.seq, segment.depth);
      continue;
    }
    let depth = 0;
    let parent = segment.parent_seq;
    let guard = 0;
    while (parent && bySeq.has(parent) && guard < 20) {
      depth += 1;
      parent = bySeq.get(parent);
      guard += 1;
    }
    depths.set(segment.seq, depth);
  }
  return depths;
}

function renderFlowParams(params) {
  const entries = Object.entries(params || {});
  if (!entries.length) return `<span class="muted">無參數</span>`;
  const visible = entries.slice(0, 8);
  const extra = entries.length - visible.length;
  return `<div class="flow-param-list">${visible
    .map(
      ([key, value]) => `<span class="flow-param">
        <span class="flow-param-key">${escapeHtml(key)}</span>
        <span class="flow-param-value">${escapeHtml(formatParamValue(value))}</span>
      </span>`,
    )
    .join("")}${extra > 0 ? `<span class="flow-param-more">+${extra}</span>` : ""}</div>`;
}

function flowPointTimings(segments) {
  const timings = new Map();
  const firstOffset = Math.max(0, Number(segments[0]?.offset_ms) || 0);
  segments.forEach((segment, index) => {
    const offset = Math.max(0, Number(segment.offset_ms) || 0);
    const duration = Math.max(0, Number(segment.duration_ms) || 0);
    const next = segments[index + 1];
    const nextOffset = next
      ? Math.max(offset, Number(next.offset_ms) || offset)
      : null;
    const endOffset = nextOffset === null ? offset + duration : nextOffset;
    const lap = Math.max(0, endOffset - offset);
    const cumulative = Math.max(0, endOffset - firstOffset);
    timings.set(segment.seq, { offset, duration, lap, cumulative });
  });
  return timings;
}

function renderFlowSegment(segment, totalDuration, depths, timings) {
  const timing = timings.get(segment.seq) || {};
  const duration = Math.max(0, Number(timing.duration) || 0);
  const offset = Math.max(0, Number(timing.offset) || 0);
  const lap = Math.max(0, Number(timing.lap) || 0);
  const cumulative = Math.max(0, Number(timing.cumulative) || 0);
  const total = Math.max(totalDuration, offset + duration, 1);
  const left = Math.min(100, (offset / total) * 100);
  const width = Math.min(
    100 - left,
    Math.max(0.6, (lap / total) * 100),
  );
  const depth = depths.get(segment.seq) || 0;
  const clock = formatFlowClock(segment.started_at);
  const startLabel = clock || `+${offset.toFixed(0)} ms`;
  const startTitle = segment.started_at
    ? `開始：${formatDateTime(segment.started_at)} · +${offset.toFixed(1)} ms`
    : `開始：+${offset.toFixed(1)} ms`;
  return `<div class="flow-segment ${
    segment.status === "error" ? "is-error" : ""
  }" style="--depth:${Math.min(depth, 8)}">
    <div class="flow-segment-head">
      <span class="flow-seq">#${escapeHtml(String(segment.seq ?? "—"))}</span>
      <span class="flow-segment-name">${escapeHtml(segment.name || "unnamed")}</span>
      <span class="flow-segment-start" title="${escapeHtml(startTitle)}">${escapeHtml(
        startLabel,
      )}</span>
      <span class="flow-segment-duration" title="距下一點 ${formatDuration(
        lap,
      )}；累計 ${formatDuration(cumulative)}">${formatDuration(lap)}</span>
      <span class="flow-segment-span" title="從第一點到本點結束的累計時間">累計 ${formatDuration(
        cumulative,
      )}</span>
    </div>
    <div class="flow-segment-loc">
      <span class="flow-segment-loc-text">${escapeHtml(
        segment.module || "—",
      )}<span class="flow-segment-dot">·</span>${escapeHtml(
        segment.function || "—",
      )}</span>
      <span class="flow-segment-mobile-cum" title="從第一點到本點結束的累計時間">累計 ${formatDuration(
        cumulative,
      )}</span>
    </div>
    <div class="flow-track" title="開始 +${offset.toFixed(
      1,
    )} ms · 距下一點 ${formatDuration(lap)} · 累計 ${formatDuration(
      cumulative,
    )}">
      <span class="flow-bar ${segmentTone(segment)}" style="left:${left.toFixed(
        2,
      )}%;width:${width.toFixed(2)}%"></span>
    </div>
    ${renderFlowParams(segment.params)}
    ${segment.error ? `<div class="flow-segment-error">${escapeHtml(segment.error)}</div>` : ""}
  </div>`;
}

function renderFlowStats(stats) {
  const segments = Array.isArray(stats?.segments) ? stats.segments : [];
  const models = Array.isArray(stats?.models) ? stats.models : [];
  const client = stats?.client || {};
  const maxAvg = Math.max(...segments.map((item) => Number(item.avg_ms) || 0), 1);
  const clientTotal = client.samples ? formatDuration(client.avg_total_ms ?? 0) : "—";
  const clientRender = client.samples ? formatDuration(client.avg_render_ms ?? 0) : "—";
  return `<div class="perf-flow-stats">
    <div class="perf-stat-grid">
      <div class="perf-stat">
        <span class="perf-stat-value">${formatNumber(stats?.avg_segments ?? 0)}</span>
        <span class="perf-stat-label">平均段數（樣本）</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${formatNumber(stats?.max_segments ?? 0)}</span>
        <span class="perf-stat-label">最大段數</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${formatNumber(stats?.sample_size ?? 0)}</span>
        <span class="perf-stat-label">Flow 樣本</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${clientTotal}</span>
        <span class="perf-stat-label">平均 Client 全流程</span>
      </div>
      <div class="perf-stat">
        <span class="perf-stat-value">${clientRender}</span>
        <span class="perf-stat-label">平均前端 Render</span>
      </div>
    </div>
    <div class="perf-flow-stats-grid">
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">模型使用次數</span>
          <span class="muted" style="font-size:9.5px">flow.summary.models</span>
        </div>
        ${
          models.length
            ? `<div class="perf-model-list">${models
                .map(
                  (model) => `<div class="perf-model-row">
                    <span class="chip">${escapeHtml(model.label || "—")}</span>
                    <span class="perf-model-count">${formatNumber(model.value)} 次${
                      model.avg_ms
                        ? ` · 平均 ${formatDuration(model.avg_ms)}`
                        : ""
                    }</span>
                  </div>`,
                )
                .join("")}</div>`
            : `<p class="muted" style="font-size:11px">尚無模型資料；新的 Flow 會從 params.model 自動彙整。</p>`
        }
      </div>
      <div class="perf-flow-stat-panel">
        <div class="report-section-head">
          <span class="report-section-title">最慢區段（平均）</span>
          <span class="muted" style="font-size:9.5px">最近 ${formatNumber(
            stats?.sample_size ?? 0,
          )} 筆</span>
        </div>
        ${
          segments.length
            ? `<div class="perf-seg-list">${segments
                .slice(0, 6)
                .map(
                  (item) => `<div class="perf-seg-row">
                    <span class="perf-seg-name" title="${escapeHtml(item.label)}">${escapeHtml(
                      item.label,
                    )}</span>
                    <span class="perf-seg-track"><span style="width:${Math.max(
                      2,
                      ((Number(item.avg_ms) || 0) / maxAvg) * 100,
                    ).toFixed(1)}%"></span></span>
                    <span class="perf-seg-ms">${formatDuration(item.avg_ms)}</span>
                  </div>`,
                )
                .join("")}</div>`
            : `<p class="muted" style="font-size:11px">尚無區段耗時；需有含 flow 的新紀錄。</p>`
        }
      </div>
    </div>
  </div>`;
}

function formatIndexDuration(value) {
  const ms = Math.max(0, Number(value) || 0);
  if (!ms) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(
      seconds,
    ).padStart(2, "0")}s`;
  }
  if (minutes) {
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function indexRunName(run) {
  const task = String(run?.task || "").trim();
  if (!task) return "索引";
  if (task === "auto") return "自動接續";
  return `task ${task}`;
}

function renderIndexRunBars(runs) {
  const visible = (runs || []).slice(-12);
  if (!visible.length) {
    return `<p class="muted" style="font-size:11px">尚無索引紀錄。</p>`;
  }
  const maxRate = Math.max(
    ...visible.map((run) => Number(run.points_per_second) || 0),
    0.1,
  );
  return `<div class="index-run-bars">${visible
    .map((run) => {
      const rate = Number(run.points_per_second) || 0;
      const width = Math.max(2, (rate / maxRate) * 100);
      return `<div class="index-run-row">
        <div class="index-run-label">
          <strong>${escapeHtml(indexRunName(run))}</strong>
          <span>${escapeHtml(formatDateTime(run.started_at))}</span>
        </div>
        <div class="index-run-track" title="${escapeHtml(
          `${formatNumber(run.indexed_count)} 筆 · ${formatIndexDuration(
            run.duration_ms,
          )} · ${formatNumber(run.batch_count)} 批`,
        )}">
          <span style="width:${width.toFixed(1)}%"></span>
        </div>
        <div class="index-run-value">
          <strong>${rate.toFixed(1)}</strong><span>筆/秒</span>
          <em>${formatNumber(run.indexed_count)} 筆 · ${formatIndexDuration(
            run.duration_ms,
          )}</em>
        </div>
      </div>`;
    })
    .join("")}</div>`;
}

function renderIndexBreakdown(run) {
  const entries = (Array.isArray(run.time_breakdown) ? run.time_breakdown : [])
    .map((entry) => ({
      ...entry,
      ms: Number(entry.ms) || 0,
      percent: Number(entry.percent) || 0,
    }))
    .filter((entry) => entry.ms > 0);
  if (!entries.length) {
    return `<div class="index-chart-empty">此筆索引紀錄尚未包含階段計時；後續索引會記錄 Ollama Embedding、Qdrant Upsert 與 PostgreSQL 索引紀錄的時間組成。</div>`;
  }
  return `<div class="index-breakdown-bar">${entries
    .map(
      (entry) =>
        `<span class="index-seg index-seg-${escapeHtml(entry.key)}" style="width:${Math.max(
          0.5,
          entry.percent,
        ).toFixed(2)}%" title="${escapeHtml(
          `${entry.label} ${formatIndexDuration(entry.ms)}（${entry.percent.toFixed(
            1,
          )}%）`,
        )}"></span>`,
    )
    .join("")}</div>
    <div class="index-breakdown-legend">${entries
      .map(
        (entry) =>
          `<span class="index-legend-item">
            <i class="index-seg index-seg-${escapeHtml(entry.key)}"></i>
            <span>${escapeHtml(entry.label)}</span>
            <strong>${formatIndexDuration(entry.ms)}</strong>
            <em>${entry.percent.toFixed(1)}%</em>
          </span>`,
      )
      .join("")}</div>`;
}

function renderIndexProgressChart(progress, durationMs) {
  const points = (Array.isArray(progress) ? progress : [])
    .map((point) => ({
      elapsed: Math.max(0, Number(point.elapsed_s) || 0),
      indexed: Math.max(0, Number(point.indexed) || 0),
    }))
    .filter((point) => point.indexed > 0);
  if (points.length < 2) {
    return "";
  }
  const maxElapsed = Math.max(
    ...points.map((point) => point.elapsed),
    (Number(durationMs) || 0) / 1000,
    1,
  );
  const maxIndexed = Math.max(...points.map((point) => point.indexed), 1);
  const width = 760;
  const height = 150;
  const padX = 12;
  const padY = 12;
  const plotWidth = width - padX * 2;
  const plotHeight = height - padY * 2;
  const scaled = points.map((point) => [
    padX + (point.elapsed / maxElapsed) * plotWidth,
    height - padY - (point.indexed / maxIndexed) * plotHeight,
  ]);
  const line = scaled
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${scaled[scaled.length - 1][0].toFixed(1)},${
    height - padY
  } L${scaled[0][0].toFixed(1)},${height - padY} Z`;
  const dotStep = Math.max(1, Math.ceil(scaled.length / 14));
  const dots = scaled
    .map(([x, y], index) =>
      index % dotStep === 0 || index === scaled.length - 1
        ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" />`
        : "",
    )
    .join("");
  const grid = [0, 1, 2, 3]
    .map((index) => {
      const y = padY + (plotHeight / 3) * index;
      return `<line x1="${padX}" y1="${y.toFixed(1)}" x2="${
        width - padX
      }" y2="${y.toFixed(1)}" class="index-chart-grid" />`;
    })
    .join("");
  return `<div class="index-chart-card index-progress-card">
    <div class="index-chart-head">
      <span>本次索引進度</span>
      <span>${formatNumber(maxIndexed)} 筆 · ${formatIndexDuration(
        maxElapsed * 1000,
      )}</span>
    </div>
    <svg class="index-progress-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="索引進度折線圖">
      ${grid}
      <path d="${area}" class="index-progress-area"></path>
      <path d="${line}" class="index-progress-line"></path>
      ${dots}
      <line x1="${padX}" y1="${height - padY}" x2="${
        width - padX
      }" y2="${height - padY}" class="index-chart-axis"></line>
      <line x1="${padX}" y1="${padY}" x2="${padX}" y2="${
        height - padY
      }" class="index-chart-axis"></line>
    </svg>
    <div class="index-progress-labels">
      <span>0</span>
      <span>${formatIndexDuration(maxElapsed * 500)}</span>
      <span>${formatIndexDuration(maxElapsed * 1000)}</span>
    </div>
  </div>`;
}

function renderIndexStats(stats) {
  if (!stats || !stats.latest) return "";
  const latest = stats.latest;
  const runs = Array.isArray(stats.runs) ? stats.runs : [];
  const average = stats.average || {};
  const coverage = latest.coverage || {};
  const coverageText =
    coverage.total_judgments > 0
      ? `${formatNumber(coverage.indexed_judgments)} / ${formatNumber(
          coverage.total_judgments,
        )}（${(
          (100 * coverage.indexed_judgments) /
          coverage.total_judgments
        ).toFixed(1)}%）`
      : "—";
  const cards = [
    {
      label: "當次執行筆數",
      value: formatNumber(latest.indexed_count),
      note: `${formatNumber(latest.batch_count)} 批 × ${formatNumber(
        latest.batch_size,
      )} 筆`,
    },
    {
      label: "平均每秒筆數",
      value: `${(Number(latest.points_per_second) || 0).toFixed(1)}`,
      note: "筆/秒",
    },
    {
      label: "當次使用時間",
      value: formatIndexDuration(latest.duration_ms),
      note: `${formatNumber(latest.scanned_count)} 筆已掃描`,
    },
    {
      label: "平均每批時間",
      value: formatIndexDuration(latest.batch_avg_ms),
      note:
        latest.batch_min_ms || latest.batch_max_ms
          ? `最快 ${formatIndexDuration(
              latest.batch_min_ms,
            )} · 最慢 ${formatIndexDuration(latest.batch_max_ms)}`
          : "以總耗時 ÷ 批數計算",
    },
  ];
  return `<section class="index-perf-panel">
    <div class="index-perf-head">
      <div>
        <div class="report-section-title">索引效能</div>
        <div class="index-perf-sub">判決向量索引 · 最近 ${formatNumber(
          stats.run_count,
        )} 次執行</div>
      </div>
      <span class="chip">${escapeHtml(indexRunName(latest))}</span>
    </div>
    <div class="index-perf-summary">
      ${cards
        .map(
          (card) => `<div class="index-perf-stat">
            <div class="summary-label">${escapeHtml(card.label)}</div>
            <div class="index-perf-value">${escapeHtml(card.value)}</div>
            <div class="index-perf-note">${escapeHtml(card.note)}</div>
          </div>`,
        )
        .join("")}
    </div>
    <div class="index-perf-meta">
      <span><strong>最近一次</strong> ${escapeHtml(
        formatDateTime(latest.started_at),
      )}</span>
      <span><strong>batch</strong> ${formatNumber(
        latest.batch_size,
      )} 筆／批</span>
      <span><strong>embedding 上限</strong> ${
        latest.max_chars ? `${formatNumber(latest.max_chars)} 字` : "—"
      }</span>
      <span><strong>collection</strong> ${formatNumber(
        latest.collection_points,
      )} points</span>
      <span><strong>覆蓋率</strong> ${escapeHtml(coverageText)}</span>
      <span><strong>平均每次執行</strong> ${formatIndexDuration(
        average.duration_ms,
      )} · ${(Number(average.points_per_second) || 0).toFixed(1)} 筆/秒</span>
    </div>
    <div class="index-charts">
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>最近索引吞吐</span>
          <span>筆/秒</span>
        </div>
        ${renderIndexRunBars(runs)}
      </div>
      <div class="index-chart-card">
        <div class="index-chart-head">
          <span>最新一次時間組成</span>
          <span>${formatIndexDuration(latest.duration_ms)}</span>
        </div>
        ${renderIndexBreakdown(latest)}
      </div>
    </div>
    ${renderIndexProgressChart(latest.progress, latest.duration_ms)}
  </section>`;
}

function renderPerfPagination(result) {
  const total = Number(result.total) || 0;
  const pageSize = Number(result.page_size) || 25;
  const page = Number(result.page) || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return `<div class="pagination-bar">
    <div class="pagination-info">
      第 <strong>${page}</strong> / ${totalPages} 頁 ·
      顯示 ${formatNumber(start)}–${formatNumber(end)} / ${formatNumber(total)} 筆
    </div>
    <div class="pagination-actions">
      <label class="page-size">每頁
        <select class="select" data-page-size aria-label="每頁筆數">
          ${PAGE_SIZES.map(
            (size) =>
              `<option value="${size}" ${size === pageSize ? "selected" : ""}>${size}</option>`,
          ).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${
        page <= 1 ? "disabled" : ""
      } aria-label="上一頁">${icon("chevronLeft", 13)}</button>
      <span class="page-btn" aria-hidden="true">${page}</span>
      <button class="page-btn" type="button" data-action="next-page" ${
        page >= totalPages ? "disabled" : ""
      } aria-label="下一頁">${icon("chevronRight", 13)}</button>
    </div>
  </div>`;
}

function renderFlowRecord(row, index) {
  const flow = row.flow && typeof row.flow === "object" ? row.flow : null;
  const segments = Array.isArray(flow?.segments)
    ? [...flow.segments].sort((left, right) => Number(left.seq) - Number(right.seq))
    : [];
  const summary = flow?.summary || {};
  const models = Array.isArray(summary.models) ? summary.models : [];
  const client = flow?.client || {};
  const metadata = flow?.metadata || {};
  const question = metadata.question || "";
  const answer = metadata.answer || "";
  const qaBlock =
    question || answer
      ? `<div class="perf-flow-qa">
          ${
            question
              ? `<div class="perf-flow-qa-row"><strong>RAG 問題</strong><span>${escapeHtml(
                  question,
                )}</span></div>`
              : ""
          }
          ${
            answer
              ? `<div class="perf-flow-qa-row"><strong>RAG 答案</strong><span>${escapeHtml(
                  answer,
                )}</span></div>`
              : ""
          }
        </div>`
      : "";
  const totalDuration = Math.max(
    Number(flow?.total_ms) || 0,
    Number(row.duration_ms) || 0,
    ...segments.map(
      (segment) =>
        (Number(segment.offset_ms) || 0) + (Number(segment.duration_ms) || 0),
    ),
    1,
  );
  const depths = segmentDepths(segments);
  const timings = flowPointTimings(segments);
  return `<details class="perf-record" ${index === 0 ? "open" : ""}>
    <summary class="perf-record-summary">
      <span class="perf-record-id">#${escapeHtml(String(row.id))}</span>
      <span class="perf-record-main">
        <span class="perf-record-title">${escapeHtml(row.process || "未命名")}</span>
        <span class="perf-record-path mono">${escapeHtml(row.method || "")} ${escapeHtml(
          row.path || "",
        )}</span>
      </span>
      <span class="perf-record-time">${formatDateTime(row.started_at)}</span>
      <span class="perf-record-duration">${formatDuration(row.duration_ms)}</span>
      ${statusBadge(row.status)}
      <span class="perf-record-chevron">${icon("chevronRight", 14)}</span>
    </summary>
    <div class="perf-record-body">
      <div class="perf-flow-meta">
        <span><strong>Request</strong> <span class="mono">${escapeHtml(
          row.request_id || flow?.request_id || "—",
        )}</span></span>
        <span><strong>Server</strong> ${formatDuration(row.duration_ms)}</span>
        ${
          client.total_ms
            ? `<span><strong>Client 全流程</strong> ${formatDuration(client.total_ms)}</span>`
            : ""
        }
        ${
          client.render_ms !== undefined
            ? `<span><strong>Render</strong> ${formatDuration(client.render_ms)}</span>`
            : ""
        }
        <span><strong>Flow</strong> ${segments.length} 段</span>
        ${
          segments.length
            ? `<span><strong>點位</strong> 區間＝下一點開始－本點開始；累計＝第一點到本點結束，最後一點為總時間</span>`
            : ""
        }
      </div>
      ${qaBlock}
      ${
        models.length
          ? `<div class="chips perf-record-models">${models
              .map((model) => `<span class="chip">${escapeHtml(model)}</span>`)
              .join("")}</div>`
          : ""
      }
      ${
        segments.length
          ? `<div class="flow-axis"><span>0 ms</span><span>${formatDuration(
              totalDuration,
            )}</span></div>
            <div class="flow-timeline">${segments
              .map((segment) =>
                renderFlowSegment(segment, totalDuration, depths, timings),
              )
              .join("")}</div>`
          : `<div class="perf-no-flow">此紀錄沒有 flow 明細（可能是舊資料或 CLI 紀錄）。${
              row.params_text && row.params_text !== "{}"
                ? `<pre>${escapeHtml(row.params_text)}</pre>`
                : ""
            }</div>`
      }
      ${
        flow
          ? `<details class="flow-json">
              <summary>Flow JSON · ${segments.length} 段</summary>
              <pre>${escapeHtml(JSON.stringify(flow, null, 2))}</pre>
            </details>`
          : ""
      }
    </div>
  </details>`;
}

const TEST_STAGE_LABELS = {
  embedding: "Embedding",
  retrieval: "Qdrant 檢索",
  context: "PostgreSQL 取文",
  llm: "LLM 生成",
  validation: "引用驗證",
};

const TEST_STAGE_SHORT = {
  embedding: "EMB",
  retrieval: "檢索",
  context: "取文",
  llm: "LLM",
  validation: "驗證",
  overhead: "其他",
};

function testStepStatusText(status) {
  const labels = {
    pending: "等待",
    running: "執行中",
    success: "完成",
    partial: "部分成功",
    failed: "失敗",
    skipped: "略過",
  };
  return labels[status] || status || "未知";
}

function renderTestFlowStep(step) {
  const status = String(step.status || "pending");
  const progress = Math.max(0, Math.min(100, Number(step.progress) || 0));
  const width =
    status === "pending"
      ? 0
      : status === "running"
        ? Math.max(progress, 12)
        : 100;
  const meta =
    status === "running"
      ? "執行中…"
      : status === "pending"
        ? "等待"
        : step.duration_ms
          ? formatDuration(step.duration_ms)
          : testStepStatusText(status);
  return `<div class="test-flow-step is-${escapeHtml(status)}">
    <div class="test-flow-step-head">
      <span class="test-flow-model" title="${escapeHtml(step.model || "")}">${escapeHtml(
        step.model || "—",
      )}</span>
      <span class="test-flow-step-meta">${escapeHtml(meta)}</span>
    </div>
    <div class="test-flow-step-loc">${escapeHtml(step.module || "—")}<span class="flow-segment-dot">·</span>${escapeHtml(
      step.function || "—",
    )}</div>
    <div class="test-flow-track">
      <span class="test-flow-bar" style="width:${width}%"></span>
    </div>
    ${
      step.error_message
        ? `<div class="test-flow-error">${escapeHtml(step.error_message)}</div>`
        : ""
    }
    ${
      step.details && Object.keys(step.details).length
        ? `<div class="test-flow-details">${escapeHtml(
            Object.entries(step.details)
              .slice(0, 4)
              .map(([key, value]) => `${key}=${formatParamValue(value)}`)
              .join(" · "),
          )}</div>`
        : ""
    }
  </div>`;
}

function renderTestFlowStage(stage, steps) {
  if (!steps.length) return "";
  const progress =
    steps.reduce((total, step) => total + (Number(step.progress) || 0), 0) /
    steps.length;
  return `<section class="test-flow-stage">
    <div class="test-flow-stage-head">
      <span class="test-flow-stage-title">${escapeHtml(
        TEST_STAGE_LABELS[stage] || stage,
      )}</span>
      <span class="test-flow-stage-meta">${steps.length} 個程序 · ${Math.round(
        progress,
      )}%</span>
    </div>
    <div class="test-flow-stage-steps">${steps
      .map(renderTestFlowStep)
      .join("")}</div>
  </section>`;
}

function testStageTimeEntries(run, steps) {
  const now = Date.now();
  const durations = new Map();
  for (const step of steps) {
    let duration = Number(step.duration_ms) || 0;
    if (step.status === "running" && step.started_at) {
      const started = Date.parse(step.started_at);
      if (Number.isFinite(started)) {
        duration = Math.max(duration, now - started);
      }
    }
    durations.set(step.stage, (durations.get(step.stage) || 0) + duration);
  }
  const order = Array.isArray(run.stage_order)
    ? run.stage_order
    : Object.keys(TEST_STAGE_LABELS);
  const entries = [];
  const seen = new Set();
  for (const stage of order) {
    if (!steps.some((step) => step.stage === stage)) continue;
    seen.add(stage);
    entries.push({
      stage,
      label: TEST_STAGE_LABELS[stage] || stage,
      short: TEST_STAGE_SHORT[stage] || stage,
      duration: durations.get(stage) || 0,
    });
  }
  for (const [stage, duration] of durations) {
    if (seen.has(stage)) continue;
    entries.push({
      stage,
      label: TEST_STAGE_LABELS[stage] || stage,
      short: TEST_STAGE_SHORT[stage] || stage,
      duration,
    });
  }
  const stepTotal = entries.reduce((sum, item) => sum + item.duration, 0);
  const wallTotal = Number(run.total_ms) || 0;
  const total = Math.max(stepTotal, wallTotal);
  const overhead = Math.max(0, total - stepTotal);
  if (overhead > 1) {
    entries.push({
      stage: "overhead",
      label: "其他／排程",
      short: "其他",
      duration: overhead,
    });
  }
  return { entries, total: total || stepTotal, stepTotal };
}

function renderTestFlowTime(run, steps) {
  const { entries, total } = testStageTimeEntries(run, steps);
  const segments = entries
    .filter((item) => item.duration > 0)
    .map((item) => {
      const percent = total ? (item.duration / total) * 100 : 0;
      return `<span class="test-flow-time-seg stage-${escapeHtml(
        item.stage,
      )}" style="width:${percent.toFixed(2)}%" title="${escapeHtml(
        item.label,
      )} · ${formatDuration(item.duration)}（${percent.toFixed(1)}%）">${
        percent >= 8 ? escapeHtml(item.short) : ""
      }</span>`;
    })
    .join("");
  const legend = entries
    .map((item) => {
      const percent = total ? (item.duration / total) * 100 : 0;
      return `<span class="test-flow-legend-item">
        <i class="test-flow-dot stage-${escapeHtml(item.stage)}"></i>
        <span>${escapeHtml(item.label)}</span>
        <strong>${formatDuration(item.duration)}</strong>
        <em>${percent.toFixed(1)}%</em>
      </span>`;
    })
    .join("");
  return `<div class="test-flow-time">
    <div class="test-flow-total-head">
      <span>總流程時間（依階段）</span>
      <span>${formatDuration(total)}${
        run.status === "running" ? " · 估算中" : ""
      }</span>
    </div>
    <div class="test-flow-time-bar">
      ${segments || `<span class="test-flow-time-empty">尚無階段耗時</span>`}
    </div>
    <div class="test-flow-legend">${legend}</div>
    ${
      run.status === "running"
        ? `<div class="test-flow-time-note">執行中的階段以開始時間估算；完成後以伺服器回報的 duration 為準。</div>`
        : ""
    }
  </div>`;
}

export function renderTestFlowPanel(run, runs, selectedRunId, viewOptions = {}) {
  const showHistory = viewOptions.showHistory !== false;
  const options = [
    `<option value="" ${selectedRunId ? "" : "selected"}>目前／最新測試</option>`,
    ...(runs || []).map(
      (item) =>
        `<option value="${escapeHtml(item.run_id)}" ${
          item.run_id === selectedRunId ? "selected" : ""
        }>${escapeHtml(testStepStatusText(item.status))} · ${escapeHtml(
          (item.question || "未命名").slice(0, 28),
        )} · ${escapeHtml(formatDateTime(item.started_at))}</option>`,
    ),
  ].join("");
  const panelActions = showHistory
    ? `<label class="test-flow-select-label">歷史
        <select class="select" id="test-run-select">${options}</select>
      </label>
      <button class="btn btn-secondary btn-sm" type="button" id="test-flow-refresh">
        ${icon("refresh", 13)}<span>更新</span>
      </button>`
    : `<a class="btn btn-secondary btn-sm" href="#/performance">
        ${icon("activity", 13)}<span>歷史 Flow</span>
      </a>`;
  const panelHead = `<div class="test-flow-head">
    <div class="test-flow-heading">
      <div class="eyebrow">PERFORMANCE TEST FLOW</div>
      <div class="test-flow-title">測試流程 ${
        run ? statusBadge(run.status) : ""
      }</div>
      <div class="test-flow-question">${
        run
          ? escapeHtml(run.question || "未命名測試")
          : "尚無測試流程。將 header 的測試模式開關設為 ON，並在 RAG 頁提問。"
      }</div>
    </div>
    <div class="test-flow-actions">${panelActions}</div>
  </div>`;

  if (!run) {
    return `<div class="test-flow-panel card">${panelHead}
      ${emptyState({
        iconName: "activity",
        title: "等待測試流程",
        text: "測試模式開啟後，下一次 RAG 提問會執行所有可用模型，並在這裡即時顯示每個階段的進度。",
      })}
    </div>`;
  }

  const steps = Array.isArray(run.steps) ? run.steps : [];
  const byStage = new Map();
  for (const step of steps) {
    if (!byStage.has(step.stage)) byStage.set(step.stage, []);
    byStage.get(step.stage).push(step);
  }
  const order = Array.isArray(run.stage_order)
    ? run.stage_order
    : Object.keys(TEST_STAGE_LABELS);
  const stages = order
    .map((stage) => renderTestFlowStage(stage, byStage.get(stage) || []))
    .join("");
  const models = run.models || {};
  const stageTime = testStageTimeEntries(run, steps);
  const totalTimeLabel =
    run.status === "running"
      ? `${formatDuration(stageTime.total)}（估算）`
      : formatDuration(run.total_ms);
  const primaryStep =
    steps.find(
      (step) =>
        step.stage === "llm" &&
        step.model === run.summary?.primary_model,
    ) || steps.find((step) => step.stage === "llm" && step.details?.answer_preview);
  const answerText = run.answer || primaryStep?.details?.answer_preview || "";
  const answerBlock = `<div class="test-flow-answer">
    <div class="test-flow-answer-head">
      <span>RAG 引擎答案</span>
      ${
        run.summary?.primary_model
          ? `<span class="mono">${escapeHtml(run.summary.primary_model)}</span>`
          : ""
      }
    </div>
    <p>${
      answerText
        ? escapeHtml(answerText)
        : run.status === "running"
          ? "測試進行中，尚未產生最終答案。"
          : "此測試沒有保存可顯示的答案。"
    }</p>
  </div>`;
  return `<div class="test-flow-panel card">
    ${panelHead}
    <div class="test-flow-meta">
      <span><strong>Run</strong> <span class="mono">${escapeHtml(run.run_id)}</span></span>
      <span><strong>開始</strong> ${escapeHtml(formatDateTime(run.started_at))}</span>
      <span><strong>總耗時</strong> ${totalTimeLabel}</span>
      <span><strong>Embedding</strong> ${Array.isArray(models.embedding) ? models.embedding.length : 0} 個</span>
      <span><strong>LLM</strong> ${Array.isArray(models.llm) ? models.llm.length : 0} 個</span>
      <span><strong>階段</strong> ${escapeHtml(run.stage_label || run.stage || "—")}</span>
    </div>
    ${answerBlock}
    <div class="test-flow-stages">${stages || `<p class="muted">此測試沒有區段資料。</p>`}</div>
    <div class="test-flow-total">
      <div class="test-flow-total-head">
        <span>總流程進度</span>
        <span>${Number(run.progress) || 0}%</span>
      </div>
      <div class="test-flow-track is-total ${
        run.status === "running" ? "is-running" : ""
      }">
        <span class="test-flow-bar is-total" style="width:${Math.max(
          0,
          Math.min(100, Number(run.progress) || 0),
        )}%"></span>
      </div>
    </div>
    ${renderTestFlowTime(run, steps)}
    <div class="test-flow-foot">
      <span>${
        run.status === "running"
          ? "測試執行中；此圖表會自動更新。"
          : showHistory
            ? "測試已完成；可從上方「歷史」選單還原其他 Flow。"
            : "測試已完成；可至效能報表查看歷史 Flow。"
      }</span>
      ${
        run.summary?.primary_model
          ? `<span class="mono">primary=${escapeHtml(run.summary.primary_model)}</span>`
          : ""
      }
    </div>
  </div>`;
}

function renderPerformanceReport(result) {
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const summary = Array.isArray(result.summary) ? result.summary : [];
  const flowStats = result.flow_stats || result.meta?.flow_stats || {};
  const indexStats = result.index_stats || null;
  return `<div class="report-card performance-flow-report" data-database="performance">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">PERFORMANCE FLOW REPORT</div>
        <div class="report-title">
          效能報表 ${statusBadge(result.status || "ok")}
          <span class="chip">performance_records</span>
        </div>
        <div class="report-sub">
          ${formatNumber(result.total)} 筆符合 · ${formatDuration(result.duration_ms)} ·
          每次執行按鈕的完整 Flow
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${
          rows.length ? "" : "disabled"
        }>${icon("download", 14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${
          rows.length ? "" : "disabled"
        }>${icon("file", 14)}<span>JSON</span></button>
      </div>
    </div>
    ${
      summary.length
        ? `<div class="summary-strip">${summary
            .map(
              (item) => `<div class="summary-item">
                <div class="summary-label">${escapeHtml(item.label)}</div>
                <div class="summary-value">${escapeHtml(item.value)}</div>
              </div>`,
            )
            .join("")}</div>`
        : ""
    }
    ${renderIndexStats(indexStats)}
    ${renderFlowStats(flowStats)}
    <div class="report-section-head perf-flow-list-head">
      <span class="report-section-title">Flow 紀錄</span>
      <span class="muted" style="font-size:9.5px">點擊列展開模組、函數、參數與區段耗時</span>
    </div>
    <div class="perf-record-list">
      ${
        rows.length
          ? rows.map((row, index) => renderFlowRecord(row, index)).join("")
          : emptyState({
              iconName: "activity",
              title: "沒有符合條件的 Flow",
              text: "放寬日期、模型或耗時條件後再試一次。",
            })
      }
    </div>
    ${renderPerfPagination(result)}
    <details class="perf-query-details">
      <summary>查詢語句與警告</summary>
      <div class="query-box">
        <pre class="query-code">${escapeHtml(result.query_text || "—")}</pre>
        <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
          ${icon("copy", 12)}<span>複製</span>
        </button>
      </div>
      ${
        Array.isArray(result.warnings) && result.warnings.length
          ? `<div class="warnings">${result.warnings
              .map((warning) => `<div class="warning-line">${escapeHtml(warning)}</div>`)
              .join("")}</div>`
          : ""
      }
    </details>
  </div>`;
}

export async function render(root, ctx) {
  let disposed = false;
  let filters = defaultFilters();
  let options = { processes: [], modules: [], statuses: [], methods: [], models: [] };
  let page = 1;
  let pageSize = 25;
  let result = null;

  root.innerHTML = `<section class="page data-page performance-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">PERFORMANCE</div>
        <div class="data-title-line">
          <h1 class="page-title">效能報表</h1>
          <p class="page-subtitle data-page-subtitle">記錄每次執行按鈕從接收命令到回傳結果的完整 Flow：模組、函數、參數、模型與區段耗時。</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="performance-meta">PERFORMANCE · 讀取中</span>
        <button class="btn btn-secondary" type="button" id="performance-refresh">
          ${icon("refresh", 15)}<span>重新整理</span>
        </button>
      </div>
    </div>
    <div class="data-layout">
      <aside class="card query-sidebar" aria-label="效能篩選">
        <form id="performance-filter-form" autocomplete="off">
          <div class="filter-block">
            <div class="filter-head">
              <span class="filter-title">Metadata 條件</span>
              <button class="filter-reset" type="button" data-action="reset">重設</button>
            </div>
            <div class="filter-fields" id="performance-filter-fields">
              <div class="skeleton skeleton-line" style="width:90%"></div>
              <div class="skeleton skeleton-line" style="width:72%"></div>
            </div>
          </div>
          <div class="sidebar-actions">
            <button class="btn btn-primary" type="submit" id="performance-run">
              ${icon("search", 15)}<span>執行查詢</span>
            </button>
          </div>
        </form>
        <div class="sidebar-note">Flow 寫入 PostgreSQL 的 performance_records.flow（JSON），預設保留至少 90 天；可依模型、程序、模組與耗時篩選。</div>
      </aside>
      <section class="query-main" id="performance-main" aria-label="效能報表" aria-live="polite">
        <div id="performance-test-flow"></div>
        <div id="performance-report">${reportLoading({ label: "效能報表" })}</div>
      </section>
    </div>
  </section>`;

  const filterFields = root.querySelector("#performance-filter-fields");
  const form = root.querySelector("#performance-filter-form");
  const flowBox = root.querySelector("#performance-test-flow");
  const reportBox = root.querySelector("#performance-report");
  const metaBadge = root.querySelector("#performance-meta");
  const refreshButton = root.querySelector("#performance-refresh");
  let testRun = null;
  let testRuns = [];
  let selectedTestRunId = "";
  let testPollTimer = null;
  let lastTestSignature = "";

  const paintFilters = () => {
    filterFields.innerHTML = renderFilterFields(options, filters);
  };

  const paintTestFlow = () => {
    const signature = JSON.stringify({
      selected: selectedTestRunId,
      tick:
        testRun?.status === "running"
          ? Math.floor(Date.now() / 1000)
          : 0,
      runs: testRuns.map((item) => `${item.run_id}:${item.status}`),
      run: testRun
        ? {
            run_id: testRun.run_id,
            status: testRun.status,
            progress: testRun.progress,
            steps: (testRun.steps || []).map(
              (step) => `${step.stage}:${step.model}:${step.status}:${step.progress}`,
            ),
          }
        : null,
    });
    if (signature === lastTestSignature) return;
    lastTestSignature = signature;
    flowBox.innerHTML = renderTestFlowPanel(
      testRun,
      testRuns,
      selectedTestRunId,
    );
  };

  const loadTestRuns = async () => {
    try {
      const data = await api.testRuns(30);
      if (disposed) return;
      testRuns = Array.isArray(data.runs) ? data.runs : [];
    } catch (error) {
      if (disposed) return;
      testRuns = [];
    }
  };

  const refreshTestFlow = async () => {
    try {
      const data = selectedTestRunId
        ? await api.testRun(selectedTestRunId)
        : await api.testRunCurrent();
      if (disposed) return;
      testRun = data.run || null;
      if (
        !selectedTestRunId &&
        testRun &&
        testRun.status !== "running" &&
        !testRuns.some((item) => item.run_id === testRun.run_id)
      ) {
        await loadTestRuns();
      }
      paintTestFlow();
    } catch (error) {
      if (disposed) return;
      testRun = null;
      paintTestFlow();
    }
  };

  const pollTestFlow = async () => {
    if (disposed) return;
    if (!selectedTestRunId) await refreshTestFlow();
    if (!disposed) {
      testPollTimer = window.setTimeout(pollTestFlow, 1500);
    }
  };

  flowBox.addEventListener("change", async (event) => {
    if (event.target.id !== "test-run-select") return;
    selectedTestRunId = String(event.target.value || "");
    await refreshTestFlow();
  });

  flowBox.addEventListener("click", async (event) => {
    if (!event.target.closest("#test-flow-refresh")) return;
    selectedTestRunId = "";
    await loadTestRuns();
    await refreshTestFlow();
  });

  const runQuery = async (nextPage = page) => {
    page = Math.max(1, Number(nextPage) || 1);
    filters = readFilterForm();
    reportBox.innerHTML = reportLoading({ label: "效能報表" });
    const submit = root.querySelector("#performance-run");
    setBusy(submit, true, "查詢中…");
    try {
      const response = await api.performance(filters, page, pageSize);
      if (disposed) return;
      result = response;
      page = Number(response.page) || page;
      pageSize = Number(response.page_size) || pageSize;
      reportBox.innerHTML = renderPerformanceReport(response);
      metaBadge.textContent = `PERFORMANCE · ${formatNumber(response.total)} 筆`;
      metaBadge.className = "badge badge-neutral badge-mono";
    } catch (error) {
      if (disposed) return;
      reportBox.innerHTML = reportError(error, { label: "效能報表" });
      toast(error.message || "效能報表查詢失敗。", "danger");
    } finally {
      if (!disposed) setBusy(submit, false);
    }
  };

  const loadOptions = async () => {
    try {
      options = await api.performanceOptions();
    } catch (error) {
      options = { processes: [], modules: [], statuses: [], methods: [], models: [] };
    }
    paintFilters();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runQuery(1);
  });

  root.querySelector('[data-action="reset"]').addEventListener("click", () => {
    filters = defaultFilters();
    page = 1;
    paintFilters();
    runQuery(1);
  });

  refreshButton.addEventListener("click", async () => {
    filters = readFilterForm();
    refreshButton.disabled = true;
    setBusy(refreshButton, true, "整理中…");
    await loadOptions();
    await loadTestRuns();
    if (!disposed) await refreshTestFlow();
    if (!disposed) await runQuery(1);
    if (!disposed) {
      refreshButton.disabled = false;
      setBusy(refreshButton, false);
    }
  });

  reportBox.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || !result) return;
    const action = button.dataset.action;
    if (action === "retry") {
      runQuery(page);
      return;
    }
    if (action === "prev-page") {
      runQuery(Math.max(1, Number(result.page) - 1));
      return;
    }
    if (action === "next-page") {
      const totalPages = Math.max(
        1,
        Math.ceil(Number(result.total) / Number(result.page_size)),
      );
      runQuery(Math.min(totalPages, Number(result.page) + 1));
      return;
    }
    if (action === "copy-query") {
      const ok = await copyText(result.query_text || "");
      toast(ok ? "查詢語句已複製。" : "無法複製查詢語句。", ok ? "ok" : "warn");
      return;
    }
    if (action === "export-json") {
      const filename = `performance-page-${result.page}.json`;
      downloadText(
        filename,
        JSON.stringify(exportableResult(result), null, 2),
        "application/json;charset=utf-8",
      );
      toast(`已匯出 ${filename}`, "ok");
      return;
    }
    if (action === "export-csv") {
      const filename = `performance-page-${result.page}.csv`;
      downloadText(filename, exportCsv(result), "text/csv;charset=utf-8");
      toast(`已匯出 ${filename}`, "ok");
    }
  });

  reportBox.addEventListener("change", (event) => {
    if (!event.target.matches("[data-page-size]")) return;
    pageSize = Number(event.target.value) || 25;
    if (!PAGE_SIZES.includes(pageSize)) pageSize = 25;
    runQuery(1);
  });

  await Promise.allSettled([loadOptions(), loadTestRuns()]);
  if (!disposed) {
    await refreshTestFlow();
    await runQuery(1);
    pollTestFlow();
  }

  if (ctx && typeof ctx.setTitle === "function") {
    ctx.setTitle("效能報表 · Judgment RAG Console");
  }

  return () => {
    disposed = true;
    if (testPollTimer) window.clearTimeout(testPollTimer);
  };
}
