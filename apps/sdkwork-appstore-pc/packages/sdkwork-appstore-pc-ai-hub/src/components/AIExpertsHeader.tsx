import React from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import { Search, UserCheck, Bot, Plug, Sparkles } from 'lucide-react';
import { AddDropdown, type AddDropdownItem } from '@sdkwork/appstore-pc-commons';

interface AIExpertsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showOnlyMine: boolean;
  onToggleShowMine: () => void;
  /** Open the "register custom OpenAPI plugin" modal (reused from the marketplace). */
  onOpenRegisterPlugin: () => void;
  /** Open the "create & publish Agent Skill" modal (reused from the marketplace). */
  onOpenPublishSkill: () => void;
  /** Open the AI Hub's own "create custom expert" modal. */
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
  onOpenRegisterPlugin,
  onOpenPublishSkill,
  onOpenCustomModal,
  selectedTag,
  onSelectTag,
  totalCount
}) => {
  const { t } = useI18n();

  // The marketplace-style add dropdown: the same trigger + caret + floating
  // menu design as the marketplace's Plugins/Skills add affordance, with the
  // marketplace pages' own button copy as the item titles.
  const addItems: AddDropdownItem[] = [
    {
      key: 'custom-expert',
      icon: Bot,
      title: t('experts.add.customExpert.title'),
      desc: t('experts.add.customExpert.desc'),
      onSelect: onOpenCustomModal,
    },
    {
      key: 'register-plugin',
      icon: Plug,
      title: t('plugins.header.registerBtn'),
      desc: t('experts.add.plugin.desc'),
      onSelect: onOpenRegisterPlugin,
    },
    {
      key: 'publish-skill',
      icon: Sparkles,
      title: t('skills.header.createBtn'),
      desc: t('experts.add.skill.desc'),
      onSelect: onOpenPublishSkill,
    },
  ];

  return (
    <div className="bg-slate-900 border border-store-line rounded-store-card p-5 md:p-6 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-store-line">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-brand/10 text-store-brand border border-store-brand/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t('aihub.experts.rosterTitle')}
            </span>
            <span className="text-xs text-store-ink-faint">
              {t('aihub.experts.scenarioCount', { count: totalCount })}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {t('aihub.experts.rosterTitle')}
          </h2>
          <p className="text-sm text-store-ink-faint mt-1">
            {t('aihub.experts.rosterSubtitle')}
          </p>
        </div>

        {/* Header Right Actions & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-store-ink-faint" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('aihub.experts.searchPlaceholder')}
              className="w-full bg-store-field text-sm text-store-ink placeholder:text-store-ink-faint pl-9 pr-4 rounded-store-control border border-store-line focus:outline-none focus:border-store-brand transition-colors h-9 outline-none focus:ring-2 focus:ring-store-brand/25"
            />
          </div>

          {/* My Experts toggle */}
          <button
            type="button"
            onClick={onToggleShowMine}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-store-control text-xs font-medium transition-colors border ${
              showOnlyMine
                ? 'bg-store-brand border-store-brand text-white'
                : 'bg-slate-800/80 hover:bg-slate-800 border-store-line/80 text-slate-300 hover:text-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('aihub.experts.myExperts')}</span>
          </button>

          {/* Add dropdown — replaces the standalone Custom Expert button */}
          <AddDropdown
            label={t('experts.add.label')}
            ariaLabel={t('experts.add.aria')}
            items={addItems}
            triggerClassName="bg-store-brand hover:bg-store-brand text-white"
          />
        </div>
      </div>
    </div>
  );
};
