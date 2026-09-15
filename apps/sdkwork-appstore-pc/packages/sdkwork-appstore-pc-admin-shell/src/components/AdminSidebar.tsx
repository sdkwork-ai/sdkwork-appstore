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
      className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50/60 dark:border-[#22252e] dark:bg-[#111318]"
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">
          <AdminNavIcon name="shield" className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-50">
            {t('adminShell.brand.title')}
          </span>
          <span className="block truncate text-[11px] text-gray-400 dark:text-gray-500">
            {t('adminShell.brand.subtitle')}
          </span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {groups.map((group) => (
          <div key={group} className="mb-3">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
                            ? 'bg-white text-gray-900 shadow-sm dark:bg-[#1d2028] dark:text-gray-50'
                            : 'text-gray-600 hover:bg-white/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#191c23] dark:hover:text-gray-100'
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

      <div className="border-t border-gray-200 px-3 py-3 dark:border-[#22252e]">
        <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-200">
          {operatorName || t('adminShell.topbar.operator')}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-gray-400 dark:text-gray-500">
          {isPlatformAdministrator
            ? t('adminShell.topbar.role.platformAdministrator')
            : t('adminShell.topbar.role.operator')}
          {tenantLabel ? ` · ${tenantLabel}` : ''}
        </p>
      </div>
    </nav>
  );
}
