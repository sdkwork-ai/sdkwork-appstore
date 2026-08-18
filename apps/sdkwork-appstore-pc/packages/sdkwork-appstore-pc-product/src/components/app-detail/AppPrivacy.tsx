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
    <div className="pt-8 border-t border-gray-100 dark:border-[#2C2C2E] mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[#1C1C1E] dark:text-[#F5F5F5]">{t('appDetail.privacy.title')}</h3>
        <button className="text-blue-600 dark:text-[#0A84FF] text-sm font-medium hover:underline cursor-pointer">
          {t('appDetail.privacy.seeDetails')}
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {t('appDetail.privacy.developerPractices', { developer: app.seller || app.developer })}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {app.privacyLinked && app.privacyLinked.length > 0 && (
          <AppPrivacyCard
            title={t('appDetail.privacy.linkedTitle')}
            description={t('appDetail.privacy.linkedDesc')}
            items={app.privacyLinked}
            iconColorClass="text-blue-600 dark:text-[#0A84FF]"
          />
        )}
        
        {app.privacyNotLinked && app.privacyNotLinked.length > 0 && (
          <AppPrivacyCard
            title={t('appDetail.privacy.notLinkedTitle')}
            description={t('appDetail.privacy.notLinkedDesc')}
            items={app.privacyNotLinked}
            iconColorClass="text-gray-400 dark:text-gray-500"
          />
        )}
      </div>
    </div>
  );
}

