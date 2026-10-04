import { AppItem } from '../../types';
import { useInstall } from '../../providers/InstallProvider';
import { PlatformBadges } from '@sdkwork/appstore-pc-commons';
import { Sparkles, ArrowUpRight, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FeaturedTodayCardProps {
  app: AppItem;
}

export function FeaturedTodayCard({ app }: FeaturedTodayCardProps) {
  const { t } = useTranslation();
  const { installApp, openApp, isInstalled, isDownloading, downloadProgress } = useInstall();

  const installed = isInstalled(app.id);
  const downloading = isDownloading(app.id);
  const progress = downloadProgress(app.id);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (installed) {
      openApp(app);
    } else {
      installApp(app);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-store-ink ">
          {t('discover.sections.featuredToday')}
        </span>
      </div>

      <Link 
        to={`/app/${app.id}`}
        className="group relative flex-1 flex flex-col justify-between rounded-store-card overflow-hidden p-6 bg-gradient-to-br from-store-subtle to-store-subtle border border-store-line shadow-lg hover:border-store-line-strong transition-all cursor-pointer min-h-[260px] "
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-store-brand/10 border border-store-brand/20 text-store-brand text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('discover.sections.aiSpotlight', 'AI 焦点')}</span>
          </div>
          <div className="p-2 rounded-store-control bg-store-subtle text-store-ink-soft group-hover:bg-store-brand group-hover:text-white transition-colors ">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Center Visual & Title */}
        <div className="my-4 flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-store-card bg-store-brand flex items-center justify-center text-white shadow-md ring-1 ring-white/10 shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] text-store-ink-faint font-semibold uppercase tracking-wider ">{app.developer}</span>
            <h3 className="text-lg md:text-xl font-bold text-store-ink group-hover:text-store-brand transition-colors  ">
              {app.name}
            </h3>
            <p className="text-xs text-store-ink-soft/90 dark:text-slate-300/80 mt-1 line-clamp-2 max-w-xs leading-relaxed">
              {app.description}
            </p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-store-line z-10 ">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-store-ink-faint font-medium ">{t('common.labels.rating')}: {app.rating} ★</span>
            <span className="text-xs font-semibold text-store-ink-soft ">{app.category}</span>
            <PlatformBadges platforms={app.platforms} max={3} />
          </div>

          <button
            onClick={handleAction}
            className={`px-5 py-2 rounded-store-control text-xs font-medium transition-all shadow-sm ${
              installed
                ? "bg-store-success text-white hover:bg-store-success"
                : downloading
                ? "bg-store-warning text-white"
                : "bg-store-brand text-white hover:bg-store-brand"
            }`}
          >
            {downloading ? `${t('common.actions.downloading')} (${Math.round(progress)}%)` : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
          </button>
        </div>
      </Link>
    </div>
  );
}
