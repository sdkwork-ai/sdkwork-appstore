/**
 * Presentation helpers shared by the publisher analytics page and its detail
 * dialog, so a metric renders identically in the KPI row, the table, and the
 * dialog. Absent wire values render as the console's unknown placeholder rather
 * than as a fabricated zero.
 */
import { APPSTORE_ADMIN_UNKNOWN_TEXT } from '@sdkwork/appstore-pc-admin-core';

/** Render a count with grouping separators for the active locale. */
export function formatPublisherCount(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString() : APPSTORE_ADMIN_UNKNOWN_TEXT;
}

/** Render a revenue amount with its reporting currency when the wire carries one. */
export function formatPublisherRevenue(
  amount: number | undefined,
  currency: string | undefined,
): string {
  if (amount === undefined || !Number.isFinite(amount)) {
    return APPSTORE_ADMIN_UNKNOWN_TEXT;
  }
  const formatted = amount.toFixed(2);
  return currency ? `${formatted} ${currency}` : formatted;
}

/** Render an average rating to one decimal place. */
export function formatPublisherRating(rating: number | undefined): string {
  return rating === undefined || !Number.isFinite(rating)
    ? APPSTORE_ADMIN_UNKNOWN_TEXT
    : rating.toFixed(1);
}
