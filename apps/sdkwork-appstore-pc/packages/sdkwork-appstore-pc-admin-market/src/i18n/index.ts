import type { AppstoreAdminI18nBundle } from '@sdkwork/appstore-pc-admin-core';

import { adminMarket as adminMarketEnUS } from './en-US/appstore/admin/market';
import { adminMarket as adminMarketZhCN } from './zh-CN/appstore/admin/market';

/** Fragment namespace owned by the market capability. */
export const APPSTORE_ADMIN_MARKET_I18N_NAMESPACE = 'adminMarket' as const;

/**
 * Locale bundle for the market domain.
 *
 * `en` is registered alongside `en-US` because the application runtime declares
 * its English active locale as `en`; authoring stays on the canonical BCP 47
 * tag required by `I18N_SPEC.md` §6.1.
 */
export const appstoreAdminMarketI18nBundle: AppstoreAdminI18nBundle = {
  'zh-CN': { [APPSTORE_ADMIN_MARKET_I18N_NAMESPACE]: adminMarketZhCN },
  'en-US': { [APPSTORE_ADMIN_MARKET_I18N_NAMESPACE]: adminMarketEnUS },
  en: { [APPSTORE_ADMIN_MARKET_I18N_NAMESPACE]: adminMarketEnUS },
};

export { adminMarketZhCN, adminMarketEnUS };
