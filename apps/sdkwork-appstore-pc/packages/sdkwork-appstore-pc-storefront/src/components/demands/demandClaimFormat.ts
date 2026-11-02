import type { DemandClaimItem, DemandClaimStatus, DemandClaimStatusGroup } from '@sdkwork/appstore-pc-core';

/** The four tabs of the My Claims page, in display order. */
export const DEMAND_CLAIM_TABS: readonly { key: 'all' | DemandClaimStatusGroup; labelKey: string }[] = [
  { key: 'all', labelKey: 'demands.myClaims.tabs.all' },
  { key: 'in_progress', labelKey: 'demands.myClaims.tabs.inProgress' },
  { key: 'completed', labelKey: 'demands.myClaims.tabs.completed' },
  { key: 'closed', labelKey: 'demands.myClaims.tabs.closed' },
];

/** Status badge tone; keeps every claim surface consistent. */
export function demandClaimStatusTone(
  status: DemandClaimStatus,
): 'brand' | 'success' | 'warning' | 'muted' | 'danger' {
  switch (status) {
    case 'submitted':
    case 'shortlisted':
      return 'brand';
    case 'accepted':
    case 'in_delivery':
    case 'delivered':
      return 'warning';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'withdrawn':
    case 'cancelled':
      return 'muted';
    default:
      return 'muted';
  }
}

/** Tailwind classes for one badge tone. */
export function demandClaimStatusClass(status: DemandClaimStatus): string {
  switch (demandClaimStatusTone(status)) {
    case 'brand':
      return 'bg-store-brand/10 border-store-brand/25 text-store-brand';
    case 'warning':
      return 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400';
    case 'success':
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400';
    case 'danger':
      return 'bg-red-500/10 border-red-500/30 text-red-500';
    default:
      return 'bg-store-field border-store-line text-store-ink-faint';
  }
}

/** Quote display with grouped major units. */
export function formatClaimQuote(claim: DemandClaimItem): string {
  const amount = Number(claim.quote);
  const amountText = Number.isFinite(amount) ? amount.toLocaleString() : claim.quote;
  return `${claim.quoteCurrency === 'CNY' ? '¥' : `${claim.quoteCurrency} `}${amountText}`;
}

/** Claim actions this provider can take right now. */
export function demandClaimProviderActions(
  status: DemandClaimStatus,
): { withdraw: boolean; start: boolean; deliver: boolean } {
  return {
    withdraw: status === 'submitted' || status === 'shortlisted',
    start: status === 'accepted',
    deliver: status === 'in_delivery',
  };
}
