import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';

/**
 * Route contributions owned by the ai-hub capability package.
 *
 * Route ids are shared with the PC, Flutter, mini program, and HarmonyOS roots;
 * this package owns the H5 implementation of each of them
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7).
 */
export const aiHubRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.ai-hub.index', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'index', path: '/ai-hub', titleKey: 'appstore.ai-hub.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.experts', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'experts', path: '/experts', titleKey: 'appstore.ai-hub.experts.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.plugins', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'plugins', path: '/plugins', titleKey: 'appstore.ai-hub.plugins.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.skills', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'skills', path: '/skills', titleKey: 'appstore.ai-hub.skills.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.mcp', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'mcp', path: '/mcp', titleKey: 'appstore.ai-hub.mcp.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.templates', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'templates', path: '/templates', titleKey: 'appstore.ai-hub.templates.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.template-detail', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail', path: '/template/:id', titleKey: 'appstore.ai-hub.template-detail.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.template-detail-alias', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'template-detail-alias', path: '/templates/:id', titleKey: 'appstore.ai-hub.template-detail-alias.title', auth: 'public', params: [{ name: 'id', required: true }], presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} }
] as const;
