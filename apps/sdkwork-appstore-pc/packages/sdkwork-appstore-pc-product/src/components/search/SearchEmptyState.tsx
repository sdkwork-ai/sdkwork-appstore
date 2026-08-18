import React from 'react';
import { useTranslation } from 'react-i18next';

export const SearchEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-center text-gray-500 dark:text-gray-400">
      <p className="text-xl font-bold mb-2 text-[#1C1C1E] dark:text-[#F5F5F5]">
        {t('search.empty.title')}
      </p>
      <p className="text-sm">{t('search.empty.description')}</p>
    </div>
  );
};
