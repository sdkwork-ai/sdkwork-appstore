import {
  createAppstorePcIamAppClient,
  type AppstorePcIamAppClient,
} from '@sdkwork/appstore-pc-core';
import {
  createSdkworkAppbasePcAuthRuntime,
  type SdkworkAppbasePcAuthRuntimeComposition,
  type SdkworkAppbasePcAuthRuntimeSdkClient,
} from '@sdkwork/auth-runtime-pc-react';
import type { IamAppContext, IamDeploymentMode, IamEnvironment } from '@sdkwork/iam-contracts';
import type { IamRuntime } from '@sdkwork/iam-runtime';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import { prepareAppstorePcCredentialEntryTokens } from './credentialEntry';
import type { AppstorePcRuntimeConfig } from './environment';
import { type AppstorePcSdkClientInventory } from './sdkClients';
import type { AppstorePcSessionSnapshot, AppstorePcSessionStore } from './sessionStore';
import { sessionSnapshotsEqual } from './sessionStore';

export type AppstorePcIamRuntime = IamRuntime & {
  composition: SdkworkAppbasePcAuthRuntimeComposition;
  session: AppstorePcSessionStore;
};

export interface CreateAppstorePcIamRuntimeOptions {
  config: AppstorePcRuntimeConfig;
  sdkClients: AppstorePcSdkClientInventory;
  session: AppstorePcSessionStore;
  tokenManager: AuthTokenManager;
}

interface IamSessionLike {
  accessToken?: string;
  authToken?: string;
  expiresAt?: number | string;
  refreshToken?: string;
  sessionId?: string;
  context?: IamAppContext;
  user?: unknown;
}

export function createAppstorePcIamRuntime(
  options: CreateAppstorePcIamRuntimeOptions,
): AppstorePcIamRuntime {
  const appbaseApp = createAppbaseAppClient(options.config, options.tokenManager);
  const composition = createSdkworkAppbasePcAuthRuntime({
    app: {
      appId: options.config.appKey,
      deploymentMode: toIamDeploymentMode(options.config.deploymentProfile),
      environment: toIamEnvironment(options.config.environment),
      platform: 'pc',
    },
    baseUrls: {
      appbaseAppApiBaseUrl: options.config.iamAppApiBaseUrl,
    },
    createAppbaseAppClient: () => appbaseApp,
    credentialEntry: {
      prepareTokens: () =>
        prepareAppstorePcCredentialEntryTokens(options.tokenManager, options.session),
    },
    localeProvider: () => options.config.locale,
    sdkClients: [
      options.sdkClients.app.generated,
      options.sdkClients.agents,
      options.sdkClients.skills,
      options.sdkClients.mcp,
    ] as SdkworkAppbasePcAuthRuntimeSdkClient[],
    sessionBridge: {
      clearSession: () => options.session.clearSession(),
      commitSession: (session) =>
        commitIamSession(options.session, session as IamSessionLike),
      readSession: () => toIamBridgeSession(options.session.getSnapshot()),
    },
    tokenManager: options.tokenManager,
  });

  return {
    ...composition.runtime,
    composition,
    session: options.session,
  };
}

function createAppbaseAppClient(
  config: AppstorePcRuntimeConfig,
  tokenManager: AuthTokenManager,
): AppstorePcIamAppClient {
  return createAppstorePcIamAppClient(config, tokenManager);
}

function commitIamSession(
  store: AppstorePcSessionStore,
  session: IamSessionLike,
): IamSessionLike | undefined {
  const snapshot: AppstorePcSessionSnapshot = {
    ...store.getSnapshot(),
    accessToken: session.accessToken,
    authToken: session.authToken,
    expiresAt: session.expiresAt,
    refreshToken: session.refreshToken,
    sessionId: session.sessionId ?? session.context?.sessionId,
    context: session.context,
    user: session.user,
  };

  if (!snapshot.context) {
    delete snapshot.context;
  }
  if (sessionSnapshotsEqual(store.getSnapshot(), snapshot)) {
    return toIamBridgeSession(store.getSnapshot()) ?? undefined;
  }
  store.setSession(snapshot);
  return toIamBridgeSession(store.getSnapshot()) ?? undefined;
}

function toIamBridgeSession(snapshot: AppstorePcSessionSnapshot): IamSessionLike | null {
  if (!snapshot.authToken && !snapshot.accessToken && !snapshot.refreshToken) {
    return null;
  }

  return {
    ...(snapshot.accessToken ? { accessToken: snapshot.accessToken } : {}),
    ...(snapshot.authToken ? { authToken: snapshot.authToken } : {}),
    ...(snapshot.expiresAt ? { expiresAt: snapshot.expiresAt } : {}),
    ...(snapshot.refreshToken ? { refreshToken: snapshot.refreshToken } : {}),
    ...(snapshot.sessionId ? { sessionId: snapshot.sessionId } : {}),
    ...(snapshot.context ? { context: snapshot.context } : {}),
    ...(snapshot.user ? { user: snapshot.user } : {}),
  };
}

function toIamDeploymentMode(
  profile: AppstorePcRuntimeConfig['deploymentProfile'],
): IamDeploymentMode {
  return profile === 'cloud' ? 'saas' : 'local';
}

function toIamEnvironment(environment: AppstorePcRuntimeConfig['environment']): IamEnvironment {
  if (environment === 'development') {
    return 'dev';
  }
  if (environment === 'production') {
    return 'prod';
  }
  return 'test';
}
