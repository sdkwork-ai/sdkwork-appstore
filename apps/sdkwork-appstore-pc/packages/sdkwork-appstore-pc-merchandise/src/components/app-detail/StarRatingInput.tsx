import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
}

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  maxStars = 5,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const starsArray = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className="flex gap-1 text-gray-300 dark:text-gray-600">
      {starsArray.map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-0.5 focus:outline-none cursor-pointer"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hoverRating || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};
