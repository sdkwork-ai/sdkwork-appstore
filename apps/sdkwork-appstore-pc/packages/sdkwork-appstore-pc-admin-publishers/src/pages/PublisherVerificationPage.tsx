import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import {
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_PUBLISHER_OPERATIONS,
  APPSTORE_ADMIN_VERIFICATION_DECISIONS,
  APPSTORE_ADMIN_VERIFICATION_TYPES,
  useAppstoreAdminQuery,
  useAppstoreAdminServices,
  type AppstoreAdminPublisherRow,
  type AppstoreAdminVerificationOutcome,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDataTable,
  AdminDetailList,
  AdminFormField,
  AdminPageHeader,
  AdminPaginationBar,
  AdminSection,
  AdminStatePlaceholder,
  useAdminCommand,
  useAppstoreAdminPermission,
  type AdminTableColumn,
} from '@sdkwork/appstore-pc-admin-shell';

const PUBLISHERS_PAGE_SIZE = 50;

/**
 * `appstore.publishers.admin.list` + `appstore.publishers.admin.verify` —
 * publisher verification decisions.
 *
 * The listing read feeds the decision form: the operator picks a publisher
 * row (or types an id) and records a verification decision that is written
 * back to the publisher profile and shown verbatim.
 */
export function PublisherVerificationPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const canVerify = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.publishersManage);

  const [publisherId, setPublisherId] = useState('');
  const [cursor, setCursor] = useState('');
  const [verificationType, setVerificationType] = useState<string>(
    APPSTORE_ADMIN_VERIFICATION_TYPES[0],
  );
  const [decision, setDecision] = useState<string>(APPSTORE_ADMIN_VERIFICATION_DECISIONS[0]);
  const [validationError, setValidationError] = useState('');
  const [outcome, setOutcome] = useState<AppstoreAdminVerificationOutcome | undefined>(undefined);
  const command = useAdminCommand(APPSTORE_ADMIN_PUBLISHER_OPERATIONS.verifyPublisher);

  const publishersQuery = useAppstoreAdminQuery(
    APPSTORE_ADMIN_PUBLISHER_OPERATIONS.listPublishers,
    () =>
      services.publishers.listPublishers({
        ...(cursor ? { cursor } : {}),
        pageSize: PUBLISHERS_PAGE_SIZE,
      }),
    [services, cursor],
  );

  const publisherRows = publishersQuery.data?.items ?? [];
  const pageInfo = publishersQuery.data?.pageInfo ?? { mode: 'cursor' as const };

  const publisherColumns: AdminTableColumn<AppstoreAdminPublisherRow>[] = [
    {
      key: 'publisher',
      header: t('adminPublishers.verification.browse.columns.publisher'),
      render: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-store-ink ">{item.displayName}</p>
          <p className="truncate font-mono text-[11px] text-store-ink-faint ">
            {item.publisherId}
          </p>
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      header: t('adminPublishers.verification.browse.columns.verificationStatus'),
      width: 'w-32',
      render: (item) => (
        <span className="text-xs text-store-ink-soft">
          {item.verificationStatus || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('adminPublishers.verification.browse.columns.status'),
      width: 'w-28',
      hideBelowLarge: true,
      render: (item) => (
        <span className="text-xs text-store-ink-soft">
          {item.status || t('adminShell.common.notAvailable')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('adminPublishers.verification.browse.columns.actions'),
      width: 'w-24',
      align: 'right',
      render: (item) => (
        <AdminActionButton
          onClick={() => setPublisherId(item.publisherId)}
        >
          {t('adminPublishers.verification.browse.pick')}
        </AdminActionButton>
      ),
    },
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!publisherId.trim()) {
      setValidationError(t('adminPublishers.verification.validationPublisherRequired'));
      return;
    }
    setValidationError('');
    setOutcome(undefined);
    let recorded: AppstoreAdminVerificationOutcome | undefined;
    const succeeded = await command.run(async () => {
      recorded = await services.publishers.verifyPublisher(publisherId.trim(), {
        verificationType,
        decision,
      });
    });
    if (succeeded && recorded) {
      setOutcome(recorded);
    }
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminPublishers.verification.description')}
        title={t('adminPublishers.verification.title')}
      />

      <AdminSection title={t('adminPublishers.verification.title')}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <AdminCommandError error={command.error} />

          <div className="grid gap-4 sm:grid-cols-3">
            <AdminFormField
              error={validationError || undefined}
              hint={t('adminPublishers.verification.publisherIdHint')}
              htmlFor="publishers-verification-publisher-id"
              label={t('adminPublishers.verification.publisherId')}
              required
            >
              <input
                id="publishers-verification-publisher-id"
                className={ADMIN_INPUT_CLASS}
                placeholder={t('adminPublishers.verification.publisherIdPlaceholder')}
                value={publisherId}
                onChange={(event) => setPublisherId(event.target.value)}
              />
            </AdminFormField>

            <AdminFormField
              htmlFor="publishers-verification-type"
              label={t('adminPublishers.verification.verificationType')}
            >
              <select
                id="publishers-verification-type"
                className={ADMIN_INPUT_CLASS}
                value={verificationType}
                onChange={(event) => setVerificationType(event.target.value)}
              >
                {APPSTORE_ADMIN_VERIFICATION_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {t(`adminPublishers.verificationType.${option}`)}
                  </option>
                ))}
              </select>
            </AdminFormField>

            <AdminFormField
              htmlFor="publishers-verification-decision"
              label={t('adminPublishers.verification.decision')}
            >
              <select
                id="publishers-verification-decision"
                className={ADMIN_INPUT_CLASS}
                value={decision}
                onChange={(event) => setDecision(event.target.value)}
              >
                {APPSTORE_ADMIN_VERIFICATION_DECISIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`adminPublishers.verificationDecision.${option}`)}
                  </option>
                ))}
              </select>
            </AdminFormField>
          </div>

          <p className="text-xs leading-5 text-store-ink-faint ">
            {t('adminPublishers.verification.auditable')}
          </p>

          <div className="flex items-center justify-end gap-2">
            <AdminActionButton
              disabled={!canVerify || !publisherId.trim()}
              loading={command.submitting}
              type="submit"
              variant="primary"
            >
              {command.submitting
                ? t('adminPublishers.verification.submitting')
                : t('adminPublishers.verification.submit')}
            </AdminActionButton>
          </div>
        </form>

        {outcome ? (
          <div className="mt-4 space-y-3">
            <div
              role="status"
              className="flex items-start gap-2 rounded-store-control border border-store-success-soft bg-store-success-soft px-3 py-2 text-xs "
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-store-success" />
              <p className="font-medium text-store-success ">
                {t('adminPublishers.verification.success')}
              </p>
            </div>
            <AdminDetailList
              columns={3}
              entries={[
                {
                  label: t('adminPublishers.verification.fields.accepted'),
                  value: outcome.accepted
                    ? t('adminPublishers.verification.accepted')
                    : t('adminPublishers.verification.rejected'),
                },
                {
                  label: t('adminPublishers.verification.fields.resourceId'),
                  value: outcome.resourceId || t('adminShell.common.notAvailable'),
                  mono: true,
                },
                {
                  label: t('adminPublishers.verification.fields.status'),
                  value: outcome.status || t('adminShell.common.notAvailable'),
                  mono: true,
                },
              ]}
            />
          </div>
        ) : null}
      </AdminSection>

      <AdminSection
        actions={
          <AdminActionButton
            disabled={publishersQuery.loading}
            onClick={publishersQuery.reload}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${publishersQuery.loading ? 'animate-spin' : ''}`}
            />
            {t('adminShell.common.refresh')}
          </AdminActionButton>
        }
        title={t('adminPublishers.verification.browse.title')}
      >
        {publishersQuery.error && publisherRows.length === 0 ? (
          <AdminStatePlaceholder
            error={publishersQuery.error}
            kind="error"
            onRetry={publishersQuery.reload}
          />
        ) : (
          <>
            <AdminDataTable
              caption={t('adminPublishers.verification.browse.title')}
              columns={publisherColumns}
              dense
              emptyContent={
                <AdminStatePlaceholder
                  inline
                  kind="empty"
                  description={t('adminPublishers.verification.browse.empty')}
                />
              }
              loading={publishersQuery.loading && publisherRows.length === 0}
              loadingContent={<AdminStatePlaceholder inline kind="loading" />}
              rowKey={(item) => item.publisherId}
              rows={publisherRows}
            />
            <AdminPaginationBar
              cursorApplied={Boolean(cursor)}
              loadedCount={publisherRows.length}
              loading={publishersQuery.loading}
              onNext={setCursor}
              onReset={() => setCursor('')}
              pageInfo={pageInfo}
            />
          </>
        )}
      </AdminSection>
    </div>
  );
}
