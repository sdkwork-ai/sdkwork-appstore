import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Megaphone,
  Timer,
  Wallet,
} from 'lucide-react';
import type {
  DemandClaimItem,
  DemandClaimStatistics,
  DemandClaimStatus,
  DemandClaimStatusGroup,
} from '@sdkwork/appstore-pc-core';
import { DemandClaimsService } from '../services/api';
import { DemandClaimStatusBadge } from '../components/demands/DemandClaimStatusBadge';
import { DEMAND_CLAIM_TABS, formatClaimQuote } from '../components/demands/demandClaimFormat';
import { formatDemandDate } from '../components/demands/demandFormat';

type ClaimTabKey = 'all' | DemandClaimStatusGroup;

const PAGE_SIZE = 10;

/** Stage chips inside 抢单中; each maps to one server-side status filter. */
const IN_PROGRESS_STATUS_FILTERS: readonly DemandClaimStatus[] = [
  'submitted',
  'shortlisted',
  'accepted',
  'in_delivery',
  'delivered',
];

/**
 * 我的抢单 — the provider's claim workbench.
 *
 * The page is the single place a provider checks what they bid on, what is
 * waiting for the publisher, what is in delivery, and what has been accepted.
 * Tabs map onto the server-side status groups so counts and pages stay
 * consistent with the lifecycle rather than being filtered in the browser.
 */
export default function DemandClaimsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ClaimTabKey>('all');
  const [statusFilter, setStatusFilter] = useState<DemandClaimStatus | null>(null);
  const [page, setPage] = useState(1);
  const [claims, setClaims] = useState<DemandClaimItem[]>([]);
  const [statistics, setStatistics] = useState<DemandClaimStatistics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const [pageData, stats] = await Promise.all([
        DemandClaimsService.listClaims({
          ...(statusFilter !== null
            ? { status: statusFilter }
            : tab === 'all'
              ? {}
              : { statusGroup: tab }),
          page,
          pageSize: PAGE_SIZE,
        }),
        DemandClaimsService.getStatistics().catch(() => null),
      ]);
      setClaims(pageData.items);
      setTotal(pageData.totalItems);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load demand claims', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectTab = (next: ClaimTabKey) => {
    setTab(next);
    setStatusFilter(null);
    setPage(1);
  };

  const selectStatus = (next: DemandClaimStatus | null) => {
    if (next === statusFilter) return;
    setStatusFilter(next);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countFor = (key: ClaimTabKey): number | undefined => {
    if (!statistics) return undefined;
    if (key === 'all') return statistics.total;
    if (key === 'in_progress') return statistics.inProgress;
    if (key === 'completed') return statistics.completed;
    return statistics.closed;
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-5 animate-fade-in" data-my-claims>
      <nav className="flex items-center gap-2 text-xs text-store-ink-faint">
        <Link to="/demands" className="flex items-center gap-1 hover:text-store-brand transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('demands.myClaims.backToHall')}
        </Link>
      </nav>

      <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-store-ink flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-store-brand" />
            {t('demands.myClaims.title')}
          </h1>
          <p className="mt-1 text-xs text-store-ink-faint">{t('demands.myClaims.subtitle')}</p>
        </div>
        <Link
          to="/demands"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-store-control border border-store-line px-4 py-2 text-xs font-medium text-store-ink-soft hover:border-store-brand/50 hover:text-store-brand transition-colors"
        >
          <Megaphone className="w-3.5 h-3.5" />
          {t('demands.myClaims.browseDemands')}
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {DEMAND_CLAIM_TABS.map(({ key, labelKey }) => {
          const active = tab === key;
          const count = countFor(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectTab(key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-store-brand text-store-on-brand border-store-brand'
                  : 'bg-store-surface text-store-ink-soft border-store-line hover:border-store-brand/50'
              }`}
            >
              {t(labelKey)}
              {count !== undefined ? (
                <span
                  className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                    active ? 'bg-white/20' : 'bg-store-field text-store-ink-faint'
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === 'in_progress' ? (
        <div className="flex flex-wrap items-center gap-1.5" data-claim-stage-filters>
          <span className="mr-1 text-[11px] text-store-ink-faint">{t('demands.myClaims.stageFilterLabel')}</span>
          <button
            type="button"
            onClick={() => selectStatus(null)}
            aria-pressed={statusFilter === null}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              statusFilter === null
                ? 'bg-store-brand/15 text-store-brand'
                : 'text-store-ink-soft hover:text-store-brand'
            }`}
          >
            {t('demands.myClaims.stageFilters.all')}
          </button>
          {IN_PROGRESS_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => selectStatus(status)}
              aria-pressed={statusFilter === status}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-store-brand/15 text-store-brand'
                  : 'text-store-ink-soft hover:text-store-brand'
              }`}
            >
              {t(`demands.myClaims.stageFilters.${status}`, t(`demands.myClaims.status.${status}`))}
            </button>
          ))}
        </div>
      ) : null}

      {failed ? (
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-store-card border border-red-500/30 bg-red-500/5 px-4 py-3 text-xs text-red-500"
          role="alert"
        >
          <span className="flex-1">{t('demands.myClaims.loadFailed')}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-store-control border border-red-500/30 px-3 py-1.5 font-medium hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            {t('common.actions.retry')}
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="py-20 text-center text-xs text-store-ink-faint">{t('demands.myClaims.loading')}</p>
      ) : claims.length === 0 ? (
        <div className="py-16 text-center" data-my-claims-empty>
          <ClipboardList className="w-12 h-12 mx-auto text-store-ink-faint/40" />
          <p className="mt-3 text-sm font-medium text-store-ink">{t('demands.myClaims.emptyTitle')}</p>
          <p className="mt-1 text-xs text-store-ink-faint">{t('demands.myClaims.emptyHint')}</p>
          <Link
            to="/demands"
            className="mt-4 inline-flex items-center gap-1.5 rounded-store-control bg-store-brand px-4 py-2 text-xs font-bold text-store-on-brand hover:opacity-90 transition-opacity"
          >
            {t('demands.myClaims.browseDemands')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {claims.map((claim) => (
            <Link
              key={claim.id}
              to={`/demands/my-claims/${encodeURIComponent(claim.id)}`}
              className="group flex flex-col gap-3 rounded-store-card border border-store-line/80 bg-store-surface p-4 shadow-sm hover:border-store-brand/50 hover:shadow-md transition-all"
              data-my-claim-card={claim.id}
            >
              <div className="flex items-center justify-between gap-2">
                <DemandClaimStatusBadge status={claim.status} />
                <span className="text-[11px] text-store-ink-faint truncate">{claim.claimNo}</span>
              </div>

              <h2 className="text-sm font-bold text-store-ink leading-snug line-clamp-2 group-hover:text-store-brand transition-colors">
                {claim.demandTitle}
              </h2>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-store-ink-faint">
                <span className="flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="font-semibold text-store-brand">{formatClaimQuote(claim)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  {claim.deliveryDays
                    ? t('demands.myClaims.card.deliveryDays', { days: claim.deliveryDays })
                    : t('demands.myClaims.card.noDeliveryDays')}
                </span>
                <span className="flex items-center gap-1 col-span-2">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {t('demands.myClaims.card.submittedAt', {
                    date: formatDemandDate(claim.submittedAt),
                  })}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-store-line/60 pt-2.5">
                <span className="text-[11px] text-store-ink-faint truncate">
                  {claim.publisherCompanyName || t('demands.myClaims.card.personalPublisher')}
                </span>
                <span className="text-[11px] font-semibold text-store-brand">
                  {t('demands.myClaims.card.openDetail')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && total > PAGE_SIZE ? (
        <div className="flex items-center justify-center gap-3 pt-2 text-xs text-store-ink-faint">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
            aria-label={t('demands.myClaims.pagination.prev')}
            className="w-8 h-8 rounded-full border border-store-line flex items-center justify-center hover:border-store-brand/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="tabular-nums">
            {t('demands.myClaims.pagination.pageInfo', { page, pages: totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            aria-label={t('demands.myClaims.pagination.next')}
            className="w-8 h-8 rounded-full border border-store-line flex items-center justify-center hover:border-store-brand/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
