import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  detectDesktopOs,
  desktopInstallCodes,
  openDistributionUrl,
  primaryDistributionAction,
  resolveDistributionActions,
} from './distribution.ts';

const WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const MACOS_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const LINUX_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';

describe('detectDesktopOs', () => {
  it('detects the three desktop systems', () => {
    expect(detectDesktopOs(WINDOWS_UA)).toBe('windows');
    expect(detectDesktopOs(MACOS_UA)).toBe('macos');
    expect(detectDesktopOs(LINUX_UA)).toBe('linux');
  });

  it('returns null for mobile agents and empty input', () => {
    expect(detectDesktopOs(ANDROID_UA)).toBeNull();
    expect(detectDesktopOs('')).toBeNull();
  });
});

describe('desktopInstallCodes', () => {
  it('orders the detected OS first', () => {
    expect(desktopInstallCodes(['macos', 'windows', 'linux'], 'macos')).toEqual([
      'macos',
      'windows',
      'linux',
    ]);
  });

  it('keeps canonical order when nothing is detected', () => {
    expect(desktopInstallCodes(['linux', 'windows'], null)).toEqual(['windows', 'linux']);
    expect(desktopInstallCodes(['linux', 'windows'], 'macos')).toEqual(['windows', 'linux']);
  });

  it('ignores non-desktop codes', () => {
    expect(desktopInstallCodes(['android', 'ios', 'web'], 'windows')).toEqual([]);
  });
});

describe('resolveDistributionActions', () => {
  it('resolves web groups as open actions carrying the access URL', () => {
    const actions = resolveDistributionActions(
      { id: 'a', platforms: ['web', 'h5'], accessUrl: 'https://store.example/app' },
      'windows',
    );
    expect(actions).toEqual([
      { group: 'pcWeb', kind: 'open', platformCodes: [], url: 'https://store.example/app' },
      { group: 'h5Web', kind: 'open', platformCodes: [], url: 'https://store.example/app' },
    ]);
  });

  it('resolves the desktop group as an install action ordered for the detected OS', () => {
    const actions = resolveDistributionActions(
      { id: 'a', platforms: ['macos', 'windows'] },
      'macos',
    );
    expect(actions).toEqual([
      { group: 'pcDesktop', kind: 'install', platformCodes: ['macos', 'windows'] },
    ]);
  });

  it('falls back to the listing anchor for QR groups without an access URL', () => {
    const actions = resolveDistributionActions({ id: 'app-9', platforms: ['android'] }, null);
    expect(actions).toHaveLength(1);
    expect(actions[0].kind).toBe('qr');
    expect(actions[0].url).toContain('/app/app-9');
  });

  it('uses the access URL as the QR scan target when present', () => {
    const actions = resolveDistributionActions(
      { id: 'a', platforms: ['miniprogram-wechat'], accessUrl: 'https://mp.example' },
      null,
    );
    expect(actions[0]).toMatchObject({ group: 'miniprogram', kind: 'qr', url: 'https://mp.example' });
  });

  it('returns no actions for platform-less listings', () => {
    expect(resolveDistributionActions({ id: 'a', platforms: [] }, 'windows')).toEqual([]);
  });
});

describe('primaryDistributionAction', () => {
  it('prefers open over install and qr', () => {
    const primary = primaryDistributionAction({
      id: 'a',
      platforms: ['web', 'windows', 'android'],
      accessUrl: 'https://a.example',
    });
    expect(primary?.kind).toBe('open');
  });

  it('prefers install over qr', () => {
    const primary = primaryDistributionAction({ id: 'a', platforms: ['windows', 'ios'] });
    expect(primary?.kind).toBe('install');
    expect(primary?.group).toBe('pcDesktop');
  });

  it('falls back to qr for mobile-only listings', () => {
    const primary = primaryDistributionAction({ id: 'a', platforms: ['harmonyos'] });
    expect(primary?.kind).toBe('qr');
  });
});

describe('openDistributionUrl', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens the target in a new noopener window', () => {
    const open = vi.fn(() => ({}));
    vi.stubGlobal('window', { open });
    expect(openDistributionUrl(' https://store.example/app ')).toBe(true);
    expect(open).toHaveBeenCalledWith('https://store.example/app', '_blank', 'noopener,noreferrer');
  });

  it('is a no-op without a target or a blocked window', () => {
    const open = vi.fn(() => null);
    vi.stubGlobal('window', { open });
    expect(openDistributionUrl(undefined)).toBe(false);
    expect(openDistributionUrl('   ')).toBe(false);
    expect(openDistributionUrl('https://store.example/app')).toBe(false);
    expect(open).toHaveBeenCalledTimes(1);
  });
});
