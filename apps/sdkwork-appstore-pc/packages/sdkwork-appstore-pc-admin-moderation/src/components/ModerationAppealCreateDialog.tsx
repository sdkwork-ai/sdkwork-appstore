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

export interface ModerationAppealCreateDialogProps {
  open: boolean;
  /** Pre-filled decision id when opened from a review detail page. */
  defaultDecisionId?: string;
  onClose: () => void;
  onCompleted: () => void;
}

/** Opens an appeal against a recorded decision (`appstore.moderation.appeals.create`). */
export function ModerationAppealCreateDialog({
  defaultDecisionId = '',
  onClose,
  onCompleted,
  open,
}: ModerationAppealCreateDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [decisionId, setDecisionId] = useState(defaultDecisionId);
  const [appealReason, setAppealReason] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MODERATION_OPERATIONS.createAppeal);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setDecisionId(defaultDecisionId);
    setAppealReason('');
    resetCommand();
  }, [defaultDecisionId, open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() =>
      services.moderation.createAppeal({ decisionId: decisionId.trim(), appealReason: appealReason.trim() }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminModeration.appealCreate.description')}
      onClose={onClose}
      open={open}
      title={t('adminModeration.appealCreate.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            disabled={!decisionId.trim() || !appealReason.trim()}
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminModeration.appealCreate.submitting')
              : t('adminModeration.appealCreate.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="moderation-appeal-decision-id"
          label={t('adminModeration.appealCreate.decisionId')}
          required
        >
          <input
            id="moderation-appeal-decision-id"
            className={ADMIN_INPUT_CLASS}
            placeholder={t('adminModeration.appealCreate.decisionIdPlaceholder')}
            value={decisionId}
            onChange={(event) => setDecisionId(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="moderation-appeal-reason"
          label={t('adminModeration.appealCreate.appealReason')}
          required
        >
          <textarea
            id="moderation-appeal-reason"
            className={`${ADMIN_INPUT_CLASS} min-h-[5rem]`}
            rows={3}
            value={appealReason}
            onChange={(event) => setAppealReason(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
