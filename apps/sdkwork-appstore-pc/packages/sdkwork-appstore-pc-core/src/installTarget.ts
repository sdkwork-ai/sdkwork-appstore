/**
 * Install target resolution for the PC storefront.
 *
 * A listing ships one installer per desktop operating system, and within one
 * operating system it may ship several CPU architectures and package formats
 * (the `appstore_release_artifact` matrix). The detail page picks the build
 * that belongs to the machine browsing it, the way desktop download pages do:
 * the host OS leads, the host CPU architecture breaks the tie, and the package
 * format follows that platform's conventional preference order.
 *
 * Host architecture comes from the User-Agent Client Hints high-entropy
 * `architecture` / `bitness` values when the browser exposes them (Chromium and
 * Electron do), because the frozen macOS user agent cannot tell Apple silicon
 * from Intel. The synchronous user-agent / `navigator.platform` heuristic is
 * the first paint and the fallback.
 */

import type { AppItem } from './types';
import { desktopInstallCodes, detectDesktopOs, type DesktopOs } from './distribution';

/** CPU architecture of a desktop build, normalized across publishers and UA hints. */
export type CpuArchitecture = 'x64' | 'arm64' | 'ia32' | 'universal';

/** Browser-visible host identity used to choose a build. */
export interface HostPlatform {
  /** Host desktop OS, or null on mobile browsers and unidentified agents. */
  os: DesktopOs | null;
  /** Host CPU architecture, or null when the browser cannot report it. */
  arch: CpuArchitecture | null;
}

/** How well a build matches the browsing host's CPU. */
export type BuildMatch = 'exact' | 'universal' | 'emulated' | 'unknown' | 'incompatible';

/** One installable variant of a listing. */
export interface InstallVariant {
  /** Stable identity for selection and list keys. */
  key: string;
  /** Desktop operating system this build targets. */
  platform: DesktopOs;
  /** Normalized build architecture; null when the release publishes no artifact. */
  architecture: CpuArchitecture | null;
  /** Raw architecture string of the release artifact, kept for diagnostics. */
  rawArchitecture: string | null;
  /** Raw package format code (`msi`, `dmg`, `appimage`, ...); empty for listing-level variants. */
  packageFormat: string;
  /** Display label of the package format (`MSI`, `DMG`, `AppImage`). */
  packageFormatLabel: string;
  /** Published artifact size in bytes, as the string the API returns. */
  fileSizeBytes: string | null;
  /** Release artifact id used to issue a download grant; null for listing-level variants. */
  artifactId: string | null;
  /** CPU relationship to the host on the host OS; `unknown` for another platform or missing data. */
  match: BuildMatch;
}

/** Resolution outcome that drives the install call to action. */
export type InstallPlanStatus = 'ready' | 'choose-platform' | 'no-desktop-build';

/** Everything the detail page needs to render the install call to action. */
export interface InstallPlan {
  host: HostPlatform;
  /** Every variant, host OS first, then canonical platform order, best CPU match first. */
  variants: InstallVariant[];
  /** Build the primary button installs; null when the host OS has no build. */
  recommended: InstallVariant | null;
  /** True when the listing ships at least one build for the host OS. */
  hostOsSupported: boolean;
  status: InstallPlanStatus;
}

/** Explicit build selection handed to the install flow from the builds menu. */
export interface InstallSelection {
  platform: DesktopOs;
  /** Selected CPU architecture; omitted or null matches any architecture. */
  architecture?: CpuArchitecture | null;
  /** Selected release artifact id; omitted matches any artifact of the platform. */
  artifactId?: string | null;
}

/** Desktop codes in canonical display order (Windows first: dominant storefront OS). */
const DESKTOP_ORDER: readonly DesktopOs[] = ['windows', 'macos', 'linux'];

/** Architecture preference when the host CPU is unknown: the safest build wins. */
const ARCH_PREFERENCE: Record<DesktopOs, readonly CpuArchitecture[]> = {
  // x64 runs on 64-bit x86 and on Windows on ARM through x64 emulation.
  windows: ['x64', 'arm64', 'universal', 'ia32'],
  // Intel builds run on Apple silicon through Rosetta; arm64 does not run on Intel.
  macos: ['universal', 'x64', 'arm64'],
  // x64 is the dominant Linux desktop and server architecture.
  linux: ['x64', 'arm64', 'universal', 'ia32'],
};

/** Conventional package format preference per platform. */
const FORMAT_PREFERENCE: Record<DesktopOs, readonly string[]> = {
  windows: ['msix', 'exe', 'zip'],
  macos: ['dmg', 'pkg', 'zip'],
  linux: ['appimage', 'deb', 'rpm', 'tar_gz'],
};

/** Match ranking used to sort builds the host OS can run. */
const MATCH_RANK: Record<BuildMatch, number> = {
  exact: 5,
  universal: 4,
  emulated: 3,
  unknown: 2,
  incompatible: 1,
};

/** Package format codes shown with their published spelling. */
const FORMAT_LABELS: Record<string, string> = {
  msix: 'MSIX',
  exe: 'EXE',
  zip: 'ZIP',
  dmg: 'DMG',
  pkg: 'PKG',
  appimage: 'AppImage',
  deb: 'DEB',
  rpm: 'RPM',
  tar_gz: 'TAR.GZ',
  'tar.gz': 'TAR.GZ',
};

/** Browser hint source accepted by {@link readUserAgentDataArchitecture}. */
export interface UserAgentDataLike {
  getHighEntropyValues?: (hints: readonly string[]) => Promise<{
    architecture?: string;
    bitness?: string;
  }>;
}

/**
 * Normalize a published architecture string onto the shared vocabulary.
 * Publishers write `x86_64`, `aarch64`, `x64`, or `universal` interchangeably;
 * the storefront compares and displays one canonical set.
 * @param raw - architecture string from a release artifact or an API payload.
 * @returns the normalized architecture, or null for an unknown or empty value.
 */
export function normalizeArchitecture(raw: string | null | undefined): CpuArchitecture | null {
  const value = raw?.trim().toLowerCase() ?? '';
  if (!value) {
    return null;
  }
  if (value === 'x64' || value === 'x86_64' || value === 'amd64' || value === 'x86-64') {
    return 'x64';
  }
  if (value === 'arm64' || value === 'aarch64' || value === 'armv8' || value === 'arm64e') {
    return 'arm64';
  }
  if (value === 'ia32' || value === 'x86' || value === 'i386' || value === 'i686') {
    return 'ia32';
  }
  if (value === 'universal' || value === 'universal2' || value === 'fat') {
    return 'universal';
  }
  return null;
}

/**
 * Map User-Agent Client Hints `architecture` / `bitness` values onto the shared
 * architecture vocabulary.
 * @param architecture - hint value: `x86`, `arm`, or empty.
 * @param bitness - hint value: `32`, `64`, or empty.
 * @returns the normalized architecture, or null when the hints do not resolve.
 */
export function normalizeUserAgentDataArchitecture(
  architecture: string | null | undefined,
  bitness: string | null | undefined,
): CpuArchitecture | null {
  const arch = architecture?.trim().toLowerCase() ?? '';
  const bits = bitness?.trim() ?? '';
  if (arch === 'x86') {
    return bits === '64' ? 'x64' : bits === '32' ? 'ia32' : null;
  }
  if (arch === 'arm') {
    return bits === '64' ? 'arm64' : null;
  }
  return null;
}

/**
 * Read the CPU architecture from the User-Agent Client Hints high-entropy
 * values. The call is optional by design: browsers without the API, insecure
 * contexts, and denied permission all resolve to null so the synchronous
 * heuristic keeps the decision.
 * @param userAgentData - hint source; defaults to `navigator.userAgentData`.
 * @returns the detected architecture, or null when unavailable.
 */
export async function readUserAgentDataArchitecture(
  userAgentData?: UserAgentDataLike | null,
): Promise<CpuArchitecture | null> {
  const source =
    userAgentData ??
    (typeof navigator === 'undefined'
      ? undefined
      : (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData);
  const read = source?.getHighEntropyValues;
  if (source === undefined || typeof read !== 'function') {
    return null;
  }
  try {
    const hints = await read.call(source, ['architecture', 'bitness']);
    return normalizeUserAgentDataArchitecture(hints?.architecture, hints?.bitness);
  } catch {
    // A rejected hint request is an unsupported hint, not an install failure.
    return null;
  }
}

/**
 * Detect the host CPU architecture from the classic user-agent signals.
 *
 * The synchronous result is intentionally conservative on macOS: Safari and
 * Chromium freeze the user agent to `Intel Mac OS X` on Apple silicon as well,
 * so a Mac reports null here and the caller refines it with Client Hints.
 * @param userAgent - user agent string; defaults to the runtime value.
 * @param platform - `navigator.platform` value; defaults to the runtime value.
 * @returns the detected architecture, or null when it cannot be determined.
 */
export function detectHostArchitecture(
  userAgent?: string,
  platform?: string,
): CpuArchitecture | null {
  const agent = userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const navPlatform = platform ?? (typeof navigator === 'undefined' ? '' : navigator.platform);
  const probe = `${agent} ${navPlatform}`;
  if (/\b(aarch64|arm64|armv8[a-z0-9]*|armv9[a-z0-9]*)\b/i.test(probe)) {
    return 'arm64';
  }
  if (/macintosh|mac os x|macintel/i.test(probe)) {
    return null;
  }
  if (/\b(x86_64|amd64|x64|win64|wow64)\b/i.test(probe)) {
    return 'x64';
  }
  if (/\b(i[3-6]86|ia32|x86|win32)\b/i.test(probe)) {
    return 'ia32';
  }
  return null;
}

/**
 * Detect the host desktop OS and CPU architecture for install-target matching.
 * @param userAgent - user agent string; defaults to the runtime value.
 * @param platform - `navigator.platform` value; defaults to the runtime value.
 * @returns the host platform; `os` is null on mobile browsers.
 */
export function detectHostPlatform(userAgent?: string, platform?: string): HostPlatform {
  return {
    os: detectDesktopOs(userAgent),
    arch: detectHostArchitecture(userAgent, platform),
  };
}

/**
 * Display label of a package format code.
 * @param raw - format code such as `msi`, `dmg`, or `appimage`.
 * @returns the published spelling, an uppercased unknown code, or an empty string.
 */
export function formatPackageFormat(raw: string | null | undefined): string {
  const value = raw?.trim().toLowerCase() ?? '';
  if (!value) {
    return '';
  }
  return FORMAT_LABELS[value] ?? value.toUpperCase();
}

/**
 * Human-readable installer size.
 * @param fileSizeBytes - byte count as a decimal string (the API int64 shape).
 * @returns a `MB`/`GB` label, or an em dash when the size is missing or invalid.
 */
export function formatInstallerSize(fileSizeBytes: string | null | undefined): string {
  const bytes = Number.parseInt(fileSizeBytes ?? '', 10);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '—';
  }
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1024 ? `${(megabytes / 1024).toFixed(1)} GB` : `${megabytes.toFixed(1)} MB`;
}

/** Normalize an artifact platform code onto the desktop vocabulary. */
function normalizeDesktopPlatform(raw: string | null | undefined): DesktopOs | null {
  const value = raw?.trim().toLowerCase() ?? '';
  return value === 'windows' || value === 'macos' || value === 'linux' ? value : null;
}

/**
 * How a build's architecture relates to the host CPU on this host OS.
 * @param host - host platform (the OS is required for compatibility-layer decisions).
 * @param platform - operating system the build targets.
 * @param architecture - normalized build architecture, or null when unpublished.
 * @returns the match kind; `unknown` when the CPU cannot be compared, and
 *   `incompatible` for a build of another operating system.
 */
export function resolveBuildMatch(
  host: HostPlatform,
  platform: DesktopOs,
  architecture: CpuArchitecture | null,
): BuildMatch {
  if (architecture === null || host.arch === null) {
    return 'unknown';
  }
  if (architecture === 'universal') {
    return 'universal';
  }
  if (architecture === host.arch) {
    return 'exact';
  }
  // macOS runs Intel builds on Apple silicon through Rosetta 2, and Windows on
  // ARM runs x64 builds through its own emulation layer. Both layers only exist
  // inside their own operating system, so another OS never becomes "emulated".
  const emulated =
    platform === host.os &&
    ((host.arch === 'arm64' &&
      architecture === 'x64' &&
      (platform === 'macos' || platform === 'windows')) ||
      (host.arch === 'x64' && architecture === 'ia32' && platform === 'windows'));
  return emulated ? 'emulated' : 'incompatible';
}

/** What selecting one build does on the browsing host. */
export type InstallVariantAction = 'install' | 'download';

/**
 * Decide whether a build installs on this device or is only a file download.
 *
 * A build for another operating system, or one whose CPU the host cannot run,
 * is a download: there is nothing to install here, and recording it as an
 * install would put a foreign build into this machine's library. A build whose
 * compatibility could not be determined (unknown host or build architecture)
 * stays installable — refusing it would block the common case where the
 * browser hides the CPU.
 * @param host - host platform detected for the storefront.
 * @param variant - build selected from the plan or the builds menu.
 * @returns `install` for a build this device can install, else `download`.
 */
export function resolveInstallVariantAction(
  host: HostPlatform,
  variant: InstallVariant,
): InstallVariantAction {
  if (host.os === null || variant.platform !== host.os) {
    return 'download';
  }
  return variant.match === 'incompatible' ? 'download' : 'install';
}

/** Rank of an architecture within its platform's fallback preference order. */
function archPreferenceRank(platform: DesktopOs, architecture: CpuArchitecture): number {
  const order = ARCH_PREFERENCE[platform];
  const index = order.indexOf(architecture);
  return index === -1 ? order.length : index;
}

/** Rank of a package format within its platform's conventional preference order. */
function formatPreferenceRank(platform: DesktopOs, packageFormat: string): number {
  const order = FORMAT_PREFERENCE[platform];
  const index = order.indexOf(packageFormat);
  return index === -1 ? order.length : index;
}

/**
 * Build every installable variant of a listing without host-specific ordering.
 *
 * Variants come from the verified release artifacts; a desktop platform the
 * listing declares but publishes no artifact for still yields a
 * listing-level variant so the install record and platform choice stay
 * available while the publisher finishes the upload.
 * @param app - listing item (platform codes and release artifacts).
 * @returns variants in canonical platform order, artifacts before placeholders.
 */
export function availableInstallVariants(
  app: Pick<AppItem, 'platforms' | 'artifacts'>,
): InstallVariant[] {
  const variants: InstallVariant[] = [];
  for (const artifact of app.artifacts ?? []) {
    const platform = normalizeDesktopPlatform(artifact.platform);
    if (platform === null) {
      continue;
    }
    const architecture = normalizeArchitecture(artifact.architecture);
    const packageFormat = artifact.packageFormat?.trim().toLowerCase() ?? '';
    variants.push({
      key: `${platform}:${architecture ?? 'any'}:${packageFormat || 'file'}:${artifact.id}`,
      platform,
      architecture,
      rawArchitecture: artifact.architecture?.trim() || null,
      packageFormat,
      packageFormatLabel: formatPackageFormat(packageFormat),
      fileSizeBytes: artifact.fileSizeBytes ?? null,
      artifactId: artifact.id || null,
      match: 'unknown',
    });
  }
  for (const platform of desktopInstallCodes(app.platforms, null)) {
    if (variants.some((variant) => variant.platform === platform)) {
      continue;
    }
    variants.push({
      key: `listing:${platform}`,
      platform,
      architecture: null,
      rawArchitecture: null,
      packageFormat: '',
      packageFormatLabel: '',
      fileSizeBytes: null,
      artifactId: null,
      match: 'unknown',
    });
  }
  return variants.sort(
    (left, right) => DESKTOP_ORDER.indexOf(left.platform) - DESKTOP_ORDER.indexOf(right.platform),
  );
}

/**
 * Resolve the install plan for the browsing host.
 * @param app - listing item (platform codes and release artifacts).
 * @param host - host platform; detected from the runtime user agent when omitted.
 * @returns the ordered variants (host OS first, then canonical platform order,
 *   best CPU match first), the recommended build, and the CTA status.
 */
export function resolveInstallPlan(
  app: Pick<AppItem, 'platforms' | 'artifacts'>,
  host?: HostPlatform,
): InstallPlan {
  const resolvedHost = host ?? detectHostPlatform();
  const variants = availableInstallVariants(app).map((variant) => ({
    ...variant,
    // CPU compatibility is a property of running this build on this host OS.
    // Another platform's build is a download by definition, and labelling it
    // incompatible would put a "may not run here" warning on every foreign row.
    match:
      variant.platform === resolvedHost.os
        ? resolveBuildMatch(resolvedHost, variant.platform, variant.architecture)
        : ('unknown' as const),
  }));

  const ranked = [...variants].sort((left, right) => {
    const hostDelta =
      Number(right.platform === resolvedHost.os) - Number(left.platform === resolvedHost.os);
    if (hostDelta !== 0) {
      return hostDelta;
    }
    // Host builds lead; the remaining platforms follow the canonical display
    // order so a listing never reorders Linux above macOS by CPU-match accident.
    const platformDelta =
      DESKTOP_ORDER.indexOf(left.platform) - DESKTOP_ORDER.indexOf(right.platform);
    if (platformDelta !== 0) {
      return platformDelta;
    }
    const matchDelta = MATCH_RANK[right.match] - MATCH_RANK[left.match];
    if (matchDelta !== 0) {
      return matchDelta;
    }
    const leftArchRank = left.architecture
      ? archPreferenceRank(left.platform, left.architecture)
      : ARCH_PREFERENCE[left.platform].length;
    const rightArchRank = right.architecture
      ? archPreferenceRank(right.platform, right.architecture)
      : ARCH_PREFERENCE[right.platform].length;
    if (leftArchRank !== rightArchRank) {
      return leftArchRank - rightArchRank;
    }
    return (
      formatPreferenceRank(left.platform, left.packageFormat) -
      formatPreferenceRank(right.platform, right.packageFormat)
    );
  });

  const hostOsSupported =
    resolvedHost.os !== null && ranked.some((variant) => variant.platform === resolvedHost.os);
  const recommended = hostOsSupported
    ? ranked.find((variant) => variant.platform === resolvedHost.os) ?? null
    : null;
  const status: InstallPlanStatus =
    ranked.length === 0 ? 'no-desktop-build' : recommended === null ? 'choose-platform' : 'ready';

  return {
    host: resolvedHost,
    variants: ranked,
    recommended,
    hostOsSupported,
    status,
  };
}

/**
 * Pick the variant a click installs: the explicit menu selection when it still
 * resolves, otherwise the host recommendation.
 * @param plan - resolved install plan.
 * @param selection - build picked from the builds menu, when the user picked one.
 * @returns the variant to install, or null when no build can be installed.
 */
export function selectInstallVariant(
  plan: InstallPlan,
  selection?: InstallSelection | null,
): InstallVariant | null {
  if (!selection) {
    return plan.recommended;
  }
  const matchesPlatform = plan.variants.filter(
    (variant) => variant.platform === selection.platform,
  );
  const chosen =
    matchesPlatform.find((variant) => {
      if (selection.artifactId && variant.artifactId !== selection.artifactId) {
        return false;
      }
      if (selection.architecture != null && variant.architecture !== selection.architecture) {
        return false;
      }
      return true;
    }) ??
    matchesPlatform.find((variant) => variant.architecture === 'universal') ??
    matchesPlatform[0];
  return chosen ?? plan.recommended;
}

/**
 * Convert a resolved variant into the selection the install flow consumes.
 * @param variant - variant chosen by the recommendation or the builds menu.
 * @returns the selection with only the fields the variant actually pinned.
 */
export function installSelectionOf(variant: InstallVariant): InstallSelection {
  return {
    platform: variant.platform,
    ...(variant.architecture === null ? {} : { architecture: variant.architecture }),
    ...(variant.artifactId === null ? {} : { artifactId: variant.artifactId }),
  };
}
