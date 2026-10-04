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
        <div className="px-3 mb-1.5 text-[10px] font-bold text-store-ink-faint uppercase tracking-wider ">
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
                "flex items-center gap-3 px-3 py-2 rounded-store-control text-xs font-medium transition-all",
                variant === 'bottom'
                  ? active
                    ? "bg-store-brand/15 text-store-brand dark:bg-store-brand/20 font-semibold "
                    : "text-store-ink-faint hover:bg-store-raised/60 dark:hover:bg-store-surface "
                  : active
                    ? "bg-store-brand text-white shadow-sm font-semibold"
                    : "text-store-ink-soft hover:bg-store-raised/60 dark:hover:bg-store-surface "
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
