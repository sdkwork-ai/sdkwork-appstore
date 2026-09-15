import { describe, expect, it } from 'vitest';

import {
  AppstoreAdminRuntimeUnconfiguredError,
  AppstoreAdminServiceError,
  executeAdminOperation,
  requireAdminIdentifier,
  toAppstoreAdminServiceError,
} from './errors';

describe('admin service error normalization', () => {
  it('classifies failures by HTTP status before the transport error code', () => {
    const cases: readonly (readonly [number, string])[] = [
      [400, 'validation'],
      [401, 'unauthorized'],
      [403, 'forbidden'],
      [404, 'notFound'],
      [409, 'conflict'],
      [422, 'validation'],
      [429, 'rateLimited'],
      [503, 'server'],
    ];

    for (const [httpStatus, kind] of cases) {
      const error = toAppstoreAdminServiceError({ code: 'BUSINESS_ERROR', httpStatus });
      expect(error.kind).toBe(kind);
      expect(error.httpStatus).toBe(httpStatus);
    }
  });

  it('falls back to the transport error code when no status is reported', () => {
    expect(toAppstoreAdminServiceError({ code: 'NETWORK_ERROR' }).kind).toBe('network');
    expect(toAppstoreAdminServiceError({ code: 'TIMEOUT' }).kind).toBe('timeout');
    expect(toAppstoreAdminServiceError({ code: 'CANCELLED' }).kind).toBe('cancelled');
    expect(toAppstoreAdminServiceError({ code: 'SOMETHING_NEW' }).kind).toBe('unknown');
  });

  it('extracts the problem detail, trace id, and field errors', () => {
    const error = toAppstoreAdminServiceError(
      {
        code: 'BUSINESS_ERROR',
        httpStatus: 403,
        message: 'Operator is not allowed to decide this review.',
        problem: {
          code: 'FORBIDDEN',
          i18nKey: 'appstore.error.moderation.decide_forbidden',
          status: 403,
          traceId: 'trace-42',
        },
        details: [
          { field: 'reasonCode', code: 'REQUIRED', i18nKey: 'validation.required' },
          { code: 'NO_FIELD' },
        ],
      },
      'appstore.moderation.decisions.create',
    );

    expect(error.kind).toBe('forbidden');
    expect(error.problemCode).toBe('FORBIDDEN');
    expect(error.i18nKey).toBe('appstore.error.moderation.decide_forbidden');
    expect(error.traceId).toBe('trace-42');
    expect(error.operationId).toBe('appstore.moderation.decisions.create');
    expect(error.fieldErrors).toEqual([
      { field: 'reasonCode', code: 'REQUIRED', i18nKey: 'validation.required' },
    ]);
    expect(error.isForbidden).toBe(true);
    expect(error.isUnauthorized).toBe(false);
    expect(error.isRetryable).toBe(false);
  });

  it('treats the transport Access-Token guard as an authorization failure', () => {
    const error = toAppstoreAdminServiceError(
      new Error('This request requires Access-Token to be dispatched.'),
    );

    expect(error.kind).toBe('unauthorized');
    expect(error.isUnauthorized).toBe(true);
  });

  it('marks server and transient transport failures retryable', () => {
    expect(toAppstoreAdminServiceError({ code: 'SERVER_ERROR' }).isRetryable).toBe(true);
    expect(toAppstoreAdminServiceError({ code: 'NETWORK_ERROR' }).isRetryable).toBe(true);
    expect(toAppstoreAdminServiceError({ code: 'TIMEOUT' }).isRetryable).toBe(true);
    expect(toAppstoreAdminServiceError({ code: 'UNKNOWN', httpStatus: 429 }).isRetryable).toBe(true);
    expect(toAppstoreAdminServiceError({ code: 'UNKNOWN', httpStatus: 404 }).isRetryable).toBe(false);
  });

  it('attaches a missing operation id to an already normalized error', () => {
    const original = new AppstoreAdminServiceError({
      kind: 'validation',
      message: 'reasonDetail is required.',
      fieldErrors: [{ field: 'reasonDetail' }],
    });

    const stamped = toAppstoreAdminServiceError(original, 'appstore.moderation.decisions.create');
    expect(stamped.operationId).toBe('appstore.moderation.decisions.create');
    expect(stamped.kind).toBe('validation');
    expect(stamped.fieldErrors).toEqual([{ field: 'reasonDetail' }]);

    const alreadyStamped = new AppstoreAdminServiceError({
      kind: 'validation',
      message: 'reasonDetail is required.',
      operationId: 'appstore.moderation.decisions.create',
      fieldErrors: [],
    });
    expect(toAppstoreAdminServiceError(alreadyStamped, 'ignored.operation')).toBe(alreadyStamped);
  });

  it('surfaces an unconfigured runtime as its own failure kind', () => {
    const error = toAppstoreAdminServiceError(new AppstoreAdminRuntimeUnconfiguredError());
    expect(error.kind).toBe('runtimeUnconfigured');
    expect(error.message).toBe('The App Store backend-admin runtime is not configured.');
  });

  it('normalizes a rejected operation and keeps the operation id', async () => {
    await expect(
      executeAdminOperation('appstore.listings.admin.list', () =>
        Promise.reject({ code: 'SERVER_ERROR', httpStatus: 500 }),
      ),
    ).rejects.toMatchObject({
      name: 'AppstoreAdminServiceError',
      kind: 'server',
      httpStatus: 500,
      operationId: 'appstore.listings.admin.list',
    });

    await expect(
      executeAdminOperation('appstore.listings.admin.retrieve', () => Promise.resolve('record')),
    ).resolves.toBe('record');
  });

  it('refuses a blank required identifier before dispatch', () => {
    expect(() => requireAdminIdentifier('   ', 'listingId')).toThrow(AppstoreAdminServiceError);

    try {
      requireAdminIdentifier(undefined, 'listingId');
      throw new Error('expected requireAdminIdentifier to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppstoreAdminServiceError);
      expect((error as AppstoreAdminServiceError).kind).toBe('validation');
      expect((error as AppstoreAdminServiceError).fieldErrors).toEqual([{ field: 'listingId' }]);
    }

    expect(requireAdminIdentifier(' listing-1 ', 'listingId')).toBe('listing-1');
  });
});
