import { customApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { ArtifactResolveDownloadRequest } from '../types';


export class ArtifactsAppstoreArtifactsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Resolve artifact download location from grant or entitlement */
  async resolveDownload(body: ArtifactResolveDownloadRequest, requestOptions?: ApiRequestOptions): Promise<{ downloadUrl?: string; expiresAt?: string; checksumSha256?: string; fileSizeBytes?: string; }> {
    return this.client.request<{ downloadUrl?: string; expiresAt?: string; checksumSha256?: string; fileSizeBytes?: string; }>(customApiPath(`/artifacts/resolve_download`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class ArtifactsAppstoreApi {
  public readonly artifacts: ArtifactsAppstoreArtifactsApi;

  constructor(client: HttpClient) {
    this.artifacts = new ArtifactsAppstoreArtifactsApi(client);
  }

}

export class ArtifactsApi {
  public readonly appstore: ArtifactsAppstoreApi;

  constructor(client: HttpClient) {
    this.appstore = new ArtifactsAppstoreApi(client);
  }

}

export function createArtifactsApi(client: HttpClient): ArtifactsApi {
  return new ArtifactsApi(client);
}
