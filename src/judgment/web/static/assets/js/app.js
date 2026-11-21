import { api, needsApiConfiguration, subscribeRefresh } from "./api.js";
import { initAuth, setAuthUser } from "./auth.js";
import { initSettings, refreshSettings } from "./settings.js";
import {
  applyDemoShell,
  demoActive,
  demoAdminGuardMarkup,
  demoFeature,
  hydrateDemoContext,
  initDemoLockTooltips,
  isAdmin,
  loadDemoContext,
  readCachedDemoContext,
  renderDemoClosed,
  renderDemoLocked,
} from "./demo.js";
import { escapeHtml, icon, initScoreCells, toast } from "./utils.js";
import * as adminPage from "./pages/admin.js";
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
  admin: { page: adminPage, title: "管理設定 · Judgment RAG Console" },
};

const main = document.getElementById("app-main");
let cleanup = null;
let routeToken = 0;

function parseRoute() {
  try {
    const question = new URLSearchParams(window.location.search).get("q");
    if (question && question.trim()) return "rag";
  } catch (error) {
    /* fall through to the hash route */
  }
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

  applyDemoShell();
  if (!isAdmin()) {
    if (route === "admin") {
      document.title = "管理設定 · Judgment RAG Console";
      main.innerHTML = demoAdminGuardMarkup();
      return;
    }
    if (route === "tests") {
      document.title = "展示模式 · Judgment RAG Console";
      renderDemoLocked(main, route);
      return;
    }
    if (!demoActive()) {
      document.title = "展示目前未開放 · Judgment RAG Console";
      renderDemoClosed(main);
      return;
    }
    if (!demoFeature(route)) {
      document.title = "展示模式 · Judgment RAG Console";
      renderDemoLocked(main, route);
      return;
    }
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
    refreshSettings();
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
  let sourceCount = 0;
  let importPending = 0;
  let indexPending = 0;
  const renderBadge = () => {
    const parts = [];
    if (sourceCount > 0) {
      parts.push(`法規／命令／判決有 ${sourceCount} 項來源更新`);
    }
    if (importPending > 0) {
      parts.push(`判決匯入待處理 ${importPending} 個月`);
    }
    if (indexPending > 0) {
      parts.push(`Qdrant 向量索引待補 ${indexPending} 個月`);
    }
    if (!parts.length) {
      badge.hidden = true;
      return;
    }
    const components =
      (sourceCount > 0 ? 1 : 0) +
      (importPending > 0 ? 1 : 0) +
      (indexPending > 0 ? 1 : 0);
    badge.textContent = String(
      components === 1
        ? sourceCount || importPending || indexPending
        : components,
    );
    badge.title = parts.join("；");
    badge.hidden = false;
  };
  const refresh = async (data = null) => {
    try {
      const info = data || (await api.updatesStatus());
      sourceCount = Number(info.update_count) || 0;
      if (
        info &&
        Object.prototype.hasOwnProperty.call(info, "import_pending_count")
      ) {
        importPending = Number(info.import_pending_count) || 0;
      }
      if (
        info &&
        Object.prototype.hasOwnProperty.call(info, "index_pending_count")
      ) {
        indexPending = Number(info.index_pending_count) || 0;
      }
      renderBadge();
    } catch (error) {
      badge.hidden = true;
    }
  };
  refresh();
  subscribeRefresh("updates", (_topic, payload) =>
    refresh(payload?.snapshot || null),
  );
  window.addEventListener("judgment:processing-pending", (event) => {
    importPending = Number(event.detail?.count) || 0;
    if (
      event.detail &&
      Object.prototype.hasOwnProperty.call(event.detail, "index_pending")
    ) {
      indexPending = Number(event.detail.index_pending) || 0;
    }
    renderBadge();
  });
  window.addEventListener("judgment:updates-changed", () => refresh());
}

function demoContextChanged(before, after) {
  if (!before || !after) return true;
  return (
    Boolean(before.admin) !== Boolean(after.admin) ||
    Boolean(before.enabled) !== Boolean(after.enabled) ||
    String(before.expiresAt || "") !== String(after.expiresAt || "") ||
    JSON.stringify(before.features || {}) !== JSON.stringify(after.features || {})
  );
}

async function boot() {
  const bootRoute = parseRoute();
  if (bootRoute === "processing") {
    // Start the cached bytes before auth/demo gating resolves.  The page's
    // own request below reuses this in-flight promise.
    void api.processing({ cached: true, slim: true }).catch(() => null);
  } else if (bootRoute === "quality") {
    void api.quality({ cached: true }).catch(() => null);
  }
  const cachedContext = readCachedDemoContext();
  if (cachedContext) hydrateDemoContext(cachedContext);
  const freshContextPromise = loadDemoContext();
  initDemoLockTooltips();
  initScoreCells();
  initSettings();
  initGlobalShortcuts();
  let updateBadgeReady = false;
  const ensureAdminChrome = () => {
    if (isAdmin() && !updateBadgeReady) {
      initUpdateBadge();
      updateBadgeReady = true;
    }
  };
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("judgment:auth-changed", async () => {
    const state = await loadDemoContext();
    setAuthUser(state.me);
    ensureAdminChrome();
    applyDemoShell();
    renderRoute();
  });
  window.addEventListener("judgment:demo-denied", async () => {
    const state = await loadDemoContext();
    setAuthUser(state.me);
    ensureAdminChrome();
    applyDemoShell();
    renderRoute();
  });
  if (cachedContext) {
    initAuth({ user: cachedContext.me });
    ensureAdminChrome();
    applyDemoShell();
    renderRoute();
  }
  const freshContext = await freshContextPromise;
  if (!cachedContext) {
    initAuth({ user: freshContext.me });
    ensureAdminChrome();
    applyDemoShell();
    renderRoute();
  } else {
    setAuthUser(freshContext.me);
    ensureAdminChrome();
    applyDemoShell();
    if (demoContextChanged(cachedContext, freshContext)) {
      renderRoute();
    }
  }

  if (needsApiConfiguration()) {
    window.setTimeout(() => {
      const route = parseRoute();
      if (route === "rag" || route === "admin") {
        window.location.hash = isAdmin() ? "#/tests" : "#/home";
      }
    }, 700);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
