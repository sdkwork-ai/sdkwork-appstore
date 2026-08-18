import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SidebarNavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarNavGroupProps {
  title?: string;
  items: SidebarNavItem[];
  isTabActive: (path: string) => boolean;
  variant?: 'default' | 'bottom';
}

export const SidebarNavGroup: React.FC<SidebarNavGroupProps> = ({
  title,
  items,
  isTabActive,
  variant = 'default'
}) => {
  return (
    <div>
      {title && (
        <div className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      <nav className="space-y-0.5">
        {items.map((tab) => {
          const active = isTabActive(tab.path);
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                variant === 'bottom'
                  ? active
                    ? "bg-blue-600/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold"
                    : "text-gray-500 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-[#20232c]"
                  : active
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-gray-200/60 dark:text-gray-300 dark:hover:bg-[#20232c]"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
