import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { AppstoreInstallContext, useInstall } from '@sdkwork/appstore-pc-commons';
import {
  DownloadCenter,
  beginPaidListingCheckoutForApp,
  desktopInstallCodes,
  downloadProgressPercent,
  installerFileName,
  isPaidPricingModel,
  openDistributionUrl,
  primaryDistributionAction,
  resolveInstallPlan,
  saveDownloadedFile,
  selectInstallVariant,
  type AppPlatformGroupKey,
  type DesktopOs,
  type DownloadTask,
  type DownloadTaskStatus,
  type InstallSelection,
  type InstallVariant,
  type ListingArtifact,
} from '@sdkwork/appstore-pc-core';
import { AppItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { InstallModal, type InstallModalState } from '../components/install/InstallModal';
import { QrCodeModal } from '../components/install/QrCodeModal';
import { InstallService } from '../services/api';
import { architectureLabelKey } from '../lib/installVariant';
import { useHostPlatform } from './useHostPlatform';

export { useInstall };

function readLocalInstalledApps(): Set<string> {
  try {
    const saved = localStorage.getItem('sdkwork_installed_apps');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function persistInstalledApps(next: Set<string>): void {
  try {
    localStorage.setItem('sdkwork_installed_apps', JSON.stringify(Array.from(next)));
  } catch {
    // A full or disabled localStorage must not break the installed set.
  }
}

function readExpectedBytes(...values: Array<string | null | undefined>): number | null {
  for (const value of values) {
    const bytes = Number.parseInt(value ?? '', 10);
    if (Number.isFinite(bytes) && bytes > 0) {
      return bytes;
    }
  }
  return null;
}

/**
 * The desktop platform code an install records: the detected OS when the
 * listing ships it, else its first shipped desktop code (the runtime port
 * defaults to the PC storefront context when none applies).
 */
function resolveInstallPlatform(app: AppItem, hostOs: DesktopOs | null): string | undefined {
  return desktopInstallCodes(app.platforms, hostOs)[0];
}

/**
 * The verified installer artifact behind the selected build. The plan pins the
 * artifact id for artifact-backed variants; listing-level variants (a platform
 * without a published artifact yet) fall back to the platform's first artifact
 * so the download still resolves when the release carries one.
 */
function resolveInstallArtifact(
  app: AppItem,
  variant: InstallVariant | null,
): ListingArtifact | undefined {
  if (!app.artifacts?.length || variant === null) {
    return undefined;
  }
  if (variant.artifactId !== null) {
    return app.artifacts.find((artifact) => artifact.id === variant.artifactId);
  }
  return app.artifacts.find((artifact) => artifact.platform === variant.platform);
}

function modalStateFor(status: DownloadTaskStatus): InstallModalState {
  switch (status) {
    case 'queued':
    case 'downloading':
      return 'downloading';
    case 'paused':
      return 'paused';
    case 'failed':
      return 'failed';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'confirm';
  }
}

function createInstallDownloadCenter(): DownloadCenter {
  return new DownloadCenter({
    // A presigned installer URL expires; when storage rejects the stale one the
    // center asks the install port for a fresh grant and continues from the
    // same persisted byte offset.
    refreshUrl: async (task) => {
      if (task.artifactId === null) {
        return undefined;
      }
      const delivery = await InstallService.resolveInstallerDownload(task.artifactId).catch(
        () => undefined,
      );
      return delivery?.downloadUrl;
    },
  });
}

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const host = useHostPlatform();
  const [downloadCenter] = useState(createInstallDownloadCenter);
  const downloadSnapshot = useSyncExternalStore(
    downloadCenter.subscribe,
    downloadCenter.getSnapshot,
    downloadCenter.getSnapshot,
  );
  const downloads = downloadSnapshot.tasks;

  const [appToInstall, setAppToInstall] = useState<AppItem | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [startingInstall, setStartingInstall] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(readLocalInstalledApps);
  const [qrTarget, setQrTarget] = useState<{ app: AppItem; group?: AppPlatformGroupKey } | null>(
    null,
  );
  const [selection, setSelection] = useState<InstallSelection | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Grant requests are single-use and two clicks in the same tick both see the
  // old state, so in-flight decisions live in refs rather than state.
  const startingRef = useRef(false);
  const installAttempt = useRef(0);
  const handledTaskIds = useRef(new Set<string>());
  const appToInstallRef = useRef<AppItem | null>(null);
  appToInstallRef.current = appToInstall;

  useEffect(() => {
    void downloadCenter.ready();
    // Installer bytes live in IndexedDB; ask the browser not to evict them so
    // a paused download can still resume after the tab was closed.
    const storage = navigator.storage;
    if (typeof storage?.persist === 'function') {
      void storage.persist().catch(() => undefined);
    }
  }, [downloadCenter]);

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

  // The install plan is the single source of truth for both the call to action
  // and the confirmation dialog: both resolve the same recommended build.
  const activeVariant = useMemo<InstallVariant | null>(() => {
    if (appToInstall === null) {
      return null;
    }
    return selectInstallVariant(resolveInstallPlan(appToInstall, host), selection);
  }, [appToInstall, host, selection]);

  const activeTask = useMemo(
    () => downloads.find((task) => task.id === activeTaskId) ?? null,
    [downloads, activeTaskId],
  );

  // One transient notice surface for actions that do not own a dialog: an app
  // launched into its sandbox, and installer downloads started for another
  // platform or architecture.
  const showNotice = (kind: 'success' | 'error', message: string) => {
    if (noticeTimer.current !== null) {
      clearTimeout(noticeTimer.current);
    }
    setNotice({ kind, message });
    noticeTimer.current = setTimeout(() => {
      setNotice(null);
      noticeTimer.current = null;
    }, 3200);
  };

  useEffect(
    () => () => {
      if (noticeTimer.current !== null) clearTimeout(noticeTimer.current);
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    },
    [],
  );

  /** Display label of a build (`OS · architecture`) for download feedback. */
  const variantLabel = (variant: InstallVariant): string => {
    const osLabel = t(`common.distribution.os.${variant.platform}`);
    const archKey = architectureLabelKey(variant);
    return archKey === null
      ? osLabel
      : `${osLabel} · ${t(`common.distribution.architecture.${archKey}`)}`;
  };

  const recordInstalled = (appId: string) => {
    setInstalledAppIds((prev) => {
      if (prev.has(appId)) return prev;
      const next = new Set(prev);
      next.add(appId);
      persistInstalledApps(next);
      return next;
    });
  };

  /**
   * Place a completed installer on local storage exactly once, then record the
   * install. The task persists both markers, so a reload after completion does
   * not save a duplicate file or create a second library record.
   */
  useEffect(() => {
    const settle = async (task: DownloadTask): Promise<void> => {
      let savedToDisk = task.savedAt !== null;
      if (!savedToDisk) {
        try {
          const blob = await downloadCenter.getBlob(task.id);
          if (blob === null) {
            showNotice('error', t('install.download.saveFailed'));
            return;
          }
          const saved = await saveDownloadedFile(blob, task.fileName);
          if (saved.status === 'cancelled') {
            showNotice('error', t('install.download.saveCancelled'));
            return;
          }
          if (saved.status === 'unavailable') {
            showNotice('error', t('install.download.saveUnavailable'));
            return;
          }
          savedToDisk = true;
          await downloadCenter.markSaved(task.id, saved.path ?? null);
          if (task.purpose === 'download') {
            showNotice('success', t('install.download.completed', { name: task.fileName }));
          }
        } catch {
          showNotice('error', t('install.download.saveFailed'));
          return;
        }
      }
      if (!savedToDisk) return;
      if (task.purpose === 'install' && task.installRecordedAt === null) {
        try {
          await InstallService.installApp(task.appId, task.platform, task.architecture ?? undefined);
          await downloadCenter.markInstallRecorded(task.id);
          recordInstalled(task.appId);
          if (appToInstallRef.current?.id === task.appId) {
            if (closeTimer.current !== null) clearTimeout(closeTimer.current);
            closeTimer.current = setTimeout(() => {
              setAppToInstall(null);
              setActiveTaskId(null);
            }, 1400);
          } else {
            showNotice('success', t('install.download.installedNotice', { name: task.appName }));
          }
        } catch (error) {
          showNotice(
            'error',
            error instanceof Error ? error.message : t('install.modal.installFailed'),
          );
        }
      }
    };
    for (const task of downloads) {
      if (task.status !== 'completed' || handledTaskIds.current.has(task.id)) continue;
      handledTaskIds.current.add(task.id);
      void settle(task);
    }
  }, [downloads, downloadCenter, t]);

  /**
   * Download one artifact as a file without touching the installed library.
   * The download center owns the queue, progress, pause, and resume; a missing
   * source is surfaced instead of failing silently.
   */
  const downloadBuild = (app: AppItem, variant: InstallVariant) => {
    const artifact = resolveInstallArtifact(app, variant);
    const artifactId = variant.artifactId ?? artifact?.id ?? null;
    if (artifactId === null || artifact === undefined) {
      showNotice('error', t('install.download.pending'));
      return;
    }
    const alreadyQueued = downloads.some(
      (task) =>
        task.artifactId === artifactId
        && (task.status === 'queued' || task.status === 'downloading' || task.status === 'paused'),
    );
    if (alreadyQueued) return;
    InstallService.resolveInstallerDownload(artifactId)
      .then(async (delivery) => {
        const url = delivery?.downloadUrl?.trim();
        if (!url) {
          showNotice('error', t('install.download.unavailable'));
          return;
        }
        await downloadCenter.enqueue({
          appId: app.id,
          appName: app.name,
          appVersion: app.version,
          icon: app.icon,
          iconColor: app.iconColor,
          platform: variant.platform,
          architecture: variant.architecture,
          artifactId,
          packageFormat: variant.packageFormat || artifact.packageFormat,
          fileName: installerFileName({
            appName: app.name,
            appVersion: app.version,
            platform: variant.platform,
            architecture: variant.architecture,
            packageFormat: variant.packageFormat || artifact.packageFormat,
          }),
          url,
          expectedBytes: readExpectedBytes(delivery?.fileSizeBytes, artifact.fileSizeBytes),
          checksumSha256: artifact.checksumSha256 ?? null,
          purpose: 'download',
        });
        showNotice('success', t('install.download.queued', { platform: variantLabel(variant) }));
      })
      .catch(() => {
        showNotice('error', t('install.download.failed'));
      });
  };

  const installApp = (app: AppItem, installSelection?: InstallSelection) => {
    // An explicit build always takes the desktop install path; only the
    // card-level call (no selection) lets the listing's primary distribution
    // decide between opening a web app, scanning a QR code, and installing.
    if (installSelection === undefined) {
      const primary = primaryDistributionAction(app);
      if (primary?.kind === 'open') {
        openDistributionUrl(primary.url);
        return;
      }
      if (primary?.kind === 'qr') {
        setQrTarget({ app, group: primary.group });
        return;
      }
    }
    setSelection(installSelection ?? null);
    installAttempt.current += 1;
    setAppToInstall(app);
    setActiveTaskId(null);
    setStartingInstall(false);
    setInstallError(null);
  };

  const openApp = (app: AppItem) => {
    showNotice('success', t('install.modal.runningNotice', { name: app.name }));
  };

  const uninstallApp = (appId: string) => {
    for (const task of downloads) {
      if (task.appId === appId) {
        void downloadCenter.remove(task.id);
      }
    }
    setInstalledAppIds((prev) => {
      const next = new Set(prev);
      next.delete(appId);
      persistInstalledApps(next);
      return next;
    });
    // Record the uninstall on the server-backed library; the local state
    // already reflects the removal so failures do not block the UI.
    InstallService.uninstallApp(appId).catch(() => {
      // ignore: anonymous sessions have no library row to remove
    });
  };

  const isInstalled = (appId: string) => installedAppIds.has(appId);
  const isDownloading = (appId: string) =>
    downloads.some(
      (task) =>
        task.appId === appId && (task.status === 'queued' || task.status === 'downloading'),
    );
  const downloadProgress = (appId: string) => {
    const task = [...downloads].reverse().find((entry) => entry.appId === appId);
    return task ? downloadProgressPercent(task.receivedBytes, task.totalBytes) : 0;
  };

  const confirmInstall = () => {
    const target = appToInstall;
    if (target === null || startingRef.current) {
      return;
    }
    startingRef.current = true;
    const attempt = ++installAttempt.current;
    setInstallError(null);
    // Commercial gate: a PAID listing must never be adopted through the free
    // install path. The checkout walks the cloudrouter domains surface
    // fail-closed (single-SKU, currency match, idempotent session + quote);
    // the install record is only created once payment is in place.
    if (isPaidPricingModel(target.pricingModel) && !installedAppIds.has(target.id)) {
      startingRef.current = false;
      setStartingInstall(true);
      void beginPaidListingCheckoutForApp({ commerceProductId: target.commerceProductId })
        .then((result) => {
          if (attempt !== installAttempt.current) return;
          setStartingInstall(false);
          if (result.status === 'ready') {
            setInstallError(`${result.message} 支付完成后即可下载安装。`);
          } else {
            setInstallError(result.message);
          }
        })
        .catch(() => {
          if (attempt !== installAttempt.current) return;
          setStartingInstall(false);
          setInstallError('结算服务暂不可用，请稍后重试。');
        });
      return;
    }

    const variant = activeVariant;
    const platform = variant?.platform ?? resolveInstallPlatform(target, host.os) ?? 'windows';
    const architecture = variant?.architecture ?? undefined;
    const artifact = resolveInstallArtifact(target, variant);

    // A listing-level install (the publisher declared the platform but has not
    // uploaded an artifact yet) has no file to fetch. Reporting an install
    // success here would be false, so surface the missing package instead.
    if (artifact === undefined) {
      startingRef.current = false;
      setInstallError(t('install.download.pending'));
      return;
    }

    startingRef.current = true;
    setStartingInstall(true);
    InstallService.resolveInstallerDownload(artifact.id)
      .then(async (delivery) => {
        if (attempt !== installAttempt.current) return;
        const url = delivery?.downloadUrl?.trim();
        if (!url) {
          setStartingInstall(false);
          startingRef.current = false;
          setInstallError(t('install.download.pending'));
          return;
        }
        const packageFormat = variant?.packageFormat || artifact.packageFormat;
        const task = await downloadCenter.enqueue({
          appId: target.id,
          appName: target.name,
          appVersion: target.version,
          icon: target.icon,
          iconColor: target.iconColor,
          platform,
          architecture: architecture ?? null,
          artifactId: artifact.id,
          packageFormat,
          fileName: installerFileName({
            appName: target.name,
            appVersion: target.version,
            platform,
            architecture: architecture ?? null,
            packageFormat,
          }),
          url,
          expectedBytes: readExpectedBytes(delivery?.fileSizeBytes, artifact.fileSizeBytes),
          checksumSha256: artifact.checksumSha256 ?? null,
          purpose: 'install',
        });
        if (attempt !== installAttempt.current) {
          await downloadCenter.cancel(task.id);
          return;
        }
        setActiveTaskId(task.id);
        setStartingInstall(false);
        startingRef.current = false;
      })
      .catch((error) => {
        if (attempt !== installAttempt.current) return;
        startingRef.current = false;
        setStartingInstall(false);
        setInstallError(
          error instanceof Error ? error.message : t('install.download.failed'),
        );
      });
  };

  const cancelInstall = () => {
    installAttempt.current += 1;
    startingRef.current = false;
    if (activeTaskId !== null) {
      void downloadCenter.cancel(activeTaskId);
    }
    setActiveTaskId(null);
    setAppToInstall(null);
    setStartingInstall(false);
    setInstallError(null);
  };

  const pauseInstall = () => {
    if (activeTaskId !== null) void downloadCenter.pause(activeTaskId);
  };

  const resumeInstall = () => {
    if (activeTaskId !== null) {
      setInstallError(null);
      void downloadCenter.resume(activeTaskId);
    }
  };

  const retryInstall = () => {
    if (activeTaskId !== null) {
      setInstallError(null);
      void downloadCenter.retry(activeTaskId);
    }
  };

  const installState: InstallModalState =
    startingInstall
      ? 'downloading'
      : activeTask === null
        ? 'confirm'
        : modalStateFor(activeTask.status);

  const progress = activeTask
    ? downloadProgressPercent(activeTask.receivedBytes, activeTask.totalBytes)
    : 0;

  const saveDownload = async (taskId: string): Promise<boolean> => {
    const task = downloadCenter.getTask(taskId);
    if (task === undefined) return false;
    const blob = await downloadCenter.getBlob(taskId);
    if (blob === null) {
      showNotice('error', t('install.download.saveUnavailable'));
      return false;
    }
    const saved = await saveDownloadedFile(blob, task.fileName);
    if (saved.status !== 'saved') {
      showNotice(
        'error',
        saved.status === 'cancelled'
          ? t('install.download.saveCancelled')
          : t('install.download.saveUnavailable'),
      );
      return false;
    }
    await downloadCenter.markSaved(taskId, saved.path ?? null);
    showNotice('success', t('install.download.completed', { name: task.fileName }));
    return true;
  };

  return (
    <AppstoreInstallContext.Provider
      value={{
        installApp,
        downloadBuild,
        downloadingArtifactId:
          downloads.find(
            (task) =>
              task.artifactId !== null
              && (task.status === 'queued' || task.status === 'downloading'),
          )?.artifactId ?? null,
        openApp,
        uninstallApp,
        isInstalled,
        isDownloading,
        downloadProgress,
        installedAppIds,
        activeDownloadApp: appToInstall,
        downloadState:
          appToInstall === null
            ? null
            : installState === 'confirm'
              ? 'confirm'
              : installState === 'success'
                ? 'success'
                : installState === 'paused'
                  ? 'paused'
                  : installState === 'failed'
                    ? 'failed'
                    : 'downloading',
        downloads,
        pauseDownload: (taskId) => {
          void downloadCenter.pause(taskId);
        },
        resumeDownload: (taskId) => {
          void downloadCenter.resume(taskId);
        },
        cancelDownload: (taskId) => {
          void downloadCenter.cancel(taskId);
        },
        retryDownload: (taskId) => {
          void downloadCenter.retry(taskId);
        },
        removeDownload: (taskId) => {
          void downloadCenter.remove(taskId);
        },
        clearCompletedDownloads: () => {
          void downloadCenter.clearFinished();
        },
        saveDownload,
        host,
        requestQr: (app, group) => setQrTarget({ app, group }),
      }}
    >
      {children}
      <QrCodeModal qr={qrTarget} onClose={() => setQrTarget(null)} />
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-[110] flex items-center gap-2 rounded-store-card border px-4 py-3 text-xs font-semibold shadow-xl backdrop-blur-md ${
            notice.kind === 'error'
              ? 'border-store-danger-line bg-store-danger-soft text-store-danger'
              : 'border-store-success-line bg-store-success-soft text-store-success'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              notice.kind === 'error' ? 'bg-store-danger' : 'bg-store-success'
            }`}
          />
          <span>{notice.message}</span>
        </div>
      )}
      <AnimatePresence>
        {appToInstall && (
          <InstallModal
            app={appToInstall}
            installState={installState}
            progress={progress}
            error={installError ?? (activeTask?.status === 'failed' ? activeTask.error : null)}
            variant={activeVariant}
            hostOs={host.os}
            task={activeTask}
            onConfirm={confirmInstall}
            onPause={pauseInstall}
            onResume={resumeInstall}
            onRetry={retryInstall}
            onCancel={cancelInstall}
          />
        )}
      </AnimatePresence>
    </AppstoreInstallContext.Provider>
  );
}
