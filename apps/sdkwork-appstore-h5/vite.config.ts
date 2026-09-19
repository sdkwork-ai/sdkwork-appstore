import {
  resolveViteEnvironment,
  resolveViteRuntimeProfile,
  resolveLucideReactEntry,
} from '../../../sdkwork-specs/tools/vite-runtime-profile.mjs';
import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';

import tailwindcss from '@tailwindcss/vite';
import { createSdkworkCredentialEntryBootstrapVitePlugin } from '@sdkwork/iam-credential-entry/vite';
import { mergeRepoDevBootstrapAccessTokenEnv } from '@sdkwork/iam-credential-entry/node-bootstrap';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// `vite-runtime-profile.mjs` ships as an untyped Node script, so TypeScript
// infers its second parameter as `undefined`. The runtime contract is Node's
// ProcessEnv (it reads SDKWORK_ENVIRONMENT / SDKWORK_DEPLOYMENT_PROFILE); bind
// that contract here once instead of loosening the shared spec tool.
const resolveEnvironment = resolveViteEnvironment as (
  mode: string | undefined,
  processEnv?: NodeJS.ProcessEnv,
) => string;
const resolveRuntimeProfile = resolveViteRuntimeProfile as (
  mode: string | undefined,
  processEnv?: NodeJS.ProcessEnv,
) => { deploymentProfile: string; environment: string; profileId: string };

const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url));
const WORKSPACE_ROOT = path.resolve(CONFIG_DIR, '../../..');
const REPO_ROOT = path.resolve(CONFIG_DIR, '../..');
/** Surface manifest that owns the credential-entry bootstrap identity. */
const APP_MANIFEST_PATH = 'apps/sdkwork-appstore-h5/sdkwork.app.config.json';
const SDK_COMMON_SOURCE_ROOT = path.resolve(
  WORKSPACE_ROOT,
  'sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src',
);
const SDK_COMMON_ENTRY = path.resolve(SDK_COMMON_SOURCE_ROOT, 'index.ts');
const IAM_CREDENTIAL_ENTRY_SOURCE_ROOT = path.resolve(
  WORKSPACE_ROOT,
  'sdkwork-iam/apps/sdkwork-iam-common/packages/sdkwork-iam-credential-entry/src',
);

/**
 * Resolve the private credential-entry bootstrap Access-Token for this renderer
 * (`IAM_CREDENTIAL_ENTRY_SPEC.md` section 4/5).
 *
 * The login page cannot render without a bootstrap credential: every IAM
 * runtime / verification-policy operation is access-token-only and the generated
 * SDK fails before network dispatch when the TokenManager holds none. The Vite
 * serve process is the handoff point for the development renderer, and the
 * token is injected as `globalThis.__SDKWORK_CREDENTIAL_ENTRY_BOOTSTRAP_ACCESS_TOKEN__`
 * by `createSdkworkCredentialEntryBootstrapVitePlugin` — never through a `define`
 * replacement, which would bake a server credential into browser artifacts.
 *
 * Generation is development-only. Test, staging, demo, and production
 * environments never generate and never embed a token.
 */
function resolveCredentialEntryBootstrapAccessToken({
  command,
  mode,
  environment,
  deploymentProfile,
}: {
  command: string;
  mode: string;
  environment: string;
  deploymentProfile: string;
}): string | undefined {
  const privateEnv = loadEnv(mode, CONFIG_DIR, '');
  const mergedEnv = { ...process.env, ...privateEnv };
  if (command !== 'serve' || environment !== 'development') {
    return mergedEnv.SDKWORK_ACCESS_TOKEN;
  }
  try {
    return mergeRepoDevBootstrapAccessTokenEnv({
      deploymentMode: deploymentProfile === 'cloud' ? 'saas' : 'local',
      env: mergedEnv,
      manifestPath: APP_MANIFEST_PATH,
      repoRoot: REPO_ROOT,
      runtimeTarget: 'browser',
    }).SDKWORK_ACCESS_TOKEN;
  } catch (error) {
    // Fail closed with an actionable warning: breaking the renderer would hide
    // the provisioning gap, while a missing token only leaves the login page
    // reporting unavailable IAM metadata.
    process.stderr.write(
      '[sdkwork-appstore-h5] credential-entry bootstrap Access-Token resolution failed: '
      + `${error instanceof Error ? error.message : String(error)}\n`,
    );
    return mergedEnv.SDKWORK_ACCESS_TOKEN;
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, CONFIG_DIR, '');
  const runtimeProfile = resolveRuntimeProfile(mode, process.env);
  const credentialEntryBootstrapAccessToken = resolveCredentialEntryBootstrapAccessToken({
    command,
    deploymentProfile: runtimeProfile.deploymentProfile,
    environment: runtimeProfile.environment,
    mode,
  });

  return {
    build: {
      outDir: resolveBrowserDistOutDir(resolveEnvironment(mode, process.env)),
      emptyOutDir: true,
    },
    // The bootstrap credential reaches the renderer through the IAM Vite plugin
    // below (dev-server HTML injection) and must never be exposed to the client
    // bundle through `define` (`IAM_CREDENTIAL_ENTRY_SPEC.md`).
    plugins: [
      createSdkworkCredentialEntryBootstrapVitePlugin({
        accessToken: credentialEntryBootstrapAccessToken,
        environment: runtimeProfile.environment,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(CONFIG_DIR, './src') },
        // Cross-repository workspace packages resolve through their own
        // node_modules links; alias the credential-entry surfaces explicitly so
        // the Vite config works before a workspace install materializes them.
        {
          find: /^@sdkwork\/iam-credential-entry\/vite$/u,
          replacement: path.resolve(IAM_CREDENTIAL_ENTRY_SOURCE_ROOT, 'vite.ts'),
        },
        {
          find: /^@sdkwork\/iam-credential-entry\/node-bootstrap$/u,
          replacement: path.resolve(IAM_CREDENTIAL_ENTRY_SOURCE_ROOT, 'node-bootstrap.mjs'),
        },
        { find: '@sdkwork/sdk-common/core', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'core/index.ts') },
        { find: '@sdkwork/sdk-common/auth', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'auth/index.ts') },
        { find: '@sdkwork/sdk-common/http', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'http/index.ts') },
        { find: '@sdkwork/sdk-common/errors', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'errors/index.ts') },
        { find: '@sdkwork/sdk-common/utils', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'utils/index.ts') },
        { find: '@sdkwork/sdk-common', replacement: SDK_COMMON_ENTRY },
      ],
    },
    optimizeDeps: {
      include: ['@sdkwork/sdk-common', '@sdkwork/utils'],
      exclude: ['@sdkwork/iam-credential-entry'],
    },
    server: {
      port: 3001,
      proxy: {
        '/app/v3/api': {
          target: 'http://127.0.0.1:18090',
          changeOrigin: true,
        },
        '/store/v3/api': {
          target: 'http://127.0.0.1:18092',
          changeOrigin: true,
        },
      },
    },
  };
});
