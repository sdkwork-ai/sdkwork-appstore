import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE } from './i18n';
import { CatalogCategoriesPage } from './pages/CatalogCategoriesPage';
import { CatalogCollectionsPage } from './pages/CatalogCollectionsPage';
import { CatalogFeaturedPage } from './pages/CatalogFeaturedPage';

const catalogPermissions = [APPSTORE_ADMIN_PERMISSIONS.catalogManage] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'catalog-categories',
    path: 'catalog/categories',
    requiredPermissions: catalogPermissions,
    render: () => <CatalogCategoriesPage />,
    nav: {
      labelKey: 'adminCatalog.categories.title',
      icon: 'tags',
      group: 'operations',
      order: 10,
    },
  },
  {
    id: 'catalog-collections',
    path: 'catalog/collections',
    requiredPermissions: catalogPermissions,
    render: () => <CatalogCollectionsPage />,
    nav: {
      labelKey: 'adminCatalog.collections.title',
      icon: 'layers',
      group: 'operations',
      order: 20,
    },
  },
  {
    id: 'catalog-featured',
    path: 'catalog/featured',
    requiredPermissions: catalogPermissions,
    render: () => <CatalogFeaturedPage />,
    nav: {
      labelKey: 'adminCatalog.featured.title',
      icon: 'store',
      group: 'operations',
      order: 30,
    },
  },
];

/**
 * Catalog capability module.
 *
 * Every route requires `appstore.catalog.admin`. The backend API exposes catalog
 * *mutations* only, so each page is an authoring console driven by
 * operator-supplied identifiers and carries an explicit notice that reading
 * existing catalog entries is not part of the operator contract
 * (`BACKEND_UI_SPEC.md` §7).
 */
export const appstoreAdminCatalogModule: AppstoreAdminCapabilityModule = {
  id: 'catalog',
  titleKey: 'adminCatalog.title',
  i18nNamespaces: [APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE],
  routes,
};
