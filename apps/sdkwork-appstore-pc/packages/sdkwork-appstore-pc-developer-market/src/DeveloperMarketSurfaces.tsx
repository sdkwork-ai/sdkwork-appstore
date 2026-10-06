import { Loader2, TerminalSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Full-page loading surface shown while the lazily imported documents
 * reference module resolves. It only ever renders for the first navigation to
 * a developer-market route.
 */
export function DeveloperMarketLoadingSurface() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <Loader2 className="w-7 h-7 text-store-ink-faint animate-spin" />
      <p className="text-xs text-store-ink-faint">{t('developerMarket.loading')}</p>
    </div>
  );
}

/**
 * Fallback for a developer-market route whose documents reference runtime was
 * never configured — the runtime creation step failed or a host mounted the
 * pages without `createAppstorePcRuntime`. Keeps the route a complete themed
 * surface instead of an unhandled exception.
 */
export function DeveloperMarketUnavailableSurface() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-store-line-strong m-6">
      <div className="w-14 h-14 rounded-store-card bg-store-subtle flex items-center justify-center">
        <TerminalSquare className="w-7 h-7 text-store-ink-faint" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-store-ink">{t('developerMarket.unavailable.title')}</h3>
        <p className="text-xs text-store-ink-faint mt-1 max-w-sm">{t('developerMarket.unavailable.subtitle')}</p>
      </div>
    </div>
  );
}
