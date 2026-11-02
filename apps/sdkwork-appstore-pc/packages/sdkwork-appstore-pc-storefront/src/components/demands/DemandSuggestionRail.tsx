import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Layers, Sparkles, Users, type LucideIcon } from 'lucide-react';
import type { DemandHallItem } from '@sdkwork/appstore-pc-core';
import { formatDemandBudget, formatDemandDate } from './demandFormat';

/** Which discovery rail a demand list belongs to. */
export type DemandSuggestionKind = 'latest' | 'related' | 'recommended';

interface DemandSuggestionRailProps {
  kind: DemandSuggestionKind;
  demands: DemandHallItem[];
  /** True while the suggestions request is still in flight. */
  loading?: boolean;
}

const RAIL_ICONS: Record<DemandSuggestionKind, LucideIcon> = {
  latest: Clock,
  related: Layers,
  recommended: Sparkles,
};

/**
 * One right-column discovery rail on the demand detail page. Each item links
 * to that demand's own detail page, so the rails keep the reader inside the
 * hall instead of opening another overlay.
 */
export const DemandSuggestionRail: React.FC<DemandSuggestionRailProps> = ({
  kind,
  demands,
  loading = false,
}) => {
  const { t } = useTranslation();
  const Icon = RAIL_ICONS[kind];

  return (
    <section
      className="bg-store-surface border border-store-line/80 dark:border-store-line rounded-store-card p-4 shadow-sm"
      data-demand-suggestion-rail={kind}
    >
      <header className="flex items-center gap-2 pb-2 border-b border-store-line/60">
        <Icon className="w-4 h-4 text-store-brand" />
        <h3 className="text-sm font-bold text-store-ink">{t(`demands.detail.sections.${kind}`)}</h3>
      </header>

      {loading ? (
        <p className="py-4 text-center text-[11px] text-store-ink-faint">
          {t('demands.detail.sections.loading')}
        </p>
      ) : demands.length === 0 ? (
        <p className="py-4 text-center text-[11px] text-store-ink-faint">
          {t('demands.detail.sections.empty')}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col divide-y divide-store-line/50">
          {demands.map((demand) => (
            <li key={demand.id}>
              <Link
                to={`/demands/${demand.id}`}
                className="group flex flex-col gap-1 py-2.5 first:pt-1 last:pb-1 -mx-2 px-2 rounded-store-control hover:bg-store-field/60 transition-colors"
                data-demand-suggestion-item={demand.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-[10px] font-medium">
                    {t(`demands.types.${demand.demandType}`, demand.category)}
                  </span>
                  <span className="text-[11px] font-bold text-store-brand shrink-0">
                    {formatDemandBudget(demand)}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-store-ink leading-snug line-clamp-2 group-hover:text-store-brand transition-colors">
                  {demand.title}
                </h4>
                <div className="flex items-center justify-between gap-2 text-[10px] text-store-ink-faint">
                  <span className="flex items-center gap-1 min-w-0">
                    <Users className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {t('demands.card.bidCount', { count: demand.bidCount })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    {formatDemandDate(demand.publishedAt)}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
