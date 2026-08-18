import React from 'react';
import { useTranslation } from 'react-i18next';
import { Boxes, Star, ArrowRight } from 'lucide-react';
import { TemplateItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface TemplateDetailRecommendationsProps {
  templates: TemplateItem[];
  onSelect: (id: string) => void;
  onViewAll: () => void;
}

export const TemplateDetailRecommendations: React.FC<TemplateDetailRecommendationsProps> = ({
  templates,
  onSelect,
  onViewAll,
}) => {
  const { t } = useTranslation();

  if (!templates || templates.length === 0) return null;

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-500" />
          <span>{t('templates.detail.moreRecommended', '更多推荐开发模板')}</span>
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          {t('templates.detail.viewAllTemplates', '查看全部模板 →')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="p-5 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${
                    item.iconColor || 'bg-indigo-600'
                  } flex items-center justify-center text-white shrink-0`}
                >
                  <DynamicIcon name={item.icon || 'Boxes'} className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{item.framework}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#262933] flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium text-amber-500">
                <Star className="w-3 h-3 fill-amber-400" />
                {item.stars}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>{t('templates.card.details', '查看详情')}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
