import { HttpClient, createHttpClient } from './http/client';
import type { SdkworkAppConfig } from './types/common';
import type { AuthTokenManager } from '@sdkwork/sdk-common';

import { CatalogApi, createCatalogApi } from './api/catalog';
import { ListingsApi, createListingsApi } from './api/listings';
import { ReleasesApi, createReleasesApi } from './api/releases';
import { PublishersApi, createPublishersApi } from './api/publishers';
import { ComplianceApi, createComplianceApi } from './api/compliance';
import { LibraryApi, createLibraryApi } from './api/library';
import { WishlistApi, createWishlistApi } from './api/wishlist';
import { UserStoreApi, createUserStoreApi } from './api/user-store';
import { DownloadGrantsApi, createDownloadGrantsApi } from './api/download-grants';

export class SdkworkAppstoreAppClient {
  private httpClient: HttpClient;

  public readonly catalog: CatalogApi;
  public readonly listings: ListingsApi;
  public readonly releases: ReleasesApi;
  public readonly publishers: PublishersApi;
  public readonly compliance: ComplianceApi;
  public readonly library: LibraryApi;
  public readonly wishlist: WishlistApi;
  public readonly userStore: UserStoreApi;
  public readonly downloadGrants: DownloadGrantsApi;

  constructor(config: SdkworkAppConfig) {
    this.httpClient = createHttpClient(config);
    this.catalog = createCatalogApi(this.httpClient);

    this.listings = createListingsApi(this.httpClient);

    this.releases = createReleasesApi(this.httpClient);

    this.publishers = createPublishersApi(this.httpClient);

    this.compliance = createComplianceApi(this.httpClient);

    this.library = createLibraryApi(this.httpClient);

    this.wishlist = createWishlistApi(this.httpClient);

    this.userStore = createUserStoreApi(this.httpClient);

    this.downloadGrants = createDownloadGrantsApi(this.httpClient);
  }
  setAuthToken(token: string): this {
    this.httpClient.setAuthToken(token);
    return this;
  }

  setAccessToken(token: string): this {
    this.httpClient.setAccessToken(token);
    return this;
  }

  setTokenManager(manager: AuthTokenManager): this {
    this.httpClient.setTokenManager(manager);
    return this;
  }

  get http(): HttpClient {
    return this.httpClient;
  }
}

export function createClient(config: SdkworkAppConfig): SdkworkAppstoreAppClient {
  return new SdkworkAppstoreAppClient(config);
}

export default SdkworkAppstoreAppClient;
