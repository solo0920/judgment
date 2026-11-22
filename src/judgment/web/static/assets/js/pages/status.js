import {
  api,
  apiBaseLabel,
  apiUrl,
  getApiBaseSource,
  subscribeRefresh,
} from "../api.js";
import { demoLockMarkup, isDemoVisitor } from "../demo.js";
import {
  SITE_TITLE,
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
  readLocalCache,
  statusBadge,
  statusMeta,
  toast,
  writeLocalCache,
} from "../utils.js";
import { isSupported as indexedDbSupported, indexedDbStats } from "../store.js";
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

const STATUS_WF_OPEN_STAGES = new Set();
const STATUS_CACHE_KEY = "judgment.status.payload.v1";

const DEMO_LOCKED_STATUS_TABS = new Set([
  "tests",
  "resources",
  "local-model",
  "api",
]);

const STATUS_TABS = [
  { id: "overview", label: "服務總覽", hint: "健康狀態與資料量", icon: "activity" },
  {
    id: "tests",
    label: "系統測試",
    hint: "API、測試模式與模型 Flow",
    icon: "terminal",
  },
  { id: "resources", label: "系統資料使用", hint: "CPU、RAM、Docker、硬碟", icon: "cpu" },
  { id: "local-model", label: "Model Provider", hint: "llama-server 主機與模型", icon: "server" },
  { id: "architecture", label: "前後端架構", hint: "Client → API → Pipeline → Data", icon: "layers" },
  { id: "data", label: "資料版本", hint: "Parquet 與 PostgreSQL", icon: "database" },
  { id: "api", label: "API 端點", hint: "REST 與 OpenAPI", icon: "terminal" },
  { id: "runs", label: "最近下載", hint: "法規／命令執行紀錄", icon: "history" },
];

const API_ENDPOINT_GROUPS = [
  {
    id: "system",
    label: "系統與即時狀態",
    icon: "activity",
    prefixes: [
      "/api/health",
      "/api/status",
      "/api/system-usage",
      "/api/events/stream",
      "/api/processing/events/status",
      "/api/docs",
      "/api/openapi.json",
    ],
  },
  {
    id: "processing",
    label: "資料處理與更新",
    icon: "database",
    prefixes: [
      "/api/processing",
      "/api/judgment-download",
      "/api/updates",
      "/api/courts",
      "/api/law-versions",
    ],
  },
  {
    id: "data",
    label: "查詢與資料",
    icon: "search",
    prefixes: [
      "/api/query",
      "/api/data",
      "/api/judgment",
      "/api/law",
      "/api/schema",
      "/api/catalog",
      "/api/judgment-stats",
      "/api/quality",
    ],
  },
  {
    id: "rag",
    label: "RAG 問答",
    icon: "message",
    prefixes: ["/api/rag"],
  },
  {
    id: "index",
    label: "版本與索引",
    icon: "layers",
    prefixes: [
      "/api/index-versions",
      "/api/index-alias",
      "/api/versioning",
    ],
  },
  {
    id: "models",
    label: "模型與服務",
    icon: "brain",
    prefixes: ["/api/ollama", "/api/llm", "/api/rerank", "/api/test-mode"],
  },
  {
    id: "tests",
    label: "測試與效能",
    icon: "activity",
    prefixes: ["/api/test-runs", "/api/performance"],
  },
  {
    id: "question-bank",
    label: "題庫",
    icon: "file",
    prefixes: ["/api/question-bank"],
  },
  {
    id: "benchmark",
    label: "Benchmark",
    icon: "grid",
    prefixes: ["/api/benchmark"],
  },
  { id: "other", label: "其他", icon: "terminal", prefixes: [] },
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

function architectureNode(node, services) {
  const item = typeof node === "string" ? { label: node } : node || {};
  const label = String(item.label || "—");
  const service = item.service
    ? services.find((entry) => entry.id === item.service)
    : null;
  const live = service
    ? service.status === "operational"
    : label === "IndexedDB"
      ? indexedDbSupported()
      : true;
  const title = [
    item.detail || "",
    service ? `狀態：${statusMeta(service.status).label}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  return `<div class="arch-node ${live ? "" : "is-muted"}" title="${escapeHtml(
    title || (live ? label : "尚未設定或尚未接入"),
  )}">
    <strong>${escapeHtml(label)}</strong>
    ${
      item.detail
        ? `<span class="arch-node-detail">${escapeHtml(item.detail)}</span>`
        : ""
    }
  </div>`;
}

function renderArchitecture(architecture, services, demoReadOnly = false) {
  const layers = architecture?.layers || [];
  if (!layers.length) {
    return `<div class="report-empty-inline">狀態 API 未提供架構資料。</div>`;
  }
  const cards = layers.map((layer) => {
    const nodes = (layer.nodes || [])
      .map((node) => architectureNode(node, services))
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
    </div>
    ${renderArchitectureFlowSvg(demoReadOnly)}`;
}

function renderArchitectureFlowSvg(demoReadOnly = false) {
  return `<figure class="arch-diagram">
    <figcaption class="arch-diagram-head">
      <span class="section-title">流程方向示意圖</span>
      <span class="section-sub">目前專案的請求、SSE、RAG、處理流程、背景排程與資料／模型服務方向；圖表可水平捲動</span>
    </figcaption>
    <div class="arch-diagram-scroll">
      <svg class="arch-diagram-svg" viewBox="0 0 1180 740" role="img" aria-labelledby="arch-flow-title arch-flow-desc">
        <title id="arch-flow-title">Judgment RAG Console 前後端流程方向示意圖</title>
        <desc id="arch-flow-desc">瀏覽器 RAG Console 透過 REST 與 SSE 連線 FastAPI${demoReadOnly ? "" : " 9200"}；FastAPI 呼叫 RAG Orchestrator、Processing Runtime、Scheduler 與 Power Agent。RAG 與處理流程讀寫 PostgreSQL、Qdrant、Parquet 與 llama-server Embedding、Reranker、LLM。瀏覽器另以 IndexedDB 保存提問歷史與稽核資料。</desc>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--faint)"></path>
          </marker>
          <marker id="arch-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"></path>
          </marker>
        </defs>

        <rect class="arch-diagram-lane" x="18" y="18" width="228" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="36" y="44">CLIENT · BROWSER</text>
        <rect class="arch-diagram-lane" x="280" y="18" width="520" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="298" y="44">APPLICATION · FASTAPI</text>
        <rect class="arch-diagram-lane" x="840" y="18" width="322" height="632" rx="12"></rect>
        <text class="arch-diagram-lane-label" x="858" y="44">DATA · STORAGE · MODELS</text>

        <rect class="arch-diagram-node" x="36" y="70" width="192" height="88" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="94">RAG Console SPA</text>
        <text class="arch-diagram-node-sub" x="50" y="113">#/rag · #/data · #/processing</text>
        <text class="arch-diagram-node-sub" x="50" y="129">#/status · #/performance</text>
        <text class="arch-diagram-node-sub" x="50" y="145">主題引擎 · 響應式 UI</text>

        <rect class="arch-diagram-node" x="36" y="294" width="192" height="82" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="318">API Client + SSE</text>
        <text class="arch-diagram-node-sub" x="50" y="337">REST 請求 · timeout</text>
        <text class="arch-diagram-node-sub" x="50" y="353">/api/events/stream</text>

        <rect class="arch-diagram-node" x="36" y="416" width="192" height="76" rx="9"></rect>
        <text class="arch-diagram-node-title" x="50" y="440">IndexedDB</text>
        <text class="arch-diagram-node-sub" x="50" y="459">提問歷史 · audit_events</text>
        <text class="arch-diagram-node-sub" x="50" y="475">瀏覽器端保存</text>

        <rect class="arch-diagram-node" x="298" y="70" width="484" height="86" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="94">${demoReadOnly ? "FastAPI · API" : "FastAPI · 127.0.0.1:9200"}</text>
        <text class="arch-diagram-node-sub" x="314" y="113">REST /api/* · SSE /api/events/stream · OpenAPI</text>
        <text class="arch-diagram-node-sub" x="314" y="129">query · catalog · performance · benchmark · quality</text>
        <text class="arch-diagram-node-sub" x="314" y="145">processing · updates · status · Last-Event-ID replay</text>

        <rect class="arch-diagram-node" x="298" y="222" width="484" height="128" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="246">RAG Orchestrator · judgment.rag</text>
        <text class="arch-diagram-node-sub" x="314" y="265">法規／命令比對 → 法規條文與判決全文 → 引用組裝</text>
        <text class="arch-diagram-node-sub" x="314" y="281">Embedding → Qdrant top_k=4 → reranker → LLM</text>
        <text class="arch-diagram-node-sub" x="314" y="297">SSE partial／token／result · 引用編號驗證</text>
        <text class="arch-diagram-node-sub" x="314" y="313">preview／retrieval_only 降級 · 效能 Flow</text>
        <text class="arch-diagram-node-sub" x="314" y="329">測試模式逐一模型產生 performance_test_steps</text>

        <rect class="arch-diagram-node" x="298" y="398" width="484" height="108" rx="9"></rect>
        <text class="arch-diagram-node-title" x="314" y="422">Processing Runtime · Workflow State</text>
        <text class="arch-diagram-node-sub" x="314" y="441">判決匯入 · 下載 · 法規索引 · 判決索引 · Parquet 匯出</text>
        <text class="arch-diagram-node-sub" x="314" y="457">法院正規化 · 條文歷史 · 完整資料更新</text>
        <text class="arch-diagram-node-sub" x="314" y="473">SSE live payload · 可中斷續跑 · 0.5 秒推送</text>
        <text class="arch-diagram-node-sub" x="314" y="489">.run 日誌 · shared state checkpoint</text>

        <rect class="arch-diagram-node" x="298" y="536" width="232" height="54" rx="9"></rect>
        <text class="arch-diagram-node-title" x="313" y="558">Scheduler / CLI</text>
        <text class="arch-diagram-node-sub" x="313" y="575">up.sh · cron · judgment-*</text>

        <rect class="arch-diagram-node" x="550" y="536" width="232" height="54" rx="9"></rect>
        <text class="arch-diagram-node-title" x="565" y="558">Power Agent${demoReadOnly ? "" : " · :9201"}</text>
        <text class="arch-diagram-node-sub" x="565" y="575">主機 start／stop 控制</text>

        <rect class="arch-diagram-node" x="858" y="70" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="94">PostgreSQL</text>
        <text class="arch-diagram-node-sub" x="872" y="113">judgment_documents · law_documents</text>
        <text class="arch-diagram-node-sub" x="872" y="129">versions · settings · performance</text>

        <rect class="arch-diagram-node" x="858" y="160" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="184">Qdrant</text>
        <text class="arch-diagram-node-sub" x="872" y="203">judgments_current → judgments_vNNN</text>
        <text class="arch-diagram-node-sub" x="872" y="219">legal_articles_current · history collection</text>

        <rect class="arch-diagram-node" x="858" y="250" width="286" height="74" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="274">Parquet / Files</text>
        <text class="arch-diagram-node-sub" x="872" y="293">raw judgments · deltas · law articles</text>
        <text class="arch-diagram-node-sub" x="872" y="309">download_manifest · state · SQLite journal</text>

        <rect class="arch-diagram-node" x="858" y="340" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="364">llama-server Embedding</text>
        <text class="arch-diagram-node-sub" x="872" y="383">bge-m3 · 1,024 dims${demoReadOnly ? "" : " · x570／local fallback"}</text>

        <rect class="arch-diagram-node" x="858" y="420" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="444">Reranker</text>
        <text class="arch-diagram-node-sub" x="872" y="463">bge-reranker-v2-m3 · primary／fallback</text>

        <rect class="arch-diagram-node" x="858" y="500" width="286" height="64" rx="9"></rect>
        <text class="arch-diagram-node-title" x="872" y="524">llama-server LLM</text>
        <text class="arch-diagram-node-sub" x="872" y="543">gemma3 · chat · SSE token streaming</text>

        <path class="arch-diagram-flow arch-diagram-flow-accent" d="M228 112 H298"></path>
        <path class="arch-diagram-flow" d="M298 142 H228"></path>
        <path class="arch-diagram-flow arch-diagram-flow-both" d="M228 452 H260 V150 H228"></path>

        <path class="arch-diagram-flow" d="M540 156 V222"></path>
        <path class="arch-diagram-flow" d="M782 113 H812 V430 H782"></path>
        <path class="arch-diagram-flow arch-diagram-flow-accent" d="M782 286 H840"></path>
        <path class="arch-diagram-flow" d="M782 452 H840"></path>
        <path class="arch-diagram-flow" d="M540 536 V506"></path>

        <g class="arch-diagram-flow-badge"><circle cx="263" cy="100" r="8"></circle><text x="263" y="103">①</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="263" cy="156" r="8"></circle><text x="263" y="159">②</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="252" cy="400" r="8"></circle><text x="252" y="403">⑧</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="548" cy="190" r="8"></circle><text x="548" y="193">③</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="821" cy="220" r="8"></circle><text x="821" y="223">④</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="811" cy="276" r="8"></circle><text x="811" y="279">⑤</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="811" cy="442" r="8"></circle><text x="811" y="445">⑥</text></g>
        <g class="arch-diagram-flow-badge"><circle cx="548" cy="521" r="8"></circle><text x="548" y="524">⑦</text></g>
      </svg>
    </div>
    <div class="arch-diagram-legend">
      <span><b>①</b> REST／JSON：頁面查詢、RAG、處理與狀態 API</span>
      <span><b>②</b> SSE：processing／status／test-runs 即時事件</span>
      <span><b>③</b> FastAPI 呼叫 RAG Orchestrator</span>
      <span><b>④</b> workflow run：處理流程與版本建置</span>
      <span><b>⑤</b> RAG 讀寫 PostgreSQL、Qdrant 與 llama-server 模型</span>
      <span><b>⑥</b> 處理流程讀寫 Parquet、PostgreSQL、Qdrant</span>
      <span><b>⑦</b> Scheduler／CLI 觸發批次工作</span>
      <span><b>⑧</b> 瀏覽器 IndexedDB 本地保存</span>
    </div>
  </figure>`;
}


function apiEndpointGroup(path) {
  const value = String(path || "");
  const matches = (prefix) =>
    value === prefix || value.startsWith(`${prefix}/`);
  for (const group of API_ENDPOINT_GROUPS) {
    if (group.prefixes.some(matches)) return group;
  }
  return API_ENDPOINT_GROUPS[API_ENDPOINT_GROUPS.length - 1];
}

function apiEndpointMethodClass(method) {
  return `is-${String(method || "get").toLowerCase()}`;
}

function renderEndpointRow(endpoint) {
  return `<div class="endpoint-row${endpoint.deprecated ? " is-deprecated" : ""}">
    <span class="endpoint-method ${apiEndpointMethodClass(
      endpoint.method,
    )}">${escapeHtml(endpoint.method || "GET")}</span>
    <span class="endpoint-path" title="${escapeHtml(
      endpoint.path || "",
    )}">${escapeHtml(endpoint.path || "")}</span>
    <span class="endpoint-label">${escapeHtml(endpoint.label || "")}</span>
  </div>`;
}

function renderApiEndpointGroups(endpoints) {
  if (!Array.isArray(endpoints) || !endpoints.length) {
    return `<div class="report-empty-inline">沒有端點資訊。</div>`;
  }
  const groups = new Map(
    API_ENDPOINT_GROUPS.map((group) => [group.id, { group, endpoints: [] }]),
  );
  for (const endpoint of endpoints) {
    const group = apiEndpointGroup(endpoint.path);
    const entry = groups.get(group.id);
    if (entry) entry.endpoints.push(endpoint);
  }
  return `<div class="api-endpoint-groups">${API_ENDPOINT_GROUPS.map(
    (group) => {
      const entry = groups.get(group.id);
      const items = entry?.endpoints || [];
      if (!items.length) return "";
      items.sort(
        (left, right) =>
          String(left.path).localeCompare(String(right.path)) ||
          String(left.method).localeCompare(String(right.method)),
      );
      return `<section class="card api-endpoint-group">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            group.icon,
            14,
          )}${escapeHtml(group.label)}</span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            items.length,
          )}</span>
        </div>
        <div class="endpoint-list">${items
          .map(renderEndpointRow)
          .join("")}</div>
      </section>`;
    },
  ).join("")}</div>`;
}

function detailRow(label, value) {
  return `<div class="detail-row">
    <span class="detail-label">${escapeHtml(label)}</span>
    <span class="detail-value">${value}</span>
  </div>`;
}

function dataVersionFact(label, value, { mono = false, wide = false } = {}) {
  return `<div class="data-version-fact${wide ? " is-wide" : ""}">
    <span>${escapeHtml(label)}</span>
    <strong class="${mono ? "mono" : ""}">${escapeHtml(
      String(value ?? "—"),
    )}</strong>
  </div>`;
}

function dataVersionCoverage(label, percent, detail, tone = "") {
  const value =
    percent === null || percent === undefined
      ? null
      : Math.max(0, Math.min(100, Number(percent) || 0));
  return `<div class="data-version-coverage ${tone}">
    <div class="data-version-coverage-head">
      <span>${escapeHtml(label)}</span>
      <strong>${statusPercent(value)}</strong>
    </div>
    <div class="data-version-coverage-track"><span style="width:${
      value === null ? 0 : value.toFixed(1)
    }%"></span></div>
    <div class="data-version-coverage-foot">${escapeHtml(detail)}</div>
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
      PostgreSQL 判決文件、Qdrant 向量索引與 llama-server 模型狀態皆為即時檢查；未就緒時會明確降級。
    </div>
  </section>`;
}

function statusPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const clamped = Math.max(0, Math.min(100, number));
  return `${Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}%`;
}

function statusStageDuration(stage) {
  return Math.max(0, Number(stage?.duration_ms) || 0);
}

function buildStatusPagePipeline(status, timing) {
  const server =
    status?.pipeline && typeof status.pipeline === "object"
      ? status.pipeline
      : null;
  const serverStages = Array.isArray(server?.stages) ? server.stages : [];
  const serverTotal =
    Number(server?.total_ms) ||
    serverStages.reduce((sum, stage) => sum + statusStageDuration(stage), 0);
  const initMs = Math.max(0, Number(timing?.initMs) || 0);
  const requestMs = Math.max(0, Number(timing?.requestMs) || 0);
  const requestTotal = Math.max(requestMs, serverTotal);
  const transportMs = Math.max(0, requestTotal - serverTotal);
  const stages = [];
  const requestStartedAt =
    timing?.requestStartedAt || status?.checked_at || null;
  const requestFinishedAt =
    timing?.requestFinishedAt || status?.checked_at || null;
  if (initMs > 0.5) {
    stages.push({
      key: "page-init",
      label: "頁面初始化",
      caption: "建立服務總覽骨架與導覽",
      color: "#64748b",
      status: "success",
      duration_ms: initMs,
      started_at: timing?.initStartedAt || requestStartedAt,
      finished_at: requestStartedAt,
      message: "瀏覽器建立頁面、載入模組並準備請求。",
    });
  }
  if (serverStages.length) {
    if (transportMs > 0.5) {
      stages.push({
        key: "http",
        label: "HTTP 傳輸／排隊",
        caption: "瀏覽器 → FastAPI",
        color: "#94a3b8",
        status: "success",
        duration_ms: transportMs,
        started_at: requestStartedAt,
        finished_at: requestFinishedAt,
        message: "包含連線、請求排隊與回應傳輸。",
      });
    }
    stages.push(...serverStages);
    const measured = serverStages.reduce(
      (sum, stage) => sum + statusStageDuration(stage),
      0,
    );
    const rest = Math.max(0, serverTotal - measured);
    if (rest > 0.5) {
      stages.push({
        key: "server-assemble",
        label: "伺服器彙整",
        caption: "狀態回應組裝",
        color: "#cbd5e1",
        status: "success",
        duration_ms: rest,
        started_at:
          serverStages[serverStages.length - 1]?.finished_at ||
          requestStartedAt,
        finished_at: requestFinishedAt,
        message: "組裝服務、資料量與架構 payload。",
      });
    }
  } else {
    stages.push({
      key: "status-request",
      label: "GET /api/status",
      caption: "服務狀態與資料量",
      color: "#64748b",
      status: "success",
      duration_ms: requestTotal,
      started_at: requestStartedAt,
      finished_at: requestFinishedAt,
      message: "後端未提供階段明細；顯示整體請求時間。",
    });
  }
  return {
    total_ms: initMs + requestTotal,
    started_at: timing?.initStartedAt || requestStartedAt,
    finished_at: requestFinishedAt,
    stages,
    server_ms: serverTotal,
    request_ms: requestTotal,
    transport_ms: transportMs,
    init_ms: initMs,
    detailed: Boolean(server),
  };
}

function statusPipelineMarkup(status) {
  const pipeline = status?.page_pipeline;
  const stages = Array.isArray(pipeline?.stages) ? pipeline.stages : [];
  if (!pipeline || !stages.length) return "";
  const totalMs = Math.max(
    0,
    Number(pipeline.total_ms) ||
      stages.reduce((sum, stage) => sum + statusStageDuration(stage), 0),
  );
  const totalForBars = Math.max(
    totalMs,
    stages.reduce((sum, stage) => sum + statusStageDuration(stage), 0),
    1,
  );
  const minBarPercent = 1.25;
  const drawable = stages.filter(
    (stage) => String(stage.status || "success") !== "skipped",
  );
  const completed = stages.filter((stage) =>
    ["success", "no_change"].includes(String(stage.status || "success")),
  ).length;
  const failed = stages.filter((stage) => stage.status === "failed").length;
  const slowest = stages.reduce(
    (current, stage) =>
      statusStageDuration(stage) > statusStageDuration(current)
        ? stage
        : current,
    stages[0],
  );
  const serverMs = Math.max(
    0,
    Number(pipeline.server_ms) || Number(status?.pipeline?.total_ms) || 0,
  );
  const transportMs = Math.max(0, Number(pipeline.transport_ms) || 0);
  const initMs = Math.max(0, Number(pipeline.init_ms) || 0);
  const slotPercents = stages.map((stage) =>
    String(stage.status || "success") === "skipped"
      ? 0
      : Math.max(
          (statusStageDuration(stage) / totalForBars) * 100,
          minBarPercent,
        ),
  );
  const slotTotal = slotPercents.reduce((sum, value) => sum + value, 0);
  const slotScale = slotTotal > 100 ? 100 / slotTotal : 1;
  let cursor = 0;
  const rows = stages
    .map((stage, index) => {
      const statusKey = String(stage.status || "success");
      const skipped = statusKey === "skipped";
      const label = stage.label || stage.key || `階段 ${index + 1}`;
      const caption = stage.caption || "";
      const durationMs = statusStageDuration(stage);
      const durationLabel = skipped ? "—" : formatDuration(durationMs);
      const share = totalForBars > 0 ? (durationMs / totalForBars) * 100 : 0;
      const slotWidth = skipped ? 0 : slotPercents[index] * slotScale;
      const left = cursor;
      if (!skipped) cursor += slotWidth;
      const stageColor = stage.color || "#64748b";
      const barTone = statusKey === "failed" ? "var(--danger)" : stageColor;
      const stageClass = [
        `is-${statusKey}`,
        statusKey === "failed" ? "is-error" : "",
        skipped ? "is-missing" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const barMarkup =
        slotWidth > 0
          ? `<span class="rag-wf-bar status-wf-bar is-sequential" style="left:${left.toFixed(
              3,
            )}%;width:${slotWidth.toFixed(
              4,
            )}%;top:0;height:12px;--bar-color:${escapeHtml(
              barTone,
            )}" aria-hidden="true"></span>`
          : "";
      const statusLabel = skipped
        ? "略過"
        : statusKey === "failed"
          ? "失敗"
          : "完成";
      const stageId = `${pipeline.label || "status"}:${stage.key || index}`;
      const details = [
        ["狀態", statusLabel, true],
        [
          "開始",
          stage.started_at ? formatDateTime(stage.started_at) : "—",
          true,
        ],
        [
          "結束",
          stage.finished_at ? formatDateTime(stage.finished_at) : "—",
          true,
        ],
        ["耗時", durationLabel, true],
        ["占整體", statusPercent(share), true],
        ["說明", stage.message || "", false],
      ]
        .map(([labelText, value, always]) =>
          always || value
            ? `<span class="rag-wf-detail"><span>${escapeHtml(
                labelText,
              )}</span><strong>${escapeHtml(
                String(value || "—"),
              )}</strong></span>`
            : "",
        )
        .join("");
      return `<details class="rag-wf-stage status-wf-stage ${stageClass}" data-status-wf-stage="${escapeHtml(
        stageId,
      )}"${STATUS_WF_OPEN_STAGES.has(stageId) ? " open" : ""} style="--stage-color:${escapeHtml(
        stageColor,
      )}">
        <summary class="rag-wf-stage-summary">
          <span class="rag-wf-stage-head">
            <span class="rag-wf-stage-label">
              <i aria-hidden="true"></i>
              <span><strong><span class="status-wf-step">${String(
                index + 1,
              ).padStart(
                2,
                "0",
              )}</span> ${escapeHtml(label)}</strong>${
                caption
                  ? `<small>${escapeHtml(caption)}</small>`
                  : ""
              }</span>
            </span>
            <span class="rag-wf-stage-meta">${escapeHtml(
              durationLabel,
            )} · ${escapeHtml(statusLabel)} <span class="rag-wf-chevron">${icon(
              "chevronRight",
              12,
            )}</span></span>
          </span>
          <span class="rag-wf-track" style="height:12px" role="img" aria-label="${escapeHtml(
            `${label}：${statusLabel}，耗時 ${durationLabel}，占整體 ${statusPercent(
              share,
            )}`,
          )}">${barMarkup}</span>
        </summary>
        <div class="rag-wf-details">${details}</div>
      </details>`;
    })
    .join("");
  const summaryLabel = pipeline.detailed
    ? "後端 /api/status 階段明細"
    : "後端未提供階段明細，顯示整體請求時間";
  return `<section class="report-card status-wf-card" data-status-pipeline>
    <div class="side-card-head index-runtime-head">
      <span class="side-card-title">${icon(
        "activity",
        14,
      )}服務總覽載入 Pipeline</span>
      <div class="index-runtime-metrics">
        <span class="index-runtime-metric" title="本次頁面初始化到狀態回應完成的總時間。"><span>總耗時</span><strong>${escapeHtml(
          formatDuration(totalMs),
        )}</strong></span>
        <span class="index-runtime-metric" title="後端 /api/status 檢查階段的合計時間。"><span>Server</span><strong>${escapeHtml(
          formatDuration(serverMs),
        )}</strong></span>
        <span class="index-runtime-metric" title="瀏覽器請求時間扣掉後端檢查後的傳輸與排隊時間。"><span>HTTP 傳輸</span><strong>${escapeHtml(
          formatDuration(transportMs),
        )}</strong></span>
        <span class="index-runtime-metric" title="瀏覽器建立頁面骨架與載入模組的時間。"><span>頁面初始化</span><strong>${escapeHtml(
          formatDuration(initMs),
        )}</strong></span>
        <span class="index-runtime-metric" title="耗時最長的檢查階段。"><span>最慢階段</span><strong>${escapeHtml(
          `${slowest?.label || "—"} · ${formatDuration(
            statusStageDuration(slowest),
          )}`,
        )}</strong></span>
        <span class="index-runtime-metric" title="完成的檢查階段數 / 總階段數；失敗階段會以紅色標示。"><span>完成階段</span><strong>${formatNumber(
          completed,
        )} / ${formatNumber(stages.length)}${
          failed ? ` · 失敗 ${formatNumber(failed)}` : ""
        }</strong></span>
      </div>
    </div>
    <div class="status-wf-summary">
      <span>檢查 <strong>${escapeHtml(
        formatDateTime(status.checked_at),
      )}</strong></span>
      <span>API <strong class="mono">${escapeHtml(apiBaseLabel())}</strong></span>
      <span>版本 <strong class="mono">v${escapeHtml(
        status.version || "—",
      )}</strong></span>
      <span>環境 <strong>${escapeHtml(status.environment || "—")}</strong></span>
      <span>${escapeHtml(summaryLabel)}</span>
    </div>
    <div class="status-wf-chart">
      <div class="rag-wf-axis">
        <span>0 ms</span>
        <span>${escapeHtml(formatDuration(totalMs))}</span>
      </div>
      <div class="rag-wf-legend workflow-wf-legend" aria-label="階段狀態圖例">
        <span><i class="is-solid-state"></i>完成</span>
        <span><i class="is-failed-state"></i>失敗</span>
        <span><i class="is-empty-state"></i>略過</span>
      </div>
      <div class="rag-wf-stages">${rows}</div>
      <p class="rag-wf-hint">階段依執行順序由左至右接續排列，顯示本次開啟服務總覽的頁面初始化、HTTP 往返、後端檢查與回應彙整。完成階段填滿顏色，失敗階段以紅色標示，略過階段不繪製 bar；極短階段保留最小可見寬度。點選任一階段可查看開始／結束時間、耗時與說明。</p>
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

    ${statusPipelineMarkup(status)}

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

function renderArchitectureTab(status, demoReadOnly = false) {
  const services = Array.isArray(status.services) ? status.services : [];
  const architecture = status.architecture || {};
  return `<div class="data-section card architecture-card">
    <div class="section-head">
      <div>
        <div class="section-title">前後端架構</div>
        <div class="section-sub">Client → Application → Pipelines → Data · 最新專案元件與即時健康狀態</div>
      </div>
      <span class="badge badge-neutral badge-mono">${formatNumber(
        (architecture.flow || []).length,
      )} layers</span>
    </div>
    ${renderArchitecture(architecture, services, demoReadOnly)}
  </div>`;
}

function renderApiTab(status) {
  const endpoints = Array.isArray(status.endpoints) ? status.endpoints : [];
  const apiSource = getApiBaseSource();
  const apiSourceLabel = API_SOURCE_LABELS[apiSource] || apiSource;
  const docsUrl = apiUrl("/api/docs");
  const openapiUrl = apiUrl("/api/openapi.json");
  const groups = new Set(endpoints.map((item) => apiEndpointGroup(item.path).id));
  const methodCounts = endpoints.reduce((counts, item) => {
    const method = String(item.method || "GET").toUpperCase();
    counts[method] = (counts[method] || 0) + 1;
    return counts;
  }, {});
  const methodSummary = ["GET", "POST", "PATCH", "PUT", "DELETE"]
    .filter((method) => methodCounts[method])
    .map((method) => `${method} ${formatNumber(methodCounts[method])}`)
    .join(" · ");
  return `<section class="status-hero api-endpoint-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge">
            <span class="status-dot is-ok" aria-hidden="true"></span>
            OpenAPI 最新
          </span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            endpoints.length,
          )} 個端點</span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            groups.size,
          )} 個分類</span>
        </div>
        <h2 class="status-headline">API 端點目錄</h2>
        <p class="status-copy">由 FastAPI 目前路由表自動整理，涵蓋 REST、SSE、資料處理、版本索引、題庫、Benchmark、測試 Flow 與模型服務。</p>
        <div class="status-meta">
          <span>${icon("server", 11)} API Base <span class="mono">${escapeHtml(
            apiBaseLabel(),
          )}</span>（${escapeHtml(apiSourceLabel)}）</span>
          <span>${icon("terminal", 11)} ${escapeHtml(methodSummary || "—")}</span>
          <span>${icon("clock", 11)} 更新時間 ${formatDateTime(
            status.checked_at,
          )}</span>
        </div>
      </div>
      <div class="api-endpoint-actions">
        <a class="btn btn-secondary btn-sm" href="${escapeHtml(
          docsUrl,
        )}" target="_blank" rel="noopener noreferrer">${icon(
          "external",
          13,
        )}<span>Swagger UI</span></a>
        <a class="btn btn-ghost btn-sm" href="${escapeHtml(
          openapiUrl,
        )}" target="_blank" rel="noopener noreferrer">OpenAPI JSON ${icon(
          "external",
          11,
        )}</a>
      </div>
    </section>
    ${renderApiEndpointGroups(endpoints)}
    <p class="status-footnote">端點由 FastAPI route table 動態產生；互動式文件位於 <a href="${escapeHtml(
      docsUrl,
    )}" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(
      docsUrl,
    )}</code></a>，OpenAPI schema 位於 <a href="${escapeHtml(
      openapiUrl,
    )}" target="_blank" rel="noopener noreferrer"><code>${escapeHtml(
      openapiUrl,
    )}</code></a>。端點變更後重新整理此頁即可取得最新清單。</p>`;
}

function renderDataTab(status, indexedDbState = {}) {
  const data = status.data || {};
  const indexedDb = indexedDbState.info || null;
  const indexedDbCounts = indexedDb?.counts || {};
  const indexed = Number(data.judgment_indexed_count || 0);
  const total = Number(data.judgment_count || 0);
  const remaining = Number(
    data.judgment_index_remaining ??
      Math.max(0, total - indexed),
  );
  const pending = Number(data.judgment_index_pending ?? remaining) || 0;
  const changed = Number(data.judgment_index_changed || 0);
  const staleCount = Number(data.judgment_index_stale || 0);
  const coverageValue =
    total > 0 ? Math.max(0, Math.min(100, (indexed / total) * 100)) : null;
  const coverageLabel = statusPercent(coverageValue);
  const indexStale =
    data.judgment_index_fresh === false ||
    pending > 0 ||
    String(data.judgment_index_staleness?.status || "") === "stale";
  const indexTone = indexStale ? "is-warn" : "";
  const version = data.last_version || {};
  const lastRun = data.last_run || {};
  const sourceLabel =
    version.source_type === "law"
      ? "法規"
      : version.source_type === "order"
        ? "命令"
        : "—";
  const versionLabel = version.version_code
    ? String(version.version_code)
    : version.id
      ? `#${formatNumber(version.id)}`
      : "—";
  const legalPoints = Number(
    data.legal_article_indexed_count || data.legal_index?.points_count || 0,
  );
  const legalArticles = Number(
    data.legal_article_count || data.legal_index?.article_count || 0,
  );
  const legalCoverage =
    legalArticles > 0
      ? Math.max(0, Math.min(100, (legalPoints / legalArticles) * 100))
      : null;
  const legalStale =
    data.legal_article_stale === true ||
    String(data.legal_index?.status || "") === "stale";
  const legalTone = legalStale ? "is-warn" : "";
  const alias = data.judgment_vector_alias || "—";
  const collection = data.judgment_vector_collection || "—";
  const legalAlias = data.legal_article_vector_alias || data.legal_index?.alias || "—";
  const legalCollection =
    data.legal_article_vector_collection ||
    data.legal_index?.collection ||
    "—";
  const heroLabel = indexStale ? "判決索引待更新" : "資料版本一致";
  const heroHeadline = indexStale
    ? `判決索引尚缺 ${formatNumber(pending)} 筆`
    : "判決資料與向量索引一致";
  const heroCopy = indexStale
    ? `PostgreSQL 目前有 ${formatNumber(total)} 筆判決，Qdrant ${collection} 已索引 ${formatNumber(indexed)} 筆；尚有 ${formatNumber(pending)} 筆待索引。`
    : `PostgreSQL 與 Qdrant 判決筆數一致；法規／命令版本與索引狀態同步。`;
  const lastRunLabel = statusMeta(lastRun.status || "idle").label;
  const lastRunAt = lastRun.finished_at || lastRun.started_at;
  return `<section class="status-hero data-version-hero">
      <div class="status-hero-main">
        <div class="overall-row">
          <span class="overall-badge ${indexTone}">
            <span class="status-dot ${
              indexStale ? "is-warn" : "is-ok"
            }" aria-hidden="true"></span>
            ${escapeHtml(heroLabel)}
          </span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            data.version_count,
          )} 個資料版本</span>
          <span class="badge badge-neutral">${escapeHtml(
            sourceLabel,
          )} 最新版本 ${escapeHtml(versionLabel)}</span>
        </div>
        <h2 class="status-headline">${escapeHtml(heroHeadline)}</h2>
        <p class="status-copy">${escapeHtml(heroCopy)}</p>
        <div class="status-meta">
          <span>${icon("clock", 11)} 檢查時間 ${formatDateTime(
            status.checked_at,
          )}</span>
          <span>${icon("database", 11)} 現行資料 ${formatNumber(
            data.total_current,
          )} 筆</span>
          <span>${icon("layers", 11)} 原始 Parquet ${formatNumber(
            data.parquet_files,
          )} 個 · ${formatBytes(data.parquet_bytes)}</span>
          <span title="Qdrant alias 與目前版本 collection">${icon(
            "link",
            11,
          )} <span class="mono">${escapeHtml(alias)} → ${escapeHtml(
            collection,
          )}</span></span>
        </div>
      </div>
      <div class="data-version-ring ${indexTone}" style="--coverage:${
        coverageValue === null ? 0 : coverageValue.toFixed(1)
      }%">
        <div class="data-version-ring-inner">
          <strong>${coverageLabel}</strong>
          <span>判決索引覆蓋</span>
          <small>${formatNumber(indexed)} / ${formatNumber(total)}</small>
        </div>
      </div>
    </section>

    <div class="status-summary data-version-metrics">
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
        <div class="metric-foot">${formatNumber(
          data.parquet_files,
        )} 個原始 Parquet · ${formatBytes(data.parquet_bytes)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">判決文件</div>
        <div class="metric-value">${formatNumber(data.judgment_count)}</div>
        <div class="metric-foot">PostgreSQL current</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Qdrant 判決向量索引</div>
        <div class="metric-value">${formatNumber(
          data.judgment_indexed_count,
        )}</div>
        <div class="metric-foot">${coverageLabel} · 剩餘 ${formatNumber(
          pending,
        )} 筆</div>
      </div>
    </div>

    <div class="status-columns data-version-grid">
      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            "database",
            14,
          )}PostgreSQL 資料版本</span>
          ${statusBadge(
            version.is_current ? "operational" : "degraded",
            version.is_current ? "CURRENT" : "HISTORY",
          )}
        </div>
        ${
          version.id
            ? `<div class="index-current-row">
                <span class="badge badge-info">${icon("activity", 11)}${escapeHtml(
                  sourceLabel,
                )} ${escapeHtml(versionLabel)}</span>
                <strong class="mono">${formatDateTime(
                  version.downloaded_at,
                )}</strong>
                <span class="index-current-copy" title="${escapeHtml(
                  version.parquet_path || "",
                )}">${escapeHtml(version.parquet_path || "—")}</span>
              </div>
              <div class="data-version-facts">
                ${dataVersionFact(
                  "資料版本總數",
                  formatNumber(data.version_count),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "下載執行總數",
                  formatNumber(data.run_count),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "版本 ID",
                  `#${formatNumber(version.id)}`,
                  { mono: true },
                )}
                ${dataVersionFact("資料類型", sourceLabel)}
                ${dataVersionFact("來源更新日", version.update_date || "—")}
                ${dataVersionFact(
                  `${sourceLabel}／條文`,
                  `${formatNumber(version.law_count)} / ${formatNumber(
                    version.article_count,
                  )}`,
                )}
                ${dataVersionFact(
                  "下載時間",
                  formatDateTime(version.downloaded_at),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "資料狀態",
                  version.is_current ? "current" : "history",
                  { mono: true },
                )}
                ${dataVersionFact(
                  "Parquet 檔案",
                  version.parquet_path || "—",
                  { mono: true, wide: true },
                )}
              </div>`
            : `<div class="report-empty-inline">尚未匯入任何資料版本。</div>`
        }
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            "browser",
            14,
          )}IndexedDB 本機資料</span>
          <span class="badge ${
            indexedDb?.available ? "badge-ok" : "badge-neutral"
          } badge-mono">${escapeHtml(
            indexedDb?.mode === "memory"
              ? "MEMORY"
              : indexedDb
                ? "INDEXEDDB"
                : "LOADING",
          )}</span>
        </div>
        ${
          indexedDb
            ? `<div class="index-current-row">
                <span class="badge badge-info">${icon("database", 11)}${escapeHtml(
                  indexedDb.name || "judgment-console",
                )} v${formatNumber(indexedDb.version)}</span>
                <strong class="mono">${formatNumber(
                  indexedDb.total,
                )} 筆</strong>
                <span class="index-current-copy">${formatNumber(
                  indexedDbCounts.query_history,
                )} 則提問 · ${formatNumber(
                  indexedDbCounts.audit_events,
                )} 筆稽核 · ${formatNumber(
                  indexedDbCounts.settings,
                )} 項設定</span>
              </div>
              <div class="data-version-facts">
                ${dataVersionFact(
                  "Schema 版本",
                  `v${formatNumber(indexedDb.version)}`,
                  { mono: true },
                )}
                ${dataVersionFact(
                  "儲存模式",
                  indexedDb.mode || "—",
                  { mono: true },
                )}
                ${dataVersionFact(
                  "query_history",
                  `${formatNumber(indexedDbCounts.query_history)} / ${formatNumber(
                    indexedDb.caps?.history,
                  )}`,
                  { mono: true },
                )}
                ${dataVersionFact(
                  "audit_events",
                  `${formatNumber(indexedDbCounts.audit_events)} / ${formatNumber(
                    indexedDb.caps?.audit,
                  )}`,
                  { mono: true },
                )}
                ${dataVersionFact(
                  "settings",
                  formatNumber(indexedDbCounts.settings),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "總紀錄數",
                  formatNumber(indexedDb.total),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "已用容量",
                  formatBytes(indexedDb.usage_bytes),
                  { mono: true },
                )}
                ${dataVersionFact(
                  "可用配額",
                  formatBytes(indexedDb.quota_bytes),
                  { mono: true },
                )}
              </div>
              <p class="data-version-note">${icon("info", 12)}
                IndexedDB 只保存瀏覽器端提問歷史、設定與版本稽核事件；伺服器資料以 PostgreSQL 與 Parquet 為準。
              </p>`
            : `<div class="report-empty-inline">${
                indexedDbState.loading || !indexedDbState.error
                  ? "正在讀取瀏覽器 IndexedDB…"
                  : escapeHtml(
                      indexedDbState.error?.message ||
                        "IndexedDB 尚無資料或無法讀取。",
                    )
              }</div>`
        }
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            "brain",
            14,
          )}Qdrant 判決向量索引</span>
          ${statusBadge(
            indexStale ? "degraded" : "operational",
            indexStale ? "待更新" : "一致",
          )}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${icon("link", 11)}Alias</span>
          <strong class="mono">${escapeHtml(alias)}</strong>
          <span class="mono">→ ${escapeHtml(collection)}</span>
          <span class="index-current-copy">v#${formatNumber(
            data.judgment_vector_version_id,
          )} · ${escapeHtml(data.judgment_vector_model || "—")}</span>
        </div>
        ${dataVersionCoverage(
          "索引覆蓋",
          coverageValue,
          `已索引 ${formatNumber(indexed)} / ${formatNumber(
            total,
          )} 筆 · 剩餘 ${formatNumber(pending)} 筆`,
          indexTone,
        )}
        <div class="data-version-facts">
          ${dataVersionFact(
            "Qdrant points",
            formatNumber(data.judgment_vector_points),
            { mono: true },
          )}
          ${dataVersionFact(
            "索引版本",
            `#${formatNumber(data.judgment_vector_version_id)} · ${
              data.judgment_vector_version_status || "legacy"
            }`,
            { mono: true },
          )}
          ${dataVersionFact(
            "前一版本",
            data.judgment_vector_previous_version_id
              ? `#${formatNumber(data.judgment_vector_previous_version_id)}`
              : "—",
            { mono: true },
          )}
          ${dataVersionFact(
            "待補／變更／失效",
            `${formatNumber(pending)} / ${formatNumber(
              changed,
            )} / ${formatNumber(staleCount)}`,
          )}
          ${dataVersionFact(
            "最近索引",
            formatDateTime(data.judgment_indexed_at),
            { mono: true },
          )}
          ${dataVersionFact(
            "模型",
            data.judgment_vector_model || "—",
            { mono: true },
          )}
        </div>
        ${
          pending > 0
            ? `<p class="data-version-note is-warn">${icon(
                "info",
                12,
              )}尚有 ${formatNumber(
                pending,
              )} 筆判決尚未索引；請至「資料處理 → Qdrant判決向量索引版本建置」接續補齊。</p>`
            : ""
        }
      </section>

      <section class="card data-version-card">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            "shield",
            14,
          )}Qdrant 法規／命令向量索引</span>
          ${statusBadge(
            legalStale ? "degraded" : "operational",
            legalStale ? "待更新" : "一致",
          )}
        </div>
        <div class="index-current-row">
          <span class="badge badge-info">${icon("link", 11)}Alias</span>
          <strong class="mono">${escapeHtml(legalAlias)}</strong>
          <span class="mono">→ ${escapeHtml(legalCollection)}</span>
          <span class="index-current-copy">v#${formatNumber(
            data.legal_article_vector_version_id ||
              data.legal_index?.version_id,
          )}</span>
        </div>
        ${dataVersionCoverage(
          "條文索引覆蓋",
          legalCoverage,
          `已索引 ${formatNumber(legalPoints)} / ${formatNumber(
            legalArticles,
          )} 條`,
          legalTone,
        )}
        <div class="data-version-facts">
          ${dataVersionFact(
            "Qdrant points",
            formatNumber(legalPoints),
            { mono: true },
          )}
          ${dataVersionFact(
            "現行條文",
            formatNumber(legalArticles),
            { mono: true },
          )}
          ${dataVersionFact(
            "向量維度",
            formatNumber(data.legal_index?.dimension),
            { mono: true },
          )}
          ${dataVersionFact(
            "最近索引",
            formatDateTime(
              data.legal_article_indexed_at ||
                data.legal_index?.indexed_at,
            ),
            { mono: true },
          )}
          ${dataVersionFact(
            "索引狀態",
            legalStale ? "stale" : "fresh",
            { mono: true },
          )}
          ${dataVersionFact(
            "Collection",
            legalCollection,
            { mono: true },
          )}
        </div>
      </section>

      <section class="card data-version-card is-wide-grid">
        <div class="side-card-head">
          <span class="side-card-title">${icon(
            "folder",
            14,
          )}Parquet 與執行狀態</span>
          <span class="badge badge-neutral badge-mono">${formatNumber(
            data.parquet_files,
          )} FILES</span>
        </div>
        <div class="data-version-facts">
          ${dataVersionFact(
            "原始 Parquet 檔案",
            formatNumber(data.parquet_files),
            { mono: true },
          )}
          ${dataVersionFact("合計容量", formatBytes(data.parquet_bytes), {
            mono: true,
          })}
          ${dataVersionFact(
            "PostgreSQL 現行資料",
            formatNumber(data.total_current),
            { mono: true },
          )}
          ${dataVersionFact(
            "資料版本總數",
            formatNumber(data.version_count),
            { mono: true },
          )}
          ${dataVersionFact(
            "最近下載執行",
            lastRun.status ? lastRunLabel : "—",
          )}
          ${dataVersionFact(
            "最近執行時間",
            lastRunAt ? formatDateTime(lastRunAt) : "—",
            { mono: true },
          )}
          ${dataVersionFact(
            "最近執行耗時",
            lastRun.duration_ms ? formatDuration(lastRun.duration_ms) : "—",
            { mono: true },
          )}
          ${dataVersionFact(
            "最近執行版本",
            lastRun.version_id
              ? `#${formatNumber(lastRun.version_id)}`
              : "—",
            { mono: true },
          )}
        </div>
        <p class="data-version-note">${icon("info", 12)}
          原始 Parquet 保留 raw／delta 與 manifest；PostgreSQL 提供 current metadata 與版本狀態；Qdrant 只保存向量與 payload。
        </p>
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
        <div class="report-title">llama-server 主機與模型</div>
        <div class="report-sub">管理可用的 llama-server 連線、目前使用的主機，以及主機上的聊天／嵌入模型。每次開啟此頁都會重新取得主機與模型列表；embedding 主機的優先順序可到「資料處理」的執行資訊卡片拖移調整。</div>
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
          <input class="input" name="name" value="${escapeHtml(editingHost?.name || "")}" placeholder="例如：x570 llama-server" />
        </label>
        <label class="field"><span class="field-label">主機網址</span>
          <input class="input" name="url" value="${escapeHtml(editUrl)}" placeholder="http://127.0.0.1" required />
        </label>
        <label class="field"><span class="field-label">Port</span>
          <input class="input" name="port" type="number" min="1" max="65535" value="${editingHost?.port || 11437}" required />
        </label>
        <div class="ollama-host-form-actions">
          <button class="btn btn-primary btn-sm" type="submit">${icon("check", 13)}<span>${submitLabel}</span></button>
          ${editingHost ? `<button class="btn btn-ghost btn-sm" type="button" data-ollama-action="cancel-host-edit">取消編輯</button>` : ""}
        </div>
      </form>
      ${
        loading
          ? `<div class="ollama-loading"><span class="spinner"></span><span>讀取 llama-server 主機與模型…</span></div>`
          : hostList.length
            ? `<div class="ollama-host-list">${hostList
                .map((host) => renderLocalModelHost(host, editingId))
                .join("")}</div>`
            : emptyState({
                iconName: "server",
                title: "尚未設定 llama-server 主機",
                text: "請在上方輸入網址與 Port 新增，或使用 .env 的預設連線。",
              })
      }
      <p class="report-sub" style="margin-top:12px">設為聊天或嵌入模型後，系統會使用目前主機的對應模型執行 AI 出題與 RAG；未設定時沿用 .env 的 LLM_MODEL／EMBEDDING_MODEL。</p>
    </div>
  </div>`;
}

function renderStatusSidebar(status, activeTab, usage, demoReadOnly = false) {
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
    "local-model": `<span class="badge badge-neutral badge-mono">LLAMA-SERVER</span>`,
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
        const locked = demoReadOnly && DEMO_LOCKED_STATUS_TABS.has(tab.id);
        return `<button class="status-tab${active ? " is-active" : ""}${locked ? " is-demo-locked" : ""}" type="button"
          data-status-tab="${tab.id}" ${active ? 'aria-current="page"' : ""} ${locked ? 'data-demo-lock-tooltip="展示模式不提供此管理功能"' : ""}>
          <span class="status-tab-icon">${icon(tab.icon, 15)}</span>
          <span class="status-tab-copy">
            <strong>${escapeHtml(tab.label)}</strong>
            <small>${escapeHtml(tab.hint)}</small>
          </span>
          ${locked ? `<span class="badge badge-neutral badge-mono">LOCK</span>` : badges[tab.id] || ""}
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
  indexedDbState,
  demoReadOnly = false,
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
  if (tab === "architecture") return renderArchitectureTab(status, demoReadOnly);
  if (tab === "api") return renderApiTab(status);
  if (tab === "data") return renderDataTab(status, indexedDbState);
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
  const demoReadOnly = isDemoVisitor();
  let disposed = false;
  let autoStream = null;
  let latest = null;
  let activeTab = "overview";
  let usage = null;
  let usageLoading = false;
  let usageError = null;
  let ollamaHosts = null;
  let ollamaHostsLoading = false;
  let ollamaHostsError = null;
  let ollamaEditingId = null;
  let indexedDbInfo = null;
  let indexedDbLoading = false;
  let indexedDbError = null;
  let testsMounted = false;
  let testsMounting = false;
  let testsCleanup = null;
  let testsMountToken = 0;
  let lastNavMarkup = "";
  let lastContentMarkup = "";
  const pageLoadStarted = performance.now();
  const pageLoadStartedAt = new Date().toISOString();
  let initialStatusLoaded = false;

  root.innerHTML = `<section class="page status-page">
    <div class="page-header">
      <div>
        <div class="eyebrow">OBSERVABILITY</div>
        <h1 class="page-title">系統架構與服務狀態</h1>
        <p class="page-subtitle">檢視前端、FastAPI、PostgreSQL、Parquet 與 AI 元件的即時健康狀態，
          並從左側分類切換服務總覽、系統測試、Model Provider、系統資料使用、架構、資料版本與最近下載紀錄。</p>
      </div>
      <div class="page-actions">
        ${
          demoReadOnly
            ? `<span class="badge badge-neutral badge-mono">展示模式 · 唯讀</span>`
            : `<label class="auto-refresh">
          <input type="checkbox" id="auto-refresh" />
          自動更新 30s（推送）
        </label>`
        }
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
    const navMarkup = renderStatusSidebar(
      latest,
      activeTab,
      usage,
      demoReadOnly,
    );
    if (navMarkup !== lastNavMarkup) {
      nav.innerHTML = navMarkup;
      lastNavMarkup = navMarkup;
    }
    if (demoReadOnly && DEMO_LOCKED_STATUS_TABS.has(activeTab)) {
      unmountTests();
      const locked = demoLockMarkup(
        "此分類需要管理者權限",
        "展示模式可瀏覽服務總覽、前後端架構、資料版本與最近下載；系統測試、系統資料使用、Model Provider 與 OpenAPI 由管理者操作。",
      );
      if (content.innerHTML !== locked) content.innerHTML = locked;
      lastContentMarkup = locked;
      return;
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
      {
        info: indexedDbInfo,
        loading: indexedDbLoading,
        error: indexedDbError,
      },
      demoReadOnly,
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

  const loadIndexedDbInfo = async ({ quiet = false } = {}) => {
    if (indexedDbLoading) return;
    indexedDbLoading = true;
    indexedDbError = null;
    if (activeTab === "data" && !indexedDbInfo) paint();
    try {
      const data = await indexedDbStats();
      if (disposed) return;
      indexedDbInfo = data;
    } catch (error) {
      if (disposed) return;
      indexedDbError = error;
      if (!quiet) toast(error.message || "無法讀取 IndexedDB。", "danger");
    } finally {
      if (!disposed) {
        indexedDbLoading = false;
        if (activeTab === "data") paint();
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
      if (!quiet) toast(error.message || "無法取得 llama-server 主機。", "danger");
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

  const loadStatus = async ({
    quiet = false,
    status: providedStatus = null,
  } = {}) => {
    if (!quiet) {
      refreshButton.disabled = true;
      setBusy(refreshButton, true, "檢查中…");
    }
    const requestStarted = performance.now();
    const requestStartedAt = new Date().toISOString();
    let requestFinished = requestStarted;
    let requestFinishedAt = requestStartedAt;
    try {
      const status = providedStatus || (await api.status());
      requestFinished = performance.now();
      requestFinishedAt = new Date().toISOString();
      if (disposed) return;
      const initMs =
        !providedStatus && !initialStatusLoaded
          ? Math.max(0, requestStarted - pageLoadStarted)
          : 0;
      status.page_pipeline =
        status.pipeline || !latest?.page_pipeline
          ? buildStatusPagePipeline(status, {
              initMs,
              initStartedAt: pageLoadStartedAt,
              requestStartedAt,
              requestFinishedAt,
              requestMs: requestFinished - requestStarted,
            })
          : latest.page_pipeline;
      initialStatusLoaded = true;
      latest = status;
      writeLocalCache(STATUS_CACHE_KEY, status);
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

  const refreshCurrent = async ({
    quiet = false,
    status = null,
  } = {}) => {
    await loadStatus({ quiet, status });
    if (demoReadOnly) return;
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
    if (demoReadOnly) return;
    if (activeTab === "resources" && !usage && !usageLoading) {
      loadUsage();
    }
    if (activeTab === "data" && !indexedDbInfo && !indexedDbLoading) {
      loadIndexedDbInfo();
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
      if (!window.confirm(`確定刪除 llama-server 主機 #${hostId}？`)) return;
      try {
        await api.deleteOllamaHost(hostId);
        if (Number(ollamaEditingId) === hostId) ollamaEditingId = null;
        toast("llama-server 主機已刪除。", "info");
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "刪除主機失敗。", "danger");
      }
      return;
    }
    if (action === "activate-host") {
      try {
        await api.activateOllamaHost(hostId);
        toast("已切換使用的 llama-server 主機。", "ok");
        await reloadOllamaHosts();
      } catch (error) {
        toast(error.message || "切換主機失敗。", "danger");
      }
      return;
    }
    if (action === "deactivate-host") {
      try {
        await api.deactivateOllamaHosts();
        toast("已停用指定的 llama-server 主機，將沿用 .env 設定。", "info");
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
    if (!form) return;    event.preventDefault();
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
        toast("llama-server 主機已更新。", "ok");
      } else {
        await api.addOllamaHost(payload);
        toast("llama-server 主機已新增。", "ok");
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

  content.addEventListener("toggle", (event) => {
    const details = event.target.closest?.(
      ".status-wf-stage[data-status-wf-stage]",
    );
    if (!details || !content.contains(details)) return;
    const key = details.dataset.statusWfStage || "";
    if (!key) return;
    if (details.open) STATUS_WF_OPEN_STAGES.add(key);
    else STATUS_WF_OPEN_STAGES.delete(key);
  }, true);

  refreshButton.addEventListener("click", () => refreshCurrent());

  const stopAutoRefresh = () => {
    if (!autoStream) return;
    autoStream();
    autoStream = null;
  };

  if (autoRefresh) autoRefresh.addEventListener("change", () => {
    stopAutoRefresh();
    if (autoRefresh.checked) {
      autoStream = subscribeRefresh("status", (_topic, payload) => {
        if (!disposed) {
          refreshCurrent({
            quiet: true,
            status: payload?.snapshot || null,
          });
        }
      });
      refreshCurrent({ quiet: true });
      toast("已啟用後端推送自動更新（每 30 秒）。", "info", 2200);
    }
  });

  const cachedStatus = readLocalCache(STATUS_CACHE_KEY, 2 * 60 * 1000);
  if (cachedStatus) {
    latest = cachedStatus;
    initialStatusLoaded = true;
    paint();
    void loadStatus({ quiet: true });
  } else {
    await loadStatus({ quiet: true });
  }
  void loadIndexedDbInfo({ quiet: true });

  if (ctx && typeof ctx.setTitle === "function") {
    ctx.setTitle(SITE_TITLE);
  }

  return () => {
    disposed = true;
    unmountTests();
    stopAutoRefresh();
  };
}
