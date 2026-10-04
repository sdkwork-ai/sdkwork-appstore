import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { changeLanguage } from '../../i18n';

export const HeaderLanguageToggle: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'zh-CN';
  const isZh = currentLang.startsWith('zh');

  const toggleLanguage = () => {
    const nextLang = isZh ? 'en' : 'zh-CN';
    changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-2 xl:px-2.5 py-1.5 rounded-store-control text-xs font-medium text-store-ink-soft hover:bg-store-subtle transition-colors border border-store-line/80 whitespace-nowrap "
      title={isZh ? t('common.language.switchToEn') : t('common.language.switchToZh')}
    >
      <Languages className="w-3.5 h-3.5 text-store-brand " />
      <span className="hidden xl:inline">{isZh ? t('common.language.labelZh') : t('common.language.labelEn')}</span>
    </button>
  );
};
