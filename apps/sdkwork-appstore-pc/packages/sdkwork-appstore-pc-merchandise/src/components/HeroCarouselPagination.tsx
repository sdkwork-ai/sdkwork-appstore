import React from 'react';

interface HeroCarouselPaginationProps {
  total: number;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export const HeroCarouselPagination: React.FC<HeroCarouselPaginationProps> = ({
  total,
  currentIndex,
  onSelect,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
      {Array.from({ length: total }).map((_, idx) => (
        <button 
          key={idx}
          onClick={() => onSelect(idx)}
          className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
            idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
          }`}
          aria-label={`Go to slide ${idx + 1}`}
        />
      ))}
    </div>
  );
};
