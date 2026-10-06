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

import { developerMarketShellZhCN } from './zh-CN/appstore/developer-market/shell';
import { developerMarketShellEn } from './en-US/appstore/developer-market/shell';

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
