import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminDemands as adminDemandsEnUS } from './en-US/appstore/admin/demands';
import { adminDemands as adminDemandsZhCN } from './zh-CN/appstore/admin/demands';

/** Fragment namespace owned by the demand capability. */
export const APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE = 'adminDemands' as const;

/**
 * Locale bundle for the demand domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminDemandsI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE]: adminDemandsZhCN },
  'en-US': { [APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE]: adminDemandsEnUS },
  en: { [APPSTORE_ADMIN_DEMANDS_I18N_NAMESPACE]: adminDemandsEnUS },
};

export { adminDemandsZhCN, adminDemandsEnUS };
