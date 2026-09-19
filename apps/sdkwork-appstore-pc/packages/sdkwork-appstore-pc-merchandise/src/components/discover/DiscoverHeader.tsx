import { useTranslation } from 'react-i18next';

interface DiscoverHeaderProps {
  dateString?: string;
}

export function DiscoverHeader({ dateString }: DiscoverHeaderProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'zh-CN';

  const formattedDate = dateString || new Date().toLocaleDateString(currentLang.startsWith('zh') ? 'zh-CN' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header>
      <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-[#1C1C1E] dark:text-[#F5F5F5]">
        {t('discover.header.title')}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
        {formattedDate}
      </p>
    </header>
  );
}

