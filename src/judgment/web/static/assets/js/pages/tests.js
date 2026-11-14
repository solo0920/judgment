import {
  DEFAULT_FILE_API_BASE,
  api,
  apiBaseLabel,
  apiUrl,
  getApiBase,
  getApiBaseSource,
  isValidApiBase,
  needsApiConfiguration,
  normalizeApiBase,
  setApiBase,
  subscribeRefresh,
  testApiConnection,
} from "../api.js";
import { escapeHtml, formatDateTime, icon, setBusy, toast } from "../utils.js";
import { renderTestFlowPanel } from "./performance.js";

const API_SOURCE_LABELS = {
  query: "網址 ?api= 參數",
  storage: "瀏覽器儲存值",
  config: "config.js 預設值",
  "file-default": "file:// 預設值",
  "same-origin": "同源（目前網域）",
};

function modelGroup(label, models) {
  const items = Array.isArray(models) ? models : [];
  return `<div class="tests-model-group">
    <span class="tests-model-label">${escapeHtml(label)}</span>
    <div class="tests-model-chips">${
      items.length
        ? items
            .map(
              (model) =>
                `<span class="chip chip-mono">${escapeHtml(model)}</span>`,
            )
            .join("")
        : `<span class="tests-model-empty">未偵測到模型</span>`
    }</div>
  </div>`;
}

function llmCapabilityRow(item) {
  const supports = item?.supports_chat;
  const tone =
    supports === true
      ? "badge-ok"
      : supports === false
        ? "badge-danger"
        : "badge-neutral";
  const label =
    supports === true
      ? "支援 chat"
      : supports === false
        ? "不支援 chat"
        : "未測試";
  const capabilities = (Array.isArray(item?.capabilities)
    ? item.capabilities
    : []
  )
    .map((value) => `<span class="chip chip-mono">${escapeHtml(value)}</span>`)
    .join("");
  return `<div class="tests-llm-row">
    <div class="tests-llm-model">
      <strong class="mono">${escapeHtml(item?.model || "—")}</strong>
      <small>${escapeHtml(item?.detail || "")}</small>
    </div>
    <div class="tests-llm-meta">
      <span class="badge ${tone}">${label}</span>
      ${item?.tested_now ? `<span class="badge badge-info">本次新測</span>` : ""}
      ${capabilities}
      <span class="tests-llm-time">${
        item?.tested_at
          ? `測試於 ${escapeHtml(formatDateTime(item.tested_at))}`
          : "尚無測試紀錄"
      }</span>
    </div>
  </div>`;
}

function llmCapabilityMarkup(payload) {
  const models = Array.isArray(payload?.models) ? payload.models : [];
  const counts = payload?.counts || {};
  const failures = Array.isArray(payload?.failures) ? payload.failures : [];
  const summary = payload
    ? `<span>Ollama <strong>${counts.available ?? models.length}</strong> 個模型</span>
      <span>支援 chat <strong>${counts.chat ?? 0}</strong></span>
      <span>不支援 <strong>${counts.unsupported ?? 0}</strong></span>
      <span>未測試 <strong>${counts.untested ?? 0}</strong></span>
      <span>本次新測 <strong>${(payload.tested_now || []).length}</strong></span>
      <span class="muted">${escapeHtml(payload.detail || "")}</span>`
    : `<span>正在讀取 Ollama 模型清單…</span>`;
  return {
    summary,
    list: models.length
      ? models.map(llmCapabilityRow).join("")
      : `<div class="tests-llm-empty">尚無模型資料；請確認 Ollama 已啟動並執行 LLM 服務測試。</div>`,
    failures: failures.length
      ? `<div class="tests-llm-failures">${failures
          .map(
            (item) =>
              `<span><strong class="mono">${escapeHtml(
                item.model || "—",
              )}</strong> ${escapeHtml(item.detail || "測試失敗")}</span>`,
          )
          .join("")}</div>`
      : "",
  };
}

function flowSignature(run, runs, selectedRunId) {
  return JSON.stringify({
    selected: selectedRunId,
    runs: (runs || []).map((item) => `${item.run_id}:${item.status}`),
    run: run
      ? {
          run_id: run.run_id,
          status: run.status,
          progress: run.progress,
          total_ms: run.total_ms,
          steps: (run.steps || []).map(
            (step) => `${step.stage}:${step.model}:${step.status}:${step.progress}:${step.duration_ms}`,
          ),
        }
      : null,
  });
}

export async function render(root, ctx, { embedded = false } = {}) {
  let disposed = false;
  let testMode = false;
  let testModels = { embedding: [], llm: [] };
  let testModeBusy = false;
  let llmCapabilities = null;
  let llmTestBusy = false;
  let testRun = null;
  let testRuns = [];
  let selectedRunId = "";
  let flowStream = null;
  let lastFlowSignature = "";

  const actionsMarkup = `<div class="page-actions">
      <span class="badge badge-neutral badge-mono" id="tests-mode-badge">讀取中</span>
      <button class="btn btn-secondary" type="button" id="tests-refresh">
        ${icon("refresh", 15)}<span>重新整理</span>
      </button>
    </div>`;
  const headerMarkup = embedded
    ? `<div class="tests-embed-head">
        <div>
          <div class="eyebrow">SYSTEM TEST</div>
          <div class="tests-embed-title">系統測試</div>
          <div class="tests-embed-copy">後端 API 連線、測試模式與多模型測試 Flow。測試模式開啟後，下一次 RAG 提問會依序執行所有可用 embedding 與具備 chat 能力的 LLM 模型。</div>
        </div>
        ${actionsMarkup}
      </div>`
    : `<div class="page-header">
      <div>
        <div class="eyebrow">SYSTEM TEST</div>
        <h1 class="page-title">系統測試</h1>
        <p class="page-subtitle">合併後端 API 連線、測試模式與多模型測試 Flow。
          測試模式開啟後，下一次 RAG 提問會依序執行所有可用 embedding 與具備 chat 能力的 LLM 模型，且不設逾時。</p>
      </div>
      ${actionsMarkup}
    </div>`;

  root.innerHTML = `<section class="${
    embedded ? "tests-page tests-page-embedded" : "page tests-page"
  }">
    ${headerMarkup}

    <div class="tests-grid">
      <section class="card tests-card tests-api-card" aria-labelledby="tests-api-title">
        <form class="api-dialog-form tests-api-form" id="tests-api-form" novalidate>
          <div class="api-dialog-head">
            <span class="api-dialog-icon" aria-hidden="true">${icon("link", 17)}</span>
            <div class="api-dialog-heading">
              <div class="api-dialog-title" id="tests-api-title">後端 API 連線</div>
              <p class="api-dialog-copy">前端是純靜態檔案，可從本機檔案、Cloudflare Pages 或任何靜態主機開啟，再連到 FastAPI 後端。Cloudflare 部署請使用 cloudflared 提供的 HTTPS 位址。</p>
            </div>
          </div>
          <label class="field" for="tests-api-input">
            <span class="field-label">API Base URL <span class="field-tag">runtime</span></span>
            <input class="input mono" id="tests-api-input" name="api-base" type="url"
              inputmode="url" autocomplete="url" spellcheck="false"
              placeholder="http://127.0.0.1:9200" />
            <span class="field-help">留空代表同源；以 file:// 開啟時留空會使用 http://127.0.0.1:9200。</span>
          </label>
          <div class="api-dialog-preview" id="tests-api-preview"></div>
          <div class="api-dialog-status" id="tests-api-status" role="status"></div>
          <div class="api-dialog-note" id="tests-api-note"></div>
          <div class="api-dialog-actions">
            <button class="btn btn-secondary btn-sm" type="button" id="tests-api-test">
              ${icon("activity", 14)}<span>測試連線</span>
            </button>
            <span class="grow"></span>
            <button class="btn btn-ghost btn-sm" type="button" id="tests-api-reset">恢復預設</button>
            <button class="btn btn-primary btn-sm" type="submit" id="tests-api-save">
              ${icon("check", 14)}<span>儲存並重新載入</span>
            </button>
          </div>
        </form>
      </section>

      <section class="card tests-card" aria-labelledby="tests-mode-title">
        <div class="tests-card-head">
          <span class="tests-card-icon">${icon("terminal", 16)}</span>
          <div>
            <div class="tests-card-title" id="tests-mode-title">測試模式</div>
            <div class="tests-card-copy">開啟後，下一次 RAG 提問會依序執行所有可用 embedding 與具備 chat 能力的 LLM 模型，結果寫入測試 Flow。</div>
          </div>
        </div>
        <div class="tests-mode-row">
          <button class="header-power test-mode-switch" id="tests-mode-toggle"
            type="button" role="switch" aria-checked="false"
            aria-label="測試模式開關" title="測試模式" disabled>
            <span class="header-power-label">…</span>
            <span class="header-power-knob" aria-hidden="true"></span>
          </button>
          <div class="tests-mode-summary" id="tests-mode-summary">正在讀取測試模式…</div>
        </div>
        <div class="tests-models" id="tests-mode-models"></div>
        <div class="tests-actions">
          <a class="btn btn-primary btn-sm" href="#/rag">
            ${icon("sparkles", 13)}<span>前往 RAG 提問</span>
          </a>
          <a class="btn btn-secondary btn-sm" href="#/performance">
            ${icon("activity", 13)}<span>效能 Flow</span>
          </a>
        </div>
        <div class="tests-status" id="tests-mode-status" role="status"></div>
      </section>
    </div>

    <section class="card tests-card tests-llm-card" aria-labelledby="tests-llm-title">
      <div class="tests-card-head">
        <span class="tests-card-icon">${icon("brain", 16)}</span>
        <div>
          <div class="tests-card-title" id="tests-llm-title">LLM 服務測試</div>
          <div class="tests-card-copy">檢查 Ollama 上每個模型是否支援 chat，並把結果寫入能力清單；已有測試紀錄的模型不會重測。LLM 效能評估只會納入支援 chat 的模型。</div>
        </div>
      </div>
      <div class="tests-llm-head">
        <div class="tests-llm-summary" id="tests-llm-summary">正在讀取 Ollama 模型清單…</div>
        <button class="btn btn-primary btn-sm" type="button" id="tests-llm-test">
          ${icon("activity", 14)}<span>執行 LLM 服務測試</span>
        </button>
      </div>
      <div class="tests-llm-list" id="tests-llm-list"></div>
      <div id="tests-llm-failures"></div>
      <div class="tests-status" id="tests-llm-status" role="status"></div>
    </section>

    <div id="tests-flow"></div>
  </section>`;

  const badge = root.querySelector("#tests-mode-badge");
  const modeToggle = root.querySelector("#tests-mode-toggle");
  const modeSummary = root.querySelector("#tests-mode-summary");
  const modeModels = root.querySelector("#tests-mode-models");
  const modeStatus = root.querySelector("#tests-mode-status");
  const apiForm = root.querySelector("#tests-api-form");
  const apiInput = root.querySelector("#tests-api-input");
  const apiPreview = root.querySelector("#tests-api-preview");
  const apiStatus = root.querySelector("#tests-api-status");
  const apiNote = root.querySelector("#tests-api-note");
  const apiTest = root.querySelector("#tests-api-test");
  const apiReset = root.querySelector("#tests-api-reset");
  const apiSave = root.querySelector("#tests-api-save");
  const refreshButton = root.querySelector("#tests-refresh");
  const flowBox = root.querySelector("#tests-flow");
  const llmSummary = root.querySelector("#tests-llm-summary");
  const llmList = root.querySelector("#tests-llm-list");
  const llmFailures = root.querySelector("#tests-llm-failures");
  const llmStatus = root.querySelector("#tests-llm-status");
  const llmTest = root.querySelector("#tests-llm-test");

  const setStatus = (element, text, tone = "") => {
    if (!element) return;
    element.textContent = text;
    element.className = `tests-status${tone ? ` is-${tone}` : ""}`;
  };

  const setApiStatus = (text, tone = "") => {
    if (!apiStatus) return;
    apiStatus.textContent = text;
    apiStatus.className = `api-dialog-status${tone ? ` is-${tone}` : ""}`;
  };

  const queryLocked = () => getApiBaseSource() === "query";
  const candidateBase = () => {
    const value = normalizeApiBase(apiInput.value);
    if (value) return value;
    return window.location.protocol === "file:" ? DEFAULT_FILE_API_BASE : "";
  };

  const updatePreview = () => {
    const candidate = candidateBase();
    const current = getApiBase();
    const sourceLabel =
      API_SOURCE_LABELS[getApiBaseSource()] || getApiBaseSource() || "同源";
    apiPreview.innerHTML = `目前生效：<strong>${escapeHtml(
      apiBaseLabel(current),
    )}</strong>${current ? `（${escapeHtml(sourceLabel)}）` : ""}<br />此位址的健康檢查：${escapeHtml(
      apiUrl("/api/health", candidate),
    )}`;
  };

  const updateNote = () => {
    const source = getApiBaseSource();
    let text = `目前來源：${API_SOURCE_LABELS[source] || source || "同源"}。優先順序為 ?api= → 瀏覽器儲存值 → config.js → 同源。`;
    let tone = "";
    if (source === "query") {
      tone = "is-warn";
      text =
        "此頁由網址的 ?api= 參數指定後端位址，具有最高優先順序。儲存或恢復預設在此頁不會生效；請先移除網址中的 api 參數。";
    } else if (needsApiConfiguration()) {
      tone = "is-warn";
      text =
        "此頁不是從 localhost 開啟，且尚未設定後端 API。請填入 cloudflared 的 https:// 位址，或部署時在 config.js 指定 apiBase；HTTP 位址會被 HTTPS 頁面阻擋。";
    } else if (source === "file-default" || window.location.protocol === "file:") {
      text =
        "以 file:// 直接開啟時，預設連到 http://127.0.0.1:9200。若後端使用其他連接埠，請在此修改並儲存。";
    }
    apiNote.textContent = text;
    apiNote.className = `api-dialog-note${tone ? ` ${tone}` : ""}`;
    const locked = source === "query";
    apiSave.disabled = locked;
    apiReset.disabled = locked;
    apiInput.readOnly = locked;
  };

  const validateApi = () => {
    if (!isValidApiBase(apiInput.value)) {
      setApiStatus(
        "API 位址格式不正確，請輸入 http:// 或 https:// 開頭的網址。",
        "error",
      );
      apiInput.focus();
      return null;
    }
    const candidate = candidateBase();
    if (
      window.location.protocol === "https:" &&
      /^http:\/\//i.test(candidate) &&
      !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(candidate)
    ) {
      setApiStatus(
        "HTTPS 頁面無法連線到 HTTP API（mixed content）。請改用 cloudflared 提供的 https:// 位址。",
        "error",
      );
      apiInput.focus();
      return null;
    }
    return candidate;
  };

  const syncApiForm = () => {
    apiInput.value = getApiBase();
    updatePreview();
    updateNote();
    setApiStatus("可先測試連線，儲存後頁面會重新載入。");
  };

  const paintTestMode = () => {
    const embedding = Array.isArray(testModels.embedding)
      ? testModels.embedding.length
      : 0;
    const llm = Array.isArray(testModels.llm) ? testModels.llm.length : 0;
    if (badge) {
      badge.textContent = testModeBusy
        ? "切換中…"
        : testMode
          ? "測試模式 ON"
          : "測試模式 OFF";
      badge.className = `badge badge-mono ${
        testModeBusy ? "badge-info" : testMode ? "badge-warn" : "badge-neutral"
      }`;
    }
    if (modeToggle) {
      modeToggle.disabled = testModeBusy;
      modeToggle.classList.toggle("is-on", testMode);
      modeToggle.classList.toggle("is-off", !testMode && !testModeBusy);
      modeToggle.classList.toggle("is-busy", testModeBusy);
      modeToggle.setAttribute("aria-checked", testMode ? "true" : "false");
      modeToggle.setAttribute("aria-busy", testModeBusy ? "true" : "false");
      modeToggle.setAttribute(
        "aria-label",
        testModeBusy
          ? "正在切換測試模式"
          : testMode
            ? "測試模式已開啟，點擊關閉"
            : "測試模式已關閉，點擊開啟",
      );
      modeToggle.title = testModeBusy
        ? "正在切換測試模式…"
        : testMode
          ? "測試模式 ON · 點擊關閉"
          : "測試模式 OFF · 點擊開啟";
      const label = modeToggle.querySelector(".header-power-label");
      if (label) label.textContent = testModeBusy ? "…" : testMode ? "ON" : "OFF";
    }
    if (modeSummary) {
      modeSummary.textContent = testMode
        ? `每次提問會依序執行 ${embedding} 個 embedding 與 ${llm} 個 LLM 模型。`
        : "目前使用快速模式：單一 embedding 與 LLM。";
    }
    if (modeModels) {
      modeModels.innerHTML =
        modelGroup("Embedding", testModels.embedding) +
        modelGroup("LLM", testModels.llm);
    }
  };

  const loadTestMode = async () => {
    try {
      const state = await api.testMode();
      if (disposed) return;
      testMode = Boolean(state.enabled);
      testModels = state.models || { embedding: [], llm: [] };
      setStatus(modeStatus, "");
    } catch (error) {
      if (disposed) return;
      testMode = false;
      testModels = { embedding: [], llm: [] };
      setStatus(
        modeStatus,
        error.message || "無法讀取測試模式，請確認後端 API。",
        "error",
      );
    }
    if (!disposed) paintTestMode();
  };

  const toggleTestMode = async () => {
    if (testModeBusy) return;
    const nextEnabled = !testMode;
    testModeBusy = true;
    paintTestMode();
    setStatus(
      modeStatus,
      nextEnabled ? "正在開啟測試模式…" : "正在關閉測試模式…",
    );
    try {
      const state = await api.setTestMode(nextEnabled);
      if (disposed) return;
      testMode = Boolean(state.enabled);
      testModels = state.models || { embedding: [], llm: [] };
      window.dispatchEvent(
        new CustomEvent("judgment:test-mode", {
          detail: { enabled: testMode, models: testModels },
        }),
      );
      const embedding = testModels.embedding?.length || 0;
      const llm = testModels.llm?.length || 0;
      setStatus(
        modeStatus,
        testMode
          ? `測試模式已開啟：下次 RAG 提問會執行 ${embedding} 個 embedding 與 ${llm} 個 LLM 模型。`
          : "測試模式已關閉。",
        "ok",
      );
      toast(
        testMode
          ? `測試模式已開啟：${embedding} 個 embedding、${llm} 個 LLM。`
          : "測試模式已關閉。",
        testMode ? "ok" : "info",
        6000,
      );
      await refreshFlow();
    } catch (error) {
      if (!disposed) {
        setStatus(
          modeStatus,
          error.message || "測試模式切換失敗。",
          "error",
        );
        toast(error.message || "測試模式切換失敗。", "danger", 6000);
      }
    } finally {
      testModeBusy = false;
      if (!disposed) paintTestMode();
    }
  };

  const paintLlmCapabilities = () => {
    const view = llmCapabilityMarkup(llmCapabilities);
    if (llmSummary) llmSummary.innerHTML = view.summary;
    if (llmList) llmList.innerHTML = view.list;
    if (llmFailures) llmFailures.innerHTML = view.failures;
    if (llmTest) {
      llmTest.disabled = llmTestBusy;
      llmTest.setAttribute("aria-busy", llmTestBusy ? "true" : "false");
      const label = llmTest.querySelector("span");
      if (label) {
        label.textContent = llmTestBusy
          ? "測試中…"
          : "執行 LLM 服務測試";
      }
    }
  };

  const loadLlmCapabilities = async () => {
    try {
      const data = await api.llmModels();
      if (disposed) return;
      llmCapabilities = data;
      setStatus(llmStatus, "");
    } catch (error) {
      if (disposed) return;
      llmCapabilities = null;
      setStatus(
        llmStatus,
        error.message || "無法讀取 Ollama 模型清單。",
        "error",
      );
    }
    if (!disposed) paintLlmCapabilities();
  };

  const runLlmServiceTest = async () => {
    if (llmTestBusy) return;
    llmTestBusy = true;
    paintLlmCapabilities();
    setStatus(llmStatus, "正在檢查 Ollama 模型與 chat 能力…");
    try {
      const data = await api.testLlmModels();
      if (disposed) return;
      llmCapabilities = data;
      const tested = data.tested_now?.length || 0;
      const chat = data.chat_models?.length || 0;
      const failures = data.failures?.length || 0;
      setStatus(
        llmStatus,
        `${
          tested
            ? `服務測試完成：本次新測 ${tested} 個模型`
            : "服務測試完成：沒有新模型"
        }，目前 ${chat} 個模型支援 chat${
          failures ? `；${failures} 個模型暫時無法判定，下次會重試` : ""
        }。`,
        failures ? "warn" : "ok",
      );
      toast(
        tested
          ? `LLM 服務測試完成，新增 ${tested} 筆能力紀錄。`
          : "LLM 服務測試完成，沒有新模型需要測試。",
        failures ? "warn" : "ok",
        5000,
      );
      await loadTestMode();
    } catch (error) {
      if (!disposed) {
        setStatus(
          llmStatus,
          error.message || "LLM 服務測試失敗。",
          "error",
        );
        toast(error.message || "LLM 服務測試失敗。", "danger", 6000);
      }
    } finally {
      llmTestBusy = false;
      if (!disposed) paintLlmCapabilities();
    }
  };

  const paintFlow = () => {
    if (!flowBox) return;
    const signature = flowSignature(testRun, testRuns, selectedRunId);
    if (signature === lastFlowSignature) return;
    lastFlowSignature = signature;
    flowBox.innerHTML = renderTestFlowPanel(
      testRun,
      testRuns,
      selectedRunId,
    );
  };

  const loadTestRuns = async () => {
    try {
      const data = await api.testRuns(30);
      if (disposed) return;
      testRuns = Array.isArray(data.runs) ? data.runs : [];
    } catch (error) {
      if (disposed) return;
      testRuns = [];
    }
  };

  const refreshFlow = async (payload = null) => {
    try {
      const data =
        payload ||
        (selectedRunId
          ? await api.testRun(selectedRunId)
          : await api.testRunCurrent());
      if (disposed) return;
      testRun = data.run || null;
      if (
        !selectedRunId &&
        testRun &&
        testRun.status !== "running" &&
        !testRuns.some((item) => item.run_id === testRun.run_id)
      ) {
        await loadTestRuns();
      }
    } catch (error) {
      if (disposed) return;
      testRun = null;
    }
    if (!disposed) paintFlow();
  };

  apiInput?.addEventListener("input", () => {
    updatePreview();
    setApiStatus("尚未測試此位址。");
  });

  apiTest?.addEventListener("click", async () => {
    const candidate = validateApi();
    if (candidate === null) return;
    setBusy(apiTest, true, "測試中…");
    setApiStatus(`正在連線到 ${apiBaseLabel(candidate) || "同源"}…`);
    try {
      const result = await testApiConnection(candidate);
      if (disposed) return;
      setApiStatus(
        `連線成功 · v${result.version} · ${result.duration_ms} ms · GET ${apiUrl(
          "/api/health",
          candidate,
        )}`,
        "ok",
      );
    } catch (error) {
      if (!disposed) {
        setApiStatus(error.message || "連線測試失敗。", "error");
      }
    } finally {
      if (!disposed) setBusy(apiTest, false);
    }
  });

  apiForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (queryLocked()) return;
    const candidate = validateApi();
    if (candidate === null) return;
    setApiBase(candidate);
    toast(`後端 API 已設為 ${apiBaseLabel(candidate)}，重新載入中…`, "ok", 1600);
    window.setTimeout(() => window.location.reload(), 120);
  });

  apiReset?.addEventListener("click", () => {
    if (queryLocked()) return;
    setApiBase("");
    toast("已清除瀏覽器儲存的 API 位址，重新載入中…", "info", 1600);
    window.setTimeout(() => window.location.reload(), 120);
  });

  modeToggle?.addEventListener("click", toggleTestMode);
  llmTest?.addEventListener("click", runLlmServiceTest);

  flowBox?.addEventListener("change", async (event) => {
    if (event.target.id !== "test-run-select") return;
    selectedRunId = String(event.target.value || "");
    await refreshFlow();
  });

  flowBox?.addEventListener("click", async (event) => {
    if (!event.target.closest("#test-flow-refresh")) return;
    selectedRunId = "";
    await loadTestRuns();
    await refreshFlow();
  });

  refreshButton?.addEventListener("click", async () => {
    setBusy(refreshButton, true, "更新中…");
    syncApiForm();
    await Promise.allSettled([
      loadTestMode(),
      loadTestRuns(),
      loadLlmCapabilities(),
    ]);
    if (!disposed) await refreshFlow();
    if (!disposed) {
      setBusy(refreshButton, false);
      toast("系統測試狀態已更新。", "ok", 2200);
    }
  });

  const onTestModeChange = (event) => {
    testMode = Boolean(event.detail?.enabled);
    testModels = event.detail?.models || { embedding: [], llm: [] };
    paintTestMode();
  };
  window.addEventListener("judgment:test-mode", onTestModeChange);

  syncApiForm();
  paintTestMode();
  paintLlmCapabilities();
  await Promise.allSettled([
    loadTestMode(),
    loadTestRuns(),
    loadLlmCapabilities(),
  ]);
  await refreshFlow();

  flowStream = subscribeRefresh("test-runs", async (_topic, payload) => {
    if (disposed || document.hidden || selectedRunId) return;
    await refreshFlow(payload?.snapshot || null);
  });

  if (!embedded && typeof ctx?.setTitle === "function") {
    ctx.setTitle("系統測試 · Judgment RAG Console");
  }

  return () => {
    disposed = true;
    if (flowStream) flowStream();
    window.removeEventListener("judgment:test-mode", onTestModeChange);
  };
}
