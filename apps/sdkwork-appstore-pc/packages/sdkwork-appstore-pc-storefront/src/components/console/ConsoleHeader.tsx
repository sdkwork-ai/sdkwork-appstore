import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders } from 'lucide-react';

interface ConsoleHeaderProps {
  /** Tenant resolved from the live session snapshot; hidden when absent. */
  tenantLabel?: string;
}

export const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({ tenantLabel }) => {
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
      {tenantLabel ? (
        <div className="flex items-center gap-2">
          <span
            title={tenantLabel}
            className="max-w-[16rem] truncate px-2.5 py-0.5 rounded-full text-xs font-medium bg-store-success/10 text-store-success border border-store-success/20"
          >
            {t('console.header.tenantBadge', '租户：{{tenant}}', { tenant: tenantLabel })}
          </span>
        </div>
      ) : null}
    </div>
  );
};
