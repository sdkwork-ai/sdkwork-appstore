import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DemandClaimInput, DemandHallBid, DemandHallItem } from '@sdkwork/appstore-pc-core';
import { CompanyDemandsService } from '../../services/api';

interface DemandDetailModalProps {
  demandId: string | null;
  onClose: () => void;
  /** 抢单提交；由页面接服务层。 */
  onClaim: (demandId: string, input: DemandClaimInput) => Promise<void>;
}

const BID_STATUS_KEYS: Record<string, string> = {
  submitted: 'demands.bidStatus.submitted',
  shortlisted: 'demands.bidStatus.shortlisted',
  accepted: 'demands.bidStatus.accepted',
  rejected: 'demands.bidStatus.rejected',
  withdrawn: 'demands.bidStatus.withdrawn',
};

export const DemandDetailModal: React.FC<DemandDetailModalProps> = ({
  demandId,
  onClose,
  onClaim,
}) => {
  const { t } = useTranslation();
  const [demand, setDemand] = useState<DemandHallItem | null>(null);
  const [bids, setBids] = useState<DemandHallBid[] | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const [quote, setQuote] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [proposal, setProposal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!demandId) return;
    let cancelled = false;
    setError(null);
    setClaimOpen(false);
    setQuote('');
    setDeliveryDays('');
    setProposal('');
    Promise.all([
      CompanyDemandsService.getDemand(demandId),
      CompanyDemandsService.listDemandBids(demandId).catch(() => null),
    ]).then(([detail, bidItems]) => {
      if (cancelled) return;
      setDemand(detail);
      // bids 仅需求方本人可见；非发布方请求被拒时隐藏该区块。
      setBids(bidItems);
    }).catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
    });
    return () => {
      cancelled = true;
    };
  }, [demandId]);

  if (!demandId) return null;

  const canClaim = demand?.status === 'published';
  const canSubmitClaim = quote.trim() && proposal.trim() && !submitting;

  const submitClaim = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitClaim) return;
    setSubmitting(true);
    setError(null);
    try {
      const days = Number.parseInt(deliveryDays, 10);
      await onClaim(demandId, {
        quote: quote.trim(),
        deliveryDays: Number.isFinite(days) && days > 0 ? days : undefined,
        proposal: proposal.trim(),
      });
      setClaimOpen(false);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full bg-store-field border border-store-line rounded-store-control text-sm text-store-ink placeholder:text-store-ink-faint focus:outline-none focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 px-3 h-9 transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-store-overlay backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-store-surface border border-store-line rounded-store-modal shadow-2xl overflow-hidden p-6 text-store-ink max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-store-field border border-store-line flex items-center justify-center cursor-pointer text-store-ink-faint hover:text-store-ink"
          aria-label={t('common.actions.close')}
        >
          <X className="w-4 h-4" />
        </button>

        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {demand ? (
          <>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-[11px] font-medium">
                {t(`demands.types.${demand.demandType}`, demand.category)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-store-field border border-store-line text-store-ink-faint">
                {t(`demands.status.${demand.status}`, demand.status)}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold pr-8">{demand.title}</h3>
            <p className="mt-1 text-xs text-store-ink-faint">
              {demand.companyName || t('demands.card.personalPublisher')}
              {demand.bidDeadline
                ? ` · ${t('demands.detail.bidDeadline')}: ${new Date(demand.bidDeadline).toLocaleDateString()}`
                : ''}
            </p>
            <p className="mt-3 text-sm text-store-ink-soft leading-relaxed whitespace-pre-wrap">
              {demand.description || t('demands.card.noDescription')}
            </p>

            {canClaim && !claimOpen ? (
              <button
                type="button"
                className="mt-4 w-full py-2.5 rounded-store-control bg-store-brand text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                onClick={() => setClaimOpen(true)}
              >
                {t('demands.claim.action')}
              </button>
            ) : null}

            {canClaim && claimOpen ? (
              <form className="mt-4 rounded-store-card border border-store-line p-4 flex flex-col gap-3" onSubmit={submitClaim}>
                <span className="text-xs font-bold">{t('demands.claim.formTitle')}</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={quote}
                    onChange={(event) => setQuote(event.target.value)}
                    placeholder={t('demands.claim.quotePlaceholder')}
                  />
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={deliveryDays}
                    onChange={(event) => setDeliveryDays(event.target.value)}
                    placeholder={t('demands.claim.deliveryPlaceholder')}
                  />
                </div>
                <textarea
                  className={`${inputClass} min-h-[80px] py-2 h-auto`}
                  value={proposal}
                  onChange={(event) => setProposal(event.target.value)}
                  placeholder={t('demands.claim.proposalPlaceholder')}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-store-control border border-store-line text-xs font-medium text-store-ink-soft cursor-pointer"
                    onClick={() => setClaimOpen(false)}
                  >
                    {t('common.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmitClaim}
                    className={`flex-1 py-2 rounded-store-control text-xs font-bold transition-all ${
                      canSubmitClaim
                        ? 'bg-store-brand text-white hover:opacity-90 cursor-pointer'
                        : 'bg-store-field text-store-ink-faint cursor-not-allowed border border-store-line'
                    }`}
                  >
                    {submitting ? t('demands.claim.submitting') : t('demands.claim.submit')}
                  </button>
                </div>
              </form>
            ) : null}

            {bids && bids.length > 0 ? (
              <div className="mt-5">
                <span className="text-xs font-bold">
                  {t('demands.detail.bidsSection', { count: bids.length })}
                </span>
                <div className="mt-2 flex flex-col gap-2">
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
              </div>
            ) : null}
          </>
        ) : (
          <p className="text-xs text-store-ink-faint">{t('demands.detail.loading')}</p>
        )}
      </div>
    </div>
  );
};
