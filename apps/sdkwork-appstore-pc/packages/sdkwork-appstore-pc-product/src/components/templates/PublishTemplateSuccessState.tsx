import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const PublishTemplateSuccessState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-12 text-center space-y-3">
      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
      <h3 className="text-lg font-bold">{t('templates.success.title')}</h3>
      <p className="text-xs text-gray-400">{t('templates.success.subtitle')}</p>
    </div>
  );
};

