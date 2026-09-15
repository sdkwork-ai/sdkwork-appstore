import {
  AdminActionButton,
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';
import type { AppstoreAdminModerationQueueItem } from '@sdkwork/appstore-pc-admin-core';
import { useTranslation } from 'react-i18next';

import { ModerationReviewStatusBadge } from './ModerationStatusBadge';

export interface ModerationQueueTableProps {
  items: readonly AppstoreAdminModerationQueueItem[];
  loading: boolean;
  onOpenReview: (reviewId: string) => void;
  /** Quick-decision handler; omitted when the operator lacks the permission. */
  onDecide?: (reviewId: string) => void;
  /** Whether the quick-decision affordance is available. */
  canDecide?: boolean;
}

/** Operator queue grid: one row per pending moderation submission. */
export function ModerationQueueTable({
  canDecide = false,
  items,
  loading,
  onDecide,
  onOpenReview,
}: ModerationQueueTableProps) {
  const { t } = useTranslation();

  const columns: AdminTableColumn<AppstoreAdminModerationQueueItem>[] = [
    {
      key: 'listing',
      header: t('adminModeration.queue.columns.listing'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900 dark:text-gray-50">{item.listingName}</p>
          <p className="truncate font-mono text-[11px] text-gray-400 dark:text-gray-500">
            {item.listingId || t('adminShell.common.notAvailable')}
          </p>
        </div>
      ),
    },
    {
      key: 'submissionType',
      header: t('adminModeration.queue.columns.submissionType'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.submissionType}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('adminModeration.queue.columns.status'),
      width: 'w-36',
      render: (item) => <ModerationReviewStatusBadge status={item.reviewStatus} />,
    },
    {
      key: 'assignee',
      header: t('adminModeration.queue.columns.assignee'),
      width: 'w-40',
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.assignedTo || t('adminModeration.queue.assignedUnassigned')}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: t('adminModeration.queue.columns.submittedAt'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.submittedDate || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminModeration.queue.columns.actions'),
      width: 'w-48',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <AdminActionButton onClick={() => onOpenReview(item.reviewId)}>
            {t('adminModeration.queue.detail')}
          </AdminActionButton>
          {canDecide ? (
            <AdminActionButton
              onClick={() => onDecide?.(item.reviewId)}
              variant="primary"
            >
              {t('adminModeration.review.actions.decide')}
            </AdminActionButton>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminModeration.queue.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder inline kind="empty" description={t('adminModeration.queue.empty')} />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.reviewId}
      rows={items}
    />
  );
}
