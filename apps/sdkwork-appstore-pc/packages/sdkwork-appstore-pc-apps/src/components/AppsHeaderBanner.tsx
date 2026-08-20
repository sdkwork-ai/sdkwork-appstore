import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, Sparkles } from 'lucide-react';
import { AppItem } from '@sdkwork/appstore-pc-core';

interface AppsHeaderBannerProps {
  featuredApp?: AppItem;
}

export const AppsHeaderBanner: React.FC<AppsHeaderBannerProps> = ({ featuredApp }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
      <div className="z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Grid className="w-3.5 h-3.5" />
          <span>{t('apps.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('apps.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {t('apps.header.subtitle')}
        </p>
      </div>

      {featuredApp && (
        <div className="z-10 bg-white/90 border border-slate-200 p-4 rounded-xl flex items-center gap-3 shrink-0 dark:bg-slate-800/80 dark:border-slate-700">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${featuredApp.iconColor || 'bg-blue-600'}`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">{t('apps.editorPick', '编辑推荐')}</span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{featuredApp.name}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">{featuredApp.category}</p>
          </div>
        </div>
      )}
    </div>
  );
};
