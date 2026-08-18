import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { nav as navZh } from './zh-CN/appstore/storefront/nav';
import { common as commonZh } from './zh-CN/appstore/storefront/common';
import { discover as discoverZh } from './zh-CN/appstore/storefront/discover';
import { apps as appsZh } from './zh-CN/appstore/storefront/apps';
import { games as gamesZh } from './zh-CN/appstore/storefront/games';
import { aihub as aihubZh } from './zh-CN/appstore/storefront/aihub';
import { plugins as pluginsZh } from './zh-CN/appstore/storefront/plugins';
import { skills as skillsZh } from './zh-CN/appstore/storefront/skills';
import { mcp as mcpZh } from './zh-CN/appstore/system/mcp';
import { templates as templatesZh } from './zh-CN/appstore/storefront/templates';
import { updates as updatesZh } from './zh-CN/appstore/storefront/updates';
import { search as searchZh } from './zh-CN/appstore/storefront/search';
import { charts as chartsZh } from './zh-CN/appstore/storefront/charts';
import { appDetail as appDetailZh } from './zh-CN/appstore/storefront/appDetail';
import { library as libraryZh } from './zh-CN/appstore/storefront/library';
import { wishlist as wishlistZh } from './zh-CN/appstore/storefront/wishlist';
import { category as categoryZh } from './zh-CN/appstore/storefront/category';
import { collection as collectionZh } from './zh-CN/appstore/storefront/collection';
import { events as eventsZh } from './zh-CN/appstore/storefront/events';
import { publisher as publisherZh } from './zh-CN/appstore/storefront/publisher';
import { consoleLocales as consoleLocalesZh } from './zh-CN/appstore/console/console';
import { admin as adminZh } from './zh-CN/appstore/console/admin';
import { install as installZh } from './zh-CN/appstore/system/install';

import { nav as navEn } from './en/appstore/storefront/nav';
import { common as commonEn } from './en/appstore/storefront/common';
import { discover as discoverEn } from './en/appstore/storefront/discover';
import { apps as appsEn } from './en/appstore/storefront/apps';
import { games as gamesEn } from './en/appstore/storefront/games';
import { aihub as aihubEn } from './en/appstore/storefront/aihub';
import { plugins as pluginsEn } from './en/appstore/storefront/plugins';
import { skills as skillsEn } from './en/appstore/storefront/skills';
import { mcp as mcpEn } from './en/appstore/system/mcp';
import { templates as templatesEn } from './en/appstore/storefront/templates';
import { updates as updatesEn } from './en/appstore/storefront/updates';
import { search as searchEn } from './en/appstore/storefront/search';
import { charts as chartsEn } from './en/appstore/storefront/charts';
import { appDetail as appDetailEn } from './en/appstore/storefront/appDetail';
import { library as libraryEn } from './en/appstore/storefront/library';
import { wishlist as wishlistEn } from './en/appstore/storefront/wishlist';
import { category as categoryEn } from './en/appstore/storefront/category';
import { collection as collectionEn } from './en/appstore/storefront/collection';
import { events as eventsEn } from './en/appstore/storefront/events';
import { publisher as publisherEn } from './en/appstore/storefront/publisher';
import { consoleLocales as consoleLocalesEn } from './en/appstore/console/console';
import { admin as adminEn } from './en/appstore/console/admin';
import { install as installEn } from './en/appstore/system/install';

const SAVED_LANG_KEY = 'app_language';
const initialLang = localStorage.getItem(SAVED_LANG_KEY) || 'zh-CN';

const zhCN = {
  nav: navZh,
  common: commonZh,
  discover: discoverZh,
  apps: appsZh,
  games: gamesZh,
  aihub: aihubZh,
  plugins: pluginsZh,
  skills: skillsZh,
  mcp: mcpZh,
  templates: templatesZh,
  updates: updatesZh,
  search: searchZh,
  charts: chartsZh,
  appDetail: appDetailZh,
  library: libraryZh,
  wishlist: wishlistZh,
  category: categoryZh,
  collection: collectionZh,
  events: eventsZh,
  publisher: publisherZh,
  console: consoleLocalesZh,
  admin: adminZh,
  install: installZh,
};

const en = {
  nav: navEn,
  common: commonEn,
  discover: discoverEn,
  apps: appsEn,
  games: gamesEn,
  aihub: aihubEn,
  plugins: pluginsEn,
  skills: skillsEn,
  mcp: mcpEn,
  templates: templatesEn,
  updates: updatesEn,
  search: searchEn,
  charts: chartsEn,
  appDetail: appDetailEn,
  library: libraryEn,
  wishlist: wishlistEn,
  category: categoryEn,
  collection: collectionEn,
  events: eventsEn,
  publisher: publisherEn,
  console: consoleLocalesEn,
  admin: adminEn,
  install: installEn,
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en }
    },
    lng: initialLang,
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    }
  });

export const changeLanguage = (lang: 'zh-CN' | 'en') => {
  localStorage.setItem(SAVED_LANG_KEY, lang);
  i18n.changeLanguage(lang);
};

/**
 * Ensure i18n is initialized and optionally switch to a host locale.
 * @param locale - BCP 47 tag such as `zh-CN` or `en-US`.
 * @returns the shared i18n instance.
 */
export function initializeAppstorePcI18n(locale?: string) {
  const raw = locale?.trim() || i18n.language || initialLang
  const lang: 'zh-CN' | 'en' = raw.startsWith('zh') ? 'zh-CN' : 'en'
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang)
  }
  return i18n
}

export default i18n;
