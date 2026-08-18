import React from 'react';
import { DynamicIcon } from '../DynamicIcon';

interface ScreenshotItemProps {
  gradient: string;
  icon: string;
  index: number;
}

export const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  gradient,
  icon,
  index,
}) => {
  return (
    <div
      className={`w-64 h-56 shrink-0 rounded-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden snap-center ${gradient}`}
    >
      <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center text-white/90 text-sm font-medium p-4 text-center backdrop-blur-sm bg-black/10">
        <DynamicIcon name={icon} className="w-8 h-8 text-white/70 mb-2" />
        Preview Screen {index + 1}
      </div>
    </div>
  );
};
