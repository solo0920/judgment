import { api } from "../api.js";
import {
  addHistory,
  getSetting,
  isDegraded,
  listHistory,
  listSettings,
  prettyValue,
  setSetting,
  storageMode,
} from "../store.js";
import {
  copyText,
  downloadText,
  emptyState,
  escapeHtml,
  formatCell,
  formatDate,
  formatDateTime,
  formatDuration,
  formatNumber,
  icon,
  notice,
  setBusy,
  statusBadge,
  statusMeta,
  toast,
} from "../utils.js";

const PAGE_SIZES = [10, 25, 50, 100];
const MAX_LOCAL_ROWS = 500;
const LAW_PARQUET_PREVIEW_COLUMNS = [
  "law_name",
  "law_level",
  "law_category",
  "law_modified_date",
  "article_count",
];
const JUDGMENT_PARQUET_PREVIEW_COLUMNS = [
  "jid",
  "court_normalized",
  "title",
  "jdate",
  "matched_laws",
  "citation_count",
];
const ARTICLE_TYPE_LABELS = { A: "條文", C: "章節" };

function dbLabel(db) {
  return db?.label || db?.id || "資料庫";
}

function createState(db, pageSize) {
  const values = {};
  for (const field of db.fields || []) {
    const fallback = field.type === "checkbox" ? false : field.type === "multiselect" ? [] : "";
    const value = field.default === undefined ? fallback : field.default;
    values[field.key] = Array.isArray(value) ? [...value] : value;
  }
  return { values, page: 1, pageSize, result: null, sort: null, columnFilters: {}, fuzzyTerms: [] };
}

function fieldVisible(field, values) {
  const when = field.visibleWhen;
  if (!when) return true;
  for (const [key, allowed] of Object.entries(when)) {
    if (!Array.isArray(allowed)) continue;
    if (!allowed.map(String).includes(String(values[key] ?? ""))) return false;
  }
  return true;
}

function visibleFields(db, values) {
  return (db.fields || []).filter((field) => fieldVisible(field, values));
}

function inputId(db, key) {
  return `filter-${db.id}-${key}`;
}

function fieldValueAttribute(value) {
  if (value === null || value === undefined) return "";
  return escapeHtml(String(value));
}

function renderField(db, field, values) {
  const value = values[field.key];
  const id = inputId(db, field.key);
  const help = field.help
    ? `<span class="field-help">${escapeHtml(field.help)}</span>`
    : "";

  if (field.type === "checkbox") {
    return `<div class="field">
      <label class="checkbox-field" for="${id}">
        <input type="checkbox" id="${id}" name="${escapeHtml(field.key)}" ${
          value ? "checked" : ""
        } />
        <span class="checkbox-copy">
          <strong>${escapeHtml(field.label)}</strong>
          ${field.help ? `<span>${escapeHtml(field.help)}</span>` : ""}
        </span>
      </label>
    </div>`;
  }

  const label = `<label class="field-label" for="${id}">
      <span>${escapeHtml(field.label)}</span>
      <span class="field-tag">${escapeHtml(field.key)}</span>
    </label>`;

  if (field.type === "select") {
    const options = (field.options || [])
      .map(
        (option) =>
          `<option value="${fieldValueAttribute(option.value)}" ${
            String(option.value) === String(value ?? "") ? "selected" : ""
          }>${escapeHtml(option.label ?? option.value)}</option>`,
      )
      .join("");
    return `<div class="field">${label}
      <select class="select" id="${id}" name="${escapeHtml(field.key)}">${options}</select>
      ${help}
    </div>`;
  }

  if (field.type === "multiselect") {
    const selected = new Set((Array.isArray(value) ? value : []).map(String));
    const options = (field.options || [])
      .map(
        (option) => `<label class="multi-option">
          <input type="checkbox" name="${escapeHtml(field.key)}" value="${fieldValueAttribute(
            option.value,
          )}" ${selected.has(String(option.value)) ? "checked" : ""} />
          <span>${escapeHtml(option.label ?? option.value)}</span>
        </label>`,
      )
      .join("");
    return `<div class="field">${label}
      <div class="multi-select">${options}</div>
      ${help}
    </div>`;
  }

  if (field.type === "number") {
    return `<div class="field">${label}
      <input class="input" type="number" id="${id}" name="${escapeHtml(field.key)}"
        value="${fieldValueAttribute(value)}"
        ${field.min !== undefined ? `min="${field.min}"` : ""}
        ${field.max !== undefined ? `max="${field.max}"` : ""}
        step="${field.step ?? 1}"
        placeholder="${fieldValueAttribute(field.placeholder || "")}" />
      ${help}
    </div>`;
  }

  if (field.type === "date") {
    return `<div class="field">${label}
      <input class="input" type="date" id="${id}" name="${escapeHtml(field.key)}"
        value="${fieldValueAttribute(value)}" />
      ${help}
    </div>`;
  }

  return `<div class="field">${label}
    <input class="input" type="text" id="${id}" name="${escapeHtml(field.key)}"
      value="${fieldValueAttribute(value)}"
      placeholder="${fieldValueAttribute(field.placeholder || "")}" />
    ${help}
  </div>`;
}

function renderFilters(db, state, { focusTable = false } = {}) {
  const fields = visibleFields(db, state.values);
  const chunks = [];
  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const next = fields[index + 1];
    if (field.type === "date" && next && next.type === "date") {
      chunks.push(`<div class="field-row">${renderField(db, field, state.values)}${renderField(
        db,
        next,
        state.values,
      )}</div>`);
      index += 1;
    } else {
      chunks.push(renderField(db, field, state.values));
    }
  }

  return `<form id="data-filter-form" autocomplete="off">
    <div class="filter-block">
      <div class="filter-head">
        <span class="filter-title">Metadata 條件</span>
        <button class="filter-reset" type="button" data-action="reset">重設</button>
      </div>
      <div class="filter-fields">${chunks.join("")}</div>
    </div>
    <div class="sidebar-actions">
      <button class="btn btn-primary" type="submit" id="run-query" ${
        focusTable ? 'data-focus-table="true"' : ""
      }>
        ${icon("search", 15)}<span>執行查詢</span>
      </button>
    </div>
  </form>`;
}

function readFieldValues(form, db, state) {
  const values = { ...state.values };
  for (const field of visibleFields(db, values)) {
    if (field.type === "checkbox") {
      const element = form.querySelector(`[name="${field.key}"]`);
      values[field.key] = Boolean(element?.checked);
    } else if (field.type === "multiselect") {
      values[field.key] = Array.from(
        form.querySelectorAll(`[name="${field.key}"]:checked`),
      ).map((element) => element.value);
    } else {
      const element = form.querySelector(`[name="${field.key}"]`);
      values[field.key] = element ? element.value : "";
    }
  }
  return values;
}

function readFilters(db, state) {
  const filters = {};
  for (const field of visibleFields(db, state.values)) {
    const value = state.values[field.key];
    if (field.type === "checkbox") filters[field.key] = Boolean(value);
    else if (field.type === "multiselect") {
      filters[field.key] = Array.isArray(value) ? value : [];
    } else if (field.type === "number") {
      filters[field.key] = value === "" || value === null ? "" : Number(value);
    } else {
      filters[field.key] = value ?? "";
    }
  }
  return filters;
}

function queryFilters(db, state) {
  const filters = readFilters(db, state);
  if (Array.isArray(state.fuzzyTerms) && state.fuzzyTerms.length) {
    filters.keywords = [...state.fuzzyTerms];
  }
  if (
    (db.id === "postgres" || db.id === "parquet") &&
    state.sort?.key
  ) {
    filters.sort = `${state.sort.key}:${state.sort.direction}`;
    filters.schema_preview = true;
  }
  if (
    state.columnFilters &&
    Object.keys(state.columnFilters).length > 0
  ) {
    filters.column_filters = state.columnFilters;
  }
  return filters;
}

function dbNotice(db) {
  if (db.status === "operational") return "";
  const tone =
    db.status === "unavailable" ? "danger" : db.status === "degraded" ? "warn" : "info";
  return `<div class="sidebar-notice">${notice({
    tone,
    title: `${dbLabel(db)} ${statusMeta(db.status).label}`,
    text: escapeHtml(db.detail || "目前無法使用這個資料來源。"),
  })}</div>`;
}

function renderDatabaseSelect(databases, selectedId) {
  return `<label class="field data-source-field">
    <span class="field-label">資料來源</span>
    <select class="select" name="database">
      ${databases
        .map((db) => {
          const meta = statusMeta(db.status);
          return `<option value="${escapeHtml(db.id)}" ${
            db.id === selectedId ? "selected" : ""
          }>${escapeHtml(db.label)} · ${escapeHtml(meta.label)}</option>`;
        })
        .join("")}
    </select>
  </label>`;
}

function renderDataNav(selectedCategory, sidebarView) {
  const items = [
    {
      id: "law",
      label: "查詢法規命令",
      hint: "Fuzzy 法規名稱、類別與命令",
      icon: "file",
    },
    {
      id: "judgment",
      label: "查詢判決",
      hint: "Fuzzy 法院、案號與案由",
      icon: "layers",
    },
    {
      id: "schema",
      label: "資料庫 Schema",
      hint: "資料表、欄位與預覽",
      icon: "table",
    },
  ];
  return `<nav class="data-nav" aria-label="資料查詢功能">
    ${items
      .map((item) => {
        const active =
          item.id === "schema"
            ? sidebarView === "schema"
            : sidebarView === "query" && selectedCategory === item.id;
        return `<button class="data-nav-item${active ? " is-active" : ""}" type="button"
          data-action="data-nav" data-tab="${item.id}" ${
            active ? 'aria-current="page"' : ""
          }>
          <span class="data-nav-icon">${icon(item.icon, 15)}</span>
          <span class="data-nav-copy">
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(item.hint)}</small>
          </span>
        </button>`;
      })
      .join("")}
  </nav>`;
}

function renderFuzzySearch(category, db, state) {
  if (db.id !== "postgres" && db.id !== "parquet") return "";
  const terms = Array.isArray(state.fuzzyTerms) ? state.fuzzyTerms : [];
  const label = category === "law" ? "Fuzzy 法規／命令" : "Fuzzy 判決";
  const placeholder =
    category === "law"
      ? "輸入法規名稱或相近字…"
      : "輸入法院、案號、案由或相近字…";
  return `<div class="data-fuzzy" data-data-fuzzy data-fuzzy-kind="${category}">
    <div class="data-fuzzy-head">
      <span class="filter-title">${label}</span>
      <span class="field-tag">多條件 AND</span>
    </div>
    <div class="data-fuzzy-row">
      <div class="data-fuzzy-values">
        ${
          terms.length
            ? terms
                .map(
                  (term) =>
                    `<span class="chip data-fuzzy-chip">${escapeHtml(term)}<button class="data-fuzzy-remove" type="button" data-action="remove-fuzzy-term" data-term="${escapeHtml(term)}" aria-label="移除 ${escapeHtml(term)}">${icon("x", 9)}</button></span>`,
                )
                .join("")
            : `<span class="data-fuzzy-placeholder">${placeholder}</span>`
        }
      </div>
      <button class="data-fuzzy-add" type="button" data-action="open-fuzzy" aria-label="加入 fuzzy 條件" aria-haspopup="listbox">${icon("plus", 13)}</button>
    </div>
    <div class="data-fuzzy-popover" data-data-fuzzy-popover hidden>
      <input class="input" type="search" data-data-fuzzy-search placeholder="${placeholder}" autocomplete="off" />
      <div class="data-fuzzy-results" data-data-fuzzy-results role="listbox" aria-live="polite"></div>
    </div>
  </div>`;
}

function renderSchemaPanel(db, categoryLabel, selectedTableId = "") {
  const tables = Array.isArray(db.tables) ? db.tables : [];
  const body = tables.length
    ? tables
        .map((table) => {
          const selected = String(table.id) === String(selectedTableId || "");
          return `<button class="schema-item ${selected ? "is-selected" : ""}" type="button"
            data-action="select-schema-table"
            data-table-id="${escapeHtml(table.id)}">
            <span class="schema-item-top">
              <span class="schema-item-name">${escapeHtml(table.label || table.id)}</span>
              <span class="schema-item-action">${db.id === "qdrant" ? "檢視" : "預覽"}</span>
            </span>
            <span class="schema-item-id mono">${escapeHtml(table.id)}</span>
            <span class="schema-item-desc">${escapeHtml(table.description || "")}</span>
          </button>`;
        })
        .join("")
    : `<div class="report-empty-inline">這個資料庫沒有可顯示的資料表。</div>`;
  return `<div class="schema-panel">
    <div class="filter-head">
      <span class="filter-title">${escapeHtml(categoryLabel || "資料表")} · Schema</span>
      <span class="field-tag">${escapeHtml(db.label || db.id)}</span>
    </div>
    <div class="schema-list">${body}</div>
    <div class="sidebar-note">點選資料表，在右側預覽欄位名稱、前 10 筆資料與總筆數。</div>
  </div>`;
}

function sidebarNote(db) {
  const notes = {
    postgres:
      "PostgreSQL 查詢使用參數化條件與分頁，僅讀取資料。",
    parquet:
      "Parquet 查詢直接掃描目前最新的快照；勾選原始 JSON 會增加回傳量與渲染時間。",
    qdrant:
      "Qdrant 以 embedding 相似度檢索判決；需要先完成向量索引。檢索結果只包含索引中實際存在的判決，不會產生虛構資料。",
    indexeddb:
      "IndexedDB 只在這個瀏覽器內查詢，不會經過伺服器；清除網站資料後紀錄會消失。",
  };
  return notes[db.id] || escapeHtml(db.detail || "");
}

function emptyReport(db) {
  const copy = {
    postgres: "使用左側 fuzzy 查詢加入法規或判決條件，再視需要展開進階 metadata 條件。",
    parquet: "使用左側 fuzzy 查詢加入條件，直接掃描原始 Parquet；可展開進階條件調整欄位。",
    qdrant: "輸入語意查詢後，以 embedding 相似度檢索已建立向量索引的判決；未索引時會明確顯示狀態。",
    indexeddb: "查詢存在這個瀏覽器的提問紀錄與設定，不需要伺服器。",
  };
  return `<div class="report-empty">
    ${emptyState({
      iconName: "table",
      title: "查詢報表會顯示在這裡",
      text: escapeHtml(copy[db.id] || "設定條件後執行查詢。"),
    })}
    <div class="query-hint-grid">
      <div class="query-hint">
        <strong>01 · 選擇功能</strong>
        <span>左側切換查詢法規命令、查詢判決或資料庫 Schema。</span>
      </div>
      <div class="query-hint">
        <strong>02 · 加入 fuzzy 條件</strong>
        <span>輸入相近字並從 suggestion 選擇，按 + 可加入多個條件（AND）。</span>
      </div>
      <div class="query-hint">
        <strong>03 · 檢視結果</strong>
        <span>右側產生摘要、分布、實際查詢語句與可匯出的資料表。</span>
      </div>
    </div>
  </div>`;
}

export function reportLoading(db) {
  return `<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${escapeHtml(dbLabel(db))} 查詢中</div>
        <div class="report-sub">正在套用 metadata 條件並整理報表…</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:94%"></div>
      <div class="skeleton skeleton-line" style="width:82%"></div>
      <div class="skeleton skeleton-line" style="width:88%"></div>
      <div class="skeleton skeleton-line" style="width:56%;margin-bottom:0"></div>
    </div>
  </div>`;
}

export function reportError(error, db) {
  return `<div class="report-card">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT</div>
        <div class="report-title">${escapeHtml(dbLabel(db))} 查詢失敗</div>
        <div class="report-sub">請求未完成，沒有顯示任何推測資料。</div>
      </div>
    </div>
    <div class="report-section">
      ${notice({
        tone: "danger",
        title: "無法取得查詢結果",
        text: escapeHtml(error.message || "請稍後再試。"),
      })}
      <div class="empty-actions" style="justify-content:flex-start;margin-top:14px">
        <button class="btn btn-secondary btn-sm" type="button" data-action="retry">
          ${icon("refresh", 14)}<span>重試</span>
        </button>
      </div>
    </div>
  </div>`;
}

function renderDistribution(items) {
  if (!items.length) {
    return `<div class="report-empty-inline">這次查詢沒有可呈現的分布資料。</div>`;
  }
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
  return `<div class="distribution">
    ${items
      .map((item) => {
        const value = Number(item.value) || 0;
        const width = Math.max(1.5, (value / max) * 100);
        return `<div class="dist-row">
          <span class="dist-label" title="${escapeHtml(item.label || "未分類")}">${escapeHtml(
            item.label || "未分類",
          )}</span>
          <span class="dist-track"><span class="dist-bar" style="width:${width.toFixed(
            1,
          )}%"></span></span>
          <span class="dist-value">${formatNumber(value)}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function isLawResult(result) {
  return (
    result &&
    (result.database === "postgres" || result.database === "parquet") &&
    result.table === "law_documents"
  );
}

function isJudgmentResult(result) {
  return (
    result &&
    (result.database === "postgres" || result.database === "parquet") &&
    result.table === "judgment_documents"
  );
}

function isJudgmentVectorResult(result) {
  return (
    result &&
    result.database === "qdrant" &&
    String(result.table || "").startsWith("judgment")
  );
}

function judgmentLink(row) {
  const jid = row._jid || row.jid;
  if (!jid) return "—";
  return `<button class="law-link judgment-link" type="button" data-action="open-judgment"
    data-jid="${escapeHtml(String(jid))}"
    title="檢視「${escapeHtml(String(jid))}」的判決原文">${escapeHtml(
      String(jid),
    )}${icon("chevronRight", 12, "law-link-icon")}</button>`;
}

const JUDGMENT_SORT_COLUMNS = {
  jid: "jid",
  court: "court",
  court_normalized: "court",
  title: "title",
  jdate: "jdate",
  matched_laws: "matched_laws",
  citation_count: "citation_count",
  full_text_length: "full_text_length",
};

function renderTableHeader(
  column,
  judgmentResult,
  sort,
  useColumnKeys = false,
  sortable = true,
  sortableAll = false,
) {
  const label = useColumnKeys ? column.key : column.label || column.key;
  const sortKey = !sortable
    ? null
    : judgmentResult
      ? JUDGMENT_SORT_COLUMNS[column.key] || column.key
      : sortableAll
        ? column.key
        : null;
  if (!sortKey) return `<th scope="col">${escapeHtml(label)}</th>`;
  const active = sort?.key === sortKey;
  const direction = active ? sort.direction : null;
  const ariaSort =
    direction === "asc"
      ? "ascending"
      : direction === "desc"
        ? "descending"
        : "none";
  const indicator =
    direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕";
  return `<th scope="col" aria-sort="${ariaSort}">
    <button class="table-sort${active ? " is-active" : ""}" type="button"
      data-action="sort-column" data-sort-key="${escapeHtml(sortKey)}"
      title="依${escapeHtml(label)}排序">
      <span>${escapeHtml(label)}</span>
      <span class="table-sort-icon" aria-hidden="true">${indicator}</span>
    </button>
  </th>`;
}

function lawTarget(result, row) {
  if (!isLawResult(result) || !row) return null;
  const lawKey = row._law_key || row.law_name;
  if (!lawKey) return null;
  const dataset = result.meta?.dataset;
  const sourceType =
    row._law_source_type || (dataset && dataset !== "all" ? dataset : "");
  return {
    lawKey: String(lawKey),
    sourceType: String(sourceType || ""),
    lawName: String(row.law_name || ""),
  };
}

function lawLink(row, column, target) {
  const label = row[column.key];
  if (label === null || label === undefined || label === "") return "—";
  return `<button class="law-link" type="button" data-action="open-law"
    data-law-key="${escapeHtml(target.lawKey)}"
    data-law-source="${escapeHtml(target.sourceType)}"
    data-law-name="${escapeHtml(target.lawName)}"
    title="檢視「${escapeHtml(String(label))}」的完整法規報表">${escapeHtml(
      String(label),
    )}${icon("chevronRight", 12, "law-link-icon")}</button>`;
}

function renderTable(
  result,
  {
    useColumnKeys = false,
    sortable = true,
    sortableAll = false,
    searchValues = null,
    compact = false,
  } = {},
) {
  const columns = Array.isArray(result.columns) ? result.columns : [];
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const start = (result.page - 1) * result.page_size;
  const lawResult = isLawResult(result);
  const judgmentResult = isJudgmentResult(result);
  const vectorJudgmentResult = isJudgmentVectorResult(result);
  const sort = result.meta?.sort || null;
  const searchRow = searchValues
    ? `<tr class="schema-search-row">
        <th scope="col" class="cell-index-head"></th>
        ${columns
          .map(
            (column) => `<th scope="col">
              <div class="schema-search-wrap">
                <input class="schema-search-input" type="search"
                  data-schema-search="${escapeHtml(column.key)}"
                  value="${escapeHtml(String(searchValues[column.key] ?? ""))}"
                  placeholder="搜尋 ${escapeHtml(column.key)}"
                  autocomplete="off" />
              </div>
            </th>`,
          )
          .join("")}
      </tr>`
    : "";

  if (!columns.length) {
    return `<div class="report-table-head">
      <span class="report-section-title">資料列</span>
      <span class="muted" style="font-size:10px">此資料來源沒有表格欄位</span>
    </div>`;
  }

  if (!rows.length) {
    return `<div class="report-table-head">
        <span class="report-section-title">資料列</span>
        <span class="muted" style="font-size:10px">0 rows</span>
      </div>
      ${emptyState({
        iconName: "filter",
        title: "沒有符合條件的資料",
        text: "放寬日期區間、降低條文數下限，或清除關鍵字後再試一次。",
      })}`;
  }

  return `<div class="report-table-head">
      <span class="report-section-title">資料列</span>
      <span class="muted" style="font-size:10px">${formatNumber(
        rows.length,
      )} rows · 第 ${result.page} 頁${
        lawResult
          ? " · 點選法規名稱可檢視完整條文"
          : judgmentResult
            ? " · 點選案號可檢視判決原文 · 欄位標題可排序"
            : vectorJudgmentResult
              ? " · 點選案號可檢視判決原文 · 依相似度排序"
              : ""
      }</span>
    </div>
    <div class="table-wrap">
      <table class="data-table${compact ? " is-compact" : ""}">
        <thead>${searchRow}<tr>
          <th scope="col" class="cell-index-head">#</th>
          ${columns
            .map((column) =>
              renderTableHeader(
                column,
                judgmentResult,
                sort,
                useColumnKeys,
                sortable,
                sortableAll,
              ),
            )
            .join("")}
        </tr></thead>
        <tbody>
          ${rows
            .map(
              (row, rowIndex) => `<tr>
                <td class="cell-mono cell-empty cell-index">${start + rowIndex + 1}</td>
                ${columns
                  .map((column) => {
                    if (
                      (judgmentResult || vectorJudgmentResult) &&
                      column.key === "jid"
                    ) {
                      return `<td class="cell-jid">${judgmentLink(row)}</td>`;
                    }
                    const target =
                      lawResult && column.key === "law_name" ? lawTarget(result, row) : null;
                    if (target) {
                      return `<td>${lawLink(row, column, target)}</td>`;
                    }
                    const typeClasses = {
                      date: "cell-date",
                      datetime: "cell-datetime",
                      duration: "cell-duration",
                      number: "cell-number",
                    };
                    const cellClass = typeClasses[column.type];
                    return `<td${cellClass ? ` class="${cellClass}"` : ""}>${formatCell(
                      row[column.key],
                      column.type || "text",
                    )}</td>`;
                  })
                  .join("")}
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderPagination(result) {
  const total = Number(result.total) || 0;
  const pageSize = Number(result.page_size) || 25;
  const page = Number(result.page) || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return `<div class="pagination-bar">
    <div class="pagination-info">
      第 <strong>${page}</strong> / ${totalPages} 頁 ·
      顯示 ${formatNumber(start)}–${formatNumber(end)} / ${formatNumber(total)} 筆
    </div>
    <div class="pagination-actions">
      <label class="page-size">每頁
        <select class="select" data-page-size aria-label="每頁筆數">
          ${PAGE_SIZES.map(
            (size) => `<option value="${size}" ${size === pageSize ? "selected" : ""}>${size}</option>`,
          ).join("")}
        </select>
      </label>
      <button class="page-btn" type="button" data-action="prev-page" ${
        page <= 1 ? "disabled" : ""
      } aria-label="上一頁">${icon("chevronLeft", 13)}</button>
      <span class="page-btn" aria-hidden="true">${page}</span>
      <button class="page-btn" type="button" data-action="next-page" ${
        page >= totalPages ? "disabled" : ""
      } aria-label="下一頁">${icon("chevronRight", 13)}</button>
    </div>
  </div>`;
}

function renderWarnings(warnings) {
  if (!Array.isArray(warnings) || !warnings.length) return "";
  return `<div class="warnings">${warnings
    .map((warning) => `<div class="warning-line">${escapeHtml(warning)}</div>`)
    .join("")}</div>`;
}

export function renderReport(result) {
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const columns = Array.isArray(result.columns) ? result.columns : [];
  const summary = Array.isArray(result.summary) ? result.summary : [];
  const distribution = Array.isArray(result.distribution) ? result.distribution : [];
  const total = Number(result.total) || 0;
  const queryText = result.query_text || "";
  const db = result.database || "";
  const status = result.status || "ok";
  const tableLabel =
    result.meta?.table_label || result.table || result.label || "query result";

  return `<div class="report-card" data-database="${escapeHtml(db)}">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">QUERY REPORT · ${escapeHtml(String(db).toUpperCase())}</div>
        <div class="report-title">
          ${escapeHtml(result.label || db)}
          ${statusBadge(status)}
          <span class="chip">${escapeHtml(tableLabel)}</span>
        </div>
        <div class="report-sub">
          ${formatNumber(total)} 筆符合 ·
          ${formatDuration(result.duration_ms)} ·
          ${escapeHtml(String(db).toUpperCase())} / ${escapeHtml(String(result.table || "—"))}
        </div>
      </div>
      <div class="report-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-csv" ${
          rows.length ? "" : "disabled"
        }>${icon("download", 14)}<span>CSV</span></button>
        <button class="btn btn-secondary btn-sm" type="button" data-action="export-json" ${
          rows.length ? "" : "disabled"
        }>${icon("file", 14)}<span>JSON</span></button>
      </div>
    </div>

    ${result.message ? `<div class="report-alert">${notice({
      tone: status === "not_configured" ? "info" : status === "danger" ? "danger" : "warn",
      title: "資料來源提示",
      text: escapeHtml(result.message),
    })}</div>` : ""}

    ${
      summary.length
        ? `<div class="summary-strip">
            ${summary
              .slice(0, 4)
              .map(
                (item) => `<div class="summary-item">
                  <div class="summary-label">${escapeHtml(item.label)}</div>
                  <div class="summary-value">${escapeHtml(item.value)}</div>
                </div>`,
              )
              .join("")}
          </div>`
        : ""
    }

    <div class="report-grid">
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">結果分布</span>
          <span class="muted" style="font-size:9.5px">${distribution.length} groups</span>
        </div>
        ${renderDistribution(distribution)}
      </div>
      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">實際查詢語句</span>
          <span class="muted" style="font-size:9.5px">${escapeHtml(
            result.database === "indexeddb" ? "client-side" : "read-only",
          )}</span>
        </div>
        <div class="query-box">
          <pre class="query-code">${escapeHtml(queryText || "—")}</pre>
          <button class="btn btn-secondary btn-sm btn-copy" type="button" data-action="copy-query">
            ${icon("copy", 12)}<span>複製</span>
          </button>
        </div>
        ${renderWarnings(result.warnings)}
      </div>
    </div>

    ${
      columns.length || rows.length
        ? renderTable(result, {
            compact: true,
            sortableAll: true,
            searchValues: result.meta?.searchable
              ? result.meta.column_filters || {}
              : null,
          })
        : ""
    }
    ${
      total || columns.length
        ? renderPagination({
            ...result,
            total,
            page: Number(result.page) || 1,
            page_size: Number(result.page_size) || 25,
          })
        : ""
    }
  </div>`;
}

function renderSchemaPreviewLoading(tableLabel) {
  return `<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${escapeHtml(tableLabel || "資料表")}</div>
        <div class="report-sub">正在讀取欄位與前 10 筆資料…</div>
      </div>
      <span class="spinner" aria-hidden="true"></span>
    </div>
    <div class="report-loading">
      <div class="skeleton skeleton-line" style="width:92%"></div>
      <div class="skeleton skeleton-line" style="width:76%"></div>
      <div class="skeleton skeleton-line" style="width:84%"></div>
    </div>
  </div>`;
}

function renderSchemaPreview(
  result,
  tableLabel,
  { columnFilters = {}, searchEnabled = false } = {},
) {
  const columns = Array.isArray(result.columns) ? result.columns : [];
  const rows = Array.isArray(result.rows) ? result.rows : [];
  const message = result.message
    ? `<div class="report-alert">${notice({
        tone: result.status === "ok" ? "info" : "warn",
        title: "資料來源提示",
        text: escapeHtml(result.message),
      })}</div>`
    : "";
  return `<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW · ${escapeHtml(
          String(result.database || "").toUpperCase(),
        )}</div>
        <div class="report-title">
          ${escapeHtml(tableLabel || result.table || "資料表")}
          ${statusBadge(result.status || "ok")}
        </div>
        <div class="report-sub">
          ${escapeHtml(String(result.database || ""))} / ${escapeHtml(
            String(result.table || "—"),
          )} · ${columns.length} 欄位 · 前 ${rows.length} 筆
        </div>
      </div>
    </div>
    ${message}
    ${renderTable(
      { ...result, page: 1, page_size: 10 },
      {
        useColumnKeys: true,
        sortable: true,
        sortableAll: true,
        searchValues: searchEnabled ? columnFilters : null,
      },
    )}
    ${renderWarnings(result.warnings)}
    <div class="schema-preview-footer">
      <span>預覽前 ${formatNumber(rows.length)} 筆</span>
      <strong>共 ${formatNumber(result.total)} 筆</strong>
    </div>
  </div>`;
}

function renderSchemaPreviewError(error, tableLabel) {
  return `<div class="report-card schema-preview">
    <div class="report-head">
      <div class="report-title-group">
        <div class="report-kicker">SCHEMA PREVIEW</div>
        <div class="report-title">${escapeHtml(tableLabel || "資料表")}</div>
        <div class="report-sub">無法讀取資料表預覽。</div>
      </div>
    </div>
    ${notice({
      tone: "danger",
      title: "讀取失敗",
      text: escapeHtml(error.message || "請稍後再試。"),
    })}
  </div>`;
}

function schemaEmptyState(db) {
  return `<div class="report-empty">
    ${emptyState({
      iconName: "table",
      title: "選擇資料表預覽",
      text: `從左側 ${dbLabel(db)} 的 Schema 清單點選資料表，這裡會顯示欄位名稱、前 10 筆資料與總筆數。`,
    })}
  </div>`;
}

function lawStatusBadge(detail) {
  if (detail.is_current === true) return statusBadge("ok", "現行");
  if (detail.law_abandon_note) return statusBadge("empty", "已廢止");
  if (detail.is_current === false) return statusBadge("empty", "歷史版本");
  return statusBadge("not_configured", "狀態未提供");
}

function lawMetaItem(label, value) {
  return `<div class="law-meta-item">
    <div class="law-meta-label">${escapeHtml(label)}</div>
    <div class="law-meta-value">${value || "—"}</div>
  </div>`;
}

function lawDate(value) {
  return value ? formatDate(value) : "—";
}

function lawMetadataSource(detail) {
  if (detail?.meta?.metadata_source === "postgresql") return "PostgreSQL metadata";
  if (detail?.meta?.metadata_source === "parquet") return "Parquet snapshot";
  return "—";
}

function lawTextSection(title, content) {
  if (!content) return "";
  return `<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">${escapeHtml(title)}</span>
    </div>
    <div class="law-text-block">${escapeHtml(String(content).trim())}</div>
  </div>`;
}

function lawDisclosureSection(title, content, { open = false } = {}) {
  if (!content) return "";
  return `<details class="report-section law-disclosure" data-law-history ${
    open ? "open" : ""
  }>
    <summary class="law-disclosure-summary">
      <span class="report-section-title">${escapeHtml(title)}</span>
      <span class="law-disclosure-hint">預設收合 · 點擊展開</span>
      ${icon("chevronDown", 14, "law-disclosure-chevron")}
    </summary>
    <div class="law-text-block">${escapeHtml(String(content).trim())}</div>
  </details>`;
}

function renderLawAttachments(attachments) {
  const list = Array.isArray(attachments) ? attachments : [];
  const items = list
    .map((item) => {
      const label = item?.name || item?.url || "";
      if (!label) return "";
      if (item.url) {
        return `<a class="law-attachment" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
          ${icon("file", 12)}<span>${escapeHtml(label)}</span>${icon("external", 11)}
        </a>`;
      }
      return `<span class="law-attachment">${icon("file", 12)}<span>${escapeHtml(label)}</span></span>`;
    })
    .filter(Boolean)
    .join("");
  if (!items) return "";
  return `<div class="report-section">
    <div class="report-section-head">
      <span class="report-section-title">附件</span>
      <span class="muted">${formatNumber(list.length)}</span>
    </div>
    <div class="law-attachment-list">${items}</div>
  </div>`;
}

function articleKey(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/^第/, "")
    .replace(/條$/, "")
    .replace(/之/g, "-");
}

function renderArticles(detail) {
  const articles = Array.isArray(detail.articles) ? detail.articles : [];
  const chapterCount = articles.filter((article) => article.article_type === "C").length;
  const contentCount = articles.length - chapterCount;
  const countLabel = chapterCount
    ? `${formatNumber(contentCount)} 條 · ${formatNumber(chapterCount)} 章節`
    : `${formatNumber(contentCount)} 條`;
  const body = articles
    .map((article) => {
      const content = String(article.article_content || "").trim();
      if (!content) return "";
      if (article.article_type === "C") {
        return `<div class="law-chapter">${escapeHtml(content)}</div>`;
      }
      const typeLabel = ARTICLE_TYPE_LABELS[article.article_type] || article.article_type;
      return `<article class="law-article"
        data-article-no="${escapeHtml(articleKey(article.article_no))}">
        <div class="law-article-head">
          <span class="law-article-no">${escapeHtml(article.article_no || "條文")}</span>
          ${
            typeLabel && typeLabel !== "條文"
              ? `<span class="chip">${escapeHtml(typeLabel)}</span>`
              : ""
          }
        </div>
        <div class="law-article-text">${escapeHtml(content)}</div>
      </article>`;
    })
    .join("");

  return `<div class="report-section law-articles-section">
    <div class="report-section-head">
      <span class="report-section-title">條文內容</span>
      <div class="law-article-controls">
        <span class="muted">${countLabel}</span>
        <div class="law-article-jump">
          <input class="input law-article-jump-input law-jump-input" id="law-article-jump"
            type="text" inputmode="numeric" autocomplete="off"
            placeholder="跳至第幾條" aria-label="跳至指定條文" />
          <button class="btn btn-secondary btn-sm" type="button"
            data-action="jump-article" data-jump-input="law-article-jump">跳至條文</button>
        </div>
      </div>
    </div>
    ${
      body
        ? `<div class="law-article-list">${body}</div>`
        : `<div class="report-empty-inline">這個法規目前沒有可顯示的條文內容。</div>`
    }
  </div>`;
}

function renderLawJumpFloat() {
  return `<div class="law-jump-float">
    <input class="input law-article-jump-input law-jump-input"
      id="law-article-jump-float" type="text" inputmode="numeric"
      autocomplete="off" placeholder="跳至第幾條" aria-label="跳至指定條文" />
    <button class="btn btn-secondary btn-sm" type="button"
      data-action="jump-article" data-jump-input="law-article-jump-float">跳至</button>
  </div>`;
}

function lawReportBackButton() {
  return `<button class="btn btn-secondary btn-sm" type="button" data-action="back-to-results">
    ${icon("chevronLeft", 14)}<span>返回查詢結果</span>
  </button>`;
}

function renderLawLoading(lawName) {
  return `<div class="law-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin">正在載入法規報表…</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${escapeHtml(lawName || "法規")}</div>
          <div class="report-sub">正在取得 metadata 與最新 Parquet 條文…</div>
        </div>
        <span class="spinner" aria-hidden="true"></span>
      </div>
      <div class="report-loading">
        <div class="skeleton skeleton-line" style="width:92%"></div>
        <div class="skeleton skeleton-line" style="width:78%"></div>
        <div class="skeleton skeleton-line" style="width:86%"></div>
      </div>
    </div>
  </div>`;
}

function renderLawError(error, lawName) {
  return `<div class="law-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin">法規報表載入失敗</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT</div>
          <div class="report-title">${escapeHtml(lawName || "法規")}</div>
          <div class="report-sub">無法取得這個法規的完整報表。</div>
        </div>
      </div>
      <div class="report-section">
        ${notice({
          tone: "danger",
          title: "無法取得法規報表",
          text: escapeHtml(error.message || "請稍後再試。"),
        })}
      </div>
    </div>
  </div>`;
}

function renderLawVersionSelector(detail) {
  const versions = Array.isArray(detail.versions) ? detail.versions : [];
  if (versions.length < 1) return "";
  const selected = detail.selected_version_id ?? "";
  return `<label class="law-version-select">
    <span>條文版本</span>
    <select class="select" data-action="select-law-version" aria-label="選擇法規條文版本">
      ${versions
        .map((item) => {
          const updateDate =
            String(item.update_date || "").match(/\d{4}\/\d{1,2}\/\d{1,2}/)?.[0] ||
            "";
          const label = [
            `#${item.version_id}`,
            item.is_current ? "目前" : "歷史",
            updateDate,
            item.article_count_for_law
              ? `${formatNumber(item.article_count_for_law)} 筆`
              : "無條文快照",
          ]
            .filter(Boolean)
            .join(" · ");
          return `<option value="${escapeHtml(item.version_id)}" ${
            String(item.version_id) === String(selected) ? "selected" : ""
          }>${escapeHtml(label)}</option>`;
        })
        .join("")}
    </select>
  </label>`;
}

function renderLawVersionChanges(detail) {
  const summary = detail.change_summary || {};
  const total = Object.values(summary).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0,
  );
  const changes = Array.isArray(detail.changes) ? detail.changes : [];
  if (!detail.changes_available && !total) return "";
  const labels = { added: "新增", modified: "修改", removed: "移除" };
  const counts = ["added", "modified", "removed"]
    .map((key) => `${labels[key]} ${formatNumber(summary[key] || 0)}`)
    .join(" · ");
  return `<details class="report-section law-version-changes">
    <summary>
      <span class="report-section-title">版本變更</span>
      <span class="muted">${escapeHtml(counts)}</span>
    </summary>
    <div class="law-version-change-list">
      ${
        changes.length
          ? changes
              .slice(0, 20)
              .map((item) => {
                const tone =
                  item.change_type === "added"
                    ? "badge-ok"
                    : item.change_type === "removed"
                      ? "badge-danger"
                      : "badge-warn";
                const before = item.before_content
                  ? `<details><summary>變更前</summary><pre>${escapeHtml(
                      item.before_content,
                    )}</pre></details>`
                  : "";
                const after = item.after_content
                  ? `<details><summary>變更後</summary><pre>${escapeHtml(
                      item.after_content,
                    )}</pre></details>`
                  : "";
                return `<div class="law-version-change">
                  <div class="law-version-change-head">
                    <span class="badge ${tone}">${escapeHtml(
                      labels[item.change_type] || item.change_type,
                    )}</span>
                    <strong>${escapeHtml(item.article_no || item.article_key)}</strong>
                  </div>
                  ${before}${after}
                </div>`;
              })
              .join("")
          : `<div class="report-empty-inline">此版本沒有可顯示的條文變更。</div>`
      }
      ${
        detail.changes_truncated
          ? `<div class="report-empty-inline">僅顯示前 20 筆變更；API 回傳上限 200 筆。</div>`
          : ""
      }
    </div>
  </details>`;
}

function renderLawReport(detail, { database = "", lawPage = 1, historyOpen = false } = {}) {
  const warnings = Array.isArray(detail.warnings) ? detail.warnings : [];
  const title = detail.law_name || detail.law_key || "法規";
  const contentCount = (Array.isArray(detail.articles) ? detail.articles : []).filter(
    (article) => article.article_type !== "C",
  ).length;
  const metadataSource = lawMetadataSource(detail);
  const articleSource =
    detail.meta?.articles_source === "postgresql"
      ? "PostgreSQL 條文版本"
      : detail.meta?.articles_source === "parquet"
        ? "Parquet 條文"
        : "條文未提供";
  const snapshot = detail.meta?.snapshot || "";
  const versionOrigin =
    detail.meta?.articles_source === "postgresql" &&
    detail.selected_version_id !== null &&
    detail.selected_version_id !== undefined
      ? `條文版本 #${detail.selected_version_id}`
      : "";
  const origin = [metadataSource, articleSource, versionOrigin, snapshot]
    .filter(Boolean)
    .join(" · ");
  const sourceTypeLabel =
    detail.source_type === "law"
      ? "法律"
      : detail.source_type === "order"
        ? "命令"
        : detail.source_type || "—";
  const version = detail.version || {};
  const metaItems = [
    lawMetaItem("法規位階", escapeHtml(detail.law_level || "—")),
    lawMetaItem("法規類別", escapeHtml(detail.law_category || "—")),
    lawMetaItem("異動日期", lawDate(detail.law_modified_date)),
    lawMetaItem("生效日期", lawDate(detail.law_effective_date)),
    lawMetaItem("條文數", formatNumber(detail.article_count)),
    lawMetaItem("資料狀態", lawStatusBadge(detail)),
    lawMetaItem("英譯名稱", escapeHtml(detail.eng_law_name || "—")),
    lawMetaItem("法規識別", `<span class="mono">${escapeHtml(detail.law_key || "—")}</span>`),
  ];
  if (version.first_seen_version_id !== null && version.first_seen_version_id !== undefined) {
    metaItems.push(lawMetaItem("首次收錄版本", `#${escapeHtml(version.first_seen_version_id)}`));
  }
  if (version.last_seen_version_id !== null && version.last_seen_version_id !== undefined) {
    metaItems.push(lawMetaItem("最後收錄版本", `#${escapeHtml(version.last_seen_version_id)}`));
  }
  if (version.last_seen_at) {
    metaItems.push(lawMetaItem("最後收錄時間", escapeHtml(formatDateTime(version.last_seen_at))));
  }
  if (version.selected_version_id !== null && version.selected_version_id !== undefined) {
    metaItems.push(
      lawMetaItem(
        "條文版本",
        `#${escapeHtml(version.selected_version_id)} · ${
          detail.meta?.selected_version_is_current ? "目前" : "歷史"
        }`,
      ),
    );
  }

  return `<div class="law-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin" title="${escapeHtml(origin)}">${escapeHtml(origin)}</span>
    </div>
    <div class="report-card law-report-card" data-database="${escapeHtml(database)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">LAW REPORT · ${escapeHtml(
            String(database || metadataSource).toUpperCase(),
          )}</div>
          <div class="report-title">
            ${escapeHtml(title)}
            ${lawStatusBadge(detail)}
            <span class="chip">${escapeHtml(sourceTypeLabel)}</span>
          </div>
          <div class="report-sub">
            ${escapeHtml(
              [detail.law_level, detail.law_category].filter(Boolean).join(" · ") || "—",
            )} · ${formatNumber(detail.article_count)} 條 · 異動 ${lawDate(
              detail.law_modified_date,
            )}
          </div>
        </div>
        <div class="report-actions">
          ${renderLawVersionSelector(detail)}
          ${
            detail.law_url
              ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(
                  detail.law_url,
                )}" target="_blank" rel="noopener noreferrer">${icon(
                  "external",
                  14,
                )}<span>來源網站</span></a>`
              : ""
          }
        </div>
      </div>

      ${
        warnings.length
          ? `<div class="report-alert">${notice({
              tone: detail.status === "degraded" ? "warn" : "info",
              title: "資料來源提示",
              text: warnings.map((warning) => escapeHtml(warning)).join("<br />"),
            })}</div>`
          : ""
      }

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">條文數</div>
          <div class="summary-value">${formatNumber(detail.article_count)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">異動日期</div>
          <div class="summary-value">${lawDate(detail.law_modified_date)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">法規位階</div>
          <div class="summary-value">${escapeHtml(detail.law_level || "—")}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">目前狀態</div>
          <div class="summary-value">${lawStatusBadge(detail)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">法規資訊</span>
          <span class="muted" style="font-size:9.5px">${escapeHtml(metadataSource)}</span>
        </div>
        <div class="law-meta-grid">${metaItems.join("")}</div>
      </div>

      ${renderLawVersionChanges(detail)}
      ${lawTextSection("法規前言", detail.law_foreword)}
      ${lawDisclosureSection("法規沿革", detail.law_histories, { open: historyOpen })}
      ${lawTextSection("生效說明", detail.law_effective_note)}
      ${lawTextSection("廢止說明", detail.law_abandon_note)}
      ${renderLawAttachments(detail.attachments)}
      ${renderArticles(detail)}
    </div>
    ${contentCount > 100 ? renderLawJumpFloat() : ""}
  </div>`;
}

function renderJudgmentLoading(jid) {
  return `<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin">正在載入判決原文…</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${escapeHtml(jid || "判決")}</div>
          <div class="report-sub">正在取得判決全文與引用資料…</div>
        </div>
        <span class="spinner" aria-hidden="true"></span>
      </div>
      <div class="report-loading">
        <div class="skeleton skeleton-line" style="width:92%"></div>
        <div class="skeleton skeleton-line" style="width:78%"></div>
        <div class="skeleton skeleton-line" style="width:86%"></div>
      </div>
    </div>
  </div>`;
}

function renderJudgmentError(error, jid) {
  return `<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin">判決原文載入失敗</span>
    </div>
    <div class="report-card">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT</div>
          <div class="report-title">${escapeHtml(jid || "判決")}</div>
          <div class="report-sub">無法取得這筆判決的完整內容。</div>
        </div>
      </div>
      <div class="report-section">
        ${notice({
          tone: "danger",
          title: "無法取得判決原文",
          text: escapeHtml(error.message || "請稍後再試。"),
        })}
      </div>
    </div>
  </div>`;
}

function judgmentCitationLawLink(lawName) {
  const name = String(lawName || "").trim();
  if (!name) return "—";
  return `<button class="law-link judgment-citation-law" type="button"
    data-action="open-law"
    data-law-key="${escapeHtml(name)}"
    data-law-source=""
    data-law-name="${escapeHtml(name)}"
    title="檢視「${escapeHtml(name)}」的完整法規報表">${escapeHtml(
      name,
    )}${icon("chevronRight", 12, "law-link-icon")}</button>`;
}

function renderJudgmentCitations(detail) {
  const groups = new Map();
  for (const citation of Array.isArray(detail.citations) ? detail.citations : []) {
    const law = String(citation.law_name || "").trim();
    if (!law) continue;
    if (!groups.has(law)) groups.set(law, new Set());
    const article = String(citation.article_no || "").trim();
    if (article) groups.get(law).add(article);
  }
  if (!groups.size) {
    return `<div class="report-empty-inline">這筆判決沒有可顯示的引用明細。</div>`;
  }
  return `<div class="judgment-citation-groups">
    ${[...groups.entries()]
      .map(
        ([law, articles]) => `<div class="judgment-citation-group">
          ${judgmentCitationLawLink(law)}
          <span class="judgment-citation-articles">${
            [...articles].map((value) => escapeHtml(value)).join("、") || "—"
          }</span>
        </div>`,
      )
      .join("")}
  </div>`;
}

function renderJudgmentReport(detail, { database = "postgres" } = {}) {
  const matchedLaws = Array.isArray(detail.matched_laws)
    ? detail.matched_laws
    : [];
  const title = detail.title || detail.jid || "判決";
  const fullText = String(detail.full_text || "");
  const fullTextLength =
    Number(detail.full_text_length) || fullText.length || 0;
  const origin = ["PostgreSQL 判決文件", detail.source_archive]
    .filter(Boolean)
    .join(" · ");
  const metaItems = [
    lawMetaItem("案號", escapeHtml(detail.jid || "—")),
    lawMetaItem("年度", escapeHtml(detail.jyear || "—")),
    lawMetaItem("字別", escapeHtml(detail.jcase || "—")),
    lawMetaItem("號碼", escapeHtml(detail.jno || "—")),
    lawMetaItem("法院", escapeHtml(detail.court || "—")),
    lawMetaItem("案由", escapeHtml(detail.title || "—")),
    lawMetaItem("裁判日期", lawDate(detail.jdate)),
    lawMetaItem("來源壓縮檔", escapeHtml(detail.source_archive || "—")),
    lawMetaItem("全文長度", `${formatNumber(fullTextLength)} 字`),
    lawMetaItem("引用數", formatNumber(detail.citation_count)),
  ];
  if (detail.import_run_id !== null && detail.import_run_id !== undefined) {
    metaItems.push(
      lawMetaItem("匯入 Run", `#${escapeHtml(detail.import_run_id)}`),
    );
  }

  return `<div class="law-report judgment-report">
    <div class="law-report-topbar">
      ${lawReportBackButton()}
      <span class="law-report-origin" title="${escapeHtml(origin)}">${escapeHtml(origin)}</span>
    </div>
    <div class="report-card law-report-card judgment-report-card" data-database="${escapeHtml(database)}">
      <div class="report-head">
        <div class="report-title-group">
          <div class="report-kicker">JUDGMENT REPORT · ${escapeHtml(
            String(database).toUpperCase(),
          )}</div>
          <div class="report-title">
            ${escapeHtml(title)}
            <span class="chip">判決文件</span>
          </div>
          <div class="report-sub">
            ${escapeHtml(detail.court || "—")} · ${lawDate(detail.jdate)} ·
            ${formatNumber(fullTextLength)} 字
          </div>
        </div>
        <div class="report-actions">
          ${
            detail.pdf_url
              ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(
                  detail.pdf_url,
                )}" target="_blank" rel="noopener noreferrer">${icon(
                  "external",
                  14,
                )}<span>PDF</span></a>`
              : ""
          }
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-item">
          <div class="summary-label">裁判日期</div>
          <div class="summary-value">${lawDate(detail.jdate)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">法院</div>
          <div class="summary-value summary-value-text">${escapeHtml(
            detail.court || "—",
          )}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">命中法規</div>
          <div class="summary-value">${formatNumber(matchedLaws.length)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">引用數</div>
          <div class="summary-value">${formatNumber(detail.citation_count)}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">判決資訊</span>
          <span class="muted" style="font-size:9.5px">${escapeHtml(
            detail.jid || "",
          )}</span>
        </div>
        <div class="law-meta-grid">${metaItems.join("")}</div>
      </div>

      <div class="report-section">
        <div class="report-section-head">
          <span class="report-section-title">命中法規與引用</span>
          <span class="muted">${formatNumber(matchedLaws.length)} 法規 · ${formatNumber(
            detail.citation_count,
          )} 引用</span>
        </div>
        ${renderJudgmentCitations(detail)}
      </div>

      <div class="report-section judgment-text-section">
        <div class="report-section-head">
          <span class="report-section-title">判決原文</span>
          <span class="muted">${formatNumber(fullTextLength)} 字</span>
        </div>
        ${
          fullText
            ? `<div class="judgment-fulltext">${escapeHtml(fullText)}</div>`
            : `<div class="report-empty-inline">這筆判決沒有可顯示的全文。</div>`
        }
      </div>
    </div>
  </div>`;
}

function csvEscape(value) {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCsv(result) {
  const columns = result.columns || [];
  const rows = result.rows || [];
  const lines = [
    ["#", ...columns.map((column) => column.label || column.key)].map(csvEscape).join(","),
  ];
  const start = ((Number(result.page) || 1) - 1) * (Number(result.page_size) || 25);
  rows.forEach((row, index) => {
    lines.push(
      [
        start + index + 1,
        ...columns.map((column) => row[column.key]),
      ]
        .map(csvEscape)
        .join(","),
    );
  });
  return `\uFEFF${lines.join("\r\n")}`;
}

export function exportableResult(result) {
  return {
    ...result,
    rows: (result.rows || []).map((row) => {
      const clean = {};
      for (const [key, value] of Object.entries(row)) {
        if (!key.startsWith("_")) clean[key] = value;
      }
      return clean;
    }),
  };
}

function kindLabel(kind) {
  if (kind === "rag") return "RAG 提問";
  if (kind === "data") return "資料查詢";
  return kind || "其他";
}

async function runLocalQuery(db, state) {
  const started = performance.now();
  const filters = readFilters(db, state);
  const storeName = String(filters.store || "query_history");
  const keyword = String(filters.keyword || "");
  const page = state.page;
  const pageSize = state.pageSize;
  const warnings = [];
  let rows = [];
  let columns = [];
  let distribution = [];

  if (storeName === "settings") {
    const records = await listSettings({ keyword });
    rows = records.map((record) => ({
      key: record.key,
      value: prettyValue(record.value),
      updated_at: record.updated_at,
    }));
    columns = [
      { key: "key", label: "設定鍵", type: "mono" },
      { key: "value", label: "值", type: "longtext" },
      { key: "updated_at", label: "更新時間", type: "datetime" },
    ];
    const counts = new Map();
    rows.forEach((row) => {
      const prefix = String(row.key || "").split(".")[0] || "其他";
      counts.set(prefix, (counts.get(prefix) || 0) + 1);
    });
    distribution = Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  } else {
    const records = await listHistory({ keyword, limit: MAX_LOCAL_ROWS });
    rows = records.map((record) => ({
      kind: kindLabel(record.kind),
      title: record.title,
      detail: record.detail,
      created_at: record.created_at,
    }));
    columns = [
      { key: "kind", label: "類型", type: "text" },
      { key: "title", label: "查詢內容", type: "longtext" },
      { key: "detail", label: "摘要", type: "longtext" },
      { key: "created_at", label: "時間", type: "datetime" },
    ];
    const counts = new Map();
    rows.forEach((row) => counts.set(row.kind, (counts.get(row.kind) || 0) + 1));
    distribution = Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  const total = rows.length;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const duration = Math.round(performance.now() - started);
  const degraded = isDegraded();

  if (degraded) {
    warnings.push("IndexedDB 無法使用，資料暫存在記憶體，重新整理後會消失。");
  }

  return {
    database: "indexeddb",
    label: "IndexedDB",
    status: degraded ? "degraded" : "ok",
    message: degraded
      ? "瀏覽器不允許使用 IndexedDB，本頁改用記憶體暫存。"
      : null,
    table: storeName,
    columns,
    rows: pageRows,
    total,
    page,
    page_size: pageSize,
    duration_ms: duration,
    summary: [
      { label: "符合筆數", value: String(total) },
      { label: "目前頁面", value: `${pageRows.length} 筆` },
      { label: "儲存模式", value: storageMode() === "indexeddb" ? "IndexedDB" : "記憶體" },
      { label: "查詢耗時", value: `${duration} ms` },
    ],
    distribution,
    query_text: `INDEXEDDB OPEN 'judgment-console'
OBJECT STORE '${storeName}'
FILTER ${keyword ? `keyword ≈ '${keyword}'` : "1 = 1"}
ORDER BY created_at DESC
LIMIT ${pageSize} OFFSET ${start}`,
    warnings,
    meta: {
      store: storeName,
      filters,
      client_side: true,
    },
  };
}

export async function render(root, ctx) {
  let disposed = false;
  let catalog = null;
  let categories = [];
  let selectedCategory = "law";
  let selectedId = null;
  let states = {};
  let querySeq = 0;
  let savedPageSize = 25;
  let sidebarView = "query";
  let schemaSelection = null;
  let schemaPreview = null;
  let schemaSeq = 0;
  let schemaSuggestItems = [];
  let schemaSuggestContext = null;
  let schemaSuggestActive = -1;
  let schemaSuggestSeq = 0;
  let fuzzySearchSeq = 0;
  let fuzzySearchTimer = null;
  let lawView = null;
  let judgmentView = null;

  root.innerHTML = `<section class="page data-page">
    <div class="page-header">
      <div class="data-page-heading">
        <div class="eyebrow">DATA EXPLORER</div>
        <div class="data-title-line">
          <h1 class="page-title">資料庫查詢與報表</h1>
          <p class="page-subtitle data-page-subtitle">左側選擇「查詢法規命令」、「查詢判決」或「資料庫 Schema」；查詢支援 fuzzy 多條件（AND），也可展開進階 metadata 篩選。</p>
        </div>
      </div>
      <div class="page-actions">
        <span class="badge badge-neutral badge-mono" id="catalog-meta">CATALOG · 讀取中</span>
        <button class="btn btn-secondary" type="button" id="refresh-catalog">
          ${icon("refresh", 15)}<span>重新整理</span>
        </button>
      </div>
    </div>
    <div class="data-layout">
      <aside class="card query-sidebar" id="query-sidebar" aria-label="資料查詢功能">
        <div id="data-nav"></div>
        <div id="db-options-wrap">
          <div style="padding:16px">
            <div class="skeleton skeleton-line" style="width:86%"></div>
            <div class="skeleton skeleton-line" style="width:62%"></div>
          </div>
        </div>
        <div id="filter-area"></div>
        <div id="schema-area" hidden></div>
      </aside>
      <section class="query-main" id="query-main" aria-label="查詢報表" aria-live="polite">
        <div class="report-card">
          <div class="report-loading">
            <div class="skeleton skeleton-line" style="width:88%"></div>
            <div class="skeleton skeleton-line" style="width:70%"></div>
            <div class="skeleton skeleton-line" style="width:80%"></div>
          </div>
        </div>
      </section>
    </div>
    <div id="schema-suggest-popover" class="schema-suggest-popover" hidden></div>
  </section>`;

  const sidebar = root.querySelector("#query-sidebar");
  const dataNav = root.querySelector("#data-nav");
  const dbOptionsWrap = root.querySelector("#db-options-wrap");
  const filterArea = root.querySelector("#filter-area");
  const schemaArea = root.querySelector("#schema-area");
  const reportBox = root.querySelector("#query-main");
  const schemaSuggestPopover = root.querySelector("#schema-suggest-popover");
  const catalogMeta = root.querySelector("#catalog-meta");
  const refreshButton = root.querySelector("#refresh-catalog");

  const getCategory = (id) => categories.find((category) => category.id === id);
  const getDatabases = () =>
    getCategory(selectedCategory)?.databases || [];
  const getDatabase = (id) => getDatabases().find((db) => db.id === id);
  const stateKey = (categoryId, dbId) => `${categoryId}:${dbId}`;
  const stateFor = (db, categoryId = selectedCategory) =>
    states[stateKey(categoryId, db.id)];

  const persistSetting = (key, value) => {
    setSetting(key, value).catch(() => {});
  };

  const updateCatalogMeta = () => {
    if (!catalog) {
      catalogMeta.textContent = "CATALOG · 離線";
      catalogMeta.className = "badge badge-danger badge-mono";
      return;
    }
    const databases = getDatabases();
    const available = databases.filter((db) => db.available).length;
    const category = getCategory(selectedCategory);
    catalogMeta.textContent = `CATALOG · ${category?.label || selectedCategory} · ${available}/${databases.length} 可用`;
    catalogMeta.className = "badge badge-neutral badge-mono";
  };

  const showEmpty = (db) => {
    reportBox.innerHTML = emptyReport(db);
  };

  const restoreQueryReport = () => {
    const returnScroll = lawView?.returnScroll ?? judgmentView?.returnScroll;
    lawView = null;
    judgmentView = null;
    const db = getDatabase(selectedId);
    const state = db ? stateFor(db) : null;
    if (sidebarView === "schema" && schemaPreview?.result) {
      reportBox.innerHTML = renderSchemaPreview(
        schemaPreview.result,
        schemaTableLabel(db, schemaPreview.tableId),
        {
          columnFilters: schemaPreview.columnFilters || {},
          searchEnabled: db.id === "postgres" || db.id === "parquet",
        },
      );
    } else if (state?.result) {
      reportBox.innerHTML = renderReport(state.result);
    } else if (db) {
      showEmpty(db);
    }
    if (typeof returnScroll === "number") {
      window.requestAnimationFrame(() =>
        window.scrollTo({ top: returnScroll, behavior: "smooth" }),
      );
    }
  };

  const jumpToLawArticle = (inputId = "law-article-jump") => {
    const input = reportBox.querySelector(`#${inputId}`);
    const key = articleKey(input?.value);
    if (!key) {
      toast("請輸入要跳至的條號，例如 100 或 第100條。", "warn");
      input?.focus();
      return;
    }
    const targets = [...reportBox.querySelectorAll("[data-article-no]")];
    const target = targets.find(
      (element) => element.dataset.articleNo === key,
    );
    if (!target) {
      toast(`找不到第 ${key} 條。`, "warn");
      return;
    }
    target.scrollIntoView({ behavior: "instant", block: "center" });
    target.classList.add("is-jump-target");
    window.setTimeout(() => target.classList.remove("is-jump-target"), 2400);
  };

  const openLawReport = async ({
    lawKey,
    sourceType = "",
    lawName = "",
    versionId = "",
  }) => {
    const db = getDatabase(selectedId);
    const state = db ? stateFor(db) : null;
    const schemaResult =
      sidebarView === "schema" ? schemaPreview?.result : null;
    if (!db || (!state?.result && !schemaResult) || !lawKey) return;
    const seq = ++querySeq;
    lawView = {
      seq,
      lawKey,
      sourceType,
      lawName,
      versionId: versionId ? String(versionId) : "",
      page: 1,
      detail: null,
      database: db.id,
      returnScroll: window.scrollY,
    };
    judgmentView = null;
    reportBox.innerHTML = renderLawLoading(lawName || lawKey);
    reportBox.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const detail = await api.lawDetail(lawKey, sourceType, lawView.versionId);
      if (disposed || !lawView || lawView.seq !== seq) return;
      lawView.detail = detail;
      lawView.page = 1;
      reportBox.innerHTML = renderLawReport(detail, {
        database: lawView.database,
        lawPage: lawView.page,
      });
    } catch (error) {
      if (disposed || !lawView || lawView.seq !== seq) return;
      reportBox.innerHTML = renderLawError(error, lawName || lawKey);
      toast(error.message || "無法取得法規報表。", "danger");
    }
  };

  const openJudgmentReport = async ({ jid }) => {
    const db = getDatabase(selectedId);
    const state = db ? stateFor(db) : null;
    const schemaResult =
      sidebarView === "schema" ? schemaPreview?.result : null;
    if (!db || (!state?.result && !schemaResult) || !jid) return;
    const seq = ++querySeq;
    lawView = null;
    const source = db.id === "parquet" ? "parquet" : "postgres";
    judgmentView = {
      seq,
      jid,
      detail: null,
      database: db.id,
      source,
      returnScroll: window.scrollY,
    };
    reportBox.innerHTML = renderJudgmentLoading(jid);
    reportBox.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      const detail = await api.judgmentDetail(jid, source);
      if (disposed || !judgmentView || judgmentView.seq !== seq) return;
      judgmentView.detail = detail;
      reportBox.innerHTML = renderJudgmentReport(detail, {
        database: judgmentView.database,
      });
    } catch (error) {
      if (disposed || !judgmentView || judgmentView.seq !== seq) return;
      reportBox.innerHTML = renderJudgmentError(error, jid);
      toast(error.message || "無法取得判決原文。", "danger");
    }
  };

  const schemaPreviewKey = (db, tableId) =>
    `${selectedCategory}:${db.id}:${tableId}`;

  const schemaTableLabel = (db, tableId) =>
    (db.tables || []).find((table) => table.id === tableId)?.label || tableId;

  const schemaQueryFilters = (
    db,
    tableId,
    { sort = null, columnFilters = {} } = {},
  ) => {
    const filters = { column_filters: columnFilters };
    if (db.id === "postgres") {
      filters.table = tableId;
      filters.schema_preview = true;
    } else if (db.id === "parquet" && selectedCategory === "judgment") {
      filters.table = "judgment_documents";
      filters.columns = JUDGMENT_PARQUET_PREVIEW_COLUMNS;
    } else if (db.id === "parquet") {
      filters.dataset = "all";
      filters.columns = LAW_PARQUET_PREVIEW_COLUMNS;
    }
    if (sort?.key) filters.sort = `${sort.key}:${sort.direction}`;
    return filters;
  };

  const loadSchemaPreview = async (
    db,
    tableId,
    { sort = null, columnFilters = {} } = {},
  ) => {
    if (!tableId) return;
    blurSchemaSearch();
    const key = schemaPreviewKey(db, tableId);
    const seq = ++schemaSeq;
    schemaSelection = { tableId };
    schemaPreview = {
      key,
      tableId,
      loading: true,
      result: null,
      error: null,
      sort,
      columnFilters,
    };
    schemaArea.innerHTML = renderSchemaPanel(
      db,
      getCategory(selectedCategory)?.label || selectedCategory,
      tableId,
    );
    reportBox.innerHTML = renderSchemaPreviewLoading(
      schemaTableLabel(db, tableId),
    );
    try {
      let result;
      if (db.id === "indexeddb") {
        const state = createState(db, 10);
        state.values.store = tableId;
        state.page = 1;
        result = await runLocalQuery(db, state);
      } else if (db.id === "qdrant") {
        result = {
          database: "qdrant",
          label: "Qdrant",
          status: "not_configured",
          message:
            "Qdrant collection 需要語意查詢；Schema 僅提供 collection 名稱，不列出前 10 筆資料。",
          table: tableId,
          columns: [],
          rows: [],
          total: 0,
          page: 1,
          page_size: 10,
          duration_ms: 0,
          summary: [],
          distribution: [],
          query_text: "",
          warnings: [],
          meta: {},
        };
      } else {
        result = await api.query({
          database: db.id,
          filters: schemaQueryFilters(db, tableId, { sort, columnFilters }),
          page: 1,
          pageSize: 10,
        });
        if (sort?.key) {
          result.meta = { ...(result.meta || {}), sort };
        }
      }
      if (disposed || seq !== schemaSeq) return;
      schemaPreview = {
        key,
        tableId,
        loading: false,
        result,
        error: null,
        sort,
        columnFilters,
      };
      if (sidebarView === "schema" && schemaSelection?.tableId === tableId) {
        schemaArea.innerHTML = renderSchemaPanel(
          db,
          getCategory(selectedCategory)?.label || selectedCategory,
          tableId,
        );
        reportBox.innerHTML = renderSchemaPreview(
          result,
          schemaTableLabel(db, tableId),
          {
            columnFilters,
            searchEnabled: db.id === "postgres" || db.id === "parquet",
          },
        );
      }
    } catch (error) {
      if (disposed || seq !== schemaSeq) return;
      schemaPreview = {
        key,
        tableId,
        loading: false,
        result: null,
        error,
        sort,
        columnFilters,
      };
      if (sidebarView === "schema" && schemaSelection?.tableId === tableId) {
        reportBox.innerHTML = renderSchemaPreviewError(
          error,
          schemaTableLabel(db, tableId),
        );
      }
    }
  };

  const currentTableSearchContext = () => {
    const db = getDatabase(selectedId);
    if (!db) return null;
    if (sidebarView === "schema" && schemaPreview?.result) {
      return {
        db,
        tableId: schemaPreview.tableId,
        columnFilters: schemaPreview.columnFilters || {},
        sort: schemaPreview.sort || null,
        mode: "schema",
      };
    }
    const state = db ? stateFor(db) : null;
    const result = state?.result;
    if (
      result &&
      (db.id === "postgres" || db.id === "parquet")
    ) {
      return {
        db,
        tableId: result.table,
        columnFilters: state.columnFilters || {},
        sort: state.sort || null,
        mode: "query",
      };
    }
    return null;
  };

  const applyTableColumnFilter = (context, column, value) => {
    if (!context) return;
    const timerKey = `${context.db.id}:${context.tableId}:${column}`;
    const pending = schemaSuggestTimers.get(timerKey);
    if (pending) {
      window.clearTimeout(pending);
      schemaSuggestTimers.delete(timerKey);
    }
    blurSchemaSearch();
    const next = { ...(context.columnFilters || {}) };
    const text = String(value || "").trim();
    if (text) next[column] = text;
    else delete next[column];
    if (context.mode === "schema") {
      loadSchemaPreview(context.db, context.tableId, {
        sort: context.sort,
        columnFilters: next,
      });
      return;
    }
    const state = stateFor(context.db);
    state.columnFilters = next;
    state.page = 1;
    runQuery(1);
  };

  const schemaSuggestTimers = new Map();

  const hideSchemaSuggestions = () => {
    schemaSuggestSeq += 1;
    schemaSuggestItems = [];
    schemaSuggestContext = null;
    schemaSuggestActive = -1;
    if (schemaSuggestPopover) {
      schemaSuggestPopover.hidden = true;
      schemaSuggestPopover.innerHTML = "";
    }
  };

  const highlightSchemaSuggestion = (value, query) => {
    const text = String(value || "");
    const lowerText = text.toLocaleLowerCase();
    const lowerQuery = String(query || "").toLocaleLowerCase();
    const flags = new Array(text.length).fill(false);
    const markRange = (start, length) => {
      for (let index = start; index < start + length; index += 1) {
        if (index >= 0 && index < flags.length) flags[index] = true;
      }
    };
    let position = lowerText.indexOf(lowerQuery);
    if (position >= 0) {
      while (position >= 0) {
        markRange(position, lowerQuery.length);
        position = lowerText.indexOf(lowerQuery, position + lowerQuery.length);
      }
    } else {
      const tokens = [];
      for (const chunk of lowerQuery.match(/[一-鿿]{2,}/g) || []) {
        for (let index = 0; index < chunk.length - 1; index += 1) {
          tokens.push(chunk.slice(index, index + 2));
        }
      }
      tokens.push(...(lowerQuery.match(/[a-z0-9]+/g) || []));
      for (const token of tokens) {
        let tokenIndex = lowerText.indexOf(token);
        while (tokenIndex >= 0) {
          markRange(tokenIndex, token.length);
          tokenIndex = lowerText.indexOf(token, tokenIndex + token.length);
        }
      }
    }
    let html = "";
    let index = 0;
    while (index < text.length) {
      if (flags[index]) {
        let end = index;
        while (end < text.length && flags[end]) end += 1;
        html += `<mark>${escapeHtml(text.slice(index, end))}</mark>`;
        index = end;
      } else {
        let end = index;
        while (end < text.length && !flags[end]) end += 1;
        html += escapeHtml(text.slice(index, end));
        index = end;
      }
    }
    return html || escapeHtml(text);
  };

  const positionSchemaSuggestions = (input, count) => {
    if (!schemaSuggestPopover) return;
    const rect = input.getBoundingClientRect();
    const width = Math.min(420, Math.max(220, rect.width));
    const estimated = Math.min(360, 34 + count * 30);
    let top = rect.bottom + 4;
    if (top + estimated > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimated - 4);
    }
    const left = Math.min(
      window.innerWidth - width - 8,
      Math.max(8, rect.left),
    );
    schemaSuggestPopover.style.width = `${width}px`;
    schemaSuggestPopover.style.left = `${left}px`;
    schemaSuggestPopover.style.top = `${top}px`;
  };

  const setSchemaSuggestActive = (index) => {
    if (!schemaSuggestPopover) return;
    const buttons = [
      ...schemaSuggestPopover.querySelectorAll(".schema-suggest-item"),
    ];
    if (!buttons.length) return;
    schemaSuggestActive = Math.max(0, Math.min(buttons.length - 1, index));
    buttons.forEach((button, buttonIndex) => {
      button.classList.toggle("is-active", buttonIndex === schemaSuggestActive);
    });
    buttons[schemaSuggestActive].scrollIntoView({ block: "nearest" });
  };

  const selectSchemaSuggestion = (index) => {
    const value = schemaSuggestItems[index];
    const context = schemaSuggestContext;
    if (!value || !context) return;
    hideSchemaSuggestions();
    applyTableColumnFilter(context, context.column, value);
  };

  const fetchSchemaSuggestions = async (context, column, text, input) => {
    if (!context || !text.trim()) {
      hideSchemaSuggestions();
      return;
    }
    const seq = ++schemaSuggestSeq;
    schemaSuggestContext = { ...context, column, input };
    schemaSuggestActive = -1;
    try {
      const data = await api.schemaSuggest({
        database: context.db.id,
        table: context.tableId,
        column,
        query: text,
        limit: 1000,
      });
      if (
        seq !== schemaSuggestSeq ||
        document.activeElement !== input ||
        !schemaSuggestPopover
      ) {
        return;
      }
      const values = Array.isArray(data.values) ? data.values : [];
      schemaSuggestItems = values;
      if (!values.length) {
        hideSchemaSuggestions();
        return;
      }
      const head =
        Number(data.total) > values.length
          ? `共 ${formatNumber(data.total)} 個符合，顯示前 ${formatNumber(
              values.length,
            )} 個`
          : `共 ${formatNumber(data.total)} 個符合`;
      schemaSuggestPopover.innerHTML = `<div class="schema-suggest-head">${escapeHtml(
        head,
      )}</div>${values
        .map(
          (value, index) => `<button class="schema-suggest-item" type="button"
            data-schema-suggest-index="${index}"
            title="${escapeHtml(value)}">${highlightSchemaSuggestion(
              value,
              text,
            )}</button>`,
        )
        .join("")}`;
      positionSchemaSuggestions(input, values.length);
      schemaSuggestPopover.hidden = false;
    } catch (error) {
      hideSchemaSuggestions();
    }
  };

  const blurSchemaSearch = () => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active.matches("[data-schema-search]")
    ) {
      active.blur();
    }
    hideSchemaSuggestions();
  };

  const renderSelectedDatabase = (db, { resetReport = false } = {}) => {
    blurSchemaSearch();
    const state = stateFor(db);
    dataNav.innerHTML = renderDataNav(selectedCategory, sidebarView);
    dbOptionsWrap.innerHTML = renderDatabaseSelect(getDatabases(), db.id);
    if (sidebarView === "schema") {
      filterArea.hidden = true;
      filterArea.innerHTML = "";
      schemaArea.hidden = false;
      schemaArea.innerHTML = `<div class="schema-category-switch" role="tablist" aria-label="Schema 類別">
        ${["law", "judgment"]
          .map((id) => {
            const category = categories.find((item) => item.id === id);
            if (!category) return "";
            return `<button class="chip${selectedCategory === id ? " is-active" : ""}" type="button" role="tab" aria-selected="${selectedCategory === id}" data-action="schema-category" data-category="${id}">${escapeHtml(category.label)}</button>`;
          })
          .join("")}
      </div>${renderSchemaPanel(
        db,
        getCategory(selectedCategory)?.label || selectedCategory,
        schemaSelection?.tableId || "",
      )}`;
    } else {
      schemaArea.hidden = true;
      schemaArea.innerHTML = "";
      filterArea.hidden = false;
      const fuzzy = renderFuzzySearch(selectedCategory, db, state);
      const filters = renderFilters(db, state);
      filterArea.innerHTML = `${dbNotice(db)}${
        fuzzy
          ? `${fuzzy}<details class="data-advanced"><summary>進階 metadata 條件</summary>${filters}</details>`
          : filters
      }<div class="sidebar-note">${sidebarNote(db)}</div>`;
    }
    updateCatalogMeta();
    if (sidebarView === "schema") {
      const key = schemaSelection
        ? schemaPreviewKey(db, schemaSelection.tableId)
        : "";
      if (schemaPreview && schemaPreview.key === key) {
        const label = schemaTableLabel(db, schemaPreview.tableId);
        if (schemaPreview.loading) {
          reportBox.innerHTML = renderSchemaPreviewLoading(label);
        } else if (schemaPreview.error) {
          reportBox.innerHTML = renderSchemaPreviewError(
            schemaPreview.error,
            label,
          );
        } else {
          reportBox.innerHTML = renderSchemaPreview(
            schemaPreview.result,
            label,
            {
              columnFilters: schemaPreview.columnFilters || {},
              searchEnabled: db.id === "postgres" || db.id === "parquet",
            },
          );
        }
      } else {
        reportBox.innerHTML = schemaEmptyState(db);
      }
      return;
    }
    if (resetReport) showEmpty(db);
    else if (state.result) reportBox.innerHTML = renderReport(state.result);
    else showEmpty(db);
  };

  const selectDatabase = (id, { persist = true, resetReport = false } = {}) => {
    const databases = getDatabases();
    const db = databases.find((item) => item.id === id) || databases[0];
    if (!db) return;
    lawView = null;
    judgmentView = null;
    schemaSelection = null;
    schemaPreview = null;
    schemaSeq += 1;
    selectedId = db.id;
    const key = stateKey(selectedCategory, db.id);
    if (!states[key]) states[key] = createState(db, savedPageSize);
    renderSelectedDatabase(db, { resetReport });
    if (persist) {
      persistSetting(`data.last_database.${selectedCategory}`, db.id);
      persistSetting("data.last_category", selectedCategory);
    }
  };

  const selectCategory = (
    id,
    { persist = true, resetReport = true, databaseId = null } = {},
  ) => {
    const category = getCategory(id) || categories[0];
    if (!category) return;
    selectedCategory = category.id;
    lawView = null;
    judgmentView = null;
    const databases = category.databases || [];
    const preferred =
      (databaseId && databases.find((db) => db.id === databaseId)) ||
      databases.find((db) => db.id === selectedId) ||
      databases[0];
    selectedId = preferred?.id || null;
    if (!preferred) {
      dataNav.innerHTML = renderDataNav(selectedCategory, sidebarView);
      dbOptionsWrap.innerHTML = `<div class="sidebar-notice">${notice({
        tone: "warn",
        title: "沒有可用的資料來源",
        text: "這個類別目前沒有資料庫選項。",
      })}</div>`;
      filterArea.innerHTML = "";
      updateCatalogMeta();
      return;
    }
    selectDatabase(preferred.id, { persist: false, resetReport });
    if (persist) {
      persistSetting("data.last_category", category.id);
      persistSetting(`data.last_database.${category.id}`, preferred.id);
    }
  };

  const syncStateFromForm = (db) => {
    const state = stateFor(db);
    const form = filterArea.querySelector("#data-filter-form");
    if (!form) return;
    state.values = readFieldValues(form, db, state);
  };

  const runQuery = async (page = null) => {
    const db = getDatabase(selectedId);
    if (!db) return;
    blurSchemaSearch();
    const state = stateFor(db);
    syncStateFromForm(db);
    if (page !== null) state.page = page;
    if (!Number.isFinite(state.page) || state.page < 1) state.page = 1;

    const seq = ++querySeq;
    lawView = null;
    judgmentView = null;
    reportBox.innerHTML = reportLoading(db);
    const submit = filterArea.querySelector("#run-query");
    setBusy(submit, true, "查詢中…");

    try {
      let result;
      if (db.id === "indexeddb") {
        result = await runLocalQuery(db, state);
      } else {
        result = await api.query({
          database: db.id,
          filters: queryFilters(db, state),
          page: state.page,
          pageSize: state.pageSize,
        });
      }
      if (disposed || seq !== querySeq) return;

      result.meta = {
        ...(result.meta || {}),
        column_filters: state.columnFilters || {},
        searchable: db.id === "postgres" || db.id === "parquet",
        sort: state.sort || result.meta?.sort || null,
      };
      state.result = result;
      state.page = Number(result.page) || state.page;
      state.pageSize = Number(result.page_size) || state.pageSize;
      reportBox.innerHTML = renderReport(result);

      const categoryLabel = getCategory(selectedCategory)?.label || selectedCategory;
      await addHistory({
        kind: "data",
        title: `${categoryLabel} · ${db.label} · ${result.table || result.label || "query"}`,
        detail: `${formatNumber(result.total)} 筆 · ${formatDuration(result.duration_ms)}`,
        payload: {
          category: selectedCategory,
          database: db.id,
          filters: queryFilters(db, state),
          page: state.page,
          page_size: state.pageSize,
        },
      });
      persistSetting("data.last_query", {
        category: selectedCategory,
        database: db.id,
        filters: queryFilters(db, state),
        page: state.page,
        page_size: state.pageSize,
        at: new Date().toISOString(),
      });
    } catch (error) {
      if (disposed || seq !== querySeq) return;
      reportBox.innerHTML = reportError(error, db);
      toast(error.message || "查詢失敗。", "danger");
    } finally {
      if (!disposed && seq === querySeq) setBusy(submit, false);
    }
  };

  const renderFuzzyResults = (container, suggestions) => {
    const results = container?.querySelector("[data-data-fuzzy-results]");
    if (!results) return;
    results.innerHTML = suggestions.length
      ? suggestions
          .map(
            (item) =>
              `<button class="data-fuzzy-option" type="button" role="option" data-action="select-fuzzy-term" data-term="${escapeHtml(item.value)}"><span>${escapeHtml(item.label || item.value)}</span><small>${escapeHtml(item.meta || "")}</small></button>`,
          )
          .join("")
      : `<div class="data-fuzzy-empty">沒有相近結果；按 Enter 可直接加入目前輸入的關鍵字。</div>`;
  };

  const loadFuzzySuggestions = async (container, query = "") => {
    if (!container) return;
    const db = getDatabase(selectedId);
    const state = db ? stateFor(db) : null;
    if (!state) return;
    const kind = container.dataset.fuzzyKind || selectedCategory;
    const results = container.querySelector("[data-data-fuzzy-results]");
    const token = ++fuzzySearchSeq;
    if (results) {
      results.innerHTML = `<div class="data-fuzzy-loading"><span class="spinner"></span><span>搜尋相近結果…</span></div>`;
    }
    try {
      const data = await api.dataSuggest({ kind, query, limit: 12 });
      if (token !== fuzzySearchSeq) return;
      const suggestions = (data.suggestions || []).filter(
        (item) => !state.fuzzyTerms.includes(item.value),
      );
      renderFuzzyResults(container, suggestions);
    } catch (error) {
      if (token !== fuzzySearchSeq) return;
      if (results) {
        results.innerHTML = `<div class="data-fuzzy-empty">${escapeHtml(
          error.message || "搜尋失敗。",
        )}</div>`;
      }
    }
  };

  const openFuzzySearch = (container, { focus = false } = {}) => {
    if (!container) return;
    const popover = container.querySelector("[data-data-fuzzy-popover]");
    const input = container.querySelector("[data-data-fuzzy-search]");
    if (!popover || !input) return;
    if (popover.hidden) {
      popover.hidden = false;
      input.value = "";
      loadFuzzySuggestions(container, "");
    }
    if (focus) {
      input.focus();
      input.select();
    }
  };

  const closeFuzzySearch = (container) => {
    if (fuzzySearchTimer) {
      window.clearTimeout(fuzzySearchTimer);
      fuzzySearchTimer = null;
    }
    const popover = container?.querySelector("[data-data-fuzzy-popover]");
    if (popover) popover.hidden = true;
  };

  const addFuzzyTerm = async (term) => {
    const db = getDatabase(selectedId);
    if (!db) return;
    const state = stateFor(db);
    const value = String(term || "").trim();
    if (!value || state.fuzzyTerms.includes(value)) return;
    state.fuzzyTerms = [...state.fuzzyTerms, value];
    closeFuzzySearch(filterArea.querySelector("[data-data-fuzzy]"));
    renderSelectedDatabase(db);
    await runQuery(1);
  };

  const removeFuzzyTerm = async (term) => {
    const db = getDatabase(selectedId);
    if (!db) return;
    const state = stateFor(db);
    const value = String(term || "").trim();
    state.fuzzyTerms = state.fuzzyTerms.filter((entry) => entry !== value);
    renderSelectedDatabase(db);
    await runQuery(1);
  };

  const loadCatalog = async () => {
    refreshButton.disabled = true;
    setBusy(refreshButton, true, "整理中…");
    try {
      const [
        catalogResponse,
        lastCategory,
        lastLawDatabase,
        lastJudgmentDatabase,
        storedPageSize,
      ] = await Promise.all([
        api.catalog(),
        getSetting("data.last_category", "law"),
        getSetting("data.last_database.law", "postgres"),
        getSetting("data.last_database.judgment", "postgres"),
        getSetting("data.page_size", 25),
      ]);
      if (disposed) return;
      catalog = catalogResponse;
      categories = Array.isArray(catalog.categories) ? catalog.categories : [];
      savedPageSize = PAGE_SIZES.includes(Number(storedPageSize))
        ? Number(storedPageSize)
        : 25;
      for (const category of categories) {
        for (const db of category.databases || []) {
          const key = stateKey(category.id, db.id);
          if (!states[key]) states[key] = createState(db, savedPageSize);
        }
      }
      const category =
        categories.find((item) => item.id === lastCategory) || categories[0];
      if (!category) {
        dataNav.innerHTML = "";
        dbOptionsWrap.innerHTML = `<div class="sidebar-notice">${notice({
          tone: "danger",
          title: "沒有可用的分類",
          text: "Catalog 沒有回傳法規命令或判決分類。",
        })}</div>`;
        return;
      }
      const preferredDatabase =
        category.id === "judgment" ? lastJudgmentDatabase : lastLawDatabase;
      selectedCategory = category.id;
      selectedId = null;
      selectCategory(category.id, {
        persist: false,
        resetReport: true,
        databaseId: preferredDatabase,
      });
      if (disposed) return;
      const initialDb = getDatabase(selectedId);
      const initialState = initialDb ? stateFor(initialDb) : null;
      if (
        initialDb &&
        initialState &&
        sidebarView === "query" &&
        !initialState.result &&
        (initialDb.id === "postgres" || initialDb.id === "parquet")
      ) {
        runQuery(1);
      }
      toast("資料庫 catalog 已更新。", "ok", 2200);
    } catch (error) {
      if (disposed) return;
      catalog = null;
      categories = [];
      dataNav.innerHTML = "";
      updateCatalogMeta();
      dbOptionsWrap.innerHTML = `<div class="sidebar-notice">${notice({
        tone: "danger",
        title: "無法讀取 catalog",
        text: escapeHtml(error.message || "請確認 API 是否啟動。"),
      })}
      <button class="btn btn-secondary btn-sm" type="button" id="catalog-retry" style="margin-top:10px">
        ${icon("refresh", 14)}<span>重試</span>
      </button></div>`;
      reportBox.innerHTML = `<div class="report-empty">${emptyState({
        iconName: "server",
        title: "API 目前無法連線",
        text: "查詢報表需要 FastAPI 提供 catalog 與資料查詢 API。請確認 judgment-web 已啟動。",
      })}</div>`;
    } finally {
      if (!disposed) {
        refreshButton.disabled = false;
        setBusy(refreshButton, false);
      }
    }
  };

  sidebar.addEventListener("change", (event) => {
    const target = event.target;
    if (target.name === "category") {
      selectCategory(target.value);
      return;
    }
    if (target.name === "database") {
      selectDatabase(target.value);
      const nextDb = getDatabase(selectedId);
      const nextState = nextDb ? stateFor(nextDb) : null;
      if (
        nextDb &&
        nextState &&
        !nextState.result &&
        sidebarView === "query" &&
        (nextDb.id === "postgres" || nextDb.id === "parquet")
      ) {
        runQuery(1);
      }
      return;
    }
    const db = getDatabase(selectedId);
    if (!db) return;
    const state = stateFor(db);
    const form = filterArea.querySelector("#data-filter-form");
    if (!form || !target.name) return;
    state.values = readFieldValues(form, db, state);
    state.page = 1;
    if (target.name === "table") {
      lawView = null;
      judgmentView = null;
      state.sort = null;
      state.columnFilters = {};
      state.result = null;
      filterArea.innerHTML = renderFilters(db, state);
      showEmpty(db);
    }
  });

  sidebar.addEventListener("input", (event) => {
    const fuzzyInput = event.target.closest("[data-data-fuzzy-search]");
    if (fuzzyInput) {
      const container = fuzzyInput.closest("[data-data-fuzzy]");
      if (fuzzySearchTimer) window.clearTimeout(fuzzySearchTimer);
      fuzzySearchTimer = window.setTimeout(() => {
        loadFuzzySuggestions(container, fuzzyInput.value);
      }, 160);
      return;
    }
    const db = getDatabase(selectedId);
    if (!db) return;
    const form = filterArea.querySelector("#data-filter-form");
    if (!form || !event.target.name || event.target.name === "table") return;
    const state = stateFor(db);
    state.values = readFieldValues(form, db, state);
  });

  sidebar.addEventListener("keydown", (event) => {
    const input = event.target.closest("[data-data-fuzzy-search]");
    if (!input) return;
    const container = input.closest("[data-data-fuzzy]");
    if (event.key === "Escape") {
      event.preventDefault();
      closeFuzzySearch(container);
      input.blur();
    } else if (event.key === "Enter") {
      event.preventDefault();
      const first = container?.querySelector(
        "[data-action='select-fuzzy-term']",
      );
      if (first) first.click();
      else addFuzzyTerm(input.value);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      container
        ?.querySelector("[data-action='select-fuzzy-term']")
        ?.focus();
    }
  });

  sidebar.addEventListener("mouseover", (event) => {
    const add = event.target.closest("[data-action='open-fuzzy']");
    if (!add) return;
    openFuzzySearch(add.closest("[data-data-fuzzy]"));
  });

  sidebar.addEventListener("mouseout", (event) => {
    const container = event.target.closest("[data-data-fuzzy]");
    if (!container) return;
    if (event.relatedTarget && container.contains(event.relatedTarget)) return;
    closeFuzzySearch(container);
  });

  sidebar.addEventListener("submit", (event) => {
    if (event.target.id !== "data-filter-form") return;
    event.preventDefault();
    runQuery(1);
  });

  sidebar.addEventListener("click", async (event) => {
    const openFuzzyContainer = filterArea
      .querySelector("[data-data-fuzzy] [data-data-fuzzy-popover]:not([hidden])")
      ?.closest("[data-data-fuzzy]");
    if (openFuzzyContainer && !event.target.closest("[data-data-fuzzy]")) {
      closeFuzzySearch(openFuzzyContainer);
    }
    const target = event.target.closest("[data-action]");
    const action = target?.dataset.action;
    if (action === "data-nav") {
      const tab = target.dataset.tab;
      const db = getDatabase(selectedId);
      if (tab === "schema") {
        if (sidebarView !== "schema") {
          if (db) {
            const state = stateFor(db);
            const form = filterArea.querySelector("#data-filter-form");
            if (form) state.values = readFieldValues(form, db, state);
          }
          sidebarView = "schema";
          if (db) renderSelectedDatabase(db);
        }
        return;
      }
      const categoryId = tab === "judgment" ? "judgment" : "law";
      if (sidebarView === "schema") sidebarView = "query";
      if (selectedCategory !== categoryId) {
        selectCategory(categoryId, {
          databaseId: selectedId,
          resetReport: false,
        });
      } else if (db) {
        renderSelectedDatabase(db);
      }
      const nextDb = getDatabase(selectedId);
      const nextState = nextDb ? stateFor(nextDb) : null;
      if (
        nextDb &&
        nextState &&
        !nextState.result &&
        (nextDb.id === "postgres" || nextDb.id === "parquet")
      ) {
        runQuery(1);
      }
      return;
    }
    if (action === "open-fuzzy") {
      openFuzzySearch(target.closest("[data-data-fuzzy]"), { focus: true });
      return;
    }
    if (action === "select-fuzzy-term") {
      await addFuzzyTerm(target.dataset.term);
      return;
    }
    if (action === "remove-fuzzy-term") {
      await removeFuzzyTerm(target.dataset.term);
      return;
    }
    if (action === "schema-category") {
      sidebarView = "schema";
      selectCategory(target.dataset.category || "law", { resetReport: true });
      return;
    }
    if (action === "select-schema-table") {
      const db = getDatabase(selectedId);
      if (!db) return;
      loadSchemaPreview(db, target.dataset.tableId || "");
      return;
    }
    if (action === "reset") {
      const db = getDatabase(selectedId);
      if (!db) return;
      lawView = null;
      judgmentView = null;
      const state = stateFor(db);
      states[stateKey(selectedCategory, db.id)] = createState(db, state.pageSize);
      renderSelectedDatabase(db);
      showEmpty(db);
      toast("已重設這個資料庫的查詢條件。", "info", 2400);
      return;
    }
    if (event.target.closest("#catalog-retry")) {
      loadCatalog();
    }
  });

  reportBox.addEventListener("input", (event) => {
    const input = event.target.closest("[data-schema-search]");
    if (!input) return;
    const context = currentTableSearchContext();
    if (!context) return;
    const column = input.dataset.schemaSearch || "";
    const text = input.value;
    const timerKey = `${context.mode}:${context.db.id}:${context.tableId}:${column}`;
    const existing = schemaSuggestTimers.get(timerKey);
    if (existing) window.clearTimeout(existing);
    if (!text.trim()) {
      schemaSuggestTimers.delete(timerKey);
      hideSchemaSuggestions();
      applyTableColumnFilter(context, column, "");
      return;
    }
    const timer = window.setTimeout(() => {
      schemaSuggestTimers.delete(timerKey);
      fetchSchemaSuggestions(context, column, text, input);
    }, 250);
    schemaSuggestTimers.set(timerKey, timer);
  });

  reportBox.addEventListener("keydown", (event) => {
    const input = event.target.closest("[data-schema-search]");
    if (!input) return;
    const context = currentTableSearchContext();
    if (!context) return;
    if (event.key === "Escape") {
      hideSchemaSuggestions();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!schemaSuggestPopover || schemaSuggestPopover.hidden) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setSchemaSuggestActive(
        schemaSuggestActive < 0
          ? step > 0
            ? 0
            : schemaSuggestItems.length - 1
          : schemaSuggestActive + step,
      );
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (
      schemaSuggestPopover &&
      !schemaSuggestPopover.hidden &&
      schemaSuggestActive >= 0
    ) {
      selectSchemaSuggestion(schemaSuggestActive);
      return;
    }
    applyTableColumnFilter(
      context,
      input.dataset.schemaSearch || "",
      input.value,
    );
  });

  schemaSuggestPopover?.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });

  schemaSuggestPopover?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-schema-suggest-index]");
    if (!button) return;
    selectSchemaSuggestion(Number(button.dataset.schemaSuggestIndex));
  });

  const closeSchemaSuggestionsOnOutside = (event) => {
    if (event.target.closest("[data-schema-search]")) return;
    if (schemaSuggestPopover?.contains(event.target)) return;
    hideSchemaSuggestions();
  };
  document.addEventListener("click", closeSchemaSuggestionsOnOutside);
  window.addEventListener("scroll", hideSchemaSuggestions, true);
  window.addEventListener("resize", hideSchemaSuggestions);

  reportBox.addEventListener("keydown", (event) => {
    if (!event.target.matches(".law-jump-input")) return;
    if (event.key !== "Enter") return;
    event.preventDefault();
    jumpToLawArticle(event.target.id);
  });

  reportBox.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const db = getDatabase(selectedId);
    const state = db ? stateFor(db) : null;
    const result = state?.result;

    if (action === "back-to-results") {
      restoreQueryReport();
      return;
    }
    if (action === "open-law") {
      openLawReport({
        lawKey: button.dataset.lawKey || "",
        sourceType: button.dataset.lawSource || "",
        lawName: button.dataset.lawName || "",
      });
      return;
    }
    if (action === "open-judgment") {
      openJudgmentReport({ jid: button.dataset.jid || "" });
      return;
    }
    if (action === "jump-article") {
      jumpToLawArticle(button.dataset.jumpInput || "law-article-jump");
      return;
    }
    if (action === "sort-column") {
      const key = button.dataset.sortKey || "";
      if (!key || !db) return;
      if (sidebarView === "schema" && schemaPreview?.result) {
        const current = schemaPreview.sort;
        const defaultDesc =
          key === "jdate" ||
          key === "law_modified_date" ||
          key === "article_count" ||
          key === "citation_count" ||
          key === "full_text_length" ||
          key === "created_at" ||
          key === "updated_at";
        const direction =
          current?.key === key
            ? current.direction === "asc"
              ? "desc"
              : "asc"
            : defaultDesc
              ? "desc"
              : "asc";
        loadSchemaPreview(db, schemaPreview.tableId, {
          sort: { key, direction },
          columnFilters: schemaPreview.columnFilters || {},
        });
        return;
      }
      if (!state) return;
      const current = state.sort;
      const direction =
        current?.key === key
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : key === "jdate"
            ? "desc"
            : "asc";
      state.sort = { key, direction };
      runQuery(1);
      return;
    }
    if (action === "retry") {
      runQuery(state?.page || 1);
      return;
    }
    if (!result) return;

    if (action === "prev-page") {
      runQuery(Math.max(1, Number(result.page) - 1));
      return;
    }
    if (action === "next-page") {
      const totalPages = Math.max(1, Math.ceil(Number(result.total) / Number(result.page_size)));
      runQuery(Math.min(totalPages, Number(result.page) + 1));
      return;
    }
    if (action === "copy-query") {
      const ok = await copyText(result.query_text || "");
      toast(ok ? "查詢語句已複製。" : "無法複製查詢語句。", ok ? "ok" : "warn");
      return;
    }
    if (action === "export-json") {
      const filename = `${result.database}-${result.table || "query"}-page-${result.page}.json`;
      downloadText(
        filename,
        JSON.stringify(exportableResult(result), null, 2),
        "application/json;charset=utf-8",
      );
      toast(`已匯出 ${filename}`, "ok");
      return;
    }
    if (action === "export-csv") {
      const filename = `${result.database}-${result.table || "query"}-page-${result.page}.csv`;
      downloadText(filename, exportCsv(result), "text/csv;charset=utf-8");
      toast(`已匯出 ${filename}`, "ok");
    }
  });

  reportBox.addEventListener("change", (event) => {
    const versionSelect = event.target.closest("[data-action='select-law-version']");
    if (versionSelect && lawView) {
      openLawReport({
        lawKey: lawView.lawKey,
        sourceType: lawView.sourceType,
        lawName: lawView.lawName,
        versionId: versionSelect.value,
      });
      return;
    }
    if (!event.target.matches("[data-page-size]")) return;
    const db = getDatabase(selectedId);
    if (!db) return;
    const state = stateFor(db);
    state.pageSize = Number(event.target.value) || 25;
    state.page = 1;
    persistSetting("data.page_size", state.pageSize);
    runQuery(1);
  });

  refreshButton.addEventListener("click", () => {
    loadCatalog();
  });

  await loadCatalog();

  if (ctx && typeof ctx.setTitle === "function") {
    ctx.setTitle("資料庫查詢 · Judgment RAG Console");
  }

  return () => {
    disposed = true;
    if (fuzzySearchTimer) window.clearTimeout(fuzzySearchTimer);
    for (const timer of schemaSuggestTimers.values()) window.clearTimeout(timer);
    schemaSuggestTimers.clear();
    hideSchemaSuggestions();
    document.removeEventListener("click", closeSchemaSuggestionsOnOutside);
    window.removeEventListener("scroll", hideSchemaSuggestions, true);
    window.removeEventListener("resize", hideSchemaSuggestions);
  };
}
