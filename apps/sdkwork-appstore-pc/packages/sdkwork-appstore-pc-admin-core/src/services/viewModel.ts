import type { SdkWorkPageData } from '@sdkwork/appstore-backend-sdk';

/**
 * Canonical paginated projection returned by every App Store backend-admin
 * service port.
 *
 * The authoritative OpenAPI contract declares list and detail payloads as
 * `additionalProperties: true`, so `item` shapes are not type-checked on the
 * wire. Ports normalize the unknown records once, here, and expose typed view
 * models to the capability packages.
 */
export interface AppstoreAdminPage<TItem> {
  items: TItem[];
  pageInfo: AppstoreAdminPageInfo;
}

/** Normalized pagination metadata mirroring `PageInfo` in `API_SPEC.md`. */
export interface AppstoreAdminPageInfo {
  mode: 'offset' | 'cursor';
  page?: number;
  pageSize?: number;
  /**
   * `totalItems` stays a string: `API_SPEC.md` §13.6 requires `int64` wire
   * fields to be decimal strings, and operator consoles must never reparse
   * them into `number`.
   */
  totalItems?: string;
  totalPages?: number;
  nextCursor?: string;
  hasMore?: boolean;
}

/** Inclusive date window accepted by the analytics and metrics operations. */
export interface AppstoreAdminDateRange {
  from?: string;
  to?: string;
}

export const APPSTORE_ADMIN_UNKNOWN_TEXT = '—';

type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  return value as UnknownRecord;
}

export function readString(record: unknown, ...keys: string[]): string {
  const source = asRecord(record);
  if (!source) {
    return '';
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

/**
 * Read an identifier or other `int64` wire field as its canonical decimal
 * string. Numeric JSON values are stringified but never rounded or compared
 * numerically (`AGENTS.md` Int64 wire contract).
 */
export function readId(record: unknown, ...keys: string[]): string {
  const source = asRecord(record);
  if (!source) {
    return '';
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isSafeInteger(value)) {
      return String(value);
    }
  }
  return '';
}

export function readNumber(record: unknown, ...keys: string[]): number | undefined {
  const source = asRecord(record);
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

export function readBoolean(record: unknown, ...keys: string[]): boolean | undefined {
  const source = asRecord(record);
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'boolean') {
      return value;
    }
  }
  return undefined;
}

export function readRecord(record: unknown, ...keys: string[]): UnknownRecord | undefined {
  const source = asRecord(record);
  if (!source) {
    return undefined;
  }
  for (const key of keys) {
    const candidate = asRecord(source[key]);
    if (candidate) {
      return candidate;
    }
  }
  return undefined;
}

export function readRecords(record: unknown, ...keys: string[]): UnknownRecord[] {
  const source = asRecord(record);
  if (!source) {
    return [];
  }
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value
        .map((entry) => asRecord(entry))
        .filter((entry): entry is UnknownRecord => entry !== undefined);
    }
  }
  return [];
}

/** Read a ratio that the backend may express as `0..1` or `0..100`. */
export function readRatio(record: unknown, ...keys: string[]): number | undefined {
  const value = readNumber(record, ...keys);
  if (value === undefined) {
    return undefined;
  }
  if (value > 1 && value <= 100) {
    return value / 100;
  }
  return value;
}

export function normalizePageInfo(value: unknown): AppstoreAdminPageInfo {
  const source = asRecord(value);
  const mode = readString(source, 'mode') === 'cursor' ? 'cursor' : 'offset';
  const nextCursor = readString(source, 'nextCursor', 'next_cursor');
  const page = readNumber(source, 'page');
  const pageSize = readNumber(source, 'pageSize', 'page_size');
  const totalItems = readId(source, 'totalItems', 'total_items');
  const totalPages = readNumber(source, 'totalPages', 'total_pages');
  const hasMore = readBoolean(source, 'hasMore', 'has_more');
  return {
    mode,
    ...(page === undefined ? {} : { page }),
    ...(pageSize === undefined ? {} : { pageSize }),
    ...(totalItems ? { totalItems } : {}),
    ...(totalPages === undefined ? {} : { totalPages }),
    ...(nextCursor ? { nextCursor } : {}),
    ...(hasMore === undefined ? {} : { hasMore }),
  };
}

export function emptyPage<TItem>(): AppstoreAdminPage<TItem> {
  return { items: [], pageInfo: { mode: 'offset' } };
}

/**
 * Normalize a generated list operation result into {@link AppstoreAdminPage}.
 * `mapper` receives the raw unknown record so each port owns its projection.
 */
export function mapPage<TItem>(
  value: SdkWorkPageData | undefined,
  mapper: (record: UnknownRecord) => TItem | undefined,
): AppstoreAdminPage<TItem> {
  const rawItems = Array.isArray(value?.items) ? value.items : [];
  const items: TItem[] = [];
  for (const entry of rawItems) {
    const record = asRecord(entry);
    if (!record) {
      continue;
    }
    const mapped = mapper(record);
    if (mapped !== undefined) {
      items.push(mapped);
    }
  }
  return { items, pageInfo: normalizePageInfo(value?.pageInfo) };
}

/**
 * Reduce a single-resource operation to one record.
 *
 * Several operations are declared with a page-shaped response envelope even
 * though they return exactly one resource, so accept every shape the wire may
 * legitimately produce: a page with one item, a `{ item }` resource envelope,
 * or the bare record.
 */
export function readSingleRecord(value: unknown): UnknownRecord | undefined {
  const direct = asRecord(value);
  if (!direct) {
    return undefined;
  }
  const items = direct.items;
  if (Array.isArray(items)) {
    const first = items
      .map((entry) => asRecord(entry))
      .find((entry): entry is UnknownRecord => entry !== undefined);
    return first;
  }
  const item = asRecord(direct.item);
  if (item) {
    return item;
  }
  return direct;
}

/** Render a wire ISO timestamp as a locale-agnostic `YYYY-MM-DD` date. */
export function formatAdminDate(value: string | undefined): string {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().slice(0, 10);
}

/** Render a wire ISO timestamp as `YYYY-MM-DD HH:mm` in UTC. */
export function formatAdminDateTime(value: string | undefined): string {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return `${parsed.toISOString().slice(0, 10)} ${parsed.toISOString().slice(11, 16)}`;
}

/**
 * Normalize an enum-like wire value to a stable upper snake case token so view
 * layers can map it to a localized label without branching on display copy.
 */
export function normalizeToken(value: string | undefined, fallback = 'UNKNOWN'): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed
    .replace(/[\s-]+/gu, '_')
    .toUpperCase();
}

/** Percent-point rendering used by operator KPI cards. */
export function formatAdminPercent(ratio: number | undefined, fractionDigits = 1): string {
  if (ratio === undefined || !Number.isFinite(ratio)) {
    return APPSTORE_ADMIN_UNKNOWN_TEXT;
  }
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}
