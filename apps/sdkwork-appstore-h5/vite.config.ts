import { resolveBrowserDistOutDir } from '../../../sdkwork-specs/tools/browser-dist-layout.mjs';
function resolveViteEnvironment(mode, processEnv = process.env) {
  const profileMatch = /^(standalone|cloud)\.(development|test|staging|production)$/u.exec(mode ?? '');
  return profileMatch?.[2]
    ?? (['development', 'test', 'staging', 'production'].includes(processEnv.SDKWORK_ENVIRONMENT ?? '')
      ? processEnv.SDKWORK_ENVIRONMENT
      : 'production');
}
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url));
const WORKSPACE_ROOT = path.resolve(CONFIG_DIR, '../../..');
const SDK_COMMON_SOURCE_ROOT = path.resolve(
  WORKSPACE_ROOT,
  'sdkwork-sdk-commons/sdkwork-sdk-common-typescript/src',
);
const SDK_COMMON_ENTRY = path.resolve(SDK_COMMON_SOURCE_ROOT, 'index.ts');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, CONFIG_DIR, '');
  return {
    build: {
      outDir: resolveBrowserDistOutDir(resolveViteEnvironment(mode, process.env)),
      emptyOutDir: true,
    },
    define: {
      'process.env.SDKWORK_ACCESS_TOKEN': JSON.stringify(env.SDKWORK_ACCESS_TOKEN ?? ''),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(CONFIG_DIR, './src') },
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
