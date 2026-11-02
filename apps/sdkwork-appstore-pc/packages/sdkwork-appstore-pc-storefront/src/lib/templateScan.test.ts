import { describe, expect, it } from 'vitest';

import { resolveTemplateAppType } from '@sdkwork/appstore-pc-core';

import {
  isHttpUrl,
  resolveTemplateScanTarget,
  type TemplateScanApp,
} from './templateScan';

function appTypeOf(platform: string) {
  const appType = resolveTemplateAppType(platform);
  if (appType === undefined) throw new Error(`unknown test platform ${platform}`);
  return appType;
}

const miniProgramApp: TemplateScanApp = {
  id: 'app-mp',
  platforms: ['miniprogram-wechat'],
  accessUrl: 'https://apps.example.com/mp',
  platformLinks: { 'miniprogram-wechat': 'https://apps.example.com/mp/scan' },
};

describe('resolveTemplateScanTarget', () => {
  it('prefers the template author\'s live demo address', () => {
    const target = resolveTemplateScanTarget(
      { demoUrl: ' https://demo.example.com/h5 ' },
      appTypeOf('H5'),
      miniProgramApp,
    );

    expect(target).toEqual({ url: 'https://demo.example.com/h5', source: 'demo' });
  });

  it('uses the related app\'s distribution link for the template platform group', () => {
    const target = resolveTemplateScanTarget({}, appTypeOf('MINIPROGRAM'), miniProgramApp);

    expect(target).toEqual({ url: 'https://apps.example.com/mp/scan', source: 'distribution' });
  });

  it('falls back to another QR distribution when the preferred group is absent', () => {
    const androidApp: TemplateScanApp = {
      id: 'app-android',
      platforms: ['android'],
      accessUrl: 'https://apps.example.com/android',
      platformLinks: { android: 'https://apps.example.com/android/scan' },
    };

    const target = resolveTemplateScanTarget({}, appTypeOf('MINIPROGRAM'), androidApp);

    expect(target).toEqual({ url: 'https://apps.example.com/android/scan', source: 'distribution' });
  });

  it('falls back to the app access URL when no distribution link exists', () => {
    const bareApp: TemplateScanApp = {
      id: 'app-bare',
      accessUrl: 'https://apps.example.com/bare',
    };

    const target = resolveTemplateScanTarget({}, appTypeOf('ANDROID'), bareApp);

    expect(target).toEqual({ url: 'https://apps.example.com/bare', source: 'app' });
  });

  it('returns nothing when neither a demo nor an associated app exists', () => {
    expect(resolveTemplateScanTarget({}, appTypeOf('H5'), null)).toBeUndefined();
    expect(resolveTemplateScanTarget({}, appTypeOf('H5'), undefined)).toBeUndefined();
  });

  it('never offers a phone scan for desktop or engine app forms', () => {
    expect(
      resolveTemplateScanTarget({ demoUrl: 'https://demo.example.com/pc' }, appTypeOf('PC'), miniProgramApp),
    ).toBeUndefined();
    expect(resolveTemplateScanTarget({}, appTypeOf('UNITY'), miniProgramApp)).toBeUndefined();
  });

  it('never offers a phone scan for a platform code this build cannot classify', () => {
    expect(
      resolveTemplateScanTarget({ demoUrl: 'https://demo.example.com/x' }, undefined, miniProgramApp),
    ).toBeUndefined();
  });
});

describe('isHttpUrl', () => {
  it('accepts absolute web addresses only', () => {
    expect(isHttpUrl('https://apps.example.com/mp')).toBe(true);
    expect(isHttpUrl('HTTP://apps.example.com/mp')).toBe(true);
    expect(isHttpUrl('  https://apps.example.com/mp  ')).toBe(true);
  });

  it('rejects script and data schemes', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isHttpUrl('/templates/tpl-1')).toBe(false);
    expect(isHttpUrl('')).toBe(false);
  });
});
