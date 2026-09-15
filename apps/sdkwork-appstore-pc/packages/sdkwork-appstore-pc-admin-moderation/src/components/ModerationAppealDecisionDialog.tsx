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

/** Adjudication outcomes offered by the console. */
const APPEAL_DECISIONS = ['ACCEPTED', 'REJECTED'] as const;

export interface ModerationAppealDecisionDialogProps {
  open: boolean;
  appealId: string;
  onClose: () => void;
  onCompleted: () => void;
}

/** Adjudicates an appeal (`appstore.moderation.appeals.decide`). */
export function ModerationAppealDecisionDialog({
  appealId,
  onClose,
  onCompleted,
  open,
}: ModerationAppealDecisionDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [decision, setDecision] = useState<string>(APPEAL_DECISIONS[0]);
  const [note, setNote] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MODERATION_OPERATIONS.decideAppeal);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setDecision(APPEAL_DECISIONS[0]);
    setNote('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    const succeeded = await command.run(() =>
      services.moderation.decideAppeal(appealId, { decision, note: note.trim() }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminModeration.appealDecision.description')}
      onClose={onClose}
      open={open}
      title={t('adminModeration.appealDecision.title')}
      footer={
        <>
          <AdminActionButton onClick={onClose} disabled={command.submitting}>
            {t('adminShell.common.cancel')}
          </AdminActionButton>
          <AdminActionButton
            disabled={!note.trim()}
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminModeration.appealDecision.submitting')
              : t('adminModeration.appealDecision.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField
          htmlFor="moderation-appeal-decision"
          label={t('adminModeration.appealDecision.decision')}
          required
        >
          <select
            id="moderation-appeal-decision"
            className={ADMIN_INPUT_CLASS}
            value={decision}
            onChange={(event) => setDecision(event.target.value)}
          >
            {APPEAL_DECISIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'ACCEPTED'
                  ? t('adminModeration.appealDecision.decisionAccept')
                  : t('adminModeration.appealDecision.decisionReject')}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="moderation-appeal-note"
          hint={t('adminModeration.appealDecision.noteHint')}
          label={t('adminModeration.appealDecision.note')}
          required
        >
          <textarea
            id="moderation-appeal-note"
            className={`${ADMIN_INPUT_CLASS} min-h-[5rem]`}
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
