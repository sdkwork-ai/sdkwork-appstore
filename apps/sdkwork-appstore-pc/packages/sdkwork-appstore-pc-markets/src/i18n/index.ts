/**
 * AI Lab marketplace locale resources.
 *
 * Host apps register these resources under their i18n bundles, e.g.:
 *
 * ```ts
 * import {
 *   pluginsZhCN, pluginsEn,
 *   skillsZhCN, skillsEn,
 *   expertsZhCN, expertsEn,
 *   mcpZhCN, mcpEn,
 * } from '@sdkwork/appstore-pc-markets/i18n';
 *
 * i18n.init({
 *   resources: {
 *     'zh-CN': { translation: { plugins: pluginsZhCN, skills: skillsZhCN, experts: expertsZhCN, mcp: mcpZhCN } },
 *     en: { translation: { plugins: pluginsEn, skills: skillsEn, experts: expertsEn, mcp: mcpEn } },
 *   },
 * });
 * ```
 */
export { plugins as pluginsZhCN } from './zh-CN/appstore/storefront/plugins';
export { plugins as pluginsEn } from './en/appstore/storefront/plugins';
export { skills as skillsZhCN } from './zh-CN/appstore/storefront/skills';
export { skills as skillsEn } from './en/appstore/storefront/skills';
export { experts as expertsZhCN } from './zh-CN/appstore/storefront/experts';
export { experts as expertsEn } from './en/appstore/storefront/experts';
export { mcp as mcpZhCN } from './zh-CN/appstore/system/mcp';
export { mcp as mcpEn } from './en/appstore/system/mcp';
