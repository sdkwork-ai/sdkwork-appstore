import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE } from './i18n';
import { DemandCategoriesPage } from './pages/DemandCategoriesPage';

const demandPermissions = [APPSTORE_ADMIN_PERMISSIONS.demandsManage] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'demand-categories',
    path: 'demands/categories',
    requiredPermissions: demandPermissions,
    render: () => <DemandCategoriesPage />,
    nav: {
      labelKey: 'adminDemands.categories.title',
      icon: 'list-checks',
      group: 'operations',
      order: 40,
    },
  },
];

/**
 * Demand capability module.
 *
 * The single route requires `company.demand_categories.manage`, enforced by the
 * `sdkwork-company` backend API that owns the demand category tree
 * (`BACKEND_UI_SPEC.md` §7). The page reads the whole tree, so it renders real
 * rows instead of an identifier-only authoring console.
 */
export const appstoreAdminDemandsModule: AppstoreAdminCapabilityModule = {
  id: 'demands',
  titleKey: 'adminDemands.title',
  i18nNamespaces: [APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE],
  routes,
};
