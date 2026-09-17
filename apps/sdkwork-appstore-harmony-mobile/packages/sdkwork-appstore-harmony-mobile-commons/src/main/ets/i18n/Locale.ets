/**
 * Locale resolution helpers.
 *
 * Thin boundary module: no authored copy lives here. Locale fragments live
 * under `i18n/<locale>/appstore/<capability>/` per `I18N_SPEC.md` section 6.1
 * (Harmony allows `.json` and `.ts` fragments).
 */
export const APPSTORE_SUPPORTED_LOCALES: string[] = ['en-US', 'zh-CN'];
export const APPSTORE_DEFAULT_LOCALE: string = 'en-US';

export function normalizeAppstoreLocale(candidate?: string): string {
  const value: string = (candidate ?? '').trim();
  if (value.length === 0) {
    return APPSTORE_DEFAULT_LOCALE;
  }
  return APPSTORE_SUPPORTED_LOCALES.includes(value) ? value : APPSTORE_DEFAULT_LOCALE;
}
