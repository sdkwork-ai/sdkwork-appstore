import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { clsx } from 'clsx';

export interface TabBarItem {
  readonly path: string;
  readonly label: string;
  readonly icon: ComponentType<{
    readonly className?: string;
    readonly strokeWidth?: number;
    readonly fill?: string;
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
 *
 * Selection is carried by the icon glyph itself — filled on the selected tab,
 * outline on the others — because color alone is not a selection signal
 * (`APP_MOBILE_REACT_UI_SPEC.md` "Bottom tab bar"; stroke-based icon sets fill
 * the same glyph with `fill="currentColor"`).
 */
export function TabBar({ items }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="主导航">
      <div
        className="tab-bar__row"
        style={{ maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto' }}
      >
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
            {({ isActive }) => (
              <>
                <item.icon
                  className="w-6 h-6 flex-shrink-0"
                  strokeWidth={1.75}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className="truncate max-w-full px-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
