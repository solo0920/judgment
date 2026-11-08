import {
  DEFAULT_FILE_API_BASE,
  api,
  apiBaseLabel,
  apiUrl,
  getApiBase,
  getApiBaseSource,
  isValidApiBase,
  needsApiConfiguration,
  normalizeApiBase,
  setApiBase,
  testApiConnection,
} from "./api.js";
import { initThemePicker } from "./themes.js";
import { escapeHtml, icon, setBusy, toast } from "./utils.js";
import * as ragPage from "./pages/rag.js";
import * as dataPage from "./pages/data.js";
import * as performancePage from "./pages/performance.js";
import * as processingPage from "./pages/processing.js";
import * as qualityPage from "./pages/quality.js";
import * as statusPage from "./pages/status.js";

const DEFAULT_ROUTE = "rag";
const ROUTES = {
  rag: { page: ragPage, title: "RAG 提問 · Judgment RAG Console" },
  data: { page: dataPage, title: "資料庫查詢 · Judgment RAG Console" },
  quality: { page: qualityPage, title: "資料品質 · Judgment RAG Console" },
  performance: { page: performancePage, title: "效能報表 · Judgment RAG Console" },
  processing: { page: processingPage, title: "資料處理 · Judgment RAG Console" },
  status: { page: statusPage, title: "系統狀態 · Judgment RAG Console" },
};

const main = document.getElementById("app-main");
let cleanup = null;
let routeToken = 0;
let headerSeq = 0;
let headerTimer = null;
let headerTestBusy = false;
let headerTestEnabled = false;
let headerTestModels = { embedding: [], llm: [] };

function loadingMarkup() {
  return `<div class="page-loading" aria-live="polite">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-subtitle"></div>
    <div class="skeleton-grid">
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    </div>
  </div>`;
}

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "").trim();
  const route = raw.split("/")[0] || DEFAULT_ROUTE;
  return Object.prototype.hasOwnProperty.call(ROUTES, route) ? route : DEFAULT_ROUTE;
}

function setActiveNav(route) {
  document.querySelectorAll("[data-route]").forEach((link) => {
    const active = link.dataset.route === route;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderRouteError(error) {
  return `<section class="page">
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">CONSOLE ERROR</div>
          <div class="report-title">頁面載入失敗</div>
          <div class="report-sub">沒有顯示任何替代或推測資料。</div>
        </div>
      </div>
      <div class="report-section">
        <div class="notice notice-danger" role="alert">
          <span class="notice-icon" aria-hidden="true">${icon("alert", 12)}</span>
          <div class="notice-body">
            <strong>無法建立頁面</strong>
            <p>${escapeHtml(error.message || "未知錯誤")}</p>
          </div>
        </div>
        <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
          <button class="btn btn-secondary btn-sm" type="button" id="route-retry">
            ${icon("refresh", 14)}<span>重新載入</span>
          </button>
        </div>
      </div>
    </div>
  </section>`;
}

async function renderRoute() {
  const route = parseRoute();
  const token = ++routeToken;
  setActiveNav(route);

  if (window.location.hash !== `#/${route}`) {
    window.history.replaceState(null, "", `#/${route}`);
  }

  if (typeof cleanup === "function") {
    try {
      cleanup();
    } catch (error) {
      /* page cleanup should never block navigation */
    }
    cleanup = null;
  }

  document.title = ROUTES[route].title;
  main.innerHTML = loadingMarkup();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "auto" });

  const context = {
    route,
    navigate(next) {
      if (ROUTES[next]) window.location.hash = `#/${next}`;
    },
    setTitle(title) {
      if (token === routeToken && title) document.title = title;
    },
    refreshHeaderStatus,
  };

  try {
    const result = await ROUTES[route].page.render(main, context);
    if (token !== routeToken) {
      if (typeof result === "function") result();
      return;
    }
    cleanup = typeof result === "function" ? result : null;
  } catch (error) {
    if (token !== routeToken) return;
    console.error("Failed to render route", route, error);
    main.innerHTML = renderRouteError(error);
    const retry = document.getElementById("route-retry");
    if (retry) retry.addEventListener("click", () => renderRoute());
    toast("頁面載入失敗，請稍後再試。", "danger");
  }
}

function paintHeaderTest({ enabled, busy = false, label = "", title }) {
  const wrapper = document.getElementById("header-status");
  if (!wrapper) return;
  const labelElement = wrapper.querySelector(".header-status-label");
  headerTestEnabled = enabled;
  wrapper.classList.toggle("is-on", enabled);
  wrapper.classList.toggle("is-off", !enabled);
  wrapper.classList.toggle("is-busy", busy);
  wrapper.disabled = busy;
  wrapper.setAttribute("aria-checked", enabled ? "true" : "false");
  wrapper.setAttribute("aria-busy", busy ? "true" : "false");
  wrapper.setAttribute(
    "aria-label",
    busy
      ? label
      : enabled
        ? "測試模式已開啟，點擊關閉"
        : "測試模式已關閉，點擊開啟",
  );
  wrapper.title = title;
  if (labelElement) labelElement.textContent = enabled ? "ON" : "OFF";
}

function testModeModelTitle(models) {
  const embedding = Array.isArray(models?.embedding) ? models.embedding.length : 0;
  const llm = Array.isArray(models?.llm) ? models.llm.length : 0;
  return `${embedding} 個 embedding · ${llm} 個 LLM`;
}

async function refreshHeaderStatus() {
  const wrapper = document.getElementById("header-status");
  if (!wrapper || headerTestBusy) return;
  const seq = ++headerSeq;
  try {
    const state = await api.testMode();
    if (seq !== headerSeq || headerTestBusy) return;
    headerTestModels = state.models || { embedding: [], llm: [] };
    const enabled = Boolean(state.enabled);
    const modelText = testModeModelTitle(headerTestModels);
    paintHeaderTest({
      enabled,
      title: `測試模式 ${enabled ? "ON" : "OFF"} · ${modelText} · 點擊切換`,
    });
  } catch (error) {
    if (seq !== headerSeq || headerTestBusy) return;
    paintHeaderTest({
      enabled: false,
      title: "後端離線 · 無法讀取測試模式；請確認 API",
    });
  }
}

function initTestModeSwitch() {
  const wrapper = document.getElementById("header-status");
  if (!wrapper) return;
  wrapper.addEventListener("click", async () => {
    if (headerTestBusy) return;
    const nextEnabled = !headerTestEnabled;
    headerSeq += 1;
    headerTestBusy = true;
    paintHeaderTest({
      enabled: headerTestEnabled,
      busy: true,
      label: nextEnabled ? "正在開啟測試模式…" : "正在關閉測試模式…",
      title: nextEnabled ? "正在開啟測試模式…" : "正在關閉測試模式…",
    });

    try {
      const state = await api.setTestMode(nextEnabled);
      headerTestBusy = false;
      headerTestEnabled = Boolean(state.enabled);
      headerTestModels = state.models || { embedding: [], llm: [] };
      paintHeaderTest({
        enabled: headerTestEnabled,
        title: `測試模式 ${headerTestEnabled ? "ON" : "OFF"} · ${testModeModelTitle(
          headerTestModels,
        )} · 點擊切換`,
      });
      window.dispatchEvent(
        new CustomEvent("judgment:test-mode", {
          detail: {
            enabled: headerTestEnabled,
            models: headerTestModels,
          },
        }),
      );
      if (headerTestEnabled) {
        const embedding = headerTestModels.embedding?.length || 0;
        const llm = headerTestModels.llm?.length || 0;
        toast(
          `測試模式已開啟：每次 RAG 提問會執行 ${embedding} 個 embedding 與 ${llm} 個 LLM 模型，且不設逾時。`,
          "ok",
          7000,
        );
      } else {
        toast("測試模式已關閉。", "info");
      }
    } catch (error) {
      headerTestBusy = false;
      await refreshHeaderStatus();
      toast(error.message || "測試模式切換失敗。", "danger", 6000);
    }
  });
}

const API_SOURCE_LABELS = {
  query: "網址 ?api= 參數",
  storage: "此瀏覽器儲存的值",
  config: "config.js 預設值",
  "file-default": "file:// 預設值",
  "same-origin": "同源（目前網域）",
};

function isLocalApiBase(base) {
  try {
    const host = new URL(base).hostname;
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(host);
  } catch (error) {
    return false;
  }
}

function isMixedContent(base) {
  return (
    window.location.protocol === "https:" &&
    /^http:\/\//i.test(base) &&
    !isLocalApiBase(base)
  );
}

function initApiSettings() {
  const trigger = document.getElementById("api-config-trigger");
  const dialogRoot = document.getElementById("dialog-root");
  if (!trigger || !dialogRoot) return { open() {} };

  dialogRoot.innerHTML = `<dialog class="api-dialog" id="api-dialog" aria-labelledby="api-dialog-title">
    <form class="api-dialog-form" id="api-dialog-form" novalidate>
      <div class="api-dialog-head">
        <span class="api-dialog-icon" aria-hidden="true">${icon("link", 17)}</span>
        <div class="api-dialog-heading">
          <div class="api-dialog-title" id="api-dialog-title">後端 API 連線</div>
          <p class="api-dialog-copy">前端是純靜態檔案，可從本機檔案、Cloudflare Pages 或任何靜態主機開啟，再連到 FastAPI 後端。Cloudflare 部署請使用 cloudflared 提供的 HTTPS 位址。</p>
        </div>
        <button class="api-dialog-close" type="button" id="api-dialog-close" aria-label="關閉">×</button>
      </div>
      <label class="field" for="api-base-input">
        <span class="field-label">API Base URL <span class="field-tag">runtime</span></span>
        <input class="input mono" id="api-base-input" name="api-base" type="url"
          inputmode="url" autocomplete="url" spellcheck="false"
          placeholder="http://127.0.0.1:9200" />
        <span class="field-help">留空代表同源；以 file:// 開啟時留空會使用 http://127.0.0.1:9200。</span>
      </label>
      <div class="api-dialog-preview" id="api-dialog-preview"></div>
      <div class="api-dialog-status" id="api-dialog-status" role="status"></div>
      <div class="api-dialog-note" id="api-dialog-note"></div>
      <div class="api-dialog-actions">
        <button class="btn btn-secondary btn-sm" type="button" id="api-test">
          ${icon("activity", 14)}<span>測試連線</span>
        </button>
        <span class="grow"></span>
        <button class="btn btn-ghost btn-sm" type="button" id="api-reset">恢復預設</button>
        <button class="btn btn-primary btn-sm" type="submit" id="api-save">
          ${icon("check", 14)}<span>儲存並重新載入</span>
        </button>
      </div>
    </form>
  </dialog>`;

  const dialog = dialogRoot.querySelector("#api-dialog");
  const form = dialogRoot.querySelector("#api-dialog-form");
  const input = dialogRoot.querySelector("#api-base-input");
  const preview = dialogRoot.querySelector("#api-dialog-preview");
  const status = dialogRoot.querySelector("#api-dialog-status");
  const note = dialogRoot.querySelector("#api-dialog-note");
  const closeButton = dialogRoot.querySelector("#api-dialog-close");
  const testButton = dialogRoot.querySelector("#api-test");
  const resetButton = dialogRoot.querySelector("#api-reset");
  const saveButton = dialogRoot.querySelector("#api-save");

  const queryLocked = () => getApiBaseSource() === "query";

  const candidateBase = () => {
    const value = normalizeApiBase(input.value);
    if (value) return value;
    return window.location.protocol === "file:" ? DEFAULT_FILE_API_BASE : "";
  };

  const setStatus = (message, tone = "") => {
    status.textContent = message;
    status.className = `api-dialog-status${tone ? ` is-${tone}` : ""}`;
  };

  const updatePreview = () => {
    const candidate = candidateBase();
    const current = getApiBase();
    preview.innerHTML = `目前生效：<strong>${escapeHtml(apiBaseLabel(current))}</strong><br />
      此位址的狀態請求：${escapeHtml(apiUrl("/api/status", candidate))}`;
  };

  const updateTrigger = () => {
    const base = getApiBase();
    const source = getApiBaseSource();
    trigger.classList.toggle("is-custom", Boolean(base));
    trigger.title = `後端 API：${apiBaseLabel(base)}（${API_SOURCE_LABELS[source] || source}）`;
  };

  const updateNote = (reason) => {
    const source = getApiBaseSource();
    let text = `目前來源：${API_SOURCE_LABELS[source] || source}。優先順序為 ?api= → 瀏覽器儲存值 → config.js → 同源。`;
    let tone = "";
    if (source === "query") {
      tone = "is-warn";
      text =
        "此頁由網址的 ?api= 參數指定後端位址，具有最高優先順序。儲存或恢復預設在此頁不會生效；請先移除網址中的 api 參數。";
    } else if (reason === "hosted" && needsApiConfiguration()) {
      tone = "is-warn";
      text =
        "此頁不是從 localhost 開啟，且尚未設定後端 API。請填入 cloudflared 的 https:// 位址，或部署時在 config.js 指定 apiBase；HTTP 位址會被 HTTPS 頁面阻擋。";
    } else if (source === "file-default" || window.location.protocol === "file:") {
      text =
        "以 file:// 直接開啟時，預設連到 http://127.0.0.1:9200。若後端使用其他連接埠，請在此修改並儲存。";
    }
    note.textContent = text;
    note.className = `api-dialog-note${tone ? ` ${tone}` : ""}`;
    const locked = source === "query";
    saveButton.disabled = locked;
    resetButton.disabled = locked;
    input.readOnly = locked;
  };

  const validate = () => {
    if (!isValidApiBase(input.value)) {
      setStatus("API 位址格式不正確，請輸入 http:// 或 https:// 開頭的網址。", "error");
      input.focus();
      return null;
    }
    const candidate = candidateBase();
    if (isMixedContent(candidate)) {
      setStatus(
        "HTTPS 頁面無法連線到 HTTP API（mixed content）。請改用 cloudflared 提供的 https:// 位址。",
        "error",
      );
      input.focus();
      return null;
    }
    return candidate;
  };

  const open = ({ reason = "" } = {}) => {
    if (dialog.open) return;
    input.value = getApiBase();
    updatePreview();
    updateNote(reason);
    setStatus("可先測試連線，儲存後頁面會重新載入。");
    trigger.setAttribute("aria-expanded", "true");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    input.focus();
    input.select();
  };

  const close = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  };

  trigger.addEventListener("click", () => open());

  closeButton.addEventListener("click", close);

  dialog.addEventListener("close", () => {
    trigger.setAttribute("aria-expanded", "false");
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  input.addEventListener("input", () => {
    updatePreview();
    setStatus("尚未測試此位址。");
  });

  testButton.addEventListener("click", async () => {
    const candidate = validate();
    if (candidate === null) return;
    setBusy(testButton, true, "測試中…");
    setStatus(`正在連線到 ${apiBaseLabel(candidate)}…`);
    try {
      const result = await testApiConnection(candidate);
      setStatus(
        `連線成功 · v${result.version} · ${result.duration_ms} ms · GET ${apiUrl("/api/health", candidate)}`,
        "ok",
      );
    } catch (error) {
      setStatus(error.message || "連線測試失敗。", "error");
    } finally {
      setBusy(testButton, false);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (queryLocked()) return;
    const candidate = validate();
    if (candidate === null) return;
    setApiBase(candidate);
    toast(`後端 API 已設為 ${apiBaseLabel(candidate)}，重新載入中…`, "ok", 1600);
    window.setTimeout(() => window.location.reload(), 120);
  });

  resetButton.addEventListener("click", () => {
    if (queryLocked()) return;
    setApiBase("");
    toast("已清除瀏覽器儲存的 API 位址，重新載入中…", "info", 1600);
    window.setTimeout(() => window.location.reload(), 120);
  });

  updateTrigger();
  updatePreview();

  return { open, updateTrigger };
}

function initGlobalShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const active = document.activeElement;
    const typing =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable);
    if (typing) return;
    if (parseRoute() !== "rag") return;
    const input = document.getElementById("rag-question");
    if (input) {
      event.preventDefault();
      input.focus();
    }
  });
}

function boot() {
  initThemePicker();
  const apiSettings = initApiSettings();
  initTestModeSwitch();
  initGlobalShortcuts();
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("storage", (event) => {
    if (event.key === "judgment.api_base") apiSettings.updateTrigger?.();
  });
  headerTimer = window.setInterval(refreshHeaderStatus, 60000);
  renderRoute();
  refreshHeaderStatus();

  if (needsApiConfiguration()) {
    window.setTimeout(() => apiSettings.open({ reason: "hosted" }), 700);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

window.addEventListener("beforeunload", () => {
  if (headerTimer) window.clearInterval(headerTimer);
});
