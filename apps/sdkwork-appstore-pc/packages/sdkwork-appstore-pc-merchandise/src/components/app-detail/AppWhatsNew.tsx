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
    <div className="mb-10 pt-8 border-t border-store-line-soft ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-store-ink ">{t('appDetail.whatsNew.title')}</h3>
        <span className="text-sm text-store-ink-faint font-medium ">
          {t('appDetail.whatsNew.version', { version: whatsNew.version })}
        </span>
      </div>
      <p className="text-xs text-store-ink-faint font-medium mb-4 ">{whatsNew.date}</p>
      <div className="text-sm text-store-ink-soft leading-relaxed whitespace-pre-wrap max-w-3xl ">
        {whatsNew.notes}
      </div>
    </div>
  );
}

