import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  hasPermissionInScope,
  SDKWORK_STANDARD_ROLE_CODES,
} from '@sdkwork/iam-contracts';
import { APPSTORE_ADMIN_PERMISSIONS } from '@sdkwork/appstore-pc-admin-core';

import type { AppstorePcRuntime } from './bootstrap/runtime';

export const APPSTORE_ADMIN_MONITOR_PERMISSION = APPSTORE_ADMIN_PERMISSIONS.monitorRead;

export interface AdminPermissionGateProps {
  children: ReactNode;
  runtime: AppstorePcRuntime;
}

export function hasAppstoreAdminMonitorAccess(
  grantedPermissions: readonly string[],
  roleCodes: readonly string[],
): boolean {
  return (
    hasPermissionInScope(grantedPermissions, APPSTORE_ADMIN_MONITOR_PERMISSION) ||
    roleCodes.includes(SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SYSTEM_ADMIN) ||
    roleCodes.includes(SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SUPER_ADMIN)
  );
}

export function AdminPermissionGate({ children, runtime }: AdminPermissionGateProps) {
  const { t } = useTranslation();
  const context = runtime.session.getSnapshot().context;
  const allowed = hasAppstoreAdminMonitorAccess(
    context?.permissionScope ?? [],
    context?.standardRoleCodes ?? [],
  );

  if (!allowed) {
    return (
      <section className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t('admin.accessDenied.title')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('admin.accessDenied.description')}
        </p>
        <p className="mt-4 font-mono text-xs text-gray-500">
          {APPSTORE_ADMIN_MONITOR_PERMISSION}
        </p>
      </section>
    );
  }

  return <>{children}</>;
}
