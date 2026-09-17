/** Session token projection consumed by the generated SDK client. */
export interface AppstoreMpSession {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
}

let session: AppstoreMpSession = {};

export function readAppSdkSessionTokens(): AppstoreMpSession {
  return session;
}

export function resolveAppSdkAccessToken(
  candidate: AppstoreMpSession | null,
): string | undefined {
  const value = candidate?.accessToken?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function resolveAppSdkAuthToken(
  candidate: AppstoreMpSession | null,
): string | undefined {
  const value = candidate?.authToken?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function setAppSdkSession(next: AppstoreMpSession): void {
  session = next;
}

export function clearAppSdkSession(): void {
  session = {};
}
