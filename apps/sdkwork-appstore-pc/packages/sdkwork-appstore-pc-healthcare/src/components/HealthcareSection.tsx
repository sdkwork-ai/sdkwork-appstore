import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, ShieldCheck, Star } from 'lucide-react';
import { AppItem } from '@sdkwork/appstore-pc-core';
import {
  HealthcareProfile,
  healthcareSafetyScore,
  rankEvalSpecs,
  resolveHealthcareProfile,
} from '@sdkwork/appstore-pc-commons';

/** Card layout cap: scenario badges beyond the first three collapse into a "+n" row. */
const visibleScenarioBadges = 3;

/** Scenario badge: solid tone, the primary vertical signal on the card. */
function ScenarioBadge({ scenario }: { scenario: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20">
      <HeartPulse className="w-2.5 h-2.5" />
      <span className="max-w-[90px] truncate">{t(`healthcare.scenarios.${scenario}`)}</span>
    </span>
  );
}

export const HealthcareCard: React.FC<{ app: AppItem }> = ({ app }) => {
  const { t } = useTranslation();
  const profile = resolveHealthcareProfile(app) as HealthcareProfile | undefined;
  const specs = profile?.specs ?? [];
  const ranked = rankEvalSpecs(specs);
  const leader = ranked[0];
  const leaderSafety = leader ? healthcareSafetyScore(leader) : undefined;
  const scenarios = profile?.scenarios ?? [];

  return (
    <Link to={`/app/${app.id}`} className="group block cursor-pointer">
      <div className="h-full p-4 rounded-store-card bg-store-subtle/80 dark:bg-store-surface border border-store-line transition-all hover:border-rose-500/40 hover:shadow-md space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-rose-600">
            <HeartPulse className="text-white w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-store-ink truncate group-hover:text-store-brand transition-colors">
              {app.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-store-ink-faint">
              <Star className="w-3 h-3 text-store-warning fill-yellow-400" />
              <span className="font-bold text-store-warning">{app.rating > 0 ? app.rating.toFixed(1) : '--'}</span>
              <span>({app.reviewsCount})</span>
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-1">
            {leader?.benchmark && (
              <div className="px-2 py-1 rounded-store-control bg-rose-500/10 border border-rose-500/20 text-center">
                <div className="text-[9px] font-bold text-rose-600 uppercase">
                  {t('healthcare.card.benchmark')}
                </div>
                <div className="text-sm font-extrabold text-rose-600 leading-tight">
                  {leader.benchmark.score.toFixed(1)}
                </div>
              </div>
            )}
            {leaderSafety != null && (
              <div
                className="px-2 py-0.5 rounded-store-control bg-emerald-500/10 border border-emerald-500/20 text-center flex items-center justify-center gap-0.5"
                title={t('healthcare.card.safetyTitle')}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-600">
                  {t('healthcare.card.safety')} {leaderSafety.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-store-ink-soft line-clamp-2 leading-relaxed min-h-[2.2em]">
          {app.description}
        </p>

        {leader?.benchmark && (
          <div className="flex items-center gap-1.5 text-[10px] text-store-ink-faint">
            <span className="px-1 py-0.5 rounded bg-amber-400/20 text-amber-600 font-bold">#1</span>
            <span className="font-medium text-store-ink-soft truncate">{leader.name}</span>
            <span>·</span>
            <span className="truncate">{leader.publisher}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {scenarios.slice(0, visibleScenarioBadges).map((scenario) => (
            <ScenarioBadge key={scenario} scenario={scenario} />
          ))}
          {scenarios.length > visibleScenarioBadges && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-store-raised text-store-ink-soft border border-store-line">
              +{scenarios.length - visibleScenarioBadges}
            </span>
          )}
        </div>

        <div className="pt-1.5 border-t border-store-line/60 text-[10px] text-store-ink-faint flex items-center gap-2">
          <span>{t('healthcare.card.specs', { count: specs.length })}</span>
        </div>
      </div>
    </Link>
  );
};

interface HealthcareSectionProps {
  apps: AppItem[];
}

/** The healthcare app grid after the scenario filter. */
export const HealthcareSection: React.FC<HealthcareSectionProps> = ({ apps }) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return (
      <div className="p-8 text-center text-store-ink-faint border border-dashed border-store-line rounded-store-card">
        {t('healthcare.empty')}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-rose-600 text-white rounded-store-control shadow-sm">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-store-ink">
            {t('healthcare.sections.hall', { count: apps.length })}
          </h2>
          <p className="text-xs text-store-ink-faint">
            {t('healthcare.sections.desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map((app) => (
          <HealthcareCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
};
