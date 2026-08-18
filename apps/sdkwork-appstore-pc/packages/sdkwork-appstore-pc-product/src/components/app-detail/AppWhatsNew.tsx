import { useTranslation } from 'react-i18next';

interface WhatsNewData {
  version: string;
  date: string;
  notes: string;
}

interface AppWhatsNewProps {
  whatsNew?: WhatsNewData;
}

export function AppWhatsNew({ whatsNew }: AppWhatsNewProps) {
  const { t } = useTranslation();

  if (!whatsNew) return null;

  return (
    <div className="mb-10 pt-8 border-t border-gray-100 dark:border-[#2C2C2E]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[#1C1C1E] dark:text-[#F5F5F5]">{t('appDetail.whatsNew.title')}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {t('appDetail.whatsNew.version', { version: whatsNew.version })}
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-4">{whatsNew.date}</p>
      <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
        {whatsNew.notes}
      </div>
    </div>
  );
}

