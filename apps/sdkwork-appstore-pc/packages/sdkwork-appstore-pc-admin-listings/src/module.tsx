import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE } from './i18n';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { ListingsPage } from './pages/ListingsPage';

const readPermissions = [APPSTORE_ADMIN_PERMISSIONS.listingsRead] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'listings-admin',
    path: 'listings',
    requiredPermissions: readPermissions,
    render: () => <ListingsPage />,
    nav: {
      labelKey: 'adminListings.list.title',
      icon: 'package',
      group: 'governance',
      order: 30,
    },
  },
  {
    id: 'listings-detail',
    path: 'listings/:listingId',
    requiredPermissions: readPermissions,
    render: () => <ListingDetailPage />,
  },
];

/**
 * Listings capability module.
 *
 * Both routes require `appstore.listings.admin.read`; the visibility command
 * additionally evaluates `appstore.listings.admin`, and the metrics section
 * evaluates `appstore.metrics.read`, inside the pages (`BACKEND_UI_SPEC.md` §7).
 */
export const appstoreAdminListingsModule: AppstoreAdminCapabilityModule = {
  id: 'listings',
  titleKey: 'adminListings.title',
  i18nNamespaces: [APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE],
  routes,
};
