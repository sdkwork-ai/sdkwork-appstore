import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownToLine, Pause, Play, Trash2 } from 'lucide-react';
import type { DownloadTask } from '@sdkwork/appstore-pc-core';
import { DownloadQueueCard } from './DownloadQueueCard';

interface DownloadQueuePanelProps {
  tasks: readonly DownloadTask[];
  onPause: (taskId: string) => void;
  onResume: (taskId: string) => void;
  onCancel: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onRemove: (taskId: string) => void;
  onClearCompleted: () => void;
  /** Save a completed task that has not reached local storage yet. */
  onSave?: (taskId: string) => void;
}

/**
 * The download center queue: every installer task with its progress and the
 * pause/resume/stop/retry/remove transitions the transfer currently allows.
 */
export const DownloadQueuePanel: React.FC<DownloadQueuePanelProps> = ({
  tasks,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onRemove,
  onClearCompleted,
  onSave,
}) => {
  const { t } = useTranslation();
  const activeTasks = tasks.filter(
    (task) => task.status === 'queued' || task.status === 'downloading' || task.status === 'paused',
  );
  const finishedTasks = tasks.filter(
    (task) => task.status === 'completed' || task.status === 'cancelled' || task.status === 'failed',
  );
  const ordered = [...activeTasks, ...finishedTasks];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold tracking-tight text-store-ink flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4" />
          <span>{t('updates.queue.title')}</span>
          <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-store-raised text-store-ink-soft">
            {tasks.length}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              for (const task of activeTasks) {
                if (task.status !== 'paused') onPause(task.id);
              }
            }}
            disabled={!activeTasks.some((task) => task.status !== 'paused')}
            className="px-3 py-1.5 rounded-store-control text-xs font-medium bg-store-raised text-store-ink-soft hover:bg-store-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" />
            {t('updates.queue.pauseAll')}
          </button>
          <button
            onClick={() => {
              for (const task of activeTasks) {
                if (task.status === 'paused') onResume(task.id);
              }
            }}
            disabled={!activeTasks.some((task) => task.status === 'paused')}
            className="px-3 py-1.5 rounded-store-control text-xs font-medium bg-store-raised text-store-ink-soft hover:bg-store-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            {t('updates.queue.resumeAll')}
          </button>
          <button
            onClick={onClearCompleted}
            disabled={!finishedTasks.some((task) => task.status === 'completed' || task.status === 'cancelled')}
            className="px-3 py-1.5 rounded-store-control text-xs font-medium bg-store-raised text-store-ink-soft hover:bg-store-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t('updates.queue.clearCompleted')}
          </button>
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-store-card border border-store-line-soft bg-store-surface p-8 text-center">
          <ArrowDownToLine className="w-8 h-8 mx-auto mb-2 text-store-ink-faint" />
          <p className="text-xs font-medium text-store-ink-faint">{t('updates.queue.empty')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ordered.map((task) => (
            <DownloadQueueCard
              key={task.id}
              task={task}
              onPause={onPause}
              onResume={onResume}
              onCancel={onCancel}
              onRetry={onRetry}
              onRemove={onRemove}
              onSave={onSave}
            />
          ))}
        </div>
      )}
    </section>
  );
};
