import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminCatalog as adminCatalogEnUS } from './en-US/appstore/admin/catalog';
import { adminCatalog as adminCatalogZhCN } from './zh-CN/appstore/admin/catalog';

/** Fragment namespace owned by the catalog capability. */
export const APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE = 'adminCatalog' as const;

/**
 * Locale bundle for the catalog domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminCatalogI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE]: adminCatalogZhCN },
  'en-US': { [APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE]: adminCatalogEnUS },
  en: { [APPSTORE_ADMIN_CATALOG_I18N_NAMESPACE]: adminCatalogEnUS },
};

export { adminCatalogZhCN, adminCatalogEnUS };
