import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import { AppHeaderActions } from './AppHeaderActions';
import { AppHeaderStatsBar } from './AppHeaderStatsBar';

interface AppHeaderProps {
  app: AppItem;
}

export function AppHeader({ app }: AppHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6 md:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 dark:text-[#0A84FF] flex items-center gap-1 font-medium hover:opacity-80 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t('appDetail.header.back')}</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8 mb-8">
        <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[24px] md:rounded-[32px] shadow-2xl shadow-blue-200 dark:shadow-none flex items-center justify-center shrink-0 ${app.iconColor}`}>
          <DynamicIcon name={app.icon} className="text-white w-12 h-12 md:w-16 md:h-16" />
        </div>
        
        <div className="flex-1 flex flex-col pt-1 md:pt-2 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] dark:text-[#F5F5F5]">{app.name}</h1>
            {/* Sub-component: Install & Share Actions */}
            <AppHeaderActions app={app} />
          </div>
          <p className="text-xl text-gray-400 dark:text-gray-500 font-medium mb-4 mt-1 md:mt-0">{app.category}</p>
          
          {/* Sub-component: Stats bar */}
          <AppHeaderStatsBar app={app} />
        </div>
      </div>
    </>
  );
}

