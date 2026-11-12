import { api, needsApiConfiguration } from "./api.js";
import { initThemePicker } from "./themes.js";
import { escapeHtml, icon, toast } from "./utils.js";
import * as homePage from "./pages/home.js";
import * as ragPage from "./pages/rag.js";
import * as dataPage from "./pages/data.js";
import * as performancePage from "./pages/performance.js";
import * as processingPage from "./pages/processing.js";
import * as qualityPage from "./pages/quality.js";
import * as statusPage from "./pages/status.js";
import * as testsPage from "./pages/tests.js";

const DEFAULT_ROUTE = "home";
const ROUTES = {
  home: { page: homePage, title: "Judgment RAG Console · 法規與判決檢索" },
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
    // Each page replaces the previous page synchronously before its first
    // await. Keep the old page visible until then instead of flashing a
    // skeleton on every header navigation.
    const resultPromise = ROUTES[route].page.render(main, context);
    window.scrollTo({ top: 0, behavior: "auto" });
    main.focus({ preventScroll: true });
    const result = await resultPromise;
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
    const route = parseRoute();
    const inputId = route === "home" ? "home-question" : route === "rag" ? "rag-question" : "";
    if (!inputId) return;
    const input = document.getElementById(inputId);
    if (input) {
      event.preventDefault();
      input.focus();
    }
  });
}

function initUpdateBadge() {
  const link = document.querySelector('[data-route="processing"]');
  if (!link) return;
  let badge = link.querySelector(".nav-update-badge");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "nav-update-badge";
    badge.hidden = true;
    link.appendChild(badge);
  }
  const refresh = async () => {
    try {
      const data = await api.updatesStatus();
      const count = Number(data.update_count) || 0;
      if (count > 0) {
        badge.textContent = String(count);
        badge.title = `法規／命令／判決有 ${count} 項更新`;
        badge.hidden = false;
      } else {
        badge.hidden = true;
      }
    } catch (error) {
      badge.hidden = true;
    }
  };
  refresh();
  window.setInterval(refresh, 60000);
  window.addEventListener("focus", refresh);
  window.addEventListener("judgment:updates-changed", refresh);
}

function boot() {
  initThemePicker();
  initGlobalShortcuts();
  initUpdateBadge();
  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  if (needsApiConfiguration()) {
    window.setTimeout(() => {
      if (parseRoute() === "rag") window.location.hash = "#/tests";
    }, 700);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
