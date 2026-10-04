import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../lib/utils';

interface RatingBreakdownProps {
  rating: number;
  reviewsCount: number;
  ratingBreakdown?: number[];
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  rating,
  reviewsCount,
  ratingBreakdown,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-6 mb-8 max-w-xl">
      <div className="flex flex-col items-center shrink-0">
        <span className="text-5xl md:text-6xl font-extrabold tracking-tighter text-store-ink ">
          {rating.toFixed(1)}
        </span>
        <span className="text-xs font-bold text-store-ink-faint mt-1 ">{t('appDetail.reviews.outOf')}</span>
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star, idx) => {
          const percentage = ratingBreakdown
            ? ratingBreakdown[idx]
            : star === Math.round(rating)
            ? 80
            : 5;
          return (
            <div key={star} className="flex items-center gap-2 group">
              <div className="flex items-center justify-end w-8 gap-1 shrink-0">
                <span className="text-xs font-bold text-store-ink-faint group-hover:text-store-ink-soft transition-colors  ">
                  {star}
                </span>
                <span className="text-[10px] text-store-warning">★</span>
              </div>
              <div className="flex-1 h-2 bg-store-raised rounded-full overflow-hidden relative ">
                <div
                  className="absolute left-0 top-0 h-full bg-store-surface rounded-full transition-all duration-1000 ease-out "
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="text-right text-xs text-store-ink-faint font-medium mt-1 pr-1 ">
          {t('appDetail.reviews.totalReviews', { count: formatNumber(reviewsCount) })}
        </div>
      </div>
    </div>
  );
};

