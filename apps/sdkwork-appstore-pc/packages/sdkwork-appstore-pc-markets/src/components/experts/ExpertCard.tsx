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
      className="group w-full h-full bg-store-surface border border-store-line/80 dark:border-store-line hover:border-store-brand/50 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between "
    >
      <div>
        {/* Subcomponent: Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-store-control flex items-center justify-center bg-store-brand/10 text-store-brand dark:bg-store-brand/20 shrink-0 ">
              <DynamicIcon name={expert.avatarIcon || 'Bot'} className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-store-ink group-hover:text-store-brand transition-colors truncate ">
                  {expert.name}
                </h3>
                {expert.isOfficial && (
                  <CheckCircle2 className="w-4 h-4 text-store-brand shrink-0" />
                )}
              </div>
              <p className="text-xs text-store-ink-faint truncate mt-0.5">
                {expert.nickname} · {expert.filterTag}
              </p>
            </div>
          </div>
          {expert.badge && (
            <span className="shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand ">
              {expert.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-store-ink-soft mt-3 line-clamp-2 leading-relaxed ">
          {expert.description}
        </p>

        {/* Subcomponent: Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {expert.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft "
            >
              {tag}
            </span>
          ))}
          {expert.tags.length > 3 && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-faint ">
              +{expert.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Subcomponent: Footer Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line-soft ">
        <div className="flex items-center gap-2 text-xs text-store-ink-faint font-medium">
          <span className="flex items-center gap-1 text-store-warning font-semibold">
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
            className="px-3 py-1.5 rounded-store-control bg-store-brand hover:bg-store-brand text-white text-xs font-medium transition-all shadow-sm cursor-pointer flex items-center gap-1"
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
