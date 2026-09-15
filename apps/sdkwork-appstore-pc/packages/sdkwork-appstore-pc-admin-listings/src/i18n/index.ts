import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminListings as adminListingsEnUS } from './en-US/appstore/admin/listings';
import { adminListings as adminListingsZhCN } from './zh-CN/appstore/admin/listings';

/** Fragment namespace owned by the listings capability. */
export const APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE = 'adminListings' as const;

/**
 * Locale bundle for the listings domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminListingsI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE]: adminListingsZhCN },
  'en-US': { [APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE]: adminListingsEnUS },
  en: { [APPSTORE_ADMIN_LISTINGS_I18N_NAMESPACE]: adminListingsEnUS },
};

export { adminListingsZhCN, adminListingsEnUS };
