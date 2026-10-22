import { describe, expect, it } from 'vitest';

import {
  availableInstallVariants,
  detectHostArchitecture,
  detectHostPlatform,
  formatInstallerSize,
  formatPackageFormat,
  installSelectionOf,
  normalizeArchitecture,
  normalizeUserAgentDataArchitecture,
  resolveBuildMatch,
  resolveInstallPlan,
  resolveInstallVariantAction,
  selectInstallVariant,
  type HostPlatform,
  type InstallPlan,
} from './installTarget.ts';

const WINDOWS_X64_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const WINDOWS_ARM_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; arm64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const MACOS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const LINUX_X64_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const LINUX_ARM_UA =
  'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const LINUX_32_UA =
  'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

const WINDOWS_X64: HostPlatform = { os: 'windows', arch: 'x64' };
const WINDOWS_ARM: HostPlatform = { os: 'windows', arch: 'arm64' };
const MACOS_ARM: HostPlatform = { os: 'macos', arch: 'arm64' };
const MACOS_UNKNOWN_ARCH: HostPlatform = { os: 'macos', arch: null };
const LINUX_ARM: HostPlatform = { os: 'linux', arch: 'arm64' };
const MOBILE: HostPlatform = { os: null, arch: null };

/** One release artifact shaped like the catalog projection. */
function artifact(
  id: string,
  platform: string,
  architecture: string,
  packageFormat: string,
  fileSizeBytes?: string,
) {
  return {
    id,
    platform,
    architecture,
    packageFormat,
    ...(fileSizeBytes === undefined ? {} : { fileSizeBytes }),
  };
}

describe('normalizeArchitecture', () => {
  it('maps the published spellings onto one vocabulary', () => {
    expect(normalizeArchitecture('x86_64')).toBe('x64');
    expect(normalizeArchitecture('AMD64')).toBe('x64');
    expect(normalizeArchitecture('x64')).toBe('x64');
    expect(normalizeArchitecture('aarch64')).toBe('arm64');
    expect(normalizeArchitecture('ARM64')).toBe('arm64');
    expect(normalizeArchitecture('universal2')).toBe('universal');
    expect(normalizeArchitecture('i686')).toBe('ia32');
  });

  it('returns null for empty and unknown values', () => {
    expect(normalizeArchitecture('')).toBeNull();
    expect(normalizeArchitecture(undefined)).toBeNull();
    expect(normalizeArchitecture('mips')).toBeNull();
  });
});

describe('normalizeUserAgentDataArchitecture', () => {
  it('combines the architecture hint with the bitness hint', () => {
    expect(normalizeUserAgentDataArchitecture('x86', '64')).toBe('x64');
    expect(normalizeUserAgentDataArchitecture('x86', '32')).toBe('ia32');
    expect(normalizeUserAgentDataArchitecture('arm', '64')).toBe('arm64');
  });

  it('returns null when the hints are incomplete', () => {
    expect(normalizeUserAgentDataArchitecture('arm', '32')).toBeNull();
    expect(normalizeUserAgentDataArchitecture('x86', '')).toBeNull();
    expect(normalizeUserAgentDataArchitecture(undefined, '64')).toBeNull();
  });
});

describe('detectHostArchitecture', () => {
  it('reads the classic x86 and ARM signals', () => {
    expect(detectHostArchitecture(WINDOWS_X64_UA, 'Win32')).toBe('x64');
    expect(detectHostArchitecture(WINDOWS_ARM_UA, 'Win32')).toBe('arm64');
    expect(detectHostArchitecture(LINUX_X64_UA, 'Linux x86_64')).toBe('x64');
    expect(detectHostArchitecture(LINUX_ARM_UA, 'Linux aarch64')).toBe('arm64');
    expect(detectHostArchitecture(LINUX_32_UA, 'Linux i686')).toBe('ia32');
  });

  it('does not read a frozen macOS user agent as Intel', () => {
    expect(detectHostArchitecture(MACOS_UA, 'MacIntel')).toBeNull();
  });

  it('reads the CPU from a mobile agent but not from empty input', () => {
    expect(detectHostArchitecture(ANDROID_UA, 'Linux armv8l')).toBe('arm64');
    expect(detectHostArchitecture('', '')).toBeNull();
  });
});

describe('detectHostPlatform', () => {
  it('pairs the desktop OS with the CPU architecture', () => {
    expect(detectHostPlatform(WINDOWS_X64_UA, 'Win32')).toEqual({
      os: 'windows',
      arch: 'x64',
    });
    expect(detectHostPlatform(MACOS_UA, 'MacIntel')).toEqual({ os: 'macos', arch: null });
    expect(detectHostPlatform(LINUX_ARM_UA, 'Linux aarch64')).toEqual({
      os: 'linux',
      arch: 'arm64',
    });
  });

  it('reports no OS on a mobile browser', () => {
    expect(detectHostPlatform(ANDROID_UA, 'Linux armv8l')).toEqual({ os: null, arch: 'arm64' });
  });
});

describe('formatPackageFormat', () => {
  it('renders the published format spelling', () => {
    expect(formatPackageFormat('msi')).toBe('MSI');
    expect(formatPackageFormat('appimage')).toBe('AppImage');
    expect(formatPackageFormat('tar_gz')).toBe('TAR.GZ');
    expect(formatPackageFormat('')).toBe('');
    expect(formatPackageFormat('custom')).toBe('CUSTOM');
  });
});

describe('formatInstallerSize', () => {
  it('renders MB below one gigabyte and GB above it', () => {
    expect(formatInstallerSize('52428800')).toBe('50.0 MB');
    expect(formatInstallerSize(String(2.5 * 1024 * 1024 * 1024))).toBe('2.5 GB');
  });

  it('renders an em dash for missing sizes', () => {
    expect(formatInstallerSize(undefined)).toBe('—');
    expect(formatInstallerSize('not-a-size')).toBe('—');
    expect(formatInstallerSize('0')).toBe('—');
  });
});

describe('resolveBuildMatch', () => {
  it('recognizes native, universal, emulated, and unknown builds', () => {
    expect(resolveBuildMatch(WINDOWS_X64, 'windows', 'x64')).toBe('exact');
    expect(resolveBuildMatch(WINDOWS_X64, 'windows', 'universal')).toBe('universal');
    expect(resolveBuildMatch(MACOS_ARM, 'macos', 'x64')).toBe('emulated');
    expect(resolveBuildMatch(WINDOWS_ARM, 'windows', 'x64')).toBe('emulated');
    expect(resolveBuildMatch(WINDOWS_X64, 'windows', 'ia32')).toBe('emulated');
    expect(resolveBuildMatch(MACOS_UNKNOWN_ARCH, 'macos', 'x64')).toBe('unknown');
    expect(resolveBuildMatch(WINDOWS_X64, 'windows', null)).toBe('unknown');
  });

  it('does not claim an emulation layer that the platform lacks', () => {
    expect(resolveBuildMatch(LINUX_ARM, 'linux', 'x64')).toBe('incompatible');
    expect(resolveBuildMatch(MACOS_ARM, 'macos', 'ia32')).toBe('incompatible');
    expect(resolveBuildMatch(WINDOWS_ARM, 'windows', 'ia32')).toBe('incompatible');
    expect(resolveBuildMatch(WINDOWS_X64, 'windows', 'arm64')).toBe('incompatible');
    // Rosetta and Windows' x64 emulation only exist inside their own OS.
    expect(resolveBuildMatch(MACOS_ARM, 'windows', 'x64')).toBe('incompatible');
    expect(resolveBuildMatch(WINDOWS_X64, 'macos', 'ia32')).toBe('incompatible');
  });
});

describe('availableInstallVariants', () => {
  it('normalizes artifact metadata and keeps canonical platform order', () => {
    const variants = availableInstallVariants({
      platforms: ['macos', 'windows'],
      artifacts: [
        artifact('a-mac', 'macos', 'aarch64', 'dmg', '104857600'),
        artifact('a-win', 'windows', 'x86_64', 'msi', '52428800'),
      ],
    });

    expect(variants.map((variant) => variant.platform)).toEqual(['windows', 'macos']);
    expect(variants[0]).toMatchObject({
      key: 'windows:x64:msi:a-win',
      architecture: 'x64',
      rawArchitecture: 'x86_64',
      packageFormatLabel: 'MSI',
      fileSizeBytes: '52428800',
      artifactId: 'a-win',
    });
    expect(variants[1]).toMatchObject({ architecture: 'arm64', packageFormatLabel: 'DMG' });
  });

  it('keeps a listing-level variant for a declared platform without artifacts', () => {
    const variants = availableInstallVariants({
      platforms: ['windows', 'linux'],
      artifacts: [artifact('a-win', 'windows', 'x64', 'exe')],
    });

    expect(variants).toHaveLength(2);
    expect(variants[1]).toMatchObject({
      platform: 'linux',
      architecture: null,
      artifactId: null,
      packageFormat: '',
      key: 'listing:linux',
    });
  });

  it('ignores non-desktop artifact platforms', () => {
    const variants = availableInstallVariants({
      platforms: ['android'],
      artifacts: [artifact('a-apk', 'android', 'arm64', 'apk')],
    });
    expect(variants).toEqual([]);
  });
});

describe('resolveInstallPlan', () => {
  it('recommends the native build for the browsing host', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['windows'],
        artifacts: [
          artifact('a-win-arm', 'windows', 'arm64', 'msi'),
          artifact('a-win-x64', 'windows', 'x86_64', 'msi', '52428800'),
        ],
      },
      WINDOWS_X64,
    );

    expect(plan.status).toBe('ready');
    expect(plan.hostOsSupported).toBe(true);
    expect(plan.recommended?.artifactId).toBe('a-win-x64');
    expect(plan.recommended?.match).toBe('exact');
    expect(plan.variants[0].artifactId).toBe('a-win-x64');
  });

  it('puts the host OS first and ranks exact over universal and emulated', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['windows', 'macos'],
        artifacts: [
          artifact('a-win', 'windows', 'x64', 'msi'),
          artifact('a-mac-uni', 'macos', 'universal', 'dmg'),
          artifact('a-mac-x64', 'macos', 'x86_64', 'dmg'),
          artifact('a-mac-arm', 'macos', 'aarch64', 'dmg'),
        ],
      },
      MACOS_ARM,
    );

    expect(plan.variants.map((variant) => variant.artifactId)).toEqual([
      'a-mac-arm',
      'a-mac-uni',
      'a-mac-x64',
      'a-win',
    ]);
    expect(plan.recommended?.artifactId).toBe('a-mac-arm');
  });

  it('treats another platform as a download target, not a CPU mismatch', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['windows', 'macos'],
        artifacts: [
          artifact('a-win', 'windows', 'x64', 'msi'),
          artifact('a-mac', 'macos', 'arm64', 'dmg'),
        ],
      },
      WINDOWS_X64,
    );

    expect(plan.variants.find((variant) => variant.platform === 'macos')?.match).toBe('unknown');
  });

  it('prefers a Rosetta-compatible build when the Mac CPU is unknown', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['macos'],
        artifacts: [
          artifact('a-mac-arm', 'macos', 'arm64', 'dmg'),
          artifact('a-mac-x64', 'macos', 'x64', 'dmg'),
        ],
      },
      MACOS_UNKNOWN_ARCH,
    );

    expect(plan.recommended?.artifactId).toBe('a-mac-x64');
    expect(plan.recommended?.match).toBe('unknown');
  });

  it('still offers an incompatible build when it is the only one for the OS', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['linux'],
        artifacts: [artifact('a-linux-x64', 'linux', 'x86_64', 'appimage')],
      },
      LINUX_ARM,
    );

    expect(plan.status).toBe('ready');
    expect(plan.recommended?.artifactId).toBe('a-linux-x64');
    expect(plan.recommended?.match).toBe('incompatible');
  });

  it('asks for a platform when the host OS has no build', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['windows'],
        artifacts: [artifact('a-win', 'windows', 'x64', 'msi')],
      },
      { os: 'macos', arch: 'arm64' },
    );

    expect(plan.status).toBe('choose-platform');
    expect(plan.hostOsSupported).toBe(false);
    expect(plan.recommended).toBeNull();
    expect(plan.variants).toHaveLength(1);
  });

  it('asks for a platform on a mobile browser', () => {
    const plan = resolveInstallPlan({ platforms: ['windows'] }, MOBILE);
    expect(plan.status).toBe('choose-platform');
    expect(plan.recommended).toBeNull();
  });

  it('reports no desktop build for mobile-only and empty listings', () => {
    expect(resolveInstallPlan({ platforms: ['android', 'ios'] }, WINDOWS_X64).status).toBe(
      'no-desktop-build',
    );
    expect(resolveInstallPlan({}, WINDOWS_X64).status).toBe('no-desktop-build');
  });

  it('falls back to listing-level variants when no release artifacts exist', () => {
    const plan = resolveInstallPlan({ platforms: ['windows', 'linux'] }, WINDOWS_X64);

    expect(plan.status).toBe('ready');
    expect(plan.recommended).toMatchObject({
      platform: 'windows',
      artifactId: null,
      architecture: null,
      packageFormat: '',
    });
  });

  it('keeps the canonical platform order after the host OS', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['linux', 'macos', 'windows'],
        artifacts: [
          artifact('a-linux', 'linux', 'x64', 'appimage'),
          artifact('a-mac', 'macos', 'arm64', 'dmg'),
          artifact('a-win', 'windows', 'x64', 'msi'),
        ],
      },
      WINDOWS_X64,
    );

    expect(plan.variants.map((variant) => variant.platform)).toEqual([
      'windows',
      'macos',
      'linux',
    ]);
  });

  it('prefers the conventional package format within one architecture', () => {
    const plan = resolveInstallPlan(
      {
        platforms: ['linux'],
        artifacts: [
          artifact('a-rpm', 'linux', 'x64', 'rpm'),
          artifact('a-appimage', 'linux', 'x64', 'appimage'),
          artifact('a-deb', 'linux', 'x64', 'deb'),
        ],
      },
      { os: 'linux', arch: 'x64' },
    );

    expect(plan.recommended?.artifactId).toBe('a-appimage');
  });
});

describe('resolveInstallVariantAction', () => {
  /** Resolve one named build of a fixture listing for the given host. */
  function variantFor(
    artifacts: ReturnType<typeof artifact>[],
    host: HostPlatform,
    artifactId: string,
  ) {
    const plan = resolveInstallPlan(
      { platforms: ['windows', 'macos', 'linux'], artifacts },
      host,
    );
    const variant = plan.variants.find((entry) => entry.artifactId === artifactId);
    if (!variant) {
      throw new Error(`missing fixture variant ${artifactId}`);
    }
    return variant;
  }

  const mixed = [
    artifact('a-win-x64', 'windows', 'x64', 'msi'),
    artifact('a-win-arm', 'windows', 'arm64', 'msi'),
    artifact('a-mac-arm', 'macos', 'arm64', 'dmg'),
    artifact('a-mac-x64', 'macos', 'x64', 'dmg'),
    artifact('a-linux-x64', 'linux', 'x64', 'appimage'),
  ];

  it('installs a host build and downloads a build for another OS', () => {
    expect(resolveInstallVariantAction(WINDOWS_X64, variantFor(mixed, WINDOWS_X64, 'a-win-x64'))).toBe(
      'install',
    );
    expect(resolveInstallVariantAction(WINDOWS_X64, variantFor(mixed, WINDOWS_X64, 'a-mac-arm'))).toBe(
      'download',
    );
    expect(resolveInstallVariantAction(WINDOWS_X64, variantFor(mixed, WINDOWS_X64, 'a-linux-x64'))).toBe(
      'download',
    );
  });

  it('installs an emulated build but only downloads an incompatible one', () => {
    expect(resolveInstallVariantAction(MACOS_ARM, variantFor(mixed, MACOS_ARM, 'a-mac-x64'))).toBe(
      'install',
    );
    expect(resolveInstallVariantAction(WINDOWS_X64, variantFor(mixed, WINDOWS_X64, 'a-win-arm'))).toBe(
      'download',
    );
    expect(
      resolveInstallVariantAction(LINUX_ARM, variantFor(mixed, LINUX_ARM, 'a-linux-x64')),
    ).toBe('download');
  });

  it('stays installable when the CPU cannot be compared', () => {
    expect(
      resolveInstallVariantAction(
        MACOS_UNKNOWN_ARCH,
        variantFor(mixed, MACOS_UNKNOWN_ARCH, 'a-mac-arm'),
      ),
    ).toBe('install');
  });

  it('downloads every build when the host is not a desktop browser', () => {
    expect(resolveInstallVariantAction(MOBILE, variantFor(mixed, MOBILE, 'a-win-x64'))).toBe(
      'download',
    );
  });
});

describe('selectInstallVariant', () => {
  const plan: InstallPlan = resolveInstallPlan(
    {
      platforms: ['windows', 'macos'],
      artifacts: [
        artifact('a-win-x64', 'windows', 'x64', 'msi'),
        artifact('a-win-arm', 'windows', 'arm64', 'msi'),
        artifact('a-mac-arm', 'macos', 'arm64', 'dmg'),
      ],
    },
    WINDOWS_X64,
  );

  it('returns the recommendation without an explicit selection', () => {
    expect(selectInstallVariant(plan)?.artifactId).toBe('a-win-x64');
    expect(selectInstallVariant(plan, null)?.artifactId).toBe('a-win-x64');
  });

  it('resolves a selected platform and architecture', () => {
    expect(
      selectInstallVariant(plan, { platform: 'macos', architecture: 'arm64' })?.artifactId,
    ).toBe('a-mac-arm');
    expect(
      selectInstallVariant(plan, { platform: 'windows', architecture: 'arm64' })?.artifactId,
    ).toBe('a-win-arm');
  });

  it('resolves a selected artifact id', () => {
    expect(selectInstallVariant(plan, { platform: 'windows', artifactId: 'a-win-arm' })?.artifactId).toBe(
      'a-win-arm',
    );
  });

  it('falls back to the platform, then to the recommendation', () => {
    expect(
      selectInstallVariant(plan, { platform: 'windows', architecture: 'ia32' })?.artifactId,
    ).toBe('a-win-x64');
    expect(selectInstallVariant(plan, { platform: 'linux' })?.artifactId).toBe('a-win-x64');
  });
});

describe('installSelectionOf', () => {
  it('keeps only the fields the variant pins', () => {
    const [variant] = availableInstallVariants({
      platforms: ['windows'],
      artifacts: [artifact('a-win', 'windows', 'x86_64', 'msi')],
    });
    expect(installSelectionOf(variant)).toEqual({
      platform: 'windows',
      architecture: 'x64',
      artifactId: 'a-win',
    });

    const [placeholder] = availableInstallVariants({ platforms: ['windows'] });
    expect(installSelectionOf(placeholder)).toEqual({ platform: 'windows' });
  });
});
