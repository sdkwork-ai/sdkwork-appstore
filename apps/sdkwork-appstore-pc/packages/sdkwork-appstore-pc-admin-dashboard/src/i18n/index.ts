import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminDashboard as adminDashboardEnUS } from './en-US/appstore/admin/dashboard';
import { adminDashboard as adminDashboardZhCN } from './zh-CN/appstore/admin/dashboard';

/** Fragment namespace owned by the dashboard capability. */
export const APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE = 'adminDashboard' as const;

/**
 * Locale bundle for the dashboard domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminDashboardI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE]: adminDashboardZhCN },
  'en-US': { [APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE]: adminDashboardEnUS },
  en: { [APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE]: adminDashboardEnUS },
};

export { adminDashboardZhCN, adminDashboardEnUS };
