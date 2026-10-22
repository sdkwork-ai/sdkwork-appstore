export const install = {
  modal: {
    title: 'Install App to PC Client',
    subtitle: 'Configure installation path and desktop shortcuts',
    targetPath: 'Target Installation Directory',
    browse: 'Browse...',
    createDesktopShortcut: 'Create Desktop Shortcut',
    createStartMenuShortcut: 'Add to Start Menu',
    autoStart: 'Launch at System Startup',
    confirmInstall: 'Start Installation',
    installing: 'Writing package files to disk...',
    completed: 'Application Installed Successfully!',
    launchNow: 'Launch App Now',
    runningNotice: 'App "{{name}}" is running in the local desktop sandbox...',
    installFailed: 'Installation failed, please try again later',
    platformNote: 'Detected on this system — installing {{platform}}',
    platformNoteGeneric: 'Installing {{platform}}',
    compatibilityNote: 'This build runs in compatibility mode on your device',
    qrTitle: 'Scan to Get',
    qrScanHint: 'Scan the QR code with your phone or the matching client to continue',
    artifactNote: 'Installer {{format}} · {{size}}',
    downloadStarted: 'Installer download started; follow the installer to finish setup'
  },
  download: {
    started: 'Download started — {{platform}}',
    pending: 'This installer is not published yet',
    unavailable: 'The download link is not available yet. Please try again later.',
    failed: 'Download failed. Please try again later.'
  }
};
