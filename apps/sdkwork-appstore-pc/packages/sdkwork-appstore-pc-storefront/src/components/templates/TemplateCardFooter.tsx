import React from 'react';
import { Star, GitFork, ArrowUpRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateCardFooterProps {
  stars: number;
  forks: number;
  onAppDetailClick?: (e: React.MouseEvent) => void;
}

export const TemplateCardFooter: React.FC<TemplateCardFooterProps> = ({
  stars,
  forks,
  onAppDetailClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-store-line-soft ">
      <div className="flex items-center gap-3 text-xs text-store-ink-faint font-medium">
        <span className="flex items-center gap-1 text-store-warning font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          {stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {forks}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onAppDetailClick) onAppDetailClick(e);
          }}
          className="px-3 py-1.5 rounded-store-control bg-store-brand hover:bg-store-brand text-white text-xs font-medium transition-all shadow-sm cursor-pointer flex items-center gap-1"
          title={t('templates.card.appDetails')}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-white" />
          <span>{t('templates.card.appDetails')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


