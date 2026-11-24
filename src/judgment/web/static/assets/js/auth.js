import {
  api,
  apiUrl,
  getApiBase,
  getApiBaseSource,
  setAdminToken,
} from "./api.js";
import { demoActive } from "./demo.js";
import { escapeHtml, toast } from "./utils.js";

const GOOGLE_ICON = `
  <svg class="auth-google-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z"/>
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z"/>
    <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.5H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.5l3.35-2.58Z"/>
    <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.35 2.58C7.2 7.8 9.4 6.04 12 6.04Z"/>
  </svg>`;

const AUTH_ERRORS = {
  google_not_configured:
    "Google 登入尚未設定，請先設定 GOOGLE_CLIENT_ID 與 GOOGLE_CLIENT_SECRET。",
  state_mismatch: "登入流程已過期，請重新登入。",
  access_denied: "你取消了 Google 登入。",
  email_unverified: "這個 Google 帳號的電子郵件尚未驗證。",
  not_allowed: "這個 Google 帳號沒有管理員權限。",
  oauth_failed: "Google 登入失敗，請稍後再試。",
};

let slot = null;

function authBase() {
  // ?api= is user-controlled; never redirect login to it.
  return getApiBaseSource() === "query" ? "" : getApiBase();
}

function loginHref() {
  const base = authBase();
  const next = `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;
  return apiUrl(
    `/api/auth/google/start?next=${encodeURIComponent(next)}`,
    base,
  );
}

function displayName(user) {
  const name = String(user?.name || "").trim();
  if (name) return name;
  const email = String(user?.email || "").trim();
  return email ? email.split("@")[0] : "已登入";
}

function closeMenu() {
  const menu = slot?.querySelector("#auth-menu");
  const trigger = slot?.querySelector(".auth-user-trigger");
  if (menu) menu.hidden = true;
  if (trigger) trigger.setAttribute("aria-expanded", "false");
}

function bindLoginFallback(link, enabled) {
  if (enabled || !link) return;
  link.addEventListener("click", (event) => {
    event.preventDefault();
    toast(
      "Google 登入尚未設定，請先設定 GOOGLE_CLIENT_ID 與 GOOGLE_CLIENT_SECRET。",
      "warn",
      5200,
    );
  });
}

function renderDemoVisitor(state = {}) {
  const enabled = Boolean(state.google_enabled);
  slot.innerHTML = `
    <div class="auth-user auth-demo">
      <button type="button"
              class="auth-user-trigger"
              id="auth-demo-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="目前是 Demo 展示訪客，開啟帳號選單">
        <span class="auth-avatar auth-avatar-demo" aria-hidden="true">D</span>
        <span class="auth-user-copy">
          <span class="auth-user-name">Demo</span>
          <span class="auth-user-role">展示訪客</span>
        </span>
        <svg class="auth-chevron" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div class="auth-menu" id="auth-menu" role="menu" hidden>
        <div class="auth-menu-head">
          <span class="auth-menu-name">Demo 展示訪客</span>
          <span class="auth-menu-email">目前未登入</span>
        </div>
        <a class="auth-menu-item auth-menu-login${enabled ? "" : " is-disabled"}"
           id="auth-demo-login"
           href="${escapeHtml(loginHref())}"
           role="menuitem"
           ${enabled ? "" : 'aria-disabled="true"'}>
          ${GOOGLE_ICON}
          <span>以 Google 登入</span>
        </a>
      </div>
    </div>`;
  const trigger = slot.querySelector("#auth-demo-trigger");
  const menu = slot.querySelector("#auth-menu");
  trigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    const opening = Boolean(menu?.hidden);
    if (menu) menu.hidden = !opening;
    trigger.setAttribute("aria-expanded", opening ? "true" : "false");
  });
  bindLoginFallback(slot.querySelector("#auth-demo-login"), enabled);
}

function renderLoggedOut(state = {}) {
  const enabled = Boolean(state.google_enabled);
  if (demoActive()) {
    renderDemoVisitor(state);
    return;
  }
  slot.innerHTML = `
    <a class="auth-login${enabled ? "" : " is-disabled"}"
       id="auth-login"
       href="${escapeHtml(loginHref())}"
       aria-label="使用 Google 帳號登入（Login）"
       title="${enabled ? "使用 Google 帳號登入" : "Google 登入尚未設定"}"
       ${enabled ? "" : 'aria-disabled="true"'}>
      ${GOOGLE_ICON}
      <span>Login</span>
    </a>`;
  bindLoginFallback(slot.querySelector("#auth-login"), enabled);
}

function renderLoggedIn(user) {
  const accountName = displayName(user);
  const name = user?.admin ? "Admin" : accountName;
  const email = String(user?.email || "");
  const role = user?.admin ? "管理員" : "使用者";
  slot.innerHTML = `
    <div class="auth-user">
      <button type="button"
              class="auth-user-trigger"
              id="auth-user-trigger"
              aria-haspopup="menu"
              aria-expanded="false"
              aria-label="已登入：${escapeHtml(email || name)}，開啟帳號選單"
              title="${escapeHtml(email || name)}">
        <span class="auth-avatar" aria-hidden="true">${escapeHtml(name.slice(0, 1).toUpperCase() || "A")}</span>
        <span class="auth-user-copy">
          <span class="auth-user-name">${escapeHtml(name)}</span>
          <span class="auth-user-role">${escapeHtml(role)}</span>
        </span>
        <svg class="auth-chevron" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <div class="auth-menu" id="auth-menu" role="menu" hidden>
        <div class="auth-menu-head">
          <span class="auth-menu-name">${escapeHtml(accountName)}</span>
          <span class="auth-menu-email">${escapeHtml(email)}</span>
        </div>
        ${
          user?.admin
            ? `<a class="auth-menu-item" id="auth-admin-settings" href="#/admin" role="menuitem">管理設定</a>`
            : ""
        }
        <button type="button" class="auth-menu-item" id="auth-logout" role="menuitem">
          登出
        </button>
        <button type="button" class="auth-menu-item auth-menu-item-danger" id="auth-logout-all" role="menuitem">
          登出所有裝置
        </button>
      </div>
    </div>`;

  const trigger = slot.querySelector("#auth-user-trigger");
  const menu = slot.querySelector("#auth-menu");
  trigger?.addEventListener("click", (event) => {
    event.stopPropagation();
    const opening = Boolean(menu?.hidden);
    if (menu) menu.hidden = !opening;
    trigger.setAttribute("aria-expanded", opening ? "true" : "false");
  });

  slot.querySelector("#auth-admin-settings")?.addEventListener("click", () => {
    closeMenu();
  });

  slot.querySelector("#auth-logout-all")?.addEventListener("click", async (event) => {
    if (
      !window.confirm(
        "這會讓所有裝置上的 Google 登入立即失效，包含目前這台裝置。確定要繼續嗎？",
      )
    ) {
      return;
    }
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "登出所有裝置中…";
    try {
      await api.authLogoutAll();
      toast("已登出所有裝置。", "ok", 3000);
      await refreshAuth();
      window.dispatchEvent(new CustomEvent("judgment:auth-changed"));
    } catch (error) {
      button.disabled = false;
      button.textContent = "登出所有裝置";
      toast(error.message || "登出所有裝置失敗。", "danger", 5200);
    }
  });

  slot.querySelector("#auth-logout")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = "登出中…";
    try {
      await api.authLogout();
      toast("已登出。", "ok", 2400);
      await refreshAuth();
      window.dispatchEvent(new CustomEvent("judgment:auth-changed"));
    } catch (error) {
      button.disabled = false;
      button.textContent = "登出";
      toast(error.message || "登出失敗。", "danger", 5200);
    }
  });
}

function renderAuthState(state) {
  if (state?.authenticated) renderLoggedIn(state);
  else renderLoggedOut(state || { google_enabled: false });
}

async function refreshAuth() {
  if (!slot) return;
  try {
    const state = await api.authMe();
    if (state?.authenticated) {
      // Prefer the HttpOnly Google session; drop any break-glass token.
      setAdminToken("");
    }
    renderAuthState(state);
  } catch (error) {
    renderLoggedOut({ google_enabled: false });
  }
}

function consumeAuthFlash() {
  let url;
  try {
    url = new URL(window.location.href);
  } catch (error) {
    return;
  }
  const auth = url.searchParams.get("auth");
  const error = url.searchParams.get("auth_error");
  if (!auth && !error) return;
  url.searchParams.delete("auth");
  url.searchParams.delete("auth_error");
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  if (auth === "ok") {
    toast("已使用 Google 帳號登入。", "ok", 3600);
  } else if (error) {
    toast(AUTH_ERRORS[error] || "Google 登入失敗。", "danger", 6000);
  }
}

export function setAuthUser(user) {
  if (!slot) return;
  renderAuthState(user);
}

export function initAuth({ user = null } = {}) {
  slot = document.getElementById("auth-slot");
  if (!slot) return;
  consumeAuthFlash();
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".auth-user")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  if (user) renderAuthState(user);
  else refreshAuth();
}
