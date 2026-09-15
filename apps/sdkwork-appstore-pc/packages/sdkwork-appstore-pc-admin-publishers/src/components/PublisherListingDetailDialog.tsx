import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_PUBLISHER_OPERATIONS,
  formatAdminPercent,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminDateRange,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminCommandError,
  AdminDetailList,
  AdminDialog,
  AdminStatePlaceholder,
} from '@sdkwork/appstore-pc-admin-shell';

import { formatPublisherCount, formatPublisherRating, formatPublisherRevenue } from '../format';
import { PublisherListingStatusBadge } from './PublisherListingStatusBadge';

export interface PublisherListingDetailDialogProps {
  open: boolean;
  listingId: string;
  /** Date window currently applied by the analytics page. */
  range: AppstoreAdminDateRange;
  onClose: () => void;
}

/**
 * Per-listing publisher analytics (`appstore.analytics.publisher.listings.retrieve`).
 *
 * The caller mounts this dialog only while a row is selected, so the read never
 * runs against an empty identifier and the operator sees the same date window
 * that produced the row.
 */
export function PublisherListingDetailDialog({
  listingId,
  onClose,
  open,
  range,
}: PublisherListingDetailDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_PUBLISHER_OPERATIONS.publisherListingDetail,
    () => services.publishers.getPublisherListingAnalytics(listingId, range),
    [services, listingId, range],
  );

  const detail = query.data;

  return (
    <AdminDialog
      description={t('adminPublishers.analytics.detailDescription')}
      onClose={onClose}
      open={open}
      title={t('adminPublishers.analytics.detailTitle')}
      footer={
        <AdminActionButton onClick={onClose}>{t('adminShell.common.close')}</AdminActionButton>
      }
    >
      {query.loading && !detail ? (
        <AdminStatePlaceholder inline kind="loading" />
      ) : query.error ? (
        <AdminCommandError error={query.error} />
      ) : !detail ? (
        <AdminStatePlaceholder
          inline
          kind="notFound"
          description={t('adminPublishers.analytics.detailNotFound')}
        />
      ) : (
        <AdminDetailList
          columns={2}
          entries={[
            {
              label: t('adminPublishers.analytics.detailFields.displayName'),
              value: detail.displayName,
            },
            {
              label: t('adminPublishers.analytics.detailFields.listingId'),
              value: detail.listingId,
              mono: true,
            },
            {
              label: t('adminPublishers.analytics.detailFields.status'),
              value: <PublisherListingStatusBadge status={detail.listingStatus} />,
            },
            {
              label: t('adminPublishers.analytics.detailFields.impressions'),
              value: formatPublisherCount(detail.impressions),
            },
            {
              label: t('adminPublishers.analytics.detailFields.pageViews'),
              value: formatPublisherCount(detail.pageViews),
            },
            {
              label: t('adminPublishers.analytics.detailFields.installs'),
              value: formatPublisherCount(detail.installs),
            },
            {
              label: t('adminPublishers.analytics.detailFields.uninstalls'),
              value: formatPublisherCount(detail.uninstalls),
            },
            {
              label: t('adminPublishers.analytics.detailFields.revenue'),
              value: formatPublisherRevenue(detail.revenueAmount, detail.revenueCurrency),
            },
            {
              label: t('adminPublishers.analytics.detailFields.averageRating'),
              value: formatPublisherRating(detail.averageRating),
            },
            {
              label: t('adminPublishers.analytics.detailFields.conversionRatio'),
              value: formatAdminPercent(detail.conversionRatio),
            },
          ]}
        />
      )}
    </AdminDialog>
  );
}
