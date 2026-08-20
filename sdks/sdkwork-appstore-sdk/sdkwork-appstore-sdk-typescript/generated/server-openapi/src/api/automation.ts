import { customApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { AutomationSubmission, AutomationSubmissionCreateRequest } from '../types';


export interface AutomationAppstorePublishAutomationSubmissionsCreateParams {
  idempotencyKey: string;
}

export class AutomationAppstorePublishAutomationSubmissionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Create automated publish submission */
  async create(body: AutomationSubmissionCreateRequest, params: AutomationAppstorePublishAutomationSubmissionsCreateParams, requestOptions?: ApiRequestOptions): Promise<AutomationSubmission> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<AutomationSubmission>(customApiPath(`/automation/submissions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export class AutomationAppstorePublishAutomationApi {
  public readonly submissions: AutomationAppstorePublishAutomationSubmissionsApi;

  constructor(client: HttpClient) {
    this.submissions = new AutomationAppstorePublishAutomationSubmissionsApi(client);
  }

}

export class AutomationAppstorePublishApi {
  public readonly automation: AutomationAppstorePublishAutomationApi;

  constructor(client: HttpClient) {
    this.automation = new AutomationAppstorePublishAutomationApi(client);
  }

}

export class AutomationAppstoreApi {
  public readonly publish: AutomationAppstorePublishApi;

  constructor(client: HttpClient) {
    this.publish = new AutomationAppstorePublishApi(client);
  }

}

export class AutomationApi {
  public readonly appstore: AutomationAppstoreApi;

  constructor(client: HttpClient) {
    this.appstore = new AutomationAppstoreApi(client);
  }

}

export function createAutomationApi(client: HttpClient): AutomationApi {
  return new AutomationApi(client);
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
