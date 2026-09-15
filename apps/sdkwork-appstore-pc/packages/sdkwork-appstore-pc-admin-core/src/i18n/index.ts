/**
 * Locale-fragment composition contract for the operator console.
 *
 * This module declares **types and merge helpers only** — it authors no copy.
 * Authored operator messages stay package-owned under
 * `src/i18n/<locale>/appstore/admin/<fragment>.ts` in the package that renders
 * them (`I18N_SPEC.md` §6/§6.1), and the application bootstrap registers the
 * merged result into the single runtime i18n provider (§7).
 */

/**
 * One admin package's contribution to the shared locale resources.
 *
 * Shape: `locale tag -> fragment namespace -> message map`. The inner map is a
 * plain object so fragments stay reviewable and diff-friendly.
 */
export type AppstoreAdminI18nBundle = Readonly<
  Record<string, Readonly<Record<string, Readonly<Record<string, unknown>>>>>
>;

/** Minimal structural view of the i18next instance the bootstrap supplies. */
export interface AppstoreAdminI18nInstance {
  addResourceBundle(
    lng: string,
    ns: string,
    resources: Record<string, unknown>,
    deep?: boolean,
    overwrite?: boolean,
  ): unknown;
}

/**
 * Merge admin locale bundles into one `locale -> namespace -> messages` map.
 *
 * Later bundles win on duplicate keys within the same locale and namespace, so
 * the bootstrap controls override precedence by ordering
 * (`I18N_SPEC.md` §7 application-line overrides).
 * @param bundles - locale bundles contributed by admin packages.
 */
export function mergeAppstoreAdminI18nBundles(
  bundles: readonly AppstoreAdminI18nBundle[],
): Record<string, Record<string, Record<string, unknown>>> {
  const merged: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const bundle of bundles) {
    for (const [locale, namespaces] of Object.entries(bundle)) {
      const localeEntry = (merged[locale] ??= {});
      for (const [namespace, messages] of Object.entries(namespaces)) {
        localeEntry[namespace] = { ...(localeEntry[namespace] ?? {}), ...messages };
      }
    }
  }
  return merged;
}

/**
 * Register merged admin locale bundles into the application i18n provider.
 *
 * Existing keys are preserved (`overwrite: false`) so an embedding host that
 * already overrode an admin fragment wins over the package default.
 * @param instance - the application's single runtime i18n instance.
 * @param bundles - locale bundles contributed by admin packages.
 * @param namespace - i18next namespace to merge into; defaults to `translation`.
 */
export function registerAppstoreAdminI18nBundles(
  instance: AppstoreAdminI18nInstance,
  bundles: readonly AppstoreAdminI18nBundle[],
  namespace = 'translation',
): void {
  const merged = mergeAppstoreAdminI18nBundles(bundles);
  for (const [locale, namespaces] of Object.entries(merged)) {
    const messages = namespaces[namespace];
    if (!messages) {
      continue;
    }
    instance.addResourceBundle(locale, namespace, messages, true, false);
  }
}
