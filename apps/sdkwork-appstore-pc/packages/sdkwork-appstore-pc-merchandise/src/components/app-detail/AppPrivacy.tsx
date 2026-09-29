import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { AppPrivacyCard } from './AppPrivacyCard';

interface AppPrivacyProps {
  app: AppItem;
}

export function AppPrivacy({ app }: AppPrivacyProps) {
  const { t } = useTranslation();

  if (!app.privacyLinked && !app.privacyNotLinked) return null;

  return (
    <div className="pt-8 border-t border-store-line-soft mt-10 ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-store-ink ">{t('appDetail.privacy.title')}</h3>
        <button className="text-store-brand text-sm font-medium hover:underline cursor-pointer ">
          {t('appDetail.privacy.seeDetails')}
        </button>
      </div>
      <p className="text-sm text-store-ink-faint mb-6 ">
        {t('appDetail.privacy.developerPractices', { developer: app.seller || app.developer })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {app.privacyLinked && app.privacyLinked.length > 0 && (
          <AppPrivacyCard
            title={t('appDetail.privacy.linkedTitle')}
            description={t('appDetail.privacy.linkedDesc')}
            items={app.privacyLinked}
            iconColorClass="text-store-brand "
          />
        )}
        
        {app.privacyNotLinked && app.privacyNotLinked.length > 0 && (
          <AppPrivacyCard
            title={t('appDetail.privacy.notLinkedTitle')}
            description={t('appDetail.privacy.notLinkedDesc')}
            items={app.privacyNotLinked}
            iconColorClass="text-store-ink-faint "
          />
        )}
      </div>
    </div>
  );
}

