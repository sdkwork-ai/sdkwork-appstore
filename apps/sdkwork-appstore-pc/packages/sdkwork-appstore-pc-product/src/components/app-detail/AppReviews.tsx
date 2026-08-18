import { useState, useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Review } from '../../types';
import { ReviewForm } from './ReviewForm';
import { RatingBreakdown } from './RatingBreakdown';
import { ReviewCard } from './ReviewCard';

interface AppReviewsProps {
  appId?: string;
  rating: number;
  reviewsCount: number;
  ratingBreakdown?: number[];
  reviews: Review[];
  onReviewSubmitted?: (newReview: Review) => void;
}

export function AppReviews({
  appId,
  rating,
  reviewsCount,
  ratingBreakdown,
  reviews: initialReviews,
  onReviewSubmitted,
}: AppReviewsProps) {
  const { t } = useTranslation();
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    setReviewsList(initialReviews);
  }, [initialReviews]);

  const handleNewReview = (newReview: Review) => {
    setReviewsList((prev) => [newReview, ...prev]);
    if (onReviewSubmitted) {
      onReviewSubmitted(newReview);
    }
  };

  return (
    <div className="flex-1 flex flex-col mb-10 pt-8 border-t border-gray-100 dark:border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-extrabold text-[#1C1C1E] dark:text-[#F5F5F5]">
          {t('appDetail.reviews.title')}
        </h3>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showReviewForm ? t('appDetail.reviews.cancelReview') : t('appDetail.reviews.writeReview')}</span>
        </button>
      </div>

      {/* Interactive Review Form Component */}
      {showReviewForm && (
        <ReviewForm
          appId={appId}
          onReviewSubmitted={handleNewReview}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      {/* Rating Breakdown Header Component */}
      <RatingBreakdown
        rating={rating}
        reviewsCount={reviewsCount}
        ratingBreakdown={ratingBreakdown}
      />

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviewsList.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}

        {reviewsList.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center text-gray-500 dark:text-gray-400 py-8">
            {t('appDetail.reviews.noReviews')}
          </div>
        )}
      </div>
    </div>
  );
}

