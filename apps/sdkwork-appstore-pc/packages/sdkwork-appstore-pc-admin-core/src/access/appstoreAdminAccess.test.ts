import { describe, expect, it } from 'vitest';
import { SDKWORK_STANDARD_ROLE_CODES } from '@sdkwork/iam-contracts';

import {
  evaluateAppstoreAdminAccess,
  hasAnyAppstoreAdminPermission,
  hasAppstoreAdminPermission,
  hasAppstoreAdminSurfaceEntry,
  isAppstorePlatformAdministrator,
} from './appstoreAdminAccess';

describe('admin surface access evaluation', () => {
  it('grants entry on an exact backend-admin permission code', () => {
    const access = evaluateAppstoreAdminAccess({ permissionScope: ['appstore.moderation.read'] });
    expect(access.allowed).toBe(true);
    expect(access.isPlatformAdministrator).toBe(false);
    expect(access.grantedPermissions).toEqual(['appstore.moderation.read']);
  });

  it('honours the platform wildcard rules used by the server matcher', () => {
    expect(hasAppstoreAdminSurfaceEntry({ permissionScope: ['appstore.*'] })).toBe(true);
    expect(hasAppstoreAdminSurfaceEntry({ permissionScope: ['*.read'] })).toBe(true);
    expect(hasAppstoreAdminSurfaceEntry({ permissionScope: ['*'] })).toBe(true);
  });

  it('fails closed for an empty or unrelated scope', () => {
    expect(evaluateAppstoreAdminAccess(undefined)).toEqual({
      allowed: false,
      isPlatformAdministrator: false,
      grantedPermissions: [],
      standardRoleCodes: [],
    });
    expect(hasAppstoreAdminSurfaceEntry({ permissionScope: [] })).toBe(false);
    // App-surface codes are not backend-admin entry permissions.
    expect(
      hasAppstoreAdminSurfaceEntry({
        permissionScope: ['appstore.listings.storefront.read', 'appstore.publishers.members.create'],
      }),
    ).toBe(false);
  });

  it('grants entry to a platform administrator regardless of the scope', () => {
    const access = evaluateAppstoreAdminAccess({
      standardRoleCodes: [SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SUPER_ADMIN],
    });
    expect(access.allowed).toBe(true);
    expect(access.isPlatformAdministrator).toBe(true);

    expect(
      isAppstorePlatformAdministrator([SDKWORK_STANDARD_ROLE_CODES.PLATFORM_SYSTEM_ADMIN]),
    ).toBe(true);
    expect(isAppstorePlatformAdministrator(['app_user'])).toBe(false);
    expect(isAppstorePlatformAdministrator(undefined)).toBe(false);
  });

  it('does not let an ordinary role grant entry on its own', () => {
    const access = evaluateAppstoreAdminAccess({ standardRoleCodes: ['app_user'] });
    expect(access.allowed).toBe(false);
    expect(access.isPlatformAdministrator).toBe(false);
  });

  it('never widens page authority from surface entry', () => {
    expect(hasAppstoreAdminPermission(['appstore.moderation.read'], 'appstore.moderation.decide')).toBe(
      false,
    );
    expect(hasAppstoreAdminPermission(['appstore.moderation.decide'], 'appstore.moderation.decide')).toBe(
      true,
    );
    expect(hasAnyAppstoreAdminPermission(['appstore.moderation.read'], [])).toBe(false);
    expect(
      hasAnyAppstoreAdminPermission(
        ['appstore.moderation.read'],
        ['appstore.catalog.admin', 'appstore.moderation.read'],
      ),
    ).toBe(true);
  });

  it('copies the session scope so a caller cannot mutate the snapshot', () => {
    const permissionScope = ['appstore.moderation.read'];
    const standardRoleCodes = ['app_user'];
    const access = evaluateAppstoreAdminAccess({ permissionScope, standardRoleCodes });

    expect(access.grantedPermissions).not.toBe(permissionScope);
    expect(access.standardRoleCodes).not.toBe(standardRoleCodes);
    expect(access.grantedPermissions).toEqual(permissionScope);
  });
});
