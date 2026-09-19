import { useMemo, useSyncExternalStore } from 'react';
import {
  APPSTORE_ADMIN_ROUTE_PREFIX,
  projectAppstoreAdminOperator,
  toAppstoreAdminOperatorSession,
} from '@sdkwork/appstore-pc-admin-core';
import { appstoreAdminCatalogI18nBundle, appstoreAdminCatalogModule } from '@sdkwork/appstore-pc-admin-catalog';
import { appstoreAdminDashboardI18nBundle, appstoreAdminDashboardModule } from '@sdkwork/appstore-pc-admin-dashboard';
import { appstoreAdminListingsI18nBundle, appstoreAdminListingsModule } from '@sdkwork/appstore-pc-admin-listings';
import { appstoreAdminMarketI18nBundle, appstoreAdminMarketModule } from '@sdkwork/appstore-pc-admin-market';
import { appstoreAdminModerationI18nBundle, appstoreAdminModerationModule } from '@sdkwork/appstore-pc-admin-moderation';
import { appstoreAdminPublishersI18nBundle, appstoreAdminPublishersModule } from '@sdkwork/appstore-pc-admin-publishers';
import {
  AppstoreAdminShell,
  appstoreAdminShellI18nBundle,
  registerAppstoreAdminI18nBundles,
} from '@sdkwork/appstore-pc-admin-shell';
import { i18n } from '@sdkwork/appstore-pc-merchandise';
import type { AppstorePcRuntime } from '@sdkwork/appstore-pc-runtime';

/**
 * Capability modules aggregated into the operator console, in navigation order.
 *
 * The composition root is the only place that knows every `pc-admin-*` package,
 * which keeps the shell and each capability package independent of the others
 * (`APP_PC_ARCHITECTURE_SPEC.md` §4/§6). The order here is irrelevant to the
 * sidebar, which sorts by `nav.group` then `nav.order`.
 */
export const APPSTORE_ADMIN_MODULES = [
  appstoreAdminDashboardModule,
  appstoreAdminModerationModule,
  appstoreAdminListingsModule,
  appstoreAdminCatalogModule,
  appstoreAdminPublishersModule,
  appstoreAdminMarketModule,
] as const;

let adminLocalesRegistered = false;

/**
 * Merge every admin package's locale fragments into the application i18n
 * provider.
 *
 * Registration is idempotent and preserves existing keys, so an embedding host
 * that overrode an admin fragment keeps its copy (`I18N_SPEC.md` §6.1/§7).
 * Exported so a host bootstrap or a test can register without mounting.
 */
export function ensureAppstoreAdminLocalesRegistered(): void {
  if (adminLocalesRegistered) {
    return;
  }
  adminLocalesRegistered = true;
  registerAppstoreAdminI18nBundles(i18n, [
    appstoreAdminShellI18nBundle,
    appstoreAdminDashboardI18nBundle,
    appstoreAdminModerationI18nBundle,
    appstoreAdminListingsI18nBundle,
    appstoreAdminCatalogI18nBundle,
    appstoreAdminPublishersI18nBundle,
    appstoreAdminMarketI18nBundle,
  ]);
}

ensureAppstoreAdminLocalesRegistered();

export interface AppstoreAdminSurfaceProps {
  /** Host runtime; supplies the session snapshot the console authorizes against. */
  runtime: AppstorePcRuntime;
  /** Route prefix owned by the console; defaults to `/admin`. */
  prefix?: string;
  /** Runtime family, surfaced as a dense-grid affordance hint. */
  platform?: 'browser' | 'desktop' | 'tablet';
}

/**
 * Mount the App Store `backend-admin` operator console.
 *
 * Owns the boundary between the host product and the admin surface: it projects
 * the host session into the structural operator facts the console understands
 * and hands the aggregated capability modules to the shell. Authorization,
 * routing, chrome, and page bodies stay inside `pc-admin-*`
 * (`BACKEND_UI_SPEC.md` §1/§2).
 */
export function AppstoreAdminSurface({
  platform = 'browser',
  prefix = APPSTORE_ADMIN_ROUTE_PREFIX,
  runtime,
}: AppstoreAdminSurfaceProps) {
  const snapshot = useSyncExternalStore(
    (listener) => runtime.session.subscribe(listener),
    () => runtime.session.getSnapshot(),
    () => runtime.session.getSnapshot(),
  );
  const session = useMemo(() => toAppstoreAdminOperatorSession(snapshot), [snapshot]);
  const operator = useMemo(() => projectAppstoreAdminOperator(snapshot), [snapshot]);
  const identity = {
    ...(operator.operatorName ? { operatorName: operator.operatorName } : {}),
    ...(operator.tenantId ? { tenantLabel: operator.tenantId } : {}),
  };

  return (
    <AppstoreAdminShell
      modules={APPSTORE_ADMIN_MODULES}
      session={session}
      platform={platform}
      prefix={prefix}
      {...identity}
    />
  );
}
