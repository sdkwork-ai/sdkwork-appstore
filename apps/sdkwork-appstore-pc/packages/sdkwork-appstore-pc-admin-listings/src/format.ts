/**
 * Presentation helpers shared by the listing catalog page and the listing
 * detail page, so a metric renders identically in the KPI row and in the daily
 * series. Absent wire values render as the console's unknown placeholder rather
 * than as a fabricated zero.
 */
import { APPSTORE_ADMIN_UNKNOWN_TEXT } from '@sdkwork/appstore-pc-admin-core';

/** Render a metric count with grouping separators for the active locale. */
export function formatListingCount(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value)
    ? APPSTORE_ADMIN_UNKNOWN_TEXT
    : value.toLocaleString();
}

/** Render an average rating to one decimal place. */
export function formatListingRating(rating: number | undefined): string {
  return rating === undefined || !Number.isFinite(rating)
    ? APPSTORE_ADMIN_UNKNOWN_TEXT
    : rating.toFixed(1);
}
