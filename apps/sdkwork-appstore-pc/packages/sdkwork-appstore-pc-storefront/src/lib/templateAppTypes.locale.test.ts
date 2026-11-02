import { describe, expect, it } from 'vitest';

import { TEMPLATE_APP_TYPES, TEMPLATE_PLATFORMS } from '@sdkwork/appstore-pc-core';

import { templates as zh } from '../i18n/zh-CN/appstore/storefront/templates';
import { templates as en } from '../i18n/en/appstore/storefront/templates';

/** Read a nested dictionary value without narrowing the dictionary's own type. */
function read(dictionary: object, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((node, key) => (typeof node === 'object' && node !== null ? Reflect.get(node, key) : undefined), dictionary);
}

const DICTIONARIES = [
  ['zh-CN', zh] as const,
  ['en', en] as const,
];

describe('template app type copy', () => {
  it('labels every application type in both locales', () => {
    for (const [locale, dictionary] of DICTIONARIES) {
      for (const appType of TEMPLATE_APP_TYPES) {
        const label = read(dictionary, `platforms.${appType.labelKey}`);
        expect(typeof label, `${locale} templates.platforms.${appType.labelKey}`).toBe('string');
        expect(String(label).trim(), `${locale} templates.platforms.${appType.labelKey}`).not.toBe('');
      }
      const all = read(dictionary, 'platforms.all');
      expect(typeof all, `${locale} templates.platforms.all`).toBe('string');
    }
  });

  it('keeps the dictionary key set identical across locales', () => {
    const flatten = (value: unknown, prefix = ''): string[] =>
      typeof value === 'object' && value !== null
        ? Object.entries(value).flatMap(([key, child]) => flatten(child, prefix === '' ? key : `${prefix}.${key}`))
        : [prefix];

    expect(flatten(zh).sort()).toEqual(flatten(en).sort());
  });

  it('carries the scan dialog and discovery rail copy in both locales', () => {
    for (const [locale, dictionary] of DICTIONARIES) {
      for (const key of ['scanAction', 'scanTitle', 'scanHint', 'scanSourceDemo', 'scanSourceApp']) {
        const copy = read(dictionary, `detail.${key}`);
        expect(typeof copy, `${locale} templates.detail.${key}`).toBe('string');
        expect(String(copy).trim(), `${locale} templates.detail.${key}`).not.toBe('');
      }
      for (const key of ['latest', 'related', 'recommended', 'loading', 'empty']) {
        const copy = read(dictionary, `detail.sections.${key}`);
        expect(typeof copy, `${locale} templates.detail.sections.${key}`).toBe('string');
      }
      for (const key of ['backToLibrary', 'notFoundTitle', 'notFoundHint']) {
        const copy = read(dictionary, `detail.${key}`);
        expect(typeof copy, `${locale} templates.detail.${key}`).toBe('string');
      }
    }
  });

  it('covers every filter-row code with a dictionary label', () => {
    for (const [locale, dictionary] of DICTIONARIES) {
      for (const code of TEMPLATE_PLATFORMS) {
        const appType = TEMPLATE_APP_TYPES.find((entry) => entry.code === code);
        expect(appType, `missing app type metadata for ${code}`).toBeDefined();
        const label = read(dictionary, `platforms.${appType?.labelKey ?? ''}`);
        expect(typeof label, `${locale} label for ${code}`).toBe('string');
      }
    }
  });
});
