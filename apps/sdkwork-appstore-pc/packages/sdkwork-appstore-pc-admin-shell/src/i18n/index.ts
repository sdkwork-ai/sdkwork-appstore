import type { AppstoreAdminI18nBundle, AppstoreAdminI18nInstance } from '@sdkwork/appstore-pc-admin-core';

import { adminShell as adminShellEnUS } from './en-US/appstore/admin/shell';
import { adminShell as adminShellZhCN } from './zh-CN/appstore/admin/shell';

/** Fragment namespace owned by the admin shell. */
export const APPSTORE_ADMIN_SHELL_I18N_NAMESPACE = 'adminShell' as const;

/**
 * Locale bundle for the console chrome.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminShellI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_SHELL_I18N_NAMESPACE]: adminShellZhCN },
  'en-US': { [APPSTORE_ADMIN_SHELL_I18N_NAMESPACE]: adminShellEnUS },
  en: { [APPSTORE_ADMIN_SHELL_I18N_NAMESPACE]: adminShellEnUS },
};

export { registerAppstoreAdminI18nBundles } from '@sdkwork/appstore-pc-admin-core';
export type {
  AppstoreAdminI18nBundle,
  AppstoreAdminI18nInstance,
} from '@sdkwork/appstore-pc-admin-core';

export { adminShellZhCN, adminShellEnUS };
