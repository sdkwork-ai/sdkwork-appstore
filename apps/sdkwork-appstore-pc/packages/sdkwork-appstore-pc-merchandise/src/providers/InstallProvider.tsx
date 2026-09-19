import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppstoreInstallContext, useInstall } from '@sdkwork/appstore-pc-commons';
import { AppItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { InstallModal } from '../components/install/InstallModal';
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

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [appToInstall, setAppToInstall] = useState<AppItem | null>(null);
  const [installState, setInstallState] = useState<'confirm' | 'downloading' | 'success'>('confirm');
  const [progress, setProgress] = useState(0);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(readLocalInstalledApps);

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

  const installApp = (app: AppItem) => {
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
    // reflects the real request instead of a simulated download.
    InstallService.installApp(target.id)
      .then(() => {
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
      }}
    >
      {children}
      {runningAppNotice && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gray-900/90 text-white dark:bg-gray-100/90 dark:text-gray-900 rounded-2xl shadow-xl border border-gray-700/50 dark:border-gray-300/50 backdrop-blur-md text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
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
            onConfirm={confirmInstall}
            onCancel={cancelInstall}
          />
        )}
      </AnimatePresence>
    </AppstoreInstallContext.Provider>
  );
}
