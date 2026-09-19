import React from 'react';
import { ScreenshotItem } from './ScreenshotItem';

interface AppScreenshotsProps {
  screenshots: string[];
  icon: string;
}

export const AppScreenshots: React.FC<AppScreenshotsProps> = ({ screenshots, icon }) => {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide snap-x">
      {screenshots.map((gradient, idx) => (
        <ScreenshotItem key={idx} gradient={gradient} icon={icon} index={idx} />
      ))}
    </div>
  );
};

