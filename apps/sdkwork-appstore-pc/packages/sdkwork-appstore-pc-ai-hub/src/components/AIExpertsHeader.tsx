import React from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import { Search, UserCheck, Plus, Sparkles } from 'lucide-react';

interface AIExpertsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showOnlyMine: boolean;
  onToggleShowMine: () => void;
  onOpenCustomModal: () => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  totalCount: number;
}

export const AIExpertsHeader: React.FC<AIExpertsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  showOnlyMine,
  onToggleShowMine,
  onOpenCustomModal,
  selectedTag,
  onSelectTag,
  totalCount
}) => {
  const { t } = useI18n();

  return (
    <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 md:p-6 text-slate-900 dark:text-white shadow-xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {t('aihub.experts.rosterTitle')}
            </span>
            <span className="text-xs text-slate-400">
              {t('aihub.experts.scenarioCount', { count: totalCount })}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {t('aihub.experts.rosterTitle')}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {t('aihub.experts.rosterSubtitle')}
          </p>
        </div>

        {/* Header Right Actions & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('aihub.experts.searchPlaceholder')}
              className="w-full bg-slate-800/90 text-sm text-slate-100 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-slate-700/70 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* My Experts button */}
          <button
            type="button"
            onClick={onToggleShowMine}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
              showOnlyMine
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('aihub.experts.myExperts')}</span>
          </button>

          {/* Custom Expert button */}
          <button
            type="button"
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-500/20 transition-all border border-indigo-400/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('aihub.experts.customExpert')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
