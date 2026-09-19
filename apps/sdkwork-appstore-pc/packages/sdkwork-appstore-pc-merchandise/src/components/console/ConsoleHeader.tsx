import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders } from 'lucide-react';

export const ConsoleHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#22252e]">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-500" />
          {t('console.header.title')}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {t('console.header.subtitle')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Tenant: SDKWork Global Dev
        </span>
      </div>
    </div>
  );
};

