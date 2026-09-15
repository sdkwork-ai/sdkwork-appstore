/**
 * `@sdkwork/appstore-pc-admin-dashboard` — dashboard capability for the App
 * Store operator console (KPI overview and storefront search analytics).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`.
 */
export { appstoreAdminDashboardModule } from './module';
export {
  APPSTORE_ADMIN_DASHBOARD_I18N_NAMESPACE,
  adminDashboardEnUS,
  adminDashboardZhCN,
  appstoreAdminDashboardI18nBundle,
} from './i18n';

export { DashboardOverviewPage } from './pages/DashboardOverviewPage';
export { DashboardSearchPage } from './pages/DashboardSearchPage';
