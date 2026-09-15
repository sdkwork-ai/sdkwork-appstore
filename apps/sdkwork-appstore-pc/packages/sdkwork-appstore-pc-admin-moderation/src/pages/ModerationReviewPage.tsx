import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, UserPlus, Gavel, FileWarning } from 'lucide-react';
import {
  APPSTORE_ADMIN_MODERATION_OPERATIONS,
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminDetailList,
  AdminPageHeader,
  AdminSection,
  AdminStatePlaceholder,
  useAppstoreAdminPermission,
} from '@sdkwork/appstore-pc-admin-shell';

import { ModerationAppealCreateDialog } from '../components/ModerationAppealCreateDialog';
import { ModerationAssignDialog } from '../components/ModerationAssignDialog';
import { ModerationDecisionDialog } from '../components/ModerationDecisionDialog';
import { ModerationReviewStatusBadge } from '../components/ModerationStatusBadge';

/** `moderation.reviews.retrieve` — full review inspector with operator commands. */
export function ModerationReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();
  const params = useParams();
  const reviewId = params.reviewId ?? '';
  const canDecide = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.moderationDecide);
  const canAssign = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.moderationAssign);
  const canAppeal = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.moderationAppeal);

  const [dialog, setDialog] = useState<'decision' | 'assign' | 'appeal' | undefined>(undefined);

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MODERATION_OPERATIONS.retrieveReview,
    () => services.moderation.getReview(reviewId),
    [services, reviewId],
  );

  const review = query.data;
  const notAvailable = t('adminShell.common.notAvailable');

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminModeration.review.description')}
        meta={review ? <ModerationReviewStatusBadge status={review.reviewStatus} /> : undefined}
        title={review?.listingName || t('adminModeration.review.title')}
        actions={
          <>
            <AdminActionButton
              onClick={() => navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/moderation/queue`)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('adminModeration.review.back')}
            </AdminActionButton>
            <AdminActionButton onClick={query.reload} disabled={query.loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
              {t('adminShell.common.refresh')}
            </AdminActionButton>
            {canAssign ? (
              <AdminActionButton onClick={() => setDialog('assign')}>
                <UserPlus className="h-3.5 w-3.5" />
                {t('adminModeration.review.actions.assign')}
              </AdminActionButton>
            ) : null}
            {canAppeal ? (
              <AdminActionButton onClick={() => setDialog('appeal')}>
                <FileWarning className="h-3.5 w-3.5" />
                {t('adminModeration.review.actions.createAppeal')}
              </AdminActionButton>
            ) : null}
            {canDecide ? (
              <AdminActionButton onClick={() => setDialog('decision')} variant="primary">
                <Gavel className="h-3.5 w-3.5" />
                {t('adminModeration.review.actions.decide')}
              </AdminActionButton>
            ) : null}
          </>
        }
      />

      {query.loading && !review ? (
        <AdminStatePlaceholder kind="loading" />
      ) : query.error ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : !review ? (
        <AdminStatePlaceholder
          description={t('adminModeration.review.notFound')}
          kind="notFound"
        />
      ) : (
        <>
          <AdminSection title={t('adminModeration.review.title')}>
            <AdminDetailList
              columns={3}
              entries={[
                { label: t('adminModeration.review.fields.reviewId'), value: review.reviewId, mono: true },
                { label: t('adminModeration.review.fields.listingId'), value: review.listingId || notAvailable, mono: true },
                { label: t('adminModeration.review.fields.listing'), value: review.listingName || notAvailable },
                { label: t('adminModeration.review.fields.submissionType'), value: review.submissionType, mono: true },
                { label: t('adminModeration.review.fields.assignee'), value: review.assignedTo || t('adminModeration.queue.assignedUnassigned'), mono: true },
                { label: t('adminModeration.review.fields.priority'), value: review.priority ?? notAvailable },
                { label: t('adminModeration.review.fields.submittedAt'), value: review.submittedAt || notAvailable, mono: true },
                { label: t('adminModeration.review.fields.updatedAt'), value: review.updatedAt || notAvailable, mono: true },
                { label: t('adminModeration.review.fields.latestDecision'), value: review.latestDecision || notAvailable, mono: true },
                { label: t('adminModeration.review.fields.reasonCode'), value: review.latestDecisionReasonCode || notAvailable, mono: true },
                {
                  label: t('adminModeration.review.fields.reasonDetail'),
                  value: review.latestDecisionReasonDetail || notAvailable,
                  wide: true,
                },
              ]}
            />
          </AdminSection>

          <AdminSection title={t('adminModeration.review.attributes')}>
            {Object.keys(review.attributes).length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('adminModeration.review.attributesEmpty')}
              </p>
            ) : (
              <pre className="max-h-96 overflow-auto rounded-xl bg-gray-50 p-3 font-mono text-[11px] leading-5 text-gray-700 dark:bg-[#181a20] dark:text-gray-300">
                {JSON.stringify(review.attributes, null, 2)}
              </pre>
            )}
          </AdminSection>
        </>
      )}

      <ModerationDecisionDialog
        onClose={() => setDialog(undefined)}
        onCompleted={query.reload}
        open={dialog === 'decision'}
        reviewId={reviewId}
      />
      <ModerationAssignDialog
        onClose={() => setDialog(undefined)}
        onCompleted={query.reload}
        open={dialog === 'assign'}
        reviewId={reviewId}
      />
      <ModerationAppealCreateDialog
        onClose={() => setDialog(undefined)}
        onCompleted={query.reload}
        open={dialog === 'appeal'}
      />
    </div>
  );
}
