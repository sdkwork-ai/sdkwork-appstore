import {
  APPSTORE_ADMIN_PERMISSION_CODES,
  APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  type AppstoreAdminPermission,
} from '../permissions';
import { APPSTORE_ADMIN_ROUTE_PREFIX } from '../routes/types';

/** Machine-readable surface declared by `specs/component.spec.json`. */
export const APPSTORE_ADMIN_SURFACE = 'backend-admin' as const;

/** Capability id declared by `specs/component.spec.json`. */
export const APPSTORE_ADMIN_CAPABILITY = 'appstore-admin' as const;

/**
 * Capability packages the operator console is composed from, listed in
 * navigation order. Every entry maps to one `sdkwork-appstore-pc-admin-<id>`
 * package that owns its pages, services, routes, and locale fragments.
 */
export const APPSTORE_ADMIN_CAPABILITY_INVENTORY = [
  'dashboard',
  'moderation',
  'listings',
  'catalog',
  'publishers',
  'market',
] as const;

export type AppstoreAdminCapabilityId = (typeof APPSTORE_ADMIN_CAPABILITY_INVENTORY)[number];

/** Composition facts a verifier or console header can assert against. */
export interface AppstoreAdminCompositionSummary {
  surface: typeof APPSTORE_ADMIN_SURFACE;
  capability: typeof APPSTORE_ADMIN_CAPABILITY;
  /** Route prefix owned by the operator console. */
  entryPath: string;
  /** Capability packages aggregated into the console. */
  capabilityInventory: readonly AppstoreAdminCapabilityId[];
  /** Permission codes that grant entry to the console at all. */
  surfaceEntryPermissions: readonly AppstoreAdminPermission[];
  /** Every backend-admin permission code owned by this application. */
  permissionCodes: readonly AppstoreAdminPermission[];
}

/** Describe the operator console composition for diagnostics and tests. */
export function describeAppstoreAdminComposition(): AppstoreAdminCompositionSummary {
  return {
    surface: APPSTORE_ADMIN_SURFACE,
    capability: APPSTORE_ADMIN_CAPABILITY,
    entryPath: APPSTORE_ADMIN_ROUTE_PREFIX,
    capabilityInventory: APPSTORE_ADMIN_CAPABILITY_INVENTORY,
    surfaceEntryPermissions: APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
    permissionCodes: APPSTORE_ADMIN_PERMISSION_CODES,
  };
}
