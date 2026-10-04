import { CheckCircle2, Download, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function UpdatesEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-store-subtle/50 dark:bg-store-surface rounded-store-card border border-store-line ">
      <div className="w-16 h-16 mb-4 rounded-store-card bg-store-success/10 dark:bg-store-success/20 text-store-success flex items-center justify-center shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-store-ink mb-1 ">
        {t('updates.emptyState.title')}
      </h3>
      <p className="text-xs text-store-ink-faint max-w-sm mb-6 ">
        {t('updates.emptyState.subtitle')}
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-store-control text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('updates.emptyState.exploreApps')}</span>
        </Link>
        <Link
          to="/apps"
          className="px-4 py-2 bg-store-raised text-store-ink-soft hover:bg-gray-300 dark:hover:bg-store-raised rounded-store-control text-xs font-bold transition-all flex items-center gap-1.5 "
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('updates.emptyState.browseMarket')}</span>
        </Link>
      </div>
    </div>
  );
}

