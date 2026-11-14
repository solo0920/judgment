import { api, apiUrl, subscribeRefresh } from "../api.js";
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

const OLLAMA_PRIORITY_WORKFLOWS = new Set([
  "legal_index_versions",
  "judgment_import",
  "index_versions",
]);

const STATUS_META = {
  running: { label: "執行中", tone: "info" },
  success: { label: "完成", tone: "ok" },
  partial: { label: "部分完成", tone: "warn" },
  update: { label: "更新", tone: "warn" },
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
  provided: { label: "外部提供", tone: "info" },
};

const FILE_TIMELINE_STAGES = ["download", "parquet", "postgres", "qdrant"];
const FILE_TIMELINE_STAGE_LABELS = {
  download: "下載",
  parquet: "Parquet",
  postgres: "PostgreSQL",
  qdrant: "Qdrant",
};
const FILE_TIMELINE_STATUS_LABELS = {
  complete: "完成",
  incomplete: "未完成",
  processing: "處理中",
  empty: "無資料",
  not_applicable: "已取代",
};
const FILE_TIMELINE_STATUS_CLASSES = {
  complete: "is-green",
  incomplete: "is-red",
  processing: "is-gray",
  empty: "is-empty",
  not_applicable: "is-empty",
};

const PHASE_META = {
  completed: { label: "upgraded", tone: "ok" },
  running: { label: "upgrading", tone: "info" },
  updating: { label: "updating", tone: "info" },
  updated: { label: "updated", tone: "ok" },
  update_available: { label: "可更新", tone: "warn" },
  pending: { label: "待執行", tone: "idle" },
  failed: { label: "失敗", tone: "danger" },
  skipped: { label: "未執行", tone: "idle" },
  ready: { label: "已就緒", tone: "info" },
  idle: { label: "待命", tone: "idle" },
};

let stageOperations = new Map();
// Keep the run button locked from the first click until the backend snapshot
// confirms the new run.  SSE refreshes may repaint the panel while the start
// request is still in flight, so this has to survive outside the click handler.
let pendingWorkflowId = "";
let pendingWorkflowBaselineRunId = "";

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
  legal_qdrant: "shield",
  ollama: "cloud",
  validate: "shield",
  download: "download",
  parse: "sliders",
};

const STAGE_FLOW_LABELS = {
  raw_parquet: "原始資料檢查",
  postgres: "PostgreSQL",
};

const DOWNLOAD_WORKFLOW_SOURCES = {
  law_download: "law",
  order_download: "order",
  judgment_download: "judgment",
};

const DOWNLOAD_WORKFLOW_LABELS = {
  law_download: "法規下載",
  order_download: "命令下載",
  judgment_download: "判決下載",
};

const DOWNLOAD_FORCE_CONFIRMATIONS = {
  law_download:
    "仍要強制重新下載並比對嗎？下載後會寫入原始 Parquet；若內容有變更才更新 PostgreSQL。",
  order_download:
    "仍要強制重新下載並比對嗎？下載後會寫入原始 Parquet；若內容有變更才更新 PostgreSQL。",
  judgment_download:
    "仍要強制重新下載判決 RAR 嗎？（不會自動匯入 PostgreSQL 或建立 Qdrant 索引）",
};

const WORKFLOW_SCOPE_NOTES = {
  law_download:
    "流程範圍：下載 ZIP → 原始 Parquet；內容有變更才解析條文並更新 PostgreSQL。法規 RAG 直接查詢 PostgreSQL，不寫入 Qdrant；IndexedDB 只保存瀏覽器提問紀錄。",
  order_download:
    "流程範圍：下載 ZIP → 原始 Parquet；內容有變更才解析條文並更新 PostgreSQL。命令 RAG 直接查詢 PostgreSQL，不寫入 Qdrant；IndexedDB 只保存瀏覽器提問紀錄。",
  judgment_download:
    "流程範圍：只下載判決 RAR。PostgreSQL／Parquet 匯入與 Qdrant 索引需另執行「判決匯入」或完整資料更新；IndexedDB 不參與資料管線。",
  judgment_import:
    "流程範圍：RAR → 原始資料檢查／Parquet 備份 → 金融法規篩選 → PostgreSQL。Qdrant 索引需另執行；IndexedDB 不參與資料管線。",
  judgment_parquet:
    "流程範圍：從 PostgreSQL 匯出查詢用 Parquet 快照；不寫入 Qdrant／IndexedDB。",
  index_versions:
    "流程範圍：建立並驗證新的 Qdrant collection，完成後原子切換 alias；IndexedDB 不參與。",
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

function phaseInfo(stage) {
  const phase = stage?.phase || "idle";
  if (PHASE_META[phase]) return PHASE_META[phase];
  return statusInfo(stage?.status || "idle");
}

function phaseBadge(stage) {
  const meta = phaseInfo(stage);
  return `<span class="badge ${TONE_CLASS[meta.tone] || TONE_CLASS.idle}"><span class="status-dot ${
    TONE_DOT[meta.tone] || TONE_DOT.idle
  }"></span>${escapeHtml(meta.label)}</span>`;
}

function operationLanes(stage, phase) {
  return (Array.isArray(stage.lanes) ? stage.lanes : []).map((lane) => ({
    ...lane,
    stage: {
      ...(lane.stage || {}),
      phase: phase === "completed" ? "completed" : "running",
      status: phase === "completed" ? "success" : "running",
      show_progress: true,
      current: phase === "completed" ? lane.stage?.current : 0,
      percent: phase === "completed" ? 100 : 0,
    },
  }));
}

function stageWithOperation(stage, id) {
  const operation = stageOperations.get(id);
  if (!operation) return stage;
  if (operation.kind === "check") {
    if (operation.phase === "updating") {
      return {
        ...stage,
        phase: "updating",
        status: "running",
        show_progress: true,
        percent: 0,
        cancelable: false,
        lanes: operationLanes(stage, "running"),
      };
    }
    return {
      ...stage,
      phase: "updated",
      status: "success",
      show_progress: true,
      percent: 100,
      cancelable: false,
      lanes: operationLanes(stage, "completed"),
    };
  }
  if (operation.kind === "upgrade") {
    if (stage.phase === "failed") {
      return stage;
    }
    if (stage.phase === "running" && stage.percent !== null) {
      return stage;
    }
    if (stage.phase === "completed") {
      const started = Date.parse(stage.last_run?.started_at || "");
      if (
        Number.isFinite(started) &&
        started >= Number(operation.startedAt || 0) - 1000
      ) {
        return stage;
      }
    }
    return {
      ...stage,
      phase: "running",
      status: "running",
      show_progress: true,
      percent: 0,
      upgrading: true,
      cancelable: true,
      lanes: operationLanes(stage, "running"),
    };
  }
  return stage;
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
  if (["skipped", "pending", "idle"].includes(stage.status)) {
    return "—";
  }
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

function processingActionButton(
  action,
  { primary = false, stageId = "" } = {},
) {
  if (!action) return "";
  const className = `btn ${primary ? "btn-primary" : "btn-secondary"} btn-sm`;
  if (action.kind === "check_updates") {
    return `<button class="${className}" type="button"
      data-processing-action="check-updates"
      data-stage-id="${escapeHtml(stageId)}"
      data-source-types="${escapeHtml((action.source_types || []).join(","))}">
      ${icon("refresh", 13)}<span>${escapeHtml(action.label || "重新檢查")}</span>
    </button>`;
  }
  if (action.kind === "run_workflow") {
    return `<button class="${className}" type="button"
      data-processing-action="run-workflow"
      data-stage-id="${escapeHtml(stageId)}"
      data-workflow-id="${escapeHtml(action.workflow_id || "")}">
      ${icon("play", 13)}<span>${escapeHtml(action.label || "執行更新")}</span>
    </button>`;
  }
  return `<button class="${className}" type="button" data-processing-action="refresh">
    ${icon("refresh", 13)}<span>${escapeHtml(action.label || "重新檢查")}</span>
  </button>`;
}

function processingStageCountBadges(stage) {
  const updateCount = Number(stage.update?.count) || 0;
  const pendingCount = Number(stage.pending?.count) || 0;
  const badges = [];
  if (updateCount > 0) {
    badges.push(`<span class="processing-wf-count is-update" title="${escapeHtml(
      `${formatNumber(updateCount)} 項線上更新`,
    )}">${icon("download", 11)}<strong>${formatNumber(updateCount)}</strong></span>`);
  }
  if (pendingCount > 0 && (!updateCount || pendingCount !== updateCount)) {
    badges.push(`<span class="processing-wf-count is-pending" title="${escapeHtml(
      `${formatNumber(pendingCount)} 項待執行工作`,
    )}">${icon("clock", 11)}<strong>${formatNumber(pendingCount)}</strong></span>`);
  }
  badges.push(phaseBadge(stage));
  return badges.join("");
}

function processingLaneValue(stage) {
  const current = stage.current;
  const total = stage.total;
  const unit = stage.unit === "bytes" ? "" : stage.unit || "筆";
  if (current === null || current === undefined) {
    return statusInfo(stage.status).label;
  }
  if (stage.unit === "bytes") {
    return total
      ? `${formatBytes(current)} / ${formatBytes(total)}`
      : formatBytes(current);
  }
  if (total && Number(total) !== Number(current)) {
    return `${formatNumber(current)} / ${formatNumber(total)} ${unit}`;
  }
  return `${formatNumber(current)} ${unit}`;
}

function processingRateText(stage) {
  if (!stage || stage.status !== "running") return "";
  const rate = Number(stage.rate);
  if (!Number.isFinite(rate) || rate <= 0) return "";
  if (stage.unit === "bytes") return `${formatBytes(rate)}/秒`;
  const unit = stage.unit || "筆";
  return `${formatNumber(Math.round(rate * 10) / 10)} ${unit}/秒`;
}

function processingLaneMetaValue(stage) {
  const value = processingLaneValue(stage);
  const rate = processingRateText(stage);
  return rate ? `${value} · ${rate}` : value;
}

function processingSourceDate(value) {
  if (!value) return "";
  const text = String(value).trim();
  const slash = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (slash) {
    return `${slash[1]}/${slash[2].padStart(2, "0")}/${slash[3].padStart(2, "0")}`;
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}/${String(date.getDate()).padStart(2, "0")}`;
}

function processingSourceInfo(stage) {
  const sources = [];
  if (Array.isArray(stage?.sources)) sources.push(...stage.sources);
  if (stage?.source) sources.push(stage.source);
  for (const lane of stage?.lanes || []) {
    if (lane.stage?.source) sources.push(lane.stage.source);
    if (Array.isArray(lane.stage?.sources)) {
      sources.push(...lane.stage.sources);
    }
  }
  const unique = [];
  const seen = new Set();
  for (const source of sources) {
    if (!source || (!source.downloaded_at && !source.update_date)) continue;
    const key = `${source.label || ""}:${source.version_id || ""}:${
      source.version_code || ""
    }:${source.downloaded_at || ""}:${source.update_date || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(source);
  }
  if (!unique.length) return null;
  const downloaded = [
    ...new Set(
      unique
        .map((source) => processingSourceDate(source.downloaded_at))
        .filter(Boolean),
    ),
  ];
  const tokens = unique
    .map((source) => {
      const name = source.label || "";
      if (source.version_code) {
        return [name, `#${source.version_code}`].filter(Boolean).join(" ");
      }
      const date = processingSourceDate(source.downloaded_at);
      return [name, date ? `下載 ${date}` : ""].filter(Boolean).join(" ");
    })
    .filter(Boolean);
  const parts = [];
  if (tokens.length) parts.push(tokens.join(" · "));
  if (downloaded.length) parts.push(`下載 ${downloaded.join("、")}`);
  const title = unique
    .map((source) => {
      const name = source.label || "資料";
      const versionCode = source.version_code
        ? `版本 ${source.version_code}`
        : source.version_id
          ? `#${source.version_id}`
          : "";
      const downloadedAt = source.downloaded_at
        ? `下載 ${formatDateTime(source.downloaded_at)}`
        : "";
      const updatedAt = source.update_date
        ? `來源版本 ${source.update_date}`
        : "";
      const counts =
        source.law_count !== undefined || source.article_count !== undefined
          ? `${formatNumber(source.law_count || 0)} 筆／${formatNumber(
              source.article_count || 0,
            )} 條文`
          : "";
      return [name, versionCode, downloadedAt, updatedAt, counts]
        .filter(Boolean)
        .join(" · ");
    })
    .join("；");
  return { text: parts.join(" · "), title };
}

function processingComparisonText(stage) {
  const comparison = stage?.comparison;
  if (!comparison) return "";
  if (comparison.unit === "bytes") {
    const local = comparison.local_size;
    const remote = comparison.remote_size;
    if (local === null || local === undefined) {
      return remote === null || remote === undefined
        ? comparison.message || "無法取得版本大小"
        : `本機無檔案 · 遠端 ${formatNumber(remote)} bytes`;
    }
    if (remote === null || remote === undefined) {
      return `本機 ${formatNumber(local)} bytes · 遠端大小未知`;
    }
    const diff = Number(remote) - Number(local);
    if (diff === 0) {
      const note =
        comparison.available && comparison.message
          ? `；檢查結果：${comparison.message}`
          : "";
      return `本機與遠端皆為 ${formatNumber(
        local,
      )} bytes（大小相同${note}）`;
    }
    const change =
      diff > 0
        ? `遠端多 ${formatNumber(diff)} bytes`
        : `遠端少 ${formatNumber(-diff)} bytes`;
    return `本機 ${formatNumber(local)} bytes → 遠端 ${formatNumber(
      remote,
    )} bytes（${change}）`;
  }
  if (comparison.unit === "months") {
    const local = Number(comparison.local_months || 0);
    const pending = Number(comparison.remote_pending || 0);
    return pending > 0
      ? `本機 ${formatNumber(local)} 個月 · 遠端待補 ${formatNumber(
          pending,
        )} 個月`
      : `本機 ${formatNumber(local)} 個月 · 遠端無待補月份`;
  }
  return comparison.message || "";
}

function processingLaneMarkup(lane, stage) {
  const laneStage = lane.stage || {};
  const showProgress = Boolean(stage?.show_progress);
  const meta = showProgress ? phaseInfo(laneStage) : phaseInfo(stage);
  const percent =
    laneStage.percent === null || laneStage.percent === undefined
      ? null
      : Math.max(0, Math.min(100, Number(laneStage.percent) || 0));
  const success =
    laneStage.phase === "completed" ||
    ["success", "no_change"].includes(laneStage.status);
  const showTrack = showProgress && percent !== null;
  const width = success ? 100 : percent ?? 0;
  const accent = lane.accent || barColor(stage);
  const fillColor = success ? "var(--surface-3)" : accent;
  const label = lane.label || lane.source || "資料";
  const versionCode = laneStage.source?.version_code
    ? `#${laneStage.source.version_code}`
    : "";
  const comparison = processingComparisonText(laneStage);
  const message = String(laneStage.message || "").trim();
  const idleText = comparison || message || meta.label;
  const metaValue =
    showProgress && comparison
      ? comparison
      : processingLaneMetaValue(laneStage);
  const duration = Number(laneStage.duration_ms) || 0;
  const running = !success && laneStage.phase === "running";
  const title = [
    label,
    versionCode,
    meta.label,
    comparison,
    showProgress && percent !== null ? percentText(percent) : "",
    processingLaneMetaValue(laneStage),
    message,
  ]
    .filter(Boolean)
    .join(" · ");
  const bar = showTrack
    ? `<span class="processing-bar processing-wf-lane-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${
        success ? 100 : Math.round(width)
      }" aria-label="${escapeHtml(title)}">
      <span class="processing-bar-fill${
        success ? " is-completed" : ""
      }" style="width:${width}%;background:${escapeHtml(fillColor)}"></span>
    </span>`
    : `<span class="processing-wf-lane-idle" title="${escapeHtml(
        comparison || message || idleText,
      )}">${escapeHtml(showProgress ? meta.label : idleText)}</span>`;
  return `<span class="processing-wf-lane${
    success ? " is-completed" : ""
  }${running ? " is-running" : ""}" style="--lane-accent:${escapeHtml(
    accent,
  )}" title="${escapeHtml(title)}">
    <span class="processing-wf-lane-head">
      <span class="processing-wf-lane-swatch" aria-hidden="true"></span>
      <span class="processing-wf-lane-label">${escapeHtml(label)}${
        versionCode
          ? `<small title="${escapeHtml(
              laneStage.source?.downloaded_at
                ? `下載 ${formatDateTime(laneStage.source.downloaded_at)}`
                : versionCode,
            )}">${escapeHtml(versionCode)}</small>`
          : ""
      }</span>
      ${phaseBadge(laneStage)}
      ${
        showTrack
          ? `<span class="processing-wf-lane-percent${
              success ? " is-completed" : ""
            }">${percentText(percent)}</span>`
          : ""
      }
    </span>
    ${bar}
    <span class="processing-wf-lane-meta">
      <span class="processing-wf-lane-count" title="${escapeHtml(
        metaValue,
      )}">${escapeHtml(metaValue || "—")}</span>
      ${duration ? `<span class="mono">${formatDuration(duration)}</span>` : ""}
      ${
        showTrack && message
          ? `<span class="processing-wf-lane-message" title="${escapeHtml(
              message,
            )}">${escapeHtml(message)}</span>`
          : ""
      }
    </span>
  </span>`;
}

function processingWorkItemMarkup(item) {
  const meta = statusInfo(item.status);
  const count = Number(item.count) || 0;
  const iconName =
    item.status === "update"
      ? "download"
      : item.status === "failed"
        ? "alert"
        : item.status === "success"
          ? "check"
          : "clock";
  return `<div class="processing-wf-work-item is-${meta.tone}">
    <span class="processing-wf-work-icon">${icon(iconName, 13)}</span>
    <div class="processing-wf-work-copy">
      <div class="processing-wf-work-title">
        <strong>${escapeHtml(item.label || "待處理")}</strong>
        ${count > 1 ? `<span class="processing-wf-work-count">${formatNumber(count)}</span>` : ""}
      </div>
      ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ""}
      ${
        item.checked_at
          ? `<small>檢查於 ${escapeHtml(formatDateTime(item.checked_at))}</small>`
          : ""
      }
    </div>
  </div>`;
}

function processingLaneFactsMarkup(lane, parentStage = {}) {
  const stage = lane.stage || {};
  const model = stage.model || parentStage.model || {};
  const usesModel = model.role === "embedding";
  const stats = [
    ...(Array.isArray(stage.stats) ? stage.stats : []),
    { label: "主機", value: model.host || "—" },
    { label: "Model", value: usesModel ? model.model || "—" : "不使用模型" },
  ];
  const lastRun = stage.last_run || {};
  const lastRunAt = lastRun.finished_at || lastRun.started_at || "";
  return `<div class="processing-wf-fact" style="--lane-accent:${escapeHtml(
    lane.accent || "var(--accent)",
  )}">
    <div class="processing-wf-fact-head">
      <span class="processing-wf-fact-label"><i aria-hidden="true"></i>${escapeHtml(
        lane.label || lane.source || "資料",
      )}</span>
      ${phaseBadge(stage)}
      <span class="processing-wf-fact-value">${escapeHtml(
        processingLaneMetaValue(stage),
      )}</span>
    </div>
    ${
      stage.message
        ? `<p class="processing-wf-fact-message">${escapeHtml(stage.message)}</p>`
        : ""
    }
    ${
      stats.length || lastRunAt
        ? `<div class="processing-wf-fact-stats">${stats
            .map(
              (item) =>
                `<span><span>${escapeHtml(item.label || "")}</span><strong>${escapeHtml(
                  item.value || "—",
                )}</strong></span>`,
            )
            .join("")}${
            lastRunAt
              ? `<span><span>上次執行</span><strong>${escapeHtml(
                  formatDateTime(lastRunAt),
                )}</strong></span>`
              : ""
          }</div>`
        : ""
    }
  </div>`;
}

function processingStageDetailsMarkup(stage) {
  const updateItems = Array.isArray(stage.update?.items)
    ? stage.update.items
    : [];
  const pendingItems = Array.isArray(stage.pending?.items)
    ? stage.pending.items
    : [];
  const updateIds = new Set(updateItems.map((item) => item.id));
  const pendingOnly = pendingItems.filter((item) => !updateIds.has(item.id));
  const lanes = Array.isArray(stage.lanes) ? stage.lanes : [];
  const embeddingStrip =
    stage.key === "legal_qdrant"
      ? '<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>'
      : "";
  return `<div class="processing-wf-details">
    ${embeddingStrip}
    ${
      updateItems.length
        ? `<div class="processing-wf-work-group">
            <div class="processing-wf-work-head">
              <span class="processing-wf-work-kicker">${icon("download", 12)}可更新內容</span>
              <span class="badge badge-warn">${formatNumber(
                Number(stage.update?.count) || updateItems.length,
              )}</span>
            </div>
            <div class="processing-wf-work-list">${updateItems
              .map(processingWorkItemMarkup)
              .join("")}</div>
          </div>`
        : ""
    }
    ${
      pendingOnly.length
        ? `<div class="processing-wf-work-group">
            <div class="processing-wf-work-head">
              <span class="processing-wf-work-kicker">${icon("clock", 12)}待執行工作</span>
              <span class="badge badge-neutral">${formatNumber(
                Number(stage.pending?.count) || pendingOnly.length,
              )}</span>
            </div>
            <div class="processing-wf-work-list">${pendingOnly
              .map(processingWorkItemMarkup)
              .join("")}</div>
          </div>`
        : ""
    }
    ${
      lanes.length
        ? `<div class="processing-wf-facts">${lanes
            .map((lane) => processingLaneFactsMarkup(lane, stage))
            .join("")}</div>`
        : ""
    }
    ${
      stage.note
        ? `<p class="processing-wf-note">${icon("info", 12)}<span>${escapeHtml(
            stage.note,
          )}</span></p>`
        : ""
    }
  </div>`;
}

function processingRecheckIconButton(action, stageId = "") {
  if (!action) return "";
  if (action.kind === "check_updates") {
    return `<button class="processing-wf-icon-btn is-label" type="button"
      data-processing-action="check-updates"
      data-stage-id="${escapeHtml(stageId)}"
      data-source-types="${escapeHtml((action.source_types || []).join(","))}"
      title="更新狀態" aria-label="更新狀態">${icon("refresh", 14)}<span>update</span></button>`;
  }
  return `<button class="processing-wf-icon-btn is-label" type="button"
    data-processing-action="refresh" data-stage-id="${escapeHtml(stageId)}"
    title="更新狀態" aria-label="更新狀態">${icon("refresh", 14)}<span>refresh</span></button>`;
}

function processingStageRailMarkup(stage, stageId = "") {
  const actions = Array.isArray(stage.actions) ? stage.actions : [];
  const lanes = Array.isArray(stage.lanes) ? stage.lanes : [];
  const running =
    stage.status === "running" ||
    lanes.some((lane) => lane.stage?.status === "running");
  const cancelable = running && stage.cancelable !== false;
  return `<span class="processing-wf-rail">
    <span class="processing-wf-rail-top">
      ${processingStageCountBadges(stage)}
      ${processingRecheckIconButton(stage.recheck, stageId)}
    </span>
    <span class="processing-wf-rail-actions">
      ${
        actions.length
          ? actions
              .map((action) =>
                processingActionButton(action, {
                  primary: true,
                  stageId,
                }),
              )
              .join("")
          : `<button class="btn btn-primary btn-sm" type="button" disabled
              title="此階段目前沒有可執行的工作">${icon("play", 13)}<span>升級</span></button>`
      }
      <button class="btn btn-secondary btn-sm processing-wf-cancel" type="button"
        data-processing-action="stop"
        title="${cancelable ? "取消目前執行中的處理程序" : "目前沒有可取消的程序"}"
        ${cancelable ? "" : "disabled"}>${icon("x", 13)}<span>取消</span></button>
    </span>
  </span>`;
}

function processingStageMarkup(section, stage, index, expandedStages) {
  const id = `${section.key || "section"}-${stage.key || index}`;
  const effectiveStage = stageWithOperation(stage, id);
  const lanes = Array.isArray(effectiveStage.lanes)
    ? effectiveStage.lanes
    : [];
  const statusKey = effectiveStage.status || "idle";
  const meta = phaseInfo(effectiveStage);
  const percent = effectiveStage.percent;
  const showPercent =
    Boolean(effectiveStage.show_progress) &&
    percent !== null &&
    percent !== undefined;
  const durations = lanes
    .map((lane) => Number(lane.stage?.duration_ms) || 0)
    .filter((value) => value > 0);
  const duration = durations.length ? Math.max(...durations) : 0;
  const counts = lanes
    .map(
      (lane) =>
        `${lane.label || lane.source || "資料"} ${processingLaneValue(lane.stage || {})}`,
    )
    .join(" · ");
  const message = String(effectiveStage.message || "").trim();
  const sourceInfo = processingSourceInfo(effectiveStage);
  const model = effectiveStage.model || {};
  const usesModel = model.role === "embedding";
  const modelLabel = usesModel
    ? model.label || `${model.host || "—"}:${model.model || "—"}`
    : "不使用模型";
  return `<details class="processing-wf-stage is-${meta.tone}" data-processing-stage="${escapeHtml(
    id,
  )}" ${expandedStages.has(id) ? "open" : ""}>
    <summary class="processing-wf-summary"
      data-stage-key="${escapeHtml(id)}"
      data-stage-status-key="${escapeHtml(statusKey)}"
      data-stage-status="${escapeHtml(meta.label)}"
      data-stage-label="${escapeHtml(`${section.label || ""} · ${effectiveStage.label || effectiveStage.key}`)}"
      data-stage-color="${escapeHtml(barColor(effectiveStage))}"
      data-stage-percent="${escapeHtml(showPercent ? percentText(percent) : "—")}"
      data-stage-contribution="${escapeHtml(String(lanes.length))}"
      data-stage-contribution-label="資料線"
      data-stage-duration="${escapeHtml(
        duration ? formatDuration(duration) : "—",
      )}"
      data-stage-counts="${escapeHtml(counts || "—")}"
      data-stage-message="${escapeHtml(message)}"
      data-stage-update="${escapeHtml(String(Number(effectiveStage.update?.count) || 0))}"
      data-stage-pending="${escapeHtml(String(Number(effectiveStage.pending?.count) || 0))}">
      <span class="processing-wf-summary-main">
        <span class="processing-wf-step">${String(index + 1).padStart(2, "0")}</span>
        <span class="processing-wf-stage-icon" style="--stage-color:${escapeHtml(
          barColor(effectiveStage),
        )}">${icon(STAGE_ICONS[effectiveStage.key] || "cube", 15)}</span>
        <span class="processing-wf-stage-copy">
          <strong>${escapeHtml(
            effectiveStage.label || effectiveStage.key,
          )}</strong>
          <small>${escapeHtml(
            effectiveStage.short_label || effectiveStage.key || "",
          )} · ${formatNumber(lanes.length)} 條資料線</small>
          <small class="processing-wf-stage-model" title="${escapeHtml(
            usesModel ? model.url || modelLabel : "此階段不使用模型",
          )}">${escapeHtml(modelLabel)}</small>
        </span>
        ${
          showPercent
            ? `<span class="processing-wf-stage-percent${
                effectiveStage.phase === "completed" ? " is-completed" : ""
              }">${percentText(percent)}</span>`
            : ""
        }
        ${
          sourceInfo
            ? `<span class="processing-wf-stage-source" title="${escapeHtml(
                sourceInfo.title,
              )}">${escapeHtml(sourceInfo.text)}</span>`
            : ""
        }
        <span class="processing-wf-chevron">${icon("chevronDown", 14)}</span>
      </span>
      <span class="processing-wf-lanes">${lanes
        .map((lane) => processingLaneMarkup(lane, effectiveStage))
        .join("")}</span>
      ${processingStageRailMarkup(effectiveStage, id)}
    </summary>
    ${processingStageDetailsMarkup(effectiveStage)}
  </details>`;
}

function processingVersionsMarkup(section) {
  const versions = Array.isArray(section.versions)
    ? section.versions
    : [];
  if (!versions.length) return "";
  const columns = [
    "來源",
    "版本編號",
    "下載時間",
    "來源版本",
    "筆數／條文",
  ];
  return `<div class="processing-wf-versions">
    <div class="processing-wf-versions-title">
      <span>版本編號表</span>
      <span class="mono">YYYYMMDDHHMM</span>
    </div>
    <div class="processing-wf-versions-scroll">
      <div class="processing-wf-version-grid processing-wf-version-head">${columns
        .map((column) => `<span>${escapeHtml(column)}</span>`)
        .join("")}</div>
      ${versions
        .map(
          (version) => `<div class="processing-wf-version-grid processing-wf-version-row">
            <strong>${escapeHtml(version.label || version.source_type || "—")}</strong>
            <code>${escapeHtml(version.version_code || "—")}</code>
            <span>${escapeHtml(formatDateTime(version.downloaded_at))}</span>
            <span>${escapeHtml(
              processingSourceDate(version.update_date) || "—",
            )}</span>
            <span>${formatNumber(version.law_count || 0)} 筆／${formatNumber(
              version.article_count || 0,
            )} 條文</span>
          </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

function processingSectionMarkup(section, expandedStages) {
  const stages = Array.isArray(section.stages) ? section.stages : [];
  const updateCount = Number(section.update_count) || 0;
  const pendingCount = Number(section.pending_count) || 0;
  const accent = section.accent || "var(--accent)";
  const sources = Array.isArray(section.sources) ? section.sources : [];
  const updateStage = stages.find(
    (stage) => Number(stage.update?.count) > 0,
  );
  const pendingStage =
    stages.find(
      (stage) =>
        Number(stage.pending?.count) > 0 &&
        Number(stage.update?.count) === 0,
    ) || stages.find((stage) => Number(stage.pending?.count) > 0);
  const stageId = (stage) =>
    stage ? `${section.key || "section"}-${stage.key || ""}` : "";
  return `<section class="report-card processing-card processing-wf-section" style="--section-accent:${escapeHtml(
    accent,
  )}">
    <div class="report-head processing-wf-section-head">
      <div class="processing-wf-section-title">
        <span class="processing-wf-section-icon">${icon(
          section.icon || "activity",
          17,
        )}</span>
        <div>
          <div class="report-kicker">DATA WATERFALL</div>
          <h2 class="report-section-title">${escapeHtml(section.label || "")}</h2>
          <p class="processing-section-sub">${escapeHtml(
            section.description || "",
          )}</p>
        </div>
      </div>
      <div class="processing-wf-section-actions">
        ${
          updateCount
            ? `<button class="processing-wf-section-count is-update" type="button"
                data-processing-action="open-stage"
                data-stage-id="${escapeHtml(stageId(updateStage))}"
                title="展開可更新內容">${icon(
                  "download",
                  13,
                )}<strong>${formatNumber(updateCount)}</strong><span>線上更新</span></button>`
            : ""
        }
        ${
          pendingCount
            ? `<button class="processing-wf-section-count is-pending" type="button"
                data-processing-action="open-stage"
                data-stage-id="${escapeHtml(stageId(pendingStage))}"
                title="展開待執行工作">${icon(
                  "clock",
                  13,
                )}<strong>${formatNumber(pendingCount)}</strong><span>待執行</span></button>`
            : ""
        }
        ${statusBadge(section.status || "idle")}
        ${processingActionButton(section.recheck)}
      </div>
    </div>
    <div class="report-section processing-wf-body">
      ${processingVersionsMarkup(section)}
      <div class="processing-wf-legend">
        <span class="processing-wf-legend-item">${icon("download", 12)}線上更新</span>
        <span class="processing-wf-legend-item">${icon("clock", 12)}待執行工作</span>
        ${sources
          .map(
            (source) =>
              `<span class="processing-wf-source" style="--source-accent:${escapeHtml(
                source.accent || accent,
              )}"><i aria-hidden="true"></i>${escapeHtml(
                source.label || source.key || "",
              )}</span>`,
          )
          .join("")}
        <span class="processing-wf-legend-hint">點選任一階段展開工作清單；滑鼠移到階段可快速查看狀態。</span>
      </div>
      <div class="processing-wf-stages">${stages
        .map((stage, index) =>
          processingStageMarkup(section, stage, index, expandedStages),
        )
        .join("")}</div>
    </div>
  </section>`;
}

function processingSectionsMarkup(snapshot, expandedStages = new Set()) {
  const sections = Array.isArray(snapshot.sections) ? snapshot.sections : [];
  if (!sections.length) return flowCanvasMarkup(snapshot);
  return `<div class="processing-wf-overview">${sections
    .map((section) => processingSectionMarkup(section, expandedStages))
    .join("")}</div>`;
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
      "原始資料備份",
      rawAvailable ? `${formatNumber(raw.count)} 檔` : statusBadge("unavailable"),
      rawAvailable
        ? `共 ${formatNumber(rawTotals.row_count)} 筆 · ${formatBytes(
            rawTotals.compressed_bytes,
          )}`
        : escapeHtml(raw.error || "無法掃描原始資料備份。"),
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
      <p class="processing-section-sub">包含資料更新、判決下載、判決匯入、Parquet、Qdrant 與法規／命令下載。</p>
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

function processingTimelineStageWorkflow(timelineKey, stage) {
  if (timelineKey === "law" || timelineKey === "order") {
    return stage === "qdrant" ? "legal_index_versions" : `${timelineKey}_download`;
  }
  if (timelineKey === "judgment") {
    if (stage === "download") return "judgment_download";
    if (stage === "parquet" || stage === "postgres") return "judgment_import";
    if (stage === "qdrant") return "index_versions";
  }
  return "";
}

function timelineMonthCellMarkup({
  month,
  year,
  monthNo,
  stageOrder,
  stageLabels,
  stageStatuses,
  overall,
  active,
  workflowForStage,
}) {
  const statuses = stageStatuses || {};
  const monthKey = String(
    month?.month || `${year}${String(monthNo).padStart(2, "0")}`,
  );
  const monthLabel =
    month?.month_label || `${year}-${String(monthNo).padStart(2, "0")}`;
  const stageTitle = stageOrder
    .map(
      (stage) =>
        `${stageLabels[stage] || stage}：${
          FILE_TIMELINE_STATUS_LABELS[statuses[stage] || "empty"]
        }`,
    )
    .join(" · ");
  const versionCodes = (month?.versions || [])
    .map((version) => version.version_code)
    .filter(Boolean);
  const fileNames = [
    ...new Set([
      ...(month?.files || []),
      ...(month?.local_files || []),
      ...(month?.imported_files || []),
    ]),
  ].filter(Boolean);
  const detail = versionCodes.length
    ? ` · 版本 ${versionCodes.join("、")}`
    : fileNames.length
      ? ` · ${fileNames.join("、")}`
      : "";
  const title = month
    ? `${monthLabel} · ${stageTitle}${detail}`
    : `${monthLabel} · 無資料`;
  const segments = stageOrder
    .map((stage) => {
      const status = statuses[stage] || "empty";
      const workflowId =
        status === "incomplete" ? workflowForStage(stage) : "";
      const tag = workflowId ? "button" : "span";
      const action = workflowId
        ? ` type="button" data-timeline-workflow="${escapeHtml(workflowId)}"`
        : "";
      return `<${tag} class="processing-month-stage ${
        FILE_TIMELINE_STATUS_CLASSES[status] || "is-empty"
      }${workflowId ? " is-actionable" : ""}"${action} title="${escapeHtml(
        `${stageLabels[stage] || stage}：${
          FILE_TIMELINE_STATUS_LABELS[status]
        }${workflowId ? "（點選前往處理）" : ""}`,
      )}" aria-label="${escapeHtml(
        `${monthLabel} ${stageLabels[stage] || stage} ${
          FILE_TIMELINE_STATUS_LABELS[status]
        }${workflowId ? "，點選前往處理" : ""}`,
      )}"></${tag}>`;
    })
    .join("");
  return `<td class="judgment-month import-month processing-month${
    active ? " is-current" : ""
  } is-${escapeHtml(overall)}" data-month="${escapeHtml(
    monthKey,
  )}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}"${
    active ? ' aria-current="true"' : ""
  }>
    <span class="processing-month-number">${monthNo}</span>
    <span class="processing-month-stages">${segments}</span>
  </td>`;
}

function processingTimelineMonthCell(timeline, month, year, monthNo) {
  return timelineMonthCellMarkup({
    month,
    year,
    monthNo,
    stageOrder: FILE_TIMELINE_STAGES,
    stageLabels: FILE_TIMELINE_STAGE_LABELS,
    stageStatuses: month?.stages || {},
    overall: month?.overall || "empty",
    active: Boolean(month?.active),
    workflowForStage: (stage) =>
      processingTimelineStageWorkflow(timeline.key, stage),
  });
}

function importActiveRowMarkup({
  activeMonth,
  activeArchive,
  activePhase = "",
  processingMonth = "",
  processingArchive = "",
  stageLabels = {},
}) {
  if (!activeMonth || !activeArchive) return "";
  const monthLabel = `${String(activeMonth).slice(0, 4)}-${String(
    activeMonth,
  ).slice(4, 6)}`;
  const phaseLabel =
    stageLabels[activePhase] || (activePhase ? "準備中" : "");
  const processingLabel = `${String(processingMonth || "").slice(
    0,
    4,
  )}-${String(processingMonth || "").slice(4, 6)}`;
  const processingDiffers =
    Boolean(processingMonth) &&
    (processingMonth !== activeMonth ||
      processingArchive !== activeArchive);
  return `<span class="badge badge-info">${icon(
    "activity",
    11,
  )}目前匯入</span>
    <strong class="mono">${escapeHtml(monthLabel)}</strong>
    <span class="mono">${escapeHtml(activeArchive)}</span>
    ${
      phaseLabel
        ? `<span class="badge badge-neutral">${escapeHtml(phaseLabel)}</span>`
        : ""
    }
    ${
      processingDiffers
        ? `<span class="processing-current-processing">
            <span class="faint">處理中</span>
            <strong class="mono">${escapeHtml(processingLabel)}</strong>
            <span class="mono">${escapeHtml(processingArchive || "—")}</span>
          </span>`
        : ""
    }`;
}

function importTimelineMonthCell(timeline, month, year, monthNo) {
  const stageOrder =
    Array.isArray(timeline.stage_order) && timeline.stage_order.length
      ? timeline.stage_order
      : ["extract", "raw_parquet", "filter", "postgres"];
  const stageLabels = timeline.stage_labels || {
    extract: "RAR 檢查／解壓縮",
    raw_parquet: "原始資料檢查／Parquet 備份",
    filter: "金融法規篩選",
    postgres: "PostgreSQL metadata",
  };
  return timelineMonthCellMarkup({
    month,
    year,
    monthNo,
    stageOrder,
    stageLabels,
    stageStatuses: month?.import_stages || {},
    overall: month?.import_overall || "empty",
    active: Boolean(month?.active),
    workflowForStage: () => "judgment_import",
  });
}

function processingTimelineYearRow(timeline, year, byMonth) {
  const cells = [];
  for (let monthNo = 1; monthNo <= 12; monthNo += 1) {
    const key = `${year}${String(monthNo).padStart(2, "0")}`;
    cells.push(
      processingTimelineMonthCell(timeline, byMonth.get(key), year, monthNo),
    );
  }
  return `<tr><th scope="row">${year}</th>${cells.join("")}</tr>`;
}

function processingTimelineModelsMarkup(timeline) {
  const models = timeline?.models || {};
  const items = [
    ["Embedding", models.embedding],
    ["Rerank", models.rerank],
  ]
    .filter(([, model]) => model && (model.label || model.model))
    .map(([label, model]) => {
      const value =
        model.label ||
        [model.host, model.model].filter(Boolean).join(" ") ||
        "—";
      const title = [
        `${label} 主機與模型：${value}`,
        model.url ? `端點：${model.url}` : "",
        label === "Rerank" && model.enabled === false
          ? "RAG_RERANK_ENABLED=false"
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return `<span class="processing-timeline-model" title="${escapeHtml(
        title,
      )}"><span>${label}</span><strong class="mono">${escapeHtml(
        value,
      )}</strong>${
        label === "Rerank" && model.enabled === false
          ? "<em>未啟用</em>"
          : ""
      }</span>`;
    });
  return items.length
    ? `<span class="processing-timeline-models">${items.join("")}</span>`
    : "";
}

function processingTimelinesMarkup(snapshot) {
  const timelines = Array.isArray(snapshot.file_timelines)
    ? snapshot.file_timelines
    : [];
  if (!timelines.length) {
    return `<div class="processing-workflow-empty">目前沒有可顯示的處理時間表。</div>`;
  }
  return `<div class="processing-timeline-overview">${timelines
    .map((timeline) => {
      const months = Array.isArray(timeline.months) ? timeline.months : [];
      const byMonth = new Map(
        months.map((month) => [String(month.month || ""), month]),
      );
      const years = [...new Set(months.map((month) => Number(month.year)))]
        .filter((year) => Number.isFinite(year))
        .sort((left, right) => right - left);
      const summary = timeline.summary || {};
      const current = timeline.current || null;
      return `<section class="report-card processing-card import-files-card processing-timeline-card" data-processing-timeline="${escapeHtml(
        timeline.key || "",
      )}">
        <div class="side-card-head">
          <span class="processing-timeline-head-main">
            <span class="side-card-title">${icon(
              timeline.icon || "activity",
              14,
            )}${escapeHtml(
              timeline.title || `${timeline.label || ""}處理時間表`,
            )}</span>
            ${processingTimelineModelsMarkup(timeline)}
          </span>
          <span class="badge badge-neutral">${formatNumber(
            timeline.total_months || 0,
          )} 個月</span>
        </div>
        <div class="judgment-months index-months">
          <div class="judgment-months-meta">
            <span class="badge badge-ok">完成 ${formatNumber(
              summary.complete || 0,
            )}</span>
            <span class="badge badge-danger">未完成 ${formatNumber(
              summary.incomplete || 0,
            )}</span>
            <span class="badge badge-neutral">處理中 ${formatNumber(
              summary.processing || 0,
            )}</span>
            <span class="badge badge-info">有更新 ${formatNumber(
              summary.update || 0,
            )}</span>
            <span class="muted">共 ${formatNumber(
              timeline.total_months || 0,
            )} 個月</span>
          </div>
          ${
            current
              ? `<div class="index-current-row">
                  <span class="badge badge-info">${icon(
                    "activity",
                    11,
                  )}${escapeHtml(current.label || "目前")}</span>
                  <strong class="mono">${escapeHtml(
                    current.month_label || "—",
                  )}</strong>
                  <span class="mono">${escapeHtml(current.file || "—")}</span>
                  ${
                    current.detail
                      ? `<span class="muted">${escapeHtml(
                          current.detail,
                        )}</span>`
                      : ""
                  }
                </div>`
              : ""
          }
          ${
            months.length
              ? `<div class="judgment-months-scroll">
                  <table class="judgment-months-table import-months-table processing-months-table">
                    <thead><tr><th scope="col">年份</th>${Array.from(
                      { length: 12 },
                      (_, index) =>
                        `<th scope="col">${index + 1}</th>`,
                    ).join("")}</tr></thead>
                    <tbody>${years
                      .map((year) =>
                        processingTimelineYearRow(timeline, year, byMonth),
                      )
                      .join("")}</tbody>
                  </table>
                </div>`
              : '<div class="processing-workflow-empty">目前沒有資料。</div>'
          }
          <div class="processing-timeline-key">
            ${["complete", "incomplete", "processing", "empty"]
              .map(
                (status) =>
                  `<span><i class="processing-timeline-swatch ${
                    FILE_TIMELINE_STATUS_CLASSES[status]
                  }"></i>${FILE_TIMELINE_STATUS_LABELS[status]}</span>`,
              )
              .join("")}
            <span class="processing-timeline-key-order">每格由左至右：下載／Parquet／PostgreSQL／Qdrant</span>
          </div>
          <p class="judgment-months-hint">${
            timeline.key === "judgment"
              ? "判決以裁判書月份顯示。"
              : "法規／命令以來源版本月份顯示。"
          }綠色：完成；紅色：未完成；灰色：處理中；空白：無資料。滑鼠移到月份或色塊可查看各階段狀態。</p>
        </div>
      </section>`;
    })
    .join("")}</div>`;
}

function contentMarkup(snapshot, expandedStages = new Set()) {
  return `${noticesMarkup(snapshot)}
    ${summaryMarkup(snapshot)}
    ${processingTimelinesMarkup(snapshot)}
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

function morphNode(current, next) {
  if (current.nodeType !== next.nodeType || current.nodeName !== next.nodeName) {
    current.replaceWith(next.cloneNode(true));
    return;
  }
  if (current.nodeType === Node.TEXT_NODE) {
    if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
    return;
  }
  if (current.nodeType !== Node.ELEMENT_NODE) return;
  for (const attribute of [...current.attributes]) {
    if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of [...next.attributes]) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
  // Slots such as the embedding strip and judgment month table are filled by
  // their own sync functions.  Keep their current children so polling does
  // not replace a loaded table with a loading skeleton every two seconds.
  if (next.hasAttribute("data-preserve-children")) return;
  morphChildren(current, next);
}

function morphChildren(currentParent, nextParent) {
  const currentNodes = [...currentParent.childNodes];
  const nextNodes = [...nextParent.childNodes];
  const shared = Math.min(currentNodes.length, nextNodes.length);
  for (let index = 0; index < shared; index += 1) {
    morphNode(currentNodes[index], nextNodes[index]);
  }
  for (let index = shared; index < currentNodes.length; index += 1) {
    currentNodes[index].remove();
  }
  for (let index = shared; index < nextNodes.length; index += 1) {
    currentParent.appendChild(nextNodes[index].cloneNode(true));
  }
}

function morphMarkup(element, markup) {
  const template = document.createElement("template");
  template.innerHTML = markup;
  morphChildren(element, template.content);
}

const WORKFLOW_ICONS = {
  overview: "activity",
  law_download: "layers",
  order_download: "file",
  judgment_download: "download",
  judgment_import: "database",
  judgment_parquet: "cube",
  index_versions: "brain",
  normalize_courts: "filter",
  backfill_law_articles: "history",
};

function workflowItems(snapshot) {
  const workflows = Array.isArray(snapshot.workflows) ? snapshot.workflows : [];
  const mapped = workflows.map((workflow) => {
    const activeRun = workflow.active_run || null;
    const lastRun = activeRun || workflow.last_run || null;
    return {
      ...workflow,
      activeRun,
      lastRun,
      status: activeRun
        ? activeRun.status || "running"
        : workflow.update_available
          ? "update"
          : lastRun?.status || "idle",
    };
  });
  // Keep the optional export action at the bottom of the sidebar without
  // changing the backend workflow catalog or execution order.
  const parquet = mapped.find((item) => item.id === "judgment_parquet");
  return [
    {
      id: "overview",
      label: "處理總覽",
      description: "目前流程、壓縮檔與最近執行紀錄",
      status: snapshot.status || "idle",
      activeRun: null,
      lastRun: null,
    },
    ...mapped.filter((item) => item.id !== "judgment_parquet"),
    ...(parquet ? [parquet] : []),
  ];
}

function workflowNavMarkup(snapshot, activeWorkflowId) {
  const items = workflowItems(snapshot);
  const dividerBefore = new Set([
    "law_download",
    "judgment_download",
    "normalize_courts",
  ]);
  return `<div class="status-sidebar-head">
      <div class="eyebrow">DATA WORKFLOWS</div>
      <div class="status-sidebar-title">資料流程</div>
    </div>
    <nav class="status-tab-list" aria-label="資料處理工作流程">
      ${items
        .map((item) => {
          const active = item.id === activeWorkflowId;
          const iconName = WORKFLOW_ICONS[item.id] || "terminal";
          const divider = dividerBefore.has(item.id)
            ? '<div class="status-tab-divider" role="separator" aria-hidden="true"></div>'
            : "";
          return `${divider}<button class="status-tab${active ? " is-active" : ""}" type="button"
            data-processing-workflow="${escapeHtml(item.id)}"
            ${active ? 'aria-current="page"' : ""}>
            <span class="status-tab-icon">${icon(iconName, 15)}</span>
            <span class="status-tab-copy">
              <strong>${escapeHtml(item.label)}</strong>
              <small>${escapeHtml(item.description || "")}</small>
            </span>
            ${statusBadge(item.status)}
          </button>`;
        })
        .join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>執行模式</span>
      <span class="mono">${escapeHtml(snapshot.mode === "running" ? "執行中" : "待命")}</span>
    </div>`;
}

function runMetaMarkup(run) {
  if (!run) {
    return `<div class="processing-workflow-empty">尚未執行。按下右側按鈕開始。</div>`;
  }
  const meta = run.meta || {};
  return `<div class="processing-workflow-run">
    <div class="processing-workflow-run-head">
      ${statusBadge(run.status)}
      <span class="mono">${escapeHtml(run.id || "—")}</span>
    </div>
    <div class="processing-workflow-run-grid">
      <span>開始</span><strong>${escapeHtml(formatDateTime(run.started_at))}</strong>
      <span>耗時</span><strong>${formatDuration(run.duration_ms)}</strong>
      <span>訊息</span><strong>${escapeHtml(run.message || "—")}</strong>
      ${meta.log_path ? `<span>日誌</span><strong class="mono">${escapeHtml(meta.log_path)}</strong>` : ""}
    </div>
  </div>`;
}

function judgmentMonthKey(item) {
  return `${item.year}-${String(item.month_no).padStart(2, "0")}`;
}

function judgmentMonthTitle(item) {
  const labels = { green: "最新版", gray: "舊版", red: "缺失" };
  const status = item.status || "red";
  return [
    judgmentMonthKey(item),
    labels[status] || status,
    item.latest_fileset_id ? `fileset ${item.latest_fileset_id}` : "",
    item.filename || "",
    item.local_filename && item.local_filename !== item.filename
      ? `本機：${item.local_filename}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function judgmentMonthDownloadMarkup(item) {
  if (!item.download_url) return "";
  const month = judgmentMonthKey(item);
  return `<a class="judgment-month-download" href="${escapeHtml(
    apiUrl(item.download_url),
  )}" target="_blank" rel="noreferrer" title="下載 ${month} 判決" aria-label="下載 ${month} 判決">${icon("download", 11)}</a>`;
}

function judgmentMonthCellMarkup(item) {
  const status = item.status || "red";
  return `<td class="judgment-month is-${escapeHtml(status)}" data-judgment-month-key="${escapeHtml(
    judgmentMonthKey(item),
  )}" title="${escapeHtml(judgmentMonthTitle(item))}"><span>${item.month_no}</span>${judgmentMonthDownloadMarkup(item)}</td>`;
}

function judgmentOffHoursEnabled(state) {
  return state?.off_hours_enabled === true;
}

function judgmentHintText(state) {
  const downloadHint = judgmentOffHoursEnabled(state)
    ? "非 API 時段也可下載，建議一次只下載一個檔案"
    : "下載連結僅在 00:00–06:00 API 時段可用";
  return `綠色：最新版已下載到 raw_rar；灰色：本機仍是舊版，執行判決下載會更新；紅色：該月份缺少判決資料。滑鼠移到月份可開啟下載連結（${downloadHint}）。待補齊月份會優先下載，全部補齊後才由最新月份往回驗證既有檔案；中斷的下載會保留 .part，伺服器支援 Range 時續傳，否則從零重新下載。首次完整同步可能需下載數百個月份，預設非時段也可續傳；嚴格模式會在 00:00–06:00 以外停止。`;
}

const JUDGMENT_STOP_REASON_LABELS = {
  completed: "完成",
  window_closed: "API 時段結束",
  deadline: "接近 06:00，保留待下載月份",
  verification_window_closed: "API 時段結束，驗證進度已保留",
  verification_deadline: "接近 06:00，驗證進度已保留",
  errors: "部分月份下載失敗，下次重試",
  pending: "仍有待下載月份",
  check_only: "僅檢查，未下載",
  incremental: "增量檢查完成",
  status_only: "僅更新月份狀態",
  running: "執行中",
};

function judgmentBackfillSummary(state) {
  const backfill = state?.backfill || {};
  const verification = backfill.verification || {};
  const lastRun = backfill.last_run || {};
  const pending = Number(backfill.pending_count) || 0;
  const failures = Number(backfill.failure_count) || 0;
  const resume = String(backfill.resume_from_month || "");
  let verificationText = "驗證：未開始";
  if (verification.status === "completed") {
    verificationText = "驗證完成";
  } else if (verification.next_month) {
    verificationText = `驗證續傳 ${verification.next_month}`;
  } else if (verification.status === "in_progress") {
    verificationText = "驗證進行中";
  }
  const stopReason = String(lastRun.stop_reason || "");
  const lastText = stopReason
    ? `上次停止：${JUDGMENT_STOP_REASON_LABELS[stopReason] || stopReason}`
    : "";
  return { pending, failures, resume, verificationText, lastText };
}

function judgmentBackfillMarkup(state) {
  const info = judgmentBackfillSummary(state);
  const pendingText =
    info.pending > 0
      ? `待補齊 ${formatNumber(info.pending)} 個月${
          info.failures > 0 ? `（${formatNumber(info.failures)} 個失敗）` : ""
        }`
      : "待補齊 0 個月";
  return `<div class="judgment-backfill" data-judgment-backfill>
    <span class="badge ${info.pending > 0 ? "badge-danger" : "badge-ok"}" data-judgment-backfill-pending>${pendingText}</span>
    <span class="badge badge-neutral" data-judgment-backfill-resume ${info.resume && info.pending > 0 ? "" : "hidden"}>從 ${escapeHtml(info.resume)} 續傳</span>
    <span class="badge badge-info" data-judgment-backfill-verification>${escapeHtml(info.verificationText)}</span>
    <span class="muted" data-judgment-backfill-last ${info.lastText ? "" : "hidden"}>${escapeHtml(info.lastText)}</span>
  </div>`;
}

function updateJudgmentBackfill(container, state) {
  const info = judgmentBackfillSummary(state);
  const pending = container.querySelector("[data-judgment-backfill-pending]");
  if (pending) {
    pending.textContent =
      info.pending > 0
        ? `待補齊 ${formatNumber(info.pending)} 個月${
            info.failures > 0
              ? `（${formatNumber(info.failures)} 個失敗）`
              : ""
          }`
        : "待補齊 0 個月";
    pending.classList.toggle("badge-danger", info.pending > 0);
    pending.classList.toggle("badge-ok", info.pending === 0);
  }
  const resume = container.querySelector("[data-judgment-backfill-resume]");
  if (resume) {
    const visible = Boolean(info.resume) && info.pending > 0;
    resume.hidden = !visible;
    resume.textContent = visible ? `從 ${info.resume} 續傳` : "";
  }
  const verification = container.querySelector(
    "[data-judgment-backfill-verification]",
  );
  if (verification) verification.textContent = info.verificationText;
  const last = container.querySelector("[data-judgment-backfill-last]");
  if (last) {
    last.hidden = !info.lastText;
    last.textContent = info.lastText;
  }
}

function judgmentMonthsLoadingMarkup() {
  return `<div class="judgment-months-loading"><span class="spinner"></span><span>讀取月份下載狀態…</span></div>`;
}

function renderJudgmentMonthTable(state) {
  if (state?.loading && !state?.months?.length) {
    return judgmentMonthsLoadingMarkup();
  }
  if (state?.error && !state?.months?.length) {
    return notice({
      tone: "danger",
      title: "月份狀態讀取失敗",
      text: escapeHtml(state.error),
    });
  }
  const months = Array.isArray(state?.months) ? state.months : [];
  if (!months.length) {
    return `<div class="processing-empty">尚未有月份狀態；請先執行判決下載。</div>`;
  }
  const byKey = new Map(
    months.map((item) => [judgmentMonthKey(item), item]),
  );
  const years = [...new Set(months.map((item) => item.year))].sort(
    (left, right) => right - left,
  );
  const rows = years
    .map((year) => {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const item = byKey.get(`${year}-${String(index + 1).padStart(2, "0")}`);
        if (!item) {
          return `<td class="judgment-month is-empty"><span>${index + 1}</span></td>`;
        }
        return judgmentMonthCellMarkup(item);
      }).join("");
      return `<tr><th scope="row">${year}</th>${cells}</tr>`;
    })
    .join("");
  const summary = state.summary || {};
  return `<div class="judgment-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok" data-judgment-summary="green">最新版 ${formatNumber(summary.green || 0)}</span>
      <span class="badge badge-neutral" data-judgment-summary="gray">舊版 ${formatNumber(summary.gray || 0)}</span>
      <span class="badge badge-danger" data-judgment-summary="red">缺失 ${formatNumber(summary.red || 0)}</span>
      <span class="muted" data-judgment-total>共 ${formatNumber(state.total_months || months.length)} 個月</span>
    </div>
    ${judgmentBackfillMarkup(state)}
    <div class="judgment-months-scroll">
      <table class="judgment-months-table">
        <thead><tr><th scope="col">年份</th>${Array.from(
          { length: 12 },
          (_, index) => `<th scope="col">${index + 1}</th>`,
        ).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint" data-judgment-hint>${escapeHtml(judgmentHintText(state))}</p>
  </div>`;
}

function updateJudgmentMonthTable(container, state) {
  const months = Array.isArray(state?.months) ? state.months : [];
  const summary = state.summary || {};
  const labels = { green: "最新版", gray: "舊版", red: "缺失" };
  container.querySelectorAll("[data-judgment-summary]").forEach((badge) => {
    const key = badge.dataset.judgmentSummary || "";
    badge.textContent = `${labels[key] || key} ${formatNumber(summary[key] || 0)}`;
  });
  const total = container.querySelector("[data-judgment-total]");
  if (total) {
    total.textContent = `共 ${formatNumber(state.total_months || months.length)} 個月`;
  }
  updateJudgmentBackfill(container, state);
  const hint = container.querySelector("[data-judgment-hint]");
  if (hint) {
    const text = judgmentHintText(state);
    if (hint.textContent !== text) hint.textContent = text;
  }
  for (const item of months) {
    const key = judgmentMonthKey(item);
    const cell = container.querySelector(
      `[data-judgment-month-key="${key}"]`,
    );
    if (!cell) continue;
    const status = item.status || "red";
    if (!cell.classList.contains(`is-${status}`)) {
      cell.classList.remove("is-green", "is-gray", "is-red", "is-empty");
      cell.classList.add(`is-${status}`);
    }
    const title = judgmentMonthTitle(item);
    if (cell.title !== title) cell.title = title;
    const link = cell.querySelector(".judgment-month-download");
    if (item.download_url) {
      const href = apiUrl(item.download_url);
      if (!link) {
        cell.insertAdjacentHTML("beforeend", judgmentMonthDownloadMarkup(item));
      } else if (link.getAttribute("href") !== href) {
        link.href = href;
      }
    } else if (link) {
      link.remove();
    }
  }
}

function workflowRunHistoryMarkup(runs) {
  const items = Array.isArray(runs) ? runs : [];
  if (!items.length) {
    return `<div class="processing-workflow-empty">尚無執行紀錄。</div>`;
  }
  return `<div class="processing-workflow-history">
    ${items
      .map(
        (run) => `<div class="processing-workflow-history-row">
          <span class="processing-workflow-history-status">${statusBadge(
            run.status || "idle",
          )}</span>
          <span class="mono">${escapeHtml(formatDateTime(run.started_at))}</span>
          <span class="mono">${escapeHtml(formatDuration(run.duration_ms || 0))}</span>
          <span class="processing-workflow-history-message">${escapeHtml(
            run.message || "—",
          )}</span>
        </div>`,
      )
      .join("")}
  </div>`;
}

function updateHistoryMarkup(workflow) {
  const items = Array.isArray(workflow.update_history)
    ? workflow.update_history
    : [];
  if (!items.length) {
    return `<div class="processing-workflow-empty">尚無版本檢查紀錄。</div>`;
  }
  const labels = {
    up_to_date: ["已是最新", "badge-ok"],
    update_available: ["有更新", "badge-warn"],
    error: ["檢查失敗", "badge-danger"],
  };
  return `<div class="processing-workflow-history">
    ${items
      .map((item) => {
        const [label, tone] = labels[item.status] || [
          item.status || "未知",
          "badge-neutral",
        ];
        const remoteSize =
          item.remote_content_length != null
            ? formatBytes(item.remote_content_length)
            : "—";
        const localVersion = item.local_version_id
          ? `v${item.local_version_id}`
          : "—";
        return `<div class="processing-workflow-history-row">
          <span class="badge ${tone}">${escapeHtml(label)}</span>
          <span class="mono">${escapeHtml(formatDateTime(item.checked_at))}</span>
          <span class="mono">遠端 ${escapeHtml(remoteSize)}</span>
          <span class="mono">本地 ${escapeHtml(localVersion)}</span>
          <span class="processing-workflow-history-message">${escapeHtml(
            item.message || "—",
          )}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function stageHoverAttributes(stage) {
  const key = String(stage.key || "");
  const meta = statusInfo(stage.status);
  return [
    `data-stage-key="${escapeHtml(key)}"`,
    `data-stage-label="${escapeHtml(stage.label || key)}"`,
    `data-stage-color="${escapeHtml(barColor(stage))}"`,
    `data-stage-status-key="${escapeHtml(stage.status || "idle")}"`,
    `data-stage-status="${escapeHtml(meta.label)}"`,
    `data-stage-percent="${escapeHtml(percentText(stage.percent))}"`,
    `data-stage-counts="${escapeHtml(stageCounts(stage))}"`,
    `data-stage-duration="${escapeHtml(formatDuration(stage.duration_ms || 0))}"`,
    `data-stage-contribution="${escapeHtml(
      percentText(stage.contribution_percent),
    )}"`,
    `data-stage-message="${escapeHtml(stage.message || "")}"`,
  ].join(" ");
}

function workflowStageStatusBadge(stage) {
  const status = String(stage.status || "idle");
  if (status !== "failed") return statusBadge(status);
  const reason = String(
    stage.error || stage.message || "階段執行失敗。",
  ).trim();
  const resolution = String(
    stage.resolution ||
      "查看 .run 目錄中的最新日誌取得完整 traceback，修正後重新執行此流程。",
  ).trim();
  const tip = `原因：${reason}\n建議：${resolution}`;
  return `<span class="badge badge-danger is-failure-tip" tabindex="0" aria-label="${escapeHtml(
    tip,
  )}" data-failure-tip="${escapeHtml(tip)}"><span class="status-dot is-danger"></span>失敗</span>`;
}

function workflowStageMarkup(stage) {
  const status = String(stage.status || "idle");
  return `<div class="processing-workflow-stage${
    status === "running" ? " is-running" : ""
  }" style="--stage-color:${escapeHtml(barColor(stage))}" ${stageHoverAttributes(
    stage,
  )}>
    <div class="processing-workflow-stage-head">
      <span class="processing-workflow-stage-swatch"></span>
      <span class="processing-workflow-stage-label">${escapeHtml(
        stage.label || stage.key || "階段",
      )}</span>
      ${workflowStageStatusBadge(stage)}
      <span class="processing-workflow-stage-percent mono">${percentText(
        stage.percent,
      )}</span>
    </div>
    ${progressBar(stage)}
    <div class="processing-workflow-stage-meta">
      <span>${escapeHtml(stageCounts(stage))}</span>
      <span class="mono">${formatDuration(stage.duration_ms || 0)}</span>
      <span class="processing-workflow-stage-message">${escapeHtml(
        stage.message || "—",
      )}</span>
    </div>
  </div>`;
}

function workflowProgressMarkup(workflow) {
  if (pendingWorkflowId === workflow.id) {
    // Starting a new run: hide the previous run's progress card immediately
    // instead of showing stale results until the backend snapshot arrives.
    return "";
  }
  const progress = workflow.progress || {};
  const stages = Array.isArray(progress.stages) ? progress.stages : [];
  if (!stages.length) {
    return `<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
      <div class="side-card-head">
        <span class="side-card-title">${icon("activity", 14)}流程進度</span>
        <span class="badge badge-neutral">尚無</span>
      </div>
      <div class="processing-workflow-empty">執行此流程後，會在這裡顯示各階段與整體進度。</div>
    </section>`;
  }
  const overall = progress.overall_percent;
  const participants = stages.filter((stage) => stage.status !== "skipped");
  const segments = participants
    .filter((stage) => Number(stage.contribution_percent) > 0)
    .map(
      (stage) => `<span class="processing-workflow-progress-segment" style="width:${
        Number(stage.contribution_percent) || 0
      }%;background:${escapeHtml(barColor(stage))}" ${stageHoverAttributes(
        stage,
      )}></span>`,
    )
    .join("");
  const legend = stages
    .map(
      (stage) => `<div class="processing-workflow-progress-legend-item${
        stage.status === "skipped" ? " is-skipped" : ""
      }" ${stageHoverAttributes(stage)}>
        <span class="processing-workflow-progress-swatch" style="background:${escapeHtml(
          barColor(stage),
        )}"></span>
        <span class="processing-workflow-progress-legend-label">${escapeHtml(
          stage.label || stage.key || "階段",
        )}</span>
        <span class="mono">${percentText(stage.percent)}</span>
      </div>`,
    )
    .join("");
  const completed = Number(progress.completed_stages) || 0;
  const total = Number(progress.total_stages) || 0;
  const skipped = stages.filter((stage) => stage.status === "skipped").length;
  const stageCountLabel = skipped
    ? `完成 ${completed} · 略過 ${skipped}`
    : `${completed} / ${total} 階段`;
  const scopeNote = WORKFLOW_SCOPE_NOTES[workflow.id] || "";
  return `<section class="report-card processing-card processing-workflow-progress-card" data-workflow-progress>
    <div class="side-card-head">
      <span class="side-card-title">${icon("activity", 14)}流程進度</span>
      <span class="badge ${
        progress.run_status === "running" ? "badge-info" : "badge-neutral"
      }">${stageCountLabel}</span>
    </div>
    <div class="processing-workflow-stage-list">${stages
      .map(workflowStageMarkup)
      .join("")}</div>
    <div class="processing-workflow-overall">
      <div class="processing-workflow-overall-head">
        <span>整體進度</span>
        <span class="mono">${percentText(overall)}</span>
      </div>
      <div class="processing-workflow-progress-stack" role="img" aria-label="各階段進度加總">${
        segments ||
        '<span class="processing-workflow-progress-empty">尚無可計算進度</span>'
      }</div>
      <div class="processing-workflow-progress-legend">${legend}</div>
      <div class="processing-workflow-progress-hint">將滑鼠移到任一階段或色塊，只會保留該項目並顯示說明；略過階段不列入整體進度。</div>
    </div>
    ${
      scopeNote
        ? `<p class="processing-workflow-scope-note">${icon(
            "info",
            12,
          )}<span>${escapeHtml(scopeNote)}</span></p>`
        : ""
    }
  </section>`;
}

function indexMonthLabel(month) {
  const text = String(month || "");
  return text.length === 6 ? `${text.slice(0, 4)}-${text.slice(4)}` : text || "—";
}

function indexHostMarkup(host, selectedUrl) {
  const roleLabels = { primary: "主要", fallback: "備援", provided: "外部" };
  const models = Array.isArray(host.models) ? host.models : [];
  const modelText = models.length ? models.join("、") : "—";
  return `<div class="index-host-row${
    host.url && host.url === selectedUrl ? " is-selected" : ""
  }">
    <div class="index-host-head">
      <span class="badge badge-neutral">${escapeHtml(
        roleLabels[host.role] || host.role || "主機",
      )}</span>
      <strong class="mono">${escapeHtml(host.host || "—")}:${escapeHtml(
        host.port ?? "—",
      )}</strong>
      ${statusBadge(host.status || "unavailable")}
      <span class="index-host-model">${escapeHtml(
        host.model || "—",
      )}</span>
    </div>
    <div class="index-host-url mono">${escapeHtml(host.url || "—")}</div>
    <div class="index-host-models" title="${escapeHtml(modelText)}">模型：${escapeHtml(
      modelText,
    )}</div>
    ${
      host.detail
        ? `<div class="index-host-detail">${escapeHtml(host.detail)}</div>`
        : ""
    }
  </div>`;
}

function indexMonthGridMarkup(runtime) {
  const months = Array.isArray(runtime.months) ? runtime.months : [];
  const current = runtime.current || {};
  const groups = new Map();
  for (const item of months) {
    const key = String(item.month || "");
    if (!/^\d{6}$/.test(key)) continue;
    const monthNo = Number(key.slice(4, 6));
    if (monthNo < 1 || monthNo > 12) continue;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        year: key.slice(0, 4),
        monthNo,
        total: 0,
        processed: 0,
        reused: 0,
        embedded: 0,
        archives: [],
        current: false,
        jid: "",
      };
      groups.set(key, group);
    }
    group.total += Number(item.total) || 0;
    group.processed += Number(item.processed) || 0;
    group.reused += Number(item.reused) || 0;
    group.embedded += Number(item.embedded) || 0;
    if (item.archive) group.archives.push(String(item.archive));
    if (
      current.month === key &&
      (!current.archive || current.archive === item.archive)
    ) {
      group.current = true;
      group.jid = String(current.jid || "");
    }
  }
  if (!groups.size) {
    return '<div class="processing-workflow-empty">尚無可顯示的索引月份；開始索引後會依時間列出月份狀態。</div>';
  }
  const counts = { green: 0, red: 0, gray: 0 };
  for (const group of groups.values()) {
    if (group.total > 0 && group.processed >= group.total) {
      group.status = "green";
      counts.green += 1;
    } else if (group.processed > 0) {
      group.status = "red";
      counts.red += 1;
    } else {
      group.status = "gray";
      counts.gray += 1;
    }
  }
  const years = [...new Set([...groups.values()].map((item) => item.year))].sort(
    (left, right) => right.localeCompare(left),
  );
  const rows = years
    .map((year) => {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const monthNo = index + 1;
        const key = `${year}${String(monthNo).padStart(2, "0")}`;
        const group = groups.get(key);
        if (!group) {
          return `<td class="judgment-month is-empty"><span>${monthNo}</span></td>`;
        }
        const percent = group.total
          ? `${Math.min(
              100,
              Math.round((group.processed / group.total) * 1000) / 10,
            )}%`
          : "—";
        const active = group.current && runtime.run_status === "running";
        const title = [
          `${group.year}-${String(group.monthNo).padStart(2, "0")}`,
          group.archives.join("、") || "—",
          `已處理 ${formatNumber(group.processed)} / ${formatNumber(
            group.total,
          )}（${percent}）`,
          `重用 ${formatNumber(group.reused)} · 新 embedding ${formatNumber(
            group.embedded,
          )}`,
          group.current
            ? `${active ? "目前索引" : "最後索引"}${
                group.jid ? ` · ${group.jid}` : ""
              }`
            : "",
        ]
          .filter(Boolean)
          .join(" · ");
        return `<td class="judgment-month index-month is-${group.status}${
          active ? " is-active" : ""
        }" title="${escapeHtml(title)}"${
          active ? ' aria-current="true"' : ""
        }><span>${monthNo}</span></td>`;
      }).join("");
      return `<tr><th scope="row">${escapeHtml(year)}</th>${cells}</tr>`;
    })
    .join("");
  return `<div class="judgment-months index-months">
    <div class="judgment-months-meta">
      <span class="badge badge-ok">完成 ${formatNumber(counts.green)}</span>
      <span class="badge badge-danger">未完成 ${formatNumber(counts.red)}</span>
      <span class="badge badge-neutral">待索引 ${formatNumber(counts.gray)}</span>
      <span class="muted">共 ${formatNumber(groups.size)} 個月</span>
    </div>
    <div class="judgment-months-scroll">
      <table class="judgment-months-table index-months-table">
        <thead><tr><th scope="col">年份</th>${Array.from(
          { length: 12 },
          (_, index) => `<th scope="col">${index + 1}</th>`,
        ).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="judgment-months-hint">綠色：索引完成；灰色：新檔／尚未索引；紅色：已開始但未完成；空白：沒有該月份資料。滑鼠移到月份可查看來源檔案、已處理筆數與目前案號。</p>
  </div>`;
}

function importTimelineMarkup(workflow) {
  const timeline = workflow.import_timeline || {};
  const months = Array.isArray(timeline.months) ? timeline.months : [];
  if (!months.length) {
    return `<section class="report-card processing-card import-files-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("table", 14)}匯入檔案時間表</span>
        <span class="badge badge-neutral">尚無</span>
      </div>
      <div class="processing-workflow-empty">尚未取得判決下載 manifest 或本機壓縮檔；執行判決下載後會顯示月份狀態。</div>
    </section>`;
  }
  const byKey = new Map(months.map((item) => [String(item.month), item]));
  const years = [...new Set(months.map((item) => item.year))].sort(
    (left, right) => right - left,
  );
  const active = months.find((item) => item.active);
  const stageSummary = timeline.stage_summary || {};
  const rows = years
    .map((year) => {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const monthNo = index + 1;
        const key = `${year}${String(monthNo).padStart(2, "0")}`;
        return importTimelineMonthCell(
          timeline,
          byKey.get(key),
          year,
          monthNo,
        );
      }).join("");
      return `<tr><th scope="row">${escapeHtml(year)}</th>${cells}</tr>`;
    })
    .join("");
  const summary = timeline.summary || {};
  const stageLabels = timeline.stage_labels || {};
  const activeLine = active
    ? `<div class="index-current-row">${importActiveRowMarkup({
        activeMonth:
          timeline.active_month || String(active.month || ""),
        activeArchive:
          timeline.active_archive || active.active_archive || "",
        activePhase: timeline.active_phase || "",
        processingMonth: timeline.processing_month || "",
        processingArchive: timeline.processing_archive || "",
        stageLabels,
      })}</div>`
    : "";
  return `<section class="report-card processing-card import-files-card" data-import-timeline="judgment">
    <div class="side-card-head">
      <span class="side-card-title">${icon("table", 14)}匯入檔案時間表</span>
      <span class="badge badge-neutral">${formatNumber(
        timeline.total_months || months.length,
      )} 個月</span>
    </div>
    <div class="judgment-months index-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">完成 ${formatNumber(
          stageSummary.complete || 0,
        )}</span>
        <span class="badge badge-danger">未完成 ${formatNumber(
          stageSummary.incomplete || 0,
        )}</span>
        <span class="badge badge-neutral">處理中 ${formatNumber(
          stageSummary.processing || 0,
        )}</span>
        <span class="badge badge-info">有更新 ${formatNumber(
          summary.gray || 0,
        )}</span>
        <span class="muted">共 ${formatNumber(
          timeline.total_months || months.length,
        )} 個月</span>
      </div>
      ${activeLine}
      <div class="judgment-months-scroll">
        <table class="judgment-months-table import-months-table processing-months-table">
          <thead><tr><th scope="col">年份</th>${Array.from(
            { length: 12 },
            (_, index) => `<th scope="col">${index + 1}</th>`,
          ).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">每格由左至右：RAR 檢查／解壓縮、原始資料檢查／Parquet 備份、金融法規篩選、PostgreSQL metadata。原始資料階段會先檢查既有 Parquet，可沿用時不重新備份；缺少時會顯示「建立 YYYY-MM 備份」，完成後顯示「已建立備份」。篩選與 PostgreSQL 階段會顯示目前處理的月份與 archive。綠色：已完成（含先前 run 已匯入、本次尚未重跑）；紅色：尚未完成或本次有待匯入檔案；灰色：本次處理中；空白：無資料。點選紅色階段可回到判決匯入流程。</p>
    </div>
  </section>`;
}

function indexRuntimeMarkup(workflow) {
  const runtime = workflow.index_runtime || {};
  if (!runtime.available) {
    return `<section class="report-card processing-card index-runtime-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("cloud", 14)}Ollama 連線測試</span>
        <span class="badge badge-neutral">尚無</span>
      </div>
      <div class="processing-workflow-empty">執行 Qdrant 版本建置後，會在這裡顯示測試的主機、模型與選用結果。</div>
    </section>`;
  }
  const coverageOnly = Boolean(runtime.coverage_only);
  const embedding = runtime.embedding || {};
  const hosts = Array.isArray(embedding.hosts) ? embedding.hosts : [];
  const selected = embedding.selected || {};
  const active = embedding.active || {};
  const current = runtime.current || {};
  const summary = runtime.summary || {};
  const selectedUrl = selected.url || "";
  const activeUrl = active.url || "";
  const hostRows = hosts
    .map((host) => indexHostMarkup(host, selectedUrl))
    .join("");
  const currentLabel =
    runtime.run_status === "running" ? "目前處理" : "最後處理";
  const currentLine = current.jid
    ? `<div class="index-current-row">
        <span class="badge badge-info">${icon("activity", 11)}${currentLabel}</span>
        <strong class="mono">${escapeHtml(
          indexMonthLabel(current.month),
        )}</strong>
        <span class="mono">${escapeHtml(current.archive || "—")}</span>
        <span class="mono">${escapeHtml(current.jid || "—")}</span>
        <span class="index-current-copy">${escapeHtml(
          [current.court, current.title].filter(Boolean).join(" · ") || "—",
        )}</span>
        <span class="faint">批次 ${formatNumber(current.batch_size)} 筆</span>
      </div>`
    : "";
  return `<section class="report-card processing-card index-runtime-card"${
    coverageOnly ? " hidden" : ""
  }>
    <div class="side-card-head">
      <span class="side-card-title">${icon("cloud", 14)}Ollama 連線測試</span>
      ${statusBadge(embedding.status || "idle")}
    </div>
    ${
      runtime.error
        ? `<div class="processing-update-notice index-runtime-error">${icon(
            "alert",
            13,
          )}<span>${escapeHtml(runtime.error)}</span></div>`
        : ""
    }
    <div class="index-selected-host">
      <span class="faint">最後選用</span>
      <strong class="mono">${escapeHtml(selected.url || "—")}</strong>
      <span>${escapeHtml(selected.model || embedding.model || "—")}</span>
      <span class="mono">port ${escapeHtml(selected.port ?? "—")}</span>
      ${
        activeUrl && activeUrl !== selectedUrl
          ? `<span class="badge badge-warn">目前使用 ${escapeHtml(
              activeUrl,
            )}</span>`
          : ""
      }
      ${
        active.using_fallback
          ? '<span class="badge badge-warn">已切換備援</span>'
          : ""
      }
    </div>
    <div class="index-host-list">${hostRows || '<div class="processing-workflow-empty">沒有可顯示的主機測試結果。</div>'}</div>
    ${
      embedding.tested_at
        ? `<div class="index-runtime-foot">測試時間 ${escapeHtml(
            formatDateTime(embedding.tested_at),
          )}</div>`
        : ""
    }
  </section>
  <section class="report-card processing-card index-files-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("table", 14)}索引檔案時間表</span>
      <span class="badge badge-neutral">${formatNumber(
        summary.indexed,
      )} / ${formatNumber(summary.total)} 筆</span>
    </div>
    <div class="index-runtime-summary">
      <span>版本 <strong class="mono">v${escapeHtml(
        runtime.version_id ?? "—",
      )}</strong></span>
      <span>Collection <code>${escapeHtml(runtime.collection || "—")}</code></span>
      <span>模式 <strong>${escapeHtml(runtime.build_mode || "—")}</strong></span>
      ${
        coverageOnly
          ? ""
          : `<span>重用 <strong class="mono">${formatNumber(
              summary.reused,
            )}</strong></span>
            <span>新 embedding <strong class="mono">${formatNumber(
              summary.embedded,
            )}</strong></span>`
      }
    </div>
    ${currentLine}
    ${indexMonthGridMarkup(runtime)}
    ${
      coverageOnly
        ? '<p class="judgment-months-hint index-coverage-note">目前顯示 active collection 的月份索引覆蓋；執行 Qdrant 版本建置後會顯示本次 Ollama 測試與即時進度。</p>'
        : ""
    }
  </section>`;
}

function indexStorageMarkup(context = {}) {
  const { storage, loading, error } = context;
  if (error) {
    return `<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("database", 14)}Qdrant 儲存位置</span>
        <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${icon("refresh", 12)}<span>重新整理</span></button>
      </div>
      <div class="processing-workflow-empty">${escapeHtml(error)}</div>
    </section>`;
  }
  if (!storage) {
    return `<section class="report-card processing-card index-storage-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("database", 14)}Qdrant 儲存位置</span>
        <span class="badge badge-neutral">${loading ? "讀取中" : "尚無"}</span>
      </div>
      <div class="processing-workflow-empty">${loading ? "正在取得 Docker 容器與 volume 資訊…" : "切換到此流程後會讀取 Qdrant 容器與 volume 資訊。"}</div>
    </section>`;
  }
  const qdrant = storage.qdrant_storage || {};
  const databases = Array.isArray(storage.databases) ? storage.databases : [];
  const qdrantDb = databases.find((item) => item.id === "qdrant") || {};
  const volumeBytes =
    qdrant.volume_bytes ?? qdrantDb.volume_bytes ?? null;
  const points = qdrant.points_count ?? qdrantDb.points_count;
  const segments = qdrant.segments_count ?? qdrantDb.segments_count;
  return `<section class="report-card processing-card index-storage-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("database", 14)}Qdrant 儲存位置</span>
      <button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-index-storage">${icon("refresh", 12)}<span>重新整理</span></button>
    </div>
    <div class="index-storage-grid">
      <span>Docker 主機</span><strong>${escapeHtml(
        qdrant.host || "—",
      )} <span class="faint">(${escapeHtml(
        qdrant.docker_context || "default",
      )})</span></strong>
      <span>Container</span><strong class="mono">${escapeHtml(
        qdrant.container || "judgment-qdrant",
      )} · ${escapeHtml(qdrant.container_state || "unknown")}</strong>
      <span>Image</span><strong class="mono">${escapeHtml(
        qdrant.image || "—",
      )}</strong>
      <span>容器內路徑</span><strong class="mono">${escapeHtml(
        qdrant.container_path || "—",
      )}</strong>
      <span>Docker volume</span><strong class="mono">${escapeHtml(
        qdrant.volume_name || "—",
      )}</strong>
      <span>Volume 容量</span><strong class="mono">${formatBytes(
        volumeBytes,
      )}${qdrant.volume_size ? ` · ${escapeHtml(qdrant.volume_size)}` : ""}</strong>
      <span>Volume 來源路徑</span><strong class="mono index-storage-path">${escapeHtml(
        qdrant.host_path || "—",
      )}</strong>
      <span>Collection</span><strong class="mono">${escapeHtml(
        qdrant.collection || qdrantDb.collection || "—",
      )}</strong>
      <span>Alias</span><strong class="mono">${escapeHtml(
        qdrant.alias || "—",
      )}</strong>
      <span>Points／Segments</span><strong class="mono">${formatNumber(
        points,
      )} / ${formatNumber(segments)}</strong>
    </div>
    <div class="index-runtime-foot">資料時間 ${escapeHtml(
      formatDateTime(storage.checked_at),
    )}</div>
  </section>`;
}

function workflowHelpMarkup({ badge = "", lead = "", rows = [], note = "" }) {
  return `<section class="report-card processing-card parquet-help-card workflow-help-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("info", 14)}功能說明</span>
      ${
        badge
          ? `<span class="badge badge-neutral">${escapeHtml(badge)}</span>`
          : ""
      }
    </div>
    <div class="parquet-help-body">
      <p class="parquet-help-lead">${lead}</p>
      <div class="parquet-help-grid">${rows
        .map(
          ([label, value]) =>
            `<span>${escapeHtml(label)}</span><strong>${value}</strong>`,
        )
        .join("")}</div>
      ${note ? `<p class="parquet-help-note">${note}</p>` : ""}
    </div>
  </section>`;
}

function judgmentParquetHelpMarkup() {
  return workflowHelpMarkup({
    badge: "唯讀匯出",
    lead:
      "將 PostgreSQL 目前有效的判決（<code>judgment_documents.is_current = true</code>）匯出成獨立的 Parquet 快照，供離線分析、資料交換或保存。",
    rows: [
      [
        "來源",
        "PostgreSQL <code>judgment_documents</code>，只含目前有效且已命中金融法規清單的判決。",
      ],
      [
        "輸出",
        '<span class="mono">JUDGMENT_DATA_DIR/parquet/judgments/YYYYMMDD/HHMMSS-xxxxxxxx/judgments.parquet</span>',
      ],
      [
        "附帶檔",
        '<span class="mono">同目錄 manifest.json（筆數、檔案大小、欄位、產生時間）</span>',
      ],
      [
        "內容",
        "案號、法院、案由、全文、命中法規、引用、來源壓縮檔與時間欄位；<code>citations</code> 以 JSON 字串保存。",
      ],
      [
        "與原始 Parquet",
        "資料頁與 <code>source=parquet</code> 使用 <code>parquet/raw_judgments/.../raw.parquet</code>；本流程的 <code>parquet/judgments/...</code> 是另一個正規化快照。",
      ],
      [
        "不會",
        "不寫回 PostgreSQL、不更新 Qdrant、不同步 IndexedDB、不刪除舊快照；只匯出 current 資料，不含歷史版本。",
      ],
      [
        "中斷",
        "每次執行建立新的完整快照；中斷後重新執行不會續寫同一個 Parquet 檔。",
      ],
    ],
    note:
      "適合 DuckDB、pandas、Spark 等離線分析，或需要固定時間點的可重現資料快照。日常 RAG 查詢與資料頁瀏覽不需要執行此流程。",
  });
}

function normalizeCourtsHelpMarkup() {
  return workflowHelpMarkup({
    badge: "PostgreSQL 回填",
    lead:
      "將判決的 <code>court</code> 轉成標準法院名稱並寫入 <code>court_normalized</code>；原始 <code>court</code> 會保留供追溯。",
    rows: [
      [
        "處理範圍",
        "預設只處理 <code>court_normalized</code> 為空的資料；已正規化資料會跳過，可用 <code>--all</code> 重新計算全部。",
      ],
      [
        "解析順序",
        "原始法院值開頭符合標準名稱 → 判決全文前 8,000 字最早出現的法院 → 原始法院值任意位置的標準名稱 → JID 官方法院代碼。",
      ],
      [
        "輸出",
        "寫入 <code>judgment_documents.court_normalized</code>；不修改原始 <code>court</code>、全文或其他判決欄位。",
      ],
      [
        "未解析",
        "無法判斷時保留空值，不猜測；摘要會列出未解析筆數與常見樣本。",
      ],
      [
        "影響",
        "資料頁的法院下拉、精確篩選、排序、結果欄位與判決原文使用正規化名稱；API 仍回傳 <code>court_raw</code>。",
      ],
      [
        "不會",
        "不重新匯入判決、不改全文、不更新 Qdrant、不同步 IndexedDB、不刪除資料。",
      ],
      [
        "重跑",
        "預設可重複執行；規則更新後可用 <code>--all</code> 重算，或先用 <code>--dry-run</code> 統計。",
      ],
    ],
    note:
      "適合在判決匯入後、法院名稱規則更新後，或資料頁法院選項出現缺漏時執行。結果也會寫入效能紀錄。",
  });
}

function backfillLawArticlesHelpMarkup() {
  return workflowHelpMarkup({
    badge: "條文歷史建檔",
    lead:
      "為既有法規／命令版本建立 <code>law_article_versions</code> 歷史條文快照與 <code>law_article_change_events</code> 變更紀錄，讓資料頁能切換歷史版本並查看條文差異。",
    rows: [
      [
        "來源",
        "PostgreSQL 法規版本，以及 <code>LAW_DATA_DIR/raw_parquet</code> 內對應的原始法規 Parquet 快照。",
      ],
      [
        "匹配方式",
        "以 raw Parquet manifest 的 <code>zip_sha256</code>／<code>raw_json_sha256</code> 對應法規版本，不猜測內容。",
      ],
      [
        "產生內容",
        "<code>article_key</code>（條文類型＋條號）、<code>content_hash</code>、條文全文與生效日；與前一版本比較後記錄 <code>added</code>／<code>modified</code>／<code>removed</code>。",
      ],
      [
        "檢查是否需建立",
        "分頁上方的唯讀檢查會讀取 <code>law_article_versions</code> 與原始 Parquet，判斷版本是否需要建立歷史；檢查本身不會修改資料庫。",
      ],
      [
        "可建立",
        "找到對應原始 Parquet 的版本，可直接執行此流程建立條文歷史。",
      ],
      [
        "缺原始檔",
        "找不到原始 Parquet 的版本會標示無法建立，需先補下載或備份；此流程會跳過並列在 <code>missing_versions</code>。",
      ],
      [
        "檢查結果",
        "年份×月份表顯示已建立／未建立／部分建立；下方列出需建立歷史的版本、法規／命令、版本日期與可建立狀態。目前狀態以上方「檢查是否需建立」卡片即時顯示。",
      ],
      [
        "跳過條件",
        "已有條文快照的版本會跳過；找不到可讀原始 Parquet 的版本會列入 <code>missing_versions</code>，不建立虛構條文。",
      ],
      [
        "不會",
        "不下載法規／命令、不解析新 ZIP、不修改 <code>law_documents</code> 或目前版本、不更新 Qdrant／IndexedDB。",
      ],
      [
        "輸出摘要",
        "版本數、跳過版本數、缺少快照版本、寫入條文數與條文變更事件數。",
      ],
      [
        "重跑",
        "可重複執行；已建立歷史的版本不會重複插入。",
      ],
    ],
    note:
      "適合從舊版 schema 升級、既有法規版本缺少歷史條文，或資料頁歷史條文版本與變更紀錄不完整時執行。執行前可先用上方「檢查是否需建立」確認哪些版本可建立、哪些缺原始檔。",
  });
}

function courtCheckMarkup(context = {}) {
  const data = context.courtCheck;
  const loading = Boolean(context.courtCheckLoading);
  const error = context.courtCheckError;
  const button = `<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-court-check"${
    loading ? " disabled" : ""
  }>${icon("refresh", 12)}<span>${loading ? "檢查中…" : "檢查法院名稱"}</span></button>`;
  if (error) {
    return `<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("search", 14)}檢查法院名稱</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">${escapeHtml(error)}</div>
    </section>`;
  }
  if (!data) {
    return `<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("search", 14)}檢查法院名稱</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">${
        loading
          ? '<span class="spinner" aria-hidden="true"></span> 正在檢查各月份法院名稱…'
          : "進入此分頁後會自動檢查；也可按「檢查法院名稱」重新讀取。"
      }</div>
    </section>`;
  }
  const months = Array.isArray(data.months) ? data.months : [];
  const summary = data.summary || {};
  const totals = data.totals || {};
  if (!months.length) {
    return `<section class="report-card processing-card court-check-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("search", 14)}檢查法院名稱</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">目前沒有可檢查的判決資料。</div>
    </section>`;
  }
  const labels = { green: "已檢查", red: "未檢查", gray: "需正規化" };
  const byKey = new Map(months.map((item) => [String(item.month), item]));
  const years = [...new Set(months.map((item) => item.year))].sort(
    (left, right) => right - left,
  );
  const rows = years
    .map((year) => {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const monthNo = index + 1;
        const key = `${year}${String(monthNo).padStart(2, "0")}`;
        const item = byKey.get(key);
        if (!item) {
          return `<td class="judgment-month is-empty"><span>${monthNo}</span></td>`;
        }
        const status = labels[item.status] ? item.status : "red";
        const title = [
          `${year}-${String(monthNo).padStart(2, "0")}`,
          labels[status],
          `總 ${formatNumber(item.total)} 筆`,
          `已檢查 ${formatNumber(item.checked)} 筆`,
          `未檢查 ${formatNumber(item.unchecked)} 筆`,
          item.invalid ? `無效值 ${formatNumber(item.invalid)} 筆` : "",
          `有效 ${percentText(item.percent)}`,
        ]
          .filter(Boolean)
          .join(" · ");
        return `<td class="judgment-month court-check-month is-${status}" title="${escapeHtml(
          title,
        )}"><span>${monthNo}</span></td>`;
      }).join("");
      return `<tr><th scope="row">${escapeHtml(year)}</th>${cells}</tr>`;
    })
    .join("");
  return `<section class="report-card processing-card court-check-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("search", 14)}檢查法院名稱</span>
      ${button}
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">已檢查 ${formatNumber(
          summary.green || 0,
        )}</span>
        <span class="badge badge-danger">未檢查 ${formatNumber(
          summary.red || 0,
        )}</span>
        <span class="badge badge-neutral">需正規化 ${formatNumber(
          summary.gray || 0,
        )}</span>
        <span class="muted">共 ${formatNumber(months.length)} 個月</span>
      </div>
      <div class="index-runtime-summary">
        <span>判決總數 <strong class="mono">${formatNumber(
          totals.total,
        )}</strong></span>
        <span>已檢查 <strong class="mono">${formatNumber(
          totals.checked,
        )}</strong></span>
        <span>未檢查 <strong class="mono">${formatNumber(
          totals.unchecked,
        )}</strong></span>
        <span>無效值 <strong class="mono">${formatNumber(
          totals.invalid,
        )}</strong></span>
        <span>有效 <strong class="mono">${formatNumber(
          totals.valid,
        )}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table court-check-months-table">
          <thead><tr><th scope="col">年份</th>${Array.from(
            { length: 12 },
            (_, index) => `<th scope="col">${index + 1}</th>`,
          ).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">綠色：全部已正規化；紅色：完全未檢查；灰色：部分未正規化或有無效值；空白：沒有該月份資料。滑鼠移到月份可查看筆數與有效比例。</p>
      <div class="index-runtime-foot">檢查時間 ${escapeHtml(
        formatDateTime(data.checked_at),
      )} · 標準法院名稱 ${formatNumber(data.canonical_count)} 個</div>
    </div>
  </section>`;
}

function lawVersionCheckMarkup(context = {}) {
  const data = context.lawVersionCheck;
  const loading = Boolean(context.lawVersionCheckLoading);
  const error = context.lawVersionCheckError;
  const button = `<button class="btn btn-ghost btn-sm" type="button" data-processing-action="refresh-law-version-check"${
    loading ? " disabled" : ""
  }>${icon("refresh", 12)}<span>${loading ? "檢查中…" : "檢查是否需建立"}</span></button>`;
  if (error) {
    return `<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("database", 14)}檢查條文歷史</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">${escapeHtml(error)}</div>
    </section>`;
  }
  if (!data) {
    return `<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("database", 14)}檢查條文歷史</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">${
        loading
          ? '<span class="spinner" aria-hidden="true"></span> 正在檢查版本與歷史條文…'
          : "進入此分頁後會自動檢查；也可按「檢查是否需建立」重新讀取。"
      }</div>
    </section>`;
  }
  const months = Array.isArray(data.months) ? data.months : [];
  const summary = data.summary || {};
  const totals = data.totals || {};
  if (!months.length) {
    return `<section class="report-card processing-card law-version-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("database", 14)}檢查條文歷史</span>
        ${button}
      </div>
      <div class="processing-workflow-empty">資料庫目前沒有法規／命令版本資料。</div>
    </section>`;
  }
  const labels = { green: "已建立", red: "未建立", gray: "部分建立" };
  const byKey = new Map(months.map((item) => [String(item.month), item]));
  const years = [...new Set(months.map((item) => item.year))].sort(
    (left, right) => right - left,
  );
  const rows = years
    .map((year) => {
      const cells = Array.from({ length: 12 }, (_, index) => {
        const monthNo = index + 1;
        const key = `${year}${String(monthNo).padStart(2, "0")}`;
        const item = byKey.get(key);
        if (!item) {
          return `<td class="judgment-month is-empty"><span>${monthNo}</span></td>`;
        }
        const status = labels[item.status] ? item.status : "red";
        const title = [
          `${year}-${String(monthNo).padStart(2, "0")}`,
          labels[status],
          `版本 ${formatNumber(item.version_count)}（法規 ${formatNumber(
            item.law_versions,
          )}／命令 ${formatNumber(item.order_versions)}）`,
          `已建立 ${formatNumber(item.backfilled_count)}`,
          `未建立 ${formatNumber(item.missing_count)}`,
          `需建立 ${formatNumber(item.needs_backfill_count)}（可建立 ${formatNumber(
            item.backfillable_count,
          )}／缺原始檔 ${formatNumber(item.blocked_count)}）`,
          `條文列 ${formatNumber(item.article_rows)} / 預期 ${formatNumber(
            item.article_count,
          )}`,
          item.current ? "目前版本" : "",
          item.versions?.length
            ? `版本 ${item.versions
                .map((version) => `#${version.version_id}`)
                .join("、")}`
            : "",
        ]
          .filter(Boolean)
          .join(" · ");
        return `<td class="judgment-month law-version-month is-${status}${
          item.current ? " is-current" : ""
        }" title="${escapeHtml(title)}"><span>${monthNo}</span></td>`;
      }).join("");
      return `<tr><th scope="row">${escapeHtml(year)}</th>${cells}</tr>`;
    })
    .join("");
  const sourceLabels = { law: "法規", order: "命令" };
  const neededVersions = months
    .flatMap((month) =>
      (month.versions || [])
        .filter((version) => version.needs_backfill)
        .map((version) => ({ ...version, month: month.month })),
    )
    .sort((left, right) => right.version_id - left.version_id);
  const shownNeeded = neededVersions.slice(0, 20);
  const neededRows = shownNeeded
    .map((version) => {
      const tone = version.backfillable
        ? "badge-info"
        : version.blocked
          ? "badge-danger"
          : "badge-neutral";
      const label = version.backfillable
        ? "可建立"
        : version.blocked
          ? "缺原始檔"
          : "待檢查";
      return `<div class="law-backfill-needed-row">
        <strong class="mono">#${version.version_id}</strong>
        <span class="badge ${tone}">${label}</span>
        <span>${escapeHtml(sourceLabels[version.source_type] || version.source_type || "—")}</span>
        <span class="mono">${escapeHtml(
          version.update_date || version.month || "—",
        )}</span>
        <span class="law-backfill-needed-reason">${escapeHtml(
          version.reason || "—",
        )}</span>
      </div>`;
    })
    .join("");
  const neededMarkup = neededVersions.length
    ? `<div class="law-backfill-needed">
        <div class="law-backfill-needed-head">需建立歷史的版本 <span class="badge badge-warn">${formatNumber(
          neededVersions.length,
        )}</span></div>
        <div class="law-backfill-needed-list">${neededRows}</div>
        ${
          neededVersions.length > shownNeeded.length
            ? `<div class="law-backfill-needed-more">另有 ${formatNumber(
                neededVersions.length - shownNeeded.length,
              )} 個版本未列出</div>`
            : ""
        }
      </div>`
    : '<div class="law-backfill-needed is-clear">目前沒有需要建立歷史的版本。</div>';
  const needsBackfill = Number(totals.needs_backfill_versions) || 0;
  const backfillable = Number(totals.backfillable_versions) || 0;
  const blocked = Number(totals.blocked_versions) || 0;
  const backfilled = Number(totals.backfilled_versions) || 0;
  const totalVersions = Number(totals.versions) || 0;
  const statusTone =
    needsBackfill <= 0 ? "ok" : blocked > 0 ? "danger" : "warn";
  const statusTitle =
    needsBackfill <= 0 ? "不需要建立" : "需要建立";
  const statusDetail =
    needsBackfill > 0
      ? `需要建立 ${formatNumber(needsBackfill)} 個版本的條文歷史：可建立 ${formatNumber(
          backfillable,
        )}、缺原始檔 ${formatNumber(blocked)}。已有歷史條文 ${formatNumber(
          backfilled,
        )} 個版本${blocked > 0 ? "；缺原始檔需先補下載或備份" : ""}。`
      : `目前 ${formatNumber(totalVersions)} 個版本都已有歷史條文，不需要建立。`;
  return `<section class="report-card processing-card law-version-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("database", 14)}檢查條文歷史</span>
      ${button}
    </div>
    <div class="law-version-check-status is-${statusTone}" role="status" aria-live="polite">
      <span class="badge badge-${statusTone}">${statusTitle}</span>
      <span>${escapeHtml(statusDetail)}</span>
    </div>
    <div class="judgment-months">
      <div class="judgment-months-meta">
        <span class="badge badge-ok">已建立 ${formatNumber(
          summary.green || 0,
        )}</span>
        <span class="badge badge-danger">未建立 ${formatNumber(
          summary.red || 0,
        )}</span>
        <span class="badge badge-neutral">部分建立 ${formatNumber(
          summary.gray || 0,
        )}</span>
        <span class="muted">共 ${formatNumber(months.length)} 個月</span>
      </div>
      <div class="index-runtime-summary">
        <span>版本數 <strong class="mono">${formatNumber(
          totals.versions,
        )}</strong></span>
        <span>已建立版本 <strong class="mono">${formatNumber(
          totals.backfilled_versions,
        )}</strong></span>
        <span>未建立版本 <strong class="mono">${formatNumber(
          totals.missing_versions,
        )}</strong></span>
        <span>需建立版本 <strong class="mono">${formatNumber(
          totals.needs_backfill_versions,
        )}</strong></span>
        <span>可建立 <strong class="mono">${formatNumber(
          totals.backfillable_versions,
        )}</strong></span>
        <span>缺原始檔 <strong class="mono">${formatNumber(
          totals.blocked_versions,
        )}</strong></span>
        <span>條文列 <strong class="mono">${formatNumber(
          totals.article_rows,
        )}</strong></span>
        <span>預期條文 <strong class="mono">${formatNumber(
          totals.article_count,
        )}</strong></span>
        <span>法規筆數 <strong class="mono">${formatNumber(
          totals.law_count,
        )}</strong></span>
      </div>
      <div class="judgment-months-scroll">
        <table class="judgment-months-table law-version-months-table">
          <thead><tr><th scope="col">年份</th>${Array.from(
            { length: 12 },
            (_, index) => `<th scope="col">${index + 1}</th>`,
          ).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="judgment-months-hint">綠色：該月份所有版本都有歷史條文；紅色：完全未建立；灰色：部分版本已建立；外框：目前版本；空白：沒有該月份版本。滑鼠移到月份可查看版本數、法規／命令數與條文列。</p>
      ${neededMarkup}
      <div class="index-runtime-foot">檢查時間 ${escapeHtml(
        formatDateTime(data.checked_at),
      )}</div>
    </div>
  </section>`;
}

function ollamaPriorityLoadingMarkup() {
  return `<div class="processing-ollama-loading">
    <span class="spinner" aria-hidden="true"></span>
    <span>正在檢查 Ollama 主機與模型…</span>
  </div>`;
}

function ollamaPriorityMarkup(hostsData, loading, error) {
  const hosts = Array.isArray(hostsData?.hosts) ? hostsData.hosts : [];
  if (error && !hosts.length) {
    return `${notice({
      tone: "danger",
      title: "Ollama 主機讀取失敗",
      text: escapeHtml(error.message || "請確認後端服務是否啟動。"),
    })}
    <div class="processing-ollama-empty">
      <button class="btn btn-secondary btn-sm" type="button" data-processing-action="refresh-ollama">
        ${icon("refresh", 13)}<span>重新檢查</span>
      </button>
    </div>`;
  }
  if (!hosts.length) {
    return loading
      ? ollamaPriorityLoadingMarkup()
      : `<div class="processing-ollama-empty">尚未設定 Ollama 主機；請到「系統狀態 → Model Provider」新增並連接模型。</div>`;
  }
  const rows = hosts
    .map((host, index) => {
      const online = host.status === "operational";
      const models = Array.isArray(host.models) ? host.models : [];
      const modelChips = models.length
        ? models
            .map(
              (model) =>
                `<span class="processing-ollama-model ${
                  online ? "is-online" : "is-offline"
                }">${escapeHtml(model.name || "")}</span>`,
            )
            .join("")
        : `<span class="processing-ollama-model is-offline">沒有可用模型</span>`;
      const roles = [
        host.embedding_model
          ? `<span class="processing-ollama-role ${
              online ? "is-online" : "is-offline"
            }">嵌入 · ${escapeHtml(host.embedding_model)}</span>`
          : `<span class="processing-ollama-role is-offline">未設定嵌入模型</span>`,
        host.chat_model
          ? `<span class="processing-ollama-role is-offline">聊天 · ${escapeHtml(
              host.chat_model,
            )}</span>`
          : "",
      ]
        .filter(Boolean)
        .join("");
      return `<article class="processing-ollama-host ${
        online ? "is-online" : "is-offline"
      }" data-ollama-host data-host-id="${Number(host.id)}">
        <span class="processing-ollama-handle" aria-hidden="true">${icon("grid", 14)}</span>
        <span class="processing-ollama-rank">${index + 1}</span>
        <div class="processing-ollama-main">
          <div class="processing-ollama-title">
            <strong>${escapeHtml(host.name || host.base_url || `主機 #${host.id}`)}</strong>
            <span class="processing-ollama-status">${
              online ? "可用" : "無法連線"
            }</span>
          </div>
          <span class="processing-ollama-url mono">${escapeHtml(
            host.base_url || "—",
          )}</span>
          <div class="processing-ollama-models">${modelChips}</div>
          <div class="processing-ollama-meta">${roles}${
            host.detail
              ? `<span class="processing-ollama-detail">${escapeHtml(
                  host.detail,
                )}</span>`
              : ""
          }</div>
        </div>
        <div class="processing-ollama-order">
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="up"
            data-host-id="${Number(host.id)}"
            title="上移優先順序" aria-label="上移 ${escapeHtml(
              host.name || host.base_url || `主機 #${host.id}`,
            )}" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="btn btn-ghost btn-sm" type="button"
            data-processing-action="move-ollama-host" data-direction="down"
            data-host-id="${Number(host.id)}"
            title="下移優先順序" aria-label="下移 ${escapeHtml(
              host.name || host.base_url || `主機 #${host.id}`,
            )}" ${index === hosts.length - 1 ? "disabled" : ""}>↓</button>
        </div>
      </article>`;
    })
    .join("");
  const activeName =
    hosts.find((host) => Number(host.id) === Number(hostsData?.active_host_id))
      ?.name || hosts[0]?.name || hosts[0]?.base_url || "—";
  return `<div class="processing-ollama-summary">
      <span>共 ${formatNumber(hosts.length)} 台主機</span>
      <span>第一優先：<strong>${escapeHtml(activeName)}</strong></span>
      <span class="muted">${loading ? "重新檢查中…" : "每 30 秒自動檢查"}</span>
    </div>
    <div class="processing-ollama-list" data-ollama-list>${rows}</div>
    <p class="processing-ollama-hint">拖移或使用箭頭調整 embedding 優先順序；目前主機無法使用時，會依序自動改用下一台（各台需具備相同的 embedding 模型），直到有主機回傳向量。</p>`;
}

function workflowPanelMarkup(workflow, workflowContext = {}) {
  const activeRun = workflow.active_run || null;
  const lastRun = activeRun || workflow.last_run || null;
  const busy = Boolean(activeRun) || pendingWorkflowId === workflow.id;
  const canRun = Boolean(workflow.can_run) && !busy;
  const command = Array.isArray(workflow.command) ? workflow.command.join(" ") : "";
  return `<div class="processing-workflow-panel">
    ${notice({
      tone: "info",
      title: workflow.label,
      text: workflow.description || "",
    })}
    ${
      workflow.update_available
        ? `<div class="processing-update-notice" role="status">
            ${icon("refresh", 13)}
            <span>${escapeHtml(
              (workflow.update_status && workflow.update_status.message) ||
                "線上偵測到新版",
            )}</span>
            <span class="badge badge-warn">更新</span>
          </div>`
        : ""
    }
    ${
      workflow.id === "normalize_courts"
        ? courtCheckMarkup(workflowContext)
        : ""
    }
    ${
      workflow.id === "backfill_law_articles"
        ? lawVersionCheckMarkup(workflowContext)
        : ""
    }
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon(WORKFLOW_ICONS[workflow.id] || "terminal", 14)}執行資訊</span>
        <span class="badge badge-neutral badge-mono">${escapeHtml(workflow.branch || "")}</span>
      </div>
      <div class="processing-workflow-command-grid">
        <span>程式</span><code>${escapeHtml(workflow.program || "—")}</code>
        <span>Shell／入口</span><code>${escapeHtml(workflow.script || "—")}</code>
        <span>實際命令</span><code class="processing-workflow-command">${escapeHtml(command || "—")}</code>
      </div>
      ${
        OLLAMA_PRIORITY_WORKFLOWS.has(workflow.id)
          ? '<div class="processing-embedding-strip-slot" data-processing-embedding-strip data-preserve-children></div>'
          : ""
      }
      <div class="processing-workflow-actions">
        <button class="btn btn-primary btn-sm" type="button"
          data-processing-action="run-workflow"
          data-workflow-id="${escapeHtml(workflow.id)}"
          ${canRun ? "" : "disabled"}>
          ${icon("play", 14)}<span>${busy ? "執行中" : "執行此流程"}</span>
        </button>
        ${
          ["law_download", "order_download", "judgment_download"].includes(
            workflow.id,
          )
            ? `<button class="btn btn-secondary btn-sm" type="button"
                data-processing-action="check-updates"
                data-workflow-id="${escapeHtml(workflow.id)}">
                ${icon("refresh", 14)}<span>檢查更新</span>
              </button>`
            : ""
        }
        ${
          activeRun
            ? `<button class="btn btn-secondary btn-sm processing-stop" type="button"
                data-processing-action="stop">${icon("x", 14)}<span>停止</span></button>`
            : ""
        }
        ${
          workflow.id === "judgment_download"
            ? `<div class="processing-download-progress" data-judgment-progress hidden>
                <div class="processing-download-progress-head">
                  <span class="badge badge-info" data-judgment-progress-phase>準備中</span>
                  <strong class="processing-download-progress-month mono" data-judgment-progress-month>—</strong>
                  <span class="processing-download-progress-file mono" data-judgment-progress-filename>—</span>
                </div>
                <div class="processing-download-progress-track">
                  <span data-judgment-progress-bar></span>
                </div>
                <div class="processing-download-progress-meta">
                  <span data-judgment-progress-percent>—</span>
                  <span data-judgment-progress-size>—</span>
                  <span class="muted" data-judgment-progress-note></span>
                </div>
              </div>`
            : ""
        }
      </div>
      <div class="side-card-foot">
        執行結果會寫入共用處理狀態檔，可從處理總覽查看。
      </div>
    </section>
    ${workflowProgressMarkup(workflow)}
    ${
      workflow.id === "judgment_parquet" ? judgmentParquetHelpMarkup() : ""
    }
    ${
      workflow.id === "normalize_courts" ? normalizeCourtsHelpMarkup() : ""
    }
    ${
      workflow.id === "backfill_law_articles"
        ? backfillLawArticlesHelpMarkup()
        : ""
    }
    ${
      workflow.id === "judgment_import" ? importTimelineMarkup(workflow) : ""
    }
    ${
      workflow.id === "index_versions" ? indexRuntimeMarkup(workflow) : ""
    }
    ${
      workflow.id === "index_versions" ? indexStorageMarkup(workflowContext) : ""
    }
    ${
      workflow.id === "judgment_download"
        ? `<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${icon("calendar", 14)}月份下載狀態</span>
              <button class="btn btn-ghost btn-sm" type="button" title="重新掃描 raw_rar 目錄與月份狀態" data-processing-action="refresh-judgment-months">${icon("refresh", 13)}<span>重新整理</span></button>
            </div>
            <div data-judgment-months-slot data-preserve-children>${judgmentMonthsLoadingMarkup()}</div>
          </section>`
        : ""
    }
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("history", 14)}最近執行</span>
        ${statusBadge(lastRun?.status || "idle")}
      </div>
      ${runMetaMarkup(lastRun)}
    </section>
    <section class="report-card processing-card">
      <div class="side-card-head">
        <span class="side-card-title">${icon("history", 14)}執行紀錄</span>
        <span class="badge badge-neutral">最近 ${formatNumber(
          (workflow.recent_runs || []).length,
        )} 筆</span>
      </div>
      ${workflowRunHistoryMarkup(workflow.recent_runs)}
    </section>
    ${
      ["law_download", "order_download", "judgment_download"].includes(
        workflow.id,
      )
        ? `<section class="report-card processing-card">
            <div class="side-card-head">
              <span class="side-card-title">${icon("search", 14)}版本檢查紀錄</span>
              <span class="badge badge-neutral">最近 ${formatNumber(
                (workflow.update_history || []).length,
              )} 筆</span>
            </div>
            ${updateHistoryMarkup(workflow)}
          </section>`
        : ""
    }
  </div>`;
}

function panelMarkup(
  snapshot,
  activeWorkflowId,
  workflowContext = {},
  expandedStages = new Set(),
) {
  if (activeWorkflowId === "overview") {
    return contentMarkup(snapshot, expandedStages);
  }
  const workflows = Array.isArray(snapshot.workflows) ? snapshot.workflows : [];
  const workflow = workflows.find((item) => item.id === activeWorkflowId);
  return workflow
    ? workflowPanelMarkup(workflow, workflowContext)
    : contentMarkup(snapshot, expandedStages);
}

export async function render(root) {
  root.innerHTML = `<section class="page processing-page">
    <div class="page-header">
      <div class="processing-page-heading">
        <div class="page-kicker">DATA PIPELINE</div>
        <div class="processing-title-line">
          <h1 class="page-title">資料處理</h1>
          <p class="page-subtitle processing-page-subtitle">即時追蹤判決、法規與命令的處理進度，檢查本機未處理壓縮檔，並可接續線上資料更新。</p>
        </div>
      </div>
      <div class="page-actions processing-actions">
        <button class="btn btn-secondary btn-sm processing-stop" type="button" data-processing-action="stop" id="processing-stop" hidden>
          ${icon("x", 14)}<span>停止更新</span>
        </button>
      </div>
    </div>
    <div class="status-layout processing-layout">
      <aside class="status-sidebar processing-sidebar" aria-label="資料處理工作流程">
        <div id="processing-workflows">
          <div class="status-sidebar-head">
            <div class="eyebrow">DATA WORKFLOWS</div>
            <div class="skeleton skeleton-line" style="width:90px;height:18px"></div>
          </div>
          ${Array.from({ length: 7 })
            .map(
              () =>
                `<div class="skeleton skeleton-line" style="width:100%;height:48px;margin-top:8px"></div>`,
            )
            .join("")}
        </div>
      </aside>
      <section class="status-panel" id="processing-root">
        <div class="processing-loading" role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span>正在讀取處理狀態…</span>
        </div>
      </section>
    </div>
  </section>`;

  const page = root.querySelector(".processing-page");
  const content = root.querySelector("#processing-root");
  const workflowNav = root.querySelector("#processing-workflows");
  const stopButton = root.querySelector("#processing-stop");
  const stageTooltip = document.createElement("div");
  stageTooltip.className = "processing-stage-tooltip";
  stageTooltip.hidden = true;
  page.appendChild(stageTooltip);

  stageOperations = new Map();
  let disposed = false;
  let refreshing = false;
  let actionBusy = false;
  let lastSnapshot = null;
  let lastMarkup = "";
  let lastNavMarkup = "";
  let activeWorkflowId = "overview";
  let judgmentStatus = null;
  let judgmentStatusLoading = false;
  let judgmentStatusError = null;
  let indexStorage = null;
  let indexStorageLoading = false;
  let indexStorageError = null;
  let indexStorageLoadedAt = 0;
  let courtCheck = null;
  let courtCheckLoading = false;
  let courtCheckError = null;
  let courtCheckLoadedAt = 0;
  let lawVersionCheck = null;
  let lawVersionCheckLoading = false;
  let lawVersionCheckError = null;
  let lawVersionCheckLoadedAt = 0;
  let ollamaHosts = null;
  let ollamaHostsLoading = false;
  let ollamaHostsError = null;
  let ollamaDragHostId = 0;
  let ollamaDragChanged = false;
  let ollamaPointerDrag = null;
  let ollamaReorderBusy = false;
  let embeddingSaving = false;
  let hoveredStageKey = "";
  const expandedStages = new Set();
  let refreshStream = null;
  let lastActiveImport = null;
  let lastActiveImportStamp = -1;
  let lastProgressRunId = "";
  let lastProgressSeq = 0;
  let progressFrame = 0;
  let pendingLiveRender = null;
  const pendingProgressEvents = [];

  const workflowContext = () => ({
    storage: indexStorage,
    loading: indexStorageLoading,
    error: indexStorageError,
    courtCheck,
    courtCheckLoading,
    courtCheckError,
    lawVersionCheck,
    lawVersionCheckLoading,
    lawVersionCheckError,
  });

  const syncJudgmentProgress = () => {
    if (activeWorkflowId !== "judgment_download") return;
    const panel = content.querySelector(".processing-workflow-panel");
    if (!panel) return;
    panel.querySelectorAll(".judgment-month.is-active").forEach((cell) => {
      cell.classList.remove("is-active");
      cell.removeAttribute("aria-current");
    });
    const box = panel.querySelector("[data-judgment-progress]");
    if (!box) return;
    const progress = judgmentStatus?.progress;
    const judgmentWorkflow = (lastSnapshot?.workflows || []).find(
      (workflow) => workflow.id === "judgment_download",
    );
    const hasActiveRun = Boolean(judgmentWorkflow?.active_run);
    if ((!progress || progress.active === false) && !hasActiveRun) {
      box.hidden = true;
      box.classList.remove("is-indeterminate");
      return;
    }
    box.hidden = false;
    if (!progress || progress.active === false) {
      const pendingPhase = box.querySelector("[data-judgment-progress-phase]");
      if (pendingPhase) pendingPhase.textContent = "準備中";
      const pendingMonth = box.querySelector("[data-judgment-progress-month]");
      if (pendingMonth) pendingMonth.textContent = "—";
      const pendingFile = box.querySelector(
        "[data-judgment-progress-filename]",
      );
      if (pendingFile) {
        pendingFile.textContent = "等待下載程序回報進度…";
        pendingFile.title = "";
      }
      box.classList.add("is-indeterminate");
      const pendingBar = box.querySelector("[data-judgment-progress-bar]");
      if (pendingBar) pendingBar.style.width = "";
      const pendingPercent = box.querySelector(
        "[data-judgment-progress-percent]",
      );
      if (pendingPercent) pendingPercent.textContent = "—";
      const pendingSize = box.querySelector("[data-judgment-progress-size]");
      if (pendingSize) pendingSize.textContent = "—";
      const pendingNote = box.querySelector("[data-judgment-progress-note]");
      if (pendingNote) pendingNote.textContent = "已啟動，等待進度回報";
      return;
    }
    const phaseLabels = {
      preparing: "準備中",
      scanning: "掃描中",
      checking: "檢查中",
      downloading: "下載中",
      saving: "儲存中",
      finalizing: "整理中",
    };
    const phaseLabel = phaseLabels[progress.phase] || "處理中";
    const phase = box.querySelector("[data-judgment-progress-phase]");
    if (phase) phase.textContent = phaseLabel;
    const month = progress.month || "";
    const monthElement = box.querySelector("[data-judgment-progress-month]");
    if (monthElement) monthElement.textContent = month || "—";
    const filename = progress.filename || "";
    const filenameElement = box.querySelector(
      "[data-judgment-progress-filename]",
    );
    if (filenameElement) {
      filenameElement.textContent = filename || "—";
      filenameElement.title = filename;
    }
    if (month) {
      const cell = panel.querySelector(
        `[data-judgment-month-key="${month}"]`,
      );
      if (cell) {
        cell.classList.add("is-active");
        cell.setAttribute("aria-current", "true");
      }
    }
    const written = Number(progress.bytes_written);
    const total = Number(progress.total_bytes);
    const hasTotal = Number.isFinite(total) && total > 0;
    let percent = null;
    const rawPercent = progress.percent;
    if (
      rawPercent !== null &&
      rawPercent !== undefined &&
      rawPercent !== "" &&
      Number.isFinite(Number(rawPercent))
    ) {
      percent = Number(rawPercent);
    } else if (hasTotal && Number.isFinite(written)) {
      percent = (written / total) * 100;
    }
    const indeterminate = percent === null;
    box.classList.toggle("is-indeterminate", indeterminate);
    const bar = box.querySelector("[data-judgment-progress-bar]");
    if (bar) {
      bar.style.width = indeterminate
        ? ""
        : `${Math.min(100, Math.max(0, percent)).toFixed(1)}%`;
    }
    const percentElement = box.querySelector(
      "[data-judgment-progress-percent]",
    );
    if (percentElement) {
      const clamped = indeterminate ? null : Math.min(100, Math.max(0, percent));
      percentElement.textContent =
        clamped === null
          ? "—"
          : `${clamped.toFixed(clamped >= 10 ? 0 : 1)}%`;
    }
    const sizeElement = box.querySelector("[data-judgment-progress-size]");
    if (sizeElement) {
      const writtenText =
        Number.isFinite(written) && written > 0 ? formatBytes(written) : "—";
      sizeElement.textContent = hasTotal
        ? `${writtenText} / ${formatBytes(total)}`
        : writtenText;
    }
    const noteElement = box.querySelector("[data-judgment-progress-note]");
    if (noteElement) {
      const notes = [];
      const index = Number(progress.candidate_index);
      const count = Number(progress.candidate_total);
      if (
        Number.isFinite(index) &&
        index > 0 &&
        Number.isFinite(count) &&
        count > 0
      ) {
        notes.push(`第 ${formatNumber(index)} / ${formatNumber(count)} 個月`);
      }
      if (progress.fileset_id) {
        notes.push(`fileset ${progress.fileset_id}`);
      }
      if (progress.message && progress.phase !== "downloading") {
        notes.push(String(progress.message));
      }
      noteElement.textContent = notes.join(" · ");
    }
  };

  const syncJudgmentDom = () => {
    if (activeWorkflowId !== "judgment_download") return;
    const slot = content.querySelector("[data-judgment-months-slot]");
    if (slot) {
      const months = Array.isArray(judgmentStatus?.months)
        ? judgmentStatus.months
        : [];
      if (judgmentStatusError && !judgmentStatus) {
        slot.innerHTML = notice({
          tone: "danger",
          title: "月份狀態讀取失敗",
          text: escapeHtml(judgmentStatusError),
        });
        delete slot.dataset.judgmentMonthCount;
      } else if (!judgmentStatus) {
        if (!slot.querySelector(".judgment-months-loading")) {
          slot.innerHTML = judgmentMonthsLoadingMarkup();
        }
        delete slot.dataset.judgmentMonthCount;
      } else if (slot.dataset.judgmentMonthCount !== String(months.length)) {
        slot.innerHTML = renderJudgmentMonthTable(judgmentStatus);
        slot.dataset.judgmentMonthCount = String(months.length);
      } else {
        updateJudgmentMonthTable(slot, judgmentStatus);
      }
    }
    syncJudgmentProgress();
  };

  const ollamaHostsSignature = () => {
    const hosts = Array.isArray(ollamaHosts?.hosts) ? ollamaHosts.hosts : [];
    return JSON.stringify({
      loading: !hosts.length && ollamaHostsLoading,
      error:
        !hosts.length && ollamaHostsError
          ? ollamaHostsError.message || String(ollamaHostsError)
          : "",
      active: ollamaHosts?.active_host_id ?? null,
      hosts: hosts.map((host) => ({
        id: host.id,
        name: host.name,
        url: host.base_url,
        status: host.status,
        detail: host.detail,
        embedding: host.embedding_model,
        chat: host.chat_model,
        models: (host.models || []).map((model) => model.name),
      })),
    });
  };

  const syncOllamaDom = () => {
    const slot = content.querySelector("[data-processing-ollama]");
    if (!slot || ollamaDragHostId) return;
    const signature = ollamaHostsSignature();
    if (slot.dataset.ollamaSignature === signature) return;
    slot.dataset.ollamaSignature = signature;
    slot.innerHTML = ollamaPriorityMarkup(
      ollamaHosts,
      ollamaHostsLoading,
      ollamaHosts ? null : ollamaHostsError,
    );
  };

  const currentEmbeddingLabel = () => {
    const legal = (lastSnapshot?.sections || []).find(
      (section) => section.key === "legal",
    );
    const stage = (legal?.stages || []).find(
      (item) => item.key === "legal_qdrant",
    );
    return String(stage?.model?.label || "");
  };

  const syncEmbeddingStrip = () => {
    const slot = content.querySelector("[data-processing-embedding-strip]");
    if (!slot) return;
    const hosts = Array.isArray(ollamaHosts?.hosts)
      ? ollamaHosts.hosts
      : [];
    const options = [];
    for (const host of hosts) {
      if (host.status !== "operational") continue;
      for (const model of host.models || []) {
        if (!Array.isArray(model.capabilities)) continue;
        if (!model.capabilities.includes("embedding")) continue;
        options.push({
          hostId: Number(host.id),
          model: model.name,
          label: `${host.name || host.base_url || `主機 ${host.id}`}:${
            model.name
          }`,
          baseUrl: host.base_url || "",
        });
      }
    }
    const current = currentEmbeddingLabel();
    const activeHost = hosts.find(
      (host) => Number(host.id) === Number(ollamaHosts?.active_host_id),
    );
    const buttons = options.map((option) => {
      const active = option.label === current;
      return `<button class="rag-model-button${
        active ? " is-active" : ""
      }" type="button"
        data-processing-action="select-embedding-model"
        data-host-id="${option.hostId}"
        data-model="${escapeHtml(option.model)}"
        title="${escapeHtml(option.label)}"
        aria-pressed="${active ? "true" : "false"}"
        ${embeddingSaving ? "disabled" : ""}>
        <span class="rag-model-state" aria-hidden="true"></span>
        <span>${escapeHtml(option.label)}</span>
        ${
          active
            ? '<span class="rag-model-current">使用中</span>'
            : ""
        }
      </button>`;
    });
    if (
      current &&
      !options.some((option) => option.label === current)
    ) {
      buttons.unshift(
        `<button class="rag-model-button is-active is-static" type="button" aria-pressed="true" disabled>
          <span class="rag-model-state" aria-hidden="true"></span>
          <span>${escapeHtml(current)}</span>
          <span class="rag-model-current">使用中</span>
        </button>`,
      );
    }
    const body = options.length
      ? `<div class="rag-model-buttons">${buttons.join("")}</div>`
      : `<p class="rag-model-empty">${
          ollamaHostsLoading
            ? "讀取線上主機與 Embedding model…"
            : ollamaHostsError
              ? `無法讀取線上主機：${escapeHtml(
                  ollamaHostsError.message || String(ollamaHostsError),
                )}`
              : "目前沒有可用的 Embedding model。"
        }</p>`;
    const html = `<div class="processing-embedding-strip rag-model-strip">
      <div class="rag-model-strip-head">
        <span class="rag-model-strip-title">${icon(
          "brain",
          13,
        )} Embedding 主機／模型</span>
        ${
          activeHost?.base_url
            ? `<span class="rag-model-strip-base mono">${escapeHtml(
                activeHost.base_url,
              )}</span>`
            : ""
        }
        <span class="rag-model-strip-current">目前：<strong>${escapeHtml(
          current || "—",
        )}</strong></span>
        <button class="btn btn-ghost btn-sm rag-model-refresh" type="button"
          data-processing-action="refresh-embedding-models"
          ${ollamaHostsLoading ? "disabled" : ""}>
          ${icon("refresh", 12)}<span>檢查模型</span>
        </button>
      </div>
      ${body}
      <p class="rag-model-hint">點選 <span class="mono">主機:模型</span> 切換 Embedding；選取後會成為第一優先，其他主機依序作為備援。切換模型後既有索引可能需要重建。</p>
    </div>`;
    if (slot.innerHTML !== html) slot.innerHTML = html;
  };

  const syncActiveImport = (active) => {
    const card = content.querySelector('[data-import-timeline="judgment"]');
    if (!card) return;
    const monthKey = String(active?.active_month || "");
    const processingMonthKey = String(active?.processing_month || "");
    card.querySelectorAll(".processing-month").forEach((cell) => {
      const isActive = Boolean(monthKey) && cell.dataset.month === monthKey;
      cell.classList.toggle("is-current", isActive);
      cell.classList.toggle(
        "is-processing-current",
        Boolean(processingMonthKey) &&
          cell.dataset.month === processingMonthKey,
      );
      if (isActive) cell.setAttribute("aria-current", "true");
      else cell.removeAttribute("aria-current");
    });
    const row = card.querySelector(".index-current-row");
    if (!monthKey || !active?.active_archive) {
      if (row) row.remove();
      return;
    }
    const labels =
      lastSnapshot?.workflows?.find((item) => item.id === "judgment_import")
        ?.import_timeline?.stage_labels || {};
    const html = importActiveRowMarkup({
      activeMonth: monthKey,
      activeArchive: active.active_archive,
      activePhase: active.active_phase || "",
      processingMonth: active.processing_month || "",
      processingArchive: active.processing_archive || "",
      stageLabels: labels,
    });
    if (row) {
      row.innerHTML = html;
      return;
    }
    const container = card.querySelector(".judgment-months");
    if (!container) return;
    const rowElement = document.createElement("div");
    rowElement.className = "index-current-row";
    rowElement.innerHTML = html;
    const meta = container.querySelector(".judgment-months-meta");
    if (meta) meta.insertAdjacentElement("afterend", rowElement);
    else container.prepend(rowElement);
  };

  const activeImportStamp = (active) => {
    const value = Number(active?.state_mtime_ns);
    return Number.isFinite(value) ? value : -1;
  };

  const activeImportMonthRank = (active) => {
    const month = String(active?.active_month || "");
    return /^\d{6}$/.test(month) ? Number(month) : -1;
  };

  const applyActiveImport = (active) => {
    if (!active) return;
    const stamp = activeImportStamp(active);
    if (stamp >= 0 && stamp < lastActiveImportStamp) {
      if (lastActiveImport?.active_month) syncActiveImport(lastActiveImport);
      return;
    }
    if (stamp >= 0) lastActiveImportStamp = stamp;
    const month = String(active.active_month || "");
    const sameRun = Boolean(
      active.run_id && active.run_id === lastActiveImport?.run_id,
    );
    if (
      sameRun &&
      activeImportMonthRank(active) >= 0 &&
      activeImportMonthRank(active) < activeImportMonthRank(lastActiveImport)
    ) {
      // Import phases visit archives from the first month again.  The
      // outline stays on the highest month that has started in this run,
      // while the processing row still follows the actual archive.
      const merged = {
        ...active,
        active_month: lastActiveImport.active_month,
        active_archive: lastActiveImport.active_archive,
      };
      lastActiveImport = merged;
      syncActiveImport(merged);
      return;
    }
    if (!month && active.run_status === "running") {
      // There can be a short gap between archives while the next one is
      // being prepared.  Keep the last circle instead of briefly jumping
      // back to the previously completed month.  A new run clears it.
      if (
        lastActiveImport?.active_month &&
        lastActiveImport?.run_id === active.run_id
      ) {
        syncActiveImport(lastActiveImport);
      } else {
        lastActiveImport = active;
        syncActiveImport(active);
      }
      return;
    }
    lastActiveImport = active;
    syncActiveImport(active);
  };

  const applySnapshotActiveImport = (snapshot) => {
    const active = snapshot?.active_import;
    if (active) {
      applyActiveImport(active);
      return;
    }
    if (lastActiveImport?.active_month) {
      syncActiveImport(lastActiveImport);
    }
  };

  const connectRefreshStream = () => {
    if (disposed || refreshStream) return;
    refreshStream = subscribeRefresh(
      [
        "processing",
        "judgment-download",
        "system-usage",
        "ollama",
        "court-check",
        "law-version-check",
      ],
      (topic, payload) => {
        if (disposed) return;
        if (topic === "processing") {
          if (payload?.snapshot?.live) {
            applyLiveProcessing(payload.snapshot);
          } else if (payload?.snapshot) {
            applySnapshot(payload.snapshot, { silent: true });
          } else {
            // Compatibility fallback for an older backend that only sends
            // the refresh notification.
            refresh({ silent: true });
          }
          return;
        }
        if (topic === "judgment-download") {
          if (activeWorkflowId === "judgment_download") {
            loadJudgmentStatus({
              quiet: true,
              payload: payload?.snapshot || null,
            });
          }
          return;
        }
        if (topic === "system-usage") {
          if (activeWorkflowId === "index_versions") {
            loadIndexStorage({
              quiet: true,
              force: true,
              payload: payload?.snapshot || null,
            });
          }
          return;
        }
        if (topic === "ollama") {
          if (OLLAMA_PRIORITY_WORKFLOWS.has(activeWorkflowId)) {
            loadOllamaHosts({
              quiet: true,
              payload: payload?.snapshot || null,
            });
          }
          return;
        }
        if (topic === "court-check") {
          if (activeWorkflowId === "normalize_courts") {
            loadCourtCheck({
              quiet: true,
              force: true,
              payload: payload?.snapshot || null,
            });
          }
          return;
        }
        if (topic === "law-version-check") {
          if (activeWorkflowId === "backfill_law_articles") {
            loadLawVersionCheck({
              quiet: true,
              force: true,
              payload: payload?.snapshot || null,
            });
          }
        }
      },
      {
        onProgress: (topic, payload) => {
          if (topic !== "processing") return;
          const event = payload?.event;
          if (event) applyProgressEvent(event);
        },
        onError: () => {
          // Fallback only when the stream never delivered an initial
          // snapshot.  Normal updates always come via SSE.
          if (!lastSnapshot) refresh({ silent: true });
        },
      },
    );
  };

  const disconnectRefreshStream = () => {
    if (!refreshStream) return;
    refreshStream();
    refreshStream = null;
  };

  const switchEmbeddingModel = async (value) => {
    if (embeddingSaving) return;
    const [hostIdRaw, ...modelParts] = String(value || "").split("|");
    const hostId = Number(hostIdRaw);
    const model = modelParts.join("|");
    if (!hostId || !model) {
      syncEmbeddingStrip();
      return;
    }
    const host = (ollamaHosts?.hosts || []).find(
      (item) => Number(item.id) === hostId,
    );
    if (!host) {
      syncEmbeddingStrip();
      return;
    }
    const label = `${host.name || host.base_url || `主機 ${host.id}`}:${model}`;
    if (label === currentEmbeddingLabel()) {
      syncEmbeddingStrip();
      return;
    }
    if (
      !window.confirm(
        `切換 Embedding 為 ${label}？\n\n` +
          "切換模型後，既有法規／命令與判決向量索引可能不相容，需要重新建立索引。",
      )
    ) {
      syncEmbeddingStrip();
      return;
    }
    embeddingSaving = true;
    syncEmbeddingStrip();
    try {
      await api.selectOllamaModel(hostId, { model, role: "embedding" });
      const hostIds = (ollamaHosts?.hosts || []).map((item) =>
        Number(item.id),
      );
      const reordered = [
        hostId,
        ...hostIds.filter((id) => id !== hostId),
      ];
      await api.reorderOllamaHosts(reordered);
      toast(`已切換 Embedding 為 ${label}。`, "ok", 6000);
      ollamaHosts = null;
      await loadOllamaHosts({ quiet: true });
      await refresh({ silent: true });
    } catch (error) {
      toast(error.message || "無法切換 Embedding model。", "danger", 7000);
      await loadOllamaHosts({ quiet: true });
    } finally {
      embeddingSaving = false;
      syncEmbeddingStrip();
    }
  };

  const loadOllamaHosts = async ({
    quiet = false,
    button = null,
    payload = null,
  } = {}) => {
    if (disposed || ollamaHostsLoading) return;
    ollamaHostsLoading = true;
    ollamaHostsError = null;
    if (!ollamaHosts) {
      syncOllamaDom();
      syncEmbeddingStrip();
    }
    if (button) setBusy(button, true, "檢查中…");
    try {
      const data = payload || (await api.ollamaHosts());
      if (disposed) return;
      ollamaHosts = data;
    } catch (error) {
      if (disposed) return;
      ollamaHostsError = error;
      if (!quiet) {
        toast(error.message || "無法檢查 Ollama 主機。", "danger", 6000);
      }
    } finally {
      if (!disposed) {
        ollamaHostsLoading = false;
        if (button) setBusy(button, false);
        syncOllamaDom();
        syncEmbeddingStrip();
      }
    }
  };

  const persistOllamaOrder = async (hostIds) => {
    if (ollamaReorderBusy) return;
    const currentIds = (ollamaHosts?.hosts || []).map((host) =>
      Number(host.id),
    );
    const nextIds = hostIds.map((id) => Number(id));
    if (
      !nextIds.length ||
      nextIds.length !== currentIds.length ||
      nextIds.every((id, index) => id === currentIds[index])
    ) {
      syncOllamaDom();
      return;
    }
    ollamaReorderBusy = true;
    const byId = new Map(
      (ollamaHosts?.hosts || []).map((host) => [Number(host.id), host]),
    );
    const reordered = nextIds.map((id) => byId.get(id)).filter(Boolean);
    if (ollamaHosts && reordered.length === currentIds.length) {
      ollamaHosts = {
        ...ollamaHosts,
        hosts: reordered,
        active_host_id: nextIds[0],
      };
      const slot = content.querySelector("[data-processing-ollama]");
      if (slot) slot.dataset.ollamaSignature = "";
      syncOllamaDom();
    }
    try {
      await api.reorderOllamaHosts(nextIds);
      toast("已更新 Ollama 主機優先順序。", "ok", 3500);
    } catch (error) {
      toast(
        error.message || "無法更新 Ollama 主機優先順序。",
        "danger",
        6000,
      );
      await loadOllamaHosts({ quiet: true });
    } finally {
      ollamaReorderBusy = false;
    }
  };

  const restoreOllamaOrder = () => {
    const slot = content.querySelector("[data-processing-ollama]");
    if (slot) slot.dataset.ollamaSignature = "";
    syncOllamaDom();
  };

  const cleanupOllamaPointerDrag = () => {
    const drag = ollamaPointerDrag;
    if (!drag) return;
    const row = content.querySelector(
      `[data-ollama-host][data-host-id="${drag.hostId}"]`,
    );
    row?.classList.remove("is-dragging");
    if (drag.captureTarget?.hasPointerCapture?.(drag.pointerId)) {
      try {
        drag.captureTarget.releasePointerCapture(drag.pointerId);
      } catch (error) {
        /* the pointer may already be released by the browser */
      }
    }
    document.documentElement.classList.remove("processing-ollama-dragging");
    window.removeEventListener("pointermove", onOllamaPointerMove);
    window.removeEventListener("pointerup", onOllamaPointerUp);
    window.removeEventListener("pointercancel", onOllamaPointerCancel);
    ollamaPointerDrag = null;
    ollamaDragHostId = 0;
  };

  const onOllamaPointerMove = (event) => {
    const drag = ollamaPointerDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (!drag.dragging) {
      const distance = Math.hypot(
        event.clientX - drag.startX,
        event.clientY - drag.startY,
      );
      if (distance < 5) return;
      drag.dragging = true;
      ollamaDragHostId = drag.hostId;
      ollamaDragChanged = false;
      content
        .querySelector(
          `[data-ollama-host][data-host-id="${drag.hostId}"]`,
        )
        ?.classList.add("is-dragging");
      document.documentElement.classList.add("processing-ollama-dragging");
    }
    event.preventDefault();
    const edge = 64;
    if (event.clientY < edge) {
      window.scrollBy(0, -12);
    } else if (event.clientY > window.innerHeight - edge) {
      window.scrollBy(0, 12);
    }
    const list = content.querySelector("[data-ollama-list]");
    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest?.("[data-ollama-host]");
    if (!list || !target || !list.contains(target)) return;
    const dragged = list.querySelector(
      `[data-ollama-host][data-host-id="${drag.hostId}"]`,
    );
    if (!dragged || dragged === target) return;
    const rect = target.getBoundingClientRect();
    const after = event.clientY > rect.top + rect.height / 2;
    list.insertBefore(dragged, after ? target.nextSibling : target);
    ollamaDragChanged = true;
  };

  const onOllamaPointerUp = (event) => {
    const drag = ollamaPointerDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const wasDragging = drag.dragging;
    const changed = ollamaDragChanged;
    const list = content.querySelector("[data-ollama-list]");
    const hostIds =
      wasDragging && list
        ? [...list.querySelectorAll("[data-ollama-host]")].map((element) =>
            Number(element.dataset.hostId),
          )
        : [];
    cleanupOllamaPointerDrag();
    if (wasDragging && changed && hostIds.length) {
      void persistOllamaOrder(hostIds);
    }
  };

  const onOllamaPointerCancel = () => {
    const wasDragging = Boolean(ollamaPointerDrag?.dragging);
    cleanupOllamaPointerDrag();
    if (wasDragging) restoreOllamaOrder();
  };

  const onOllamaPointerDown = (event) => {
    if (
      event.button !== 0 ||
      (event.pointerType === "mouse" && event.buttons !== 1)
    ) {
      return;
    }
    if (ollamaReorderBusy || ollamaPointerDrag) return;
    const row = event.target.closest("[data-ollama-host]");
    if (!row || !content.contains(row) || event.target.closest("button")) {
      return;
    }
    if (
      event.pointerType === "touch" &&
      !event.target.closest(".processing-ollama-handle")
    ) {
      return;
    }
    const hostId = Number(row.dataset.hostId) || 0;
    if (!hostId) return;
    event.preventDefault();
    ollamaDragHostId = hostId;
    ollamaPointerDrag = {
      hostId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      captureTarget: row,
    };
    try {
      row.setPointerCapture(event.pointerId);
    } catch (error) {
      /* pointer capture is an enhancement, not required for dragging */
    }
    window.addEventListener("pointermove", onOllamaPointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", onOllamaPointerUp);
    window.addEventListener("pointercancel", onOllamaPointerCancel);
  };

  const loadJudgmentStatus = async ({
    quiet = false,
    payload = null,
  } = {}) => {
    if (judgmentStatusLoading) return;
    judgmentStatusLoading = true;
    if (!judgmentStatus && activeWorkflowId === "judgment_download") {
      syncJudgmentDom();
    }
    try {
      judgmentStatus = payload || (await api.judgmentDownloadStatus());
      judgmentStatusError = null;
    } catch (error) {
      judgmentStatusError = error.message || "讀取月份狀態失敗。";
      if (!quiet) {
        toast(judgmentStatusError, "danger", 7000);
      }
    } finally {
      judgmentStatusLoading = false;
      if (activeWorkflowId === "judgment_download") {
        syncJudgmentDom();
      }
    }
  };

  const loadIndexStorage = async ({
    quiet = true,
    force = false,
    payload = null,
  } = {}) => {
    if (indexStorageLoading) return;
    if (
      !force &&
      indexStorage &&
      Date.now() - indexStorageLoadedAt < 30000
    ) {
      return;
    }
    indexStorageLoading = true;
    try {
      indexStorage = payload || (await api.systemUsage());
      indexStorageError = null;
      indexStorageLoadedAt = Date.now();
    } catch (error) {
      indexStorageError = error.message || "無法取得 Qdrant 容器與 volume 資訊。";
      if (!quiet) {
        toast(indexStorageError, "danger", 7000);
      }
    } finally {
      indexStorageLoading = false;
    }
  };

  const loadCourtCheck = async ({
    quiet = true,
    force = false,
    payload = null,
  } = {}) => {
    if (courtCheckLoading) return;
    if (
      !force &&
      courtCheck &&
      Date.now() - courtCheckLoadedAt < 60000
    ) {
      return;
    }
    courtCheckLoading = true;
    try {
      courtCheck = payload || (await api.checkCourts());
      courtCheckError = null;
      courtCheckLoadedAt = Date.now();
    } catch (error) {
      courtCheckError = error.message || "無法檢查法院名稱。";
      if (!quiet) {
        toast(courtCheckError, "danger", 7000);
      }
    } finally {
      courtCheckLoading = false;
    }
  };

  const loadLawVersionCheck = async ({
    quiet = true,
    force = false,
    button = null,
    payload = null,
  } = {}) => {
    if (lawVersionCheckLoading) return;
    if (
      !force &&
      lawVersionCheck &&
      Date.now() - lawVersionCheckLoadedAt < 60000
    ) {
      return;
    }
    lawVersionCheckLoading = true;
    if (button) setBusy(button, true, "檢查中…");
    try {
      lawVersionCheck = payload || (await api.checkLawVersions());
      lawVersionCheckError = null;
      lawVersionCheckLoadedAt = Date.now();
      if (!quiet) {
        const totals = lawVersionCheck.totals || {};
        const needed = Number(totals.needs_backfill_versions) || 0;
        const backfillable = Number(totals.backfillable_versions) || 0;
        const blocked = Number(totals.blocked_versions) || 0;
        if (needed > 0) {
          toast(
            `檢查完成：需要建立 ${needed} 個版本的條文歷史` +
              `（可建立 ${backfillable}、缺原始檔 ${blocked}）。`,
            blocked > 0 ? "danger" : "warn",
            7000,
          );
        } else {
          toast(
            `檢查完成：目前 ${Number(totals.versions) || 0} 個版本都已有歷史條文，不需要建立。`,
            "ok",
            5000,
          );
        }
      }
    } catch (error) {
      lawVersionCheckError =
        error.message || "無法檢查條文歷史狀態。";
      if (!quiet) {
        toast(lawVersionCheckError, "danger", 7000);
      }
    } finally {
      lawVersionCheckLoading = false;
      if (button) setBusy(button, false);
    }
  };

  const findStageElement = (key) =>
    Array.from(content.querySelectorAll("[data-stage-key]")).find(
      (element) => element.dataset.stageKey === key,
    ) || null;

  const openProcessingStage = (id) => {
    if (!id) return;
    expandedStages.add(id);
    const details = Array.from(
      content.querySelectorAll(
        ".processing-wf-stage[data-processing-stage]",
      ),
    ).find((element) => element.dataset.processingStage === id);
    if (!details) return;
    details.open = true;
    details.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const clearStageHover = () => {
    if (!hoveredStageKey) return;
    hoveredStageKey = "";
    stageTooltip.hidden = true;
    content.querySelectorAll("[data-workflow-progress]").forEach((card) => {
      card.classList.remove("is-stage-hovering");
    });
    content.querySelectorAll("[data-stage-key]").forEach((element) => {
      element.classList.remove("is-stage-hovered");
    });
  };

  const showStageTooltip = (target) => {
    const key = target.dataset.stageKey || "";
    if (!key) return;
    hoveredStageKey = key;
    const card = target.closest("[data-workflow-progress]");
    content.querySelectorAll("[data-workflow-progress]").forEach((item) => {
      item.classList.toggle("is-stage-hovering", item === card);
    });
    content.querySelectorAll("[data-stage-key]").forEach((element) => {
      element.classList.toggle("is-stage-hovered", element.dataset.stageKey === key);
    });

    const statusKey = target.dataset.stageStatusKey || "idle";
    const statusLabel = target.dataset.stageStatus || statusInfo(statusKey).label;
    const color = target.dataset.stageColor || "var(--accent)";
    const updateCount = Number(target.dataset.stageUpdate) || 0;
    const pendingCount = Number(target.dataset.stagePending) || 0;
    const contributionLabel =
      target.dataset.stageContributionLabel || "整體占比";
    stageTooltip.innerHTML = `<div class="processing-stage-tooltip-head">
      <span class="processing-stage-tooltip-swatch" style="background:${escapeHtml(
        color,
      )}"></span>
      <strong>${escapeHtml(target.dataset.stageLabel || key)}</strong>
      ${statusBadge(statusKey, statusLabel)}
    </div>
    <div class="processing-stage-tooltip-meta">
      <span>階段進度 <strong>${escapeHtml(
        target.dataset.stagePercent || "—",
      )}</strong></span>
      <span>${escapeHtml(contributionLabel)} <strong>${escapeHtml(
        target.dataset.stageContribution || "—",
      )}</strong></span>
      <span class="mono">${escapeHtml(
        target.dataset.stageDuration || "—",
      )}</span>
    </div>
    <div class="processing-stage-tooltip-counts">${escapeHtml(
      target.dataset.stageCounts || "—",
    )}</div>
    ${
      updateCount || pendingCount
        ? `<div class="processing-stage-tooltip-badges">
            ${
              updateCount
                ? `<span class="processing-wf-count is-update">${icon(
                    "download",
                    11,
                  )}<strong>${formatNumber(updateCount)}</strong><span>線上更新</span></span>`
                : ""
            }
            ${
              pendingCount
                ? `<span class="processing-wf-count is-pending">${icon(
                    "clock",
                    11,
                  )}<strong>${formatNumber(pendingCount)}</strong><span>待執行</span></span>`
                : ""
            }
          </div>`
        : ""
    }
    ${
      target.dataset.stageMessage
        ? `<div class="processing-stage-tooltip-message">${escapeHtml(
            target.dataset.stageMessage,
          )}</div>`
        : ""
    }`;
    stageTooltip.hidden = false;
    const width = Math.min(300, Math.max(220, window.innerWidth - 24));
    stageTooltip.style.width = `${width}px`;
    const rect = target.getBoundingClientRect();
    const left = Math.min(
      window.innerWidth - width - 12,
      Math.max(12, rect.left),
    );
    const above = rect.top - stageTooltip.offsetHeight - 10;
    const top =
      above >= 12
        ? above
        : Math.min(
            window.innerHeight - stageTooltip.offsetHeight - 12,
            rect.bottom + 10,
          );
    stageTooltip.style.left = `${left}px`;
    stageTooltip.style.top = `${Math.max(12, top)}px`;
  };

  const onStagePointerOver = (event) => {
    if (event.target.closest(".is-failure-tip")) {
      clearStageHover();
      return;
    }
    if (event.target.closest(".processing-wf-rail")) return;
    const target = event.target.closest("[data-stage-key]");
    if (!target || !content.contains(target)) return;
    if (target.contains(event.relatedTarget)) return;
    showStageTooltip(target);
  };

  const onStagePointerOut = (event) => {
    const target = event.target.closest("[data-stage-key]");
    if (!target || !content.contains(target)) return;
    if (target.contains(event.relatedTarget)) return;
    const next = event.relatedTarget?.closest?.("[data-stage-key]");
    if (next && next.dataset.stageKey === target.dataset.stageKey) return;
    clearStageHover();
  };

  const syncControls = (snapshot) => {
    const capabilities = snapshot.capabilities || {};
    if (!actionBusy && stopButton) {
      stopButton.hidden = !capabilities.can_stop_update;
    }
  };

  const repaintFromSnapshot = () => {
    if (!lastSnapshot) return;
    const markup = panelMarkup(
      lastSnapshot,
      activeWorkflowId,
      workflowContext(),
      expandedStages,
    );
    if (markup !== lastMarkup) {
      morphMarkup(content, markup);
      lastMarkup = markup;
    }
    syncJudgmentDom();
    syncOllamaDom();
    syncEmbeddingStrip();
    applySnapshotActiveImport(lastSnapshot);
  };

  const applySnapshot = (snapshot, { silent = false } = {}) => {
    if (disposed || !snapshot) return;
    const incomingAt = Date.parse(snapshot.generated_at || "");
    const currentAt = Date.parse(lastSnapshot?.generated_at || "");
    if (
      Number.isFinite(incomingAt) &&
      Number.isFinite(currentAt) &&
      incomingAt < currentAt
    ) {
      return;
    }
    if (pendingWorkflowId) {
      const workflow = (snapshot.workflows || []).find(
        (item) => item.id === pendingWorkflowId,
      );
      const runId =
        workflow?.active_run?.id || workflow?.last_run?.id || "";
      if (
        workflow?.active_run ||
        (runId && runId !== pendingWorkflowBaselineRunId)
      ) {
        pendingWorkflowId = "";
        pendingWorkflowBaselineRunId = "";
      }
    }
    lastSnapshot = snapshot;
      const stageById = new Map();
      for (const section of snapshot.sections || []) {
        for (const stage of section.stages || []) {
          stageById.set(`${section.key}-${stage.key}`, stage);
        }
      }
      for (const [id, operation] of stageOperations) {
        if (operation.kind !== "upgrade") continue;
        const stage = stageById.get(id);
        if (!stage) continue;
        if (
          stage.phase === "failed" ||
          (stage.phase === "running" && stage.percent !== null)
        ) {
          stageOperations.delete(id);
          continue;
        }
        if (stage.phase === "completed") {
          const started = Date.parse(stage.last_run?.started_at || "");
          if (
            Number.isFinite(started) &&
            started >= Number(operation.startedAt || 0) - 1000
          ) {
            stageOperations.delete(id);
          }
        }
      }
      const navMarkup = workflowNavMarkup(snapshot, activeWorkflowId);
      if (navMarkup !== lastNavMarkup) {
        morphMarkup(workflowNav, navMarkup);
        lastNavMarkup = navMarkup;
      }
      const markup = panelMarkup(
        snapshot,
        activeWorkflowId,
        workflowContext(),
        expandedStages,
      );
      if (markup !== lastMarkup) {
        morphMarkup(content, markup);
        lastMarkup = markup;
      }
      syncJudgmentDom();
      syncOllamaDom();
      if (hoveredStageKey) {
        const next = findStageElement(hoveredStageKey);
        if (next) showStageTooltip(next);
        else clearStageHover();
      }
      const updatedAt = content.querySelector("[data-processing-updated-at]");
      if (updatedAt) {
        const nextUpdatedAt = formatDateTime(snapshot.generated_at);
        if (updatedAt.textContent !== nextUpdatedAt) {
          updatedAt.textContent = nextUpdatedAt;
        }
      }
      syncControls(snapshot);
      syncEmbeddingStrip();
      applySnapshotActiveImport(snapshot);
      if (!ollamaHosts && !ollamaHostsLoading) {
        loadOllamaHosts({ quiet: true });
      }
    if (pendingProgressEvents.length) {
      const events = pendingProgressEvents.splice(0);
      for (const event of events) applyProgressEvent(event);
    }
  };

  const scheduleLiveRender = (live) => {
    pendingLiveRender = live;
    if (typeof requestAnimationFrame === "undefined") {
      const next = pendingLiveRender;
      pendingLiveRender = null;
      if (next) applyLiveProcessing(next);
      return;
    }
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(() => {
      progressFrame = 0;
      const next = pendingLiveRender;
      pendingLiveRender = null;
      if (next) applyLiveProcessing(next);
    });
  };

  const applyProgressEvent = (event) => {
    if (!event) return;
    if (!lastSnapshot) {
      pendingProgressEvents.push(event);
      if (pendingProgressEvents.length > 100) pendingProgressEvents.shift();
      return;
    }
    const runId = String(event.run_id || "");
    const seq = Number(event.seq) || 0;
    if (
      runId &&
      runId === lastProgressRunId &&
      seq > 0 &&
      seq <= lastProgressSeq
    ) {
      return;
    }
    if (runId && runId !== lastProgressRunId) {
      lastProgressRunId = runId;
      lastProgressSeq = 0;
    }
    if (seq > 0) lastProgressSeq = seq;
    const workflowId = String(event.workflow_id || "judgment_import");
    const workflow = (lastSnapshot.workflows || []).find(
      (item) => item.id === workflowId,
    );
    if (!workflow) return;
    if (!workflow.progress) workflow.progress = { stages: [] };
    if (!Array.isArray(workflow.progress.stages)) {
      workflow.progress.stages = [];
    }
    const stageKey = String(event.stage || "");
    const stage = stageKey
      ? workflow.progress.stages.find(
          (item) => String(item.key) === stageKey,
        )
      : null;
    if (stage) {
      if (event.status) stage.status = String(event.status);
      if (event.current !== undefined) {
        stage.current = Number(event.current) || 0;
      }
      if (event.total !== undefined) {
        stage.total = Number(event.total) || 0;
      }
      if (event.percent !== undefined) {
        stage.percent = Number(event.percent) || 0;
      }
      if (event.message) stage.message = String(event.message);
    }
    if (event.overall_percent !== undefined) {
      workflow.progress.overall_percent =
        Number(event.overall_percent) || 0;
    }
    if (event.type !== "run_finished") {
      workflow.progress.run_status = "running";
    }
    if (
      (event.type === "archive_started" ||
        event.type === "stage_progress") &&
      !workflow.active_run &&
      event.run_id
    ) {
      workflow.active_run = {
        id: event.run_id,
        status: "running",
        started_at: event.timestamp,
        message: event.message || "",
      };
    }
    if (event.type === "archive_completed") {
      for (const item of workflow.progress.stages) {
        if (item.key === "filter" || item.key === "postgres") {
          item.status = "success";
        }
      }
    }
    if (event.type === "run_finished") {
      workflow.active_run = null;
      workflow.progress.run_status = String(event.status || "success");
      workflow.can_run = true;
    }
    const monthUpdates = [];
    if (event.month && event.month_stages) {
      monthUpdates.push({
        month: event.month,
        import_stages: event.month_stages,
        import_overall: event.month_overall || "",
      });
    }
    let activeImport = null;
    if (event.type === "archive_started" && event.month) {
      const parsed = Date.parse(event.timestamp || "");
      activeImport = {
        active_month: event.month,
        active_archive: event.archive,
        active_phase: event.stage || "filter",
        processing_month: event.month,
        processing_archive: event.archive,
        run_id: event.run_id,
        run_status: "running",
        state_mtime_ns: Number.isFinite(parsed)
          ? parsed * 1_000_000
          : Date.now() * 1_000_000,
      };
    } else if (event.type === "run_finished") {
      activeImport = {
        ...(lastSnapshot.active_import || {}),
        run_status: String(event.status || "success"),
      };
    }
    scheduleLiveRender({
      live: true,
      generated_at: event.timestamp,
      workflows: [
        {
          id: workflowId,
          active_run: workflow.active_run,
          last_run: workflow.last_run,
          progress: workflow.progress,
          can_run: workflow.can_run,
        },
      ],
      import_timeline_months: monthUpdates,
      active_import: activeImport,
    });
  };

  const applyLiveProcessing = (live) => {
    if (disposed || !live || !lastSnapshot) return;
    const workflowById = new Map(
      (live.workflows || []).map((workflow) => [workflow.id, workflow]),
    );
    if (pendingWorkflowId) {
      const pending = workflowById.get(pendingWorkflowId);
      const runId = pending?.active_run?.id || pending?.last_run?.id || "";
      if (
        pending?.active_run ||
        (runId && runId !== pendingWorkflowBaselineRunId)
      ) {
        pendingWorkflowId = "";
        pendingWorkflowBaselineRunId = "";
      }
    }
    for (const workflow of lastSnapshot.workflows || []) {
      const update = workflowById.get(workflow.id);
      if (!update) continue;
      if ("active_run" in update) workflow.active_run = update.active_run;
      if ("last_run" in update) workflow.last_run = update.last_run;
      if (Array.isArray(update.recent_runs)) {
        workflow.recent_runs = update.recent_runs;
      }
      if (update.progress) workflow.progress = update.progress;
      if (typeof update.can_run === "boolean") {
        workflow.can_run = update.can_run;
      }
    }
    const patchTimeline = (timeline) => {
      if (!timeline || !Array.isArray(live.import_timeline_months)) return;
      const byMonth = new Map(
        (timeline.months || []).map((month) => [
          String(month.month),
          month,
        ]),
      );
      for (const update of live.import_timeline_months) {
        const month = byMonth.get(String(update.month));
        if (!month) continue;
        month.import_stages = {
          ...(month.import_stages || {}),
          ...(update.import_stages || {}),
        };
        if (update.import_overall) {
          month.import_overall = update.import_overall;
        }
      }
      const summary = {
        complete: 0,
        incomplete: 0,
        processing: 0,
        empty: 0,
      };
      for (const month of timeline.months || []) {
        const overall = String(month.import_overall || "empty");
        summary[overall] = Number(summary[overall] || 0) + 1;
      }
      timeline.stage_summary = summary;
    };
    patchTimeline(lastSnapshot.import_timeline);
    for (const workflow of lastSnapshot.workflows || []) {
      if (workflow.id === "judgment_import") {
        patchTimeline(workflow.import_timeline);
      }
    }
    if (live.active_import) {
      lastSnapshot.active_import = live.active_import;
    }
    if (live.mode) lastSnapshot.mode = live.mode;
    if (live.generated_at) lastSnapshot.generated_at = live.generated_at;
    const navMarkup = workflowNavMarkup(lastSnapshot, activeWorkflowId);
    if (navMarkup !== lastNavMarkup) {
      morphMarkup(workflowNav, navMarkup);
      lastNavMarkup = navMarkup;
    }
    const markup = panelMarkup(
      lastSnapshot,
      activeWorkflowId,
      workflowContext(),
      expandedStages,
    );
    if (markup !== lastMarkup) {
      morphMarkup(content, markup);
      lastMarkup = markup;
    }
    syncJudgmentDom();
    syncOllamaDom();
    syncEmbeddingStrip();
    applySnapshotActiveImport(lastSnapshot);
    syncControls(lastSnapshot);
    const updatedAt = content.querySelector("[data-processing-updated-at]");
    if (updatedAt && live.generated_at) {
      const nextUpdatedAt = formatDateTime(live.generated_at);
      if (updatedAt.textContent !== nextUpdatedAt) {
        updatedAt.textContent = nextUpdatedAt;
      }
    }
  };

  const refresh = async ({ silent = false } = {}) => {
    if (disposed || refreshing) return;
    refreshing = true;
    try {
      const snapshot = await api.processing();
      applySnapshot(snapshot, { silent });
    } catch (error) {
      if (disposed) return;
      const markup = errorMarkup(error.message, lastSnapshot);
      if (markup !== lastMarkup) {
        morphMarkup(content, markup);
        lastMarkup = markup;
      }
      if (!silent) toast(error.message || "無法取得資料處理狀態。", "danger", 6000);
    } finally {
      refreshing = false;
    }
  };

  const checkUpdates = async (button, workflowId = "") => {
    if (actionBusy) return;
    actionBusy = true;
    setBusy(button, true, "檢查中…");
    const source = DOWNLOAD_WORKFLOW_SOURCES[workflowId] || "";
    const requested = String(button.dataset.sourceTypes || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const sources = requested.length ? requested : source ? [source] : [];
    const stageId = button.dataset.stageId || "";
    if (stageId) {
      stageOperations.set(stageId, {
        kind: "check",
        phase: "updating",
        startedAt: Date.now(),
      });
      repaintFromSnapshot();
    }
    try {
      const result = await api.checkUpdates(sources);
      if (result && result.checking) {
        if (stageId) {
          stageOperations.delete(stageId);
          repaintFromSnapshot();
        }
        toast("已有更新檢查正在進行，請稍後重新整理。", "info", 6000);
      } else if (sources.length === 1) {
        const record = (result.sources || {})[sources[0]] || {};
        const label =
          DOWNLOAD_WORKFLOW_LABELS[workflowId] ||
          (sources[0] === "judgment"
            ? "判決"
            : sources[0] === "law"
              ? "法規"
              : sources[0] === "order"
                ? "命令"
                : "資料");
        if (record.status === "error") {
          toast(
            `${label}版本檢查失敗：${record.message || "無法取得線上版本"}`,
            "danger",
            7000,
          );
        } else {
          toast(
            record.update_available
              ? `${label}線上已有更新版本。`
              : `${label}線上已是最新版本。`,
            record.update_available ? "warn" : "ok",
            6000,
          );
        }
      } else if (sources.length > 1) {
        const records = result.sources || {};
        const changed = sources.filter(
          (key) => records[key]?.update_available,
        );
        const failed = sources.filter((key) => records[key]?.status === "error");
        if (failed.length) {
          toast(
            `更新檢查完成，但有 ${failed.length} 項檢查失敗。`,
            "danger",
            7000,
          );
        } else {
          toast(
            changed.length
              ? `更新檢查完成：${changed.length} 項有更新。`
              : "更新檢查完成：目前皆為最新。",
            changed.length ? "warn" : "ok",
            6000,
          );
        }
      } else {
        const count = Number(result.update_count) || 0;
        toast(
          count > 0
            ? `更新檢查完成：${count} 項有更新。`
            : "更新檢查完成：目前皆為最新。",
          count > 0 ? "warn" : "ok",
          6000,
        );
      }
      if (stageId) {
        stageOperations.set(stageId, {
          kind: "check",
          phase: "updated",
          startedAt: Date.now(),
        });
        repaintFromSnapshot();
      }
      window.dispatchEvent(new CustomEvent("judgment:updates-changed"));
      await refresh({ silent: true });
    } catch (error) {
      if (stageId) {
        stageOperations.delete(stageId);
        repaintFromSnapshot();
      }
      toast(error.message || "更新檢查失敗。", "danger", 7000);
    } finally {
      actionBusy = false;
      setBusy(button, false);
      if (lastSnapshot) syncControls(lastSnapshot);
    }
  };

  const precheckDownloadWorkflow = async (workflowId) => {
    const source = DOWNLOAD_WORKFLOW_SOURCES[workflowId] || "";
    if (!source) return true;
    // The caller already locked the run button before this await.  Keep it
    // locked while the version check runs so the click cannot be repeated.
    let result = null;
    try {
      result = await api.checkUpdates([source]);
    } catch (error) {
      toast(
        `無法完成版本檢查（${error.message || "網路錯誤"}），將直接執行下載。`,
        "warn",
        7000,
      );
      return true;
    }
    if (!result || result.checking) {
      if (result && result.checking) {
        toast("已有更新檢查正在進行，將直接執行下載。", "info", 6000);
      }
      return true;
    }
    const record = (result.sources || {})[source];
    if (!record) return true;
    window.dispatchEvent(new CustomEvent("judgment:updates-changed"));
    if (record.status === "up_to_date" && !record.update_available) {
      const label = DOWNLOAD_WORKFLOW_LABELS[workflowId] || "資料";
      const checkedAt = record.checked_at
        ? `（${formatDateTime(record.checked_at)} 檢查）`
        : "";
      const detail =
        DOWNLOAD_FORCE_CONFIRMATIONS[workflowId] ||
        "仍要強制重新下載嗎？";
      return window.confirm(
        `${label}線上檢查為最新版本${checkedAt}。\n\n${detail}`,
      );
    }
    if (record.status === "error") {
      toast("版本檢查失敗，將直接執行下載。", "warn", 6000);
    }
    return true;
  };

  const startWorkflow = async (button, workflowId) => {
    if (actionBusy) return;
    actionBusy = true;
    const currentWorkflow = (lastSnapshot?.workflows || []).find(
      (item) => item.id === workflowId,
    );
    pendingWorkflowBaselineRunId =
      currentWorkflow?.active_run?.id ||
      currentWorkflow?.last_run?.id ||
      "";
    pendingWorkflowId = workflowId;
    // Lock the actual button before the first await.  The same pending id
    // also keeps repainted panels disabled while the start request is in
    // flight.
    setBusy(button, true, "執行中");
    // Drop the previous run's progress card now; the new run's card is
    // rendered from the next authoritative SSE snapshot.
    content
      .querySelectorAll("[data-workflow-progress]")
      .forEach((card) => card.remove());
    const stageId = button.dataset.stageId || "";
    let started = false;
    try {
      const proceed = await precheckDownloadWorkflow(workflowId);
      if (!proceed) return;
      if (stageId) {
        stageOperations.set(stageId, {
          kind: "upgrade",
          phase: "upgrading",
          startedAt: Date.now(),
        });
        repaintFromSnapshot();
      }
      let result;
      try {
        result = await api.startProcessingWorkflow(workflowId);
      } catch (error) {
        if (stageId) {
          stageOperations.delete(stageId);
          repaintFromSnapshot();
        }
        throw error;
      }
      started = true;
      toast("已啟動升級工作流程。", "ok", 6000);
      if (result && result.run_id) {
        console.info("processing workflow started", result);
      }
      window.dispatchEvent(new CustomEvent("judgment:updates-changed"));
    } catch (error) {
      toast(error.message || "無法啟動工作流程。", "danger", 7000);
    } finally {
      actionBusy = false;
      if (!started || pendingWorkflowId !== workflowId) {
        pendingWorkflowId = "";
        pendingWorkflowBaselineRunId = "";
        if (lastSnapshot) {
          syncControls(lastSnapshot);
          // Force the snapshot markup to win over the local spinner.  If an
          // SSE refresh repainted the panel while the start request was in
          // flight, setBusy(button, false) would leave an enabled button
          // still labelled "執行中".
          lastMarkup = "";
          repaintFromSnapshot();
        } else {
          setBusy(button, false);
        }
      }
      // On success, keep the button locked and the old progress hidden until
      // the processing SSE snapshot confirms the new run.
    }
  };

  const stopUpdate = async (button) => {
    if (actionBusy) return;
    actionBusy = true;
    setBusy(button, true, "停止中…");
    try {
      const result = await api.stopProcessingUpdate();
      for (const [id, operation] of stageOperations) {
        if (operation.kind === "upgrade") stageOperations.delete(id);
      }
      repaintFromSnapshot();
      toast(result.message || "已送出停止訊號。", "info", 6000);
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
    if (button.closest(".processing-wf-rail")) {
      // The action rail lives inside <summary>; keep its buttons from also
      // toggling the stage details.
      event.preventDefault();
      event.stopPropagation();
    }
    const action = button.dataset.processingAction;
    if (action === "refresh") refresh({ silent: false });
    else if (action === "open-stage") {
      openProcessingStage(button.dataset.stageId || "");
    } else if (action === "refresh-judgment-months") {
      loadJudgmentStatus({ quiet: false });
    } else if (action === "refresh-index-storage") {
      loadIndexStorage({ quiet: false, force: true });
    } else if (action === "refresh-court-check") {
      loadCourtCheck({ quiet: false, force: true });
    } else if (action === "refresh-law-version-check") {
      loadLawVersionCheck({ quiet: false, force: true, button });
    } else if (action === "refresh-ollama") {
      loadOllamaHosts({ quiet: false, button });
    } else if (action === "refresh-embedding-models") {
      loadOllamaHosts({ quiet: false, button });
    } else if (action === "select-embedding-model") {
      const hostId = button.dataset.hostId || "";
      const model = button.dataset.model || "";
      void switchEmbeddingModel(`${hostId}|${model}`);
    } else if (action === "move-ollama-host") {
      const hosts = ollamaHosts?.hosts || [];
      const index = hosts.findIndex(
        (host) => Number(host.id) === Number(button.dataset.hostId),
      );
      const direction = button.dataset.direction;
      const target =
        direction === "up" ? index - 1 : direction === "down" ? index + 1 : -1;
      if (index < 0 || target < 0 || target >= hosts.length) return;
      const hostIds = hosts.map((host) => Number(host.id));
      [hostIds[index], hostIds[target]] = [
        hostIds[target],
        hostIds[index],
      ];
      void persistOllamaOrder(hostIds);
    } else if (action === "check-updates")
      checkUpdates(button, button.dataset.workflowId || "");
    else if (action === "run-workflow") {
      const workflowId = button.dataset.workflowId || "";
      startWorkflow(button, workflowId);
    } else if (action === "stop") stopUpdate(button);
  };

  const selectWorkflow = (workflowId, { scroll = false } = {}) => {
    activeWorkflowId = workflowId || "overview";
    if (lastSnapshot) {
      const navMarkup = workflowNavMarkup(lastSnapshot, activeWorkflowId);
      morphMarkup(workflowNav, navMarkup);
      lastNavMarkup = navMarkup;
      const markup = panelMarkup(
        lastSnapshot,
        activeWorkflowId,
        workflowContext(),
        expandedStages,
      );
      morphMarkup(content, markup);
      lastMarkup = markup;
      syncJudgmentDom();
      syncOllamaDom();
      syncEmbeddingStrip();
      applySnapshotActiveImport(lastSnapshot);
      if (hoveredStageKey) {
        const next = findStageElement(hoveredStageKey);
        if (next) showStageTooltip(next);
        else clearStageHover();
      }
      if (scroll) {
        content.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    if (OLLAMA_PRIORITY_WORKFLOWS.has(activeWorkflowId)) {
      loadOllamaHosts({ quiet: true });
    }
    if (activeWorkflowId === "judgment_download") {
      loadJudgmentStatus({ quiet: true });
    }
    if (activeWorkflowId === "index_versions") {
      loadIndexStorage({ quiet: true });
    }
    if (activeWorkflowId === "normalize_courts") {
      loadCourtCheck({ quiet: true });
    }
    if (activeWorkflowId === "backfill_law_articles") {
      loadLawVersionCheck({ quiet: true });
    }
  };

  const onWorkflowClick = (event) => {
    const button = event.target.closest("[data-processing-workflow]");
    if (!button) return;
    selectWorkflow(button.dataset.processingWorkflow || "overview");
  };

  const onTimelineClick = (event) => {
    const button = event.target.closest("[data-timeline-workflow]");
    if (!button) return;
    event.preventDefault();
    selectWorkflow(button.dataset.timelineWorkflow || "", { scroll: true });
  };

  const onStageToggle = (event) => {
    const details = event.target.closest?.(
      ".processing-wf-stage[data-processing-stage]",
    );
    if (!details || !content.contains(details)) return;
    const id = details.dataset.processingStage || "";
    if (!id) return;
    if (details.open) expandedStages.add(id);
    else expandedStages.delete(id);
  };

  page.addEventListener("click", onClick);
  workflowNav.addEventListener("click", onWorkflowClick);
  content.addEventListener("click", onTimelineClick);
  content.addEventListener("pointerover", onStagePointerOver);
  content.addEventListener("pointerout", onStagePointerOut);
  content.addEventListener("pointerdown", onOllamaPointerDown);
  content.addEventListener("toggle", onStageToggle, true);
  window.addEventListener("scroll", clearStageHover, {
    capture: true,
    passive: true,
  });

  connectRefreshStream();
  if (typeof EventSource === "undefined") {
    await refresh({ silent: false });
  }

  return () => {
    disposed = true;
    disconnectRefreshStream();
    page.removeEventListener("click", onClick);
    workflowNav.removeEventListener("click", onWorkflowClick);
    content.removeEventListener("click", onTimelineClick);
    cleanupOllamaPointerDrag();
    content.removeEventListener("pointerover", onStagePointerOver);
    content.removeEventListener("pointerout", onStagePointerOut);
    content.removeEventListener("pointerdown", onOllamaPointerDown);
    content.removeEventListener("toggle", onStageToggle, true);
    window.removeEventListener("scroll", clearStageHover, {
      capture: true,
    });
  };
}
