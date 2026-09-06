/**
 * AI Lab marketplace pages package.
 *
 * Self-contained implementation of the four AI Lab storefront marketplaces:
 * plugins (扩展插件), skills (技能), MCP servers (MCP 服务) and experts (专家).
 *
 * Each page consumes its service through the port singletons re-exported by
 * `@sdkwork/appstore-pc-core` (PluginsService / SkillsService / McpService),
 * which hosts bind to a real SDK-backed implementation during bootstrap via
 * `@sdkwork/appstore-pc-runtime`. This keeps the pages portable: any host app
 * can mount them by providing the port bindings and the i18n resources from
 * the `./i18n` subpath export.
 */
export { default as PluginsPage } from './PluginsPage';
export { default as SkillsPage } from './SkillsPage';
export { default as ExpertsPage } from './ExpertsPage';
export { default as McpPage } from './McpPage';

export * from './components/plugins';
export * from './components/skills';
export * from './components/experts';
export * from './components/mcp';

export const pluginsRoute = {
  path: '/plugins',
  title: '扩展插件',
  id: 'plugins'
};

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
