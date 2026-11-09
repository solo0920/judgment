import { api } from "../api.js";
import {
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  notice,
  toast,
} from "../utils.js";

const STATUS_META = {
  running: ["執行中", "badge-info"],
  stopping: ["停止中", "badge-warn"],
  success: ["完成", "badge-ok"],
  interrupted: ["已中止", "badge-warn"],
  failed: ["失敗", "badge-danger"],
  pending: ["等待", "badge-neutral"],
  skipped: ["略過", "badge-neutral"],
};

const ACTIVE_STATUSES = new Set(["running", "stopping"]);

function statusBadge(status) {
  const [label, badge] = STATUS_META[status] || [status || "未知", "badge-neutral"];
  return `<span class="badge ${badge}">${escapeHtml(label)}</span>`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function defaultRunLabel(date = new Date()) {
  const stamp = date instanceof Date ? date : new Date(date);
  return `RAG Benchmark ${stamp.getFullYear()}-${pad2(stamp.getMonth() + 1)}-${pad2(stamp.getDate())} ${pad2(stamp.getHours())}:${pad2(stamp.getMinutes())}`;
}

function isActiveStatus(status) {
  return ACTIVE_STATUSES.has(status);
}

function num(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return number.toFixed(3);
}

function percent(value) {
  if (value === null || value === undefined) return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${(number * 100).toFixed(1)}%`;
}

function metricCard(label, value, note = "") {
  return `<div class="bench-metric">
    <span class="summary-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value))}</strong>
    ${note ? `<small>${escapeHtml(note)}</small>` : ""}
  </div>`;
}

function scoreSummary(summary = {}) {
  const components = summary.score_components || summary;
  return `<div class="bench-metrics">
    ${metricCard("Law Recall", percent(components.law_recall))}
    ${metricCard("Article Recall", percent(components.article_recall))}
    ${metricCard("Citation Valid", percent(components.citation_valid_rate))}
    ${metricCard("Judge", num(components.judge_overall))}
    ${metricCard("Human", num(components.human_overall))}
    ${metricCard("p50", formatDuration(summary.duration_p50_ms))}
    ${metricCard("p95", formatDuration(summary.duration_p95_ms))}
    ${metricCard("Success", `${formatNumber(summary.success || 0)} / ${formatNumber(summary.total || 0)}`)}
  </div>`;
}

function stageSummaryMarkup(summary = {}) {
  const stages = Object.entries(summary.stages || {})
    .filter(([key]) => key.startsWith("rag."))
    .slice(0, 8);
  if (!stages.length) return "";
  return `<div class="bench-stage-grid">${stages
    .map(([key, value]) => `<div class="bench-stage">
      <span>${escapeHtml(key.replace(/^rag\./, ""))}</span>
      <strong>${formatDuration(value.p50_ms)}</strong>
      <small>p95 ${formatDuration(value.p95_ms)}</small>
    </div>`)
    .join("")}</div>`;
}

function runScoresMarkup(run) {
  const summary = run.summary || {};
  const components = summary.score_components || {};
  return `<span>Law ${percent(components.law_recall)}</span>
    <span>Article ${percent(components.article_recall)}</span>
    <span>Judge ${num(components.judge_overall)}</span>
    <span>p95 ${formatDuration(summary.duration_p95_ms)}</span>`;
}

function runScoresSignature(run) {
  const summary = run.summary || {};
  const components = summary.score_components || {};
  return JSON.stringify([
    components.law_recall,
    components.article_recall,
    components.judge_overall,
    summary.duration_p95_ms,
  ]);
}

function runRow(run, selected) {
  const config = run.config || {};
  return `<button class="bench-run ${selected ? "is-active" : ""}" type="button" data-bench-action="open-run" data-run-id="${escapeHtml(run.run_id)}">
    <span class="bench-run-head">
      <strong data-bench-slot="run-label">${escapeHtml(run.label || "RAG Benchmark")}</strong>
      <span data-bench-slot="run-status" data-status="${escapeHtml(run.status || "")}">${statusBadge(run.status)}</span>
      <span class="mono">${escapeHtml(run.run_id.slice(0, 10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${escapeHtml(formatDateTime(run.started_at))}</span>
      <span data-bench-slot="run-completed">${formatNumber(run.completed_cases || 0)} / ${formatNumber(run.total_cases || 0)} 題</span>
      <span>${escapeHtml(config.llm_model || "—")}</span>
      <span>v${run.suite_version || 1}</span>
    </span>
    <span class="bench-run-scores" data-bench-slot="run-scores" data-signature="${escapeHtml(runScoresSignature(run))}">${runScoresMarkup(run)}</span>
  </button>`;
}

function caseInnerMarkup(caseItem, history = []) {
  const metrics = caseItem.metrics || {};
  const judge = caseItem.judge || {};
  const human = caseItem.human_review || {};
  const scores = metrics.scores || {};
  const stage = caseItem.stage_ms || {};
  const stageItems = Object.entries(stage)
    .filter(([key]) => key.startsWith("rag."))
    .map(([key, value]) => `<span class="chip">${escapeHtml(key)} ${formatDuration(value)}</span>`)
    .join("");
  const lawSources = (caseItem.law_sources || [])
    .map((source) => `<span class="chip">${escapeHtml(source.law_name || "法規")} ${formatNumber((source.articles || []).length)} 條</span>`)
    .join("");
  return `<summary>
      <span class="bench-case-question">${escapeHtml(caseItem.question)}</span>
      ${statusBadge(caseItem.status)}
      <span class="bench-case-time">${formatDuration(caseItem.duration_ms)}</span>
      <span class="bench-case-score">Det ${num(scores.deterministic)} · Judge ${num(scores.judge)} · Human ${num(scores.human)}</span>
    </summary>
    <div class="bench-case-body">
      <div class="bench-case-meta">
        <span class="mono">fingerprint ${escapeHtml((caseItem.fingerprint || "").slice(0, 20))}</span>
        <span>item #${caseItem.item_id} · v${caseItem.item_version}</span>
        <button class="btn btn-ghost btn-sm" type="button" data-bench-action="fingerprint-history" data-fingerprint="${escapeHtml(caseItem.fingerprint || "")}">${icon("history", 13)}<span>同題歷史</span></button>
      </div>
      <div class="bench-case-stages">${stageItems || "<span class=\"qb-muted\">沒有 stage timing</span>"}</div>
      <div class="bench-case-metrics">
        <span>Law recall ${percent(metrics.law_recall)}</span>
        <span>Article recall ${percent(metrics.article_recall)}</span>
        <span>Citation ${metrics.citation_valid ? "valid" : "invalid"}</span>
        <span>Refusal ${metrics.refusal_correct === null ? "—" : metrics.refusal_correct ? "correct" : "wrong"}</span>
      </div>
      <div class="chips">${lawSources || "<span class=\"qb-muted\">沒有法規來源</span>"}</div>
      <div class="bench-answer"><strong>回答</strong><p>${escapeHtml(caseItem.answer || "—")}</p></div>
      <div class="bench-judge"><strong>LLM judge</strong><p>${escapeHtml(judge.rationale || judge.reason || "—")}</p><span>${[
        ["correctness", judge.correctness],
        ["grounding", judge.grounding],
        ["citation", judge.citation],
        ["clarity", judge.clarity],
        ["overall", judge.overall],
      ].map(([key, value]) => `${key} ${value ?? "—"}`).join(" · ")}</span></div>
      <form class="bench-human-form" data-bench-form="human" data-result-id="${caseItem.id}">
        <div class="bench-human-grid">
          ${[
            ["correctness", "正確性", human.scores?.correctness ?? 4],
            ["grounding", "有據性", human.scores?.grounding ?? 4],
            ["citation", "引用", human.scores?.citation ?? 4],
            ["clarity", "清楚", human.scores?.clarity ?? 4],
            ["overall", "整體", human.overall ?? 4],
          ].map(([key, label, value]) => `<label class="field"><span class="field-label">${label} <span class="field-tag">1–5</span></span><input class="input" type="number" min="1" max="5" name="score_${key}" value="${escapeHtml(String(value))}" /></label>`).join("")}
        </div>
        <label class="field"><span class="field-label">人工批注</span><input class="input" name="comment" value="${escapeHtml(human.comment || "")}" placeholder="回答品質、引用或事實錯誤" /></label>
        <button class="btn btn-secondary btn-sm" type="submit">${icon("check", 13)}<span>儲存人工評分</span></button>
      </form>
      ${
        history.length
          ? `<div class="bench-history"><strong>同題歷史 · ${history.length} 筆</strong>${history.map((item) => `<div class="bench-history-row"><span>${escapeHtml(formatDateTime(item.run?.started_at))}</span><span>${escapeHtml(item.run?.config?.llm_model || "—")}</span><span>Det ${num(item.metrics?.scores?.deterministic)}</span><span>Judge ${num(item.metrics?.scores?.judge)}</span><span>Human ${num(item.metrics?.scores?.human)}</span><span>${formatDuration(item.duration_ms)}</span></div>`).join("")}</div>`
          : ""
      }
    </div>`;
}

function caseSignature(caseItem, history = []) {
  return JSON.stringify([
    caseItem.status,
    caseItem.duration_ms,
    caseItem.answer,
    caseItem.metrics,
    caseItem.judge,
    caseItem.human_review,
    caseItem.stage_ms,
    caseItem.law_sources,
    history.map((item) => [
      item.id,
      item.duration_ms,
      item.metrics?.scores?.human,
      item.finished_at,
    ]),
  ]);
}

function caseMarkup(caseItem, history = []) {
  return `<details class="bench-case" data-result-id="${caseItem.id}">
    ${caseInnerMarkup(caseItem, history)}
  </details>`;
}

function detailActionsMarkup(run) {
  return `${statusBadge(run.status)}
    <span class="mono">${escapeHtml(run.run_id)}</span>
    ${isActiveStatus(run.status) ? `<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${escapeHtml(run.run_id)}">${icon("x", 13)}<span>停止</span></button>` : ""}`;
}

function runDetailMarkup(run, historyMap) {
  const cases = run.cases || [];
  return `<section class="report-card bench-detail" data-run-id="${escapeHtml(run.run_id)}">
    <div class="side-card-head">
      <span class="side-card-title">${icon("activity", 14)}${escapeHtml(run.label || "RAG Benchmark")}</span>
      <div class="qb-actions" data-bench-detail-actions data-signature="${escapeHtml((run.status || "") + ":" + run.run_id)}">
        ${detailActionsMarkup(run)}
      </div>
    </div>
    <div data-bench-detail="metrics">${scoreSummary(run.summary || {})}</div>
    <div data-bench-detail="stages">${stageSummaryMarkup(run.summary || {})}</div>
    <div class="bench-run-config">
      <span><strong>Suite</strong> v${run.suite_version} · ${formatNumber((run.suite_snapshot?.items || []).length)} 題</span>
      <span><strong>Embedding</strong> ${escapeHtml(run.config?.embedding_model || "—")}</span>
      <span><strong>LLM</strong> ${escapeHtml(run.config?.llm_model || "—")}</span>
      <span><strong>Judge</strong> ${escapeHtml(run.config?.judge_model || "—")}</span>
      <span><strong>Index</strong> ${escapeHtml(run.index_version?.physical_collection || "—")}</span>
      <span><strong>Top K</strong> ${escapeHtml(String(run.config?.top_k ?? "—"))}</span>
      <span><strong>Law retrieval</strong> ${run.config?.enable_law_retrieval ? "on" : "off"}</span>
      <span><strong>Config hash</strong> <span class="mono">${escapeHtml((run.config_hash || "").slice(0, 16))}</span></span>
    </div>
    <div class="bench-cases" data-bench-cases>${cases.length ? cases.map((caseItem) => caseMarkup(caseItem, historyMap[caseItem.fingerprint] || [])).join("") : notice({ tone: "info", title: "尚無題目結果", text: "Benchmark 執行後會在這裡顯示逐題結果。" })}</div>
  </section>`;
}

function runActionsMarkup(active) {
  return `<button class="btn btn-primary" type="submit" ${active ? "disabled" : ""}>${icon("play", 14)}<span>${active ? "Benchmark 執行中" : "執行 Benchmark"}</span></button>
    ${active ? `<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${escapeHtml(active.run_id)}">${icon("x", 14)}<span>停止</span></button>` : ""}`;
}

function computeLiveProgress(run, cases = []) {
  const total = Math.max(0, Number(run.total_cases) || 0);
  const completed = Math.max(0, Math.min(total, Number(run.completed_cases) || 0));
  const now = Date.now();
  const startedAt = Date.parse(run.started_at || "");
  const elapsedMs = Number.isFinite(startedAt) ? Math.max(0, now - startedAt) : 0;
  const finishedDurations = (cases || [])
    .filter((item) => ["success", "failed"].includes(item.status))
    .map((item) => Number(item.duration_ms) || 0)
    .filter((value) => value > 0);

  let averageMs = null;
  if (finishedDurations.length) {
    averageMs =
      finishedDurations.reduce((sum, value) => sum + value, 0) /
      finishedDurations.length;
  } else if (completed > 0) {
    const updatedAt = Date.parse(run.updated_at || "");
    const reference = Number.isFinite(updatedAt) ? updatedAt : startedAt;
    if (Number.isFinite(reference) && reference > startedAt) {
      averageMs = (reference - startedAt) / completed;
    } else if (elapsedMs > 0) {
      averageMs = elapsedMs / completed;
    }
  }

  const running = (cases || []).find((item) => item.status === "running") || null;
  let fraction = 0;
  if (completed < total && averageMs && averageMs > 0) {
    const runningStarted = running ? Date.parse(running.started_at || "") : NaN;
    const updatedAt = Date.parse(run.updated_at || "");
    const reference = Number.isFinite(runningStarted) ? runningStarted : updatedAt;
    if (Number.isFinite(reference)) {
      fraction = Math.max(0, Math.min(0.95, (now - reference) / averageMs));
    }
  }

  const effectiveCompleted = Math.min(total, completed + fraction);
  const progress = total > 0 ? Math.max(0, Math.min(100, (effectiveCompleted / total) * 100)) : 0;
  const etaMs =
    averageMs === null
      ? null
      : Math.max(0, total - effectiveCompleted) * averageMs;
  return {
    total,
    completed,
    elapsedMs,
    averageMs,
    progress,
    etaMs,
    ratePerMin: averageMs ? 60000 / averageMs : null,
    running,
  };
}

function etaLabel(etaMs) {
  if (etaMs === null) return "預估剩餘：計算中…";
  if (etaMs < 1000) return "預估剩餘：即將完成";
  return `預估剩餘 ${formatDuration(etaMs)}`;
}

function liveProgressMarkup(run, cases = []) {
  const live = computeLiveProgress(run, cases);
  const stopping = run.status === "stopping";
  return `<div class="bench-progress" data-bench-live data-run-id="${escapeHtml(run.run_id)}">
    <div class="bench-progress-head">
      <span class="bench-progress-state"><span class="spinner" aria-hidden="true"></span><span data-bench-slot="progress-state">${stopping ? "正在停止" : "執行中"}</span></span>
      <strong data-bench-slot="progress-count">${formatNumber(live.completed)} / ${formatNumber(live.total)} 題</strong>
      <span data-bench-slot="progress-percent">${live.progress.toFixed(1)}%</span>
      <span class="bench-progress-eta" data-bench-slot="progress-eta">${etaLabel(live.etaMs)}</span>
      <span data-bench-slot="progress-rate">${live.ratePerMin === null ? "速度：計算中…" : `約 ${live.ratePerMin.toFixed(1)} 題／分`}</span>
    </div>
    <div class="processing-bar processing-bar-lg bench-progress-bar${live.completed === 0 ? " is-waiting" : ""}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${live.progress.toFixed(1)}" data-bench-slot="progress-bar">
      <span class="processing-bar-fill" data-bench-slot="progress-fill" style="width:${live.progress.toFixed(2)}%"></span>
    </div>
    <div class="bench-progress-foot">
      <span data-bench-slot="progress-elapsed">已執行 ${formatDuration(live.elapsedMs)}</span>
      <span data-bench-slot="progress-average">${live.averageMs === null ? "平均：計算中…" : `平均 ${formatDuration(live.averageMs)}／題`}</span>
      <span>即時預估 · 每完成一題校正</span>
    </div>
  </div>`;
}

function benchmarkMarkup(state) {
  const models = state.models?.models || {};
  const suites = state.suites || [];
  const active = findActiveRun(state);
  const selected = state.selectedRun;
  return `<section class="report-card bench-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("brain", 14)}RAG Benchmark</span>
      <span class="badge ${state.indexVersion?.physical_collection ? "badge-ok" : "badge-warn"}">${escapeHtml(state.indexVersion?.physical_collection || "索引未設定")}</span>
    </div>
    <form class="bench-form" data-bench-form="run">
      <div class="bench-form-grid">
        <label class="field"><span class="field-label">Benchmark 題庫</span><select class="select" name="suite_id">${suites.map((suite) => `<option value="${suite.id}" ${state.selectedSuiteId === suite.id ? "selected" : ""}>${escapeHtml(suite.name)} · ${formatNumber(suite.item_count)} 題</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Embedding</span><select class="select" name="embedding_model">${(models.embedding || []).map((model) => `<option value="${escapeHtml(model)}" ${model === state.config.embedding_model ? "selected" : ""}>${escapeHtml(model)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">LLM</span><select class="select" name="llm_model">${(models.llm || []).map((model) => `<option value="${escapeHtml(model)}" ${model === state.config.llm_model ? "selected" : ""}>${escapeHtml(model)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Judge model</span><select class="select" name="judge_model"><option value="">不執行 LLM judge</option>${(models.llm || []).map((model) => `<option value="${escapeHtml(model)}" ${model === state.config.judge_model ? "selected" : ""}>${escapeHtml(model)}</option>`).join("")}</select></label>
        <label class="field"><span class="field-label">Top K</span><input class="input" type="number" min="1" max="20" name="top_k" value="${escapeHtml(String(state.config.top_k || 4))}" /></label>
        <label class="field"><span class="field-label">Score threshold</span><input class="input" type="number" min="0" max="1" step="0.01" name="score_threshold" value="${escapeHtml(String(state.config.score_threshold || 0.35))}" /></label>
        <label class="field"><span class="field-label">重複次數</span><input class="input" type="number" min="1" max="5" name="repeats" value="${escapeHtml(String(state.config.repeats || 1))}" /></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="enable_law_retrieval" ${state.config.enable_law_retrieval ? "checked" : ""} /><span>法規／命令檢索</span></label>
        <label class="checkbox-field bench-check"><input type="checkbox" name="judge_enabled" ${state.config.judge_enabled ? "checked" : ""} /><span>LLM judge</span></label>
      </div>
      <label class="field"><span class="field-label">Run 標籤</span><input class="input" name="label" value="${escapeHtml(state.config.label || defaultRunLabel())}" /></label>
      <div class="qb-actions" data-bench-actions data-signature="${escapeHtml(active ? `${active.run_id}:${active.status}` : "")}">
        ${runActionsMarkup(active)}
      </div>
    </form>
    <div data-bench-live-wrap data-signature="${escapeHtml(active ? `${active.run_id}:${active.status}:${active.total_cases}` : "")}">${active ? liveProgressMarkup(active, casesForRun(state, active)) : ""}</div>
    <div class="bench-runs-head"><span class="summary-label">歷史 Run</span><span class="qb-muted">同題目以 fingerprint 對齊，可展開逐題比較</span></div>
    <div class="bench-runs" data-bench-runs>${(state.runs || []).length ? state.runs.map((run) => runRow(run, selected?.run_id === run.run_id)).join("") : `<div class="qb-empty">尚無 benchmark 執行紀錄。</div>`}</div>
    ${selected ? runDetailMarkup(selected, state.history) : ""}
  </section>`;
}

function findActiveRun(state) {
  const listed = (state.runs || []).find((run) => isActiveStatus(run.status));
  if (!listed) return null;
  if (state.selectedRun && state.selectedRun.run_id === listed.run_id) {
    if (
      state.selectedRun.status &&
      !isActiveStatus(state.selectedRun.status)
    ) {
      return null;
    }
    return {
      ...listed,
      ...state.selectedRun,
      summary: state.selectedRun.summary || listed.summary || {},
      cases: state.selectedRun.cases || [],
    };
  }
  return listed;
}

function casesForRun(state, run) {
  if (!run || !state.selectedRun || state.selectedRun.run_id !== run.run_id) {
    return [];
  }
  return state.selectedRun.cases || [];
}

export function createBenchmarkPanel(root, { onNavigate = null } = {}) {
  const state = {
    models: null,
    suites: [],
    runs: [],
    selectedRun: null,
    selectedSuiteId: null,
    history: {},
    indexVersion: null,
    config: {
      label: defaultRunLabel(),
      embedding_model: "",
      llm_model: "",
      judge_model: "",
      top_k: 4,
      score_threshold: 0.35,
      repeats: 1,
      enable_law_retrieval: true,
      judge_enabled: true,
    },
    labelTouched: false,
    loaded: false,
    referenceLoaded: false,
    loading: false,
    loadAgain: false,
    pendingRefreshAll: false,
    activeRunId: "",
    pollTimer: null,
    tickTimer: null,
    renderSignature: "",
    forcedCaseIds: new Set(),
  };
  const panel = () => root.querySelector("#performance-panel-benchmark");

  const readConfig = (form) => {
    const data = new FormData(form);
    return {
      label: String(data.get("label") || "").trim() || defaultRunLabel(),
      embedding_model: String(data.get("embedding_model") || ""),
      llm_model: String(data.get("llm_model") || ""),
      judge_model: String(data.get("judge_model") || ""),
      top_k: Number(data.get("top_k") || 4),
      score_threshold: Number(data.get("score_threshold") || 0.35),
      repeats: Number(data.get("repeats") || 1),
      enable_law_retrieval: form.elements.enable_law_retrieval?.checked ?? true,
      judge_enabled: form.elements.judge_enabled?.checked ?? true,
    };
  };

  const structuralSignature = () =>
    JSON.stringify({
      selectedRunId: state.selectedRun?.run_id || "",
      references: state.referenceLoaded
        ? [
            state.indexVersion?.physical_collection || "",
            (state.models?.models?.embedding || []).join(","),
            (state.models?.models?.llm || []).join(","),
            (state.suites || []).map(
              (suite) =>
                `${suite.id}:${suite.name}:${suite.item_count}:${suite.version}:${suite.status}`,
            ),
          ]
        : null,
      runs: (state.runs || []).map(
        (run) => `${run.run_id}:${run.label || ""}:${run.suite_version || 1}`,
      ),
    });

  const syncLiveProgress = () => {
    const target = panel();
    const live = target?.querySelector("[data-bench-live]");
    const run = findActiveRun(state);
    if (!live || !run) return;
    const values = computeLiveProgress(run, casesForRun(state, run));
    const setText = (slot, text) => {
      const node = live.querySelector(`[data-bench-slot="${slot}"]`);
      if (node && node.textContent !== text) node.textContent = text;
    };
    setText(
      "progress-count",
      `${formatNumber(values.completed)} / ${formatNumber(values.total)} 題`,
    );
    setText("progress-percent", `${values.progress.toFixed(1)}%`);
    setText("progress-eta", etaLabel(values.etaMs));
    setText(
      "progress-rate",
      values.ratePerMin === null
        ? "速度：計算中…"
        : `約 ${values.ratePerMin.toFixed(1)} 題／分`,
    );
    setText("progress-elapsed", `已執行 ${formatDuration(values.elapsedMs)}`);
    setText(
      "progress-average",
      values.averageMs === null
        ? "平均：計算中…"
        : `平均 ${formatDuration(values.averageMs)}／題`,
    );
    setText("progress-state", run.status === "stopping" ? "正在停止" : "執行中");
    const gate = live.querySelector('[data-bench-slot="progress-bar"]');
    if (gate) {
      gate.setAttribute("aria-valuenow", values.progress.toFixed(1));
      gate.classList.toggle("is-waiting", values.completed === 0);
    }
    const fill = live.querySelector('[data-bench-slot="progress-fill"]');
    if (fill) {
      fill.style.width = `${values.progress.toFixed(2)}%`;
    }
  };

  const updateActions = (target) => {
    const box = target.querySelector("[data-bench-actions]");
    if (!box) return;
    const active = findActiveRun(state);
    const signature = active ? `${active.run_id}:${active.status}` : "";
    if (box.dataset.signature === signature) return;
    box.dataset.signature = signature;
    box.innerHTML = runActionsMarkup(active);
  };

  const updateLiveWrap = (target) => {
    const box = target.querySelector("[data-bench-live-wrap]");
    if (!box) return;
    const active = findActiveRun(state);
    const signature = active
      ? `${active.run_id}:${active.status}:${active.total_cases}`
      : "";
    if (box.dataset.signature === signature) return;
    box.dataset.signature = signature;
    box.innerHTML = active
      ? liveProgressMarkup(active, casesForRun(state, active))
      : "";
  };

  const updateRunRows = (target) => {
    const container = target.querySelector("[data-bench-runs]");
    if (!container) return;
    const runs = state.runs || [];
    const currentNodeIds = [...container.querySelectorAll("[data-run-id]")].map(
      (node) => node.dataset.runId,
    );
    const nextRunIds = runs.map((run) => run.run_id);
    if (currentNodeIds.join("|") !== nextRunIds.join("|")) {
      container.innerHTML = runs.length
        ? runs.map((run) => runRow(run, state.selectedRun?.run_id === run.run_id)).join("")
        : `<div class="qb-empty">尚無 benchmark 執行紀錄。</div>`;
      return;
    }
    for (const run of runs) {
      const row = container.querySelector(`[data-run-id="${run.run_id}"]`);
      if (!row) continue;
      row.classList.toggle("is-active", state.selectedRun?.run_id === run.run_id);
      const label = row.querySelector('[data-bench-slot="run-label"]');
      if (label && label.textContent !== (run.label || "RAG Benchmark")) {
        label.textContent = run.label || "RAG Benchmark";
      }
      const status = row.querySelector('[data-bench-slot="run-status"]');
      if (status && status.dataset.status !== (run.status || "")) {
        status.dataset.status = run.status || "";
        status.innerHTML = statusBadge(run.status);
      }
      const completed = row.querySelector('[data-bench-slot="run-completed"]');
      if (completed) {
        const text = `${formatNumber(run.completed_cases || 0)} / ${formatNumber(run.total_cases || 0)} 題`;
        if (completed.textContent !== text) completed.textContent = text;
      }
      const scores = row.querySelector('[data-bench-slot="run-scores"]');
      const signature = runScoresSignature(run);
      if (scores && scores.dataset.signature !== signature) {
        scores.dataset.signature = signature;
        scores.innerHTML = runScoresMarkup(run);
      }
    }
  };

  const updateDetail = (target) => {
    const run = state.selectedRun;
    if (!run) return;
    const detail = target.querySelector(
      `.bench-detail[data-run-id="${run.run_id}"]`,
    );
    if (!detail) return;
    const actions = detail.querySelector("[data-bench-detail-actions]");
    if (actions) {
      const signature = `${run.status || ""}:${run.run_id}`;
      if (actions.dataset.signature !== signature) {
        actions.dataset.signature = signature;
        actions.innerHTML = detailActionsMarkup(run);
      }
    }
    const metrics = detail.querySelector('[data-bench-detail="metrics"]');
    if (metrics) {
      const signature = JSON.stringify(run.summary || {});
      if (metrics.dataset.signature !== signature) {
        metrics.dataset.signature = signature;
        metrics.innerHTML = scoreSummary(run.summary || {});
      }
    }
    const stages = detail.querySelector('[data-bench-detail="stages"]');
    if (stages) {
      const signature = JSON.stringify((run.summary || {}).stages || {});
      if (stages.dataset.signature !== signature) {
        stages.dataset.signature = signature;
        stages.innerHTML = stageSummaryMarkup(run.summary || {});
      }
    }
    const container = detail.querySelector("[data-bench-cases]");
    if (!container) return;
    const cases = run.cases || [];
    if (!cases.length) return;
    const placeholder = container.querySelector(".notice");
    if (placeholder) placeholder.remove();
    const nodes = new Map(
      [...container.querySelectorAll("details.bench-case")].map((node) => [
        Number(node.dataset.resultId),
        node,
      ]),
    );
    for (const caseItem of cases) {
      const history = state.history[caseItem.fingerprint] || [];
      const signature = caseSignature(caseItem, history);
      let node = nodes.get(Number(caseItem.id));
      if (!node) {
        container.insertAdjacentHTML(
          "beforeend",
          caseMarkup(caseItem, history),
        );
        node = container.lastElementChild;
        if (node) node._benchSignature = signature;
        continue;
      }
      if (node._benchSignature === signature) continue;
      const forced = state.forcedCaseIds.delete(Number(caseItem.id));
      if (!forced && node.contains(document.activeElement)) continue;
      const open = node.open;
      node.innerHTML = caseInnerMarkup(caseItem, history);
      node.open = open;
      node._benchSignature = signature;
    }
  };

  const syncTicker = () => {
    if (findActiveRun(state)) {
      if (!state.tickTimer) {
        state.tickTimer = window.setInterval(syncLiveProgress, 1000);
      }
    } else if (state.tickTimer) {
      window.clearInterval(state.tickTimer);
      state.tickTimer = null;
    }
  };

  const syncDynamic = () => {
    const target = panel();
    if (!target) return;
    updateActions(target);
    updateLiveWrap(target);
    updateRunRows(target);
    updateDetail(target);
    syncLiveProgress();
    syncTicker();
  };

  const syncCaseSignatures = (target) => {
    const run = state.selectedRun;
    if (!run) return;
    const metrics = target.querySelector('[data-bench-detail="metrics"]');
    if (metrics) {
      metrics.dataset.signature = JSON.stringify(run.summary || {});
    }
    const stages = target.querySelector('[data-bench-detail="stages"]');
    if (stages) {
      stages.dataset.signature = JSON.stringify((run.summary || {}).stages || {});
    }
    const container = target.querySelector("[data-bench-cases]");
    if (!container) return;
    const cases = new Map(
      (run.cases || []).map((caseItem) => [Number(caseItem.id), caseItem]),
    );
    for (const node of container.querySelectorAll("details.bench-case")) {
      const caseItem = cases.get(Number(node.dataset.resultId));
      if (!caseItem) continue;
      node._benchSignature = caseSignature(
        caseItem,
        state.history[caseItem.fingerprint] || [],
      );
    }
  };

  const render = (force = false) => {
    const target = panel();
    if (!target) return;
    const signature = structuralSignature();
    if (!force && state.renderSignature === signature) {
      syncDynamic();
      return;
    }
    state.renderSignature = signature;
    state.forcedCaseIds.clear();
    target.innerHTML = benchmarkMarkup(state);
    syncCaseSignatures(target);
    syncDynamic();
  };

  const load = async ({ refreshAll = false } = {}) => {
    if (state.loading) {
      state.loadAgain = true;
      state.pendingRefreshAll = state.pendingRefreshAll || refreshAll;
      return;
    }
    state.loading = true;
    try {
      if (!state.referenceLoaded || refreshAll) {
        const [models, suitesResult] = await Promise.all([
          api.benchmarkModels(),
          api.benchmarkSuites(),
        ]);
        state.models = models;
        state.suites = suitesResult.suites || [];
        state.indexVersion = models.index_version;
        state.referenceLoaded = true;
        if (!state.selectedSuiteId && state.suites.length) {
          state.selectedSuiteId = state.suites[0].id;
        }
        if (!state.config.embedding_model) {
          state.config.embedding_model = models.models?.embedding?.[0] || "";
        }
        if (!state.config.llm_model) {
          state.config.llm_model = models.models?.llm?.[0] || "";
        }
        if (!state.config.judge_model) {
          state.config.judge_model =
            (models.models?.llm || []).find(
              (model) => model !== state.config.llm_model,
            ) || "";
        }
      }
      const runsResult = await api.benchmarkRuns(30);
      state.runs = runsResult.runs || [];
      const previousActiveId = state.activeRunId;
      const active =
        state.runs.find((run) => isActiveStatus(run.status)) || null;
      state.activeRunId = active?.run_id || "";
      let targetId = state.selectedRun?.run_id || "";
      if (!targetId) {
        targetId = active?.run_id || state.runs[0]?.run_id || "";
      }
      const selectedWasActive = Boolean(
        state.selectedRun &&
          previousActiveId &&
          state.selectedRun.run_id === previousActiveId,
      );
      const needsDetail =
        targetId &&
        (!state.selectedRun ||
          state.selectedRun.run_id !== targetId ||
          targetId === active?.run_id ||
          selectedWasActive);
      if (needsDetail) {
        state.selectedRun = await api.benchmarkRun(targetId, true);
      } else if (!targetId) {
        state.selectedRun = null;
      }
      state.loaded = true;
      render();
    } catch (error) {
      if (!state.loaded) {
        state.renderSignature = "";
        const target = panel();
        if (target) {
          target.innerHTML = notice({
            tone: "danger",
            title: "Benchmark 資料讀取失敗",
            text: escapeHtml(error.message || "請稍後再試。"),
          });
        }
      }
    } finally {
      state.loading = false;
      if (state.loadAgain) {
        const nextRefreshAll = state.pendingRefreshAll;
        state.loadAgain = false;
        state.pendingRefreshAll = false;
        load({ refreshAll: nextRefreshAll });
      } else {
        schedulePoll();
      }
    }
  };

  const schedulePoll = () => {
    if (state.pollTimer) window.clearTimeout(state.pollTimer);
    state.pollTimer = null;
    if (!(state.runs || []).some((run) => isActiveStatus(run.status))) {
      return;
    }
    state.pollTimer = window.setTimeout(() => {
      load();
    }, 2500);
  };

  const openRun = async (runId) => {
    try {
      state.selectedRun = await api.benchmarkRun(runId, true);
      render();
      schedulePoll();
    } catch (error) {
      toast(error.message || "讀取 benchmark run 失敗。", "danger");
    }
  };

  const startRun = async (form) => {
    if (!state.labelTouched && form.elements.label) {
      form.elements.label.value = defaultRunLabel();
    }
    const config = readConfig(form);
    state.config = config;
    const suiteId = Number(form.elements.suite_id?.value || 0);
    if (!suiteId) {
      toast("請先選擇 benchmark 題庫。", "warn");
      return;
    }
    try {
      await api.startBenchmarkRun({
        suite_id: suiteId,
        config,
        actor: "anonymous",
      });
      toast("Benchmark 已啟動。", "ok");
      state.selectedRun = null;
      state.config.label = defaultRunLabel();
      state.labelTouched = false;
      await load();
    } catch (error) {
      toast(error.message || "Benchmark 啟動失敗。", "danger", 8000);
    }
  };

  const stopRun = async (runId) => {
    try {
      await api.stopBenchmarkRun(runId);
      toast("已送出停止訊號。", "info");
      await load();
    } catch (error) {
      toast(error.message || "停止失敗。", "danger");
    }
  };

  const saveHuman = async (form) => {
    const resultId = Number(form.dataset.resultId || 0);
    const data = new FormData(form);
    const scores = {};
    for (const key of ["correctness", "grounding", "citation", "clarity", "overall"]) {
      const value = Number(data.get(`score_${key}`));
      if (Number.isFinite(value)) scores[key] = value;
    }
    try {
      await api.reviewBenchmarkResult(resultId, {
        reviewer: "anonymous",
        scores,
        comment: String(data.get("comment") || ""),
      });
      toast("人工評分已儲存。", "ok");
      if (state.selectedRun) {
        state.selectedRun = await api.benchmarkRun(
          state.selectedRun.run_id,
          true,
        );
        state.forcedCaseIds.add(resultId);
      }
      render();
    } catch (error) {
      toast(error.message || "人工評分儲存失敗。", "danger");
    }
  };

  const loadHistory = async (fingerprint) => {
    if (!fingerprint) return;
    try {
      const result = await api.benchmarkFingerprintHistory(fingerprint, 50);
      state.history[fingerprint] = result.cases || [];
      const run = state.selectedRun;
      const target = panel();
      if (!run || !target) return;
      const cases = (run.cases || []).filter(
        (caseItem) => caseItem.fingerprint === fingerprint,
      );
      for (const caseItem of cases) {
        const node = target.querySelector(
          `details.bench-case[data-result-id="${caseItem.id}"]`,
        );
        if (!node) continue;
        const open = node.open;
        node.innerHTML = caseInnerMarkup(caseItem, state.history[fingerprint]);
        node.open = open;
        node._benchSignature = caseSignature(
          caseItem,
          state.history[fingerprint],
        );
      }
    } catch (error) {
      toast(error.message || "同題歷史讀取失敗。", "danger");
    }
  };

  const onClick = async (event) => {
    const button = event.target.closest("[data-bench-action]");
    if (!button) return;
    const action = button.dataset.benchAction;
    if (action === "open-run") await openRun(button.dataset.runId || "");
    else if (action === "stop") await stopRun(button.dataset.runId || "");
    else if (action === "fingerprint-history") {
      await loadHistory(button.dataset.fingerprint || "");
    }
  };

  const onSubmit = async (event) => {
    const form = event.target.closest("[data-bench-form]");
    if (!form) return;
    event.preventDefault();
    if (form.dataset.benchForm === "run") await startRun(form);
    else if (form.dataset.benchForm === "human") await saveHuman(form);
  };

  const syncFormState = (form) => {
    if (!form) return;
    if (form.elements.label && form.elements.label.value !== state.config.label) {
      state.labelTouched = true;
    }
    state.config = readConfig(form);
    if (form.elements.suite_id) {
      state.selectedSuiteId =
        Number(form.elements.suite_id.value) || state.selectedSuiteId;
    }
  };

  const onFormInput = (event) => {
    const form = event.target.closest('[data-bench-form="run"]');
    if (!form) return;
    syncFormState(form);
  };

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  root.addEventListener("input", onFormInput);
  root.addEventListener("change", onFormInput);

  return {
    show() {
      if (onNavigate) onNavigate("benchmark");
      if (!state.labelTouched) {
        state.config.label = defaultRunLabel();
        const input = panel()?.querySelector('input[name="label"]');
        if (input) input.value = state.config.label;
      }
      load({ refreshAll: !state.referenceLoaded });
    },
    refresh() {
      return load({ refreshAll: true });
    },
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", onSubmit);
      root.removeEventListener("input", onFormInput);
      root.removeEventListener("change", onFormInput);
      if (state.pollTimer) window.clearTimeout(state.pollTimer);
      if (state.tickTimer) window.clearInterval(state.tickTimer);
    },
  };
}
