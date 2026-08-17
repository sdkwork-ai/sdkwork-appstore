import React, { useState } from 'react';
import { Send, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppStoreService } from '../../services/api';
import { Review } from '../../types';
import { StarRatingInput } from './StarRatingInput';

interface ReviewFormProps {
  appId?: string;
  onReviewSubmitted?: (newReview: Review) => void;
  onClose: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  appId,
  onReviewSubmitted,
  onClose,
}) => {
  const { t } = useTranslation();
  const [userRating, setUserRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!appId) {
      setSubmitError(t('appDetail.reviews.missingAppId'));
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newReview = await AppStoreService.submitReview({
        appId,
        user: userName.trim() || t('appDetail.reviews.defaultUser'),
        rating: userRating,
        title: title.trim() || t('appDetail.reviews.defaultTitle'),
        comment: comment.trim(),
      });

      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
        setTitle('');
        setComment('');
      }, 1500);
    } catch (err) {
      console.error('提交评价失败', err);
      setSubmitError(err instanceof Error ? err.message : t('appDetail.reviews.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-5 bg-gray-50 dark:bg-[#181a20] rounded-2xl border border-gray-200 dark:border-[#22252e] space-y-4 animate-fadeIn"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {t('appDetail.reviews.formTitle')}
        </h4>
        <StarRatingInput
          value={userRating}
          onChange={setUserRating}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder={t('appDetail.reviews.namePlaceholder')}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#22252e] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder={t('appDetail.reviews.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#22252e] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <textarea
        rows={3}
        required
        placeholder={t('appDetail.reviews.commentPlaceholder')}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#22252e] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500"
      />

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          {submitSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{t('appDetail.reviews.submitSuccess')}</span>
            </>
          ) : isSubmitting ? (
            <span>{t('appDetail.reviews.submitting')}</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>{t('appDetail.reviews.submitBtn')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

