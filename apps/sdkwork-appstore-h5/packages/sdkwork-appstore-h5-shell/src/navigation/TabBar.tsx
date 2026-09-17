import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { clsx } from 'clsx';

export interface TabBarItem {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType<{
    readonly className?: string;
    readonly strokeWidth?: number;
  }>;
  readonly end?: boolean;
}

export interface TabBarProps {
  readonly items: readonly TabBarItem[];
}

/**
 * H5 bottom tab bar.
 *
 * Tab ownership sits with the shell so every capability package renders inside
 * the same navigation container
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 4).
 */
export function TabBar({ items }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="主导航">
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors min-w-0',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]',
              )
            }
          >
            <item.icon className="w-6 h-6 flex-shrink-0" strokeWidth={1.75} />
            <span className="truncate max-w-full px-0.5">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
