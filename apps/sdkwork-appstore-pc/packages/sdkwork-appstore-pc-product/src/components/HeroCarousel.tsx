import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, wrap } from 'motion/react';
import { EditorialCollection, AppItem } from '../types';
import { useInstall } from '../providers/InstallProvider';
import { HeroCarouselAppItem } from './HeroCarouselAppItem';
import { HeroCarouselControls } from './HeroCarouselControls';
import { HeroCarouselPagination } from './HeroCarouselPagination';

interface HeroCarouselProps {
  collections: EditorialCollection[];
  apps: AppItem[];
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function HeroCarousel({ collections, apps }: HeroCarouselProps) {
  const { t } = useTranslation();
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const { installApp } = useInstall();

  // We only have a few collections, so wrap the index
  const currentIndex = wrap(0, collections.length, page);

  const paginate = useCallback((newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  }, [page]);

  useEffect(() => {
    if (isHovered || collections.length <= 1) return;
    const interval = setInterval(() => paginate(1), 5000);
    return () => clearInterval(interval);
  }, [isHovered, paginate, collections.length]);

  if (!collections.length) return null;

  const currentCollection = collections[currentIndex];
  const collectionApps = apps.filter(app => currentCollection.apps.includes(app.id)).slice(0, 3);

  return (
    <section 
      className="relative w-full rounded-2xl overflow-hidden group touch-pan-y"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <div className="relative w-full h-[360px] md:h-[340px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className={`absolute w-full h-full p-6 text-white rounded-2xl flex flex-col justify-between ${currentCollection.bannerColor}`}
          >
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{t('discover.sections.featuredToday', 'Featured')}</p>
                <h4 className="text-2xl font-bold mb-2">{currentCollection.title}</h4>
                <p className="text-sm opacity-90 leading-snug">{currentCollection.subtitle}</p>
                
                {currentCollection.ctaText && (
                  <button className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors pointer-events-auto">
                    {currentCollection.ctaText}
                  </button>
                )}
              </div>
              
              <div className="relative z-10 mt-6 space-y-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700 pointer-events-auto">
                {collectionApps.map(app => (
                  <HeroCarouselAppItem key={app.id} app={app} onInstall={installApp} />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation Controls Sub-component */}
      <HeroCarouselControls
        onPrev={(e) => { e.preventDefault(); paginate(-1); }}
        onNext={(e) => { e.preventDefault(); paginate(1); }}
      />

      {/* Pagination indicators Sub-component */}
      <HeroCarouselPagination
        total={collections.length}
        currentIndex={currentIndex}
        onSelect={(idx) => setPage([page + (idx - currentIndex), idx - currentIndex])}
      />
    </section>
  );
}
