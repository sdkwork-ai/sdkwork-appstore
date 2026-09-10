import React, { useState, useMemo } from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ExpertItem } from '@sdkwork/appstore-pc-core';
import { ExpertCard } from './ExpertCard';

interface AIExpertsRosterProps {
  experts: ExpertItem[];
  myExpertIds: string[];
  onToggleMyExpert: (expertId: string, e?: React.MouseEvent) => void;
  onSelectExpert: (expert: ExpertItem) => void;
  onOpenSandboxChat: (expert: ExpertItem, e: React.MouseEvent) => void;
  searchQuery: string;
  showOnlyMine: boolean;
  selectedScenario: string | null;
}

const FILTER_TAG_KEYS: Array<{ value: string; key: string }> = [
  { value: '全部', key: 'aihub.experts.filterTags.all' },
  { value: 'OPC:一人公司', key: 'aihub.experts.filterTags.opc' },
  { value: '腾讯专家', key: 'aihub.experts.filterTags.tencent' },
  { value: '产品设计', key: 'aihub.experts.filterTags.productDesign' },
  { value: '技术工程', key: 'aihub.experts.filterTags.engineering' },
  { value: '金融投资', key: 'aihub.experts.filterTags.finance' },
  { value: '全球发展', key: 'aihub.experts.filterTags.globalDev' },
  { value: '教育学习', key: 'aihub.experts.filterTags.education' },
  { value: '游戏空间', key: 'aihub.experts.filterTags.gaming' },
  { value: '数据智能', key: 'aihub.experts.filterTags.dataIntelligence' },
  { value: '营销增长', key: 'aihub.experts.filterTags.marketing' },
  { value: '内容创作', key: 'aihub.experts.filterTags.contentCreation' },
  { value: '销售商务', key: 'aihub.experts.filterTags.salesBiz' },
  { value: '运营人力', key: 'aihub.experts.filterTags.operations' },
  { value: '项目质量', key: 'aihub.experts.filterTags.quality' },
  { value: '法务安全', key: 'aihub.experts.filterTags.legalSecurity' },
  { value: '行业顾问', key: 'aihub.experts.filterTags.consultant' },
];

const ALL_TAG_VALUE = '全部';

type SortType = 'comprehensive' | 'hottest' | 'newest';

export const AIExpertsRoster: React.FC<AIExpertsRosterProps> = ({
  experts,
  myExpertIds,
  onToggleMyExpert,
  onSelectExpert,
  onOpenSandboxChat,
  searchQuery,
  showOnlyMine,
  selectedScenario
}) => {
  const { t } = useI18n();
  const [selectedTag, setSelectedTag] = useState<string>(ALL_TAG_VALUE);
  const [sortType, setSortType] = useState<SortType>('comprehensive');

  const filteredExperts = useMemo(() => {
    return experts.filter((exp) => {
      if (showOnlyMine && !myExpertIds.includes(exp.id)) {
        return false;
      }

      if (selectedScenario && exp.scenarioCategory !== selectedScenario) {
        return false;
      }

      if (selectedTag !== ALL_TAG_VALUE && exp.filterTag !== selectedTag && !exp.tags.includes(selectedTag)) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = exp.name.toLowerCase().includes(q);
        const matchNickname = exp.nickname.toLowerCase().includes(q);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchTag = exp.tags.some((tg) => tg.toLowerCase().includes(q));
        if (!matchName && !matchNickname && !matchDesc && !matchTag) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortType === 'hottest') {
        return b.popularity - a.popularity;
      }
      if (sortType === 'newest') {
        return b.rating - a.rating;
      }
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.popularity - a.popularity;
    });
  }, [experts, myExpertIds, showOnlyMine, selectedScenario, selectedTag, searchQuery, sortType]);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>{t('aihub.experts.rosterTitle')}</span>
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
            {t('aihub.experts.rosterCount', { count: filteredExperts.length })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setSortType('comprehensive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortType === 'comprehensive'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('aihub.experts.sort.comprehensive')}
          </button>
          <button
            type="button"
            onClick={() => setSortType('hottest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortType === 'hottest'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('aihub.experts.sort.hottest')}
          </button>
          <button
            type="button"
            onClick={() => setSortType('newest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sortType === 'newest'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('aihub.experts.sort.newest')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-medium border-b border-slate-800/80">
        {FILTER_TAG_KEYS.map(({ value, key }) => {
          const active = selectedTag === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedTag(value)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all border shrink-0 ${
                active
                  ? 'bg-slate-100 text-slate-900 border-white font-bold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t(key)}
            </button>
          );
        })}
      </div>

      {filteredExperts.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-slate-400 text-sm">{t('common.noData')}</p>
          <button
            type="button"
            onClick={() => {
              setSelectedTag(ALL_TAG_VALUE);
            }}
            className="text-xs text-indigo-400 hover:underline"
          >
            {t('aihub.experts.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4 gap-4">
          {filteredExperts.map((exp) => (
            <ExpertCard
              key={exp.id}
              expert={exp}
              isMyExpert={myExpertIds.includes(exp.id)}
              onToggleMyExpert={onToggleMyExpert}
              onClickCard={onSelectExpert}
              onOpenSandboxChat={onOpenSandboxChat}
            />
          ))}
        </div>
      )}
    </div>
  );
};
