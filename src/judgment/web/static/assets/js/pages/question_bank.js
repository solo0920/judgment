import { api } from "../api.js";
import {
  downloadText,
  escapeHtml,
  formatDateTime,
  formatDuration,
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
  retired: { label: "已刪除／退役", badge: "badge-neutral" },
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

function importMarkup() {
  return `<details class="qb-import">
    <summary>${icon("upload", 14)}JSON 批次匯入</summary>
    <p class="qb-muted">格式：<code>{"items":[{question, question_type, difficulty, expected_laws, expected_articles, expected_judgments, reference_answer, tags, rubric}]}</code>。相同題目 fingerprint 預設更新。</p>
    <textarea class="input" id="qb-import-json" rows="6" placeholder='{"items":[...]}'></textarea>
    <div class="qb-actions">
      <button class="btn btn-secondary btn-sm" type="button" data-qb-action="import-json">${icon("upload", 13)}<span>匯入 JSON</span></button>
    </div>
  </details>`;
}

function aiResultMarkup(result) {
  const item = result?.item || {};
  const warnings = Array.isArray(result?.warnings) ? result.warnings : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];
  return `<section class="report-card qb-card qb-ai-result">
    <div class="side-card-head">
      <span class="side-card-title">${icon("sparkles", 14)}Ollama 已建立題目 #${item.id}</span>
      ${statusBadge(item.status)}
    </div>
    <div class="qb-ai-answer">
      <strong>${escapeHtml(item.question || "")}</strong>
      <div class="qb-ai-meta">
        ${escapeHtml(TYPE_LABELS[item.question_type] || item.question_type || "")}
        · ${escapeHtml(DIFFICULTY_LABELS[item.difficulty] || item.difficulty || "")}
        · ${escapeHtml(result?.model || "本機 Ollama")}
      </div>
      ${labelsMarkup(item)}
      ${
        item.reference_answer
          ? `<div class="qb-reference"><span class="summary-label">Ollama 參考答案</span><p>${escapeHtml(item.reference_answer)}</p></div>`
          : ""
      }
      ${
        tags.length
          ? `<div class="chips">${tags.map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>`
          : ""
      }
      ${
        warnings.length
          ? `<div class="qb-ai-warnings"><strong>需要注意</strong><ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul></div>`
          : ""
      }
      <div class="qb-actions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="review-ai-item">${icon("shield", 13)}<span>前往驗收</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="reset-ai">${icon("plus", 13)}<span>再新增一題</span></button>
      </div>
    </div>
    ${importMarkup()}
  </section>`;
}

function aiCreateFormMarkup(state) {
  if (state.aiResult) return aiResultMarkup(state.aiResult);
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("sparkles", 14)}AI 題庫新增</span>
      <span class="badge badge-neutral">本機 Ollama</span>
    </div>
    <form class="qb-form qb-ai-form" data-qb-form="ai-create" id="qb-create-form">
      <label class="field qb-wide">
        <span class="field-label">題目 <span class="field-tag">question</span></span>
        <textarea class="input" name="question" rows="4" required placeholder="輸入問題，Ollama 會回答並自動判斷題型、難度、法規／條文、參考答案與標籤。">${escapeHtml(state.aiQuestion || "")}</textarea>
      </label>
      <p class="qb-form-hint">送出後由本機 Ollama 回答並自動建立欄位；題目會以「待審」建立，仍需人工覆核後才會成為 benchmark-ready。</p>
      <div class="qb-actions">
        <button class="btn btn-primary" type="submit" ${state.aiLoading ? "disabled" : ""}>${
          state.aiLoading
            ? `<span class="spinner"></span><span>Ollama 產生中…</span>`
            : `${icon("sparkles", 14)}<span>讓 Ollama 產生並建立</span>`
        }</button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-ai" ${state.aiLoading ? "disabled" : ""}>清除</button>
      </div>
    </form>
    ${importMarkup()}
  </section>`;
}

function manualFormMarkup(item) {
  return `<section class="report-card qb-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("edit", 14)}編輯題目 #${item.id}</span>
      <button class="btn btn-ghost btn-sm" type="button" data-qb-action="new">取消編輯</button>
    </div>
    <form class="qb-form" data-qb-form="create" id="qb-create-form">
      <input type="hidden" name="item_id" value="${item.id}" />
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
        <button class="btn btn-primary" type="submit">${icon("check", 14)}<span>儲存新版本</span></button>
        <button class="btn btn-secondary" type="button" data-qb-action="reset-create">清除</button>
      </div>
      <div class="qb-form-hint">修改已存在的題目會建立新版本；已核准題目修改後會回到待審，需重新驗收。</div>
    </form>
    ${importMarkup()}
  </section>`;
}

function createFormMarkup(item, state) {
  return item ? manualFormMarkup(item) : aiCreateFormMarkup(state);
}

function itemCardMarkup(item) {
  const retired = item.status === "retired" || Boolean(item.deleted_at);
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
        ${
          retired
            ? `<button class="btn btn-primary btn-sm" type="button" data-qb-action="restore" data-id="${item.id}">${icon("refresh", 13)}<span>復原題目</span></button>`
            : `<button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${item.id}">${icon("edit", 13)}<span>編輯</span></button>
               ${
                 !["pending_review", "changes_requested"].includes(item.status)
                   ? `<button class="btn btn-secondary btn-sm" type="button" data-qb-action="submit-review" data-id="${item.id}">${icon("upload", 13)}<span>${item.status === "draft" ? "送審" : "重新送審"}</span></button>`
                   : ""
               }
               <button class="btn btn-secondary btn-sm" type="button" data-qb-action="review" data-id="${item.id}">${icon("shield", 13)}<span>驗收</span></button>
               <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${item.id}">${icon("trash", 13)}<span>刪除</span></button>`
        }
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
      <div class="qb-tag-filter" data-qb-tag-filter>
        <div class="qb-tag-values">
          ${
            state.filters.tags.length
              ? state.filters.tags
                  .map(
                    (tag) =>
                      `<span class="chip qb-tag-chip">${escapeHtml(tag)}<button class="qb-tag-remove" type="button" data-qb-action="remove-tag" data-tag="${escapeHtml(tag)}" aria-label="移除標籤 ${escapeHtml(tag)}">${icon("x", 9)}</button></span>`,
                  )
                  .join("")
              : `<span class="qb-tag-placeholder">標籤</span>`
          }
        </div>
        <button class="qb-tag-add" type="button" data-qb-action="open-tag-search" aria-label="加入標籤" aria-haspopup="listbox">${icon("plus", 13)}</button>
        ${state.filters.tags
          .map(
            (tag) =>
              `<input type="hidden" name="tags" value="${escapeHtml(tag)}" />`,
          )
          .join("")}
        <div class="qb-tag-popover" data-qb-tag-popover hidden>
          <input class="input" type="search" data-qb-tag-search placeholder="輸入相近字搜尋標籤…" autocomplete="off" />
          <div class="qb-tag-results" data-qb-tag-results role="listbox" aria-live="polite"></div>
        </div>
      </div>
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

const REVIEW_FILTERS = [
  ["queue", "待審／退回"],
  ["accepted", "已核准"],
  ["rejected", "已拒絕"],
  ["draft", "草稿"],
];

function reviewCounts(state) {
  const stats = state.stats || {};
  return {
    queue:
      Number(stats.pending_review || 0) + Number(stats.changes_requested || 0),
    accepted: Number(stats.accepted || 0),
    rejected: Number(stats.rejected || 0),
    draft: Number(stats.draft || 0),
  };
}

function reviewEmptyMarkup(state, counts) {
  const filter = state.reviewFilter || "queue";
  const copy = {
    queue: {
      title: "目前沒有待審或退回修改的題目。",
      text: counts.accepted
        ? `已有 ${formatNumber(counts.accepted)} 題核准。新題目建立後會自動送審，也可以切換到「已核准」重新驗收既有題目。`
        : "建立題目後會預設送交人工驗收；若只想先保存，建立時取消勾選「立即送審」即可存成草稿。",
    },
    accepted: {
      title: "目前沒有已核准題目。",
      text: "題目通過人工驗收後會列在這裡；也可以在題庫管理按「送審」送出驗收。",
    },
    rejected: {
      title: "目前沒有已拒絕題目。",
      text: "被拒絕的題目會保留在題庫中，可修改後重新送審。",
    },
    draft: {
      title: "目前沒有草稿題目。",
      text: "建立題目時取消勾選「立即送審」就會存成草稿，之後可在題庫管理按「送審」。",
    },
  }[filter] || {
    title: "目前沒有題目。",
    text: "建立新題目後會出現在這裡。",
  };
  const actions = [
    filter !== "draft"
      ? `<button class="btn btn-primary btn-sm" type="button" data-qb-action="new">${icon("plus", 13)}<span>新增題目</span></button>`
      : "",
    filter === "queue" && counts.accepted
      ? `<button class="btn btn-secondary btn-sm" type="button" data-qb-action="review-filter" data-filter="accepted">${icon("shield", 13)}<span>查看已核准 ${formatNumber(counts.accepted)}</span></button>`
      : "",
    `<button class="btn btn-secondary btn-sm" type="button" data-qb-action="go-manage">${icon("database", 13)}<span>前往題庫管理</span></button>`,
  ]
    .filter(Boolean)
    .join("");
  return `<div class="qb-empty qb-empty-block">
    <span class="qb-empty-icon">${icon("info", 18)}</span>
    <div class="qb-empty-copy">
      <strong>${escapeHtml(copy.title)}</strong>
      <p>${escapeHtml(copy.text)}</p>
      <div class="qb-actions">${actions}</div>
    </div>
  </div>`;
}

function reviewFilterLabel(filter) {
  const entry = REVIEW_FILTERS.find(([key]) => key === filter);
  return entry ? entry[1] : "待審／退回";
}

function reviewItemRowMarkup(item, selected) {
  return `<button class="qb-review-item${selected ? " is-active" : ""}" type="button" data-qb-action="select-review-item" data-id="${item.id}" aria-pressed="${selected ? "true" : "false"}">
    <span class="qb-review-item-top">
      <span class="qb-id">#${item.id}</span>
      <span class="qb-review-item-meta">
        ${escapeHtml(TYPE_LABELS[item.question_type] || item.question_type)}
        · ${escapeHtml(DIFFICULTY_LABELS[item.difficulty] || item.difficulty)}
        · v${item.version}
        ${item.benchmark_ready ? " · Benchmark ready" : ""}
        ${item.stale ? ' · <span class="qb-stale">待重新驗收</span>' : ""}
      </span>
      ${statusBadge(item.status)}
    </span>
    <strong>${escapeHtml(item.question)}</strong>
  </button>`;
}

function reviewDetailPaneMarkup(item) {
  return `<article class="qb-review-pane-card">
    <div class="qb-review-pane-head">
      <div class="qb-review-pane-title">
        <span class="qb-review-item-meta">#${item.id} · v${item.version} · ${escapeHtml(TYPE_LABELS[item.question_type] || item.question_type)} · ${escapeHtml(DIFFICULTY_LABELS[item.difficulty] || item.difficulty)}</span>
        <strong>${escapeHtml(item.question)}</strong>
      </div>
      <div class="qb-review-pane-side">
        ${statusBadge(item.status)}
        <div class="qb-actions">
          <button class="btn btn-secondary btn-sm" type="button" data-qb-action="edit" data-id="${item.id}">${icon("edit", 13)}<span>編輯</span></button>
          <button class="btn btn-ghost btn-sm" type="button" data-qb-action="delete" data-id="${item.id}">${icon("trash", 13)}<span>刪除</span></button>
        </div>
      </div>
    </div>
    <div class="qb-fingerprint mono">fingerprint ${escapeHtml(item.fingerprint?.slice(0, 16) || "—")}</div>
    ${labelsMarkup(item)}
    ${item.review_comment ? `<div class="qb-review-note"><span class="summary-label">最近批注${item.reviewed_by ? ` · ${escapeHtml(item.reviewed_by)}` : ""}</span><p>${escapeHtml(item.review_comment)}</p></div>` : ""}
    ${item.reference_answer ? `<div class="qb-reference"><span class="summary-label">參考答案</span><p>${escapeHtml(item.reference_answer)}</p></div>` : ""}
    <form class="qb-review-form" data-qb-form="review" data-id="${item.id}">
      <div class="qb-score-grid">
        ${[
          ["clarity", "題目清晰"],
          ["labels", "法條標注"],
          ["answer", "參考答案"],
          ["difficulty", "難度與標籤"],
          ["overall", "整體"],
        ].map(([key, label]) => `<label class="field"><span class="field-label">${label} <span class="field-tag">1–5</span></span><input class="input" type="number" min="1" max="5" name="score_${key}" value="4" /></label>`).join("")}
      </div>
      <label class="field"><span class="field-label">批注</span><textarea class="input" name="comment" rows="3" placeholder="標註理由、需要修改的欄位，或驗收結論。"></textarea></label>
      <div class="qb-actions qb-review-decisions">
        <button class="btn btn-primary btn-sm" type="button" data-qb-action="decide" data-decision="approved">${icon("check", 13)}<span>核准</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-qb-action="decide" data-decision="changes_requested">${icon("edit", 13)}<span>退回修改</span></button>
        <button class="btn btn-ghost btn-sm" type="button" data-qb-action="decide" data-decision="rejected">${icon("x", 13)}<span>拒絕</span></button>
      </div>
    </form>
    ${
      item.reviews?.length
        ? `<div class="qb-review-history"><span class="summary-label">審核紀錄</span>${item.reviews.map((review) => `<div class="qb-review-row"><span>${escapeHtml(review.reviewer || "匿名")}</span>${statusBadge(review.decision === "approved" ? "accepted" : review.decision)}<span>${escapeHtml(formatDateTime(review.created_at))}</span><p>${escapeHtml(review.comment || "—")}</p></div>`).join("")}</div>`
        : ""
    }
  </article>`;
}

function reviewPlaceholderMarkup() {
  return `<div class="qb-empty qb-empty-block qb-review-placeholder">
    <span class="qb-empty-icon">${icon("info", 18)}</span>
    <div class="qb-empty-copy">
      <strong>從左側選擇題目</strong>
      <p>點選題目後，這裡會顯示題幹、預期標註、參考答案與核准選項。</p>
    </div>
  </div>`;
}

function reviewPanelMarkup(state) {
  const selected = state.reviewDetail;
  const counts = reviewCounts(state);
  const filter = state.reviewFilter || "queue";
  const filters = REVIEW_FILTERS.map(
    ([key, label]) =>
      `<button class="chip qb-review-tab${filter === key ? " is-active" : ""}" type="button" role="tab" aria-selected="${filter === key ? "true" : "false"}" data-qb-action="review-filter" data-filter="${key}"><span>${label}</span><span class="qb-review-tab-count">${formatNumber(counts[key] || 0)}</span></button>`,
  ).join("");
  const listMarkup = state.reviewItems.length
    ? state.reviewItems
        .map((item) =>
          reviewItemRowMarkup(
            item,
            Number(selected?.id) === Number(item.id),
          ),
        )
        .join("")
    : `<div class="qb-empty qb-empty-compact">${icon("info", 16)}<span>目前沒有${escapeHtml(reviewFilterLabel(filter))}題目。</span></div>`;
  const detailMarkup = selected
    ? reviewDetailPaneMarkup(selected)
    : state.reviewItems.length
      ? reviewPlaceholderMarkup()
      : reviewEmptyMarkup(state, counts);
  return `<section class="report-card qb-card qb-review-card">
    <div class="side-card-head">
      <span class="side-card-title">${icon("shield", 14)}題庫人工驗收批注</span>
      <span class="badge ${counts.queue ? "badge-warn" : "badge-neutral"}">待審 ${formatNumber(counts.queue)}</span>
    </div>
    <p class="qb-review-hint">新題目建立或修改後會進入待審；點選左側題目即可在右側查看內容、核准、退回或刪除。</p>
    <div class="qb-review-split">
      <aside class="qb-review-list-pane" aria-label="驗收題目清單">
        <div class="qb-review-tabs" role="tablist" aria-label="驗收狀態">${filters}</div>
        <div class="qb-review-list">${listMarkup}</div>
      </aside>
      <section class="qb-review-detail-pane" aria-live="polite">${detailMarkup}</section>
    </div>
  </section>`;
}

function answerPercent(value) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return `${Math.round(number * 100)}%`;
}

function citationLabel(citation) {
  if (!citation || typeof citation !== "object") return "引用";
  const jid = String(citation.jid || "").trim();
  if (jid) return jid;
  const lawName = String(citation.law_name || "").trim();
  const articleNo = String(citation.article_no || "").trim();
  const lawLabel = `${lawName} ${articleNo}`.trim();
  if (lawLabel) return lawLabel;
  return String(citation.title || citation.text || "引用").slice(0, 80);
}

function answerStatsMarkup(answer) {
  const metrics = answer?.metrics || {};
  const scores = metrics.scores || {};
  const values = [
    ["法規召回", answerPercent(metrics.law_recall)],
    ["條文召回", answerPercent(metrics.article_recall)],
    ["規則分", answerPercent(scores.deterministic)],
    ["Judge", answerPercent(scores.judge)],
    ["人工", answerPercent(scores.human)],
  ].filter(([, value]) => value);
  if (!values.length) return "";
  return `<div class="qb-bank-stats">${values
    .map(
      ([label, value]) =>
        `<span class="qb-bank-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></span>`,
    )
    .join("")}</div>`;
}

function answerSourcesMarkup(answer) {
  const sources = Array.isArray(answer?.law_sources) ? answer.law_sources : [];
  const citations = Array.isArray(answer?.citations) ? answer.citations : [];
  const sourceMarkup = sources.length
    ? `<div class="qb-bank-sources">${sources
        .map((source) => {
          const name = String(source.law_name || "未命名法規");
          const articles = (source.articles || [])
            .map((article) => String(article.article_no || "").trim())
            .filter(Boolean);
          const body = `<strong>${escapeHtml(name)}</strong>${
            articles.length
              ? `<small>${escapeHtml(articles.join("、"))}</small>`
              : ""
          }`;
          return source.law_url
            ? `<a class="qb-bank-law" href="${escapeHtml(
                source.law_url,
              )}" target="_blank" rel="noreferrer">${body}</a>`
            : `<span class="qb-bank-law">${body}</span>`;
        })
        .join("")}</div>`
    : "";
  const citationMarkup = citations.length
    ? `<div class="qb-bank-sources qb-bank-citations">${citations
        .map(
          (citation) =>
            `<span class="chip chip-mono">${escapeHtml(
              citationLabel(citation),
            )}</span>`,
        )
        .join("")}</div>`
    : "";
  if (!sourceMarkup && !citationMarkup) return "";
  return `<div class="qb-bank-answer-block">
    <div class="qb-bank-section-label"><span>引用來源</span><span>${formatNumber(
      sources.length + citations.length,
    )} 筆</span></div>
    ${sourceMarkup}${citationMarkup}
  </div>`;
}

function answerBodyMarkup(answer, item) {
  if (!answer) {
    return `<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${icon("history", 20)}</span>
      <strong>尚無 RAG 答案</strong>
      <span>跑一次 Benchmark 後，最近一次成功回答會顯示在這裡。</span>
    </div>`;
  }
  const answerVersion = Number(answer.item_version || 0);
  const itemVersion = Number(item?.version || 0);
  const versionBadge =
    answerVersion && itemVersion && answerVersion !== itemVersion
      ? `<span class="badge badge-warn">答案 v${answerVersion} · 題目 v${itemVersion}</span>`
      : "";
  const sourceLabel =
    answer.answer_source === "llm"
      ? "LLM 生成"
      : answer.answer_source === "structured"
        ? "法規資料庫"
        : String(answer.answer_source || "RAG");
  return `<div class="qb-bank-answer-meta">
      <span class="badge badge-ok"><span class="status-dot is-ok"></span>RAG 完成</span>
      <span class="badge badge-neutral">${escapeHtml(sourceLabel)}</span>
      ${versionBadge}
      <span class="mono">${escapeHtml(answer.run_label || answer.run_id || "")}</span>
      <span>${escapeHtml(formatDateTime(answer.finished_at))}</span>
      <span>${escapeHtml(formatDuration(answer.duration_ms))}</span>
      ${
        answer.llm_model
          ? `<span class="mono">${escapeHtml(answer.llm_model)}</span>`
          : ""
      }
    </div>
    <div class="qb-bank-answer-block">
      <div class="qb-bank-section-label"><span>回答</span><span>${formatNumber(
        String(answer.answer || "").length,
      )} 字</span></div>
      <p class="qb-bank-answer-text">${escapeHtml(
        String(answer.answer || "").trim() || "（空白回答）",
      )}</p>
    </div>
    ${answerSourcesMarkup(answer)}
    ${answerStatsMarkup(answer)}`;
}

function bankAnswerPaneMarkup(state, item) {
  const suiteId = state.selectedSuiteId;
  const answer = item
    ? state.suiteAnswers?.[String(suiteId)]?.[String(item.id)] || null
    : null;
  if (!item) {
    return `<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${icon("cube", 20)}</span>
      <strong>選擇題目</strong>
      <span>從左側清單選擇一題，查看最近一次 RAG 答案。</span>
    </div>`;
  }
  return `<div class="qb-bank-answer-head">
      <div class="qb-bank-answer-heading">
        <span class="qb-bank-answer-kicker">${icon(
          "sparkles",
          12,
        )}RAG 最近一次答案</span>
        <strong class="qb-bank-answer-question">#${item.id} ${escapeHtml(
          item.question,
        )}</strong>
      </div>
      ${
        answer
          ? `<span class="qb-bank-answer-state">${escapeHtml(
              TYPE_LABELS[item.question_type] || item.question_type,
            )} · v${item.version}</span>`
          : ""
      }
    </div>
    ${answerBodyMarkup(answer, item)}`;
}

function bankActionsMarkup(item) {
  return `<span class="qb-bank-actions">
    <button class="qb-bank-icon" type="button" data-qb-action="edit" data-id="${
      item.id
    }" title="編輯題目" aria-label="編輯題目 #${item.id}">${icon(
      "edit",
      13,
    )}</button>
    <button class="qb-bank-icon is-danger" type="button" data-qb-action="delete" data-id="${
      item.id
    }" title="從題庫移除" aria-label="從題庫移除 #${item.id}">${icon(
      "trash",
      13,
    )}</button>
  </span>`;
}

function bankRowMarkup(item, index, { selected, hasAnswer }) {
  return `<div class="qb-bank-row${selected ? " is-active" : ""}" data-id="${
    item.id
  }">
    <button class="qb-bank-select" type="button" data-qb-action="select-bank-item" data-id="${
      item.id
    }" aria-pressed="${selected ? "true" : "false"}">
      <span class="qb-bank-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="qb-bank-item-copy">
        <strong>${escapeHtml(item.question)}</strong>
        <small>${escapeHtml(
          TYPE_LABELS[item.question_type] || item.question_type,
        )} · v${item.version} · ${
          hasAnswer ? "已有 RAG 答案" : "尚無 RAG 答案"
        }</small>
      </span>
    </button>
    ${bankActionsMarkup(item)}
  </div>`;
}

function bankFullItemMarkup(item, index, answer) {
  return `<article class="qb-bank-full-item" data-id="${item.id}">
    <div class="qb-bank-full-head">
      <span class="qb-bank-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="qb-bank-full-title">
        <strong>${escapeHtml(item.question)}</strong>
        <small>${escapeHtml(
          TYPE_LABELS[item.question_type] || item.question_type,
        )} · v${item.version} · ${escapeHtml(
          STATUS_META[item.status]?.label || item.status || "",
        )}</small>
      </div>
      ${bankActionsMarkup(item)}
    </div>
    ${answerBodyMarkup(answer, item)}
  </article>`;
}

function suiteMarkup(state) {
  const editing = state.editingSuite;
  const suites = Array.isArray(state.suites) ? state.suites : [];
  const selected =
    suites.find((suite) => Number(suite.id) === Number(state.selectedSuiteId)) ||
    suites[0] ||
    null;
  const items = Array.isArray(selected?.items) ? selected.items : [];
  const answers = state.suiteAnswers?.[String(selected?.id)] || {};
  const selectedItem =
    items.find(
      (item) => Number(item.id) === Number(state.selectedBankItemId),
    ) || null;
  const loading = Boolean(state.suiteAnswersLoading);
  const error = String(state.suiteAnswersError || "");
  const manageOpen = Boolean(state.suiteManageOpen) || !suites.length;
  const tab = state.bankTab === "full" ? "full" : "split";
  const tabs = suites.length
    ? `<div class="qb-bank-tabs" role="tablist" aria-label="Benchmark 題庫檢視">
        <button class="qb-bank-tab${
          tab === "split" ? " is-active" : ""
        }" type="button" role="tab" aria-selected="${
          tab === "split" ? "true" : "false"
        }" data-qb-action="bank-tab" data-tab="split">${icon(
          "grid",
          13,
        )}<span>Benchmark 題庫</span><span class="badge badge-neutral">${formatNumber(
          items.length,
        )}</span></button>
        <button class="qb-bank-tab${
          tab === "full" ? " is-active" : ""
        }" type="button" role="tab" aria-selected="${
          tab === "full" ? "true" : "false"
        }" data-qb-action="bank-tab" data-tab="full">${icon(
          "table",
          13,
        )}<span>題庫全列表</span><span class="badge badge-neutral">${formatNumber(
          items.length,
        )}</span></button>
      </div>`
    : "";
  let content = "";
  if (!suites.length) {
    content = `<div class="qb-bank-empty">
      <span class="qb-bank-empty-icon">${icon("cube", 20)}</span>
      <strong>尚未建立 Benchmark 題庫</strong>
      <span>展開下方 Suite 設定並建立題庫後，就能在這裡瀏覽題目與最近一次 RAG 答案。</span>
    </div>`;
  } else if (loading) {
    content = `<div class="qb-bank-loading"><span class="spinner" aria-hidden="true"></span><span>讀取最近一次 RAG 答案中…</span></div>`;
  } else {
    const errorMarkup = error
      ? notice({
          tone: "warn",
          title: "最近一次 RAG 答案讀取失敗",
          text: escapeHtml(error),
        })
      : "";
    if (tab === "full") {
      content = `${errorMarkup}<div class="qb-bank-full" data-qb-bank-view="full">${
        items.length
          ? items
              .map((item, index) =>
                bankFullItemMarkup(
                  item,
                  index,
                  answers[String(item.id)] || null,
                ),
              )
              .join("")
          : emptyState("這個 benchmark 題庫目前沒有題目。")
      }</div>`;
    } else {
      content = `${errorMarkup}<div class="qb-bank-split" data-qb-bank-view="split">
        <div class="qb-bank-list" data-qb-bank-list>${
          items.length
            ? items
                .map((item, index) =>
                  bankRowMarkup(item, index, {
                    selected:
                      Number(item.id) === Number(selectedItem?.id),
                    hasAnswer: Boolean(answers[String(item.id)]),
                  }),
                )
                .join("")
            : emptyState("這個 benchmark 題庫目前沒有題目。")
        }</div>
        <div class="qb-bank-answer-pane" data-qb-bank-answer>${bankAnswerPaneMarkup(
          state,
          selectedItem,
        )}</div>
      </div>`;
    }
  }
  return `<section class="report-card qb-card qb-bank-card">
    <div class="side-card-head qb-bank-head">
      <div class="qb-bank-heading">
        <span class="side-card-title">${icon(
          "cube",
          14,
        )}Benchmark 題庫</span>
        <span class="qb-bank-sub">${
          selected
            ? `${escapeHtml(selected.name)} · v${selected.version} · ${formatNumber(
                selected.item_count,
              )} 題`
            : "尚未建立 suite"
        }</span>
      </div>
      <div class="qb-bank-controls">
        ${
          suites.length
            ? `<label class="qb-suite-picker"><span>Suite</span><select class="select" data-qb-suite-select aria-label="選擇 benchmark suite">${suites
                .map(
                  (suite) =>
                    `<option value="${suite.id}" ${
                      Number(suite.id) === Number(selected?.id)
                        ? "selected"
                        : ""
                    }>${escapeHtml(suite.name)} · ${formatNumber(
                      suite.item_count,
                    )} 題</option>`,
                )
                .join("")}</select></label>`
            : ""
        }
        ${
          selected
            ? `<span class="badge ${
                selected.status === "frozen" ? "badge-ok" : "badge-neutral"
              }">${
                selected.status === "frozen" ? "已凍結" : "草稿"
              }</span>`
            : ""
        }
      </div>
    </div>
    ${tabs}
    ${content}
    <details class="qb-suite-manage" ${manageOpen ? "open" : ""}>
      <summary>${icon("sliders", 14)}Suite 設定與版本 <span class="qb-muted">${formatNumber(
        suites.length,
      )} 個 suite · ${formatNumber(state.ready.length)} 題 benchmark-ready</span></summary>
      <div class="qb-suite-manage-body">
        <form class="qb-suite-form" data-qb-form="suite">
          <input type="hidden" name="suite_id" value="${editing?.id || ""}" />
          <div class="qb-form-grid">
            <label class="field"><span class="field-label">Suite 名稱</span><input class="input" name="name" required value="${escapeHtml(
              editing?.name || "Pilot 30",
            )}" /></label>
            <label class="field"><span class="field-label">等級</span><select class="select" name="tier">${Object.entries(
              TIER_LABELS,
            )
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${
                    editing?.tier === value ? "selected" : ""
                  }>${label}</option>`,
              )
              .join("")}</select></label>
          </div>
          <label class="field"><span class="field-label">說明</span><input class="input" name="description" value="${escapeHtml(
            editing?.description ||
              "30 題 pilot；用於 RAG benchmark 與長期同題比較。",
          )}" /></label>
          <div class="qb-check-list">
            ${
              state.ready.length
                ? state.ready
                    .map((item) => {
                      const checked = editing
                        ? editing.items?.some(
                            (entry) => Number(entry.id) === Number(item.id),
                          )
                        : true;
                      return `<label class="qb-check-row"><input type="checkbox" name="item_ids" value="${
                        item.id
                      }" ${
                        checked ? "checked" : ""
                      }/><span><strong>#${item.id}</strong> ${escapeHtml(
                        item.question,
                      )} <small>${escapeHtml(
                        TYPE_LABELS[item.question_type] || item.question_type,
                      )}</small></span></label>`;
                    })
                    .join("")
                : emptyState(
                    "沒有已驗收且 benchmark-ready 的題目；請先完成人工驗收。",
                  )
            }
          </div>
          <div class="qb-actions">
            <button class="btn btn-primary" type="submit">${icon(
              "check",
              14,
            )}<span>${
              editing ? "儲存 suite" : "建立 suite"
            }</span></button>
            ${
              editing
                ? `<button class="btn btn-secondary" type="button" data-qb-action="suite-new">取消編輯</button>`
                : ""
            }
          </div>
        </form>
        <div class="qb-list">
          ${
            suites.length
              ? suites
                  .map(
                    (suite) => `<article class="qb-suite">
            <div class="qb-item-head">
              <div class="qb-item-title"><strong>${escapeHtml(
                suite.name,
              )}</strong><span class="qb-meta">${escapeHtml(
                TIER_LABELS[suite.tier] || suite.tier,
              )} · v${suite.version} · ${formatNumber(
                suite.item_count,
              )} 題</span></div>
              <span class="badge ${
                suite.status === "frozen" ? "badge-ok" : "badge-neutral"
              }">${suite.status === "frozen" ? "已凍結" : "草稿"}</span>
            </div>
            <div class="qb-suite-items">${(suite.items || [])
              .slice(0, 8)
              .map(
                (item) =>
                  `<span class="chip">#${item.id} ${escapeHtml(
                    item.question.slice(0, 22),
                  )}${item.question.length > 22 ? "…" : ""}</span>`,
              )
              .join("")}${
              suite.item_count > 8
                ? `<span class="qb-muted">+${suite.item_count - 8}</span>`
                : ""
            }</div>
            <div class="qb-actions">
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-edit" data-id="${
                suite.id
              }">${icon("edit", 13)}<span>編輯 suite</span></button>
              <button class="btn btn-secondary btn-sm" type="button" data-qb-action="suite-freeze" data-id="${
                suite.id
              }">${icon("shield", 13)}<span>凍結</span></button>
              <button class="btn btn-ghost btn-sm" type="button" data-qb-action="suite-delete" data-id="${
                suite.id
              }">${icon("trash", 13)}<span>刪除</span></button>
            </div>
          </article>`,
                  )
                  .join("")
              : emptyState("尚未建立 benchmark suite。")
          }
        </div>
      </div>
    </details>
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
    editingFrom: "",
    editingSuite: null,
    aiQuestion: "",
    aiLoading: false,
    aiResult: null,
    items: [],
    total: 0,
    offset: 0,
    limit: 50,
    filters: {
      query: "",
      status: "",
      question_type: "",
      difficulty: "",
      tags: [],
    },
    stats: {},
    suites: [],
    ready: [],
    selectedSuiteId: null,
    selectedBankItemId: null,
    bankTab: "split",
    suiteAnswers: {},
    suiteAnswersLoading: false,
    suiteAnswersError: "",
    suiteManageOpen: false,
    reviewItems: [],
    reviewDetail: null,
    reviewFilter: "queue",
  };

  const panel = (name) => root.querySelector(`#quality-panel-${panelNames[name]}`);

  let tagSearchRequest = 0;
  let tagSearchTimer = null;

  const currentReviewer = () => {
    // TODO: 接上 Google Auth 後，改為回傳目前登入的 Google 帳號。
    return "anonymous";
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
    target.innerHTML = createFormMarkup(state.editing, state);
  };

  const renderTagSuggestions = (container, tags) => {
    const results = container?.querySelector("[data-qb-tag-results]");
    if (!results) return;
    results.innerHTML = tags.length
      ? tags
          .map(
            (item) =>
              `<button class="qb-tag-option" type="button" role="option" data-qb-action="select-tag" data-tag="${escapeHtml(item.tag)}"><span>${escapeHtml(item.tag)}</span><small>${formatNumber(item.count)}</small></button>`,
          )
          .join("")
      : `<div class="qb-tag-empty">沒有其他相符標籤</div>`;
  };

  const loadTagSuggestions = async (container, query = "") => {
    if (!container) return;
    const results = container.querySelector("[data-qb-tag-results]");
    const token = ++tagSearchRequest;
    if (results) {
      results.innerHTML = `<div class="qb-tag-loading"><span class="spinner"></span><span>搜尋標籤…</span></div>`;
    }
    try {
      const data = await api.questionBankTags(query, 12);
      if (token !== tagSearchRequest) return;
      const tags = (data.tags || []).filter(
        (item) => !state.filters.tags.includes(item.tag),
      );
      renderTagSuggestions(container, tags);
    } catch (error) {
      if (token !== tagSearchRequest) return;
      if (results) {
        results.innerHTML = `<div class="qb-tag-empty">${escapeHtml(
          error.message || "標籤搜尋失敗。",
        )}</div>`;
      }
    }
  };

  const openTagSearch = (container, { focus = false } = {}) => {
    if (!container) return;
    const popover = container.querySelector("[data-qb-tag-popover]");
    const input = container.querySelector("[data-qb-tag-search]");
    if (!popover || !input) return;
    if (popover.hidden) {
      popover.hidden = false;
      input.value = "";
      loadTagSuggestions(container, "");
    }
    if (focus) {
      input.focus();
      input.select();
    }
  };

  const closeTagSearch = (container) => {
    if (tagSearchTimer) {
      window.clearTimeout(tagSearchTimer);
      tagSearchTimer = null;
    }
    const popover = container?.querySelector("[data-qb-tag-popover]");
    if (popover) popover.hidden = true;
  };

  const toggleTag = async (tag) => {
    const value = String(tag || "").trim();
    if (!value) return;
    if (state.filters.tags.includes(value)) {
      state.filters.tags = state.filters.tags.filter(
        (entry) => entry !== value,
      );
    } else {
      state.filters.tags = [...state.filters.tags, value];
    }
    state.offset = 0;
    await loadManage();
  };

  const ensureSuiteSelection = () => {
    const suites = Array.isArray(state.suites) ? state.suites : [];
    if (!suites.length) {
      state.selectedSuiteId = null;
      state.selectedBankItemId = null;
      return null;
    }
    let suite = suites.find(
      (entry) => Number(entry.id) === Number(state.selectedSuiteId),
    );
    if (!suite) {
      suite = suites[0];
      state.selectedSuiteId = suite.id;
      state.selectedBankItemId = null;
    }
    const items = Array.isArray(suite.items) ? suite.items : [];
    if (
      !items.some(
        (item) => Number(item.id) === Number(state.selectedBankItemId),
      )
    ) {
      state.selectedBankItemId = items[0]?.id ?? null;
    }
    return suite;
  };

  const renderSuites = () => {
    const target = panel("suite");
    if (!target) return;
    target.innerHTML = suiteMarkup(state);
  };

  let suiteAnswerRequest = 0;

  const loadSuiteAnswers = async (suiteId, { force = false } = {}) => {
    if (!suiteId) return;
    const requestId = ++suiteAnswerRequest;
    if (!force && state.suiteAnswers[String(suiteId)]) {
      state.suiteAnswersLoading = false;
      state.suiteAnswersError = "";
      renderSuites();
      return;
    }
    state.suiteAnswersLoading = true;
    state.suiteAnswersError = "";
    renderSuites();
    try {
      const result = await api.benchmarkSuiteLatestAnswers(suiteId);
      if (requestId !== suiteAnswerRequest) return;
      state.suiteAnswers[String(suiteId)] = result.answers || {};
    } catch (error) {
      if (requestId !== suiteAnswerRequest) return;
      state.suiteAnswersError = error.message || "請稍後再試。";
    } finally {
      if (requestId === suiteAnswerRequest) {
        state.suiteAnswersLoading = false;
        renderSuites();
      }
    }
  };

  const changeSuite = async (suiteId) => {
    state.selectedSuiteId = suiteId;
    state.selectedBankItemId = null;
    state.suiteAnswersError = "";
    const suite = ensureSuiteSelection();
    if (!suite) {
      renderSuites();
      return;
    }
    await loadSuiteAnswers(suite.id);
  };

  const setBankTab = (tab) => {
    state.bankTab = tab === "full" ? "full" : "split";
    renderSuites();
  };

  const updateBankSelection = () => {
    const target = panel("suite");
    if (!target) return;
    const suite = ensureSuiteSelection();
    const items = Array.isArray(suite?.items) ? suite.items : [];
    const item =
      items.find(
        (entry) => Number(entry.id) === Number(state.selectedBankItemId),
      ) || null;
    for (const row of target.querySelectorAll(".qb-bank-row")) {
      const active = Number(row.dataset.id) === Number(state.selectedBankItemId);
      row.classList.toggle("is-active", active);
      const button = row.querySelector("[data-qb-action='select-bank-item']");
      if (button) button.setAttribute("aria-pressed", active ? "true" : "false");
    }
    const pane = target.querySelector("[data-qb-bank-answer]");
    if (pane) pane.innerHTML = bankAnswerPaneMarkup(state, item);
  };

  const loadManage = async () => {
    const target = panel("manage");
    if (!target) return;
    if (tagSearchTimer) {
      window.clearTimeout(tagSearchTimer);
      tagSearchTimer = null;
    }
    target.innerHTML = `<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>讀取題庫中…</span></div></section>`;
    try {
      const result = await api.questionBankItems(
        {
          ...state.filters,
          ...(state.filters.status === "retired"
            ? { include_deleted: true }
            : {}),
        },
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

  const loadSuites = async ({ refreshAnswers = false } = {}) => {
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
      const suite = ensureSuiteSelection();
      state.suiteAnswersError = "";
      state.suiteAnswersLoading = false;
      if (
        suite &&
        (refreshAnswers || !state.suiteAnswers[String(suite.id)])
      ) {
        try {
          const result = await api.benchmarkSuiteLatestAnswers(suite.id);
          state.suiteAnswers[String(suite.id)] = result.answers || {};
        } catch (error) {
          state.suiteAnswersError = error.message || "請稍後再試。";
        }
      }
      target.innerHTML = suiteMarkup(state);
    } catch (error) {
      target.innerHTML = `<section class="report-card qb-card">${notice({
        tone: "danger",
        title: "Benchmark 題庫讀取失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}</section>`;
    }
  };

  const renderReview = () => {
    const target = panel("review");
    if (!target) return;
    target.innerHTML = reviewPanelMarkup(state);
  };

  const selectReviewItem = async (id) => {
    const item = state.reviewItems.find(
      (entry) => Number(entry.id) === Number(id),
    );
    if (!item) return;
    state.reviewDetail = item;
    renderReview();
    const detailPane = panel("review")?.querySelector(".qb-review-detail-pane");
    if (detailPane && window.matchMedia("(max-width: 1020px)").matches) {
      detailPane.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    try {
      const detail = await api.questionBankItem(item.id);
      if (Number(state.reviewDetail?.id) === Number(item.id)) {
        state.reviewDetail = detail;
        renderReview();
      }
    } catch (error) {
      toast(error.message || "題目內容讀取失敗。", "danger");
    }
  };

  const loadReview = async () => {
    const target = panel("review");
    if (!target) return;
    target.innerHTML = `<section class="report-card qb-card"><div class="qb-empty"><span class="spinner"></span><span>讀取驗收題目中…</span></div></section>`;
    const filter = state.reviewFilter || "queue";
    const statuses =
      filter === "queue"
        ? ["pending_review", "changes_requested"]
        : filter === "accepted"
          ? ["accepted"]
          : filter === "rejected"
            ? ["rejected"]
            : ["draft"];
    try {
      const results = await Promise.all(
        statuses.map((status) => api.questionBankItems({ status }, 200, 0)),
      );
      state.reviewItems = results.flatMap((result) => result.items || []);
      state.stats = results[0]?.stats || state.stats;
      const currentId = Number(state.reviewDetail?.id || 0);
      const stillListed = state.reviewItems.some(
        (item) => Number(item.id) === currentId,
      );
      const selectedId = stillListed
        ? currentId
        : Number(state.reviewItems[0]?.id || 0);
      state.reviewDetail = selectedId
        ? await api.questionBankItem(selectedId)
        : null;
      renderReview();
      notifyStats();
    } catch (error) {
      target.innerHTML = `<section class="report-card qb-card">${notice({
        tone: "danger",
        title: "驗收題目讀取失敗",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}</section>`;
    }
  };

  function show(tab) {
    const previous = state.tab;
    state.tab = tab;
    for (const name of Object.keys(panelNames)) {
      const element = panel(name);
      if (element) element.hidden = name !== tab;
    }
    if (tab === "create") {
      if (previous !== "create" && !state.editing) {
        state.aiQuestion = "";
        state.aiResult = null;
      }
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
    const candidates = [
      ...state.items,
      ...state.reviewItems,
      ...(state.reviewDetail ? [state.reviewDetail] : []),
    ];
    const item = candidates.find((entry) => Number(entry.id) === Number(id));
    state.reviewDetail = item || { id: Number(id) };
    const status = item?.status;
    if (["accepted", "rejected", "draft"].includes(status)) {
      state.reviewFilter = status;
    } else if (status) {
      state.reviewFilter = "queue";
    }
    navigate("review");
  };

  const handleCreate = async (form) => {
    const payload = readCreatePayload(form);
    const itemId = Number(form.elements.item_id?.value || 0);
    if (!itemId) {
      payload.status = form.elements.submit_for_review?.checked
        ? "pending_review"
        : "draft";
    }
    try {
      if (itemId) {
        await api.updateQuestionBankItem(itemId, {
          ...payload,
          change_note: "題庫管理修改",
        });
        toast("已建立新版本，狀態回到待審。", "ok");
      } else {
        await api.createQuestionBankItem(payload);
        toast(
          payload.status === "draft"
            ? "題目已存為草稿，可在題庫管理按「送審」。"
            : "題目已建立並送交人工驗收。",
          "ok",
        );
      }
      state.editing = null;
      const returnTab = ["manage", "suite", "review"].includes(
        state.editingFrom,
      )
        ? state.editingFrom
        : "manage";
      state.editingFrom = "";
      state.suiteAnswers = {};
      await loadStats();
      navigate(returnTab);
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message = detail?.errors?.join(" · ") || detail?.message || error.message || "題目儲存失敗。";
      toast(message, "danger", 8000);
    }
  };

  const handleAICreate = async (form) => {
    const question = String(
      new FormData(form).get("question") || "",
    ).trim();
    if (question.length < 4) {
      toast("題目至少需要 4 個字。", "danger");
      return;
    }
    state.aiQuestion = question;
    state.aiLoading = true;
    state.aiResult = null;
    renderCreate();
    try {
      const result = await api.createQuestionBankItemWithAI({ question });
      state.aiResult = result;
      state.aiQuestion = "";
      await loadStats();
      toast(
        `Ollama 已建立題目 #${result.item.id}，狀態為待審，請人工覆核。`,
        "ok",
        8000,
      );
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message =
        detail?.errors?.join(" · ") ||
        detail?.message ||
        error.message ||
        "Ollama 產生失敗。";
      toast(message, "danger", 12000);
    } finally {
      state.aiLoading = false;
      renderCreate();
    }
  };

  const handleReviewDecision = async (form, decision) => {
    const itemId = Number(form.dataset.id || 0);
    if (!itemId) return;
    try {
      await api.reviewQuestionBankItem(itemId, {
        decision,
        reviewer: currentReviewer(),
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
      state.suiteManageOpen = true;
      state.suiteAnswers = {};
      await loadSuites();
    } catch (error) {
      const detail = error.detail || error.payload?.detail;
      const message = detail?.errors?.join(" · ") || detail?.message || error.message || "Suite 儲存失敗。";
      toast(message, "danger", 8000);
    }
  };

  const onClick = async (event) => {
    const openTagContainer = root.querySelector(
      "[data-qb-tag-filter] [data-qb-tag-popover]:not([hidden])",
    )?.closest("[data-qb-tag-filter]");
    if (openTagContainer && !event.target.closest("[data-qb-tag-filter]")) {
      closeTagSearch(openTagContainer);
    }
    const action = event.target.closest("[data-qb-action]")?.dataset.qbAction;
    if (!action) return;
    const button = event.target.closest("[data-qb-action]");
    const id = Number(button.dataset.id || 0);
    if (action === "open-tag-search") {
      const container = button.closest("[data-qb-tag-filter]");
      openTagSearch(container, { focus: true });
      return;
    }
    if (action === "select-tag") {
      await toggleTag(button.dataset.tag);
      return;
    }
    if (action === "remove-tag") {
      await toggleTag(button.dataset.tag);
      return;
    }
    if (action === "bank-tab") {
      setBankTab(button.dataset.tab);
      return;
    }
    if (action === "select-bank-item") {
      state.selectedBankItemId = id;
      updateBankSelection();
      return;
    }
    if (action === "new") {
      state.editing = null;
      state.editingFrom = "";
      state.aiQuestion = "";
      state.aiResult = null;
      state.aiLoading = false;
      navigate("create");
      return;
    }
    if (action === "reset-create") {
      state.editing = null;
      renderCreate();
      return;
    }
    if (action === "reset-ai") {
      state.aiQuestion = "";
      state.aiResult = null;
      state.aiLoading = false;
      renderCreate();
      return;
    }
    if (action === "edit") {
      const currentSuite = state.suites.find(
        (entry) => Number(entry.id) === Number(state.selectedSuiteId),
      );
      const candidates = [
        ...state.items,
        ...state.reviewItems,
        ...(currentSuite?.items || []),
        ...(state.reviewDetail ? [state.reviewDetail] : []),
      ];
      const item = candidates.find((entry) => Number(entry.id) === id);
      if (!item) return;
      state.editing = item;
      state.editingFrom = state.tab;
      navigate("create");
      return;
    }
    if (action === "review") {
      openReview(id);
      return;
    }
    if (action === "review-ai-item") {
      const item = state.aiResult?.item;
      if (!item) return;
      state.reviewFilter = "queue";
      state.reviewDetail = item;
      navigate("review");
      return;
    }
    if (action === "review-filter") {
      const filter = String(button.dataset.filter || "queue");
      state.reviewFilter = ["queue", "accepted", "rejected", "draft"].includes(filter)
        ? filter
        : "queue";
      state.reviewDetail = null;
      await loadReview();
      return;
    }
    if (action === "select-review-item") {
      await selectReviewItem(id);
      return;
    }
    if (action === "go-manage") {
      navigate("manage");
      return;
    }
    if (action === "submit-review") {
      try {
        await api.submitQuestionBankItemForReview(id);
        toast("已送交人工驗收。", "ok");
        await loadStats();
        if (state.tab === "manage") await loadManage();
        else if (state.tab === "review") await loadReview();
      } catch (error) {
        const detail = error.detail || error.payload?.detail;
        const message =
          detail?.errors?.join(" · ") ||
          detail?.message ||
          error.message ||
          "送審失敗。";
        toast(message, "danger", 8000);
      }
      return;
    }
    if (action === "restore") {
      if (
        !window.confirm(
          `確定復原題目 #${id}？復原後會回到待審狀態，需重新驗收。`,
        )
      ) {
        return;
      }
      try {
        await api.restoreQuestionBankItem(id);
        toast("題目已復原並回到待審。", "ok");
        await loadStats();
        await loadManage();
      } catch (error) {
        const detail = error.detail || error.payload?.detail;
        const message =
          detail?.errors?.join(" · ") ||
          detail?.message ||
          error.message ||
          "復原失敗。";
        toast(message, "danger", 8000);
      }
      return;
    }
    if (action === "delete") {
      if (state.tab === "suite") {
        const suite = ensureSuiteSelection();
        if (!suite) return;
        const item = (suite.items || []).find(
          (entry) => Number(entry.id) === id,
        );
        if (!item) return;
        if (
          !window.confirm(
            `確定從「${suite.name}」移除題目 #${id}？題目仍會保留在題庫管理中。`,
          )
        ) {
          return;
        }
        try {
          await api.removeBenchmarkSuiteItem(suite.id, id);
          toast("已從 Benchmark 題庫移除。", "info");
          delete state.suiteAnswers[String(suite.id)];
          if (Number(state.selectedBankItemId) === id) {
            state.selectedBankItemId = null;
          }
          await loadSuites();
        } catch (error) {
          toast(error.message || "移除失敗。", "danger");
        }
        return;
      }
      if (!window.confirm(`確定刪除題目 #${id}？題目會標記為 retired，歷史 benchmark 仍會保留。`)) return;
      try {
        await api.deleteQuestionBankItem(id);
        toast("題目已刪除。", "info");
        await loadStats();
        if (state.tab === "review") {
          state.reviewDetail = null;
          await loadReview();
        } else {
          await loadManage();
        }
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
      state.suiteManageOpen = true;
      loadSuites();
      return;
    }
    if (action === "suite-new") {
      state.editingSuite = null;
      state.suiteManageOpen = true;
      loadSuites();
      return;
    }
    if (action === "suite-freeze") {
      try {
        await api.updateBenchmarkSuite(id, { freeze: true });
        toast("Benchmark 題庫已凍結並建立新版本。", "ok");
        state.editingSuite = null;
        state.suiteManageOpen = true;
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
        state.suiteAnswers = {};
        state.suiteManageOpen = true;
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
    } else if (kind === "ai-create") {
      await handleAICreate(form);
    } else if (kind === "filter") {
      const data = new FormData(form);
      state.filters = {
        query: String(data.get("query") || "").trim(),
        status: String(data.get("status") || ""),
        question_type: String(data.get("question_type") || ""),
        difficulty: String(data.get("difficulty") || ""),
        tags: data
          .getAll("tags")
          .map((value) => String(value).trim())
          .filter(Boolean),
      };
      state.offset = 0;
      await loadManage();
    } else if (kind === "suite") {
      await handleSuiteSubmit(form);
    }
  };

  const onChange = async (event) => {
    const filterSelect = event.target.closest?.(
      "form[data-qb-form='filter'] select",
    );
    if (filterSelect) {
      filterSelect.form.requestSubmit();
      return;
    }
    const select = event.target.closest?.("[data-qb-suite-select]");
    if (!select) return;
    const suiteId = Number(select.value || 0);
    if (!suiteId || suiteId === Number(state.selectedSuiteId)) return;
    await changeSuite(suiteId);
  };

  const onToggle = (event) => {
    const details = event.target;
    if (!details?.matches?.(".qb-suite-manage")) return;
    state.suiteManageOpen = Boolean(details.open);
  };

  const onTagHover = (event) => {
    const button = event.target.closest?.(
      "[data-qb-action='open-tag-search']",
    );
    if (!button) return;
    openTagSearch(button.closest("[data-qb-tag-filter]"));
  };

  const onTagLeave = (event) => {
    const container = event.target.closest?.("[data-qb-tag-filter]");
    if (!container) return;
    if (event.relatedTarget && container.contains(event.relatedTarget)) return;
    closeTagSearch(container);
  };

  const onTagInput = (event) => {
    const input = event.target.closest?.("[data-qb-tag-search]");
    if (!input) return;
    const container = input.closest("[data-qb-tag-filter]");
    if (tagSearchTimer) window.clearTimeout(tagSearchTimer);
    tagSearchTimer = window.setTimeout(() => {
      loadTagSuggestions(container, input.value);
    }, 160);
  };

  const onTagKeydown = (event) => {
    const input = event.target.closest?.("[data-qb-tag-search]");
    if (!input) return;
    const container = input.closest("[data-qb-tag-filter]");
    if (event.key === "Escape") {
      event.preventDefault();
      closeTagSearch(container);
      input.blur();
    } else if (event.key === "Enter") {
      event.preventDefault();
      container?.querySelector("[data-qb-action='select-tag']")?.click();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      container?.querySelector("[data-qb-action='select-tag']")?.focus();
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  root.addEventListener("change", onChange);
  root.addEventListener("toggle", onToggle, true);
  root.addEventListener("mouseover", onTagHover);
  root.addEventListener("mouseout", onTagLeave);
  root.addEventListener("input", onTagInput);
  root.addEventListener("keydown", onTagKeydown);

  const refresh = async () => {
    await loadStats();
    if (state.tab === "create") renderCreate();
    else if (state.tab === "manage") await loadManage();
    else if (state.tab === "suite") {
      await loadSuites({ refreshAnswers: true });
    } else if (state.tab === "review") await loadReview();
  };

  loadStats();

  return {
    show,
    refresh,
    destroy() {
      if (tagSearchTimer) window.clearTimeout(tagSearchTimer);
      root.removeEventListener("click", onClick);
      root.removeEventListener("submit", onSubmit);
      root.removeEventListener("change", onChange);
      root.removeEventListener("toggle", onToggle, true);
      root.removeEventListener("mouseover", onTagHover);
      root.removeEventListener("mouseout", onTagLeave);
      root.removeEventListener("input", onTagInput);
      root.removeEventListener("keydown", onTagKeydown);
    },
    getStats: () => state.stats,
  };
}
