import { useTranslation } from 'react-i18next';
import type { AppstoreAdminModerationAppeal } from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDataTable,
  AdminStatePlaceholder,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

import { ModerationAppealStatusBadge } from './ModerationStatusBadge';

export interface ModerationAppealTableProps {
  items: readonly AppstoreAdminModerationAppeal[];
  loading: boolean;
  onOpenAppeal: (appealId: string) => void;
}

/** Operator appeal grid: one row per developer appeal. */
export function ModerationAppealTable({
  items,
  loading,
  onOpenAppeal,
}: ModerationAppealTableProps) {
  const { t } = useTranslation();

  const columns: AdminTableColumn<AppstoreAdminModerationAppeal>[] = [
    {
      key: 'appeal',
      header: t('adminModeration.appeals.columns.appeal'),
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-600 dark:text-gray-300">
          {item.appealId}
        </span>
      ),
    },
    {
      key: 'review',
      header: t('adminModeration.appeals.columns.review'),
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.reviewId || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'listing',
      header: t('adminModeration.appeals.columns.listing'),
      hideBelowLarge: true,
      render: (item) => (
        <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
          {item.listingId || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('adminModeration.appeals.columns.status'),
      width: 'w-32',
      render: (item) => <ModerationAppealStatusBadge status={item.appealStatus} />,
    },
    {
      key: 'decision',
      header: t('adminModeration.appeals.columns.decision'),
      width: 'w-32',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.decision || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'submittedAt',
      header: t('adminModeration.appeals.columns.submittedAt'),
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
      header: t('adminModeration.appeals.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton onClick={() => onOpenAppeal(item.appealId)}>
          {t('adminModeration.appeals.detail')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <AdminDataTable
      caption={t('adminModeration.appeals.title')}
      columns={columns}
      dense
      emptyContent={
        <AdminStatePlaceholder inline kind="empty" description={t('adminModeration.appeals.empty')} />
      }
      loading={loading}
      loadingContent={<AdminStatePlaceholder inline kind="loading" />}
      rowKey={(item) => item.appealId}
      rows={items}
    />
  );
}
