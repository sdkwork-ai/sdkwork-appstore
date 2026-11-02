import React from 'react';
import { Link } from 'react-router-dom';
import { GitFork, Check, LayoutGrid, ArrowRight, Terminal, Star, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';

interface TemplateDetailActionButtonsProps {
  relatedApp: AppItem | null;
  starred: boolean;
  forking: boolean;
  forkedSuccess: boolean;
  copiedCli: boolean;
  onFork: () => void;
  onStar: () => void;
  onCopyCli: () => void;
  /** True while the star request is in flight; the toggle is disabled. */
  starring?: boolean | undefined;
  /** Open the phone QR dialog; absent for forms that do not run on a phone. */
  onScan?: (() => void) | undefined;
}

export const TemplateDetailActionButtons: React.FC<TemplateDetailActionButtonsProps> = ({
  relatedApp,
  starred,
  forking,
  forkedSuccess,
  copiedCli,
  onFork,
  onStar,
  onCopyCli,
  starring = false,
  onScan,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[220px]">
      {/* Primary Action: Fork / Use */}
      <button
        onClick={onFork}
        disabled={forking}
        className="w-full py-3 px-5 rounded-store-control bg-store-brand hover:bg-store-brand active:scale-[0.98] text-white font-medium text-sm shadow-lg shadow-store-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        {forkedSuccess ? (
          <>
            <Check className="w-4 h-4 text-store-success" />
            <span>{t('templates.detail.clonedSuccess')}</span>
          </>
        ) : (
          <>
            <GitFork className="w-4 h-4" />
            <span>{forking ? t('templates.detail.forking') : t('templates.detail.forkBtn')}</span>
          </>
        )}
      </button>

      {/* Scan action: the phone runs this app form, so the QR is the shortcut. */}
      {onScan ? (
        <button
          type="button"
          onClick={onScan}
          data-template-scan-action
          className="w-full py-2.5 px-4 rounded-store-control border border-store-brand/40 bg-store-brand/5 hover:bg-store-brand/10 text-store-brand font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>{t('templates.detail.scanAction')}</span>
        </button>
      ) : null}

      {/* Secondary Action: Go to Associated App Detail */}
      {relatedApp && (
        <Link
          to={`/app/${relatedApp.id}`}
          className="w-full py-3 px-5 rounded-store-card bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-all shadow-sm border border-store-line/60 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <LayoutGrid className="w-4 h-4 text-store-brand" />
          <span>{t('templates.card.appDetails')}</span>
          <ArrowRight className="w-4 h-4 text-store-ink-faint group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Quick Copy CLI */}
      <button
        onClick={onCopyCli}
        className="w-full py-2.5 px-4 rounded-store-control bg-store-subtle hover:bg-store-raised text-store-ink-soft font-medium text-xs transition-colors flex items-center justify-center gap-2 border border-store-line cursor-pointer "
      >
        {copiedCli ? (
          <>
            <Check className="w-3.5 h-3.5 text-store-success" />
            <span className="text-store-success ">{t('templates.detail.copiedCli')}</span>
          </>
        ) : (
          <>
            <Terminal className="w-3.5 h-3.5 text-store-brand" />
            <span>{t('templates.detail.copyCli')}</span>
          </>
        )}
      </button>

      {/* Star button */}
      <button
        onClick={onStar}
        disabled={starring}
        className={`w-full py-2.5 px-4 rounded-store-control border text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          starred
            ? 'bg-store-warning/10 border-store-warning/30 text-store-warning '
            : 'border-store-line text-store-ink-soft hover:bg-store-subtle '
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-400 text-store-warning' : ''}`} />
        <span>{starred ? t('templates.detail.starred') : t('templates.detail.starBtn')}</span>
      </button>
    </div>
  );
};
