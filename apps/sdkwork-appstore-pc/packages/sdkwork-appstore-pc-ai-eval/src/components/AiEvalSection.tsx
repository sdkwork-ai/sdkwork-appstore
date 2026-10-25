import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bot, Cpu, Star, Zap } from 'lucide-react';
import { AppItem } from '@sdkwork/appstore-pc-core';
import { CuratedEvalSpec, rankEvalSpecs, resolveAppSpecs } from '@sdkwork/appstore-pc-commons';

/** Card layout cap: chips beyond the first four collapse into a "+n" row. */
const visibleSpecChips = 4;

function SpecChip({ spec }: { spec: { kind: string; name: string } }) {
  const { t } = useTranslation();
  const isModel = spec.kind === 'model';
  const Icon = isModel ? Cpu : Bot;
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
        isModel
          ? 'bg-store-brand/10 text-store-brand border-store-brand/20'
          : 'bg-violet-500/10 text-violet-500 border-violet-500/20'
      }`}
      title={t(isModel ? 'aiEval.specs.model' : 'aiEval.specs.agent')}
    >
      <Icon className="w-2.5 h-2.5" />
      <span className="max-w-[90px] truncate">{spec.name}</span>
    </span>
  );
}

export const AiEvalCard: React.FC<{ app: AppItem }> = ({ app }) => {
  const { t } = useTranslation();
  const specs = (resolveAppSpecs(app) ?? []) as CuratedEvalSpec[];
  const ranked = rankEvalSpecs(specs);
  const leader = ranked[0];
  const modelCount = specs.filter((spec) => spec.kind === 'model').length;
  const agentCount = specs.filter((spec) => spec.kind === 'agent').length;

  return (
    <Link to={`/app/${app.id}`} className="group block cursor-pointer">
      <div className="h-full p-4 rounded-store-card bg-store-subtle/80 dark:bg-store-surface border border-store-line transition-all hover:border-violet-500/40 hover:shadow-md space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-violet-600">
            <Cpu className="text-white w-5 h-5" />
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
          {leader?.benchmark && (
            <div className="shrink-0 px-2 py-1 rounded-store-control bg-violet-500/10 border border-violet-500/20 text-center">
              <div className="flex items-center gap-0.5 text-[9px] font-bold text-violet-500 uppercase">
                <Zap className="w-2.5 h-2.5" />
                {t('aiEval.card.benchmark')}
              </div>
              <div className="text-sm font-extrabold text-violet-600 leading-tight">
                {leader.benchmark.score.toFixed(1)}
              </div>
            </div>
          )}
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
          {specs.slice(0, visibleSpecChips).map((spec) => (
            <SpecChip key={spec.id} spec={spec} />
          ))}
          {specs.length > visibleSpecChips && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-store-raised text-store-ink-soft border border-store-line">
              +{specs.length - visibleSpecChips}
            </span>
          )}
        </div>

        <div className="pt-1.5 border-t border-store-line/60 text-[10px] text-store-ink-faint flex items-center gap-2">
          <span>{t('aiEval.specs.count', { count: specs.length })}</span>
          <span>·</span>
          <span>{t('aiEval.specs.breakdown', { model: modelCount, agent: agentCount })}</span>
        </div>
      </div>
    </Link>
  );
};

interface AiEvalSectionProps {
  apps: AppItem[];
}

/** The multi-spec evaluation app grid; every spec is rated and commented separately. */
export const AiEvalSection: React.FC<AiEvalSectionProps> = ({ apps }) => {
  const { t } = useTranslation();

  if (apps.length === 0) {
    return (
      <div className="p-8 text-center text-store-ink-faint border border-dashed border-store-line rounded-store-card">
        {t('aiEval.empty')}
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-violet-600 text-white rounded-store-control shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-store-ink">
            {t('aiEval.sections.hall', { count: apps.length })}
          </h2>
          <p className="text-xs text-store-ink-faint">
            {t('aiEval.sections.desc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {apps.map((app) => (
          <AiEvalCard key={app.id} app={app} />
        ))}
      </div>
    </section>
  );
};
