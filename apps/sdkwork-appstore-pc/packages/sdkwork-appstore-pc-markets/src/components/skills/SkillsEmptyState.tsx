import React from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SkillsEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16 text-center text-gray-400 bg-white dark:bg-[#181a20] rounded-3xl border border-dashed border-gray-200 dark:border-[#282c38]">
      <Zap className="w-10 h-10 mx-auto mb-2 opacity-40" />
      <p className="text-sm font-medium">{t('skills.empty.title')}</p>
      <p className="text-xs text-gray-500 mt-1">{t('skills.empty.subtitle')}</p>
    </div>
  );
};
