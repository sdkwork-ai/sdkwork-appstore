/**
 * Distribution action resolution for the storefront (storefront side).
 *
 * Maps the platform display groups (see platforms.ts) onto the action each
 * distribution type carries on the PC storefront:
 *
 *   pcWeb / h5Web      -> `open`: direct open in a new independent window
 *   pcDesktop          -> `install`: download + install for the detected OS
 *   android/ios/harmonyos, miniprogram, browserExtension
 *                      -> `qr`: scan a QR code to continue on that device
 */

import type { AppItem } from './types';
import {
  platformGroupsForCodes,
  resolveAppPlatformGroup,
  type AppPlatformGroupKey,
} from './platforms';

/** Host desktop operating system detected from the user agent. */
export type DesktopOs = 'windows' | 'macos' | 'linux';

/** What a distribution action does when triggered. */
export type DistributionActionKind = 'open' | 'install' | 'qr';

/** One actionable distribution of a listing on this storefront. */
export interface DistributionAction {
  /** Display group the action belongs to. */
  group: AppPlatformGroupKey;
  /** What the action does when triggered. */
  kind: DistributionActionKind;
  /** Raw platform codes the action covers (windows/macos/linux for installs). */
  platformCodes: DesktopOs[];
  /** URL to open for `open` actions; the scan target for `qr` actions. */
  url?: string;
}

/** Desktop codes in canonical display order (windows first: dominant storefront OS). */
const DESKTOP_CODES: readonly DesktopOs[] = ['windows', 'macos', 'linux'];

/**
 * Detect the host desktop OS from a user agent string.
 * @param userAgent - navigator.userAgent; defaults to the runtime value.
 * @returns the detected desktop OS, or null when the agent is not a desktop browser.
 */
export function detectDesktopOs(userAgent?: string): DesktopOs | null {
  const agent = userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent);
  if (/Windows Phone|Android|iPhone|iPad|iPod/i.test(agent)) {
    return null;
  }
  if (/Windows/i.test(agent)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(agent)) return 'macos';
  if (/Linux|X11/i.test(agent)) return 'linux';
  return null;
}

/**
 * Desktop installer codes a listing ships, ordered for the detected OS first
 * so the primary download button matches this machine.
 * @param platforms - raw platform codes of the listing.
 * @param detectedOs - host desktop OS; null when detection failed.
 * @returns desktop codes, detected-OS-first; [] when the listing is desktop-less.
 */
export function desktopInstallCodes(
  platforms: readonly string[] | undefined | null,
  detectedOs: DesktopOs | null,
): DesktopOs[] {
  const shipped = DESKTOP_CODES.filter((code) =>
    (platforms ?? []).some((raw) => raw.trim().toLowerCase() === code),
  );
  if (detectedOs === null || !shipped.includes(detectedOs)) {
    return shipped;
  }
  return [detectedOs, ...shipped.filter((code) => code !== detectedOs)];
}

/**
 * The first raw platform code the listing ships within one display group —
 * the key the per-platform link map (appstore_app_platform) is keyed by.
 */
function firstCodeForGroup(
  platforms: readonly string[],
  group: AppPlatformGroupKey,
): string | undefined {
  for (const raw of platforms) {
    if (resolveAppPlatformGroup(raw) === group) {
      return raw.trim().toLowerCase();
    }
  }
  return undefined;
}

/** QR fallback target: this storefront's own listing anchor on the current origin. */
function listingFallbackUrl(appId: string): string {
  if (typeof window === 'undefined' || !window.location) {
    return `/app/${appId}`;
  }
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}#/app/${appId}`;
}

/**
 * Resolve every actionable distribution of a listing, in display-group order
 * (the canonical APP_PLATFORM_GROUPS order: android, ios, harmonyos,
 * pcDesktop, pcWeb, h5Web, miniprogram, browserExtension).
 *
 * Browser groups without an access URL still resolve as `open` actions with
 * an undefined url — callers keep the button but surface the missing link.
 * @param app - listing item (platform codes + access URL).
 * @param detectedOs - host desktop OS for install ordering; detected on demand.
 * @returns one action per supported distribution group.
 */
export function resolveDistributionActions(
  app: Pick<AppItem, 'platforms' | 'accessUrl' | 'platformLinks' | 'id'>,
  detectedOs?: DesktopOs | null,
): DistributionAction[] {
  const groups = platformGroupsForCodes(app.platforms);
  if (groups.length === 0) {
    return [];
  }
  const os = detectedOs === undefined ? detectDesktopOs() : detectedOs;
  const desktopCodes = desktopInstallCodes(app.platforms, os);
  return groups.map((group) => {
    if (group === 'pcWeb' || group === 'h5Web') {
      return { group, kind: 'open', platformCodes: [], url: app.accessUrl };
    }
    if (group === 'pcDesktop') {
      return { group, kind: 'install', platformCodes: desktopCodes };
    }
    const code = firstCodeForGroup(app.platforms ?? [], group);
    const qrUrl = (code && app.platformLinks?.[code]) || app.accessUrl;
    return { group, kind: 'qr', platformCodes: [], url: qrUrl ?? listingFallbackUrl(app.id) };
  });
}

/** Primary-action priority on the PC storefront: instant open, then install, then QR. */
const PRIMARY_PRIORITY: readonly DistributionActionKind[] = ['open', 'install', 'qr'];

/**
 * Pick the action the primary card/detail button carries.
 * @param app - listing item (platform codes + access URL).
 * @returns the highest-priority action, or undefined for platform-less listings.
 */
export function primaryDistributionAction(
  app: Pick<AppItem, 'platforms' | 'accessUrl' | 'platformLinks' | 'id'>,
): DistributionAction | undefined {
  const actions = resolveDistributionActions(app);
  if (actions.length === 0) {
    return undefined;
  }
  for (const kind of PRIMARY_PRIORITY) {
    const action = actions.find((entry) => entry.kind === kind);
    if (action) {
      return action;
    }
  }
  return actions[0];
}

/**
 * Open a URL in a new independent window without disturbing the host page:
 * `noopener` detaches the opener so the storefront window keeps its state,
 * which also keeps the embedded host (BirdCoder desktop) responsive.
 * @param url - the target URL; no-op when empty.
 * @returns true when a new window was opened.
 */
export function openDistributionUrl(url: string | undefined): boolean {
  const target = url?.trim();
  if (!target) {
    return false;
  }
  const opened = window.open(target, '_blank', 'noopener,noreferrer');
  return opened !== null && opened !== undefined;
}
