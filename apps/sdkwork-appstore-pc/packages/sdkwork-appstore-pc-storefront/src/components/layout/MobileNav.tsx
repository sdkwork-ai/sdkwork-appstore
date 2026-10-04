import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MobileNavProps {
  tabs: TabItem[];
}

export function MobileNav({ tabs }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-store-raised/90 backdrop-blur-md border-t border-store-line z-50 pb-safe ">
      <ul className="flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => (
          <li key={tab.name}>
            <NavLink
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 gap-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-store-brand " : "text-store-ink-faint hover:text-store-ink  "
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                  {tab.name}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
