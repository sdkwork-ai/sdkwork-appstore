import { AppItem } from '../../types';
import { useInstall } from '../../providers/InstallProvider';
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
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {t('discover.sections.featuredToday')}
        </span>
      </div>

      <Link 
        to={`/app/${app.id}`}
        className="group relative flex-1 flex flex-col justify-between rounded-2xl overflow-hidden p-6 bg-slate-900 dark:bg-[#151821] border border-slate-800 shadow-lg hover:border-slate-700 transition-all cursor-pointer min-h-[260px]"
      >
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('discover.sections.aiSpotlight', 'AI 焦点')}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Center Visual & Title */}
        <div className="my-4 flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md ring-1 ring-white/10 shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{app.developer}</span>
            <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-slate-300/80 mt-1 line-clamp-2 max-w-xs leading-relaxed">
              {app.description}
            </p>
          </div>
        </div>

        {/* Bottom CTA Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 z-10">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">{t('common.labels.rating')}: {app.rating} ★</span>
            <span className="text-xs font-semibold text-slate-200">{app.category}</span>
          </div>

          <button
            onClick={handleAction}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
              installed
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : downloading
                ? "bg-amber-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {downloading ? `${t('common.actions.downloading')} (${Math.round(progress)}%)` : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
          </button>
        </div>
      </Link>
    </div>
  );
}
