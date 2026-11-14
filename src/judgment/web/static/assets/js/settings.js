import { applyTheme, getStoredTheme, THEMES } from "./themes.js";
import { escapeHtml, icon, toast } from "./utils.js";

const STORAGE_KEY = "judgment.fontSizes.v1";
const APPEARANCE_KEY = "judgment.appearance";
const APPEARANCE_MODES = new Set(["light", "dark", "system"]);
const DEFAULT_APPEARANCE = "light";
const systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
const DEFAULT_PANEL = "font-size";

const FONT_GROUPS = [
  {
    id: "page-title",
    label: "頁面標題",
    hint: "各頁最上方的 h1 標題",
    selectors: [".page-title"],
    defaultPx: 40,
    min: 20,
    max: 72,
  },
  {
    id: "home-title",
    label: "首頁主視覺標題",
    hint: "首頁最大的主標題",
    selectors: [".home-title"],
    defaultPx: 88,
    min: 40,
    max: 140,
  },
  {
    id: "section-title",
    label: "區塊標題",
    hint: "報表、卡片與區塊標題",
    selectors: [
      ".section-title",
      ".report-title",
      ".side-card-title",
      ".filter-title",
      ".tests-card-title",
      ".status-sidebar-title",
      ".judgment-dialog-head h2",
    ],
    defaultPx: 16,
    min: 10,
    max: 36,
  },
  {
    id: "body",
    label: "內文與說明",
    hint: "段落、回答、說明與摘要文字",
    selectors: [
      ".answer-text",
      ".page-subtitle",
      ".report-sub",
      ".home-lead",
      ".empty-text",
      ".notice-body p",
      ".citation-snippet",
      ".side-card-body",
      ".detail-list",
      ".field-help",
      ".report-empty-inline",
      ".processing-section-sub",
      ".summary-value-text",
      ".status-summary",
      ".warnings",
      ".law-dialog-warning",
    ],
    defaultPx: 14,
    min: 8,
    max: 28,
  },
  {
    id: "table",
    label: "表格內容",
    hint: "資料表格的表頭與儲存格",
    selectors: [".data-table th", ".data-table td"],
    defaultPx: 12,
    min: 8,
    max: 24,
  },
  {
    id: "meta",
    label: "標籤與輔助文字",
    hint: "badge、chip、欄位標籤與 metadata",
    selectors: [
      ".badge",
      ".chip",
      ".citation-meta",
      ".citation-index",
      ".answer-section-label",
      ".report-kicker",
      ".report-section-title",
      ".eyebrow",
      ".field-label",
      ".summary-label",
      ".metric-label",
      ".footer-bottom",
      ".nav-update-badge",
    ],
    defaultPx: 10,
    min: 7,
    max: 20,
  },
  {
    id: "button",
    label: "按鈕與導覽",
    hint: "操作按鈕、頁首導覽與連結",
    selectors: [
      ".btn",
      ".nav-link",
      ".page-btn",
      ".law-link",
      ".judgment-link",
      ".theme-option-name",
      ".theme-option-desc",
    ],
    defaultPx: 13,
    min: 9,
    max: 24,
  },
  {
    id: "form",
    label: "表單與輸入",
    hint: "輸入框、下拉選單與 textarea",
    selectors: ["input", "textarea", "select", ".input", ".field-input"],
    defaultPx: 14,
    min: 9,
    max: 28,
  },
  {
    id: "mono",
    label: "程式碼與數值",
    hint: "等寬文字、查詢語句與統計數值",
    selectors: [
      ".mono",
      ".cell-mono",
      ".cell-number",
      ".query-code",
      "code",
      ".metric-value",
      ".summary-value",
      ".perf-stat-value",
      ".mini-stat-value",
    ],
    defaultPx: 13,
    min: 8,
    max: 30,
  },
  {
    id: "law-page",
    label: "法規條文（頁面）",
    hint: "法規檢索結果與法規來源卡條文",
    selectors: [
      ".law-answer-article-text",
      ".law-answer-article-no",
      ".law-source-article-text",
      ".law-source-article-no",
      ".law-article-text",
      ".law-article-no",
    ],
    excludeAncestors: [".law-dialog"],
    defaultPx: 12,
    min: 9,
    max: 28,
  },
  {
    id: "law-dialog",
    label: "法規條文（彈出視窗）",
    hint: "按下條文後開啟的法規 dialog",
    selectors: [
      ".law-dialog .law-article-text",
      ".law-dialog .law-article-no",
      ".law-dialog .law-chapter",
    ],
    defaultPx: 16,
    min: 10,
    max: 32,
  },
  {
    id: "judgment-dialog",
    label: "判決全文（彈出視窗）",
    hint: "判決原文 dialog 的全文區塊",
    selectors: [".judgment-dialog-text"],
    defaultPx: 23,
    min: 12,
    max: 48,
  },
];

const GROUP_MAP = new Map(FONT_GROUPS.map((group) => [group.id, group]));
const originalStyles = new WeakMap();

let savedSettings = loadSavedSettings();
let activeSettings = { ...savedSettings };
let appearanceMode = loadAppearanceMode();
let appliedGroupIds = new Set();
let sidebar = null;
let trigger = null;
let panel = null;
let optionsBox = null;
let closeButton = null;
let currentPanel = DEFAULT_PANEL;
let isOpen = false;
let observer = null;
let applyScheduled = false;
let highlightedGroupId = "";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundSize(value) {
  return Math.round(value * 10) / 10;
}

function formatSize(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function loadAppearanceMode() {
  try {
    const value = window.localStorage.getItem(APPEARANCE_KEY);
    return APPEARANCE_MODES.has(value) ? value : DEFAULT_APPEARANCE;
  } catch (error) {
    return DEFAULT_APPEARANCE;
  }
}

function resolvedAppearance() {
  if (appearanceMode === "system") {
    return systemDarkQuery.matches ? "dark" : "light";
  }
  return appearanceMode;
}

function updateAppearanceButtons() {
  document.querySelectorAll("[data-appearance-option]").forEach((button) => {
    const active = button.dataset.appearanceOption === appearanceMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyAppearance({ persist = false } = {}) {
  document.documentElement.dataset.appearance = resolvedAppearance();
  document.documentElement.dataset.appearanceMode = appearanceMode;
  updateAppearanceButtons();
  if (persist) {
    try {
      window.localStorage.setItem(APPEARANCE_KEY, appearanceMode);
    } catch (error) {
      /* localStorage may be unavailable */
    }
  }
}

function setAppearanceMode(mode) {
  if (!APPEARANCE_MODES.has(mode)) return;
  appearanceMode = mode;
  applyAppearance({ persist: true });
}

function handleSystemAppearanceChange() {
  if (appearanceMode === "system") applyAppearance();
}

if (typeof systemDarkQuery.addEventListener === "function") {
  systemDarkQuery.addEventListener("change", handleSystemAppearanceChange);
} else if (typeof systemDarkQuery.addListener === "function") {
  systemDarkQuery.addListener(handleSystemAppearanceChange);
}

function loadSavedSettings() {
  let raw = null;
  try {
    raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch (error) {
    raw = null;
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const settings = {};
  for (const group of FONT_GROUPS) {
    const value = Number(raw[group.id]);
    if (!Number.isFinite(value)) continue;
    settings[group.id] = roundSize(clamp(value, group.min, group.max));
  }
  return settings;
}

function persistSettings() {
  try {
    if (Object.keys(savedSettings).length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSettings));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return true;
  } catch (error) {
    return false;
  }
}

function groupNodes(group) {
  const nodes = new Set();
  for (const selector of group.selectors) {
    document.querySelectorAll(selector).forEach((node) => {
      if (node.closest(".settings-sidebar")) return;
      if (
        Array.isArray(group.excludeAncestors) &&
        group.excludeAncestors.some((ancestor) => node.closest(ancestor))
      ) {
        return;
      }
      nodes.add(node);
    });
  }
  return Array.from(nodes);
}

function markHighlightedGroup() {
  if (!highlightedGroupId) return;
  const group = GROUP_MAP.get(highlightedGroupId);
  if (!group) return;
  for (const node of groupNodes(group)) {
    node.classList.add("font-size-highlight");
  }
}

function highlightGroup(groupId) {
  clearHighlight();
  const group = GROUP_MAP.get(groupId);
  if (!group) return;
  highlightedGroupId = groupId;
  const row = panel.querySelector(
    `.font-size-row[data-font-group="${groupId}"]`,
  );
  if (row) row.classList.add("is-previewing");
  markHighlightedGroup();
}

function clearHighlight() {
  highlightedGroupId = "";
  panel
    .querySelectorAll(".font-size-row.is-previewing")
    .forEach((row) => row.classList.remove("is-previewing"));
  document
    .querySelectorAll(".font-size-highlight")
    .forEach((node) => node.classList.remove("font-size-highlight"));
}

function captureOriginal(node) {
  if (originalStyles.has(node)) return originalStyles.get(node);
  const record = {
    inline: node.style.fontSize || "",
    computed: parseFloat(window.getComputedStyle(node).fontSize) || 0,
  };
  originalStyles.set(node, record);
  return record;
}

function restoreNode(node) {
  const record = originalStyles.get(node);
  if (!record) return;
  if (record.inline) node.style.fontSize = record.inline;
  else node.style.removeProperty("font-size");
}

function applyGroup(group) {
  const value = activeSettings[group.id];
  if (!Number.isFinite(value)) return;
  for (const node of groupNodes(group)) {
    captureOriginal(node);
    node.style.fontSize = `${value}px`;
  }
}

function clearGroup(group) {
  for (const node of groupNodes(group)) restoreNode(node);
}

export function applyFontSizes() {
  for (const id of appliedGroupIds) {
    const group = GROUP_MAP.get(id);
    if (group) clearGroup(group);
  }
  appliedGroupIds = new Set();
  for (const group of FONT_GROUPS) {
    if (!Number.isFinite(activeSettings[group.id])) continue;
    applyGroup(group);
    appliedGroupIds.add(group.id);
  }
  markHighlightedGroup();
}

export function refreshSettings() {
  applyFontSizes();
  if (isOpen && currentPanel === "font-size") renderFontPanel();
}

function scheduleApply() {
  if (applyScheduled) return;
  applyScheduled = true;
  window.requestAnimationFrame(() => {
    applyScheduled = false;
    applyFontSizes();
  });
}

function observePageChanges() {
  if (observer || !document.body) return;
  observer = new MutationObserver((mutations) => {
    if (!Object.keys(activeSettings).length) return;
    for (const mutation of mutations) {
      if (
        mutation.type === "childList" &&
        (mutation.addedNodes.length || mutation.removedNodes.length)
      ) {
        scheduleApply();
        return;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function visibleNodes(nodes) {
  const visible = nodes.filter(
    (node) => typeof node.getClientRects === "function" && node.getClientRects().length,
  );
  return visible.length ? visible : nodes;
}

function displayGroups() {
  const present = FONT_GROUPS.filter(
    (group) =>
      groupNodes(group).length > 0 ||
      Number.isFinite(activeSettings[group.id]),
  );
  return present.length ? present : FONT_GROUPS;
}

function groupValue(group) {
  const active = activeSettings[group.id];
  if (Number.isFinite(active)) return active;
  const nodes = visibleNodes(groupNodes(group));
  const sizes = nodes
    .map((node) => {
      const record = originalStyles.get(node);
      if (record && record.computed) return record.computed;
      return parseFloat(window.getComputedStyle(node).fontSize) || 0;
    })
    .filter((size) => size > 0)
    .sort((a, b) => a - b);
  if (!sizes.length) return group.defaultPx;
  const middle = Math.floor(sizes.length / 2);
  const value =
    sizes.length % 2 ? sizes[middle] : (sizes[middle - 1] + sizes[middle]) / 2;
  return roundSize(value);
}

function renderOptions() {
  const options = [
    {
      id: "font-size",
      label: "字型大小",
      hint: "調整各文字區塊",
      glyph: '<span class="settings-option-aa" aria-hidden="true">Aa</span>',
    },
    {
      id: "theme",
      label: "介面風格",
      hint: "切換品牌視覺語言",
      glyph: icon("palette", 15),
    },
  ];
  optionsBox.innerHTML = options
    .map(
      (option) => `<button class="settings-option${
        currentPanel === option.id ? " is-active" : ""
      }" type="button" role="tab"
        data-settings-panel="${option.id}"
        aria-selected="${currentPanel === option.id ? "true" : "false"}">
        <span class="settings-option-icon">${option.glyph}</span>
        <span class="settings-option-copy">
          <strong>${escapeHtml(option.label)}</strong>
          <small>${escapeHtml(option.hint)}</small>
        </span>
        ${icon("chevronRight", 12, "settings-option-chevron")}
      </button>`,
    )
    .join("");
}

function renderFontPanel() {
  clearHighlight();
  const groups = displayGroups();
  const rows = groups.map((group) => {
    const value = formatSize(groupValue(group));
    return `<section class="font-size-row" data-font-group="${group.id}">
      <div class="font-size-row-head">
        <div class="font-size-row-copy">
          <strong>${escapeHtml(group.label)}</strong>
          <small>${escapeHtml(group.hint)}</small>
        </div>
        <label class="font-size-number">
          <input class="input font-size-number-input" type="number"
            min="${group.min}" max="${group.max}" step="0.1"
            value="${value}" aria-label="${escapeHtml(group.label)} font size" />
          <span>px</span>
        </label>
      </div>
      <input class="font-size-slider" type="range"
        min="${group.min}" max="${group.max}" step="0.1" value="${value}"
        aria-label="${escapeHtml(group.label)} font size slider" />
      <div class="font-size-preview" style="font-size:${value}px">
        字型預覽 Aa 123 · ${escapeHtml(group.label)}
      </div>
    </section>`;
  }).join("");

  panel.innerHTML = `<div class="settings-panel-head">
      <div>
        <h3>字型大小</h3>
        <p>拉動滑桿或直接輸入數值；清單只列出目前頁面出現的文字區塊，變更會立即套用。</p>
      </div>
      <span class="badge badge-info">${groups.length} 個區塊</span>
    </div>
    <div class="font-size-list">${rows}</div>
    <div class="settings-actions">
      <button class="btn btn-primary btn-sm" type="button" data-settings-action="save">儲存</button>
      <button class="btn btn-secondary btn-sm" type="button" data-settings-action="cancel">取消</button>
      <button class="btn btn-ghost btn-sm" type="button" data-settings-action="reset">回復預設值</button>
    </div>`;
}

function renderThemePanel() {
  clearHighlight();
  const current = getStoredTheme();
  const options = THEMES.map((theme, index) => {
    const swatches = theme.swatches
      .map((color) => `<i style="--swatch:${escapeHtml(color)}"></i>`)
      .join("");
    return `<button class="theme-option${
      theme.id === current ? " is-active" : ""
    }" type="button" role="menuitemradio"
      data-theme-id="${escapeHtml(theme.id)}"
      data-theme="${escapeHtml(theme.id)}"
      aria-checked="${theme.id === current ? "true" : "false"}">
      <span class="theme-option-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="theme-option-body">
        <span class="theme-option-name">${escapeHtml(theme.name)}</span>
        <span class="theme-option-desc">${escapeHtml(theme.description)}</span>
      </span>
      <span class="theme-option-active-preview" aria-hidden="true">
        ${icon("sliders", 11)}
        <span>作用中</span>
        <span class="theme-option-active-preview-badge">2</span>
      </span>
      <span class="theme-option-swatches" aria-hidden="true">${swatches}</span>
      <span class="theme-option-check" aria-hidden="true">${icon("check", 14)}</span>
    </button>`;
  }).join("");

  const appearanceOptions = [
    { id: "light", label: "亮" },
    { id: "dark", label: "暗" },
    { id: "system", label: "系統" },
  ];
  const appearanceSwitch = `<div class="appearance-switch" role="group" aria-label="明暗模式">
    ${appearanceOptions
      .map(
        (option) => `<button class="appearance-option" type="button"
          data-appearance-option="${option.id}"
          aria-pressed="${appearanceMode === option.id ? "true" : "false"}"
          title="${option.id === "system" ? "跟隨系統明暗" : `${option.label}色模式`}">${option.label}</button>`,
      )
      .join("")}
  </div>`;

  panel.innerHTML = `<div class="settings-panel-head">
      <div>
        <h3>介面風格</h3>
        <p>選擇主控台的品牌視覺語言；主題會立即套用並保留。</p>
      </div>
      <div class="settings-panel-head-actions">
        <span class="badge badge-info">${THEMES.length} 種</span>
        ${appearanceSwitch}
      </div>
    </div>
    <div class="settings-theme-list" role="menu" aria-label="介面風格">${options}</div>`;
  updateAppearanceButtons();
}

function updateOptionState() {
  optionsBox.querySelectorAll("[data-settings-panel]").forEach((button) => {
    const active = button.dataset.settingsPanel === currentPanel;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function renderPanel(name = currentPanel) {
  currentPanel = name === "theme" ? "theme" : "font-size";
  updateOptionState();
  if (currentPanel === "theme") renderThemePanel();
  else renderFontPanel();
}

function setDraftValue(group, rawValue, row) {
  const value = Number(rawValue);
  if (!Number.isFinite(value)) return;
  const next = roundSize(clamp(value, group.min, group.max));
  activeSettings[group.id] = next;
  const slider = row?.querySelector(".font-size-slider");
  if (slider) slider.value = String(next);
  const preview = row?.querySelector(".font-size-preview");
  if (preview) preview.style.fontSize = `${next}px`;
  scheduleApply();
}

function syncFontPanelValues() {
  panel.querySelectorAll(".font-size-row").forEach((row) => {
    const group = GROUP_MAP.get(row.dataset.fontGroup);
    if (!group) return;
    const value = activeSettings[group.id] ?? groupValue(group);
    const number = row.querySelector(".font-size-number-input");
    if (number) number.value = formatSize(value);
    const slider = row.querySelector(".font-size-slider");
    if (slider) slider.value = String(value);
    const preview = row.querySelector(".font-size-preview");
    if (preview) preview.style.fontSize = `${value}px`;
  });
}

function handleFontInput(event) {
  const row = event.target.closest(".font-size-row");
  if (!row) return;
  const group = GROUP_MAP.get(row.dataset.fontGroup);
  if (!group) return;
  const isNumber = event.target.classList.contains("font-size-number-input");
  if (isNumber && event.target.value === "") return;

  if (event.type === "input" && isNumber) {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) return;
    setDraftValue(group, value, row);
    return;
  }

  setDraftValue(group, event.target.value, row);
  if (event.type === "input") {
    const numberInput = row.querySelector(".font-size-number-input");
    if (numberInput && document.activeElement !== numberInput) {
      numberInput.value = formatSize(activeSettings[group.id] ?? groupValue(group));
    }
  }
}

function handleNumberBlur(event) {
  if (!event.target.classList.contains("font-size-number-input")) return;
  const row = event.target.closest(".font-size-row");
  const group = row ? GROUP_MAP.get(row.dataset.fontGroup) : null;
  if (!group) return;
  const current = activeSettings[group.id] ?? groupValue(group);
  event.target.value = formatSize(current);
}

function handleRowPointerOver(event) {
  const row = event.target.closest(".font-size-row");
  if (!row || row.contains(event.relatedTarget)) return;
  highlightGroup(row.dataset.fontGroup);
}

function handleRowPointerOut(event) {
  const row = event.target.closest(".font-size-row");
  if (!row || row.contains(event.relatedTarget)) return;
  clearHighlight();
}

function handleRowFocusIn(event) {
  const row = event.target.closest(".font-size-row");
  if (row) highlightGroup(row.dataset.fontGroup);
}

function handleRowFocusOut(event) {
  const row = event.target.closest(".font-size-row");
  if (!row || row.contains(event.relatedTarget)) return;
  clearHighlight();
}

function handlePanelClick(event) {
  const option = event.target.closest("[data-settings-panel]");
  if (option) {
    renderPanel(option.dataset.settingsPanel);
    return;
  }

  const action = event.target.closest("[data-settings-action]");
  if (action) {
    const name = action.dataset.settingsAction;
    if (name === "save") {
      savedSettings = { ...activeSettings };
      const persisted = persistSettings();
      syncFontPanelValues();
      toast(
        persisted
          ? "字型大小已儲存。"
          : "字型大小已套用，但瀏覽器無法儲存設定。",
        persisted ? "ok" : "warn",
      );
      return;
    }
    if (name === "cancel") {
      activeSettings = { ...savedSettings };
      applyFontSizes();
      renderFontPanel();
      toast("已取消未儲存的字型變更。", "info");
      return;
    }
    if (name === "reset") {
      activeSettings = {};
      applyFontSizes();
      renderFontPanel();
      toast("已回復預設字型；按「儲存」保留變更。", "info");
    }
    return;
  }

  const appearance = event.target.closest("[data-appearance-option]");
  if (appearance) {
    setAppearanceMode(appearance.dataset.appearanceOption);
    return;
  }

  const theme = event.target.closest(".theme-option");
  if (theme) {
    applyTheme(theme.dataset.themeId);
  }
}

function openSidebar() {
  if (isOpen) return;
  isOpen = true;
  activeSettings = { ...savedSettings };
  document.body.classList.add("settings-open");
  sidebar.removeAttribute("inert");
  sidebar.setAttribute("aria-hidden", "false");
  trigger.setAttribute("aria-expanded", "true");
  renderPanel(currentPanel);
  applyFontSizes();
  window.requestAnimationFrame(() => {
    const active =
      optionsBox.querySelector(".settings-option.is-active") ||
      optionsBox.querySelector(".settings-option");
    if (active) active.focus({ preventScroll: true });
  });
}

function closeSidebar({ restoreFocus = true } = {}) {
  if (!isOpen) return;
  isOpen = false;
  clearHighlight();
  activeSettings = { ...savedSettings };
  applyFontSizes();
  document.body.classList.remove("settings-open");
  if (restoreFocus) trigger.focus({ preventScroll: true });
  sidebar.setAttribute("aria-hidden", "true");
  sidebar.setAttribute("inert", "");
  trigger.setAttribute("aria-expanded", "false");
}

export function initSettings() {
  sidebar = document.getElementById("settings-sidebar");
  trigger = document.getElementById("settings-trigger");
  panel = document.getElementById("settings-panel");
  optionsBox = document.getElementById("settings-options");
  closeButton = document.getElementById("settings-close");
  if (!sidebar || !trigger || !panel || !optionsBox) return;

  applyAppearance();
  applyTheme(getStoredTheme(), { persist: false });
  renderOptions();
  renderFontPanel();
  observePageChanges();
  applyFontSizes();

  trigger.addEventListener("click", () => {
    if (isOpen) closeSidebar();
    else openSidebar();
  });

  closeButton?.addEventListener("click", () => closeSidebar());

  optionsBox.addEventListener("click", (event) => {
    const option = event.target.closest("[data-settings-panel]");
    if (!option) return;
    renderPanel(option.dataset.settingsPanel);
  });

  panel.addEventListener("click", handlePanelClick);
  panel.addEventListener("input", handleFontInput);
  panel.addEventListener("change", handleFontInput);
  panel.addEventListener("blur", handleNumberBlur, true);
  panel.addEventListener("pointerover", handleRowPointerOver);
  panel.addEventListener("pointerout", handleRowPointerOut);
  panel.addEventListener("focusin", handleRowFocusIn);
  panel.addEventListener("focusout", handleRowFocusOut);
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.classList.contains("font-size-number-input")) {
      event.preventDefault();
      event.target.blur();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen) closeSidebar();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === APPEARANCE_KEY) {
      appearanceMode = loadAppearanceMode();
      applyAppearance();
      return;
    }
    if (event.key !== STORAGE_KEY) return;
    savedSettings = loadSavedSettings();
    if (!isOpen) {
      activeSettings = { ...savedSettings };
      applyFontSizes();
    }
  });
}
