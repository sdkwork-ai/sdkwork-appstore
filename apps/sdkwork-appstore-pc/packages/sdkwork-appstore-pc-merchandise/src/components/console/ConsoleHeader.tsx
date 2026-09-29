import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders } from 'lucide-react';

export const ConsoleHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pb-4 border-b border-store-line ">
      <div>
        <h1 className="text-xl font-bold text-store-ink flex items-center gap-2 ">
          <Sliders className="w-5 h-5 text-store-brand" />
          {t('console.header.title')}
        </h1>
        <p className="text-xs text-store-ink-faint mt-0.5">
          {t('console.header.subtitle')}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-success/10 text-store-success border border-store-success/20">
          Tenant: SDKWork Global Dev
        </span>
      </div>
    </div>
  );
};

