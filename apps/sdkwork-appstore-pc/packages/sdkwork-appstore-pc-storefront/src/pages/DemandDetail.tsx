import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Eye,
  FolderPlus,
  Layers,
  Users,
} from 'lucide-react';
import type {
  DemandClaimItem,
  DemandHallBid,
  DemandHallItem,
  DemandSuggestionSections,
} from '@sdkwork/appstore-pc-core';
import { CompanyDemandsService, DemandClaimsService } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DemandClaimDialog } from '../components/demands/DemandClaimDialog';
import { DemandClaimNotice } from '../components/demands/DemandClaimNotice';
import { DemandClaimStatusBadge } from '../components/demands/DemandClaimStatusBadge';
import { DemandSuggestionRail } from '../components/demands/DemandSuggestionRail';
import { formatClaimQuote } from '../components/demands/demandClaimFormat';
import { formatDemandBudget, formatDemandDate } from '../components/demands/demandFormat';

const BID_STATUS_KEYS: Record<string, string> = {
  submitted: 'demands.bidStatus.submitted',
  shortlisted: 'demands.bidStatus.shortlisted',
  accepted: 'demands.bidStatus.accepted',
  rejected: 'demands.bidStatus.rejected',
  withdrawn: 'demands.bidStatus.withdrawn',
};

export interface DemandDetailPageProps {
  /**
   * Host-provided "create project and start" action. Embedding hosts such as
   * the BirdCoder demand hall supply it; the standalone storefront omits it.
   */
  onStartProject?: (demand: DemandHallItem) => void;
}

/**
 * 需求详情页 — the routed detail page for one demand.
 *
 * Opening a demand from the hall navigates here instead of raising a dialog,
 * matching how the rest of the App Store reads a listing: the detail URL is
 * shareable, the browser back button returns to the hall, and the right column
 * keeps discovery inside the page (最新需求 / 相关需求 / 推荐需求 served by the
 * company service in one request). Claiming stays a quick dialog so nobody
 * loses their place in either the hall or the detail page.
 */
export function DemandDetailPage({ onStartProject }: DemandDetailPageProps = {}) {
  const { demandId } = useParams<{ demandId: string }>();
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);

  const [demand, setDemand] = useState<DemandHallItem | null>(null);
  const [bids, setBids] = useState<DemandHallBid[] | null>(null);
  const [suggestions, setSuggestions] = useState<DemandSuggestionSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [receivedClaims, setReceivedClaims] = useState<DemandClaimItem[]>([]);
  const [receivedAction, setReceivedAction] = useState<{
    claimId: string;
    action: 'accept' | 'reject' | 'complete' | 'rework';
  } | null>(null);
  const [receivedNote, setReceivedNote] = useState('');
  const [receivedSubmitting, setReceivedSubmitting] = useState(false);
  const [receivedError, setReceivedError] = useState<string | null>(null);

  /** Load the demand, its bids, the discovery rails, and received claims. */
  const loadDetail = useCallback(async (id: string, cancelled: () => boolean) => {
    const [detail, bidItems, rails, publisherClaims] = await Promise.all([
      CompanyDemandsService.getDemand(id),
      CompanyDemandsService.listDemandBids(id).catch(() => null),
      CompanyDemandsService.listDemandSuggestions(id).catch(() => null),
      // The claim API filters by the viewer: only the demand publisher receives
      // rows here, so every other reader simply renders no publisher section.
      DemandClaimsService.listClaims({ role: 'publisher', demandId: id, pageSize: 20 }).catch(() => null),
    ]);
    if (cancelled()) return;
    setDemand(detail);
    // bids 仅需求方本人可见；非发布方请求被拒时隐藏该区块。
    setBids(bidItems);
    setSuggestions(rails);
    setReceivedClaims(publisherClaims?.items ?? []);
  }, []);

  useEffect(() => {
    if (!demandId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDemand(null);
    setBids(null);
    setSuggestions(null);
    setClaimOpen(false);
    setFeedback(null);
    loadDetail(demandId, () => cancelled)
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [demandId, loadDetail, reloadKey]);

  const deadlinePassed = demand?.bidDeadline !== undefined
    && new Date(demand.bidDeadline).getTime() < Date.now();
  // The publisher already owns this demand: when the claim API returns
  // received claims, the viewer is the publisher, so self-claiming is hidden
  // (the server also rejects it). A passed bid deadline is likewise not
  // claimable even before the status catches up.
  const canClaim = demand?.status === 'published' && !deadlinePassed && receivedClaims.length === 0;
  // Once any claim is awarded, other open claims can no longer be awarded; the
  // backend closes them, and this guard keeps the buttons from flashing before
  // the refreshed list arrives.
  const demandAwarded = receivedClaims.some(
    (claim) => claim.status === 'accepted'
      || claim.status === 'in_delivery'
      || claim.status === 'delivered'
      || claim.status === 'completed',
  );
  const appForms = demand?.appForms !== undefined && demand.appForms.length > 0
    ? demand.appForms
    : demand?.appForm === undefined
      ? []
      : [demand.appForm];

  // A rail click swaps the whole page for another demand; land at the top
  // instead of inheriting the previous page's scroll offset. The host owns the
  // scroll container (the shell's page body or the embedded catalog scroller),
  // so walk up to the first scrollable ancestor rather than naming it.
  useEffect(() => {
    let node = rootRef.current?.parentElement ?? null;
    while (node && node !== document.body) {
      if (node.scrollHeight > node.clientHeight + 1) {
        node.scrollTop = 0;
        return;
      }
      node = node.parentElement;
    }
    window.scrollTo({ top: 0 });
  }, [demandId, loading]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleClaimSubmitted = async (claimed: DemandHallItem) => {
    setFeedback(t('demands.claim.success'));
    // Optimistically reflect the new bid; the reload reconciles the counters.
    setDemand((current) => (
      current && current.id === claimed.id
        ? { ...current, bidCount: current.bidCount + 1 }
        : current
    ));
    if (!demandId) return;
    try {
      const [detail, bidItems] = await Promise.all([
        CompanyDemandsService.getDemand(demandId),
        CompanyDemandsService.listDemandBids(demandId).catch(() => null),
      ]);
      setDemand(detail);
      setBids(bidItems);
    } catch {
      // The claim already succeeded; keep the optimistic state rather than
      // reporting a refresh failure as a failed claim.
    }
  };

  /** Publisher decision on a received claim (award, reject, accept delivery). */
  const submitReceivedAction = async () => {
    if (!receivedAction || !demandId) return;
    setReceivedSubmitting(true);
    setReceivedError(null);
    const claim = receivedClaims.find((item) => item.id === receivedAction.claimId);
    try {
      const input = receivedNote.trim() ? { note: receivedNote.trim() } : undefined;
      if (receivedAction.action === 'accept') {
        await DemandClaimsService.acceptClaim(receivedAction.claimId, input);
      } else if (receivedAction.action === 'reject') {
        await DemandClaimsService.rejectClaim(receivedAction.claimId, input);
      } else if (receivedAction.action === 'complete') {
        await DemandClaimsService.completeClaim(receivedAction.claimId, input);
      } else {
        await DemandClaimsService.reworkClaim(receivedAction.claimId, input);
      }
      if (claim !== undefined) {
        await syncCompanyBidMirror(claim, receivedAction.action, receivedNote.trim());
      }
      setReceivedAction(null);
      setReceivedNote('');
      setFeedback(t('demands.receivedClaims.actionSuccess'));
      const [page, refreshedDemand] = await Promise.all([
        DemandClaimsService.listClaims({ role: 'publisher', demandId, pageSize: 20 })
          .catch(() => null),
        CompanyDemandsService.getDemand(demandId).catch(() => null),
      ]);
      setReceivedClaims(page?.items ?? []);
      if (refreshedDemand !== null) setDemand(refreshedDemand);
    } catch (cause: unknown) {
      setReceivedError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setReceivedSubmitting(false);
    }
  };

  /**
   * Keep the company-domain bid and demand status mirrored with the
   * order-owned claim. The claim is authoritative; a missing legacy bid (for
   * example a claim created before the projection existed) must not turn a
   * successful award into an error.
   */
  const syncCompanyBidMirror = async (
    claim: DemandClaimItem,
    action: 'accept' | 'reject' | 'complete' | 'rework',
    note: string,
  ): Promise<void> => {
    try {
      if (action === 'complete') {
        await CompanyDemandsService.completeDemand(claim.demandId);
        return;
      }
      if (action !== 'accept' && action !== 'reject') return;
      const bids = await CompanyDemandsService.listDemandBids(claim.demandId);
      const bid = bids.find(
        (candidate) => candidate.bidderUserId === claim.bidderUserId
          && (candidate.status === 'submitted' || candidate.status === 'shortlisted'),
      );
      if (bid === undefined) return;
      if (action === 'accept') {
        await CompanyDemandsService.acceptDemandBid(claim.demandId, bid.id);
        // The company bid list is a second projection of the same decision:
        // close every other open bid so the legacy "收到的投标" section agrees
        // with the order-owned claims that are now rejected.
        const refreshed = await CompanyDemandsService.listDemandBids(claim.demandId)
          .catch(() => []);
        await Promise.all(refreshed
          .filter((candidate) => candidate.id !== bid.id
            && (candidate.status === 'submitted' || candidate.status === 'shortlisted'))
          .map((candidate) => CompanyDemandsService.rejectDemandBid(
            claim.demandId,
            candidate.id,
            'another bid was awarded',
          ).catch(() => undefined)));
      } else {
        await CompanyDemandsService.rejectDemandBid(
          claim.demandId,
          bid.id,
          note === '' ? undefined : note,
        );
      }
    } catch (error) {
      console.warn('Failed to mirror the claim decision to the company demand', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 w-full max-w-full" data-demand-detail={demandId}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !demand) {
    const failed = error !== null;
    return (
      <div
        className="flex-1 p-6 md:p-8 w-full max-w-full flex flex-col items-center justify-center min-h-[50vh] gap-3"
        data-demand-detail={demandId}
        data-demand-detail-state={failed ? 'failed' : 'not-found'}
      >
        <Layers className="w-12 h-12 text-store-ink-faint/50" />
        <h2 className="text-lg font-bold text-store-ink">
          {failed ? t('demands.detail.loadFailed') : t('demands.detail.notFound')}
        </h2>
        <p className="text-xs text-store-ink-faint max-w-md text-center">
          {failed ? t('demands.detail.loadFailedHint') : t('demands.detail.notFoundHint')}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {failed ? (
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-store-control bg-store-brand text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t('common.actions.retry')}
            </button>
          ) : null}
          <Link
            to="/demands"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-store-control border border-store-line text-store-ink-soft text-sm font-medium hover:border-store-line-strong transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('demands.detail.backToHall')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="flex-1 p-4 md:p-8 w-full max-w-full space-y-4 animate-fade-in"
      data-demand-detail={demand.id}
    >
      {/* Breadcrumb: the hall owns the list route, so the detail page always
          offers one step back to it (the embedded surface redirects /demands
          to its list route). */}
      <nav className="flex items-center gap-2 text-xs text-store-ink-faint min-w-0">
        <Link
          to="/demands"
          className="flex items-center gap-1 hover:text-store-brand transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('demands.detail.breadcrumbHall')}
        </Link>
        <span className="shrink-0">/</span>
        <span className="truncate text-store-ink-soft">{demand.category}</span>
      </nav>

      {feedback ? (
        <DemandClaimNotice message={feedback} onDismiss={() => setFeedback(null)} />
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <main className="min-w-0 space-y-4">
          <article className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-[11px] font-medium">
                {t(`demands.types.${demand.demandType}`, demand.category)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-store-field border border-store-line text-store-ink-faint">
                {t(`demands.status.${demand.status}`, demand.status)}
              </span>
              {appForms.length > 0 ? (
                <div className="flex flex-wrap gap-1" data-demand-app-forms>
                  {appForms.map((form) => (
                    <span
                      key={form}
                      className="rounded-full bg-store-brand/10 border border-store-brand/20 px-2.5 py-0.5 text-[11px] font-medium text-store-brand"
                      data-demand-app-form={form}
                    >
                      {t(`demands.appForms.${form}`, form)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <h1 className="mt-3 text-xl md:text-2xl font-bold text-store-ink leading-snug break-words">
              {demand.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-store-ink-faint">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {demand.companyName || t('demands.card.personalPublisher')}
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" />
                {t('demands.detail.publishedAt')} {formatDemandDate(demand.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {t('demands.card.bidCount', { count: demand.bidCount })}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {t('demands.detail.viewCount', { count: demand.viewCount ?? 0 })}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-store-card bg-store-field/60 border border-store-line/70 px-4 py-3">
                <p className="text-[11px] text-store-ink-faint">{t('demands.detail.budget')}</p>
                <p className="mt-1 text-lg font-bold text-store-brand">{formatDemandBudget(demand)}</p>
              </div>
              <div className="rounded-store-card bg-store-field/60 border border-store-line/70 px-4 py-3">
                <p className="text-[11px] text-store-ink-faint">{t('demands.detail.bidDeadline')}</p>
                <p className="mt-1 text-sm font-bold text-store-ink">
                  {demand.bidDeadline
                    ? formatDemandDate(demand.bidDeadline)
                    : t('demands.detail.noDeadline')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
              {canClaim ? (
                <button
                  type="button"
                  className="w-full sm:w-auto sm:min-w-[180px] px-6 py-2.5 rounded-store-control bg-store-brand text-store-on-brand text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setClaimOpen(true)}
                  data-demand-claim
                >
                  {t('demands.claim.action')}
                </button>
              ) : (
                <p className="flex-1 flex items-center text-xs text-store-ink-faint sm:mr-auto">
                  {t('demands.detail.claimUnavailable')}
                </p>
              )}
              {onStartProject ? (
                <button
                  type="button"
                  className="w-full sm:w-auto sm:min-w-[180px] px-6 py-2.5 rounded-store-control border border-store-brand/40 bg-store-brand/5 text-store-brand text-sm font-bold hover:bg-store-brand/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  onClick={() => onStartProject(demand)}
                  data-demand-start-project
                >
                  <FolderPlus className="w-4 h-4" />
                  {t('demands.detail.startProject')}
                </button>
              ) : null}
            </div>
          </article>

          <article className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-store-ink">{t('demands.detail.descriptionTitle')}</h2>
            <p className="mt-3 text-sm text-store-ink-soft leading-relaxed whitespace-pre-wrap break-words">
              {demand.description || t('demands.card.noDescription')}
            </p>
          </article>

          {receivedClaims.length > 0 ? (
            <section
              className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm"
              data-received-claims
            >
              <h2 className="text-sm font-bold text-store-ink">
                {t('demands.receivedClaims.title', { count: receivedClaims.length })}
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {receivedClaims.map((claim) => {
                  const actionable = claim.status === 'delivered'
                    || (!demandAwarded
                      && (claim.status === 'submitted' || claim.status === 'shortlisted'));
                  return (
                    <div key={claim.id} className="rounded-store-card border border-store-line/70 p-3" data-received-claim={claim.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <DemandClaimStatusBadge status={claim.status} />
                          <span className="text-xs text-store-ink-faint truncate">{claim.claimNo}</span>
                        </div>
                        <span className="text-sm font-bold text-store-brand">{formatClaimQuote(claim)}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-store-ink-faint">
                        <span>{claim.bidderCompanyId || t('demands.receivedClaims.provider')}</span>
                        <span>
                          {claim.deliveryDays
                            ? t('demands.myClaims.card.deliveryDays', { days: claim.deliveryDays })
                            : t('demands.myClaims.card.noDeliveryDays')}
                        </span>
                        <span>
                          {t('demands.receivedClaims.submittedAt', { date: formatDemandDate(claim.submittedAt) })}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-store-ink-soft line-clamp-2">{claim.proposal}</p>

                      {actionable ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {claim.status === 'submitted' || claim.status === 'shortlisted' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => { setReceivedAction({ claimId: claim.id, action: 'accept' }); setReceivedNote(''); setReceivedError(null); }}
                                className="rounded-store-control bg-store-brand px-4 py-1.5 text-[11px] font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                {t('demands.receivedClaims.award')}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setReceivedAction({ claimId: claim.id, action: 'reject' }); setReceivedNote(''); setReceivedError(null); }}
                                className="rounded-store-control border border-store-line px-4 py-1.5 text-[11px] font-medium text-store-ink-soft hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                {t('demands.receivedClaims.reject')}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => { setReceivedAction({ claimId: claim.id, action: 'complete' }); setReceivedNote(''); setReceivedError(null); }}
                                className="rounded-store-control bg-store-brand px-4 py-1.5 text-[11px] font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer"
                              >
                                {t('demands.receivedClaims.acceptDelivery')}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setReceivedAction({ claimId: claim.id, action: 'rework' }); setReceivedNote(''); setReceivedError(null); }}
                                className="rounded-store-control border border-store-line px-4 py-1.5 text-[11px] font-medium text-store-ink-soft hover:border-store-brand/50 hover:text-store-brand transition-colors cursor-pointer"
                              >
                                {t('demands.receivedClaims.rework')}
                              </button>
                            </>
                          )}
                        </div>
                      ) : null}

                      {receivedAction?.claimId === claim.id ? (
                        <form
                          className="mt-2 rounded-store-control border border-store-line/70 bg-store-field/40 p-3 flex flex-col gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void submitReceivedAction();
                          }}
                        >
                          <textarea
                            className="w-full bg-store-field border border-store-line rounded-store-control text-xs text-store-ink placeholder:text-store-ink-faint focus:outline-none focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 px-3 py-2 min-h-[72px]"
                            value={receivedNote}
                            onChange={(event) => setReceivedNote(event.target.value)}
                            placeholder={t('demands.receivedClaims.notePlaceholder')}
                          />
                          {receivedError ? (
                            <p className="text-[11px] text-red-500" role="alert">{receivedError}</p>
                          ) : null}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={receivedSubmitting}
                              onClick={() => { setReceivedAction(null); setReceivedNote(''); setReceivedError(null); }}
                              className="flex-1 rounded-store-control border border-store-line py-1.5 text-[11px] font-medium text-store-ink-soft cursor-pointer disabled:opacity-50"
                            >
                              {t('common.actions.cancel')}
                            </button>
                            <button
                              type="submit"
                              disabled={receivedSubmitting}
                              className="flex-[2] rounded-store-control bg-store-brand py-1.5 text-[11px] font-bold text-store-on-brand cursor-pointer disabled:opacity-60"
                            >
                              {receivedSubmitting ? t('demands.myClaims.detail.submitting') : t('demands.receivedClaims.confirm')}
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {bids && bids.length > 0 && receivedClaims.length === 0 ? (
            <section className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm">
              <h2 className="text-sm font-bold text-store-ink">
                {t('demands.detail.bidsSection', { count: bids.length })}
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {bids.map((bid) => (
                  <div key={bid.id} className="rounded-store-card border border-store-line/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-store-brand">¥{bid.quote}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-store-field border border-store-line text-store-ink-faint">
                        {t(BID_STATUS_KEYS[bid.status] ?? 'demands.bidStatus.submitted')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-store-ink-soft leading-relaxed">{bid.proposal}</p>
                    {bid.deliveryDays ? (
                      <p className="mt-1 text-[11px] text-store-ink-faint">
                        {t('demands.bidDelivery', { days: bid.deliveryDays })}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        <aside className="space-y-4 xl:sticky xl:top-4" data-demand-detail-rails>
          <DemandSuggestionRail kind="latest" demands={suggestions?.latest ?? []} />
          <DemandSuggestionRail kind="related" demands={suggestions?.related ?? []} />
          <DemandSuggestionRail
            kind="recommended"
            demands={suggestions?.recommended ?? []}
          />
        </aside>
      </div>

      <DemandClaimDialog
        demand={claimOpen ? demand : null}
        onClose={() => setClaimOpen(false)}
        onSubmitted={handleClaimSubmitted}
      />
    </div>
  );
}

export default DemandDetailPage;
