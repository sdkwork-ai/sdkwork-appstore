/**
 * `@sdkwork/appstore-pc-admin-demands` — demand capability for the App Store
 * operator console (the demand hall category tree).
 *
 * Owns its page, forms, route, and locale fragment; backend access goes
 * exclusively through the `demands` service port published by
 * `@sdkwork/appstore-pc-admin-core`, which reaches the `sdkwork-company`
 * backend API that owns demand data.
 */
export { appstoreAdminDemandsModule } from './module';
export {
  APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE,
  adminDemandsEnUS,
  adminDemandsZhCN,
  appstoreAdminDemandsI18nBundle,
} from './i18n';

export { DemandCategoriesPage } from './pages/DemandCategoriesPage';
