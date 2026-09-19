import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeroCarouselControlsProps {
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const HeroCarouselControls: React.FC<HeroCarouselControlsProps> = ({
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-black/50 transition-colors cursor-pointer"
        aria-label={t('common.accessibility.previousSlide')}
      >
        <ChevronLeft className="w-5 h-5 pr-0.5" />
      </button>
      <button
        onClick={onNext}
        className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-black/50 transition-colors cursor-pointer"
        aria-label={t('common.accessibility.nextSlide')}
      >
        <ChevronRight className="w-5 h-5 pl-0.5" />
      </button>
    </div>
  );
};
