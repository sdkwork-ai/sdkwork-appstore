import type { SdkworkUiRouteContribution } from "@sdkwork/appstore-mp-core";

/**
 * Route contributions for the ai-hub capability.
 *
 * Route ids are shared with the PC, H5, Flutter, and HarmonyOS roots
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 7). The mini program
 * resolves each id through its own `pages` or `subpackages` map.
 */
export const aiHubRouteContributions: readonly SdkworkUiRouteContribution[] = [
  { id: 'app.store.ai-hub.index', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'index', path: '/ai-hub', titleKey: 'appstore.ai-hub.index.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.experts', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'experts', path: '/experts', titleKey: 'appstore.ai-hub.experts.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.skills', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'skills', path: '/skills', titleKey: 'appstore.ai-hub.skills.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
  { id: 'app.store.ai-hub.mcp', surface: 'app', domain: 'store', capability: 'ai-hub', screen: 'mcp', path: '/mcp', titleKey: 'appstore.ai-hub.mcp.title', auth: 'public', presentation: {"pc":"page","h5Mobile":"stack","flutterMobile":"route","miniProgram":"page","harmonyNative":"page"} },
] as const;
