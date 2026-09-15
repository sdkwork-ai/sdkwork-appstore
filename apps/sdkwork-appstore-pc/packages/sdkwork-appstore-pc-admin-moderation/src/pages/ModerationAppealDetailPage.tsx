import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Gavel, RefreshCw } from 'lucide-react';
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

import { ModerationAppealDecisionDialog } from '../components/ModerationAppealDecisionDialog';
import { ModerationAppealStatusBadge } from '../components/ModerationStatusBadge';

/** `moderation.appeals.retrieve` — appeal inspector and adjudication surface. */
export function ModerationAppealDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();
  const params = useParams();
  const appealId = params.appealId ?? '';
  const canDecide = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.moderationDecide);
  const [deciding, setDeciding] = useState(false);

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MODERATION_OPERATIONS.retrieveAppeal,
    () => services.moderation.getAppeal(appealId),
    [services, appealId],
  );

  const appeal = query.data;
  const notAvailable = t('adminShell.common.notAvailable');

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminModeration.appealDetail.description')}
        meta={appeal ? <ModerationAppealStatusBadge status={appeal.appealStatus} /> : undefined}
        title={t('adminModeration.appealDetail.title')}
        actions={
          <>
            <AdminActionButton
              onClick={() => navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/moderation/appeals`)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('adminModeration.appealDetail.back')}
            </AdminActionButton>
            <AdminActionButton onClick={query.reload} disabled={query.loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
              {t('adminShell.common.refresh')}
            </AdminActionButton>
            {canDecide && appeal ? (
              <AdminActionButton onClick={() => setDeciding(true)} variant="primary">
                <Gavel className="h-3.5 w-3.5" />
                {t('adminModeration.appealDetail.actions.decide')}
              </AdminActionButton>
            ) : null}
          </>
        }
      />

      {query.loading && !appeal ? (
        <AdminStatePlaceholder kind="loading" />
      ) : query.error ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : !appeal ? (
        <AdminStatePlaceholder
          description={t('adminModeration.appealDetail.notFound')}
          kind="notFound"
        />
      ) : (
        <AdminSection title={t('adminModeration.appealDetail.title')}>
          <AdminDetailList
            columns={3}
            entries={[
              { label: t('adminModeration.appealDetail.fields.appealId'), value: appeal.appealId, mono: true },
              { label: t('adminModeration.appealDetail.fields.reviewId'), value: appeal.reviewId || notAvailable, mono: true },
              { label: t('adminModeration.appealDetail.fields.listingId'), value: appeal.listingId || notAvailable, mono: true },
              { label: t('adminModeration.appealDetail.fields.submittedAt'), value: appeal.submittedAt || notAvailable, mono: true },
              { label: t('adminModeration.appealDetail.fields.decidedAt'), value: appeal.decidedAt || notAvailable, mono: true },
              { label: t('adminModeration.appealDetail.fields.decision'), value: appeal.decision || notAvailable, mono: true },
              { label: t('adminModeration.appealDetail.fields.reason'), value: appeal.appealReason || notAvailable, wide: true },
              { label: t('adminModeration.appealDetail.fields.note'), value: appeal.note || notAvailable, wide: true },
            ]}
          />
        </AdminSection>
      )}

      <ModerationAppealDecisionDialog
        appealId={appealId}
        onClose={() => setDeciding(false)}
        onCompleted={query.reload}
        open={deciding}
      />
    </div>
  );
}
