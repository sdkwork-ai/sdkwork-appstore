import {
  APPSTORE_ADMIN_PERMISSIONS,
  type AppstoreAdminCapabilityModule,
  type AppstoreAdminRouteDescriptor,
} from '@sdkwork/appstore-pc-admin-core';

import { APPSTORE_ADMIN_MARKET_I18N_NAMESPACE } from './i18n';
import { MarketChannelsPage } from './pages/MarketChannelsPage';
import { MarketReleasesPage } from './pages/MarketReleasesPage';

const channelReadPermissions = [APPSTORE_ADMIN_PERMISSIONS.marketChannelsRead] as const;
const releaseReadPermissions = [APPSTORE_ADMIN_PERMISSIONS.marketReleasesRead] as const;

const routes: readonly AppstoreAdminRouteDescriptor[] = [
  {
    id: 'market-channels',
    path: 'market/channels',
    requiredPermissions: channelReadPermissions,
    render: () => <MarketChannelsPage />,
    nav: {
      labelKey: 'adminMarket.channels.title',
      icon: 'share',
      group: 'distribution',
      order: 10,
    },
  },
  {
    id: 'market-releases',
    path: 'market/releases',
    requiredPermissions: releaseReadPermissions,
    render: () => <MarketReleasesPage />,
    nav: {
      labelKey: 'adminMarket.releases.title',
      icon: 'radio',
      group: 'distribution',
      order: 20,
    },
  },
];

/**
 * Market capability module.
 *
 * Read routes require `appstore.market_channels.read` and
 * `appstore.market_releases.read`; channel authoring and release sync
 * additionally evaluate `appstore.market_channels.write` and
 * `appstore.market_releases.sync` inside the page (`BACKEND_UI_SPEC.md` §7).
 */
export const appstoreAdminMarketModule: AppstoreAdminCapabilityModule = {
  id: 'market',
  titleKey: 'adminMarket.title',
  i18nNamespaces: [APPSTORE_ADMIN_MARKET_I18N_NAMESPACE],
  routes,
};
