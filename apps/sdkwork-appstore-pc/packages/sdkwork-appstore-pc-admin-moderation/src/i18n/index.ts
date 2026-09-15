import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminModeration as adminModerationEnUS } from './en-US/appstore/admin/moderation';
import { adminModeration as adminModerationZhCN } from './zh-CN/appstore/admin/moderation';

/** Fragment namespace owned by the moderation capability. */
export const APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE = 'adminModeration' as const;

/**
 * Locale bundle for the moderation domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminModerationI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE]: adminModerationZhCN },
  'en-US': { [APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE]: adminModerationEnUS },
  en: { [APPSTORE_ADMIN_MODERATION_I18N_NAMESPACE]: adminModerationEnUS },
};

export { adminModerationZhCN, adminModerationEnUS };
