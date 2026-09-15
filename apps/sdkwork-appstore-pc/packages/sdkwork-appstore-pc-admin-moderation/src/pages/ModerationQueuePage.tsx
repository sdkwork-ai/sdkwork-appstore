import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_MODERATION_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminReviewStatus,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
  useAppstoreAdminPermission,
} from '@sdkwork/appstore-pc-admin-shell';

import { ModerationDecisionDialog } from '../components/ModerationDecisionDialog';
import { ModerationQueueTable } from '../components/ModerationQueueTable';

/** Review statuses offered by the queue filter; the backend owns the enum. */
const REVIEW_STATUS_FILTERS: readonly AppstoreAdminReviewStatus[] = [
  'PENDING',
  'IN_REVIEW',
  'CHANGES_REQUESTED',
  'APPROVED',
  'REJECTED',
];

const QUEUE_PAGE_SIZE = 50;

/** `moderation.queue` — pending moderation submissions with quick decisions. */
export function ModerationQueuePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();
  const canDecide = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.moderationDecide);

  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [decisionReviewId, setDecisionReviewId] = useState<string | undefined>(undefined);

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MODERATION_OPERATIONS.listQueue,
    () =>
      services.moderation.listQueue({
        ...(status ? { reviewStatus: status } : {}),
        ...(cursor ? { cursor } : {}),
        pageSize: QUEUE_PAGE_SIZE,
      }),
    [services, status, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminModeration.queue.description')}
        title={t('adminModeration.queue.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="moderation-queue-status"
          label={t('adminModeration.queue.filterStatus')}
          layout="inline"
        >
          <select
            id="moderation-queue-status"
            className={ADMIN_INPUT_CLASS}
            value={status}
            onChange={(event) => {
              setCursor('');
              setStatus(event.target.value);
            }}
          >
            <option value="">{t('adminModeration.queue.filterStatusAll')}</option>
            {REVIEW_STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {t(`adminModeration.status.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <ModerationQueueTable
            canDecide={canDecide}
            items={items}
            loading={query.loading && items.length === 0}
            onDecide={canDecide ? setDecisionReviewId : undefined}
            onOpenReview={(reviewId) =>
              navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/moderation/reviews/${reviewId}`)
            }
          />
          <AdminPaginationBar
            cursorApplied={Boolean(cursor)}
            loadedCount={items.length}
            loading={query.loading}
            onNext={setCursor}
            onReset={() => setCursor('')}
            pageInfo={pageInfo}
          />
        </>
      )}

      {decisionReviewId ? (
        <ModerationDecisionDialog
          onClose={() => setDecisionReviewId(undefined)}
          onCompleted={query.reload}
          open
          reviewId={decisionReviewId}
        />
      ) : null}
    </div>
  );
}
