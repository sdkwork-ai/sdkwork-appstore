import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_OPERATOR_SEARCH_OPERATION,
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

import { DashboardSearchTermTable } from '../components/DashboardSearchTermTable';

const SEARCH_PAGE_SIZE = 50;

/**
 * `dashboard-search` — aggregated storefront search analytics.
 *
 * Paging mirrors the moderation queue: the applied cursor is tracked so the bar
 * can return to the first page, and `pageInfo` carries the cursor the backend
 * returned for the next page.
 */
export function DashboardSearchPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();

  const [filterText, setFilterText] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [cursor, setCursor] = useState('');

  const query = useAppstoreAdminQuery(
    APPSTORE_ADMIN_OPERATOR_SEARCH_OPERATION,
    () =>
      services.dashboard.listSearchTerms({
        range: {
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
        },
        ...(filterText.trim() ? { query: filterText.trim() } : {}),
        pageSize: SEARCH_PAGE_SIZE,
      }),
    [services, filterText, from, to, cursor],
  );

  const items = query.data?.items ?? [];
  const pageInfo = query.data?.pageInfo ?? { mode: 'cursor' as const };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminDashboard.search.description')}
        title={t('adminDashboard.search.title')}
        actions={
          <AdminActionButton onClick={query.reload} disabled={query.loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${query.loading ? 'animate-spin' : ''}`} />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
      />

      <AdminToolbar>
        <AdminFormField
          htmlFor="dashboard-search-term"
          label={t('adminDashboard.search.filterQuery')}
          layout="inline"
        >
          <input
            id="dashboard-search-term"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminDashboard.search.filterQueryPlaceholder')}
            type="text"
            value={filterText}
            onChange={(event) => {
              setCursor('');
              setFilterText(event.target.value);
            }}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="dashboard-search-range-from"
          label={t('adminDashboard.range.from')}
          layout="inline"
        >
          <input
            id="dashboard-search-range-from"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={from}
            onChange={(event) => {
              setCursor('');
              setFrom(event.target.value);
            }}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="dashboard-search-range-to"
          label={t('adminDashboard.range.to')}
          layout="inline"
        >
          <input
            id="dashboard-search-range-to"
            className={ADMIN_INPUT_CLASS}
            type="date"
            value={to}
            onChange={(event) => {
              setCursor('');
              setTo(event.target.value);
            }}
          />
        </AdminFormField>
      </AdminToolbar>

      {query.error && items.length === 0 ? (
        <AdminStatePlaceholder error={query.error} kind="error" onRetry={query.reload} />
      ) : (
        <>
          <DashboardSearchTermTable items={items} loading={query.loading && items.length === 0} />
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
