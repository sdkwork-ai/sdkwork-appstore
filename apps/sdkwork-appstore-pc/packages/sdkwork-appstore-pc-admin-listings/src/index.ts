/**
 * `@sdkwork/appstore-pc-admin-listings` — listings capability for the App
 * Store operator console (listing catalog governance and storefront
 * visibility).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`.
 */
export { appstoreAdminListingsModule } from './module';
export {
  APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE,
  adminListingsEnUS,
  adminListingsZhCN,
  appstoreAdminListingsI18nBundle,
} from './i18n';

export { ListingsPage } from './pages/ListingsPage';
export { ListingDetailPage } from './pages/ListingDetailPage';
