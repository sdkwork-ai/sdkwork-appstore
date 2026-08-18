import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    <div className="pt-8 border-t border-gray-100 dark:border-[#2C2C2E] mt-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#1C1C1E] dark:text-[#F5F5F5]">{t('appDetail.moreByDeveloper.title', { developer })}</h3>
        <button className="text-blue-600 dark:text-[#0A84FF] text-sm font-medium hover:underline cursor-pointer">{t('appDetail.moreByDeveloper.seeAll')}</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map(otherApp => (
          <div 
            key={otherApp.id} 
            onClick={() => navigate(`/app/${otherApp.id}`)} 
            className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-[#2C2C2E]/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#2C2C2E]"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${otherApp.iconColor} dark:shadow-none`}>
              <DynamicIcon name={otherApp.icon} className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-[#F5F5F5]">{otherApp.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{otherApp.category}</p>
            </div>
            <button 
              className="bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3C3C3E] text-blue-600 dark:text-[#0A84FF] font-bold text-xs px-4 py-1.5 rounded-full transition-colors uppercase cursor-pointer"
              onClick={(e) => { e.stopPropagation(); installApp(otherApp); }}
            >
              {otherApp.price === 0 ? t('appDetail.header.get') : formatPrice(otherApp.price, i18n.language)}
            </button>
          </div>
        ))}
        {apps.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('appDetail.moreByDeveloper.noOtherApps')}</p>
        )}
      </div>
    </div>
  );
}

