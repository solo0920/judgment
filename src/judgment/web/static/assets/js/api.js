const DEFAULT_TIMEOUT = 30000;
const RAG_TIMEOUT = 300000;
const POWER_AGENT_PORT = 9201;
const API_BASE_STORAGE_KEY = "judgment.api_base";
export const DEFAULT_FILE_API_BASE = "http://127.0.0.1:9200";

export class ApiError extends Error {
  constructor(message, status = 0, detail = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
}

export function normalizeApiBase(value) {
  let base = String(value ?? "").trim();
  if (!base || base === "/") return "";
  base = base.replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(base) && !base.startsWith("/")) {
    base = `${isLocalHostname(base.split(":")[0]) ? "http" : "https"}://${base}`;
  }

  try {
    const url = new URL(base, window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "")}`;
  } catch (error) {
    return base;
  }
}

export function isValidApiBase(value) {
  const base = normalizeApiBase(value);
  if (!base) return true;
  try {
    const url = new URL(base);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function queryApiBase() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("api")) return null;
    return normalizeApiBase(params.get("api"));
  } catch (error) {
    return null;
  }
}

function storedApiBase() {
  try {
    const value = window.localStorage.getItem(API_BASE_STORAGE_KEY);
    return value === null ? null : normalizeApiBase(value);
  } catch (error) {
    return null;
  }
}

function configuredApiBase() {
  const value = window.JUDGMENT_CONFIG && window.JUDGMENT_CONFIG.apiBase;
  return normalizeApiBase(value || "");
}

export function getApiBase() {
  const query = queryApiBase();
  if (query !== null) return query;

  const stored = storedApiBase();
  if (stored !== null) return stored;

  const configured = configuredApiBase();
  if (configured) return configured;

  if (window.location.protocol === "file:") return DEFAULT_FILE_API_BASE;
  return "";
}

export function hasExplicitApiBase() {
  if (queryApiBase() !== null) return true;
  const stored = storedApiBase();
  if (stored !== null) return Boolean(stored);
  return Boolean(configuredApiBase());
}

export function getApiBaseSource() {
  if (queryApiBase() !== null) return "query";
  if (storedApiBase() !== null) return "storage";
  if (configuredApiBase()) return "config";
  if (window.location.protocol === "file:") return "file-default";
  return "same-origin";
}

export function getPowerBase() {
  const configured = window.JUDGMENT_CONFIG && window.JUDGMENT_CONFIG.powerBase;
  if (configured) return normalizeApiBase(configured);

  let source;
  try {
    source = new URL(getApiBase() || window.location.href);
  } catch (error) {
    return "";
  }
  if (!isLocalHostname(source.hostname)) return "";
  return `http://127.0.0.1:${POWER_AGENT_PORT}`;
}

export function needsApiConfiguration() {
  if (hasExplicitApiBase()) return false;
  if (window.location.protocol === "file:") return false;
  // Only the bundled standalone artifact has config.js. FastAPI serving the
  // source frontend is same-origin even when it binds to a LAN address.
  if (!window.JUDGMENT_CONFIG) return false;
  return !isLocalHostname(window.location.hostname);
}

export function setApiBase(value) {
  const base = normalizeApiBase(value);
  try {
    if (base) window.localStorage.setItem(API_BASE_STORAGE_KEY, base);
    else window.localStorage.removeItem(API_BASE_STORAGE_KEY);
  } catch (error) {
    /* storage may be unavailable */
  }
  return base;
}

export function apiBaseLabel(base = getApiBase()) {
  return base || "同源（目前網域）";
}

export function apiUrl(path, base = getApiBase()) {
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function networkErrorMessage(base) {
  const where = base ? `（${base}）` : "";
  return `無法連線到伺服器${where}，請確認後端是否啟動，或到「系統測試」頁設定後端位址。`;
}

async function request(path, options = {}) {
  const base = getApiBase();
  const controller = new AbortController();
  const timeout = options.timeout === undefined ? DEFAULT_TIMEOUT : options.timeout;
  const timer =
    timeout > 0
      ? window.setTimeout(() => controller.abort(), timeout)
      : null;
  const clientStartedAt = Date.now();
  const clientStarted = performance.now();
  const requestId = options.requestId || newRequestId();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    "X-Judgment-Request-Id": requestId,
    "X-Judgment-Client-Started-At": String(clientStartedAt),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(apiUrl(path, base), {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("請求逾時，請稍後再試。", 0, null);
    }
    throw new ApiError(networkErrorMessage(base), 0, error);
  } finally {
    if (timer) window.clearTimeout(timer);
  }

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
  } else {
    try {
      payload = await response.text();
    } catch (error) {
      payload = null;
    }
  }

  const responseReceived = performance.now();
  const responseRequestId =
    response.headers.get("X-Judgment-Request-Id") || requestId;
  if (options.trackClient !== false && responseRequestId) {
    const totalMs = Math.round(performance.now() - clientStarted);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        reportClientTiming({
          request_id: responseRequestId,
          route: `${window.location.pathname}${window.location.hash || ""}`,
          total_ms: totalMs,
          render_ms: Math.max(0, Math.round(performance.now() - responseReceived)),
          status: response.ok ? "success" : "failed",
        });
      });
    });
  }

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" ? payload.detail || payload.message : payload;
    const message =
      typeof detail === "string" && detail
        ? detail
        : `伺服器回應 ${response.status}，請稍後再試。`;
    throw new ApiError(message, response.status, detail);
  }

  return payload;
}

function newRequestId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    }
  } catch (error) {
    /* fall through */
  }
  return `req${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function reportClientTiming(payload) {
  try {
    fetch(apiUrl("/api/performance/client", getApiBase()), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (error) {
    /* performance telemetry must never break the page */
  }
}

export async function testApiConnection(value) {
  const base = normalizeApiBase(value);
  if (!isValidApiBase(base)) {
    throw new ApiError("API 位址格式不正確，請輸入 http:// 或 https:// 開頭的網址。");
  }
  const started = performance.now();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(apiUrl("/api/health", base), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(`API 回應 ${response.status}。`, response.status);
    }
    const payload = await response.json();
    return {
      base,
      version: payload.version || "—",
      duration_ms: Math.round(performance.now() - started),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === "AbortError") {
      throw new ApiError("連線測試逾時，請確認 API 位址與網路。", 0, error);
    }
    throw new ApiError(networkErrorMessage(base), 0, error);
  } finally {
    window.clearTimeout(timer);
  }
}

async function powerRequest(path, { method = "GET" } = {}) {
  const base = getPowerBase();
  if (!base) {
    throw new ApiError("電源控制僅支援本機後端（localhost 或 127.0.0.1）。");
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 45000);
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "X-Judgment-Power": "1",
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ApiError("電源控制器逾時，請確認後端是否已啟動。", 0, error);
    }
    throw new ApiError(
      "無法連線到本機電源控制器（9201）。請確認後端是以 judgment-web 啟動，或執行 judgment-power-agent。",
      0,
      error,
    );
  } finally {
    window.clearTimeout(timer);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }
  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && payload.detail
        ? payload.detail
        : `電源控制器回應 ${response.status}。`;
    throw new ApiError(detail, response.status, payload);
  }
  return payload;
}

export const powerApi = {
  status() {
    return powerRequest("/api/power/status");
  },
  start() {
    return powerRequest("/api/power/start", { method: "POST" });
  },
  stop() {
    return powerRequest("/api/power/stop", { method: "POST" });
  },
};

export const api = {
  health() {
    return request("/api/health");
  },

  status() {
    return request("/api/status", { trackClient: false });
  },

  systemUsage() {
    return request("/api/system-usage", { trackClient: false });
  },

  indexVersions() {
    return request("/api/index-versions", { trackClient: false });
  },

  indexVersion(versionId) {
    return request(`/api/index-versions/${encodeURIComponent(versionId)}`, {
      trackClient: false,
    });
  },

  validateIndexVersion(versionId) {
    return request(
      `/api/index-versions/${encodeURIComponent(versionId)}/validate`,
      { method: "POST", trackClient: false },
    );
  },

  activateIndexVersion(versionId) {
    return request(
      `/api/index-versions/${encodeURIComponent(versionId)}/activate`,
      { method: "POST", trackClient: false },
    );
  },

  rollbackIndexVersion() {
    return request("/api/index-versions/rollback", {
      method: "POST",
      trackClient: false,
    });
  },

  reconcileIndexAlias(repair = false) {
    const params = new URLSearchParams({ repair: repair ? "true" : "false" });
    return request(`/api/index-alias/reconcile?${params.toString()}`, {
      trackClient: false,
    });
  },

  catalog() {
    return request("/api/catalog");
  },

  query({ database, filters, page = 1, pageSize = 25 }) {
    return request("/api/query", {
      method: "POST",
      body: JSON.stringify({
        database,
        filters,
        page,
        page_size: pageSize,
      }),
    });
  },

  schemaSuggest({ database, table, column, query, limit = 1000 }) {
    const params = new URLSearchParams({
      database,
      table,
      column,
      q: query || "",
      limit: String(limit),
    });
    return request(`/api/schema/suggest?${params.toString()}`, {
      timeout: 30000,
    });
  },

  lawDetail(lawKey, sourceType = "", versionId = "", articleNo = "") {
    const params = new URLSearchParams({ law_key: lawKey });
    if (sourceType) params.set("source_type", sourceType);
    if (versionId) params.set("version_id", String(versionId));
    if (articleNo) params.set("article_no", String(articleNo));
    return request(`/api/law?${params.toString()}`, { timeout: 45000 });
  },

  judgmentDetail(jid, source = "") {
    const params = new URLSearchParams({ jid });
    if (source) params.set("source", source);
    return request(`/api/judgment?${params.toString()}`, { timeout: 45000 });
  },

  testMode() {
    return request("/api/test-mode", { trackClient: false });
  },

  setTestMode(enabled) {
    return request("/api/test-mode", {
      method: "POST",
      body: JSON.stringify({ enabled: Boolean(enabled) }),
      trackClient: false,
    });
  },

  testRuns(limit = 20) {
    const params = new URLSearchParams({ limit: String(limit) });
    return request(`/api/test-runs?${params.toString()}`, {
      trackClient: false,
    });
  },

  testRunCurrent() {
    return request("/api/test-runs/current", { trackClient: false });
  },

  testRun(runId) {
    return request(`/api/test-runs/${encodeURIComponent(runId)}`, {
      trackClient: false,
    });
  },

  performanceOptions() {
    return request("/api/performance/options", { trackClient: false });
  },

  performance(filters = {}, page = 1, pageSize = 25) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === "") continue;
      params.set(key, String(value));
    }
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    return request(`/api/performance?${params.toString()}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  quality() {
    return request("/api/quality", {
      timeout: 180000,
      trackClient: false,
    });
  },

  processing() {
    return request("/api/processing", {
      timeout: 45000,
      trackClient: false,
    });
  },

  questionBankStats() {
    return request("/api/question-bank/stats", { trackClient: false });
  },

  questionBankItems(filters = {}, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === "") continue;
      params.set(key, String(value));
    }
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    return request(`/api/question-bank/items?${params.toString()}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  questionBankItem(itemId) {
    return request(`/api/question-bank/items/${encodeURIComponent(itemId)}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  createQuestionBankItem(payload) {
    return request("/api/question-bank/items", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  updateQuestionBankItem(itemId, payload) {
    return request(`/api/question-bank/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  deleteQuestionBankItem(itemId) {
    return request(`/api/question-bank/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
      timeout: 45000,
      trackClient: false,
    });
  },

  reviewQuestionBankItem(itemId, payload) {
    return request(
      `/api/question-bank/items/${encodeURIComponent(itemId)}/review`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        timeout: 45000,
        trackClient: false,
      },
    );
  },

  importQuestionBank(payload) {
    return request("/api/question-bank/import", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  exportQuestionBank({ status = "accepted" } = {}) {
    const params = new URLSearchParams({ status });
    return request(`/api/question-bank/export?${params.toString()}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  revalidateQuestionBank() {
    return request("/api/question-bank/revalidate", {
      method: "POST",
      body: JSON.stringify({}),
      timeout: 120000,
      trackClient: false,
    });
  },

  benchmarkReadyQuestions(limit = 200) {
    return request(`/api/question-bank/benchmark-ready?limit=${limit}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  benchmarkSuites() {
    return request("/api/benchmark/suites", {
      timeout: 45000,
      trackClient: false,
    });
  },

  createBenchmarkSuite(payload) {
    return request("/api/benchmark/suites", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  updateBenchmarkSuite(suiteId, payload) {
    return request(`/api/benchmark/suites/${encodeURIComponent(suiteId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  deleteBenchmarkSuite(suiteId) {
    return request(`/api/benchmark/suites/${encodeURIComponent(suiteId)}`, {
      method: "DELETE",
      timeout: 45000,
      trackClient: false,
    });
  },

  benchmarkRuns(limit = 20) {
    return request(`/api/benchmark/runs?limit=${limit}`, {
      timeout: 45000,
      trackClient: false,
    });
  },

  startBenchmarkRun(payload) {
    return request("/api/benchmark/runs", {
      method: "POST",
      body: JSON.stringify(payload),
      timeout: 45000,
      trackClient: false,
    });
  },

  benchmarkRun(runId, includeCases = true) {
    return request(
      `/api/benchmark/runs/${encodeURIComponent(runId)}?include_cases=${includeCases}`,
      { timeout: 45000, trackClient: false },
    );
  },

  stopBenchmarkRun(runId) {
    return request(
      `/api/benchmark/runs/${encodeURIComponent(runId)}/stop`,
      {
        method: "POST",
        body: JSON.stringify({}),
        timeout: 45000,
        trackClient: false,
      },
    );
  },

  reviewBenchmarkResult(resultId, payload) {
    return request(
      `/api/benchmark/results/${encodeURIComponent(resultId)}/review`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        timeout: 45000,
        trackClient: false,
      },
    );
  },

  benchmarkModels() {
    return request("/api/benchmark/models", {
      timeout: 45000,
      trackClient: false,
    });
  },

  benchmarkFingerprintHistory(fingerprint, limit = 50) {
    return request(
      `/api/benchmark/fingerprints/${encodeURIComponent(fingerprint)}?limit=${limit}`,
      { timeout: 45000, trackClient: false },
    );
  },

  processingPlan() {
    return request("/api/processing/plan", {
      timeout: 45000,
      trackClient: false,
    });
  },

  startProcessingWorkflow(workflowId) {
    return request(
      `/api/processing/workflows/${encodeURIComponent(workflowId)}/run`,
      { method: "POST", body: JSON.stringify({}) },
    );
  },

  startProcessingUpdate(index = false) {
    return request("/api/processing/update", {
      method: "POST",
      body: JSON.stringify({ index: Boolean(index) }),
      timeout: 45000,
      trackClient: false,
    });
  },

  stopProcessingUpdate() {
    return request("/api/processing/stop", {
      method: "POST",
      body: JSON.stringify({}),
      timeout: 45000,
      trackClient: false,
    });
  },

  rag(question, options = {}) {
    return request("/api/rag/query", {
      method: "POST",
      body: JSON.stringify({ question }),
      timeout: options.testMode ? 0 : RAG_TIMEOUT,
    });
  },

  async ragStream(
    question,
    {
      testMode = false,
      onStep = null,
      onPartial = null,
      onToken = null,
      onTokenReset = null,
    } = {},
  ) {
    const base = getApiBase();
    const controller = new AbortController();
    const timeout = testMode ? 0 : RAG_TIMEOUT;
    const timer =
      timeout > 0 ? window.setTimeout(() => controller.abort(), timeout) : null;
    const clientStartedAt = Date.now();
    const clientStarted = performance.now();
    const requestId = newRequestId();
    const headers = {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
      "X-Judgment-Request-Id": requestId,
      "X-Judgment-Client-Started-At": String(clientStartedAt),
    };
    let response;
    try {
      response = await fetch(apiUrl("/api/rag/query/stream", base), {
        method: "POST",
        headers,
        body: JSON.stringify({ question }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("請求逾時，請稍後再試。", 0, null);
      }
      throw new ApiError(networkErrorMessage(base), 0, error);
    } finally {
      if (timer) window.clearTimeout(timer);
    }
    if (!response.ok) {
      let detail = null;
      try {
        detail = await response.json();
      } catch (error) {
        detail = null;
      }
      const message =
        detail && typeof detail === "object" && detail.detail
          ? String(detail.detail)
          : `伺服器回應 ${response.status}，請稍後再試。`;
      throw new ApiError(message, response.status, detail);
    }
    if (!response.body) {
      throw new ApiError("伺服器沒有回傳可讀取的流程串流。", 0, null);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result = null;
    let streamError = null;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary >= 0) {
          const block = buffer.slice(0, boundary).replace(/\r/g, "");
          buffer = buffer.slice(boundary + 2);
          let event = "message";
          const dataLines = [];
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
          }
          if (dataLines.length) {
            let payload = null;
            try {
              payload = JSON.parse(dataLines.join("\n"));
            } catch (error) {
              payload = null;
            }
            if (payload) {
              if (event === "step" && typeof onStep === "function") {
                try {
                  onStep(payload);
                } catch (error) {
                  /* process rendering must not break the request */
                }
              } else if (event === "partial") {
                if (typeof onPartial === "function") {
                  try {
                    onPartial(payload);
                  } catch (error) {
                    /* partial rendering must not break the request */
                  }
                }
              } else if (event === "token") {
                if (typeof onToken === "function") {
                  try {
                    onToken(String(payload.text || ""));
                  } catch (error) {
                    /* token rendering must not break the request */
                  }
                }
              } else if (event === "token_reset") {
                if (typeof onTokenReset === "function") {
                  try {
                    onTokenReset();
                  } catch (error) {
                    /* token reset must not break the request */
                  }
                }
              } else if (event === "result") {
                result = payload;
              } else if (event === "error") {
                streamError = new ApiError(
                  payload.message || payload.detail || "RAG 流程失敗。",
                  0,
                  payload,
                );
              }
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch (error) {
        /* already closed */
      }
      if (timer) window.clearTimeout(timer);
    }

    if (streamError) throw streamError;
    if (!result) {
      throw new ApiError("流程串流結束，但沒有收到最終回答。", 0, null);
    }
    const totalMs = Math.round(performance.now() - clientStarted);
    reportClientTiming({
      request_id: requestId,
      route: `${window.location.pathname}${window.location.hash || ""}`,
      total_ms: totalMs,
      render_ms: 0,
      status: "success",
    });
    return result;
  },
};
