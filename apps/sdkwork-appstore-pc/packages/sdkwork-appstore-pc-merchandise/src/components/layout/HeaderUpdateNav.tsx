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
        cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors", 
          isActive 
            ? "bg-blue-50 text-store-brand dark:bg-store-brand/20 " 
            : "text-store-ink-soft hover:bg-store-subtle "
        )
      }
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden xl:inline">{t('updates.tabs.updates')}</span>
      {pendingUpdatesCount > 0 && (
        <span className="px-1.5 py-0.2 text-[10px] font-bold bg-store-brand text-white rounded-full">
          {pendingUpdatesCount}
        </span>
      )}
    </NavLink>
  );
};
