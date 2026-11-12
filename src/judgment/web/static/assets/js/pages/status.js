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
import * as testsPage from "./tests.js";

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

const STATUS_TABS = [
  { id: "overview", label: "服務總覽", hint: "健康狀態與資料量", icon: "activity" },
  {
    id: "tests",
    label: "系統測試",
    hint: "API、測試模式與模型 Flow",
    icon: "terminal",
  },
  { id: "resources", label: "系統資料使用", hint: "CPU、RAM、Docker、硬碟", icon: "cpu" },
  { id: "local-model", label: "Model Provider", hint: "Ollama 主機與模型", icon: "server" },
  { id: "architecture", label: "前後端架構", hint: "Client → Data → AI", icon: "layers" },
  { id: "data", label: "資料版本", hint: "Parquet 與 PostgreSQL", icon: "database" },
  { id: "api", label: "API 端點", hint: "REST 與 OpenAPI", icon: "terminal" },
  { id: "runs", label: "最近下載", hint: "法規／命令執行紀錄", icon: "history" },
];

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

function renderRagIndex(status) {
  const data = status.data || {};
  const services = Array.isArray(status.services) ? status.services : [];
  const byId = new Map(services.map((service) => [service.id, service]));
  const qdrant = byId.get("qdrant");
  const embedding = byId.get("embedding");
  const rag = byId.get("rag");
  const llm = byId.get("llm");
  const indexed = Number(data.judgment_indexed_count || 0);
  const total = Number(data.judgment_count || 0);
  const coverage = total ? ((indexed / total) * 100).toFixed(1) : "0.0";
  const points =
    data.judgment_vector_points === null ||
    data.judgment_vector_points === undefined
      ? "—"
      : formatNumber(data.judgment_vector_points);
  const remaining = Number(data.judgment_index_remaining || 0);
  const ragBadge =
    rag?.status === "operational"
      ? "RAG 就緒"
      : rag?.status === "not_configured"
        ? "未設定"
        : rag?.status === "degraded"
          ? "降級"
          : "未知";
  const rows = [
    ["cube", "Qdrant 向量索引", qdrant],
    ["layers", `Embedding（${data.judgment_vector_model || "—"}）`, embedding],
    ["brain", "RAG 回答管線", rag],
    ["sparkles", "LLM 模型", llm],
  ];
  return `<section class="card data-section rag-index-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("database", 14)}RAG 資料現況</span>
      ${statusBadge(rag?.status, ragBadge)}
    </div>
    <div class="side-card-body">
      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat-value">${formatNumber(total)}</div>
          <div class="mini-stat-label">判決</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${formatNumber(indexed)}</div>
          <div class="mini-stat-label">已索引</div>
        </div>
        <div class="mini-stat">
          <div class="mini-stat-value">${coverage}%</div>
          <div class="mini-stat-label">索引覆蓋</div>
        </div>
      </div>
      <div class="side-status-list">
        ${rows
          .map(
            ([iconName, label, service]) => `<div class="side-status-row">
              <span>${icon(iconName, 13)}${escapeHtml(label)}</span>
              ${statusBadge(
                service?.status,
                service?.status === "not_configured" ? "未設定" : undefined,
              )}
            </div>`,
          )
          .join("")}
      </div>
      <div class="side-card-foot" style="padding:0;border:0;margin-top:10px">
        Collection：${escapeHtml(data.judgment_vector_collection || "—")} ·
        ${points} points · 剩餘 ${formatNumber(remaining)} 筆待索引
      </div>
    </div>
    <div class="side-card-foot">
      PostgreSQL 判決文件、Qdrant 向量索引與 Ollama 模型狀態皆為即時檢查；未就緒時會明確降級。
    </div>
  </section>`;
}

function renderOverview(status) {
  const data = status.data || {};
  const services = Array.isArray(status.services) ? status.services : [];
  const overall = overallMeta(status.status);
  const qdrant = services.find((service) => service.id === "qdrant");
  const rag = services.find((service) => service.id === "rag");
  const llm = services.find((service) => service.id === "llm");
  const apiSource = getApiBaseSource();
  const apiSourceLabel = API_SOURCE_LABELS[apiSource] || apiSource;

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

    ${renderRagIndex(status)}

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
    }`;
}

function renderArchitectureTab(status) {
  const services = Array.isArray(status.services) ? status.services : [];
  const architecture = status.architecture || {};
  return `<div class="data-section card architecture-card">
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
  </div>`;
}

function renderApiTab(status) {
  const apiSource = getApiBaseSource();
  const apiSourceLabel = API_SOURCE_LABELS[apiSource] || apiSource;
  const docsUrl = apiUrl("/api/docs");
  const openapiUrl = apiUrl("/api/openapi.json");
  return `<div class="status-columns is-single">
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
  </div>`;
}

function renderDataTab(status) {
  const data = status.data || {};
  const indexed = Number(data.judgment_indexed_count || 0);
  const total = Number(data.judgment_count || 0);
  const coverage = total ? ((indexed / total) * 100).toFixed(1) : "0.0";
  const remaining = Number(data.judgment_index_remaining || 0);
  return `<div class="status-summary">
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
        <div class="metric-label">判決索引</div>
        <div class="metric-value">${formatNumber(data.judgment_indexed_count)}</div>
        <div class="metric-foot">/ ${formatNumber(data.judgment_count)} 筆判決 · 覆蓋 ${coverage}%</div>
      </div>
    </div>
    <div class="status-columns is-single">
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
      <section class="card">
        <div class="side-card-head">
          <span class="side-card-title">${icon("database", 14)}資料集統計</span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            data.parquet_files,
          )} FILES</span>
        </div>
        <div class="detail-list">
          ${detailRow("現行法規", `<strong>${formatNumber(data.law_count)}</strong>`)}
          ${detailRow("現行命令", `<strong>${formatNumber(data.order_count)}</strong>`)}
          ${detailRow("條文總數", `<strong>${formatNumber(data.article_count)}</strong>`)}
          ${detailRow("原始 Parquet", `<strong>${formatBytes(data.parquet_bytes)}</strong>`)}
          ${detailRow(
            "判決文件",
            `<strong>${formatNumber(data.judgment_count)}</strong>`,
          )}
          ${detailRow(
            "向量索引",
            `<strong>${formatNumber(data.judgment_indexed_count)}</strong> / ${formatNumber(
              data.judgment_count,
            )}（${formatNumber(data.judgment_vector_points)} points）`,
          )}
          ${detailRow(
            "索引覆蓋",
            `<strong>${coverage}%</strong> · 剩餘 ${formatNumber(remaining)} 筆`,
          )}
          ${detailRow(
            "索引版本",
            `<strong>#${formatNumber(data.judgment_vector_version_id)}</strong> · ${escapeHtml(
              data.judgment_vector_version_status || "legacy",
            )}`,
          )}
          ${detailRow(
            "Alias",
            `<code>${escapeHtml(data.judgment_vector_alias || "—")}</code> → <code>${escapeHtml(
              data.judgment_vector_collection || "—",
            )}</code>`,
          )}
          ${detailRow(
            "索引模型",
            `<code>${escapeHtml(data.judgment_vector_model || "—")}</code>`,
          )}
          ${detailRow(
            "最近索引",
            `<span class="mono">${formatDateTime(data.judgment_indexed_at)}</span>`,
          )}
        </div>
      </section>
    </div>`;
}

function renderRunsTab(status) {
  const data = status.data || {};
  return `<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${icon("history", 14)}最近下載執行</span>
      <span class="badge badge-neutral badge-mono">${formatNumber(data.run_count)} TOTAL</span>
    </div>
    ${renderRuns(status.recent_runs)}
  </section>`;
}

function usageTone(percent) {
  const value = Number(percent);
  if (!Number.isFinite(value)) return "";
  if (value >= 90) return "is-danger";
  if (value >= 70) return "is-warn";
  return "";
}

function usageBar(percent, tone = "") {
  const value = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="resource-bar ${tone}"><span style="width:${value}%"></span></div>`;
}

function resourceCard(label, iconName, primary, detail, percent) {
  const tone = usageTone(percent);
  return `<article class="resource-card">
    <div class="resource-card-head">
      <span class="resource-card-label">${icon(iconName, 14)}${escapeHtml(label)}</span>
      <strong>${escapeHtml(primary)}</strong>
    </div>
    ${usageBar(percent, tone)}
    <div class="resource-card-detail">${detail}</div>
  </article>`;
}

function renderDockerUsage(usage) {
  const docker = usage.docker || {};
  if (!docker.available) {
    return `<section class="card data-section">
      <div class="side-card-head">
        <span class="side-card-title">${icon("layers", 14)}Docker</span>
        ${statusBadge("not_configured", "未連線")}
      </div>
      <div class="report-empty-inline">${escapeHtml(
        docker.detail || "Docker daemon 未連線。",
      )}</div>
    </section>`;
  }
  const containers = [...(docker.containers || [])].sort((left, right) => {
    const leftDb = left.service ? 0 : 1;
    const rightDb = right.service ? 0 : 1;
    return leftDb - rightDb || String(left.name).localeCompare(String(right.name));
  });
  const rows = containers
    .map(
      (container) => `<tr>
        <td><strong>${escapeHtml(container.name || "—")}</strong>${
          container.service
            ? `<span class="badge badge-neutral badge-mono">${escapeHtml(
                container.service,
              )}</span>`
            : ""
        }</td>
        <td>${statusBadge(
          container.state === "running" ? "operational" : "degraded",
          container.state || "—",
        )}</td>
        <td class="cell-number">${
          container.cpu_percent === null || container.cpu_percent === undefined
            ? "—"
            : `${formatNumber(container.cpu_percent)}%`
        }</td>
        <td class="cell-number">${formatBytes(container.memory_used)}${
          container.memory_limit
            ? ` / ${formatBytes(container.memory_limit)}`
            : ""
        }</td>
        <td class="mono">${escapeHtml(container.net_io || "—")}</td>
        <td class="mono">${escapeHtml(container.block_io || "—")}</td>
        <td class="cell-number">${formatNumber(container.pids)}</td>
      </tr>`,
    )
    .join("");
  const system = (docker.system || [])
    .map(
      (item) => `<span class="resource-docker-pill">
        <strong>${escapeHtml(item.type || "—")}</strong>
        <span>${formatNumber(item.count)} · ${escapeHtml(item.size || "—")}</span>
      </span>`,
    )
    .join("");
  return `<section class="card data-section">
    <div class="side-card-head">
      <span class="side-card-title">${icon("layers", 14)}Docker 容器使用資源</span>
      <span class="badge badge-ok badge-mono">${formatNumber(
        containers.length,
      )} 個容器</span>
    </div>
    ${system ? `<div class="resource-docker-system">${system}</div>` : ""}
    ${
      rows
        ? `<div class="table-wrap resource-table-wrap">
            <table class="data-table is-compact">
              <thead><tr>
                <th scope="col">容器</th><th scope="col">狀態</th><th scope="col">CPU</th>
                <th scope="col">RAM</th><th scope="col">Net I/O</th><th scope="col">Block I/O</th>
                <th scope="col">PIDs</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>`
        : `<div class="report-empty-inline">目前沒有執行中的容器。</div>`
    }
    <div class="side-card-foot">${escapeHtml(docker.detail || "Docker 資源統計")}</div>
  </section>`;
}

function renderDatabaseUsage(usage) {
  const cards = (Array.isArray(usage.databases) ? usage.databases : []).map(
    (database) => {
      const isPostgres = database.id === "postgres";
      const tables = Array.isArray(database.tables) ? database.tables : [];
      const status =
        database.status === "operational"
          ? "operational"
          : database.status === "not_configured"
            ? "not_configured"
            : "degraded";
      const details = isPostgres
        ? `${detailRow("資料庫", `<code>${escapeHtml(database.database || "—")}</code>`)}
           ${detailRow("資料庫大小", `<strong>${formatBytes(database.storage_bytes)}</strong>`)}
           ${detailRow("Docker volume", `<strong>${formatBytes(database.volume_bytes)}</strong>${
             database.volume_name
               ? ` <code>${escapeHtml(database.volume_name)}</code>`
               : ""
           }`)}
           ${detailRow("連線數", `<strong>${formatNumber(database.connections)}</strong>`)}`
        : `${detailRow("Collection", `<code>${escapeHtml(database.collection || "—")}</code>`)}
           ${detailRow("Docker volume", `<strong>${formatBytes(database.volume_bytes)}</strong>${
             database.volume_name
               ? ` <code>${escapeHtml(database.volume_name)}</code>`
               : ""
           }`)}
           ${detailRow("向量點數", `<strong>${formatNumber(database.points_count)}</strong>`)}
           ${detailRow("Collections", `<strong>${formatNumber(database.collections)}</strong>`)}
           ${detailRow("Segments", `<strong>${formatNumber(database.segments_count)}</strong>`)}`;
      return `<article class="resource-db-card">
        <div class="resource-db-head">
          <div>
            <div class="resource-db-title">${escapeHtml(database.name || "—")}</div>
            <div class="resource-db-kind">${escapeHtml(database.kind || "")}</div>
          </div>
          ${statusBadge(status)}
        </div>
        <div class="resource-db-metrics">
          <div><span>CPU</span><strong>${
            database.cpu_percent === null || database.cpu_percent === undefined
              ? "—"
              : `${formatNumber(database.cpu_percent)}%`
          }</strong></div>
          <div><span>RAM</span><strong>${formatBytes(database.memory_used)}</strong><small>${
            database.memory_limit
              ? ` / ${formatBytes(database.memory_limit)}`
              : ""
          }</small></div>
          <div><span>容器</span><strong class="mono">${escapeHtml(
            database.container || "—",
          )}</strong><small>${escapeHtml(database.container_status || "—")}</small></div>
        </div>
        <div class="detail-list">${details}</div>
        ${
          tables.length
            ? `<div class="resource-table-wrap">
                <table class="data-table is-compact">
                  <thead><tr><th scope="col">資料表</th><th scope="col">大小</th></tr></thead>
                  <tbody>${tables
                    .map(
                      (table) => `<tr>
                        <td class="mono">${escapeHtml(table.name || "—")}</td>
                        <td class="cell-number">${formatBytes(table.bytes)}</td>
                      </tr>`,
                    )
                    .join("")}</tbody>
                </table>
              </div>`
            : ""
        }
        <div class="side-card-foot">${escapeHtml(database.detail || "")}</div>
      </article>`;
    },
  );
  return `<div class="resource-section-head">
      <div>
        <div class="section-title">各資料庫使用資源</div>
        <div class="section-sub">容器 CPU／RAM 與資料庫內部容量</div>
      </div>
    </div>
    <div class="resource-db-grid">${cards.join("")}</div>`;
}

function storageRow(label, bytes, detail, total) {
  const value = Number(bytes) || 0;
  const percent = total ? (value / total) * 100 : 0;
  return `<div class="storage-row">
    <div class="storage-row-head">
      <span>${escapeHtml(label)}</span>
      <strong>${formatBytes(value)}</strong>
    </div>
    ${usageBar(percent)}
    <div class="storage-row-detail">${detail}</div>
  </div>`;
}

function renderStorageBreakdown(usage) {
  const storage = usage.storage || {};
  const application = storage.application || {};
  const parquet = storage.parquet || {};
  const docker = storage.docker || {};
  const volumes = storage.volumes || {};
  const postgresVolume = volumes.postgres || {};
  const qdrantVolume = volumes.qdrant || {};
  const total = Number(storage.judgment_total_bytes || 0);
  return `<section class="card data-section storage-section">
    <div class="side-card-head">
      <span class="side-card-title">${icon("database", 14)}硬碟使用組成</span>
      <span class="badge badge-neutral badge-mono">${formatBytes(total)}</span>
    </div>
    <div class="storage-list">
      ${storageRow(
        "前端",
        application.frontend_bytes,
        `<span class="mono">${escapeHtml(application.frontend_path || "—")}</span>`,
        total,
      )}
      ${storageRow(
        "後端",
        application.backend_bytes,
        `<span class="mono">${escapeHtml(application.backend_path || "—")}</span>`,
        total,
      )}
      ${storageRow(
        "Docker 映像／容器／快取",
        docker.layers_bytes,
        `Images ${formatBytes(docker.images_bytes)} · Containers ${formatBytes(
          docker.containers_bytes,
        )} · Build cache ${formatBytes(docker.build_cache_bytes)}`,
        total,
      )}
      ${storageRow(
        "PostgreSQL volume",
        postgresVolume.size_bytes,
        `<span class="mono">${escapeHtml(postgresVolume.name || "—")}</span>`,
        total,
      )}
      ${storageRow(
        "Qdrant volume",
        qdrantVolume.size_bytes,
        `<span class="mono">${escapeHtml(qdrantVolume.name || "—")}</span>`,
        total,
      )}
      ${storageRow(
        "Parquet",
        parquet.total_bytes,
        `法規 ${formatBytes(parquet.law_bytes)} · 判決 ${formatBytes(
          parquet.judgment_bytes,
        )}`,
        total,
      )}
    </div>
    <div class="storage-total">
      <span>Judgment 元件合計</span>
      <strong>${formatBytes(total)}</strong>
    </div>
    <div class="side-card-foot">
      前端＋後端程式、Docker 映像／容器／建置快取、PostgreSQL／Qdrant volume 與原始 Parquet；不含 .venv 與其他非 Judgment Docker volume。
    </div>
  </section>`;
}

function renderResources(usage) {
  const host = usage.host || {};
  const cpu = host.cpu || {};
  const memory = host.memory || {};
  const swap = host.swap || {};
  const storage = usage.storage || {};
  const filesystem = storage.filesystem || {};
  const componentTotal = Number(storage.judgment_total_bytes || 0);
  const diskList = Array.isArray(usage.disk) ? usage.disk : [];
  const primaryDisk = diskList[0] || {};
  const diskTotal = Number(filesystem.total_bytes || primaryDisk.total || 0);
  const componentPercent = diskTotal ? (componentTotal / diskTotal) * 100 : 0;
  const load = [cpu.load_1, cpu.load_5, cpu.load_15]
    .map((value) => (value === null || value === undefined ? "—" : value))
    .join(" / ");
  const uptime =
    host.uptime_seconds === null || host.uptime_seconds === undefined
      ? "—"
      : formatDuration(Number(host.uptime_seconds) * 1000);
  const diskCards = [
    primaryDisk.label
      ? resourceCard(
          "HDD 已使用",
          "database",
          `${formatNumber(primaryDisk.percent)}%`,
          `${formatBytes(primaryDisk.used)} / ${formatBytes(
            primaryDisk.total,
          )} · 剩餘 ${formatBytes(
            primaryDisk.free,
          )}<br><span class="mono">${escapeHtml(primaryDisk.path || "")}</span>`,
          primaryDisk.percent,
        )
      : "",
    componentTotal
      ? resourceCard(
          "Judgment 元件合計",
          "layers",
          formatBytes(componentTotal),
          `約占 HDD ${formatNumber(
            componentPercent,
          )}% · 前端／後端／Docker／DB volume／Parquet`,
          componentPercent,
        )
      : "",
    ...diskList.slice(1).map((disk) =>
      resourceCard(
        `硬碟 · ${disk.label}`,
        "layers",
        `${formatNumber(disk.percent)}%`,
        `${formatBytes(disk.used)} / ${formatBytes(
          disk.total,
        )} · 剩餘 ${formatBytes(disk.free)}<br><span class="mono">${escapeHtml(
          disk.path || "",
        )}</span>`,
        disk.percent,
      ),
    ),
  ]
    .filter(Boolean)
    .join("");
  return `<div class="resource-section-head">
      <div>
        <div class="eyebrow">SYSTEM RESOURCE USAGE</div>
        <div class="section-sub">更新時間 ${formatDateTime(usage.checked_at)} · ${
          usage.status === "operational" ? "資源讀取正常" : "部分資源降級"
        }</div>
      </div>
    </div>
    <div class="resource-grid">
      ${resourceCard(
        "CPU 使用率",
        "cpu",
        `${formatNumber(cpu.percent)}%`,
        `${formatNumber(cpu.logical_cores)} 邏輯核心 · ${formatNumber(
          cpu.physical_cores,
        )} 實體核心<br>Load ${escapeHtml(load)}`,
        cpu.percent,
      )}
      ${resourceCard(
        "記憶體",
        "server",
        `${formatNumber(memory.percent)}%`,
        `${formatBytes(memory.used)} / ${formatBytes(
          memory.total,
        )} · 可用 ${formatBytes(memory.available)}`,
        memory.percent,
      )}
      ${resourceCard(
        "Swap",
        "layers",
        `${formatNumber(swap.percent)}%`,
        `${formatBytes(swap.used)} / ${formatBytes(swap.total)}`,
        swap.percent,
      )}
      ${resourceCard(
        "程序與開機",
        "activity",
        `${formatNumber(host.processes)} 個程序`,
        `開機 ${escapeHtml(uptime)}<br>${escapeHtml(host.platform || "")}`,
        null,
      )}
    </div>
    <div class="resource-grid resource-disk-grid">${
      diskCards || `<div class="report-empty-inline">找不到可讀取的磁碟。</div>`
    }</div>
    ${renderStorageBreakdown(usage)}
    ${renderDockerUsage(usage)}
    ${renderDatabaseUsage(usage)}`;
}

function renderResourceSkeleton() {
  return `<div class="resource-section-head">
      <div>
        <div class="skeleton skeleton-line" style="width:160px;height:18px"></div>
        <div class="skeleton skeleton-line" style="width:260px;margin-top:8px"></div>
      </div>
    </div>
    <div class="resource-grid">
      ${Array.from({ length: 4 })
        .map(
          () =>
            `<div class="skeleton" style="height:120px;border-radius:var(--radius-md)"></div>`,
        )
        .join("")}
    </div>
    <div class="skeleton" style="height:180px;margin-top:16px;border-radius:var(--radius-md)"></div>
    <div class="skeleton" style="height:220px;margin-top:16px;border-radius:var(--radius-md)"></div>`;
}

function renderResourceError(error) {
  return `<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SYSTEM RESOURCE USAGE</div>
        <div class="report-title">無法取得系統資源</div>
        <div class="report-sub">沒有顯示任何推測數據。</div>
      </div>
    </div>
    <div class="report-section">
      ${notice({
        tone: "danger",
        title: "資源 API 請求失敗",
        text: escapeHtml(error.message || "請確認 judgment-web 是否啟動。"),
      })}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" id="status-resources-retry">
          ${icon("refresh", 14)}<span>重試</span>
        </button>
      </div>
    </div>
  </div>`;
}

function localModelHealth(host) {
  if (host.status === "operational") {
    return { label: "已連線", badge: "badge-ok" };
  }
  return { label: "無法連線", badge: "badge-danger" };
}

function renderLocalModelHost(host, editingId) {
  const health = localModelHealth(host);
  const models = Array.isArray(host.models) ? host.models : [];
  const modelRows = models.length
    ? models
        .map((model) => {
          const name = String(model.name || "");
          const isChat = host.chat_model === name;
          const isEmbedding = host.embedding_model === name;
          const size = model.size ? formatBytes(model.size) : "";
          const modified = model.modified_at
            ? formatDateTime(model.modified_at)
            : "";
          const capabilities = new Set(
            (model.capabilities || []).map((value) =>
              String(value || "").toLowerCase(),
            ),
          );
          const capabilityBadges = [];
          if (model.supports_chat === true) {
            capabilityBadges.push(["Chat", "badge-ok"]);
          }
          if (capabilities.has("embedding")) {
            capabilityBadges.push(["Embedding", "badge-info"]);
          }
          if (capabilities.has("vision")) {
            capabilityBadges.push(["Vision", "badge-neutral"]);
          }
          if (capabilities.has("tools")) {
            capabilityBadges.push(["Tools", "badge-neutral"]);
          }
          if (capabilities.has("thinking")) {
            capabilityBadges.push(["Thinking", "badge-neutral"]);
          }
          if (capabilities.has("speech")) {
            capabilityBadges.push(["Speech", "badge-warn"]);
          }
          if (model.is_reranker) {
            capabilityBadges.push(["Reranker", "badge-neutral"]);
          }
          if (!capabilityBadges.length) {
            capabilityBadges.push([
              model.capability_status === "untested" ? "未測試" : "無 chat 能力",
              "badge-neutral",
            ]);
          }
          return `<div class="ollama-model-row">
            <div class="ollama-model-main">
              <strong>${escapeHtml(name)}</strong>
              <span class="ollama-model-meta">${[size, modified]
                .filter(Boolean)
                .map((value) => escapeHtml(value))
                .join(" · ") || "—"}</span>
              <div class="ollama-model-capabilities">${capabilityBadges
                .map(
                  ([label, badge]) =>
                    `<span class="badge ${badge}">${escapeHtml(label)}</span>`,
                )
                .join("")}</div>
            </div>
            <div class="ollama-model-roles">
              ${isChat ? `<span class="badge badge-ok">聊天</span>` : ""}
              ${isEmbedding ? `<span class="badge badge-ok">嵌入</span>` : ""}
            </div>
            <div class="ollama-model-actions">
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${isChat ? "clear-model" : "select-model"}" data-id="${host.id}" data-model="${escapeHtml(name)}" data-role="chat">
                ${isChat ? "斷開聊天" : "連接聊天"}
              </button>
              <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="${isEmbedding ? "clear-model" : "select-model"}" data-id="${host.id}" data-model="${escapeHtml(name)}" data-role="embedding">
                ${isEmbedding ? "斷開嵌入" : "連接嵌入"}
              </button>
            </div>
          </div>`;
        })
        .join("")
    : `<div class="ollama-empty">${host.status === "operational" ? "此主機沒有可用模型。" : "無法取得模型列表，請確認主機狀態。"}</div>`;
  return `<article class="ollama-host-card${host.is_active ? " is-active" : ""}">
    <div class="ollama-host-head">
      <div class="ollama-host-title">
        <div class="ollama-host-name">
          <strong>${escapeHtml(host.name || host.base_url)}</strong>
          ${host.is_active ? `<span class="badge badge-ok">目前使用</span>` : ""}
          <span class="badge ${health.badge}">${health.label}</span>
        </div>
        <span class="mono ollama-host-url">${escapeHtml(host.base_url)}</span>
        ${host.detail ? `<span class="ollama-host-detail">${escapeHtml(host.detail)}</span>` : ""}
      </div>
      <div class="qb-actions">
        ${
          host.is_active
            ? `<button class="btn btn-secondary btn-sm" type="button" data-ollama-action="deactivate-host">停用主機</button>`
            : `<button class="btn btn-primary btn-sm" type="button" data-ollama-action="activate-host" data-id="${host.id}">使用此主機</button>`
        }
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="edit-host" data-id="${host.id}">${icon("edit", 13)}<span>編輯</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-ollama-action="delete-host" data-id="${host.id}">${icon("trash", 13)}<span>刪除</span></button>
      </div>
    </div>
    <div class="ollama-model-list">${modelRows}</div>
  </article>`;
}

function renderLocalModel(hosts, loading, error, editingId) {
  if (error) {
    return `<div class="report-card">
      ${notice({
        tone: "danger",
        title: "Model Provider 讀取失敗",
        text: escapeHtml(error.message || "請確認後端服務是否啟動。"),
      })}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${icon("refresh", 14)}<span>重試</span></button>
      </div>
    </div>`;
  }
  const data = hosts || { hosts: [], active_host_id: null };
  const hostList = Array.isArray(data.hosts) ? data.hosts : [];
  const editingHost = editingId
    ? hostList.find((host) => Number(host.id) === Number(editingId))
    : null;
  const editUrl = editingHost
    ? editingHost.base_url.replace(
        new RegExp(`:${editingHost.port}$`),
        "",
      )
    : "http://127.0.0.1";
  const submitLabel = editingHost ? "儲存變更" : "新增主機";
  return `<div class="report-card ollama-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">MODEL PROVIDER</div>
        <div class="report-title">Ollama 主機與模型</div>
        <div class="report-sub">管理可用的 Ollama 連線、目前使用的主機，以及主機上的聊天／嵌入模型。每次開啟此頁都會重新取得主機與模型列表；embedding 主機的優先順序可到「資料處理」的執行資訊卡片拖移調整。</div>
      </div>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="check-capabilities">${icon("shield", 14)}<span>檢查模型能力</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-ollama-action="refresh-hosts">${icon("refresh", 14)}<span>重新整理</span></button>
      </div>
    </div>
    <div class="report-section">
      <form class="ollama-host-form" data-ollama-form="host">
        <input type="hidden" name="host_id" value="${editingHost ? editingHost.id : ""}" />
        <label class="field"><span class="field-label">名稱 <span class="field-tag">選填</span></span>
          <input class="input" name="name" value="${escapeHtml(editingHost?.name || "")}" placeholder="例如：x570 Ollama" />
        </label>
        <label class="field"><span class="field-label">主機網址</span>
          <input class="input" name="url" value="${escapeHtml(editUrl)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${editingHost?.port || 11434}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${icon("check", 13)}<span>${submitLabel}</span></button>
          ${editingHost ? `<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">取消編輯</button>` : ""}
        </div>
      </form>
      ${
        loading
          ? `<div class="ollama-loading"><span class="spinner"></span><span>讀取 Ollama 主機與模型…</span></div>`
          : hostList.length
            ? `<div class="ollama-host-list">${hostList
                .map((host) => renderLocalModelHost(host, editingId))
                .join("")}</div>`
            : emptyState({
                iconName: "server",
                title: "尚未設定 Ollama 主機",
                text: "請在上方輸入網址與 Port 新增，或使用 .env 的預設連線。",
              })
      }
      <p class="report-sub" style="margin-top:12px">設為聊天或嵌入模型後，系統會使用目前主機的對應模型執行 AI 出題與 RAG；未設定時沿用 .env 的 LLM_MODEL／EMBEDDING_MODEL。</p>
    </div>
  </div>`;
}

function renderStatusSidebar(status, activeTab, usage) {
  const data = status?.data || {};
  const overall = status ? statusMeta(status.status) : null;
  const usageStatus = usage ? statusMeta(usage.status) : null;
  const badges = {
    overview: overall
      ? `<span class="badge ${overall.tone === "ok" ? "badge-ok" : overall.tone === "warn" ? "badge-warn" : "badge-danger"} badge-mono">${escapeHtml(
          overall.label,
        )}</span>`
      : "",
    resources: usageStatus
      ? `<span class="badge ${usageStatus.tone === "ok" ? "badge-ok" : usageStatus.tone === "warn" ? "badge-warn" : "badge-danger"} badge-mono">${escapeHtml(
          usageStatus.label,
        )}</span>`
      : `<span class="badge badge-neutral badge-mono">未讀取</span>`,
    data: `<span class="badge badge-neutral badge-mono">${formatNumber(
      data.version_count,
    )}</span>`,
    tests: `<span class="badge badge-neutral badge-mono">TEST</span>`,
    "local-model": `<span class="badge badge-neutral badge-mono">OLLAMA</span>`,
    runs: `<span class="badge badge-neutral badge-mono">${formatNumber(
      data.run_count,
    )}</span>`,
  };
  return `<div class="status-sidebar-head">
      <div class="eyebrow">STATUS SECTIONS</div>
      <div class="status-sidebar-title">系統分類</div>
    </div>
    <nav class="status-tab-list" aria-label="系統狀態分類">
      ${STATUS_TABS.map((tab) => {
        const active = tab.id === activeTab;
        return `<button class="status-tab${active ? " is-active" : ""}" type="button"
          data-status-tab="${tab.id}" ${active ? 'aria-current="page"' : ""}>
          <span class="status-tab-icon">${icon(tab.icon, 15)}</span>
          <span class="status-tab-copy">
            <strong>${escapeHtml(tab.label)}</strong>
            <small>${escapeHtml(tab.hint)}</small>
          </span>
          ${badges[tab.id] || ""}
        </button>`;
      }).join("")}
    </nav>
    <div class="status-sidebar-foot">
      <span>檢查時間</span>
      <span class="mono">${escapeHtml(
        status ? formatDateTime(status.checked_at) : "—",
      )}</span>
    </div>`;
}

function renderStatusTab(
  tab,
  status,
  usage,
  usageLoading,
  usageError,
  ollamaState,
) {
  if (tab === "resources") {
    if (usage) return renderResources(usage);
    if (usageLoading) return renderResourceSkeleton();
    if (usageError) return renderResourceError(usageError);
    return renderResourceSkeleton();
  }
  if (tab === "local-model") {
    const state = ollamaState || {};
    const loading =
      Boolean(state.loading) || (!state.hosts && !state.error);
    return renderLocalModel(
      state.hosts || null,
      loading,
      state.error || null,
      state.editingId || null,
    );
  }
  if (tab === "architecture") return renderArchitectureTab(status);
  if (tab === "api") return renderApiTab(status);
  if (tab === "data") return renderDataTab(status);
  if (tab === "runs") return renderRunsTab(status);
  return renderOverview(status);
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
  let activeTab = "overview";
  let usage = null;
  let usageLoading = false;
  let usageError = null;
  let ollamaHosts = null;
  let ollamaHostsLoading = false;
  let ollamaHostsError = null;
  let ollamaEditingId = null;
  let testsMounted = false;
  let testsMounting = false;
  let testsCleanup = null;
  let testsMountToken = 0;
  let lastNavMarkup = "";
  let lastContentMarkup = "";

  root.innerHTML = `<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">系統架構與服務狀態</h1>
        <p class="page-subtitle">檢視前端、FastAPI、PostgreSQL、Parquet 與 AI 元件的即時健康狀態，
          並從左側分類切換服務總覽、系統測試、Model Provider、系統資料使用、架構、資料版本與最近下載紀錄。</p>
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
    <div class="status-layout">
      <aside class="status-sidebar" aria-label="系統狀態分類">
        <div id="status-nav">
          <div class="status-sidebar-head">
            <div class="eyebrow">STATUS SECTIONS</div>
            <div class="skeleton skeleton-line" style="width:90px;height:18px"></div>
          </div>
          ${Array.from({ length: 8 })
            .map(
              () =>
                `<div class="skeleton skeleton-line" style="width:100%;height:52px;margin-top:8px"></div>`,
            )
            .join("")}
        </div>
      </aside>
      <section class="status-panel" id="status-content">${renderSkeleton()}</section>
    </div>
  </section>`;

  const nav = root.querySelector("#status-nav");
  const content = root.querySelector("#status-content");
  const refreshButton = root.querySelector("#refresh-status");
  const autoRefresh = root.querySelector("#auto-refresh");

  const unmountTests = () => {
    testsMountToken += 1;
    if (typeof testsCleanup === "function") {
      try {
        testsCleanup();
      } catch (error) {
        /* keep status navigation usable if tests cleanup fails */
      }
    }
    testsCleanup = null;
    testsMounted = false;
    testsMounting = false;
  };

  const mountTests = async () => {
    const token = ++testsMountToken;
    testsMounting = true;
    lastContentMarkup = "";
    content.innerHTML = "";
    try {
      const cleanup = await testsPage.render(
        content,
        { setTitle: () => {} },
        { embedded: true },
      );
      if (token !== testsMountToken || activeTab !== "tests") {
        if (typeof cleanup === "function") cleanup();
        return;
      }
      testsCleanup = typeof cleanup === "function" ? cleanup : null;
      testsMounted = true;
    } catch (error) {
      if (token === testsMountToken && activeTab === "tests") {
        content.innerHTML = renderError(error);
      }
    } finally {
      if (token === testsMountToken) testsMounting = false;
    }
  };

  const paint = () => {
    if (!latest) return;
    const navMarkup = renderStatusSidebar(latest, activeTab, usage);
    if (navMarkup !== lastNavMarkup) {
      nav.innerHTML = navMarkup;
      lastNavMarkup = navMarkup;
    }
    if (activeTab === "tests") {
      if (!testsMounted && !testsMounting) mountTests();
      return;
    }
    unmountTests();
    const contentMarkup = renderStatusTab(
      activeTab,
      latest,
      usage,
      usageLoading,
      usageError,
      {
        hosts: ollamaHosts,
        loading: ollamaHostsLoading,
        error: ollamaHostsError,
        editingId: ollamaEditingId,
      },
    );
    if (contentMarkup !== lastContentMarkup) {
      content.innerHTML = contentMarkup;
      lastContentMarkup = contentMarkup;
    }
  };

  const loadUsage = async ({ quiet = false } = {}) => {
    if (usageLoading) return;
    usageLoading = true;
    usageError = null;
    // Keep the current report visible while refreshing; only show a loading
    // state when there is no data to display yet.
    if (activeTab === "resources" && !usage) paint();
    try {
      const data = await api.systemUsage();
      if (disposed) return;
      usage = data;
    } catch (error) {
      if (disposed) return;
      usageError = error;
      if (!quiet) toast(error.message || "無法取得系統資源。", "danger");
    } finally {
      if (!disposed) {
        usageLoading = false;
        if (activeTab === "resources") paint();
      }
    }
  };

  const loadOllamaHosts = async ({ quiet = false } = {}) => {
    if (ollamaHostsLoading) return;
    ollamaHostsLoading = true;
    ollamaHostsError = null;
    // Keep the current host list visible while refreshing; only show a
    // loading state when there is no data to display yet.
    if (activeTab === "local-model" && !ollamaHosts) paint();
    try {
      const data = await api.ollamaHosts();
      if (disposed) return;
      ollamaHosts = data;
    } catch (error) {
      if (disposed) return;
      ollamaHostsError = error;
      if (!quiet) toast(error.message || "無法取得 Ollama 主機。", "danger");
    } finally {
      if (!disposed) {
        ollamaHostsLoading = false;
        if (activeTab === "local-model") paint();
      }
    }
  };

  const reloadOllamaHosts = async () => {
    await loadOllamaHosts({ quiet: true });
    await loadStatus({ quiet: true });
  };

  const loadStatus = async ({ quiet = false } = {}) => {
    if (!quiet) {
      refreshButton.disabled = true;
      setBusy(refreshButton, true, "檢查中…");
    }
    try {
      const status = await api.status();
      if (disposed) return;
      latest = status;
      paint();
      if (!quiet) toast("服務狀態已更新。", "ok", 2200);
    } catch (error) {
      if (disposed) return;
      if (activeTab !== "tests") {
        lastContentMarkup = "";
        content.innerHTML = renderError(error);
      }
      if (!quiet) toast(error.message || "無法取得服務狀態。", "danger");
    } finally {
      if (!disposed) {
        refreshButton.disabled = false;
        setBusy(refreshButton, false);
      }
    }
  };

  const refreshCurrent = async ({ quiet = false } = {}) => {
    await loadStatus({ quiet });
    if (activeTab === "resources") {
      await loadUsage({ quiet });
    }
    if (activeTab === "local-model") {
      await loadOllamaHosts({ quiet });
    }
    if (!quiet && activeTab === "tests") {
      const testsRefresh = content.querySelector("#tests-refresh");
      if (testsRefresh) testsRefresh.click();
    }
  };

  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-status-tab]");
    if (!button) return;
    const nextTab = button.dataset.statusTab;
    if (!STATUS_TABS.some((tab) => tab.id === nextTab)) return;
    activeTab = nextTab;
    paint();
    if (activeTab === "resources" && !usage && !usageLoading) {
      loadUsage();
    }
    if (activeTab === "local-model") {
      loadOllamaHosts();
    }
  });

  content.addEventListener("click", (event) => {
    if (event.target.closest("#status-retry")) loadStatus();
    if (event.target.closest("#status-resources-retry")) loadUsage();
  });

  content.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-ollama-action]");
    if (!button) return;
    const action = button.dataset.ollamaAction;
    const hostId = Number(button.dataset.id || 0);
    if (action === "refresh-hosts") {
      await loadOllamaHosts();
      return;
    }
    if (action === "edit-host") {
      ollamaEditingId = hostId;
      paint();
      root
        .querySelector(".ollama-host-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (action === "cancel-host-edit") {
      ollamaEditingId = null;
      paint();
      return;
    }
    if (action === "delete-host") {
      if (!window.confirm(`確定刪除 Ollama 主機 #${hostId}？`)) return;
      try {
        await api.deleteOllamaHost(hostId);
        if (Number(ollamaEditingId) === hostId) ollamaEditingId = null;
        toast("Ollama 主機已刪除。", "info");
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "刪除主機失敗。", "danger");
      }
      return;
    }
    if (action === "activate-host") {
      try {
        await api.activateOllamaHost(hostId);
        toast("已切換使用的 Ollama 主機。", "ok");
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "切換主機失敗。", "danger");
      }
      return;
    }
    if (action === "deactivate-host") {
      try {
        await api.deactivateOllamaHosts();
        toast("已停用指定的 Ollama 主機，將沿用 .env 設定。", "info");
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "停用主機失敗。", "danger");
      }
      return;
    }
    if (action === "check-capabilities") {
      setBusy(button, true, "檢查中…");
      try {
        await api.checkOllamaCapabilities();
        toast("已更新所有主機的模型能力。", "ok", 4000);
        await reloadOllamaHosts();
      } catch (error) {
        toast(
          error.message || "無法檢查模型能力。",
          "danger",
          7000,
        );
      } finally {
        setBusy(button, false);
      }
      return;
    }
    if (action === "select-model" || action === "clear-model") {
      const model = String(button.dataset.model || "");
      const role = String(button.dataset.role || "");
      try {
        if (action === "select-model") {
          await api.selectOllamaModel(hostId, { model, role });
          toast(`已設定 ${role === "chat" ? "聊天" : "嵌入"}模型：${model}`, "ok");
        } else {
          await api.clearOllamaModel(hostId, { model, role });
          toast(`已取消 ${role === "chat" ? "聊天" : "嵌入"}模型。`, "info");
        }
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "模型設定失敗。", "danger");
      }
    }
  });

  content.addEventListener("submit", async (event) => {
    const form = event.target.closest("form[data-ollama-form='host']");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const hostId = Number(data.get("host_id") || 0);
    const payload = {
      name: String(data.get("name") || "").trim(),
      url: String(data.get("url") || "").trim(),
      port: Number(data.get("port") || 11434),
    };
    try {
      if (hostId) {
        await api.updateOllamaHost(hostId, payload);
        toast("Ollama 主機已更新。", "ok");
      } else {
        await api.addOllamaHost(payload);
        toast("Ollama 主機已新增。", "ok");
      }
      ollamaEditingId = null;
      await reloadOllamaHosts();
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message =
        detail?.errors?.join(" · ") ||
        detail?.message ||
        error.message ||
        "儲存主機失敗。";
      toast(message, "danger", 8000);
    }
  });

  refreshButton.addEventListener("click", () => refreshCurrent());

  autoRefresh.addEventListener("change", () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
    if (autoRefresh.checked) {
      autoTimer = window.setInterval(
        () => refreshCurrent({ quiet: true }),
        30000,
      );
      toast("已啟用每 30 秒自動更新。", "info", 2200);
    }
  });

  await loadStatus({ quiet: true });

  if (ctx && typeof ctx.setTitle === "function") {
    ctx.setTitle("系統狀態 · Judgment RAG Console");
  }

  return () => {
    disposed = true;
    unmountTests();
    if (autoTimer) window.clearInterval(autoTimer);
  };
}
