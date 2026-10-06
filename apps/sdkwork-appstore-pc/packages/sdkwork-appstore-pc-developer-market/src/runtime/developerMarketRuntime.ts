/**
 * Runtime adapter that binds the SDKWork Documents developer-market surfaces
 * (API reference / SDK reference) to the App Store runtime.
 *
 * The documents feature packages never build their own transport; they read a
 * `DocumentsReferenceRuntime` registered by the embedding host. This module is
 * that registration for the App Store: `configureAppstorePcDeveloperMarket`
 * mints the documents app SDK client over the shared gateway with the App
 * Store's single TokenManager, and the API-market pages read it back.
 *
 * The module graph stays free of React: the runtime package wires it from
 * `createAppstorePcRuntime` (the same lane as `configureAppstorePcPaidCheckout`)
 * without pulling the documents UI into the runtime bundle graph.
 */
import type {
  DocumentsAppSdkClient,
  DocumentsGeneratedSdkMetadata,
  DocumentsReferenceRuntime,
} from '@sdkwork/documents-pc-commons';

/** Documents surfaces resolve relative schema URLs against the app API root. */
export const DEVELOPER_MARKET_APP_API_PREFIX = '/app/v3/api';

/** Wiring accepted by `configureAppstorePcDeveloperMarket`. */
export interface AppstorePcDeveloperMarketConfig {
  /**
   * Documents app SDK client bound by the app core SDK inventory; this
   * feature package never constructs generated SDK transports itself.
   */
  documentsAppClient: DocumentsAppSdkClient;
}

// Bundlers that cannot keep `import.meta` semantics collapse the expression to
// `{}.env === undefined`; fall back to an empty bag so the resolver works
// outside a Vite app shell (same lane as the runtime package's environment.ts).
const importMetaEnv: Record<string, string | undefined> =
  (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

function readDeveloperMarketRuntimeEnv(name: string): string | undefined {
  const embedded = (
    typeof window === 'undefined'
      ? undefined
      : (window as Window & { __SDKWORK_DOCUMENTS_ENV__?: Record<string, unknown> })
          .__SDKWORK_DOCUMENTS_ENV__
  )?.[name];
  if (typeof embedded === 'string' && embedded.trim()) return embedded.trim();
  const value = importMetaEnv[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function resolveDeveloperMarketRuntimeBoolean(name: string, defaultValue = false): boolean {
  const value = readDeveloperMarketRuntimeEnv(name);
  if (!value) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

function developerMarketSdkMetadata(
  partial: Omit<DocumentsGeneratedSdkMetadata, 'archiveLanguage' | 'version'>,
): DocumentsGeneratedSdkMetadata {
  return {
    version: '0.1.0',
    archiveLanguage: 'typescript',
    ...partial,
  };
}

const LLM_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkAiClient',
  packageName: '@sdkwork/cloudrouter-open-sdk',
  sdkType: 'ai',
  apiPrefix: '/v1',
  // base-url-check: exempt (sdk metadata naming an authored env key)
  runtimeEnvName: 'VITE_API_BASE_URL',
  sourceDir: 'sdks/cloudrouter-open-sdk/cloudrouter-open-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-cloudrouter-open-sdk-typescript-0.1.0.zip',
  description: 'SDKWork LLM Open API SDK',
});

const DRIVE_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkDriveAppClient',
  packageName: '@sdkwork/drive-app-sdk',
  sdkType: 'drive',
  apiPrefix: '/open/v3/api',
  runtimeEnvName: 'VITE_SDKWORK_DRIVE_OPEN_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-drive-app-sdk/sdkwork-drive-app-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-drive-app-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Drive Open API SDK',
});

const MEMORY_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkMemoryAppClient',
  packageName: '@sdkwork/memory-app-sdk',
  sdkType: 'memory',
  apiPrefix: '/mem/v3/api',
  runtimeEnvName: 'VITE_SDKWORK_MEMORY_OPEN_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-memory-app-sdk/sdkwork-memory-app-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-memory-app-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Memory Open API SDK',
});

const AGENT_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkAgentAppClient',
  packageName: '@sdkwork/agents-app-sdk',
  sdkType: 'agent',
  apiPrefix: '/agent/v3/api',
  runtimeEnvName: 'VITE_SDKWORK_AGENT_OPEN_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-agents-app-sdk/sdkwork-agent-app-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-agents-app-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Agent Open API SDK',
});

const PAYMENT_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkPaymentClient',
  packageName: '@sdkwork/cloudrouter-app-sdk/domains',
  sdkType: 'payment',
  apiPrefix: '/payments/v3',
  runtimeEnvName: 'VITE_SDKWORK_COMMERCE_APP_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-commerce-app-sdk/sdkwork-commerce-app-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-commerce-app-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Payment Open API SDK',
});

const IAAS_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkCloudClient',
  packageName: '@sdkwork/cloudrouter-open-sdk',
  sdkType: 'iaas',
  apiPrefix: '/cloud/v3',
  runtimeEnvName: 'VITE_SDKWORK_IAAS_OPEN_API_BASE_URL',
  sourceDir: 'sdks/cloudrouter-open-sdk/cloudrouter-open-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-cloudrouter-open-sdk-typescript-0.1.0.zip',
  description: 'SDKWork IaaS Open API SDK',
});

const PAAS_OPEN_API_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkPaasClient',
  packageName: '@sdkwork/cloudrouter-open-sdk',
  sdkType: 'paas',
  apiPrefix: '/paas/v3',
  runtimeEnvName: 'VITE_SDKWORK_PAAS_OPEN_API_BASE_URL',
  sourceDir: 'sdks/cloudrouter-open-sdk/cloudrouter-open-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-cloudrouter-open-sdk-typescript-0.1.0.zip',
  description: 'SDKWork PaaS Open API SDK',
});

const DOCUMENTS_APP_SDK_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkDocumentsAppClient',
  packageName: '@sdkwork/documents-app-sdk',
  sdkType: 'app',
  apiPrefix: DEVELOPER_MARKET_APP_API_PREFIX,
  runtimeEnvName: 'VITE_SDKWORK_DOCUMENTS_APP_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-documents-app-sdk/sdkwork-documents-app-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-documents-app-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Documents app API SDK',
});

const DOCUMENTS_BACKEND_SDK_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkDocumentsBackendClient',
  packageName: '@sdkwork/documents-backend-sdk',
  sdkType: 'backend',
  apiPrefix: '/backend/v3/api',
  runtimeEnvName: 'VITE_SDKWORK_DOCUMENTS_BACKEND_API_BASE_URL',
  sourceDir:
    'sdks/sdkwork-documents-backend-sdk/sdkwork-documents-backend-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-documents-backend-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Documents backend API SDK',
});

const DOCUMENTS_OPEN_SDK_METADATA = developerMarketSdkMetadata({
  name: 'SdkworkDocumentsOpenClient',
  packageName: '@sdkwork/documents-sdk',
  sdkType: 'ai',
  apiPrefix: '/doc/v3/api',
  runtimeEnvName: 'VITE_SDKWORK_DOCUMENTS_OPEN_API_BASE_URL',
  sourceDir: 'sdks/sdkwork-documents-sdk/sdkwork-documents-sdk-typescript/src/index.ts',
  archiveName: 'sdkwork-documents-sdk-typescript-0.1.0.zip',
  description: 'SDKWork Documents open API SDK',
});

/**
 * SDK system metadata behind the SDK-reference page. Hand-mirrored from the
 * documents app's `src/bootstrap/sdkSystemConfig.ts` ("Re-sync by hand"): the
 * table names the SDKWork SDK family the shared gateway serves, and the system
 * ids must line up with the gateway's `/openapi/schema-tabs.json` entries.
 */
const DEVELOPER_MARKET_SDK_SYSTEM_CONFIG: Record<string, DocumentsGeneratedSdkMetadata> = {
  'llm-open-api': LLM_OPEN_API_METADATA,
  'image-open-api': { ...LLM_OPEN_API_METADATA, description: 'SDKWork Image Open API SDK' },
  'video-open-api': { ...LLM_OPEN_API_METADATA, description: 'SDKWork Video Open API SDK' },
  'audio-open-api': { ...LLM_OPEN_API_METADATA, description: 'SDKWork Audio Open API SDK' },
  'drive-open-api': DRIVE_OPEN_API_METADATA,
  'knowledgebase-open-api': { ...LLM_OPEN_API_METADATA, description: 'SDKWork Knowledgebase Open API SDK' },
  'memory-open-api': MEMORY_OPEN_API_METADATA,
  'agent-open-api': AGENT_OPEN_API_METADATA,
  'payment-open-api': PAYMENT_OPEN_API_METADATA,
  'iaas-open-api': IAAS_OPEN_API_METADATA,
  'paas-open-api': PAAS_OPEN_API_METADATA,
  'app-api': DOCUMENTS_APP_SDK_METADATA,
  'backend-api': DOCUMENTS_BACKEND_SDK_METADATA,
  'documents-open-api': DOCUMENTS_OPEN_SDK_METADATA,
  gateway: LLM_OPEN_API_METADATA,
  'cloud-services': IAAS_OPEN_API_METADATA,
  'paas-api': PAAS_OPEN_API_METADATA,
  'payment-aggregate': PAYMENT_OPEN_API_METADATA,
  'voice-open-api': { ...LLM_OPEN_API_METADATA, description: 'SDKWork Voice Open API SDK' },
  app: DOCUMENTS_APP_SDK_METADATA,
  backend: DOCUMENTS_BACKEND_SDK_METADATA,
  'sdkwork-drive-open-api': DRIVE_OPEN_API_METADATA,
  'sdkwork-drive.open': DRIVE_OPEN_API_METADATA,
  'sdkwork-knowledgebase-open-api': {
    ...LLM_OPEN_API_METADATA,
    description: 'SDKWork Knowledgebase Open API SDK',
  },
  'sdkwork-memory-open-api': MEMORY_OPEN_API_METADATA,
  'sdkwork-agent-open-api': AGENT_OPEN_API_METADATA,
};

let developerMarketRuntime: DocumentsReferenceRuntime | null = null;

/**
 * Bind the documents reference runtime for the App Store's developer market.
 * Called from `createAppstorePcRuntime` so embedded and standalone runtimes
 * wire it through one lane.
 */
export function configureAppstorePcDeveloperMarket(config: AppstorePcDeveloperMarketConfig): void {
  developerMarketRuntime = {
    readRuntimeEnv: readDeveloperMarketRuntimeEnv,
    resolveRuntimeBoolean: resolveDeveloperMarketRuntimeBoolean,
    sdkSystemConfig: DEVELOPER_MARKET_SDK_SYSTEM_CONFIG,
    // The generated client satisfies `DocumentsAppSdkClient` directly; the
    // documents reference runtime consumes its `documents.sdkReference`
    // surface, so no reshaping adapter sits in between.
    getDocumentsAppSdkClient: () => config.documentsAppClient,
    playgroundUserAgent: 'SDKWork-AppStore-DeveloperMarket/1.0.0',
  };
}

/**
 * Read the configured documents reference runtime.
 * @returns the runtime, or null before `configureAppstorePcDeveloperMarket`.
 */
export function readAppstorePcDeveloperMarketRuntime(): DocumentsReferenceRuntime | null {
  return developerMarketRuntime;
}
