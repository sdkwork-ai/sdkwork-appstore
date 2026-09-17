import { SdkworkUiRouteContribution } from '@sdkwork/sdkwork-appstore-harmony-mobile-core';

/**
 * Route contributions for the ai-hub capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and mini program roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The HarmonyOS
 * router maps each id to its own page path.
 */
export const AiHubRouteContributions: SdkworkUiRouteContribution[] = [
  { id: 'app.store.ai-hub.index', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'index', path: '/ai-hub', titleKey: 'appstore.ai-hub.index.title', auth: 'public' },
  { id: 'app.store.ai-hub.experts', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'experts', path: '/experts', titleKey: 'appstore.ai-hub.experts.title', auth: 'public' },
  { id: 'app.store.ai-hub.plugins', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'plugins', path: '/plugins', titleKey: 'appstore.ai-hub.plugins.title', auth: 'public' },
  { id: 'app.store.ai-hub.skills', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'skills', path: '/skills', titleKey: 'appstore.ai-hub.skills.title', auth: 'public' },
  { id: 'app.store.ai-hub.mcp', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'mcp', path: '/mcp', titleKey: 'appstore.ai-hub.mcp.title', auth: 'public' },
  { id: 'app.store.ai-hub.templates', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'templates', path: '/templates', titleKey: 'appstore.ai-hub.templates.title', auth: 'public' },
  { id: 'app.store.ai-hub.template-detail', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail', path: '/template/:id', titleKey: 'appstore.ai-hub.template-detail.title', auth: 'public', paramNames: ['id'] },
  { id: 'app.store.ai-hub.template-detail-alias', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail-alias', path: '/templates/:id', titleKey: 'appstore.ai-hub.template-detail-alias.title', auth: 'public', paramNames: ['id'] },
];
