import type { SdkworkAuthAppearanceConfig } from '@sdkwork/auth-pc-react';

export function resolveAppstoreAuthAppearance(): SdkworkAuthAppearanceConfig {
  return {
    asidePanelClassName: 'sdkwork-appstore-auth-aside-panel',
    bodyClassName: 'sdkwork-appstore-auth-body',
    contentContainerClassName: 'sdkwork-appstore-auth-content',
    pageClassName: 'sdkwork-appstore-auth-page',
    qrFrameClassName: 'sdkwork-appstore-auth-qr-frame',
    shellClassName: 'sdkwork-appstore-auth-card-shell',
    slotProps: {
      background: {
        className: 'sdkwork-appstore-auth-background',
      },
      page: {
        className: 'sdkwork-appstore-auth-page',
      },
      shell: {
        className: 'sdkwork-appstore-auth-card-shell',
      },
    },
    theme: {
      asideCardBackgroundColor: 'var(--sdkwork-appstore-auth-aside-card-bg)',
      asideCardBorderColor: 'var(--sdkwork-appstore-auth-aside-card-border)',
      asidePanelBackgroundColor: 'var(--sdkwork-appstore-auth-aside-bg)',
      asidePanelBorderColor: 'var(--sdkwork-appstore-auth-aside-border)',
      asidePanelColor: 'var(--sdkwork-appstore-auth-aside-text)',
      badgeBackgroundColor: 'var(--sdkwork-appstore-auth-aside-badge-bg)',
      badgeTextColor: 'var(--sdkwork-appstore-auth-aside-badge-text)',
      contentBackgroundColor: 'var(--sdkwork-appstore-auth-content-bg)',
      contentBorderColor: 'transparent',
      contentTextColor: 'var(--sdkwork-appstore-auth-content-text)',
      descriptionColor: 'var(--sdkwork-appstore-auth-muted-text)',
      dividerColor: 'var(--sdkwork-appstore-auth-divider)',
      fieldBackgroundColor: 'var(--sdkwork-appstore-auth-field-bg)',
      fieldBorderColor: 'transparent',
      fieldPlaceholderColor: '#9ca3af',
      fieldTextColor: 'var(--sdkwork-appstore-auth-content-text)',
      formMutedTextColor: 'var(--sdkwork-appstore-auth-muted-text)',
      iconMutedColor: 'var(--sdkwork-appstore-auth-muted-text)',
      labelColor: 'var(--sdkwork-appstore-auth-content-text)',
      pageBackgroundColor: 'var(--sdkwork-appstore-auth-bg)',
      qrFrameBackgroundColor: 'var(--sdkwork-appstore-auth-qr-bg)',
      qrFrameBorderColor: 'transparent',
      shellBackgroundColor: 'var(--sdkwork-appstore-auth-content-bg)',
      shellBorderColor: 'transparent',
      tabActiveBackgroundColor: 'transparent',
      tabActiveTextColor: 'var(--sdkwork-appstore-auth-content-text)',
      tabBackgroundColor: 'transparent',
      tabInactiveTextColor: 'var(--sdkwork-appstore-auth-muted-text)',
      titleColor: 'var(--sdkwork-appstore-auth-content-text)',
    },
  };
}
