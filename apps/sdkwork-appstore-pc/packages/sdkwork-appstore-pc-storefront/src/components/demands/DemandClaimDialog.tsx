import React, { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type {
  DemandClaimInput,
  DemandHallItem,
} from '@sdkwork/appstore-pc-core';
import { CompanyDemandsService, DemandClaimsService } from '../../services/api';
import { formatDemandBudget, formatDemandDate } from './demandFormat';

const MIN_PROPOSAL_LENGTH = 10;
const QUOTE_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const DAYS_PATTERN = /^\d+$/;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Largest quote this dialog accepts, so a stray keystroke cannot overflow the wire field. */
const MAX_QUOTE = 999_999_999;

export interface DemandClaimDialogProps {
  /** The demand to claim; null keeps the dialog unmounted. */
  demand: DemandHallItem | null;
  onClose: () => void;
  /**
   * Called after the claim posts successfully, right before the dialog closes.
   * Pages apply their optimistic update synchronously and may reconcile in the
   * background; a rejected refresh is swallowed so it never reports a
   * successful claim as failed.
   */
  onSubmitted: (demand: DemandHallItem) => void | Promise<void>;
}

/**
 * 快速抢单弹窗 — one dialog for every claim entry point.
 *
 * The card's 抢单 button opens this dialog without leaving the hall, and the
 * demand detail page reuses it, so quoting costs the same two decisions in
 * both places. The dialog keeps the demand context (budget, deadline) visible,
 * validates the wire-required fields in place, traps focus, locks background
 * scroll, closes on Escape or a backdrop click, and restores focus to the
 * trigger afterwards.
 */
export function DemandClaimDialog({ demand, onClose, onSubmitted }: DemandClaimDialogProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLInputElement>(null);
  const daysRef = useRef<HTMLInputElement>(null);
  const proposalRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef(onClose);

  const [quote, setQuote] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [proposal, setProposal] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Reset the form whenever a different demand opens the dialog.
  useEffect(() => {
    if (!demand) return;
    setQuote('');
    setDeliveryDays('');
    setProposal('');
    setAttempted(false);
    setError(null);
    // Only a different demand resets the form; a refreshed copy of the same
    // demand (new object identity) must not wipe a submission in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand?.id]);

  // Lock background scroll, move focus into the dialog, and give focus back to
  // the trigger on close.
  useEffect(() => {
    if (!demand) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => quoteRef.current?.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = bodyOverflow;
      previous?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand?.id]);

  // Escape closes (except mid-submit) and Tab stays inside the panel.
  useEffect(() => {
    if (!demand) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // The dialog owns Escape while it is open: hosts that close their own
        // overlay on Escape must not tear the page down behind the modal.
        event.preventDefault();
        event.stopPropagation();
        if (!submitting) closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        event.stopPropagation();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        event.stopPropagation();
        first.focus();
      }
    };
    // Capture phase so the host shell cannot act on the same key first.
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demand?.id, submitting]);

  if (!demand) return null;

  const quoteValue = quote.trim();
  const quoteNumber = Number(quoteValue);
  const quoteValid =
    QUOTE_PATTERN.test(quoteValue) && quoteNumber > 0 && quoteNumber <= MAX_QUOTE;
  const daysValue = deliveryDays.trim();
  const daysValid = daysValue === '' || (DAYS_PATTERN.test(daysValue) && Number(daysValue) > 0);
  const proposalValid = proposal.trim().length >= MIN_PROPOSAL_LENGTH;

  const inputClass =
    'w-full bg-store-field border border-store-line rounded-store-control text-sm text-store-ink placeholder:text-store-ink-faint focus:outline-none focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 px-3 h-10 transition-colors';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    setError(null);
    if (!quoteValid) {
      quoteRef.current?.focus();
      return;
    }
    if (!daysValid) {
      daysRef.current?.focus();
      return;
    }
    if (!proposalValid) {
      proposalRef.current?.focus();
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const days = Number(daysValue);
      const input: DemandClaimInput = {
        quote: quoteValue,
        proposal: proposal.trim(),
        ...(daysValue !== '' && Number.isFinite(days) ? { deliveryDays: days } : {}),
      };
      // The claim record and its lifecycle are owned by the commerce order
      // capability. Creating it there is the authoritative write.
      await DemandClaimsService.createClaim({
        demandId: demand.id,
        demandTitle: demand.title,
        ...(demand.category ? { demandCategory: demand.category } : {}),
        demandType: demand.demandType,
        ...(demand.appForms !== undefined && demand.appForms.length > 0
          ? { appForms: demand.appForms }
          : demand.appForm === undefined
            ? {}
            : { appForms: [demand.appForm] }),
        ...(demand.budget ? { budgetText: demand.budget } : {}),
        ...(demand.budgetMin ? { budgetMin: demand.budgetMin } : {}),
        ...(demand.budgetMax ? { budgetMax: demand.budgetMax } : {}),
        ...(demand.bidDeadline ? { bidDeadline: demand.bidDeadline } : {}),
        publisherUserId: demand.publisherUserId,
        ...(demand.companyName ? { publisherCompanyName: demand.companyName } : {}),
        quote: quoteValue,
        ...(input.deliveryDays === undefined ? {} : { deliveryDays: input.deliveryDays }),
        proposal: proposal.trim(),
      });
      // Transitional projection: the demand hall's card count and publisher
      // bid list still read the company-domain bid row. It must never fail a
      // claim that the order capability already accepted.
      void CompanyDemandsService.claimDemand(demand.id, input).catch(() => undefined);
      // Hand the success to the page and close immediately: the page applies
      // its optimistic update synchronously and reconciles in the background,
      // so the bidder is not held on a spinner for a list refresh.
      try {
        const refreshed = onSubmitted(demand);
        void Promise.resolve(refreshed).catch(() => undefined);
      } catch {
        // The claim succeeded; a refresh failure must not turn it into an error.
      }
      closeRef.current();
    } catch (cause: unknown) {
      setError(describeClaimError(cause, t));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (id: string, message: string) => (
    <p id={id} className="mt-1 text-[11px] text-red-500" role="alert">
      {message}
    </p>
  );

  const quoteErrorId = `${titleId}-quote-error`;
  const daysErrorId = `${titleId}-days-error`;
  const proposalErrorId = `${titleId}-proposal-error`;
  const proposalHintId = `${titleId}-proposal-hint`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-store-overlay backdrop-blur-sm animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) closeRef.current();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-store-surface border border-store-line rounded-t-store-modal sm:rounded-store-modal shadow-2xl p-5 sm:p-6 text-store-ink"
        data-demand-claim-dialog={demand.id}
      >
        <button
          type="button"
          onClick={() => closeRef.current()}
          disabled={submitting}
          aria-label={t('common.accessibility.closeModal')}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-store-field border border-store-line flex items-center justify-center text-store-ink-faint hover:text-store-ink transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>

        <header className="pr-10">
          <h2 id={titleId} className="text-lg font-bold">
            {t('demands.claim.quickTitle')}
          </h2>
          <p className="mt-1 text-xs text-store-ink-faint">{t('demands.claim.quickSubtitle')}</p>
        </header>

        {/* Demand context: the bidder quotes against this demand, so keep the
            budget and deadline in view instead of hiding them behind the hall. */}
        <section className="mt-4 rounded-store-card border border-store-line/70 bg-store-field/50 p-3">
          <p className="text-sm font-semibold text-store-ink line-clamp-2">{demand.title}</p>
          <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-store-ink-faint">
            <div className="flex items-center gap-1">
              <dt>{t('demands.claim.contextBudget')}</dt>
              <dd className="font-semibold text-store-brand">{formatDemandBudget(demand)}</dd>
            </div>
            <div className="flex items-center gap-1">
              <dt>{t('demands.claim.contextDeadline')}</dt>
              <dd className="text-store-ink-soft">
                {demand.bidDeadline
                  ? formatDemandDate(demand.bidDeadline)
                  : t('demands.claim.contextNoDeadline')}
              </dd>
            </div>
            <div className="flex items-center gap-1">
              <dt>{t('demands.claim.contextCategory')}</dt>
              <dd className="text-store-ink-soft truncate">{demand.category}</dd>
            </div>
          </dl>
        </section>

        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor={`${titleId}-quote`} className="text-xs font-semibold text-store-ink">
              {t('demands.claim.quoteLabel')}
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-store-ink-faint">
                ¥
              </span>
              <input
                id={`${titleId}-quote`}
                ref={quoteRef}
                className={`${inputClass} pl-7`}
                inputMode="decimal"
                autoComplete="off"
                value={quote}
                aria-invalid={attempted && !quoteValid}
                aria-describedby={attempted && !quoteValid ? quoteErrorId : undefined}
                onChange={(event) => setQuote(event.target.value)}
                placeholder={t('demands.claim.quotePlaceholder')}
              />
            </div>
            {attempted && !quoteValid ? fieldError(quoteErrorId, t('demands.claim.quoteError')) : null}
          </div>

          <div>
            <label htmlFor={`${titleId}-days`} className="text-xs font-semibold text-store-ink">
              {t('demands.claim.deliveryLabel')}
              <span className="ml-1 font-normal text-store-ink-faint">
                {t('demands.claim.optional')}
              </span>
            </label>
            <input
              id={`${titleId}-days`}
              ref={daysRef}
              className={`${inputClass} mt-1.5`}
              inputMode="numeric"
              autoComplete="off"
              value={deliveryDays}
              aria-invalid={attempted && !daysValid}
              aria-describedby={attempted && !daysValid ? daysErrorId : undefined}
              onChange={(event) => setDeliveryDays(event.target.value)}
              placeholder={t('demands.claim.deliveryPlaceholder')}
            />
            {attempted && !daysValid ? fieldError(daysErrorId, t('demands.claim.deliveryError')) : null}
          </div>

          <div>
            <label htmlFor={`${titleId}-proposal`} className="text-xs font-semibold text-store-ink">
              {t('demands.claim.proposalLabel')}
            </label>
            <textarea
              id={`${titleId}-proposal`}
              ref={proposalRef}
              className={`${inputClass} mt-1.5 min-h-[104px] h-auto py-2 leading-relaxed`}
              value={proposal}
              aria-invalid={attempted && !proposalValid}
              aria-describedby={
                attempted && !proposalValid ? proposalErrorId : proposalHintId
              }
              onChange={(event) => setProposal(event.target.value)}
              placeholder={t('demands.claim.proposalPlaceholder')}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              {attempted && !proposalValid
                ? fieldError(proposalErrorId, t('demands.claim.proposalError', { min: MIN_PROPOSAL_LENGTH }))
                : (
                  <span id={proposalHintId} className="text-[11px] text-store-ink-faint">
                    {t('demands.claim.proposalHint', { min: MIN_PROPOSAL_LENGTH })}
                  </span>
                )}
              <span className="text-[11px] text-store-ink-faint tabular-nums">
                {proposal.trim().length}
              </span>
            </div>
          </div>

          {error ? (
            <p
              className="flex items-start gap-2 rounded-store-control border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-500"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              type="button"
              onClick={() => closeRef.current()}
              disabled={submitting}
              className="sm:flex-1 py-2.5 rounded-store-control border border-store-line text-sm font-medium text-store-ink-soft hover:border-store-line-strong transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="sm:flex-[2] py-2.5 rounded-store-control bg-store-brand text-store-on-brand text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? t('demands.claim.submitting') : t('demands.claim.submit')}
            </button>
          </div>

          <p className="hidden sm:block text-center text-[10px] text-store-ink-faint">
            {t('demands.claim.escHint')}
          </p>
        </form>
      </div>
    </div>
  );
}

/** Map wire failures onto the two outcomes a bidder can act on. */
function describeClaimError(
  cause: unknown,
  t: (key: string) => string,
): string {
  const message = cause instanceof Error ? cause.message : String(cause ?? '');
  if (/unauthor|forbidden|401|403|登录/i.test(message)) {
    return t('demands.claim.signInRequired');
  }
  if (/conflict|409|already|duplicate|重复/i.test(message)) {
    return t('demands.claim.alreadyClaimed');
  }
  return message || t('demands.claim.failed');
}

export default DemandClaimDialog;
