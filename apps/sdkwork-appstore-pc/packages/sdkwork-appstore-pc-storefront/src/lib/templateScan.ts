/**
 * Phone-scan target resolution for the template detail page.
 *
 * A template is experienced on a phone only when it scaffolds a scannable app
 * form (H5, mini program, or a mobile app). The URL a phone should open comes
 * from, in priority order:
 *
 *   1. the template's own live demo address (`demoUrl` metadata);
 *   2. the associated app's distribution link for the template's platform
 *      group (mini-program / mobile store landing pages);
 *   3. any remaining QR distribution link of that app;
 *   4. the app's direct access URL.
 *
 * When none resolves, the detail page offers no scan action rather than a dead
 * button.
 */
import {
  resolveDistributionActions,
  type AppItem,
  type TemplateAppType,
} from '@sdkwork/appstore-pc-core';
import type { TemplateItem } from '../types';

/** Where the scan target was resolved from. */
export type TemplateScanSource = 'demo' | 'distribution' | 'app';

/** The URL encoded into the template detail page's QR code. */
export interface TemplateScanTarget {
  url: string;
  source: TemplateScanSource;
}

/** Listing fields the distribution resolver needs; decoupled for testing. */
export type TemplateScanApp = Pick<AppItem, 'id' | 'platforms' | 'accessUrl' | 'platformLinks'>;

/**
 * True for an absolute web address. Catalog fields are author/publisher input,
 * so only such a target is rendered as a clickable link; any other scheme
 * (`javascript:`, `data:`, …) is shown as plain text while the QR still encodes
 * it for a phone.
 * @param value - the candidate scan target.
 * @returns true when the value is an `http(s)` URL.
 */
export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Resolve the URL a phone should open for a scannable template.
 * @param template - template fields carrying the author-provided demo address.
 * @param appType - the template's application type (undefined or non-scannable yields no target).
 * @param relatedApp - the app built from the template, when the detail page loaded one.
 * @returns the scan target, or undefined when no phone-openable address exists.
 */
export function resolveTemplateScanTarget(
  template: Pick<TemplateItem, 'demoUrl'>,
  appType: TemplateAppType | undefined,
  relatedApp: TemplateScanApp | null | undefined,
): TemplateScanTarget | undefined {
  // Desktop, tablet, and engine forms — and codes this build cannot classify —
  // are not experienced by scanning a phone.
  if (appType === undefined || !appType.scannable) {
    return undefined;
  }
  const demo = template.demoUrl?.trim();
  if (demo) {
    return { url: demo, source: 'demo' };
  }
  if (!relatedApp) {
    return undefined;
  }

  const actions = resolveDistributionActions(relatedApp);
  const groupMatch = appType?.scanGroup
    ? actions.find((action) => action.group === appType.scanGroup && action.url !== undefined)
    : undefined;
  if (groupMatch?.url) {
    return { url: groupMatch.url, source: 'distribution' };
  }

  const qrMatch = actions.find((action) => action.kind === 'qr' && action.url !== undefined);
  if (qrMatch?.url) {
    return { url: qrMatch.url, source: 'distribution' };
  }

  const accessUrl = relatedApp.accessUrl?.trim();
  return accessUrl ? { url: accessUrl, source: 'app' } : undefined;
}
