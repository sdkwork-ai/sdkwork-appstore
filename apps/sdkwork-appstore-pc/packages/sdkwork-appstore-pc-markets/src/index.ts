/**
 * AI Lab marketplace pages package.
 *
 * Self-contained implementation of the three AI Lab storefront marketplaces:
 * skills (技能), MCP servers (MCP 服务) and experts (专家).
 *
 * Each page consumes its service through the port singletons re-exported by
 * `@sdkwork/appstore-pc-core` (SkillsService / McpService / ExpertsService),
 * which hosts bind to a real SDK-backed implementation during bootstrap via
 * `@sdkwork/appstore-pc-runtime`. This keeps the pages portable: any host app
 * can mount them by providing the port bindings and the i18n resources from
 * the `./i18n` subpath export.
 */
export { default as SkillsPage } from './SkillsPage';
export { default as ExpertsPage } from './ExpertsPage';
export { default as McpPage } from './McpPage';

export * from './components/skills';
export * from './components/experts';
export * from './components/mcp';

// The shared catalog building blocks: one chip row, one category projection,
// one filter hook. A host that adds a further marketplace page composes these
// instead of copying a page's category bookkeeping.
export * from './components/marketCategories';
export * from './components/CategoryChips';
export * from './hooks/useCatalogCategoryFilter';

// The experts marketplace renders its catalog through the ExpertsService port
// singleton from `@sdkwork/appstore-pc-core` (bound to the App Store catalog
// `catalog.listExperts` feed by `@sdkwork/appstore-pc-runtime`), like the
// other markets. No page-level content data lives in this package.

export const skillsRoute = {
  path: '/skills',
  title: '技能',
  id: 'skills'
};

export const expertsRoute = {
  path: '/experts',
  title: '专家',
  id: 'experts'
};

export const mcpRoute = {
  path: '/mcp',
  title: 'MCP 服务',
  id: 'mcp'
};
