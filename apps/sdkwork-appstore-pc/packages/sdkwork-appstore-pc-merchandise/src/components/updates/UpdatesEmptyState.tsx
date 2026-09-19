import { CheckCircle2, Download, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function UpdatesEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-gray-100/50 dark:bg-[#181a20] rounded-2xl border border-gray-200 dark:border-[#22252e]">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
        {t('updates.emptyState.title')}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {t('updates.emptyState.subtitle')}
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('updates.emptyState.exploreApps')}</span>
        </Link>
        <Link
          to="/apps"
          className="px-4 py-2 bg-gray-200 dark:bg-[#252834] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#2d313f] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('updates.emptyState.browseMarket')}</span>
        </Link>
      </div>
    </div>
  );
}

