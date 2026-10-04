import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstallModalProgressProps {
  progress: number;
}

export const InstallModalProgress: React.FC<InstallModalProgressProps> = ({ progress }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full py-2">
      <div className="flex justify-between text-xs font-bold text-store-ink-faint mb-2 ">
        <span>{t('common.actions.downloading')}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-store-raised rounded-full overflow-hidden ">
        <div
          className="h-full bg-store-brand transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
