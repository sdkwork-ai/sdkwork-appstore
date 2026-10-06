/**
 * Developer-market i18n bundles for the App Store storefront.
 *
 * The documents reference packages speak flat dotted keys under the default
 * `translation` namespace (`api.title`, `sdk.generated.archives`, …), while the
 * storefront groups its copy into nested namespaces. The storefront i18n entry
 * spreads these bundles at the translation root; no documents key's first
 * segment collides with a storefront group name, so i18next's flat-key
 * fallback resolves them.
 *
 * Importing from `@sdkwork/documents-pc-i18n` initializes the default i18next
 * instance with the documents catalog as a side effect. The storefront's own
 * `init` runs after its imports and replaces the resources wholesale, so the
 * final catalog is the storefront's — with these bundles merged in.
 */
import {
  publicApiReferenceMessages,
  publicDocsMessages,
  publicSdkReferenceMessages,
} from '@sdkwork/documents-pc-i18n';

const developerMarketShellZhCN = {
  'developerMarket.loading': '正在加载开发者市场…',
  'developerMarket.unavailable.title': '开发者市场暂不可用',
  'developerMarket.unavailable.subtitle': '应用商店运行时未绑定开发者市场服务，请重启应用商店后重试。',
};

const developerMarketShellEn = {
  'developerMarket.loading': 'Loading the developer market…',
  'developerMarket.unavailable.title': 'Developer market is unavailable',
  'developerMarket.unavailable.subtitle':
    'The App Store runtime has no developer-market binding. Restart the App Store and try again.',
};

/** Flat documents copy for the `en` locale, merged at the translation root. */
export const developerMarketEn = {
  ...publicDocsMessages.en,
  ...publicApiReferenceMessages.en,
  ...publicSdkReferenceMessages.en,
  ...developerMarketShellEn,
};

/** Flat documents copy for the `zh-CN` locale, merged at the translation root. */
export const developerMarketZhCN = {
  ...publicDocsMessages.zh,
  ...publicApiReferenceMessages.zh,
  ...publicSdkReferenceMessages.zh,
  ...developerMarketShellZhCN,
};
