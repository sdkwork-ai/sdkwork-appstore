import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  MessageSquare,
  Timer,
  Wallet,
} from 'lucide-react';
import type { DemandClaimEventItem, DemandClaimItem } from '@sdkwork/appstore-pc-core';
import { CompanyDemandsService, DemandClaimsService } from '../services/api';
import { DemandClaimStatusBadge } from '../components/demands/DemandClaimStatusBadge';
import { demandClaimProviderActions, formatClaimQuote } from '../components/demands/demandClaimFormat';
import { formatDemandDate } from '../components/demands/demandFormat';

const inputClass =
  'w-full bg-store-field border border-store-line rounded-store-control text-sm text-store-ink placeholder:text-store-ink-faint focus:outline-none focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 px-3 py-2 transition-colors';

/**
 * 抢单详情 — one claim's delivery workspace.
 *
 * Shows the claim snapshot, the timeline the order capability records, and the
 * actions the provider can take right now (withdraw before award, start after
 * award, submit delivery while in delivery). Publisher actions stay on the
 * publisher's own surface so each role only sees its own controls.
 */
export default function DemandClaimDetailPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const { t } = useTranslation();
  const [claim, setClaim] = useState<DemandClaimItem | null>(null);
  const [events, setEvents] = useState<DemandClaimEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [actionOpen, setActionOpen] = useState<'withdraw' | 'deliver' | null>(null);
  const [note, setNote] = useState('');
  const [attachmentText, setAttachmentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    if (!claimId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      const [detail, timeline] = await Promise.all([
        DemandClaimsService.getClaim(claimId),
        DemandClaimsService.listEvents(claimId).catch(() => []),
      ]);
      setClaim(detail);
      setEvents(timeline);
    } catch (error) {
      console.error('Failed to load demand claim', error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  // Provider actions belong to the bidder; a publisher who opens the same
  // claim URL (for example from a shared link) sees the timeline only.
  const actions = claim !== null && claim.role === 'provider'
    ? demandClaimProviderActions(claim.status)
    : { withdraw: false, start: false, deliver: false };

  const runAction = async (kind: 'withdraw' | 'start' | 'deliver') => {
    if (!claim || submitting) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = kind === 'withdraw'
        ? await DemandClaimsService.withdrawClaim(claim.id, { ...(note.trim() ? { note: note.trim() } : {}) })
        : kind === 'start'
          ? await DemandClaimsService.startClaim(claim.id)
          : await DemandClaimsService.deliverClaim(claim.id, {
              deliveryNote: note.trim(),
              attachmentUrls: parseAttachmentUrls(attachmentText),
            });
      setClaim(updated);
      setActionOpen(null);
      setNote('');
      setAttachmentText('');
      if (kind === 'withdraw') {
        // Keep the company-domain bid list and demand bid count from showing a
        // withdrawn claim. The order claim remains authoritative if this fails.
        await CompanyDemandsService.withdrawMyBidForDemand(claim.demandId)
          .catch((error: unknown) => {
            console.warn('Failed to withdraw the mirrored company bid', error);
          });
      }
      setFeedback(t('demands.myClaims.detail.actionSuccess'));
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8" data-claim-detail={claimId}>
        <p className="py-20 text-center text-xs text-store-ink-faint">{t('demands.myClaims.loading')}</p>
      </div>
    );
  }

  if (failed || !claim) {
    return (
      <div
        className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh] gap-3"
        data-claim-detail-state="failed"
      >
        <ClipboardList className="w-12 h-12 text-store-ink-faint/40" />
        <p className="text-sm font-medium text-store-ink">{t('demands.myClaims.detail.loadFailed')}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-store-control bg-store-brand px-4 py-2 text-xs font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('common.actions.retry')}
          </button>
          <Link
            to="/demands/my-claims"
            className="rounded-store-control border border-store-line px-4 py-2 text-xs font-medium text-store-ink-soft hover:border-store-line-strong transition-colors"
          >
            {t('demands.myClaims.detail.backToClaims')}
          </Link>
        </div>
      </div>
    );
  }

  return (    <div className="p-4 md:p-8 w-full max-w-full space-y-4 animate-fade-in" data-claim-detail={claim.id}>
      <nav className="flex items-center gap-2 text-xs text-store-ink-faint min-w-0">
        <Link to="/demands/my-claims" className="flex items-center gap-1 hover:text-store-brand transition-colors shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('demands.myClaims.title')}
        </Link>
        <span className="shrink-0">/</span>
        <span className="truncate text-store-ink-soft">{claim.claimNo}</span>
      </nav>

      {feedback ? (
        <p className="flex items-center gap-2 rounded-store-card border border-store-brand/30 bg-store-surface/95 px-4 py-2.5 text-xs text-store-brand" role="status">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </p>
      ) : null}

      {actionError && !actionOpen ? (
        <p className="rounded-store-card border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs text-red-500" role="alert">
          {actionError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <main className="min-w-0 space-y-4">
          <article className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <DemandClaimStatusBadge status={claim.status} />
            </div>
            <h1 className="mt-3 text-lg md:text-xl font-bold text-store-ink leading-snug break-words">
              {claim.demandTitle}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-store-ink-faint">
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
              <span className="flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" />
                {t('demands.myClaims.card.submittedAt', { date: formatDemandDate(claim.submittedAt) })}
              </span>
              <Link
                to={`/demands/${encodeURIComponent(claim.demandId)}`}
                className="flex items-center gap-1 text-store-brand hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {t('demands.myClaims.detail.viewDemand')}
              </Link>
            </div>
            {claim.appForms !== undefined && claim.appForms.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1" data-claim-app-forms>
                {claim.appForms.map((form) => (
                  <span
                    key={form}
                    className="rounded-full bg-store-brand/10 border border-store-brand/20 px-2.5 py-0.5 text-[11px] font-medium text-store-brand"
                  >
                    {t(`demands.appForms.${form}`, form)}
                  </span>
                ))}
              </div>
            ) : null}

            {claim.rejectReason || claim.withdrawReason || claim.cancelReason ? (
              <div className="mt-4 rounded-store-control border border-store-line/70 bg-store-field/50 px-3 py-2 text-xs text-store-ink-soft">
                <span className="font-medium">
                  {t('demands.myClaims.detail.reason')}：
                </span>
                {claim.rejectReason ?? claim.withdrawReason ?? claim.cancelReason}
              </div>
            ) : null}

            <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2" data-claim-milestones>
              {([
                ['submitted', claim.submittedAt],
                ['accepted', claim.acceptedAt],
                ['delivered', claim.deliveredAt],
                ['completed', claim.completedAt],
              ] as const).map(([key, at]) => (
                <div key={key} className="rounded-store-control border border-store-line/60 bg-store-field/40 px-2.5 py-2">
                  <dt className="text-[10px] text-store-ink-faint">
                    {t(`demands.myClaims.detail.milestones.${key}`)}
                  </dt>
                  <dd className={`mt-0.5 text-[11px] font-medium ${at ? 'text-store-ink-soft' : 'text-store-ink-faint/60'}`}>
                    {at ? formatDemandDate(at) : '—'}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
              {actions.withdraw ? (
                <button
                  type="button"
                  onClick={() => { setActionOpen('withdraw'); setActionError(null); }}
                  className="w-full sm:w-auto sm:min-w-[150px] rounded-store-control border border-store-line px-5 py-2.5 text-sm font-bold text-store-ink-soft hover:border-red-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  {t('demands.myClaims.detail.withdraw')}
                </button>
              ) : null}
              {actions.start ? (
                <button
                  type="button"
                  onClick={() => void runAction('start')}
                  disabled={submitting}
                  className="w-full sm:w-auto sm:min-w-[170px] rounded-store-control bg-store-brand px-5 py-2.5 text-sm font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                >
                  {submitting ? t('demands.myClaims.detail.submitting') : t('demands.myClaims.detail.start')}
                </button>
              ) : null}
              {actions.deliver ? (
                <button
                  type="button"
                  onClick={() => { setActionOpen('deliver'); setActionError(null); }}
                  className="w-full sm:w-auto sm:min-w-[170px] rounded-store-control bg-store-brand px-5 py-2.5 text-sm font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {t('demands.myClaims.detail.deliver')}
                </button>
              ) : null}
            </div>

            {actionOpen ? (
              <form
                className="mt-4 rounded-store-card border border-store-line/70 bg-store-field/40 p-4 flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (actionOpen === 'deliver' && !note.trim()) {
                    setActionError(t('demands.myClaims.detail.deliveryNoteRequired'));
                    return;
                  }
                  void runAction(actionOpen);
                }}
              >
                <h2 className="text-xs font-bold text-store-ink">
                  {actionOpen === 'withdraw'
                    ? t('demands.myClaims.detail.withdrawTitle')
                    : t('demands.myClaims.detail.deliverTitle')}
                </h2>
                <textarea
                  className={`${inputClass} min-h-[96px] leading-relaxed`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    actionOpen === 'withdraw'
                      ? t('demands.myClaims.detail.withdrawPlaceholder')
                      : t('demands.myClaims.detail.deliveryNotePlaceholder')
                  }
                />
                {actionOpen === 'deliver' ? (
                  <input
                    className={inputClass}
                    value={attachmentText}
                    onChange={(event) => setAttachmentText(event.target.value)}
                    placeholder={t('demands.myClaims.detail.attachmentsPlaceholder')}
                  />
                ) : null}
                {actionError ? (
                  <p className="text-[11px] text-red-500" role="alert">{actionError}</p>
                ) : null}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => { setActionOpen(null); setNote(''); setAttachmentText(''); setActionError(null); }}
                    disabled={submitting}
                    className="sm:flex-1 rounded-store-control border border-store-line py-2 text-xs font-medium text-store-ink-soft hover:border-store-line-strong transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {t('common.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="sm:flex-[2] rounded-store-control bg-store-brand py-2 text-xs font-bold text-store-on-brand hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                  >
                    {submitting ? t('demands.myClaims.detail.submitting') : t('demands.myClaims.detail.confirmAction')}
                  </button>
                </div>
              </form>
            ) : null}
          </article>

          <article className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-5 md:p-6 shadow-sm">
            <h2 className="text-sm font-bold text-store-ink">{t('demands.myClaims.detail.proposal')}</h2>
            <p className="mt-3 text-sm text-store-ink-soft leading-relaxed whitespace-pre-wrap break-words">
              {claim.proposal}
            </p>
            {claim.deliveryNote ? (
              <div className="mt-4 rounded-store-control border border-store-line/70 bg-store-field/50 px-3 py-2">
                <p className="text-[11px] font-medium text-store-ink">{t('demands.myClaims.detail.deliveryNote')}</p>
                <p className="mt-1 text-xs text-store-ink-soft whitespace-pre-wrap">{claim.deliveryNote}</p>
              </div>
            ) : null}
            {claim.deliveryAttachmentUrls.length > 0 ? (
              <div className="mt-3 rounded-store-control border border-store-line/70 bg-store-field/50 px-3 py-2">
                <p className="text-[11px] font-medium text-store-ink">
                  {t('demands.myClaims.detail.attachments')}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {claim.deliveryAttachmentUrls
                    .filter((url) => isSafeAttachmentUrl(url))
                    .map((url) => (
                      <li key={url} className="truncate">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-xs text-store-brand hover:underline"
                        >
                          {url}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
          </article>
        </main>

        <aside className="space-y-4 xl:sticky xl:top-4">
          <section className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-4 shadow-sm" data-claim-timeline>
            <header className="flex items-center gap-2 pb-2 border-b border-store-line/60">
              <MessageSquare className="w-4 h-4 text-store-brand" />
              <h2 className="text-sm font-bold text-store-ink">{t('demands.myClaims.detail.timeline')}</h2>
            </header>
            {events.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-store-ink-faint">{t('demands.myClaims.detail.timelineEmpty')}</p>
            ) : (
              <ol className="mt-3 ml-1 space-y-3 border-l border-store-line/60 pl-4">
                {events.map((event) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-store-brand ring-2 ring-store-surface" />
                    <p className="text-xs font-semibold text-store-ink">
                      {t(`demands.myClaims.status.${event.toStatus}`, event.toStatus)}
                    </p>
                    {event.message ? (
                      <p className="mt-0.5 text-[11px] text-store-ink-faint whitespace-pre-wrap">{event.message}</p>
                    ) : null}
                    <p className="mt-0.5 text-[10px] text-store-ink-faint">
                      {formatDemandDate(event.createdAt)} · {t(`demands.myClaims.actor.${event.actorType}`)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {claim.completedAt ? (
            <section className="rounded-store-card border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs text-emerald-600 dark:text-emerald-400">
              <p className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {t('demands.myClaims.detail.completedHint')}
              </p>
              <p className="mt-1 text-[11px] opacity-80">
                {t('demands.myClaims.detail.completedAt', { date: formatDemandDate(claim.completedAt) })}
              </p>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

/** Accept only http(s) delivery links; never render a script URL from a claim. */
function isSafeAttachmentUrl(value: string): boolean {
  return /^https?:\/\/[^\s]+$/iu.test(value.trim());
}

/** Parse one-per-line/comma delivery links into the claim action payload. */
function parseAttachmentUrls(value: string): string[] {
  return value
    .split(/[\s,]+/u)
    .map((item) => item.trim())
    .filter((item) => isSafeAttachmentUrl(item));
}
