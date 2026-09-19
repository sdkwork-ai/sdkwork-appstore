import { describe, expect, it } from 'vitest';

import {
  buildAppstorePcHostSessionCandidate,
  createAppstorePcHostSessionSyncState,
  fingerprintAppstorePcHostSessionInput,
  onAppstorePcRuntimeSessionChanged,
  shouldApplyAppstorePcHostSession,
} from './hostSessionSync';

describe('appstore PC host session sync', () => {
  it('suppresses re-seeding when runtime clears after host apply', () => {
    const hostFingerprint = fingerprintAppstorePcHostSessionInput(null, 'access-only');
    expect(hostFingerprint).toBeTruthy();

    let state = createAppstorePcHostSessionSyncState();
    state = {
      ...state,
      lastAppliedHostFingerprint: hostFingerprint,
    };

    state = onAppstorePcRuntimeSessionChanged(state, {}, hostFingerprint);
    expect(state.suppressedHostFingerprint).toBe(hostFingerprint);
    expect(
      shouldApplyAppstorePcHostSession(
        state,
        {},
        hostFingerprint,
        buildAppstorePcHostSessionCandidate(null, 'access-only') ?? {},
      ),
    ).toBe(false);
  });

  it('allows host apply again when host credentials change', () => {
    const firstFingerprint = fingerprintAppstorePcHostSessionInput(null, 'access-one');
    const secondFingerprint = fingerprintAppstorePcHostSessionInput(null, 'access-two');
    expect(firstFingerprint).not.toBe(secondFingerprint);

    let state = createAppstorePcHostSessionSyncState();
    state = {
      lastAppliedHostFingerprint: firstFingerprint,
      suppressedHostFingerprint: firstFingerprint,
    };

    const nextSession = buildAppstorePcHostSessionCandidate(null, 'access-two') ?? {};
    expect(
      shouldApplyAppstorePcHostSession(state, {}, secondFingerprint, nextSession),
    ).toBe(true);
  });

  it('does not downgrade an authenticated runtime session with bootstrap host tokens', () => {
    const hostFingerprint = fingerprintAppstorePcHostSessionInput(null, 'bootstrap-access');
    const state = createAppstorePcHostSessionSyncState();
    // Annotated, not inferred: a bare literal widens `authLevel`, `dataScope`
    // or `environment` to `string`/`string[]` and stops matching
    // `IamAppContext`'s union types.
    const storeSnapshot: Parameters<typeof shouldApplyAppstorePcHostSession>[1] = {
      accessToken: 'access',
      authToken: 'auth',
      context: {
        appId: 'sdkwork-appstore-pc',
        authLevel: 'mfa',
        dataScope: ['publisher:owned'],
        deploymentMode: 'saas',
        environment: 'dev',
        permissionScope: ['appstore.metrics.read'],
        sessionId: 'session',
        tenantId: 'tenant',
        userId: 'user',
      },
    };
    const hostCandidate = buildAppstorePcHostSessionCandidate(null, 'bootstrap-access') ?? {};

    expect(
      shouldApplyAppstorePcHostSession(state, storeSnapshot, hostFingerprint, hostCandidate),
    ).toBe(false);
  });
});
