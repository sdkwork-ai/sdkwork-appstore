import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstallModalConfirmActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const InstallModalConfirmActions: React.FC<InstallModalConfirmActionsProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex gap-3">
      <button
        onClick={onCancel}
        className="flex-1 py-3 bg-store-raised hover:bg-store-raised text-store-ink font-medium rounded-store-control transition-colors cursor-pointer text-sm"
      >
        {t('common.actions.cancel')}
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-3 bg-store-brand hover:bg-store-brand text-white font-medium rounded-store-control transition-colors shadow-md shadow-blue-200 dark:shadow-none cursor-pointer text-sm"
      >
        {t('common.actions.install')}
      </button>
    </div>
  );
};
