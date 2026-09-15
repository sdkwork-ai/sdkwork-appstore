/**
 * `@sdkwork/appstore-pc-admin-publishers` — publisher capability for the App
 * Store operator console (developer verification decisions and publisher
 * analytics).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`.
 */
export { appstoreAdminPublishersModule } from './module';
export {
  APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE,
  adminPublishersEnUS,
  adminPublishersZhCN,
  appstoreAdminPublishersI18nBundle,
} from './i18n';

export { PublisherAnalyticsPage } from './pages/PublisherAnalyticsPage';
export { PublisherVerificationPage } from './pages/PublisherVerificationPage';
