import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_MODERATION_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminModerationDecision,
} from '@sdkwork/appstore-pc-admin-core';
import {
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  ADMIN_INPUT_CLASS,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

const DECISION_KEYS: Record<AppstoreAdminModerationDecision, string> = {
  APPROVE: 'adminModeration.decision.decisionTypeApprove',
  REJECT: 'adminModeration.decision.decisionTypeReject',
  REQUEST_CHANGES: 'adminModeration.decision.decisionTypeRequestChanges',
};

const DECISION_OPTIONS: readonly AppstoreAdminModerationDecision[] = [
  'APPROVE',
  'REJECT',
  'REQUEST_CHANGES',
];

export interface ModerationDecisionDialogProps {
  open: boolean;
  reviewId: string;
  onClose: () => void;
  /** Invoked after a decision is recorded, so the caller can refresh. */
  onCompleted: () => void;
}

/**
 * Records a moderation decision (`appstore.moderation.decisions.create`).
 *
 * The mutation carries a fresh `Idempotency-Key` inside the service port, so
 * retrying after a transport failure cannot double-write the decision.
 */
export function ModerationDecisionDialog({
  onClose,
  onCompleted,
  open,
  reviewId,
}: ModerationDecisionDialogProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [decisionType, setDecisionType] = useState<AppstoreAdminModerationDecision>('APPROVE');
  const [reasonCode, setReasonCode] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [policyReference, setPolicyReference] = useState('');
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_MODERATION_OPERATIONS.createDecision);
  const { reset: resetCommand } = command;

  useEffect(() => {
    if (!open) {
      return;
    }
    setDecisionType('APPROVE');
    setReasonCode('');
    setReasonDetail('');
    setPolicyReference('');
    setValidationError('');
    resetCommand();
  }, [open, resetCommand]);

  const handleSubmit = async () => {
    if (decisionType !== 'APPROVE' && !reasonDetail.trim() && !reasonCode.trim()) {
      setValidationError(t('adminModeration.decision.validationReasonRequired'));
      return;
    }
    setValidationError('');
    const succeeded = await command.run(() =>
      services.moderation.decideReview(reviewId, {
        decisionType,
        ...(reasonCode.trim() ? { reasonCode: reasonCode.trim() } : {}),
        ...(reasonDetail.trim() ? { reasonDetail: reasonDetail.trim() } : {}),
        ...(policyReference.trim() ? { policyReference: policyReference.trim() } : {}),
      }),
    );
    if (succeeded) {
      onCompleted();
      onClose();
    }
  };

  return (
    <AdminDialog
      description={t('adminModeration.decision.description')}
      onClose={onClose}
      open={open}
      size="lg"
      title={t('adminModeration.decision.title')}
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
              ? t('adminModeration.decision.submitting')
              : t('adminModeration.decision.submit')}
          </AdminActionButton>
        </>
      }
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        <AdminFormField htmlFor="moderation-decision-type" label={t('adminModeration.decision.decisionType')} required>
          <select
            id="moderation-decision-type"
            className={ADMIN_INPUT_CLASS}
            value={decisionType}
            onChange={(event) =>
              setDecisionType(event.target.value as AppstoreAdminModerationDecision)
            }
          >
            {DECISION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(DECISION_KEYS[option])}
              </option>
            ))}
          </select>
        </AdminFormField>
        <AdminFormField
          htmlFor="moderation-decision-reason-code"
          hint={t('adminModeration.decision.reasonCodeHint')}
          label={t('adminModeration.decision.reasonCode')}
        >
          <input
            id="moderation-decision-reason-code"
            className={ADMIN_INPUT_CLASS}
            value={reasonCode}
            onChange={(event) => setReasonCode(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          error={validationError || undefined}
          htmlFor="moderation-decision-reason-detail"
          hint={t('adminModeration.decision.reasonDetailHint')}
          label={t('adminModeration.decision.reasonDetail')}
        >
          <textarea
            id="moderation-decision-reason-detail"
            className={`${ADMIN_INPUT_CLASS} min-h-[6rem]`}
            rows={4}
            value={reasonDetail}
            onChange={(event) => setReasonDetail(event.target.value)}
          />
        </AdminFormField>
        <AdminFormField
          htmlFor="moderation-decision-policy"
          label={t('adminModeration.decision.policyReference')}
        >
          <input
            id="moderation-decision-policy"
            className={ADMIN_INPUT_CLASS}
            value={policyReference}
            onChange={(event) => setPolicyReference(event.target.value)}
          />
        </AdminFormField>
      </div>
    </AdminDialog>
  );
}
