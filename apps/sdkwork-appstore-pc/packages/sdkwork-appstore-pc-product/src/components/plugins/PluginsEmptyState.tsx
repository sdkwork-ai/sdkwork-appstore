import React from 'react';
import { Plug } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PluginsEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 text-center text-gray-400 bg-white dark:bg-[#181a20] rounded-3xl border border-dashed border-gray-200 dark:border-[#282c38]">
      <Plug className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm font-medium">{t('plugins.empty.title')}</p>
      <p className="text-xs text-gray-500 mt-1">{t('plugins.empty.subtitle')}</p>
    </div>
  );
};
