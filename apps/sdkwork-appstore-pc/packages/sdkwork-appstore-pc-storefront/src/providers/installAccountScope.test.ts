import { describe, expect, it } from 'vitest';

import {
  ANONYMOUS_INSTALL_ACCOUNT_SCOPE,
  installAccountKey,
  resolveInstallAccountScope,
} from './installAccountScope';

describe('install account scope', () => {
  it('uses the tenant and user of an authenticated session', () => {
    const scope = resolveInstallAccountScope({
      context: { tenantId: 'tenant-1', userId: 'user-alice' },
    });

    expect(scope).toEqual({ tenantId: 'tenant-1', userId: 'user-alice' });
    expect(installAccountKey(scope)).not.toBe(
      installAccountKey({ tenantId: 'tenant-1', userId: 'user-bob' }),
    );
  });

  it('collapses a partial or signed-out session to the anonymous scope', () => {
    expect(resolveInstallAccountScope(undefined)).toBe(ANONYMOUS_INSTALL_ACCOUNT_SCOPE);
    expect(resolveInstallAccountScope({})).toBe(ANONYMOUS_INSTALL_ACCOUNT_SCOPE);
    expect(
      resolveInstallAccountScope({ context: { tenantId: 'tenant-1' } }),
    ).toBe(ANONYMOUS_INSTALL_ACCOUNT_SCOPE);
    expect(
      resolveInstallAccountScope({ context: { tenantId: '  ', userId: 'user-alice' } }),
    ).toBe(ANONYMOUS_INSTALL_ACCOUNT_SCOPE);
  });

  it('keeps the anonymous key distinct from every authenticated account', () => {
    expect(installAccountKey(ANONYMOUS_INSTALL_ACCOUNT_SCOPE)).toBe('\u0000');
    expect(installAccountKey(ANONYMOUS_INSTALL_ACCOUNT_SCOPE)).not.toBe(
      installAccountKey({ tenantId: 'tenant-1', userId: 'user-alice' }),
    );
  });
});
