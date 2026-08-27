import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';
function resolveViteEnvironment(mode: string | undefined, processEnv = process.env) {
  const profileMatch = /^(standalone|cloud)\.(development|test|staging|production)$/u.exec(mode ?? '');
  return profileMatch?.[2]
    ?? (['development', 'test', 'staging', 'production'].includes(processEnv.SDKWORK_ENVIRONMENT ?? '')
      ? (processEnv.SDKWORK_ENVIRONMENT ?? 'production')
      : 'production');
}
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createSdkworkCredentialEntryBootstrapVitePlugin } from '@sdkwork/iam-credential-entry/vite';
import { mergeRepoDevBootstrapAccessTokenEnv } from '@sdkwork/iam-credential-entry/node-bootstrap';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const DEFAULT_RENDERER_BIND = '0.0.0.0:18092';
const APP_API_PREFIX = '/app/v3/api';
const BACKEND_API_PREFIX = '/backend/v3/api';
const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = path.resolve(CONFIG_DIR, '../..');
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, '..');
const APP_MANIFEST_PATH = 'apps/sdkwork-appstore-pc/sdkwork.app.config.json';
const SDK_COMMON_SOURCE_ROOT = path.resolve(
  WORKSPACE_ROOT,
  'sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src',
);
const SDK_COMMON_ENTRY = path.resolve(SDK_COMMON_SOURCE_ROOT, 'index.ts');

function createSharedWorkspaceAliases() {
  return [
    { find: '@sdkwork/sdk-common/core', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'core/index.ts') },
    { find: '@sdkwork/sdk-common/auth', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'auth/index.ts') },
    { find: '@sdkwork/sdk-common/http', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'http/index.ts') },
    { find: '@sdkwork/sdk-common/errors', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'errors/index.ts') },
    { find: '@sdkwork/sdk-common/utils', replacement: path.resolve(SDK_COMMON_SOURCE_ROOT, 'utils/index.ts') },
    { find: '@sdkwork/sdk-common', replacement: SDK_COMMON_ENTRY },
  ];
}

function resolveTcpBinding(rawValue: string | undefined, fallback: string) {
  const raw = (rawValue?.trim() || fallback).trim();
  const match = raw.match(/^(?:\[([^\]]+)\]|([^:]+)):(\d+)$/u);
  const port = Number(match?.[3]);
  if (!match || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`TCP binding must use <host>:<port>, received: ${raw}`);
  }
  return {
    host: match[1] ?? match[2],
    port,
  };
}

function resolveGatewayOrigin(env: NodeJS.ProcessEnv): string {
  const configured =
    env.VITE_SDKWORK_APPSTORE_APPLICATION_PUBLIC_HTTP_URL?.trim()
    ?? env.SDKWORK_APPSTORE_APPLICATION_PUBLIC_HTTP_URL?.trim()
    ?? 'http://127.0.0.1:18090';
  const parsed = new URL(configured);
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('App Store gateway origin must be HTTP or HTTPS');
  }
  return parsed.origin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, CONFIG_DIR, '');
  const environment = mode.includes('production')
    ? 'production'
    : mode.includes('test') || mode.includes('staging')
      ? 'test'
      : 'development';
  const deploymentProfile =
    env.VITE_SDKWORK_DEPLOYMENT_PROFILE?.trim()
    ?? process.env.VITE_SDKWORK_DEPLOYMENT_PROFILE?.trim()
    ?? 'standalone';
  const mergedBootstrapEnv = mergeRepoDevBootstrapAccessTokenEnv({
    deploymentMode: deploymentProfile === 'cloud' ? 'saas' : 'local',
    env: { ...process.env, ...env },
    manifestPath: APP_MANIFEST_PATH,
    repoRoot: REPO_ROOT,
    runtimeTarget: 'browser',
  });
  const bootstrapAccessToken = mergedBootstrapEnv.SDKWORK_ACCESS_TOKEN;
  const rendererBind = resolveTcpBinding(
    process.env.SDKWORK_APPSTORE_INTERNAL_PC_RENDERER_BIND,
    DEFAULT_RENDERER_BIND,
  );
  const gatewayOrigin = resolveGatewayOrigin(process.env);

  return {
    build: {
      outDir: resolveBrowserDistOutDir(resolveViteEnvironment(mode, process.env)),
      emptyOutDir: true,
    },
    define: {
      'process.env.SDKWORK_ACCESS_TOKEN': JSON.stringify(bootstrapAccessToken ?? ''),
    },
    plugins: [
      createSdkworkCredentialEntryBootstrapVitePlugin({
        accessToken: bootstrapAccessToken,
        environment,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(CONFIG_DIR) },
        ...createSharedWorkspaceAliases(),
      ],
    },
    optimizeDeps: {
      include: ['@sdkwork/sdk-common', '@sdkwork/utils'],
      exclude: [
        '@sdkwork/auth-pc-react',
        '@sdkwork/auth-runtime-pc-react',
        '@sdkwork/iam-react',
        '@sdkwork/iam-runtime',
        '@sdkwork/iam-contracts',
        '@sdkwork/iam-credential-entry',
      ],
    },
    server: {
      host: rendererBind.host,
      port: rendererBind.port,
      strictPort: true,
      fs: {
        allow: [CONFIG_DIR, REPO_ROOT, WORKSPACE_ROOT],
      },
      proxy: {
        [APP_API_PREFIX]: {
          target: gatewayOrigin,
          changeOrigin: true,
        },
        [BACKEND_API_PREFIX]: {
          target: gatewayOrigin,
          changeOrigin: true,
        },
        '/openapi.json': {
          target: gatewayOrigin,
          changeOrigin: true,
        },
        '/healthz': {
          target: gatewayOrigin,
          changeOrigin: true,
        },
        '/readyz': {
          target: gatewayOrigin,
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true'
        ? {
            host: rendererBind.host === '0.0.0.0' ? '127.0.0.1' : rendererBind.host,
            port: rendererBind.port,
          }
        : false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
