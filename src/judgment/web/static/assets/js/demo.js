import { api } from "./api.js";
import { escapeHtml, icon } from "./utils.js";

const FEATURES = ["rag", "data", "quality", "performance", "processing", "status"];
const FEATURE_LABELS = {
  rag: "RAG 提問",
  data: "資料庫",
  quality: "資料品質",
  performance: "效能報表",
  processing: "資料處理",
  status: "系統狀態",
};

const context = {
  loaded: false,
  admin: false,
  enabled: false,
  features: {},
  expiresAt: null,
  reason: "",
};

export function demoContext() {
  return context;
}

export function isAdmin() {
  return Boolean(context.admin);
}

export function isDemoVisitor() {
  return !context.admin;
}

export function demoActive() {
  return Boolean(context.enabled);
}

export function demoFeature(name) {
  if (context.admin) return true;
  if (name === "home") return context.enabled;
  return Boolean(context.enabled && context.features?.[name]);
}

export function demoFeatureLabel(name) {
  return FEATURE_LABELS[name] || name;
}

export function formatDemoRemaining(expiresAt) {
  if (!expiresAt) return "—";
  const end = Date.parse(expiresAt);
  if (!Number.isFinite(end)) return "—";
  const seconds = Math.max(0, Math.round((end - Date.now()) / 1000));
  if (seconds <= 0) return "已到期";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} 小時 ${minutes} 分`;
  return `${Math.max(1, minutes)} 分`;
}

export async function loadDemoContext() {
  const [meResult, demoResult] = await Promise.allSettled([
    api.authMe(),
    api.demoStatus(),
  ]);
  const me = meResult.status === "fulfilled" ? meResult.value : null;
  const demo = demoResult.status === "fulfilled" ? demoResult.value : null;
  context.admin = Boolean(me?.admin);
  context.enabled = Boolean(demo?.enabled);
  context.features = demo?.features || {};
  context.expiresAt = demo?.expires_at || null;
  context.reason = demo?.reason || "";
  context.loaded = true;
  if (context.admin) {
    context.enabled = false;
  }
  return context;
}

export function applyDemoShell() {
  const visitor = !context.admin;
  const active = Boolean(context.enabled);
  document.body.classList.toggle("is-demo-visitor", visitor && active);
  document.body.classList.toggle("is-demo-closed", visitor && !active);
  document.body.classList.toggle("is-admin", context.admin);

  document.querySelectorAll("[data-route]").forEach((link) => {
    const route = link.dataset.route || "";
    if (!visitor) {
      link.hidden = false;
      return;
    }
    if (route === "tests") {
      link.hidden = true;
      return;
    }
    link.hidden = !context.enabled || !demoFeature(route);
  });

  const banner = document.getElementById("demo-banner");
  if (!banner) return;
  if (visitor && active) {
    banner.hidden = false;
    banner.innerHTML = `<span class="demo-banner-dot" aria-hidden="true"></span>
      <strong>展示模式</strong>
      <span>剩餘 ${escapeHtml(formatDemoRemaining(context.expiresAt))}</span>
      <span class="demo-banner-note">可瀏覽完整資料頁；管理操作已鎖定</span>`;
  } else {
    banner.hidden = true;
    banner.innerHTML = "";
  }
}

export function renderDemoClosed(root) {
  root.innerHTML = `<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${icon("shield", 22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">展示目前未開放</h1>
      <p class="page-subtitle">
        此網站僅在面試展示期間暫時開放。若你是管理者，請由右上角登入。
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-secondary" href="https://github.com/solo0920/judgment" target="_blank" rel="noopener noreferrer">查看專案</a>
      </div>
    </div>
  </section>`;
}

export function renderDemoLocked(root, feature) {
  root.innerHTML = `<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${icon("shield", 22)}</div>
      <div class="eyebrow">DEMO MODE</div>
      <h1 class="page-title">此功能目前未開放展示</h1>
      <p class="page-subtitle">
        ${escapeHtml(feature === "tests" ? "系統測試" : demoFeatureLabel(feature))}目前由管理者關閉；展示期間仍可切換其他已開放功能。
      </p>
      <div class="demo-state-actions">
        <a class="btn btn-primary" href="#/home">回到首頁</a>
      </div>
    </div>
  </section>`;
}

export function demoAdminGuardMarkup() {
  return `<section class="page demo-closed-page">
    <div class="demo-state-card">
      <div class="demo-state-mark">${icon("shield", 22)}</div>
      <div class="eyebrow">ADMIN ONLY</div>
      <h1 class="page-title">需要管理者權限</h1>
      <p class="page-subtitle">請由右上角以管理者 Google 帳號登入。</p>
    </div>
  </section>`;
}

export { FEATURES, FEATURE_LABELS };


export function demoLockMarkup(title, detail) {
  return `<div class="demo-lock-card">
    <span class="demo-lock-icon">${icon("shield", 18)}</span>
    <div class="demo-lock-copy">
      <strong>${escapeHtml(title || "此功能由管理者操作")}</strong>
      <p>${escapeHtml(detail || "展示模式僅提供檢視，執行、設定與管理按鈕已鎖定。")}</p>
      <span class="badge badge-neutral badge-mono">展示模式 · 唯讀</span>
    </div>
  </div>`;
}


let demoLockTooltip = null;
let demoLockTooltipTimer = 0;
let demoLockTooltipTarget = null;
let demoLockTooltipPoint = { x: 0, y: 0 };

function ensureDemoLockTooltip() {
  if (demoLockTooltip?.isConnected) return demoLockTooltip;
  demoLockTooltip = document.createElement("div");
  demoLockTooltip.className = "demo-lock-tooltip";
  demoLockTooltip.setAttribute("role", "tooltip");
  demoLockTooltip.hidden = true;
  document.body.appendChild(demoLockTooltip);
  return demoLockTooltip;
}

function placeDemoLockTooltip() {
  if (!demoLockTooltip || demoLockTooltip.hidden) return;
  const gap = 18;
  const rect = demoLockTooltip.getBoundingClientRect();
  let left = demoLockTooltipPoint.x + gap;
  let top = demoLockTooltipPoint.y + 14;
  if (left + rect.width > window.innerWidth - 8) {
    left = demoLockTooltipPoint.x - rect.width - gap;
  }
  if (top + rect.height > window.innerHeight - 8) {
    top = demoLockTooltipPoint.y - rect.height - 14;
  }
  demoLockTooltip.style.transform = `translate3d(${Math.round(
    Math.max(8, left),
  )}px, ${Math.round(Math.max(8, top))}px, 0)`;
}

function showDemoLockTooltip(target) {
  const text = String(target?.dataset.demoLockTooltip || "").trim();
  if (!text) return;
  const tooltip = ensureDemoLockTooltip();
  tooltip.textContent = text;
  tooltip.hidden = false;
  placeDemoLockTooltip();
}

function hideDemoLockTooltip() {
  if (demoLockTooltipTimer) {
    window.clearTimeout(demoLockTooltipTimer);
    demoLockTooltipTimer = 0;
  }
  demoLockTooltipTarget = null;
  if (demoLockTooltip) demoLockTooltip.hidden = true;
}

function activateDemoLockTooltip(target, x, y) {
  if (!target || demoLockTooltipTarget === target) return;
  hideDemoLockTooltip();
  demoLockTooltipTarget = target;
  demoLockTooltipPoint = { x, y };
  demoLockTooltipTimer = window.setTimeout(() => {
    demoLockTooltipTimer = 0;
    if (demoLockTooltipTarget === target) showDemoLockTooltip(target);
  }, 200);
}

export function initDemoLockTooltips() {
  if (initDemoLockTooltips.installed) return;
  initDemoLockTooltips.installed = true;
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest?.("[data-demo-lock-tooltip]");
    if (!target) return;
    activateDemoLockTooltip(target, event.clientX, event.clientY);
  });
  document.addEventListener("pointermove", (event) => {
    if (!demoLockTooltipTarget) return;
    demoLockTooltipPoint = { x: event.clientX, y: event.clientY };
    if (demoLockTooltip && !demoLockTooltip.hidden) placeDemoLockTooltip();
  });
  document.addEventListener("pointerout", (event) => {
    if (!demoLockTooltipTarget) return;
    const related = event.relatedTarget;
    if (related && demoLockTooltipTarget.contains?.(related)) return;
    hideDemoLockTooltip();
  });
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest?.("[data-demo-lock-tooltip]");
    if (!target) return;
    const rect = target.getBoundingClientRect();
    activateDemoLockTooltip(target, rect.right, rect.top);
  });
  document.addEventListener("focusout", () => hideDemoLockTooltip());
  window.addEventListener("scroll", hideDemoLockTooltip, {
    capture: true,
    passive: true,
  });
}
