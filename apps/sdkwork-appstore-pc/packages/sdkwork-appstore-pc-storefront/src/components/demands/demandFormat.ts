import type { DemandHallItem } from '@sdkwork/appstore-pc-core';

/**
 * Shared presentation helpers for a demand card, the detail page, and its
 * discovery rails. They keep the price and date formatting identical wherever
 * one demand is summarized.
 */

/** 预算展示：优先使用结构化区间，其次使用发布时填写的自由文本。 */
export function formatDemandBudget(demand: DemandHallItem): string {
  if (demand.budgetMin || demand.budgetMax) {
    return `¥${formatDemandAmount(demand.budgetMin)} - ${formatDemandAmount(demand.budgetMax)}`;
  }
  return demand.budget;
}

/** 结构化预算按浏览器本地化分组（80000 → 80,000），非数字文本原样保留。 */
function formatDemandAmount(value: string | undefined): string {
  const text = value?.trim() ?? '';
  if (text === '') return '?';
  const numeric = Number(text);
  return Number.isFinite(numeric) ? numeric.toLocaleString() : text;
}

/** 日期展示：非法或缺失的日期回退为空串，避免渲染 Invalid Date。 */
export function formatDemandDate(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}
