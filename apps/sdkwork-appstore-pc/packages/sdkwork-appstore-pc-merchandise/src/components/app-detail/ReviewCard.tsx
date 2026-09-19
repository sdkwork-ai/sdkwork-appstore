import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThumbsUp } from 'lucide-react';
import { Review } from '../../types';
import { AppStoreService } from '../../services/api';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState(review.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await AppStoreService.likeReview(review.id);
    } catch (e) {
      console.error('Failed to like review:', e);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1C1C1E] p-4 md:p-5 rounded-2xl border border-gray-100 dark:border-[#2C2C2E] flex flex-col justify-between transition-colors space-y-2">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold truncate pr-2 text-[#1C1C1E] dark:text-[#F5F5F5]">
            {review.title}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold shrink-0">
            {review.date}
          </span>
        </div>
        <div className="text-yellow-400 text-xs mb-1.5 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {review.comment}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-gray-200/50 dark:border-gray-800 text-[11px] text-gray-400">
        <span>{t('appDetail.reviews.userLabel', { user: review.user })}</span>
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            liked
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
              : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          <span>{likes > 0 ? likes : t('appDetail.reviews.helpful', '有用')}</span>
        </button>
      </div>
    </div>
  );
};

