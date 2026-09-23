import { appApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { PageInfo, UserCategory, UserCategoryCreateRequest, UserCategoryItemAddRequest, UserCategoryItemsReorderRequest, UserCategoryItemWithCard, UserCategoryUpdateRequest, UserStoreShare, UserStoreShareCreateRequest, UserStoreShareUpdateRequest } from '../types';


export class UserStoreAppstoreUserStoreShareApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List my share links */
  async list(requestOptions?: ApiRequestOptions): Promise<{ items: UserStoreShare[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: UserStoreShare[]; pageInfo: PageInfo; }>(appApiPath(`/user_store/shares`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Create share link */
  async create(body: UserStoreShareCreateRequest, requestOptions?: ApiRequestOptions): Promise<UserStoreShare> {
    return this.client.request<UserStoreShare>(appApiPath(`/user_store/shares`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Update share link */
  async update(shareId: string | number, body: UserStoreShareUpdateRequest, requestOptions?: ApiRequestOptions): Promise<UserStoreShare> {
    return this.client.request<UserStoreShare>(appApiPath(`/user_store/shares/${serializePathParameter(shareId, { name: 'shareId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Revoke share link */
  async delete(shareId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/user_store/shares/${serializePathParameter(shareId, { name: 'shareId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }

/** Regenerate share token */
  async refresh(shareId: string | number, requestOptions?: ApiRequestOptions): Promise<UserStoreShare> {
    return this.client.request<UserStoreShare>(appApiPath(`/user_store/shares/${serializePathParameter(shareId, { name: 'shareId', style: 'simple', explode: false })}/refresh`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class UserStoreAppstoreUserStoreItemApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List custom category items */
  async list(userCategoryId: string | number, requestOptions?: ApiRequestOptions): Promise<{ items: UserCategoryItemWithCard[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: UserCategoryItemWithCard[]; pageInfo: PageInfo; }>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Add listing to custom category */
  async create(userCategoryId: string | number, body: UserCategoryItemAddRequest, requestOptions?: ApiRequestOptions): Promise<UserCategoryItemWithCard> {
    return this.client.request<UserCategoryItemWithCard>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Reorder custom category items */
  async update(userCategoryId: string | number, body: UserCategoryItemsReorderRequest, requestOptions?: ApiRequestOptions): Promise<{ accepted: boolean; }> {
    return this.client.request<{ accepted: boolean; }>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Remove item from custom category */
  async delete(userCategoryId: string, itemId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class UserStoreAppstoreUserStoreCategoryApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List my custom categories */
  async list(requestOptions?: ApiRequestOptions): Promise<{ items: UserCategory[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: UserCategory[]; pageInfo: PageInfo; }>(appApiPath(`/user_store/categories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Create custom category */
  async create(body: UserCategoryCreateRequest, requestOptions?: ApiRequestOptions): Promise<UserCategory> {
    return this.client.request<UserCategory>(appApiPath(`/user_store/categories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Retrieve custom category */
  async retrieve(userCategoryId: string | number, requestOptions?: ApiRequestOptions): Promise<UserCategory> {
    return this.client.request<UserCategory>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }

/** Update custom category */
  async update(userCategoryId: string | number, body: UserCategoryUpdateRequest, requestOptions?: ApiRequestOptions): Promise<UserCategory> {
    return this.client.request<UserCategory>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Delete custom category */
  async delete(userCategoryId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/user_store/categories/${serializePathParameter(userCategoryId, { name: 'userCategoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class UserStoreAppstoreUserStoreApi {
  public readonly category: UserStoreAppstoreUserStoreCategoryApi;
  public readonly item: UserStoreAppstoreUserStoreItemApi;
  public readonly share: UserStoreAppstoreUserStoreShareApi;

  constructor(client: HttpClient) {
    this.category = new UserStoreAppstoreUserStoreCategoryApi(client);
    this.item = new UserStoreAppstoreUserStoreItemApi(client);
    this.share = new UserStoreAppstoreUserStoreShareApi(client);
  }

}

export class UserStoreAppstoreApi {
  public readonly userStore: UserStoreAppstoreUserStoreApi;

  constructor(client: HttpClient) {
    this.userStore = new UserStoreAppstoreUserStoreApi(client);
  }

}

export class UserStoreApi {
  public readonly appstore: UserStoreAppstoreApi;

  constructor(client: HttpClient) {
    this.appstore = new UserStoreAppstoreApi(client);
  }

}

export function createUserStoreApi(client: HttpClient): UserStoreApi {
  return new UserStoreApi(client);
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
