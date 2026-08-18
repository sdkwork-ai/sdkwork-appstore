import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';

export const ChartsEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
      <div className="p-4 rounded-full bg-gray-100 dark:bg-[#20232d] text-gray-400">
        <BarChart3 className="w-8 h-8" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {t('common.status.empty', '暂无排行数据')}
      </p>
    </div>
  );
};
