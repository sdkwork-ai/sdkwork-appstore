import React from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import {
  PenTool,
  TrendingUp,
  Scale,
  Briefcase,
  ShoppingBag,
  BarChart2,
  FileText,
  Palette,
  Code2,
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { expertScenarios } from '../data/expertsData';

interface FeaturedScenariosSectionProps {
  selectedScenario: string | null;
  onSelectScenario: (scenarioTitle: string | null) => void;
  onSelectExpertByName?: (name: string) => void;
}

const scenarioIcons: Record<string, React.ElementType> = {
  PenTool,
  TrendingUp,
  Scale,
  Briefcase,
  ShoppingBag,
  BarChart2,
  FileText,
  Palette,
  Code2
};

const scenarioTitleKeyMap: Record<string, string> = {
  '内容创作': 'aihub.experts.scenarios.content',
  '投资分析': 'aihub.experts.scenarios.invest',
  '法律咨询': 'aihub.experts.scenarios.legal',
  '小微企业': 'aihub.experts.scenarios.business',
  '电商运营': 'aihub.experts.scenarios.ecom',
  '数据分析': 'aihub.experts.scenarios.data',
  '专业文档': 'aihub.experts.scenarios.doc',
  '产品设计': 'aihub.experts.scenarios.design',
  '工程开发': 'aihub.experts.scenarios.dev',
};

export const FeaturedScenariosSection: React.FC<FeaturedScenariosSectionProps> = ({
  selectedScenario,
  onSelectScenario,
  onSelectExpertByName
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t('aihub.experts.featuredScenarios')}</span>
        </h3>
        {selectedScenario && (
          <button
            type="button"
            onClick={() => onSelectScenario(null)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            {t('common.actions.clear')}
          </button>
        )}
      </div>

      {/* Grid / Horizontal Deck of Scenario Cards */}
      <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @5xl:grid-cols-4 gap-3.5">
        {expertScenarios.map((scen) => {
          const IconComp = scenarioIcons[scen.icon] || Sparkles;
          const isSelected = selectedScenario === scen.title;
          const scenarioTitle = t(scenarioTitleKeyMap[scen.title] ?? '', scen.title);

          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(isSelected ? null : scen.title)}
              className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'bg-slate-800/95 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Header of Scenario Card */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${scen.color} border border-slate-700/50 shadow-inner`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {scenarioTitle}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {t('aihub.experts.scenarioExpertCount', { count: scen.expertCount })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* List of 3 Featured Experts in this scenario */}
              <div className="space-y-1.5">
                {scen.featuredExperts.map((exp, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      if (onSelectExpertByName) {
                        e.stopPropagation();
                        onSelectExpertByName(exp.name);
                      }
                    }}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-800/90 transition-colors text-xs text-slate-300 hover:text-white group/item"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 shrink-0">
                      {exp.name.slice(0, 1)}
                    </div>
                    <span className="truncate font-medium flex-1">{exp.name}</span>
                    {exp.nickname && (
                      <span className="text-[10px] text-slate-500 group-hover/item:text-slate-400 truncate max-w-[80px]">
                        {exp.nickname}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
