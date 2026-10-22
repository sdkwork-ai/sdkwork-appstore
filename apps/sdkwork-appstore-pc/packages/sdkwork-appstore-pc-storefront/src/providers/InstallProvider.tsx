import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppstoreInstallContext, useInstall } from '@sdkwork/appstore-pc-commons';
import {
  beginPaidListingCheckoutForApp,
  desktopInstallCodes,
  isPaidPricingModel,
  openDistributionUrl,
  primaryDistributionAction,
  resolveInstallPlan,
  selectInstallVariant,
  startInstallerDownload,
  type AppPlatformGroupKey,
  type DesktopOs,
  type InstallSelection,
  type InstallVariant,
  type ListingArtifact,
} from '@sdkwork/appstore-pc-core';
import { AppItem } from '../types';
import { AnimatePresence } from 'motion/react';
import { InstallModal } from '../components/install/InstallModal';
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

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const host = useHostPlatform();
  const [appToInstall, setAppToInstall] = useState<AppItem | null>(null);
  const [installState, setInstallState] = useState<'confirm' | 'downloading' | 'success'>('confirm');
  const [progress, setProgress] = useState(0);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedAppIds, setInstalledAppIds] = useState<Set<string>>(readLocalInstalledApps);
  const [qrTarget, setQrTarget] = useState<{ app: AppItem; group?: AppPlatformGroupKey } | null>(
    null,
  );
  const [selection, setSelection] = useState<InstallSelection | null>(null);
  const [downloadingArtifactId, setDownloadingArtifactId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref, not the state above: two clicks in the same tick both see the old
  // state, and each would mint another single-use download grant.
  const downloadInFlight = useRef<string | null>(null);

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

  const persistLocal = (next: Set<string>) => {
    try {
      localStorage.setItem('sdkwork_installed_apps', JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  };

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
      if (noticeTimer.current !== null) {
        clearTimeout(noticeTimer.current);
      }
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

  /**
   * Download one artifact as a file without touching the installed library.
   * A grant resolves the presigned URL; a missing URL or a rejected request is
   * surfaced instead of failing silently, which is what makes "download for
   * another platform" trustworthy.
   */
  const downloadBuild = (app: AppItem, variant: InstallVariant) => {
    const artifact = resolveInstallArtifact(app, variant);
    const artifactId = variant.artifactId ?? artifact?.id ?? null;
    if (artifactId === null) {
      showNotice('error', t('install.download.pending'));
      return;
    }
    if (downloadInFlight.current !== null) {
      return;
    }
    downloadInFlight.current = artifactId;
    setDownloadingArtifactId(artifactId);
    InstallService.resolveInstallerDownload(artifactId)
      .then((delivery) => {
        if (delivery?.downloadUrl && startInstallerDownload(delivery.downloadUrl)) {
          showNotice('success', t('install.download.started', { platform: variantLabel(variant) }));
        } else {
          showNotice('error', t('install.download.unavailable'));
        }
      })
      .catch(() => {
        showNotice('error', t('install.download.failed'));
      })
      .finally(() => {
        downloadInFlight.current = null;
        setDownloadingArtifactId(null);
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
    setAppToInstall(app);
    setInstallState('confirm');
    setProgress(0);
    setInstallError(null);
  };

  const openApp = (app: AppItem) => {
    showNotice('success', t('install.modal.runningNotice', { name: app.name }));
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
    // Commercial gate: a PAID listing must never be adopted through the free
    // install path. The checkout walks the cloudrouter domains surface
    // fail-closed (single-SKU, currency match, idempotent session + quote);
    // the install record is only created once payment is in place.
    if (isPaidPricingModel(target.pricingModel) && !installedAppIds.has(target.id)) {
      void beginPaidListingCheckoutForApp({ commerceProductId: target.commerceProductId })
        .then((result) => {
          setInstallState('confirm');
          if (result.status === 'ready') {
            setInstallError(`${result.message} 支付完成后即可下载安装。`);
          } else {
            setInstallError(result.message);
          }
        })
        .catch(() => {
          setInstallState('confirm');
          setInstallError('结算服务暂不可用，请稍后重试。');
        });
      return;
    }
    // Drive the flow from the server-backed library record; the progress ring
    // reflects the real request instead of a simulated download. The library
    // row records the selected platform and CPU architecture, and the download
    // grant targets the exact artifact the user chose.
    const platform =
      activeVariant?.platform ?? resolveInstallPlatform(target, host.os);
    const architecture = activeVariant?.architecture ?? undefined;
    const artifact = resolveInstallArtifact(target, activeVariant);
    InstallService.installApp(target.id, platform, architecture)
      .then(async () => {
        // Trigger the installer download for the matched artifact (best
        // effort): the grant resolves a presigned URL when the drive
        // integration is enabled; otherwise the install record stands alone.
        if (artifact) {
          try {
            const delivery = await InstallService.resolveInstallerDownload(artifact.id);
            if (!(delivery?.downloadUrl && startInstallerDownload(delivery.downloadUrl))) {
              showNotice('error', t('install.download.unavailable'));
            }
          } catch {
            showNotice('error', t('install.download.failed'));
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
        downloadBuild,
        downloadingArtifactId,
        openApp,
        uninstallApp,
        isInstalled,
        isDownloading,
        downloadProgress,
        installedAppIds,
        activeDownloadApp: appToInstall,
        downloadState: appToInstall ? installState : null,
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
            error={installError}
            variant={activeVariant}
            hostOs={host.os}
            onConfirm={confirmInstall}
            onCancel={cancelInstall}
          />
        )}
      </AnimatePresence>
    </AppstoreInstallContext.Provider>
  );
}
