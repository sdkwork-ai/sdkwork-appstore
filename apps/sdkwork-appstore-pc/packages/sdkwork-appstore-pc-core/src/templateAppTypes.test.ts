import { describe, expect, it } from 'vitest';

import type { AppTemplate } from '@sdkwork/appstore-app-sdk';

import { TEMPLATE_APP_TYPES, resolveTemplateAppType } from './templateAppTypes';
import { TEMPLATE_PLATFORMS } from './types';

/**
 * Compile-time guard: every platform code the storefront offers must stay
 * assignable to the generated app SDK's `AppTemplate.templatePlatform` union.
 * The assertion fails to compile when OpenAPI and this taxonomy drift apart.
 */
const CONTRACT_TEMPLATE_PLATFORMS: readonly NonNullable<
  AppTemplate['templatePlatform']
>[] = TEMPLATE_PLATFORMS;

describe('resolveTemplateAppType', () => {
  it('offers only platform codes the generated contract accepts', () => {
    expect(CONTRACT_TEMPLATE_PLATFORMS).toHaveLength(TEMPLATE_PLATFORMS.length);
  });

  it('keeps the metadata list and the filter-row codes in the same order', () => {
    expect(TEMPLATE_APP_TYPES.map((type) => type.code)).toEqual([...TEMPLATE_PLATFORMS]);
  });

  it('classifies every filter-row platform code', () => {
    for (const code of TEMPLATE_PLATFORMS) {
      expect(resolveTemplateAppType(code)?.code).toBe(code);
    }
  });

  it('maps each code onto its canonical client architecture identity', () => {
    expect(resolveTemplateAppType('PC')?.architecture).toBe('pc');
    expect(resolveTemplateAppType('PAD')?.architecture).toBe('pad');
    expect(resolveTemplateAppType('H5')?.architecture).toBe('h5');
    expect(resolveTemplateAppType('STATIC_WEB')?.architecture).toBe('static-web');
    expect(resolveTemplateAppType('FLUTTER')?.architecture).toBe('flutter-mobile');
    expect(resolveTemplateAppType('MINIPROGRAM')?.architecture).toBe('mini-program');
    expect(resolveTemplateAppType('ANDROID')?.architecture).toBe('android-mobile');
    expect(resolveTemplateAppType('IOS')?.architecture).toBe('ios-mobile');
    expect(resolveTemplateAppType('HARMONY')?.architecture).toBe('harmony-mobile');
    expect(resolveTemplateAppType('UNIAPP')?.architecture).toBe('uniapp');
    expect(resolveTemplateAppType('UNITY')?.architecture).toBe('unity');
  });

  it('accepts legacy and separator-tolerant spellings', () => {
    expect(resolveTemplateAppType('h5')?.code).toBe('H5');
    expect(resolveTemplateAppType('mini-program')?.code).toBe('MINIPROGRAM');
    expect(resolveTemplateAppType('MINI_PROGRAM')?.code).toBe('MINIPROGRAM');
    expect(resolveTemplateAppType('flutter-mobile')?.code).toBe('FLUTTER');
    expect(resolveTemplateAppType('static web')?.code).toBe('STATIC_WEB');
    expect(resolveTemplateAppType('harmonyos')?.code).toBe('HARMONY');
  });

  it('returns undefined for an empty or unknown code', () => {
    expect(resolveTemplateAppType('')).toBeUndefined();
    expect(resolveTemplateAppType('   ')).toBeUndefined();
    expect(resolveTemplateAppType(undefined)).toBeUndefined();
    expect(resolveTemplateAppType(null)).toBeUndefined();
    expect(resolveTemplateAppType('MINI-DRAGON')).toBeUndefined();
  });

  it('marks exactly the phone-scannable app forms', () => {
    const scannable = TEMPLATE_APP_TYPES.filter((type) => type.scannable).map((type) => type.code);
    expect(scannable).toEqual([
      'H5',
      'FLUTTER',
      'MINIPROGRAM',
      'ANDROID',
      'IOS',
      'HARMONY',
      'UNIAPP',
    ]);
  });
});
