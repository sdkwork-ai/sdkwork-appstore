import React from 'react';
import { Link } from 'react-router-dom';
import { GitFork, Check, LayoutGrid, ArrowRight, Terminal, Star } from 'lucide-react';
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
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[220px]">
      {/* Primary Action: Fork / Use */}
      <button
        onClick={onFork}
        disabled={forking}
        className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
      >
        {forkedSuccess ? (
          <>
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{t('templates.detail.clonedSuccess')}</span>
          </>
        ) : (
          <>
            <GitFork className="w-4 h-4" />
            <span>{forking ? t('templates.detail.forking') : t('templates.detail.forkBtn')}</span>
          </>
        )}
      </button>

      {/* Secondary Action: Go to Associated App Detail */}
      {relatedApp && (
        <Link
          to={`/app/${relatedApp.id}`}
          className="w-full py-3 px-5 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm transition-all shadow-sm border border-slate-700/60 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <span>{t('templates.card.appDetails')}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Quick Copy CLI */}
      <button
        onClick={onCopyCli}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#20232d] hover:bg-slate-200 dark:hover:bg-[#282c38] text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 cursor-pointer"
      >
        {copiedCli ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">{t('templates.detail.copiedCli')}</span>
          </>
        ) : (
          <>
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('templates.detail.copyCli')}</span>
          </>
        )}
      </button>

      {/* Star button */}
      <button
        onClick={onStar}
        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
          starred
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#20232d]'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-400 text-amber-500' : ''}`} />
        <span>{starred ? t('templates.detail.starred') : t('templates.detail.starBtn')}</span>
      </button>
    </div>
  );
};
