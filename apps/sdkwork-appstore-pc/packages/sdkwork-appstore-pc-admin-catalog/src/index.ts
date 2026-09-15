/**
 * `@sdkwork/appstore-pc-admin-catalog` — catalog capability for the App Store
 * operator console (category, collection, collection-item, and featured-slot
 * authoring).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`. The operator contract exposes catalog
 * mutations only, so the pages author catalog state from operator-supplied
 * identifiers and never fabricate a catalog listing.
 */
export { appstoreAdminCatalogModule } from './module';
export {
  APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE,
  adminCatalogEnUS,
  adminCatalogZhCN,
  appstoreAdminCatalogI18nBundle,
} from './i18n';

export { CatalogCategoriesPage } from './pages/CatalogCategoriesPage';
export { CatalogCollectionsPage } from './pages/CatalogCollectionsPage';
export { CatalogFeaturedPage } from './pages/CatalogFeaturedPage';
