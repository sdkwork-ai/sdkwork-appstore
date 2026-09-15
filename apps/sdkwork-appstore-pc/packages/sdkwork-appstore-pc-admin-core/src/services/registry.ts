import type { SdkworkAppstoreBackendClient } from '@sdkwork/appstore-backend-sdk';

import { AppstoreAdminRuntimeUnconfiguredError } from './errors';
import {
  createAppstoreAdminDashboardPort,
  type AppstoreAdminDashboardPort,
} from './dashboard';
import {
  createAppstoreAdminModerationPort,
  type AppstoreAdminModerationPort,
} from './moderation';
import {
  createAppstoreAdminListingsPort,
  type AppstoreAdminListingsPort,
} from './listings';
import {
  createAppstoreAdminCatalogPort,
  type AppstoreAdminCatalogPort,
} from './catalog';
import {
  createAppstoreAdminPublishersPort,
  type AppstoreAdminPublishersPort,
} from './publishers';
import { createAppstoreAdminMarketPort, type AppstoreAdminMarketPort } from './market';

/**
 * Every backend-admin service port the App Store operator console consumes.
 *
 * One port per backend domain namespace so a capability package depends only on
 * the domain it governs (`BACKEND_UI_SPEC.md` §3, `APP_PC_ARCHITECTURE_SPEC.md`
 * §6: the backend SDK is constructed only inside this `backend-admin`
 * boundary and never re-exported to app or console surfaces).
 */
export interface AppstoreAdminServicePorts {
  /** `analytics.operator.*` — operator KPIs and storefront search analytics. */
  dashboard: AppstoreAdminDashboardPort;
  /** `moderation.*` — review queue, review detail, decisions, appeals. */
  moderation: AppstoreAdminModerationPort;
  /** `listings.admin.*` + `metrics.listings.*` — catalog governance and metrics. */
  listings: AppstoreAdminListingsPort;
  /** `catalog.*` — category, collection, and featured-slot operations. */
  catalog: AppstoreAdminCatalogPort;
  /** `publishers.admin.*` + `analytics.publisher.*` — developer verification. */
  publishers: AppstoreAdminPublishersPort;
  /** `marketChannels.*` + `marketReleases.*` — external distribution. */
  market: AppstoreAdminMarketPort;
}

/**
 * Build every admin service port from one generated backend client.
 * @param client - client produced by `createAppstorePcAdminBackendClient`.
 */
export function createAppstoreAdminServicePorts(
  client: SdkworkAppstoreBackendClient,
): AppstoreAdminServicePorts {
  return {
    dashboard: createAppstoreAdminDashboardPort(client),
    moderation: createAppstoreAdminModerationPort(client),
    listings: createAppstoreAdminListingsPort(client),
    catalog: createAppstoreAdminCatalogPort(client),
    publishers: createAppstoreAdminPublishersPort(client),
    market: createAppstoreAdminMarketPort(client),
  };
}

let activePorts: AppstoreAdminServicePorts | undefined;

/**
 * Bind the backend-admin ports during application bootstrap.
 * @param ports - ports built by {@link createAppstoreAdminServicePorts};
 *   `undefined` returns the runtime to its unconfigured (fail-closed) state.
 */
export function configureAppstoreAdminServicePorts(
  ports: AppstoreAdminServicePorts | undefined,
): void {
  activePorts = ports;
}

/**
 * Resolve the configured backend-admin ports.
 * @throws AppstoreAdminRuntimeUnconfiguredError before bootstrap wiring, so a
 *   mis-sequenced host fails loudly instead of dispatching unauthenticated
 *   traffic or rendering fabricated data.
 */
export function getAppstoreAdminServicePorts(): AppstoreAdminServicePorts {
  if (!activePorts) {
    throw new AppstoreAdminRuntimeUnconfiguredError();
  }
  return activePorts;
}

/** `true` once {@link configureAppstoreAdminServicePorts} has bound ports. */
export function isAppstoreAdminRuntimeConfigured(): boolean {
  return activePorts !== undefined;
}

/**
 * Ambient accessor used by capability packages.
 *
 * Reads are resolved lazily on every access so a capability module can be
 * imported before bootstrap without capturing the unconfigured state.
 */
export const AppstoreAdminService: AppstoreAdminServicePorts = {
  get dashboard(): AppstoreAdminDashboardPort {
    return getAppstoreAdminServicePorts().dashboard;
  },
  get moderation(): AppstoreAdminModerationPort {
    return getAppstoreAdminServicePorts().moderation;
  },
  get listings(): AppstoreAdminListingsPort {
    return getAppstoreAdminServicePorts().listings;
  },
  get catalog(): AppstoreAdminCatalogPort {
    return getAppstoreAdminServicePorts().catalog;
  },
  get publishers(): AppstoreAdminPublishersPort {
    return getAppstoreAdminServicePorts().publishers;
  },
  get market(): AppstoreAdminMarketPort {
    return getAppstoreAdminServicePorts().market;
  },
};
