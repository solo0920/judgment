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

const STATUS_TABS = [
  { id: "overview", label: "服務總覽", hint: "健康狀態與資料量", icon: "activity" },
  { id: "resources", label: "系統資料使用", hint: "CPU、RAM、Docker、硬碟", icon: "cpu" },
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
        <div class="metric-foot">/ ${formatNumber(data.judgment_count)} 筆判決</div>
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

function renderStatusTab(tab, status, usage, usageLoading, usageError) {
  if (tab === "resources") {
    if (usage) return renderResources(usage);
    if (usageLoading) return renderResourceSkeleton();
    if (usageError) return renderResourceError(usageError);
    return renderResourceSkeleton();
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

  root.innerHTML = `<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">系統架構與服務狀態</h1>
        <p class="page-subtitle">檢視前端、FastAPI、PostgreSQL、Parquet 與 AI 元件的即時健康狀態，
          並從左側分類切換服務總覽、系統資料使用、架構、資料版本與最近下載紀錄。</p>
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
          ${Array.from({ length: 6 })
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

  const paint = () => {
    if (!latest) return;
    nav.innerHTML = renderStatusSidebar(latest, activeTab, usage);
    content.innerHTML = renderStatusTab(
      activeTab,
      latest,
      usage,
      usageLoading,
      usageError,
    );
  };

  const loadUsage = async ({ quiet = false } = {}) => {
    if (usageLoading) return;
    usageLoading = true;
    usageError = null;
    if (activeTab === "resources") paint();
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
      content.innerHTML = renderError(error);
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
  });

  content.addEventListener("click", (event) => {
    if (event.target.closest("#status-retry")) loadStatus();
    if (event.target.closest("#status-resources-retry")) loadUsage();
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
    if (autoTimer) window.clearInterval(autoTimer);
  };
}
