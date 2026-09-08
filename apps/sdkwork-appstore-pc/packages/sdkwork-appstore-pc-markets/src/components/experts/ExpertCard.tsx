import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExpertItem } from '@sdkwork/appstore-pc-core';
import { DynamicIcon } from '@sdkwork/appstore-pc-commons';

interface ExpertCardProps {
  expert: ExpertItem;
  onSelect?: (expert: ExpertItem) => void;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onSelect }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleOpenInLab = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate('/ai-hub');
    if (onSelect) onSelect(expert);
  };

  return (
    <div
      onClick={handleOpenInLab}
      className="group w-full h-full bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-blue-500/50 dark:hover:border-blue-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
    >
      <div>
        {/* Subcomponent: Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
              <DynamicIcon name={expert.avatarIcon || 'Bot'} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors truncate">
                  {expert.name}
                </h3>
                {expert.isOfficial && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {expert.nickname} · {expert.filterTag}
              </p>
            </div>
          </div>
          {expert.badge && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {expert.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
          {expert.description}
        </p>

        {/* Subcomponent: Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {expert.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-[#222530] text-gray-600 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {expert.tags.length > 3 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-[#222530] text-gray-400">
              +{expert.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Subcomponent: Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222530]">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            {expert.rating.toFixed(1)}
          </span>
          <span>·</span>
          <span>{t('experts.card.popularity', { count: expert.popularity })}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInLab(e);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
            title={t('experts.card.tryInLab')}
          >
            <span>{t('experts.card.tryInLab')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
