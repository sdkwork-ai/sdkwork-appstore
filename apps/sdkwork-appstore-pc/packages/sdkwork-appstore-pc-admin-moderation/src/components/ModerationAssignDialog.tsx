import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_MODERATION_OPERATIONS,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  ADMIN_INPUT_CLASS,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

export interface ModerationAssignDialogProps {
  open: boolean;
  reviewId: string;
  onClose: () => void;
  onCompleted: () => void;
}

/** Assigns a review to an operator account (`appstore.moderation.reviews.assign`). */
export function ModerationAssignDialog({
  onClose,
  onCompleted,
  open,
  reviewId,
}: ModerationAssignDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [assignee, setAssignee] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MODERATION_OPERATIONS.assignReview);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setAssignee('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() => services.moderation.assignReview(reviewId, assignee));
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminModeration.assign.description')}
      onClose={onClose}
      open={open}
      title={t('adminModeration.assign.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            disabled={!assignee.trim()}
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminModeration.assign.submitting')
              : t('adminModeration.assign.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="moderation-assignee"
          label={t('adminModeration.assign.assignee')}
          required
        >
          <input
            id="moderation-assignee"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminModeration.assign.assigneePlaceholder')}
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
