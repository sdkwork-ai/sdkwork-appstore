import { ChevronRight, ChevronLeft } from 'lucide-react';
import { AppItem } from '../../types';
import { AppRow } from '../AppRow';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EssentialAppsGridProps {
  apps: AppItem[];
}

export function EssentialAppsGrid({ apps }: EssentialAppsGridProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <Link 
          to="/search?category=utilities" 
          className="flex items-center gap-1 group text-sm font-bold text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-colors"
        >
          <span>{t('discover.sections.essentialApps')}</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </Link>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#252832] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#252832] transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
        {apps.slice(0, 8).map((app) => (
          <AppRow key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
