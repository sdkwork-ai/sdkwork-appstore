import React from 'react';
import { useTranslation } from 'react-i18next';

export const SearchEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-center text-store-ink-faint ">
      <p className="text-xl font-bold mb-2 text-store-ink ">
        {t('search.empty.title')}
      </p>
      <p className="text-sm">{t('search.empty.description')}</p>
    </div>
  );
};
