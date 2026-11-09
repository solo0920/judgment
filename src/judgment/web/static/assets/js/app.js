import { needsApiConfiguration } from "./api.js";
import { initThemePicker } from "./themes.js";
import { escapeHtml, icon, toast } from "./utils.js";
import * as ragPage from "./pages/rag.js";
import * as dataPage from "./pages/data.js";
import * as performancePage from "./pages/performance.js";
import * as processingPage from "./pages/processing.js";
import * as qualityPage from "./pages/quality.js";
import * as statusPage from "./pages/status.js";
import * as testsPage from "./pages/tests.js";

const DEFAULT_ROUTE = "rag";
const ROUTES = {
  rag: { page: ragPage, title: "RAG 提問 · Judgment RAG Console" },
  data: { page: dataPage, title: "資料庫查詢 · Judgment RAG Console" },
  quality: { page: qualityPage, title: "資料品質 · Judgment RAG Console" },
  performance: { page: performancePage, title: "效能報表 · Judgment RAG Console" },
  processing: { page: processingPage, title: "資料處理 · Judgment RAG Console" },
  status: { page: statusPage, title: "系統狀態 · Judgment RAG Console" },
  tests: { page: testsPage, title: "系統測試 · Judgment RAG Console" },
};

const main = document.getElementById("app-main");
let cleanup = null;
let routeToken = 0;

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
  initGlobalShortcuts();
  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  if (needsApiConfiguration()) {
    window.setTimeout(() => {
      if (parseRoute() !== "tests") window.location.hash = "#/tests";
    }, 700);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
