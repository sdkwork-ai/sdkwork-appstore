import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play } from 'lucide-react';
import { formatDownloadBytes, formatDownloadSpeed } from '@sdkwork/appstore-pc-core';

interface InstallModalProgressProps {
  progress: number;
  /** Bytes persisted for this task. */
  receivedBytes?: number;
  /** Expected total bytes, or null while unknown. */
  totalBytes?: number | null;
  /** Measured transfer speed. */
  bytesPerSecond?: number;
  /** Whether the transfer is running or paused. */
  status?: 'downloading' | 'paused';
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

/**
 * Progress body of the install dialog with the pause/resume/stop controls the
 * download center exposes.
 */
export const InstallModalProgress: React.FC<InstallModalProgressProps> = ({
  progress,
  receivedBytes,
  totalBytes,
  bytesPerSecond,
  status = 'downloading',
  onPause,
  onResume,
  onCancel,
}) => {
  const { t } = useTranslation();
  const showBytes = receivedBytes !== undefined && receivedBytes > 0;
  const totalLabel = totalBytes === null || totalBytes === undefined
    ? formatDownloadBytes(receivedBytes ?? 0)
    : `${formatDownloadBytes(receivedBytes ?? 0)} / ${formatDownloadBytes(totalBytes)}`;
  const speedLabel = bytesPerSecond !== undefined && bytesPerSecond > 0
    ? formatDownloadSpeed(bytesPerSecond)
    : null;

  return (
    <div className="w-full py-2">
      <div className="flex justify-between text-xs font-bold text-store-ink-faint mb-2 ">
        <span>
          {status === 'paused'
            ? t('install.modal.paused')
            : t('common.actions.downloading')}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-2 bg-store-raised rounded-full overflow-hidden ">
        <div
          className="h-full bg-store-brand transition-all duration-75 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showBytes && (
        <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-store-ink-faint">
          <span>{totalLabel}</span>
          {speedLabel !== null && status === 'downloading' && <span>{speedLabel}</span>}
        </div>
      )}
      <div className="mt-4 flex w-full gap-2">
        {status === 'paused' ? (
          <button
            onClick={onResume}
            className="flex-1 py-2.5 bg-store-brand text-white font-medium rounded-store-control transition-colors shadow-md shadow-blue-200 dark:shadow-none cursor-pointer text-sm flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            {t('install.modal.resume')}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex-1 py-2.5 bg-store-raised text-store-ink font-medium rounded-store-control transition-colors cursor-pointer text-sm flex items-center justify-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" />
            {t('install.modal.pause')}
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-store-raised text-store-ink-soft font-medium rounded-store-control transition-colors cursor-pointer text-sm"
        >
          {t('install.modal.stop')}
        </button>
      </div>
    </div>
  );
};
