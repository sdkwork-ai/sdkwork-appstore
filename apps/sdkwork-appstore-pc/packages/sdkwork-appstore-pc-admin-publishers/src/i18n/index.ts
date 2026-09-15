import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminPublishers as adminPublishersEnUS } from './en-US/appstore/admin/publishers';
import { adminPublishers as adminPublishersZhCN } from './zh-CN/appstore/admin/publishers';

/** Fragment namespace owned by the publisher capability. */
export const APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE = 'adminPublishers' as const;

/**
 * Locale bundle for the publisher domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminPublishersI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE]: adminPublishersZhCN },
  'en-US': { [APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE]: adminPublishersEnUS },
  en: { [APPSTORE_ADMIN_PUBLISHERS_I18N_NAMESPACE]: adminPublishersEnUS },
};

export { adminPublishersZhCN, adminPublishersEnUS };
