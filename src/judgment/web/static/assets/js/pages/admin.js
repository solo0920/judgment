import { api } from "../api.js";
import {
  FEATURES,
  FEATURE_LABELS,
  demoAdminGuardMarkup,
  formatDemoRemaining,
  isAdmin,
} from "../demo.js";
import { escapeHtml, formatNumber, icon, toast } from "../utils.js";

const DURATIONS = [
  { hours: 2, label: "2 小時" },
  { hours: 24, label: "24 小時" },
  { hours: 168, label: "7 天" },
];

function toggleRow(feature, enabled) {
  return `<label class="demo-toggle-row" for="demo-feature-${feature}">
    <span class="demo-toggle-copy">
      <strong>${escapeHtml(FEATURE_LABELS[feature] || feature)}</strong>
      <small>${enabled ? "訪客可使用此功能的唯讀／公開部分" : "目前未開放給訪客"}</small>
    </span>
    <span class="demo-switch">
      <input type="checkbox" id="demo-feature-${feature}" data-demo-feature="${feature}" aria-label="${escapeHtml(FEATURE_LABELS[feature] || feature)}" ${enabled ? "checked" : ""} />
      <span aria-hidden="true"></span>
    </span>
  </label>`;
}

function auditRows(items) {
  if (!items?.length) {
    return `<div class="demo-empty">尚無切換紀錄。</div>`;
  }
  return `<div class="demo-audit-list">${items
    .map(
      (item) => `<div class="demo-audit-row">
        <span>${escapeHtml(item.created_at || "—")}</span>
        <strong>${escapeHtml(item.action || "—")}</strong>
        <small>${escapeHtml(item.actor_email || "—")}</small>
      </div>`,
    )
    .join("")}</div>`;
}

export function securityAuditRows(items) {
  if (!items?.length) {
    return `<div class="demo-empty">尚無安全稽核事件。</div>`;
  }
  return `<div class="security-audit-list">${items
    .map(
      (item) => `<div class="security-audit-row">
        <span>${escapeHtml(item.created_at || "—")}</span>
        <strong>${escapeHtml(
          `${item.event_type || "—"} · ${item.outcome || "—"}`,
        )}</strong>
        <span>${escapeHtml(
          `${item.method || ""} ${item.path || ""}`.trim() || "—",
        )}</span>
        <small>${escapeHtml(
          [
            item.actor || item.source || "—",
            item.client_ip_hash ? `IP ${item.client_ip_hash}` : "",
          ]
            .filter(Boolean)
            .join(" · "),
        )}</small>
      </div>`,
    )
    .join("")}</div>`;
}

export async function render(root) {
  if (!isAdmin()) {
    root.innerHTML = demoAdminGuardMarkup();
    return;
  }

  root.innerHTML = `<section class="page admin-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">ADMIN SETTINGS</div>
        <div class="data-title-line">
          <h1 class="page-title">管理設定</h1>
          <p class="page-subtitle data-page-subtitle">控制面試展示期間對外開放的功能；關閉總開關後，訪客下一個請求即失效。</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="demo-admin-badge">DEMO · 讀取中</span>
      </div>
    </div>
    <div class="status-layout admin-layout">
      <aside class="status-sidebar" aria-label="管理設定分類">
        <div class="status-sidebar-head">
          <div class="eyebrow">ADMIN</div>
          <div class="status-sidebar-title">設定分類</div>
        </div>
        <nav class="status-tab-list">
          <button class="status-tab is-active" type="button" aria-current="page">
            <span class="status-tab-icon">${icon("sliders", 15)}</span>
            <span class="status-tab-copy"><strong>展示模式</strong><small>總開關、功能與到期</small></span>
          </button>
        </nav>
        <div class="status-sidebar-foot">
          <span>管理員</span>
          <span class="mono">solo4study@gmail.com</span>
        </div>
      </aside>
      <section class="status-panel" id="demo-admin-panel">
        <div class="processing-loading"><span class="spinner"></span><span>讀取展示設定…</span></div>
      </section>
    </div>
  </section>`;

  const panel = root.querySelector("#demo-admin-panel");
  const badge = root.querySelector("#demo-admin-badge");
  let data = null;
  let securityAudit = { events: [] };
  let timer = 0;

  const paintCountdown = () => {
    const el = panel.querySelector("[data-demo-remaining]");
    if (el) el.textContent = formatDemoRemaining(data?.effective?.expires_at);
  };

  const paint = () => {
    if (!data) return;
    const stored = data.stored || {};
    const effective = data.effective || {};
    const usage = data.usage || {};
    const features = stored.features || {};
    const active = Boolean(effective.enabled);
    const hard = Boolean(data.hard_disabled);
    badge.textContent = active ? "DEMO · 已開啟" : "DEMO · 已關閉";
    badge.classList.toggle("badge-ok", active);
    badge.classList.toggle("badge-danger", !active);
    panel.innerHTML = `<div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">DEMO MODE</div>
          <div class="report-title">展示模式</div>
          <div class="report-sub">
            實際生效：<strong>${active ? "開啟" : "關閉"}</strong>
            ${effective.reason ? ` · 原因：${escapeHtml(effective.reason)}` : ""}
          </div>
        </div>
        <div class="demo-status-pill ${active ? "is-on" : "is-off"}">${active ? "ON" : "OFF"}</div>
      </div>
      <div class="report-section">
        ${
          hard
            ? `<div class="notice notice-danger" role="alert">
                <span class="notice-icon" aria-hidden="true">${icon("alert", 12)}</span>
                <div class="notice-body"><strong>環境變數強制關閉</strong>
                <p>JUDGMENT_DEMO_HARD_DISABLE=1，DB 開關目前無效。</p></div>
              </div>`
            : ""
        }
        <div class="demo-admin-stats">
          <div><span>剩餘時間</span><strong data-demo-remaining>${escapeHtml(
            formatDemoRemaining(effective.expires_at),
          )}</strong></div>
          <div><span>今日提問</span><strong>${formatNumber(
            usage.requests || 0,
          )}</strong></div>
          <div><span>今日 tokens</span><strong>${formatNumber(
            usage.tokens || 0,
          )}</strong></div>
          <div><span>設定版本</span><strong>${formatNumber(
            stored.version || 0,
          )}</strong></div>
        </div>

        <div class="demo-master-row">
          <div>
            <strong>總開關（儲存後生效）</strong>
            <small>關閉時只保留首頁靜態頁與管理者登入；訪客 API 全部拒絕。功能旗標仍可先設定並儲存。</small>
          </div>
          <span class="demo-switch demo-switch-lg">
            <input type="checkbox" id="demo-enabled" aria-label="展示模式總開關" ${stored.enabled ? "checked" : ""} />
            <span aria-hidden="true"></span>
          </span>
        </div>

        <div class="demo-feature-list">
          ${FEATURES.map((feature) => toggleRow(feature, Boolean(features[feature]))).join("")}
        </div>

        <div class="demo-open-controls">
          <label class="field-label" for="demo-duration">開放時間</label>
          <select class="select" id="demo-duration">
            ${DURATIONS.map(
              (item) => `<option value="${item.hours}">${item.label}</option>`,
            ).join("")}
          </select>
          <button class="btn btn-secondary" type="button" id="demo-save">
            ${icon("check", 15)}<span>儲存設定</span>
          </button>
          <button class="btn btn-success" type="button" id="demo-open">
            ${icon("play", 15)}<span>開啟展示</span>
          </button>
          <button class="btn btn-danger" type="button" id="demo-close">
            ${icon("x", 15)}<span>立即關閉展示</span>
          </button>
        </div>
        <p class="demo-open-hint">
          「儲存設定」只保存功能旗標與期限，不會改變目前開關；「開啟展示」會依上方旗標立即對訪客開放。
        </p>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">最近切換紀錄</span></div>
          ${auditRows(data.audit)}
        </div>

        <div class="demo-admin-section">
          <div class="report-section-head"><span class="report-section-title">安全稽核（最近 20 筆）</span></div>
          ${securityAuditRows(securityAudit.events)}
        </div>
      </div>
    </div>`;

    const master = panel.querySelector("#demo-enabled");
    const featureInputs = [...panel.querySelectorAll("[data-demo-feature]")];
    const selectedFeatures = () =>
      Object.fromEntries(
        featureInputs.map((input) => [input.dataset.demoFeature, input.checked]),
      );

    const applySettings = async (button, { enabled, label }) => {
      button.disabled = true;
      const duration = Number(panel.querySelector("#demo-duration")?.value || 2);
      const selected = selectedFeatures();
      if (enabled && !Object.values(selected).some(Boolean)) {
        toast("請至少開啟一個功能，才能開啟展示。", "warn", 5200);
        button.disabled = false;
        return;
      }
      try {
        data = await api.updateDemo({
          enabled,
          duration_hours: enabled ? duration : null,
          features: selected,
          version: data?.stored?.version,
        });
        toast(label, "ok", 3200);
        paint();
      } catch (error) {
        toast(error.message || "無法更新展示設定。", "danger", 6000);
      } finally {
        button.disabled = false;
      }
    };

    panel.querySelector("#demo-save")?.addEventListener("click", (event) => {
      applySettings(event.currentTarget, {
        enabled: Boolean(master?.checked),
        label: master?.checked
          ? "展示設定已儲存，展示仍維持開啟。"
          : "展示設定已儲存，展示仍維持關閉。",
      });
    });

    panel.querySelector("#demo-open")?.addEventListener("click", (event) => {
      applySettings(event.currentTarget, {
        enabled: true,
        label: "展示模式已開啟。",
      });
    });

    panel.querySelector("#demo-close")?.addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        data = await api.closeDemo();
        toast("展示模式已關閉。", "ok", 3200);
        paint();
      } catch (error) {
        toast(error.message || "無法關閉展示模式。", "danger", 6000);
      } finally {
        button.disabled = false;
      }
    });

    if (timer) window.clearInterval(timer);
    timer = window.setInterval(paintCountdown, 1000);
  };

  const load = async () => {
    try {
      const [demo, audit] = await Promise.all([
        api.adminDemo(),
        api.adminSecurityAudit(20).catch(() => ({ events: [] })),
      ]);
      data = demo;
      securityAudit = audit || { events: [] };
      paint();
    } catch (error) {
      panel.innerHTML = `<div class="report-card"><div class="report-head">
        <div class="report-title-group"><div class="report-kicker">ADMIN SETTINGS</div>
        <div class="report-title">無法讀取展示設定</div>
        <div class="report-sub">${escapeHtml(error.message || "請稍後再試。")}</div></div>
      </div></div>`;
    }
  };

  await load();
  return () => {
    if (timer) window.clearInterval(timer);
    timer = 0;
  };
}
