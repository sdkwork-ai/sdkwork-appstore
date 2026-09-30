import { HttpClient, createHttpClient } from './http/client';
import type { SdkworkCustomConfig } from './types/common';

import { ReleasesApi, createReleasesApi } from './api/releases';
import { ArtifactsApi, createArtifactsApi } from './api/artifacts';
import { ListingsApi, createListingsApi } from './api/listings';
import { CatalogApi, createCatalogApi } from './api/catalog';
import { UserStoreApi, createUserStoreApi } from './api/user-store';
import { AutomationApi, createAutomationApi } from './api/automation';

export class SdkworkAppstoreOpenClient {
  private httpClient: HttpClient;

  public readonly releases: ReleasesApi;
  public readonly artifacts: ArtifactsApi;
  public readonly listings: ListingsApi;
  public readonly catalog: CatalogApi;
  public readonly userStore: UserStoreApi;
  public readonly automation: AutomationApi;

  constructor(config: SdkworkCustomConfig) {
    this.httpClient = createHttpClient(config);
    this.releases = createReleasesApi(this.httpClient);

    this.artifacts = createArtifactsApi(this.httpClient);

    this.listings = createListingsApi(this.httpClient);

    this.catalog = createCatalogApi(this.httpClient);

    this.userStore = createUserStoreApi(this.httpClient);

    this.automation = createAutomationApi(this.httpClient);
  }

  setApiKey(apiKey: string): this {
    this.httpClient.setApiKey(apiKey);
    return this;
  }
  get http(): HttpClient {
    return this.httpClient;
  }
}

export function createClient(config: SdkworkCustomConfig): SdkworkAppstoreOpenClient {
  return new SdkworkAppstoreOpenClient(config);
}

export default SdkworkAppstoreOpenClient;
