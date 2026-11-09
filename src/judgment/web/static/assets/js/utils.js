/* Shared DOM, formatting and feedback helpers. */

const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const STATUS_META = {
  operational: { label: "正常", tone: "ok" },
  success: { label: "成功", tone: "ok" },
  ok: { label: "正常", tone: "ok" },
  healthy: { label: "正常", tone: "ok" },
  degraded: { label: "降級", tone: "warn" },
  warning: { label: "注意", tone: "warn" },
  empty: { label: "無資料", tone: "warn" },
  no_change: { label: "無變更", tone: "info" },
  running: { label: "執行中", tone: "info" },
  pending: { label: "等待", tone: "idle" },
  skipped: { label: "略過", tone: "idle" },
  partial: { label: "部分成功", tone: "warn" },
  preview: { label: "預覽模式", tone: "info" },
  retrieval_only: { label: "僅檢索結果", tone: "warn" },
  not_indexed: { label: "尚未索引", tone: "warn" },
  missing_query: { label: "等待查詢", tone: "idle" },
  client_side: { label: "瀏覽器端", tone: "info" },
  not_configured: { label: "未設定", tone: "idle" },
  unavailable: { label: "離線", tone: "danger" },
  failed: { label: "失敗", tone: "danger" },
  error: { label: "錯誤", tone: "danger" },
};

const TONE_CLASS = {
  ok: "badge-ok",
  warn: "badge-warn",
  danger: "badge-danger",
  info: "badge-info",
  idle: "badge-neutral",
};

const DOT_CLASS = {
  ok: "is-ok",
  warn: "is-warn",
  danger: "is-danger",
  info: "is-idle",
  idle: "is-idle",
};

const ICONS = {
  search:
    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  send: '<path d="M12 19V5"/><path d="m6 11 6-6 6 6"/>',
  refresh:
    '<path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4v5.5H15"/>',
  copy:
    '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  check: '<path d="m5 12 4.2 4.2L19 6.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m13.5 7.5 3 3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>',
  upload: '<path d="M12 21V9"/><path d="m7 14 5-5 5 5"/><path d="M5 3h14"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  external:
    '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/>',
  message:
    '<path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H6l-3 2 1.3-4.2A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  history:
    '<path d="M3.2 12a8.8 8.8 0 1 0 2.8-6.3L3.2 8.5"/><path d="M3 3.5v5h5"/><path d="M12 7.5V12l3 1.8"/>',
  database:
    '<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',
  layers:
    '<path d="m12 3 9 4.8-9 4.8-9-4.8L12 3Z"/><path d="m3 12.2 9 4.8 9-4.8"/><path d="m3 16.7 9 4.8 9-4.8"/>',
  cube:
    '<path d="m12 2.8 8.2 4.6v9.2L12 21.2l-8.2-4.6V7.4L12 2.8Z"/><path d="m3.8 7.4 8.2 4.6 8.2-4.6"/><path d="M12 12v9.2"/>',
  browser:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6.5 6.5h.01"/>',
  download:
    '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  chevronLeft: '<path d="m14.5 5-7 7 7 7"/>',
  chevronRight: '<path d="m9.5 5 7 7-7 7"/>',
  chevronDown: '<path d="m5 9 7 7 7-7"/>',
  arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  alert:
    '<path d="M12 3 2.5 20.5h19L12 3Z"/><path d="M12 9v4.5"/><path d="M12 17.5h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  sparkles:
    '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',
  table:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M9 9.5V20M15 9.5V20"/>',
  sliders:
    '<path d="M4 7h8M16 7h4M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  server:
    '<rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/><path d="M7 7h.01M7 17h.01"/>',
  brain:
    '<path d="M9.7 4.2a2.8 2.8 0 0 0-3 2.8 2.8 2.8 0 0 0-1.1 5.2A2.9 2.9 0 0 0 7.8 18a2.9 2.9 0 0 0 3.9 2V4.2a2.8 2.8 0 0 0-2 0Z"/><path d="M14.3 4.2a2.8 2.8 0 0 1 3 2.8 2.8 2.8 0 0 1 1.1 5.2A2.9 2.9 0 0 1 16.2 18a2.9 2.9 0 0 1-3.9 2"/>',
  cloud:
    '<path d="M7 18.5h10.5a3.5 3.5 0 0 0 .4-7 5.5 5.5 0 0 0-10.6-1.3A4.2 4.2 0 0 0 7 18.5Z"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  play: '<path d="M7 4.5v15l13-7.5-13-7.5Z"/>',
  file:
    '<path d="M6 2.8h8l4.5 4.5v13.9H6V2.8Z"/><path d="M14 2.8V7.5h5"/>',
  activity: '<path d="M3 12h4l2.2-5 4.1 10 2.2-5H21"/>',
  shield:
    '<path d="M12 2.8 20 6v6c0 4.7-3.2 8-8 9.2C7.2 20 4 16.7 4 12V6l8-3.2Z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
  terminal: '<path d="m5 7 5 5-5 5"/><path d="M12 17h7"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2"/>',
  grid:
    '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  cpu:
    '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9.5 9.5h5v5h-5z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

export function icon(name, size = 16, className = "") {
  const paths = ICONS[name] || ICONS.info;
  const cls = className ? ` class="${escapeHtml(className)}"` : "";
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return new Intl.NumberFormat("zh-TW").format(number);
}

export function formatBytes(value) {
  if (value === null || value === undefined || value === "") return "—";
  let size = Number(value);
  if (!Number.isFinite(size)) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return index === 0 ? `${size.toFixed(0)} B` : `${size.toFixed(1)} ${units[index]}`;
}

function toDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (/^\d{8}$/.test(text)) {
    return new Date(
      Number(text.slice(0, 4)),
      Number(text.slice(4, 6)) - 1,
      Number(text.slice(6, 8)),
    );
  }
  const naiveIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(text);
  const date = new Date(naiveIso ? `${text}Z` : text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return value ? escapeHtml(value) : "—";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return value ? escapeHtml(value) : "—";
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatRelativeTime(value) {
  const date = toDate(value);
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 45_000) return "剛剛";
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))} 分鐘前`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} 小時前`;
  if (diff < 604_800_000) return `${Math.round(diff / 86_400_000)} 天前`;
  return formatDate(date);
}

export function formatDuration(value) {
  if (value === null || value === undefined || value === "") return "—";
  const ms = Number(value);
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function statusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status ? String(status) : "未知",
      tone: "idle",
    }
  );
}

export function statusBadge(status, label) {
  const meta = statusMeta(status);
  return `<span class="badge ${TONE_CLASS[meta.tone]}"><span class="status-dot ${DOT_CLASS[meta.tone]}"></span>${escapeHtml(
    label || meta.label,
  )}</span>`;
}

export function statusDot(status, label = "") {
  const meta = statusMeta(status);
  return `<span class="status-dot ${DOT_CLASS[meta.tone]}" title="${escapeHtml(
    label || meta.label,
  )}" aria-hidden="true"></span>`;
}

export function sourceBadge(value) {
  if (value === "law") return '<span class="badge badge-info">法規</span>';
  if (value === "order") return '<span class="badge badge-neutral">命令</span>';
  if (!value) return '<span class="cell-empty">—</span>';
  return `<span class="badge badge-neutral">${escapeHtml(value)}</span>`;
}

function truncate(value, length) {
  const text = String(value ?? "");
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

export function formatCell(value, type = "text") {
  if (value === null || value === undefined || value === "") {
    return '<span class="cell-empty">—</span>';
  }

  switch (type) {
    case "boolean": {
      return value
        ? '<span class="badge badge-ok">是</span>'
        : '<span class="badge badge-neutral">否</span>';
    }
    case "status":
      return statusBadge(String(value));
    case "source":
      return sourceBadge(String(value));
    case "number":
      return `<span class="mono">${formatNumber(value)}</span>`;
    case "duration":
      return `<span class="mono">${formatDuration(value)}</span>`;
    case "datetime":
      return `<span class="mono">${formatDateTime(value)}</span>`;
    case "date":
      return `<span class="mono">${formatDate(value)}</span>`;
    case "url": {
      const text = String(value);
      const label = truncate(text.replace(/^https?:\/\//, ""), 46);
      return `<span class="cell-url"><a href="${escapeHtml(
        text,
      )}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(
        text,
      )}">${icon("external", 10)}${escapeHtml(label)}</a></span>`;
    }
    case "mono": {
      const text = String(value);
      return `<span class="cell-mono cell-truncate" title="${escapeHtml(text)}">${escapeHtml(
        truncate(text, 54),
      )}</span>`;
    }
    case "longtext": {
      const text = String(value);
      return `<span class="cell-truncate" title="${escapeHtml(text)}">${escapeHtml(
        truncate(text, 100),
      )}</span>`;
    }
    default: {
      const text = String(value);
      return `<span class="cell-truncate" title="${escapeHtml(text)}">${escapeHtml(
        truncate(text, 90),
      )}</span>`;
    }
  }
}

export function notice({ tone = "info", title, text, iconName = "info" }) {
  const mark = tone === "ok" ? "check" : tone === "danger" ? "alert" : tone === "warn" ? "alert" : "i";
  return `<div class="notice notice-${tone}" role="status">
    <span class="notice-icon" aria-hidden="true">${
      mark === "i" ? "i" : icon(mark, 12)
    }</span>
    <div class="notice-body">
      ${title ? `<strong>${escapeHtml(title)}</strong>` : ""}
      ${text ? `<p>${text}</p>` : ""}
    </div>
  </div>`;
}

export function emptyState({ iconName = "search", title, text = "", actions = "", className = "" }) {
  return `<div class="empty-state ${className}">
    <span class="empty-icon">${icon(iconName, 24)}</span>
    <h3 class="empty-title">${escapeHtml(title)}</h3>
    ${text ? `<p class="empty-text">${text}</p>` : ""}
    ${actions ? `<div class="empty-actions">${actions}</div>` : ""}
  </div>`;
}

export function setBusy(button, busy, label = "處理中…") {
  if (!button) return;
  if (busy) {
    if (!button.dataset.idleHtml) button.dataset.idleHtml = button.innerHTML;
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>${escapeHtml(
      label,
    )}</span>`;
  } else {
    button.disabled = false;
    button.classList.remove("is-loading");
    if (button.dataset.idleHtml) {
      button.innerHTML = button.dataset.idleHtml;
      delete button.dataset.idleHtml;
    }
  }
}

export function toast(message, tone = "info", timeout = 4200) {
  const region = document.getElementById("toast-region");
  if (!region) return null;
  const marks = { info: "i", ok: "✓", warn: "!", danger: "×" };
  const element = document.createElement("div");
  element.className = `toast toast-${tone}`;
  element.setAttribute("role", tone === "danger" ? "alert" : "status");
  element.innerHTML = `<span class="toast-mark" aria-hidden="true">${marks[tone] || "i"}</span>
    <div class="toast-body">${escapeHtml(message)}</div>
    <button class="toast-close" type="button" aria-label="關閉通知">×</button>`;
  const dismiss = () => {
    if (!element.isConnected) return;
    element.classList.add("is-leaving");
    window.setTimeout(() => element.remove(), 190);
  };
  element.querySelector(".toast-close").addEventListener("click", dismiss);
  region.appendChild(element);
  if (timeout > 0) window.setTimeout(dismiss, timeout);
  return element;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (copyError) {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function debounce(fn, delay = 200) {
  let timer = null;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}
