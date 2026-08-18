import React from 'react';
import { useTranslation } from 'react-i18next';

export const SearchHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('search.header.title')}
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
        {t('search.header.subtitle', '全站搜索 AI 智能体、游戏与应用软件')}
      </p>
    </div>
  );
};
