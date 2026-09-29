import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { AppInfoRow } from './AppInfoRow';

interface AppInfoProps {
  app: AppItem;
}

export function AppInfo({ app }: AppInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="pt-8 border-t border-store-line-soft mt-10 ">
      <h3 className="text-2xl font-bold mb-6 text-store-ink ">{t('appDetail.info.title')}</h3>
      <div className="flex flex-col">
        <AppInfoRow label={t('appDetail.info.provider')} value={app.seller || app.developer} />
        <AppInfoRow label={t('appDetail.info.size')} value={app.size} />
        <AppInfoRow label={t('appDetail.info.category')} value={app.category} isLink />
        <AppInfoRow label={t('appDetail.info.language')} value={app.language || 'English'} />
        <AppInfoRow label={t('appDetail.info.ageRating')} value={app.ageRating} />
      </div>
    </div>
  );
}

