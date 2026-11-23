import { api } from "../api.js";
import { renderRagPipelineWaterfall } from "./performance.js";
import {
  downloadText,
  emptyState,
  escapeHtml,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  notice,
  safeUrl,
  setBusy,
  statusBadge,
  toast,
} from "../utils.js";

const STATUS_TONES = {
  new: "warning",
  triaged: "info",
  planned: "preview",
  resolved: "success",
  dismissed: "neutral",
};

const SENTIMENT_LABELS = {
  satisfied: "滿意",
  unsatisfied: "不滿意",
};

const STATUS_LABELS = {
  new: "待處理",
  triaged: "已分類",
  planned: "已排入",
  resolved: "已解決",
  dismissed: "不處理",
};

const SEVERITY_LABELS = {
  low: "低",
  medium: "中",
  high: "高",
};

const ROOT_CAUSE_OPTIONS = [
  ["unknown", "尚未判定"],
  ["query_parse", "問題解析／日期條件"],
  ["financial_scope", "金融範圍判斷"],
  ["law_retrieval", "法規／命令檢索"],
  ["judgment_retrieval", "判決檢索"],
  ["reranker", "Reranker 排序"],
  ["context_builder", "Context 組裝"],
  ["llm_generation", "LLM 生成"],
  ["citation_audit", "引用驗證"],
  ["answer_routing", "回答模式路由"],
  ["refusal_policy", "拒答政策"],
  ["data_quality", "資料品質／版本"],
];

const ANSWER_VERDICT_OPTIONS = [
  ["unknown", "尚未判定"],
  ["correct", "正確"],
  ["partial", "部分正確"],
  ["incorrect", "錯誤"],
];

const ANSWER_MODE_OPTIONS = [
  ["unknown", "尚未指定"],
  ["law_first", "法規優先"],
  ["list", "判決列表"],
  ["structured", "結構化回答"],
  ["semantic", "一般語意問答"],
  ["refusal", "應拒答"],
];

const EXPECTED_REFUSAL_OPTIONS = [
  ["unspecified", "未指定"],
  ["should_answer", "應該回答"],
  ["should_refuse", "應該拒答"],
];

const ISSUE_STATUS_LABELS = {
  open: "待處理",
  triaged: "已分類",
  planned: "已排入",
  resolved: "已解決",
  dismissed: "不處理",
};

const CITATION_VERDICT_OPTIONS = [
  ["", "未標註"],
  ["supports", "支持答案"],
  ["irrelevant", "與答案無關"],
  ["wrong", "內容或條號錯誤"],
  ["unsure", "不確定"],
];

function filterValue(filters, key) {
  return String(filters[key] || "");
}

function questionExcerpt(value, limit = 96) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "（沒有可重現的問題）";
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

function renderStats(stats) {
  const rate =
    stats?.unsatisfied_rate === null ||
    stats?.unsatisfied_rate === undefined
      ? "—"
      : `${Number(stats.unsatisfied_rate).toFixed(2)}%`;
  return `<div class="metric-grid quality-coverage-grid rag-feedback-metrics">
    <div class="metric-card"><div class="metric-label">總回饋</div><div class="metric-value">${formatNumber(stats?.total || 0)}</div><div class="metric-desc">包含滿意與不滿意</div></div>
    <div class="metric-card"><div class="metric-label">不滿意</div><div class="metric-value">${formatNumber(stats?.unsatisfied || 0)}</div><div class="metric-desc">主要改善來源</div></div>
    <div class="metric-card"><div class="metric-label">不滿意率</div><div class="metric-value">${rate}</div><div class="metric-desc">不滿意 ÷ 總回饋</div></div>
    <div class="metric-card"><div class="metric-label">待處理</div><div class="metric-value">${formatNumber(stats?.new || 0)}</div><div class="metric-desc">狀態為待處理</div></div>
    <div class="metric-card"><div class="metric-label">可行動</div><div class="metric-value">${formatNumber(stats?.actionable || 0)}</div><div class="metric-desc">已標記可轉 regression</div></div>
    <div class="metric-card"><div class="metric-label">問題群組</div><div class="metric-value">${formatNumber(stats?.open_issues || 0)}</div><div class="metric-desc">未結案 Issue</div></div>
  </div>
  ${renderAttribution(stats)}`;
}

function renderAttribution(stats) {
  const rows = Array.isArray(stats?.by_root_cause) ? stats.by_root_cause : [];
  if (!rows.length) return "";
  const max = Math.max(...rows.map((row) => Number(row.count) || 0), 1);
  return `<div class="rag-feedback-attribution-stats">
    <div class="report-section-title">錯誤階段分布</div>
    ${rows
      .map((row) => {
        const count = Number(row.count) || 0;
        const width = Math.max(2, (count / max) * 100);
        return `<div class="rag-feedback-attribution-row">
          <span>${escapeHtml(row.label || row.code)}</span>
          <span class="rag-feedback-attribution-track"><i style="width:${width}%"></i></span>
          <strong>${formatNumber(count)}</strong>
        </div>`;
      })
      .join("")}
  </div>`;
}

function optionLabel(options, code) {
  const found = options.find(([value]) => value === code);
  return found ? found[1] : code || "—";
}

function reviewReasonLabel(reason) {
  const text = String(reason || "");
  if (text === "unreviewed_recent") return "尚未檢視";
  if (text.startsWith("status:")) return `狀態 ${text.split(":")[1] || ""}`;
  if (text.startsWith("retrieval:")) {
    return `檢索 ${text.split(":").slice(1).join(":")}`;
  }
  if (text.startsWith("rerank:")) {
    return `Rerank ${text.split(":").slice(1).join(":")}`;
  }
  if (text.startsWith("citation_audit:")) {
    return `引用 ${text.split(":").slice(1).join(":")}`;
  }
  if (text.startsWith("degraded:")) return "降級回答";
  if (text === "missing_answer") return "沒有回答文字";
  if (text === "answer_source:retrieval") return "只有檢索結果";
  if (text === "scope_probe:notice") return "範圍邊界";
  return text;
}

function renderReviewQueue(queue, candidate) {
  const rows = Array.isArray(queue) ? queue : [];
  const detail = candidate
    ? `<div class="rag-feedback-review-detail" data-review-request="${escapeHtml(candidate.request_id)}">
        <div class="rag-feedback-review-head">
          <div>
            <div class="report-kicker">ACTIVE LEARNING SAMPLE</div>
            <div class="report-title">${escapeHtml(candidate.question || "（沒有問題文字）")}</div>
            <div class="report-sub">${escapeHtml(formatDateTime(candidate.created_at))} · request_id <span class="mono">${escapeHtml(candidate.request_id)}</span> · 風險 ${formatNumber(candidate.risk_score)}</div>
          </div>
          <div class="rag-feedback-detail-head-actions">
            ${statusBadge("info", candidate.answer_source || "—")}
            ${statusBadge("neutral", candidate.status || "—")}
            <button class="judgment-dialog-close" type="button" data-review-action="close" aria-label="關閉抽樣明細">${icon("x", 14)}</button>
          </div>
        </div>
        <div class="rag-feedback-review-reasons">
          ${(candidate.reasons || []).map((reason) => `<span class="badge badge-warn">${escapeHtml(reviewReasonLabel(reason))}</span>`).join(" ")}
        </div>
        <pre class="rag-feedback-replay-answer">${escapeHtml(candidate.answer_preview || "（沒有回答文字）")}</pre>
        ${candidate.snapshot?.notice ? `<div class="answer-notice">${escapeHtml(candidate.snapshot.notice)}</div>` : ""}
        <div class="rag-feedback-detail-grid">
          <div><span class="muted">檢索狀態</span><strong>${escapeHtml(candidate.retrieval?.status || "—")}</strong></div>
          <div><span class="muted">檢索筆數</span><strong>${formatNumber(candidate.retrieval?.hits || 0)}</strong></div>
          <div><span class="muted">Top score</span><strong>${escapeHtml(candidate.retrieval?.top_score ?? "—")}</strong></div>
          <div><span class="muted">LLM</span><strong>${escapeHtml(candidate.llm_model || "—")}</strong></div>
        </div>
        <div class="rag-feedback-triage-actions">
          <button class="btn btn-primary btn-sm" type="button" data-review-action="mark" data-review-status="reviewed">${icon("check", 13)}<span>標記已檢視</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-review-action="mark" data-review-status="dismissed"><span>略過</span></button>
        </div>
      </div>`
    : "";
  return `<div class="rag-feedback-review-queue">
    <div class="rag-feedback-issues-head">
      <div>
        <div class="report-section-title">主動學習抽樣</div>
        <p class="rag-feedback-issues-note">從尚未收到回饋的回答中，優先挑出降級、零命中、引用異常、rerank 異常與低分數邊界案例。</p>
      </div>
      <div class="rag-feedback-detail-head-actions">
        <span class="badge badge-neutral badge-mono">${formatNumber(rows.length)} 筆</span>
        <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="refresh-review">${icon("refresh", 13)}<span>重新抽樣</span></button>
      </div>
    </div>
    ${rows.length
      ? `<div class="rag-feedback-review-list">${rows
          .map(
            (row) => `<button type="button" class="rag-feedback-review-row${candidate?.request_id === row.request_id ? " is-active" : ""}"
              data-review-open="${escapeHtml(row.request_id)}">
              <span class="rag-feedback-review-main">
                <strong>${escapeHtml(questionExcerpt(row.question, 92))}</strong>
                <small>${escapeHtml(row.answer_source || "—")} · ${escapeHtml(row.status || "—")} · ${escapeHtml(formatDateTime(row.created_at))}</small>
              </span>
              <span class="rag-feedback-review-risk">
                <span class="badge badge-warn">風險 ${formatNumber(row.risk_score)}</span>
                ${(row.reasons || []).slice(0, 2).map((reason) => `<span class="badge badge-neutral">${escapeHtml(reviewReasonLabel(reason))}</span>`).join("")}
              </span>
            </button>`,
          )
          .join("")}</div>`
      : '<p class="cell-empty">目前沒有需要主動抽樣的案例。</p>'}
    ${detail}
  </div>`;
}


function renderIssuePanel(issues, filters) {
  const rows = Array.isArray(issues) ? issues : [];
  const activeId = String(filters?.issue_id || "");
  return `<div class="rag-feedback-issues-head">
      <div>
        <div class="report-section-title">問題群組（Issue）</div>
        <p class="rag-feedback-issues-note">把相同 root cause 的回饋連到同一個群組；點選群組可篩選回饋。</p>
      </div>
      <span class="badge badge-neutral badge-mono">${formatNumber(rows.length)} 組</span>
    </div>
    ${rows.length
      ? `<div class="rag-feedback-issues">${rows
          .map(
            (issue) => `<button type="button" class="rag-feedback-issue${activeId === String(issue.id) ? " is-active" : ""}"
              data-feedback-issue-id="${issue.id}">
              <span class="rag-feedback-issue-main">
                <strong>${escapeHtml(issue.title)}</strong>
                <small>${escapeHtml(optionLabel(ROOT_CAUSE_OPTIONS, issue.root_cause_stage))} · ${escapeHtml(ISSUE_STATUS_LABELS[issue.status] || issue.status)}</small>
              </span>
              <span class="rag-feedback-issue-meta">
                <span class="badge badge-neutral">${formatNumber(issue.feedback_count || 0)} 筆</span>
                ${issue.linked_pr_url ? `<a href="${safeUrl(issue.linked_pr_url)}" target="_blank" rel="noopener noreferrer">PR</a>` : ""}
              </span>
            </button>`,
          )
          .join("")}</div>`
      : '<p class="cell-empty">尚未建立問題群組。</p>'}`;
}

function renderFilterForm(payload, filters) {
  const reasons = payload?.reason_options || [];
  const statuses = payload?.status_options || [];
  const severities = payload?.severity_options || [];
  return `<form class="rag-feedback-filter" data-feedback-filter>
    <input type="hidden" name="issue_id" value="${escapeHtml(filterValue(filters, "issue_id"))}" />
    <label>滿意度
      <select name="sentiment" class="input">
        <option value="">全部</option>
        <option value="unsatisfied" ${filters.sentiment === "unsatisfied" ? "selected" : ""}>不滿意</option>
        <option value="satisfied" ${filters.sentiment === "satisfied" ? "selected" : ""}>滿意</option>
      </select>
    </label>
    <label>狀態
      <select name="status" class="input">
        <option value="">全部</option>
        ${statuses.map((item) => `<option value="${escapeHtml(item.code)}" ${filters.status === item.code ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
      </select>
    </label>
    <label>原因
      <select name="reason" class="input">
        <option value="">全部</option>
        ${reasons.map((item) => `<option value="${escapeHtml(item.code)}" ${filters.reason === item.code ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
      </select>
    </label>
    <label>嚴重度
      <select name="severity" class="input">
        <option value="">全部</option>
        ${severities.map((item) => `<option value="${escapeHtml(item.code)}" ${filters.severity === item.code ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}
      </select>
    </label>
    <label>錯誤階段
      <select name="root_cause_stage" class="input">
        <option value="">全部</option>
        ${ROOT_CAUSE_OPTIONS.map(([code, label]) => `<option value="${code}" ${filters.root_cause_stage === code ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select>
    </label>
    <label class="rag-feedback-filter-wide">關鍵字
      <input class="input" type="search" name="keyword" maxlength="120" value="${escapeHtml(filterValue(filters, "keyword"))}" placeholder="問題、留言、request_id" />
    </label>
    <label class="rag-feedback-filter-check">
      <input type="checkbox" name="actionable" ${filters.actionable ? "checked" : ""} />
      <span>只看可行動</span>
    </label>
    <div class="rag-feedback-filter-actions">
      <button class="btn btn-secondary btn-sm" type="submit">套用篩選</button>
      <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="reset">清除</button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="export">${icon("download", 13)}<span>匯出代理 JSONL</span></button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="evaluate">${icon("refresh", 13)}<span>批次重跑評估</span></button>
      <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="experiment">${icon("sliders", 13)}<span>A/B 參數實驗</span></button>
    </div>
  </form>`;
}

function renderList(payload, selectedId) {
  const rows = payload?.items || [];
  if (!rows.length) {
    return emptyState({
      iconName: "message",
      title: "目前沒有符合條件的使用者回饋",
      text: "RAG 回答下方的滿意度按鈕送出後，會在這裡出現可重現的快照。",
    });
  }
  return `<div class="table-wrap">
    <table class="data-table is-compact rag-feedback-table">
      <thead><tr>
        <th>時間</th><th>滿意度</th><th>原因</th><th>問題摘要</th>
        <th>answer_source</th><th>狀態</th><th>嚴重度</th><th>可行動</th>
      </tr></thead>
      <tbody>
        ${rows
          .map(
            (row) => `<tr data-feedback-id="${row.id}" class="${Number(selectedId) === Number(row.id) ? "is-selected" : ""}">
              <td class="mono">${escapeHtml(formatDateTime(row.created_at))}</td>
              <td>${row.sentiment === "satisfied" ? statusBadge("success", "滿意") : statusBadge("warning", "不滿意")}</td>
              <td>${(row.reasons || []).map((code) => `<span class="badge badge-neutral">${escapeHtml(code)}</span>`).join(" ") || '<span class="cell-empty">—</span>'}</td>
              <td class="rag-feedback-question-cell">${escapeHtml(questionExcerpt(row.question))}</td>
              <td class="mono">${escapeHtml(row.answer_source || "—")}</td>
              <td>${statusBadge(STATUS_TONES[row.status] || "neutral", STATUS_LABELS[row.status] || row.status || "—")}</td>
              <td>${escapeHtml(SEVERITY_LABELS[row.severity] || row.severity || "—")}</td>
              <td>${row.actionable ? statusBadge("success", "是") : statusBadge("neutral", "否")}</td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  </div>
  <div class="rag-feedback-pager">
    <span>第 ${formatNumber(payload.page || 1)} / ${formatNumber(payload.pages || 1)} 頁，共 ${formatNumber(payload.total || 0)} 筆</span>
    <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="prev" ${Number(payload.page || 1) <= 1 ? "disabled" : ""}>上一頁</button>
    <button class="btn btn-ghost btn-sm" type="button" data-feedback-action="next" ${Number(payload.page || 1) >= Number(payload.pages || 1) ? "disabled" : ""}>下一頁</button>
  </div>`;
}

function citationKey(item) {
  const jid = String(item?.jid || "").trim();
  if (jid) return `jid:${jid}`;
  return `law:${String(item?.law_name || "").trim()}:${String(
    item?.article_no || "",
  ).trim()}`;
}

function citationVerdictSelect(item, verdicts) {
  const key = citationKey(item);
  const current = String(verdicts?.[key] || "");
  return `<label class="rag-feedback-citation-verdict">來源判定
    <select class="input" data-citation-verdict data-citation-key="${escapeHtml(key)}">
      ${CITATION_VERDICT_OPTIONS.map(
        ([code, label]) =>
          `<option value="${escapeHtml(code)}" ${current === code ? "selected" : ""}>${escapeHtml(label)}</option>`,
      ).join("")}
    </select>
  </label>`;
}

function renderCitations(snapshot, detail) {
  const citations = Array.isArray(snapshot?.citations) && snapshot.citations.length
    ? snapshot.citations
    : Array.isArray(snapshot?.judgments)
      ? snapshot.judgments
      : [];
  const laws = Array.isArray(snapshot?.law_sources) ? snapshot.law_sources : [];
  const verdicts = detail?.citation_verdicts || {};
  return `<div class="rag-feedback-replay-grid">
    <section class="rag-feedback-replay-card">
      <div class="report-section-title">判決引用 ${citations.length} 筆</div>
      ${citations.length
        ? citations
            .map(
              (item) => `<article class="rag-feedback-citation">
                <div class="rag-feedback-citation-head">
                  <strong>${escapeHtml(item.title || item.jid || "判決")}</strong>
                  <span class="mono">${escapeHtml(item.jid || "")}</span>
                </div>
                <div class="rag-feedback-citation-meta">${escapeHtml([item.court, item.jdate].filter(Boolean).join(" · "))}</div>
                ${item.snippet ? `<p>${escapeHtml(item.snippet)}</p>` : ""}
                ${citationVerdictSelect(item, verdicts)}
              </article>`,
            )
            .join("")
        : '<p class="cell-empty">沒有判決引用。</p>'}
    </section>
    <section class="rag-feedback-replay-card">
      <div class="report-section-title">法規來源 ${laws.length} 筆</div>
      ${laws.length
        ? laws
            .map(
              (item) => `<article class="rag-feedback-citation">
                <div class="rag-feedback-citation-head">
                  <strong>${escapeHtml(item.law_name || "法規")}</strong>
                  <span>${escapeHtml(item.article_no || "")}</span>
                </div>
                ${item.snippet || item.text ? `<p>${escapeHtml(item.snippet || item.text)}</p>` : ""}
                ${citationVerdictSelect(item, verdicts)}
              </article>`,
            )
            .join("")
        : '<p class="cell-empty">沒有法規來源。</p>'}
    </section>
  </div>`;
}

function renderRerun(result) {
  if (!result) return "";
  const diff = result.diff || {};
  const flags = [
    ["答案變更", diff.answer_changed],
    ["來源模式變更", diff.answer_source_changed],
    ["狀態變更", diff.status_changed],
    ["檢索模式變更", diff.retrieval_mode_changed],
  ];
  const list = (title, values, tone) => `<div class="rag-feedback-rerun-list">
    <strong>${escapeHtml(title)}</strong>
    ${(values || []).length
      ? values.map((value) => `<span class="badge badge-${tone}">${escapeHtml(value)}</span>`).join(" ")
      : '<span class="cell-empty">無</span>'}
  </div>`;
  return `<section class="report-card rag-feedback-rerun" data-feedback-rerun>
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">CURRENT PIPELINE RERUN</div>
        <div class="report-title">用目前系統重跑同一題</div>
        <div class="report-sub">此結果不會覆寫原始快照；用來比較修正前後。</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${flags
          .map(([label, changed]) =>
            statusBadge(changed ? "warning" : "success", `${label}：${changed ? "有" : "無"}`),
          )
          .join("")}
      </div>
    </div>
    <div class="report-section">
      <div class="rag-feedback-rerun-grid">
        <div>
          <div class="report-section-title">原始回答</div>
          <pre class="rag-feedback-replay-answer">${escapeHtml(result.previous?.answer || "")}</pre>
        </div>
        <div>
          <div class="report-section-title">目前系統回答</div>
          <pre class="rag-feedback-replay-answer">${escapeHtml(result.current?.answer || "")}</pre>
        </div>
      </div>
      <div class="rag-feedback-rerun-lists">
        ${list("新增判決引用", diff.citations_added, "ok")}
        ${list("移除判決引用", diff.citations_removed, "warn")}
        ${list("新增法規來源", diff.laws_added, "ok")}
        ${list("移除法規來源", diff.laws_removed, "warn")}
      </div>
      <div class="rag-feedback-detail-grid">
        <div><span class="muted">原始 answer_source</span><strong>${escapeHtml(result.previous?.answer_source || "—")}</strong></div>
        <div><span class="muted">目前 answer_source</span><strong>${escapeHtml(result.current?.answer_source || "—")}</strong></div>
        <div><span class="muted">原始檢索模式</span><strong>${escapeHtml(result.previous?.retrieval_mode || "—")}</strong></div>
        <div><span class="muted">目前檢索模式</span><strong>${escapeHtml(result.current?.retrieval_mode || "—")}</strong></div>
      </div>
    </div>
  </section>`;
}


function renderEvaluation(evaluation) {
  if (!evaluation) return "";
  const summary = evaluation.summary || {};
  const results = Array.isArray(evaluation.results)
    ? evaluation.results
    : [];
  const metric = (label, value, desc = "") =>
    `<div class="metric-card"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${formatNumber(value || 0)}</div>${desc ? `<div class="metric-desc">${escapeHtml(desc)}</div>` : ""}</div>`;
  return `<div class="report-card rag-feedback-evaluation" data-feedback-evaluation="${evaluation.id}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">OFFLINE COUNTERFACTUAL EVALUATION</div>
        <div class="report-title">批次重跑評估 #${evaluation.id}</div>
        <div class="report-sub">共 ${formatNumber(evaluation.total || 0)} 筆 · ${escapeHtml(formatDuration(evaluation.duration_ms || 0))} · 以目前 pipeline 重跑，對照原始快照</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${statusBadge(summary.failed ? "warning" : "success", summary.failed ? `${formatNumber(summary.failed)} 筆失敗` : "全部完成")}
      </div>
    </div>
    <div class="report-section">
      <div class="metric-grid quality-coverage-grid rag-feedback-evaluation-metrics">
        ${metric("成功", summary.succeeded)}
        ${metric("失敗", summary.failed)}
        ${metric("答案變更", summary.answer_changed)}
        ${metric("來源模式變更", summary.answer_source_changed)}
        ${metric("判決引用新增", summary.citations_added_total)}
        ${metric("判決引用移除", summary.citations_removed_total)}
      </div>
      <div class="rag-feedback-evaluation-list">
        ${results
          .map(
            (result) => `<button type="button" class="rag-feedback-evaluation-row"
              data-feedback-evaluate-open="${result.feedback_id}">
              <span class="rag-feedback-evaluation-question">#${result.feedback_id} ${escapeHtml(questionExcerpt(result.question || "", 80))}</span>
              <span class="rag-feedback-evaluation-badges">
                ${statusBadge(result.status === "success" ? "success" : "danger", result.status === "success" ? "完成" : "失敗")}
                ${result.diff?.answer_changed ? statusBadge("warning", "答案變更") : ""}
                ${result.diff?.answer_source_changed ? statusBadge("warning", "來源變更") : ""}
                ${(result.diff?.citations_added || []).length ? statusBadge("info", `+${result.diff.citations_added.length} 引用`) : ""}
                ${(result.diff?.citations_removed || []).length ? statusBadge("info", `-${result.diff.citations_removed.length} 引用`) : ""}
              </span>
            </button>`,
          )
          .join("")}
      </div>
      <details class="rag-feedback-raw">
        <summary>完整評估 JSON</summary>
        <pre>${escapeHtml(JSON.stringify(evaluation, null, 2))}</pre>
      </details>
    </div>
  </div>`;
}


function renderExperiment(experiment) {
  if (!experiment) return "";
  const variants = Array.isArray(experiment.variants)
    ? experiment.variants
    : [];
  const results = Array.isArray(experiment.results)
    ? experiment.results
    : [];
  const summaryByVariant = experiment.summary || {};
  return `<div class="report-card rag-feedback-experiment" data-feedback-experiment="${experiment.id}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">OFFLINE A/B PARAMETER EXPERIMENT</div>
        <div class="report-title">A/B 參數實驗 #${experiment.id}</div>
        <div class="report-sub">${formatNumber(experiment.feedback_ids?.length || 0)} 筆回饋 · ${formatNumber(variants.length)} 個變體 · ${escapeHtml(formatDuration(experiment.duration_ms || 0))}</div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${statusBadge("info", "離線比較")}
      </div>
    </div>
    <div class="report-section">
      <div class="table-wrap">
        <table class="data-table is-compact rag-feedback-experiment-table">
          <thead><tr>
            <th>變體</th><th>參數</th><th>成功</th><th>答案變更</th>
            <th>來源變更</th><th>目前引用平均</th><th>平均耗時</th>
          </tr></thead>
          <tbody>
            ${variants
              .map((variant, index) => {
                const summary =
                  summaryByVariant[variant.name] ||
                  results[index]?.summary ||
                  {};
                const overrides = variant.overrides || {};
                const overrideText = Object.keys(overrides).length
                  ? Object.entries(overrides)
                      .map(([key, value]) => `${key}=${value}`)
                      .join(" · ")
                  : "目前設定";
                const succeeded = Number(summary.succeeded || 0);
                const avgCitations = succeeded
                  ? (Number(summary.current_citations_total || 0) / succeeded).toFixed(1)
                  : "—";
                return `<tr>
                  <td><strong>${escapeHtml(variant.name)}</strong></td>
                  <td class="mono">${escapeHtml(overrideText)}</td>
                  <td>${formatNumber(succeeded)} / ${formatNumber(Number(summary.failed || 0) + succeeded)}</td>
                  <td>${formatNumber(summary.answer_changed || 0)}</td>
                  <td>${formatNumber(summary.answer_source_changed || 0)}</td>
                  <td>${escapeHtml(avgCitations)}</td>
                  <td>${escapeHtml(formatDuration(summary.avg_duration_ms || 0))}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <p class="rag-feedback-issues-note">這是離線差異比較，不是自動判定哪個變體正確；仍需人工 expected behavior 與 benchmark 驗收。</p>
      <details class="rag-feedback-raw">
        <summary>完整實驗 JSON</summary>
        <pre>${escapeHtml(JSON.stringify(experiment, null, 2))}</pre>
      </details>
    </div>
  </div>`;
}


function renderDetail(detail, issues = []) {
  const snapshot = detail?.snapshot || {};
  const flow = snapshot.pipeline_flow;
  const waterfall = flow
    ? renderRagPipelineWaterfall(flow, {
        serverDurationMs: Number(snapshot.duration_ms) || 0,
        embedded: true,
      })
    : "";
  const events = Array.isArray(detail?.events) ? detail.events : [];
  const feedbackBlock = `<div class="report-section rag-feedback-priority">
      <div class="rag-feedback-priority-head">
        <span class="report-section-title">使用者回饋 · 最優先檢視</span>
        ${detail.sentiment === "satisfied" ? statusBadge("success", "滿意") : statusBadge("warning", "不滿意")}
      </div>
      <div class="rag-feedback-user-reasons">
        ${(detail.reasons || []).map((code) => `<span class="badge badge-warn">${escapeHtml(code)}</span>`).join(" ") || '<span class="cell-empty">沒有選原因</span>'}
      </div>
      ${detail.comment ? `<blockquote class="rag-feedback-comment-view">${escapeHtml(detail.comment)}</blockquote>` : '<p class="cell-empty">沒有留言。</p>'}
    </div>`;
  return `<section class="report-card rag-feedback-detail" data-feedback-detail="${detail.id}">
    ${feedbackBlock}
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">FEEDBACK REPLAY · #${detail.id}</div>
        <div class="report-title">${escapeHtml(questionExcerpt(detail.question, 140))}</div>
        <div class="report-sub">送出時間 ${escapeHtml(formatDateTime(detail.created_at))} · revision ${formatNumber(detail.revision)} · request_id <span class="mono">${escapeHtml(detail.request_id)}</span></div>
      </div>
      <div class="rag-feedback-detail-head-actions">
        ${detail.sentiment === "satisfied" ? statusBadge("success", "滿意") : statusBadge("warning", "不滿意")}
        ${statusBadge(STATUS_TONES[detail.status] || "neutral", STATUS_LABELS[detail.status] || detail.status)}
        ${detail.issue ? statusBadge("info", `Issue #${detail.issue.id}`) : ""}
        ${detail.linked_question_id ? statusBadge("info", `題庫 #${detail.linked_question_id}`) : ""}
      </div>
    </div>
    <div class="report-section">
      <div class="rag-feedback-detail-grid">
        <div><span class="muted">answer_source</span><strong>${escapeHtml(detail.answer_source || "—")}</strong></div>
        <div><span class="muted">LLM</span><strong>${escapeHtml(detail.llm_model || "—")}</strong></div>
        <div><span class="muted">耗時</span><strong>${escapeHtml(formatDuration(detail.duration_ms || 0))}</strong></div>
        <div><span class="muted">可編輯至</span><strong>${escapeHtml(formatDateTime(detail.editable_until))}</strong></div>
        <div><span class="muted">題庫 draft</span><strong>${detail.linked_question_id ? `#${detail.linked_question_id} · pending_review` : "尚未建立"}</strong></div>
      </div>
    </div>
    <div class="report-section">
      <div class="report-section-title">重現使用者看到的問題與回答</div>
      <div class="rag-feedback-replay">
        <div class="rag-feedback-replay-question">${escapeHtml(snapshot.question || detail.question || "")}</div>
        <pre class="rag-feedback-replay-answer">${escapeHtml(snapshot.answer || "（沒有回答文字）")}</pre>
        ${snapshot.notice ? `<div class="answer-notice">${escapeHtml(snapshot.notice)}</div>` : ""}
      </div>
      ${renderCitations(snapshot, detail)}
    </div>
    ${waterfall ? `<div class="report-section"><div class="report-section-title">Pipeline 快照</div><div class="rag-process-body">${waterfall}</div></div>` : ""}
    <div class="report-section">
      <details class="rag-feedback-raw">
        <summary>Retrieval、決策與系統版本</summary>
        <pre>${escapeHtml(JSON.stringify({ retrieval: snapshot.retrieval, system_version: detail.system_version, decisions: flow?.decisions || [] }, null, 2))}</pre>
      </details>
      <details class="rag-feedback-raw">
        <summary>回饋事件 ${events.length} 筆</summary>
        <pre>${escapeHtml(JSON.stringify(events, null, 2))}</pre>
      </details>
    </div>
    <div class="report-section">
      <div class="report-section-title">管理者 triage</div>
      <form class="rag-feedback-triage" data-feedback-triage>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>狀態</legend>
            <div class="rag-feedback-choice-options">
              ${["new", "triaged", "planned", "resolved", "dismissed"].map((status) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="status" value="${status}" ${detail.status === status ? "checked" : ""} />
                <span>${escapeHtml(STATUS_LABELS[status] || status)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>嚴重度</legend>
            <div class="rag-feedback-choice-options">
              ${["low", "medium", "high"].map((severity) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="severity" value="${severity}" ${detail.severity === severity ? "checked" : ""} />
                <span>${escapeHtml(SEVERITY_LABELS[severity] || severity)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
          <label class="rag-feedback-filter-check">
            <input type="checkbox" name="actionable" ${detail.actionable ? "checked" : ""} />
            <span>可行動 / 轉 regression</span>
          </label>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>主要錯誤階段</legend>
            <div class="rag-feedback-choice-options">
              ${ROOT_CAUSE_OPTIONS.map(([code, label]) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="root_cause_stage" value="${code}" ${detail.root_cause_stage === code ? "checked" : ""} />
                <span>${escapeHtml(label)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>預期回答模式</legend>
            <div class="rag-feedback-choice-options">
              ${ANSWER_MODE_OPTIONS.map(([code, label]) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="expected_answer_mode" value="${code}" ${detail.expected_answer_mode === code ? "checked" : ""} />
                <span>${escapeHtml(label)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-attribution rag-feedback-triage-wide">
          <label>預期日期起
            <input class="input" type="date" name="expected_date_from" value="${escapeHtml(detail.expected_date_from || "")}" />
          </label>
          <label>預期日期迄
            <input class="input" type="date" name="expected_date_to" value="${escapeHtml(detail.expected_date_to || "")}" />
          </label>
        </div>
        <div class="rag-feedback-issue-link rag-feedback-triage-wide">
          <label>問題群組
            <select class="input" name="issue_id">
              <option value="">未分類</option>
              ${issues.map((issue) => `<option value="${issue.id}" ${Number(detail.issue_id) === Number(issue.id) ? "selected" : ""}>#${issue.id} ${escapeHtml(issue.title)}（${formatNumber(issue.feedback_count || 0)} 筆）</option>`).join("")}
            </select>
          </label>
          <label>建立新群組
            <input class="input" type="text" name="new_issue_title" maxlength="300" placeholder="例：近二年日期 filter 未套用" />
          </label>
          <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="create-issue" data-feedback-id="${detail.id}">
            ${icon("plus", 13)}<span>建立並連結</span>
          </button>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>答案判定</legend>
            <div class="rag-feedback-choice-options">
              ${ANSWER_VERDICT_OPTIONS.map(([code, label]) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="answer_verdict" value="${code}" ${detail.answer_verdict === code ? "checked" : ""} />
                <span>${escapeHtml(label)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
        </div>
        <div class="rag-feedback-choice-row rag-feedback-triage-wide">
          <fieldset class="rag-feedback-choice-group">
            <legend>預期拒答判定</legend>
            <div class="rag-feedback-choice-options">
              ${EXPECTED_REFUSAL_OPTIONS.map(([code, label]) => `<label class="rag-feedback-choice-pill">
                <input type="radio" name="expected_refusal" value="${code}" ${detail.expected_refusal === code ? "checked" : ""} />
                <span>${escapeHtml(label)}</span>
              </label>`).join("")}
            </div>
          </fieldset>
          <label class="rag-feedback-filter-check">
            <input type="checkbox" name="citation_missing" ${detail.citation_verdicts?.missing ? "checked" : ""} />
            <span>有應該引用但漏掉的來源</span>
          </label>
        </div>
        <label class="rag-feedback-triage-wide">人工建議 Agent 修正的方向 prompt（會進 Agent JSONL，不含原始留言）
          <textarea class="input" name="expected_behavior" rows="3" maxlength="4000"
            placeholder="例：近二年查詢必須顯示實際日期範圍，且只引用該範圍內的判決；查無資料時明確說明，不要生成判決清單。">${escapeHtml(detail.expected_behavior || "")}</textarea>
        </label>
        <label class="rag-feedback-triage-wide">審查備註（僅管理者可見）
          <textarea class="input" name="review_comment" rows="3" maxlength="4000"
            placeholder="例：已確認是引用條號錯誤；交由 #123 修正，完成後回填 PR。">${escapeHtml(detail.review_comment || "")}</textarea>
        </label>
        <div class="rag-feedback-triage-actions">
          <button class="btn btn-primary btn-sm" type="submit">${icon("check", 13)}<span>儲存 triage</span></button>
          <button class="btn btn-secondary btn-sm" type="button"
            data-feedback-action="rerun" data-feedback-id="${detail.id}">
            ${icon("refresh", 13)}<span>用目前系統重跑</span>
          </button>
          <button class="btn btn-secondary btn-sm" type="button"
            data-feedback-action="promote" data-feedback-id="${detail.id}"
            ${detail.linked_question_id || !detail.actionable || !String(detail.expected_behavior || "").trim() ? "disabled" : ""}
            title="${detail.linked_question_id ? "已建立題庫 draft" : "需先標記可行動並填寫人工建議 Agent 修正方向的 prompt"}">
            ${icon("plus", 13)}<span>${detail.linked_question_id ? `已建立題庫 draft #${detail.linked_question_id}` : "建立題庫 draft"}</span>
          </button>
        </div>
      </form>
    </div>
  </section>`;
}

export function createFeedbackController(container, { onStats } = {}) {
  let payload = null;
  let filters = { sentiment: "unsatisfied" };
  let page = 1;
  let selectedId = null;
  let detail = null;
  let rerun = null;
  let issues = [];
  let evaluation = null;
  let experiment = null;
  let reviewQueue = [];
  let reviewCandidate = null;
  let disposed = false;

  const notifyStats = (stats) => {
    if (typeof onStats === "function") onStats(stats);
  };

  const renderShell = () => {
    container.innerHTML = `<div class="report-card rag-feedback-workspace">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">USER FEEDBACK</div>
          <div class="report-title">使用者回饋</div>
          <div class="report-sub">只顯示 server-side snapshot；原始留言僅供管理者檢視，代理匯出不含留言。</div>
        </div>
        <button class="btn btn-secondary btn-sm" type="button" data-feedback-action="refresh">${icon("refresh", 13)}<span>重新整理</span></button>
      </div>
      <div class="report-section" data-feedback-stats></div>
      <div class="report-section" data-feedback-review-queue></div>
      <div class="report-section" data-feedback-issues></div>
      <div class="report-section" data-feedback-filter-slot></div>
      <div class="report-section" data-feedback-list></div>
      <div data-feedback-evaluation-slot></div>
      <div data-feedback-experiment-slot></div>
      <div data-feedback-detail-slot></div>
    </div>`;
  };

  const render = () => {
    if (!payload || disposed) return;
    const statsBox = container.querySelector("[data-feedback-stats]");
    const reviewBox = container.querySelector(
      "[data-feedback-review-queue]",
    );
    const issueBox = container.querySelector("[data-feedback-issues]");
    const filterBox = container.querySelector("[data-feedback-filter-slot]");
    const listBox = container.querySelector("[data-feedback-list]");
    const evaluationBox = container.querySelector(
      "[data-feedback-evaluation-slot]",
    );
    const experimentBox = container.querySelector(
      "[data-feedback-experiment-slot]",
    );
    const detailBox = container.querySelector("[data-feedback-detail-slot]");
    if (statsBox) statsBox.innerHTML = renderStats(payload.stats || {});
    if (reviewBox) {
      reviewBox.innerHTML = renderReviewQueue(
        reviewQueue,
        reviewCandidate,
      );
    }
    if (issueBox) issueBox.innerHTML = renderIssuePanel(issues, filters);
    if (filterBox) filterBox.innerHTML = renderFilterForm(payload, filters);
    if (listBox) listBox.innerHTML = renderList(payload, selectedId);
    if (evaluationBox) {
      evaluationBox.innerHTML = renderEvaluation(evaluation);
    }
    if (experimentBox) {
      experimentBox.innerHTML = renderExperiment(experiment);
    }
    if (detailBox) {
      detailBox.innerHTML = detail
        ? `${renderDetail(detail, issues)}${renderRerun(rerun)}`
        : "";
    }
    notifyStats(payload.stats || {});
  };

  const loadReviewQueue = async () => {
    try {
      const data = await api.ragReviewQueue({ limit: 10 });
      reviewQueue = Array.isArray(data?.candidates) ? data.candidates : [];
    } catch (error) {
      reviewQueue = [];
    }
    if (!disposed) render();
  };

  const loadIssues = async () => {
    try {
      const data = await api.ragFeedbackIssues({ limit: 100 });
      issues = Array.isArray(data?.issues) ? data.issues : [];
    } catch (error) {
      issues = [];
    }
    if (!disposed) render();
  };

  const load = async () => {
    setBusy(container.querySelector('[data-feedback-action="refresh"]'), true, "讀取中…");
    try {
      payload = await api.ragFeedbackList({
        ...filters,
        page,
        page_size: 25,
      });
      render();
    } catch (error) {
      const listBox = container.querySelector("[data-feedback-list]");
      if (listBox) {
        listBox.innerHTML = notice({
          tone: "danger",
          title: "無法讀取使用者回饋",
          text: escapeHtml(error.message || "請稍後再試。"),
        });
      }
      toast("使用者回饋讀取失敗。", "danger");
    } finally {
      setBusy(container.querySelector('[data-feedback-action="refresh"]'), false);
    }
  };

  const loadDetail = async (id) => {
    selectedId = Number(id);
    rerun = null;
    render();
    try {
      detail = await api.ragFeedbackDetail(selectedId);
      if (!disposed) render();
    } catch (error) {
      toast(error.message || "無法讀取回饋明細。", "danger");
    }
  };

  const collectFilters = (form) => {
    const data = new FormData(form);
    filters = {
      sentiment: String(data.get("sentiment") || ""),
      status: String(data.get("status") || ""),
      reason: String(data.get("reason") || ""),
      severity: String(data.get("severity") || ""),
      issue_id: String(data.get("issue_id") || ""),
      root_cause_stage: String(data.get("root_cause_stage") || ""),
      keyword: String(data.get("keyword") || "").trim(),
      actionable: data.get("actionable") ? "1" : "",
    };
    evaluation = null;
    experiment = null;
    page = 1;
  };

  container.addEventListener("submit", async (event) => {
    const filterForm = event.target.closest("[data-feedback-filter]");
    if (filterForm) {
      event.preventDefault();
      collectFilters(filterForm);
      selectedId = null;
      detail = null;
      rerun = null;
      await load();
      return;
    }
    const triageForm = event.target.closest("[data-feedback-triage]");
    if (triageForm) {
      event.preventDefault();
      if (!detail) return;
      const data = new FormData(triageForm);
      const citationVerdicts = {};
      container
        .querySelectorAll("[data-citation-verdict]")
        .forEach((select) => {
          const verdict = String(select.value || "").trim();
          const key = String(select.dataset.citationKey || "").trim();
          if (verdict && key) citationVerdicts[key] = verdict;
        });
      if (data.get("citation_missing")) citationVerdicts.missing = true;
      const button = triageForm.querySelector('button[type="submit"]');
      setBusy(button, true, "儲存中…");
      try {
        detail = await api.ragFeedbackUpdate(detail.id, {
          status: String(data.get("status") || ""),
          severity: String(data.get("severity") || ""),
          actionable: Boolean(data.get("actionable")),
          expected_behavior: String(data.get("expected_behavior") || ""),
          root_cause_stage: String(data.get("root_cause_stage") || "unknown"),
          answer_verdict: String(data.get("answer_verdict") || "unknown"),
          expected_answer_mode: String(
            data.get("expected_answer_mode") || "unknown",
          ),
          expected_refusal: String(
            data.get("expected_refusal") || "unspecified",
          ),
          expected_date_from: String(data.get("expected_date_from") || ""),
          expected_date_to: String(data.get("expected_date_to") || ""),
          citation_verdicts: citationVerdicts,
          issue_id: String(data.get("issue_id") || ""),
          review_comment: String(data.get("review_comment") || ""),
        });
        render();
        toast("已儲存回饋 triage。", "ok");
        payload = await api.ragFeedbackList({
          ...filters,
          page,
          page_size: 25,
        });
        render();
      } catch (error) {
        toast(error.message || "triage 儲存失敗。", "danger");
      } finally {
        setBusy(button, false);
      }
    }
  });

  container.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-feedback-action]");
    if (actionButton) {
      const action = actionButton.dataset.feedbackAction;
      if (action === "refresh") {
        await load();
        return;
      }
      if (action === "reset") {
        filters = { sentiment: "unsatisfied" };
        page = 1;
        selectedId = null;
        detail = null;
        await load();
        return;
      }
      if (action === "prev") {
        if (page <= 1) return;
        page -= 1;
        await load();
        return;
      }
      if (action === "next") {
        if (page >= Number(payload?.pages || 1)) return;
        page += 1;
        await load();
        return;
      }
      if (action === "experiment") {
        setBusy(actionButton, true, "實驗中…");
        try {
          experiment = await api.ragFeedbackExperiment({
            filters,
            limit: 5,
            variants: EXPERIMENT_PRESETS,
          });
          render();
          toast(
            `已完成 ${formatNumber(experiment.feedback_ids?.length || 0)} 筆 A/B 參數實驗。`,
            "ok",
            6200,
          );
        } catch (error) {
          toast(error.message || "A/B 實驗失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
      if (action === "evaluate") {
        setBusy(actionButton, true, "評估中…");
        try {
          evaluation = await api.ragFeedbackEvaluate({
            filters,
            limit: 10,
          });
          render();
          toast(
            `已完成 ${formatNumber(evaluation.total || 0)} 筆批次重跑評估。`,
            "ok",
            6200,
          );
        } catch (error) {
          toast(error.message || "批次評估失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
      if (action === "export") {
        setBusy(actionButton, true, "匯出中…");
        try {
          const text = await api.ragFeedbackExport(filters);
          downloadText(
            `rag-feedback-agent-${new Date().toISOString().slice(0, 10)}.jsonl`,
            text,
            "application/x-ndjson;charset=utf-8",
          );
          toast("已匯出代理用 JSONL；不含原始留言。", "ok");
        } catch (error) {
          toast(error.message || "匯出失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
      if (action === "refresh-review") {
        await loadReviewQueue();
        toast("已重新抽樣。", "ok", 3200);
        return;
      }
      if (action === "create-issue") {
        const feedbackId = actionButton.dataset.feedbackId;
        const form = actionButton.closest("[data-feedback-triage]");
        const title = String(form?.elements.new_issue_title?.value || "").trim();
        if (title.length < 4) {
          toast("問題群組標題至少需要 4 個字。", "warn");
          form?.elements.new_issue_title?.focus();
          return;
        }
        const rootCause =
          String(form?.elements.root_cause_stage?.value || "unknown");
        const severity =
          form?.querySelector('input[name="severity"]:checked')?.value ||
          "medium";
        setBusy(actionButton, true, "建立中…");
        try {
          const issue = await api.ragFeedbackIssueCreate({
            title,
            root_cause_stage: rootCause,
            severity,
            description: "",
          });
          detail = await api.ragFeedbackUpdate(feedbackId, {
            issue_id: issue.id,
          });
          await loadIssues();
          render();
          toast(`已建立問題群組 #${issue.id} 並連結。`, "ok", 6200);
        } catch (error) {
          toast(error.message || "建立問題群組失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
      if (action === "rerun") {
        const feedbackId = actionButton.dataset.feedbackId;
        setBusy(actionButton, true, "重跑中…");
        try {
          rerun = await api.ragFeedbackRerun(feedbackId);
          render();
          toast("已完成目前系統重跑，請查看 diff。", "ok", 5200);
        } catch (error) {
          toast(error.message || "重跑失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
      if (action === "promote") {
        const feedbackId = actionButton.dataset.feedbackId;
        setBusy(actionButton, true, "建立中…");
        try {
          const result = await api.ragFeedbackPromote(feedbackId);
          detail = result.feedback;
          await loadIssues();
          render();
          toast(
            result.reused
              ? `已連結既有題庫 draft #${result.item.id}。`
              : `已建立題庫 draft #${result.item.id}（pending_review）。`,
            "ok",
            6200,
          );
          payload = await api.ragFeedbackList({
            ...filters,
            page,
            page_size: 25,
          });
          render();
        } catch (error) {
          toast(error.message || "建立題庫 draft 失敗。", "danger");
        } finally {
          setBusy(actionButton, false);
        }
        return;
      }
    }
    const reviewAction = event.target.closest("[data-review-action]");
    if (reviewAction) {
      const action = reviewAction.dataset.reviewAction;
      if (action === "close") {
        reviewCandidate = null;
        render();
        return;
      }
      if (action === "mark" && reviewCandidate) {
        setBusy(reviewAction, true, "儲存中…");
        try {
          await api.ragReviewMark(reviewCandidate.request_id, {
            status: reviewAction.dataset.reviewStatus || "reviewed",
          });
          reviewCandidate = null;
          await loadReviewQueue();
          render();
          toast("已更新主動抽樣狀態。", "ok", 4200);
        } catch (error) {
          toast(error.message || "更新抽樣狀態失敗。", "danger");
        } finally {
          setBusy(reviewAction, false);
        }
        return;
      }
    }
    const reviewOpen = event.target.closest("[data-review-open]");
    if (reviewOpen) {
      try {
        reviewCandidate = await api.ragReviewCandidate(
          reviewOpen.dataset.reviewOpen,
        );
        render();
      } catch (error) {
        toast(error.message || "無法讀取抽樣明細。", "danger");
      }
      return;
    }
    const evaluationRow = event.target.closest(
      "[data-feedback-evaluate-open]",
    );
    if (evaluationRow) {
      await loadDetail(evaluationRow.dataset.feedbackEvaluateOpen);
      return;
    }
    const issueButton = event.target.closest("[data-feedback-issue-id]");
    if (issueButton) {
      if (event.target.closest("a")) return;
      const issueId = String(issueButton.dataset.feedbackIssueId || "");
      filters.issue_id =
        String(filters.issue_id || "") === issueId ? "" : issueId;
      page = 1;
      selectedId = null;
      detail = null;
      rerun = null;
      evaluation = null;
      experiment = null;
      await load();
      return;
    }
    const row = event.target.closest("tr[data-feedback-id]");
    if (!row) return;
    await loadDetail(row.dataset.feedbackId);
  });

  renderShell();
  return {
    show() {
      if (disposed) return;
      render();
      void loadIssues();
      void loadReviewQueue();
      return load();
    },
    refresh() {
      void loadIssues();
      void loadReviewQueue();
      return load();
    },
    dispose() {
      disposed = true;
    },
  };
}
