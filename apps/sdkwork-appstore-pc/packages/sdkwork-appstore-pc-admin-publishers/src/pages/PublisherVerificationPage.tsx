import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import {
  APPSTORE_ADMIN_PERMISSIONS,
  APPSTORE_ADMIN_PUBLISHER_OPERATIONS,
  APPSTORE_ADMIN_VERIFICATION_DECISIONS,
  APPSTORE_ADMIN_VERIFICATION_TYPES,
  useAppstoreAdminServices,
  type AppstoreAdminVerificationOutcome,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDetailList,
  AdminFormField,
  AdminPageHeader,
  AdminSection,
  useAdminCommand,
  useAppstoreAdminPermission,
} from '@sdkwork/appstore-pc-admin-shell';

/**
 * `appstore.publishers.admin.verify` — publisher verification decisions.
 *
 * The command is gated by `appstore.publishers.admin`; every recorded decision
 * is written back to the publisher profile and stays auditable, so the outcome
 * returned by the operation is shown verbatim instead of being summarized into
 * a generic success toast.
 */
export function PublisherVerificationPage() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const canVerify = useAppstoreAdminPermission(APPSTORE_ADMIN_PERMISSIONS.publishersManage);

  const [publisherId, setPublisherId] = useState('');
  const [verificationType, setVerificationType] = useState<string>(
    APPSTORE_ADMIN_VERIFICATION_TYPES[0],
  );
  const [decision, setDecision] = useState<string>(APPSTORE_ADMIN_VERIFICATION_DECISIONS[0]);
  const [validationError, setValidationError] = useState('');
  const [outcome, setOutcome] = useState<AppstoreAdminVerificationOutcome | undefined>(undefined);
  const command = useAdminCommand(APPSTORE_ADMIN_PUBLISHER_OPERATIONS.verifyPublisher);

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

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
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
              className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
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
    </div>
  );
}
