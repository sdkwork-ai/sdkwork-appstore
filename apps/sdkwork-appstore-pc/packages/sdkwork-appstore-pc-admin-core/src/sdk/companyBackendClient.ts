import {
  createClient,
  type SdkworkBackendClient,
} from '@sdkwork/company-backend-sdk';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

/**
 * Company backend-admin SDK client factory.
 *
 * Demand data — including the demand category tree the operator console
 * governs — is owned by the `sdkwork-company` domain. This factory is the only
 * place the App Store admin surface constructs that generated SDK; capability
 * packages consume the `demands` service port instead.
 */
export function createAppstorePcAdminCompanyBackendClient(options: {
  baseUrl: string;
  tokenManager: AuthTokenManager;
}): SdkworkBackendClient {
  return createClient({
    authMode: 'dual-token',
    baseUrl: normalizeCompanyBackendBaseUrl(options.baseUrl),
    platform: 'pc',
    tokenManager: options.tokenManager,
  });
}

function normalizeCompanyBackendBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/u, '');
  const apiPrefix = '/backend/v3/api';
  if (!normalized.endsWith(apiPrefix)) {
    return normalized;
  }
  return normalized.slice(0, -apiPrefix.length) || '/';
}
