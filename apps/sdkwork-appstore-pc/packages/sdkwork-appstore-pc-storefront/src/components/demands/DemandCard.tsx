import React from 'react';
import { Building2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { DemandHallItem } from '@sdkwork/appstore-pc-core';

interface DemandCardProps {
  demand: DemandHallItem;
  onSelect: (demand: DemandHallItem) => void;
  onClaim: (demand: DemandHallItem) => void;
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  published: 'demands.status.published',
  assigned: 'demands.status.assigned',
  completed: 'demands.status.completed',
  closed: 'demands.status.closed',
};

export const DemandCard: React.FC<DemandCardProps> = ({ demand, onSelect, onClaim }) => {
  const { t } = useTranslation();
  const claimable = demand.status === 'published';

  return (
    <div
      onClick={() => onSelect(demand)}
      className="group bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-[11px] font-medium">
            {t(`demands.types.${demand.demandType}`, demand.category)}
          </span>
          <span className="text-sm font-bold text-store-brand">
            {demand.budgetMin || demand.budgetMax
              ? `¥${demand.budgetMin ?? '?'} - ${demand.budgetMax ?? '?'}`
              : demand.budget}
          </span>
        </div>

        <h3 className="mt-2 text-sm font-bold text-store-ink group-hover:text-store-brand transition-colors line-clamp-1">
          {demand.title}
        </h3>
        <p className="text-xs text-store-ink-soft mt-2 line-clamp-2 leading-relaxed">
          {demand.description || t('demands.card.noDescription')}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-store-line/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center gap-1 text-[11px] text-store-ink-faint min-w-0">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{demand.companyName || t('demands.card.personalPublisher')}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-store-ink-faint shrink-0">
            <Users className="w-3.5 h-3.5" />
            {t('demands.card.bidCount', { count: demand.bidCount })}
          </span>
        </div>
        {claimable ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClaim(demand);
            }}
            className="shrink-0 px-3 py-1.5 rounded-store-control bg-store-brand text-white text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('demands.card.claimBtn')}
          </button>
        ) : (
          <span className="shrink-0 px-3 py-1.5 rounded-store-control bg-store-field text-store-ink-faint text-[11px] font-medium border border-store-line">
            {t(STATUS_LABEL_KEYS[demand.status] ?? 'demands.status.closed')}
          </span>
        )}
      </div>
    </div>
  );
};
