import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, CheckCircle2, Flame, ArrowUpRight } from 'lucide-react';
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
      className="group bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Subcomponent: Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${expert.avatarBg}`}>
              <DynamicIcon name={expert.avatarIcon || 'Bot'} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-500 transition-colors truncate">
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
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-semibold">
              {expert.badge}
            </span>
          )}
        </div>

        {/* Subcomponent: Expert Showcase Banner */}
        <div className={`relative rounded-xl overflow-hidden border border-white/10 shadow-sm my-3 h-28 bg-gradient-to-br ${expert.avatarBg}`}>
          <div className="absolute inset-0 bg-black/20" />
          <DynamicIcon
            name={expert.avatarIcon || 'Bot'}
            className="absolute -right-4 -bottom-5 w-28 h-28 text-white opacity-20 pointer-events-none"
          />
          <div className="relative z-10 h-full flex flex-col justify-between p-3 text-white">
            <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-medium w-fit">
              {expert.scenarioCategory}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold">
              <Flame className="w-3 h-3 text-amber-300" />
              <span>{t('experts.card.popularity', { count: expert.popularity })}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
          {expert.description}
        </p>

        {/* Subcomponent: Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {expert.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Subcomponent: Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222530]">
        <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            {expert.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInLab(e);
            }}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1"
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
