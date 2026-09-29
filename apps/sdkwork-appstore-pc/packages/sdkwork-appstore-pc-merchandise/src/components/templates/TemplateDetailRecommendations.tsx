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
        <h3 className="text-lg font-bold text-store-ink flex items-center gap-2 ">
          <Boxes className="w-5 h-5 text-store-brand" />
          <span>{t('templates.detail.moreRecommended', '更多推荐开发模板')}</span>
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-store-brand hover:underline cursor-pointer "
        >
          {t('templates.detail.viewAllTemplates', '查看全部模板 →')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="p-5 rounded-store-card bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between "
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-store-control ${
                    item.iconColor || 'bg-store-brand'
                  } flex items-center justify-center text-white shrink-0`}
                >
                  <DynamicIcon name={item.icon || 'Boxes'} className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-store-ink truncate group-hover:text-store-brand transition-colors  ">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-store-ink-faint truncate">{item.framework}</p>
                </div>
              </div>
              <p className="text-xs text-store-ink-soft line-clamp-2 ">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-store-line-soft flex items-center justify-between text-xs text-store-ink-faint ">
              <span className="flex items-center gap-1 font-medium text-store-warning">
                <Star className="w-3 h-3 fill-amber-400" />
                {item.stars}
              </span>
              <span className="text-store-brand font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ">
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
