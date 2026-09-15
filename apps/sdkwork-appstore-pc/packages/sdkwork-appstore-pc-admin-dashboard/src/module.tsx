import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE } from './i18n';
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { DashboardSearchPage } from './pages/DashboardSearchPage';

const readPermissions = [APPSTORE_ADMIN_PERMISSIONS.operatorAnalyticsRead] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'dashboard-overview',
    path: 'dashboard',
    requiredPermissions: readPermissions,
    render: () => <DashboardOverviewPage />,
    nav: {
      labelKey: 'adminDashboard.overview.title',
      icon: 'layout-grid',
      group: 'insight',
      order: 10,
    },
  },
  {
    id: 'dashboard-search',
    path: 'dashboard/search',
    requiredPermissions: readPermissions,
    render: () => <DashboardSearchPage />,
    nav: {
      labelKey: 'adminDashboard.search.title',
      icon: 'activity',
      group: 'insight',
      order: 20,
    },
  },
];

/**
 * Dashboard capability module.
 *
 * Both routes read the operator analytics operations
 * (`appstore.analytics.operator.dashboard.retrieve` and
 * `appstore.analytics.operator.search.retrieve`), so they require
 * `appstore.analytics.operator` (`BACKEND_UI_SPEC.md` §7). `dashboard-overview`
 * is `APPSTORE_ADMIN_DEFAULT_ROUTE_ID` — the console landing page.
 */
export const appstoreAdminDashboardModule: AppstoreAdminCapabilityModule = {
  id: 'dashboard',
  titleKey: 'adminDashboard.title',
  i18nNamespaces: [APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE],
  routes,
};
