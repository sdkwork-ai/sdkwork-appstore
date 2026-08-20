import { appApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { AppTemplate, AppTemplateCreateRequest, AppTemplateUsageCreateRequest, AppTemplateUsageResult, CatalogChartSnapshot, CatalogCollection, CatalogFeaturedSlot, Category, Feedback, FeedbackCreateRequest, HomeFeedData, ListingSummary, PageInfo, SdkWorkPageData, SearchHistoryUpsertRequest } from '../types';


export interface CatalogAppstoreCatalogFeedbackCreateParams {
  idempotencyKey: string;
}

export class CatalogAppstoreCatalogFeedbackApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Submit storefront user feedback */
  async create(body: FeedbackCreateRequest, params: CatalogAppstoreCatalogFeedbackCreateParams, requestOptions?: ApiRequestOptions): Promise<Feedback> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<Feedback>(appApiPath(`/appstore/catalog/feedback`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface CatalogAppstoreCatalogTemplatesUsageCreateParams {
  idempotencyKey: string;
}

export class CatalogAppstoreCatalogTemplatesUsageApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Record app template usage (star, fork, clone) */
  async create(templateId: string, body: AppTemplateUsageCreateRequest, params: CatalogAppstoreCatalogTemplatesUsageCreateParams, requestOptions?: ApiRequestOptions): Promise<AppTemplateUsageResult> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<AppTemplateUsageResult>(appApiPath(`/appstore/catalog/templates/${serializePathParameter(templateId, { name: 'templateId', style: 'simple', explode: false })}/usage`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface CatalogAppstoreCatalogTemplatesListParams {
  q?: string;
  categoryCode?: string;
  templateType?: 'APP' | 'PLUGIN' | 'AGENT';
  cursor?: string;
  pageSize?: number;
}

export interface CatalogAppstoreCatalogTemplatesCreateParams {
  idempotencyKey: string;
}

export class CatalogAppstoreCatalogTemplatesApi {
  private client: HttpClient;
  public readonly usage: CatalogAppstoreCatalogTemplatesUsageApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.usage = new CatalogAppstoreCatalogTemplatesUsageApi(client);
  }


/** List storefront app templates and plugins */
  async list(params?: CatalogAppstoreCatalogTemplatesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: AppTemplate[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'categoryCode', value: params?.categoryCode, style: 'form', explode: true, allowReserved: false },
      { name: 'templateType', value: params?.templateType, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: AppTemplate[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/appstore/catalog/templates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Publish an app template or plugin */
  async create(body: AppTemplateCreateRequest, params: CatalogAppstoreCatalogTemplatesCreateParams, requestOptions?: ApiRequestOptions): Promise<AppTemplate> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<AppTemplate>(appApiPath(`/appstore/catalog/templates`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Retrieve app template detail */
  async retrieve(templateId: string, requestOptions?: ApiRequestOptions): Promise<AppTemplate> {
    return this.client.request<AppTemplate>(appApiPath(`/appstore/catalog/templates/${serializePathParameter(templateId, { name: 'templateId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface CatalogAppstoreCatalogSearchHistoryListParams {
  cursor?: string;
  pageSize?: number;
}

export class CatalogAppstoreCatalogSearchHistoryApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search history */
  async list(params?: CatalogAppstoreCatalogSearchHistoryListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/search/history`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Upsert search history entry */
  async update(body: SearchHistoryUpsertRequest, requestOptions?: ApiRequestOptions): Promise<unknown> {
    return this.client.request<unknown>(appApiPath(`/appstore/catalog/search/history`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PUT' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'data' });
  }

/** Clear search history */
  async delete(requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/appstore/catalog/search/history`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface CatalogAppstoreCatalogSearchTrendingListParams {
  locale?: string;
  pageSize?: number;
}

export class CatalogAppstoreCatalogSearchTrendingApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List trending search terms */
  async list(params?: CatalogAppstoreCatalogSearchTrendingListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/search/trending`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface CatalogAppstoreCatalogSearchSuggestionsListParams {
  q: string;
  locale?: string;
}

export class CatalogAppstoreCatalogSearchSuggestionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List search suggestions */
  async list(params: CatalogAppstoreCatalogSearchSuggestionsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'q', value: params.q, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/search/suggestions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class CatalogAppstoreCatalogSearchApi {
  public readonly suggestions: CatalogAppstoreCatalogSearchSuggestionsApi;
  public readonly trending: CatalogAppstoreCatalogSearchTrendingApi;
  public readonly history: CatalogAppstoreCatalogSearchHistoryApi;

  constructor(client: HttpClient) {
    this.suggestions = new CatalogAppstoreCatalogSearchSuggestionsApi(client);
    this.trending = new CatalogAppstoreCatalogSearchTrendingApi(client);
    this.history = new CatalogAppstoreCatalogSearchHistoryApi(client);
  }

}

export interface CatalogAppstoreCatalogEventsListParams {
  cursor?: string;
  pageSize?: number;
  status?: string;
}

export class CatalogAppstoreCatalogEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List catalog events */
  async list(params?: CatalogAppstoreCatalogEventsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Retrieve catalog event detail */
  async retrieve(eventId: string, requestOptions?: ApiRequestOptions): Promise<Record<string, unknown>> {
    return this.client.request<Record<string, unknown>>(appApiPath(`/appstore/catalog/events/${serializePathParameter(eventId, { name: 'eventId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface CatalogAppstoreCatalogRecentlyUpdatedListParams {
  cursor?: string;
  pageSize?: number;
  locale?: string;
}

export class CatalogAppstoreCatalogRecentlyUpdatedApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List recently updated listings */
  async list(params?: CatalogAppstoreCatalogRecentlyUpdatedListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/recently_updated`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface CatalogAppstoreCatalogRecommendationsListParams {
  locale?: string;
  platform?: string;
  cursor?: string;
  pageSize?: number;
}

export class CatalogAppstoreCatalogRecommendationsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List recommended listings */
  async list(params?: CatalogAppstoreCatalogRecommendationsListParams, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    const query = buildQueryString([
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
      { name: 'platform', value: params?.platform, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<SdkWorkPageData>(appendQueryString(appApiPath(`/appstore/catalog/recommendations`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface CatalogAppstoreCatalogListingsListParams {
  q?: string;
  categoryId?: string;
  ids?: string;
  cursor?: string;
  pageSize?: number;
}

export class CatalogAppstoreCatalogListingsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Search public listings */
  async list(params?: CatalogAppstoreCatalogListingsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: ListingSummary[]; pageInfo: { mode: 'cursor'; nextCursor?: string | null; hasMore: boolean; }; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'categoryId', value: params?.categoryId, style: 'form', explode: true, allowReserved: false },
      { name: 'ids', value: params?.ids, style: 'form', explode: true, allowReserved: false },
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: ListingSummary[]; pageInfo: { mode: 'cursor'; nextCursor?: string | null; hasMore: boolean; }; }>(appendQueryString(appApiPath(`/appstore/catalog/listings/search`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class CatalogAppstoreCatalogChartsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Retrieve chart rankings */
  async retrieve(chartCode: string, requestOptions?: ApiRequestOptions): Promise<CatalogChartSnapshot> {
    return this.client.request<CatalogChartSnapshot>(appApiPath(`/appstore/catalog/charts/${serializePathParameter(chartCode, { name: 'chartCode', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class CatalogAppstoreCatalogFeaturedApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List featured placements */
  async list(requestOptions?: ApiRequestOptions): Promise<{ items: CatalogFeaturedSlot[]; pageInfo: PageInfo; }> {
    return this.client.request<{ items: CatalogFeaturedSlot[]; pageInfo: PageInfo; }>(appApiPath(`/appstore/catalog/featured`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface CatalogAppstoreCatalogCollectionsListParams {
  cursor?: string;
  pageSize?: number;
}

export class CatalogAppstoreCatalogCollectionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List editorial collections */
  async list(params?: CatalogAppstoreCatalogCollectionsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: CatalogCollection[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: CatalogCollection[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/appstore/catalog/collections`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Retrieve collection detail */
  async retrieve(collectionId: string, requestOptions?: ApiRequestOptions): Promise<CatalogCollection> {
    return this.client.request<CatalogCollection>(appApiPath(`/appstore/catalog/collections/${serializePathParameter(collectionId, { name: 'collectionId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface CatalogAppstoreCatalogCategoriesListParams {
  cursor?: string;
  pageSize?: number;
  locale?: string;
}

export class CatalogAppstoreCatalogCategoriesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** List store categories */
  async list(params?: CatalogAppstoreCatalogCategoriesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: Category[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
      { name: 'locale', value: params?.locale, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: Category[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/appstore/catalog/categories`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Retrieve category detail */
  async retrieve(categoryId: string, requestOptions?: ApiRequestOptions): Promise<Category> {
    return this.client.request<Category>(appApiPath(`/appstore/catalog/categories/${serializePathParameter(categoryId, { name: 'categoryId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class CatalogAppstoreCatalogHomeApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Retrieve storefront home feed */
  async retrieve(requestOptions?: ApiRequestOptions): Promise<HomeFeedData> {
    return this.client.request<HomeFeedData>(appApiPath(`/appstore/catalog/home`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class CatalogAppstoreCatalogApi {
  public readonly home: CatalogAppstoreCatalogHomeApi;
  public readonly categories: CatalogAppstoreCatalogCategoriesApi;
  public readonly collections: CatalogAppstoreCatalogCollectionsApi;
  public readonly featured: CatalogAppstoreCatalogFeaturedApi;
  public readonly charts: CatalogAppstoreCatalogChartsApi;
  public readonly listings: CatalogAppstoreCatalogListingsApi;
  public readonly recommendations: CatalogAppstoreCatalogRecommendationsApi;
  public readonly recentlyUpdated: CatalogAppstoreCatalogRecentlyUpdatedApi;
  public readonly events: CatalogAppstoreCatalogEventsApi;
  public readonly search: CatalogAppstoreCatalogSearchApi;
  public readonly templates: CatalogAppstoreCatalogTemplatesApi;
  public readonly feedback: CatalogAppstoreCatalogFeedbackApi;

  constructor(client: HttpClient) {
    this.home = new CatalogAppstoreCatalogHomeApi(client);
    this.categories = new CatalogAppstoreCatalogCategoriesApi(client);
    this.collections = new CatalogAppstoreCatalogCollectionsApi(client);
    this.featured = new CatalogAppstoreCatalogFeaturedApi(client);
    this.charts = new CatalogAppstoreCatalogChartsApi(client);
    this.listings = new CatalogAppstoreCatalogListingsApi(client);
    this.recommendations = new CatalogAppstoreCatalogRecommendationsApi(client);
    this.recentlyUpdated = new CatalogAppstoreCatalogRecentlyUpdatedApi(client);
    this.events = new CatalogAppstoreCatalogEventsApi(client);
    this.search = new CatalogAppstoreCatalogSearchApi(client);
    this.templates = new CatalogAppstoreCatalogTemplatesApi(client);
    this.feedback = new CatalogAppstoreCatalogFeedbackApi(client);
  }

}

export class CatalogAppstoreApi {
  public readonly catalog: CatalogAppstoreCatalogApi;

  constructor(client: HttpClient) {
    this.catalog = new CatalogAppstoreCatalogApi(client);
  }

}

export class CatalogApi {
  public readonly appstore: CatalogAppstoreApi;

  constructor(client: HttpClient) {
    this.appstore = new CatalogAppstoreApi(client);
  }

}

export function createCatalogApi(client: HttpClient): CatalogApi {
  return new CatalogApi(client);
}

function appendQueryString(path: string, rawQueryString: string): string {
  const query = rawQueryString.replace(/^\?+/, '');
  if (!query) {
    return path;
  }
  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
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
interface QueryParameterSpec {
  name: string;
  value: unknown;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  contentType?: string;
}

function buildQueryString(parameters: QueryParameterSpec[]): string {
  const pairs: string[] = [];
  for (const parameter of parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

function appendSerializedParameter(pairs: string[], parameter: QueryParameterSpec): void {
  if (parameter.value === undefined || parameter.value === null) {
    return;
  }

  if (parameter.contentType) {
    pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(JSON.stringify(parameter.value), parameter.allowReserved)}`);
    return;
  }

  const style = parameter.style || 'form';
  if (style === 'deepObject') {
    appendDeepObjectParameter(pairs, parameter.name, parameter.value, parameter.allowReserved);
    return;
  }

  if (Array.isArray(parameter.value)) {
    appendArrayParameter(pairs, parameter.name, parameter.value, style, parameter.explode, parameter.allowReserved);
    return;
  }

  if (typeof parameter.value === 'object') {
    appendObjectParameter(pairs, parameter.name, parameter.value as Record<string, unknown>, style, parameter.explode, parameter.allowReserved);
    return;
  }

  pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(serializePrimitive(parameter.value), parameter.allowReserved)}`);
}

function appendArrayParameter(
  pairs: string[],
  name: string,
  value: unknown[],
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const values = value
    .filter((item) => item !== undefined && item !== null)
    .map((item) => serializePrimitive(item));
  if (values.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const item of values) {
      pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(item, allowReserved)}`);
    }
    return;
  }

  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(values.join(','), allowReserved)}`);
}

function appendObjectParameter(
  pairs: string[],
  name: string,
  value: Record<string, unknown>,
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const [key, entryValue] of entries) {
      pairs.push(`${encodeQueryComponent(key)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
    }
    return;
  }

  const serialized = entries.flatMap(([key, entryValue]) => [key, serializePrimitive(entryValue)]).join(',');
  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serialized, allowReserved)}`);
}

function appendDeepObjectParameter(
  pairs: string[],
  name: string,
  value: unknown,
  allowReserved: boolean,
): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serializePrimitive(value), allowReserved)}`);
    return;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === undefined || entryValue === null) {
      continue;
    }
    pairs.push(`${encodeQueryComponent(`${name}[${key}]`)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
  }
}

function serializePrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string, allowReserved: boolean): string {
  const encoded = encodeURIComponent(value);
  if (!allowReserved) {
    return encoded;
  }
  return encoded.replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%3F/gi, '?')
    .replace(/%23/gi, '#')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%40/gi, '@')
    .replace(/%21/gi, '!')
    .replace(/%24/gi, '$')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2A/gi, '*')
    .replace(/%2B/gi, '+')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=');
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
