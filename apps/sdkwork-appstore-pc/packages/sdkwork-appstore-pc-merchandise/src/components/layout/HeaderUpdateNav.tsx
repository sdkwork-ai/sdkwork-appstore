import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HeaderUpdateNavProps {
  pendingUpdatesCount: number;
}

export const HeaderUpdateNav: React.FC<HeaderUpdateNavProps> = ({ pendingUpdatesCount }) => {
  const { t } = useTranslation();

  return (
    <NavLink 
      to="/updates" 
      className={({ isActive }) => 
        cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors", 
          isActive 
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" 
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#22252c]"
        )
      }
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden xl:inline">{t('updates.tabs.updates')}</span>
      {pendingUpdatesCount > 0 && (
        <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-600 text-white rounded-full">
          {pendingUpdatesCount}
        </span>
      )}
    </NavLink>
  );
};
