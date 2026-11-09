import { api } from "../api.js";
import {
  downloadText,
  escapeHtml,
  formatDateTime,
  formatNumber,
  icon,
  notice,
  toast,
} from "../utils.js";

const STATUS_META = {
  draft: { label: "草稿", badge: "badge-neutral" },
  pending_review: { label: "待審", badge: "badge-warn" },
  changes_requested: { label: "退回修改", badge: "badge-warn" },
  accepted: { label: "已核准", badge: "badge-ok" },
  rejected: { label: "已拒絕", badge: "badge-danger" },
  retired: { label: "已退役", badge: "badge-neutral" },
};

const TYPE_LABELS = {
  law_concept: "法規概念",
  article_lookup: "指定條文",
  judgment_lookup: "判決檢索",
  structured: "結構化問題",
  general: "一般問題",
  refusal: "拒絕回答",
};

const DIFFICULTY_LABELS = { easy: "簡單", medium: "中等", hard: "困難" };
const TIER_LABELS = { smoke: "Smoke", core: "Core", full: "Full", holdout: "Holdout" };

function statusBadge(status) {
  const meta = STATUS_META[status] || { label: status || "未知", badge: "badge-neutral" };
  return `<span class="badge ${meta.badge}">${escapeHtml(meta.label)}</span>`;
}

function lines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseLawLines(value) {
  return lines(value).map((line) => {
    const [lawName, sourceType] = line.split("|").map((part) => part.trim());
    return { law_name: lawName || "", source_type: sourceType || "" };
  });
}

function parseArticleLines(value) {
  return lines(value).map((line) => {
    const [lawName, articleNo] = line.split("|").map((part) => part.trim());
    return { law_name: lawName || "", article_no: articleNo || "" };
  });
}

function parseJudgmentLines(value) {
  return lines(value).map((jid) => ({ jid: jid.trim() }));
}

function lawLines(item) {
  return (item?.expected_laws || [])
    .map((value) => [value.law_name, value.source_type].filter(Boolean).join("|"))
    .join("\n");
}

function articleLines(item) {
  return (item?.expected_articles || [])
    .map((value) =>
      [value.law_name || value.law_key, value.article_no].filter(Boolean).join("|"),
    )
    .join("\n");
}

function judgmentLines(item) {
  return (item?.expected_judgments || []).map((value) => value.jid).join("\n");
}

function tagsText(item) {
  return (item?.tags || []).join(", ");
}

function emptyState(text) {
  return `<div class="qb-empty">${icon("info", 18)}<span>${escapeHtml(text)}</span></div>`;
}

function metric(label, value, note = "") {
  return `<div class="qb-metric">
    <span class="summary-label">${escapeHtml(label)}</span>
    <strong>${escapeHtml(String(value))}</strong>
    ${note ? `<small>${escapeHtml(note)}</small>` : ""}
  </div>`;
}

function labelsMarkup(item) {
  const laws = (item.expected_laws || [])
    .map((value) => value.law_name)
    .filter(Boolean);
  const articles = (item.expected_articles || [])
    .map((value) => `${value.law_name || ""} ${value.article_no || ""}`.trim())
    .filter(Boolean);
  const judgments = (item.expected_judgments || [])
    .map((value) => value.jid)
    .filter(Boolean);
  const chips = [
    ...laws.map((value) => `<span class="chip">${escapeHtml(value)}</span>`),
    ...articles.map((value) => `<span class="chip">${escapeHtml(value)}</span>`),
    ...judgments.map((value) => `<span class="chip chip-mono">${escapeHtml(value)}</span>`),
  ];
  return chips.length
    ? `<div class="chips qb-labels">${chips.join("")}</div>`
    : `<span class="qb-muted">尚未標註 expected labels</span>`;
}

function createFormMarkup(item) {
  const editing = Boolean(item);
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon(editing ? "edit" : "plus", 14)}${editing ? `編輯題目 #${item.id}` : "新增題目"}</span>
      ${editing ? `<button class="btn btn-ghost btn-sm" type="button" data-qb-action="new">取消編輯</button>` : ""}
    </div>
    <form class="qb-form" data-qb-form="create" id="qb-create-form">
      <input type="hidden" name="item_id" value="${editing ? item.id : ""}" />
      <label class="field qb-wide">
        <span class="field-label">題目 <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="3" required placeholder="例如：證券交易法對內線交易有什麼規範？">${escapeHtml(item?.question || "")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">題型</span>
          <select class="select" name="question_type">${Object.entries(TYPE_LABELS)
            .map(([value, label]) => `<option value="${value}" ${item?.question_type === value ? "selected" : ""}>${label}</option>`)
            .join("")}</select>
        </label>
        <label class="field"><span class="field-label">難度</span>
          <select class="select" name="difficulty">${Object.entries(DIFFICULTY_LABELS)
            .map(([value, label]) => `<option value="${value}" ${item?.difficulty === value ? "selected" : ""}>${label}</option>`)
            .join("")}</select>
        </label>
        <label class="field"><span class="field-label">可見性</span>
          <select class="select" name="visibility">
            <option value="shared" ${item?.visibility !== "holdout" ? "selected" : ""}>共用</option>
            <option value="holdout" ${item?.visibility === "holdout" ? "selected" : ""}>Holdout</option>
          </select>
        </label>
      </div>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">預期法規／命令 <span class="field-tag">每行一筆，可加 |law/order</span></span>
          <textarea class="input" name="expected_laws" rows="3" placeholder="證券交易法&#10;銀行法|law">${escapeHtml(lawLines(item))}</textarea>
        </label>
        <label class="field"><span class="field-label">預期條文 <span class="field-tag">法規|第 157-1 條</span></span>
          <textarea class="input" name="expected_articles" rows="3" placeholder="證券交易法|第 157-1 條&#10;證券交易法|第 171 條">${escapeHtml(articleLines(item))}</textarea>
        </label>
        <label class="field"><span class="field-label">預期判決 <span class="field-tag">jid，每行一筆</span></span>
          <textarea class="input" name="expected_judgments" rows="3" placeholder="TPDM,113,金訴,27,20241128,1">${escapeHtml(judgmentLines(item))}</textarea>
        </label>
      </div>
      <label class="field"><span class="field-label">參考答案／rubric 說明</span>
        <textarea class="input" name="reference_answer" rows="4" placeholder="提供給 LLM judge 與人工驗收參考；可留空，但品質評分會較弱。">${escapeHtml(item?.reference_answer || "")}</textarea>
      </label>
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">標籤 <span class="field-tag">逗號分隔</span></span>
          <input class="input" name="tags" value="${escapeHtml(tagsText(item))}" placeholder="內線交易, 證券交易法" />
        </label>
        <label class="field"><span class="field-label">備註</span>
          <input class="input" name="notes" value="${escapeHtml(item?.notes || "")}" placeholder="來源、標註理由或待確認事項" />
        </label>
      </div>
      <label class="checkbox-field qb-checkbox">
        <input type="checkbox" name="must_refuse" ${item?.rubric?.must_refuse ? "checked" : ""} />
        <span>此題應正確拒絕回答（無資料／超出範圍）</span>
      </label>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${icon("check", 14)}<span>${editing ? "儲存新版本" : "建立題目"}</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">清除</button>
      </div>
      <div class="qb-form-hint">修改已存在的題目會建立新版本；已核准題目修改後會回到待審，需重新驗收。</div>
    </form>
    <details class="qb-import">
      <summary>${icon("upload", 14)}JSON 批次匯入</summary>
      <p class="qb-muted">格式：<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>。相同題目 fingerprint 預設更新。</p>
      <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${icon("upload", 13)}<span>匯入 JSON</span></button>
      </div>
    </details>
  </section>`;
}

function itemCardMarkup(item, { reviewMode = false } = {}) {
  return `<article class="qb-item" data-qb-item="${item.id}">
    <div class="qb-item-head">
      <span class="qb-id">#${item.id}</span>
      <div class="qb-item-title">
        <strong>${escapeHtml(item.question)}</strong>
        <span class="qb-meta">
          ${escapeHtml(TYPE_LABELS[item.question_type] || item.question_type)}
          · ${escapeHtml(DIFFICULTY_LABELS[item.difficulty] || item.difficulty)}
          · v${item.version}
          ${item.stale ? " · <span class=\"qb-stale\">待重新驗收</span>" : ""}
          ${item.benchmark_ready ? " · <span class=\"qb-ready\">Benchmark ready</span>" : ""}
        </span>
      </div>
      ${statusBadge(item.status)}
    </div>
    <div class="qb-fingerprint mono">fingerprint ${escapeHtml(item.fingerprint?.slice(0, 16) || "—")}</div>
    ${labelsMarkup(item)}
    <div class="qb-item-foot">
      <span>更新 ${escapeHtml(formatDateTime(item.updated_at))}</span>
      ${item.reviewed_by ? `<span>審核 ${escapeHtml(item.reviewed_by)}</span>` : ""}
      ${item.review_comment ? `<span class="qb-comment">${escapeHtml(item.review_comment)}</span>` : ""}
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${item.id}">${icon("edit", 13)}<span>編輯</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${item.id}">${icon("shield", 13)}<span>${reviewMode ? "批注" : "驗收"}</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${item.id}">${icon("trash", 13)}<span>刪除</span></button>
      </div>
    </div>
  </article>`;
}

function manageMarkup(state) {
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("database", 14)}題庫管理</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="new">${icon("plus", 13)}<span>新增</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="revalidate">${icon("refresh", 13)}<span>重新驗證</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="export">${icon("download", 13)}<span>匯出 JSON</span></button>
      </div>
    </div>
    <form class="qb-filters" data-qb-form="filter">
      <input class="input" name="query" type="search" placeholder="搜尋題目或參考答案" value="${escapeHtml(state.filters.query)}" />
      <select class="select" name="status">
        <option value="">全部狀態</option>
        ${Object.entries(STATUS_META).map(([value, meta]) => `<option value="${value}" ${state.filters.status === value ? "selected" : ""}>${meta.label}</option>`).join("")}
      </select>
      <select class="select" name="question_type">
        <option value="">全部題型</option>
        ${Object.entries(TYPE_LABELS).map(([value, label]) => `<option value="${value}" ${state.filters.question_type === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
      <select class="select" name="difficulty">
        <option value="">全部難度</option>
        ${Object.entries(DIFFICULTY_LABELS).map(([value, label]) => `<option value="${value}" ${state.filters.difficulty === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
      <input class="input" name="tag" placeholder="標籤" value="${escapeHtml(state.filters.tag)}" />
      <button class="btn btn-primary btn-sm" type="submit">${icon("search", 13)}<span>篩選</span></button>
    </form>
    <div class="qb-list">
      ${state.items.length ? state.items.map((item) => itemCardMarkup(item)).join("") : emptyState("目前沒有符合條件的題目。")}
    </div>
    <div class="qb-pagination">
      <span>共 ${formatNumber(state.total)} 題</span>
      <div class="qb-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="prev" ${state.offset <= 0 ? "disabled" : ""}>上一頁</button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="next" ${state.offset + state.limit >= state.total ? "disabled" : ""}>下一頁</button>
      </div>
    </div>
  </section>`;
}

function reviewPanelMarkup(state) {
  const selected = state.reviewDetail;
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("shield", 14)}題庫人工驗收批注</span>
      <span class="badge badge-warn">待審 ${formatNumber(state.stats.pending_review || 0)}</span>
    </div>
    <label class="field qb-reviewer-field">
      <span class="field-label">驗收者名稱</span>
      <input class="input" id="qb-reviewer-name" value="${escapeHtml(state.reviewer)}" placeholder="目前任何人可驗收；Google Auth 後改由管理者" />
    </label>
    ${
      selected
        ? `<div class="qb-review-detail">
            <button class="btn btn-ghost btn-sm" type="button" data-qb-action="review-back">${icon("chevronLeft", 13)}<span>返回待審列表</span></button>
            ${itemCardMarkup(selected, { reviewMode: true })}
            ${labelsMarkup(selected)}
            ${selected.reference_answer ? `<div class="qb-reference"><span class="summary-label">參考答案</span><p>${escapeHtml(selected.reference_answer)}</p></div>` : ""}
            <form class="qb-review-form" data-qb-form="review" data-id="${selected.id}">
              <div class="qb-score-grid">
                ${[
                  ["clarity", "題目清晰"],
                  ["labels", "法規／條文標註"],
                  ["answer", "參考答案"],
                  ["difficulty", "難度與標籤"],
                  ["overall", "整體"],
                ].map(([key, label]) => `<label class="field"><span class="field-label">${label} <span class="field-tag">1–5</span></span><input class="input" type="number" min="1" max="5" name="score_${key}" value="4" /></label>`).join("")}
              </div>
              <label class="field"><span class="field-label">批注</span><textarea class="input" name="comment" rows="3" placeholder="標註理由、需要修改的欄位，或驗收結論。"></textarea></label>
              <div class="qb-actions">
                <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${icon("check", 13)}<span>核准</span></button>
                <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${icon("edit", 13)}<span>退回修改</span></button>
                <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${icon("x", 13)}<span>拒絕</span></button>
              </div>
            </form>
            ${
              selected.reviews?.length
                ? `<div class="qb-review-history"><span class="summary-label">審核紀錄</span>${selected.reviews.map((review) => `<div class="qb-review-row"><span>${escapeHtml(review.reviewer || "匿名")}</span>${statusBadge(review.decision === "approved" ? "accepted" : review.decision)}<span>${escapeHtml(formatDateTime(review.created_at))}</span><p>${escapeHtml(review.comment || "—")}</p></div>`).join("")}</div>`
                : ""
            }
          </div>`
        : `<div class="qb-list">${state.reviewItems.length ? state.reviewItems.map((item) => itemCardMarkup(item, { reviewMode: true })).join("") : emptyState("目前沒有待審題目。")}</div>`
    }
  </section>`;
}

function suiteMarkup(state) {
  const editing = state.editingSuite;
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("cube", 14)}Benchmark 題庫</span>
      <span class="badge badge-info">${formatNumber(state.ready.length)} benchmark-ready</span>
    </div>
    <form class="qb-suite-form" data-qb-form="suite">
      <input type="hidden" name="suite_id" value="${editing?.id || ""}" />
      <div class="qb-form-grid">
        <label class="field"><span class="field-label">Suite 名稱</span><input class="input" name="name" required value="${escapeHtml(editing?.name || "Pilot 30")}" /></label>
        <label class="field"><span class="field-label">等級</span><select class="select" name="tier">${Object.entries(TIER_LABELS).map(([value, label]) => `<option value="${value}" ${editing?.tier === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      </div>
      <label class="field"><span class="field-label">說明</span><input class="input" name="description" value="${escapeHtml(editing?.description || "30 題 pilot；用於 RAG benchmark 與長期同題比較。")}" /></label>
      <div class="qb-check-list">
        ${state.ready.length
          ? state.ready
              .map((item) => {
                const checked = editing
                  ? editing.items?.some((entry) => Number(entry.id) === Number(item.id))
                  : true;
                return `<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${item.id}" ${checked ? "checked" : ""}/><span><strong>#${item.id}</strong> ${escapeHtml(item.question)} <small>${escapeHtml(TYPE_LABELS[item.question_type] || item.question_type)}</small></span></label>`;
              })
              .join("")
          : emptyState("沒有已驗收且 benchmark-ready 的題目；請先完成人工驗收。")}
      </div>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit">${icon("check", 14)}<span>${editing ? "儲存 suite" : "建立 suite"}</span></button>
        ${editing ? `<button class="btn btn-secondary" type="button" data-qb-action="suite-new">取消編輯</button>` : ""}
      </div>
    </form>
    <div class="qb-list">
      ${state.suites.length ? state.suites.map((suite) => `<article class="qb-suite">
        <div class="qb-item-head">
          <div class="qb-item-title"><strong>${escapeHtml(suite.name)}</strong><span class="qb-meta">${escapeHtml(TIER_LABELS[suite.tier] || suite.tier)} · v${suite.version} · ${formatNumber(suite.item_count)} 題</span></div>
          <span class="badge ${suite.status === "frozen" ? "badge-ok" : "badge-neutral"}">${suite.status === "frozen" ? "已凍結" : "草稿"}</span>
        </div>
        <div class="qb-suite-items">${(suite.items || []).slice(0, 8).map((item) => `<span class="chip">#${item.id} ${escapeHtml(item.question.slice(0, 22))}${item.question.length > 22 ? "…" : ""}</span>`).join("")}${suite.item_count > 8 ? `<span class="qb-muted">+${suite.item_count - 8}</span>` : ""}</div>
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${suite.id}">${icon("edit", 13)}<span>編輯題目</span></button>
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${suite.id}">${icon("shield", 13)}<span>凍結</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${suite.id}">${icon("trash", 13)}<span>刪除</span></button>
        </div>
      </article>`).join("") : emptyState("尚未建立 benchmark suite。")}
    </div>
  </section>`;
}

function reviewScores(form) {
  const values = {};
  for (const key of ["clarity", "labels", "answer", "difficulty", "overall"]) {
    const input = form.querySelector(`[name="score_${key}"]`);
    const number = Number(input?.value);
    if (Number.isFinite(number)) values[key] = Math.max(1, Math.min(5, Math.round(number)));
  }
  return values;
}

function readCreatePayload(form) {
  const data = new FormData(form);
  return {
    question: String(data.get("question") || "").trim(),
    question_type: String(data.get("question_type") || "general"),
    difficulty: String(data.get("difficulty") || "medium"),
    visibility: String(data.get("visibility") || "shared"),
    expected_laws: parseLawLines(data.get("expected_laws")),
    expected_articles: parseArticleLines(data.get("expected_articles")),
    expected_judgments: parseJudgmentLines(data.get("expected_judgments")),
    reference_answer: String(data.get("reference_answer") || "").trim(),
    tags: String(data.get("tags") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    notes: String(data.get("notes") || "").trim(),
    rubric: { must_refuse: Boolean(form.elements.must_refuse?.checked) },
  };
}

export function createQuestionBankController(
  root,
  { onNavigate = null, onStats = null } = {},
) {
  const panelNames = {
    create: "question-create",
    manage: "question-manage",
    suite: "benchmark-bank",
    review: "question-review",
  };
  const state = {
    tab: "",
    editing: null,
    editingSuite: null,
    items: [],
    total: 0,
    offset: 0,
    limit: 50,
    filters: {
      query: "",
      status: "",
      question_type: "",
      difficulty: "",
      tag: "",
    },
    stats: {},
    suites: [],
    ready: [],
    reviewItems: [],
    reviewDetail: null,
    reviewer: (() => {
      try {
        return window.localStorage.getItem("judgment.reviewer") || "anonymous";
      } catch (error) {
        return "anonymous";
      }
    })(),
  };

  const panel = (name) => root.querySelector(`#quality-panel-${panelNames[name]}`);

  const setReviewer = (value) => {
    state.reviewer = String(value || "").trim() || "anonymous";
    try {
      window.localStorage.setItem("judgment.reviewer", state.reviewer);
    } catch (error) {
      /* local preference only */
    }
  };

  const notifyStats = () => {
    if (onStats) onStats(state.stats);
  };

  const navigate = (tab) => {
    if (onNavigate) onNavigate(tab);
    show(tab);
  };

  const loadStats = async () => {
    try {
      state.stats = await api.questionBankStats();
    } catch (error) {
      state.stats = {};
    }
    notifyStats();
  };

  const renderCreate = () => {
    const target = panel("create");
    if (!target) return;
    target.innerHTML = createFormMarkup(state.editing);
  };

  const loadManage = async () => {
    const target = panel("manage");
    if (!target) return;
    target.innerHTML = `<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>讀取題庫中…</span></div></section>`;
    try {
      const result = await api.questionBankItems(
        state.filters,
        state.limit,
        state.offset,
      );
      state.items = result.items || [];
      state.total = Number(result.total || 0);
      state.stats = result.stats || state.stats;
      target.innerHTML = manageMarkup(state);
      notifyStats();
    } catch (error) {
      target.innerHTML = `<section class="report-card qb-card">${notice({
        tone: "danger",
        title: "題庫讀取失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}</section>`;
    }
  };

  const loadSuites = async () => {
    const target = panel("suite");
    if (!target) return;
    target.innerHTML = `<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>讀取 benchmark 題庫中…</span></div></section>`;
    try {
      const [suitesResult, readyResult] = await Promise.all([
        api.benchmarkSuites(),
        api.benchmarkReadyQuestions(300),
      ]);
      state.suites = suitesResult.suites || [];
      state.ready = readyResult.items || [];
      target.innerHTML = suiteMarkup(state);
    } catch (error) {
      target.innerHTML = `<section class="report-card qb-card">${notice({
        tone: "danger",
        title: "Benchmark 題庫讀取失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}</section>`;
    }
  };

  const loadReview = async () => {
    const target = panel("review");
    if (!target) return;
    target.innerHTML = `<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>讀取待審題目中…</span></div></section>`;
    try {
      const [pending, changes] = await Promise.all([
        api.questionBankItems({ status: "pending_review" }, 100, 0),
        api.questionBankItems({ status: "changes_requested" }, 100, 0),
      ]);
      state.reviewItems = [...(pending.items || []), ...(changes.items || [])];
      state.stats = pending.stats || state.stats;
      if (state.reviewDetail) {
        state.reviewDetail = await api.questionBankItem(state.reviewDetail.id);
      }
      target.innerHTML = reviewPanelMarkup(state);
      const reviewerInput = target.querySelector("#qb-reviewer-name");
      if (reviewerInput) {
        reviewerInput.value = state.reviewer;
        reviewerInput.addEventListener("change", () => setReviewer(reviewerInput.value));
      }
      notifyStats();
    } catch (error) {
      target.innerHTML = `<section class="report-card qb-card">${notice({
        tone: "danger",
        title: "待審題目讀取失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}</section>`;
    }
  };

  function show(tab) {
    state.tab = tab;
    for (const name of Object.keys(panelNames)) {
      const element = panel(name);
      if (element) element.hidden = name !== tab;
    }
    if (tab === "create") {
      renderCreate();
    } else if (tab === "manage") {
      loadManage();
    } else if (tab === "suite") {
      loadSuites();
    } else if (tab === "review") {
      loadReview();
    }
  }

  const openReview = (id) => {
    const item = state.items.find((entry) => Number(entry.id) === Number(id));
    state.reviewDetail = item || { id: Number(id) };
    navigate("review");
  };

  const handleCreate = async (form) => {
    const payload = readCreatePayload(form);
    const itemId = Number(form.elements.item_id?.value || 0);
    try {
      if (itemId) {
        await api.updateQuestionBankItem(itemId, {
          ...payload,
          change_note: "題庫管理修改",
        });
        toast("已建立新版本，狀態回到待審。", "ok");
      } else {
        await api.createQuestionBankItem(payload);
        toast("題目已建立。", "ok");
      }
      state.editing = null;
      await loadStats();
      navigate("manage");
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message = detail?.errors?.join(" · ") || detail?.message || error.message || "題目儲存失敗。";
      toast(message, "danger", 8000);
    }
  };

  const handleReviewDecision = async (form, decision) => {
    const itemId = Number(form.dataset.id || 0);
    if (!itemId) return;
    try {
      await api.reviewQuestionBankItem(itemId, {
        decision,
        reviewer: state.reviewer,
        rubric_scores: reviewScores(form),
        comment: String(form.querySelector('[name="comment"]')?.value || ""),
      });
      toast(
        decision === "approved"
          ? "題目已核准。"
          : decision === "changes_requested"
            ? "已退回修改。"
            : "題目已拒絕。",
        decision === "approved" ? "ok" : "info",
      );
      state.reviewDetail = null;
      await loadStats();
      await loadReview();
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message = detail?.errors?.join(" · ") || detail?.message || error.message || "驗收失敗。";
      toast(message, "danger", 8000);
    }
  };

  const handleSuiteSubmit = async (form) => {
    const data = new FormData(form);
    const suiteId = Number(data.get("suite_id") || 0);
    const itemIds = Array.from(
      form.querySelectorAll('input[name="item_ids"]:checked'),
    ).map((input) => Number(input.value));
    const payload = {
      name: String(data.get("name") || "").trim(),
      tier: String(data.get("tier") || "core"),
      description: String(data.get("description") || "").trim(),
      item_ids: itemIds,
    };
    try {
      if (suiteId) {
        await api.updateBenchmarkSuite(suiteId, payload);
        toast("Benchmark 題庫已更新。", "ok");
      } else {
        await api.createBenchmarkSuite(payload);
        toast("Benchmark 題庫已建立。", "ok");
      }
      state.editingSuite = null;
      await loadSuites();
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message = detail?.errors?.join(" · ") || detail?.message || error.message || "Suite 儲存失敗。";
      toast(message, "danger", 8000);
    }
  };

  const onClick = async (event) => {
    const action = event.target.closest("[data-qb-action]")?.dataset.qbAction;
    if (!action) return;
    const button = event.target.closest("[data-qb-action]");
    const id = Number(button.dataset.id || 0);
    if (action === "new") {
      state.editing = null;
      navigate("create");
      return;
    }
    if (action === "reset-create") {
      state.editing = null;
      renderCreate();
      return;
    }
    if (action === "edit") {
      const item = state.items.find((entry) => Number(entry.id) === id);
      if (!item) return;
      state.editing = item;
      navigate("create");
      return;
    }
    if (action === "review") {
      openReview(id);
      return;
    }
    if (action === "review-back") {
      state.reviewDetail = null;
      loadReview();
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`確定刪除題目 #${id}？題目會標記為 retired，歷史 benchmark 仍會保留。`)) return;
      try {
        await api.deleteQuestionBankItem(id);
        toast("題目已刪除。", "info");
        await loadStats();
        await loadManage();
      } catch (error) {
        toast(error.message || "刪除失敗。", "danger");
      }
      return;
    }
    if (action === "revalidate") {
      try {
        const result = await api.revalidateQuestionBank();
        toast(`已重新驗證 ${formatNumber(result.checked || 0)} 題，${formatNumber(result.stale || 0)} 題需重新驗收。`, "info", 7000);
        await loadStats();
        await loadManage();
      } catch (error) {
        toast(error.message || "重新驗證失敗。", "danger");
      }
      return;
    }
    if (action === "export") {
      try {
        const payload = await api.exportQuestionBank({ status: "" });
        downloadText(
          `judgment-question-bank-${new Date().toISOString().slice(0, 10)}.json`,
          JSON.stringify(payload, null, 2),
          "application/json;charset=utf-8",
        );
      } catch (error) {
        toast(error.message || "匯出失敗。", "danger");
      }
      return;
    }
    if (action === "import-json") {
      const textarea = root.querySelector("#qb-import-json");
      try {
        const payload = JSON.parse(String(textarea?.value || "").trim());
        const result = await api.importQuestionBank(payload);
        toast(`匯入完成：新增 ${result.created}、更新 ${result.updated}、錯誤 ${(result.errors || []).length}。`, (result.errors || []).length ? "warn" : "ok", 8000);
        if (textarea) textarea.value = "";
        await loadStats();
        await loadManage();
      } catch (error) {
        toast(error.message || "JSON 匯入失敗。", "danger", 8000);
      }
      return;
    }
    if (action === "prev" || action === "next") {
      state.offset = Math.max(
        0,
        state.offset + (action === "next" ? state.limit : -state.limit),
      );
      await loadManage();
      return;
    }
    if (action === "suite-edit") {
      const suite = state.suites.find((entry) => Number(entry.id) === id);
      if (!suite) return;
      state.editingSuite = suite;
      loadSuites();
      return;
    }
    if (action === "suite-new") {
      state.editingSuite = null;
      loadSuites();
      return;
    }
    if (action === "suite-freeze") {
      try {
        await api.updateBenchmarkSuite(id, { freeze: true });
        toast("Benchmark 題庫已凍結並建立新版本。", "ok");
        state.editingSuite = null;
        await loadSuites();
      } catch (error) {
        toast(error.message || "凍結失敗。", "danger");
      }
      return;
    }
    if (action === "suite-delete") {
      if (!window.confirm(`確定刪除 benchmark 題庫 #${id}？歷史 run 仍會保留 snapshot。`)) return;
      try {
        await api.deleteBenchmarkSuite(id);
        toast("Benchmark 題庫已刪除。", "info");
        state.editingSuite = null;
        await loadSuites();
      } catch (error) {
        toast(error.message || "刪除失敗。", "danger");
      }
      return;
    }
    if (action === "decide") {
      const form = button.closest("form[data-qb-form='review']");
      if (form) {
        await handleReviewDecision(form, String(button.dataset.decision || ""));
      }
    }
  };

  const onSubmit = async (event) => {
    const form = event.target.closest("[data-qb-form]");
    if (!form) return;
    event.preventDefault();
    const kind = form.dataset.qbForm;
    if (kind === "create") {
      await handleCreate(form);
    } else if (kind === "filter") {
      const data = new FormData(form);
      state.filters = {
        query: String(data.get("query") || "").trim(),
        status: String(data.get("status") || ""),
        question_type: String(data.get("question_type") || ""),
        difficulty: String(data.get("difficulty") || ""),
        tag: String(data.get("tag") || "").trim(),
      };
      state.offset = 0;
      await loadManage();
    } else if (kind === "suite") {
      await handleSuiteSubmit(form);
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);

  const refresh = async () => {
    await loadStats();
    if (state.tab === "create") renderCreate();
    else if (state.tab === "manage") await loadManage();
    else if (state.tab === "suite") await loadSuites();
    else if (state.tab === "review") await loadReview();
  };

  loadStats();

  return {
    show,
    refresh,
    destroy() {
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", onSubmit);
    },
    getStats: () => state.stats,
  };
}
