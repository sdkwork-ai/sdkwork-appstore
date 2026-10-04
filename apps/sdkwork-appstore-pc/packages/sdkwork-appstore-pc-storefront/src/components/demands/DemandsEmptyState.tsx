import React from 'react';
import { Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const DemandsEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-20 text-center">
      <Megaphone className="w-14 h-14 mx-auto text-store-ink-faint/50" />
      <p className="mt-4 text-xs text-store-ink-faint">{t('demands.empty')}</p>
    </div>
  );
};
