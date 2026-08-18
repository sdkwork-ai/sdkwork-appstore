import { describe, expect, it } from 'vitest';

import {
  APPSTORE_ADMIN_MONITOR_PERMISSION,
  hasAppstoreAdminMonitorAccess,
} from './AdminPermissionGate';

describe('appstore admin monitor permission', () => {
  it('accepts the exact permission and matching wildcard scopes', () => {
    expect(hasAppstoreAdminMonitorAccess([APPSTORE_ADMIN_MONITOR_PERMISSION], [])).toBe(true);
    expect(hasAppstoreAdminMonitorAccess(['appstore.metrics.*'], [])).toBe(true);
  });

  it('accepts platform operators and rejects ordinary app sessions', () => {
    expect(hasAppstoreAdminMonitorAccess([], ['platform_super_admin'])).toBe(true);
    expect(hasAppstoreAdminMonitorAccess(['appstore.catalog.read'], ['app_user'])).toBe(false);
  });
});
