import React from 'react';
import { Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ExpertsEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 text-center text-store-ink-faint bg-store-surface rounded-store-card border border-dashed border-store-line ">
      <Bot className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm font-medium">{t('experts.empty.title')}</p>
      <p className="text-xs text-store-ink-faint mt-1">{t('experts.empty.subtitle')}</p>
    </div>
  );
};
