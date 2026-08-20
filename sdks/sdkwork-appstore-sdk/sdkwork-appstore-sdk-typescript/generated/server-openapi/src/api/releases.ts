import { customApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { PublicRelease, ReleaseCheckUpdateRequest } from '../types';


export class ReleasesAppstoreReleasesPublicApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Retrieve public release metadata */
  async retrieve(releaseId: string, requestOptions?: ApiRequestOptions): Promise<PublicRelease> {
    return this.client.request<PublicRelease>(customApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, skipAuth: true, sdkworkUnwrapKind: 'item' });
  }
}

export class ReleasesAppstoreReleasesApi {
  private client: HttpClient;
  public readonly public: ReleasesAppstoreReleasesPublicApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.public = new ReleasesAppstoreReleasesPublicApi(client);
  }


/** Check whether a newer release is available */
  async checkUpdate(body: ReleaseCheckUpdateRequest, requestOptions?: ApiRequestOptions): Promise<{ updateAvailable?: boolean; releaseId?: string; versionName?: string; versionCode?: string; mandatory?: boolean; artifactId?: string; }> {
    return this.client.request<{ updateAvailable?: boolean; releaseId?: string; versionName?: string; versionCode?: string; mandatory?: boolean; artifactId?: string; }>(customApiPath(`/releases/check_update`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class ReleasesAppstoreApi {
  public readonly releases: ReleasesAppstoreReleasesApi;

  constructor(client: HttpClient) {
    this.releases = new ReleasesAppstoreReleasesApi(client);
  }

}

export class ReleasesApi {
  public readonly appstore: ReleasesAppstoreApi;

  constructor(client: HttpClient) {
    this.appstore = new ReleasesAppstoreApi(client);
  }

}

export function createReleasesApi(client: HttpClient): ReleasesApi {
  return new ReleasesApi(client);
}



interface PathParameterSpec {
  name: string;
  style: string;
  explode: boolean;
}

function serializePathParameter(value: unknown, spec: PathParameterSpec): string {
  if (value === undefined || value === null) {
    return '';
  }

  const style = spec.style || 'simple';
  if (Array.isArray(value)) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (typeof value === 'object') {
    return serializePathObject(spec.name, value as Record<string, unknown>, style, spec.explode);
  }
  return pathPrefix(spec.name, style, false) + encodePathValue(serializePathPrimitive(value));
}

function serializePathArray(name: string, values: unknown[], style: string, explode: boolean): string {
  const serialized = values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => encodePathValue(serializePathPrimitive(item)));
  if (serialized.length === 0) {
    return pathPrefix(name, style, false);
  }
  if (style === 'matrix') {
    return explode
      ? serialized.map((item) => `;${name}=${item}`).join('')
      : `;${name}=${serialized.join(',')}`;
  }
  return pathPrefix(name, style, false) + serialized.join(explode ? '.' : ',');
}

function serializePathObject(name: string, value: Record<string, unknown>, style: string, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return pathPrefix(name, style, true);
  }
  if (style === 'matrix') {
    return explode
      ? entries.map(([key, entryValue]) => `;${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join('')
      : `;${name}=${entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',')}`;
  }
  const serialized = explode
    ? entries.map(([key, entryValue]) => `${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join(style === 'label' ? '.' : ',')
    : entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',');
  return pathPrefix(name, style, true) + serialized;
}

function pathPrefix(name: string, style: string, _objectValue: boolean): string {
  if (style === 'label') return '.';
  if (style === 'matrix') return `;${name}`;
  return '';
}

function encodePathValue(value: string): string {
  return encodeURIComponent(value);
}

function serializePathPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
