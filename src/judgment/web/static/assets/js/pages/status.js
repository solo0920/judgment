import { api, apiBaseLabel, apiUrl, getApiBaseSource } from "../api.js";
import {
  emptyState,
  escapeHtml,
  formatBytes,
  formatCell,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatRelativeTime,
  icon,
  notice,
  setBusy,
  statusBadge,
  statusMeta,
  toast,
} from "../utils.js";
import { isSupported as indexedDbSupported } from "../store.js";

const SERVICE_ICONS = {
  frontend: "browser",
  backend: "server",
  database: "database",
  storage: "layers",
  vector: "cube",
  ai: "brain",
  default: "cpu",
};

const LAYER_ICONS = {
  client: "browser",
  api: "server",
  data: "database",
  ai: "brain",
};

const API_SOURCE_LABELS = {
  query: "網址 ?api= 參數",
  storage: "瀏覽器儲存值",
  config: "config.js 預設值",
  "file-default": "file:// 預設值",
  "same-origin": "同源",
};

function overallMeta(status) {
  if (status === "operational") {
    return {
      label: "核心服務正常",
      tone: "ok",
      headline: "核心資料管線運作中",
      copy: "FastAPI、PostgreSQL 與 Parquet 均可存取。Qdrant、Embedding 與 LLM 會即時檢查；未設定或降級時不影響資料瀏覽與查詢報表。",
    };
  }
  if (status === "degraded") {
    return {
      label: "部分服務降級",
      tone: "warn",
      headline: "部分服務需要設定或修復",
      copy: "核心資料服務目前未完全可用。請查看下方服務卡片、資料版本與最近的執行紀錄，確認 PostgreSQL、Parquet 或外部服務狀態。",
    };
  }
  return {
    label: statusMeta(status).label,
    tone: statusMeta(status).tone,
    headline: "目前無法確認系統狀態",
    copy: "狀態 API 回傳了非預期結果。請重新整理，或直接檢查 FastAPI 服務日誌。",
  };
}

function serviceCard(service) {
  const meta = statusMeta(service.status);
  const iconName = SERVICE_ICONS[service.kind] || SERVICE_ICONS.default;
  const latency =
    service.latency_ms === null || service.latency_ms === undefined
      ? ""
      : `<span class="service-latency">${formatNumber(service.latency_ms)} ms</span>`;
  return `<article class="service-card">
    <div class="service-top">
      <span class="service-icon">${icon(iconName, 14)}</span>
      <span class="service-name" title="${escapeHtml(service.name)}">${escapeHtml(
        service.name,
      )}</span>
      <span class="service-kind">${escapeHtml(service.kind || "")}</span>
    </div>
    <div class="service-status">
      <span class="status-dot ${
        meta.tone === "ok"
          ? "is-ok"
          : meta.tone === "warn"
            ? "is-warn"
            : meta.tone === "danger"
              ? "is-danger"
              : "is-idle"
      }" aria-hidden="true"></span>
      ${escapeHtml(meta.label)}
      ${latency}
    </div>
    <p class="service-detail" title="${escapeHtml(service.detail || "")}">${escapeHtml(
      service.detail || "",
    )}</p>
  </article>`;
}

function architectureNode(live, label) {
  return `<div class="arch-node ${live ? "" : "is-muted"}" ${
    live ? "" : 'title="尚未設定或尚未接入"'
  }>${escapeHtml(label)}</div>`;
}

function nodeIsLive(node, services) {
  if (node === "IndexedDB") return indexedDbSupported();
  const mapping = {
    PostgreSQL: "postgres",
    Parquet: "parquet",
    Qdrant: "qdrant",
    Embedding: "embedding",
    Retriever: "rag",
    "RAG Engine": "rag",
    LLM: "llm",
  };
  const serviceId = mapping[node];
  if (!serviceId) return true;
  const service = services.find((item) => item.id === serviceId);
  return service?.status === "operational";
}

function renderArchitecture(architecture, services) {
  const layers = architecture?.layers || [];
  if (!layers.length) {
    return `<div class="report-empty-inline">狀態 API 未提供架構資料。</div>`;
  }
  const cards = layers.map((layer) => {
    const nodes = (layer.nodes || [])
      .map((node) => architectureNode(nodeIsLive(node, services), node))
      .join("");
    return `<div class="arch-layer">
      <div class="arch-layer-label">${escapeHtml(layer.label || layer.id)}</div>
      <div class="arch-nodes">${nodes}</div>
    </div>`;
  });
  const flow = [];
  cards.forEach((card, index) => {
    if (index) {
      flow.push(
        `<div class="arch-arrow" aria-hidden="true">${icon("arrowRight", 15)}</div>`,
      );
    }
    flow.push(card);
  });
  return `<div class="arch-flow">${flow.join("")}</div>
    <div class="arch-legend">
      <span><i class="legend-key is-live"></i>已接入且狀態正常</span>
      <span><i class="legend-key is-off"></i>尚未設定或尚未接入</span>
      <span>${icon("info", 12)} 節點狀態來自主服務健康檢查</span>
    </div>`;
}

function renderEndpoints(endpoints) {
  if (!Array.isArray(endpoints) || !endpoints.length) {
    return `<div class="report-empty-inline">沒有端點資訊。</div>`;
  }
  return `<div class="endpoint-list">
    ${endpoints
      .map(
        (endpoint) => `<div class="endpoint-row">
          <span class="endpoint-method">${escapeHtml(endpoint.method)}</span>
          <span class="endpoint-path" title="${escapeHtml(endpoint.path)}">${escapeHtml(
            endpoint.path,
          )}</span>
          <span class="endpoint-label">${escapeHtml(endpoint.label || "")}</span>
        </div>`,
      )
      .join("")}
  </div>`;
}

function detailRow(label, value) {
  return `<div class="detail-row">
    <span class="detail-label">${escapeHtml(label)}</span>
    <span class="detail-value">${value}</span>
  </div>`;
}

function renderLastVersion(version) {
  if (!version) {
    return `<div class="report-empty-inline">尚未匯入任何資料版本。</div>`;
  }
  return `<div class="detail-list">
    ${detailRow("版本 ID", `<strong>#${formatNumber(version.id)}</strong>`)}
    ${detailRow("資料類型", statusBadge("operational", version.source_type === "law" ? "法規" : "命令"))}
    ${detailRow("來源更新日", `<strong>${escapeHtml(version.update_date || "—")}</strong>`)}
    ${detailRow(
      "法規 / 條文",
      `<strong>${formatNumber(version.law_count)} / ${formatNumber(version.article_count)}</strong>`,
    )}
    ${detailRow("下載時間", `<span class="mono">${formatDateTime(version.downloaded_at)}</span>`)}
    ${detailRow(
      "Parquet",
      `<code title="${escapeHtml(version.parquet_path || "")}">${escapeHtml(
        version.parquet_path || "—",
      )}</code>`,
    )}
  </div>`;
}

function renderRuns(runs) {
  if (!Array.isArray(runs) || !runs.length) {
    return emptyState({
      iconName: "history",
      title: "尚無下載執行紀錄",
      text: "執行 judgment-law-download 後，成功、無變更與失敗的結果會出現在這裡。",
    });
  }
  const columns = [
    { key: "id", label: "Run", type: "number" },
    { key: "source_type", label: "類型", type: "source" },
    { key: "status", label: "狀態", type: "status" },
    { key: "started_at", label: "開始時間", type: "datetime" },
    { key: "duration_ms", label: "耗時", type: "duration" },
    { key: "law_count", label: "法規", type: "number" },
    { key: "article_count", label: "條文", type: "number" },
    { key: "error_message", label: "錯誤", type: "longtext" },
  ];
  return `<div class="table-wrap" style="border-top:0;max-height:340px">
    <table class="data-table runs-table">
      <thead><tr>${columns
        .map((column) => `<th scope="col">${escapeHtml(column.label)}</th>`)
        .join("")}</tr></thead>
      <tbody>
        ${runs
          .map(
            (run) => `<tr>${columns
              .map(
                (column) =>
                  `<td>${formatCell(run[column.key], column.type)}</td>`,
              )
              .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderContent(status) {
  const data = status.data || {};
  const services = Array.isArray(status.services) ? status.services : [];
  const overall = overallMeta(status.status);
  const architecture = status.architecture || {};
  const qdrant = services.find((service) => service.id === "qdrant");
  const rag = services.find((service) => service.id === "rag");
  const llm = services.find((service) => service.id === "llm");
  const apiSource = getApiBaseSource();
  const apiSourceLabel = API_SOURCE_LABELS[apiSource] || apiSource;
  const docsUrl = apiUrl("/api/docs");
  const openapiUrl = apiUrl("/api/openapi.json");
  const statusUrl = apiUrl("/api/status");

  return `<section class="status-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${overall.tone === "warn" ? "is-warn" : overall.tone === "danger" ? "is-danger" : ""}">
            <span class="status-dot ${
              overall.tone === "ok" ? "is-ok" : overall.tone === "warn" ? "is-warn" : "is-danger"
            }" aria-hidden="true"></span>
            ${escapeHtml(overall.label)}
          </span>
          <span class="badge badge-neutral badge-mono">v${escapeHtml(status.version || "—")}</span>
          <span class="badge badge-neutral badge-mono">${escapeHtml(status.environment || "—")}</span>
        </div>
        <h2 class="status-headline">${escapeHtml(overall.headline)}</h2>
        <p class="status-copy">${escapeHtml(overall.copy)}</p>
        <div class="status-meta">
          <span>${icon("clock", 11)} 檢查時間 ${formatDateTime(status.checked_at)} · ${escapeHtml(
            formatRelativeTime(status.checked_at),
          )}</span>
          <span>${icon("server", 11)} ${services.length} 個服務元件</span>
          <span>${icon("database", 11)} ${formatNumber(data.total_current)} 筆現行資料</span>
          <span>${icon("layers", 11)} ${formatNumber(data.parquet_files)} 個原始 Parquet</span>
          <span title="API 位址來源：${escapeHtml(apiSourceLabel)}">${icon("link", 11)} ${escapeHtml(
            apiBaseLabel(),
          )}</span>
        </div>
      </div>
    </section>

    <div class="service-grid">${services.map(serviceCard).join("")}</div>

    <div class="status-summary">
      <div class="metric-card">
        <div class="metric-label">現行法規</div>
        <div class="metric-value">${formatNumber(data.law_count)}</div>
        <div class="metric-foot">source_type = law</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">現行命令</div>
        <div class="metric-value">${formatNumber(data.order_count)}</div>
        <div class="metric-foot">source_type = order</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">條文總數</div>
        <div class="metric-value">${formatNumber(data.article_count)}</div>
        <div class="metric-foot">現行版本合計</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">資料版本</div>
        <div class="metric-value">${formatNumber(data.version_count)}</div>
        <div class="metric-foot">原始 Parquet 版本</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">下載執行</div>
        <div class="metric-value">${formatNumber(data.run_count)}</div>
        <div class="metric-foot">含成功、無變更與失敗</div>
      </div>
    </div>

    ${
      qdrant?.status === "not_configured" || rag?.status === "not_configured" || llm?.status === "not_configured"
        ? `<div class="data-section">${notice({
            tone: "info",
            title: "部分 AI 元件尚未設定",
            text: `Qdrant：${escapeHtml(qdrant?.detail || "未設定")}；RAG：${escapeHtml(
              rag?.detail || "未設定",
            )}；LLM：${escapeHtml(llm?.detail || "未設定")}。這些狀態不會被偽裝成可用。`,
          })}</div>`
        : ""
    }

    <div class="data-section card architecture-card">
      <div class="section-head">
        <div>
          <div class="section-title">前後端架構</div>
          <div class="section-sub">Client → Application → Data → Intelligence</div>
        </div>
        <span class="badge badge-neutral badge-mono">${formatNumber(
          (architecture.flow || []).length,
        )} layers</span>
      </div>
      ${renderArchitecture(architecture, services)}
    </div>

    <div class="status-columns">
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${icon("terminal", 14)}API 端點</span>
          <a href="${escapeHtml(docsUrl)}" target="_blank" rel="noopener noreferrer" class="chip"
            >OpenAPI ${icon("external", 11)}</a>
        </div>
        ${renderEndpoints(status.endpoints)}
        <div class="side-card-foot">
          目前 API Base：<code>${escapeHtml(apiBaseLabel())}</code>（${escapeHtml(
            apiSourceLabel,
          )}）。互動式 API 文件位於 <a href="${escapeHtml(
            docsUrl,
          )}" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(
            docsUrl,
          )}</code></a>，OpenAPI schema 位於 <a href="${escapeHtml(
            openapiUrl,
          )}" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(openapiUrl)}</code></a>。
        </div>
      </section>

      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${icon("layers", 14)}最新資料版本</span>
          ${statusBadge("operational", "Parquet")}
        </div>
        ${renderLastVersion(data.last_version)}
        <div class="side-card-foot">
          原始 Parquet 合計 ${formatBytes(data.parquet_bytes)}；PostgreSQL 保存 metadata 與版本狀態。
        </div>
      </section>
    </div>

    <section class="card data-section" style="margin-top:16px">
      <div class="side-card-head">
        <span class="side-card-title">${icon("history", 14)}最近下載執行</span>
        <span class="badge badge-neutral badge-mono">${formatNumber(data.run_count)} TOTAL</span>
      </div>
      ${renderRuns(status.recent_runs)}
    </section>

    <p class="status-footnote">
      此頁直接呼叫 <code>GET ${escapeHtml(statusUrl)}</code>。服務狀態、資料筆數與最近執行紀錄皆來自目前的
      PostgreSQL 與資料目錄；Qdrant、Embedding、RAG 與 LLM 未設定時會標示為「未設定」，不會顯示推測數據。
    </p>`;
}

function renderSkeleton() {
  return `<div class="status-hero">
      <div style="width:100%">
        <div class="skeleton skeleton-line" style="width:180px;height:26px"></div>
        <div class="skeleton skeleton-line" style="width:min(520px,88%);height:30px;margin-top:14px"></div>
        <div class="skeleton skeleton-line" style="width:min(640px,94%);margin-top:12px"></div>
      </div>
    </div>
    <div class="service-grid">
      ${Array.from({ length: 8 })
        .map(() => `<div class="skeleton" style="height:104px;border-radius:var(--radius-md)"></div>`)
        .join("")}
    </div>
    <div class="status-summary">
      ${Array.from({ length: 5 })
        .map(() => `<div class="skeleton" style="height:88px;border-radius:var(--radius-md)"></div>`)
        .join("")}
    </div>`;
}

function renderError(error) {
  return `<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">STATUS CHECK</div>
        <div class="report-title">無法取得服務狀態</div>
        <div class="report-sub">沒有顯示任何快取或推測的服務數據。</div>
      </div>
    </div>
    <div class="report-section">
      ${notice({
        tone: "danger",
        title: "狀態 API 請求失敗",
        text: escapeHtml(error.message || "請確認 judgment-web 是否啟動。"),
      })}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-retry">
          ${icon("refresh", 14)}<span>重試</span>
        </button>
      </div>
    </div>
  </div>`;
}

export async function render(root, ctx) {
  let disposed = false;
  let autoTimer = null;
  let latest = null;

  root.innerHTML = `<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">系統架構與服務狀態</h1>
        <p class="page-subtitle">檢視前端、FastAPI、PostgreSQL、Parquet 與 AI 元件的即時健康狀態，
          以及最近的資料版本與下載執行紀錄。</p>
      </div>
      <div class="page-actions">
        <label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          自動更新 30s
        </label>
        <button class="btn btn-secondary" type="button" id="refresh-status">
          ${icon("refresh", 15)}<span>重新整理</span>
        </button>
      </div>
    </div>
    <div id="status-content">${renderSkeleton()}</div>
  </section>`;

  const content = root.querySelector("#status-content");
  const refreshButton = root.querySelector("#refresh-status");
  const autoRefresh = root.querySelector("#auto-refresh");

  const loadStatus = async ({ quiet = false } = {}) => {
    if (!quiet) {
      refreshButton.disabled = true;
      setBusy(refreshButton, true, "檢查中…");
    }
    try {
      const status = await api.status();
      if (disposed) return;
      latest = status;
      content.innerHTML = renderContent(status);
      const retry = content.querySelector("#status-retry");
      if (retry) retry.addEventListener("click", () => loadStatus());
      if (!quiet) toast("服務狀態已更新。", "ok", 2200);
    } catch (error) {
      if (disposed) return;
      content.innerHTML = renderError(error);
      const retry = content.querySelector("#status-retry");
      if (retry) retry.addEventListener("click", () => loadStatus());
      if (!quiet) toast(error.message || "無法取得服務狀態。", "danger");
    } finally {
      if (!disposed) {
        refreshButton.disabled = false;
        setBusy(refreshButton, false);
      }
    }
  };

  refreshButton.addEventListener("click", () => loadStatus());

  autoRefresh.addEventListener("change", () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
    if (autoRefresh.checked) {
      autoTimer = window.setInterval(() => loadStatus({ quiet: true }), 30000);
      toast("已啟用每 30 秒自動更新。", "info", 2200);
    }
  });

  await loadStatus({ quiet: true });

  if (ctx && typeof ctx.setTitle === "function") {
    ctx.setTitle("系統狀態 · Judgment RAG Console");
  }

  return () => {
    disposed = true;
    if (autoTimer) window.clearInterval(autoTimer);
  };
}
