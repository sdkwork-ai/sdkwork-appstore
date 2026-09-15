import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE } from './i18n';
import { PublisherAnalyticsPage } from './pages/PublisherAnalyticsPage';
import { PublisherVerificationPage } from './pages/PublisherVerificationPage';

const verificationPermissions = [APPSTORE_ADMIN_PERMISSIONS.publishersManage] as const;

const analyticsPermissions = [APPSTORE_ADMIN_PERMISSIONS.publisherAnalyticsRead] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'publishers-verification',
    path: 'publishers',
    requiredPermissions: verificationPermissions,
    render: () => <PublisherVerificationPage />,
    nav: {
      labelKey: 'adminPublishers.verification.title',
      icon: 'badge-check',
      group: 'governance',
      order: 40,
    },
  },
  {
    id: 'publishers-analytics',
    path: 'publishers/analytics',
    requiredPermissions: analyticsPermissions,
    render: () => <PublisherAnalyticsPage />,
    nav: {
      labelKey: 'adminPublishers.analytics.title',
      icon: 'bar-chart-3',
      group: 'insight',
      order: 30,
    },
  },
];

/**
 * Publisher capability module.
 *
 * Verification requires `appstore.publishers.admin`; publisher analytics require
 * `appstore.analytics.publisher`, and the verification command re-evaluates its
 * code inside the page (`BACKEND_UI_SPEC.md` §7).
 */
export const appstoreAdminPublishersModule: AppstoreAdminCapabilityModule = {
  id: 'publishers',
  titleKey: 'adminPublishers.title',
  i18nNamespaces: [APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE],
  routes,
};
