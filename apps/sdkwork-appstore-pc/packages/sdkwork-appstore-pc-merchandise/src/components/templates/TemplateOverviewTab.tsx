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
        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39] flex flex-col">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            GitHub Stars
          </span>
          <span className="text-base font-extrabold text-gray-900 dark:text-gray-100 mt-1">
            {template.stars}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39] flex flex-col">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <GitFork className="w-3 h-3 text-indigo-500" />
            {t('templates.detail.forksCount')}
          </span>
          <span className="text-base font-extrabold text-gray-900 dark:text-gray-100 mt-1">
            {template.forks}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39] flex flex-col">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <Rocket className="w-3 h-3 text-emerald-500" />
            {t('templates.detail.appsCount')}
          </span>
          <span className="text-base font-extrabold text-gray-900 dark:text-gray-100 mt-1">
            {template.usageCount || 1200}+
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39] flex flex-col">
          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-500" />
            {t('common.labels.license')}
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
            {template.license || 'MIT License'}
          </span>
        </div>
      </div>

      {/* Description Box */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39]">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          {t('templates.detail.descTitle')}
        </h4>
        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {template.description}
        </p>
      </div>

      {/* Features Checklist */}
      {template.features && template.features.length > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
          <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            {t('templates.detail.featuresTitle')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {template.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-white/70 dark:bg-[#1f222d] p-2 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40 text-gray-700 dark:text-gray-300 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-gray-400 font-semibold flex items-center gap-1 shrink-0">
          <Tag className="w-3 h-3" />
          {t('templates.detail.tagsLabel')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-gray-200/70 dark:bg-[#2a2d39] text-gray-700 dark:text-gray-300 text-[10px] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
