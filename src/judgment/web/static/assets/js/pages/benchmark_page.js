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

function statusBadge(status) {
  const [label, badge] = STATUS_META[status] || [status || "未知", "badge-neutral"];
  return `<span class="badge ${badge}">${escapeHtml(label)}</span>`;
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

function runRow(run, selected) {
  const summary = run.summary || {};
  const config = run.config || {};
  return `<button class="bench-run ${selected ? "is-active" : ""}" type="button" data-bench-action="open-run" data-run-id="${escapeHtml(run.run_id)}">
    <span class="bench-run-head">
      <strong>${escapeHtml(run.label || "RAG Benchmark")}</strong>
      ${statusBadge(run.status)}
      <span class="mono">${escapeHtml(run.run_id.slice(0, 10))}</span>
    </span>
    <span class="bench-run-meta">
      <span>${escapeHtml(formatDateTime(run.started_at))}</span>
      <span>${formatNumber(run.completed_cases || 0)} / ${formatNumber(run.total_cases || 0)} 題</span>
      <span>${escapeHtml(config.llm_model || "—")}</span>
      <span>v${run.suite_version || 1}</span>
    </span>
    <span class="bench-run-scores">
      <span>Law ${percent((summary.score_components || {}).law_recall)}</span>
      <span>Article ${percent((summary.score_components || {}).article_recall)}</span>
      <span>Judge ${num((summary.score_components || {}).judge_overall)}</span>
      <span>p95 ${formatDuration(summary.duration_p95_ms)}</span>
    </span>
  </button>`;
}

function caseMarkup(caseItem, history = []) {
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
  return `<details class="bench-case">
    <summary>
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
    </div>
  </details>`;
}

function runDetailMarkup(run, historyMap) {
  const cases = run.cases || [];
  return `<section class="report-card bench-detail">
    <div class="side-card-head">
      <span class="side-card-title">${icon("activity", 14)}${escapeHtml(run.label || "RAG Benchmark")}</span>
      <div class="qb-actions">
        ${statusBadge(run.status)}
        <span class="mono">${escapeHtml(run.run_id)}</span>
        ${run.status === "running" || run.status === "stopping" ? `<button class="btn btn-secondary btn-sm" type="button" data-bench-action="stop" data-run-id="${escapeHtml(run.run_id)}">${icon("x", 13)}<span>停止</span></button>` : ""}
      </div>
    </div>
    ${scoreSummary(run.summary || {})}
    ${stageSummaryMarkup(run.summary || {})}
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
    <div class="bench-cases">${cases.length ? cases.map((caseItem) => caseMarkup(caseItem, historyMap[caseItem.fingerprint] || [])).join("") : notice({ tone: "info", title: "尚無題目結果", text: "Benchmark 執行後會在這裡顯示逐題結果。" })}</div>
  </section>`;
}

function benchmarkMarkup(state) {
  const models = state.models?.models || {};
  const suites = state.suites || [];
  const active = (state.runs || []).find((run) => ["running", "stopping"].includes(run.status));
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
      <label class="field"><span class="field-label">Run 標籤</span><input class="input" name="label" value="${escapeHtml(state.config.label || "RAG Benchmark")}" /></label>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${active ? "disabled" : ""}>${icon("play", 14)}<span>${active ? "Benchmark 執行中" : "執行 Benchmark"}</span></button>
        ${active ? `<button class="btn btn-secondary" type="button" data-bench-action="stop" data-run-id="${escapeHtml(active.run_id)}">${icon("x", 14)}<span>停止</span></button>` : ""}
      </div>
    </form>
    ${active ? `<div class="bench-progress"><div class="processing-bar"><span class="processing-bar-fill" style="width:${active.progress || 0}%"></span></div><span>${formatNumber(active.completed_cases || 0)} / ${formatNumber(active.total_cases || 0)} · ${escapeHtml(active.status)}</span></div>` : ""}
    <div class="bench-runs-head"><span class="summary-label">歷史 Run</span><span class="qb-muted">同題目以 fingerprint 對齊，可展開逐題比較</span></div>
    <div class="bench-runs">${(state.runs || []).length ? state.runs.map((run) => runRow(run, selected?.run_id === run.run_id)).join("") : `<div class="qb-empty">尚無 benchmark 執行紀錄。</div>`}</div>
    ${selected ? runDetailMarkup(selected, state.history) : ""}
  </section>`;
}

export function createBenchmarkPanel(root, { onNavigate = null } = {}) {
  const state = {
    models: null,
    suites: [],
    runs: [],
    selectedRun: null,
    selectedSuiteId: null,
    history: {},
    config: {
      label: "RAG Benchmark",
      embedding_model: "",
      llm_model: "",
      judge_model: "",
      top_k: 4,
      score_threshold: 0.35,
      repeats: 1,
      enable_law_retrieval: true,
      judge_enabled: true,
    },
    pollTimer: null,
    loading: false,
  };
  const panel = () => root.querySelector("#performance-panel-benchmark");

  const render = () => {
    const target = panel();
    if (!target) return;
    target.innerHTML = benchmarkMarkup(state);
  };

  const load = async () => {
    if (state.loading) return;
    state.loading = true;
    try {
      const [models, suitesResult, runsResult] = await Promise.all([
        api.benchmarkModels(),
        api.benchmarkSuites(),
        api.benchmarkRuns(30),
      ]);
      state.models = models;
      state.suites = suitesResult.suites || [];
      state.runs = runsResult.runs || [];
      state.indexVersion = models.index_version;
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
      const active = state.runs.find((run) => ["running", "stopping"].includes(run.status));
      if (active) {
        state.selectedRun = await api.benchmarkRun(active.run_id, true);
      } else if (state.selectedRun) {
        state.selectedRun = await api.benchmarkRun(state.selectedRun.run_id, true);
      }
      render();
      schedulePoll();
    } catch (error) {
      const target = panel();
      if (target) {
        target.innerHTML = notice({
          tone: "danger",
          title: "Benchmark 資料讀取失敗",
          text: escapeHtml(error.message || "請稍後再試。"),
        });
      }
    } finally {
      state.loading = false;
    }
  };

  const schedulePoll = () => {
    if (state.pollTimer) window.clearTimeout(state.pollTimer);
    const running = state.runs.some((run) => ["running", "stopping"].includes(run.status));
    if (!running) return;
    state.pollTimer = window.setTimeout(async () => {
      await load();
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

  const readConfig = (form) => {
    const data = new FormData(form);
    return {
      label: String(data.get("label") || "RAG Benchmark"),
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

  const startRun = async (form) => {
    const config = readConfig(form);
    state.config = config;
    const suiteId = Number(form.elements.suite_id?.value || 0);
    if (!suiteId) {
      toast("請先選擇 benchmark 題庫。", "warn");
      return;
    }
    try {
      await api.startBenchmarkRun({ suite_id: suiteId, config, actor: "anonymous" });
      toast("Benchmark 已啟動。", "ok");
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
        state.selectedRun = await api.benchmarkRun(state.selectedRun.run_id, true);
      }
      await load();
    } catch (error) {
      toast(error.message || "人工評分儲存失敗。", "danger");
    }
  };

  const loadHistory = async (fingerprint) => {
    if (!fingerprint) return;
    try {
      const result = await api.benchmarkFingerprintHistory(fingerprint, 50);
      state.history[fingerprint] = result.cases || [];
      render();
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

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);

  return {
    show() {
      if (onNavigate) onNavigate("benchmark");
      load();
    },
    refresh: load,
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", onSubmit);
      if (state.pollTimer) window.clearTimeout(state.pollTimer);
    },
  };
}
