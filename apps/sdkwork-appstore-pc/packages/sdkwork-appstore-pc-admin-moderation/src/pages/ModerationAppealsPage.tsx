import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_MODERATION_OPERATIONS,
  APPSTORE_ADMIN_ROUTE_PREFIX,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
} from '@sdkwork/appstore-pc-admin-shell';

import { ModerationAppealTable } from '../components/ModerationAppealTable';

/** Appeal statuses offered by the filter; the backend owns the enum. */
const APPEAL_STATUS_FILTERS = ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const;

const APPEALS_PAGE_SIZE = 50;

/**
 * `moderation.appeals.list` — developer appeals.
 *
 * Adjudication happens on the appeal detail page so a decision is always made
 * with the full appeal reason in view.
 */
export function ModerationAppealsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const services = useAppstoreAdminServices();

  const [status, setStatus] = useState('');
  const [cursor, setCursor] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_MODERATION_OPERATIONS.listAppeals,
    () =>
      services.moderation.listAppeals({
        ...(status ? { status } : {}),
        ...(cursor ? { cursor } : {}),
        pageSize: APPEALS_PAGE_SIZE,
      }),
    [services, status, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminModeration.appeals.description')}
        title={t('adminModeration.appeals.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="moderation-appeals-status"
          label={t('adminModeration.appeals.filterStatus')}
          layout="inline"
        >
          <select
            id="moderation-appeals-status"
            className={ADMIN_INPUT_CLASS}
            value={status}
            onChange={(event) => {
              setCursor('');
              setStatus(event.target.value);
            }}
          >
            <option value="">{t('adminModeration.appeals.filterStatusAll')}</option>
            {APPEAL_STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {t(`adminModeration.appealStatus.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <ModerationAppealTable
            items={items}
            loading={query.loading && items.length === 0}
            onOpenAppeal={(appealId) =>
              navigate(`${APPSTORE_ADMIN_ROUTE_PREFIX}/moderation/appeals/${appealId}`)
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
    </div>
  );
}
