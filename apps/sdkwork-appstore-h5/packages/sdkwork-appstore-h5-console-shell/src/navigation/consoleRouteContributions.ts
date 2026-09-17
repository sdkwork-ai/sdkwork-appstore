import type { SdkworkUiRouteContribution } from '@sdkwork/appstore-h5-core';
import { consolePublisherRouteContributions } from '@sdkwork/appstore-h5-console-publisher';
import { consoleSettingsRouteContributions } from '@sdkwork/appstore-h5-console-settings';

/**
 * Console route composition.
 *
 * `console-shell` owns user-facing console navigation and route composition
 * only; the console capability packages own the workflows behind each route
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 4).
 */
export const consoleShellRouteContributions: readonly SdkworkUiRouteContribution[] = [
  ...consolePublisherRouteContributions,
  ...consoleSettingsRouteContributions,
];
