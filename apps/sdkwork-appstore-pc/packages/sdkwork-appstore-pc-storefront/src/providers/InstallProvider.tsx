import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppstoreInstallContext, useInstall } from '@sdkwork/appstore-pc-commons';
import {
  desktopInstallCodes,
  detectDesktopOs,
  openDistributionUrl,
  primaryDistributionAction,
  type AppPlatformGroupKey,
  type ListingArtifact,
} from '@sdkwork/appstore-pc-core';
import { AppItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { InstallModal } from '../components/install/InstallModal';
import { QrCodeModal } from '../components/install/QrCodeModal';
import { InstallService } from '../services/api';

export { useInstall };

function readLocalInstalledApps(): Set<string> {
  try {
    const saved = localStorage.getItem('sdkwork_installed_apps');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

/**
 * The desktop platform code an install records: the detected OS when the
 * listing ships it, else its first shipped desktop code (the runtime port
 * defaults to the PC storefront context when none applies).
 */
function resolveInstallPlatform(app: AppItem): string | undefined {
  return desktopInstallCodes(app.platforms, detectDesktopOs())[0];
}

/**
 * The verified installer artifact matching the requested desktop platform,
 * preferring the detected OS so the download matches this machine.
 */
function resolveInstallArtifact(
  app: AppItem,
  platform: string | undefined,
): ListingArtifact | undefined {
  if (!app.artifacts?.length || !platform) {
    return undefined;
  }
  return (
    app.artifacts.find((artifact) => artifact.platform === platform) ??
    app.artifacts.find((artifact) => artifact.platform === detectDesktopOs())
  );
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [appToInstall, setAppToInstall] = useState<AppItem | null>(null);
  const [installState, setInstallState] = useState<'confirm' | 'downloading' | 'success'>('confirm');
  const [progress, setProgress] = useState(0);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(readLocalInstalledApps);
  const [qrTarget, setQrTarget] = useState<{ app: AppItem; group?: AppPlatformGroupKey } | null>(
    null,
  );
  const [forcedPlatform, setForcedPlatform] = useState<string | undefined>(undefined);

  // Hydrate the installed set from the server-backed library. The server
  // response is authoritative — an empty library renders an empty state, no
  // demo apps are ever injected.
  useEffect(() => {
    let cancelled = false;
    InstallService.getInstalledAppIds()
      .then((ids) => {
        if (!cancelled) {
          setInstalledAppIds(new Set(ids));
        }
      })
      .catch(() => {
        // keep the local cache when the library endpoint is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = (next: Set<string>) => {
    try {
      localStorage.setItem('sdkwork_installed_apps', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

  const installApp = (app: AppItem, platform?: string) => {
    // Web surfaces open directly in a new independent window; mobile and
    // mini-program distributions continue through the scan dialog.
    const primary = primaryDistributionAction(app);
    if (primary?.kind === 'open') {
      openDistributionUrl(primary.url);
      return;
    }
    if (primary?.kind === 'qr') {
      setQrTarget({ app, group: primary.group });
      return;
    }
    setForcedPlatform(platform);
    setAppToInstall(app);
    setInstallState('confirm');
    setProgress(0);
  };

  const [runningAppNotice, setRunningAppNotice] = useState<string | null>(null);

  const openApp = (app: AppItem) => {
    setRunningAppNotice(t('install.modal.runningNotice', { name: app.name }));
    setTimeout(() => {
      setRunningAppNotice(null);
    }, 3000);
  };

  const uninstallApp = (appId: string) => {
    setInstalledAppIds((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      persistLocal(next);
      return next;
    });
    // Record the uninstall on the server-backed library; the local state
    // already reflects the removal so failures do not block the UI.
    InstallService.uninstallApp(appId).catch(() => {
      // ignore: anonymous sessions have no library row to remove
    });
  };

  const isInstalled = (appId: string) => installedAppIds.has(appId);
  const isDownloading = (appId: string) => appToInstall?.id === appId && installState === 'downloading';
  const downloadProgress = (appId: string) => (appToInstall?.id === appId ? progress : 0);

  const confirmInstall = () => {
    setInstallState('downloading');
    setInstallError(null);
    const target = appToInstall;
    if (!target) {
      return;
    }
    // Drive the flow from the server-backed library record; the progress ring
    // reflects the real request instead of a simulated download. The library
    // row records the requested desktop platform instead of a fixed `pc`.
    const platform = forcedPlatform ?? resolveInstallPlatform(target);
    const artifact = resolveInstallArtifact(target, platform);
    InstallService.installApp(target.id, platform)
      .then(async () => {
        // Trigger the installer download for the matched artifact (best
        // effort): the grant resolves a presigned URL when the drive
        // integration is enabled; otherwise the install record stands alone.
        if (artifact) {
          try {
            const delivery = await InstallService.resolveInstallerDownload(artifact.id);
            const url = delivery?.downloadUrl;
            if (url && /^https?:/i.test(url)) {
              window.open(url, '_blank', 'noopener,noreferrer');
            }
          } catch {
            // download resolution is additive; keep the install success
          }
        }
        setProgress(100);
        setInstallState('success');
        setInstalledAppIds((prev) => {
          const next = new Set(prev);
          next.add(target.id);
          persistLocal(next);
          return next;
        });
        setTimeout(() => {
          setAppToInstall(null);
          setProgress(0);
        }, 1200);
      })
      .catch((error) => {
        setInstallError(error instanceof Error ? error.message : t('install.modal.installFailed'));
        setInstallState('confirm');
      });
  };

  const cancelInstall = () => {
    if (installState === 'confirm') {
      setAppToInstall(null);
    }
  };

  return (
    <AppstoreInstallContext.Provider
      value={{
        installApp,
        openApp,
        uninstallApp,
        isInstalled,
        isDownloading,
        downloadProgress,
        installedAppIds,
        activeDownloadApp: appToInstall,
        downloadState: appToInstall ? installState : null,
        requestQr: (app, group) => setQrTarget({ app, group }),
      }}
    >
      {children}
      <QrCodeModal qr={qrTarget} onClose={() => setQrTarget(null)} />
      {runningAppNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900/90 text-white dark:bg-store-subtle/90 dark:text-store-ink rounded-store-card shadow-xl border border-store-line/50 backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-bounce ">
          <span className="w-2 h-2 rounded-full bg-store-success animate-ping" />
          <span>{runningAppNotice}</span>
        </div>
      )}
      <AnimatePresence>
        {appToInstall && (
          <InstallModal
            app={appToInstall}
            installState={installState}
            progress={progress}
            error={installError}
            installPlatform={forcedPlatform ?? resolveInstallPlatform(appToInstall)}
            installArtifact={
              resolveInstallArtifact(appToInstall, forcedPlatform ?? resolveInstallPlatform(appToInstall))
            }
            onConfirm={confirmInstall}
            onCancel={cancelInstall}
          />
        )}
      </AnimatePresence>
    </AppstoreInstallContext.Provider>
  );
}
