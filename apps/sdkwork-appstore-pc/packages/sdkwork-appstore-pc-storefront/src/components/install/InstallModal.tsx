import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { DynamicIcon } from '../DynamicIcon';
import type { AppItem, DesktopOs, DownloadTask, InstallVariant } from '../../types';
import { formatInstallerSize } from '@sdkwork/appstore-pc-core';
import { architectureLabelKey } from '../../lib/installVariant';
import { InstallModalConfirmActions } from './InstallModalConfirmActions';
import { InstallModalProgress } from './InstallModalProgress';
import { InstallModalSuccessState } from './InstallModalSuccessState';

/** Body state of the install dialog. */
export type InstallModalState = 'confirm' | 'downloading' | 'paused' | 'success' | 'failed';

interface InstallModalProps {
  app: AppItem;
  installState: InstallModalState;
  progress: number;
  error?: string | null;
  /** Build the install uses, resolved from the host or the builds menu. */
  variant: InstallVariant | null;
  /** Host desktop OS, used to label the build as detected for this machine. */
  hostOs: DesktopOs | null;
  /** Active download-center task, when the install started downloading. */
  task?: DownloadTask | null;
  onConfirm: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onRetry?: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog for one resolved install build: platform, CPU
 * architecture, package format, and size, plus live download progress with
 * pause/resume/stop controls and a failed state with retry.
 */
export function InstallModal({
  app,
  installState,
  progress,
  error,
  variant,
  hostOs,
  task,
  onConfirm,
  onPause,
  onResume,
  onRetry,
  onCancel,
}: InstallModalProps) {
  const { t } = useTranslation();
  const osLabel = variant ? t(`common.distribution.os.${variant.platform}`) : null;
  const archKey = variant ? architectureLabelKey(variant) : null;
  const archLabel = archKey ? t(`common.distribution.architecture.${archKey}`) : null;
  const buildLabel = [osLabel, archLabel].filter((part): part is string => part !== null).join(' · ');
  const detectedForHost = variant !== null && variant.platform === hostOs;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-store-overlay backdrop-blur-sm"
        onClick={
          installState === 'downloading' || installState === 'paused' ? undefined : onCancel
        }
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-store-surface rounded-store-modal w-full max-w-sm p-6 shadow-2xl overflow-hidden border border-store-line-soft "
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${app.iconColor} dark:shadow-none`}
          >
            <DynamicIcon name={app.icon} className="text-white w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-store-ink ">{app.name}</h3>
          <p className="text-sm text-store-ink-faint mt-1 mb-6 ">{app.developer}</p>

          {error && (
            <p className="text-sm text-store-danger mb-4 " role="alert">
              {error}
            </p>
          )}

          {installState === 'confirm' && (
            <>
              {variant && buildLabel && (
                <p className="text-xs font-medium text-store-ink-soft bg-store-subtle border border-store-line-soft rounded-full px-3 py-1 mb-3">
                  {detectedForHost
                    ? t('install.modal.platformNote', { platform: buildLabel })
                    : t('install.modal.platformNoteGeneric', { platform: buildLabel })}
                </p>
              )}
              {variant && variant.packageFormatLabel && (
                <p className="text-xs text-store-ink-faint mb-2">
                  {t('install.modal.artifactNote', {
                    format: variant.packageFormatLabel,
                    size: formatInstallerSize(variant.fileSizeBytes),
                  })}
                </p>
              )}
              {variant && variant.match === 'emulated' && (
                <p className="text-xs text-store-warning mb-2">
                  {t('install.modal.compatibilityNote')}
                </p>
              )}
              <div className="pt-2 w-full">
                <InstallModalConfirmActions onConfirm={onConfirm} onCancel={onCancel} />
              </div>
            </>
          )}

          {(installState === 'downloading' || installState === 'paused') && (
            <InstallModalProgress
              progress={progress}
              receivedBytes={task?.receivedBytes}
              totalBytes={task?.totalBytes ?? null}
              bytesPerSecond={task?.bytesPerSecond}
              status={installState === 'paused' ? 'paused' : 'downloading'}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
            />
          )}

          {installState === 'failed' && (
            <div className="w-full pt-2 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-store-raised hover:bg-store-raised text-store-ink font-medium rounded-store-control transition-colors cursor-pointer text-sm"
              >
                {t('common.actions.cancel')}
              </button>
              <button
                onClick={onRetry}
                className="flex-1 py-3 bg-store-brand hover:bg-store-brand text-white font-medium rounded-store-control transition-colors shadow-md shadow-blue-200 dark:shadow-none cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('common.actions.retry')}
              </button>
            </div>
          )}

          {installState === 'success' && (
            <InstallModalSuccessState savedPath={task?.savedPath ?? null} />
          )}
        </div>
      </motion.div>
    </div>
  );
}
