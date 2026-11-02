/**
 * Template application types (storefront side).
 *
 * A template declares the SDKWork client application architecture it scaffolds
 * (`template_platform`). This module is the single mapping from the stored
 * codes onto the canonical architecture identities of
 * `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` §2 — PC, pad, H5, static web,
 * Flutter mobile, mini program, native Android/iOS/HarmonyOS mobile, uni-app,
 * and Unity — plus the two facts the product needs from that classification:
 * which listing platform group can resolve a scan target, and whether a phone
 * scanning a QR code is the natural way to experience the result.
 *
 * The store may carry codes this build does not know; the UI renders those
 * verbatim and treats them as non-scannable.
 */
import type { AppPlatformGroupKey } from './platforms';
import type { TemplatePlatform } from './types';

/** Coarse device family a template targets. */
export type TemplateAppFamily =
  | 'desktop'
  | 'tablet'
  | 'web'
  | 'mobile'
  | 'mini-program'
  | 'engine';

/** Presentation and capability metadata for one template application type. */
export interface TemplateAppType {
  /** Stored `template_platform` code. */
  code: TemplatePlatform;
  /** Locale key under `templates.platforms.*`. */
  labelKey: string;
  /** Canonical architecture id from `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` §2. */
  architecture: string;
  family: TemplateAppFamily;
  /**
   * Listing platform group of the associated app whose distribution link is the
   * scan target. Absent when the form is not experienced on a phone.
   */
  scanGroup?: AppPlatformGroupKey;
  /** True when the detail page offers a phone QR code for this form. */
  scannable: boolean;
}

/** Every known template application type, in filter-row order. */
export const TEMPLATE_APP_TYPES: readonly TemplateAppType[] = [
  { code: 'PC', labelKey: 'pc', architecture: 'pc', family: 'desktop', scannable: false },
  { code: 'PAD', labelKey: 'pad', architecture: 'pad', family: 'tablet', scannable: false },
  {
    code: 'H5',
    labelKey: 'h5',
    architecture: 'h5',
    family: 'mobile',
    scanGroup: 'h5Web',
    scannable: true,
  },
  {
    code: 'STATIC_WEB',
    labelKey: 'staticWeb',
    architecture: 'static-web',
    family: 'web',
    scannable: false,
  },
  {
    code: 'FLUTTER',
    labelKey: 'flutter',
    architecture: 'flutter-mobile',
    family: 'mobile',
    scanGroup: 'android',
    scannable: true,
  },
  {
    code: 'MINIPROGRAM',
    labelKey: 'miniprogram',
    architecture: 'mini-program',
    family: 'mini-program',
    scanGroup: 'miniprogram',
    scannable: true,
  },
  {
    code: 'ANDROID',
    labelKey: 'android',
    architecture: 'android-mobile',
    family: 'mobile',
    scanGroup: 'android',
    scannable: true,
  },
  {
    code: 'IOS',
    labelKey: 'ios',
    architecture: 'ios-mobile',
    family: 'mobile',
    scanGroup: 'ios',
    scannable: true,
  },
  {
    code: 'HARMONY',
    labelKey: 'harmony',
    architecture: 'harmony-mobile',
    family: 'mobile',
    scanGroup: 'harmonyos',
    scannable: true,
  },
  {
    code: 'UNIAPP',
    labelKey: 'uniapp',
    architecture: 'uniapp',
    family: 'mobile',
    scanGroup: 'miniprogram',
    scannable: true,
  },
  { code: 'UNITY', labelKey: 'unity', architecture: 'unity', family: 'engine', scannable: false },
] as const;

/** Architecture spellings the catalog or older clients may still store. */
const TEMPLATE_APP_TYPE_ALIASES: Readonly<Record<string, TemplatePlatform>> = {
  FLUTTER_MOBILE: 'FLUTTER',
  'FLUTTER-MOBILE': 'FLUTTER',
  MINI_PROGRAM: 'MINIPROGRAM',
  'MINI-PROGRAM': 'MINIPROGRAM',
  MP: 'MINIPROGRAM',
  STATICWEB: 'STATIC_WEB',
  'STATIC-WEB': 'STATIC_WEB',
  ANDROID_MOBILE: 'ANDROID',
  'ANDROID-MOBILE': 'ANDROID',
  IOS_MOBILE: 'IOS',
  'IOS-MOBILE': 'IOS',
  HARMONY_MOBILE: 'HARMONY',
  'HARMONY-MOBILE': 'HARMONY',
  HARMONYOS: 'HARMONY',
  UNI_APP: 'UNIAPP',
  'UNI-APP': 'UNIAPP',
};

const TEMPLATE_APP_TYPE_BY_CODE: ReadonlyMap<string, TemplateAppType> = new Map(
  TEMPLATE_APP_TYPES.map((type) => [type.code, type]),
);

/** Normalize a stored platform code onto the canonical uppercase spelling. */
function normalizeTemplatePlatformCode(platform: string): string {
  return platform.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Resolve the stored platform code onto its application-type metadata.
 * @param platform - raw `template_platform` value (case and separators tolerant).
 * @returns the metadata, or undefined for an empty or unknown code.
 */
export function resolveTemplateAppType(
  platform: string | undefined | null,
): TemplateAppType | undefined {
  if (!platform) return undefined;
  const normalized = normalizeTemplatePlatformCode(platform);
  if (normalized === '') return undefined;
  const canonical = TEMPLATE_APP_TYPE_ALIASES[normalized] ?? normalized;
  return TEMPLATE_APP_TYPE_BY_CODE.get(canonical);
}
