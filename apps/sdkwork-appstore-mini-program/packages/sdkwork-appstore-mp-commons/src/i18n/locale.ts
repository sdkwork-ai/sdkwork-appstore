/**
 * Locale resolution helpers.
 *
 * This is a thin boundary module: it holds no authored copy. Locale fragments
 * live under `src/i18n/<locale>/appstore/<capability>/` per
 * `I18N_SPEC.md` section 6.1.
 */
export const appstoreSupportedLocales = ["en-US", "zh-CN"] as const;

export type AppstoreLocale = (typeof appstoreSupportedLocales)[number];

export const appstoreDefaultLocale: AppstoreLocale = "en-US";

export function normalizeAppstoreLocale(candidate?: string): AppstoreLocale {
  const value = candidate?.trim();
  if (!value) {
    return appstoreDefaultLocale;
  }
  return (appstoreSupportedLocales as readonly string[]).includes(value)
    ? (value as AppstoreLocale)
    : appstoreDefaultLocale;
}

export function resolveAppstoreLocaleFragmentPath(
  locale: AppstoreLocale,
  capability: string,
  fragment: string,
): string {
  return `i18n/${locale}/appstore/${capability}/${fragment}`;
}
