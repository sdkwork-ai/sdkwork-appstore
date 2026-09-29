import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type {
  AppstoreAdminNavGroup,
  AppstoreAdminNavigationEntry,
} from '@sdkwork/appstore-pc-admin-core';

import { AdminNavIcon } from './AdminNavIcon';

export interface AdminSidebarProps {
  /** Sidebar entries sorted by the module registry. */
  entries: readonly AppstoreAdminNavigationEntry[];
  /** Route prefix the entries are mounted under, for example `/admin`. */
  prefix: string;
  /** Operator display name shown in the console footer. */
  operatorName?: string;
  /** Tenant label shown next to the operator. */
  tenantLabel?: string;
  /** Whether the operator holds a platform-administrator role. */
  isPlatformAdministrator?: boolean;
}

const GROUP_ORDER: readonly AppstoreAdminNavGroup[] = [
  'insight',
  'governance',
  'operations',
  'distribution',
];

/** Operator console sidebar: brand, grouped navigation, and session footer. */
export function AdminSidebar({
  entries,
  isPlatformAdministrator = false,
  operatorName,
  prefix,
  tenantLabel,
}: AdminSidebarProps) {
  const { t } = useTranslation();
  const declaredGroups = new Set(entries.map((entry) => entry.group));
  const groups = GROUP_ORDER.filter((group) => declaredGroups.has(group));

  return (
    <nav
      aria-label={t('adminShell.brand.title')}
      className="flex w-56 shrink-0 flex-col border-r border-store-line bg-store-subtle/60 dark:bg-store-canvas "
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-store-control bg-gray-900 text-white dark:bg-store-subtle dark:text-store-ink">
          <AdminNavIcon name="shield" className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-store-ink ">
            {t('adminShell.brand.title')}
          </span>
          <span className="block truncate text-[11px] text-store-ink-faint ">
            {t('adminShell.brand.subtitle')}
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <div key={group} className="mb-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-store-ink-faint ">
              {t(`adminShell.nav.group.${group}`)}
            </p>
            <ul className="space-y-0.5">
              {entries
                .filter((entry) => entry.group === group)
                .map((entry) => (
                  <li key={entry.routeId}>
                    <NavLink
                      to={entry.path}
                      end={entry.path === prefix}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-store-surface text-store-ink shadow-sm  '
                            : 'text-store-ink-soft hover:bg-store-surface/70 hover:text-store-ink dark:hover:bg-store-surface  '
                        }`
                      }
                    >
                      <AdminNavIcon name={entry.icon} className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{t(entry.labelKey)}</span>
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-store-line px-3 py-3 ">
        <p className="truncate text-xs font-medium text-store-ink-soft ">
          {operatorName || t('adminShell.topbar.operator')}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-store-ink-faint ">
          {isPlatformAdministrator
            ? t('adminShell.topbar.role.platformAdministrator')
            : t('adminShell.topbar.role.operator')}
          {tenantLabel ? ` · ${tenantLabel}` : ''}
        </p>
      </div>
    </nav>
  );
}
