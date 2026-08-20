import { appApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { Release, ReleaseArtifact, ReleaseArtifactAttachRequest, ReleaseCreateRequest, ReleaseNoteLocalization, ReleaseNotesUpsertRequest, ReleaseRollout, ReleaseRolloutUpdateRequest, ReleaseUpdateRequest } from '../types';


export class ReleasesAppstoreReleasesRolloutApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Update staged rollout */
  async update(releaseId: string, body: ReleaseRolloutUpdateRequest, requestOptions?: ApiRequestOptions): Promise<ReleaseRollout> {
    return this.client.request<ReleaseRollout>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}/rollout`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class ReleasesAppstoreReleasesArtifactsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Attach release artifact */
  async create(releaseId: string, body: ReleaseArtifactAttachRequest, requestOptions?: ApiRequestOptions): Promise<ReleaseArtifact> {
    return this.client.request<ReleaseArtifact>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}/artifacts`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class ReleasesAppstoreReleasesNotesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Upsert localized release notes */
  async update(releaseId: string, locale: string, body: ReleaseNotesUpsertRequest, requestOptions?: ApiRequestOptions): Promise<ReleaseNoteLocalization> {
    return this.client.request<ReleaseNoteLocalization>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}/notes/${serializePathParameter(locale, { name: 'locale', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface ReleasesAppstoreReleasesCreateParams {
  idempotencyKey: string;
}

export class ReleasesAppstoreReleasesApi {
  private client: HttpClient;
  public readonly notes: ReleasesAppstoreReleasesNotesApi;
  public readonly artifacts: ReleasesAppstoreReleasesArtifactsApi;
  public readonly rollout: ReleasesAppstoreReleasesRolloutApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.notes = new ReleasesAppstoreReleasesNotesApi(client);
    this.artifacts = new ReleasesAppstoreReleasesArtifactsApi(client);
    this.rollout = new ReleasesAppstoreReleasesRolloutApi(client);
  }


/** Create release for listing */
  async create(listingId: string, body: ReleaseCreateRequest, params: ReleasesAppstoreReleasesCreateParams, requestOptions?: ApiRequestOptions): Promise<Release> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<Release>(appApiPath(`/listings/${serializePathParameter(listingId, { name: 'listingId', style: 'simple', explode: false })}/releases`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Retrieve release detail */
  async retrieve(releaseId: string, requestOptions?: ApiRequestOptions): Promise<Release> {
    return this.client.request<Release>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }

/** Update release metadata */
  async update(releaseId: string, body: ReleaseUpdateRequest, requestOptions?: ApiRequestOptions): Promise<Release> {
    return this.client.request<Release>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Retire release */
  async retire(releaseId: string, requestOptions?: ApiRequestOptions): Promise<Release> {
    return this.client.request<Release>(appApiPath(`/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}/retire`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
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

function buildRequestHeaders(
  headers: Record<string, HeaderParameterSpec | undefined>,
  cookies: Record<string, HeaderParameterSpec | undefined> = {},
): Record<string, string> | undefined {
  const requestHeaders: Record<string, string> = {};

  for (const [name, parameter] of Object.entries(headers)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      requestHeaders[name] = serialized;
    }
  }

  const cookieHeader = buildCookieHeader(cookies);
  if (cookieHeader) {
    requestHeaders.Cookie = requestHeaders.Cookie
      ? `${requestHeaders.Cookie}; ${cookieHeader}`
      : cookieHeader;
  }

  return Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined;
}

interface HeaderParameterSpec {
  value: unknown;
  style: string;
  explode: boolean;
  contentType?: string;
}

function buildCookieHeader(cookies: Record<string, HeaderParameterSpec | undefined>): string | undefined {
  const pairs: string[] = [];
  for (const [name, parameter] of Object.entries(cookies)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(serialized)}`);
    }
  }
  return pairs.length > 0 ? pairs.join('; ') : undefined;
}

function serializeParameterValue(parameter: HeaderParameterSpec | undefined): string | undefined {
  const value = parameter?.value;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (parameter?.contentType) {
    return JSON.stringify(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeHeaderPrimitive(item)).join(',');
  }
  if (typeof value === 'object' && value !== null) {
    return serializeHeaderObject(value as Record<string, unknown>, parameter?.explode === true);
  }
  return serializeHeaderPrimitive(value);
}

function serializeHeaderObject(value: Record<string, unknown>, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (explode) {
    return entries.map(([key, entryValue]) => `${key}=${serializeHeaderPrimitive(entryValue)}`).join(',');
  }
  return entries.flatMap(([key, entryValue]) => [key, serializeHeaderPrimitive(entryValue)]).join(',');
}

function serializeHeaderPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}
