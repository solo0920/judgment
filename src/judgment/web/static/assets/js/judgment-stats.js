import { formatNumber } from "./utils.js";

export function normalizeJudgmentStats(stats) {
  const source = stats && typeof stats === "object" ? stats : {};
  const totalValue = source.judgment_total;
  const financialValue = source.financial_total;
  const total = Number(totalValue);
  const financial = Number(financialValue);
  const hasTotal =
    totalValue !== null &&
    totalValue !== undefined &&
    Number.isFinite(total) &&
    total >= 0;
  const hasFinancial =
    financialValue !== null &&
    financialValue !== undefined &&
    Number.isFinite(financial) &&
    financial >= 0;
  return {
    total: hasTotal ? total : null,
    financial: hasFinancial ? financial : null,
    ratio:
      hasTotal && hasFinancial && total > 0
        ? (financial / total) * 100
        : null,
  };
}

export function judgmentStatsCardsMarkup(stats, { loading = false } = {}) {
  const normalized = normalizeJudgmentStats(stats);
  const totalText = loading ? "讀取中…" : formatNumber(normalized.total);
  const financialText = loading
    ? "讀取中…"
    : formatNumber(normalized.financial);
  const ratioText = loading
    ? "讀取中…"
    : normalized.ratio === null
      ? "—"
      : `${normalized.ratio.toFixed(1)}%`;
  return `<div class="processing-summary-card">
    <span class="processing-summary-label">判決總件數</span>
    <span class="processing-summary-value mono" data-judgment-stat="total">${totalText}</span>
    <span class="processing-summary-hint">全部已備份判決</span>
  </div>
  <div class="processing-summary-card">
    <span class="processing-summary-label">金融相關總件數</span>
    <span class="processing-summary-value mono" data-judgment-stat="financial">${financialText}</span>
    <span class="processing-summary-hint">PostgreSQL current 判決</span>
  </div>
  <div class="processing-summary-card is-ratio">
    <span class="processing-summary-label">JUDGMENT COVERAGE · 金融案件佔比</span>
    <span class="processing-summary-value mono" data-judgment-stat="ratio">${ratioText}</span>
    <span class="processing-summary-hint">金融相關判決占全部已備份判決的比例。</span>
  </div>`;
}
