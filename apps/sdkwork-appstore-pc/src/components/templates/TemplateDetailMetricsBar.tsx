import React from 'react';
import { useTranslation } from 'react-i18next';

interface TemplateDetailMetricsBarProps {
  license?: string;
  starsCount: number;
  forksCount: number;
}

export const TemplateDetailMetricsBar: React.FC<TemplateDetailMetricsBarProps> = ({
  license,
  starsCount,
  forksCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.devLanguage')}
        </span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">TypeScript</span>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.uiFramework')}
        </span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">Tailwind CSS</span>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.buildTool')}
        </span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">Vite 6</span>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.license')}
        </span>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
          {license || 'MIT License'}
        </span>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.stars')}
        </span>
        <span className="text-sm font-bold text-amber-500 mt-1">{starsCount}</span>
      </div>
      <div className="p-4 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] flex flex-col items-center text-center">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {t('templates.detail.metrics.forks')}
        </span>
        <span className="text-sm font-bold text-indigo-500 mt-1">{forksCount}</span>
      </div>
    </div>
  );
};
