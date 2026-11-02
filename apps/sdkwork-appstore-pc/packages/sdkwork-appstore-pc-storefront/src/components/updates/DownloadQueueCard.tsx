import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pause, Play, RotateCcw, Square, Trash2, Check, Download } from 'lucide-react';
import {
  downloadProgressPercent,
  formatDownloadBytes,
  formatDownloadSpeed,
  type DownloadTask,
} from '@sdkwork/appstore-pc-core';
import { DynamicIcon } from '../DynamicIcon';

interface DownloadQueueCardProps {
  task: DownloadTask;
  onPause: (taskId: string) => void;
  onResume: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  /** Save a completed task that has not reached local storage yet. */
  onSave?: (taskId: string) => void;
}

/** One download-center row with live progress and its allowed transitions. */
export const DownloadQueueCard: React.FC<DownloadQueueCardProps> = ({
  task,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove,
  onSave,
}) => {
  const { t } = useTranslation();
  const progress = downloadProgressPercent(task.receivedBytes, task.totalBytes);
  const active = task.status === 'queued' || task.status === 'downloading' || task.status === 'paused';
  const totalLabel = task.totalBytes === null
    ? formatDownloadBytes(task.receivedBytes)
    : `${formatDownloadBytes(task.receivedBytes)} / ${formatDownloadBytes(task.totalBytes)}`;
  const platformLabel = task.architecture
    ? `${task.platform} · ${task.architecture}`
    : task.platform;
  const iconName = task.icon ?? 'Package';

  return (
    <div className="p-5 bg-store-surface border border-store-line-soft rounded-store-card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-white shadow-sm ${
              task.iconColor ?? 'bg-store-brand'
            }`}
          >
            <DynamicIcon name={iconName} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-store-ink truncate">{task.appName}</h4>
            <p className="text-[11px] text-store-ink-faint truncate">
              {t(`updates.queue.status.${task.status}`)} · {platformLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {active && task.status !== 'paused' && (
            <button
              onClick={() => onPause(task.id)}
              title={t('install.modal.pause')}
              aria-label={t('install.modal.pause')}
              className="p-1.5 rounded-store-control text-store-ink-soft hover:bg-store-raised cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
          {task.status === 'paused' && (
            <button
              onClick={() => onResume(task.id)}
              title={t('install.modal.resume')}
              aria-label={t('install.modal.resume')}
              className="p-1.5 rounded-store-control text-store-brand hover:bg-store-raised cursor-pointer"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          {task.status === 'failed' && (
            <button
              onClick={() => onRetry(task.id)}
              title={t('common.actions.retry')}
              aria-label={t('common.actions.retry')}
              className="p-1.5 rounded-store-control text-store-brand hover:bg-store-raised cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {task.status === 'cancelled' && (
            <button
              onClick={() => onRetry(task.id)}
              title={t('common.actions.retry')}
              aria-label={t('common.actions.retry')}
              className="p-1.5 rounded-store-control text-store-brand hover:bg-store-raised cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          {active && (
            <button
              onClick={() => onCancel(task.id)}
              title={t('install.modal.stop')}
              aria-label={t('install.modal.stop')}
              className="p-1.5 rounded-store-control text-store-danger hover:bg-store-danger-soft cursor-pointer"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          {task.status === 'completed' && task.savedAt === null && onSave !== undefined && (
            <button
              onClick={() => onSave(task.id)}
              title={t('updates.queue.saveNow')}
              aria-label={t('updates.queue.saveNow')}
              className="p-1.5 rounded-store-control text-store-brand hover:bg-store-raised cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {!active && (
            <button
              onClick={() => onRemove(task.id)}
              title={t('updates.queue.remove')}
              aria-label={t('updates.queue.remove')}
              className="p-1.5 rounded-store-control text-store-ink-soft hover:bg-store-raised cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-store-raised h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 rounded-full ${
            task.status === 'completed'
              ? 'bg-store-success'
              : task.status === 'failed'
                ? 'bg-store-danger'
                : 'bg-store-brand'
          }`}
          style={{ width: `${task.status === 'completed' ? 100 : progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-medium text-store-ink-faint">
        <span>{totalLabel}</span>
        <span className="flex items-center gap-2">
          {task.status === 'downloading' && task.bytesPerSecond > 0 && (
            <span>{formatDownloadSpeed(task.bytesPerSecond)}</span>
          )}
          {task.status === 'completed' ? (
            <span className="flex items-center gap-1 text-store-success">
              <Check className="w-3 h-3" />
              {task.savedPath || t('updates.queue.saved')}
            </span>
          ) : (
            <span>{Math.round(progress)}%</span>
          )}
        </span>
      </div>

      {task.status === 'failed' && task.error && (
        <p className="text-[11px] text-store-danger break-words" role="alert">
          {task.error}
        </p>
      )}
    </div>
  );
};
