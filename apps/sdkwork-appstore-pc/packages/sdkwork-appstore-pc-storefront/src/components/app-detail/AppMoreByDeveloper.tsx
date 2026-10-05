import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paidPricing } from '@sdkwork/appstore-pc-core';
import { AppItem } from '../../types';
import { formatPrice } from '../../lib/utils';
import { DynamicIcon } from '../DynamicIcon';
import { useInstall } from '../../providers/InstallProvider';

interface AppMoreByDeveloperProps {
  developer: string;
  apps: AppItem[];
}

export function AppMoreByDeveloper({ developer, apps }: AppMoreByDeveloperProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { installApp } = useInstall();

  return (
    <div className="pt-8 border-t border-store-line-soft mt-10 ">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-store-ink ">{t('appDetail.moreByDeveloper.title', { developer })}</h3>
        <button className="text-store-brand text-sm font-medium hover:underline cursor-pointer ">{t('appDetail.moreByDeveloper.seeAll')}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map(otherApp => (
          <div 
            key={otherApp.id} 
            onClick={() => navigate(`/app/${otherApp.id}`)} 
            className="flex items-center gap-4 p-3 hover:bg-store-subtle dark:hover:bg-store-raised/50 rounded-store-control cursor-pointer transition-colors border border-transparent hover:border-store-line "
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${otherApp.iconColor} dark:shadow-none`}>
              <DynamicIcon name={otherApp.icon} className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-store-ink ">{otherApp.name}</h4>
              <p className="text-xs text-store-ink-faint ">{otherApp.category}</p>
            </div>
            <button 
              className="bg-store-raised hover:bg-store-raised text-store-brand font-medium text-xs px-4 py-1.5 rounded-full transition-colors uppercase cursor-pointer "
              onClick={(e) => { e.stopPropagation(); installApp(otherApp); }}
            >
              {paidPricing(otherApp.pricingModel) ? t('publisher.pricingPaid') : t('appDetail.header.get')}
            </button>
          </div>
        ))}
        {apps.length === 0 && (
          <p className="text-sm text-store-ink-faint ">{t('appDetail.moreByDeveloper.noOtherApps')}</p>
        )}
      </div>
    </div>
  );
}

