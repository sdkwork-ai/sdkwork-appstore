import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_LISTING_OPERATIONS,
  APPSTORE_ADMIN_VISIBILITY_STATES,
  useAppstoreAdminServices,
  type AppstoreAdminVisibilityState,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

export interface VisibilityChangeDialogProps {
  open: boolean;
  listingId: string;
  onClose: () => void;
  /** Invoked after the visibility change is accepted, so the caller can refresh. */
  onCompleted: () => void;
}

/**
 * Changes a listing's storefront visibility
 * (`appstore.listings.admin.visibility.update`).
 *
 * The visibility option list is derived from `APPSTORE_ADMIN_VISIBILITY_STATES`
 * so the console can never offer a state the service port rejects, and the
 * operator records the reason alongside the transition for audit purposes.
 */
export function VisibilityChangeDialog({
  listingId,
  onClose,
  onCompleted,
  open,
}: VisibilityChangeDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [storefrontVisibility, setStorefrontVisibility] = useState<AppstoreAdminVisibilityState>(
    APPSTORE_ADMIN_VISIBILITY_STATES[0],
  );
  const [reason, setReason] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_LISTING_OPERATIONS.updateVisibility);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setStorefrontVisibility(APPSTORE_ADMIN_VISIBILITY_STATES[0]);
    setReason('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() =>
      services.listings.updateVisibility(listingId, {
        storefrontVisibility,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminListings.visibilityChange.description')}
      onClose={onClose}
      open={open}
      title={t('adminListings.visibilityChange.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminListings.visibilityChange.submitting')
              : t('adminListings.visibilityChange.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="listing-visibility-state"
          label={t('adminListings.visibilityChange.storefrontVisibility')}
          required
        >
          <select
            id="listing-visibility-state"
            className={ADMIN_INPUT_CLASS}
            value={storefrontVisibility}
            onChange={(event) => setStorefrontVisibility(event.target.value)}
          >
            {APPSTORE_ADMIN_VISIBILITY_STATES.map((option) => (
              <option key={option} value={option}>
                {t(`adminListings.visibilityStatus.${option}`)}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="listing-visibility-reason"
          hint={t('adminListings.visibilityChange.reasonHint')}
          label={t('adminListings.visibilityChange.reason')}
        >
          <textarea
            id="listing-visibility-reason"
            className={`${ADMIN_INPUT_CLASS} min-h-[6rem]`}
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
