import React from 'react';
import { CheckCircle2, Star, GitFork, Rocket, ShieldCheck, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';

interface TemplateOverviewTabProps {
  template: TemplateItem;
}

export const TemplateOverviewTab: React.FC<TemplateOverviewTabProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line flex flex-col ">
          <span className="text-[10px] text-store-ink-faint font-medium flex items-center gap-1">
            <Star className="w-3 h-3 text-store-warning fill-amber-500" />
            GitHub Stars
          </span>
          <span className="text-base font-extrabold text-store-ink mt-1 ">
            {template.stars}
          </span>
        </div>

        <div className="p-3 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line flex flex-col ">
          <span className="text-[10px] text-store-ink-faint font-medium flex items-center gap-1">
            <GitFork className="w-3 h-3 text-store-brand" />
            {t('templates.detail.forksCount')}
          </span>
          <span className="text-base font-extrabold text-store-ink mt-1 ">
            {template.forks}
          </span>
        </div>

        <div className="p-3 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line flex flex-col ">
          <span className="text-[10px] text-store-ink-faint font-medium flex items-center gap-1">
            <Rocket className="w-3 h-3 text-store-success" />
            {t('templates.detail.appsCount')}
          </span>
          <span className="text-base font-extrabold text-store-ink mt-1 ">
            {template.usageCount || 1200}+
          </span>
        </div>

        <div className="p-3 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line flex flex-col ">
          <span className="text-[10px] text-store-ink-faint font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-store-brand" />
            {t('common.labels.license')}
          </span>
          <span className="text-xs font-bold text-store-ink mt-1 truncate ">
            {template.license || 'MIT License'}
          </span>
        </div>
      </div>

      {/* Description Box */}
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line ">
        <h4 className="text-[11px] font-bold text-store-ink-faint uppercase tracking-wider mb-1.5">
          {t('templates.detail.descTitle')}
        </h4>
        <p className="text-sm leading-relaxed text-store-ink ">
          {template.description}
        </p>
      </div>

      {/* Features Checklist */}
      {template.features && template.features.length > 0 && (
        <div className="p-4 rounded-store-card bg-store-brand-soft/50 dark:bg-store-brand/20 border border-store-brand-soft dark:border-store-brand/30">
          <h4 className="text-[11px] font-bold text-store-brand uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ">
            <CheckCircle2 className="w-4 h-4 text-store-brand" />
            {t('templates.detail.featuresTitle')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {template.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-store-surface/70 dark:bg-store-surface p-2 rounded-store-control border border-store-brand-soft/60 dark:border-store-brand/40 text-store-ink-soft font-medium "
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-store-success shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-store-ink-faint font-semibold flex items-center gap-1 shrink-0">
          <Tag className="w-3 h-3" />
          {t('templates.detail.tagsLabel')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-store-raised/70 dark:bg-store-raised text-store-ink-soft text-xs font-medium "
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
