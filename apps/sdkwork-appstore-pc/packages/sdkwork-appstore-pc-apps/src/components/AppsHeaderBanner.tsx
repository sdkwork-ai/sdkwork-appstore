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
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line rounded-store-card text-store-ink shadow-lg relative overflow-hidden ">
      <div className="z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-xs font-medium mb-3">
          <Grid className="w-3.5 h-3.5" />
          <span>{t('apps.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('apps.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-store-ink-soft mt-2 leading-relaxed ">
          {t('apps.header.subtitle')}
        </p>
      </div>

      {featuredApp && (
        <div className="z-10 bg-store-surface/90 border border-store-line p-4 rounded-store-control flex items-center gap-3 shrink-0 dark:bg-slate-800/80 ">
          <div className={`w-12 h-12 rounded-store-control flex items-center justify-center text-white font-bold ${featuredApp.iconColor || 'bg-store-brand'}`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-store-brand font-semibold uppercase ">{t('apps.editorPick', '编辑推荐')}</span>
            <h3 className="text-sm font-bold text-store-ink ">{featuredApp.name}</h3>
            <p className="text-[11px] text-store-ink-faint ">{featuredApp.category}</p>
          </div>
        </div>
      )}
    </div>
  );
};
