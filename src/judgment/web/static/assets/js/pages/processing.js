import { api } from "../api.js";
import {
  escapeHtml,
  formatBytes,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatRelativeTime,
  icon,
  notice,
  setBusy,
  toast,
} from "../utils.js";

const POLL_INTERVAL_MS = 2000;

const STATUS_META = {
  running: { label: "執行中", tone: "info" },
  success: { label: "完成", tone: "ok" },
  failed: { label: "失敗", tone: "danger" },
  interrupted: { label: "已中止", tone: "warn" },
  stale: { label: "狀態失效", tone: "warn" },
  skipped: { label: "略過", tone: "idle" },
  pending: { label: "等待", tone: "idle" },
  idle: { label: "待命", tone: "idle" },
  no_change: { label: "無變更", tone: "info" },
  operational: { label: "正常", tone: "ok" },
  degraded: { label: "降級", tone: "warn" },
  unavailable: { label: "無法取得", tone: "danger" },
  missing: { label: "尚無紀錄", tone: "idle" },
  error: { label: "讀取失敗", tone: "danger" },
  ok: { label: "正常", tone: "ok" },
};

const TONE_CLASS = {
  ok: "badge-ok",
  warn: "badge-warn",
  danger: "badge-danger",
  info: "badge-info",
  idle: "badge-neutral",
};

const TONE_DOT = {
  ok: "is-ok",
  warn: "is-warn",
  danger: "is-danger",
  info: "is-idle",
  idle: "is-idle",
};

const BRANCH_FALLBACK_LABELS = {
  judgment: "判決",
  law: "法規",
  order: "命令",
  system: "系統",
};

const BRANCH_ACCENTS = {
  judgment: "#a78bfa",
  law: "#22d3ee",
  order: "#f472b6",
  system: "#94a3b8",
};

const STAGE_ICONS = {
  extract: "file",
  raw_parquet: "cube",
  filter: "filter",
  postgres: "database",
  qdrant: "brain",
  download: "download",
  parse: "sliders",
};

const STAGE_FLOW_LABELS = {
  raw_parquet: "原始 Parquet",
  postgres: "PostgreSQL",
};

function statusInfo(status) {
  return (
    STATUS_META[status] || {
      label: status ? String(status) : "未知",
      tone: "idle",
    }
  );
}

function statusBadge(status, label) {
  const meta = statusInfo(status);
  return `<span class="badge ${TONE_CLASS[meta.tone] || TONE_CLASS.idle}"><span class="status-dot ${
    TONE_DOT[meta.tone] || TONE_DOT.idle
  }"></span>${escapeHtml(label || meta.label)}</span>`;
}

function percentText(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const clamped = Math.max(0, Math.min(100, number));
  return `${Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}%`;
}

function numberOrUnavailable(value) {
  if (value === null || value === undefined) return "無法取得";
  return formatNumber(value);
}

function barColor(stage) {
  return stage && stage.color ? String(stage.color) : "var(--accent)";
}

function progressBar(stage, extraClass = "") {
  const percent =
    stage.percent === null || stage.percent === undefined
      ? null
      : Math.max(0, Math.min(100, Number(stage.percent) || 0));
  const indeterminate = stage.status === "running" && percent === null;
  const attrs = indeterminate
    ? ' aria-valuetext="進度未知"'
    : ` aria-valuenow="${percent ?? 0}"`;
  return `<div class="processing-bar${indeterminate ? " is-indeterminate" : ""}${
    extraClass ? ` ${extraClass}` : ""
  }" role="progressbar" aria-valuemin="0" aria-valuemax="100"${attrs}>
    <span class="processing-bar-fill" style="width:${percent ?? 0}%;background:${escapeHtml(
      barColor(stage),
    )}"></span>
  </div>`;
}

function stageCounts(stage) {
  const unit = stage.unit === "bytes" ? "" : stage.unit || "筆";
  const current = stage.current;
  const total = stage.total;
  if (current === null || current === undefined) {
    return stage.status === "running" ? "進行中" : "—";
  }
  if (stage.unit === "bytes") {
    return total
      ? `${formatBytes(current)} / ${formatBytes(total)}`
      : formatBytes(current);
  }
  return total
    ? `${formatNumber(current)} / ${formatNumber(total)} ${unit}`
    : `${formatNumber(current)} ${unit}`;
}

function stageMeta(stage) {
  const parts = [`<span>${escapeHtml(stageCounts(stage))}</span>`];
  if (stage.percent === null || stage.percent === undefined) {
    if (stage.status === "running") {
      parts.push('<span class="mono">進度未知</span>');
    }
  } else {
    parts.push(`<span class="mono">${percentText(stage.percent)}</span>`);
  }
  if (stage.duration_ms) {
    parts.push(`<span class="mono">${formatDuration(stage.duration_ms)}</span>`);
  }
  return parts.join("");
}

function stageStats(stage) {
  const stats = Array.isArray(stage.stats) ? stage.stats : [];
  const rows = stats.map(
    (item) =>
      `<span class="processing-stage-stat"><span>${escapeHtml(
        item.label,
      )}</span><strong>${escapeHtml(item.value)}</strong></span>`,
  );
  const coverage = stage.coverage;
  if (
    coverage &&
    coverage.indexed !== null &&
    coverage.indexed !== undefined &&
    coverage.total !== null &&
    coverage.total !== undefined
  ) {
    rows.push(
      `<span class="processing-stage-stat"><span>索引覆蓋</span><strong>${formatNumber(
        coverage.indexed,
      )} / ${formatNumber(coverage.total)}</strong></span>`,
    );
  }
  return rows.length
    ? `<div class="processing-stage-stats">${rows.join("")}</div>`
    : "";
}

function stageCard(stage, { compact = false, step = null } = {}) {
  const meta = statusInfo(stage.status);
  const live = stage.status === "running";
  return `<div class="processing-stage${compact ? " is-compact" : ""} is-${
    meta.tone
  }${live ? " is-live" : ""}" style="--stage-color:${escapeHtml(
    barColor(stage),
  )}"${live ? ' aria-current="step"' : ""}>
    <div class="processing-stage-head">
      ${
        step === null
          ? ""
          : `<span class="processing-stage-step">${String(step).padStart(
              2,
              "0",
            )}</span>`
      }
      <span class="processing-stage-swatch" style="background:${escapeHtml(
        barColor(stage),
      )}"></span>
      <span class="processing-stage-label">${escapeHtml(stage.label || stage.key)}</span>
      ${statusBadge(stage.status)}
    </div>
    ${progressBar(stage)}
    <div class="processing-stage-meta">${stageMeta(stage)}</div>
    ${
      stage.message
        ? `<div class="processing-stage-message" title="${escapeHtml(
            stage.message,
          )}">${escapeHtml(stage.message)}</div>`
        : ""
    }
    ${compact ? "" : stageStats(stage)}
  </div>`;
}

function flowStatusBadge(status) {
  const meta = statusInfo(status);
  return `<span class="flow-status is-${meta.tone}"><span class="flow-status-dot"></span>${escapeHtml(
    meta.label,
  )}</span>`;
}

function flowValue(stage, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (stage.unit === "bytes") return formatBytes(value);
  return formatNumber(value);
}

function flowPropertyRows(stage) {
  const rows = [
    { label: "目前", value: flowValue(stage, stage.current) },
    { label: "總量", value: flowValue(stage, stage.total) },
    {
      label: "百分比",
      value:
        stage.percent === null || stage.percent === undefined
          ? stage.status === "running"
            ? "計算中"
            : "—"
          : percentText(stage.percent),
    },
    {
      label: "耗時",
      value: stage.duration_ms ? formatDuration(stage.duration_ms) : "—",
    },
  ];
  const stats = Array.isArray(stage.stats) ? stage.stats : [];
  for (const item of stats) {
    if (rows.length >= 6) break;
    if (item && item.label && item.value) {
      rows.push({ label: String(item.label), value: String(item.value) });
    }
  }
  const coverage = stage.coverage;
  if (
    coverage &&
    coverage.indexed !== null &&
    coverage.indexed !== undefined &&
    coverage.total !== null &&
    coverage.total !== undefined &&
    !rows.some((row) => row.label === "索引覆蓋")
  ) {
    rows.push({
      label: "索引覆蓋",
      value: `${formatNumber(coverage.indexed)} / ${formatNumber(coverage.total)}`,
    });
  }
  return rows;
}

function flowNode(stage, index) {
  const meta = statusInfo(stage.status);
  const live = stage.status === "running";
  const rows = flowPropertyRows(stage);
  return `<article class="flow-node is-${meta.tone}${
    live ? " is-live" : ""
  }" style="--stage-color:${escapeHtml(barColor(stage))}"${
    live ? ' aria-current="step"' : ""
  }>
    <div class="flow-node-head">
      <span class="flow-node-icon">${icon(
        STAGE_ICONS[stage.key] || "cube",
        14,
      )}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">STEP ${String(index + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(
          STAGE_FLOW_LABELS[stage.key] || stage.label || stage.key,
        )}</strong>
      </div>
      ${flowStatusBadge(stage.status)}
    </div>
    <div class="flow-node-body">
      ${progressBar(stage, "flow-progress")}
      <div class="flow-node-props">${rows
        .map(
          (row) =>
            `<div class="flow-prop"><span>${escapeHtml(
              row.label,
            )}</span><strong>${escapeHtml(row.value)}</strong></div>`,
        )
        .join("")}</div>
      ${
        stage.message
          ? `<div class="flow-node-note" title="${escapeHtml(
              stage.message,
            )}">${escapeHtml(stage.message)}</div>`
          : ""
      }
    </div>
  </article>`;
}

function flowConnector(stage, index, branchKey, previousColor) {
  const color = barColor(stage);
  const from = previousColor || "#8b5cf6";
  const live = stage.status === "running";
  const key = `${branchKey}-${index}`;
  const gradientId = `flow-gradient-${key}`;
  const markerId = `flow-marker-${key}`;
  const path =
    index % 2 === 0
      ? "M2 60 C8 42 16 78 22 60"
      : "M2 60 C8 78 16 42 22 60";
  return `<div class="flow-link${live ? " is-live" : ""}" style="color:${escapeHtml(
    color,
  )}" aria-hidden="true">
    <svg viewBox="0 0 28 120" width="28" height="120" fill="none">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${escapeHtml(from)}"/>
          <stop offset="1" stop-color="${escapeHtml(color)}"/>
        </linearGradient>
        <marker id="${markerId}" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.6" markerHeight="4.6" orient="auto">
          <path d="M0 0 8 4 0 8Z" fill="${escapeHtml(color)}"/>
        </marker>
      </defs>
      <path class="flow-link-line" d="${path}" stroke="url(#${gradientId})" stroke-width="1.7" stroke-linecap="round" marker-end="url(#${markerId})"/>
      <circle class="flow-link-port" cx="2" cy="60" r="3.6" stroke="${escapeHtml(from)}" stroke-width="1.5"/>
      <circle class="flow-link-port" cx="26" cy="60" r="3.6" stroke="${escapeHtml(color)}" stroke-width="1.5"/>
    </svg>
  </div>`;
}

function runBrief(run) {
  if (!run) return "";
  const pieces = [];
  if (run.started_at) {
    pieces.push(`開始 ${formatDateTime(run.started_at)}`);
  }
  if (run.duration_ms) {
    pieces.push(`耗時 ${formatDuration(run.duration_ms)}`);
  }
  if (run.pid) {
    pieces.push(`PID ${run.pid}`);
  }
  return pieces.join(" · ");
}

function flowSourceMarkup(
  branch,
  { active, focus, status, runLine, runningStage },
) {
  const label =
    branch.label || BRANCH_FALLBACK_LABELS[branch.key] || branch.key;
  return `<div class="flow-source${active ? " is-live" : ""}" style="--branch-accent:${
    BRANCH_ACCENTS[branch.key] || BRANCH_ACCENTS.system
  }">
    <div class="flow-source-head">
      <span class="flow-source-icon">${icon(
        branch.icon || "database",
        15,
      )}</span>
      <div class="flow-node-heading">
        <span class="flow-node-kicker">SOURCE</span>
        <strong>${escapeHtml(label)}</strong>
      </div>
      ${flowStatusBadge(status)}
    </div>
    <div class="flow-source-body">
      <p class="flow-source-desc">${escapeHtml(branch.description || "")}</p>
      <div class="flow-source-meta">${runLine}</div>
      ${
        runningStage
          ? `<div class="flow-source-current"><span class="flow-current-dot"></span>目前階段：<strong>${escapeHtml(
              runningStage.label || runningStage.key,
            )}</strong></div>`
          : ""
      }
      ${
        focus && focus.message
          ? `<div class="flow-source-note" title="${escapeHtml(
              focus.message,
            )}">${escapeHtml(focus.message)}</div>`
          : ""
      }
    </div>
  </div>`;
}

function branchMarkup(branch) {
  const active = branch.active_run;
  const focus = active || branch.focus_run || branch.last_run;
  const status = active ? "running" : focus ? focus.status : "idle";
  const runLine = focus
    ? escapeHtml(
        runBrief(focus) ||
          formatRelativeTime(focus.started_at || focus.finished_at),
      )
    : "尚無執行紀錄";
  const stages = Array.isArray(branch.stages) ? branch.stages : [];
  const runningStage = stages.find((stage) => stage.status === "running");
  const accent = BRANCH_ACCENTS[branch.key] || BRANCH_ACCENTS.system;
  const branchKey = String(branch.key || "branch").replace(/[^a-zA-Z0-9_-]/g, "");
  const source = flowSourceMarkup(branch, {
    active,
    focus,
    status,
    runLine,
    runningStage,
  });
  const flow = stages.length
    ? stages
        .map((stage, index) => {
          const previous = index
            ? barColor(stages[index - 1])
            : accent;
          return `${flowConnector(
            stage,
            index,
            branchKey,
            previous,
          )}${flowNode(stage, index)}`;
        })
        .join("")
    : '<div class="flow-empty">沒有可顯示的階段。</div>';
  return `<article class="flow-lane" style="--branch-accent:${accent}"><div class="flow-row">${source}${flow}</div></article>`;
}

function flowCanvasMarkup(snapshot) {
  const branches = Array.isArray(snapshot.branches) ? snapshot.branches : [];
  return `<div class="flow-canvas-open">
    <div class="processing-branches">${branches.map(branchMarkup).join("")}</div>
  </div>`;
}

function summaryCard(label, value, hint = "", extra = "") {
  return `<div class="processing-summary-card">
    <span class="processing-summary-label">${escapeHtml(label)}</span>
    <span class="processing-summary-value">${value}</span>
    ${hint ? `<span class="processing-summary-hint">${hint}</span>` : ""}
    ${extra}
  </div>`;
}

function summaryMarkup(snapshot) {
  const database = snapshot.database || {};
  const index = snapshot.index || {};
  const local = snapshot.local_archives || {};
  const raw = snapshot.raw_backups || {};
  const rawTotals = raw.totals || {};
  const state = snapshot.state || {};
  const capabilities = snapshot.capabilities || {};
  const mode = snapshot.mode === "running" ? "執行中" : "待命";
  const dbAvailable = database.status === "operational";
  const indexAvailable = index.status === "operational";
  const localAvailable = local.available !== false;
  const rawAvailable = raw.available !== false;

  const indexValue = indexAvailable
    ? `${formatNumber(index.indexed)} / ${formatNumber(index.total)}`
    : statusBadge(index.status || "unavailable");
  const indexHint = indexAvailable
    ? `${percentText(index.percent)} · 尚餘 ${formatNumber(index.remaining)} 筆`
    : escapeHtml(index.error || "無法查詢 Qdrant 索引覆蓋率。");
  const archiveValue = localAvailable
    ? `${formatNumber(local.unprocessed)} / ${formatNumber(local.total)}`
    : statusBadge("unavailable");
  const archiveHint = localAvailable
    ? `未處理 / 全部 · ${formatBytes(local.unprocessed_bytes)} 待處理`
    : escapeHtml(local.error || "找不到判決資料目錄。");

  return `<div class="processing-summary">
    ${summaryCard(
      "處理狀態",
      statusBadge(snapshot.status || "unknown"),
      `${escapeHtml(mode)} · 更新於 <span data-processing-updated-at>—</span>`,
    )}
    ${summaryCard(
      "未處理壓縮檔",
      escapeHtml(archiveValue),
      archiveHint,
    )}
    ${summaryCard(
      "原始 Parquet 備份",
      rawAvailable ? `${formatNumber(raw.count)} 檔` : statusBadge("unavailable"),
      rawAvailable
        ? `共 ${formatNumber(rawTotals.row_count)} 筆 · ${formatBytes(
            rawTotals.compressed_bytes,
          )}`
        : escapeHtml(raw.error || "無法掃描原始 Parquet 備份。"),
    )}
    ${summaryCard(
      "PostgreSQL 判決",
      dbAvailable ? formatNumber(database.judgment_count) : statusBadge("unavailable"),
      dbAvailable
        ? `法規 ${numberOrUnavailable(database.law_count)} · 命令 ${numberOrUnavailable(
            database.order_count,
          )}`
        : escapeHtml(database.error || "無法查詢 PostgreSQL。"),
    )}
    ${summaryCard(
      "Qdrant 索引",
      indexValue,
      indexHint,
    )}
    ${summaryCard(
      "狀態檔",
      statusBadge(state.status || "missing"),
      state.updated_at
        ? `更新於 ${escapeHtml(formatDateTime(state.updated_at))}`
        : escapeHtml(state.detail || "尚無處理狀態紀錄。"),
    )}
    ${summaryCard(
      "待處理工作",
      capabilities.can_start_update === false ? "暫停啟動" : "可開始更新",
      capabilities.start_blocked_reason
        ? escapeHtml(capabilities.start_blocked_reason)
        : `未處理 ${formatNumber(capabilities.unprocessed_archives)} 個 · 索引待補 ${formatNumber(
            capabilities.index_backlog,
          )} 筆${capabilities.external_processes ? ` · 外部程序 ${formatNumber(capabilities.external_processes)} 個` : ""}`,
    )}
  </div>`;
}

function archiveAggregate(local) {
  if (local.available === false) {
    return notice({
      tone: "warn",
      title: "找不到判決資料目錄",
      text: escapeHtml(local.error || "無法掃描 .rar 檔案。"),
    });
  }
  const total = Number(local.total) || 0;
  const processed = Number(local.processed) || 0;
  const unprocessed = Number(local.unprocessed) || 0;
  const percent = total ? (100 * processed) / total : null;
  return `<div class="processing-archive-summary">
    <div class="processing-archive-summary-head">
      <span class="mono">${escapeHtml(local.data_dir || "")}</span>
      <span>${formatNumber(processed)} / ${formatNumber(total)} 已處理 · ${formatNumber(
        unprocessed,
      )} 待處理 · ${formatBytes(local.unprocessed_bytes)} 待處理</span>
    </div>
    ${progressBar(
      {
        percent,
        status: unprocessed ? "pending" : "success",
        color: "var(--success)",
      },
      "processing-bar-lg",
    )}
    <div class="processing-archive-summary-meta">
      <span>壓縮檔匯入覆蓋 ${percentText(percent)}</span>
      <span>全部 ${formatBytes(local.total_bytes)}</span>
    </div>
  </div>`;
}

function archiveStageCards(item) {
  const stages = item.stages || {};
  const order = ["extract", "filter", "postgres"];
  const cards = order
    .map((key) => stages[key])
    .filter(Boolean)
    .map((stage) => stageCard(stage, { compact: true }));
  return cards.length
    ? `<div class="processing-archive-stages">${cards.join("")}</div>`
    : "";
}

function archiveRow(item) {
  const status = item.status || "pending";
  const running = status === "running";
  const percent =
    item.percent === null || item.percent === undefined
      ? null
      : Math.max(0, Math.min(100, Number(item.percent) || 0));
  const indeterminate = running && percent === null;
  const notes = [];
  if (item.message) notes.push(item.message);
  if (item.error) notes.push(item.error);
  if (item.scanned || item.matched || item.stored) {
    notes.push(
      `掃描 ${formatNumber(item.scanned)} · 命中 ${formatNumber(
        item.matched,
      )} · 寫入 ${formatNumber(item.stored)}`,
    );
  }
  return `<div class="processing-archive is-${statusInfo(status).tone}">
    <div class="processing-archive-head">
      <span class="processing-archive-name mono">${escapeHtml(item.name)}</span>
      <div class="processing-archive-bar-wrap">
        ${progressBar({
          percent,
          status,
          color: running ? "var(--accent)" : "var(--success)",
        })}
      </div>
      <span class="processing-archive-percent mono">${
        indeterminate ? "進行中" : percentText(percent)
      }</span>
      ${statusBadge(status)}
      <span class="processing-archive-size faint">${formatBytes(item.size_bytes)}</span>
    </div>
    ${archiveStageCards(item)}
    ${
      notes.length
        ? `<div class="processing-archive-note">${notes
            .map((note) => `<span>${escapeHtml(note)}</span>`)
            .join("")}</div>`
        : ""
    }
  </div>`;
}

function archivesMarkup(snapshot) {
  const archives = snapshot.archives || {};
  const local = snapshot.local_archives || {};
  const items = Array.isArray(archives.items) ? archives.items : [];
  const run = archives.run;
  const heading = `<div class="report-section-head">
    <div>
      <div class="report-kicker">ARCHIVE PIPELINE</div>
      <h2 class="report-section-title">判決壓縮檔</h2>
      <p class="processing-section-sub">每個壓縮檔名稱後方即時顯示處理進度；未取得可計算的總量時標示「進度未知」，不以推測數值代替。</p>
    </div>
  </div>`;
  const sourceNote =
    archives.source === "run"
      ? `${statusBadge(run ? run.status : "idle")} <span>目前顯示 ${
          run ? escapeHtml(run.title || "判決匯入") : "最近一次匯入"
        } 的逐檔進度${run && run.started_at ? ` · ${escapeHtml(runBrief(run))}` : ""}</span>`
      : archives.external
        ? `${statusBadge("running")} <span>${escapeHtml(
            archives.note || "外部匯入程序未寫入逐檔狀態；以下為 PostgreSQL 覆蓋率。",
          )}</span>`
        : '<span class="faint">目前沒有可讀取的匯入 run 狀態；以下以 PostgreSQL 的 source_archive 判定是否已處理。</span>';
  return `<section class="report-card processing-card">
    <div class="report-head">${heading}</div>
    <div class="report-section">
      ${archiveAggregate(local)}
      <div class="processing-archive-run">${sourceNote}</div>
      ${
        items.length
          ? `<div class="processing-archive-list">${items.map(archiveRow).join("")}</div>`
          : `<div class="processing-empty">找不到 .rar 壓縮檔；請確認 ${escapeHtml(
              local.data_dir || "判決資料目錄",
            )}。</div>`
      }
    </div>
  </section>`;
}

function timelineMarkup(snapshot) {
  const timeline = snapshot.timeline || {};
  const stages = Array.isArray(timeline.stages) ? timeline.stages : [];
  const heading = `<div class="report-section-head">
    <div>
      <div class="report-kicker">ELAPSED COMPOSITION</div>
      <h2 class="report-section-title">整體處理時間</h2>
      <p class="processing-section-sub">長度依後端記錄的實際階段耗時比例排列；未執行或無法取得的階段不會被計入。</p>
    </div>
  </div>`;
  if (!timeline.available || !stages.length) {
    return `<section class="report-card processing-card">
      <div class="report-head">${heading}</div>
      <div class="report-section">
        <div class="processing-empty">${escapeHtml(
          timeline.label || "尚無可計算的階段耗時；執行資料更新或索引後會顯示。",
        )}</div>
      </div>
    </section>`;
  }
  const stack = stages
    .map(
      (stage) =>
        `<span class="processing-stack-segment" style="width:${Math.max(
          0,
          Number(stage.percent) || 0,
        )}%;background:${escapeHtml(stage.color || "var(--accent)")}" title="${escapeHtml(
          `${stage.label} ${formatDuration(stage.duration_ms)} (${percentText(
            stage.percent,
          )})`,
        )}"></span>`,
    )
    .join("");
  const legend = stages
    .map(
      (stage) => `<div class="processing-legend-item">
        <span class="processing-legend-swatch" style="background:${escapeHtml(
          stage.color || "var(--accent)",
        )}"></span>
        <span class="processing-legend-label">${escapeHtml(stage.label)}</span>
        <span class="mono">${formatDuration(stage.duration_ms)}</span>
        <span class="processing-legend-percent mono">${percentText(stage.percent)}</span>
        ${statusBadge(stage.status)}
      </div>`,
    )
    .join("");
  return `<section class="report-card processing-card">
    <div class="report-head">${heading}</div>
    <div class="report-section">
      <div class="processing-timeline-label">
        <span>${escapeHtml(timeline.label || "階段耗時")}</span>
        <span class="mono">總計 ${formatDuration(timeline.total_ms)}</span>
      </div>
      <div class="processing-stack" role="img" aria-label="階段耗時比例">${stack}</div>
      <div class="processing-legend">${legend}</div>
    </div>
  </section>`;
}

function recentRunsMarkup(snapshot) {
  const runs = Array.isArray(snapshot.recent_runs) ? snapshot.recent_runs : [];
  const labels = new Map(
    (snapshot.branches || []).map((branch) => [branch.key, branch.label]),
  );
  const heading = `<div class="report-section-head">
    <div>
      <div class="report-kicker">RECENT RUNS</div>
      <h2 class="report-section-title">最近處理紀錄</h2>
      <p class="processing-section-sub">包含資料更新、判決匯入、Parquet、Qdrant 與法規／命令下載。</p>
    </div>
  </div>`;
  if (!runs.length) {
    return `<section class="report-card processing-card">
      <div class="report-head">${heading}</div>
      <div class="report-section"><div class="processing-empty">尚無處理紀錄。</div></div>
    </section>`;
  }
  const rows = runs
    .map((run) => {
      const branchLabel =
        labels.get(run.branch) || BRANCH_FALLBACK_LABELS[run.branch] || run.branch || "—";
      return `<div class="processing-run">
        <div class="processing-run-head">
          <span class="badge badge-neutral">${escapeHtml(branchLabel)}</span>
          <strong>${escapeHtml(run.title || "處理")}</strong>
          ${statusBadge(run.status)}
          <span class="grow"></span>
          <span class="mono faint">${escapeHtml(
            formatDateTime(run.finished_at || run.started_at),
          )}</span>
          <span class="mono">${run.duration_ms ? formatDuration(run.duration_ms) : "—"}</span>
        </div>
        ${
          run.message
            ? `<div class="processing-run-message">${escapeHtml(run.message)}</div>`
            : ""
        }
      </div>`;
    })
    .join("");
  return `<section class="report-card processing-card">
    <div class="report-head">${heading}</div>
    <div class="report-section"><div class="processing-run-list">${rows}</div></div>
  </section>`;
}

function noticesMarkup(snapshot) {
  const items = Array.isArray(snapshot.notices) ? snapshot.notices : [];
  if (!items.length) return "";
  return `<div class="processing-notices">${items
    .map((item) =>
      notice({
        tone: item.tone || "info",
        title: item.title,
        text: escapeHtml(item.message || ""),
      }),
    )
    .join("")}</div>`;
}

function contentMarkup(snapshot) {
  return `${noticesMarkup(snapshot)}
    ${summaryMarkup(snapshot)}
    <section class="processing-flow-section">
      <div class="processing-section-head">
        <div>
          <div class="report-kicker">PIPELINE CANVAS</div>
          <h2 class="report-section-title">處理流程</h2>
          <p class="processing-section-sub">判決、法規、命令三條流程即時反映目前執行階段；曲線由來源節點連到各階段，發光節點與流動曲線表示目前執行位置。</p>
        </div>
      </div>
      ${flowCanvasMarkup(snapshot)}
    </section>
    ${archivesMarkup(snapshot)}
    ${timelineMarkup(snapshot)}
    ${recentRunsMarkup(snapshot)}`;
}

function errorMarkup(message, snapshot) {
  return `<div class="report-card processing-card">
    <div class="report-section">
      ${notice({
        tone: "danger",
        title: "無法取得資料處理狀態",
        text: escapeHtml(message || "未知錯誤"),
      })}
      ${
        snapshot
          ? `<p class="processing-section-sub">上次成功更新：${escapeHtml(
              formatDateTime(snapshot.generated_at),
            )}。畫面上沒有顯示替代或推測的進度。</p>`
          : ""
      }
      <div class="processing-error-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh">
          ${icon("refresh", 14)}<span>重新整理</span>
        </button>
      </div>
    </div>
  </div>`;
}

export async function render(root) {
  root.innerHTML = `<section class="page processing-page">
    <div class="page-header">
      <div>
        <div class="page-kicker">DATA PIPELINE</div>
        <h1 class="page-title">資料處理</h1>
        <p class="page-subtitle">即時追蹤判決、法規與命令的處理進度，檢查本機未處理壓縮檔，並可接續線上資料更新。</p>
      </div>
      <div class="page-actions processing-actions">
        <label class="processing-index-toggle" title="勾選後，資料更新完成匯入與 Parquet 會接續可中斷續跑的 Qdrant 索引">
          <input type="checkbox" id="processing-index-toggle" />
          <span>完成後接續 Qdrant 索引</span>
        </label>
        <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh" id="processing-refresh">
          ${icon("refresh", 14)}<span>重新整理</span>
        </button>
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${icon("x", 14)}<span>停止更新</span>
        </button>
        <button class="btn btn-primary btn-sm" type="button" data-processing-action="update" id="processing-update">
          ${icon("download", 14)}<span data-update-label>資料更新</span>
        </button>
      </div>
    </div>
    <div id="processing-root">
      <div class="processing-loading" role="status">
        <span class="spinner" aria-hidden="true"></span>
        <span>正在讀取處理狀態…</span>
      </div>
    </div>
  </section>`;

  const page = root.querySelector(".processing-page");
  const content = root.querySelector("#processing-root");
  const updateButton = root.querySelector("#processing-update");
  const stopButton = root.querySelector("#processing-stop");
  const refreshButton = root.querySelector("#processing-refresh");
  const indexToggle = root.querySelector("#processing-index-toggle");

  let disposed = false;
  let refreshing = false;
  let actionBusy = false;
  let lastSnapshot = null;
  let lastMarkup = "";
  let timer = null;

  const syncControls = (snapshot) => {
    const capabilities = snapshot.capabilities || {};
    const wantsIndex = Boolean(indexToggle && indexToggle.checked);
    const canStart = wantsIndex
      ? capabilities.can_start_update_with_index !== false
      : capabilities.can_start_update !== false;
    const reason = wantsIndex
      ? capabilities.index_blocked_reason || capabilities.start_blocked_reason
      : capabilities.start_blocked_reason;
    if (!actionBusy) {
      updateButton.disabled = !canStart;
      updateButton.title = reason || "檢查線上法規／命令，並處理未匯入的判決壓縮檔。";
      const labelElement = updateButton.querySelector("[data-update-label]");
      if (labelElement) {
        labelElement.textContent = canStart
          ? "資料更新"
          : capabilities.active_update_id
            ? "更新執行中"
            : "處理程序執行中";
      }
      stopButton.hidden = !capabilities.can_stop_update;
      if (indexToggle) indexToggle.disabled = capabilities.can_start_update === false;
    }
  };

  const refresh = async ({ silent = false } = {}) => {
    if (disposed || refreshing) return;
    refreshing = true;
    if (!silent) setBusy(refreshButton, true, "更新中…");
    try {
      const snapshot = await api.processing();
      if (disposed) return;
      lastSnapshot = snapshot;
      const markup = contentMarkup(snapshot);
      if (markup !== lastMarkup) {
        content.innerHTML = markup;
        lastMarkup = markup;
      }
      const updatedAt = content.querySelector("[data-processing-updated-at]");
      if (updatedAt) {
        const nextUpdatedAt = formatDateTime(snapshot.generated_at);
        if (updatedAt.textContent !== nextUpdatedAt) {
          updatedAt.textContent = nextUpdatedAt;
        }
      }
      syncControls(snapshot);
    } catch (error) {
      if (disposed) return;
      const markup = errorMarkup(error.message, lastSnapshot);
      if (markup !== lastMarkup) {
        content.innerHTML = markup;
        lastMarkup = markup;
      }
      if (!silent) toast(error.message || "無法取得資料處理狀態。", "danger", 6000);
    } finally {
      refreshing = false;
      if (!silent) setBusy(refreshButton, false);
    }
  };

  const startUpdate = async (button) => {
    if (actionBusy) return;
    actionBusy = true;
    setBusy(button, true, "啟動中…");
    try {
      const wantsIndex = Boolean(indexToggle && indexToggle.checked);
      const result = await api.startProcessingUpdate(wantsIndex);
      const indexNote = wantsIndex ? "，完成後接續 Qdrant 索引" : "";
      toast(`已啟動資料更新${indexNote}。`, "ok", 6000);
      if (result && result.run_id) {
        console.info("processing update started", result);
      }
      await refresh({ silent: true });
    } catch (error) {
      toast(error.message || "無法啟動資料更新。", "danger", 7000);
    } finally {
      actionBusy = false;
      setBusy(button, false);
      if (lastSnapshot) syncControls(lastSnapshot);
    }
  };

  const stopUpdate = async (button) => {
    if (actionBusy) return;
    actionBusy = true;
    setBusy(button, true, "停止中…");
    try {
      const result = await api.stopProcessingUpdate();
      toast(result.message || "已送出停止訊號。", "info", 6000);
      await refresh({ silent: true });
    } catch (error) {
      toast(error.message || "無法停止資料更新。", "danger", 7000);
    } finally {
      actionBusy = false;
      setBusy(button, false);
      if (lastSnapshot) syncControls(lastSnapshot);
    }
  };

  const onClick = (event) => {
    const button = event.target.closest("[data-processing-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.processingAction;
    if (action === "refresh") refresh({ silent: false });
    else if (action === "update") startUpdate(button);
    else if (action === "stop") stopUpdate(button);
  };

  const onChange = (event) => {
    if (event.target === indexToggle && lastSnapshot) {
      syncControls(lastSnapshot);
    }
  };

  page.addEventListener("click", onClick);
  if (indexToggle) indexToggle.addEventListener("change", onChange);

  await refresh({ silent: false });

  timer = window.setInterval(() => {
    if (!document.hidden) refresh({ silent: true });
  }, POLL_INTERVAL_MS);

  return () => {
    disposed = true;
    if (timer !== null) window.clearInterval(timer);
    page.removeEventListener("click", onClick);
    if (indexToggle) indexToggle.removeEventListener("change", onChange);
  };
}
