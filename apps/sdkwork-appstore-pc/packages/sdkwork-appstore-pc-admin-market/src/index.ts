/**
 * `@sdkwork/appstore-pc-admin-market` — market distribution capability for the
 * App Store operator console (external market channels, market release sync).
 *
 * Owns its pages, components, routes, and locale fragments; backend access goes
 * exclusively through the `backend-admin` service ports published by
 * `@sdkwork/appstore-pc-admin-core`.
 */
export { appstoreAdminMarketModule } from './module';
export {
  APPSTORE_ADMIN_MARKET_I18N_NAMESPACE,
  adminMarketEnUS,
  adminMarketZhCN,
  appstoreAdminMarketI18nBundle,
} from './i18n';

export { MarketChannelsPage } from './pages/MarketChannelsPage';
export { MarketReleasesPage } from './pages/MarketReleasesPage';
