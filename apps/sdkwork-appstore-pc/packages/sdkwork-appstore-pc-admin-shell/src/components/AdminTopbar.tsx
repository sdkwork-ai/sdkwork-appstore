import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AdminBreadcrumb, type AdminBreadcrumbItem } from './AdminBreadcrumb';

/**
 * One top-level destination in the console header menu.
 *
 * The shell derives these from the capability registry (one entry per nav
 * group, resolved to that group's first page), so the header never carries a
 * second hand-maintained menu: adding a capability group or moving a page only
 * changes the registry, and the header follows (`BACKEND_UI_SPEC.md` §9).
 */
export interface AdminHeaderMenuItem {
  /** Group id; stable key for React and for tests. */
  id: string;
  /** Localized label resolved by the shell. */
  label: string;
  /** Absolute console path the entry navigates to. */
  path: string;
  /** Whether the current route belongs to this group. */
  active: boolean;
}

export interface AdminTopbarProps {
  breadcrumb: readonly AdminBreadcrumbItem[];
  /** Top-level management destinations shown in the header menu. */
  menu?: readonly AdminHeaderMenuItem[];
  /** Accessible name of the header menu. */
  menuLabel?: string;
  /** Right-aligned status or utility content. */
  trailing?: ReactNode;
}

/**
 * Sticky console top bar carrying the breadcrumb trail, the top-level
 * management menu, and the utility slot.
 */
export function AdminTopbar({ breadcrumb, menu, menuLabel, trailing }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 border-b border-store-line bg-store-surface/90 px-5 backdrop-blur ">
      <AdminBreadcrumb items={breadcrumb} />
      {menu && menu.length > 0 ? (
        <nav
          aria-label={menuLabel}
          className="hidden items-center gap-1 md:flex"
        >
          {menu.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              aria-current={item.active ? 'page' : undefined}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-store-subtle text-store-ink'
                  : 'text-store-ink-soft hover:bg-store-subtle/70 hover:text-store-ink dark:hover:bg-store-subtle'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
      {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
