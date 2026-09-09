import {resolveBaseUrlWithAlignProtocol} from '@sdkwork/sdk-common';

export interface RuntimeEnvironment {
  name: 'development' | 'test' | 'staging' | 'production';
  appstoreAppApiBaseUrl: string;
  appstoreOpenApiBaseUrl: string;
  appbaseBaseUrl: string;
  driveAppApiBaseUrl: string;
  commentsAppApiBaseUrl: string;
}

// Derive the shared gateway origin through @sdkwork/sdk-common (env + brand +
// protocol aware), eliminating the hardcoded localhost defaults. All the app
// service surfaces ride the same SDKWork gateway origin; VITE_* overrides and
// the runtime-env element still take precedence at consumption time.
const resolvedOrigin = resolveBaseUrlWithAlignProtocol().url;

const defaultEnvironment: RuntimeEnvironment = {
  name: 'development',
  appstoreAppApiBaseUrl: resolvedOrigin,
  appstoreOpenApiBaseUrl: resolvedOrigin,
  appbaseBaseUrl: resolvedOrigin,
  driveAppApiBaseUrl: resolvedOrigin,
  commentsAppApiBaseUrl: resolvedOrigin,
};

let currentEnvironment: RuntimeEnvironment = defaultEnvironment;

export function getEnvironment(): RuntimeEnvironment {
  return currentEnvironment;
}

export function setEnvironment(env: Partial<RuntimeEnvironment>): void {
  currentEnvironment = { ...currentEnvironment, ...env };
}

export function loadEnvironmentFromConfig(): RuntimeEnvironment {
  try {
    const configEl = document.getElementById('runtime-env');
    if (configEl) {
      const config = JSON.parse(configEl.textContent || '{}');
      setEnvironment(config);
    }
  } catch {
    // Use default environment
  }
  return currentEnvironment;
}
