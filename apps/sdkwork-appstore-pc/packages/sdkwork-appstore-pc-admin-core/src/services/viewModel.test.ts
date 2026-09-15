import { describe, expect, it } from 'vitest';

import {
  APPSTORE_ADMIN_UNKNOWN_TEXT,
  emptyPage,
  formatAdminDate,
  formatAdminDateTime,
  formatAdminPercent,
  mapPage,
  normalizePageInfo,
  normalizeToken,
  readId,
  readRatio,
  readRecords,
  readSingleRecord,
  readString,
} from './viewModel';

describe('admin view model readers', () => {
  it('keeps int64 identifiers as decimal strings', () => {
    expect(readId({ listingId: '9007199254740993' }, 'listingId')).toBe('9007199254740993');
    expect(readId({ id: ' 42 ' }, 'id')).toBe('42');
    expect(readId({ id: 42 }, 'id')).toBe('42');
  });

  it('never round-trips an unsafe or fractional number into an identifier', () => {
    expect(readId({ id: 9007199254740993 }, 'id')).toBe('');
    expect(readId({ id: 1.5 }, 'id')).toBe('');
    expect(readId(undefined, 'id')).toBe('');
  });

  it('reads the first non-blank string alias and ignores blank values', () => {
    expect(readString({ listing_name: '  Aurora  ' }, 'name', 'listing_name')).toBe('Aurora');
    expect(readString({ name: '   ' }, 'name')).toBe('');
    expect(readString(null, 'name')).toBe('');
  });

  it('collects only record entries from an array field', () => {
    expect(readRecords({ data: [{ id: 'a' }, 'skip', 7, null, { id: 'b' }] }, 'data')).toEqual([
      { id: 'a' },
      { id: 'b' },
    ]);
    expect(readRecords({ data: {} }, 'data')).toEqual([]);
  });

  it('normalizes a cursor page and preserves int64 totals as strings', () => {
    expect(
      normalizePageInfo({ mode: 'cursor', nextCursor: 'cursor-1', pageSize: 20, hasMore: true }),
    ).toEqual({ mode: 'cursor', pageSize: 20, nextCursor: 'cursor-1', hasMore: true });

    expect(
      normalizePageInfo({
        mode: 'offset',
        page: 2,
        page_size: 50,
        total_items: '123456789012345678',
        total_pages: 9,
      }),
    ).toEqual({
      mode: 'offset',
      page: 2,
      pageSize: 50,
      totalItems: '123456789012345678',
      totalPages: 9,
    });
  });

  it('defaults an absent or unknown page mode to offset', () => {
    expect(normalizePageInfo(undefined)).toEqual({ mode: 'offset' });
    expect(normalizePageInfo({ mode: 'something-else' })).toEqual({ mode: 'offset' });
  });

  it('maps a page while dropping entries the mapper rejects', () => {
    const page = mapPage(
      {
        items: [{ id: 'a' }, null, 42, { id: 'b' }],
        pageInfo: { mode: 'offset', totalItems: '2' },
      } as unknown as Parameters<typeof mapPage>[0],
      (record) => {
        const id = readString(record, 'id');
        return id ? { id } : undefined;
      },
    );

    expect(page.items).toEqual([{ id: 'a' }, { id: 'b' }]);
    expect(page.pageInfo).toEqual({ mode: 'offset', totalItems: '2' });
  });

  it('returns an empty page when the backend omits the payload', () => {
    expect(mapPage(undefined, () => ({ id: 'x' }))).toEqual(emptyPage());
    expect(emptyPage()).toEqual({ items: [], pageInfo: { mode: 'offset' } });
  });

  it('accepts every single-resource envelope the wire may produce', () => {
    expect(readSingleRecord({ items: [{ id: 'x' }] })).toEqual({ id: 'x' });
    expect(readSingleRecord({ item: { id: 'y' } })).toEqual({ id: 'y' });
    expect(readSingleRecord({ id: 'z' })).toEqual({ id: 'z' });
    expect(readSingleRecord({ items: [] })).toBeUndefined();
    expect(readSingleRecord(undefined)).toBeUndefined();
  });

  it('normalizes a ratio expressed as either a share or a percentage', () => {
    expect(readRatio({ value: 0.42 }, 'value')).toBeCloseTo(0.42);
    expect(readRatio({ conversionRate: 42 }, 'conversionRate')).toBeCloseTo(0.42);
    expect(readRatio({ value: 1 }, 'value')).toBe(1);
    expect(readRatio({ value: 'n/a' }, 'value')).toBeUndefined();
  });

  it('formats wire timestamps without leaking the runtime time zone', () => {
    expect(formatAdminDate('2026-09-15T12:34:56.000Z')).toBe('2026-09-15');
    expect(formatAdminDateTime('2026-09-15T12:34:56.000Z')).toBe('2026-09-15 12:34');
    expect(formatAdminDate('not-a-date')).toBe('not-a-date');
    expect(formatAdminDate(undefined)).toBe('');
    expect(formatAdminDateTime(undefined)).toBe('');
  });

  it('normalizes enum-like tokens to upper snake case', () => {
    expect(normalizeToken('apple app_store')).toBe('APPLE_APP_STORE');
    expect(normalizeToken('in-review')).toBe('IN_REVIEW');
    expect(normalizeToken(undefined)).toBe('UNKNOWN');
    expect(normalizeToken('   ', 'OTHER')).toBe('OTHER');
  });

  it('renders percent points and an unknown-state placeholder', () => {
    expect(formatAdminPercent(0.1234)).toBe('12.3%');
    expect(formatAdminPercent(0.1234, 2)).toBe('12.34%');
    expect(formatAdminPercent(undefined)).toBe(APPSTORE_ADMIN_UNKNOWN_TEXT);
    expect(formatAdminPercent(Number.NaN)).toBe(APPSTORE_ADMIN_UNKNOWN_TEXT);
  });
});
