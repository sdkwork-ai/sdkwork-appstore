import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_OPERATOR_DASHBOARD_OPERATION,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminFormField,
  AdminPageHeader,
  AdminStatePlaceholder,
  AdminToolbar,
  ADMIN_INPUT_CLASS,
} from '@sdkwork/appstore-pc-admin-shell';

import { DashboardKpiGrid } from '../components/DashboardKpiGrid';

/**
 * `dashboard-overview` — storefront KPI snapshot.
 *
 * This is `APPSTORE_ADMIN_DEFAULT_ROUTE_ID`, so it is the console landing page
 * and must stay renderable for any operator holding
 * `appstore.analytics.operator`.
 */
export function DashboardOverviewPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_OPERATOR_DASHBOARD_OPERATION,
    () =>
      services.dashboard.getSummary({
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }),
    [services, from, to],
  );

  const summary = query.data;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminDashboard.overview.description')}
        title={t('adminDashboard.overview.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="dashboard-overview-range-from"
          label={t('adminDashboard.range.from')}
          layout="inline"
        >
          <input
            id="dashboard-overview-range-from"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="dashboard-overview-range-to"
          label={t('adminDashboard.range.to')}
          layout="inline"
        >
          <input
            id="dashboard-overview-range-to"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </AdminFormField>
      </AdminToolbar>

      {query.loading && !summary ? (
        <AdminStatePlaceholder kind="loading" />
      ) : query.error && !summary ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : !summary ? (
        <AdminStatePlaceholder
          description={t('adminDashboard.overview.noSnapshot')}
          kind="empty"
        />
      ) : (
        <DashboardKpiGrid loading={query.loading} summary={summary} />
      )}
    </div>
  );
}
