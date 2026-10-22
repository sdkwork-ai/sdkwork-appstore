import { describe, expect, it, vi } from 'vitest';
import type { DocumentsAppSdkClient } from '@sdkwork/documents-pc-commons';
import { registerDocumentsReferenceRuntime } from '@sdkwork/documents-pc-commons/runtime';
import {
  DEVELOPER_MARKET_SCHEMA_URL_PREFIX,
  loadApiReferenceSchemaTabs,
  loadApiReferenceSystem,
} from '@sdkwork/documents-pc-api-reference/apiReferenceSchemaTabs';

import {
  configureAppstorePcDeveloperMarket,
  readAppstorePcDeveloperMarketRuntime,
} from './developerMarketRuntime';

function documentsClientStub() {
  const apisList = vi.fn(async () => ({
    items: [
      {
        id: '8f2a6d10-0c9f-5a43-8b0c-6f1e4a7b2c11',
        moduleCode: 'sdkwork-documents',
        moduleName: 'SDKWork Documents',
        surfaceCode: 'app',
        surfaceName: 'App API',
        title: 'SDKWork Documents App API',
        description: 'Document storage and publishing.',
        apiVersion: '0.1.0',
        apiAuthority: 'sdkwork-documents-app-api',
        apiPrefix: '/app/v3/api',
        categoryCode: 'content-documents',
        categories: ['content-documents'],
        operationCount: 15,
        tagCount: 2,
        authModes: ['http'],
        tags: ['documents'],
        featured: true,
        deprecated: false,
        schemaAvailable: true,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 100,
  }));
  const apiSchemaRetrieve = vi.fn(async () => ({
    surfaceId: '8f2a6d10-0c9f-5a43-8b0c-6f1e4a7b2c11',
    apiAuthority: 'sdkwork-documents-app-api',
    schemaVersion: '0.1.0',
    schemaChecksum: 'abc',
    spec: { openapi: '3.1.2', info: { title: 'Documents', version: '0.1.0' }, paths: {} },
  }));
  const client = {
    developerCatalog: { apisList, apiSchemaRetrieve },
  } as unknown as DocumentsAppSdkClient;
  return { client, apisList, apiSchemaRetrieve };
}

describe('configureAppstorePcDeveloperMarket', () => {
  it('reads the catalog through the documents client', async () => {
    const { client, apisList, apiSchemaRetrieve } = documentsClientStub();
    configureAppstorePcDeveloperMarket({
      documentsAppClient: client,
      baseUrl: 'https://api.example.test',
    });

    const runtime = readAppstorePcDeveloperMarketRuntime();
    const systems = await runtime?.developerMarket?.listSystems();
    const schema = await runtime?.developerMarket?.loadSchema('surface-1');

    expect(apisList).toHaveBeenCalledTimes(1);
    expect(apiSchemaRetrieve).toHaveBeenCalledWith('surface-1');
    expect(systems?.[0]?.systemCode).toBe('8f2a6d10-0c9f-5a43-8b0c-6f1e4a7b2c11');
    expect(systems?.[0]?.systemName).toBe('SDKWork Documents App API');
    expect(schema).toEqual({ openapi: '3.1.2', info: { title: 'Documents', version: '0.1.0' }, paths: {} });
  });

  it('resolves playground request prefixes against the gateway origin', () => {
    const { client } = documentsClientStub();
    configureAppstorePcDeveloperMarket({
      documentsAppClient: client,
      baseUrl: 'https://api.example.test/',
    });

    const runtime = readAppstorePcDeveloperMarketRuntime();
    expect(runtime?.developerMarket?.resolveRequestBaseUrl?.('surface-1', '/v1'))
      .toBe('https://api.example.test/v1');
    expect(runtime?.developerMarket?.resolveRequestBaseUrl?.('surface-1', '/app/v3/api'))
      .toBe('https://api.example.test/app/v3/api');
    expect(runtime?.developerMarket?.resolveRequestBaseUrl?.('surface-1', 'https://other.test/v1'))
      .toBe('https://other.test/v1');
  });
});

describe('documents reference loader over the developer market runtime', () => {
  it('reads the roster and OpenAPI document from the runtime instead of window fetch', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const loadSchema = vi.fn(async () => ({
      openapi: '3.1.0',
      info: { title: 'LLM Open API', version: '1.0.0' },
      paths: {
        '/v1/chat/completions': {
          post: {
            tags: ['Chat'],
            summary: 'Create chat completion',
            responses: { 200: { description: 'ok' } },
          },
        },
      },
    }));
    registerDocumentsReferenceRuntime({
      readRuntimeEnv: () => undefined,
      resolveRuntimeBoolean: () => false,
      sdkSystemConfig: {},
      getDocumentsAppSdkClient: () => ({}) as never,
      developerMarket: {
        listSystems: async () => [
          {
            systemCode: 'llm-open-api',
            systemName: 'LLM Open API',
            availability: 'available',
            sortWeight: 10,
            schemaKey: 'gateway',
            aliases: ['gateway'],
            categories: [{ code: 'chat', name: 'Chat', endpointCount: 1, sortOrder: 1 }],
          },
        ],
        loadSchema,
      },
    });

    const manifest = await loadApiReferenceSchemaTabs();
    expect(manifest.tabs[0]?.id).toBe('llm-open-api');
    expect(manifest.tabs[0]?.schemaUrls[0])
      .toBe(`${DEVELOPER_MARKET_SCHEMA_URL_PREFIX}llm-open-api`);

    const system = await loadApiReferenceSystem(manifest.tabs[0]!);
    expect(loadSchema).toHaveBeenCalledWith('llm-open-api');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(system.categories[0]?.name).toBe('Chat');
    expect(system.categories[0]?.endpoints[0]?.path).toBe('/v1/chat/completions');
  });
});
